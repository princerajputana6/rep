import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  DollarSign,
  BookOpen,
  Shield,
  GitBranch,
  FileCheck,
  Layers,
  List,
  TrendingUp,
  ArrowRight,
  Zap,
  Filter,
  Target,
  ChevronRight,
  Calendar,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { toast } from 'sonner';
import { useAgencyContext } from '@/app/context/AgencyContext';
import { borrowRequestsApi } from '@/lib/api';

interface SuggestedPartner {
  agency: string;
  matchScore: number;
  avgRate: number;
  estimatedCost: number;
  availability: 'high' | 'medium' | 'low';
  pastSuccessRate: number;
}

interface BorrowRequest {
  id: string;
  requestedBy: string;
  agency: string;
  project: string;
  role: string;
  skills: string[];
  duration: string;
  hours: number;
  partnerAgency: string;
  estimatedCost: number;
  internalCostEquivalent: number;
  status: 'draft' | 'submitted' | 'capacity-check' | 'partner-review' | 'finance-review' | 'approved' | 'rejected';
  priority: 'critical' | 'high' | 'medium' | 'low';
  createdDate: string;
  slaDeadline: string;
  justification: string;
  routingScore: number;
  suggestedPartners: SuggestedPartner[];
}

const TODAY = new Date('2026-04-11');

function daysBetween(dateStr: string): number {
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
}


const PIPELINE_STAGES: Array<BorrowRequest['status']> = [
  'submitted',
  'capacity-check',
  'partner-review',
  'finance-review',
  'approved',
];

const STAGE_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  'capacity-check': 'Capacity Check',
  'partner-review': 'Partner Review',
  'finance-review': 'Finance Review',
  approved: 'Decision',
};

const ROLE_RATES: Record<string, number> = {
  'Senior Full-Stack Developer': 175,
  'UX/UI Designer': 125,
  'DevOps Engineer': 160,
  'Data Engineer': 165,
  'Motion Designer': 130,
  'Product Manager': 150,
  'Business Analyst': 120,
  'QA Engineer': 110,
};

function getSlaInfo(slaDeadline: string): { days: number; className: string; label: string } {
  const days = daysBetween(slaDeadline);
  if (days <= 2) return { days, className: 'bg-red-100 text-red-700 border-red-200', label: `${days}d left` };
  if (days <= 5) return { days, className: 'bg-amber-100 text-amber-700 border-amber-200', label: `${days}d left` };
  return { days, className: 'bg-green-100 text-green-700 border-green-200', label: `${days}d left` };
}

