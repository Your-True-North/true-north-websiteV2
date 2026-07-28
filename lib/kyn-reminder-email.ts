// KYN 48 hour reminder email. Built from that week's own title and description,
// which are already written in the KYN voice, wrapped in the fixed structure below.
// Do not rewrite the title or description text. See lib/data/kyn-session-loop.ts.

import { DateTime } from 'luxon'
import { buildGoogleCalendarUrl, buildIcs, KynCalendarSession } from './kyn-calendar-links'

const JOIN_URL = 'https://us02web.zoom.us/j/87536119646?pwd=VrNnKw3q9lqrgcf9lI6pBEg23f5ARG.1'
const MEETING_ID = '875 3611 9646'
const PASSCODE = '2121'
const DURATION_MINUTES = 60

// Deterministic per session, so the same session always closes the same way.
const CLOSING_LINES = [
  "Come as you are. I'll see you there my friend.",
  "No pressure either way. The door's open if you want it.",
  "Bring whatever's underneath with you. I'll see you there.",
  "That's the invite, laid out plain. What you do with it is yours.",
  "No one does the pushups for you. Show up and do yours.",
  'Where you are now does not have to be where you end up. I\'ll see you there.',
]

export interface KynReminderSessionInput {
  id: number | string
  loopIndex: number
  title: string
  description: string
  scheduledAtUtc: Date
}

export interface KynReminderEmail {
  subject: string
  html: string
  text: string
  icsFilename: string
  icsContent: string
}

function buildSession(input: KynReminderSessionInput, description: string): KynCalendarSession {
  return {
    uid: `kyn-session-${input.id}@yourtruenorth.me`,
    title: input.title,
    description,
    joinUrl: JOIN_URL,
    meetingId: MEETING_ID,
    passcode: PASSCODE,
    startUtc: input.scheduledAtUtc,
    durationMinutes: DURATION_MINUTES,
  }
}

function lowerFirst(s: string): string {
  return s.length ? s[0].toLowerCase() + s.slice(1) : s
}

// The stored session description is locked exact text and must never be edited.
// This only reshapes how it reads inside the reminder email, which has its own
// hard rule against three word sentences. No words are added, removed or changed,
// only the punctuation at a sentence boundary.
function avoidThreeWordFullStopSentences(text: string): string {
  const sentences = text.split(/(?<=[.?!])\s+/)
  const result: string[] = []

  for (const raw of sentences) {
    const sentence = raw.trim()
    if (!sentence) continue

    const wordCount = sentence.replace(/\.+$/, '').split(/\s+/).filter(Boolean).length
    const isThreeWordFullStop = sentence.endsWith('.') && !sentence.endsWith('...') && wordCount === 3
    const previous = result[result.length - 1]

    if (isThreeWordFullStop && previous && previous.endsWith('.')) {
      result[result.length - 1] = `${previous.slice(0, -1)}, ${lowerFirst(sentence)}`
    } else {
      result.push(sentence)
    }
  }

  return result.join(' ')
}

export function buildKynReminderEmail(input: KynReminderSessionInput): KynReminderEmail {
  const london = DateTime.fromJSDate(input.scheduledAtUtc, { zone: 'utc' }).setZone('Europe/London')
  const weekday = london.toFormat('cccc')
  const zoneLabel = london.offsetNameShort // BST or GMT
  const startLondonLocal = london.toFormat("yyyyLLdd'T'HHmmss")

  const emailDescription = avoidThreeWordFullStopSentences(input.description)
  const session = buildSession(input, emailDescription)
  const googleUrl = buildGoogleCalendarUrl(session)
  const icsContent = buildIcs(session, startLondonLocal)
  const icsBase64 = Buffer.from(icsContent, 'utf8').toString('base64')
  const appleDataUrl = `data:text/calendar;charset=utf8;base64,${icsBase64}`

  const closingLine = CLOSING_LINES[input.loopIndex % CLOSING_LINES.length]

  const detailsLine = `${weekday} at 8am ${zoneLabel}. Join here: ${JOIN_URL}`
  const meetingLine = `Meeting ID ${MEETING_ID}. Passcode ${PASSCODE}.`

  const text = [
    emailDescription,
    '',
    detailsLine,
    meetingLine,
    '',
    closingLine,
  ].join('\n')

  const html = `
<div style="font-family: Georgia, 'Times New Roman', serif; font-size: 16px; line-height: 1.6; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 24px 20px;">
  <p style="margin: 0 0 20px;">${escapeHtml(emailDescription)}</p>
  <p style="margin: 0 0 4px;"><strong>${escapeHtml(detailsLine)}</strong></p>
  <p style="margin: 0 0 20px; color: #555;">${escapeHtml(meetingLine)}</p>
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
    <tr>
      <td style="padding-right: 10px;">
        <a href="${googleUrl}" style="display: inline-block; padding: 10px 18px; background: #2f5233; color: #ffffff; text-decoration: none; border-radius: 4px; font-family: Arial, sans-serif; font-size: 14px;">Add to Google Calendar</a>
      </td>
      <td>
        <a href="${appleDataUrl}" download="kyn-session.ics" style="display: inline-block; padding: 10px 18px; background: #2f5233; color: #ffffff; text-decoration: none; border-radius: 4px; font-family: Arial, sans-serif; font-size: 14px;">Add to Apple Calendar</a>
      </td>
    </tr>
  </table>
  <p style="margin: 0;">${escapeHtml(closingLine)}</p>
</div>
`.trim()

  return {
    subject: input.title,
    html,
    text,
    icsFilename: `kyn-session-${input.id}.ics`,
    icsContent,
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
