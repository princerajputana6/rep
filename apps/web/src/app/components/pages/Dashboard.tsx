/**
 * Executive Command Center Dashboard
 * Portfolio health · project pulse · budget intelligence · timesheet status
 * Resource utilization · live alerts · activity feed
 */

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import {
  Users, Building2, TrendingUp, TrendingDown, DollarSign, AlertTriangle,
  CheckCircle2, ArrowUp, ArrowDown, ArrowRight, FolderKanban, Clock,
  Flame, Shield, Activity, Target, Brain, Zap, Bell, Lock, Globe,
  BarChart3, RefreshCw, ChevronRight, CircleDot,
} from 'lucide-react';
import {
  AreaChart, Area, Bar, Line, ComposedChart,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface DashboardKpis {
  totalResources: number; activeProjects: number; onHoldProjects: number;
  pendingBorrowRequests: number; pendingApprovals: number;
  totalUsers: number; avgUtilization: number; atRiskProjects: number;
}
interface LiveProject {
  _id: string; name: string; status: string; riskLevel?: string;
  healthScore?: number; deliveryConfidence?: number; budgetBurnPct?: number;
  endDate?: string; type?: string;
  clientId?: { name: string } | null;
  ownerId?: { name: string } | null;
}
interface LiveActivity {
  _id: string; action: string; entity: string; createdAt: string;
  userId?: { name: string } | null;
}
interface RoleCount { _id: string; count: number; }

const ROLE_COLORS = ['#3b82f6','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#6b7280'];

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pulseColor(s: number) { return s >= 75 ? 'text-green-600' : s >= 50 ? 'text-amber-600' : 'text-red-600'; }
function pulseBarClass(s: number) { return s >= 75 ? 'bg-green-500' : s >= 50 ? 'bg-amber-500' : 'bg-red-500'; }
function riskBadge(r: 'low' | 'medium' | 'high') {
  const m = { low: 'text-green-700 bg-green-100', medium: 'text-amber-700 bg-amber-100', high: 'text-red-700 bg-red-100' };
  return <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${m[r]}`}>{r}</span>;
}
function archetypeDot(a: string) {
  const m: Record<string, string> = { Creative: 'bg-pink-500', Technical: 'bg-blue-500', Strategic: 'bg-purple-500', Operational: 'bg-gray-500' };
  return <span className={`w-2 h-2 rounded-full inline-block ${m[a] ?? 'bg-gray-400'}`} />;
}
function statusBadge(s: 'draft' | 'submitted' | 'approved' | 'rejected') {
  const m = { draft: 'bg-gray-100 text-gray-600', submitted: 'bg-blue-100 text-blue-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m[s]}`}>{s}</span>;
}

