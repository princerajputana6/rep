import { useState, useEffect } from 'react';
import type { MouseEvent } from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CreditCard,
  Building2,
  Handshake,
  UserCircle,
  FolderKanban,
  ListChecks,
  TrendingUp,
  ArrowLeftRight,
  DollarSign,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  Settings,
  ChevronDown,
  ChevronUp,
  Plug,
  ClipboardCheck,
  Home,
  Brain,
  Bell,
  Zap,
  Calendar,
  BarChart3,
  Star,
  Clock,
  Badge as BadgeIcon,
  Target,
  Rocket,
  Palette,
  Key,
  Webhook,
  Trash2,
  Workflow,
  AlertTriangle,
  ShieldCheck,
  Network,
  Layers,
} from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import type { Page } from '@/app/App';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export interface MenuItem {
  id: Page;
  label: string;
  icon: any;
  badge?: number | string;
  badgeVariant?: 'default' | 'warning' | 'success';
}

export interface MenuSection {
  id: string;
  label: string;
  items: MenuItem[];
  collapsible: boolean;
}

const allMenuItems: Record<Page, MenuItem> = {
  'home': { id: 'home' as Page, label: 'Home', icon: Home },
  'dashboard': { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  'notifications': { id: 'notifications' as Page, label: 'Notifications', icon: Bell },
  'agencies': { id: 'agencies' as Page, label: 'Agency Network', icon: Building2 },
  'sub-agencies': { id: 'sub-agencies' as Page, label: 'Sub-Agencies', icon: Building2 },
  'tie-ups': { id: 'tie-ups' as Page, label: 'Tie-Ups', icon: Handshake },
  'resource-pools': { id: 'resource-pools' as Page, label: 'Resource Pools', icon: UserCircle },
  'portfolio': { id: 'portfolio' as Page, label: 'Portfolios', icon: Network },
  'program':   { id: 'program'   as Page, label: 'Programs',   icon: Layers },
  'projects': { id: 'projects' as Page, label: 'Projects', icon: FolderKanban },
  'tasks': { id: 'tasks' as Page, label: 'Tasks', icon: ListChecks },
  'assignments': { id: 'assignments' as Page, label: 'Assignments', icon: ClipboardCheck },
  'timesheets': { id: 'timesheets' as Page, label: 'Timesheets', icon: Clock },
  'staffing-planner': { id: 'staffing-planner' as Page, label: 'Staffing Planner', icon: Calendar },
  'capacity': { id: 'capacity' as Page, label: 'Capacity', icon: TrendingUp },
  'borrow-requests': { id: 'borrow-requests' as Page, label: 'Borrow Requests', icon: ArrowLeftRight, badge: 12, badgeVariant: 'default' },
  'resource-approvals': { id: 'resource-approvals' as Page, label: 'Approvals', icon: ClipboardCheck, badge: 3, badgeVariant: 'warning' },
  'financials': { id: 'financials' as Page, label: 'Financials', icon: DollarSign },
  'time-phased-kpi': { id: 'time-phased-kpi' as Page, label: 'KPI Reports', icon: BarChart3 },
  'kpi-details': { id: 'kpi-details' as Page, label: 'KPI Details', icon: Target },
  'client-profitability': { id: 'client-profitability' as Page, label: 'Client Profitability', icon: Target },
  'client-master': { id: 'client-master' as Page, label: 'Client Master', icon: Building2 },
  'campaign-mapper': { id: 'campaign-mapper' as Page, label: 'Campaign Mapper', icon: Rocket },
  'hidden-capacity': { id: 'hidden-capacity' as Page, label: 'Hidden Capacity', icon: Eye },
  'industry-standard-hidden-capacity': { id: 'industry-standard-hidden-capacity' as Page, label: 'Capacity Radar Pro', icon: Eye, badge: 'NEW' as any },
  'ai-matching': { id: 'ai-matching' as Page, label: 'AI Matching', icon: Brain },
  'predictive-planning': { id: 'predictive-planning' as Page, label: 'Predictive Planning', icon: TrendingUp },
  'ai-copilot': { id: 'ai-copilot' as Page, label: 'AI Co-Pilot', icon: Brain },
  'integrations': { id: 'integrations' as Page, label: 'Integrations', icon: Plug },
  'integration-marketplace': { id: 'integration-marketplace' as Page, label: 'Marketplace', icon: Plug },
  'audit-logs': { id: 'audit-logs' as Page, label: 'Audit Logs', icon: FileText },
  'users': { id: 'users' as Page, label: 'Users', icon: Users },
  'job-roles': { id: 'job-roles' as Page, label: 'Job Roles', icon: Briefcase },
  'rate-cards': { id: 'rate-cards' as Page, label: 'Rate Cards', icon: CreditCard },
  'ui-customization': { id: 'ui-customization' as Page, label: 'UI Customization', icon: Palette },
  'api-config': { id: 'api-config' as Page, label: 'API Config', icon: Key },
  'webhook-management': { id: 'webhook-management' as Page, label: 'Webhooks', icon: Webhook },
  'recycle-bin': { id: 'recycle-bin' as Page, label: 'Recycle Bin', icon: Trash2 },
  'gamification': { id: 'gamification' as Page, label: 'Achievements', icon: Star },
  'advanced-analytics': { id: 'advanced-analytics' as Page, label: 'Analytics', icon: BarChart3 },
  'settings': { id: 'settings' as Page, label: 'Settings', icon: Settings },
  'budget-alerts': { id: 'budget-alerts' as Page, label: 'Budget Alerts', icon: AlertTriangle, badge: 3, badgeVariant: 'warning' },
  'enhanced-staffing': { id: 'enhanced-staffing' as Page, label: 'Enhanced Staffing', icon: Workflow },
  'access-rules': { id: 'access-rules' as Page, label: 'Access Rules', icon: ShieldCheck },
  'profile': { id: 'profile' as Page, label: 'Profile', icon: UserCircle },
};

export const SIDEBAR_MENU_SECTIONS: MenuSection[] = [
  {
    id: 'main',
    label: 'Overview',
    collapsible: false,
    items: [
      { id: 'home' as Page, label: 'Home', icon: Home },
      { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
      { id: 'notifications' as Page, label: 'Notifications', icon: Bell },
    ]
  },
  {
    id: 'operations',
    label: 'Operations',
    collapsible: true,
    items: [
      { id: 'portfolio' as Page, label: 'Portfolios', icon: Network },
      { id: 'program'   as Page, label: 'Programs',   icon: Layers },
      { id: 'projects' as Page, label: 'Projects', icon: FolderKanban },
      { id: 'tasks' as Page, label: 'Tasks', icon: ListChecks },
      { id: 'assignments' as Page, label: 'Assignments', icon: ClipboardCheck },
      { id: 'timesheets' as Page, label: 'Timesheets', icon: Clock },
      { id: 'staffing-planner' as Page, label: 'Staffing Planner', icon: Calendar },
      { id: 'enhanced-staffing' as Page, label: 'Enhanced Staffing', icon: Workflow },
      { id: 'capacity' as Page, label: 'Capacity', icon: TrendingUp },
      { id: 'borrow-requests' as Page, label: 'Borrow Requests', icon: ArrowLeftRight, badge: 12 },
      { id: 'resource-approvals' as Page, label: 'Approvals', icon: ClipboardCheck, badge: 3, badgeVariant: 'warning' },
    ]
  },
  {
    id: 'network',
    label: 'Network',
    collapsible: true,
    items: [
      { id: 'agencies' as Page, label: 'Agencies', icon: Building2 },
      { id: 'sub-agencies' as Page, label: 'Sub-Agencies', icon: Building2 },
      { id: 'tie-ups' as Page, label: 'Tie-Ups', icon: Handshake },
    ]
  },
  {
    id: 'resources',
    label: 'Resources',
    collapsible: true,
    items: [
      { id: 'resource-pools' as Page, label: 'Resource Pools', icon: UserCircle },
    ]
  },
  {
    id: 'finance',
    label: 'Finance & Reports',
    collapsible: true,
    items: [
      { id: 'financials' as Page, label: 'Financials', icon: DollarSign },
      { id: 'budget-alerts' as Page, label: 'Budget Alerts', icon: AlertTriangle, badge: 3, badgeVariant: 'warning' },
      { id: 'time-phased-kpi' as Page, label: 'KPI Reports', icon: BarChart3 },
      { id: 'kpi-details' as Page, label: 'KPI Details', icon: Target },
      { id: 'client-profitability' as Page, label: 'Client Profitability', icon: Target },
      { id: 'client-master' as Page, label: 'Client Master', icon: Building2 },
      { id: 'campaign-mapper' as Page, label: 'Campaign Mapper', icon: Rocket },
    ]
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    collapsible: true,
    items: [
      { id: 'hidden-capacity' as Page, label: 'Hidden Capacity', icon: Eye },
      { id: 'industry-standard-hidden-capacity' as Page, label: 'Capacity Radar Pro', icon: Eye, badge: 'NEW' as any },
      { id: 'ai-matching' as Page, label: 'AI Matching', icon: Brain },
      { id: 'predictive-planning' as Page, label: 'Predictive Planning', icon: TrendingUp },
      { id: 'ai-copilot' as Page, label: 'AI Co-Pilot', icon: Brain },
      { id: 'advanced-analytics' as Page, label: 'Analytics', icon: BarChart3 },
    ]
  },
  {
    id: 'admin',
    label: 'Administration',
    collapsible: true,
    items: [
      { id: 'users' as Page, label: 'Users', icon: Users },
      { id: 'job-roles' as Page, label: 'Job Roles', icon: Briefcase },
      { id: 'rate-cards' as Page, label: 'Rate Cards', icon: CreditCard },
      { id: 'access-rules' as Page, label: 'Access Rules', icon: ShieldCheck },
      { id: 'ui-customization' as Page, label: 'UI Customization', icon: Palette },
      { id: 'api-config' as Page, label: 'API Config', icon: Key },
      { id: 'webhook-management' as Page, label: 'Webhooks', icon: Webhook },
      { id: 'integrations' as Page, label: 'Integrations', icon: Plug },
      { id: 'integration-marketplace' as Page, label: 'Marketplace', icon: Plug },
      { id: 'audit-logs' as Page, label: 'Audit Logs', icon: FileText },
      { id: 'gamification' as Page, label: 'Achievements', icon: Star },
      { id: 'recycle-bin' as Page, label: 'Recycle Bin', icon: Trash2 },
      { id: 'settings' as Page, label: 'Settings', icon: Settings },
    ]
  },
];

export function Sidebar({ currentPage, onPageChange, collapsed, onToggleCollapse }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['main', 'operations', 'intelligence']);
  const [favorites, setFavorites] = useState<Page[]>([]);
  const [recentPages, setRecentPages] = useState<Page[]>([]);

  // Load favorites and recent pages from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('rep_favorites');
    const savedRecent = localStorage.getItem('rep_recent_pages');
    
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to load favorites');
      }
    }
    
    if (savedRecent) {
      try {
        setRecentPages(JSON.parse(savedRecent));
      } catch (e) {
        console.error('Failed to load recent pages');
      }
    }
  }, []);

  // Track page visits
  useEffect(() => {
    if (currentPage) {
      setRecentPages((prev) => {
        const filtered = prev.filter(p => p !== currentPage);
        const updated = [currentPage, ...filtered].slice(0, 5);
        localStorage.setItem('rep_recent_pages', JSON.stringify(updated));
        return updated;
      });
    }
  }, [currentPage]);

  // Save favorites when changed
  useEffect(() => {
    localStorage.setItem('rep_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (pageId: Page, event: MouseEvent) => {
    event.stopPropagation();
    setFavorites(prev => 
      prev.includes(pageId) 
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    );
  };

  const menuSections = SIDEBAR_MENU_SECTIONS;

  const toggleSection = (sectionId: string) => {
    if (expandedSections.includes(sectionId)) {
      setExpandedSections(expandedSections.filter(id => id !== sectionId));
    } else {
      setExpandedSections([...expandedSections, sectionId]);
    }
  };

  const renderMenuItem = (item: MenuItem, showFavorite: boolean = true) => {
    const isActive = currentPage === item.id;
    const isFavorite = favorites.includes(item.id);
    const Icon = item.icon;

    return (
      <button
        key={item.id}
        onClick={() => onPageChange(item.id)}
        className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative ${
          isActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
        title={collapsed ? item.label : undefined}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
        {!collapsed && (
          <>
            <span className={`text-sm flex-1 text-left ${isActive ? 'font-medium' : ''}`}>
              {item.label}
            </span>
            {item.badge && (
              <Badge 
                variant={item.badgeVariant === 'warning' ? 'destructive' : 'default'}
                className="text-xs px-1.5 h-5"
              >
                {item.badge}
              </Badge>
            )}
            {showFavorite && (
              <span
                onClick={(e) => toggleFavorite(item.id, e)}
                className={`opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                  isFavorite ? 'opacity-100' : ''
                }`}
              >
                <Star 
                  className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-gray-400'}`}
                />
              </span>
            )}
          </>
        )}
      </button>
    );
  };

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo & Title */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">REP Platform</span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* Favorites Section */}
        {!collapsed && favorites.length > 0 && (
          <div className="mb-4">
            <div className="px-4 py-2 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Favorites
              </span>
            </div>
            <div className="space-y-1 px-2">
              {favorites.map(pageId => {
                const item = allMenuItems[pageId];
                if (!item) return null;
                return renderMenuItem(item, true);
              })}
            </div>
            <div className="mx-4 my-3 border-b border-gray-200" />
          </div>
        )}

        {/* Recently Visited */}
        {!collapsed && recentPages.length > 0 && (
          <div className="mb-4">
            <div className="px-4 py-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Recent
              </span>
            </div>
            <div className="space-y-1 px-2">
              {recentPages.slice(0, 3).map(pageId => {
                const item = allMenuItems[pageId];
                if (!item || pageId === currentPage) return null;
                return renderMenuItem(item, false);
              })}
            </div>
            <div className="mx-4 my-3 border-b border-gray-200" />
          </div>
        )}

        {/* Main Menu Sections */}
        {menuSections.map((section) => {
          const isExpanded = expandedSections.includes(section.id);
          const hasActiveItem = section.items.some(item => item.id === currentPage);
          const hasBadges = section.items.some(item => item.badge);

          return (
            <div key={section.id} className="mb-2">
              {!collapsed && section.collapsible ? (
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>{section.label}</span>
                    {hasBadges && (
                      <BadgeIcon className="w-3 h-3 text-amber-500" />
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              ) : (
                !collapsed && (
                  <div className="px-4 py-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {section.label}
                    </span>
                  </div>
                )
              )}

              {(!section.collapsible || isExpanded || collapsed || hasActiveItem) && (
                <div className="space-y-1 px-2">
                  {section.items.map((item) => renderMenuItem(item, true))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex items-center justify-between">
              <span>v2.1.0</span>
              <Badge variant="secondary" className="text-xs">Pro</Badge>
            </div>
            <div className="text-gray-400">© 2025 REP Platform</div>
          </div>
        </div>
      )}
    </div>
  );
}
