/**
 * Projects — Full PPM Command Center
 * Project DNA · Pulse Score · Smart Delivery Predictor · Scope Freeze
 * Revenue Recognition · Portfolio Heatmap · Budget Cases · Approval Workflow
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Switch } from '@/app/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/app/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/app/components/ui/table';
import {
  FolderKanban, LayoutGrid, List, Plus, Lock, Unlock, Globe, Upload,
  Link2, FileText, Workflow, Clock, Users, DollarSign, AlertTriangle,
  TrendingUp, TrendingDown, Flame, Shield, Activity, Copy, Zap,
  ChevronRight, CheckCircle2, XCircle, BarChart3, Star, Tag,
  Layers, Brain, Target, ArrowRight, Download, Edit3, Trash2,
  BookOpen, Paperclip, CircleDot,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell,
} from 'recharts';
import { toast } from 'sonner';
import { useBulkSelection } from '@/app/utils/use-bulk-selection';
import { BulkOperationsBar, BulkSelectCheckbox } from '@/app/components/common/BulkOperations';

// ─── Types ─────────────────────────────────────────────────────────────────────
type ProjectType = 'retainer' | 'fixed' | 'time-and-materials';
type ProjectArchetype = 'Creative' | 'Technical' | 'Strategic' | 'Operational';
type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
type RiskLevel = 'low' | 'medium' | 'high';

interface Milestone {
  id: string; name: string; dueDate: string; value: number;
  status: 'pending' | 'reached' | 'invoiced' | 'paid';
}
interface WorkflowStage {
  id: string; name: string; order: number; status: 'pending' | 'active' | 'completed'; color: string;
  entryCriteria: string; exitCriteria: string;
}
interface Expense {
  id: string; date: string; category: 'Labour Resource' | 'Non-Labour Resource';
  description: string; amount: number; status: 'pending' | 'approved' | 'rejected'; submittedBy: string;
}
interface Invoice {
  id: string; issueDate: string; dueDate: string; amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
}
interface Project {
  id: string; name: string; description: string; type: ProjectType; archetype: ProjectArchetype;
  status: ProjectStatus; pulseScore: number; deliveryConfidence: number; scopeFrozen: boolean;
  client: string; agency: string; owner: string; resourcePool: string;
  budget: number; currency: string; billingType: string; poNumber: string;
  startDate: string; endDate: string; tags: string[];
  riskLevel: RiskLevel; budgetBurnPct: number; timelineProgressPct: number;
  milestones: Milestone[]; workflow: WorkflowStage[];
  expenses: Expense[]; invoices: Invoice[];
  revenueSchedule: { month: string; amount: number }[];
  approvalWorkflow: boolean; shareableLink: string; customFormId: string;
  parentProjectId?: string; source: string;
}
interface ProjectTemplate {
  id: string; name: string; description: string; type: ProjectType;
  archetype: ProjectArchetype; usageCount: number; stages: string[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const CLIENTS = ['TechCorp Industries', 'Digital Wave', 'MegaRetail', 'FintechPro', 'Creative Hub', 'Acme Global'];
const AGENCIES = ['Horizon Creative', 'Digital Forge', 'NorthStar Media', 'PeakWork Agency'];
const OWNERS = ['Alex Chen', 'Maria Lopez', 'James Wu', 'Sara Kim', 'Tom Reeves', 'Priya Patel'];
const POOLS = ['Design Pool', 'Engineering Pool', 'Strategy Pool', 'Content Pool'];
const CUSTOM_FORMS = ['Client Onboarding Form', 'Risk Assessment Form', 'SOW Checklist', 'Brand Brief'];

const DEF_STAGES: WorkflowStage[] = [
  { id: 's1', name: 'Initiation', order: 1, status: 'completed', color: 'bg-blue-500', entryCriteria: 'SOW signed', exitCriteria: 'Kick-off done' },
  { id: 's2', name: 'Planning', order: 2, status: 'completed', color: 'bg-purple-500', entryCriteria: 'Team allocated', exitCriteria: 'Plan approved' },
  { id: 's3', name: 'Execution', order: 3, status: 'active', color: 'bg-amber-500', entryCriteria: 'Plan signed off', exitCriteria: '80% deliverables done' },
  { id: 's4', name: 'Review', order: 4, status: 'pending', color: 'bg-orange-500', entryCriteria: 'Delivery ready', exitCriteria: 'Client approval' },
  { id: 's5', name: 'Closure', order: 5, status: 'pending', color: 'bg-green-500', entryCriteria: 'Approved', exitCriteria: 'Invoice paid' },
];

const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1', name: 'Brand Overhaul 2026', description: 'Complete brand identity redesign including visual language, tone of voice, and digital assets.',
    type: 'fixed', archetype: 'Creative', status: 'active', pulseScore: 84, deliveryConfidence: 88,
    scopeFrozen: true, client: 'MegaRetail', agency: 'Horizon Creative', owner: 'Alex Chen',
    resourcePool: 'Design Pool', budget: 120000, currency: 'USD', billingType: 'milestone',
    poNumber: 'PO-2026-001', startDate: '2026-01-15', endDate: '2026-06-30', tags: ['brand', 'design'],
    riskLevel: 'low', budgetBurnPct: 42, timelineProgressPct: 55,
    milestones: [
      { id: 'm1', name: 'Brand Strategy', dueDate: '2026-02-28', value: 30000, status: 'invoiced' },
      { id: 'm2', name: 'Visual Identity', dueDate: '2026-04-30', value: 50000, status: 'reached' },
      { id: 'm3', name: 'Final Delivery', dueDate: '2026-06-30', value: 40000, status: 'pending' },
    ],
    workflow: DEF_STAGES,
    expenses: [
      { id: 'e1', date: '2026-02-10', category: 'Labour Resource', description: 'Senior designer overtime', amount: 2400, status: 'approved', submittedBy: 'Alex Chen' },
      { id: 'e2', date: '2026-03-05', category: 'Non-Labour Resource', description: 'Stock photography licence', amount: 1200, status: 'pending', submittedBy: 'Sara Kim' },
    ],
    invoices: [
      { id: 'inv1', issueDate: '2026-03-01', dueDate: '2026-03-31', amount: 30000, status: 'paid' },
    ],
    revenueSchedule: [
      { month: 'Jan', amount: 10000 }, { month: 'Feb', amount: 20000 }, { month: 'Mar', amount: 30000 },
      { month: 'Apr', amount: 20000 }, { month: 'May', amount: 25000 }, { month: 'Jun', amount: 15000 },
    ],
    approvalWorkflow: true, shareableLink: 'https://rep.io/share/p1-brand-overhaul', customFormId: 'Brand Brief',
    source: 'Manual',
  },
  {
    id: 'p2', name: 'Data Platform Migration', description: 'Migrate legacy data warehouse to cloud-native architecture with real-time pipelines.',
    type: 'time-and-materials', archetype: 'Technical', status: 'active', pulseScore: 58, deliveryConfidence: 64,
    scopeFrozen: false, client: 'FintechPro', agency: 'Digital Forge', owner: 'James Wu',
    resourcePool: 'Engineering Pool', budget: 280000, currency: 'USD', billingType: 'monthly',
    poNumber: 'PO-2026-042', startDate: '2026-02-01', endDate: '2026-08-31', tags: ['data', 'cloud', 'migration'],
    riskLevel: 'high', budgetBurnPct: 71, timelineProgressPct: 38,
    milestones: [
      { id: 'm4', name: 'Architecture Design', dueDate: '2026-03-15', value: 40000, status: 'paid' },
      { id: 'm5', name: 'Phase 1 Migration', dueDate: '2026-05-31', value: 120000, status: 'reached' },
      { id: 'm6', name: 'Go-Live', dueDate: '2026-08-31', value: 120000, status: 'pending' },
    ],
    workflow: DEF_STAGES,
    expenses: [
      { id: 'e3', date: '2026-03-01', category: 'Non-Labour Resource', description: 'AWS reserved instances', amount: 8500, status: 'approved', submittedBy: 'James Wu' },
    ],
    invoices: [
      { id: 'inv2', issueDate: '2026-03-31', dueDate: '2026-04-30', amount: 45000, status: 'overdue' },
    ],
    revenueSchedule: [
      { month: 'Feb', amount: 28000 }, { month: 'Mar', amount: 45000 }, { month: 'Apr', amount: 45000 },
      { month: 'May', amount: 60000 }, { month: 'Jun', amount: 50000 }, { month: 'Jul', amount: 32000 },
    ],
    approvalWorkflow: true, shareableLink: 'https://rep.io/share/p2-data-platform', customFormId: 'Risk Assessment Form',
    source: 'Jira',
  },
  {
    id: 'p3', name: 'Retail Media Strategy', description: 'Omnichannel retail media planning and execution across digital and OOH channels.',
    type: 'retainer', archetype: 'Strategic', status: 'active', pulseScore: 76, deliveryConfidence: 81,
    scopeFrozen: false, client: 'MegaRetail', agency: 'NorthStar Media', owner: 'Maria Lopez',
    resourcePool: 'Strategy Pool', budget: 60000, currency: 'USD', billingType: 'monthly',
    poNumber: 'PO-2026-088', startDate: '2026-01-01', endDate: '2026-12-31', tags: ['strategy', 'media', 'retail'],
    riskLevel: 'medium', budgetBurnPct: 28, timelineProgressPct: 25,
    milestones: [
      { id: 'm7', name: 'Q1 Strategy Review', dueDate: '2026-03-31', value: 15000, status: 'invoiced' },
    ],
    workflow: DEF_STAGES.slice(0, 3),
    expenses: [],
    invoices: [
      { id: 'inv3', issueDate: '2026-01-31', dueDate: '2026-02-15', amount: 5000, status: 'paid' },
      { id: 'inv4', issueDate: '2026-02-28', dueDate: '2026-03-15', amount: 5000, status: 'paid' },
      { id: 'inv5', issueDate: '2026-03-31', dueDate: '2026-04-15', amount: 5000, status: 'sent' },
    ],
    revenueSchedule: [
      { month: 'Jan', amount: 5000 }, { month: 'Feb', amount: 5000 }, { month: 'Mar', amount: 5000 },
      { month: 'Apr', amount: 5000 }, { month: 'May', amount: 5000 }, { month: 'Jun', amount: 5000 },
    ],
    approvalWorkflow: false, shareableLink: '', customFormId: 'SOW Checklist',
    source: 'Monday.com',
  },
  {
    id: 'p4', name: 'Customer Portal Revamp', description: 'UX redesign and front-end rebuild of the B2B customer portal.',
    type: 'fixed', archetype: 'Technical', status: 'on-hold', pulseScore: 34, deliveryConfidence: 41,
    scopeFrozen: false, client: 'TechCorp Industries', agency: 'Digital Forge', owner: 'Tom Reeves',
    resourcePool: 'Engineering Pool', budget: 95000, currency: 'USD', billingType: 'milestone',
    poNumber: 'PO-2025-312', startDate: '2025-11-01', endDate: '2026-05-31', tags: ['ux', 'portal', 'frontend'],
    riskLevel: 'high', budgetBurnPct: 88, timelineProgressPct: 72,
    milestones: [],
    workflow: DEF_STAGES,
    expenses: [],
    invoices: [],
    revenueSchedule: [
      { month: 'Nov', amount: 20000 }, { month: 'Dec', amount: 20000 }, { month: 'Jan', amount: 25000 },
    ],
    approvalWorkflow: true, shareableLink: '', customFormId: '',
    parentProjectId: 'p2', source: 'Manual',
  },
];

const MOCK_TEMPLATES: ProjectTemplate[] = [
  { id: 't1', name: 'Creative Campaign', description: 'Brand & creative project lifecycle', type: 'fixed', archetype: 'Creative', usageCount: 14, stages: ['Briefing', 'Concept', 'Production', 'Review', 'Launch'] },
  { id: 't2', name: 'Tech Migration', description: 'Legacy to modern stack migration', type: 'time-and-materials', archetype: 'Technical', usageCount: 8, stages: ['Discovery', 'Architecture', 'Migration', 'Testing', 'Go-Live'] },
  { id: 't3', name: 'Monthly Retainer', description: 'Ongoing service retainer structure', type: 'retainer', archetype: 'Operational', usageCount: 22, stages: ['Onboarding', 'Monthly Ops', 'QBR', 'Renewal'] },
  { id: 't4', name: 'Strategic Consulting', description: 'Advisory engagement template', type: 'fixed', archetype: 'Strategic', usageCount: 5, stages: ['Scoping', 'Research', 'Strategy', 'Roadmap', 'Handover'] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pulseColor(s: number) {
  if (s >= 75) return 'text-green-600';
  if (s >= 50) return 'text-amber-600';
  return 'text-red-600';
}
function pulseBarClass(s: number) {
  if (s >= 75) return 'bg-green-500';
  if (s >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}
function archetypeColor(a: ProjectArchetype) {
  const m = { Creative: 'bg-pink-100 text-pink-700', Technical: 'bg-blue-100 text-blue-700', Strategic: 'bg-purple-100 text-purple-700', Operational: 'bg-gray-100 text-gray-700' };
  return m[a];
}
function statusColor(s: ProjectStatus) {
  const m = { active: 'bg-green-100 text-green-700', planning: 'bg-blue-100 text-blue-700', 'on-hold': 'bg-amber-100 text-amber-700', completed: 'bg-gray-100 text-gray-700', cancelled: 'bg-red-100 text-red-700' };
  return m[s];
}
function riskColor(r: RiskLevel) {
  return r === 'low' ? 'text-green-600' : r === 'medium' ? 'text-amber-600' : 'text-red-600';
}
function fmt(n: number, c = 'USD') { return new Intl.NumberFormat('en-US', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(n); }
function computeArchetype(type: string, tags: string[]): ProjectArchetype {
  if (tags.some(t => ['brand', 'design', 'creative', 'content'].includes(t))) return 'Creative';
  if (tags.some(t => ['data', 'cloud', 'engineering', 'ux', 'frontend'].includes(t))) return 'Technical';
  if (tags.some(t => ['strategy', 'advisory', 'consulting', 'media'].includes(t))) return 'Strategic';
  if (type === 'retainer') return 'Operational';
  return 'Strategic';
}

// ─── PulseScoreBadge ─────────────────────────────────────────────────────────
function PulseScoreBadge({ score }: { score: number }) {
  const r = 18; const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-[11px] font-bold ${pulseColor(score)}`}>{score}</span>
    </div>
  );
}

// ─── Portfolio Heatmap ────────────────────────────────────────────────────────
function PortfolioHeatmap({ projects, onSelect }: { projects: Project[]; onSelect: (p: Project) => void }) {
  const riskBuckets = ['Very Low', 'Low', 'Medium', 'High', 'Critical'];
  const valueBuckets = ['Very High', 'High', 'Medium', 'Low', 'Very Low'];
  function getBucket(score: number) { return Math.min(4, Math.floor(score / 20)); }
  return (
    <div>
      <p className="text-xs text-gray-500 mb-3">Portfolio Risk × Value Matrix — bubble = project, color = pulse health</p>
      <div className="flex gap-2">
        <div className="flex flex-col justify-around text-[10px] text-gray-400 pr-2">
          {valueBuckets.map(v => <span key={v} className="text-right">{v}</span>)}
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-5 gap-1">
            {valueBuckets.map((_, vi) => riskBuckets.map((_, ri) => {
              const _cell = projects.filter(p => getBucket(100 - (p.riskLevel === 'low' ? 90 : p.riskLevel === 'medium' ? 50 : 15)) === ri && getBucket(p.pulseScore) === (4 - vi));
              return (
                <div key={`${vi}-${ri}`} className="h-14 rounded border border-gray-100 bg-gray-50 flex flex-wrap items-center justify-center gap-1 p-1">
                  {projects.filter(p => {
                    const rb = p.riskLevel === 'low' ? 0 : p.riskLevel === 'medium' ? 2 : 4;
                    const vb = 4 - Math.min(4, Math.floor(p.pulseScore / 25));
                    return rb === ri && vb === vi;
                  }).map(p => (
                    <button key={p.id} onClick={() => onSelect(p)} title={p.name}
                      className={`w-4 h-4 rounded-full transition-transform hover:scale-125 ${p.pulseScore >= 75 ? 'bg-green-500' : p.pulseScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} />
                  ))}
                </div>
              );
            }))}
          </div>
          <div className="flex justify-around mt-1">
            {riskBuckets.map(b => <span key={b} className="text-[10px] text-gray-400">{b}</span>)}
          </div>
        </div>
      </div>
      <p className="text-[10px] text-gray-400 mt-2 text-center">X-axis = Risk · Y-axis = Pulse Health Value</p>
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ 
  project, 
  onSelect, 
  onToggleScope,
  isSelected,
  onToggleSelection,
}: { 
  project: Project; 
  onSelect: () => void; 
  onToggleScope: () => void;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
}) {
  return (
    <Card className={`hover:shadow-md transition-shadow cursor-pointer relative ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''}`} onClick={onSelect}>
      {onToggleSelection && (
        <div className="absolute top-3 right-3 z-10" onClick={e => e.stopPropagation()}>
          <BulkSelectCheckbox checked={!!isSelected} onCheckedChange={() => onToggleSelection(project.id)} />
        </div>
      )}
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-3">
          <PulseScoreBadge score={project.pulseScore} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-gray-900 text-sm leading-tight">{project.name}</span>
              {project.scopeFrozen && <span title="Scope frozen"><Lock className="w-3 h-3 text-blue-500" /></span>}
              {!project.scopeFrozen && project.status === 'active' && <Unlock className="w-3 h-3 text-gray-300" />}
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${archetypeColor(project.archetype)}`}>{project.archetype}</span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusColor(project.status)}`}>{project.status}</span>
              <span className={`text-[10px] font-medium ${riskColor(project.riskLevel)}`}>{project.riskLevel} risk</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">{project.client} · {project.owner}</p>

            {/* Budget burn */}
            <div className="mb-1.5">
              <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                <span>Budget burn</span><span>{project.budgetBurnPct}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${pulseBarClass(100 - project.budgetBurnPct)}`} style={{ width: `${project.budgetBurnPct}%` }} />
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-2">
              <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                <span>Timeline</span><span>{project.timelineProgressPct}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${project.timelineProgressPct}%` }} />
              </div>
            </div>

            {/* Delivery Confidence */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                <Target className="w-3 h-3" />Delivery confidence:
                <span className={`font-semibold ${project.deliveryConfidence >= 80 ? 'text-green-600' : project.deliveryConfidence >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{project.deliveryConfidence}%</span>
              </span>
              <button onClick={e => { e.stopPropagation(); onToggleScope(); }}
                className={`text-[10px] flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border ${project.scopeFrozen ? 'border-blue-300 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-400'}`}>
                {project.scopeFrozen ? <><Lock className="w-2.5 h-2.5" />Frozen</> : <><Unlock className="w-2.5 h-2.5" />Freeze</>}
              </button>
            </div>

            {/* Tags */}
            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {project.tags.map(t => <span key={t} className="text-[10px] bg-gray-100 text-gray-500 rounded px-1.5">{t}</span>)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Board Tab ────────────────────────────────────────────────────────────────
function BoardTab({ projects, setProjects, onOpenProject }: { projects: Project[]; setProjects: (ps: Project[]) => void; onOpenProject: (p: Project) => void }) {
  const [view, setView] = useState<'card' | 'list' | 'kanban'>('card');
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('all');
  const [riskF, setRiskF] = useState('all');
  const [typeF, setTypeF] = useState('all');
  const [showHeatmap, setShowHeatmap] = useState(false);

  const {
    selectedIds,
    selectedCount,
    toggleItem,
    toggleAll,
    clearSelection,
    isSelected,
    allSelected,
    someSelected,
  } = useBulkSelection(projects);

  const filtered = useMemo(() => projects.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.client.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusF !== 'all' && p.status !== statusF) return false;
    if (riskF !== 'all' && p.riskLevel !== riskF) return false;
    if (typeF !== 'all' && p.type !== typeF) return false;
    return true;
  }), [projects, search, statusF, riskF, typeF]);

  const kpis = useMemo(() => ({
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    atRisk: projects.filter(p => p.riskLevel === 'high').length,
    avgPulse: projects.length > 0 ? Math.round(projects.reduce((s, p) => s + p.pulseScore, 0) / projects.length) : 0,
    totalBudget: projects.reduce((s, p) => s + p.budget, 0),
  }), [projects]);

  const kanbanCols: { status: ProjectStatus; label: string; color: string }[] = [
    { status: 'planning', label: 'Planning', color: 'border-t-blue-400' },
    { status: 'active', label: 'Active', color: 'border-t-green-400' },
    { status: 'on-hold', label: 'On Hold', color: 'border-t-amber-400' },
    { status: 'completed', label: 'Completed', color: 'border-t-gray-400' },
  ];

  const toggleScope = (id: string) => {
    setProjects(projects.map(p => p.id === id ? { ...p, scopeFrozen: !p.scopeFrozen } : p));
    const p = projects.find(x => x.id === id)!;
    toast.success(p.scopeFrozen ? 'Scope unfrozen — change request created' : 'Scope frozen — change request required to modify');
  };

  return (
    <div className="space-y-4">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { l: 'Total Projects', v: kpis.total, Icon: FolderKanban, c: 'text-gray-700' },
          { l: 'Active', v: kpis.active, Icon: Activity, c: 'text-green-600' },
          { l: 'High Risk', v: kpis.atRisk, Icon: AlertTriangle, c: 'text-red-600' },
          { l: 'Avg Pulse', v: kpis.avgPulse, Icon: CircleDot, c: pulseColor(kpis.avgPulse) },
          { l: 'Total Budget', v: fmt(kpis.totalBudget), Icon: DollarSign, c: 'text-blue-600' },
        ].map(({ l, v, Icon, c }) => (
          <Card key={l}><CardContent className="pt-4 pb-3 text-center">
            <Icon className={`w-5 h-5 mx-auto mb-1 ${c}`} />
            <p className={`text-xl font-bold ${c}`}>{v}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{l}</p>
          </CardContent></Card>
        ))}
      </div>

      {/* Filters + view toggle */}
      <div className="flex flex-wrap gap-2 items-center">
        <Input placeholder="Search project or client…" value={search} onChange={e => setSearch(e.target.value)} className="h-9 w-52" />
        <Select value={statusF} onValueChange={setStatusF}>
          <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={riskF} onValueChange={setRiskF}>
          <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeF} onValueChange={setTypeF}>
          <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="fixed">Fixed</SelectItem>
            <SelectItem value="retainer">Retainer</SelectItem>
            <SelectItem value="time-and-materials">T&M</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-1">
          {(['card', 'list', 'kanban'] as const).map(v => (
            <Button key={v} size="sm" variant={view === v ? 'default' : 'outline'}
              onClick={() => setView(v)} className="h-9 px-3">
              {v === 'card' ? <LayoutGrid className="w-4 h-4" /> : v === 'list' ? <List className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
            </Button>
          ))}
        </div>
      </div>

      {/* Views */}
      {view === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <ProjectCard 
              key={p.id} 
              project={p} 
              onSelect={() => onOpenProject(p)} 
              onToggleScope={() => toggleScope(p.id)} 
              isSelected={isSelected(p.id)}
              onToggleSelection={toggleItem}
            />
          ))}
        </div>
      )}

      {view === 'list' && (
        <Card><CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="w-[40px]">
                <BulkSelectCheckbox checked={allSelected} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead>Project</TableHead><TableHead>Client</TableHead><TableHead>Archetype</TableHead>
              <TableHead>Status</TableHead><TableHead>Pulse</TableHead><TableHead>Budget Burn</TableHead>
              <TableHead>Delivery Conf.</TableHead><TableHead>Risk</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id} className={`cursor-pointer hover:bg-gray-50 ${isSelected(p.id) ? 'bg-blue-50/50' : ''}`} onClick={() => onOpenProject(p)}>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <BulkSelectCheckbox checked={isSelected(p.id)} onCheckedChange={() => toggleItem(p.id)} />
                  </TableCell>
                  <TableCell className="font-medium">{p.name}{p.scopeFrozen && <Lock className="w-3 h-3 inline ml-1 text-blue-500" />}</TableCell>
                  <TableCell className="text-gray-600">{p.client}</TableCell>
                  <TableCell><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${archetypeColor(p.archetype)}`}>{p.archetype}</span></TableCell>
                  <TableCell><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(p.status)}`}>{p.status}</span></TableCell>
                  <TableCell><span className={`font-bold ${pulseColor(p.pulseScore)}`}>{p.pulseScore}</span></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2"><Progress value={p.budgetBurnPct} className="w-20 h-1.5" /><span className="text-xs">{p.budgetBurnPct}%</span></div>
                  </TableCell>
                  <TableCell><span className={p.deliveryConfidence >= 80 ? 'text-green-600 font-semibold' : p.deliveryConfidence >= 60 ? 'text-amber-600 font-semibold' : 'text-red-600 font-semibold'}>{p.deliveryConfidence}%</span></TableCell>
                  <TableCell><span className={`text-xs font-medium ${riskColor(p.riskLevel)}`}>{p.riskLevel}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      )}

      {view === 'kanban' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanCols.map(col => (
            <div key={col.status} className={`rounded-xl border-t-4 ${col.color} bg-gray-50 p-3 space-y-2 min-h-[300px]`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-gray-700">{col.label}</span>
                <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2">{filtered.filter(p => p.status === col.status).length}</span>
              </div>
              {filtered.filter(p => p.status === col.status).map(p => (
                <Card key={p.id} className="cursor-pointer hover:shadow-sm" onClick={() => onOpenProject(p)}>
                  <CardContent className="pt-3 pb-3">
                    <p className="text-sm font-semibold text-gray-900 mb-1 leading-tight">{p.name}</p>
                    <p className="text-xs text-gray-500 mb-2">{p.client}</p>
                    <div className="flex items-center justify-between">
                      <PulseScoreBadge score={p.pulseScore} />
                      <span className={`text-[10px] font-semibold ${riskColor(p.riskLevel)}`}>{p.riskLevel} risk</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Portfolio Heatmap */}
      <Card>
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowHeatmap(h => !h)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4" />Portfolio Risk-Value Matrix</CardTitle>
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showHeatmap ? 'rotate-90' : ''}`} />
          </div>
        </CardHeader>
        {showHeatmap && <CardContent><PortfolioHeatmap projects={filtered} onSelect={onOpenProject} /></CardContent>}
      </Card>

      <BulkOperationsBar
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
        onArchiveSelected={() => {
          toast.success(`Archived ${selectedCount} projects`);
          clearSelection();
        }}
        onDeleteSelected={() => {
          toast.success(`Deleted ${selectedCount} projects`);
          clearSelection();
        }}
      />
    </div>
  );
}

