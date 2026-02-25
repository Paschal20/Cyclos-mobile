import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useTheme } from '../shared/hooks/useTheme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onRetry?: () => void;
}

function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  const { colors } = useTheme();

  return (
    <View style={[containerStyles.container, { backgroundColor: colors.background }]}>
      <View style={[containerStyles.errorBox, { backgroundColor: colors.surface }]}>
        <Text style={[containerStyles.icon]}>!</Text>
        
        <Text style={[containerStyles.title, { color: colors.error }]}>
          Something went wrong
        </Text>
        
        <Text style={[containerStyles.message, { color: colors.textSecondary }]}>
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </Text>

        {onRetry && (
          <Pressable
            style={[containerStyles.button, { backgroundColor: colors.primary }]}
            onPress={onRetry}
          >
            <Text style={containerStyles.buttonText}>Try Again</Text>
          </Pressable>
        )}
        
        <Pressable
          style={[containerStyles.button, { backgroundColor: colors.secondary, marginTop: 12 }]}
          onPress={() => Alert.alert(
            'Report Issue',
            'Would you like to report this issue?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Report', onPress: () => console.log('Error reported:', error) },
            ]
          )}
        >
          <Text style={[containerStyles.buttonText, { color: colors.text }]}>Report Issue</Text>
        </Pressable>
      </View>
    </View>
  );
}

const containerStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorBox: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    maxWidth: 320,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

interface LoadingFallbackProps {
  message?: string;
}

export function LoadingFallback({ message = 'Loading...' }: LoadingFallbackProps) {
  const { colors } = useTheme();

  return (
    <View style={[loadingStyles.container, { backgroundColor: colors.background }]}>
      <View style={[loadingStyles.loadingBox, { backgroundColor: colors.surface }]}>
        <Text style={[loadingStyles.loadingText, { color: colors.text }]}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