// ─── PulseRing ────────────────────────────────────────────────────────────────
function PulseRing({ score, size = 40 }: { score: number; size?: number }) {
  const r = size / 2 - 3;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="3" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${pulseColor(score)}`}>{score}</span>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, Icon, iconColor, trend, trendVal }: {
  label: string; value: string; sub?: string; Icon: React.ElementType;
  iconColor: string; trend?: 'up' | 'down'; trendVal?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div className={`p-2 rounded-lg bg-gray-100`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          {trend && trendVal && (
            <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {trendVal}
            </span>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600 mt-0.5">{label}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function Dashboard() {
  const [period, setPeriod] = useState('mtd');
  const [alertsExpanded, setAlertsExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<DashboardKpis>({
    totalResources: 0, activeProjects: 0, onHoldProjects: 0,
    pendingBorrowRequests: 0, pendingApprovals: 0,
    totalUsers: 0, avgUtilization: 0, atRiskProjects: 0,
  });
  const [projects, setProjects] = useState<LiveProject[]>([]);
  const [activity, setActivity] = useState<LiveActivity[]>([]);
  const [rolesDist, setRolesDist] = useState<RoleCount[]>([]);

  const fetchData = () => {
    setLoading(true);
    fetch('/api/v1/analytics')
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          setKpis(json.data.kpis ?? kpis);
          setProjects(json.data.recentProjects ?? []);
          setActivity(json.data.recentActivity ?? []);
          setRolesDist(json.data.resourcesByRole ?? []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const avgPulse = useMemo(() => {
    if (!projects.length) return 0;
    return Math.round(projects.reduce((s, p) => s + (p.healthScore ?? 0), 0) / projects.length);
  }, [projects]);

  const rolePieData = rolesDist.map((r, i) => ({
    name: r._id || 'Other',
    value: r.count,
    color: ROLE_COLORS[i % ROLE_COLORS.length],
  }));

  const dynamicAlerts = useMemo(() => {
    const alerts = [];
    if (kpis.pendingApprovals > 0)
      alerts.push({ id: 'pa', icon: Clock, color: 'border-amber-200 bg-amber-50', iconColor: 'text-amber-600', title: 'Pending Approvals', body: `${kpis.pendingApprovals} resource approval${kpis.pendingApprovals > 1 ? 's' : ''} awaiting review.`, type: 'warning' });
    if (kpis.pendingBorrowRequests > 0)
      alerts.push({ id: 'br', icon: Users, color: 'border-blue-200 bg-blue-50', iconColor: 'text-blue-600', title: 'Borrow Requests', body: `${kpis.pendingBorrowRequests} open borrow request${kpis.pendingBorrowRequests > 1 ? 's' : ''} need action.`, type: 'warning' });
    if (kpis.atRiskProjects > 0)
      alerts.push({ id: 'ar', icon: AlertTriangle, color: 'border-red-200 bg-red-50', iconColor: 'text-red-600', title: 'At-Risk Projects', body: `${kpis.atRiskProjects} project${kpis.atRiskProjects > 1 ? 's' : ''} flagged as high risk.`, type: 'critical' });
    if (alerts.length === 0)
      alerts.push({ id: 'ok', icon: Shield, color: 'border-green-200 bg-green-50', iconColor: 'text-green-600', title: 'All Clear', body: 'No critical alerts at this time. Platform health looks good.', type: 'info' });
    return alerts;
  }, [kpis]);

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="grid grid-cols-4 gap-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}</div>
        <div className="grid grid-cols-3 gap-6">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 bg-gray-200 rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Executive Command Center</h1>
          <p className="text-gray-500 text-sm mt-0.5">Live portfolio intelligence · {today}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mtd">MTD</SelectItem>
              <SelectItem value="qtd">QTD</SelectItem>
              <SelectItem value="ytd">YTD</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-8" onClick={fetchData}><RefreshCw className="w-3.5 h-3.5" /></Button>
        </div>
      </div>

      {/* Top KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Active Projects', value: String(kpis.activeProjects), sub: `${kpis.onHoldProjects} on hold`, Icon: FolderKanban, iconColor: 'text-blue-600' },
          { label: 'Avg Health Score', value: String(avgPulse), sub: '0–100 scale', Icon: CircleDot, iconColor: pulseColor(avgPulse) },
          { label: 'High Risk', value: String(kpis.atRiskProjects), sub: 'Need attention', Icon: AlertTriangle, iconColor: 'text-red-600' },
          { label: 'Pending Approvals', value: String(kpis.pendingApprovals), sub: 'Resource approvals', Icon: Clock, iconColor: 'text-amber-600' },
          { label: 'Total Resources', value: String(kpis.totalResources), sub: 'Active resources', Icon: Users, iconColor: 'text-purple-600' },
          { label: 'Avg Utilization', value: `${kpis.avgUtilization}%`, sub: 'Target 80%', Icon: TrendingUp, iconColor: kpis.avgUtilization >= 80 ? 'text-green-600' : 'text-amber-600' },
          { label: 'Team Members', value: String(kpis.totalUsers), sub: 'Platform users', Icon: Building2, iconColor: 'text-blue-600' },
          { label: 'Borrow Requests', value: String(kpis.pendingBorrowRequests), sub: 'Pending review', Icon: Zap, iconColor: 'text-indigo-600' },
        ].map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Row 2: Portfolio pulse + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><FolderKanban className="w-4 h-4 text-blue-600" />Project Portfolio</h2>
            <Button variant="ghost" size="sm" className="text-xs text-blue-600">View all <ArrowRight className="w-3 h-3 ml-1" /></Button>
          </div>
          {projects.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No projects yet. Create your first project to see it here.</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {projects.map(p => (
                <Card key={p._id} className={p.riskLevel === 'high' ? 'border-red-200' : ''}>
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-center gap-3">
                      <PulseRing score={p.healthScore ?? 0} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {archetypeDot(p.type ?? 'Technical')}
                          <span className="font-semibold text-sm text-gray-900 truncate">{p.name}</span>
                          {riskBadge((p.riskLevel as 'low' | 'medium' | 'high') ?? 'low')}
                          {(p.budgetBurnPct ?? 0) >= 80 && <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 rounded-full flex items-center gap-0.5"><Flame className="w-2.5 h-2.5" />Budget Alert</span>}
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          {p.clientId?.name ?? 'No client'} · {p.ownerId?.name ?? 'Unassigned'}{p.endDate ? ` · Due ${new Date(p.endDate).toLocaleDateString()}` : ''}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="flex justify-between text-[10px] text-gray-400 mb-0.5"><span>Budget burn</span><span>{p.budgetBurnPct ?? 0}%</span></div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${pulseBarClass(100 - (p.budgetBurnPct ?? 0))}`} style={{ width: `${p.budgetBurnPct ?? 0}%` }} />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="text-[10px] text-gray-500">Delivery: </span>
                            <span className={`text-[10px] font-bold ${(p.deliveryConfidence ?? 0) >= 80 ? 'text-green-600' : (p.deliveryConfidence ?? 0) >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{p.deliveryConfidence ?? 0}%</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Alerts panel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-500" />Live Alerts
              <span className="text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5">{dynamicAlerts.filter(a => a.type !== 'info').length}</span>
            </h2>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setAlertsExpanded(e => !e)}>{alertsExpanded ? 'Collapse' : 'Expand'}</Button>
          </div>
          {alertsExpanded && (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {dynamicAlerts.map(a => {
                const Icon = a.icon;
                return (
                  <div key={a.id} className={`rounded-lg border p-3 ${a.color}`}>
                    <div className="flex items-start gap-2">
                      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${a.iconColor}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900">{a.title}</p>
                        <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{a.body}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Role distribution + Activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resource Distribution by Role</CardTitle>
            <CardDescription>{kpis.totalResources} active resources</CardDescription>
          </CardHeader>
          <CardContent>
            {rolePieData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No resources yet</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={rolePieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                      {rolePieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number, name: string) => [v, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {rolePieData.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-gray-600">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      {d.name} <span className="font-semibold text-gray-800 ml-auto">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />Activity Feed
            </CardTitle>
            <CardDescription>Recent platform events from DB</CardDescription>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No activity yet</p>
            ) : (
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                {activity.map(a => (
                  <div key={a._id} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-blue-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-800 leading-snug">
                        <span className="font-semibold">{a.userId?.name ?? 'System'}</span>{' '}
                        {a.action.toLowerCase()} <span className="text-gray-500">{a.entity}</span>
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(a.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Quick action cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'New Project', Icon: FolderKanban, color: 'bg-blue-600 hover:bg-blue-700', desc: 'Start a project' },
          { label: 'Log Time', Icon: Clock, color: 'bg-green-600 hover:bg-green-700', desc: 'Open timesheets' },
          { label: 'Borrow Resource', Icon: Users, color: 'bg-purple-600 hover:bg-purple-700', desc: 'Cross-agency request' },
          { label: 'AI Co-Pilot', Icon: Brain, color: 'bg-amber-500 hover:bg-amber-600', desc: 'Ask anything' },
        ].map(a => {
          const Icon = a.Icon;
          return (
            <button key={a.label} className={`${a.color} text-white rounded-xl p-4 text-left transition-colors`}>
              <Icon className="w-6 h-6 mb-2" />
              <p className="font-semibold text-sm">{a.label}</p>
              <p className="text-xs text-white/70 mt-0.5">{a.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
