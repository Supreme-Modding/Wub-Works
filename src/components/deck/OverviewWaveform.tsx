import React, { useState, useEffect, useRef } from 'react';
import { HotCue, LoopState, SpectralAnalysis } from '../../types';

interface OverviewWaveformProps {
  spectralData: SpectralAnalysis | null;
  currentTime: number;
  duration: number;
  cuePoint: number;
  hotCues: HotCue[];
  loop: LoopState;
  colorAccent: string;
  onSeek: (time: number) => void;
}

export const OverviewWaveform: React.FC<OverviewWaveformProps> = ({
  spectralData,
  currentTime,
  duration,
  cuePoint,
  hotCues,
  loop,
  colorAccent,
  onSeek,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const [hoverTime, setHoverTime] = useState<{ time: number; x: number } | null>(null);

  const formatTime = (sec: number): string => {
    if (isNaN(sec) || sec < 0) return '0:00.0';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${m}:${s < 10 ? '0' : ''}${s}.${ms}`;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (duration <= 0 || !containerRef.current) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
    isDraggingRef.current = true;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(fraction * duration);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || duration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = fraction * duration;

    if (isDraggingRef.current) {
      onSeek(targetTime);
    } else {
      setHoverTime({ time: targetTime, x: clickX });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (_) {}
      isDraggingRef.current = false;
    }
  };

  const handlePointerLeave = () => {
    if (!isDraggingRef.current) {
      setHoverTime(null);
    }
  };

  // Draw sculpted wave-edged sections on high-DPI canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Dark tactile slot background
    ctx.fillStyle = '#080811';
    ctx.fillRect(0, 0, width, height);

    if (!spectralData || duration <= 0) {
      // Elegant idle waveform placeholder with sculpted peaks
      ctx.strokeStyle = '#27273a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < width; x += 4) {
        const wave = Math.sin(x * 0.05) * 8 * Math.sin(x * 0.02);
        ctx.moveTo(x, centerY - Math.abs(wave));
        ctx.lineTo(x, centerY + Math.abs(wave));
      }
      ctx.stroke();
      return;
    }

    const segments = spectralData.energySegments || [
      { start: 0, end: duration * 0.2, type: 'intro', color: '#6366f1' },
      { start: duration * 0.2, end: duration * 0.4, type: 'build', color: '#00f2fe' },
      { start: duration * 0.4, end: duration * 0.7, type: 'drop', color: '#f43f5e' },
      { start: duration * 0.7, end: duration * 0.85, type: 'breakdown', color: '#a855f7' },
      { start: duration * 0.85, end: duration, type: 'outro', color: '#64748b' },
    ];

    const numPoints = spectralData.lows.length;
    const barWidth = Math.max(1.8, width / 140);
    const totalBars = Math.floor(width / (barWidth + 1));

    // Helper: get energy section info and color at time t
    const getSectionAt = (t: number) => {
      for (let s of segments) {
        if (t >= s.start && t <= s.end) return s;
      }
      return segments[segments.length - 1];
    };

    // Draw Sculpted Waveform Bars with organic wave section edges
    for (let i = 0; i < totalBars; i++) {
      const x = i * (barWidth + 1);
      const frac = i / totalBars;
      const t = frac * duration;
      const sec = getSectionAt(t);

      // Data sample
      const dataIdx = Math.floor(frac * numPoints);
      const low = spectralData.lows[dataIdx] || 0.15;
      const mid = spectralData.mids[dataIdx] || 0.15;
      const high = spectralData.highs[dataIdx] || 0.1;

      // Amplitude height
      const amp = Math.min(0.95, (low * 0.5 + mid * 0.35 + high * 0.25) * 1.5);
      const barH = Math.max(4, amp * (centerY - 3));

      // Waveform Edge Sculpting:
      // At section transitions, blend neighboring section colors into a glowing wave flare
      let fillColor = sec.color;
      let isNearSectionEdge = false;
      for (let s of segments) {
        const edgeDist = Math.abs(t - s.start);
        if (edgeDist < duration * 0.025 && s.start > 0) {
          isNearSectionEdge = true;
          break;
        }
      }

      // Played vs unplayed contrast
      const isPlayed = t <= currentTime;

      // Draw Top & Bottom mirror bar with rounded ends
      ctx.save();
      if (isNearSectionEdge) {
        // Sculpted wave crest edge: brighter, elevated peak marking the drop/build transition
        ctx.fillStyle = isPlayed ? '#ffffff' : '#00f2fe';
        ctx.shadowColor = fillColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(x, centerY - (barH + 4), barWidth, (barH + 4) * 2, 2);
        ctx.fill();
      } else {
        // Standard waveform bar with vivid section frequency tint
        ctx.fillStyle = isPlayed ? '#ffffff' : fillColor;
        ctx.globalAlpha = isPlayed ? 0.95 : 0.75;
        ctx.beginPath();
        ctx.roundRect(x, centerY - barH, barWidth, barH * 2, 1.5);
        ctx.fill();

        // Inner sub-core highlight
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = isPlayed ? 0.8 : 0.4;
        ctx.fillRect(x + 0.5, centerY - barH * 0.35, barWidth - 1, barH * 0.7);
      }
      ctx.restore();
    }

    // Section Energy Name Tags Floating with Wave Contours
    segments.forEach((seg) => {
      const startX = (seg.start / duration) * width;
      const endX = (seg.end / duration) * width;
      const midX = (startX + endX) / 2;

      // Subtle wave crest banner
      ctx.fillStyle = seg.color;
      ctx.globalAlpha = 0.85;
      ctx.font = 'bold 8px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(seg.type.toUpperCase(), midX, 9);
      ctx.globalAlpha = 1.0;
    });

  }, [spectralData, currentTime, duration]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const cuePercent = duration > 0 ? (cuePoint / duration) * 100 : 0;
  const loopStartPercent = duration > 0 ? (loop.start / duration) * 100 : 0;
  const loopWidthPercent = duration > 0 && loop.active ? ((loop.end - loop.start) / duration) * 100 : 0;

  return (
    <div className="w-full flex flex-col gap-1 select-none">
      {/* Time indicators */}
      <div className="flex items-center justify-between text-[11px] font-mono font-bold px-0.5">
        <span className="text-zinc-200 bg-zinc-900/90 px-1.5 py-0.5 rounded border border-zinc-700/60 shadow-sm">
          {formatTime(currentTime)}
        </span>
        <span className="text-zinc-400 bg-zinc-900/90 px-1.5 py-0.5 rounded border border-zinc-700/60 shadow-sm">
          -{formatTime(Math.max(0, duration - currentTime))}
        </span>
      </div>

      {/* Overview Track Bar with Sculpted Canvas */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className="relative w-full h-11 rounded-xl bg-[#080811] border-2 border-zinc-750 hover:border-zinc-600 overflow-hidden cursor-pointer shadow-lg transition-colors group select-none touch-none"
        title="Click or drag across the energy waveform to scrub track"
      >
        {/* Sculpted High-DPI Waveform Canvas */}
        <canvas
          ref={canvasRef}
          width={800}
          height={44}
          className="w-full h-full block pointer-events-none"
        />

        {/* Hover preview line */}
        {hoverTime && (
          <div
            style={{ left: `${hoverTime.x}px` }}
            className="absolute top-0 bottom-0 w-px bg-white/50 z-25 pointer-events-none"
          >
            <div className="absolute -top-5 -translate-x-1/2 bg-black/90 border border-zinc-700 px-1 py-0.2 rounded text-[8px] font-mono text-white shadow">
              {formatTime(hoverTime.time)}
            </div>
          </div>
        )}

        {/* Active Loop Region */}
        {loop.active && loopWidthPercent > 0 && (
          <div
            style={{ left: `${loopStartPercent}%`, width: `${loopWidthPercent}%` }}
            className="absolute top-0 bottom-0 bg-cyan-400/30 border-x-2 border-cyan-400 z-10 shadow-lg shadow-cyan-400/20"
          />
        )}

        {/* Temporary Cue Marker */}
        {cuePoint > 0 && (
          <div
            style={{ left: `${cuePercent}%` }}
            className="absolute top-0 bottom-0 w-1 bg-emerald-400 z-20 shadow-md shadow-emerald-400"
          >
            <div className="w-3 h-3 -ml-1 bg-emerald-400 rounded-full border border-black shadow" />
          </div>
        )}

        {/* Hot Cues Pins with High-Contrast Badges */}
        {hotCues.map((hc) => {
          const hcPct = duration > 0 ? (hc.position / duration) * 100 : 0;
          return (
            <div
              key={hc.id}
              style={{ left: `${hcPct}%` }}
              className="absolute bottom-0 w-1 h-full z-20 pointer-events-none"
            >
              <div
                style={{ backgroundColor: hc.color, borderColor: '#ffffff' }}
                className="w-4 h-4 -ml-1.5 rounded-full text-[9px] font-black text-black border-2 flex items-center justify-center shadow-lg"
              >
                {hc.id}
              </div>
            </div>
          );
        })}

        {/* Playhead Cursor Needle with High Contrast Glow */}
        <div
          style={{ left: `${progressPercent}%` }}
          className="absolute top-0 bottom-0 w-1.5 bg-white shadow-xl shadow-cyan-400 z-30 -ml-[3px] pointer-events-none"
        >
          {/* Top diamond marker */}
          <div className="w-3 h-3 -ml-[3px] -mt-1 bg-white border-2 border-cyan-400 rotate-45 shadow-md" />
        </div>
      </div>
    </div>
  );
};
