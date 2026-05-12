import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { X, Filter } from 'lucide-react';

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    status: string;
    client: string;
    manager: string;
    hasMapping: string;
    fromTemplate: string;
  };
  onFiltersChange: (filters: any) => void;
  clients: Array<{ id: string; name: string }>;
  managers: Array<{ id: string; name: string }>;
}

export function FilterDialog({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  clients,
  managers,
}: FilterDialogProps) {
  const activeFilterCount = Object.values(filters).filter(v => v !== 'all').length;

  const handleClearFilters = () => {
    onFiltersChange({
      status: 'all',
      client: 'all',
      manager: 'all',
      hasMapping: 'all',
      fromTemplate: 'all',
    });
  };

  const handleApplyFilters = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Filter Campaigns
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} active
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Filter campaigns by status, client, manager, and mapping status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Campaign Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Client Filter */}
          <div className="space-y-2">
            <Label>Client</Label>
            <Select
              value={filters.client}
              onValueChange={(value) => onFiltersChange({ ...filters, client: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Manager Filter */}
          <div className="space-y-2">
            <Label>Campaign Manager</Label>
            <Select
              value={filters.manager}
              onValueChange={(value) => onFiltersChange({ ...filters, manager: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All managers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Managers</SelectItem>
                {managers.map((manager) => (
                  <SelectItem key={manager.id} value={manager.name}>
                    {manager.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mapping Filter */}
          <div className="space-y-2">
            <Label>Project Mapping</Label>
            <Select
              value={filters.hasMapping}
              onValueChange={(value) => onFiltersChange({ ...filters, hasMapping: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All campaigns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                <SelectItem value="mapped">Mapped to Projects</SelectItem>
                <SelectItem value="unmapped">Not Mapped</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Template Filter */}
          <div className="space-y-2">
            <Label>Campaign Source</Label>
            <Select
              value={filters.fromTemplate}
              onValueChange={(value) => onFiltersChange({ ...filters, fromTemplate: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="template">From Template</SelectItem>
                <SelectItem value="custom">Custom Campaign</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-blue-900">
                  Active Filters ({activeFilterCount})
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.status !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Status: {filters.status}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => onFiltersChange({ ...filters, status: 'all' })}
                    />
                  </Badge>
                )}
                {filters.client !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Client: {clients.find(c => c.id === filters.client)?.name}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => onFiltersChange({ ...filters, client: 'all' })}
                    />
                  </Badge>
                )}
                {filters.manager !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Manager: {filters.manager}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => onFiltersChange({ ...filters, manager: 'all' })}
                    />
                  </Badge>
                )}
                {filters.hasMapping !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Mapping: {filters.hasMapping}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => onFiltersChange({ ...filters, hasMapping: 'all' })}
                    />
                  </Badge>
                )}
                {filters.fromTemplate !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Source: {filters.fromTemplate}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => onFiltersChange({ ...filters, fromTemplate: 'all' })}
                    />
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
