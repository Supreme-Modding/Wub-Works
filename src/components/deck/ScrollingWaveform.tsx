import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HotCue, LoopState, SpectralAnalysis } from '../../types';
import {
  ZoomIn,
  ZoomOut,
  Magnet,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
} from 'lucide-react';

interface ScrollingWaveformProps {
  spectralData: SpectralAnalysis | null;
  currentTime: number;
  duration: number;
  bpm: number;
  beatGridOffset: number;
  hotCues: HotCue[];
  loop: LoopState;
  cuePoint: number;
  colorAccent: string;
  onScrub?: (time: number) => void;
  isPlaying: boolean;
}

const ZOOM_PRESETS = [
  { value: 2.0, label: '2s', desc: 'Transient Detail' },
  { value: 4.0, label: '4s', desc: 'Standard 2-Bar' },
  { value: 8.0, label: '8s', desc: 'Phrase 4-Bar' },
  { value: 16.0, label: '16s', desc: 'Section 8-Bar' },
];

export const ScrollingWaveform: React.FC<ScrollingWaveformProps> = ({
  spectralData,
  currentTime,
  duration,
  bpm,
  beatGridOffset,
  hotCues,
  loop,
  cuePoint,
  colorAccent,
  onScrub,
  isPlaying,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dragging & Scrubbing state
  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartTimeRef = useRef<number>(0);
  const pointerDownMovedRef = useRef<boolean>(false);
  const lastScrubCallTimeRef = useRef<number>(0);

  // Zoom & Snap state
  const [zoomWindow, setZoomWindow] = useState<number>(4.0); // seconds visible
  const [isSnapEnabled, setIsSnapEnabled] = useState<boolean>(false);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [scrubFeedback, setScrubFeedback] = useState<{
    time: number;
    delta: number;
    bar: number;
    beat: number;
  } | null>(null);

  const [hoverInfo, setHoverInfo] = useState<{ time: number; x: number } | null>(null);

  const formatTime = (sec: number): string => {
    if (isNaN(sec) || sec < 0) return '0:00.00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 100);
    return `${m}:${s < 10 ? '0' : ''}${s}.${ms < 10 ? '0' : ''}${ms}`;
  };

  const getMusicalPosition = useCallback(
    (time: number): { bar: number; beat: number } => {
      const effectiveBpm = bpm || 140;
      const beatSec = 60 / effectiveBpm;
      const beatsTotal = Math.max(0, (time - beatGridOffset) / beatSec);
      const bar = Math.floor(beatsTotal / 4) + 1;
      const beat = (Math.floor(beatsTotal) % 4) + 1;
      return { bar, beat };
    },
    [bpm, beatGridOffset]
  );

  // Calculate snap time if beat snapping is active
  const applySnap = useCallback(
    (rawTime: number): number => {
      if (!isSnapEnabled) return rawTime;
      const effectiveBpm = bpm || 140;
      const beatSec = 60 / effectiveBpm;
      // Snap to 1/2 beat intervals (sub-beat precision)
      const subBeat = beatSec * 0.5;
      const snapped = Math.round((rawTime - beatGridOffset) / subBeat) * subBeat + beatGridOffset;
      return Math.max(0, Math.min(duration, snapped));
    },
    [isSnapEnabled, bpm, beatGridOffset, duration]
  );

  // High-DPI canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = canvas.clientWidth || 700;
      const displayHeight = canvas.clientHeight || 112;

      // Adjust buffer resolution for high-DPI displays
      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const width = displayWidth;
      const height = displayHeight;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Deep tactile canvas background with subtle audio slot gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#06060c');
      bgGrad.addColorStop(0.5, '#080814');
      bgGrad.addColorStop(1, '#06060c');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle center baseline
      ctx.strokeStyle = '#181829';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      if (!spectralData || duration <= 0) {
        ctx.fillStyle = '#474766';
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('NO AUDIO LOADED - LOAD TRACK OR SOUND TO SCRUB', width / 2, centerY + 4);
        ctx.restore();
        return;
      }

      // Time window visible in canvas (zoomWindow in seconds)
      const visibleWindowSec = zoomWindow;
      const pixelsPerSec = width / visibleWindowSec;
      const halfWindow = visibleWindowSec / 2;
      const startTime = currentTime - halfWindow;
      const endTime = currentTime + halfWindow;

      // 1. Draw Active Loop Region with glowing boundary
      if (loop.active && loop.end > loop.start) {
        const loopX1 = (loop.start - startTime) * pixelsPerSec;
        const loopX2 = (loop.end - startTime) * pixelsPerSec;
        if (loopX2 > 0 && loopX1 < width) {
          const lX = Math.max(0, loopX1);
          const lW = Math.min(width, loopX2) - lX;
          ctx.fillStyle = 'rgba(6, 182, 212, 0.18)';
          ctx.fillRect(lX, 0, lW, height);
          ctx.strokeStyle = '#00f2fe';
          ctx.lineWidth = 2;
          ctx.strokeRect(lX, 0, lW, height);

          // Diagonal hatch stripes in loop region
          ctx.strokeStyle = 'rgba(0, 242, 254, 0.08)';
          ctx.lineWidth = 1;
          for (let sx = lX - height; sx < lX + lW; sx += 14) {
            ctx.beginPath();
            ctx.moveTo(sx, 0);
            ctx.lineTo(sx + height, height);
            ctx.stroke();
          }
        }
      }

      // 2. Draw Section Wave Boundary Tags (Intro, Build, Drop, etc.)
      const segments = spectralData.energySegments || [];
      segments.forEach((seg) => {
        const segX = (seg.start - startTime) * pixelsPerSec;
        if (segX >= -60 && segX <= width + 60 && seg.start > 0) {
          ctx.strokeStyle = seg.color;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.moveTo(segX, 0);
          ctx.lineTo(segX, height);
          ctx.stroke();
          ctx.setLineDash([]);

          // Glowing energy pill badge
          ctx.fillStyle = seg.color;
          ctx.beginPath();
          ctx.roundRect(segX + 4, 3, 44, 13, 3);
          ctx.fill();

          ctx.fillStyle = '#000000';
          ctx.font = 'bold 8.5px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(seg.type.toUpperCase(), segX + 26, 12);
        }
      });

      // 3. Draw Beat Grid Lines & Downbeat Measure Numbers
      const effectiveBpm = bpm || 140;
      const beatInterval = 60 / effectiveBpm;
      const firstBeatIndex = Math.floor((startTime - beatGridOffset) / beatInterval);
      const lastBeatIndex = Math.ceil((endTime - beatGridOffset) / beatInterval);

      for (let b = firstBeatIndex; b <= lastBeatIndex; b++) {
        const beatTime = beatGridOffset + b * beatInterval;
        const beatX = (beatTime - startTime) * pixelsPerSec;
        if (beatX >= -10 && beatX <= width + 10) {
          const isBarDownbeat = ((b % 4) + 4) % 4 === 0;
          ctx.strokeStyle = isBarDownbeat ? 'rgba(255, 255, 255, 0.55)' : 'rgba(255, 255, 255, 0.16)';
          ctx.lineWidth = isBarDownbeat ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(beatX, isBarDownbeat ? 4 : 16);
          ctx.lineTo(beatX, isBarDownbeat ? height - 4 : height - 16);
          ctx.stroke();

          // Bar downbeat label
          if (isBarDownbeat && beatX > 15 && beatX < width - 15) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.font = 'bold 9px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.floor(b / 4) + 1}`, beatX, 13);
          }
        }
      }

      // 4. Draw 3-Band Frequency Sculpted Waveform
      const points = spectralData.lows.length;
      const pointsPerSec = points / duration;
      const startPoint = Math.max(0, Math.floor(startTime * pointsPerSec));
      const endPoint = Math.min(points, Math.ceil(endTime * pointsPerSec));
      const pointSpan = Math.max(1, endPoint - startPoint);

      const barWidth = Math.max(2.0, (width / pointSpan) * 0.92);

      for (let i = startPoint; i < endPoint; i++) {
        const pointTime = i / pointsPerSec;
        const x = (pointTime - startTime) * pixelsPerSec;

        const lowVal = spectralData.lows[i] || 0;
        const midVal = spectralData.mids[i] || 0;
        const highVal = spectralData.highs[i] || 0;

        // Heights
        const lowH = lowVal * (centerY * 0.94);
        const midH = midVal * (centerY * 0.74);
        const highH = highVal * (centerY * 0.52);

        // Sub/Lows in Neon Rose (#f43f5e)
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.roundRect(x - barWidth / 2, centerY - lowH, barWidth, Math.max(2, lowH * 2), 2);
        ctx.fill();

        // Mids in Punchy Amber (#f59e0b)
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(x - (barWidth * 0.7) / 2, centerY - midH, barWidth * 0.7, Math.max(2, midH * 2), 1.5);
        ctx.fill();

        // Highs in Electric Cyan (#00f2fe)
        ctx.fillStyle = '#00f2fe';
        ctx.beginPath();
        ctx.roundRect(x - (barWidth * 0.4) / 2, centerY - highH, barWidth * 0.4, Math.max(2, highH * 2), 1);
        ctx.fill();
      }

      // 5. Hot Cues & Cue Markers
      if (cuePoint > 0) {
        const cueX = (cuePoint - startTime) * pixelsPerSec;
        if (cueX >= 0 && cueX <= width) {
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.moveTo(cueX - 7, 0);
          ctx.lineTo(cueX + 7, 0);
          ctx.lineTo(cueX, 12);
          ctx.closePath();
          ctx.fill();
        }
      }

      hotCues.forEach((hc) => {
        const hcX = (hc.position - startTime) * pixelsPerSec;
        if (hcX >= 0 && hcX <= width) {
          ctx.fillStyle = hc.color || '#eab308';
          ctx.beginPath();
          ctx.moveTo(hcX - 7, height);
          ctx.lineTo(hcX + 7, height);
          ctx.lineTo(hcX, height - 13);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8.5px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${hc.id}`, hcX, height - 15);
        }
      });

      // 6. Hover scrubbing preview line
      if (hoverInfo && !isDraggingRef.current) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(hoverInfo.x, 0);
        ctx.lineTo(hoverInfo.x, height);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 7. High-Contrast Center Playhead Needle
      const centerPlayheadX = width / 2;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = colorAccent;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(centerPlayheadX, 0);
      ctx.lineTo(centerPlayheadX, height);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Playhead center marker arrows
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(centerPlayheadX - 6, 0);
      ctx.lineTo(centerPlayheadX + 6, 0);
      ctx.lineTo(centerPlayheadX, 9);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(centerPlayheadX - 6, height);
      ctx.lineTo(centerPlayheadX + 6, height);
      ctx.lineTo(centerPlayheadX, height - 9);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      if (isPlaying || isDraggingRef.current) {
        animId = requestAnimationFrame(render);
      }
    };

    render();
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [
    spectralData,
    currentTime,
    duration,
    bpm,
    beatGridOffset,
    hotCues,
    loop,
    cuePoint,
    colorAccent,
    isPlaying,
    zoomWindow,
    hoverInfo,
  ]);

  // Non-passive wheel listener for smooth horizontal and vertical scrolling scrub
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheelEvent = (e: WheelEvent) => {
      e.preventDefault();
      if (!onScrub || duration <= 0) return;

      // Detect trackpad two-finger scroll or mouse wheel
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const width = el.clientWidth || 700;
      const secPerPixel = zoomWindow / width;
      // Smooth damped scrub delta
      const timeDelta = (delta * secPerPixel) * 0.45;
      const rawTarget = currentTime + timeDelta;
      const targetTime = applySnap(Math.max(0, Math.min(duration, rawTarget)));

      onScrub(targetTime);

      const musical = getMusicalPosition(targetTime);
      setIsScrubbing(true);
      setScrubFeedback({
        time: targetTime,
        delta: targetTime - currentTime,
        bar: musical.bar,
        beat: musical.beat,
      });

      // Clear HUD feedback after scroll pauses
      clearTimeout((handleWheelEvent as unknown as { timer?: number }).timer);
      (handleWheelEvent as unknown as { timer?: number }).timer = window.setTimeout(() => {
        setIsScrubbing(false);
        setScrubFeedback(null);
      }, 550);
    };

    el.addEventListener('wheel', handleWheelEvent, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheelEvent);
    };
  }, [onScrub, duration, zoomWindow, currentTime, applySnap, getMusicalPosition]);

  // Pointer Scrubbing & Dragging Handlers with Pointer Capture
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (duration <= 0 || !onScrub) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}

    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartTimeRef.current = currentTime;
    pointerDownMovedRef.current = false;
    setIsScrubbing(true);

    const musical = getMusicalPosition(currentTime);
    setScrubFeedback({
      time: currentTime,
      delta: 0,
      bar: musical.bar,
      beat: musical.beat,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || duration <= 0) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const width = rect.width;
    const visibleWindowSec = zoomWindow;
    const pixelsPerSec = width / visibleWindowSec;

    // Track hover position for preview line
    if (!isDraggingRef.current) {
      const hoverOffsetSec = (mouseX - width / 2) / pixelsPerSec;
      const hoveredTime = Math.max(0, Math.min(duration, currentTime + hoverOffsetSec));
      setHoverInfo({ time: hoveredTime, x: mouseX });
      return;
    }

    // Active drag scrubbing
    const deltaX = e.clientX - dragStartXRef.current;
    if (Math.abs(deltaX) > 3) {
      pointerDownMovedRef.current = true;
    }

    const deltaTime = -deltaX / pixelsPerSec;
    const rawTarget = dragStartTimeRef.current + deltaTime;
    const targetTime = applySnap(Math.max(0, Math.min(duration, rawTarget)));

    // Throttled RAF scrub dispatch
    const now = performance.now();
    if (now - lastScrubCallTimeRef.current > 16) {
      lastScrubCallTimeRef.current = now;
      if (onScrub) onScrub(targetTime);
    }

    const musical = getMusicalPosition(targetTime);
    setScrubFeedback({
      time: targetTime,
      delta: targetTime - dragStartTimeRef.current,
      bar: musical.bar,
      beat: musical.beat,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    // Click-to-seek: if mouse down had practically zero motion, seek straight to clicked point
    if (!pointerDownMovedRef.current && containerRef.current && onScrub && duration > 0) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const pixelsPerSec = width / zoomWindow;
      const clickOffsetSec = (clickX - width / 2) / pixelsPerSec;
      const seekTime = applySnap(Math.max(0, Math.min(duration, currentTime + clickOffsetSec)));
      onScrub(seekTime);
    }

    isDraggingRef.current = false;
    setTimeout(() => {
      setIsScrubbing(false);
      setScrubFeedback(null);
    }, 450);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
    isDraggingRef.current = false;
    setIsScrubbing(false);
    setScrubFeedback(null);
  };

  const handlePointerLeave = () => {
    if (!isDraggingRef.current) {
      setHoverInfo(null);
    }
  };

  // Beat jump scrub shortcuts
  const handleBeatJumpScrub = (beats: number) => {
    if (!onScrub || duration <= 0) return;
    const beatSec = 60 / (bpm || 140);
    const target = Math.max(0, Math.min(duration, currentTime + beats * beatSec));
    onScrub(target);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerLeave}
      className={`relative w-full h-28 sm:h-32 rounded-xl overflow-hidden bg-black/90 border-2 transition-all duration-150 shadow-2xl select-none touch-none ${
        isDraggingRef.current
          ? 'cursor-grabbing border-cyan-400 ring-2 ring-cyan-500/30'
          : 'cursor-grab border-zinc-750 hover:border-zinc-650'
      }`}
      title="Draggable & Scrollable Waveform: Click & Drag to scrub, Scroll with wheel/trackpad, or Click anywhere to jump"
    >
      {/* 1. Main High-DPI Waveform Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block select-none pointer-events-none" />

      {/* 2. Top Interactive Action Toolbar: Zoom Controls, Beat Snap, Frequency Legend */}
      <div
        className="absolute top-1.5 left-2 right-2 flex items-center justify-between pointer-events-auto text-[10px] font-mono z-20"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Left: Waveform Zoom & Beat Snap controls */}
        <div className="flex items-center gap-1.5 bg-zinc-950/85 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-zinc-800 shadow-md">
          {/* Zoom Out */}
          <button
            onClick={() => {
              const idx = ZOOM_PRESETS.findIndex((p) => p.value === zoomWindow);
              if (idx < ZOOM_PRESETS.length - 1) {
                setZoomWindow(ZOOM_PRESETS[idx + 1].value);
              }
            }}
            disabled={zoomWindow >= 16.0}
            className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition"
            title="Zoom Out Waveform (View More Bars)"
          >
            <ZoomOut className="w-3 h-3" />
          </button>

          {/* Zoom Level Presets */}
          <div className="flex items-center gap-0.5">
            {ZOOM_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setZoomWindow(preset.value)}
                className={`px-1.5 py-0.2 rounded font-bold transition cursor-pointer text-[9px] ${
                  zoomWindow === preset.value
                    ? 'bg-cyan-400 text-black font-black shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title={preset.desc}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Zoom In */}
          <button
            onClick={() => {
              const idx = ZOOM_PRESETS.findIndex((p) => p.value === zoomWindow);
              if (idx > 0) {
                setZoomWindow(ZOOM_PRESETS[idx - 1].value);
              }
            }}
            disabled={zoomWindow <= 2.0}
            className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition"
            title="Zoom In Waveform (Micro Transient Accuracy)"
          >
            <ZoomIn className="w-3 h-3" />
          </button>

          <span className="w-px h-3 bg-zinc-800" />

          {/* Beat Snap Toggle */}
          <button
            onClick={() => setIsSnapEnabled((prev) => !prev)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider transition cursor-pointer select-none border ${
              isSnapEnabled
                ? 'bg-cyan-950 text-cyan-300 border-cyan-400 shadow-xs'
                : 'bg-zinc-900 text-zinc-400 border-zinc-750 hover:text-white'
            }`}
            title="Quantize / Beat Snap: Magnetically snap scrubbing to nearest beat"
          >
            <Magnet className="w-2.5 h-2.5" />
            <span>SNAP {isSnapEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Right: Frequency Legend */}
        <div className="flex items-center gap-2 pointer-events-none text-[9px] font-mono font-bold bg-zinc-950/85 backdrop-blur-md px-2 py-0.5 rounded-lg border border-zinc-800 shadow-md hidden sm:flex">
          <span className="flex items-center gap-1 text-pink-400">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-xs" /> SUB
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-xs" /> MID
          </span>
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-xs" /> HI
          </span>
        </div>
      </div>

      {/* 3. Bottom Quick Jump Helpers */}
      <div
        className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between pointer-events-auto text-[9px] font-mono z-20"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1 bg-zinc-950/85 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-zinc-800 text-zinc-400">
          <button
            onClick={() => handleBeatJumpScrub(-1)}
            className="flex items-center gap-0.5 px-1 py-0.2 rounded hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            title="Nudge / Scrub Back 1 Beat"
          >
            <ChevronLeft className="w-2.5 h-2.5" /> -1B
          </button>
          <span className="w-px h-2.5 bg-zinc-800" />
          <button
            onClick={() => handleBeatJumpScrub(1)}
            className="flex items-center gap-0.5 px-1 py-0.2 rounded hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            title="Nudge / Scrub Forward 1 Beat"
          >
            +1B <ChevronRight className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Tactile Scrub Helper Tag */}
        <div className="text-[9px] font-mono text-zinc-500 bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-850 flex items-center gap-1 pointer-events-none">
          <MoveHorizontal className="w-2.5 h-2.5 text-zinc-400" />
          <span className="hidden sm:inline">DRAG OR WHEEL SCROLL TO SCRUB</span>
        </div>
      </div>

      {/* 4. Real-time Floating Scrub HUD Indicator */}
      {isScrubbing && scrubFeedback && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex flex-col items-center gap-1 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/90 backdrop-blur-md border border-cyan-400/80 shadow-[0_0_20px_rgba(0,242,254,0.35)] text-white text-xs font-mono font-black">
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              SCRUB
            </span>
            <span className="text-white text-sm tracking-wider font-bold">
              {formatTime(scrubFeedback.time)}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] text-zinc-300">
              BAR {scrubFeedback.bar}.{scrubFeedback.beat}
            </span>
            {Math.abs(scrubFeedback.delta) > 0.01 && (
              <span
                className={`text-[10px] font-bold ${
                  scrubFeedback.delta > 0 ? 'text-emerald-400' : 'text-pink-400'
                }`}
              >
                {scrubFeedback.delta > 0 ? `+${scrubFeedback.delta.toFixed(2)}s` : `${scrubFeedback.delta.toFixed(2)}s`}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 5. Hover Time Preview Tooltip */}
      {hoverInfo && !isScrubbing && (
        <div
          className="absolute bottom-2 -translate-x-1/2 z-20 pointer-events-none bg-zinc-900/95 border border-zinc-700 px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-200 shadow-md"
          style={{ left: `${Math.max(30, Math.min(hoverInfo.x, (containerRef.current?.clientWidth || 500) - 30))}px` }}
        >
          {formatTime(hoverInfo.time)}
        </div>
      )}
    </div>
  );
};
