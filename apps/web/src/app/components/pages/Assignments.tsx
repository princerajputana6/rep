import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/app/components/ui/collapsible';
import { Tooltip } from '@/app/components/ui/tooltip';
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
  ClipboardList,
  Plus,
  Search,
  Plug,
  Megaphone,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  User,
  Briefcase,
  Clock,
  DollarSign,
  Trash2,
  Edit2,
  Wand2,
  PenLine,
  AlertTriangle,
  Copy,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  X,
} from 'lucide-react';

import { toast } from 'sonner';
import { useBulkSelection } from '@/app/utils/use-bulk-selection';
import { BulkOperationsBar, BulkSelectCheckbox } from '@/app/components/common/BulkOperations';

// ─── Types ────────────────────────────────────────────────────────────────────

type IntegrationSource = 'Workfront' | 'Jira' | 'ClickUp' | 'Asana' | 'Monday.com' | 'Zoho';
type TaskStatus = 'not-started' | 'in-progress' | 'blocked' | 'done';
type AssignmentType = 'job-role' | 'user';
type DistributionType = 'automatic' | 'manual';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
type Day = (typeof DAYS)[number];

interface DailyHours {
  Mon: number; Tue: number; Wed: number; Thu: number;
  Fri: number; Sat: number; Sun: number;
}

interface Assignment {
  id: string;
  assignmentType: AssignmentType;
  userId?: string;
  userName?: string;
  jobRole: string;
  plannedHours: number;
  actualHours: number;
  billRate: number;
  costRate: number;
  startDate: string;
  endDate: string;
  weekOf: string;
  distributionType: DistributionType;
  dailyHours: DailyHours;
  notes: string;
}

interface IntegratedTask {
  id: string;
  source: IntegrationSource;
  taskName: string;
  taskId: string;
  projectName: string;
  dueDate: string;
  status: TaskStatus;
  assignments: Assignment[];
}

interface CampaignTask {
  id: string;
  taskName: string;
  taskId: string;
  campaignName: string;
  campaignId: string;
  dueDate: string;
  status: TaskStatus;
  assignments: Assignment[];
}

interface FilterState {
  assignmentType: 'all' | AssignmentType;
  taskStatus: 'all' | TaskStatus;
  source: 'all' | IntegrationSource;
}

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'planning' | 'completed' | 'paused';
  startDate: string;
  endDate: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CAMPAIGNS: Campaign[] = [
  { id: 'CMP-001', name: 'Summer Launch 2026',  status: 'active',   startDate: '2026-04-01', endDate: '2026-06-30' },
  { id: 'CMP-002', name: 'Performance Max Q2',  status: 'active',   startDate: '2026-04-01', endDate: '2026-06-30' },
  { id: 'CMP-003', name: 'Brand Awareness H2',  status: 'planning', startDate: '2026-07-01', endDate: '2026-12-31' },
];

const USERS = [
  { id: 'u1', name: 'Jacob Torres',  email: 'jacob@agency.com' },
  { id: 'u2', name: 'Priya Nair',    email: 'priya@agency.com' },
  { id: 'u3', name: 'Michael Chen',  email: 'mchen@agency.com' },
  { id: 'u4', name: 'Anita Rao',     email: 'anita@agency.com' },
  { id: 'u5', name: 'Marcus Lee',    email: 'marcus@agency.com' },
];

