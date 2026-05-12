import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Textarea } from '@/app/components/ui/textarea';
import { Switch } from '@/app/components/ui/switch';
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
  Rocket,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Users,
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Zap,
  Brain,
  Sparkles,
  BarChart3,
  Activity,
  ArrowRight,
  Layers,
  Share2,
  Star,
  Award,
  Play,
  Pause,
  RefreshCw,
  AlertCircle,
  Info,
  ChevronRight,
  Grid3x3,
  BookOpen,
  Calculator,
  Lightbulb,
  Building2,
  FileText,
  X,
  Paperclip,
  Save,
  Copy,
  Link,
  GitBranch,
  PieChart,
  LineChart,
  TestTube,
  List,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  ZAxis,
} from 'recharts';
import { toast } from 'sonner';
import { FilterDialog } from '@/app/components/common/FilterDialog';

// ─── ROI Intelligence Data ────────────────────────────────────────────────────
interface CampaignROI {
  name: string;
  channel: 'Paid Social' | 'Email' | 'SEO' | 'Display' | 'Influencer';
  spend: number;       // $k
  revenue: number;     // $k
  roas: number;        // Revenue / Spend
  cpl: number;         // Cost per lead ($)
  leads: number;
  conversions: number;
  attribution: 'first-touch' | 'last-touch' | 'linear';
  roi: number;         // %
}
const CAMPAIGN_ROI_DATA: CampaignROI[] = [
  { name: 'Brand Awareness Q1', channel: 'Paid Social', spend: 18, revenue: 94, roas: 5.2, cpl: 42, leads: 428, conversions: 38, attribution: 'first-touch', roi: 422 },
  { name: 'Email Nurture Series', channel: 'Email', spend: 4, revenue: 61, roas: 15.3, cpl: 12, leads: 333, conversions: 71, attribution: 'last-touch', roi: 1425 },
  { name: 'SEO Content Push', channel: 'SEO', spend: 8, revenue: 48, roas: 6.0, cpl: 28, leads: 285, conversions: 44, attribution: 'linear', roi: 500 },
  { name: 'Retargeting Display', channel: 'Display', spend: 12, revenue: 38, roas: 3.2, cpl: 68, leads: 176, conversions: 22, attribution: 'last-touch', roi: 217 },
  { name: 'Influencer Campaign', channel: 'Influencer', spend: 22, revenue: 55, roas: 2.5, cpl: 110, leads: 200, conversions: 18, attribution: 'first-touch', roi: 150 },
  { name: 'Product Launch Blitz', channel: 'Paid Social', spend: 30, revenue: 142, roas: 4.7, cpl: 58, leads: 517, conversions: 56, attribution: 'linear', roi: 373 },
];

const CHANNEL_COLORS: Record<string, string> = {
  'Paid Social': '#8b5cf6',
  'Email': '#3b82f6',
  'SEO': '#22c55e',
  'Display': '#f59e0b',
  'Influencer': '#ec4899',
};

// ─── Resource Conflict Radar Data ────────────────────────────────────────────
interface ResourceConflict {
  resource: string;
  role: string;
  campaign1: string;
  campaign2: string;
  overlapWeeks: number;
  hoursConflict: number;
  severity: 'low' | 'medium' | 'high';
  resolution: string;
}
const RESOURCE_CONFLICTS: ResourceConflict[] = [
  { resource: 'Alex Chen', role: 'Senior Designer', campaign1: 'Brand Awareness Q1', campaign2: 'Product Launch Blitz', overlapWeeks: 3, hoursConflict: 18, severity: 'high', resolution: 'Stagger campaign start dates by 2 weeks' },
  { resource: 'Maria Lopez', role: 'Copywriter', campaign1: 'Email Nurture Series', campaign2: 'SEO Content Push', overlapWeeks: 6, hoursConflict: 24, severity: 'high', resolution: 'Hire freelance writer for SEO content' },
  { resource: 'James Wu', role: 'Media Buyer', campaign1: 'Retargeting Display', campaign2: 'Brand Awareness Q1', overlapWeeks: 2, hoursConflict: 8, severity: 'medium', resolution: 'Consolidate ad platform management' },
  { resource: 'Sara Kim', role: 'Analyst', campaign1: 'Influencer Campaign', campaign2: 'Product Launch Blitz', overlapWeeks: 4, hoursConflict: 12, severity: 'medium', resolution: 'Automate reporting for influencer metrics' },
  { resource: 'Tom Reeves', role: 'Dev / Tracking', campaign1: 'Email Nurture Series', campaign2: 'Retargeting Display', overlapWeeks: 1, hoursConflict: 4, severity: 'low', resolution: 'Use shared tag manager setup' },
];

// overallocation bar data
const OVERALLOC_DATA = [
  { resource: 'Alex Chen', allocated: 52, capacity: 40 },
  { resource: 'Maria Lopez', allocated: 58, capacity: 40 },
  { resource: 'James Wu', allocated: 46, capacity: 40 },
  { resource: 'Sara Kim', allocated: 44, capacity: 40 },
  { resource: 'Tom Reeves', allocated: 38, capacity: 40 },
];

// ─── Performance Matrix Radar Data ───────────────────────────────────────────
const PERF_RADAR = [
  { metric: 'ROAS', 'Paid Social': 86, 'Email': 98, 'SEO': 90, 'Display': 60, 'Influencer': 50 },
  { metric: 'Lead Quality', 'Paid Social': 72, 'Email': 88, 'SEO': 82, 'Display': 55, 'Influencer': 65 },
  { metric: 'Cost Efficiency', 'Paid Social': 68, 'Email': 95, 'SEO': 85, 'Display': 52, 'Influencer': 42 },
  { metric: 'Conversion Rate', 'Paid Social': 74, 'Email': 85, 'SEO': 78, 'Display': 48, 'Influencer': 58 },
  { metric: 'Brand Lift', 'Paid Social': 88, 'Email': 55, 'SEO': 62, 'Display': 70, 'Influencer': 82 },
  { metric: 'Scalability', 'Paid Social': 80, 'Email': 72, 'SEO': 68, 'Display': 76, 'Influencer': 44 },
];

const REALLOC_SUGGESTIONS = [
  { from: 'Influencer', to: 'Email', amount: 8, rationale: 'Email delivers 6× higher ROAS at 90% lower CPL' },
  { from: 'Display', to: 'SEO', amount: 4, rationale: 'SEO compounds over time; display CTR declining 12% QoQ' },
  { from: 'Paid Social', to: 'Email', amount: 5, rationale: 'Email nurture converts 87% of paid social leads at zero extra spend' },
];
import { BulkOperationsBar, BulkSelectCheckbox } from '@/app/components/common/BulkOperations';
import { TemplateManager } from '@/app/components/common/TemplateManager';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/app/components/common/EmptyErrorStates';
import { HealthScoreBreakdown } from '@/app/components/common/HealthScoreBreakdown';
import { DeleteConfirmDialog } from '@/app/components/common/DeleteConfirmDialog';
import { useRBAC, Permission } from '@/app/services/RBACService';

interface CampaignTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  duration: string;
  teamSize: string;
  budgetRange: string;
  requiredSkills: string[];
  optionalSkills: string[];
  phases: Phase[];
  icon: string;
  color: string;
  createdBy: string;
  createdDate: string;
  isPublic: boolean;
  usageCount: number;
}

interface Phase {
  name: string;
  duration: string;
  percentage: number;
  activities: string[];
  deliverables: string[];
}

interface Campaign {
  id: string;
  name: string;
  type: string;
  client: string;
  clientId: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold' | 'archived';
  currentPhase: string;
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  team: TeamMember[];
  healthScore: number;
  burnRate: number;
  fromTemplate: boolean;
  templateId?: string;
  manager: string;
  documents?: UploadedDocument[];
  mappedProjectId?: string;
  mappedProjectName?: string;
  mappedTasks?: { id: string; name: string; sourceId: string }[];
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  matchScore: number;
  hourlyRate: number;
  allocatedHours: number;
  avatar: string;
}

