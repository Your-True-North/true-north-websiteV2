'use client';

import { useState, useEffect } from 'react';

interface Session {
  title: string;
  date: string;
  time?: string;
  description?: string;
  isoDate?: string;
}

export default function CircleCalendarTeaser() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/calendar/events')
      .then(res => res.json())
      .then(data => {
        if (data.events) {
          const formatted = data.events.map((e: any) => {
            const eventDate = new Date(e.date);
            return {
              title: e.title,
              date: eventDate.toLocaleDateString('en-GB', { weekday: 'long', month: 'short', day: 'numeric' }),
              time: eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }),
              description: e.description,
              isoDate: e.date
            };
          });
          setSessions(formatted);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load sessions:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '0 1.5rem', marginBottom: '3rem' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '3px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem', fontWeight: 300 }}>Loading sessions...</div>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '0 1.5rem', marginBottom: '3rem' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '3px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem', fontWeight: 300 }}>No upcoming sessions</div>
        </div>
      </div>
    );
  }

  const nextSession = sessions[0];
  const upcomingSessions = sessions.slice(1, 4);

  return (
    <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '0 1.5rem', marginBottom: '3rem' }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '3px',
        padding: '2rem'
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
          {nextSession.title}
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
            {nextSession.date}
          </div>
          <div style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.95rem',
            fontWeight: 300
          }}>
            {nextSession.time}
          </div>
        </div>
        
        {nextSession.description && (
          <p style={{
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.9rem',
            lineHeight: '1.6',
            marginBottom: '1.5rem',
            fontWeight: 300
          }}>
            {nextSession.description}
          </p>
        )}
        
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

      {upcomingSessions.length > 0 && (
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
            {upcomingSessions.map((session, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: index < upcomingSessions.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
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
      )}
    </div>
  );
}
