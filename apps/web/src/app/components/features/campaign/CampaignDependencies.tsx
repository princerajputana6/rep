import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent } from '@/app/components/ui/card';
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
import { 
  GitBranch, 
  ArrowRight, 
  Plus, 
  X,
  AlertTriangle,
  Link as LinkIcon,
  Unlink
} from 'lucide-react';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  name: string;
  status: string;
  client: string;
  progress: number;
}

interface CampaignDependency {
  id: string;
  type: 'parent' | 'child' | 'blocker' | 'blocked-by';
  campaignId: string;
  campaignName: string;
  status: string;
}

interface CampaignDependenciesProps {
  campaign: Campaign;
  dependencies: CampaignDependency[];
  availableCampaigns: Campaign[];
  onAddDependency: (type: string, campaignId: string) => void;
  onRemoveDependency: (dependencyId: string) => void;
}

export function CampaignDependencies({
  campaign,
  dependencies,
  availableCampaigns,
  onAddDependency,
  onRemoveDependency,
}: CampaignDependenciesProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [dependencyType, setDependencyType] = useState<string>('child');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');

  const parentDependencies = dependencies.filter(d => d.type === 'parent');
  const childDependencies = dependencies.filter(d => d.type === 'child');
  const blockerDependencies = dependencies.filter(d => d.type === 'blocker');
  const blockedByDependencies = dependencies.filter(d => d.type === 'blocked-by');

  const handleAddDependency = () => {
    if (!selectedCampaign) {
      toast.error('Please select a campaign');
      return;
    }

    onAddDependency(dependencyType, selectedCampaign);
    setShowAddDialog(false);
    setSelectedCampaign('');
    setDependencyType('child');
    toast.success('Dependency added successfully!');
  };

  const getDependencyBadge = (type: string) => {
    switch (type) {
      case 'parent':
        return <Badge className="bg-blue-500">Parent</Badge>;
      case 'child':
        return <Badge className="bg-green-500">Child</Badge>;
      case 'blocker':
        return <Badge className="bg-red-500">Blocking</Badge>;
      case 'blocked-by':
        return <Badge className="bg-amber-500">Blocked By</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Campaign Dependencies</h3>
          <Badge variant="secondary">{dependencies.length}</Badge>
        </div>
        <Button size="sm" onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Dependency
        </Button>
      </div>

      {/* Info */}
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-sm text-blue-900">
          <strong>Campaign:</strong> {campaign.name}
        </div>
        <div className="text-xs text-blue-700 mt-1">
          Define relationships and dependencies between campaigns to track impact and blockers
        </div>
      </div>

      {/* No Dependencies */}
      {dependencies.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <GitBranch className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <div className="font-medium text-gray-900 mb-1">No dependencies defined</div>
            <div className="text-sm text-gray-600 mb-4">
              Add parent campaigns, child campaigns, or blockers to track relationships
            </div>
            <Button size="sm" onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add First Dependency
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dependency Tree */}
      {dependencies.length > 0 && (
        <div className="space-y-4">
          {/* Parent Campaigns */}
          {parentDependencies.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-blue-500">Parent Campaigns</Badge>
                  <span className="text-xs text-gray-600">
                    This campaign is a sub-campaign of:
                  </span>
                </div>
                <div className="space-y-2">
                  {parentDependencies.map((dep) => (
                    <div
                      key={dep.id}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-center gap-3">
                        <ArrowRight className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900">{dep.campaignName}</div>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {dep.status}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoveDependency(dep.id)}
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Campaign Display */}
          <div className="flex items-center justify-center">
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-semibold text-purple-900">{campaign.name}</div>
                    <div className="text-xs text-purple-700">Current Campaign</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Child Campaigns */}
          {childDependencies.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-green-500">Child Campaigns</Badge>
                  <span className="text-xs text-gray-600">
                    Sub-campaigns that belong to this campaign:
                  </span>
                </div>
                <div className="space-y-2">
                  {childDependencies.map((dep) => (
                    <div
                      key={dep.id}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex items-center gap-3">
                        <ArrowRight className="w-4 h-4 text-green-600" />
                        <div>
                          <div className="font-medium text-gray-900">{dep.campaignName}</div>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {dep.status}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoveDependency(dep.id)}
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Blocking/Blocked Relationships */}
          {(blockerDependencies.length > 0 || blockedByDependencies.length > 0) && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <div className="font-semibold text-amber-900">Blocking Relationships</div>
                </div>

                {blockedByDependencies.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-amber-700 mb-2">This campaign is blocked by:</div>
                    <div className="space-y-2">
                      {blockedByDependencies.map((dep) => (
                        <div
                          key={dep.id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200"
                        >
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <div>
                              <div className="font-medium text-gray-900">{dep.campaignName}</div>
                              <Badge variant="secondary" className="text-xs mt-1">
                                {dep.status}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onRemoveDependency(dep.id)}
                          >
                            <Unlink className="w-4 h-4 text-gray-600" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {blockerDependencies.length > 0 && (
                  <div>
                    <div className="text-xs text-amber-700 mb-2">This campaign is blocking:</div>
                    <div className="space-y-2">
                      {blockerDependencies.map((dep) => (
                        <div
                          key={dep.id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200"
                        >
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <div>
                              <div className="font-medium text-gray-900">{dep.campaignName}</div>
                              <Badge variant="secondary" className="text-xs mt-1">
                                {dep.status}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onRemoveDependency(dep.id)}
                          >
                            <Unlink className="w-4 h-4 text-gray-600" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Add Dependency Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Campaign Dependency</DialogTitle>
            <DialogDescription>
              Define a relationship between this campaign and another campaign
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Dependency Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Relationship Type</label>
              <Select value={dependencyType} onValueChange={setDependencyType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Parent Campaign (this is a sub-campaign of)</SelectItem>
                  <SelectItem value="child">Child Campaign (sub-campaign of this)</SelectItem>
                  <SelectItem value="blocker">Blocking (this blocks another campaign)</SelectItem>
                  <SelectItem value="blocked-by">Blocked By (this is blocked by another)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campaign Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Campaign</label>
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a campaign..." />
                </SelectTrigger>
                <SelectContent>
                  {availableCampaigns
                    .filter(c => c.id !== campaign.id)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} - {c.client}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Info Box */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-900">
                {dependencyType === 'parent' && '↑ This campaign will become a sub-campaign of the selected campaign'}
                {dependencyType === 'child' && '↓ The selected campaign will become a sub-campaign of this campaign'}
                {dependencyType === 'blocker' && '⛔ This campaign will block progress on the selected campaign'}
                {dependencyType === 'blocked-by' && '⏸️ This campaign cannot proceed until the selected campaign completes'}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDependency}>
              <Plus className="w-4 h-4 mr-2" />
              Add Dependency
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
