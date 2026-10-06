import React from 'react';
import { CrossfaderCurve } from '../../types';
import { ArrowLeftRight } from 'lucide-react';

interface CrossfaderProps {
  crossfader: number; // -1 to +1
  curve: CrossfaderCurve;
  isHamster: boolean;
  onPositionChange: (pos: number) => void;
  onCurveChange: (curve: CrossfaderCurve) => void;
  onToggleHamster: () => void;
  isProMode: boolean;
}

export const Crossfader: React.FC<CrossfaderProps> = ({
  crossfader,
  curve,
  isHamster,
  onPositionChange,
  onCurveChange,
  onToggleHamster,
  isProMode,
}) => {
  return (
    <div className="flex flex-col gap-2.5 p-3 rounded-2xl bg-[#0a0a14] border-2 border-zinc-750 shadow-2xl w-full">
      {/* Top Bar: Labels, Hamster & Curve Selector */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-black text-white flex items-center gap-1.5 tracking-wider">
          <ArrowLeftRight className="w-4 h-4 text-cyan-400 stroke-[2.5]" />
          <span>CROSSFADER</span>
        </span>

        <div className="flex items-center gap-2">
          {/* Hamster Reverse Switch */}
          <button
            onClick={onToggleHamster}
            className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-black transition cursor-pointer select-none border-2 shadow-sm ${
              isHamster
                ? 'bg-amber-400 text-black border-white shadow-amber-400/30'
                : 'bg-zinc-850 text-zinc-300 hover:text-white border-zinc-700 hover:border-zinc-500'
            }`}
            title="Hamster Switch: Reverses Crossfader Sides"
          >
            HAMSTER {isHamster ? 'ON' : 'OFF'}
          </button>

          {/* Curve Selector */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-950 border-2 border-zinc-750 text-[9px] font-mono font-black shadow-inner">
            {(['smooth', 'linear', 'cut'] as CrossfaderCurve[]).map((c) => (
              <button
                key={c}
                onClick={() => onCurveChange(c)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer uppercase border ${
                  curve === c
                    ? 'bg-cyan-400 text-black border-white shadow-sm'
                    : 'text-zinc-400 hover:text-white border-transparent'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Crossfader Track & Slider */}
      <div className="relative flex items-center py-2 px-1">
        <span className="font-mono text-sm font-black text-cyan-400 pr-2 drop-shadow">A</span>
        <div className="flex-1 relative flex items-center">
          <input
            type="range"
            min={-1}
            max={1}
            step={0.01}
            value={crossfader}
            onChange={(e) => onPositionChange(parseFloat(e.target.value))}
            className="fader-horizontal w-full h-8"
          />
          {/* Center deadzone tick */}
          <div className="absolute left-1/2 top-1 bottom-1 w-0.5 bg-zinc-400 pointer-events-none opacity-70" />
        </div>
        <span className="font-mono text-sm font-black text-pink-400 pl-2 drop-shadow">B</span>
      </div>

      {/* Instant Cut Transform Buttons (Deck A / Center / Deck B) */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t-2 border-zinc-750">
        <button
          onClick={() => onPositionChange(-1)}
          className="flex-1 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-750 text-cyan-300 hover:text-white border-2 border-cyan-500/50 hover:border-cyan-400 text-[10px] font-mono font-black transition active:scale-95 cursor-pointer shadow-md shadow-cyan-950/30"
        >
          FULL A
        </button>
        <button
          onClick={() => onPositionChange(0)}
          className="flex-1 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-700 text-zinc-200 hover:text-white border-2 border-zinc-700 hover:border-zinc-500 text-[10px] font-mono font-black transition active:scale-95 cursor-pointer shadow-md"
        >
          CENTER (50/50)
        </button>
        <button
          onClick={() => onPositionChange(1)}
          className="flex-1 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-750 text-pink-300 hover:text-white border-2 border-pink-500/50 hover:border-pink-400 text-[10px] font-mono font-black transition active:scale-95 cursor-pointer shadow-md shadow-pink-950/30"
        >
          FULL B
        </button>
      </div>
    </div>
  );
};
