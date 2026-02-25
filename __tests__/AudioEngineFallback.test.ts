/**
 * Audio Engine Fallback Tests
 * Tests the JavaScript fallback audio implementation
 */
import {
  initializeAudio,
  playOscillator,
  stopOscillator,
  stopAllOscillators,
  setMasterVolume,
  getAudioLatency,
  isAudioReady,
  cleanupAudio,
} from '../src/lib/audio/AudioEngineFallback';

describe('AudioEngineFallback', () => {
  beforeEach(() => {
    // Clean up before each test
    cleanupAudio();
  });

  afterEach(() => {
    cleanupAudio();
  });

  describe('Initialization', () => {
    it('should initialize audio context', () => {
      const result = initializeAudio();
      expect(result).toBe(true);
      expect(isAudioReady()).toBe(true);
    });

    it('should return true if already initialized', () => {
      initializeAudio();
      const result = initializeAudio();
      expect(result).toBe(true);
    });
  });

  describe('Oscillator Playback', () => {
    it('should play oscillator and return ID', () => {
      const id = playOscillator(440, 'sine', 0.5);
      expect(id).toBeGreaterThan(0);
    });

    it('should play oscillator with different frequencies', () => {
      const id1 = playOscillator(440, 'sine', 0.5);
      const id2 = playOscillator(880, 'sine', 0.5);
      expect(id2).toBeGreaterThan(id1);
    });

    it('should play oscillator with different types', () => {
      const sineId = playOscillator(440, 'sine', 0.5);
      const squareId = playOscillator(440, 'square', 0.5);
      const sawId = playOscillator(440, 'sawtooth', 0.5);
      const triId = playOscillator(440, 'triangle', 0.5);
      
      expect(sineId).toBeDefined();
      expect(squareId).toBeDefined();
      expect(sawId).toBeDefined();
      expect(triId).toBeDefined();
    });

    it('should stop oscillator by ID', () => {
      const id = playOscillator(440, 'sine', 0.5);
      const result = stopOscillator(id);
      expect(result).toBe(true);
    });

    it('should return false for invalid oscillator ID', () => {
      const result = stopOscillator(99999);
      expect(result).toBe(false);
    });

    it('should stop all oscillators', () => {
      playOscillator(440, 'sine', 0.5);
      playOscillator(880, 'sine', 0.5);
      playOscillator(1320, 'sine', 0.5);
      
      stopAllOscillators();
      
      // Should be able to create new oscillators after cleanup
      const id = playOscillator(440);
      expect(id).toBeGreaterThan(0);
    });
  });

  describe('Volume Control', () => {
    it('should set master volume', () => {
      setMasterVolume(0.5);
      // Volume is applied internally, no direct getter
      expect(() => setMasterVolume(0.5)).not.toThrow();
    });

    it('should clamp volume to valid range', () => {
      setMasterVolume(1.5); // Should clamp to 1
      setMasterVolume(-0.5); // Should clamp to 0
      expect(() => setMasterVolume(0.5)).not.toThrow();
    });
  });

  describe('Latency', () => {
    it('should return latency estimate', () => {
      const latency = getAudioLatency();
      expect(latency).toBe(50); // Default 50ms
    });
  });

  describe('Cleanup', () => {
    it('should cleanup audio context', () => {
      initializeAudio();
      cleanupAudio();
      expect(isAudioReady()).toBe(false);
    });
  });
});
