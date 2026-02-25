'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const links = [
  { label: 'Dashboard', href: '/members' },
  { label: 'Journey', href: '/journey' },
  { label: 'Community', href: '/community' },
  { label: 'Calls', href: '/calls' },
  { label: 'Videos', href: '/videos' },
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
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/auth/login')
  }

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: '#ffffff', borderBottom: '1px solid #e5e5e5',
      height: '60px', display: 'flex', alignItems: 'center',
      padding: '0 1.5rem'
    }}>
      <div style={{
        maxWidth: '1400px', margin: '0 auto', width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <Link href="/members" style={{
          fontSize: '1.25rem', fontWeight: 600, color: '#0a0a0a',
          textDecoration: 'none', fontFamily: 'Gambarino, serif', whiteSpace: 'nowrap'
        }}>
          True North
        </Link>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginLeft: '2rem', marginRight: 'auto' }}>
            {links.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link key={link.href} href={link.href} style={{
                  color: isActive ? '#9bc4b8' : '#0a0a0a',
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

        {/* Desktop logout */}
        {!isMobile && (
          <button onClick={handleLogout} style={{
            background: 'none', border: '1px solid #e5e5e5', borderRadius: '6px',
            padding: '0.375rem 1rem', fontSize: '0.8125rem', color: '#0a0a0a',
            cursor: 'pointer'
          }}>
            Logout
          </button>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            background: 'none', border: '1px solid #e5e5e5', borderRadius: '4px',
            padding: '0.5rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '40px', height: '40px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '20px' }}>
              <div style={{ width: '100%', height: '2px', background: '#0a0a0a' }} />
              <div style={{ width: '100%', height: '2px', background: '#0a0a0a' }} />
              <div style={{ width: '100%', height: '2px', background: '#0a0a0a' }} />
            </div>
          </button>
        )}
      </div>

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'absolute', top: '60px', left: 0, right: 0,
          background: '#ffffff', borderBottom: '1px solid #e5e5e5',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 199,
          display: 'flex', flexDirection: 'column'
        }}>
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{
                padding: '1rem 1.5rem', textDecoration: 'none',
                borderBottom: '1px solid #f5f5f5', fontSize: '0.95rem',
                color: isActive ? '#9bc4b8' : '#0a0a0a',
                fontWeight: isActive ? 600 : 400
              }}>
                {link.label}
              </Link>
            )
          })}
          <button onClick={handleLogout} style={{
            padding: '1rem 1.5rem', background: '#f9f9f9', border: 'none',
            borderTop: '1px solid #e5e5e5', fontSize: '0.95rem', color: '#0a0a0a',
            cursor: 'pointer', textAlign: 'left'
          }}>
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}
