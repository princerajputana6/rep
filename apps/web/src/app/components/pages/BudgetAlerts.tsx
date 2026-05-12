/**
 * Budget Command Center
 * Predictive budget intelligence, triage kanban, burn analytics, and alert rule configuration
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  Settings,
  Eye,
  EyeOff,
  Zap,
  Activity,
  Target,
  Brain,
  ArrowRight,
  RefreshCw,
  Download,
  Flame,
  Shield,
  AlertCircle,
  ChevronRight,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Cell,
} from 'recharts';
import { toast } from 'sonner';

// ─── Data Models ───────────────────────────────────────────────────────────────

interface SparkPoint { day: string; value: number }

interface Remediation {
  action: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}

interface BudgetAlert {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  budget: number;
  spent: number;
  remaining: number;
  utilizationPercent: number;
  burnRate: number;
  daysRemaining: number;
  projectedOverage: number;
  severity: 'info' | 'warning' | 'critical' | 'exceeded';
  threshold: number;
  createdAt: string;
  // Triage state
  triageStatus: 'new' | 'in-review' | 'actioned';
  // Predictive engine fields
  eac: number;           // Estimate at Completion
  etc: number;           // Estimate to Complete
  budgetHealthScore: number; // 0–100
  burnTrend: 'accelerating' | 'decelerating' | 'stable';
  sparkData: SparkPoint[];
  remediations: Remediation[];
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const mkSpark = (base: number, variance: number): SparkPoint[] =>
  Array.from({ length: 14 }, (_, i) => ({
    day: `D${i + 1}`,
    value: Math.max(0, base + (Math.random() - 0.5) * variance),
  }));

const ALERTS: BudgetAlert[] = [
  {
    id: 'a1', projectId: 'p1', projectName: 'Marketing Campaign Q1', clientName: 'Acme Corp',
    budget: 50000, spent: 52000, remaining: -2000, utilizationPercent: 104,
    burnRate: 450, daysRemaining: 0, projectedOverage: 2000,
    severity: 'exceeded', threshold: 100, createdAt: '2026-04-01T08:30:00Z',
    triageStatus: 'new', eac: 52000, etc: 0, budgetHealthScore: 12,
    burnTrend: 'accelerating',
    sparkData: mkSpark(420, 120),
    remediations: [
      { action: 'Pause non-essential ad spend immediately', impact: '-$800/day', effort: 'low' },
      { action: 'Renegotiate agency retainer for remaining scope', impact: '-$1200 total', effort: 'medium' },
      { action: 'Request emergency budget extension from client', impact: '+$3000 approved', effort: 'high' },
    ],
  },
  {
    id: 'a2', projectId: 'p2', projectName: 'Website Redesign', clientName: 'TechStart Inc',
    budget: 80000, spent: 75000, remaining: 5000, utilizationPercent: 93.75,
    burnRate: 800, daysRemaining: 6, projectedOverage: 800,
    severity: 'critical', threshold: 90, createdAt: '2026-04-02T09:15:00Z',
    triageStatus: 'in-review', eac: 80800, etc: 5800, budgetHealthScore: 28,
    burnTrend: 'accelerating',
    sparkData: mkSpark(750, 200),
    remediations: [
      { action: 'Defer QA regression phase to next sprint', impact: '-$2400', effort: 'low' },
      { action: 'Switch to junior resource for content migration', impact: '-$1600', effort: 'medium' },
    ],
  },
  {
    id: 'a3', projectId: 'p3', projectName: 'Mobile App Development', clientName: 'Retail Solutions',
    budget: 120000, spent: 100000, remaining: 20000, utilizationPercent: 83.33,
    burnRate: 1200, daysRemaining: 16, projectedOverage: 0,
    severity: 'warning', threshold: 80, createdAt: '2026-04-03T10:00:00Z',
    triageStatus: 'in-review', eac: 119200, etc: 19200, budgetHealthScore: 55,
    burnTrend: 'decelerating',
    sparkData: mkSpark(1100, 300),
    remediations: [
      { action: 'Cap overtime hours for senior devs this sprint', impact: '-$3000', effort: 'low' },
    ],
  },
  {
    id: 'a4', projectId: 'p4', projectName: 'Brand Identity', clientName: 'Fashion Co',
    budget: 35000, spent: 24500, remaining: 10500, utilizationPercent: 70,
    burnRate: 350, daysRemaining: 30, projectedOverage: 0,
    severity: 'info', threshold: 70, createdAt: '2026-04-04T11:00:00Z',
    triageStatus: 'actioned', eac: 35000, etc: 10500, budgetHealthScore: 82,
    burnTrend: 'stable',
    sparkData: mkSpark(330, 60),
    remediations: [],
  },
  {
    id: 'a5', projectId: 'p5', projectName: 'Data Analytics Platform', clientName: 'FinServ Group',
    budget: 200000, spent: 187000, remaining: 13000, utilizationPercent: 93.5,
    burnRate: 2100, daysRemaining: 6, projectedOverage: 0,
    severity: 'critical', threshold: 90, createdAt: '2026-04-05T07:30:00Z',
    triageStatus: 'new', eac: 199600, etc: 12600, budgetHealthScore: 31,
    burnTrend: 'stable',
    sparkData: mkSpark(2000, 400),
    remediations: [
      { action: 'Freeze new feature tickets until budget review', impact: '-$6000', effort: 'low' },
      { action: 'Roll-off one senior architect (3 weeks early)', impact: '-$9000', effort: 'medium' },
    ],
  },
  {
    id: 'a6', projectId: 'p6', projectName: 'SEO & Content Strategy', clientName: 'GrowthCo',
    budget: 28000, spent: 18000, remaining: 10000, utilizationPercent: 64.3,
    burnRate: 280, daysRemaining: 35, projectedOverage: 0,
    severity: 'info', threshold: 65, createdAt: '2026-04-06T12:00:00Z',
    triageStatus: 'actioned', eac: 27800, etc: 9800, budgetHealthScore: 88,
    burnTrend: 'decelerating',
    sparkData: mkSpark(260, 50),
    remediations: [],
  },
];

// Burn analytics chart data
const BURN_TREND_DATA = [
  { month: 'Nov', budgeted: 42000, actual: 38000, projected: null },
  { month: 'Dec', budgeted: 78000, actual: 74000, projected: null },
  { month: 'Jan', budgeted: 115000, actual: 119000, projected: null },
  { month: 'Feb', budgeted: 152000, actual: 161000, projected: null },
  { month: 'Mar', budgeted: 188000, actual: 196000, projected: null },
  { month: 'Apr', budgeted: 210000, actual: null, projected: 214000 },
  { month: 'May', budgeted: 220000, actual: null, projected: 228000 },
];

const HEALTH_DIST = [
  { band: '0–25 (Critical)', count: 2, color: '#ef4444' },
  { band: '26–50 (Poor)', count: 1, color: '#f97316' },
  { band: '51–75 (Fair)', count: 1, color: '#eab308' },
  { band: '76–100 (Good)', count: 2, color: '#22c55e' },
];

const OVERAGE_BY_CLIENT = [
  { client: 'Acme Corp', overage: 2000 },
  { client: 'TechStart', overage: 800 },
  { client: 'FinServ Group', overage: 0 },
  { client: 'Retail Sol.', overage: 0 },
  { client: 'Fashion Co', overage: 0 },
];

// ─── Alert Rules mock ──────────────────────────────────────────────────────────
interface AlertRule {
  id: string;
  name: string;
  threshold: number;
  severity: 'info' | 'warning' | 'critical' | 'exceeded';
  enabled: boolean;
  channels: string[];
}

const DEFAULT_RULES: AlertRule[] = [
  { id: 'r1', name: 'Budget Exceeded', threshold: 100, severity: 'exceeded', enabled: true, channels: ['Email', 'In-App'] },
  { id: 'r2', name: 'Critical Threshold', threshold: 90, severity: 'critical', enabled: true, channels: ['Email', 'Slack', 'In-App'] },
  { id: 'r3', name: 'Warning Threshold', threshold: 80, severity: 'warning', enabled: true, channels: ['In-App'] },
  { id: 'r4', name: 'Informational Notice', threshold: 70, severity: 'info', enabled: false, channels: ['In-App'] },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) => `$${n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n.toLocaleString()}`;

function severityConfig(s: BudgetAlert['severity']) {
  switch (s) {
    case 'exceeded': return { ring: 'border-red-400', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700', label: 'Exceeded', Icon: XCircle, dot: 'bg-red-500' };
    case 'critical': return { ring: 'border-orange-400', bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700', label: 'Critical', Icon: AlertTriangle, dot: 'bg-orange-500' };
    case 'warning':  return { ring: 'border-amber-400',  bg: 'bg-amber-50',  badge: 'bg-amber-100 text-amber-700',  label: 'Warning',  Icon: AlertTriangle, dot: 'bg-amber-500' };
    case 'info':     return { ring: 'border-blue-300',   bg: 'bg-blue-50',   badge: 'bg-blue-100 text-blue-700',   label: 'Info',     Icon: Bell, dot: 'bg-blue-400' };
  }
}

function healthColor(score: number) {
  if (score >= 75) return 'text-green-600';
  if (score >= 50) return 'text-amber-600';
  if (score >= 25) return 'text-orange-600';
  return 'text-red-600';
}

function healthBarClass(score: number) {
  if (score >= 75) return 'bg-green-500';
  if (score >= 50) return 'bg-amber-500';
  if (score >= 25) return 'bg-orange-500';
  return 'bg-red-500';
}

function burnTrendBadge(t: BudgetAlert['burnTrend']) {
  if (t === 'accelerating') return <span className="flex items-center gap-1 text-xs font-medium text-red-600"><TrendingUp className="w-3 h-3" />Accelerating</span>;
  if (t === 'decelerating') return <span className="flex items-center gap-1 text-xs font-medium text-green-600"><TrendingDown className="w-3 h-3" />Decelerating</span>;
  return <span className="flex items-center gap-1 text-xs font-medium text-gray-500"><Activity className="w-3 h-3" />Stable</span>;
}

// ─── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: SparkPoint[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── AlertCard ─────────────────────────────────────────────────────────────────
function AlertCard({
  alert,
  onTriage,
  onDismiss,
}: {
  alert: BudgetAlert;
  onTriage: (id: string, status: BudgetAlert['triageStatus']) => void;
  onDismiss: (id: string) => void;
}) {
  const cfg = severityConfig(alert.severity);
  const [expanded, setExpanded] = useState(false);

  const eacOverrun = alert.eac > alert.budget;

  return (
    <Card className={`border-l-4 ${cfg.ring} ${cfg.bg}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-col gap-3">
          {/* Top row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{alert.projectName}</p>
                <p className="text-xs text-gray-500">{alert.clientName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
              <button onClick={() => setExpanded(e => !e)} className="text-gray-400 hover:text-gray-600">
                <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
              </button>
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Budget</p>
              <p className="text-sm font-semibold text-gray-900">{fmt(alert.budget)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Spent</p>
              <p className={`text-sm font-semibold ${alert.spent > alert.budget ? 'text-red-600' : 'text-gray-900'}`}>{fmt(alert.spent)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">EAC</p>
              <p className={`text-sm font-semibold ${eacOverrun ? 'text-red-600' : 'text-gray-900'}`}>{fmt(alert.eac)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Health</p>
              <p className={`text-sm font-semibold ${healthColor(alert.budgetHealthScore)}`}>{alert.budgetHealthScore}</p>
            </div>
          </div>

          {/* Health bar + sparkline */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span>Budget Health</span><span>{alert.utilizationPercent.toFixed(1)}% used</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${healthBarClass(alert.budgetHealthScore)}`}
                  style={{ width: `${Math.min(100, alert.budgetHealthScore)}%` }}
                />
              </div>
            </div>
            <div className="w-28 flex-shrink-0">
              <Sparkline
                data={alert.sparkData}
                color={alert.severity === 'exceeded' ? '#ef4444' : alert.severity === 'critical' ? '#f97316' : '#eab308'}
              />
            </div>
          </div>

          {/* Burn trend + days left */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-3">
              {burnTrendBadge(alert.burnTrend)}
              <span className="text-gray-400">|</span>
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" />
                {fmt(alert.burnRate)}/day
              </span>
            </div>
            <span className={`font-medium ${alert.daysRemaining === 0 ? 'text-red-600' : alert.daysRemaining <= 7 ? 'text-orange-600' : 'text-gray-700'}`}>
              {alert.daysRemaining === 0 ? 'Overdue' : `${alert.daysRemaining}d left`}
            </span>
          </div>

          {/* Expanded: remediations */}
          {expanded && alert.remediations.length > 0 && (
            <div className="border-t pt-3 space-y-2">
              <p className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <Brain className="w-3 h-3 text-purple-500" />AI-Suggested Remediations
              </p>
              {alert.remediations.map((r, i) => (
                <div key={i} className="flex items-start justify-between gap-2 bg-white rounded p-2 border text-xs">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{r.action}</p>
                    <p className="text-green-700 font-semibold mt-0.5">{r.impact}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${r.effort === 'low' ? 'bg-green-100 text-green-700' : r.effort === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {r.effort}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Triage actions */}
          <div className="flex items-center gap-2 border-t pt-2">
            {alert.triageStatus !== 'actioned' && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7"
                onClick={() => {
                  onTriage(alert.id, alert.triageStatus === 'new' ? 'in-review' : 'actioned');
                  toast.success(alert.triageStatus === 'new' ? 'Moved to In Review' : 'Marked as Actioned');
                }}
              >
                <ArrowRight className="w-3 h-3 mr-1" />
                {alert.triageStatus === 'new' ? 'Start Review' : 'Mark Actioned'}
              </Button>
            )}
            {alert.triageStatus === 'actioned' && (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />Actioned
              </span>
            )}
            <button
              onClick={() => { onDismiss(alert.id); toast.success('Alert dismissed'); }}
              className="ml-auto text-xs text-gray-400 hover:text-gray-600"
            >
              Dismiss
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export function BudgetAlerts() {
  const [alerts, setAlerts] = useState<BudgetAlert[]>(ALERTS);
  const [rules, setRules] = useState<AlertRule[]>(DEFAULT_RULES);
  const [severityFilter, setSeverityFilter] = useState<'all' | BudgetAlert['severity']>('all');
  const [triageFilter, setTriageFilter] = useState<'all' | BudgetAlert['triageStatus']>('all');
  const [showActioned, setShowActioned] = useState(false);
  const [search, setSearch] = useState('');

  const handleTriage = (id: string, status: BudgetAlert['triageStatus']) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, triageStatus: status } : a));
  };
  const handleDismiss = (id: string) => setAlerts(prev => prev.filter(a => a.id !== id));

  const filtered = useMemo(() =>
    alerts.filter(a => {
      if (!showActioned && a.triageStatus === 'actioned') return false;
      if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
      if (triageFilter !== 'all' && a.triageStatus !== triageFilter) return false;
      if (search && !a.projectName.toLowerCase().includes(search.toLowerCase()) && !a.clientName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }),
  [alerts, showActioned, severityFilter, triageFilter, search]);

  // Kanban columns
  const kanbanCols: { key: BudgetAlert['triageStatus']; label: string; color: string }[] = [
    { key: 'new', label: 'New', color: 'border-t-red-500' },
    { key: 'in-review', label: 'In Review', color: 'border-t-amber-500' },
    { key: 'actioned', label: 'Actioned', color: 'border-t-green-500' },
  ];

  const stats = useMemo(() => ({
    total: alerts.length,
    exceeded: alerts.filter(a => a.severity === 'exceeded').length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    atRisk: alerts.filter(a => ['exceeded', 'critical'].includes(a.severity)).length,
    totalBudget: alerts.reduce((s, a) => s + a.budget, 0),
    totalSpent: alerts.reduce((s, a) => s + a.spent, 0),
    avgHealth: Math.round(alerts.reduce((s, a) => s + a.budgetHealthScore, 0) / alerts.length),
  }), [alerts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            Budget Command Center
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Predictive burn intelligence · triage · alert rules</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('Reports exported')}>
            <Download className="w-4 h-4 mr-1" />Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info('Refreshed')}>
            <RefreshCw className="w-4 h-4 mr-1" />Refresh
          </Button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Total Alerts', value: stats.total, Icon: Bell, color: 'text-gray-700' },
          { label: 'Exceeded', value: stats.exceeded, Icon: XCircle, color: 'text-red-600' },
          { label: 'Critical', value: stats.critical, Icon: AlertTriangle, color: 'text-orange-600' },
          { label: 'Warning', value: stats.warning, Icon: AlertCircle, color: 'text-amber-600' },
          { label: 'At Risk', value: stats.atRisk, Icon: Flame, color: 'text-red-500' },
          { label: 'Total Budget', value: fmt(stats.totalBudget), Icon: DollarSign, color: 'text-gray-700' },
          { label: 'Total Spent', value: fmt(stats.totalSpent), Icon: TrendingUp, color: 'text-gray-700' },
          { label: 'Avg Health', value: `${stats.avgHealth}`, Icon: Shield, color: healthColor(stats.avgHealth) },
        ].map(({ label, value, Icon, color }) => (
          <Card key={label} className="text-center">
            <CardContent className="pt-4 pb-3">
              <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
              <p className={`text-lg font-bold ${color}`}>{value}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="alerts">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="alerts">
            <Bell className="w-3.5 h-3.5 mr-1" />Alert Feed
          </TabsTrigger>
          <TabsTrigger value="triage">
            <Target className="w-3.5 h-3.5 mr-1" />Triage Kanban
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-3.5 h-3.5 mr-1" />Burn Analytics
          </TabsTrigger>
          <TabsTrigger value="rules">
            <Settings className="w-3.5 h-3.5 mr-1" />Alert Rules
          </TabsTrigger>
        </TabsList>

        {/* ── Alert Feed ── */}
        <TabsContent value="alerts" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              placeholder="Search project or client…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-9 w-52"
            />
            <Select value={severityFilter} onValueChange={v => setSeverityFilter(v as typeof severityFilter)}>
              <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Severity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="exceeded">Exceeded</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            <Select value={triageFilter} onValueChange={v => setTriageFilter(v as typeof triageFilter)}>
              <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Triage" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in-review">In Review</SelectItem>
                <SelectItem value="actioned">Actioned</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={() => setShowActioned(s => !s)}>
              {showActioned ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {showActioned ? 'Hide' : 'Show'} Actioned
            </Button>
            {(severityFilter !== 'all' || triageFilter !== 'all' || search) && (
              <Button variant="ghost" size="sm" onClick={() => { setSeverityFilter('all'); setTriageFilter('all'); setSearch(''); }}>
                Clear filters
              </Button>
            )}
          </div>

          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-gray-800">All clear!</p>
                <p className="text-sm text-gray-500 mt-1">No alerts match your current filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map(a => (
                <AlertCard key={a.id} alert={a} onTriage={handleTriage} onDismiss={handleDismiss} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Triage Kanban ── */}
        <TabsContent value="triage" className="mt-4">
          <div className="grid grid-cols-3 gap-4">
            {kanbanCols.map(col => {
              const colAlerts = alerts.filter(a => a.triageStatus === col.key);
              return (
                <div key={col.key} className={`rounded-xl border-t-4 ${col.color} bg-gray-50 p-3 space-y-3 min-h-[400px]`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-gray-700">{col.label}</span>
                    <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">{colAlerts.length}</span>
                  </div>
                  {colAlerts.map(a => {
                    const cfg = severityConfig(a.severity);
                    return (
                      <Card key={a.id} className={`cursor-pointer hover:shadow-md transition-shadow ${cfg.bg} border ${cfg.ring}`}>
                        <CardContent className="pt-3 pb-3 space-y-2">
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-sm font-semibold text-gray-900 leading-tight">{a.projectName}</p>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${cfg.badge}`}>{cfg.label}</span>
                          </div>
                          <p className="text-xs text-gray-500">{a.clientName}</p>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>{fmt(a.spent)} / {fmt(a.budget)}</span>
                            <span className={healthColor(a.budgetHealthScore)}>H:{a.budgetHealthScore}</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 rounded-full">
                            <div className={`h-full rounded-full ${healthBarClass(a.budgetHealthScore)}`} style={{ width: `${Math.min(100, a.budgetHealthScore)}%` }} />
                          </div>
                          {col.key !== 'actioned' && (
                            <Button size="sm" variant="outline" className="w-full h-6 text-[10px]"
                              onClick={() => { handleTriage(a.id, col.key === 'new' ? 'in-review' : 'actioned'); toast.success('Moved forward'); }}>
                              <ArrowRight className="w-3 h-3 mr-1" />
                              {col.key === 'new' ? 'Start Review' : 'Mark Actioned'}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                  {colAlerts.length === 0 && (
                    <p className="text-center text-xs text-gray-400 mt-8">No alerts here</p>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Burn Analytics ── */}
        <TabsContent value="analytics" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cumulative Burn vs Budget */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Cumulative Burn vs Budget</CardTitle>
                <CardDescription>6-month actuals + 2-month projection</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart data={BURN_TREND_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
                    <Legend />
                    <ReferenceLine x="Mar" stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Forecast →', position: 'insideTopRight', fontSize: 10, fill: '#64748b' }} />
                    <Bar dataKey="budgeted" name="Budgeted" fill="#93c5fd" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="actual" name="Actual" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="projected" name="Projected" fill="#f97316" radius={[3, 3, 0, 0]} opacity={0.7} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Health Score Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Budget Health Distribution</CardTitle>
                <CardDescription>Projects by health score band</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={HEALTH_DIST} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="band" type="category" tick={{ fontSize: 10 }} width={110} />
                    <Tooltip />
                    <Bar dataKey="count" name="Projects" radius={[0, 4, 4, 0]}>
                      {HEALTH_DIST.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Projected Overage by Client */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Projected Overage by Client</CardTitle>
                <CardDescription>EAC minus approved budget</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={OVERAGE_BY_CLIENT}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="client" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `$${v}`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Overage']} />
                    <Bar dataKey="overage" name="Overage ($)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Predictive EAC Table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">EAC / ETC Summary</CardTitle>
                <CardDescription>Estimate at Completion vs Estimate to Complete</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th className="text-left pb-2 font-medium">Project</th>
                      <th className="text-right pb-2 font-medium">Budget</th>
                      <th className="text-right pb-2 font-medium">EAC</th>
                      <th className="text-right pb-2 font-medium">ETC</th>
                      <th className="text-center pb-2 font-medium">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {alerts.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="py-2 font-medium text-gray-800 truncate max-w-[120px]">{a.projectName}</td>
                        <td className="py-2 text-right text-gray-600">{fmt(a.budget)}</td>
                        <td className={`py-2 text-right font-semibold ${a.eac > a.budget ? 'text-red-600' : 'text-gray-800'}`}>{fmt(a.eac)}</td>
                        <td className="py-2 text-right text-gray-600">{fmt(a.etc)}</td>
                        <td className="py-2 text-center">{burnTrendBadge(a.burnTrend)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Alert Rules ── */}
        <TabsContent value="rules" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">Configurable Thresholds</p>
              <p className="text-xs text-gray-500 mt-0.5">Define when alerts fire and via which channels</p>
            </div>
            <Button size="sm" onClick={() => toast.success('Rules saved')}>
              <Sparkles className="w-4 h-4 mr-1" />Save Rules
            </Button>
          </div>

          <div className="space-y-3">
            {rules.map(rule => (
              <Card key={rule.id} className={`${!rule.enabled ? 'opacity-60' : ''}`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm">{rule.name}</p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${severityConfig(rule.severity).badge}`}>
                          {severityConfig(rule.severity).label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Fires at <strong className="text-gray-800">{rule.threshold}%</strong> utilization</span>
                        <span>·</span>
                        <span>Channels: {rule.channels.join(', ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`t-${rule.id}`} className="text-xs text-gray-600">Threshold %</Label>
                        <Input
                          id={`t-${rule.id}`}
                          type="number"
                          min={1} max={200}
                          value={rule.threshold}
                          onChange={e => setRules(prev => prev.map(r => r.id === rule.id ? { ...r, threshold: +e.target.value } : r))}
                          className="w-16 h-8 text-xs"
                        />
                      </div>
                      <button
                        onClick={() => setRules(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r))}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${rule.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${rule.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-dashed border-gray-300 bg-gray-50">
            <CardContent className="py-6 text-center">
              <Button variant="outline" size="sm" onClick={() => toast.info('Custom rule builder coming soon')}>
                <Zap className="w-4 h-4 mr-1" />Add Custom Rule
              </Button>
              <p className="text-xs text-gray-400 mt-2">Create rules based on burn rate, EAC overrun, or timeline slippage</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
