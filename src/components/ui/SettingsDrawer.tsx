import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Switch } from 'react-native';
import { useAppStore } from '../../store/useAppStore';

export default function SettingsDrawer() {
  const settingsOpen = useAppStore((s) => s.settingsOpen);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
  const debugMode = useAppStore((s) => s.debugMode);
  const setDebugMode = useAppStore((s) => s.setDebugMode);
  const showCalibration = useAppStore((s) => s.showCalibration);
  const setShowCalibration = useAppStore((s) => s.setShowCalibration);

  return (
    <Modal visible={settingsOpen} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.drawer}>
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <TouchableOpacity onPress={() => setSettingsOpen(false)}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Debug Mode</Text>
            <Switch value={debugMode} onValueChange={setDebugMode} />
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Calibrate Audio</Text>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => { setShowCalibration(true); setSettingsOpen(false); }}
            >
              <Text style={styles.buttonText}>Run</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  drawer: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  close: {
    fontSize: 24,
    color: '#888',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  label: {
    fontSize: 16,
    color: '#fff',
  },
  button: {
    backgroundColor: '#e94560',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
