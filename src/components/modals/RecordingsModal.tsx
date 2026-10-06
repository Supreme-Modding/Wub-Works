import React, { useEffect, useState } from 'react';
import { SavedRecording, StorageService } from '../../services/storageService';
import { Radio, Download, Trash2, X, Play, Pause } from 'lucide-react';

interface RecordingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecordingsModal: React.FC<RecordingsModalProps> = ({ isOpen, onClose }) => {
  const [recordings, setRecordings] = useState<SavedRecording[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (audioElement) {
        audioElement.pause();
      }
      return;
    }

    StorageService.getAllRecordings().then((recs) => {
      setRecordings(recs.reverse());
    });
  }, [isOpen, audioElement]);

  if (!isOpen) return null;

  const handleDownload = (rec: SavedRecording) => {
    const url = URL.createObjectURL(rec.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${rec.name}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = async (id: string) => {
    if (playingId === id && audioElement) {
      audioElement.pause();
      setPlayingId(null);
    }
    await StorageService.deleteRecording(id);
    setRecordings((prev) => prev.filter((r) => r.id !== id));
  };

  const handleTogglePlay = (rec: SavedRecording) => {
    if (playingId === rec.id) {
      if (audioElement) {
        audioElement.pause();
        setPlayingId(null);
      }
    } else {
      if (audioElement) audioElement.pause();
      const url = URL.createObjectURL(rec.blob);
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => setPlayingId(null);
      setAudioElement(audio);
      setPlayingId(rec.id);
    }
  };

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 p-5 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-bold text-white font-mono">
              SAVED MASTER WAV RECORDINGS
            </h3>
          </div>
          <button
            onClick={() => {
              if (audioElement) audioElement.pause();
              onClose();
            }}
            className="p-1 rounded-lg text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto my-3 space-y-2 pr-1">
          {recordings.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 font-mono text-xs">
              No live recordings saved yet. Tap "REC WAV" on the mixer to capture your DJ set!
            </div>
          ) : (
            recordings.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleTogglePlay(rec)}
                    className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-cyan-400 transition cursor-pointer"
                  >
                    {playingId === rec.id ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                  <div>
                    <h4 className="font-bold text-white text-xs">{rec.name}</h4>
                    <span className="text-[10px] text-zinc-400">
                      Duration: {formatSec(rec.duration)} • {formatBytes(rec.size)} • {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDownload(rec)}
                    className="p-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 transition cursor-pointer"
                    title="Download WAV"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(rec.id)}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-zinc-800">
          <button
            onClick={() => {
              if (audioElement) audioElement.pause();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
