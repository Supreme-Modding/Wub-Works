import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  WubSynthEngine,
  WubSynthPatch,
  SYNTH_PRESETS,
  BakePatternType,
  OscWaveform,
  FilterType,
  LfoRateSync,
  DistortionType,
} from '../../audio/WubSynthEngine';
import { AudioEngine } from '../../audio/AudioEngine';
import { DeckId } from '../../types';
import { KnobSlider } from '../common/KnobSlider';
import {
  X,
  Zap,
  Activity,
  Sliders,
  Sparkles,
  Volume2,
  VolumeX,
  Disc,
  Check,
  Download,
  Dices,
  Layers,
  Flame,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface WubSynthLabProps {
  isOpen: boolean;
  onClose: () => void;
  onBakeToDeck: (deckId: DeckId, buffer: AudioBuffer, patchName: string, bpm: number) => void;
  activeDeckIds: DeckId[];
  masterBpm: number;
  preselectedDeckId?: DeckId;
}

export const WubSynthLab: React.FC<WubSynthLabProps> = ({
  isOpen,
  onClose,
  onBakeToDeck,
  activeDeckIds,
  masterBpm,
  preselectedDeckId,
}) => {
  const [patch, setPatch] = useState<WubSynthPatch>(() => WubSynthEngine.getPatch());
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SYNTH_PRESETS[0].id);
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const activeNotesMapRef = useRef<Map<number, number>>(new Map());
  const [octaveOffset, setOctaveOffset] = useState<number>(0);
  const [bakeBars, setBakeBars] = useState<number>(4);
  const [bakePattern, setBakePattern] = useState<BakePatternType>('halftime_drop');
  const [bakeRootNote, setBakeRootNote] = useState<number>(36); // C2
  const [bakeNotification, setBakeNotification] = useState<string | null>(null);
  const [showKeyboard, setShowKeyboard] = useState<boolean>(true);
  const [isKeyboardExpanded, setIsKeyboardExpanded] = useState<boolean>(false);
  const [killFlashed, setKillFlashed] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize engine on open
  useEffect(() => {
    if (isOpen) {
      const ctx = AudioEngine.init();
      WubSynthEngine.init(ctx);
      WubSynthEngine.setPatch(patch);
    } else {
      WubSynthEngine.allNotesOff();
    }
  }, [isOpen]);

  // Update patch in engine whenever state changes
  const updatePatch = useCallback((updater: (prev: WubSynthPatch) => WubSynthPatch) => {
    setPatch((prev) => {
      const next = updater(prev);
      WubSynthEngine.setPatch(next);
      return next;
    });
  }, []);

  // Oscilloscope & Spectrum visualizer
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = WubSynthEngine.analyser;
    const timeBuffer = new Uint8Array(256);

    const render = () => {
      if (!analyser) return;
      analyser.getByteTimeDomainData(timeBuffer);

      ctx.fillStyle = '#06060f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid lines
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Oscilloscope line
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#00f2fe';
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      const sliceWidth = canvas.width / timeBuffer.length;
      let x = 0;

      for (let i = 0; i < timeBuffer.length; i++) {
        const v = timeBuffer[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isOpen]);

  // Keyboard note play helpers
  const handleNoteStart = (note: number) => {
    const finalNote = note + octaveOffset * 12;
    activeNotesMapRef.current.set(note, finalNote);
    WubSynthEngine.noteOn(finalNote, 0.9, masterBpm);
    setActiveNotes((prev) => new Set(prev).add(finalNote));
  };

  const handleNoteEnd = (note: number) => {
    const finalNote = activeNotesMapRef.current.get(note) ?? (note + octaveOffset * 12);
    activeNotesMapRef.current.delete(note);
    WubSynthEngine.noteOff(finalNote);
    setActiveNotes((prev) => {
      const next = new Set(prev);
      next.delete(finalNote);
      return next;
    });
  };

  // Computer keyboard trigger mapping
  useEffect(() => {
    if (!isOpen) return;

    const keyMap: Record<string, number> = {
      a: 36, // C2
      w: 37, // C#2
      s: 38, // D2
      e: 39, // D#2
      d: 40, // E2
      f: 41, // F2
      t: 42, // F#2
      g: 43, // G2
      y: 44, // G#2
      h: 45, // A2
      u: 46, // A#2
      j: 47, // B2
      k: 48, // C3
      o: 49, // C#3
      l: 50, // D3
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.repeat) return;
      const k = e.key.toLowerCase();
      if (keyMap[k] !== undefined) {
        handleNoteStart(keyMap[k]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const k = e.key.toLowerCase();
      if (keyMap[k] !== undefined) {
        handleNoteEnd(keyMap[k]);
      }
    };

    const handleGlobalRelease = () => {
      activeNotesMapRef.current.clear();
      setActiveNotes(new Set());
      WubSynthEngine.allNotesOff();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('pointerup', handleGlobalRelease);
    window.addEventListener('pointercancel', handleGlobalRelease);
    window.addEventListener('mouseup', handleGlobalRelease);
    window.addEventListener('touchend', handleGlobalRelease);
    window.addEventListener('touchcancel', handleGlobalRelease);
    window.addEventListener('blur', handleGlobalRelease);
    document.addEventListener('visibilitychange', handleGlobalRelease);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('pointerup', handleGlobalRelease);
      window.removeEventListener('pointercancel', handleGlobalRelease);
      window.removeEventListener('mouseup', handleGlobalRelease);
      window.removeEventListener('touchend', handleGlobalRelease);
      window.removeEventListener('touchcancel', handleGlobalRelease);
      window.removeEventListener('blur', handleGlobalRelease);
      document.removeEventListener('visibilitychange', handleGlobalRelease);
      activeNotesMapRef.current.clear();
      setActiveNotes(new Set());
      WubSynthEngine.allNotesOff();
    };
  }, [isOpen, octaveOffset, masterBpm]);

  // Preset Selection
  const handleSelectPreset = (presetId: string) => {
    const found = SYNTH_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setSelectedPresetId(presetId);
      setPatch({ ...found });
      WubSynthEngine.setPatch({ ...found });
    }
  };

  // Randomize Wub parameters
  const handleRandomize = () => {
    const waveforms: OscWaveform[] = ['sawtooth', 'square', 'growl', 'metallic'];
    const filterTypes: FilterType[] = ['lowpass', 'bandpass', 'vowel_yoi', 'vowel_growl', 'comb'];
    const lfoRates: LfoRateSync[] = ['1/4', '1/8', '1/8T', '1/16', '1/16T'];

    updatePatch((prev) => ({
      ...prev,
      fmDepth: Math.round(Math.random() * 80) / 100,
      osc1: {
        ...prev.osc1,
        waveform: waveforms[Math.floor(Math.random() * waveforms.length)],
        unison: Math.floor(Math.random() * 3) + 1,
        detuneSpread: Math.round(Math.random() * 30) / 100,
      },
      osc2: {
        ...prev.osc2,
        waveform: waveforms[Math.floor(Math.random() * waveforms.length)],
        semi: [0, 7, 12, -12][Math.floor(Math.random() * 4)],
      },
      filter: {
        ...prev.filter,
        type: filterTypes[Math.floor(Math.random() * filterTypes.length)],
        cutoff: Math.round(200 + Math.random() * 2000),
        resonance: Math.round((4 + Math.random() * 10) * 10) / 10,
        drive: Math.round(Math.random() * 70) / 100,
      },
      lfo: {
        ...prev.lfo,
        rateSync: lfoRates[Math.floor(Math.random() * lfoRates.length)],
        cutoffAmount: Math.round((0.5 + Math.random() * 0.5) * 100) / 100,
      },
      fx: {
        ...prev.fx,
        distortionDrive: Math.round((0.3 + Math.random() * 0.5) * 100) / 100,
      },
    }));
  };

  // Bake & Render to Deck
  const handleBakeToDeck = (deckId: DeckId) => {
    try {
      const buffer = WubSynthEngine.bakePattern(masterBpm, bakeBars, bakePattern, bakeRootNote);
      onBakeToDeck(deckId, buffer, `${patch.name} (${bakeBars}B)`, masterBpm);
      setBakeNotification(`Baked "${patch.name}" into Deck ${deckId} (${bakeBars} Bars @ ${masterBpm} BPM)!`);
      setTimeout(() => setBakeNotification(null), 3500);
    } catch (err) {
      console.error('Failed to bake pattern:', err);
    }
  };

  // Export patch to WAV file download
  const handleDownloadWav = () => {
    try {
      const buffer = WubSynthEngine.bakePattern(masterBpm, bakeBars, bakePattern, bakeRootNote);
      const wavBlob = audioBufferToWav(buffer);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `WubSynth_${patch.name.replace(/\s+/g, '_')}_${masterBpm}BPM.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[95vh] rounded-3xl bg-[#070712] border-2 border-zinc-700 shadow-2xl flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Cyber Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />

        {/* 1. SYNTH HEADER */}
        <div className="p-3 sm:px-5 sm:py-3.5 border-b-2 border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/25">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-cyan-400 fill-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black font-display text-white tracking-wider">
                  WUB SYNTH LAB
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-950 border border-purple-400 text-purple-300 font-black">
                  PHASE 2B
                </span>
                <span className="text-[10px] font-mono text-zinc-400 font-bold hidden md:inline">
                  {masterBpm} BPM MASTER SYNC
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Modular dubstep bass sound designer with direct &quot;Bake to Deck&quot; rendering.
              </p>
            </div>
          </div>

          {/* Preset Selector & Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-750 rounded-xl px-2.5 py-1 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={selectedPresetId}
                onChange={(e) => handleSelectPreset(e.target.value)}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                {SYNTH_PRESETS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                activeNotesMapRef.current.clear();
                setActiveNotes(new Set());
                WubSynthEngine.allNotesOff();
                AudioEngine.stopAllAudio();
                setKillFlashed(true);
                setTimeout(() => setKillFlashed(false), 900);
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition cursor-pointer select-none active:scale-95 shadow-sm ${
                killFlashed
                  ? 'bg-rose-500 text-white border-white shadow-lg shadow-rose-500/80 animate-pulse'
                  : 'bg-rose-950 hover:bg-rose-900 text-rose-300 hover:text-white border-rose-500'
              }`}
              title="KILL ALL SOUND: Instantly silence stuck synth notes and all decks (Panic)"
            >
              <VolumeX className="w-3.5 h-3.5 text-rose-300" />
              <span>{killFlashed ? 'KILLED!' : 'KILL'}</span>
            </button>

            {/* Keyboard Toggle Button */}
            <button
              onClick={() => setShowKeyboard((prev) => !prev)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition cursor-pointer select-none active:scale-95 shadow-sm ${
                showKeyboard
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
              }`}
              title="Toggle Virtual Piano Keyboard (Free up room or play)"
            >
              <span>🎹 KEYS:</span>
              <span className="font-black text-[10px]">{showKeyboard ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={handleRandomize}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-400 text-xs font-mono font-bold transition cursor-pointer active:scale-95 shadow-sm"
              title="Generate a randomized dubstep wub patch"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Randomize</span>
            </button>

            <button
              onClick={handleDownloadWav}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-mono font-bold transition cursor-pointer"
              title="Download baked pattern as WAV"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. LIVE OSCILLOSCOPE & BAKE NOTIFICATION BANNER */}
        <div className="relative bg-[#05050c] border-b border-zinc-800 h-16 flex items-center justify-between px-4 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={600}
            height={64}
            className="absolute inset-0 w-full h-full pointer-events-none opacity-85"
          />

          <div className="relative z-10 flex items-center gap-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-black text-cyan-300 tracking-wider">
              {patch.name}
            </span>
            <span className="text-[10px] text-zinc-400 hidden sm:inline">
              — {patch.description}
            </span>
          </div>

          {bakeNotification && (
            <div className="relative z-10 flex items-center gap-1.5 bg-emerald-950 border border-emerald-400 text-emerald-300 px-3 py-1 rounded-lg text-xs font-black font-mono animate-in fade-in duration-150">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{bakeNotification}</span>
            </div>
          )}
        </div>

        {/* 3. MODULAR CONTROLS WORKSPACE */}
        <div
          className={`flex-1 overflow-y-auto p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 transition-all duration-200 ${
            showKeyboard ? (isKeyboardExpanded ? 'max-h-[40vh]' : 'max-h-[52vh]') : 'max-h-[72vh]'
          }`}
        >
          {/* MODULE 1: DUAL OSCILLATORS & SUB */}
          <div className="rounded-2xl bg-zinc-950/80 border-2 border-cyan-500/40 p-3 flex flex-col gap-2.5 shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
              <span className="text-xs font-mono font-black text-cyan-400">1. OSCILLATORS</span>
              <span className="text-[9px] font-mono text-zinc-400">FM &amp; UNISON</span>
            </div>

            {/* Osc 1 Waveform */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-zinc-400 font-bold">OSC 1 WAVE:</span>
              <div className="grid grid-cols-3 gap-1 text-[9px] font-mono font-black">
                {(['sawtooth', 'square', 'sine', 'triangle', 'growl', 'metallic'] as OscWaveform[]).map((w) => (
                  <button
                    key={w}
                    onClick={() => updatePatch((p) => ({ ...p, osc1: { ...p.osc1, waveform: w } }))}
                    className={`py-1 rounded border transition ${
                      patch.osc1.waveform === w
                        ? 'bg-cyan-500 text-black border-white shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {w.toUpperCase().slice(0, 5)}
                  </button>
                ))}
              </div>
            </div>

            {/* Osc 1 Unison Detune */}
            <KnobSlider
              label="OSC 1 UNISON"
              value={patch.osc1.unison}
              min={1}
              max={5}
              step={1}
              defaultValue={1}
              onChange={(v) => updatePatch((p) => ({ ...p, osc1: { ...p.osc1, unison: v } }))}
              colorAccent="#00f2fe"
              className="w-full"
            />

            {/* FM Modulation Depth */}
            <KnobSlider
              label="FM DEPTH (OSC 2 ◄► 1)"
              value={patch.fmDepth}
              min={0}
              max={1}
              step={0.02}
              defaultValue={0.2}
              onChange={(v) => updatePatch((p) => ({ ...p, fmDepth: v }))}
              colorAccent="#00f2fe"
              className="w-full"
            />

            {/* Sub Bass Level */}
            <KnobSlider
              label="SUB BASS LEVEL"
              value={patch.fx.subVol}
              min={0}
              max={1}
              step={0.05}
              defaultValue={0.8}
              onChange={(v) => updatePatch((p) => ({ ...p, fx: { ...p.fx, subVol: v } }))}
              colorAccent="#ec4899"
              className="w-full"
            />
          </div>

          {/* MODULE 2: FILTER & VOWEL FORMANTS */}
          <div className="rounded-2xl bg-zinc-950/80 border-2 border-purple-500/40 p-3 flex flex-col gap-2.5 shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
              <span className="text-xs font-mono font-black text-purple-400">2. FILTER &amp; VOWELS</span>
              <span className="text-[9px] font-mono text-zinc-400">RESONANCE</span>
            </div>

            {/* Filter Types */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-zinc-400 font-bold">FILTER TYPE:</span>
              <div className="grid grid-cols-3 gap-1 text-[9px] font-mono font-black">
                {(['lowpass', 'bandpass', 'comb', 'vowel_yoi', 'vowel_growl', 'highpass'] as FilterType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => updatePatch((p) => ({ ...p, filter: { ...p.filter, type: f } }))}
                    className={`py-1 rounded border transition ${
                      patch.filter.type === f
                        ? 'bg-purple-500 text-black border-white shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {f.replace('vowel_', '').toUpperCase().slice(0, 5)}
                  </button>
                ))}
              </div>
            </div>

            {/* Cutoff frequency */}
            <KnobSlider
              label="CUTOFF FREQUENCY"
              value={patch.filter.cutoff}
              min={50}
              max={12000}
              step={50}
              defaultValue={600}
              onChange={(v) => updatePatch((p) => ({ ...p, filter: { ...p.filter, cutoff: v } }))}
              displayUnit="Hz"
              colorAccent="#c084fc"
              className="w-full"
            />

            {/* Resonance (Q) */}
            <KnobSlider
              label="RESONANCE (PEAK Q)"
              value={patch.filter.resonance}
              min={0.5}
              max={16}
              step={0.5}
              defaultValue={6}
              onChange={(v) => updatePatch((p) => ({ ...p, filter: { ...p.filter, resonance: v } }))}
              colorAccent="#c084fc"
              className="w-full"
            />

            {/* Portamento Glide */}
            <KnobSlider
              label="PORTAMENTO GLIDE"
              value={patch.glide}
              min={0}
              max={0.3}
              step={0.01}
              defaultValue={0.05}
              onChange={(v) => updatePatch((p) => ({ ...p, glide: v }))}
              displayUnit="s"
              colorAccent="#c084fc"
              className="w-full"
            />
          </div>

          {/* MODULE 3: LFO WOBBLE MATRIX */}
          <div className="rounded-2xl bg-zinc-950/80 border-2 border-emerald-500/40 p-3 flex flex-col gap-2.5 shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
              <span className="text-xs font-mono font-black text-emerald-400">3. LFO WOBBLE</span>
              <span className="text-[9px] font-mono text-zinc-400">RHYTHMIC SYNC</span>
            </div>

            {/* LFO Sync Rates */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-zinc-400 font-bold">WUB RATE SYNC:</span>
              <div className="grid grid-cols-4 gap-1 text-[9px] font-mono font-black">
                {(['1/2', '1/4', '1/4T', '1/8', '1/8T', '1/16', '1/16T', '1/32'] as LfoRateSync[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => updatePatch((p) => ({ ...p, lfo: { ...p.lfo, rateSync: r } }))}
                    className={`py-1 rounded border transition ${
                      patch.lfo.rateSync === r
                        ? 'bg-emerald-400 text-black border-white shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* LFO Cutoff Depth */}
            <KnobSlider
              label="CUTOFF WOBBLE DEPTH"
              value={patch.lfo.cutoffAmount}
              min={0}
              max={1}
              step={0.02}
              defaultValue={0.8}
              onChange={(v) => updatePatch((p) => ({ ...p, lfo: { ...p.lfo, cutoffAmount: v } }))}
              colorAccent="#34d399"
              className="w-full"
            />

            {/* LFO FM Depth */}
            <KnobSlider
              label="FM WOBBLE DEPTH"
              value={patch.lfo.fmAmount}
              min={0}
              max={1}
              step={0.02}
              defaultValue={0.4}
              onChange={(v) => updatePatch((p) => ({ ...p, lfo: { ...p.lfo, fmAmount: v } }))}
              colorAccent="#34d399"
              className="w-full"
            />

            {/* Amp Attack */}
            <KnobSlider
              label="AMP ATTACK (PUNCH)"
              value={patch.ampEnv.attack}
              min={0.001}
              max={0.2}
              step={0.005}
              defaultValue={0.005}
              onChange={(v) => updatePatch((p) => ({ ...p, ampEnv: { ...p.ampEnv, attack: v } }))}
              displayUnit="s"
              colorAccent="#34d399"
              className="w-full"
            />
          </div>

          {/* MODULE 4: DISTORTION & POST FX */}
          <div className="rounded-2xl bg-zinc-950/80 border-2 border-rose-500/40 p-3 flex flex-col gap-2.5 shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
              <span className="text-xs font-mono font-black text-rose-400">4. POST DRIVE &amp; FX</span>
              <span className="text-[9px] font-mono text-zinc-400">SATURATION</span>
            </div>

            {/* Distortion Modes */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-zinc-400 font-bold">DRIVE CHARACTER:</span>
              <div className="grid grid-cols-3 gap-1 text-[9px] font-mono font-black">
                {(['tube', 'hard', 'hyper'] as DistortionType[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => updatePatch((p) => ({ ...p, fx: { ...p.fx, distortionType: d } }))}
                    className={`py-1 rounded border transition ${
                      patch.fx.distortionType === d
                        ? 'bg-rose-500 text-black border-white shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {d.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Distortion Drive */}
            <KnobSlider
              label="DISTORTION DRIVE"
              value={patch.fx.distortionDrive}
              min={0}
              max={1}
              step={0.02}
              defaultValue={0.5}
              onChange={(v) => updatePatch((p) => ({ ...p, fx: { ...p.fx, distortionDrive: v } }))}
              colorAccent="#f43f5e"
              className="w-full"
            />

            {/* Bitcrush Bits */}
            <KnobSlider
              label="BITCRUSHER CRUNCH"
              value={patch.fx.bitcrushBits}
              min={0}
              max={16}
              step={1}
              defaultValue={0}
              onChange={(v) => updatePatch((p) => ({ ...p, fx: { ...p.fx, bitcrushBits: v } }))}
              colorAccent="#f43f5e"
              className="w-full"
            />

            {/* Reverb Room Wash */}
            <KnobSlider
              label="REVERB STEREO WASH"
              value={patch.fx.reverbWet}
              min={0}
              max={0.6}
              step={0.02}
              defaultValue={0.15}
              onChange={(v) => updatePatch((p) => ({ ...p, fx: { ...p.fx, reverbWet: v } }))}
              colorAccent="#f43f5e"
              className="w-full"
            />
          </div>
        </div>

        {/* 4. INTERACTIVE VIRTUAL PIANO KEYBOARD (TOGGLEABLE & EXPANDABLE) */}
        {showKeyboard && (
          <div className="p-3 bg-zinc-950 border-t-2 border-zinc-800 flex flex-col gap-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between px-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-400 font-bold">TOUCH / MIDI KEYS:</span>
                <span className="text-[9px] text-cyan-400 font-black">
                  [A, W, S, E, D, F, T, G, Y, H, U, J, K]
                </span>
              </div>

              {/* Controls: Octave & Expand Size */}
              <div className="flex items-center gap-2">
                {/* Octave transpose */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-zinc-400 font-bold">OCTAVE:</span>
                  <button
                    onClick={() => setOctaveOffset((o) => Math.max(-2, o - 1))}
                    className="px-2 py-0.5 rounded bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-white cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-5 text-center text-xs font-mono font-black text-white">
                    {octaveOffset >= 0 ? `+${octaveOffset}` : octaveOffset}
                  </span>
                  <button
                    onClick={() => setOctaveOffset((o) => Math.min(2, o + 1))}
                    className="px-2 py-0.5 rounded bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-white cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Expand / Minimize Keyboard Size (More Room) */}
                <button
                  onClick={() => setIsKeyboardExpanded((prev) => !prev)}
                  className="px-2 py-0.5 rounded bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-[10px] font-mono font-bold"
                  title={isKeyboardExpanded ? 'Compact Keys' : 'Give More Room: Expand to Stage Piano Size'}
                >
                  {isKeyboardExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                  <span className="hidden sm:inline">{isKeyboardExpanded ? 'COMPACT' : 'MORE ROOM'}</span>
                </button>
              </div>
            </div>

            {/* Piano Keys Strip */}
            <div
              className={`relative flex bg-zinc-900 rounded-xl overflow-hidden p-1 gap-1 border border-zinc-800 transition-all duration-200 ${
                isKeyboardExpanded ? 'h-28 sm:h-36' : 'h-18 sm:h-22'
              }`}
            >
              {[
                { note: 36, name: 'C2', isBlack: false },
                { note: 37, name: 'C#', isBlack: true },
                { note: 38, name: 'D2', isBlack: false },
                { note: 39, name: 'D#', isBlack: true },
                { note: 40, name: 'E2', isBlack: false },
                { note: 41, name: 'F2', isBlack: false },
                { note: 42, name: 'F#', isBlack: true },
                { note: 43, name: 'G2', isBlack: false },
                { note: 44, name: 'G#', isBlack: true },
                { note: 45, name: 'A2', isBlack: false },
                { note: 46, name: 'A#', isBlack: true },
                { note: 47, name: 'B2', isBlack: false },
                { note: 48, name: 'C3', isBlack: false },
                { note: 49, name: 'C#', isBlack: true },
                { note: 50, name: 'D3', isBlack: false },
                { note: 51, name: 'D#', isBlack: true },
                { note: 52, name: 'E3', isBlack: false },
                { note: 53, name: 'F3', isBlack: false },
              ].map((k) => {
                const currentNote = k.note + octaveOffset * 12;
                const isPressed = activeNotes.has(currentNote);

                return (
                  <button
                    key={k.note}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      try {
                        e.currentTarget.setPointerCapture(e.pointerId);
                      } catch (_) {}
                      handleNoteStart(k.note);
                    }}
                    onPointerUp={(e) => {
                      e.preventDefault();
                      try {
                        e.currentTarget.releasePointerCapture(e.pointerId);
                      } catch (_) {}
                      handleNoteEnd(k.note);
                    }}
                    onPointerCancel={(e) => {
                      e.preventDefault();
                      handleNoteEnd(k.note);
                    }}
                    onPointerLeave={() => {
                      handleNoteEnd(k.note);
                    }}
                    className={`flex-1 rounded-lg flex flex-col justify-end p-1 transition cursor-pointer select-none touch-none active:scale-98 ${
                      k.isBlack
                        ? isPressed
                          ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/50'
                          : 'bg-zinc-950 hover:bg-zinc-850 text-zinc-500 border border-zinc-800'
                        : isPressed
                        ? 'bg-cyan-300 text-black shadow-lg shadow-cyan-300/50'
                        : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-700'
                    }`}
                  >
                    <span className="text-[8px] font-mono font-black text-center truncate">
                      {k.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. "BAKE TO DECK" RENDER & EXPORT ACTION BAR */}
        <div className="p-3 sm:px-5 border-t-2 border-zinc-800 bg-[#090918] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              <span>BAKE SETTINGS:</span>
            </span>

            {/* Pattern Type */}
            <select
              value={bakePattern}
              onChange={(e) => setBakePattern(e.target.value as BakePatternType)}
              className="bg-zinc-900 border border-zinc-700 text-white rounded-lg px-2 py-1 text-xs font-bold cursor-pointer"
            >
              <option value="halftime_drop">Half-Time Drop Pattern</option>
              <option value="continuous_wub">Continuous Wub Loop</option>
              <option value="stutter_chop">1/8 Stutter Chops</option>
              <option value="arpeggiated">Arpeggiated Minor Triad</option>
              <option value="pitch_dive">Sub Pitch Dive Hit</option>
            </select>

            {/* Length Bars */}
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-lg p-0.5">
              {[1, 2, 4, 8].map((bars) => (
                <button
                  key={bars}
                  onClick={() => setBakeBars(bars)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                    bakeBars === bars ? 'bg-cyan-400 text-black font-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {bars}B
                </button>
              ))}
            </div>
          </div>

          {/* Quick Deck Target Action Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-zinc-400">DROP ONTO:</span>
            {activeDeckIds.map((deckId) => {
              const isTargeted = deckId === preselectedDeckId;
              return (
                <button
                  key={deckId}
                  onClick={() => handleBakeToDeck(deckId)}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs font-mono transition cursor-pointer select-none active:scale-95 shadow-md border ${
                    isTargeted
                      ? 'bg-gradient-to-r from-amber-400 via-cyan-400 to-indigo-400 text-black border-white ring-2 ring-cyan-300 shadow-cyan-400/50 scale-105'
                      : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black border-white shadow-cyan-500/20'
                  }`}
                  title={`Render and load directly into Deck ${deckId}${isTargeted ? ' (Selected Target Deck)' : ''}`}
                >
                  ⚡ BAKE DECK {deckId}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Utility: Convert AudioBuffer to WAV Blob for download
 */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const numSamples = buffer.length * numChannels;
  const byteRate = (sampleRate * numChannels * bitDepth) / 8;
  const blockAlign = (numChannels * bitDepth) / 8;
  const dataSize = numSamples * 2;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const left = buffer.getChannelData(0);
  const right = numChannels > 1 ? buffer.getChannelData(1) : left;

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    const sL = Math.max(-1, Math.min(1, left[i]));
    view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7fff, true);
    offset += 2;

    if (numChannels > 1) {
      const sR = Math.max(-1, Math.min(1, right[i]));
      view.setInt16(offset, sR < 0 ? sR * 0x8000 : sR * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}
