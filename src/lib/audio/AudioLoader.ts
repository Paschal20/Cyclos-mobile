import { Asset } from 'expo-asset';

export interface SoundFile {
  name: string;
  uri: string;
}

class AudioLoader {
  private loadedSounds: Map<string, any> = new Map();

  async loadSound(name: string, uri: string): Promise<void> {
    if (this.loadedSounds.has(name)) return;
    
    try {
      // For local assets, use Asset.fromModule with a require
      // For remote URIs, use Asset.fromURI
      let asset: Asset;
      if (uri.startsWith('http')) {
        asset = Asset.fromURI(uri);
      } else {
        // For require statements, this would need to be handled differently
        asset = { uri } as Asset;
      }
      this.loadedSounds.set(name, asset);
    } catch (e) {
      console.warn(`Failed to load sound ${name}:`, e);
    }
  }

  async loadSounds(sounds: Array<{ name: string; uri: string }>): Promise<void> {
    await Promise.all(sounds.map(s => this.loadSound(s.name, s.uri)));
  }

  getSound(name: string): any {
    return this.loadedSounds.get(name);
  }

  unloadSound(name: string): void {
    this.loadedSounds.delete(name);
  }

  unloadAll(): void {
    this.loadedSounds.clear();
  }
}

export const audioLoader = new AudioLoader();
