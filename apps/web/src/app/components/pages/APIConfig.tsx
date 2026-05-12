import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Globe,
  Lock,
  Shield,
  Code,
  Terminal,
  FileText,
  Settings,
  Zap,
  Database,
  Cloud,
  Server,
  Plug,
} from 'lucide-react';
import { toast } from 'sonner';

interface APIKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  permissions: string[];
  status: 'active' | 'revoked';
}

interface OAuth2Config {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  created: string;
  status: 'active' | 'inactive';
}

interface IntegrationConfig {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  apiUrl: string;
  authType: 'oauth2' | 'apikey' | 'basic';
  lastSync: string;
  credentials: {
    stored: boolean;
    encrypted: boolean;
  };
}

const mockAPIKeys: APIKey[] = [
  {
    id: '1',
    name: 'Production API Key',
    key: 'rep_live_sk_1234567890abcdef',
    created: '2026-01-15',
    lastUsed: '2 hours ago',
    permissions: ['read', 'write', 'delete'],
    status: 'active',
  },
  {
    id: '2',
    name: 'Development API Key',
    key: 'rep_test_sk_abcdef1234567890',
    created: '2026-01-10',
    lastUsed: '5 minutes ago',
    permissions: ['read', 'write'],
    status: 'active',
  },
];

const mockOAuth2Configs: OAuth2Config[] = [
  {
    id: '1',
    name: 'REP Platform OAuth',
    clientId: 'rep_oauth_client_abc123',
    clientSecret: '•••••••••••••••••••••••••',
    redirectUri: 'https://api.repplatform.com/oauth/callback',
    scopes: ['resources.read', 'projects.write', 'users.read'],
    created: '2026-01-20',
    status: 'active',
  },
];

const mockIntegrations: IntegrationConfig[] = [
  {
    id: '1',
    name: 'Workfront',
    type: 'PPM',
    status: 'connected',
    apiUrl: 'https://api.workfront.com/v1',
    authType: 'apikey',
    lastSync: '5 minutes ago',
    credentials: { stored: true, encrypted: true },
  },
  {
    id: '2',
    name: 'HubSpot',
    type: 'CRM',
    status: 'disconnected',
    apiUrl: 'https://api.hubspot.com/crm/v3',
    authType: 'oauth2',
    lastSync: 'Never',
    credentials: { stored: false, encrypted: false },
  },
  {
    id: '3',
    name: 'Salesforce',
    type: 'CRM',
    status: 'disconnected',
    apiUrl: 'https://api.salesforce.com/services/data/v54.0',
    authType: 'oauth2',
    lastSync: 'Never',
    credentials: { stored: false, encrypted: false },
  },
  {
    id: '4',
    name: 'Slack',
    type: 'Communication',
    status: 'connected',
    apiUrl: 'https://slack.com/api',
    authType: 'oauth2',
    lastSync: '1 hour ago',
    credentials: { stored: true, encrypted: true },
  },
  {
    id: '5',
    name: 'Stripe',
    type: 'Payment',
    status: 'connected',
    apiUrl: 'https://api.stripe.com/v1',
    authType: 'apikey',
    lastSync: '30 minutes ago',
    credentials: { stored: true, encrypted: true },
  },
  {
    id: '6',
    name: 'Google Analytics',
    type: 'Analytics',
    status: 'disconnected',
    apiUrl: 'https://analyticsreporting.googleapis.com/v4',
    authType: 'oauth2',
    lastSync: 'Never',
    credentials: { stored: false, encrypted: false },
  },
];

