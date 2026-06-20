'use client'

import { useState, useEffect } from 'react'

export default function AboutCorPage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const body: React.CSSProperties = {
    fontSize: '14px',
    lineHeight: 1.8,
    color: 'var(--kyn-ink2)',
    fontFamily: 'var(--kyn-font-sans)',
    marginBottom: '16px',
  }

  const heading: React.CSSProperties = {
    fontSize: isMobile ? '20px' : '22px',
    fontWeight: isMobile ? 700 : 400,
    lineHeight: 1.35,
    color: 'var(--kyn-ink)',
    marginBottom: '18px',
    fontFamily: 'var(--kyn-font-serif)',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--kyn-bg)', fontFamily: 'var(--kyn-font-sans)' }}>

      {/* Hero strip */}
      <div style={{
        background: 'var(--kyn-surface)',
        borderBottom: '1px solid var(--kyn-border)',
        padding: isMobile ? '28px 20px' : '40px 32px',
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <p style={{
            fontSize: isMobile ? '11px' : '9.5px', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--kyn-green)', marginBottom: '12px',
            fontFamily: 'var(--kyn-font-sans)'
          }}>
            About the Circle
          </p>
          <h2 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: isMobile ? 700 : 400,
            lineHeight: 1.45,
            color: 'var(--kyn-ink)',
            margin: 0,
            fontFamily: 'var(--kyn-font-serif)'
          }}>
            This is not a product, a programme or a course. It's a journey of self-discovery.
          </h2>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: isMobile ? '28px 16px 72px' : '40px 32px 72px' }}>

        {/* Section 1 */}
        <div style={{ background: 'var(--kyn-surface)', borderRadius: 'var(--kyn-r-lg)', padding: isMobile ? '20px 18px' : '28px 32px', marginBottom: '12px', border: '1px solid var(--kyn-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p style={body}>
            I built The Circle of Return because I have seen what real inner work does to a man. Not just to him, but all of his life domains.
          </p>
          <p style={body}>
            The men I have worked with closely do not just become calmer, clearer or more confident. They go home differently, they father differently, they show up at work differently. The people around them feel it, and they comment on it - without being told anything has changed.
          </p>
          <p style={body}>
            This is not metaphor... it's what happens when a man actually does the work rather than thinking about doing the work.
          </p>
          <p style={{ ...body, marginBottom: 0 }}>
            I created this Circle because I believe we are at a moment where men doing genuine inner work is not optional any more. The cost of men who are numb, reactive, or checked out is everywhere. I want to be part of building something that runs in the opposite direction. This work you're doing will <span style={{ color: 'var(--kyn-green)', fontWeight: 600 }}>compound</span>.
          </p>
        </div>

        {/* Section 2 */}
        <div style={{ background: 'var(--kyn-surface)', borderRadius: 'var(--kyn-r-lg)', padding: isMobile ? '20px 18px' : '28px 32px', marginBottom: '12px', border: '1px solid var(--kyn-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 style={heading}>I am thinking about tens of thousands of men.</h2>
          <p style={body}>
            Not followers or customers. I'm talking men who have done the work and carry themselves differently because of it - the ones who have sat in the discomfort, looked at the parts of themselves they would rather not see, and come out the other side more whole.
          </p>
          <p style={body}>
            Every man who transforms here will create a ripple - in his family, his friendships, in the way he earns, leads, and fathers. The compound interest of inner work at scale is staggering when you think about it. One man becomes a better father. His children grow up feeling safe. They build relationships from that security. The ripple moves forward in time for decades.
          </p>
          <p style={{ ...body, marginBottom: 0 }}>
            That is what I am building toward. And every man who joins this Circle is part of that.
          </p>
        </div>

        {/* Photo */}
        <div style={{ marginBottom: '12px', borderRadius: 'var(--kyn-r-lg)', overflow: 'hidden', border: '1px solid var(--kyn-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <img
            src="/serious.jpg"
            alt="True North"
            style={{ width: '100%', display: 'block', maxHeight: '440px', objectFit: 'cover', objectPosition: 'top' }}
          />
          <div style={{ background: 'var(--kyn-surface)', padding: '12px 18px', borderTop: '1px solid var(--kyn-border)' }}>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--kyn-ink3)', fontFamily: 'var(--kyn-font-sans)' }}>True North</p>
          </div>
        </div>

        {/* Section 3 */}
        <div style={{ background: 'var(--kyn-surface)', borderRadius: 'var(--kyn-r-lg)', padding: isMobile ? '20px 18px' : '28px 32px', marginBottom: '12px', border: '1px solid var(--kyn-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 style={heading}>The Circle is not a course. It is not coaching.</h2>
          <p style={body}>
            It is a living community of men committed to real transformation. The sessions are live and the conversations are real. There is no script and no performance expected.
          </p>
          <p style={body}>
            We meet weekly. We do somatic work and we look at what is actually running underneath the behaviour. We build genuine regulation, not just insight. We hold each other accountable to the work between sessions, not just during them.
          </p>
          <p style={body}>
            The community is private so what gets said here stays here. This isn't the place to "be the best". Men come here to do the actual work, and that creates a <span style={{ color: 'var(--kyn-green)', fontWeight: 600 }}>different kind of room</span>.
          </p>
          <p style={{ ...body, marginBottom: 0 }}>
            You are not just a member. You are part of the bigger mission that is now in motion.
          </p>
        </div>

        {/* Section 4 */}
        <div style={{ background: 'var(--kyn-surface)', borderRadius: 'var(--kyn-r-lg)', padding: isMobile ? '20px 18px' : '28px 32px', marginBottom: '12px', border: '1px solid var(--kyn-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p style={body}>
            Every time you show up honestly in this space, you are proof that something different is possible. You are not here to consume content. You are here to become someone. You're here to carry it out into your life. Into every interaction where a less conscious version of you would have reacted, avoided, or shut down.
          </p>
          <p style={body}>
            I want you to feel the weight of that. Not as pressure, but as an honour because you chose to be here. That choice already says something about who you are becoming.
          </p>
          <p style={{ ...body, marginBottom: 0 }}>
            I am not interested in men who want to talk about change. I am interested in men who want to do it. That is who this Circle was built for.
          </p>
        </div>

        {/* Close */}
        <div style={{ padding: isMobile ? '20px 18px' : '28px 32px', textAlign: 'center' }}>
          <h2 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: isMobile ? 700 : 400,
            lineHeight: 1.45,
            color: 'var(--kyn-ink)',
            margin: 0,
            fontFamily: 'var(--kyn-font-serif)'
          }}>
            Where you are now does not have to be where you end up.
          </h2>
        </div>

      </div>
    </div>
  )
}
