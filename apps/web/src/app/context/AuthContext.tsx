'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  agencyId: string
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// Identity now comes from the unified /api/v1/auth/session endpoint, which
// accepts either an admin password session or a provisioned Clerk user. This
// keeps the portal usable by admins even when Clerk isn't configured.
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [kind, setKind] = useState<'admin' | 'clerk' | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch('/api/v1/auth/session')
      .then((r) => r.json())
      .then((json) => {
        if (!active) return
        if (json?.success && json.data?.authenticated) {
          setUser(json.data.user)
          setKind(json.data.kind)
        } else {
          setUser(null)
          setKind(null)
        }
      })
      .catch(() => active && setUser(null))
      .finally(() => active && setIsLoading(false))
    return () => {
      active = false
    }
  }, [])

  // Mirror the user to localStorage so non-context consumers (e.g. the Sidebar's
  // role-gated section) can read role synchronously.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (user) localStorage.setItem('rep_user', JSON.stringify(user))
    else localStorage.removeItem('rep_user')
  }, [user])

  const login = async () => {
    router.push('/sign-in')
  }

  const logout = async () => {
    if (kind === 'admin') {
      await fetch('/api/v1/admin/auth/logout', { method: 'POST' }).catch(() => {})
      setUser(null)
      router.push('/superadmin/login')
      return
    }
    // Clerk users: hand off to the Clerk sign-out page.
    setUser(null)
    router.push('/sign-in')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token: null,
        isAuthenticated: !!user,
        isLoading,
        error: null,
        login,
        logout,
        clearError: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
