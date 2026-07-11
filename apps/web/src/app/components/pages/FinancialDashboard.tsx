/**
 * Financial Dashboard — real budget / cost / burn analytics.
 * Backed by GET /api/v1/analytics/financial (budget vs allocated cost,
 * top projects by burn, monthly allocation trend).
 */
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import { Progress } from '@/app/components/ui/progress';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { DollarSign, TrendingUp, Wallet, PieChart, FolderKanban, AlertTriangle } from 'lucide-react';

interface Summary {
  totalBudget: number; totalAllocated: number; totalRemaining: number;
  grossMarginPct: number; projectCount: number;
}
interface ProjectBurn {
  id: string; name: string; budget: number; allocated: number; burnPct: number; status: string;
}
interface FinancialData {
  summary: Summary;
  topProjects: ProjectBurn[];
  monthlyTrend: { label: string; value: number }[];
}

const EMPTY: FinancialData = {
  summary: { totalBudget: 0, totalAllocated: 0, totalRemaining: 0, grossMarginPct: 0, projectCount: 0 },
  topProjects: [],
  monthlyTrend: [],
};

function fmt(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function burnBand(pct: number): { label: string; text: string; bg: string; bar: string } {
  if (pct > 100) return { label: 'Over budget', text: 'text-red-600', bg: 'bg-red-100', bar: '[&>div]:bg-red-500' };
  if (pct > 85) return { label: 'At risk', text: 'text-amber-600', bg: 'bg-amber-100', bar: '[&>div]:bg-amber-500' };
  return { label: 'On track', text: 'text-green-600', bg: 'bg-green-100', bar: '[&>div]:bg-green-500' };
}

function KpiCard({ title, value, sub, icon: Icon, iconBg }: {
  title: string; value: string; sub?: string;
  icon: React.ComponentType<{ className?: string }>; iconBg: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`grid place-items-center w-10 h-10 rounded-lg text-white ${iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FinancialDashboard() {
  const [data, setData] = useState<FinancialData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'on-track' | 'at-risk' | 'over-budget'>('all');

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch('/api/v1/analytics/financial')
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error?.message ?? `HTTP ${r.status}`);
        return r.json();
      })
      .then((j) => { if (active) setData(j.data ?? EMPTY); })
      .catch((e: Error) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const { summary, topProjects, monthlyTrend } = data;

  const filteredBurn = useMemo(() => topProjects.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'over-budget') return p.burnPct > 100;
    if (filter === 'at-risk') return p.burnPct > 85 && p.burnPct <= 100;
    return p.burnPct <= 85;
  }), [topProjects, filter]);

  const atRisk = topProjects.filter((p) => p.burnPct > 85).length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="flex items-center gap-2"><DollarSign className="w-6 h-6 text-primary" /> Financial Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Budget, cost allocation and burn across your projects</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard title="Total Budget" value={loading ? '—' : fmt(summary.totalBudget)} icon={DollarSign} iconBg="bg-blue-500" />
        <KpiCard title="Allocated Cost" value={loading ? '—' : fmt(summary.totalAllocated)} icon={Wallet} iconBg="bg-purple-500" />
        <KpiCard title="Remaining" value={loading ? '—' : fmt(summary.totalRemaining)} icon={TrendingUp} iconBg="bg-emerald-500" />
        <KpiCard title="Gross Margin" value={loading ? '—' : `${summary.grossMarginPct}%`} icon={PieChart} iconBg="bg-amber-500" />
        <KpiCard title="Projects" value={loading ? '—' : String(summary.projectCount)} sub={atRisk ? `${atRisk} at risk` : undefined} icon={FolderKanban} iconBg="bg-slate-500" />
      </div>

      {/* Allocation trend */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Allocation Trend (last 6 months)</CardTitle></CardHeader>
        <CardContent>
          {monthlyTrend.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">No allocation activity yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="finGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00A76F" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00A76F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(v: number) => [`${v} h`, 'Allocated hours']} />
                <Area type="monotone" dataKey="value" stroke="#00A76F" strokeWidth={2} fill="url(#finGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Projects by burn */}
      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-sm">Projects by Budget Burn</CardTitle>
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="on-track">On track</SelectItem>
              <SelectItem value="at-risk">At risk</SelectItem>
              <SelectItem value="over-budget">Over budget</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Loading…</div>
          ) : filteredBurn.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <FolderKanban className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">{topProjects.length === 0 ? 'No projects with budgets yet' : 'No projects match this filter'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredBurn.map((p) => {
                const band = burnBand(p.burnPct);
                return (
                  <div key={p.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm truncate">{p.name}</span>
                        <Badge className={`${band.bg} ${band.text} border-0`}>{band.label}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={Math.min(100, p.burnPct)} className={`h-1.5 flex-1 ${band.bar}`} />
                        <span className={`text-xs font-semibold ${band.text} w-12 text-right`}>{p.burnPct.toFixed(0)}%</span>
                        <span className="text-xs text-muted-foreground w-40 text-right">{fmt(p.allocated)} / {fmt(p.budget)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Honest note about un-modelled financials */}
      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
        <span>Revenue, cash-flow and P&amp;L views require billing/revenue data, which isn&apos;t captured yet. These figures reflect budget vs. allocated cost from your projects.</span>
      </div>
    </div>
  );
}
