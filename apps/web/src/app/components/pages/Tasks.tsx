import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  ListChecks,
  Plus,
  Search,
  Eye,
  Plug,
  Megaphone,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  X,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';
import { useBulkSelection } from '@/app/utils/use-bulk-selection';
import { BulkOperationsBar, BulkSelectCheckbox } from '@/app/components/common/BulkOperations';
import type { Page } from '@/app/App';

// ─── Types ────────────────────────────────────────────────────────────────────

type IntegrationSource = 'Workfront' | 'Jira' | 'ClickUp' | 'Asana' | 'Monday.com' | 'Zoho';
type TaskStatus = 'not-started' | 'in-progress' | 'blocked' | 'done';

interface TaskOwner { id: string; name: string; role: string; }

interface IntegratedTask {
  id: string;
  source: IntegrationSource;
  taskName: string;
  taskId: string;
  projectName: string;
  startDate: string;
  dueDate: string;
  status: TaskStatus;
  description: string;
  estimatedHours: number;
  owners: TaskOwner[];
  assignmentCount: number;
}

interface CampaignTask {
  id: string;
  taskName: string;
  taskId: string;
  campaignId: string;
  campaignName: string;
  startDate: string;
  dueDate: string;
  status: TaskStatus;
  description: string;
  estimatedHours: number;
  owners: TaskOwner[];
  assignmentCount: number;
}

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'planning' | 'completed' | 'paused';
  startDate: string;
  endDate: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INTEGRATION_SOURCES: IntegrationSource[] = ['Workfront', 'Jira', 'ClickUp', 'Asana', 'Monday.com', 'Zoho'];

const SOURCE_PREFIX: Record<IntegrationSource, string> = {
  Workfront: 'WF', Jira: 'JIRA', ClickUp: 'CU', Asana: 'ASN', 'Monday.com': 'MON', Zoho: 'ZHO',
};

const PROJECTS = [
  'Mobile App Redesign', 'Platform Core', 'Data Analytics Platform',
  'Brand Refresh', 'PDF Services', 'E-commerce Platform', 'Infrastructure Upgrade',
];

const USERS: TaskOwner[] = [
  { id: 'u1', name: 'Jacob Torres',  role: 'Backend Engineer' },
  { id: 'u2', name: 'Priya Nair',    role: 'Integration Engineer' },
  { id: 'u3', name: 'Michael Chen',  role: 'UX/UI Designer' },
  { id: 'u4', name: 'Anita Rao',     role: 'Content Strategist' },
  { id: 'u5', name: 'Marcus Lee',    role: 'Frontend Engineer' },
];

// ─── Mock data ────────────────────────────────────────────────────────────────

const initCampaigns: Campaign[] = [
  { id: 'CMP-001', name: 'Summer Launch 2026',    status: 'active',    startDate: '2026-04-01', endDate: '2026-06-30' },
  { id: 'CMP-002', name: 'Performance Max Q2',    status: 'active',    startDate: '2026-04-01', endDate: '2026-06-30' },
  { id: 'CMP-003', name: 'Brand Awareness H2',    status: 'planning',  startDate: '2026-07-01', endDate: '2026-12-31' },
];

