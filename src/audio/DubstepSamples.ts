/**
 * Wub Works - Built-in Dubstep Sound Effect Samples
 * Procedural Web Audio sound design for authentic bass music performance:
 * Sub drops, monster growls, riddim lasers, gunshots, risers, airhorns, and vocal chops.
 * 100% CC0 / Public Domain / Synthesized in-browser without external network calls.
 */

export type SampleCategory = 'bass' | 'gunshot_laser' | 'riser_sweep' | 'vocal' | 'impact_slam';

export interface DubstepSampleMeta {
  id: string;
  name: string;
  category: SampleCategory;
  duration: number; // in seconds
  bpm: number;
  key?: string;
  keyStandard?: string;
  description: string;
  tags: string[];
  color: string;
}

export const DUBSTEP_SAMPLES: DubstepSampleMeta[] = [
  // --- BASS SHOTS & GROWLS ---
  {
    id: 'sfx_mutant_growl',
    name: 'MUTANT CYBER GROWL',
    category: 'bass',
    duration: 2.2,
    bpm: 140,
    key: '8A',
    keyStandard: 'Am',
    description: 'Furious FM metallic vowel growl with heavy formant bandpass sweep and Chebyshev drive.',
    tags: ['Growl', 'Tearout', 'FM Synth', 'Heavy'],
    color: '#00f2fe',
  },
  {
    id: 'sfx_sub_bomb_808',
    name: 'SUB BASS DROP 808',
    category: 'bass',
    duration: 3.2,
    bpm: 140,
    key: '1A',
    keyStandard: 'Abm',
    description: 'Chest-rattling pitch-drop sub boom falling from 135Hz down to 28Hz with analog tape saturation.',
    tags: ['Sub Drop', '808', 'Boom', 'Low End'],
    color: '#ec4899',
  },
  {
    id: 'sfx_reese_wobble',
    name: 'REESE WOBBLE CHOP',
    category: 'bass',
    duration: 2.8,
    bpm: 140,
    key: '9A',
    keyStandard: 'Em',
    description: 'Triple detuned sawtooth Reese bass modulated by 1/8 note rhythmic wobble LFO with resonant filter.',
    tags: ['Reese', 'Wobble', 'LFO', 'Chop'],
    color: '#a855f7',
  },
  {
    id: 'sfx_neon_yoi',
    name: 'NEON YOI TALKBOX',
    category: 'bass',
    duration: 2.0,
    bpm: 140,
    key: '8A',
    keyStandard: 'Am',
    description: 'Classic riddim dual-formant talkbox vowel glide morphing between "Y" and "OI".',
    tags: ['Riddim', 'Yoi', 'Formant', 'Talkbox'],
    color: '#06b6d4',
  },

  // --- GUNSHOTS & LASERS ---
  {
    id: 'sfx_laser_zap',
    name: 'CHOPPER LASER 3000',
    category: 'gunshot_laser',
    duration: 1.4,
    bpm: 140,
    description: 'Razor-sharp exponential square-wave chirp laser zap with feedback resonance and stereo flutter.',
    tags: ['Laser', 'Zap', 'Riddim', 'High Pitch'],
    color: '#f59e0b',
  },
  {
    id: 'sfx_pump_shotgun',
    name: 'PUMP SHOTGUN BLAST',
    category: 'gunshot_laser',
    duration: 2.0,
    bpm: 140,
    description: 'Mechanical pump-action chambering click followed by a brutal gunpowder explosion and sub tail.',
    tags: ['Shotgun', 'Cock', 'Blast', 'Gunshot'],
    color: '#ef4444',
  },
  {
    id: 'sfx_mech_lock',
    name: 'HEAVY MECH COCK & LOCK',
    category: 'gunshot_laser',
    duration: 1.5,
    bpm: 140,
    description: 'Crisp layered industrial ratchet slide with metallic spring recoil and tactile punch.',
    tags: ['Reload', 'Mechanical', 'Industrial', 'Click'],
    color: '#f97316',
  },
  {
    id: 'sfx_ion_cannon',
    name: 'ION PARTICLE BEAM',
    category: 'gunshot_laser',
    duration: 2.6,
    bpm: 140,
    description: 'High-frequency descending comb-filtered energy beam sweep with stereo flanger dispersal.',
    tags: ['Sci-Fi', 'Beam', 'Energy', 'Cannon'],
    color: '#3b82f6',
  },

  // --- RISERS & TRANSITIONS ---
  {
    id: 'sfx_noise_uplifter',
    name: 'WHITE NOISE UPLIFTER',
    category: 'riser_sweep',
    duration: 6.8,
    bpm: 140,
    description: '4-bar accelerating filtered white noise riser with rising pitch envelope and stereo wash.',
    tags: ['Riser', 'Uplifter', 'Build-Up', 'Sweep'],
    color: '#10b981',
  },
  {
    id: 'sfx_emergency_siren',
    name: 'CYBER EMERGENCY SIREN',
    category: 'riser_sweep',
    duration: 4.2,
    bpm: 140,
    description: 'Two-tone oscillating war-horn warning siren with analog tape flutter and ping-pong delay echoes.',
    tags: ['Siren', 'Alert', 'Echo', 'Tension'],
    color: '#eab308',
  },
  {
    id: 'sfx_airhorn_triple',
    name: 'SOUNDBOY TRIPLE AIRHORN',
    category: 'riser_sweep',
    duration: 2.4,
    bpm: 140,
    description: 'Classic soundclash staccato brass airhorn triad fanfare with analog delay taps.',
    tags: ['Airhorn', 'Reggae', 'Soundclash', 'Hype'],
    color: '#f43f5e',
  },
  {
    id: 'sfx_glitch_rewind',
    name: 'VINYL SPINBACK REWIND',
    category: 'riser_sweep',
    duration: 1.8,
    bpm: 140,
    description: 'High-torque turntable needle scratch spinback decelerating into reverse sub whoosh.',
    tags: ['Scratch', 'Rewind', 'Spinback', 'Vinyl'],
    color: '#14b8a6',
  },

  // --- VOCAL SHOUTS & CHANTS ---
  {
    id: 'sfx_drop_it_vox',
    name: 'ROBOTIC VOX: DROP IT!',
    category: 'vocal',
    duration: 1.8,
    bpm: 140,
    key: '8A',
    keyStandard: 'Am',
    description: 'Synthesized vocoded speech formant syllables pronouncing an aggressive "DROP IT!" chant.',
    tags: ['Vocal', 'Pre-Drop', 'Robot', 'Vox'],
    color: '#8b5cf6',
  },
  {
    id: 'sfx_fire_vox',
    name: 'CYBER SHOUT: FIRE!',
    category: 'vocal',
    duration: 1.5,
    bpm: 140,
    description: 'Distorted high-energy vocal chant burst saturated with bitcrushed slapback delay.',
    tags: ['Vocal', 'Fire', 'Shout', 'Hype'],
    color: '#ff0055',
  },
  {
    id: 'sfx_wub_talkbox',
    name: 'TALKBOX: WUB THE BASS',
    category: 'vocal',
    duration: 2.2,
    bpm: 140,
    description: 'Pitched talkbox vowel modulation chant repeating "W-U-B" over a resonant sawtooth core.',
    tags: ['Talkbox', 'Wub', 'Vocal', 'Funky'],
    color: '#00e5ff',
  },

  // --- IMPACTS & SLAMS ---
  {
    id: 'sfx_titan_slam',
    name: 'TITAN REVERB SUB SLAM',
    category: 'impact_slam',
    duration: 3.8,
    bpm: 140,
    description: 'Cinematic heavyweight impact with crack transient, sub bass seismic boom, and cavernous reverb wash.',
    tags: ['Impact', 'Slam', 'Cinematic', 'Sub Boom'],
    color: '#6366f1',
  },
  {
    id: 'sfx_anvil_tearout',
    name: 'TEAROUT ANVIL IMPACT',
    category: 'impact_slam',
    duration: 2.4,
    bpm: 140,
    description: 'Extreme high-frequency resonant industrial metal clank over distorted tearout sub punch.',
    tags: ['Anvil', 'Metallic', 'Tearout', 'Industrial'],
    color: '#e11d48',
  },
  {
    id: 'sfx_downshifter',
    name: 'CYBER DOWNSHIFTER',
    category: 'impact_slam',
    duration: 3.0,
    bpm: 140,
    description: 'Exponential pitch drop with stepped sample-and-hold bitcrusher resonance dying into the subfloor.',
    tags: ['Downlifter', 'Glitch', 'Sub', 'Bitcrush'],
    color: '#d946ef',
  },
];

