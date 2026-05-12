import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import {
  BarChart, Bar, LineChart, Line, Area, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  DollarSign, TrendingUp, TrendingDown, AlertCircle, RefreshCw, Download,
  Activity, BarChart3, Target, Zap, CheckCircle2,
  Layers, AlertTriangle, Network, ChevronRight,
  FolderKanban, ListChecks, Users,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PL_DATA = [
  { month: 'Aug', revenue: 890000, cogs: 510000, grossProfit: 380000, opex: 180000, ebitda: 200000, interest: 12000, net: 188000 },
  { month: 'Sep', revenue: 945000, cogs: 535000, grossProfit: 410000, opex: 185000, ebitda: 225000, interest: 12000, net: 213000 },
  { month: 'Oct', revenue: 1020000, cogs: 572000, grossProfit: 448000, opex: 190000, ebitda: 258000, interest: 12000, net: 246000 },
  { month: 'Nov', revenue: 975000, cogs: 548000, grossProfit: 427000, opex: 188000, ebitda: 239000, interest: 12000, net: 227000 },
  { month: 'Dec', revenue: 890000, cogs: 498000, grossProfit: 392000, opex: 178000, ebitda: 214000, interest: 12000, net: 202000 },
  { month: 'Jan', revenue: 1085000, cogs: 598000, grossProfit: 487000, opex: 195000, ebitda: 292000, interest: 12000, net: 280000 },
];

const PL_MARGIN = PL_DATA.map(d => ({
  month: d.month,
  gpPct: parseFloat(((d.grossProfit / d.revenue) * 100).toFixed(1)),
  ebitdaPct: parseFloat(((d.ebitda / d.revenue) * 100).toFixed(1)),
  netPct: parseFloat(((d.net / d.revenue) * 100).toFixed(1)),
}));

const CASHFLOW_DATA = [
  { month: 'Oct', inflow: 980000, outflow: 762000, net: 218000, projected: false },
  { month: 'Nov', inflow: 935000, outflow: 736000, net: 199000, projected: false },
  { month: 'Dec', inflow: 855000, outflow: 710000, net: 145000, projected: false },
  { month: 'Jan', inflow: 1040000, outflow: 810000, net: 230000, projected: false },
  { month: 'Feb', inflow: 1060000, outflow: 820000, net: 240000, projected: true },
  { month: 'Mar', inflow: 1090000, outflow: 830000, net: 260000, projected: true },
  { month: 'Apr', inflow: 1120000, outflow: 845000, net: 275000, projected: true },
];

interface ProjectBurn {
  id: string; name: string; client: string;
  budget: number; spent: number; plannedPct: number;
  billValue: number; costValue: number; daysTotal: number; daysElapsed: number;
  status: 'on-track' | 'warning' | 'over-budget';
  variance: number;
}

const PROJECTS_BURN: ProjectBurn[] = [
  { id:'p1', name:'Digital Transformation', client:'Acme Corp', budget:240000, spent:218000, plannedPct:88, billValue:285000, costValue:218000, daysTotal:180, daysElapsed:158, status:'on-track', variance:22000 },
  { id:'p2', name:'Mobile App Redesign', client:'TechStart Inc', budget:180000, spent:195000, plannedPct:82, billValue:210000, costValue:195000, daysTotal:120, daysElapsed:98, status:'over-budget', variance:-15000 },
  { id:'p3', name:'Data Analytics Platform', client:'DataViz Co', budget:320000, spent:285000, plannedPct:75, billValue:380000, costValue:285000, daysTotal:200, daysElapsed:150, status:'on-track', variance:35000 },
  { id:'p4', name:'E-commerce Platform', client:'RetailBrand', budget:400000, spent:412000, plannedPct:95, billValue:450000, costValue:412000, daysTotal:240, daysElapsed:228, status:'over-budget', variance:-12000 },
  { id:'p5', name:'Brand Awareness H2', client:'GlobalBrand', budget:85000, spent:42000, plannedPct:40, billValue:95000, costValue:42000, daysTotal:180, daysElapsed:72, status:'on-track', variance:43000 },
  { id:'p6', name:'CRM Integration', client:'SalesForce Ltd', budget:150000, spent:138000, plannedPct:92, billValue:165000, costValue:138000, daysTotal:90, daysElapsed:82, status:'warning', variance:12000 },
];

interface AgencyLedger {
  agency: string; borrowCost: number; lendRevenue: number; netPosition: number;
  aging30: number; aging60: number; aging90: number; aging90plus: number;
  lastSettlement: string; status: 'cleared' | 'pending' | 'overdue';
}
const AGENCY_LEDGER: AgencyLedger[] = [
  { agency:'Acme Digital', borrowCost:145000, lendRevenue:98000, netPosition:-47000, aging30:0, aging60:20000, aging90:18000, aging90plus:9000, lastSettlement:'2026-01-15', status:'overdue' },
  { agency:'CreativeCo', borrowCost:67000, lendRevenue:122000, netPosition:55000, aging30:30000, aging60:25000, aging90:0, aging90plus:0, lastSettlement:'2026-02-01', status:'pending' },
  { agency:'TechVentures', borrowCost:98000, lendRevenue:156000, netPosition:58000, aging30:58000, aging60:0, aging90:0, aging90plus:0, lastSettlement:'2026-02-10', status:'pending' },
  { agency:'Digital Wave', borrowCost:52000, lendRevenue:78000, netPosition:26000, aging30:26000, aging60:0, aging90:0, aging90plus:0, lastSettlement:'2026-02-12', status:'cleared' },
];

const LEAKAGE_ITEMS = [
  { type:'Unbilled Hours', amount:24500, projects:3, recoverable:true, priority:'high' as const },
  { type:'Rate Discount Creep', amount:18000, projects:5, recoverable:false, priority:'medium' as const },
  { type:'Scope Overrun (Untracked)', amount:31200, projects:2, recoverable:true, priority:'critical' as const },
  { type:'Unused Retainer Capacity', amount:12000, projects:2, recoverable:false, priority:'low' as const },
];

const LEAKAGE_TOTAL = LEAKAGE_ITEMS.reduce((s, l) => s + l.amount, 0);
const LEAKAGE_RECOVERABLE = LEAKAGE_ITEMS.filter(l => l.recoverable).reduce((s, l) => s + l.amount, 0);

// ─── Drill-down Hierarchy Data ────────────────────────────────────────────────

interface PortfolioDef { id: string; name: string; programIds: string[] }
interface ProgramDef  { id: string; name: string; portfolioId: string; projectIds: string[] }

const FIN_PORTFOLIOS: PortfolioDef[] = [
  { id: 'pf1', name: 'Digital Transformation',       programIds: ['pg1', 'pg2'] },
  { id: 'pf2', name: 'Brand & Marketing Excellence', programIds: ['pg3'] },
  { id: 'pf3', name: 'Revenue Operations',           programIds: ['pg4'] },
];

const FIN_PROGRAMS: ProgramDef[] = [
  { id: 'pg1', name: 'Data & Analytics',        portfolioId: 'pf1', projectIds: ['p3', 'p4'] },
  { id: 'pg2', name: 'Customer Experience',     portfolioId: 'pf1', projectIds: ['p2'] },
  { id: 'pg3', name: 'Campaign Excellence',     portfolioId: 'pf2', projectIds: ['p1', 'p5'] },
  { id: 'pg4', name: 'CRM & Sales Enablement',  portfolioId: 'pf3', projectIds: ['p6'] },
];

interface TaskBurn {
  id: string; name: string; projectId: string;
  budget: number; spent: number; resourceCount: number; hoursTotal: number; hoursLogged: number;
}
const TASK_BURN: TaskBurn[] = [
  { id: 't1', name: 'UX Research & Audit',       projectId: 'p1', budget: 45000,  spent: 40000,  resourceCount: 2, hoursTotal: 300, hoursLogged: 267 },
  { id: 't2', name: 'UI Design System',           projectId: 'p1', budget: 80000,  spent: 68000,  resourceCount: 3, hoursTotal: 480, hoursLogged: 413 },
  { id: 't3', name: 'Frontend Development',       projectId: 'p1', budget: 115000, spent: 110000, resourceCount: 4, hoursTotal: 720, hoursLogged: 695 },
  { id: 't4', name: 'Requirements Gathering',     projectId: 'p2', budget: 25000,  spent: 25000,  resourceCount: 2, hoursTotal: 160, hoursLogged: 160 },
  { id: 't5', name: 'App Architecture',           projectId: 'p2', budget: 60000,  spent: 72000,  resourceCount: 2, hoursTotal: 380, hoursLogged: 460 },
  { id: 't6', name: 'QA & Testing',               projectId: 'p2', budget: 95000,  spent: 98000,  resourceCount: 3, hoursTotal: 600, hoursLogged: 618 },
  { id: 't7', name: 'Data Pipeline Build',         projectId: 'p3', budget: 120000, spent: 98000,  resourceCount: 3, hoursTotal: 750, hoursLogged: 620 },
  { id: 't8', name: 'Dashboard Development',       projectId: 'p3', budget: 85000,  spent: 75000,  resourceCount: 2, hoursTotal: 530, hoursLogged: 470 },
  { id: 't9', name: 'Model Training & Validation', projectId: 'p3', budget: 115000, spent: 112000, resourceCount: 2, hoursTotal: 720, hoursLogged: 700 },
];

interface AssignmentBurn {
  id: string; taskId: string; resource: string; role: string;
  hours: number; ratePerHour: number; cost: number; billedHours: number;
}
const ASSIGNMENT_BURN: AssignmentBurn[] = [
  { id: 'a1', taskId: 't1', resource: 'Alex Chen',    role: 'UX Lead',        hours: 120, ratePerHour: 175, cost: 21000, billedHours: 118 },
  { id: 'a2', taskId: 't1', resource: 'Sara Kim',     role: 'Researcher',     hours: 147, ratePerHour: 130, cost: 19110, billedHours: 149 },
  { id: 'a3', taskId: 't2', resource: 'Alex Chen',    role: 'Design Lead',    hours: 160, ratePerHour: 175, cost: 28000, billedHours: 140 },
  { id: 'a4', taskId: 't2', resource: 'Tom Reeves',   role: 'UI Designer',    hours: 180, ratePerHour: 140, cost: 25200, billedHours: 165 },
  { id: 'a5', taskId: 't2', resource: 'Priya Patel',  role: 'Motion Designer',hours:  73, ratePerHour: 135, cost:  9855, billedHours: 108 },
  { id: 'a6', taskId: 't3', resource: 'James Wu',     role: 'Tech Lead',      hours: 200, ratePerHour: 195, cost: 39000, billedHours: 196 },
  { id: 'a7', taskId: 't3', resource: 'Maria Lopez',  role: 'Frontend Dev',   hours: 260, ratePerHour: 155, cost: 40300, billedHours: 255 },
  { id: 'a8', taskId: 't3', resource: 'Sara Kim',     role: 'Frontend Dev',   hours: 235, ratePerHour: 130, cost: 30550, billedHours: 244 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 0) {
  if (Math.abs(n) >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(decimals)}K`;
  return `$${n.toFixed(decimals)}`;
}

function TrendBadge({ value, unit = '%' }: { value: number; unit?: string }) {
  const pos = value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${pos ? 'text-emerald-600' : 'text-red-500'}`}>
      {pos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {pos ? '+' : ''}{value}{unit}
    </span>
  );
}

function KpiCard({ title, value, sub, trend, trendUnit, icon: Icon, iconBg }: {
  title: string; value: string; sub?: string; trend?: number; trendUnit?: string;
  icon: React.ElementType; iconBg: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            {trend !== undefined && (
              <div className="mt-1.5">
                <TrendBadge value={trend} unit={trendUnit ?? '%'} />
                <span className="text-xs text-gray-400 ml-1">vs prev period</span>
              </div>
            )}
          </div>
          <div className={`p-2.5 rounded-lg ${iconBg}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function statusBadge(status: 'on-track' | 'warning' | 'over-budget') {
  const map = {
    'on-track': 'bg-emerald-100 text-emerald-700',
    'warning': 'bg-amber-100 text-amber-700',
    'over-budget': 'bg-red-100 text-red-700',
  };
  const label = { 'on-track': 'On Track', 'warning': 'Warning', 'over-budget': 'Over Budget' };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[status]}`}>{label[status]}</span>;
}

function burnBarClass(pct: number) {
  if (pct > 100) return '[&>div]:bg-red-500';
  if (pct > 85) return '[&>div]:bg-amber-500';
  return '[&>div]:bg-emerald-500';
}

function agencyStatusBadge(s: AgencyLedger['status']) {
  const map = { cleared: 'bg-emerald-100 text-emerald-700', pending: 'bg-blue-100 text-blue-700', overdue: 'bg-red-100 text-red-700' };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${map[s]}`}>{s}</span>;
}

function priorityColor(p: string) {
  return { critical: 'bg-red-100 text-red-700', high: 'bg-orange-100 text-orange-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-blue-100 text-blue-700' }[p] ?? 'bg-gray-100 text-gray-700';
}

// ─── Drill-down Bar ───────────────────────────────────────────────────────────

interface DrillState {
  portfolio: string; setPortfolio: (v: string) => void;
  program:   string; setProgram:   (v: string) => void;
  project:   string; setProject:   (v: string) => void;
  task:      string; setTask:      (v: string) => void;
}

function DrillDownBar({ portfolio, setPortfolio, program, setProgram, project, setProject, task, setTask }: DrillState) {
  const availablePrograms = FIN_PROGRAMS.filter(pg =>
    portfolio === 'all' || pg.portfolioId === portfolio
  );
  const availableProjects = (() => {
    if (program !== 'all') return PROJECTS_BURN.filter(p => FIN_PROGRAMS.find(pg => pg.id === program)?.projectIds.includes(p.id));
    if (portfolio !== 'all') {
      const pgIds = FIN_PORTFOLIOS.find(pf => pf.id === portfolio)?.programIds ?? [];
      const projIds = pgIds.flatMap(pgId => FIN_PROGRAMS.find(pg => pg.id === pgId)?.projectIds ?? []);
      return PROJECTS_BURN.filter(p => projIds.includes(p.id));
    }
    return PROJECTS_BURN;
  })();
  const availableTasks = TASK_BURN.filter(t => project === 'all' || t.projectId === project);
  const assignmentCount = task !== 'all' ? ASSIGNMENT_BURN.filter(a => a.taskId === task).length : 0;
  const isDirty = portfolio !== 'all' || program !== 'all' || project !== 'all' || task !== 'all';

  const reset = () => { setPortfolio('all'); setProgram('all'); setProject('all'); setTask('all'); };

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
      <Layers className="w-4 h-4 text-blue-600 flex-shrink-0" />
      <span className="text-xs font-semibold text-blue-700 whitespace-nowrap mr-1">Drill-down:</span>

      {/* Portfolio */}
      <Select value={portfolio} onValueChange={v => { setPortfolio(v); setProgram('all'); setProject('all'); setTask('all'); }}>
        <SelectTrigger className="h-7 text-xs w-auto min-w-[160px] border-blue-200 bg-white">
          <Network className="w-3 h-3 mr-1 text-blue-400 flex-shrink-0" /><SelectValue placeholder="All Portfolios" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Portfolios</SelectItem>
          {FIN_PORTFOLIOS.map(pf => <SelectItem key={pf.id} value={pf.id}>{pf.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <ChevronRight className="w-3.5 h-3.5 text-blue-300" />

      {/* Program */}
      <Select value={program} onValueChange={v => { setProgram(v); setProject('all'); setTask('all'); }} disabled={portfolio === 'all'}>
        <SelectTrigger className={`h-7 text-xs w-auto min-w-[148px] border-blue-200 bg-white ${portfolio === 'all' ? 'opacity-50' : ''}`}>
          <Layers className="w-3 h-3 mr-1 text-purple-400 flex-shrink-0" /><SelectValue placeholder="All Programs" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Programs</SelectItem>
          {availablePrograms.map(pg => <SelectItem key={pg.id} value={pg.id}>{pg.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <ChevronRight className="w-3.5 h-3.5 text-blue-300" />

      {/* Project */}
      <Select value={project} onValueChange={v => { setProject(v); setTask('all'); }} disabled={portfolio === 'all' && program === 'all'}>
        <SelectTrigger className={`h-7 text-xs w-auto min-w-[160px] border-blue-200 bg-white ${portfolio === 'all' && program === 'all' ? 'opacity-50' : ''}`}>
          <FolderKanban className="w-3 h-3 mr-1 text-indigo-400 flex-shrink-0" /><SelectValue placeholder="All Projects" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Projects</SelectItem>
          {availableProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <ChevronRight className="w-3.5 h-3.5 text-blue-300" />

      {/* Task */}
      <Select value={task} onValueChange={setTask} disabled={project === 'all'}>
        <SelectTrigger className={`h-7 text-xs w-auto min-w-[148px] border-blue-200 bg-white ${project === 'all' ? 'opacity-50' : ''}`}>
          <ListChecks className="w-3 h-3 mr-1 text-teal-400 flex-shrink-0" /><SelectValue placeholder="All Tasks" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tasks</SelectItem>
          {availableTasks.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <ChevronRight className="w-3.5 h-3.5 text-blue-300" />

      {/* Assignments — count badge only */}
      <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border ${
        task !== 'all' ? 'bg-white border-blue-200 text-blue-700 font-medium' : 'bg-gray-100 border-gray-200 text-gray-400'
      }`}>
        <Users className="w-3 h-3" />
        {task !== 'all' ? `${assignmentCount} Assignments` : 'Assignments'}
      </span>

      {isDirty && (
        <button onClick={reset} className="ml-auto text-xs text-blue-500 hover:text-blue-700 underline whitespace-nowrap">
          Reset
        </button>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FinancialDashboard() {
  const [period, setPeriod] = useState('monthly');
  const [burnFilter, setBurnFilter] = useState<'all' | 'on-track' | 'warning' | 'over-budget'>('all');

  // Drill-down state
  const [drillPortfolio, setDrillPortfolio] = useState('all');
  const [drillProgram,   setDrillProgram]   = useState('all');
  const [drillProject,   setDrillProject]   = useState('all');
  const [drillTask,      setDrillTask]      = useState('all');

  const filteredBurn = useMemo(() => {
    // Build allowed project IDs from drill-down selection
    let allowedIds: string[] | null = null;
    if (drillTask !== 'all') {
      const t = TASK_BURN.find(x => x.id === drillTask);
      allowedIds = t ? [t.projectId] : [];
    } else if (drillProject !== 'all') {
      allowedIds = [drillProject];
    } else if (drillProgram !== 'all') {
      allowedIds = FIN_PROGRAMS.find(pg => pg.id === drillProgram)?.projectIds ?? [];
    } else if (drillPortfolio !== 'all') {
      const pgIds = FIN_PORTFOLIOS.find(pf => pf.id === drillPortfolio)?.programIds ?? [];
      allowedIds = pgIds.flatMap(pgId => FIN_PROGRAMS.find(pg => pg.id === pgId)?.projectIds ?? []);
    }
    return PROJECTS_BURN.filter(p =>
      (allowedIds === null || allowedIds.includes(p.id)) &&
      (burnFilter === 'all' || p.status === burnFilter)
    );
  }, [drillPortfolio, drillProgram, drillProject, drillTask, burnFilter]);

  const totalBudget = PROJECTS_BURN.reduce((s, p) => s + p.budget, 0);
  const totalSpent  = PROJECTS_BURN.reduce((s, p) => s + p.spent, 0);
  const atRisk      = PROJECTS_BURN.filter(p => p.status !== 'on-track').length;

  // Latest P&L month (Jan)
  const latest = PL_DATA[PL_DATA.length - 1];
  const prev   = PL_DATA[PL_DATA.length - 2];
  const revTrend    = parseFloat(((latest.revenue - prev.revenue) / prev.revenue * 100).toFixed(1));
  const gpTrend     = parseFloat((((latest.grossProfit / latest.revenue) - (prev.grossProfit / prev.revenue)) * 100).toFixed(1));
  const ebitdaTrend = parseFloat(((latest.ebitda - prev.ebitda) / prev.ebitda * 100).toFixed(1));
  const cfJan       = CASHFLOW_DATA.find(d => d.month === 'Jan')!;
  const cfPrev      = CASHFLOW_DATA.find(d => d.month === 'Dec')!;
  const cfTrend     = parseFloat(((cfJan.net - cfPrev.net) / cfPrev.net * 100).toFixed(1));

  // Agency net totals
  const totalReceivable = AGENCY_LEDGER.filter(a => a.netPosition > 0).reduce((s, a) => s + a.netPosition, 0);
  const totalPayable    = Math.abs(AGENCY_LEDGER.filter(a => a.netPosition < 0).reduce((s, a) => s + a.netPosition, 0));
  const netAgency       = totalReceivable - totalPayable;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-semibold text-gray-900">Financial Intelligence</h1>
          </div>
          <p className="text-gray-500 mt-1 text-sm">P&amp;L analytics, cash flow forecast, burn intelligence &amp; settlement ledger</p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annually">Annually</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2"><RefreshCw className="w-4 h-4" />Refresh</Button>
          <Button variant="outline" size="sm" className="gap-2"><Download className="w-4 h-4" />Export</Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <KpiCard title="Total Revenue" value={fmt(latest.revenue)} sub="Jan 2026" trend={revTrend} icon={DollarSign} iconBg="bg-blue-500" />
        <KpiCard title="Gross Margin" value={`${((latest.grossProfit / latest.revenue) * 100).toFixed(1)}%`} sub={fmt(latest.grossProfit)} trend={gpTrend} trendUnit=" pp" icon={BarChart3} iconBg="bg-emerald-500" />
        <KpiCard title="EBITDA" value={fmt(latest.ebitda)} sub={`${((latest.ebitda / latest.revenue) * 100).toFixed(1)}% margin`} trend={ebitdaTrend} icon={TrendingUp} iconBg="bg-purple-500" />
        <KpiCard title="Net Cash Flow" value={fmt(cfJan.net)} sub="Jan actual" trend={cfTrend} icon={Activity} iconBg="bg-amber-500" />
        <KpiCard title="Revenue Leakage" value={fmt(LEAKAGE_TOTAL)} sub={`${fmt(LEAKAGE_RECOVERABLE)} recoverable`} icon={AlertTriangle} iconBg="bg-red-500" />
      </div>

      {/* Drill-down Filter */}
      <DrillDownBar
        portfolio={drillPortfolio} setPortfolio={setDrillPortfolio}
        program={drillProgram}     setProgram={setDrillProgram}
        project={drillProject}     setProject={setDrillProject}
        task={drillTask}           setTask={setDrillTask}
      />

      {/* Tabs */}
      <Tabs defaultValue="pl">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pl" className="gap-1.5"><BarChart3 className="w-3.5 h-3.5" />P&amp;L Analysis</TabsTrigger>
          <TabsTrigger value="cashflow" className="gap-1.5"><Activity className="w-3.5 h-3.5" />Cash Flow</TabsTrigger>
          <TabsTrigger value="burn" className="gap-1.5"><Target className="w-3.5 h-3.5" />Burn Intelligence</TabsTrigger>
          <TabsTrigger value="settlement" className="gap-1.5"><Layers className="w-3.5 h-3.5" />Settlement</TabsTrigger>
          <TabsTrigger value="leakage" className="gap-1.5"><AlertCircle className="w-3.5 h-3.5" />Leakage Scanner</TabsTrigger>
        </TabsList>

        {/* ── P&L Analysis ── */}
        <TabsContent value="pl" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Revenue & Gross Profit Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart data={PL_DATA} margin={{ top:4, right:16, left:0, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => [`$${(v/1000).toFixed(0)}K`]} />
                    <Legend />
                    <Bar dataKey="cogs" name="COGS" fill="#f87171" stackId="rev" />
                    <Bar dataKey="grossProfit" name="Gross Profit" fill="#34d399" stackId="rev" radius={[4,4,0,0]} />
                    <Line type="monotone" dataKey="ebitda" name="EBITDA" stroke="#6366f1" strokeWidth={2} dot={{ r:4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Margin Trend (%)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={PL_MARGIN} margin={{ top:4, right:16, left:0, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${v}%`} domain={[0, 60]} />
                    <Tooltip formatter={(v: number) => [`${v}%`]} />
                    <Legend />
                    <Line type="monotone" dataKey="gpPct" name="Gross Margin %" stroke="#10b981" strokeWidth={2} dot={{ r:4 }} />
                    <Line type="monotone" dataKey="ebitdaPct" name="EBITDA %" stroke="#6366f1" strokeWidth={2} dot={{ r:4 }} />
                    <Line type="monotone" dataKey="netPct" name="Net Margin %" stroke="#f59e0b" strokeWidth={2} dot={{ r:4 }} strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">P&amp;L Breakdown Table</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50/80">
                      {['Period','Revenue','Gross Profit','GP%','EBITDA','EBITDA%','Net Income','Net%'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PL_DATA.map(row => {
                      const gp = (row.grossProfit / row.revenue * 100).toFixed(1);
                      const eb = (row.ebitda / row.revenue * 100).toFixed(1);
                      const np = (row.net / row.revenue * 100).toFixed(1);
                      return (
                        <tr key={row.month} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 px-4 font-medium text-gray-800">{row.month}</td>
                          <td className="py-2.5 px-4 text-gray-700">{fmt(row.revenue)}</td>
                          <td className="py-2.5 px-4 text-emerald-600 font-medium">{fmt(row.grossProfit)}</td>
                          <td className="py-2.5 px-4"><Badge variant="secondary" className="text-xs">{gp}%</Badge></td>
                          <td className="py-2.5 px-4 text-purple-600 font-medium">{fmt(row.ebitda)}</td>
                          <td className="py-2.5 px-4"><Badge className="text-xs">{eb}%</Badge></td>
                          <td className="py-2.5 px-4 text-blue-600 font-medium">{fmt(row.net)}</td>
                          <td className="py-2.5 px-4 text-gray-500">{np}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Cash Flow Forecast ── */}
        <TabsContent value="cashflow" className="space-y-6 pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                Cash Flow — Actuals &amp; 3-Month Forecast
                <Badge variant="outline" className="text-xs text-purple-600 border-purple-200">Feb–Apr Projected</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={CASHFLOW_DATA} margin={{ top:4, right:16, left:0, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => [`$${(v/1000).toFixed(0)}K`]} />
                  <Legend />
                  <ReferenceLine x="Feb" stroke="#a78bfa" strokeDasharray="4 2" label={{ value: 'Forecast →', position: 'top', fontSize: 11, fill: '#7c3aed' }} />
                  <Area type="monotone" dataKey="inflow" name="Inflow" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" dataKey="outflow" name="Outflow" stroke="#ef4444" fill="#ef4444" fillOpacity={0.10} strokeWidth={2} />
                  <Line type="monotone" dataKey="net" name="Net Cash Flow" stroke="#6366f1" strokeWidth={2.5} dot={{ r:5 }} activeDot={{ r:7 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label:'3-Month Projected Net', value:'$775K', sub:'Feb + Mar + Apr', color:'text-emerald-600', bg:'bg-emerald-50' },
              { label:'Avg Monthly Outflow', value:'$831K', sub:'Oct–Jan actual avg', color:'text-red-600', bg:'bg-red-50' },
              { label:'Cash Runway (at $1.2M balance)', value:'~52 days', sub:'at current burn rate', color:'text-amber-600', bg:'bg-amber-50' },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-4 ${s.bg}`}>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs font-medium text-gray-700 mt-0.5">{s.label}</div>
                <div className="text-xs text-gray-500">{s.sub}</div>
              </div>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Forecast Assumptions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                {[
                  'Revenue growth of +3% month-over-month based on Q1 pipeline (8 active proposals)',
                  'Outflow includes fixed costs ($480K/mo) + variable resource costs estimated at $340–360K/mo',
                  'No new capex or settlement payables assumed in Feb–Apr window',
                  'Forecast excludes unanticipated scope changes or new hire costs post-March',
                ].map((a, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                    {a}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Burn Intelligence ── */}
        <TabsContent value="burn" className="space-y-6 pt-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            {(['all','on-track','warning','over-budget'] as const).map(f => (
              <button key={f} onClick={() => setBurnFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  burnFilter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}>
                {f === 'all' ? 'All Projects' : f === 'on-track' ? 'On Track' : f === 'warning' ? 'Warning' : 'Over Budget'}
              </button>
            ))}
            <span className="text-xs text-gray-400 ml-2">{filteredBurn.length} project{filteredBurn.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label:'Total Budget', value:fmt(totalBudget), sub:'across 6 projects', color:'blue' },
              { label:'Total Spent', value:fmt(totalSpent), sub:`${((totalSpent/totalBudget)*100).toFixed(1)}% of total budget`, color:'purple' },
              { label:'Avg Completion', value:`${(PROJECTS_BURN.reduce((s,p) => s+(p.daysElapsed/p.daysTotal*100),0)/PROJECTS_BURN.length).toFixed(1)}%`, sub:'timeline progress', color:'amber' },
              { label:'Projects At Risk', value:String(atRisk), sub:'warning or over-budget', color:'red' },
            ].map(s => {
              const colors: Record<string, string> = { blue:'bg-blue-50 text-blue-600', purple:'bg-purple-50 text-purple-600', amber:'bg-amber-50 text-amber-600', red:'bg-red-50 text-red-600' };
              return (
                <div key={s.label} className={`rounded-xl p-4 ${colors[s.color].split(' ')[0]}`}>
                  <div className={`text-2xl font-bold ${colors[s.color].split(' ')[1]}`}>{s.value}</div>
                  <div className="text-xs font-medium text-gray-700 mt-0.5">{s.label}</div>
                  <div className="text-xs text-gray-500">{s.sub}</div>
                </div>
              );
            })}
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50/80">
                      {['Project','Client','Budget','Spent','Variance','Budget Burn','Timeline','Status'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBurn.map(p => {
                      const budgetBurnPct = (p.spent / p.budget) * 100;
                      const timelinePct  = (p.daysElapsed / p.daysTotal) * 100;
                      const rowCls = p.status === 'over-budget' ? 'bg-red-50/30' : p.status === 'warning' ? 'bg-amber-50/30' : '';
                      return (
                        <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${rowCls}`}>
                          <td className="py-3 px-4 font-medium text-gray-900">{p.name}</td>
                          <td className="py-3 px-4 text-xs text-gray-500">{p.client}</td>
                          <td className="py-3 px-4 text-gray-700">{fmt(p.budget)}</td>
                          <td className="py-3 px-4 text-gray-700">{fmt(p.spent)}</td>
                          <td className={`py-3 px-4 font-medium ${p.variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {p.variance >= 0 ? '+' : ''}{fmt(p.variance)}
                          </td>
                          <td className="py-3 px-4 min-w-36">
                            <div className="flex items-center gap-2">
                              <Progress value={Math.min(100, budgetBurnPct)} className={`h-2 w-20 ${burnBarClass(budgetBurnPct)}`} />
                              <span className={`text-xs font-semibold ${budgetBurnPct > 100 ? 'text-red-600' : budgetBurnPct > 85 ? 'text-amber-600' : 'text-gray-600'}`}>
                                {budgetBurnPct.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Progress value={timelinePct} className="h-2 w-16 [&>div]:bg-blue-400" />
                              <span className="text-xs text-gray-500">{timelinePct.toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{statusBadge(p.status)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* ── Task Breakdown (visible when a project is drilled into) ── */}
          {drillProject !== 'all' && (() => {
            const projectTasks = TASK_BURN.filter(t => t.projectId === drillProject);
            if (!projectTasks.length) return null;
            return (
              <Card className="border-teal-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-teal-700">
                    <ListChecks className="w-4 h-4" />
                    Task Breakdown — {PROJECTS_BURN.find(p => p.id === drillProject)?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-teal-50/60">
                          {['Task','Budget','Spent','Variance','Budget Burn','Hours Logged / Total','Resources'].map(h => (
                            <th key={h} className="text-left py-2.5 px-4 text-xs font-semibold text-teal-700 uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {projectTasks.map(t => {
                          const burnPct = (t.spent / t.budget) * 100;
                          const variance = t.budget - t.spent;
                          return (
                            <tr key={t.id}
                              className={`border-b border-gray-50 cursor-pointer transition-colors ${drillTask === t.id ? 'bg-teal-50' : 'hover:bg-gray-50/60'}`}
                              onClick={() => setDrillTask(drillTask === t.id ? 'all' : t.id)}>
                              <td className="py-2.5 px-4 font-medium text-gray-900 flex items-center gap-1.5">
                                <ListChecks className="w-3.5 h-3.5 text-teal-400" />{t.name}
                              </td>
                              <td className="py-2.5 px-4 text-gray-700">{fmt(t.budget)}</td>
                              <td className="py-2.5 px-4 text-gray-700">{fmt(t.spent)}</td>
                              <td className={`py-2.5 px-4 font-medium ${variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {variance >= 0 ? '+' : ''}{fmt(variance)}
                              </td>
                              <td className="py-2.5 px-4 min-w-36">
                                <div className="flex items-center gap-2">
                                  <Progress value={Math.min(100, burnPct)} className={`h-1.5 w-20 ${burnBarClass(burnPct)}`} />
                                  <span className={`text-xs font-semibold ${burnPct > 100 ? 'text-red-600' : burnPct > 85 ? 'text-amber-600' : 'text-gray-600'}`}>{burnPct.toFixed(1)}%</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-4 text-gray-600">{t.hoursLogged}h / {t.hoursTotal}h</td>
                              <td className="py-2.5 px-4 text-gray-500">{t.resourceCount}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[11px] text-teal-600 px-4 py-2">Click a task to view assignment breakdown</p>
                </CardContent>
              </Card>
            );
          })()}

          {/* ── Assignment Breakdown (visible when a task is drilled into) ── */}
          {drillTask !== 'all' && (() => {
            const assignments = ASSIGNMENT_BURN.filter(a => a.taskId === drillTask);
            const taskName = TASK_BURN.find(t => t.id === drillTask)?.name ?? '';
            if (!assignments.length) return <p className="text-xs text-gray-500 pl-1">No assignment data for this task.</p>;
            const totalCost = assignments.reduce((s, a) => s + a.cost, 0);
            return (
              <Card className="border-indigo-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-indigo-700">
                    <Users className="w-4 h-4" />
                    Assignments — {taskName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-indigo-50/60">
                          {['Resource','Role','Hours','Rate/hr','Cost','Billed Hours','Utilisation'].map(h => (
                            <th key={h} className="text-left py-2.5 px-4 text-xs font-semibold text-indigo-700 uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {assignments.map(a => {
                          const utilPct = (a.billedHours / a.hours) * 100;
                          return (
                            <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                              <td className="py-2.5 px-4 font-medium text-gray-900 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-indigo-300" />{a.resource}
                              </td>
                              <td className="py-2.5 px-4 text-xs text-gray-500">{a.role}</td>
                              <td className="py-2.5 px-4 text-gray-700">{a.hours}h</td>
                              <td className="py-2.5 px-4 text-gray-700">${a.ratePerHour}</td>
                              <td className="py-2.5 px-4 font-medium text-indigo-600">{fmt(a.cost)}</td>
                              <td className="py-2.5 px-4 text-gray-600">{a.billedHours}h</td>
                              <td className="py-2.5 px-4">
                                <div className="flex items-center gap-2">
                                  <Progress value={Math.min(100, utilPct)} className={`h-1.5 w-16 ${utilPct > 105 ? '[&>div]:bg-red-500' : '[&>div]:bg-indigo-500'}`} />
                                  <span className={`text-xs font-semibold ${utilPct > 105 ? 'text-red-600' : 'text-gray-600'}`}>{utilPct.toFixed(0)}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-indigo-50/40">
                          <td colSpan={4} className="py-2.5 px-4 text-xs font-semibold text-indigo-700">Total</td>
                          <td className="py-2.5 px-4 font-bold text-indigo-700">{fmt(totalCost)}</td>
                          <td colSpan={2} />
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </TabsContent>

        {/* ── Settlement Ledger ── */}
        <TabsContent value="settlement" className="space-y-6 pt-4">
          {/* Aging buckets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label:'0–30 Days', value:fmt(114000), color:'emerald' },
              { label:'31–60 Days', value:fmt(45000), color:'amber' },
              { label:'61–90 Days', value:fmt(18000), color:'orange' },
              { label:'90+ Days', value:fmt(9000), color:'red' },
            ].map(b => {
              const colors: Record<string, string> = { emerald:'bg-emerald-50 text-emerald-600', amber:'bg-amber-50 text-amber-600', orange:'bg-orange-50 text-orange-600', red:'bg-red-50 text-red-600' };
              return (
                <div key={b.label} className={`rounded-xl p-4 ${colors[b.color].split(' ')[0]}`}>
                  <div className={`text-2xl font-bold ${colors[b.color].split(' ')[1]}`}>{b.value}</div>
                  <div className="text-xs font-medium text-gray-700 mt-0.5">Aging {b.label}</div>
                </div>
              );
            })}
          </div>

          {/* Net position summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl p-4 bg-emerald-50">
              <div className="text-2xl font-bold text-emerald-600">{fmt(totalReceivable)}</div>
              <div className="text-xs text-gray-600 mt-0.5">Total Receivable (owed to you)</div>
            </div>
            <div className="rounded-xl p-4 bg-red-50">
              <div className="text-2xl font-bold text-red-600">{fmt(totalPayable)}</div>
              <div className="text-xs text-gray-600 mt-0.5">Total Payable (you owe)</div>
            </div>
            <div className={`rounded-xl p-4 ${netAgency >= 0 ? 'bg-blue-50' : 'bg-amber-50'}`}>
              <div className={`text-2xl font-bold ${netAgency >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>{netAgency >= 0 ? '+' : ''}{fmt(netAgency)}</div>
              <div className="text-xs text-gray-600 mt-0.5">Net Agency Position</div>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50/80">
                      {['Agency','Borrow Cost','Lend Revenue','Net Position','0–30d','31–60d','61–90d','90+d','Last Settlement','Status','Action'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {AGENCY_LEDGER.map(a => (
                      <tr key={a.agency} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-900">{a.agency}</td>
                        <td className="py-3 px-4 text-red-600">{fmt(a.borrowCost)}</td>
                        <td className="py-3 px-4 text-emerald-600">{fmt(a.lendRevenue)}</td>
                        <td className={`py-3 px-4 font-bold ${a.netPosition >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {a.netPosition >= 0 ? '+' : ''}{fmt(a.netPosition)}
                        </td>
                        <td className="py-3 px-4 text-emerald-600">{a.aging30 > 0 ? fmt(a.aging30) : '—'}</td>
                        <td className="py-3 px-4 text-amber-600">{a.aging60 > 0 ? fmt(a.aging60) : '—'}</td>
                        <td className="py-3 px-4 text-orange-600">{a.aging90 > 0 ? fmt(a.aging90) : '—'}</td>
                        <td className="py-3 px-4 text-red-600">{a.aging90plus > 0 ? fmt(a.aging90plus) : '—'}</td>
                        <td className="py-3 px-4 text-xs text-gray-500">{a.lastSettlement}</td>
                        <td className="py-3 px-4">{agencyStatusBadge(a.status)}</td>
                        <td className="py-3 px-4">
                          {a.status !== 'cleared' && (
                            <Button size="sm" variant="outline" className="h-7 text-xs"
                              onClick={() => toast.success(`Settlement initiated with ${a.agency}`)}>
                              Settle
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Leakage Scanner ── */}
        <TabsContent value="leakage" className="space-y-6 pt-4">
          {/* Scanner header */}
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <h2 className="text-lg font-semibold text-gray-900">Revenue Leakage Radar — Live Scan</h2>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl p-4 bg-red-50">
              <div className="text-2xl font-bold text-red-600">{fmt(LEAKAGE_TOTAL)}</div>
              <div className="text-xs text-gray-600 mt-0.5">Total Leakage Detected</div>
            </div>
            <div className="rounded-xl p-4 bg-emerald-50">
              <div className="text-2xl font-bold text-emerald-600">{fmt(LEAKAGE_RECOVERABLE)}</div>
              <div className="text-xs text-gray-600 mt-0.5">Recoverable Now</div>
              <div className="text-xs text-emerald-600">{((LEAKAGE_RECOVERABLE/LEAKAGE_TOTAL)*100).toFixed(0)}% of total</div>
            </div>
            <div className="rounded-xl p-4 bg-gray-50">
              <div className="text-2xl font-bold text-gray-600">{fmt(LEAKAGE_TOTAL - LEAKAGE_RECOVERABLE)}</div>
              <div className="text-xs text-gray-600 mt-0.5">Non-Recoverable</div>
            </div>
          </div>

          {/* Leakage cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LEAKAGE_ITEMS.map(item => (
              <Card key={item.type} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{item.type}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.projects} project{item.projects > 1 ? 's' : ''} affected</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-red-600">{fmt(item.amount)}</div>
                      <div className="flex gap-1 mt-1 justify-end">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor(item.priority)}`}>{item.priority}</span>
                        {item.recoverable
                          ? <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">Recoverable</span>
                          : <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">Non-recoverable</span>
                        }
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant={item.recoverable ? 'default' : 'outline'} className="w-full"
                    onClick={() => toast.success(item.recoverable ? `Recovery action initiated for "${item.type}"` : `Review scheduled for "${item.type}"`)}>
                    {item.recoverable ? 'Recover Now' : 'Review & Adjust'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Leakage bar chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Leakage by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={LEAKAGE_ITEMS} layout="vertical" margin={{ top:0, right:16, left:140, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="type" tick={{ fontSize: 11 }} width={140} />
                  <Tooltip formatter={(v: number) => [`$${(v/1000).toFixed(1)}K`]} />
                  <Bar dataKey="amount" name="Leakage" fill="#ef4444" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Auto-recover CTA */}
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-emerald-900">Auto-generate Recovery Invoices</div>
                <div className="text-sm text-emerald-700 mt-0.5">
                  Automatically raise invoices for {fmt(LEAKAGE_RECOVERABLE)} in recoverable leakage across {LEAKAGE_ITEMS.filter(l=>l.recoverable).length} categories.
                </div>
              </div>
              <Button className="bg-emerald-600 hover:bg-emerald-700 shrink-0 gap-2"
                onClick={() => toast.success('Recovery invoices generated and sent to billing queue')}>
                <CheckCircle2 className="w-4 h-4" />
                Generate Invoices
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
