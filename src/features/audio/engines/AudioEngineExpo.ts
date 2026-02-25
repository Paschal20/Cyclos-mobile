/**
 * Audio Engine using expo-av
 * Provides real audio playback using native Audio API
 * Works on iOS and Android with actual sound generation
 * 
 * NOTE: Requires a sine wave file at assets/sounds/sine_440.wav
 * Generate one online or use Audacity to create a 440Hz, 1-second mono WAV
 */
import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';

interface SoundInstance {
  sound: Audio.Sound;
  frequency: number;
  rate: number;
}

export class AudioEngineExpo {
  private sounds: Map<number, SoundInstance> = new Map();
  private isInitialized = false;
  private initPromise: Promise<boolean> | null = null;
  private masterVolume: number = 0.8;
  private baseSound: Audio.Sound | null = null;
  private baseFrequency = 440;

  async initialize(retries = 3): Promise<boolean> {
    if (this.isInitialized) return true;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._initialize(retries);
    return this.initPromise;
  }

  private async _initialize(retries: number): Promise<boolean> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const asset = Asset.fromModule(require('../../../assets/sounds/sine_440.wav'));
      await asset.downloadAsync();

      const { sound } = await Audio.Sound.createAsync(
        asset,
        { isLooping: true, volume: this.masterVolume }
      );
      this.baseSound = sound;
      this.isInitialized = true;
      console.log('[AudioEngineExpo] Initialized successfully');
      return true;
    } catch (error) {
      console.warn('[AudioEngineExpo] Init failed:', error);
      if (retries > 0) {
        await new Promise(res => setTimeout(res, 1000));
        return this._initialize(retries - 1);
      }
      return false;
    }
  }

  async playNote(frequency: number, velocity: number = 0.8): Promise<void> {
    if (!this.isInitialized) {
      const ok = await this.initialize();
      if (!ok) return;
    }

    if (!this.baseSound) {
      console.warn('[AudioEngineExpo] No base sound loaded');
      return;
    }

    const rate = frequency / this.baseFrequency;
    let instance = this.sounds.get(frequency);

    if (instance) {
      try {
        await instance.sound.setVolumeAsync(velocity * this.masterVolume);
        await instance.sound.setRateAsync(rate, false);
        await instance.sound.playAsync();
      } catch (error) {
        console.warn('[AudioEngineExpo] Error playing existing sound:', error);
        await this.recreateSound(frequency, rate, velocity);
      }
    } else {
      await this.createSound(frequency, rate, velocity);
    }
  }

  private async createSound(frequency: number, rate: number, velocity: number): Promise<void> {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../../assets/sounds/sine_440.wav'),
        { isLooping: true, volume: velocity * this.masterVolume }
      );
      await sound.setRateAsync(rate, false);
      await sound.playAsync();

      this.sounds.set(frequency, { sound, frequency, rate });
    } catch (error) {
      console.warn('[AudioEngineExpo] Error creating sound:', error);
    }
  }

  private async recreateSound(frequency: number, rate: number, velocity: number): Promise<void> {
    const existing = this.sounds.get(frequency);
    if (existing) {
      try {
        await existing.sound.unloadAsync();
      } catch (e) {
        // Ignore
      }
      this.sounds.delete(frequency);
    }
    await this.createSound(frequency, rate, velocity);
  }

  async stopNote(frequency: number): Promise<void> {
    const instance = this.sounds.get(frequency);
    if (instance) {
      try {
        await instance.sound.stopAsync();
      } catch (error) {
        // Ignore
      }
    }
  }

  async stopAllNotes(): Promise<void> {
    for (const [_, instance] of this.sounds) {
      try {
        await instance.sound.stopAsync();
      } catch (error) {
        // Ignore
      }
    }
  }

  async setVolume(volume: number): Promise<void> {
    this.masterVolume = Math.max(0, Math.min(1, volume));

    for (const [_, instance] of this.sounds) {
      try {
        await instance.sound.setVolumeAsync(this.masterVolume);
      } catch (error) {
        // Ignore
      }
    }
  }

  getLatency(): number {
    return 30;
  }

  isReady(): boolean {
    return this.isInitialized && this.baseSound !== null;
  }

  async cleanup(): Promise<void> {
    await this.stopAllNotes();
    for (const [_, instance] of this.sounds) {
      try {
        await instance.sound.unloadAsync();
      } catch (error) {
        // Ignore
      }
    }
    this.sounds.clear();
    if (this.baseSound) {
      await this.baseSound.unloadAsync();
      this.baseSound = null;
    }
    this.isInitialized = false;
    this.initPromise = null;
  }
}

export const audioEngineExpo = new AudioEngineExpo();
export default audioEngineExpo;
