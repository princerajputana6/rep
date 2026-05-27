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
import { Badge } from '@/app/components/ui/badge'
import { AlertCircle, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { networkService, type Agency, type RateCardRow, type JobRoleRow } from '@/app/services/networkService'

interface CreateTieUpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTieUpDialog({ open, onOpenChange }: CreateTieUpDialogProps) {
  // Form state
  const [code, setCode] = useState('')
  const [fromAgencyId, setFromAgencyId] = useState('')
  const [toAgencyId, setToAgencyId] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [rateCardId, setRateCardId] = useState('')
  const [validFrom, setValidFrom] = useState('')
  const [validTo, setValidTo] = useState('')
  const [totalValue, setTotalValue] = useState('')

  // Loaded options
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [rateCards, setRateCards] = useState<RateCardRow[]>([])
  const [jobRoles, setJobRoles] = useState<JobRoleRow[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setCode(`TU-${Date.now().toString(36).toUpperCase().slice(-6)}`)
    Promise.all([
      networkService.listAgencies(),
      api.get<RateCardRow[]>('/rate-cards').catch(() => []),
      api.get<JobRoleRow[]>('/job-roles').catch(() => []),
    ]).then(([ag, rc, jr]) => {
      setAgencies(Array.isArray(ag) ? ag : [])
      setRateCards(Array.isArray(rc) ? rc : [])
      setJobRoles(Array.isArray(jr) ? jr : [])
    })
  }, [open])

  const reset = () => {
    setCode(''); setFromAgencyId(''); setToAgencyId(''); setNotes('')
    setSelectedRoles([]); setRateCardId(''); setValidFrom(''); setValidTo(''); setTotalValue('')
  }

  const toggleRole = (r: string) => {
    setSelectedRoles((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r])
  }

  const handleSubmit = async () => {
    if (!code.trim()) { toast.error('Code is required'); return }
    if (!fromAgencyId || !toAgencyId) { toast.error('Pick both agencies'); return }
    if (fromAgencyId === toAgencyId) { toast.error('From and To must be different agencies'); return }
    if (selectedRoles.length === 0) { toast.error('Pick at least one permitted role'); return }

    setSaving(true)
    try {
      await api.post('/tie-ups', {
        code: code.trim(),
        fromAgencyId,
        toAgencyId,
        permittedRoles: selectedRoles,
        rateCardId: rateCardId || undefined,
        validFrom: validFrom || undefined,
        validTo: validTo || undefined,
        totalValue: Number(totalValue) || 0,
        notes: notes || undefined,
        status: 'ACTIVE',
      })
      toast.success(`Tie-up ${code} created.`)
      reset()
      onOpenChange(false)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create tie-up')
    } finally {
      setSaving(false)
    }
  }

  // Use existing JobRoles if any; otherwise fall back to a small static list of common roles
  const roleOptions = jobRoles.length > 0
    ? jobRoles.map((r) => r.name)
    : ['Senior Developer', 'UX Designer', 'Product Manager', 'Data Analyst', 'QA Engineer', 'DevOps Engineer']

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o) }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Tie-Up Agreement</DialogTitle>
          <DialogDescription>Establish a resource sharing agreement between two agencies</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Agreement Parties</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromAgency">From Agency (Provider) *</Label>
                <Select value={fromAgencyId} onValueChange={setFromAgencyId}>
                  <SelectTrigger id="fromAgency"><SelectValue placeholder="Select provider agency" /></SelectTrigger>
                  <SelectContent>
                    {agencies.map((a) => <SelectItem key={a._id} value={a._id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="toAgency">To Agency (Receiver) *</Label>
                <Select value={toAgencyId} onValueChange={setToAgencyId}>
                  <SelectTrigger id="toAgency"><SelectValue placeholder="Select receiver agency" /></SelectTrigger>
                  <SelectContent>
                    {agencies.map((a) => <SelectItem key={a._id} value={a._id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Tie-Up Code *</Label>
              <Input id="code" placeholder="e.g., TU-001" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Purpose and scope..." rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Permitted Roles *</h3>
            <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-gray-50 min-h-[80px]">
              {roleOptions.map((r) => (
                <Badge key={r} variant={selectedRoles.includes(r) ? 'default' : 'outline'} className="cursor-pointer hover:bg-blue-100" onClick={() => toggleRole(r)}>
                  {r}{selectedRoles.includes(r) && <X className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              {selectedRoles.length > 0 ? `${selectedRoles.length} role(s) selected` : 'Pick at least one role'}
              {jobRoles.length === 0 && ' · Showing default options because no job roles exist yet.'}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Validity &amp; Commercial</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From</Label>
                <Input id="validFrom" type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validTo">Valid To</Label>
                <Input id="validTo" type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rateCard">Rate Card</Label>
                <Select value={rateCardId} onValueChange={setRateCardId}>
                  <SelectTrigger id="rateCard"><SelectValue placeholder={rateCards.length === 0 ? 'No rate cards yet' : 'Select rate card'} /></SelectTrigger>
                  <SelectContent>
                    {rateCards.map((rc) => <SelectItem key={rc._id} value={rc._id}>{rc.name} ({rc.currency})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalValue">Total Contract Value</Label>
                <Input id="totalValue" type="number" placeholder="0" value={totalValue} onChange={(e) => setTotalValue(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-blue-900">Tip</div>
                <div className="text-blue-700 mt-1">
                  Create at least two agencies and a rate card first if you want the full contract flow populated.
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || selectedRoles.length === 0}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Tie-Up
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