// AudioBuffer cache so repetitive playback/drag is instantaneous
const sampleCache = new Map<string, AudioBuffer>();

/**
 * Procedurally synthesize a high-impact dubstep sound effect AudioBuffer
 */
export function synthesizeDubstepSample(ctx: AudioContext, meta: DubstepSampleMeta): AudioBuffer {
  const cached = sampleCache.get(meta.id);
  if (cached) return cached;

  const sr = ctx.sampleRate;
  const numSamples = Math.floor(sr * meta.duration);
  const buffer = ctx.createBuffer(2, numSamples, sr);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  switch (meta.id) {
    case 'sfx_mutant_growl':
      renderMutantGrowl(left, right, sr, meta.duration);
      break;
    case 'sfx_sub_bomb_808':
      renderSubBomb(left, right, sr, meta.duration);
      break;
    case 'sfx_reese_wobble':
      renderReeseWobble(left, right, sr, meta.duration);
      break;
    case 'sfx_neon_yoi':
      renderNeonYoi(left, right, sr, meta.duration);
      break;
    case 'sfx_laser_zap':
      renderLaserZap(left, right, sr, meta.duration);
      break;
    case 'sfx_pump_shotgun':
      renderPumpShotgun(left, right, sr, meta.duration);
      break;
    case 'sfx_mech_lock':
      renderMechLock(left, right, sr, meta.duration);
      break;
    case 'sfx_ion_cannon':
      renderIonCannon(left, right, sr, meta.duration);
      break;
    case 'sfx_noise_uplifter':
      renderNoiseUplifter(left, right, sr, meta.duration);
      break;
    case 'sfx_emergency_siren':
      renderEmergencySiren(left, right, sr, meta.duration);
      break;
    case 'sfx_airhorn_triple':
      renderAirhornTriple(left, right, sr, meta.duration);
      break;
    case 'sfx_glitch_rewind':
      renderGlitchRewind(left, right, sr, meta.duration);
      break;
    case 'sfx_drop_it_vox':
      renderDropItVox(left, right, sr, meta.duration);
      break;
    case 'sfx_fire_vox':
      renderFireVox(left, right, sr, meta.duration);
      break;
    case 'sfx_wub_talkbox':
      renderWubTalkbox(left, right, sr, meta.duration);
      break;
    case 'sfx_titan_slam':
      renderTitanSlam(left, right, sr, meta.duration);
      break;
    case 'sfx_anvil_tearout':
      renderAnvilTearout(left, right, sr, meta.duration);
      break;
    case 'sfx_downshifter':
      renderDownshifter(left, right, sr, meta.duration);
      break;
    default:
      renderSubBomb(left, right, sr, meta.duration);
      break;
  }

  // Soft peak normalize to 0.90 to ensure clean headroom without distortion
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

  sampleCache.set(meta.id, buffer);
  return buffer;
}

