/**
 * Wedge-based SVG grid layout
 * Arranges notes in circular wedges for radial interaction
 */
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../hooks/useTheme';
import { polarToCartesian } from '../../lib/geometry';
import NoteCircle from '../keys/NoteCircle';

interface CircularGridProps {
  // Props would be defined here
}

export default function CircularGrid({}: CircularGridProps) {
  const { notes, activeNotes } = useAppStore();
  const { colors } = useTheme();
  
  // Calculate grid dimensions based on screen size
  const { width, height } = Dimensions.get('window');
  const size = Math.min(width, height) * 0.8;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 40;
  
  // Calculate note positions in a circular pattern
  const notePositions = notes.map((note, index) => {
    const angle = (index / notes.length) * 2 * Math.PI - Math.PI / 2;
    const { x, y } = polarToCartesian(radius, angle);
    return { 
      note, 
      x: centerX + x, 
      y: centerY + y 
    };
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke={colors.border}
          strokeWidth={2}
        />
        
        {/* Inner circle */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.6}
          fill="none"
          stroke={colors.border}
          strokeWidth={1}
          strokeDasharray="5,5"
        />
        
        {/* Center circle */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.2}
          fill={colors.primary}
          opacity={0.2}
        />
        
        {/* Render notes - outside SVG for better touch handling */}
      </Svg>
      
      {/* Render notes as positioned Views */}
      {notePositions.map(({ note, x, y }) => (
        <NoteCircle
          key={note.id}
          note={note}
          x={x}
          y={y}
          size={30}
          isActive={activeNotes.includes(note.id)}
        />
      ))}
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
