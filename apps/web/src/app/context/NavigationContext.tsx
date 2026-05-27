'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Page } from '@/app/App'

interface NavigationContextValue {
  currentPage: Page
  detailId: string | null
  navigate: (page: Page, detailId?: string | null) => void
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined)

export function NavigationProvider({
  initialPage = 'home',
  onPageChange,
  children,
}: {
  initialPage?: Page
  onPageChange?: (page: Page) => void
  children: ReactNode
}) {
  const [currentPage, setCurrentPage] = useState<Page>(initialPage)
  const [detailId, setDetailId] = useState<string | null>(null)

  const navigate = useCallback(
    (page: Page, id?: string | null) => {
      setDetailId(id ?? null)
      setCurrentPage(page)
      onPageChange?.(page)
    },
    [onPageChange]
  )

  const value = useMemo(() => ({ currentPage, detailId, navigate }), [currentPage, detailId, navigate])

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

export function useNavigation() {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error('useNavigation must be used inside NavigationProvider')
  return ctx
}
