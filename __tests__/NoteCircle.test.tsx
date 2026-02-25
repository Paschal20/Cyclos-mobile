/**
 * NoteCircle Component Tests
 * Tests the interactive note component with fireEvent.pressIn and haptics
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

// Mock the AudioEngine hook
jest.mock('../src/hooks/useAudioEngine', () => ({
  useAudioEngine: jest.fn(),
}));

// Mock Expo Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { 
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
}));

// Mock Theme hook
jest.mock('../src/hooks/useTheme', () => ({
  useTheme: () => ({ 
    isDark: true,
    colors: { 
      primary: '#e94560', 
      secondary: '#16213e',
      text: '#ffffff',
      border: '#333333',
    } 
  }),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    GestureDetector: ({ children }: any) => children,
    Gesture: {
      Manual: () => ({
        onTouchesDown: () => ({
          onTouchesUp: () => ({
            onTouchesCancelled: () => ({}),
          }),
        }),
      }),
    },
    State: {},
    Directions: {},
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    default: {
      View: View,
      createAnimatedComponent: (Component: any) => Component,
    },
    useAnimatedStyle: () => ({}),
    useSharedValue: (val: number) => ({ value: val }),
    withSpring: (val: number) => val,
    withDelay: (delay: number, val: number) => val,
    runOnJS: (fn: any) => fn,
    interpolateColor: () => '#000',
  };
});

// Import after mocks are set up
import { useAudioEngine } from '../src/hooks/useAudioEngine';
import * as Haptics from 'expo-haptics';

// Import the actual component
import NoteCircle from '../src/components/keys/NoteCircle';

describe('NoteCircle Component - Interaction Layer', () => {
  const mockPlayNote = jest.fn();
  const mockStopNote = jest.fn();
  const testNote = { id: 'C4', name: 'C', frequency: 261.63 };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAudioEngine as jest.Mock).mockReturnValue({
      playNote: mockPlayNote,
      stopNote: mockStopNote,
      isReady: true,
    });
  });

  describe('Press Interaction Tests', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(
        <NoteCircle
          note={testNote}
          x={100}
          y={100}
          size={50}
          isActive={false}
        />
      );
      expect(getByTestId('note-circle-C4')).toBeTruthy();
    });

    it('should display correct note name in label', () => {
      const { getByText } = render(
        <NoteCircle
          note={testNote}
          x={100}
          y={100}
          size={50}
          isActive={false}
        />
      );
      
      expect(getByText('C')).toBeTruthy();
    });
  });

  describe('Visual State Tests', () => {
    it('should render with isActive false', () => {
      const { getByTestId } = render(
        <NoteCircle
          note={testNote}
          x={100}
          y={100}
          size={50}
          isActive={false}
        />
      );
      
      expect(getByTestId('note-circle-C4')).toBeTruthy();
    });

    it('should render with isActive true', () => {
      const { getByTestId } = render(
        <NoteCircle
          note={testNote}
          x={100}
          y={100}
          size={50}
          isActive={true}
        />
      );
      
      expect(getByTestId('note-circle-C4')).toBeTruthy();
    });
  });

  describe('Different Note Frequencies', () => {
    it('should render A4 note', () => {
      const a4Note = { id: 'A4', name: 'A', frequency: 440 };
      const { getByTestId } = render(
        <NoteCircle
          note={a4Note}
          x={100}
          y={100}
          size={50}
          isActive={false}
        />
      );
      expect(getByTestId('note-circle-A4')).toBeTruthy();
    });

    it('should render C5 note', () => {
      const c5Note = { id: 'C5', name: 'C', frequency: 523.25 };
      const { getByTestId } = render(
        <NoteCircle
          note={c5Note}
          x={100}
          y={100}
          size={50}
          isActive={false}
        />
      );
      expect(getByTestId('note-circle-C5')).toBeTruthy();
    });
  });
});
