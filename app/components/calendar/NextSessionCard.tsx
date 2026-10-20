'use client';

import { useState, useEffect } from 'react';

interface Session {
  id: number;
  title: string;
  date: string;
  time?: string;
  description?: string;
  isoDate: string;
  durationMinutes: number;
  joinUrl?: string;
}

// Colours, sizes and buttons come from the shared classes and tokens in
// app/(protected)/layout.tsx
const TEXT = 'var(--kyn-ink)';
const TEXT_2 = 'var(--kyn-ink2)';
const LINE = 'var(--kyn-border)';

const PLACES = [
  { value: 'home', label: 'Home', seeYou: 'at home' },
  { value: 'car', label: 'In the car', seeYou: 'from the car' },
  { value: 'work', label: 'At work', seeYou: 'from work' },
  { value: 'elsewhere', label: 'Elsewhere', seeYou: 'wherever you are' },
];

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

// Live shows the usual day and time once above the card, so it hides them here
export default function NextSessionCard({ showDateTime = true }: { showDateTime?: boolean }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendarOptions, setShowCalendarOptions] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [now, setNow] = useState(() => Date.now());
  // Attendance: 'loading' until his saved answer is known, then 'none', 'asking' or 'saved'
  const [rsvpState, setRsvpState] = useState<'loading' | 'none' | 'asking' | 'saved'>('loading');
  const [rsvpPlace, setRsvpPlace] = useState('');
  const [rsvpBusy, setRsvpBusy] = useState(false);
  const [rsvpError, setRsvpError] = useState('');

  useEffect(() => {
    fetch('/api/calendar/events')
      .then(res => res.json())
      .then(data => {
        if (data.events) {
          // No timeZone option, so dates and times show in the member's own time zone
          const formatted = data.events.map((e: any) => {
            const eventDate = new Date(e.date);
            return {
              id: e.id,
              title: e.title,
              date: eventDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }),
              time: eventDate.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }),
              description: e.description,
              isoDate: e.date,
              durationMinutes: e.duration_minutes || 60,
              joinUrl: e.join_url
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
    const next = sessions[0];
    if (!next) return;
    fetch(`/api/session-rsvps?live_call_id=${next.id}`)
      .then(res => (res.ok ? res.json() : { rsvp: null }))
      .then(data => {
        if (data.rsvp) {
          setRsvpPlace(data.rsvp.place);
          setRsvpState('saved');
        } else {
          setRsvpState('none');
        }
      })
      .catch(() => setRsvpState('none'));
  }, [sessions]);

  const saveRsvp = async (place: string) => {
    setRsvpBusy(true);
    setRsvpError('');
    try {
      const res = await fetch('/api/session-rsvps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          live_call_id: sessions[0].id,
          place,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      if (!res.ok) throw new Error('save failed');
      setRsvpPlace(place);
      setRsvpState('saved');
    } catch {
      setRsvpError("That didn't save. Try again.");
    } finally {
      setRsvpBusy(false);
    }
  };

  const cancelRsvp = async () => {
    setRsvpBusy(true);
    setRsvpError('');
    try {
      const res = await fetch('/api/session-rsvps', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ live_call_id: sessions[0].id }),
      });
      if (!res.ok) throw new Error('cancel failed');
      setRsvpPlace('');
      setRsvpState('none');
    } catch {
      setRsvpError("That didn't save. Try again.");
    } finally {
      setRsvpBusy(false);
    }
  };

  useEffect(() => {
    if (sessions.length === 0) return;

    const updateCountdown = () => {
      setNow(Date.now());
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
    const interval = setInterval(updateCountdown, 30000);
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
      <div className="kyn-card">
        <div className="kyn-secondary">Loading the next session...</div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="kyn-card">
        <div className="kyn-secondary">No upcoming sessions</div>
      </div>
    );
  }

  const nextSession = sessions[0];
  const description = stripHtml(nextSession.description || '');

  // Join shows from 10 minutes before the start until the session ends
  const startMs = new Date(nextSession.isoDate).getTime();
  const isJoinTime = !!nextSession.joinUrl
    && now >= startMs - 10 * 60 * 1000
    && now < startMs + nextSession.durationMinutes * 60 * 1000;
  const hasStarted = now >= startMs;
  const seeYou = PLACES.find(p => p.value === rsvpPlace)?.seeYou || 'wherever you are';

  const addToCalendar = (
    <div style={{ position: 'relative', marginTop: '24px' }}>
      <button onClick={() => setShowCalendarOptions(!showCalendarOptions)} className="kyn-btn kyn-btn-secondary">
        Add to calendar
      </button>

      {showCalendarOptions && (
        <div className="kyn-rows" style={{
          position: 'absolute', top: '100%', left: 0, marginTop: '8px', zIndex: 10, minWidth: '220px',
          background: 'var(--kyn-surface)', border: `1px solid ${LINE}`, borderRadius: 'var(--kyn-r)', overflow: 'hidden',
        }}>
          {['google', 'apple', 'outlook', 'ical'].map((provider) => (
            <button
              key={provider}
              onClick={() => handleAddToCalendar(provider, nextSession)}
              className="kyn-menu-row"
              style={{
                display: 'block', width: '100%', minHeight: '48px', padding: '0 16px', background: 'transparent',
                border: 'none', color: TEXT, fontFamily: 'inherit',
                fontSize: '16px', cursor: 'pointer', textAlign: 'left',
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
  );

  return (
    <div className="kyn-card">
      <div className="kyn-label" style={{ marginBottom: '12px' }}>
        Next session
      </div>

      <h2 className="kyn-session-title">
        {nextSession.title}
      </h2>

      {showDateTime && (
        <div style={{ fontSize: '16px', color: TEXT_2, marginTop: '12px' }}>
          {nextSession.date} at {nextSession.time}
        </div>
      )}

      {/* What happens in this session: one level only */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        aria-expanded={showDetails}
        aria-controls="session-details"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
          minHeight: '52px', padding: 0, marginTop: '24px', background: 'none', border: 'none',
          borderTop: `1px solid ${LINE}`, color: TEXT, fontSize: '16px', fontFamily: 'inherit',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        What happens in this session
        <svg className="kyn-icon kyn-chevron" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div id="session-details" className="kyn-collapse" data-open={showDetails} aria-hidden={!showDetails}>
        <div>
          <div style={{ fontSize: '16px', lineHeight: 1.55, color: TEXT_2, padding: '4px 0 8px' }}>
            {description && <p style={{ margin: '0 0 16px', color: TEXT }}>{description}</p>}
            <p style={{ margin: '0 0 8px' }}>Have ready: somewhere quiet, headphones, and space to lie down.</p>
            <p style={{ margin: '0 0 8px' }}>{nextSession.durationMinutes} minutes.</p>
            <p style={{ margin: 0 }}>Camera on or off, your call.</p>
          </div>
        </div>
      </div>

      {isJoinTime ? (
        <a href={nextSession.joinUrl} target="_blank" rel="noopener noreferrer" className="kyn-btn kyn-btn-main kyn-btn-block" style={{ marginTop: '24px' }}>
          Join on Zoom
        </a>
      ) : hasStarted ? null : (
        /* Attendance: "I'll be there" */
        <div style={{ marginTop: '24px' }}>
          {rsvpState === 'none' && (
            <button onClick={() => setRsvpState('asking')} className="kyn-btn kyn-btn-main kyn-btn-block">
              I&apos;ll be there
            </button>
          )}

          {rsvpState === 'asking' && (
            <div>
              <div style={{ fontSize: '16px', color: TEXT, marginBottom: '16px' }}>
                Where will you be when it starts?
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {PLACES.map(p => (
                  <button
                    key={p.value}
                    onClick={() => saveRsvp(p.value)}
                    disabled={rsvpBusy}
                    className="kyn-btn kyn-btn-secondary"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {rsvpState === 'saved' && (
            <div>
              <div style={{ fontSize: '16px', color: TEXT }}>
                You&apos;re in, and I&apos;ll see you {seeYou}.
              </div>
              {addToCalendar}
              <p className="kyn-secondary" style={{ margin: '16px 0 0', lineHeight: 1.5 }}>
                A reminder with the join link lands the day before and an hour before.
              </p>
              <button onClick={cancelRsvp} disabled={rsvpBusy} className="kyn-link-btn" style={{ marginTop: '8px' }}>
                Change my answer
              </button>
            </div>
          )}

          {rsvpError && (
            <div style={{ fontSize: '15px', color: TEXT, marginTop: '8px' }}>{rsvpError}</div>
          )}
        </div>
      )}
    </div>
  );
}
