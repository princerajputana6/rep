import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Progress } from '@/app/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import {
  Clock, DollarSign, TrendingUp, TrendingDown, Download, RefreshCw, Activity,
  FolderKanban, ClipboardList, Users, Briefcase, Search,
  AlertTriangle, Megaphone, CheckCircle2, X, Calendar, ArrowUpDown, Filter,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// ─── Data per period ───────────────────────────────────────────────────────────

const kpiData: Record<
  string,
  { label: string; planned: number; bill: number; cost: number }[]
> = {
  daily: [
    { label: 'Mon', planned: 62, bill: 145, cost: 95 },
    { label: 'Tue', planned: 58, bill: 138, cost: 91 },
    { label: 'Wed', planned: 74, bill: 160, cost: 104 },
    { label: 'Thu', planned: 69, bill: 152, cost: 99 },
    { label: 'Fri', planned: 55, bill: 130, cost: 85 },
    { label: 'Sat', planned: 20, bill: 110, cost: 72 },
    { label: 'Sun', planned: 10, bill: 100, cost: 65 },
  ],
  monthly: [
    { label: 'Jan', planned: 1420, bill: 148, cost: 97 },
    { label: 'Feb', planned: 1360, bill: 151, cost: 99 },
    { label: 'Mar', planned: 1540, bill: 155, cost: 102 },
    { label: 'Apr', planned: 1480, bill: 158, cost: 104 },
    { label: 'May', planned: 1610, bill: 162, cost: 107 },
    { label: 'Jun', planned: 1590, bill: 165, cost: 109 },
    { label: 'Jul', planned: 1450, bill: 160, cost: 105 },
    { label: 'Aug', planned: 1520, bill: 163, cost: 108 },
    { label: 'Sep', planned: 1670, bill: 168, cost: 111 },
    { label: 'Oct', planned: 1710, bill: 172, cost: 114 },
    { label: 'Nov', planned: 1640, bill: 170, cost: 112 },
    { label: 'Dec', planned: 1380, bill: 167, cost: 110 },
  ],
  quarterly: [
    { label: 'Q1', planned: 4320, bill: 151, cost: 99 },
    { label: 'Q2', planned: 4680, bill: 161, cost: 106 },
    { label: 'Q3', planned: 4640, bill: 163, cost: 108 },
    { label: 'Q4', planned: 4730, bill: 169, cost: 112 },
  ],
  halfannual: [
    { label: 'H1', planned: 9000, bill: 156, cost: 103 },
    { label: 'H2', planned: 9370, bill: 166, cost: 110 },
  ],
  annually: [
    { label: '2022', planned: 16200, bill: 138, cost: 91 },
    { label: '2023', planned: 17400, bill: 147, cost: 97 },
    { label: '2024', planned: 18100, bill: 158, cost: 104 },
    { label: '2025', planned: 18370, bill: 166, cost: 110 },
  ],
};

// ─── Summary stats per period ──────────────────────────────────────────────────

const summaryStats: Record<
  string,
  {
    totalPlanned: number;
    plannedUnit: string;
    avgBillRate: number;
    avgCostRate: number;
    plannedTrend: number;
    billTrend: number;
    costTrend: number;
  }
> = {
  daily: {
    totalPlanned: 348,
    plannedUnit: 'hrs/week',
    avgBillRate: 134,
    avgCostRate: 87,
    plannedTrend: 4.2,
    billTrend: 2.1,
    costTrend: 1.8,
  },
  monthly: {
    totalPlanned: 1587,
    plannedUnit: 'hrs/month',
    avgBillRate: 162,
    avgCostRate: 107,
    plannedTrend: 6.5,
    billTrend: 3.4,
    costTrend: 2.9,
  },
  quarterly: {
    totalPlanned: 4593,
    plannedUnit: 'hrs/quarter',
    avgBillRate: 161,
    avgCostRate: 106,
    plannedTrend: 2.3,
    billTrend: 3.9,
    costTrend: 3.1,
  },
  halfannual: {
    totalPlanned: 9185,
    plannedUnit: 'hrs/half',
    avgBillRate: 161,
    avgCostRate: 106,
    plannedTrend: 4.1,
    billTrend: 6.4,
    costTrend: 6.8,
  },
  annually: {
    totalPlanned: 18370,
    plannedUnit: 'hrs/year',
    avgBillRate: 166,
    avgCostRate: 110,
    plannedTrend: 1.5,
    billTrend: 5.1,
    costTrend: 5.8,
  },
};

// ─── Entity mock data ──────────────────────────────────────────────────────────

interface ProjectRow {
  id: string; name: string; type: 'integrated' | 'campaign'; client: string;
  status: 'active' | 'on-hold' | 'completed' | 'planning';
  tasks: number; assignments: number; plannedHrs: number;
  billValue: number; costValue: number; startDate: string; endDate: string;
}
const PROJECTS_DATA: ProjectRow[] = [
  { id: 'p1', name: 'Mobile App Redesign', type: 'integrated', client: 'Acme Corp', status: 'active', tasks: 12, assignments: 28, plannedHrs: 640, billValue: 96000, costValue: 64000, startDate: '2026-02-01', endDate: '2026-06-30' },
  { id: 'p2', name: 'Platform Core', type: 'integrated', client: 'TechStart Inc', status: 'active', tasks: 8, assignments: 15, plannedHrs: 320, billValue: 51200, costValue: 33000, startDate: '2026-03-01', endDate: '2026-07-31' },
  { id: 'p3', name: 'Data Analytics Platform', type: 'integrated', client: 'DataViz Co', status: 'active', tasks: 6, assignments: 10, plannedHrs: 480, billValue: 74400, costValue: 48000, startDate: '2026-01-15', endDate: '2026-08-15' },
  { id: 'p4', name: 'Brand Refresh', type: 'integrated', client: 'BrandCo', status: 'on-hold', tasks: 4, assignments: 5, plannedHrs: 160, billValue: 24000, costValue: 16000, startDate: '2026-04-01', endDate: '2026-09-30' },
  { id: 'p5', name: 'PDF Services', type: 'integrated', client: 'DocuTech', status: 'active', tasks: 5, assignments: 8, plannedHrs: 200, billValue: 32000, costValue: 21000, startDate: '2026-03-15', endDate: '2026-05-31' },
  { id: 'p6', name: 'CRM Integration', type: 'integrated', client: 'SalesForce Ltd', status: 'completed', tasks: 10, assignments: 20, plannedHrs: 400, billValue: 62000, costValue: 40000, startDate: '2025-10-01', endDate: '2026-02-28' },
  { id: 'c1', name: 'Summer Launch 2026', type: 'campaign', client: 'Global Brand', status: 'active', tasks: 4, assignments: 8, plannedHrs: 180, billValue: 23400, costValue: 15300, startDate: '2026-04-01', endDate: '2026-06-30' },
  { id: 'c2', name: 'Performance Max Q2', type: 'campaign', client: 'EcomStore', status: 'active', tasks: 3, assignments: 5, plannedHrs: 120, billValue: 15600, costValue: 10200, startDate: '2026-04-01', endDate: '2026-06-30' },
  { id: 'c3', name: 'Brand Awareness H2', type: 'campaign', client: 'RetailBrand', status: 'planning', tasks: 6, assignments: 2, plannedHrs: 60, billValue: 7800, costValue: 5100, startDate: '2026-07-01', endDate: '2026-12-31' },
];

