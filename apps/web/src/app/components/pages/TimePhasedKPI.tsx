import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Label } from '@/app/components/ui/label';
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
  DollarSign,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  FileText,
  Target,
  AlertCircle,
  BookOpen,
  Shield,
  Zap,
  Users,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from 'recharts';

const timePhasedData = [
  { period: 'Jan 2025', budget: 120000, actual: 115000, earned: 118000, variance: 5000 },
  { period: 'Feb 2025', budget: 125000, actual: 128000, earned: 126000, variance: -3000 },
  { period: 'Mar 2025', budget: 130000, actual: 127000, earned: 132000, variance: 3000 },
  { period: 'Apr 2025', budget: 128000, actual: 130000, earned: 129000, variance: -2000 },
  { period: 'May 2025', budget: 135000, actual: 133000, earned: 136000, variance: 2000 },
  { period: 'Jun 2025', budget: 140000, actual: 138000, earned: 142000, variance: 2000 },
];

const roiData = [
  { period: 'Q1 2025', revenue: 450000, cost: 360000, profit: 90000, roi: 25 },
  { period: 'Q2 2025', revenue: 480000, cost: 375000, profit: 105000, roi: 28 },
  { period: 'Q3 2025', revenue: 510000, cost: 390000, profit: 120000, roi: 31 },
  { period: 'Q4 2025', revenue: 540000, cost: 405000, profit: 135000, roi: 33 },
];

const trendData = [
  { month: 'Jan', budget: 120, actual: 115, earned: 118, cv: 3, sv: -2, cpi: 1.03, spi: 0.98 },
  { month: 'Feb', budget: 125, actual: 128, earned: 126, cv: -2, sv: 1, cpi: 0.98, spi: 1.01 },
  { month: 'Mar', budget: 130, actual: 127, earned: 132, cv: 5, sv: 2, cpi: 1.04, spi: 1.02 },
  { month: 'Apr', budget: 128, actual: 130, earned: 129, cv: -1, sv: 1, cpi: 0.99, spi: 1.01 },
  { month: 'May', budget: 135, actual: 133, earned: 136, cv: 3, sv: 1, cpi: 1.02, spi: 1.01 },
  { month: 'Jun', budget: 140, actual: 138, earned: 142, cv: 4, sv: 2, cpi: 1.03, spi: 1.01 },
];

const fteData = [
  { period: 'Jan', fte: 45.2, hours: 7232, projects: 12 },
  { period: 'Feb', fte: 46.8, hours: 7488, projects: 13 },
  { period: 'Mar', fte: 48.5, hours: 7760, projects: 14 },
  { period: 'Apr', fte: 47.3, hours: 7568, projects: 14 },
  { period: 'May', fte: 49.1, hours: 7856, projects: 15 },
  { period: 'Jun', fte: 50.4, hours: 8064, projects: 16 },
];

