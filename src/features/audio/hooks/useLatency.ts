/**
 * Latency Oracle Hook
 * Provides audio-visual sync offset based on hardware detection
 * Physics-first approach: measures signal propagation delay
 */
import { useState, useEffect, useCallback } from 'react';
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { AudioEngine } = NativeModules;

export type AudioRouteType = 'wired' | 'bluetooth' | 'unknown';

interface LatencyState {
  offset: number;
  routeType: AudioRouteType;
  currentLatency: number;
  isCalibrating: boolean;
  lastCalibration: number | null;
}

const STORAGE_KEY = '@cyclos/latency_calibration';
const HUMAN_REACTION_TIME = 150;

async function detectAudioRoute(): Promise<AudioRouteType> {
  try {
    if (AudioEngine?.getAudioRoute) {
      const route = await AudioEngine.getAudioRoute();
      if (route === 'bluetooth' || route === 'airplay') {
        return 'bluetooth';
      }
      return 'wired';
    }
  } catch (e) {
    console.log('[useLatency] Native route detection failed:', e);
  }
  
  if (Platform.OS === 'ios') {
    return 'unknown';
  }
  
  if (Platform.OS === 'android') {
    return 'unknown';
  }
  
  return 'unknown';
}

function estimateLatency(routeType: AudioRouteType): number {
  switch (routeType) {
    case 'wired':
      return 10;
    case 'bluetooth':
      return 200;
    case 'unknown':
    default:
      return 50;
  }
}

export function useLatency() {
  const [state, setState] = useState<LatencyState>({
    offset: 0,
    routeType: 'unknown',
    currentLatency: 0,
    isCalibrating: false,
    lastCalibration: null,
  });

  useEffect(() => {
    loadCalibration();
    detectRoute();
  }, []);

  const loadCalibration = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setState((prev) => ({
          ...prev,
          offset: data.offset || 0,
          currentLatency: data.currentLatency || 0,
          lastCalibration: data.lastCalibration || null,
          routeType: data.routeType || 'unknown',
        }));
        return true;
      }
    } catch (e) {
      console.warn('[useLatency] Failed to load latency calibration:', e);
    }
    return false;
  };

  const detectRoute = useCallback(async () => {
    try {
      const route = await detectAudioRoute();
      const estimated = estimateLatency(route);
      
      setState((prev) => ({
        ...prev,
        routeType: route,
        offset: prev.offset || estimated,
        currentLatency: prev.currentLatency || estimated,
      }));
      
      return route;
    } catch (e) {
      console.warn('[useLatency] Route detection failed:', e);
      return 'unknown';
    }
  }, []);

  const startCalibration = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isCalibrating: true,
    }));
    return Date.now();
  }, []);

  const completeCalibration = useCallback(async (tapTime: number, emitTime: number) => {
    const measuredLatency = tapTime - emitTime;
    const actualLatency = Math.max(0, measuredLatency - HUMAN_REACTION_TIME);
    const visualOffset = actualLatency;
    
    try {
      const calibrationData = {
        offset: visualOffset,
        currentLatency: actualLatency,
        lastCalibration: Date.now(),
        routeType: state.routeType,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(calibrationData));
      
      setState((prev) => ({
        ...prev,
        offset: visualOffset,
        currentLatency: actualLatency,
        isCalibrating: false,
        lastCalibration: Date.now(),
      }));
      
      console.log(`[useLatency] Calibration complete: ${actualLatency}ms`);
      return true;
    } catch (e) {
      console.warn('[useLatency] Failed to save calibration:', e);
      setState((prev) => ({
        ...prev,
        isCalibrating: false,
      }));
      return false;
    }
  }, [state.routeType]);

  const resetCalibration = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      const estimated = estimateLatency(state.routeType);
      setState((prev) => ({
        ...prev,
        offset: estimated,
        currentLatency: estimated,
        lastCalibration: null,
      }));
    } catch (e) {
      console.warn('[useLatency] Failed to reset calibration:', e);
    }
  }, [state.routeType]);

  const setOffset = useCallback((newOffset: number) => {
    setState((prev) => ({
      ...prev,
      offset: newOffset,
    }));
  }, []);

  return {
    offset: state.offset,
    routeType: state.routeType,
    currentLatency: state.currentLatency,
    isCalibrating: state.isCalibrating,
    lastCalibration: state.lastCalibration,
    startCalibration,
    completeCalibration,
    resetCalibration,
    setOffset,
    detectRoute,
  };
}

export function useLatencyStatus() {
  const { currentLatency, routeType } = useLatency();
  
  const isHealthy = currentLatency < 50;
  const status = isHealthy ? 'Pro-Grade' : 'Sync Active';
  
  return {
    currentLatency,
    routeType,
    isHealthy,
    status,
  };
}
