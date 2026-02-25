import { create } from 'zustand';
import { createAudioSlice, AudioSlice } from './slices/audioSlice';
import { createUiSlice, UiSlice } from './slices/uiSlice';
import { createNotesSlice, NotesSlice } from './slices/notesSlice';

export type AppState = AudioSlice & UiSlice & NotesSlice;

export const useAppStore = create<AppState>()((set, get, api) => ({
  ...createAudioSlice(set, get, api),
  ...createUiSlice(set, get, api),
  ...createNotesSlice(set, get, api),
}));
