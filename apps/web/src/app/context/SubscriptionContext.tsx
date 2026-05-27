'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '@/lib/api'
import type { ModuleKey } from '@/lib/modules'

export interface Subscription {
  agencyId: string
  plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE' | 'CUSTOM'
  status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED'
  enabledModules: string[]
  isSuperAdmin: boolean
}

interface SubscriptionContextValue {
  subscription: Subscription | null
  loading: boolean
  hasModule: (key: ModuleKey) => boolean
  isSuperAdmin: boolean
  reload: () => void
}

const Ctx = createContext<SubscriptionContextValue | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    api.get<Subscription>('/me/subscription')
      .then(setSubscription)
      .catch(() => setSubscription(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const hasModule = useCallback((key: ModuleKey) => {
    if (!subscription) return false
    if (subscription.isSuperAdmin) return true
    return subscription.enabledModules.includes(key)
  }, [subscription])

  const value = useMemo(() => ({
    subscription,
    loading,
    hasModule,
    isSuperAdmin: subscription?.isSuperAdmin ?? false,
    reload: load,
  }), [subscription, loading, hasModule, load])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSubscription() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useSubscription must be used inside SubscriptionProvider')
  return c
}
