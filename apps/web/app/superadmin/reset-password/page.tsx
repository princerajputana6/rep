'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Paper, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material'
import { VpnKeyOutlined } from '@mui/icons-material'

export default function AdminResetPasswordPage() {
  const router = useRouter()
  const [mustReset, setMustReset] = useState(true)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/v1/admin/auth/me')
      .then((r) => r.json())
      .then((j) => { if (j?.success) setMustReset(Boolean(j.data.mustResetPassword)) })
      .catch(() => {})
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (next.length < 8) return setError('New password must be at least 8 characters')
    if (next !== confirm) return setError('Passwords do not match')
    setLoading(true)
    try {
      const res = await fetch('/api/v1/admin/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) return setError(json?.error?.message ?? 'Could not update password')
      router.replace('/superadmin')
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F4F6F8', p: 2, fontFamily: 'Public Sans, sans-serif' }}>
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 440, p: { xs: 3, sm: 5 }, borderRadius: 4, border: '1px solid rgba(145,158,171,.2)', boxShadow: '0 12px 24px -4px rgba(145,158,171,.12)' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'rgba(255,171,0,.14)', display: 'grid', placeItems: 'center', mb: 2 }}>
            <VpnKeyOutlined sx={{ color: '#B76E00' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1C252E' }}>Set a new password</Typography>
          <Typography variant="body2" sx={{ color: '#637381', mt: 0.5, textAlign: 'center' }}>
            {mustReset ? 'For security, choose a new password before continuing.' : 'Update your account password.'}
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {!mustReset && (
            <TextField label="Current password" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} fullWidth required />
          )}
          <TextField label="New password" type="password" value={next} onChange={(e) => setNext(e.target.value)} fullWidth required helperText="At least 8 characters" />
          <TextField label="Confirm new password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} fullWidth required />
          <Button type="submit" disabled={loading} variant="contained" size="large"
            sx={{ mt: 1, py: 1.3, borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#00A76F', '&:hover': { bgcolor: '#007867' } }}>
            {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Update password & continue'}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}
