/**
 * Audio Engine Hook
 * Provides audio playback functionality with fallback support
 */
import { useCallback, useRef, useEffect, useState } from 'react';
import { NativeModules, Platform } from 'react-native';
import { useAppStore } from '../../../shared/store';
import { AudioEngine } from '../context/AudioEngineContext';
import { audioEngineExpo } from '../engines/AudioEngineExpo';
import { audioEngineFallback } from '../engines/AudioEngineFallback';

const { AudioEngine: NativeAudioEngine } = NativeModules;

const activeOscillators: Map<number, number> = new Map();

export function useAudioEngine(engine?: AudioEngine) {
  const isReady = useAppStore((s) => s.isAudioReady);
  const setIsReady = useAppStore((s) => s.setIsAudioReady);
  const audioLatency = useAppStore((s) => s.audioLatency);
  const setAudioLatency = useAppStore((s) => s.setAudioLatency);
  const lastNoteTime = useAppStore((s) => s.setLastNoteTime);
  const volume = useAppStore((s) => s.volume);
  const initialized = useRef(false);

  const [usingFallback, setUsingFallback] = useState(false);
  const [usingExpo, setUsingExpo] = useState(false);

  const activeEngine = useRef<AudioEngine | null>(engine || null);

  useEffect(() => {
    const init = async () => {
      if (initialized.current) return;
      initialized.current = true;

      try {
        console.log('[useAudioEngine] Trying expo-av engine');
        const success = await audioEngineExpo.initialize();
        if (success) {
          console.log('[useAudioEngine] Using expo-av engine');
          activeEngine.current = audioEngineExpo;
          setUsingExpo(true);
          setUsingFallback(false);
          setAudioLatency(audioEngineExpo.getLatency());
          setIsReady(true);
          return;
        }
      } catch (e) {
        console.warn('[useAudioEngine] Expo engine init failed:', e);
      }

      try {
        if (NativeAudioEngine?.initialize) {
          console.log('[useAudioEngine] Using native audio engine');
          await NativeAudioEngine.initialize();
          setUsingExpo(false);
          setUsingFallback(false);
          const latency = (await NativeAudioEngine.getLatency?.()) || 10;
          setAudioLatency(latency);
          setIsReady(true);
          return;
        }
      } catch (e) {
        console.warn('[useAudioEngine] Native engine init failed:', e);
      }

      console.log('[useAudioEngine] Using fallback audio engine (silent)');
      await audioEngineFallback.initialize();
      activeEngine.current = audioEngineFallback;
      setUsingExpo(false);
      setUsingFallback(true);
      setAudioLatency(50);
      setIsReady(true);
    };

    init();

    return () => {
      audioEngineExpo.cleanup().catch(() => {});
      audioEngineFallback.cleanup().catch(() => {});
      initialized.current = false;
    };
  }, [setIsReady, setAudioLatency]);

  const playNote = useCallback(async (note: number, velocity: number = 1) => {
    const startTime = Date.now();

    const gain = velocity * volume;

    let frequency: number;
    if (note > 0 && note < 256) {
      frequency = 440 * Math.pow(2, (note - 69) / 12);
    } else {
      frequency = note;
    }

    try {
      if (activeEngine.current) {
        await activeEngine.current.playNote(frequency, gain);
      } else {
        await audioEngineExpo.playNote(frequency, gain);
      }

      const elapsed = Date.now() - startTime;
      lastNoteTime(elapsed);
    } catch (e) {
      console.warn('[useAudioEngine] Play note failed:', e);
      lastNoteTime(0);
    }
  }, [volume, lastNoteTime]);

  const stopNote = useCallback(async (note: number) => {
    let frequency: number;
    if (note > 0 && note < 256) {
      frequency = 440 * Math.pow(2, (note - 69) / 12);
    } else {
      frequency = note;
    }

    try {
      if (activeEngine.current) {
        await activeEngine.current.stopNote(frequency);
      } else {
        await audioEngineExpo.stopNote(frequency);
      }
    } catch (e) {
      console.warn('[useAudioEngine] Stop note failed:', e);
    }
  }, []);

  const setEngineVolume = useCallback(async (newVolume: number) => {
    if (activeEngine.current) {
      await activeEngine.current.setVolume(newVolume);
    }
  }, []);

  return {
    initAudio: () => {},
    playNote,
    stopNote,
    setVolume: setEngineVolume,
    isReady,
    audioLatency,
    usingFallback,
    usingExpo,
  };
}
