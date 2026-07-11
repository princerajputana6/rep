'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

export interface EnvironmentInfo {
  _id: string
  name: string
  type: 'PRODUCTION' | 'SANDBOX'
  status: 'ACTIVE' | 'ARCHIVED'
  isDefault: boolean
}

interface EnvironmentResponse {
  environments: EnvironmentInfo[]
  sandboxCount: number
  sandboxLimit: number
  canCreateSandbox: boolean
}

interface EnvironmentContextValue extends EnvironmentResponse {
  selectedEnvironmentId: string
  selectedEnvironment: EnvironmentInfo | null
  isLoading: boolean
  setSelectedEnvironmentId: (id: string) => void
  createSandbox: (name: string) => Promise<void>
  reload: () => void
}

const EnvironmentContext = createContext<EnvironmentContextValue | undefined>(undefined)

const emptyResponse: EnvironmentResponse = {
  environments: [],
  sandboxCount: 0,
  sandboxLimit: 1,
  canCreateSandbox: false,
}

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<EnvironmentResponse>(emptyResponse)
  const [selectedEnvironmentId, setSelectedEnvironmentIdState] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(() => {
    setIsLoading(true)
    api.get<EnvironmentResponse>('/admin/environments')
      .then((result) => {
        setData(result)
        setSelectedEnvironmentIdState((current) => {
          if (current && result.environments.some((env) => env._id === current)) return current
          return result.environments.find((env) => env.isDefault)?._id ?? result.environments[0]?._id ?? ''
        })
      })
      .catch(() => {
        setData(emptyResponse)
        setSelectedEnvironmentIdState('')
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const setSelectedEnvironmentId = useCallback((id: string) => {
    setSelectedEnvironmentIdState(id)
    if (typeof window !== 'undefined') localStorage.setItem('rep_environment_id', id)
  }, [])

  const createSandbox = useCallback(async (name: string) => {
    const created = await api.post<EnvironmentInfo>('/admin/environments', { name })
    toast.success(`Sandbox "${created.name}" created.`)
    await api.get<EnvironmentResponse>('/admin/environments')
      .then((result) => {
        setData(result)
        setSelectedEnvironmentId(created._id)
      })
  }, [setSelectedEnvironmentId])

  const selectedEnvironment = useMemo(
    () => data.environments.find((env) => env._id === selectedEnvironmentId) ?? null,
    [data.environments, selectedEnvironmentId]
  )

  const value = useMemo(() => ({
    ...data,
    selectedEnvironmentId,
    selectedEnvironment,
    isLoading,
    setSelectedEnvironmentId,
    createSandbox,
    reload: load,
  }), [data, selectedEnvironmentId, selectedEnvironment, isLoading, setSelectedEnvironmentId, createSandbox, load])

  return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>
}

export function useEnvironmentContext() {
  const context = useContext(EnvironmentContext)
  if (!context) throw new Error('useEnvironmentContext must be used inside EnvironmentProvider')
  return context
}
