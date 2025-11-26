'use client'

import { useState } from 'react'
import Link from 'next/link'

const videos = [
  {
    id: 1,
    title: "The Beginning",
    duration: "15 min",
    uploadDate: "New",
    category: "Foundation Work",
    description: "Onboarding - a short walk-through of the three foundations of this work - Thinking, Feeling, Acting - and how these three shape the direction of your life.",
    youtubeId: "L7Pk4xNO63U",
  }
]

const categories = [
  { name: "All Videos", icon: "▼", count: 1 },
  { name: "Foundation Work", icon: "🔄", count: 1 },
  { name: "Breathwork Sessions", icon: "🌊", count: 0 },
  { name: "Energy Healing", icon: "⚡", count: 0 },
  { name: "Integration Practices", icon: "🔥", count: 0 },
]

export default function JourneyPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Videos")
  const [selectedVideo, setSelectedVideo] = useState(videos[0])

  const filteredVideos = selectedCategory === "All Videos" 
    ? videos 
    : videos.filter(v => v.category === selectedCategory)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '280px', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '2rem', flexShrink: 0 }}>
        <Link href="/members" style={{ color: '#9bc4b8', textDecoration: 'none', fontSize: '14px', display: 'block', marginBottom: '2rem' }}>
          ← Back to Dashboard
        </Link>
        
        <h3 style={{ fontSize: '12px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem' }}>CATEGORIES</h3>
        
        {categories.map(cat => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              marginBottom: '8px',
              background: selectedCategory === cat.name ? 'rgba(155, 196, 184, 0.1)' : 'transparent',
              border: selectedCategory === cat.name ? '1px solid rgba(155, 196, 184, 0.3)' : '1px solid transparent',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </span>
            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' }}>{cat.count}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '2rem' }}>My Journey</h1>
        
        {/* Video Player */}
        {selectedVideo && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, marginBottom: '1rem', borderRadius: '12px', overflow: 'hidden' }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtubeId}?modestbranding=1&rel=0&showinfo=0`}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 300, marginBottom: '0.5rem' }}>{selectedVideo.title}</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>{selectedVideo.category} • {selectedVideo.duration}</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{selectedVideo.description}</p>
          </div>
        )}

        {/* Video List */}
        <h3 style={{ fontSize: '1rem', fontWeight: 300, marginBottom: '1rem', color: 'rgba(255,255,255,0.6)' }}>
          {filteredVideos.length} {filteredVideos.length === 1 ? 'Video' : 'Videos'}
        </h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredVideos.map(video => (
            <button
              key={video.id}
              onClick={() => setSelectedVideo(video)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                background: selectedVideo?.id === video.id ? 'rgba(155, 196, 184, 0.1)' : 'rgba(255,255,255,0.02)',
                border: selectedVideo?.id === video.id ? '1px solid rgba(155, 196, 184, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                color: '#fff',
                transition: 'all 0.2s'
              }}
            >
              <img 
                src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                alt={video.title}
                style={{ width: '120px', height: '68px', objectFit: 'cover', borderRadius: '4px' }}
              />
              <div>
                <h4 style={{ fontWeight: 400, marginBottom: '4px' }}>{video.title}</h4>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>{video.duration} • {video.category}</p>
              </div>
            </button>
          ))}
        </div>
        
        {filteredVideos.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '2rem' }}>
            No videos in this category yet.
          </p>
        )}
      </div>
    </div>
  )
}