// -------------------------------------------------------------
// INDIVIDUAL SOUND EFFECT SYNTHESIS PROCEDURES
// -------------------------------------------------------------

function renderMutantGrowl(L: Float32Array, R: Float32Array, sr: number, dur: number) {
  const n = L.length;
  let phaseCarrier = 0;
  let phaseMod = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const progress = t / dur;
    const env = progress < 0.05 ? progress / 0.05 : Math.exp(-(progress - 0.05) * 2.5);

    // Dynamic pitch bend & FM
    const carrierFreq = 55 + 20 * Math.sin(2 * Math.PI * 1.5 * t);
    const modFreq = carrierFreq * 2.0;
    const modIndex = 4.5 * (1 + 0.8 * Math.sin(2 * Math.PI * 3.5 * t));

    phaseMod += (2 * Math.PI * modFreq) / sr;
    const modVal = Math.sin(phaseMod) * modIndex;

    phaseCarrier += (2 * Math.PI * (carrierFreq + modVal * 25)) / sr;
    const raw = Math.sin(phaseCarrier);

    // Formant filter glide emulation
    const formantSweep = 600 + 1200 * Math.sin(Math.PI * progress);
    const formantHarmonic = Math.sin(2 * Math.PI * formantSweep * t) * 0.4;

    // Heavy soft saturation
    const sample = Math.tanh((raw + formantHarmonic) * 2.8) * env;
    L[i] = sample;
    R[i] = sample * (0.95 + 0.05 * Math.sin(t * 12));
  }
}

