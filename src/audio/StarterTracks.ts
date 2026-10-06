/**
 * Wub Works - Built-in Dubstep Starter Tracks
 * High-energy procedural dubstep compositions generated with Web Audio synthesis.
 * All content is 100% CC0 / Public Domain / Synth Lab creations.
 */

export interface StarterTrackMeta {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  keyStandard: string;
  subgenre: string;
  license: string;
  source: string;
  duration: number; // in seconds
}

export const STARTER_TRACKS: StarterTrackMeta[] = [
  {
    id: 'starter_1',
    title: 'CYBER WOBBLE 140',
    artist: 'Wub Works Labs',
    bpm: 140,
    key: '8A',
    keyStandard: 'Am',
    subgenre: 'Brostep / Heavy Bass',
    license: 'CC0 1.0 Universal (Public Domain)',
    source: 'Procedural Bass Synth Engine',
    duration: 32,
  },
  {
    id: 'starter_2',
    title: 'NEON RIDDIM PRESSURE',
    artist: 'Wub Works Labs',
    bpm: 142,
    key: '8A',
    keyStandard: 'Am',
    subgenre: 'Riddim / Trench',
    license: 'CC0 1.0 Universal (Public Domain)',
    source: 'Square Wave Chop Engine',
    duration: 32,
  },
  {
    id: 'starter_3',
    title: 'TEAROUT DESTRUCTION',
    artist: 'Wub Works Labs',
    bpm: 150,
    key: '9A',
    keyStandard: 'Em',
    subgenre: 'Tearout Dubstep',
    license: 'CC0 1.0 Universal (Public Domain)',
    source: 'Metallic FM Screech Generator',
    duration: 30,
  },
  {
    id: 'starter_4',
    title: 'AURORA HORIZON',
    artist: 'Wub Works Labs',
    bpm: 140,
    key: '7A',
    keyStandard: 'Dm',
    subgenre: 'Melodic / Color Bass',
    license: 'CC0 1.0 Universal (Public Domain)',
    source: 'Supersaw & Reese Synthesizer',
    duration: 32,
  },
];

/**
 * Procedurally synthesize a high-energy dubstep AudioBuffer on the fly!
 */
export function synthesizeStarterTrack(ctx: AudioContext, meta: StarterTrackMeta): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const bpm = meta.bpm;
  const beatSec = 60 / bpm;
  const totalBars = 16;
  const duration = totalBars * 4 * beatSec;
  const numSamples = Math.floor(sampleRate * duration);
  
  const buffer = ctx.createBuffer(2, numSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const rootFreq = meta.keyStandard.startsWith('A') ? 55 : meta.keyStandard.startsWith('E') ? 41.2 : 73.4;

  // Render loop bars
  for (let bar = 0; bar < totalBars; bar++) {
    const isBuild = bar >= 4 && bar < 8;
    const isDrop = bar >= 8 && bar < 14;
    const isOutro = bar >= 14;

    for (let beat = 0; beat < 4; beat++) {
      const beatTime = (bar * 4 + beat) * beatSec;
      const beatStartSample = Math.floor(beatTime * sampleRate);

      // --- KICK (Beats 0, and dynamic patterns) ---
      const hasKick = (beat === 0) || (isDrop && (beat === 2 && bar % 2 === 1)) || (isBuild && beat % (bar === 7 ? 0.5 : 1) === 0);
      if (hasKick) {
        renderKick(left, right, beatStartSample, sampleRate);
      }

      // --- SNARE / CLAP (Beat 2 in standard dubstep half-time) ---
      const hasSnare = beat === 2 || (isBuild && bar >= 6 && beat % 1 === 0);
      if (hasSnare) {
        renderSnare(left, right, beatStartSample, sampleRate);
      }

      // --- HI-HATS ---
      if (!isBuild || bar >= 6) {
        // Offbeat 8th hats
        const hatSample = Math.floor((beatTime + beatSec * 0.5) * sampleRate);
        renderHiHat(left, right, hatSample, sampleRate);
        if (isDrop) {
          // 16th hats
          renderHiHat(left, right, Math.floor((beatTime + beatSec * 0.25) * sampleRate), sampleRate, 0.4);
          renderHiHat(left, right, Math.floor((beatTime + beatSec * 0.75) * sampleRate), sampleRate, 0.4);
        }
      }
    }

    // --- BASS WUB / GROWL SYNTHESIS ---
    const barStartSample = Math.floor(bar * 4 * beatSec * sampleRate);
    const barSamples = Math.floor(4 * beatSec * sampleRate);

    if (isDrop) {
      // Signature Heavy Dubstep Drop
      renderWubBass(left, right, barStartSample, barSamples, sampleRate, rootFreq, meta.id);
    } else if (isBuild) {
      // Rising pitch riser & laser snare roll
      renderBuildup(left, right, barStartSample, barSamples, sampleRate, rootFreq);
    } else {
      // Intro / Outro Atmospheric Reese & Sub
      renderAtmosphere(left, right, barStartSample, barSamples, sampleRate, rootFreq);
    }
  }

  // Soft master normalize
  let peak = 0;
  for (let i = 0; i < numSamples; i++) {
    const absL = Math.abs(left[i]);
    const absR = Math.abs(right[i]);
    if (absL > peak) peak = absL;
    if (absR > peak) peak = absR;
  }
  if (peak > 0.01) {
    const targetPeak = 0.92;
    const gain = targetPeak / peak;
    for (let i = 0; i < numSamples; i++) {
      left[i] *= gain;
      right[i] *= gain;
    }
  }

  return buffer;
}

