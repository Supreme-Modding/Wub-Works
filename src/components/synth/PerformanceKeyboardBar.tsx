import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  WubSynthEngine,
  WubSynthPatch,
  SYNTH_PRESETS,
  LfoRateSync,
} from '../../audio/WubSynthEngine';
import { AudioEngine } from '../../audio/AudioEngine';
import { DeckId } from '../../types';
import {
  X,
  Flame,
  Volume2,
  VolumeX,
  Sparkles,
  Maximize2,
  Minimize2,
  Sliders,
  ChevronDown,
  Layers,
} from 'lucide-react';

interface PerformanceKeyboardBarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullLab: () => void;
  activeDeckIds: DeckId[];
  masterBpm: number;
  onBakeToDeck: (deckId: DeckId, buffer: AudioBuffer, patchName: string, bpm: number) => void;
}

interface PianoKeyDef {
  midi: number;
  name: string;
  isBlack: boolean;
  keyLabel?: string;
}

// 2 octaves from C2 (36) to C4 (60)
const PIANO_KEYS: PianoKeyDef[] = [
  { midi: 36, name: 'C2', isBlack: false, keyLabel: 'A' },
  { midi: 37, name: 'C#2', isBlack: true, keyLabel: 'W' },
  { midi: 38, name: 'D2', isBlack: false, keyLabel: 'S' },
  { midi: 39, name: 'D#2', isBlack: true, keyLabel: 'E' },
  { midi: 40, name: 'E2', isBlack: false, keyLabel: 'D' },
  { midi: 41, name: 'F2', isBlack: false, keyLabel: 'F' },
  { midi: 42, name: 'F#2', isBlack: true, keyLabel: 'T' },
  { midi: 43, name: 'G2', isBlack: false, keyLabel: 'G' },
  { midi: 44, name: 'G#2', isBlack: true, keyLabel: 'Y' },
  { midi: 45, name: 'A2', isBlack: false, keyLabel: 'H' },
  { midi: 46, name: 'A#2', isBlack: true, keyLabel: 'U' },
  { midi: 47, name: 'B2', isBlack: false, keyLabel: 'J' },
  { midi: 48, name: 'C3', isBlack: false, keyLabel: 'K' },
  { midi: 49, name: 'C#3', isBlack: true, keyLabel: 'O' },
  { midi: 50, name: 'D3', isBlack: false, keyLabel: 'L' },
  { midi: 51, name: 'D#3', isBlack: true, keyLabel: 'P' },
  { midi: 52, name: 'E3', isBlack: false },
  { midi: 53, name: 'F3', isBlack: false },
  { midi: 54, name: 'F#3', isBlack: true },
  { midi: 55, name: 'G3', isBlack: false },
  { midi: 56, name: 'G#3', isBlack: true },
  { midi: 57, name: 'A3', isBlack: false },
  { midi: 58, name: 'A#3', isBlack: true },
  { midi: 59, name: 'B3', isBlack: false },
  { midi: 60, name: 'C4', isBlack: false },
];

