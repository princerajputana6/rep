/**
 * Industry-Standard Hidden Capacity Radar
 * Enterprise-grade capacity intelligence and optimization platform
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  Eye,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Clock,
  DollarSign,
  Target,
  AlertCircle,
  CheckCircle,
  Activity,
  BarChart3,
  PieChart,
  Zap,
  Filter,
  Download,
  RefreshCw,
  Plus,
  ArrowRight,
  Lightbulb,
  Award,
  Briefcase,
  MapPin,
  Search,
  Settings,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area,
} from 'recharts';
import { ProgressBar, CircularProgress } from '@/app/components/common/Progress';
import { StatsCard, StatsGrid } from '@/app/components/common/StatsCard';
import { toast } from 'sonner';

// ==================== TYPES ====================

interface Resource {
  id: string;
  name: string;
  role: string;
  department: string;
  location: string;
  skills: Skill[];
  currentUtilization: number;
  availableCapacity: number;
  hourlyRate: number;
  experienceYears: number;
  certifications: string[];
  avatar: string;
  availability: AvailabilitySlot[];
  performanceScore: number;
  revenueGenerated: number;
  projectsCompleted: number;
  utilizationTrend: 'up' | 'down' | 'stable';
  predictedAvailability: PredictedSlot[];
}

interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  lastUsed: string;
  demand: 'low' | 'medium' | 'high' | 'critical';
}

interface AvailabilitySlot {
  date: string;
  hoursAvailable: number;
  status: 'available' | 'partial' | 'booked';
}

interface PredictedSlot {
  weekStarting: string;
  predictedAvailableHours: number;
  confidence: number;
}

interface CapacityInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'optimization' | 'trend';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: {
    revenue?: number;
    hours?: number;
    projects?: number;
  };
  actionable: boolean;
  recommendations: string[];
  affectedResources: string[];
}

interface SkillGap {
  skill: string;
  currentSupply: number;
  projectedDemand: number;
  gap: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

// ==================== MOCK DATA ====================

const mockResources: Resource[] = [
  {
    id: 'res_1',
    name: 'Sarah Chen',
    role: 'Senior Developer',
    department: 'Engineering',
    location: 'New York, NY',
    skills: [
      { name: 'React', level: 'expert', yearsOfExperience: 5, lastUsed: '2026-02-10', demand: 'high' },
      { name: 'Node.js', level: 'advanced', yearsOfExperience: 4, lastUsed: '2026-02-08', demand: 'high' },
      { name: 'TypeScript', level: 'expert', yearsOfExperience: 5, lastUsed: '2026-02-10', demand: 'critical' },
      { name: 'GraphQL', level: 'advanced', yearsOfExperience: 3, lastUsed: '2026-01-20', demand: 'medium' },
    ],
    currentUtilization: 45,
    availableCapacity: 55,
    hourlyRate: 150,
    experienceYears: 8,
    certifications: ['AWS Certified', 'React Expert'],
    avatar: 'SC',
    availability: [
      { date: '2026-02-17', hoursAvailable: 20, status: 'available' },
      { date: '2026-02-24', hoursAvailable: 24, status: 'available' },
    ],
    performanceScore: 9.2,
    revenueGenerated: 180000,
    projectsCompleted: 12,
    utilizationTrend: 'down',
    predictedAvailability: [
      { weekStarting: '2026-02-17', predictedAvailableHours: 22, confidence: 0.85 },
      { weekStarting: '2026-02-24', predictedAvailableHours: 25, confidence: 0.82 },
    ],
  },
  {
    id: 'res_2',
    name: 'Mike Rodriguez',
    role: 'UI/UX Designer',
    department: 'Design',
    location: 'San Francisco, CA',
    skills: [
      { name: 'Figma', level: 'expert', yearsOfExperience: 6, lastUsed: '2026-02-12', demand: 'high' },
      { name: 'UI Design', level: 'expert', yearsOfExperience: 7, lastUsed: '2026-02-12', demand: 'high' },
      { name: 'Prototyping', level: 'advanced', yearsOfExperience: 5, lastUsed: '2026-02-10', demand: 'medium' },
      { name: 'User Research', level: 'advanced', yearsOfExperience: 4, lastUsed: '2026-01-28', demand: 'medium' },
    ],
    currentUtilization: 30,
    availableCapacity: 70,
    hourlyRate: 120,
    experienceYears: 7,
    certifications: ['Google UX Certificate'],
    avatar: 'MR',
    availability: [
      { date: '2026-02-17', hoursAvailable: 28, status: 'available' },
      { date: '2026-02-24', hoursAvailable: 30, status: 'available' },
    ],
    performanceScore: 8.8,
    revenueGenerated: 140000,
    projectsCompleted: 18,
    utilizationTrend: 'down',
    predictedAvailability: [
      { weekStarting: '2026-02-17', predictedAvailableHours: 28, confidence: 0.90 },
      { weekStarting: '2026-02-24', predictedAvailableHours: 32, confidence: 0.88 },
    ],
  },
  {
    id: 'res_3',
    name: 'Emily Zhang',
    role: 'Data Analyst',
    department: 'Analytics',
    location: 'Austin, TX',
    skills: [
      { name: 'Python', level: 'advanced', yearsOfExperience: 4, lastUsed: '2026-02-11', demand: 'critical' },
      { name: 'SQL', level: 'expert', yearsOfExperience: 5, lastUsed: '2026-02-13', demand: 'high' },
      { name: 'Tableau', level: 'advanced', yearsOfExperience: 3, lastUsed: '2026-02-09', demand: 'medium' },
      { name: 'Machine Learning', level: 'intermediate', yearsOfExperience: 2, lastUsed: '2026-01-15', demand: 'high' },
    ],
    currentUtilization: 60,
    availableCapacity: 40,
    hourlyRate: 130,
    experienceYears: 5,
    certifications: ['Google Data Analytics', 'Tableau Certified'],
    avatar: 'EZ',
    availability: [
      { date: '2026-02-17', hoursAvailable: 16, status: 'partial' },
      { date: '2026-02-24', hoursAvailable: 18, status: 'partial' },
    ],
    performanceScore: 9.0,
    revenueGenerated: 160000,
    projectsCompleted: 15,
    utilizationTrend: 'stable',
    predictedAvailability: [
      { weekStarting: '2026-02-17', predictedAvailableHours: 16, confidence: 0.78 },
      { weekStarting: '2026-02-24', predictedAvailableHours: 18, confidence: 0.80 },
    ],
  },
  {
    id: 'res_4',
    name: 'Alex Johnson',
    role: 'Project Manager',
    department: 'Operations',
    location: 'Seattle, WA',
    skills: [
      { name: 'Agile', level: 'expert', yearsOfExperience: 6, lastUsed: '2026-02-13', demand: 'high' },
      { name: 'Stakeholder Management', level: 'expert', yearsOfExperience: 7, lastUsed: '2026-02-13', demand: 'high' },
      { name: 'Risk Management', level: 'advanced', yearsOfExperience: 5, lastUsed: '2026-02-10', demand: 'medium' },
      { name: 'Budget Planning', level: 'advanced', yearsOfExperience: 5, lastUsed: '2026-02-08', demand: 'medium' },
    ],
    currentUtilization: 75,
    availableCapacity: 25,
    hourlyRate: 140,
    experienceYears: 10,
    certifications: ['PMP', 'Scrum Master'],
    avatar: 'AJ',
    availability: [
      { date: '2026-02-17', hoursAvailable: 10, status: 'partial' },
      { date: '2026-02-24', hoursAvailable: 12, status: 'partial' },
    ],
    performanceScore: 9.5,
    revenueGenerated: 200000,
    projectsCompleted: 25,
    utilizationTrend: 'up',
    predictedAvailability: [
      { weekStarting: '2026-02-17', predictedAvailableHours: 10, confidence: 0.92 },
      { weekStarting: '2026-02-24', predictedAvailableHours: 8, confidence: 0.88 },
    ],
  },
  {
    id: 'res_5',
    name: 'David Kim',
    role: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Boston, MA',
    skills: [
      { name: 'Kubernetes', level: 'expert', yearsOfExperience: 4, lastUsed: '2026-02-12', demand: 'critical' },
      { name: 'AWS', level: 'expert', yearsOfExperience: 5, lastUsed: '2026-02-13', demand: 'critical' },
      { name: 'Docker', level: 'expert', yearsOfExperience: 5, lastUsed: '2026-02-12', demand: 'high' },
      { name: 'CI/CD', level: 'advanced', yearsOfExperience: 4, lastUsed: '2026-02-11', demand: 'high' },
    ],
    currentUtilization: 85,
    availableCapacity: 15,
    hourlyRate: 160,
    experienceYears: 6,
    certifications: ['AWS Solutions Architect', 'CKA'],
    avatar: 'DK',
    availability: [
      { date: '2026-02-17', hoursAvailable: 6, status: 'partial' },
      { date: '2026-02-24', hoursAvailable: 8, status: 'partial' },
    ],
    performanceScore: 9.3,
    revenueGenerated: 190000,
    projectsCompleted: 20,
    utilizationTrend: 'up',
    predictedAvailability: [
      { weekStarting: '2026-02-17', predictedAvailableHours: 6, confidence: 0.95 },
      { weekStarting: '2026-02-24', predictedAvailableHours: 5, confidence: 0.93 },
    ],
  },
];

const mockInsights: CapacityInsight[] = [
  {
    id: 'insight_1',
    type: 'opportunity',
    priority: 'high',
    title: 'High-Value Resources Underutilized',
    description: '2 senior resources are operating at less than 50% capacity, representing significant revenue opportunity.',
    impact: {
      revenue: 85000,
      hours: 180,
      projects: 3,
    },
    actionable: true,
    recommendations: [
      'Allocate Sarah Chen to incoming React projects',
      'Assign Mike Rodriguez to UX redesign initiatives',
      'Create internal knowledge-sharing projects',
    ],
    affectedResources: ['res_1', 'res_2'],
  },
  {
    id: 'insight_2',
    type: 'risk',
    priority: 'critical',
    title: 'DevOps Capacity Constraint',
    description: 'David Kim is at 85% utilization with increasing demand for Kubernetes expertise.',
    impact: {
      hours: 40,
      projects: 2,
    },
    actionable: true,
    recommendations: [
      'Consider hiring additional DevOps engineer',
      'Cross-train engineering team on Kubernetes',
      'Prioritize critical infrastructure projects',
      'Explore partner agency borrowing',
    ],
    affectedResources: ['res_5'],
  },
  {
    id: 'insight_3',
    type: 'optimization',
    priority: 'medium',
    title: 'Skill Utilization Gap',
    description: 'GraphQL expertise in Sarah Chen has not been utilized in 3+ weeks despite market demand.',
    impact: {
      revenue: 15000,
      hours: 40,
    },
    actionable: true,
    recommendations: [
      'Market GraphQL capabilities to existing clients',
      'Propose GraphQL migration projects',
      'Update skill inventory visibility',
    ],
    affectedResources: ['res_1'],
  },
  {
    id: 'insight_4',
    type: 'trend',
    priority: 'medium',
    title: 'Declining Utilization Trend',
    description: 'Overall team utilization has decreased 12% over the past 4 weeks.',
    impact: {
      revenue: -120000,
      hours: 320,
    },
    actionable: true,
    recommendations: [
      'Increase business development efforts',
      'Review and optimize resource allocation',
      'Consider internal innovation projects',
      'Explore new market opportunities',
    ],
    affectedResources: ['res_1', 'res_2', 'res_3'],
  },
];

const mockSkillGaps: SkillGap[] = [
  {
    skill: 'TypeScript',
    currentSupply: 2,
    projectedDemand: 5,
    gap: 3,
    urgency: 'critical',
    recommendations: [
      'Upskill 3 JavaScript developers in TypeScript',
      'Hire 1-2 TypeScript specialists',
      'Partner with external TypeScript experts',
    ],
  },
  {
    skill: 'AWS',
    currentSupply: 1,
    projectedDemand: 3,
    gap: 2,
    urgency: 'high',
    recommendations: [
      'AWS certification program for 2 engineers',
      'Consider cloud consulting partnership',
      'Hire AWS-certified engineer',
    ],
  },
  {
    skill: 'Machine Learning',
    currentSupply: 1,
    projectedDemand: 2,
    gap: 1,
    urgency: 'medium',
    recommendations: [
      'ML training for data analysts',
      'Consider ML consulting for projects',
      'Hire ML specialist (6-month timeline)',
    ],
  },
];

// ==================== COMPONENT ====================

export function IndustryStandardHiddenCapacity() {
  const [selectedView, setSelectedView] = useState<'overview' | 'resources' | 'insights' | 'skills' | 'forecast'>('overview');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterUtilization, setFilterUtilization] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showScenarioDialog, setShowScenarioDialog] = useState(false);
  const [scenarioModel, setScenarioModel] = useState({ shiftCount: 5, fromDept: 'Design', toDept: 'Engineering' });

  // ==================== CALCULATIONS ====================

  const metrics = useMemo(() => {
    const totalResources = mockResources.length;
    const avgUtilization = mockResources.reduce((sum, r) => sum + r.currentUtilization, 0) / totalResources;
    const totalAvailableHours = mockResources.reduce((sum, r) => sum + r.availableCapacity, 0);
    const potentialRevenue = mockResources.reduce((sum, r) => sum + (r.availableCapacity * r.hourlyRate * 0.01), 0);
    const underutilized = mockResources.filter(r => r.currentUtilization < 60).length;
    const criticalInsights = mockInsights.filter(i => i.priority === 'critical').length;

    return {
      totalResources,
      avgUtilization,
      totalAvailableHours,
      potentialRevenue,
      underutilized,
      criticalInsights,
    };
  }, []);

  const filteredResources = useMemo(() => {
    return mockResources.filter(resource => {
      if (filterDepartment !== 'all' && resource.department !== filterDepartment) return false;
      if (filterUtilization === 'underutilized' && resource.currentUtilization >= 60) return false;
      if (filterUtilization === 'overutilized' && resource.currentUtilization < 80) return false;
      if (searchQuery && !resource.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !resource.role.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [filterDepartment, filterUtilization, searchQuery]);

  // Chart data
  const utilizationDistribution = [
    { range: '0-20%', count: mockResources.filter(r => r.currentUtilization < 20).length },
    { range: '20-40%', count: mockResources.filter(r => r.currentUtilization >= 20 && r.currentUtilization < 40).length },
    { range: '40-60%', count: mockResources.filter(r => r.currentUtilization >= 40 && r.currentUtilization < 60).length },
    { range: '60-80%', count: mockResources.filter(r => r.currentUtilization >= 60 && r.currentUtilization < 80).length },
    { range: '80-100%', count: mockResources.filter(r => r.currentUtilization >= 80).length },
  ];

  const departmentUtilization = [
    { department: 'Engineering', utilization: 62, available: 38 },
    { department: 'Design', utilization: 30, available: 70 },
    { department: 'Analytics', utilization: 60, available: 40 },
    { department: 'Operations', utilization: 75, available: 25 },
  ];

  const weeklyForecast = [
    { week: 'Week 1', available: 100, demand: 85, surplus: 15 },
    { week: 'Week 2', available: 105, demand: 95, surplus: 10 },
    { week: 'Week 3', available: 98, demand: 110, surplus: -12 },
    { week: 'Week 4', available: 102, demand: 88, surplus: 14 },
  ];

  const skillDemandData = [
    { skill: 'TypeScript', supply: 40, demand: 100 },
    { skill: 'React', supply: 80, demand: 90 },
    { skill: 'AWS', supply: 30, demand: 75 },
    { skill: 'Python', supply: 60, demand: 70 },
    { skill: 'Figma', supply: 70, demand: 60 },
  ];
  
  const radarData = [
    { subject: 'Skill Match', A: 120, B: 110, fullMark: 150 },
    { subject: 'Liquidity', A: 98, B: 130, fullMark: 150 },
    { subject: 'Cost Efficiency', A: 86, B: 130, fullMark: 150 },
    { subject: 'Time Horizon', A: 99, B: 100, fullMark: 150 },
    { subject: 'Role Depth', A: 85, B: 90, fullMark: 150 },
    { subject: 'Governance', A: 140, B: 140, fullMark: 150 },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization < 40) return 'text-red-600';
    if (utilization < 60) return 'text-orange-600';
    if (utilization < 80) return 'text-green-600';
    return 'text-blue-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Hidden Capacity Radar</h1>
              <p className="text-gray-600">
                AI-powered capacity intelligence and optimization platform
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowScenarioDialog(true)}>
            <Plus className="w-4 h-4 mr-2 text-purple-600" />
            New Scenario
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <StatsGrid columns={5}>
        <StatsCard
          title="Average Utilization"
          value={`${metrics.avgUtilization.toFixed(1)}%`}
          icon={Activity}
          color="blue"
          trend={{ value: -5, isPositive: false }}
        />
        <StatsCard
          title="Available Hours"
          value={metrics.totalAvailableHours.toFixed(0)}
          icon={Clock}
          color="green"
        />
        <StatsCard
          title="Potential Revenue"
          value={`$${(metrics.potentialRevenue / 1000).toFixed(0)}K`}
          icon={DollarSign}
          color="purple"
        />
        <StatsCard
          title="Underutilized"
          value={metrics.underutilized}
          icon={AlertCircle}
          color="orange"
        />
        <StatsCard
          title="Critical Insights"
          value={metrics.criticalInsights}
          icon={Zap}
          color="red"
        />
      </StatsGrid>

      {/* Main Content Tabs */}
      <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="resources">
            <Users className="w-4 h-4 mr-2" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Lightbulb className="w-4 h-4 mr-2" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="skills">
            <Award className="w-4 h-4 mr-2" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="forecast">
            <TrendingUp className="w-4 h-4 mr-2" />
            Forecast
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Capacity Radar Pro */}
            <Card className="col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    Strategic Capacity Radar Pro
                  </CardTitle>
                  <CardDescription>Multi-dimensional intelligence vs Benchmark</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Agency A</Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Benchmark</Badge>
                </div>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                    <Radar
                      name="Agency A"
                      dataKey="A"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Benchmark"
                      dataKey="B"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.4}
                    />
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Utilization Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Utilization Distribution</CardTitle>
                <CardDescription>Current capacity allocation across team</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={utilizationDistribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Department Utilization */}
            <Card>
              <CardHeader>
                <CardTitle>Department Utilization</CardTitle>
                <CardDescription>Capacity by department</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={departmentUtilization}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend iconType="circle" />
                    <Bar dataKey="utilization" fill="#3b82f6" name="Utilized" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="available" fill="#10b981" name="Available" radius={[4, 4, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

          {/* Top Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle>Top Opportunities</CardTitle>
              <CardDescription>Highest-impact actions to optimize capacity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockInsights.slice(0, 3).map(insight => (
                  <div key={insight.id} className={`p-4 rounded-lg border-2 ${getPriorityColor(insight.priority)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        <h4 className="font-semibold">{insight.title}</h4>
                      </div>
                      <Badge variant="secondary">{insight.type}</Badge>
                    </div>
                    <p className="text-sm mb-2">{insight.description}</p>
                    {insight.impact.revenue && (
                      <p className="text-sm font-semibold text-green-600">
                        Potential Revenue: ${insight.impact.revenue.toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6 mt-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search resources..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <Label>Department</Label>
                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Analytics">Analytics</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Utilization</Label>
                  <Select value={filterUtilization} onValueChange={setFilterUtilization}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="underutilized">Underutilized (&lt;60%)</SelectItem>
                      <SelectItem value="overutilized">Overutilized (&gt;80%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resource Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredResources.map(resource => (
              <Card
                key={resource.id}
                className="hover:shadow-lg transition-all cursor-pointer"
                onClick={() => {
                  setSelectedResource(resource);
                  setShowResourceDialog(true);
                }}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg flex-shrink-0">
                      {resource.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{resource.name}</h3>
                          <p className="text-sm text-gray-600">{resource.role}</p>
                        </div>
                        <Badge variant="secondary">{resource.department}</Badge>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Utilization</span>
                          <span className={`font-semibold ${getUtilizationColor(resource.currentUtilization)}`}>
                            {resource.currentUtilization}%
                          </span>
                        </div>
                        <ProgressBar
                          value={resource.currentUtilization}
                          max={100}
                          size="sm"
                          color={resource.currentUtilization < 60 ? 'red' : resource.currentUtilization < 80 ? 'orange' : 'green'}
                          showPercentage={false}
                          animated={false}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <p className="text-gray-600">Available</p>
                          <p className="font-semibold text-green-600">{resource.availableCapacity}h</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Rate</p>
                          <p className="font-semibold">${resource.hourlyRate}/h</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Score</p>
                          <p className="font-semibold text-blue-600">{resource.performanceScore}/10</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {resource.skills.slice(0, 3).map(skill => (
                          <Badge key={skill.name} variant="secondary" className="text-xs">
                            {skill.name}
                          </Badge>
                        ))}
                        {resource.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{resource.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4 mt-6">
          {mockInsights.map(insight => (
            <Card key={insight.id} className={`border-l-4 ${
              insight.priority === 'critical' ? 'border-l-red-500' :
              insight.priority === 'high' ? 'border-l-orange-500' :
              insight.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'
            }`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      insight.type === 'opportunity' ? 'bg-green-100' :
                      insight.type === 'risk' ? 'bg-red-100' :
                      insight.type === 'optimization' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      {insight.type === 'opportunity' && <Target className="w-5 h-5 text-green-600" />}
                      {insight.type === 'risk' && <AlertCircle className="w-5 h-5 text-red-600" />}
                      {insight.type === 'optimization' && <Zap className="w-5 h-5 text-blue-600" />}
                      {insight.type === 'trend' && <TrendingUp className="w-5 h-5 text-purple-600" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Badge className={getPriorityColor(insight.priority)}>
                      {insight.priority}
                    </Badge>
                    <Badge variant="secondary">{insight.type}</Badge>
                  </div>
                </div>

                {/* Impact Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                  {insight.impact.revenue && (
                    <div>
                      <p className="text-xs text-gray-600">Revenue Impact</p>
                      <p className="text-lg font-semibold text-green-600">
                        ${insight.impact.revenue.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {insight.impact.hours && (
                    <div>
                      <p className="text-xs text-gray-600">Hours Impact</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {insight.impact.hours}h
                      </p>
                    </div>
                  )}
                  {insight.impact.projects && (
                    <div>
                      <p className="text-xs text-gray-600">Projects Impact</p>
                      <p className="text-lg font-semibold text-purple-600">
                        {insight.impact.projects}
                      </p>
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                {insight.actionable && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Recommended Actions</h4>
                    <ul className="space-y-1">
                      {insight.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Button size="sm">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Take Action
                  </Button>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6 mt-6">
          {/* Skill Supply vs Demand */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Supply vs Demand</CardTitle>
              <CardDescription>Current availability vs projected needs</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={skillDemandData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="skill" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="supply" fill="#10b981" name="Current Supply" />
                  <Line type="monotone" dataKey="demand" stroke="#ef4444" strokeWidth={2} name="Projected Demand" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Skill Gaps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Critical Skill Gaps</h3>
            {mockSkillGaps.map((gap, idx) => (
              <Card key={idx} className="border-l-4 border-l-red-500">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{gap.skill}</h4>
                      <p className="text-sm text-gray-600">
                        Supply: {gap.currentSupply} resources | Demand: {gap.projectedDemand} needed
                      </p>
                    </div>
                    <Badge className={getPriorityColor(gap.urgency)}>
                      {gap.urgency}
                    </Badge>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Gap Size</span>
                      <span className="font-semibold text-red-600">{gap.gap} resources short</span>
                    </div>
                    <ProgressBar
                      value={gap.currentSupply}
                      max={gap.projectedDemand}
                      size="sm"
                      color="red"
                      showPercentage={false}
                    />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">Recommendations</h5>
                    <ul className="space-y-1">
                      {gap.recommendations.map((rec, ridx) => (
                        <li key={ridx} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Forecast Tab */}
        <TabsContent value="forecast" className="space-y-6 mt-6">
          {/* Weekly Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>4-Week Capacity Forecast</CardTitle>
              <CardDescription>Predicted availability vs projected demand</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={weeklyForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="available" fill="#10b981" name="Available Hours" />
                  <Line type="monotone" dataKey="demand" stroke="#3b82f6" strokeWidth={2} name="Projected Demand" />
                  <Line type="monotone" dataKey="surplus" stroke="#8b5cf6" strokeWidth={2} name="Surplus/Deficit" strokeDasharray="5 5" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Forecast Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Week 1 & 4</p>
                  <p className="text-2xl font-semibold text-green-600">Surplus</p>
                  <p className="text-sm text-gray-500">15-14 hours available</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Week 3</p>
                  <p className="text-2xl font-semibold text-red-600">Deficit</p>
                  <p className="text-sm text-gray-500">12 hours short</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Overall Trend</p>
                  <p className="text-2xl font-semibold text-blue-600">Stable</p>
                  <p className="text-sm text-gray-500">85% confidence</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Resource Detail Dialog */}
      <Dialog open={showResourceDialog} onOpenChange={setShowResourceDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resource Profile</DialogTitle>
          </DialogHeader>
          {selectedResource && (
            <div className="space-y-6 py-4">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-2xl">
                  {selectedResource.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{selectedResource.name}</h3>
                  <p className="text-gray-600">{selectedResource.role}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {selectedResource.department}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedResource.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {selectedResource.experienceYears} years
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <CircularProgress value={selectedResource.currentUtilization} size={80} color="blue" />
                  <p className="text-xs text-gray-600 mt-2">Utilization</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-semibold text-green-600">{selectedResource.availableCapacity}h</p>
                  <p className="text-xs text-gray-600">Available</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-semibold text-purple-600">${selectedResource.hourlyRate}</p>
                  <p className="text-xs text-gray-600">Hourly Rate</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-semibold text-blue-600">{selectedResource.performanceScore}/10</p>
                  <p className="text-xs text-gray-600">Performance</p>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Skills & Expertise</h4>
                <div className="space-y-2">
                  {selectedResource.skills.map(skill => (
                    <div key={skill.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">{skill.name}</span>
                        <Badge variant="secondary">{skill.level}</Badge>
                        <Badge variant="secondary" className={
                          skill.demand === 'critical' ? 'bg-red-100 text-red-800' :
                          skill.demand === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {skill.demand} demand
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-600">{skill.yearsOfExperience} years</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Certifications</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedResource.certifications.map(cert => (
                    <Badge key={cert} className="bg-blue-100 text-blue-800">
                      <Award className="w-3 h-3 mr-1" />
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Availability Forecast */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Predicted Availability</h4>
                <div className="space-y-2">
                  {selectedResource.predictedAvailability.map(slot => (
                    <div key={slot.weekStarting} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Week of {slot.weekStarting}</p>
                        <p className="text-sm text-gray-600">{slot.predictedAvailableHours} hours available</p>
                      </div>
                      <Badge variant="secondary">
                        {(slot.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Scenario Modeler Dialog - PRO FEATURE */}
      <Dialog open={showScenarioDialog} onOpenChange={setShowScenarioDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Scenario Modeler Pro
            </DialogTitle>
            <DialogDescription>
              Simulate the impact of shifting capacity between departments or programs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Shift Capacity (Resources)</Label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" min="1" max="20" step="1" 
                    value={scenarioModel.shiftCount} 
                    onChange={e => setScenarioModel(prev => ({ ...prev, shiftCount: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="font-bold w-8">{scenarioModel.shiftCount}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Department</Label>
                  <Select value={scenarioModel.fromDept} onValueChange={v => setScenarioModel(prev => ({ ...prev, fromDept: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Analytics">Analytics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>To Department</Label>
                  <Select value={scenarioModel.toDept} onValueChange={v => setScenarioModel(prev => ({ ...prev, toDept: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Prediction Results */}
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-800">Predicted Revenue Increase</span>
                    <span className="text-lg font-bold text-green-600">+${(scenarioModel.shiftCount * 12500).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-800">Portfolio Health Impact</span>
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-lg font-bold">+8.2%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-800">Utilization Balancing</span>
                    <span className="text-lg font-bold text-blue-600">Optimized</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScenarioDialog(false)}>Cancel</Button>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0" onClick={() => {
              toast.success("Scenario applied to active forecast view");
              setShowScenarioDialog(false);
            }}>
              Execute Simulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}