interface TaskRow {
  id: string; name: string; taskId: string;
  project: string; projectType: 'integrated' | 'campaign';
  source: string; status: 'not-started' | 'in-progress' | 'blocked' | 'done';
  dueDate: string; assignments: number; plannedHrs: number; billValue: number;
}
const TASKS_DATA: TaskRow[] = [
  { id: 't1', name: 'Design System Migration', taskId: 'WF-2201', project: 'Mobile App Redesign', projectType: 'integrated', source: 'Workfront', status: 'in-progress', dueDate: '2026-05-15', assignments: 1, plannedHrs: 80, billValue: 11600 },
  { id: 't2', name: 'Auth Service Refactor', taskId: 'JIRA-884', project: 'Platform Core', projectType: 'integrated', source: 'Jira', status: 'not-started', dueDate: '2026-04-30', assignments: 1, plannedHrs: 40, billValue: 6200 },
  { id: 't3', name: 'ETL Pipeline Hardening', taskId: 'CU-3301', project: 'Data Analytics Platform', projectType: 'integrated', source: 'ClickUp', status: 'in-progress', dueDate: '2026-05-20', assignments: 1, plannedHrs: 120, billValue: 18600 },
  { id: 't4', name: 'SEO Audit & Fixes', taskId: 'ASN-512', project: 'Brand Refresh', projectType: 'integrated', source: 'Asana', status: 'not-started', dueDate: '2026-06-10', assignments: 0, plannedHrs: 0, billValue: 0 },
  { id: 't5', name: 'Back-end Schema Mapping', taskId: 'MON-1101', project: 'PDF Services', projectType: 'integrated', source: 'Monday.com', status: 'blocked', dueDate: '2026-04-25', assignments: 2, plannedHrs: 100, billValue: 15500 },
  { id: 't6', name: 'API Gateway Refactor', taskId: 'JIRA-901', project: 'Platform Core', projectType: 'integrated', source: 'Jira', status: 'in-progress', dueDate: '2026-05-30', assignments: 1, plannedHrs: 60, billValue: 9300 },
  { id: 't7', name: 'Dashboard v2 UI', taskId: 'WF-2210', project: 'Mobile App Redesign', projectType: 'integrated', source: 'Workfront', status: 'not-started', dueDate: '2026-06-15', assignments: 0, plannedHrs: 0, billValue: 0 },
  { id: 't8', name: 'Q2 Creative Assets Production', taskId: 'CAM-301', project: 'Summer Launch 2026', projectType: 'campaign', source: 'Campaign', status: 'in-progress', dueDate: '2026-05-01', assignments: 2, plannedHrs: 70, billValue: 9100 },
  { id: 't9', name: 'Social Media Calendar Setup', taskId: 'CAM-302', project: 'Summer Launch 2026', projectType: 'campaign', source: 'Campaign', status: 'done', dueDate: '2026-04-20', assignments: 0, plannedHrs: 0, billValue: 0 },
  { id: 't10', name: 'Landing Page A/B Testing', taskId: 'CAM-401', project: 'Performance Max Q2', projectType: 'campaign', source: 'Campaign', status: 'not-started', dueDate: '2026-06-05', assignments: 0, plannedHrs: 0, billValue: 0 },
  { id: 't11', name: 'Email Drip Copywriting', taskId: 'CAM-402', project: 'Performance Max Q2', projectType: 'campaign', source: 'Campaign', status: 'in-progress', dueDate: '2026-05-15', assignments: 1, plannedHrs: 30, billValue: 3750 },
];

interface AssignmentRow {
  id: string; assignee: string; assigneeType: 'user' | 'job-role';
  task: string; project: string; jobRole: string;
  plannedHrs: number; actualHrs: number; billRate: number; costRate: number;
  startDate: string; endDate: string; distribution: 'automatic' | 'manual';
  isOverallocated: boolean; hasConflict: boolean;
}
const ASSIGNMENTS_DATA: AssignmentRow[] = [
  { id: 'a1', assignee: 'Michael Chen', assigneeType: 'user', task: 'Design System Migration', project: 'Mobile App Redesign', jobRole: 'UX/UI Designer', plannedHrs: 80, actualHrs: 32, billRate: 145, costRate: 95, startDate: '2026-04-01', endDate: '2026-05-15', distribution: 'automatic', isOverallocated: false, hasConflict: false },
  { id: 'a2', assignee: 'Priya Nair', assigneeType: 'user', task: 'Auth Service Refactor', project: 'Platform Core', jobRole: 'Integration Engineer', plannedHrs: 40, actualHrs: 0, billRate: 155, costRate: 100, startDate: '2026-04-14', endDate: '2026-04-30', distribution: 'automatic', isOverallocated: false, hasConflict: false },
  { id: 'a3', assignee: 'Data Engineer (Role)', assigneeType: 'job-role', task: 'ETL Pipeline Hardening', project: 'Data Analytics Platform', jobRole: 'Data Engineer', plannedHrs: 120, actualHrs: 90, billRate: 155, costRate: 100, startDate: '2026-03-15', endDate: '2026-05-20', distribution: 'manual', isOverallocated: false, hasConflict: false },
  { id: 'a4', assignee: 'Jacob Torres', assigneeType: 'user', task: 'Back-end Schema Mapping', project: 'PDF Services', jobRole: 'Backend Engineer', plannedHrs: 40, actualHrs: 15, billRate: 160, costRate: 105, startDate: '2026-04-07', endDate: '2026-04-25', distribution: 'automatic', isOverallocated: true, hasConflict: true },
  { id: 'a5', assignee: 'Priya Nair', assigneeType: 'user', task: 'Back-end Schema Mapping', project: 'PDF Services', jobRole: 'Integration Engineer', plannedHrs: 60, actualHrs: 20, billRate: 150, costRate: 98, startDate: '2026-04-07', endDate: '2026-04-25', distribution: 'manual', isOverallocated: false, hasConflict: false },
  { id: 'a6', assignee: 'Anita Rao', assigneeType: 'user', task: 'Q2 Creative Assets Production', project: 'Summer Launch 2026', jobRole: 'Content Strategist', plannedHrs: 50, actualHrs: 20, billRate: 130, costRate: 85, startDate: '2026-04-01', endDate: '2026-05-01', distribution: 'automatic', isOverallocated: false, hasConflict: false },
  { id: 'a7', assignee: 'Jacob Torres', assigneeType: 'user', task: 'Q2 Creative Assets Production', project: 'Summer Launch 2026', jobRole: 'Backend Engineer', plannedHrs: 20, actualHrs: 5, billRate: 160, costRate: 105, startDate: '2026-04-10', endDate: '2026-04-30', distribution: 'automatic', isOverallocated: true, hasConflict: true },
  { id: 'a8', assignee: 'Content Strategist (Role)', assigneeType: 'job-role', task: 'Email Drip Copywriting', project: 'Performance Max Q2', jobRole: 'Content Strategist', plannedHrs: 30, actualHrs: 8, billRate: 125, costRate: 80, startDate: '2026-04-14', endDate: '2026-05-15', distribution: 'manual', isOverallocated: false, hasConflict: false },
  { id: 'a9', assignee: 'Marcus Lee', assigneeType: 'user', task: 'API Gateway Refactor', project: 'Platform Core', jobRole: 'DevOps Engineer', plannedHrs: 40, actualHrs: 10, billRate: 165, costRate: 110, startDate: '2026-04-07', endDate: '2026-05-30', distribution: 'automatic', isOverallocated: false, hasConflict: false },
];