function renderSubBomb(L: Float32Array, R: Float32Array, sr: number, dur: number) {
  const n = L.length;
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const env = Math.exp(-t * 1.25);
    // Exponential pitch sweep from 135Hz down to 28Hz
    const freq = 28 + 107 * Math.exp(-t * 3.8);
    phase += (2 * Math.PI * freq) / sr;
    // Layered fundamental with subtle 2nd harmonic warmth
    const sub = Math.sin(phase) + 0.25 * Math.sin(phase * 2) * Math.exp(-t * 4);
    const sample = Math.tanh(sub * 1.4) * env;
    L[i] = sample;
    R[i] = sample;
  }
}

function renderReeseWobble(L: Float32Array, R: Float32Array, sr: number, dur: number) {
  const n = L.length;
  const f0 = 41.2; // E1
  let p1 = 0, p2 = 0, p3 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const env = t < 0.04 ? t / 0.04 : Math.exp(-t * 0.8);
    // 1/8 note rhythmic wobble at 140 BPM (4.66 Hz)
    const wobbleLfo = 0.5 + 0.5 * Math.sin(2 * Math.PI * 4.66 * t);

    p1 += (2 * Math.PI * f0) / sr;
    p2 += (2 * Math.PI * (f0 * 1.012)) / sr;
    p3 += (2 * Math.PI * (f0 * 0.988)) / sr;

    const saw1 = (p1 % (2 * Math.PI)) / Math.PI - 1;
    const saw2 = (p2 % (2 * Math.PI)) / Math.PI - 1;
    const saw3 = (p3 % (2 * Math.PI)) / Math.PI - 1;

    const reeseL = (saw1 + saw2) * wobbleLfo;
    const reeseR = (saw1 + saw3) * wobbleLfo;

    L[i] = Math.tanh(reeseL * 2.2) * env;
    R[i] = Math.tanh(reeseR * 2.2) * env;
  }
}

function renderNeonYoi(L: Float32Array, R: Float32Array, sr: number, dur: number) {
  const n = L.length;
  const f0 = 55; // A1
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const env = t < 0.03 ? t / 0.03 : Math.exp(-t * 1.5);
    // Y-O-I modulation cycle (2 cycles)
    const mod = 0.5 + 0.5 * Math.sin(2 * Math.PI * 2.2 * t);
    phase += (2 * Math.PI * f0) / sr;
    const saw = (phase % (2 * Math.PI)) / Math.PI - 1;

    // Formant 1: 300 to 800 Hz
    const f1 = 300 + 500 * mod;
    // Formant 2: 1200 to 2200 Hz
    const f2 = 1200 + 1000 * (1 - mod);

    const formants = Math.sin(2 * Math.PI * f1 * t) * 0.5 + Math.sin(2 * Math.PI * f2 * t) * 0.4;
    const sample = Math.tanh((saw + formants) * 2.5) * env;
    L[i] = sample;
    R[i] = sample;
  }
}

function renderLaserZap(L: Float32Array, R: Float32Array, sr: number, dur: number) {
  const n = L.length;
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const env = Math.exp(-t * 5.5);
    // Rapid exponential chirp down
    const freq = 60 + 3600 * Math.exp(-t * 26);
    phase += (2 * Math.PI * freq) / sr;
    // Square wave laser character
    const sq = Math.sign(Math.sin(phase));
    const sample = sq * env * 0.85;

    // Echo slapback at 90ms
    const echoIdx = i - Math.floor(sr * 0.09);
    const echo = echoIdx > 0 ? L[echoIdx] * 0.35 : 0;

    L[i] = sample + echo;
    R[i] = sample + echo * 0.8;
  }
}

