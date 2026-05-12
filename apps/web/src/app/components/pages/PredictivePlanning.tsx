import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Calendar,
  Users,
  BarChart3,
  Target,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus,
  BookOpen,
  AlertCircle,
  Shield,
  Lightbulb,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

const forecastData = [
  { month: 'Feb', actual: 78, predicted: 78, capacity: 100, demand: 82 },
  { month: 'Mar', actual: 82, predicted: 81, capacity: 100, demand: 85 },
  { month: 'Apr', actual: null, predicted: 85, capacity: 100, demand: 88 },
  { month: 'May', actual: null, predicted: 88, capacity: 100, demand: 92 },
  { month: 'Jun', actual: null, predicted: 92, capacity: 100, demand: 95 },
  { month: 'Jul', actual: null, predicted: 94, capacity: 100, demand: 98 },
];

const roleUtilizationForecast = [
  { role: 'Full Stack Dev', current: 85, predicted: 92, shortfall: 7 },
  { role: 'Frontend Dev', current: 78, predicted: 88, shortfall: 10 },
  { role: 'Backend Dev', current: 92, predicted: 96, shortfall: 4 },
  { role: 'DevOps', current: 88, predicted: 98, shortfall: 10 },
  { role: 'Data Engineer', current: 75, predicted: 85, shortfall: 10 },
  { role: 'UX Designer', current: 82, predicted: 86, shortfall: 4 },
];

const demandTrends = [
  { quarter: 'Q1 2025', demand: 245, supply: 280, surplus: 35 },
  { quarter: 'Q2 2025', demand: 268, supply: 285, surplus: 17 },
  { quarter: 'Q3 2025', demand: 295, supply: 290, surplus: -5 },
  { quarter: 'Q4 2025', demand: 318, supply: 295, surplus: -23 },
];

