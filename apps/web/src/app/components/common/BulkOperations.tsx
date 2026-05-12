import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/app/components/ui/dropdown-menu';
import { Badge } from '@/app/components/ui/badge';
import { Archive, Trash2, CheckSquare, MoreVertical, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface BulkOperationsBarProps {
  selectedCount: number;
  onArchiveSelected: () => void;
  onDeleteSelected: () => void;
  onRestoreSelected?: () => void;
  onClearSelection: () => void;
  showRestore?: boolean;
}

export function BulkOperationsBar({
  selectedCount,
  onArchiveSelected,
  onDeleteSelected,
  onRestoreSelected,
  onClearSelection,
  showRestore = false,
}: BulkOperationsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom">
      <div className="bg-blue-600 text-white rounded-full shadow-2xl px-6 py-3 flex items-center gap-4 border-2 border-blue-400">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5" />
          <span className="font-semibold">
            {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
          </span>
        </div>

        <div className="h-6 w-px bg-blue-400" />

        <div className="flex items-center gap-2">
          {showRestore ? (
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={onRestoreSelected}
                className="gap-2 bg-green-500 hover:bg-green-600 text-white"
              >
                <RefreshCw className="w-4 h-4" />
                Restore
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={onDeleteSelected}
                className="gap-2 bg-red-500 hover:bg-red-600 text-white"
              >
                <Trash2 className="w-4 h-4" />
                Delete Permanently
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={onArchiveSelected}
              className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Archive className="w-4 h-4" />
              Archive
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
            className="text-white hover:bg-blue-700"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

interface BulkSelectCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function BulkSelectCheckbox({ checked, onCheckedChange }: BulkSelectCheckboxProps) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="border-2"
    />
  );
}
