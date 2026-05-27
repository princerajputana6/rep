'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/app/components/ui/table'
import { Building2, Users, TrendingUp, Plus, Layers, List, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { OnboardAgencyDialog } from '@/app/components/dialogs/OnboardAgencyDialog'
import { networkService, type Agency } from '@/app/services/networkService'
import { useNavigation } from '@/app/context/NavigationContext'

export function AgencyNetwork() {
  const { navigate } = useNavigation()
  const [showOnboardDialog, setShowOnboardDialog] = useState(false)
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'INACTIVE'>('all')
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    networkService
      .listAgencies()
      .then((data) => setAgencies(Array.isArray(data) ? data : []))
      .catch((e: Error) => toast.error(e.message ?? 'Failed to load agencies'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase()
    return agencies.filter((a) => {
      const matchSearch = !s || a.name.toLowerCase().includes(s) || a.ownerEmail?.toLowerCase().includes(s)
      const matchStatus = statusFilter === 'all' || a.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [agencies, searchTerm, statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Agencies</h1>
          <p className="text-gray-600 mt-1">Network of partner agencies in your platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')} className="gap-2">
            {viewMode === 'card' ? <List className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
            {viewMode === 'card' ? 'List' : 'Card'}
          </Button>
          <Button className="gap-2" onClick={() => setShowOnboardDialog(true)}>
            <Plus className="w-4 h-4" /> Onboard Agency
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Agencies" value={agencies.length} icon={<Building2 className="w-5 h-5 text-blue-600" />} bg="bg-blue-50" />
        <StatCard label="Active" value={agencies.filter((a) => a.status === 'ACTIVE').length} icon={<Users className="w-5 h-5 text-green-600" />} bg="bg-green-50" />
        <StatCard label="Total Resources" value={agencies.reduce((s, a) => s + (a.totalResources ?? 0), 0)} icon={<TrendingUp className="w-5 h-5 text-purple-600" />} bg="bg-purple-50" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="Search agencies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="md:col-span-2" />
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-16 text-center text-gray-500 space-y-3">
            <Building2 className="w-10 h-10 mx-auto text-gray-300" />
            <div>No agencies yet. Click <strong>Onboard Agency</strong> to add one.</div>
          </CardContent>
        </Card>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((agency) => (
            <Card key={agency._id} className="cursor-pointer hover:border-blue-300 hover:shadow-md transition" onClick={() => navigate('agency-detail', agency._id)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg hover:text-blue-600">{agency.name}</CardTitle>
                      <p className="text-sm text-gray-500">{agency.owner}</p>
                    </div>
                  </div>
                  <Badge className={agency.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : ''}>{agency.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Resources" value={String(agency.totalResources ?? 0)} />
                <Row label="Participation" value={agency.participationLevel} />
                <Row label="Joined" value={new Date(agency.createdAt).toLocaleDateString()} />
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
                  <TableHead>Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Resources</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a._id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate('agency-detail', a._id)}>
                    <TableCell className="font-medium text-blue-600">{a.name}</TableCell>
                    <TableCell>{a.owner}</TableCell>
                    <TableCell><Badge>{a.status}</Badge></TableCell>
                    <TableCell>{a.totalResources ?? 0}</TableCell>
                    <TableCell>{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <OnboardAgencyDialog open={showOnboardDialog} onOpenChange={(open) => { setShowOnboardDialog(open); if (!open) load() }} />
    </div>
  )
}

function StatCard({ label, value, icon, bg }: { label: string; value: number; icon: React.ReactNode; bg: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${bg} rounded-lg`}>{icon}</div>
          <div>
            <div className="text-sm text-gray-600">{label}</div>
            <div className="text-2xl font-semibold text-gray-900">{value}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