function renderKick(left: Float32Array, right: Float32Array, start: number, sr: number) {
  const kickLength = Math.floor(sr * 0.35);
  for (let i = 0; i < kickLength && start + i < left.length; i++) {
    const t = i / sr;
    const env = Math.exp(-t * 18);
    // Pitch drops from 150 Hz to 45 Hz
    const freq = 45 + 115 * Math.exp(-t * 35);
    const phase = 2 * Math.PI * freq * t;
    const sample = Math.sin(phase) * env * 0.85;
    left[start + i] += sample;
    right[start + i] += sample;
  }
}

function renderSnare(left: Float32Array, right: Float32Array, start: number, sr: number) {
  const snareLength = Math.floor(sr * 0.28);
  for (let i = 0; i < snareLength && start + i < left.length; i++) {
    const t = i / sr;
    const tonalEnv = Math.exp(-t * 22);
    const noiseEnv = Math.exp(-t * 14);
    // Tonal body around 180 Hz
    const tonal = Math.sin(2 * Math.PI * 185 * t) * tonalEnv * 0.5;
    // Noise snap with stereo spread
    const nL = (Math.random() * 2 - 1) * noiseEnv * 0.65;
    const nR = (Math.random() * 2 - 1) * noiseEnv * 0.65;
    left[start + i] += tonal + nL;
    right[start + i] += tonal + nR;
  }
}

function renderHiHat(left: Float32Array, right: Float32Array, start: number, sr: number, vol = 0.5) {
  const hatLength = Math.floor(sr * 0.05);
  for (let i = 0; i < hatLength && start + i < left.length; i++) {
    const t = i / sr;
    const env = Math.exp(-t * 85);
    const noise = (Math.random() * 2 - 1) * env * vol * 0.4;
    left[start + i] += noise;
    right[start + i] += noise;
  }
}

function renderWubBass(left: Float32Array, right: Float32Array, start: number, length: number, sr: number, rootFreq: number, trackId: string) {
  // Dubstep LFO frequency wobble rates
  const lfoRates = trackId.includes('riddim') ? [4, 4, 8, 4] : [2, 4, 8, 16];

  for (let i = 0; i < length && start + i < left.length; i++) {
    const t = i / sr;
    const quarter = Math.min(3, Math.floor(t * 2));
    const lfoRate = lfoRates[quarter % lfoRates.length];
    
    // Wobble LFO between 0 and 1
    const lfo = 0.5 + 0.5 * Math.sin(2 * Math.PI * lfoRate * t);
    
    // Sub oscillator (pure sine)
    const sub = Math.sin(2 * Math.PI * rootFreq * t) * 0.6;
    
    // Mid growl oscillator (distorted saw + square)
    const saw = (2 * ((rootFreq * 2 * t) % 1) - 1);
    const sq = Math.sin(2 * Math.PI * (rootFreq * 3) * t) > 0 ? 0.4 : -0.4;
    
    // Frequency filter cutoff modulation
    const growl = (saw + sq) * lfo * 0.7;
    // Soft saturation distortion
    const saturated = Math.tanh(growl * 2.2);

    const outL = (sub + saturated * 0.8) * 0.6;
    const outR = (sub + saturated * 0.85) * 0.6; // slight stereo width

    left[start + i] += outL;
    right[start + i] += outR;
  }
}

function renderBuildup(left: Float32Array, right: Float32Array, start: number, length: number, sr: number, rootFreq: number) {
  for (let i = 0; i < length && start + i < left.length; i++) {
    const t = i / sr;
    const progress = i / length;
    // Exponential pitch riser sweep
    const freq = rootFreq * (1 + progress * 5);
    const saw = 2 * ((freq * t) % 1) - 1;
    const amp = progress * 0.45;
    const pan = Math.sin(t * 8) * 0.3;

    left[start + i] += saw * amp * (0.5 - pan);
    right[start + i] += saw * amp * (0.5 + pan);
  }
}

function renderAtmosphere(left: Float32Array, right: Float32Array, start: number, length: number, sr: number, rootFreq: number) {
  for (let i = 0; i < length && start + i < left.length; i++) {
    const t = i / sr;
    // Detuned rich reese bass
    const osc1 = Math.sin(2 * Math.PI * rootFreq * t);
    const osc2 = Math.sin(2 * Math.PI * (rootFreq * 1.015) * t);
    const osc3 = Math.sin(2 * Math.PI * (rootFreq * 0.985) * t);
    const reese = (osc1 + osc2 + osc3) * 0.25;

    left[start + i] += reese;
    right[start + i] += reese;
  }
}
