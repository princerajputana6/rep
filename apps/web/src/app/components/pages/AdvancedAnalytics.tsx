import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Share2,
  Plus,
  Settings,
  Eye,
  RefreshCw,
  Calendar,
  DollarSign,
  Users,
  Target,
  Activity,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Zap,
  Brain,
  Layers,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

const utilizationTrendData = [
  { month: 'Jul', actual: 72, predicted: 71, benchmark: 75 },
  { month: 'Aug', actual: 75, predicted: 74, benchmark: 75 },
  { month: 'Sep', actual: 78, predicted: 77, benchmark: 75 },
  { month: 'Oct', actual: 82, predicted: 80, benchmark: 75 },
  { month: 'Nov', actual: 76, predicted: 78, benchmark: 75 },
  { month: 'Dec', actual: 79, predicted: 79, benchmark: 75 },
  { month: 'Jan', actual: 81, predicted: 82, benchmark: 75 },
  { month: 'Feb', actual: null, predicted: 84, benchmark: 75 },
  { month: 'Mar', actual: null, predicted: 86, benchmark: 75 },
];

const revenueForecastData = [
  { month: 'Jul', revenue: 2.1, forecast: 2.1, target: 2.5 },
  { month: 'Aug', revenue: 2.3, forecast: 2.3, target: 2.5 },
  { month: 'Sep', revenue: 2.4, forecast: 2.4, target: 2.5 },
  { month: 'Oct', revenue: 2.6, forecast: 2.6, target: 2.5 },
  { month: 'Nov', revenue: 2.5, forecast: 2.5, target: 2.5 },
  { month: 'Dec', revenue: 2.7, forecast: 2.7, target: 2.5 },
  { month: 'Jan', revenue: 2.8, forecast: 2.8, target: 2.5 },
  { month: 'Feb', revenue: null, forecast: 3.0, target: 2.5 },
  { month: 'Mar', revenue: null, forecast: 3.2, target: 2.5 },
  { month: 'Apr', revenue: null, forecast: 3.4, target: 2.5 },
];

const departmentData = [
  { department: 'Engineering', utilization: 85, capacity: 120, available: 18 },
  { department: 'Design', utilization: 78, capacity: 40, available: 9 },
  { department: 'Product', utilization: 92, capacity: 25, available: 2 },
  { department: 'QA', utilization: 65, capacity: 30, available: 11 },
  { department: 'DevOps', utilization: 91, capacity: 15, available: 1 },
];

const skillDistribution = [
  { skill: 'React', count: 45 },
  { skill: 'Node.js', count: 38 },
  { skill: 'Python', count: 32 },
  { skill: 'AWS', count: 28 },
  { skill: 'Design', count: 25 },
  { skill: 'Product', count: 18 },
];

const benchmarkData = [
  { category: 'Utilization', yourOrg: 78.5, industry: 72, topPerformer: 85 },
  { category: 'Response Time', yourOrg: 85, industry: 70, topPerformer: 95 },
  { category: 'Allocation Accuracy', yourOrg: 92, industry: 75, topPerformer: 98 },
  { category: 'Resource Efficiency', yourOrg: 88, industry: 78, topPerformer: 92 },
  { category: 'Cost Optimization', yourOrg: 82, industry: 68, topPerformer: 90 },
];

