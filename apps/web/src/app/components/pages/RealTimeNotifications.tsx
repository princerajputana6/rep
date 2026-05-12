import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Switch } from '@/app/components/ui/switch';
import { Label } from '@/app/components/ui/label';
import {
  Bell,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  DollarSign,
  TrendingUp,
  Settings,
  Filter,
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Resource Approval Pending',
    message: 'Sarah Mitchell approval for Digital Transformation requires your action',
    timestamp: '2 minutes ago',
    read: false,
    priority: 'high',
    category: 'Approvals',
  },
  {
    id: '2',
    type: 'success',
    title: 'Capacity Alert Resolved',
    message: 'DevOps capacity increased to 95% with new hire completion',
    timestamp: '15 minutes ago',
    read: false,
    priority: 'medium',
    category: 'Capacity',
  },
  {
    id: '3',
    type: 'info',
    title: 'AI Match Completed',
    message: 'Found 3 high-confidence matches for Project Alpha',
    timestamp: '1 hour ago',
    read: false,
    priority: 'low',
    category: 'AI Matching',
  },
  {
    id: '4',
    type: 'error',
    title: 'Utilization Threshold Exceeded',
    message: 'Frontend team utilization at 98% - immediate action required',
    timestamp: '2 hours ago',
    read: true,
    priority: 'high',
    category: 'Utilization',
  },
  {
    id: '5',
    type: 'success',
    title: 'Borrow Request Approved',
    message: 'TechVentures borrow request for Data Engineer approved',
    timestamp: '3 hours ago',
    read: true,
    priority: 'medium',
    category: 'Borrowing',
  },
];

export function RealTimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [preferences, setPreferences] = useState({
    approvals: true,
    capacity: true,
    aiMatching: true,
    borrowing: true,
    financial: true,
    utilization: true,
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-semibold text-gray-900">Real-Time Notifications</h1>
          </div>
          <p className="text-gray-600 mt-1">
            WebSocket-powered instant notifications and alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-red-500 text-white text-lg px-3 py-1">
            {unreadCount} New
          </Badge>
          <Badge className="bg-green-500 text-white gap-1">
            <Zap className="w-3 h-3" />
            Live
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Today</p>
                <p className="text-2xl font-semibold text-gray-900">127</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-semibold text-gray-900">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Response</p>
                <p className="text-2xl font-semibold text-gray-900">3.2m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Connection</p>
                <p className="text-2xl font-semibold text-green-900">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Notifications</CardTitle>
                  <CardDescription>Real-time updates and alerts</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg ${getBgColor(notification.type)} ${
                    !notification.read ? 'border-l-4' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {notification.title}
                            {!notification.read && (
                              <span className="ml-2 inline-flex w-2 h-2 bg-blue-600 rounded-full" />
                            )}
                          </h4>
                          <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                        </div>
                        <Badge
                          variant={notification.priority === 'high' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {notification.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500">{notification.timestamp}</span>
                        <Badge variant="outline" className="text-xs">
                          {notification.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Unread Notifications ({unreadCount})</CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications
                .filter((n) => !n.read)
                .map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg ${getBgColor(notification.type)} border-l-4`}
                  >
                    <div className="flex items-start gap-3">
                      {getIcon(notification.type)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                        <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <Button size="sm">Take Action</Button>
                          <Button size="sm" variant="outline">
                            Mark as Read
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure which notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    <div>
                      <Label className="font-medium">Resource Approvals</Label>
                      <p className="text-sm text-gray-600">
                        Notifications about pending resource approvals
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.approvals}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, approvals: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <div>
                      <Label className="font-medium">Capacity Alerts</Label>
                      <p className="text-sm text-gray-600">Alerts about capacity thresholds</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.capacity}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, capacity: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <div>
                      <Label className="font-medium">AI Matching Results</Label>
                      <p className="text-sm text-gray-600">AI-powered resource match updates</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.aiMatching}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, aiMatching: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <div>
                      <Label className="font-medium">Borrow Requests</Label>
                      <p className="text-sm text-gray-600">Updates on resource borrowing</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.borrowing}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, borrowing: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    <div>
                      <Label className="font-medium">Financial Updates</Label>
                      <p className="text-sm text-gray-600">Revenue and margin notifications</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.financial}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, financial: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <Label className="font-medium">Utilization Alerts</Label>
                      <p className="text-sm text-gray-600">Critical utilization threshold alerts</p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.utilization}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, utilization: checked })
                    }
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full">Save Preferences</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900">WebSocket Connection Active</div>
                  <div className="text-sm text-blue-700 mt-1">
                    Real-time notifications are powered by WebSocket technology for instant updates.
                    Connection status: Active | Latency: &lt;50ms
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