interface JobRoleRow {
  role: string; activeAssignments: number; headcount: number;
  totalPlannedHrs: number; avgBillRate: number; avgCostRate: number; utilizationPct: number;
}
const JOB_ROLES_DATA: JobRoleRow[] = [
  { role: 'Backend Engineer',     activeAssignments: 2, headcount: 1, totalPlannedHrs: 60,  avgBillRate: 160, avgCostRate: 105, utilizationPct: 75 },
  { role: 'Frontend Engineer',    activeAssignments: 1, headcount: 1, totalPlannedHrs: 40,  avgBillRate: 140, avgCostRate: 90,  utilizationPct: 50 },
  { role: 'UX/UI Designer',       activeAssignments: 1, headcount: 1, totalPlannedHrs: 80,  avgBillRate: 145, avgCostRate: 95,  utilizationPct: 100 },
  { role: 'Data Engineer',        activeAssignments: 1, headcount: 2, totalPlannedHrs: 120, avgBillRate: 155, avgCostRate: 100, utilizationPct: 75 },
  { role: 'Integration Engineer', activeAssignments: 2, headcount: 1, totalPlannedHrs: 100, avgBillRate: 152, avgCostRate: 99,  utilizationPct: 125 },
  { role: 'Content Strategist',   activeAssignments: 2, headcount: 1, totalPlannedHrs: 80,  avgBillRate: 128, avgCostRate: 83,  utilizationPct: 100 },
  { role: 'Project Manager',      activeAssignments: 1, headcount: 1, totalPlannedHrs: 30,  avgBillRate: 135, avgCostRate: 88,  utilizationPct: 38 },
  { role: 'QA Engineer',          activeAssignments: 0, headcount: 1, totalPlannedHrs: 0,   avgBillRate: 120, avgCostRate: 78,  utilizationPct: 0 },
  { role: 'DevOps Engineer',      activeAssignments: 1, headcount: 1, totalPlannedHrs: 40,  avgBillRate: 165, avgCostRate: 110, utilizationPct: 50 },
  { role: 'Full-Stack Developer', activeAssignments: 0, headcount: 2, totalPlannedHrs: 0,   avgBillRate: 150, avgCostRate: 98,  utilizationPct: 0 },
];

