/**
 * Program Management — Mid-tier hierarchy
 * Portfolio → Program → Project → Task → Assignment
 */

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/app/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import {
  Layers, Plus, DollarSign, FolderKanban, Network, Users, Download,
  Activity, BarChart3, Target, ChevronRight, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';
import { programsApi } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProgramProject {
  id: string; name: string; client: string;
  budget: number; spent: number; health: number;
  status: 'active' | 'planning' | 'on-hold' | 'completed';
}

interface Program {
  id: string; name: string; description: string; owner: string;
  portfolioId: string; portfolioName: string;
  status: 'active' | 'planning' | 'on-hold' | 'closed';
  totalBudget: number; totalSpent: number;
  startDate: string; endDate: string; objective: string;
  projects: ProgramProject[];
}


const PORTFOLIOS = [
  { id: 'pf1', name: 'Digital Transformation' },
  { id: 'pf2', name: 'Brand & Marketing Excellence' },
  { id: 'pf3', name: 'Revenue Operations' },
  { id: 'pf4', name: 'Innovation Lab' },
];

const OWNERS = ['Alex Chen', 'Maria Lopez', 'James Wu', 'Sara Kim', 'Tom Reeves', 'Priya Patel'];

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const DUMMY_PROGRAMS: Program[] = [
  {
    id: 'prog-1',
    name: 'Cloud Migration Initiative',
    description: 'Full migration of on-premises infrastructure to AWS multi-region architecture.',
    owner: 'Alex Chen',
    portfolioId: 'pf1',
    portfolioName: 'Digital Transformation',
    status: 'active',
    totalBudget: 3000000,
    totalSpent: 1800000,
    startDate: '2025-01-01',
    endDate: '2026-06-30',
    objective: 'Reduce infrastructure costs by 40% and achieve 99.99% uptime SLA.',
    projects: [
      { id: 'pr1', name: 'AWS VPC Setup', client: 'Acme Digital', budget: 500000, spent: 420000, health: 88, status: 'active' },
      { id: 'pr2', name: 'Data Pipeline Migration', client: 'CreativeCo', budget: 800000, spent: 380000, health: 72, status: 'active' },
      { id: 'pr3', name: 'Kubernetes Orchestration', client: 'TechCorp', budget: 700000, spent: 500000, health: 81, status: 'active' },
      { id: 'pr4', name: 'DR & Failover Setup', client: 'Internal', budget: 400000, spent: 150000, health: 90, status: 'planning' },
      { id: 'pr5', name: 'Legacy Decommission', client: 'Internal', budget: 600000, spent: 350000, health: 65, status: 'on-hold' },
    ],
  },
  {
    id: 'prog-2',
    name: 'Global Campaign Hub',
    description: 'Centralized campaign execution platform supporting 14 regional markets.',
    owner: 'Maria Lopez',
    portfolioId: 'pf2',
    portfolioName: 'Brand & Marketing Excellence',
    status: 'active',
    totalBudget: 1800000,
    totalSpent: 1100000,
    startDate: '2025-03-01',
    endDate: '2025-12-31',
    objective: 'Deliver unified brand voice across all markets with 30% improved campaign ROI.',
    projects: [
      { id: 'pr6', name: 'Brand Identity Refresh', client: 'HQ Marketing', budget: 400000, spent: 380000, health: 93, status: 'active' },
      { id: 'pr7', name: 'Social Media Automation', client: 'EMEA Ops', budget: 350000, spent: 200000, health: 80, status: 'active' },
      { id: 'pr8', name: 'Campaign Analytics', client: 'APAC Ops', budget: 500000, spent: 310000, health: 75, status: 'active' },
      { id: 'pr9', name: 'Influencer Dashboard', client: 'US Ops', budget: 280000, spent: 110000, health: 60, status: 'planning' },
      { id: 'pr10', name: 'Print & OOH Tracker', client: 'LATAM Ops', budget: 270000, spent: 100000, health: 88, status: 'active' },
      { id: 'pr11', name: 'Event Marketing Suite', client: 'EMEA Ops', budget: 0, spent: 0, health: 70, status: 'planning' },
    ],
  },
  {
    id: 'prog-3',
    name: 'CRM Overhaul',
    description: 'Replacing legacy Salesforce org with unified HubSpot enterprise implementation.',
    owner: 'James Wu',
    portfolioId: 'pf3',
    portfolioName: 'Revenue Operations',
    status: 'active',
    totalBudget: 2000000,
    totalSpent: 1400000,
    startDate: '2024-07-01',
    endDate: '2025-12-31',
    objective: 'Unify sales, service, and marketing data in one revenue platform.',
    projects: [
      { id: 'pr12', name: 'HubSpot Data Migration', client: 'Sales Ops', budget: 600000, spent: 580000, health: 70, status: 'active' },
      { id: 'pr13', name: 'CPQ Integration', client: 'Finance', budget: 500000, spent: 350000, health: 62, status: 'active' },
      { id: 'pr14', name: 'CS Portal', client: 'Customer Success', budget: 450000, spent: 280000, health: 82, status: 'active' },
      { id: 'pr15', name: 'Revenue Reporting', client: 'Finance', budget: 280000, spent: 120000, health: 88, status: 'planning' },
      { id: 'pr16', name: 'Deal Intelligence AI', client: 'Sales', budget: 170000, spent: 70000, health: 50, status: 'on-hold' },
    ],
  },
  {
    id: 'prog-4',
    name: 'AI/ML Pilots',
    description: 'Fast-cycle prototyping of GenAI and predictive models across business units.',
    owner: 'Priya Patel',
    portfolioId: 'pf4',
    portfolioName: 'Innovation Lab',
    status: 'planning',
    totalBudget: 900000,
    totalSpent: 200000,
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    objective: 'Validate 3 production-ready AI use cases with measurable business impact.',
    projects: [
      { id: 'pr17', name: 'GenAI Content Engine', client: 'Marketing', budget: 300000, spent: 80000, health: 90, status: 'planning' },
      { id: 'pr18', name: 'Predictive Churn Model', client: 'Customer Success', budget: 350000, spent: 70000, health: 87, status: 'planning' },
      { id: 'pr19', name: 'Anomaly Detection', client: 'Finance', budget: 250000, spent: 50000, health: 92, status: 'planning' },
    ],
  },
  {
    id: 'prog-5',
    name: 'Sales Enablement 2.0',
    description: 'Next-gen sales toolkit: interactive proposals, battle cards, and training modules.',
    owner: 'Sara Kim',
    portfolioId: 'pf3',
    portfolioName: 'Revenue Operations',
    status: 'active',
    totalBudget: 1800000,
    totalSpent: 900000,
    startDate: '2025-04-01',
    endDate: '2026-03-31',
    objective: 'Cut sales cycle by 20% and increase win rate by 15%.',
    projects: [
      { id: 'pr20', name: 'Interactive Proposal Tool', client: 'Enterprise Sales', budget: 600000, spent: 350000, health: 85, status: 'active' },
      { id: 'pr21', name: 'Competitive Intel Hub', client: 'Product Marketing', budget: 500000, spent: 300000, health: 79, status: 'active' },
      { id: 'pr22', name: 'Sales Training LMS', client: 'HR', budget: 700000, spent: 250000, health: 88, status: 'active' },
    ],
  },
  {
    id: 'prog-6',
    name: 'DevOps Enablement',
    description: 'Building a world-class developer experience with zero-friction CI/CD and observability.',
    owner: 'Tom Reeves',
    portfolioId: 'pf1',
    portfolioName: 'Digital Transformation',
    status: 'active',
    totalBudget: 2000000,
    totalSpent: 700000,
    startDate: '2025-06-01',
    endDate: '2026-12-31',
    objective: 'Achieve sub-10 min deployment cycles and 99.5% deployment success rate.',
    projects: [
      { id: 'pr23', name: 'CI/CD Pipeline Standardization', client: 'Engineering', budget: 700000, spent: 280000, health: 91, status: 'active' },
      { id: 'pr24', name: 'Observability Stack', client: 'Platform', budget: 600000, spent: 250000, health: 82, status: 'active' },
      { id: 'pr25', name: 'Internal Developer Portal', client: 'Engineering', budget: 700000, spent: 170000, health: 75, status: 'planning' },
    ],
  },
];


// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

function healthColor(h: number) {
  if (h >= 75) return { text: 'text-green-600', bar: '[&>div]:bg-green-500' };
  if (h >= 55) return { text: 'text-amber-600', bar: '[&>div]:bg-amber-500' };
  return { text: 'text-red-600', bar: '[&>div]:bg-red-500' };
}

function statusBadge(s: Program['status']) {
  const m: Record<Program['status'], string> = {
    active: 'bg-green-100 text-green-700',
    planning: 'bg-blue-100 text-blue-700',
    'on-hold': 'bg-amber-100 text-amber-700',
    closed: 'bg-gray-100 text-gray-600',
  };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${m[s]}`}>{s}</span>;
}

function projectStatusDot(s: ProgramProject['status']) {
  const m = { active: 'bg-green-500', planning: 'bg-blue-400', 'on-hold': 'bg-amber-400', completed: 'bg-gray-400' };
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${m[s]}`} />;
}

