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
import {
  Search, Plus, Edit, MoreVertical, Loader2, Users as UsersIcon, User as UserIcon,
  Mail, Phone, Building2, CalendarDays, MessageSquare, Network, FileText,
  BriefcaseBusiness,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
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
  updatedAt?: string
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

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
                    <TableRow key={u._id} className="cursor-pointer" onClick={() => setSelectedUser(u)}>
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
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedUser(u) }}><Edit className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
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

      <UserProfileDialog
        user={selectedUser}
        agencyName={selectedUser ? agencyMap[selectedUser.agencyId]?.name : undefined}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  )
}

function Stat({ label, value, valueClass = 'text-gray-900' }: { label: string; value: number | string; valueClass?: string }) {
  return (
    <Card><CardContent className="p-4"><div className="text-sm text-gray-600">{label}</div><div className={`text-2xl font-semibold ${valueClass}`}>{value}</div></CardContent></Card>
  )
}

function UserProfileDialog({ user, agencyName, onClose }: { user: User | null; agencyName?: string; onClose: () => void }) {
  const [tab, setTab] = useState('details')
  if (!user) return null

  const [firstName, ...rest] = user.name.split(' ')
  const lastName = rest.join(' ')
  const isActive = user.active !== false && user.status !== 'INACTIVE' && user.status !== 'DISABLED'
  const initials = user.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()

  return (
    <Dialog open={!!user} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-6xl max-h-[92vh] overflow-hidden p-0">
        <div className="border-b bg-white">
          <div className="flex items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-semibold">
                {initials || <UserIcon className="w-6 h-6" />}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">User</div>
                <DialogTitle className="text-2xl truncate">{user.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Active' : 'Inactive'}</Badge>
                  <Badge variant="outline">{user.role}</Badge>
                </DialogDescription>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-3 gap-8 text-sm pr-8">
              <TopFact label="Email Address" value={user.email} />
              <TopFact label="Phone number" value="N/A" />
              <TopFact label="Teams" value={agencyName ?? '—'} />
            </div>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="grid grid-cols-[220px_1fr] min-h-[680px]">
          <TabsList className="h-full flex-col items-stretch justify-start rounded-none border-r bg-gray-50 p-2">
            <UserTab value="details" icon={<FileText className="w-4 h-4" />} label="Details" />
            <UserTab value="org" icon={<Network className="w-4 h-4" />} label="Org Chart" />
            <UserTab value="timeoff" icon={<CalendarDays className="w-4 h-4" />} label="Time Off" />
            <UserTab value="forms" icon={<BriefcaseBusiness className="w-4 h-4" />} label="Custom Forms" />
            <UserTab value="updates" icon={<MessageSquare className="w-4 h-4" />} label="Updates" />
          </TabsList>

          <div className="overflow-y-auto bg-gray-50 p-8">
            <TabsContent value="details" className="mt-0 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Personal Info</h2>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <UserSection title="Basic Information">
                  <UserField label="First name(s)" value={firstName || user.name} />
                  <UserField label="Last name" value={lastName} />
                  <UserField label="Email address" value={user.email} wide />
                </UserSection>
                <UserSection title="Job Info">
                  <UserField label="Title" />
                  <UserField label="Talk to Me About" />
                  <UserField label="Role" value={user.role} />
                  <UserField label="Agency" value={agencyName} />
                </UserSection>
                <UserSection title="Contact Info" className="xl:col-span-1">
                  <UserField label="Phone number" />
                  <UserField label="Extension" />
                  <UserField label="Mobile phone number" />
                  <UserField label="Address" />
                  <UserField label="City" />
                  <UserField label="State" />
                  <UserField label="Postal code" />
                  <UserField label="Country" />
                </UserSection>
                <UserSection title="Account Info">
                  <UserField label="Status" value={user.status ?? 'ACTIVE'} />
                  <UserField label="Created" value={new Date(user.createdAt).toLocaleString()} />
                  <UserField label="Last Update Date" value={user.updatedAt ? new Date(user.updatedAt).toLocaleString() : undefined} />
                  <UserField label="User ID" value={user._id} />
                </UserSection>
              </div>
            </TabsContent>

            <TabsContent value="org" className="mt-0">
              <h2 className="text-xl font-semibold text-gray-900 mb-8">Org Chart</h2>
              <div className="flex flex-col items-center gap-10">
                <OrgCard muted label="+ Add a Manager" />
                <div className="h-10 w-px bg-gray-300" />
                <OrgCard name={user.name} email={user.email} active />
                <div className="h-10 w-px bg-gray-300" />
                <OrgCard muted label="+ Add Direct Report" />
              </div>
            </TabsContent>

            <TabsContent value="timeoff" className="mt-0">
              <div className="flex items-center justify-center gap-8 mb-6">
                <Button variant="ghost" size="sm">‹</Button>
                <h2 className="text-xl font-semibold text-gray-900">{user.name.split(' ')[0]}'s Personal Time Off</h2>
                <Button variant="ghost" size="sm">›</Button>
              </div>
              <YearCalendar year={2026} />
            </TabsContent>

            <TabsContent value="forms" className="mt-0 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Workday Data</h2>
              <UserSection title="Workday Data">
                <UserField label="Company ID" value="1210" />
                <UserField label="Employee ID" />
                <UserField label="Persotool ID" value={user._id} />
                <UserField label="Given Name" value={firstName || user.name} />
                <UserField label="Family Name" value={lastName} />
                <UserField label="Email Primary Work" value={user.email.toUpperCase()} />
                <UserField label="Scheduled Weekly Hours" value="20" />
                <UserField label="Monday" value="5" />
                <UserField label="Tuesday" value="5" />
                <UserField label="Wednesday" value="0" />
                <UserField label="Thursday" value="5" />
                <UserField label="Friday" value="5" />
              </UserSection>
            </TabsContent>

            <TabsContent value="updates" className="mt-0 space-y-4">
              <div className="flex justify-between gap-4">
                <div className="flex gap-6 text-sm font-medium">
                  <button className="border-b-2 border-gray-900 pb-2">Comments</button>
                  <button className="text-gray-500 pb-2">System activity</button>
                  <button className="text-gray-500 pb-2">All (read-only)</button>
                </div>
                <div className="relative w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input className="pl-9 h-9" />
                </div>
              </div>
              <Card><CardContent className="p-4">
                <Label>New comment</Label>
                <div className="mt-2 flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100" />
                  <Input placeholder={`Message ${user.name} or the team...`} />
                </div>
              </CardContent></Card>
              <Card><CardContent className="p-5 text-sm space-y-3">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100" />
                  <div>
                    <p className="font-medium">{user.name} <span className="text-gray-400 font-normal">· {new Date(user.createdAt).toLocaleString()}</span></p>
                    <p className="text-gray-600 mt-2">User profile created and assigned to {agencyName ?? 'an agency'}.</p>
                    <div className="flex gap-4 mt-4 text-gray-600"><button>Like</button><button>Reply</button></div>
                  </div>
                </div>
              </CardContent></Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function TopFact({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xs text-gray-500">{label}</div><div className="mt-2 text-sm text-gray-900">{value}</div></div>
}

function UserTab({ value, icon, label }: { value: string; icon: React.ReactNode; label: string }) {
  return <TabsTrigger value={value} className="justify-start gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">{icon}{label}</TabsTrigger>
}

function UserSection({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return <Card className={className}><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">{children}</CardContent></Card>
}

function UserField({ label, value, wide = false }: { label: string; value?: string; wide?: boolean }) {
  const empty = value == null || value === ''
  return <div className={wide ? 'md:col-span-2' : ''}><div className="text-xs text-gray-500 mb-2">{label}</div><div className={empty ? 'text-blue-600 font-semibold text-sm' : 'text-sm text-gray-900'}>{empty ? '+Add' : value}</div></div>
}

function OrgCard({ name, email, muted, active, label }: { name?: string; email?: string; muted?: boolean; active?: boolean; label?: string }) {
  return (
    <div className={`w-40 rounded-lg border bg-white p-4 text-center shadow-sm ${active ? 'border-blue-300' : ''}`}>
      <div className={`mx-auto mb-3 w-20 h-20 rounded-full ${muted ? 'bg-gray-100' : 'bg-blue-100'} flex items-center justify-center`}>
        <UserIcon className={`w-10 h-10 ${muted ? 'text-gray-300' : 'text-blue-300'}`} />
      </div>
      <div className="text-sm font-semibold text-gray-900">{name ?? label}</div>
      {email && <Mail className="w-4 h-4 text-blue-600 mx-auto mt-4" />}
    </div>
  )
}

function YearCalendar({ year }: { year: number }) {
  const highlighted = new Set(['2026-01-02', '2026-01-03', '2026-01-05', '2026-01-06', '2026-02-03', '2026-02-04', '2026-04-13', '2026-04-14', '2026-04-15', '2026-04-16', '2026-04-17', '2026-04-18', '2026-06-08', '2026-06-09', '2026-06-10', '2026-06-11', '2026-06-12', '2026-08-10', '2026-08-11', '2026-08-12', '2026-08-13', '2026-08-14'])
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-8 max-w-4xl mx-auto">
      {Array.from({ length: 12 }, (_, month) => <MonthCalendar key={month} year={year} month={month} highlighted={highlighted} />)}
    </div>
  )
}

function MonthCalendar({ year, month, highlighted }: { year: number; month: number; highlighted: Set<string> }) {
  const first = new Date(year, month, 1)
  const days = new Date(year, month + 1, 0).getDate()
  const blanks = first.getDay()
  const monthName = first.toLocaleString('default', { month: 'long' })
  return (
    <div>
      <h3 className="text-lg font-semibold text-center mb-3">{monthName}</h3>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 mb-1">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={`${d}-${i}`}>{d}</div>)}</div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {Array.from({ length: blanks }, (_, i) => <div key={`b-${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const day = i + 1
          const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          return <div key={day} className={`py-1 rounded ${highlighted.has(key) ? 'bg-blue-100 ring-1 ring-blue-400 text-blue-700 font-semibold' : 'text-gray-800'}`}>{day}</div>
        })}
      </div>
    </div>
  )
}