export function PredictivePlanning() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-semibold text-gray-900">Predictive Capacity Planning</h1>
          </div>
          <p className="text-gray-600 mt-1">
            AI-powered forecasting for resource demand and capacity optimization
          </p>
        </div>
        <Badge className="bg-blue-500 text-white gap-1">
          <TrendingUp className="w-3 h-3" />
          Predictive Analytics
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Forecast Accuracy</p>
                <p className="text-2xl font-semibold text-gray-900">96.8%</p>
                <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                  <ArrowUp className="w-3 h-3" />
                  <span>2.1% vs last period</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Capacity Risks</p>
                <p className="text-2xl font-semibold text-gray-900">3</p>
                <p className="text-xs text-amber-600 mt-1">Requires attention</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Optimal Allocation</p>
                <p className="text-2xl font-semibold text-gray-900">87%</p>
                <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                  <ArrowUp className="w-3 h-3" />
                  <span>5% improvement</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Planning Horizon</p>
                <p className="text-2xl font-semibold text-gray-900">6 Mo</p>
                <p className="text-xs text-purple-600 mt-1">Advanced forecasting</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="forecast" className="w-full">
        <TabsList>
          <TabsTrigger value="forecast">Demand Forecast</TabsTrigger>
          <TabsTrigger value="roles">Role Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="scenarios">What-If Scenarios</TabsTrigger>
          <TabsTrigger value="methodology">How It Works</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-6 mt-6">
          {/* Utilization Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>6-Month Utilization Forecast</CardTitle>
              <CardDescription>
                Predicted vs actual utilization with capacity planning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="capacity"
                    fill="#e5e7eb"
                    stroke="#9ca3af"
                    name="Max Capacity"
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Actual"
                    dot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    name="Predicted"
                    dot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="demand"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Demand"
                    dot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Supply vs Demand */}
          <Card>
            <CardHeader>
              <CardTitle>Quarterly Supply vs Demand Analysis</CardTitle>
              <CardDescription>Identifying capacity gaps and surpluses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={demandTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="demand" fill="#ef4444" name="Demand" />
                  <Bar dataKey="supply" fill="#10b981" name="Supply" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-4 grid grid-cols-4 gap-4">
                {demandTrends.map((trend) => (
                  <div key={trend.quarter} className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">{trend.quarter}</div>
                    <div
                      className={`flex items-center gap-1 font-semibold ${
                        trend.surplus >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {trend.surplus >= 0 ? (
                        <ArrowUp className="w-4 h-4" />
                      ) : (
                        <ArrowDown className="w-4 h-4" />
                      )}
                      <span>{Math.abs(trend.surplus)} FTE</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {trend.surplus >= 0 ? 'Surplus' : 'Shortfall'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Role-Based Utilization Forecast</CardTitle>
              <CardDescription>
                Predicted utilization and capacity gaps by role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roleUtilizationForecast.map((role) => (
                  <div key={role.role} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{role.role}</h4>
                        <p className="text-sm text-gray-600">
                          Current: {role.current}% → Predicted: {role.predicted}%
                        </p>
                      </div>
                      {role.shortfall > 5 ? (
                        <Badge className="bg-red-500">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          High Risk
                        </Badge>
                      ) : role.shortfall > 0 ? (
                        <Badge className="bg-amber-500">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Medium Risk
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Healthy
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600 text-xs">Current</div>
                        <div className="font-semibold">{role.current}%</div>
                      </div>
                      <div>
                        <div className="text-gray-600 text-xs">Predicted (3mo)</div>
                        <div className="font-semibold text-purple-600">{role.predicted}%</div>
                      </div>
                      <div>
                        <div className="text-gray-600 text-xs">Gap</div>
                        <div className="font-semibold text-red-600">+{role.shortfall}%</div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Utilization Trend</span>
                        <span className="font-semibold">{role.predicted}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            role.predicted >= 95
                              ? 'bg-red-500'
                              : role.predicted >= 85
                              ? 'bg-amber-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${role.predicted}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                AI-Generated Recommendations
              </CardTitle>
              <CardDescription>Actionable insights based on predictive analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 mb-1">Critical: DevOps Shortage</h4>
                    <p className="text-sm text-red-700 mb-2">
                      Predicted 10% capacity shortfall in DevOps roles by May 2025
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        Start Hiring
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-l-4 border-amber-500 bg-amber-50 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-900 mb-1">
                      Warning: Frontend Developer Demand
                    </h4>
                    <p className="text-sm text-amber-700 mb-2">
                      10% utilization increase expected. Consider cross-training or contractor pool.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                        Review Options
                      </Button>
                      <Button size="sm" variant="outline">
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-1">
                      Opportunity: Optimize Allocation
                    </h4>
                    <p className="text-sm text-blue-700 mb-2">
                      Data Engineers have 25% lower utilization. Consider reallocation to high-demand
                      projects.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        View Suggestions
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 mb-1">Success: Backend Capacity</h4>
                    <p className="text-sm text-green-700">
                      Backend Developer capacity well-balanced with 4% buffer for Q2 2025.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>What-If Scenario Planning</CardTitle>
              <CardDescription>
                Model different scenarios to optimize resource planning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                  <h4 className="font-semibold mb-2">Scenario: High Growth</h4>
                  <p className="text-sm text-gray-600 mb-3">+30% project volume increase</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Additional FTEs needed:</span>
                      <span className="font-semibold text-red-600">+45</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hiring lead time:</span>
                      <span className="font-semibold">3-4 months</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-3">
                    Run Simulation
                  </Button>
                </div>

                <div className="p-4 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                  <h4 className="font-semibold mb-2">Scenario: Budget Cut</h4>
                  <p className="text-sm text-gray-600 mb-3">-15% operating budget</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Resource reduction:</span>
                      <span className="font-semibold text-amber-600">-22 FTEs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Project impact:</span>
                      <span className="font-semibold">12 delayed</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-3">
                    Run Simulation
                  </Button>
                </div>

                <div className="p-4 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                  <h4 className="font-semibold mb-2">Scenario: Skill Pivot</h4>
                  <p className="text-sm text-gray-600 mb-3">Cloud-native transformation</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Training investment:</span>
                      <span className="font-semibold text-blue-600">$180K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Timeline:</span>
                      <span className="font-semibold">6 months</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-3">
                    Run Simulation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}