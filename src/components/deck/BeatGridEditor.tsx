import React, { useRef } from 'react';
import { Grid, ChevronLeft, ChevronRight } from 'lucide-react';

interface BeatGridEditorProps {
  bpm: number;
  beatGridOffset: number;
  onAdjustOffset: (deltaSec: number) => void;
  onSetDownbeat: () => void;
  onAdjustBpm: (delta: number) => void;
  onTapBpm: () => void;
}

export const BeatGridEditor: React.FC<BeatGridEditorProps> = ({
  bpm,
  beatGridOffset,
  onAdjustOffset,
  onSetDownbeat,
  onAdjustBpm,
  onTapBpm,
}) => {
  const tapTimesRef = useRef<number[]>([]);

  const handleTap = () => {
    const now = Date.now();
    tapTimesRef.current.push(now);
    if (tapTimesRef.current.length > 5) tapTimesRef.current.shift();

    if (tapTimesRef.current.length >= 2) {
      let intervals = 0;
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals += tapTimesRef.current[i] - tapTimesRef.current[i - 1];
      }
      const avgIntervalMs = intervals / (tapTimesRef.current.length - 1);
      const tappedBpm = Math.round((60000 / avgIntervalMs) * 10) / 10;
      if (tappedBpm >= 60 && tappedBpm <= 180) {
        onTapBpm();
      }
    }
  };

  return (
    <div className="flex items-center justify-between gap-1.5 p-2 rounded-xl bg-zinc-900/90 border-2 border-zinc-750 text-[10px] font-mono shadow-md">
      <div className="flex items-center gap-1.5 text-zinc-200">
        <Grid className="w-3.5 h-3.5 text-cyan-400 stroke-[2.5]" />
        <span className="font-black">GRID:</span>
      </div>

      {/* Grid Nudge Left / Right */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onAdjustOffset(-0.01)}
          className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-650 transition cursor-pointer shadow-sm"
          title="Nudge Grid Left (-10ms)"
        >
          <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
        <button
          onClick={() => onAdjustOffset(0.01)}
          className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-650 transition cursor-pointer shadow-sm"
          title="Nudge Grid Right (+10ms)"
        >
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* Set 1.1 Downbeat Marker */}
      <button
        onClick={onSetDownbeat}
        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 transition cursor-pointer font-black shadow-sm"
        title="Set First Beat (1.1) to Current Playhead"
      >
        SET 1.1
      </button>

      {/* Fine BPM adjustment & TAP */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onAdjustBpm(-0.1)}
          className="px-1.5 py-1 rounded-lg bg-zinc-800 text-zinc-100 hover:text-white border border-zinc-650 font-bold"
          title="Fine BPM -0.1"
        >
          -0.1
        </button>
        <button
          onClick={() => onAdjustBpm(0.1)}
          className="px-1.5 py-1 rounded-lg bg-zinc-800 text-zinc-100 hover:text-white border border-zinc-650 font-bold"
          title="Fine BPM +0.1"
        >
          +0.1
        </button>
        <button
          onClick={handleTap}
          className="px-2.5 py-1 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black border-2 border-white font-black active:scale-95 shadow-md shadow-cyan-400/20"
          title="Tap Tempo BPM"
        >
          TAP
        </button>
      </div>
    </div>
  );
};
