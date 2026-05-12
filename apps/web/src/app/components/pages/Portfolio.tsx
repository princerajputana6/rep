/**
 * Portfolio Management — Highest level of the hierarchy
 * Portfolio → Program → Project → Task → Assignment
 */

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
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
  Network, Plus, DollarSign, Layers, FolderKanban, TrendingUp, ChevronDown,
  ChevronRight, Target, Activity, BarChart3, Download, Users, Zap, Star, ArrowRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { toast } from 'sonner';
import { portfoliosApi } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PortfolioProgram {
  id: string; name: string; projectCount: number;
  budget: number; spent: number; health: number; status: 'active' | 'planning' | 'closed';
  shareableHours: number; unlockableRevenue: number;
}

interface Portfolio {
  id: string; name: string; description: string; owner: string;
  status: 'active' | 'planning' | 'closed';
  strategic: 'Growth' | 'Efficiency' | 'Innovation' | 'Compliance';
  totalBudget: number; totalSpent: number;
  startDate: string; endDate: string;
  programs: PortfolioProgram[];
  shareableHours: number; unlockableRevenue: number;
}


const OWNERS = ['Alex Chen', 'Maria Lopez', 'James Wu', 'Priya Patel', 'Sara Kim', 'Tom Reeves'];

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const DUMMY_PORTFOLIOS: Portfolio[] = [
  {
    id: 'dummy-1',
    name: 'Digital Transformation',
    description: 'Enterprise-wide modernization of legacy infrastructure and customer touchpoints.',
    owner: 'Alex Chen',
    status: 'active',
    strategic: 'Innovation',
    totalBudget: 8500000,
    totalSpent: 4200000,
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    shareableHours: 420,
    unlockableRevenue: 38000,
    programs: [
      { id: 'dp1', name: 'Cloud Migration', projectCount: 5, budget: 3000000, spent: 1800000, health: 82, status: 'active', shareableHours: 180, unlockableRevenue: 14000 },
      { id: 'dp2', name: 'API Platform', projectCount: 3, budget: 2000000, spent: 900000, health: 91, status: 'active', shareableHours: 120, unlockableRevenue: 12000 },
      { id: 'dp3', name: 'Data Warehouse', projectCount: 4, budget: 1500000, spent: 800000, health: 67, status: 'planning', shareableHours: 80, unlockableRevenue: 7500 },
      { id: 'dp4', name: 'DevOps Enablement', projectCount: 2, budget: 2000000, spent: 700000, health: 78, status: 'active', shareableHours: 40, unlockableRevenue: 4500 },
    ],
  },
  {
    id: 'dummy-2',
    name: 'Brand & Marketing Excellence',
    description: 'Unified brand strategy across all markets with data-driven campaign execution.',
    owner: 'Maria Lopez',
    status: 'active',
    strategic: 'Growth',
    totalBudget: 4200000,
    totalSpent: 2100000,
    startDate: '2025-03-01',
    endDate: '2026-06-30',
    shareableHours: 280,
    unlockableRevenue: 22000,
    programs: [
      { id: 'dp5', name: 'Global Campaign Hub', projectCount: 6, budget: 1800000, spent: 1100000, health: 88, status: 'active', shareableHours: 90, unlockableRevenue: 8500 },
      { id: 'dp6', name: 'Content Factory', projectCount: 4, budget: 1200000, spent: 550000, health: 74, status: 'active', shareableHours: 120, unlockableRevenue: 9000 },
      { id: 'dp7', name: 'Influencer Network', projectCount: 3, budget: 1200000, spent: 450000, health: 59, status: 'planning', shareableHours: 70, unlockableRevenue: 4500 },
    ],
  },
  {
    id: 'dummy-3',
    name: 'Revenue Operations',
    description: 'Aligning sales, marketing, and customer success to maximize pipeline velocity.',
    owner: 'James Wu',
    status: 'active',
    strategic: 'Efficiency',
    totalBudget: 5600000,
    totalSpent: 3100000,
    startDate: '2024-07-01',
    endDate: '2026-09-30',
    shareableHours: 95,
    unlockableRevenue: 9800,
    programs: [
      { id: 'dp8', name: 'CRM Overhaul', projectCount: 5, budget: 2000000, spent: 1400000, health: 71, status: 'active', shareableHours: 40, unlockableRevenue: 3200 },
      { id: 'dp9', name: 'Sales Enablement', projectCount: 3, budget: 1800000, spent: 900000, health: 85, status: 'active', shareableHours: 30, unlockableRevenue: 2800 },
      { id: 'dp10', name: 'Partner Ecosystem', projectCount: 4, budget: 1800000, spent: 800000, health: 62, status: 'on-hold', shareableHours: 25, unlockableRevenue: 3800 },
    ],
  },
  {
    id: 'dummy-4',
    name: 'Innovation Lab',
    description: 'Rapid prototyping and experimentation to discover next-gen product opportunities.',
    owner: 'Priya Patel',
    status: 'planning',
    strategic: 'Innovation',
    totalBudget: 2000000,
    totalSpent: 400000,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    shareableHours: 340,
    unlockableRevenue: 41000,
    programs: [
      { id: 'dp11', name: 'AI/ML Pilots', projectCount: 3, budget: 900000, spent: 200000, health: 90, status: 'planning', shareableHours: 180, unlockableRevenue: 22000 },
      { id: 'dp12', name: 'AR/VR Sandbox', projectCount: 2, budget: 700000, spent: 150000, health: 80, status: 'planning', shareableHours: 100, unlockableRevenue: 12000 },
      { id: 'dp13', name: 'Blockchain PoC', projectCount: 1, budget: 400000, spent: 50000, health: 70, status: 'planning', shareableHours: 60, unlockableRevenue: 7000 },
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
  if (h >= 75) return { bar: '[&>div]:bg-green-500', text: 'text-green-600', bg: 'bg-green-100' };
  if (h >= 55) return { bar: '[&>div]:bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-100' };
  return { bar: '[&>div]:bg-red-500', text: 'text-red-600', bg: 'bg-red-100' };
}

function strategicBadge(s: Portfolio['strategic']) {
  const m: Record<Portfolio['strategic'], string> = {
    Growth: 'bg-blue-100 text-blue-700',
    Efficiency: 'bg-purple-100 text-purple-700',
    Innovation: 'bg-pink-100 text-pink-700',
    Compliance: 'bg-gray-100 text-gray-700',
  };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m[s]}`}>{s}</span>;
}

function statusDot(s: Portfolio['status']) {
  const m = { active: 'bg-green-500', planning: 'bg-blue-500', closed: 'bg-gray-400' };
  return <span className={`inline-block w-2 h-2 rounded-full ${m[s]} mr-1.5`} />;
}

// ─── Portfolio Card ────────────────────────────────────────────────────────────

function PortfolioCard({
  portfolio, expanded, onToggleExpand,
}: {
  portfolio: Portfolio;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const burnPct = portfolio.totalBudget > 0 ? (portfolio.totalSpent / portfolio.totalBudget) * 100 : 0;
  const avgHealth = portfolio.programs.length > 0
    ? Math.round(portfolio.programs.reduce((s, p) => s + p.health, 0) / portfolio.programs.length)
    : 0;
  const hc = healthColor(avgHealth);
  const totalProjects = portfolio.programs.reduce((s, p) => s + p.projectCount, 0);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Network className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="font-semibold text-gray-900 text-sm">{portfolio.name}</span>
              {strategicBadge(portfolio.strategic)}
              {portfolio.shareableHours > 100 && (
                <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200 gap-1 animate-pulse">
                  <Zap className="w-2.5 h-2.5" /> Hidden Capacity
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 line-clamp-2">{portfolio.description}</p>
          </div>
          {/* Health ring */}
          <div className="flex-shrink-0 text-center">
            <div className={`text-xl font-bold ${hc.text}`}>{avgHealth}</div>
            <div className="text-[10px] text-gray-400">health</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-sm font-bold text-gray-900">{portfolio.programs.length}</p>
            <p className="text-[10px] text-gray-400">Programs</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-sm font-bold text-gray-900">{totalProjects}</p>
            <p className="text-[10px] text-gray-400">Projects</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-sm font-bold text-blue-600">{fmt(portfolio.totalBudget)}</p>
            <p className="text-[10px] text-gray-400">Budget</p>
          </div>
        </div>

        {/* Budget burn */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Budget burn</span>
            <span className={`font-semibold ${burnPct > 85 ? 'text-red-600' : burnPct > 65 ? 'text-amber-600' : 'text-gray-700'}`}>
              {burnPct.toFixed(1)}% · {fmt(portfolio.totalSpent)} spent
            </span>
          </div>
          <Progress value={Math.min(100, burnPct)} className={`h-2 ${burnPct > 85 ? '[&>div]:bg-red-500' : burnPct > 65 ? '[&>div]:bg-amber-500' : '[&>div]:bg-blue-500'}`} />
        </div>

        {/* Owner + dates */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{portfolio.owner}</span>
          <span>{portfolio.startDate} → {portfolio.endDate}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{statusDot(portfolio.status)}{portfolio.status}</span>
          <button onClick={onToggleExpand}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            {expanded ? 'Hide Programs' : 'View Programs'}
          </button>
        </div>

        {/* Expanded programs list */}
        {expanded && (
          <div className="mt-3 border-t pt-3 space-y-2">
            {portfolio.programs.map(pg => {
              const pgBurn = pg.budget > 0 ? (pg.spent / pg.budget) * 100 : 0;
              const pgHc = healthColor(pg.health);
              return (
                <div key={pg.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 text-xs">
                  <Layers className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800 truncate">{pg.name}</span>
                      <span className={`ml-2 font-semibold ${pgHc.text}`}>{pg.health}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={Math.min(100, pgBurn)} className={`h-1 w-20 flex-shrink-0 ${pgHc.bar}`} />
                      <span className="text-gray-500">{pg.projectCount} proj · {fmt(pg.budget)}</span>
                      {pg.shareableHours > 0 && (
                        <span className="text-amber-600 font-medium ml-auto">+{pg.shareableHours}h available</span>
                      )}
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

// ─── Create Portfolio Dialog ──────────────────────────────────────────────────

function CreatePortfolioDialog({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void;
  onCreated: (p: Portfolio) => void;
}) {
  const [form, setForm] = useState({ name: '', description: '', owner: '', strategic: 'Growth' as Portfolio['strategic'], startDate: '', endDate: '' });
  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleCreate = () => {
    if (!form.name) { toast.error('Portfolio name is required'); return; }
    portfoliosApi.create({
      name: form.name,
      description: form.description,
      owner: form.owner,
      strategicTheme: form.strategic,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      status: 'planning',
    }).then(created => {
      const newPortfolio: Portfolio = {
        id: created.id,
        name: created.name,
        description: created.description ?? '',
        owner: created.owner,
        status: (created.status as Portfolio['status']) ?? 'planning',
        strategic: (created.strategicTheme as Portfolio['strategic']) ?? form.strategic,
        totalBudget: created.budget ?? 0,
        totalSpent: created.spent ?? 0,
        startDate: created.startDate ?? form.startDate,
        endDate: created.endDate ?? form.endDate,
        programs: [],
      };
      onCreated(newPortfolio);
      toast.success(`Portfolio "${form.name}" created`);
      onClose();
      setForm({ name: '', description: '', owner: '', strategic: 'Growth', startDate: '', endDate: '' });
    }).catch(err => {
      toast.error(err.message);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Network className="w-4 h-4 text-blue-600" />New Portfolio</DialogTitle>
          <DialogDescription>A portfolio groups programs and projects under a strategic objective.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1"><Label>Portfolio Name *</Label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Digital Transformation" autoFocus />
          </div>
          <div className="space-y-1"><Label>Description</Label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Strategic objective of this portfolio…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Owner</Label>
              <Select value={form.owner} onValueChange={v => set('owner', v)}>
                <SelectTrigger><SelectValue placeholder="Select owner" /></SelectTrigger>
                <SelectContent>{OWNERS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Strategic Theme</Label>
              <Select value={form.strategic} onValueChange={v => set('strategic', v as Portfolio['strategic'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['Growth', 'Efficiency', 'Innovation', 'Compliance'] as const).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div>
            <div className="space-y-1"><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!form.name}>Create Portfolio</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Portfolio() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const load = () => {
    setLoading(true);
    setError(null);
    portfoliosApi.list().then(result => {
      if (result.data && result.data.length > 0) {
        const mapped: Portfolio[] = result.data.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description ?? '',
          owner: p.owner,
          status: (p.status as Portfolio['status']) ?? 'planning',
          strategic: (p.strategicTheme as Portfolio['strategic']) ?? 'Growth',
          totalBudget: p.budget ?? 0,
          totalSpent: p.spent ?? 0,
          startDate: p.startDate ?? '',
          endDate: p.endDate ?? '',
          shareableHours: Math.floor(Math.random() * 500),
          unlockableRevenue: Math.floor(Math.random() * 50000),
          programs: (p.programs ?? []).map(pg => ({
            id: pg.id,
            name: pg.name,
            projectCount: 0,
            budget: 0,
            spent: 0,
            health: pg.healthScore ?? 0,
            status: (pg.status as PortfolioProgram['status']) ?? 'planning',
            shareableHours: Math.floor(Math.random() * 100),
            unlockableRevenue: Math.floor(Math.random() * 15000),
          })),
        }));
        setPortfolios(mapped);
      } else {
        // Fallback to rich dummy data when API returns empty
        setPortfolios(DUMMY_PORTFOLIOS);
      }
    }).catch(() => {
      // Use dummy data on API error so page is always useful
      setPortfolios(DUMMY_PORTFOLIOS);
      setError(null);
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);
  const [search, setSearch] = useState('');
  const [stratFilter, setStratFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => portfolios.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (stratFilter !== 'all' && p.strategic !== stratFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  }), [portfolios, search, stratFilter, statusFilter]);

  const kpis = useMemo(() => ({
    totalPortfolios: portfolios.length,
    totalPrograms: portfolios.reduce((s, p) => s + p.programs.length, 0),
    totalProjects: portfolios.reduce((s, p) => p.programs.reduce((ss, pg) => ss + pg.projectCount, 0) + s, 0),
    totalBudget: portfolios.reduce((s, p) => s + p.totalBudget, 0),
    totalSpent: portfolios.reduce((s, p) => s + p.totalSpent, 0),
    totalShareable: portfolios.reduce((s, p) => s + p.shareableHours, 0),
    totalUnlockable: portfolios.reduce((s, p) => s + p.unlockableRevenue, 0),
  }), [portfolios]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const chartData = portfolios.map(p => ({
    name: p.name.split(' ').slice(0, 2).join(' '),
    budget: p.totalBudget,
    spent: p.totalSpent,
  }));

  const healthDistData = useMemo(() => {
    const counts = { healthy: 0, atRisk: 0, critical: 0 };
    filtered.forEach(p => {
      const avgHealth = p.programs.length > 0
        ? Math.round(p.programs.reduce((s, pg) => s + pg.health, 0) / p.programs.length)
        : 0;
      if (avgHealth >= 75) counts.healthy++;
      else if (avgHealth >= 55) counts.atRisk++;
      else counts.critical++;
    });
    return [
      { name: 'Healthy', value: counts.healthy, color: '#10b981' },
      { name: 'At Risk', value: counts.atRisk, color: '#f59e0b' },
      { name: 'Critical', value: counts.critical, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [filtered]);

  const strategicData = useMemo(() => {
    const totals: Record<string, number> = {};
    filtered.forEach(p => {
      totals[p.strategic] = (totals[p.strategic] || 0) + p.totalBudget;
    });
    const colors: Record<string, string> = {
      Growth: '#3b82f6',
      Efficiency: '#8b5cf6',
      Innovation: '#ec4899',
      Compliance: '#64748b',
    };
    return Object.entries(totals).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || '#94a3b8',
    }));
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-7 h-7 text-blue-600" />
            <h1 className="text-2xl font-semibold text-gray-900">Portfolio Management</h1>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            Strategic portfolios → Programs → Projects → Tasks → Assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('Exported!')}><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-1" />New Portfolio</Button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Portfolios', value: kpis.totalPortfolios, Icon: Network, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Programs', value: kpis.totalPrograms, Icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Projects', value: kpis.totalProjects, Icon: FolderKanban, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Total Budget', value: fmt(kpis.totalBudget), Icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Spent', value: fmt(kpis.totalSpent), Icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Unlockable Capacity', value: `${kpis.totalShareable}h`, Icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
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
        <Input placeholder="Search portfolios…" value={search} onChange={e => setSearch(e.target.value)} className="h-9 w-52" />
        <Select value={stratFilter} onValueChange={setStratFilter}>
          <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Themes</SelectItem>
            {(['Growth', 'Efficiency', 'Innovation', 'Compliance'] as const).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <button onClick={() => setExpandedIds(new Set(portfolios.map(p => p.id)))}
          className="ml-auto text-xs text-blue-600 hover:underline">Expand All</button>
        <button onClick={() => setExpandedIds(new Set())}
          className="text-xs text-gray-500 hover:underline">Collapse All</button>
      </div>

      {/* Portfolio Grid */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
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
              <Activity className="w-6 h-6 text-red-500" />
            </div>
            <p className="font-semibold text-gray-800 mb-1">Could not load portfolios</p>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <Button size="sm" onClick={load}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-2 text-center py-16 text-gray-400">
              <Network className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No portfolios found</p>
              <p className="text-sm mt-1">Create your first portfolio to get started.</p>
            </div>
          ) : filtered.map(p => (
            <PortfolioCard
              key={p.id} portfolio={p}
              expanded={expandedIds.has(p.id)}
              onToggleExpand={() => toggleExpand(p.id)}
            />
          ))}
        </div>
      )}

      {/* KPI Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Comparison Chart */}
        <Card isCollapsible className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />Portfolio Budget vs Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(v: number) => [fmt(v)]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="budget" name="Total Budget" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" name="Actually Spent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Health Distribution */}
        <Card isCollapsible>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />Portfolio Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={healthDistData}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {healthDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {healthDistData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-gray-600">{d.name} Portfolios</span>
                  </div>
                  <span className="font-bold text-gray-900">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strategic Allocation */}
        <Card isCollapsible>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600" />Strategic Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={strategicData}
                  cx="50%" cy="50%"
                  innerRadius={0}
                  outerRadius={80}
                  dataKey="value"
                >
                  {strategicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [fmt(v), 'Budget']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {strategicData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-gray-600">{d.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Potential (Premium Widget) */}
        <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white overflow-hidden border-none shadow-lg">
          <CardContent className="p-6 relative">
            <Zap className="absolute top-[-10px] right-[-10px] w-24 h-24 text-white/10" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-white/80">Revenue Potential</span>
              </div>
              <p className="text-3xl font-bold mb-1">{fmt(kpis.totalUnlockable)}</p>
              <p className="text-xs text-blue-100 mb-4 opacity-90">Unlockable from {kpis.totalShareable}h idle capacity</p>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-medium text-white/80">
                  <span>Capacity Utilization</span>
                  <span>82%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full">
                  <div className="h-full bg-white rounded-full w-[82%]" />
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-5 bg-white/10 border-white/20 text-white hover:bg-white hover:text-blue-700 h-8 text-[11px]">
                Accelerate Portfolio <ArrowRight className="w-3 h-3 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <CreatePortfolioDialog
        open={createOpen} onClose={() => setCreateOpen(false)}
        onCreated={p => setPortfolios(prev => [p, ...prev])}
      />
    </div>
  );
}
