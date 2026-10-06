import React from 'react';
import { LoopState } from '../../types';
import { WaveformDivider } from '../common/WaveformDivider';
import { Repeat } from 'lucide-react';

interface LoopSectionProps {
  loop: LoopState;
  bpm: number;
  onSetAutoLoop: (beats: number) => void;
  onToggleLoop: () => void;
  onHalveLoop: () => void;
  onDoubleLoop: () => void;
  onStartRoll: (beats: number) => void;
  onStopRoll: () => void;
  isProMode: boolean;
}

const COMMON_LOOP_LENGTHS = [1, 2, 4, 8, 16];
const ROLL_LENGTHS = [0.125, 0.25, 0.5, 1]; // 1/8, 1/4, 1/2, 1 beat

export const LoopSection: React.FC<LoopSectionProps> = ({
  loop,
  bpm,
  onSetAutoLoop,
  onToggleLoop,
  onHalveLoop,
  onDoubleLoop,
  onStartRoll,
  onStopRoll,
  isProMode,
}) => {
  return (
    <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-[#0b0b16] border-2 border-zinc-700 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Repeat className={`w-4 h-4 ${loop.active ? 'text-cyan-400 animate-spin' : 'text-zinc-200'}`} />
          <span className="text-[11px] font-mono uppercase tracking-wider text-white font-black">
            LOOP &amp; ROLL
          </span>
        </div>

        {/* Loop Active indicator & Toggle with High Contrast */}
        <button
          onClick={onToggleLoop}
          className={`px-3 py-1 rounded-lg text-[10px] font-mono font-black transition cursor-pointer select-none border-2 shadow-md ${
            loop.active
              ? 'bg-cyan-400 text-black border-white shadow-cyan-400/40 ring-2 ring-cyan-300'
              : 'bg-zinc-800 text-zinc-200 hover:text-white border-zinc-600 hover:border-zinc-400'
          }`}
        >
          {loop.active ? `${loop.lengthBeats} BEATS ON` : 'LOOP OFF'}
        </button>
      </div>

      {/* Auto Loop presets with High-Contrast defined buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onHalveLoop}
          className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-2 border-zinc-650 text-[11px] font-mono font-black transition cursor-pointer select-none active:scale-95 shadow-sm"
          title="Halve loop length (/2)"
        >
          /2
        </button>

        {COMMON_LOOP_LENGTHS.map((beats) => (
          <button
            key={beats}
            onClick={() => onSetAutoLoop(beats)}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-mono font-black transition cursor-pointer select-none active:scale-95 border-2 ${
              loop.active && loop.lengthBeats === beats
                ? 'bg-cyan-400 text-black border-white shadow-md shadow-cyan-400/30'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-650 hover:border-zinc-400'
            }`}
          >
            {beats}
          </button>
        ))}

        <button
          onClick={onDoubleLoop}
          className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-2 border-zinc-650 text-[11px] font-mono font-black transition cursor-pointer select-none active:scale-95 shadow-sm"
          title="Double loop length (x2)"
        >
          2x
        </button>
      </div>

      {/* Momentary Loop Roll with Waveform Divider and High Contrast Crimson Pads */}
      {isProMode && (
        <div className="pt-1">
          <WaveformDivider color="#f43f5e" variant="compact" height={6} />
          <div className="flex items-center justify-between mb-1.5 mt-0.5">
            <span className="text-[10px] font-mono text-zinc-200 uppercase font-black">
              MOMENTARY SLIP ROLL (HOLD)
            </span>
            <span className="text-[9px] font-mono text-zinc-400 font-bold">SLIP FX</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {ROLL_LENGTHS.map((beats) => (
              <button
                key={beats}
                onMouseDown={() => onStartRoll(beats)}
                onMouseUp={onStopRoll}
                onMouseLeave={onStopRoll}
                onTouchStart={() => onStartRoll(beats)}
                onTouchEnd={onStopRoll}
                className="py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 active:bg-rose-400 active:text-black border-2 border-rose-500 hover:border-rose-300 text-rose-100 hover:text-white text-xs font-mono font-black transition select-none cursor-pointer text-center shadow-md shadow-rose-950/50"
              >
                {beats === 0.125 ? '1/8' : beats === 0.25 ? '1/4' : beats === 0.5 ? '1/2' : '1'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
