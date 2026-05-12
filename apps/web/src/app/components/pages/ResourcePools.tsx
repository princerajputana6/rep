import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Slider } from '@/app/components/ui/slider';
import { Textarea } from '@/app/components/ui/textarea';
import { Checkbox } from '@/app/components/ui/checkbox';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { 
  Search, 
  Filter, 
  User, 
  TrendingUp, 
  DollarSign, 
  Building2, 
  Plus, 
  Users, 
  Edit, 
  Trash2,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  X,
  Layers,
  List,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAgencyContext } from '@/app/context/AgencyContext';

interface Resource {
  id: string;
  name: string;
  agency: string;
  jobRole: string;
  skills: string[];
  utilization: number;
  availability: number;
  costRate: number;
  type: 'internal' | 'borrowed' | 'lent';
  currentProject?: string;
  email: string;
}

interface ResourcePool {
  id: string;
  name: string;
  description: string;
  poolManager: string;
  poolManagerId: string;
  resources: string[]; // Array of resource IDs
  assignedAgencies: string[];
  createdDate: string;
  status: 'active' | 'inactive';
}

interface Manager {
  id: string;
  name: string;
  email: string;
  agency: string;
}

function getResourceById(id: string) {
  return availableResources.find((resource) => resource.id === id);
}

const availableResources: Resource[] = [
  {
    id: 'r1',
    name: 'Sarah Johnson',
    agency: 'Acme Digital',
    jobRole: 'Senior Developer',
    skills: ['React', 'Node.js', 'TypeScript'],
    utilization: 85,
    availability: 15,
    costRate: 150,
    type: 'internal',
    currentProject: 'Project Alpha',
    email: 'sarah.j@acme.com'
  },
  {
    id: 'r2',
    name: 'Michael Chen',
    agency: 'CreativeCo',
    jobRole: 'UX Designer',
    skills: ['Figma', 'User Research', 'Prototyping'],
    utilization: 92,
    availability: 8,
    costRate: 100,
    type: 'borrowed',
    currentProject: 'Project Beta',
    email: 'mchen@creativeco.com'
  },
  {
    id: 'r3',
    name: 'Emma Davis',
    agency: 'TechVentures',
    jobRole: 'Product Manager',
    skills: ['Product Strategy', 'Agile'],
    utilization: 78,
    availability: 22,
    costRate: 140,
    type: 'internal',
    email: 'edavis@techventures.com'
  },
  {
    id: 'r4',
    name: 'James Wilson',
    agency: 'Digital Wave',
    jobRole: 'Data Analyst',
    skills: ['SQL', 'Python', 'Tableau'],
    utilization: 45,
    availability: 55,
    costRate: 85,
    type: 'lent',
    currentProject: 'Analytics Hub',
    email: 'jwilson@digitalwave.com'
  },
  {
    id: 'r5',
    name: 'Lisa Anderson',
    agency: 'Acme Digital',
    jobRole: 'Frontend Developer',
    skills: ['Vue.js', 'CSS', 'JavaScript'],
    utilization: 65,
    availability: 35,
    costRate: 120,
    type: 'internal',
    email: 'landerson@acme.com'
  },
  {
    id: 'r6',
    name: 'David Brown',
    agency: 'CreativeCo',
    jobRole: 'Backend Developer',
    skills: ['Java', 'Spring', 'MySQL'],
    utilization: 70,
    availability: 30,
    costRate: 130,
    type: 'internal',
    email: 'dbrown@creativeco.com'
  },
];

const availableManagers: Manager[] = [
  { id: 'm1', name: 'John Smith', email: 'jsmith@acme.com', agency: 'Acme Digital' },
  { id: 'm2', name: 'Emily Rodriguez', email: 'erodriguez@creativeco.com', agency: 'CreativeCo' },
  { id: 'm3', name: 'Robert Taylor', email: 'rtaylor@techventures.com', agency: 'TechVentures' },
  { id: 'm4', name: 'Jennifer Lee', email: 'jlee@digitalwave.com', agency: 'Digital Wave' },
];

const availableAgencies = [
  'Acme Digital',
  'CreativeCo',
  'TechVentures',
  'Digital Wave',
  'Innovation Labs',
  'Design Studio',
];

