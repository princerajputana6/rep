/**
 * Enhanced Staffing Planner with Timeline, Dependencies & Integration
 * Connects to Financial, Hidden Capacity, and Campaign modules
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Link2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  MessageSquare,
  Share2,
  Filter,
  Download,
  Plus,
  ExternalLink,
  ArrowRight,
  Workflow,
  GitBranch,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { LoadingState } from '@/app/components/common/LoadingState';
import { EmptyState } from '@/app/components/common/EmptyState';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Resource {
  id: string;
  name: string;
  role: string;
  avatar: string;
  allocation: number;
  hoursPerWeek: number;
  rate: number;
  skills: string[];
  availability: 'available' | 'partial' | 'full';
}

interface ProjectTask {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  duration: number; // days
  resources: Resource[];
  dependencies: string[]; // Task IDs
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  progress: number;
  budget: number;
  actualCost: number;
  description: string;
}

interface ProjectPlan {
  id: string;
  projectName: string;
  client: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'paused' | 'completed';
  totalBudget: number;
  spent: number;
  tasks: ProjectTask[];
  hiddenCapacityUsed: number;
  borrowedResources: number;
  collaborators: string[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockProjects: ProjectPlan[] = [
  {
    id: 'plan_1',
    projectName: 'Marketing Campaign Q1',
    client: 'Acme Corp',
    startDate: '2026-02-15',
    endDate: '2026-04-30',
    status: 'active',
    totalBudget: 120000,
    spent: 45000,
    hiddenCapacityUsed: 15,
    borrowedResources: 2,
    collaborators: ['john@agency.com', 'sarah@agency.com'],
    tasks: [
      {
        id: 'task_1',
        name: 'Creative Concept Development',
        startDate: '2026-02-15',
        endDate: '2026-02-28',
        duration: 14,
        dependencies: [],
        status: 'completed',
        progress: 100,
        budget: 20000,
        actualCost: 19500,
        description: 'Develop creative concepts and mood boards',
        resources: [
          {
            id: 'user_1',
            name: 'Sarah Chen',
            role: 'Creative Director',
            avatar: 'SC',
            allocation: 80,
            hoursPerWeek: 32,
            rate: 150,
            skills: ['Branding', 'Creative Strategy'],
            availability: 'partial',
          },
        ],
      },
      {
        id: 'task_2',
        name: 'Design Execution',
        startDate: '2026-03-01',
        endDate: '2026-03-20',
        duration: 20,
        dependencies: ['task_1'],
        status: 'in-progress',
        progress: 65,
        budget: 35000,
        actualCost: 25500,
        description: 'Execute designs across all channels',
        resources: [
          {
            id: 'user_2',
            name: 'Mike Johnson',
            role: 'Senior Designer',
            avatar: 'MJ',
            allocation: 100,
            hoursPerWeek: 40,
            rate: 120,
            skills: ['UI/UX', 'Graphic Design'],
            availability: 'full',
          },
          {
            id: 'user_3',
            name: 'Emily Zhang',
            role: 'Designer',
            avatar: 'EZ',
            allocation: 50,
            hoursPerWeek: 20,
            rate: 95,
            skills: ['Illustration', 'Motion'],
            availability: 'partial',
          },
        ],
      },
      {
        id: 'task_3',
        name: 'Copy & Content',
        startDate: '2026-03-05',
        endDate: '2026-03-25',
        duration: 21,
        dependencies: ['task_1'],
        status: 'in-progress',
        progress: 45,
        budget: 25000,
        actualCost: 12000,
        description: 'Write copy and develop content strategy',
        resources: [
          {
            id: 'user_4',
            name: 'Alex Rodriguez',
            role: 'Copywriter',
            avatar: 'AR',
            allocation: 75,
            hoursPerWeek: 30,
            rate: 110,
            skills: ['Copywriting', 'Content Strategy'],
            availability: 'partial',
          },
        ],
      },
      {
        id: 'task_4',
        name: 'Campaign Launch',
        startDate: '2026-03-26',
        endDate: '2026-04-10',
        duration: 16,
        dependencies: ['task_2', 'task_3'],
        status: 'not-started',
        progress: 0,
        budget: 30000,
        actualCost: 0,
        description: 'Launch campaign across all channels',
        resources: [],
      },
      {
        id: 'task_5',
        name: 'Performance Monitoring',
        startDate: '2026-04-11',
        endDate: '2026-04-30',
        duration: 20,
        dependencies: ['task_4'],
        status: 'not-started',
        progress: 0,
        budget: 10000,
        actualCost: 0,
        description: 'Monitor and optimize campaign performance',
        resources: [],
      },
    ],
  },
];

// ─── Period data helpers ───────────────────────────────────────────────────────

function buildPeriodViewData(
  project: ProjectPlan,
  period: 'monthly' | 'quarterly' | 'annual'
) {
  // Collect unique resources across all tasks
  const resourceMap = new Map<string, Resource>();
  project.tasks.forEach(t =>
    t.resources.forEach(r => {
      if (!resourceMap.has(r.id)) resourceMap.set(r.id, r);
    })
  );
  const resources = Array.from(resourceMap.values());

  // Build period columns
  let columns: string[] = [];
  if (period === 'monthly') columns = ['W1', 'W2', 'W3', 'W4'];
  else if (period === 'quarterly') columns = ['Jan', 'Feb', 'Mar'];
  else columns = ['Q1', 'Q2', 'Q3', 'Q4'];

  // Build rows
  const rows = resources.map(res => {
    const taskCount = project.tasks.filter(t => t.resources.some(r => r.id === res.id)).length;
    const allocs = columns.map((_, ci) => {
      // distribute hours across columns using hoursPerWeek as base
      const base = period === 'monthly'
        ? res.hoursPerWeek
        : period === 'quarterly'
        ? res.hoursPerWeek * 4.33
        : res.hoursPerWeek * 13;
      // slight variation per column
      return Math.round(base * (0.85 + ci * 0.05));
    });
    return { resource: res, allocs, taskCount };
  });

  // Bar chart data: hours per resource per column
  const chartData = columns.map((col, ci) => {
    const entry: Record<string, string | number> = { period: col };
    rows.forEach(r => {
      entry[r.resource.name] = r.allocs[ci];
    });
    return entry;
  });

  return { columns, rows, chartData, resources };
}

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

// ─── Component ────────────────────────────────────────────────────────────────

export function EnhancedStaffingPlanner() {
  const [projects, setProjects] = useState<ProjectPlan[]>(mockProjects);
  const [selectedProject, setSelectedProject] = useState<ProjectPlan | null>(projects[0]);
  const [view, setView] = useState<'timeline' | 'resources' | 'dependencies' | 'collaboration' | 'periodview'>('timeline');
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [planPeriod, setPlanPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('quarterly');

  const getStatusColor = (status: ProjectTask['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: ProjectTask['status']) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in-progress': return Clock;
      case 'blocked': return AlertTriangle;
      default: return Calendar;
    }
  };

  if (!selectedProject) {
    return (
      <EmptyState
        title="No project selected"
        description="Select a project to view staffing details"
        actionLabel="Create Project"
        onAction={() => toast.info('Feature coming soon')}
      />
    );
  }

  const periodData = buildPeriodViewData(selectedProject, planPeriod);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold text-gray-900 truncate">
              {selectedProject.projectName}
            </h1>
            <Badge variant={selectedProject.status === 'active' ? 'default' : 'secondary'}>
              {selectedProject.status}
            </Badge>
          </div>
          <p className="text-gray-600">{selectedProject.client}</p>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(selectedProject.startDate).toLocaleDateString()} - {new Date(selectedProject.endDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>${selectedProject.spent.toLocaleString()} / ${selectedProject.totalBudget.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setShowTaskDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Integration Bridges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200 cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Financial Dashboard</h3>
            <p className="text-sm text-gray-600 mb-2">
              Budget: {((selectedProject.spent / selectedProject.totalBudget) * 100).toFixed(1)}% used
            </p>
            <Button variant="link" className="p-0 h-auto text-sm" onClick={() => toast.info('Navigating to Financial Dashboard')}>
              View financials <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200 cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Hidden Capacity</h3>
            <p className="text-sm text-gray-600 mb-2">
              {selectedProject.hiddenCapacityUsed}% of capacity discovered
            </p>
            <Button variant="link" className="p-0 h-auto text-sm" onClick={() => toast.info('Navigating to Hidden Capacity')}>
              Find more capacity <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200 cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Borrowed Resources</h3>
            <p className="text-sm text-gray-600 mb-2">
              {selectedProject.borrowedResources} resources from partner agencies
            </p>
            <Button variant="link" className="p-0 h-auto text-sm" onClick={() => toast.info('Navigating to Borrow Requests')}>
              View borrows <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Period View:</span>
        <div className="flex items-center border rounded-lg overflow-hidden">
          {(['monthly', 'quarterly', 'annual'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlanPeriod(p)}
              className={`px-4 py-1.5 text-sm font-medium transition-colors capitalize ${
                planPeriod === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400">
          {planPeriod === 'monthly' ? '4-week view' : planPeriod === 'quarterly' ? '3-month view' : 'Full-year rollup'}
        </span>
      </div>

      {/* View Tabs */}
      <Tabs value={view} onValueChange={(v) => setView(v as typeof view)} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="timeline">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="resources">
            <Users className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Resources</span>
          </TabsTrigger>
          <TabsTrigger value="dependencies">
            <GitBranch className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Dependencies</span>
          </TabsTrigger>
          <TabsTrigger value="collaboration">
            <MessageSquare className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Collaboration</span>
          </TabsTrigger>
          <TabsTrigger value="periodview">
            <BarChart3 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Period View</span>
          </TabsTrigger>
        </TabsList>

        {/* Timeline View */}
        <TabsContent value="timeline" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedProject.tasks.map((task, index) => {
                  const StatusIcon = getStatusIcon(task.status);
                  const hasBlockingDeps = task.dependencies.some(depId => {
                    const dep = selectedProject.tasks.find(t => t.id === depId);
                    return dep && dep.status !== 'completed';
                  });

                  return (
                    <div key={task.id} className="relative">
                      {index > 0 && (
                        <div className="absolute left-6 -top-4 w-0.5 h-4 bg-gray-200"></div>
                      )}
                      <Card className={`${hasBlockingDeps && task.status === 'not-started' ? 'border-orange-300 bg-orange-50' : ''}`}>
                        <CardContent className="pt-6">
                          <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getStatusColor(task.status)}`}>
                                  <StatusIcon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-900">{task.name}</h4>
                                    <Badge className={getStatusColor(task.status)}>
                                      {task.status.replace('-', ' ')}
                                    </Badge>
                                    {hasBlockingDeps && task.status === 'not-started' && (
                                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                        Blocked
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>

                                  {/* Dependencies */}
                                  {task.dependencies.length > 0 && (
                                    <div className="flex items-center gap-2 mb-2">
                                      <Link2 className="w-4 h-4 text-gray-400" />
                                      <span className="text-xs text-gray-600">
                                        Depends on: {task.dependencies.map(depId => {
                                          const dep = selectedProject.tasks.find(t => t.id === depId);
                                          return dep?.name;
                                        }).join(', ')}
                                      </span>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <p className="text-xs text-gray-600">Duration</p>
                                      <p className="font-medium">{task.duration} days</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-600">Progress</p>
                                      <p className="font-medium">{task.progress}%</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-600">Budget</p>
                                      <p className="font-medium">${task.budget.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-600">Spent</p>
                                      <p className={`font-medium ${task.actualCost > task.budget ? 'text-red-600' : 'text-gray-900'}`}>
                                        ${task.actualCost.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Progress Bar */}
                                  <div className="mt-3">
                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                      <span>Progress</span>
                                      <span>{task.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full ${task.status === 'completed' ? 'bg-green-600' : 'bg-blue-600'}`}
                                        style={{ width: `${task.progress}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Assigned Resources */}
                              {task.resources.length > 0 && (
                                <div className="ml-13 pl-3 border-l-2 border-gray-200">
                                  <p className="text-xs text-gray-600 mb-2">Assigned Resources</p>
                                  <div className="flex flex-wrap gap-2">
                                    {task.resources.map(resource => (
                                      <div key={resource.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                                          {resource.avatar}
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-900">{resource.name}</p>
                                          <p className="text-xs text-gray-600">{resource.role} • {resource.allocation}%</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex lg:flex-col gap-2 flex-shrink-0">
                              <Button variant="outline" size="sm" className="w-full lg:w-auto">
                                <Eye className="w-4 h-4 mr-2" />
                                Details
                              </Button>
                              <Button variant="outline" size="sm" className="w-full lg:w-auto">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Discuss
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources View */}
        <TabsContent value="resources" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Resource Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from(new Set(selectedProject.tasks.flatMap(t => t.resources))).map(resource => {
                  return (
                    <Card key={resource.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                              {resource.avatar}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{resource.name}</h4>
                              <p className="text-sm text-gray-600">{resource.role}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {resource.skills.map(skill => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-semibold text-gray-900">{resource.allocation}%</p>
                            <p className="text-sm text-gray-600">{resource.hoursPerWeek}h/week</p>
                            <p className="text-xs text-gray-500">${resource.rate}/hr</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dependencies View */}
        <TabsContent value="dependencies" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Dependencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selectedProject.tasks.map(task => (
                  <div key={task.id} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded flex items-center justify-center ${getStatusColor(task.status)}`}>
                        {selectedProject.tasks.indexOf(task) + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{task.name}</h4>
                        <p className="text-sm text-gray-600">{task.duration} days</p>
                      </div>
                    </div>
                    {task.dependencies.length > 0 && (
                      <div className="ml-11 pl-4 border-l-2 border-gray-300">
                        <p className="text-xs text-gray-600 mb-2">Depends on:</p>
                        {task.dependencies.map(depId => {
                          const dep = selectedProject.tasks.find(t => t.id === depId);
                          if (!dep) return null;
                          return (
                            <div key={depId} className="flex items-center gap-2 mb-2">
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{dep.name}</span>
                              <Badge className={getStatusColor(dep.status)}>
                                {dep.status}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collaboration View */}
        <TabsContent value="collaboration" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Project Collaborators</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.collaborators.map(email => (
                      <div key={email} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-semibold">
                          {email.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-700">{email}</span>
                      </div>
                    ))}
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Collaborator
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Recent Activity</h4>
                  <div className="space-y-3">
                    {[
                      { user: 'Sarah Chen', action: 'completed task', task: 'Creative Concept Development', time: '2 hours ago' },
                      { user: 'Mike Johnson', action: 'updated progress on', task: 'Design Execution', time: '5 hours ago' },
                      { user: 'Alex Rodriguez', action: 'commented on', task: 'Copy & Content', time: '1 day ago' },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {activity.user.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.user}</span> {activity.action} <span className="font-medium">{activity.task}</span>
                          </p>
                          <p className="text-xs text-gray-600 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Period View Tab */}
        <TabsContent value="periodview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                {planPeriod === 'monthly' ? 'Monthly — Weekly Allocation View'
                  : planPeriod === 'quarterly' ? 'Quarterly — Monthly Capacity View'
                  : 'Annual — Quarterly Rollup'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {periodData.resources.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No resources assigned to tasks yet.</p>
              ) : (
                <>
                  {/* Summary Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="py-2.5 px-3 text-left font-semibold text-gray-700">Resource</th>
                          <th className="py-2.5 px-3 text-left font-semibold text-gray-700">Role</th>
                          {periodData.columns.map(col => (
                            <th key={col} className="py-2.5 px-3 text-center font-semibold text-gray-700">{col}</th>
                          ))}
                          <th className="py-2.5 px-3 text-right font-semibold text-gray-700">Total Hrs</th>
                          <th className="py-2.5 px-3 text-right font-semibold text-gray-700">Est. Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {periodData.rows.map((row, ri) => {
                          const totalHrs = row.allocs.reduce((s, h) => s + h, 0);
                          const totalCost = totalHrs * row.resource.rate;
                          return (
                            <tr key={ri} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-2 px-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ backgroundColor: CHART_COLORS[ri % CHART_COLORS.length] }}>
                                    {row.resource.avatar}
                                  </div>
                                  <span className="font-medium text-gray-900">{row.resource.name}</span>
                                </div>
                              </td>
                              <td className="py-2 px-3 text-xs text-gray-600">{row.resource.role}</td>
                              {row.allocs.map((hrs, ci) => (
                                <td key={ci} className="py-2 px-3 text-center text-sm font-medium">{hrs}h</td>
                              ))}
                              <td className="py-2 px-3 text-right font-semibold text-gray-900">{totalHrs}h</td>
                              <td className="py-2 px-3 text-right font-semibold text-blue-700">${totalCost.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 border-t-2 border-gray-300 font-semibold text-gray-700">
                          <td className="py-2 px-3">Totals</td>
                          <td className="py-2 px-3 text-xs text-gray-500">{periodData.resources.length} resources</td>
                          {periodData.columns.map((_, ci) => {
                            const colTotal = periodData.rows.reduce((s, r) => s + r.allocs[ci], 0);
                            return <td key={ci} className="py-2 px-3 text-center">{colTotal}h</td>;
                          })}
                          <td className="py-2 px-3 text-right">
                            {periodData.rows.reduce((s, r) => s + r.allocs.reduce((a, h) => a + h, 0), 0)}h
                          </td>
                          <td className="py-2 px-3 text-right text-blue-700">
                            ${periodData.rows.reduce((s, r) => {
                              const hrs = r.allocs.reduce((a, h) => a + h, 0);
                              return s + hrs * r.resource.rate;
                            }, 0).toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Bar Chart */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 text-sm">Hours per Resource by {planPeriod === 'monthly' ? 'Week' : planPeriod === 'quarterly' ? 'Month' : 'Quarter'}</h4>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={periodData.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis tickFormatter={(v: number) => `${v}h`} />
                        <Tooltip formatter={(v: number) => `${v}h`} />
                        {periodData.resources.map((res, i) => (
                          <Bar
                            key={res.id}
                            dataKey={res.name}
                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                            name={res.name}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Context note */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                    {planPeriod === 'monthly' && 'Monthly view shows weekly hour allocations per resource across 4 weeks. Derived from task hoursPerWeek assignments.'}
                    {planPeriod === 'quarterly' && 'Quarterly view shows month-by-month resource capacity for Q1 (Jan–Mar). Switch period using the selector above.'}
                    {planPeriod === 'annual' && 'Annual view shows quarterly rollups (Q1–Q4) for each assigned resource across the project lifecycle.'}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Create a new task in the project timeline</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Task Name</Label>
              <Input placeholder="Enter task name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" />
              </div>
            </div>
            <div>
              <Label>Budget</Label>
              <Input type="number" placeholder="0" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success('Task created');
              setShowTaskDialog(false);
            }}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
