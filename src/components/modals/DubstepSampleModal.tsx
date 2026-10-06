import React, { useState, useEffect, useRef } from 'react';
import {
  DubstepSampleMeta,
  SampleCategory,
  DUBSTEP_SAMPLES,
  synthesizeDubstepSample,
} from '../../audio/DubstepSamples';
import { AudioEngine } from '../../audio/AudioEngine';
import { DeckId } from '../../types';
import {
  X,
  Play,
  Square,
  Search,
  Volume2,
  Sparkles,
  Zap,
  Crosshair,
  TrendingUp,
  Mic2,
  Activity,
  GripVertical,
  Layers,
  Check,
  Disc,
} from 'lucide-react';

interface DubstepSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSampleToDeck: (deckId: DeckId, sample: DubstepSampleMeta) => void;
  activeDeckIds: DeckId[];
  preselectedDeckId?: DeckId;
}

const CATEGORIES: { key: 'all' | SampleCategory; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'ALL SAMPLES', icon: Layers },
  { key: 'bass', label: 'BASS & GROWLS', icon: Zap },
  { key: 'gunshot_laser', label: 'GUNSHOTS & LASERS', icon: Crosshair },
  { key: 'riser_sweep', label: 'RISERS & SWEEPS', icon: TrendingUp },
  { key: 'vocal', label: 'VOCALS & CHANTS', icon: Mic2 },
  { key: 'impact_slam', label: 'IMPACTS & SLAMS', icon: Activity },
];

