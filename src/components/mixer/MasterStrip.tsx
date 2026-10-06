import React from 'react';
import { Headphones, Radio, Info } from 'lucide-react';

interface MasterStripProps {
  masterVolume: number;
  masterVuLeft: number;
  masterVuRight: number;
  isClipping?: boolean;
  headphoneVolume: number;
  headphoneCueMix: number;
  isRecording: boolean;
  recordingSeconds: number;
  onMasterVolumeChange: (vol: number) => void;
  onHeadphoneVolumeChange: (vol: number) => void;
  onHeadphoneCueMixChange: (mix: number) => void;
  onToggleRecord: () => void;
  onOpenHardwareNotice: () => void;
  onOpenRecordings: () => void;
}

export const MasterStrip: React.FC<MasterStripProps> = ({
  masterVolume,
  masterVuLeft,
  masterVuRight,
  isClipping,
  headphoneVolume,
  headphoneCueMix,
  isRecording,
  recordingSeconds,
  onMasterVolumeChange,
  onHeadphoneVolumeChange,
  onHeadphoneCueMixChange,
  onToggleRecord,
  onOpenHardwareNotice,
  onOpenRecordings,
}) => {
  const isClipped = Boolean(isClipping || masterVuLeft >= 0.96 || masterVuRight >= 0.96);

  const formatTimer = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-[#0a0a14] border-2 border-zinc-750 shadow-2xl min-w-[130px]">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full pb-1.5 border-b-2 border-zinc-750">
        <span className="font-mono font-black text-sm text-white tracking-wider drop-shadow">
          MASTER
        </span>
        <button
          onClick={onOpenHardwareNotice}
          className="text-zinc-400 hover:text-cyan-400 p-1 rounded-lg border border-zinc-700 bg-zinc-850 transition cursor-pointer shadow-sm"
          title="Hardware Audio Routing Info"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* MASTER VOLUME KNOB with High Contrast */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-mono font-black text-zinc-300">OUT LEVEL</span>
        <div className="relative w-10 h-10 flex items-center justify-center cursor-pointer">
          <div
            style={{
              transform: `rotate(${-135 + (masterVolume / 1.5) * 270}deg)`,
              boxShadow: '0 0 14px rgba(0, 242, 254, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            }}
            className="w-9 h-9 rounded-full bg-gradient-to-b from-zinc-750 via-zinc-850 to-zinc-950 border-2 border-cyan-400 flex items-center justify-center shadow-lg transition-transform"
          >
            <div className="w-1.5 h-3.5 -mt-3.5 rounded-full bg-cyan-300 shadow-sm" />
          </div>
          <input
            type="range"
            min={0}
            max={1.5}
            step={0.02}
            value={masterVolume}
            onChange={(e) => onMasterVolumeChange(parseFloat(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-ns-resize"
          />
        </div>
        <span className="text-[9px] font-mono font-bold text-zinc-300 bg-zinc-900 px-1 rounded border border-zinc-750">
          {Math.round((masterVolume / 1.0) * 100)}%
        </span>
      </div>

      {/* MASTER STEREO VU METERS with 0dB CLIP WARNING */}
      <div
        className={`flex flex-col items-center justify-between gap-1 h-28 w-6 bg-zinc-950 rounded-lg p-1 border-2 transition-all duration-100 shadow-inner ${
          isClipped
            ? 'border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)] ring-1 ring-red-400'
            : 'border-zinc-750'
        }`}
        title={`Master VU: Left ${Math.round(masterVuLeft * 100)}%, Right ${Math.round(masterVuRight * 100)}% ${
          isClipped ? '⚠️ MASTER EXCEEDS 0dB (DIGITAL CLIPPING)' : '✓ Master Headroom Nominal'
        }`}
      >
        <div
          className={`w-full text-center text-[7px] font-mono font-black tracking-tighter px-0.5 py-0.5 rounded-xs border select-none transition-all duration-75 ${
            isClipped
              ? 'bg-red-600 text-white border-white shadow-[0_0_8px_#ef4444] animate-pulse'
              : 'bg-zinc-900 text-zinc-600 border-zinc-800'
          }`}
        >
          CLIP
        </div>

        <div className="flex items-center gap-1 h-18 w-full justify-center">
          <div className="relative w-1.5 h-full bg-zinc-900 rounded-sm overflow-hidden flex flex-col-reverse border border-zinc-800/80">
            <div
              style={{
                height: `${Math.min(100, masterVuLeft * 100)}%`,
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
                height: `${Math.min(100, masterVuRight * 100)}%`,
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

      {/* HEADPHONE MONITORING SECTION */}
      <div className="flex flex-col items-center gap-1.5 w-full pt-1.5 border-t border-zinc-750">
        <div className="flex items-center gap-1 text-[10px] font-mono font-black text-amber-300">
          <Headphones className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>PHONES</span>
        </div>

        {/* Headphone Volume */}
        <div className="w-full px-1">
          <div className="flex justify-between text-[8px] font-mono text-zinc-300 font-bold mb-0.5">
            <span>VOL</span>
            <span>{Math.round(headphoneVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={headphoneVolume}
            onChange={(e) => onHeadphoneVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        {/* Cue / Master Mix blend */}
        <div className="w-full px-1">
          <div className="flex justify-between text-[8px] font-mono text-zinc-300 font-bold mb-0.5">
            <span>CUE</span>
            <span>MIX</span>
            <span>MST</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={headphoneCueMix}
            onChange={(e) => onHeadphoneCueMixChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-amber-400"
          />
        </div>
      </div>

      {/* MASTER WAV RECORDER - High Contrast Crimson */}
      <div className="w-full pt-1.5 border-t border-zinc-750 flex flex-col gap-1.5">
        <button
          onClick={onToggleRecord}
          className={`w-full py-2 px-2 rounded-xl text-xs font-mono font-black transition flex items-center justify-center gap-1.5 select-none cursor-pointer border-2 shadow-lg ${
            isRecording
              ? 'bg-rose-500 text-black border-white shadow-rose-500/50 animate-pulse'
              : 'bg-gradient-to-r from-rose-950 via-zinc-900 to-zinc-950 text-rose-300 hover:text-white border-rose-500 hover:border-rose-400 shadow-rose-950/40'
          }`}
          title={isRecording ? 'Stop & Save WAV Recording' : 'Start Recording Master Mix to WAV'}
        >
          <Radio className="w-4 h-4 stroke-[2.5]" />
          <span className="tracking-wider">{isRecording ? formatTimer(recordingSeconds) : 'REC WAV'}</span>
        </button>

        <button
          onClick={onOpenRecordings}
          className="text-[10px] font-mono font-bold text-zinc-400 hover:text-cyan-300 text-center transition py-0.5 rounded hover:bg-zinc-850"
        >
          Saved Mixes
        </button>
      </div>
    </div>
  );
};
