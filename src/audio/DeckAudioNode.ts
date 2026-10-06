/**
 * Wub Works - Per-Deck Audio Node & Playback Graph
 * Handles low-latency sample playback, CDJ cueing, beat jump, loops, loop rolls,
 * slip mode, reverse, vinyl brake, 3-band EQ with kills, filter sweep, and dual FX inserts.
 */

import { DeckId, HotCue, LoopState } from '../types';
import { FXSlotNode } from './FXProcessors';

export class DeckAudioNode {
  public id: DeckId;
  public ctx: AudioContext;
  public buffer: AudioBuffer | null = null;
  public reverseBuffer: AudioBuffer | null = null;

  // Web Audio Graph
  public outputNode: GainNode;
  public pflNode: GainNode; // Headphone cue tap
  public channelFader: GainNode;
  public gainTrim: GainNode;
  
  // 3-Band EQ Nodes
  public eqLow: BiquadFilterNode;
  public eqMid: BiquadFilterNode;
  public eqHigh: BiquadFilterNode;

  // DJ Filter Node
  public filterNode: BiquadFilterNode;

  // Dual FX Slots
  public fx1: FXSlotNode;
  public fx2: FXSlotNode;

  // Analyser for VU Meter
  public analyser: AnalyserNode;
  private vuBuffer: Uint8Array;
  private clipHoldUntil: number = 0;

  // Playback state
  private source: AudioBufferSourceNode | null = null;
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  public isPlaying: boolean = false;
  private startTime: number = 0;       // AudioContext time when current playback started
  private startOffset: number = 0;     // Position in buffer where current playback started
  private pauseTime: number = 0;       // Frozen buffer offset when paused
  private cuePosition: number = 0;
  private isHoldingCue: boolean = false;
  private playbackRate: number = 1.0;
  private keyshiftRatio: number = 1.0;

  // Slip & Ghost Playhead
  private isSlip: boolean = false;
  private ghostStartTime: number = 0;
  private ghostStartOffset: number = 0;

  // Loop & Roll
  private loopState: LoopState = {
    active: false,
    start: 0,
    end: 0,
    lengthBeats: 4,
    isRoll: false,
  };

  // Reverse & Brake
  private isReverse: boolean = false;
  private isBraking: boolean = false;

  constructor(id: DeckId, ctx: AudioContext) {
    this.id = id;
    this.ctx = ctx;

    // 1. Create Audio Nodes
    this.gainTrim = ctx.createGain();
    
    // 3-Band EQ
    this.eqLow = ctx.createBiquadFilter();
    this.eqLow.type = 'lowshelf';
    this.eqLow.frequency.value = 120; // 120Hz sub/bass shelf

    this.eqMid = ctx.createBiquadFilter();
    this.eqMid.type = 'peaking';
    this.eqMid.frequency.value = 1100; // 1.1kHz body
    this.eqMid.Q.value = 0.9;

    this.eqHigh = ctx.createBiquadFilter();
    this.eqHigh.type = 'highshelf';
    this.eqHigh.frequency.value = 7500; // 7.5kHz sizzle

    // DJ Filter (-1 to +1 sweep)
    this.filterNode = ctx.createBiquadFilter();
    this.filterNode.type = 'allpass';
    this.filterNode.frequency.value = 1000;
    this.filterNode.Q.value = 2.5;

    // FX Units
    this.fx1 = new FXSlotNode(ctx);
    this.fx2 = new FXSlotNode(ctx);

    // Channel Fader
    this.channelFader = ctx.createGain();

    // VU & Frequency Band Analyser (placed post-EQ to reflect real-time filter & EQ adjustments)
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 128;
    this.analyser.smoothingTimeConstant = 0.25;
    this.vuBuffer = new Uint8Array(this.analyser.frequencyBinCount);

    // Main Channel Output & PFL Headphone tap
    this.outputNode = ctx.createGain();
    this.pflNode = ctx.createGain();
    this.pflNode.gain.value = 0; // Off by default

    // Signal Flow:
    // Source -> gainTrim -> eqLow -> eqMid -> eqHigh -> filterNode -> fx1 -> fx2 -> channelFader -> outputNode
    // Pre-fader split: fx2 output connects to pflNode and to analyser for post-EQ/Filter analysis
    this.gainTrim.connect(this.eqLow);
    this.eqLow.connect(this.eqMid);
    this.eqMid.connect(this.eqHigh);
    this.eqHigh.connect(this.filterNode);
    this.filterNode.connect(this.fx1.input);
    this.fx1.output.connect(this.fx2.input);

    // Post-EQ & Filter Analyser tap (accurately reflects EQ knobs, kills, and filters)
    this.fx2.output.connect(this.analyser);
    // Pre-fader Cue tap
    this.fx2.output.connect(this.pflNode);
    // Channel Fader -> Deck Output
    this.fx2.output.connect(this.channelFader);
    this.channelFader.connect(this.outputNode);
  }

