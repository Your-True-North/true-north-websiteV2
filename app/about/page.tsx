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
    }, 180000)

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
        
        <section className="section" style={{ 
          paddingTop: isMobile ? '0' : '2rem', 
          paddingBottom: isMobile ? '0' : '4rem',
          position: 'relative',
          minHeight: isMobile ? '100vh' : '90vh',
          display: 'flex',
          alignItems: 'center'
        }}>
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
            <div style={{ 
              textAlign: 'center', 
              maxWidth: '900px', 
              margin: '0 auto'
            }}>
              <h1 className="h1" style={{ 
                marginBottom: isMobile ? '0.5rem' : '1rem',
                fontSize: isMobile ? 'clamp(1.8rem, 7vw, 2.5rem)' : undefined,
                textShadow: isMobile ? '2px 2px 4px rgba(0, 0, 0, 0.7)' : undefined
              }}>
                TRUE NORTH
              </h1>
              <p className="body-large" style={{ 
                marginBottom: isMobile ? '1rem' : '2rem',
                fontSize: isMobile ? '0.85rem' : '1rem',
                lineHeight: '1.4',
                fontWeight: '600',
                textShadow: isMobile ? '1px 1px 2px rgba(0, 0, 0, 0.7)' : undefined,
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                Coaching, Breathwork, Energy Work, Somatic Therapy
              </p>
              <p className="body-large" style={{ 
                marginBottom: isMobile ? '2rem' : '4rem',
                fontSize: isMobile ? '1rem' : '1.3rem',
                lineHeight: '1.6',
                fontWeight: '400',
                textShadow: isMobile ? '1px 1px 2px rgba(0, 0, 0, 0.7)' : undefined
              }}>
                I'm not a guru. I'm not your therapist. I'm someone who's lived it.
              </p>
              <Link href="/work" className="btn-primary">
                Start Your Journey
              </Link>
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container">
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <div style={{ maxWidth: '900px', margin: '0 auto', marginBottom: '4rem' }}>
                <div className="body-large" style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
                  <p style={{ marginBottom: '2rem' }}>
                    My name is Mason but I go by True North.
                  </p>
                  <p style={{ marginBottom: '2rem' }}>
                    <strong style={{ color: currentTheme.accent }}>Addiction. Depression. Prison. Violence.</strong><br />
                    That was my life for years. I was stuck in a cycle of pain, and trying to numb what I didn't know how to face.
                  </p>
                  <p style={{ marginBottom: '2rem' }}>
                    I broke free from that world, built businesses, became a pro athlete, and on paper… I'd "made it." 
                    But I still felt disconnected. Still felt lost. Still carrying a weight that I couldn't name.
                  </p>
                  <p style={{ 
                    fontSize: '1.2rem', 
                    fontWeight: '600', 
                    color: currentTheme.primary, 
                    textAlign: 'center',
                    padding: '2rem 0',
                    fontStyle: 'italic'
                  }}>
                    So I stopped looking outward and started doing the real work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div style={{ maxWidth: '900px', margin: '0 auto', marginBottom: '4rem' }}>
              <p className="body-large" style={{ marginBottom: '3rem', lineHeight: '1.8' }}>
                Over the last decade, I've travelled across the world, from jungles to ashrams, 
                training with spiritual teachers, somatic experts, and coaches who literally 
                cracked me open in ways that showed me the stuff I'd been avoiding.
              </p>
              
              <p className="body-large" style={{ marginBottom: '3rem', lineHeight: '1.8' }}>
                I immersed myself in breathwork, nervous system healing, men's work, emotional mastery, and deep self-inquiry. 
                I studied everything from somatic therapy to NLP, coaching to energy work. Not to escape myself, but to <em>meet</em> myself.
              </p>
              
              <p style={{ 
                fontSize: '1.5rem', 
                fontFamily: 'Playfair Display, serif', 
                textAlign: 'center',
                color: currentTheme.primary,
                marginBottom: '2rem'
              }}>
                And what I found? Was peace. Power. And purpose.
              </p>
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container">
            <h2 className="h2" style={{ 
              textAlign: 'center', 
              marginBottom: '3rem',
              fontSize: isMobile ? '2rem' : '2.5rem',
              fontWeight: 'bold'
            }}>
              NOW, I HELP PEOPLE LIKE YOU FIND THE SAME.
            </h2>
            
            <div style={{ maxWidth: '900px', margin: '0 auto', marginBottom: '3rem' }}>
              <p className="body-large" style={{ 
                textAlign: 'center', 
                marginBottom: '3rem',
                lineHeight: '1.8'
              }}>
                Not with hype. Not with surface-level talk.<br />
                With real tools that work in the body, in the mind, in spirit, and in life.
              </p>
              
              <div className="body-large" style={{ lineHeight: '1.8', marginBottom: '3rem' }}>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '1rem' }}>• If you're stuck in anger, shame, anxiety, or burnout…</li>
                  <li style={{ marginBottom: '1rem' }}>• If you struggle for motivation and passion…</li>
                  <li style={{ marginBottom: '1rem' }}>• If you've lost yourself in the chaos…</li>
                  <li style={{ marginBottom: '1rem' }}>• If you know deep down you're built for more…</li>
                </ul>
              </div>
              
              <p className="body-large" style={{ 
                textAlign: 'center', 
                marginBottom: '3rem',
                fontWeight: '600'
              }}>
                Then I'm here to walk beside you through this journey.
              </p>
              
              <div style={{ textAlign: 'center' }}>
                <Link href="/work" className="btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                  Start Your Shift
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="h2" style={{ textAlign: 'center', marginBottom: '4rem' }}>
              Professional Credentials
            </h2>
            
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <h3 className="h3" style={{ marginBottom: '2rem', color: currentTheme.accent }}>
                Licenses & Certifications
              </h3>
              
              <div className="body" style={{ lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '3rem' }}>
                <p style={{ marginBottom: '2rem' }}>
                  I'm a certified coach and a member of the <strong style={{ color: currentTheme.accent }}>ICF</strong>, <strong style={{ color: currentTheme.accent }}>EMCC</strong>, and the <strong style={{ color: currentTheme.accent }}>Association for Coaching</strong> — three of the most respected bodies in the coaching world.
                </p>
                <p style={{ marginBottom: '2rem' }}>
                  I'm a certified <strong style={{ color: currentTheme.accent }}>breathwork practitioner</strong>, trained by <strong style={{ color: currentTheme.accent }}>BreathOnIt</strong> (Los Angeles), and recognised by the <strong style={{ color: currentTheme.accent }}>International Breathwork Foundation (IBF)</strong>.
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

        <section className="section section-alt">
          <div className="container">
            <h2 className="h2" style={{ textAlign: 'center', marginBottom: '4rem' }}>
              Professional Experience
            </h2>
            
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <p className="body-large" style={{ 
                textAlign: 'center', 
                marginBottom: '3rem',
                fontWeight: '600',
                fontSize: '1.2rem'
              }}>
                My work is shaped by real life… not just textbooks.
              </p>
              
              <div className="body" style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
                <p style={{ marginBottom: '2rem' }}>
                  I've lived through addiction, trauma, heartbreak, and financial ruin. These experiences taught me what no training ever could… how to meet people where they're at, with depth, empathy, and truth.
                </p>
                <p style={{ marginBottom: '2rem' }}>
                  I spent over 7 years running one of London's early corporate wellness companies, delivering coaching and mental health support to teams inside global tech firms, pharmaceutical giants, and construction leaders.
                </p>
                <p style={{ marginBottom: '2rem' }}>
                  I've seen both sides of the system, the pressure on employees and the blind spots of leadership.
                </p>
                <p style={{ marginBottom: '2rem' }}>
                  In my 1:1 practice, I've worked with high performers across industries who hit external success but still feel unfulfilled.
                </p>
                <p style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '600', 
                  color: currentTheme.primary, 
                  textAlign: 'center',
                  padding: '2rem 0'
                }}>
                  Over time, I've learned how to cut through the noise and get to the root of what's missing in life, fast. Clients leave with clarity, direction, and a deeper connection to who they really are.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="h2" style={{ textAlign: 'center', marginBottom: '4rem' }}>
              What I Believe
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
              <div className="card">
                <p className="body" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                  You are not broken — but you are blocked.
                </p>
              </div>
              
              <div className="card">
                <p className="body" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                  Your pain is part of your power — if you learn how to work with it.
                </p>
              </div>
              
              <div className="card">
                <p className="body" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                  You don't need fixing — you need to feel.
                </p>
              </div>
              
              <div className="card" style={{ backgroundColor: currentTheme.primary + '15', border: `1px solid ${currentTheme.primary}40` }}>
                <p className="body" style={{ fontSize: '1.1rem', fontWeight: '500', color: currentTheme.primary }}>
                  Transformation doesn't happen in your head — it happens in your body.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2 className="h2" style={{ marginBottom: '2rem' }}>
                This isn't for everyone. But if it's for you, you'll know.
              </h2>
              <p className="body-large" style={{ marginBottom: '3rem', lineHeight: '1.8' }}>
                Let's shift what's been holding you back and help you step into who you truly are — grounded, clear, and powerful.
              </p>
              <Link href="/work" className="btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                Start Your Shift
              </Link>
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