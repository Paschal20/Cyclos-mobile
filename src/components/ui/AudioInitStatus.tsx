/**
 * Audio Initialization Status Component
 * Shows toast notifications for audio initialization state
 * Provides user feedback when audio fails to initialize
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAudioEngine } from '../../hooks/useAudioEngine';
import { useLatency } from '../../hooks/useLatency';
import { useAppStore } from '../../store/useAppStore';

export function AudioInitStatus() {
  const { colors } = useTheme();
  const { isReady, audioLatency, usingFallback } = useAudioEngine();
  const { routeType } = useLatency();
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'warning' | 'error'>('success');
  const [message, setMessage] = useState('');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Show appropriate toast based on audio state
    if (!isReady) {
      setToastType('warning');
      setMessage('Initializing audio...');
      setShowToast(true);
    } else if (usingFallback) {
      // Show warning when using fallback (no actual sound)
      setToastType('warning');
      setMessage('Using fallback audio engine (no sound)');
      setShowToast(true);
      
      // Auto-hide after 7 seconds so user can see it
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 7000);
      
      return () => clearTimeout(timer);
    } else if (routeType === 'bluetooth' && audioLatency > 100) {
      setToastType('warning');
      setMessage(`High latency detected (${audioLatency}ms). Consider calibrating.`);
      setShowToast(true);
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    } else if (isReady) {
      setToastType('success');
      setMessage('Audio ready');
      setShowToast(true);
      
      // Auto-hide after 2 seconds
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isReady, routeType, audioLatency, usingFallback]);

  useEffect(() => {
    if (showToast) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setShowToast(false));
    }
  }, [showToast, message]);

  if (!showToast) return null;

  const getBackgroundColor = () => {
    switch (toastType) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
    }
  };

  const getIcon = () => {
    switch (toastType) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          opacity: fadeAnim,
        },
      ]}
    >
      <Text style={styles.icon}>{getIcon()}</Text>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

/**
 * Bluetooth Latency Warning Component
 * Shows a warning banner when high latency is detected
 * Tapping opens the calibration wizard
 */
export function BluetoothLatencyWarning() {
  const { colors } = useTheme();
  const { routeType } = useLatency();
  const { audioLatency } = useAudioEngine();
  const setShowCalibration = useAppStore((s) => s.setShowCalibration);

  if (routeType !== 'bluetooth' || audioLatency <= 100) {
    return null;
  }

  return (
    <TouchableOpacity 
      style={[styles.warningBanner, { backgroundColor: colors.warning }]}
      onPress={() => setShowCalibration(true)}
      activeOpacity={0.8}
    >
      <Text style={styles.warningText}>
        ⚠️ Bluetooth latency: {audioLatency}ms. Tap to calibrate.
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
    color: '#fff',
  },
  message: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  warningBanner: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  warningText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '600',
  },
});
