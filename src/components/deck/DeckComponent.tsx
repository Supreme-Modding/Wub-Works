import React, { useRef, useState } from 'react';
import { ChannelMixerState, DeckId, DeckState, FXSlotState, SpectralAnalysis } from '../../types';
import { ScrollingWaveform } from './ScrollingWaveform';
import { OverviewWaveform } from './OverviewWaveform';
import { DeckControls } from './DeckControls';
import { HotCueGrid } from './HotCueGrid';
import { LoopSection } from './LoopSection';
import { TempoPitchSection } from './TempoPitchSection';
import { BeatGridEditor } from './BeatGridEditor';
import { IntegratedChannelMixer } from './IntegratedChannelMixer';
import { WaveformDivider } from '../common/WaveformDivider';
import { PhaseMonitor } from './PhaseMonitor';
import { STARTER_TRACKS, StarterTrackMeta } from '../../audio/StarterTracks';
import { DubstepSampleMeta } from '../../audio/DubstepSamples';
import { Upload, Sparkles, Zap, Disc, Flame } from 'lucide-react';

interface DeckComponentProps {
  deck: DeckState;
  masterDeck: DeckState | null;
  channel: ChannelMixerState;
  spectralData: SpectralAnalysis | null;
  onLoadLocalFile: (deckId: DeckId, file: File) => void;
  onLoadStarterTrack: (deckId: DeckId, starterMeta: StarterTrackMeta) => void;
  onLoadDubstepSample?: (deckId: DeckId, sample: DubstepSampleMeta) => void;
  onOpenSampleModal?: (deckId: DeckId) => void;
  onOpenSynthLab?: (deckId: DeckId) => void;
  onTogglePlay: (deckId: DeckId) => void;
  onCueDown: (deckId: DeckId) => void;
  onCueUp: (deckId: DeckId) => void;
  onSeek: (deckId: DeckId, time: number) => void;
  onBeatJump: (deckId: DeckId, beats: number) => void;
  onTriggerCue: (deckId: DeckId, id: number) => void;
  onSetCue: (deckId: DeckId, id: number, pos: number, label?: string, color?: string) => void;
  onDeleteCue: (deckId: DeckId, id: number) => void;
  onSetAutoLoop: (deckId: DeckId, beats: number) => void;
  onToggleLoop: (deckId: DeckId) => void;
  onHalveLoop: (deckId: DeckId) => void;
  onDoubleLoop: (deckId: DeckId) => void;
  onStartRoll: (deckId: DeckId, beats: number) => void;
  onStopRoll: (deckId: DeckId) => void;
  onToggleSlip: (deckId: DeckId) => void;
  onToggleReverse: (deckId: DeckId) => void;
  onTriggerBrake: (deckId: DeckId) => void;
  onTempoChange: (deckId: DeckId, val: number) => void;
  onRangeChange: (deckId: DeckId, range: 4 | 8 | 16 | 50 | 100) => void;
  onToggleKeyLock: (deckId: DeckId) => void;
  onToggleSync: (deckId: DeckId) => void;
  onSetMaster: (deckId: DeckId) => void;
  onNudge: (deckId: DeckId, cents: number) => void;
  onReleaseNudge: (deckId: DeckId) => void;
  onKeyshiftChange: (deckId: DeckId, semitones: number) => void;
  onAdjustBeatGridOffset: (deckId: DeckId, deltaSec: number) => void;
  onSetDownbeat: (deckId: DeckId) => void;
  onAdjustBpm: (deckId: DeckId, delta: number) => void;
  onUpdateChannel: (id: DeckId, updates: Partial<ChannelMixerState>) => void;
  onUpdateFX1: (id: DeckId, fx: Partial<FXSlotState>) => void;
  onUpdateFX2: (id: DeckId, fx: Partial<FXSlotState>) => void;
  isProMode: boolean;
}

