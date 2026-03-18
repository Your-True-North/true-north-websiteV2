'use client'

import { useEffect, useState } from 'react'
import { trackEvent } from '@/app/components/GoogleAnalytics'

const STRIPE_URL = 'https://buy.stripe.com/fZu3cw4iH3w94Ry9HN9IQ0l'
const ACCENT = '#9bc4b8'
const ACCENT_HOVER = '#7da89c'
const TEXT = '#0a0a0a'
const MUTED = '#666666'
const BODY_FONT = '-apple-system, BlinkMacSystemFont, sans-serif'

export default function PatternAuditSalesPage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const hide = () => {
      document
        .querySelectorAll(
          'nav, header, footer, [role="navigation"], [role="contentinfo"], [class*="footer"], [class*="Footer"]'
        )
        .forEach((el) => ((el as HTMLElement).style.display = 'none'))
    }
    hide()
    setTimeout(hide, 100)
  }, [])

  useEffect(() => {
    trackEvent('pattern_audit_sales_page_view')
  }, [])

  const handlePurchaseClick = () => {
    trackEvent('pattern_audit_purchase_click')
  }

  const vPad = isMobile ? '48px' : '80px'
  const hPad = isMobile ? '20px' : '40px'
  const section = (bg: string) => ({
    background: bg,
    padding: `${vPad} ${hPad}`,
  })
  const inner = {
    maxWidth: '720px',
    margin: '0 auto',
  }
  const bodyText = {
    fontSize: '19px',
    lineHeight: 1.75,
    color: TEXT,
    fontFamily: BODY_FONT,
  }

  const ctaButton = (
    <a
      href={STRIPE_URL}
      onClick={handlePurchaseClick}
      style={{
        display: 'inline-block',
        padding: '16px 40px',
        background: ACCENT,
        color: TEXT,
        fontSize: '16px',
        fontWeight: 600,
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        textDecoration: 'none',
        transition: 'background 0.2s ease',
        fontFamily: BODY_FONT,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = ACCENT_HOVER)}
      onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT)}
    >
      Get The Pattern Audit — £37
    </a>
  )

  return (
    <>
      <style jsx global>{`
        nav,
        header,
        footer,
        [role='navigation'],
        [role='contentinfo'],
        [class*='footer'],
        [class*='Footer'] {
          display: none !important;
        }
        body {
          background: #ffffff;
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#ffffff', color: TEXT }}>

        {/* ── 1. HERO ── */}
        <section style={{ ...section('#ffffff'), textAlign: 'center', paddingTop: isMobile ? '64px' : '96px' }}>
          <div style={inner}>
            <p style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: ACCENT,
              marginBottom: '24px',
              fontFamily: BODY_FONT,
            }}>
              PDF Workbook + Video
            </p>

            <h1 style={{
              fontSize: isMobile ? '40px' : '64px',
              fontWeight: 500,
              lineHeight: 1.1,
              color: TEXT,
              marginBottom: '24px',
              fontFamily: "'Gambarino', serif",
            }}>
              You can't change a pattern you can't see
            </h1>

            <p style={{
              fontSize: isMobile ? '17px' : '19px',
              color: MUTED,
              lineHeight: 1.7,
              marginBottom: '40px',
              fontFamily: BODY_FONT,
              maxWidth: '600px',
              margin: '0 auto 40px',
            }}>
              Most men spend years trying to fix the same problems. The Pattern Audit shows you what's actually running the show — so you can change it at the root.
            </p>

            {ctaButton}
          </div>
        </section>

        {/* ── 2. THE PROBLEM ── */}
        <section style={section('#ffffff')}>
          <div style={inner}>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              You've tried changing the behaviour. You set new intentions. You've been through the podcasts, the books, maybe the therapy. And still — the same wall.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              In money it looks one way. You build momentum and then something happens. You undercharge. You delay. You watch the opportunity pass and there's a part of you that already knew you would.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              In relationships it looks different but it's the same thing. The same argument showing up in different clothes. The same moment where you shut down when you most needed to stay open. The same distance you create without meaning to.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              Maybe it's the anger that comes from nowhere. Or the way you disappear when life gets heavy. Or the gap between the man people see and the man you live with privately.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              The problem isn't discipline. It isn't effort. You have enough of both.
            </p>
            <p style={{ ...bodyText, marginBottom: '0', fontWeight: 500 }}>
              The problem is that you've been working on the surface expression of something that lives much deeper. And you can't fix what you haven't seen clearly.
            </p>
          </div>
        </section>

        {/* ── 3. WHAT IT IS ── */}
        <section style={{ ...section('#f8f8f8') }}>
          <div style={inner}>
            <h2 style={{
              fontSize: isMobile ? '32px' : '44px',
              fontWeight: 500,
              color: TEXT,
              marginBottom: '32px',
              fontFamily: "'Gambarino', serif",
            }}>
              What the Pattern Audit is
            </h2>

            <p style={{ ...bodyText, marginBottom: '20px' }}>
              A seven-step shadow work process built to take you one layer deeper than naming.
            </p>
            <p style={{ ...bodyText, marginBottom: '20px' }}>
              Most men can name their pattern. They've been naming it for years. The name hasn't changed anything because the name is not the root.
            </p>
            <p style={{ ...bodyText, marginBottom: '32px' }}>
              The Audit moves through seven layers: the surface behaviour, the trigger beneath it, the emotion underneath that, the internal story driving it, the hidden payoff keeping it in place, the identity fear that protects it, and finally the full picture — seen whole for the first time.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              {[
                { bold: 'The video', desc: ' walks you through each step of the process. I take you into the framework and show you exactly how to apply it to yourself.' },
                { bold: 'The workbook', desc: ' gives you structured space to do the work properly. Focused questions designed to surface what the surface-level read has missed.' },
                { bold: 'Your own journal works too', desc: ' if you prefer. The workbook is the prompt. The honesty is yours.' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    borderLeft: `3px solid ${ACCENT}`,
                    paddingLeft: '20px',
                  }}
                >
                  <p style={bodyText}>
                    <strong>{item.bold}</strong>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <p style={{ ...bodyText, marginBottom: '0' }}>
              It takes 30 to 45 minutes. This is not a course. Not a programme. One focused session that changes what you're able to see — and once you see it, you can't unsee it.
            </p>
          </div>
        </section>

        {/* ── 4. WHAT HE LEAVES WITH ── */}
        <section style={section('#ffffff')}>
          <div style={inner}>
            <h2 style={{
              fontSize: isMobile ? '32px' : '44px',
              fontWeight: 500,
              color: TEXT,
              marginBottom: '40px',
              fontFamily: "'Gambarino', serif",
            }}>
              What you'll leave with
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                "You'll know exactly what pattern is running your life, where it started, and what it has been protecting you from all this time.",
                "You'll see where the same pattern shows up across money, relationships, health, and purpose at once — the connecting thread you've been missing.",
                "You'll have a clear starting point. Not more information. A specific, named thing to actually work with.",
                "You'll understand why effort and discipline haven't been enough — and what the work beneath the work actually looks like.",
              ].map((text, i) => (
                <div
                  key={i}
                  style={{
                    borderLeft: `3px solid ${ACCENT}`,
                    paddingLeft: '24px',
                  }}
                >
                  <p style={{ ...bodyText, margin: 0 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. TRUE NORTH SAYS ── */}
        <section style={{
          ...section('#f0f0f0'),
          paddingTop: isMobile ? '64px' : '96px',
          paddingBottom: isMobile ? '64px' : '96px',
          boxShadow: '0 2px 24px rgba(0,0,0,0.06)',
        }}>
          <div style={inner}>
            <div style={{ borderLeft: `3px solid ${ACCENT}`, paddingLeft: '24px' }}>
              <p style={{ ...bodyText, fontSize: '1.2rem', lineHeight: 1.9, marginBottom: '20px' }}>
                I built the Pattern Audit because naming a pattern is not the same as seeing it. I've sat with enough men to know that the ones who are stuck aren't lacking insight — they're missing depth. They've got the surface story down. What they haven't touched is the layer underneath that wrote the story in the first place. That's what this is for. Not to fix anything. Just to see clearly. Because that's where the real work starts.
              </p>
              <p style={{
                fontSize: '14px',
                color: MUTED,
                fontFamily: BODY_FONT,
                margin: 0,
              }}>
                — True North
              </p>
            </div>
          </div>
        </section>

        {/* ── 6. CLOSING CTA ── */}
        <section style={{ ...section('#ffffff'), textAlign: 'center' }}>
          <div style={inner}>
            <p style={{
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: 600,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: MUTED,
              marginBottom: '24px',
              fontFamily: BODY_FONT,
            }}>
              £37. One time. No subscription.
            </p>

            {ctaButton}

            <p style={{
              fontSize: '13px',
              color: MUTED,
              marginTop: '14px',
              fontFamily: BODY_FONT,
            }}>
              You'll receive immediate access by email after purchase.
            </p>
          </div>
        </section>

      </div>
    </>
  )
}
