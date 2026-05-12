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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Search, Plus, Edit, MoreVertical, UserCheck, UserX, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { useAgencyContext } from '@/app/context/AgencyContext';

interface User {
  id: string;
  name: string;
  email: string;
  agency: string;
  systemRole: string;
  jobRole: string;
  rateCard: string;
  status: 'active' | 'inactive';
  workingHours: string;
}

export function UserManagement() {
  const { selectedAgency, agencies: allAgencies } = useAgencyContext();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAgency, setFilterAgency] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const users: User[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@acmedigital.com',
      agency: 'Acme Digital',
      systemRole: 'Resource Manager',
      jobRole: 'Senior Developer',
      rateCard: 'RC-001',
      status: 'active',
      workingHours: '40h/week'
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'm.chen@creativeco.com',
      agency: 'CreativeCo',
      systemRole: 'Project Manager',
      jobRole: 'UX Designer',
      rateCard: 'RC-002',
      status: 'active',
      workingHours: '40h/week'
    },
    {
      id: '3',
      name: 'Emma Davis',
      email: 'emma.d@techventures.com',
      agency: 'TechVentures',
      systemRole: 'Admin',
      jobRole: 'Product Manager',
      rateCard: 'RC-003',
      status: 'active',
      workingHours: '35h/week'
    },
    {
      id: '4',
      name: 'James Wilson',
      email: 'j.wilson@digitalwave.com',
      agency: 'Digital Wave',
      systemRole: 'Finance Controller',
      jobRole: 'Data Analyst',
      rateCard: 'RC-004',
      status: 'inactive',
      workingHours: '40h/week'
    },
    {
      id: '5',
      name: 'Lisa Anderson',
      email: 'l.anderson@acmedigital.com',
      agency: 'Acme Digital',
      systemRole: 'Resource Manager',
      jobRole: 'QA Engineer',
      rateCard: 'RC-005',
      status: 'active',
      workingHours: '40h/week'
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAgency = filterAgency === 'all' || user.agency === filterAgency;
    const matchesGlobalAgency = selectedAgency === 'all' || user.agency === selectedAgency;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesAgency && matchesGlobalAgency && matchesStatus;
  });

  const agencies = allAgencies;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage users, roles, and access control</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Users</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">1,247</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Active Users</div>
            <div className="text-2xl font-semibold text-green-600 mt-1">1,189</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Inactive Users</div>
            <div className="text-2xl font-semibold text-gray-500 mt-1">58</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Agencies</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">23</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterAgency} onValueChange={setFilterAgency}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by Agency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agencies</SelectItem>
                {agencies.map((agency) => (
                  <SelectItem key={agency} value={agency}>{agency}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Agency</TableHead>
                <TableHead>System Role</TableHead>
                <TableHead>Job Role</TableHead>
                <TableHead>Rate Card</TableHead>
                <TableHead>Working Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{user.agency}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.systemRole}</Badge>
                  </TableCell>
                  <TableCell>{user.jobRole}</TableCell>
                  <TableCell className="font-mono text-sm">{user.rateCard}</TableCell>
                  <TableCell>{user.workingHours}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="w-4 h-4 mr-2" />
                          View Documents
                        </DropdownMenuItem>
                        {user.status === 'active' ? (
                          <DropdownMenuItem className="text-red-600">
                            <UserX className="w-4 h-4 mr-2" />
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-green-600">
                            <UserCheck className="w-4 h-4 mr-2" />
                            Activate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the platform and assign their roles and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Enter full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="user@agency.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agency">Agency</Label>
              <Select>
                <SelectTrigger id="agency">
                  <SelectValue placeholder="Select agency" />
                </SelectTrigger>
                <SelectContent>
                  {agencies.map((agency) => (
                    <SelectItem key={agency} value={agency}>{agency}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="systemRole">System Role</Label>
              <Select>
                <SelectTrigger id="systemRole">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Resource Manager</SelectItem>
                  <SelectItem value="pm">Project Manager</SelectItem>
                  <SelectItem value="finance">Finance Controller</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobRole">Job Role</Label>
              <Select>
                <SelectTrigger id="jobRole">
                  <SelectValue placeholder="Select job role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dev">Senior Developer</SelectItem>
                  <SelectItem value="designer">UX Designer</SelectItem>
                  <SelectItem value="pm">Product Manager</SelectItem>
                  <SelectItem value="analyst">Data Analyst</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rateCard">Rate Card</Label>
              <Select>
                <SelectTrigger id="rateCard">
                  <SelectValue placeholder="Select rate card" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rc1">RC-001 - Senior ($150/hr)</SelectItem>
                  <SelectItem value="rc2">RC-002 - Mid ($100/hr)</SelectItem>
                  <SelectItem value="rc3">RC-003 - Junior ($70/hr)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="hours">Working Hours per Week</Label>
              <Input id="hours" type="number" placeholder="40" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCreateDialog(false)}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
