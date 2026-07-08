import React, { Component, type ErrorInfo, type ReactNode } from 'react';

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { loggingService } from '../../lib/logging';
import { captureException } from '../../lib/monitoring';
import { FM } from '../../localization/helpers';
import { TestIds } from '../../shared/testIds';
import {
  attemptChunkRecovery,
  clearChunkRecoveryFlag,
  isChunkLoadError,
  reloadPage,
} from '../../utils/chunkLoadRecovery';
import { isValueDefined } from '../../utils/is';

const CONTAINER_BACKGROUND_COLOR = '#f8f9fa';
const TITLE_TEXT_COLOR = '#212529';
const MESSAGE_TEXT_COLOR = '#6c757d';
const ERROR_DETAILS_BACKGROUND_COLOR = '#fff3cd';
const ERROR_DETAILS_TEXT_COLOR = '#856404';
const BUTTON_BACKGROUND_COLOR = '#007bff';
const BUTTON_TEXT_COLOR = '#ffffff';
const SECONDARY_BUTTON_BACKGROUND_COLOR = '#e9ecef';
const SECONDARY_BUTTON_TEXT_COLOR = '#212529';

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
  secondaryButton: {
    backgroundColor: SECONDARY_BUTTON_BACKGROUND_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  secondaryButtonText: {
    color: SECONDARY_BUTTON_TEXT_COLOR,
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
  isChunkError: boolean;
  recovering: boolean;
}

/**
 * React Error Boundary that catches JavaScript errors in child components.
 *
 * Beyond the generic "Something went wrong" fallback it:
 *  - auto-recovers from stale-chunk failures after a deploy (`ChunkLoadError` /
 *    failed dynamic import) with a ONE-SHOT guarded reload (see
 *    `chunkLoadRecovery`), so a 404'd chunk never surfaces as a dead screen; and
 *  - always offers a manual **Reload** action in addition to **Try Again**.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, isChunkError: false, recovering: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error, isChunkError: isChunkLoadError(error) };
  }

  componentDidMount(): void {
    // A clean mount (no error) means the current chunks loaded — release the
    // one-shot guard so a FUTURE deploy can auto-recover again.
    if (!this.state.hasError) clearChunkRecoveryFlag();
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    loggingService.fatal('ErrorBoundary', 'Uncaught React error', error, {
      componentStack: errorInfo.componentStack,
    });

    captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    });

    // Stale-chunk after a deploy: try a single guarded reload before showing UI.
    if (isChunkLoadError(error) && attemptChunkRecovery()) {
      this.setState({ recovering: true });
      return;
    }

    // Call optional error handler
    if (typeof this.props.onError === 'function')
      this.props.onError(error, errorInfo);

  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, isChunkError: false, recovering: false });
  };

  handleReload = (): void => {
    reloadPage();
  };

  render(): ReactNode {
    if (this.state.recovering)
      return (
        <View style={styles.container} testID={TestIds.ERROR_BOUNDARY_UPDATING}>
          <View style={styles.content}>
            <Text style={styles.message}>{FM('errorBoundary.updating')}</Text>
          </View>
        </View>
      );


    if (this.state.hasError) {
      // Use custom fallback if provided
      if (isValueDefined(this.props.fallback))
        return this.props.fallback;


      const { isChunkError } = this.state;
      const title = isChunkError ? FM('errorBoundary.updateTitle') : FM('errorBoundary.title');
      const message = isChunkError ? FM('errorBoundary.updateMessage') : FM('errorBoundary.message');
      const showErrorDetails = __DEV__ && !isChunkError && isValueDefined(this.state.error);

      // Default fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            {showErrorDetails && isValueDefined(this.state.error) ? <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>{FM('errorBoundary.errorDetails')}</Text>
                <Text style={styles.errorText}>{this.state.error.message}</Text>
              </View> : null}
            <TouchableOpacity
              accessibilityHint={FM('errorBoundary.reloadHint')}
              accessibilityLabel={FM('errorBoundary.reload')}
              accessibilityRole="button"
              style={styles.button}
              testID={TestIds.ERROR_BOUNDARY_RELOAD_BUTTON}
              onPress={this.handleReload}
            >
              <Text style={styles.buttonText}>{FM('errorBoundary.reload')}</Text>
            </TouchableOpacity>
            {isChunkError ? null : (
              <TouchableOpacity
                accessibilityHint={FM('errorBoundary.tryAgainHint')}
                accessibilityLabel={FM('errorBoundary.tryAgain')}
                accessibilityRole="button"
                style={styles.secondaryButton}
                testID={TestIds.ERROR_BOUNDARY_RETRY_BUTTON}
                onPress={this.handleRetry}
              >
                <Text style={styles.secondaryButtonText}>{FM('errorBoundary.tryAgain')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
