/**
 * Wub Works - Core Type Definitions
 */

export type DeckId = 'A' | 'B' | 'C' | 'D';

export interface HotCue {
  id: number;
  position: number; // in seconds
  label: string;
  color: string;
}

export interface LoopState {
  active: boolean;
  start: number;
  end: number;
  lengthBeats: number;
  isRoll: boolean;
  rollResumePosition?: number;
}

export interface SpectralAnalysis {
  lows: Float32Array;
  mids: Float32Array;
  highs: Float32Array;
  duration: number;
  energySegments: { start: number; end: number; type: 'intro' | 'build' | 'drop' | 'breakdown' | 'outro'; color: string }[];
}

export interface DeckState {
  id: DeckId;
  trackName: string;
  artist: string;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  cuePoint: number;
  bpm: number;
  detectedBpm: number;
  key: string;            // e.g. "8A"
  keyStandard: string;    // e.g. "Am"
  keyshift: number;       // semitones -12 to +12
  tempoPercent: number;   // pitch fader -100 to +100 %
  tempoRange: 4 | 8 | 16 | 50 | 100;
  keyLock: boolean;       // Master tempo
  isSync: boolean;
  isMaster: boolean;
  isSlip: boolean;
  isReverse: boolean;
  isBraking: boolean;
  hotCues: HotCue[];
  loop: LoopState;
  beatGridOffset: number; // in seconds
  colorAccent: string;
}

export type FXType = 'wobble' | 'echo' | 'reverb' | 'flanger' | 'phaser' | 'bitcrush' | 'gate';

export interface FXSlotState {
  type: FXType;
  enabled: boolean;
  dryWet: number; // 0 to 1
  param1: number; // Wobble: rate (e.g. 1/8, 1/4), Echo: time/beats, Reverb: decay, Bitcrush: bits, etc.
  param2: number; // Resonance, Feedback, Size, etc.
  param3: number; // Cutoff, Damping, etc.
}

export interface ChannelMixerState {
  gain: number;        // dB -12 to +12
  eqHigh: number;      // dB -24 to +6
  eqMid: number;       // dB -24 to +6
  eqLow: number;       // dB -24 to +6
  killHigh: boolean;
  killMid: boolean;
  killLow: boolean;
  filter: number;      // -1 (Lowpass) to +1 (Highpass), 0 neutral
  volume: number;      // 0 to 1
  vuLeft: number;      // 0 to 1
  vuRight: number;     // 0 to 1
  isClipping?: boolean;// True when audio signal exceeds 0dB
  freqLow: number;     // 0 to 1 real-time Low frequency band level (post-EQ)
  freqMid: number;     // 0 to 1 real-time Mid frequency band level (post-EQ)
  freqHigh: number;    // 0 to 1 real-time High frequency band level (post-EQ)
  pflCue: boolean;     // Headphone monitoring
  fx1: FXSlotState;
  fx2: FXSlotState;
  crossfaderAssign: 'A' | 'THRU' | 'B';
}

export type CrossfaderCurve = 'smooth' | 'linear' | 'cut';

export interface MixerMasterState {
  masterVolume: number;
  masterVuLeft: number;
  masterVuRight: number;
  isClipping?: boolean;
  crossfader: number; // -1 (Deck A) to +1 (Deck B)
  crossfaderCurve: CrossfaderCurve;
  crossfaderHamster: boolean; // reverse
  headphoneVolume: number;
  headphoneCueMix: number; // 0 (cue) to 1 (master)
  isRecording: boolean;
  recordingSeconds: number;
}

export interface MidiMapping {
  controlId: string;
  channel: number;
  identifier: number; // CC or Note number
  type: 'cc' | 'note';
  description?: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  primary: string;
  deckA: string;
  deckB: string;
  deckC: string;
  deckD: string;
  mixerCardBg: string;
  accentGlow: string;
}

export type AppLayoutMode = 'perform' | 'compact' | 'pro4';
