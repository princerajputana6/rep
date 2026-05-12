import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import { Switch } from '@/app/components/ui/switch';
import {
  Eye,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Shield,
  Users,
  BookOpen,
  Target,
  Zap,
  Lock,
  Search,
  ArrowUpDown,
  Building2,
  Clock,
  Send,
  Minus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// ─── Data ────────────────────────────────────────────────────────────────────

interface CapacitySignal {
  role: string;
  agency: string;
  availableHours: number;
  resources: number;
  liquidity: 'green' | 'amber' | 'red';
  validTieUps: number;
  avgCostRate: number;
  timeHorizon: string;
  trend: 'up' | 'down' | 'flat';
  trendPct: number;
}

interface AgencyControl {
  id: string;
  name: string;
  optedIn: boolean;
  optInDate: string | null;
  totalResources: number;
  sharedRoles: number;
}

const allCapacitySignals: CapacitySignal[] = [
  { role: 'Senior Developer', agency: 'Acme Digital',   availableHours: 240, resources: 6, liquidity: 'green', validTieUps: 3, avgCostRate: 150, timeHorizon: '3 months', trend: 'up',   trendPct: 12 },
  { role: 'UX Designer',      agency: 'CreativeCo',     availableHours: 180, resources: 4, liquidity: 'green', validTieUps: 5, avgCostRate: 100, timeHorizon: '2 months', trend: 'up',   trendPct: 8  },
  { role: 'Product Manager',  agency: 'TechVentures',   availableHours: 120, resources: 3, liquidity: 'amber', validTieUps: 2, avgCostRate: 140, timeHorizon: '4 months', trend: 'flat', trendPct: 0  },
  { role: 'Data Analyst',     agency: 'Digital Wave',   availableHours: 80,  resources: 2, liquidity: 'red',   validTieUps: 1, avgCostRate: 85,  timeHorizon: '2 months', trend: 'down', trendPct: 15 },
  { role: 'DevOps Engineer',  agency: 'Acme Digital',   availableHours: 160, resources: 4, liquidity: 'green', validTieUps: 3, avgCostRate: 130, timeHorizon: '3 months', trend: 'up',   trendPct: 5  },
  { role: 'QA Engineer',      agency: 'TechVentures',   availableHours: 100, resources: 3, liquidity: 'amber', validTieUps: 2, avgCostRate: 90,  timeHorizon: '1 month',  trend: 'down', trendPct: 3  },
  { role: 'Data Engineer',    agency: 'CreativeCo',     availableHours: 60,  resources: 2, liquidity: 'red',   validTieUps: 1, avgCostRate: 120, timeHorizon: '2 months', trend: 'down', trendPct: 20 },
  { role: 'Frontend Dev',     agency: 'Digital Wave',   availableHours: 200, resources: 5, liquidity: 'green', validTieUps: 4, avgCostRate: 110, timeHorizon: '4 months', trend: 'up',   trendPct: 18 },
];

const heatmapData = [
  { role: 'Senior Developer', acme: { l: 'green', hrs: 240 }, creative: { l: 'amber', hrs: 60 },  tech: { l: 'green', hrs: 120 }, wave: { l: 'red',   hrs: 20  } },
  { role: 'UX Designer',      acme: { l: 'amber', hrs: 80  }, creative: { l: 'green', hrs: 180 }, tech: { l: 'amber', hrs: 90  }, wave: { l: 'amber', hrs: 50  } },
  { role: 'Product Manager',  acme: { l: 'green', hrs: 120 }, creative: { l: 'red',   hrs: 10  }, tech: { l: 'amber', hrs: 60  }, wave: { l: 'red',   hrs: 15  } },
  { role: 'Data Analyst',     acme: { l: 'red',   hrs: 20  }, creative: { l: 'amber', hrs: 70  }, tech: { l: 'green', hrs: 130 }, wave: { l: 'red',   hrs: 80  } },
  { role: 'QA Engineer',      acme: { l: 'amber', hrs: 50  }, creative: { l: 'green', hrs: 100 }, tech: { l: 'red',   hrs: 30  }, wave: { l: 'amber', hrs: 60  } },
];

const initialAgencyControls: AgencyControl[] = [
  { id: 'acme',     name: 'Acme Digital',   optedIn: true,  optInDate: '2026-01-15', totalResources: 42, sharedRoles: 5 },
  { id: 'creative', name: 'CreativeCo',     optedIn: true,  optInDate: '2026-02-03', totalResources: 28, sharedRoles: 4 },
  { id: 'tech',     name: 'TechVentures',   optedIn: true,  optInDate: '2025-11-20', totalResources: 35, sharedRoles: 3 },
  { id: 'wave',     name: 'Digital Wave',   optedIn: false, optInDate: null,         totalResources: 19, sharedRoles: 0 },
  { id: 'nova',     name: 'Nova Partners',  optedIn: false, optInDate: null,         totalResources: 23, sharedRoles: 0 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getLiquidityBg = (l: string) => {
  if (l === 'green') return 'bg-green-500';
  if (l === 'amber') return 'bg-amber-500';
  return 'bg-red-500';
};

const getLiquidityBorder = (l: string) => {
  if (l === 'green') return 'border-green-200 bg-green-50';
  if (l === 'amber') return 'border-amber-200 bg-amber-50';
  return 'border-red-200 bg-red-50';
};

const getLiquidityLabel = (l: string) => {
  if (l === 'green') return 'High';
  if (l === 'amber') return 'Medium';
  return 'Low';
};

const HEATMAP_COLS = [
  { key: 'acme',     label: 'Acme Digital'  },
  { key: 'creative', label: 'CreativeCo'    },
  { key: 'tech',     label: 'TechVentures'  },
  { key: 'wave',     label: 'Digital Wave'  },
] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function TrendIndicator({ trend, pct }: { trend: CapacitySignal['trend']; pct: number }) {
  if (trend === 'up')   return <span className="flex items-center gap-0.5 text-xs text-green-600 font-medium"><TrendingUp className="w-3 h-3" />+{pct}%</span>;
  if (trend === 'down') return <span className="flex items-center gap-0.5 text-xs text-red-600   font-medium"><TrendingDown className="w-3 h-3" />-{pct}%</span>;
  return <span className="flex items-center gap-0.5 text-xs text-gray-500 font-medium"><Minus className="w-3 h-3" />0%</span>;
}

interface BorrowRequestDialogProps {
  signal: CapacitySignal | null;
  onClose: () => void;
}

function BorrowRequestDialog({ signal, onClose }: BorrowRequestDialogProps) {
  const [hours, setHours] = useState('');
  const [startDate, setStartDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    // In a real app this would call the borrow-request API
    setSubmitted(true);
    setTimeout(onClose, 1800);
  };

  if (!signal) return null;

  return (
    <Dialog open={!!signal} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Borrow — {signal.role}</DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <div className="text-green-600 font-semibold">Request sent!</div>
            <div className="text-sm text-gray-600">
              Your borrow request for <strong>{signal.role}</strong> from <strong>{signal.agency}</strong> has been submitted for review.
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-600">Agency</span><span className="font-medium">{signal.agency}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Available hours</span><span className="font-medium">{signal.availableHours} hrs</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Rate</span><span className="font-medium">${signal.avgCostRate}/hr</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Time horizon</span><span className="font-medium">{signal.timeHorizon}</span></div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Hours requested</label>
              <Input
                type="number"
                placeholder={`Max ${signal.availableHours}`}
                value={hours}
                onChange={e => setHours(e.target.value)}
                max={signal.availableHours}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Preferred start date</label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Project context, skills needed, urgency…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            <div className="text-xs text-gray-500">
              This request will be sent to <strong>{signal.agency}</strong> for manual review. No commitment is made until both parties agree.
            </div>
          </div>
        )}

        {!submitted && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!hours || !startDate} className="gap-2">
              <Send className="w-4 h-4" />
              Send Request
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function HiddenCapacity() {
  // Signals filter state
  const [search, setSearch]           = useState('');
  const [liquidityFilter, setLF]      = useState<'all' | 'green' | 'amber' | 'red'>('all');
  const [sortBy, setSortBy]           = useState<'hours' | 'rate' | 'liquidity'>('hours');
  const [borrowTarget, setBorrow]     = useState<CapacitySignal | null>(null);

  // Heatmap time-horizon filter
  const [horizon, setHorizon]         = useState<'all' | '1' | '2' | '4'>('all');

  // Agency controls
  const [agencies, setAgencies]       = useState<AgencyControl[]>(initialAgencyControls);

  const toggleAgency = (id: string) => {
    setAgencies(prev => prev.map(a =>
      a.id !== id ? a :
      a.optedIn
        ? { ...a, optedIn: false, optInDate: null, sharedRoles: 0 }
        : { ...a, optedIn: true,  optInDate: new Date().toISOString().slice(0, 10), sharedRoles: Math.floor(Math.random() * 4) + 1 }
    ));
  };

  // Filtered + sorted signals
  const filteredSignals = useMemo(() => {
    let list = allCapacitySignals.filter(s => {
      const q = search.toLowerCase();
      const matchSearch = !q || s.role.toLowerCase().includes(q) || s.agency.toLowerCase().includes(q);
      const matchLiquidity = liquidityFilter === 'all' || s.liquidity === liquidityFilter;
      return matchSearch && matchLiquidity;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'hours')    return b.availableHours - a.availableHours;
      if (sortBy === 'rate')     return b.avgCostRate - a.avgCostRate;
      if (sortBy === 'liquidity') {
        const order = { green: 0, amber: 1, red: 2 };
        return order[a.liquidity] - order[b.liquidity];
      }
      return 0;
    });

    return list;
  }, [search, liquidityFilter, sortBy]);

  // Overview bar chart data
  const chartData = useMemo(() =>
    Object.entries(
      allCapacitySignals.reduce<Record<string, number>>((acc, s) => {
        acc[s.role] = (acc[s.role] ?? 0) + s.availableHours;
        return acc;
      }, {})
    ).map(([role, hours]) => ({ role: role.replace(' ', '\n'), hours }))
      .sort((a, b) => b.hours - a.hours)
  , []);

  const BAR_COLORS: Record<string, string> = { green: '#22c55e', amber: '#f59e0b', red: '#ef4444' };

  // Heatmap: filter rows by time horizon (simplified — real would use actual month data)
  const heatmapRows = useMemo(() => {
    if (horizon === 'all') return heatmapData;
    const maxMonths = parseInt(horizon);
    // For demo: filter signals down to roles with at least one signal within horizon
    const eligible = new Set(
      allCapacitySignals
        .filter(s => parseInt(s.timeHorizon) <= maxMonths)
        .map(s => s.role)
    );
    return heatmapData.filter(r => eligible.has(r.role));
  }, [horizon]);

  const optedInCount  = agencies.filter(a => a.optedIn).length;
  const totalSharedHrs = allCapacitySignals.reduce((s, x) => s + x.availableHours, 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
          <Eye className="w-8 h-8 text-blue-600" />
          Hidden Capacity Radar
        </h1>
        <p className="text-gray-600 mt-1">
          Strategic differentiator — Identify shareable unused capacity across your agency network
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="signals">
            Capacity Signals
            <Badge className="ml-2 bg-blue-500 text-white text-xs py-0">{filteredSignals.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="agencies">Agency Controls</TabsTrigger>
          <TabsTrigger value="methodology">How It Works</TabsTrigger>
        </TabsList>

        {/* ── Overview ─────────────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900">Governance & Trust Safeguards Active</div>
                  <div className="text-sm text-blue-700 mt-1">
                    All capacity signals are aggregated and anonymized. No individual performance exposure.
                    Agency opt-in required. Advisory-only insights with explainable signals.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Shareable Capacity</div>
                <div className="text-2xl font-semibold text-gray-900 mt-1">{totalSharedHrs.toLocaleString()} hrs</div>
                <div className="text-xs text-gray-500 mt-1">Across {new Set(allCapacitySignals.map(s => s.role)).size} role types</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <div className="text-sm text-gray-600">High Liquidity</div>
                </div>
                <div className="text-2xl font-semibold text-green-600 mt-1">
                  {allCapacitySignals.filter(s => s.liquidity === 'green').length} pools
                </div>
                <TrendIndicator trend="up" pct={12} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full" />
                  <div className="text-sm text-gray-600">Medium Liquidity</div>
                </div>
                <div className="text-2xl font-semibold text-amber-600 mt-1">
                  {allCapacitySignals.filter(s => s.liquidity === 'amber').length} pools
                </div>
                <TrendIndicator trend="flat" pct={0} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="text-sm text-gray-600">Low Liquidity</div>
                </div>
                <div className="text-2xl font-semibold text-red-600 mt-1">
                  {allCapacitySignals.filter(s => s.liquidity === 'red').length} pools
                </div>
                <TrendIndicator trend="down" pct={3} />
              </CardContent>
            </Card>
          </div>

          {/* Bar chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Available Hours by Role</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="role" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11 }} unit=" hrs" />
                  <Tooltip formatter={(v: number) => [`${v} hrs`, 'Available']} />
                  <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => {
                      const signal = allCapacitySignals.find(s => entry.role.includes(s.role.split(' ')[0]));
                      return <Cell key={i} fill={BAR_COLORS[signal?.liquidity ?? 'green']} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-6 mt-2 pt-2 border-t">
                {(['green', 'amber', 'red'] as const).map(l => (
                  <div key={l} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${getLiquidityBg(l)}`} />
                    <span className="text-xs text-gray-600">{getLiquidityLabel(l)} Liquidity</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Heatmap ──────────────────────────────────────────────────────── */}
        <TabsContent value="heatmap" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Executive Heatmap — Role × Agency × Time Horizon</CardTitle>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <Select value={horizon} onValueChange={v => setHorizon(v as typeof horizon)}>
                  <SelectTrigger className="w-36 h-8 text-sm">
                    <SelectValue placeholder="Time horizon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All horizons</SelectItem>
                    <SelectItem value="1">Within 1 month</SelectItem>
                    <SelectItem value="2">Within 2 months</SelectItem>
                    <SelectItem value="4">Within 4 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {heatmapRows.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No roles available within this time horizon.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium text-gray-700">Role</th>
                        {HEATMAP_COLS.map(c => (
                          <th key={c.key} className="text-center p-3 font-medium text-gray-700">{c.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {heatmapRows.map(row => (
                        <tr key={row.role} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="p-3 font-medium text-gray-900">{row.role}</td>
                          {HEATMAP_COLS.map(col => {
                            const cell = row[col.key as keyof typeof row] as { l: string; hrs: number };
                            return (
                              <td key={col.key} className="p-3">
                                <div
                                  title={`${cell.hrs} hrs — ${getLiquidityLabel(cell.l)} liquidity`}
                                  className={`w-20 h-14 mx-auto rounded-lg flex flex-col items-center justify-center gap-0.5 ${getLiquidityBg(cell.l)} text-white cursor-default`}
                                >
                                  <span className="text-sm font-semibold">{cell.hrs}h</span>
                                  <span className="text-xs opacity-80">{getLiquidityLabel(cell.l)}</span>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex items-center gap-6 mt-4 pt-4 border-t">
                {(['green', 'amber', 'red'] as const).map(l => (
                  <div key={l} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${getLiquidityBg(l)}`} />
                    <span className="text-sm text-gray-600">{getLiquidityLabel(l)} Liquidity</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Capacity Signals ─────────────────────────────────────────────── */}
        <TabsContent value="signals" className="space-y-6">
          {/* Filters toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by role or agency…"
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={liquidityFilter} onValueChange={v => setLF(v as typeof liquidityFilter)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Liquidity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All liquidity</SelectItem>
                <SelectItem value="green">High only</SelectItem>
                <SelectItem value="amber">Medium only</SelectItem>
                <SelectItem value="red">Low only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={v => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-44">
                <ArrowUpDown className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hours">Sort: hours ↓</SelectItem>
                <SelectItem value="rate">Sort: rate ↓</SelectItem>
                <SelectItem value="liquidity">Sort: liquidity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredSignals.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Search className="w-10 h-10 mb-3 opacity-40" />
                <p className="font-medium">No signals match your filters.</p>
                <Button variant="link" size="sm" onClick={() => { setSearch(''); setLF('all'); }}>
                  Clear filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSignals.map(signal => (
                <Card
                  key={`${signal.role}-${signal.agency}`}
                  className={`border ${getLiquidityBorder(signal.liquidity)}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{signal.role}</CardTitle>
                        <div className="text-sm text-gray-600 mt-0.5 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {signal.agency}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className={`w-2.5 h-2.5 rounded-full ${getLiquidityBg(signal.liquidity)}`} />
                        <TrendIndicator trend={signal.trend} pct={signal.trendPct} />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Available Hours</div>
                        <div className="text-xl font-semibold text-gray-900">{signal.availableHours} hrs</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Time Horizon</div>
                        <div className="text-xl font-semibold text-gray-900">{signal.timeHorizon}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                          <Users className="w-3 h-3" />Resources
                        </div>
                        <div className="font-semibold text-gray-900">{signal.resources}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                          <TrendingUp className="w-3 h-3" />Avg Rate
                        </div>
                        <div className="font-semibold text-gray-900">${signal.avgCostRate}/hr</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Valid Tie-Ups</div>
                        <div className="font-semibold text-gray-900">{signal.validTieUps}</div>
                      </div>
                    </div>

                    {/* Liquidity insight */}
                    <div className={`p-3 rounded-lg border text-sm ${
                      signal.liquidity === 'green' ? 'bg-green-50 border-green-200' :
                      signal.liquidity === 'amber' ? 'bg-amber-50 border-amber-200' :
                      'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start gap-2">
                        <Eye className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          signal.liquidity === 'green' ? 'text-green-600' :
                          signal.liquidity === 'amber' ? 'text-amber-600' :
                          'text-red-600'
                        }`} />
                        <div>
                          <div className={`font-medium ${
                            signal.liquidity === 'green' ? 'text-green-900' :
                            signal.liquidity === 'amber' ? 'text-amber-900' :
                            'text-red-900'
                          }`}>
                            {getLiquidityLabel(signal.liquidity)} Shareable Liquidity
                          </div>
                          <div className={`mt-1 text-xs ${
                            signal.liquidity === 'green' ? 'text-green-700' :
                            signal.liquidity === 'amber' ? 'text-amber-700' :
                            'text-red-700'
                          }`}>
                            {signal.liquidity === 'green' &&
                              `${signal.resources} resources with ${signal.availableHours} hrs available. ${signal.validTieUps} active tie-ups enable immediate sharing.`}
                            {signal.liquidity === 'amber' &&
                              `Moderate capacity detected. Consider expanding tie-up network for better utilization.`}
                            {signal.liquidity === 'red' &&
                              `Limited shareable capacity. Tie-up expansion recommended to unlock value.`}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 gap-2"
                        size="sm"
                        disabled={signal.liquidity === 'red'}
                        onClick={() => setBorrow(signal)}
                      >
                        <Send className="w-3.5 h-3.5" />
                        Request Borrow
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Signal Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-purple-900">Advisory-Only Recommendations</div>
                  <div className="text-sm text-purple-700 mt-1">
                    Hidden Capacity Radar provides strategic insights only. No auto-assignment or individual
                    performance scoring. All actions require manual approval and contract validation.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Agency Controls ───────────────────────────────────────────────── */}
        <TabsContent value="agencies" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Opted-In Agencies</div>
                <div className="text-2xl font-semibold text-green-600 mt-1">{optedInCount}</div>
                <div className="text-xs text-gray-500 mt-1">of {agencies.length} total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Total Shared Roles</div>
                <div className="text-2xl font-semibold text-blue-600 mt-1">
                  {agencies.filter(a => a.optedIn).reduce((s, a) => s + a.sharedRoles, 0)}
                </div>
                <div className="text-xs text-gray-500 mt-1">across opted-in agencies</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Total Resources in Network</div>
                <div className="text-2xl font-semibold text-gray-900 mt-1">
                  {agencies.reduce((s, a) => s + a.totalResources, 0)}
                </div>
                <div className="text-xs text-gray-500 mt-1">across all agencies</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Agency Opt-In Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agencies.map(agency => (
                  <div
                    key={agency.id}
                    onClick={() => toggleAgency(agency.id)}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer select-none ${
                      agency.optedIn ? 'bg-green-50 border-green-200 hover:bg-green-100' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${agency.optedIn ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div>
                        <div className="font-medium text-gray-900">{agency.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {agency.totalResources} resources
                          {agency.optedIn
                            ? ` • ${agency.sharedRoles} role${agency.sharedRoles !== 1 ? 's' : ''} shared • Opted in ${agency.optInDate}`
                            : ' • Not participating'}
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-3"
                      onClick={e => e.stopPropagation()}
                    >
                      <Badge className={agency.optedIn ? 'bg-green-500' : 'bg-gray-400'}>
                        {agency.optedIn ? 'Active' : 'Inactive'}
                      </Badge>
                      <Switch
                        checked={agency.optedIn}
                        onCheckedChange={() => toggleAgency(agency.id)}
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2 text-sm text-blue-800">
                  <Shield className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
                  Toggling an agency off immediately removes their data from the radar and all capacity signals.
                  Agencies can be re-enabled at any time and their data will repopulate within the next refresh cycle.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── How It Works ─────────────────────────────────────────────────── */}
        <TabsContent value="methodology" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                How Hidden Capacity Radar Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Overview</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Hidden Capacity Radar is a strategic intelligence tool that identifies underutilized resources
                  across your agency network. It uses anonymized, aggregated data to reveal shareable capacity
                  while protecting individual privacy and maintaining governance controls.
                </p>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Detection Algorithm</h3>
                <div className="space-y-4">
                  {[
                    {
                      title: 'Utilization Analysis',
                      description: 'Resources with <70% utilization over a 4-week rolling period are flagged as having available capacity.',
                      formula: 'Utilization = (Allocated Hours / Total Available Hours) × 100',
                    },
                    {
                      title: 'Skill Versatility Scoring',
                      description: 'Resources with multi-role capabilities receive higher versatility scores, making them more shareable.',
                      formula: 'Versatility = (Secondary Skills / Total Skills) × Proficiency Level',
                    },
                    {
                      title: 'Tie-Up Validation',
                      description: 'Only capacity from agencies with active, approved tie-up contracts appears in results.',
                      formula: 'Valid Tie-Ups = Active Contracts × Contract Liquidity Rating',
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <div className="font-semibold text-sm text-blue-900 mb-2">{item.title}</div>
                      <p className="text-sm text-blue-800 mb-2">{item.description}</p>
                      <code className="text-xs bg-white px-2 py-1 rounded border block">{item.formula}</code>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Liquidity Score Calculation</h3>
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="font-semibold text-sm text-green-900 mb-2">Formula</div>
                  <code className="text-xs bg-white px-2 py-1 rounded border block mb-3">
                    Liquidity Score = (Available Hours × 0.4) + (Valid Tie-Ups × 0.3) + (Skill Match × 0.3)
                  </code>
                  <div className="space-y-2 text-xs text-green-800">
                    <div><strong>High (80–100):</strong> Immediately shareable with multiple tie-up options</div>
                    <div><strong>Medium (50–79):</strong> Shareable with some constraints or limited tie-ups</div>
                    <div><strong>Low (0–49):</strong> Limited shareability, tie-up expansion recommended</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Governance & Privacy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: <Shield className="w-5 h-5 text-blue-600" />,  title: 'Anonymization', description: 'Individual resource data is never exposed. All signals are aggregated by role and agency.' },
                    { icon: <Lock className="w-5 h-5 text-purple-600" />,  title: 'Agency Opt-In',  description: 'Agencies must explicitly opt-in to share capacity data. Can be disabled anytime.' },
                    { icon: <Target className="w-5 h-5 text-green-600" />, title: 'Advisory Only',  description: 'No auto-assignment. All recommendations require manual approval and contract validation.' },
                    { icon: <Zap className="w-5 h-5 text-amber-600" />,   title: 'Explainable Signals', description: 'Every recommendation includes reasoning and data sources for full transparency.' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg border">
                      <div className="flex-shrink-0 p-2 bg-white rounded-lg">{item.icon}</div>
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Use Cases & Benefits</h3>
                <div className="space-y-3">
                  {[
                    { title: 'Emergency Project Coverage',  description: 'Quickly identify available resources when your team is at capacity. See which partner agencies have developers, designers, or PMs ready to deploy.' },
                    { title: 'Cost Optimization',           description: 'Leverage underutilized resources from partner agencies instead of hiring externally. Reduce bench costs while maximizing network value.' },
                    { title: 'Strategic Planning',          description: 'Use capacity heatmaps to inform tie-up expansion decisions. Identify which skill gaps could be filled through partnerships.' },
                    { title: 'Fair Resource Distribution',  description: 'Ensure equitable distribution of opportunities across your network while maintaining high-quality matches.' },
                  ].map((uc, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="font-semibold text-sm text-gray-900 mb-1">{uc.title}</div>
                      <div className="text-sm text-gray-600">{uc.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
                <div className="space-y-3">
                  {[
                    { q: 'Is individual resource performance exposed?', a: 'No. All data is aggregated by role and agency. Individual names, performance metrics, and utilization are never shown.' },
                    { q: 'How often is the radar updated?',            a: 'Capacity signals refresh every 6 hours based on utilization data from connected PPM tools (Workfront, etc.).' },
                    { q: 'Can we disable Hidden Capacity for our agency?', a: 'Yes. Use the Agency Controls tab or go to Settings → Hidden Capacity Controls. This removes all your data from the radar immediately.' },
                    { q: 'What if a signal suggests a resource but they\'re unavailable?', a: 'Signals are advisory only. Always validate availability directly with the agency before making any commitments.' },
                  ].map((faq, idx) => (
                    <div key={idx} className="p-4 bg-blue-50 rounded-lg">
                      <div className="font-semibold text-sm text-blue-900 mb-1 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        {faq.q}
                      </div>
                      <div className="text-sm text-blue-800 ml-6">{faq.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Borrow request dialog */}
      <BorrowRequestDialog signal={borrowTarget} onClose={() => setBorrow(null)} />
    </div>
  );
}
