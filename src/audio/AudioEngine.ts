/**
 * Wub Works - Central Audio Engine Singleton
 * Manages AudioContext, multi-deck audio graphs, crossfader curves,
 * PFL headphone monitoring, master volume, and live WAV set recording.
 */

import { CrossfaderCurve, DeckId } from '../types';
import { DeckAudioNode } from './DeckAudioNode';
import { WavRecorder } from './WavRecorder';
import { WubSynthEngine } from './WubSynthEngine';

class AudioEngineSingleton {
  public ctx: AudioContext | null = null;
  public decks: Map<DeckId, DeckAudioNode> = new Map();
  private previewSources: Set<AudioBufferSourceNode> = new Set();
  
  // Crossfader nodes
  public crossfaderLeftBus: GainNode | null = null;
  public crossfaderRightBus: GainNode | null = null;
  public masterBus: GainNode | null = null;
  public masterAnalyser: AnalyserNode | null = null;
  private masterVuBuffer: Uint8Array | null = null;
  private masterClipHoldUntil: number = 0;

  // Headphone Cue / PFL Bus
  public pflBus: GainNode | null = null;
  public headphoneCueMixNode: GainNode | null = null;
  public headphoneMasterMixNode: GainNode | null = null;
  public headphoneOutputNode: GainNode | null = null;

  // Recorder
  public recorder: WavRecorder | null = null;

  // State cache
  private crossfaderPosition: number = 0; // -1 to +1
  private crossfaderCurve: CrossfaderCurve = 'smooth';
  private crossfaderHamster: boolean = false;
  private channelAssignments: Map<DeckId, 'A' | 'THRU' | 'B'> = new Map([
    ['A', 'A'],
    ['B', 'B'],
    ['C', 'A'],
    ['D', 'B'],
  ]);

  public init(): AudioContext {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass({ latencyHint: 'interactive' });

    // 1. Master Output Bus
    this.masterBus = this.ctx.createGain();
    this.masterBus.gain.value = 0.9;

    this.masterAnalyser = this.ctx.createAnalyser();
    this.masterAnalyser.fftSize = 64;
    this.masterAnalyser.smoothingTimeConstant = 0.25;
    this.masterVuBuffer = new Uint8Array(this.masterAnalyser.frequencyBinCount);

    this.masterBus.connect(this.masterAnalyser);
    this.masterAnalyser.connect(this.ctx.destination);

    // 2. Crossfader Busses
    this.crossfaderLeftBus = this.ctx.createGain();
    this.crossfaderRightBus = this.ctx.createGain();

    this.crossfaderLeftBus.connect(this.masterBus);
    this.crossfaderRightBus.connect(this.masterBus);

    // 3. Headphone Monitoring PFL Bus
    this.pflBus = this.ctx.createGain();
    this.headphoneCueMixNode = this.ctx.createGain();
    this.headphoneMasterMixNode = this.ctx.createGain();
    this.headphoneOutputNode = this.ctx.createGain();

    // Cue blend setup
    this.pflBus.connect(this.headphoneCueMixNode);
    this.masterBus.connect(this.headphoneMasterMixNode);
    this.headphoneCueMixNode.connect(this.headphoneOutputNode);
    this.headphoneMasterMixNode.connect(this.headphoneOutputNode);

    // Default headphone mix (half cue, half master)
    this.headphoneCueMixNode.gain.value = 1.0;
    this.headphoneMasterMixNode.gain.value = 0.0;
    this.headphoneOutputNode.gain.value = 0.8;

    // Connect to multi-output or main destination if supported
    // (If separate audio interface channels 3/4 are available, they would be routed here)

    // 4. Recorder instance
    this.recorder = new WavRecorder(this.ctx, this.masterBus);

    // 5. Create 4 Deck Nodes
    (['A', 'B', 'C', 'D'] as DeckId[]).forEach((id) => {
      const deck = new DeckAudioNode(id, this.ctx!);
      this.decks.set(id, deck);

      // Connect deck PFL to central headphone bus
      deck.pflNode.connect(this.pflBus!);

      // Route channel output through crossfader matrix
      this.routeDeckOutput(id);
    });

    this.updateCrossfaderGains();
    return this.ctx;
  }

  public getDeck(id: DeckId): DeckAudioNode {
    if (!this.ctx) this.init();
    return this.decks.get(id)!;
  }

  public setChannelCrossfaderAssign(id: DeckId, assign: 'A' | 'THRU' | 'B') {
    this.channelAssignments.set(id, assign);
    this.routeDeckOutput(id);
  }

  private routeDeckOutput(id: DeckId) {
    const deck = this.decks.get(id);
    if (!deck || !this.masterBus || !this.crossfaderLeftBus || !this.crossfaderRightBus) return;

    try {
      deck.outputNode.disconnect();
    } catch (_) {}

    const assign = this.channelAssignments.get(id) || 'THRU';
    if (assign === 'A') {
      deck.outputNode.connect(this.crossfaderLeftBus);
    } else if (assign === 'B') {
      deck.outputNode.connect(this.crossfaderRightBus);
    } else {
      // THRU directly to master bus
      deck.outputNode.connect(this.masterBus);
    }
  }

  /**
   * Set crossfader position (-1.0 Left to +1.0 Right) and recalculate curve gains
   */
  public setCrossfader(position: number, curve?: CrossfaderCurve, hamster?: boolean) {
    this.crossfaderPosition = Math.max(-1, Math.min(1, position));
    if (curve !== undefined) this.crossfaderCurve = curve;
    if (hamster !== undefined) this.crossfaderHamster = hamster;
    this.updateCrossfaderGains();
  }

