import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppStore } from '../../store/useAppStore';

export default function MobileAudioDebug() {
  const debugMode = useAppStore((s) => s.debugMode);
  const audioLatency = useAppStore((s) => s.audioLatency);
  const lastNoteTime = useAppStore((s) => s.lastNoteTime);

  if (!debugMode) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Audio Latency: {audioLatency.toFixed(1)}ms</Text>
      <Text style={styles.label}>Last Note: {lastNoteTime}ms</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 4,
  },
  label: {
    color: '#0f0',
    fontSize: 10,
    fontFamily: 'monospace',
  },
});
