/**
 * Webhook Management Page
 * 
 * Allows administrators to create, manage, and monitor webhooks
 * for integrating REP Platform events with external systems.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Webhook,
  Plus,
  MoreVertical,
  Copy,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Code,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  description: string;
  retryPolicy: 'none' | 'linear' | 'exponential';
  maxRetries: number;
  timeout: number;
  headers: Record<string, string>;
  createdAt: string;
  lastTriggered: string | null;
  deliveryStats: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  };
}

interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  status: 'success' | 'failed' | 'pending' | 'retrying';
  statusCode: number | null;
  requestPayload: string;
  responseBody: string;
  error: string | null;
  duration: number;
  attempts: number;
  triggeredAt: string;
}

// Available webhook events
const WEBHOOK_EVENTS = [
  // User Events
  { category: 'Users', value: 'user.created', label: 'User Created' },
  { category: 'Users', value: 'user.updated', label: 'User Updated' },
  { category: 'Users', value: 'user.deleted', label: 'User Deleted' },
  { category: 'Users', value: 'user.activated', label: 'User Activated' },
  { category: 'Users', value: 'user.deactivated', label: 'User Deactivated' },
  
  // Resource Events
  { category: 'Resources', value: 'allocation.created', label: 'Allocation Created' },
  { category: 'Resources', value: 'allocation.updated', label: 'Allocation Updated' },
  { category: 'Resources', value: 'allocation.deleted', label: 'Allocation Deleted' },
  { category: 'Resources', value: 'allocation.approved', label: 'Allocation Approved' },
  { category: 'Resources', value: 'allocation.rejected', label: 'Allocation Rejected' },
  
  // Project Events
  { category: 'Projects', value: 'project.created', label: 'Project Created' },
  { category: 'Projects', value: 'project.updated', label: 'Project Updated' },
  { category: 'Projects', value: 'project.synced', label: 'Project Synced' },
  { category: 'Projects', value: 'project.completed', label: 'Project Completed' },
  { category: 'Projects', value: 'project.archived', label: 'Project Archived' },
  
  // Borrow Request Events
  { category: 'Borrowing', value: 'borrow_request.created', label: 'Borrow Request Created' },
  { category: 'Borrowing', value: 'borrow_request.approved', label: 'Borrow Request Approved' },
  { category: 'Borrowing', value: 'borrow_request.rejected', label: 'Borrow Request Rejected' },
  { category: 'Borrowing', value: 'borrow_request.fulfilled', label: 'Borrow Request Fulfilled' },
  { category: 'Borrowing', value: 'borrow_request.completed', label: 'Borrow Request Completed' },
  
  // Campaign Events
  { category: 'Campaigns', value: 'campaign.created', label: 'Campaign Created' },
  { category: 'Campaigns', value: 'campaign.updated', label: 'Campaign Updated' },
  { category: 'Campaigns', value: 'campaign.status_changed', label: 'Campaign Status Changed' },
  { category: 'Campaigns', value: 'campaign.milestone_reached', label: 'Campaign Milestone Reached' },
  
  // Financial Events
  { category: 'Financial', value: 'budget.exceeded', label: 'Budget Exceeded' },
  { category: 'Financial', value: 'budget.warning', label: 'Budget Warning (80%)' },
  { category: 'Financial', value: 'invoice.generated', label: 'Invoice Generated' },
  { category: 'Financial', value: 'payment.received', label: 'Payment Received' },
  
  // Capacity Events
  { category: 'Capacity', value: 'capacity.low', label: 'Low Capacity Alert' },
  { category: 'Capacity', value: 'capacity.overallocated', label: 'Overallocation Alert' },
  { category: 'Capacity', value: 'capacity.shortage', label: 'Capacity Shortage Predicted' },
  
  // Integration Events
  { category: 'Integrations', value: 'integration.connected', label: 'Integration Connected' },
  { category: 'Integrations', value: 'integration.sync_completed', label: 'Sync Completed' },
  { category: 'Integrations', value: 'integration.sync_failed', label: 'Sync Failed' },
];

// Mock data
const mockWebhooks: WebhookConfig[] = [
  {
    id: '1',
    name: 'Slack Notifications',
    url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX',
    events: ['allocation.created', 'borrow_request.approved', 'budget.exceeded'],
    isActive: true,
    secret: 'whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    description: 'Send notifications to #engineering-ops channel',
    retryPolicy: 'exponential',
    maxRetries: 3,
    timeout: 30,
    headers: {},
    createdAt: '2026-01-15T10:00:00Z',
    lastTriggered: '2026-02-13T09:45:00Z',
    deliveryStats: {
      total: 847,
      successful: 842,
      failed: 5,
      successRate: 99.4,
    },
  },
  {
    id: '2',
    name: 'Zapier Integration',
    url: 'https://hooks.zapier.com/hooks/catch/12345/abcdef/',
    events: ['project.created', 'project.completed', 'campaign.status_changed'],
    isActive: true,
    secret: 'whsec_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
    description: 'Trigger Zapier workflows for project management',
    retryPolicy: 'linear',
    maxRetries: 5,
    timeout: 15,
    headers: { 'X-Custom-Header': 'value' },
    createdAt: '2026-02-01T14:30:00Z',
    lastTriggered: '2026-02-13T08:20:00Z',
    deliveryStats: {
      total: 234,
      successful: 230,
      failed: 4,
      successRate: 98.3,
    },
  },
  {
    id: '3',
    name: 'Custom CRM Sync',
    url: 'https://api.mycompany.com/webhooks/rep-events',
    events: ['user.created', 'user.updated', 'allocation.created'],
    isActive: false,
    secret: 'whsec_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
    description: 'Sync resource data to internal CRM',
    retryPolicy: 'exponential',
    maxRetries: 3,
    timeout: 30,
    headers: { 'Authorization': 'Bearer token_redacted' },
    createdAt: '2026-01-20T11:15:00Z',
    lastTriggered: '2026-02-10T16:00:00Z',
    deliveryStats: {
      total: 156,
      successful: 140,
      failed: 16,
      successRate: 89.7,
    },
  },
];

const mockDeliveries: WebhookDelivery[] = [
  {
    id: 'd1',
    webhookId: '1',
    event: 'allocation.created',
    status: 'success',
    statusCode: 200,
    requestPayload: JSON.stringify({
      event: 'allocation.created',
      timestamp: '2026-02-13T09:45:00Z',
      data: {
        allocationId: 'alloc_123',
        resourceId: 'user_456',
        projectId: 'proj_789',
        hoursPerWeek: 20,
        startDate: '2026-02-15',
        endDate: '2026-03-15',
      },
    }, null, 2),
    responseBody: 'ok',
    error: null,
    duration: 245,
    attempts: 1,
    triggeredAt: '2026-02-13T09:45:00Z',
  },
  {
    id: 'd2',
    webhookId: '1',
    event: 'budget.exceeded',
    status: 'success',
    statusCode: 200,
    requestPayload: JSON.stringify({
      event: 'budget.exceeded',
      timestamp: '2026-02-13T08:30:00Z',
      data: {
        projectId: 'proj_123',
        projectName: 'Marketing Campaign Q1',
        budget: 50000,
        spent: 52000,
        overageAmount: 2000,
        overagePercentage: 4,
      },
    }, null, 2),
    responseBody: 'ok',
    error: null,
    duration: 189,
    attempts: 1,
    triggeredAt: '2026-02-13T08:30:00Z',
  },
  {
    id: 'd3',
    webhookId: '2',
    event: 'project.created',
    status: 'failed',
    statusCode: 500,
    requestPayload: JSON.stringify({
      event: 'project.created',
      timestamp: '2026-02-13T07:15:00Z',
      data: {
        projectId: 'proj_999',
        projectName: 'New Product Launch',
        clientId: 'client_111',
        budget: 150000,
        startDate: '2026-03-01',
      },
    }, null, 2),
    responseBody: 'Internal Server Error',
    error: 'Connection timeout after 15 seconds',
    duration: 15000,
    attempts: 3,
    triggeredAt: '2026-02-13T07:15:00Z',
  },
];

export function WebhookManagement() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(mockWebhooks);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [showDeliveriesDialog, setShowDeliveriesDialog] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>(mockDeliveries);
  const [selectedTab, setSelectedTab] = useState<'active' | 'inactive' | 'all'>('active');

  // Form state
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formEvents, setFormEvents] = useState<string[]>([]);
  const [formRetryPolicy, setFormRetryPolicy] = useState<'none' | 'linear' | 'exponential'>('exponential');
  const [formMaxRetries, setFormMaxRetries] = useState('3');
  const [formTimeout, setFormTimeout] = useState('30');
  const [formHeaders, setFormHeaders] = useState('');

  const resetForm = () => {
    setFormName('');
    setFormUrl('');
    setFormDescription('');
    setFormEvents([]);
    setFormRetryPolicy('exponential');
    setFormMaxRetries('3');
    setFormTimeout('30');
    setFormHeaders('');
  };

  const handleCreateWebhook = () => {
    const newWebhook: WebhookConfig = {
      id: `webhook_${Date.now()}`,
      name: formName,
      url: formUrl,
      events: formEvents,
      isActive: true,
      secret: `whsec_${Math.random().toString(36).substring(2, 34)}`,
      description: formDescription,
      retryPolicy: formRetryPolicy,
      maxRetries: parseInt(formMaxRetries),
      timeout: parseInt(formTimeout),
      headers: formHeaders ? JSON.parse(formHeaders) : {},
      createdAt: new Date().toISOString(),
      lastTriggered: null,
      deliveryStats: {
        total: 0,
        successful: 0,
        failed: 0,
        successRate: 0,
      },
    };

    setWebhooks([...webhooks, newWebhook]);
    setShowCreateDialog(false);
    resetForm();
    toast.success('Webhook created successfully');
  };

  const handleEditWebhook = () => {
    if (!selectedWebhook) return;

    const updatedWebhooks = webhooks.map(w =>
      w.id === selectedWebhook.id
        ? {
            ...w,
            name: formName,
            url: formUrl,
            description: formDescription,
            events: formEvents,
            retryPolicy: formRetryPolicy,
            maxRetries: parseInt(formMaxRetries),
            timeout: parseInt(formTimeout),
            headers: formHeaders ? JSON.parse(formHeaders) : {},
          }
        : w
    );

    setWebhooks(updatedWebhooks);
    setShowEditDialog(false);
    setSelectedWebhook(null);
    resetForm();
    toast.success('Webhook updated successfully');
  };

  const handleToggleActive = (webhookId: string) => {
    const updatedWebhooks = webhooks.map(w =>
      w.id === webhookId ? { ...w, isActive: !w.isActive } : w
    );
    setWebhooks(updatedWebhooks);
    const webhook = webhooks.find(w => w.id === webhookId);
    toast.success(`Webhook ${webhook?.isActive ? 'disabled' : 'enabled'}`);
  };

  const handleDeleteWebhook = (webhookId: string) => {
    setWebhooks(webhooks.filter(w => w.id !== webhookId));
    toast.success('Webhook deleted');
  };

  const handleTestWebhook = () => {
    toast.success('Test event sent successfully');
    setShowTestDialog(false);
  };

  const handleRegenerateSecret = (webhookId: string) => {
    const updatedWebhooks = webhooks.map(w =>
      w.id === webhookId
        ? { ...w, secret: `whsec_${Math.random().toString(36).substring(2, 34)}` }
        : w
    );
    setWebhooks(updatedWebhooks);
    toast.success('Secret regenerated. Update your webhook handler!');
  };

  const filteredWebhooks = webhooks.filter(w => {
    if (selectedTab === 'active') return w.isActive;
    if (selectedTab === 'inactive') return !w.isActive;
    return true;
  });

  const groupedEvents = WEBHOOK_EVENTS.reduce((acc, event) => {
    if (!acc[event.category]) acc[event.category] = [];
    acc[event.category].push(event);
    return acc;
  }, {} as Record<string, typeof WEBHOOK_EVENTS>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Webhook Management</h1>
          <p className="text-gray-600 mt-1">
            Configure webhooks to receive real-time event notifications from REP Platform
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Webhook
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Webhooks</p>
                <p className="text-2xl font-semibold text-gray-900">{webhooks.length}</p>
              </div>
              <Webhook className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-semibold text-green-600">
                  {webhooks.filter(w => w.isActive).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deliveries (24h)</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {webhooks.reduce((sum, w) => sum + w.deliveryStats.total, 0)}
                </p>
              </div>
              <Send className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-semibold text-green-600">
                  {(
                    webhooks.reduce((sum, w) => sum + w.deliveryStats.successRate, 0) /
                    webhooks.length
                  ).toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setSelectedTab('active')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            selectedTab === 'active'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Active ({webhooks.filter(w => w.isActive).length})
        </button>
        <button
          onClick={() => setSelectedTab('inactive')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            selectedTab === 'inactive'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Inactive ({webhooks.filter(w => !w.isActive).length})
        </button>
        <button
          onClick={() => setSelectedTab('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            selectedTab === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          All ({webhooks.length})
        </button>
      </div>

      {/* Webhook List */}
      <div className="space-y-4">
        {filteredWebhooks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Webhook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No webhooks found</h3>
              <p className="text-gray-600 mb-4">
                {selectedTab === 'active'
                  ? 'No active webhooks configured'
                  : 'Create your first webhook to start receiving events'}
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Webhook
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredWebhooks.map(webhook => (
            <Card key={webhook.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{webhook.name}</h3>
                      <Badge variant={webhook.isActive ? 'default' : 'secondary'}>
                        {webhook.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {webhook.deliveryStats.successRate < 90 && (
                        <Badge variant="destructive">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Low Success Rate
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{webhook.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Code className="w-4 h-4" />
                        <span className="font-mono text-xs">{webhook.url}</span>
                      </div>
                      {webhook.lastTriggered && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Last: {new Date(webhook.lastTriggered).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {webhook.events.map(event => (
                        <Badge key={event} variant="secondary">
                          {WEBHOOK_EVENTS.find(e => e.value === event)?.label || event}
                        </Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-4 gap-4 pt-3 border-t">
                      <div>
                        <p className="text-xs text-gray-600">Total</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {webhook.deliveryStats.total}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Successful</p>
                        <p className="text-lg font-semibold text-green-600">
                          {webhook.deliveryStats.successful}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Failed</p>
                        <p className="text-lg font-semibold text-red-600">
                          {webhook.deliveryStats.failed}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Success Rate</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {webhook.deliveryStats.successRate}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedWebhook(webhook);
                          setFormName(webhook.name);
                          setFormUrl(webhook.url);
                          setFormDescription(webhook.description);
                          setFormEvents(webhook.events);
                          setFormRetryPolicy(webhook.retryPolicy);
                          setFormMaxRetries(webhook.maxRetries.toString());
                          setFormTimeout(webhook.timeout.toString());
                          setFormHeaders(JSON.stringify(webhook.headers, null, 2));
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedWebhook(webhook);
                          setShowTestDialog(true);
                        }}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Test Webhook
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedWebhook(webhook);
                          setShowDeliveriesDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Deliveries
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleToggleActive(webhook.id)}>
                        {webhook.isActive ? (
                          <>
                            <PowerOff className="w-4 h-4 mr-2" />
                            Disable
                          </>
                        ) : (
                          <>
                            <Power className="w-4 h-4 mr-2" />
                            Enable
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRegenerateSecret(webhook.id)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate Secret
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          navigator.clipboard.writeText(webhook.secret);
                          toast.success('Secret copied to clipboard');
                        }}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Secret
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteWebhook(webhook.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Webhook Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
          setSelectedWebhook(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{showEditDialog ? 'Edit Webhook' : 'Create Webhook'}</DialogTitle>
            <DialogDescription>
              Configure your webhook to receive real-time notifications for selected events
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Webhook Name</Label>
              <Input
                id="name"
                placeholder="e.g., Slack Notifications"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="url">Endpoint URL</Label>
              <Input
                id="url"
                placeholder="https://your-domain.com/webhooks/rep-events"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
              />
              <p className="text-xs text-gray-600 mt-1">
                The URL where webhook events will be sent via POST request
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What is this webhook used for?"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div>
              <Label>Events to Subscribe</Label>
              <div className="mt-2 space-y-4 max-h-64 overflow-y-auto border rounded-lg p-4">
                {Object.entries(groupedEvents).map(([category, events]) => (
                  <div key={category}>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">{category}</h4>
                    <div className="space-y-2">
                      {events.map(event => (
                        <div key={event.value} className="flex items-center">
                          <Checkbox
                            id={event.value}
                            checked={formEvents.includes(event.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormEvents([...formEvents, event.value]);
                              } else {
                                setFormEvents(formEvents.filter(e => e !== event.value));
                              }
                            }}
                          />
                          <label
                            htmlFor={event.value}
                            className="ml-2 text-sm text-gray-700 cursor-pointer"
                          >
                            {event.label}
                            <span className="ml-2 font-mono text-xs text-gray-500">
                              {event.value}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Selected {formEvents.length} event{formEvents.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="retryPolicy">Retry Policy</Label>
                <Select value={formRetryPolicy} onValueChange={(value: any) => setFormRetryPolicy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="exponential">Exponential</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="maxRetries">Max Retries</Label>
                <Input
                  id="maxRetries"
                  type="number"
                  min="0"
                  max="10"
                  value={formMaxRetries}
                  onChange={(e) => setFormMaxRetries(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="timeout">Timeout (seconds)</Label>
                <Input
                  id="timeout"
                  type="number"
                  min="5"
                  max="60"
                  value={formTimeout}
                  onChange={(e) => setFormTimeout(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="headers">Custom Headers (JSON)</Label>
              <Textarea
                id="headers"
                placeholder='{"Authorization": "Bearer token", "X-Custom": "value"}'
                value={formHeaders}
                onChange={(e) => setFormHeaders(e.target.value)}
                rows={3}
                className="font-mono text-xs"
              />
              <p className="text-xs text-gray-600 mt-1">
                Optional: Add custom HTTP headers as JSON object
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setShowEditDialog(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={showEditDialog ? handleEditWebhook : handleCreateWebhook}>
              {showEditDialog ? 'Save Changes' : 'Create Webhook'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Webhook Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Webhook</DialogTitle>
            <DialogDescription>
              Send a test event to {selectedWebhook?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Select Event Type</Label>
              <Select defaultValue="user.created">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEBHOOK_EVENTS.map(event => (
                    <SelectItem key={event.value} value={event.value}>
                      {event.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Test Payload</Label>
              <Textarea
                readOnly
                value={JSON.stringify({
                  event: 'user.created',
                  timestamp: new Date().toISOString(),
                  data: {
                    userId: 'test_user_123',
                    email: 'test@example.com',
                    name: 'Test User',
                  },
                }, null, 2)}
                rows={10}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleTestWebhook}>
              <Send className="w-4 h-4 mr-2" />
              Send Test Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Deliveries Dialog */}
      <Dialog open={showDeliveriesDialog} onOpenChange={setShowDeliveriesDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Webhook Deliveries</DialogTitle>
            <DialogDescription>
              Recent delivery attempts for {selectedWebhook?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {deliveries
              .filter(d => d.webhookId === selectedWebhook?.id)
              .map(delivery => (
                <Card key={delivery.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {delivery.status === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : delivery.status === 'failed' ? (
                          <XCircle className="w-5 h-5 text-red-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-amber-600" />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{delivery.event}</div>
                          <div className="text-xs text-gray-600">
                            {new Date(delivery.triggeredAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            delivery.status === 'success'
                              ? 'default'
                              : delivery.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {delivery.statusCode || delivery.status}
                        </Badge>
                        <div className="text-xs text-gray-600 mt-1">
                          {delivery.duration}ms · {delivery.attempts} attempt{delivery.attempts > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    {delivery.error && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                        {delivery.error}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Documentation Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Webhook Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>Payload Format:</strong> All webhooks receive POST requests with JSON payload containing <code>event</code>, <code>timestamp</code>, and <code>data</code> fields.
          </p>
          <p>
            <strong>Security:</strong> Verify webhook signatures using the secret key with HMAC-SHA256. Header: <code>X-Webhook-Signature</code>
          </p>
          <p>
            <strong>Retry Logic:</strong> Failed deliveries are retried based on your retry policy (linear: 1s, 2s, 3s... / exponential: 1s, 2s, 4s, 8s...)
          </p>
          <p>
            <strong>Response:</strong> Your endpoint must respond with 2xx status code within the timeout period to be considered successful.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
