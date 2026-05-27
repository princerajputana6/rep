'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Input } from '@/app/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/app/components/ui/table'
import { Search, Plus, Calendar, CheckCircle, AlertCircle, Layers, List, Loader2, Handshake } from 'lucide-react'
import { toast } from 'sonner'
import { CreateTieUpDialog } from '@/app/components/dialogs/CreateTieUpDialog'
import { networkService, type TieUp, type Agency } from '@/app/services/networkService'
import { useNavigation } from '@/app/context/NavigationContext'

const STATUS_TONE: Record<TieUp['status'], string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  EXPIRING_SOON: 'bg-amber-100 text-amber-700',
  EXPIRED: 'bg-red-100 text-red-700',
  INACTIVE: 'bg-gray-100 text-gray-700',
}

export function TieUps() {
  const { navigate } = useNavigation()
  const [items, setItems] = useState<TieUp[]>([])
  const [agencies, setAgencies] = useState<Record<string, Agency>>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [statusFilter, setStatusFilter] = useState<'all' | TieUp['status']>('all')

  useEffect(() => {
    setLoading(true)
    Promise.all([networkService.listTieUps(), networkService.listAgencies()])
      .then(([tu, ags]) => {
        setItems(Array.isArray(tu) ? tu : [])
        const map: Record<string, Agency> = {}
        ;(Array.isArray(ags) ? ags : []).forEach((a) => { map[a._id] = a })
        setAgencies(map)
      })
      .catch((e: Error) => toast.error(e.message ?? 'Failed to load tie-ups'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const s = searchQuery.toLowerCase()
    return items.filter((t) => {
      const matchSearch = !s || t.code.toLowerCase().includes(s)
        || agencies[t.fromAgencyId]?.name.toLowerCase().includes(s)
        || agencies[t.toAgencyId]?.name.toLowerCase().includes(s)
      const matchStatus = statusFilter === 'all' || t.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [items, agencies, searchQuery, statusFilter])

  const activeCount = items.filter((t) => t.status === 'ACTIVE').length
  const expiringCount = items.filter((t) => t.status === 'EXPIRING_SOON').length
  const totalValue = items.reduce((s, t) => s + (t.totalValue ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Tie-Ups &amp; Contracts</h1>
          <p className="text-gray-600 mt-1">Manage inter-agency resource sharing agreements</p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4" /> Create Tie-Up
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat label="Total Tie-Ups" value={items.length} />
        <Stat label="Active" value={activeCount} valueClass="text-green-600" />
        <Stat label="Expiring Soon" value={expiringCount} valueClass="text-amber-600" />
        <Stat label="Total Contract Value" value={`$${(totalValue / 1000).toFixed(1)}K`} />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search tie-ups by agency or ID..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRING_SOON">Expiring Soon</option>
              <option value="EXPIRED">Expired</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Tie-Ups ({filtered.length})</h2>
        <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')} className="gap-2">
          {viewMode === 'card' ? <List className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
          {viewMode === 'card' ? 'List' : 'Card'}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-16 text-center text-gray-500 space-y-3">
            <Handshake className="w-10 h-10 mx-auto text-gray-300" />
            <div>No tie-ups yet. Click <strong>Create Tie-Up</strong> to add one.</div>
          </CardContent>
        </Card>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((t) => (
            <Card key={t._id} className="cursor-pointer hover:border-blue-300 hover:shadow-md transition" onClick={() => navigate('tie-up-detail', t._id)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-blue-600">{t.code}</CardTitle>
                  <Badge className={STATUS_TONE[t.status]}>
                    {t.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                     t.status === 'EXPIRING_SOON' ? <AlertCircle className="w-3 h-3 mr-1" /> : null}
                    {t.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {agencies[t.fromAgencyId]?.name ?? t.fromAgencyId} → {agencies[t.toAgencyId]?.name ?? t.toAgencyId}
                </p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-gray-600">Roles</span><span className="font-medium">{t.permittedRoles.join(', ') || '—'}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-600">Allocations</span><span className="font-medium">{t.activeAllocations}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-600">Total Value</span><span className="font-medium">${t.totalValue.toLocaleString()}</span></div>
                {t.validTo && (
                  <div className="flex items-center justify-between"><span className="text-gray-600 flex items-center gap-1"><Calendar className="w-3 h-3" />Valid To</span><span className="font-medium">{new Date(t.validTo).toLocaleDateString()}</span></div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>From → To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Allocations</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Valid To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t._id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate('tie-up-detail', t._id)}>
                    <TableCell className="font-medium text-blue-600">{t.code}</TableCell>
                    <TableCell>{agencies[t.fromAgencyId]?.name ?? '—'} → {agencies[t.toAgencyId]?.name ?? '—'}</TableCell>
                    <TableCell><Badge className={STATUS_TONE[t.status]}>{t.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell>{t.activeAllocations}</TableCell>
                    <TableCell>${t.totalValue.toLocaleString()}</TableCell>
                    <TableCell>{t.validTo ? new Date(t.validTo).toLocaleDateString() : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <CreateTieUpDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  )
}

function Stat({ label, value, valueClass = 'text-gray-900' }: { label: string; value: number | string; valueClass?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm text-gray-600">{label}</div>
        <div className={`text-2xl font-semibold ${valueClass}`}>{value}</div>
      </CardContent>
    </Card>
  )
}
