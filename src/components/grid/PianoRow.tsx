/**
 * Piano Row
 * Horizontal row of piano keys using MusicKey (scroll-view)
 */
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import MusicKey from '../keys/MusicKey';
import { useAppStore } from '../../store/useAppStore';
import { midiToNoteName } from '../../lib/math';

interface PianoRowProps {
  noteCount?: number;
  startNote?: number;
}

export function PianoRow({ noteCount = 12, startNote = 60 }: PianoRowProps) {
  const activeNotes = useAppStore((s) => s.activeNotes);

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.container}>
        {Array.from({ length: noteCount }, (_, i) => {
          const midiNote = startNote + i;
          const noteId = midiToNoteName(midiNote);
          const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
          const isActive = activeNotes.includes(noteId);
          const isBlack = [1, 3, 6, 8, 10].includes(i % 12);
          
          return (
            <View key={noteId} style={[styles.keyWrapper, isBlack && styles.blackKeyWrapper]}>
              <MusicKey
                note={{ id: noteId, name: noteId, frequency, isBlack }}
                isActive={isActive}
                isWhiteKey={!isBlack}
              />
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    flex: 1,
    paddingHorizontal: 10,
    minHeight: 200,
  },
  keyWrapper: {
    marginHorizontal: 1,
  },
  blackKeyWrapper: {
    marginBottom: 40,
  },
});
