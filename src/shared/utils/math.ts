/**
 * Music Theory & Audio Physics Utilities
 * A440 Tuning Standard (ISO 16)
 */

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function frequencyToMidi(frequency: number): number {
  return Math.round(12 * Math.log2(frequency / 440) + 69);
}

export function midiToNoteName(midi: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const noteName = noteNames[midi % 12];
  return `${noteName}${octave}`;
}

export function isBlackKey(midi: number): boolean {
  const noteInOctave = midi % 12;
  return [1, 3, 6, 8, 10].includes(noteInOctave);
}

export function noteNameToFrequency(noteName: string): number {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const match = noteName.match(/^([A-G]#?)(\d+)$/);
  
  if (!match) {
    throw new Error(`Invalid note name: ${noteName}`);
  }
  
  const [, note, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const noteIndex = noteNames.indexOf(note);
  
  if (noteIndex === -1) {
    throw new Error(`Invalid note name: ${noteName}`);
  }
  
  const midi = (octave + 1) * 12 + noteIndex;
  return midiToFrequency(midi);
}
