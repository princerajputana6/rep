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
  login: (identifier: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// Identity comes from our own session cookie via /api/v1/auth/me.
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch('/api/v1/auth/me')
      .then((r) => r.json())
      .then((json) => {
        if (!active) return
        setUser(json?.data?.authenticated ? json.data.user : null)
      })
      .catch(() => active && setUser(null))
      .finally(() => active && setIsLoading(false))
    return () => {
      active = false
    }
  }, [])

  // Mirror to localStorage so non-context consumers can read role synchronously.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (user) localStorage.setItem('rep_user', JSON.stringify(user))
    else localStorage.removeItem('rep_user')
  }, [user])

  const login = async (identifier: string, password: string) => {
    setError(null)
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    })
    const json = await res.json()
    if (!res.ok || !json.success) {
      setError(json?.error?.message ?? 'Sign in failed')
      return
    }
    router.replace(json.data.redirectTo ?? '/dashboard')
  }

  const logout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' }).catch(() => {})
    setUser(null)
    router.replace('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token: null,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        clearError: () => setError(null),
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
