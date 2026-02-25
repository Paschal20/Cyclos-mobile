import { create } from 'zustand';
import { createAudioSlice, AudioSlice } from '../shared/store/slices/audioSlice';
import { createUiSlice, UiSlice } from '../shared/store/slices/uiSlice';
import { createNotesSlice, NotesSlice } from '../shared/store/slices/notesSlice';

export type GridMode = 'circular' | 'circularNotes' | 'pianoCircles' | 'pianoRow' | 'keyboard';

export type ScaleType = 'chromatic' | 'major' | 'minor' | 'pentatonic' | 'circleOfFifths';

export interface Note {
  id: string;
  name: string;
  frequency: number;
  isBlack?: boolean;
}

export type AppState = AudioSlice & UiSlice & NotesSlice;

export const useAppStore = create<AppState>()((set, get, api) => ({
  ...createAudioSlice(set, get, api),
  ...createUiSlice(set, get, api),
  ...createNotesSlice(set, get, api),
}));
