import React from 'react';
import { Lock, Unlock, RotateCcw, Activity } from 'lucide-react';

interface TempoPitchSectionProps {
  bpm: number;
  detectedBpm: number;
  tempoPercent: number;
  tempoRange: 4 | 8 | 16 | 50 | 100;
  keyLock: boolean;
  isSync: boolean;
  isMaster: boolean;
  keyVal: string;
  keyStandard: string;
  keyshift: number;
  onTempoChange: (val: number) => void;
  onRangeChange: (range: 4 | 8 | 16 | 50 | 100) => void;
  onToggleKeyLock: () => void;
  onToggleSync: () => void;
  onNudge: (cents: number) => void;
  onReleaseNudge: () => void;
  onKeyshiftChange: (semitones: number) => void;
  isProMode: boolean;
}

export const TempoPitchSection: React.FC<TempoPitchSectionProps> = ({
  bpm,
  detectedBpm,
  tempoPercent,
  tempoRange,
  keyLock,
  isSync,
  isMaster,
  keyVal,
  keyStandard,
  keyshift,
  onTempoChange,
  onRangeChange,
  onToggleKeyLock,
  onToggleSync,
  onNudge,
  onReleaseNudge,
  onKeyshiftChange,
  isProMode,
}) => {
  const currentBpm = (detectedBpm * (1 + tempoPercent / 100)).toFixed(1);

  return (
    <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-[#0b0b16] border-2 border-zinc-700 shadow-lg">
      {/* Top Bar: BPM & Camelot Key */}
      <div className="flex items-center justify-between">
        {/* Dynamic BPM display */}
        <div className="flex items-baseline gap-2 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-750 shadow-inner">
          <span className="text-xl font-black font-mono tracking-tight text-white drop-shadow">
            {currentBpm}
          </span>
          <span className="text-[10px] font-mono text-zinc-400 font-black">BPM</span>
          {tempoPercent !== 0 && (
            <span className={`text-[10px] font-mono font-black ${tempoPercent > 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
              {tempoPercent > 0 ? `+${tempoPercent.toFixed(1)}%` : `${tempoPercent.toFixed(1)}%`}
            </span>
          )}
        </div>

        {/* Camelot Key Badge & SYNC */}
        <div className="flex items-center gap-2">
          <div
            className="px-2.5 py-1 rounded-lg bg-indigo-950/90 border-2 border-indigo-400 text-indigo-100 font-mono text-xs font-black flex items-center gap-1 shadow-md shadow-indigo-950/40"
            title={`Harmonic Wheel: ${keyVal} (${keyStandard})`}
          >
            <span>{keyVal}</span>
            <span className="text-[10px] opacity-80">({keyStandard})</span>
          </div>

          {/* High-Contrast Sync Button */}
          <button
            onClick={onToggleSync}
            className={`px-3.5 py-1 rounded-lg text-xs font-mono font-black transition select-none cursor-pointer flex items-center gap-1 border-2 shadow-md ${
              isSync
                ? 'bg-cyan-400 text-black border-white shadow-cyan-400/40 ring-2 ring-cyan-400'
                : 'bg-zinc-800 border-zinc-650 hover:border-cyan-400 text-cyan-300 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>SYNC</span>
          </button>
        </div>
      </div>

      {/* Pitch Fader Slider */}
      <div className="flex items-center gap-2">
        {/* Pitch Range selector */}
        {isProMode && (
          <select
            value={tempoRange}
            onChange={(e) => onRangeChange(Number(e.target.value) as 4 | 8 | 16 | 50 | 100)}
            className="bg-zinc-950 border-2 border-zinc-700 text-zinc-200 font-bold rounded-lg px-1.5 py-1 text-[10px] font-mono cursor-pointer shadow-inner"
            title="Pitch Fader Range"
          >
            <option value={4}>±4%</option>
            <option value={8}>±8%</option>
            <option value={16}>±16%</option>
            <option value={50}>±50%</option>
            <option value={100}>WIDE</option>
          </select>
        )}

        {/* Slider */}
        <div className="flex-1 relative flex items-center">
          <input
            type="range"
            min={-tempoRange}
            max={tempoRange}
            step={0.1}
            value={tempoPercent}
            onChange={(e) => onTempoChange(parseFloat(e.target.value))}
            className="fader-horizontal w-full h-7"
          />
          {/* Center 0% indicator line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-zinc-500 pointer-events-none opacity-60" />
        </div>

        {/* Zero Reset Button */}
        <button
          onClick={() => onTempoChange(0)}
          className={`p-1.5 rounded-lg border transition cursor-pointer ${
            tempoPercent === 0
              ? 'border-transparent text-zinc-600 opacity-40'
              : 'border-zinc-700 bg-zinc-800 text-cyan-400 hover:text-white hover:border-cyan-400 shadow-sm'
          }`}
          title="Reset Tempo to 0.0%"
        >
          <RotateCcw className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Pitch Bend Nudge & Key Lock & Keyshift with High Contrast */}
      <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-zinc-750">
        {/* Pitch Nudge buttons */}
        <div className="flex items-center gap-1">
          <button
            onMouseDown={() => onNudge(-40)}
            onMouseUp={onReleaseNudge}
            onMouseLeave={onReleaseNudge}
            onTouchStart={() => onNudge(-40)}
            onTouchEnd={onReleaseNudge}
            className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:bg-cyan-400 active:text-black text-white border border-zinc-650 text-xs font-mono font-black transition select-none cursor-pointer shadow-sm"
            title="Nudge Tempo Slow (-)"
          >
            -
          </button>
          <button
            onMouseDown={() => onNudge(40)}
            onMouseUp={onReleaseNudge}
            onMouseLeave={onReleaseNudge}
            onTouchStart={() => onNudge(40)}
            onTouchEnd={onReleaseNudge}
            className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:bg-cyan-400 active:text-black text-white border border-zinc-650 text-xs font-mono font-black transition select-none cursor-pointer shadow-sm"
            title="Nudge Tempo Fast (+)"
          >
            +
          </button>
        </div>

        {/* Key Lock (Master Tempo) */}
        <button
          onClick={onToggleKeyLock}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-mono font-black transition select-none cursor-pointer border-2 ${
            keyLock
              ? 'bg-purple-600 text-white border-purple-300 shadow-md shadow-purple-600/30'
              : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
          }`}
          title="Key Lock: Pitch stays locked when tempo changes"
        >
          {keyLock ? <Lock className="w-3.5 h-3.5 text-white stroke-[2.5]" /> : <Unlock className="w-3.5 h-3.5 stroke-[2.5]" />}
          <span>KEY LOCK</span>
        </button>

        {/* Pro Keyshift */}
        {isProMode && (
          <div className="flex items-center gap-1 bg-zinc-950 px-2 py-0.5 rounded-lg border-2 border-zinc-750 text-[10px] font-mono font-bold shadow-inner">
            <span className="text-zinc-400">SHIFT:</span>
            <button
              onClick={() => onKeyshiftChange(Math.max(-12, keyshift - 1))}
              className="text-zinc-200 hover:text-white px-1 text-xs font-black"
            >
              -
            </button>
            <span className={`font-black ${keyshift !== 0 ? 'text-cyan-400' : 'text-zinc-200'}`}>
              {keyshift > 0 ? `+${keyshift}` : keyshift}
            </span>
            <button
              onClick={() => onKeyshiftChange(Math.min(12, keyshift + 1))}
              className="text-zinc-200 hover:text-white px-1 text-xs font-black"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
