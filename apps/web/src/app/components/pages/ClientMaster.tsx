import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Link2,
  Unlink,
  DollarSign,
  Percent,
  Calendar,
  Target,
  TrendingUp,
  Users,
  Eye,
  Globe,
  Shield,
  Zap,
  Brain,
  FileText,
  BarChart3,
  MapPin,
  ArrowRight,
  AlertCircle,
  Info,
  Check,
  X,
  Clock,
  Layers,
  List,
} from 'lucide-react';
import { toast } from 'sonner';

interface Client {
  id: string;
  name: string;
  industry: string;
  billingModel: 'retainer' | 'fixed-price' | 'time-material' | 'hybrid';
  targetMargin: number;
  minMargin: number;
  paymentTerms: number;
  retainerValue: number;
  currency: string;
  primaryAgencyId: string;
  primaryAgencyName: string;
  status: 'active' | 'inactive' | 'at-risk';
  createdAt: string;
  
  // Aggregated financial data
  totalRevenue: number;
  totalCost: number;
  grossMargin: number;
  netMargin: number;
  retainerUtilization: number;
  projectCount: number;
  
  // Multi-agency
  agencies: ClientAgency[];
  
  // Mapping status
  mappingStatus: 'complete' | 'partial' | 'unmapped';
  ppmMappings: number;
  unmappedProjects: number;
}

interface ClientAgency {
  id: string;
  agencyId: string;
  agencyName: string;
  role: 'primary' | 'partner' | 'execution';
  revenueShare: number;
  projectCount: number;
  revenue: number;
}

interface PPMMapping {
  id: string;
  integrationName: string;
  sourceClientId: string;
  sourceClientName: string;
  sourceProjectId: string;
  sourceProjectName: string;
  repClientId: string | null;
  repClientName: string | null;
  repProjectId: string | null;
  confidenceScore: number;
  autoMapped: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedBy: string | null;
}

interface FinancialAlert {
  id: string;
  clientId: string;
  clientName: string;
  type: 'unmapped-project' | 'below-margin' | 'duplicate-client' | 'currency-mismatch' | 'over-servicing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  impact: number;
  createdAt: string;
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'TechCorp Industries',
    industry: 'Technology',
    billingModel: 'retainer',
    targetMargin: 35,
    minMargin: 25,
    paymentTerms: 30,
    retainerValue: 50000,
    currency: 'USD',
    primaryAgencyId: 'agency-1',
    primaryAgencyName: 'Digital Dynamics',
    status: 'active',
    createdAt: '2025-01-15',
    totalRevenue: 450000,
    totalCost: 276750,
    grossMargin: 38.5,
    netMargin: 28.2,
    retainerUtilization: 92,
    projectCount: 5,
    agencies: [
      { id: 'ca1', agencyId: 'agency-1', agencyName: 'Digital Dynamics', role: 'primary', revenueShare: 70, projectCount: 3, revenue: 315000 },
      { id: 'ca2', agencyId: 'agency-2', agencyName: 'Creative Labs', role: 'partner', revenueShare: 30, projectCount: 2, revenue: 135000 },
    ],
    mappingStatus: 'complete',
    ppmMappings: 5,
    unmappedProjects: 0,
  },
  {
    id: '2',
    name: 'GlobalRetail Partners',
    industry: 'Retail',
    billingModel: 'time-material',
    targetMargin: 30,
    minMargin: 20,
    paymentTerms: 45,
    retainerValue: 0,
    currency: 'USD',
    primaryAgencyId: 'agency-1',
    primaryAgencyName: 'Digital Dynamics',
    status: 'at-risk',
    createdAt: '2024-08-22',
    totalRevenue: 195000,
    totalCost: 170625,
    grossMargin: 12.5,
    netMargin: 5.2,
    retainerUtilization: 0,
    projectCount: 3,
    agencies: [
      { id: 'ca3', agencyId: 'agency-1', agencyName: 'Digital Dynamics', role: 'primary', revenueShare: 100, projectCount: 3, revenue: 195000 },
    ],
    mappingStatus: 'partial',
    ppmMappings: 2,
    unmappedProjects: 1,
  },
  {
    id: '3',
    name: 'Innovation Labs',
    industry: 'Healthcare',
    billingModel: 'hybrid',
    targetMargin: 32,
    minMargin: 22,
    paymentTerms: 30,
    retainerValue: 30000,
    currency: 'USD',
    primaryAgencyId: 'agency-1',
    primaryAgencyName: 'Digital Dynamics',
    status: 'active',
    createdAt: '2024-11-10',
    totalRevenue: 325000,
    totalCost: 210625,
    grossMargin: 35.2,
    netMargin: 25.5,
    retainerUtilization: 88,
    projectCount: 4,
    agencies: [
      { id: 'ca4', agencyId: 'agency-1', agencyName: 'Digital Dynamics', role: 'primary', revenueShare: 60, projectCount: 2, revenue: 195000 },
      { id: 'ca5', agencyId: 'agency-3', agencyName: 'Tech Partners', role: 'execution', revenueShare: 40, projectCount: 2, revenue: 130000 },
    ],
    mappingStatus: 'complete',
    ppmMappings: 4,
    unmappedProjects: 0,
  },
];