export const DubstepSampleModal: React.FC<DubstepSampleModalProps> = ({
  isOpen,
  onClose,
  onLoadSampleToDeck,
  activeDeckIds,
  preselectedDeckId = 'A',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | SampleCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingSampleId, setPlayingSampleId] = useState<string | null>(null);
  const [previewProgress, setPreviewProgress] = useState<number>(0);
  const [previewVolume, setPreviewVolume] = useState<number>(0.85);
  const [lastLoadedNotice, setLastLoadedNotice] = useState<{ name: string; deckId: DeckId } | null>(null);

  // Audio Preview Node references
  const previewSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const previewGainRef = useRef<GainNode | null>(null);
  const progressAnimRef = useRef<number | null>(null);
  const previewStartTimeRef = useRef<number>(0);
  const previewDurationRef = useRef<number>(0);

  // Stop preview on unmount or modal close
  useEffect(() => {
    return () => {
      stopPreview();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopPreview();
    }
  }, [isOpen]);

  // Adjust preview volume in real time
  useEffect(() => {
    if (previewGainRef.current && AudioEngine.ctx) {
      previewGainRef.current.gain.setTargetAtTime(previewVolume, AudioEngine.ctx.currentTime, 0.02);
    }
  }, [previewVolume]);

  const stopPreview = () => {
    if (progressAnimRef.current) {
      cancelAnimationFrame(progressAnimRef.current);
      progressAnimRef.current = null;
    }
    if (previewSourceRef.current) {
      AudioEngine.unregisterPreviewSource(previewSourceRef.current);
      try {
        previewSourceRef.current.stop();
        previewSourceRef.current.disconnect();
      } catch {
        // Source might already have ended
      }
      previewSourceRef.current = null;
    }
    setPlayingSampleId(null);
    setPreviewProgress(0);
  };

  const handleTogglePreview = (sample: DubstepSampleMeta) => {
    if (playingSampleId === sample.id) {
      stopPreview();
      return;
    }

    stopPreview();

    try {
      const ctx = AudioEngine.init();
      const buffer = synthesizeDubstepSample(ctx, sample);

      if (!previewGainRef.current) {
        previewGainRef.current = ctx.createGain();
        previewGainRef.current.connect(ctx.destination);
      }
      previewGainRef.current.gain.value = previewVolume;

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(previewGainRef.current);

      AudioEngine.registerPreviewSource(source);
      previewSourceRef.current = source;
      previewDurationRef.current = buffer.duration;
      previewStartTimeRef.current = performance.now();
      setPlayingSampleId(sample.id);

      source.onended = () => {
        AudioEngine.unregisterPreviewSource(source);
        if (playingSampleId === sample.id || !previewSourceRef.current) {
          stopPreview();
        }
      };

      source.start();

      // Progress animation loop
      const updateProgress = () => {
        const elapsed = (performance.now() - previewStartTimeRef.current) / 1000;
        const progress = Math.min(1, elapsed / previewDurationRef.current);
        setPreviewProgress(progress);

        if (progress < 1 && previewSourceRef.current) {
          progressAnimRef.current = requestAnimationFrame(updateProgress);
        } else {
          stopPreview();
        }
      };
      progressAnimRef.current = requestAnimationFrame(updateProgress);
    } catch (err) {
      console.error('Failed to preview sample:', err);
      stopPreview();
    }
  };

  const handleDragStart = (e: React.DragEvent, sample: DubstepSampleMeta) => {
    e.dataTransfer.setData('application/wubworks-sample', JSON.stringify(sample));
    e.dataTransfer.setData('text/plain', sample.name);
    e.dataTransfer.effectAllowed = 'copy';

    // Create a sleek drag ghost image
    const ghost = document.createElement('div');
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    ghost.style.padding = '8px 14px';
    ghost.style.background = '#090915';
    ghost.style.color = '#ffffff';
    ghost.style.borderRadius = '10px';
    ghost.style.border = `2px solid ${sample.color}`;
    ghost.style.fontFamily = 'monospace';
    ghost.style.fontSize = '12px';
    ghost.style.fontWeight = 'bold';
    ghost.style.boxShadow = `0 0 15px ${sample.color}`;
    ghost.innerText = `⚡ ${sample.name}`;
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 20, 20);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleQuickLoad = (deckId: DeckId, sample: DubstepSampleMeta) => {
    onLoadSampleToDeck(deckId, sample);
    setLastLoadedNotice({ name: sample.name, deckId });
    setTimeout(() => setLastLoadedNotice(null), 3000);
  };

  if (!isOpen) return null;

  // Filter samples based on category and search query
  const filteredSamples = DUBSTEP_SAMPLES.filter((sample) => {
    const matchesCategory = selectedCategory === 'all' || sample.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      sample.name.toLowerCase().includes(query) ||
      sample.description.toLowerCase().includes(query) ||
      sample.tags.some((tag) => tag.toLowerCase().includes(query)) ||
      (sample.key && sample.key.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] rounded-3xl bg-[#080814] border-2 border-zinc-700 shadow-2xl flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow Edge */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-pink-500 to-amber-400" />

        {/* 1. MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b-2 border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/30">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Disc className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-display tracking-tight text-white">
                  DUBSTEP SFX &amp; SAMPLE VAULT
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-400 text-cyan-300 font-black">
                  {DUBSTEP_SAMPLES.length} SAMPLES
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono flex items-center gap-1.5 mt-0.5">
                <GripVertical className="w-3.5 h-3.5 text-pink-400 inline" />
                <span>Drag any sample directly onto a deck, or use the quick-load buttons.</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Preview Volume Control */}
            <div className="flex items-center gap-2 bg-zinc-900/90 px-2.5 py-1.5 rounded-xl border border-zinc-750 text-xs font-mono">
              <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[10px] text-zinc-400 font-bold hidden sm:inline">PREVIEW:</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={previewVolume}
                onChange={(e) => setPreviewVolume(parseFloat(e.target.value))}
                className="w-16 accent-cyan-400 h-1.5 cursor-pointer"
                title={`Preview Volume: ${Math.round(previewVolume * 100)}%`}
              />
              <span className="text-[10px] text-zinc-300 font-mono w-7 text-right">
                {Math.round(previewVolume * 100)}%
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-2 border-zinc-750 transition cursor-pointer active:scale-95 shadow-md"
              title="Close Sample Vault"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. DRAG & DROP HINT BANNER & LAST LOADED TOAST */}
        <div className="px-4 py-2 bg-gradient-to-r from-indigo-950/40 via-cyan-950/30 to-pink-950/40 border-b border-zinc-800 flex items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-cyan-300 text-[11px]">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Tip:</strong> Grab any sample card and drop it onto <strong>Deck A, B, C, or D</strong> to begin live remixing, scratching, and filtering!
            </span>
          </div>

          {lastLoadedNotice && (
            <div className="flex items-center gap-1.5 bg-emerald-950 border border-emerald-400 text-emerald-300 px-2.5 py-1 rounded-lg text-[10px] font-black animate-in fade-in duration-150">
              <Check className="w-3 h-3 text-emerald-400" />
              <span>
                Loaded &quot;{lastLoadedNotice.name}&quot; into Deck {lastLoadedNotice.deckId}!
              </span>
            </div>
          )}
        </div>

        {/* 3. SEARCH & CATEGORY FILTER TABS */}
        <div className="p-3 sm:px-5 sm:py-3 border-b border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/40">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, tag, key, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border-2 border-zinc-750 rounded-xl pl-9 pr-8 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Deck Target Indicator */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 shrink-0">
            <span className="text-[10px] font-bold text-zinc-400">ACTIVE DECKS:</span>
            <div className="flex gap-1">
              {activeDeckIds.map((id) => (
                <span
                  key={id}
                  className="px-2 py-0.5 rounded-md bg-zinc-850 border border-zinc-700 text-white font-black text-[10px]"
                >
                  {id}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="px-3 sm:px-5 py-2.5 border-b border-zinc-800/80 bg-zinc-950/60 overflow-x-auto flex items-center gap-1.5 scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.key;
            const count =
              cat.key === 'all'
                ? DUBSTEP_SAMPLES.length
                : DUBSTEP_SAMPLES.filter((s) => s.category === cat.key).length;

            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-black transition cursor-pointer shrink-0 border-2 ${
                  isSelected
                    ? 'bg-cyan-500 text-black border-white shadow-lg shadow-cyan-500/25 scale-102'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-850'
                }`}
              >
                <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{cat.label}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 4. SAMPLES GRID / LIST */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[58vh]">
          {filteredSamples.length === 0 ? (
            <div className="col-span-full py-12 text-center flex flex-col items-center justify-center gap-2">
              <Search className="w-8 h-8 text-zinc-600" />
              <p className="text-sm font-mono text-zinc-400">No dubstep samples match your filter.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="mt-2 text-xs font-mono text-cyan-400 underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredSamples.map((sample) => {
              const isPlaying = playingSampleId === sample.id;

              return (
                <div
                  key={sample.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, sample)}
                  className={`group relative rounded-2xl bg-zinc-900/90 border-2 transition-all p-3.5 flex flex-col justify-between gap-3 cursor-grab active:cursor-grabbing hover:bg-zinc-850/90 shadow-lg ${
                    isPlaying
                      ? 'border-cyan-400 ring-2 ring-cyan-400/30 shadow-cyan-500/20'
                      : 'border-zinc-750 hover:border-zinc-600'
                  }`}
                >
                  {/* Real-time playback progress bar across card */}
                  {isPlaying && (
                    <div
                      style={{
                        width: `${previewProgress * 100}%`,
                        backgroundColor: sample.color,
                        boxShadow: `0 0 10px ${sample.color}`,
                      }}
                      className="absolute bottom-0 left-0 h-1 rounded-b-2xl transition-all duration-75 pointer-events-none"
                    />
                  )}

                  {/* Top: Drag Handle, Sample Name, Category Badge & Preview Button */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      {/* Drag Handle Indicator */}
                      <div
                        className="p-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-500 group-hover:text-cyan-400 transition shrink-0 cursor-grab active:cursor-grabbing"
                        title="Drag this sample directly onto any deck"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-black font-mono text-white tracking-wide truncate">
                            {sample.name}
                          </h4>
                          <span
                            style={{ color: sample.color, borderColor: `${sample.color}60` }}
                            className="text-[9px] font-mono font-black uppercase px-1.5 py-0.2 rounded border bg-zinc-950/90 shrink-0"
                          >
                            {sample.duration}s
                          </span>
                          {sample.key && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                              {sample.key}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2 mt-1">
                          {sample.description}
                        </p>
                      </div>
                    </div>

                    {/* Preview Play / Stop Button */}
                    <button
                      onClick={() => handleTogglePreview(sample)}
                      className={`p-2.5 rounded-xl border-2 transition cursor-pointer shrink-0 select-none shadow-md ${
                        isPlaying
                          ? 'bg-rose-500 text-black border-white shadow-rose-500/50 animate-pulse'
                          : 'bg-cyan-500 text-black border-white hover:bg-cyan-400 shadow-cyan-500/25'
                      }`}
                      title={isPlaying ? 'Stop Preview' : 'Play Preview'}
                    >
                      {isPlaying ? (
                        <Square className="w-4 h-4 fill-current stroke-[2.5]" />
                      ) : (
                        <Play className="w-4 h-4 fill-current stroke-[2.5]" />
                      )}
                    </button>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {sample.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-zinc-950/80 border border-zinc-800 text-zinc-400 font-semibold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Bottom: Quick Deck Loading Buttons & Drag instruction */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/80 text-xs font-mono">
                    <span className="text-[10px] text-zinc-500 font-bold hidden sm:inline">
                      LOAD TO:
                    </span>

                    {/* Quick Load Buttons for Active Decks */}
                    <div className="flex items-center gap-1 flex-1 sm:flex-initial justify-end">
                      {activeDeckIds.map((deckId) => (
                        <button
                          key={deckId}
                          onClick={() => handleQuickLoad(deckId, sample)}
                          className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg text-[10px] font-mono font-black border transition cursor-pointer select-none active:scale-95 shadow-sm ${
                            preselectedDeckId === deckId
                              ? 'bg-zinc-800 hover:bg-cyan-500 hover:text-black border-zinc-650 text-white'
                              : 'bg-zinc-950 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-white'
                          }`}
                          title={`Instantly load "${sample.name}" into Deck ${deckId}`}
                        >
                          + DECK {deckId}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 5. FOOTER */}
        <div className="p-3.5 sm:px-5 border-t-2 border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] text-zinc-300">
              Procedural Web Audio Engine • 100% CC0 Public Domain Royalty-Free
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-mono font-black transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
