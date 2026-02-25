/**
 * Physics & Math Layer Tests
 * Tests the core audio frequency calculations and geometry functions
 */
import { midiToFrequency, frequencyToMidi, midiToNoteName, isBlackKey, noteNameToFrequency } from '../src/lib/math';
import { polarToCartesian, polarToCartesianFromCenter, getWedgePoints } from '../src/lib/geometry';

describe('Physics & Math Layer', () => {
  describe('Audio Frequencies (A440 Tuning)', () => {
    // Arrange
    const A4_MIDI = 69;
    const C4_MIDI = 60; // Middle C

    it('should correctly calculate A4 as 440Hz', () => {
      // Act
      const freq = midiToFrequency(A4_MIDI);
      
      // Assert
      expect(freq).toBe(440);
    });

    it('should correctly calculate Middle C (C4) as ~261.63Hz', () => {
      // Act
      const freq = midiToFrequency(C4_MIDI);
      
      // Assert
      expect(freq).toBeCloseTo(261.625565, 4); 
    });

    it('should perfectly reverse frequency back to MIDI note', () => {
      // Act
      const midi = frequencyToMidi(440);
      
      // Assert
      expect(midi).toBe(A4_MIDI);
    });

    it('should handle octave jumps correctly', () => {
      // A5 should be exactly twice A4 frequency
      const a4Freq = midiToFrequency(69);
      const a5Freq = midiToFrequency(81); // A5 is 12 semitones above A4
      
      expect(a5Freq).toBeCloseTo(a4Freq * 2, 4);
    });

    it('should correctly identify note names', () => {
      expect(midiToNoteName(60)).toBe('C4');
      expect(midiToNoteName(69)).toBe('A4');
      expect(midiToNoteName(72)).toBe('C5');
    });

    it('should correctly identify black keys', () => {
      // C4 = 60 (C - white), C#4 = 61 (C# - black)
      expect(isBlackKey(60)).toBe(false);
      expect(isBlackKey(61)).toBe(true);
      expect(isBlackKey(62)).toBe(false); // D
      expect(isBlackKey(63)).toBe(true);  // D#
    });

    it('should convert note names to frequencies', () => {
      expect(noteNameToFrequency('A4')).toBe(440);
      expect(noteNameToFrequency('C4')).toBeCloseTo(261.63, 2);
    });
  });

  describe('Circular Geometry', () => {
    it('should map 0 degrees (right) to correct Cartesian coordinates', () => {
      // Arrange
      const radius = 100;
      const angle = 0; // 0 degrees in radians
      
      // Act
      const { x, y } = polarToCartesian(radius, angle);
      
      // Assert
      expect(x).toBeCloseTo(100, 5);
      expect(y).toBeCloseTo(0, 5);
    });

    it('should map 90 degrees (bottom) to correct Cartesian coordinates', () => {
      // Arrange
      const radius = 100;
      const angle = Math.PI / 2; // 90 degrees in radians
      
      // Act
      const { x, y } = polarToCartesian(radius, angle);
      
      // Assert
      expect(x).toBeCloseTo(0, 5);
      expect(y).toBeCloseTo(100, 5);
    });

    it('should map -90 degrees (top in SVG coordinates) correctly', () => {
      // Arrange
      const radius = 100;
      const angle = -Math.PI / 2; // -90 degrees in radians (top of circle in SVG)
      
      // Act
      const { x, y } = polarToCartesian(radius, angle);
      
      // Assert
      expect(x).toBeCloseTo(0, 5);
      expect(y).toBeCloseTo(-100, 5);
    });

    it('should correctly calculate position from center point', () => {
      // Arrange
      const centerX = 150;
      const centerY = 150;
      const radius = 50;
      const angle = 0; // Right from center
      
      // Act
      const { x, y } = polarToCartesianFromCenter(centerX, centerY, radius, angle);
      
      // Assert
      expect(x).toBeCloseTo(200, 5); // 150 + 50
      expect(y).toBeCloseTo(150, 5);
    });

    it('should generate accurate wedge paths without array mutations', () => {
      // Arrange
      const centerX = 150;
      const centerY = 150;
      
      // Act
      const points = getWedgePoints(centerX, centerY, 50, 100, 0, Math.PI / 6);
      
      // Assert
      expect(points.length).toBeGreaterThan(0);
      expect(points[0]).toHaveProperty('x');
      expect(points[0]).toHaveProperty('y');
      // Should have inner circle points + outer circle points (21 + 21 = 42)
      expect(points.length).toBe(42);
    });

    it('should generate symmetric wedge for equal positive and negative angles', () => {
      // Arrange
      const centerX = 100;
      const centerY = 100;
      
      // Act - symmetric wedge from -30 to +30 degrees
      const points = getWedgePoints(centerX, centerY, 50, 80, -Math.PI / 6, Math.PI / 6);
      
      // Assert - points should be symmetric around the center angle (0)
      expect(points.length).toBe(42); // 21 inner + 21 outer points
      
      // First inner point should mirror last inner point
      const innerPoints = points.slice(0, 21);
      expect(innerPoints[0].x).toBeCloseTo(innerPoints[20].x, 2);
    });
  });
});
