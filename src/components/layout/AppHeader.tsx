import React from 'react';
import { AppLayoutMode, ThemeConfig } from '../../types';
import { PWAInstallButton } from '../../pwa/PWAInstallButton';
import {
  Sparkles,
  Sliders,
  Cpu,
  Palette,
  HelpCircle,
  Radio,
  Zap,
  Flame,
  Square,
  Music,
} from 'lucide-react';

interface AppHeaderProps {
  layoutMode: AppLayoutMode;
  onSelectLayout: (mode: AppLayoutMode) => void;
  isProMode: boolean;
  onToggleProMode: () => void;
  isRecording: boolean;
  recordingSeconds: number;
  onToggleRecord: () => void;
  onOpenMidiModal: () => void;
  onOpenThemeModal: () => void;
  onOpenShortcuts: () => void;
  onOpenTutorial: () => void;
  onOpenSampleModal: () => void;
  onOpenSynthLab: () => void;
  onStopAllAudio?: () => void;
  isAnyAudioPlaying?: boolean;
  stopFeedback?: boolean;
  onToggleKeyboard?: () => void;
  isKeyboardOpen?: boolean;
  theme: ThemeConfig;
  connectedMidiCount: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  layoutMode,
  onSelectLayout,
  isProMode,
  onToggleProMode,
  isRecording,
  recordingSeconds,
  onToggleRecord,
  onOpenMidiModal,
  onOpenThemeModal,
  onOpenShortcuts,
  onOpenTutorial,
  onOpenSampleModal,
  onOpenSynthLab,
  onStopAllAudio,
  isAnyAudioPlaying,
  stopFeedback,
  onToggleKeyboard,
  isKeyboardOpen,
  theme,
  connectedMidiCount,
}) => {
  const formatTimer = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <header className="w-full bg-[#07070e] border-b border-zinc-800 px-2.5 sm:px-3 py-1.5 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 select-none z-30 shadow-md">
      {/* Brand & Identity */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 via-indigo-500 to-pink-500 p-0.5 shadow-md shadow-cyan-500/20 shrink-0">
          <div className="w-full h-full bg-zinc-950 rounded-[6px] flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
          </div>
        </div>

        <div className="flex items-baseline gap-1.5">
          <h1 className="text-sm font-black tracking-tight font-display text-white drop-shadow">
            WUB WORKS
          </h1>
          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded-md bg-purple-950/80 border border-purple-500/50 text-purple-300 font-bold hidden sm:inline">
            PHASE 2B
          </span>
        </div>
      </div>

      {/* Center Layout Presets & Beginner/Pro Toggle */}
      <div className="flex items-center gap-1.5">
        {/* Layout Presets */}
        <div className="flex items-center p-0.5 rounded-lg bg-zinc-950 border border-zinc-750 text-[10px] font-mono shadow-inner">
          <button
            onClick={() => onSelectLayout('perform')}
            className={`px-2 py-0.5 rounded-md transition font-black cursor-pointer border ${
              layoutMode === 'perform'
                ? 'bg-zinc-800 text-white border-zinc-600 shadow-xs'
                : 'text-zinc-400 hover:text-white border-transparent'
            }`}
            title="Perform Layout: Dual Waveform Decks + Tactile Mixer"
          >
            PERFORM
          </button>
          <button
            onClick={() => onSelectLayout('compact')}
            className={`px-2 py-0.5 rounded-md transition font-black cursor-pointer border ${
              layoutMode === 'compact'
                ? 'bg-zinc-800 text-white border-zinc-600 shadow-xs'
                : 'text-zinc-400 hover:text-white border-transparent'
            }`}
            title="Compact Layout: Landscape Mobile Optimized"
          >
            COMPACT
          </button>
          <button
            onClick={() => onSelectLayout('pro4')}
            className={`px-2 py-0.5 rounded-md transition font-black cursor-pointer border ${
              layoutMode === 'pro4'
                ? 'bg-cyan-400 text-black border-white shadow-xs'
                : 'text-zinc-400 hover:text-white border-transparent'
            }`}
            title="4-Decks Pro Layout: Decks A, B, C, D"
          >
            4 DECKS
          </button>
        </div>

        {/* Beginner / Pro Mode Toggle */}
        <button
          onClick={onToggleProMode}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-black border transition cursor-pointer select-none shadow-xs ${
            isProMode
              ? 'bg-purple-950/90 border-purple-400 text-purple-100'
              : 'bg-zinc-900 border-zinc-750 text-zinc-300 hover:text-white'
          }`}
          title="Toggle Beginner / Pro Mode"
        >
          <Sliders className="w-3 h-3 text-purple-300 stroke-[2.5]" />
          <span>{isProMode ? 'PRO' : 'BEG'}</span>
        </button>
      </div>

      {/* Right Controls: Stop All, Rec, SFX, Keys Toggle, Wub Synth, MIDI, Settings */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Panic / Emergency STOP ALL AUDIO Button */}
        {onStopAllAudio && (
          <button
            onClick={onStopAllAudio}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-black transition cursor-pointer border shadow-sm select-none active:scale-95 ${
              stopFeedback
                ? 'bg-rose-500 text-white border-white shadow-rose-500/80 animate-pulse scale-105 ring-2 ring-rose-400'
                : isAnyAudioPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-white shadow-rose-600/50 animate-pulse ring-1 ring-rose-400'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-700'
            }`}
            title="Emergency Panic: Stop All Decks & Synth Audio (or press ESC key)"
          >
            <Square className="w-3 h-3 fill-current stroke-[2.5]" />
            <span>{stopFeedback ? 'STOPPED!' : 'STOP'}</span>
            <span className="text-[8px] px-1 py-0.2 bg-black/50 rounded border border-white/20 font-bold hidden md:inline">ESC</span>
          </button>
        )}

        {/* Live Performance Keyboard Bar Toggle */}
        {onToggleKeyboard && (
          <button
            onClick={onToggleKeyboard}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-mono font-black border transition cursor-pointer select-none active:scale-95 shadow-sm ${
              isKeyboardOpen
                ? 'bg-cyan-400 text-black border-white shadow-cyan-400/40 ring-1 ring-cyan-300'
                : 'bg-purple-950/80 hover:bg-purple-900 border-purple-400 text-purple-200 hover:text-white'
            }`}
            title="Toggle Live Performance Wub Keyboard (Play live bass over decks)"
          >
            <Music className="w-3 h-3 stroke-[2.5]" />
            <span>KEYS</span>
          </button>
        )}

        {/* Quick REC Button */}
        <button
          onClick={onToggleRecord}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-mono font-black transition cursor-pointer border shadow-sm ${
            isRecording
              ? 'bg-rose-500 text-black border-white shadow-rose-500/50 animate-pulse'
              : 'bg-rose-950/80 hover:bg-rose-900 text-rose-200 hover:text-white border-rose-500/80'
          }`}
          title="Record Live Master Mix to WAV"
        >
          <Radio className="w-3 h-3 fill-current stroke-[2.5]" />
          <span>{isRecording ? formatTimer(recordingSeconds) : 'REC'}</span>
        </button>

        {/* Dubstep SFX & Sample Vault Button */}
        <button
          onClick={onOpenSampleModal}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-pink-950/90 hover:bg-pink-900 border border-pink-400 text-pink-100 text-[11px] font-mono font-black transition cursor-pointer shadow-sm select-none active:scale-95"
          title="Browse & Drag Dubstep Sound Effect Samples (Lasers, Growls, Gunshots, Subs)"
        >
          <Zap className="w-3 h-3 text-pink-400 stroke-[2.5]" />
          <span className="hidden sm:inline">SFX</span>
        </button>

        {/* Wub Synth Sound Design Lab Button (Phase 2B) */}
        <button
          onClick={onOpenSynthLab}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-950/90 hover:bg-purple-900 border border-purple-400 text-purple-100 text-[11px] font-mono font-black transition cursor-pointer shadow-sm select-none active:scale-95"
          title="Open Wub Synth Sound Design Lab (Modular Bass Synthesizer & Bake to Deck)"
        >
          <Flame className="w-3 h-3 text-cyan-400 fill-cyan-400 stroke-[2.5]" />
          <span className="hidden sm:inline">WUB LAB</span>
        </button>

        {/* MIDI Controller Status */}
        <button
          onClick={onOpenMidiModal}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-mono font-bold transition cursor-pointer shadow-xs ${
            connectedMidiCount > 0
              ? 'bg-emerald-950/90 border-emerald-400 text-emerald-100'
              : 'bg-zinc-900 border-zinc-750 text-zinc-300 hover:text-white'
          }`}
          title="MIDI Controller Mappings & Learn"
        >
          <Cpu className="w-3 h-3 stroke-[2.5]" />
          <span className="hidden sm:inline">
            {connectedMidiCount > 0 ? `MIDI (${connectedMidiCount})` : 'MIDI'}
          </span>
        </button>

        {/* Theme Picker */}
        <button
          onClick={onOpenThemeModal}
          className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-750 transition cursor-pointer shadow-xs"
          title="Custom Colors & Themes"
        >
          <Palette className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* Keyboard Shortcuts */}
        <button
          onClick={onOpenShortcuts}
          className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-750 transition cursor-pointer shadow-xs"
          title="Keyboard Shortcut Cheat Sheet (?)"
        >
          <HelpCircle className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* Interactive Tutorial Button */}
        <button
          onClick={onOpenTutorial}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-400 text-indigo-100 text-[11px] font-black transition cursor-pointer shadow-xs"
          title="Open Interactive Onboarding Tutorial"
        >
          <Sparkles className="w-3 h-3 text-indigo-300 stroke-[2.5]" />
          <span className="hidden md:inline">Tour</span>
        </button>

        {/* Install PWA Button */}
        <PWAInstallButton />
      </div>
    </header>
  );
};