function getPriorityInfo(priority: BorrowRequest['priority']): { className: string; label: string } {
  switch (priority) {
    case 'critical': return { className: 'bg-red-100 text-red-700 border-red-200', label: 'Critical' };
    case 'high': return { className: 'bg-orange-100 text-orange-700 border-orange-200', label: 'High' };
    case 'medium': return { className: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Medium' };
    case 'low': return { className: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Low' };
  }
}

function getStatusLabel(status: BorrowRequest['status']): string {
  const map: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    'capacity-check': 'Capacity Check',
    'partner-review': 'Partner Review',
    'finance-review': 'Finance Review',
    approved: 'Approved',
    rejected: 'Rejected',
  };
  return map[status] ?? status;
}

function getAvailabilityColor(avail: 'high' | 'medium' | 'low'): string {
  switch (avail) {
    case 'high': return 'text-green-700';
    case 'medium': return 'text-amber-700';
    case 'low': return 'text-red-700';
  }
}

export function BorrowRequests() {
  const { selectedAgency } = useAgencyContext();
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    borrowRequestsApi.list().then(result => {
      const mapped: BorrowRequest[] = result.data.map((r: any) => ({
        id: r.id,
        requestedBy: r.createdBy?.name ?? r.createdBy ?? 'Unknown',
        agency: r.requestingTeam,
        project: r.projectName ?? '',
        role: r.resourceName,
        skills: (() => { try { return JSON.parse(r.skillsNeeded); } catch { return r.skillsNeeded ? r.skillsNeeded.split(',').map((s: string) => s.trim()) : []; } })(),
        duration: `${r.durationWeeks} weeks`,
        hours: Math.round((r.allocationPct / 100) * r.durationWeeks * 40),
        partnerAgency: r.owningTeam,
        estimatedCost: r.partnerCost ?? 0,
        internalCostEquivalent: r.internalCost ?? 0,
        status: (r.status as BorrowRequest['status']) ?? 'submitted',
        priority: (r.priority as BorrowRequest['priority']) ?? 'medium',
        createdDate: r.createdAt.slice(0, 10),
        slaDeadline: r.slaDeadline,
        justification: r.notes ?? '',
        routingScore: r.routingScore ?? 0,
        suggestedPartners: [],
      }));
      setRequests(mapped);
    }).catch(err => {
      toast.error(err.message);
    }).finally(() => {
      setLoading(false);
    });
  }, []);
  const [activeTab, setActiveTab] = useState('active');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | BorrowRequest['priority']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | BorrowRequest['status']>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Create form state
  const [newProject, setNewProject] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newHours, setNewHours] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newPriority, setNewPriority] = useState<BorrowRequest['priority']>('medium');
  const [newJustification, setNewJustification] = useState('');
  const [newPartner, setNewPartner] = useState('auto');

  const pendingStatuses: Array<BorrowRequest['status']> = ['submitted', 'capacity-check', 'partner-review', 'finance-review'];

  const filtered = requests.filter((r) => {
    const matchSearch =
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPriority = priorityFilter === 'all' || r.priority === priorityFilter;
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchAgency =
      selectedAgency === 'all' ||
      r.agency === selectedAgency ||
      r.partnerAgency === selectedAgency;
    return matchSearch && matchPriority && matchStatus && matchAgency;
  });

  function advanceStage(id: string) {
    borrowRequestsApi.approve(id).then((updated: any) => {
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const next = (updated.status as BorrowRequest['status']) ?? r.status;
          toast.success(`${r.id} advanced to ${STAGE_LABELS[next] ?? next}`);
          return { ...r, status: next };
        })
      );
    }).catch(err => {
      toast.error(err.message);
    });
  }

  function approveRequest(id: string) {
    borrowRequestsApi.approve(id).then(() => {
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          toast.success(`Request ${r.id} approved`);
          return { ...r, status: 'approved' as const };
        })
      );
    }).catch((err: any) => {
      toast.error(err.message);
    });
  }

  function rejectRequest(id: string) {
    borrowRequestsApi.reject(id, 'Rejected').then(() => {
      setRequests((prev) =>
        prev.map((r: BorrowRequest) => {
          if (r.id !== id) return r;
          toast.success(`Request ${r.id} rejected`);
          return { ...r, status: 'rejected' as const };
        })
      );
    }).catch(err => {
      toast.error(err.message);
    });
  }

  function handleCreate() {
    if (!newProject || !newRole || !newHours) {
      toast.error('Please fill in required fields: Project, Role, and Hours');
      return;
    }
    const hours = parseInt(newHours, 10);
    const rate = ROLE_RATES[newRole] ?? 150;
    const estimated = hours * rate;
    const internal = Math.round(estimated * 1.35);
    const durationWeeks = newDuration ? parseInt(newDuration, 10) || 4 : 4;
    borrowRequestsApi.create({
      projectName: newProject,
      resourceName: newRole,
      skillsNeeded: [] as string[],
      durationWeeks,
      allocationPct: Math.round((hours / (durationWeeks * 40)) * 100),
      partnerCost: estimated,
      internalCost: internal,
      priority: newPriority,
      notes: newJustification,
      requestingTeam: selectedAgency === 'all' ? 'Acme Digital' : selectedAgency,
      owningTeam: newPartner,
      status: 'submitted',
    }).then(created => {
      const newReq: BorrowRequest = {
        id: created.id,
        requestedBy: (created as any).createdBy?.name ?? (created as any).createdBy ?? 'Unknown',
        agency: created.requestingTeam,
        project: created.projectName ?? newProject,
        role: created.resourceName,
        skills: [],
        duration: `${created.durationWeeks} weeks`,
        hours,
        partnerAgency: created.owningTeam,
        estimatedCost: created.partnerCost ?? estimated,
        internalCostEquivalent: created.internalCost ?? internal,
        status: (created.status as BorrowRequest['status']) ?? 'submitted',
        priority: (created.priority as BorrowRequest['priority']) ?? newPriority,
        createdDate: created.createdAt.slice(0, 10),
        slaDeadline: created.slaDeadline,
        justification: created.notes ?? newJustification,
        routingScore: created.routingScore ?? 0,
        suggestedPartners: [],
      };
      setRequests((prev) => [newReq, ...prev]);
      toast.success(`Request ${created.id} submitted successfully`);
      setShowCreateDialog(false);
      setNewProject('');
      setNewRole('');
      setNewHours('');
      setNewDuration('');
      setNewPriority('medium');
      setNewJustification('');
      setNewPartner('auto');
    }).catch(err => {
      toast.error(err.message);
    });
  }

  // Chart data for Cost Intelligence
  const costChartData = requests
    .filter((r) => pendingStatuses.includes(r.status))
    .map((r) => ({
      name: r.project.length > 18 ? r.project.substring(0, 18) + '…' : r.project,
      'Partner Cost': r.estimatedCost,
      'Internal Cost': r.internalCostEquivalent,
    }));

  const totalSavings = requests
    .filter((r) => pendingStatuses.includes(r.status))
    .reduce((sum, r) => sum + (r.internalCostEquivalent - r.estimatedCost), 0);

  const totalInternalEquivalent = requests
    .filter((r) => pendingStatuses.includes(r.status))
    .reduce((s, r) => s + r.internalCostEquivalent, 0);

  const avgRoutingScore = Math.round(
    requests.filter((r) => pendingStatuses.includes(r.status)).reduce((s, r) => s + r.routingScore, 0) /
      Math.max(1, requests.filter((r) => pendingStatuses.includes(r.status)).length)
  );

  const kanbanColumns: Array<{ key: BorrowRequest['status']; label: string }> = [
    { key: 'submitted', label: 'Submitted' },
    { key: 'capacity-check', label: 'Capacity Check' },
    { key: 'partner-review', label: 'Partner Review' },
    { key: 'finance-review', label: 'Finance Review' },
    { key: 'approved', label: 'Decision' },
  ];

  const renderRequestCard = (r: BorrowRequest) => {
    const sla = getSlaInfo(r.slaDeadline);
    const prio = getPriorityInfo(r.priority);
    const isPending = pendingStatuses.includes(r.status);

    return (
      <Card key={r.id} className="border-gray-200">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs text-gray-500 font-mono">{r.id}</div>
              <div className="font-medium text-gray-900 text-sm mt-0.5">{r.project}</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="outline" className={`text-xs ${prio.className}`}>{prio.label}</Badge>
              <Badge variant="outline" className={`text-xs ${sla.className}`}>
                <Calendar className="w-3 h-3 mr-1" />
                {sla.label}
              </Badge>
            </div>
          </div>

          <div>
            <Badge variant="outline" className="font-normal text-xs">{r.role}</Badge>
            {r.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {r.skills.slice(0, 3).map((s) => (
                  <span key={s} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{s}</span>
                ))}
                {r.skills.length > 3 && (
                  <span className="text-xs text-gray-400">+{r.skills.length - 3}</span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-gray-500">Est. Cost</div>
              <div className="font-semibold text-gray-900">${r.estimatedCost.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-500">Internal</div>
              <div className="font-semibold text-green-700">${r.internalCostEquivalent.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-500">Routing</div>
              <div className={`font-semibold ${r.routingScore >= 80 ? 'text-green-700' : r.routingScore >= 60 ? 'text-amber-700' : 'text-red-700'}`}>
                {r.routingScore}/100
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Users className="w-3 h-3" />
            {r.partnerAgency === 'auto' ? 'Partner: Auto-select' : `Partner: ${r.partnerAgency}`}
          </div>

          {isPending ? (
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-xs h-7 flex-1"
                onClick={() => approveRequest(r.id)}
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 text-xs h-7 flex-1"
                onClick={() => rejectRequest(r.id)}
              >
                <XCircle className="w-3 h-3 mr-1" />
                Reject
              </Button>
            </div>
          ) : (
            <div className="pt-1">
              <Badge
                className={
                  r.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : r.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }
              >
                {getStatusLabel(r.status)}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderRequestRow = (r: BorrowRequest) => {
    const sla = getSlaInfo(r.slaDeadline);
    const prio = getPriorityInfo(r.priority);
    const isPending = pendingStatuses.includes(r.status);

    return (
      <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-3 px-4">
          <div className="font-mono text-xs text-gray-500">{r.id}</div>
          <div className="font-medium text-sm text-gray-900">{r.project}</div>
        </td>
        <td className="py-3 px-4 text-sm">{r.role}</td>
        <td className="py-3 px-4 text-sm">{r.requestedBy}</td>
        <td className="py-3 px-4">
          <Badge variant="outline" className={`text-xs ${prio.className}`}>{prio.label}</Badge>
        </td>
        <td className="py-3 px-4">
          <Badge variant="outline" className={`text-xs ${sla.className}`}>{sla.label}</Badge>
        </td>
        <td className="py-3 px-4 text-sm font-medium">${r.estimatedCost.toLocaleString()}</td>
        <td className="py-3 px-4 text-sm font-medium text-green-700">${r.internalCostEquivalent.toLocaleString()}</td>
        <td className="py-3 px-4 text-sm">{r.routingScore}/100</td>
        <td className="py-3 px-4">
          {isPending ? (
            <div className="flex gap-1">
              <Button size="sm" className="bg-green-600 hover:bg-green-700 h-7 text-xs" onClick={() => approveRequest(r.id)}>
                Approve
              </Button>
              <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 h-7 text-xs" onClick={() => rejectRequest(r.id)}>
                Reject
              </Button>
            </div>
          ) : (
            <Badge className={r.status === 'approved' ? 'bg-green-100 text-green-800' : r.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}>
              {getStatusLabel(r.status)}
            </Badge>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Borrow Requests</h1>
          <p className="text-gray-600 mt-1">
            Cross-agency resource borrowing with intelligent routing and cost intelligence
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <div className="text-2xl font-semibold text-amber-600">
              {requests.filter((r) => pendingStatuses.includes(r.status)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Approved</span>
            </div>
            <div className="text-2xl font-semibold text-green-600">
              {requests.filter((r) => r.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-gray-600">Rejected</span>
            </div>
            <div className="text-2xl font-semibold text-red-600">
              {requests.filter((r) => r.status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">Pending Cost</span>
            </div>
            <div className="text-2xl font-semibold text-blue-600">
              ${requests.filter((r) => pendingStatuses.includes(r.status)).reduce((s, r) => s + r.estimatedCost, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-600">Pot. Savings</span>
            </div>
            <div className="text-2xl font-semibold text-purple-600">
              ${totalSavings.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">
            <FileCheck className="w-4 h-4 mr-2" />
            Active Requests
          </TabsTrigger>
          <TabsTrigger value="pipeline">
            <GitBranch className="w-4 h-4 mr-2" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="cost">
            <BarChart3 className="w-4 h-4 mr-2" />
            Cost Intelligence
          </TabsTrigger>
          <TabsTrigger value="governance">
            <BookOpen className="w-4 h-4 mr-2" />
            Governance
          </TabsTrigger>
        </TabsList>

        {/* ACTIVE REQUESTS TAB */}
        <TabsContent value="active" className="space-y-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Filter className="w-4 h-4" />
                  Filters:
                </div>
                <Input
                  placeholder="Search requests..."
                  className="w-56 h-9 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as 'all' | BorrowRequest['priority'])}
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | BorrowRequest['status'])}
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="capacity-check">Capacity Check</option>
                  <option value="partner-review">Partner Review</option>
                  <option value="finance-review">Finance Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <div className="ml-auto flex items-center gap-1 border rounded-md p-0.5">
                  <Button
                    size="sm"
                    variant={viewMode === 'card' ? 'default' : 'ghost'}
                    className="h-7 px-2"
                    onClick={() => setViewMode('card')}
                  >
                    <Layers className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    className="h-7 px-2"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {loading && <p className="text-sm text-gray-500">Loading...</p>}
          {viewMode === 'card' ? (
            filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No requests match your filters.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(renderRequestCard)}
              </div>
            )
          ) : (
            <Card>
              <CardContent className="p-0">
                {filtered.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No requests match your filters.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="py-3 px-4 text-left font-medium text-gray-600">Request</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-600">Role</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-600">Requested By</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-600">Priority</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-600">SLA</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-600">Est. Cost</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-600">Internal Cost</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-600">Routing</th>
                          <th className="py-3 px-4 text-left font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(renderRequestRow)}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* PIPELINE TAB */}
        <TabsContent value="pipeline" className="mt-6">
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {kanbanColumns.map((col) => {
                const colRequests = requests.filter((r) => r.status === col.key);
                return (
                  <div key={col.key} className="w-64 flex-shrink-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-700 text-sm">{col.label}</h3>
                      <Badge variant="outline" className="text-xs">{colRequests.length}</Badge>
                    </div>
                    <div className="space-y-3">
                      {colRequests.length === 0 && (
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-xs text-gray-400">
                          No requests
                        </div>
                      )}
                      {colRequests.map((r) => {
                        const sla = getSlaInfo(r.slaDeadline);
                        const prio = getPriorityInfo(r.priority);
                        const stageIdx = PIPELINE_STAGES.indexOf(r.status as typeof PIPELINE_STAGES[number]);
                        const canAdvance = stageIdx >= 0 && stageIdx < PIPELINE_STAGES.length - 1;
                        return (
                          <Card key={r.id} className="border-gray-200 shadow-sm">
                            <CardContent className="p-3 space-y-2">
                              <div className="flex items-start justify-between gap-1">
                                <div className="font-mono text-xs text-gray-400">{r.id}</div>
                                <Badge variant="outline" className={`text-xs ${prio.className}`}>{prio.label}</Badge>
                              </div>
                              <div className="font-medium text-gray-900 text-xs leading-snug">{r.project}</div>
                              <div className="text-xs text-gray-500">{r.role}</div>
                              <div className="flex items-center justify-between text-xs">
                                <Badge variant="outline" className={sla.className}>{sla.label}</Badge>
                                <span className="text-gray-600">${r.estimatedCost.toLocaleString()}</span>
                              </div>
                              {canAdvance && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full h-7 text-xs"
                                  onClick={() => advanceStage(r.id)}
                                >
                                  <ArrowRight className="w-3 h-3 mr-1" />
                                  Advance
                                </Button>
                              )}
                              {col.key === 'approved' && (
                                <Badge className="bg-green-100 text-green-800 w-full justify-center text-xs">
                                  Approved
                                </Badge>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {/* Rejected column */}
              <div className="w-64 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-700 text-sm">Rejected</h3>
                  <Badge variant="outline" className="text-xs">{requests.filter((r) => r.status === 'rejected').length}</Badge>
                </div>
                <div className="space-y-3">
                  {requests.filter((r) => r.status === 'rejected').length === 0 && (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-xs text-gray-400">
                      No requests
                    </div>
                  )}
                  {requests.filter((r) => r.status === 'rejected').map((r) => {
                    const prio = getPriorityInfo(r.priority);
                    return (
                      <Card key={r.id} className="border-red-200 shadow-sm">
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-start justify-between gap-1">
                            <div className="font-mono text-xs text-gray-400">{r.id}</div>
                            <Badge variant="outline" className={`text-xs ${prio.className}`}>{prio.label}</Badge>
                          </div>
                          <div className="font-medium text-gray-900 text-xs leading-snug">{r.project}</div>
                          <div className="text-xs text-gray-500">{r.role}</div>
                          <Badge className="bg-red-100 text-red-800 text-xs">Rejected</Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* COST INTELLIGENCE TAB */}
        <TabsContent value="cost" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-5 h-5 text-green-700" />
                  <span className="font-semibold text-green-900">Total Cost Savings</span>
                </div>
                <div className="text-3xl font-bold text-green-800">${totalSavings.toLocaleString()}</div>
                <div className="text-sm text-green-700 mt-1">vs. hiring internally for pending requests</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Avg. Routing Score</span>
                </div>
                <div className="text-3xl font-bold text-blue-700">{avgRoutingScore}/100</div>
                <div className="text-sm text-gray-500 mt-1">For active requests</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold text-gray-900">Savings Rate</span>
                </div>
                <div className="text-3xl font-bold text-amber-700">
                  {Math.round((totalSavings / Math.max(1, totalInternalEquivalent)) * 100)}%
                </div>
                <div className="text-sm text-gray-500 mt-1">Cost reduction vs. internal hiring</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Partner Cost vs. Internal Cost Equivalent</CardTitle>
            </CardHeader>
            <CardContent>
              {costChartData.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No pending requests with cost data</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costChartData} margin={{ top: 5, right: 20, bottom: 40, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" />
                    <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="Partner Cost" fill="#3b82f6" name="Partner Cost" />
                    <Bar dataKey="Internal Cost" fill="#10b981" name="Internal Cost Equiv." />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Routing Scores &amp; Partner Match Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="py-3 px-4 text-left font-medium text-gray-600">Request</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-600">Role</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-600">Routing Score</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-600">Top Partner</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-600">Match Score</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-600">Avg Rate</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-600">Availability</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-600">Success Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.filter((r) => pendingStatuses.includes(r.status)).map((r) => {
                      const top = r.suggestedPartners[0];
                      return (
                        <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-mono text-xs text-gray-400">{r.id}</div>
                            <div className="font-medium text-gray-900">{r.project.substring(0, 22)}</div>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-600">{r.role}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${r.routingScore >= 80 ? 'bg-green-500' : r.routingScore >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                  style={{ width: `${r.routingScore}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold">{r.routingScore}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-xs font-medium">{top?.agency ?? '—'}</td>
                          <td className="py-3 px-4 text-xs font-semibold text-blue-700">{top ? `${top.matchScore}%` : '—'}</td>
                          <td className="py-3 px-4 text-xs">{top ? `$${top.avgRate}/hr` : '—'}</td>
                          <td className="py-3 px-4 text-xs">
                            {top ? (
                              <span className={`font-medium capitalize ${getAvailabilityColor(top.availability)}`}>
                                {top.availability}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="py-3 px-4 text-xs font-medium text-green-700">{top ? `${top.pastSuccessRate}%` : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GOVERNANCE TAB */}
        <TabsContent value="governance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                How It Works — Borrow Request Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Routing Workflow</h3>
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-blue-200" />
                  <div className="space-y-6">
                    {[
                      {
                        icon: FileCheck,
                        title: 'Request Submission',
                        desc: 'Resource manager submits a borrow request specifying role, skills, hours, duration, and justification. The system auto-generates a routing score based on urgency, skills match, and available partners.',
                      },
                      {
                        icon: Zap,
                        title: 'Capacity Check',
                        desc: 'Automated check validates whether the requesting agency has internal capacity. If utilization is below 80%, the system flags for internal reallocation first.',
                      },
                      {
                        icon: Target,
                        title: 'Partner Matching & Review',
                        desc: 'AI-powered routing identifies partner agencies with the right skills and availability. Match scores are calculated based on historical performance, skill alignment, and current capacity.',
                      },
                      {
                        icon: DollarSign,
                        title: 'Finance Review',
                        desc: 'For requests exceeding $50K, a mandatory finance review is triggered. Cost comparison between partner and internal equivalent is presented for approval.',
                      },
                      {
                        icon: CheckCircle,
                        title: 'Decision & Deployment',
                        desc: 'Approved requests trigger automatic onboarding workflows. Partner confirmation, contract generation, and access provisioning are initiated via integrations.',
                      },
                    ].map((step, i) => {
                      const Icon = step.icon;
                      return (
                        <div key={i} className="flex gap-4 relative">
                          <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center flex-shrink-0 z-10">
                            <Icon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="pt-1.5 pb-4">
                            <div className="font-semibold text-gray-900">{i + 1}. {step.title}</div>
                            <div className="text-sm text-gray-600 mt-1">{step.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Cost Estimation Formula
                </h3>
                <div className="font-mono text-sm text-blue-800 space-y-1">
                  <div>Estimated Cost = Hours × Partner Rate</div>
                  <div>Internal Equivalent = Hours × (Internal Rate × 1.35 overhead factor)</div>
                  <div className="pt-1 text-blue-700">Savings = Internal Equivalent − Estimated Cost</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    icon: Shield,
                    title: 'Data Privacy',
                    desc: 'Individual performance data is never shared across agencies. Only role, skills, and availability are visible to partner agencies during matching.',
                    color: 'text-green-600',
                    bg: 'bg-green-50 border-green-200',
                  },
                  {
                    icon: AlertCircle,
                    title: 'SLA Enforcement',
                    desc: 'Every request has an SLA deadline. Red badge = ≤2 days remaining. Amber = ≤5 days. Escalation notifications are sent at 48h and 24h marks.',
                    color: 'text-amber-600',
                    bg: 'bg-amber-50 border-amber-200',
                  },
                  {
                    icon: GitBranch,
                    title: 'Audit Trail',
                    desc: 'Every state transition, approval, and rejection is logged with timestamp, user, and rationale. Full audit history is available for compliance reporting.',
                    color: 'text-purple-600',
                    bg: 'bg-purple-50 border-purple-200',
                  },
                ].map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <Card key={i} className={`border ${card.bg}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`w-5 h-5 ${card.color}`} />
                          <span className="font-semibold text-gray-900">{card.title}</span>
                        </div>
                        <p className="text-sm text-gray-600">{card.desc}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  {[
                    {
                      q: 'Who can submit a borrow request?',
                      a: 'Any Resource Manager or Project Lead with the Resourcing role can submit borrow requests. Agency Admins can submit on behalf of their team.',
                    },
                    {
                      q: 'How is the routing score calculated?',
                      a: 'The routing score (0–100) is a composite of: urgency weight (SLA proximity), skill match depth, partner historical performance, and current capacity availability. Scores above 80 trigger auto-shortlisting.',
                    },
                    {
                      q: 'What happens if a request is rejected?',
                      a: 'The requesting agency is notified with the rejection reason. They can revise and resubmit with updated parameters, or escalate to an Agency Admin for manual override review.',
                    },
                    {
                      q: 'Are borrow costs included in project financials?',
                      a: 'Yes — approved borrow costs are automatically reflected in the Financial Dashboard under "External Resource Costs" and factored into project margin calculations.',
                    },
                  ].map((faq, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">{faq.q}</div>
                          <div className="text-sm text-gray-600 mt-1">{faq.a}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Request Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              New Borrow Request
            </DialogTitle>
            <DialogDescription>
              Submit a cross-agency resource request with intelligent routing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="create-project">Project *</Label>
              <Select value={newProject} onValueChange={setNewProject}>
                <SelectTrigger id="create-project">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Digital Transformation Initiative">Digital Transformation Initiative</SelectItem>
                  <SelectItem value="Mobile App Redesign">Mobile App Redesign</SelectItem>
                  <SelectItem value="Cloud Migration Initiative">Cloud Migration Initiative</SelectItem>
                  <SelectItem value="CRM Implementation">CRM Implementation</SelectItem>
                  <SelectItem value="Brand Campaign Launch">Brand Campaign Launch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-role">Role *</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger id="create-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(ROLE_RATES).map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="create-hours">Hours *</Label>
                <Input
                  id="create-hours"
                  type="number"
                  placeholder="e.g. 160"
                  value={newHours}
                  onChange={(e) => setNewHours(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-duration">Duration</Label>
                <Input
                  id="create-duration"
                  placeholder="e.g. 4 weeks"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-priority">Priority</Label>
              <Select value={newPriority} onValueChange={(v) => setNewPriority(v as BorrowRequest['priority'])}>
                <SelectTrigger id="create-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-partner">Preferred Partner</Label>
              <Select value={newPartner} onValueChange={setNewPartner}>
                <SelectTrigger id="create-partner">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto — Best Match</SelectItem>
                  <SelectItem value="CreativeCo">CreativeCo</SelectItem>
                  <SelectItem value="Digital Wave">Digital Wave</SelectItem>
                  <SelectItem value="TechVentures">TechVentures</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-justification">Business Justification</Label>
              <Textarea
                id="create-justification"
                placeholder="Describe why an external resource is needed and the business impact..."
                rows={3}
                value={newJustification}
                onChange={(e) => setNewJustification(e.target.value)}
              />
            </div>

            {newRole && newHours && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <div className="font-medium text-blue-900 mb-1">Cost Estimate</div>
                <div className="text-blue-700">
                  Partner cost: ${(parseInt(newHours || '0', 10) * (ROLE_RATES[newRole] ?? 150)).toLocaleString()}
                  {' '}(${ROLE_RATES[newRole] ?? 150}/hr × {newHours}h)
                </div>
                <div className="text-blue-600 text-xs mt-0.5">
                  Internal equivalent: ${Math.round(parseInt(newHours || '0', 10) * (ROLE_RATES[newRole] ?? 150) * 1.35).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
