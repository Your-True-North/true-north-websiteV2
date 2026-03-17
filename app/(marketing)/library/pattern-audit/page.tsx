'use client'

import { useEffect, useState } from 'react'
import { trackEvent } from '@/app/components/GoogleAnalytics'

const VIMEO_ID = '1174400479'
const PDF_URL = 'https://yourtruenorth.me/pattern-audit-workbook.pdf'

const ACCENT = '#9bc4b8'
const TEXT = '#1a1a1a'
const MUTED = '#666666'
const BORDER = '#e5e5e5'
const BODY_FONT = '-apple-system, BlinkMacSystemFont, sans-serif'

export default function PatternAuditPage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    // Hide marketing nav/footer — this page is standalone
    const hide = () => {
      document
        .querySelectorAll('nav, header, footer, [role="navigation"], [role="contentinfo"]')
        .forEach((el) => ((el as HTMLElement).style.display = 'none'))
    }
    hide()
    setTimeout(hide, 100)
  }, [])

  useEffect(() => {
    trackEvent('pattern_audit_page_view')
  }, [])

  const handleDownload = () => {
    trackEvent('pattern_audit_workbook_download')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        color: TEXT,
        fontFamily: BODY_FONT,
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: `1px solid ${BORDER}`,
          padding: '20px 32px',
          background: '#ffffff',
        }}
      >
        <p
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            color: ACCENT,
            margin: 0,
          }}
        >
          Circle of Return · Pattern Audit
        </p>
      </div>

      {/* Main content */}
      <div
        style={{
          maxWidth: '1080px',
          margin: '0 auto',
          padding: isMobile ? '32px 20px 48px' : '48px 32px 64px',
        }}
      >
        {/* Title */}
        <div style={{ marginBottom: isMobile ? '28px' : '36px' }}>
          <h1
            style={{
              fontFamily: "'Gambarino', serif",
              fontSize: isMobile ? '28px' : '36px',
              fontWeight: 400,
              color: TEXT,
              marginBottom: '8px',
              lineHeight: 1.2,
            }}
          >
            The Pattern Audit
          </h1>
          <p style={{ fontSize: '15px', color: MUTED, lineHeight: 1.6 }}>
            Guided video and structured workbook. Work through this before your first session.
          </p>
        </div>

        {/* Two-column layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 320px',
            gap: isMobile ? '28px' : '36px',
            alignItems: 'start',
          }}
        >
          {/* Left: Video */}
          <div>
            <div
              style={{
                position: 'relative',
                paddingTop: '56.25%',
                background: '#0a0a0a',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              <iframe
                src={`https://player.vimeo.com/video/${VIMEO_ID}?badge=0&autopause=0&player_id=0&app_id=58479`}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
                title="PATTERN AUDIT"
              />
            </div>

            <div style={{ marginTop: '20px' }}>
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: TEXT,
                  marginBottom: '10px',
                }}
              >
                How to use this
              </h2>
              <p style={{ fontSize: '14px', color: MUTED, lineHeight: 1.75, marginBottom: '10px' }}>
                Use the video and workbook together. Pause when something lands. Come back to it between sessions. This is not a one-sitting exercise.
              </p>
              <p style={{ fontSize: '14px', color: MUTED, lineHeight: 1.75 }}>
                There are no right answers. The value is in what surfaces when you slow down enough to look.
              </p>
            </div>
          </div>

          {/* Right: Workbook download */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Download card */}
            <div
              style={{
                border: `1px solid ${BORDER}`,
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background: '#3a3a3a',
                  padding: '14px 20px',
                }}
              >
                <p
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: '#ffffff',
                    margin: 0,
                  }}
                >
                  Your workbook
                </p>
              </div>
              <div style={{ padding: '20px', background: '#fafafa' }}>
                <p
                  style={{
                    fontSize: '14px',
                    color: TEXT,
                    lineHeight: 1.7,
                    marginBottom: '20px',
                  }}
                >
                  The structured workbook. Focused questions designed to surface the pattern underneath the pattern — the layer that keeps the same outcomes repeating.
                </p>
                <a
                  href={PDF_URL}
                  download
                  onClick={handleDownload}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '13px 20px',
                    background: ACCENT,
                    color: TEXT,
                    fontSize: '14px',
                    fontWeight: 600,
                    borderRadius: '5px',
                    textDecoration: 'none',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                  }}
                >
                  Download Workbook (PDF)
                </a>
              </div>
            </div>

            {/* What's inside */}
            <div
              style={{
                border: `1px solid ${BORDER}`,
                borderRadius: '8px',
                padding: '20px',
              }}
            >
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: MUTED,
                  marginBottom: '14px',
                }}
              >
                What's inside
              </p>
              {[
                'Surface patterns and the wound underneath',
                'Map where the pattern shows up across your life',
                'Identify what the pattern has been protecting',
                'Set a clear starting point for your first session',
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                    marginBottom: i < 3 ? '10px' : 0,
                  }}
                >
                  <span
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: ACCENT,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                      fontSize: '9px',
                      color: TEXT,
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </span>
                  <p style={{ fontSize: '13px', color: TEXT, lineHeight: 1.6, margin: 0 }}>{item}</p>
                </div>
              ))}
            </div>

            {/* Note */}
            <p
              style={{
                fontSize: '12px',
                color: MUTED,
                lineHeight: 1.65,
                padding: '0 4px',
              }}
            >
              Take your time with this. There is no rush. The more honest you are here, the more precise we can be together.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
