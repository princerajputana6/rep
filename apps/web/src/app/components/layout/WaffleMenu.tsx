import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Separator } from '@/app/components/ui/separator';
import { Grid3x3, Search, Star } from 'lucide-react';
import type { Page } from '@/app/App';
import { SIDEBAR_MENU_SECTIONS } from '@/app/components/layout/Sidebar';

interface WaffleMenuProps {
  currentPage?: Page;
  onPageChange?: (page: Page) => void;
}

interface AppItem {
  id: Page;
  label: string;
  description: string;
  icon: any;
  category: string;
  color: string;
  badge?: string | number;
  featured?: boolean;
}

const descriptionById: Partial<Record<Page, string>> = {
  home: 'Customizable widgets',
  dashboard: 'Executive overview',
  notifications: 'Real-time updates',
  portfolio: 'Portfolio governance',
  program: 'Program management',
  projects: 'Project management',
  tasks: 'Task tracking',
  assignments: 'Resource assignments',
  timesheets: 'Time logging',
  'staffing-planner': 'Plan team staffing',
  'enhanced-staffing': 'Advanced staffing workflows',
  capacity: 'Resource allocation',
  'borrow-requests': 'Resource borrowing',
  'resource-approvals': 'Review & approve resources',
  agencies: 'Partner agencies',
  'sub-agencies': 'Sub-agency management',
  'tie-ups': 'Partnership agreements',
  'resource-pools': 'Talent management',
  financials: 'Revenue & margins',
  'budget-alerts': 'Track overspend risk',
  'time-phased-kpi': 'Time-phased KPI tracking',
  'kpi-details': 'KPI drill-down details',
  'client-profitability': 'Client margin intelligence',
  'client-master': 'Client and mapping governance',
  'campaign-mapper': 'Campaign to resource mapping',
  'hidden-capacity': 'Discover hidden capacity',
  'industry-standard-hidden-capacity': 'Industry standard hidden capacity',
  'ai-matching': 'ML-powered matching',
  'predictive-planning': 'Capacity forecasting',
  'ai-copilot': 'Copilot for planning and ops',
  'advanced-analytics': 'Advanced analytics workspace',
  users: 'Manage team members',
  'job-roles': 'Define role structures',
  'rate-cards': 'Pricing and billing rates',
  'access-rules': 'Role-based access control',
  'ui-customization': 'Branding and layout settings',
  'api-config': 'API keys and credentials',
  'webhook-management': 'Manage webhook endpoints',
  integrations: 'Connect external tools',
  'integration-marketplace': 'Browse integration marketplace',
  'audit-logs': 'Compliance tracking',
  settings: 'Platform settings',
  gamification: 'Rewards and engagement',
  'recycle-bin': 'Restore deleted records',
};

const colorByCategory: Record<string, string> = {
  Overview: 'blue',
  Operations: 'indigo',
  Network: 'teal',
  Resources: 'violet',
  'Finance & Reports': 'emerald',
  Intelligence: 'purple',
  Administration: 'slate',
};

const featuredIds: Set<Page> = new Set([
  'home',
  'dashboard',
  'portfolio',
  'program',
  'projects',
  'resource-approvals',
  'staffing-planner',
  'financials',
  'ai-matching',
  'predictive-planning',
  'advanced-analytics',
]);

const apps: AppItem[] = SIDEBAR_MENU_SECTIONS.flatMap((section) =>
  section.items.map((item) => ({
    id: item.id,
    label: item.label,
    description: descriptionById[item.id] ?? `${item.label} module`,
    icon: item.icon,
    category: section.label,
    color: colorByCategory[section.label] ?? 'blue',
    badge: item.badge,
    featured: featuredIds.has(item.id),
  }))
);

const colorClasses: Record<string, { bg: string; text: string; hover: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', hover: 'hover:bg-blue-200' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-700', hover: 'hover:bg-amber-200' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', hover: 'hover:bg-purple-200' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', hover: 'hover:bg-indigo-200' },
  green: { bg: 'bg-green-100', text: 'text-green-700', hover: 'hover:bg-green-200' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', hover: 'hover:bg-emerald-200' },
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-700', hover: 'hover:bg-cyan-200' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-700', hover: 'hover:bg-teal-200' },
  violet: { bg: 'bg-violet-100', text: 'text-violet-700', hover: 'hover:bg-violet-200' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-700', hover: 'hover:bg-pink-200' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', hover: 'hover:bg-orange-200' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-700', hover: 'hover:bg-gray-200' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-700', hover: 'hover:bg-slate-200' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-700', hover: 'hover:bg-rose-200' },
  zinc: { bg: 'bg-zinc-100', text: 'text-zinc-700', hover: 'hover:bg-zinc-200' },
  red: { bg: 'bg-red-100', text: 'text-red-700', hover: 'hover:bg-red-200' },
};

