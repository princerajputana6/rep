import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Users,
  Briefcase,
  TrendingUp,
  Clock,
  Target,
  BarChart3,
  Layers,
  Filter,
  Download,
  Eye,
  Settings,
  BookOpen,
  CalendarDays,
  PlusCircle,
  Save,
  LayoutGrid,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';
import { staffingPlansApi } from '@/lib/api';

// ─── Types ──────────────────────────────────────────────────────────────────

type PlanPeriod = 'monthly' | 'quarterly' | 'annual';

interface StaffingRow {
  resourceName: string;
  role: string;
  allocations: { label: string; hours: number }[];
  totalHours: number;
  totalCost: number;
  ratePerHour: number;
}

interface StaffingPlan {
  id: string;
  name: string;
  period: PlanPeriod;
  year: number;
  quarter?: 1 | 2 | 3 | 4;
  month?: number;
  projects: string[];
  rows: StaffingRow[];
  createdAt: string;
  status: 'draft' | 'active' | 'archived';
}

// ─── Static data (existing tabs) ────────────────────────────────────────────

const resourcePlannerData = [
  { project: 'Digital Transformation', budgeted: 500, actual: 450, available: 50, role: 'Developer' },
  { project: 'Mobile App Redesign', budgeted: 300, actual: 320, available: -20, role: 'Designer' },
  { project: 'Cloud Migration', budgeted: 800, actual: 750, available: 50, role: 'DevOps' },
  { project: 'CRM Implementation', budgeted: 600, actual: 580, available: 20, role: 'Analyst' },
];

const workloadData = [
  { user: 'Sarah Mitchell', capacity: 100, allocated: 85, available: 15, status: 'optimal' },
  { user: 'Michael Chen', capacity: 100, allocated: 110, available: -10, status: 'overallocated' },
  { user: 'Emily Rodriguez', capacity: 100, allocated: 60, available: 40, status: 'underutilized' },
  { user: 'James Wilson', capacity: 100, allocated: 95, available: 5, status: 'optimal' },
  { user: 'Lisa Anderson', capacity: 100, allocated: 75, available: 25, status: 'optimal' },
  { user: 'David Brown', capacity: 100, allocated: 120, available: -20, status: 'overallocated' },
];

const scenarioData = [
  { scenario: 'Current State', cost: 1200000, resources: 45, projects: 12, roi: 18 },
  { scenario: 'Growth Scenario', cost: 1800000, resources: 65, projects: 18, roi: 22 },
  { scenario: 'Optimized', cost: 1400000, resources: 52, projects: 15, roi: 25 },
];


