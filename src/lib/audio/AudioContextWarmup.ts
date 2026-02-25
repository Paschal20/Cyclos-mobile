import { nativeAudio } from './NativeAudio';

class AudioContextWarmup {
  private warmedUp = false;

  async warmup(): Promise<void> {
    if (this.warmedUp) return;
    
    try {
      await nativeAudio.initialize({ sampleRate: 44100 });
      await nativeAudio.playNote(0, 0);
      await nativeAudio.stopNote(0);
      this.warmedUp = true;
    } catch (e) {
      console.warn('Audio warmup failed:', e);
      this.warmedUp = true;
    }
  }

  isWarmedUp(): boolean {
    return this.warmedUp;
  }

  reset(): void {
    this.warmedUp = false;
  }
}

export const audioContextWarmup = new AudioContextWarmup();