function renderPumpShotgun(L: Float32Array, R: Float32Array, sr: number, dur: number) {
  const n = L.length;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    let sL = 0;
    let sR = 0;

    // 1. Mechanical slide forward (t = 0.05s)
    if (t >= 0.05 && t < 0.22) {
      const dt = t - 0.05;
      const clickEnv = Math.exp(-dt * 28);
      const metal = Math.sin(2 * Math.PI * 1800 * dt) * clickEnv * 0.3;
      const noise = (Math.random() * 2 - 1) * clickEnv * 0.4;
      sL += metal + noise;
      sR += metal * 0.8 + noise;
    }

    // 2. Cocking lock click (t = 0.26s)
    if (t >= 0.26 && t < 0.40) {
      const dt = t - 0.26;
      const lockEnv = Math.exp(-dt * 45);
      const click = Math.sin(2 * Math.PI * 2600 * dt) * lockEnv * 0.6;
      sL += click;
      sR += click;
    }

    // 3. Blast firing explosion (t = 0.45s)
    if (t >= 0.45) {
      const dt = t - 0.45;
      const blastEnv = Math.exp(-dt * 6.5);
      const subEnv = Math.exp(-dt * 2.2);

      // Gunpowder transient noise burst
      const noiseBlast = (Math.random() * 2 - 1) * blastEnv * 0.9;
      // Sub impact
      const subBoom = Math.sin(2 * Math.PI * (45 + 90 * Math.exp(-dt * 15)) * dt) * subEnv * 0.85;

      const blast = Math.tanh((noiseBlast + subBoom) * 2.2);
      sL += blast;
      sR += blast;
    }

    L[i] = sL;
    R[i] = sR;
  }
}

function renderMechLock(L: Float32Array, R: Float32Array, sr: number, dur: number) {
  const n = L.length;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    let s = 0;
    // Rapid 3-click ratchet slide
    [0.05, 0.12, 0.22, 0.38].forEach((clickTime, idx) => {
      if (t >= clickTime) {
        const dt = t - clickTime;
        const env = Math.exp(-dt * (idx === 3 ? 25 : 65));
        const freq = idx === 3 ? 750 : 2200 + idx * 400;
        const tonal = Math.sin(2 * Math.PI * freq * dt) * env * 0.6;
        const noise = (Math.random() * 2 - 1) * env * 0.5;
        s += tonal + noise;
      }
    });
    L[i] = Math.tanh(s);
    R[i] = Math.tanh(s * 0.92);
  }
}

function renderIonCannon(L: Float32Array, R: Float32Array, sr: number, dur: number) {
  const n = L.length;
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const env = t < 0.05 ? t / 0.05 : Math.exp(-t * 1.1);
    // Swept resonance beam
    const freq = 120 + 2400 * Math.exp(-t * 1.8);
    phase += (2 * Math.PI * freq) / sr;
    const beam = Math.sin(phase) + 0.5 * Math.sin(phase * 1.5);
    const flanger = Math.sin(2 * Math.PI * (t * 8));

    L[i] = Math.tanh(beam * 1.8) * env * (1 + 0.2 * flanger);
    R[i] = Math.tanh(beam * 1.8) * env * (1 - 0.2 * flanger);
  }
}

function renderNoiseUplifter(L: Float32Array, R: Float32Array, sr: number, dur: number) {
  const n = L.length;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const progress = t / dur;
    // Exponential rising energy curve
    const env = Math.pow(progress, 1.8);
    // Accelerating stutter LFO
    const lfoRate = 2 + 16 * Math.pow(progress, 2);
    const gate = 0.5 + 0.5 * Math.sin(2 * Math.PI * lfoRate * t);

    const noiseL = (Math.random() * 2 - 1) * env * gate;
    const noiseR = (Math.random() * 2 - 1) * env * gate;

    // Highpass glide
    const risingTone = Math.sin(2 * Math.PI * (200 + 4000 * Math.pow(progress, 2)) * t) * env * 0.35;

    L[i] = Math.tanh(noiseL + risingTone);
    R[i] = Math.tanh(noiseR + risingTone);
  }
}

