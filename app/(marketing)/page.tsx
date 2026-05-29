'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import CompoundGrowthModel from '@/app/components/CompoundGrowthModel'
import FoundingPopup from '@/app/components/FoundingPopup'

export default function Home() {
  const [shimmerPhase, setShimmerPhase] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [showFoundingPopup, setShowFoundingPopup] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    const interval = setInterval(() => {
      setShimmerPhase(prev => (prev + 1) % 4)
    }, 180000)

    if (window.location.search.includes('join')) {
      setShowFoundingPopup(true)
    }

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])


  const shimmerThemes = [
    { primary: '#9bc4b8', accent: '#d4af37', shimmer: 'rgba(155, 196, 184, 0.12)' },
    { primary: '#7fb069', accent: '#f4a261', shimmer: 'rgba(127, 176, 105, 0.10)' },
    { primary: '#6a994e', accent: '#e76f51', shimmer: 'rgba(106, 153, 78, 0.14)' },
    { primary: '#8db4a8', accent: '#c49c30', shimmer: 'rgba(141, 180, 168, 0.08)' }
  ]

  const currentTheme = shimmerThemes[shimmerPhase]

  return (
    <>
      <style jsx global>{`
        :root {
          --primary: ${currentTheme.primary};
          --accent: ${currentTheme.accent};
          --shimmer-color: ${currentTheme.shimmer};
        }

        .page-container::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background: radial-gradient(ellipse at 30% 50%, var(--shimmer-color) 0%, transparent 50%);
          pointer-events: none;
          z-index: 1;
          opacity: 0.6;
          transition: background 15s ease-in-out, opacity 15s ease-in-out;
        }

        .shimmer-accent {
          position: relative;
          overflow: hidden;
        }

        .shimmer-accent::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent 0%, var(--shimmer-color) 50%, transparent 100%);
          animation: shimmer 8s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; opacity: 0; }
          25% { opacity: 0.3; }
          50% { opacity: 0.5; }
          75% { opacity: 0.3; }
          100% { left: 100%; opacity: 0; }
        }

        .accent-text {
          transition: color 15s ease-in-out;
        }

        .btn-primary, .btn-secondary {
          transition: all 0.3s ease, color 15s ease-in-out, background-color 15s ease-in-out, border-color 15s ease-in-out;
        }
      `}</style>

      <main className="page-container">
        {/* SECTION 1: HERO */}
        <section className="section" style={{
          paddingTop: isMobile ? '0' : '5rem',
          height: isMobile ? '100vh' : 'auto',
          position: 'relative',
          overflow: 'hidden',
          display: isMobile ? 'flex' : 'block',
          alignItems: isMobile ? 'flex-end' : 'normal', paddingBottom: isMobile ? '4rem' : '0'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: isMobile ? 0 : 'auto',
            width: isMobile ? '100%' : '60%',
            backgroundImage: 'url(/serious.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: isMobile ? 'center center' : 'center top',
            zIndex: 1
          }}>
            {/* Darker overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: isMobile
                ? 'linear-gradient(to bottom, rgba(10, 10, 11, 0.75) 0%, rgba(10, 10, 11, 0.6) 50%, rgba(10, 10, 11, 0.85) 100%)'
                : 'linear-gradient(90deg, #0a0a0b 0%, rgba(10, 10, 11, 0.95) 15%, rgba(10, 10, 11, 0.85) 30%, rgba(10, 10, 11, 0.6) 50%, transparent 70%)'
            }}></div>
          </div>

          <div className="container" style={{
            position: "relative", paddingTop: isMobile ? "0" : "12rem",
            zIndex: 2,
            textAlign: isMobile ? 'center' : 'left',
            width: isMobile ? '90%' : 'auto'
          }}>
            <div style={{maxWidth: isMobile ? '100%' : '800px'}}>

              <h1 className="h1 shimmer-accent" style={{
                fontSize: isMobile ? 'clamp(2.2rem, 9vw, 3.5rem)' : 'clamp(3rem, 7vw, 5rem)',
                marginBottom: '1.5rem',
                lineHeight: '1.1'
              }}>
                Your patterns aren't the problem. They're the <span className="accent-text">signal</span>.
              </h1>

              <p className="body-large" style={{
                marginBottom: '3rem',
                maxWidth: isMobile ? '100%' : '650px',
                fontSize: isMobile ? '1.05rem' : '1.2rem',
                lineHeight: '1.7'
              }}>
                The anger, the numbness, the cycles you can't seem to break - they're not flaws, they're your nervous system telling you something needs to shift. This work gets you to the root.
              </p>

              <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                justifyContent: isMobile ? 'center' : 'flex-start', marginBottom: '4rem'
              }}>
                <Link href="/work" className="btn-primary" style={{
                  borderRadius: '3px',
                  padding: '1rem 2rem',
                  fontSize: '1rem'
                }}>
                  Work With Me <span>→</span>
                </Link>
                <Link href="/about" className="btn-secondary" style={{
                  borderRadius: '3px',
                  padding: '1rem 2rem',
                  fontSize: '1rem'
                }}>
                  My Story
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: CORE MESSAGE */}
        <section className="section section-alt">
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '4rem',
              alignItems: 'center'
            }}>
              <div>
                <h2 className="h2 shimmer-accent" style={{
                  color: 'var(--text-primary-inverse)',
                  fontSize: isMobile ? '2rem' : '2.5rem'
                }}>
                  This isn't about becoming someone new.
                </h2>
                <p className="body-large" style={{
                  marginBottom: '2rem',
                  color: 'rgba(246, 246, 246, 0.9)',
                  fontSize: isMobile ? '1rem' : '1.1rem'
                }}>
                  You don't need fixing. You need access to what's been buried.
                </p>
                <p className="body" style={{
                  color: 'rgba(246, 246, 246, 0.8)',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  marginBottom: '1.5rem'
                }}>
                  The version of you before the armour went on. Before you learnt to shut down, push through, or disappear. That man is still in there.
                </p>
                <p className="body" style={{
                  color: 'rgba(246, 246, 246, 0.8)',
                  fontSize: isMobile ? '0.9rem' : '1rem'
                }}>
                  This work clears what's in the way so you can feel him again. Think from him. Move from him. Live from him.
                </p>
              </div>

              <div className="card">
                <blockquote style={{borderLeft: '3px solid var(--primary)', paddingLeft: '2rem'}}>
                  <p style={{
                    fontSize: isMobile ? '1.1rem' : '1.25rem',
                    fontStyle: 'italic',
                    color: 'var(--primary)',
                    marginBottom: '1rem'
                  }}>
                    "You already have the answers. You just lost access to them. This work clears the way back."
                  </p>
                  <footer className="body-small" style={{fontWeight: 'bold'}}>- Core Principle</footer>
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: CREDENTIALS STRIP */}
        <section className="section section-alt" style={{
          paddingTop: isMobile ? '2rem' : '3rem',
          paddingBottom: isMobile ? '2rem' : '3rem'
        }}>
          <div className="container">
            <p style={{
              textAlign: 'center',
              color: 'rgba(246, 246, 246, 0.7)',
              fontSize: isMobile ? '0.85rem' : '0.95rem',
              letterSpacing: '0.5px',
              lineHeight: '1.8'
            }}>
              ICF Certified Transformational Coach · Somatic Therapy Practitioner (Gabor Maté trained) · Reiki Master · Breathwork Facilitator · 10+ years in men's transformation work
            </p>
          </div>
        </section>

        {/* SECTION 4: MODALITIES */}
        <section className="section">
          <div className="container">
            <div style={{textAlign: 'center', marginBottom: '4rem'}}>
              <h2 className="h2 shimmer-accent" style={{fontSize: isMobile ? '2rem' : '2.5rem'}}>How the work moves.</h2>
            </div>

            <CompoundGrowthModel />

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '2rem'
            }}>
              {[
                {
                  title: 'Somatic Therapy',
                  description: 'Your body holds what your mind forgot. We work with sensation, breath, and stored emotion to release trauma and restore safety in your nervous system. This is not talk therapy. This is body first.'
                },
                {
                  title: 'Breathwork',
                  description: 'Your breath regulates everything. These sessions clear stuck energy, move emotion, and create space for clarity and release. Simple. Powerful. Ancient.'
                },
                {
                  title: 'Energy Work',
                  description: 'Your field carries more than feeling. It holds patterns, imprints, and memory. This work clears what no longer belongs and restores your natural state of presence.'
                },
                {
                  title: 'Integrative Coaching',
                  description: 'Where it all comes together. Nervous system, psychology, emotion, direction. We don\'t just talk about change. We build it. Grounded in somatic practice. Held by real accountability.'
                }
              ].map((item, i) => (
                <div key={i} className="card">
                  <h3 className="h3 shimmer-accent" style={{fontSize: isMobile ? '1.2rem' : '1.4rem', fontWeight: 'bold', marginBottom: '1rem'}}>{item.title}</h3>
                  <p className="body" style={{fontSize: isMobile ? '0.9rem' : '0.95rem'}}>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: TESTIMONIALS */}
        <section className="section">
          <div className="container">
            <div style={{textAlign: 'center', marginBottom: '4rem'}}>
              <h2 className="h2 shimmer-accent" style={{fontSize: isMobile ? '2rem' : '2.5rem'}}>Men who made the return.</h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
              {[
                { title: "From Chaos to Clarity", name: "Real Client Story", embedId: "7Y1upKm8bZk" },
                { title: "Breaking the Cycle", name: "Authentic Transformation", embedId: "ubCK70jYQDI" },
                { title: "Finding My Power", name: "Client Journey", embedId: "UfbMIxlCzgM" },
                { title: "The Return Journey", name: "Deep Work Results", embedId: "n8_muJ84AbU" }
              ].map((video, i) => (
                <div key={i} className="card" style={{padding: '0', overflow: 'hidden'}}>
                  <div style={{
                    aspectRatio: '9/16',
                    background: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${video.embedId}`}
                      title={video.title}
                      frameBorder="0"
                      allowFullScreen
                      style={{border: 'none'}}
                    />
                  </div>
                  <div style={{padding: '1.5rem'}}>
                    <h4 style={{
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem',
                      fontSize: isMobile ? '0.9rem' : '1rem'
                    }}>{video.title}</h4>
                    <p className="body-small" style={{fontSize: '0.85rem'}}>{video.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6: DIFFERENTIATOR */}
        <section className="section">
          <div className="container">
            <div style={{textAlign: 'center', maxWidth: '700px', margin: '0 auto'}}>
              <h2 className="h2 shimmer-accent" style={{fontSize: isMobile ? '2rem' : '2.5rem', marginBottom: '2rem'}}>This isn't coaching. It's excavation.</h2>
              <p className="body-large" style={{
                marginBottom: '1.5rem',
                fontSize: isMobile ? '1rem' : '1.1rem',
                lineHeight: '1.7'
              }}>
                Most programmes teach you to manage your symptoms. Cope better. Think different.
              </p>
              <p className="body" style={{
                marginBottom: '1.5rem',
                fontSize: isMobile ? '0.9rem' : '1rem',
                lineHeight: '1.7',
                color: 'var(--text-secondary)'
              }}>
                This work goes underneath. Into the body. Into the patterns running your life without your permission. Into the parts of you that shut down years ago and never came back online.
              </p>
              <p className="body" style={{
                fontSize: isMobile ? '0.9rem' : '1rem',
                lineHeight: '1.7',
                color: 'var(--text-secondary)'
              }}>
                You won't just understand yourself better. You'll feel different. Move different. Choose different.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 8: FINAL CTA */}
        <section className="section">
          <div className="container">
            <div style={{textAlign: 'center', maxWidth: '600px', margin: '0 auto'}}>
              <h2 className="h2 shimmer-accent" style={{fontSize: isMobile ? '2rem' : '2.5rem'}}>Ready to stop circling and start moving?</h2>
              <p className="body-large" style={{
                marginBottom: '3rem',
                fontSize: isMobile ? '1rem' : '1.1rem'
              }}>
                The path isn't comfortable. But neither is staying where you are.
              </p>
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <Link href="/contact" className="btn-primary" style={{
                  borderRadius: '3px',
                  padding: '1rem 2rem',
                  fontSize: '1rem'
                }}>
                  Book a Discovery Call <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FoundingPopup isOpen={showFoundingPopup} onClose={() => setShowFoundingPopup(false)} />
    </>
  )
}
