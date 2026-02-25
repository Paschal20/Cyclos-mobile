import { StateCreator } from 'zustand';
import { Note, ScaleType } from '../../../features/grid/types';

function generateNotes(scale: ScaleType, complexity: number): Note[] {
  const notes: Note[] = [];
  const baseNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  let noteCount = 8;
  switch (scale) {
    case 'chromatic':
      noteCount = 12;
      break;
    case 'major':
    case 'minor':
      noteCount = 7;
      break;
    case 'pentatonic':
      noteCount = 5;
      break;
    case 'circleOfFifths':
      noteCount = Math.min(12, complexity + 4);
      break;
  }
  
  const octaveOffset = Math.floor(complexity / 4);
  
  for (let i = 0; i < noteCount; i++) {
    const midi = 60 + octaveOffset * 12 + i;
    const frequency = 440 * Math.pow(2, (midi - 69) / 12);
    const noteName = baseNotes[midi % 12] + Math.floor(midi / 12 - 1);
    const isBlack = [1, 3, 6, 8, 10].includes(midi % 12);
    
    notes.push({
      id: noteName,
      name: baseNotes[midi % 12],
      frequency,
      isBlack,
    });
  }
  
  return notes;
}

export interface NotesSlice {
  notes: Note[];
  scale: ScaleType;
  complexity: number;
  setNotes: (notes: Note[]) => void;
  setScale: (scale: ScaleType) => void;
  setComplexity: (complexity: number) => void;
}

export const createNotesSlice: StateCreator<NotesSlice, [], []> = (set, get) => ({
  notes: generateNotes('chromatic', 5),
  scale: 'chromatic',
  complexity: 5,
  setNotes: (notes) => set({ notes }),
  setScale: (scale) => {
    const { complexity } = get();
    set({ scale, notes: generateNotes(scale, complexity) });
  },
  setComplexity: (complexity) => {
    const { scale } = get();
    set({ complexity, notes: generateNotes(scale, complexity) });
  },
});