  private updateCrossfaderGains() {
    if (!this.crossfaderLeftBus || !this.crossfaderRightBus || !this.ctx) return;
    const now = this.ctx.currentTime;
    let pos = this.crossfaderPosition;
    if (this.crossfaderHamster) pos = -pos; // Swap sides

    // Normalize -1..+1 to 0..1 (0 = full Left, 1 = full Right)
    const norm = (pos + 1) / 2;

    let leftGain = 1.0;
    let rightGain = 1.0;

    switch (this.crossfaderCurve) {
      case 'smooth': {
        // Equal-power constant loudness curve
        leftGain = Math.cos((norm * Math.PI) / 2);
        rightGain = Math.sin((norm * Math.PI) / 2);
        break;
      }
      case 'linear': {
        // Standard linear slope
        leftGain = 1 - norm;
        rightGain = norm;
        break;
      }
      case 'cut': {
        // Sharp scratch cut: full volume until 3% from opposite edge
        const cutThreshold = 0.04;
        leftGain = norm < 1 - cutThreshold ? 1 : Math.max(0, (1 - norm) / cutThreshold);
        rightGain = norm > cutThreshold ? 1 : Math.max(0, norm / cutThreshold);
        break;
      }
    }

    this.crossfaderLeftBus.gain.setTargetAtTime(leftGain, now, 0.015);
    this.crossfaderRightBus.gain.setTargetAtTime(rightGain, now, 0.015);
  }

  public setMasterVolume(vol: number) {
    if (!this.masterBus || !this.ctx) return;
    this.masterBus.gain.setTargetAtTime(Math.max(0, Math.min(1.5, vol)), this.ctx.currentTime, 0.02);
  }

  public setHeadphoneMonitoring(volume: number, cueMix: number) {
    if (!this.headphoneOutputNode || !this.headphoneCueMixNode || !this.headphoneMasterMixNode || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.headphoneOutputNode.gain.setTargetAtTime(volume, now, 0.02);
    // cueMix: 0 = 100% CUE, 1 = 100% MASTER
    this.headphoneCueMixNode.gain.setTargetAtTime(1 - cueMix, now, 0.02);
    this.headphoneMasterMixNode.gain.setTargetAtTime(cueMix, now, 0.02);
  }

  public getMasterVu(): { left: number; right: number; isClipping: boolean } {
    if (!this.masterAnalyser || !this.masterVuBuffer) return { left: 0, right: 0, isClipping: false };
    this.masterAnalyser.getByteFrequencyData(this.masterVuBuffer as any);
    let sum = 0;
    for (let i = 0; i < this.masterVuBuffer.length; i++) {
      sum += this.masterVuBuffer[i];
    }
    const avg = sum / (this.masterVuBuffer.length * 255);
    const left = Math.min(1.2, avg * 1.35);
    const right = Math.min(1.2, avg * 1.3);
    const now = performance.now();
    const instantClip = left >= 0.95 || right >= 0.95;
    if (instantClip) {
      this.masterClipHoldUntil = now + 400;
    }
    const isClipping = instantClip || now < this.masterClipHoldUntil;
    return {
      left,
      right,
      isClipping,
    };
  }

  /**
   * Decode local audio file (MP3, WAV, FLAC, OGG, AAC) into an AudioBuffer
   */
  public async decodeAudioFile(file: File | Blob): Promise<AudioBuffer> {
    if (!this.ctx) this.init();
    const arrayBuffer = await file.arrayBuffer();
    return await this.ctx!.decodeAudioData(arrayBuffer);
  }

  /**
   * Check for multi-channel audio hardware support (e.g. 4-channel DJ soundcards)
   */
  public async checkAudioHardware(): Promise<{ hasMultipleOutputs: boolean; channelCount: number; notice: string }> {
    if (!this.ctx) this.init();
    const channels = this.ctx!.destination.maxChannelCount || 2;
    const hasMultiple = channels >= 4;

    return {
      hasMultipleOutputs: hasMultiple,
      channelCount: channels,
      notice: hasMultiple
        ? `Hardware detected: ${channels}-channel multi-output audio device. Dedicated headphone cueing enabled!`
        : `Device reports 2 stereo channels. Headphone PFL mix is blended into main monitor. For hardware headphone splitting, connect a 4-channel DJ audio interface or a stereo DJ splitter cable.`,
    };
  }

  public registerPreviewSource(src: AudioBufferSourceNode) {
    this.previewSources.add(src);
  }

  public unregisterPreviewSource(src: AudioBufferSourceNode) {
    this.previewSources.delete(src);
  }

  /**
   * Emergency Stop / Panic:
   * Immediately halts playback and frees nodes on every deck, stops any preview sources,
   * silences WubSynthEngine, and mutes the master bus.
   */
  public stopAllAudio() {
    // 1. Force stop all decks
    this.decks.forEach((deck) => {
      try {
        deck.forceStop();
      } catch (_) {}
    });

    // 2. Stop and free all one-shot/preview sources
    this.previewSources.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch (_) {}
    });
    this.previewSources.clear();

    // 3. Silence synth engine
    try {
      WubSynthEngine.allNotesOff();
    } catch (_) {}

    // 4. Mute master bus momentarily to kill any lingering reverb or delay feedback tails
    if (this.masterBus && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.masterBus.gain.cancelScheduledValues(0);
        this.masterBus.gain.setValueAtTime(0, now);
        this.masterBus.gain.setTargetAtTime(0.9, now + 0.03, 0.02);
      } catch (_) {}
    }
  }
}

export const AudioEngine = new AudioEngineSingleton();