const JOB_ROLES = [
  'Backend Engineer', 'Frontend Engineer', 'Full-Stack Developer',
  'UX/UI Designer', 'Data Engineer', 'Integration Engineer',
  'Project Manager', 'QA Engineer', 'DevOps Engineer', 'Content Strategist',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMondayOf(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

function getWeekDates(mondayStr: string): string[] {
  if (!mondayStr) return [];
  const monday = new Date(mondayStr + 'T00:00:00');
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

function fmtShort(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function weeksBetween(start: string, end: string): number {
  if (!start || !end) return 1;
  const days = Math.max(1, (new Date(end).getTime() - new Date(start).getTime()) / 86400000);
  return Math.max(1, days / 7);
}

function datesOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
  if (!s1 || !e1 || !s2 || !e2) return false;
  return s1 < e2 && e1 > s2;
}

function makeAutoDaily(hours: number): DailyHours {
  const perDay = parseFloat((hours / 5).toFixed(1));
  const last   = parseFloat((hours - perDay * 4).toFixed(1));
  return { Mon: perDay, Tue: perDay, Wed: perDay, Thu: perDay, Fri: last, Sat: 0, Sun: 0 };
}

function totalDaily(d: DailyHours): number {
  return DAYS.reduce((s, day) => s + (d[day] ?? 0), 0);
}

function sourceBadgeColor(source: IntegrationSource): string {
  const map: Record<IntegrationSource, string> = {
    Workfront:    'bg-orange-100 text-orange-700',
    Jira:         'bg-blue-100 text-blue-700',
    ClickUp:      'bg-purple-100 text-purple-700',
    Asana:        'bg-pink-100 text-pink-700',
    'Monday.com': 'bg-red-100 text-red-700',
    Zoho:         'bg-teal-100 text-teal-700',
  };
  return map[source] ?? 'bg-gray-100 text-gray-700';
}

function statusBadge(status: TaskStatus) {
  const map: Record<TaskStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    'not-started': { label: 'Not Started', variant: 'outline' },
    'in-progress':  { label: 'In Progress',  variant: 'secondary' },
    'blocked':      { label: 'Blocked',       variant: 'destructive' },
    'done':         { label: 'Done',           variant: 'default' },
  };
  return map[status];
}

function exportToCSV(intTasks: IntegratedTask[], camTasks: CampaignTask[]) {
  const header = [
    'Tab','Task Name','Task ID','Assignment Type','Assignee','Job Role',
    'Planned Hrs','Actual Hrs','Bill Rate','Cost Rate','Margin',
    'Start Date','End Date','Distribution','Notes',
  ];
  const rows: string[][] = [header];

  const push = (tab: string, taskName: string, taskId: string, a: Assignment) => {
    rows.push([
      tab, taskName, taskId,
      a.assignmentType === 'user' ? 'User' : 'Job Role',
      a.assignmentType === 'user' ? (a.userName ?? '') : a.jobRole,
      a.jobRole,
      String(a.plannedHours), String(a.actualHours),
      String(a.billRate), String(a.costRate),
      String(a.billRate - a.costRate),
      a.startDate, a.endDate, a.distributionType, a.notes,
    ]);
  };

  intTasks.forEach(t => t.assignments.forEach(a => push('Integrated', t.taskName, t.taskId, a)));
  camTasks.forEach(t => t.assignments.forEach(a => push('Campaign',   t.taskName, t.taskId, a)));

  const csv = rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const el   = document.createElement('a');
  el.href = url; el.download = 'assignments.csv'; el.click();
  URL.revokeObjectURL(url);
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const initIntegrated: IntegratedTask[] = [
  {
    id: 'it1', source: 'Workfront', taskName: 'Design System Migration',
    taskId: 'WF-2201', projectName: 'Mobile App Redesign',
    dueDate: '2026-05-15', status: 'in-progress',
    assignments: [
      { id: 'a1', assignmentType: 'user', userId: 'u3', userName: 'Michael Chen',
        jobRole: 'UX/UI Designer', plannedHours: 80, actualHours: 32,
        billRate: 145, costRate: 95, startDate: '2026-04-01', endDate: '2026-05-15',
        weekOf: '2026-04-07', distributionType: 'automatic',
        dailyHours: makeAutoDaily(80), notes: 'Token migration and component audit.' },
    ],
  },
  {
    id: 'it2', source: 'Jira', taskName: 'Auth Service Refactor',
    taskId: 'JIRA-884', projectName: 'Platform Core',
    dueDate: '2026-04-30', status: 'not-started',
    assignments: [
      { id: 'a7', assignmentType: 'user', userId: 'u2', userName: 'Priya Nair',
        jobRole: 'Integration Engineer', plannedHours: 40, actualHours: 0,
        billRate: 155, costRate: 100, startDate: '2026-04-14', endDate: '2026-04-30',
        weekOf: '2026-04-14', distributionType: 'automatic',
        dailyHours: makeAutoDaily(40), notes: 'JWT + OAuth2 refactor.' },
    ],
  },
  {
    id: 'it3', source: 'ClickUp', taskName: 'ETL Pipeline Hardening',
    taskId: 'CU-3301', projectName: 'Data Analytics Platform',
    dueDate: '2026-05-20', status: 'in-progress',
    assignments: [
      { id: 'a2', assignmentType: 'job-role', jobRole: 'Data Engineer',
        plannedHours: 120, actualHours: 90, billRate: 155, costRate: 100,
        startDate: '2026-03-15', endDate: '2026-05-20', weekOf: '2026-04-07',
        distributionType: 'manual',
        dailyHours: { Mon: 30, Tue: 30, Wed: 20, Thu: 20, Fri: 20, Sat: 0, Sun: 0 },
        notes: '' },
    ],
  },
  {
    id: 'it4', source: 'Asana', taskName: 'SEO Audit & Fixes',
    taskId: 'ASN-512', projectName: 'Brand Refresh',
    dueDate: '2026-06-10', status: 'not-started',
    assignments: [],
  },
  {
    id: 'it5', source: 'Monday.com', taskName: 'Back-end Schema Mapping',
    taskId: 'MON-1101', projectName: 'PDF Services',
    dueDate: '2026-04-25', status: 'blocked',
    assignments: [
      { id: 'a3', assignmentType: 'user', userId: 'u1', userName: 'Jacob Torres',
        jobRole: 'Backend Engineer', plannedHours: 40, actualHours: 15,
        billRate: 160, costRate: 105, startDate: '2026-04-07', endDate: '2026-04-25',
        weekOf: '2026-04-07', distributionType: 'automatic',
        dailyHours: makeAutoDaily(40), notes: 'Schema mapping + transformer tests.' },
      { id: 'a4', assignmentType: 'user', userId: 'u2', userName: 'Priya Nair',
        jobRole: 'Integration Engineer', plannedHours: 60, actualHours: 20,
        billRate: 150, costRate: 98, startDate: '2026-04-07', endDate: '2026-04-25',
        weekOf: '2026-04-07', distributionType: 'manual',
        dailyHours: { Mon: 12, Tue: 12, Wed: 12, Thu: 12, Fri: 12, Sat: 0, Sun: 0 },
        notes: '' },
    ],
  },
];

const initCampaign: CampaignTask[] = [
  {
    id: 'ct1', taskName: 'Q2 Creative Assets Production',
    taskId: 'CAM-301', campaignName: 'Summer Launch 2026', campaignId: 'CMP-001',
    dueDate: '2026-05-01', status: 'in-progress',
    assignments: [
      { id: 'a5', assignmentType: 'user', userId: 'u4', userName: 'Anita Rao',
        jobRole: 'Content Strategist', plannedHours: 50, actualHours: 20,
        billRate: 130, costRate: 85, startDate: '2026-04-01', endDate: '2026-05-01',
        weekOf: '2026-04-07', distributionType: 'automatic',
        dailyHours: makeAutoDaily(50), notes: '' },
      // Jacob Torres also on this task — overlapping dates with a3 → conflict
      { id: 'a8', assignmentType: 'user', userId: 'u1', userName: 'Jacob Torres',
        jobRole: 'Backend Engineer', plannedHours: 20, actualHours: 5,
        billRate: 160, costRate: 105, startDate: '2026-04-10', endDate: '2026-04-30',
        weekOf: '2026-04-14', distributionType: 'automatic',
        dailyHours: makeAutoDaily(20), notes: 'Campaign API support.' },
    ],
  },
  {
    id: 'ct2', taskName: 'Social Media Calendar Setup',
    taskId: 'CAM-302', campaignName: 'Summer Launch 2026', campaignId: 'CMP-001',
    dueDate: '2026-04-20', status: 'done',
    assignments: [],
  },
  {
    id: 'ct3', taskName: 'Landing Page A/B Testing',
    taskId: 'CAM-401', campaignName: 'Performance Max Q2', campaignId: 'CMP-002',
    dueDate: '2026-06-05', status: 'not-started',
    assignments: [],
  },
  {
    id: 'ct4', taskName: 'Email Drip Copywriting',
    taskId: 'CAM-402', campaignName: 'Performance Max Q2', campaignId: 'CMP-002',
    dueDate: '2026-05-15', status: 'in-progress',
    assignments: [
      { id: 'a6', assignmentType: 'job-role', jobRole: 'Content Strategist',
        plannedHours: 30, actualHours: 8, billRate: 125, costRate: 80,
        startDate: '2026-04-14', endDate: '2026-05-15', weekOf: '2026-04-14',
        distributionType: 'manual',
        dailyHours: { Mon: 6, Tue: 6, Wed: 6, Thu: 6, Fri: 6, Sat: 0, Sun: 0 },
        notes: '' },
    ],
  },
];

// ─── Form state ───────────────────────────────────────────────────────────────

interface AssignmentFormState {
  assignmentType: AssignmentType;
  userId: string;
  jobRole: string;
  plannedHours: string;
  actualHours: string;
  billRate: string;
  costRate: string;
  startDate: string;
  endDate: string;
  weekOf: string;
  distributionType: DistributionType;
  dailyHours: DailyHours;
  notes: string;
}

function emptyForm(): AssignmentFormState {
  return {
    assignmentType: 'user', userId: '', jobRole: '',
    plannedHours: '', actualHours: '0', billRate: '', costRate: '',
    startDate: '2026-04-09', endDate: '2026-04-30',
    weekOf: getMondayOf('2026-04-09'),
    distributionType: 'automatic',
    dailyHours: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
    notes: '',
  };
}

function assignmentToForm(a: Assignment): AssignmentFormState {
  return {
    assignmentType: a.assignmentType, userId: a.userId ?? '',
    jobRole: a.jobRole, plannedHours: String(a.plannedHours),
    actualHours: String(a.actualHours), billRate: String(a.billRate),
    costRate: String(a.costRate), startDate: a.startDate, endDate: a.endDate,
    weekOf: a.weekOf, distributionType: a.distributionType,
    dailyHours: { ...a.dailyHours }, notes: a.notes,
  };
}

// ─── Summary KPI Bar ──────────────────────────────────────────────────────────

function SummaryKPIBar({ intTasks, camTasks }: { intTasks: IntegratedTask[]; camTasks: CampaignTask[] }) {
  const all = useMemo(() => [
    ...intTasks.flatMap(t => t.assignments),
    ...camTasks.flatMap(t => t.assignments),
  ], [intTasks, camTasks]);

  const totalPlanned  = all.reduce((s, a) => s + a.plannedHours, 0);
  const totalActual   = all.reduce((s, a) => s + a.actualHours, 0);
  const totalBill     = all.reduce((s, a) => s + a.plannedHours * a.billRate, 0);
  const totalCost     = all.reduce((s, a) => s + a.plannedHours * a.costRate, 0);
  const margin        = totalBill - totalCost;
  const marginPct     = totalBill > 0 ? (margin / totalBill) * 100 : 0;
  const burnPct       = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;

  const metrics = [
    { label: 'Planned Hours',  value: `${totalPlanned.toLocaleString()} h`, sub: `${totalActual.toLocaleString()} h actual`, color: 'text-blue-600', bg: 'bg-blue-50', icon: Clock },
    { label: 'Total Bill Value', value: `$${(totalBill / 1000).toFixed(1)}k`, sub: `${all.length} assignments`, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: DollarSign },
    { label: 'Total Cost Value', value: `$${(totalCost / 1000).toFixed(1)}k`, sub: `across all tasks`, color: 'text-purple-600', bg: 'bg-purple-50', icon: TrendingUp },
    { label: 'Blended Margin',  value: `${marginPct.toFixed(1)}%`, sub: `$${(margin / 1000).toFixed(1)}k total`, color: 'text-amber-600', bg: 'bg-amber-50', icon: TrendingUp },
  ];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map(m => {
          const Icon = m.icon;
          return (
            <Card key={m.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${m.bg}`}>
                  <Icon className={`w-4 h-4 ${m.color}`} />
                </div>
                <div>
                  <div className={`text-xl font-bold ${m.color}`}>{m.value}</div>
                  <div className="text-xs text-gray-400">{m.label}</div>
                  <div className="text-xs text-gray-500">{m.sub}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {totalPlanned > 0 && (
        <div className="flex items-center gap-3 px-1">
          <span className="text-xs text-gray-400 shrink-0">Hours burn</span>
          <Progress value={burnPct} className="h-1.5 flex-1" />
          <span className="text-xs font-medium text-gray-600 shrink-0">{burnPct.toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}

// ─── Filters Panel ────────────────────────────────────────────────────────────

function FiltersPanel({
  filters, onChange, activeTab,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  activeTab: string;
}) {
  const [open, setOpen] = useState(false);
  const hasActive = filters.assignmentType !== 'all' || filters.taskStatus !== 'all' || filters.source !== 'all';

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-3.5 h-3.5" />
            Filters
            {hasActive && <Badge className="text-xs px-1.5 h-4 ml-1">ON</Badge>}
            {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </Button>
        </CollapsibleTrigger>
        {hasActive && (
          <Button
            variant="ghost" size="sm"
            className="gap-1 text-gray-500 h-8"
            onClick={() => onChange({ assignmentType: 'all', taskStatus: 'all', source: 'all' })}
          >
            <X className="w-3 h-3" /> Clear
          </Button>
        )}
      </div>

      <CollapsibleContent>
        <div className="flex flex-wrap gap-3 pt-3">
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Assignment Type</Label>
            <Select value={filters.assignmentType} onValueChange={v => onChange({ ...filters, assignmentType: v as FilterState['assignmentType'] })}>
              <SelectTrigger className="w-40 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="job-role">Job Role</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Task Status</Label>
            <Select value={filters.taskStatus} onValueChange={v => onChange({ ...filters, taskStatus: v as FilterState['taskStatus'] })}>
              <SelectTrigger className="w-40 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {activeTab === 'integrated' && (
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Source</Label>
              <Select value={filters.source} onValueChange={v => onChange({ ...filters, source: v as FilterState['source'] })}>
                <SelectTrigger className="w-44 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="Workfront">Workfront</SelectItem>
                  <SelectItem value="Jira">Jira</SelectItem>
                  <SelectItem value="ClickUp">ClickUp</SelectItem>
                  <SelectItem value="Asana">Asana</SelectItem>
                  <SelectItem value="Monday.com">Monday.com</SelectItem>
                  <SelectItem value="Zoho">Zoho</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── Assignment Dialog ────────────────────────────────────────────────────────

function AssignmentDialog({
  open, onClose, onSave, editing, prefill,
}: {
  open: boolean; onClose: () => void;
  onSave: (a: Assignment) => void; editing: Assignment | null;
  prefill?: { userId?: string; jobRole?: string };
}) {
  const [form, setForm] = useState<AssignmentFormState>(editing ? assignmentToForm(editing) : emptyForm());

  useEffect(() => {
    if (editing) {
      setForm(assignmentToForm(editing));
    } else {
      setForm({
        ...emptyForm(),
        userId:         prefill?.userId   ?? '',
        jobRole:        prefill?.jobRole  ?? '',
        assignmentType: prefill?.userId   ? 'user' : 'user',
      });
    }
  }, [editing, open]);

  const hours     = parseFloat(form.plannedHours) || 0;
  const autoDaily = makeAutoDaily(hours);
  const weekDates = getWeekDates(form.weekOf);
  const manualTotal    = totalDaily(form.dailyHours);
  const manualMismatch = form.distributionType === 'manual' && hours > 0 && Math.abs(manualTotal - hours) > 0.01;
  const burnPct        = hours > 0 ? Math.min(100, ((parseFloat(form.actualHours) || 0) / hours) * 100) : 0;

  function setDay(day: Day, val: string) {
    const n = parseFloat(val) || 0;
    setForm(f => ({ ...f, dailyHours: { ...f.dailyHours, [day]: n } }));
  }

  function handleSave() {
    const selectedUser = USERS.find(u => u.id === form.userId);
    const a: Assignment = {
      id: editing?.id ?? `a${Date.now()}`,
      assignmentType: form.assignmentType,
      userId:   form.assignmentType === 'user' ? form.userId    : undefined,
      userName: form.assignmentType === 'user' ? selectedUser?.name : undefined,
      jobRole:  form.jobRole,
      plannedHours: hours,
      actualHours:  parseFloat(form.actualHours) || 0,
      billRate:  parseFloat(form.billRate) || 0,
      costRate:  parseFloat(form.costRate) || 0,
      startDate: form.startDate,
      endDate:   form.endDate,
      weekOf:    form.weekOf,
      distributionType: form.distributionType,
      dailyHours: form.distributionType === 'automatic' ? autoDaily : form.dailyHours,
      notes: form.notes,
    };
    onSave(a);
  }

  const canSave =
    form.jobRole && hours > 0 &&
    parseFloat(form.billRate) > 0 && parseFloat(form.costRate) > 0 &&
    form.startDate && form.endDate &&
    (form.assignmentType === 'job-role' || form.userId) &&
    !manualMismatch;

  const billVal  = parseFloat(form.billRate) || 0;
  const costVal  = parseFloat(form.costRate) || 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Assignment' : 'Add Assignment'}</DialogTitle>
          <DialogDescription>
            Configure assignment type, rates, date range, hours, and daily distribution.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Assignment Type */}
          <div className="space-y-2">
            <Label>Assignment Type</Label>
            <div className="flex gap-3">
              {(['user', 'job-role'] as AssignmentType[]).map(type => (
                <button key={type} type="button"
                  onClick={() => setForm(f => ({ ...f, assignmentType: type, userId: '' }))}
                  className={`flex-1 flex items-center gap-2 border rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    form.assignmentType === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {type === 'user' ? <User className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                  {type === 'user' ? 'User Assignment' : 'Job Role Based'}
                </button>
              ))}
            </div>
          </div>

          {/* User picker */}
          {form.assignmentType === 'user' && (
            <div className="space-y-1.5">
              <Label>Assign To (User)</Label>
              <Select value={form.userId} onValueChange={v => setForm(f => ({ ...f, userId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                <SelectContent>
                  {USERS.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} <span className="text-xs text-gray-400 ml-2">{u.email}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Job Role */}
          <div className="space-y-1.5">
            <Label>Job Role</Label>
            <Select value={form.jobRole} onValueChange={v => setForm(f => ({ ...f, jobRole: v }))}>
              <SelectTrigger><SelectValue placeholder="Select job role" /></SelectTrigger>
              <SelectContent>
                {JOB_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" /> Start Date
              </Label>
              <Input type="date" value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" /> End Date
              </Label>
              <Input type="date" value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
          </div>

          {/* Hours + Rates */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" /> Planned Hours
              </Label>
              <Input type="number" min={0} placeholder="e.g. 80" value={form.plannedHours}
                onChange={e => setForm(f => ({ ...f, plannedHours: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Bill Rate ($/hr)
              </Label>
              <Input type="number" min={0} placeholder="e.g. 150" value={form.billRate}
                onChange={e => setForm(f => ({ ...f, billRate: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-purple-500" /> Cost Rate ($/hr)
              </Label>
              <Input type="number" min={0} placeholder="e.g. 100" value={form.costRate}
                onChange={e => setForm(f => ({ ...f, costRate: e.target.value }))} />
            </div>
          </div>

          {/* Actual Hours */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" /> Actual Hours Logged
            </Label>
            <div className="flex items-center gap-3">
              <Input type="number" min={0} placeholder="0" value={form.actualHours}
                onChange={e => setForm(f => ({ ...f, actualHours: e.target.value }))}
                className="w-36" />
              {hours > 0 && (
                <div className="flex-1 flex items-center gap-2">
                  <Progress value={burnPct} className="h-2 flex-1" />
                  <span className="text-xs font-medium text-gray-600 shrink-0">{burnPct.toFixed(0)}% burned</span>
                </div>
              )}
            </div>
          </div>

          {/* Daily Distributed Hours */}
          <div className="space-y-3 border border-gray-100 rounded-xl p-4 bg-gray-50">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Label className="text-sm font-semibold">Daily Distributed Planned Hours</Label>
              <div className="flex items-center gap-2">
                {/* Week picker */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Week of:</span>
                  <Input type="date" value={form.weekOf} className="h-7 text-xs w-36 px-2"
                    onChange={e => setForm(f => ({ ...f, weekOf: getMondayOf(e.target.value) }))} />
                </div>
                {/* Manual / Automatic toggle */}
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
                  {(['automatic', 'manual'] as DistributionType[]).map(dt => (
                    <button key={dt} type="button"
                      onClick={() => setForm(f => ({ ...f, distributionType: dt }))}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        form.distributionType === dt
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {dt === 'automatic'
                        ? <><Wand2 className="w-3 h-3" />Automatic</>
                        : <><PenLine className="w-3 h-3" />Manual</>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {form.distributionType === 'automatic' && (
              <p className="text-xs text-gray-500">Evenly distributed Mon–Fri. Weekends = 0.</p>
            )}

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-2">
              {DAYS.map((day, i) => {
                const isWeekend = day === 'Sat' || day === 'Sun';
                const date = weekDates[i];
                const displayVal = form.distributionType === 'automatic'
                  ? autoDaily[day]
                  : form.dailyHours[day];
                return (
                  <div key={day} className="text-center">
                    <div className={`text-xs font-medium ${isWeekend ? 'text-gray-400' : 'text-gray-600'}`}>
                      {day}
                    </div>
                    {date && (
                      <div className="text-xs text-gray-400 mb-1">{fmtShort(date)}</div>
                    )}
                    {form.distributionType === 'automatic' ? (
                      <div className={`rounded-lg px-1 py-2 text-sm font-semibold border ${
                        isWeekend
                          ? 'bg-gray-100 text-gray-400 border-gray-100'
                          : 'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {displayVal}
                      </div>
                    ) : (
                      <Input type="number" min={0} placeholder="0"
                        value={form.dailyHours[day] || ''}
                        onChange={e => setDay(day, e.target.value)}
                        className={`text-center px-1 text-sm ${isWeekend ? 'bg-gray-50 text-gray-400' : ''}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className={`flex justify-between text-xs px-1 ${manualMismatch ? 'text-red-500' : 'text-gray-500'}`}>
              <span>
                Total: <strong>
                  {form.distributionType === 'automatic' ? totalDaily(autoDaily) : manualTotal}
                </strong> hrs
              </span>
              {hours > 0 && (
                <span>
                  Planned: <strong>{hours}</strong> hrs
                  {manualMismatch && ' ← totals must match'}
                </span>
              )}
            </div>
          </div>

          {/* Margin preview */}
          {billVal > 0 && costVal > 0 && (
            <div className="flex items-center gap-6 bg-gray-50 rounded-lg px-4 py-3 text-sm flex-wrap">
              <div>
                <span className="text-gray-400">Margin/hr:</span>{' '}
                <strong className="text-emerald-600">${(billVal - costVal).toFixed(0)}</strong>
              </div>
              <div>
                <span className="text-gray-400">Margin %:</span>{' '}
                <strong className="text-emerald-600">
                  {(((billVal - costVal) / billVal) * 100).toFixed(1)}%
                </strong>
              </div>
              {hours > 0 && (
                <>
                  <div>
                    <span className="text-gray-400">Total Bill:</span>{' '}
                    <strong className="text-blue-600">${(billVal * hours).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Margin:</span>{' '}
                    <strong className="text-emerald-600">
                      ${((billVal - costVal) * hours).toLocaleString()}
                    </strong>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes <span className="text-gray-400 font-normal">(optional)</span></Label>
            <Textarea placeholder="Add any notes for this assignment…" rows={2}
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {editing ? 'Save Changes' : 'Add Assignment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Clone Dialog ─────────────────────────────────────────────────────────────

function CloneDialog({
  open, onClose, onClone, intTasks, camTasks, sourceTaskId,
}: {
  open: boolean; onClose: () => void;
  onClone: (targetTaskId: string, targetTab: 'integrated' | 'campaign') => void;
  intTasks: IntegratedTask[]; camTasks: CampaignTask[];
  sourceTaskId: string;
}) {
  const [selected, setSelected] = useState<{ id: string; tab: 'integrated' | 'campaign' } | null>(null);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Clone Assignment To…</DialogTitle>
          <DialogDescription>Select a target task to copy this assignment into.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-80 overflow-y-auto">
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Plug className="w-3 h-3" /> Integrated Tasks
            </div>
            <div className="space-y-1">
              {intTasks.filter(t => t.id !== sourceTaskId).map(t => (
                <button key={t.id} type="button"
                  onClick={() => setSelected({ id: t.id, tab: 'integrated' })}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                    selected?.id === t.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{t.taskName}</div>
                  <div className="text-xs text-gray-400">{t.taskId} · {t.projectName}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Megaphone className="w-3 h-3" /> Campaign Tasks
            </div>
            <div className="space-y-1">
              {camTasks.filter(t => t.id !== sourceTaskId).map(t => (
                <button key={t.id} type="button"
                  onClick={() => setSelected({ id: t.id, tab: 'campaign' })}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                    selected?.id === t.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{t.taskName}</div>
                  <div className="text-xs text-gray-400">{t.taskId} · {t.campaignName}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!selected} onClick={() => {
            if (selected) { onClone(selected.id, selected.tab); setSelected(null); }
          }}>
            Clone Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Assignment Row ───────────────────────────────────────────────────────────

function AssignmentRow({
  assignment, isOverallocated, isConflicting,
  onEdit, onDelete, onClone,
  isSelected, onToggleSelection,
}: {
  assignment: Assignment;
  isOverallocated: boolean;
  isConflicting: boolean;
  onEdit: (a: Assignment) => void;
  onDelete: (id: string) => void;
  onClone: (a: Assignment) => void;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
}) {
  const margin    = assignment.billRate - assignment.costRate;
  const marginPct = ((margin / assignment.billRate) * 100).toFixed(1);
  const burnPct   = assignment.plannedHours > 0
    ? Math.min(100, (assignment.actualHours / assignment.plannedHours) * 100) : 0;

  return (
    <div className={`border rounded-lg p-4 bg-white space-y-3 relative transition-all ${
      isSelected ? 'ring-2 ring-blue-500 bg-blue-50/30' : 
      isConflicting ? 'border-red-200' : isOverallocated ? 'border-amber-200' : 'border-gray-100'
    }`}>
      {onToggleSelection && (
        <div className="absolute top-4 right-4 z-10">
          <BulkSelectCheckbox checked={!!isSelected} onCheckedChange={() => onToggleSelection(assignment.id)} />
        </div>
      )}
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2 rounded-lg shrink-0 ${assignment.assignmentType === 'user' ? 'bg-blue-50' : 'bg-purple-50'}`}>
            {assignment.assignmentType === 'user'
              ? <User className="w-4 h-4 text-blue-600" />
              : <Briefcase className="w-4 h-4 text-purple-600" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-900 text-sm">
                {assignment.assignmentType === 'user' ? assignment.userName : 'Job Role Assignment'}
              </span>
              <Badge variant="outline" className="text-xs">
                {assignment.assignmentType === 'user' ? 'User' : 'Job Role'}
              </Badge>

              {isOverallocated && (
                <Tooltip content="This user exceeds 40 h/week across all tasks.">
                  <Badge variant="destructive" className="text-xs gap-1 cursor-default">
                    <AlertTriangle className="w-3 h-3" /> Overallocated
                  </Badge>
                </Tooltip>
              )}

              {isConflicting && (
                <Tooltip content="This user is assigned to overlapping tasks in this date range.">
                  <Badge className="text-xs gap-1 bg-red-100 text-red-700 border-red-200 cursor-default">
                    <AlertTriangle className="w-3 h-3" /> Date Conflict
                  </Badge>
                </Tooltip>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {assignment.jobRole}
              {assignment.startDate && ` · ${fmtShort(assignment.startDate)} → ${fmtShort(assignment.endDate)}`}
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 shrink-0">
          <Tooltip content="Clone to another task">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onClone(assignment)}>
              <Copy className="w-3.5 h-3.5" />
            </Button>
          </Tooltip>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(assignment)}>
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:border-red-200"
            onClick={() => onDelete(assignment.id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <div className="text-xs text-gray-400 mb-0.5">Planned Hrs</div>
          <div className="font-semibold text-gray-800">{assignment.plannedHours}h</div>
        </div>
        <div className="bg-emerald-50 rounded-lg px-3 py-2">
          <div className="text-xs text-gray-400 mb-0.5">Bill Rate</div>
          <div className="font-semibold text-emerald-700">${assignment.billRate}/hr</div>
        </div>
        <div className="bg-purple-50 rounded-lg px-3 py-2">
          <div className="text-xs text-gray-400 mb-0.5">Cost Rate</div>
          <div className="font-semibold text-purple-700">${assignment.costRate}/hr</div>
        </div>
        <div className="bg-blue-50 rounded-lg px-3 py-2">
          <div className="text-xs text-gray-400 mb-0.5">Margin</div>
          <div className="font-semibold text-blue-700">${margin}/hr ({marginPct}%)</div>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <div className="text-xs text-gray-400 mb-0.5">Distribution</div>
          <div className="flex items-center gap-1 font-medium text-gray-700 text-xs">
            {assignment.distributionType === 'automatic'
              ? <><Wand2 className="w-3 h-3 text-blue-500" />Automatic</>
              : <><PenLine className="w-3 h-3 text-orange-500" />Manual</>}
          </div>
        </div>
      </div>

      {/* Actual vs Planned hours bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Actual: <strong className="text-gray-600">{assignment.actualHours}h</strong></span>
          <span>Planned: <strong className="text-gray-600">{assignment.plannedHours}h</strong></span>
        </div>
        <Progress value={burnPct} className={`h-1.5 ${burnPct > 100 ? '[&>div]:bg-red-500' : burnPct > 75 ? '[&>div]:bg-amber-500' : ''}`} />
        <div className="text-xs text-gray-400 text-right">{burnPct.toFixed(0)}% burned</div>
      </div>

      {/* Daily hours pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400 shrink-0">Daily:</span>
        {DAYS.map(day => {
          const h = assignment.dailyHours[day];
          return (
            <div key={day} className={`text-xs rounded-md px-2 py-1 font-medium ${
              h > 0 ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-400'
            }`}>
              {day}: {h}h
            </div>
          );
        })}
      </div>

      {/* Notes */}
      {assignment.notes && (
        <div className="text-xs text-gray-500 border-t border-gray-50 pt-2 italic">
          {assignment.notes}
        </div>
      )}
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({
  taskId, taskName, dueDate, status, assignments, header,
  overallocatedUsers, conflictingIds,
  onAddAssignment, onEditAssignment, onDeleteAssignment, onCloneAssignment,
  onSmartAllocate,
  isSelectedAssignment,
  onToggleAssignment,
}: {
  taskId: string; taskName: string; dueDate: string; status: TaskStatus;
  assignments: Assignment[]; header: ReactNode;
  overallocatedUsers: Set<string>; conflictingIds: Set<string>;
  onAddAssignment: () => void;
  onEditAssignment: (a: Assignment) => void;
  onDeleteAssignment: (id: string) => void;
  onCloneAssignment: (a: Assignment) => void;
  onSmartAllocate: () => void;
  isSelectedAssignment: (id: string) => boolean;
  onToggleAssignment: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const sb = statusBadge(status);

  const hasWarning = assignments.some(
    a => conflictingIds.has(a.id) || (a.userId ? overallocatedUsers.has(a.userId) : false)
  );

  return (
    <Card className={`overflow-hidden ${hasWarning ? 'ring-1 ring-amber-200' : ''}`}>
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="text-gray-400 shrink-0">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {header}
              <span className="font-medium text-gray-900 text-sm">{taskName}</span>
              <Badge variant={sb.variant} className="text-xs">{sb.label}</Badge>
              {assignments.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {assignments.length} assignment{assignments.length > 1 ? 's' : ''}
                </Badge>
              )}
              {hasWarning && <AlertTriangle className="w-4 h-4 text-amber-500" />}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{taskId} · Due {dueDate}</div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-4">
          <Button variant="outline" size="sm" className="gap-1.5"
            onClick={e => { e.stopPropagation(); onAddAssignment(); }}>
            <Plus className="w-3.5 h-3.5" /> Add Assignment
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 text-blue-600 hover:text-blue-700"
            onClick={e => { e.stopPropagation(); onSmartAllocate(); }}>
            <Wand2 className="w-3.5 h-3.5" /> Smart Allocate
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4 bg-gray-50/40">
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No assignments yet.{' '}
              <button className="text-blue-500 hover:underline" onClick={onAddAssignment}>Add one</button>
            </div>
          ) : (
            assignments.map(a => (
              <AssignmentRow
                key={a.id}
                assignment={a}
                isOverallocated={!!a.userId && overallocatedUsers.has(a.userId)}
                isConflicting={conflictingIds.has(a.id)}
                onEdit={onEditAssignment}
                onDelete={onDeleteAssignment}
                onClone={onCloneAssignment}
                isSelected={isSelectedAssignment(a.id)}
                onToggleSelection={onToggleAssignment}
              />
            ))
          )}
        </div>
      )}
    </Card>
  );
}

// ─── Campaign Group Card (Assignments view) ───────────────────────────────────

function campaignStatusColor(s: Campaign['status']): string {
  return ({
    active:    'bg-emerald-100 text-emerald-700',
    planning:  'bg-blue-100 text-blue-700',
    completed: 'bg-gray-100 text-gray-600',
    paused:    'bg-amber-100 text-amber-700',
  })[s];
}

function CampaignGroupCard({
  campaign, tasks,
  overallocatedUsers, conflictingIds,
  onAddAssignment, onEditAssignment, onDeleteAssignment, onCloneAssignment,
  onSmartAllocate,
  isSelectedAssignment,
  onToggleAssignment,
}: {
  campaign: Campaign;
  tasks: CampaignTask[];
  overallocatedUsers: Set<string>;
  conflictingIds: Set<string>;
  onAddAssignment: (taskId: string) => void;
  onEditAssignment: (taskId: string, a: Assignment) => void;
  onDeleteAssignment: (taskId: string, id: string) => void;
  onCloneAssignment: (taskId: string, a: Assignment) => void;
  onSmartAllocate: (taskId: string) => void;
  isSelectedAssignment: (id: string) => boolean;
  onToggleAssignment: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const totalAssignments = tasks.reduce((s, t) => s + t.assignments.length, 0);
  const totalPlanned     = tasks.flatMap(t => t.assignments).reduce((s, a) => s + a.plannedHours, 0);
  const totalBill        = tasks.flatMap(t => t.assignments).reduce((s, a) => s + a.plannedHours * a.billRate, 0);
  const unassigned       = tasks.filter(t => t.assignments.length === 0).length;

  return (
    <div className="space-y-2">
      {/* Campaign header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-orange-50 border border-orange-100 rounded-xl cursor-pointer hover:bg-orange-100/60 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <div className="text-orange-400">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
            <Megaphone className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">{campaign.name}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${campaignStatusColor(campaign.status)}`}>
                {campaign.status}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-0.5 text-xs text-gray-500">
              <span>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
              <span>{totalAssignments} assignment{totalAssignments !== 1 ? 's' : ''}</span>
              <span className="text-blue-600 font-medium">{totalPlanned}h planned</span>
              <span className="text-emerald-600 font-medium">${(totalBill / 1000).toFixed(1)}k bill value</span>
              {unassigned > 0 && (
                <span className="text-amber-600 font-medium">{unassigned} unassigned</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400 hidden sm:block">
            {campaign.startDate} → {campaign.endDate}
          </span>
        </div>
      </div>

      {/* Task cards */}
      {expanded && (
        <div className="pl-4 space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No tasks in this campaign match your filters.
            </div>
          ) : (
            tasks.map(task => (
              <TaskCard key={task.id}
                taskId={task.taskId} taskName={task.taskName}
                dueDate={task.dueDate} status={task.status}
                assignments={task.assignments}
                overallocatedUsers={overallocatedUsers}
                conflictingIds={conflictingIds}
                header={
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                    {task.campaignName}
                  </span>
                }
                onAddAssignment={() => onAddAssignment(task.id)}
                onEditAssignment={a => onEditAssignment(task.id, a)}
                onDeleteAssignment={id => onDeleteAssignment(task.id, id)}
                onCloneAssignment={a => onCloneAssignment(task.id, a)}
                onSmartAllocate={() => onSmartAllocate(task.id)}
                isSelectedAssignment={isSelectedAssignment}
                onToggleAssignment={onToggleAssignment}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Smart Allocate Algorithm ─────────────────────────────────────────────────

const USER_DEFAULT_ROLES: Record<string, string> = {
  u1: 'Backend Engineer',
  u2: 'Integration Engineer',
  u3: 'UX/UI Designer',
  u4: 'Content Strategist',
  u5: 'DevOps Engineer',
};

function SmartAllocateDialog({
  open, onClose, target, allAssignments, onSelect,
}: {
  open: boolean;
  onClose: () => void;
  target: { taskId: string; taskName: string; dueDate: string } | null;
  allAssignments: { a: Assignment; taskId: string }[];
  onSelect: (userId: string, jobRole: string) => void;
}) {
  const [selectedJobRole, setSelectedJobRole] = useState('');

  // Score each user: lower weekly load = higher score; penalise overallocated users
  const recommendations = useMemo(() => {
    return USERS.map(user => {
      const userAssignments = allAssignments.filter(
        ({ a }) => a.assignmentType === 'user' && a.userId === user.id,
      );
      const weeklyLoad = userAssignments.reduce(
        (s, { a }) => s + a.plannedHours / weeksBetween(a.startDate, a.endDate),
        0,
      );
      const utilizationPct = (weeklyLoad / 40) * 100;
      const isOverallocated = weeklyLoad > 40;
      const score = Math.max(0, 100 - utilizationPct);
      const defaultRole = USER_DEFAULT_ROLES[user.id] ?? JOB_ROLES[0];
      return { user, weeklyLoad, utilizationPct, isOverallocated, score, defaultRole };
    }).sort((a, b) => b.score - a.score);
  }, [allAssignments]);

  function utilizationBarClass(pct: number): string {
    if (pct > 100) return '[&>div]:bg-red-500';
    if (pct > 75) return '[&>div]:bg-amber-500';
    return '[&>div]:bg-emerald-500';
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-blue-600" /> Smart Allocate
          </DialogTitle>
          <DialogDescription>
            Capacity-ranked recommendations for{' '}
            <strong className="text-gray-800">{target?.taskName ?? '—'}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Optional role pre-fill */}
          <div className="space-y-1.5">
            <Label className="text-sm">
              Job Role <span className="text-gray-400 font-normal">(pre-fills the assignment form)</span>
            </Label>
            <Select value={selectedJobRole} onValueChange={setSelectedJobRole}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Inherit user's default role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Use user's default role</SelectItem>
                {JOB_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Ranked list */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Ranked by Available Capacity
            </div>
            {recommendations.map(({ user, weeklyLoad, utilizationPct, isOverallocated, score, defaultRole }) => (
              <button
                key={user.id}
                type="button"
                onClick={() => onSelect(user.id, selectedJobRole || defaultRole)}
                className="w-full text-left px-4 py-3 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-blue-600">{user.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{user.name}</div>
                      <div className="text-xs text-gray-400">
                        {defaultRole} · {weeklyLoad.toFixed(1)} h/week
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isOverallocated ? (
                      <Badge variant="destructive" className="text-xs">Overloaded</Badge>
                    ) : score > 50 ? (
                      <Badge className="text-xs bg-emerald-100 text-emerald-700 border-0">Available</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Busy</Badge>
                    )}
                    <span className="text-xs font-semibold text-gray-500 w-10 text-right">
                      {utilizationPct.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="mt-2.5">
                  <Progress
                    value={Math.min(100, utilizationPct)}
                    className={`h-1.5 ${utilizationBarClass(utilizationPct)}`}
                  />
                </div>
                {/* Recommendation score bar */}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-gray-400 shrink-0">Fit score</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1">
                    <div
                      className="bg-blue-400 h-1 rounded-full transition-all"
                      style={{ width: `${Math.min(100, score)}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-blue-600 w-8 text-right">
                    {Math.round(score)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add Campaign Task Dialog ─────────────────────────────────────────────────

function AddCampaignTaskDialog({
  open, onClose, campaigns, onAdd,
}: {
  open: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  onAdd: (task: CampaignTask) => void;
}) {
  const [taskName, setTaskName] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('not-started');

  function handleAdd() {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign || !taskName.trim() || !dueDate) return;
    const newTask: CampaignTask = {
      id: `ct${Date.now()}`,
      taskName: taskName.trim(),
      taskId: `CAM-${Math.floor(Math.random() * 900 + 100)}`,
      campaignName: campaign.name,
      campaignId,
      dueDate,
      status,
      assignments: [],
    };
    onAdd(newTask);
    setTaskName(''); setCampaignId(''); setDueDate(''); setStatus('not-started');
    onClose();
  }

  const canAdd = taskName.trim().length > 0 && campaignId !== '' && dueDate !== '';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-orange-500" /> Add Campaign Task
          </DialogTitle>
          <DialogDescription>Create a new task within an existing campaign.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Campaign</Label>
            <Select value={campaignId} onValueChange={setCampaignId}>
              <SelectTrigger><SelectValue placeholder="Select campaign" /></SelectTrigger>
              <SelectContent>
                {campaigns.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                    <span className="ml-2 text-xs text-gray-400 capitalize">({c.status})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Task Name</Label>
            <Input
              placeholder="e.g. Influencer Outreach Brief"
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" /> Due Date
              </Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={v => setStatus(v as TaskStatus)}>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAdd} disabled={!canAdd}>Add Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function Assignments() {
  const [integratedTasks, setIntegratedTasks] = useState(initIntegrated);
  const [campaignTasks,   setCampaignTasks]   = useState(initCampaign);

  const allAssignments = useMemo(() => [
    ...integratedTasks.flatMap(t => t.assignments.map(a => ({ ...a, taskId: t.id, tab: 'integrated' }))),
    ...campaignTasks.flatMap(t => t.assignments.map(a => ({ ...a, taskId: t.id, tab: 'campaign' }))),
  ], [integratedTasks, campaignTasks]);

  const {
    selectedIds,
    selectedCount,
    toggleItem,
    clearSelection,
    isSelected,
  } = useBulkSelection(allAssignments.map(a => a.id));

  const [search,     setSearch]    = useState('');
  const [activeTab,  setActiveTab] = useState<'integrated' | 'campaign'>('integrated');
  const [filters, setFilters] = useState<FilterState>({ assignmentType: 'all', taskStatus: 'all', source: 'all' });

  // Dialog state
  const [dialogOpen,       setDialogOpen]       = useState(false);
  const [cloneDialogOpen,  setCloneDialogOpen]  = useState(false);
  const [targetTaskId,     setTargetTaskId]     = useState<string | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [cloningAssignment, setCloningAssignment] = useState<Assignment | null>(null);
  const [cloneSourceTaskId, setCloneSourceTaskId] = useState<string>('');

  // Smart Allocate state
  const [smartAllocOpen,   setSmartAllocOpen]   = useState(false);
  const [smartAllocTarget, setSmartAllocTarget] = useState<{ taskId: string; taskName: string; dueDate: string } | null>(null);
  const [prefillData,      setPrefillData]      = useState<{ userId?: string; jobRole?: string } | undefined>(undefined);

  // Add Campaign Task state
  const [addCamTaskOpen, setAddCamTaskOpen] = useState(false);

  function openAdd(taskId: string) {
    setTargetTaskId(taskId); setEditingAssignment(null); setDialogOpen(true);
  }
  function openEdit(taskId: string, a: Assignment) {
    setTargetTaskId(taskId); setEditingAssignment(a); setDialogOpen(true);
  }
  function openClone(taskId: string, a: Assignment) {
    setCloneSourceTaskId(taskId); setCloningAssignment(a); setCloneDialogOpen(true);
  }

  function openSmartAlloc(taskId: string) {
    const task =
      integratedTasks.find(t => t.id === taskId) ??
      campaignTasks.find(t => t.id === taskId);
    if (!task) return;
    setSmartAllocTarget({ taskId, taskName: task.taskName, dueDate: task.dueDate });
    setSmartAllocOpen(true);
  }

  function handleSmartSelect(userId: string, jobRole: string) {
    if (!smartAllocTarget) return;
    setSmartAllocOpen(false);
    setPrefillData({ userId, jobRole });
    setTargetTaskId(smartAllocTarget.taskId);
    setEditingAssignment(null);
    setDialogOpen(true);
  }

  function upsertAssignment(
    setter: typeof setIntegratedTasks | typeof setCampaignTasks,
    taskId: string, assignment: Assignment, isEdit: boolean
  ) {
    setter((tasks: any[]) =>
      tasks.map((t: any) =>
        t.id !== taskId ? t : {
          ...t,
          assignments: isEdit
            ? t.assignments.map((a: Assignment) => a.id === assignment.id ? assignment : a)
            : [...t.assignments, assignment],
        }
      )
    );
  }

  function handleSave(assignment: Assignment) {
    if (!targetTaskId) return;
    const isEdit = !!editingAssignment;
    const inInt  = integratedTasks.some(t => t.id === targetTaskId);
    if (inInt) upsertAssignment(setIntegratedTasks, targetTaskId, assignment, isEdit);
    else        upsertAssignment(setCampaignTasks,   targetTaskId, assignment, isEdit);
    setDialogOpen(false);
  }

  function handleDelete(taskId: string, assignmentId: string) {
    const remove = (tasks: any[]) =>
      tasks.map((t: any) =>
        t.id !== taskId ? t : { ...t, assignments: t.assignments.filter((a: Assignment) => a.id !== assignmentId) }
      );
    if (integratedTasks.some(t => t.id === taskId)) setIntegratedTasks(remove);
    else setCampaignTasks(remove);
  }

  function handleClone(targetTaskId: string, targetTab: 'integrated' | 'campaign') {
    if (!cloningAssignment) return;
    const clone: Assignment = { ...cloningAssignment, id: `a${Date.now()}` };
    if (targetTab === 'integrated') upsertAssignment(setIntegratedTasks, targetTaskId, clone, false);
    else upsertAssignment(setCampaignTasks, targetTaskId, clone, false);
    setCloneDialogOpen(false);
  }

  // ── Overallocation detection ──────────────────────────────────────────────
  const overallocatedUsers = useMemo(() => {
    const allA = [
      ...integratedTasks.flatMap(t => t.assignments),
      ...campaignTasks.flatMap(t => t.assignments),
    ];
    const byUser = new Map<string, Assignment[]>();
    for (const a of allA) {
      if (a.assignmentType === 'user' && a.userId) {
        if (!byUser.has(a.userId)) byUser.set(a.userId, []);
        byUser.get(a.userId)!.push(a);
      }
    }
    const overloaded = new Set<string>();
    for (const [uid, list] of byUser) {
      const weeklyRate = list.reduce(
        (s, a) => s + a.plannedHours / weeksBetween(a.startDate, a.endDate), 0
      );
      if (weeklyRate > 40) overloaded.add(uid);
    }
    return overloaded;
  }, [integratedTasks, campaignTasks]);

  // ── Conflict detection ────────────────────────────────────────────────────
  const conflictingIds = useMemo(() => {
    const allA = [
      ...integratedTasks.flatMap(t => t.assignments.map(a => ({ a, taskId: t.id }))),
      ...campaignTasks.flatMap(t => t.assignments.map(a => ({ a, taskId: t.id }))),
    ];
    const conflicting = new Set<string>();
    for (let i = 0; i < allA.length; i++) {
      for (let j = i + 1; j < allA.length; j++) {
        const { a: a1, taskId: t1 } = allA[i];
        const { a: a2, taskId: t2 } = allA[j];
        if (
          t1 !== t2 &&
          a1.assignmentType === 'user' && a2.assignmentType === 'user' &&
          a1.userId === a2.userId &&
          datesOverlap(a1.startDate, a1.endDate, a2.startDate, a2.endDate)
        ) {
          conflicting.add(a1.id);
          conflicting.add(a2.id);
        }
      }
    }
    return conflicting;
  }, [integratedTasks, campaignTasks]);

  // ── Filtering ─────────────────────────────────────────────────────────────
  function matchTask(status: TaskStatus, source?: IntegrationSource) {
    if (filters.taskStatus !== 'all' && status !== filters.taskStatus) return false;
    if (source && filters.source !== 'all' && source !== filters.source) return false;
    return true;
  }
  function matchAssignment(a: Assignment) {
    return filters.assignmentType === 'all' || a.assignmentType === filters.assignmentType;
  }

  const filteredIntegrated = integratedTasks.filter(t =>
    (t.taskName.toLowerCase().includes(search.toLowerCase()) ||
     t.taskId.toLowerCase().includes(search.toLowerCase()) ||
     t.projectName.toLowerCase().includes(search.toLowerCase())) &&
    matchTask(t.status, t.source)
  );

  const filteredCampaign = campaignTasks.filter(t =>
    (t.taskName.toLowerCase().includes(search.toLowerCase()) ||
     t.taskId.toLowerCase().includes(search.toLowerCase()) ||
     t.campaignName.toLowerCase().includes(search.toLowerCase())) &&
    matchTask(t.status)
  );

  // Tasks with at least one matching assignment (if assignmentType filter is set)
  const visibleIntegrated = filteredIntegrated.map(t => ({
    ...t,
    assignments: filters.assignmentType === 'all' ? t.assignments : t.assignments.filter(matchAssignment),
  }));
  const visibleCampaign = filteredCampaign.map(t => ({
    ...t,
    assignments: filters.assignmentType === 'all' ? t.assignments : t.assignments.filter(matchAssignment),
  }));

  // Group campaign tasks by campaign
  const campaignGroups = useMemo(() => {
    const map = new Map<string, { campaign: Campaign; tasks: typeof visibleCampaign }>();
    // Seed known campaigns first so they appear even if empty after filtering
    for (const c of CAMPAIGNS) map.set(c.id, { campaign: c, tasks: [] });
    for (const task of visibleCampaign) {
      if (!map.has(task.campaignId)) {
        map.set(task.campaignId, {
          campaign: { id: task.campaignId, name: task.campaignName, status: 'active', startDate: '', endDate: '' },
          tasks: [],
        });
      }
      map.get(task.campaignId)!.tasks.push(task);
    }
    // Only show groups that have tasks after filtering (or all groups when no search/filter)
    return Array.from(map.values()).filter(g => g.tasks.length > 0 || (search === '' && filters.taskStatus === 'all' && filters.assignmentType === 'all'));
  }, [visibleCampaign, search, filters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-semibold text-gray-900">Assignments</h1>
          </div>
          <p className="text-gray-500 mt-1 text-sm">
            Manage resource assignments on integrated and campaign tasks
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2"
            onClick={() => setAddCamTaskOpen(true)}>
            <Plus className="w-4 h-4" /> Add Campaign Task
          </Button>
          <Button variant="outline" size="sm" className="gap-2"
            onClick={() => exportToCSV(integratedTasks, campaignTasks)}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Summary KPI bar */}
      <SummaryKPIBar intTasks={visibleIntegrated} camTasks={visibleCampaign} />

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search tasks, IDs, projects or campaigns…"
            value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <FiltersPanel filters={filters} onChange={setFilters} activeTab={activeTab} />
      </div>

      {/* Warnings summary */}
      {(overallocatedUsers.size > 0 || conflictingIds.size > 0) && (
        <div className="flex flex-wrap gap-3">
          {overallocatedUsers.size > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 rounded-lg px-3 py-2 text-sm border border-amber-200">
              <AlertTriangle className="w-4 h-4" />
              {overallocatedUsers.size} user{overallocatedUsers.size > 1 ? 's' : ''} overallocated (&gt;40 h/week)
            </div>
          )}
          {conflictingIds.size > 0 && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-lg px-3 py-2 text-sm border border-red-200">
              <AlertTriangle className="w-4 h-4" />
              {conflictingIds.size} assignment{conflictingIds.size > 1 ? 's' : ''} with date conflicts
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="integrated" className="gap-2">
            <Plug className="w-4 h-4" />
            Integrated Tasks
            <Badge variant="secondary" className="ml-1 text-xs">{visibleIntegrated.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="campaign" className="gap-2">
            <Megaphone className="w-4 h-4" />
            Campaign Tasks
            <Badge variant="secondary" className="ml-1 text-xs">{visibleCampaign.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrated" className="space-y-3 pt-2">
          <p className="text-xs text-gray-400 pb-1">
            Tasks synced from Workfront, Jira, ClickUp, Asana, Monday.com, Zoho.
          </p>
          {visibleIntegrated.length === 0
            ? <div className="text-center py-12 text-gray-400 text-sm">No integrated tasks match your filters.</div>
            : visibleIntegrated.map(task => (
                <TaskCard key={task.id}
                  taskId={task.taskId} taskName={task.taskName}
                  dueDate={task.dueDate} status={task.status}
                  assignments={task.assignments}
                  overallocatedUsers={overallocatedUsers}
                  conflictingIds={conflictingIds}
                  header={
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sourceBadgeColor(task.source)}`}>
                      {task.source}
                    </span>
                  }
                  onAddAssignment={() => openAdd(task.id)}
                  onEditAssignment={a => openEdit(task.id, a)}
                  onDeleteAssignment={id => handleDelete(task.id, id)}
                  onCloneAssignment={a => openClone(task.id, a)}
                  onSmartAllocate={() => openSmartAlloc(task.id)}
                  isSelectedAssignment={isSelected}
                  onToggleAssignment={toggleItem}
                />
              ))
          }
        </TabsContent>

        <TabsContent value="campaign" className="space-y-4 pt-2">
          <p className="text-xs text-gray-400 pb-1">
            Tasks grouped by campaign. Expand a campaign to view and manage resource assignments per task.
          </p>
          {campaignGroups.length === 0
            ? <div className="text-center py-12 text-gray-400 text-sm">No campaign tasks match your filters.</div>
            : campaignGroups.map(({ campaign, tasks }) => (
                <CampaignGroupCard
                  key={campaign.id}
                  campaign={campaign}
                  tasks={tasks}
                  overallocatedUsers={overallocatedUsers}
                  conflictingIds={conflictingIds}
                  onAddAssignment={taskId => openAdd(taskId)}
                  onEditAssignment={(taskId, a) => openEdit(taskId, a)}
                  onDeleteAssignment={(taskId, id) => handleDelete(taskId, id)}
                  onCloneAssignment={(taskId, a) => openClone(taskId, a)}
                  onSmartAllocate={taskId => openSmartAlloc(taskId)}
                  isSelectedAssignment={isSelected}
                  onToggleAssignment={toggleItem}
                />
              ))
          }
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AssignmentDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setPrefillData(undefined); }}
        onSave={handleSave}
        editing={editingAssignment}
        prefill={prefillData}
      />
      <SmartAllocateDialog
        open={smartAllocOpen}
        onClose={() => setSmartAllocOpen(false)}
        target={smartAllocTarget}
        allAssignments={[
          ...integratedTasks.flatMap(t => t.assignments.map(a => ({ a, taskId: t.id }))),
          ...campaignTasks.flatMap(t => t.assignments.map(a => ({ a, taskId: t.id }))),
        ]}
        onSelect={handleSmartSelect}
      />
      <CloneDialog
        open={cloneDialogOpen}
        onClose={() => setCloneDialogOpen(false)}
        onClone={handleClone}
        intTasks={integratedTasks}
        camTasks={campaignTasks}
        sourceTaskId={cloneSourceTaskId}
      />
      <AddCampaignTaskDialog
        open={addCamTaskOpen}
        onClose={() => setAddCamTaskOpen(false)}
        campaigns={CAMPAIGNS}
        onAdd={task => setCampaignTasks(prev => [...prev, task])}
      />

      <BulkOperationsBar
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
        onArchiveSelected={() => {
          toast.success(`Archived ${selectedCount} assignments`);
          clearSelection();
        }}
        onDeleteSelected={() => {
          toast.success(`Deleted ${selectedCount} assignments`);
          clearSelection();
        }}
      />
    </div>
  );
}
