import React, { useState } from 'react';
import { Sparkles, Play, Disc3, Sliders, Volume2, ArrowRight, ArrowLeft, CheckCircle, X, ShieldAlert } from 'lucide-react';

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStarterTrack?: () => void;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  isOpen,
  onClose,
  onSelectStarterTrack,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Welcome to Wub Works',
      subtitle: 'Energy-First Dubstep Performance & DJ Suite',
      icon: Sparkles,
      color: 'text-cyan-400',
      badge: 'Step 1 of 6',
      content: (
        <div className="space-y-3 text-sm text-zinc-300">
          <p>
            Wub Works is engineered specifically for heavy bass music. Unlike conventional DJ software, it features an <strong className="text-white">energy-first architecture</strong>:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
              <span className="text-cyan-400 font-bold block mb-1">Frequency Waveforms</span>
              Sub-bass in neon pink, midrange wubs in amber, crisp transients in cyan.
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
              <span className="text-pink-400 font-bold block mb-1">Camelot Harmonic Key</span>
              Harmonic wheel notation (8A, 9A) guarantees your drops and basslines blend without clashing.
            </div>
          </div>
          <p className="text-xs text-zinc-400">
            Take this quick 60-second interactive tour, or skip directly to the decks if you already know how to mix!
          </p>
        </div>
      ),
    },
    {
      title: 'Loading Dubstep Tracks',
      subtitle: 'Deck A & Deck B File Loading',
      icon: Disc3,
      color: 'text-pink-400',
      badge: 'Step 2 of 6',
      content: (
        <div className="space-y-3 text-sm text-zinc-300">
          <p>
            Every deck can load audio in two ways:
          </p>
          <ul className="space-y-2 text-xs">
            <li className="flex items-start gap-2 bg-zinc-800/50 p-2.5 rounded-xl border border-zinc-700/40">
              <span className="text-cyan-400 font-bold shrink-0">1. Starter Dubstep Lab:</span>
              <span>Tap <strong>"Load Demo Track"</strong> on any deck to instantly generate a 100% royalty-free CC0 procedural dubstep track synthesized in-browser.</span>
            </li>
            <li className="flex items-start gap-2 bg-zinc-800/50 p-2.5 rounded-xl border border-zinc-700/40">
              <span className="text-pink-400 font-bold shrink-0">2. Local Audio Files:</span>
              <span>Drag &amp; drop or click the track header to load MP3, WAV, FLAC, or OGG tracks from your device.</span>
            </li>
          </ul>
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Built-in analyzer automatically detects track BPM and Camelot musical key in milliseconds.</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Waveform & CDJ Cue Behavior',
      subtitle: 'Pioneer-Style Cueing & 8 Hot Cues',
      icon: Play,
      color: 'text-emerald-400',
      badge: 'Step 3 of 6',
      content: (
        <div className="space-y-3 text-sm text-zinc-300">
          <p>
            Professional DJ control layout:
          </p>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-800/70 border border-zinc-700/60 flex items-center justify-between">
              <div>
                <strong className="text-emerald-400 block">CUE Button:</strong>
                <span>When paused: sets temporary cue. When playing: jumps back &amp; pauses. Hold to preview!</span>
              </div>
              <span className="px-2 py-1 rounded bg-zinc-700 font-mono text-[10px] text-zinc-300">Key: C</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-800/70 border border-zinc-700/60 flex items-center justify-between">
              <div>
                <strong className="text-cyan-400 block">8 Hot Cues:</strong>
                <span>Set markers at intros, fakeouts, and drops. Click to jump instantly with zero latency.</span>
              </div>
              <span className="px-2 py-1 rounded bg-zinc-700 font-mono text-[10px] text-zinc-300">Keys: 1-8</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-800/70 border border-zinc-700/60">
              <strong className="text-pink-400 block">Scrolling Waveform:</strong>
              <span>Displays upcoming transient drops, beatgrid markers, and active loop zones in real time.</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Beatmatching: Sync & Manual Tempo',
      subtitle: 'Pitch Slider, Nudge & Beat Grid',
      icon: Sliders,
      color: 'text-amber-400',
      badge: 'Step 4 of 6',
      content: (
        <div className="space-y-3 text-sm text-zinc-300">
          <p>
            Keep your dubstep drops locked in phase:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
              <span className="text-cyan-400 font-bold block mb-1">Instant SYNC</span>
              Matches BPM and aligns downbeats to the currently playing master deck with one click.
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
              <span className="text-amber-400 font-bold block mb-1">Manual Pitch Fader</span>
              Adjust tempo by ±4%, ±8%, ±16%, ±50%, or WIDE. Use <strong>+ / - Nudge</strong> for subtle phase correction.
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
            <strong>Key Lock (Master Tempo):</strong> Turn Key Lock ON to speed up or slow down tracks without changing their pitch!
          </div>
        </div>
      ),
    },
    {
      title: '3-Band EQ & Dubstep Filter',
      subtitle: 'Gain Trim, Frequency Kills & Resonant Sweep',
      icon: Volume2,
      color: 'text-cyan-400',
      badge: 'Step 5 of 6',
      content: (
        <div className="space-y-3 text-sm text-zinc-300">
          <p>
            Mastering the dubstep mix transition:
          </p>
          <ul className="space-y-2 text-xs">
            <li className="p-2 rounded-xl bg-zinc-800/50 border border-zinc-700/40">
              <strong className="text-pink-400">Sub-Bass Kill (Low EQ):</strong> Dubstep rule #1: never play two heavy sub-basses together. Kill Deck B Low EQ before bringing in Deck A's drop.
            </li>
            <li className="p-2 rounded-xl bg-zinc-800/50 border border-zinc-700/40">
              <strong className="text-cyan-400">Bipolar DJ Filter:</strong> Turn counter-clockwise for lowpass growl; turn clockwise for highpass build sizzle.
            </li>
            <li className="p-2 rounded-xl bg-zinc-800/50 border border-zinc-700/40">
              <strong className="text-emerald-400">VU Level Meters:</strong> Watch green/amber bars to keep peak loudness punchy without digital distortion.
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Crossfader, FX & WAV Recording',
      subtitle: 'Wobble LFO Filter & Live Set Capture',
      icon: Sparkles,
      color: 'text-pink-400',
      badge: 'Step 6 of 6',
      content: (
        <div className="space-y-3 text-sm text-zinc-300">
          <p>
            You are ready to perform! Additional pro tools include:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
              <span className="text-yellow-400 font-bold block mb-1">Crossfader Curves</span>
              Toggle between Smooth Blending and Sharp Cut Scratching curves.
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
              <span className="text-pink-400 font-bold block mb-1">Dubstep Wobble FX</span>
              Dual FX slots with BPM-synced Wobble filter, Echo, Reverb, and Bitcrusher.
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300">
            <strong>Master WAV Recording:</strong> Hit <strong>REC</strong> in the top bar to record your live DJ mix into pristine studio-quality uncompressed WAV.
          </div>
        </div>
      ),
    },
  ];

  const current = steps[currentStep];
  const Icon = current.icon;

  const handleFinish = () => {
    localStorage.setItem('wub_works_tutorial_completed', 'true');
    if (onSelectStarterTrack) onSelectStarterTrack();
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('wub_works_tutorial_completed', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow ambient accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center">
              <Icon className={`w-5 h-5 ${current.color}`} />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 block font-semibold">
                {current.badge}
              </span>
              <h2 className="text-lg font-bold text-white leading-tight">
                {current.title}
              </h2>
            </div>
          </div>

          {/* Quick Skip button */}
          <button
            onClick={handleSkip}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-zinc-800/70 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700/60 transition cursor-pointer flex items-center gap-1.5"
            title="Skip onboarding"
          >
            <span>Skip, I'm a DJ</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto pr-1 my-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
            {current.subtitle}
          </h3>
          {current.content}
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center items-center gap-1.5 my-4">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentStep ? 'w-6 bg-cyan-400' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
              }`}
              aria-label={`Jump to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              currentStep === 0
                ? 'opacity-40 border-transparent text-zinc-600 cursor-not-allowed'
                : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800 cursor-pointer'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20 transition cursor-pointer active:scale-95"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 to-pink-500 hover:from-cyan-300 hover:to-pink-400 text-black shadow-lg shadow-cyan-500/25 transition cursor-pointer active:scale-95"
            >
              <CheckCircle className="w-4 h-4 text-black" />
              <span>Drop the Beat!</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
