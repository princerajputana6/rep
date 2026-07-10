'use client'

import { SignOutButton } from '@clerk/nextjs'
import { Box, Paper, Typography, Button } from '@mui/material'
import { BlockOutlined } from '@mui/icons-material'

// Shown to a Clerk-authenticated user who was never invited by an admin.
export default function NotInvitedPage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F4F6F8', p: 2, fontFamily: 'Public Sans, sans-serif' }}>
      <Paper elevation={0} sx={{ maxWidth: 440, p: 5, borderRadius: 4, textAlign: 'center', border: '1px solid rgba(145,158,171,.2)', boxShadow: '0 12px 24px -4px rgba(145,158,171,.12)' }}>
        <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'rgba(255,86,48,.12)', display: 'grid', placeItems: 'center', mx: 'auto', mb: 2 }}>
          <BlockOutlined sx={{ color: '#B71D18' }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1C252E' }}>Access not enabled</Typography>
        <Typography variant="body2" sx={{ color: '#637381', mt: 1, mb: 3 }}>
          This account hasn&apos;t been invited to REP Platform yet. Ask your company administrator
          to add your email address, then sign in again.
        </Typography>
        <SignOutButton redirectUrl="/sign-in">
          <Button variant="contained" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, bgcolor: '#1C252E', '&:hover': { bgcolor: '#000' } }}>
            Sign out
          </Button>
        </SignOutButton>
      </Paper>
    </Box>
  )
}
