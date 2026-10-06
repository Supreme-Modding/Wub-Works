import React from 'react';
import { DeckId, DeckState } from '../../types';
import { Crown, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

interface PhaseMonitorProps {
  deck: DeckState;
  masterDeck: DeckState | null;
  onSetMaster: (deckId: DeckId) => void;
  onNudge: (cents: number) => void;
  onReleaseNudge: () => void;
  className?: string;
}

/**
 * PhaseMonitor
 * Displays real-time beat alignment & micro-timing offset relative to the Master Clock.
 * Inspired by the Pioneer CDJ-3000 / rekordbox visual phase meter.
 * Helps DJs detect phase drift, galloping kicks, and maintain sample-accurate sync.
 */
export const PhaseMonitor: React.FC<PhaseMonitorProps> = ({
  deck,
  masterDeck,
  onSetMaster,
  onNudge,
  onReleaseNudge,
  className = '',
}) => {
  const isMaster = deck.isMaster;
  const effectiveBpm = deck.bpm * (1 + deck.tempoPercent / 100) || 140;
  const secPerBeat = 60 / effectiveBpm;

  // Deck beat timing
  const timeSinceGrid = deck.currentTime - deck.beatGridOffset;
  const currentBeatIndex = Math.floor(timeSinceGrid / secPerBeat);
  const barBeat = ((currentBeatIndex % 4) + 4) % 4; // 0, 1, 2, 3
  const beatPhase = ((timeSinceGrid % secPerBeat) + secPerBeat) % secPerBeat;
  const beatProgress = beatPhase / secPerBeat; // 0.0 to 1.0

  // Master deck timing
  let phaseOffsetBeats = 0; // -0.5 to +0.5
  let phaseOffsetMs = 0;
  let isPhaseLocked = false;
  let masterBarBeat = 0;
  let hasActiveMaster = false;

  if (masterDeck && masterDeck.id !== deck.id) {
    hasActiveMaster = true;
    const masterEffectiveBpm = masterDeck.bpm * (1 + masterDeck.tempoPercent / 100) || 140;
    const masterSecPerBeat = 60 / masterEffectiveBpm;
    const masterTimeGrid = masterDeck.currentTime - masterDeck.beatGridOffset;
    const masterBeatIdx = Math.floor(masterTimeGrid / masterSecPerBeat);
    masterBarBeat = ((masterBeatIdx % 4) + 4) % 4;

    const masterPhase = ((masterTimeGrid % masterSecPerBeat) + masterSecPerBeat) % masterSecPerBeat;
    const masterProgress = masterPhase / masterSecPerBeat;

    let diff = beatProgress - masterProgress;
    if (diff > 0.5) diff -= 1.0;
    if (diff < -0.5) diff += 1.0;

    phaseOffsetBeats = diff;
    phaseOffsetMs = Math.round(diff * secPerBeat * 1000);
    isPhaseLocked = Math.abs(phaseOffsetMs) <= 15 && deck.isPlaying && masterDeck.isPlaying;
  } else if (isMaster) {
    isPhaseLocked = deck.isPlaying;
  }

  // Pointer position: 0% = full left (-0.5 beat), 50% = center (0 ms, lock), 100% = full right (+0.5 beat)
  const needlePercent = isMaster ? 50 : Math.max(0, Math.min(100, (phaseOffsetBeats + 0.5) * 100));

  return (
    <div
      className={`flex flex-col gap-1.5 p-2 rounded-xl bg-[#090914] border-2 border-zinc-750 shadow-md select-none ${className}`}
    >
      {/* Top Header: Master Indicator & Phase Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Master Toggle Button */}
          <button
            onClick={() => onSetMaster(deck.id)}
            className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-black transition cursor-pointer flex items-center gap-1 border ${
              isMaster
                ? 'bg-amber-400 text-black border-white shadow-md shadow-amber-400/40 ring-1 ring-amber-300'
                : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 border-zinc-700'
            }`}
            title={isMaster ? 'This deck is the Master Clock reference' : 'Click to set this deck as Master Clock'}
          >
            <Crown className={`w-3 h-3 ${isMaster ? 'fill-black' : ''}`} />
            <span>{isMaster ? 'MASTER CLOCK' : 'SET MASTER'}</span>
          </button>

          {!isMaster && hasActiveMaster && (
            <span className="text-[8px] font-mono font-bold text-zinc-400">
              REF: DECK {masterDeck?.id}
            </span>
          )}
        </div>

        {/* Phase Offset Milliseconds Readout */}
        <div className="flex items-center gap-1 text-[9px] font-mono font-black">
          {isMaster ? (
            <span className="text-amber-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-amber-400" /> MASTER 0ms
            </span>
          ) : !deck.isPlaying ? (
            <span className="text-zinc-500">PAUSED</span>
          ) : isPhaseLocked ? (
            <span className="text-emerald-400 flex items-center gap-1 drop-shadow">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> IN-PHASE (0ms)
            </span>
          ) : phaseOffsetMs > 0 ? (
            <span className="text-cyan-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-cyan-400" /> +{phaseOffsetMs}ms (AHEAD)
            </span>
          ) : (
            <span className="text-pink-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-pink-400" /> {phaseOffsetMs}ms (BEHIND)
            </span>
          )}
        </div>
      </div>

      {/* 4-BEAT BAR GRID (PIONEER CDJ STYLE) */}
      <div className="grid grid-cols-4 gap-1 w-full bg-zinc-950 p-1 rounded-lg border border-zinc-800">
        {[0, 1, 2, 3].map((b) => {
          const isCurrentDeckBeat = deck.isPlaying && barBeat === b;
          const isMasterBeat = hasActiveMaster && masterDeck?.isPlaying && masterBarBeat === b;
          const isBeat1 = b === 0;

          return (
            <div
              key={b}
              className={`relative h-5 rounded flex items-center justify-between px-1.5 border transition-all ${
                isCurrentDeckBeat
                  ? isBeat1
                    ? 'bg-cyan-500/30 border-cyan-400 text-white shadow-sm'
                    : 'bg-zinc-800 border-zinc-650 text-white'
                  : 'bg-zinc-900/80 border-zinc-850 text-zinc-500'
              }`}
            >
              {/* Beat Number Tag */}
              <span
                className={`text-[9px] font-mono font-black ${
                  isCurrentDeckBeat ? 'text-white drop-shadow' : 'text-zinc-500'
                }`}
              >
                {b + 1}
              </span>

              {/* Deck Beat Flash Light */}
              <div
                style={{
                  backgroundColor: isCurrentDeckBeat
                    ? isBeat1
                      ? deck.colorAccent
                      : '#ffffff'
                    : '#222230',
                  boxShadow: isCurrentDeckBeat
                    ? `0 0 6px ${isBeat1 ? deck.colorAccent : '#ffffff'}`
                    : undefined,
                }}
                className="w-1.5 h-1.5 rounded-full transition-transform"
              />

              {/* Master beat comparative indicator (if slave) */}
              {!isMaster && hasActiveMaster && isMasterBeat && (
                <div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-amber-400 rounded-full shadow-xs"
                  title="Master Deck Beat"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* HORIZONTAL PHASE ALIGNMENT METER (MICRO-TIMING GAUGE) */}
      <div className="relative w-full h-4 bg-zinc-950 rounded-lg border border-zinc-750 overflow-hidden flex items-center">
        {/* Center Target Lock Line (0 ms mark) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-emerald-400 -ml-[1px] z-10 shadow-xs shadow-emerald-400" />

        {/* Phase Zone Gradient Fill */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-950/40 via-transparent to-cyan-950/40 pointer-events-none" />

        {/* Left 'Behind' Label / Right 'Ahead' Label */}
        <span className="absolute left-1.5 text-[7px] font-mono font-bold text-zinc-500 pointer-events-none">
          ◄ BEHIND
        </span>
        <span className="absolute right-1.5 text-[7px] font-mono font-bold text-zinc-500 pointer-events-none">
          AHEAD ►
        </span>

        {/* Active Phase Needle Indicator */}
        <div
          style={{
            left: `${needlePercent}%`,
            transition: deck.isPlaying ? 'none' : 'left 150ms ease-out',
          }}
          className="absolute top-0 bottom-0 w-3 -ml-1.5 flex items-center justify-center z-20 pointer-events-none"
        >
          {/* Diamond needle */}
          <div
            style={{
              backgroundColor: isMaster
                ? '#f59e0b'
                : isPhaseLocked
                ? '#10b981'
                : phaseOffsetMs > 0
                ? '#00f2fe'
                : '#f43f5e',
              boxShadow: isPhaseLocked
                ? '0 0 8px #10b981'
                : phaseOffsetMs > 0
                ? '0 0 8px #00f2fe'
                : '0 0 8px #f43f5e',
            }}
            className="w-2.5 h-2.5 rotate-45 border border-white shadow-md"
          />
        </div>
      </div>

      {/* QUICK NUDGE CORRECTION BUTTONS */}
      {!isMaster && hasActiveMaster && (
        <div className="flex items-center justify-between gap-1 pt-0.5">
          <button
            onMouseDown={() => onNudge(-30)}
            onMouseUp={onReleaseNudge}
            onMouseLeave={onReleaseNudge}
            onTouchStart={() => onNudge(-30)}
            onTouchEnd={onReleaseNudge}
            className="flex-1 py-0.5 px-1 rounded bg-zinc-850 hover:bg-zinc-800 active:bg-cyan-400 active:text-black border border-zinc-700 text-[8px] font-mono font-bold text-zinc-300 transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
            title="Nudge back to correct rushing beat"
          >
            <ArrowLeft className="w-2.5 h-2.5" />
            <span>NUDGE - (PULL)</span>
          </button>

          <button
            onMouseDown={() => onNudge(30)}
            onMouseUp={onReleaseNudge}
            onMouseLeave={onReleaseNudge}
            onTouchStart={() => onNudge(30)}
            onTouchEnd={onReleaseNudge}
            className="flex-1 py-0.5 px-1 rounded bg-zinc-850 hover:bg-zinc-800 active:bg-cyan-400 active:text-black border border-zinc-700 text-[8px] font-mono font-bold text-zinc-300 transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
            title="Nudge forward to correct dragging beat"
          >
            <span>NUDGE + (PUSH)</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>
      )}
    </div>
  );
};