export function TimePhasedKPI() {
  const [selectedReport, setSelectedReport] = useState<'time-phased' | 'roi' | 'budget-actual' | 'trend' | 'fte'>('time-phased');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedCalendar, setSelectedCalendar] = useState('fiscal-2025');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-semibold text-gray-900">Time-Phased KPI Reports</h1>
          </div>
          <p className="text-gray-600 mt-1">
            Comprehensive time-phased reporting with cost, FTE, and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </Button>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>Select report parameters and data sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={selectedReport} onValueChange={(v) => setSelectedReport(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time-phased">Time-Phased</SelectItem>
                  <SelectItem value="roi">ROI Analysis</SelectItem>
                  <SelectItem value="budget-actual">Budget-Actual Variance</SelectItem>
                  <SelectItem value="trend">Trend Analysis</SelectItem>
                  <SelectItem value="fte">Time-Phased FTE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Period Type</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Calendar Set</Label>
              <Select value={selectedCalendar} onValueChange={setSelectedCalendar}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fiscal-2025">Fiscal 2025</SelectItem>
                  <SelectItem value="calendar-2025">Calendar 2025</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cost Set</Label>
              <Select defaultValue="standard">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Rates</SelectItem>
                  <SelectItem value="actual">Actual Costs</SelectItem>
                  <SelectItem value="budgeted">Budgeted Costs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-semibold text-gray-900">$778K</p>
                <p className="text-xs text-blue-600 mt-1">6-month period</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Earned Value</p>
                <p className="text-2xl font-semibold text-gray-900">$783K</p>
                <p className="text-xs text-green-600 mt-1">+0.6% variance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">CPI</p>
                <p className="text-2xl font-semibold text-gray-900">1.02</p>
                <p className="text-xs text-purple-600 mt-1">Cost performance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">SPI</p>
                <p className="text-2xl font-semibold text-gray-900">1.01</p>
                <p className="text-xs text-amber-600 mt-1">Schedule performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Content */}
      <Tabs value={selectedReport} onValueChange={(v) => setSelectedReport(v as any)} className="w-full">
        <TabsList>
          <TabsTrigger value="time-phased">Time-Phased</TabsTrigger>
          <TabsTrigger value="roi">ROI</TabsTrigger>
          <TabsTrigger value="budget-actual">Budget-Actual</TabsTrigger>
          <TabsTrigger value="trend">Trend</TabsTrigger>
          <TabsTrigger value="fte">FTE</TabsTrigger>
          <TabsTrigger value="methodology">How It Works</TabsTrigger>
        </TabsList>

        {/* Time-Phased Report */}
        <TabsContent value="time-phased" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Time-Phased Project Data by Cost Set</CardTitle>
              <CardDescription>
                Incremental values time-phased across all periods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={timePhasedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                  <Bar dataKey="actual" fill="#10b981" name="Actual" />
                  <Line type="monotone" dataKey="earned" stroke="#f59e0b" strokeWidth={2} name="Earned Value" />
                </ComposedChart>
              </ResponsiveContainer>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-3 font-semibold">Period</th>
                      <th className="text-right p-3 font-semibold">Budget</th>
                      <th className="text-right p-3 font-semibold">Actual</th>
                      <th className="text-right p-3 font-semibold">Earned</th>
                      <th className="text-right p-3 font-semibold">Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timePhasedData.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3">{row.period}</td>
                        <td className="text-right p-3">${(row.budget / 1000).toFixed(0)}K</td>
                        <td className="text-right p-3">${(row.actual / 1000).toFixed(0)}K</td>
                        <td className="text-right p-3">${(row.earned / 1000).toFixed(0)}K</td>
                        <td className={`text-right p-3 font-semibold ${row.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {row.variance >= 0 ? '+' : ''}${(row.variance / 1000).toFixed(0)}K
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROI Report */}
        <TabsContent value="roi" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Return on Investment (ROI) Analysis</CardTitle>
              <CardDescription>
                Profit and ROI by criteria with time-phased incremental values
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={roiData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue" />
                  <Bar yAxisId="left" dataKey="cost" fill="#ef4444" name="Cost" />
                  <Area yAxisId="left" type="monotone" dataKey="profit" fill="#10b981" stroke="#10b981" fillOpacity={0.3} name="Profit" />
                  <Line yAxisId="right" type="monotone" dataKey="roi" stroke="#f59e0b" strokeWidth={3} name="ROI %" />
                </ComposedChart>
              </ResponsiveContainer>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                {roiData.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-semibold text-gray-900 mb-3">{item.period}</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Revenue:</span>
                        <span className="font-semibold">${(item.revenue / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost:</span>
                        <span className="font-semibold">${(item.cost / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Profit:</span>
                        <span className="font-semibold text-green-600">${(item.profit / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-gray-600">ROI:</span>
                        <span className="font-semibold text-blue-600">{item.roi}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget-Actual Variance */}
        <TabsContent value="budget-actual" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual Variance Analysis</CardTitle>
              <CardDescription>
                Time-phased variance between budget and actual costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={timePhasedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                  <Bar dataKey="actual" fill="#10b981" name="Actual" />
                  <Line type="monotone" dataKey="variance" stroke="#ef4444" strokeWidth={3} name="Variance" />
                </ComposedChart>
              </ResponsiveContainer>

              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-amber-900">Variance Summary</div>
                    <div className="text-sm text-amber-700 mt-1">
                      • Total cumulative variance: +$7K (0.9% under budget)<br />
                      • Months under budget: 4 of 6<br />
                      • Largest variance: Feb 2025 (-$3K over budget)
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trend Analysis */}
        <TabsContent value="trend" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Earned Value Management Trend Analysis</CardTitle>
              <CardDescription>
                Budget, actual, earned value with CV, SV, CPI, and SPI calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="budget" stroke="#3b82f6" strokeWidth={2} name="Budget" />
                  <Line type="monotone" dataKey="actual" stroke="#ef4444" strokeWidth={2} name="Actual" />
                  <Line type="monotone" dataKey="earned" stroke="#10b981" strokeWidth={2} name="Earned" />
                </LineChart>
              </ResponsiveContainer>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3">Cost Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost Variance (CV):</span>
                      <span className="font-semibold text-green-600">+$12K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost Performance Index (CPI):</span>
                      <span className="font-semibold">1.02</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      CPI &gt; 1.0 indicates project is under budget
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3">Schedule Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Schedule Variance (SV):</span>
                      <span className="font-semibold text-green-600">+$5K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Schedule Performance Index (SPI):</span>
                      <span className="font-semibold">1.01</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      SPI &gt; 1.0 indicates project is ahead of schedule
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FTE Report */}
        <TabsContent value="fte" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Time-Phased FTE Report</CardTitle>
              <CardDescription>
                Full-Time Equivalent calculations based on project hours from source data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={fteData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="fte" fill="#3b82f6" name="FTE" />
                  <Line yAxisId="right" type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={2} name="Total Hours" />
                  <Line yAxisId="right" type="monotone" dataKey="projects" stroke="#f59e0b" strokeWidth={2} name="Active Projects" />
                </ComposedChart>
              </ResponsiveContainer>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-3 font-semibold">Period</th>
                      <th className="text-right p-3 font-semibold">FTE</th>
                      <th className="text-right p-3 font-semibold">Total Hours</th>
                      <th className="text-right p-3 font-semibold">Projects</th>
                      <th className="text-right p-3 font-semibold">Hrs/FTE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fteData.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3">{row.period}</td>
                        <td className="text-right p-3 font-semibold">{row.fte.toFixed(1)}</td>
                        <td className="text-right p-3">{row.hours.toLocaleString()}</td>
                        <td className="text-right p-3">{row.projects}</td>
                        <td className="text-right p-3">{(row.hours / row.fte).toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-900">FTE Calculation Method</div>
                    <div className="text-sm text-blue-700 mt-1">
                      FTE = (Project Hours in Period) ÷ (Standard Hours in Calendar Period)<br />
                      Based on Calendar Set: {selectedCalendar} • Standard hours: 160 hrs/month
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Methodology Report */}
        <TabsContent value="methodology" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                How Time-Phased KPI Reports Work
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overview */}
              <div>
                <h3 className="text-lg font-semibold mb-3">📊 Overview</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Time-Phased KPI Reports provide comprehensive project performance analytics across multiple time periods. 
                  The system ingests data from Workfront every 4 hours and aggregates by calendar sets, cost sets, and up to 4 
                  custom criteria to deliver multi-dimensional insights for strategic decision-making.
                </p>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">🔢 Core KPI Formulas</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="font-semibold text-sm text-blue-900 mb-2">Cost Performance Index (CPI)</div>
                    <code className="text-xs bg-white px-2 py-1 rounded border block mb-2">
                      CPI = Earned Value (EV) ÷ Actual Cost (AC)
                    </code>
                    <p className="text-sm text-blue-800 mb-2">
                      Measures cost efficiency. CPI &gt; 1.0 = Under budget, CPI &lt; 1.0 = Over budget
                    </p>
                    <div className="text-xs text-blue-700 bg-blue-100 px-3 py-2 rounded">
                      <strong>Example:</strong> EV = $118K, AC = $115K → CPI = 1.03 (3% under budget)
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="font-semibold text-sm text-green-900 mb-2">Schedule Performance Index (SPI)</div>
                    <code className="text-xs bg-white px-2 py-1 rounded border block mb-2">
                      SPI = Earned Value (EV) ÷ Planned Value (PV)
                    </code>
                    <p className="text-sm text-green-800 mb-2">
                      Measures schedule efficiency. SPI &gt; 1.0 = Ahead of schedule, SPI &lt; 1.0 = Behind schedule
                    </p>
                    <div className="text-xs text-green-700 bg-green-100 px-3 py-2 rounded">
                      <strong>Example:</strong> EV = $118K, PV = $120K → SPI = 0.98 (2% behind schedule)
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                    <div className="font-semibold text-sm text-purple-900 mb-2">Return on Investment (ROI)</div>
                    <code className="text-xs bg-white px-2 py-1 rounded border block mb-2">
                      ROI = [(Revenue - Cost) ÷ Cost] × 100
                    </code>
                    <p className="text-sm text-purple-800 mb-2">
                      Measures profitability as a percentage. Higher ROI indicates better return on investment.
                    </p>
                    <div className="text-xs text-purple-700 bg-purple-100 px-3 py-2 rounded">
                      <strong>Example:</strong> Revenue = $450K, Cost = $360K → ROI = 25%
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                    <div className="font-semibold text-sm text-amber-900 mb-2">Full-Time Equivalent (FTE)</div>
                    <code className="text-xs bg-white px-2 py-1 rounded border block mb-2">
                      FTE = Total Project Hours ÷ Standard Hours per Period
                    </code>
                    <p className="text-sm text-amber-800 mb-2">
                      Calculates equivalent full-time employees needed. Standard hours = 160 hrs/month (8 hrs × 20 working days)
                    </p>
                    <div className="text-xs text-amber-700 bg-amber-100 px-3 py-2 rounded">
                      <strong>Example:</strong> 7,232 hours ÷ 160 = 45.2 FTE
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">📅 Time-Phasing Methodology</h3>
                <div className="space-y-3">
                  {[
                    {
                      title: 'Calendar Set Selection',
                      description: 'Choose between Fiscal Year (Jul-Jun), Calendar Year (Jan-Dec), or Custom ranges. Calendar determines period boundaries for aggregation.',
                    },
                    {
                      title: 'Period Granularity',
                      description: 'Data can be viewed at Weekly (7-day increments), Monthly (calendar months), Quarterly (3-month blocks), or Yearly levels.',
                    },
                    {
                      title: 'Incremental Values',
                      description: 'Each period shows incremental (not cumulative) values. For example, Jan shows only January spend, not Jan + Feb.',
                    },
                    {
                      title: 'Cost Set Application',
                      description: 'Standard Rates use rate cards, Actual Costs use real expenditures, Budgeted Costs use planned baseline values.',
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="font-semibold text-sm text-gray-900 mb-1">{item.title}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">🎯 Report Types Explained</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
                      title: 'Time-Phased Report',
                      description: 'Budget, Actual, and Earned Value by period. Identifies variances and cost overruns over time.',
                    },
                    {
                      icon: <DollarSign className="w-5 h-5 text-green-600" />,
                      title: 'ROI Analysis',
                      description: 'Profitability trends by quarter. Shows revenue, cost, profit, and ROI percentage across periods.',
                    },
                    {
                      icon: <Target className="w-5 h-5 text-purple-600" />,
                      title: 'Budget-Actual Variance',
                      description: 'Direct comparison of budgeted vs actual spend. Highlights months with significant budget deviations.',
                    },
                    {
                      icon: <TrendingUp className="w-5 h-5 text-amber-600" />,
                      title: 'Trend Analysis',
                      description: 'EVM metrics (CV, SV, CPI, SPI) over time. Monitors cost and schedule performance health.',
                    },
                    {
                      icon: <Users className="w-5 h-5 text-red-600" />,
                      title: 'Time-Phased FTE',
                      description: 'Resource equivalency by period. Shows how many FTEs are deployed and total hours consumed.',
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg border">
                      <div className="flex-shrink-0 p-2 bg-white rounded-lg">
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">🔄 Data Integration Pipeline</h3>
                <div className="space-y-4">
                  {[
                    {
                      step: '1',
                      title: 'Workfront Ingestion',
                      description: 'Project, task, and resource data synced every 4 hours via API. Includes hours logged, costs, budgets, and completion status.',
                      color: 'blue',
                    },
                    {
                      step: '2',
                      title: 'Data Transformation',
                      description: 'Raw data mapped to calendar periods and cost sets. Hours converted to FTE, costs allocated to appropriate periods.',
                      color: 'purple',
                    },
                    {
                      step: '3',
                      title: 'Aggregation Engine',
                      description: 'Data rolled up by selected criteria (up to 4). Examples: Department + Project, Client + Role, Agency + Skill.',
                      color: 'green',
                    },
                    {
                      step: '4',
                      title: 'KPI Calculation',
                      description: 'CPI, SPI, ROI, and variance metrics computed for each period using EVM formulas.',
                      color: 'amber',
                    },
                    {
                      step: '5',
                      title: 'Report Generation',
                      description: 'Visual charts and tabular data rendered. Exportable to PDF, Excel, or CSV formats.',
                      color: 'red',
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
                <h3 className="text-lg font-semibold mb-4">🔒 Data Governance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      icon: <Shield className="w-5 h-5 text-blue-600" />,
                      title: 'Role-Based Access',
                      description: 'Only authorized users can view financial KPIs. Project Managers see their projects only.',
                    },
                    {
                      icon: <FileText className="w-5 h-5 text-green-600" />,
                      title: 'Audit Trail',
                      description: 'All report generations logged. Immutable record of who viewed what data when.',
                    },
                    {
                      icon: <Zap className="w-5 h-5 text-purple-600" />,
                      title: 'Real-Time Accuracy',
                      description: 'Data freshness indicator shows last sync time. Reports always display current accuracy level.',
                    },
                    {
                      icon: <Target className="w-5 h-5 text-amber-600" />,
                      title: 'No PII Exposure',
                      description: 'Individual performance data not included. Reports aggregate at project/team/department level only.',
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg border">
                      <div className="flex-shrink-0 p-2 bg-white rounded-lg">
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">💡 Best Practices</h3>
                <div className="space-y-3">
                  {[
                    {
                      title: 'Use Consistent Calendar Sets',
                      description: 'Stick to one calendar set (Fiscal or Calendar Year) for year-over-year comparisons. Switching mid-year breaks trend analysis.',
                    },
                    {
                      title: 'Monitor CPI & SPI Together',
                      description: 'A project can be under budget (CPI > 1.0) but behind schedule (SPI < 1.0). Both metrics needed for full picture.',
                    },
                    {
                      title: 'Export Reports Monthly',
                      description: 'Archive monthly snapshots for historical comparison. Workfront only stores 13 months of history.',
                    },
                    {
                      title: 'Set Up Alert Thresholds',
                      description: 'Configure notifications when CPI < 0.90 or SPI < 0.85. Early warning enables corrective action.',
                    },
                  ].map((tip, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="font-semibold text-sm text-gray-900 mb-1">{tip.title}</div>
                      <div className="text-sm text-gray-600">{tip.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">❓ Frequently Asked Questions</h3>
                <div className="space-y-3">
                  {[
                    {
                      q: 'Why do my CPI and SPI values change after syncing?',
                      a: 'Workfront data updates retroactively when users log hours late or budgets are revised. Always check the "Last Sync" timestamp.',
                    },
                    {
                      q: 'Can I create custom KPIs beyond the standard ones?',
                      a: 'Yes. Use the "Custom Criteria" feature to slice data by any combination of up to 4 dimensions (e.g., Client × Role × Agency).',
                    },
                    {
                      q: 'What\'s the difference between Budgeted and Actual Cost Sets?',
                      a: 'Budgeted uses planned baseline costs from project setup. Actual uses real expenditures from timesheets and expenses.',
                    },
                    {
                      q: 'How far back can I generate historical reports?',
                      a: 'REP Platform stores 3 years of history. Workfront API provides 13 months. Archive exports for longer retention.',
                    },
                  ].map((faq, idx) => (
                    <div key={idx} className="p-4 bg-blue-50 rounded-lg">
                      <div className="font-semibold text-sm text-blue-900 mb-1 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        {faq.q}
                      </div>
                      <div className="text-sm text-blue-800 ml-6">{faq.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Data Source Info */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-purple-900">Data Source Integration</div>
              <div className="text-sm text-purple-700 mt-1">
                Reports are generated from project data ingested from Workfront • Data refreshed every 4 hours • 
                Last sync: 2 hours ago • Up to 4 criteria can be selected per report
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}