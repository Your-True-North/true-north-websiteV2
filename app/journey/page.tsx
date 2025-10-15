'use client'
import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'

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
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedVideo, setSelectedVideo] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (err) {
        console.error('Failed to parse user data:', err)
        window.location.href = '/auth/login'
      }
    } else {
      window.location.href = '/auth/login'
    }
  }, [])

  const filteredVideos = selectedCategory === "All" 
    ? mockVideos 
    : mockVideos.filter(video => video.category === selectedCategory)

  const currentLevel = { name: "Seeker", color: "#9bc4b8" }
  const nextLevelDays = 45

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Loading your journey...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff' }}>
      <Navigation />
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'minmax(250px, 1fr) minmax(0, 2.5fr) minmax(250px, 1fr)', 
          gap: '1.5rem',
        }}>
          
          {/* Left Sidebar */}
          <div>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.03)', 
              backdropFilter: 'blur(20px)', 
              borderRadius: '12px', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              padding: '1.5rem',
              position: 'sticky',
              top: '6rem'
            }}>
              
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  color: 'rgba(255, 255, 255, 0.6)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em', 
                  marginBottom: '1rem' 
                }}>Categories</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    onClick={() => setSelectedCategory("All")}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: selectedCategory === "All" ? 'rgba(155, 196, 184, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                      border: selectedCategory === "All" ? '1px solid rgba(155, 196, 184, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                      color: selectedCategory === "All" ? '#9bc4b8' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      background: 'linear-gradient(45deg, #9bc4b8, #7fb069)', 
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: '#000'
                    }}>∀</div>
                    <span style={{ flex: 1, textAlign: 'left', fontSize: '0.9rem' }}>All Videos</span>
                    <span style={{ 
                      background: 'rgba(255, 255, 255, 0.1)', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem' 
                    }}>{mockVideos.length}</span>
                  </button>
                  
                  {mockCategories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(category.name)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: selectedCategory === category.name ? 'rgba(155, 196, 184, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                        border: selectedCategory === category.name ? '1px solid rgba(155, 196, 184, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                        color: selectedCategory === category.name ? '#9bc4b8' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        background: `linear-gradient(45deg, ${category.color}, #7fb069)`,
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem'
                      }}>{category.icon}</div>
                      <span style={{ flex: 1, textAlign: 'left', fontSize: '0.85rem' }}>{category.name}</span>
                      <span style={{ 
                        background: 'rgba(255, 255, 255, 0.1)', 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontSize: '0.75rem' 
                      }}>{category.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  color: 'rgba(255, 255, 255, 0.6)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em', 
                  marginBottom: '1rem' 
                }}>Your Progress</h3>
                <div style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  background: `linear-gradient(45deg, ${currentLevel.color}15, ${currentLevel.color}08)`,
                  border: `1px solid ${currentLevel.color}40`
                }}>
                  <div style={{ 
                    display: 'inline-block',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#000',
                    background: `linear-gradient(45deg, ${currentLevel.color}, #7fb069)`,
                    marginBottom: '0.5rem'
                  }}>
                    Level 2 - {currentLevel.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                    Next level: {nextLevelDays} days
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.03)', 
              backdropFilter: 'blur(20px)', 
              borderRadius: '12px', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden'
            }}>
              
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {selectedCategory === "All" ? "All Videos" : selectedCategory}
                </h1>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
                  {selectedCategory === "All" 
                    ? "Your complete transformation journey" 
                    : `${filteredVideos.length} videos in this category`}
                </p>
              </div>

              <div style={{ padding: '1.5rem' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                  gap: '1.5rem' 
                }}>
                  {filteredVideos.map((video) => (
                    <div 
                      key={video.id}
                      onClick={() => setSelectedVideo(video)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.border = '1px solid rgba(155, 196, 184, 0.3)'
                        e.currentTarget.style.transform = 'translateY(-4px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.08)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      <div style={{
                        height: '12rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(155, 196, 184, 0.1), rgba(127, 176, 105, 0.1))'
                      }}>
                        <div style={{
                          width: '3rem',
                          height: '3rem',
                          background: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          paddingLeft: '3px'
                        }}>▶</div>
                      </div>
                      
                      <div style={{ padding: '1rem' }}>
                        <h3 style={{ 
                          fontWeight: 600, 
                          marginBottom: '0.5rem', 
                          fontSize: '1rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>{video.title}</h3>
                        
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '1rem', 
                          color: 'rgba(255, 255, 255, 0.6)', 
                          fontSize: '0.85rem', 
                          marginBottom: '0.75rem' 
                        }}>
                          <span>{video.duration}</span>
                          <span>•</span>
                          <span>{video.uploadDate}</span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.375rem', 
                            color: 'rgba(255, 255, 255, 0.6)', 
                            fontSize: '0.85rem' 
                          }}>
                            <span>💬</span>
                            <span>{video.comments}</span>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.375rem', 
                            color: 'rgba(255, 255, 255, 0.6)', 
                            fontSize: '0.85rem' 
                          }}>
                            <span>❤️</span>
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

          {/* Right Sidebar */}
          <div>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.03)', 
              backdropFilter: 'blur(20px)', 
              borderRadius: '12px', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              padding: '1.5rem',
              position: 'sticky',
              top: '6rem'
            }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Community Activity</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {mockActivity.map((activity, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      padding: '1rem', 
                      background: 'rgba(255, 255, 255, 0.02)', 
                      borderRadius: '8px', 
                      borderLeft: '2px solid rgba(155, 196, 184, 0.4)' 
                    }}
                  >
                    <div style={{ color: '#9bc4b8', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      {activity.user}
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      {activity.action}
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem' }}>
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0, 0, 0, 0.8)', 
            backdropFilter: 'blur(4px)', 
            zIndex: 50, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '1rem' 
          }}
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            style={{ 
              background: '#0a0a0b', 
              borderRadius: '12px', 
              border: '1px solid rgba(255, 255, 255, 0.2)', 
              maxWidth: '56rem', 
              width: '100%', 
              maxHeight: '90vh', 
              overflow: 'hidden' 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '1.5rem', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{selectedVideo.title}</h2>
              <button 
                onClick={() => setSelectedVideo(null)}
                style={{ 
                  color: 'rgba(255, 255, 255, 0.6)', 
                  fontSize: '1.5rem', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <div style={{
                width: '100%',
                height: '24rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(155, 196, 184, 0.1), rgba(127, 176, 105, 0.1))'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '5rem',
                    height: '5rem',
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    fontSize: '2rem',
                    paddingLeft: '5px'
                  }}>▶</div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>YouTube Player ({selectedVideo.duration})</p>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1.5rem', 
                color: 'rgba(255, 255, 255, 0.6)', 
                fontSize: '0.85rem', 
                marginBottom: '1rem' 
              }}>
                <span>{selectedVideo.duration}</span>
                <span>•</span>
                <span>{selectedVideo.uploadDate}</span>
                <span>•</span>
                <span>{selectedVideo.category}</span>
              </div>
              
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '1rem' }}>
                {selectedVideo.description}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>❤️</span>
                  <span>{selectedVideo.likes}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>💬</span>
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