export const DeckComponent: React.FC<DeckComponentProps> = ({
  deck,
  masterDeck,
  channel,
  spectralData,
  onLoadLocalFile,
  onLoadStarterTrack,
  onLoadDubstepSample,
  onOpenSampleModal,
  onOpenSynthLab,
  onTogglePlay,
  onCueDown,
  onCueUp,
  onSeek,
  onBeatJump,
  onTriggerCue,
  onSetCue,
  onDeleteCue,
  onSetAutoLoop,
  onToggleLoop,
  onHalveLoop,
  onDoubleLoop,
  onStartRoll,
  onStopRoll,
  onToggleSlip,
  onToggleReverse,
  onTriggerBrake,
  onTempoChange,
  onRangeChange,
  onToggleKeyLock,
  onToggleSync,
  onSetMaster,
  onNudge,
  onReleaseNudge,
  onKeyshiftChange,
  onAdjustBeatGridOffset,
  onSetDownbeat,
  onAdjustBpm,
  onUpdateChannel,
  onUpdateFX1,
  onUpdateFX2,
  isProMode,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoadLocalFile(deck.id, file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    // 1. Check for Dubstep SFX Sample drag
    const sampleRaw = e.dataTransfer.getData('application/wubworks-sample');
    if (sampleRaw && onLoadDubstepSample) {
      try {
        const sample = JSON.parse(sampleRaw) as DubstepSampleMeta;
        onLoadDubstepSample(deck.id, sample);
        return;
      } catch (err) {
        console.error('Failed to parse dropped sample', err);
      }
    }

    // 2. Check for local audio file drag
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onLoadLocalFile(deck.id, file);
    }
  };

  // Assign demo track based on deck id
  const demoTrackIndex = deck.id === 'A' ? 0 : deck.id === 'B' ? 1 : deck.id === 'C' ? 2 : 3;
  const starterTrack = STARTER_TRACKS[demoTrackIndex];

  // Calculate rhythmic downbeat timing for subtle background flash
  const effectiveBpm = deck.bpm || 140;
  const beatSec = 60 / effectiveBpm;
  const timeSinceFirstBeat = deck.currentTime - deck.beatGridOffset;
  const currentBeatIndex = Math.floor(timeSinceFirstBeat / beatSec);
  // Beat index within 4-beat bar: 0 (downbeat 1.1), 1 (beat 2), 2 (beat 3), 3 (beat 4)
  const barBeat = ((currentBeatIndex % 4) + 4) % 4;
  const isDownbeat = barBeat === 0;

  // Fraction within current beat (0.0 to 1.0)
  const beatPhase = ((timeSinceFirstBeat % beatSec) + beatSec) % beatSec;
  const beatProgress = beatPhase / beatSec;

  // Downbeat flash intensity
  let flashOpacity = 0;
  let isDownbeatActive = false;

  if (deck.isPlaying && deck.duration > 0) {
    if (isDownbeat && beatProgress < 0.35) {
      const decay = 1 - beatProgress / 0.35;
      flashOpacity = Math.pow(decay, 1.8) * 0.22;
      isDownbeatActive = true;
    } else if (beatProgress < 0.18) {
      const decay = 1 - beatProgress / 0.18;
      flashOpacity = Math.pow(decay, 2) * 0.05;
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        boxShadow: isDragOver
          ? `0 0 50px ${deck.colorAccent}70, inset 0 0 30px ${deck.colorAccent}30`
          : isDownbeatActive
          ? `0 0 40px ${deck.colorAccent}35, inset 0 0 25px ${deck.colorAccent}15`
          : undefined,
        borderColor: isDragOver
          ? deck.colorAccent
          : isDownbeatActive
          ? `${deck.colorAccent}95`
          : undefined,
        transition: isDownbeatActive ? 'none' : 'border-color 180ms ease-out, box-shadow 220ms ease-out',
      }}
      className="flex-1 min-w-[340px] rounded-2xl bg-[#080812] border-2 border-zinc-750 p-3 flex flex-col gap-2.5 shadow-2xl transition-all relative overflow-hidden"
    >
      {/* Drag & Drop Feedback Overlay */}
      {isDragOver && (
        <div
          style={{ borderColor: deck.colorAccent, backgroundColor: 'rgba(7, 7, 18, 0.94)' }}
          className="absolute inset-0 z-50 rounded-2xl border-4 border-dashed flex flex-col items-center justify-center gap-2.5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 p-4 pointer-events-none"
        >
          <div
            style={{ backgroundColor: `${deck.colorAccent}25`, borderColor: deck.colorAccent }}
            className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center shadow-xl shadow-cyan-500/20"
          >
            <Disc style={{ color: deck.colorAccent }} className="w-8 h-8 animate-spin" />
          </div>
          <div className="text-center font-mono">
            <h4 className="text-sm font-black text-white tracking-wider">DROP SAMPLE HERE</h4>
            <p style={{ color: deck.colorAccent }} className="text-[11px] font-black mt-0.5">
              Loads immediately into DECK {deck.id}
            </p>
          </div>
        </div>
      )}

      {/* Downbeat Background Flash Effect */}
      <div
        style={{
          opacity: flashOpacity,
          background: `radial-gradient(ellipse 90% 70% at 50% 25%, ${deck.colorAccent} 0%, transparent 75%)`,
          pointerEvents: 'none',
        }}
        className="absolute inset-0 z-0 transition-opacity duration-75"
      />

      {/* Top Deck Accent Line with Downbeat Flash */}
      <div
        style={{
          backgroundColor: deck.colorAccent,
          boxShadow: isDownbeatActive ? `0 0 20px ${deck.colorAccent}` : `0 0 10px ${deck.colorAccent}`,
        }}
        className="absolute top-0 left-0 right-0 h-1.5 z-10"
      />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.flac,.aac"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 1. CHANNEL HEADER: Title, Artist, Demo Loader, Downbeat 4-Dot Rhythm Meter */}
      <div className="flex items-center justify-between gap-2 pt-0.5 z-10 relative">
        <div className="flex items-center gap-2 min-w-0">
          <div
            style={{
              borderColor: deck.colorAccent,
              color: '#ffffff',
              backgroundColor: isDownbeatActive ? `${deck.colorAccent}60` : `${deck.colorAccent}30`,
              transform: isDownbeatActive ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 80ms ease-out',
            }}
            className="w-8 h-8 rounded-xl border-2 flex items-center justify-center font-mono font-black text-sm shrink-0 shadow-md"
          >
            {deck.id}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-white truncate leading-tight drop-shadow">
              {deck.trackName || `Channel ${deck.id} (Empty)`}
            </h3>
            <p className="text-[10px] text-zinc-300 font-semibold truncate">
              {deck.artist || 'Load track to begin mixing'}
            </p>
          </div>
        </div>

        {/* Header Right: 4-Beat Rhythm Meter & Load Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Rhythmic Timing Meter: 4-beat visual downbeat dots */}
          <div
            className="flex items-center gap-1 bg-zinc-950/90 px-1.5 py-1 rounded-lg border border-zinc-750 shadow-inner"
            title={deck.isPlaying ? `Beat ${barBeat + 1} of 4${isDownbeat ? ' (Downbeat)' : ''}` : 'Rhythm Meter'}
          >
            {[0, 1, 2, 3].map((b) => {
              const isCurrent = deck.isPlaying && barBeat === b && beatProgress < 0.55;
              const isBeat1 = b === 0;
              return (
                <span
                  key={b}
                  style={{
                    backgroundColor: isCurrent ? (isBeat1 ? deck.colorAccent : '#ffffff') : '#2c2c3e',
                    boxShadow: isCurrent ? `0 0 8px ${isBeat1 ? deck.colorAccent : '#ffffff'}` : undefined,
                    transform: isCurrent ? (isBeat1 ? 'scale(1.35)' : 'scale(1.15)') : 'scale(1)',
                  }}
                  className="w-1.5 h-1.5 rounded-full transition-all duration-75"
                />
              );
            })}
          </div>

          {/* Dubstep SFX Samples Vault */}
          {onOpenSampleModal && (
            <button
              onClick={() => onOpenSampleModal(deck.id)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-pink-950/80 hover:bg-pink-900 text-pink-200 hover:text-white text-[11px] font-black border border-pink-500/80 transition active:scale-95 cursor-pointer shadow-sm"
              title="Open Dubstep SFX & Sample Vault"
            >
              <Zap className="w-3 h-3 text-pink-400 stroke-[2.5]" />
              <span className="hidden sm:inline">SFX</span>
            </button>
          )}

          {/* Wub Synth Sound Design Lab (Phase 2B) */}
          {onOpenSynthLab && (
            <button
              onClick={() => onOpenSynthLab(deck.id)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-200 hover:text-white text-[11px] font-black border border-purple-400 transition active:scale-95 cursor-pointer shadow-sm"
              title={`Open Wub Synth Lab to design & bake bass directly into Deck ${deck.id}`}
            >
              <Flame className="w-3 h-3 text-cyan-400 fill-cyan-400 stroke-[2.5]" />
              <span className="hidden sm:inline">WUB</span>
            </button>
          )}

          {/* Quick Demo Track Loader */}
          <button
            onClick={() => onLoadStarterTrack(deck.id, starterTrack)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-400 hover:bg-cyan-300 border border-white text-black text-[11px] font-black transition active:scale-95 cursor-pointer shadow-sm shadow-cyan-500/25"
            title={`Load ${starterTrack.title} (${starterTrack.bpm} BPM)`}
          >
            <Sparkles className="w-3 h-3 text-black stroke-[3]" />
            <span className="hidden sm:inline">Demo</span>
          </button>

          {/* Local File Browser */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-black border border-zinc-650 transition active:scale-95 cursor-pointer shadow-sm"
            title="Load local audio file (MP3, WAV, FLAC, OGG)"
          >
            <Upload className="w-3 h-3 text-zinc-300 stroke-[2.5]" />
            <span className="hidden sm:inline">Open</span>
          </button>
        </div>
      </div>

      {/* 2. REAL-TIME VISUAL PHASE MONITOR (Beat Alignment vs Master Clock) */}
      <PhaseMonitor
        deck={deck}
        masterDeck={masterDeck}
        onSetMaster={onSetMaster}
        onNudge={(c) => onNudge(deck.id, c)}
        onReleaseNudge={() => onReleaseNudge(deck.id)}
      />

      {/* 3. CONDENSED WAVEFORM BLOCK (Scrolling + Overview in one compact stack) */}
      <WaveformDivider color={deck.colorAccent} variant="compact" />
      <div className="flex flex-col gap-1 z-10 relative">
        <ScrollingWaveform
          spectralData={spectralData}
          currentTime={deck.currentTime}
          duration={deck.duration}
          bpm={deck.bpm}
          beatGridOffset={deck.beatGridOffset}
          hotCues={deck.hotCues}
          loop={deck.loop}
          cuePoint={deck.cuePoint}
          colorAccent={deck.colorAccent}
          onScrub={(time) => onSeek(deck.id, time)}
          isPlaying={deck.isPlaying}
        />

        <OverviewWaveform
          spectralData={spectralData}
          currentTime={deck.currentTime}
          duration={deck.duration}
          cuePoint={deck.cuePoint}
          hotCues={deck.hotCues}
          loop={deck.loop}
          colorAccent={deck.colorAccent}
          onSeek={(time) => onSeek(deck.id, time)}
        />
      </div>

      <WaveformDivider color={deck.colorAccent} variant="detailed" />

      {/* 3. UNIFIED CHANNEL BODY: Deck Controls (Left) + Integrated Channel Mixer (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 z-10 relative">
        {/* Left Sub-Column: Deck Pitch, Cues, Loops */}
        <div className="flex flex-col gap-2">
          {/* Tempo, BPM, Harmonic Key & Sync */}
          <TempoPitchSection
            bpm={deck.bpm}
            detectedBpm={deck.detectedBpm}
            tempoPercent={deck.tempoPercent}
            tempoRange={deck.tempoRange}
            keyLock={deck.keyLock}
            isSync={deck.isSync}
            isMaster={deck.isMaster}
            keyVal={deck.key}
            keyStandard={deck.keyStandard}
            keyshift={deck.keyshift}
            onTempoChange={(val) => onTempoChange(deck.id, val)}
            onRangeChange={(range) => onRangeChange(deck.id, range)}
            onToggleKeyLock={() => onToggleKeyLock(deck.id)}
            onToggleSync={() => onToggleSync(deck.id)}
            onNudge={(cents) => onNudge(deck.id, cents)}
            onReleaseNudge={() => onReleaseNudge(deck.id)}
            onKeyshiftChange={(semi) => onKeyshiftChange(deck.id, semi)}
            isProMode={isProMode}
          />

          {/* Hot Cues Grid */}
          <HotCueGrid
            hotCues={deck.hotCues}
            currentTime={deck.currentTime}
            onTriggerCue={(id) => onTriggerCue(deck.id, id)}
            onSetCue={(id, pos, label, color) => onSetCue(deck.id, id, pos, label, color)}
            onDeleteCue={(id) => onDeleteCue(deck.id, id)}
            isProMode={isProMode}
          />

          {/* Loops & Rolls */}
          <LoopSection
            loop={deck.loop}
            bpm={deck.bpm}
            onSetAutoLoop={(beats) => onSetAutoLoop(deck.id, beats)}
            onToggleLoop={() => onToggleLoop(deck.id)}
            onHalveLoop={() => onHalveLoop(deck.id)}
            onDoubleLoop={() => onDoubleLoop(deck.id)}
            onStartRoll={(beats) => onStartRoll(deck.id, beats)}
            onStopRoll={() => onStopRoll(deck.id)}
            isProMode={isProMode}
          />

          {/* Beat Grid Editor (Pro Mode) */}
          {isProMode && (
            <BeatGridEditor
              bpm={deck.bpm}
              beatGridOffset={deck.beatGridOffset}
              onAdjustOffset={(delta) => onAdjustBeatGridOffset(deck.id, delta)}
              onSetDownbeat={() => onSetDownbeat(deck.id)}
              onAdjustBpm={(delta) => onAdjustBpm(deck.id, delta)}
              onTapBpm={() => {}}
            />
          )}
        </div>

        {/* Right Sub-Column: Integrated Mixer For This Channel */}
        <div className="flex flex-col">
          <IntegratedChannelMixer
            id={deck.id}
            channel={channel}
            bpm={deck.bpm}
            colorAccent={deck.colorAccent}
            onUpdateChannel={onUpdateChannel}
            onUpdateFX1={onUpdateFX1}
            onUpdateFX2={onUpdateFX2}
            isProMode={isProMode}
          />
        </div>
      </div>

      <WaveformDivider color={deck.colorAccent} variant="detailed" />

      {/* 4. BOTTOM PRIMARY PERFORMANCE DJ FUNCTIONS: Full width, tactile and easily usable */}
      <div className="pt-0.5 z-10 relative">
        <DeckControls
          isPlaying={deck.isPlaying}
          isSlip={deck.isSlip}
          isReverse={deck.isReverse}
          isBraking={deck.isBraking}
          onTogglePlay={() => onTogglePlay(deck.id)}
          onCueDown={() => onCueDown(deck.id)}
          onCueUp={() => onCueUp(deck.id)}
          onToggleSlip={() => onToggleSlip(deck.id)}
          onToggleReverse={() => onToggleReverse(deck.id)}
          onTriggerBrake={() => onTriggerBrake(deck.id)}
          onBeatJump={(beats) => onBeatJump(deck.id, beats)}
          colorAccent={deck.colorAccent}
          isProMode={isProMode}
        />
      </div>
    </div>
  );
};
