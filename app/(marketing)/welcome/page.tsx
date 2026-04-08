'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import MembersNav from '@/app/(protected)/MembersNav'

const UPSELL_STRIPE_URL = 'https://buy.stripe.com/fZuaEY3eDaYB83K4nt9IQ0k'
const ACCENT = '#9bc4b8'
const ACCENT_HOVER = '#7da89c'

export default function WelcomePage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
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
      background: '#0a0a0a',
      paddingTop: '90px',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '-10%',
          width: isMobile ? '20rem' : '30rem',
          height: isMobile ? '20rem' : '30rem',
          background: 'radial-gradient(circle, rgba(155, 196, 184, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(100px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '30%',
          right: '-10%',
          width: isMobile ? '20rem' : '30rem',
          height: isMobile ? '20rem' : '30rem',
          background: 'radial-gradient(circle, rgba(127, 176, 105, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(100px)'
        }}></div>
      </div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        {/* Success Icon */}
        <div style={{
          width: isMobile ? '80px' : '100px',
          height: isMobile ? '80px' : '100px',
          margin: '0 auto 2rem',
          background: 'linear-gradient(135deg, rgba(155, 196, 184, 0.2), rgba(127, 176, 105, 0.1))',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(155, 196, 184, 0.3)'
        }}>
          <svg style={{
            width: isMobile ? '40px' : '50px',
            height: isMobile ? '40px' : '50px',
            color: '#9bc4b8'
          }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 style={{
          fontSize: isMobile ? '2rem' : '3rem',
          fontWeight: 300,
          marginBottom: '1.5rem',
          lineHeight: 1.2
        }}>
          Welcome to <span style={{ color: '#9bc4b8' }}>Circle of Return</span>
        </h1>

        <p style={{
          fontSize: isMobile ? '1.125rem' : '1.25rem',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '3rem',
          lineHeight: 1.6
        }}>
          Check your email for your login details.
        </p>

        {/* Pattern Audit Upsell */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(155, 196, 184, 0.1), rgba(155, 196, 184, 0.05))',
          border: '1px solid rgba(155, 196, 184, 0.3)',
          borderRadius: '3px',
          padding: '2rem',
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: ACCENT, marginBottom: '12px' }}>
            One-Time Offer · Before You Begin
          </p>
          <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.75rem', fontWeight: 500, lineHeight: 1.2, color: '#fff', marginBottom: '8px', fontFamily: "'Gambarino', serif" }}>
            The Pattern Audit
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>
            Guided video + structured workbook · £37 one time
          </p>
          <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'rgba(255,255,255,0.75)', marginBottom: '16px' }}>
            Most men believe they already know what their patterns are. The Pattern Audit goes one layer deeper — so when we meet for your first session, we start with precision, not guesswork.
          </p>
          <a
            href={UPSELL_STRIPE_URL}
            style={{
              display: 'block', width: '100%', padding: '14px',
              background: ACCENT, color: '#0a0a0a', fontSize: '15px',
              fontWeight: 600, borderRadius: '3px', textDecoration: 'none',
              textAlign: 'center', boxSizing: 'border-box', marginBottom: '10px',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = ACCENT_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}
          >
            Add the Pattern Audit · £37
          </a>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', textAlign: 'center', margin: 0 }}>
            Skip this and go straight to your portal below
          </p>
        </div>

        {/* What's Next */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '3px',
          padding: '2rem',
          marginBottom: '3rem',
          textAlign: 'left'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 400,
            marginBottom: '1.5rem',
            color: '#9bc4b8'
          }}>
            What's Next
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
              { icon: '🎥', text: 'Watch your first video' },
              { icon: '👥', text: 'Join the community' },
              { icon: '📅', text: 'Book your first live call' }
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(155, 196, 184, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}>
                  {item.icon}
                </div>
                <div style={{
                  fontSize: '1.125rem',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Login Button */}
        <Link
          href="https://yourtruenorth.me/auth/login"
          style={{
            display: 'inline-block',
            padding: '1rem 3rem',
            background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
            border: 'none',
            borderRadius: '3px',
            color: '#000',
            fontSize: '1.125rem',
            fontWeight: 600,
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            boxShadow: '0 4px 20px rgba(155, 196, 184, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 30px rgba(155, 196, 184, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(155, 196, 184, 0.3)'
          }}
        >
          Access Your Portal
        </Link>

        <p style={{
          marginTop: '2rem',
          fontSize: '0.875rem',
          color: 'rgba(255, 255, 255, 0.5)'
        }}>
          Portal URL: <Link href="https://yourtruenorth.me/auth/login" style={{ color: '#9bc4b8', textDecoration: 'none' }}>
            yourtruenorth.me/auth/login
          </Link>
        </p>
      </div>
    </div>
    </>
  )
}
