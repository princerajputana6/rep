'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Input } from '@/app/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/app/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/app/components/ui/dialog'
import { Label } from '@/app/components/ui/label'
import { Search, Plus, Edit, Loader2, Receipt } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

interface RateCard {
  _id: string
  name: string
  currency: string
  rates: Record<string, unknown>
  active: boolean
  createdAt: string
}

export function RateCards() {
  const [items, setItems] = useState<RateCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [defaultRate, setDefaultRate] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get<RateCard[]>('/rate-cards')
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch((e: Error) => toast.error(e.message ?? 'Failed to load rate cards'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const filtered = useMemo(() => {
    const s = searchQuery.toLowerCase()
    return items.filter((c) => !s || c.name.toLowerCase().includes(s))
  }, [items, searchQuery])

  const handleCreate = async () => {
    if (!name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      await api.post('/rate-cards', {
        name: name.trim(),
        currency,
        rates: defaultRate ? { default: Number(defaultRate) } : {},
      })
      toast.success(`Rate card "${name}" created.`)
      setName(''); setDefaultRate(''); setCurrency('USD'); setShowCreateDialog(false); load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create rate card')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Rate Cards</h1>
          <p className="text-gray-600 mt-1">Manage billing and cost rates per role / location</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2"><Plus className="w-4 h-4" /> Create Rate Card</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Total Rate Cards" value={items.length} />
        <Stat label="Active" value={items.filter((c) => c.active).length} valueClass="text-green-600" />
        <Stat label="Currencies" value={new Set(items.map((c) => c.currency)).size} />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search rate cards..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Rate Cards ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 space-y-2">
              <Receipt className="w-10 h-10 mx-auto text-gray-300" />
              <div>No rate cards yet. Click <strong>Create Rate Card</strong> to add one.</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Rates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell><Badge variant="outline">{c.currency}</Badge></TableCell>
                    <TableCell className="text-sm text-gray-600">{Object.keys(c.rates ?? {}).length} entry/entries</TableCell>
                    <TableCell><Badge variant={c.active ? 'default' : 'secondary'}>{c.active ? 'active' : 'inactive'}</Badge></TableCell>
                    <TableCell className="text-sm">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell><Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Rate Card</DialogTitle>
            <DialogDescription>Define a rate card with a default hourly rate and currency</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label htmlFor="rcName">Name *</Label><Input id="rcName" placeholder="e.g., Senior Developer - US" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="rcCurrency">Currency</Label><Input id="rcCurrency" placeholder="USD" value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} /></div>
              <div className="space-y-2"><Label htmlFor="rcRate">Default Hourly Rate</Label><Input id="rcRate" type="number" placeholder="0" value={defaultRate} onChange={(e) => setDefaultRate(e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Stat({ label, value, valueClass = 'text-gray-900' }: { label: string; value: number | string; valueClass?: string }) {
  return (
    <Card><CardContent className="p-4"><div className="text-sm text-gray-600">{label}</div><div className={`text-2xl font-semibold ${valueClass}`}>{value}</div></CardContent></Card>
  )
}
