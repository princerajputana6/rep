'use client'

import { lazy, Suspense, useEffect, useState } from 'react';
import { Sidebar } from '@/app/components/layout/Sidebar';
import { Header } from '@/app/components/layout/Header';
import { CommandMenu } from '@/app/components/layout/CommandMenu';
import { WelcomeModal } from '@/app/components/layout/WelcomeModal';
import { BreadcrumbNav } from '@/app/components/layout/BreadcrumbNav';
import { Toaster } from '@/app/components/ui/sonner';
import { AgencyProvider } from '@/app/context/AgencyContext';
import { AuthProvider, useAuth } from '@/app/context/AuthContext';
import { LoginPage } from '@/app/components/pages/LoginPage';
import { rbacService, Role } from '@/app/services/RBACService';
import { QuickTaskWidget } from '@/app/components/layout/QuickTaskWidget';

const Home = lazy(async () => ({ default: (await import('@/app/components/pages/Home')).Home }));
const Dashboard = lazy(async () => ({ default: (await import('@/app/components/pages/Dashboard')).Dashboard }));
const UserManagement = lazy(async () => ({ default: (await import('@/app/components/pages/UserManagement')).UserManagement }));
const JobRoles = lazy(async () => ({ default: (await import('@/app/components/pages/JobRoles')).JobRoles }));
const RateCards = lazy(async () => ({ default: (await import('@/app/components/pages/RateCards')).RateCards }));
const AgencyNetwork = lazy(async () => ({ default: (await import('@/app/components/pages/AgencyNetwork')).AgencyNetwork }));
const SubAgencies = lazy(async () => ({ default: (await import('@/app/components/pages/SubAgencies')).SubAgencies }));
const TieUps = lazy(async () => ({ default: (await import('@/app/components/pages/TieUps')).TieUps }));
const ResourcePools = lazy(async () => ({ default: (await import('@/app/components/pages/ResourcePools')).ResourcePools }));
const Projects = lazy(async () => ({ default: (await import('@/app/components/pages/Projects')).Projects }));
const Tasks = lazy(async () => ({ default: (await import('@/app/components/pages/Tasks')).Tasks }));
const CapacityUtilization = lazy(async () => ({ default: (await import('@/app/components/pages/CapacityUtilization')).CapacityUtilization }));
const BorrowRequests = lazy(async () => ({ default: (await import('@/app/components/pages/BorrowRequests')).BorrowRequests }));
const FinancialDashboard = lazy(async () => ({ default: (await import('@/app/components/pages/FinancialDashboard')).FinancialDashboard }));
const HiddenCapacity = lazy(async () => ({ default: (await import('@/app/components/pages/HiddenCapacity')).HiddenCapacity }));
const IndustryStandardHiddenCapacity = lazy(async () => ({ default: (await import('@/app/components/pages/IndustryStandardHiddenCapacity')).IndustryStandardHiddenCapacity }));
const AuditLogs = lazy(async () => ({ default: (await import('@/app/components/pages/AuditLogs')).AuditLogs }));
const Integrations = lazy(async () => ({ default: (await import('@/app/components/pages/Integrations')).Integrations }));
const ResourceApprovals = lazy(async () => ({ default: (await import('@/app/components/pages/ResourceApprovals')).ResourceApprovals }));
const Settings = lazy(async () => ({ default: (await import('@/app/components/pages/Settings')).Settings }));
const AIResourceMatching = lazy(async () => ({ default: (await import('@/app/components/pages/AIResourceMatching')).AIResourceMatching }));
const PredictivePlanning = lazy(async () => ({ default: (await import('@/app/components/pages/PredictivePlanning')).PredictivePlanning }));
const RealTimeNotifications = lazy(async () => ({ default: (await import('@/app/components/pages/RealTimeNotifications')).RealTimeNotifications }));
const StaffingPlanner = lazy(async () => ({ default: (await import('@/app/components/pages/StaffingPlanner')).StaffingPlanner }));
const TimePhasedKPI = lazy(async () => ({ default: (await import('@/app/components/pages/TimePhasedKPI')).TimePhasedKPI }));
const AICoPilot = lazy(async () => ({ default: (await import('@/app/components/pages/AICoPilot')).AICoPilot }));
const IntegrationMarketplace = lazy(async () => ({ default: (await import('@/app/components/pages/IntegrationMarketplace')).IntegrationMarketplace }));
const Gamification = lazy(async () => ({ default: (await import('@/app/components/pages/Gamification')).Gamification }));
const AdvancedAnalytics = lazy(async () => ({ default: (await import('@/app/components/pages/AdvancedAnalytics')).AdvancedAnalytics }));
const ClientProfitability = lazy(async () => ({ default: (await import('@/app/components/pages/ClientProfitability')).ClientProfitability }));
const ClientMaster = lazy(async () => ({ default: (await import('@/app/components/pages/ClientMaster')).ClientMaster }));
const CampaignMapper = lazy(async () => ({ default: (await import('@/app/components/pages/CampaignMapper')).CampaignMapper }));
const RecycleBin = lazy(async () => ({ default: (await import('@/app/components/pages/RecycleBin')).RecycleBin }));
const UICustomization = lazy(async () => ({ default: (await import('@/app/components/pages/UICustomization')).UICustomization }));
const APIConfig = lazy(async () => ({ default: (await import('@/app/components/pages/APIConfig')).APIConfig }));
const WebhookManagement = lazy(async () => ({ default: (await import('@/app/components/pages/WebhookManagement')).WebhookManagement }));
const BudgetAlerts = lazy(async () => ({ default: (await import('@/app/components/pages/BudgetAlerts')).BudgetAlerts }));
const EnhancedStaffingPlanner = lazy(async () => ({ default: (await import('@/app/components/pages/EnhancedStaffingPlanner')).EnhancedStaffingPlanner }));
const UserProfile = lazy(async () => ({ default: (await import('@/app/components/pages/UserProfile')).UserProfile }));
const AccessRules = lazy(async () => ({ default: (await import('@/app/components/pages/AccessRules')).AccessRules }));
const KPIDetails = lazy(async () => ({ default: (await import('@/app/components/pages/KPIDetails')).KPIDetails }));
const Assignments = lazy(async () => ({ default: (await import('@/app/components/pages/Assignments')).Assignments }));
const Timesheets = lazy(async () => ({ default: (await import('@/app/components/pages/Timesheets')).Timesheets }));
const Portfolio = lazy(async () => ({ default: (await import('@/app/components/pages/Portfolio')).Portfolio }));
const ProgramManagement = lazy(async () => ({ default: (await import('@/app/components/pages/Program')).ProgramManagement }));

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export type Page =
  | 'home' | 'dashboard' | 'users' | 'job-roles' | 'rate-cards'
  | 'agencies' | 'sub-agencies' | 'tie-ups' | 'resource-pools'
  | 'projects' | 'tasks' | 'capacity' | 'borrow-requests'
  | 'resource-approvals' | 'financials' | 'hidden-capacity'
  | 'industry-standard-hidden-capacity' | 'audit-logs' | 'integrations'
  | 'settings' | 'ai-matching' | 'predictive-planning' | 'notifications'
  | 'staffing-planner' | 'enhanced-staffing' | 'time-phased-kpi'
  | 'ai-copilot' | 'integration-marketplace' | 'gamification'
  | 'advanced-analytics' | 'client-profitability' | 'client-master'
  | 'campaign-mapper' | 'recycle-bin' | 'ui-customization' | 'api-config'
  | 'webhook-management' | 'budget-alerts' | 'access-rules' | 'kpi-details'
  | 'assignments' | 'timesheets' | 'portfolio' | 'program' | 'profile';

