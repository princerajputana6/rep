/**
 * Enhanced Borrow Requests with Task Mapping, Custom Forms, and Agency Info
 */

import { useState } from 'react';
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
import { Checkbox } from '@/app/components/ui/checkbox';
import {
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  DollarSign,
  Building2,
  Calendar,
  Layers,
  FileText,
  Link2,
  Info,
  Eye,
  MessageSquare,
  Paperclip,
  Edit,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Task {
  id: string;
  name: string;
  project: string;
  duration: string;
  priority: 'low' | 'medium' | 'high';
}

interface CustomFormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox';
  required: boolean;
  options?: string[]; // For select type
}

interface CustomForm {
  id: string;
  name: string;
  fields: CustomFormField[];
}

interface Agency {
  id: string;
  name: string;
  location: string;
  specialties: string[];
  availableResources: number;
}

interface BorrowRequest {
  id: string;
  requestedBy: string;
  requestingAgency: Agency;
  project: string;
  role: string;
  duration: string;
  hours: number;
  partnerAgency: string;
  estimatedCost: string;
  status: 'pending' | 'approved' | 'rejected' | 'in-review';
  createdDate: string;
  suggestedResources: number;
  mappedTasks: Task[];
  customFormResponses?: Record<string, any>;
  customFormId?: string;
  agencyNotes?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

// Mock data
const mockAgencies: Agency[] = [
  {
    id: 'agency_1',
    name: 'Acme Digital',
    location: 'New York, NY',
    specialties: ['Web Development', 'Mobile Apps', 'Cloud Infrastructure'],
    availableResources: 25,
  },
  {
    id: 'agency_2',
    name: 'CreativeCo',
    location: 'San Francisco, CA',
    specialties: ['Design', 'Branding', 'UX/UI'],
    availableResources: 18,
  },
  {
    id: 'agency_3',
    name: 'TechVentures',
    location: 'Austin, TX',
    specialties: ['Data Analytics', 'AI/ML', 'Backend Development'],
    availableResources: 30,
  },
  {
    id: 'agency_4',
    name: 'Digital Wave',
    location: 'Seattle, WA',
    specialties: ['DevOps', 'Security', 'Infrastructure'],
    availableResources: 22,
  },
];

const mockTasks: Task[] = [
  {
    id: 'task_1',
    name: 'Frontend Development Sprint 1',
    project: 'Digital Transformation Initiative',
    duration: '2 weeks',
    priority: 'high',
  },
  {
    id: 'task_2',
    name: 'API Integration',
    project: 'Digital Transformation Initiative',
    duration: '1 week',
    priority: 'medium',
  },
  {
    id: 'task_3',
    name: 'Database Schema Design',
    project: 'Digital Transformation Initiative',
    duration: '3 days',
    priority: 'high',
  },
  {
    id: 'task_4',
    name: 'User Testing Phase 1',
    project: 'Mobile App Redesign',
    duration: '1 week',
    priority: 'medium',
  },
  {
    id: 'task_5',
    name: 'Performance Optimization',
    project: 'Data Analytics Platform',
    duration: '2 weeks',
    priority: 'low',
  },
];

const mockCustomForms: CustomForm[] = [
  {
    id: 'form_1',
    name: 'Standard Borrow Request Form',
    fields: [
      { id: 'field_1', label: 'Project Budget Allocation', type: 'number', required: true },
      { id: 'field_2', label: 'Technical Requirements', type: 'textarea', required: true },
      { id: 'field_3', label: 'Preferred Start Date', type: 'date', required: true },
      { id: 'field_4', label: 'Resource Level', type: 'select', required: true, options: ['Junior', 'Mid', 'Senior', 'Lead'] },
      { id: 'field_5', label: 'Remote Work Acceptable', type: 'checkbox', required: false },
    ],
  },
  {
    id: 'form_2',
    name: 'Urgent Resource Request',
    fields: [
      { id: 'field_6', label: 'Reason for Urgency', type: 'textarea', required: true },
      { id: 'field_7', label: 'Business Impact if Delayed', type: 'textarea', required: true },
      { id: 'field_8', label: 'Escalation Contact', type: 'text', required: true },
    ],
  },
];

const mockRequests: BorrowRequest[] = [
  {
    id: 'BR-001',
    requestedBy: 'John Smith',
    requestingAgency: mockAgencies[0],
    project: 'Digital Transformation Initiative',
    role: 'Senior Developer',
    duration: '3 months',
    hours: 480,
    partnerAgency: 'CreativeCo',
    estimatedCost: '$72,000',
    status: 'pending',
    createdDate: '2026-02-10',
    suggestedResources: 3,
    mappedTasks: [mockTasks[0], mockTasks[1]],
    customFormId: 'form_1',
    customFormResponses: {
      field_1: '75000',
      field_2: 'React, Node.js, PostgreSQL experience required',
      field_3: '2026-02-15',
      field_4: 'Senior',
      field_5: true,
    },
    agencyNotes: 'Prefer resources with fintech experience',
    urgency: 'high',
  },
  {
    id: 'BR-002',
    requestedBy: 'Sarah Johnson',
    requestingAgency: mockAgencies[2],
    project: 'Mobile App Redesign',
    role: 'UX Designer',
    duration: '2 months',
    hours: 320,
    partnerAgency: 'Digital Wave',
    estimatedCost: '$32,000',
    status: 'approved',
    createdDate: '2026-02-08',
    suggestedResources: 5,
    mappedTasks: [mockTasks[3]],
    customFormId: 'form_1',
    customFormResponses: {
      field_1: '40000',
      field_4: 'Mid',
      field_5: true,
    },
    urgency: 'medium',
  },
  {
    id: 'BR-003',
    requestedBy: 'Michael Chen',
    requestingAgency: mockAgencies[1],
    project: 'Data Analytics Platform',
    role: 'Data Analyst',
    duration: '4 months',
    hours: 640,
    partnerAgency: 'Acme Digital',
    estimatedCost: '$54,400',
    status: 'rejected',
    createdDate: '2026-02-05',
    suggestedResources: 2,
    mappedTasks: [mockTasks[4]],
    urgency: 'low',
  },
];

export function EnhancedBorrowRequests() {
  const [requests, setRequests] = useState<BorrowRequest[]>(mockRequests);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequest | null>(null);
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Form state
  const [formAgency, setFormAgency] = useState('');
  const [formProject, setFormProject] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formHours, setFormHours] = useState('');
  const [formPartnerAgency, setFormPartnerAgency] = useState('');
  const [formUrgency, setFormUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [formAgencyNotes, setFormAgencyNotes] = useState('');
  const [formSelectedTasks, setFormSelectedTasks] = useState<string[]>([]);
  const [formSelectedCustomForm, setFormSelectedCustomForm] = useState('');
  const [formCustomResponses, setFormCustomResponses] = useState<Record<string, any>>({});

  const filteredRequests = requests.filter(req => {
    if (selectedTab === 'all') return true;
    return req.status === selectedTab;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  const getStatusColor = (status: BorrowRequest['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'in-review': return 'bg-blue-100 text-blue-800';
    }
  };

  const getUrgencyColor = (urgency: BorrowRequest['urgency']) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateRequest = () => {
    if (!formAgency || !formProject || !formRole || !formPartnerAgency) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedAgency = mockAgencies.find(a => a.id === formAgency);
    const selectedTasks = mockTasks.filter(t => formSelectedTasks.includes(t.id));

    const newRequest: BorrowRequest = {
      id: `BR-${String(requests.length + 1).padStart(3, '0')}`,
      requestedBy: 'Current User',
      requestingAgency: selectedAgency!,
      project: formProject,
      role: formRole,
      duration: formDuration,
      hours: parseInt(formHours),
      partnerAgency: formPartnerAgency,
      estimatedCost: `$${(parseInt(formHours) * 150).toLocaleString()}`,
      status: 'pending',
      createdDate: new Date().toISOString().split('T')[0],
      suggestedResources: 0,
      mappedTasks: selectedTasks,
      customFormId: formSelectedCustomForm || undefined,
      customFormResponses: formCustomResponses,
      agencyNotes: formAgencyNotes,
      urgency: formUrgency,
    };

    setRequests([newRequest, ...requests]);
    setShowCreateDialog(false);
    resetForm();
    toast.success('Borrow request created successfully');
  };

  const resetForm = () => {
    setFormAgency('');
    setFormProject('');
    setFormRole('');
    setFormDuration('');
    setFormHours('');
    setFormPartnerAgency('');
    setFormUrgency('medium');
    setFormAgencyNotes('');
    setFormSelectedTasks([]);
    setFormSelectedCustomForm('');
    setFormCustomResponses({});
  };

  const handleTaskToggle = (taskId: string) => {
    setFormSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleCustomFormFieldChange = (fieldId: string, value: any) => {
    setFormCustomResponses(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const selectedCustomForm = mockCustomForms.find(f => f.id === formSelectedCustomForm);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Borrow Requests</h1>
          <p className="text-gray-600 mt-1">
            Request and manage resource borrowing from partner agencies
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Requests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-semibold text-amber-600">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-semibold text-green-600">{stats.approved}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-semibold text-red-600">{stats.rejected}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6 space-y-4">
          {filteredRequests.map(request => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{request.id}</h3>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      <Badge className={getUrgencyColor(request.urgency)}>
                        {request.urgency} priority
                      </Badge>
                      {request.mappedTasks.length > 0 && (
                        <Badge variant="secondary">
                          <Link2 className="w-3 h-3 mr-1" />
                          {request.mappedTasks.length} tasks
                        </Badge>
                      )}
                      {request.customFormId && (
                        <Badge variant="secondary">
                          <FileText className="w-3 h-3 mr-1" />
                          Form attached
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-600">Project</p>
                        <p className="text-sm font-medium text-gray-900">{request.project}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Role Needed</p>
                        <p className="text-sm font-medium text-gray-900">{request.role}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Duration</p>
                        <p className="text-sm font-medium text-gray-900">{request.duration}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Hours</p>
                        <p className="text-sm font-medium text-gray-900">{request.hours}h</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Estimated Cost</p>
                        <p className="text-sm font-medium text-gray-900">{request.estimatedCost}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Requested By</p>
                        <p className="text-sm font-medium text-gray-900">{request.requestedBy}</p>
                      </div>
                    </div>

                    {/* Agency Information */}
                    <div className="p-3 bg-blue-50 rounded-lg mb-3">
                      <div className="flex items-start gap-3">
                        <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 mb-1">
                            {request.requestingAgency.name}
                          </p>
                          <p className="text-xs text-gray-600 mb-2">{request.requestingAgency.location}</p>
                          <div className="flex flex-wrap gap-1">
                            {request.requestingAgency.specialties.map(spec => (
                              <Badge key={spec} variant="secondary" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                          {request.agencyNotes && (
                            <p className="text-xs text-gray-700 mt-2 italic">
                              Note: {request.agencyNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mapped Tasks */}
                    {request.mappedTasks.length > 0 && (
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Layers className="w-4 h-4 text-purple-600" />
                          <p className="text-sm font-semibold text-gray-900">Mapped Tasks</p>
                        </div>
                        <div className="space-y-2">
                          {request.mappedTasks.map(task => (
                            <div key={task.id} className="flex items-center justify-between text-xs">
                              <span className="text-gray-700">{task.name}</span>
                              <span className="text-gray-600">{task.duration}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex lg:flex-col gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetailsDialog(true);
                      }}
                      className="w-full lg:w-auto"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                    {request.status === 'pending' && (
                      <>
                        <Button variant="outline" size="sm" className="w-full lg:w-auto">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full lg:w-auto text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Create Request Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Borrow Request</DialogTitle>
            <DialogDescription>
              Request resources from partner agencies for your project
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Agency Selection */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Your Agency Information
              </h3>
              <div className="space-y-3">
                <div>
                  <Label>Select Your Agency *</Label>
                  <Select value={formAgency} onValueChange={setFormAgency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your agency" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAgencies.map(agency => (
                        <SelectItem key={agency.id} value={agency.id}>
                          {agency.name} - {agency.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formAgency && (
                  <div className="p-3 bg-white rounded border">
                    {mockAgencies.find(a => a.id === formAgency) && (
                      <>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {mockAgencies.find(a => a.id === formAgency)!.name}
                        </p>
                        <p className="text-xs text-gray-600 mb-2">
                          {mockAgencies.find(a => a.id === formAgency)!.location}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {mockAgencies.find(a => a.id === formAgency)!.specialties.map(spec => (
                            <Badge key={spec} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
                <div>
                  <Label>Agency-Specific Notes (Optional)</Label>
                  <Textarea
                    placeholder="Any special requirements or preferences..."
                    value={formAgencyNotes}
                    onChange={(e) => setFormAgencyNotes(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Project Name *</Label>
                <Input
                  placeholder="Enter project name"
                  value={formProject}
                  onChange={(e) => setFormProject(e.target.value)}
                />
              </div>
              <div>
                <Label>Role Needed *</Label>
                <Input
                  placeholder="e.g., Senior Developer"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                />
              </div>
              <div>
                <Label>Duration *</Label>
                <Select value={formDuration} onValueChange={setFormDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 week">1 Week</SelectItem>
                    <SelectItem value="2 weeks">2 Weeks</SelectItem>
                    <SelectItem value="1 month">1 Month</SelectItem>
                    <SelectItem value="2 months">2 Months</SelectItem>
                    <SelectItem value="3 months">3 Months</SelectItem>
                    <SelectItem value="6 months">6 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Total Hours *</Label>
                <Input
                  type="number"
                  placeholder="e.g., 160"
                  value={formHours}
                  onChange={(e) => setFormHours(e.target.value)}
                />
              </div>
              <div>
                <Label>Partner Agency *</Label>
                <Select value={formPartnerAgency} onValueChange={setFormPartnerAgency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select partner" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAgencies.filter(a => a.id !== formAgency).map(agency => (
                      <SelectItem key={agency.id} value={agency.name}>
                        {agency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Urgency *</Label>
                <Select value={formUrgency} onValueChange={(v: any) => setFormUrgency(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Task Mapping */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                Map to Tasks (Optional)
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Select tasks that this resource will work on
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {mockTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-2 hover:bg-white rounded cursor-pointer"
                    onClick={() => handleTaskToggle(task.id)}
                  >
                    <Checkbox
                      checked={formSelectedTasks.includes(task.id)}
                      onCheckedChange={() => handleTaskToggle(task.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{task.name}</p>
                      <p className="text-xs text-gray-600">
                        {task.project} • {task.duration} • {task.priority} priority
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {formSelectedTasks.length > 0 && (
                <p className="text-xs text-gray-600 mt-2">
                  {formSelectedTasks.length} task(s) selected
                </p>
              )}
            </div>

            {/* Custom Form Selection */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Additional Information Form (Optional)
              </h3>
              <div className="space-y-3">
                <div>
                  <Label>Select Form Template</Label>
                  <Select value={formSelectedCustomForm} onValueChange={setFormSelectedCustomForm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a form" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCustomForms.map(form => (
                        <SelectItem key={form.id} value={form.id}>
                          {form.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCustomForm && (
                  <div className="space-y-3 p-3 bg-white rounded border">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {selectedCustomForm.name}
                    </h4>
                    {selectedCustomForm.fields.map(field => (
                      <div key={field.id}>
                        <Label>
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {field.type === 'text' && (
                          <Input
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            value={formCustomResponses[field.id] || ''}
                            onChange={(e) => handleCustomFormFieldChange(field.id, e.target.value)}
                          />
                        )}
                        {field.type === 'textarea' && (
                          <Textarea
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            value={formCustomResponses[field.id] || ''}
                            onChange={(e) => handleCustomFormFieldChange(field.id, e.target.value)}
                            rows={3}
                          />
                        )}
                        {field.type === 'number' && (
                          <Input
                            type="number"
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            value={formCustomResponses[field.id] || ''}
                            onChange={(e) => handleCustomFormFieldChange(field.id, e.target.value)}
                          />
                        )}
                        {field.type === 'date' && (
                          <Input
                            type="date"
                            value={formCustomResponses[field.id] || ''}
                            onChange={(e) => handleCustomFormFieldChange(field.id, e.target.value)}
                          />
                        )}
                        {field.type === 'select' && (
                          <Select
                            value={formCustomResponses[field.id] || ''}
                            onValueChange={(v) => handleCustomFormFieldChange(field.id, v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map(option => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {field.type === 'checkbox' && (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={formCustomResponses[field.id] || false}
                              onCheckedChange={(checked) =>
                                handleCustomFormFieldChange(field.id, checked)
                              }
                            />
                            <span className="text-sm text-gray-700">Yes</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateRequest}>Create Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details - {selectedRequest?.id}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <Badge className={getStatusColor(selectedRequest.status)}>
                  {selectedRequest.status}
                </Badge>
                <Badge className={getUrgencyColor(selectedRequest.urgency)}>
                  {selectedRequest.urgency} priority
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Project</p>
                  <p className="font-medium">{selectedRequest.project}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-medium">{selectedRequest.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">{selectedRequest.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hours</p>
                  <p className="font-medium">{selectedRequest.hours}h</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Cost</p>
                  <p className="font-medium">{selectedRequest.estimatedCost}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Partner Agency</p>
                  <p className="font-medium">{selectedRequest.partnerAgency}</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Agency Information</h4>
                <p className="text-sm font-medium text-gray-900">{selectedRequest.requestingAgency.name}</p>
                <p className="text-xs text-gray-600">{selectedRequest.requestingAgency.location}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedRequest.requestingAgency.specialties.map(spec => (
                    <Badge key={spec} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
                {selectedRequest.agencyNotes && (
                  <p className="text-sm text-gray-700 mt-2 italic">{selectedRequest.agencyNotes}</p>
                )}
              </div>

              {selectedRequest.mappedTasks.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Mapped Tasks</h4>
                  <div className="space-y-2">
                    {selectedRequest.mappedTasks.map(task => (
                      <div key={task.id} className="p-2 bg-gray-50 rounded">
                        <p className="text-sm font-medium">{task.name}</p>
                        <p className="text-xs text-gray-600">
                          {task.project} • {task.duration} • {task.priority} priority
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.customFormId && selectedRequest.customFormResponses && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Additional Information</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedRequest.customFormResponses).map(([fieldId, value]) => {
                      const form = mockCustomForms.find(f => f.id === selectedRequest.customFormId);
                      const field = form?.fields.find(f => f.id === fieldId);
                      if (!field) return null;
                      return (
                        <div key={fieldId} className="p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-600">{field.label}</p>
                          <p className="text-sm font-medium">
                            {field.type === 'checkbox' ? (value ? 'Yes' : 'No') : value}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
