'use client';

export default function CircleCalendarTeaser() {
  return (
    <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '0 1.5rem', marginBottom: '3rem' }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '3px',
        padding: '2rem',
        position: 'relative'
      }}>
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
            3d 5h
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
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '3px',
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: '0.9rem',
          fontWeight: 300,
          display: 'inline-block',
          cursor: 'not-allowed'
        }}>
          Add to Calendar (Members Only)
        </div>
      </div>

      <div style={{
        marginTop: '1.5rem',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '3px',
        padding: '1.5rem'
      }}>
        <div style={{
          fontSize: '0.85rem',
          color: 'rgba(255, 255, 255, 0.6)',
          marginBottom: '1rem',
          fontWeight: 300
        }}>
          Upcoming Sessions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { title: 'Breathwork Journey', date: 'Nov 27', time: '7:00 PM GMT' },
            { title: 'Integration Circle', date: 'Dec 4', time: '7:00 PM GMT' },
            { title: 'Q&A with True North', date: 'Dec 11', time: '7:00 PM GMT' }
          ].map((session, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 0',
                borderBottom: index < 2 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
              }}
            >
              <div>
                <div style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 300, marginBottom: '0.25rem' }}>
                  {session.title}
                </div>
                <div style={{ color: '#ff6b35', fontSize: '0.8rem', fontWeight: 400 }}>
                  {session.date} • {session.time}
                </div>
              </div>
              <div style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '3px',
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '0.8rem',
                fontWeight: 300,
                cursor: 'not-allowed'
              }}>
                Locked
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
