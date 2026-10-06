import React from 'react';
import { Command, X } from 'lucide-react';

interface ShortcutCheatSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutCheatSheet: React.FC<ShortcutCheatSheetProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sections = [
    {
      title: 'Deck A Controls',
      color: 'text-cyan-400',
      shortcuts: [
        { key: 'Space', desc: 'Play / Pause Deck A' },
        { key: 'C', desc: 'CDJ Cue (Hold to preview)' },
        { key: '1, 2, 3, 4', desc: 'Trigger Hot Cues 1-4' },
        { key: 'S', desc: 'Instant Beat Sync' },
        { key: 'Q / W', desc: 'Pitch Nudge (- / +)' },
        { key: 'L', desc: 'Auto Loop Toggle' },
        { key: 'K', desc: 'Kill Low Sub-Bass' },
      ],
    },
    {
      title: 'Deck B Controls',
      color: 'text-pink-400',
      shortcuts: [
        { key: 'Shift + Space', desc: 'Play / Pause Deck B' },
        { key: 'Shift + C', desc: 'CDJ Cue (Hold to preview)' },
        { key: '5, 6, 7, 8', desc: 'Trigger Hot Cues 1-4' },
        { key: 'Shift + S', desc: 'Instant Beat Sync' },
        { key: 'O / P', desc: 'Pitch Nudge (- / +)' },
        { key: 'Shift + L', desc: 'Auto Loop Toggle' },
        { key: 'Shift + K', desc: 'Kill Low Sub-Bass' },
      ],
    },
    {
      title: 'Mixer & Performance',
      color: 'text-amber-400',
      shortcuts: [
        { key: 'Escape', desc: 'Panic: Stop All Audio Immediately' },
        { key: 'KEYS', desc: 'Toggle Live Performance Wub Keyboard' },
        { key: 'Left / Right', desc: 'Crossfader Nudge' },
        { key: 'Z / X / C', desc: 'Cut Full A / Center / Full B' },
        { key: 'R', desc: 'Toggle Master WAV Recording' },
        { key: 'F', desc: 'Open Dubstep SFX & Sample Vault' },
        { key: 'W', desc: 'Open Wub Synth Sound Design Lab' },
        { key: 'Tab', desc: 'Toggle Beginner / Pro Mode' },
        { key: '?', desc: 'Toggle Keyboard Cheat Sheet' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl bg-zinc-950 border border-zinc-800 p-5 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Command className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-mono">
              KEYBOARD SHORTCUT CHEAT SHEET
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div className="grid md:grid-cols-3 gap-3 my-4 overflow-y-auto">
          {sections.map((sec, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col gap-2"
            >
              <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${sec.color}`}>
                {sec.title}
              </h4>
              <div className="space-y-1.5">
                {sec.shortcuts.map((sc, sIdx) => (
                  <div key={sIdx} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 text-[11px]">{sc.desc}</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[10px] text-zinc-200 shrink-0 ml-1">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
