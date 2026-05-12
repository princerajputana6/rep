import { useEffect, useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/app/components/ui/command';
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
  Plug,
  ClipboardCheck,
  Settings,
  Search,
  Home,
  Brain,
  Bell,
  Calendar,
  BarChart3,
  Star,
  Zap,
  Target,
  Rocket,
  Palette,
  Key,
} from 'lucide-react';
import type { Page } from '@/app/App';

interface CommandMenuProps {
  onPageChange: (page: Page) => void;
}

interface Command {
  id: Page;
  label: string;
  icon: any;
  category: string;
  keywords?: string[];
}

const commands: Command[] = [
  { id: 'home', label: 'Home', icon: Home, category: 'Navigation' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Navigation' },
  { id: 'notifications', label: 'Real-Time Notifications', icon: Bell, category: 'Navigation' },
  { id: 'users', label: 'User Management', icon: Users, category: 'Administration' },
  { id: 'job-roles', label: 'Job Roles', icon: Briefcase, category: 'Administration' },
  { id: 'rate-cards', label: 'Rate Cards', icon: CreditCard, category: 'Administration' },
  { id: 'agencies', label: 'Agency Network', icon: Building2, category: 'Network' },
  { id: 'sub-agencies', label: 'Sub-Agencies', icon: Building2, category: 'Network' },
  { id: 'tie-ups', label: 'Tie-Ups & Contracts', icon: Handshake, category: 'Network' },
  { id: 'resource-pools', label: 'Resource Pools', icon: UserCircle, category: 'Resources' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, category: 'Operations' },
  { id: 'tasks', label: 'Tasks', icon: ListChecks, category: 'Operations' },
  { id: 'staffing-planner', label: 'Staffing Planner', icon: Calendar, category: 'Operations' },
  { id: 'capacity', label: 'Capacity & Utilization', icon: TrendingUp, category: 'Operations' },
  { id: 'borrow-requests', label: 'Borrow Requests', icon: ArrowLeftRight, category: 'Operations' },
  { id: 'resource-approvals', label: 'Resource Approvals', icon: ClipboardCheck, category: 'Operations' },
  { id: 'financials', label: 'Financial Dashboard', icon: DollarSign, category: 'Finance & Reports' },
  { id: 'time-phased-kpi', label: 'Time-Phased KPI Reports', icon: BarChart3, category: 'Finance & Reports' },
  { id: 'client-profitability', label: 'Client Profitability & Revenue Intelligence', icon: Target, category: 'Finance & Reports', keywords: ['cpri', 'margin', 'profitability', 'client health'] },
  { id: 'client-master', label: 'Client Master & Financial Mapping', icon: Building2, category: 'Finance & Reports', keywords: ['cmfme', 'client registry', 'ppm mapping', 'financial truth'] },
  { id: 'campaign-mapper', label: 'Campaign-to-Resource Mapper', icon: Rocket, category: 'Finance & Reports', keywords: ['campaign', 'templates', 'marketing', 'ai matching', 'phases'] },
  { id: 'ui-customization', label: 'UI Customization', icon: Palette, category: 'Administration', keywords: ['branding', 'theme', 'colors', 'layout', 'widgets'] },
  { id: 'api-config', label: 'API Configuration', icon: Key, category: 'Administration', keywords: ['api', 'oauth', 'keys', 'credentials', 'integrations'] },
  { id: 'hidden-capacity', label: 'Hidden Capacity Radar', icon: Eye, category: 'Intelligence' },
  { id: 'ai-matching', label: 'AI Resource Matching', icon: Brain, category: 'Intelligence' },
  { id: 'predictive-planning', label: 'Predictive Planning', icon: TrendingUp, category: 'Intelligence' },
  { id: 'ai-copilot', label: 'AI Co-Pilot', icon: Brain, category: 'AI & Automation', keywords: ['assistant', 'chat', 'copilot'] },
  { id: 'advanced-analytics', label: 'Advanced Analytics', icon: BarChart3, category: 'Analytics', keywords: ['analytics', 'insights', 'reports', 'benchmarks'] },
  { id: 'gamification', label: 'Achievements & Rewards', icon: Star, category: 'Engagement', keywords: ['gamification', 'badges', 'leaderboard', 'rewards'] },
  { id: 'integrations', label: 'Integrations', icon: Plug, category: 'Tools' },
  { id: 'integration-marketplace', label: 'Integration Marketplace', icon: Zap, category: 'Tools', keywords: ['marketplace', 'apps', 'connectors'] },
  { id: 'audit-logs', label: 'Audit Logs', icon: FileText, category: 'Compliance' },
  { id: 'settings', label: 'Platform Settings', icon: Settings, category: 'Administration' },
];

export function CommandMenu({ onPageChange }: CommandMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (pageId: Page) => {
    setOpen(false);
    onPageChange(pageId);
  };

  // Group commands by category
  const groupedCommands = commands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {Object.entries(groupedCommands).map(([category, items], index) => (
          <div key={category}>
            {index > 0 && <CommandSeparator />}
            <CommandGroup heading={category}>
              {items.map((command) => {
                const Icon = command.icon;
                return (
                  <CommandItem
                    key={command.id}
                    onSelect={() => handleSelect(command.id)}
                    keywords={command.keywords}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{command.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
