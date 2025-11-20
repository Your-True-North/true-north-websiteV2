'use client'

import Link from 'next/link'

export default function MembersFooter() {
  return (
    <footer style={{
      background: '#0a0a0b',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      padding: '3rem 1.5rem 2rem',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '80rem',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem'
        }}>
          {/* Brand Section */}
          <div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 300,
              letterSpacing: '0.2em',
              marginBottom: '1rem',
              color: 'rgba(255, 255, 255, 0.9)'
            }}>
              TRUE NORTH
            </div>
            <p style={{
              fontSize: '0.875rem',
              fontWeight: 300,
              color: 'rgba(255, 255, 255, 0.5)',
              lineHeight: 1.6,
              margin: 0
            }}>
              Spiritual transformation and masculine embodiment for men ready to do the real work.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 300,
              letterSpacing: '0.1em',
              marginBottom: '1rem',
              color: 'rgba(255, 255, 255, 0.4)'
            }}>
              QUICK LINKS
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {[
                { label: 'Home', href: '/' },
                { label: 'The Path', href: '/journey' },
                { label: 'Work', href: '/work' },
                { label: 'Circle', href: '/circle' },
                { label: 'Library', href: '/library' },
                { label: 'Contact', href: '/contact' }
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 300,
                    color: 'rgba(255, 255, 255, 0.5)',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Connect Section */}
          <div>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 300,
              letterSpacing: '0.1em',
              marginBottom: '1rem',
              color: 'rgba(255, 255, 255, 0.4)'
            }}>
              CONNECT
            </div>
            <a
              href="https://wa.me/447449052909"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 300,
                color: 'rgba(255, 255, 255, 0.5)',
                textDecoration: 'none',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
            >
              <svg style={{ width: '1rem', height: '1rem' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '0.75rem',
            fontWeight: 300,
            color: 'rgba(255, 255, 255, 0.3)',
            margin: 0
          }}>
            © 2024 True North. Where you are now does not have to be where you end up.
          </p>
        </div>
      </div>
    </footer>
  )
}
