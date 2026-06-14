'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

interface NavUser {
  name: string
  level?: string
}

const NAV_LINKS = [
  {
    label: 'Home',
    href: '/members',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Brotherhood',
    href: '/community',
    badge: 'blue',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    label: 'Teachings',
    href: '/videos',
    badge: 'green',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    label: 'Calendar',
    href: '/calls',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Resources',
    href: '/resources',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
  },
  {
    label: 'About',
    href: '/about-cor',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
]

const BOTTOM_NAV = [
  { label: 'Home', href: '/members', icon: NAV_LINKS[0].icon },
  { label: 'Brotherhood', href: '/community', icon: NAV_LINKS[1].icon, blueDot: true },
  { label: 'Teachings', href: '/videos', icon: NAV_LINKS[2].icon },
  { label: 'Calendar', href: '/calls', icon: NAV_LINKS[3].icon },
]

export default function MembersNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [navUser, setNavUser] = useState<NavUser | null>(null)
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      if (raw) {
        const parsed = JSON.parse(raw)
        setNavUser({ name: parsed.name, level: parsed.level })
      }
    } catch {}
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

  const isActive = (href: string) => pathname === href

  if (isMobile) {
    return (
      <>
        {/* Mobile top bar */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '54px',
          background: 'var(--kyn-sidebar)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.07)'
        }}>
          <Link href="/members">
            <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '6px', padding: '4px 7px', display: 'inline-block' }}>
              <img src="/cor-logo.png" alt="Circle of Return" style={{ height: '24px', width: 'auto', display: 'block' }} />
            </div>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Bell */}
            <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.55)', cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </div>
            {/* Avatar */}
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'rgba(45,106,79,0.35)', border: '1px solid rgba(82,183,136,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700, color: '#fff'
            }}>
              {navUser?.name?.charAt(0).toUpperCase() || '?'}
            </div>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--kyn-sidebar)', zIndex: 200,
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          display: 'flex', alignItems: 'stretch'
        }}>
          {BOTTOM_NAV.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  flex: 1, minHeight: '56px', minWidth: '44px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '3px', textDecoration: 'none', position: 'relative',
                  color: active ? 'var(--kyn-green-hi)' : 'rgba(255,255,255,0.32)',
                  borderTop: active ? '2px solid var(--kyn-green-hi)' : '2px solid transparent',
                }}
              >
                {'blueDot' in item && item.blueDot && (
                  <span style={{
                    position: 'absolute', top: '8px', right: 'calc(50% - 14px)',
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: 'var(--kyn-blue)', border: '1px solid var(--kyn-sidebar)'
                  }} />
                )}
                <span style={{ opacity: active ? 1 : 0.7 }}>{item.icon}</span>
                <span style={{ fontSize: '10px', fontWeight: active ? 600 : 400 }}>{item.label}</span>
              </Link>
            )
          })}

          {/* More */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            style={{
              flex: 1, minHeight: '56px', minWidth: '44px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '3px', background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.32)', borderTop: '2px solid transparent',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="19" r="1" fill="currentColor" />
            </svg>
            <span style={{ fontSize: '10px' }}>More</span>
          </button>

          {/* More sheet */}
          {moreOpen && (
            <div style={{
              position: 'absolute', bottom: '100%', left: 0, right: 0,
              background: 'var(--kyn-sidebar)', borderTop: '1px solid rgba(255,255,255,0.1)',
              padding: '8px 0'
            }}>
              {[{ label: 'Resources', href: '/resources' }, { label: 'About', href: '/about-cor' }].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  style={{
                    display: 'block', padding: '13px 20px',
                    color: isActive(item.href) ? 'var(--kyn-green-hi)' : 'rgba(255,255,255,0.72)',
                    textDecoration: 'none', fontSize: '15px',
                    fontWeight: isActive(item.href) ? 600 : 400,
                    borderBottom: '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', padding: '13px 20px', background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.4)', fontSize: '15px', cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </>
    )
  }

  // Desktop sidebar
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, bottom: 0, width: '214px',
      background: 'var(--kyn-sidebar)', zIndex: 100,
      display: 'flex', flexDirection: 'column',
      borderRight: '1px solid rgba(255,255,255,0.06)'
    }}>
      {/* Logo */}
      <div style={{
        padding: '18px 0 14px', display: 'flex', justifyContent: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0
      }}>
        <Link href="/members">
          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '8px', padding: '8px 10px', display: 'inline-block' }}>
            <img
              src="/cor-logo.png"
              alt="Circle of Return"
              style={{ width: '96px', height: 'auto', display: 'block' }}
            />
          </div>
        </Link>
      </div>

      {/* Nav links */}
      <div style={{ flex: 1, padding: '10px 10px 0', overflowY: 'auto' }}>
        {NAV_LINKS.map((link) => {
          const active = isActive(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '9px',
                padding: '7px 9px', marginBottom: '2px',
                borderRadius: 'var(--kyn-r)', textDecoration: 'none',
                color: active ? '#ffffff' : 'rgba(255,255,255,0.62)',
                background: active ? 'rgba(45,106,79,0.22)' : 'transparent',
                fontWeight: active ? 500 : 400,
                fontSize: '13.5px', transition: 'all 0.15s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.88)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.62)'
                }
              }}
            >
              <span style={{ opacity: active ? 1 : 0.38, flexShrink: 0 }}>{link.icon}</span>
              <span style={{ flex: 1 }}>{link.label}</span>
              {link.badge === 'blue' && (
                <span style={{
                  minWidth: '16px', height: '16px', padding: '0 4px',
                  background: 'var(--kyn-blue)', borderRadius: '8px',
                  fontSize: '10px', fontWeight: 700, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>0</span>
              )}
              {link.badge === 'green' && (
                <span style={{
                  minWidth: '16px', height: '16px', padding: '0 4px',
                  background: 'var(--kyn-green)', borderRadius: '8px',
                  fontSize: '10px', fontWeight: 700, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>0</span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Footer chip */}
      <div style={{
        padding: '12px 10px 14px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '10px' }}>
          <div style={{
            width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(45,106,79,0.25)', border: '1px solid rgba(82,183,136,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: 700, color: '#fff'
          }}>
            {navUser?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.82)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {navUser?.name || '—'}
            </div>
            {navUser?.level && (
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.38)', marginTop: '1px' }}>
                {navUser.level}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '6px 8px', background: 'none',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--kyn-r)',
            color: 'rgba(255,255,255,0.38)', fontSize: '11.5px', cursor: 'pointer',
            textAlign: 'center', transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.62)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.38)'
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  )
}
