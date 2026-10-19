'use client';

import { useState, useEffect } from 'react';

interface Session {
  title: string;
  date: string;
  time?: string;
  description?: string;
  isoDate: string;
  durationMinutes: number;
}

const TEXT = '#ECE6DA';
const TEXT_2 = 'rgba(236,230,218,0.8)';
const SAGE = '#9BC4B8';
const LINE = 'rgba(236,230,218,0.08)';

const cardStyle: React.CSSProperties = {
  background: '#1B1E1B',
  border: `1px solid ${LINE}`,
  borderRadius: '16px',
  padding: '20px',
  position: 'relative',
};

const secondaryButton: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: '44px',
  padding: '0 16px',
  background: 'transparent',
  border: '1px solid rgba(236,230,218,0.16)',
  borderRadius: '12px',
  color: TEXT,
  fontSize: '15px',
  fontWeight: 500,
  cursor: 'pointer',
};

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export default function NextSessionCard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendarOptions, setShowCalendarOptions] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    fetch('/api/calendar/events')
      .then(res => res.json())
      .then(data => {
        if (data.events) {
          // No timeZone option, so dates and times show in the member's own time zone
          const formatted = data.events.map((e: any) => {
            const eventDate = new Date(e.date);
            return {
              title: e.title,
              date: eventDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }),
              time: eventDate.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }),
              description: e.description,
              isoDate: e.date,
              durationMinutes: e.duration_minutes || 60
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
    const endDate = new Date(eventDate.getTime() + session.durationMinutes * 60 * 1000);

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
    const endDate = new Date(eventDate.getTime() + session.durationMinutes * 60 * 1000);

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
      <div style={cardStyle}>
        <div style={{ color: TEXT_2, fontSize: '15px' }}>Loading the next session...</div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div style={cardStyle}>
        <div style={{ color: TEXT_2, fontSize: '15px' }}>No upcoming sessions</div>
      </div>
    );
  }

  const nextSession = sessions[0];
  const description = stripHtml(nextSession.description || '');

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: '15px', color: SAGE, marginBottom: '8px' }}>
        Next session
      </div>

      <h2 style={{ fontSize: '26px', lineHeight: 1.2, color: TEXT, margin: '0 0 8px' }}>
        {nextSession.title}
      </h2>

      <div style={{ fontSize: '16px', color: TEXT_2, marginBottom: '16px' }}>
        {nextSession.date} at {nextSession.time}
      </div>

      {/* What happens in this session: one level only */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        aria-expanded={showDetails}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
          minHeight: '44px', padding: 0, background: 'none', border: 'none',
          borderTop: `1px solid ${LINE}`, color: TEXT, fontSize: '15px', cursor: 'pointer', textAlign: 'left',
        }}
      >
        What happens in this session
        <span aria-hidden="true" style={{ color: TEXT_2, transform: showDetails ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>⌄</span>
      </button>

      {showDetails && (
        <div style={{ fontSize: '16px', lineHeight: 1.55, color: TEXT_2, padding: '4px 0 12px' }}>
          {description && <p style={{ margin: '0 0 12px', color: TEXT }}>{description}</p>}
          <p style={{ margin: '0 0 6px' }}>Have ready: somewhere quiet, headphones, and space to lie down.</p>
          <p style={{ margin: '0 0 6px' }}>{nextSession.durationMinutes} minutes.</p>
          <p style={{ margin: 0 }}>Camera on or off, your call.</p>
        </div>
      )}

      {/* The attendance button arrives in step 5 */}
      <div style={{ position: 'relative', marginTop: '12px' }}>
        <button onClick={() => setShowCalendarOptions(!showCalendarOptions)} style={secondaryButton}>
          Add to calendar
        </button>

        {showCalendarOptions && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, marginTop: '8px', zIndex: 10, minWidth: '200px',
            background: '#1B1E1B', border: `1px solid ${LINE}`, borderRadius: '12px', overflow: 'hidden',
            boxShadow: '0 12px 32px rgba(0,0,0,0.4)'
          }}>
            {['google', 'apple', 'outlook', 'ical'].map((provider) => (
              <button
                key={provider}
                onClick={() => handleAddToCalendar(provider, nextSession)}
                style={{
                  width: '100%', minHeight: '44px', padding: '0 16px', background: 'transparent',
                  border: 'none', borderBottom: `1px solid ${LINE}`, color: TEXT,
                  fontSize: '15px', cursor: 'pointer', textAlign: 'left',
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
