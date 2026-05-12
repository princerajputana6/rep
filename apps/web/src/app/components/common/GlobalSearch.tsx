import { useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent } from '@/app/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Search, X, FileText, Users, DollarSign, Calendar, Target } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'campaign' | 'template' | 'client' | 'user' | 'project';
  title: string;
  subtitle?: string;
  metadata?: string;
  icon: JSX.Element;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResultClick: (result: SearchResult) => void;
}

export function GlobalSearch({ open, onOpenChange, onResultClick }: GlobalSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Mock search results
  const allResults: SearchResult[] = [
    {
      id: '1',
      type: 'campaign',
      title: 'Q4 Marketing Campaign',
      subtitle: 'Acme Corp',
      metadata: 'Active • 75% complete',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: '2',
      type: 'campaign',
      title: 'Brand Refresh Initiative',
      subtitle: 'TechStart Inc',
      metadata: 'Planning • 20% complete',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: '3',
      type: 'template',
      title: 'Social Media Campaign Template',
      subtitle: 'Template Library',
      metadata: 'Used 12 times',
      icon: <Target className="w-4 h-4" />,
    },
    {
      id: '4',
      type: 'client',
      title: 'Acme Corp',
      subtitle: 'Client',
      metadata: '5 active campaigns',
      icon: <DollarSign className="w-4 h-4" />,
    },
    {
      id: '5',
      type: 'user',
      title: 'John Smith',
      subtitle: 'Campaign Manager',
      metadata: 'john.smith@example.com',
      icon: <Users className="w-4 h-4" />,
    },
  ];

  const filteredResults = allResults.filter((result) => {
    const matchesQuery = searchQuery === '' || 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || result.type === activeFilter;
    
    return matchesQuery && matchesFilter;
  });

  const filters = [
    { value: 'all', label: 'All', count: allResults.length },
    { value: 'campaign', label: 'Campaigns', count: allResults.filter(r => r.type === 'campaign').length },
    { value: 'template', label: 'Templates', count: allResults.filter(r => r.type === 'template').length },
    { value: 'client', label: 'Clients', count: allResults.filter(r => r.type === 'client').length },
    { value: 'user', label: 'Users', count: allResults.filter(r => r.type === 'user').length },
  ];

  const getTypeBadge = (type: string) => {
    const badges = {
      campaign: <Badge className="bg-blue-500">Campaign</Badge>,
      template: <Badge className="bg-purple-500">Template</Badge>,
      client: <Badge className="bg-green-500">Client</Badge>,
      user: <Badge className="bg-amber-500">User</Badge>,
      project: <Badge className="bg-indigo-500">Project</Badge>,
    };
    return badges[type as keyof typeof badges];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Global Search</DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search campaigns, templates, clients, users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-12 text-lg"
            autoFocus
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => setSearchQuery('')}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              variant={activeFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(filter.value)}
              className="whitespace-nowrap"
            >
              {filter.label}
              <Badge variant="secondary" className="ml-2">
                {filter.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {filteredResults.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <div className="font-medium text-gray-900 mb-1">No results found</div>
                <div className="text-sm text-gray-600">
                  Try adjusting your search query or filters
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredResults.map((result) => (
                <Card
                  key={result.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    onResultClick(result);
                    onOpenChange(false);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {result.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-medium text-gray-900">{result.title}</div>
                          {getTypeBadge(result.type)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          {result.subtitle && <span>{result.subtitle}</span>}
                          {result.subtitle && result.metadata && <span>•</span>}
                          {result.metadata && <span>{result.metadata}</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          Press <kbd className="px-2 py-1 bg-gray-100 rounded">Esc</kbd> to close • 
          <kbd className="px-2 py-1 bg-gray-100 rounded ml-1">⌘K</kbd> to search
        </div>
      </DialogContent>
    </Dialog>
  );
}
