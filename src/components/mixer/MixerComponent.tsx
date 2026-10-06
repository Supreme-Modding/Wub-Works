import React from 'react';
import { ChannelMixerState, CrossfaderCurve, DeckId, FXSlotState, MixerMasterState, ThemeConfig } from '../../types';
import { ChannelStrip } from './ChannelStrip';
import { Crossfader } from './Crossfader';
import { MasterStrip } from './MasterStrip';

interface MixerComponentProps {
  channels: Record<DeckId, ChannelMixerState>;
  master: MixerMasterState;
  activeDeckIds: DeckId[];
  deckBpms: Record<DeckId, number>;
  theme: ThemeConfig;
  onUpdateChannel: (id: DeckId, updates: Partial<ChannelMixerState>) => void;
  onUpdateFX1: (id: DeckId, fx: Partial<FXSlotState>) => void;
  onUpdateFX2: (id: DeckId, fx: Partial<FXSlotState>) => void;
  onCrossfaderChange: (pos: number) => void;
  onCrossfaderCurveChange: (curve: CrossfaderCurve) => void;
  onToggleHamster: () => void;
  onMasterVolumeChange: (vol: number) => void;
  onHeadphoneVolumeChange: (vol: number) => void;
  onHeadphoneCueMixChange: (mix: number) => void;
  onToggleRecord: () => void;
  onOpenHardwareNotice: () => void;
  onOpenRecordings: () => void;
  isProMode: boolean;
}

export const MixerComponent: React.FC<MixerComponentProps> = ({
  channels,
  master,
  activeDeckIds,
  deckBpms,
  theme,
  onUpdateChannel,
  onUpdateFX1,
  onUpdateFX2,
  onCrossfaderChange,
  onCrossfaderCurveChange,
  onToggleHamster,
  onMasterVolumeChange,
  onHeadphoneVolumeChange,
  onHeadphoneCueMixChange,
  onToggleRecord,
  onOpenHardwareNotice,
  onOpenRecordings,
  isProMode,
}) => {
  const getDeckColor = (id: DeckId) => {
    switch (id) {
      case 'A': return theme.deckA;
      case 'B': return theme.deckB;
      case 'C': return theme.deckC;
      case 'D': return theme.deckD;
    }
  };

  return (
    <div
      style={{ backgroundColor: theme.mixerCardBg }}
      className="rounded-2xl border border-zinc-800/90 p-3 shadow-2xl flex flex-col gap-3 min-w-[320px] max-w-full"
    >
      {/* Top Channel Strips + Master Strip */}
      <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
        {activeDeckIds.map((id) => (
          <ChannelStrip
            key={id}
            id={id}
            channel={channels[id]}
            bpm={deckBpms[id]}
            colorAccent={getDeckColor(id)}
            onUpdateChannel={onUpdateChannel}
            onUpdateFX1={onUpdateFX1}
            onUpdateFX2={onUpdateFX2}
            isProMode={isProMode}
          />
        ))}

        {/* Master Output & Recorder Section */}
        <MasterStrip
          masterVolume={master.masterVolume}
          masterVuLeft={master.masterVuLeft}
          masterVuRight={master.masterVuRight}
          isClipping={master.isClipping}
          headphoneVolume={master.headphoneVolume}
          headphoneCueMix={master.headphoneCueMix}
          isRecording={master.isRecording}
          recordingSeconds={master.recordingSeconds}
          onMasterVolumeChange={onMasterVolumeChange}
          onHeadphoneVolumeChange={onHeadphoneVolumeChange}
          onHeadphoneCueMixChange={onHeadphoneCueMixChange}
          onToggleRecord={onToggleRecord}
          onOpenHardwareNotice={onOpenHardwareNotice}
          onOpenRecordings={onOpenRecordings}
        />
      </div>

      {/* Bottom Crossfader Bar */}
      <Crossfader
        crossfader={master.crossfader}
        curve={master.crossfaderCurve}
        isHamster={master.crossfaderHamster}
        onPositionChange={onCrossfaderChange}
        onCurveChange={onCrossfaderCurveChange}
        onToggleHamster={onToggleHamster}
        isProMode={isProMode}
      />
    </div>
  );
};
