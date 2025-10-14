'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: number
  email: string
  name: string
  role: string
  level: string
  daysUntilNext: number
  nextLevel: string | null
  joinDate: string
}

export default function MembersPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/auth/login')
      return
    }
    
    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } catch (err) {
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('user')
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-white/50 font-light animate-pulse">Entering portal...</div>
      </div>
    )
  }

  if (!user) return null

  const getLevelProgress = () => {
    if (user.level === 'Guide') return 100
    const totalDays = user.level === 'Seeker' ? 30 : user.level === 'Explorer' ? 60 : 90
    const progress = ((totalDays - user.daysUntilNext) / totalDays) * 100
    return Math.max(0, Math.min(100, progress))
  }

  const levelStages = ['Seeker', 'Explorer', 'Pathfinder', 'Guide']
  const currentStageIndex = levelStages.indexOf(user.level)

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 border-b border-white/5 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="group">
            <div className="text-2xl font-light tracking-[0.2em] text-white/90 group-hover:text-white transition-colors">
              TRUE NORTH
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="px-5 py-2 text-sm font-light border border-white/10 rounded-md hover:bg-white/5 hover:border-white/20 transition-all"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl">
              <svg className="w-10 h-10 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-light mb-4 tracking-tight">
            Welcome back, <span className="text-white/70">{user.name}</span>
          </h1>
          <p className="text-white/40 text-lg font-light">Your transformation journey continues</p>
        </div>

        {/* Journey Progress Card */}
        <div className="mb-16 backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-md p-10 relative overflow-hidden">
          <div className="relative">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-10">
              {/* Level Info */}
              <div className="text-center lg:text-left flex-1">
                <div className="text-xs tracking-widest text-white/40 mb-3 font-light">YOUR JOURNEY</div>
                <div className="text-5xl font-light mb-4">{user.level}</div>
                {user.nextLevel ? (
                  <div className="text-white/50 font-light">
                    <span className="text-2xl font-light">{user.daysUntilNext}</span> days until {user.nextLevel}
                  </div>
                ) : (
                  <div className="text-white/60 font-light">Journey complete</div>
                )}
              </div>

              {/* Circular Progress Indicator */}
              <div className="relative">
                <svg className="w-48 h-48 -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-white/5"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 88}
                    strokeDashoffset={2 * Math.PI * 88 * (1 - getLevelProgress() / 100)}
                    strokeLinecap="round"
                    className="text-white transition-all duration-1000 ease-out"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-light">{Math.round(getLevelProgress())}%</div>
                  <div className="text-xs text-white/40 font-light mt-1">Complete</div>
                </div>
              </div>
            </div>

            {/* Journey Path */}
            <div className="grid grid-cols-4 gap-3">
              {levelStages.map((stage, index) => {
                const isActive = index <= currentStageIndex
                const isCurrent = index === currentStageIndex
                
                return (
                  <div
                    key={stage}
                    className={`relative p-6 rounded-md transition-all duration-500 ${
                      isCurrent
                        ? 'bg-white/10 border-2 border-white/30 shadow-lg shadow-white/10'
                        : isActive
                        ? 'bg-white/5 border border-white/20'
                        : 'bg-white/[0.02] border border-white/5 opacity-40'
                    }`}
                  >
                    <div className={`text-xs tracking-wider mb-3 font-light transition-colors ${
                      isCurrent ? 'text-white' : 'text-white/50'
                    }`}>
                      {stage.toUpperCase()}
                    </div>
                    <div className="flex items-center justify-center">
                      <div className={`w-3 h-3 rounded-full transition-all ${
                        isCurrent
                          ? 'bg-white shadow-lg shadow-white/50 animate-pulse'
                          : isActive
                          ? 'bg-white/60'
                          : 'bg-white/20'
                      }`}></div>
                    </div>
                    {isCurrent && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Circle Content */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-md p-8 hover:border-white/20 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-light">Circle of Return</h3>
            </div>
            <p className="text-white/50 mb-8 font-light leading-relaxed">
              Exclusive transformational content and teachings
            </p>
            <div className="space-y-3">
              {['Weekly Teaching Videos', 'Live Session Replays', 'Community Discussions'].map((item, i) => (
                <div
                  key={i}
                  className="group p-4 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-white/40 mb-1 font-light">COMING SOON</div>
                      <div className="font-light group-hover:text-white transition-colors">{item}</div>
                    </div>
                    <svg className="w-5 h-5 text-white/20 group-hover:text-white/40 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-md p-8 hover:border-white/20 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-light">Quick Access</h3>
            </div>
            <div className="space-y-3">
              {[
                { title: 'Book a Session', desc: 'Schedule your breakthrough', href: '/work', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                { title: 'Resource Library', desc: 'Transformation tools', href: '/library', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
                { title: 'Get Support', desc: 'Reach out for guidance', href: '/contact', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' }
              ].map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  className="group flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={action.icon} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-light group-hover:text-white transition-colors">{action.title}</div>
                    <div className="text-sm text-white/40 font-light">{action.desc}</div>
                  </div>
                  <svg className="w-5 h-5 text-white/20 group-hover:text-white/40 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-md p-8">
          <h3 className="text-xl font-light mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Account Details
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="text-xs tracking-wider text-white/40 mb-2 font-light">EMAIL ADDRESS</div>
              <div className="font-light text-white/90">{user.email}</div>
            </div>
            <div>
              <div className="text-xs tracking-wider text-white/40 mb-2 font-light">MEMBER SINCE</div>
              <div className="font-light text-white/90">
                {new Date(user.joinDate).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}