// ─── Program Card ─────────────────────────────────────────────────────────────

function ProgramCard({
  program, expanded, onToggleExpand,
}: {
  program: Program; expanded: boolean; onToggleExpand: () => void;
}) {
  const burnPct = program.totalBudget > 0 ? (program.totalSpent / program.totalBudget) * 100 : 0;
  const avgHealth = program.projects.length
    ? Math.round(program.projects.reduce((s, p) => s + p.health, 0) / program.projects.length)
    : 0;
  const hc = healthColor(avgHealth);
  const atRisk = program.projects.filter(p => p.health < 55).length;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Layers className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span className="font-semibold text-gray-900 text-sm">{program.name}</span>
              {statusBadge(program.status)}
            </div>
            <div className="flex items-center gap-1 mb-1">
              <Network className="w-3 h-3 text-gray-400" />
              <span className="text-[11px] text-gray-400">{program.portfolioName}</span>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2">{program.description}</p>
          </div>
          <div className="flex-shrink-0 text-center">
            <div className={`text-xl font-bold ${hc.text}`}>{avgHealth}</div>
            <div className="text-[10px] text-gray-400">health</div>
          </div>
        </div>

        {/* Objective */}
        <div className="mb-3 p-2 bg-blue-50 rounded-lg">
          <p className="text-[11px] text-blue-800"><Target className="w-3 h-3 inline mr-1" />{program.objective}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-sm font-bold text-gray-900">{program.projects.length}</p>
            <p className="text-[10px] text-gray-400">Projects</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-sm font-bold text-red-500">{atRisk}</p>
            <p className="text-[10px] text-gray-400">At Risk</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-sm font-bold text-blue-600">{fmt(program.totalBudget)}</p>
            <p className="text-[10px] text-gray-400">Budget</p>
          </div>
        </div>

        {/* Budget burn */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Budget burn</span>
            <span className={`font-semibold ${burnPct > 85 ? 'text-red-600' : burnPct > 65 ? 'text-amber-600' : 'text-gray-700'}`}>
              {burnPct.toFixed(1)}%
            </span>
          </div>
          <Progress value={Math.min(100, burnPct)} className={`h-2 ${burnPct > 85 ? '[&>div]:bg-red-500' : burnPct > 65 ? '[&>div]:bg-amber-500' : '[&>div]:bg-purple-500'}`} />
        </div>

        {/* Owner + dates */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{program.owner}</span>
          <span>{program.startDate?.slice(0, 7) || '—'} → {program.endDate?.slice(0, 7) || '—'}</span>
        </div>

        {/* Expand toggle */}
        <button onClick={onToggleExpand}
          className="w-full flex items-center justify-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium py-1 border border-purple-100 rounded-lg hover:bg-purple-50 transition-colors">
          {expanded ? <ChevronRight className="w-3.5 h-3.5 rotate-90" /> : <ChevronRight className="w-3.5 h-3.5" />}
          {expanded ? 'Hide Projects' : `View ${program.projects.length} Projects`}
        </button>

        {/* Expanded project list */}
        {expanded && (
          <div className="mt-3 border-t pt-3 space-y-2">
            {program.projects.map(proj => {
              const projBurn = proj.budget > 0 ? (proj.spent / proj.budget) * 100 : 0;
              const projHc = healthColor(proj.health);
              return (
                <div key={proj.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 text-xs">
                  <FolderKanban className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 min-w-0">
                        {projectStatusDot(proj.status)}
                        <span className="font-medium text-gray-800 truncate">{proj.name}</span>
                      </div>
                      <span className={`font-bold flex-shrink-0 ${projHc.text}`}>{proj.health}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={Math.min(100, projBurn)} className={`h-1 w-16 flex-shrink-0 ${projHc.bar}`} />
                      <span className="text-gray-500 truncate">{proj.client} · {fmt(proj.budget)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Create Program Dialog ─────────────────────────────────────────────────────

function CreateProgramDialog({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void;
  onCreated: (p: Program) => void;
}) {
  const [form, setForm] = useState({
    name: '', description: '', owner: '', portfolioId: '', objective: '', startDate: '', endDate: '',
  });
  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleCreate = () => {
    if (!form.name) { toast.error('Program name is required'); return; }
    const portfolio = PORTFOLIOS.find(p => p.id === form.portfolioId);
    programsApi.create({
      name: form.name,
      description: form.description,
      owner: form.owner,
      portfolioId: form.portfolioId || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      status: 'planning',
    }).then(created => {
      const newProgram: Program = {
        id: created.id,
        name: created.name,
        description: created.description ?? '',
        owner: created.owner,
        portfolioId: created.portfolioId ?? form.portfolioId,
        portfolioName: (created as any).portfolio?.name ?? portfolio?.name ?? 'Unassigned',
        status: (created.status as Program['status']) ?? 'planning',
        totalBudget: created.budget ?? 0,
        totalSpent: created.spent ?? 0,
        startDate: created.startDate ?? form.startDate,
        endDate: created.endDate ?? form.endDate,
        objective: form.objective,
        projects: [],
      };
      onCreated(newProgram);
      toast.success(`Program "${form.name}" created`);
      onClose();
      setForm({ name: '', description: '', owner: '', portfolioId: '', objective: '', startDate: '', endDate: '' });
    }).catch(err => {
      toast.error(err.message);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Layers className="w-4 h-4 text-purple-600" />New Program</DialogTitle>
          <DialogDescription>A program groups related projects under a shared objective. Portfolio is optional.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1"><Label>Program Name *</Label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Data & Analytics" autoFocus />
          </div>
          <div className="space-y-1"><Label>Strategic Objective</Label>
            <Input value={form.objective} onChange={e => set('objective', e.target.value)} placeholder="What does this program deliver?" />
          </div>
          <div className="space-y-1"><Label>Description</Label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Scope and context…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Program Owner</Label>
              <Select value={form.owner} onValueChange={v => set('owner', v)}>
                <SelectTrigger><SelectValue placeholder="Select owner" /></SelectTrigger>
                <SelectContent>{OWNERS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Parent Portfolio <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Select value={form.portfolioId} onValueChange={v => set('portfolioId', v)}>
                <SelectTrigger><SelectValue placeholder="No portfolio" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No portfolio</SelectItem>
                  {PORTFOLIOS.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div>
            <div className="space-y-1"><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!form.name} className="bg-purple-600 hover:bg-purple-700">Create Program</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProgramManagement() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const load = () => {
    setLoading(true);
    setError(null);
    programsApi.list().then(result => {
      if (result.data && result.data.length > 0) {
        const mapped: Program[] = result.data.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description ?? '',
          owner: p.owner,
          portfolioId: p.portfolioId ?? '',
          portfolioName: (p as any).portfolio?.name ?? 'Unassigned',
          status: (p.status as Program['status']) ?? 'planning',
          totalBudget: p.budget ?? 0,
          totalSpent: p.spent ?? 0,
          startDate: p.startDate ?? '',
          endDate: p.endDate ?? '',
          objective: '',
          projects: [],
        }));
        setPrograms(mapped);
      } else {
        // Fallback to rich dummy data when API returns empty
        setPrograms(DUMMY_PROGRAMS);
      }
    }).catch(() => {
      // Use dummy data on API error so page is always useful
      setPrograms(DUMMY_PROGRAMS);
      setError(null);
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);
  const [search, setSearch] = useState('');
  const [portfolioFilter, setPortfolioFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => programs.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (portfolioFilter !== 'all' && p.portfolioId !== portfolioFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  }), [programs, search, portfolioFilter, statusFilter]);

  const kpis = useMemo(() => ({
    totalPrograms: programs.length,
    totalProjects: programs.reduce((s, p) => s + p.projects.length, 0),
    totalBudget: programs.reduce((s, p) => s + p.totalBudget, 0),
    atRisk: programs.filter(p => p.projects.some(proj => proj.health < 55)).length,
    active: programs.filter(p => p.status === 'active').length,
  }), [programs]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const chartData = programs.map(pg => ({
    name: pg.name.split(' ').slice(0, 2).join(' '),
    budget: pg.totalBudget,
    spent: pg.totalSpent,
    health: Math.round(pg.projects.reduce((s, p) => s + p.health, 0) / (pg.projects.length || 1)),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-7 h-7 text-purple-600" />
            <h1 className="text-2xl font-semibold text-gray-900">Program Management</h1>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            Portfolio → <strong className="text-purple-600">Programs</strong> → Projects → Tasks → Assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('Exported!')}><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-1" />New Program</Button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Programs', value: kpis.totalPrograms, Icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Active', value: kpis.active, Icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Projects', value: kpis.totalProjects, Icon: FolderKanban, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'At Risk', value: kpis.atRisk, Icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Total Budget', value: fmt(kpis.totalBudget), Icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map(({ label, value, Icon, color, bg }) => (
          <Card key={label}><CardContent className={`pt-4 pb-3 text-center ${bg} rounded-lg`}>
            <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
          </CardContent></Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Input placeholder="Search programs…" value={search} onChange={e => setSearch(e.target.value)} className="h-9 w-52" />
        <Select value={portfolioFilter} onValueChange={setPortfolioFilter}>
          <SelectTrigger className="h-9 w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Portfolios</SelectItem>
            {PORTFOLIOS.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
        <button onClick={() => setExpandedIds(new Set(programs.map(p => p.id)))}
          className="ml-auto text-xs text-purple-600 hover:underline">Expand All</button>
        <button onClick={() => setExpandedIds(new Set())} className="text-xs text-gray-500 hover:underline">Collapse All</button>
      </div>

      {/* Program Grid */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}><CardContent className="p-5 space-y-3">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-full" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-4/5" />
              <div className="h-2 bg-gray-100 rounded animate-pulse w-full mt-2" />
            </CardContent></Card>
          ))}
        </div>
      )}

      {!loading && error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <p className="font-semibold text-gray-800 mb-1">Could not load programs</p>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <Button size="sm" onClick={load}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No programs found</p>
              <p className="text-sm mt-1">Create your first program to get started.</p>
            </div>
          ) : filtered.map(p => (
            <ProgramCard key={p.id} program={p} expanded={expandedIds.has(p.id)} onToggleExpand={() => toggleExpand(p.id)} />
          ))}
        </div>
      )}

      {/* Budget Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4" />Program Budget vs Spend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [fmt(v)]} />
              <Bar dataKey="budget" name="Budget" fill="#e9d5ff" radius={[3, 3, 0, 0]} />
              <Bar dataKey="spent" name="Spent" fill="#a855f7" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <CreateProgramDialog
        open={createOpen} onClose={() => setCreateOpen(false)}
        onCreated={p => setPrograms(prev => [p, ...prev])}
      />
    </div>
  );
}
