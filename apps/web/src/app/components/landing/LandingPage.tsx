'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  Users,
  Briefcase,
  Zap,
  Shield,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Star,
  Globe,
  ChevronRight,
  Activity,
  Target,
  Layers,
} from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Resource Management',
    desc: 'Allocate, track, and optimize your workforce across projects and agencies in real time.',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    icon: BarChart3,
    title: 'Financial Dashboards',
    desc: 'Deep P&L visibility, rate cards, budget alerts, and client profitability insights.',
    color: 'from-violet-500 to-purple-400',
  },
  {
    icon: Zap,
    title: 'AI-Powered Matching',
    desc: 'Intelligent resource matching, predictive planning, and co-pilot recommendations.',
    color: 'from-amber-500 to-orange-400',
  },
  {
    icon: Briefcase,
    title: 'Portfolio & Programs',
    desc: 'Manage portfolios, programs, and projects with full health-score tracking.',
    color: 'from-emerald-500 to-teal-400',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    desc: 'Granular RBAC with custom access rules across agencies and teams.',
    color: 'from-rose-500 to-pink-400',
  },
  {
    icon: TrendingUp,
    title: 'Advanced Analytics',
    desc: 'Time-phased KPIs, capacity heatmaps, hidden capacity detection and more.',
    color: 'from-sky-500 to-blue-400',
  },
]

const stats = [
  { value: '50+', label: 'Modules & Features', icon: Layers },
  { value: '99.9%', label: 'Uptime SLA', icon: Activity },
  { value: '10x', label: 'Faster Decisions', icon: Target },
  { value: '360°', label: 'Resource Visibility', icon: Globe },
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Head of Operations, Apex Agency',
    text: 'REP Platform transformed how we manage cross-agency resources. Borrow requests that took days now happen in minutes.',
    stars: 5,
  },
  {
    name: 'Marcus Williams',
    role: 'CTO, PixelForge',
    text: 'The AI matching engine alone saved us 30% on staffing costs. The predictive planning is genuinely impressive.',
    stars: 5,
  },
  {
    name: 'Priya Nair',
    role: 'Resource Director, BrandLabs',
    text: 'Finally a platform built for agencies. The capacity utilization views give us clarity we never had before.',
    stars: 5,
  },
]

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 1500
          const steps = 60
          const increment = target / steps
          let current = 0
          const timer = setInterval(() => {
            current += increment
            if (current >= target) {
              setCount(target)
              clearInterval(timer)
            } else {
              setCount(Math.floor(current))
            }
          }, duration / steps)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  return (
    <div className="landing-page min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden" style={{ color: '#ffffff', backgroundColor: '#0a0a0f' }}>
      {/* Ambient cursor glow */}
      <div
        className="fixed pointer-events-none z-0 w-[600px] h-[600px] rounded-full opacity-10 transition-transform duration-300"
        style={{
          background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
          left: mousePos.x - 300,
          top: mousePos.y - 300,
        }}
      />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">REP Platform</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#stats" className="hover:text-white transition-colors">Stats</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="text-sm bg-indigo-600 hover:bg-indigo-500 transition-all px-5 py-2 rounded-full font-medium shadow-lg shadow-indigo-600/20"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 text-sm text-indigo-300 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Now with AI Co-Pilot & Predictive Planning
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-none">
            <span className="block text-white">The Operating System</span>
            <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              for Modern Agencies
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Unify resource management, financial intelligence, and AI-powered planning
            across your entire agency network — all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition-all px-8 py-4 rounded-full font-semibold text-lg shadow-2xl shadow-indigo-600/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
            >
              Start Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/sign-in"
              className="flex items-center gap-2 border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all px-8 py-4 rounded-full font-semibold text-lg"
            >
              Sign In
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Social proof bar */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-white/30 text-sm">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> No credit card required
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> SSO via Clerk
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> GDPR compliant
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Deploy in minutes
            </span>
          </div>
        </div>

        {/* Floating dashboard preview */}
        <div className="relative z-10 mt-20 max-w-5xl w-full mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60 bg-[#0f0f1a]">
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-4 text-xs text-white/30 font-mono">rep-platform.app/dashboard</span>
            </div>
            <div className="grid grid-cols-4 gap-4 p-6">
              {[
                { label: 'Active Resources', value: '284', change: '+12%', up: true },
                { label: 'Projects Running', value: '47', change: '+3', up: true },
                { label: 'Utilization Rate', value: '87%', change: '+5%', up: true },
                { label: 'Pending Approvals', value: '8', change: '-2', up: false },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-xs text-white/40 mb-2">{kpi.label}</p>
                  <p className="text-2xl font-bold text-white">{kpi.value}</p>
                  <p className={`text-xs mt-1 ${kpi.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {kpi.change} this month
                  </p>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 grid grid-cols-3 gap-4">
              {['Resource Pool', 'Capacity Map', 'Financial Overview'].map((panel) => (
                <div key={panel} className="bg-white/[0.03] rounded-xl h-28 border border-white/5 flex items-center justify-center">
                  <span className="text-xs text-white/20">{panel}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Glow under the dashboard */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-indigo-600/20 blur-3xl rounded-full" />
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-24 px-6 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            const numMatch = stat.value.match(/\d+/)
            const num = numMatch ? parseInt(numMatch[0]) : 0
            const suffix = stat.value.replace(/\d+/, '')
            return (
              <div key={stat.label} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="text-4xl font-extrabold text-white mb-1">
                  <AnimatedCounter target={num} suffix={suffix} />
                </div>
                <p className="text-sm text-white/40">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything your agency needs
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              50+ modules covering the full lifecycle of agency resource operations.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`inline-flex w-12 h-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} mb-4 shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-white">{feature.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/0 to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-28 px-6 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by agency leaders</h2>
            <p className="text-white/40">Real results from real teams.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl bg-white/[0.04] border border-white/5 flex flex-col gap-4">
                <div className="flex gap-1">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-white/60 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-auto">
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-white/30 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Ready to transform<br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              how you manage resources?
            </span>
          </h2>
          <p className="text-white/40 mb-10 text-lg">
            Sign up in seconds. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="group flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition-all px-10 py-4 rounded-full font-semibold text-lg shadow-2xl shadow-indigo-600/30 hover:-translate-y-0.5"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/sign-in"
              className="flex items-center justify-center gap-2 border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all px-10 py-4 rounded-full font-semibold text-lg"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">REP Platform</span>
          </div>
          <p className="text-white/20 text-sm">
            © {new Date().getFullYear()} REP Platform. All rights reserved.
          </p>
          <div className="flex gap-6 text-white/30 text-sm">
            <Link href="/sign-in" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/sign-up" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
