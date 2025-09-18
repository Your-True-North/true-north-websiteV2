'use client'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import MysticalBackground from '../components/MysticalBackground'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function About() {
  const [shimmerPhase, setShimmerPhase] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setShimmerPhase(prev => (prev + 1) % 4)
    }, 180000) // 3 minutes between transitions

    return () => clearInterval(interval)
  }, [])

  const shimmerThemes = [
    {
      primary: '#9bc4b8',
      accent: '#d4af37',
      shimmer: 'rgba(155, 196, 184, 0.12)'
    },
    {
      primary: '#7fb069',
      accent: '#f4a261',
      shimmer: 'rgba(127, 176, 105, 0.10)'
    },
    {
      primary: '#6a994e',
      accent: '#e76f51',
      shimmer: 'rgba(106, 153, 78, 0.14)'
    },
    {
      primary: '#8db4a8',
      accent: '#c49c30',
      shimmer: 'rgba(141, 180, 168, 0.08)'
    }
  ]

  const currentTheme = shimmerThemes[shimmerPhase]

  return (
    <>
      <MysticalBackground />
      
      <div className="page-container">
        <Navigation />
        
        {/* Hero Section - Full screen on mobile */}
        <section className="section" style={{ 
          paddingTop: isMobile ? '0' : '2rem', 
          paddingBottom: isMobile ? '0' : '4rem',
          position: 'relative',
          minHeight: isMobile ? '100vh' : '90vh',
          display: 'flex',
          alignItems: 'center'
        }}>
          {/* Background image */}
          <div style={{
            position: 'absolute',
            top: isMobile ? '0' : '50%',
            left: isMobile ? '0' : '50%',
            transform: isMobile ? 'none' : 'translate(-50%, -50%)',
            width: isMobile ? '100%' : '600px',
            height: isMobile ? '100%' : '600px',
            backgroundImage: 'url(/glasses.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: isMobile ? 0.7 : 0.25,
            maskImage: isMobile ? 'none' : 'radial-gradient(circle, black 50%, transparent 80%)',
            WebkitMaskImage: isMobile ? 'none' : 'radial-gradient(circle, black 50%, transparent 80%)',
            filter: isMobile ? 'none' : `drop-shadow(0 0 60px ${currentTheme.shimmer})`,
            zIndex: 1
          }} />
          
          {/* Mobile gradient overlay */}
          {isMobile && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(180deg, rgba(10,10,11,0.3) 0%, rgba(10,10,11,0.1) 50%, rgba(10,10,11,0.4) 100%)',
              zIndex: 2
            }} />
          )}
          
          <div className="container" style={{ 
            position: 'relative', 
            zIndex: 10,
            padding: isMobile ? '0 1rem' : undefined
          }}>
            {/* Text overlaid on image */}
            <div style={{ 
              textAlign: 'center', 
              maxWidth: '900px', 
              margin: '0 auto'
            }}>
              <h1 className="h1" style={{ 
                marginBottom: '2rem',
                fontSize: isMobile ? 'clamp(2rem, 8vw, 3rem)' : undefined,
                textShadow: isMobile ? '2px 2px 4px rgba(0, 0, 0, 0.7)' : undefined
              }}>
                I am True North
              </h1>
              <p className="body-large" style={{ 
                marginBottom: '4rem',
                fontSize: isMobile ? '1rem' : '1.3rem',
                lineHeight: '1.6',
                fontWeight: '400',
                textShadow: isMobile ? '1px 1px 2px rgba(0, 0, 0, 0.7)' : undefined
              }}>
                I hold the space where people stop pretending they're okay 
                and safely meet and heal what's underneath
              </p>
              <Link href="/library" className="btn-primary">
                Start Your Journey Free
              </Link>
            </div>
          </div>
        </section>

        {/* Standard card layout like other pages */}
        <section className="section section-alt">
          <div className="container">
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <h2 className="h2" style={{ textAlign: 'center', marginBottom: '4rem' }}>
                From Darkness to Light
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                <div className="card">
                  <h3 className="h3">The Raw Beginning</h3>
                  <p className="body">
                    <strong style={{ color: currentTheme.accent }}>Addiction. Depression. Prison. Violence.</strong><br />
                    That was my life for years. I was stuck in a cycle of pain, trying to numb what I didn't know how to face.
                  </p>
                </div>
                
                <div className="card">
                  <h3 className="h3">External Success, Internal Emptiness</h3>
                  <p className="body">
                    I broke free from that world, built businesses, became a pro athlete, and on paper… I'd "made it." 
                    But I still felt disconnected. Still felt lost.
                  </p>
                </div>
                
                <div className="card">
                  <h3 className="h3">The Turning Point</h3>
                  <p className="body" style={{ fontStyle: 'italic', color: currentTheme.primary }}>
                    "So I stopped looking outward and started doing the real work."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Journey */}
        <section className="section">
          <div className="container">
            <h2 className="h2" style={{ textAlign: 'center', marginBottom: '4rem' }}>
              The Journey Inward
            </h2>
            
            <div style={{ maxWidth: '900px', margin: '0 auto', marginBottom: '4rem' }}>
              <p className="body-large" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                Over the last decade, I've travelled across the world, from jungles to ashrams, 
                training with spiritual teachers, somatic experts, and coaches who literally 
                cracked me open in ways that showed me the stuff I'd been avoiding.
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
              <div className="card">
                <h3 className="h3">Deep Immersion</h3>
                <p className="body">
                  Breathwork, nervous system healing, men's work, emotional mastery, and deep self-inquiry. 
                  Everything from somatic therapy to NLP, coaching to energy work.
                </p>
              </div>
              
              <div className="card">
                <h3 className="h3">The Purpose</h3>
                <p className="body">
                  Not to escape myself, but to meet myself. To find what I'd been avoiding and heal it at the source.
                </p>
              </div>
              
              <div className="card" style={{ backgroundColor: currentTheme.primary + '15', border: `1px solid ${currentTheme.primary}40` }}>
                <h3 className="h3" style={{ color: currentTheme.primary }}>What I Found</h3>
                <p style={{ fontSize: '1.5rem', fontFamily: 'Playfair Display, serif', marginBottom: '1rem' }}>
                  Peace. Power. Purpose.
                </p>
                <p className="body-small">Not with hype. Not with surface-level talk.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Training & Credentials - EXPANDED */}
        <section className="section section-alt">
          <div className="container">
            <h2 className="h2" style={{ textAlign: 'center', marginBottom: '4rem' }}>
              Built on Real Training
            </h2>
            
            <div style={{ maxWidth: '900px', margin: '0 auto', marginBottom: '4rem' }}>
              <div className="body" style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
                <p style={{ marginBottom: '2rem' }}>
                  I'm a certified coach and a member of the <strong style={{ color: currentTheme.accent }}>ICF</strong>, <strong style={{ color: currentTheme.accent }}>EMCC</strong>, and the <strong style={{ color: currentTheme.accent }}>Association for Coaching</strong> — three of the most respected bodies in the coaching world.
                </p>
                <p style={{ marginBottom: '2rem' }}>
                  I'm a certified <strong style={{ color: currentTheme.accent }}>breathwork practitioner</strong>, trained by <strong style={{ color: currentTheme.accent }}>BreathOnIt</strong>, and recognised by the <strong style={{ color: currentTheme.accent }}>International Breathwork Foundation (IBF)</strong>.
                </p>
                <p style={{ marginBottom: '2rem' }}>
                  I hold formal certification in <strong style={{ color: currentTheme.accent }}>trauma-informed somatic therapy</strong>, trained under some of the world's leading voices in the field — including teachers like <strong style={{ color: currentTheme.accent }}>Dr. Gabor Maté</strong>.
                </p>
                <p style={{ marginBottom: '3rem' }}>
                  I've also completed <strong style={{ color: currentTheme.accent }}>Reiki Master training</strong> at the <strong style={{ color: currentTheme.accent }}>London Reiki Science Academy</strong>, grounding my energy work in structure and precision.
                </p>
                <p style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '600', 
                  color: currentTheme.primary, 
                  textAlign: 'center',
                  padding: '2rem 0',
                  borderTop: `2px solid ${currentTheme.primary}30`,
                  borderBottom: `2px solid ${currentTheme.primary}30`
                }}>
                  Everything I share is built on deep training and lived experience — so you feel safe, supported, and see real results.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="section">
          <div className="container">
            <h2 className="h2" style={{ textAlign: 'center', marginBottom: '4rem' }}>
              How Transformation Actually Happens
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
              <div className="card">
                <h3 className="h3">Real Experience</h3>
                <p className="body">
                  My work is shaped by real life… not just textbooks. I've lived through addiction, 
                  trauma, heartbreak, and financial ruin. I know how to meet people where they're at.
                </p>
              </div>
              
              <div className="card">
                <h3 className="h3">Body-Based Work</h3>
                <p className="body">
                  <strong>Transformation doesn't happen in your head — it happens in your body.</strong> 
                  We work with your nervous system, breath, and cellular memory.
                </p>
              </div>
              
              <div className="card">
                <h3 className="h3">Proven Results</h3>
                <p className="body">
                  Clients leave with clarity, direction, and a deeper connection to who they really are. 
                  We cut through the noise and get to the root fast.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section section-alt">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2 className="h2">Ready to Stop Pretending?</h2>
              <p className="body-large">
                The truth is hard to hear, but we already knew it. 
                No one can do the pushups for you, my friend.
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <h3 className="h3">Start Free</h3>
                <p className="body" style={{ marginBottom: '2rem' }}>
                  Weekly resources for your journey of self-discovery
                </p>
                <Link href="/library" className="btn-secondary">Browse Library</Link>
              </div>
              
              <div 
                className="card" 
                style={{ 
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div 
                  style={{
                    position: 'absolute',
                    top: '-150%',
                    left: '0',
                    width: '100%',
                    height: '400%',
                    background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.05) 48%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.05) 52%, transparent 100%)',
                    animation: 'corShimmer 8s ease-in-out infinite',
                    pointerEvents: 'none'
                  }} 
                />
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <h3 className="h3">Join The CoR</h3>
                  <p className="body" style={{ marginBottom: '2rem' }}>
                    A portal to self-discovery
                  </p>
                  <Link href="/circle" className="btn-secondary">Learn More</Link>
                </div>
              </div>
              
              <div className="card" style={{ 
                textAlign: 'center', 
                backgroundColor: currentTheme.primary, 
                color: 'var(--bg-primary)',
                transition: 'background-color 8s ease-in-out'
              }}>
                <h3 className="h3" style={{ color: 'var(--bg-primary)' }}>Work 1:1</h3>
                <p className="body" style={{ marginBottom: '2rem', color: 'var(--bg-primary)' }}>
                  Ready for deep, personalized transformation
                </p>
                <Link 
                  href="/contact" 
                  className="btn-primary" 
                  style={{ backgroundColor: 'var(--bg-primary)', color: currentTheme.primary }}
                >
                  Book Discovery Call
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
      
<style jsx>{`
  @keyframes shimmer {
    0% { transform: translateY(0); }
    50% { transform: translateY(-200%); }
    100% { transform: translateY(-400%); }
  }
`}</style>
    </>
  )
}