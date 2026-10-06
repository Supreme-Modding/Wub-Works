import React, { useEffect, useState } from 'react';
import { MidiService } from '../../services/midiService';
import { MidiMapping } from '../../types';
import { Cpu, X, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface MidiLearnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_TARGETS = [
  { id: 'deck_A_play', name: 'Deck A: Play / Pause' },
  { id: 'deck_A_cue', name: 'Deck A: CUE' },
  { id: 'deck_A_sync', name: 'Deck A: SYNC' },
  { id: 'deck_A_volume', name: 'Deck A: Volume Fader' },
  { id: 'deck_A_filter', name: 'Deck A: DJ Filter' },
  { id: 'deck_A_eqLow', name: 'Deck A: Low EQ' },
  { id: 'deck_A_killLow', name: 'Deck A: Kill Low' },

  { id: 'deck_B_play', name: 'Deck B: Play / Pause' },
  { id: 'deck_B_cue', name: 'Deck B: CUE' },
  { id: 'deck_B_sync', name: 'Deck B: SYNC' },
  { id: 'deck_B_volume', name: 'Deck B: Volume Fader' },
  { id: 'deck_B_filter', name: 'Deck B: DJ Filter' },
  { id: 'deck_B_eqLow', name: 'Deck B: Low EQ' },
  { id: 'deck_B_killLow', name: 'Deck B: Kill Low' },

  { id: 'mixer_crossfader', name: 'Mixer: Crossfader' },
  { id: 'mixer_masterVolume', name: 'Mixer: Master Volume' },
  { id: 'mixer_headphoneVolume', name: 'Mixer: Headphones Vol' },
];

export const MidiLearnModal: React.FC<MidiLearnModalProps> = ({ isOpen, onClose }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [devices, setDevices] = useState<string[]>([]);
  const [mappings, setMappings] = useState<MidiMapping[]>([]);
  const [learningControlId, setLearningControlId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setIsSupported(MidiService.checkSupport());
    setDevices(MidiService.getConnectedDevices());
    setMappings(MidiService.getMappingsList());
    setLearningControlId(MidiService.getLearningControlId());

    const unsub = MidiService.onStatusChange(() => {
      setDevices(MidiService.getConnectedDevices());
      setMappings(MidiService.getMappingsList());
      setLearningControlId(MidiService.getLearningControlId());
    });

    MidiService.initMidi().then((res) => {
      setStatusMessage(res.message);
    });

    return unsub;
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartLearn = (controlId: string) => {
    MidiService.startLearn(controlId);
  };

  const handleCancelLearn = () => {
    MidiService.cancelLearn();
  };

  const handleRemoveMapping = (controlId: string) => {
    MidiService.removeMapping(controlId);
  };

  const handleClearAll = () => {
    MidiService.clearAllMappings();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-zinc-950 border border-zinc-800 p-5 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-mono">
              MIDI CONTROLLER &amp; LEARN
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status banner */}
        <div className="my-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono space-y-1">
          <div className="flex items-center gap-2">
            {isSupported ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            )}
            <span className="font-bold text-white">
              {isSupported ? 'Web MIDI Engine Active' : 'Web MIDI Not Supported'}
            </span>
          </div>
          <p className="text-zinc-400 text-[11px]">{statusMessage}</p>
        </div>

        {/* Learning banner when active */}
        {learningControlId && (
          <div className="mb-3 p-3 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-mono flex items-center justify-between animate-pulse">
            <div>
              <span className="font-bold block">MIDI LEARN ACTIVE</span>
              <span>Move physical knob, fader, or pad for: <strong className="text-white">{learningControlId}</strong></span>
            </div>
            <button
              onClick={handleCancelLearn}
              className="px-2.5 py-1 rounded bg-zinc-800 text-white font-bold"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Mappings Table */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
            CONTROL TARGETS &amp; ASSIGNMENTS
          </div>
          {COMMON_TARGETS.map((target) => {
            const mapped = mappings.find((m) => m.controlId === target.id);
            const isLearningThis = learningControlId === target.id;

            return (
              <div
                key={target.id}
                className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs font-mono"
              >
                <div>
                  <span className="text-zinc-200 font-semibold block">{target.name}</span>
                  <span className="text-[10px] text-zinc-500">{target.id}</span>
                </div>

                <div className="flex items-center gap-2">
                  {mapped ? (
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                        {mapped.description || `Ch ${mapped.channel} #${mapped.identifier}`}
                      </span>
                      <button
                        onClick={() => handleRemoveMapping(target.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1"
                        title="Remove mapping"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartLearn(target.id)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        isLearningThis
                          ? 'bg-cyan-500 text-black animate-pulse'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {isLearningThis ? 'LISTENING...' : 'LEARN'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800 mt-2">
          <button
            onClick={handleClearAll}
            className="text-xs text-rose-400 hover:text-rose-300 transition"
          >
            Clear All Mappings
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
