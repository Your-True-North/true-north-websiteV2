'use client';

import { useState, useEffect } from 'react';

interface Session {
  title: string;
  date: string;
  time: string;
  description?: string;
}

export default function NextSessionCard() {
  const [showCalendarOptions, setShowCalendarOptions] = useState(false);
  const [showUpcomingOptions, setShowUpcomingOptions] = useState<number | null>(null);
  const [countdown, setCountdown] = useState('');

  const nextSession: Session = {
    title: "Sacred Masculinity Deep Dive",
    date: "Wednesday, Nov 20",
    time: "7:00 PM GMT",
    description: "Monthly gathering for men returning to their truth"
  };

  const upcomingSessions: Session[] = [
    { title: "Breathwork Journey", date: "Nov 27", time: "7:00 PM GMT" },
    { title: "Integration Circle", date: "Dec 4", time: "7:00 PM GMT" },
    { title: "Q&A with True North", date: "Dec 11", time: "7:00 PM GMT" }
  ];

  useEffect(() => {
    const targetDate = new Date('2024-11-20T19:00:00Z');
    
    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setCountdown(`${days} days, ${hours} hours`);
      } else {
        setCountdown('Session starting soon!');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, []);

  const generateICS = (session: Session) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//True North//Circle of Return//EN
BEGIN:VEVENT
DTSTART:20241120T190000Z
DTEND:20241120T210000Z
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

  const handleAddToCalendar = (provider: string, session: Session) => {
    const title = encodeURIComponent(session.title);
    const description = encodeURIComponent(session.description || 'Circle of Return Session');
    const startDate = '20241120T190000Z';
    const endDate = '20241120T210000Z';

    switch(provider) {
      case 'google':
        window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${description}&dates=${startDate}/${endDate}`, '_blank');
        break;
      case 'apple':
      case 'ical':
        generateICS(session);
        break;
      case 'outlook':
        window.open(`https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${description}&startdt=${startDate}&enddt=${endDate}`, '_blank');
        break;
    }
    
    setShowCalendarOptions(false);
    setShowUpcomingOptions(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-md p-8 shadow-2xl">
        <div className="text-sm text-gray-400 uppercase tracking-wider mb-4">
          Next Circle Session
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">
          {nextSession.title}
        </h2>
        
        <div className="flex items-center gap-2 text-xl text-gray-300 mb-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {nextSession.date} • {nextSession.time}
        </div>
        
        {nextSession.description && (
          <p className="text-gray-400 mb-6">
            {nextSession.description}
          </p>
        )}
        
        <div className="bg-black/40 border border-gray-700 rounded-md px-4 py-3 mb-6 inline-block">
          <div className="text-sm text-gray-400">Starting in</div>
          <div className="text-2xl font-bold text-white">{countdown}</div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowCalendarOptions(!showCalendarOptions)}
            className="w-full bg-white text-black font-semibold py-4 px-6 rounded-md hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add to Calendar
          </button>
          
          {showCalendarOptions && (
            <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-md shadow-xl z-10 overflow-hidden">
              <button
                onClick={() => handleAddToCalendar('google', nextSession)}
                className="w-full text-left px-4 py-3 text-white hover:bg-gray-800 transition-colors flex items-center gap-3"
              >
                <span className="text-xl">📅</span>
                Google Calendar
              </button>
              <button
                onClick={() => handleAddToCalendar('apple', nextSession)}
                className="w-full text-left px-4 py-3 text-white hover:bg-gray-800 transition-colors flex items-center gap-3"
              >
                <span className="text-xl">🍎</span>
                Apple Calendar
              </button>
              <button
                onClick={() => handleAddToCalendar('outlook', nextSession)}
                className="w-full text-left px-4 py-3 text-white hover:bg-gray-800 transition-colors flex items-center gap-3"
              >
                <span className="text-xl">📧</span>
                Outlook
              </button>
              <button
                onClick={() => handleAddToCalendar('ical', nextSession)}
                className="w-full text-left px-4 py-3 text-white hover:bg-gray-800 transition-colors flex items-center gap-3"
              >
                <span className="text-xl">📥</span>
                Download .ics
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-800 rounded-md p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Upcoming Sessions</h3>
        <div className="space-y-3">
          {upcomingSessions.map((session, index) => (
            <div 
              key={index}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-700 last:border-0 gap-2"
            >
              <div>
                <div className="text-white font-medium">{session.title}</div>
                <div className="text-sm text-gray-400">{session.date} • {session.time}</div>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowUpcomingOptions(showUpcomingOptions === index ? null : index)}
                  className="text-gray-400 hover:text-white transition-colors text-sm whitespace-nowrap"
                >
                  Add →
                </button>
                
                {showUpcomingOptions === index && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-xl z-10 overflow-hidden">
                    <button
                      onClick={() => handleAddToCalendar('google', session)}
                      className="w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm"
                    >
                      <span>📅</span>
                      Google
                    </button>
                    <button
                      onClick={() => handleAddToCalendar('apple', session)}
                      className="w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm"
                    >
                      <span>🍎</span>
                      Apple
                    </button>
                    <button
                      onClick={() => handleAddToCalendar('outlook', session)}
                      className="w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm"
                    >
                      <span>📧</span>
                      Outlook
                    </button>
                    <button
                      onClick={() => handleAddToCalendar('ical', session)}
                      className="w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm"
                    >
                      <span>📥</span>
                      .ics
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
