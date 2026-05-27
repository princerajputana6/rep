'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, Users } from 'lucide-react';
import { api } from '@/lib/api';

interface AgencyUtil { agency: string; utilization: number; capacity: number; allocated: number; color: string }
interface RoleUtil { role: string; utilization: number; demand: string; gap: number }
interface PersonUtil { name: string; role: string; utilization: number; hours: number }

const ROLE_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6b7280'];

export function CapacityUtilization() {
  const [utilizationByAgency, setUtilizationByAgency] = useState<AgencyUtil[]>([]);
  const [utilizationTrend, setUtilizationTrend] = useState<{ week: string; internal: number; borrowed: number; lent: number }[]>([]);
  const [roleUtilization, setRoleUtilization] = useState<RoleUtil[]>([]);
  const [overUtilized, setOverUtilized] = useState<PersonUtil[]>([]);
  const [underUtilized, setUnderUtilized] = useState<PersonUtil[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<{ summary: { avgUtilization: number }; byRole: { role: string; allocatedHours: number; resourceCount: number }[] }>('/analytics/capacity').catch(() => null),
      api.get<{ summary: { totalResources: number; underutilizedCount: number; avgUtilizationPct: number }; underutilized: { name: string; role: string; allocatedHours: number; utilizationPct: number }[] }>('/analytics/hidden-capacity').catch(() => null),
    ]).then(([cap, hidden]) => {
      if (cap) {
        setUtilizationByAgency([{
          agency: 'My Agency',
          utilization: cap.summary.avgUtilization,
          capacity: hidden?.summary.totalResources ?? 0,
          allocated: cap.byRole.reduce((s, r) => s + r.resourceCount, 0),
          color: ROLE_COLORS[0],
        }]);
        setRoleUtilization(cap.byRole.map((r) => {
          const util = r.resourceCount > 0
            ? Math.min(100, Math.round((r.allocatedHours / Math.max(r.resourceCount * 40, 1)) * 100))
            : 0;
          return {
            role: r.role,
            utilization: util,
            demand: util > 85 ? 'high' : util > 60 ? 'medium' : 'low',
            gap: Math.max(0, util - 85),
          };
        }));
      }
      if (hidden) {
        setUnderUtilized(hidden.underutilized.slice(0, 10).map((p) => ({
          name: p.name, role: p.role, utilization: p.utilizationPct, hours: p.allocatedHours,
        })));
      }
      // Weekly trend + over-utilized lists require per-week aggregation that
      // doesn't exist on the backend yet — leave empty.
      setUtilizationTrend([]);
      setOverUtilized([]);
    });
  }, []);

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
            <div className="text-2xl font-semibold text-gray-900 mt-1">
              {utilizationByAgency[0]?.utilization ?? 0}%
            </div>
            <div className="text-xs text-gray-500 mt-1">All agencies</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Over-Utilized</div>
            <div className="text-2xl font-semibold text-red-600 mt-1">{overUtilized.length}</div>
            <div className="text-xs text-gray-500 mt-1">&gt;95% utilization</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Under-Utilized</div>
            <div className="text-2xl font-semibold text-amber-600 mt-1">{underUtilized.length}</div>
            <div className="text-xs text-gray-500 mt-1">&lt;50% utilization</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Staffing Gaps</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">
              {roleUtilization.reduce((s, r) => s + r.gap, 0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Across {roleUtilization.length} roles</div>
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
