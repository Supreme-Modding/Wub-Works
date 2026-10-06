/**
 * Wub Works - Main Application Controller
 * Phase 1: High-Energy Dubstep DJ Deck & Tactile Mixer
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  AppLayoutMode,
  ChannelMixerState,
  CrossfaderCurve,
  DeckId,
  DeckState,
  FXSlotState,
  MixerMasterState,
  SpectralAnalysis,
  ThemeConfig,
} from './types';
import { AudioEngine } from './audio/AudioEngine';
import { detectBPM, detectKey, generateSpectralData } from './audio/AudioAnalyzer';
import { STARTER_TRACKS, StarterTrackMeta, synthesizeStarterTrack } from './audio/StarterTracks';
import { DubstepSampleMeta, synthesizeDubstepSample } from './audio/DubstepSamples';
import { MidiService } from './services/midiService';
import { StorageService } from './services/storageService';
import { THEME_PRESETS } from './constants/themes';

import { AppHeader } from './components/layout/AppHeader';
import { DeckComponent } from './components/deck/DeckComponent';
import { MasterCenterConsole } from './components/mixer/MasterCenterConsole';

import { OnboardingTutorial } from './components/onboarding/OnboardingTutorial';
import { MidiLearnModal } from './components/modals/MidiLearnModal';
import { ShortcutCheatSheet } from './components/modals/ShortcutCheatSheet';
import { ThemeCustomizer } from './components/modals/ThemeCustomizer';
import { AudioHardwareModal } from './components/modals/AudioHardwareModal';
import { RecordingsModal } from './components/modals/RecordingsModal';
import { DubstepSampleModal } from './components/modals/DubstepSampleModal';
import { WubSynthLab } from './components/synth/WubSynthLab';
import { PerformanceKeyboardBar } from './components/synth/PerformanceKeyboardBar';
import { WubSynthEngine } from './audio/WubSynthEngine';

const INITIAL_FX_SLOT_1: FXSlotState = {
  type: 'wobble',
  enabled: false,
  dryWet: 0,
  param1: 0.5, // 1/8 note
  param2: 0.6, // resonance
  param3: 0.5, // depth
};

const INITIAL_FX_SLOT_2: FXSlotState = {
  type: 'echo',
  enabled: false,
  dryWet: 0,
  param1: 0.75, // dotted 8th note
  param2: 0.45, // feedback
  param3: 0.5,
};

const INITIAL_CHANNEL_STATE: ChannelMixerState = {
  gain: 0,
  eqHigh: 0,
  eqMid: 0,
  eqLow: 0,
  killHigh: false,
  killMid: false,
  killLow: false,
  filter: 0,
  volume: 0.85,
  vuLeft: 0,
  vuRight: 0,
  isClipping: false,
  freqLow: 0,
  freqMid: 0,
  freqHigh: 0,
  pflCue: false,
  fx1: { ...INITIAL_FX_SLOT_1 },
  fx2: { ...INITIAL_FX_SLOT_2 },
  crossfaderAssign: 'A',
};

export default function App() {
  // Theme State
  const [theme, setTheme] = useState<ThemeConfig>(THEME_PRESETS[0]);
  const [isProMode, setIsProMode] = useState<boolean>(true);
  const [layoutMode, setLayoutMode] = useState<AppLayoutMode>('perform');

  // Decks State (Supports A, B, C, D)
  const [decks, setDecks] = useState<Record<DeckId, DeckState>>({
    A: {
      id: 'A',
      trackName: 'CYBER WOBBLE 140',
      artist: 'Wub Works Labs',
      duration: 32,
      currentTime: 0,
      isPlaying: false,
      cuePoint: 0,
      bpm: 140,
      detectedBpm: 140,
      key: '8A',
      keyStandard: 'Am',
      keyshift: 0,
      tempoPercent: 0,
      tempoRange: 8,
      keyLock: true,
      isSync: false,
      isMaster: true,
      isSlip: false,
      isReverse: false,
      isBraking: false,
      hotCues: [],
      loop: { active: false, start: 0, end: 0, lengthBeats: 4, isRoll: false },
      beatGridOffset: 0,
      colorAccent: theme.deckA,
    },
    B: {
      id: 'B',
      trackName: 'NEON RIDDIM PRESSURE',
      artist: 'Wub Works Labs',
      duration: 32,
      currentTime: 0,
      isPlaying: false,
      cuePoint: 0,
      bpm: 142,
      detectedBpm: 142,
      key: '8A',
      keyStandard: 'Am',
      keyshift: 0,
      tempoPercent: 0,
      tempoRange: 8,
      keyLock: true,
      isSync: false,
      isMaster: false,
      isSlip: false,
      isReverse: false,
      isBraking: false,
      hotCues: [],
      loop: { active: false, start: 0, end: 0, lengthBeats: 4, isRoll: false },
      beatGridOffset: 0,
      colorAccent: theme.deckB,
    },
    C: {
      id: 'C',
      trackName: '',
      artist: '',
      duration: 0,
      currentTime: 0,
      isPlaying: false,
      cuePoint: 0,
      bpm: 150,
      detectedBpm: 150,
      key: '9A',
      keyStandard: 'Em',
      keyshift: 0,
      tempoPercent: 0,
      tempoRange: 8,
      keyLock: true,
      isSync: false,
      isMaster: false,
      isSlip: false,
      isReverse: false,
      isBraking: false,
      hotCues: [],
      loop: { active: false, start: 0, end: 0, lengthBeats: 4, isRoll: false },
      beatGridOffset: 0,
      colorAccent: theme.deckC,
    },
    D: {
      id: 'D',
      trackName: '',
      artist: '',
      duration: 0,
      currentTime: 0,
      isPlaying: false,
      cuePoint: 0,
      bpm: 140,
      detectedBpm: 140,
      key: '7A',
      keyStandard: 'Dm',
      keyshift: 0,
      tempoPercent: 0,
      tempoRange: 8,
      keyLock: true,
      isSync: false,
      isMaster: false,
      isSlip: false,
      isReverse: false,
      isBraking: false,
      hotCues: [],
      loop: { active: false, start: 0, end: 0, lengthBeats: 4, isRoll: false },
      beatGridOffset: 0,
      colorAccent: theme.deckD,
    },
  });

  // Spectral waveform data cache per deck
  const [spectralData, setSpectralData] = useState<Record<DeckId, SpectralAnalysis | null>>({
    A: null,
    B: null,
    C: null,
    D: null,
  });

  // Mixer Channels
  const [channels, setChannels] = useState<Record<DeckId, ChannelMixerState>>({
    A: { ...INITIAL_CHANNEL_STATE, crossfaderAssign: 'A' },
    B: { ...INITIAL_CHANNEL_STATE, crossfaderAssign: 'B' },
    C: { ...INITIAL_CHANNEL_STATE, crossfaderAssign: 'A' },
    D: { ...INITIAL_CHANNEL_STATE, crossfaderAssign: 'B' },
  });

  // Mixer Master
  const [master, setMaster] = useState<MixerMasterState>({
    masterVolume: 1.0,
    masterVuLeft: 0,
    masterVuRight: 0,
    crossfader: 0,
    crossfaderCurve: 'smooth',
    crossfaderHamster: false,
    headphoneVolume: 0.8,
    headphoneCueMix: 0.5,
    isRecording: false,
    recordingSeconds: 0,
  });

  // Modals state
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isMidiModalOpen, setIsMidiModalOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState<boolean>(false);
  const [isRecordingsModalOpen, setIsRecordingsModalOpen] = useState<boolean>(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState<boolean>(false);
  const [sampleModalTargetDeck, setSampleModalTargetDeck] = useState<DeckId>('A');
  const [isSynthLabOpen, setIsSynthLabOpen] = useState<boolean>(false);
  const [synthLabTargetDeck, setSynthLabTargetDeck] = useState<DeckId>('A');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState<boolean>(false);
  const [stopFeedback, setStopFeedback] = useState<boolean>(false);
  const [connectedMidiCount, setConnectedMidiCount] = useState<number>(0);

  // Determine active decks based on layout mode
  const activeDeckIds: DeckId[] = layoutMode === 'pro4' ? ['A', 'B', 'C', 'D'] : ['A', 'B'];

  // Initialize AudioEngine on first load & pre-synthesize Deck A and Deck B demo tracks
  useEffect(() => {
    // Check onboarding completion
    const completed = localStorage.getItem('wub_works_tutorial_completed');
    if (!completed) {
      setIsTutorialOpen(true);
    }

    // Auto-load starter demo tracks for Deck A and B
    try {
      const ctx = AudioEngine.init();
      const bufA = synthesizeStarterTrack(ctx, STARTER_TRACKS[0]);
      const deckANode = AudioEngine.getDeck('A');
      deckANode.loadBuffer(bufA);
      const specA = generateSpectralData(bufA);

      const bufB = synthesizeStarterTrack(ctx, STARTER_TRACKS[1]);
      const deckBNode = AudioEngine.getDeck('B');
      deckBNode.loadBuffer(bufB);
      const specB = generateSpectralData(bufB);

      setSpectralData((prev) => ({ ...prev, A: specA, B: specB }));
      setDecks((prev) => ({
        ...prev,
        A: { ...prev.A, duration: bufA.duration },
        B: { ...prev.B, duration: bufB.duration },
      }));
    } catch (_) {}

    // MIDI status subscription
    const unsubMidi = MidiService.onStatusChange(() => {
      setConnectedMidiCount(MidiService.getConnectedDevices().length);
    });

    return () => {
      unsubMidi();
    };
  }, []);

  // 60FPS UI Refresh Loop for Playheads and Peak VU Level Meters
  useEffect(() => {
    let animId: number;

    const tick = () => {
      // 1. Update playhead positions
      setDecks((prev) => {
        let changed = false;
        const next = { ...prev };

        activeDeckIds.forEach((id) => {
          const node = AudioEngine.decks.get(id);
          if (node && (node.buffer || node['isPlaying'])) {
            const curTime = node.getCurrentPosition();
            const playing = node['isPlaying'];
            if (next[id].currentTime !== curTime || next[id].isPlaying !== playing) {
              next[id] = { ...next[id], currentTime: curTime, isPlaying: playing };
              changed = true;
            }
          }
        });

        return changed ? next : prev;
      });

      // 2. Update VU Meter Peak readings & Real-time EQ Frequency Bands
      setChannels((prev) => {
        const next = { ...prev };
        let chChanged = false;

        activeDeckIds.forEach((id) => {
          const node = AudioEngine.decks.get(id);
          if (node) {
            const vu = node.getVuLevel();
            const bands = node.getFrequencyBands();
            if (
              next[id].vuLeft !== vu.left ||
              next[id].vuRight !== vu.right ||
              next[id].isClipping !== vu.isClipping ||
              next[id].freqLow !== bands.low ||
              next[id].freqMid !== bands.mid ||
              next[id].freqHigh !== bands.high
            ) {
              next[id] = {
                ...next[id],
                vuLeft: vu.left,
                vuRight: vu.right,
                isClipping: vu.isClipping,
                freqLow: bands.low,
                freqMid: bands.mid,
                freqHigh: bands.high,
              };
              chChanged = true;
            }
          }
        });

        return chChanged ? next : prev;
      });

      // 3. Master VU Meters & Recording timer
      const masterVu = AudioEngine.getMasterVu();
      setMaster((prev) => {
        const recSec = AudioEngine.recorder?.getElapsedTime() || 0;
        if (
          prev.masterVuLeft !== masterVu.left ||
          prev.masterVuRight !== masterVu.right ||
          prev.isClipping !== masterVu.isClipping ||
          (prev.isRecording && prev.recordingSeconds !== recSec)
        ) {
          return {
            ...prev,
            masterVuLeft: masterVu.left,
            masterVuRight: masterVu.right,
            isClipping: masterVu.isClipping,
            recordingSeconds: prev.isRecording ? recSec : prev.recordingSeconds,
          };
        }
        return prev;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [activeDeckIds]);

  // Sync theme colors with decks
  useEffect(() => {
    setDecks((prev) => ({
      ...prev,
      A: { ...prev.A, colorAccent: theme.deckA },
      B: { ...prev.B, colorAccent: theme.deckB },
      C: { ...prev.C, colorAccent: theme.deckC },
      D: { ...prev.D, colorAccent: theme.deckD },
    }));
  }, [theme]);

  // Handle Loading Local Audio Files
  const handleLoadLocalFile = async (deckId: DeckId, file: File) => {
    try {
      const buf = await AudioEngine.decodeAudioFile(file);
      const deckNode = AudioEngine.getDeck(deckId);
      deckNode.loadBuffer(buf);

      const bpm = detectBPM(buf);
      const keyInfo = detectKey(buf);
      const spectral = generateSpectralData(buf);

      const title = file.name.replace(/\.[^/.]+$/, '');
      setDecks((prev) => ({
        ...prev,
        [deckId]: {
          ...prev[deckId],
          trackName: title,
          artist: 'Local File',
          duration: buf.duration,
          currentTime: 0,
          bpm,
          detectedBpm: bpm,
          key: keyInfo.camelot,
          keyStandard: keyInfo.standard,
          tempoPercent: 0,
        },
      }));

      setSpectralData((prev) => ({
        ...prev,
        [deckId]: spectral,
      }));
    } catch (err) {
      console.error('Failed to decode audio file', err);
    }
  };

  // Handle Loading Procedural Starter Dubstep Tracks
  const handleLoadStarterTrack = (deckId: DeckId, meta: StarterTrackMeta) => {
    const ctx = AudioEngine.init();
    const buf = synthesizeStarterTrack(ctx, meta);
    const deckNode = AudioEngine.getDeck(deckId);
    deckNode.loadBuffer(buf);

    const spectral = generateSpectralData(buf);

    setDecks((prev) => ({
      ...prev,
      [deckId]: {
        ...prev[deckId],
        trackName: meta.title,
        artist: meta.artist,
        duration: buf.duration,
        currentTime: 0,
        bpm: meta.bpm,
        detectedBpm: meta.bpm,
        key: meta.key,
        keyStandard: meta.keyStandard,
        tempoPercent: 0,
      },
    }));

    setSpectralData((prev) => ({
      ...prev,
      [deckId]: spectral,
    }));
  };

  // Handle Loading Procedural Dubstep Sound Effect Samples
  const handleLoadDubstepSample = (deckId: DeckId, sample: DubstepSampleMeta) => {
    const ctx = AudioEngine.init();
    const buf = synthesizeDubstepSample(ctx, sample);
    const deckNode = AudioEngine.getDeck(deckId);
    deckNode.loadBuffer(buf);

    const spectral = generateSpectralData(buf);

    setDecks((prev) => ({
      ...prev,
      [deckId]: {
        ...prev[deckId],
        trackName: sample.name,
        artist: `SFX: ${sample.category.toUpperCase().replace('_', ' ')}`,
        duration: buf.duration,
        currentTime: 0,
        bpm: sample.bpm || 140,
        detectedBpm: sample.bpm || 140,
        key: sample.key || '8A',
        keyStandard: sample.keyStandard || 'Am',
        tempoPercent: 0,
      },
    }));

    setSpectralData((prev) => ({
      ...prev,
      [deckId]: spectral,
    }));
  };

  const handleOpenSampleModal = (deckId?: DeckId) => {
    if (deckId) setSampleModalTargetDeck(deckId);
    setIsSampleModalOpen(true);
  };

  const handleOpenSynthLab = (deckId?: DeckId) => {
    if (deckId) setSynthLabTargetDeck(deckId);
    setIsSynthLabOpen(true);
  };

  // Handle Baking Wub Synth Pattern to a Deck (Phase 2B)
  const handleBakeToDeck = (deckId: DeckId, buffer: AudioBuffer, patchName: string, bpm: number) => {
    const deckNode = AudioEngine.getDeck(deckId);
    deckNode.loadBuffer(buffer);

    const spectral = generateSpectralData(buffer);
    const keyInfo = detectKey(buffer);

    setDecks((prev) => ({
      ...prev,
      [deckId]: {
        ...prev[deckId],
        trackName: patchName,
        artist: 'Wub Synth Lab',
        duration: buffer.duration,
        currentTime: 0,
        bpm,
        detectedBpm: bpm,
        key: keyInfo.camelot,
        keyStandard: keyInfo.standard,
        tempoPercent: 0,
      },
    }));

    setSpectralData((prev) => ({
      ...prev,
      [deckId]: spectral,
    }));
  };

  // Deck Controls Handlers
  const handleTogglePlay = (deckId: DeckId) => {
    const node = AudioEngine.getDeck(deckId);
    node.togglePlay();
    setDecks((prev) => ({
      ...prev,
      [deckId]: {
        ...prev[deckId],
        isPlaying: node.isPlaying,
        currentTime: node.getCurrentPosition(),
      },
    }));
  };

  const handleStopAllAudio = () => {
    AudioEngine.stopAllAudio();
    WubSynthEngine.allNotesOff();
    setStopFeedback(true);
    setTimeout(() => setStopFeedback(false), 900);
    setDecks((prev) => {
      const next = { ...prev };
      activeDeckIds.forEach((id) => {
        const node = AudioEngine.decks.get(id);
        next[id] = {
          ...next[id],
          isPlaying: false,
          currentTime: node ? node.getCurrentPosition() : next[id].currentTime,
        };
      });
      return next;
    });
  };

  const handleCueDown = (deckId: DeckId) => {
    const node = AudioEngine.getDeck(deckId);
    node.handleCueDown();
    setDecks((prev) => ({
      ...prev,
      [deckId]: {
        ...prev[deckId],
        cuePoint: node.getCuePoint(),
        isPlaying: node.isPlaying,
        currentTime: node.getCurrentPosition(),
      },
    }));
  };

  const handleCueUp = (deckId: DeckId) => {
    const node = AudioEngine.getDeck(deckId);
    node.handleCueUp();
    setDecks((prev) => ({
      ...prev,
      [deckId]: {
        ...prev[deckId],
        isPlaying: node.isPlaying,
        currentTime: node.getCurrentPosition(),
      },
    }));
  };

  const handleSeek = (deckId: DeckId, time: number) => {
    const node = AudioEngine.getDeck(deckId);
    node.jumpToPosition(time);
    setDecks((prev) => ({
      ...prev,
      [deckId]: { ...prev[deckId], currentTime: time },
    }));
  };

  const handleBeatJump = (deckId: DeckId, beats: number) => {
    const node = AudioEngine.getDeck(deckId);
    node.beatJump(beats, decks[deckId].bpm);
  };

  const handleTriggerCue = (deckId: DeckId, id: number) => {
    const cue = decks[deckId].hotCues.find((c) => c.id === id);
    if (cue) {
      handleSeek(deckId, cue.position);
    }
  };

  const handleSetCue = (deckId: DeckId, id: number, pos: number, label = `CUE ${id}`, color = '#06b6d4') => {
    setDecks((prev) => {
      const filtered = prev[deckId].hotCues.filter((c) => c.id !== id);
      const nextCues = [...filtered, { id, position: pos, label, color }].sort((a, b) => a.id - b.id);
      return {
        ...prev,
        [deckId]: { ...prev[deckId], hotCues: nextCues },
      };
    });
  };

  const handleDeleteCue = (deckId: DeckId, id: number) => {
    setDecks((prev) => ({
      ...prev,
      [deckId]: {
        ...prev[deckId],
        hotCues: prev[deckId].hotCues.filter((c) => c.id !== id),
      },
    }));
  };

  const handleSetAutoLoop = (deckId: DeckId, beats: number) => {
    const node = AudioEngine.getDeck(deckId);
    node.setAutoLoop(beats, decks[deckId].bpm);
    setDecks((prev) => ({
      ...prev,
      [deckId]: {
        ...prev[deckId],
        loop: {
          active: true,
          start: node['loopState'].start,
          end: node['loopState'].end,
          lengthBeats: beats,
          isRoll: false,
        },
      },
    }));
  };

  const handleToggleLoop = (deckId: DeckId) => {
    const node = AudioEngine.getDeck(deckId);
    node.toggleLoop();
    setDecks((prev) => ({
      ...prev,
      [deckId]: {
        ...prev[deckId],
        loop: {
          ...prev[deckId].loop,
          active: !prev[deckId].loop.active,
        },
      },
    }));
  };

  const handleHalveLoop = (deckId: DeckId) => {
    const node = AudioEngine.getDeck(deckId);
    node.halveLoop();
    setDecks((prev) => ({
      ...prev,
      [deckId]: {
        ...prev[deckId],
        loop: {
          ...prev[deckId].loop,
          lengthBeats: Math.max(0.0625, prev[deckId].loop.lengthBeats * 0.5),
        },
      },
    }));
  };

  const handleDoubleLoop = (deckId: DeckId) => {
    const node = AudioEngine.getDeck(deckId);
    node.doubleLoop();
    setDecks((prev) => ({
      ...prev,
      [deckId]: {
        ...prev[deckId],
        loop: {
          ...prev[deckId].loop,
          lengthBeats: prev[deckId].loop.lengthBeats * 2,
        },
      },
    }));
  };

  const handleStartRoll = (deckId: DeckId, beats: number) => {
    const node = AudioEngine.getDeck(deckId);
    node.startLoopRoll(beats, decks[deckId].bpm);
  };

  const handleStopRoll = (deckId: DeckId) => {
    const node = AudioEngine.getDeck(deckId);
    node.stopLoopRoll();
  };

  const handleToggleSlip = (deckId: DeckId) => {
    const node = AudioEngine.getDeck(deckId);
    const nextSlip = !decks[deckId].isSlip;
    node.setSlip(nextSlip);
    setDecks((prev) => ({
      ...prev,
      [deckId]: { ...prev[deckId], isSlip: nextSlip },
    }));
  };

  const handleToggleReverse = (deckId: DeckId) => {
    const node = AudioEngine.getDeck(deckId);
    const nextRev = !decks[deckId].isReverse;
    node.setReverse(nextRev);
    setDecks((prev) => ({
      ...prev,
      [deckId]: { ...prev[deckId], isReverse: nextRev },
    }));
  };

  const handleTriggerBrake = (deckId: DeckId) => {
    const node = AudioEngine.getDeck(deckId);
    node.triggerBrake(1.2);
    setDecks((prev) => ({
      ...prev,
      [deckId]: { ...prev[deckId], isBraking: true },
    }));
    setTimeout(() => {
      setDecks((prev) => ({
        ...prev,
        [deckId]: { ...prev[deckId], isBraking: false, isPlaying: false },
      }));
    }, 1300);
  };

  const handleTempoChange = (deckId: DeckId, val: number) => {
    const node = AudioEngine.getDeck(deckId);
    node.setTempo(val, decks[deckId].keyshift, decks[deckId].keyLock);
    setDecks((prev) => ({
      ...prev,
      [deckId]: { ...prev[deckId], tempoPercent: val },
    }));
  };

  const handleRangeChange = (deckId: DeckId, range: 4 | 8 | 16 | 50 | 100) => {
    setDecks((prev) => ({
      ...prev,
      [deckId]: { ...prev[deckId], tempoRange: range },
    }));
  };

  const handleToggleKeyLock = (deckId: DeckId) => {
    const nextLock = !decks[deckId].keyLock;
    const node = AudioEngine.getDeck(deckId);
    node.setTempo(decks[deckId].tempoPercent, decks[deckId].keyshift, nextLock);
    setDecks((prev) => ({
      ...prev,
      [deckId]: { ...prev[deckId], keyLock: nextLock },
    }));
  };

  const handleSetMaster = (deckId: DeckId) => {
    setDecks((prev) => {
      const next = { ...prev };
      (Object.keys(next) as DeckId[]).forEach((id) => {
        next[id] = { ...next[id], isMaster: id === deckId };
      });
      return next;
    });
  };

  const handleToggleSync = (deckId: DeckId) => {
    // Find active master deck or opposite deck
    const activeMaster = Object.values(decks).find((d) => d.isMaster && d.id !== deckId) || (deckId === 'A' ? decks.B : decks.A);
    if (activeMaster && activeMaster.bpm > 0) {
      // Calculate pitch percent to match master BPM
      const masterTargetBpm = activeMaster.bpm * (1 + activeMaster.tempoPercent / 100);
      const neededPercent = ((masterTargetBpm / decks[deckId].detectedBpm) - 1) * 100;
      handleTempoChange(deckId, neededPercent);

      // Phase align to master grid beat
      const masterSecPerBeat = 60 / masterTargetBpm;
      const masterGridTime = activeMaster.currentTime - activeMaster.beatGridOffset;
      const masterBeatPhase = ((masterGridTime % masterSecPerBeat) + masterSecPerBeat) % masterSecPerBeat;

      const thisTimeSinceGrid = decks[deckId].currentTime - decks[deckId].beatGridOffset;
      const currentBeatIndex = Math.floor(thisTimeSinceGrid / masterSecPerBeat);
      const targetTime = decks[deckId].beatGridOffset + currentBeatIndex * masterSecPerBeat + masterBeatPhase;

      handleSeek(deckId, Math.max(0, targetTime));

      setDecks((prev) => ({
        ...prev,
        [deckId]: { ...prev[deckId], isSync: true },
      }));
    }
  };

  const handleNudge = (deckId: DeckId, cents: number) => {
    const node = AudioEngine.getDeck(deckId);
    node.nudge(cents);
  };

  const handleReleaseNudge = (deckId: DeckId) => {
    const node = AudioEngine.getDeck(deckId);
    node.releaseNudge();
  };

  const handleKeyshiftChange = (deckId: DeckId, semitones: number) => {
    const node = AudioEngine.getDeck(deckId);
    node.setTempo(decks[deckId].tempoPercent, semitones, decks[deckId].keyLock);
    setDecks((prev) => ({
      ...prev,
      [deckId]: { ...prev[deckId], keyshift: semitones },
    }));
  };

  const handleAdjustBeatGridOffset = (deckId: DeckId, deltaSec: number) => {
    setDecks((prev) => ({
      ...prev,
      [deckId]: {
        ...prev[deckId],
        beatGridOffset: prev[deckId].beatGridOffset + deltaSec,
      },
    }));
  };

  const handleSetDownbeat = (deckId: DeckId) => {
    setDecks((prev) => ({
      ...prev,
      [deckId]: {
        ...prev[deckId],
        beatGridOffset: prev[deckId].currentTime,
      },
    }));
  };

  const handleAdjustBpm = (deckId: DeckId, delta: number) => {
    setDecks((prev) => ({
      ...prev,
      [deckId]: {
        ...prev[deckId],
        detectedBpm: Math.round((prev[deckId].detectedBpm + delta) * 10) / 10,
        bpm: Math.round((prev[deckId].bpm + delta) * 10) / 10,
      },
    }));
  };

  // Mixer Channel Updates
  const handleUpdateChannel = (id: DeckId, updates: Partial<ChannelMixerState>) => {
    const node = AudioEngine.getDeck(id);
    const next = { ...channels[id], ...updates };

    if (updates.gain !== undefined) node.setGainTrim(next.gain);
    if (
      updates.eqHigh !== undefined ||
      updates.eqMid !== undefined ||
      updates.eqLow !== undefined ||
      updates.killHigh !== undefined ||
      updates.killMid !== undefined ||
      updates.killLow !== undefined
    ) {
      node.setEQ(next.eqLow, next.eqMid, next.eqHigh, next.killLow, next.killMid, next.killHigh);
    }
    if (updates.filter !== undefined) node.setFilter(next.filter);
    if (updates.volume !== undefined) node.setVolume(next.volume);
    if (updates.pflCue !== undefined) node.setPflCue(next.pflCue);
    if (updates.crossfaderAssign !== undefined) {
      AudioEngine.setChannelCrossfaderAssign(id, next.crossfaderAssign);
    }

    setChannels((prev) => ({
      ...prev,
      [id]: next,
    }));
  };

  // FX Slot Updates
  const handleUpdateFX1 = (id: DeckId, fxUpdates: Partial<FXSlotState>) => {
    const node = AudioEngine.getDeck(id);
    const nextSlot = { ...channels[id].fx1, ...fxUpdates };
    node.fx1.update(nextSlot, decks[id].bpm);

    setChannels((prev) => ({
      ...prev,
      [id]: { ...prev[id], fx1: nextSlot },
    }));
  };

  const handleUpdateFX2 = (id: DeckId, fxUpdates: Partial<FXSlotState>) => {
    const node = AudioEngine.getDeck(id);
    const nextSlot = { ...channels[id].fx2, ...fxUpdates };
    node.fx2.update(nextSlot, decks[id].bpm);

    setChannels((prev) => ({
      ...prev,
      [id]: { ...prev[id], fx2: nextSlot },
    }));
  };

  // Crossfader Updates
  const handleCrossfaderChange = (pos: number) => {
    AudioEngine.setCrossfader(pos, master.crossfaderCurve, master.crossfaderHamster);
    setMaster((prev) => ({ ...prev, crossfader: pos }));
  };

  const handleCrossfaderCurveChange = (curve: CrossfaderCurve) => {
    AudioEngine.setCrossfader(master.crossfader, curve, master.crossfaderHamster);
    setMaster((prev) => ({ ...prev, crossfaderCurve: curve }));
  };

  const handleToggleHamster = () => {
    const nextHamster = !master.crossfaderHamster;
    AudioEngine.setCrossfader(master.crossfader, master.crossfaderCurve, nextHamster);
    setMaster((prev) => ({ ...prev, crossfaderHamster: nextHamster }));
  };

  const handleMasterVolumeChange = (vol: number) => {
    AudioEngine.setMasterVolume(vol);
    setMaster((prev) => ({ ...prev, masterVolume: vol }));
  };

  const handleHeadphoneVolumeChange = (vol: number) => {
    AudioEngine.setHeadphoneMonitoring(vol, master.headphoneCueMix);
    setMaster((prev) => ({ ...prev, headphoneVolume: vol }));
  };

  const handleHeadphoneCueMixChange = (mix: number) => {
    AudioEngine.setHeadphoneMonitoring(master.headphoneVolume, mix);
    setMaster((prev) => ({ ...prev, headphoneCueMix: mix }));
  };

  // Live Master WAV Recording
  const handleToggleRecord = async () => {
    if (!AudioEngine.recorder) return;

    if (!master.isRecording) {
      AudioEngine.recorder.start();
      setMaster((prev) => ({ ...prev, isRecording: true, recordingSeconds: 0 }));
    } else {
      const result = AudioEngine.recorder.stop();
      setMaster((prev) => ({ ...prev, isRecording: false }));
      if (result) {
        // Save to IndexedDB
        await StorageService.saveRecording({
          id: `rec_${Date.now()}`,
          name: `Dubstep Mix ${new Date().toLocaleDateString()}`,
          timestamp: Date.now(),
          duration: result.duration,
          blob: result.blob,
          size: result.blob.size,
        });
        setIsRecordingsModalOpen(true);
      }
    }
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in text inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Escape') {
        handleStopAllAudio();
      } else if (e.key === '?') {
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setIsProMode((prev) => !prev);
      } else if (e.key === ' ' && !e.shiftKey) {
        e.preventDefault();
        handleTogglePlay('A');
      } else if (e.key === ' ' && e.shiftKey) {
        e.preventDefault();
        handleTogglePlay('B');
      } else if (e.key.toLowerCase() === 'c' && !e.shiftKey) {
        handleCueDown('A');
      } else if (e.key.toLowerCase() === 'c' && e.shiftKey) {
        handleCueDown('B');
      } else if (['1', '2', '3', '4'].includes(e.key) && !e.shiftKey) {
        handleTriggerCue('A', parseInt(e.key));
      } else if (['5', '6', '7', '8'].includes(e.key) && !e.shiftKey) {
        handleTriggerCue('B', parseInt(e.key) - 4);
      } else if (e.key.toLowerCase() === 'k' && !e.shiftKey) {
        handleUpdateChannel('A', { killLow: !channels.A.killLow });
      } else if (e.key.toLowerCase() === 'k' && e.shiftKey) {
        handleUpdateChannel('B', { killLow: !channels.B.killLow });
      } else if (e.key === 'ArrowLeft') {
        handleCrossfaderChange(Math.max(-1, master.crossfader - 0.1));
      } else if (e.key === 'ArrowRight') {
        handleCrossfaderChange(Math.min(1, master.crossfader + 0.1));
      } else if (e.key.toLowerCase() === 'z') {
        handleCrossfaderChange(-1);
      } else if (e.key.toLowerCase() === 'x') {
        handleCrossfaderChange(0);
      } else if (e.key.toLowerCase() === 'r') {
        handleToggleRecord();
      } else if (e.key.toLowerCase() === 'f') {
        setIsSampleModalOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'w' && !isSynthLabOpen) {
        setIsSynthLabOpen(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'c' && !e.shiftKey) {
        handleCueUp('A');
      } else if (e.key.toLowerCase() === 'c' && e.shiftKey) {
        handleCueUp('B');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [channels, master, decks]);

  const masterDeck = Object.values(decks).find((d) => d.isMaster) || decks.A;

  return (
    <div className="min-h-screen bg-[#07070a] text-zinc-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Application Navigation */}
      <AppHeader
        layoutMode={layoutMode}
        onSelectLayout={setLayoutMode}
        isProMode={isProMode}
        onToggleProMode={() => setIsProMode((prev) => !prev)}
        isRecording={master.isRecording}
        recordingSeconds={master.recordingSeconds}
        onToggleRecord={handleToggleRecord}
        onOpenMidiModal={() => setIsMidiModalOpen(true)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenSampleModal={() => handleOpenSampleModal('A')}
        onOpenSynthLab={() => handleOpenSynthLab('A')}
        onStopAllAudio={handleStopAllAudio}
        isAnyAudioPlaying={Object.values(decks).some((d) => d.isPlaying)}
        stopFeedback={stopFeedback}
        onToggleKeyboard={() => setIsKeyboardOpen((prev) => !prev)}
        isKeyboardOpen={isKeyboardOpen}
        theme={theme}
        connectedMidiCount={connectedMidiCount}
      />

      {/* Main DJ Channels & Master Center Console Workspace */}
      <main className="flex-1 p-2 sm:p-3 flex flex-col gap-3 overflow-x-hidden max-w-full">
        {/* Unified Channel Units (Channels A & B side-by-side) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 min-w-0 items-start">
          {/* Unified Channel A */}
          <DeckComponent
            deck={decks.A}
            masterDeck={masterDeck}
            channel={channels.A}
            spectralData={spectralData.A}
            onLoadLocalFile={handleLoadLocalFile}
            onLoadStarterTrack={handleLoadStarterTrack}
            onLoadDubstepSample={handleLoadDubstepSample}
            onOpenSampleModal={handleOpenSampleModal}
            onOpenSynthLab={handleOpenSynthLab}
            onTogglePlay={handleTogglePlay}
            onCueDown={handleCueDown}
            onCueUp={handleCueUp}
            onSeek={handleSeek}
            onBeatJump={handleBeatJump}
            onTriggerCue={handleTriggerCue}
            onSetCue={handleSetCue}
            onDeleteCue={handleDeleteCue}
            onSetAutoLoop={handleSetAutoLoop}
            onToggleLoop={handleToggleLoop}
            onHalveLoop={handleHalveLoop}
            onDoubleLoop={handleDoubleLoop}
            onStartRoll={handleStartRoll}
            onStopRoll={handleStopRoll}
            onToggleSlip={handleToggleSlip}
            onToggleReverse={handleToggleReverse}
            onTriggerBrake={handleTriggerBrake}
            onTempoChange={handleTempoChange}
            onRangeChange={handleRangeChange}
            onToggleKeyLock={handleToggleKeyLock}
            onToggleSync={handleToggleSync}
            onSetMaster={handleSetMaster}
            onNudge={handleNudge}
            onReleaseNudge={handleReleaseNudge}
            onKeyshiftChange={handleKeyshiftChange}
            onAdjustBeatGridOffset={handleAdjustBeatGridOffset}
            onSetDownbeat={handleSetDownbeat}
            onAdjustBpm={handleAdjustBpm}
            onUpdateChannel={handleUpdateChannel}
            onUpdateFX1={handleUpdateFX1}
            onUpdateFX2={handleUpdateFX2}
            isProMode={isProMode}
          />

          {/* Unified Channel B */}
          <DeckComponent
            deck={decks.B}
            masterDeck={masterDeck}
            channel={channels.B}
            spectralData={spectralData.B}
            onLoadLocalFile={handleLoadLocalFile}
            onLoadStarterTrack={handleLoadStarterTrack}
            onLoadDubstepSample={handleLoadDubstepSample}
            onOpenSampleModal={handleOpenSampleModal}
            onOpenSynthLab={handleOpenSynthLab}
            onTogglePlay={handleTogglePlay}
            onCueDown={handleCueDown}
            onCueUp={handleCueUp}
            onSeek={handleSeek}
            onBeatJump={handleBeatJump}
            onTriggerCue={handleTriggerCue}
            onSetCue={handleSetCue}
            onDeleteCue={handleDeleteCue}
            onSetAutoLoop={handleSetAutoLoop}
            onToggleLoop={handleToggleLoop}
            onHalveLoop={handleHalveLoop}
            onDoubleLoop={handleDoubleLoop}
            onStartRoll={handleStartRoll}
            onStopRoll={handleStopRoll}
            onToggleSlip={handleToggleSlip}
            onToggleReverse={handleToggleReverse}
            onTriggerBrake={handleTriggerBrake}
            onTempoChange={handleTempoChange}
            onRangeChange={handleRangeChange}
            onToggleKeyLock={handleToggleKeyLock}
            onToggleSync={handleToggleSync}
            onSetMaster={handleSetMaster}
            onNudge={handleNudge}
            onReleaseNudge={handleReleaseNudge}
            onKeyshiftChange={handleKeyshiftChange}
            onAdjustBeatGridOffset={handleAdjustBeatGridOffset}
            onSetDownbeat={handleSetDownbeat}
            onAdjustBpm={handleAdjustBpm}
            onUpdateChannel={handleUpdateChannel}
            onUpdateFX1={handleUpdateFX1}
            onUpdateFX2={handleUpdateFX2}
            isProMode={isProMode}
          />
        </div>

        {/* Unified Channels C & D (when 4-deck Pro mode active) */}
        {layoutMode === 'pro4' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 min-w-0 items-start">
            <DeckComponent
              deck={decks.C}
              masterDeck={masterDeck}
              channel={channels.C}
              spectralData={spectralData.C}
              onLoadLocalFile={handleLoadLocalFile}
              onLoadStarterTrack={handleLoadStarterTrack}
              onLoadDubstepSample={handleLoadDubstepSample}
              onOpenSampleModal={handleOpenSampleModal}
              onOpenSynthLab={handleOpenSynthLab}
              onTogglePlay={handleTogglePlay}
              onCueDown={handleCueDown}
              onCueUp={handleCueUp}
              onSeek={handleSeek}
              onBeatJump={handleBeatJump}
              onTriggerCue={handleTriggerCue}
              onSetCue={handleSetCue}
              onDeleteCue={handleDeleteCue}
              onSetAutoLoop={handleSetAutoLoop}
              onToggleLoop={handleToggleLoop}
              onHalveLoop={handleHalveLoop}
              onDoubleLoop={handleDoubleLoop}
              onStartRoll={handleStartRoll}
              onStopRoll={handleStopRoll}
              onToggleSlip={handleToggleSlip}
              onToggleReverse={handleToggleReverse}
              onTriggerBrake={handleTriggerBrake}
              onTempoChange={handleTempoChange}
              onRangeChange={handleRangeChange}
              onToggleKeyLock={handleToggleKeyLock}
              onToggleSync={handleToggleSync}
              onSetMaster={handleSetMaster}
              onNudge={handleNudge}
              onReleaseNudge={handleReleaseNudge}
              onKeyshiftChange={handleKeyshiftChange}
              onAdjustBeatGridOffset={handleAdjustBeatGridOffset}
              onSetDownbeat={handleSetDownbeat}
              onAdjustBpm={handleAdjustBpm}
              onUpdateChannel={handleUpdateChannel}
              onUpdateFX1={handleUpdateFX1}
              onUpdateFX2={handleUpdateFX2}
              isProMode={isProMode}
            />
            <DeckComponent
              deck={decks.D}
              masterDeck={masterDeck}
              channel={channels.D}
              spectralData={spectralData.D}
              onLoadLocalFile={handleLoadLocalFile}
              onLoadStarterTrack={handleLoadStarterTrack}
              onLoadDubstepSample={handleLoadDubstepSample}
              onOpenSampleModal={handleOpenSampleModal}
              onOpenSynthLab={handleOpenSynthLab}
              onTogglePlay={handleTogglePlay}
              onCueDown={handleCueDown}
              onCueUp={handleCueUp}
              onSeek={handleSeek}
              onBeatJump={handleBeatJump}
              onTriggerCue={handleTriggerCue}
              onSetCue={handleSetCue}
              onDeleteCue={handleDeleteCue}
              onSetAutoLoop={handleSetAutoLoop}
              onToggleLoop={handleToggleLoop}
              onHalveLoop={handleHalveLoop}
              onDoubleLoop={handleDoubleLoop}
              onStartRoll={handleStartRoll}
              onStopRoll={handleStopRoll}
              onToggleSlip={handleToggleSlip}
              onToggleReverse={handleToggleReverse}
              onTriggerBrake={handleTriggerBrake}
              onTempoChange={handleTempoChange}
              onRangeChange={handleRangeChange}
              onToggleKeyLock={handleToggleKeyLock}
              onToggleSync={handleToggleSync}
              onSetMaster={handleSetMaster}
              onNudge={handleNudge}
              onReleaseNudge={handleReleaseNudge}
              onKeyshiftChange={handleKeyshiftChange}
              onAdjustBeatGridOffset={handleAdjustBeatGridOffset}
              onSetDownbeat={handleSetDownbeat}
              onAdjustBpm={handleAdjustBpm}
              onUpdateChannel={handleUpdateChannel}
              onUpdateFX1={handleUpdateFX1}
              onUpdateFX2={handleUpdateFX2}
              isProMode={isProMode}
            />
          </div>
        )}

        {/* Docked Live Performance Wub Keyboard Bar */}
        <PerformanceKeyboardBar
          isOpen={isKeyboardOpen}
          onClose={() => setIsKeyboardOpen(false)}
          onOpenFullLab={() => handleOpenSynthLab()}
          activeDeckIds={activeDeckIds}
          masterBpm={masterDeck.bpm || 140}
          onBakeToDeck={handleBakeToDeck}
        />

        {/* Master Center Console: Crossfader, Master Volume, Headphone Monitoring & WAV Recording */}
        <div className="w-full shrink-0">
          <MasterCenterConsole
            master={master}
            onCrossfaderChange={handleCrossfaderChange}
            onCrossfaderCurveChange={handleCrossfaderCurveChange}
            onToggleHamster={handleToggleHamster}
            onMasterVolumeChange={handleMasterVolumeChange}
            onHeadphoneVolumeChange={handleHeadphoneVolumeChange}
            onHeadphoneCueMixChange={handleHeadphoneCueMixChange}
            onToggleRecord={handleToggleRecord}
            onOpenHardwareNotice={() => setIsHardwareModalOpen(true)}
            onOpenRecordings={() => setIsRecordingsModalOpen(true)}
            onStopAllAudio={handleStopAllAudio}
            isAnyAudioPlaying={Object.values(decks).some((d) => d.isPlaying)}
            stopFeedback={stopFeedback}
          />
        </div>
      </main>

      {/* Modals & Dialogs */}
      <OnboardingTutorial
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onSelectStarterTrack={() => handleLoadStarterTrack('A', STARTER_TRACKS[0])}
      />
      <MidiLearnModal
        isOpen={isMidiModalOpen}
        onClose={() => setIsMidiModalOpen(false)}
      />
      <ShortcutCheatSheet
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
      <ThemeCustomizer
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={theme}
        onSelectTheme={(t) => setTheme(t)}
      />
      <AudioHardwareModal
        isOpen={isHardwareModalOpen}
        onClose={() => setIsHardwareModalOpen(false)}
      />
      <RecordingsModal
        isOpen={isRecordingsModalOpen}
        onClose={() => setIsRecordingsModalOpen(false)}
      />
      <DubstepSampleModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        onLoadSampleToDeck={handleLoadDubstepSample}
        activeDeckIds={activeDeckIds}
        preselectedDeckId={sampleModalTargetDeck}
      />
      <WubSynthLab
        isOpen={isSynthLabOpen}
        onClose={() => setIsSynthLabOpen(false)}
        onBakeToDeck={handleBakeToDeck}
        activeDeckIds={activeDeckIds}
        masterBpm={masterDeck.bpm || 140}
        preselectedDeckId={synthLabTargetDeck}
      />
    </div>
  );
}
