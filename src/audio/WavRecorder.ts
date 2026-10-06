/**
 * Wub Works - Master WAV Audio Recorder
 * High-fidelity master output capture and export to uncompressed WAV format.
 */

export class WavRecorder {
  private ctx: AudioContext;
  private sourceNode: AudioNode;
  private processorNode: ScriptProcessorNode | null = null;
  private recordedBuffersL: Float32Array[] = [];
  private recordedBuffersR: Float32Array[] = [];
  private totalLength: number = 0;
  private isRecording: boolean = false;
  private startTime: number = 0;
  private elapsedSeconds: number = 0;

  constructor(ctx: AudioContext, sourceNode: AudioNode) {
    this.ctx = ctx;
    this.sourceNode = sourceNode;
  }

  public start() {
    this.recordedBuffersL = [];
    this.recordedBuffersR = [];
    this.totalLength = 0;
    this.startTime = Date.now();
    this.elapsedSeconds = 0;

    // Use standard 4096 buffer size processor to capture clean float samples
    const bufferSize = 4096;
    this.processorNode = this.ctx.createScriptProcessor(bufferSize, 2, 2);

    this.processorNode.onaudioprocess = (e) => {
      if (!this.isRecording) return;
      const inputL = e.inputBuffer.getChannelData(0);
      const inputR = e.inputBuffer.getChannelData(1);

      this.recordedBuffersL.push(new Float32Array(inputL));
      this.recordedBuffersR.push(new Float32Array(inputR));
      this.totalLength += inputL.length;
      this.elapsedSeconds = (Date.now() - this.startTime) / 1000;
    };

    this.sourceNode.connect(this.processorNode);
    // Connect to destination with 0 gain to keep script processor clock running
    const silentGain = this.ctx.createGain();
    silentGain.gain.value = 0;
    this.processorNode.connect(silentGain);
    silentGain.connect(this.ctx.destination);

    this.isRecording = true;
  }

  public getElapsedTime(): number {
    return this.isRecording ? (Date.now() - this.startTime) / 1000 : this.elapsedSeconds;
  }

  public stop(): { blob: Blob; duration: number; url: string } | null {
    if (!this.isRecording && this.totalLength === 0) return null;
    this.isRecording = false;

    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode.onaudioprocess = null;
      this.processorNode = null;
    }

    if (this.totalLength === 0) return null;

    // Merge buffers
    const mergedL = new Float32Array(this.totalLength);
    const mergedR = new Float32Array(this.totalLength);
    let offset = 0;
    for (let i = 0; i < this.recordedBuffersL.length; i++) {
      mergedL.set(this.recordedBuffersL[i], offset);
      mergedR.set(this.recordedBuffersR[i], offset);
      offset += this.recordedBuffersL[i].length;
    }

    const wavBlob = this.encodeWAV(mergedL, mergedR, this.ctx.sampleRate);
    const url = URL.createObjectURL(wavBlob);
    const duration = this.totalLength / this.ctx.sampleRate;

    return { blob: wavBlob, duration, url };
  }

  private encodeWAV(left: Float32Array, right: Float32Array, sampleRate: number): Blob {
    const numChannels = 2;
    const bytesPerSample = 2; // 16-bit
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = left.length * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    this.writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true); // bits per sample

    // data sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write interleaved 16-bit PCM samples with soft clipping
    let offset = 44;
    for (let i = 0; i < left.length; i++) {
      let sL = Math.max(-1, Math.min(1, left[i]));
      let sR = Math.max(-1, Math.min(1, right[i]));
      view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7fff, true);
      offset += 2;
      view.setInt16(offset, sR < 0 ? sR * 0x8000 : sR * 0x7fff, true);
      offset += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}
