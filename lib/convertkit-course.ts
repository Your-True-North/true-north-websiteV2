import { createHash } from 'crypto'
import { COURSE_DAYS } from './courses'

// ConvertKit is the source of truth for course day titles and text. Each course
// pulls from one sequence; nothing here writes to the database.
export const COURSE_SEQUENCES: Record<string, { id: number; name: string }> = {
  'short-fuse': { id: 2203286, name: '14-Day RAM Lead Gen' },
  space: { id: 2374534, name: 'Space Method Sequence' },
}

interface SequenceEmail {
  id: number
  subject: string
  content: string
  state: string
}

export interface PulledDay {
  day: number
  title: string
  body: string
  subject: string
  emailId: number
}

export interface Pull {
  days: PulledDay[]
  missing: number[]
  // Days with more than one "Day N:" email. They are left as they are.
  duplicates: { day: number; subjects: string[] }[]
}

// v3 API: CONVERTKIT_API_KEY holds the api_secret (the calendar webhook uses it the same way).
export async function fetchSequenceEmails(sequenceId: number): Promise<SequenceEmail[]> {
  const secret = process.env.CONVERTKIT_API_KEY
  if (!secret) throw new Error('ConvertKit key is not set')
  const res = await fetch(`https://api.convertkit.com/v3/sequences/${sequenceId}?api_secret=${encodeURIComponent(secret)}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`ConvertKit returned ${res.status}`)
  const data = await res.json()
  return data?.course?.email_templates || []
}

// "Day 2: Title", also "Day 14- Title"
const DAY_SUBJECT = /^\s*Day\s+(\d{1,2})\s*[:\-]\s*(.*)$/i

export function pullDays(emails: SequenceEmail[]): Pull {
  const byDay = new Map<number, SequenceEmail[]>()
  for (const email of emails) {
    if (email.state !== 'active') continue
    const match = email.subject.match(DAY_SUBJECT)
    if (!match) continue
    const day = parseInt(match[1])
    if (day < 1 || day > COURSE_DAYS) continue
    byDay.set(day, [...(byDay.get(day) || []), email])
  }

  const days: PulledDay[] = []
  const missing: number[] = []
  const duplicates: Pull['duplicates'] = []
  for (let day = 1; day <= COURSE_DAYS; day++) {
    const found = byDay.get(day) || []
    if (found.length === 0) { missing.push(day); continue }
    if (found.length > 1) { duplicates.push({ day, subjects: found.map(e => e.subject.trim()) }); continue }
    const email = found[0]
    days.push({
      day,
      title: email.subject.match(DAY_SUBJECT)![2].replace(/\s+/g, ' ').trim(),
      body: emailToSiteText(email.content),
      subject: email.subject.trim(),
      emailId: email.id,
    })
  }
  return { days, missing, duplicates }
}

function decodeEntities(text: string) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/g, '&')
}

const OLD_SITE = /masondysonroberts\.com/i
// Marks where a merge tag was, so the line can start with a capital
const MERGE_TAG = '\u0001'
const WATCH_NOW = /watch\s*now/i

// Email HTML to the site's text: one paragraph per line, "• " for bullets, **bold**.
// Removes merge tags, the WATCH NOW link, old masondysonroberts.com links, and
// the sign off with everything after it. Everything else is kept word for word.
export function emailToSiteText(html: string): string {
  let text = html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/{{[\s\S]*?}}|{%[\s\S]*?%}/g, MERGE_TAG)
    // Drop WATCH NOW and old site links, text included
    .replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (whole, attrs, inner) => {
      const innerText = inner.replace(/<[^>]+>/g, '')
      return WATCH_NOW.test(innerText) || OLD_SITE.test(attrs) || OLD_SITE.test(innerText) ? '' : whole
    })
    .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**')
    .replace(/<li\b[^>]*>/gi, '\n• ')
    .replace(/<br\s*\/?>|<\/(p|div|li|h[1-6]|tr|blockquote)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
  text = decodeEntities(text).replace(/[\u200B-\u200D\uFEFF]/g, '')

  let lines = text.split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .map(line => line.replace(/(?<=\S)\s*\u0001\s*(?=[,.!?:;])/g, '').trim())
    .map(tidyBold)
    .map(line => line.replace(/^•\s*/, '• ').replace(/^• •\s*/, '• ').replace(/\s+•$/, ''))
    .filter(line => line.replace(MERGE_TAG, '') && line !== '•' && !/^[\[\]\s]*$/.test(line) && !OLD_SITE.test(line))

  // Sign off: the "True North" signature, the short closing line just before it
  // (like "Enjoy!"), and everything after.
  const signature = lines.findIndex(line => /^True North\b/i.test(line.replace(/\*\*/g, '')))
  if (signature !== -1) {
    let cut = signature
    const before = lines[signature - 1]
    if (before && !before.startsWith('•') && before.split(' ').length <= 3) cut--
    lines = lines.slice(0, cut)
  }

  // A line that began with a merge tag ("{{ name }} time for Day 2") starts with a capital.
  lines = lines.map(line => line.startsWith(MERGE_TAG)
    ? line.replace(/^\u0001[\s,.!?:;]*/, '').replace(/^./, c => c.toUpperCase())
    : line.split(MERGE_TAG).join(''))
  return lines.join('\n')
}

// Drops empty bold, keeps spaces outside the markers, and drops markers a line break split.
function tidyBold(line: string) {
  line = line
    .replace(/\*\*(\s*)\*\*/g, '$1')
    .replace(/\*\*(\s+)/g, (m, sp, offset, all) => (all.slice(0, offset).split('**').length % 2 === 1 ? sp + '**' : m))
    .replace(/(\s+)\*\*/g, (m, sp, offset, all) => (all.slice(0, offset).split('**').length % 2 === 0 ? '**' + sp : m))
    .replace(/\s+/g, ' ')
    .trim()
  return (line.match(/\*\*/g) || []).length % 2 ? line.replace(/\*\*/g, '') : line
}

// Fingerprint of what a preview shows, so Save applies exactly that.
export function changesFingerprint(changes: { day: number; title: string; body: string }[]) {
  return createHash('sha256').update(JSON.stringify(changes.map(c => [c.day, c.title, c.body]))).digest('hex')
}
