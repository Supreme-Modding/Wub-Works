/**
 * Wub Works - Wub Synth Sound Design Engine (Phase 2B)
 * Modular Dubstep Bass Synthesizer with Wavetable/FM synthesis,
 * Dual Oscillators + Sub, Resonant Vowel Formant Filters, Synced LFO Wobble Matrix,
 * Post-Processing Drive & Bitcrushing, Real-Time Audio Playback, and Offline Pattern Baking to Decks.
 */

export type OscWaveform = 'sawtooth' | 'square' | 'sine' | 'triangle' | 'growl' | 'metallic';
export type FilterType = 'lowpass' | 'bandpass' | 'highpass' | 'comb' | 'vowel_yoi' | 'vowel_growl';
export type LfoRateSync = '1/1' | '1/2' | '1/4' | '1/4T' | '1/8' | '1/8T' | '1/16' | '1/16T' | '1/32' | 'free';
export type LfoWaveform = 'sine' | 'triangle' | 'saw' | 'square' | 'stepped' | 'exponential';
export type DistortionType = 'soft' | 'tube' | 'hard' | 'fuzz' | 'hyper';

export interface SynthOscState {
  enabled: boolean;
  waveform: OscWaveform;
  octave: number; // -2 to +2
  semi: number;   // -12 to +12
  fine: number;   // -50 to +50 cents
  volume: number; // 0 to 1
  pan: number;    // -1 to 1
  unison: number; // 1 to 5 voices
  detuneSpread: number; // 0 to 1
}

export interface SynthFilterState {
  enabled: boolean;
  type: FilterType;
  cutoff: number;       // 20 to 16000 Hz
  resonance: number;    // 0.5 to 18
  envAmount: number;    // -1 to +1
  formantMorph: number; // 0 to 1
  drive: number;        // 0 to 1
}

export interface SynthLfoState {
  enabled: boolean;
  rateSync: LfoRateSync;
  freeHz: number;       // 0.1 to 30 Hz
  waveform: LfoWaveform;
  cutoffAmount: number; // -1 to 1
  fmAmount: number;     // 0 to 1
  pitchAmount: number;  // -1 to 1
  panAmount: number;    // 0 to 1
}

export interface SynthEnvelopeState {
  attack: number;  // 0.001 to 2.0 s
  decay: number;   // 0.01 to 3.0 s
  sustain: number; // 0 to 1
  release: number; // 0.01 to 3.0 s
}

export interface SynthFxState {
  distortionType: DistortionType;
  distortionDrive: number; // 0 to 1
  bitcrushBits: number;    // 0 (off), 3 to 16
  bitcrushRate: number;    // 0 to 1
  reverbWet: number;       // 0 to 1
  subVol: number;          // 0 to 1
  subOctave: number;       // -1 or -2
}

export interface WubSynthPatch {
  id: string;
  name: string;
  category: string;
  description: string;
  glide: number; // portamento in seconds
  fmDepth: number; // Osc 2 -> Osc 1 FM depth
  masterVolume: number;
  osc1: SynthOscState;
  osc2: SynthOscState;
  filter: SynthFilterState;
  lfo: SynthLfoState;
  ampEnv: SynthEnvelopeState;
  filterEnv: SynthEnvelopeState;
  fx: SynthFxState;
}

export type BakePatternType = 'continuous_wub' | 'halftime_drop' | 'stutter_chop' | 'arpeggiated' | 'pitch_dive' | 'oneshot_growl';

