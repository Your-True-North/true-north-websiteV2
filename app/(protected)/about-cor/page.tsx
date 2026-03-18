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

  useEffect(() => {
    document.querySelectorAll('footer').forEach((el) => {
      ;(el as HTMLElement).style.display = 'none'
    })
  }, [])

  const containerPadding = isMobile ? '32px 20px 64px' : '48px 24px 80px'

  const body: React.CSSProperties = {
    fontSize: '16px',
    lineHeight: 1.85,
    color: '#333',
    fontFamily: BODY_FONT,
    marginBottom: '20px',
  }

  const sectionGap: React.CSSProperties = {
    marginBottom: '64px',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#1a1a1a' }}>
      <div
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: containerPadding,
        }}
      >

        {/* Opening statement */}
        <div style={{ marginBottom: '64px' }}>
          <p
            style={{
              fontFamily: 'Gambarino, serif',
              fontSize: isMobile ? '30px' : '36px',
              fontWeight: 400,
              lineHeight: 1.3,
              color: '#1a1a1a',
              margin: 0,
            }}
          >
            This is not a product. It is not a programme. It is what happens when enough men stop performing and start becoming.
          </p>
        </div>

        {/* Section 1 — Why this exists */}
        <div style={sectionGap}>
          <p style={body}>
            I built The Circle of Return because I have seen what real inner work does to a man. Not just to him. Through him.
          </p>
          <p style={body}>
            The men I have worked with closely do not just become calmer or clearer. They go home differently. They father differently. They show up at work differently. Their children feel it. Their partners feel it. The people around them feel it without being told anything has changed.
          </p>
          <p style={body}>
            That is not metaphor. That is what happens when a man actually does the work rather than thinking about doing the work.
          </p>
          <p style={{ ...body, marginBottom: 0 }}>
            I created this Circle because I believe we are at a moment where men doing genuine inner work is not optional any more. The cost of men who are numb, reactive, or checked out is everywhere. I want to be part of building something that runs in the opposite direction. Something that <span style={{ color: ACCENT }}>compounds</span>.
          </p>
        </div>

        {/* Section 2 — The scale of the vision */}
        <div style={sectionGap}>
          <p
            style={{
              fontFamily: 'Gambarino, serif',
              fontSize: isMobile ? '26px' : '30px',
              fontWeight: 400,
              lineHeight: 1.35,
              color: '#1a1a1a',
              marginBottom: '28px',
            }}
          >
            I am thinking about tens of thousands of men.
          </p>
          <p style={body}>
            Not followers. Not customers. Men who have done the work and carry themselves differently because of it. Men who have sat in the discomfort, looked at the parts of themselves they would rather not see, and come out the other side more whole.
          </p>
          <p style={body}>
            Every man who transforms here creates a ripple. In his family. In his friendships. In the way he earns, leads, and fathers. The compound interest of inner work at scale is staggering when you think it through. One man becomes a better father. His children grow up feeling safe. They build relationships from that security. The ripple moves forward in time for decades.
          </p>
          <p style={{ ...body, marginBottom: 0 }}>
            That is what I am building toward. And every man who joins this Circle is part of that.
          </p>
        </div>

        {/* Photo of True North */}
        <div style={{ ...sectionGap, textAlign: 'center' }}>
          <img
            src="/serious.jpg"
            alt="True North"
            style={{
              width: isMobile ? '100%' : '300px',
              maxWidth: '300px',
              borderRadius: '8px',
              display: 'block',
              margin: '0 auto',
            }}
          />
          <p
            style={{
              fontSize: '13px',
              color: '#666',
              fontFamily: BODY_FONT,
              marginTop: '12px',
              marginBottom: 0,
            }}
          >
            True North. London.
          </p>
        </div>

        {/* Section 3 — What the Circle actually is */}
        <div style={sectionGap}>
          <p
            style={{
              fontFamily: 'Gambarino, serif',
              fontSize: isMobile ? '26px' : '30px',
              fontWeight: 400,
              lineHeight: 1.35,
              color: '#1a1a1a',
              marginBottom: '28px',
            }}
          >
            The Circle is not a course. It is not coaching.
          </p>
          <p style={body}>
            It is a living community of men committed to real transformation. The sessions are live. The conversations are real. There is no script and no performance expected.
          </p>
          <p style={body}>
            We meet weekly. We do somatic work. We look at what is actually running underneath the behaviour. We build regulation, not just insight. We hold each other accountable to the work between sessions, not just during them.
          </p>
          <p style={{ ...body, marginBottom: 0 }}>
            The community is private by design. What gets said here stays here. There is no posturing, no one-upmanship, no performance of having it together. Men come here to do the actual work, and that creates a <span style={{ color: ACCENT }}>different kind of room</span>.
          </p>
        </div>

        {/* Section 4 — Their part in this */}
        <div style={sectionGap}>
          <p
            style={{
              fontFamily: 'Gambarino, serif',
              fontSize: isMobile ? '26px' : '30px',
              fontWeight: 400,
              lineHeight: 1.35,
              color: '#1a1a1a',
              marginBottom: '28px',
            }}
          >
            You are not just a member. You are the mission in motion.
          </p>
          <p style={body}>
            Every time you show up honestly in this space, you are proof that something different is possible. You are not here to consume content. You are here to become someone. And that becoming does not stay contained to your sessions.
          </p>
          <p style={body}>
            You carry it out. Into your home. Into your work. Into every interaction where a less conscious version of you would have reacted, avoided, or shut down. You might not name it. You might not notice it. But the people around you will.
          </p>
          <p style={{ ...body, marginBottom: 0 }}>
            I want you to feel the weight of that. Not as pressure. As honour. You chose to be here. That choice already says something about who you are becoming.
          </p>
        </div>

        {/* Close */}
        <div>
          <p style={body}>
            I am not interested in men who want to talk about change. I am interested in men who want to do it. That is who this Circle was built for.
          </p>
          <p
            style={{
              fontFamily: 'Gambarino, serif',
              fontSize: isMobile ? '22px' : '26px',
              fontWeight: 400,
              lineHeight: 1.45,
              color: '#1a1a1a',
              margin: 0,
            }}
          >
            Where you are now does not have to be where you end up.
          </p>
        </div>

      </div>
    </div>
  )
}
