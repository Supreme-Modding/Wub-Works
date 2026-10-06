import React, { useEffect, useState } from 'react';
import { AudioEngine } from '../../audio/AudioEngine';
import { Headphones, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface AudioHardwareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioHardwareModal: React.FC<AudioHardwareModalProps> = ({ isOpen, onClose }) => {
  const [hardwareInfo, setHardwareInfo] = useState<{
    hasMultipleOutputs: boolean;
    channelCount: number;
    notice: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    AudioEngine.checkAudioHardware().then((info) => setHardwareInfo(info));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 p-5 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white font-mono">
              AUDIO OUTPUT &amp; HEADPHONE CUE
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="my-3 space-y-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2">
              {hardwareInfo?.hasMultipleOutputs ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span className="font-bold text-white">
                {hardwareInfo?.hasMultipleOutputs
                  ? `Multi-Channel Audio Interface Active (${hardwareInfo.channelCount} Channels)`
                  : 'Standard Stereo Audio Output (2 Channels)'}
              </span>
            </div>
            <p className="text-zinc-300 text-[11px] leading-relaxed">
              {hardwareInfo?.notice}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] space-y-1.5">
            <span className="font-bold block text-white">How DJ Cueing Works in Wub Works:</span>
            <p>
              • <strong>PFL CUE buttons:</strong> tap on any channel strip to send that deck's pre-fader audio to the headphone bus.
            </p>
            <p>
              • <strong>CUE / MST Blend knob:</strong> smooth sweep between the isolated headphone cue (0%) and master crowd mix (100%).
            </p>
            <p>
              • <strong>External Soundcards:</strong> When connected to a 4-channel DJ controller (e.g. Pioneer, Traktor, Focusrite), channels 3-4 automatically carry the discrete headphone cue!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