export function WaffleMenu({ currentPage, onPageChange }: WaffleMenuProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'featured'>('featured');

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      searchQuery === '' ||
      app.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesView = viewMode === 'all' || app.featured;
    
    return matchesSearch && matchesView;
  });

  const handleAppClick = (appId: Page) => {
    if (!onPageChange) return;
    onPageChange(appId);
    setOpen(false);
    setSearchQuery('');
  };

  const groupedApps = filteredApps.reduce((acc, app) => {
    if (!acc[app.category]) {
      acc[app.category] = [];
    }
    acc[app.category].push(app);
    return acc;
  }, {} as Record<string, AppItem[]>);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="p-2"
          disabled={!onPageChange}
        >
          <Grid3x3 className="w-5 h-5 text-gray-600" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[600px] p-0" align="end">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">REP Platform Apps</h3>
              <p className="text-sm text-gray-600">
                Quick access to all features and tools
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {apps.length} Apps
            </Badge>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'featured' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('featured')}
              className="flex-1"
            >
              <Star className="w-4 h-4 mr-2" />
              Featured
            </Button>
            <Button
              variant={viewMode === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('all')}
              className="flex-1"
            >
              <Grid3x3 className="w-4 h-4 mr-2" />
              All Apps
            </Button>
          </div>

          <Separator />

          {/* Apps Grid */}
          <div className="max-h-[500px] overflow-y-auto pr-2">
            {searchQuery === '' && viewMode === 'featured' ? (
              // Featured apps in grid layout
              <div className="grid grid-cols-3 gap-3">
                {filteredApps.map((app) => {
                  const Icon = app.icon;
                  const colors = colorClasses[app.color] || colorClasses.blue;
                  const isActive = currentPage === app.id;

                  return (
                    <button
                      key={app.id}
                      onClick={() => handleAppClick(app.id)}
                      className={`relative group p-4 rounded-lg border-2 transition-all ${
                        isActive
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div
                          className={`p-3 rounded-lg ${colors.bg} ${colors.hover} transition-colors`}
                        >
                          <Icon className={`w-6 h-6 ${colors.text}`} />
                        </div>
                        <div className="space-y-1">
                          <div className="font-medium text-sm text-gray-900 line-clamp-1">
                            {app.label}
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-2">
                            {app.description}
                          </div>
                        </div>
                      </div>
                      {app.badge && (
                        <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs px-1.5">
                          {app.badge}
                        </Badge>
                      )}
                      {isActive && (
                        <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              // All apps grouped by category
              <div className="space-y-6">
                {Object.entries(groupedApps).map(([category, categoryApps]) => (
                  <div key={category}>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      {category}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {categoryApps.map((app) => {
                        const Icon = app.icon;
                        const colors = colorClasses[app.color] || colorClasses.blue;
                        const isActive = currentPage === app.id;

                        return (
                          <button
                            key={app.id}
                            onClick={() => handleAppClick(app.id)}
                            className={`relative flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                              isActive
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            }`}
                          >
                            <div
                              className={`p-2 rounded-lg ${colors.bg} flex-shrink-0`}
                            >
                              <Icon className={`w-5 h-5 ${colors.text}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-gray-900 truncate">
                                {app.label}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {app.description}
                              </div>
                            </div>
                            {app.badge && (
                              <Badge className="bg-red-500 text-white text-xs px-1.5 flex-shrink-0">
                                {app.badge}
                              </Badge>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredApps.length === 0 && (
              <div className="text-center py-12">
                <Grid3x3 className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 font-medium">No apps found</p>
                <p className="text-sm text-gray-500 mt-1">
                  Try adjusting your search query
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">⌘K</kbd> for quick navigation</span>
            <button
              onClick={() => onPageChange('settings')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Customize Apps
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