const initIntegrated: IntegratedTask[] = [
  { id: 'it1', source: 'Workfront',  taskName: 'Design System Migration',  taskId: 'WF-2201',    projectName: 'Mobile App Redesign',       startDate: '2026-04-01', dueDate: '2026-05-15', status: 'in-progress', description: 'Migrate reusable components and token sets to the new design system.',          estimatedHours: 180, owners: [USERS[2]],         assignmentCount: 1 },
  { id: 'it2', source: 'Jira',       taskName: 'Auth Service Refactor',    taskId: 'JIRA-884',   projectName: 'Platform Core',             startDate: '2026-04-14', dueDate: '2026-04-30', status: 'not-started', description: 'Refactor JWT + OAuth2 middleware for compliance.',                           estimatedHours: 80,  owners: [USERS[1]],         assignmentCount: 1 },
  { id: 'it3', source: 'ClickUp',    taskName: 'ETL Pipeline Hardening',   taskId: 'CU-3301',    projectName: 'Data Analytics Platform',   startDate: '2026-03-15', dueDate: '2026-05-20', status: 'in-progress', description: 'Optimize ETL jobs and remove failure points in nightly processing.',          estimatedHours: 260, owners: [USERS[0]],         assignmentCount: 1 },
  { id: 'it4', source: 'Asana',      taskName: 'SEO Audit & Fixes',        taskId: 'ASN-512',    projectName: 'Brand Refresh',             startDate: '2026-05-01', dueDate: '2026-06-10', status: 'not-started', description: 'Full SEO audit and implementation of technical fixes.',                    estimatedHours: 60,  owners: [],                 assignmentCount: 0 },
  { id: 'it5', source: 'Monday.com', taskName: 'Back-end Schema Mapping',  taskId: 'MON-1101',   projectName: 'PDF Services',              startDate: '2026-04-07', dueDate: '2026-04-25', status: 'blocked',     description: 'Map source PDF schemas to canonical schema and validate transforms.',        estimatedHours: 140, owners: [USERS[0], USERS[1]], assignmentCount: 2 },
  { id: 'it6', source: 'Zoho',       taskName: 'CRM Data Sync Setup',      taskId: 'ZHO-301',    projectName: 'Platform Core',             startDate: '2026-04-20', dueDate: '2026-05-30', status: 'not-started', description: 'Set up bidirectional sync between Zoho CRM and internal platform.',          estimatedHours: 100, owners: [],                 assignmentCount: 0 },
];

