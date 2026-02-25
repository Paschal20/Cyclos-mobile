/**
 * Latency Calibration Modal
 * Helps users measure and compensate for audio latency
 * Provides guided wizard flow for accurate calibration
 * 
 * Uses two-tap method for more accurate measurement:
 * 1. First tap starts the sound (user controls when sound plays)
 * 2. Second tap stops and measures directly (no reaction time subtraction needed)
 */
import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Modal, Text, Pressable } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAudioEngine } from '../../hooks/useAudioEngine';
import { useLatency } from '../../hooks/useLatency';
import { useAppStore } from '../../store/useAppStore';

export default function CalibrationWizard() {
  const { colors } = useTheme();
  const { playNote, stopNote } = useAudioEngine();
  const { 
    completeCalibration: saveCalibration,
    currentLatency,
    routeType,
    isCalibrating 
  } = useLatency();
  
  const showCalibration = useAppStore((s) => s.showCalibration);
  const setShowCalibration = useAppStore((s) => s.setShowCalibration);
  const setAudioLatency = useAppStore((s) => s.setAudioLatency);
  
  // step: 0 = instructions, 1 = first tap (start sound), 2 = second tap (stop & measure), 3 = results
  const [step, setStep] = useState(0);
  const [latency, setLatency] = useState(0);
  const soundStartTimeRef = useRef(0);
  
  // Two-tap calibration method:
  // Step 1: First tap - starts the sound and timer (user controls timing)
  const handleFirstTap = useCallback(() => {
    setStep(2);
    soundStartTimeRef.current = Date.now();
    
    // Play the calibration tone
    playNote(440, 0.8); // A4 note at 80% velocity
    
    console.log('[CalibrationWizard] First tap - sound started at', soundStartTimeRef.current);
  }, [playNote]);
  
  // Step 2: Second tap - stops sound and measures latency directly
  const handleSecondTap = useCallback(async () => {
    const tapTime = Date.now();
    
    // Stop the sound
    stopNote(440);
    
    // Measure latency directly - no need to subtract reaction time!
    // This is the key advantage of the two-tap method
    const measuredLatency = tapTime - soundStartTimeRef.current;
    
    console.log('[CalibrationWizard] Second tap - measured latency:', measuredLatency, 'ms');
    
    // Save the calibration
    await saveCalibration(tapTime, soundStartTimeRef.current);
    
    // Use the measured latency directly (no reaction time subtraction)
    setAudioLatency(measuredLatency);
    setLatency(measuredLatency);
    setStep(3);
  }, [saveCalibration, setAudioLatency, stopNote]);
  
  // Handle button click - routes to appropriate step
  const handleTap = useCallback(() => {
    if (step === 1) {
      handleFirstTap();
    } else if (step === 2) {
      handleSecondTap();
    }
  }, [step, handleFirstTap, handleSecondTap]);
  
  // Start calibration - go to first tap step
  const handleStartCalibration = useCallback(() => {
    setStep(1);
    console.log('[CalibrationWizard] Started calibration - waiting for first tap');
  }, []);
  
  // Close wizard and reset state
  const handleClose = useCallback(() => {
    setStep(0);
    setLatency(0);
    setShowCalibration(false);
  }, [setShowCalibration]);
  
  // Reset and recalibrate
  const handleRecalibrate = useCallback(() => {
    setStep(0);
    setLatency(0);
  }, []);
  
  // Get route description for display
  const getRouteDescription = () => {
    switch (routeType) {
      case 'bluetooth':
        return 'Bluetooth Audio (High Latency)';
      case 'wired':
        return 'Wired Audio (Low Latency)';
      default:
        return 'Unknown Audio Route';
    }
  };
  
  // Don't show if not requested
  if (!showCalibration) return null;
  
  return (
    <Modal visible={true} transparent animationType="slide">
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <Text style={[styles.title, { color: colors.text }]}>
            Audio Latency Calibration
          </Text>
          
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {getRouteDescription()}
          </Text>
          
          {step === 0 && (
            <>
              {/* Step 0: Instructions */}
              <Text style={[styles.instructions, { color: colors.textSecondary }]}>
                This wizard uses a two-tap method to measure your device's 
                audio latency with high accuracy.
              </Text>
              
              <Text style={[styles.instructions, { color: colors.textSecondary, marginTop: 12 }]}>
                1. Put on your headphones{'\n'}
                2. Tap "Start" to begin{'\n'}
                3. First tap: starts the sound{'\n'}
                4. Second tap: stops and measures
              </Text>
              
              <Pressable 
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={handleStartCalibration}
              >
                <Text style={styles.buttonText}>Start Calibration</Text>
              </Pressable>
              
              {currentLatency > 0 && (
                <Text style={[styles.currentLatency, { color: colors.textSecondary }]}>
                  Current offset: {currentLatency}ms
                </Text>
              )}
            </>
          )}
          
          {step === 1 && (
            <>
              {/* Step 1: First tap - Start sound */}
              <Text style={[styles.instructions, { color: colors.warning }]}>
                Tap the button to start the calibration tone.
              </Text>
              
              <Pressable 
                style={[styles.tapButton, { backgroundColor: colors.primary }]}
                onPress={handleTap}
                disabled={isCalibrating}
              >
                <Text style={[styles.tapText, { color: '#fff' }]}>
                  TAP TO{'\n'}START TONE
                </Text>
              </Pressable>
              
              <Pressable 
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={handleClose}
              >
                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                  Cancel
                </Text>
              </Pressable>
            </>
          )}
          
          {step === 2 && (
            <>
              {/* Step 2: Second tap - Measure */}
              <Text style={[styles.instructions, { color: colors.warning }]}>
                Tap immediately when you hear the tone!
              </Text>
              
              <Pressable 
                style={[styles.tapButton, { backgroundColor: colors.primary }]}
                onPress={handleTap}
                disabled={isCalibrating}
              >
                <Text style={[styles.tapText, { color: '#fff' }]}>
                  TAP WHEN{'\n'}YOU HEAR IT
                </Text>
              </Pressable>
              
              <Pressable 
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={handleClose}
              >
                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                  Cancel
                </Text>
              </Pressable>
            </>
          )}
          
          {step === 3 && (
            <>
              {/* Step 3: Results */}
              <Text style={[styles.title, { color: colors.success, marginTop: 0 }]}>
                Calibration Complete!
              </Text>
              
              <View style={[styles.resultBox, { backgroundColor: colors.background }]}>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                  Measured Latency
                </Text>
                <Text style={[styles.resultValue, { color: colors.primary }]}>
                  {latency}ms
                </Text>
              </View>
              
              <Text style={[styles.instructions, { color: colors.textSecondary, marginTop: 16 }]}>
                {latency > 100 
                  ? 'High latency detected. Consider using wired headphones for better performance.'
                  : 'Latency is within acceptable range for professional use.'
                }
              </Text>
              
              <View style={styles.buttonRow}>
                <Pressable 
                  style={[styles.button, { backgroundColor: colors.secondary, flex: 1 }]}
                  onPress={handleRecalibrate}
                >
                  <Text style={[styles.buttonText, { color: colors.text }]}>Recalibrate</Text>
                </Pressable>
                
                <Pressable 
                  style={[styles.button, { backgroundColor: colors.primary, flex: 1, marginLeft: 12 }]}
                  onPress={handleClose}
                >
                  <Text style={styles.buttonText}>Done</Text>
                </Pressable>
              </View>
            </>
          )}
          
          {/* Close button (only visible on step 0) */}
          {step === 0 && (
            <Pressable 
              style={[styles.closeButton, { borderColor: colors.border }]}
              onPress={handleClose}
            >
              <Text style={[styles.closeText, { color: colors.textSecondary }]}>
                Close
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 360,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
  },
  tapButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tapText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 14,
  },
  currentLatency: {
    fontSize: 12,
    marginTop: 16,
  },
  resultBox: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  resultLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resultValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginTop: 4,
  },
  closeButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  closeText: {
    fontSize: 14,
  },
});
