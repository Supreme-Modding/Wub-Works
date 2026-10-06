import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface KnobSliderProps {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
  onChange: (val: number) => void;
  displayUnit?: string;
  isFilter?: boolean;
  colorAccent?: string;
  className?: string;
  compact?: boolean;
  accessory?: React.ReactNode;
}

/**
 * KnobSlider
 * Provides both an authentic rotary DJ dial AND a tactile horizontal slider bar
 * that goes left-to-right. Eliminates finicky circular drag gestures by allowing
 * smooth left-to-right sliding with center detent for 0 dB / neutral.
 */
export const KnobSlider: React.FC<KnobSliderProps> = ({
  label = '',
  value,
  min,
  max,
  step = 0.5,
  defaultValue = 0,
  onChange,
  displayUnit = 'dB',
  isFilter = false,
  colorAccent = '#00f2fe',
  className = '',
  compact = false,
  accessory,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartValueRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isBipolar = min < 0 && max > 0;

  // Convert current value to normalized position 0..1 (0 = left, 0.5 = center, 1 = right)
  const getNorm = useCallback(
    (val: number): number => {
      if (isBipolar) {
        if (val <= 0) {
          const frac = Math.min(1, Math.abs(val) / Math.abs(min));
          return Math.max(0, 0.5 - frac * 0.5);
        } else {
          const frac = Math.min(1, val / max);
          return Math.min(1, 0.5 + frac * 0.5);
        }
      }
      return Math.max(0, Math.min(1, (val - min) / (max - min)));
    },
    [isBipolar, min, max]
  );

  // Convert normalized position 0..1 to value
  const getValueFromNorm = useCallback(
    (norm: number): number => {
      let rawVal: number;
      if (isBipolar) {
        if (norm <= 0.5) {
          const frac = (0.5 - norm) / 0.5; // 0 at center, 1 at left
          rawVal = -frac * Math.abs(min);
        } else {
          const frac = (norm - 0.5) / 0.5; // 0 at center, 1 at right
          rawVal = frac * max;
        }
      } else {
        rawVal = min + norm * (max - min);
      }

      // Snap to zero if within small threshold for bipolar
      if (isBipolar && Math.abs(rawVal) < (isFilter ? 0.04 : 0.4)) {
        return 0;
      }

      // Round to step
      if (step > 0) {
        const rounded = Math.round(rawVal / step) * step;
        return parseFloat(rounded.toFixed(isFilter ? 2 : 1));
      }
      return rawVal;
    },
    [isBipolar, min, max, step, isFilter]
  );

  const norm = getNorm(value);
  // Dial rotation: -135deg (left) to 0deg (center / 12 o'clock) to +135deg (right)
  const rotDeg = -135 + norm * 270;

  // Format display text
  const formattedValue = isFilter
    ? value === 0
      ? 'OFF'
      : value > 0
      ? `HP ${Math.round(value * 100)}%`
      : `LP ${Math.round(Math.abs(value) * 100)}%`
    : `${value > 0 ? '+' : ''}${value.toFixed(0)}${displayUnit}`;

  // Start drag interaction
  const handleStartDrag = (clientX: number) => {
    setIsDragging(true);
    dragStartXRef.current = clientX;
    dragStartValueRef.current = value;
  };

  const handlePointerDownKnob = (e: React.PointerEvent) => {
    e.preventDefault();
    handleStartDrag(e.clientX);
  };

  // Direct track click / slide
  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const trackRect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - trackRect.left;
    const newNorm = Math.max(0, Math.min(1, clickX / trackRect.width));
    const newVal = getValueFromNorm(newNorm);
    onChange(newVal);
    handleStartDrag(e.clientX);
  };

  // Global pointer move & up
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      const deltaX = e.clientX - dragStartXRef.current;
      // Sensitivity: 140 pixels for full slider span
      const totalPixels = 140;
      const startNorm = getNorm(dragStartValueRef.current);
      const deltaNorm = deltaX / totalPixels;
      const nextNorm = Math.max(0, Math.min(1, startNorm + deltaNorm));
      const nextVal = getValueFromNorm(nextNorm);
      onChange(nextVal);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, getNorm, getValueFromNorm, onChange]);

  // Double click / tap resets to default
  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(defaultValue);
  };

  // Dynamic colors for filter or EQ state
  const isFilterActive = isFilter && Math.abs(value) > 0.04;
  const activeColor = isFilterActive
    ? value > 0
      ? '#00f2fe' // Highpass cyan
      : '#f43f5e' // Lowpass red
    : value > 0
    ? '#00f2fe'
    : value < 0
    ? '#ec4899'
    : '#71718a';

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex flex-col items-center gap-1 select-none relative ${className}`}
    >
      {/* Label and Reset */}
      {label ? (
        <div className="flex items-center justify-between w-full px-0.5">
          <span className="text-[9px] font-mono font-black text-zinc-200 tracking-wider leading-none">
            {label}
          </span>
          {/* Quick Reset icon when hovered or dragging */}
          {(isHovered || isDragging) && value !== defaultValue && (
            <button
              onClick={handleReset}
              className="text-[8px] font-mono font-bold text-zinc-400 hover:text-white px-0.5 rounded cursor-pointer leading-none"
              title="Double-click or click to reset to 0"
            >
              RESET
            </button>
          )}
        </div>
      ) : (isHovered || isDragging) && value !== defaultValue ? (
        <div className="flex justify-end w-full px-0.5">
          <button
            onClick={handleReset}
            className="text-[8px] font-mono font-bold text-zinc-400 hover:text-white px-0.5 rounded cursor-pointer leading-none"
            title="Reset to 0"
          >
            RESET
          </button>
        </div>
      ) : null}

      {/* Rotary Dial Visualizer & Accessory (side-by-side if accessory provided) */}
      <div className="flex items-center justify-center gap-1.5 w-full">
        <div
          onPointerDown={handlePointerDownKnob}
          onDoubleClick={handleReset}
          className={`relative ${
            compact ? 'w-7 h-7' : 'w-8 h-8'
          } flex items-center justify-center cursor-ew-resize group transition-transform shrink-0 ${
            isDragging ? 'scale-105' : 'hover:scale-102'
          }`}
          title={`${label || 'Control'}: Drag left/right to adjust. Double click to reset.`}
        >
          {/* Dial Outer Bezel */}
          <div
            style={{
              transform: `rotate(${rotDeg}deg)`,
              borderColor: isDragging ? activeColor : isFilterActive ? activeColor : '#52526b',
              boxShadow:
                isDragging || isFilterActive
                  ? `0 0 12px ${activeColor}80, inset 0 1px 0 rgba(255, 255, 255, 0.4)`
                  : 'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 2px 4px rgba(0,0,0,0.5)',
            }}
            className={`${
              compact ? 'w-6 h-6' : 'w-7 h-7'
            } rounded-full bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 border-2 flex items-center justify-center transition-shadow shadow-md`}
          >
            {/* Dial Pointer Notch */}
            <div
              style={{
                backgroundColor: isDragging || isFilterActive ? activeColor : '#ffffff',
                boxShadow: isDragging ? `0 0 6px ${activeColor}` : undefined,
              }}
              className="w-1 h-3 -mt-3 rounded-full"
            />
          </div>
        </div>

        {/* Optional Accessory (e.g. LED level meter) */}
        {accessory && <div className="shrink-0">{accessory}</div>}
      </div>

      {/* HORIZONTAL SLIDER BAR (LEFT TO RIGHT) */}
      <div
        onPointerDown={handleTrackPointerDown}
        onDoubleClick={handleReset}
        className="w-full relative py-1 cursor-ew-resize group"
        title="Slide left to cut, right to boost. Double click to reset."
      >
        {/* Slider Track Background */}
        <div className="relative w-full h-2.5 bg-zinc-950 rounded-full border border-zinc-700/80 overflow-hidden shadow-inner flex items-center">
          {/* Center Detent Marker (0 dB / Neutral line) for bipolar controls */}
          {isBipolar && (
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-zinc-600 -ml-[1px] z-10 pointer-events-none" />
          )}

          {/* Active Fill Bar from center (bipolar) or from left (unipolar) */}
          {isBipolar ? (
            norm < 0.5 ? (
              // Left side fill (cut / negative)
              <div
                style={{
                  left: `${norm * 100}%`,
                  width: `${(0.5 - norm) * 100}%`,
                  background: isFilterActive
                    ? 'linear-gradient(90deg, #f43f5e, #ec4899)'
                    : 'linear-gradient(90deg, #ec4899, #8b5cf6)',
                  boxShadow: `0 0 6px ${activeColor}60`,
                }}
                className="absolute top-0 bottom-0 rounded-l-sm transition-all duration-75"
              />
            ) : norm > 0.5 ? (
              // Right side fill (boost / positive)
              <div
                style={{
                  left: '50%',
                  width: `${(norm - 0.5) * 100}%`,
                  background: isFilterActive
                    ? 'linear-gradient(90deg, #00f2fe, #38bdf8)'
                    : 'linear-gradient(90deg, #00f2fe, #10b981)',
                  boxShadow: `0 0 6px ${activeColor}60`,
                }}
                className="absolute top-0 bottom-0 rounded-r-sm transition-all duration-75"
              />
            ) : null
          ) : (
            // Unipolar fill from left to right
            <div
              style={{
                width: `${norm * 100}%`,
                background: 'linear-gradient(90deg, #06b6d4, #00f2fe)',
              }}
              className="absolute left-0 top-0 bottom-0 rounded-l-full transition-all duration-75"
            />
          )}
        </div>

        {/* Tactile Slider Thumb (moves left to right) */}
        <div
          style={{
            left: `${norm * 100}%`,
            borderColor: isDragging ? '#ffffff' : activeColor,
            backgroundColor: isDragging ? activeColor : '#1e1e2d',
            boxShadow: isDragging
              ? `0 0 10px ${activeColor}, inset 0 1px 0 #ffffff`
              : '0 2px 5px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}
          className="absolute top-1/2 -mt-2 w-3.5 h-4 -ml-1.5 rounded-sm border-2 flex items-center justify-center transition-transform active:scale-110 shadow-md pointer-events-none"
        >
          {/* Thumb grip lines */}
          <div className="w-0.5 h-2 bg-white/70 rounded-full" />
        </div>
      </div>

      {/* Floating HUD Bubble when dragging */}
      {isDragging && (
        <div
          style={{
            borderColor: activeColor,
            boxShadow: `0 0 15px ${activeColor}60`,
          }}
          className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/95 text-white border-2 rounded-lg text-[9px] font-mono font-black z-30 whitespace-nowrap pointer-events-none shadow-2xl animate-in fade-in zoom-in-95 duration-100"
        >
          {label}: {formattedValue}
        </div>
      )}

      {/* Current Value Readout */}
      <button
        onClick={handleReset}
        className={`w-full text-center text-[8px] font-mono font-black px-1 py-0.5 rounded border leading-none transition cursor-pointer ${
          isDragging || Math.abs(value) > 0.05
            ? 'bg-zinc-900 border-zinc-650 text-white shadow-xs'
            : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
        }`}
        title="Click to reset to 0"
      >
        {formattedValue}
      </button>
    </div>
  );
};
