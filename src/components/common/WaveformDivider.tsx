import React from 'react';

interface WaveformDividerProps {
  color?: string;
  variant?: 'detailed' | 'compact' | 'subtle';
  className?: string;
  glow?: boolean;
  height?: number;
}

/**
 * WaveformDivider
 * Replaces bland dividing lines with an authentic dubstep audio waveform contour.
 * Visualizes soundwave peaks, sub drops, and audio transients between subsections.
 */
export const WaveformDivider: React.FC<WaveformDividerProps> = ({
  color = '#00f2fe',
  variant = 'detailed',
  className = '',
  glow = true,
  height = 12,
}) => {
  // Waveform SVG contours based on variant
  return (
    <div className={`relative w-full flex items-center select-none overflow-hidden py-0.5 ${className}`}>
      {/* Background subtle soundwave track */}
      <svg
        style={{ height: `${height}px` }}
        className="w-full block"
        viewBox="0 0 300 12"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`wf-grad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="25%" stopColor={color} stopOpacity="0.75" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="75%" stopColor={color} stopOpacity="0.75" />
            <stop offset="100%" stopColor={color} stopOpacity="0.2" />
          </linearGradient>
          <filter id={`wf-glow-${color.replace('#', '')}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Center baseline with low opacity */}
        <line
          x1="0"
          y1="6"
          x2="300"
          y2="6"
          stroke="#27273a"
          strokeWidth="1"
          strokeDasharray="2,3"
        />

        {variant === 'compact' ? (
          /* Compact rhythmic pulse */
          <path
            d="M 0 6 L 40 6 L 50 3 L 55 9 L 60 6 L 90 6 L 100 1 L 105 11 L 110 2 L 115 10 L 120 6 L 160 6 L 170 3 L 175 9 L 180 6 L 210 6 L 220 1 L 225 11 L 230 2 L 235 10 L 240 6 L 300 6"
            fill="none"
            stroke={`url(#wf-grad-${color.replace('#', '')})`}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={glow ? `url(#wf-glow-${color.replace('#', '')})` : undefined}
          />
        ) : variant === 'subtle' ? (
          /* Smooth frequency sine pulse */
          <path
            d="M 0 6 Q 25 3, 50 6 T 100 6 T 150 6 T 200 6 T 250 6 T 300 6"
            fill="none"
            stroke={color}
            strokeOpacity="0.4"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        ) : (
          /* Detailed Dubstep Drop & Wub Contour */
          <>
            {/* Upper & lower frequency fill */}
            <path
              d="M 0 6 L 25 6 L 32 3 L 38 9 L 45 6 L 65 6 L 72 2 L 78 10 L 85 4 L 92 8 L 98 6 L 120 6 L 128 0 L 134 12 L 140 1 L 146 11 L 152 2 L 158 10 L 165 6 L 195 6 L 202 3 L 208 9 L 215 6 L 235 6 L 242 2 L 248 10 L 255 4 L 262 8 L 268 6 L 300 6"
              fill="none"
              stroke={`url(#wf-grad-${color.replace('#', '')})`}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={glow ? `url(#wf-glow-${color.replace('#', '')})` : undefined}
            />
            {/* Transient peak dots */}
            <circle cx="128" cy="1" r="1.5" fill="#ffffff" />
            <circle cx="134" cy="11" r="1.5" fill={color} />
            <circle cx="140" cy="1" r="1.5" fill="#ffffff" />
            <circle cx="146" cy="11" r="1.5" fill={color} />
          </>
        )}
      </svg>
    </div>
  );
};
