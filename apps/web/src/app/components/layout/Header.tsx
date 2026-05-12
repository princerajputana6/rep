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
  Settings as SettingsIcon
} from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { WaffleMenu } from '@/app/components/layout/WaffleMenu';
import { useAgencyContext } from '@/app/context/AgencyContext';
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
  const { selectedAgency, setSelectedAgency, agencies } = useAgencyContext();
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
