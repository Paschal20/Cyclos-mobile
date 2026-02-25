/**
 * Unified Grid Component
 * Renders the appropriate grid layout based on gridMode from store
 * Provides consistent interface across all grid types
 */
import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useAppStore, GridMode } from '../../store/useAppStore';
import { useTheme } from '../../hooks/useTheme';
import { polarToCartesian } from '../../lib/geometry';
import NoteCircle from '../keys/NoteCircle';

// Import individual grid components
import CircularGrid from './CircularGrid';
import CircularNoteGrid from './CircularNoteGrid';
import { PianoCircles } from './PianoCircles';
import { PianoRow } from './PianoRow';
import Keyboard from './Keyboard';
import { PerformanceGrid } from '../canvas/PerformanceGrid';

interface UnifiedGridProps {
  // Optional override to force a specific grid mode
  forcedMode?: GridMode;
}

/**
 * Main unified grid component that selects the appropriate renderer
 */
export default function UnifiedGrid({ forcedMode }: UnifiedGridProps) {
  const gridMode = forcedMode || useAppStore((s) => s.gridMode);
  
  // Render based on grid mode
  switch (gridMode) {
    case 'circular':
      return <CircularGrid />;
    case 'circularNotes':
      return <CircularNoteGrid />;
    case 'pianoCircles':
      return <PianoCircles />;
    case 'pianoRow':
      return <PianoRow />;
    case 'keyboard':
      return <Keyboard />;
    default:
      return <CircularGrid />;
  }
}

/**
 * Performance Grid - Uses Skia for GPU-accelerated rendering
 * This is a separate high-performance variant
 */
export function UnifiedPerformanceGrid() {
  const { notes, activeNotes } = useAppStore();
  
  return (
    <PerformanceGrid
      notes={notes}
      activeNotes={activeNotes}
      radius={120}
    />
  );
}

/**
 * Hook to get available grid modes with descriptions
 */
export function useGridModes() {
  const gridMode = useAppStore((s) => s.gridMode);
  const setGridMode = useAppStore((s) => s.setGridMode);
  
  const modes: Array<{ id: GridMode; label: string; description: string }> = [
    { 
      id: 'circular', 
      label: 'Circular', 
      description: 'Radial arrangement around center' 
    },
    { 
      id: 'circularNotes', 
      label: 'Circular Notes', 
      description: 'Notes with name labels in circle' 
    },
    { 
      id: 'pianoCircles', 
      label: 'Piano Circles', 
      description: 'Piano-style with circular keys' 
    },
    { 
      id: 'pianoRow', 
      label: 'Piano Row', 
      description: 'Linear piano-style layout' 
    },
    { 
      id: 'keyboard', 
      label: 'Keyboard', 
      description: 'Full piano keyboard' 
    },
  ];
  
  return {
    currentMode: gridMode,
    modes,
    setMode: setGridMode,
  };
}

// Re-export grid mode type for external use
export type { GridMode };
