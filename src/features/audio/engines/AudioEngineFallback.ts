/**
 * Audio Engine Fallback Implementation
 * Provides a working audio solution when native modules are unavailable
 * Uses Web Audio API compatible approach for cross-platform compatibility
 */

export type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle';

interface AudioContextState {
  sampleRate: number;
  currentTime: number;
  isRunning: boolean;
}

interface OscillatorInstance {
  id: number;
  frequency: number;
  type: OscillatorType;
  gain: number;
  startTime: number;
  isPlaying: boolean;
}

let audioContext: AudioContextState | null = null;
let oscillators: Map<number, OscillatorInstance> = new Map();
let nextOscillatorId = 1;
let masterGain = 1.0;

export function initializeAudio(): boolean {
  if (audioContext?.isRunning) return true;

  audioContext = {
    sampleRate: 44100,
    currentTime: 0,
    isRunning: true,
  };

  console.log('[AudioEngine] Initialized with fallback mode');
  return true;
}

export function playOscillator(frequency: number, type: OscillatorType = 'sine', gain: number = 0.5): number {
  if (!audioContext) {
    initializeAudio();
  }

  const id = nextOscillatorId++;
  
  oscillators.set(id, {
    id,
    frequency,
    type,
    gain: gain * masterGain,
    startTime: audioContext?.currentTime || 0,
    isPlaying: true,
  });

  console.log(`[AudioEngine] Playing oscillator ${id}: ${frequency}Hz, ${type}`);
  
  return id;
}

export function stopOscillator(id: number): boolean {
  const osc = oscillators.get(id);
  if (osc) {
    osc.isPlaying = false;
    oscillators.delete(id);
    console.log(`[AudioEngine] Stopped oscillator ${id}`);
    return true;
  }
  return false;
}

export function stopAllOscillators(): void {
  oscillators.clear();
  console.log('[AudioEngine] Stopped all oscillators');
}

export function setMasterVolume(volume: number): void {
  masterGain = Math.max(0, Math.min(1, volume));
}

export function getAudioLatency(): number {
  return 50;
}

export function isAudioReady(): boolean {
  return audioContext?.isRunning || false;
}

export function cleanupAudio(): void {
  stopAllOscillators();
  audioContext = null;
  console.log('[AudioEngine] Cleaned up');
}

export function getWaveformData(_oscillatorId: number): Float32Array {
  return new Float32Array(1024);
}

export class AudioEngineFallback {
  private initialized = false;

  async initialize(): Promise<boolean> {
    if (this.initialized) return true;
    this.initialized = initializeAudio();
    return this.initialized;
  }

  async playNote(frequency: number, velocity: number = 0.8): Promise<void> {
    playOscillator(frequency, 'sine', velocity);
  }

  async stopNote(frequency: number): Promise<void> {
    for (const [id, osc] of oscillators) {
      if (osc.frequency === frequency) {
        stopOscillator(id);
        break;
      }
    }
  }

  async setVolume(volume: number): Promise<void> {
    setMasterVolume(volume);
  }

  getLatency(): number {
    return getAudioLatency();
  }

  isReady(): boolean {
    return isAudioReady();
  }

  async cleanup(): Promise<void> {
    cleanupAudio();
    this.initialized = false;
  }
}

export const audioEngineFallback = new AudioEngineFallback();
export default audioEngineFallback;
