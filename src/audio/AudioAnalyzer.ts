/**
 * Wub Works - Audio Analysis Engine
 * Real-time and offline analysis for Dubstep BPM, Harmonic Musical Key,
 * and 3-band frequency spectral waveforms.
 */

import { SpectralAnalysis } from '../types';

// Musical key lookup: Standard Notation & Camelot Harmonic Wheel notation
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Camelot Wheel map: [Key name] -> Camelot code
const CAMELOT_MAP: Record<string, string> = {
  // Minor keys (A series)
  'Am': '8A',  'Em': '9A',  'Bm': '10A', 'F#m': '11A',
  'C#m': '12A', 'G#m': '1A', 'D#m': '2A', 'A#m': '3A',
  'Fm': '4A',  'Cm': '5A',  'Gm': '6A',  'Dm': '7A',
  // Major keys (B series)
  'C': '8B',   'G': '9B',   'D': '10B',  'A': '11B',
  'E': '12B',  'B': '1B',   'F#': '2B',  'C#': '3B',
  'G#': '4B',  'D#': '5B',  'A#': '6B',  'F': '7B',
};

// Krumhansl-Schmuckler Key Profiles for Major and Minor modes
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

/**
 * Detect BPM of an AudioBuffer using downsampled transient peak energy autocorrelation.
 */
export function detectBPM(buffer: AudioBuffer): number {
  const channelData = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  
  // Downsample to ~4000 Hz for lightning-fast analysis
  const downsampleRate = 4000;
  const step = Math.max(1, Math.floor(sampleRate / downsampleRate));
  const downsampledLength = Math.floor(channelData.length / step);
  const downsampled = new Float32Array(downsampledLength);
  
  for (let i = 0; i < downsampledLength; i++) {
    downsampled[i] = Math.abs(channelData[i * step]);
  }
  
  // Calculate energy envelopes using a 50ms window
  const windowSize = Math.floor(downsampleRate * 0.05);
  const envelope = new Float32Array(downsampledLength);
  let currentSum = 0;
  for (let i = 0; i < downsampledLength; i++) {
    currentSum += downsampled[i];
    if (i >= windowSize) currentSum -= downsampled[i - windowSize];
    envelope[i] = currentSum;
  }
  
  // Search lag range corresponding to 65 - 175 BPM
  const minBpm = 65;
  const maxBpm = 175;
  const minLag = Math.floor((downsampleRate * 60) / maxBpm);
  const maxLag = Math.floor((downsampleRate * 60) / minBpm);
  
  let bestLag = 0;
  let maxCorr = -Infinity;
  
  // Subsample analysis section (first 45 seconds or full buffer)
  const maxAnalysisSamples = Math.min(downsampledLength - maxLag, downsampleRate * 45);
  
  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    // Step by 2 for speed
    for (let i = 0; i < maxAnalysisSamples; i += 2) {
      sum += envelope[i] * envelope[i + lag];
    }
    if (sum > maxCorr) {
      maxCorr = sum;
      bestLag = lag;
    }
  }
  
  if (bestLag === 0) return 140.0;
  
  let detected = (downsampleRate * 60) / bestLag;
  
  // Dubstep convention: Half-time beats (~70 BPM) should be normalized to full-time (~140 BPM)
  if (detected < 95) {
    detected *= 2;
  }
  // Clamp to realistic dubstep bounds
  if (detected > 180) {
    detected /= 2;
  }
  
  return Math.round(detected * 10) / 10;
}

/**
 * Detect musical key using chromagram profile correlation
 */
export function detectKey(buffer: AudioBuffer): { standard: string; camelot: string } {
  const channelData = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  
  // Downsample to ~4410 Hz for pitch detection
  const step = Math.max(1, Math.floor(sampleRate / 4410));
  const effectiveSr = sampleRate / step;
  
  // Simple 12-semitone pitch accumulator using Goertzel / discrete frequency bins for octave 2-5
  const chroma = new Float64Array(12);
  const baseFreq = 440 * Math.pow(2, -4.75); // C1 ~ 32.7 Hz
  
  const sampleCount = Math.min(channelData.length, sampleRate * 30); // 30 sec sample
  for (let note = 0; note < 12; note++) {
    let energy = 0;
    // Test octaves 2, 3, 4
    for (let oct = 2; oct <= 4; oct++) {
      const f = baseFreq * Math.pow(2, oct + note / 12);
      const k = Math.round((sampleCount / effectiveSr) * f);
      const omega = (2 * Math.PI * k) / sampleCount;
      const cosOmega = Math.cos(omega);
      const sinOmega = Math.sin(omega);
      
      let real = 0;
      let imag = 0;
      for (let i = 0; i < sampleCount; i += step * 4) {
        const val = channelData[i];
        real += val * cosOmega;
        imag -= val * sinOmega;
      }
      energy += Math.sqrt(real * real + imag * imag);
    }
    chroma[note] = energy;
  }
  
  // Normalize chroma
  let chromaSum = 0;
  for (let i = 0; i < 12; i++) chromaSum += chroma[i];
  if (chromaSum > 0) {
    for (let i = 0; i < 12; i++) chroma[i] /= chromaSum;
  }
  
  // Correlate with 24 keys (12 Major, 12 Minor)
  let bestScore = -Infinity;
  let bestKey = 'Am';
  
  for (let root = 0; root < 12; root++) {
    // Check Major
    let majorCorr = 0;
    for (let i = 0; i < 12; i++) {
      majorCorr += chroma[(root + i) % 12] * MAJOR_PROFILE[i];
    }
    if (majorCorr > bestScore) {
      bestScore = majorCorr;
      bestKey = NOTE_NAMES[root];
    }
    
    // Check Minor
    let minorCorr = 0;
    for (let i = 0; i < 12; i++) {
      minorCorr += chroma[(root + i) % 12] * MINOR_PROFILE[i];
    }
    if (minorCorr > bestScore) {
      bestScore = minorCorr;
      bestKey = `${NOTE_NAMES[root]}m`;
    }
  }
  
  const camelot = CAMELOT_MAP[bestKey] || '8A';
  return {
    standard: bestKey,
    camelot,
  };
}