export const SYNTH_PRESETS: WubSynthPatch[] = [
  {
    id: 'cyber_wobble_1_8',
    name: 'CYBER WOBBLE (1/8 WUB)',
    category: 'Classic Wobble',
    description: 'Signature 1/8 note sync wobbling bass with detuned saw unison and resonant lowpass sweep.',
    glide: 0.06,
    fmDepth: 0.25,
    masterVolume: 0.85,
    osc1: {
      enabled: true,
      waveform: 'sawtooth',
      octave: 0,
      semi: 0,
      fine: 0,
      volume: 0.85,
      pan: 0,
      unison: 3,
      detuneSpread: 0.15,
    },
    osc2: {
      enabled: true,
      waveform: 'growl',
      octave: 0,
      semi: 7,
      fine: -5,
      volume: 0.65,
      pan: 0,
      unison: 1,
      detuneSpread: 0,
    },
    filter: {
      enabled: true,
      type: 'lowpass',
      cutoff: 450,
      resonance: 6.5,
      envAmount: 0.35,
      formantMorph: 0.2,
      drive: 0.4,
    },
    lfo: {
      enabled: true,
      rateSync: '1/8',
      freeHz: 4.66,
      waveform: 'sine',
      cutoffAmount: 0.85,
      fmAmount: 0.4,
      pitchAmount: 0,
      panAmount: 0.15,
    },
    ampEnv: {
      attack: 0.005,
      decay: 0.3,
      sustain: 0.9,
      release: 0.12,
    },
    filterEnv: {
      attack: 0.02,
      decay: 0.4,
      sustain: 0.5,
      release: 0.2,
    },
    fx: {
      distortionType: 'tube',
      distortionDrive: 0.45,
      bitcrushBits: 0,
      bitcrushRate: 0,
      reverbWet: 0.15,
      subVol: 0.8,
      subOctave: -1,
    },
  },
  {
    id: 'tearout_screech',
    name: 'TEAROUT SCREECH (FM CHOP)',
    category: 'Tearout / Screech',
    description: 'Razor-sharp FM modulation with high-resonance metallic comb character and tube overdrive.',
    glide: 0.04,
    fmDepth: 0.75,
    masterVolume: 0.82,
    osc1: {
      enabled: true,
      waveform: 'metallic',
      octave: 0,
      semi: 0,
      fine: 0,
      volume: 0.9,
      pan: 0,
      unison: 3,
      detuneSpread: 0.2,
    },
    osc2: {
      enabled: true,
      waveform: 'square',
      octave: 1,
      semi: 0,
      fine: 12,
      volume: 0.7,
      pan: 0,
      unison: 1,
      detuneSpread: 0,
    },
    filter: {
      enabled: true,
      type: 'comb',
      cutoff: 1850,
      resonance: 9.5,
      envAmount: 0.4,
      formantMorph: 0.5,
      drive: 0.65,
    },
    lfo: {
      enabled: true,
      rateSync: '1/16',
      freeHz: 9.33,
      waveform: 'saw',
      cutoffAmount: 0.7,
      fmAmount: 0.65,
      pitchAmount: 0.15,
      panAmount: 0.25,
    },
    ampEnv: {
      attack: 0.002,
      decay: 0.25,
      sustain: 0.8,
      release: 0.08,
    },
    filterEnv: {
      attack: 0.005,
      decay: 0.2,
      sustain: 0.4,
      release: 0.15,
    },
    fx: {
      distortionType: 'hard',
      distortionDrive: 0.68,
      bitcrushBits: 10,
      bitcrushRate: 0.2,
      reverbWet: 0.2,
      subVol: 0.75,
      subOctave: -1,
    },
  },
  {
    id: 'death_growl_vowel',
    name: 'MUTANT DEATH GROWL',
    category: 'Growl Bass',
    description: 'Formant vowel talkbox filter sliding between "A" and "O" phonemes over a thick distorted wavetable.',
    glide: 0.08,
    fmDepth: 0.45,
    masterVolume: 0.84,
    osc1: {
      enabled: true,
      waveform: 'growl',
      octave: 0,
      semi: 0,
      fine: 0,
      volume: 0.9,
      pan: 0,
      unison: 2,
      detuneSpread: 0.12,
    },
    osc2: {
      enabled: true,
      waveform: 'sawtooth',
      octave: -1,
      semi: 7,
      fine: 0,
      volume: 0.75,
      pan: 0,
      unison: 1,
      detuneSpread: 0,
    },
    filter: {
      enabled: true,
      type: 'vowel_growl',
      cutoff: 750,
      resonance: 8.0,
      envAmount: 0.5,
      formantMorph: 0.65,
      drive: 0.55,
    },
    lfo: {
      enabled: true,
      rateSync: '1/4',
      freeHz: 2.33,
      waveform: 'exponential',
      cutoffAmount: 0.9,
      fmAmount: 0.5,
      pitchAmount: 0.08,
      panAmount: 0.1,
    },
    ampEnv: {
      attack: 0.01,
      decay: 0.45,
      sustain: 0.85,
      release: 0.15,
    },
    filterEnv: {
      attack: 0.015,
      decay: 0.35,
      sustain: 0.6,
      release: 0.2,
    },
    fx: {
      distortionType: 'hyper',
      distortionDrive: 0.6,
      bitcrushBits: 0,
      bitcrushRate: 0,
      reverbWet: 0.18,
      subVol: 0.85,
      subOctave: -1,
    },
  },
  {
    id: 'neon_yoi_riddim',
    name: 'NEON YOI RIDDIM CHOP',
    category: 'Riddim / Trench',
    description: 'The defining riddim "YOI" sound. Resonant bandpass dual-formant filter synced to 1/4 note chops.',
    glide: 0.05,
    fmDepth: 0.3,
    masterVolume: 0.85,
    osc1: {
      enabled: true,
      waveform: 'square',
      octave: 0,
      semi: 0,
      fine: 0,
      volume: 0.85,
      pan: 0,
      unison: 1,
      detuneSpread: 0,
    },
    osc2: {
      enabled: true,
      waveform: 'sawtooth',
      octave: 0,
      semi: 0,
      fine: 8,
      volume: 0.75,
      pan: 0,
      unison: 2,
      detuneSpread: 0.1,
    },
    filter: {
      enabled: true,
      type: 'vowel_yoi',
      cutoff: 600,
      resonance: 11.0,
      envAmount: 0.6,
      formantMorph: 0.8,
      drive: 0.45,
    },
    lfo: {
      enabled: true,
      rateSync: '1/4',
      freeHz: 2.33,
      waveform: 'triangle',
      cutoffAmount: 0.95,
      fmAmount: 0.3,
      pitchAmount: 0,
      panAmount: 0,
    },
    ampEnv: {
      attack: 0.003,
      decay: 0.35,
      sustain: 0.75,
      release: 0.1,
    },
    filterEnv: {
      attack: 0.005,
      decay: 0.3,
      sustain: 0.5,
      release: 0.15,
    },
    fx: {
      distortionType: 'tube',
      distortionDrive: 0.5,
      bitcrushBits: 0,
      bitcrushRate: 0,
      reverbWet: 0.12,
      subVol: 0.9,
      subOctave: -1,
    },
  },
  {
    id: 'sub_pressure_808',
    name: 'SUB PRESSURE 808',
    category: 'Sub & 808',
    description: 'Clean sinusoidal sub pressure with warm soft saturation and subtle harmonic octave overtone.',
    glide: 0.12,
    fmDepth: 0.05,
    masterVolume: 0.88,
    osc1: {
      enabled: true,
      waveform: 'sine',
      octave: -1,
      semi: 0,
      fine: 0,
      volume: 1.0,
      pan: 0,
      unison: 1,
      detuneSpread: 0,
    },
    osc2: {
      enabled: true,
      waveform: 'triangle',
      octave: 0,
      semi: 0,
      fine: 0,
      volume: 0.3,
      pan: 0,
      unison: 1,
      detuneSpread: 0,
    },
    filter: {
      enabled: true,
      type: 'lowpass',
      cutoff: 180,
      resonance: 1.2,
      envAmount: 0.15,
      formantMorph: 0,
      drive: 0.3,
    },
    lfo: {
      enabled: false,
      rateSync: '1/2',
      freeHz: 1.16,
      waveform: 'sine',
      cutoffAmount: 0.2,
      fmAmount: 0,
      pitchAmount: 0,
      panAmount: 0,
    },
    ampEnv: {
      attack: 0.008,
      decay: 0.8,
      sustain: 0.85,
      release: 0.35,
    },
    filterEnv: {
      attack: 0.01,
      decay: 0.5,
      sustain: 0.3,
      release: 0.3,
    },
    fx: {
      distortionType: 'soft',
      distortionDrive: 0.35,
      bitcrushBits: 0,
      bitcrushRate: 0,
      reverbWet: 0.05,
      subVol: 1.0,
      subOctave: -1,
    },
  },
  {
    id: 'alien_laser_lead',
    name: 'ALIEN LASER BEAM',
    category: 'Lasers & Glitch',
    description: 'Rapid pitch-modulated laser beam saw with fast LFO and crushing bit reduction for futuristic drops.',
    glide: 0.03,
    fmDepth: 0.5,
    masterVolume: 0.82,
    osc1: {
      enabled: true,
      waveform: 'sawtooth',
      octave: 1,
      semi: 0,
      fine: 0,
      volume: 0.85,
      pan: 0,
      unison: 2,
      detuneSpread: 0.15,
    },
    osc2: {
      enabled: true,
      waveform: 'square',
      octave: 1,
      semi: 7,
      fine: -10,
      volume: 0.65,
      pan: 0,
      unison: 1,
      detuneSpread: 0,
    },
    filter: {
      enabled: true,
      type: 'bandpass',
      cutoff: 2400,
      resonance: 8.5,
      envAmount: 0.5,
      formantMorph: 0.3,
      drive: 0.5,
    },
    lfo: {
      enabled: true,
      rateSync: '1/16T',
      freeHz: 14.0,
      waveform: 'saw',
      cutoffAmount: 0.8,
      fmAmount: 0.4,
      pitchAmount: 0.35,
      panAmount: 0.4,
    },
    ampEnv: {
      attack: 0.002,
      decay: 0.2,
      sustain: 0.7,
      release: 0.06,
    },
    filterEnv: {
      attack: 0.005,
      decay: 0.15,
      sustain: 0.4,
      release: 0.1,
    },
    fx: {
      distortionType: 'hard',
      distortionDrive: 0.55,
      bitcrushBits: 8,
      bitcrushRate: 0.35,
      reverbWet: 0.25,
      subVol: 0.6,
      subOctave: -1,
    },
  },
];

