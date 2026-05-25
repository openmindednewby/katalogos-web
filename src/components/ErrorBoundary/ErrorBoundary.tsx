import React, { Component, type ErrorInfo, type ReactNode } from 'react';

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { loggingService } from '../../lib/logging';
import { captureException } from '../../lib/monitoring';
import { FM } from '../../localization/helpers';
import { TestIds } from '../../shared/testIds';
import { isValueDefined } from '../../utils/is';

const CONTAINER_BACKGROUND_COLOR = '#f8f9fa';
const TITLE_TEXT_COLOR = '#212529';
const MESSAGE_TEXT_COLOR = '#6c757d';
const ERROR_DETAILS_BACKGROUND_COLOR = '#fff3cd';
const ERROR_DETAILS_TEXT_COLOR = '#856404';
const BUTTON_BACKGROUND_COLOR = '#007bff';
const BUTTON_TEXT_COLOR = '#ffffff';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: CONTAINER_BACKGROUND_COLOR,
  },
  content: {
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TITLE_TEXT_COLOR,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: MESSAGE_TEXT_COLOR,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorDetails: {
    backgroundColor: ERROR_DETAILS_BACKGROUND_COLOR,
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: ERROR_DETAILS_TEXT_COLOR,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: ERROR_DETAILS_TEXT_COLOR,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: BUTTON_BACKGROUND_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: BUTTON_TEXT_COLOR,
    fontSize: 16,
    fontWeight: '600',
  },
});

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary component that catches JavaScript errors in child components.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * With custom fallback:
 * ```tsx
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    loggingService.fatal('ErrorBoundary', 'Uncaught React error', error, {
      componentStack: errorInfo.componentStack,
    });

    captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    });

    // Call optional error handler
    if (typeof this.props.onError === 'function')
      this.props.onError(error, errorInfo);

  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (isValueDefined(this.props.fallback)) 
        return this.props.fallback;
      

      // Default fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>{FM('errorBoundary.title')}</Text>
            <Text style={styles.message}>
              {FM('errorBoundary.message')}
            </Text>
            {__DEV__ && isValueDefined(this.state.error) ? <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>{FM('errorBoundary.errorDetails')}</Text>
                <Text style={styles.errorText}>{this.state.error.message}</Text>
              </View> : null}
            <TouchableOpacity
              accessibilityHint={FM('errorBoundary.tryAgainHint')}
              accessibilityLabel={FM('errorBoundary.tryAgain')}
              accessibilityRole="button"
              style={styles.button}
              testID={TestIds.ERROR_BOUNDARY_RETRY_BUTTON}
              onPress={this.handleRetry}
            >
              <Text style={styles.buttonText}>{FM('errorBoundary.tryAgain')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
