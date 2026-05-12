import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Building2, Users, TrendingUp, Handshake, Plus, Layers, List } from 'lucide-react';
import { useState } from 'react';
import { OnboardAgencyDialog } from '@/app/components/dialogs/OnboardAgencyDialog';
import { useAgencyContext } from '@/app/context/AgencyContext';

interface AgencySummary {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  totalResources: number;
  utilization: number;
  activeTieUps: number;
  participation: 'full' | 'limited';
  joinedDate: string;
}

export function AgencyNetwork() {
  const { selectedAgency } = useAgencyContext();
  const [showOnboardDialog, setShowOnboardDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [participationFilter, setParticipationFilter] = useState<'all' | 'full' | 'limited'>('all');

  const agencies: AgencySummary[] = [
    {
      id: '1',
      name: 'Acme Digital',
      status: 'active',
      totalResources: 347,
      utilization: 82,
      activeTieUps: 8,
      participation: 'full',
      joinedDate: '2023-01-15'
    },
    {
      id: '2',
      name: 'CreativeCo',
      status: 'active',
      totalResources: 215,
      utilization: 76,
      activeTieUps: 5,
      participation: 'full',
      joinedDate: '2023-03-22'
    },
    {
      id: '3',
      name: 'TechVentures',
      status: 'active',
      totalResources: 428,
      utilization: 88,
      activeTieUps: 12,
      participation: 'limited',
      joinedDate: '2022-11-08'
    },
    {
      id: '4',
      name: 'Digital Wave',
      status: 'active',
      totalResources: 156,
      utilization: 71,
      activeTieUps: 3,
      participation: 'full',
      joinedDate: '2024-01-10'
    },
  ];

  const filteredAgencies = agencies.filter((agency) => {
    const matchesSearch =
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesParticipation =
      participationFilter === 'all' || agency.participation === participationFilter;
    const matchesGlobalAgency = selectedAgency === 'all' || agency.name === selectedAgency;
    return matchesSearch && matchesParticipation && matchesGlobalAgency;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Agency Network</h1>
          <p className="text-gray-600 mt-1">Manage agencies and service plan participation</p>
        </div>
        <div className="flex items-center gap-2">
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
          <Button className="gap-2" onClick={() => setShowOnboardDialog(true)}>
            <Plus className="w-4 h-4" />
            Onboard Agency
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Agencies</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">23</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Active Tie-Ups</div>
            <div className="text-2xl font-semibold text-green-600 mt-1">67</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Resources</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">1,247</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Network Utilization</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">78.5%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Search agency by name or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:col-span-2"
            />
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={participationFilter}
              onChange={(e) => setParticipationFilter(e.target.value as 'all' | 'full' | 'limited')}
            >
              <option value="all">All Participation</option>
              <option value="full">Full</option>
              <option value="limited">Limited</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAgencies.map((agency) => (
            <Card key={agency.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{agency.name}</CardTitle>
                      <div className="text-sm text-gray-500">Member since {agency.joinedDate}</div>
                    </div>
                  </div>
                  <Badge variant={agency.status === 'active' ? 'default' : 'secondary'}>
                    {agency.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Resources</div>
                      <div className="font-semibold text-gray-900">{agency.totalResources}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Utilization</div>
                      <div className="font-semibold text-gray-900">{agency.utilization}%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Handshake className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-600">Active Tie-Ups</div>
                      <div className="font-semibold text-gray-900">{agency.activeTieUps}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Participation</div>
                    <Badge variant={agency.participation === 'full' ? 'default' : 'secondary'} className="mt-1">
                      {agency.participation}
                    </Badge>
                  </div>
                </div>
                <div className="pt-4 border-t flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">View Details</Button>
                  <Button variant="outline" size="sm" className="flex-1">Manage Tie-Ups</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Resources</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Active Tie-Ups</TableHead>
                <TableHead>Participation</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgencies.map((agency) => (
                <TableRow key={agency.id}>
                  <TableCell className="font-medium">{agency.name}</TableCell>
                  <TableCell><Badge variant={agency.status === 'active' ? 'default' : 'secondary'}>{agency.status}</Badge></TableCell>
                  <TableCell>{agency.totalResources}</TableCell>
                  <TableCell>{agency.utilization}%</TableCell>
                  <TableCell>{agency.activeTieUps}</TableCell>
                  <TableCell>
                    <Badge variant={agency.participation === 'full' ? 'default' : 'secondary'}>{agency.participation}</Badge>
                  </TableCell>
                  <TableCell>{agency.joinedDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <OnboardAgencyDialog open={showOnboardDialog} onOpenChange={setShowOnboardDialog} />
    </div>
  );
}
