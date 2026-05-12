'use client'

import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-white">REP Platform</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-1 text-sm text-white/40">Start managing resources smarter</p>
        </div>
        <SignUp
          appearance={{
            variables: { colorPrimary: '#6366f1', colorBackground: '#0f0f1a', colorText: '#ffffff', colorInputBackground: '#1a1a2e', colorInputText: '#ffffff' },
            elements: { rootBox: 'mx-auto', card: 'bg-[#0f0f1a] border border-white/10 shadow-2xl rounded-2xl', formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-500', headerTitle: 'hidden', headerSubtitle: 'hidden' },
          }}
        />
      </div>
    </div>
  )
}