const initCampaignTasks: CampaignTask[] = [
  { id: 'ct1', taskName: 'Q2 Creative Assets Production', taskId: 'CAM-301', campaignId: 'CMP-001', campaignName: 'Summer Launch 2026',  startDate: '2026-04-01', dueDate: '2026-05-01', status: 'in-progress', description: 'Produce all creative assets: banners, videos, social.',           estimatedHours: 80,  owners: [USERS[3]],         assignmentCount: 2 },
  { id: 'ct2', taskName: 'Social Media Calendar Setup',   taskId: 'CAM-302', campaignId: 'CMP-001', campaignName: 'Summer Launch 2026',  startDate: '2026-04-01', dueDate: '2026-04-20', status: 'done',        description: 'Plan and schedule social content across all channels.',          estimatedHours: 24,  owners: [USERS[3]],         assignmentCount: 0 },
  { id: 'ct3', taskName: 'Landing Page A/B Testing',      taskId: 'CAM-401', campaignId: 'CMP-002', campaignName: 'Performance Max Q2',  startDate: '2026-05-01', dueDate: '2026-06-05', status: 'not-started', description: 'Set up A/B test variants for landing pages.',                     estimatedHours: 40,  owners: [],                 assignmentCount: 0 },
  { id: 'ct4', taskName: 'Email Drip Copywriting',        taskId: 'CAM-402', campaignId: 'CMP-002', campaignName: 'Performance Max Q2',  startDate: '2026-04-14', dueDate: '2026-05-15', status: 'in-progress', description: 'Write 8-email drip sequence for lead nurturing.',                 estimatedHours: 32,  owners: [USERS[3]],         assignmentCount: 1 },
  { id: 'ct5', taskName: 'Influencer Brief Package',      taskId: 'CAM-303', campaignId: 'CMP-001', campaignName: 'Summer Launch 2026',  startDate: '2026-04-15', dueDate: '2026-05-10', status: 'not-started', description: 'Prepare briefing docs and asset kits for influencer partners.',   estimatedHours: 20,  owners: [],                 assignmentCount: 0 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sourceBadgeColor(source: IntegrationSource): string {
  const map: Record<IntegrationSource, string> = {
    Workfront: 'bg-orange-100 text-orange-700', Jira: 'bg-blue-100 text-blue-700',
    ClickUp: 'bg-purple-100 text-purple-700',   Asana: 'bg-pink-100 text-pink-700',
    'Monday.com': 'bg-red-100 text-red-700',    Zoho: 'bg-teal-100 text-teal-700',
  };
  return map[source] ?? 'bg-gray-100 text-gray-700';
}

function statusMeta(status: TaskStatus) {
  const map: Record<TaskStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
    'not-started': { label: 'Not Started', variant: 'outline',      color: 'text-gray-500' },
    'in-progress':  { label: 'In Progress', variant: 'secondary',    color: 'text-blue-600' },
    'blocked':      { label: 'Blocked',     variant: 'destructive',  color: 'text-red-600'  },
    'done':         { label: 'Done',        variant: 'default',      color: 'text-emerald-600' },
  };
  return map[status];
}

function campaignStatusColor(s: Campaign['status']): string {
  return ({ active: 'bg-emerald-100 text-emerald-700', planning: 'bg-blue-100 text-blue-700', completed: 'bg-gray-100 text-gray-600', paused: 'bg-amber-100 text-amber-700' })[s];
}

function genTaskId(prefix: string) {
  return `${prefix}-${Date.now().toString().slice(-4)}`;
}

// ─── Create Task Dialog ───────────────────────────────────────────────────────

interface IntTaskForm {
  source: IntegrationSource; projectName: string; taskName: string; taskId: string;
  startDate: string; dueDate: string; status: TaskStatus; description: string; estimatedHours: string;
}
interface CamTaskForm {
  campaignId: string; taskName: string; taskId: string;
  startDate: string; dueDate: string; status: TaskStatus; description: string; estimatedHours: string;
}

function emptyIntForm(): IntTaskForm {
  return { source: 'Workfront', projectName: '', taskName: '', taskId: genTaskId('WF'),
    startDate: '2026-04-10', dueDate: '2026-05-10', status: 'not-started', description: '', estimatedHours: '' };
}
function emptyCamForm(campaigns: Campaign[]): CamTaskForm {
  return { campaignId: campaigns[0]?.id ?? '', taskName: '', taskId: genTaskId('CAM'),
    startDate: '2026-04-10', dueDate: '2026-05-10', status: 'not-started', description: '', estimatedHours: '' };
}

function CreateTaskDialog({
  open, onClose, campaigns, defaultCampaignId,
  onCreateIntegrated, onCreateCampaign,
}: {
  open: boolean; onClose: () => void; campaigns: Campaign[];
  defaultCampaignId?: string;
  onCreateIntegrated: (t: IntegratedTask) => void;
  onCreateCampaign: (t: CampaignTask) => void;
}) {
  const [tab, setTab] = useState<'integrated' | 'campaign'>('integrated');
  const [intForm, setIntForm] = useState<IntTaskForm>(emptyIntForm());
  const [camForm, setCamForm] = useState<CamTaskForm>(() => emptyCamForm(campaigns));

  useEffect(() => {
    if (open && defaultCampaignId) {
      setTab('campaign');
      setCamForm(f => ({ ...f, campaignId: defaultCampaignId }));
    } else if (open) {
      setTab('integrated');
    }
  }, [open, defaultCampaignId]);

  function handleSourceChange(src: IntegrationSource) {
    setIntForm(f => ({ ...f, source: src, taskId: genTaskId(SOURCE_PREFIX[src]) }));
  }

  function handleSubmit() {
    if (tab === 'integrated') {
      onCreateIntegrated({
        id: `it${Date.now()}`, source: intForm.source, taskName: intForm.taskName,
        taskId: intForm.taskId, projectName: intForm.projectName,
        startDate: intForm.startDate, dueDate: intForm.dueDate,
        status: intForm.status, description: intForm.description,
        estimatedHours: parseFloat(intForm.estimatedHours) || 0,
        owners: [], assignmentCount: 0,
      });
      setIntForm(emptyIntForm());
    } else {
      const campaign = campaigns.find(c => c.id === camForm.campaignId);
      onCreateCampaign({
        id: `ct${Date.now()}`, taskName: camForm.taskName, taskId: camForm.taskId,
        campaignId: camForm.campaignId, campaignName: campaign?.name ?? '',
        startDate: camForm.startDate, dueDate: camForm.dueDate,
        status: camForm.status, description: camForm.description,
        estimatedHours: parseFloat(camForm.estimatedHours) || 0,
        owners: [], assignmentCount: 0,
      });
      setCamForm(emptyCamForm(campaigns));
    }
    onClose();
  }

  const canSubmit = tab === 'integrated'
    ? !!(intForm.taskName && intForm.projectName && intForm.taskId)
    : !!(camForm.taskName && camForm.campaignId && camForm.taskId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" /> Create New Task
          </DialogTitle>
          <DialogDescription>
            Create an integrated task (synced from a PPM tool) or a campaign task.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={v => setTab(v as typeof tab)} className="pt-1">
          <TabsList className="w-full">
            <TabsTrigger value="integrated" className="flex-1 gap-2">
              <Plug className="w-3.5 h-3.5" /> Integrated Task
            </TabsTrigger>
            <TabsTrigger value="campaign" className="flex-1 gap-2">
              <Megaphone className="w-3.5 h-3.5" /> Campaign Task
            </TabsTrigger>
          </TabsList>

          {/* ── Integrated Form ── */}
          <TabsContent value="integrated" className="space-y-4 pt-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Source / PPM Tool <span className="text-red-500">*</span></Label>
                <Select value={intForm.source} onValueChange={v => handleSourceChange(v as IntegrationSource)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INTEGRATION_SOURCES.map(s => (
                      <SelectItem key={s} value={s}>
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full mr-2 ${sourceBadgeColor(s)}`}>{s}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Task ID</Label>
                <Input value={intForm.taskId} onChange={e => setIntForm(f => ({ ...f, taskId: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Task Name <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. API Gateway Migration" value={intForm.taskName}
                onChange={e => setIntForm(f => ({ ...f, taskName: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <Label>Project <span className="text-red-500">*</span></Label>
              <Select value={intForm.projectName} onValueChange={v => setIntForm(f => ({ ...f, projectName: v }))}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {PROJECTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input type="date" value={intForm.startDate} onChange={e => setIntForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input type="date" value={intForm.dueDate} onChange={e => setIntForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={intForm.status} onValueChange={v => setIntForm(f => ({ ...f, status: v as TaskStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Estimated Hours</Label>
              <Input type="number" min={0} placeholder="e.g. 80" value={intForm.estimatedHours}
                onChange={e => setIntForm(f => ({ ...f, estimatedHours: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} placeholder="Describe the task scope and objectives…"
                value={intForm.description} onChange={e => setIntForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </TabsContent>

          {/* ── Campaign Form ── */}
          <TabsContent value="campaign" className="space-y-4 pt-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Campaign <span className="text-red-500">*</span></Label>
                <Select value={camForm.campaignId} onValueChange={v => setCamForm(f => ({ ...f, campaignId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select campaign" /></SelectTrigger>
                  <SelectContent>
                    {campaigns.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        <div>
                          <div className="font-medium text-sm">{c.name}</div>
                          <div className="text-xs text-gray-400 capitalize">{c.status}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Task ID</Label>
                <Input value={camForm.taskId} onChange={e => setCamForm(f => ({ ...f, taskId: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Task Name <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. Campaign Video Script" value={camForm.taskName}
                onChange={e => setCamForm(f => ({ ...f, taskName: e.target.value }))} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input type="date" value={camForm.startDate} onChange={e => setCamForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input type="date" value={camForm.dueDate} onChange={e => setCamForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={camForm.status} onValueChange={v => setCamForm(f => ({ ...f, status: v as TaskStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Estimated Hours</Label>
              <Input type="number" min={0} placeholder="e.g. 40" value={camForm.estimatedHours}
                onChange={e => setCamForm(f => ({ ...f, estimatedHours: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} placeholder="Describe the campaign task scope…"
                value={camForm.description} onChange={e => setCamForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Task Detail Dialog ───────────────────────────────────────────────────────

function TaskDetailDialog({
  task, type, onClose, onPageChange,
}: {
  task: IntegratedTask | CampaignTask | null;
  type: 'integrated' | 'campaign';
  onClose: () => void;
  onPageChange: (p: Page) => void;
}) {
  if (!task) return null;
  const sm = statusMeta(task.status);
  const isInt = type === 'integrated';
  const intTask = task as IntegratedTask;
  const camTask = task as CampaignTask;

  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            {isInt
              ? <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${sourceBadgeColor(intTask.source)}`}>{intTask.source}</span>
              : <span className="text-xs font-semibold px-2 py-0.5 rounded-full mt-1 bg-orange-100 text-orange-700">{camTask.campaignName}</span>
            }
            <div>
              <DialogTitle className="text-xl">{task.taskName}</DialogTitle>
              <DialogDescription className="font-mono text-xs">{task.taskId}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Meta grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg px-3 py-2.5">
              <div className="text-xs text-gray-400 mb-1">Status</div>
              <Badge variant={sm.variant} className="text-xs">{sm.label}</Badge>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2.5">
              <div className="text-xs text-gray-400 mb-1">Estimated Hrs</div>
              <div className="font-semibold text-gray-800 text-sm">{task.estimatedHours}h</div>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2.5">
              <div className="text-xs text-gray-400 mb-1">Start Date</div>
              <div className="font-medium text-gray-800 text-sm">{task.startDate}</div>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2.5">
              <div className="text-xs text-gray-400 mb-1">Due Date</div>
              <div className="font-medium text-gray-800 text-sm">{task.dueDate}</div>
            </div>
          </div>

          {isInt && (
            <div className="bg-gray-50 rounded-lg px-3 py-2.5">
              <div className="text-xs text-gray-400 mb-1">Project</div>
              <div className="font-medium text-gray-800 text-sm">{intTask.projectName}</div>
            </div>
          )}

          {!isInt && (
            <div className="bg-orange-50 rounded-lg px-3 py-2.5 border border-orange-100">
              <div className="text-xs text-gray-400 mb-1">Campaign</div>
              <div className="font-medium text-orange-700 text-sm">{camTask.campaignName}</div>
              <div className="text-xs text-gray-400">{camTask.campaignId}</div>
            </div>
          )}

          {task.description && (
            <div>
              <Label className="text-xs text-gray-500 uppercase tracking-wide">Description</Label>
              <p className="mt-1.5 text-sm text-gray-700 leading-relaxed">{task.description}</p>
            </div>
          )}

          {task.owners.length > 0 && (
            <div>
              <Label className="text-xs text-gray-500 uppercase tracking-wide">Owners</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {task.owners.map(o => (
                  <div key={o.id} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs">
                      {o.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{o.name}</div>
                      <div className="text-xs text-gray-400">{o.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assignment CTA */}
          <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-blue-800">
                  {task.assignmentCount > 0
                    ? `${task.assignmentCount} assignment${task.assignmentCount > 1 ? 's' : ''} on this task`
                    : 'No assignments yet'}
                </div>
                <div className="text-xs text-blue-600">Manage resources in the Assignments page</div>
              </div>
            </div>
            <Button size="sm" className="gap-1.5" onClick={() => { onClose(); onPageChange('assignments'); }}>
              Manage Assignments <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Campaign Group (campaign tab) ────────────────────────────────────────────

function CampaignGroup({
  campaign, tasks, onViewTask, onAddTask, onPageChange,
}: {
  campaign: Campaign;
  tasks: CampaignTask[];
  onViewTask: (t: CampaignTask) => void;
  onAddTask: (campaignId: string) => void;
  onPageChange: (p: Page) => void;
  isSelected: (id: string) => boolean;
  toggleItem: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const totalHours      = tasks.reduce((s, t) => s + t.estimatedHours, 0);
  const totalAssignments = tasks.reduce((s, t) => s + t.assignmentCount, 0);
  const unassigned      = tasks.filter(t => t.assignmentCount === 0).length;

  return (
    <Card className="overflow-hidden">
      {/* Campaign header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <div className="text-gray-400">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <Megaphone className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{campaign.name}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${campaignStatusColor(campaign.status)}`}>
                {campaign.status}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-0.5 text-xs text-gray-400">
              <span>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
              <span>{totalAssignments} assignment{totalAssignments !== 1 ? 's' : ''}</span>
              <span>{totalHours}h estimated</span>
              {unassigned > 0 && <span className="text-amber-600 font-medium">{unassigned} unassigned</span>}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 shrink-0"
          onClick={e => { e.stopPropagation(); onAddTask(campaign.id); }}>
          <Plus className="w-3.5 h-3.5" /> Add Task
        </Button>
      </div>

      {/* Task rows */}
      {expanded && (
        <div className="divide-y divide-gray-50">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No tasks yet.{' '}
              <button className="text-blue-500 hover:underline" onClick={() => onAddTask(campaign.id)}>
                Create one
              </button>
            </div>
          ) : (
            tasks.map(task => {
              const sm = statusMeta(task.status);
              return (
                <div key={task.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center gap-3">
                      <BulkSelectCheckbox checked={!!isSelected(task.id)} onCheckedChange={() => toggleItem(task.id)} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900 text-sm">{task.taskName}</span>
                          <Badge variant={sm.variant} className="text-xs">{sm.label}</Badge>
                          {task.assignmentCount > 0
                            ? <Badge variant="secondary" className="text-xs gap-1"><ClipboardList className="w-3 h-3" />{task.assignmentCount}</Badge>
                            : <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">Unassigned</Badge>
                          }
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {task.taskId} · {task.estimatedHours}h · Due {task.dueDate}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-4">
                    <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-gray-600"
                      onClick={() => onViewTask(task)}>
                      <Eye className="w-3.5 h-3.5" /> View
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5"
                      onClick={() => onPageChange('assignments')}>
                      <ClipboardList className="w-3.5 h-3.5" /> Assignments
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface TasksProps { onPageChange?: (p: Page) => void; }

export function Tasks({ onPageChange = () => {} }: TasksProps) {
  const [intTasks,    setIntTasks]    = useState(initIntegrated);
  const [camTasks,    setCamTasks]    = useState(initCampaignTasks);
  const [campaigns]                   = useState(initCampaigns);
  const [activeTab,   setActiveTab]   = useState<'integrated' | 'campaign'>('integrated');
  const [search,      setSearch]      = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | IntegrationSource>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');

  const [createOpen,    setCreateOpen]    = useState(false);
  const [createForCampaign, setCreateForCampaign] = useState<string | undefined>();
  const [justCreated,   setJustCreated]   = useState<{ name: string; type: 'integrated' | 'campaign' } | null>(null);

  const allTasks = useMemo(() => [
    ...intTasks.map(t => ({ ...t, taskType: 'integrated' })),
    ...camTasks.map(t => ({ ...t, taskType: 'campaign' })),
  ], [intTasks, camTasks]);

  const {
    selectedIds,
    selectedCount,
    toggleItem,
    toggleAll,
    clearSelection,
    isSelected,
    allSelected,
  } = useBulkSelection(allTasks);

  function openCreateFor(campaignId?: string) {
    setCreateForCampaign(campaignId);
    setCreateOpen(true);
  }

  function handleCreateIntegrated(task: IntegratedTask) {
    setIntTasks(ts => [...ts, task]);
    setJustCreated({ name: task.taskName, type: 'integrated' });
    setActiveTab('integrated');
    setTimeout(() => setJustCreated(null), 8000);
  }

  function handleCreateCampaign(task: CampaignTask) {
    setCamTasks(ts => [...ts, task]);
    setJustCreated({ name: task.taskName, type: 'campaign' });
    setActiveTab('campaign');
    setTimeout(() => setJustCreated(null), 8000);
  }

  // Filtered integrated tasks
  const filteredInt = useMemo(() => intTasks.filter(t => {
    const q = search.toLowerCase();
    return (
      (t.taskName.toLowerCase().includes(q) || t.taskId.toLowerCase().includes(q) || t.projectName.toLowerCase().includes(q)) &&
      (sourceFilter === 'all' || t.source === sourceFilter) &&
      (statusFilter === 'all' || t.status === statusFilter)
    );
  }), [intTasks, search, sourceFilter, statusFilter]);

  // Campaign groups
  const campaignGroups = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = camTasks.filter(t =>
      t.taskName.toLowerCase().includes(q) || t.taskId.toLowerCase().includes(q) || t.campaignName.toLowerCase().includes(q)
    );
    const map = new Map<string, { campaign: Campaign; tasks: CampaignTask[] }>();
    for (const c of campaigns) map.set(c.id, { campaign: c, tasks: [] });
    for (const t of filtered) {
      if (!map.has(t.campaignId)) map.set(t.campaignId, { campaign: { id: t.campaignId, name: t.campaignName, status: 'active', startDate: '', endDate: '' }, tasks: [] });
      map.get(t.campaignId)!.tasks.push(t);
    }
    return Array.from(map.values());
  }, [camTasks, campaigns, search]);

  const intStats = {
    total: filteredInt.length,
    unassigned: filteredInt.filter(t => t.assignmentCount === 0).length,
    totalHours: filteredInt.reduce((s, t) => s + t.estimatedHours, 0),
  };
  const camStats = {
    total: camTasks.length,
    unassigned: camTasks.filter(t => t.assignmentCount === 0).length,
    totalHours: camTasks.reduce((s, t) => s + t.estimatedHours, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ListChecks className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-semibold text-gray-900">Tasks</h1>
          </div>
          <p className="text-gray-500 mt-1 text-sm">
            Manage integrated and campaign tasks with resource assignments
          </p>
        </div>
        <Button className="gap-2" onClick={() => openCreateFor()}>
          <Plus className="w-4 h-4" /> Create Task
        </Button>
      </div>

      {/* Post-creation banner */}
      {justCreated && (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">
              Task "<strong>{justCreated.name}</strong>" created successfully!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
              onClick={() => { setJustCreated(null); onPageChange('assignments'); }}>
              <ClipboardList className="w-3.5 h-3.5" /> Add Assignment <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <button onClick={() => setJustCreated(null)} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stats chips */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 rounded-lg px-3 py-2 text-sm">
          <Plug className="w-3.5 h-3.5" />
          <span><strong>{intStats.total}</strong> Integrated · {intStats.totalHours}h estimated</span>
          {intStats.unassigned > 0 && <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 ml-1">{intStats.unassigned} unassigned</Badge>}
        </div>
        <div className="flex items-center gap-2 bg-orange-50 text-orange-700 rounded-lg px-3 py-2 text-sm">
          <Megaphone className="w-3.5 h-3.5" />
          <span><strong>{camStats.total}</strong> Campaign · {camStats.totalHours}h estimated</span>
          {camStats.unassigned > 0 && <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 ml-1">{camStats.unassigned} unassigned</Badge>}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as typeof activeTab)}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList>
            <TabsTrigger value="integrated" className="gap-2">
              <Plug className="w-4 h-4" /> Integrated Tasks
              <Badge variant="secondary" className="ml-1 text-xs">{filteredInt.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="campaign" className="gap-2">
              <Megaphone className="w-4 h-4" /> Campaign Tasks
              <Badge variant="secondary" className="ml-1 text-xs">{camTasks.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Search & filters (integrated only) */}
          {activeTab === 'integrated' && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-9 w-52" />
              </div>
              <Select value={sourceFilter} onValueChange={v => setSourceFilter(v as typeof sourceFilter)}>
                <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="All Sources" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {INTEGRATION_SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={v => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {activeTab === 'campaign' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search tasks or campaigns…" value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-9 w-60" />
            </div>
          )}
        </div>

        {/* ── Integrated tab ── */}
        <TabsContent value="integrated" className="pt-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Integrated Tasks ({filteredInt.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <BulkSelectCheckbox checked={allSelected} onCheckedChange={toggleAll} />
                      </TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Est. Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assignments</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInt.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-400 py-10">
                          No integrated tasks match your filters.
                        </TableCell>
                      </TableRow>
                    ) : filteredInt.map(task => {
                      const sm = statusMeta(task.status);
                      return (
                        <TableRow key={task.id} className={isSelected(task.id) ? 'bg-blue-50/50' : ''}>
                          <TableCell>
                            <BulkSelectCheckbox checked={isSelected(task.id)} onCheckedChange={() => toggleItem(task.id)} />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-gray-900 text-sm">{task.taskName}</div>
                            <div className="text-xs text-gray-400 font-mono">{task.taskId}</div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{task.projectName}</TableCell>
                          <TableCell className="text-sm text-gray-600">{task.dueDate}</TableCell>
                          <TableCell className="text-sm font-medium text-gray-700">{task.estimatedHours}h</TableCell>
                          <TableCell>
                            <Badge variant={sm.variant} className="text-xs">{sm.label}</Badge>
                          </TableCell>
                          <TableCell>
                            {task.assignmentCount > 0
                              ? <Badge variant="secondary" className="text-xs gap-1"><ClipboardList className="w-3 h-3" />{task.assignmentCount}</Badge>
                              : <span className="text-xs text-amber-600 font-medium">Unassigned</span>}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1.5">
                              <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => { setDetailTask(task); setDetailType('integrated'); }}>
                                <Eye className="w-3.5 h-3.5" /> View
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => onPageChange('assignments')}>
                                <ClipboardList className="w-3.5 h-3.5" /> Assign
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Campaign tab ── */}
        <TabsContent value="campaign" className="space-y-4 pt-2">
          <p className="text-xs text-gray-400">
            Tasks are grouped by campaign. Expand each campaign to view, create, and manage tasks.
          </p>
          {campaignGroups.map(({ campaign, tasks }) => (
            <CampaignGroup
              key={campaign.id}
              campaign={campaign}
              tasks={tasks}
              onViewTask={t => { setDetailTask(t); setDetailType('campaign'); }}
              onAddTask={id => openCreateFor(id)}
              onPageChange={onPageChange}
              isSelected={isSelected}
              toggleItem={toggleItem}
            />
          ))}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateTaskDialog
        open={createOpen}
        onClose={() => { setCreateOpen(false); setCreateForCampaign(undefined); }}
        campaigns={campaigns}
        defaultCampaignId={createForCampaign}
        onCreateIntegrated={handleCreateIntegrated}
        onCreateCampaign={handleCreateCampaign}
      />

      <TaskDetailDialog
        task={detailTask}
        type={detailType}
        onClose={() => setDetailTask(null)}
        onPageChange={onPageChange}
      />

      <BulkOperationsBar
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
        onArchiveSelected={() => {
          toast.success(`Archived ${selectedCount} tasks`);
          clearSelection();
        }}
        onDeleteSelected={() => {
          toast.success(`Deleted ${selectedCount} tasks`);
          clearSelection();
        }}
      />
    </div>
  );
}
