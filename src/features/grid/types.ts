export type GridMode = 'circular' | 'circularNotes' | 'pianoCircles' | 'pianoRow' | 'keyboard';

export type ScaleType = 'chromatic' | 'major' | 'minor' | 'pentatonic' | 'circleOfFifths';

export interface Note {
  id: string;
  name: string;
  frequency: number;
  isBlack?: boolean;
}
