/**
 * Floating circular notes SVG grid layout
 * Notes float and can be dragged in circular patterns
 */
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../hooks/useTheme';
import { polarToCartesian } from '../../lib/geometry';
import NoteCircle from '../keys/NoteCircle';

export default function CircularNoteGrid() {
  const { notes, activeNotes } = useAppStore();
  const { colors } = useTheme();
  
  const { width, height } = Dimensions.get('window');
  const size = Math.min(width, height) * 0.8;
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Multiple concentric circles for floating notes
  const rings = [0.3, 0.5, 0.7, 0.9];
  
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Concentric circles for visual reference */}
        {rings.map((ratio, i) => (
          <Circle
            key={i}
            cx={centerX}
            cy={centerY}
            r={size / 2 * ratio}
            fill="none"
            stroke={colors.border}
            strokeWidth={1}
            opacity={0.3}
          />
        ))}
        
        {/* Center point */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={5}
          fill={colors.primary}
        />
      </Svg>
      
      {/* Notes positioned on different rings - outside SVG for better touch */}
      {notes.map((note, index) => {
        const ringIndex = index % rings.length;
        const ringRadius = size / 2 * rings[ringIndex];
        const angle = (index / notes.length) * 2 * Math.PI;
        const { x, y } = polarToCartesian(ringRadius, angle);
        
        return (
          <NoteCircle
            key={note.id}
            note={note}
            x={centerX + x}
            y={centerY + y}
            size={28}
            isActive={activeNotes.includes(note.id)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