// ─── Create Project Tab ───────────────────────────────────────────────────────
function CreateProjectTab({ templates, onCreated }: { templates: ProjectTemplate[]; onCreated: (p: Project) => void }) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [docs, setDocs] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '', description: '', type: 'fixed' as ProjectType,
    client: '', agency: '', owner: '', resourcePool: '',
    budget: '', currency: 'USD', billingType: 'milestone', poNumber: '',
    startDate: '', endDate: '', approvalWorkflow: false, sharePublic: false,
    parentProjectId: '', customFormId: '', tags: [] as string[],
    milestones: [] as { name: string; dueDate: string; value: string }[],
  });

  const set = (k: string, v: unknown) => setForm(prev => ({ ...prev, [k]: v }));
  const archetype = useMemo(() => computeArchetype(form.type, form.tags), [form.type, form.tags]);

  const addTag = () => { if (tagInput.trim()) { set('tags', [...form.tags, tagInput.trim()]); setTagInput(''); } };
  const removeTag = (t: string) => set('tags', form.tags.filter(x => x !== t));

  const applyTemplate = (tpl: ProjectTemplate) => {
    setSelectedTemplate(tpl);
    set('type', tpl.type);
    setStep(2);
  };

  const handleSubmit = () => {
    if (!form.name || !form.client) { toast.error('Project name and client are required'); return; }
    const newProject: Project = {
      id: `p${Date.now()}`, name: form.name, description: form.description,
      type: form.type, archetype, status: 'planning',
      pulseScore: 85, deliveryConfidence: 80, scopeFrozen: false,
      client: form.client, agency: form.agency, owner: form.owner,
      resourcePool: form.resourcePool, budget: parseFloat(form.budget) || 0,
      currency: form.currency, billingType: form.billingType, poNumber: form.poNumber,
      startDate: form.startDate, endDate: form.endDate, tags: form.tags,
      riskLevel: 'low', budgetBurnPct: 0, timelineProgressPct: 0,
      milestones: form.milestones.map((m, i) => ({ id: `m${i}`, name: m.name, dueDate: m.dueDate, value: parseFloat(m.value) || 0, status: 'pending' as const })),
      workflow: DEF_STAGES.map(s => ({ ...s, status: 'pending' as const })),
      expenses: [], invoices: [], revenueSchedule: [],
      approvalWorkflow: form.approvalWorkflow,
      shareableLink: form.sharePublic ? `https://rep.io/share/${Date.now()}` : '',
      customFormId: form.customFormId,
      parentProjectId: form.parentProjectId || undefined,
      source: 'Manual',
    };
    onCreated(newProject);
    toast.success('Project created!');
    setStep(1); setForm({ name: '', description: '', type: 'fixed', client: '', agency: '', owner: '', resourcePool: '', budget: '', currency: 'USD', billingType: 'milestone', poNumber: '', startDate: '', endDate: '', approvalWorkflow: false, sharePublic: false, parentProjectId: '', customFormId: '', tags: [], milestones: [] });
  };

  const steps = ['Template', 'Basic Info', 'Budget & Billing', 'Team & Access', 'Dates & Milestones', 'Advanced'];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {step > i + 1 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-[10px] hidden sm:block ${step === i + 1 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>{s}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${step > i + 1 ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6 pb-6 space-y-4">
          {/* Step 1: Template */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Choose a Template</h3>
                <p className="text-xs text-gray-500">Pick a starting template or skip to start from scratch</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {templates.map(t => (
                  <button key={t.id} onClick={() => applyTemplate(t)}
                    className={`text-left p-4 rounded-lg border-2 transition-all hover:border-blue-400 hover:bg-blue-50 ${selectedTemplate?.id === t.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 mb-2">{t.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {t.stages.map(s => <span key={s} className="text-[10px] bg-gray-100 text-gray-600 rounded px-1.5">{s}</span>)}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">Used {t.usageCount}× · <span className={archetypeColor(t.archetype).split(' ')[1]}>{t.archetype}</span></p>
                  </button>
                ))}
              </div>
              <Button variant="outline" className="w-full" onClick={() => setStep(2)}>Skip — Start Blank</Button>
            </div>
          )}

          {/* Step 2: Basic Info */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Basic Information</h3>
              {selectedTemplate && <div className="text-xs bg-blue-50 border border-blue-200 rounded p-2 text-blue-700">Using template: <strong>{selectedTemplate.name}</strong></div>}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1"><Label>Project Name *</Label><Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Brand Overhaul 2026" /></div>
                <div className="col-span-2 space-y-1"><Label>Description</Label><textarea value={form.description} onChange={e => set('description', e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="What does this project deliver?" /></div>
                <div className="space-y-1"><Label>Project Type</Label>
                  <Select value={form.type} onValueChange={v => set('type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="retainer">Retainer</SelectItem>
                      <SelectItem value="time-and-materials">Time & Materials</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 flex flex-col justify-end">
                  <Label>Project DNA (auto-classified)</Label>
                  <span className={`text-xs font-semibold px-3 py-2 rounded-lg ${archetypeColor(archetype)}`}>
                    <Brain className="w-3 h-3 inline mr-1" />{archetype}
                  </span>
                </div>
                <div className="space-y-1"><Label>Client *</Label>
                  <Select value={form.client} onValueChange={v => set('client', v)}>
                    <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>{CLIENTS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Agency</Label>
                  <Select value={form.agency} onValueChange={v => set('agency', v)}>
                    <SelectTrigger><SelectValue placeholder="Select agency" /></SelectTrigger>
                    <SelectContent>{AGENCIES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2"><Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} placeholder="Add tag + Enter" className="h-8" /><Button size="sm" variant="outline" onClick={addTag}>Add</Button></div>
                <div className="flex flex-wrap gap-1">{form.tags.map(t => <span key={t} className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 flex items-center gap-1">{t}<button onClick={() => removeTag(t)} className="text-blue-400 hover:text-blue-600">×</button></span>)}</div>
              </div>
            </div>
          )}

          {/* Step 3: Budget & Billing */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Budget Case</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Budget Amount</Label><Input type="number" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="0.00" /></div>
                <div className="space-y-1"><Label>Currency</Label>
                  <Select value={form.currency} onValueChange={v => set('currency', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['USD', 'GBP', 'EUR', 'INR', 'AUD'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Billing Type</Label>
                  <Select value={form.billingType} onValueChange={v => set('billingType', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="milestone">Milestone</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="on-completion">On Completion</SelectItem>
                      <SelectItem value="advance">Advance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>PO Number</Label><Input value={form.poNumber} onChange={e => set('poNumber', e.target.value)} placeholder="PO-2026-XXX" /></div>
              </div>
            </div>
          )}

          {/* Step 4: Team & Access */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Team & Access</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Project Owner</Label>
                  <Select value={form.owner} onValueChange={v => set('owner', v)}>
                    <SelectTrigger><SelectValue placeholder="Assign owner" /></SelectTrigger>
                    <SelectContent>{OWNERS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Resource Pool</Label>
                  <Select value={form.resourcePool} onValueChange={v => set('resourcePool', v)}>
                    <SelectTrigger><SelectValue placeholder="Select pool" /></SelectTrigger>
                    <SelectContent>{POOLS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div><p className="text-sm font-medium">Approval Workflow</p><p className="text-xs text-gray-500">Requires PM approval before Go Live</p></div>
                  <Switch checked={form.approvalWorkflow} onCheckedChange={v => set('approvalWorkflow', v)} />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div><p className="text-sm font-medium">Share Publicly</p><p className="text-xs text-gray-500">Generate a read-only shareable link</p></div>
                  <Switch checked={form.sharePublic} onCheckedChange={v => set('sharePublic', v)} />
                </div>
                {form.sharePublic && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                    <Globe className="w-3 h-3 flex-shrink-0" />
                    <span className="flex-1">Link will be generated on save</span>
                    <button className="text-blue-600 hover:text-blue-800"><Copy className="w-3 h-3" /></button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Dates & Milestones */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Dates & Milestones</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div>
                <div className="space-y-1"><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Milestones</Label>
                  <Button size="sm" variant="outline" onClick={() => set('milestones', [...form.milestones, { name: '', dueDate: '', value: '' }])}>+ Add</Button>
                </div>
                <div className="space-y-2">
                  {form.milestones.map((m, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2 items-end">
                      <Input placeholder="Milestone name" value={m.name} onChange={e => { const ms = [...form.milestones]; ms[i] = { ...ms[i], name: e.target.value }; set('milestones', ms); }} className="h-8" />
                      <Input type="date" value={m.dueDate} onChange={e => { const ms = [...form.milestones]; ms[i] = { ...ms[i], dueDate: e.target.value }; set('milestones', ms); }} className="h-8" />
                      <div className="flex gap-1">
                        <Input placeholder="Value $" value={m.value} onChange={e => { const ms = [...form.milestones]; ms[i] = { ...ms[i], value: e.target.value }; set('milestones', ms); }} className="h-8" />
                        <Button size="sm" variant="ghost" onClick={() => set('milestones', form.milestones.filter((_, j) => j !== i))} className="h-8 px-2 text-red-500"><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Advanced */}
          {step === 6 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Advanced Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Link to Parent Project</Label>
                  <Select value={form.parentProjectId} onValueChange={v => set('parentProjectId', v)}>
                    <SelectTrigger><SelectValue placeholder="None (top-level)" /></SelectTrigger>
                    <SelectContent><SelectItem value="">None</SelectItem>{MOCK_PROJECTS.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Attach Custom Form</Label>
                  <Select value={form.customFormId} onValueChange={v => set('customFormId', v)}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent><SelectItem value="">None</SelectItem>{CUSTOM_FORMS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Upload Documents</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const files = Array.from(e.dataTransfer.files).map(f => f.name); setDocs(prev => [...prev, ...files]); toast.success(`${files.length} file(s) attached`); }}>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Drag & drop files here</p>
                  <label className="mt-2 inline-block">
                    <input type="file" multiple className="hidden" onChange={e => { const files = Array.from(e.target.files || []).map(f => f.name); setDocs(prev => [...prev, ...files]); toast.success(`${files.length} file(s) attached`); }} />
                    <span className="text-xs text-blue-600 cursor-pointer hover:underline">or browse files</span>
                  </label>
                </div>
                {docs.length > 0 && (
                  <div className="space-y-1">
                    {docs.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs bg-gray-50 rounded p-2">
                        <Paperclip className="w-3 h-3 text-gray-400" /><span className="flex-1">{d}</span>
                        <button onClick={() => setDocs(docs.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nav buttons */}
      <div className="flex justify-between">
        <Button variant="outline" disabled={step === 1} onClick={() => setStep(s => s - 1)}>Back</Button>
        {step < 6
          ? <Button onClick={() => setStep(s => s + 1)}>Next <ArrowRight className="w-4 h-4 ml-1" /></Button>
          : <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">Create Project</Button>
        }
      </div>
    </div>
  );
}

// ─── Templates Tab ─────────────────────────────────────────────────────────────
function TemplatesTab({ templates }: { templates: ProjectTemplate[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><p className="font-semibold text-gray-900">Project Templates</p><p className="text-xs text-gray-500 mt-0.5">Reusable project structures with pre-configured workflows and milestones</p></div>
        <Button size="sm"><Plus className="w-4 h-4 mr-1" />New Template</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(t => (
          <Card key={t.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${archetypeColor(t.archetype)}`}>{t.archetype}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {t.stages.map((s, i) => (
                  <div key={s} className="flex items-center gap-1">
                    <span className="text-[10px] bg-gray-100 text-gray-700 rounded px-2 py-0.5">{s}</span>
                    {i < t.stages.length - 1 && <ChevronRight className="w-3 h-3 text-gray-300" />}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Used {t.usageCount} times</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast.info('Template cloned')}>
                    <Copy className="w-3 h-3 mr-1" />Clone
                  </Button>
                  <Button size="sm" className="h-7 text-xs" onClick={() => toast.success('Starting from template…')}>
                    Use Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Project Detail Dialog ─────────────────────────────────────────────────────
function ProjectDetailDialog({ project, open, onClose, onUpdate }: { project: Project; open: boolean; onClose: () => void; onUpdate: (p: Project) => void }) {
  const [subTab, setSubTab] = useState('overview');
  const [newExpense, setNewExpense] = useState({ category: 'Non-Labour Resource' as Expense['category'], description: '', amount: '' });
  const [addExpOpen, setAddExpOpen] = useState(false);

  const addExpense = () => {
    if (!newExpense.description) return;
    const exp: Expense = { id: `e${Date.now()}`, date: new Date().toISOString().split('T')[0], category: newExpense.category, description: newExpense.description, amount: parseFloat(newExpense.amount) || 0, status: 'pending', submittedBy: 'Current User' };
    onUpdate({ ...project, expenses: [...project.expenses, exp] });
    toast.success('Expense submitted');
    setAddExpOpen(false);
    setNewExpense({ category: 'Non-Labour Resource', description: '', amount: '' });
  };

  const invoiceTotal = project.invoices.reduce((s, i) => s + i.amount, 0);
  const paidTotal = project.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-blue-600" />
            {project.name}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${archetypeColor(project.archetype)}`}>{project.archetype}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(project.status)}`}>{project.status}</span>
          </DialogTitle>
          <DialogDescription>{project.client} · {project.owner} · {project.agency}</DialogDescription>
        </DialogHeader>

        {/* Quick metrics */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { l: 'Pulse', v: project.pulseScore, c: pulseColor(project.pulseScore) },
            { l: 'Delivery Conf.', v: `${project.deliveryConfidence}%`, c: project.deliveryConfidence >= 80 ? 'text-green-600' : 'text-amber-600' },
            { l: 'Budget Burn', v: `${project.budgetBurnPct}%`, c: project.budgetBurnPct > 80 ? 'text-red-600' : 'text-amber-600' },
            { l: 'Risk', v: project.riskLevel, c: riskColor(project.riskLevel) },
          ].map(m => (
            <div key={m.l} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className={`text-xl font-bold ${m.c}`}>{m.v}</p>
              <p className="text-[10px] text-gray-500">{m.l}</p>
            </div>
          ))}
        </div>

        <Tabs value={subTab} onValueChange={setSubTab}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="workflow">Lifecycle</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-3">
            <p className="text-sm text-gray-700">{project.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Budget:</span> <strong>{fmt(project.budget, project.currency)}</strong></div>
              <div><span className="text-gray-500">Billing:</span> <strong className="capitalize">{project.billingType}</strong></div>
              <div><span className="text-gray-500">PO:</span> <strong>{project.poNumber || '—'}</strong></div>
              <div><span className="text-gray-500">Timeline:</span> <strong>{project.startDate} → {project.endDate}</strong></div>
              <div><span className="text-gray-500">Resource Pool:</span> <strong>{project.resourcePool}</strong></div>
              <div><span className="text-gray-500">Source:</span> <strong>{project.source}</strong></div>
            </div>
            {project.tags.length > 0 && <div className="flex flex-wrap gap-1">{project.tags.map(t => <span key={t} className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">{t}</span>)}</div>}
            {project.shareableLink && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                <Globe className="w-3 h-3 text-blue-500" /><span className="flex-1 text-blue-700 truncate">{project.shareableLink}</span>
                <button onClick={() => { navigator.clipboard.writeText(project.shareableLink); toast.success('Link copied!'); }} className="text-blue-600"><Copy className="w-3 h-3" /></button>
              </div>
            )}
            {project.customFormId && <div className="flex items-center gap-2 text-xs text-gray-600 p-2 border rounded"><FileText className="w-3 h-3" />{project.customFormId} attached</div>}
          </TabsContent>

          <TabsContent value="milestones" className="mt-3">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Milestone</TableHead><TableHead>Due Date</TableHead><TableHead>Value</TableHead><TableHead>Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {project.milestones.map(m => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>{m.dueDate}</TableCell>
                    <TableCell>{fmt(m.value)}</TableCell>
                    <TableCell><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.status === 'paid' ? 'bg-green-100 text-green-700' : m.status === 'invoiced' ? 'bg-blue-100 text-blue-700' : m.status === 'reached' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{m.status}</span></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-3 mt-3">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setAddExpOpen(true)}><Plus className="w-4 h-4 mr-1" />Add Expense</Button>
            </div>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Date</TableHead><TableHead>Category</TableHead><TableHead>Description</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {project.expenses.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="text-xs">{e.date}</TableCell>
                    <TableCell><span className={`text-xs px-2 py-0.5 rounded-full ${e.category === 'Labour Resource' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{e.category}</span></TableCell>
                    <TableCell>{e.description}</TableCell>
                    <TableCell>{fmt(e.amount)}</TableCell>
                    <TableCell><span className={`text-xs px-2 py-0.5 rounded-full ${e.status === 'approved' ? 'bg-green-100 text-green-700' : e.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{e.status}</span></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Dialog open={addExpOpen} onOpenChange={setAddExpOpen}>
              <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1"><Label>Category</Label>
                    <Select value={newExpense.category} onValueChange={v => setNewExpense(p => ({ ...p, category: v as Expense['category'] }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Labour Resource">Labour Resource</SelectItem>
                        <SelectItem value="Non-Labour Resource">Non-Labour Resource</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label>Description</Label><Input value={newExpense.description} onChange={e => setNewExpense(p => ({ ...p, description: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>Amount</Label><Input type="number" value={newExpense.amount} onChange={e => setNewExpense(p => ({ ...p, amount: e.target.value }))} /></div>
                </div>
                <DialogFooter><Button onClick={addExpense}>Submit Expense</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4 mt-3">
            <div className="grid grid-cols-3 gap-3">
              {[
                { l: 'Total Invoiced', v: fmt(invoiceTotal), c: 'text-blue-600' },
                { l: 'Total Paid', v: fmt(paidTotal), c: 'text-green-600' },
                { l: 'Outstanding', v: fmt(invoiceTotal - paidTotal), c: 'text-amber-600' },
              ].map(m => (
                <div key={m.l} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className={`text-lg font-bold ${m.c}`}>{m.v}</p>
                  <p className="text-xs text-gray-500">{m.l}</p>
                </div>
              ))}
            </div>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Invoice</TableHead><TableHead>Issued</TableHead><TableHead>Due</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {project.invoices.map(inv => (
                  <TableRow key={inv.id}>
                    <TableCell className="text-xs font-mono">{inv.id}</TableCell>
                    <TableCell className="text-xs">{inv.issueDate}</TableCell>
                    <TableCell className="text-xs">{inv.dueDate}</TableCell>
                    <TableCell className="font-medium">{fmt(inv.amount)}</TableCell>
                    <TableCell><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : inv.status === 'overdue' ? 'bg-red-100 text-red-700' : inv.status === 'sent' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{inv.status}</span></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {project.revenueSchedule.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">Revenue Recognition Forecast</p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={project.revenueSchedule}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => [fmt(v), 'Revenue']} />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>

          <TabsContent value="workflow" className="mt-3">
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Project Life Journey — stage-gate workflow</p>
              <div className="flex flex-wrap items-center gap-2">
                {project.workflow.map((stage, i) => (
                  <div key={stage.id} className="flex items-center gap-2">
                    <div className={`rounded-lg p-3 text-center min-w-[100px] border-2 ${stage.status === 'completed' ? 'border-green-400 bg-green-50' : stage.status === 'active' ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${stage.color}`} />
                      <p className="text-xs font-semibold text-gray-800">{stage.name}</p>
                      <p className={`text-[10px] mt-0.5 font-medium ${stage.status === 'completed' ? 'text-green-600' : stage.status === 'active' ? 'text-blue-600' : 'text-gray-400'}`}>{stage.status}</p>
                    </div>
                    {i < project.workflow.length - 1 && <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-2 mt-3">
                {project.workflow.map(s => (
                  <div key={s.id} className="text-xs border rounded-lg p-2 grid grid-cols-3 gap-2">
                    <span className="font-semibold text-gray-700">{s.name}</span>
                    <span className="text-gray-500">Entry: {s.entryCriteria}</span>
                    <span className="text-gray-500">Exit: {s.exitCriteria}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.info('Stage editor opening…')}>
                <Edit3 className="w-3 h-3 mr-1" />Edit Stages
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Export ────────────────────────────────────────────────────────────────
export function Projects() {
  const [activeTab, setActiveTab] = useState('board');
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [templates] = useState<ProjectTemplate[]>(MOCK_TEMPLATES);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [quickName, setQuickName] = useState('');

  const handleQuickCreate = () => {
    if (!quickName.trim()) return;
    const newProject: Project = {
      id: `p${Date.now()}`, name: quickName.trim(), description: '',
      type: 'fixed', archetype: 'Strategic', status: 'planning',
      pulseScore: 85, deliveryConfidence: 80, scopeFrozen: false,
      client: '', agency: '', owner: '', resourcePool: '',
      budget: 0, currency: 'USD', billingType: 'milestone', poNumber: '',
      startDate: '', endDate: '', tags: [],
      riskLevel: 'low', budgetBurnPct: 0, timelineProgressPct: 0,
      milestones: [], workflow: DEF_STAGES.map(s => ({ ...s, status: 'pending' as const })),
      expenses: [], invoices: [], revenueSchedule: [],
      approvalWorkflow: false, shareableLink: '', customFormId: '',
      source: 'Quick Create',
    };
    setProjects(prev => [newProject, ...prev]);
    toast.success(`Project "${quickName.trim()}" created — add details anytime`);
    setQuickName('');
    setQuickCreateOpen(false);
  };

  const handleCreated = (p: Project) => {
    setProjects(prev => [p, ...prev]);
    setActiveTab('board');
  };

  const handleUpdate = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-blue-600" />Project Command Center
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Full project lifecycle · Budget · Billing · Workflow</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <Button variant="outline" size="sm" onClick={() => toast.success('Exported!')}><Download className="w-4 h-4 mr-1" />Export</Button>
          <Button variant="outline" size="sm" className="gap-1.5 border-dashed" onClick={() => setQuickCreateOpen(true)}>
            <Zap className="w-3.5 h-3.5 text-amber-500" />Quick Add
          </Button>
          <Button size="sm" onClick={() => setActiveTab('create')}><Plus className="w-4 h-4 mr-1" />New Project</Button>
        </div>

        {/* Quick Create Dialog — name only */}
        <Dialog open={quickCreateOpen} onOpenChange={setQuickCreateOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />Quick Create Project
              </DialogTitle>
              <DialogDescription>Enter a name to create the project instantly. Add details later.</DialogDescription>
            </DialogHeader>
            <Input
              placeholder="e.g. Website Redesign Q3…"
              value={quickName}
              onChange={e => setQuickName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleQuickCreate()}
              autoFocus
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setQuickCreateOpen(false); setQuickName(''); }}>Cancel</Button>
              <Button onClick={handleQuickCreate} disabled={!quickName.trim()} className="gap-1.5">
                <Zap className="w-3.5 h-3.5" />Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="w-max">
            <TabsTrigger value="board"><LayoutGrid className="w-3.5 h-3.5 mr-1" />Board</TabsTrigger>
            <TabsTrigger value="create"><Plus className="w-3.5 h-3.5 mr-1" />Create</TabsTrigger>
            <TabsTrigger value="templates"><BookOpen className="w-3.5 h-3.5 mr-1" />Templates</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="board" className="mt-4">
          <BoardTab projects={projects} setProjects={setProjects} onOpenProject={p => setSelectedProject(p)} />
        </TabsContent>

        <TabsContent value="create" className="mt-4">
          <CreateProjectTab templates={templates} onCreated={handleCreated} />
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <TemplatesTab templates={templates} />
        </TabsContent>
      </Tabs>

      {selectedProject && (
        <ProjectDetailDialog
          project={selectedProject}
          open={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          onUpdate={p => { handleUpdate(p); setSelectedProject(p); }}
        />
      )}
    </div>
  );
}
