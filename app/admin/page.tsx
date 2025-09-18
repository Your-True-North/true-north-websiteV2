'use client'
import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import { Plus, Edit, Trash2, Save, X, Calendar, Users, PlayCircle, MessageCircle } from 'lucide-react'

const mockVideosData = [
  {
    id: 1,
    title: "The Foundation of True Self",
    duration: "25 min",
    uploadDate: "2024-09-13",
    category: "Foundation Work",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Essential understanding of who you really are beneath the conditioning.",
    comments: 24,
    likes: 156,
    status: "published"
  },
  {
    id: 2,
    title: "Releasing Childhood Patterns", 
    duration: "32 min",
    uploadDate: "2024-09-06",
    category: "Foundation Work",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "How to identify and release patterns formed in childhood.",
    comments: 18,
    likes: 203,
    status: "published"
  },
  {
    id: 3,
    title: "Conscious Connected Breathing",
    duration: "45 min",
    uploadDate: "2024-09-14",
    category: "Breathwork Sessions",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "A guided breathwork session for deep emotional release.",
    comments: 31,
    likes: 187,
    status: "published"
  }
]

const categories = ["Foundation Work", "Breathwork Sessions", "Energy Healing", "Integration Practices"]

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [videos, setVideos] = useState(mockVideosData)
  const [editingVideo, setEditingVideo] = useState(null)
  const [showAddVideo, setShowAddVideo] = useState(false)
  const [newVideo, setNewVideo] = useState({
    title: '',
    duration: '',
    category: 'Foundation Work',
    youtubeUrl: '',
    description: '',
    status: 'draft'
  })

  useEffect(() => {
    const savedUser = localStorage.getItem('truenorthUser')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      if (userData.role !== 'admin') {
        window.location.href = '/journey'
        return
      }
      setUser(userData)
    } else {
      window.location.href = '/login'
    }
  }, [])

  const extractYouTubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : ''
  }

  const handleSaveVideo = () => {
    if (editingVideo) {
      setVideos(videos.map(v => 
        v.id === editingVideo.id 
          ? { ...editingVideo, youtubeId: extractYouTubeId(editingVideo.youtubeUrl) }
          : v
      ))
      setEditingVideo(null)
    } else {
      const newId = Math.max(...videos.map(v => v.id)) + 1
      const videoToAdd = {
        ...newVideo,
        id: newId,
        youtubeId: extractYouTubeId(newVideo.youtubeUrl),
        uploadDate: new Date().toISOString().split('T')[0],
        comments: 0,
        likes: 0
      }
      setVideos([...videos, videoToAdd])
      setNewVideo({
        title: '',
        duration: '',
        category: 'Foundation Work',
        youtubeUrl: '',
        description: '',
        status: 'draft'
      })
      setShowAddVideo(false)
    }
  }

  const handleDeleteVideo = (id) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      setVideos(videos.filter(v => v.id !== id))
    }
  }

  if (!user) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <PlayCircle className="w-8 h-8 text-[#9bc4b8]" />
              <div>
                <div className="text-2xl font-bold">{videos.length}</div>
                <div className="text-white/60 text-sm">Total Videos</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-[#7fb069]" />
              <div>
                <div className="text-2xl font-bold">127</div>
                <div className="text-white/60 text-sm">Active Members</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="w-8 h-8 text-[#6a994e]" />
              <div>
                <div className="text-2xl font-bold">486</div>
                <div className="text-white/60 text-sm">Total Comments</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-8 h-8 text-[#8db4a8]" />
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-white/60 text-sm">This Month</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Video Management</h2>
              <button
                onClick={() => setShowAddVideo(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#9bc4b8] to-[#7fb069] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                <Plus className="w-5 h-5" />
                Add Video
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {videos.map((video) => (
                <div key={video.id} className="bg-white/5 rounded-lg border border-white/10 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{video.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-white/60 mb-2">
                        <span>{video.duration}</span>
                        <span>•</span>
                        <span>{video.category}</span>
                        <span>•</span>
                        <span>{video.uploadDate}</span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          video.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {video.status}
                        </span>
                      </div>
                      <p className="text-white/80 text-sm">{video.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setEditingVideo(video)}
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {(showAddVideo || editingVideo) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0b] rounded-xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold">
                {editingVideo ? 'Edit Video' : 'Add New Video'}
              </h2>
              <button 
                onClick={() => {
                  setEditingVideo(null)
                  setShowAddVideo(false)
                }}
                className="text-white/60 hover:text-white text-2xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Title</label>
                <input
                  type="text"
                  value={editingVideo ? editingVideo.title : newVideo.title}
                  onChange={(e) => editingVideo 
                    ? setEditingVideo({...editingVideo, title: e.target.value})
                    : setNewVideo({...newVideo, title: e.target.value})
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#9bc4b8]/50 focus:ring-2 focus:ring-[#9bc4b8]/20"
                  placeholder="Enter video title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Duration</label>
                  <input
                    type="text"
                    value={editingVideo ? editingVideo.duration : newVideo.duration}
                    onChange={(e) => editingVideo 
                      ? setEditingVideo({...editingVideo, duration: e.target.value})
                      : setNewVideo({...newVideo, duration: e.target.value})
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#9bc4b8]/50 focus:ring-2 focus:ring-[#9bc4b8]/20"
                    placeholder="25 min"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Category</label>
                  <select
                    value={editingVideo ? editingVideo.category : newVideo.category}
                    onChange={(e) => editingVideo 
                      ? setEditingVideo({...editingVideo, category: e.target.value})
                      : setNewVideo({...newVideo, category: e.target.value})
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#9bc4b8]/50 focus:ring-2 focus:ring-[#9bc4b8]/20"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-[#0a0a0b]">{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">YouTube URL</label>
                <input
                  type="url"
                  value={editingVideo ? editingVideo.youtubeUrl : newVideo.youtubeUrl}
                  onChange={(e) => editingVideo 
                    ? setEditingVideo({...editingVideo, youtubeUrl: e.target.value})
                    : setNewVideo({...newVideo, youtubeUrl: e.target.value})
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#9bc4b8]/50 focus:ring-2 focus:ring-[#9bc4b8]/20"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
                <textarea
                  rows={4}
                  value={editingVideo ? editingVideo.description : newVideo.description}
                  onChange={(e) => editingVideo 
                    ? setEditingVideo({...editingVideo, description: e.target.value})
                    : setNewVideo({...newVideo, description: e.target.value})
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#9bc4b8]/50 focus:ring-2 focus:ring-[#9bc4b8]/20 resize-none"
                  placeholder="Enter video description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
                <select
                  value={editingVideo ? editingVideo.status : newVideo.status}
                  onChange={(e) => editingVideo 
                    ? setEditingVideo({...editingVideo, status: e.target.value})
                    : setNewVideo({...newVideo, status: e.target.value})
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#9bc4b8]/50 focus:ring-2 focus:ring-[#9bc4b8]/20"
                >
                  <option value="draft" className="bg-[#0a0a0b]">Draft</option>
                  <option value="published" className="bg-[#0a0a0b]">Published</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveVideo}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#9bc4b8] to-[#7fb069] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Save className="w-5 h-5" />
                  {editingVideo ? 'Update Video' : 'Add Video'}
                </button>
                
                <button
                  onClick={() => {
                    setEditingVideo(null)
                    setShowAddVideo(false)
                  }}
                  className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )