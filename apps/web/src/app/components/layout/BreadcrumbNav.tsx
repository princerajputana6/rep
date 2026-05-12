import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/app/components/ui/breadcrumb';
import { Home } from 'lucide-react';
import type { Page } from '@/app/App';

interface BreadcrumbNavProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

const pageHierarchy: Record<Page, { label: string; parent?: Page }> = {
  home: { label: 'Home' },
  dashboard: { label: 'Dashboard', parent: 'home' },
  users: { label: 'User Management', parent: 'home' },
  'job-roles': { label: 'Job Roles', parent: 'home' },
  'rate-cards': { label: 'Rate Cards', parent: 'home' },
  agencies: { label: 'Agency Network', parent: 'home' },
  'sub-agencies': { label: 'Sub-Agencies', parent: 'agencies' },
  'tie-ups': { label: 'Tie-Ups & Contracts', parent: 'agencies' },
  'resource-pools': { label: 'Resource Pools', parent: 'home' },
  projects: { label: 'Projects', parent: 'home' },
  tasks: { label: 'Tasks', parent: 'projects' },
  'staffing-planner': { label: 'Staffing Planner', parent: 'projects' },
  capacity: { label: 'Capacity & Utilization', parent: 'projects' },
  'borrow-requests': { label: 'Borrow Requests', parent: 'home' },
  'resource-approvals': { label: 'Resource Approvals', parent: 'borrow-requests' },
  financials: { label: 'Financial Dashboard', parent: 'home' },
  'time-phased-kpi': { label: 'Time-Phased KPI Reports', parent: 'financials' },
  'client-profitability': { label: 'Client Profitability & Revenue Intelligence', parent: 'financials' },
  'client-master': { label: 'Client Master & Financial Mapping', parent: 'financials' },
  'campaign-mapper': { label: 'Campaign-to-Resource Mapper', parent: 'projects' },
  'recycle-bin': { label: 'Recycle Bin', parent: 'settings' },
  'ui-customization': { label: 'UI Customization', parent: 'home' },
  'api-config': { label: 'API Configuration', parent: 'home' },
  'webhook-management': { label: 'Webhook Management', parent: 'home' },
  'budget-alerts': { label: 'Budget Alerts', parent: 'financials' },
  'enhanced-staffing': { label: 'Enhanced Staffing Planner', parent: 'projects' },
  'hidden-capacity': { label: 'Hidden Capacity Radar', parent: 'home' },
  'industry-standard-hidden-capacity': { label: 'Capacity Radar Pro', parent: 'home' },
  'ai-matching': { label: 'AI Resource Matching', parent: 'home' },
  'predictive-planning': { label: 'Predictive Planning', parent: 'home' },
  'ai-copilot': { label: 'AI Co-Pilot', parent: 'home' },
  'advanced-analytics': { label: 'Advanced Analytics', parent: 'home' },
  'gamification': { label: 'Achievements & Rewards', parent: 'home' },
  'audit-logs': { label: 'Audit Logs', parent: 'home' },
  integrations: { label: 'Integrations', parent: 'home' },
  'integration-marketplace': { label: 'Integration Marketplace', parent: 'integrations' },
  notifications: { label: 'Real-Time Notifications', parent: 'home' },
  settings: { label: 'Platform Settings', parent: 'home' },
  'access-rules': { label: 'Access Rules', parent: 'settings' },
  'kpi-details': { label: 'KPI Details', parent: 'financials' },
  assignments: { label: 'Assignments', parent: 'tasks' },
  timesheets: { label: 'Timesheets', parent: 'projects' },
  portfolio: { label: 'Portfolio Management', parent: 'home' },
  program: { label: 'Program Management', parent: 'portfolio' },
  profile: { label: 'My Profile', parent: 'home' },
};

export function BreadcrumbNav({ currentPage, onPageChange }: BreadcrumbNavProps) {
  const buildBreadcrumbs = (): Array<{ page: Page; label: string }> => {
    const crumbs: Array<{ page: Page; label: string }> = [];
    let current: Page | undefined = currentPage;

    while (current) {
      const pageInfo: { label: string; parent?: Page } = pageHierarchy[current];
      crumbs.unshift({ page: current, label: pageInfo.label });
      current = pageInfo.parent;
    }

    return crumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  if (breadcrumbs.length <= 1 && currentPage === 'home') {
    return null;
  }

  return (
    <div className="mb-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => onPageChange('home')}
              className="flex items-center gap-1 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbs.slice(1).map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 2;
            return (
              <div key={crumb.page} className="flex items-center">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      onClick={() => onPageChange(crumb.page)}
                      className="cursor-pointer"
                    >
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
