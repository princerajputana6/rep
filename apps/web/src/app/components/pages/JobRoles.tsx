'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Input } from '@/app/components/ui/input'
import { Textarea } from '@/app/components/ui/textarea'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/app/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/app/components/ui/dialog'
import { Label } from '@/app/components/ui/label'
import { Search, Plus, Edit, Loader2, IdCard } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

interface JobRole {
  _id: string
  name: string
  description?: string
  category?: string
  defaultHourlyRate?: number
  skills: string[]
  active: boolean
  createdAt: string
}

export function JobRoles() {
  const [items, setItems] = useState<JobRole[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Create-form state
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [defaultHourlyRate, setDefaultHourlyRate] = useState('')
  const [skillsInput, setSkillsInput] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get<JobRole[]>('/job-roles')
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch((e: Error) => toast.error(e.message ?? 'Failed to load job roles'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const filtered = useMemo(() => {
    const s = searchQuery.toLowerCase()
    return items.filter((r) => !s || r.name.toLowerCase().includes(s) || (r.category ?? '').toLowerCase().includes(s))
  }, [items, searchQuery])

  const categories = useMemo(() => new Set(items.map((r) => r.category).filter(Boolean)).size, [items])
  const activeCount = useMemo(() => items.filter((r) => r.active).length, [items])

  const reset = () => { setName(''); setCategory(''); setDescription(''); setDefaultHourlyRate(''); setSkillsInput('') }

  const handleCreate = async () => {
    if (!name.trim()) { toast.error('Role name is required'); return }
    setSaving(true)
    try {
      await api.post('/job-roles', {
        name: name.trim(),
        category: category.trim() || undefined,
        description: description.trim() || undefined,
        defaultHourlyRate: defaultHourlyRate ? Number(defaultHourlyRate) : undefined,
        skills: skillsInput.split(',').map((s) => s.trim()).filter(Boolean),
      })
      toast.success(`Role "${name}" created.`)
      reset(); setShowCreateDialog(false); load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create role')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Job Roles</h1>
          <p className="text-gray-600 mt-1">Define and manage job role taxonomy</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2"><Plus className="w-4 h-4" /> Create Job Role</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat label="Total Roles" value={items.length} />
        <Stat label="Active Roles" value={activeCount} valueClass="text-green-600" />
        <Stat label="Categories" value={categories} />
        <Stat label="Avg Rate" value={items.length ? `$${Math.round(items.reduce((s, r) => s + (r.defaultHourlyRate ?? 0), 0) / Math.max(items.length, 1))}/hr` : '—'} />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search job roles by name or category..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Job Roles ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 space-y-2">
              <IdCard className="w-10 h-10 mx-auto text-gray-300" />
              <div>No job roles yet. Click <strong>Create Job Role</strong> to add one.</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((role) => (
                  <TableRow key={role._id}>
                    <TableCell className="font-medium text-gray-900">{role.name}</TableCell>
                    <TableCell>{role.category ? <Badge variant="outline">{role.category}</Badge> : '—'}</TableCell>
                    <TableCell className="max-w-xs"><div className="text-sm text-gray-600 truncate">{role.description ?? '—'}</div></TableCell>
                    <TableCell>{role.defaultHourlyRate ? `$${role.defaultHourlyRate}/hr` : '—'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {(role.skills ?? []).slice(0, 3).map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                        {(role.skills?.length ?? 0) > 3 && <Badge variant="secondary" className="text-xs">+{role.skills.length - 3}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={role.active ? 'default' : 'secondary'}>{role.active ? 'active' : 'inactive'}</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={(o) => { if (!o) reset(); setShowCreateDialog(o) }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Job Role</DialogTitle>
            <DialogDescription>Define a new job role with skills and an hourly rate</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="roleName">Role Name *</Label><Input id="roleName" placeholder="e.g., Senior Developer" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="category">Category</Label><Input id="category" placeholder="e.g., Engineering" value={category} onChange={(e) => setCategory(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="rate">Default Hourly Rate</Label><Input id="rate" type="number" placeholder="0" value={defaultHourlyRate} onChange={(e) => setDefaultHourlyRate(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="skills">Skills (comma-separated)</Label><Input id="skills" placeholder="React, TypeScript, Node.js" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Create Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