const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ALL_PROJECTS = ['Digital Transformation', 'Mobile App Redesign', 'Cloud Migration', 'CRM Implementation', 'Brand Campaign'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getPeriodColumns(plan: StaffingPlan): string[] {
  if (plan.period === 'monthly') return ['W1', 'W2', 'W3', 'W4'];
  if (plan.period === 'quarterly') {
    const q = plan.quarter ?? 1;
    const monthIdx = (q - 1) * 3;
    return [MONTH_NAMES[monthIdx], MONTH_NAMES[monthIdx + 1], MONTH_NAMES[monthIdx + 2]];
  }
  return ['Q1', 'Q2', 'Q3', 'Q4'];
}

function getAllocationCellColor(hours: number, period: PlanPeriod): string {
  // Interpret hours relative to period
  // monthly = weekly hours, quarterly = monthly hours, annual = quarterly hours
  const weeklyEquiv = period === 'monthly' ? hours : period === 'quarterly' ? hours / 4.33 : hours / 13;
  if (weeklyEquiv <= 40) return 'bg-green-50 text-green-800';
  if (weeklyEquiv <= 48) return 'bg-amber-50 text-amber-800';
  return 'bg-red-50 text-red-800';
}

function getPlanPeriodLabel(plan: StaffingPlan): string {
  if (plan.period === 'monthly' && plan.month) {
    return `${MONTH_NAMES[plan.month - 1]} ${plan.year}`;
  }
  if (plan.period === 'quarterly' && plan.quarter) {
    return `Q${plan.quarter} ${plan.year}`;
  }
  return `${plan.year}`;
}

function generateRows(period: PlanPeriod, quarter?: number, _month?: number): StaffingRow[] {
  if (period === 'monthly') {
    const cols = ['W1', 'W2', 'W3', 'W4'];
    const resources = [
      { name: 'Alex Johnson', role: 'Full-Stack Developer', rate: 130 },
      { name: 'Maria Garcia', role: 'UX Designer', rate: 115 },
      { name: 'Robert Lee', role: 'Business Analyst', rate: 105 },
    ];
    return resources.map(({ name, role, rate }) => {
      const allocs = cols.map(label => ({ label, hours: 32 + Math.floor(Math.random() * 10) }));
      const total = allocs.reduce((s, a) => s + a.hours, 0);
      return { resourceName: name, role, ratePerHour: rate, allocations: allocs, totalHours: total, totalCost: total * rate };
    });
  }
  if (period === 'quarterly') {
    const q = quarter ?? 1;
    const monthIdx = (q - 1) * 3;
    const cols = [MONTH_NAMES[monthIdx], MONTH_NAMES[monthIdx + 1], MONTH_NAMES[monthIdx + 2]];
    const resources = [
      { name: 'Priya Mehta', role: 'Project Manager', rate: 125 },
      { name: 'Tom Richards', role: 'Senior Developer', rate: 140 },
      { name: 'Yuki Tanaka', role: 'Data Analyst', rate: 120 },
    ];
    return resources.map(({ name, role, rate }) => {
      const allocs = cols.map(label => ({ label, hours: 130 + Math.floor(Math.random() * 40) }));
      const total = allocs.reduce((s, a) => s + a.hours, 0);
      return { resourceName: name, role, ratePerHour: rate, allocations: allocs, totalHours: total, totalCost: total * rate };
    });
  }
  // annual
  const cols = ['Q1', 'Q2', 'Q3', 'Q4'];
  const resources = [
    { name: 'Diana Prince', role: 'Tech Lead', rate: 160 },
    { name: 'Marcus Chen', role: 'DevOps Engineer', rate: 145 },
  ];
  return resources.map(({ name, role, rate }) => {
    const allocs = cols.map(label => ({ label, hours: 400 + Math.floor(Math.random() * 100) }));
    const total = allocs.reduce((s, a) => s + a.hours, 0);
    return { resourceName: name, role, ratePerHour: rate, allocations: allocs, totalHours: total, totalCost: total * rate };
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export function StaffingPlanner() {
  const [selectedView, setSelectedView] = useState<'planner' | 'workload' | 'scenario' | 'methodology' | 'planbuilder'>('planner');
  const [selectedTimeframe, setSelectedTimeframe] = useState('quarter');

  // Plan Builder state
  const [plans, setPlans] = useState<StaffingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    staffingPlansApi.list().then(result => {
      const mapped: StaffingPlan[] = result.data.map(p => {
        const period: StaffingPlan['period'] =
          p.periodType === 'MONTHLY' ? 'monthly' :
          p.periodType === 'QUARTERLY' ? 'quarterly' : 'annual';
        const cols = period === 'monthly' ? ['W1', 'W2', 'W3', 'W4'] :
                     period === 'quarterly' ? ['M1', 'M2', 'M3'] : ['Q1', 'Q2', 'Q3', 'Q4'];
        const rows: StaffingRow[] = p.rows.map(r => {
          const allocs = [r.col1Hours, r.col2Hours, r.col3Hours, r.col4Hours]
            .slice(0, cols.length)
            .map((hours, i) => ({ label: cols[i], hours }));
          const total = allocs.reduce((s, a) => s + a.hours, 0);
          return { resourceName: r.resourceName, role: r.role, ratePerHour: 0, allocations: allocs, totalHours: total, totalCost: 0 };
        });
        return {
          id: p.id,
          name: p.name,
          period,
          year: p.year,
          quarter: (p.quarter ?? undefined) as 1 | 2 | 3 | 4 | undefined,
          month: p.month ?? undefined,
          projects: (() => { try { return JSON.parse(p.projectIds); } catch { return p.projectIds ? p.projectIds.split(',') : []; } })(),
          rows,
          createdAt: p.createdAt.slice(0, 10),
          status: (p.status as StaffingPlan['status']) ?? 'draft',
        };
      });
      setPlans(mapped);
    }).catch(err => {
      toast.error(err.message);
    }).finally(() => {
      setLoading(false);
    });
  }, []);
  const [loadedPlan, setLoadedPlan] = useState<StaffingPlan | null>(null);
  const [planName, setPlanName] = useState('');
  const [planPeriodType, setPlanPeriodType] = useState<PlanPeriod>('quarterly');
  const [planYear, setPlanYear] = useState('2026');
  const [planQuarter, setPlanQuarter] = useState<'1' | '2' | '3' | '4'>('3');
  const [planMonth, setPlanMonth] = useState('5');
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-500';
      case 'overallocated': return 'bg-red-500';
      case 'underutilized': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  const toggleProject = (p: string) => {
    setSelectedProjects(prev => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p); else next.add(p);
      return next;
    });
  };

  const handleGeneratePlan = () => {
    if (!planName.trim()) {
      toast.error('Please enter a plan name');
      return;
    }
    if (selectedProjects.size === 0) {
      toast.error('Please select at least one project');
      return;
    }
    const year = parseInt(planYear, 10) || 2026;
    const q = parseInt(planQuarter, 10) as 1 | 2 | 3 | 4;
    const m = parseInt(planMonth, 10);
    const rows = generateRows(planPeriodType, q, m);
    staffingPlansApi.create({
      name: planName,
      periodType: planPeriodType === 'monthly' ? 'MONTHLY' : planPeriodType === 'quarterly' ? 'QUARTERLY' : 'ANNUAL',
      year,
      quarter: planPeriodType === 'quarterly' ? q : undefined,
      month: planPeriodType === 'monthly' ? m : undefined,
      projectIds: JSON.stringify(Array.from(selectedProjects)),
      status: 'draft',
      rows: rows.map(r => ({
        resourceName: r.resourceName,
        role: r.role,
        col1Hours: r.allocations[0]?.hours ?? 0,
        col2Hours: r.allocations[1]?.hours ?? 0,
        col3Hours: r.allocations[2]?.hours ?? 0,
        col4Hours: r.allocations[3]?.hours ?? 0,
      })),
    }).then(created => {
      const period = planPeriodType;
      const newPlan: StaffingPlan = {
        id: created.id,
        name: created.name,
        period,
        year: created.year,
        quarter: (created.quarter ?? undefined) as 1 | 2 | 3 | 4 | undefined,
        month: created.month ?? undefined,
        projects: Array.from(selectedProjects),
        rows,
        createdAt: created.createdAt.slice(0, 10),
        status: (created.status as StaffingPlan['status']) ?? 'draft',
      };
      setPlans(prev => [newPlan, ...prev]);
      setLoadedPlan(newPlan);
      toast.success(`Plan "${planName}" generated successfully`);
      setPlanName('');
      setSelectedProjects(new Set());
    }).catch(err => {
      toast.error(err.message);
    });
  };

  const handleSavePlan = () => {
    if (!loadedPlan) return;
    const cols = getPeriodColumns(loadedPlan);
    staffingPlansApi.update(loadedPlan.id, {
      rows: loadedPlan.rows.map(r => ({
        resourceName: r.resourceName,
        role: r.role,
        col1Hours: r.allocations[0]?.hours ?? 0,
        col2Hours: r.allocations[1]?.hours ?? 0,
        col3Hours: r.allocations[2]?.hours ?? 0,
        col4Hours: cols.length >= 4 ? (r.allocations[3]?.hours ?? 0) : 0,
      })),
    }).then(() => {
      setPlans(prev => prev.map(p => p.id === loadedPlan.id ? loadedPlan : p));
      toast.success(`Plan "${loadedPlan.name}" saved`);
    }).catch(err => {
      toast.error(err.message);
    });
  };

  const handleExportPlan = () => {
    if (!loadedPlan) return;
    toast.info(`Exporting "${loadedPlan.name}"…`);
  };

  const updateAllocationHours = (planId: string, rowIdx: number, allocIdx: number, value: number) => {
    setPlans(prev =>
      prev.map(p => {
        if (p.id !== planId) return p;
        const newRows = p.rows.map((row, ri) => {
          if (ri !== rowIdx) return row;
          const newAllocs = row.allocations.map((a, ai) =>
            ai === allocIdx ? { ...a, hours: value } : a
          );
          const total = newAllocs.reduce((s, a) => s + a.hours, 0);
          return { ...row, allocations: newAllocs, totalHours: total, totalCost: total * row.ratePerHour };
        });
        return { ...p, rows: newRows };
      })
    );
    // keep loadedPlan in sync
    if (loadedPlan?.id === planId) {
      setLoadedPlan(prev => {
        if (!prev) return prev;
        const newRows = prev.rows.map((row, ri) => {
          if (ri !== rowIdx) return row;
          const newAllocs = row.allocations.map((a, ai) =>
            ai === allocIdx ? { ...a, hours: value } : a
          );
          const total = newAllocs.reduce((s, a) => s + a.hours, 0);
          return { ...row, allocations: newAllocs, totalHours: total, totalCost: total * row.ratePerHour };
        });
        return { ...prev, rows: newRows };
      });
    }
  };

  const columnTotals = useMemo(() => {
    if (!loadedPlan) return [];
    const cols = getPeriodColumns(loadedPlan);
    return cols.map((_, ci) =>
      loadedPlan.rows.reduce((sum, row) => sum + (row.allocations[ci]?.hours ?? 0), 0)
    );
  }, [loadedPlan]);

  const planTotalBudget = useMemo(() => {
    if (!loadedPlan) return 0;
    return loadedPlan.rows.reduce((s, r) => s + r.totalCost, 0);
  }, [loadedPlan]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-semibold text-gray-900">Staffing Planner</h1>
          </div>
          <p className="text-gray-600 mt-1">
            Strategic workforce planning and resource optimization
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="gap-2">
            <Settings className="w-4 h-4" />
            Configure
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Resources</p>
                <p className="text-2xl font-semibold text-gray-900">45</p>
                <p className="text-xs text-green-600 mt-1">↑ 5 new this quarter</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Utilization</p>
                <p className="text-2xl font-semibold text-gray-900">82.5%</p>
                <p className="text-xs text-green-600 mt-1">Optimal range</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Overallocated</p>
                <p className="text-2xl font-semibold text-gray-900">2</p>
                <p className="text-xs text-amber-600 mt-1">Requires attention</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Capacity</p>
                <p className="text-2xl font-semibold text-gray-900">125h</p>
                <p className="text-xs text-purple-600 mt-1">This week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as typeof selectedView)} className="w-full">
        <TabsList>
          <TabsTrigger value="planner">
            <Layers className="w-4 h-4 mr-2" />
            Resource Planner
          </TabsTrigger>
          <TabsTrigger value="workload">
            <BarChart3 className="w-4 h-4 mr-2" />
            Workload Balancer
          </TabsTrigger>
          <TabsTrigger value="scenario">
            <Eye className="w-4 h-4 mr-2" />
            Scenario Planner
          </TabsTrigger>
          <TabsTrigger value="methodology">
            <BookOpen className="w-4 h-4 mr-2" />
            How It Works
          </TabsTrigger>
          <TabsTrigger value="planbuilder">
            <CalendarDays className="w-4 h-4 mr-2" />
            Plan Builder
          </TabsTrigger>
        </TabsList>

        {/* Resource Planner Tab */}
        <TabsContent value="planner" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System-Level Resource Planner</CardTitle>
                  <CardDescription>
                    Budget and allocate resources across multiple projects
                  </CardDescription>
                </div>
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-4 pb-3 border-b font-semibold text-sm text-gray-600">
                  <div>Project</div>
                  <div>Role</div>
                  <div className="text-right">Budgeted (hrs)</div>
                  <div className="text-right">Actual (hrs)</div>
                  <div className="text-right">Available (hrs)</div>
                </div>

                {resourcePlannerData.map((item, index) => (
                  <div key={index} className="grid grid-cols-5 gap-4 items-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">{item.project}</div>
                    <div className="text-sm text-gray-600">{item.role}</div>
                    <div className="text-right font-semibold">{item.budgeted}</div>
                    <div className="text-right">{item.actual}</div>
                    <div className={`text-right font-semibold ${item.available >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.available >= 0 ? '+' : ''}{item.available}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={resourcePlannerData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="project" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="budgeted" fill="#3b82f6" name="Budgeted Hours" />
                    <Bar dataKey="actual" fill="#10b981" name="Actual Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Resource Pools by Skill */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Pools by Skills &amp; Departments</CardTitle>
              <CardDescription>Organize resources based on common skills and structure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg hover:border-blue-500 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold">Development Team</h4>
                    </div>
                    <Badge>18 members</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-semibold">1,440 hrs/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Allocated:</span>
                      <span className="font-semibold">1,200 hrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-semibold text-green-600">240 hrs</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg hover:border-blue-500 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold">Design Team</h4>
                    </div>
                    <Badge>8 members</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-semibold">640 hrs/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Allocated:</span>
                      <span className="font-semibold">580 hrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-semibold text-green-600">60 hrs</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg hover:border-blue-500 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold">DevOps Team</h4>
                    </div>
                    <Badge>5 members</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-semibold">400 hrs/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Allocated:</span>
                      <span className="font-semibold">420 hrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-semibold text-red-600">-20 hrs</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workload Balancer Tab */}
        <TabsContent value="workload" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Workload Balancer - Heat Map View</CardTitle>
              <CardDescription>
                Visual capacity management with drag-and-drop assignment adjustments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workloadData.map((user, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.user}</div>
                          <div className="text-xs text-gray-600">
                            {user.allocated}% allocated • {user.available}% available
                          </div>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(user.status)} text-white`}>
                        {user.status === 'optimal' && 'Optimal'}
                        {user.status === 'overallocated' && 'Overallocated'}
                        {user.status === 'underutilized' && 'Underutilized'}
                      </Badge>
                    </div>
                    <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getStatusColor(user.status)} transition-all`}
                        style={{ width: `${Math.min(user.allocated, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-900">Workload Optimization Tips</div>
                    <div className="text-sm text-blue-700 mt-1">
                      • 2 team members are overallocated - consider redistributing tasks<br />
                      • 1 team member has significant capacity - ideal for new assignments<br />
                      • Overall team utilization is healthy at 82.5%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scenario Planner Tab */}
        <TabsContent value="scenario" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Planner - Strategic Planning</CardTitle>
              <CardDescription>
                Compare multiple workforce scenarios to optimize resource allocation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {scenarioData.map((scenario, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      scenario.scenario === 'Optimized'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{scenario.scenario}</h4>
                      {scenario.scenario === 'Optimized' && (
                        <Badge className="bg-green-500">Recommended</Badge>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Cost:</span>
                        <span className="font-semibold">${(scenario.cost / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Resources:</span>
                        <span className="font-semibold">{scenario.resources}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Projects:</span>
                        <span className="font-semibold">{scenario.projects}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Projected ROI:</span>
                        <span className="font-semibold text-green-600">{scenario.roi}%</span>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-4"
                      variant={scenario.scenario === 'Optimized' ? 'default' : 'outline'}
                    >
                      {scenario.scenario === 'Optimized' ? 'Apply Scenario' : 'View Details'}
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-4">Scenario Comparison</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scenarioData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="scenario" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="resources" fill="#3b82f6" name="Resources" />
                    <Bar yAxisId="left" dataKey="projects" fill="#10b981" name="Projects" />
                    <Bar yAxisId="right" dataKey="roi" fill="#f59e0b" name="ROI %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Methodology Tab */}
        <TabsContent value="methodology" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>
                Understand the underlying methodology and processes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Resource Allocation</p>
                    <p className="text-2xl font-semibold text-gray-900">Budgeted vs Actual</p>
                    <p className="text-xs text-gray-600 mt-1">Allocate resources based on project needs</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Users className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Workload Balancing</p>
                    <p className="text-2xl font-semibold text-gray-900">Optimal Utilization</p>
                    <p className="text-xs text-gray-600 mt-1">Ensure team members are not overallocated</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Eye className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Scenario Planning</p>
                    <p className="text-2xl font-semibold text-gray-900">Strategic Resource Management</p>
                    <p className="text-xs text-gray-600 mt-1">Compare different workforce scenarios</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plan Builder Tab */}
        <TabsContent value="planbuilder" className="space-y-6 mt-6">
          {/* Create New Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                Create New Plan
              </CardTitle>
              <CardDescription>
                Generate a staffing plan for a specific time period across projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="plan-name">Plan Name *</Label>
                  <input
                    id="plan-name"
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="e.g. Q3 2026 Resource Plan"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="period-type">Period Type</Label>
                  <Select value={planPeriodType} onValueChange={(v) => setPlanPeriodType(v as PlanPeriod)}>
                    <SelectTrigger id="period-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {planPeriodType === 'monthly' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="plan-month">Month</Label>
                    <Select value={planMonth} onValueChange={setPlanMonth}>
                      <SelectTrigger id="plan-month">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTH_NAMES.map((m, i) => (
                          <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {planPeriodType === 'quarterly' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="plan-quarter">Quarter</Label>
                    <Select value={planQuarter} onValueChange={(v) => setPlanQuarter(v as '1' | '2' | '3' | '4')}>
                      <SelectTrigger id="plan-quarter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Q1 (Jan–Mar)</SelectItem>
                        <SelectItem value="2">Q2 (Apr–Jun)</SelectItem>
                        <SelectItem value="3">Q3 (Jul–Sep)</SelectItem>
                        <SelectItem value="4">Q4 (Oct–Dec)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="plan-year">Year</Label>
                  <input
                    id="plan-year"
                    type="number"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={planYear}
                    onChange={(e) => setPlanYear(e.target.value)}
                  />
                </div>
              </div>

              {/* Project multi-select */}
              <div className="space-y-1.5">
                <Label>Projects (select all that apply)</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ALL_PROJECTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => toggleProject(p)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        selectedProjects.has(p)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                {selectedProjects.size > 0 && (
                  <p className="text-xs text-gray-500">{selectedProjects.size} project{selectedProjects.size > 1 ? 's' : ''} selected</p>
                )}
              </div>

              <Button onClick={handleGeneratePlan} className="gap-2">
                <LayoutGrid className="w-4 h-4" />
                Generate Plan
              </Button>
            </CardContent>
          </Card>

          {/* Saved Plans */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="w-5 h-5 text-gray-600" />
                Saved Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && <p className="text-sm text-gray-500 mb-4">Loading...</p>}
              {!loading && plans.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">No plans yet. Create your first plan above.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <Card
                      key={plan.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${loadedPlan?.id === plan.id ? 'border-blue-500 ring-1 ring-blue-400' : 'border-gray-200'}`}
                    >
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="font-semibold text-gray-900 text-sm leading-snug">{plan.name}</div>
                          <Badge
                            variant="outline"
                            className={
                              plan.status === 'active'
                                ? 'bg-green-50 text-green-700 border-green-200 text-xs'
                                : plan.status === 'archived'
                                ? 'bg-gray-50 text-gray-500 border-gray-200 text-xs'
                                : 'bg-amber-50 text-amber-700 border-amber-200 text-xs'
                            }
                          >
                            {plan.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">{plan.period}</Badge>
                          <span className="text-xs text-gray-500">{getPlanPeriodLabel(plan)}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {plan.projects.length} project{plan.projects.length !== 1 ? 's' : ''} • {plan.rows.length} resources
                        </div>
                        <div className="text-xs font-medium text-gray-700">
                          Budget: ${plan.rows.reduce((s, r) => s + r.totalCost, 0).toLocaleString()}
                        </div>
                        <Button
                          size="sm"
                          variant={loadedPlan?.id === plan.id ? 'default' : 'outline'}
                          className="w-full h-7 text-xs"
                          onClick={() => setLoadedPlan(plan)}
                        >
                          {loadedPlan?.id === plan.id ? 'Loaded' : 'Load Plan'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Period Planning Grid */}
          {loadedPlan && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-blue-600" />
                      Period Planning Grid — {loadedPlan.name}
                    </CardTitle>
                    <CardDescription>
                      Edit allocations per period. Color: green ≤40h/wk, amber 40–48h, red &gt;48h.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleExportPlan} className="gap-1.5">
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                    <Button size="sm" onClick={handleSavePlan} className="gap-1.5">
                      <Save className="w-4 h-4" />
                      Save Plan
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="py-2.5 px-3 text-left font-semibold text-gray-700 min-w-32">Resource</th>
                        <th className="py-2.5 px-3 text-left font-semibold text-gray-700 min-w-28">Role</th>
                        {getPeriodColumns(loadedPlan).map((col) => (
                          <th key={col} className="py-2.5 px-3 text-center font-semibold text-gray-700 min-w-20">{col}</th>
                        ))}
                        <th className="py-2.5 px-3 text-right font-semibold text-gray-700 min-w-24">Total Hrs</th>
                        <th className="py-2.5 px-3 text-right font-semibold text-gray-700 min-w-28">Est. Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadedPlan.rows.map((row, rowIdx) => (
                        <tr key={rowIdx} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-3 font-medium text-gray-900">{row.resourceName}</td>
                          <td className="py-2 px-3 text-gray-600 text-xs">{row.role}</td>
                          {row.allocations.map((alloc, allocIdx) => (
                            <td key={allocIdx} className="py-2 px-3 text-center">
                              <input
                                type="number"
                                className={`w-16 text-center border rounded text-xs py-1 px-1 focus:outline-none focus:ring-1 focus:ring-blue-400 ${getAllocationCellColor(alloc.hours, loadedPlan.period)}`}
                                value={alloc.hours}
                                min={0}
                                max={999}
                                onChange={(e) =>
                                  updateAllocationHours(loadedPlan.id, rowIdx, allocIdx, parseInt(e.target.value, 10) || 0)
                                }
                              />
                            </td>
                          ))}
                          <td className="py-2 px-3 text-right font-semibold text-gray-900">{row.totalHours}</td>
                          <td className="py-2 px-3 text-right font-semibold text-blue-700">${row.totalCost.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 border-t-2 border-gray-300 font-semibold">
                        <td className="py-2 px-3 text-gray-700">Totals</td>
                        <td className="py-2 px-3 text-gray-500 text-xs">{loadedPlan.rows.length} resources</td>
                        {columnTotals.map((total, i) => (
                          <td key={i} className="py-2 px-3 text-center text-gray-800">{total}</td>
                        ))}
                        <td className="py-2 px-3 text-right text-gray-900">
                          {loadedPlan.rows.reduce((s, r) => s + r.totalHours, 0)}
                        </td>
                        <td className="py-2 px-3 text-right text-blue-700">
                          ${planTotalBudget.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
                  <span className="font-medium">Color guide:</span>
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded bg-green-100 border border-green-300 inline-block" />
                    ≤40h/wk (healthy)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded bg-amber-100 border border-amber-300 inline-block" />
                    40–48h/wk (watch)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded bg-red-100 border border-red-300 inline-block" />
                    &gt;48h/wk (over-capacity)
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-blue-900">Staffing Planner Access</div>
              <div className="text-sm text-blue-700 mt-1">
                Access tools: Resource Planner (Resourcing area) • Scenario Planner (Planning module) •
                Workload Balancer (Team view) • Skill Management (User profiles) • Plan Builder (Period planning)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
