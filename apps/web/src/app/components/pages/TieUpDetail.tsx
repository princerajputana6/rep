'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { networkService, type TieUp, type Agency } from '@/app/services/networkService'
import { useNavigation } from '@/app/context/NavigationContext'

const STATUS_TONE: Record<TieUp['status'], string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  EXPIRING_SOON: 'bg-amber-100 text-amber-700',
  EXPIRED: 'bg-red-100 text-red-700',
  INACTIVE: 'bg-gray-100 text-gray-700',
}

export function TieUpDetail({ tieUpId }: { tieUpId: string }) {
  const { navigate } = useNavigation()
  const [tu, setTu] = useState<TieUp | null>(null)
  const [from, setFrom] = useState<Agency | null>(null)
  const [to, setTo] = useState<Agency | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    networkService
      .getTieUp(tieUpId)
      .then(async (t) => {
        if (cancelled) return
        setTu(t)
        const [f, x] = await Promise.allSettled([
          networkService.getAgency(t.fromAgencyId),
          networkService.getAgency(t.toAgencyId),
        ])
        if (!cancelled) {
          if (f.status === 'fulfilled') setFrom(f.value)
          if (x.status === 'fulfilled') setTo(x.value)
        }
      })
      .catch((e: Error) => toast.error(e.message ?? 'Failed to load tie-up'))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [tieUpId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }
  if (!tu) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('tie-ups')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Card><CardContent className="p-12 text-center text-gray-500">Tie-up not found.</CardContent></Card>
      </div>
    )
  }

  const agencyLink = (a: Agency | null, fallback: string) =>
    a ? (
      <button className="text-blue-600 hover:underline" onClick={() => navigate('agency-detail', a._id)}>
        {a.name}
      </button>
    ) : (
      <span className="text-gray-400">{fallback}</span>
    )

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('tie-ups')} className="gap-2 w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Tie-Ups
      </Button>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">{tu.code}</h1>
          <p className="text-gray-600 mt-1">
            {from?.name ?? tu.fromAgencyId} → {to?.name ?? tu.toAgencyId}
          </p>
        </div>
        <Badge className={STATUS_TONE[tu.status]}>{tu.status}</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle>Contract Details</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Code" value={tu.code} />
          <Row label="From Agency" value={agencyLink(from, tu.fromAgencyId)} />
          <Row label="To Agency" value={agencyLink(to, tu.toAgencyId)} />
          <Row label="Permitted Roles" value={tu.permittedRoles.length ? tu.permittedRoles.join(', ') : '—'} />
          <Row label="Rate Card" value={tu.rateCardId ?? '—'} />
          <Row label="Valid From" value={tu.validFrom ? new Date(tu.validFrom).toLocaleDateString() : '—'} />
          <Row label="Valid To" value={tu.validTo ? new Date(tu.validTo).toLocaleDateString() : '—'} />
          <Row label="Active Allocations" value={String(tu.activeAllocations)} />
          <Row label="Total Value" value={`$${tu.totalValue.toLocaleString()}`} />
          {tu.notes && <Row label="Notes" value={tu.notes} />}
          <Row label="Created" value={new Date(tu.createdAt).toLocaleString()} />
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
