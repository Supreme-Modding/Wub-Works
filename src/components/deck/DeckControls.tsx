import React, { useState } from 'react';
import { Play, Pause, Disc, ArrowLeft, ArrowRight, Zap, RefreshCw } from 'lucide-react';

interface DeckControlsProps {
  isPlaying: boolean;
  isSlip: boolean;
  isReverse: boolean;
  isBraking: boolean;
  onTogglePlay: () => void;
  onCueDown: () => void;
  onCueUp: () => void;
  onToggleSlip: () => void;
  onToggleReverse: () => void;
  onTriggerBrake: () => void;
  onBeatJump: (beats: number) => void;
  colorAccent: string;
  isProMode: boolean;
}

const BEAT_JUMP_SIZES = [0.25, 0.5, 1, 2, 4, 8, 16, 32];

export const DeckControls: React.FC<DeckControlsProps> = ({
  isPlaying,
  isSlip,
  isReverse,
  isBraking,
  onTogglePlay,
  onCueDown,
  onCueUp,
  onToggleSlip,
  onToggleReverse,
  onTriggerBrake,
  onBeatJump,
  colorAccent,
  isProMode,
}) => {
  const [selectedJumpSize, setSelectedJumpSize] = useState<number>(4);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Primary Performance Buttons: CUE & PLAY (Large, high-contrast tactile targets) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* CDJ CUE BUTTON - High Contrast Pioneer Green */}
        <button
          onMouseDown={onCueDown}
          onMouseUp={onCueUp}
          onMouseLeave={onCueUp}
          onTouchStart={onCueDown}
          onTouchEnd={onCueUp}
          className="h-14 rounded-xl bg-gradient-to-b from-emerald-900/90 via-emerald-950 to-zinc-950 border-2 border-emerald-400 hover:border-emerald-300 text-emerald-300 hover:text-white font-mono text-base font-black shadow-lg shadow-emerald-500/25 active:scale-95 transition-all select-none cursor-pointer flex flex-col items-center justify-center leading-none ring-1 ring-emerald-500/30"
          style={{ textShadow: '0 0 10px rgba(16, 185, 129, 0.7)' }}
        >
          <span className="tracking-wider">CUE</span>
          <span className="text-[9px] font-sans text-emerald-400 font-bold mt-0.5 tracking-tight">PIONEER CDJ</span>
        </button>

        {/* PLAY / PAUSE BUTTON - High Contrast Electric Cyan / White */}
        <button
          onClick={onTogglePlay}
          style={
            isPlaying
              ? {
                  background: 'linear-gradient(180deg, #00f2fe 0%, #0284c7 100%)',
                  borderColor: '#ffffff',
                  boxShadow: '0 0 25px rgba(0, 242, 254, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                  color: '#000000',
                }
              : { textShadow: '0 0 10px rgba(0, 242, 254, 0.7)' }
          }
          className={`h-14 rounded-xl border-2 font-mono text-base font-black shadow-lg active:scale-95 transition-all select-none cursor-pointer flex items-center justify-center gap-2 ${
            isPlaying
              ? 'text-black ring-2 ring-cyan-300'
              : 'bg-gradient-to-b from-cyan-950/80 via-zinc-900 to-zinc-950 border-cyan-400 hover:border-cyan-300 text-cyan-300 hover:text-white shadow-cyan-500/20 ring-1 ring-cyan-500/30'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5 fill-current stroke-[3]" />
              <span className="tracking-wider">PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current stroke-[3]" />
              <span className="tracking-wider">PLAY</span>
            </>
          )}
        </button>
      </div>

      {/* Secondary Performance Deck Modes (Slip, Reverse, Brake) with High Contrast Borders */}
      <div className="flex items-center gap-2">
        {/* SLIP MODE */}
        <button
          onClick={onToggleSlip}
          className={`flex-1 py-2 px-1 rounded-xl border-2 text-[11px] font-mono font-bold transition select-none cursor-pointer flex items-center justify-center gap-1.5 shadow-md ${
            isSlip
              ? 'bg-amber-400 text-black border-white shadow-amber-400/50 animate-pulse font-black ring-2 ring-amber-300'
              : 'bg-[#14121e] border-amber-500/70 hover:border-amber-400 text-amber-300 hover:text-white hover:bg-amber-950/40'
          }`}
          title="Slip Mode: background playhead continues while scratching, looping or reversing"
        >
          <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>SLIP</span>
        </button>

        {/* REVERSE */}
        <button
          onClick={onToggleReverse}
          className={`flex-1 py-2 px-1 rounded-xl border-2 text-[11px] font-mono font-bold transition select-none cursor-pointer flex items-center justify-center gap-1.5 shadow-md ${
            isReverse
              ? 'bg-purple-500 text-black border-white shadow-purple-500/50 font-black ring-2 ring-purple-300'
              : 'bg-[#141022] border-purple-500/70 hover:border-purple-400 text-purple-300 hover:text-white hover:bg-purple-950/40'
          }`}
          title="Reverse Playback"
        >
          <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>REV</span>
        </button>

        {/* VINYL BRAKE */}
        <button
          onClick={onTriggerBrake}
          disabled={!isPlaying}
          className={`flex-1 py-2 px-1 rounded-xl border-2 text-[11px] font-mono font-bold transition select-none cursor-pointer flex items-center justify-center gap-1.5 shadow-md ${
            isBraking
              ? 'bg-rose-500 text-black border-white shadow-rose-500/50 font-black ring-2 ring-rose-300'
              : 'bg-[#181014] border-rose-500/70 hover:border-rose-400 text-rose-300 hover:text-white hover:bg-rose-950/40'
          }`}
          title="Turntable Vinyl Brake Stop"
        >
          <Disc className={`w-3.5 h-3.5 stroke-[2.5] ${isBraking ? 'animate-spin' : ''}`} />
          <span>BRAKE</span>
        </button>
      </div>

      {/* BEAT JUMP - High Contrast Tray */}
      <div className="flex items-center justify-between gap-1.5 p-2 rounded-xl bg-[#0b0b16] border-2 border-zinc-700 shadow-lg">
        <span className="text-[10px] font-mono text-zinc-200 uppercase font-black pl-1">
          BEAT JUMP:
        </span>
        
        {/* Jump backwards */}
        <button
          onClick={() => onBeatJump(-selectedJumpSize)}
          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white border-2 border-zinc-650 hover:border-zinc-400 active:scale-95 transition cursor-pointer shadow-sm"
          title={`Jump back ${selectedJumpSize} beats`}
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Jump size selector */}
        <select
          value={selectedJumpSize}
          onChange={(e) => setSelectedJumpSize(parseFloat(e.target.value))}
          className="bg-zinc-950 border-2 border-cyan-400 text-cyan-300 font-mono font-black rounded-lg px-2.5 py-1 text-xs text-center cursor-pointer shadow-inner"
        >
          {BEAT_JUMP_SIZES.map((beats) => (
            <option key={beats} value={beats}>
              {beats === 0.25 ? '1/4 Beat' : beats === 0.5 ? '1/2 Beat' : `${beats} Beats`}
            </option>
          ))}
        </select>

        {/* Jump forward */}
        <button
          onClick={() => onBeatJump(selectedJumpSize)}
          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white border-2 border-zinc-650 hover:border-zinc-400 active:scale-95 transition cursor-pointer shadow-sm"
          title={`Jump forward ${selectedJumpSize} beats`}
        >
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