  public loadBuffer(buffer: AudioBuffer) {
    this.stopPlayback();
    this.buffer = buffer;
    this.generateReverseBuffer(buffer);
    this.startOffset = 0;
    this.pauseTime = 0;
    this.cuePosition = 0;
    this.loopState.active = false;
  }

  private generateReverseBuffer(buf: AudioBuffer) {
    const rev = this.ctx.createBuffer(buf.numberOfChannels, buf.length, buf.sampleRate);
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const src = buf.getChannelData(c);
      const dest = rev.getChannelData(c);
      for (let i = 0, j = buf.length - 1; i < buf.length; i++, j--) {
        dest[i] = src[j];
      }
    }
    this.reverseBuffer = rev;
  }

  /**
   * Current position in the track (in seconds)
   */
  public getCurrentPosition(): number {
    if (!this.buffer) return 0;
    const dur = this.buffer.duration;
    if (!this.isPlaying) return Math.min(dur, Math.max(0, this.pauseTime));

    const elapsedCtxTime = this.ctx.currentTime - this.startTime;
    const effectiveRate = this.playbackRate * this.keyshiftRatio;
    
    if (this.isReverse) {
      const pos = this.startOffset - elapsedCtxTime * effectiveRate;
      return pos < 0 ? 0 : pos;
    }

    let pos = this.startOffset + elapsedCtxTime * effectiveRate;

    // Handle loop wrap
    if (this.loopState.active && this.loopState.end > this.loopState.start) {
      const loopLen = this.loopState.end - this.loopState.start;
      if (pos >= this.loopState.end) {
        const excess = (pos - this.loopState.start) % loopLen;
        pos = this.loopState.start + excess;
      }
    }

    return Math.min(dur, Math.max(0, pos));
  }

  /**
   * Current ghost position (for slip mode)
   */
  public getGhostPosition(): number {
    if (!this.isSlip || !this.buffer) return this.getCurrentPosition();
    const elapsed = this.ctx.currentTime - this.ghostStartTime;
    const effectiveRate = this.playbackRate * this.keyshiftRatio;
    return (this.ghostStartOffset + elapsed * effectiveRate) % this.buffer.duration;
  }

  public play() {
    if (!this.buffer || this.isPlaying) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isSlip && this.ghostStartTime === 0) {
      this.ghostStartTime = this.ctx.currentTime;
      this.ghostStartOffset = this.pauseTime;
    }

    this.startOffset = this.pauseTime;
    this.startSourceNode(this.startOffset);
    this.isPlaying = true;
  }

  public pause() {
    this.pauseTime = this.getCurrentPosition();
    this.stopPlayback();
    this.isPlaying = false;
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Standard Pioneer CDJ-style Cue Behavior
   */
  public handleCueDown(): 'set' | 'jump' {
    this.stopPlayback();
    if (!this.isPlaying) {
      // Paused: Set new cue point at current playhead
      this.cuePosition = this.pauseTime;
      return 'set';
    } else {
      // Playing: Stop and jump back to cue point
      this.isPlaying = false;
      this.pauseTime = this.cuePosition;
      this.isHoldingCue = true;
      // Start cue preview
      this.startSourceNode(this.cuePosition);
      return 'jump';
    }
  }

  public handleCueUp() {
    this.isHoldingCue = false;
    this.stopPlayback();
    this.pauseTime = this.cuePosition;
  }

  public getCuePoint(): number {
    return this.cuePosition;
  }

  public setCuePoint(pos: number) {
    this.cuePosition = Math.max(0, pos);
  }

  public jumpToPosition(pos: number) {
    if (!this.buffer) return;
    const dur = this.buffer.duration;
    const target = Math.min(dur, Math.max(0, pos));

    if (this.isPlaying) {
      this.stopPlayback();
      this.startOffset = target;
      this.startSourceNode(target);
    } else {
      this.pauseTime = target;
    }
  }

  public beatJump(beats: number, bpm: number) {
    if (!this.buffer) return;
    const beatSec = 60 / (bpm || 140);
    const delta = beats * beatSec;
    const current = this.getCurrentPosition();
    this.jumpToPosition(current + delta);
  }

  /**
   * Loops
   */
  public setAutoLoop(beats: number, bpm: number) {
    if (!this.buffer) return;
    const current = this.getCurrentPosition();
    const beatSec = 60 / (bpm || 140);
    const loopDuration = beats * beatSec;

    this.loopState = {
      active: true,
      start: current,
      end: Math.min(this.buffer.duration, current + loopDuration),
      lengthBeats: beats,
      isRoll: false,
    };

    if (this.isPlaying) {
      this.stopPlayback();
      this.startOffset = current;
      this.startSourceNode(current);
    }
  }

  public toggleLoop() {
    this.loopState.active = !this.loopState.active;
    if (this.isPlaying && this.loopState.active) {
      const pos = this.getCurrentPosition();
      this.stopPlayback();
      this.startOffset = pos;
      this.startSourceNode(pos);
    }
  }

  public halveLoop() {
    if (!this.loopState.active) return;
    const currentLen = this.loopState.end - this.loopState.start;
    this.loopState.end = this.loopState.start + currentLen * 0.5;
    this.loopState.lengthBeats = Math.max(0.0625, this.loopState.lengthBeats * 0.5);
    if (this.isPlaying) {
      this.jumpToPosition(this.loopState.start);
    }
  }

  public doubleLoop() {
    if (!this.loopState.active || !this.buffer) return;
    const currentLen = this.loopState.end - this.loopState.start;
    this.loopState.end = Math.min(this.buffer.duration, this.loopState.start + currentLen * 2);
    this.loopState.lengthBeats *= 2;
  }

  /**
   * Momentary Loop Roll
   */
  public startLoopRoll(beats: number, bpm: number) {
    if (!this.buffer) return;
    const current = this.getCurrentPosition();
    const beatSec = 60 / (bpm || 140);
    const len = beats * beatSec;

    // Save resume position
    this.loopState = {
      active: true,
      start: current,
      end: current + len,
      lengthBeats: beats,
      isRoll: true,
      rollResumePosition: current,
    };

    // Track ghost slip playhead
    this.ghostStartTime = this.ctx.currentTime;
    this.ghostStartOffset = current;

    if (this.isPlaying) {
      this.stopPlayback();
      this.startOffset = current;
      this.startSourceNode(current);
    }
  }

  public stopLoopRoll() {
    if (!this.loopState.isRoll || !this.buffer) return;
    this.loopState.active = false;
    this.loopState.isRoll = false;

    // Resume at ghost background time!
    const ghostPos = this.getGhostPosition();
    this.jumpToPosition(ghostPos);
  }

  /**
   * Slip Mode Toggle
   */
  public setSlip(slip: boolean) {
    this.isSlip = slip;
    if (slip && this.isPlaying) {
      this.ghostStartTime = this.ctx.currentTime;
      this.ghostStartOffset = this.getCurrentPosition();
    }
  }

  /**
   * Reverse Playback
   */
  public setReverse(reverse: boolean) {
    if (this.isReverse === reverse || !this.buffer) return;
    const pos = this.getCurrentPosition();
    this.isReverse = reverse;

    if (this.isPlaying) {
      this.stopPlayback();
      this.startOffset = pos;
      this.startSourceNode(pos);
    } else {
      this.pauseTime = pos;
    }
  }

  /**
   * Turntable Vinyl Brake
   */
  public triggerBrake(duration = 1.2) {
    if (!this.isPlaying || !this.source) return;
    this.isBraking = true;
    const now = this.ctx.currentTime;
    this.source.playbackRate.cancelScheduledValues(now);
    this.source.playbackRate.setValueAtTime(this.source.playbackRate.value, now);
    this.source.playbackRate.exponentialRampToValueAtTime(0.001, now + duration);

    setTimeout(() => {
      if (this.isBraking) {
        this.pause();
        this.isBraking = false;
      }
    }, duration * 1000);
  }

  /**
   * Pitch / Tempo & Keyshift
   */
  public setTempo(percent: number, keyshiftSemitones: number, keyLock: boolean) {
    // Pitch fader: 0% is 1.0x, +10% is 1.1x
    this.playbackRate = 1.0 + percent / 100;
    
    // Keyshift: semitones transposition (2^(semitones/12))
    // If keyLock is enabled, pitch doesn't shift with tempo unless keyshift knob is turned
    if (keyLock) {
      this.keyshiftRatio = Math.pow(2, keyshiftSemitones / 12);
    } else {
      this.keyshiftRatio = Math.pow(2, keyshiftSemitones / 12);
    }

    if (this.source && !this.isBraking) {
      const effectiveRate = Math.max(0.05, this.playbackRate * (keyLock ? 1 : this.keyshiftRatio));
      this.source.playbackRate.setTargetAtTime(effectiveRate, this.ctx.currentTime, 0.02);
    }
  }

  public nudge(cents: number) {
    if (!this.source) return;
    const nudgeFactor = Math.pow(2, cents / 1200);
    const effective = this.playbackRate * nudgeFactor;
    this.source.playbackRate.setTargetAtTime(effective, this.ctx.currentTime, 0.02);
  }

  public releaseNudge() {
    if (!this.source) return;
    this.source.playbackRate.setTargetAtTime(this.playbackRate, this.ctx.currentTime, 0.05);
  }

  /**
   * EQ Controls
   */
  public setEQ(lowDb: number, midDb: number, highDb: number, killL: boolean, killM: boolean, killH: boolean) {
    const now = this.ctx.currentTime;
    this.eqLow.gain.setTargetAtTime(killL ? -70 : lowDb, now, 0.02);
    this.eqMid.gain.setTargetAtTime(killM ? -70 : midDb, now, 0.02);
    this.eqHigh.gain.setTargetAtTime(killH ? -70 : highDb, now, 0.02);
  }

  /**
   * DJ Filter: -1.0 (Lowpass) to +1.0 (Highpass), 0 (Off)
   */
  public setFilter(val: number) {
    const now = this.ctx.currentTime;
    if (Math.abs(val) < 0.03) {
      this.filterNode.type = 'allpass';
      this.filterNode.frequency.setTargetAtTime(1000, now, 0.02);
    } else if (val < 0) {
      // Lowpass sweep from 20000Hz down to 60Hz
      this.filterNode.type = 'lowpass';
      const norm = 1 + val; // 1 -> 0
      const freq = 60 + Math.pow(norm, 2.5) * 19940;
      this.filterNode.frequency.setTargetAtTime(Math.max(60, freq), now, 0.02);
      this.filterNode.Q.setTargetAtTime(2.8 + Math.abs(val) * 3, now, 0.02);
    } else {
      // Highpass sweep from 20Hz up to 14000Hz
      this.filterNode.type = 'highpass';
      const freq = 20 + Math.pow(val, 2.5) * 13980;
      this.filterNode.frequency.setTargetAtTime(Math.min(18000, freq), now, 0.02);
      this.filterNode.Q.setTargetAtTime(2.8 + val * 3, now, 0.02);
    }
  }

  public setGainTrim(db: number) {
    const linear = Math.pow(10, db / 20);
    this.gainTrim.gain.setTargetAtTime(linear, this.ctx.currentTime, 0.02);
  }

  public setVolume(vol: number) {
    this.channelFader.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.02);
  }

  public setPflCue(pfl: boolean) {
    this.pflNode.gain.setTargetAtTime(pfl ? 1 : 0, this.ctx.currentTime, 0.02);
  }

  public getVuLevel(): { left: number; right: number; isClipping: boolean } {
    if (!this.isPlaying || !this.buffer) {
      this.clipHoldUntil = 0;
      return { left: 0, right: 0, isClipping: false };
    }
    this.analyser.getByteFrequencyData(this.vuBuffer as any);
    let sum = 0;
    let maxBin = 0;
    for (let i = 0; i < this.vuBuffer.length; i++) {
      const v = this.vuBuffer[i];
      sum += v;
      if (v > maxBin) maxBin = v;
    }
    const avg = sum / (this.vuBuffer.length * 255);
    const faderScale = this.channelFader ? Math.max(0, this.channelFader.gain.value) : 1;
    // Slight stereo offset simulation scaled by channel volume fader
    const rawLeft = avg * 1.4 * faderScale;
    const rawRight = avg * 1.33 * faderScale;

    // Detect signal exceeding 0dB (digital clipping threshold)
    const now = performance.now();
    const instantClip = rawLeft >= 0.95 || rawRight >= 0.95 || (maxBin >= 250 && faderScale >= 0.7);
    if (instantClip) {
      // Hold clip warning lamp active for 400ms for high-visibility visual warning (standard in pro DJ mixers)
      this.clipHoldUntil = now + 400;
    }
    const isClipping = instantClip || now < this.clipHoldUntil;

    return {
      left: Math.min(1.2, rawLeft),
      right: Math.min(1.2, rawRight),
      isClipping,
    };
  }

  /**
   * Real-time post-EQ frequency band meters (Low, Mid, High)
   * Directly reflects the current EQ knobs, Kill switches, and Filter sweeps.
   */
  public getFrequencyBands(): { low: number; mid: number; high: number } {
    if (!this.isPlaying || !this.buffer) {
      return { low: 0, mid: 0, high: 0 };
    }
    this.analyser.getByteFrequencyData(this.vuBuffer as any);

    // Low band: sub & bass (bins 0 to 2, ~0 to 375 Hz)
    let sumLow = 0;
    const lowEnd = Math.min(3, this.vuBuffer.length);
    for (let i = 0; i < lowEnd; i++) sumLow += this.vuBuffer[i];
    const lowVal = sumLow / (lowEnd * 255);

    // Mid band: growls, bass harmonics, vocal body (bins 3 to 18, ~375 to 3500 Hz)
    let sumMid = 0;
    const midStart = 3;
    const midEnd = Math.min(19, this.vuBuffer.length);
    const midCount = Math.max(1, midEnd - midStart);
    for (let i = midStart; i < midEnd; i++) sumMid += this.vuBuffer[i];
    const midVal = sumMid / (midCount * 255);

    // High band: transients, hats, sizzle (bins 19 to 55, ~3500 to 14000 Hz)
    let sumHigh = 0;
    const highStart = 19;
    const highEnd = Math.min(55, this.vuBuffer.length);
    const highCount = Math.max(1, highEnd - highStart);
    for (let i = highStart; i < highEnd; i++) sumHigh += this.vuBuffer[i];
    const highVal = sumHigh / (highCount * 255);

    return {
      low: Math.min(1, Math.max(0, lowVal * 1.6)),
      mid: Math.min(1, Math.max(0, midVal * 1.7)),
      high: Math.min(1, Math.max(0, highVal * 2.0)),
    };
  }

  private startSourceNode(offsetSeconds: number) {
    if (!this.buffer) return;
    // Cleanly stop and disconnect any existing sources before creating a new one
    this.stopPlayback();

    const activeBuf = this.isReverse && this.reverseBuffer ? this.reverseBuffer : this.buffer;
    const dur = activeBuf.duration;
    const actualOffset = this.isReverse ? dur - offsetSeconds : offsetSeconds;

    const src = this.ctx.createBufferSource();
    src.buffer = activeBuf;
    
    // Looping inside source if loop active
    if (this.loopState.active && this.loopState.end > this.loopState.start) {
      src.loop = true;
      src.loopStart = this.loopState.start;
      src.loopEnd = this.loopState.end;
    }

    const effectiveRate = Math.max(0.05, this.playbackRate);
    src.playbackRate.value = effectiveRate;
    src.connect(this.gainTrim);

    this.activeSources.add(src);
    this.startTime = this.ctx.currentTime;
    src.start(0, Math.max(0, Math.min(dur - 0.001, actualOffset)));
    this.source = src;

    src.onended = () => {
      this.activeSources.delete(src);
      if (this.source === src && !this.loopState.active) {
        this.isPlaying = false;
        this.pauseTime = 0;
      }
    };
  }

  public stopPlayback() {
    this.activeSources.forEach((s) => {
      try {
        s.onended = null;
        s.stop();
        s.disconnect();
      } catch (_) {}
    });
    this.activeSources.clear();
    this.source = null;
  }

  public forceStop() {
    this.isPlaying = false;
    this.isHoldingCue = false;
    this.stopPlayback();
    this.pauseTime = 0;
  }

  public destroy() {
    this.stopPlayback();
    this.gainTrim.disconnect();
    this.eqLow.disconnect();
    this.eqMid.disconnect();
    this.eqHigh.disconnect();
    this.filterNode.disconnect();
    this.fx1.destroy();
    this.fx2.destroy();
    this.channelFader.disconnect();
    this.outputNode.disconnect();
    this.pflNode.disconnect();
    this.analyser.disconnect();
  }
}
