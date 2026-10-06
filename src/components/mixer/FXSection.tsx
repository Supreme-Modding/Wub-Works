import React, { useState } from 'react';
import { FXSlotState, FXType } from '../../types';
import { Sparkles, SlidersHorizontal, Power } from 'lucide-react';

interface FXSectionProps {
  fx1: FXSlotState;
  fx2: FXSlotState;
  onUpdateFX1: (fx: Partial<FXSlotState>) => void;
  onUpdateFX2: (fx: Partial<FXSlotState>) => void;
  bpm: number;
  deckId: string;
}

const FX_TYPES: { id: FXType; name: string; desc: string }[] = [
  { id: 'wobble', name: 'WOBBLE', desc: 'BPM-synced Dubstep LFO Lowpass Filter' },
  { id: 'echo', name: 'ECHO', desc: 'BPM-synced Tape Delay with high-cut filter' },
  { id: 'reverb', name: 'REVERB', desc: 'Algorithmic space wash' },
  { id: 'bitcrush', name: 'CRUSH', desc: 'Digital bit & rate destruction' },
  { id: 'flanger', name: 'FLANGER', desc: 'Jet-comb modulation sweep' },
  { id: 'phaser', name: 'PHASER', desc: '4-stage allpass phase rotation' },
  { id: 'gate', name: 'GATE', desc: '1/8th note dubstep chopper' },
];

export const FXSection: React.FC<FXSectionProps> = ({
  fx1,
  fx2,
  onUpdateFX1,
  onUpdateFX2,
  bpm,
  deckId,
}) => {
  const [activeDrawer, setActiveDrawer] = useState<'1' | '2' | null>(null);

  const renderSlot = (slot: FXSlotState, onUpdate: (fx: Partial<FXSlotState>) => void, slotNum: '1' | '2') => {
    return (
      <div className="flex flex-col gap-1 p-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[10px]">
        {/* Slot Top: Enable Button & FX Type selector */}
        <div className="flex items-center justify-between gap-1">
          <button
            onClick={() => onUpdate({ enabled: !slot.enabled })}
            className={`p-1 rounded-md transition cursor-pointer ${
              slot.enabled
                ? 'bg-cyan-500 text-black font-bold shadow-sm shadow-cyan-500/30'
                : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
            title={`Toggle FX ${slotNum}`}
          >
            <Power className="w-3 h-3" />
          </button>

          <select
            value={slot.type}
            onChange={(e) => onUpdate({ type: e.target.value as FXType })}
            className="flex-1 bg-zinc-800 border border-zinc-700 text-cyan-300 font-mono font-bold rounded px-1 py-0.5 text-[9px] cursor-pointer"
          >
            {FX_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setActiveDrawer(activeDrawer === slotNum ? null : slotNum)}
            className={`p-1 rounded text-zinc-400 hover:text-white transition cursor-pointer ${
              activeDrawer === slotNum ? 'bg-zinc-700 text-cyan-400' : ''
            }`}
            title="Fine-tune parameters"
          >
            <SlidersHorizontal className="w-3 h-3" />
          </button>
        </div>

        {/* Dry/Wet Knob */}
        <div className="flex items-center justify-between gap-1 pt-0.5">
          <span className="text-[8px] font-mono text-zinc-400">D/W:</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={slot.dryWet}
            onChange={(e) => onUpdate({ dryWet: parseFloat(e.target.value) })}
            className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-[8px] font-mono text-zinc-400 w-6 text-right">
            {Math.round(slot.dryWet * 100)}%
          </span>
        </div>

        {/* Parameter Drawer Popover */}
        {activeDrawer === slotNum && (
          <div className="mt-1 p-2 rounded-lg bg-zinc-950 border border-cyan-500/30 space-y-2 animate-in fade-in duration-150">
            <div className="flex justify-between items-center text-[9px] font-mono text-cyan-400 font-bold">
              <span>{slot.type.toUpperCase()} PARAMS</span>
              <span className="text-zinc-500">{bpm} BPM</span>
            </div>

            {/* Parameter 1 */}
            <div>
              <div className="flex justify-between text-[8px] font-mono text-zinc-400 mb-0.5">
                <span>{slot.type === 'wobble' ? 'LFO RATE' : slot.type === 'echo' ? 'BEAT TIME' : 'PARAM 1'}</span>
                <span>{Math.round(slot.param1 * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={slot.param1}
                onChange={(e) => onUpdate({ param1: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Parameter 2 */}
            <div>
              <div className="flex justify-between text-[8px] font-mono text-zinc-400 mb-0.5">
                <span>{slot.type === 'wobble' ? 'RESONANCE Q' : slot.type === 'echo' ? 'FEEDBACK' : 'PARAM 2'}</span>
                <span>{Math.round(slot.param2 * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={slot.param2}
                onChange={(e) => onUpdate({ param2: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center gap-1 text-[9px] font-mono uppercase font-bold text-zinc-400 pl-0.5">
        <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
        <span>FX SLOTS (CH {deckId})</span>
      </div>
      <div className="flex flex-col gap-1">
        {renderSlot(fx1, onUpdateFX1, '1')}
        {renderSlot(fx2, onUpdateFX2, '2')}
      </div>
    </div>
  );
};
