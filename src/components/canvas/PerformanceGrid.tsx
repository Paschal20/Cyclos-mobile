/**
 * Performance Grid with Skia
 * GPU-accelerated canvas for 60FPS visual feedback
 * Uses GLSL shaders for ripple effects with animation
 * Supports touch interaction for note triggering
 */
import React, { useMemo, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, TouchableOpacity, View } from 'react-native';
import {
  Canvas,
  Circle,
  Skia,
  Shader,
} from '@shopify/react-native-skia';
import { useSharedValue, useFrameCallback } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { useAudioEngine } from '../../hooks/useAudioEngine';
import { useAppStore } from '../../store/useAppStore';
import { polarToCartesian } from '../../lib/geometry';

// GLSL Ripple Shader - runs directly on GPU
const rippleShader = Skia.RuntimeEffect.Make(`
  uniform float2 position;
  uniform float time;
  uniform float3 color;
  uniform float2 resolution;
  uniform float intensity;

  half4 main(float2 fragCoord) {
    float2 uv = fragCoord / resolution;
    float dist = distance(fragCoord, position);
    
    // Physics: Wave propagation with exponential decay
    // u(t) = A * sin(k*r - ω*t) * e^(-α*r)
    float wave = sin(dist * 0.05 - time * 10.0) * exp(-dist * 0.008);
    float mask = smoothstep(0.15, 0.0, abs(wave));
    
    // Color mixing with alpha for glow effect
    float alpha = mask * intensity * 0.4 * (1.0 - dist / (resolution.x * 0.5));
    
    return half4(color * mask, alpha);
  }
`);

interface PerformanceGridProps {
  notes: Array<{
    id: string;
    name: string;
    frequency: number;
  }>;
  activeNotes: string[];
  radius?: number;
}

/**
 * Animated Ripple Effect Component
 * Uses useFrameCallback to continuously update time uniform
 */
interface RippleEffectProps {
  x: number;
  y: number;
  isActive: boolean;
  colors: {
    primary: string;
  };
}

function RippleEffect({ x, y, isActive, colors }: RippleEffectProps) {
  const { width, height } = Dimensions.get('window');
  
  // Shared value for animation time - animated on UI thread
  const time = useSharedValue(0);
  const intensity = useSharedValue(0);
  
  // Convert hex to RGB array for shader
  const primaryColorRGB = useMemo(() => {
    const hex = colors.primary.replace('#', '');
    return [
      parseInt(hex.slice(0, 2), 16) / 255,
      parseInt(hex.slice(2, 4), 16) / 255,
      parseInt(hex.slice(4, 6), 16) / 255,
    ];
  }, [colors.primary]);

  // Animation frame callback - runs at 60fps on UI thread
  const frameCallback = useFrameCallback((frameInfo) => {
    'worklet';
    // Update time value each frame
    time.value = frameInfo.timeSincePreviousFrame 
      ? time.value + frameInfo.timeSincePreviousFrame / 1000 
      : 0;
    
    // Fade intensity when not active
    if (!isActive) {
      intensity.value = Math.max(0, intensity.value - 0.02);
    } else {
      intensity.value = Math.min(1, intensity.value + 0.05);
    }
  });

  // Cleanup frame callback on unmount
  useEffect(() => {
    return () => {
      // FrameCallback cleanup - no explicit stop needed in Reanimated 4
    };
  }, []);

  // Don't render if intensity is zero
  if (intensity.value <= 0.01 || !rippleShader) return null;

  const uniforms = {
    position: [x, y],
    time: time.value,
    resolution: [width, height] as [number, number],
    color: primaryColorRGB,
    intensity: intensity.value,
  };

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Shader source={rippleShader!} uniforms={uniforms} />
    </Canvas>
  );
}

export function PerformanceGrid({
  notes,
  activeNotes,
  radius = 120,
}: PerformanceGridProps) {
  const { colors } = useTheme();
  const { width, height } = Dimensions.get('window');
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Audio and store for touch interaction
  const { playNote, stopNote } = useAudioEngine();
  const addActiveNote = useAppStore((s) => s.addActiveNote);
  const removeActiveNote = useAppStore((s) => s.removeActiveNote);

  // Find active note position for ripple effect
  const activeNotePosition = useMemo(() => {
    const activeNote = notes.find(n => activeNotes.includes(n.id));
    if (activeNote) {
      const index = notes.findIndex(n => n.id === activeNote.id);
      const angle = (index / notes.length) * 2 * Math.PI - Math.PI / 2;
      const { x, y } = polarToCartesian(radius, angle);
      return {
        x: centerX + x,
        y: centerY + y,
      };
    }
    return null;
  }, [notes, activeNotes, radius, centerX, centerY]);

  // Calculate note positions
  const notePositions = useMemo(() => {
    return notes.map((note, index) => {
      const angle = (index / notes.length) * 2 * Math.PI - Math.PI / 2;
      const { x, y } = polarToCartesian(radius, angle);
      return {
        ...note,
        x: centerX + x,
        y: centerY + y,
        angle,
      };
    });
  }, [notes, radius, centerX, centerY]);

  // Handle touch to find nearest note
  const handleTouch = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const threshold = 50; // hit radius in pixels
    
    // Find nearest note within threshold
    let nearestNote = null;
    let minDist = threshold + 1;
    
    for (const note of notePositions) {
      const dx = locationX - note.x;
      const dy = locationY - note.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < threshold && dist < minDist) {
        minDist = dist;
        nearestNote = note;
      }
    }
    
    if (nearestNote) {
      playNote(nearestNote.frequency);
      addActiveNote(nearestNote.id);
    }
  };

  const handleTouchEnd = () => {
    // Clear all active notes on touch release
    for (const noteId of activeNotes) {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        stopNote(note.frequency);
        removeActiveNote(note.id);
      }
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={1}
      onPressIn={handleTouch}
      onPressOut={handleTouchEnd}
    >
      <Canvas style={styles.container}>
        {/* Background grid circles */}
        {[0.3, 0.5, 0.7, 0.9].map((ratio, index) => (
          <Circle
            key={`grid-${index}`}
            cx={centerX}
            cy={centerY}
            r={radius * ratio}
            color={colors.border}
            style="stroke"
            strokeWidth={1}
            opacity={0.3}
          />
        ))}

        {/* Center point */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={8}
          color={colors.primary}
        />

        {/* Note circles - rendered as Skia circles for performance */}
        {notePositions.map((note) => {
          const isNoteActive = activeNotes.includes(note.id);
          return (
            <Circle
              key={note.id}
              cx={note.x}
              cy={note.y}
              r={25}
              color={isNoteActive ? colors.primary : colors.secondary}
              style={isNoteActive ? 'fill' : 'stroke'}
              strokeWidth={2}
            />
          );
        })}
        
        {/* Animated ripple effect for active notes */}
        {activeNotePosition && activeNotes.length > 0 && (
          <RippleEffect 
            x={activeNotePosition.x} 
            y={activeNotePosition.y} 
            isActive={activeNotes.length > 0}
            colors={colors}
          />
        )}
      </Canvas>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
