import React from 'react';
import { CrossfaderCurve, MixerMasterState } from '../../types';
import { KnobSlider } from '../common/KnobSlider';
import { ArrowLeftRight, Headphones, Radio, Info, Volume2, Square } from 'lucide-react';

interface MasterCenterConsoleProps {
  master: MixerMasterState;
  onCrossfaderChange: (pos: number) => void;
  onCrossfaderCurveChange: (curve: CrossfaderCurve) => void;
  onToggleHamster: () => void;
  onMasterVolumeChange: (vol: number) => void;
  onHeadphoneVolumeChange: (vol: number) => void;
  onHeadphoneCueMixChange: (mix: number) => void;
  onToggleRecord: () => void;
  onOpenHardwareNotice: () => void;
  onOpenRecordings: () => void;
  onStopAllAudio?: () => void;
  isAnyAudioPlaying?: boolean;
  stopFeedback?: boolean;
}

export const MasterCenterConsole: React.FC<MasterCenterConsoleProps> = ({
  master,
  onCrossfaderChange,
  onCrossfaderCurveChange,
  onToggleHamster,
  onMasterVolumeChange,
  onHeadphoneVolumeChange,
  onHeadphoneCueMixChange,
  onToggleRecord,
  onOpenHardwareNotice,
  onOpenRecordings,
  onStopAllAudio,
  isAnyAudioPlaying,
  stopFeedback,
}) => {
  const isClipped = Boolean(master.isClipping || master.masterVuLeft >= 0.96 || master.masterVuRight >= 0.96);

  const formatTimer = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full rounded-2xl bg-[#090912] border-2 border-zinc-750 p-3 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3 select-none">
      {/* Left: Master Output & Meters */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Master Output Knob with Left-to-Right Slide Bar */}
        <div className="w-24">
          <KnobSlider
            label="MASTER"
            value={master.masterVolume}
            min={0}
            max={1.5}
            step={0.02}
            defaultValue={1.0}
            onChange={onMasterVolumeChange}
            displayUnit=""
            colorAccent="#00f2fe"
            compact
            className="w-full"
          />
        </div>

        {/* Master Stop Button */}
        {onStopAllAudio && (
          <button
            onClick={onStopAllAudio}
            className={`px-2.5 py-1.5 rounded-xl border-2 font-mono text-[11px] font-black transition cursor-pointer select-none active:scale-95 flex items-center gap-1 shadow-md ${
              stopFeedback
                ? 'bg-rose-500 text-white border-white shadow-rose-500/80 animate-pulse scale-105 ring-2 ring-rose-400'
                : isAnyAudioPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-white shadow-rose-600/50 animate-pulse ring-1 ring-rose-400'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-700'
            }`}
            title="Panic Stop: Stop all decks and synth audio"
          >
            <Square className="w-3 h-3 fill-current stroke-[2.5]" />
            <span>{stopFeedback ? 'STOPPED!' : 'STOP'}</span>
          </button>
        )}

        {/* Master Stereo Peak VU Meter Bars with 0dB CLIP Warning */}
        <div
          className={`flex flex-col items-center justify-between p-1 rounded-lg bg-zinc-950 border-2 transition-all duration-100 shadow-inner ${
            isClipped
              ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)] ring-1 ring-red-400'
              : 'border-zinc-750'
          }`}
          title={`Master VU: Left ${Math.round(master.masterVuLeft * 100)}%, Right ${Math.round(
            master.masterVuRight * 100
          )}% ${isClipped ? '⚠️ MASTER EXCEEDS 0dB (DIGITAL CLIPPING)' : '✓ Master Headroom Nominal'}`}
        >
          <div
            className={`text-[7px] font-mono font-black px-1 rounded-xs border select-none transition-all duration-75 mb-0.5 ${
              isClipped
                ? 'bg-red-600 text-white border-white shadow-[0_0_8px_#ef4444] animate-pulse'
                : 'bg-zinc-900 text-zinc-600 border-zinc-800'
            }`}
          >
            CLIP
          </div>

          <div className="flex items-center gap-1 h-9 w-4 justify-center">
            <div className="relative w-1.5 h-full bg-zinc-900 rounded-sm overflow-hidden flex flex-col-reverse border border-zinc-800/80">
              <div
                style={{
                  height: `${Math.min(100, master.masterVuLeft * 100)}%`,
                  background: isClipped
                    ? 'linear-gradient(0deg, #10b981 0%, #f59e0b 65%, #ef4444 85%, #ff0055 100%)'
                    : 'linear-gradient(0deg, #10b981 0%, #10b981 65%, #f59e0b 85%, #f43f5e 100%)',
                  boxShadow: isClipped ? '0 0 6px #ef4444' : undefined,
                }}
                className="w-full transition-all duration-75"
              />
            </div>
            <div className="relative w-1.5 h-full bg-zinc-900 rounded-sm overflow-hidden flex flex-col-reverse border border-zinc-800/80">
              <div
                style={{
                  height: `${Math.min(100, master.masterVuRight * 100)}%`,
                  background: isClipped
                    ? 'linear-gradient(0deg, #10b981 0%, #f59e0b 65%, #ef4444 85%, #ff0055 100%)'
                    : 'linear-gradient(0deg, #10b981 0%, #10b981 65%, #f59e0b 85%, #f43f5e 100%)',
                  boxShadow: isClipped ? '0 0 6px #ef4444' : undefined,
                }}
                className="w-full transition-all duration-75"
              />
            </div>
          </div>
        </div>

        {/* Headphone Cue Section */}
        <div className="flex flex-col gap-1 pl-2 border-l border-zinc-800">
          <div className="flex items-center justify-between gap-1 text-[9px] font-mono font-bold text-amber-300">
            <span className="flex items-center gap-1">
              <Headphones className="w-3 h-3" />
              <span>PHONES</span>
            </span>
            <button
              onClick={onOpenHardwareNotice}
              className="text-zinc-500 hover:text-cyan-400 p-0.5"
              title="Audio Output Hardware Info"
            >
              <Info className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-[7px] font-mono text-zinc-500">VOL</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={master.headphoneVolume}
                onChange={(e) => onHeadphoneVolumeChange(parseFloat(e.target.value))}
                className="w-16 h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-amber-400"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[7px] font-mono text-zinc-500">CUE / MST</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={master.headphoneCueMix}
                onChange={(e) => onHeadphoneCueMixChange(parseFloat(e.target.value))}
                className="w-16 h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Center: Tactile Crossfader & Transform Cuts */}
      <div className="flex-1 max-w-lg w-full flex flex-col gap-1.5 px-2">
        {/* Crossfader top row: Label, Hamster & Curve selector */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-black text-white flex items-center gap-1 tracking-wider">
            <ArrowLeftRight className="w-3 h-3 text-cyan-400 stroke-[2.5]" />
            <span>CROSSFADER</span>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleHamster}
              className={`px-2 py-0.5 rounded text-[8px] font-mono font-black transition cursor-pointer border ${
                master.crossfaderHamster
                  ? 'bg-amber-400 text-black border-white shadow-sm'
                  : 'bg-zinc-850 text-zinc-400 hover:text-white border-zinc-700'
              }`}
              title="Hamster: Reverse Crossfader Sides"
            >
              HAMSTER {master.crossfaderHamster ? 'ON' : 'OFF'}
            </button>

            <div className="flex items-center p-0.5 rounded-lg bg-zinc-950 border border-zinc-750 text-[8px] font-mono font-bold">
              {(['smooth', 'linear', 'cut'] as CrossfaderCurve[]).map((c) => (
                <button
                  key={c}
                  onClick={() => onCrossfaderCurveChange(c)}
                  className={`px-1.5 py-0.5 rounded transition cursor-pointer uppercase ${
                    master.crossfaderCurve === c
                      ? 'bg-cyan-400 text-black font-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Crossfader Track with A / B labels */}
        <div className="relative flex items-center py-1">
          <span className="font-mono text-xs font-black text-cyan-400 pr-2">A</span>
          <div className="flex-1 relative flex items-center">
            <input
              type="range"
              min={-1}
              max={1}
              step={0.01}
              value={master.crossfader}
              onChange={(e) => onCrossfaderChange(parseFloat(e.target.value))}
              className="fader-horizontal w-full h-7 cursor-pointer"
            />
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-zinc-500 pointer-events-none opacity-50" />
          </div>
          <span className="font-mono text-xs font-black text-pink-400 pl-2">B</span>
        </div>

        {/* Instant Cut Transform Buttons */}
        <div className="flex items-center justify-between gap-1.5">
          <button
            onClick={() => onCrossfaderChange(-1)}
            className="flex-1 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-750 text-cyan-300 hover:text-white border border-cyan-500/40 text-[9px] font-mono font-black transition active:scale-95 cursor-pointer shadow-sm"
          >
            CUT A
          </button>
          <button
            onClick={() => onCrossfaderChange(0)}
            className="flex-1 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-750 text-zinc-300 hover:text-white border border-zinc-700 text-[9px] font-mono font-black transition active:scale-95 cursor-pointer shadow-sm"
          >
            CENTER
          </button>
          <button
            onClick={() => onCrossfaderChange(1)}
            className="flex-1 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-750 text-pink-300 hover:text-white border border-pink-500/40 text-[9px] font-mono font-black transition active:scale-95 cursor-pointer shadow-sm"
          >
            CUT B
          </button>
        </div>
      </div>

      {/* Right: Master WAV Recorder */}
      <div className="flex flex-col items-center gap-1 shrink-0 pl-2 border-t md:border-t-0 md:border-l border-zinc-800 w-full md:w-auto">
        <button
          onClick={onToggleRecord}
          className={`py-2 px-3.5 rounded-xl text-xs font-mono font-black transition flex items-center justify-center gap-1.5 select-none cursor-pointer border-2 shadow-md ${
            master.isRecording
              ? 'bg-rose-500 text-black border-white shadow-rose-500/40 animate-pulse'
              : 'bg-rose-950/80 hover:bg-rose-900 text-rose-200 hover:text-white border-rose-500 shadow-rose-950/30'
          }`}
          title={master.isRecording ? 'Stop & Save WAV Recording' : 'Start Recording Master Mix to WAV'}
        >
          <Radio className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{master.isRecording ? formatTimer(master.recordingSeconds) : 'REC MASTER'}</span>
        </button>

        <button
          onClick={onOpenRecordings}
          className="text-[9px] font-mono font-bold text-zinc-400 hover:text-cyan-300 transition py-0.5"
        >
          Saved Mixes
        </button>
      </div>
    </div>
  );
};