export function APIConfig() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>(mockAPIKeys);
  const [oauth2Configs, setOAuth2Configs] = useState<OAuth2Config[]>(mockOAuth2Configs);
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>(mockIntegrations);
  const [showCreateAPIKey, setShowCreateAPIKey] = useState(false);
  const [showCreateOAuth, setShowCreateOAuth] = useState(false);
  const [showConfigureIntegration, setShowConfigureIntegration] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  const toggleKeyVisibility = (keyId: string) => {
    setRevealedKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleCreateAPIKey = () => {
    toast.success('API Key created successfully!');
    setShowCreateAPIKey(false);
  };

  const handleCreateOAuth = () => {
    toast.success('OAuth 2.0 configuration created successfully!');
    setShowCreateOAuth(false);
  };

  const handleConfigureIntegration = () => {
    toast.success('Integration configured successfully!');
    setShowConfigureIntegration(false);
    setSelectedIntegration(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'inactive':
      case 'disconnected':
        return <Badge variant="outline" className="text-gray-600">Inactive</Badge>;
      case 'revoked':
      case 'error':
        return <Badge variant="destructive">Revoked</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
            <Key className="w-8 h-8 text-blue-600" />
            API Configuration
          </h1>
          <p className="text-gray-600 mt-1">
            Manage OAuth 2.0 connections, API keys, and integration credentials
          </p>
        </div>
      </div>

      <Tabs defaultValue="rep-api" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="rep-api">REP API</TabsTrigger>
          <TabsTrigger value="oauth">OAuth 2.0</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* REP API Keys Tab */}
        <TabsContent value="rep-api" className="space-y-6">
          {/* Info Card */}
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Code className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900">REP Platform API</div>
                  <div className="text-sm text-blue-700 mt-1">
                    Create API keys to access the REP Platform programmatically. Keys can have 
                    read, write, or delete permissions. Store keys securely - they won't be shown again.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create Button */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">API Keys</h3>
              <p className="text-sm text-gray-600">
                {apiKeys.filter(k => k.status === 'active').length} active keys
              </p>
            </div>
            <Button onClick={() => setShowCreateAPIKey(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create API Key
            </Button>
          </div>

          {/* API Keys Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {revealedKeys.has(key.id) ? key.key : '••••••••••••••••••••'}
                          </code>
                          <button
                            onClick={() => toggleKeyVisibility(key.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            {revealedKeys.has(key.id) ? (
                              <EyeOff className="w-4 h-4 text-gray-600" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(key.key, 'API Key')}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Copy className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {key.permissions.map((perm, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{key.lastUsed}</TableCell>
                      <TableCell>{getStatusBadge(key.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* API Documentation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                API Documentation
              </CardTitle>
              <CardDescription>Quick links to get started with the REP API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start gap-2">
                  <Terminal className="w-4 h-4" />
                  API Reference
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <Code className="w-4 h-4" />
                  Code Examples
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <Zap className="w-4 h-4" />
                  Quickstart Guide
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <Settings className="w-4 h-4" />
                  Rate Limits
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OAuth 2.0 Tab */}
        <TabsContent value="oauth" className="space-y-6">
          {/* Info Card */}
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-purple-900">OAuth 2.0 Authentication</div>
                  <div className="text-sm text-purple-700 mt-1">
                    Configure OAuth 2.0 for secure, token-based authentication. Users can authorize 
                    applications without sharing passwords. Supports authorization code flow.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create Button */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">OAuth 2.0 Configurations</h3>
              <p className="text-sm text-gray-600">
                {oauth2Configs.filter(c => c.status === 'active').length} active configurations
              </p>
            </div>
            <Button onClick={() => setShowCreateOAuth(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create OAuth Config
            </Button>
          </div>

          {/* OAuth Configs */}
          <div className="grid grid-cols-1 gap-4">
            {oauth2Configs.map((config) => (
              <Card key={config.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{config.name}</CardTitle>
                    {getStatusBadge(config.status)}
                  </div>
                  <CardDescription>
                    Created {config.created}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Client ID</Label>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1">
                          {config.clientId}
                        </code>
                        <button
                          onClick={() => copyToClipboard(config.clientId, 'Client ID')}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Copy className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Client Secret</Label>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1">
                          {config.clientSecret}
                        </code>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Redirect URI</Label>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded block">
                      {config.redirectUri}
                    </code>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Scopes</Label>
                    <div className="flex flex-wrap gap-1">
                      {config.scopes.map((scope, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Rotate Secret
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* OAuth Flow Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                OAuth 2.0 Authorization Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <div className="font-medium text-sm">User Authorization</div>
                    <div className="text-xs text-gray-600">Redirect user to authorization endpoint</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <div className="font-medium text-sm">Authorization Code</div>
                    <div className="text-xs text-gray-600">Receive authorization code at redirect URI</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <div className="font-medium text-sm">Exchange for Token</div>
                    <div className="text-xs text-gray-600">Exchange code for access token</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <div className="font-medium text-sm">Access Resources</div>
                    <div className="text-xs text-gray-600">Use access token to call API endpoints</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          {/* Info Card */}
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Plug className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-green-900">Integration API Configurations</div>
                  <div className="text-sm text-green-700 mt-1">
                    Store and manage API credentials for all connected integrations. All credentials 
                    are encrypted at rest and in transit.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {integrations.filter(i => i.status === 'connected').length}
                    </div>
                    <div className="text-xs text-gray-600">Connected</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <XCircle className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {integrations.filter(i => i.status === 'disconnected').length}
                    </div>
                    <div className="text-xs text-gray-600">Disconnected</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {integrations.filter(i => i.credentials.encrypted).length}
                    </div>
                    <div className="text-xs text-gray-600">Encrypted</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Database className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {integrations.length}
                    </div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Integrations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Credentials</CardTitle>
              <CardDescription>
                Manage API credentials for all connected services
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Auth Method</TableHead>
                    <TableHead>API Endpoint</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {integrations.map((integration) => (
                    <TableRow key={integration.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-600" />
                          <span className="font-medium">{integration.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{integration.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {integration.authType === 'oauth2' ? (
                            <Shield className="w-4 h-4 text-purple-600" />
                          ) : (
                            <Key className="w-4 h-4 text-blue-600" />
                          )}
                          <span className="text-sm">{integration.authType}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {integration.apiUrl}
                        </code>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{integration.lastSync}</TableCell>
                      <TableCell>{getStatusBadge(integration.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {integration.status === 'connected' ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedIntegration(integration);
                                  setShowConfigureIntegration(true);
                                }}
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedIntegration(integration);
                                setShowConfigureIntegration(true);
                              }}
                            >
                              Configure
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-amber-900">Security Best Practices</div>
                  <div className="text-sm text-amber-700 mt-1">
                    • All credentials are encrypted using AES-256<br />
                    • API keys are hashed before storage<br />
                    • OAuth tokens are automatically refreshed<br />
                    • Audit logs track all credential access
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create API Key Dialog */}
      <Dialog open={showCreateAPIKey} onOpenChange={setShowCreateAPIKey}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              Generate a new API key for programmatic access to REP Platform
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key Name *</Label>
              <Input id="key-name" placeholder="e.g., Production API Key" />
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Read</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Write</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Delete</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="key-expiry">Expiration (Optional)</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Never expires" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never expires</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateAPIKey(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAPIKey}>
              <Key className="w-4 h-4 mr-2" />
              Generate Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create OAuth Config Dialog */}
      <Dialog open={showCreateOAuth} onOpenChange={setShowCreateOAuth}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create OAuth 2.0 Configuration</DialogTitle>
            <DialogDescription>
              Set up a new OAuth 2.0 application for secure authentication
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="oauth-name">Application Name *</Label>
              <Input id="oauth-name" placeholder="e.g., My REP Integration" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="redirect-uri">Redirect URI *</Label>
              <Input id="redirect-uri" placeholder="https://yourapp.com/oauth/callback" />
            </div>

            <div className="space-y-2">
              <Label>Scopes *</Label>
              <div className="grid grid-cols-2 gap-2">
                {['resources.read', 'resources.write', 'projects.read', 'projects.write', 'users.read', 'users.write'].map((scope) => (
                  <label key={scope} className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{scope}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateOAuth(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOAuth}>
              <Shield className="w-4 h-4 mr-2" />
              Create Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure Integration Dialog */}
      <Dialog open={showConfigureIntegration && selectedIntegration !== null} onOpenChange={setShowConfigureIntegration}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure {selectedIntegration?.name || 'Integration'}</DialogTitle>
            <DialogDescription>
              Set up API credentials for {selectedIntegration?.name || 'this'} integration
            </DialogDescription>
          </DialogHeader>

          {selectedIntegration && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>API Endpoint</Label>
                <Input value={selectedIntegration.apiUrl} disabled />
              </div>

              {selectedIntegration.authType === 'oauth2' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="client-id">Client ID *</Label>
                    <Input id="client-id" placeholder="Enter client ID" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-secret">Client Secret *</Label>
                    <Input id="client-secret" type="password" placeholder="Enter client secret" />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key *</Label>
                  <Input id="api-key" type="password" placeholder="Enter API key" />
                </div>
              )}

              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="text-sm text-blue-900">
                  <strong>Note:</strong> Credentials are encrypted with AES-256 before storage. 
                  Only authorized admins can view or modify them.
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowConfigureIntegration(false);
              setSelectedIntegration(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleConfigureIntegration}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}