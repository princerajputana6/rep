'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Loader2 } from 'lucide-react'

// Forced first-login reset (temporary password) and voluntary password change.
export default function ResetPasswordPage() {
  const router = useRouter()
  const [forced, setForced] = useState(true)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then((r) => r.json())
      .then((j) => {
        if (!j?.data?.authenticated) router.replace('/login')
        else setForced(Boolean(j.data.user.mustResetPassword))
      })
      .catch(() => {})
  }, [router])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (next.length < 8) return setError('New password must be at least 8 characters')
    if (next !== confirm) return setError('Passwords do not match')
    setLoading(true)
    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) return setError(json?.error?.message ?? 'Could not update password')
      router.replace(json.data.redirectTo ?? '/dashboard')
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  const field =
    'h-11 w-full rounded-lg border border-input bg-input-background px-3.5 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 grid size-12 place-items-center rounded-full bg-[var(--warning-bg)]">
            <KeyRound className="size-5 text-[var(--warning-fg)]" />
          </div>
          <h1 className="text-2xl font-extrabold">Set a new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {forced ? 'For security, choose a new password before continuing.' : 'Update your account password.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {!forced && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Current password</label>
              <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required className={field} />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-semibold">New password</label>
            <input type="password" value={next} onChange={(e) => setNext(e.target.value)} required className={field} />
            <p className="mt-1 text-xs text-muted-foreground">At least 8 characters</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Confirm new password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className={field} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-11 items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-bold transition hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : 'Update password & continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
