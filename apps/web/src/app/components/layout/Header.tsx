import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { 
  Bell, 
  Search, 
  User, 
  ChevronDown, 
  Pin, 
  X,
  Star,
  LayoutDashboard,
  Users as UsersIcon,
  FolderKanban,
  ClipboardCheck,
  DollarSign,
  Settings as SettingsIcon,
  Cloud,
  FlaskConical,
  Plus
} from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { WaffleMenu } from '@/app/components/layout/WaffleMenu';
import { useAgencyContext } from '@/app/context/AgencyContext';
import { useEnvironmentContext } from '@/app/context/EnvironmentContext';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import type { Page } from '@/app/App';

interface HeaderProps {
  currentPage?: Page;
  onPageChange?: (page: Page) => void;
}

interface PinnedPage {
  id: Page;
  label: string;
  icon: any;
}

const availablePages = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'resource-approvals' as Page, label: 'Resource Approvals', icon: ClipboardCheck },
  { id: 'projects' as Page, label: 'Projects', icon: FolderKanban },
  { id: 'financials' as Page, label: 'Financial Dashboard', icon: DollarSign },
  { id: 'users' as Page, label: 'User Management', icon: UsersIcon },
  { id: 'borrow-requests' as Page, label: 'Borrow Requests', icon: Star },
];

