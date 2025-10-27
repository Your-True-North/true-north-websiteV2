'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface UserProfile {
  id: string
  email: string
  name: string
  createdAt: string
  level: 'seeker' | 'explorer' | 'pathfinder' | 'guide'
  progress: number
  profilePhoto?: string
  completedMilestones?: string[]
  currentStreak?: number
  totalSessions?: number
  joinedDate?: string
}

export default function MembersPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/session')
      if (!res.ok) {
        router.push('/auth/login')
        return
      }
      const data = await res.json()
      setUser(data.user)
      setEditForm({
        name: data.user.name || '',
        email: data.user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = document.createElement('img')
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          canvas.width = 500
          canvas.height = 500
          
          ctx?.drawImage(img, 0, 0, 500, 500)
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                if (blob.size <= 500 * 1024) {
                  resolve(blob)
                } else {
                  canvas.toBlob(
                    (compressedBlob) => {
                      resolve(compressedBlob || blob)
                    },
                    'image/jpeg',
                    0.7
                  )
                }
              } else {
                reject(new Error('Failed to compress image'))
              }
            },
            'image/jpeg',
            0.85
          )
        }
        img.onerror = () => reject(new Error('Failed to load image'))
      }
      reader.onerror = reject
    })
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be under 5MB' })
      return
    }

    setUploading(true)
    try {
      const compressedBlob = await compressImage(file)
      const formData = new FormData()
      formData.append('photo', compressedBlob, 'profile.jpg')

      const res = await fetch('/api/profile/photo', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        setUser(prev => prev ? { ...prev, profilePhoto: data.photoUrl } : null)
        setMessage({ type: 'success', text: 'Profile photo updated' })
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Photo upload failed:', error)
      setMessage({ type: 'error', text: 'Failed to upload photo. Please try again.' })
    } finally {
      setUploading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editForm.name.trim()) {
      setMessage({ type: 'error', text: 'Name is required' })
      return
    }

    if (editForm.newPassword) {
      if (editForm.newPassword.length < 8) {
        setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
        return
      }
      if (editForm.newPassword !== editForm.confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match' })
        return
      }
      if (!editForm.currentPassword) {
        setMessage({ type: 'error', text: 'Current password required to set new password' })
        return
      }
    }

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          currentPassword: editForm.currentPassword,
          newPassword: editForm.newPassword
        })
      })

      if (res.ok) {
        const data = await res.json()
        setUser(prev => prev ? { ...prev, ...data.user } : null)
        setMessage({ type: 'success', text: 'Profile updated successfully' })
        setShowProfileModal(false)
        setEditForm(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      } else {
        const error = await res.json()
        throw new Error(error.message || 'Update failed')
      }
    } catch (error) {
      console.error('Profile update failed:', error)
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update profile' 
      })
    }
  }

  const getLevelInfo = (level: string) => {
    const levels = {
      seeker: {
        title: 'Seeker',
        description: 'You\'re beginning your journey back to yourself',
        tagline: 'The path reveals itself to those who start walking',
        color: 'from-amber-500 to-orange-600',
        borderColor: 'border-amber-500/30',
        bgGlow: 'bg-amber-500/5',
        nextLevel: 'Explorer',
        nextProgress: 25,
        milestones: [
          { id: 'complete-profile', text: 'Complete your profile', icon: '👤' },
          { id: 'first-call', text: 'Attend your first live call', icon: '🎯' },
          { id: 'community-intro', text: 'Introduce yourself to the circle', icon: '💬' },
          { id: 'daily-practice', text: 'Begin your daily practice', icon: '🌅' }
        ]
      },
      explorer: {
        title: 'Explorer',
        description: 'You\'re discovering what\'s been hidden beneath the surface',
        tagline: 'The deeper you go, the more you find',
        color: 'from-blue-500 to-cyan-600',
        borderColor: 'border-blue-500/30',
        bgGlow: 'bg-blue-500/5',
        nextLevel: 'Pathfinder',
        nextProgress: 50,
        milestones: [
          { id: 'five-calls', text: 'Participate in 5 live calls', icon: '🎯' },
          { id: 'weekly-community', text: 'Engage weekly in community', icon: '🔥' },
          { id: 'thirty-day-streak', text: 'Maintain 30-day practice streak', icon: '📅' },
          { id: 'core-modules', text: 'Complete core teaching modules', icon: '📚' }
        ]
      },
      pathfinder: {
        title: 'Pathfinder',
        description: 'You\'re creating your own way forward with clarity',
        tagline: 'The path is yours to carve',
        color: 'from-purple-500 to-pink-600',
        borderColor: 'border-purple-500/30',
        bgGlow: 'bg-purple-500/5',
        nextLevel: 'Guide',
        nextProgress: 75,
        milestones: [
          { id: 'fifteen-calls', text: 'Attend 15+ live calls', icon: '🎯' },
          { id: 'lead-discussion', text: 'Lead a community discussion', icon: '🗣️' },
          { id: 'ninety-day-streak', text: 'Maintain 90-day practice streak', icon: '💎' },
          { id: 'advanced-breathwork', text: 'Master advanced breathwork', icon: '🌬️' }
        ]
      },
      guide: {
        title: 'Guide',
        description: 'You embody the transformation and light the way for others',
        tagline: 'Where you are now is where others aspire to be',
        color: 'from-emerald-500 to-teal-600',
        borderColor: 'border-emerald-500/30',
        bgGlow: 'bg-emerald-500/5',
        nextLevel: null,
        nextProgress: 100,
        milestones: [
          { id: 'mentor-member', text: 'Mentor newer members', icon: '🤝' },
          { id: 'share-journey', text: 'Share your transformation story', icon: '✨' },
          { id: 'continuous-practice', text: 'Daily embodied practice', icon: '🧘' },
          { id: 'community-leader', text: 'Active community leadership', icon: '👑' }
        ]
      }
    }
    
    return levels[level as keyof typeof levels] || levels.seeker
  }

  const CircularProgress = ({ progress, size = 120, strokeWidth = 8, level }: { 
    progress: number
    size?: number
    strokeWidth?: number
    level: string 
  }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (progress / 100) * circumference
    
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#progress-gradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-white">{progress}%</div>
          <div className="text-xs text-white/60 mt-1">Complete</div>
        </div>
      </div>
    )
  }

  const JourneyPath = ({ currentLevel, progress }: { currentLevel: string, progress: number }) => {
    const levels = ['seeker', 'explorer', 'pathfinder', 'guide']
    const currentIndex = levels.indexOf(currentLevel)
    
    return (
      <div className="relative w-full py-12">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 rounded-full" />
        
        <div 
          className="absolute top-1/2 left-0 h-1 -translate-y-1/2 transition-all duration-1000 bg-gradient-to-r from-amber-500 via-blue-500 to-emerald-500 rounded-full"
          style={{ width: `${(currentIndex * 25) + (progress * 0.25)}%` }}
        />
        
        <div className="relative flex justify-between items-center">
          {levels.map((level, index) => {
            const levelInfo = getLevelInfo(level)
            const isActive = index <= currentIndex
            const isCurrent = index === currentIndex
            
            return (
              <div key={level} className="flex flex-col items-center flex-1">
                <div 
                  className={`
                    w-12 h-12 rounded-full border-4 flex items-center justify-center
                    transition-all duration-500 relative z-10 text-lg font-semibold
                    ${isActive 
                      ? `bg-gradient-to-br ${levelInfo.color} border-white shadow-lg` 
                      : 'bg-[#0a0a0a] border-white/20 text-white/40'
                    }
                    ${isCurrent ? 'scale-125 ring-4 ring-white/20' : ''}
                  `}
                >
                  {isActive ? '✓' : index + 1}
                </div>
                
                <div className="mt-4 text-center px-2">
                  <div className={`text-sm font-semibold whitespace-nowrap ${isActive ? 'text-white' : 'text-white/40'}`}>
                    {levelInfo.title}
                  </div>
                  {isCurrent && (
                    <div className="text-xs text-white/60 mt-1 max-w-[140px] mx-auto">
                      {levelInfo.tagline}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <div className="text-white/60">Loading your journey...</div>
        </div>
      </div>
    )
  }

  if (!user) return null

  const levelInfo = getLevelInfo(user.level)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br ${levelInfo.color} opacity-5 blur-3xl animate-pulse`} />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500 to-pink-500 opacity-5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <header className="relative border-b border-white/10 backdrop-blur-xl bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Circle of Return</h1>
              <p className="text-sm text-white/60 mt-1">Member Portal</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 rounded-md border border-white/20 hover:bg-white/5 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {message && (
          <div className={`
            fixed top-24 right-6 z-50 px-6 py-4 rounded-lg shadow-2xl backdrop-blur-xl
            transform transition-all duration-300 animate-slide-in-right
            ${message.type === 'success' 
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-100' 
              : 'bg-red-500/20 border border-red-500/30 text-red-100'
            }
          `}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {message.type === 'success' ? '✓' : '⚠'}
              </span>
              <p>{message.text}</p>
            </div>
          </div>
        )}

        <section className={`
          relative overflow-hidden rounded-2xl p-6 md:p-12 mb-8 md:mb-12
          border ${levelInfo.borderColor} ${levelInfo.bgGlow}
          backdrop-blur-xl
        `}>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
              <div className="relative group">
                <div className={`
                  w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 ${levelInfo.borderColor}
                  shadow-xl relative
                `}>
                  {user.profilePhoto ? (
                    <Image
                      src={user.profilePhoto}
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${levelInfo.color} flex items-center justify-center text-2xl md:text-3xl font-bold`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <span className="text-xs md:text-sm font-medium">Edit</span>
                </button>
              </div>

              <div className="flex-1">
                <h2 className="text-3xl md:text-5xl font-bold mb-2 md:mb-3">
                  Welcome Back, {user.name}
                </h2>
                <p className="text-white/80 text-base md:text-lg mb-3 md:mb-4">
                  {levelInfo.description}
                </p>
                <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-white/40">Level:</span>
                    <span className={`font-semibold bg-gradient-to-r ${levelInfo.color} bg-clip-text text-transparent`}>
                      {levelInfo.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/40">Member since:</span>
                    <span className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  {user.currentStreak && user.currentStreak > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-white/40">🔥</span>
                      <span className="font-medium">{user.currentStreak} day streak</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="hidden md:block">
                <CircularProgress 
                  progress={user.progress} 
                  level={user.level}
                />
              </div>
            </div>
            
            <div className="md:hidden mt-6 flex justify-center">
              <CircularProgress 
                progress={user.progress} 
                level={user.level}
                size={100}
              />
            </div>
          </div>
        </section>

        <section className="mb-8 md:mb-12">
          <div className="text-center mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-bold mb-2">Your Transformation Path</h3>
            <p className="text-sm md:text-base text-white/60">
              {levelInfo.nextLevel 
                ? `You're on your way to ${levelInfo.nextLevel}` 
                : 'You\'ve mastered the journey'}
            </p>
          </div>
          <JourneyPath currentLevel={user.level} progress={user.progress} />
        </section>

        <section className="mb-8 md:mb-12">
          <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Your Current Focus</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {levelInfo.milestones.map((milestone) => {
              const isCompleted = user.completedMilestones?.includes(milestone.id)
              
              return (
                <div
                  key={milestone.id}
                  className={`
                    p-4 md:p-6 rounded-xl border backdrop-blur-xl transition-all duration-300
                    ${isCompleted 
                      ? `${levelInfo.borderColor} ${levelInfo.bgGlow} opacity-60` 
                      : `border-white/10 bg-white/5 hover:${levelInfo.bgGlow} hover:${levelInfo.borderColor}`
                    }
                  `}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className={`
                      text-2xl md:text-3xl flex-shrink-0
                      ${isCompleted ? 'opacity-50' : ''}
                    `}>
                      {isCompleted ? '✓' : milestone.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm md:text-base font-semibold ${isCompleted ? 'line-through opacity-60' : ''}`}>
                        {milestone.text}
                      </h4>
                      {isCompleted && (
                        <p className="text-xs md:text-sm text-emerald-400 mt-1">Completed</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="group relative overflow-hidden rounded-2xl p-6 md:p-8 border border-white/10 bg-white/5 backdrop-blur-xl hover:border-amber-500/30 hover:bg-amber-500/5 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="text-3xl md:text-4xl mb-3 md:mb-4">🎯</div>
              <h3 className="text-lg md:text-xl font-bold mb-2">The Journey</h3>
              <p className="text-white/60 text-sm mb-4 md:mb-6">
                Access videos, breathwork sessions, and teachings
              </p>
              <button className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors">
                Continue Learning →
              </button>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl p-6 md:p-8 border border-white/10 bg-white/5 backdrop-blur-xl hover:border-blue-500/30 hover:bg-blue-500/5 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="text-3xl md:text-4xl mb-3 md:mb-4">📞</div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Live Calls</h3>
              <p className="text-white/60 text-sm mb-4 md:mb-6">
                Join weekly group sessions
              </p>
              <div className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium mb-3 md:mb-4">
                Coming Soon
              </div>
              <div className="text-sm text-white/40">
                Next call: TBA
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl p-6 md:p-8 border border-white/10 bg-white/5 backdrop-blur-xl hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="text-3xl md:text-4xl mb-3 md:mb-4">🤝</div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Community</h3>
              <p className="text-white/60 text-sm mb-4 md:mb-6">
                Connect with other members
              </p>
              <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium mb-3 md:mb-4">
                Coming Soon
              </div>
              <div className="text-sm text-white/40">
                Building something special
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl p-6 md:p-8 border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-bold">Account Details</h3>
            <button
              onClick={() => setShowProfileModal(true)}
              className="text-xs md:text-sm text-white/60 hover:text-white transition-colors"
            >
              Edit Profile
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="text-xs md:text-sm text-white/40 block mb-2">Name</label>
              <div className="text-base md:text-lg font-medium break-words">{user.name}</div>
            </div>
            <div>
              <label className="text-xs md:text-sm text-white/40 block mb-2">Email</label>
              <div className="text-base md:text-lg font-medium break-all">{user.email}</div>
            </div>
            <div>
              <label className="text-xs md:text-sm text-white/40 block mb-2">Member ID</label>
              <div className="text-xs md:text-sm font-mono text-white/60 break-all">{user.id.slice(0, 12)}...</div>
            </div>
            <div>
              <label className="text-xs md:text-sm text-white/40 block mb-2">Joined</label>
              <div className="text-base md:text-lg font-medium">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        </section>

      </main>

      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/20 rounded-2xl p-6 md:p-8 shadow-2xl my-8">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-white/40 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Edit Profile</h2>

            <form onSubmit={handleProfileUpdate} className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-sm text-white/60 mb-3">Profile Photo</label>
                <div className="flex items-center gap-4 md:gap-6">
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 ${levelInfo.borderColor} flex-shrink-0`}>
                    {user.profilePhoto ? (
                      <Image
                        src={user.profilePhoto}
                        alt={user.name}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${levelInfo.color} flex items-center justify-center text-xl md:text-2xl font-bold`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className={`
                        inline-block px-3 md:px-4 py-2 rounded-lg border border-white/20 text-sm
                        hover:bg-white/5 transition-all cursor-pointer
                        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {uploading ? 'Uploading...' : 'Change Photo'}
                    </label>
                    <p className="text-xs text-white/40 mt-2">Max 5MB • JPG, PNG, GIF</p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm text-white/60 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-white/30 focus:outline-none transition-colors text-sm md:text-base"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm text-white/60 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-white/30 focus:outline-none transition-colors text-sm md:text-base"
                  required
                />
              </div>

              <div className="pt-4 md:pt-6 border-t border-white/10">
                <h3 className="text-base md:text-lg font-semibold mb-4">Change Password</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm text-white/60 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={editForm.currentPassword}
                      onChange={(e) => setEditForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-white/30 focus:outline-none transition-colors text-sm md:text-base"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm text-white/60 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={editForm.newPassword}
                      onChange={(e) => setEditForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-white/30 focus:outline-none transition-colors text-sm md:text-base"
                      placeholder="At least 8 characters"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm text-white/60 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={editForm.confirmPassword}
                      onChange={(e) => setEditForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-white/30 focus:outline-none transition-colors text-sm md:text-base"
                      placeholder="Re-enter new password"
                    />
                  </div>
                </div>

                <p className="text-xs text-white/40 mt-3">
                  Leave password fields blank to keep your current password
                </p>
              </div>

              <div className="flex gap-3 md:gap-4 pt-4 md:pt-6">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-4 md:px-6 py-3 rounded-lg border border-white/20 hover:bg-white/5 transition-all duration-300 text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`
                    flex-1 px-4 md:px-6 py-3 rounded-lg font-medium transition-all duration-300 text-sm md:text-base
                    bg-gradient-to-r ${levelInfo.color} hover:opacity-90
                  `}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