/**
 * Generate 3-band spectral waveforms (Lows, Mids, Highs) for scrolling waveform display
 */
export function generateSpectralData(buffer: AudioBuffer, pointsPerSec = 40): SpectralAnalysis {
  const channelData = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  const duration = buffer.duration;
  const totalPoints = Math.max(100, Math.floor(duration * pointsPerSec));
  const samplesPerPoint = Math.floor(channelData.length / totalPoints);
  
  const lows = new Float32Array(totalPoints);
  const mids = new Float32Array(totalPoints);
  const highs = new Float32Array(totalPoints);
  
  // Simple recursive 1-pole lowpass & highpass filters for 3-band separation
  // low cutoff ~ 250 Hz, high cutoff ~ 3500 Hz
  const dt = 1 / sampleRate;
  const rcLow = 1 / (2 * Math.PI * 250);
  const alphaLow = dt / (rcLow + dt);
  
  const rcHigh = 1 / (2 * Math.PI * 3500);
  const alphaHigh = rcHigh / (rcHigh + dt);
  
  let lp = 0;
  let hp = 0;
  let prevSample = 0;
  
  for (let p = 0; p < totalPoints; p++) {
    let sumLow = 0;
    let sumMid = 0;
    let sumHigh = 0;
    const start = p * samplesPerPoint;
    const end = Math.min(start + samplesPerPoint, channelData.length);
    
    // Subsample within block
    const subStep = Math.max(1, Math.floor((end - start) / 64));
    let count = 0;
    
    for (let i = start; i < end; i += subStep) {
      const sample = channelData[i];
      // Lowpass
      lp = lp + alphaLow * (sample - lp);
      // Highpass
      hp = alphaHigh * (hp + sample - prevSample);
      prevSample = sample;
      // Mid is remainder
      const mid = sample - lp - hp;
      
      sumLow += Math.abs(lp);
      sumMid += Math.abs(mid);
      sumHigh += Math.abs(hp);
      count++;
    }
    
    lows[p] = count > 0 ? Math.min(1, (sumLow / count) * 2.8) : 0;
    mids[p] = count > 0 ? Math.min(1, (sumMid / count) * 2.4) : 0;
    highs[p] = count > 0 ? Math.min(1, (sumHigh / count) * 3.2) : 0;
  }
  
  // Calculate Dubstep Energy Segments (Intro, Build, Drop, Breakdown, Outro)
  const segmentCount = 5;
  const segDuration = duration / segmentCount;
  const energySegments: SpectralAnalysis['energySegments'] = [
    { start: 0, end: segDuration, type: 'intro', color: '#6366f1' },
    { start: segDuration, end: segDuration * 2, type: 'build', color: '#06b6d4' },
    { start: segDuration * 2, end: segDuration * 3.5, type: 'drop', color: '#f43f5e' },
    { start: segDuration * 3.5, end: segDuration * 4.3, type: 'breakdown', color: '#a855f7' },
    { start: segDuration * 4.3, end: duration, type: 'outro', color: '#64748b' },
  ];
  
  return {
    lows,
    mids,
    highs,
    duration,
    energySegments,
  };
}

/**
 * Check Camelot Harmonic Compatibility between two keys
 * Compatible keys are: identical, +/- 1 on Camelot wheel, or same number with opposite letter (A/B).
 */
export function areKeysHarmonicallyCompatible(keyA: string, keyB: string): { compatible: boolean; relation: string } {
  if (!keyA || !keyB) return { compatible: false, relation: 'Unknown' };
  if (keyA === keyB) return { compatible: true, relation: 'Perfect Match (Exact Key)' };
  
  const numA = parseInt(keyA);
  const letterA = keyA.slice(-1);
  const numB = parseInt(keyB);
  const letterB = keyB.slice(-1);
  
  if (numA === numB && letterA !== letterB) {
    return { compatible: true, relation: 'Relative Major/Minor' };
  }
  
  const diff = Math.abs(numA - numB);
  if ((diff === 1 || diff === 11) && letterA === letterB) {
    return { compatible: true, relation: 'Harmonic 5th Step (Energy Shift)' };
  }
  
  return { compatible: false, relation: 'Key Clash' };
}
