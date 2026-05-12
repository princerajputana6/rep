import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Plus } from 'lucide-react';
import { useAgencyContext } from '@/app/context/AgencyContext';

interface SubAgency {
  id: string;
  name: string;
  parentAgency: string;
  agencyType: string;
  location: string;
  status: 'active' | 'inactive';
  createdDate: string;
}

const mainAgencies = ['Acme Digital', 'CreativeCo', 'TechVentures', 'Digital Wave'];

export function SubAgencies() {
  const { selectedAgency, registerAgency } = useAgencyContext();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [subAgencyName, setSubAgencyName] = useState('');
  const [subAgencyParent, setSubAgencyParent] = useState('');
  const [subAgencyType, setSubAgencyType] = useState('Profit Center');
  const [subAgencyLocation, setSubAgencyLocation] = useState('');
  const [subAgencies, setSubAgencies] = useState<SubAgency[]>([
    {
      id: 'sub-1',
      name: 'Acme Digital West',
      parentAgency: 'Acme Digital',
      agencyType: 'Profit Center',
      location: 'United States',
      status: 'active',
      createdDate: '2024-03-10',
    },
    {
      id: 'sub-2',
      name: 'CreativeCo Delivery Hub',
      parentAgency: 'CreativeCo',
      agencyType: 'Resource Center',
      location: 'United Kingdom',
      status: 'active',
      createdDate: '2024-05-21',
    },
  ]);

  const filteredSubAgencies = subAgencies.filter((subAgency) => {
    const matchesSearch =
      subAgency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subAgency.parentAgency.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGlobalAgency =
      selectedAgency === 'all' ||
      subAgency.name === selectedAgency ||
      subAgency.parentAgency === selectedAgency;
    return matchesSearch && matchesGlobalAgency;
  });

  const parentAgencyOptions = mainAgencies.filter(
    (agencyName) => selectedAgency === 'all' || agencyName === selectedAgency
  );

  const handleCreateSubAgency = () => {
    const normalizedName = subAgencyName.trim();
    const normalizedLocation = subAgencyLocation.trim();
    if (!normalizedName || !subAgencyParent) {
      return;
    }

    const newSubAgency: SubAgency = {
      id: `sub-${Date.now()}`,
      name: normalizedName,
      parentAgency: subAgencyParent,
      agencyType: subAgencyType,
      location: normalizedLocation || 'Not specified',
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
    };

    setSubAgencies((previous) => [newSubAgency, ...previous]);
    registerAgency(normalizedName);
    setSubAgencyName('');
    setSubAgencyParent('');
    setSubAgencyType('Profit Center');
    setSubAgencyLocation('');
    setShowCreateDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Sub-Agencies</h1>
          <p className="text-gray-600 mt-1">Manage sub-agency structure in the network</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4" />
          Create Sub Agency
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Search by sub-agency or main agency"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sub-Agency Module</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border p-4 bg-gray-50">
              <div className="text-sm text-gray-600">Total Sub-Agencies</div>
              <div className="text-2xl font-semibold text-gray-900 mt-1">{filteredSubAgencies.length}</div>
            </div>
            <div className="rounded-lg border p-4 bg-gray-50">
              <div className="text-sm text-gray-600">Active Sub-Agencies</div>
              <div className="text-2xl font-semibold text-green-600 mt-1">
                {filteredSubAgencies.filter((subAgency) => subAgency.status === 'active').length}
              </div>
            </div>
            <div className="rounded-lg border p-4 bg-gray-50">
              <div className="text-sm text-gray-600">Parent Agencies Covered</div>
              <div className="text-2xl font-semibold text-gray-900 mt-1">
                {new Set(filteredSubAgencies.map((subAgency) => subAgency.parentAgency)).size}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Sub-Agency</TableHead>
                  <TableHead>Main Agency</TableHead>
                  <TableHead>Agency Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubAgencies.map((subAgency) => (
                  <TableRow key={subAgency.id}>
                    <TableCell className="font-medium">{subAgency.name}</TableCell>
                    <TableCell>{subAgency.parentAgency}</TableCell>
                    <TableCell>{subAgency.agencyType}</TableCell>
                    <TableCell>{subAgency.location}</TableCell>
                    <TableCell>
                      <Badge variant={subAgency.status === 'active' ? 'default' : 'secondary'}>
                        {subAgency.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{subAgency.createdDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Sub Agency</DialogTitle>
            <DialogDescription>
              Add a new sub-agency and link it to a main agency in the network.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subAgencyName">Sub-Agency Name *</Label>
              <Input
                id="subAgencyName"
                placeholder="e.g., Acme Digital South"
                value={subAgencyName}
                onChange={(event) => setSubAgencyName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subAgencyParent">Main Agency *</Label>
              <Select value={subAgencyParent} onValueChange={setSubAgencyParent}>
                <SelectTrigger id="subAgencyParent">
                  <SelectValue placeholder="Select main agency" />
                </SelectTrigger>
                <SelectContent>
                  {parentAgencyOptions.map((agencyName) => (
                    <SelectItem key={agencyName} value={agencyName}>
                      {agencyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subAgencyType">Agency Type</Label>
              <Select value={subAgencyType} onValueChange={setSubAgencyType}>
                <SelectTrigger id="subAgencyType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Profit Center">Profit Center</SelectItem>
                  <SelectItem value="Cost Center">Cost Center</SelectItem>
                  <SelectItem value="Head-Quarter">Head-Quarter</SelectItem>
                  <SelectItem value="Resource Center">Resource Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subAgencyLocation">Location</Label>
              <Input
                id="subAgencyLocation"
                placeholder="e.g., United States"
                value={subAgencyLocation}
                onChange={(event) => setSubAgencyLocation(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateSubAgency}
              disabled={!subAgencyName.trim() || !subAgencyParent}
            >
              Create Sub Agency
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
