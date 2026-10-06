import React, { useState } from 'react';
import { THEME_PRESETS } from '../../constants/themes';
import { ThemeConfig } from '../../types';
import { Palette, X, Check, ShieldCheck } from 'lucide-react';

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeConfig;
  onSelectTheme: (theme: ThemeConfig) => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 p-5 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-mono">
              THEME &amp; COLOR CUSTOMIZER
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Accessibility Notice */}
        <div className="my-3 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-xs text-zinc-300 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>All presets meet WCAG AA high-contrast dubstep stage readability guidelines.</span>
        </div>

        {/* Presets List */}
        <div className="space-y-2 my-2">
          {THEME_PRESETS.map((preset) => {
            const isSelected = currentTheme.id === preset.id;

            return (
              <div
                key={preset.id}
                onClick={() => onSelectTheme(preset)}
                className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer select-none ${
                  isSelected
                    ? 'bg-zinc-900 border-cyan-400 shadow-md'
                    : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Swatches preview */}
                  <div className="flex items-center -space-x-1">
                    <span
                      style={{ backgroundColor: preset.primary }}
                      className="w-5 h-5 rounded-full border border-black shadow"
                    />
                    <span
                      style={{ backgroundColor: preset.deckB }}
                      className="w-5 h-5 rounded-full border border-black shadow"
                    />
                    <span
                      style={{ backgroundColor: preset.mixerCardBg }}
                      className="w-5 h-5 rounded-full border border-zinc-700 shadow"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-mono">{preset.name}</h4>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Mixer: {preset.mixerCardBg}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="p-1 rounded-full bg-cyan-500 text-black">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-zinc-800 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition"
          >
            Apply Theme
          </button>
        </div>
      </div>
    </div>
  );
};
