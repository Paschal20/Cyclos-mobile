/**
 * Piano Circles Grid
 * Multiple rings of notes for radial interaction
 */
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import NoteCircle from '../keys/NoteCircle';
import { useAppStore } from '../../store/useAppStore';
import { polarToCartesian } from '../../lib/geometry';
import { midiToNoteName } from '../../lib/math';

interface PianoCirclesProps {
  rings?: number;
  notesPerRing?: number;
  startNote?: number;
}

export function PianoCircles({ 
  rings = 3, 
  notesPerRing = 8, 
  startNote = 48 
}: PianoCirclesProps) {
  const { width, height } = Dimensions.get('window');
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) * 0.4;
  
  const activeNotes = useAppStore((s) => s.activeNotes);

  // NoteCircle component handles its own touch events and store updates internally
  // No need for external handlers here

  const notes: Array<{ noteId: string; frequency: number; x: number; y: number; radius: number }> = [];
  
  for (let ring = 0; ring < rings; ring++) {
    const ringRadius = maxRadius * ((ring + 1) / rings);
    const noteOffset = ring * notesPerRing;
    
    for (let i = 0; i < notesPerRing; i++) {
      const angle = (2 * Math.PI * i) / notesPerRing - Math.PI / 2;
      const { x, y } = polarToCartesian(ringRadius, angle);
      const midiNote = startNote + noteOffset + i;
      const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
      const noteId = midiToNoteName(midiNote);
      
      notes.push({
        noteId,
        frequency,
        x: centerX + x,
        y: centerY + y,
        radius: ringRadius,
      });
    }
  }

  return (
    <View style={styles.container}>
      <Svg style={StyleSheet.absoluteFill}>
        <G>
          {notes.map((n, idx) => (
            <Circle
              key={idx}
              cx={centerX}
              cy={centerY}
              r={n.radius}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={1}
            />
          ))}
        </G>
      </Svg>
      {notes.map((n) => {
        const isActive = activeNotes.includes(n.noteId);
        return (
          <View
            key={n.noteId}
            style={[
              styles.noteContainer,
              { left: n.x - 25, top: n.y - 25 }
            ]}
          >
            <NoteCircle
              note={{ id: n.noteId, name: n.noteId, frequency: n.frequency }}
              x={25}
              y={25}
              size={50}
              isActive={isActive}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noteContainer: {
    position: 'absolute',
  },
});
