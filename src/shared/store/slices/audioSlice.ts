import { StateCreator } from 'zustand';

export interface AudioSlice {
  isAudioReady: boolean;
  audioLatency: number;
  lastNoteTime: number;
  activeNotes: string[];
  volume: number;
  setIsAudioReady: (value: boolean) => void;
  setAudioLatency: (value: number) => void;
  setLastNoteTime: (value: number) => void;
  addActiveNote: (noteId: string) => void;
  removeActiveNote: (noteId: string) => void;
  clearActiveNotes: () => void;
  setVolume: (value: number) => void;
}

export const createAudioSlice: StateCreator<AudioSlice, [], []> = (set) => ({
  isAudioReady: false,
  audioLatency: 0,
  lastNoteTime: 0,
  activeNotes: [],
  volume: 0.8,
  setIsAudioReady: (value) => set({ isAudioReady: value }),
  setAudioLatency: (value) => set({ audioLatency: value }),
  setLastNoteTime: (value) => set({ lastNoteTime: value }),
  addActiveNote: (noteId) => set((state) => ({
    activeNotes: state.activeNotes.includes(noteId) ? state.activeNotes : [...state.activeNotes, noteId]
  })),
  removeActiveNote: (noteId) => set((state) => ({
    activeNotes: state.activeNotes.filter(id => id !== noteId)
  })),
  clearActiveNotes: () => set({ activeNotes: [] }),
  setVolume: (value) => set({ volume: value }),
});
