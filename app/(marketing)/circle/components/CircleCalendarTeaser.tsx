'use client';

import Link from 'next/link';

export default function CircleCalendarTeaser() {
  return (
    <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '0 1.5rem', marginBottom: '3rem' }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '3px',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Blur overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backdropFilter: 'blur(4px)',
          background: 'rgba(10, 10, 11, 0.6)',
          zIndex: 1
        }} />
        
        {/* Blurred content */}
        <div style={{ position: 'relative', filter: 'blur(3px)', pointerEvents: 'none' }}>
          <div style={{
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '1rem',
            fontWeight: 300
          }}>
            Next Session
          </div>
          
          <h3 style={{
            fontSize: '1.5rem',
            color: '#ffffff',
            fontWeight: 300,
            marginBottom: '1rem',
            letterSpacing: '-0.01em'
          }}>
            Sacred Masculinity Deep Dive
          </h3>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{
              color: '#ff6b35',
              fontSize: '0.95rem',
              fontWeight: 400
            }}>
              Wednesday, Nov 20
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.95rem',
              fontWeight: 300
            }}>
              7:00 PM GMT
            </div>
            <div style={{
              background: 'rgba(255, 107, 53, 0.1)',
              border: '1px solid rgba(255, 107, 53, 0.2)',
              borderRadius: '3px',
              padding: '0.25rem 0.75rem',
              fontSize: '0.8rem',
              color: '#ff6b35',
              fontWeight: 400
            }}>
              5d 12h
            </div>
          </div>
          
          <p style={{
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.9rem',
            lineHeight: '1.6',
            marginBottom: '1.5rem',
            fontWeight: 300
          }}>
            Monthly gathering for men returning to their truth
          </p>
          
          <div style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
            color: '#ffffff',
            fontSize: '0.9rem',
            fontWeight: 300,
            display: 'inline-block'
          }}>
            Add to Calendar
          </div>
        </div>

        {/* Overlay content */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '1.25rem',
            color: '#ffffff',
            fontWeight: 300,
            marginBottom: '1rem',
            letterSpacing: '-0.01em'
          }}>
            Members Only
          </div>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            maxWidth: '400px',
            fontWeight: 300,
            lineHeight: '1.5'
          }}>
            Access the full Circle calendar and add sessions directly to your calendar
          </p>
          <Link
            href="/auth/register"
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#000',
              border: 'none',
              borderRadius: '3px',
              fontSize: '0.9rem',
              fontWeight: 400,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              display: 'inline-block'
            }}
          >
            Join Circle →
          </Link>
        </div>
      </div>
    </div>
  );
}
