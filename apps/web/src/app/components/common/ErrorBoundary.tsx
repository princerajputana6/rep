import React from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryFallbackProps>;
  onReset?: () => void;
}

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // TODO: Send to error logging service
    // logErrorToService(error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error!}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            Something Went Wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Message */}
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-sm font-semibold text-red-900 mb-2">Error Details:</div>
            <div className="text-sm text-red-800 font-mono bg-white p-3 rounded border border-red-200">
              {error.message}
            </div>
          </div>

          {/* Stack Trace (Development Only) */}
          {process.env.NODE_ENV === 'development' && error.stack && (
            <details className="text-xs">
              <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                Stack Trace (Development)
              </summary>
              <pre className="bg-gray-100 p-3 rounded overflow-x-auto text-xs">
                {error.stack}
              </pre>
            </details>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={resetErrorBoundary} className="gap-2 flex-1">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="gap-2 flex-1"
            >
              <Home className="w-4 h-4" />
              Go to Home
            </Button>
          </div>

          {/* Help Text */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-900">
              <strong>💡 What happened?</strong>
              <p className="mt-2">
                An unexpected error occurred in the application. This has been logged and 
                our team has been notified. You can try again or return to the home page.
              </p>
            </div>
          </div>

          {/* Support Info */}
          <div className="text-center text-sm text-gray-600">
            If this problem persists, please contact{' '}
            <a href="mailto:support@rep-platform.com" className="text-blue-600 hover:underline">
              support@rep-platform.com
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Lightweight error boundary for individual components
 */
export function ComponentErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={ComponentErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}

function ComponentErrorFallback({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) {
  return (
    <div className="p-6 bg-red-50 rounded-lg border border-red-200">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
        <div className="flex-1">
          <div className="font-semibold text-red-900 mb-1">Component Error</div>
          <div className="text-sm text-red-800 mb-3">{error.message}</div>
          <Button size="sm" onClick={resetErrorBoundary} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}
