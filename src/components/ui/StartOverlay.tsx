import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppStore } from '../../store/useAppStore';

export default function StartOverlay() {
  const hasStarted = useAppStore((s) => s.hasStarted);
  const setHasStarted = useAppStore((s) => s.setHasStarted);

  if (hasStarted) return null;

  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>CYCLOS</Text>
      <Text style={styles.subtitle}>Touch the circles to play</Text>
      <TouchableOpacity style={styles.button} onPress={() => setHasStarted(true)}>
        <Text style={styles.buttonText}>START</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#e94560',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
