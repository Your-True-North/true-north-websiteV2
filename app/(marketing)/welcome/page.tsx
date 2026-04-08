'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import MembersNav from '@/app/(protected)/MembersNav'

const UPSELL_STRIPE_URL = 'https://buy.stripe.com/fZuaEY3eDaYB83K4nt9IQ0k'
const ACCENT = '#9bc4b8'
const ACCENT_HOVER = '#7da89c'
const TEXT = '#0a0a0a'
const MUTED = '#666666'
const BODY_FONT = '-apple-system, BlinkMacSystemFont, sans-serif'

export default function WelcomePage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <style>{`nav, header, .site-nav, .nav-container { display: none !important; }`}</style>
      <MembersNav />
      <div style={{
        minHeight: '100vh',
        background: '#f4f4f2',
        paddingTop: '90px',
        fontFamily: BODY_FONT,
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: isMobile ? '2rem 1rem 4rem' : '3rem 1.5rem 4rem',
          textAlign: 'center',
        }}>

          {/* CoR Mark */}
          <img
            src="/cor-mark-black.svg"
            alt="Circle of Return"
            style={{ height: '72px', width: 'auto', margin: '0 auto 1.5rem', display: 'block' }}
          />

          <h1 style={{ fontSize: isMobile ? '1.75rem' : '2.5rem', fontWeight: 500, color: TEXT, marginBottom: '1rem', lineHeight: 1.2 }}>
            Welcome to <span style={{ color: ACCENT }}>Circle of Return</span>
          </h1>

          <p style={{ fontSize: '1.125rem', color: MUTED, marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Check your email for your login details.
          </p>

          {/* Pattern Audit Upsell */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e8e8e8',
            borderRadius: '10px',
            padding: '1.75rem',
            marginBottom: '1.5rem',
            textAlign: 'left',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: ACCENT, marginBottom: '10px' }}>
              One-Time Offer · Before You Begin
            </p>
            <h2 style={{ fontSize: isMobile ? '1.375rem' : '1.5rem', fontWeight: 500, color: TEXT, marginBottom: '6px', fontFamily: "'Gambarino', serif" }}>
              The Pattern Audit
            </h2>
            <p style={{ fontSize: '13px', color: MUTED, marginBottom: '14px' }}>
              Guided video + structured workbook · £37 one time
            </p>
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: TEXT, marginBottom: '20px' }}>
              Most men believe they already know what their patterns are. The Pattern Audit goes one layer deeper — so when we meet for your first session, we start with precision, not guesswork.
            </p>
            <a
              href={UPSELL_STRIPE_URL}
              style={{
                display: 'block', width: '100%', padding: '14px',
                background: ACCENT, color: TEXT, fontSize: '15px',
                fontWeight: 600, borderRadius: '6px', textDecoration: 'none',
                textAlign: 'center', boxSizing: 'border-box', marginBottom: '10px',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = ACCENT_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}
            >
              Add the Pattern Audit · £37
            </a>
            <p style={{ fontSize: '12px', color: MUTED, textAlign: 'center', margin: 0 }}>
              Skip this and go straight to your portal below
            </p>
          </div>

          {/* What's Next */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e8e8e8',
            borderRadius: '10px',
            padding: '1.75rem',
            marginBottom: '2rem',
            textAlign: 'left',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 500, color: TEXT, marginBottom: '1.25rem' }}>
              What's Next
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { icon: '🎥', text: 'Watch your first video' },
                { icon: '👥', text: 'Join the community' },
                { icon: '📅', text: 'Book your first live call' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '44px', height: '44px',
                    background: 'rgba(155, 196, 184, 0.12)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ fontSize: '1rem', color: TEXT }}>{item.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Login Button */}
          <Link
            href="https://yourtruenorth.me/auth/login"
            style={{
              display: 'inline-block', padding: '1rem 3rem',
              background: ACCENT, border: 'none', borderRadius: '6px',
              color: TEXT, fontSize: '1rem', fontWeight: 600,
              textDecoration: 'none', cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = ACCENT_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}
          >
            Access Your Portal
          </Link>

          <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: MUTED }}>
            Portal URL:{' '}
            <Link href="https://yourtruenorth.me/auth/login" style={{ color: ACCENT, textDecoration: 'none' }}>
              yourtruenorth.me/auth/login
            </Link>
          </p>

        </div>
      </div>
    </>
  )
}
