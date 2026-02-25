import React, { createContext, useContext, ReactNode } from 'react';

export interface AudioEngine {
  initialize(): Promise<boolean>;
  playNote(frequency: number, velocity?: number): Promise<void>;
  stopNote(frequency: number): Promise<void>;
  setVolume(volume: number): Promise<void>;
  getLatency(): number;
  isReady(): boolean;
  cleanup(): Promise<void>;
}

const AudioEngineContext = createContext<AudioEngine | null>(null);

export const AudioEngineProvider = ({ children, engine }: { children: ReactNode; engine: AudioEngine }) => {
  return (
    <AudioEngineContext.Provider value={engine}>
      {children}
    </AudioEngineContext.Provider>
  );
};

export const useAudioEngineContext = (): AudioEngine => {
  const context = useContext(AudioEngineContext);
  if (!context) {
    throw new Error('useAudioEngineContext must be used within AudioEngineProvider');
  }
  return context;
};
