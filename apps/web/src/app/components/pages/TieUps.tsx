import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Search, Plus, Calendar, AlertCircle, CheckCircle, Layers, List } from 'lucide-react';
import { CreateTieUpDialog } from '@/app/components/dialogs/CreateTieUpDialog';
import { useAgencyContext } from '@/app/context/AgencyContext';

interface TieUp {
  id: string;
  fromAgency: string;
  toAgency: string;
  permittedRoles: string[];
  rateCard: string;
  validFrom: string;
  validTo: string;
  status: 'active' | 'expiring-soon' | 'expired';
  activeAllocations: number;
  totalValue: string;
}

export function TieUps() {
  const { selectedAgency } = useAgencyContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [statusFilter, setStatusFilter] = useState<'all' | TieUp['status']>('all');

  const tieUps: TieUp[] = [
    {
      id: 'TU-001',
      fromAgency: 'Acme Digital',
      toAgency: 'CreativeCo',
      permittedRoles: ['Senior Developer', 'UX Designer'],
      rateCard: 'RC-001',
      validFrom: '2024-01-01',
      validTo: '2024-12-31',
      status: 'active',
      activeAllocations: 5,
      totalValue: '$225K'
    },
    {
      id: 'TU-002',
      fromAgency: 'TechVentures',
      toAgency: 'Digital Wave',
      permittedRoles: ['Data Analyst', 'Product Manager'],
      rateCard: 'RC-003',
      validFrom: '2024-01-01',
      validTo: '2024-02-15',
      status: 'expiring-soon',
      activeAllocations: 3,
      totalValue: '$156K'
    },
    {
      id: 'TU-003',
      fromAgency: 'CreativeCo',
      toAgency: 'Acme Digital',
      permittedRoles: ['QA Engineer'],
      rateCard: 'RC-005',
      validFrom: '2024-01-01',
      validTo: '2024-12-31',
      status: 'active',
      activeAllocations: 2,
      totalValue: '$92K'
    },
    {
      id: 'TU-004',
      fromAgency: 'Digital Wave',
      toAgency: 'TechVentures',
      permittedRoles: ['Senior Developer', 'Product Manager', 'Data Analyst'],
      rateCard: 'RC-002',
      validFrom: '2023-06-01',
      validTo: '2024-01-15',
      status: 'expired',
      activeAllocations: 0,
      totalValue: '$0'
    },
  ];

  const filteredTieUps = tieUps.filter((tieUp) => {
    const matchesSearch =
      tieUp.fromAgency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tieUp.toAgency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tieUp.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tieUp.status === statusFilter;
    const matchesGlobalAgency =
      selectedAgency === 'all' ||
      tieUp.fromAgency === selectedAgency ||
      tieUp.toAgency === selectedAgency;
    return matchesSearch && matchesStatus && matchesGlobalAgency;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Tie-Ups & Contracts</h1>
          <p className="text-gray-600 mt-1">Manage inter-agency resource sharing agreements</p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4" />
          Create Tie-Up
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Tie-Ups</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">67</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Active</div>
            <div className="text-2xl font-semibold text-green-600 mt-1">54</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Expiring Soon</div>
            <div className="text-2xl font-semibold text-amber-600 mt-1">8</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Contract Value</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">$3.2M</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search tie-ups by agency or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | TieUp['status'])}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expiring-soon">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tie-Ups ({filteredTieUps.length})</CardTitle>
            <div className="flex items-center rounded-md border bg-white p-1">
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-2"
                onClick={() => setViewMode('card')}
              >
                <Layers className="w-4 h-4 mr-1" />
                Card
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-2"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4 mr-1" />
                List
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTieUps.map((tieUp) => (
                <Card key={tieUp.id} className="border-gray-200">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{tieUp.id}</div>
                        <div className="text-sm text-gray-600">
                          {tieUp.fromAgency} to {tieUp.toAgency}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {tieUp.status === 'active' && (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <Badge variant="default">Active</Badge>
                          </>
                        )}
                        {tieUp.status === 'expiring-soon' && (
                          <>
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700">Expiring Soon</Badge>
                          </>
                        )}
                        {tieUp.status === 'expired' && (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <Badge variant="destructive">Expired</Badge>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {tieUp.permittedRoles.map((role) => (
                        <Badge key={role} variant="outline" className="text-xs">{role}</Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-gray-500">Rate Card</div>
                        <div className="font-medium">{tieUp.rateCard}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Allocations</div>
                        <div className="font-medium">{tieUp.activeAllocations}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Valid</div>
                        <div className="font-medium">{tieUp.validFrom}</div>
                        <div className="text-xs text-gray-500">to {tieUp.validTo}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Total Value</div>
                        <div className="font-semibold">{tieUp.totalValue}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tie-Up ID</TableHead>
                <TableHead>From Agency</TableHead>
                <TableHead>To Agency</TableHead>
                <TableHead>Permitted Roles</TableHead>
                <TableHead>Rate Card</TableHead>
                <TableHead>Valid Period</TableHead>
                <TableHead>Active Allocations</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTieUps.map((tieUp) => (
                <TableRow key={tieUp.id}>
                  <TableCell className="font-mono text-sm">{tieUp.id}</TableCell>
                  <TableCell className="font-medium">{tieUp.fromAgency}</TableCell>
                  <TableCell className="font-medium">{tieUp.toAgency}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {tieUp.permittedRoles.slice(0, 2).map((role) => (
                        <Badge key={role} variant="outline" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                      {tieUp.permittedRoles.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{tieUp.permittedRoles.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{tieUp.rateCard}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <div>{tieUp.validFrom}</div>
                        <div className="text-gray-500">to {tieUp.validTo}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{tieUp.activeAllocations}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{tieUp.totalValue}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {tieUp.status === 'active' && (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <Badge variant="default">Active</Badge>
                        </>
                      )}
                      {tieUp.status === 'expiring-soon' && (
                        <>
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                            Expiring Soon
                          </Badge>
                        </>
                      )}
                      {tieUp.status === 'expired' && (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <Badge variant="destructive">Expired</Badge>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateTieUpDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  );
}
