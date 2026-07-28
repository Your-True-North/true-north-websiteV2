// Add to Calendar helpers for KYN live sessions.
// One fixed recurring Zoom room for every call, so these just need the session
// title, description and the UTC instant of the call.

export interface KynCalendarSession {
  uid: string
  title: string
  description: string
  joinUrl: string
  meetingId: string
  passcode: string
  startUtc: Date
  durationMinutes: number
}

function pad(n: number, len = 2): string {
  return String(n).padStart(len, '0')
}

function toGoogleUtcStamp(date: Date): string {
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  )
}

function joinLine(session: KynCalendarSession): string {
  return `Join on Zoom: ${session.joinUrl}\nMeeting ID: ${session.meetingId}\nPasscode: ${session.passcode}`
}

export function buildGoogleCalendarUrl(session: KynCalendarSession): string {
  const start = toGoogleUtcStamp(session.startUtc)
  const end = toGoogleUtcStamp(new Date(session.startUtc.getTime() + session.durationMinutes * 60000))
  const details = `${session.description}\n\n${joinLine(session)}`

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: session.title,
    dates: `${start}/${end}`,
    details,
    location: session.joinUrl,
    ctz: 'Europe/London',
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

// Europe/London BST/GMT transition rules. Static, does not need updating.
const LONDON_VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  'TZID:Europe/London',
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:+0000',
  'TZOFFSETTO:+0100',
  'TZNAME:BST',
  'DTSTART:19700329T010000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0000',
  'TZNAME:GMT',
  'DTSTART:19701025T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
].join('\r\n')

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

// Fold lines longer than 75 octets per RFC 5545, continuation lines start with a space.
function foldIcsLine(line: string): string {
  const limit = 75
  if (line.length <= limit) return line
  let result = line.slice(0, limit)
  let rest = line.slice(limit)
  while (rest.length > 0) {
    result += '\r\n ' + rest.slice(0, limit - 1)
    rest = rest.slice(limit - 1)
  }
  return result
}

// Given a local London wall clock time (already resolved by the caller with Luxon),
// formatted as YYYYMMDDTHHMMSS with no offset, so Apple/Outlook apply the VTIMEZONE rules.
export function buildIcs(session: KynCalendarSession, startLondonLocal: string): string {
  const endLondonLocal = formatLondonLocalFromUtcOffset(startLondonLocal, session.durationMinutes)

  const description = escapeIcsText(`${session.description}\n\n${joinLine(session)}`)
  const summary = escapeIcsText(session.title)
  const now = toGoogleUtcStamp(new Date())

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Know Your North//KYN Live Sessions//EN',
    'CALSCALE:GREGORIAN',
    LONDON_VTIMEZONE,
    'BEGIN:VEVENT',
    `UID:${session.uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;TZID=Europe/London:${startLondonLocal}`,
    `DTEND;TZID=Europe/London:${endLondonLocal}`,
    foldIcsLine(`SUMMARY:${summary}`),
    foldIcsLine(`DESCRIPTION:${description}`),
    `URL:${session.joinUrl}`,
    `LOCATION:${escapeIcsText(session.joinUrl)}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'TRIGGER:-PT30M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  return lines.join('\r\n')
}

// startLondonLocal is 'YYYYMMDDTHHMMSS'. Adds durationMinutes and returns the same format.
function formatLondonLocalFromUtcOffset(startLondonLocal: string, durationMinutes: number): string {
  const year = Number(startLondonLocal.slice(0, 4))
  const month = Number(startLondonLocal.slice(4, 6))
  const day = Number(startLondonLocal.slice(6, 8))
  const hour = Number(startLondonLocal.slice(9, 11))
  const minute = Number(startLondonLocal.slice(11, 13))
  const second = Number(startLondonLocal.slice(13, 15))

  const asUtc = new Date(Date.UTC(year, month - 1, day, hour, minute, second))
  asUtc.setUTCMinutes(asUtc.getUTCMinutes() + durationMinutes)

  return (
    asUtc.getUTCFullYear() +
    pad(asUtc.getUTCMonth() + 1) +
    pad(asUtc.getUTCDate()) +
    'T' +
    pad(asUtc.getUTCHours()) +
    pad(asUtc.getUTCMinutes()) +
    pad(asUtc.getUTCSeconds())
  )
}
