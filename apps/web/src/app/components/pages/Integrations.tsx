import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/app/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import { Checkbox } from '@/app/components/ui/checkbox';
import {
  Plus, CheckCircle, RefreshCw, Settings, Plug, Zap,
  Calendar, XCircle, Loader2, Wifi,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  workfrontConnectorService,
  type WorkfrontConnector,
  type CreateWorkfrontConnectorDTO,
  type UpdateWorkfrontConnectorDTO,
} from '@/app/services/workfrontConnectorService';
import {
  clickupConnectorService,
  type ClickUpConnector,
  type CreateClickUpConnectorDTO,
  type UpdateClickUpConnectorDTO,
  type ClickUpObjectMeta,
} from '@/app/services/clickupConnectorService';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected';
  lastSync?: string;
  frequency?: string;
  resources?: number;
  projects?: number;
  color: string;
}

// Workfront object codes with labels (for endpoint selection)
const WF_OBJECTS = [
  { code: 'PROJ',      label: 'Projects',          description: 'Top-level project containers' },
  { code: 'TASK',      label: 'Tasks',              description: 'Work breakdown items' },
  { code: 'OPTASK',    label: 'Issues / Requests',  description: 'Unplanned work items' },
  { code: 'ASSGN',     label: 'Assignments',        description: 'Resource-to-task assignments' },
  { code: 'USER',      label: 'Users / People',     description: 'Workfront users' },
  { code: 'HOUR',      label: 'Hours / Time Logs',  description: 'Actual hour entries' },
  { code: 'PORTFOLIO', label: 'Portfolios',         description: 'Portfolio containers' },
  { code: 'PROGRAM',   label: 'Programs',           description: 'Program groupings' },
  { code: 'TEAM',      label: 'Teams',              description: 'Workfront teams' },
  { code: 'GROUP',     label: 'Groups',             description: 'Workfront groups' },
  { code: 'DOCUMENT',  label: 'Documents',          description: 'Attached documents' },
  { code: 'NOTE',      label: 'Notes / Updates',    description: 'Comments and notes' },
  { code: 'EXPENSE',   label: 'Expenses',           description: 'Project expenses' },
  { code: 'RISK',      label: 'Risks',              description: 'Project risks' },
];

const WF_DEFAULT_ENABLED = ['PROJ', 'TASK', 'USER'];

interface WorkfrontFormState {
  connectorId: string | null;
  name: string;
  baseUrl: string;
  domain: string;
  apiVersion: string;
  authType: 'API_KEY' | 'OAUTH2';
  apiKey: string;
  oauthClientId: string;
  oauthClientSecret: string;
  syncFrequencyMinutes: string;
  enabledObjects: string[];
}

