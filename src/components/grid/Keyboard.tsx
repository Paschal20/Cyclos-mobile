/**
 * Standard linear keyboard
 * Traditional piano keyboard layout with white and black keys
 */
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../hooks/useTheme';
import MusicKey from '../keys/MusicKey';

export default function Keyboard() {
  const { notes, activeNotes, complexity } = useAppStore();
  const { colors } = useTheme();
  
  // Separate white and black keys
  const whiteKeys = notes.filter(n => !n.isBlack);
  const blackKeys = notes.filter(n => n.isBlack);
  
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.keyboard}>
          {/* White keys */}
          <View style={styles.whiteKeys}>
            {whiteKeys.map((note, index) => (
              <MusicKey
                key={note.id}
                note={note}
                isActive={activeNotes.includes(note.id)}
                isWhiteKey={true}
                isVertical={true}
              />
            ))}
          </View>
          
          {/* Black keys overlay */}
          <View style={styles.blackKeys}>
            {blackKeys.map((note, index) => (
              <MusicKey
                key={note.id}
                note={note}
                isActive={activeNotes.includes(note.id)}
                isWhiteKey={false}
                isVertical={true}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  keyboard: {
    position: 'relative',
  },
  whiteKeys: {
    flexDirection: 'row',
  },
  blackKeys: {
    position: 'absolute',
    top: 0,
    left: 0,
    flexDirection: 'row',
  },
});
