/**
 * Zero-Latency NoteCircle Component
 * Uses Gesture Handler + Reanimated for UI Thread animations
 * Physics-first approach for professional musical performance
 * 
 * Key fix: Uses useDerivedValue to get current latency value
 * rather than capturing it at gesture creation time
 */
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  runOnJS,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { useAudioEngine } from '../../hooks/useAudioEngine';
import { useLatency } from '../../hooks/useLatency';
import { useAppStore } from '../../store/useAppStore';

interface NoteCircleProps {
  note: {
    id: string;
    name: string;
    frequency: number;
  };
  x: number;
  y: number;
  size: number;
  isActive: boolean;
}

/**
 * High-performance note circle with UI thread animations
 * Uses Gesture.Manual for fastest response
 * Latency offset is dynamically read from shared value
 */
export default function NoteCircle({ note, x, y, size, isActive }: NoteCircleProps) {
  const { colors } = useTheme();
  const { playNote, stopNote } = useAudioEngine();
  const { offset: latencyOffset } = useLatency();
  
  // Get store functions for active notes
  const addActiveNote = useAppStore((s) => s.addActiveNote);
  const removeActiveNote = useAppStore((s) => s.removeActiveNote);

  // Shared values for UI thread animations
  const pressed = useSharedValue(0);
  const scale = useSharedValue(1);
  
  // Shared value for latency - this will be updated dynamically
  const currentLatencyOffset = useSharedValue(latencyOffset);
  
  // Update latency offset when it changes (e.g., after calibration)
  useEffect(() => {
    currentLatencyOffset.value = latencyOffset;
  }, [latencyOffset]);

  // Trigger haptic feedback
  const triggerHaptic = async () => {
    try {
      await impactAsync(ImpactFeedbackStyle.Medium);
    } catch (e) {
      // Haptics may not be available on all devices
    }
  };

  // Memoized gesture handler to prevent recreation on every render
  // Note: We still access currentLatencyOffset via shared value, so dynamic latency works
  const gesture = useMemo(() => {
    return Gesture.Manual()
      .onTouchesDown((event, manager) => {
        // Trigger haptic immediately
        runOnJS(triggerHaptic)();
        
        // Trigger audio immediately (lowest latency)
        runOnJS(playNote)(note.frequency);
        
        // Update store's active notes for visual feedback
        runOnJS(addActiveNote)(note.id);
        
        // Animate visual with dynamic delay from shared value
        // This ensures we always use the current latency offset
        pressed.value = withDelay(
          currentLatencyOffset.value,
          withSpring(1, { damping: 15, stiffness: 200 })
        );
        scale.value = withDelay(
          currentLatencyOffset.value,
          withSpring(1.15, { damping: 12, stiffness: 180 })
        );
        
        manager.activate();
      })
      .onTouchesUp((event, manager) => {
        // Stop audio
        runOnJS(stopNote)(note.frequency);
        
        // Update store to remove from active notes
        runOnJS(removeActiveNote)(note.id);
        
        // Animate back to rest state (no delay for release)
        pressed.value = withSpring(0, { damping: 15, stiffness: 200 });
        scale.value = withSpring(1, { damping: 12, stiffness: 180 });
        
        manager.end();
      })
      .onTouchesCancelled((event, manager) => {
        // Safety cleanup
        pressed.value = withSpring(0);
        scale.value = withSpring(1);
        manager.end();
      });
  }, [note.id, note.frequency]); // Only recreate if note changes, not on every render

  // Animated style - runs on UI thread
  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      pressed.value,
      [0, 1],
      [colors.secondary, colors.primary]
    );

    return {
      backgroundColor,
      transform: [{ scale: scale.value }],
      opacity: 0.8 + pressed.value * 0.2,
    };
  });

  // Static style based on props
  const containerStyle = {
    left: x - size / 2,
    top: y - size / 2,
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.container,
          containerStyle,
          animatedStyle,
          {
            borderWidth: 2,
            borderColor: isActive || pressed.value > 0 ? colors.primary : colors.border,
          },
        ]}
        testID={`note-circle-${note.id}`}
      >
        <Text
          style={[
            styles.label,
            {
              color: colors.text,
              fontSize: size * 0.25,
            },
          ]}
        >
          {note.name}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  label: {
    position: 'absolute',
    fontWeight: 'bold',
    pointerEvents: 'none',
  },
});