interface UploadedDocument {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface Client {
  id: string;
  name: string;
  industry: string;
  totalRevenue: number;
  activeProjects: number;
}

// Mock Clients from Client Master
const mockClients: Client[] = [
  { id: '1', name: 'TechCorp Solutions', industry: 'Technology', totalRevenue: 2500000, activeProjects: 8 },
  { id: '2', name: 'Innovation Labs', industry: 'Software', totalRevenue: 1800000, activeProjects: 5 },
  { id: '3', name: 'GlobalRetail Partners', industry: 'Retail', totalRevenue: 3200000, activeProjects: 12 },
  { id: '4', name: 'HealthPlus Medical', industry: 'Healthcare', totalRevenue: 1500000, activeProjects: 4 },
  { id: '5', name: 'EduTech International', industry: 'Education', totalRevenue: 980000, activeProjects: 3 },
];

// Mock Resource Pools
const mockResourcePools = [
  { id: '1', name: 'Marketing Team', size: 12 },
  { id: '2', name: 'Creative Studio', size: 8 },
  { id: '3', name: 'Digital Specialists', size: 15 },
  { id: '4', name: 'Content Creators', size: 10 },
];

// Mock Users for Campaign Manager
const mockManagers = [
  { id: '1', name: 'Sarah Johnson' },
  { id: '2', name: 'Michael Chen' },
  { id: '3', name: 'Emma Davis' },
  { id: '4', name: 'David Park' },
  { id: '5', name: 'Lisa Anderson' },
];

// Mock PPM Projects for Mapping (supports any PPM tool: Workfront, Jira, Monday, Asana, etc.)
const mockPPMProjects = [
  { 
    id: 'WF-001', 
    name: 'Q1 Marketing Campaign', 
    client: 'TechCorp Solutions',
    status: 'In Progress',
    tasks: [
      { id: 'T-001', name: 'Social Media Strategy', owner: 'Sarah Johnson', status: 'In Progress' },
      { id: 'T-002', name: 'Content Creation', owner: 'Mike Chen', status: 'Not Started' },
      { id: 'T-003', name: 'Paid Advertising', owner: 'Emma Davis', status: 'Complete' },
    ]
  },
  { 
    id: 'WF-002', 
    name: 'Brand Redesign Project', 
    client: 'Innovation Labs',
    status: 'Planning',
    tasks: [
      { id: 'T-004', name: 'Brand Discovery', owner: 'Alex Rodriguez', status: 'In Progress' },
      { id: 'T-005', name: 'Logo Design', owner: 'Lisa Park', status: 'Not Started' },
    ]
  },
  { 
    id: 'WF-003', 
    name: 'Product Launch Campaign', 
    client: 'GlobalRetail Partners',
    status: 'In Progress',
    tasks: [
      { id: 'T-006', name: 'Market Research', owner: 'David Park', status: 'Complete' },
      { id: 'T-007', name: 'Campaign Strategy', owner: 'Sarah Johnson', status: 'In Progress' },
      { id: 'T-008', name: 'Creative Production', owner: 'Emma Davis', status: 'Not Started' },
    ]
  },
];

const campaignTemplates: CampaignTemplate[] = [
  {
    id: '1',
    name: 'Social Media Campaign',
    type: 'social-media',
    description: 'Comprehensive social media strategy and execution',
    duration: '6-8 weeks',
    teamSize: '3-4 resources',
    budgetRange: '$15K - $50K',
    requiredSkills: ['Social Media Management', 'Copywriting', 'Graphic Design'],
    optionalSkills: ['Video Editing', 'Photography', 'Analytics'],
    icon: 'Share2',
    color: 'blue',
    phases: [
      {
        name: 'Strategy',
        duration: '1-2 weeks',
        percentage: 20,
        activities: ['Social audit', 'Competitor analysis', 'Content strategy'],
        deliverables: ['Strategy document', 'Content calendar'],
      },
      {
        name: 'Creative',
        duration: '2-3 weeks',
        percentage: 30,
        activities: ['Concept development', 'Asset creation', 'Copy development'],
        deliverables: ['Creative assets', 'Approved copy'],
      },
      {
        name: 'Production',
        duration: '1-2 weeks',
        percentage: 25,
        activities: ['Final production', 'Scheduling setup', 'A/B testing'],
        deliverables: ['Final assets', 'Scheduled posts'],
      },
      {
        name: 'Launch',
        duration: '1 week',
        percentage: 10,
        activities: ['Campaign go-live', 'Initial monitoring'],
        deliverables: ['Live campaign', 'Launch report'],
      },
      {
        name: 'Optimization',
        duration: '1-2 weeks',
        percentage: 15,
        activities: ['Performance analysis', 'Content adjustments'],
        deliverables: ['Analytics report', 'Recommendations'],
      },
    ],
    createdBy: 'System',
    createdDate: '2024-01-01',
    isPublic: true,
    usageCount: 45,
  },
  {
    id: '2',
    name: 'Content Marketing',
    type: 'content',
    description: 'Strategic content creation and distribution',
    duration: '8-12 weeks',
    teamSize: '4-5 resources',
    budgetRange: '$25K - $75K',
    requiredSkills: ['Content Strategy', 'Writing', 'SEO'],
    optionalSkills: ['Video', 'Graphic Design', 'Analytics'],
    icon: 'Edit',
    color: 'green',
    phases: [
      {
        name: 'Strategy',
        duration: '2 weeks',
        percentage: 20,
        activities: ['Content audit', 'Keyword research', 'Editorial planning'],
        deliverables: ['Content strategy', 'Editorial calendar'],
      },
      {
        name: 'Creative',
        duration: '3 weeks',
        percentage: 30,
        activities: ['Content creation', 'Visual assets', 'Editing'],
        deliverables: ['Blog posts', 'Infographics', 'Videos'],
      },
      {
        name: 'Distribution',
        duration: '2 weeks',
        percentage: 25,
        activities: ['Publishing', 'Social amplification', 'Email distribution'],
        deliverables: ['Published content', 'Distribution report'],
      },
      {
        name: 'Promotion',
        duration: '2 weeks',
        percentage: 15,
        activities: ['Paid promotion', 'Influencer outreach'],
        deliverables: ['Campaign results'],
      },
      {
        name: 'Analysis',
        duration: '1 week',
        percentage: 10,
        activities: ['Performance review', 'Insights extraction'],
        deliverables: ['Analytics report', 'Recommendations'],
      },
    ],
    createdBy: 'System',
    createdDate: '2024-01-01',
    isPublic: true,
    usageCount: 32,
  },
  {
    id: '3',
    name: 'Email Marketing',
    type: 'email',
    description: 'Targeted email campaigns with automation',
    duration: '4-6 weeks',
    teamSize: '2-3 resources',
    budgetRange: '$10K - $30K',
    requiredSkills: ['Email Marketing', 'Copywriting', 'HTML/CSS'],
    optionalSkills: ['Design', 'Data Analysis', 'CRM'],
    icon: 'Mail',
    color: 'purple',
    phases: [
      {
        name: 'Planning',
        duration: '1 week',
        percentage: 20,
        activities: ['Audience segmentation', 'Campaign planning'],
        deliverables: ['Campaign plan'],
      },
      {
        name: 'Creative',
        duration: '2 weeks',
        percentage: 40,
        activities: ['Email design', 'Copy development', 'A/B variants'],
        deliverables: ['Email templates'],
      },
      {
        name: 'Testing',
        duration: '1 week',
        percentage: 20,
        activities: ['Technical testing', 'QA', 'Preview testing'],
        deliverables: ['Test results'],
      },
      {
        name: 'Deployment',
        duration: '1 week',
        percentage: 10,
        activities: ['Campaign launch', 'Monitoring'],
        deliverables: ['Live campaign'],
      },
      {
        name: 'Optimization',
        duration: '1 week',
        percentage: 10,
        activities: ['Performance analysis', 'Optimization'],
        deliverables: ['Analytics report'],
      },
    ],
    createdBy: 'System',
    createdDate: '2024-01-01',
    isPublic: true,
    usageCount: 28,
  },
];

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Spring Brand Refresh',
    type: 'Social Media Campaign',
    client: 'TechCorp Solutions',
    clientId: '1',
    status: 'active',
    currentPhase: 'Production',
    progress: 65,
    startDate: '2026-01-15',
    endDate: '2026-03-15',
    budget: 45000,
    spent: 28500,
    burnRate: 750,
    healthScore: 88,
    fromTemplate: true,
    templateId: '1',
    manager: 'Sarah Johnson',
    team: [
      { id: '1', name: 'Sarah Johnson', role: 'Social Media Manager', matchScore: 95, hourlyRate: 95, allocatedHours: 120, avatar: 'SJ' },
      { id: '2', name: 'Mike Chen', role: 'Copywriter', matchScore: 89, hourlyRate: 85, allocatedHours: 80, avatar: 'MC' },
      { id: '3', name: 'Emma Davis', role: 'Graphic Designer', matchScore: 92, hourlyRate: 90, allocatedHours: 100, avatar: 'ED' },
    ],
  },
  {
    id: '2',
    name: 'Content Hub Launch',
    type: 'Content Marketing',
    client: 'Innovation Labs',
    clientId: '2',
    status: 'active',
    currentPhase: 'Creative',
    progress: 45,
    startDate: '2026-02-01',
    endDate: '2026-04-30',
    budget: 65000,
    spent: 18200,
    burnRate: 650,
    healthScore: 92,
    fromTemplate: true,
    templateId: '2',
    manager: 'Michael Chen',
    team: [
      { id: '4', name: 'Alex Rodriguez', role: 'Content Strategist', matchScore: 88, hourlyRate: 105, allocatedHours: 140, avatar: 'AR' },
      { id: '5', name: 'Lisa Park', role: 'Writer', matchScore: 91, hourlyRate: 80, allocatedHours: 160, avatar: 'LP' },
    ],
  },
  {
    id: '3',
    name: 'Q1 Newsletter Series',
    type: 'Custom Campaign',
    client: 'HealthPlus Medical',
    clientId: '4',
    status: 'planning',
    currentPhase: 'Planning',
    progress: 15,
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    budget: 25000,
    spent: 0,
    burnRate: 0,
    healthScore: 75,
    fromTemplate: false,
    manager: 'Emma Davis',
    team: [],
  },
];

