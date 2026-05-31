'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const links = [
  { label: 'Community', href: '/community' },
  { label: 'Teachings', href: '/videos' },
  { label: 'Calendar', href: '/calls' },
  { label: 'Dashboard', href: '/members' },
  { label: 'Your Astrology', href: '/astrology' },
  { label: 'About', href: '/about-cor' },
]

export default function MembersNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
      if (window.innerWidth > 768) setMenuOpen(false)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('videoLikes')
    localStorage.removeItem('videoComments')
    localStorage.removeItem('justLoggedIn')
    localStorage.clear()
    sessionStorage.setItem('justLoggedOut', 'true')
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    router.push('/')
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: '#111110', borderBottom: '1px solid #242422',
      height: '90px', display: 'flex', alignItems: 'center',
      padding: '0 1.5rem'
    }}>
      <div style={{
        maxWidth: '1400px', margin: '0 auto', width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        {/* Logo + links - left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/community" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <img src="/kyn-stacked-white.png" alt="Know Your North" style={{ height: '56px', width: 'auto', display: 'block' }} />
          </Link>

          {/* Desktop links - next to logo */}
          {!isMobile && (
            <div style={{
              display: 'flex', gap: '1.5rem', alignItems: 'center'
            }}>
              {links.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link key={link.label} href={link.href} style={{
                    color: isActive ? '#9bc4b8' : '#c0bdb8',
                    textDecoration: 'none', fontSize: '0.9375rem',
                    fontWeight: isActive ? 600 : 400,
                    borderBottom: isActive ? '2px solid #9bc4b8' : '2px solid transparent',
                    paddingBottom: '2px',
                    transition: 'color 0.15s ease'
                  }}>
                    {link.label}
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Desktop Sign Out - right */}
        {!isMobile && (
          <button onClick={handleLogout} style={{
            background: 'none', border: '1px solid #333', borderRadius: '4px',
            padding: '0.375rem 1rem', fontSize: '0.8125rem', color: '#888',
            cursor: 'pointer'
          }}>
            Sign Out
          </button>
        )}

        {/* Mobile hamburger - right */}
        {isMobile && (
          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            background: 'none', border: '1px solid #333', borderRadius: '4px',
            padding: '0.5rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '40px', height: '40px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '20px' }}>
              <div style={{ width: '100%', height: '2px', background: '#c0bdb8' }} />
              <div style={{ width: '100%', height: '2px', background: '#c0bdb8' }} />
              <div style={{ width: '100%', height: '2px', background: '#c0bdb8' }} />
            </div>
          </button>
        )}
      </div>

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'absolute', top: '60px', left: 0, right: 0,
          background: '#111110', borderBottom: '1px solid #242422',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)', zIndex: 199,
          display: 'flex', flexDirection: 'column'
        }}>
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link key={link.label} href={link.href} onClick={() => setMenuOpen(false)} style={{
                padding: '1rem 1.5rem', textDecoration: 'none',
                borderBottom: '1px solid #1e1e1c', fontSize: '0.95rem',
                color: isActive ? '#9bc4b8' : '#c0bdb8',
                fontWeight: isActive ? 600 : 400
              }}>
                {link.label}
              </Link>
            )
          })}
          <button onClick={handleLogout} style={{
            padding: '1rem 1.5rem', background: '#1a1a18', border: 'none',
            borderTop: '1px solid #242422', fontSize: '0.95rem', color: '#888',
            cursor: 'pointer', textAlign: 'left'
          }}>
            Sign Out
          </button>
        </div>
      )}
    </nav>
  )
}