const predictiveInsights = [
  {
    id: '1',
    type: 'warning',
    title: 'DevOps Capacity Constraint',
    description: 'Model predicts 95% utilization by March 2025',
    confidence: 87,
    impact: 'high',
    recommendation: 'Consider hiring 2 senior DevOps engineers or negotiate resource sharing agreement',
  },
  {
    id: '2',
    type: 'opportunity',
    title: 'Frontend Optimization Opportunity',
    description: 'Reallocation could improve efficiency by 12% and save $45K annually',
    confidence: 92,
    impact: 'medium',
    recommendation: 'Redistribute 3 developers from Project Beta to emerging initiatives',
  },
  {
    id: '3',
    type: 'success',
    title: 'Revenue Target Achievement',
    description: 'On track to exceed Q2 revenue target by 8%',
    confidence: 94,
    impact: 'high',
    recommendation: 'Maintain current allocation strategy and resource distribution',
  },
  {
    id: '4',
    type: 'info',
    title: 'Skill Gap Analysis',
    description: 'Growing demand for Kubernetes expertise detected',
    confidence: 78,
    impact: 'medium',
    recommendation: 'Invest in upskilling program for 5-7 engineers over next 6 months',
  },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

export function AdvancedAnalytics() {
  const [dateRange, setDateRange] = useState('6m');
  const [comparisonMode, setComparisonMode] = useState('industry');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Advanced Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Custom dashboards, predictive modeling, and benchmark comparisons
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Dashboard
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Utilization</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">78.5%</p>
                <div className="flex items-center gap-1 text-sm mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">+5.2%</span>
                  <span className="text-gray-500">vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Forecast Accuracy</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">92.3%</p>
                <div className="flex items-center gap-1 text-sm mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">+2.1%</span>
                  <span className="text-gray-500">improvement</span>
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
                <p className="text-sm text-gray-600">Cost Efficiency</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">$2.4M</p>
                <div className="flex items-center gap-1 text-sm mt-2">
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">-8.5%</span>
                  <span className="text-gray-500">costs saved</span>
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
                <p className="text-sm text-gray-600">Available Capacity</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">845h</p>
                <div className="flex items-center gap-1 text-sm mt-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">41 resources</span>
                </div>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="predictive" className="w-full">
        <TabsList>
          <TabsTrigger value="predictive">Predictive Modeling</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="custom">Custom Dashboards</TabsTrigger>
        </TabsList>

        <TabsContent value="predictive" className="space-y-6">
          {/* Utilization Forecast */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Utilization Forecast & Trends</CardTitle>
                  <CardDescription>
                    ML-powered predictions with 92% accuracy
                  </CardDescription>
                </div>
                <Badge className="bg-purple-600">
                  <Brain className="w-3 h-3 mr-1" />
                  AI Powered
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={utilizationTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="benchmark"
                    stroke="#94a3b8"
                    strokeDasharray="5 5"
                    name="Industry Benchmark"
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    fill="#3b82f6"
                    stroke="#3b82f6"
                    name="Actual"
                    fillOpacity={0.3}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicted"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecast</CardTitle>
              <CardDescription>
                Projected revenue with confidence intervals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueForecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}M`} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="target"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.2}
                    name="Target"
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.4}
                    name="Actual Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Forecast"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Predictive Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                Predictive Insights & Recommendations
              </CardTitle>
              <CardDescription>
                AI-generated insights based on historical patterns and trends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {predictiveInsights.map((insight) => {
                const getIcon = () => {
                  switch (insight.type) {
                    case 'warning': return <AlertCircle className="w-5 h-5 text-amber-600" />;
                    case 'success': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
                    case 'opportunity': return <TrendingUp className="w-5 h-5 text-blue-600" />;
                    default: return <Activity className="w-5 h-5 text-gray-600" />;
                  }
                };

                const getColor = () => {
                  switch (insight.type) {
                    case 'warning': return 'bg-amber-50 border-amber-200';
                    case 'success': return 'bg-green-50 border-green-200';
                    case 'opportunity': return 'bg-blue-50 border-blue-200';
                    default: return 'bg-gray-50 border-gray-200';
                  }
                };

                return (
                  <div
                    key={insight.id}
                    className={`p-4 rounded-lg border ${getColor()}`}
                  >
                    <div className="flex items-start gap-3">
                      {getIcon()}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {insight.confidence}% confidence
                          </Badge>
                          <Badge
                            className={
                              insight.impact === 'high'
                                ? 'bg-red-500'
                                : insight.impact === 'medium'
                                ? 'bg-amber-500'
                                : 'bg-blue-500'
                            }
                          >
                            {insight.impact} impact
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                        <div className="flex items-start gap-2 p-3 bg-white rounded border">
                          <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-800">
                            <span className="font-medium">Recommendation:</span>{' '}
                            {insight.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          {/* Industry Benchmarks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Industry Benchmark Comparison</CardTitle>
                  <CardDescription>
                    Compare your performance against industry standards
                  </CardDescription>
                </div>
                <Select value={comparisonMode} onValueChange={setComparisonMode}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="industry">Industry Avg</SelectItem>
                    <SelectItem value="top">Top Performers</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={benchmarkData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Your Organization"
                    dataKey="yourOrg"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.5}
                  />
                  {(comparisonMode === 'industry' || comparisonMode === 'both') && (
                    <Radar
                      name="Industry Average"
                      dataKey="industry"
                      stroke="#94a3b8"
                      fill="#94a3b8"
                      fillOpacity={0.3}
                    />
                  )}
                  {(comparisonMode === 'top' || comparisonMode === 'both') && (
                    <Radar
                      name="Top Performers"
                      dataKey="topPerformer"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                    />
                  )}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>

              {/* Benchmark Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-700 font-medium mb-1">
                    Areas of Excellence
                  </div>
                  <div className="text-xs text-blue-600">
                    • Allocation Accuracy (92%)<br />
                    • Resource Efficiency (88%)<br />
                    • Response Time (85%)
                  </div>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="text-sm text-amber-700 font-medium mb-1">
                    Improvement Opportunities
                  </div>
                  <div className="text-xs text-amber-600">
                    • Cost Optimization (82%)<br />
                    • Target: Match top performers (90%)
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm text-green-700 font-medium mb-1">
                    Overall Ranking
                  </div>
                  <div className="text-2xl font-bold text-green-900">Top 15%</div>
                  <div className="text-xs text-green-600">in your industry</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Utilization</CardTitle>
                <CardDescription>Utilization rates by department</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="department" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="utilization" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills Distribution</CardTitle>
                <CardDescription>Top skills across organization</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={skillDistribution}
                      dataKey="count"
                      nameKey="skill"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {skillDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Custom Dashboards</CardTitle>
                  <CardDescription>
                    Create personalized dashboards with your preferred metrics
                  </CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Dashboard
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Build Your Custom Dashboard
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Drag and drop widgets, configure metrics, and create the perfect
                  analytics view for your needs.
                </p>
                <Button size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Get Started
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-blue-900">Advanced Analytics</div>
              <div className="text-sm text-blue-700 mt-1">
                Leverage machine learning models trained on 500M+ data points for accurate
                predictions. Benchmark data is aggregated from 1,200+ organizations across
                your industry. All forecasts include confidence intervals and are updated daily.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
