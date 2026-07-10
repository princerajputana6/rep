'use client'

import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Switch } from '@/app/components/ui/switch'
import {
  Home, ShoppingBag, BarChart3, Landmark, CalendarDays, FileText, GraduationCap,
  Users, Search, Bell, Plus, Facebook, Instagram, Linkedin, Twitter, MoreVertical, Pencil,
} from 'lucide-react'

const nav = {
  OVERVIEW: [
    { icon: Home, label: 'App' },
    { icon: ShoppingBag, label: 'Ecommerce' },
    { icon: BarChart3, label: 'Analytics' },
    { icon: Landmark, label: 'Banking' },
    { icon: CalendarDays, label: 'Booking' },
    { icon: FileText, label: 'File' },
    { icon: GraduationCap, label: 'Course' },
  ],
  MANAGEMENT: [{ icon: Users, label: 'User', active: true }],
}

const cards = [
  { name: 'Jayvion Simon', role: 'CEO', cover: 'linear-gradient(135deg,#1b2a4e,#c88a4b)', f: '9.91k', fo: '1.95k', p: '9.12k' },
  { name: 'Lucian Obrien', role: 'CTO', cover: 'linear-gradient(135deg,#0d7a5f,#f4b740,#e0533d)', f: '1.95k', fo: '9.12k', p: '6.98k' },
  { name: 'Deja Brady', role: 'Project Coordinator', cover: 'linear-gradient(135deg,#7b2ff7,#f107a3,#00c2ba)', f: '9.12k', fo: '6.98k', p: '8.49k' },
]

const rows = [
  { name: 'Angelique Morse', email: 'benny89@yahoo.com', phone: '+46 8 123 456', company: 'Wuckert Inc', role: 'Content Creator', status: 'Banned' },
  { name: 'Ariana Lang', email: 'avery43@hotmail.com', phone: '+54 11 1234-5678', company: 'Feest Group', role: 'IT Administrator', status: 'Pending' },
  { name: 'Aspen Schmitt', email: 'mireya13@hotmail.com', phone: '+34 91 123 4567', company: 'Kihn, Marquardt', role: 'Financial Planner', status: 'Banned' },
  { name: 'Brycen Jimenez', email: 'tyrel@gmail.com', phone: '+52 55 1234 5678', company: 'Rempel, Hand', role: 'HR Recruiter', status: 'Active' },
]

const chipClass: Record<string, string> = {
  Active: 'chip-success', Pending: 'chip-warning', Banned: 'chip-error',
}

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('')
  return (
    <div className="grid place-items-center rounded-full font-bold text-white shrink-0"
      style={{ width: size, height: size, background: 'linear-gradient(135deg,#00A76F,#5BE49B)', fontSize: size * 0.36 }}>
      {initials}
    </div>
  )
}

