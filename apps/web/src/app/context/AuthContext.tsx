'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [dbUser, setDbUser] = useState<AuthUser | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

  useEffect(() => {
    if (isLoaded && clerkUser && !dbUser) {
      setIsLoadingProfile(true)
      fetch('/api/v1/auth/me')
        .then((r) => r.json())
        .then((json) => {
          if (json.success && json.data) {
            setDbUser({
              id: json.data._id ?? json.data.clerkId,
              email: json.data.email,
              name: json.data.name,
              role: json.data.role,
              agencyId: json.data.agencyId,
            })
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingProfile(false))
    }
    if (!clerkUser) setDbUser(null)
  }, [isLoaded, clerkUser])

  const clerkFallbackUser: AuthUser | null = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
        name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || 'User',
        role: (clerkUser.publicMetadata?.role as string) ?? 'VIEWER',
        agencyId: (clerkUser.publicMetadata?.agencyId as string) ?? '',
      }
    : null

  const login = async (_email: string, _password: string) => {
    router.push('/sign-in')
  }

  const logout = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <AuthContext.Provider
      value={{
        user: dbUser ?? clerkFallbackUser,
        token: null,
        isAuthenticated: isLoaded && !!clerkUser,
        isLoading: !isLoaded,
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
