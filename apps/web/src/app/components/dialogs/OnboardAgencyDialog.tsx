'use client'

import { useEffect, useState } from 'react'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/app/components/ui/dialog'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select'
import { Checkbox } from '@/app/components/ui/checkbox'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { networkService, type Agency } from '@/app/services/networkService'

interface OnboardAgencyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DEFAULT_AGENCY_TYPES = ['Profit Center', 'Cost Center', 'Head-Quarter', 'Resource Center']
const ADD_NEW = '__add_new_agency_type__'

export function OnboardAgencyDialog({ open, onOpenChange }: OnboardAgencyDialogProps) {
  // Form state
  const [name, setName] = useState('')
  const [owner, setOwner] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [description, setDescription] = useState('')
  const [totalResources, setTotalResources] = useState('')
  const [participationLevel, setParticipationLevel] = useState('full')
  const [agencyTypes, setAgencyTypes] = useState<string[]>(DEFAULT_AGENCY_TYPES)
  const [selectedAgencyType, setSelectedAgencyType] = useState('')
  const [newAgencyType, setNewAgencyType] = useState('')
  const [showAddAgencyType, setShowAddAgencyType] = useState(false)
  const [isSubAgency, setIsSubAgency] = useState(false)
  const [linkedMainAgency, setLinkedMainAgency] = useState('')
  const [location, setLocation] = useState('')

  const [agencies, setAgencies] = useState<Agency[]>([])
  const [saving, setSaving] = useState(false)

  // Load existing agencies for the "Link to Main Agency" dropdown
  useEffect(() => {
    if (!open) return
    networkService.listAgencies().then(setAgencies).catch(() => {})
  }, [open])

  const reset = () => {
    setName(''); setOwner(''); setOwnerEmail(''); setDescription('')
    setTotalResources(''); setParticipationLevel('full')
    setSelectedAgencyType(''); setNewAgencyType(''); setShowAddAgencyType(false)
    setIsSubAgency(false); setLinkedMainAgency(''); setLocation('')
  }

  const handleAgencyTypeChange = (value: string) => {
    if (value === ADD_NEW) { setShowAddAgencyType(true); return }
    setSelectedAgencyType(value); setShowAddAgencyType(false); setNewAgencyType('')
  }
  const handleAddAgencyType = () => {
    const t = newAgencyType.trim()
    if (!t) return
    const existing = agencyTypes.find((x) => x.toLowerCase() === t.toLowerCase())
    if (!existing) setAgencyTypes((prev) => [...prev, t])
    setSelectedAgencyType(existing ?? t); setShowAddAgencyType(false); setNewAgencyType('')
  }

  const handleSubmit = async () => {
    if (!name.trim() || !owner.trim() || !ownerEmail.trim()) {
      toast.error('Name, owner, and email are required'); return
    }
    if (isSubAgency && !linkedMainAgency) {
      toast.error('Select a parent agency for the sub-agency'); return
    }

    setSaving(true)
    try {
      if (isSubAgency) {
        await api.post('/sub-agencies', {
          name: name.trim(),
          parentAgencyId: linkedMainAgency,
          agencyType: selectedAgencyType || 'Profit Center',
          location: location || undefined,
        })
        toast.success(`Sub-agency "${name}" created.`)
      } else {
        await api.post('/agencies', {
          name: name.trim(),
          owner: owner.trim(),
          ownerEmail: ownerEmail.trim(),
          totalResources: Number(totalResources) || 0,
          participationLevel,
        })
        toast.success(`Agency "${name}" onboarded.`)
      }
      reset()
      onOpenChange(false)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to onboard agency'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o) }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Onboard New Agency</DialogTitle>
          <DialogDescription>
            Add a new agency to the network. Fields marked * are required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agencyName">Agency Name *</Label>
                <Input id="agencyName" placeholder="e.g., Acme Digital" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agencyOwner">Agency Owner *</Label>
                <Input id="agencyOwner" placeholder="e.g., John Smith" value={owner} onChange={(e) => setOwner(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerEmail">Owner Email *</Label>
                <Input id="ownerEmail" type="email" placeholder="owner@agency.com" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalResources">Total Resource Count</Label>
                <Input id="totalResources" type="number" placeholder="0" value={totalResources} onChange={(e) => setTotalResources(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Brief description of the agency..." rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agencyType">Agency Type</Label>
                <Select value={selectedAgencyType} onValueChange={handleAgencyTypeChange}>
                  <SelectTrigger id="agencyType"><SelectValue placeholder="Select agency type" /></SelectTrigger>
                  <SelectContent>
                    {agencyTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    <SelectItem value={ADD_NEW}>Add new agency type…</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sub-Agency</Label>
                <div className="flex items-center gap-2 rounded-md border px-3 py-2 h-10">
                  <Checkbox id="subAgency" checked={isSubAgency} onCheckedChange={(c) => { setIsSubAgency(c === true); if (c !== true) setLinkedMainAgency('') }} />
                  <Label htmlFor="subAgency" className="text-sm font-normal cursor-pointer">Mark as sub-agency of an existing agency</Label>
                </div>
              </div>
            </div>

            {showAddAgencyType && (
              <div className="space-y-2">
                <Label htmlFor="newAgencyType">New Agency Type</Label>
                <div className="flex gap-2">
                  <Input id="newAgencyType" placeholder="Enter new type" value={newAgencyType} onChange={(e) => setNewAgencyType(e.target.value)} />
                  <Button type="button" variant="outline" onClick={handleAddAgencyType}>Add</Button>
                </div>
              </div>
            )}

            {isSubAgency && (
              <div className="space-y-2">
                <Label htmlFor="linkedMainAgency">Parent Agency *</Label>
                <Select value={linkedMainAgency} onValueChange={setLinkedMainAgency}>
                  <SelectTrigger id="linkedMainAgency"><SelectValue placeholder="Select parent agency" /></SelectTrigger>
                  <SelectContent>
                    {agencies.map((a) => <SelectItem key={a._id} value={a._id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {!isSubAgency && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="participation">Participation Level</Label>
                  <Select value={participationLevel} onValueChange={setParticipationLevel}>
                    <SelectTrigger id="participation"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Access</SelectItem>
                      <SelectItem value="limited">Limited Access</SelectItem>
                      <SelectItem value="read-only">Read-Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Primary Location</Label>
                  <Input id="location" placeholder="e.g., United States" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSubAgency ? 'Create Sub-Agency' : 'Onboard Agency'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