const mockPPMMappings: PPMMapping[] = [
  {
    id: '1',
    integrationName: 'Workfront',
    sourceClientId: 'WF-1234',
    sourceClientName: 'TechCorp Industries Inc.',
    sourceProjectId: 'WF-PRJ-5678',
    sourceProjectName: 'Digital Transformation Q1',
    repClientId: '1',
    repClientName: 'TechCorp Industries',
    repProjectId: 'proj-1',
    confidenceScore: 95,
    autoMapped: true,
    status: 'approved',
    createdAt: '2025-02-10',
    approvedBy: 'John Smith',
  },
  {
    id: '2',
    integrationName: 'Jira',
    sourceClientId: 'JIRA-9876',
    sourceClientName: 'GlobalRetail Corp',
    sourceProjectId: 'JIRA-PRJ-4321',
    sourceProjectName: 'E-commerce Platform',
    repClientId: null,
    repClientName: null,
    repProjectId: null,
    confidenceScore: 72,
    autoMapped: false,
    status: 'pending',
    createdAt: '2025-02-11',
    approvedBy: null,
  },
  {
    id: '3',
    integrationName: 'Asana',
    sourceClientId: 'ASANA-5555',
    sourceClientName: 'Innovation Labs Healthcare',
    sourceProjectId: 'ASANA-PRJ-7890',
    sourceProjectName: 'Patient Portal Redesign',
    repClientId: '3',
    repClientName: 'Innovation Labs',
    repProjectId: 'proj-3',
    confidenceScore: 88,
    autoMapped: true,
    status: 'pending',
    createdAt: '2025-02-11',
    approvedBy: null,
  },
];

const mockAlerts: FinancialAlert[] = [
  {
    id: '1',
    clientId: '2',
    clientName: 'GlobalRetail Partners',
    type: 'unmapped-project',
    severity: 'high',
    title: 'Unmapped Project Detected',
    description: '1 project from Workfront not mapped to REP client',
    recommendation: 'Review and map project "Mobile App V2" to correct client',
    impact: 45000,
    createdAt: '2 hours ago',
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'GlobalRetail Partners',
    type: 'below-margin',
    severity: 'critical',
    title: 'Below Minimum Margin Threshold',
    description: 'Gross margin 12.5% is below minimum acceptable margin of 20%',
    recommendation: 'Immediate repricing or scope reduction required',
    impact: 32000,
    createdAt: '3 hours ago',
  },
  {
    id: '3',
    clientId: '1',
    clientName: 'TechCorp Industries',
    type: 'over-servicing',
    severity: 'medium',
    title: 'Retainer Over-Servicing Warning',
    description: 'Retainer utilization at 92% - approaching capacity',
    recommendation: 'Consider upselling additional retainer hours',
    impact: 8000,
    createdAt: '1 day ago',
  },
];

