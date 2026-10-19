'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

interface NavUser {
  name: string
  role?: string
}

const BG = '#111311'
const TEXT = '#ECE6DA'
const TEXT_2 = 'rgba(236,230,218,0.8)'
const SAGE = '#9BC4B8'
const LINE = 'rgba(236,230,218,0.08)'

const NAV_LINKS = [
  {
    label: 'Home',
    href: '/members',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Live',
    href: '/calls',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Library',
    href: '/videos',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
]

export default function MembersNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [navUser, setNavUser] = useState<NavUser | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      if (raw) {
        const parsed = JSON.parse(raw)
        setNavUser({ name: parsed.name, role: parsed.role })
      }
    } catch {}
  }, [])

  // Close the avatar menu on navigation and on a tap outside it
  useEffect(() => { setMenuOpen(false) }, [pathname])
  useEffect(() => {
    if (!menuOpen) return
    const close = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('touchstart', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('touchstart', close)
    }
  }, [menuOpen])

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

  // A tab stays active on its sub pages (a video counts as Library), but
  // /members/account doesn't light up Home.
  const isActive = (href: string) =>
    href === '/members' ? pathname === href : pathname === href || pathname?.startsWith(href + '/')

  const menuItem: React.CSSProperties = {
    display: 'flex', alignItems: 'center', width: '100%', minHeight: '48px', padding: '0 16px',
    background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer',
    color: TEXT, fontSize: '16px', textDecoration: 'none', fontFamily: 'inherit',
  }

  return (
    <>
      <style>{`
        .kyn-topbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          padding-top: env(safe-area-inset-top, 0px);
          background: ${BG}; border-bottom: 1px solid ${LINE};
        }
        .kyn-topbar-inner {
          height: 64px; padding: 0 24px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .kyn-toptabs { display: flex; gap: 8px; }
        .kyn-toptab {
          display: flex; align-items: center; min-height: 44px; padding: 0 18px; border-radius: 12px;
          font-size: 15px; font-weight: 500; text-decoration: none; color: ${TEXT_2};
        }
        .kyn-toptab:hover { color: ${TEXT}; }
        .kyn-toptab[data-active="true"] { color: ${TEXT}; background: rgba(236,230,218,0.08); }
        .kyn-bottombar { display: none; }
        @media (max-width: 768px) {
          .kyn-topbar-inner { height: 56px; padding: 0 16px; }
          .kyn-toptabs { display: none; }
          .kyn-bottombar {
            display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
            background: ${BG}; border-top: 1px solid ${LINE};
            padding-bottom: env(safe-area-inset-bottom, 0px);
          }
          .kyn-bottomtab {
            flex: 1; min-height: 64px; display: flex; flex-direction: column; align-items: center;
            justify-content: center; gap: 4px; text-decoration: none;
            color: ${TEXT_2}; font-size: 13px; font-weight: 500;
          }
          .kyn-bottomtab[data-active="true"] { color: ${SAGE}; }
        }
      `}</style>

      <header className="kyn-topbar">
        <div className="kyn-topbar-inner">
          <Link href="/members" aria-label="Home" style={{ display: 'flex', alignItems: 'center', minHeight: '44px' }}>
            <img src="/kyn-compass-white.png" alt="Know Your North" style={{ height: '36px', width: '36px', display: 'block', opacity: 0.92 }} />
          </Link>

          <nav className="kyn-toptabs" aria-label="Members">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="kyn-toptab" data-active={isActive(link.href)}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Avatar menu */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Account menu"
              aria-expanded={menuOpen}
              style={{
                width: '44px', height: '44px', padding: 0, background: 'none', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <span style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: '#1B1E1B', border: `1px solid ${LINE}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '15px', fontWeight: 600, color: TEXT,
              }}>
                {navUser?.name?.charAt(0).toUpperCase() || '?'}
              </span>
            </button>

            {menuOpen && (
              <div style={{
                position: 'absolute', top: '52px', right: 0, minWidth: '200px',
                background: '#1B1E1B', border: `1px solid ${LINE}`, borderRadius: '16px',
                boxShadow: '0 12px 32px rgba(0,0,0,0.4)', overflow: 'hidden', padding: '6px 0',
              }}>
                <Link href="/members/account" style={menuItem}>Account</Link>
                {navUser?.role === 'admin' && (
                  <Link href="/admin" style={menuItem}>Admin</Link>
                )}
                <button onClick={handleLogout} style={{ ...menuItem, color: TEXT_2 }}>Sign out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="kyn-bottombar" aria-label="Members">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="kyn-bottomtab" data-active={isActive(link.href)}>
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
