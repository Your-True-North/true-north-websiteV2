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
        <div className="text-white/50 font-light">Loading your journey...</div>
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

  return (
    <div className="min-h-screen bg-[#0a0a0b] relative overflow-hidden">
      {/* Mystical Background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <Link href="/" className="text-xl font-light text-white tracking-wider hover:opacity-80 transition-opacity">
            TRUE NORTH
          </Link>
          <button
            onClick={handleLogout}
            className="px-6 py-2 text-sm font-light border border-white/10 rounded-md hover:bg-white/5 transition-all text-white"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Welcome */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-light text-white mb-4 tracking-wide">
            Welcome Back, <span className="text-white/70">{user.name}</span>
          </h1>
          <p className="text-white/40 text-lg font-light">Your transformation continues</p>
        </div>

        {/* Progress Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-md p-12 mb-12 relative overflow-hidden">
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
          
          <div className="relative">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
              <div className="text-center md:text-left">
                <p className="text-white/50 text-sm font-light mb-2 tracking-wide">CURRENT LEVEL</p>
                <h2 className="text-4xl font-light text-white mb-3">{user.level}</h2>
                {user.nextLevel && (
                  <p className="text-white/40 font-light">
                    {user.daysUntilNext} days until <span className="text-white/60">{user.nextLevel}</span>
                  </p>
                )}
                {user.level === 'Guide' && (
                  <p className="text-white/60 font-light">You've mastered the journey</p>
                )}
              </div>
              
              {/* Circular Progress */}
              <div className="relative w-40 h-40">
                <svg className="transform -rotate-90 w-40 h-40">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-white/10"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - getLevelProgress() / 100)}`}
                    className="text-white transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-light text-white">{Math.round(getLevelProgress())}%</span>
                </div>
              </div>
            </div>

            {/* Level Path */}
            <div className="grid grid-cols-4 gap-4">
              {['Seeker', 'Explorer', 'Pathfinder', 'Guide'].map((level, index) => (
                <div 
                  key={level}
                  className={`text-center p-4 rounded-md transition-all ${
                    user.level === level 
                      ? 'bg-white/10 border border-white/20' 
                      : 'bg-white/5 border border-white/5 opacity-40'
                  }`}
                >
                  <div className="text-xs text-white/70 mb-2 font-light tracking-wide">{level.toUpperCase()}</div>
                  <div className="w-2 h-2 bg-white rounded-full mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Circle Content */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-md p-8">
            <h3 className="text-2xl font-light text-white mb-6">Circle of Return</h3>
            <p className="text-white/40 mb-8 font-light leading-relaxed">
              Your exclusive member content and transformational resources
            </p>
            <div className="space-y-4">
              {[
                { title: 'Weekly Teaching Videos', status: 'Coming Soon' },
                { title: 'Live Session Replays', status: 'Coming Soon' },
                { title: 'Community Discussions', status: 'Coming Soon' }
              ].map((item, i) => (
                <div 
                  key={i}
                  className="p-5 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                  <div className="text-xs text-white/40 mb-1 font-light">{item.status}</div>
                  <div className="font-light text-white group-hover:text-white transition-colors">{item.title}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-md p-8">
            <h3 className="text-2xl font-light text-white mb-6">Quick Access</h3>
            <div className="space-y-4">
              {[
                { title: 'Book a Session', desc: 'Schedule your next breakthrough', href: '/work' },
                { title: 'Resource Library', desc: 'Access transformation tools', href: '/library' },
                { title: 'Get Support', desc: 'Reach out for guidance', href: '/contact' }
              ].map((item, i) => (
                <Link 
                  key={i}
                  href={item.href}
                  className="block p-5 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                  <div className="font-light text-white mb-1 group-hover:text-white transition-colors">{item.title}</div>
                  <div className="text-sm text-white/40 font-light">{item.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-md p-8 mt-8">
          <h3 className="text-xl font-light text-white mb-6">Account Information</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="text-sm text-white/40 mb-2 font-light tracking-wide">EMAIL</div>
              <div className="font-light text-white">{user.email}</div>
            </div>
            <div>
              <div className="text-sm text-white/40 mb-2 font-light tracking-wide">MEMBER SINCE</div>
              <div className="font-light text-white">{new Date(user.joinDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
