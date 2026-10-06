import React from 'react';
import { ChannelMixerState, DeckId, FXSlotState } from '../../types';
import { FXSection } from './FXSection';
import { KnobSlider } from '../common/KnobSlider';
import { Headphones } from 'lucide-react';

interface ChannelStripProps {
  id: DeckId;
  channel: ChannelMixerState;
  bpm: number;
  colorAccent: string;
  onUpdateChannel: (id: DeckId, updates: Partial<ChannelMixerState>) => void;
  onUpdateFX1: (id: DeckId, fx: Partial<FXSlotState>) => void;
  onUpdateFX2: (id: DeckId, fx: Partial<FXSlotState>) => void;
  isProMode: boolean;
}

export const ChannelStrip: React.FC<ChannelStripProps> = ({
  id,
  channel,
  bpm,
  colorAccent,
  onUpdateChannel,
  onUpdateFX1,
  onUpdateFX2,
  isProMode,
}) => {
  const isClipped = Boolean(channel.isClipping || channel.vuLeft >= 0.96 || channel.vuRight >= 0.96);

  return (
    <div className="flex flex-col items-center gap-2.5 p-2.5 rounded-2xl bg-[#0a0a14] border-2 border-zinc-750 shadow-2xl min-w-[150px] flex-1">
      {/* Channel Header */}
      <div className="flex items-center justify-between w-full pb-1.5 border-b-2 border-zinc-750">
        <span
          style={{ color: colorAccent }}
          className="font-mono font-black text-sm tracking-wider drop-shadow"
        >
          CH {id}
        </span>
        {/* PFL Headphone Cue button - High Contrast Amber */}
        <button
          onClick={() => onUpdateChannel(id, { pflCue: !channel.pflCue })}
          className={`p-1.5 rounded-xl border-2 transition cursor-pointer shadow-md ${
            channel.pflCue
              ? 'bg-amber-400 text-black border-white font-black shadow-amber-400/40 ring-2 ring-amber-400'
              : 'bg-zinc-850 border-zinc-700 text-zinc-400 hover:text-amber-300 hover:border-amber-400'
          }`}
          title="Headphone Monitor (PFL CUE)"
        >
          <Headphones className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* GAIN TRIM WITH LEFT-TO-RIGHT SLIDER */}
      <div className="w-full">
        <KnobSlider
          label="GAIN"
          value={channel.gain}
          min={-12}
          max={12}
          step={0.5}
          defaultValue={0}
          onChange={(v) => onUpdateChannel(id, { gain: v })}
          displayUnit="dB"
          colorAccent={colorAccent}
          className="w-full"
        />
      </div>

      {/* 3-BAND EQ WITH HORIZONTAL LEFT-TO-RIGHT SLIDERS & KILL SWITCHES */}
      <div className="flex flex-col items-center gap-2.5 w-full pt-1.5 border-t border-zinc-750">
        {/* HIGH EQ */}
        <div className="w-full bg-zinc-900/60 p-1.5 rounded-xl border border-zinc-800 space-y-1">
          <KnobSlider
            label="HI EQ"
            value={channel.eqHigh}
            min={-24}
            max={6}
            step={0.5}
            defaultValue={0}
            onChange={(v) => onUpdateChannel(id, { eqHigh: v })}
            displayUnit="dB"
            colorAccent="#00f2fe"
            className="w-full"
          />
          <button
            onClick={() => onUpdateChannel(id, { killHigh: !channel.killHigh })}
            className={`w-full py-1 rounded-lg text-[9px] font-mono font-black transition select-none cursor-pointer border-2 shadow-sm ${
              channel.killHigh
                ? 'bg-red-500 text-black border-white shadow-red-500/40 animate-pulse'
                : 'bg-red-950/80 hover:bg-red-900 border-red-500/80 text-red-200 hover:text-white'
            }`}
            title="Kill Highs"
          >
            KILL HI
          </button>
        </div>

        {/* MID EQ */}
        <div className="w-full bg-zinc-900/60 p-1.5 rounded-xl border border-zinc-800 space-y-1">
          <KnobSlider
            label="MID EQ"
            value={channel.eqMid}
            min={-24}
            max={6}
            step={0.5}
            defaultValue={0}
            onChange={(v) => onUpdateChannel(id, { eqMid: v })}
            displayUnit="dB"
            colorAccent="#10b981"
            className="w-full"
          />
          <button
            onClick={() => onUpdateChannel(id, { killMid: !channel.killMid })}
            className={`w-full py-1 rounded-lg text-[9px] font-mono font-black transition select-none cursor-pointer border-2 shadow-sm ${
              channel.killMid
                ? 'bg-red-500 text-black border-white shadow-red-500/40 animate-pulse'
                : 'bg-red-950/80 hover:bg-red-900 border-red-500/80 text-red-200 hover:text-white'
            }`}
            title="Kill Mids"
          >
            KILL MID
          </button>
        </div>

        {/* LOW EQ (Sub-Bass) */}
        <div className="w-full bg-zinc-900/60 p-1.5 rounded-xl border border-zinc-800 space-y-1">
          <KnobSlider
            label="LOW EQ"
            value={channel.eqLow}
            min={-24}
            max={6}
            step={0.5}
            defaultValue={0}
            onChange={(v) => onUpdateChannel(id, { eqLow: v })}
            displayUnit="dB"
            colorAccent="#ec4899"
            className="w-full"
          />
          <button
            onClick={() => onUpdateChannel(id, { killLow: !channel.killLow })}
            className={`w-full py-1 rounded-lg text-[9px] font-mono font-black transition select-none cursor-pointer border-2 shadow-md ${
              channel.killLow
                ? 'bg-red-500 text-black border-white shadow-red-500/50 ring-2 ring-red-400 animate-pulse'
                : 'bg-red-950/90 hover:bg-red-900 border-red-500 text-red-100 hover:text-white'
            }`}
            title="Kill Sub & Lows (Dubstep bass swap)"
          >
            KILL LOW
          </button>
        </div>
      </div>

      {/* BIPOLAR DJ FILTER WITH LEFT-TO-RIGHT SLIDER */}
      <div className="w-full py-1.5 border-t border-zinc-750">
        <KnobSlider
          label="FILTER (LP ◄ ► HP)"
          value={channel.filter}
          min={-1}
          max={1}
          step={0.02}
          defaultValue={0}
          onChange={(v) => onUpdateChannel(id, { filter: v })}
          isFilter
          colorAccent="#00f2fe"
          className="w-full"
        />
      </div>

      {/* DUAL FX SLOTS */}
      {isProMode && (
        <div className="w-full border-t border-zinc-750 pt-1.5">
          <FXSection
            fx1={channel.fx1}
            fx2={channel.fx2}
            onUpdateFX1={(fx) => onUpdateFX1(id, fx)}
            onUpdateFX2={(fx) => onUpdateFX2(id, fx)}
            bpm={bpm}
            deckId={id}
          />
        </div>
      )}

      {/* Crossfader Assign Selector */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-950 border-2 border-zinc-750 text-[9px] font-mono font-black w-full justify-center shadow-inner">
        {(['A', 'THRU', 'B'] as const).map((assign) => (
          <button
            key={assign}
            onClick={() => onUpdateChannel(id, { crossfaderAssign: assign })}
            className={`flex-1 py-1 rounded-lg transition cursor-pointer border ${
              channel.crossfaderAssign === assign
                ? 'bg-cyan-500 text-black border-white shadow-sm'
                : 'text-zinc-400 hover:text-white border-transparent'
            }`}
          >
            {assign}
          </button>
        ))}
      </div>

      {/* VOLUME FADER & STEREO VU METERS */}
      <div className="flex items-center justify-center gap-2 w-full h-36 pt-1">
        {/* Vertical Volume Fader */}
        <div className="relative h-full flex flex-col items-center justify-between py-1">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={channel.volume}
            onChange={(e) => onUpdateChannel(id, { volume: parseFloat(e.target.value) })}
            className="fader-vertical h-28 cursor-pointer"
          />
          <span className="text-[9px] font-mono font-bold text-zinc-300">
            {Math.round(channel.volume * 100)}%
          </span>
        </div>

        {/* High-Definition VU Meter Column with 0dB Digital Clipping Warning Indicator */}
        <div
          className={`flex flex-col items-center justify-between gap-1 h-28 w-6 bg-zinc-950 rounded-lg p-1 border-2 transition-all duration-100 shadow-inner ${
            isClipped
              ? 'border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)] ring-1 ring-red-400'
              : 'border-zinc-750'
          }`}
          title={`Channel ${id} VU Level: Left ${Math.round(channel.vuLeft * 100)}%, Right ${Math.round(
            channel.vuRight * 100
          )}% ${
            isClipped
              ? '⚠️ SIGNAL EXCEEDS 0dB (DIGITAL CLIPPING)! Turn down GAIN or EQ boost to eliminate clipping distortion.'
              : '✓ Clean signal headroom (<= 0dB)'
          }`}
        >
          {/* Visual Warning Clip Lamp (Lights up red when signal exceeds 0dB) */}
          <div
            className={`w-full text-center text-[7px] font-mono font-black tracking-tighter px-0.5 py-0.5 rounded-xs border select-none transition-all duration-75 ${
              isClipped
                ? 'bg-red-600 text-white border-white shadow-[0_0_8px_#ef4444] animate-pulse'
                : 'bg-zinc-900 text-zinc-600 border-zinc-800'
            }`}
          >
            CLIP
          </div>

          {/* Stereo Bars */}
          <div className="flex items-center gap-1 h-18 w-full justify-center">
            <div className="relative w-1.5 h-full bg-zinc-900 rounded-xs overflow-hidden flex flex-col-reverse border border-zinc-800/80">
              <div
                style={{
                  height: `${Math.min(100, channel.vuLeft * 100)}%`,
                  background: isClipped
                    ? 'linear-gradient(0deg, #10b981 0%, #f59e0b 65%, #ef4444 85%, #ff0055 100%)'
                    : 'linear-gradient(0deg, #10b981 0%, #10b981 65%, #f59e0b 85%, #f43f5e 100%)',
                  boxShadow: isClipped ? '0 0 6px #ef4444' : undefined,
                }}
                className="w-full transition-all duration-75"
              />
            </div>
            <div className="relative w-1.5 h-full bg-zinc-900 rounded-xs overflow-hidden flex flex-col-reverse border border-zinc-800/80">
              <div
                style={{
                  height: `${Math.min(100, channel.vuRight * 100)}%`,
                  background: isClipped
                    ? 'linear-gradient(0deg, #10b981 0%, #f59e0b 65%, #ef4444 85%, #ff0055 100%)'
                    : 'linear-gradient(0deg, #10b981 0%, #10b981 65%, #f59e0b 85%, #f43f5e 100%)',
                  boxShadow: isClipped ? '0 0 6px #ef4444' : undefined,
                }}
                className="w-full transition-all duration-75"
              />
            </div>
          </div>

          <span
            className={`text-[7px] font-mono font-bold select-none ${
              isClipped ? 'text-red-400 font-black animate-pulse' : 'text-zinc-500'
            }`}
          >
            0dB
          </span>
        </div>
      </div>
    </div>
  );
};
