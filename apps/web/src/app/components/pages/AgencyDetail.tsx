'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/app/components/ui/accordion'
import { ArrowLeft, Users, Briefcase, FolderKanban, ListChecks, IdCard, Receipt, Building2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { networkService, type AgencySummary } from '@/app/services/networkService'
import { useNavigation } from '@/app/context/NavigationContext'

interface SectionConfig {
  key: 'users' | 'portfolios' | 'projects' | 'tasks' | 'jobRoles' | 'rateCards' | 'clients'
  label: string
  icon: typeof Users
  fetcher: (agencyId: string) => Promise<unknown[]>
  renderRow: (row: Record<string, unknown>) => React.ReactNode
}

// 7 accordion sections, in the order the user requested.
const SECTIONS: SectionConfig[] = [
  {
    key: 'users',
    label: 'Users',
    icon: Users,
    fetcher: networkService.agencyUsers,
    renderRow: (r) => (
      <>
        <span className="font-medium">{String(r.name ?? r.email ?? '—')}</span>
        <span className="text-xs text-gray-500">{String(r.email ?? '')}</span>
        <Badge variant="outline">{String(r.role ?? '—')}</Badge>
      </>
    ),
  },
  {
    key: 'portfolios',
    label: 'Portfolio',
    icon: Briefcase,
    fetcher: networkService.agencyPortfolios,
    renderRow: (r) => (
      <>
        <span className="font-medium">{String(r.name ?? '—')}</span>
        <Badge variant="outline">{String(r.status ?? 'ACTIVE')}</Badge>
      </>
    ),
  },
  {
    key: 'projects',
    label: 'Projects',
    icon: FolderKanban,
    fetcher: networkService.agencyProjects,
    renderRow: (r) => (
      <>
        <span className="font-medium">{String(r.name ?? '—')}</span>
        <Badge variant="outline">{String(r.status ?? 'ACTIVE')}</Badge>
        {typeof r.budget === 'number' && <span className="text-xs text-gray-500">${r.budget.toLocaleString()}</span>}
      </>
    ),
  },
  {
    key: 'tasks',
    label: 'Tasks',
    icon: ListChecks,
    fetcher: networkService.agencyTasks,
    renderRow: (r) => (
      <>
        <span className="font-medium">{String(r.title ?? '—')}</span>
        <Badge variant="outline">{String(r.status ?? 'TODO')}</Badge>
        <Badge variant="secondary">{String(r.priority ?? 'MEDIUM')}</Badge>
      </>
    ),
  },
  {
    key: 'jobRoles',
    label: 'Job Role',
    icon: IdCard,
    fetcher: networkService.agencyJobRoles,
    renderRow: (r) => (
      <>
        <span className="font-medium">{String(r.name ?? '—')}</span>
        {r.category && <Badge variant="outline">{String(r.category)}</Badge>}
        {typeof r.defaultHourlyRate === 'number' && (
          <span className="text-xs text-gray-500">${r.defaultHourlyRate}/hr</span>
        )}
      </>
    ),
  },
  {
    key: 'rateCards',
    label: 'Rate Card',
    icon: Receipt,
    fetcher: networkService.agencyRateCards,
    renderRow: (r) => (
      <>
        <span className="font-medium">{String(r.name ?? '—')}</span>
        <Badge variant="outline">{String(r.currency ?? 'USD')}</Badge>
      </>
    ),
  },
  {
    key: 'clients',
    label: 'Client Master',
    icon: Building2,
    fetcher: networkService.agencyClients,
    renderRow: (r) => (
      <>
        <span className="font-medium">{String(r.name ?? '—')}</span>
        {r.industry && <span className="text-xs text-gray-500">{String(r.industry)}</span>}
        <Badge variant="outline">{String(r.status ?? 'ACTIVE')}</Badge>
      </>
    ),
  },
]

interface SectionState {
  loaded: boolean
  loading: boolean
  rows: Record<string, unknown>[]
  error: string | null
}

const emptySection: SectionState = { loaded: false, loading: false, rows: [], error: null }

export function AgencyDetail({ agencyId }: { agencyId: string }) {
  const { navigate } = useNavigation()
  const [summary, setSummary] = useState<AgencySummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [sections, setSections] = useState<Record<string, SectionState>>(() =>
    Object.fromEntries(SECTIONS.map((s) => [s.key, emptySection]))
  )

  useEffect(() => {
    let cancelled = false
    setSummaryLoading(true)
    networkService
      .getAgencySummary(agencyId)
      .then((res) => {
        if (!cancelled) setSummary(res)
      })
      .catch((e: Error) => {
        if (!cancelled) toast.error(e.message ?? 'Failed to load agency')
      })
      .finally(() => {
        if (!cancelled) setSummaryLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [agencyId])

  // Lazy-load a section when its accordion opens for the first time.
  const handleAccordionChange = (openKey: string | undefined) => {
    if (!openKey) return
    const section = SECTIONS.find((s) => s.key === openKey)
    if (!section) return
    const state = sections[openKey]
    if (state.loaded || state.loading) return

    setSections((prev) => ({ ...prev, [openKey]: { ...prev[openKey], loading: true } }))
    section
      .fetcher(agencyId)
      .then((rows) => {
        setSections((prev) => ({
          ...prev,
          [openKey]: { loaded: true, loading: false, rows: rows as Record<string, unknown>[], error: null },
        }))
      })
      .catch((e: Error) => {
        setSections((prev) => ({
          ...prev,
          [openKey]: { loaded: true, loading: false, rows: [], error: e.message ?? 'Failed' },
        }))
      })
  }

  if (summaryLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('agencies')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Card>
          <CardContent className="p-12 text-center text-gray-500">Agency not found.</CardContent>
        </Card>
      </div>
    )
  }

  const { agency, counts } = summary

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('agencies')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Agencies
          </Button>
        </div>
        <Badge className={agency.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : ''}>
          {agency.status}
        </Badge>
      </div>

      <div>
        <h1 className="text-3xl font-semibold text-gray-900">{agency.name}</h1>
        <p className="text-gray-600 mt-1">Owned by {agency.owner} · Joined {new Date(agency.createdAt).toLocaleDateString()}</p>
      </div>

      {/* Two-column layout: accordion left, agency info right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT — Accordion */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sections</CardTitle>
            </CardHeader>
            <CardContent className="px-2">
              <Accordion type="single" collapsible onValueChange={handleAccordionChange}>
                {SECTIONS.map((s) => {
                  const Icon = s.icon
                  const count = counts[s.key]
                  const state = sections[s.key]
                  return (
                    <AccordionItem value={s.key} key={s.key}>
                      <AccordionTrigger className="px-2 hover:no-underline">
                        <span className="flex items-center gap-2 text-sm">
                          <Icon className="w-4 h-4 text-gray-500" />
                          {s.label}
                          <Badge variant="secondary" className="ml-auto">{count}</Badge>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-2">
                        {state.loading && (
                          <div className="py-4 text-center text-sm text-gray-500">
                            <Loader2 className="w-4 h-4 inline animate-spin mr-2" /> Loading…
                          </div>
                        )}
                        {state.error && (
                          <div className="py-4 text-sm text-red-600">{state.error}</div>
                        )}
                        {state.loaded && !state.error && state.rows.length === 0 && (
                          <div className="py-4 text-sm text-gray-500">No {s.label.toLowerCase()} yet.</div>
                        )}
                        {state.loaded && state.rows.length > 0 && (
                          <div className="space-y-2 py-2">
                            {state.rows.slice(0, 25).map((row, i) => (
                              <div
                                key={String(row._id ?? i)}
                                className="flex flex-wrap items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-50 text-sm"
                              >
                                {s.renderRow(row)}
                              </div>
                            ))}
                            {state.rows.length > 25 && (
                              <div className="text-xs text-gray-400 px-2">
                                Showing 25 of {state.rows.length}
                              </div>
                            )}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT — Agency info */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agency Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Name" value={agency.name} />
              <Row label="Owner" value={agency.owner} />
              <Row label="Owner Email" value={agency.ownerEmail} />
              <Row label="Participation Level" value={agency.participationLevel} />
              <Row label="Total Resources" value={String(agency.totalResources ?? 0)} />
              <Row label="Status" value={agency.status} />
              <Row label="Created" value={new Date(agency.createdAt).toLocaleString()} />
              <Row label="Last Updated" value={new Date(agency.updatedAt).toLocaleString()} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>At a Glance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'Users', value: counts.users },
                  { label: 'Portfolios', value: counts.portfolios },
                  { label: 'Projects', value: counts.projects },
                  { label: 'Tasks', value: counts.tasks },
                  { label: 'Job Roles', value: counts.jobRoles },
                  { label: 'Rate Cards', value: counts.rateCards },
                  { label: 'Clients', value: counts.clients },
                  { label: 'Resources', value: counts.resources },
                  { label: 'Sub-Agencies', value: counts.subAgencies },
                  { label: 'Tie-Ups', value: counts.tieUps },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 rounded-lg bg-gray-50">
                    <div className="text-xs text-gray-500">{stat.label}</div>
                    <div className="text-xl font-semibold text-gray-900">{stat.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-2 last:border-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  )
}