export default function UIPreview() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-[280px] shrink-0 border-r border-sidebar-border bg-sidebar hidden lg:flex flex-col">
        <div className="flex items-center gap-2 px-6 h-16">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground font-extrabold">R</div>
          <span className="font-extrabold text-lg">REP</span>
        </div>
        <nav className="px-4 py-2 space-y-6 overflow-y-auto">
          {Object.entries(nav).map(([group, items]) => (
            <div key={group}>
              <p className="px-3 mb-1 text-[11px] font-bold tracking-wider text-muted-foreground">{group}</p>
              <div className="space-y-1">
                {items.map((it) => {
                  const Icon = it.icon
                  const active = 'active' in it && it.active
                  return (
                    <button key={it.label}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                        active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-foreground/80 hover:bg-muted'
                      }`}>
                      <Icon className="size-5" strokeWidth={active ? 2.4 : 1.9} />
                      {it.label}
                    </button>
                  )
                })}
                {'active' in items[0] || group === 'MANAGEMENT' ? (
                  <div className="ml-4 border-l border-border pl-4 space-y-1 pt-1">
                    {['Profile', 'Cards', 'List', 'Create', 'Account'].map((s) => (
                      <button key={s}
                        className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                          s === 'Cards' ? 'font-bold text-foreground' : 'text-muted-foreground hover:text-foreground'
                        }`}>{s}</button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
          <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-1.5">
            <div className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-primary to-emerald-300 text-[10px] font-bold text-white">T1</div>
            <span className="text-sm font-bold">Team 1</span>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">Free</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              <Search className="size-4" /> <span>Search…</span>
              <kbd className="ml-2 rounded bg-background px-1.5 text-[11px] font-semibold shadow-sm">⌘K</kbd>
            </div>
            <button className="relative grid size-9 place-items-center rounded-full hover:bg-muted">
              <Bell className="size-5" />
              <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-white">4</span>
            </button>
            <Avatar name="Jaydon Frankie" size={36} />
          </div>
        </header>

        <main className="p-6 lg:p-8 max-w-[1200px] space-y-8">
          {/* Page header */}
          <div className="flex items-start justify-between">
            <div>
              <h1>Cards</h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span>Dashboard</span><span className="text-primary">•</span>
                <span>User</span><span className="text-primary">•</span>
                <span className="text-muted-foreground/70">Cards</span>
              </div>
            </div>
            <Button className="gap-2 rounded-lg bg-foreground text-background hover:bg-foreground/90 h-10 px-4">
              <Plus className="size-4" /> Add user
            </Button>
          </div>

          {/* Buttons + chips showcase */}
          <section className="rounded-2xl border border-border bg-card p-6 space-y-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h3>Design tokens</h3>
            <div className="flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip-success rounded-md px-2 py-1 text-xs font-bold">Active</span>
              <span className="chip-warning rounded-md px-2 py-1 text-xs font-bold">Pending</span>
              <span className="chip-error rounded-md px-2 py-1 text-xs font-bold">Banned</span>
              <span className="chip-info rounded-md px-2 py-1 text-xs font-bold">Info</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Input placeholder="Full name" className="max-w-xs" />
              <div className="flex items-center gap-2 text-sm font-semibold"><Switch defaultChecked /> Email verified</div>
            </div>
          </section>

          {/* Profile cards */}
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((c) => (
              <div key={c.name} className="card-hover overflow-hidden rounded-2xl border border-border bg-card" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="relative h-28" style={{ background: c.cover }}>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-full ring-4 ring-card">
                    <Avatar name={c.name} size={64} />
                  </div>
                </div>
                <div className="pt-12 pb-5 text-center">
                  <p className="font-bold">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.role}</p>
                  <div className="mt-3 flex justify-center gap-4 text-muted-foreground">
                    <Facebook className="size-4" /><Instagram className="size-4" /><Linkedin className="size-4" /><Twitter className="size-4" />
                  </div>
                </div>
                <div className="grid grid-cols-3 border-t border-dashed border-border py-4 text-center">
                  {[['Follower', c.f], ['Following', c.fo], ['Total post', c.p]].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-[11px] text-muted-foreground">{k}</p>
                      <p className="font-bold text-sm">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* List table */}
          <section className="rounded-2xl border border-border bg-card" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex gap-6 border-b border-border px-6 pt-3">
              {[['All', 20], ['Active', 2], ['Pending', 10], ['Banned', 6]].map(([t, n], i) => (
                <button key={t as string} className={`flex items-center gap-2 pb-3 text-sm font-semibold ${i === 0 ? 'border-b-2 border-foreground text-foreground' : 'text-muted-foreground'}`}>
                  {t} <span className="rounded-md bg-muted px-1.5 text-xs font-bold">{n}</span>
                </button>
              ))}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="px-6 py-3 font-semibold">Name</th>
                  <th className="px-6 py-3 font-semibold">Phone</th>
                  <th className="px-6 py-3 font-semibold">Company</th>
                  <th className="px-6 py-3 font-semibold">Role</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.email} className="border-t border-border hover:bg-muted/50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.name} />
                        <div>
                          <p className="font-semibold">{r.name}</p>
                          <p className="text-xs text-muted-foreground">{r.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{r.phone}</td>
                    <td className="px-6 py-3 text-muted-foreground">{r.company}</td>
                    <td className="px-6 py-3 text-muted-foreground">{r.role}</td>
                    <td className="px-6 py-3"><span className={`${chipClass[r.status]} rounded-md px-2 py-1 text-xs font-bold`}>{r.status}</span></td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-1 text-muted-foreground">
                        <button className="grid size-8 place-items-center rounded-lg hover:bg-muted"><Pencil className="size-4" /></button>
                        <button className="grid size-8 place-items-center rounded-lg hover:bg-muted"><MoreVertical className="size-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </div>
  )
}
