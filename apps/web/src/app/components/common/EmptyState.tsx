/**
 * Reusable Empty State Component
 * Used across all modules for consistent empty state UX
 */

import { LucideIcon, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  variant?: 'default' | 'search' | 'filter';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  variant = 'default',
}: EmptyStateProps) {
  // Default icons based on variant
  const DefaultIcon = Icon || (
    variant === 'search' ? Search :
    variant === 'filter' ? Filter :
    Plus
  );

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <DefaultIcon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 text-center max-w-md mb-6">{description}</p>
      {(onAction || onSecondaryAction) && (
        <div className="flex gap-3">
          {onAction && actionLabel && (
            <Button onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {onSecondaryAction && secondaryActionLabel && (
            <Button onClick={onSecondaryAction} variant="outline">
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Predefined empty states
export function NoResultsFound({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <EmptyState
      variant="search"
      title="No results found"
      description="We couldn't find any items matching your search criteria. Try adjusting your filters or search terms."
      actionLabel={onClearFilters ? "Clear Filters" : undefined}
      onAction={onClearFilters}
    />
  );
}

export function NoDataYet({ 
  title, 
  description, 
  actionLabel, 
  onAction 
}: { 
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      actionLabel={actionLabel}
      onAction={onAction}
    />
  );
}
