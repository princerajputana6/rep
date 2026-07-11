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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select'
import { Search, Plus, Edit, MoreVertical, Loader2, Users as UsersIcon } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { networkService, type Agency } from '@/app/services/networkService'

interface User {
  _id: string
  name: string
  email: string
  agencyId: string
  role: string
  status?: string
  active?: boolean
  createdAt: string
}

const SYSTEM_ROLES = ['VIEWER', 'MEMBER', 'MANAGER']

export function UserManagement() {
  const [items, setItems] = useState<User[]>([])
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAgency, setFilterAgency] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Create form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [agencyId, setAgencyId] = useState('')
  const [role, setRole] = useState('VIEWER')
  const [saving, setSaving] = useState(false)

  const agencyMap = useMemo(() => {
    const m: Record<string, Agency> = {}
    agencies.forEach((a) => { m[a._id] = a })
    return m
  }, [agencies])

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get<{ data: User[] } | User[]>('/users'),
      networkService.listAgencies(),
    ]).then(([usersRes, ags]) => {
      const users = Array.isArray(usersRes)
        ? usersRes
        : Array.isArray((usersRes as { data?: User[] }).data) ? (usersRes as { data: User[] }).data : []
      setItems(users)
      setAgencies(Array.isArray(ags) ? ags : [])
    }).catch((e: Error) => toast.error(e.message ?? 'Failed to load users')).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const filtered = useMemo(() => {
    const s = searchQuery.toLowerCase()
    return items.filter((u) => {
      const matchSearch = !s || u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s)
      const matchAgency = filterAgency === 'all' || u.agencyId === filterAgency
      const isActive = u.active !== false && u.status !== 'INACTIVE'
      const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? isActive : !isActive)
      return matchSearch && matchAgency && matchStatus
    })
  }, [items, searchQuery, filterAgency, filterStatus])

  const activeCount = items.filter((u) => u.active !== false && u.status !== 'INACTIVE').length

  const handleCreate = async () => {
    if (!name.trim() || !email.trim()) { toast.error('Name and email are required'); return }
    if (!agencyId) { toast.error('Pick an agency'); return }
    setSaving(true)
    try {
      await api.post('/users', { name: name.trim(), email: email.trim(), agencyId, role })
      toast.success(`User "${name}" created.`)
      setName(''); setEmail(''); setAgencyId(''); setRole('VIEWER'); setShowCreateDialog(false); load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create user')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage users, roles, and access control</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2"><Plus className="w-4 h-4" /> Create User</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat label="Total Users" value={items.length} />
        <Stat label="Active Users" value={activeCount} valueClass="text-green-600" />
        <Stat label="Inactive Users" value={items.length - activeCount} valueClass="text-gray-500" />
        <Stat label="Agencies" value={agencies.length} />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterAgency} onValueChange={setFilterAgency}>
              <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Filter by Agency" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agencies</SelectItem>
                {agencies.map((a) => <SelectItem key={a._id} value={a._id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Filter by Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Users ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 space-y-2">
              <UsersIcon className="w-10 h-10 mx-auto text-gray-300" />
              <div>No users match. Try <strong>Create User</strong>.</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => {
                  const isActive = u.active !== false && u.status !== 'INACTIVE'
                  return (
                    <TableRow key={u._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{u.name}</div>
                          <div className="text-sm text-gray-500">{u.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{agencyMap[u.agencyId]?.name ?? '—'}</TableCell>
                      <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                      <TableCell><Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'active' : 'inactive'}</Badge></TableCell>
                      <TableCell className="text-sm">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>Add a new user and assign them to an agency</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2"><Label htmlFor="name">Full Name *</Label><Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="email">Email *</Label><Input id="email" type="email" placeholder="user@agency.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-2">
              <Label htmlFor="agency">Agency *</Label>
              <Select value={agencyId} onValueChange={setAgencyId}>
                <SelectTrigger id="agency"><SelectValue placeholder={agencies.length === 0 ? 'Create an agency first' : 'Select agency'} /></SelectTrigger>
                <SelectContent>
                  {agencies.map((a) => <SelectItem key={a._id} value={a._id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">System Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SYSTEM_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Create User</Button>
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
