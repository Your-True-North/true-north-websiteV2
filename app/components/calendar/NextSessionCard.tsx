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
  };

  if (loading) {
    return (
      <div style={{ padding: '16px 20px', textAlign: 'center' }}>
        <div style={{ color: '#9bc4b8', fontSize: '12px' }}>Loading sessions...</div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div style={{ padding: '16px 20px', textAlign: 'center' }}>
        <div style={{ color: '#9bc4b8', fontSize: '12px' }}>No upcoming sessions</div>
      </div>
    );
  }

  const nextSession = sessions[0];

  return (
    <div style={{ padding: '16px 20px 18px', position: 'relative' }}>
      <div style={{
        fontSize: '11px',
        color: '#9bc4b8',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: '6px',
        fontWeight: 700
      }}>
        Next Session
      </div>

      <h3 style={{
        fontSize: '15px',
        color: '#f0ede8',
        fontWeight: 500,
        marginBottom: '8px',
        letterSpacing: '-0.01em',
        lineHeight: 1.3
      }}>
        {nextSession.title}
      </h3>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          color: '#9bc4b8',
          fontSize: '12px',
          fontWeight: 500
        }}>
          {nextSession.date}
        </div>
        <div style={{
          color: '#a0a09c',
          fontSize: '12px',
          fontWeight: 400
        }}>
          {nextSession.time}
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowCalendarOptions(!showCalendarOptions)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 13px',
            background: 'rgba(82,183,136,0.14)',
            border: '1px solid rgba(82,183,136,0.28)',
            borderRadius: '4px',
            color: '#9bc4b8',
            fontSize: '14px',
            fontWeight: 500,
            minHeight: '44px',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(82,183,136,0.22)';
            e.currentTarget.style.color = '#f0ede8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(82,183,136,0.14)';
            e.currentTarget.style.color = '#9bc4b8';
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
            background: '#1a1a18',
            border: '1px solid #2c2c2a',
            borderRadius: '6px',
            overflow: 'hidden',
            zIndex: 10,
            minWidth: '180px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
          }}>
            {['google', 'apple', 'outlook', 'ical'].map((provider) => (
              <button
                key={provider}
                onClick={() => handleAddToCalendar(provider, nextSession)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #2c2c2a',
                  color: '#a0a09c',
                  fontSize: '0.82rem',
                  fontWeight: 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1e1e1c';
                  e.currentTarget.style.color = '#f0ede8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#a0a09c';
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
  );
}
