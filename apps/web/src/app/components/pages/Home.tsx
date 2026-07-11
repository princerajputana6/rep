import { useState, useEffect, type ComponentType } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CreditCard,
  Building2,
  Handshake,
  UserCircle,
  FolderKanban,
  TrendingUp,
  ArrowLeftRight,
  DollarSign,
  Eye,
  FileText,
  Plug,
  ClipboardCheck,
  Settings,
  Plus,
  X,
  Grid3x3,
  BarChart3,
  Activity,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Grip,
  Brain,
  Bell,
  Zap,
  CheckSquare,
  Target,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Page } from '@/app/App';

interface HomeProps {
  onPageChange: (page: Page) => void;
}

interface Widget {
  id: string;
  type: 'stats' | 'chart' | 'list' | 'quick-actions' | 'ai-insights' | 'predictive' | 'notifications' | 'projects' | 'approvals' | 'borrow-requests' | 'ai-matching' | 'staffing' | 'kpi';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: number;
  collapsed?: boolean;
}

const defaultWidgets: Widget[] = [
  { id: 'w1', type: 'stats', title: 'Quick Statistics', size: 'large', position: 0 },
  { id: 'w2', type: 'projects', title: 'Active Projects', size: 'medium', position: 1 },
  { id: 'w3', type: 'approvals', title: 'Pending Approvals', size: 'medium', position: 2 },
  { id: 'w4', type: 'ai-matching', title: 'AI Match Suggestions', size: 'medium', position: 3 },
  { id: 'w5', type: 'borrow-requests', title: 'Borrow Requests', size: 'medium', position: 4 },
  { id: 'w6', type: 'chart', title: 'Utilization Trends', size: 'medium', position: 5 },
];

interface HomeData {
  kpis: {
    totalResources: number;
    activeAgencies: number;
    avgUtilization: number;
    pendingApprovals: number;
  };
  projects: Array<{ _id: string; name: string; status?: string; healthScore?: number; budgetBurnPct?: number }>;
  approvals: Array<{ _id: string; resourceName?: string; projectName?: string; requestedRole?: string; status?: string }>;
  borrowRequests: Array<{ _id: string; resourceName?: string; requestingTeam?: string; status?: string }>;
}

const EMPTY_DATA: HomeData = {
  kpis: { totalResources: 0, activeAgencies: 0, avgUtilization: 0, pendingApprovals: 0 },
  projects: [],
  approvals: [],
  borrowRequests: [],
};

function WidgetEmpty({
  icon: Icon, label, hint, action, onAction,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Icon className="w-8 h-8 text-muted-foreground/40" />
      <p className="mt-3 text-sm font-medium text-muted-foreground">{label}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground/70 max-w-xs">{hint}</p>}
      {action && onAction && (
        <Button size="sm" variant="outline" className="mt-3" onClick={onAction}>{action}</Button>
      )}
    </div>
  );
}

