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
import { X, AlertCircle } from 'lucide-react';

interface CreateTieUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTieUpDialog({ open, onOpenChange }: CreateTieUpDialogProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedRateCards, setSelectedRateCards] = useState<string[]>([]);

  const availableRoles = [
    'Senior Developer',
    'UX Designer',
    'Product Manager',
    'Data Analyst',
    'QA Engineer',
    'DevOps Engineer',
    'Scrum Master',
    'Business Analyst',
    'Technical Architect',
    'Frontend Developer'
  ];

  const availableRateCards = [
    { id: 'RC-001', name: 'Senior Level - US ($150/hr)' },
    { id: 'RC-002', name: 'Mid Level - US ($100/hr)' },
    { id: 'RC-003', name: 'Junior Level - US ($70/hr)' },
    { id: 'RC-004', name: 'Senior Level - EU (€120/hr)' },
    { id: 'RC-005', name: 'Mid Level - EU (€85/hr)' }
  ];

  const agencies = [
    'Acme Digital',
    'CreativeCo',
    'TechVentures',
    'Digital Wave',
    'Innovation Labs',
    'NextGen Studios'
  ];

  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const toggleRateCard = (rateCardId: string) => {
    if (selectedRateCards.includes(rateCardId)) {
      setSelectedRateCards(selectedRateCards.filter(r => r !== rateCardId));
    } else {
      setSelectedRateCards([...selectedRateCards, rateCardId]);
    }
  };

  const handleSubmit = () => {
    console.log('Creating tie-up with roles:', selectedRoles);
    console.log('Rate cards:', selectedRateCards);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Tie-Up Agreement</DialogTitle>
          <DialogDescription>
            Establish a resource sharing agreement between two agencies
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Agreement Parties */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Agreement Parties</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromAgency">From Agency (Provider) *</Label>
                <Select>
                  <SelectTrigger id="fromAgency">
                    <SelectValue placeholder="Select provider agency" />
                  </SelectTrigger>
                  <SelectContent>
                    {agencies.map((agency) => (
                      <SelectItem key={agency} value={agency}>{agency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="toAgency">To Agency (Receiver) *</Label>
                <Select>
                  <SelectTrigger id="toAgency">
                    <SelectValue placeholder="Select receiver agency" />
                  </SelectTrigger>
                  <SelectContent>
                    {agencies.map((agency) => (
                      <SelectItem key={agency} value={agency}>{agency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tieUpName">Tie-Up Name</Label>
              <Input id="tieUpName" placeholder="e.g., Acme-Creative Partnership Q1 2024" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Agreement Description</Label>
              <Textarea 
                id="description" 
                placeholder="Brief description of the tie-up purpose and scope..."
                rows={3}
              />
            </div>
          </div>

          {/* Permitted Roles */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Permitted Roles</h3>
            
            <div className="space-y-2">
              <Label>Select Roles Allowed in This Tie-Up *</Label>
              <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-gray-50 min-h-[120px]">
                {availableRoles.map((role) => (
                  <Badge
                    key={role}
                    variant={selectedRoles.includes(role) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-blue-100"
                    onClick={() => toggleRole(role)}
                  >
                    {role}
                    {selectedRoles.includes(role) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                {selectedRoles.length > 0 
                  ? `${selectedRoles.length} role(s) selected`
                  : 'Please select at least one role'}
              </p>
            </div>
          </div>

          {/* Rate Cards */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Rate Cards</h3>
            
            <div className="space-y-2">
              <Label>Applicable Rate Cards *</Label>
              <div className="space-y-2 p-4 border rounded-lg bg-gray-50">
                {availableRateCards.map((rateCard) => (
                  <div
                    key={rateCard.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRateCards.includes(rateCard.id)
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleRateCard(rateCard.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedRateCards.includes(rateCard.id)
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                        }`}>
                          {selectedRateCards.includes(rateCard.id) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                              <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{rateCard.id}</div>
                          <div className="text-sm text-gray-600">{rateCard.name}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                {selectedRateCards.length > 0 
                  ? `${selectedRateCards.length} rate card(s) selected`
                  : 'Please select at least one rate card'}
              </p>
            </div>
          </div>

          {/* Validity Period */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Validity Period</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From *</Label>
                <Input id="validFrom" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validTo">Valid To *</Label>
                <Input id="validTo" type="date" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="autoRenew">Auto-Renewal</Label>
                <Select>
                  <SelectTrigger id="autoRenew">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No auto-renewal</SelectItem>
                    <SelectItem value="3months">Auto-renew for 3 months</SelectItem>
                    <SelectItem value="6months">Auto-renew for 6 months</SelectItem>
                    <SelectItem value="1year">Auto-renew for 1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notifyBefore">Expiry Notification (days before)</Label>
                <Input id="notifyBefore" type="number" placeholder="30" defaultValue="30" />
              </div>
            </div>
          </div>

          {/* Commercial Terms */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Commercial Terms</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <Select>
                  <SelectTrigger id="currency">
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
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Select>
                  <SelectTrigger id="paymentTerms">
                    <SelectValue placeholder="Select terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="net15">Net 15 days</SelectItem>
                    <SelectItem value="net30">Net 30 days</SelectItem>
                    <SelectItem value="net45">Net 45 days</SelectItem>
                    <SelectItem value="net60">Net 60 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAllocation">Maximum Concurrent Allocations</Label>
              <Input id="maxAllocation" type="number" placeholder="e.g., 10" />
              <p className="text-sm text-gray-500">
                Optional: Limit the number of resources that can be allocated simultaneously
              </p>
            </div>
          </div>

          {/* Alert */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-blue-900">Contract Validation</div>
                <div className="text-blue-700 mt-1">
                  This tie-up will be automatically validated against agency participation levels and existing contracts. 
                  Resources will only be visible after both parties confirm the agreement.
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={selectedRoles.length === 0 || selectedRateCards.length === 0}>
            Create Tie-Up
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
