import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent } from '@/app/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import { History, User, Clock, RotateCcw, Eye, GitBranch } from 'lucide-react';
import { toast } from 'sonner';

interface VersionHistoryEntry {
  id: string;
  version: number;
  timestamp: string;
  user: {
    name: string;
    email: string;
  };
  action: string;
  changes: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  snapshot?: any; // Full campaign state at this version
}

interface VersionHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName: string;
  history: VersionHistoryEntry[];
  onRestore: (versionId: string) => void;
  onViewVersion: (versionId: string) => void;
}

export function VersionHistory({
  open,
  onOpenChange,
  campaignName,
  history,
  onRestore,
  onViewVersion,
}: VersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const handleRestore = (versionId: string, version: number) => {
    if (confirm(`Restore campaign to version ${version}? Current changes will be saved as a new version.`)) {
      onRestore(versionId);
      onOpenChange(false);
      toast.success(`Campaign restored to version ${version}`);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-500';
      case 'updated':
        return 'bg-blue-500';
      case 'status_changed':
        return 'bg-purple-500';
      case 'archived':
        return 'bg-amber-500';
      case 'restored':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            Version History
          </DialogTitle>
          <DialogDescription>
            View and restore previous versions of "{campaignName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-900">
              <strong>{history.length}</strong> versions • Latest version: {history[0]?.version}
            </div>
            <div className="text-xs text-blue-700 mt-1">
              All changes are tracked automatically. You can restore any previous version.
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            {history.map((entry, index) => (
              <Card
                key={entry.id}
                className={`${
                  selectedVersion === entry.id ? 'border-blue-500 bg-blue-50' : ''
                } ${index === 0 ? 'border-2 border-green-500' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Timeline Indicator */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full ${getActionColor(entry.action)} flex items-center justify-center text-white font-bold text-xs`}
                      >
                        v{entry.version}
                      </div>
                      {index < history.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-200 mt-2" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getActionColor(entry.action)}>
                            {entry.action.replace('_', ' ')}
                          </Badge>
                          {index === 0 && (
                            <Badge className="bg-green-500">Current Version</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(entry.timestamp)}
                        </div>
                      </div>

                      {/* User */}
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{entry.user.name}</span>
                        <span className="text-gray-600">({entry.user.email})</span>
                      </div>

                      {/* Changes */}
                      {entry.changes.length > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs font-semibold text-gray-700 mb-2">
                            Changes:
                          </div>
                          <div className="space-y-1">
                            {entry.changes.map((change, i) => (
                              <div key={i} className="text-xs">
                                <span className="font-medium text-gray-900">
                                  {change.field}:
                                </span>{' '}
                                <span className="text-red-600 line-through">
                                  {String(change.oldValue)}
                                </span>{' '}
                                → <span className="text-green-600">{String(change.newValue)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {index > 0 && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewVersion(entry.id)}
                            className="gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestore(entry.id, entry.version)}
                            className="gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Restore
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {history.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <div className="font-semibold text-gray-900 mb-2">No version history yet</div>
                <div className="text-sm text-gray-600">
                  Changes will be tracked automatically as you edit this campaign
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
