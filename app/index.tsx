/**
 * Main Playable Screen (UI assembly)
 * This is the main entry point for the playable interface
 * 
 * Production-ready with error boundaries and unified grid
 */
import React from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import { useAppStore } from '../src/store/useAppStore';
import { useTheme } from '../src/hooks/useTheme';

// Import unified grid component
import UnifiedGrid, { UnifiedPerformanceGrid } from '../src/components/grid/UnifiedGrid';

// UI components
import StartOverlay from '../src/components/ui/StartOverlay';
import SettingsDrawer from '../src/components/ui/SettingsDrawer';
import CalibrationWizard from '../src/components/ui/CalibrationWizard';
import MobileAudioDebug from '../src/components/ui/MobileAudioDebug';
import ThemeToggle from '../src/components/ui/ThemeToggle';
import { AudioHealthMonitor } from '../src/components/ui/AudioHealthMonitor';
import { AudioInitStatus, BluetoothLatencyWarning } from '../src/components/ui/AudioInitStatus';
import { ErrorBoundary } from '../src/components/ui/ErrorBoundary';

export default function PlayableScreen() {
  const { 
    gridMode,
    isAudioReady,
    settingsOpen,
    showCalibration,
    debugMode,
    hasStarted
  } = useAppStore();
  
  const { colors } = useTheme();

  // Show start overlay if not started
  if (!hasStarted) {
    return <StartOverlay />;
  }

  // Determine which grid to render based on mode
  const renderGrid = () => {
    // Performance mode uses Skia for GPU acceleration
    if (gridMode === 'circular') {
      return <UnifiedGrid />;
    }
    return <UnifiedGrid />;
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Cyclos</Text>
          <ThemeToggle />
        </View>
        
        <View style={styles.gridContainer}>
          {renderGrid()}
        </View>

        {/* Audio status toasts */}
        <AudioInitStatus />
        
        {/* Bluetooth latency warning */}
        <BluetoothLatencyWarning />
        
        {/* Audio health monitor for debug mode */}
        <AudioHealthMonitor />
        
        {/* Debug overlay for development */}
        {debugMode && <MobileAudioDebug />}
        
        {/* Settings drawer */}
        {settingsOpen && <SettingsDrawer />}
        
        {/* Calibration wizard */}
        {showCalibration && <CalibrationWizard />}
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
