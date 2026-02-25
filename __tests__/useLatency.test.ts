/**
 * useLatency Hook Tests
 * Tests the latency oracle functionality for audio-visual sync
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';

// Mock react-native 
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    NativeModules: {
      AudioEngine: {
        getAudioRoute: jest.fn(() => Promise.resolve('wired')),
      },
    },
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios || obj.default),
    },
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Now import after mocks
const { useLatency } = require('../src/hooks/useLatency');

describe('useLatency Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with default values', async () => {
      const { result } = renderHook(() => useLatency());
      
      // Wait for async operations
      await waitFor(() => {
        expect(result.current.offset).toBeDefined();
      });
      
      expect(result.current.routeType).toBeDefined();
      expect(result.current.currentLatency).toBeDefined();
      expect(result.current.isCalibrating).toBe(false);
    });
  });

  describe('Latency Estimation', () => {
    it('should estimate latency for unknown route', async () => {
      const { result } = renderHook(() => useLatency());
      
      await waitFor(() => {
        // Should have initial estimate
        expect(result.current.offset).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Calibration Flow', () => {
    it('should start calibration correctly', async () => {
      const { result } = renderHook(() => useLatency());
      
      await waitFor(() => {
        expect(result.current.isCalibrating).toBe(false);
      });

      act(() => {
        result.current.startCalibration();
      });

      await waitFor(() => {
        expect(result.current.isCalibrating).toBe(true);
      });
    });

    it('should complete calibration with valid measurements', async () => {
      const { result } = renderHook(() => useLatency());
      
      await waitFor(() => {
        expect(result.current.isCalibrating).toBe(false);
      });

      // Start calibration
      const emitTime = Date.now();
      
      // Complete after 200ms (simulating user tap)
      await act(async () => {
        await result.current.completeCalibration(emitTime + 200, emitTime);
      });

      await waitFor(() => {
        expect(result.current.isCalibrating).toBe(false);
        expect(result.current.lastCalibration).toBeTruthy();
      });
    });

    it('should reset calibration to defaults', async () => {
      const { result } = renderHook(() => useLatency());
      
      await waitFor(() => {
        expect(result.current.isCalibrating).toBe(false);
      });

      // First do a calibration
      const emitTime = Date.now();
      await act(async () => {
        await result.current.completeCalibration(emitTime + 200, emitTime);
      });

      // Then reset
      await act(async () => {
        await result.current.resetCalibration();
      });

      await waitFor(() => {
        expect(result.current.lastCalibration).toBeNull();
      });
    });
  });

  describe('Route Detection', () => {
    it('should detect audio route', async () => {
      const { result } = renderHook(() => useLatency());
      
      await waitFor(() => {
        expect(result.current.routeType).toBeDefined();
      });

      const route = await result.current.detectRoute();
      expect(route).toBeDefined();
    });
  });

  describe('Offset Management', () => {
    it('should allow manual offset adjustment', async () => {
      const { result } = renderHook(() => useLatency());
      
      await waitFor(() => {
        expect(result.current.isCalibrating).toBe(false);
      });

      act(() => {
        result.current.setOffset(100);
      });

      expect(result.current.offset).toBe(100);
    });
  });
});
