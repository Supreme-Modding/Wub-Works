/**
 * Wub Works - FX Processors
 * High-performance Web Audio effect units including Dubstep Wobble LFO Filter,
 * Echo, Reverb, Flanger, Phaser, Bitcrusher, and Gate.
 */

import { FXSlotState } from '../types';

export class FXSlotNode {
  private ctx: AudioContext;
  public input: GainNode;
  public output: GainNode;
  private dryGain: GainNode;
  private wetGain: GainNode;
  private fxNodeContainer: GainNode;
  
  // Specific internal nodes
  private currentType: string = '';
  private cleanupFn: (() => void) | null = null;
  
  // Wobble Filter nodes
  private wobbleFilter: BiquadFilterNode | null = null;
  private wobbleLfo: OscillatorNode | null = null;
  private wobbleDepth: GainNode | null = null;
  
  // Echo nodes
  private delayNode: DelayNode | null = null;
  private feedbackNode: GainNode | null = null;
  private delayFilter: BiquadFilterNode | null = null;
  
  // Reverb nodes
  private convolver: ConvolverNode | null = null;
  
  // Flanger nodes
  private flangerDelay: DelayNode | null = null;
  private flangerLfo: OscillatorNode | null = null;
  private flangerLfoGain: GainNode | null = null;
  private flangerFeedback: GainNode | null = null;

  // Phaser nodes
  private phaserStages: BiquadFilterNode[] = [];
  private phaserLfo: OscillatorNode | null = null;
  private phaserLfoGain: GainNode | null = null;

  // Bitcrusher
  private waveShaper: WaveShaperNode | null = null;

  // Gate
  private gateGain: GainNode | null = null;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.input = ctx.createGain();
    this.output = ctx.createGain();
    this.dryGain = ctx.createGain();
    this.wetGain = ctx.createGain();
    this.fxNodeContainer = ctx.createGain();

    // Routing: input -> dryGain -> output
    //          input -> fxNodeContainer -> wetGain -> output
    this.input.connect(this.dryGain);
    this.dryGain.connect(this.output);

    this.input.connect(this.fxNodeContainer);
    this.wetGain.connect(this.output);