const billingModels = [
  { value: 'retainer', label: 'Retainer' },
  { value: 'fixed-price', label: 'Fixed Price' },
  { value: 'time-material', label: 'Time & Material' },
  { value: 'hybrid', label: 'Hybrid' },
];

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing',
  'Education', 'Media', 'Telecommunications', 'Energy', 'Other',
];

const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR'];

export function ClientMaster() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [mappings, setMappings] = useState<PPMMapping[]>(mockPPMMappings);
  const [alerts, setAlerts] = useState<FinancialAlert[]>(mockAlerts);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [clientViewMode, setClientViewMode] = useState<'card' | 'list'>('card');

  const [newClient, setNewClient] = useState({
    name: '',
    industry: 'Technology',
    billingModel: 'retainer' as const,
    targetMargin: 35,
    minMargin: 25,
    paymentTerms: 30,
    retainerValue: 0,
    currency: 'USD',
  });

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingMappings = mappings.filter(m => m.status === 'pending');
  const unmappedCount = clients.reduce((sum, c) => sum + c.unmappedProjects, 0);
  const totalRevenue = clients.reduce((sum, c) => sum + c.totalRevenue, 0);
  const avgMargin = clients.reduce((sum, c) => sum + c.grossMargin, 0) / clients.length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;

  const handleCreateClient = () => {
    const client: Client = {
      id: `client-${Date.now()}`,
      ...newClient,
      primaryAgencyId: 'agency-1',
      primaryAgencyName: 'Digital Dynamics',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      totalRevenue: 0,
      totalCost: 0,
      grossMargin: 0,
      netMargin: 0,
      retainerUtilization: 0,
      projectCount: 0,
      agencies: [],
      mappingStatus: 'unmapped',
      ppmMappings: 0,
      unmappedProjects: 0,
    };
    
    setClients([...clients, client]);
    setShowCreateDialog(false);
    toast.success(`Client "${client.name}" created successfully`);
    
    // Reset form
    setNewClient({
      name: '',
      industry: 'Technology',
      billingModel: 'retainer',
      targetMargin: 35,
      minMargin: 25,
      paymentTerms: 30,
      retainerValue: 0,
      currency: 'USD',
    });
  };

  const handleApproveMapping = (mappingId: string, approve: boolean) => {
    setMappings(mappings.map(m => 
      m.id === mappingId 
        ? { ...m, status: approve ? 'approved' : 'rejected', approvedBy: 'Current User' }
        : m
    ));
    toast.success(approve ? 'Mapping approved' : 'Mapping rejected');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'at-risk':
        return <Badge className="bg-red-500">At Risk</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return null;
    }
  };

  const getMappingStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-500 gap-1"><CheckCircle2 className="w-3 h-3" />Complete</Badge>;
      case 'partial':
        return <Badge className="bg-amber-500 gap-1"><AlertTriangle className="w-3 h-3" />Partial</Badge>;
      case 'unmapped':
        return <Badge className="bg-red-500 gap-1"><XCircle className="w-3 h-3" />Unmapped</Badge>;
      default:
        return null;
    }
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-500">{score}% High</Badge>;
    if (score >= 75) return <Badge className="bg-blue-500">{score}% Good</Badge>;
    if (score >= 60) return <Badge className="bg-amber-500">{score}% Medium</Badge>;
    return <Badge className="bg-red-500">{score}% Low</Badge>;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-amber-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            Client Master & Financial Mapping
          </h1>
          <p className="text-gray-600 mt-1">
            Centralized client registry, PPM integration, and financial truth layer
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Import
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Client
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{clients.length}</p>
                <div className="flex items-center gap-1 text-sm mt-2 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>+3 this month</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${(totalRevenue / 1000).toFixed(0)}K
                </p>
                <div className="flex items-center gap-1 text-sm mt-2 text-green-600">
                  <DollarSign className="w-4 h-4" />
                  <span>Aggregated</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Margin</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {avgMargin.toFixed(1)}%
                </p>
                <div className="flex items-center gap-1 text-sm mt-2 text-green-600">
                  <Percent className="w-4 h-4" />
                  <span>Healthy</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Mappings</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {pendingMappings.length}
                </p>
                <div className="flex items-center gap-1 text-sm mt-2 text-amber-600">
                  <Link2 className="w-4 h-4" />
                  <span>Need review</span>
                </div>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Link2 className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {criticalAlerts}
                </p>
                <div className="flex items-center gap-1 text-sm mt-2 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Urgent action</span>
                </div>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="clients" className="w-full">
        <TabsList>
          <TabsTrigger value="clients">
            Client Registry
            <Badge className="ml-2" variant="secondary">{clients.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="mappings">
            PPM Mappings
            {pendingMappings.length > 0 && (
              <Badge className="ml-2 bg-amber-500">{pendingMappings.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="alerts">
            Financial Alerts
            {criticalAlerts > 0 && (
              <Badge className="ml-2 bg-red-500">{criticalAlerts}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="normalization">Normalization</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="at-risk">At Risk</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center rounded-md border bg-white p-1">
              <Button
                variant={clientViewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-2"
                onClick={() => setClientViewMode('card')}
              >
                <Layers className="w-4 h-4 mr-1" />
                Card
              </Button>
              <Button
                variant={clientViewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-2"
                onClick={() => setClientViewMode('list')}
              >
                <List className="w-4 h-4 mr-1" />
                List
              </Button>
            </div>
          </div>

          {/* Client Table */}
          <Card>
            {clientViewMode === 'card' ? (
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredClients.map((client) => (
                    <Card key={client.id} className="border-gray-200">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">{client.name}</div>
                            <div className="text-xs text-gray-500">{client.primaryAgencyName}</div>
                          </div>
                          {getStatusBadge(client.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{client.industry}</Badge>
                          <span className="text-sm capitalize text-gray-600">
                            {client.billingModel.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-xs text-gray-500">Revenue</div>
                            <div className="font-semibold">${(client.totalRevenue / 1000).toFixed(0)}K</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Margin</div>
                            <div className={`font-semibold ${
                              client.grossMargin >= client.targetMargin ? 'text-green-600' :
                              client.grossMargin >= client.minMargin ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {client.grossMargin.toFixed(1)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Projects</div>
                            <div className="font-semibold">{client.projectCount}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Mapping</div>
                            {getMappingStatusBadge(client.mappingStatus)}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 border-t">
                          <Button size="sm" variant="outline" onClick={() => setSelectedClient(client)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            ) : (
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Billing Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Margin</TableHead>
                  <TableHead>Mapping Status</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-semibold text-gray-900">{client.name}</div>
                        <div className="text-xs text-gray-500">{client.primaryAgencyName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{client.industry}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">{client.billingModel.replace('-', ' ')}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(client.status)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold">${(client.totalRevenue / 1000).toFixed(0)}K</div>
                        {client.retainerValue > 0 && (
                          <div className="text-xs text-gray-500">
                            Retainer: ${(client.retainerValue / 1000).toFixed(0)}K
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${
                          client.grossMargin >= client.targetMargin ? 'text-green-600' :
                          client.grossMargin >= client.minMargin ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {client.grossMargin.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500">
                          Target: {client.targetMargin}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getMappingStatusBadge(client.mappingStatus)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold">{client.projectCount}</div>
                        {client.unmappedProjects > 0 && (
                          <div className="text-xs text-red-600">
                            {client.unmappedProjects} unmapped
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedClient(client)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="mappings" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">PPM Integration Mappings</h3>
              <p className="text-sm text-gray-600">
                Review and approve AI-suggested mappings from external PPM tools
              </p>
            </div>
            <Button className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Sync Now
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source System</TableHead>
                  <TableHead>Source Client/Project</TableHead>
                  <TableHead>REP Client/Project</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappings.map((mapping) => (
                  <TableRow key={mapping.id}>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Zap className="w-3 h-3" />
                        {mapping.integrationName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold text-sm">{mapping.sourceClientName}</div>
                        <div className="text-xs text-gray-500">{mapping.sourceProjectName}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          IDs: {mapping.sourceClientId} / {mapping.sourceProjectId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {mapping.repClientName ? (
                        <div>
                          <div className="font-semibold text-sm text-green-700">
                            {mapping.repClientName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {mapping.autoMapped ? '(Auto-mapped)' : '(Manual)'}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-amber-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm">Not mapped</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getConfidenceBadge(mapping.confidenceScore)}</TableCell>
                    <TableCell>
                      {mapping.status === 'approved' && (
                        <Badge className="bg-green-500 gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Approved
                        </Badge>
                      )}
                      {mapping.status === 'pending' && (
                        <Badge className="bg-amber-500 gap-1">
                          <Clock className="w-3 h-3" />
                          Pending
                        </Badge>
                      )}
                      {mapping.status === 'rejected' && (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {mapping.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveMapping(mapping.id, true)}
                            className="gap-1"
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveMapping(mapping.id, false)}
                            className="gap-1"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {mapping.status === 'approved' && (
                        <span className="text-xs text-gray-500">
                          by {mapping.approvedBy}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mapping Stats */}
          <div className="grid grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Auto-Mapped</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {mappings.filter(m => m.autoMapped).length}
                    </p>
                  </div>
                  <Brain className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">
                      {pendingMappings.length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Confidence</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {(mappings.reduce((sum, m) => sum + m.confidenceScore, 0) / mappings.length).toFixed(0)}%
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Financial Normalization Alerts
              </CardTitle>
              <CardDescription>
                System-detected issues requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 border-2 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <div>
                        <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {alert.clientName} • {alert.createdAt}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Impact: ${(alert.impact / 1000).toFixed(0)}K
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">{alert.description}</p>

                  <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded mb-3">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-blue-900 mb-1">
                          Recommendation
                        </div>
                        <div className="text-xs text-blue-800">{alert.recommendation}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      Take Action
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="normalization" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Currency Normalization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm font-semibold text-blue-900 mb-2">
                    Base Currency: USD
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">USD</span>
                      <span className="font-semibold">1.0000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">EUR</span>
                      <span className="font-semibold">0.9234</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">GBP</span>
                      <span className="font-semibold">0.7892</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">CAD</span>
                      <span className="font-semibold">1.3456</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Update Exchange Rates
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  Duplicate Detection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-900">No Duplicates Found</span>
                  </div>
                  <p className="text-sm text-green-700">
                    All client records are unique based on name, domain, and contact information.
                  </p>
                </div>
                <Button variant="outline" className="w-full gap-2">
                  <Search className="w-4 h-4" />
                  Run Duplicate Scan
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-amber-600" />
                  Mapping Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700">Projects Mapped</span>
                      <span className="font-semibold">11 / 12 (92%)</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700">Clients Complete</span>
                      <span className="font-semibold">2 / 3 (67%)</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>
                  <div className="pt-3 border-t">
                    <div className="text-sm text-amber-600 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{unmappedCount} projects need mapping</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  Audit Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm p-3 bg-gray-50 rounded">
                    <div className="font-semibold text-gray-900">Client Created</div>
                    <div className="text-gray-600">Innovation Labs • 2h ago</div>
                  </div>
                  <div className="text-sm p-3 bg-gray-50 rounded">
                    <div className="font-semibold text-gray-900">Mapping Approved</div>
                    <div className="text-gray-600">TechCorp-WF-1234 • 5h ago</div>
                  </div>
                  <div className="text-sm p-3 bg-gray-50 rounded">
                    <div className="font-semibold text-gray-900">Margin Updated</div>
                    <div className="text-gray-600">GlobalRetail • 1d ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Client Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Client</DialogTitle>
            <DialogDescription>
              Add a new client to the master registry with financial configuration
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Client Name *</Label>
              <Input
                id="name"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                placeholder="e.g., TechCorp Industries"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Select
                value={newClient.industry}
                onValueChange={(value) => setNewClient({ ...newClient, industry: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingModel">Billing Model *</Label>
              <Select
                value={newClient.billingModel}
                onValueChange={(value: any) => setNewClient({ ...newClient, billingModel: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {billingModels.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select
                value={newClient.currency}
                onValueChange={(value) => setNewClient({ ...newClient, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetMargin">Target Margin % *</Label>
              <Input
                id="targetMargin"
                type="number"
                value={newClient.targetMargin}
                onChange={(e) => setNewClient({ ...newClient, targetMargin: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minMargin">Minimum Margin % *</Label>
              <Input
                id="minMargin"
                type="number"
                value={newClient.minMargin}
                onChange={(e) => setNewClient({ ...newClient, minMargin: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Payment Terms (days) *</Label>
              <Input
                id="paymentTerms"
                type="number"
                value={newClient.paymentTerms}
                onChange={(e) => setNewClient({ ...newClient, paymentTerms: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retainerValue">Retainer Value (if applicable)</Label>
              <Input
                id="retainerValue"
                type="number"
                value={newClient.retainerValue}
                onChange={(e) => setNewClient({ ...newClient, retainerValue: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateClient} disabled={!newClient.name}>
              Create Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client Detail Modal */}
      {selectedClient && (
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedClient.name}
                {getStatusBadge(selectedClient.status)}
              </DialogTitle>
              <DialogDescription>
                Complete client financial profile and agency relationships
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Financial Summary */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-700 font-medium">Total Revenue</div>
                  <div className="text-2xl font-bold text-blue-900 mt-1">
                    ${(selectedClient.totalRevenue / 1000).toFixed(0)}K
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-700 font-medium">Gross Margin</div>
                  <div className="text-2xl font-bold text-green-900 mt-1">
                    {selectedClient.grossMargin.toFixed(1)}%
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-purple-700 font-medium">Net Margin</div>
                  <div className="text-2xl font-bold text-purple-900 mt-1">
                    {selectedClient.netMargin.toFixed(1)}%
                  </div>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <div className="text-sm text-amber-700 font-medium">Projects</div>
                  <div className="text-2xl font-bold text-amber-900 mt-1">
                    {selectedClient.projectCount}
                  </div>
                </div>
              </div>

              {/* Agency Relationships */}
              {selectedClient.agencies.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Agency Network</h4>
                  <div className="space-y-2">
                    {selectedClient.agencies.map((agency) => (
                      <div key={agency.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-semibold text-gray-900">{agency.agencyName}</div>
                          <div className="text-sm text-gray-600 capitalize">{agency.role}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{agency.revenueShare}% share</div>
                          <div className="text-sm text-gray-600">
                            ${(agency.revenue / 1000).toFixed(0)}K • {agency.projectCount} projects
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Financial Configuration */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Financial Configuration</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-gray-600">Billing Model</div>
                    <div className="font-semibold capitalize">
                      {selectedClient.billingModel.replace('-', ' ')}
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-gray-600">Target Margin</div>
                    <div className="font-semibold">{selectedClient.targetMargin}%</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-gray-600">Minimum Margin</div>
                    <div className="font-semibold">{selectedClient.minMargin}%</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-gray-600">Payment Terms</div>
                    <div className="font-semibold">{selectedClient.paymentTerms} days</div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedClient(null)}>
                Close
              </Button>
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                Edit Client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Info Card */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-blue-900">Financial Truth Layer</div>
              <div className="text-sm text-blue-700 mt-1">
                The Client Master & Financial Mapping Engine serves as the centralized truth layer for all
                client financial data. It normalizes revenue across PPM systems, detects duplicates,
                enforces margin thresholds, and enables accurate client-level profitability tracking.
                All data is audited and multi-tenant isolated for security and compliance.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
