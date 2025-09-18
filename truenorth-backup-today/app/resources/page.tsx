'use client'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import MysticalBackground from '../components/MysticalBackground'
import Link from 'next/link'
import { useState } from 'react'

export default function LibraryPage() {
  const [showEmailModal, setShowEmailModal] = useState(false)

  const handleResourceClick = () => {
    setShowEmailModal(true)
  }

  const handleCloseModal = () => {
    setShowEmailModal(false)
  }

  return (
    <>
      <Navigation />
      <MysticalBackground />
      
      <main className="page-container">
        <section className="section" style={{paddingTop: '4rem'}}>
          <div className="container">
            <div style={{textAlign: 'center', marginBottom: '4rem'}}>
              <h1 className="h1" style={{fontSize: '3rem'}}>The Library</h1>
              <p className="body-large">
                Tools and insights to begin your journey. Real resources for real transformation.
              </p>
            </div>

            {/* What's Inside */}
            <div className="card" style={{marginBottom: '3rem'}}>
              <div style={{textAlign: 'center', marginBottom: '3rem'}}>
                <h2 className="h2" style={{fontSize: '2rem'}}>What's Inside the Library</h2>
                <p className="body-large" style={{maxWidth: '600px', margin: '0 auto'}}>
                  Practical tools you can use immediately. No theory. No fluff. Just what works.
                </p>
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem'}}>
                <div className="card" style={{background: 'var(--bg-secondary)', textAlign: 'center'}}>
                  <h3 className="h3" style={{color: 'var(--primary)', fontSize: '1.4rem'}}>The Anger Audit</h3>
                  <p className="body-small accent-text" style={{marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px'}}>
                    7-Day Practice
                  </p>
                  <p className="body" style={{marginBottom: '1.5rem'}}>
                    Track your triggers, understand your patterns, and begin to see anger as information rather than explosion.
                  </p>
                  <div style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                    marginBottom: '1.5rem'
                  }}>
                    PDF Guide + Daily Tracker
                  </div>
                  <button 
                    onClick={handleResourceClick}
                    className="btn-primary" 
                    style={{borderRadius: '0.3rem', width: '100%'}}
                  >
                    Get Free Access
                  </button>
                </div>

                <div className="card" style={{background: 'var(--bg-secondary)', textAlign: 'center'}}>
                  <h3 className="h3" style={{color: 'var(--primary)', fontSize: '1.4rem'}}>Morning Grounding Routine</h3>
                  <p className="body-small accent-text" style={{marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px'}}>
                    15-Minute Practice
                  </p>
                  <p className="body" style={{marginBottom: '1.5rem'}}>
                    Start your day from center, not chaos. Simple breathwork and body awareness practices.
                  </p>
                  <div style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                    marginBottom: '1.5rem'
                  }}>
                    Audio Guide + Instructions
                  </div>
                  <button 
                    onClick={handleResourceClick}
                    className="btn-primary" 
                    style={{borderRadius: '0.3rem', width: '100%'}}
                  >
                    Get Free Access
                  </button>
                </div>

                <div className="card" style={{background: 'var(--bg-secondary)', textAlign: 'center'}}>
                  <h3 className="h3" style={{color: 'var(--primary)', fontSize: '1.4rem'}}>The Shadow Questions</h3>
                  <p className="body-small accent-text" style={{marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px'}}>
                    Self-Inquiry Workbook
                  </p>
                  <p className="body" style={{marginBottom: '1.5rem'}}>
                    25 questions to help you identify what you've been avoiding and why it keeps showing up.
                  </p>
                  <div style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                    marginBottom: '1.5rem'
                  }}>
                    PDF Workbook
                  </div>
                  <button 
                    onClick={handleResourceClick}
                    className="btn-primary" 
                    style={{borderRadius: '0.3rem', width: '100%'}}
                  >
                    Get Free Access
                  </button>
                </div>

                <div className="card" style={{background: 'var(--bg-secondary)', textAlign: 'center'}}>
                  <h3 className="h3" style={{color: 'var(--primary)', fontSize: '1.4rem'}}>Energy Protection Toolkit</h3>
                  <p className="body-small accent-text" style={{marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px'}}>
                    For Empaths & Sensitives
                  </p>
                  <p className="body" style={{marginBottom: '1.5rem'}}>
                    How to feel without absorbing. Boundaries that work for men who feel everything.
                  </p>
                  <div style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                    marginBottom: '1.5rem'
                  }}>
                    Video Series + PDF
                  </div>
                  <button 
                    onClick={handleResourceClick}
                    className="btn-primary" 
                    style={{borderRadius: '0.3rem', width: '100%'}}
                  >
                    Get Free Access
                  </button>
                </div>

                <div className="card" style={{background: 'var(--bg-secondary)', textAlign: 'center'}}>
                  <h3 className="h3" style={{color: 'var(--primary)', fontSize: '1.4rem'}}>Sacred Breathwork Series</h3>
                  <p className="body-small accent-text" style={{marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px'}}>
                    4 Powerful Practices
                  </p>
                  <p className="body" style={{marginBottom: '1.5rem'}}>
                    Four powerful breathing practices to release trauma and connect with your truth.
                  </p>
                  <div style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                    marginBottom: '1.5rem'
                  }}>
                    Guided Audio + Instructions
                  </div>
                  <button 
                    onClick={handleResourceClick}
                    className="btn-primary" 
                    style={{borderRadius: '0.3rem', width: '100%'}}
                  >
                    Get Free Access
                  </button>
                </div>

                <div className="card" style={{background: 'var(--bg-secondary)', textAlign: 'center'}}>
                  <h3 className="h3" style={{color: 'var(--primary)', fontSize: '1.4rem'}}>Weekly Insights</h3>
                  <p className="body-small accent-text" style={{marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px'}}>
                    Raw Truth
                  </p>
                  <p className="body" style={{marginBottom: '1.5rem'}}>
                    Weekly thoughts on masculinity, spirituality, and the journey back to yourself. No fluff.
                  </p>
                  <div style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                    marginBottom: '1.5rem'
                  }}>
                    Email Series
                  </div>
                  <button 
                    onClick={handleResourceClick}
                    className="btn-primary" 
                    style={{borderRadius: '0.3rem', width: '100%'}}
                  >
                    Get Free Access
                  </button>
                </div>
              </div>
            </div>

            {/* Philosophy */}
            <div className="card" style={{marginBottom: '3rem', textAlign: 'center'}}>
              <div style={{maxWidth: '700px', margin: '0 auto'}}>
                <h2 className="h2" style={{marginBottom: '2rem', fontSize: '2rem'}}>Why This is Free</h2>
                <p className="body-large" style={{marginBottom: '2rem'}}>
                  Because everyone deserves access to the tools for transformation. These resources have helped hundreds of men begin their return to themselves.
                </p>
                <p className="body" style={{color: 'var(--text-muted)', fontStyle: 'italic'}}>
                  "The truth is hard to hear, but we already knew it. This library is about having the courage to face it."
                </p>
              </div>
            </div>

            {/* CTA for Deeper Work */}
            <div className="card">
              <div style={{textAlign: 'center'}}>
                <h2 className="h2" style={{marginBottom: '2rem', fontSize: '2rem'}}>Ready for Deeper Work?</h2>
                <p className="body-large" style={{marginBottom: '3rem'}}>
                  These resources are just the beginning. When you're ready to go deeper, I'm here.
                </p>
                <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
                  <Link href="/work" className="btn-primary" style={{borderRadius: '0.3rem', padding: '0.8rem 1.5rem', fontSize: '0.95rem'}}>
                    Work With Me
                    <span>→</span>
                  </Link>
                  <Link href="/circle" className="btn-secondary" style={{borderRadius: '0.3rem', padding: '0.8rem 1.5rem', fontSize: '0.95rem'}}>
                    Join The CoR
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>
      
      <Footer />

      {/* Email Modal */}
      {showEmailModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(10, 10, 11, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div className="card" style={{
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            position: 'relative'
          }}>
            <button
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            
            <h2 className="h2" style={{color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '2rem'}}>
              Access the Complete Library
            </h2>
            <p className="body-large" style={{marginBottom: '2rem'}}>
              Get instant access to all my free resources. No strings attached. Just your email and the tools you need to start your return.
            </p>
            
            {/* Email Form */}
            <form style={{maxWidth: '400px', margin: '0 auto 2rem'}}>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  required
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '0.3rem',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    fontFamily: 'inherit'
                  }}
                />
                <button 
                  type="submit"
                  className="btn-primary" 
                  style={{
                    borderRadius: '0.3rem', 
                    padding: '1rem 2rem', 
                    fontSize: '1rem',
                    width: '100%'
                  }}
                >
                  Get Instant Access
                </button>
              </div>
            </form>
            
            <p className="body-small" style={{color: 'var(--text-muted)'}}>
              No spam. No bullshit. Just tools for transformation. Unsubscribe anytime.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