function renderEmergencySiren(L: Float32Array, R: Float32Array, sr: number, dur: number) {
  const n = L.length;
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const env = t < 0.1 ? t / 0.1 : Math.exp(-t * 0.5);
    // Alternating two-tone siren (frequency flips every 0.3s)
    const cycle = Math.floor(t / 0.35) % 2;
    const targetFreq = cycle === 0 ? 880 : 1174;
    phase += (2 * Math.PI * targetFreq) / sr;
    const siren = Math.sin(phase) * 0.7;

    // Analog tape wobble
    const wobble = Math.sin(2 * Math.PI * 6.5 * t) * 0.04;
    L[i] = siren * env * (1 + wobble);
    R[i] = siren * env * (1 - wobble);
  }
}

function renderAirhornTriple(L: Float32Array, R: Float32Array, sr: number, dur: number) {
  const n = L.length;
  const burstTimes = [0.05, 0.45, 0.95];
  const burstLength = 0.28;
  // Multi-tone soundclash brass chord (Bb, D, F)
  const freqs = [466.16, 587.33, 698.46, 932.33];

  for (let i = 0; i < n; i++) {
    const t = i / sr;
    let s = 0;
    burstTimes.forEach((bt) => {
      if (t >= bt && t < bt + burstLength) {
        const dt = t - bt;
        const env = Math.sin((dt / burstLength) * Math.PI);
        let chord = 0;
        freqs.forEach((f, idx) => {
          chord += Math.sin(2 * Math.PI * f * dt) * (0.8 / (idx + 1));
        });
        s += Math.tanh(chord * 2.0) * env;
      }
    });

    // Reverb / delay reflection
    const delaySample = i > sr * 0.18 ? L[i - Math.floor(sr * 0.18)] * 0.35 : 0;
    L[i] = s + delaySample;
    R[i] = s + delaySample * 0.8;
  }
}

function renderGlitchRewind(L: Float32Array, R: Float32Array, sr: number, dur: number) {
  const n = L.length;
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const progress = t / dur;
    const env = progress < 0.8 ? 1 : (1 - progress) / 0.2;
    // Decelerating rewind speed
    const speed = Math.max(0.1, 1 - progress);
    const freq = 120 + 2800 * speed;
    phase += (2 * Math.PI * freq) / sr;
    const scratch = (Math.sin(phase) + (Math.random() * 2 - 1) * 0.3) * env;

    L[i] = Math.tanh(scratch * 1.8);
    R[i] = Math.tanh(scratch * 1.6);
  }
}

function renderDropItVox(L: Float32Array, R: Float32Array, sr: number, dur: number) {
  const n = L.length;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    let s = 0;

    // Word 1: "DROP" (t: 0.1 to 0.65s)
    if (t >= 0.1 && t < 0.65) {
      const dt = t - 0.1;
      const env = Math.sin((dt / 0.55) * Math.PI);
      const carrier = (Math.sin(2 * Math.PI * 110 * dt) > 0 ? 1 : -1) * 0.5;
      const f1 = Math.sin(2 * Math.PI * 450 * dt) * 0.6;
      const f2 = Math.sin(2 * Math.PI * 1100 * dt) * 0.5;
      const f3 = Math.sin(2 * Math.PI * 2200 * dt) * 0.3;
      s += Math.tanh((carrier + f1 + f2 + f3) * 2.5) * env;
    }

    // Word 2: "IT!" (t: 0.72 to 1.35s)
    if (t >= 0.72 && t < 1.35) {
      const dt = t - 0.72;
      const env = Math.sin((dt / 0.63) * Math.PI);
      const carrier = (Math.sin(2 * Math.PI * 135 * dt) > 0 ? 1 : -1) * 0.5;
      const f1 = Math.sin(2 * Math.PI * 320 * dt) * 0.5;
      const f2 = Math.sin(2 * Math.PI * 2300 * dt) * 0.7;
      s += Math.tanh((carrier + f1 + f2) * 2.8) * env;
    }

    L[i] = s;
    R[i] = s * 0.95;
  }
}