const BACKEND_TO_FRONTEND_ROLE: Record<string, Role> = {
  SUPER_ADMIN: Role.SUPER_ADMIN,
  AGENCY_OWNER: Role.ADMIN,
  RESOURCE_MANAGER: Role.RESOURCE_MANAGER,
  VIEWER: Role.VIEWER,
};

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (user) {
      rbacService.setCurrentUser({
        id: user.id,
        email: user.email,
        name: user.name,
        role: BACKEND_TO_FRONTEND_ROLE[user.role] ?? Role.VIEWER,
      });
    }
  }, [user]);

  useEffect(() => {
    const idleWindow = window as IdleWindow;
    const prefetchLikelyPages = () => {
      void import('@/app/components/pages/Dashboard');
      void import('@/app/components/pages/Projects');
      void import('@/app/components/pages/StaffingPlanner');
      void import('@/app/components/pages/ResourceApprovals');
      void import('@/app/components/pages/FinancialDashboard');
    };

    let timerId: number | undefined;
    let idleId: number | undefined;

    if (idleWindow.requestIdleCallback) {
      idleId = idleWindow.requestIdleCallback(prefetchLikelyPages);
    } else {
      timerId = window.setTimeout(prefetchLikelyPages, 1200);
    }

    return () => {
      if (idleId !== undefined && idleWindow.cancelIdleCallback) {
        idleWindow.cancelIdleCallback(idleId);
      }
      if (timerId !== undefined) {
        window.clearTimeout(timerId);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <p className="text-sm text-gray-500">Loading REP Platform…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home onPageChange={setCurrentPage} />;
      case 'dashboard': return <Dashboard />;
      case 'users': return <UserManagement />;
      case 'job-roles': return <JobRoles />;
      case 'rate-cards': return <RateCards />;
      case 'agencies': return <AgencyNetwork />;
      case 'sub-agencies': return <SubAgencies />;
      case 'tie-ups': return <TieUps />;
      case 'resource-pools': return <ResourcePools />;
      case 'projects': return <Projects />;
      case 'tasks': return <Tasks onPageChange={setCurrentPage} />;
      case 'capacity': return <CapacityUtilization />;
      case 'borrow-requests': return <BorrowRequests />;
      case 'resource-approvals': return <ResourceApprovals />;
      case 'financials': return <FinancialDashboard />;
      case 'hidden-capacity': return <HiddenCapacity />;
      case 'industry-standard-hidden-capacity': return <IndustryStandardHiddenCapacity />;
      case 'audit-logs': return <AuditLogs />;
      case 'integrations': return <Integrations />;
      case 'settings': return <Settings />;
      case 'ai-matching': return <AIResourceMatching />;
      case 'predictive-planning': return <PredictivePlanning />;
      case 'notifications': return <RealTimeNotifications />;
      case 'staffing-planner': return <StaffingPlanner />;
      case 'enhanced-staffing': return <EnhancedStaffingPlanner />;
      case 'time-phased-kpi': return <TimePhasedKPI />;
      case 'ai-copilot': return <AICoPilot />;
      case 'integration-marketplace': return <IntegrationMarketplace />;
      case 'gamification': return <Gamification />;
      case 'advanced-analytics': return <AdvancedAnalytics />;
      case 'client-profitability': return <ClientProfitability />;
      case 'client-master': return <ClientMaster />;
      case 'campaign-mapper': return <CampaignMapper />;
      case 'recycle-bin': return <RecycleBin />;
      case 'ui-customization': return <UICustomization />;
      case 'api-config': return <APIConfig />;
      case 'webhook-management': return <WebhookManagement />;
      case 'budget-alerts': return <BudgetAlerts />;
      case 'access-rules': return <AccessRules />;
      case 'kpi-details': return <KPIDetails />;
      case 'assignments': return <Assignments />;
      case 'timesheets': return <Timesheets />;
      case 'portfolio': return <Portfolio />;
      case 'program': return <ProgramManagement />;
      case 'profile': return <UserProfile />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentPage={currentPage} onPageChange={setCurrentPage} />
        <main className="flex-1 overflow-y-auto p-6">
          <BreadcrumbNav currentPage={currentPage} onPageChange={setCurrentPage} />
          <Suspense fallback={<div className="py-8 text-sm text-gray-500">Loading page...</div>}>
            {renderPage()}
          </Suspense>
        </main>
      </div>
      <CommandMenu onPageChange={setCurrentPage} />
      <WelcomeModal />
      <Toaster />
      <QuickTaskWidget />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AgencyProvider>
        <AppContent />
      </AgencyProvider>
    </AuthProvider>
  );
}

export default App;
