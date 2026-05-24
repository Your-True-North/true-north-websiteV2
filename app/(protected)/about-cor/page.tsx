'use client'

import { useState, useEffect } from 'react'

const ACCENT = '#9bc4b8'
const BODY_FONT = '-apple-system, BlinkMacSystemFont, sans-serif'

export default function AboutCorPage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const body: React.CSSProperties = {
    fontSize: '17px',
    lineHeight: 1.9,
    color: '#a0a09c',
    fontFamily: BODY_FONT,
    marginBottom: '20px',
  }

  const heading: React.CSSProperties = {
    fontSize: isMobile ? '26px' : '32px',
    fontWeight: 400,
    lineHeight: 1.35,
    color: '#f0ede8',
    marginBottom: '24px',
  }

  const divider = (
    <div style={{ width: '40px', height: '2px', background: ACCENT, margin: '48px 0' }} />
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0d', fontFamily: BODY_FONT }}>

      {/* Hero strip */}
      <div style={{
        background: '#111110',
        borderBottom: '1px solid #242422',
        padding: isMobile ? '40px 20px' : '56px 24px',
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <p style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '2px',
            textTransform: 'uppercase', color: ACCENT, marginBottom: '16px',
          }}>
            About the Circle
          </p>
          <h2 style={{
            fontSize: isMobile ? '24px' : '30px',
            fontWeight: 400,
            lineHeight: 1.45,
            color: '#f0ede8',
            margin: 0,
          }}>
            This is not a product, a programme or a course. It's a journey of self-discovery.
          </h2>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: isMobile ? '40px 20px 80px' : '56px 24px 100px' }}>

        {/* Section 1 */}
        <div style={{ background: '#1a1a18', borderRadius: '6px', padding: isMobile ? '28px 24px' : '40px 48px', marginBottom: '24px', border: '1px solid #2c2c2a' }}>
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
            I created this Circle because I believe we are at a moment where men doing genuine inner work is not optional any more. The cost of men who are numb, reactive, or checked out is everywhere. I want to be part of building something that runs in the opposite direction. This work you're doing will <span style={{ color: ACCENT, fontWeight: 500 }}>compound</span>.
          </p>
        </div>

        {/* Section 2 */}
        <div style={{ background: '#1a1a18', borderRadius: '6px', padding: isMobile ? '28px 24px' : '40px 48px', marginBottom: '24px', border: '1px solid #2c2c2a' }}>
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
        <div style={{ marginBottom: '24px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #2c2c2a' }}>
          <img
            src="/serious.jpg"
            alt="True North"
            style={{ width: '100%', display: 'block', maxHeight: '480px', objectFit: 'cover', objectPosition: 'top' }}
          />
          <div style={{ background: '#1a1a18', padding: '16px 24px', border: '1px solid #2c2c2a', borderTop: 'none' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#666', fontFamily: BODY_FONT }}>True North</p>
          </div>
        </div>

        {/* Section 3 */}
        <div style={{ background: '#1a1a18', borderRadius: '6px', padding: isMobile ? '28px 24px' : '40px 48px', marginBottom: '24px', border: '1px solid #2c2c2a' }}>
          <h2 style={heading}>The Circle is not a course. It is not coaching.</h2>
          <p style={body}>
            It is a living community of men committed to real transformation. The sessions are live and the conversations are real. There is no script and no performance expected.
          </p>
          <p style={body}>
            We meet weekly. We do somatic work and we look at what is actually running underneath the behaviour. We build genuine regulation, not just insight. We hold each other accountable to the work between sessions, not just during them.
          </p>
          <p style={body}>
            The community is private so what gets said here stays here. This isn't the place to "be the best". Men come here to do the actual work, and that creates a <span style={{ color: ACCENT, fontWeight: 500 }}>different kind of room</span>.
          </p>
          <p style={{ ...body, marginBottom: 0 }}>
            You are not just a member. You are part of the bigger mission that is now in motion.
          </p>
        </div>

        {/* Section 4 */}
        <div style={{ background: '#1a1a18', borderRadius: '6px', padding: isMobile ? '28px 24px' : '40px 48px', marginBottom: '24px', border: '1px solid #2c2c2a' }}>
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
        <div style={{ padding: isMobile ? '28px 24px' : '40px 48px', textAlign: 'center' }}>
          <h2 style={{
            fontSize: isMobile ? '24px' : '30px',
            fontWeight: 400,
            lineHeight: 1.45,
            color: '#f0ede8',
            margin: 0,
          }}>
            Where you are now does not have to be where you end up.
          </h2>
        </div>

      </div>
    </div>
  )
}
