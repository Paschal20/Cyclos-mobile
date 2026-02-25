/**
 * Audio Health Monitor Component
 * Real-time hardware diagnostics dashboard
 * Shows latency, route type, and sync status
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLatencyStatus } from '../../hooks/useLatency';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../store/useAppStore';

export function AudioHealthMonitor() {
  const { colors } = useTheme();
  const { currentLatency, routeType, isHealthy, status } = useLatencyStatus();
  const debugMode = useAppStore((s) => s.debugMode);

  if (!debugMode) return null;

  // Determine indicator color based on latency health
  const getIndicatorColor = () => {
    if (currentLatency < 30) return colors.success; // Green - Pro grade
    if (currentLatency < 80) return colors.warning; // Yellow - Acceptable
    return colors.error; // Red - High latency
  };

  // Get route icon
  const getRouteIcon = () => {
    switch (routeType) {
      case 'wired':
        return '🔌';
      case 'bluetooth':
        return '📶';
      default:
        return '❓';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Status Indicator */}
      <View style={[styles.indicator, { backgroundColor: getIndicatorColor() }]} />
      
      {/* Route Info */}
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.routeIcon]}>{getRouteIcon()}</Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {routeType.toUpperCase()} MODE
          </Text>
        </View>
        
        <View style={styles.row}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            System Lag: {currentLatency}ms
          </Text>
          <Text style={[styles.status, { color: getIndicatorColor() }]}>
            {status}
          </Text>
        </View>
        
        {/* Latency Bar */}
        <View style={styles.latencyBar}>
          <View 
            style={[
              styles.latencyFill, 
              { 
                backgroundColor: getIndicatorColor(),
                width: `${Math.min(100, (currentLatency / 300) * 100)}%` 
              }
            ]} 
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 180,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  indicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  content: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 11,
  },
  status: {
    fontSize: 10,
    fontWeight: '600',
  },
  latencyBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  latencyFill: {
    height: '100%',
    borderRadius: 2,
  },
});
