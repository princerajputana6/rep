import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
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
} from '@/app/components/ui/dialog';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Target,
  Zap,
  Brain,
  Activity,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  BarChart3,
  Clock,
  Shield,
  Sparkles,
  Eye,
  Bell,
  Filter,
  Download,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ScatterChart,
  Scatter,
  ReferenceLine,
  ZAxis,
} from 'recharts';
import { toast } from 'sonner';

// ─── NRR Cohort Data ──────────────────────────────────────────────────────────
interface CohortRow {
  cohort: string;  // e.g. "Q1 2025"
  startClients: number;
  m1: number; m2: number; m3: number; m4: number; m5: number; m6: number;
  nrr: number;   // Net Revenue Retention %
  arr: number;   // ARR at start ($k)
}
const COHORT_DATA: CohortRow[] = [
  { cohort: 'Q3 2024', startClients: 8, m1: 100, m2: 98, m3: 105, m4: 108, m5: 112, m6: 118, nrr: 118, arr: 420 },
  { cohort: 'Q4 2024', startClients: 10, m1: 100, m2: 97, m3: 94, m4: 101, m5: 106, m6: 109, nrr: 109, arr: 560 },
  { cohort: 'Q1 2025', startClients: 12, m1: 100, m2: 102, m3: 104, m4: 100, m5: 98, m6: 103, nrr: 103, arr: 680 },
  { cohort: 'Q2 2025', startClients: 9, m1: 100, m2: 96, m3: 92, m4: 88, m5: 91, m6: null as unknown as number, nrr: 91, arr: 480 },
  { cohort: 'Q3 2025', startClients: 14, m1: 100, m2: 103, m3: 108, m4: 111, m5: null as unknown as number, m6: null as unknown as number, nrr: 111, arr: 760 },
  { cohort: 'Q4 2025', startClients: 11, m1: 100, m2: 98, m3: 95, m4: null as unknown as number, m5: null as unknown as number, m6: null as unknown as number, nrr: 95, arr: 620 },
];

// ─── LTV Intelligence Data ────────────────────────────────────────────────────
interface LtvClient {
  name: string;
  ltv: number;      // Lifetime value ($k)
  cac: number;      // Customer acquisition cost ($k)
  ltvCacRatio: number;
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  avgRevPerMonth: number;
  churnRisk: number; // 0–100
}
const LTV_DATA: LtvClient[] = [
  { name: 'TechCorp', ltv: 1800, cac: 42, ltvCacRatio: 42.9, tier: 'Platinum', avgRevPerMonth: 37500, churnRisk: 8 },
  { name: 'Digital Wave', ltv: 840, cac: 38, ltvCacRatio: 22.1, tier: 'Gold', avgRevPerMonth: 23333, churnRisk: 22 },
  { name: 'StartupXYZ', ltv: 420, cac: 35, ltvCacRatio: 12.0, tier: 'Silver', avgRevPerMonth: 14000, churnRisk: 41 },
  { name: 'MegaRetail', ltv: 2400, cac: 55, ltvCacRatio: 43.6, tier: 'Platinum', avgRevPerMonth: 60000, churnRisk: 12 },
  { name: 'Creative Hub', ltv: 310, cac: 28, ltvCacRatio: 11.1, tier: 'Bronze', avgRevPerMonth: 8611, churnRisk: 55 },
  { name: 'FintechPro', ltv: 980, cac: 45, ltvCacRatio: 21.8, tier: 'Gold', avgRevPerMonth: 27222, churnRisk: 19 },
];

// ─── Retention Risk Scatter Data ──────────────────────────────────────────────
interface RetentionPoint {
  name: string;
  healthScore: number;  // x-axis
  revenue: number;      // y-axis ($k)
  churnRisk: number;    // z (bubble size proxy)
  status: 'healthy' | 'watch' | 'at-risk';
}
const RETENTION_SCATTER: RetentionPoint[] = [
  { name: 'TechCorp', healthScore: 92, revenue: 450, churnRisk: 8, status: 'healthy' },
  { name: 'Digital Wave', healthScore: 78, revenue: 280, churnRisk: 22, status: 'watch' },
  { name: 'StartupXYZ', healthScore: 65, revenue: 168, churnRisk: 41, status: 'watch' },
  { name: 'MegaRetail', healthScore: 88, revenue: 720, churnRisk: 12, status: 'healthy' },
  { name: 'Creative Hub', healthScore: 51, revenue: 103, churnRisk: 55, status: 'at-risk' },
  { name: 'FintechPro', healthScore: 74, revenue: 327, churnRisk: 19, status: 'watch' },
  { name: 'Acme Global', healthScore: 42, revenue: 215, churnRisk: 68, status: 'at-risk' },
  { name: 'BlueSky Inc', healthScore: 83, revenue: 390, churnRisk: 14, status: 'healthy' },
];

// ARR Waterfall data
const ARR_WATERFALL = [
  { label: 'Start ARR', value: 2800, fill: '#3b82f6', isTotal: true },
  { label: 'Expansion', value: 480, fill: '#22c55e', isTotal: false },
  { label: 'New Logos', value: 320, fill: '#22c55e', isTotal: false },
  { label: 'Churn', value: -210, fill: '#ef4444', isTotal: false },
  { label: 'Contraction', value: -90, fill: '#f97316', isTotal: false },
  { label: 'End ARR', value: 3300, fill: '#3b82f6', isTotal: true },
];

function cohortColor(val: number | null): string {
  if (val === null || val === undefined) return 'bg-gray-100 text-gray-300';
  if (val >= 110) return 'bg-green-600 text-white';
  if (val >= 100) return 'bg-green-400 text-white';
  if (val >= 90) return 'bg-amber-400 text-white';
  if (val >= 80) return 'bg-orange-400 text-white';
  return 'bg-red-500 text-white';
}