interface UserRow {
  id: string; name: string; email: string; jobRole: string;
  activeAssignments: number; weeklyLoadHrs: number; totalPlannedHrs: number;
  billValue: number; utilizationPct: number; hasConflict: boolean; isOverallocated: boolean;
}
const USERS_DATA: UserRow[] = [
  { id: 'u1', name: 'Jacob Torres',  email: 'jacob@agency.com',  jobRole: 'Backend Engineer',     activeAssignments: 2, weeklyLoadHrs: 45.2, totalPlannedHrs: 60,  billValue: 9600,  utilizationPct: 113, hasConflict: true,  isOverallocated: true  },
  { id: 'u2', name: 'Priya Nair',    email: 'priya@agency.com',  jobRole: 'Integration Engineer', activeAssignments: 2, weeklyLoadHrs: 38.1, totalPlannedHrs: 100, billValue: 15300, utilizationPct: 95,  hasConflict: false, isOverallocated: false },
  { id: 'u3', name: 'Michael Chen',  email: 'mchen@agency.com',  jobRole: 'UX/UI Designer',       activeAssignments: 1, weeklyLoadHrs: 32.0, totalPlannedHrs: 80,  billValue: 11600, utilizationPct: 80,  hasConflict: false, isOverallocated: false },
  { id: 'u4', name: 'Anita Rao',     email: 'anita@agency.com',  jobRole: 'Content Strategist',   activeAssignments: 1, weeklyLoadHrs: 20.0, totalPlannedHrs: 50,  billValue: 6500,  utilizationPct: 50,  hasConflict: false, isOverallocated: false },
  { id: 'u5', name: 'Marcus Lee',    email: 'marcus@agency.com', jobRole: 'DevOps Engineer',      activeAssignments: 1, weeklyLoadHrs: 20.0, totalPlannedHrs: 40,  billValue: 6600,  utilizationPct: 50,  hasConflict: false, isOverallocated: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function TrendBadge({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${positive ? 'text-emerald-600' : 'text-red-500'}`}
    >
      {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {positive ? '+' : ''}
      {value}%
    </span>
  );
}

function KpiCard({
  title,
  value,
  unit,
  trend,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  unit: string;
  trend: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {value}
              <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
            </p>
            <div className="mt-2">
              <TrendBadge value={trend} />
              <span className="text-xs text-gray-400 ml-1">vs prev period</span>
            </div>
          </div>
          <div className={`p-2.5 rounded-lg ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ title, value, sub, color }: { title: string; value: string; sub: string; color: 'emerald' | 'blue' | 'purple' | 'amber' }) {
  const colors = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-600' },
    purple:  { bg: 'bg-purple-50',  text: 'text-purple-600' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600' },
  };
  return (
    <div className={`rounded-xl p-4 ${colors[color].bg}`}>
      <div className={`text-2xl font-bold ${colors[color].text}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{title}</div>
      <div className="text-xs text-gray-400">{sub}</div>
    </div>
  );
}

// ─── Period panel content ─────────────────────────────────────────────────────

function PeriodPanel({ period }: { period: string }) {
  const data = kpiData[period];
  const stats = summaryStats[period];

  return (
    <div className="space-y-6 pt-4">
      {/* KPI summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Planned Hours"
          value={stats.totalPlanned.toLocaleString()}
          unit={stats.plannedUnit}
          trend={stats.plannedTrend}
          icon={Clock}
          color="bg-blue-500"
        />
        <KpiCard
          title="Avg Bill Rate"
          value={`$${stats.avgBillRate}`}
          unit="/ hr"
          trend={stats.billTrend}
          icon={DollarSign}
          color="bg-emerald-500"
        />
        <KpiCard
          title="Avg Cost Rate"
          value={`$${stats.avgCostRate}`}
          unit="/ hr"
          trend={stats.costTrend}
          icon={Activity}
          color="bg-purple-500"
        />
      </div>

      {/* Planned Hours bar chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Planned Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(v: number) => [`${v.toLocaleString()} hrs`, 'Planned']}
              />
              <Bar dataKey="planned" name="Planned Hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bill Rate vs Cost Rate line chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Bill Rate vs Cost Rate ($/hr)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number, name: string) => [`$${v}`, name]} />
              <Legend />
              <Line
                type="monotone"
                dataKey="bill"
                name="Bill Rate"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="cost"
                name="Cost Rate"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Margin table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Rate Margin Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Period</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">Planned Hrs</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">Bill Rate</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">Cost Rate</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">Margin</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">Margin %</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => {
                  const margin = row.bill - row.cost;
                  const marginPct = ((margin / row.bill) * 100).toFixed(1);
                  return (
                    <tr key={row.label} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-gray-800">{row.label}</td>
                      <td className="py-2.5 px-3 text-right text-gray-700">
                        {row.planned.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-600 font-medium">
                        ${row.bill}
                      </td>
                      <td className="py-2.5 px-3 text-right text-purple-600 font-medium">
                        ${row.cost}
                      </td>
                      <td className="py-2.5 px-3 text-right text-blue-600 font-medium">
                        ${margin}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Badge
                          variant={Number(marginPct) >= 30 ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {marginPct}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Projects Section ─────────────────────────────────────────────────────────

function ProjectsSection() {
  const [typeFilter, setTypeFilter] = useState<'all' | 'integrated' | 'campaign'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'active' | 'planning' | 'ending-soon' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'bill-desc' | 'planned-desc' | 'margin-desc' | 'tasks-desc'>('default');

  const uniqueClients = useMemo(() => Array.from(new Set(PROJECTS_DATA.map(p => p.client))), []);

  const today = new Date();
  const in30Days = new Date(today);
  in30Days.setDate(today.getDate() + 30);

  const filtered = useMemo(() => {
    let result = PROJECTS_DATA.filter(p => {
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (clientFilter !== 'all' && p.client !== clientFilter) return false;
      if (dateFilter !== 'all') {
        if (dateFilter === 'active' && p.status !== 'active') return false;
        if (dateFilter === 'planning' && p.status !== 'planning') return false;
        if (dateFilter === 'completed' && p.status !== 'completed') return false;
        if (dateFilter === 'ending-soon') {
          const end = new Date(p.endDate);
          if (end > in30Days || end < today) return false;
        }
      }
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.client.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    if (sortBy === 'bill-desc') result = [...result].sort((a, b) => b.billValue - a.billValue);
    else if (sortBy === 'planned-desc') result = [...result].sort((a, b) => b.plannedHrs - a.plannedHrs);
    else if (sortBy === 'margin-desc') result = [...result].sort((a, b) => {
      const mA = a.billValue > 0 ? (a.billValue - a.costValue) / a.billValue : 0;
      const mB = b.billValue > 0 ? (b.billValue - b.costValue) / b.billValue : 0;
      return mB - mA;
    });
    else if (sortBy === 'tasks-desc') result = [...result].sort((a, b) => b.tasks - a.tasks);

    return result;
  }, [typeFilter, statusFilter, clientFilter, dateFilter, sortBy, search]);

  const totalBill    = filtered.reduce((s, p) => s + p.billValue, 0);
  const totalCost    = filtered.reduce((s, p) => s + p.costValue, 0);
  const totalPlanned = filtered.reduce((s, p) => s + p.plannedHrs, 0);
  const margin       = totalBill - totalCost;
  const marginPct    = totalBill > 0 ? (margin / totalBill) * 100 : 0;

  const hasFilters = typeFilter !== 'all' || statusFilter !== 'all' || clientFilter !== 'all' || dateFilter !== 'all' || sortBy !== 'default' || !!search;

  return (
    <div className="space-y-4 pt-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search projects or clients…" value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-9" />
        </div>
        <Select value={typeFilter} onValueChange={v => setTypeFilter(v as typeof typeFilter)}>
          <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="integrated">Integrated</SelectItem>
            <SelectItem value="campaign">Campaign</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {uniqueClients.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={v => setDateFilter(v as typeof dateFilter)}>
          <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="ending-soon">Ending Soon (30d)</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={v => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-44 h-9">
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3 h-3 text-gray-400" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default Order</SelectItem>
            <SelectItem value="bill-desc">Bill Value (High)</SelectItem>
            <SelectItem value="planned-desc">Planned Hrs (High)</SelectItem>
            <SelectItem value="margin-desc">Margin % (High)</SelectItem>
            <SelectItem value="tasks-desc">Tasks (High)</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="text-xs h-9 px-3 flex items-center">{filtered.length} projects</Badge>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="gap-1 h-9 text-gray-500" onClick={() => { setTypeFilter('all'); setStatusFilter('all'); setClientFilter('all'); setDateFilter('all'); setSortBy('default'); setSearch(''); }}>
            <X className="w-3.5 h-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="Total Bill Value"  value={`$${(totalBill/1000).toFixed(0)}k`}    sub={`${filtered.length} projects`} color="emerald" />
        <StatCard title="Total Cost Value"  value={`$${(totalCost/1000).toFixed(0)}k`}    sub="blended cost"                  color="purple" />
        <StatCard title="Blended Margin"    value={`${marginPct.toFixed(1)}%`}            sub={`$${(margin/1000).toFixed(0)}k`} color="blue" />
        <StatCard title="Planned Hours"     value={`${totalPlanned.toLocaleString()}h`}   sub="across active"                 color="amber" />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Project</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tasks</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Assignments</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Planned Hrs</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Bill Value</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Margin %</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-10 text-gray-400 text-sm">No projects match your filters.</td></tr>
                ) : filtered.map(p => {
                  const pMarginPct = p.billValue > 0 ? ((p.billValue - p.costValue) / p.billValue * 100) : 0;
                  return (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {p.type === 'campaign'
                            ? <Megaphone className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                            : <FolderKanban className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                          <span className="font-medium text-gray-900">{p.name}</span>
                        </div>
                        <div className="text-xs text-gray-400 ml-5">{p.startDate} → {p.endDate}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={`text-xs ${p.type === 'campaign' ? 'border-orange-200 text-orange-700' : 'border-blue-200 text-blue-700'}`}>
                          {p.type === 'campaign' ? 'Campaign' : 'Integrated'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{p.client}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={p.status === 'active' ? 'default' : p.status === 'completed' ? 'secondary' : p.status === 'on-hold' ? 'destructive' : 'outline'}
                          className="text-xs capitalize"
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">{p.tasks}</td>
                      <td className="py-3 px-4 text-right text-gray-700">{p.assignments}</td>
                      <td className="py-3 px-4 text-right text-gray-700">{p.plannedHrs.toLocaleString()}h</td>
                      <td className="py-3 px-4 text-right text-emerald-600 font-medium">${(p.billValue/1000).toFixed(1)}k</td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant={pMarginPct >= 30 ? 'default' : 'secondary'} className="text-xs">{pMarginPct.toFixed(1)}%</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tasks Section ────────────────────────────────────────────────────────────

function TasksSection() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [projectTypeFilter, setProjectTypeFilter] = useState<'all' | 'integrated' | 'campaign'>('all');
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [assignedFilter, setAssignedFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [dueDateFilter, setDueDateFilter] = useState<'all' | 'overdue' | 'this-week' | 'this-month'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'due-asc' | 'bill-desc' | 'planned-desc'>('default');

  const today = new Date().toISOString().split('T')[0];
  const todayDate = new Date(today);
  const weekEnd = new Date(todayDate);
  weekEnd.setDate(todayDate.getDate() + 7);
  const monthEnd = new Date(todayDate);
  monthEnd.setDate(todayDate.getDate() + 30);

  const uniqueProjects = useMemo(() => Array.from(new Set(TASKS_DATA.map(t => t.project))), []);
  const sources = Array.from(new Set(TASKS_DATA.map(t => t.source)));

  const filtered = useMemo(() => {
    let result = TASKS_DATA.filter(t => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (sourceFilter !== 'all' && t.source !== sourceFilter) return false;
      if (projectTypeFilter !== 'all' && t.projectType !== projectTypeFilter) return false;
      if (projectFilter !== 'all' && t.project !== projectFilter) return false;
      if (assignedFilter === 'assigned' && t.assignments === 0) return false;
      if (assignedFilter === 'unassigned' && t.assignments > 0) return false;
      if (dueDateFilter !== 'all') {
        const due = new Date(t.dueDate);
        if (dueDateFilter === 'overdue' && due >= todayDate) return false;
        if (dueDateFilter === 'this-week' && (due < todayDate || due > weekEnd)) return false;
        if (dueDateFilter === 'this-month' && (due < todayDate || due > monthEnd)) return false;
      }
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.project.toLowerCase().includes(search.toLowerCase()) && !t.taskId.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    if (sortBy === 'due-asc') result = [...result].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    else if (sortBy === 'bill-desc') result = [...result].sort((a, b) => b.billValue - a.billValue);
    else if (sortBy === 'planned-desc') result = [...result].sort((a, b) => b.plannedHrs - a.plannedHrs);

    return result;
  }, [statusFilter, sourceFilter, projectTypeFilter, projectFilter, assignedFilter, dueDateFilter, sortBy, search]);

  const totalBill    = filtered.reduce((s, t) => s + t.billValue, 0);
  const totalPlanned = filtered.reduce((s, t) => s + t.plannedHrs, 0);
  const totalAssigned = filtered.reduce((s, t) => s + t.assignments, 0);
  const unassigned    = filtered.filter(t => t.assignments === 0).length;

  const statusColor: Record<string, string> = {
    'not-started': 'text-gray-500',
    'in-progress':  'text-blue-600',
    'blocked':      'text-red-600',
    'done':         'text-emerald-600',
  };

  const hasFilters = statusFilter !== 'all' || sourceFilter !== 'all' || projectTypeFilter !== 'all' || projectFilter !== 'all' || assignedFilter !== 'all' || dueDateFilter !== 'all' || sortBy !== 'default' || !!search;

  return (
    <div className="space-y-4 pt-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search tasks, IDs, projects…" value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="not-started">Not Started</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={projectTypeFilter} onValueChange={v => setProjectTypeFilter(v as typeof projectTypeFilter)}>
          <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="integrated">Integrated</SelectItem>
            <SelectItem value="campaign">Campaign</SelectItem>
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {uniqueProjects.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={assignedFilter} onValueChange={v => setAssignedFilter(v as typeof assignedFilter)}>
          <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignments</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dueDateFilter} onValueChange={v => setDueDateFilter(v as typeof dueDateFilter)}>
          <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Due Dates</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="this-week">This Week</SelectItem>
            <SelectItem value="this-month">This Month</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={v => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-44 h-9">
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3 h-3 text-gray-400" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default Order</SelectItem>
            <SelectItem value="due-asc">Due Date (Soonest)</SelectItem>
            <SelectItem value="bill-desc">Bill Value (High)</SelectItem>
            <SelectItem value="planned-desc">Planned Hrs (High)</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="gap-1 h-9 text-gray-500" onClick={() => { setStatusFilter('all'); setSourceFilter('all'); setProjectTypeFilter('all'); setProjectFilter('all'); setAssignedFilter('all'); setDueDateFilter('all'); setSortBy('default'); setSearch(''); }}>
            <X className="w-3.5 h-3.5" /> Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="Total Bill Value"    value={`$${(totalBill/1000).toFixed(1)}k`}     sub={`${filtered.length} tasks`}         color="emerald" />
        <StatCard title="Total Planned Hours" value={`${totalPlanned.toLocaleString()}h`}     sub="planned across tasks"               color="blue" />
        <StatCard title="Total Assignments"   value={String(totalAssigned)}                   sub="resource assignments"               color="purple" />
        <StatCard title="Unassigned Tasks"    value={String(unassigned)}                      sub="need assignment"                    color="amber" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Task</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Project</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Source</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Due</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Assignments</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Planned Hrs</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Bill Value</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-sm">No tasks match your filters.</td></tr>
                ) : filtered.map(t => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {t.projectType === 'campaign'
                          ? <Megaphone className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          : <ClipboardList className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                        <span className="font-medium text-gray-900">{t.name}</span>
                      </div>
                      <div className="text-xs text-gray-400 ml-5">{t.taskId}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{t.project}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs">{t.source}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium capitalize ${statusColor[t.status] ?? 'text-gray-500'}`}>
                        {t.status === 'not-started' ? 'Not Started' : t.status === 'in-progress' ? 'In Progress' : t.status === 'blocked' ? 'Blocked' : 'Done'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">{t.dueDate}</td>
                    <td className="py-3 px-4 text-right">
                      {t.assignments === 0
                        ? <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">Unassigned</Badge>
                        : <span className="text-gray-700">{t.assignments}</span>}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">{t.plannedHrs > 0 ? `${t.plannedHrs}h` : '—'}</td>
                    <td className="py-3 px-4 text-right text-emerald-600 font-medium">{t.billValue > 0 ? `$${(t.billValue/1000).toFixed(1)}k` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Assignments Section ──────────────────────────────────────────────────────

function AssignmentsSection() {
  const [assigneeTypeFilter, setAssigneeTypeFilter] = useState<'all' | 'user' | 'job-role'>('all');
  const [jobRoleFilter, setJobRoleFilter] = useState<string>('all');
  const [overallocationFilter, setOverallocationFilter] = useState<'all' | 'overallocated' | 'conflict'>('all');
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [distributionFilter, setDistributionFilter] = useState<'all' | 'automatic' | 'manual'>('all');
  const [burnFilter, setBurnFilter] = useState<'all' | 'not-started' | 'on-track' | 'high-burn' | 'complete'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'planned-desc' | 'bill-desc' | 'margin-desc' | 'burn-desc'>('default');

  const uniqueRoles = Array.from(new Set(ASSIGNMENTS_DATA.map(a => a.jobRole)));
  const uniqueProjects = useMemo(() => Array.from(new Set(ASSIGNMENTS_DATA.map(a => a.project))), []);

  const filtered = useMemo(() => {
    let result = ASSIGNMENTS_DATA.filter(a => {
      if (assigneeTypeFilter !== 'all' && a.assigneeType !== assigneeTypeFilter) return false;
      if (jobRoleFilter !== 'all' && a.jobRole !== jobRoleFilter) return false;
      if (overallocationFilter === 'overallocated' && !a.isOverallocated) return false;
      if (overallocationFilter === 'conflict' && !a.hasConflict) return false;
      if (projectFilter !== 'all' && a.project !== projectFilter) return false;
      if (distributionFilter !== 'all' && a.distribution !== distributionFilter) return false;
      if (burnFilter !== 'all') {
        const burnPct = a.plannedHrs > 0 ? (a.actualHrs / a.plannedHrs) * 100 : 0;
        if (burnFilter === 'not-started' && a.actualHrs !== 0) return false;
        if (burnFilter === 'on-track' && !(burnPct >= 1 && burnPct < 75)) return false;
        if (burnFilter === 'high-burn' && !(burnPct >= 75 && burnPct < 100)) return false;
        if (burnFilter === 'complete' && burnPct < 100) return false;
      }
      if (search && !a.assignee.toLowerCase().includes(search.toLowerCase()) && !a.task.toLowerCase().includes(search.toLowerCase()) && !a.project.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    if (sortBy === 'planned-desc') result = [...result].sort((a, b) => b.plannedHrs - a.plannedHrs);
    else if (sortBy === 'bill-desc') result = [...result].sort((a, b) => (b.plannedHrs * b.billRate) - (a.plannedHrs * a.billRate));
    else if (sortBy === 'margin-desc') result = [...result].sort((a, b) => {
      const mA = a.billRate > 0 ? (a.billRate - a.costRate) / a.billRate : 0;
      const mB = b.billRate > 0 ? (b.billRate - b.costRate) / b.billRate : 0;
      return mB - mA;
    });
    else if (sortBy === 'burn-desc') result = [...result].sort((a, b) => {
      const bA = a.plannedHrs > 0 ? (a.actualHrs / a.plannedHrs) * 100 : 0;
      const bB = b.plannedHrs > 0 ? (b.actualHrs / b.plannedHrs) * 100 : 0;
      return bB - bA;
    });

    return result;
  }, [assigneeTypeFilter, jobRoleFilter, overallocationFilter, projectFilter, distributionFilter, burnFilter, sortBy, search]);

  const totalPlanned  = filtered.reduce((s, a) => s + a.plannedHrs, 0);
  const totalBill     = filtered.reduce((s, a) => s + a.plannedHrs * a.billRate, 0);
  const totalCost     = filtered.reduce((s, a) => s + a.plannedHrs * a.costRate, 0);
  const margin        = totalBill - totalCost;
  const marginPct     = totalBill > 0 ? (margin / totalBill) * 100 : 0;

  const hasFilters = assigneeTypeFilter !== 'all' || jobRoleFilter !== 'all' || overallocationFilter !== 'all' || projectFilter !== 'all' || distributionFilter !== 'all' || burnFilter !== 'all' || sortBy !== 'default' || !!search;

  return (
    <div className="space-y-4 pt-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search assignee, task, project…" value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-9" />
        </div>
        <Select value={assigneeTypeFilter} onValueChange={v => setAssigneeTypeFilter(v as typeof assigneeTypeFilter)}>
          <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="job-role">Job Role</SelectItem>
          </SelectContent>
        </Select>
        <Select value={jobRoleFilter} onValueChange={setJobRoleFilter}>
          <SelectTrigger className="w-48 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {uniqueRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={overallocationFilter} onValueChange={v => setOverallocationFilter(v as typeof overallocationFilter)}>
          <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="overallocated">Overallocated</SelectItem>
            <SelectItem value="conflict">Has Conflict</SelectItem>
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {uniqueProjects.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={distributionFilter} onValueChange={v => setDistributionFilter(v as typeof distributionFilter)}>
          <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Distribution</SelectItem>
            <SelectItem value="automatic">Automatic</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
        <Select value={burnFilter} onValueChange={v => setBurnFilter(v as typeof burnFilter)}>
          <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Burn Status</SelectItem>
            <SelectItem value="not-started">Not Started</SelectItem>
            <SelectItem value="on-track">On Track (1–75%)</SelectItem>
            <SelectItem value="high-burn">High Burn (75–100%)</SelectItem>
            <SelectItem value="complete">Complete (≥100%)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={v => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-44 h-9">
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3 h-3 text-gray-400" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default Order</SelectItem>
            <SelectItem value="planned-desc">Planned Hrs (High)</SelectItem>
            <SelectItem value="bill-desc">Bill Value (High)</SelectItem>
            <SelectItem value="margin-desc">Margin % (High)</SelectItem>
            <SelectItem value="burn-desc">Burn % (High)</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="gap-1 h-9 text-gray-500" onClick={() => { setAssigneeTypeFilter('all'); setJobRoleFilter('all'); setOverallocationFilter('all'); setProjectFilter('all'); setDistributionFilter('all'); setBurnFilter('all'); setSortBy('default'); setSearch(''); }}>
            <X className="w-3.5 h-3.5" /> Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="Total Bill Value"  value={`$${(totalBill/1000).toFixed(1)}k`}   sub={`${filtered.length} assignments`} color="emerald" />
        <StatCard title="Total Cost Value"  value={`$${(totalCost/1000).toFixed(1)}k`}   sub="blended cost"                     color="purple" />
        <StatCard title="Blended Margin"    value={`${marginPct.toFixed(1)}%`}           sub={`$${(margin/1000).toFixed(1)}k`}  color="blue" />
        <StatCard title="Planned Hours"     value={`${totalPlanned.toLocaleString()}h`}  sub="total planned"                    color="amber" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Assignee</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Task</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Project</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Job Role</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Planned</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actual / Burn</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Bill Rate</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cost Rate</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Margin</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-10 text-gray-400 text-sm">No assignments match your filters.</td></tr>
                ) : filtered.map(a => {
                  const marginVal = a.billRate - a.costRate;
                  const marginP   = a.billRate > 0 ? (marginVal / a.billRate * 100) : 0;
                  const burnPct   = a.plannedHrs > 0 ? Math.min(100, (a.actualHrs / a.plannedHrs) * 100) : 0;
                  const rowClass  = a.hasConflict ? 'bg-red-50/40' : a.isOverallocated ? 'bg-amber-50/40' : '';
                  return (
                    <tr key={a.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${rowClass}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-sm">{a.assignee}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {a.isOverallocated && (
                            <Badge variant="destructive" className="text-xs gap-0.5 py-0">
                              <AlertTriangle className="w-2.5 h-2.5" /> Over
                            </Badge>
                          )}
                          {a.hasConflict && (
                            <Badge className="text-xs gap-0.5 py-0 bg-red-100 text-red-700">
                              <AlertTriangle className="w-2.5 h-2.5" /> Conflict
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-600">{a.task}</td>
                      <td className="py-3 px-4 text-xs text-gray-600">{a.project}</td>
                      <td className="py-3 px-4 text-xs text-gray-500">{a.jobRole}</td>
                      <td className="py-3 px-4 text-right text-gray-700">{a.plannedHrs}h</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-gray-500">{a.actualHrs}h</span>
                          <div className="w-16">
                            <Progress value={burnPct} className="h-1.5" />
                          </div>
                          <span className="text-xs text-gray-400">{burnPct.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-600 font-medium">${a.billRate}</td>
                      <td className="py-3 px-4 text-right text-purple-600 font-medium">${a.costRate}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant={marginP >= 30 ? 'default' : 'secondary'} className="text-xs">{marginP.toFixed(1)}%</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs capitalize">{a.distribution}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Job Roles Section ────────────────────────────────────────────────────────

function JobRolesSection() {
  const [utilizationFilter, setUtilizationFilter] = useState<'all' | 'overloaded' | 'available' | 'idle'>('all');
  const [search, setSearch] = useState('');
  const [marginFilter, setMarginFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'utilization-desc' | 'utilization-asc' | 'bill-desc' | 'planned-desc' | 'margin-desc' | 'headcount-desc'>('default');

  const filtered = useMemo(() => {
    let result = JOB_ROLES_DATA.filter(r => {
      if (utilizationFilter === 'overloaded' && r.utilizationPct <= 100) return false;
      if (utilizationFilter === 'available' && (r.utilizationPct < 50 || r.utilizationPct > 100)) return false;
      if (utilizationFilter === 'idle' && r.utilizationPct >= 50) return false;
      if (marginFilter !== 'all') {
        const mPct = r.avgBillRate > 0 ? ((r.avgBillRate - r.avgCostRate) / r.avgBillRate * 100) : 0;
        if (marginFilter === 'high' && mPct < 35) return false;
        if (marginFilter === 'medium' && (mPct < 25 || mPct >= 35)) return false;
        if (marginFilter === 'low' && mPct >= 25) return false;
      }
      if (search && !r.role.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    if (sortBy === 'utilization-desc') result = [...result].sort((a, b) => b.utilizationPct - a.utilizationPct);
    else if (sortBy === 'utilization-asc') result = [...result].sort((a, b) => a.utilizationPct - b.utilizationPct);
    else if (sortBy === 'bill-desc') result = [...result].sort((a, b) => b.avgBillRate - a.avgBillRate);
    else if (sortBy === 'planned-desc') result = [...result].sort((a, b) => b.totalPlannedHrs - a.totalPlannedHrs);
    else if (sortBy === 'margin-desc') result = [...result].sort((a, b) => {
      const mA = a.avgBillRate > 0 ? (a.avgBillRate - a.avgCostRate) / a.avgBillRate : 0;
      const mB = b.avgBillRate > 0 ? (b.avgBillRate - b.avgCostRate) / b.avgBillRate : 0;
      return mB - mA;
    });
    else if (sortBy === 'headcount-desc') result = [...result].sort((a, b) => b.headcount - a.headcount);

    return result;
  }, [utilizationFilter, marginFilter, sortBy, search]);

  const totalPlanned  = filtered.reduce((s, r) => s + r.totalPlannedHrs, 0);
  const avgBill       = filtered.length > 0 ? filtered.reduce((s, r) => s + r.avgBillRate, 0) / filtered.length : 0;
  const avgCost       = filtered.length > 0 ? filtered.reduce((s, r) => s + r.avgCostRate, 0) / filtered.length : 0;
  const overloaded    = filtered.filter(r => r.utilizationPct > 100).length;

  function utilizationColor(pct: number): string {
    if (pct > 100) return 'text-red-600';
    if (pct >= 75) return 'text-amber-600';
    if (pct >= 50) return 'text-emerald-600';
    return 'text-gray-400';
  }

  function utilizationBarClass(pct: number): string {
    if (pct > 100) return '[&>div]:bg-red-500';
    if (pct >= 75) return '[&>div]:bg-amber-500';
    if (pct >= 50) return '[&>div]:bg-emerald-500';
    return '[&>div]:bg-gray-300';
  }

  const hasFilters = utilizationFilter !== 'all' || marginFilter !== 'all' || sortBy !== 'default' || !!search;

  return (
    <div className="space-y-4 pt-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search job roles…" value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-9" />
        </div>
        <Select value={utilizationFilter} onValueChange={v => setUtilizationFilter(v as typeof utilizationFilter)}>
          <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Utilization</SelectItem>
            <SelectItem value="overloaded">Overloaded (&gt;100%)</SelectItem>
            <SelectItem value="available">Available (50-100%)</SelectItem>
            <SelectItem value="idle">Idle (&lt;50%)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={marginFilter} onValueChange={v => setMarginFilter(v as typeof marginFilter)}>
          <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Margins</SelectItem>
            <SelectItem value="high">High (≥35%)</SelectItem>
            <SelectItem value="medium">Medium (25–35%)</SelectItem>
            <SelectItem value="low">Low (&lt;25%)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={v => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-44 h-9">
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3 h-3 text-gray-400" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default Order</SelectItem>
            <SelectItem value="utilization-desc">Utilization (High)</SelectItem>
            <SelectItem value="utilization-asc">Utilization (Low)</SelectItem>
            <SelectItem value="bill-desc">Bill Rate (High)</SelectItem>
            <SelectItem value="planned-desc">Planned Hrs (High)</SelectItem>
            <SelectItem value="margin-desc">Margin % (High)</SelectItem>
            <SelectItem value="headcount-desc">Headcount (High)</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="gap-1 h-9 text-gray-500" onClick={() => { setUtilizationFilter('all'); setMarginFilter('all'); setSortBy('default'); setSearch(''); }}>
            <X className="w-3.5 h-3.5" /> Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="Total Planned Hours" value={`${totalPlanned}h`}            sub={`${filtered.length} roles`}         color="blue" />
        <StatCard title="Avg Bill Rate"        value={`$${avgBill.toFixed(0)}/hr`}  sub="blended across roles"               color="emerald" />
        <StatCard title="Avg Cost Rate"        value={`$${avgCost.toFixed(0)}/hr`}  sub="blended across roles"               color="purple" />
        <StatCard title="Overloaded Roles"     value={String(overloaded)}            sub="utilization > 100%"                 color="amber" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Active Assignments</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Headcount</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Planned Hrs</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg Bill Rate</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg Cost Rate</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg Margin %</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-sm">No job roles match your filters.</td></tr>
                ) : filtered.map(r => {
                  const mPct = r.avgBillRate > 0 ? ((r.avgBillRate - r.avgCostRate) / r.avgBillRate * 100) : 0;
                  return (
                    <tr key={r.role} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="font-medium text-gray-900">{r.role}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">{r.activeAssignments}</td>
                      <td className="py-3 px-4 text-right text-gray-700">{r.headcount}</td>
                      <td className="py-3 px-4 text-right text-gray-700">{r.totalPlannedHrs > 0 ? `${r.totalPlannedHrs}h` : '—'}</td>
                      <td className="py-3 px-4 text-right text-emerald-600 font-medium">${r.avgBillRate}/hr</td>
                      <td className="py-3 px-4 text-right text-purple-600 font-medium">${r.avgCostRate}/hr</td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant={mPct >= 30 ? 'default' : 'secondary'} className="text-xs">{mPct.toFixed(1)}%</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Progress value={Math.min(100, r.utilizationPct)} className={`h-2 w-24 ${utilizationBarClass(r.utilizationPct)}`} />
                          <span className={`text-xs font-semibold ${utilizationColor(r.utilizationPct)}`}>
                            {r.utilizationPct}%
                            {r.utilizationPct > 100 && <AlertTriangle className="w-3 h-3 inline ml-1" />}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Users Section ────────────────────────────────────────────────────────────

function UsersSection() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'overallocated' | 'conflict' | 'normal'>('all');
  const [jobRoleFilter, setJobRoleFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [utilizationBracket, setUtilizationBracket] = useState<'all' | 'idle' | 'normal' | 'busy' | 'over'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'util-desc' | 'util-asc' | 'planned-desc' | 'bill-desc' | 'weekly-desc' | 'name-asc'>('default');

  const uniqueRoles = Array.from(new Set(USERS_DATA.map(u => u.jobRole)));

  const filtered = useMemo(() => {
    let result = USERS_DATA.filter(u => {
      if (statusFilter === 'overallocated' && !u.isOverallocated) return false;
      if (statusFilter === 'conflict' && !u.hasConflict) return false;
      if (statusFilter === 'normal' && (u.isOverallocated || u.hasConflict)) return false;
      if (jobRoleFilter !== 'all' && u.jobRole !== jobRoleFilter) return false;
      if (utilizationBracket !== 'all') {
        if (utilizationBracket === 'idle' && u.utilizationPct >= 50) return false;
        if (utilizationBracket === 'normal' && (u.utilizationPct < 50 || u.utilizationPct > 80)) return false;
        if (utilizationBracket === 'busy' && (u.utilizationPct <= 80 || u.utilizationPct > 100)) return false;
        if (utilizationBracket === 'over' && u.utilizationPct <= 100) return false;
      }
      if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    if (sortBy === 'util-desc') result = [...result].sort((a, b) => b.utilizationPct - a.utilizationPct);
    else if (sortBy === 'util-asc') result = [...result].sort((a, b) => a.utilizationPct - b.utilizationPct);
    else if (sortBy === 'planned-desc') result = [...result].sort((a, b) => b.totalPlannedHrs - a.totalPlannedHrs);
    else if (sortBy === 'bill-desc') result = [...result].sort((a, b) => b.billValue - a.billValue);
    else if (sortBy === 'weekly-desc') result = [...result].sort((a, b) => b.weeklyLoadHrs - a.weeklyLoadHrs);
    else if (sortBy === 'name-asc') result = [...result].sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [statusFilter, jobRoleFilter, utilizationBracket, sortBy, search]);

  const totalBill     = filtered.reduce((s, u) => s + u.billValue, 0);
  const totalPlanned  = filtered.reduce((s, u) => s + u.totalPlannedHrs, 0);
  const avgUtil       = filtered.length > 0 ? filtered.reduce((s, u) => s + u.utilizationPct, 0) / filtered.length : 0;
  const overloaded    = filtered.filter(u => u.isOverallocated).length;

  function utilizationColor(pct: number): string {
    if (pct > 100) return 'text-red-600';
    if (pct >= 75)  return 'text-amber-600';
    if (pct >= 50)  return 'text-emerald-600';
    return 'text-gray-400';
  }

  function utilizationBarClass(pct: number): string {
    if (pct > 100) return '[&>div]:bg-red-500';
    if (pct >= 75) return '[&>div]:bg-amber-500';
    if (pct >= 50) return '[&>div]:bg-emerald-500';
    return '[&>div]:bg-gray-300';
  }

  const hasFilters = statusFilter !== 'all' || jobRoleFilter !== 'all' || utilizationBracket !== 'all' || sortBy !== 'default' || !!search;

  return (
    <div className="space-y-4 pt-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-9" />
        </div>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="overallocated">Overallocated</SelectItem>
            <SelectItem value="conflict">Has Conflict</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
          </SelectContent>
        </Select>
        <Select value={jobRoleFilter} onValueChange={setJobRoleFilter}>
          <SelectTrigger className="w-48 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {uniqueRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={utilizationBracket} onValueChange={v => setUtilizationBracket(v as typeof utilizationBracket)}>
          <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Utilization</SelectItem>
            <SelectItem value="idle">Idle (&lt;50%)</SelectItem>
            <SelectItem value="normal">Normal (50–80%)</SelectItem>
            <SelectItem value="busy">Busy (80–100%)</SelectItem>
            <SelectItem value="over">Over (&gt;100%)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={v => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-44 h-9">
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3 h-3 text-gray-400" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default Order</SelectItem>
            <SelectItem value="util-desc">Utilization (High)</SelectItem>
            <SelectItem value="util-asc">Utilization (Low)</SelectItem>
            <SelectItem value="planned-desc">Planned Hrs (High)</SelectItem>
            <SelectItem value="bill-desc">Bill Value (High)</SelectItem>
            <SelectItem value="weekly-desc">Weekly Load (High)</SelectItem>
            <SelectItem value="name-asc">Name (A–Z)</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="gap-1 h-9 text-gray-500" onClick={() => { setStatusFilter('all'); setJobRoleFilter('all'); setUtilizationBracket('all'); setSortBy('default'); setSearch(''); }}>
            <X className="w-3.5 h-3.5" /> Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="Total Bill Value"    value={`$${(totalBill/1000).toFixed(1)}k`}  sub={`${filtered.length} users`}    color="emerald" />
        <StatCard title="Total Planned Hours" value={`${totalPlanned}h`}                   sub="across all users"              color="blue" />
        <StatCard title="Avg Utilization"     value={`${avgUtil.toFixed(0)}%`}             sub="of 40h/week capacity"          color="purple" />
        <StatCard title="Overallocated"       value={String(overloaded)}                   sub="users over capacity"           color="amber" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Assignments</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Weekly Load</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Planned Hrs</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Utilization</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Bill Value</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-10 text-gray-400 text-sm">No users match your filters.</td></tr>
                ) : filtered.map(u => (
                  <tr key={u.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${u.hasConflict ? 'bg-red-50/30' : u.isOverallocated ? 'bg-amber-50/30' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-blue-600">{u.name.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">{u.email}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{u.jobRole}</td>
                    <td className="py-3 px-4 text-right text-gray-700">{u.activeAssignments}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-medium text-sm ${u.weeklyLoadHrs > 40 ? 'text-red-600' : 'text-gray-700'}`}>
                        {u.weeklyLoadHrs}h
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">{u.totalPlannedHrs}h</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Progress value={Math.min(100, u.utilizationPct)} className={`h-2 w-20 ${utilizationBarClass(u.utilizationPct)}`} />
                        <span className={`text-xs font-semibold ${utilizationColor(u.utilizationPct)}`}>{u.utilizationPct}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-600 font-medium">${(u.billValue/1000).toFixed(1)}k</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {u.isOverallocated && (
                          <Badge variant="destructive" className="text-xs gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> Over
                          </Badge>
                        )}
                        {u.hasConflict && (
                          <Badge className="text-xs bg-red-100 text-red-700 gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> Conflict
                          </Badge>
                        )}
                        {!u.isOverallocated && !u.hasConflict && (
                          <Badge variant="secondary" className="text-xs gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" /> OK
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function KPIDetails() {
  const [section, setSection] = useState('overview');
  const [activePeriod, setActivePeriod] = useState('monthly');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-semibold text-gray-900">KPI Details</h1>
          </div>
          <p className="text-gray-500 mt-1 text-sm">
            Planned Hours, Rates, Margins — drill down by period, project, task, assignment, role, or user
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2"><RefreshCw className="w-4 h-4" />Refresh</Button>
          <Button variant="outline" size="sm" className="gap-2"><Download className="w-4 h-4" />Export</Button>
        </div>
      </div>

      {/* Section tabs */}
      <Tabs value={section} onValueChange={setSection}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview"     className="gap-1.5"><Activity className="w-3.5 h-3.5" />Overview</TabsTrigger>
          <TabsTrigger value="projects"     className="gap-1.5"><FolderKanban className="w-3.5 h-3.5" />Projects</TabsTrigger>
          <TabsTrigger value="tasks"        className="gap-1.5"><ClipboardList className="w-3.5 h-3.5" />Tasks</TabsTrigger>
          <TabsTrigger value="assignments"  className="gap-1.5"><Briefcase className="w-3.5 h-3.5" />Assignments</TabsTrigger>
          <TabsTrigger value="job-roles"    className="gap-1.5"><Briefcase className="w-3.5 h-3.5" />Job Roles</TabsTrigger>
          <TabsTrigger value="users"        className="gap-1.5"><Users className="w-3.5 h-3.5" />Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Tabs value={activePeriod} onValueChange={setActivePeriod} className="mt-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
              <TabsTrigger value="halfannual">Half-Annual</TabsTrigger>
              <TabsTrigger value="annually">Annually</TabsTrigger>
            </TabsList>
            <TabsContent value="daily"><PeriodPanel period="daily" /></TabsContent>
            <TabsContent value="monthly"><PeriodPanel period="monthly" /></TabsContent>
            <TabsContent value="quarterly"><PeriodPanel period="quarterly" /></TabsContent>
            <TabsContent value="halfannual"><PeriodPanel period="halfannual" /></TabsContent>
            <TabsContent value="annually"><PeriodPanel period="annually" /></TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="projects"><ProjectsSection /></TabsContent>
        <TabsContent value="tasks"><TasksSection /></TabsContent>
        <TabsContent value="assignments"><AssignmentsSection /></TabsContent>
        <TabsContent value="job-roles"><JobRolesSection /></TabsContent>
        <TabsContent value="users"><UsersSection /></TabsContent>
      </Tabs>
    </div>
  );
}