export interface SynthActiveVoice {
  id: number;
  note: number;
  oscillators: OscillatorNode[];
  nodes: AudioNode[];
  gain: GainNode;
  cleanupTimer: ReturnType<typeof setTimeout> | null;
}

export class WubSynthEngineSingleton {
  public ctx: AudioContext | null = null;
  public masterGain: GainNode | null = null;
  public analyser: AnalyserNode | null = null;

  private currentPatch: WubSynthPatch = { ...SYNTH_PRESETS[0] };
  private voiceIdCounter: number = 0;
  private allVoices: Set<SynthActiveVoice> = new Set();
  private activeNoteVoices: Map<number, SynthActiveVoice> = new Map();
  private activeOscillators: Set<OscillatorNode> = new Set();

  private lastNoteNumber: number | null = null;

  public init(ctx: AudioContext) {
    if (this.ctx && this.masterGain && this.analyser) return;
    this.ctx = ctx;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = this.currentPatch.masterVolume;

    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.5;

    this.masterGain.connect(this.analyser);
    this.analyser.connect(ctx.destination);
  }

  public getPatch(): WubSynthPatch {
    return { ...this.currentPatch };
  }

  public setPatch(patch: WubSynthPatch) {
    this.currentPatch = { ...patch };
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(patch.masterVolume, this.ctx.currentTime, 0.02);
    }
  }

  public updatePatchParam<K extends keyof WubSynthPatch>(key: K, value: WubSynthPatch[K]) {
    this.currentPatch[key] = value;
    if (key === 'masterVolume' && this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(value as number, this.ctx.currentTime, 0.02);
    }
  }

  /**
   * Convert MIDI note number (e.g. 36 = C2, 48 = C3) to frequency
   */
  public midiToFreq(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  /**
   * Calculate LFO frequency from sync rate at given BPM
   */
  public getLfoFrequency(sync: LfoRateSync, bpm: number, freeHz: number): number {
    if (sync === 'free') return freeHz;
    const beatSec = 60 / bpm;
    switch (sync) {
      case '1/1': return 1 / (beatSec * 4);
      case '1/2': return 1 / (beatSec * 2);
      case '1/4': return 1 / beatSec;
      case '1/4T': return 1 / (beatSec * (2 / 3));
      case '1/8': return 1 / (beatSec * 0.5);
      case '1/8T': return 1 / (beatSec * (1 / 3));
      case '1/16': return 1 / (beatSec * 0.25);
      case '1/16T': return 1 / (beatSec * (1 / 6));
      case '1/32': return 1 / (beatSec * 0.125);
      default: return 1 / (beatSec * 0.5);
    }
  }

  /**
   * Trigger note-on for live interactive play
   */
  public noteOn(note: number, velocity: number = 0.9, bpm: number = 140) {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      try { this.ctx.resume(); } catch (_) {}
    }

    // Safety: Polyphony limit (max 8 voices) prevents runaway oscillator accumulation on fast tapping
    if (this.allVoices.size >= 8) {
      const oldest = this.allVoices.values().next().value;
      if (oldest) {
        this.terminateVoice(oldest);
      }
    }

    // Release old voice if already playing this note
    const existing = this.activeNoteVoices.get(note);
    if (existing) {
      this.activeNoteVoices.delete(note);
      this.terminateVoice(existing);
    }

    // Also purge any lingering voice with the same note in allVoices
    for (const v of Array.from(this.allVoices)) {
      if (v.note === note) {
        this.terminateVoice(v);
      }
    }

    const now = this.ctx.currentTime;
    const patch = this.currentPatch;
    const freq = this.midiToFreq(note);

    const voiceOscillators: OscillatorNode[] = [];
    const voiceNodes: AudioNode[] = [];

    try {
      // Glide / Portamento from previous note
      const glideTime = this.lastNoteNumber !== null ? patch.glide : 0.002;
      this.lastNoteNumber = note;

      // Voice Gain Node (Amp Envelope)
      const voiceGain = this.ctx.createGain();
      voiceGain.gain.setValueAtTime(0, now);
      const a = Math.max(0.001, patch.ampEnv.attack);
      const d = Math.max(0.01, patch.ampEnv.decay);
      const s = Math.max(0, Math.min(1, patch.ampEnv.sustain));
      voiceGain.gain.linearRampToValueAtTime(velocity, now + a);
      voiceGain.gain.linearRampToValueAtTime(s * velocity, now + a + d);
      voiceNodes.push(voiceGain);

      // Filter Node
      const filter = this.ctx.createBiquadFilter();
      switch (patch.filter.type) {
        case 'highpass': filter.type = 'highpass'; break;
        case 'bandpass': filter.type = 'bandpass'; break;
        case 'comb': filter.type = 'peaking'; break;
        default: filter.type = 'lowpass'; break;
      }
      filter.frequency.setValueAtTime(patch.filter.cutoff, now);
      filter.Q.setValueAtTime(patch.filter.resonance, now);
      voiceNodes.push(filter);

      // Filter Envelope modulation
      if (patch.filter.envAmount !== 0) {
        const fEnvTarget = Math.max(20, Math.min(18000, patch.filter.cutoff * (1 + patch.filter.envAmount * 2)));
        try {
          filter.frequency.exponentialRampToValueAtTime(fEnvTarget, now + patch.filterEnv.attack);
          filter.frequency.exponentialRampToValueAtTime(patch.filter.cutoff, now + patch.filterEnv.attack + patch.filterEnv.decay);
        } catch (_) {}
      }

      // LFO Modulation Node
      if (patch.lfo.enabled) {
        const lfoFreq = this.getLfoFrequency(patch.lfo.rateSync, bpm, patch.lfo.freeHz);
        const lfoNode = this.ctx.createOscillator();
        lfoNode.frequency.setValueAtTime(lfoFreq, now);

        if (patch.lfo.waveform === 'square') lfoNode.type = 'square';
        else if (patch.lfo.waveform === 'saw') lfoNode.type = 'sawtooth';
        else if (patch.lfo.waveform === 'triangle') lfoNode.type = 'triangle';
        else lfoNode.type = 'sine';

        const lfoGain = this.ctx.createGain();
        const modHz = patch.filter.cutoff * 1.5 * patch.lfo.cutoffAmount;
        lfoGain.gain.setValueAtTime(modHz, now);

        lfoNode.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfoNode.start(now);

        voiceOscillators.push(lfoNode);
        this.activeOscillators.add(lfoNode);
        voiceNodes.push(lfoGain);
      }

      // Oscillators 1 & 2
      const osc1List: OscillatorNode[] = [];

      // Osc 1 (Main Carrier)
      if (patch.osc1.enabled) {
        const o1Semitones = patch.osc1.octave * 12 + patch.osc1.semi + patch.osc1.fine / 100;
        const o1BaseFreq = freq * Math.pow(2, o1Semitones / 12);
        const unison = Math.max(1, Math.min(5, patch.osc1.unison));

        for (let u = 0; u < unison; u++) {
          const osc = this.ctx.createOscillator();
          const detuneCents = unison > 1 ? (u - (unison - 1) / 2) * (patch.osc1.detuneSpread * 35) : 0;
          osc.type = patch.osc1.waveform === 'metallic' || patch.osc1.waveform === 'growl' ? 'sawtooth' : patch.osc1.waveform;
          osc.frequency.setValueAtTime(o1BaseFreq, now);
          if (glideTime > 0.005) {
            try {
              osc.frequency.exponentialRampToValueAtTime(o1BaseFreq, now + glideTime);
            } catch (_) {}
          }
          osc.detune.setValueAtTime(detuneCents, now);

          const oscGain = this.ctx.createGain();
          oscGain.gain.value = (patch.osc1.volume / unison) * 0.8;
          osc.connect(oscGain);
          oscGain.connect(filter);
          osc.start(now);

          osc1List.push(osc);
          voiceOscillators.push(osc);
          this.activeOscillators.add(osc);
          voiceNodes.push(oscGain);
        }
      }

      // Osc 2 (Modulator / Harmonic)
      if (patch.osc2.enabled) {
        const o2Semitones = patch.osc2.octave * 12 + patch.osc2.semi + patch.osc2.fine / 100;
        const o2BaseFreq = freq * Math.pow(2, o2Semitones / 12);
        const osc2 = this.ctx.createOscillator();
        osc2.type = patch.osc2.waveform === 'metallic' || patch.osc2.waveform === 'growl' ? 'sawtooth' : patch.osc2.waveform;
        osc2.frequency.setValueAtTime(o2BaseFreq, now);

        const osc2Gain = this.ctx.createGain();
        osc2Gain.gain.value = patch.osc2.volume * 0.7;
        osc2.connect(osc2Gain);
        osc2Gain.connect(filter);

        voiceOscillators.push(osc2);
        this.activeOscillators.add(osc2);
        voiceNodes.push(osc2Gain);

        // FM Cross-modulation to Osc 1 if enabled
        if (patch.fmDepth > 0 && osc1List.length > 0) {
          const fmGain = this.ctx.createGain();
          fmGain.gain.value = patch.fmDepth * 800;
          osc2.connect(fmGain);
          osc1List.forEach((o1) => fmGain.connect(o1.frequency));
          voiceNodes.push(fmGain);
        }

        osc2.start(now);
      }

      // Dedicated Sub Oscillator (Pure sine sub fundamental)
      const subOsc = this.ctx.createOscillator();
      subOsc.type = 'sine';
      const subFreq = freq * Math.pow(2, (patch.fx.subOctave * 12) / 12);
      subOsc.frequency.setValueAtTime(subFreq, now);
      const subGain = this.ctx.createGain();
      subGain.gain.value = patch.fx.subVol * 0.85;
      subOsc.connect(subGain);
      subGain.connect(voiceGain); // Sub bypasses resonant filter to stay clean
      subOsc.start(now);

      voiceOscillators.push(subOsc);
      this.activeOscillators.add(subOsc);
      voiceNodes.push(subGain);

      // Distortion WaveShaper
      if (patch.fx.distortionDrive > 0.05) {
        const distortionNode = this.ctx.createWaveShaper();
        distortionNode.curve = this.createDistortionCurve(patch.fx.distortionDrive, patch.fx.distortionType);
        filter.connect(distortionNode);
        distortionNode.connect(voiceGain);
        voiceNodes.push(distortionNode);
      } else {
        filter.connect(voiceGain);
      }

      voiceGain.connect(this.masterGain);

      const voiceId = ++this.voiceIdCounter;
      const voice: SynthActiveVoice = {
        id: voiceId,
        note,
        oscillators: voiceOscillators,
        nodes: voiceNodes,
        gain: voiceGain,
        cleanupTimer: null,
      };

      this.allVoices.add(voice);
      this.activeNoteVoices.set(note, voice);
    } catch (err) {
      console.error('WubSynthEngine noteOn error:', err);
      // Emergency cleanup on voice generation failure
      voiceOscillators.forEach((osc) => {
        try { osc.stop(); } catch (_) {}
        try { osc.disconnect(); } catch (_) {}
        this.activeOscillators.delete(osc);
      });
      voiceNodes.forEach((node) => {
        try { node.disconnect(); } catch (_) {}
      });
    }
  }

  /**
   * Trigger note-off
   */
  public noteOff(note: number) {
    if (!this.ctx) return;
    const voice = this.activeNoteVoices.get(note);
    if (voice) {
      this.activeNoteVoices.delete(note);
      this.releaseVoice(voice);
    }

    // Also check allVoices for any other voices with this note that might be lingering
    for (const v of Array.from(this.allVoices)) {
      if (v.note === note && v !== voice) {
        this.terminateVoice(v);
      }
    }
  }

  private releaseVoice(voice: SynthActiveVoice) {
    if (!this.ctx) {
      this.terminateVoice(voice);
      return;
    }
    const now = this.ctx.currentTime;
    const r = Math.max(0.01, Math.min(1.0, this.currentPatch.ampEnv.release));

    try {
      voice.gain.gain.cancelScheduledValues(now);
      const currentGain = Math.max(0.001, voice.gain.gain.value);
      voice.gain.gain.setValueAtTime(currentGain, now);
      voice.gain.gain.linearRampToValueAtTime(0, now + r);

      const stopTime = now + r + 0.02;
      voice.oscillators.forEach((o) => {
        try { o.stop(stopTime); } catch (_) {}
      });
    } catch (_) {
      // If ramp scheduling fails, terminate immediately
      this.terminateVoice(voice);
      return;
    }

    voice.cleanupTimer = setTimeout(() => {
      this.terminateVoice(voice);
    }, (r + 0.04) * 1000);
  }

  private terminateVoice(voice: SynthActiveVoice) {
    if (voice.cleanupTimer) {
      clearTimeout(voice.cleanupTimer);
      voice.cleanupTimer = null;
    }
    if (this.ctx) {
      try {
        const now = this.ctx.currentTime;
        voice.gain.gain.cancelScheduledValues(0);
        voice.gain.gain.setValueAtTime(0, now);
      } catch (_) {}
    }
    // Immediately stop and disconnect all voice oscillators
    voice.oscillators.forEach((osc) => {
      try { osc.stop(); } catch (_) {}
      try { osc.disconnect(); } catch (_) {}
      this.activeOscillators.delete(osc);
    });
    // Disconnect all voice nodes
    voice.nodes.forEach((node) => {
      try { node.disconnect(); } catch (_) {}
    });
    this.allVoices.delete(voice);
    if (this.activeNoteVoices.get(voice.note) === voice) {
      this.activeNoteVoices.delete(voice.note);
    }
  }

  /**
   * Emergency Panic / Stop All Notes:
   * Guarantees 100% immediate silence by stopping all active oscillators,
   * disconnecting all voice nodes, and physically recreating a fresh masterGain node.
   */
  public allNotesOff() {
    this.activeNoteVoices.clear();

    // 1. Terminate all known voice objects
    const living = Array.from(this.allVoices);
    living.forEach((voice) => {
      this.terminateVoice(voice);
    });
    this.allVoices.clear();

    // 2. Stop and disconnect every active oscillator in existence
    this.activeOscillators.forEach((osc) => {
      try { osc.stop(); } catch (_) {}
      try { osc.disconnect(); } catch (_) {}
    });
    this.activeOscillators.clear();

    // 3. PHYSICAL MASTER DISCONNECTION & RE-SEEDING
    // Disconnecting the existing masterGain physically cuts off ANY rogue audio node
    // that may have stayed attached. Re-creating a fresh masterGain guarantees absolute silence.
    if (this.ctx && this.analyser) {
      if (this.masterGain) {
        try {
          this.masterGain.gain.cancelScheduledValues(0);
          this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
          this.masterGain.disconnect();
        } catch (_) {}
      }

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.currentPatch.masterVolume;
      this.masterGain.connect(this.analyser);
    }
  }

  public panicKill() {
    this.allNotesOff();
  }

  /**
   * Create distortion lookup table for Web Audio WaveShaperNode
   */
  private createDistortionCurve(drive: number, type: DistortionType): Float32Array<ArrayBuffer> {
    const n = 512;
    const curve = new Float32Array(n);
    const k = drive * 40;

    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1;
      if (type === 'tube') {
        curve[i] = (1 + k) * x / (1 + k * Math.abs(x));
      } else if (type === 'hard') {
        curve[i] = Math.max(-0.85, Math.min(0.85, x * (1 + drive * 4)));
      } else if (type === 'hyper') {
        const s = Math.tanh(x * (1 + drive * 8));
        curve[i] = s + 0.2 * Math.sin(x * Math.PI * 4);
      } else {
        curve[i] = Math.tanh(x * (1 + drive * 3));
      }
    }
    return curve;
  }

  /**
   * Bake pattern: Generates a high-fidelity stereo AudioBuffer
   * of the patch rendered into rhythmic dubstep bars ready to load into any deck!
   */
  public bakePattern(
    bpm: number,
    bars: number,
    pattern: BakePatternType,
    rootNote: number = 36 // C2
  ): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext not initialized');
    const sr = this.ctx.sampleRate;
    const beatSec = 60 / bpm;
    const totalDuration = bars * 4 * beatSec;
    const numSamples = Math.floor(sr * totalDuration);

    const buffer = this.ctx.createBuffer(2, numSamples, sr);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    const patch = this.currentPatch;
    const rootFreq = this.midiToFreq(rootNote);

    // Precalculate note events for pattern
    const events: { start: number; length: number; freq: number; wubRate: number }[] = [];

    for (let bar = 0; bar < bars; bar++) {
      const barTime = bar * 4 * beatSec;

      if (pattern === 'continuous_wub') {
        // Continuous wobbling bass across the bars
        events.push({
          start: barTime,
          length: 4 * beatSec,
          freq: rootFreq,
          wubRate: this.getLfoFrequency(patch.lfo.rateSync, bpm, patch.lfo.freeHz),
        });
      } else if (pattern === 'halftime_drop') {
        // Heavy dubstep drop: Hit 1 (2 beats), Chop 2 (1 beat), Stutter 3 (1 beat)
        events.push({ start: barTime, length: 1.8 * beatSec, freq: rootFreq, wubRate: 1 / (beatSec * 0.5) });
        events.push({ start: barTime + 2 * beatSec, length: 0.9 * beatSec, freq: rootFreq * Math.pow(2, 3 / 12), wubRate: 1 / (beatSec * 0.25) });
        events.push({ start: barTime + 3 * beatSec, length: 0.8 * beatSec, freq: rootFreq, wubRate: 1 / (beatSec * 0.125) });
      } else if (pattern === 'stutter_chop') {
        // 1/8 note sync chops
        for (let b = 0; b < 8; b++) {
          if (b % 4 !== 3) {
            events.push({
              start: barTime + b * 0.5 * beatSec,
              length: 0.42 * beatSec,
              freq: b === 6 ? rootFreq * Math.pow(2, 5 / 12) : rootFreq,
              wubRate: 1 / (beatSec * 0.25),
            });
          }
        }
      } else if (pattern === 'arpeggiated') {
        // Minor triad arpeggio (Root, Minor 3rd, 5th, Octave)
        const scale = [0, 3, 7, 12, 7, 3, 0, 5];
        for (let step = 0; step < 8; step++) {
          events.push({
            start: barTime + step * 0.5 * beatSec,
            length: 0.45 * beatSec,
            freq: rootFreq * Math.pow(2, scale[step % scale.length] / 12),
            wubRate: 1 / (beatSec * 0.25),
          });
        }
      } else if (pattern === 'pitch_dive') {
        // 2-beat heavy sustained dive followed by sub boom
        events.push({ start: barTime, length: 3.6 * beatSec, freq: rootFreq, wubRate: 1 / (beatSec * 0.5) });
      } else {
        // One-shot growl hit
        events.push({ start: barTime, length: 3.0 * beatSec, freq: rootFreq, wubRate: 1 / (beatSec * 0.5) });
      }
    }

    // DSP Synthesis loop into buffer
    events.forEach((ev) => {
      const startSample = Math.floor(ev.start * sr);
      const lengthSamples = Math.floor(ev.length * sr);
      const endSample = Math.min(numSamples, startSample + lengthSamples);

      let p1 = 0, p2 = 0, pSub = 0;
      const f1 = ev.freq * Math.pow(2, (patch.osc1.octave * 12 + patch.osc1.semi) / 12);
      const f2 = ev.freq * Math.pow(2, (patch.osc2.octave * 12 + patch.osc2.semi) / 12);
      const fSub = ev.freq * Math.pow(2, (patch.fx.subOctave * 12) / 12);

      for (let s = startSample; s < endSample; s++) {
        const localT = (s - startSample) / sr;
        const localProg = (s - startSample) / lengthSamples;

        // Envelope
        const env = localProg < 0.04 ? localProg / 0.04 : Math.exp(-(localProg - 0.04) * 2.2);

        // LFO
        const lfoPhase = 2 * Math.PI * ev.wubRate * localT;
        const lfoVal = 0.5 + 0.5 * Math.sin(lfoPhase);

        // Oscillators
        p1 += (2 * Math.PI * f1) / sr;
        p2 += (2 * Math.PI * f2) / sr;
        pSub += (2 * Math.PI * fSub) / sr;

        const saw1 = (p1 % (2 * Math.PI)) / Math.PI - 1;
        const saw2 = (p2 % (2 * Math.PI)) / Math.PI - 1;
        const subSine = Math.sin(pSub) * patch.fx.subVol;

        // Vowel Formant / Filter modulation
        const filterCutoffMod = patch.filter.cutoff * (0.3 + 1.4 * lfoVal);
        const formantPhoneme = Math.sin(2 * Math.PI * filterCutoffMod * localT);

        const core = (saw1 * patch.osc1.volume + saw2 * patch.osc2.volume * 0.7 + formantPhoneme * 0.4) * env;
        const saturated = Math.tanh(core * (1 + patch.fx.distortionDrive * 3)) + subSine * env * 0.8;

        const sampleVal = saturated * patch.masterVolume * 0.8;
        left[s] += sampleVal;
        right[s] += sampleVal * (0.95 + 0.05 * Math.sin(localT * 8));
      }
    });

    // Soft master peak normalization
    let peak = 0;
    for (let i = 0; i < numSamples; i++) {
      const aL = Math.abs(left[i]);
      const aR = Math.abs(right[i]);
      if (aL > peak) peak = aL;
      if (aR > peak) peak = aR;
    }
    if (peak > 0.001) {
      const scale = 0.90 / peak;
      for (let i = 0; i < numSamples; i++) {
        left[i] = Math.tanh(left[i] * scale);
        right[i] = Math.tanh(right[i] * scale);
      }
    }

    return buffer;
  }
}

export const WubSynthEngine = new WubSynthEngineSingleton();
