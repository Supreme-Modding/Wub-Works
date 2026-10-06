import React, { useState } from 'react';
import { HotCue } from '../../types';
import { Edit2, Trash2 } from 'lucide-react';

interface HotCueGridProps {
  hotCues: HotCue[];
  currentTime: number;
  onTriggerCue: (id: number) => void;
  onSetCue: (id: number, pos: number, label?: string, color?: string) => void;
  onDeleteCue: (id: number) => void;
  isProMode: boolean;
}

const PRESET_COLORS = [
  '#f43f5e', // Red / Drop
  '#f59e0b', // Amber / Build
  '#10b981', // Emerald / Intro
  '#06b6d4', // Cyan / Vocal
  '#8b5cf6', // Violet / Breakdown
  '#ec4899', // Pink / Wub
  '#3b82f6', // Blue / Outro
  '#eab308', // Gold / Solo
];

export const HotCueGrid: React.FC<HotCueGridProps> = ({
  hotCues,
  currentTime,
  onTriggerCue,
  onSetCue,
  onDeleteCue,
  isProMode,
}) => {
  const [editingCueId, setEditingCueId] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState<string>('');
  const [editColor, setEditColor] = useState<string>('#06b6d4');

  const count = isProMode ? 8 : 4;
  const cueSlots = Array.from({ length: count }, (_, i) => i + 1);

  const handleCueClick = (id: number, e: React.MouseEvent) => {
    if (e.shiftKey) {
      onDeleteCue(id);
      return;
    }
    const existing = hotCues.find((c) => c.id === id);
    if (existing) {
      onTriggerCue(id);
    } else {
      // Set new cue
      const defaultLabels = ['INTRO', 'BUILD', 'DROP', 'WUB', 'FAKEOUT', 'DROP 2', 'BREAK', 'OUTRO'];
      onSetCue(id, currentTime, defaultLabels[id - 1] || `CUE ${id}`, PRESET_COLORS[(id - 1) % PRESET_COLORS.length]);
    }
  };

  const handleOpenEdit = (cue: HotCue, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCueId(cue.id);
    setEditLabel(cue.label);
    setEditColor(cue.color);
  };

  const handleSaveEdit = () => {
    if (editingCueId !== null) {
      const existing = hotCues.find((c) => c.id === editingCueId);
      if (existing) {
        onSetCue(editingCueId, existing.position, editLabel, editColor);
      }
      setEditingCueId(null);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-2 rounded-xl bg-[#0b0b16] border-2 border-zinc-700 shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-white font-black">
          HOT CUES {isProMode ? '(1-8)' : '(1-4)'}
        </span>
        <span className="text-[9px] text-zinc-400 font-mono font-semibold">
          Shift+Click to Clear
        </span>
      </div>

      <div className={`grid ${isProMode ? 'grid-cols-4' : 'grid-cols-4'} gap-2`}>
        {cueSlots.map((id) => {
          const cue = hotCues.find((c) => c.id === id);
          const isSet = !!cue;

          return (
            <button
              key={id}
              onClick={(e) => handleCueClick(id, e)}
              style={
                isSet
                  ? {
                      backgroundColor: `${cue.color}35`,
                      borderColor: cue.color,
                      boxShadow: `0 0 16px ${cue.color}50, inset 0 1px 0 rgba(255, 255, 255, 0.6)`,
                    }
                  : undefined
              }
              className={`relative h-12 rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer select-none active:scale-95 group ${
                isSet
                  ? 'text-white font-black'
                  : 'bg-zinc-850 border-zinc-700 hover:border-zinc-400 text-zinc-300 hover:text-white shadow-sm'
              }`}
            >
              {/* Cue ID number pill */}
              <div
                style={isSet ? { backgroundColor: cue.color } : undefined}
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-black ${
                  isSet ? 'text-black shadow-md border border-white/60' : 'bg-zinc-750 text-zinc-200 border border-zinc-650'
                }`}
              >
                {id}
              </div>

              {/* Label text */}
              <span className={`text-[9px] font-mono tracking-tight uppercase truncate max-w-[58px] mt-0.5 ${
                isSet ? 'text-white font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]' : 'text-zinc-400 font-semibold'
              }`}>
                {isSet ? cue.label : 'EMPTY'}
              </span>

              {/* Edit button in Pro mode */}
              {isSet && isProMode && (
                <div
                  onClick={(e) => handleOpenEdit(cue, e)}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 rounded bg-black/80 hover:bg-black text-white transition shadow border border-zinc-600"
                  title="Edit label & color"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Edit Hot Cue Modal */}
      {editingCueId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs rounded-2xl bg-zinc-950 border-2 border-zinc-700 p-4 shadow-2xl">
            <h4 className="text-xs font-mono uppercase font-black text-white mb-3 flex items-center justify-between">
              <span>Edit Hot Cue #{editingCueId}</span>
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-300 block mb-1">CUE LABEL</label>
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  maxLength={12}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border-2 border-zinc-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-300 block mb-1">COLOR</label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditColor(c)}
                      style={{ backgroundColor: c }}
                      className={`h-7 rounded-lg border-2 transition ${
                        editColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onDeleteCue(editingCueId);
                    setEditingCueId(null);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-bold hover:bg-rose-500/30 border border-rose-500/40 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCueId(null)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black shadow-md shadow-cyan-400/25"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
