'use client'
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
      <div className="page-container">

        {/* HERO SECTION */}
        <section className="section" style={{
          paddingTop: isMobile ? '0' : '2rem',
          paddingBottom: isMobile ? '3rem' : '4rem',
          position: 'relative',
          minHeight: isMobile ? '100vh' : '90vh',
          display: 'flex',
          alignItems: 'flex-end'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url(/glasses.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: isMobile ? 'center top' : 'center',
            zIndex: 1
          }} />

          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: isMobile
              ? 'linear-gradient(180deg, rgba(10,10,11,0.80) 0%, rgba(10,10,11,0.60) 50%, rgba(10,10,11,0.90) 100%)'
              : 'radial-gradient(ellipse at center, rgba(10,10,11,0.50) 0%, rgba(10,10,11,0.75) 60%, rgba(10,10,11,0.95) 100%)',
            zIndex: 2
          }} />

          <div className="container" style={{
            position: 'relative',
            zIndex: 10,
            padding: isMobile ? '0 1rem' : undefined
          }}>
            <div style={{
              textAlign: 'center',
              maxWidth: '900px',
              margin: '0 auto',
              paddingBottom: isMobile ? '2rem' : '3rem'
            }}>
              <h1 className="h1" style={{
                marginBottom: isMobile ? '1.5rem' : '2rem',
                fontSize: isMobile ? 'clamp(1.8rem, 7vw, 2.5rem)' : 'clamp(2.5rem, 5vw, 3.5rem)',
                color: '#ffffff',
                lineHeight: '1.2'
              }}>
                Not just a life coach, therapist or practitioner - a guide shaped by the same fire you're standing in.
              </h1>

              <Link href="/work" className="btn-primary" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                Work With Me <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* STORY SECTION */}
        <section className="section section-alt">
          <div className="container">
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <div style={{ maxWidth: '900px', margin: '0 auto', marginBottom: '4rem' }}>
                <div className="body-large" style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
                  <p style={{ marginBottom: '2rem', fontSize: '1.4rem', fontWeight: 600 }}>
                    Hi, I'm True North.
                  </p>
                  <p style={{ marginBottom: '2rem' }}>
                    I don't believe anyone makes it through life unscathed. Feeling the full range of emotions is our gift, it's the whole purpose for being here. Being able to recognise and navigate those emotions so you avoid causing too much damage, to yourself and to others, that's where the work begins.
                  </p>
                  <p style={{ marginBottom: '2rem' }}>
                    I have survived a hundred percent of the shit I've been through so far. Addiction, depression and nearly everything in between, I have had my fair share. People ask would I change things, and honestly there are a few changes I would make, but I do not regret the experiences I went through because they gave me everything I needed to do this work.
                  </p>
                  <p style={{ marginBottom: '2rem' }}>
                    I broke free. Built businesses. Became a professional athlete. On paper I thought I'd made it, but I still felt disconnected, still lost, still carrying around something I couldn't name. I thought the external stuff would fix it.
                  </p>
                  <p style={{ marginBottom: '2rem' }}>
                    So I stopped looking outward and started going inward, because it became evident that no amount of external change was making a difference to how I internally felt. I'd done all the cliché things, ticked all the boxes, and still felt the same weight.
                  </p>
                  <p style={{ marginBottom: '2rem' }}>
                    When I started to come out the other side I was told that my path was to pay it forward, to guide others going through their own blocked or difficult season. I was reluctant, but everything kept calling me to it.
                  </p>
                  <p style={{ marginBottom: '2rem' }}>
                    So I spent more than a decade training with some of the best in the world. Breathwork, nervous system work, men's work, emotional mastery, somatic therapy, energy work. I did all of it on myself first, not to escape myself but to feel myself and meet myself.
                  </p>
                  <p style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: currentTheme.primary,
                    textAlign: 'center',
                    padding: '2rem 0',
                    fontStyle: 'italic'
                  }}>
                    And that is the work I do with others.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* JOURNEY SECTION */}
        <section className="section">
          <div className="container">
            <div style={{ maxWidth: '900px', margin: '0 auto', marginBottom: '4rem' }}>
              <p style={{
                fontSize: '1.5rem',
                fontFamily: 'Gambarino, serif',
                textAlign: 'center',
                color: currentTheme.primary,
                marginBottom: '1.5rem'
              }}>
                What I found was peace, I found power and I found purpose.
              </p>
              <p className="body-large" style={{ textAlign: 'center', marginBottom: '3rem', lineHeight: '1.8' }}>
                Now I help others find the same.
              </p>
            </div>
          </div>
        </section>

        {/* BRIDGE SECTION */}
        <section className="section section-alt">
          <div className="container">
            <div style={{ maxWidth: '900px', margin: '0 auto', marginBottom: '3rem' }}>
              <p className="body-large" style={{
                textAlign: 'center',
                marginBottom: '3rem',
                lineHeight: '1.8'
              }}>
                No hype. No surface level talk. Real tools that work in the body, the mind and in life.
              </p>

              <div className="body-large" style={{ lineHeight: '1.8', marginBottom: '3rem', textAlign: 'center' }}>
                <p style={{ marginBottom: '0.75rem' }}>If you're stuck in anger, shame, anxiety or burnout,</p>
                <p style={{ marginBottom: '0.75rem' }}>if you've lost motivation and can't find your edge,</p>
                <p style={{ marginBottom: '0.75rem' }}>if you've lost yourself in the noise,</p>
                <p style={{ marginBottom: '0.75rem' }}>if you know you're built for more but can't access it</p>
              </div>

              <p className="body-large" style={{
                textAlign: 'center',
                marginBottom: '3rem',
                fontWeight: '600'
              }}>
                I'm here to walk beside you.
              </p>

              <div style={{ textAlign: 'center' }}>
                <Link href="/work" className="btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  Work With Me <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CREDENTIALS SECTION */}
        <section className="section">
          <div className="container">
            <h2 className="h2" style={{ textAlign: 'center', marginBottom: '4rem' }}>
              Professional Credentials
            </h2>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <h3 className="h3" style={{ marginBottom: '2rem', color: currentTheme.accent }}>
                Licences and Certifications
              </h3>

              <div className="body" style={{ lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '3rem' }}>
                <p style={{ marginBottom: '2rem' }}>
                  I'm a certified coach and member of the <strong style={{ color: currentTheme.accent }}>ICF</strong>, <strong style={{ color: currentTheme.accent }}>EMCC</strong> and <strong style={{ color: currentTheme.accent }}>Association for Coaching</strong>, three of the most respected bodies in the coaching world.
                </p>
                <p style={{ marginBottom: '2rem' }}>
                  I'm a certified breathwork practitioner, trained by <strong style={{ color: currentTheme.accent }}>BreathOnIt</strong> in Los Angeles and recognised by the <strong style={{ color: currentTheme.accent }}>International Breathwork Foundation</strong>.
                </p>
                <p style={{ marginBottom: '2rem' }}>
                  I hold formal certification in trauma informed somatic therapy, trained under some of the world's leading voices in the field including <strong style={{ color: currentTheme.accent }}>Dr Gabor Maté</strong>.
                </p>
                <p style={{ marginBottom: '3rem' }}>
                  I've completed <strong style={{ color: currentTheme.accent }}>Reiki Master training</strong> at the <strong style={{ color: currentTheme.accent }}>London Reiki Science Academy</strong>, grounding my energy work in structure and precision.
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
                  Everything I share is built on deep training and lived experience. You're in safe hands.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* EXPERIENCE SECTION */}
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
                My work is shaped by real life, not textbooks.
              </p>

              <div className="body" style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
                <p style={{ marginBottom: '2rem' }}>
                  I've lived through addiction, trauma, heartbreak and financial collapse. These experiences taught me what no training ever could, how to meet people where they are, with depth, with truth.
                </p>
                <p style={{ marginBottom: '2rem' }}>
                  I spent over seven years running one of London's early corporate wellness companies, delivering coaching and mental health support inside global tech firms, pharmaceutical companies and construction leaders. I've seen both sides of the system, the pressure on employees, the blind spots in leadership.
                </p>
                <p style={{ marginBottom: '2rem' }}>
                  In my private practice I work with high performers across industries who've hit external success but still feel empty. Over time I've learnt how to cut through the noise and get to the root of what's missing, fast.
                </p>
                <p style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: currentTheme.primary,
                  textAlign: 'center',
                  padding: '2rem 0'
                }}>
                  Clients leave with clarity, direction and a deeper connection to who they actually are.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BELIEFS SECTION */}
        <section className="section">
          <div className="container">
            <h2 className="h2" style={{ textAlign: 'center', marginBottom: '4rem' }}>
              What I Believe
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
              <div className="card">
                <p className="body" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                  You are not broken. You are blocked.
                </p>
              </div>

              <div className="card">
                <p className="body" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                  Your pain is part of your power, if you learn how to work with it.
                </p>
              </div>

              <div className="card">
                <p className="body" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                  You don't need fixing. You need to feel.
                </p>
              </div>

              <div className="card" style={{ backgroundColor: currentTheme.primary + '15', border: `1px solid ${currentTheme.primary}40` }}>
                <p className="body" style={{ fontSize: '1.1rem', fontWeight: '500', color: currentTheme.primary }}>
                  Transformation doesn't happen in your head. It happens in your body.
                </p>
                <p style={{ fontSize: '0.8rem', color: currentTheme.primary, opacity: 0.7, marginTop: '0.75rem', fontStyle: 'italic' }}>
                  Audio practice library - coming soon
                </p>
              </div>
            </div>
          </div>
        </section>

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