export function Header({ currentPage, onPageChange }: HeaderProps) {
  const [pinnedPages, setPinnedPages] = useState<PinnedPage[]>([]);
  const [showPinMenu, setShowPinMenu] = useState(false);
  const [showSandboxDialog, setShowSandboxDialog] = useState(false);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [sandboxName, setSandboxName] = useState('');
  const { selectedAgency, setSelectedAgency, agencies } = useAgencyContext();
  const {
    environments,
    selectedEnvironmentId,
    selectedEnvironment,
    setSelectedEnvironmentId,
    createSandbox,
    sandboxCount,
    sandboxLimit,
    canCreateSandbox,
  } = useEnvironmentContext();
  const { user, logout } = useAuth();

  // Load pinned pages from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('rep_pinned_pages');
    if (saved) {
      try {
        setPinnedPages(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load pinned pages');
      }
    }
  }, []);

  // Save pinned pages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('rep_pinned_pages', JSON.stringify(pinnedPages));
  }, [pinnedPages]);

  const handlePinPage = (page: typeof availablePages[0]) => {
    if (!pinnedPages.find(p => p.id === page.id)) {
      setPinnedPages([...pinnedPages, page]);
    }
  };

  const handleUnpinPage = (pageId: Page) => {
    setPinnedPages(pinnedPages.filter(p => p.id !== pageId));
  };

  const isPagePinned = (pageId: Page) => {
    return pinnedPages.some(p => p.id === pageId);
  };

  const handleCreateSandbox = async () => {
    if (!canCreateSandbox) {
      toast.error(`Your plan includes ${sandboxLimit} sandbox${sandboxLimit === 1 ? '' : 'es'}. Purchase more to add another.`);
      return;
    }
    try {
      await createSandbox(sandboxName.trim() || `Sandbox ${sandboxCount + 1}`);
      setSandboxName('');
      setShowSandboxDialog(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create sandbox');
    }
  };

  const handlePromoteSandbox = async () => {
    const production = environments.find((env) => env.type === 'PRODUCTION');
    if (!selectedEnvironment || selectedEnvironment.type !== 'SANDBOX' || !production) return;
    try {
      const result = await api.post<{ agencies: number; portfolios: number; programs: number; projects: number }>('/admin/environments/promote', {
        fromEnvironmentId: selectedEnvironment._id,
        toEnvironmentId: production._id,
      });
      toast.success(`Promoted ${result.projects} project(s), ${result.programs} program(s), and ${result.portfolios} portfolio(s) to production.`);
      setShowPromoteDialog(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to promote sandbox data');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        {/* Pinned Pages */}
        {pinnedPages.length > 0 && (
          <div className="flex items-center gap-2">
            {pinnedPages.map((page) => {
              const Icon = page.icon;
              const isActive = currentPage === page.id;
              return (
                <div
                  key={page.id}
                  className="group relative"
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onPageChange?.(page.id)}
                    className={`gap-2 pr-7 ${isActive ? '' : 'hover:bg-gray-100'}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{page.label}</span>
                  </Button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUnpinPage(page.id);
                    }}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${
                      isActive ? 'text-white hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    aria-label={`Unpin ${page.label}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Pin Page Button */}
        <Popover open={showPinMenu} onOpenChange={setShowPinMenu}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Pin className="w-4 h-4" />
              <span className="hidden sm:inline">Pin Page</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="start">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">Pin Favorite Pages</h4>
                <Badge variant="secondary" className="text-xs">
                  {pinnedPages.length}/6
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Pin your most-used pages for quick access in the header
              </p>
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {availablePages.map((page) => {
                  const Icon = page.icon;
                  const isPinned = isPagePinned(page.id);
                  return (
                    <button
                      key={page.id}
                      onClick={() => {
                        if (isPinned) {
                          handleUnpinPage(page.id);
                        } else if (pinnedPages.length < 6) {
                          handlePinPage(page);
                        }
                      }}
                      disabled={!isPinned && pinnedPages.length >= 6}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                        isPinned
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          : 'hover:bg-gray-100'
                      } ${!isPinned && pinnedPages.length >= 6 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{page.label}</span>
                      </div>
                      {isPinned ? (
                        <Pin className="w-4 h-4 fill-current" />
                      ) : (
                        <Pin className="w-4 h-4" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Search */}
        <div className="relative flex-1 max-w-md ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources, projects, users..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
              {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
            </kbd>
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
              K
            </kbd>
          </div>
        </div>

        <div className="w-full max-w-[220px]">
          <Select value={selectedEnvironmentId} onValueChange={setSelectedEnvironmentId}>
            <SelectTrigger className="h-10">
              <div className="flex items-center gap-2 min-w-0">
                {selectedEnvironment?.type === 'SANDBOX' ? <FlaskConical className="w-4 h-4 text-amber-600" /> : <Cloud className="w-4 h-4 text-green-600" />}
                <SelectValue placeholder="Environment" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {environments.map((env) => (
                <SelectItem key={env._id} value={env._id}>
                  {env.name} ({env.type === 'PRODUCTION' ? 'Production' : 'Sandbox'})
                </SelectItem>
              ))}
              <button
                type="button"
                onClick={() => setShowSandboxDialog(true)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add sandbox
              </button>
            </SelectContent>
          </Select>
        </div>

        <Badge variant={selectedEnvironment?.type === 'SANDBOX' ? 'secondary' : 'default'} className={selectedEnvironment?.type === 'SANDBOX' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}>
          {selectedEnvironment?.type === 'SANDBOX' ? 'Sandbox' : 'Production'}
        </Badge>

        {selectedEnvironment?.type === 'SANDBOX' && (
          <Button variant="outline" size="sm" className="h-10" onClick={() => setShowPromoteDialog(true)}>
            Promote
          </Button>
        )}

        <div className="w-full max-w-[220px]">
          <Select value={selectedAgency} onValueChange={setSelectedAgency}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Agency Picker" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agencies</SelectItem>
              {agencies.map((agency) => (
                <SelectItem key={agency} value={agency}>
                  {agency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Dialog open={showSandboxDialog} onOpenChange={setShowSandboxDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Sandbox Environment</DialogTitle>
            <DialogDescription>
              Sandboxes keep their agencies, projects, and hierarchy data separate from production.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="rounded-md border bg-gray-50 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Sandbox allowance</span>
                <strong>{sandboxCount} / {sandboxLimit}</strong>
              </div>
              {!canCreateSandbox && (
                <p className="mt-2 text-amber-700">
                  Your current plan has reached its sandbox limit. Purchase more sandboxes to create another environment.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sandboxName">Sandbox Name</Label>
              <Input
                id="sandboxName"
                placeholder={`Sandbox ${sandboxCount + 1}`}
                value={sandboxName}
                onChange={(e) => setSandboxName(e.target.value)}
                disabled={!canCreateSandbox}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSandboxDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateSandbox} disabled={!canCreateSandbox}>
              {canCreateSandbox ? 'Create Sandbox' : 'Purchase Required'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Promote Sandbox To Production</DialogTitle>
            <DialogDescription>
              Copy agencies, portfolios, programs, and projects from "{selectedEnvironment?.name}" into Production.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border bg-amber-50 p-3 text-sm text-amber-800">
            Existing production agencies with the same name will be reused. Sandbox data remains available after promotion.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPromoteDialog(false)}>Cancel</Button>
            <Button onClick={handlePromoteSandbox}>Promote To Production</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-4 ml-4">
        {/* Waffle Menu */}
        <WaffleMenu currentPage={currentPage} onPageChange={onPageChange} />

        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 min-w-5 h-5 flex items-center justify-center">
            3
          </Badge>
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase() ?? <User className="w-4 h-4 text-white" />}
                  </span>
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-sm font-medium text-gray-900">{user?.name ?? 'User'}</div>
                  <div className="text-xs text-gray-500">{user?.role?.replace(/_/g, ' ') ?? ''}</div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onPageChange?.('profile')}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPageChange?.('settings')}>
              <SettingsIcon className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => void logout()}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
