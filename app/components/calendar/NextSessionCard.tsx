'use client';

import { useState, useEffect } from 'react';

interface Session {
  title: string;
  date: string;
  time?: string;
  description?: string;
  isoDate?: string;
}

export default function NextSessionCard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendarOptions, setShowCalendarOptions] = useState(false);
  const [showUpcomingOptions, setShowUpcomingOptions] = useState<number | null>(null);
  const [countdown, setCountdown] = useState('');

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

  useEffect(() => {
    if (sessions.length === 0) return;
    
    const updateCountdown = () => {
      const targetDate = new Date(sessions[0].isoDate);
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setCountdown(`${days}d ${hours}h`);
      } else {
        setCountdown('Starting soon');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [sessions]);

  const generateICS = (session: any) => {
    const eventDate = new Date(session.isoDate);
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//True North//Circle of Return//EN
BEGIN:VEVENT
DTSTART:${formatDate(eventDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${session.title}
DESCRIPTION:${session.description || 'Circle of Return Session'}
LOCATION:Online
END:VEVENT
END:VCALENDAR`;
    
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'circle-session.ics';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAddToCalendar = (provider: string, session: any) => {
    const eventDate = new Date(session.isoDate);
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const title = encodeURIComponent(session.title);
    const description = encodeURIComponent(session.description || 'Circle of Return Session');
    const startDate = formatDate(eventDate);
    const endDate2 = formatDate(endDate);

    switch(provider) {
      case 'google':
        window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${description}&dates=${startDate}/${endDate2}`, '_blank');
        break;
      case 'apple':
      case 'ical':
        generateICS(session);
        break;
      case 'outlook':
        window.open(`https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${description}&startdt=${startDate}&enddt=${endDate2}`, '_blank');
        break;
    }
    
    setShowCalendarOptions(false);
    setShowUpcomingOptions(null);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '0 1.5rem' }}>
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
      <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '0 1.5rem' }}>
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
          <div style={{
            background: 'rgba(255, 107, 53, 0.1)',
            border: '1px solid rgba(255, 107, 53, 0.2)',
            borderRadius: '3px',
            padding: '0.25rem 0.75rem',
            fontSize: '0.8rem',
            color: '#ff6b35',
            fontWeight: 400
          }}>
            {countdown}
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
        
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowCalendarOptions(!showCalendarOptions)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 300,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            Add to Calendar
          </button>
          
          {showCalendarOptions && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '0.5rem',
              background: '#0a0a0b',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
              overflow: 'hidden',
              zIndex: 10,
              minWidth: '200px'
            }}>
              {['google', 'apple', 'outlook', 'ical'].map((provider) => (
                <button
                  key={provider}
                  onClick={() => handleAddToCalendar(provider, nextSession)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.85rem',
                    fontWeight: 300,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                  }}
                >
                  {provider === 'google' ? 'Google Calendar' :
                   provider === 'apple' ? 'Apple Calendar' :
                   provider === 'outlook' ? 'Outlook' : 'Download .ics'}
                </button>
              ))}
            </div>
          )}
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
            Upcoming
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
                <button
                  onClick={() => setShowUpcomingOptions(showUpcomingOptions === index ? null : index)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '3px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.8rem',
                    fontWeight: 300,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                  }}
                >
                  Add
                  {showUpcomingOptions === index && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '0.5rem',
                      background: '#0a0a0b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      zIndex: 10,
                      minWidth: '180px'
                    }}>
                      {['google', 'apple', 'outlook', 'ical'].map((provider) => (
                        <button
                          key={provider}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCalendar(provider, session);
                          }}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '0.8rem',
                            fontWeight: 300,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                          }}
                        >
                          {provider === 'google' ? 'Google' :
                           provider === 'apple' ? 'Apple' :
                           provider === 'outlook' ? 'Outlook' : '.ics'}
                        </button>
                      ))}
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
