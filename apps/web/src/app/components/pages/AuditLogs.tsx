import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Search, Download, Calendar, Shield, User, Database } from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  changes: string;
  ipAddress: string;
}

export function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterEntity, setFilterEntity] = useState('all');

  const auditLogs: AuditLog[] = [
    {
      id: 'AL-00145',
      timestamp: '2024-02-01 14:32:15',
      user: 'john.smith@acme.com',
      action: 'CREATE',
      entity: 'BorrowRequest',
      entityId: 'BR-001',
      changes: 'Created borrow request for Senior Developer (3 months, $72K)',
      ipAddress: '192.168.1.45'
    },
    {
      id: 'AL-00144',
      timestamp: '2024-02-01 14:15:42',
      user: 'sarah.johnson@acme.com',
      action: 'UPDATE',
      entity: 'User',
      entityId: 'USR-234',
      changes: 'Updated job role from Mid Developer to Senior Developer',
      ipAddress: '192.168.1.22'
    },
    {
      id: 'AL-00143',
      timestamp: '2024-02-01 13:58:03',
      user: 'michael.chen@creative.com',
      action: 'APPROVE',
      entity: 'BorrowRequest',
      entityId: 'BR-002',
      changes: 'Approved borrow request BR-002 (UX Designer, 2 months)',
      ipAddress: '10.0.0.15'
    },
    {
      id: 'AL-00142',
      timestamp: '2024-02-01 13:22:18',
      user: 'emma.davis@tech.com',
      action: 'CREATE',
      entity: 'TieUp',
      entityId: 'TU-012',
      changes: 'Created tie-up between TechVentures and Digital Wave',
      ipAddress: '172.16.0.8'
    },
    {
      id: 'AL-00141',
      timestamp: '2024-02-01 12:45:55',
      user: 'lisa.anderson@acme.com',
      action: 'UPDATE',
      entity: 'RateCard',
      entityId: 'RC-005',
      changes: 'Updated bill rate from $80/hr to $85/hr',
      ipAddress: '192.168.1.67'
    },
    {
      id: 'AL-00140',
      timestamp: '2024-02-01 11:33:29',
      user: 'james.wilson@wave.com',
      action: 'DELETE',
      entity: 'User',
      entityId: 'USR-189',
      changes: 'Deactivated user account (role: QA Engineer)',
      ipAddress: '10.0.0.42'
    },
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.changes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesEntity = filterEntity === 'all' || log.entity === filterEntity;
    return matchesSearch && matchesAction && matchesEntity;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-700';
      case 'UPDATE': return 'bg-blue-100 text-blue-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      case 'APPROVE': return 'bg-purple-100 text-purple-700';
      case 'REJECT': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">Immutable append-only activity tracking</p>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Export Logs
        </Button>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-blue-900">Immutable Audit Trail</div>
              <div className="text-sm text-blue-700 mt-1">
                All system actions are logged with timestamp, user, IP address, and full change details. 
                Logs are append-only and cannot be modified or deleted.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Entries (30d)</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">12,847</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Active Users (24h)</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">247</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Actions (24h)</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">1,523</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Retention Period</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">7 years</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by user, entity, or changes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Action Type</Label>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="APPROVE">Approve</SelectItem>
                  <SelectItem value="REJECT">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Entity Type</Label>
              <Select value={filterEntity} onValueChange={setFilterEntity}>
                <SelectTrigger>
                  <SelectValue placeholder="All Entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="BorrowRequest">Borrow Request</SelectItem>
                  <SelectItem value="TieUp">Tie-Up</SelectItem>
                  <SelectItem value="RateCard">Rate Card</SelectItem>
                  <SelectItem value="Project">Project</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Audit Trail ({filteredLogs.length} entries)</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              Last 24 hours
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Log ID</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Changes</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">{log.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {log.timestamp}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-gray-400" />
                      <span className="text-sm">{log.user}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getActionColor(log.action)} variant="outline">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Database className="w-3 h-3 text-gray-400" />
                      <div>
                        <div className="font-medium text-sm">{log.entity}</div>
                        <div className="text-xs text-gray-500">{log.entityId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md text-sm text-gray-700">
                      {log.changes}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-500">
                    {log.ipAddress}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