export function ResourcePools() {
  const { selectedAgency, agencies: allAgencies } = useAgencyContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterAgency, setFilterAgency] = useState('all');
  const [utilizationRange, setUtilizationRange] = useState([0, 100]);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  
  // Pool management state
  const [showCreatePool, setShowCreatePool] = useState(false);
  const [editingPool, setEditingPool] = useState<ResourcePool | null>(null);
  const [pools, setPools] = useState<ResourcePool[]>([
    {
      id: 'p1',
      name: 'Frontend Development Team',
      description: 'Specialized frontend developers with React and Vue expertise',
      poolManager: 'John Smith',
      poolManagerId: 'm1',
      resources: ['r1', 'r5'],
      assignedAgencies: ['Acme Digital', 'CreativeCo'],
      createdDate: '2025-01-15',
      status: 'active',
    },
    {
      id: 'p2',
      name: 'Data Analytics Pool',
      description: 'Data analysts and BI specialists',
      poolManager: 'Jennifer Lee',
      poolManagerId: 'm4',
      resources: ['r4'],
      assignedAgencies: ['Digital Wave', 'TechVentures'],
      createdDate: '2025-01-20',
      status: 'active',
    },
  ]);

  // Form state
  const [poolName, setPoolName] = useState('');
  const [poolDescription, setPoolDescription] = useState('');
  const [selectedManager, setSelectedManager] = useState('');
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
  const [resourceSearch, setResourceSearch] = useState('');

  const filteredResources = availableResources.filter((resource) => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = filterRole === 'all' || resource.jobRole === filterRole;
    const matchesAgency = filterAgency === 'all' || resource.agency === filterAgency;
    const matchesGlobalAgency = selectedAgency === 'all' || resource.agency === selectedAgency;
    const matchesUtilization = resource.utilization >= utilizationRange[0] && resource.utilization <= utilizationRange[1];
    return matchesSearch && matchesRole && matchesAgency && matchesGlobalAgency && matchesUtilization;
  });

  const filteredAvailableResources = availableResources.filter((resource) => {
    const matchesSearch = resource.name.toLowerCase().includes(resourceSearch.toLowerCase()) ||
           resource.jobRole.toLowerCase().includes(resourceSearch.toLowerCase()) ||
           resource.skills.some(s => s.toLowerCase().includes(resourceSearch.toLowerCase()));
    const matchesGlobalAgency = selectedAgency === 'all' || resource.agency === selectedAgency;
    return matchesSearch && matchesGlobalAgency;
  });

  const filteredManagers = availableManagers.filter(
    (manager) => selectedAgency === 'all' || manager.agency === selectedAgency
  );
  const filteredPools = pools.filter(
    (pool) =>
      selectedAgency === 'all' ||
      pool.assignedAgencies.includes(selectedAgency) ||
      pool.resources.some((resourceId) => getResourceById(resourceId)?.agency === selectedAgency)
  );
  const displayAgencies = allAgencies.length > 0 ? allAgencies : availableAgencies;

  const handleOpenCreatePool = () => {
    setEditingPool(null);
    setPoolName('');
    setPoolDescription('');
    setSelectedManager('');
    setSelectedResources([]);
    setSelectedAgencies([]);
    setShowCreatePool(true);
  };

  const handleEditPool = (pool: ResourcePool) => {
    setEditingPool(pool);
    setPoolName(pool.name);
    setPoolDescription(pool.description);
    setSelectedManager(pool.poolManagerId);
    setSelectedResources(pool.resources);
    setSelectedAgencies(pool.assignedAgencies);
    setShowCreatePool(true);
  };

  const handleSavePool = () => {
    if (!poolName.trim()) {
      toast.error('Please enter a pool name');
      return;
    }
    if (!selectedManager) {
      toast.error('Please select a Pool Manager (required)');
      return;
    }
    if (selectedResources.length === 0) {
      toast.error('Please add at least one resource to the pool');
      return;
    }
    if (selectedAgencies.length === 0) {
      toast.error('Please assign the pool to at least one agency');
      return;
    }

    const manager = availableManagers.find(m => m.id === selectedManager);
    
    if (editingPool) {
      // Update existing pool
      setPools(pools.map(p => p.id === editingPool.id ? {
        ...p,
        name: poolName,
        description: poolDescription,
        poolManager: manager?.name || '',
        poolManagerId: selectedManager,
        resources: selectedResources,
        assignedAgencies: selectedAgencies,
      } : p));
      toast.success('Resource pool updated successfully!');
    } else {
      // Create new pool
      const newPool: ResourcePool = {
        id: `p${Date.now()}`,
        name: poolName,
        description: poolDescription,
        poolManager: manager?.name || '',
        poolManagerId: selectedManager,
        resources: selectedResources,
        assignedAgencies: selectedAgencies,
        createdDate: new Date().toISOString().split('T')[0],
        status: 'active',
      };
      setPools([...pools, newPool]);
      toast.success('Resource pool created successfully!');
    }
    
    setShowCreatePool(false);
  };

  const handleDeletePool = (poolId: string) => {
    setPools(pools.filter(p => p.id !== poolId));
    toast.success('Resource pool deleted');
  };

  const toggleResourceSelection = (resourceId: string) => {
    setSelectedResources(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const toggleAgencySelection = (agency: string) => {
    setSelectedAgencies(prev => 
      prev.includes(agency) 
        ? prev.filter(a => a !== agency)
        : [...prev, agency]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Resource Pools</h1>
          <p className="text-gray-600 mt-1">Manage resource pools and assignments across agencies</p>
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
          <Button onClick={handleOpenCreatePool} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Resource Pool
          </Button>
        </div>
      </div>

      {/* Resource Pools List */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPools.map((pool) => {
            const poolResources = pool.resources.map(getResourceById).filter(Boolean) as Resource[];
            const totalCapacity = poolResources.reduce((sum, r) => sum + r.availability, 0);
            
            return (
              <Card key={pool.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        {pool.name}
                      </CardTitle>
                      <CardDescription className="mt-2">{pool.description}</CardDescription>
                    </div>
                    <Badge className={pool.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                      {pool.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                {/* Pool Manager */}
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <User className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-xs text-blue-700 font-medium">Pool Manager</div>
                    <div className="text-sm font-semibold text-blue-900">{pool.poolManager}</div>
                  </div>
                </div>

                {/* Resources */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Resources ({poolResources.length})</Label>
                    <Badge variant="outline">{totalCapacity}% Available</Badge>
                  </div>
                  <div className="space-y-2">
                    {poolResources.slice(0, 3).map((resource) => (
                      <div key={resource.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                            <div className="text-xs text-gray-600">{resource.jobRole}</div>
                          </div>
                        </div>
                        <Badge variant={resource.availability > 30 ? 'default' : 'secondary'} className="text-xs">
                          {resource.availability}% free
                        </Badge>
                      </div>
                    ))}
                    {poolResources.length > 3 && (
                      <div className="text-xs text-gray-500 text-center py-1">
                        +{poolResources.length - 3} more resources
                      </div>
                    )}
                  </div>
                </div>

                {/* Assigned Agencies */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Assigned Agencies</Label>
                  <div className="flex flex-wrap gap-2">
                    {pool.assignedAgencies.map((agency) => (
                      <Badge key={agency} variant="outline" className="gap-1">
                        <Building2 className="w-3 h-3" />
                        {agency}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <div className="text-xs text-gray-600">Created</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {new Date(pool.createdDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Total Capacity</div>
                    <div className="text-sm font-semibold text-gray-900">{totalCapacity}%</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => handleEditPool(pool)}>
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2 text-red-600 hover:bg-red-50"
                    onClick={() => handleDeletePool(pool.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pool</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Resources</TableHead>
                <TableHead>Agencies</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPools.map((pool) => (
                <TableRow key={pool.id}>
                  <TableCell>
                    <div className="font-medium">{pool.name}</div>
                    <div className="text-xs text-gray-500">{pool.description}</div>
                  </TableCell>
                  <TableCell>{pool.poolManager}</TableCell>
                  <TableCell>{pool.resources.length}</TableCell>
                  <TableCell>{pool.assignedAgencies.length}</TableCell>
                  <TableCell>
                    <Badge className={pool.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                      {pool.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(pool.createdDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditPool(pool)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDeletePool(pool.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Available Resources Section */}
      <Card>
        <CardHeader>
          <CardTitle>Available Resources</CardTitle>
          <CardDescription>Browse and filter resources to add to pools</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Senior Developer">Senior Developer</SelectItem>
                <SelectItem value="UX Designer">UX Designer</SelectItem>
                <SelectItem value="Product Manager">Product Manager</SelectItem>
                <SelectItem value="Data Analyst">Data Analyst</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAgency} onValueChange={setFilterAgency}>
              <SelectTrigger>
                <SelectValue placeholder="All Agencies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agencies</SelectItem>
                {displayAgencies.map(agency => (
                  <SelectItem key={agency} value={agency}>{agency}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Utilization: {utilizationRange[0]}-{utilizationRange[1]}%</span>
            </div>
          </div>

          {/* Utilization Range Slider */}
          <div className="mb-6">
            <Slider
              value={utilizationRange}
              onValueChange={setUtilizationRange}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{resource.name}</div>
                        <div className="text-xs text-gray-600">{resource.agency}</div>
                      </div>
                    </div>
                    <Badge variant={resource.type === 'internal' ? 'default' : 'secondary'}>
                      {resource.type}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Role:</span> {resource.jobRole}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {resource.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <div>
                        <span className="text-gray-600">Utilization:</span>
                        <span className="font-semibold text-gray-900 ml-1">{resource.utilization}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Available:</span>
                        <span className="font-semibold text-green-600 ml-1">{resource.availability}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Pool Dialog */}
      <Dialog open={showCreatePool} onOpenChange={setShowCreatePool}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPool ? 'Edit Resource Pool' : 'Create New Resource Pool'}
            </DialogTitle>
            <DialogDescription>
              Build a resource pool by selecting resources and assigning them to agencies
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Pool Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="pool-name">Pool Name *</Label>
                <Input
                  id="pool-name"
                  placeholder="e.g., Frontend Development Team"
                  value={poolName}
                  onChange={(e) => setPoolName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="pool-description">Description</Label>
                <Textarea
                  id="pool-description"
                  placeholder="Describe the purpose and composition of this resource pool"
                  value={poolDescription}
                  onChange={(e) => setPoolDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Pool Manager - MANDATORY */}
              <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <Label htmlFor="pool-manager" className="text-amber-900 font-semibold">
                    Pool Manager (Required) *
                  </Label>
                </div>
                <Select value={selectedManager} onValueChange={setSelectedManager}>
                  <SelectTrigger id="pool-manager" className="bg-white">
                    <SelectValue placeholder="Select a pool manager..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredManagers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{manager.name}</div>
                            <div className="text-xs text-gray-600">{manager.agency} • {manager.email}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-amber-700 mt-2">
                  The pool manager oversees resource allocation and manages pool operations
                </p>
              </div>
            </div>

            {/* Select Resources */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Add Resources * ({selectedResources.length} selected)</Label>
                <Badge variant="secondary">{selectedResources.length} / {availableResources.length}</Badge>
              </div>
              
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search resources by name, role, or skills..."
                    value={resourceSearch}
                    onChange={(e) => setResourceSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="border rounded-lg max-h-80 overflow-y-auto">
                {filteredAvailableResources.map((resource) => {
                  const isSelected = selectedResources.includes(resource.id);
                  return (
                    <div
                      key={resource.id}
                      onClick={() => toggleResourceSelection(resource.id)}
                      className={`flex items-center gap-3 p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <Checkbox checked={isSelected} />
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-gray-900">{resource.name}</div>
                          <Badge variant="outline" className="text-xs">{resource.jobRole}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">{resource.agency} • {resource.email}</div>
                        <div className="flex gap-1 mt-1">
                          {resource.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600">Available</div>
                        <div className={`text-sm font-semibold ${resource.availability > 30 ? 'text-green-600' : 'text-amber-600'}`}>
                          {resource.availability}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assign to Agencies */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Assign to Agencies * ({selectedAgencies.length} selected)</Label>
                <Badge variant="secondary">{selectedAgencies.length} / {displayAgencies.length}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {displayAgencies.map((agency) => {
                  const isSelected = selectedAgencies.includes(agency);
                  return (
                    <div
                      key={agency}
                      onClick={() => toggleAgencySelection(agency)}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-green-50 border-green-500 border-2' : ''
                      }`}
                    >
                      <Checkbox checked={isSelected} />
                      <Building2 className={`w-5 h-5 ${isSelected ? 'text-green-600' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{agency}</div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            {(poolName || selectedManager || selectedResources.length > 0 || selectedAgencies.length > 0) && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="font-semibold text-gray-900 mb-3">Pool Summary</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Pool Name:</div>
                    <div className="font-medium text-gray-900">{poolName || 'Not set'}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Pool Manager:</div>
                    <div className="font-medium text-gray-900">
                      {selectedManager ? availableManagers.find(m => m.id === selectedManager)?.name : 'Not selected'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Resources:</div>
                    <div className="font-medium text-gray-900">{selectedResources.length} selected</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Agencies:</div>
                    <div className="font-medium text-gray-900">{selectedAgencies.length} assigned</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCreatePool(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePool} className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {editingPool ? 'Update Pool' : 'Create Pool'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-blue-900">Resource Pool Management</div>
              <div className="text-sm text-blue-700 mt-1">
                Create resource pools to organize talent by skills, departments, or projects. Each pool requires a 
                designated manager who oversees allocation and coordinates with assigned agencies.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
