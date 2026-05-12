import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Avatar } from '@/app/components/ui/avatar';
import {
  User,
  CheckCircle2,
  XCircle,
  Users,
  FolderKanban,
  ArrowLeftRight,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Clock,
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'approval' | 'rejection' | 'creation' | 'update' | 'deletion' | 'comment' | 'assignment';
  user: string;
  userAvatar?: string;
  action: string;
  target: string;
  timestamp: string;
  metadata?: {
    poolName?: string;
    resourceName?: string;
    projectName?: string;
    comment?: string;
  };
}

interface ActivityFeedProps {
  limit?: number;
  showTitle?: boolean;
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'approval',
    user: 'John Smith',
    action: 'approved',
    target: '3 resource requests',
    timestamp: '2 minutes ago',
  },
  {
    id: '2',
    type: 'creation',
    user: 'Sarah Mitchell',
    action: 'created',
    target: 'Frontend Team pool',
    timestamp: '15 minutes ago',
    metadata: { poolName: 'Frontend Development Team' },
  },
  {
    id: '3',
    type: 'comment',
    user: 'Michael Chen',
    action: 'commented on',
    target: 'Project Alpha',
    timestamp: '1 hour ago',
    metadata: { comment: 'We need 2 more developers for Q2' },
  },
  {
    id: '4',
    type: 'assignment',
    user: 'Emily Rodriguez',
    action: 'assigned',
    target: 'David Brown to Mobile App',
    timestamp: '2 hours ago',
  },
  {
    id: '5',
    type: 'update',
    user: 'Robert Taylor',
    action: 'updated',
    target: 'Data Analytics pool',
    timestamp: '3 hours ago',
  },
  {
    id: '6',
    type: 'approval',
    user: 'Jennifer Lee',
    action: 'approved',
    target: 'borrow request from TechVentures',
    timestamp: '4 hours ago',
  },
  {
    id: '7',
    type: 'rejection',
    user: 'John Smith',
    action: 'rejected',
    target: 'resource allocation',
    timestamp: '5 hours ago',
  },
  {
    id: '8',
    type: 'creation',
    user: 'Lisa Anderson',
    action: 'created',
    target: 'new project timeline',
    timestamp: 'Yesterday',
  },
];

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'approval':
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case 'rejection':
      return <XCircle className="w-4 h-4 text-red-600" />;
    case 'creation':
      return <Plus className="w-4 h-4 text-blue-600" />;
    case 'update':
      return <Edit className="w-4 h-4 text-amber-600" />;
    case 'deletion':
      return <Trash2 className="w-4 h-4 text-red-600" />;
    case 'comment':
      return <MessageSquare className="w-4 h-4 text-purple-600" />;
    case 'assignment':
      return <ArrowLeftRight className="w-4 h-4 text-indigo-600" />;
    default:
      return <Clock className="w-4 h-4 text-gray-600" />;
  }
};

const getActivityColor = (type: ActivityItem['type']) => {
  switch (type) {
    case 'approval':
      return 'bg-green-50 border-green-200';
    case 'rejection':
      return 'bg-red-50 border-red-200';
    case 'creation':
      return 'bg-blue-50 border-blue-200';
    case 'update':
      return 'bg-amber-50 border-amber-200';
    case 'deletion':
      return 'bg-red-50 border-red-200';
    case 'comment':
      return 'bg-purple-50 border-purple-200';
    case 'assignment':
      return 'bg-indigo-50 border-indigo-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

export function ActivityFeed({ limit = 8, showTitle = true }: ActivityFeedProps) {
  const activities = mockActivities.slice(0, limit);

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Team Activity
            </CardTitle>
            <Badge variant="secondary">Live</Badge>
          </div>
        </CardHeader>
      )}
      <CardContent className={showTitle ? '' : 'p-4'}>
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${getActivityColor(activity.type)} transition-all hover:shadow-sm`}
            >
              {/* Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">{activity.user}</span>
                      {' '}
                      <span className="text-gray-600">{activity.action}</span>
                      {' '}
                      <span className="font-medium">{activity.target}</span>
                    </p>
                    {activity.metadata?.comment && (
                      <p className="text-xs text-gray-600 mt-1 italic">
                        "{activity.metadata.comment}"
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{activity.timestamp}</span>
                      {index === 0 && (
                        <Badge variant="secondary" className="text-xs">New</Badge>
                      )}
                    </div>
                  </div>
                  {getActivityIcon(activity.type)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All Activity →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