export function CampaignMapper() {
  // P0 FIX #10: RBAC Integration
  const { hasPermission, currentUser, isAdmin } = useRBAC();
  
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [useTemplate, setUseTemplate] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocument[]>([]);

  // New Campaign Form State
  const [campaignName, setCampaignName] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedManager, setSelectedManager] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [assignmentType, setAssignmentType] = useState<'individual' | 'pool'>('individual');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedPool, setSelectedPool] = useState('');

  // NEW: Additional State for New Features
  const [showProjectMappingDialog, setShowProjectMappingDialog] = useState(false);
  const [showTemplateCreator, setShowTemplateCreator] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  const [showSimulationDialog, setShowSimulationDialog] = useState(false);
  const [selectedPPMProject, setSelectedPPMProject] = useState('');
  const [mappedTasks, setMappedTasks] = useState<string[]>([]);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [simulationBudget, setSimulationBudget] = useState('');
  const [simulationTeamSize, setSimulationTeamSize] = useState('');
  const [simulationDuration, setSimulationDuration] = useState('');

  // P0 FIX: Filter, Loading, Undo state
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    client: 'all',
    manager: 'all',
    hasMapping: 'all',
    fromTemplate: 'all',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [undoStack, setUndoStack] = useState<Array<{ action: string; campaign: Campaign }>>([]);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [showHealthScoreDialog, setShowHealthScoreDialog] = useState(false);
  const [selectedCampaignForHealth, setSelectedCampaignForHealth] = useState<Campaign | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  const [campaignViewMode, setCampaignViewMode] = useState<'card' | 'grid' | 'list'>('card');

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const avgHealthScore = campaigns.reduce((sum, c) => sum + c.healthScore, 0) / campaigns.length;

  // P0 FIX #14: Budget Alerts & Monitoring
  useEffect(() => {
    campaigns.forEach(campaign => {
      const budgetUsage = (campaign.spent / campaign.budget) * 100;
      const budgetKey = `budget-alert-${campaign.id}-${Math.floor(budgetUsage / 10) * 10}`;
      
      // Check if we've already shown this alert level
      const lastAlertLevel = sessionStorage.getItem(budgetKey);
      
      if (budgetUsage >= 100 && lastAlertLevel !== '100') {
        toast.error(`⚠️ Campaign "${campaign.name}" has EXCEEDED budget!`, {
          description: `Budget: $${campaign.budget.toLocaleString()} | Spent: $${campaign.spent.toLocaleString()}`,
          duration: 10000,
        });
        sessionStorage.setItem(budgetKey, '100');
      } else if (budgetUsage >= 90 && budgetUsage < 100 && lastAlertLevel !== '90') {
        toast.error(`🚨 Campaign "${campaign.name}" at ${budgetUsage.toFixed(0)}% budget!`, {
          description: `Only $${(campaign.budget - campaign.spent).toLocaleString()} remaining`,
          duration: 8000,
        });
        sessionStorage.setItem(budgetKey, '90');
      } else if (budgetUsage >= 80 && budgetUsage < 90 && lastAlertLevel !== '80') {
        toast.warning(`⚡ Campaign "${campaign.name}" at ${budgetUsage.toFixed(0)}% budget`, {
          description: `Budget: $${campaign.budget.toLocaleString()} | Spent: $${campaign.spent.toLocaleString()}`,
          duration: 6000,
        });
        sessionStorage.setItem(budgetKey, '80');
      }
    });
  }, [campaigns]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'planning':
        return <Badge className="bg-blue-500">Planning</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500">Completed</Badge>;
      case 'on-hold':
        return <Badge className="bg-amber-500">On Hold</Badge>;
      default:
        return null;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const handleTemplateSelect = (template: CampaignTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateLibrary(false);
    setUseTemplate(true);
    setShowCreateDialog(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newDocs: UploadedDocument[] = Array.from(files).map((file, idx) => ({
        id: `doc-${Date.now()}-${idx}`,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Current User',
      }));
      setUploadedFiles([...uploadedFiles, ...newDocs]);
      toast.success(`${files.length} file(s) uploaded successfully!`);
    }
  };

  const handleRemoveFile = (docId: string) => {
    setUploadedFiles(uploadedFiles.filter(d => d.id !== docId));
  };

  const handleCreateCampaign = async () => {
    if (useTemplate && !selectedTemplate) {
      toast.error('Please select a template');
      return;
    }
    if (!campaignName || !selectedClient || !selectedManager || !startDate || !endDate || !budget) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Campaign created successfully!');
    setIsLoading(false);
    setShowCreateDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedTemplate(null);
    setCampaignName('');
    setSelectedClient('');
    setSelectedManager('');
    setStartDate('');
    setEndDate('');
    setBudget('');
    setSelectedAssignees([]);
    setSelectedPool('');
    setUploadedFiles([]);
  };

  // P0 FIX: Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    // Search filter
    if (searchTerm && !campaign.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // Status filter
    if (filters.status !== 'all' && campaign.status !== filters.status) {
      return false;
    }
    // Client filter
    if (filters.client !== 'all' && campaign.clientId !== filters.client) {
      return false;
    }
    // Manager filter
    if (filters.manager !== 'all' && campaign.manager !== filters.manager) {
      return false;
    }
    // Mapping filter
    if (filters.hasMapping !== 'all') {
      if (filters.hasMapping === 'mapped' && !campaign.mappedProjectId) return false;
      if (filters.hasMapping === 'unmapped' && campaign.mappedProjectId) return false;
    }
    // Template filter
    if (filters.fromTemplate !== 'all') {
      if (filters.fromTemplate === 'template' && !campaign.fromTemplate) return false;
      if (filters.fromTemplate === 'custom' && campaign.fromTemplate) return false;
    }
    return true;
  });

  // P0 FIX #7: Status Change Validation Logic
  const validateStatusChange = (currentStatus: string, newStatus: string): { valid: boolean; message?: string } => {
    // Define allowed transitions
    const allowedTransitions: Record<string, string[]> = {
      'planning': ['active', 'on-hold', 'archived'],
      'active': ['on-hold', 'completed', 'archived'],
      'on-hold': ['active', 'archived'],
      'completed': ['archived'],
      'archived': [], // No transitions allowed from archived
    };

    // Check if transition is allowed
    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      const messages: Record<string, string> = {
        'archived': 'Archived campaigns cannot be edited. Please restore from Recycle Bin first.',
        'completed': 'Completed campaigns can only be archived.',
      };
      return {
        valid: false,
        message: messages[currentStatus] || `Cannot change status from ${currentStatus} to ${newStatus}`,
      };
    }

    // Additional business rules
    if (newStatus === 'completed' && (editingCampaign?.progress || 0) < 100) {
      return {
        valid: false,
        message: 'Campaign must be at 100% progress to mark as completed',
      };
    }

    if (newStatus === 'active' && (!editingCampaign?.team || editingCampaign.team.length === 0)) {
      return {
        valid: false,
        message: 'Campaign must have at least one team member to activate',
      };
    }

    return { valid: true };
  };

  const handleStatusChange = (newStatus: string) => {
    if (!editingCampaign) return;

    const validation = validateStatusChange(editingCampaign.status, newStatus);
    
    if (!validation.valid) {
      toast.error('Status Change Not Allowed', {
        description: validation.message,
      });
      return;
    }

    // Apply status change
    const updatedCampaigns = campaigns.map(c =>
      c.id === editingCampaign.id ? { ...c, status: newStatus as any } : c
    );
    setCampaigns(updatedCampaigns);
    setEditingCampaign({ ...editingCampaign, status: newStatus as any });
    toast.success(`Campaign status changed to ${newStatus}`);
  };

  // P0 FIX #5: Bulk Operations
  const handleBulkArchive = () => {
    if (selectedCampaignIds.length === 0) return;
    
    if (confirm(`Archive ${selectedCampaignIds.length} campaign(s)?`)) {
      const updatedCampaigns = campaigns.map(c =>
        selectedCampaignIds.includes(c.id) ? { ...c, status: 'archived' as const } : c
      );
      setCampaigns(updatedCampaigns);
      toast.success(`${selectedCampaignIds.length} campaign(s) archived`);
      setSelectedCampaignIds([]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedCampaignIds.length === 0) return;
    
    if (confirm(`Permanently delete ${selectedCampaignIds.length} campaign(s)? This cannot be undone.`)) {
      const updatedCampaigns = campaigns.filter(c => !selectedCampaignIds.includes(c.id));
      setCampaigns(updatedCampaigns);
      toast.success(`${selectedCampaignIds.length} campaign(s) deleted permanently`);
      setSelectedCampaignIds([]);
    }
  };

  // P0 FIX #4: Delete vs Archive with Dialog
  const handlePermanentDelete = (campaign: Campaign) => {
    const updatedCampaigns = campaigns.filter(c => c.id !== campaign.id);
    setCampaigns(updatedCampaigns);
    setShowDeleteDialog(false);
    setCampaignToDelete(null);
    toast.success(`Campaign "${campaign.name}" permanently deleted`);
  };

  const handleArchiveFromDialog = (campaign: Campaign) => {
    const updatedCampaigns = campaigns.map(c =>
      c.id === campaign.id ? { ...c, status: 'archived' as const } : c
    );
    setCampaigns(updatedCampaigns);
    setShowDeleteDialog(false);
    setCampaignToDelete(null);
    toast.success(`Campaign "${campaign.name}" archived`);
  };

  const handleSelectAllToggle = () => {
    if (selectedCampaignIds.length === filteredCampaigns.length) {
      setSelectedCampaignIds([]);
    } else {
      setSelectedCampaignIds(filteredCampaigns.map(c => c.id));
    }
  };

  const handleSelectCampaign = (campaignId: string, checked: boolean) => {
    if (checked) {
      setSelectedCampaignIds([...selectedCampaignIds, campaignId]);
    } else {
      setSelectedCampaignIds(selectedCampaignIds.filter(id => id !== campaignId));
    }
  };

  // P0 FIX: Duplicate Campaign
  const handleDuplicateCampaign = (campaign: Campaign) => {
    const newCampaign: Campaign = {
      ...campaign,
      id: `campaign-${Date.now()}`,
      name: `${campaign.name} (Copy)`,
      status: 'planning',
      progress: 0,
      spent: 0,
      startDate: new Date().toISOString().split('T')[0],
    };
    setCampaigns([...campaigns, newCampaign]);
    toast.success(`Campaign duplicated: ${newCampaign.name}`);
  };

  // P0 FIX: Archive with Undo
  const handleArchiveWithUndo = (campaign: Campaign) => {
    const updatedCampaigns = campaigns.map(c => 
      c.id === campaign.id ? { ...c, status: 'archived' as const } : c
    );
    setUndoStack([...undoStack, { action: 'archive', campaign }]);
    setCampaigns(updatedCampaigns);
    
    toast.success('Campaign archived', {
      action: {
        label: 'Undo',
        onClick: () => {
          setCampaigns(campaigns);
          setUndoStack(undoStack.slice(0, -1));
          toast.success('Archive undone!');
        }
      }
    });
  };

  // P0 FIX: Export Analytics
  const handleExportAnalytics = () => {
    if (!selectedCampaign) return;
    
    const analyticsData = {
      campaign: {
        id: selectedCampaign.id,
        name: selectedCampaign.name,
        client: selectedCampaign.client,
        status: selectedCampaign.status,
      },
      metrics: {
        healthScore: selectedCampaign.healthScore,
        progress: selectedCampaign.progress,
        budget: selectedCampaign.budget,
        spent: selectedCampaign.spent,
        burnRate: selectedCampaign.burnRate,
      },
      team: selectedCampaign.team,
      mappedProject: {
        projectId: selectedCampaign.mappedProjectId,
        projectName: selectedCampaign.mappedProjectName,
        tasks: selectedCampaign.mappedTasks,
      },
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-analytics-${selectedCampaign.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Analytics exported successfully!');
  };

  const openEditDialog = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setCampaignName(campaign.name);
    setSelectedClient(campaign.clientId);
    setSelectedManager(campaign.manager);
    setStartDate(campaign.startDate);
    setEndDate(campaign.endDate);
    setBudget(campaign.budget.toString());
    setShowEditDialog(true);
  };

  const renderCampaignActions = (campaign: Campaign, compact = false) => (
    <div className={`flex items-center ${compact ? 'gap-0.5' : 'gap-1'}`}>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => {
          setSelectedCampaign(campaign);
          setShowAnalyticsDialog(true);
        }}
        title="View Analytics"
      >
        <BarChart3 className="w-4 h-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => openEditDialog(campaign)}
        title="Edit Campaign"
        disabled={!hasPermission(Permission.CAMPAIGN_EDIT, campaign.id)}
      >
        <Edit className="w-4 h-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => {
          setEditingCampaign(campaign);
          setShowTemplateCreator(true);
        }}
        title="Save as Template"
      >
        <Copy className="w-4 h-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => handleDuplicateCampaign(campaign)}
        title="Duplicate Campaign"
        disabled={!hasPermission(Permission.CAMPAIGN_DUPLICATE)}
      >
        <Copy className="w-4 h-4 text-blue-600" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => {
          setCampaignToDelete(campaign);
          setShowDeleteDialog(true);
        }}
        title="Delete Campaign"
        disabled={!hasPermission(Permission.CAMPAIGN_DELETE, campaign.id)}
      >
        <Trash2 className="w-4 h-4 text-red-600" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
            <Rocket className="w-8 h-8 text-purple-600" />
            Campaign-to-Resource Mapper
          </h1>
          <p className="text-gray-600 mt-1">
            Plan campaigns, map resources, and track execution with AI-powered matching
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowProjectMappingDialog(true)} className="gap-2">
            <Link className="w-4 h-4" />
            Map Project/Tasks
          </Button>
          <Button variant="outline" onClick={() => setShowTemplateLibrary(true)} className="gap-2">
            <Grid3x3 className="w-4 h-4" />
            Browse Templates
          </Button>
          <Button 
            onClick={() => {
              setUseTemplate(false);
              setShowCreateDialog(true);
            }} 
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{activeCampaigns}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +2 this month
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${(totalBudget / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-gray-600 mt-1">${(totalSpent / 1000).toFixed(0)}K spent</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Health Score</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{avgHealthScore.toFixed(0)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: `${avgHealthScore}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{avgHealthScore.toFixed(0)}%</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Match Score</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">91</p>
                <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  High confidence
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList>
          <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Template Library</TabsTrigger>
          <TabsTrigger value="roi-intelligence">ROI Intelligence</TabsTrigger>
          <TabsTrigger value="conflict-radar">Conflict Radar</TabsTrigger>
          <TabsTrigger value="perf-matrix">Performance Matrix</TabsTrigger>
          <TabsTrigger value="methodology">How It Works</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Campaign Overview</CardTitle>
                <div className="flex gap-2">
                  <div className="flex items-center rounded-md border bg-white p-1">
                    <Button
                      variant={campaignViewMode === 'card' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => setCampaignViewMode('card')}
                    >
                      <Layers className="w-4 h-4 mr-1" />
                      Card
                    </Button>
                    <Button
                      variant={campaignViewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => setCampaignViewMode('grid')}
                    >
                      <Grid3x3 className="w-4 h-4 mr-1" />
                      Grid
                    </Button>
                    <Button
                      variant={campaignViewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => setCampaignViewMode('list')}
                    >
                      <List className="w-4 h-4 mr-1" />
                      List
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowFilterDialog(true)}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                    {Object.values(filters).filter(v => v !== 'all').length > 0 && (
                      <Badge className="ml-2" variant="secondary">
                        {Object.values(filters).filter(v => v !== 'all').length}
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredCampaigns.length === 0 ? (
                <div className="h-96">
                  <EmptyState
                    type={searchTerm || Object.values(filters).some(f => f !== 'all') ? 'no-results' : 'no-campaigns'}
                    searchTerm={searchTerm}
                    onAction={() => {
                      if (searchTerm || Object.values(filters).some(f => f !== 'all')) {
                        setSearchTerm('');
                        setFilters({
                          status: 'all',
                          client: 'all',
                          manager: 'all',
                          hasMapping: 'all',
                          fromTemplate: 'all',
                        });
                      } else {
                        setShowCreateDialog(true);
                      }
                    }}
                  />
                </div>
              ) : campaignViewMode === 'card' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-3 bg-gray-50">
                    <div className="text-sm text-gray-700">Select campaigns for bulk actions</div>
                    <BulkSelectCheckbox
                      checked={selectedCampaignIds.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                      onCheckedChange={handleSelectAllToggle}
                    />
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filteredCampaigns.map((campaign) => (
                      <Card key={campaign.id} className="border-gray-200">
                        <CardContent className="p-4 space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <BulkSelectCheckbox
                                checked={selectedCampaignIds.includes(campaign.id)}
                                onCheckedChange={(checked) => handleSelectCampaign(campaign.id, checked as boolean)}
                              />
                              <div>
                                <div className="font-semibold text-gray-900">{campaign.name}</div>
                                <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                  <Building2 className="w-3 h-3" />
                                  {campaign.client}
                                  <span className="mx-1">•</span>
                                  {campaign.type}
                                </div>
                              </div>
                            </div>
                            {getStatusBadge(campaign.status)}
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div>
                              <div className="text-xs text-gray-500">Manager</div>
                              <div className="font-medium">{campaign.manager}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Budget</div>
                              <div className="font-medium">${(campaign.budget / 1000).toFixed(0)}K</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Health</div>
                              <button
                                onClick={() => {
                                  setSelectedCampaignForHealth(campaign);
                                  setShowHealthScoreDialog(true);
                                }}
                                className={`font-semibold ${getHealthColor(campaign.healthScore)} hover:underline`}
                              >
                                {campaign.healthScore}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>Progress</span>
                              <span>{campaign.progress}%</span>
                            </div>
                            <Progress value={campaign.progress} className="h-1.5" />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs text-gray-600">
                              ${(campaign.spent / 1000).toFixed(0)}K spent
                            </div>
                            {renderCampaignActions(campaign)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : campaignViewMode === 'grid' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-3 bg-gray-50">
                    <div className="text-sm text-gray-700">Select campaigns for bulk actions</div>
                    <BulkSelectCheckbox
                      checked={selectedCampaignIds.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                      onCheckedChange={handleSelectAllToggle}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredCampaigns.map((campaign) => (
                      <Card key={campaign.id} className="border-gray-200">
                        <CardContent className="p-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <BulkSelectCheckbox
                              checked={selectedCampaignIds.includes(campaign.id)}
                              onCheckedChange={(checked) => handleSelectCampaign(campaign.id, checked as boolean)}
                            />
                            {getStatusBadge(campaign.status)}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-gray-900 truncate">{campaign.name}</div>
                            <div className="text-xs text-gray-600 truncate">{campaign.client}</div>
                          </div>
                          <Progress value={campaign.progress} className="h-1.5" />
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <div className="text-gray-500">Progress</div>
                              <div className="font-medium">{campaign.progress}%</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Budget</div>
                              <div className="font-medium">${(campaign.budget / 1000).toFixed(0)}K</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Health</div>
                              <button
                                onClick={() => {
                                  setSelectedCampaignForHealth(campaign);
                                  setShowHealthScoreDialog(true);
                                }}
                                className={`font-semibold ${getHealthColor(campaign.healthScore)} hover:underline`}
                              >
                                {campaign.healthScore}
                              </button>
                            </div>
                            <div>
                              <div className="text-gray-500">Manager</div>
                              <div className="font-medium truncate">{campaign.manager}</div>
                            </div>
                          </div>
                          {renderCampaignActions(campaign, true)}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <BulkSelectCheckbox
                        checked={selectedCampaignIds.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                        onCheckedChange={handleSelectAllToggle}
                      />
                    </TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <BulkSelectCheckbox
                          checked={selectedCampaignIds.includes(campaign.id)}
                          onCheckedChange={(checked) => handleSelectCampaign(campaign.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                            {campaign.fromTemplate ? (
                              <>
                                <Grid3x3 className="w-3 h-3" />
                                From Template
                              </>
                            ) : (
                              <>
                                <FileText className="w-3 h-3" />
                                Custom Campaign
                              </>
                            )}
                            {campaign.mappedProjectId && (
                              <>
                                <span className="mx-1">•</span>
                                <Link className="w-3 h-3 text-blue-600" />
                                <span className="text-blue-600">Mapped to Project</span>
                              </>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{campaign.client}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{campaign.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{campaign.manager}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{campaign.progress}%</span>
                          </div>
                          <Progress value={campaign.progress} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">${(campaign.budget / 1000).toFixed(0)}K</div>
                          <div className="text-xs text-gray-600">
                            ${(campaign.spent / 1000).toFixed(0)}K spent
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => {
                            setSelectedCampaignForHealth(campaign);
                            setShowHealthScoreDialog(true);
                          }}
                          className={`text-sm font-semibold ${getHealthColor(campaign.healthScore)} hover:underline cursor-pointer flex items-center gap-1`}
                          title="Click to see health score breakdown"
                        >
                          {campaign.healthScore}
                          <Info className="w-3 h-3 opacity-60" />
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end">{renderCampaignActions(campaign)}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Template Library Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold">Campaign Templates</h3>
              <p className="text-sm text-gray-600 mt-1">Pre-configured templates for common campaign types</p>
            </div>
            <Button onClick={() => setShowTemplateManager(true)} className="gap-2">
              <Grid3x3 className="w-4 h-4" />
              Manage Templates
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {campaignTemplates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleTemplateSelect(template)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-${template.color}-100 rounded-lg`}>
                        <Share2 className={`w-5 h-5 text-${template.color}-600`} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {template.type}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{template.description}</p>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{template.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Team Size:</span>
                      <span className="font-medium">{template.teamSize}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-medium">{template.budgetRange}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">Phases ({template.phases.length}):</p>
                    <div className="space-y-1">
                      {template.phases.map((phase, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          <span className="text-gray-600">{phase.name}</span>
                          <span className="text-gray-400 ml-auto">{phase.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full gap-2" size="sm">
                    <Plus className="w-4 h-4" />
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* How It Works Tab */}
        <TabsContent value="methodology" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                How Campaign Mapper Works
              </CardTitle>
              <CardDescription>
                Understand the methodology behind campaign planning, resource matching, and execution tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overview */}
              <div>
                <h3 className="text-lg font-semibold mb-3">📊 Overview</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Campaign Mapper is an intelligent planning tool that connects your marketing campaigns 
                  with the right resources at the right time. It uses AI-powered matching, client data 
                  integration, and proven campaign templates to ensure successful execution.
                </p>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">🔄 Campaign Creation Workflow</h3>
                <div className="space-y-4">
                  {[
                    {
                      step: '1',
                      title: 'Choose Creation Method',
                      description: 'Start with a proven template or create a custom campaign from scratch.',
                      color: 'blue',
                    },
                    {
                      step: '2',
                      title: 'Link to Client',
                      description: 'Select from Client Master to auto-populate financial data, history, and preferences.',
                      color: 'purple',
                    },
                    {
                      step: '3',
                      title: 'Define Campaign Details',
                      description: 'Set campaign manager, dates, budget, and upload supporting documents.',
                      color: 'green',
                    },
                    {
                      step: '4',
                      title: 'AI Resource Matching',
                      description: 'System analyzes required skills, availability, and past performance to suggest best-fit resources.',
                      color: 'amber',
                    },
                    {
                      step: '5',
                      title: 'Assign Team',
                      description: 'Choose individual resources or assign entire resource pools based on AI recommendations.',
                      color: 'red',
                    },
                    {
                      step: '6',
                      title: 'Track & Optimize',
                      description: 'Monitor progress, budget burn rate, and health scores with real-time dashboards.',
                      color: 'cyan',
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-${item.color}-100 text-${item.color}-700 flex items-center justify-center font-bold text-sm`}>
                        {item.step}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">🧮 Key Formulas & Calculations</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="font-semibold text-sm text-blue-900 mb-2">Campaign Health Score</div>
                    <code className="text-xs bg-white px-2 py-1 rounded border block mb-2">
                      Health Score = (On-Time % × 0.3) + (Budget Adherence × 0.4) + (Quality Score × 0.3)
                    </code>
                    <p className="text-xs text-blue-800">
                      <strong>80-100:</strong> Excellent • <strong>60-79:</strong> Good • <strong>Below 60:</strong> Needs Attention
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                    <div className="font-semibold text-sm text-purple-900 mb-2">AI Match Score</div>
                    <code className="text-xs bg-white px-2 py-1 rounded border block mb-2">
                      Match Score = (Skill Alignment × 0.4) + (Availability × 0.3) + (Past Success × 0.3)
                    </code>
                    <p className="text-xs text-purple-800">
                      Scores above 85 indicate high confidence. System recommends resources with 75+ scores.
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="font-semibold text-sm text-green-900 mb-2">Budget Burn Rate</div>
                    <code className="text-xs bg-white px-2 py-1 rounded border block mb-2">
                      Burn Rate = Total Spent / Days Elapsed
                    </code>
                    <p className="text-xs text-green-800">
                      Compares actual burn vs. planned burn to identify over/under-spending early.
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                    <div className="font-semibold text-sm text-amber-900 mb-2">Projected ROI</div>
                    <code className="text-xs bg-white px-2 py-1 rounded border block mb-2">
                      ROI = ((Client Revenue - Campaign Cost) / Campaign Cost) × 100
                    </code>
                    <p className="text-xs text-amber-800">
                      Linked with Client Master financial data for automatic profitability tracking.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">💡 Benefits & Use Cases</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      icon: <Zap className="w-5 h-5 text-blue-600" />,
                      title: 'Faster Campaign Setup',
                      description: 'Templates reduce planning time from days to minutes',
                    },
                    {
                      icon: <Brain className="w-5 h-5 text-purple-600" />,
                      title: 'AI-Powered Matching',
                      description: 'Find the perfect resources based on skills and availability',
                    },
                    {
                      icon: <DollarSign className="w-5 h-5 text-green-600" />,
                      title: 'Budget Control',
                      description: 'Real-time tracking prevents overspending and ensures margin',
                    },
                    {
                      icon: <Target className="w-5 h-5 text-red-600" />,
                      title: 'Client Integration',
                      description: 'Seamless connection with Client Master for financial accuracy',
                    },
                    {
                      icon: <Users className="w-5 h-5 text-cyan-600" />,
                      title: 'Team Flexibility',
                      description: 'Assign individuals or entire resource pools',
                    },
                    {
                      icon: <BarChart3 className="w-5 h-5 text-amber-600" />,
                      title: 'Performance Analytics',
                      description: 'Track health scores and optimize campaigns in real-time',
                    },
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 p-2 bg-white rounded-lg border">
                        {benefit.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{benefit.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{benefit.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">❓ Frequently Asked Questions</h3>
                <div className="space-y-3">
                  {[
                    {
                      q: 'Can I create a campaign without using a template?',
                      a: 'Yes! Toggle "Use Template" off when creating a campaign to build from scratch with all custom fields.',
                    },
                    {
                      q: 'How does Client Master integration work?',
                      a: 'Selecting a client auto-populates budget history, margin targets, and financial data from Client Master & Financial Mapping Engine (CMFME).',
                    },
                    {
                      q: 'What file types can I upload?',
                      a: 'Supports all common formats: PDF, DOC, XLS, PPT, images, and more. Max 25MB per file.',
                    },
                    {
                      q: 'How are AI Match Scores calculated?',
                      a: 'System analyzes skill alignment (40%), current availability (30%), and historical campaign success rate (30%).',
                    },
                  ].map((faq, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <div className="font-semibold text-sm text-gray-900 mb-1 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        {faq.q}
                      </div>
                      <div className="text-sm text-gray-600 ml-6">{faq.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ROI Intelligence ── */}
        <TabsContent value="roi-intelligence" className="space-y-6 mt-4">
          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Portfolio ROAS', value: '5.1×', sub: 'Revenue per $1 spent', color: 'text-blue-600' },
              { label: 'Total Revenue', value: '$438k', sub: 'Across all active campaigns', color: 'text-green-600' },
              { label: 'Avg CPL', value: '$53', sub: 'Cost per qualified lead', color: 'text-purple-600' },
              { label: 'Best ROI Channel', value: 'Email', sub: '1,425% ROI this quarter', color: 'text-amber-600' },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="pt-5 pb-4">
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ROAS by campaign */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">ROAS by Campaign</CardTitle>
                <CardDescription>Revenue per $1 of media spend — target ≥ 3×</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={CAMPAIGN_ROI_DATA} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} label={{ value: 'ROAS (×)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#6b7280' }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={130} />
                    <Tooltip formatter={(v: number) => [`${v.toFixed(1)}×`, 'ROAS']} />
                    <ReferenceLine x={3} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Target 3×', position: 'top', fontSize: 9, fill: '#16a34a' }} />
                    <Bar dataKey="roas" radius={[0, 4, 4, 0]}>
                      {CAMPAIGN_ROI_DATA.map((d, i) => (
                        <Cell key={i} fill={d.roas >= 5 ? '#22c55e' : d.roas >= 3 ? '#3b82f6' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost per lead by channel */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Cost Per Lead by Channel</CardTitle>
                <CardDescription>Lower is better — benchmark: &lt;$50</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={CAMPAIGN_ROI_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                    <Tooltip formatter={(v: number) => [`$${v}`, 'CPL']} />
                    <ReferenceLine y={50} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'Benchmark $50', position: 'right', fontSize: 9, fill: '#f97316' }} />
                    <Bar dataKey="cpl" name="CPL ($)" radius={[4, 4, 0, 0]}>
                      {CAMPAIGN_ROI_DATA.map((d, i) => (
                        <Cell key={i} fill={CHANNEL_COLORS[d.channel] ?? '#6b7280'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* ROI detail table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Campaign ROI Detail Table</CardTitle>
              <CardDescription>Spend, revenue, attribution model, and ROI% per campaign</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-gray-500">
                    <th className="text-left pb-2 font-medium">Campaign</th>
                    <th className="text-center pb-2 font-medium">Channel</th>
                    <th className="text-right pb-2 font-medium">Spend</th>
                    <th className="text-right pb-2 font-medium">Revenue</th>
                    <th className="text-right pb-2 font-medium">ROAS</th>
                    <th className="text-right pb-2 font-medium">Leads</th>
                    <th className="text-right pb-2 font-medium">CPL</th>
                    <th className="text-center pb-2 font-medium">Attribution</th>
                    <th className="text-right pb-2 font-medium">ROI %</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[...CAMPAIGN_ROI_DATA].sort((a, b) => b.roi - a.roi).map(c => (
                    <tr key={c.name} className="hover:bg-gray-50">
                      <td className="py-2 font-medium text-gray-800">{c.name}</td>
                      <td className="py-2 text-center">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: CHANNEL_COLORS[c.channel] + '22', color: CHANNEL_COLORS[c.channel] }}>{c.channel}</span>
                      </td>
                      <td className="py-2 text-right text-gray-600">${c.spend}k</td>
                      <td className="py-2 text-right text-green-600 font-semibold">${c.revenue}k</td>
                      <td className="py-2 text-right">
                        <span className={`font-bold ${c.roas >= 5 ? 'text-green-600' : c.roas >= 3 ? 'text-blue-600' : 'text-red-600'}`}>{c.roas.toFixed(1)}×</span>
                      </td>
                      <td className="py-2 text-right text-gray-600">{c.leads}</td>
                      <td className="py-2 text-right text-gray-600">${c.cpl}</td>
                      <td className="py-2 text-center text-xs text-gray-500 capitalize">{c.attribution.replace('-', ' ')}</td>
                      <td className="py-2 text-right font-bold text-purple-700">{c.roi}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Resource Conflict Radar ── */}
        <TabsContent value="conflict-radar" className="space-y-6 mt-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'High Severity', count: 2, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
              { label: 'Medium Severity', count: 2, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
              { label: 'Low Severity', count: 1, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
            ].map(s => (
              <Card key={s.label} className={`border ${s.bg}`}>
                <CardContent className="pt-4 pb-4 flex items-center gap-3">
                  <AlertTriangle className={`w-7 h-7 ${s.color}`} />
                  <div>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Overallocation chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Weekly Hours — Allocated vs Capacity</CardTitle>
              <CardDescription>Resources with cross-campaign allocation conflicts</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={OVERALLOC_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} label={{ value: 'Hours / week', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#6b7280' }} />
                  <YAxis dataKey="resource" type="category" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip />
                  <Legend />
                  <ReferenceLine x={40} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '40h limit', position: 'top', fontSize: 9, fill: '#ef4444' }} />
                  <Bar dataKey="capacity" name="Capacity" fill="#93c5fd" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="allocated" name="Allocated" fill="#f97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Conflict table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Cross-Campaign Conflict Log</CardTitle>
              <CardDescription>Resources double-booked across simultaneous campaigns — with AI resolution suggestions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {RESOURCE_CONFLICTS.map((c, i) => (
                <div key={i} className={`rounded-lg border p-4 ${c.severity === 'high' ? 'border-red-200 bg-red-50' : c.severity === 'medium' ? 'border-amber-200 bg-amber-50' : 'border-blue-200 bg-blue-50'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">{c.resource}</span>
                        <span className="text-xs text-gray-500">({c.role})</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${c.severity === 'high' ? 'bg-red-100 text-red-700' : c.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{c.severity}</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">{c.campaign1}</span> ↔ <span className="font-medium">{c.campaign2}</span>
                        <span className="ml-2 text-gray-400">· {c.overlapWeeks}wk overlap · {c.hoursConflict}h over capacity</span>
                      </p>
                      <p className="text-xs text-green-700 flex items-start gap-1">
                        <Brain className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span><span className="font-semibold">Suggested:</span> {c.resolution}</span>
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs h-7 flex-shrink-0" onClick={() => toast.success('Conflict flagged for scheduling review')}>
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Performance Matrix ── */}
        <TabsContent value="perf-matrix" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Channel Performance Radar</CardTitle>
                <CardDescription>Composite score (0–100) across 6 performance dimensions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={PERF_RADAR}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    {(['Paid Social', 'Email', 'SEO', 'Display', 'Influencer'] as const).map(ch => (
                      <Radar key={ch} name={ch} dataKey={ch} stroke={CHANNEL_COLORS[ch]} fill={CHANNEL_COLORS[ch]} fillOpacity={0.1} strokeWidth={2} />
                    ))}
                    <Legend iconSize={10} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Budget reallocation */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">AI Budget Reallocation Suggestions</CardTitle>
                <CardDescription>Data-driven shifts to maximize blended ROAS</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {REALLOC_SUGGESTIONS.map((s, i) => (
                  <div key={i} className="rounded-lg border border-purple-100 bg-purple-50 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-red-600">−${s.amount}k</span>
                        <span className="text-gray-500">from</span>
                        <span className="font-medium" style={{ color: CHANNEL_COLORS[s.from] }}>{s.from}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium" style={{ color: CHANNEL_COLORS[s.to] }}>{s.to}</span>
                        <span className="font-semibold text-green-600">+${s.amount}k</span>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs h-6" onClick={() => toast.success('Reallocation queued for approval')}>
                        Apply
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600">{s.rationale}</p>
                  </div>
                ))}
                <div className="rounded-lg border border-green-100 bg-green-50 p-3">
                  <p className="text-xs text-green-800 font-semibold">Projected impact if applied: +1.4× blended ROAS · +$62k incremental revenue</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Heatmap table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Channel × Metric Heatmap</CardTitle>
              <CardDescription>Scores 0–100 — darker green = stronger performance</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2 pr-4 font-medium text-gray-600">Channel</th>
                    {['ROAS', 'Lead Quality', 'Cost Efficiency', 'Conversion Rate', 'Brand Lift', 'Scalability'].map(m => (
                      <th key={m} className="text-center pb-2 px-2 font-medium text-gray-600">{m}</th>
                    ))}
                    <th className="text-center pb-2 px-2 font-medium text-gray-600">Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {(['Paid Social', 'Email', 'SEO', 'Display', 'Influencer'] as const).map(ch => {
                    const scores = PERF_RADAR.map(r => r[ch] as number);
                    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
                    return (
                      <tr key={ch} className="border-t border-gray-100">
                        <td className="py-2 pr-4 font-semibold" style={{ color: CHANNEL_COLORS[ch] }}>{ch}</td>
                        {scores.map((score, i) => {
                          const bg = score >= 85 ? '#16a34a' : score >= 70 ? '#4ade80' : score >= 55 ? '#fbbf24' : '#f87171';
                          return (
                            <td key={i} className="py-1 px-1">
                              <div className="rounded text-center py-1 text-white font-bold text-[11px]" style={{ backgroundColor: bg }}>{score}</div>
                            </td>
                          );
                        })}
                        <td className="py-1 px-1">
                          <div className={`rounded text-center py-1 font-bold text-[11px] ${avg >= 75 ? 'bg-blue-600 text-white' : avg >= 60 ? 'bg-blue-400 text-white' : 'bg-gray-300 text-gray-700'}`}>{avg}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Create Campaign Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-purple-600" />
              {useTemplate ? 'Create Campaign from Template' : 'Create Custom Campaign'}
            </DialogTitle>
            <DialogDescription>
              {useTemplate 
                ? `Using template: ${selectedTemplate?.name}`
                : 'Define all campaign details manually'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Template Toggle */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <Grid3x3 className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-semibold text-sm text-blue-900">Use Campaign Template</div>
                  <div className="text-xs text-blue-700">
                    {useTemplate ? 'Creating from proven template' : 'Creating custom campaign'}
                  </div>
                </div>
              </div>
              <Switch
                checked={useTemplate}
                onCheckedChange={(checked) => {
                  setUseTemplate(checked);
                  if (!checked) setSelectedTemplate(null);
                }}
              />
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Campaign Name *</Label>
                  <Input
                    id="campaign-name"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g., Summer Brand Refresh"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client">Client *</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            {client.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manager">Campaign Manager *</Label>
                  <Select value={selectedManager} onValueChange={setSelectedManager}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockManagers.map((manager) => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (USD) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="25000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date *</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date *</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Resource Assignment */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Resource Assignment
              </h3>

              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="individual"
                    name="assignment"
                    checked={assignmentType === 'individual'}
                    onChange={() => setAssignmentType('individual')}
                  />
                  <Label htmlFor="individual" className="text-sm cursor-pointer">
                    Assign Individuals
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="pool"
                    name="assignment"
                    checked={assignmentType === 'pool'}
                    onChange={() => setAssignmentType('pool')}
                  />
                  <Label htmlFor="pool" className="text-sm cursor-pointer">
                    Assign Resource Pool
                  </Label>
                </div>
              </div>

              {assignmentType === 'individual' ? (
                <div className="space-y-2">
                  <Label>Select Team Members</Label>
                  <div className="p-3 border rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-600 mb-2">Search and select individual resources</p>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Team Member
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="resource-pool">Resource Pool</Label>
                  <Select value={selectedPool} onValueChange={setSelectedPool}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select resource pool..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockResourcePools.map((pool) => (
                        <SelectItem key={pool.id} value={pool.id}>
                          {pool.name} ({pool.size} members)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Project/Task Mapping (Optional) */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Link className="w-4 h-4" />
                Map Project/Tasks <span className="text-xs text-gray-500 font-normal ml-2">(Optional)</span>
              </h3>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-blue-900">Link to PPM Project</div>
                    <div className="text-xs text-blue-700 mt-1">
                      {selectedPPMProject && mappedTasks.length > 0 
                        ? `${mappedTasks.length} task(s) mapped from PPM tool`
                        : 'Connect this campaign to existing project tasks'}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowProjectMappingDialog(true)}
                    className="gap-2"
                  >
                    <Link className="w-4 h-4" />
                    {selectedPPMProject ? 'Change Mapping' : 'Map Project'}
                  </Button>
                </div>
              </div>

              {selectedPPMProject && mappedTasks.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-xs font-semibold text-green-900 mb-2">Mapped Project:</div>
                  <div className="text-sm text-green-800">
                    {mockPPMProjects.find(p => p.id === selectedPPMProject)?.name}
                  </div>
                  <div className="text-xs text-green-700 mt-1">
                    Source ID: {selectedPPMProject} • {mappedTasks.length} tasks mapped
                  </div>
                </div>
              )}
            </div>

            {/* Document Upload */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Documents
              </h3>

              <div>
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <label htmlFor="file-upload">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-900">Click to upload files</p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, XLS, PPT, Images • Max 25MB per file
                    </p>
                  </div>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files ({uploadedFiles.length})</Label>
                  <div className="space-y-2">
                    {uploadedFiles.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <Paperclip className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                            <div className="text-xs text-gray-600">{doc.size}</div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(doc.id)}
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Basic Budget Case */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Basic Budget Case
              </h3>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Campaign Budget</div>
                    <div className="text-xl font-bold text-gray-900">
                      ${budget ? Number(budget).toLocaleString() : '0'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Estimated Team Cost</div>
                    <div className="text-xl font-bold text-gray-900">
                      ${budget ? (Number(budget) * 0.7).toLocaleString() : '0'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Projected Margin</div>
                    <div className="text-xl font-bold text-green-600">30%</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Expected ROI</div>
                    <div className="text-xl font-bold text-purple-600">45%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCampaign} className="gap-2" disabled={isLoading}>
              <CheckCircle2 className="w-4 h-4" />
              {isLoading ? 'Creating...' : 'Create Campaign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Campaign Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Edit Campaign: {editingCampaign?.name}
            </DialogTitle>
            <DialogDescription>
              Modify campaign details, status, team assignments, and budget
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Status Change */}
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-amber-900">Campaign Status</div>
                  <div className="text-xs text-amber-700 mt-1">
                    Current: {editingCampaign?.status?.toUpperCase()}
                  </div>
                </div>
                <Select 
                  value={editingCampaign?.status} 
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        Planning
                      </div>
                    </SelectItem>
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-green-600" />
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="on-hold">
                      <div className="flex items-center gap-2">
                        <Pause className="w-4 h-4 text-amber-600" />
                        On Hold
                      </div>
                    </SelectItem>
                    <SelectItem value="completed">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-gray-600" />
                        Completed
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Campaign Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Campaign Name</Label>
                  <Input
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Client</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Campaign Manager</Label>
                  <Select value={selectedManager} onValueChange={setSelectedManager}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockManagers.map((manager) => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Budget (USD)</Label>
                  <Input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team Members ({editingCampaign?.team?.length || 0})
              </h3>
              
              {editingCampaign?.team && editingCampaign.team.length > 0 ? (
                <div className="space-y-2">
                  {editingCampaign.team.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700">
                          {member.avatar}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{member.name}</div>
                          <div className="text-xs text-gray-600">{member.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs text-gray-600">Match Score</div>
                          <div className="text-sm font-semibold text-green-600">{member.matchScore}%</div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-600">
                  No team members assigned
                </div>
              )}
              
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Team Member
              </Button>
            </div>

            {/* Project/Task Mapping (Optional) */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Link className="w-4 h-4" />
                Map Project/Tasks <span className="text-xs text-gray-500 font-normal ml-2">(Optional)</span>
              </h3>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-blue-900">Link to PPM Project</div>
                    <div className="text-xs text-blue-700 mt-1">
                      {editingCampaign?.mappedProjectId 
                        ? `Mapped: ${editingCampaign.mappedProjectName} (${editingCampaign.mappedTasks?.length || 0} tasks)`
                        : 'Connect this campaign to existing project tasks'}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowProjectMappingDialog(true)}
                    className="gap-2"
                  >
                    <Link className="w-4 h-4" />
                    {editingCampaign?.mappedProjectId ? 'Change Mapping' : 'Map Project'}
                  </Button>
                </div>
              </div>

              {editingCampaign?.mappedProjectId && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-xs font-semibold text-green-900 mb-2">Currently Mapped:</div>
                  <div className="text-sm text-green-800 font-medium">
                    {editingCampaign.mappedProjectName}
                  </div>
                  <div className="text-xs text-green-700 mt-1">
                    Source ID: {editingCampaign.mappedProjectId} • {editingCampaign.mappedTasks?.length || 0} tasks mapped
                  </div>
                </div>
              )}
            </div>

            {/* Campaign Health */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Campaign Health Metrics
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs text-blue-700">Progress</div>
                  <div className="text-2xl font-bold text-blue-900 mt-1">
                    {editingCampaign?.progress || 0}%
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-xs text-green-700">Health Score</div>
                  <div className="text-2xl font-bold text-green-900 mt-1">
                    {editingCampaign?.healthScore || 0}
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-xs text-purple-700">Burn Rate</div>
                  <div className="text-2xl font-bold text-purple-900 mt-1">
                    ${editingCampaign?.burnRate || 0}
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="text-xs text-amber-700">Spent</div>
                  <div className="text-2xl font-bold text-amber-900 mt-1">
                    ${((editingCampaign?.spent || 0) / 1000).toFixed(0)}K
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (editingCampaign) {
                  const updatedCampaigns = campaigns.map(c => 
                    c.id === editingCampaign.id 
                      ? { ...c, name: campaignName, clientId: selectedClient, manager: selectedManager, 
                          startDate, endDate, budget: Number(budget), status: editingCampaign.status }
                      : c
                  );
                  setCampaigns(updatedCampaigns);
                  toast.success('Campaign updated successfully!');
                  setShowEditDialog(false);
                }
              }} 
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Campaign Analytics: {selectedCampaign?.name}
            </DialogTitle>
            <DialogDescription>
              Performance metrics, budget tracking, team utilization, and predictive insights
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Health Score</p>
                      <p className={`text-2xl font-bold ${getHealthColor(selectedCampaign?.healthScore || 0)}`}>
                        {selectedCampaign?.healthScore || 0}
                      </p>
                    </div>
                    <Target className="w-6 h-6 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Budget Used</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedCampaign ? Math.round((selectedCampaign.spent / selectedCampaign.budget) * 100) : 0}%
                      </p>
                    </div>
                    <DollarSign className="w-6 h-6 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Team Size</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedCampaign?.team?.length || 0}
                      </p>
                    </div>
                    <Users className="w-6 h-6 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Days Remaining</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedCampaign ? Math.ceil((new Date(selectedCampaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0}
                      </p>
                    </div>
                    <Calendar className="w-6 h-6 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Budget Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Budget Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Budget</span>
                    <span className="font-semibold">${selectedCampaign?.budget.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Spent</span>
                    <span className="font-semibold text-red-600">${selectedCampaign?.spent.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Remaining</span>
                    <span className="font-semibold text-green-600">
                      ${((selectedCampaign?.budget || 0) - (selectedCampaign?.spent || 0)).toLocaleString()}
                    </span>
                  </div>
                  <Progress 
                    value={selectedCampaign ? (selectedCampaign.spent / selectedCampaign.budget) * 100 : 0} 
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-xs text-gray-600">Burn Rate</div>
                    <div className="text-lg font-bold text-purple-600">
                      ${selectedCampaign?.burnRate || 0}/day
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600">Projected Total</div>
                    <div className="text-lg font-bold text-blue-600">
                      ${selectedCampaign ? Math.round(selectedCampaign.spent * 1.15).toLocaleString() : 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600">Est. Margin</div>
                    <div className="text-lg font-bold text-green-600">28%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Utilization */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Team Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCampaign?.team && selectedCampaign.team.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCampaign.team.map((member) => (
                      <div key={member.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700">
                              {member.avatar}
                            </div>
                            <span className="font-medium">{member.name}</span>
                            <span className="text-gray-600">• {member.role}</span>
                          </div>
                          <span className="text-xs text-gray-600">
                            {member.allocatedHours}h allocated
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={75} className="h-1.5 flex-1" />
                          <span className="text-xs text-gray-600 w-12">75%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-sm text-gray-600 py-4">
                    No team members assigned
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Trend (Mock Chart) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 bg-blue-500 rounded" />
                      <span>Budget</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 bg-green-500 rounded" />
                      <span>Progress</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 bg-purple-500 rounded" />
                      <span>Health</span>
                    </div>
                  </div>
                  
                  {/* Simple Bar Chart Representation */}
                  <div className="space-y-3">
                    {['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'].map((week, idx) => (
                      <div key={week} className="flex items-center gap-3">
                        <div className="text-xs text-gray-600 w-16">{week}</div>
                        <div className="flex-1 flex gap-1">
                          <div 
                            className="bg-blue-500 h-6 rounded" 
                            style={{ width: `${20 + idx * 15}%` }}
                          />
                          <div 
                            className="bg-green-500 h-6 rounded" 
                            style={{ width: `${15 + idx * 12}%` }}
                          />
                          <div 
                            className="bg-purple-500 h-6 rounded" 
                            style={{ width: `${25 + idx * 10}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project/Task Mapping Info */}
            {selectedCampaign?.mappedProjectId && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Link className="w-4 h-4 text-blue-600" />
                    Mapped Project & Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-blue-900">
                          {selectedCampaign.mappedProjectName || 'Workfront Project'}
                        </div>
                        <div className="text-xs text-blue-700 mt-1">
                          Source ID: {selectedCampaign.mappedProjectId}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-blue-700 border-blue-300">
                        {selectedCampaign.mappedTasks?.length || 0} Tasks Mapped
                      </Badge>
                    </div>
                  </div>

                  {selectedCampaign.mappedTasks && selectedCampaign.mappedTasks.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-gray-700">Mapped Tasks:</div>
                      {selectedCampaign.mappedTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                          <div>
                            <div className="text-sm font-medium">{task.name}</div>
                            <div className="text-xs text-gray-600">Task ID: {task.sourceId}</div>
                          </div>
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Insights & Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-green-900">On Track for Success</div>
                    <div className="text-xs text-green-700 mt-1">
                      Campaign is performing {selectedCampaign?.healthScore || 0}% above baseline. Team productivity is excellent.
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-amber-900">Budget Watch</div>
                    <div className="text-xs text-amber-700 mt-1">
                      Current burn rate may exceed budget by 8%. Consider reallocating resources.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-blue-900">Optimization Opportunity</div>
                    <div className="text-xs text-blue-700 mt-1">
                      2 team members have capacity for additional tasks. Consider cross-training.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAnalyticsDialog(false)}>
              Close
            </Button>
            <Button className="gap-2" onClick={handleExportAnalytics}>
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PPM Project Mapping Dialog */}
      <Dialog open={showProjectMappingDialog} onOpenChange={setShowProjectMappingDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="w-5 h-5 text-blue-600" />
              Map Project/Tasks to Campaign
            </DialogTitle>
            <DialogDescription>
              Import projects and tasks from your PPM tool (Workfront, Jira, Monday, Asana, etc.)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-3">
              {mockPPMProjects.map((project) => (
                <Card 
                  key={project.id}
                  className={`cursor-pointer ${selectedPPMProject === project.id ? 'border-blue-500 bg-blue-50' : ''}`}
                  onClick={() => setSelectedPPMProject(project.id)}
                >
                  <CardContent className="p-4">
                    <div className="font-semibold">{project.name}</div>
                    <div className="text-sm text-gray-600">Client: {project.client}</div>
                    {selectedPPMProject === project.id && (
                      <div className="mt-4 space-y-2">
                        {project.tasks.map((task) => (
                          <div key={task.id} className="flex items-center gap-2 p-2 bg-white rounded border">
                            <input type="checkbox" checked={mappedTasks.includes(task.id)} onChange={(e) => {
                              if (e.target.checked) setMappedTasks([...mappedTasks, task.id]);
                              else setMappedTasks(mappedTasks.filter(id => id !== task.id));
                            }} />
                            <div className="text-xs">{task.name}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProjectMappingDialog(false)}>Cancel</Button>
            <Button onClick={() => { toast.success('Mapped from PPM tool!'); setShowProjectMappingDialog(false); }}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <FilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        filters={filters}
        onFiltersChange={setFilters}
        clients={mockClients}
        managers={mockManagers}
      />

      {/* Bulk Operations Bar */}
      <BulkOperationsBar
        selectedCount={selectedCampaignIds.length}
        onArchiveSelected={handleBulkArchive}
        onDeleteSelected={handleBulkDelete}
        onClearSelection={() => setSelectedCampaignIds([])}
        showRestore={false}
      />

      {/* Template Manager */}
      <TemplateManager
        open={showTemplateManager}
        onOpenChange={setShowTemplateManager}
        templates={campaignTemplates}
        onUseTemplate={(template) => {
          setSelectedTemplate(template as any);
          setShowCreateDialog(true);
        }}
        onEditTemplate={(template) => {
          toast.info(`Editing template: ${template.name}`);
        }}
        onDeleteTemplate={(templateId) => {
          toast.success('Template deleted');
        }}
        onDuplicateTemplate={(template) => {
          toast.success(`Template "${template.name}" duplicated`);
        }}
      />

      {/* Health Score Breakdown */}
      {selectedCampaignForHealth && (
        <HealthScoreBreakdown
          open={showHealthScoreDialog}
          onOpenChange={setShowHealthScoreDialog}
          campaign={{
            name: selectedCampaignForHealth.name,
            healthScore: selectedCampaignForHealth.healthScore,
            progress: selectedCampaignForHealth.progress,
            budget: selectedCampaignForHealth.budget,
            spent: selectedCampaignForHealth.spent,
            burnRate: selectedCampaignForHealth.burnRate,
            daysRemaining: 15, // Calculate from dates
            teamSize: selectedCampaignForHealth.team?.length || 0,
            status: selectedCampaignForHealth.status,
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {campaignToDelete && (
        <DeleteConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          itemName={campaignToDelete.name}
          itemType="campaign"
          onArchive={() => handleArchiveFromDialog(campaignToDelete)}
          onPermanentDelete={() => handlePermanentDelete(campaignToDelete)}
        />
      )}

      {/* Template Creator & Simulation Dialogs */}
      <Dialog open={showTemplateCreator} onOpenChange={setShowTemplateCreator}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input placeholder="Template Name" value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} />
            <Textarea placeholder="Description" value={newTemplateDescription} onChange={(e) => setNewTemplateDescription(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateCreator(false)}>Cancel</Button>
            <Button onClick={() => { toast.success('Template created!'); setShowTemplateCreator(false); }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSimulationDialog} onOpenChange={setShowSimulationDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Campaign Simulation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <Input type="number" placeholder="Budget" value={simulationBudget} onChange={(e) => setSimulationBudget(e.target.value)} />
              <Input type="number" placeholder="Team Size" value={simulationTeamSize} onChange={(e) => setSimulationTeamSize(e.target.value)} />
              <Input type="number" placeholder="Days" value={simulationDuration} onChange={(e) => setSimulationDuration(e.target.value)} />
            </div>
            <Button className="w-full" onClick={() => toast.success('Simulation complete!')}>Run Simulation</Button>
            {simulationBudget && (
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-lg font-bold">Projected Success: 92%</div>
                    <div className="text-sm text-gray-600">ROI: {Math.round(Number(simulationBudget) * 0.45)}%</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSimulationDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