interface ClickUpFormState {
  connectorId: string | null;
  name: string;
  teamId: string;
  authType: 'PERSONAL_TOKEN' | 'OAUTH2';
  accessToken: string;
  oauthClientId: string;
  oauthClientSecret: string;
  syncFrequencyMinutes: string;
  enabledObjects: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Static integrations (no real backend connector yet)
// ─────────────────────────────────────────────────────────────────────────────

const STATIC_INTEGRATIONS: Integration[] = [
  { id: 'jira', name: 'Jira', description: 'Project management for software teams', icon: '🔷', status: 'connected', lastSync: '2024-01-26 10:15 AM', frequency: 'Every 20 minutes', resources: 67, projects: 28, color: 'bg-blue-600' },
  { id: 'planview', name: 'Planview', description: 'Portfolio and resource management', icon: '📈', status: 'connected', lastSync: '2024-01-26 10:20 AM', frequency: 'Every 1 hour', resources: 42, projects: 15, color: 'bg-indigo-600' },
  { id: 'smartsheet', name: 'Smartsheet', description: 'Collaborative work management', icon: '📋', status: 'disconnected', color: 'bg-blue-500' },
  { id: 'monday', name: 'Monday.com', description: 'Work operating system for teams', icon: '📅', status: 'disconnected', color: 'bg-pink-500' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function mapWfConnector(c: WorkfrontConnector | null): Integration {
  if (!c) return { id: 'workfront', name: 'Adobe Workfront', description: 'Enterprise work management platform', icon: '📊', status: 'disconnected', color: 'bg-purple-500' };
  return {
    id: 'workfront', name: c.name, description: 'Enterprise work management platform', icon: '📊',
    status: c.status === 'ACTIVE' ? 'connected' : 'disconnected',
    lastSync: c.lastSyncAt ? new Date(c.lastSyncAt).toLocaleString() : undefined,
    frequency: c.syncFrequencyMinutes ? `Every ${c.syncFrequencyMinutes} minutes` : undefined,
    color: 'bg-purple-500',
  };
}

function mapCuConnector(c: ClickUpConnector | null): Integration {
  if (!c) return { id: 'clickup', name: 'ClickUp', description: 'All-in-one productivity platform', icon: '✓', status: 'disconnected', color: 'bg-purple-600' };
  return {
    id: 'clickup', name: c.name, description: 'All-in-one productivity platform', icon: '✓',
    status: c.status === 'ACTIVE' ? 'connected' : 'disconnected',
    lastSync: c.lastSyncAt ? new Date(c.lastSyncAt).toLocaleString() : undefined,
    frequency: c.syncFrequencyMinutes ? `Every ${c.syncFrequencyMinutes} minutes` : undefined,
    color: 'bg-purple-600',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function Integrations() {
  const [activeTab, setActiveTab] = useState('ppm-tools');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'connected' | 'disconnected'>('all');

  // ── Workfront state ──
  const [wfConnector, setWfConnector] = useState<WorkfrontConnector | null>(null);
  const [wfLoading, setWfLoading] = useState(true);
  const [wfSyncing, setWfSyncing] = useState(false);
  const [wfTesting, setWfTesting] = useState(false);
  const [wfSaving, setWfSaving] = useState(false);
  const [wfForm, setWfForm] = useState<WorkfrontFormState>({
    connectorId: null, name: 'Adobe Workfront', baseUrl: '', domain: '',
    apiVersion: 'v14.0', authType: 'API_KEY', apiKey: '', oauthClientId: '',
    oauthClientSecret: '', syncFrequencyMinutes: '15', enabledObjects: WF_DEFAULT_ENABLED,
  });

  // ── ClickUp state ──
  const [cuConnector, setCuConnector] = useState<ClickUpConnector | null>(null);
  const [cuLoading, setCuLoading] = useState(true);
  const [cuObjectMeta, setCuObjectMeta] = useState<ClickUpObjectMeta[]>([]);
  const [cuSyncing, setCuSyncing] = useState(false);
  const [cuTesting, setCuTesting] = useState(false);
  const [cuSaving, setCuSaving] = useState(false);
  const [cuForm, setCuForm] = useState<ClickUpFormState>({
    connectorId: null, name: 'ClickUp', teamId: '', authType: 'PERSONAL_TOKEN',
    accessToken: '', oauthClientId: '', oauthClientSecret: '',
    syncFrequencyMinutes: '30', enabledObjects: ['SPACE', 'FOLDER', 'LIST', 'TASK', 'MEMBER'],
  });

  // ── Dialog state ──
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  // Load connectors on mount
  useEffect(() => {
    workfrontConnectorService.listConnectors()
      .then((cs) => setWfConnector(cs[0] ?? null))
      .catch(() => {})
      .finally(() => setWfLoading(false));

    clickupConnectorService.listConnectors()
      .then((cs) => setCuConnector(cs[0] ?? null))
      .catch(() => {})
      .finally(() => setCuLoading(false));

    clickupConnectorService.getObjectTypes()
      .then(setCuObjectMeta)
      .catch(() => {});
  }, []);

  const integrations = useMemo<Integration[]>(() => [
    mapWfConnector(wfConnector),
    mapCuConnector(cuConnector),
    ...STATIC_INTEGRATIONS,
  ], [wfConnector, cuConnector]);

  const filtered = integrations.filter((i) => {
    const s = searchTerm.toLowerCase();
    const matchName = i.name.toLowerCase().includes(s) || i.description.toLowerCase().includes(s);
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchName && matchStatus;
  });

  const connected = filtered.filter((i) => i.status === 'connected');
  const totalResources = connected.reduce((s, i) => s + (i.resources ?? 0), 0);
  const totalProjects = connected.reduce((s, i) => s + (i.projects ?? 0), 0);

  // ── Open configure ──
  const openConfig = (id: string) => {
    if (id === 'workfront') {
      setWfForm(wfConnector ? {
        connectorId: wfConnector.id, name: wfConnector.name, baseUrl: wfConnector.baseUrl,
        domain: wfConnector.domain, apiVersion: wfConnector.apiVersion,
        authType: wfConnector.authType, apiKey: '', oauthClientId: '', oauthClientSecret: '',
        syncFrequencyMinutes: String(wfConnector.syncFrequencyMinutes ?? 15),
        enabledObjects: wfConnector.objectConfigs.filter((c) => c.enabled).map((c) => c.objectCode),
      } : {
        connectorId: null, name: 'Adobe Workfront', baseUrl: '', domain: '',
        apiVersion: 'v14.0', authType: 'API_KEY', apiKey: '', oauthClientId: '',
        oauthClientSecret: '', syncFrequencyMinutes: '15', enabledObjects: WF_DEFAULT_ENABLED,
      });
    }
    if (id === 'clickup') {
      const defaultEnabled = cuObjectMeta.filter((m) => m.defaultEnabled).map((m) => m.code);
      setCuForm(cuConnector ? {
        connectorId: cuConnector.id, name: cuConnector.name, teamId: cuConnector.teamId,
        authType: cuConnector.authType, accessToken: '', oauthClientId: '', oauthClientSecret: '',
        syncFrequencyMinutes: String(cuConnector.syncFrequencyMinutes ?? 30),
        enabledObjects: cuConnector.objectConfigs.filter((c) => c.enabled).map((c) => c.objectCode),
      } : {
        connectorId: null, name: 'ClickUp', teamId: '', authType: 'PERSONAL_TOKEN',
        accessToken: '', oauthClientId: '', oauthClientSecret: '',
        syncFrequencyMinutes: '30', enabledObjects: defaultEnabled,
      });
    }
    setSelectedId(id);
    setShowConfigDialog(true);
  };

  // ── Save config ──
  const handleSave = async () => {
    if (selectedId === 'workfront') {
      if (!wfForm.baseUrl.trim() || !wfForm.domain.trim()) {
        toast.error('Base URL and Domain are required.'); return;
      }
      setWfSaving(true);
      try {
        let saved: WorkfrontConnector;
        if (wfForm.connectorId) {
          const dto: UpdateWorkfrontConnectorDTO = {
            name: wfForm.name, baseUrl: wfForm.baseUrl, domain: wfForm.domain,
            apiVersion: wfForm.apiVersion, authType: wfForm.authType,
            syncFrequencyMinutes: parseInt(wfForm.syncFrequencyMinutes) || 15,
          };
          if (wfForm.authType === 'API_KEY' && wfForm.apiKey) dto.apiKey = wfForm.apiKey;
          if (wfForm.authType === 'OAUTH2' && wfForm.oauthClientId) dto.oauthClientId = wfForm.oauthClientId;
          if (wfForm.authType === 'OAUTH2' && wfForm.oauthClientSecret) dto.oauthClientSecret = wfForm.oauthClientSecret;
          saved = await workfrontConnectorService.updateConnector(wfForm.connectorId, dto);
        } else {
          const dto: CreateWorkfrontConnectorDTO = {
            name: wfForm.name, baseUrl: wfForm.baseUrl, domain: wfForm.domain,
            apiVersion: wfForm.apiVersion, authType: wfForm.authType,
            syncFrequencyMinutes: parseInt(wfForm.syncFrequencyMinutes) || 15,
          };
          if (wfForm.apiKey) dto.apiKey = wfForm.apiKey;
          if (wfForm.oauthClientId) dto.oauthClientId = wfForm.oauthClientId;
          if (wfForm.oauthClientSecret) dto.oauthClientSecret = wfForm.oauthClientSecret;
          saved = await workfrontConnectorService.createConnector(dto);
        }
        // Update per-object enabled state
        for (const obj of WF_OBJECTS) {
          const shouldBeEnabled = wfForm.enabledObjects.includes(obj.code);
          const current = saved.objectConfigs.find((c) => c.objectCode === obj.code);
          if (current && current.enabled !== shouldBeEnabled) {
            await workfrontConnectorService.updateObjectConfig(saved.id, obj.code, { enabled: shouldBeEnabled }).catch(() => {});
          }
        }
        // Reload
        const fresh = await workfrontConnectorService.listConnectors();
        setWfConnector(fresh[0] ?? null);
        toast.success('Workfront configuration saved.');
        setShowConfigDialog(false);
      } catch (err: any) {
        toast.error(err?.message ?? 'Failed to save Workfront configuration.');
      } finally {
        setWfSaving(false);
      }
      return;
    }

    if (selectedId === 'clickup') {
      if (!cuForm.teamId.trim()) { toast.error('Workspace ID is required.'); return; }
      if (cuForm.authType === 'PERSONAL_TOKEN' && !cuForm.accessToken.trim() && !cuForm.connectorId) {
        toast.error('Access Token is required.'); return;
      }
      setCuSaving(true);
      try {
        let saved: ClickUpConnector;
        if (cuForm.connectorId) {
          const dto: UpdateClickUpConnectorDTO = {
            name: cuForm.name, teamId: cuForm.teamId, authType: cuForm.authType,
            syncFrequencyMinutes: parseInt(cuForm.syncFrequencyMinutes) || 30,
          };
          if (cuForm.accessToken) dto.accessToken = cuForm.accessToken;
          if (cuForm.oauthClientId) dto.oauthClientId = cuForm.oauthClientId;
          if (cuForm.oauthClientSecret) dto.oauthClientSecret = cuForm.oauthClientSecret;
          saved = await clickupConnectorService.updateConnector(cuForm.connectorId, dto);
        } else {
          const dto: CreateClickUpConnectorDTO = {
            name: cuForm.name, teamId: cuForm.teamId, authType: cuForm.authType,
            syncFrequencyMinutes: parseInt(cuForm.syncFrequencyMinutes) || 30,
            enabledObjects: cuForm.enabledObjects,
          };
          if (cuForm.accessToken) dto.accessToken = cuForm.accessToken;
          if (cuForm.oauthClientId) dto.oauthClientId = cuForm.oauthClientId;
          if (cuForm.oauthClientSecret) dto.oauthClientSecret = cuForm.oauthClientSecret;
          saved = await clickupConnectorService.createConnector(dto);
        }
        // Update per-object enabled state
        const allCodes = cuObjectMeta.map((m) => m.code);
        for (const code of allCodes) {
          const shouldBeEnabled = cuForm.enabledObjects.includes(code);
          const current = saved.objectConfigs.find((c) => c.objectCode === code);
          if (current && current.enabled !== shouldBeEnabled) {
            await clickupConnectorService.updateObjectConfig(saved.id, code, { enabled: shouldBeEnabled }).catch(() => {});
          }
        }
        const fresh = await clickupConnectorService.listConnectors();
        setCuConnector(fresh[0] ?? null);
        toast.success('ClickUp configuration saved.');
        setShowConfigDialog(false);
      } catch (err: any) {
        toast.error(err?.message ?? 'Failed to save ClickUp configuration.');
      } finally {
        setCuSaving(false);
      }
      return;
    }

    toast.success('Configuration saved.');
    setShowConfigDialog(false);
  };

  // ── Sync Now ──
  const handleSync = async (id: string) => {
    if (id === 'workfront') {
      if (!wfConnector) { toast.error('Configure Workfront first.'); return; }
      setWfSyncing(true);
      try {
        await workfrontConnectorService.triggerSync(wfConnector.id);
        toast.success('Workfront sync started.');
      } catch (err: any) { toast.error(err?.message ?? 'Sync failed.'); }
      finally { setWfSyncing(false); }
    } else if (id === 'clickup') {
      if (!cuConnector) { toast.error('Configure ClickUp first.'); return; }
      setCuSyncing(true);
      try {
        await clickupConnectorService.triggerSync(cuConnector.id);
        toast.success('ClickUp sync started.');
      } catch (err: any) { toast.error(err?.message ?? 'Sync failed.'); }
      finally { setCuSyncing(false); }
    } else {
      toast.info(`Sync triggered for ${id}.`);
    }
  };

  // ── Test Connection ──
  const handleTest = async (id: string) => {
    if (id === 'workfront' && wfConnector) {
      setWfTesting(true);
      try {
        const r = await workfrontConnectorService.testConnection(wfConnector.id);
        r.success ? toast.success(`Connected! Latency: ${r.latencyMs}ms`) : toast.error(`Failed: ${r.message}`);
      } catch (err: any) { toast.error(err?.message ?? 'Test failed.'); }
      finally { setWfTesting(false); }
    } else if (id === 'clickup' && cuConnector) {
      setCuTesting(true);
      try {
        const r = await clickupConnectorService.testConnection(cuConnector.id);
        r.success ? toast.success(`Connected! Latency: ${r.latencyMs}ms`) : toast.error(`Failed: ${r.message}`);
      } catch (err: any) { toast.error(err?.message ?? 'Test failed.'); }
      finally { setCuTesting(false); }
    }
  };

  const isSyncing = (id: string) => (id === 'workfront' && wfSyncing) || (id === 'clickup' && cuSyncing);
  const isTesting = (id: string) => (id === 'workfront' && wfTesting) || (id === 'clickup' && cuTesting);
  const isLoading = (id: string) => (id === 'workfront' && wfLoading) || (id === 'clickup' && cuLoading);
  const isLiveConnector = (id: string) => id === 'workfront' || id === 'clickup';

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Integrations</h1>
          <p className="text-gray-600 mt-1">Connect REP with PPM tools to sync resources and projects</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" />Custom Integration</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Integrations', value: integrations.length, icon: <Plug className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50', color: 'text-gray-900' },
          { label: 'Active Connections', value: connected.length, icon: <CheckCircle className="w-5 h-5 text-green-600" />, bg: 'bg-green-50', color: 'text-green-600' },
          { label: 'Synced Resources', value: totalResources, icon: <RefreshCw className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50', color: 'text-gray-900' },
          { label: 'Synced Projects', value: totalProjects, icon: <Zap className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50', color: 'text-gray-900' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 ${s.bg} rounded-lg`}>{s.icon}</div>
                <div>
                  <div className="text-sm text-gray-600">{s.label}</div>
                  <div className={`text-2xl font-semibold ${s.color}`}>{s.value}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="Search integrations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="md:col-span-2" />
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
              <option value="all">All Statuses</option>
              <option value="connected">Connected</option>
              <option value="disconnected">Disconnected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="ppm-tools">PPM Tools</TabsTrigger>
          <TabsTrigger value="custom-integrations">Custom Integrations</TabsTrigger>
          <TabsTrigger value="sync-logs">Sync Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="ppm-tools" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((integration) => (
              <Card key={integration.id} className={integration.status === 'connected' ? 'border-green-200' : ''}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${integration.color} rounded-lg flex items-center justify-center text-2xl`}>
                      {isLoading(integration.id)
                        ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                        : integration.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <p className="text-sm text-gray-500">{integration.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    {integration.status === 'connected'
                      ? <><CheckCircle className="w-4 h-4 text-green-600" /><Badge className="bg-green-100 text-green-700">Connected</Badge></>
                      : <><XCircle className="w-4 h-4 text-gray-400" /><Badge variant="secondary">Disconnected</Badge></>}
                  </div>

                  {integration.status === 'connected' && (
                    <>
                      <div className="space-y-2 text-sm">
                        {integration.lastSync && (
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-gray-600"><Calendar className="w-4 h-4" />Last Sync:</span>
                            <span className="font-medium">{integration.lastSync}</span>
                          </div>
                        )}
                        {integration.frequency && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Frequency:</span>
                            <span className="font-medium">{integration.frequency}</span>
                          </div>
                        )}
                        {integration.resources !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Resources:</span>
                            <span className="font-medium">{integration.resources}</span>
                          </div>
                        )}
                        {integration.projects !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Projects:</span>
                            <span className="font-medium">{integration.projects}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => openConfig(integration.id)}>
                          <Settings className="w-3 h-3" />Configure
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1" disabled={isSyncing(integration.id)} onClick={() => handleSync(integration.id)}>
                          {isSyncing(integration.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                          Sync
                        </Button>
                        {isLiveConnector(integration.id) ? (
                          <Button variant="outline" size="sm" className="gap-1" disabled={isTesting(integration.id)} onClick={() => handleTest(integration.id)}>
                            {isTesting(integration.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wifi className="w-3 h-3" />}
                            Test
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm">API details</Button>
                        )}
                      </div>
                    </>
                  )}

                  {integration.status === 'disconnected' && (
                    <Button className="w-full gap-2" onClick={() => openConfig(integration.id)}>
                      <Plug className="w-4 h-4" />
                      {isLiveConnector(integration.id) ? `Connect ${integration.name}` : 'Connect'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom-integrations" className="mt-6">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                  <Plus className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">Create Custom Integration</h3>
                <p className="text-gray-600">Build custom integrations using our REST API to connect with your internal systems.</p>
                <Button className="gap-2"><Plus className="w-4 h-4" />New Custom Integration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync-logs" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Recent Sync Activity</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {connected.map((i) => (
                  <div key={i.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${i.color} rounded-lg flex items-center justify-center text-lg`}>{i.icon}</div>
                      <div>
                        <div className="font-medium">{i.name}</div>
                        <div className="text-sm text-gray-600">Last synced: {i.lastSync ?? 'Never'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-green-50 text-green-700">Success</Badge>
                      <Button variant="ghost" size="sm">View Logs</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {connected.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-green-900">All Integrations Healthy</div>
                <div className="text-sm text-green-700 mt-1">
                  All {connected.length} active connections are syncing successfully.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Configure Dialog ── */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Configure — {selectedId === 'workfront' ? 'Adobe Workfront' : selectedId === 'clickup' ? 'ClickUp' : selectedId}
            </DialogTitle>
            <DialogDescription>
              {selectedId === 'workfront'
                ? 'Connect your Workfront instance and select which endpoints (object types) to sync.'
                : selectedId === 'clickup'
                ? 'Connect your ClickUp workspace and select which object types to sync.'
                : 'Configure authentication for this connector.'}
            </DialogDescription>
          </DialogHeader>

          {/* ── Workfront form ── */}
          {selectedId === 'workfront' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Connector Name</Label>
                <Input placeholder="e.g. Workfront Production" value={wfForm.name} onChange={(e) => setWfForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Base URL <span className="text-red-500">*</span></Label>
                <Input placeholder="https://your-company.my.workfront.com" value={wfForm.baseUrl} onChange={(e) => setWfForm((f) => ({ ...f, baseUrl: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Domain <span className="text-red-500">*</span></Label>
                  <Input placeholder="your-company" value={wfForm.domain} onChange={(e) => setWfForm((f) => ({ ...f, domain: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>API Version</Label>
                  <Input placeholder="v14.0" value={wfForm.apiVersion} onChange={(e) => setWfForm((f) => ({ ...f, apiVersion: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Authentication Method</Label>
                <Select value={wfForm.authType} onValueChange={(v: 'API_KEY' | 'OAUTH2') => setWfForm((f) => ({ ...f, authType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="API_KEY">API Key</SelectItem>
                    <SelectItem value="OAUTH2">OAuth 2.0</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {wfForm.authType === 'API_KEY' && (
                <div className="space-y-2 rounded-md border p-4">
                  <Label>API Key</Label>
                  <Input type="password" placeholder={wfForm.connectorId ? '(leave blank to keep existing)' : 'Enter API key'} value={wfForm.apiKey} onChange={(e) => setWfForm((f) => ({ ...f, apiKey: e.target.value }))} />
                </div>
              )}
              {wfForm.authType === 'OAUTH2' && (
                <div className="space-y-3 rounded-md border p-4">
                  <div className="font-medium text-sm">OAuth 2.0 Credentials</div>
                  <div className="space-y-2">
                    <Label>Client ID</Label>
                    <Input placeholder={wfForm.connectorId ? '(leave blank to keep existing)' : 'Client ID'} value={wfForm.oauthClientId} onChange={(e) => setWfForm((f) => ({ ...f, oauthClientId: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Client Secret</Label>
                    <Input type="password" placeholder={wfForm.connectorId ? '(leave blank to keep existing)' : 'Client Secret'} value={wfForm.oauthClientSecret} onChange={(e) => setWfForm((f) => ({ ...f, oauthClientSecret: e.target.value }))} />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Sync Frequency (minutes)</Label>
                <Input type="number" min={1} placeholder="15" value={wfForm.syncFrequencyMinutes} onChange={(e) => setWfForm((f) => ({ ...f, syncFrequencyMinutes: e.target.value }))} />
              </div>

              {/* Endpoint / Object selection */}
              <div className="space-y-2">
                <Label>Endpoint Objects to Sync</Label>
                <p className="text-xs text-gray-500">Select which Workfront object endpoints to pull data from.</p>
                <div className="rounded-md border p-3 space-y-2 max-h-52 overflow-y-auto">
                  {WF_OBJECTS.map((obj) => (
                    <div key={obj.code} className="flex items-start gap-2">
                      <Checkbox
                        id={`wf-${obj.code}`}
                        checked={wfForm.enabledObjects.includes(obj.code)}
                        onCheckedChange={(checked) =>
                          setWfForm((f) => ({
                            ...f,
                            enabledObjects: checked
                              ? [...f.enabledObjects, obj.code]
                              : f.enabledObjects.filter((c) => c !== obj.code),
                          }))
                        }
                      />
                      <div>
                        <Label htmlFor={`wf-${obj.code}`} className="text-sm font-medium cursor-pointer">
                          {obj.label} <span className="text-gray-400 font-mono text-xs">({obj.code})</span>
                        </Label>
                        <p className="text-xs text-gray-500">{obj.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ClickUp form ── */}
          {selectedId === 'clickup' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Connector Name</Label>
                <Input placeholder="e.g. ClickUp Production" value={cuForm.name} onChange={(e) => setCuForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Workspace ID (Team ID) <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g. 12345678 (find in ClickUp settings)" value={cuForm.teamId} onChange={(e) => setCuForm((f) => ({ ...f, teamId: e.target.value }))} />
                <p className="text-xs text-gray-500">Find in ClickUp → Settings → Workspace → Workspace ID</p>
              </div>
              <div className="space-y-2">
                <Label>Authentication Method</Label>
                <Select value={cuForm.authType} onValueChange={(v: 'PERSONAL_TOKEN' | 'OAUTH2') => setCuForm((f) => ({ ...f, authType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERSONAL_TOKEN">Personal API Token</SelectItem>
                    <SelectItem value="OAUTH2">OAuth 2.0</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {cuForm.authType === 'PERSONAL_TOKEN' && (
                <div className="space-y-2 rounded-md border p-4">
                  <Label>Personal API Token</Label>
                  <Input type="password" placeholder={cuForm.connectorId ? '(leave blank to keep existing)' : 'pk_xxxxxxxx...'} value={cuForm.accessToken} onChange={(e) => setCuForm((f) => ({ ...f, accessToken: e.target.value }))} />
                  <p className="text-xs text-gray-500">Find in ClickUp → Profile → Apps → API Token</p>
                </div>
              )}
              {cuForm.authType === 'OAUTH2' && (
                <div className="space-y-3 rounded-md border p-4">
                  <div className="font-medium text-sm">OAuth 2.0 Credentials</div>
                  <div className="space-y-2">
                    <Label>Client ID</Label>
                    <Input placeholder="OAuth App Client ID" value={cuForm.oauthClientId} onChange={(e) => setCuForm((f) => ({ ...f, oauthClientId: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Client Secret</Label>
                    <Input type="password" placeholder="OAuth App Client Secret" value={cuForm.oauthClientSecret} onChange={(e) => setCuForm((f) => ({ ...f, oauthClientSecret: e.target.value }))} />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Sync Frequency (minutes)</Label>
                <Input type="number" min={1} placeholder="30" value={cuForm.syncFrequencyMinutes} onChange={(e) => setCuForm((f) => ({ ...f, syncFrequencyMinutes: e.target.value }))} />
              </div>

              {/* ClickUp endpoint objects */}
              <div className="space-y-2">
                <Label>Endpoint Objects to Sync</Label>
                <p className="text-xs text-gray-500">Select which ClickUp object endpoints to pull data from.</p>
                <div className="rounded-md border p-3 space-y-2 max-h-52 overflow-y-auto">
                  {(cuObjectMeta.length > 0 ? cuObjectMeta : [
                    { code: 'SPACE', label: 'Spaces', description: 'Top-level workspace containers' },
                    { code: 'FOLDER', label: 'Folders', description: 'Folders within spaces' },
                    { code: 'LIST', label: 'Lists', description: 'Lists within folders or spaces' },
                    { code: 'TASK', label: 'Tasks', description: 'Tasks within lists' },
                    { code: 'MEMBER', label: 'Members', description: 'Workspace members' },
                    { code: 'GOAL', label: 'Goals', description: 'Goals and key results' },
                    { code: 'TIME_ENTRY', label: 'Time Entries', description: 'Time tracking entries' },
                  ]).map((obj) => (
                    <div key={obj.code} className="flex items-start gap-2">
                      <Checkbox
                        id={`cu-${obj.code}`}
                        checked={cuForm.enabledObjects.includes(obj.code)}
                        onCheckedChange={(checked) =>
                          setCuForm((f) => ({
                            ...f,
                            enabledObjects: checked
                              ? [...f.enabledObjects, obj.code]
                              : f.enabledObjects.filter((c) => c !== obj.code),
                          }))
                        }
                      />
                      <div>
                        <Label htmlFor={`cu-${obj.code}`} className="text-sm font-medium cursor-pointer">
                          {obj.label} <span className="text-gray-400 font-mono text-xs">({obj.code})</span>
                        </Label>
                        <p className="text-xs text-gray-500">{('description' in obj ? obj.description : '')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={wfSaving || cuSaving}>
              {(wfSaving || cuSaving) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
