'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box, Paper, TextField, Button, Typography, Alert, InputAdornment, IconButton, CircularProgress,
} from '@mui/material'
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material'

const GREEN = '#00A76F'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/v1/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json?.error?.message ?? 'Sign in failed')
        return
      }
      if (json.data.mustResetPassword) router.push('/superadmin/reset-password')
      else router.replace('/superadmin')
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F4F6F8', p: 2, fontFamily: 'Public Sans, sans-serif' }}>
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 420, p: { xs: 3, sm: 5 }, borderRadius: 4, border: '1px solid rgba(145,158,171,.2)', boxShadow: '0 12px 24px -4px rgba(145,158,171,.12)' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'rgba(0,167,111,.12)', display: 'grid', placeItems: 'center', mb: 2 }}>
            <LockOutlined sx={{ color: GREEN }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1C252E' }}>Admin sign in</Typography>
          <Typography variant="body2" sx={{ color: '#637381', mt: 0.5 }}>REP Platform · Super Admin & Company Admin</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus fullWidth required autoComplete="username" />
          <TextField
            label="Password" type={show ? 'text' : 'password'} value={password}
            onChange={(e) => setPassword(e.target.value)} fullWidth required autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShow((s) => !s)} edge="end">{show ? <VisibilityOff /> : <Visibility />}</IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button type="submit" disabled={loading} variant="contained" size="large"
            sx={{ mt: 1, py: 1.3, borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#1C252E', '&:hover': { bgcolor: '#000' } }}>
            {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Sign in'}
          </Button>
        </Box>
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#919EAB', mt: 3 }}>
          Regular team members sign in via the app login, not here.
        </Typography>
      </Paper>
    </Box>
  )
}