export const PerformanceKeyboardBar: React.FC<PerformanceKeyboardBarProps> = ({
  isOpen,
  onClose,
  onOpenFullLab,
  activeDeckIds,
  masterBpm,
  onBakeToDeck,
}) => {
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const activeNotesMapRef = useRef<Map<number, number>>(new Map());
  const [octaveOffset, setOctaveOffset] = useState<number>(0);
  const [isLargeSize, setIsLargeSize] = useState<boolean>(true);
  const [currentPatch, setCurrentPatch] = useState<WubSynthPatch>(() => WubSynthEngine.getPatch());
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SYNTH_PRESETS[0].id);
  const [quickBakeNotice, setQuickBakeNotice] = useState<string | null>(null);
  const [killFlashed, setKillFlashed] = useState<boolean>(false);

  // Initialize synth engine when opened
  useEffect(() => {
    if (isOpen) {
      const ctx = AudioEngine.init();
      WubSynthEngine.init(ctx);
      WubSynthEngine.setPatch(currentPatch);
    } else {
      activeNotesMapRef.current.clear();
      setActiveNotes(new Set());
      WubSynthEngine.allNotesOff();
    }
  }, [isOpen]);

  // Trigger Note
  const handleNoteStart = useCallback((baseMidi: number) => {
    const finalMidi = baseMidi + octaveOffset * 12;
    activeNotesMapRef.current.set(baseMidi, finalMidi);
    WubSynthEngine.noteOn(finalMidi, 0.95, masterBpm);
    setActiveNotes((prev) => new Set(prev).add(finalMidi));
  }, [octaveOffset, masterBpm]);

  // Release Note
  const handleNoteEnd = useCallback((baseMidi: number) => {
    const finalMidi = activeNotesMapRef.current.get(baseMidi) ?? (baseMidi + octaveOffset * 12);
    activeNotesMapRef.current.delete(baseMidi);
    WubSynthEngine.noteOff(finalMidi);
    setActiveNotes((prev) => {
      const next = new Set(prev);
      next.delete(finalMidi);
      return next;
    });
  }, [octaveOffset]);

  // Global safety release
  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalRelease = () => {
      activeNotesMapRef.current.clear();
      setActiveNotes(new Set());
      WubSynthEngine.allNotesOff();
    };

    // Computer keyboard mapping
    const keyMap: Record<string, number> = {
      a: 36,
      w: 37,
      s: 38,
      e: 39,
      d: 40,
      f: 41,
      t: 42,
      g: 43,
      y: 44,
      h: 45,
      u: 46,
      j: 47,
      k: 48,
      o: 49,
      l: 50,
      p: 51,
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.repeat) return;
      const key = e.key.toLowerCase();
      if (keyMap[key] !== undefined) {
        handleNoteStart(keyMap[key]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (keyMap[key] !== undefined) {
        handleNoteEnd(keyMap[key]);
      }
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
  }, [isOpen, handleNoteStart, handleNoteEnd]);

  // Preset selector
  const handleSelectPreset = (id: string) => {
    const found = SYNTH_PRESETS.find((p) => p.id === id);
    if (found) {
      setSelectedPresetId(id);
      setCurrentPatch({ ...found });
      WubSynthEngine.setPatch({ ...found });
    }
  };

  // Quick Wobble Sync Rate change
  const handleSetRate = (rate: LfoRateSync) => {
    const updated = {
      ...currentPatch,
      lfo: {
        ...currentPatch.lfo,
        rateSync: rate,
      },
    };
    setCurrentPatch(updated);
    WubSynthEngine.setPatch(updated);
  };

  // Quick Bake into target deck
  const handleQuickBake = (deckId: DeckId) => {
    try {
      const buf = WubSynthEngine.bakePattern(masterBpm, 4, 'halftime_drop', 36);
      onBakeToDeck(deckId, buf, `${currentPatch.name} (4B)`, masterBpm);
      setQuickBakeNotice(`Baked into Deck ${deckId}!`);
      setTimeout(() => setQuickBakeNotice(null), 2500);
    } catch (err) {
      console.error('Quick bake error', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-full shrink-0 rounded-2xl bg-[#090916] border-2 border-purple-500/50 p-2.5 sm:p-3 shadow-2xl flex flex-col gap-2 relative overflow-hidden select-none animate-in slide-in-from-bottom-3 duration-200">
      {/* Top Cyber Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-pink-500" />

      {/* Control Strip / Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        {/* Left: Branding, Preset Selector & Full Lab Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-950/80 border border-purple-400 text-purple-200 font-black">
            <Flame className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
            <span className="text-[11px] tracking-wider">LIVE WUB KEYBOARD</span>
          </div>

          {/* Preset Selector */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <select
              value={selectedPresetId}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer max-w-[160px] sm:max-w-[200px] truncate"
            >
              {SYNTH_PRESETS.map((p) => (
                <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Open Full Lab Button */}
          <button
            onClick={onOpenFullLab}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-bold transition cursor-pointer shadow-sm active:scale-95"
            title="Open Full Sound Design Lab with Modular Knobs & Oscilloscope"
          >
            <Sliders className="w-3 h-3 text-purple-300" />
            <span className="hidden sm:inline">FULL LAB</span>
          </button>
        </div>

        {/* Center: Wobble LFO Rate Sync Buttons */}
        <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
          <span className="text-[9px] font-bold text-zinc-400 px-1.5 hidden md:inline">WUB RATE:</span>
          {(['1/4', '1/8', '1/8T', '1/16', '1/16T'] as LfoRateSync[]).map((r) => (
            <button
              key={r}
              onClick={() => handleSetRate(r)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition cursor-pointer ${
                currentPatch.lfo.rateSync === r
                  ? 'bg-cyan-400 text-black font-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Right: Octave, Size Toggle, Panic Kill & Close */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Octave Controls */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-750 px-2 py-0.5 rounded-lg text-xs">
            <span className="text-[10px] text-zinc-400 font-bold">OCT:</span>
            <button
              onClick={() => setOctaveOffset((o) => Math.max(-2, o - 1))}
              className="px-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold cursor-pointer"
            >
              -
            </button>
            <span className="w-4 text-center font-black text-white text-[11px]">
              {octaveOffset >= 0 ? `+${octaveOffset}` : octaveOffset}
            </span>
            <button
              onClick={() => setOctaveOffset((o) => Math.min(2, o + 1))}
              className="px-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Quick Bake Dropdown / Buttons */}
          <div className="flex items-center gap-1">
            {activeDeckIds.map((deckId) => (
              <button
                key={deckId}
                onClick={() => handleQuickBake(deckId)}
                className="px-2 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-400 text-indigo-200 text-[10px] font-bold transition cursor-pointer active:scale-95 shadow-sm"
                title={`Quick Bake 4-Bar pattern to Deck ${deckId}`}
              >
                ⚡ {deckId}
              </button>
            ))}
          </div>

          {/* Panic Kill Audio Button */}
          <button
            onClick={() => {
              activeNotesMapRef.current.clear();
              setActiveNotes(new Set());
              WubSynthEngine.allNotesOff();
              AudioEngine.stopAllAudio();
              setKillFlashed(true);
              setTimeout(() => setKillFlashed(false), 900);
            }}
            className={`px-2 py-1 rounded-lg border text-xs font-mono font-black flex items-center gap-1 transition cursor-pointer select-none active:scale-95 ${
              killFlashed
                ? 'bg-rose-500 text-white border-white shadow-lg shadow-rose-500/80 animate-pulse'
                : 'bg-rose-950/90 hover:bg-rose-900 border-rose-500 text-rose-300'
            }`}
            title="KILL ALL AUDIO: Instantly silence stuck synth notes and all sound (Panic)"
          >
            <VolumeX className="w-3.5 h-3.5 text-rose-300" />
            <span>{killFlashed ? 'KILLED!' : 'KILL'}</span>
          </button>

          {/* Expand / Minimize Room Size */}
          <button
            onClick={() => setIsLargeSize((s) => !s)}
            className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 hover:text-white transition cursor-pointer"
            title={isLargeSize ? 'Compact Keyboard View' : 'Spacious Stage Keyboard View'}
          >
            {isLargeSize ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close Keyboard Bar */}
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-400 hover:text-white transition cursor-pointer"
            title="Hide Performance Keyboard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {quickBakeNotice && (
        <div className="px-3 py-1 rounded-lg bg-emerald-950 border border-emerald-400 text-emerald-300 text-xs font-mono font-bold animate-in fade-in duration-150">
          ✓ {quickBakeNotice}
        </div>
      )}

      {/* Spacious Interactive Piano Keyboard */}
      <div
        className={`relative flex bg-zinc-950 rounded-xl overflow-x-auto p-1.5 gap-1 border border-zinc-800 shadow-inner transition-all duration-200 touch-none select-none ${
          isLargeSize ? 'h-28 sm:h-36' : 'h-20 sm:h-24'
        }`}
      >
        {PIANO_KEYS.map((k) => {
          const currentMidi = k.midi + octaveOffset * 12;
          const isPressed = activeNotes.has(currentMidi);

          return (
            <button
              key={k.midi}
              onPointerDown={(e) => {
                e.preventDefault();
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch (_) {}
                handleNoteStart(k.midi);
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                try {
                  e.currentTarget.releasePointerCapture(e.pointerId);
                } catch (_) {}
                handleNoteEnd(k.midi);
              }}
              onPointerCancel={(e) => {
                e.preventDefault();
                handleNoteEnd(k.midi);
              }}
              onPointerLeave={() => {
                handleNoteEnd(k.midi);
              }}
              className={`flex-1 min-w-[28px] sm:min-w-[34px] rounded-lg flex flex-col justify-between p-1 transition-all cursor-pointer select-none touch-none active:scale-[0.98] ${
                k.isBlack
                  ? isPressed
                    ? 'bg-gradient-to-b from-purple-500 to-cyan-400 text-black border-2 border-white shadow-[0_0_20px_rgba(0,242,254,0.8)] z-10'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-750 shadow-md'
                  : isPressed
                  ? 'bg-gradient-to-b from-cyan-300 to-indigo-300 text-black border-2 border-white shadow-[0_0_25px_rgba(0,242,254,0.9)] z-10'
                  : 'bg-gradient-to-b from-zinc-800 to-zinc-850 hover:from-zinc-750 hover:to-zinc-800 text-zinc-200 border border-zinc-700 shadow-sm'
              }`}
            >
              {/* Computer Key Binding Label (at top of key) */}
              <div className="flex items-center justify-center">
                {k.keyLabel ? (
                  <span
                    className={`text-[9px] font-mono font-black px-1 rounded-sm ${
                      isPressed
                        ? 'bg-black text-cyan-300'
                        : k.isBlack
                        ? 'bg-zinc-950 text-cyan-400 border border-zinc-800'
                        : 'bg-zinc-900/90 text-zinc-400 border border-zinc-750'
                    }`}
                  >
                    {k.keyLabel}
                  </span>
                ) : (
                  <span className="h-3" />
                )}
              </div>

              {/* Note Name (at bottom of key) */}
              <div className="text-center font-mono font-black text-[9px] sm:text-[10px] leading-tight pb-0.5 truncate">
                {k.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
