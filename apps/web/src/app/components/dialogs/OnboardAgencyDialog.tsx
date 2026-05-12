import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Checkbox } from '@/app/components/ui/checkbox';
import { X } from 'lucide-react';

interface OnboardAgencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnboardAgencyDialog({ open, onOpenChange }: OnboardAgencyDialogProps) {
  const [selectedTieUps, setSelectedTieUps] = useState<string[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [isSubAgency, setIsSubAgency] = useState(false);
  const [linkedMainAgency, setLinkedMainAgency] = useState('');
  const [agencyTypes, setAgencyTypes] = useState([
    'Profit Center',
    'Cost Center',
    'Head-Quarter',
    'Resource Center',
  ]);
  const [selectedAgencyType, setSelectedAgencyType] = useState('');
  const [newAgencyType, setNewAgencyType] = useState('');
  const [showAddAgencyType, setShowAddAgencyType] = useState(false);

  const ADD_NEW_AGENCY_TYPE_VALUE = '__add_new_agency_type__';

  const availableAgencies = [
    'Acme Digital',
    'CreativeCo',
    'TechVentures',
    'Digital Wave',
    'Innovation Labs',
    'NextGen Studios'
  ];

  const availableResources = [
    'Senior Developer',
    'UX Designer',
    'Product Manager',
    'Data Analyst',
    'QA Engineer',
    'DevOps Engineer',
    'Scrum Master',
    'Business Analyst'
  ];

  const toggleTieUp = (agency: string) => {
    if (selectedTieUps.includes(agency)) {
      setSelectedTieUps(selectedTieUps.filter(a => a !== agency));
    } else {
      setSelectedTieUps([...selectedTieUps, agency]);
    }
  };

  const toggleResource = (resource: string) => {
    if (selectedResources.includes(resource)) {
      setSelectedResources(selectedResources.filter(r => r !== resource));
    } else {
      setSelectedResources([...selectedResources, resource]);
    }
  };

  const handleSubmit = () => {
    // Handle agency onboarding
    console.log('Onboarding agency with tie-ups:', selectedTieUps);
    console.log('Resources:', selectedResources);
    console.log('Is sub-agency:', isSubAgency);
    console.log('Linked main agency:', linkedMainAgency);
    console.log('Agency type:', selectedAgencyType);
    onOpenChange(false);
  };

  const handleAgencyTypeChange = (value: string) => {
    if (value === ADD_NEW_AGENCY_TYPE_VALUE) {
      setShowAddAgencyType(true);
      return;
    }

    setSelectedAgencyType(value);
    setShowAddAgencyType(false);
    setNewAgencyType('');
  };

  const handleAddAgencyType = () => {
    const normalizedType = newAgencyType.trim();
    if (!normalizedType) {
      return;
    }

    const existingType = agencyTypes.find(
      (type) => type.toLowerCase() === normalizedType.toLowerCase()
    );
    if (existingType) {
      setSelectedAgencyType(existingType);
      setShowAddAgencyType(false);
      setNewAgencyType('');
      return;
    }

    setAgencyTypes((previousTypes) => [...previousTypes, normalizedType]);
    setSelectedAgencyType(normalizedType);
    setShowAddAgencyType(false);
    setNewAgencyType('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Onboard New Agency</DialogTitle>
          <DialogDescription>
            Add a new agency to the service plan network with initial configuration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agencyName">Agency Name *</Label>
                <Input id="agencyName" placeholder="e.g., Acme Digital Agency" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agencyOwner">Agency Owner *</Label>
                <Input id="agencyOwner" placeholder="e.g., John Smith" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerEmail">Owner Email *</Label>
                <Input id="ownerEmail" type="email" placeholder="owner@agency.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input id="contactPhone" type="tel" placeholder="+1 (555) 000-0000" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Agency Description</Label>
              <Textarea 
                id="description" 
                placeholder="Brief description of the agency's expertise and capabilities..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agencyType">Agency Type *</Label>
                <Select value={selectedAgencyType} onValueChange={handleAgencyTypeChange}>
                  <SelectTrigger id="agencyType">
                    <SelectValue placeholder="Select agency type" />
                  </SelectTrigger>
                  <SelectContent>
                    {agencyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                    <SelectItem value={ADD_NEW_AGENCY_TYPE_VALUE}>Add new Agency type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="block">Sub-Agency</Label>
                <div className="flex items-center gap-2 rounded-md border px-3 py-2 h-10">
                  <Checkbox
                    id="subAgency"
                    checked={isSubAgency}
                    onCheckedChange={(checked) => {
                      const enabled = checked === true;
                      setIsSubAgency(enabled);
                      if (!enabled) {
                        setLinkedMainAgency('');
                      }
                    }}
                  />
                  <Label htmlFor="subAgency" className="text-sm font-normal cursor-pointer">
                    Mark this onboarding as Sub-Agency
                  </Label>
                </div>
              </div>
            </div>

            {showAddAgencyType && (
              <div className="space-y-2">
                <Label htmlFor="newAgencyType">New Agency Type</Label>
                <div className="flex gap-2">
                  <Input
                    id="newAgencyType"
                    placeholder="Enter new agency type"
                    value={newAgencyType}
                    onChange={(event) => setNewAgencyType(event.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={handleAddAgencyType}>
                    Add
                  </Button>
                </div>
              </div>
            )}

            {isSubAgency && (
              <div className="space-y-2">
                <Label htmlFor="linkedMainAgency">Link to Main Agency *</Label>
                <Select value={linkedMainAgency} onValueChange={setLinkedMainAgency}>
                  <SelectTrigger id="linkedMainAgency">
                    <SelectValue placeholder="Select main agency" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAgencies.map((agency) => (
                      <SelectItem key={agency} value={agency}>
                        {agency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Primary Location</Label>
                <Select>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="eu">Europe</SelectItem>
                    <SelectItem value="apac">Asia Pacific</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select>
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="est">EST (UTC-5)</SelectItem>
                    <SelectItem value="pst">PST (UTC-8)</SelectItem>
                    <SelectItem value="gmt">GMT (UTC+0)</SelectItem>
                    <SelectItem value="ist">IST (UTC+5:30)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Resources & Capabilities</h3>
            
            <div className="space-y-2">
              <Label>Select Resource Types *</Label>
              <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-gray-50 min-h-[100px]">
                {availableResources.map((resource) => (
                  <Badge
                    key={resource}
                    variant={selectedResources.includes(resource) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-blue-100"
                    onClick={() => toggleResource(resource)}
                  >
                    {resource}
                    {selectedResources.includes(resource) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Selected: {selectedResources.length} resource type(s)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalResources">Total Resource Count</Label>
                <Input id="totalResources" type="number" placeholder="e.g., 150" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="participation">Participation Level</Label>
                <Select>
                  <SelectTrigger id="participation">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Access</SelectItem>
                    <SelectItem value="limited">Limited Access</SelectItem>
                    <SelectItem value="read-only">Read-Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tie-Ups */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Initial Tie-Ups (Optional)</h3>
            
            <div className="space-y-2">
              <Label>Select Partner Agencies for Tie-Ups</Label>
              <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-gray-50 min-h-[80px]">
                {availableAgencies.map((agency) => (
                  <Badge
                    key={agency}
                    variant={selectedTieUps.includes(agency) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-blue-100"
                    onClick={() => toggleTieUp(agency)}
                  >
                    {agency}
                    {selectedTieUps.includes(agency) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                {selectedTieUps.length > 0 
                  ? `${selectedTieUps.length} tie-up(s) will be created after agency onboarding`
                  : 'No tie-ups selected. You can add them later.'}
              </p>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Advanced Settings</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Select>
                  <SelectTrigger id="defaultCurrency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD - US Dollar</SelectItem>
                    <SelectItem value="eur">EUR - Euro</SelectItem>
                    <SelectItem value="gbp">GBP - British Pound</SelectItem>
                    <SelectItem value="aud">AUD - Australian Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fiscalYear">Fiscal Year Start</Label>
                <Select>
                  <SelectTrigger id="fiscalYear">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jan">January</SelectItem>
                    <SelectItem value="apr">April</SelectItem>
                    <SelectItem value="jul">July</SelectItem>
                    <SelectItem value="oct">October</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Onboard Agency
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
