import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/app/components/ui/tabs';
import {
  Trash2,
  RotateCcw,
  Search,
  Calendar,
  User,
  AlertTriangle,
  Archive,
  XCircle,
  CheckCircle2,
  Clock,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

interface ArchivedItem {
  id: string;
  type: 'campaign' | 'resource' | 'project' | 'user';
  name: string;
  archivedBy: string;
  archivedDate: string;
  reason: string;
  status: 'archived' | 'deleted';
  canRestore: boolean;
  autoDeleteDate?: string;
}

const mockArchivedItems: ArchivedItem[] = [
  {
    id: '1',
    type: 'campaign',
    name: 'Q4 Brand Campaign 2025',
    archivedBy: 'Sarah Johnson',
    archivedDate: '2026-01-15',
    reason: 'Campaign completed',
    status: 'archived',
    canRestore: true,
    autoDeleteDate: '2026-04-15',
  },
  {
    id: '2',
    type: 'campaign',
    name: 'Summer Social Media Push',
    archivedBy: 'Michael Chen',
    archivedDate: '2026-01-20',
    reason: 'Budget reallocated',
    status: 'deleted',
    canRestore: false,
  },
  {
    id: '3',
    type: 'resource',
    name: 'John Doe',
    archivedBy: 'Emma Davis',
    archivedDate: '2026-02-01',
    reason: 'Left organization',
    status: 'archived',
    canRestore: true,
    autoDeleteDate: '2026-05-01',
  },
  {
    id: '4',
    type: 'project',
    name: 'Website Redesign 2025',
    archivedBy: 'David Park',
    archivedDate: '2026-02-05',
    reason: 'Project completed',
    status: 'archived',
    canRestore: true,
    autoDeleteDate: '2026-05-05',
  },
];

export function RecycleBin() {
  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>(mockArchivedItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'campaign':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'resource':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'project':
        return <Calendar className="w-4 h-4 text-green-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'archived':
        return <Badge className="bg-amber-500">Archived</Badge>;
      case 'deleted':
        return <Badge className="bg-red-500">Deleted</Badge>;
      default:
        return null;
    }
  };

  const handleRestore = (item: ArchivedItem) => {
    if (!item.canRestore) {
      toast.error('This item cannot be restored');
      return;
    }

    if (confirm(`Restore "${item.name}"?`)) {
      setArchivedItems(archivedItems.filter(i => i.id !== item.id));
      toast.success(`${item.name} restored successfully!`);
    }
  };

  const handlePermanentDelete = (item: ArchivedItem) => {
    if (confirm(`Permanently delete "${item.name}"? This action cannot be undone.`)) {
      setArchivedItems(archivedItems.filter(i => i.id !== item.id));
      toast.success(`${item.name} permanently deleted`);
    }
  };

  const filteredItems = archivedItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const archivedCount = archivedItems.filter(i => i.status === 'archived').length;
  const deletedCount = archivedItems.filter(i => i.status === 'deleted').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
            <Archive className="w-8 h-8 text-amber-600" />
            Recycle Bin / Archive
          </h1>
          <p className="text-gray-600 mt-1">
            Manage archived and deleted items • Items auto-delete after 90 days
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Archived</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{archivedCount}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Archive className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Deleted Items</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{deletedCount}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Restorable</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {archivedItems.filter(i => i.canRestore).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <RotateCcw className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {archivedItems.filter(i => i.autoDeleteDate).length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Archived Items</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="campaign">Campaigns</TabsTrigger>
              <TabsTrigger value="resource">Resources</TabsTrigger>
              <TabsTrigger value="project">Projects</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Archived By</TableHead>
                    <TableHead>Archived Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Auto-Delete</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No archived items found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {item.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{item.archivedBy}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{new Date(item.archivedDate).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">{item.reason}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          {item.autoDeleteDate ? (
                            <div className="flex items-center gap-1 text-xs text-amber-600">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{new Date(item.autoDeleteDate).toLocaleDateString()}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {item.canRestore && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleRestore(item)}
                                title="Restore"
                              >
                                <RotateCcw className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handlePermanentDelete(item)}
                              title="Permanent Delete"
                            >
                              <XCircle className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-blue-900">90-Day Retention Policy</div>
              <div className="text-xs text-blue-700 mt-1">
                Archived items are automatically permanently deleted after 90 days unless restored.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-amber-900">Audit Trail</div>
              <div className="text-xs text-amber-700 mt-1">
                All archive and restore actions are logged in the Audit Logs for compliance.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-red-900">Permanent Deletion</div>
              <div className="text-xs text-red-700 mt-1">
                Permanently deleted items cannot be restored and are removed from all backups.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
