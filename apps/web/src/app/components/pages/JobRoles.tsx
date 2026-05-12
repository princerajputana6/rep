import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
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
import { Search, Plus, Edit, Users, Tag } from 'lucide-react';

interface JobRole {
  id: string;
  name: string;
  category: string;
  description: string;
  rateCard: string;
  activeUsers: number;
  status: 'active' | 'inactive';
  skills: string[];
}

export function JobRoles() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const jobRoles: JobRole[] = [
    {
      id: '1',
      name: 'Senior Software Engineer',
      category: 'Engineering',
      description: 'Full-stack development with 5+ years experience',
      rateCard: 'RC-001',
      activeUsers: 145,
      status: 'active',
      skills: ['React', 'Node.js', 'TypeScript', 'AWS']
    },
    {
      id: '2',
      name: 'UX Designer',
      category: 'Design',
      description: 'User experience and interface design specialist',
      rateCard: 'RC-002',
      activeUsers: 67,
      status: 'active',
      skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems']
    },
    {
      id: '3',
      name: 'Product Manager',
      category: 'Product',
      description: 'Product strategy and roadmap management',
      rateCard: 'RC-003',
      activeUsers: 34,
      status: 'active',
      skills: ['Product Strategy', 'Agile', 'Stakeholder Management']
    },
    {
      id: '4',
      name: 'Data Analyst',
      category: 'Analytics',
      description: 'Data analysis and business intelligence',
      rateCard: 'RC-004',
      activeUsers: 89,
      status: 'active',
      skills: ['SQL', 'Python', 'Tableau', 'Statistics']
    },
    {
      id: '5',
      name: 'QA Engineer',
      category: 'Engineering',
      description: 'Quality assurance and testing specialist',
      rateCard: 'RC-005',
      activeUsers: 52,
      status: 'active',
      skills: ['Test Automation', 'Selenium', 'API Testing', 'Performance Testing']
    },
  ];

  const filteredRoles = jobRoles.filter((role) =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Job Roles</h1>
          <p className="text-gray-600 mt-1">Define and manage job role taxonomy</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Job Role
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Roles</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">47</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Active Roles</div>
            <div className="text-2xl font-semibold text-green-600 mt-1">42</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Categories</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">8</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Assignments</div>
            <div className="text-2xl font-semibold text-gray-900 mt-1">1,247</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search job roles by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Job Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Job Roles ({filteredRoles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Rate Card</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Active Users</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium text-gray-900">{role.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{role.category}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="text-sm text-gray-600 truncate">{role.description}</div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{role.rateCard}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {role.skills.slice(0, 2).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {role.skills.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{role.skills.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{role.activeUsers}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.status === 'active' ? 'default' : 'secondary'}>
                      {role.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Job Role</DialogTitle>
            <DialogDescription>
              Define a new job role with skills and rate card association
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roleName">Role Name</Label>
                <Input id="roleName" placeholder="e.g., Senior Developer" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe the role responsibilities..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rateCard">Attach Rate Card</Label>
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
            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input id="skills" placeholder="React, TypeScript, Node.js..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCreateDialog(false)}>Create Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
