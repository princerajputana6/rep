import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, Users } from 'lucide-react';

export function CapacityUtilization() {
  const utilizationByAgency = [
    { agency: 'Acme Digital', utilization: 82, capacity: 347, allocated: 285, color: '#3b82f6' },
    { agency: 'CreativeCo', utilization: 76, capacity: 215, allocated: 163, color: '#8b5cf6' },
    { agency: 'TechVentures', utilization: 88, capacity: 428, allocated: 377, color: '#06b6d4' },
    { agency: 'Digital Wave', utilization: 71, capacity: 156, allocated: 111, color: '#10b981' },
  ];

  const utilizationTrend = [
    { week: 'Week 1', internal: 75, borrowed: 12, lent: 18 },
    { week: 'Week 2', internal: 78, borrowed: 15, lent: 22 },
    { week: 'Week 3', internal: 82, borrowed: 18, lent: 25 },
    { week: 'Week 4', internal: 76, borrowed: 14, lent: 20 },
  ];

  const roleUtilization = [
    { role: 'Senior Developer', utilization: 92, demand: 'high', gap: 15 },
    { role: 'UX Designer', utilization: 87, demand: 'medium', gap: 8 },
    { role: 'Product Manager', utilization: 95, demand: 'high', gap: 12 },
    { role: 'Data Analyst', utilization: 68, demand: 'low', gap: 0 },
    { role: 'QA Engineer', utilization: 74, demand: 'medium', gap: 5 },
  ];

  const overUtilized = [
    { name: 'Sarah Johnson', role: 'Senior Developer', utilization: 118, hours: 47.2 },
    { name: 'Michael Chen', role: 'UX Designer', utilization: 112, hours: 44.8 },
    { name: 'Emma Davis', role: 'Product Manager', utilization: 105, hours: 42.0 },
  ];

  const underUtilized = [
    { name: 'James Wilson', role: 'Data Analyst', utilization: 35, hours: 14.0 },
    { name: 'Lisa Anderson', role: 'QA Engineer', utilization: 42, hours: 16.8 },
    { name: 'Tom Brown', role: 'Developer', utilization: 48, hours: 19.2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Capacity & Utilization Intelligence</h1>
        <p className="text-gray-600 mt-1">Real-time capacity analytics and staffing gap identification</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Network Utilization</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">78.5%</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <TrendingUp className="w-3 h-3" />
              +5.2% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Over-Utilized</div>
            <div className="text-2xl font-semibold text-red-600 mt-1">47</div>
            <div className="text-xs text-gray-500 mt-1">&gt;95% utilization</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Under-Utilized</div>
            <div className="text-2xl font-semibold text-amber-600 mt-1">128</div>
            <div className="text-xs text-gray-500 mt-1">&lt;50% utilization</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Staffing Gaps</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">23</div>
            <div className="text-xs text-gray-500 mt-1">Across 15 projects</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="by-agency">By Agency</TabsTrigger>
          <TabsTrigger value="by-role">By Role</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Utilization Trends (Weekly)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={utilizationTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="internal" stroke="#3b82f6" strokeWidth={2} name="Internal" />
                    <Line type="monotone" dataKey="borrowed" stroke="#8b5cf6" strokeWidth={2} name="Borrowed" />
                    <Line type="monotone" dataKey="lent" stroke="#10b981" strokeWidth={2} name="Lent" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Utilization by Agency</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={utilizationByAgency}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="agency" angle={-15} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="utilization" name="Utilization %">
                      {utilizationByAgency.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="by-role" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Demand Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roleUtilization.map((role) => (
                  <div key={role.role} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="font-medium text-gray-900">{role.role}</div>
                        <Badge variant={
                          role.demand === 'high' ? 'destructive' :
                          role.demand === 'medium' ? 'secondary' :
                          'outline'
                        }>
                          {role.demand} demand
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        {role.gap > 0 && (
                          <div className="text-sm text-red-600 font-medium">
                            Gap: {role.gap} resources
                          </div>
                        )}
                        <div className="font-semibold text-gray-900">{role.utilization}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          role.utilization > 90 ? 'bg-red-500' :
                          role.utilization > 75 ? 'bg-amber-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(role.utilization, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <TrendingUp className="w-5 h-5" />
                  Over-Utilized Resources ({overUtilized.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overUtilized.map((resource) => (
                    <div key={resource.name} className="bg-white p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{resource.name}</div>
                          <div className="text-sm text-gray-600">{resource.role}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-red-600">{resource.utilization}%</div>
                          <div className="text-xs text-gray-500">{resource.hours}h/week</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <TrendingDown className="w-5 h-5" />
                  Under-Utilized Resources ({underUtilized.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {underUtilized.map((resource) => (
                    <div key={resource.name} className="bg-white p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{resource.name}</div>
                          <div className="text-sm text-gray-600">{resource.role}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-amber-600">{resource.utilization}%</div>
                          <div className="text-xs text-gray-500">{resource.hours}h/week</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-blue-900">Capacity Optimization Opportunity</div>
              <div className="text-sm text-blue-700 mt-1">
                128 under-utilized resources detected. Consider redistribution or explore Hidden Capacity Radar for shareable capacity insights.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
