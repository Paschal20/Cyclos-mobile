/**
 * Root Layout for Cyclos Mobile
 * Injects Theme, Gesture Handler, and Store providers
 */
import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '../src/theme/ThemeProvider';

interface RootLayoutProps {
  children?: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        <View style={styles.container}>
          {children}
        </View>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
