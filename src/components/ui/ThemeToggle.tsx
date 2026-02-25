import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAppStore } from '../../store/useAppStore';

export default function ThemeToggle() {
  const isDark = useAppStore((s) => s.isDark);
  const setIsDark = useAppStore((s) => s.setIsDark);

  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={() => setIsDark(!isDark)}
    >
      <Text style={styles.icon}>{isDark ? '🌙' : '☀️'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
});
