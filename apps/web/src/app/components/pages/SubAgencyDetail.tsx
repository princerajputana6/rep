'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { networkService, type SubAgency, type Agency } from '@/app/services/networkService'
import { useNavigation } from '@/app/context/NavigationContext'

export function SubAgencyDetail({ subAgencyId }: { subAgencyId: string }) {
  const { navigate } = useNavigation()
  const [sub, setSub] = useState<SubAgency | null>(null)
  const [parent, setParent] = useState<Agency | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    networkService
      .getSubAgency(subAgencyId)
      .then(async (s) => {
        if (cancelled) return
        setSub(s)
        try {
          const p = await networkService.getAgency(s.parentAgencyId)
          if (!cancelled) setParent(p)
        } catch {
          /* parent may not exist */
        }
      })
      .catch((e: Error) => toast.error(e.message ?? 'Failed to load sub-agency'))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [subAgencyId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }
  if (!sub) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('sub-agencies')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Card><CardContent className="p-12 text-center text-gray-500">Sub-agency not found.</CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('sub-agencies')} className="gap-2 w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Sub-Agencies
      </Button>
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">{sub.name}</h1>
        <p className="text-gray-600 mt-1">{sub.agencyType}{sub.location ? ` · ${sub.location}` : ''}</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Sub-Agency Details</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Name" value={sub.name} />
          <Row label="Agency Type" value={sub.agencyType} />
          <Row label="Location" value={sub.location ?? '—'} />
          <Row label="Status" value={<Badge>{sub.status}</Badge>} />
          <Row
            label="Parent Agency"
            value={
              parent ? (
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => navigate('agency-detail', parent._id)}
                >
                  {parent.name}
                </button>
              ) : (
                <span className="text-gray-400">{sub.parentAgencyId}</span>
              )
            }
          />
          <Row label="Created" value={new Date(sub.createdAt).toLocaleString()} />
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-2 last:border-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  )
}
