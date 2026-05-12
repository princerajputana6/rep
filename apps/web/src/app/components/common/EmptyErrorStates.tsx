import { 
  AlertCircle, 
  Wifi, 
  FileText, 
  Inbox, 
  Search,
  Database,
  RefreshCw,
  Plus,
  Filter as FilterIcon,
  Clock
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';

interface EmptyStateProps {
  type: 'no-data' | 'no-results' | 'no-campaigns' | 'no-templates' | 'no-archived';
  searchTerm?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyState({ type, searchTerm, onAction, actionLabel }: EmptyStateProps) {
  const states: Record<string, { icon: ReactNode; title: string; description: string; showAction: boolean; defaultActionLabel?: string }> = {
    'no-data': {
      icon: <Inbox className="w-16 h-16 text-gray-300" />,
      title: 'No data available',
      description: 'There is currently no data to display.',
      showAction: false,
    },
    'no-results': {
      icon: <Search className="w-16 h-16 text-gray-300" />,
      title: 'No results found',
      description: searchTerm 
        ? `No results found for "${searchTerm}". Try adjusting your search or filters.`
        : 'No results match your current filters. Try adjusting your criteria.',
      showAction: true,
      defaultActionLabel: 'Clear Filters',
    },
    'no-campaigns': {
      icon: <FileText className="w-16 h-16 text-gray-300" />,
      title: 'No campaigns yet',
      description: 'Get started by creating your first campaign or using a template.',
      showAction: true,
      defaultActionLabel: 'Create Campaign',
    },
    'no-templates': {
      icon: <Inbox className="w-16 h-16 text-gray-300" />,
      title: 'No templates available',
      description: 'Create a template from an existing campaign or start from scratch.',
      showAction: true,
      defaultActionLabel: 'Create Template',
    },
    'no-archived': {
      icon: <Clock className="w-16 h-16 text-gray-300" />,
      title: 'Recycle Bin is empty',
      description: 'Archived campaigns will appear here and can be restored within 30 days.',
      showAction: false,
    },
  };

  const state = states[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-6">{state.icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{state.title}</h3>
      <p className="text-gray-600 text-center max-w-md mb-6">{state.description}</p>
      {state.showAction && onAction && (
        <Button onClick={onAction} className="gap-2">
          <Plus className="w-4 h-4" />
          {actionLabel || state.defaultActionLabel}
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  type: 'network' | 'api' | 'permission' | 'generic';
  error?: Error | string;
  onRetry?: () => void;
}

export function ErrorState({ type, error, onRetry }: ErrorStateProps) {
  const states = {
    network: {
      icon: <Wifi className="w-16 h-16 text-red-300" />,
      title: 'Connection Error',
      description: 'Unable to connect to the server. Please check your internet connection.',
    },
    api: {
      icon: <Database className="w-16 h-16 text-red-300" />,
      title: 'API Error',
      description: 'Something went wrong while fetching data. Please try again.',
    },
    permission: {
      icon: <AlertCircle className="w-16 h-16 text-amber-300" />,
      title: 'Permission Denied',
      description: 'You do not have permission to perform this action.',
    },
    generic: {
      icon: <AlertCircle className="w-16 h-16 text-red-300" />,
      title: 'Something went wrong',
      description: 'An unexpected error occurred. Please try again later.',
    },
  };

  const state = states[type];
  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-6">{state.icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{state.title}</h3>
      <p className="text-gray-600 text-center max-w-md mb-2">{state.description}</p>
      {errorMessage && (
        <p className="text-sm text-gray-500 text-center max-w-md mb-6 font-mono bg-gray-100 p-2 rounded">
          {errorMessage}
        </p>
      )}
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

interface LoadingSkeletonProps {
  type: 'table' | 'cards' | 'form';
  rows?: number;
}

export function LoadingSkeleton({ type, rows = 5 }: LoadingSkeletonProps) {
  if (type === 'table') {
    return (
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: rows }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-full"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
        <div className="h-32 bg-gray-200 rounded w-full"></div>
        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  return null;
}

interface DataFetchWrapperProps {
  isLoading: boolean;
  error?: Error | string | null;
  isEmpty?: boolean;
  emptyType?: EmptyStateProps['type'];
  errorType?: ErrorStateProps['type'];
  onRetry?: () => void;
  onEmptyAction?: () => void;
  emptyActionLabel?: string;
  searchTerm?: string;
  loadingType?: LoadingSkeletonProps['type'];
  children: ReactNode;
}

export function DataFetchWrapper({
  isLoading,
  error,
  isEmpty,
  emptyType = 'no-data',
  errorType = 'generic',
  onRetry,
  onEmptyAction,
  emptyActionLabel,
  searchTerm,
  loadingType = 'table',
  children,
}: DataFetchWrapperProps) {
  if (isLoading) {
    return <LoadingSkeleton type={loadingType} />;
  }

  if (error) {
    return <ErrorState type={errorType} error={error} onRetry={onRetry} />;
  }

  if (isEmpty) {
    return (
      <EmptyState
        type={emptyType}
        searchTerm={searchTerm}
        onAction={onEmptyAction}
        actionLabel={emptyActionLabel}
      />
    );
  }

  return <>{children}</>;
}
