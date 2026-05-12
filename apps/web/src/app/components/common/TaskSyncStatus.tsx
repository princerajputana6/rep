import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import { RefreshCw, CheckCircle2, AlertTriangle, Clock, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

interface TaskSyncStatusProps {
  projectId?: string;
  projectName?: string;
  taskCount?: number;
  lastSynced?: string;
  syncStatus?: 'synced' | 'pending' | 'error' | 'never';
  onSync?: () => void;
}

export function TaskSyncStatus({
  projectId,
  projectName,
  taskCount = 0,
  lastSynced,
  syncStatus = 'never',
  onSync,
}: TaskSyncStatusProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    
    // Simulate sync API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (onSync) {
      onSync();
    }
    
    toast.success('Tasks synced successfully from PPM tool!');
    setIsSyncing(false);
  };

  const getStatusBadge = () => {
    switch (syncStatus) {
      case 'synced':
        return (
          <Badge className="bg-green-500 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Synced
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-blue-500 gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-500 gap-1">
            <AlertTriangle className="w-3 h-3" />
            Sync Error
          </Badge>
        );
      case 'never':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            Not Synced
          </Badge>
        );
    }
  };

  const getLastSyncedText = () => {
    if (!lastSynced) return 'Never synced';
    
    const syncDate = new Date(lastSynced);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - syncDate.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (!projectId) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 h-auto py-1 px-2">
          <LinkIcon className="w-3 h-3" />
          {getStatusBadge()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          {/* Header */}
          <div>
            <div className="font-semibold text-gray-900">PPM Project Sync Status</div>
            <div className="text-xs text-gray-600 mt-1">
              Track task synchronization from your PPM tool
            </div>
          </div>

          {/* Project Info */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm font-semibold text-blue-900">{projectName}</div>
                <div className="text-xs text-blue-700 mt-1">
                  Project ID: {projectId}
                </div>
              </div>
              <Badge variant="outline" className="ml-2">
                {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
              </Badge>
            </div>
          </div>

          {/* Sync Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Status</span>
              {getStatusBadge()}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Last synced</span>
              <span className="font-medium text-gray-900">{getLastSyncedText()}</span>
            </div>
          </div>

          {/* Sync Details */}
          {syncStatus === 'error' && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                <div className="text-xs text-red-800">
                  Failed to sync tasks. The PPM tool may be unavailable or authentication may have expired.
                </div>
              </div>
            </div>
          )}

          {syncStatus === 'pending' && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-800">
                  Sync in progress. Task updates will appear shortly.
                </div>
              </div>
            </div>
          )}

          {/* Sync Actions */}
          <div className="space-y-2">
            <Button
              size="sm"
              className="w-full gap-2"
              onClick={handleSync}
              disabled={isSyncing}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
            
            <div className="text-xs text-gray-500 text-center">
              {syncStatus === 'synced' 
                ? 'Tasks are up to date with PPM tool'
                : 'Click to refresh task data from PPM tool'}
            </div>
          </div>

          {/* Auto-sync Info */}
          <div className="p-2 bg-gray-50 rounded text-xs text-gray-600">
            💡 Tip: Tasks auto-sync every 15 minutes
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