function renderFireVox(L: Float32Array, R: Float32Array, sr: number, dur: number) {
  const n = L.length;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    let s = 0;
    if (t >= 0.08 && t < 0.85) {
      const dt = t - 0.08;
      const env = Math.sin((dt / 0.77) * Math.PI);
      // High-energy shout "FIRE!"
      const carrier = Math.sin(2 * Math.PI * 165 * dt);
      const formants = Math.sin(2 * Math.PI * 850 * dt) * 0.7 + Math.sin(2 * Math.PI * 1800 * dt) * 0.5;
      const grit = (Math.random() * 2 - 1) * 0.25;
      s = Math.tanh((carrier + formants + grit) * 3.0) * env;
    }
    L[i] = s;
    R[i] = s;
  }
}

function renderWubTalkbox(L: Float32Array, R: Float32Array, sr: number, dur: number) {
  const n = L.length;
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const env = t < 0.05 ? t / 0.05 : Math.exp(-t * 0.9);
    phase += (2 * Math.PI * 73.4) / sr; // D2
    const saw = (phase % (2 * Math.PI)) / Math.PI - 1;

    // Vowel sweep "W-U-B"
    const mod = 0.5 + 0.5 * Math.sin(2 * Math.PI * 3.5 * t);
    const formant = Math.sin(2 * Math.PI * (350 + 700 * mod) * t) * 0.6;
    const sample = Math.tanh((saw + formant) * 2.4) * env;

    L[i] = sample;
    R[i] = sample;
  }
}

function renderTitanSlam(L: Float32Array, R: Float32Array, sr: number, dur: number) {
  const n = L.length;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const crackEnv = Math.exp(-t * 40);
    const boomEnv = Math.exp(-t * 1.5);
    const reverbEnv = Math.exp(-t * 0.8);

    // 1. Sharp initial crack transient
    const crack = (Math.random() * 2 - 1) * crackEnv * 0.9;
    // 2. Heavy sub bass thump (65Hz down to 32Hz)
    const boom = Math.sin(2 * Math.PI * (32 + 33 * Math.exp(-t * 12)) * t) * boomEnv * 0.85;
    // 3. Wide stereo reverb bloom
    const revL = (Math.random() * 2 - 1) * reverbEnv * 0.35;
    const revR = (Math.random() * 2 - 1) * reverbEnv * 0.35;

    L[i] = Math.tanh(crack + boom + revL);
    R[i] = Math.tanh(crack + boom + revR);
  }
}

function renderAnvilTearout(L: Float32Array, R: Float32Array, sr: number, dur: number) {
  const n = L.length;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const env = Math.exp(-t * 2.8);
    // 3 metallic ring modes
    const ring1 = Math.sin(2 * Math.PI * 1450 * t) * 0.5;
    const ring2 = Math.sin(2 * Math.PI * 2820 * t) * 0.35;
    const ring3 = Math.sin(2 * Math.PI * 4150 * t) * 0.2;
    // Sub punch
    const sub = Math.sin(2 * Math.PI * 55 * t) * Math.exp(-t * 8) * 0.7;

    const sample = Math.tanh((ring1 + ring2 + ring3 + sub) * 2.2) * env;
    L[i] = sample;
    R[i] = sample * (0.9 + 0.1 * Math.sin(t * 20));
  }
}

function renderDownshifter(L: Float32Array, R: Float32Array, sr: number, dur: number) {
  const n = L.length;
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const env = Math.exp(-t * 0.9);
    // Downshifter frequency from 900Hz to 25Hz
    const freq = 25 + 875 * Math.exp(-t * 1.8);
    phase += (2 * Math.PI * freq) / sr;

    // Stepped bitcrushed distortion
    const raw = Math.sin(phase);
    const crushed = Math.round(raw * 8) / 8;
    const sample = Math.tanh(crushed * 1.5) * env;

    L[i] = sample;
    R[i] = sample;
  }
}
