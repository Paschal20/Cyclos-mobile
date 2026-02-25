import { NativeModules, Platform } from 'react-native';

const { AudioEngine } = NativeModules;

export interface AudioConfig {
  sampleRate?: number;
  bufferSize?: number;
  channels?: number;
}

class NativeAudio {
  private initialized = false;

  async initialize(config?: AudioConfig): Promise<void> {
    if (this.initialized) return;
    
    if (AudioEngine?.initialize) {
      await AudioEngine.initialize(config || {});
    }
    this.initialized = true;
  }

  async playNote(note: number, velocity: number = 1): Promise<void> {
    if (AudioEngine?.playNote) {
      await AudioEngine.playNote(note, velocity);
    }
  }

  async stopNote(note: number): Promise<void> {
    if (AudioEngine?.stopNote) {
      await AudioEngine.stopNote(note);
    }
  }

  async setVolume(volume: number): Promise<void> {
    if (AudioEngine?.setVolume) {
      await AudioEngine.setVolume(volume);
    }
  }

  async getLatency(): Promise<number> {
    if (AudioEngine?.getLatency) {
      return await AudioEngine.getLatency();
    }
    return 0;
  }

  isAvailable(): boolean {
    return !!AudioEngine;
  }
}

export const nativeAudio = new NativeAudio();
