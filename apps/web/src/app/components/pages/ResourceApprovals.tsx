import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Checkbox } from '@/app/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
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
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Calendar,
  FileText,
  Eye,
  CheckCheck,
  Ban,
  Layers,
  List,
  Zap,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Separator } from '@/app/components/ui/separator';
import { useAgencyContext } from '@/app/context/AgencyContext';
import { toast } from 'sonner';
import { resourceApprovalsApi } from '@/lib/api';

interface ResourceApprovalRequest {
  id: string;
  resourceName: string;
  resourceEmail: string;
  role: string;
  project: string;
  projectId: string;
  task: string;
  taskId: string;
  requestedBy: string;
  requestedDate: string;
  startDate: string;
  endDate: string;
  allocatedHours: number;
  utilizationPercent: number;
  billingRate: number;
  costRate: number;
  estimatedRevenue: number;
  estimatedCost: number;
  marginPercent: number;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  resourceAgency: string;
  requestingAgency: string;
  skills: string[];
  yearsOfExperience: number;
  slaDaysLeft: number;
}

export function ResourceApprovals() {
  const { selectedAgency } = useAgencyContext();
  const [approvalRequests, setApprovalRequests] = useState<ResourceApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = () => {
    resourceApprovalsApi.list().then(result => {
      const mapped: ResourceApprovalRequest[] = result.data.map(r => ({
        id: r.id,
        resourceName: r.resourceName,
        resourceEmail: '',
        role: r.requestedRole,
        project: r.projectName,
        projectId: '',
        task: '',
        taskId: '',
        requestedBy: r.requestedBy,
        requestedDate: r.createdAt.slice(0, 10),
        startDate: r.startDate,
        endDate: r.endDate ?? '',
        allocatedHours: Math.round((r.allocationPct / 100) * 160),
        utilizationPercent: r.allocationPct,
        billingRate: r.billableRate ?? 0,
        costRate: r.hourlyRate ?? 0,
        estimatedRevenue: r.billableRate ? Math.round((r.allocationPct / 100) * 160 * r.billableRate) : 0,
        estimatedCost: r.hourlyRate ? Math.round((r.allocationPct / 100) * 160 * r.hourlyRate) : 0,
        marginPercent: r.marginPct ?? 0,
        status: (r.status as ResourceApprovalRequest['status']) ?? 'pending',
        priority: 'medium' as ResourceApprovalRequest['priority'],
        resourceAgency: '',
        requestingAgency: '',
        skills: [],
        yearsOfExperience: 0,
        slaDaysLeft: Math.ceil((new Date(r.slaDeadline).getTime() - Date.now()) / 86400000),
      }));
      setApprovalRequests(mapped);
    }).catch(err => {
      toast.error(err.message);
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => { fetchList(); }, []);
  const [selectedTab, setSelectedTab] = useState('pending');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | ResourceApprovalRequest['priority']>('all');
  const [selectedRequest, setSelectedRequest] = useState<ResourceApprovalRequest | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredApprovalRequests = approvalRequests.filter((request) => {
    const matchesSearch =
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.resourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestingAgency.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    const matchesGlobalAgency =
      selectedAgency === 'all' ||
      request.requestingAgency === selectedAgency ||
      request.resourceAgency === selectedAgency;
    return matchesSearch && matchesPriority && matchesGlobalAgency;
  });

  const pendingRequests = filteredApprovalRequests.filter(r => r.status === 'pending');
  const approvedRequests = filteredApprovalRequests.filter(r => r.status === 'approved');
  const rejectedRequests = filteredApprovalRequests.filter(r => r.status === 'rejected');

  const handleApprove = (request: ResourceApprovalRequest) => {
    setSelectedRequest(request);
    setShowApprovalDialog(true);
  };

  const handleReject = (request: ResourceApprovalRequest) => {
    setSelectedRequest(request);
    setShowRejectionDialog(true);
  };

  const confirmApproval = () => {
    if (!selectedRequest) return;
    const id = selectedRequest.id;
    const name = selectedRequest.resourceName;
    resourceApprovalsApi.approve(id).then(() => {
      setApprovalRequests((prev) =>
        prev.map((r) => r.id === id ? { ...r, status: 'approved' as const } : r)
      );
      toast.success(`${name} approved`);
    }).catch(err => {
      toast.error(err.message);
    }).finally(() => {
      setShowApprovalDialog(false);
      setApprovalNotes('');
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      setSelectedRequest(null);
    });
  };

  const confirmRejection = () => {
    if (!selectedRequest) return;
    const id = selectedRequest.id;
    resourceApprovalsApi.reject(id, rejectionReason).then(() => {
      setApprovalRequests((prev) =>
        prev.map((r) => r.id === id ? { ...r, status: 'rejected' as const } : r)
      );
      toast.success(`Request rejected`);
    }).catch(err => {
      toast.error(err.message);
    }).finally(() => {
      setShowRejectionDialog(false);
      setRejectionReason('');
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      setSelectedRequest(null);
    });
  };

  const handleBulkApprove = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    resourceApprovalsApi.bulkApprove(ids).then(() => {
      fetchList();
      toast.success(`${ids.length} request${ids.length > 1 ? 's' : ''} approved`);
      setSelectedIds(new Set());
    }).catch(err => {
      toast.error(err.message);
    });
  };

  const handleQuickApproveHighMargin = () => {
    const highMargin = approvalRequests.filter((r) => r.status === 'pending' && r.marginPercent >= 38);
    if (highMargin.length === 0) {
      toast.info('No pending requests with margin ≥ 38%');
      return;
    }
    const ids = new Set(highMargin.map((r) => r.id));
    setApprovalRequests((prev) =>
      prev.map((r) => (ids.has(r.id) ? { ...r, status: 'approved' as const } : r))
    );
    toast.success(`${highMargin.length} high-margin request${highMargin.length > 1 ? 's' : ''} approved`);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      highMargin.forEach((r) => next.delete(r.id));
      return next;
    });
  };

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSlaBadge = (slaDaysLeft: number) => {
    if (slaDaysLeft <= 2) return { label: `${slaDaysLeft}d left`, className: 'bg-red-100 text-red-700 border-red-200' };
    if (slaDaysLeft <= 5) return { label: `${slaDaysLeft}d left`, className: 'bg-amber-100 text-amber-700 border-amber-200' };
    return null; // don't show badge if plenty of time
  };

  const ApprovalChain = ({ request }: { request: ResourceApprovalRequest }) => {
    const isHighValue = request.estimatedRevenue >= 50000;
    const steps = [
      { label: 'Resource Manager', active: true, desc: 'Current step' },
      { label: 'Finance Review', active: false, desc: isHighValue ? `Required — revenue > $50K` : 'Waived — revenue < $50K', required: isHighValue },
      { label: 'Partner Confirmation', active: false, desc: 'Final sign-off from resource agency' },
    ];

    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Approval Chain</h3>
        <div className="flex items-center gap-0">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center">
              <div className={`flex flex-col items-center ${step.active ? 'opacity-100' : 'opacity-60'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 ${
                  step.active
                    ? 'bg-blue-600 text-white border-blue-600'
                    : step.required === false
                    ? 'bg-gray-100 text-gray-400 border-gray-200'
                    : 'bg-white text-gray-600 border-gray-300'
                }`}>
                  {i + 1}
                </div>
                <div className="text-center mt-1 max-w-20">
                  <div className={`text-xs font-medium ${step.active ? 'text-blue-700' : 'text-gray-500'}`}>
                    {step.label}
                  </div>
                  <div className="text-xs text-gray-400 leading-tight">{step.desc}</div>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 w-8 mx-1 mb-6 ${i === 0 ? 'bg-blue-300' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRequestsTable = (requests: ResourceApprovalRequest[]) => {
    if (requests.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No resource approval requests found</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            {requests.some(r => r.status === 'pending') && <TableHead className="w-10"></TableHead>}
            <TableHead>Resource</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Project &amp; Task</TableHead>
            <TableHead>Timeline</TableHead>
            <TableHead className="text-right">Hours</TableHead>
            <TableHead className="text-right">Billing Rate</TableHead>
            <TableHead className="text-right">Cost Rate</TableHead>
            <TableHead className="text-right">Margin</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="w-40">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => {
            const slaBadge = getSlaBadge(request.slaDaysLeft);
            return (
              <TableRow key={request.id}>
                {requests.some(r => r.status === 'pending') && (
                  <TableCell>
                    {request.status === 'pending' && (
                      <Checkbox
                        checked={selectedIds.has(request.id)}
                        onCheckedChange={() => toggleSelectId(request.id)}
                      />
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                        {getInitials(request.resourceName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900">{request.resourceName}</div>
                      <div className="text-sm text-gray-500">{request.resourceAgency}</div>
                      {slaBadge && (
                        <Badge variant="outline" className={`text-xs mt-0.5 ${slaBadge.className}`}>
                          {slaBadge.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <Badge variant="outline" className="font-normal">
                      {request.role}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">{request.yearsOfExperience} yrs exp</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900 max-w-xs truncate">{request.project}</div>
                    <div className="text-sm text-gray-500 max-w-xs truncate">{request.task}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{request.taskId}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span>{request.startDate}</span>
                    </div>
                    <div className="text-gray-500">to {request.endDate}</div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div>
                    <div className="font-medium">{request.allocatedHours}</div>
                    <div className="text-xs text-gray-500">{request.utilizationPercent}% util</div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <DollarSign className="w-3 h-3 text-gray-400" />
                    <span className="font-medium text-green-700">{request.billingRate}/hr</span>
                  </div>
                  <div className="text-xs text-gray-500">${request.estimatedRevenue.toLocaleString()} est.</div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <DollarSign className="w-3 h-3 text-gray-400" />
                    <span className="font-medium text-gray-700">{request.costRate}/hr</span>
                  </div>
                  <div className="text-xs text-gray-500">${request.estimatedCost.toLocaleString()} est.</div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <TrendingUp className="w-3 h-3 text-blue-600" />
                    <span className="font-semibold text-blue-700">{request.marginPercent}%</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    ${(request.estimatedRevenue - request.estimatedCost).toLocaleString()}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getPriorityColor(request.priority)}>
                    {request.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  {request.status === 'pending' ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApprove(request)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(request)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setSelectedRequest(request)}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  const renderRequestsCards = (requests: ResourceApprovalRequest[]) => {
    if (requests.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No resource approval requests found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requests.map((request) => {
          const slaBadge = getSlaBadge(request.slaDaysLeft);
          return (
            <Card key={request.id} className="border-gray-200">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {request.status === 'pending' && (
                      <Checkbox
                        checked={selectedIds.has(request.id)}
                        onCheckedChange={() => toggleSelectId(request.id)}
                      />
                    )}
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                        {getInitials(request.resourceName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900">{request.resourceName}</div>
                      <div className="text-sm text-gray-500">{request.resourceAgency}</div>
                      {slaBadge && (
                        <Badge variant="outline" className={`text-xs mt-0.5 ${slaBadge.className}`}>
                          <Calendar className="w-3 h-3 mr-1" />
                          {slaBadge.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className={getPriorityColor(request.priority)}>
                    {request.priority}
                  </Badge>
                </div>
                <div>
                  <Badge variant="outline" className="font-normal">{request.role}</Badge>
                  <div className="text-xs text-gray-500 mt-1">{request.yearsOfExperience} yrs exp</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{request.project}</div>
                  <div className="text-sm text-gray-500">{request.task}</div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-gray-500">Timeline</div>
                    <div className="font-medium">{request.startDate}</div>
                    <div className="text-xs text-gray-500">to {request.endDate}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Hours</div>
                    <div className="font-medium">{request.allocatedHours} ({request.utilizationPercent}% util)</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Billing</div>
                    <div className="font-medium text-green-700">${request.billingRate}/hr</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Margin</div>
                    <div className="font-semibold text-blue-700">{request.marginPercent}%</div>
                  </div>
                </div>
                <div>
                  {request.status === 'pending' ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApprove(request)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(request)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setSelectedRequest(request)}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Resource Approvals</h1>
        <p className="text-gray-600 mt-1">
          Review and approve resource allocations with billing &amp; cost visibility
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <div className="text-sm text-gray-600">Pending Approvals</div>
            </div>
            <div className="text-2xl font-semibold text-amber-600 mt-1">
              {pendingRequests.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCheck className="w-4 h-4 text-green-600" />
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="text-2xl font-semibold text-green-600 mt-1">
              {approvedRequests.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Ban className="w-4 h-4 text-red-600" />
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
            <div className="text-2xl font-semibold text-red-600 mt-1">
              {rejectedRequests.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Est. Revenue (Pending)</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">
              ${pendingRequests.reduce((sum, r) => sum + r.estimatedRevenue, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Avg. Margin (Pending)</div>
            <div className="text-2xl font-semibold text-blue-600 mt-1">
              {pendingRequests.length > 0
                ? Math.round(
                    pendingRequests.reduce((sum, r) => sum + r.marginPercent, 0) /
                      pendingRequests.length
                  )
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Action Bar */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900 text-sm">Smart Actions</span>
            </div>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-xs"
              onClick={handleQuickApproveHighMargin}
            >
              <Zap className="w-3 h-3 mr-1.5" />
              Quick Approve All High Margin (&ge;38%)
            </Button>
            {selectedIds.size > 0 && (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-xs"
                onClick={handleBulkApprove}
              >
                <CheckCheck className="w-3 h-3 mr-1.5" />
                Approve Selected ({selectedIds.size})
              </Button>
            )}
            {selectedIds.size > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-gray-300"
                onClick={() => setSelectedIds(new Set())}
              >
                Clear Selection
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Search by request ID, resource, project, agency"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:col-span-2"
            />
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as 'all' | ResourceApprovalRequest['priority'])}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Resource Approval Requests</CardTitle>
            <div className="flex items-center rounded-md border bg-white p-1">
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-2"
                onClick={() => setViewMode('card')}
              >
                <Layers className="w-4 h-4 mr-1" />
                Card
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-2"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4 mr-1" />
                List
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-gray-500 mb-4">Loading...</p>}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
              <TabsTrigger value="pending" className="relative">
                Pending
                {pendingRequests.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
                    {pendingRequests.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved
                {approvedRequests.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                    {approvedRequests.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected
                {rejectedRequests.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                    {rejectedRequests.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-0">
              {viewMode === 'card' ? renderRequestsCards(pendingRequests) : renderRequestsTable(pendingRequests)}
            </TabsContent>

            <TabsContent value="approved" className="mt-0">
              {viewMode === 'card' ? renderRequestsCards(approvedRequests) : renderRequestsTable(approvedRequests)}
            </TabsContent>

            <TabsContent value="rejected" className="mt-0">
              {viewMode === 'card' ? renderRequestsCards(rejectedRequests) : renderRequestsTable(rejectedRequests)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Governance Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-blue-900">
                Explicit Approval Required - No Auto-Assignment
              </div>
              <div className="text-sm text-blue-700 mt-1">
                All resource allocations require explicit Resource Manager approval with full billing
                and cost transparency. Individual performance data is protected and never exposed in
                cross-agency workflows.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Approve Resource Allocation
            </DialogTitle>
            <DialogDescription>
              Review the details and approve this resource allocation request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6 py-4">
              {/* Resource Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Resource Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {getInitials(selectedRequest.resourceName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900">{selectedRequest.resourceName}</div>
                      <div className="text-sm text-gray-500">{selectedRequest.resourceEmail}</div>
                      <div className="text-sm text-gray-500">{selectedRequest.resourceAgency}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Role</div>
                    <div className="font-medium text-gray-900">{selectedRequest.role}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {selectedRequest.yearsOfExperience} years of experience
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-sm text-gray-600 mb-2">Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Project & Task Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Assignment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Project</div>
                    <div className="font-medium text-gray-900">{selectedRequest.project}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{selectedRequest.projectId}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Task</div>
                    <div className="font-medium text-gray-900">{selectedRequest.task}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{selectedRequest.taskId}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Timeline</div>
                    <div className="font-medium text-gray-900">
                      {selectedRequest.startDate} to {selectedRequest.endDate}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Allocation</div>
                    <div className="font-medium text-gray-900">
                      {selectedRequest.allocatedHours} hours ({selectedRequest.utilizationPercent}% utilization)
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Financial Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Financial Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="text-sm text-green-700">Billing Rate</div>
                      <div className="text-2xl font-semibold text-green-900 mt-1">
                        ${selectedRequest.billingRate}/hr
                      </div>
                      <div className="text-sm text-green-700 mt-2">Estimated Revenue</div>
                      <div className="font-semibold text-green-900">
                        ${selectedRequest.estimatedRevenue.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-700">Cost Rate</div>
                      <div className="text-2xl font-semibold text-gray-900 mt-1">
                        ${selectedRequest.costRate}/hr
                      </div>
                      <div className="text-sm text-gray-700 mt-2">Estimated Cost</div>
                      <div className="font-semibold text-gray-900">
                        ${selectedRequest.estimatedCost.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Card className="bg-blue-50 border-blue-200 mt-4">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-blue-700">Projected Margin</div>
                        <div className="text-3xl font-semibold text-blue-900 mt-1">
                          {selectedRequest.marginPercent}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-blue-700">Net Contribution</div>
                        <div className="text-2xl font-semibold text-blue-900 mt-1">
                          ${(selectedRequest.estimatedRevenue - selectedRequest.estimatedCost).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Approval Chain */}
              <ApprovalChain request={selectedRequest} />

              <Separator />

              {/* Approval Notes */}
              <div className="space-y-2">
                <Label htmlFor="approval-notes">Approval Notes (Optional)</Label>
                <Textarea
                  id="approval-notes"
                  placeholder="Add any notes or conditions for this approval..."
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmApproval}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve Resource Allocation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Reject Resource Allocation
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this resource allocation request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {getInitials(selectedRequest.resourceName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{selectedRequest.resourceName}</div>
                    <div className="text-sm text-gray-600">{selectedRequest.role}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {selectedRequest.project} • {selectedRequest.task}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Select value={rejectionReason} onValueChange={setRejectionReason}>
                  <SelectTrigger id="rejection-reason">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overqualified">Resource overqualified for task</SelectItem>
                    <SelectItem value="underqualified">Resource lacks required skills</SelectItem>
                    <SelectItem value="budget">Budget constraints</SelectItem>
                    <SelectItem value="margin">Insufficient margin</SelectItem>
                    <SelectItem value="availability">Resource availability conflict</SelectItem>
                    <SelectItem value="internal">Internal resource preferred</SelectItem>
                    <SelectItem value="timing">Timeline not aligned</SelectItem>
                    <SelectItem value="other">Other (specify in notes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rejection-notes">Additional Notes</Label>
                <Textarea
                  id="rejection-notes"
                  placeholder="Provide additional context for the rejection..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmRejection}
              disabled={!rejectionReason}
              variant="destructive"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Resource Allocation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