export function Home({ onPageChange }: HomeProps) {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [data, setData] = useState<HomeData>(EMPTY_DATA);

  // Real data for the home widgets. Everything falls back to empty so a brand-new
  // company shows genuine zeros / empty states instead of sample content.
  useEffect(() => {
    let active = true;
    async function load() {
      const safe = async <T,>(p: string, fallback: T): Promise<T> => {
        try {
          const res = await fetch(`/api/v1/${p}`);
          if (!res.ok) return fallback;
          const json = await res.json();
          return (json?.data ?? fallback) as T;
        } catch {
          return fallback;
        }
      };
      const [analytics, agencies, approvals, borrow] = await Promise.all([
        safe<{ kpis?: Record<string, number>; recentProjects?: HomeData['projects'] }>('analytics', {}),
        safe<unknown[]>('agencies', []),
        safe<HomeData['approvals']>('resource-approvals?status=PENDING', []),
        safe<HomeData['borrowRequests']>('borrow-requests?status=PENDING', []),
      ]);
      if (!active) return;
      const k = analytics.kpis ?? {};
      setData({
        kpis: {
          totalResources: k.totalResources ?? 0,
          activeAgencies: Array.isArray(agencies) ? agencies.length : 0,
          avgUtilization: k.avgUtilization ?? 0,
          pendingApprovals: (Array.isArray(approvals) ? approvals.length : 0) || (k.pendingApprovals ?? 0),
        },
        projects: analytics.recentProjects ?? [],
        approvals: Array.isArray(approvals) ? approvals : [],
        borrowRequests: Array.isArray(borrow) ? borrow : [],
      });
    }
    load();
    return () => { active = false; };
  }, []);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let initial = defaultWidgets;
    const saved = localStorage.getItem('rep_home_widgets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only honour a non-empty saved layout; an empty array falls back to defaults.
        if (Array.isArray(parsed) && parsed.length) initial = parsed;
      } catch {
        /* keep defaults */
      }
    }
    setWidgets(initial);
    setHydrated(true);
  }, []);

  // Persist only after hydration so the initial empty state can't clobber the saved layout.
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('rep_home_widgets', JSON.stringify(widgets));
  }, [widgets, hydrated]);

  const handleAddWidget = (type: Widget['type']) => {
    const newWidget: Widget = {
      id: `w${Date.now()}`,
      type,
      title: getWidgetTitle(type),
      size: 'medium',
      position: widgets.length,
    };
    setWidgets([...widgets, newWidget]);
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const handleToggleCollapse = (id: string) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, collapsed: !w.collapsed } : w));
  };

  const getWidgetTitle = (type: Widget['type']) => {
    switch (type) {
      case 'stats': return 'Statistics';
      case 'chart': return 'Chart';
      case 'list': return 'Activity List';
      case 'quick-actions': return 'Quick Actions';
      case 'ai-insights': return 'AI Insights';
      case 'predictive': return 'Predictive Alerts';
      case 'notifications': return 'Live Notifications';
      case 'projects': return 'Active Projects';
      case 'approvals': return 'Pending Approvals';
      case 'borrow-requests': return 'Borrow Requests';
      case 'ai-matching': return 'AI Match Suggestions';
      case 'staffing': return 'Staffing Overview';
      case 'kpi': return 'KPI Snapshot';
      default: return 'Widget';
    }
  };

  const getWidgetIcon = (type: Widget['type']) => {
    switch (type) {
      case 'stats': return BarChart3;
      case 'chart': return Activity;
      case 'list': return Clock;
      case 'quick-actions': return Grid3x3;
      case 'ai-insights': return Brain;
      case 'predictive': return TrendingUp;
      case 'notifications': return Bell;
      case 'projects': return FolderKanban;
      case 'approvals': return ClipboardCheck;
      case 'borrow-requests': return ArrowLeftRight;
      case 'ai-matching': return Brain;
      case 'staffing': return Users;
      case 'kpi': return BarChart3;
      default: return LayoutDashboard;
    }
  };

  const handleDragStart = (widgetId: string) => {
    setDraggedWidget(widgetId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedWidget || draggedWidget === targetId) return;

    const draggedIndex = widgets.findIndex(w => w.id === draggedWidget);
    const targetIndex = widgets.findIndex(w => w.id === targetId);

    const newWidgets = [...widgets];
    const [removed] = newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(targetIndex, 0, removed);

    setWidgets(newWidgets.map((w, i) => ({ ...w, position: i })));
    setDraggedWidget(null);
  };

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    amber: 'bg-amber-500 hover:bg-amber-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    indigo: 'bg-primary hover:bg-primary',
    green: 'bg-green-500 hover:bg-green-600',
    emerald: 'bg-emerald-500 hover:bg-emerald-600',
    cyan: 'bg-cyan-500 hover:bg-cyan-600',
    teal: 'bg-teal-500 hover:bg-teal-600',
    violet: 'bg-primary hover:bg-primary',
    pink: 'bg-pink-500 hover:bg-pink-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
    gray: 'bg-gray-500 hover:bg-gray-600',
    slate: 'bg-slate-500 hover:bg-slate-600',
    rose: 'bg-rose-500 hover:bg-rose-600',
    zinc: 'bg-zinc-500 hover:bg-zinc-600',
    red: 'bg-red-500 hover:bg-red-600',
  };

  const renderWidget = (widget: Widget) => {
    const Icon = getWidgetIcon(widget.type);

    switch (widget.type) {
      case 'stats':
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Total Resources</div>
              <div className="text-2xl font-semibold text-blue-900 mt-2">{data.kpis.totalResources.toLocaleString()}</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Active Agencies</div>
              <div className="text-2xl font-semibold text-green-900 mt-2">{data.kpis.activeAgencies}</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">Utilization</div>
              <div className="text-2xl font-semibold text-purple-900 mt-2">{data.kpis.avgUtilization}%</div>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <div className="text-sm text-amber-600 font-medium">Pending Approvals</div>
              <div className="text-2xl font-semibold text-amber-900 mt-2">{data.kpis.pendingApprovals}</div>
              {data.kpis.pendingApprovals > 0 && <div className="text-xs text-amber-600 mt-1">Require action</div>}
            </div>
          </div>
        );

      case 'chart':
        const chartData = [
          { month: 'Aug', value: 75 },
          { month: 'Sep', value: 78 },
          { month: 'Oct', value: 82 },
          { month: 'Nov', value: 76 },
          { month: 'Dec', value: 79 },
          { month: 'Jan', value: 81 },
        ];
        return (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'list':
        return (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Resource Approved</p>
                <p className="text-xs text-gray-600">Sarah Mitchell approved for Digital Transformation</p>
                <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Borrow Request Pending</p>
                <p className="text-xs text-gray-600">New request from TechVentures for Data Engineer</p>
                <p className="text-xs text-gray-500 mt-1">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Contract Expiring Soon</p>
                <p className="text-xs text-gray-600">Digital Wave tie-up expires in 15 days</p>
                <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
              </div>
            </div>
          </div>
        );

      case 'quick-actions':
        return (
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onPageChange('resource-approvals')}
            >
              <ClipboardCheck className="w-6 h-6 text-amber-600" />
              <span className="text-sm font-medium">Review Approvals</span>
              <Badge className="bg-amber-500">3</Badge>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onPageChange('borrow-requests')}
            >
              <ArrowLeftRight className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Borrow Requests</span>
              <Badge className="bg-primary">12</Badge>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onPageChange('projects')}
            >
              <FolderKanban className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-medium">View Projects</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onPageChange('financials')}
            >
              <DollarSign className="w-6 h-6 text-emerald-600" />
              <span className="text-sm font-medium">Financials</span>
            </Button>
          </div>
        );

      case 'ai-insights':
        return (
          <div className="space-y-3">
            <div className="p-3 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg">
              <div className="flex items-start gap-2">
                <Brain className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-purple-900">AI Match Available</p>
                  <p className="text-xs text-purple-700 mt-1">3 high-confidence matches found for Project Alpha</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-900">Optimization Success</p>
                  <p className="text-xs text-green-700 mt-1">Resource allocation improved by 12%</p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full gap-2" size="sm">
              <Brain className="w-4 h-4" />
              View All AI Insights
            </Button>
          </div>
        );

      case 'predictive':
        return (
          <div className="space-y-3">
            <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Critical: DevOps Shortage</p>
                  <p className="text-xs text-red-700 mt-1">10% capacity shortfall predicted by May 2025</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Frontend Demand Rising</p>
                  <p className="text-xs text-amber-700 mt-1">+10% utilization expected next quarter</p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full gap-2" size="sm">
              <TrendingUp className="w-4 h-4" />
              View Forecast Details
            </Button>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Approval Required</p>
                  <p className="text-xs text-gray-600">Sarah Mitchell for Digital Transformation</p>
                </div>
              </div>
              <Badge className="bg-amber-500">New</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Capacity Resolved</p>
                  <p className="text-xs text-gray-600">DevOps capacity increased to 95%</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">3 unread notifications</span>
              <Button variant="link" size="sm" className="h-auto p-0" onClick={() => onPageChange('notifications')}>
                View All
              </Button>
            </div>
          </div>
        );

      case 'projects':
        if (data.projects.length === 0) return <WidgetEmpty icon={FolderKanban} label="No active projects yet" action="Create a project" onAction={() => onPageChange('projects')} />;
        return (
          <div className="space-y-3">
            {data.projects.slice(0, 4).map((p) => (
              <div key={p._id} className="flex items-center justify-between p-3 bg-muted rounded-lg border-l-4 border-primary">
                <div>
                  <p className="font-medium text-gray-900">{p.name}</p>
                  {typeof p.budgetBurnPct === 'number' && (
                    <p className="text-xs text-gray-600 mt-1">{p.budgetBurnPct}% budget burn</p>
                  )}
                </div>
                <Badge className="bg-green-500">{(p.status ?? 'ACTIVE').replace('_', ' ')}</Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full" size="sm" onClick={() => onPageChange('projects')}>
              View All Projects
            </Button>
          </div>
        );

      case 'approvals':
        if (data.approvals.length === 0) return <WidgetEmpty icon={ClipboardCheck} label="No pending approvals" />;
        return (
          <div className="space-y-3">
            {data.approvals.slice(0, 4).map((a) => (
              <div key={a._id} className="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">{a.resourceName ?? 'Resource'}</p>
                  <Badge className="bg-amber-500">{a.status ?? 'Pending'}</Badge>
                </div>
                <p className="text-xs text-gray-600">{[a.projectName, a.requestedRole].filter(Boolean).join(' • ')}</p>
              </div>
            ))}
            <Button variant="outline" className="w-full" size="sm" onClick={() => onPageChange('resource-approvals')}>
              View All Approvals ({data.approvals.length})
            </Button>
          </div>
        );

      case 'borrow-requests':
        if (data.borrowRequests.length === 0) return <WidgetEmpty icon={ArrowLeftRight} label="No borrow requests" />;
        return (
          <div className="space-y-3">
            {data.borrowRequests.slice(0, 4).map((b) => (
              <div key={b._id} className="p-3 bg-accent rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{b.resourceName ?? b.requestingTeam ?? 'Request'}</p>
                    {b.requestingTeam && <p className="text-xs text-gray-600">{b.requestingTeam}</p>}
                  </div>
                  <Badge className="bg-primary">{b.status ?? 'Pending'}</Badge>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" size="sm" onClick={() => onPageChange('borrow-requests')}>
              View All Requests ({data.borrowRequests.length})
            </Button>
          </div>
        );

      case 'ai-matching':
        return <WidgetEmpty icon={Brain} label="No AI match suggestions yet" hint="Suggestions appear as you add projects and resources" />;

      case 'staffing':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-600 font-medium">Team Size</div>
                <div className="text-xl font-semibold text-blue-900 mt-1">45</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-xs text-green-600 font-medium">Utilization</div>
                <div className="text-xl font-semibold text-green-900 mt-1">82.5%</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <div className="text-xs text-amber-600 font-medium">Overallocated</div>
                <div className="text-xl font-semibold text-amber-900 mt-1">2</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-xs text-purple-600 font-medium">Available</div>
                <div className="text-xl font-semibold text-purple-900 mt-1">125h</div>
              </div>
            </div>
            <Button variant="outline" className="w-full" size="sm" onClick={() => onPageChange('staffing-planner')}>
              Open Staffing Planner
            </Button>
          </div>
        );

      case 'kpi':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-600 font-medium">Budget</div>
                <div className="text-lg font-semibold text-blue-900 mt-1">$778K</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-xs text-green-600 font-medium">Earned Value</div>
                <div className="text-lg font-semibold text-green-900 mt-1">$783K</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-xs text-purple-600 font-medium">CPI</div>
                <div className="text-lg font-semibold text-purple-900 mt-1">1.02</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <div className="text-xs text-amber-600 font-medium">SPI</div>
                <div className="text-lg font-semibold text-amber-900 mt-1">1.01</div>
              </div>
            </div>
            <Button variant="outline" className="w-full" size="sm" onClick={() => onPageChange('time-phased-kpi')}>
              View Full KPI Report
            </Button>
          </div>
        );

      default:
        return <div className="text-center text-gray-500">Widget content</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">My Home</h1>
          <p className="text-gray-600 mt-1">Customize your workspace with widgets and quick access</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Widget
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Add Widget</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleAddWidget('stats')}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Statistics Cards
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddWidget('chart')}>
                <Activity className="w-4 h-4 mr-2" />
                Chart Widget
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddWidget('list')}>
                <Clock className="w-4 h-4 mr-2" />
                Activity List
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddWidget('quick-actions')}>
                <Grid3x3 className="w-4 h-4 mr-2" />
                Quick Actions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddWidget('ai-insights')}>
                <Brain className="w-4 h-4 mr-2" />
                AI Insights
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddWidget('predictive')}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Predictive Alerts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddWidget('notifications')}>
                <Bell className="w-4 h-4 mr-2" />
                Live Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleAddWidget('projects')}>
                <FolderKanban className="w-4 h-4 mr-2" />
                Active Projects
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddWidget('approvals')}>
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Pending Approvals
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddWidget('borrow-requests')}>
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Borrow Requests
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddWidget('ai-matching')}>
                <Brain className="w-4 h-4 mr-2" />
                AI Match Suggestions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddWidget('staffing')}>
                <Users className="w-4 h-4 mr-2" />
                Staffing Overview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddWidget('kpi')}>
                <BarChart3 className="w-4 h-4 mr-2" />
                KPI Snapshot
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Widgets Grid */}
      {widgets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <LayoutDashboard className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Widgets Added</h3>
            <p className="text-gray-600 mb-4 text-center max-w-md">
              Start customizing your home by adding widgets. Click the "Add Widget" button to get started.
            </p>
            <Button onClick={() => onPageChange('projects')} className="gap-2">
              <Plus className="w-4 h-4" />
              Go To Projects
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {widgets.map((widget) => {
            const Icon = getWidgetIcon(widget.type);
            return (
              <Card
                key={widget.id}
                draggable
                onDragStart={() => handleDragStart(widget.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(widget.id)}
                className={`cursor-move ${widget.size === 'large' ? 'lg:col-span-2' : ''} ${
                  draggedWidget === widget.id ? 'opacity-50' : ''
                }`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center gap-2">
                    <Grip className="w-4 h-4 text-gray-400" />
                    <Icon className="w-5 h-5 text-gray-600" />
                    <CardTitle className="text-base">{widget.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleCollapse(widget.id)}
                      className="h-8 w-8 p-0"
                      title={widget.collapsed ? 'Expand widget' : 'Collapse widget'}
                    >
                      {widget.collapsed
                        ? <ChevronDown className="w-4 h-4" />
                        : <ChevronUp className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveWidget(widget.id)}
                      className="h-8 w-8 p-0"
                      title="Remove widget"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                {!widget.collapsed && <CardContent>{renderWidget(widget)}</CardContent>}
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Grid3x3 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-blue-900">Customizable Home Page</div>
              <div className="text-sm text-blue-700 mt-1">
                Drag and drop widgets to reorder them. Add or remove widgets using the "Add Widget" button.
                Use the Main Menu for quick access to all platform features.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
