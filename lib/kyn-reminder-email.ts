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
    input.title,
    '',
    emailDescription,
    '',
    detailsLine,
    meetingLine,
    '',
    closingLine,
  ].join('\n')

  const html = `
<div style="font-family: Georgia, 'Times New Roman', serif; font-size: 16px; line-height: 1.6; color: #141410; max-width: 560px; margin: 0 auto; padding: 28px 22px;">
  <p style="margin: 0 0 8px; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #2d6a4f;">Next session</p>
  <h2 style="font-size: 21px; font-weight: 700; margin: 0 0 16px; color: #141410;">${escapeHtml(input.title)}</h2>
  <p style="margin: 0 0 22px;">${escapeHtml(emailDescription)}</p>
  <div style="background: #e8f4ee; border-radius: 8px; padding: 14px 16px; margin: 0 0 24px;">
    <p style="margin: 0 0 6px; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600; color: #141410;">${escapeHtml(weekday)} at 8am ${escapeHtml(zoneLabel)}</p>
    <p style="margin: 0 0 6px;"><a href="${JOIN_URL}" style="font-family: Arial, sans-serif; font-size: 13px; color: #2d6a4f; text-decoration: none; font-weight: 600;">Join on Zoom</a></p>
    <p style="margin: 0; font-family: Arial, sans-serif; font-size: 11.5px; color: #52524a;">${escapeHtml(meetingLine)}</p>
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
    <tr>
      <td style="padding-right: 10px;">
        <a href="${googleUrl}" style="display: inline-block; padding: 10px 18px; background: #2d6a4f; color: #ffffff; text-decoration: none; border-radius: 5px; font-family: Arial, sans-serif; font-size: 13px; font-weight: 600;">Add to Google Calendar</a>
      </td>
      <td>
        <a href="${appleDataUrl}" download="kyn-session.ics" style="display: inline-block; padding: 10px 18px; background: #2d6a4f; color: #ffffff; text-decoration: none; border-radius: 5px; font-family: Arial, sans-serif; font-size: 13px; font-weight: 600;">Add to Apple Calendar</a>
      </td>
    </tr>
  </table>
  <p style="margin: 0; padding-top: 16px; border-top: 1px solid #e2e2de;">${escapeHtml(closingLine)}</p>
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
