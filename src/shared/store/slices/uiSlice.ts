import { StateCreator } from 'zustand';
import { GridMode } from '../../../features/grid/types';

export interface UiSlice {
  hasStarted: boolean;
  isDark: boolean;
  gridMode: GridMode;
  settingsOpen: boolean;
  debugMode: boolean;
  showCalibration: boolean;
  setHasStarted: (value: boolean) => void;
  setIsDark: (value: boolean) => void;
  setGridMode: (mode: GridMode) => void;
  setSettingsOpen: (value: boolean) => void;
  setDebugMode: (value: boolean) => void;
  setShowCalibration: (value: boolean) => void;
}

export const createUiSlice: StateCreator<UiSlice, [], []> = (set) => ({
  hasStarted: false,
  isDark: true,
  gridMode: 'circular',
  settingsOpen: false,
  debugMode: false,
  showCalibration: false,
  setHasStarted: (value) => set({ hasStarted: value }),
  setIsDark: (value) => set({ isDark: value }),
  setGridMode: (mode) => set({ gridMode: mode }),
  setSettingsOpen: (value) => set({ settingsOpen: value }),
  setDebugMode: (value) => set({ debugMode: value }),
  setShowCalibration: (value) => set({ showCalibration: value }),
});
