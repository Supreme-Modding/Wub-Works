import React from 'react';
import { ChannelMixerState, DeckId, FXSlotState } from '../../types';
import { FXSection } from '../mixer/FXSection';
import { WaveformDivider } from '../common/WaveformDivider';
import { KnobSlider } from '../common/KnobSlider';
import { Headphones, Activity } from 'lucide-react';

interface IntegratedChannelMixerProps {
  id: DeckId;
  channel: ChannelMixerState;
  bpm: number;
  colorAccent: string;
  onUpdateChannel: (id: DeckId, updates: Partial<ChannelMixerState>) => void;
  onUpdateFX1: (id: DeckId, fx: Partial<FXSlotState>) => void;
  onUpdateFX2: (id: DeckId, fx: Partial<FXSlotState>) => void;
  isProMode: boolean;
}

export const IntegratedChannelMixer: React.FC<IntegratedChannelMixerProps> = ({
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

  // Helper for 5-segment LED frequency band meter
  const renderLedMeter = (val: number, activeColor: string, isKill: boolean) => {
    // 5 segments: thresholds 0.15, 0.35, 0.55, 0.75, 0.90
    const thresholds = [0.15, 0.35, 0.55, 0.75, 0.9];
    const effectiveVal = isKill ? 0 : Math.min(1, Math.max(0, val));

    return (
      <div
        className="flex flex-col gap-0.5 h-8 w-2 bg-zinc-950 p-0.5 rounded border border-zinc-750 shadow-inner justify-end"
        title={`Band level: ${Math.round(effectiveVal * 100)}%`}
      >
        {thresholds.map((th, idx) => {
          const revIdx = thresholds.length - 1 - idx; // top to bottom
          const threshold = thresholds[revIdx];
          const isLit = effectiveVal >= threshold;
          const isPeak = revIdx >= 4;

          return (
            <div
              key={idx}
              style={{
                backgroundColor: isLit
                  ? isPeak
                    ? '#f43f5e'
                    : activeColor
                  : '#1c1c28',
                boxShadow: isLit
                  ? `0 0 4px ${isPeak ? '#f43f5e' : activeColor}`
                  : undefined,
              }}
              className="w-full h-1 rounded-xs transition-colors duration-75"
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-[#0b0b16] border-2 border-zinc-700 shadow-xl h-full justify-between relative overflow-hidden">
      {/* Top subtle highlight */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />

      {/* 1. CHANNEL STRIP HEADER: PFL Cue + Gain Trim Slider */}
      <div className="flex items-center justify-between gap-1 pb-1">
        <div className="flex items-center gap-1.5">
          <span
            style={{ color: colorAccent }}
            className="text-[11px] font-mono font-black drop-shadow tracking-wider"
          >
            MIXER {id}
          </span>
          <span className="text-[9px] font-mono font-bold text-zinc-400">CH STRIP</span>
        </div>

        {/* PFL Headphone Monitor button */}
        <button
          onClick={() => onUpdateChannel(id, { pflCue: !channel.pflCue })}
          className={`px-2 py-1 rounded-lg border-2 transition cursor-pointer flex items-center gap-1 select-none active:scale-95 shadow-md ${
            channel.pflCue
              ? 'bg-amber-400 text-black border-white font-black shadow-amber-400/50 ring-2 ring-amber-300'
              : 'bg-zinc-850 border-zinc-650 text-zinc-300 hover:text-amber-300 hover:border-amber-400 hover:bg-zinc-800'
          }`}
          title="Headphone Monitor (PFL CUE)"
        >
          <Headphones className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="text-[9px] font-mono font-black">CUE</span>
        </button>

        {/* GAIN TRIM WITH LEFT-TO-RIGHT SLIDER BAR */}
        <div className="w-24">
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
            compact
            className="w-full"
          />
        </div>
      </div>

      {/* Waveform Divider */}
      <WaveformDivider color={colorAccent} variant="compact" height={8} />

      {/* 2. REAL-TIME 3-BAND FREQUENCY METERS & EQUALIZER CONTROLS WITH LEFT-TO-RIGHT SLIDE BARS */}
      <div className="flex flex-col gap-1.5 py-1">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1 text-[9px] font-mono font-black text-zinc-300 uppercase tracking-wider">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>3-BAND EQ (SLIDE LEFT ◄ ► RIGHT)</span>
          </div>
          <span className="text-[8px] font-mono text-zinc-400 font-bold">POST-EQ SPECTRUM</span>
        </div>

        {/* 3 Columns: HI, MID, LOW with integrated dials, LED meters, and left-to-right slider bars */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-lg bg-zinc-950/80 border border-zinc-750 shadow-inner">
          {/* HIGH BAND */}
          <div className="flex flex-col items-center gap-1 bg-zinc-900/60 p-1.5 rounded-lg border border-zinc-800">
            <KnobSlider
              label="HI"
              value={channel.eqHigh}
              min={-24}
              max={6}
              step={0.5}
              defaultValue={0}
              onChange={(v) => onUpdateChannel(id, { eqHigh: v })}
              displayUnit="dB"
              colorAccent="#00f2fe"
              accessory={renderLedMeter(channel.freqHigh, '#00f2fe', channel.killHigh)}
              className="w-full"
            />
            <button
              onClick={() => onUpdateChannel(id, { killHigh: !channel.killHigh })}
              className={`w-full py-1 rounded-md text-[9px] font-mono font-black transition cursor-pointer select-none active:scale-95 border-2 shadow-sm ${
                channel.killHigh
                  ? 'bg-red-500 text-black border-white shadow-red-500/50'
                  : 'bg-red-950/90 hover:bg-red-900 border-red-500/80 text-red-200 hover:text-white'
              }`}
              title="Kill High Frequencies"
            >
              KILL HI
            </button>
          </div>

          {/* MID BAND */}
          <div className="flex flex-col items-center gap-1 bg-zinc-900/60 p-1.5 rounded-lg border border-zinc-800">
            <KnobSlider
              label="MID"
              value={channel.eqMid}
              min={-24}
              max={6}
              step={0.5}
              defaultValue={0}
              onChange={(v) => onUpdateChannel(id, { eqMid: v })}
              displayUnit="dB"
              colorAccent="#10b981"
              accessory={renderLedMeter(channel.freqMid, '#10b981', channel.killMid)}
              className="w-full"
            />
            <button
              onClick={() => onUpdateChannel(id, { killMid: !channel.killMid })}
              className={`w-full py-1 rounded-md text-[9px] font-mono font-black transition cursor-pointer select-none active:scale-95 border-2 shadow-sm ${
                channel.killMid
                  ? 'bg-red-500 text-black border-white shadow-red-500/50'
                  : 'bg-red-950/90 hover:bg-red-900 border-red-500/80 text-red-200 hover:text-white'
              }`}
              title="Kill Mid Frequencies"
            >
              KILL MID
            </button>
          </div>

          {/* LOW BAND (Sub Bass) */}
          <div className="flex flex-col items-center gap-1 bg-zinc-900/60 p-1.5 rounded-lg border border-zinc-800">
            <KnobSlider
              label="LOW"
              value={channel.eqLow}
              min={-24}
              max={6}
              step={0.5}
              defaultValue={0}
              onChange={(v) => onUpdateChannel(id, { eqLow: v })}
              displayUnit="dB"
              colorAccent="#ec4899"
              accessory={renderLedMeter(channel.freqLow, '#ec4899', channel.killLow)}
              className="w-full"
            />
            <button
              onClick={() => onUpdateChannel(id, { killLow: !channel.killLow })}
              className={`w-full py-1 rounded-md text-[9px] font-mono font-black transition cursor-pointer select-none active:scale-95 border-2 shadow-sm ${
                channel.killLow
                  ? 'bg-red-500 text-black border-white shadow-red-500/50 animate-pulse'
                  : 'bg-red-950/90 hover:bg-red-900 border-red-500 text-red-100 hover:text-white'
              }`}
              title="Kill Sub & Bass Frequencies"
            >
              KILL LOW
            </button>
          </div>
        </div>

        {/* Real-time Spectrum Output Bar Gauge (Low, Mid, High) */}
        <div className="flex flex-col gap-1 px-1 py-1 rounded bg-zinc-950 border border-zinc-800">
          <div className="flex items-center justify-between text-[8px] font-mono font-black text-zinc-400">
            <span>BAND METERS:</span>
            <div className="flex gap-2">
              <span className="text-pink-400">LOW: {channel.killLow ? 'CUT' : `${Math.round(channel.freqLow * 100)}%`}</span>
              <span className="text-emerald-400">MID: {channel.killMid ? 'CUT' : `${Math.round(channel.freqMid * 100)}%`}</span>
              <span className="text-cyan-400">HI: {channel.killHigh ? 'CUT' : `${Math.round(channel.freqHigh * 100)}%`}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 h-2 bg-zinc-900 rounded overflow-hidden p-0.5">
            {/* Low bar */}
            <div className="relative bg-zinc-950 rounded-xs overflow-hidden h-full">
              <div
                style={{
                  width: `${channel.killLow ? 0 : Math.min(100, channel.freqLow * 100)}%`,
                  background: 'linear-gradient(90deg, #ec4899 0%, #f43f5e 100%)',
                  boxShadow: channel.freqLow > 0.4 ? '0 0 6px #ec4899' : undefined,
                }}
                className="h-full transition-all duration-75"
              />
            </div>
            {/* Mid bar */}
            <div className="relative bg-zinc-950 rounded-xs overflow-hidden h-full">
              <div
                style={{
                  width: `${channel.killMid ? 0 : Math.min(100, channel.freqMid * 100)}%`,
                  background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
                  boxShadow: channel.freqMid > 0.4 ? '0 0 6px #10b981' : undefined,
                }}
                className="h-full transition-all duration-75"
              />
            </div>
            {/* High bar */}
            <div className="relative bg-zinc-950 rounded-xs overflow-hidden h-full">
              <div
                style={{
                  width: `${channel.killHigh ? 0 : Math.min(100, channel.freqHigh * 100)}%`,
                  background: 'linear-gradient(90deg, #00f2fe 0%, #ffffff 100%)',
                  boxShadow: channel.freqHigh > 0.4 ? '0 0 6px #00f2fe' : undefined,
                }}
                className="h-full transition-all duration-75"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Waveform Divider */}
      <WaveformDivider color={colorAccent} variant="compact" height={8} />

      {/* 3. BIPOLAR DJ FILTER WITH HORIZONTAL LEFT-TO-RIGHT SLIDER BAR & CROSSFADER ASSIGN */}
      <div className="flex items-center justify-between gap-3 py-1">
        <div className="flex-1 flex justify-center">
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
            className="w-full max-w-[210px]"
          />
        </div>

        {/* Crossfader Assign (A / THRU / B) with High Contrast Buttons */}
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <span className="text-[8px] font-mono text-zinc-300 font-black">X-FADER</span>
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-950 border-2 border-zinc-700 text-[8px] font-mono font-black shadow-inner">
            {(['A', 'THRU', 'B'] as const).map((assign) => (
              <button
                key={assign}
                onClick={() => onUpdateChannel(id, { crossfaderAssign: assign })}
                className={`px-2 py-1 rounded transition select-none cursor-pointer border ${
                  channel.crossfaderAssign === assign
                    ? 'bg-cyan-400 text-black border-white font-black shadow-md shadow-cyan-400/30'
                    : 'bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {assign}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Waveform Divider */}
      <WaveformDivider color={colorAccent} variant="compact" height={8} />

      {/* 4. VOLUME FADER & STEREO PEAK VU METERS */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex-1 flex items-center gap-2">
          <span className="text-[10px] font-mono font-black text-zinc-200">VOL:</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={channel.volume}
            onChange={(e) => onUpdateChannel(id, { volume: parseFloat(e.target.value) })}
            className="fader-horizontal flex-1 h-7 cursor-pointer"
          />
          <span className="text-[10px] font-mono text-white w-9 text-right font-black drop-shadow">
            {Math.round(channel.volume * 100)}%
          </span>
        </div>

        {/* Stereo Peak VU Meter with Dedicated Red 0dB Digital Clipping Warning Indicator */}
        <div
          className={`flex flex-col items-center justify-between p-1 rounded-lg bg-zinc-950 border-2 transition-all duration-100 shadow-inner shrink-0 ${
            isClipped
              ? 'border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)] ring-1 ring-red-400'
              : 'border-zinc-700'
          }`}
          title={`Channel ${id} VU Level: Left ${Math.round(channel.vuLeft * 100)}%, Right ${Math.round(
            channel.vuRight * 100
          )}% ${
            isClipped
              ? '⚠️ SIGNAL EXCEEDS 0dB (DIGITAL CLIPPING)! Turn down GAIN or EQ boost to eliminate clipping distortion.'
              : '✓ Clean signal headroom (<= 0dB)'
          }`}
        >
          {/* Visual Warning Clip Indicator (Lights up red when signal exceeds 0dB) */}
          <div className="flex items-center gap-0.5 mb-0.5">
            <div
              className={`text-[8px] font-mono font-black px-1 py-0.5 rounded-xs border tracking-wider select-none transition-all duration-75 ${
                isClipped
                  ? 'bg-red-600 text-white border-white shadow-[0_0_8px_#ef4444] animate-pulse scale-105'
                  : 'bg-zinc-900/90 text-zinc-600 border-zinc-800'
              }`}
            >
              CLIP
            </div>
          </div>

          {/* Twin Stereo Meter Bars with 0dB Overload Threshold */}
          <div className="flex items-center gap-1 h-6 w-5">
            <div className="relative w-2 h-full bg-zinc-900 rounded-xs overflow-hidden flex flex-col-reverse border border-zinc-800/80">
              <div
                style={{
                  height: `${Math.min(100, channel.vuLeft * 100)}%`,
                  background: isClipped
                    ? 'linear-gradient(0deg, #10b981 0%, #f59e0b 65%, #ef4444 85%, #ff0055 100%)'
                    : 'linear-gradient(0deg, #10b981 0%, #10b981 60%, #f59e0b 80%, #f43f5e 100%)',
                  boxShadow: isClipped ? '0 0 6px #ef4444' : undefined,
                }}
                className="w-full transition-all duration-75"
              />
            </div>
            <div className="relative w-2 h-full bg-zinc-900 rounded-xs overflow-hidden flex flex-col-reverse border border-zinc-800/80">
              <div
                style={{
                  height: `${Math.min(100, channel.vuRight * 100)}%`,
                  background: isClipped
                    ? 'linear-gradient(0deg, #10b981 0%, #f59e0b 65%, #ef4444 85%, #ff0055 100%)'
                    : 'linear-gradient(0deg, #10b981 0%, #10b981 60%, #f59e0b 80%, #f43f5e 100%)',
                  boxShadow: isClipped ? '0 0 6px #ef4444' : undefined,
                }}
                className="w-full transition-all duration-75"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. DUAL FX SLOTS (In Pro Mode) */}
      {isProMode && (
        <div className="pt-1">
          <WaveformDivider color={colorAccent} variant="compact" height={8} />
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
    </div>
  );
};
