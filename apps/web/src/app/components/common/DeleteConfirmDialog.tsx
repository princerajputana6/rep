import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import { AlertTriangle, Archive, Trash2 } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemType: 'campaign' | 'template' | 'resource';
  onArchive: () => void;
  onPermanentDelete: () => void;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemName,
  itemType,
  onArchive,
  onPermanentDelete,
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Delete {itemType}?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 pt-4">
            <div className="text-base">
              You're about to delete <span className="font-semibold text-gray-900">"{itemName}"</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              {/* Archive Option */}
              <div className="p-4 border-2 border-amber-200 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Archive className="w-5 h-5 text-amber-600" />
                  <div className="font-semibold text-amber-900">Archive (Recommended)</div>
                </div>
                <Badge className="mb-3 bg-green-500">Reversible</Badge>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>✓ Can be restored within 30 days</li>
                  <li>✓ Data is preserved</li>
                  <li>✓ Audit trail maintained</li>
                  <li>✓ Safer option</li>
                </ul>
              </div>

              {/* Permanent Delete Option */}
              <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <div className="font-semibold text-red-900">Permanent Delete</div>
                </div>
                <Badge variant="destructive" className="mb-3">
                  Irreversible
                </Badge>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>✗ Cannot be undone</li>
                  <li>✗ All data will be lost</li>
                  <li>✗ No recovery option</li>
                  <li>✗ Use with caution</li>
                </ul>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mt-4">
              <div className="text-sm text-blue-900">
                <strong>💡 Best Practice:</strong> Archive items first to ensure you don't need them. Permanently
                delete only when absolutely certain.
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onArchive}
            className="bg-amber-500 hover:bg-amber-600 gap-2"
          >
            <Archive className="w-4 h-4" />
            Archive
          </AlertDialogAction>
          <AlertDialogAction
            onClick={onPermanentDelete}
            className="bg-red-600 hover:bg-red-700 gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Permanent Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
