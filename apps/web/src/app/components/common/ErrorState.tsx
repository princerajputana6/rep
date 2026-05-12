/**
 * Reusable Error State Component
 * Used across all modules for consistent error handling
 */

import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
  onGoHome?: () => void;
  fullScreen?: boolean;
}

export function ErrorState({ 
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  error,
  onRetry,
  onGoHome,
  fullScreen = false
}: ErrorStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-1">{message}</p>
        {error && (
          <p className="text-xs text-gray-500 font-mono mt-2 p-2 bg-gray-50 rounded">
            {typeof error === 'string' ? error : error.message}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        {onRetry && (
          <Button onClick={onRetry} variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        {onGoHome && (
          <Button onClick={onGoHome} variant="outline">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  );
}

// Network error specific
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Network Error"
      message="Unable to connect to the server. Please check your internet connection."
      onRetry={onRetry}
    />
  );
}

// Permission error
export function PermissionError() {
  return (
    <ErrorState
      title="Access Denied"
      message="You don't have permission to view this content. Please contact your administrator."
    />
  );
}

// Not found error
export function NotFoundError({ onGoHome }: { onGoHome?: () => void }) {
  return (
    <ErrorState
      title="Not Found"
      message="The resource you're looking for doesn't exist or has been removed."
      onGoHome={onGoHome}
    />
  );
}
