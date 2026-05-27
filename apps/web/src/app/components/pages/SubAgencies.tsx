'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/app/components/ui/table'
import { Building2, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { networkService, type SubAgency, type Agency } from '@/app/services/networkService'
import { useNavigation } from '@/app/context/NavigationContext'

export function SubAgencies() {
  const { navigate } = useNavigation()
  const [items, setItems] = useState<SubAgency[]>([])
  const [agencies, setAgencies] = useState<Record<string, Agency>>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([networkService.listSubAgencies(), networkService.listAgencies()])
      .then(([subs, ags]) => {
        setItems(Array.isArray(subs) ? subs : [])
        const map: Record<string, Agency> = {}
        ;(Array.isArray(ags) ? ags : []).forEach((a) => { map[a._id] = a })
        setAgencies(map)
      })
      .catch((e: Error) => toast.error(e.message ?? 'Failed to load sub-agencies'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase()
    return items.filter((i) =>
      !s || i.name.toLowerCase().includes(s) ||
      agencies[i.parentAgencyId]?.name.toLowerCase().includes(s) ||
      i.agencyType.toLowerCase().includes(s)
    )
  }, [items, agencies, searchTerm])

  const parentCount = useMemo(() => new Set(items.map((i) => i.parentAgencyId)).size, [items])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Sub-Agencies</h1>
          <p className="text-gray-600 mt-1">Manage sub-agency structure in the network</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" /> Create Sub Agency</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <Input placeholder="Search by sub-agency or main agency" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Sub-Agency Module</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Stat label="Total Sub-Agencies" value={items.length} />
            <Stat label="Active Sub-Agencies" value={items.filter((i) => i.status === 'ACTIVE').length} valueClass="text-green-600" />
            <Stat label="Parent Agencies Covered" value={parentCount} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 space-y-2">
              <Building2 className="w-10 h-10 mx-auto text-gray-300" />
              <div>No sub-agencies yet.</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sub-Agency</TableHead>
                  <TableHead>Main Agency</TableHead>
                  <TableHead>Agency Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s._id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate('sub-agency-detail', s._id)}>
                    <TableCell className="font-medium text-blue-600">{s.name}</TableCell>
                    <TableCell>{agencies[s.parentAgencyId]?.name ?? '—'}</TableCell>
                    <TableCell>{s.agencyType}</TableCell>
                    <TableCell>{s.location ?? '—'}</TableCell>
                    <TableCell><Badge>{s.status}</Badge></TableCell>
                    <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({ label, value, valueClass = 'text-gray-900' }: { label: string; value: number; valueClass?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm text-gray-600">{label}</div>
        <div className={`text-2xl font-semibold ${valueClass}`}>{value}</div>
      </CardContent>
    </Card>
  )
}
