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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
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
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            True North
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm border border-zinc-700 rounded hover:bg-zinc-900 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name}</h1>
          <p className="text-gray-400">Your transformation continues</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">{user.level}</h2>
              {user.nextLevel && (
                <p className="text-gray-400">
                  {user.daysUntilNext} days until {user.nextLevel}
                </p>
              )}
              {user.level === 'Guide' && (
                <p className="text-gray-400">You've reached the highest level</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">Progress</div>
              <div className="text-2xl font-bold">{Math.round(getLevelProgress())}%</div>
            </div>
          </div>
          
          <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${getLevelProgress()}%` }}
            />
          </div>

          <div className="mt-6 grid grid-cols-4 gap-4 text-center">
            <div className={user.level === 'Seeker' ? 'opacity-100' : 'opacity-40'}>
              <div className="text-xs text-gray-400 mb-1">Seeker</div>
              <div className="w-2 h-2 bg-white rounded-full mx-auto" />
            </div>
            <div className={user.level === 'Explorer' ? 'opacity-100' : 'opacity-40'}>
              <div className="text-xs text-gray-400 mb-1">Explorer</div>
              <div className="w-2 h-2 bg-white rounded-full mx-auto" />
            </div>
            <div className={user.level === 'Pathfinder' ? 'opacity-100' : 'opacity-40'}>
              <div className="text-xs text-gray-400 mb-1">Pathfinder</div>
              <div className="w-2 h-2 bg-white rounded-full mx-auto" />
            </div>
            <div className={user.level === 'Guide' ? 'opacity-100' : 'opacity-40'}>
              <div className="text-xs text-gray-400 mb-1">Guide</div>
              <div className="w-2 h-2 bg-white rounded-full mx-auto" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
            <h3 className="text-xl font-bold mb-4">Circle of Return Content</h3>
            <p className="text-gray-400 mb-6">
              Your exclusive member content will appear here
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-black rounded border border-zinc-800">
                <div className="text-sm text-gray-400 mb-1">Coming Soon</div>
                <div className="font-medium">Weekly Teaching Videos</div>
              </div>
              <div className="p-4 bg-black rounded border border-zinc-800">
                <div className="text-sm text-gray-400 mb-1">Coming Soon</div>
                <div className="font-medium">Live Session Replays</div>
              </div>
              <div className="p-4 bg-black rounded border border-zinc-800">
                <div className="text-sm text-gray-400 mb-1">Coming Soon</div>
                <div className="font-medium">Community Discussions</div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
            <div className="space-y-4">
              <Link 
                href="/work"
                className="block p-4 bg-black rounded border border-zinc-800 hover:border-white transition-colors"
              >
                <div className="font-medium mb-1">Book a Session</div>
                <div className="text-sm text-gray-400">Schedule your next breakthrough</div>
              </Link>
              
              <Link 
                href="/library"
                className="block p-4 bg-black rounded border border-zinc-800 hover:border-white transition-colors"
              >
                <div className="font-medium mb-1">Resource Library</div>
                <div className="text-sm text-gray-400">Access your transformation tools</div>
              </Link>
              
              <Link 
                href="/contact"
                className="block p-4 bg-black rounded border border-zinc-800 hover:border-white transition-colors"
              >
                <div className="font-medium mb-1">Get Support</div>
                <div className="text-sm text-gray-400">Reach out for guidance</div>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <h3 className="text-xl font-bold mb-4">Account Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-400 mb-1">Email</div>
              <div className="font-medium">{user.email}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Member Since</div>
              <div className="font-medium">{new Date(user.joinDate).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