    this.dryGain.gain.value = 1;
    this.wetGain.gain.value = 0;
  }

  public update(state: FXSlotState, deckBpm: number) {
    if (!state.enabled || state.dryWet <= 0.001) {
      this.dryGain.gain.setTargetAtTime(1, this.ctx.currentTime, 0.02);
      this.wetGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.02);
      return;
    }

    const wet = Math.min(1, Math.max(0, state.dryWet));
    // Equal-power crossfade between dry and wet
    const dryVal = Math.cos((wet * Math.PI) / 2);
    const wetVal = Math.sin((wet * Math.PI) / 2);
    this.dryGain.gain.setTargetAtTime(dryVal, this.ctx.currentTime, 0.02);
    this.wetGain.gain.setTargetAtTime(wetVal, this.ctx.currentTime, 0.02);

    if (this.currentType !== state.type) {
      this.rebuildEffect(state.type, deckBpm);
      this.currentType = state.type;
    }

    this.applyParameters(state, deckBpm);
  }

  private rebuildEffect(type: string, bpm: number) {
    // Teardown previous
    if (this.cleanupFn) {
      this.cleanupFn();
      this.cleanupFn = null;
    }
    this.fxNodeContainer.disconnect();

    switch (type) {
      case 'wobble':
        this.buildWobble(bpm);
        break;
      case 'echo':
        this.buildEcho(bpm);
        break;
      case 'reverb':
        this.buildReverb();
        break;
      case 'flanger':
        this.buildFlanger();
        break;
      case 'phaser':
        this.buildPhaser();
        break;
      case 'bitcrush':
        this.buildBitcrush();
        break;
      case 'gate':
        this.buildGate(bpm);
        break;
    }
  }

  // --- DUBSTEP WOBBLE FILTER ---
  private buildWobble(bpm: number) {
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    filter.Q.value = 9.0; // High resonant bite

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sawtooth'; // Aggressive dubstep sweep
    const lfoDepth = this.ctx.createGain();
    lfoDepth.gain.value = 1600;

    lfo.connect(lfoDepth);
    lfoDepth.connect(filter.frequency);
    lfo.start();

    this.fxNodeContainer.connect(filter);
    filter.connect(this.wetGain);

    this.wobbleFilter = filter;
    this.wobbleLfo = lfo;
    this.wobbleDepth = lfoDepth;

    this.cleanupFn = () => {
      try { lfo.stop(); } catch (_) {}
      filter.disconnect();
      lfo.disconnect();
      lfoDepth.disconnect();
    };
  }

  // --- ECHO / DUB DELAY ---
  private buildEcho(bpm: number) {
    const delay = this.ctx.createDelay(4.0);
    const feedback = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3500; // Analog dub tape high-cut

    const quarterNoteSec = 60 / (bpm || 140);
    delay.delayTime.value = quarterNoteSec * 0.75; // Dotted eighth note
    feedback.gain.value = 0.45;

    this.fxNodeContainer.connect(delay);
    delay.connect(filter);
    filter.connect(feedback);
    feedback.connect(delay);
    filter.connect(this.wetGain);

    this.delayNode = delay;
    this.feedbackNode = feedback;
    this.delayFilter = filter;

    this.cleanupFn = () => {
      delay.disconnect();
      feedback.disconnect();
      filter.disconnect();
    };
  }

  // --- REVERB (Synthesized Impulse Response) ---
  private buildReverb() {
    const convolver = this.ctx.createConvolver();
    convolver.buffer = this.generateImpulseResponse(2.2, 2.0);

    this.fxNodeContainer.connect(convolver);
    convolver.connect(this.wetGain);
    this.convolver = convolver;

    this.cleanupFn = () => {
      convolver.disconnect();
    };
  }

  private generateImpulseResponse(duration: number, decay: number): AudioBuffer {
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * duration);
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const env = Math.exp(-n * decay * 4);
      left[i] = (Math.random() * 2 - 1) * env;
      right[i] = (Math.random() * 2 - 1) * env;
    }
    return impulse;
  }

  // --- FLANGER ---
  private buildFlanger() {
    const delay = this.ctx.createDelay(0.05);
    delay.delayTime.value = 0.003; // 3ms

    const lfo = this.ctx.createOscillator();
    lfo.type = 'triangle';
    lfo.frequency.value = 0.4; // 0.4 Hz sweep

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.002;

    const feedback = this.ctx.createGain();
    feedback.gain.value = 0.6;

    lfo.connect(lfoGain);
    lfoGain.connect(delay.delayTime);
    lfo.start();

    this.fxNodeContainer.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(this.wetGain);

    this.flangerDelay = delay;
    this.flangerLfo = lfo;
    this.flangerLfoGain = lfoGain;
    this.flangerFeedback = feedback;

    this.cleanupFn = () => {
      try { lfo.stop(); } catch (_) {}
      delay.disconnect();
      lfo.disconnect();
      lfoGain.disconnect();
      feedback.disconnect();
    };
  }

  // --- PHASER ---
  private buildPhaser() {
    const stages: BiquadFilterNode[] = [];
    const numStages = 4;
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.5;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 750;

    let prevNode: AudioNode = this.fxNodeContainer;
    for (let i = 0; i < numStages; i++) {
      const stage = this.ctx.createBiquadFilter();
      stage.type = 'allpass';
      stage.frequency.value = 1000;
      prevNode.connect(stage);
      lfoGain.connect(stage.frequency);
      stages.push(stage);
      prevNode = stage;
    }

    prevNode.connect(this.wetGain);
    lfo.connect(lfoGain);
    lfo.start();

    this.phaserStages = stages;
    this.phaserLfo = lfo;
    this.phaserLfoGain = lfoGain;

    this.cleanupFn = () => {
      try { lfo.stop(); } catch (_) {}
      stages.forEach(s => s.disconnect());
      lfo.disconnect();
      lfoGain.disconnect();
    };
  }

  // --- BITCRUSHER ---
  private buildBitcrush() {
    const shaper = this.ctx.createWaveShaper();
    shaper.curve = this.makeBitcrushCurve(6) as any; // 6-bit crunch
    shaper.oversample = 'none'; // raw crunchy aliasing

    this.fxNodeContainer.connect(shaper);
    shaper.connect(this.wetGain);
    this.waveShaper = shaper;

    this.cleanupFn = () => {
      shaper.disconnect();
    };
  }

  private makeBitcrushCurve(bits: number): Float32Array {
    const samples = 1024;
    const curve = new Float32Array(samples);
    const step = Math.pow(0.5, bits - 1);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = Math.round(x / step) * step;
    }
    return curve;
  }

  // --- NOISE GATE ---
  private buildGate(bpm: number) {
    const gateGain = this.ctx.createGain();
    gateGain.gain.value = 1;

    // Gated chopper synced to 1/8 notes
    const lfo = this.ctx.createOscillator();
    lfo.type = 'square';
    const beatSec = 60 / (bpm || 140);
    lfo.frequency.value = (1 / beatSec) * 2; // 1/8 note gate chopper

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.5;

    // Center gate around 0.5
    gateGain.gain.value = 0.5;
    lfo.connect(lfoGain);
    lfoGain.connect(gateGain.gain);
    lfo.start();

    this.fxNodeContainer.connect(gateGain);
    gateGain.connect(this.wetGain);
    this.gateGain = gateGain;

    this.cleanupFn = () => {
      try { lfo.stop(); } catch (_) {}
      gateGain.disconnect();
      lfo.disconnect();
      lfoGain.disconnect();
    };
  }

  private applyParameters(state: FXSlotState, bpm: number) {
    const now = this.ctx.currentTime;
    const effectiveBpm = bpm || 140;
    const beatSec = 60 / effectiveBpm;

    if (state.type === 'wobble') {
      if (this.wobbleLfo && this.wobbleFilter && this.wobbleDepth) {
        // param1: rate subdivision: 0.125 (1/32), 0.25 (1/16), 0.5 (1/8), 1.0 (1/4), 2.0 (1/2), 3.0 (triplet 1/8T)
        let rateHz = 2;
        const p1 = state.param1;
        if (p1 <= 0.15) rateHz = (1 / beatSec) * 8; // 1/32
        else if (p1 <= 0.3) rateHz = (1 / beatSec) * 4; // 1/16
        else if (p1 <= 0.5) rateHz = (1 / beatSec) * 2; // 1/8
        else if (p1 <= 0.75) rateHz = (1 / beatSec) * 1; // 1/4
        else if (p1 <= 0.9) rateHz = (1 / beatSec) * 3; // 1/8T triplet!
        else rateHz = (1 / beatSec) * 0.5; // 1/2 bar

        this.wobbleLfo.frequency.setTargetAtTime(rateHz, now, 0.03);
        // param2: Resonance Q (1 to 15)
        const qVal = 1 + state.param2 * 14;
        this.wobbleFilter.Q.setTargetAtTime(qVal, now, 0.03);
        // param3: Depth
        const depthVal = 400 + state.param3 * 2400;
        this.wobbleDepth.gain.setTargetAtTime(depthVal, now, 0.03);
      }
    } else if (state.type === 'echo') {
      if (this.delayNode && this.feedbackNode) {
        // param1: delay time beats: 0.25, 0.5, 0.75 (dotted 8th), 1.0
        let mult = 0.75;
        if (state.param1 <= 0.25) mult = 0.25;
        else if (state.param1 <= 0.5) mult = 0.5;
        else if (state.param1 <= 0.75) mult = 0.75;
        else mult = 1.0;

        this.delayNode.delayTime.setTargetAtTime(beatSec * mult, now, 0.05);
        // param2: feedback (0.1 to 0.85)
        const fb = 0.1 + state.param2 * 0.75;
        this.feedbackNode.gain.setTargetAtTime(fb, now, 0.03);
      }
    } else if (state.type === 'flanger') {
      if (this.flangerLfo && this.flangerFeedback) {
        const rate = 0.1 + state.param1 * 2.0;
        this.flangerLfo.frequency.setTargetAtTime(rate, now, 0.03);
        const fb = 0.2 + state.param2 * 0.7;
        this.flangerFeedback.gain.setTargetAtTime(fb, now, 0.03);
      }
    } else if (state.type === 'bitcrush') {
      if (this.waveShaper && state.param1) {
        // bits: 4 to 12
        const bits = Math.max(3, Math.min(12, Math.round(3 + (1 - state.param1) * 9)));
        this.waveShaper.curve = this.makeBitcrushCurve(bits) as any;
      }
    }
  }

  public destroy() {
    if (this.cleanupFn) this.cleanupFn();
    this.input.disconnect();
    this.output.disconnect();
    this.dryGain.disconnect();
    this.wetGain.disconnect();
  }
}
