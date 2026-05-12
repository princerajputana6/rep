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
  Search,
  Plus,
  FileText,
  Grid3x3,
  Archive,
  BarChart3,
  Settings,
  Users,
  DollarSign,
  Calendar,
  Link as LinkIcon,
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  client: string;
  status: string;
}

interface CampaignCommandMenuProps {
  campaigns: Campaign[];
  onCreateCampaign: () => void;
  onViewCampaign: (campaignId: string) => void;
  onViewTemplates: () => void;
  onViewAnalytics: (campaignId: string) => void;
  onArchiveCampaign: (campaignId: string) => void;
  onNavigate: (page: string) => void;
}

export function CampaignCommandMenu({
  campaigns,
  onCreateCampaign,
  onViewCampaign,
  onViewTemplates,
  onViewAnalytics,
  onArchiveCampaign,
  onNavigate,
}: CampaignCommandMenuProps) {
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

  const runCommand = (callback: () => void) => {
    setOpen(false);
    callback();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(onCreateCampaign)}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create New Campaign</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(onViewTemplates)}>
            <Grid3x3 className="mr-2 h-4 w-4" />
            <span>View Templates</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => onNavigate('recycle-bin'))}>
            <Archive className="mr-2 h-4 w-4" />
            <span>Open Recycle Bin</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Search Campaigns */}
        <CommandGroup heading="Campaigns">
          {campaigns.slice(0, 8).map((campaign) => (
            <CommandItem
              key={campaign.id}
              onSelect={() => runCommand(() => onViewCampaign(campaign.id))}
            >
              <FileText className="mr-2 h-4 w-4" />
              <div className="flex flex-col">
                <span>{campaign.name}</span>
                <span className="text-xs text-gray-500">{campaign.client}</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Navigation */}
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => runCommand(() => onNavigate('dashboard'))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => onNavigate('users'))}>
            <Users className="mr-2 h-4 w-4" />
            <span>User Management</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => onNavigate('financials'))}>
            <DollarSign className="mr-2 h-4 w-4" />
            <span>Financial Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => onNavigate('staffing-planner'))}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Staffing Planner</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => onNavigate('settings'))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
