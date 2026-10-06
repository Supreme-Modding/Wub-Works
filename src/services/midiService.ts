/**
 * Wub Works - Web MIDI API Service & MIDI Learn Engine
 * Connects external MIDI DJ controllers, keypads, and faders.
 * Features automated MIDI Learn binding and persistent mapping storage.
 */

import { MidiMapping } from '../types';

type MidiHandler = (controlId: string, value: number) => void;

class MidiServiceSingleton {
  private midiAccess: MIDIAccess | null = null;
  private isSupported: boolean = false;
  private connectedDevices: string[] = [];
  private mappings: Map<string, MidiMapping> = new Map(); // key = `${channel}_${type}_${id}` -> mapping
  private learningControlId: string | null = null;
  private listeners: Set<MidiHandler> = new Set();
  private statusListeners: Set<() => void> = new Set();

  constructor() {
    this.isSupported = typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;
    this.loadMappingsFromStorage();
  }

  public checkSupport(): boolean {
    return this.isSupported;
  }

  public getConnectedDevices(): string[] {
    return this.connectedDevices;
  }

  public isLearning(): boolean {
    return this.learningControlId !== null;
  }

  public getLearningControlId(): string | null {
    return this.learningControlId;
  }

  public async initMidi(): Promise<{ success: boolean; message: string }> {
    if (!this.isSupported) {
      return {
        success: false,
        message: 'Web MIDI API is not supported in this browser (supported in Chromium, Chrome, Edge, and Opera). Connect on desktop or Android Chrome for hardware DJ controllers.',
      };
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess({ sysex: false });
      this.updateDeviceList();

      this.midiAccess.onstatechange = () => {
        this.updateDeviceList();
        this.notifyStatusChange();
      };

      // Attach message listeners to all inputs
      this.midiAccess.inputs.forEach((input) => {
        input.onmidimessage = (e) => this.handleMidiMessage(e);
      });

      return {
        success: true,
        message: `Web MIDI active. Found ${this.connectedDevices.length} device(s): ${this.connectedDevices.join(', ') || 'No controller connected yet'}.`,
      };
    } catch (err) {
      return {
        success: false,
        message: `MIDI access denied or unavailable: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  private updateDeviceList() {
    if (!this.midiAccess) return;
    const names: string[] = [];
    this.midiAccess.inputs.forEach((input) => {
      if (input.name) names.push(input.name);
      // Ensure listener is attached
      input.onmidimessage = (e) => this.handleMidiMessage(e);
    });
    this.connectedDevices = names;
  }

  public startLearn(controlId: string) {
    this.learningControlId = controlId;
    this.notifyStatusChange();
  }

  public cancelLearn() {
    this.learningControlId = null;
    this.notifyStatusChange();
  }

  public onControlChange(handler: MidiHandler): () => void {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }

  public onStatusChange(handler: () => void): () => void {
    this.statusListeners.add(handler);
    return () => this.statusListeners.delete(handler);
  }

  private notifyStatusChange() {
    this.statusListeners.forEach((fn) => fn());
  }

  private handleMidiMessage(event: MIDIMessageEvent) {
    const data = event.data;
    if (!data || data.length < 2) return;

    const status = data[0];
    const channel = (status & 0x0f) + 1;
    const command = status >> 4;
    const byte1 = data[1]; // Note number or CC number
    const byte2 = data.length > 2 ? data[2] : 0; // Velocity or CC value (0-127)

    let type: 'cc' | 'note' | null = null;
    let normalizedValue = 0;

    if (command === 0x0b) {
      // Control Change (CC) - Knobs, Faders, Jogwheels
      type = 'cc';
      normalizedValue = byte2 / 127;
    } else if (command === 0x09) {
      // Note On - Pads, Buttons, Cue, Play
      type = 'note';
      normalizedValue = byte2 > 0 ? byte2 / 127 : 0;
    } else if (command === 0x08) {
      // Note Off
      type = 'note';
      normalizedValue = 0;
    }

    if (!type) return;

    // Handle MIDI Learn
    if (this.learningControlId) {
      const mappingKey = `${channel}_${type}_${byte1}`;
      const mapping: MidiMapping = {
        controlId: this.learningControlId,
        channel,
        identifier: byte1,
        type,
        description: `Ch ${channel} ${type.toUpperCase()} #${byte1}`,
      };

      this.mappings.set(mappingKey, mapping);
      this.saveMappingsToStorage();
      this.learningControlId = null;
      this.notifyStatusChange();
      return;
    }

    // Normal Dispatch
    const key = `${channel}_${type}_${byte1}`;
    const mapped = this.mappings.get(key);
    if (mapped) {
      this.listeners.forEach((handler) => handler(mapped.controlId, normalizedValue));
    }
  }

  public getMappingsList(): MidiMapping[] {
    return Array.from(this.mappings.values());
  }

  public removeMapping(controlId: string) {
    for (const [key, val] of this.mappings.entries()) {
      if (val.controlId === controlId) {
        this.mappings.delete(key);
      }
    }
    this.saveMappingsToStorage();
    this.notifyStatusChange();
  }

  public clearAllMappings() {
    this.mappings.clear();
    this.saveMappingsToStorage();
    this.notifyStatusChange();
  }

  private saveMappingsToStorage() {
    try {
      const arr = Array.from(this.mappings.entries());
      localStorage.setItem('wub_works_midi_mappings', JSON.stringify(arr));
    } catch (_) {}
  }

  private loadMappingsFromStorage() {
    try {
      const raw = localStorage.getItem('wub_works_midi_mappings');
      if (raw) {
        const arr = JSON.parse(raw);
        this.mappings = new Map(arr);
      }
    } catch (_) {}
  }
}

export const MidiService = new MidiServiceSingleton();
