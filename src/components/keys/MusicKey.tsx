/**
 * Rectangular/Pill piano key
 * Touch target for piano-style note interaction
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAudioEngine } from '../../hooks/useAudioEngine';
import { useAppStore } from '../../store/useAppStore';

interface MusicKeyProps {
  note: {
    id: string;
    name: string;
    frequency: number;
    isBlack?: boolean;
  };
  x?: number;
  y?: number;
  isActive: boolean;
  isVertical?: boolean;
  isWhiteKey?: boolean;
  angle?: number;
}

export default function MusicKey({ 
  note, 
  x, 
  y, 
  isActive, 
  isVertical = false,
  isWhiteKey = true,
  angle = 0 
}: MusicKeyProps) {
  const { colors } = useTheme();
  const { playNote, stopNote } = useAudioEngine();
  
  // Get store functions for active notes
  const addActiveNote = useAppStore((s) => s.addActiveNote);
  const removeActiveNote = useAppStore((s) => s.removeActiveNote);
  
  const handlePressIn = () => {
    playNote(note.frequency);
    addActiveNote(note.id);
  };
  
  const handlePressOut = () => {
    stopNote(note.frequency);
    removeActiveNote(note.id);
  };
  
  const keyColor = isWhiteKey 
    ? (isActive ? colors.primary : colors.surface) 
    : (isActive ? colors.primary : '#1a1a1a');
    
  const textColor = isWhiteKey ? colors.text : '#ffffff';
  
  const containerStyle = [
    styles.container,
    isVertical ? styles.vertical : styles.radial,
    isWhiteKey ? styles.whiteKey : styles.blackKey,
    { 
      backgroundColor: keyColor,
      transform: angle ? [{ rotate: `${angle}rad` }] : [],
    },
  ];
  
  return (
    <Pressable
      style={containerStyle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Text style={[styles.label, { color: textColor }]}>
        {note.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
  },
  vertical: {
    width: 44,
    height: 180,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
    marginHorizontal: 1,
  },
  radial: {
    width: 50,
    height: 30,
    borderRadius: 15,
  },
  whiteKey: {
    backgroundColor: '#ffffff',
    borderColor: '#333',
  },
  blackKey: {
    backgroundColor: '#1a1a1a',
    borderColor: '#000',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  },
});
