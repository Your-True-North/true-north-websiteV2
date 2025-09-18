'use client'
import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import { Play, MessageCircle, Heart } from 'lucide-react'

const mockVideos = [
  {
    id: 1,
    title: "The Foundation of True Self",
    duration: "25 min",
    uploadDate: "3 days ago",
    category: "Foundation Work",
    description: "Essential understanding of who you really are beneath the conditioning.",
    comments: 24,
    likes: 156
  },
  {
    id: 2,
    title: "Releasing Childhood Patterns", 
    duration: "32 min",
    uploadDate: "1 week ago",
    category: "Foundation Work",
    description: "How to identify and release patterns formed in childhood.",
    comments: 18,
    likes: 203
  },
  {
    id: 3,
    title: "Conscious Connected Breathing",
    duration: "45 min",
    uploadDate: "2 days ago", 
    category: "Breathwork Sessions",
    description: "A guided breathwork session for deep emotional release.",
    comments: 31,
    likes: 187
  },
  {
    id: 4,
    title: "Energy Clearing Meditation",
    duration: "28 min",
    uploadDate: "5 days ago",
    category: "Energy Healing",
    description: "Clear stagnant energy and align with your true vibration.",
    comments: 22,
    likes: 164
  },
  {
    id: 5,
    title: "Daily Integration Practices",
    duration: "18 min",
    uploadDate: "1 week ago",
    category: "Integration Practices",
    description: "Simple practices to integrate your insights into daily life.",
    comments: 15,
    likes: 128
  }
]

const mockCategories = [
  { name: "Foundation Work", icon: "🎯", count: 12, color: "#9bc4b8" },
  { name: "Breathwork Sessions", icon: "🌊", count: 8, color: "#7fb069" },
  { name: "Energy Healing", icon: "⚡", count: 15, color: "#6a994e" },
  { name: "Integration Practices", icon: "🔥", count: 6, color: "#8db4a8" }
]

const mockActivity = [
  { user: "Marcus R.", action: "commented on \"The Foundation of True Self\"", time: "2 hours ago" },
  { user: "Sarah K.", action: "started discussion: \"Integration challenges\"", time: "4 hours ago" },
  { user: "David L.", action: "leveled up to \"Seeker\"", time: "1 day ago" },
  { user: "Emma W.", action: "shared breakthrough in \"Energy Healing\"", time: "2 days ago" }
]

export default function JourneyPage() {
  const [user, setUser] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("Foundation Work")
  const [selectedVideo, setSelectedVideo] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('truenorthUser')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    } else {
      window.location.href = '/login'
    }
  }, [])

  const filteredVideos = selectedCategory === "All" 
    ? mockVideos 
    : mockVideos.filter(video => video.category === selectedCategory)

  const currentLevel = { name: "Seeker", color: "#9bc4b8" }
  const nextLevelDays = 45

  if (!user) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          <div className="lg:col-span-1">
            <div className="bg-white/3 backdrop-blur-xl rounded-xl border border-white/10 p-6 sticky top-24">
              
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                      selectedCategory === "All" 
                        ? "bg-[#9bc4b8]/15 border border-[#9bc4b8]/40 text-[#9bc4b8]" 
                        : "bg-white/2 border border-white/5 hover:bg-white/8"
                    }`}
                  >
                    <div className="w-5 h-5 bg-gradient-to-r from-[#9bc4b8] to-[#7fb069] rounded flex items-center justify-center text-xs font-semibold text-black">
                      ∀
                    </div>
                    <span className="flex-1 text-left">All Videos</span>
                    <span className="bg-white/10 px-2 py-1 rounded-full text-xs">{mockVideos.length}</span>
                  </button>
                  
                  {mockCategories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                        selectedCategory === category.name 
                          ? "bg-[#9bc4b8]/15 border border-[#9bc4b8]/40 text-[#9bc4b8]" 
                          : "bg-white/2 border border-white/5 hover:bg-white/8"
                      }`}
                    >
                      <div 
                        className="w-5 h-5 rounded flex items-center justify-center text-xs font-semibold text-black"
                        style={{ background: `linear-gradient(45deg, ${category.color}, #7fb069)` }}
                      >
                        {category.icon}
                      </div>
                      <span className="flex-1 text-left text-sm">{category.name}</span>
                      <span className="bg-white/10 px-2 py-1 rounded-full text-xs">{category.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">Your Progress</h3>
                <div 
                  className="p-4 rounded-lg border"
                  style={{
                    background: `linear-gradient(45deg, ${currentLevel.color}15, ${currentLevel.color}08)`,
                    borderColor: `${currentLevel.color}40`
                  }}
                >
                  <div 
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-black mb-2"
                    style={{ background: `linear-gradient(45deg, ${currentLevel.color}, #7fb069)` }}
                  >
                    Level 2 - {currentLevel.name}
                  </div>
                  <div className="text-sm text-white/80">
                    Next level: {nextLevelDays} days
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white/3 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
              
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold mb-2">
                      {selectedCategory === "All" ? "All Videos" : selectedCategory}
                    </h1>
                    <p className="text-white/70">
                      {selectedCategory === "All" 
                        ? "Your complete transformation journey" 
                        : `${filteredVideos.length} videos in this category`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
                  {filteredVideos.map((video) => (
                    <div 
                      key={video.id}
                      className="bg-white/3 rounded-xl border border-white/8 overflow-hidden hover:border-[#9bc4b8]/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                      onClick={() => setSelectedVideo(video)}
                    >
                      <div 
                        className="h-48 relative flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, rgba(155, 196, 184, 0.1), rgba(127, 176, 105, 0.1))'
                        }}
                      >
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 text-black ml-0.5" />
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
                        <div className="flex items-center gap-4 text-white/60 text-sm mb-3">
                          <span>{video.duration}</span>
                          <span>•</span>
                          <span>{video.uploadDate}</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-white/60 text-sm">
                            <MessageCircle className="w-4 h-4" />
                            <span>{video.comments}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-white/60 text-sm">
                            <Heart className="w-4 h-4" />
                            <span>{video.likes}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white/3 backdrop-blur-xl rounded-xl border border-white/10 p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-6">Community Activity</h2>
              
              <div className="space-y-4">
                {mockActivity.map((activity, index) => (
                  <div key={index} className="p-4 bg-white/2 rounded-lg border-l-2 border-[#9bc4b8]/40">
                    <div className="text-[#9bc4b8] font-semibold text-sm mb-1">{activity.user}</div>
                    <div className="text-white/80 text-sm mb-2">{activity.action}</div>
                    <div className="text-white/50 text-xs">{activity.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0b] rounded-xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold">{selectedVideo.title}</h2>
              <button 
                onClick={() => setSelectedVideo(null)}
                className="text-white/60 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div 
                className="w-full h-64 md:h-96 rounded-lg mb-4 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(155, 196, 184, 0.1), rgba(127, 176, 105, 0.1))'
                }}
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-black ml-1" />
                  </div>
                  <p className="text-white/60">YouTube Player ({selectedVideo.duration})</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-white/60 text-sm mb-4">
                <span>{selectedVideo.duration}</span>
                <span>•</span>
                <span>{selectedVideo.uploadDate}</span>
                <span>•</span>
                <span>{selectedVideo.category}</span>
              </div>
              
              <p className="text-white/80 mb-4">{selectedVideo.description}</p>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  <span>{selectedVideo.likes}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>{selectedVideo.comments}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}