function tierBadge(tier: LtvClient['tier']) {
  const map: Record<string, string> = {
    Platinum: 'bg-purple-100 text-purple-700',
    Gold: 'bg-amber-100 text-amber-700',
    Silver: 'bg-gray-100 text-gray-700',
    Bronze: 'bg-orange-100 text-orange-700',
  };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[tier]}`}>{tier}</span>;
}

interface Client {
  id: string;
  name: string;
  healthScore: number;
  trend: 'up' | 'down' | 'stable';
  trendChange: number;
  status: 'healthy' | 'watch' | 'at-risk';
  revenue: number;
  margin: number;
  marginTrend: number;
  leakage: number;
  lastUpdated: string;
  
  // Detailed scores
  profitabilityScore: number;
  scopeStabilityScore: number;
  paymentBehaviorScore: number;
  resourceStabilityScore: number;
  growthMomentumScore: number;
  
  // Financial data
  grossMargin: number;
  netMargin: number;
  revenueGrowth: number;
  dso: number; // Days Sales Outstanding
  
  // Risk indicators
  marginErosion: boolean;
  scopeCreep: boolean;
  paymentRisk: boolean;
  
  // Upsell opportunity
  upsellScore: number;
  upsellPotential: number;
}

interface MarginAlert {
  id: string;
  clientId: string;
  clientName: string;
  type: 'early-warning' | 'critical' | 'structural';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: number;
  recommendation: string;
  createdAt: string;
}

interface LeakageItem {
  id: string;
  clientId: string;
  clientName: string;
  type: 'unbilled-hours' | 'rate-discount' | 'retainer-unused' | 'scope-overrun';
  amount: number;
  hours: number;
  description: string;
  recoverable: boolean;
}

interface UpsellOpportunity {
  id: string;
  clientId: string;
  clientName: string;
  score: number;
  suggestedIncrease: number;
  reasoning: string[];
  estimatedRevenue: number;
  confidence: number;
  recommendations: string[];
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'TechCorp Industries',
    healthScore: 92,
    trend: 'up',
    trendChange: 5,
    status: 'healthy',
    revenue: 450000,
    margin: 38.5,
    marginTrend: 2.3,
    leakage: 12000,
    lastUpdated: '2 hours ago',
    profitabilityScore: 95,
    scopeStabilityScore: 88,
    paymentBehaviorScore: 100,
    resourceStabilityScore: 92,
    growthMomentumScore: 85,
    grossMargin: 38.5,
    netMargin: 28.2,
    revenueGrowth: 22.5,
    dso: 28,
    marginErosion: false,
    scopeCreep: false,
    paymentRisk: false,
    upsellScore: 82,
    upsellPotential: 75000,
  },
  {
    id: '2',
    name: 'Digital Wave Solutions',
    healthScore: 78,
    trend: 'stable',
    trendChange: 0,
    status: 'watch',
    revenue: 280000,
    margin: 28.5,
    marginTrend: -1.5,
    leakage: 18500,
    lastUpdated: '3 hours ago',
    profitabilityScore: 80,
    scopeStabilityScore: 75,
    paymentBehaviorScore: 80,
    resourceStabilityScore: 78,
    growthMomentumScore: 75,
    grossMargin: 28.5,
    netMargin: 18.8,
    revenueGrowth: 12.3,
    dso: 42,
    marginErosion: true,
    scopeCreep: true,
    paymentRisk: false,
    upsellScore: 65,
    upsellPotential: 35000,
  },
  {
    id: '3',
    name: 'GlobalRetail Partners',
    healthScore: 45,
    trend: 'down',
    trendChange: -12,
    status: 'at-risk',
    revenue: 195000,
    margin: 12.5,
    marginTrend: -8.2,
    leakage: 32000,
    lastUpdated: '1 hour ago',
    profitabilityScore: 40,
    scopeStabilityScore: 45,
    paymentBehaviorScore: 40,
    resourceStabilityScore: 50,
    growthMomentumScore: 35,
    grossMargin: 12.5,
    netMargin: 5.2,
    revenueGrowth: -5.5,
    dso: 68,
    marginErosion: true,
    scopeCreep: true,
    paymentRisk: true,
    upsellScore: 25,
    upsellPotential: 0,
  },
  {
    id: '4',
    name: 'Innovation Labs',
    healthScore: 88,
    trend: 'up',
    trendChange: 3,
    status: 'healthy',
    revenue: 325000,
    margin: 35.2,
    marginTrend: 1.8,
    leakage: 8500,
    lastUpdated: '4 hours ago',
    profitabilityScore: 90,
    scopeStabilityScore: 85,
    paymentBehaviorScore: 90,
    resourceStabilityScore: 88,
    growthMomentumScore: 87,
    grossMargin: 35.2,
    netMargin: 25.5,
    revenueGrowth: 18.2,
    dso: 32,
    marginErosion: false,
    scopeCreep: false,
    paymentRisk: false,
    upsellScore: 78,
    upsellPotential: 55000,
  },
];

const mockAlerts: MarginAlert[] = [
  {
    id: '1',
    clientId: '3',
    clientName: 'GlobalRetail Partners',
    type: 'critical',
    severity: 'critical',
    title: 'Critical Margin Erosion',
    description: 'Gross margin dropped from 22% to 12.5% in 30 days',
    impact: 32000,
    recommendation: 'Immediate repricing or scope reduction required. Consider contract renegotiation.',
    createdAt: '2 hours ago',
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Digital Wave Solutions',
    type: 'early-warning',
    severity: 'medium',
    title: 'Scope Creep Detected',
    description: 'Unapproved scope increase of 15% over last 2 weeks',
    impact: 18500,
    recommendation: 'Formalize change request process and update statement of work.',
    createdAt: '5 hours ago',
  },
  {
    id: '3',
    clientId: '3',
    clientName: 'GlobalRetail Partners',
    type: 'structural',
    severity: 'high',
    title: 'Structural Pricing Issue',
    description: 'Rate card 22% below market benchmark for this client type',
    impact: 45000,
    recommendation: 'Rate increase of 20-25% recommended at next renewal.',
    createdAt: '1 day ago',
  },
];

const mockLeakage: LeakageItem[] = [
  {
    id: '1',
    clientId: '3',
    clientName: 'GlobalRetail Partners',
    type: 'unbilled-hours',
    amount: 18000,
    hours: 120,
    description: '120 hours allocated but not invoiced in last 30 days',
    recoverable: true,
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Digital Wave Solutions',
    type: 'scope-overrun',
    amount: 12500,
    hours: 85,
    description: 'Work performed outside retainer agreement',
    recoverable: true,
  },
  {
    id: '3',
    clientId: '1',
    clientName: 'TechCorp Industries',
    type: 'rate-discount',
    amount: 8000,
    hours: 0,
    description: 'Discount creep vs rate card (avg 12% below standard)',
    recoverable: false,
  },
  {
    id: '4',
    clientId: '3',
    clientName: 'GlobalRetail Partners',
    type: 'retainer-unused',
    amount: 14000,
    hours: 0,
    description: 'Unused retainer capacity - $14K prepaid not utilized',
    recoverable: false,
  },
];

const mockUpsells: UpsellOpportunity[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'TechCorp Industries',
    score: 82,
    suggestedIncrease: 15,
    reasoning: [
      'Capacity at 92% utilization',
      'Revenue growth 22.5% YoY',
      'High-demand skills (AI/ML) heavily used',
      'Client health score excellent (92)',
    ],
    estimatedRevenue: 75000,
    confidence: 88,
    recommendations: [
      'Increase monthly retainer by $6,250 (15%)',
      'Add AI strategy consulting service',
      'Expand team by 2 senior resources',
    ],
  },
  {
    id: '2',
    clientId: '4',
    clientName: 'Innovation Labs',
    score: 78,
    suggestedIncrease: 12,
    reasoning: [
      'Consistent growth trajectory',
      'High satisfaction scores',
      'Expanding project scope naturally',
      'Under-utilizing available capacity',
    ],
    estimatedRevenue: 55000,
    confidence: 82,
    recommendations: [
      'Increase retainer by $3,900 (12%)',
      'Propose additional service line',
      'Cross-sell design services',
    ],
  },
];

const healthTrendData = [
  { month: 'Aug', avg: 78 },
  { month: 'Sep', avg: 80 },
  { month: 'Oct', avg: 79 },
  { month: 'Nov', avg: 82 },
  { month: 'Dec', avg: 81 },
  { month: 'Jan', avg: 84 },
  { month: 'Feb', avg: 83 },
];

const marginDistributionData = [
  { range: '< 15%', count: 3, color: '#ef4444' },
  { range: '15-25%', count: 5, color: '#f59e0b' },
  { range: '25-35%', count: 12, color: '#3b82f6' },
  { range: '> 35%', count: 8, color: '#10b981' },
];

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

export function ClientProfitability() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('health-score');

  const filteredClients = mockClients
    .filter(client => filterStatus === 'all' || client.status === filterStatus)
    .sort((a, b) => {
      switch (sortBy) {
        case 'health-score':
          return b.healthScore - a.healthScore;
        case 'margin':
          return b.margin - a.margin;
        case 'revenue':
          return b.revenue - a.revenue;
        case 'leakage':
          return b.leakage - a.leakage;
        default:
          return 0;
      }
    });

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getHealthBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500">Healthy</Badge>;
      case 'watch':
        return <Badge className="bg-amber-500">Watch</Badge>;
      case 'at-risk':
        return <Badge className="bg-red-500">At Risk</Badge>;
      default:
        return null;
    }
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs">+{change}</span>
        </div>
      );
    }
    if (trend === 'down') {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <TrendingDown className="w-4 h-4" />
          <span className="text-xs">-{Math.abs(change)}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-gray-500">
        <Activity className="w-4 h-4" />
        <span className="text-xs">0</span>
      </div>
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-amber-500';
      default:
        return 'bg-blue-500';
    }
  };

  const totalRevenue = mockClients.reduce((sum, c) => sum + c.revenue, 0);
  const avgMargin = mockClients.reduce((sum, c) => sum + c.margin, 0) / mockClients.length;
  const totalLeakage = mockLeakage.reduce((sum, l) => sum + l.amount, 0);
  const recoverableLeakage = mockLeakage
    .filter(l => l.recoverable)
    .reduce((sum, l) => sum + l.amount, 0);
  const upsellPotential = mockUpsells.reduce((sum, u) => sum + u.estimatedRevenue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-600" />
            Client Profitability & Revenue Intelligence
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered client health monitoring, margin protection, and growth opportunities
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
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${(totalRevenue / 1000).toFixed(0)}K
                </p>
                <div className="flex items-center gap-1 text-sm mt-2 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12.5%</span>
                </div>
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
                <p className="text-sm text-gray-600">Avg Margin</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {avgMargin.toFixed(1)}%
                </p>
                <div className="flex items-center gap-1 text-sm mt-2 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>+2.1%</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue Leakage</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  ${(totalLeakage / 1000).toFixed(0)}K
                </p>
                <div className="flex items-center gap-1 text-sm mt-2 text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>${(recoverableLeakage / 1000).toFixed(0)}K recoverable</span>
                </div>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upsell Potential</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  ${(upsellPotential / 1000).toFixed(0)}K
                </p>
                <div className="flex items-center gap-1 text-sm mt-2 text-purple-600">
                  <Sparkles className="w-4 h-4" />
                  <span>AI-identified</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <ArrowUpRight className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {mockAlerts.length}
                </p>
                <div className="flex items-center gap-1 text-sm mt-2 text-orange-600">
                  <Bell className="w-4 h-4" />
                  <span>Needs attention</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard">Client Dashboard</TabsTrigger>
          <TabsTrigger value="alerts">
            Margin Alerts
            {mockAlerts.length > 0 && (
              <Badge className="ml-2 bg-red-500">{mockAlerts.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="leakage">
            Revenue Leakage
            <Badge className="ml-2 bg-amber-500">${(totalLeakage / 1000).toFixed(0)}K</Badge>
          </TabsTrigger>
          <TabsTrigger value="upsell">
            Upsell Opportunities
            <Badge className="ml-2 bg-purple-500">{mockUpsells.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="nrr-cohort">NRR Cohort</TabsTrigger>
          <TabsTrigger value="ltv">LTV Intelligence</TabsTrigger>
          <TabsTrigger value="retention-risk">Retention Risk</TabsTrigger>
          <TabsTrigger value="methodology">
            <Brain className="w-4 h-4 mr-2" />
            How It Works
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                <SelectItem value="healthy">Healthy Only</SelectItem>
                <SelectItem value="watch">Watch List</SelectItem>
                <SelectItem value="at-risk">At Risk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="health-score">Health Score</SelectItem>
                <SelectItem value="margin">Margin</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="leakage">Leakage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Client Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <Card
                key={client.id}
                className={`cursor-pointer hover:shadow-lg transition-shadow border-2 ${getHealthBg(
                  client.healthScore
                )}`}
                onClick={() => setSelectedClient(client)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Updated {client.lastUpdated}
                      </CardDescription>
                    </div>
                    {getStatusBadge(client.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Health Score */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Health Score
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${getHealthColor(client.healthScore)}`}>
                          {client.healthScore}
                        </span>
                        {getTrendIcon(client.trend, client.trendChange)}
                      </div>
                    </div>
                    <Progress value={client.healthScore} className="h-2" />
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                    <div>
                      <div className="text-xs text-gray-600">Revenue</div>
                      <div className="text-sm font-semibold text-gray-900">
                        ${(client.revenue / 1000).toFixed(0)}K
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Margin</div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {client.margin.toFixed(1)}%
                        </span>
                        {client.marginTrend > 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-600" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-600" />
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Leakage</div>
                      <div className="text-sm font-semibold text-red-600">
                        ${(client.leakage / 1000).toFixed(1)}K
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Upsell Score</div>
                      <div className="text-sm font-semibold text-purple-600">
                        {client.upsellScore}
                      </div>
                    </div>
                  </div>

                  {/* Risk Indicators */}
                  {(client.marginErosion || client.scopeCreep || client.paymentRisk) && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t">
                      {client.marginErosion && (
                        <Badge variant="destructive" className="text-xs gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Margin Erosion
                        </Badge>
                      )}
                      {client.scopeCreep && (
                        <Badge variant="destructive" className="text-xs gap-1">
                          <Eye className="w-3 h-3" />
                          Scope Creep
                        </Badge>
                      )}
                      {client.paymentRisk && (
                        <Badge variant="destructive" className="text-xs gap-1">
                          <Clock className="w-3 h-3" />
                          Payment Risk
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Margin Erosion Alerts
              </CardTitle>
              <CardDescription>
                Real-time alerts for margin degradation and profitability risks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockAlerts.map((alert) => (
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

                  <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <div className="flex items-start gap-2">
                      <Brain className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-blue-900 mb-1">
                          AI Recommendation
                        </div>
                        <div className="text-xs text-blue-800">{alert.recommendation}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="flex-1">
                      Take Action
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leakage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Leakage Summary */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Leakage Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-sm text-red-700 font-medium mb-1">
                    Total Leakage
                  </div>
                  <div className="text-3xl font-bold text-red-900">
                    ${(totalLeakage / 1000).toFixed(0)}K
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm text-green-700 font-medium mb-1">
                    Recoverable
                  </div>
                  <div className="text-3xl font-bold text-green-900">
                    ${(recoverableLeakage / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-green-700 mt-2">
                    {((recoverableLeakage / totalLeakage) * 100).toFixed(0)}% of total
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Unbilled Hours</span>
                    <span className="font-semibold">$18K</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Scope Overruns</span>
                    <span className="font-semibold">$12.5K</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Rate Discounts</span>
                    <span className="font-semibold">$8K</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Unused Retainer</span>
                    <span className="font-semibold">$14K</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leakage Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-amber-600" />
                  Revenue Leakage Radar
                </CardTitle>
                <CardDescription>Detected revenue loss opportunities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockLeakage.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {item.clientName}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.type.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">
                          ${(item.amount / 1000).toFixed(1)}K
                        </div>
                        {item.recoverable && (
                          <Badge className="bg-green-500 text-xs mt-1">
                            Recoverable
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{item.description}</p>

                    {item.hours > 0 && (
                      <div className="text-xs text-gray-600 mb-3">
                        {item.hours} hours • ${(item.amount / item.hours).toFixed(0)}/hr
                      </div>
                    )}

                    {item.recoverable && (
                      <Button size="sm" className="w-full gap-2">
                        <DollarSign className="w-4 h-4" />
                        Initiate Recovery
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="upsell" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI-Powered Upsell Opportunities
              </CardTitle>
              <CardDescription>
                Machine learning identifies revenue expansion opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockUpsells.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="p-5 border-2 border-purple-200 rounded-lg bg-purple-50 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900">
                        {opportunity.clientName}
                      </h4>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge className="bg-purple-600">
                          Score: {opportunity.score}
                        </Badge>
                        <Badge variant="outline">
                          {opportunity.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Potential Revenue</div>
                      <div className="text-2xl font-bold text-purple-900">
                        ${(opportunity.estimatedRevenue / 1000).toFixed(0)}K
                      </div>
                      <div className="text-sm text-purple-700">
                        +{opportunity.suggestedIncrease}% increase
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-900 mb-2">
                      AI Analysis:
                    </div>
                    <ul className="space-y-1">
                      {opportunity.reasoning.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-purple-200 mb-4">
                    <div className="text-sm font-semibold text-gray-900 mb-2">
                      Recommendations:
                    </div>
                    <ul className="space-y-2">
                      {opportunity.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <ArrowUpRight className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 gap-2">
                      <Target className="w-4 h-4" />
                      Create Proposal
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2">
                      <Info className="w-4 h-4" />
                      View Full Analysis
                    </Button>
                  </div>
                </div>
              ))}

              {mockUpsells.length === 0 && (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Opportunities Detected
                  </h3>
                  <p className="text-gray-600">
                    AI is analyzing client data. Check back soon for recommendations.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Health Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Client Health Trend</CardTitle>
                <CardDescription>Average health score over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={healthTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="avg"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Margin Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Margin Distribution</CardTitle>
                <CardDescription>Client count by margin range</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={marginDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6">
                      {marginDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="methodology" className="space-y-6">
          {/* How It Works Header */}
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Brain className="w-6 h-6 text-purple-600" />
                AI-Powered Methodology & Customer Benefits
              </CardTitle>
              <CardDescription className="text-base">
                Understand how CPRI uses machine learning and financial analytics to drive profitability
              </CardDescription>
            </CardHeader>
          </Card>

          {/* 1. Client Health Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                1. Client Health Score (0-100)
              </CardTitle>
              <CardDescription>Composite AI score updated weekly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="font-mono text-sm text-blue-900 mb-3">
                  <div className="font-bold mb-2">Master Formula:</div>
                  <div className="bg-white p-3 rounded text-xs">
                    Client Health Score = <br />
                    &nbsp;&nbsp;(Profitability Score × 0.35) + <br />
                    &nbsp;&nbsp;(Scope Stability Score × 0.20) + <br />
                    &nbsp;&nbsp;(Payment Behavior Score × 0.15) + <br />
                    &nbsp;&nbsp;(Resource Stability Score × 0.15) + <br />
                    &nbsp;&nbsp;(Growth Momentum Score × 0.15)
                  </div>
                </div>
              </div>

              {/* Sub-components */}
              <div className="space-y-4">
                {/* A. Profitability Score */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    A. Profitability Score (35% weight)
                  </h4>
                  <div className="text-sm space-y-2">
                    <div className="font-mono text-xs bg-gray-50 p-2 rounded">
                      • Gross Margin ≥ 35% → Score: 100<br />
                      • 25-34% → Score: 80<br />
                      • 15-24% → Score: 60<br />
                      • 5-14% → Score: 40<br />
                      • &lt;5% → Score: 20<br />
                      • Negative → Score: 0
                    </div>
                    <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                      <div className="font-semibold text-green-900 text-sm mb-1">✓ Customer Benefit:</div>
                      <div className="text-green-800 text-xs">
                        Instantly identifies profitable vs. unprofitable clients. Typical result: 5-15% margin improvement
                        by reallocating focus to high-margin accounts and repricing low-margin ones.
                      </div>
                    </div>
                  </div>
                </div>

                {/* B. Scope Stability Score */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    B. Scope Stability Score (20% weight)
                  </h4>
                  <div className="text-sm space-y-2">
                    <div className="font-mono text-xs bg-gray-50 p-2 rounded">
                      Scope Volatility = (Change Requests + Budget Variance %) normalized<br />
                      Score = 100 - Scope Volatility<br />
                      • If budget variance &gt; 20% → cap at 50
                    </div>
                    <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                      <div className="font-semibold text-blue-900 text-sm mb-1">✓ Customer Benefit:</div>
                      <div className="text-blue-800 text-xs">
                        Detects scope creep before it erodes margins. Agencies using this see 30% reduction in
                        uncompensated work by formalizing change requests early.
                      </div>
                    </div>
                  </div>
                </div>

                {/* C. Payment Behavior Score */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    C. Payment Behavior Score (15% weight)
                  </h4>
                  <div className="text-sm space-y-2">
                    <div className="font-mono text-xs bg-gray-50 p-2 rounded">
                      DSO (Days Sales Outstanding):<br />
                      • &lt; 30 days → Score: 100<br />
                      • 30-45 → Score: 80<br />
                      • 45-60 → Score: 60<br />
                      • 60-90 → Score: 40<br />
                      • &gt; 90 → Score: 10
                    </div>
                    <div className="p-3 bg-amber-50 rounded border-l-4 border-amber-500">
                      <div className="font-semibold text-amber-900 text-sm mb-1">✓ Customer Benefit:</div>
                      <div className="text-amber-800 text-xs">
                        Predicts cash flow risks. Agencies improve collections by 25% by proactively managing
                        slow-paying clients before they become write-offs.
                      </div>
                    </div>
                  </div>
                </div>

                {/* D. Resource Stability Score */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    D. Resource Stability Score (15% weight)
                  </h4>
                  <div className="text-sm space-y-2">
                    <div className="font-mono text-xs bg-gray-50 p-2 rounded">
                      Turnover Rate = (# resource swaps / total resources)<br />
                      Score = 100 - (Turnover Rate × 100)
                    </div>
                    <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                      <div className="font-semibold text-purple-900 text-sm mb-1">✓ Customer Benefit:</div>
                      <div className="text-purple-800 text-xs">
                        High turnover signals client dissatisfaction or team mismatch. Addressing this early
                        improves client retention by 20% and reduces onboarding costs.
                      </div>
                    </div>
                  </div>
                </div>

                {/* E. Growth Momentum Score */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    E. Growth Momentum Score (15% weight)
                  </h4>
                  <div className="text-sm space-y-2">
                    <div className="font-mono text-xs bg-gray-50 p-2 rounded">
                      Revenue Growth Rate (YoY):<br />
                      • &gt; 20% → Score: 100<br />
                      • 10-20% → Score: 80<br />
                      • 0-10% → Score: 60<br />
                      • Decline &lt; 10% → Score: 40<br />
                      • Decline &gt; 10% → Score: 20
                    </div>
                    <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                      <div className="font-semibold text-green-900 text-sm mb-1">✓ Customer Benefit:</div>
                      <div className="text-green-800 text-xs">
                        Identifies growth opportunities and at-risk accounts. Agencies using this prioritize
                        upselling to growing clients and exit declining ones, improving portfolio ROI by 18%.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Revenue Leakage Detection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-600" />
                2. Revenue Leakage Formula
              </CardTitle>
              <CardDescription>Detects unbilled and underutilized revenue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                <div className="font-mono text-sm text-amber-900">
                  <div className="font-bold mb-2">Formula:</div>
                  <div className="bg-white p-3 rounded text-xs">
                    Total Leakage = <br />
                    &nbsp;&nbsp;(Unbilled Hours × Bill Rate) + <br />
                    &nbsp;&nbsp;(Underbilled Rate Difference × Hours) + <br />
                    &nbsp;&nbsp;(Unused Retainer Value)
                  </div>
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                <div className="font-semibold text-green-900 text-sm mb-1">✓ Customer Benefit:</div>
                <div className="text-green-800 text-xs">
                  <strong>Average recovery: $30K per quarter</strong><br />
                  • 60% of leakage is recoverable through billing corrections<br />
                  • 25% reduction in "goodwill" discounts<br />
                  • ROI: 8-12x within 6 months
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Margin Erosion Detection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                3. Margin Erosion Detection
              </CardTitle>
              <CardDescription>Real-time alerts for profitability degradation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <div className="font-mono text-sm text-red-900">
                  <div className="font-bold mb-2">Trigger Conditions:</div>
                  <div className="bg-white p-3 rounded text-xs space-y-2">
                    <div>
                      <strong>Early Warning:</strong><br />
                      (Current Margin - 30-Day Avg Margin) &lt; -5%
                    </div>
                    <div className="border-t pt-2"><strong>OR</strong></div>
                    <div className="pt-2">
                      <strong>Threshold Breach:</strong><br />
                      Gross Margin &lt; Configured Minimum
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                <div className="font-semibold text-green-900 text-sm mb-1">✓ Customer Benefit:</div>
                <div className="text-green-800 text-xs">
                  <strong>30-day advance warning</strong> prevents margin erosion from becoming unrecoverable.<br />
                  • Agencies save average $45K per alert by intervening early<br />
                  • 90% of erosion is preventable with 2-week lead time
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. AI Upsell Scoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                4. AI Upsell Opportunity Score
              </CardTitle>
              <CardDescription>Machine learning identifies growth potential</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <div className="font-mono text-sm text-purple-900">
                  <div className="font-bold mb-2">ML Model Formula:</div>
                  <div className="bg-white p-3 rounded text-xs">
                    Upsell Score = <br />
                    &nbsp;&nbsp;(Utilization Pressure × 0.30) + <br />
                    &nbsp;&nbsp;(Revenue Growth Trend × 0.25) + <br />
                    &nbsp;&nbsp;(High-Demand Skills × 0.20) + <br />
                    &nbsp;&nbsp;(Client Health Score × 0.15) + <br />
                    &nbsp;&nbsp;(Industry Growth × 0.10)<br />
                    <br />
                    If Score &gt; 75 → <strong>High Opportunity</strong>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                <div className="font-semibold text-green-900 text-sm mb-1">✓ Customer Benefit:</div>
                <div className="text-green-800 text-xs">
                  <strong>15-20% upsell conversion rate</strong> (vs 5% industry average)<br />
                  • AI identifies perfect timing for rate increases<br />
                  • Average upsell: $55K per opportunity<br />
                  • 3x higher acceptance than manual selection
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Business Impact */}
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                Overall Business Impact & ROI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Financial Impact (6 months):</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Margin Improvement:</span>
                      <span className="font-bold text-green-600">5-15%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Revenue Leakage Recovery:</span>
                      <span className="font-bold text-green-600">$30K/quarter</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Upsell Revenue:</span>
                      <span className="font-bold text-green-600">$130K/year</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span className="font-semibold text-gray-900">Annual Impact:</span>
                      <span className="font-bold text-green-600 text-lg">$250-400K</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Operational Benefits:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>20% faster</strong> decision-making</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>90% accuracy</strong> identifying at-risk clients</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>25% reduction</strong> in client churn</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>CFO-grade</strong> intelligence</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white rounded-lg border-2 border-green-300">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-900">Typical ROI: 8-12x in first year</div>
                    <div className="text-sm text-gray-600">
                      For a $10M agency, CPRI typically delivers $250-400K in margin improvement and revenue 
                      recovery, while requiring minimal setup time and zero ongoing maintenance.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── NRR Cohort ── */}
        <TabsContent value="nrr-cohort" className="space-y-6 mt-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Best NRR Cohort', value: '118%', sub: 'Q3 2024', color: 'text-green-600' },
              { label: 'Portfolio Avg NRR', value: '108%', sub: 'Across all cohorts', color: 'text-blue-600' },
              { label: 'Cohorts Below 100%', value: '2', sub: 'Contraction detected', color: 'text-orange-600' },
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

          {/* Cohort heatmap */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Revenue Retention Heatmap</CardTitle>
              <CardDescription>Monthly retention index per acquisition cohort (100 = start ARR). Green = expansion, red = contraction.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="text-left py-2 pr-4 font-medium text-gray-600 w-24">Cohort</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-600">Clients</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-600">ARR ($k)</th>
                    {['M1', 'M2', 'M3', 'M4', 'M5', 'M6'].map(m => (
                      <th key={m} className="text-center py-2 px-1 font-medium text-gray-600 w-14">{m}</th>
                    ))}
                    <th className="text-center py-2 px-2 font-medium text-gray-600">NRR</th>
                  </tr>
                </thead>
                <tbody>
                  {COHORT_DATA.map(row => (
                    <tr key={row.cohort} className="border-t border-gray-100">
                      <td className="py-2 pr-4 font-semibold text-gray-800">{row.cohort}</td>
                      <td className="py-2 text-center text-gray-600">{row.startClients}</td>
                      <td className="py-2 text-center text-gray-600">{row.arr}</td>
                      {[row.m1, row.m2, row.m3, row.m4, row.m5, row.m6].map((v, i) => (
                        <td key={i} className="py-1 px-1">
                          <div className={`text-center rounded py-1 font-semibold text-[11px] ${cohortColor(v)}`}>
                            {v != null ? `${v}%` : '—'}
                          </div>
                        </td>
                      ))}
                      <td className="py-2 text-center">
                        <span className={`font-bold text-[13px] ${row.nrr >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                          {row.nrr}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* ARR Waterfall */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">ARR Movement Waterfall</CardTitle>
              <CardDescription>Expansion + new logos vs churn + contraction — trailing 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ARR_WATERFALL}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={v => `$${(v / 1000).toFixed(1)}M`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}k`, '']} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {ARR_WATERFALL.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                  <ReferenceLine y={0} stroke="#9ca3af" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── LTV Intelligence ── */}
        <TabsContent value="ltv" className="space-y-6 mt-4">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Portfolio LTV', value: '$6.75M', sub: 'Total estimated lifetime value', color: 'text-blue-600' },
              { label: 'Avg LTV:CAC', value: '25.9×', sub: 'Target ≥ 3× for sustainable growth', color: 'text-green-600' },
              { label: 'Platinum Clients', value: '2', sub: 'LTV:CAC > 40×', color: 'text-purple-600' },
              { label: 'At-Risk LTV', value: '$413k', sub: 'Bronze + high churn risk', color: 'text-red-600' },
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

          {/* LTV:CAC chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">LTV by Client</CardTitle>
                <CardDescription>Estimated lifetime value ($k) colored by tier</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={LTV_DATA} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tickFormatter={v => `$${v}k`} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip formatter={(v: number) => [`$${v}k`, 'LTV']} />
                    <Bar dataKey="ltv" name="LTV ($k)" radius={[0, 4, 4, 0]}>
                      {LTV_DATA.map((d, i) => (
                        <Cell key={i} fill={d.tier === 'Platinum' ? '#9333ea' : d.tier === 'Gold' ? '#f59e0b' : d.tier === 'Silver' ? '#6b7280' : '#f97316'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">LTV:CAC Ratio</CardTitle>
                <CardDescription>Higher = more efficient customer economics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={LTV_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => [`${v.toFixed(1)}×`, 'LTV:CAC']} />
                    <ReferenceLine y={3} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Min 3×', fontSize: 10, fill: '#16a34a' }} />
                    <Bar dataKey="ltvCacRatio" name="LTV:CAC" radius={[4, 4, 0, 0]}>
                      {LTV_DATA.map((d, i) => (
                        <Cell key={i} fill={d.ltvCacRatio >= 30 ? '#9333ea' : d.ltvCacRatio >= 20 ? '#3b82f6' : d.ltvCacRatio >= 10 ? '#f59e0b' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tier table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Client Tier Classification</CardTitle>
              <CardDescription>Tier = LTV:CAC bracket — Platinum ≥40×, Gold ≥20×, Silver ≥10×, Bronze &lt;10×</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500 text-xs">
                    <th className="text-left pb-2 font-medium">Client</th>
                    <th className="text-right pb-2 font-medium">LTV ($k)</th>
                    <th className="text-right pb-2 font-medium">CAC ($k)</th>
                    <th className="text-right pb-2 font-medium">Ratio</th>
                    <th className="text-right pb-2 font-medium">Monthly Rev</th>
                    <th className="text-center pb-2 font-medium">Churn Risk</th>
                    <th className="text-center pb-2 font-medium">Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {LTV_DATA.sort((a, b) => b.ltvCacRatio - a.ltvCacRatio).map(c => (
                    <tr key={c.name} className="hover:bg-gray-50">
                      <td className="py-2 font-semibold text-gray-800">{c.name}</td>
                      <td className="py-2 text-right text-gray-700">${c.ltv}</td>
                      <td className="py-2 text-right text-gray-700">${c.cac}</td>
                      <td className="py-2 text-right font-bold text-gray-900">{c.ltvCacRatio.toFixed(1)}×</td>
                      <td className="py-2 text-right text-gray-700">${c.avgRevPerMonth.toLocaleString()}</td>
                      <td className="py-2">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`text-xs font-semibold ${c.churnRisk >= 50 ? 'text-red-600' : c.churnRisk >= 30 ? 'text-amber-600' : 'text-green-600'}`}>{c.churnRisk}%</span>
                          <div className="h-1 w-16 bg-gray-200 rounded-full"><div className={`h-full rounded-full ${c.churnRisk >= 50 ? 'bg-red-500' : c.churnRisk >= 30 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${c.churnRisk}%` }} /></div>
                        </div>
                      </td>
                      <td className="py-2 text-center">{tierBadge(c.tier)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Retention Risk Matrix ── */}
        <TabsContent value="retention-risk" className="space-y-6 mt-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Protect Zone', count: 3, sub: 'High health · high revenue', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
              { label: 'Watch Zone', count: 3, sub: 'Medium health risk', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
              { label: 'At-Risk Zone', count: 2, sub: 'Low health · intervention needed', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
            ].map(s => (
              <Card key={s.label} className={`border ${s.bg}`}>
                <CardContent className="pt-4 pb-4 flex items-center gap-3">
                  <p className={`text-3xl font-bold ${s.color}`}>{s.count}</p>
                  <div>
                    <p className={`text-sm font-semibold ${s.color}`}>{s.label}</p>
                    <p className="text-xs text-gray-500">{s.sub}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Retention Risk Matrix</CardTitle>
              <CardDescription>
                X = Client Health Score · Y = Annual Revenue ($k) · Color = risk zone.
                Top-right = protect; bottom-left = urgent intervention.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={340}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="healthScore" type="number" name="Health Score" domain={[30, 100]} tick={{ fontSize: 11 }} label={{ value: 'Health Score →', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#6b7280' }} />
                  <YAxis dataKey="revenue" type="number" name="Revenue ($k)" tick={{ fontSize: 11 }} label={{ value: 'Revenue ($k)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#6b7280' }} />
                  <ZAxis dataKey="churnRisk" range={[80, 300]} />
                  <Tooltip content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0].payload as RetentionPoint;
                    return (
                      <div className="bg-white border rounded shadow p-2 text-xs">
                        <p className="font-bold text-gray-800">{d.name}</p>
                        <p className="text-gray-600">Health: {d.healthScore}</p>
                        <p className="text-gray-600">Revenue: ${d.revenue}k</p>
                        <p className={d.churnRisk >= 50 ? 'text-red-600' : 'text-amber-600'}>Churn Risk: {d.churnRisk}%</p>
                      </div>
                    );
                  }} />
                  <ReferenceLine x={70} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Health 70', position: 'top', fontSize: 9, fill: '#94a3b8' }} />
                  <ReferenceLine y={300} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: '$300k', position: 'right', fontSize: 9, fill: '#94a3b8' }} />
                  <Scatter
                    name="Clients"
                    data={RETENTION_SCATTER}
                    fill="#3b82f6"
                    shape={(props: { cx?: number; cy?: number; payload?: RetentionPoint }) => {
                      const { cx = 0, cy = 0, payload } = props;
                      const color = payload?.status === 'healthy' ? '#22c55e' : payload?.status === 'at-risk' ? '#ef4444' : '#f59e0b';
                      const r = Math.max(14, Math.min(28, (payload?.churnRisk ?? 20) / 2));
                      return (
                        <g>
                          <circle cx={cx} cy={cy} r={r} fill={color} fillOpacity={0.25} stroke={color} strokeWidth={2} />
                          <text x={cx} y={cy + 4} textAnchor="middle" fontSize={9} fill={color} fontWeight={600}>{payload?.name?.split(' ')[0]}</text>
                        </g>
                      );
                    }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Risk table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Intervention Priority List</CardTitle>
              <CardDescription>Sorted by churn risk — highest first</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-gray-500">
                    <th className="text-left pb-2 font-medium">Client</th>
                    <th className="text-right pb-2 font-medium">Revenue ($k)</th>
                    <th className="text-right pb-2 font-medium">Health Score</th>
                    <th className="text-right pb-2 font-medium">Churn Risk</th>
                    <th className="text-center pb-2 font-medium">Zone</th>
                    <th className="text-center pb-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[...RETENTION_SCATTER].sort((a, b) => b.churnRisk - a.churnRisk).map(c => (
                    <tr key={c.name} className="hover:bg-gray-50">
                      <td className="py-2 font-semibold text-gray-800">{c.name}</td>
                      <td className="py-2 text-right text-gray-700">${c.revenue}</td>
                      <td className="py-2 text-right">
                        <span className={c.healthScore >= 80 ? 'text-green-600 font-semibold' : c.healthScore >= 65 ? 'text-amber-600 font-semibold' : 'text-red-600 font-semibold'}>{c.healthScore}</span>
                      </td>
                      <td className="py-2 text-right">
                        <span className={c.churnRisk >= 50 ? 'text-red-600 font-bold' : c.churnRisk >= 30 ? 'text-amber-600 font-semibold' : 'text-green-600'}>{c.churnRisk}%</span>
                      </td>
                      <td className="py-2 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === 'healthy' ? 'bg-green-100 text-green-700' : c.status === 'at-risk' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {c.status === 'healthy' ? 'Protect' : c.status === 'at-risk' ? 'Urgent' : 'Watch'}
                        </span>
                      </td>
                      <td className="py-2 text-center">
                        {c.churnRisk >= 40 ? (
                          <Button size="sm" variant="destructive" className="h-6 text-[10px]">
                            Intervene
                          </Button>
                        ) : c.churnRisk >= 20 ? (
                          <Button size="sm" variant="outline" className="h-6 text-[10px]">
                            QBR
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-400">Monitor</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

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
                Complete client health analysis and revenue intelligence
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Health Score Breakdown */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Health Score: {selectedClient.healthScore}</h3>
                  {getTrendIcon(selectedClient.trend, selectedClient.trendChange)}
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={[
                    { metric: 'Profitability', score: selectedClient.profitabilityScore },
                    { metric: 'Scope Stability', score: selectedClient.scopeStabilityScore },
                    { metric: 'Payment', score: selectedClient.paymentBehaviorScore },
                    { metric: 'Resource Stability', score: selectedClient.resourceStabilityScore },
                    { metric: 'Growth', score: selectedClient.growthMomentumScore },
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                      dataKey="score"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-700 font-medium">Revenue</div>
                  <div className="text-2xl font-bold text-blue-900 mt-1">
                    ${(selectedClient.revenue / 1000).toFixed(0)}K
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
                  <div className="text-sm text-amber-700 font-medium">DSO</div>
                  <div className="text-2xl font-bold text-amber-900 mt-1">
                    {selectedClient.dso} days
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1">View Full Report</Button>
                <Button variant="outline" className="flex-1">Export Data</Button>
                <Button variant="outline" className="flex-1">Set Alerts</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Info Card */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-blue-900">AI-Powered Revenue Intelligence</div>
              <div className="text-sm text-blue-700 mt-1">
                This module uses machine learning to analyze 50+ data points per client, including
                financial performance, resource allocation, scope changes, and payment patterns. Health
                scores update weekly, margin alerts are real-time, and upsell opportunities are identified
                based on statistical modeling and industry benchmarks. Typical margin improvement: 5-15%.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
