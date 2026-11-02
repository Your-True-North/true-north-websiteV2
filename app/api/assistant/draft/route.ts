import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { ImapFlow } from 'imapflow'
import MailComposer from 'nodemailer/lib/mail-composer'

// POST /api/assistant/draft
// Called by True's email Zap. Two jobs, both optional per call:
//   1. Save a reply as a DRAFT in navigate@'s Drafts folder, threaded under the
//      original, so it shows up in Apple Mail for True to edit and send.
//   2. Flag the original email (red flag in Apple Mail) when it needs True.
// Nothing is ever sent from here.
//
// Needs (Vercel, Sensitive): IMAP_PASSWORD, ASSISTANT_SECRET.
// Zapier sends the secret in the "x-assistant-secret" header.

export const runtime = 'nodejs'

const MAILBOX = 'navigate@yourtruenorth.me'
const FROM_NAME = 'True North'
const IMAP_HOST = 'mail.livemail.co.uk'
const IMAP_PORT = 993

function authorised(request: NextRequest) {
  const expected = process.env.ASSISTANT_SECRET || ''
  const given = request.headers.get('x-assistant-secret') || ''
  if (!expected || given.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected))
}

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

// Message-IDs arrive with or without angle brackets; IMAP search and headers want them with.
function bracketed(id: string) {
  if (!id) return ''
  return id.startsWith('<') ? id : `<${id}>`
}

async function findDrafts(client: ImapFlow) {
  const boxes = await client.list()
  const special = boxes.find(b => b.specialUse === '\\Drafts')
  if (special) return special.path
  const named = boxes.find(b => /(^|[./])drafts$/i.test(b.path))
  return named ? named.path : 'Drafts'
}

const bare = (id: string) => id.replace(/^<|>$/g, '').trim().toLowerCase()

// Find the original email in INBOX. Some servers don't support searching by
// Message-ID header, so try that first (with and without brackets), then fall
// back to sender + subject over the last 30 days and match the Message-ID exactly.
async function findOriginal(client: ImapFlow, messageId: string, from: string, subject: string, debug: Record<string, unknown>): Promise<number | null> {
  const target = bare(messageId)
  debug.target = target
  const tries: Record<string, unknown>[] = []
  for (const value of [messageId, target]) {
    try {
      const uids = await client.search({ header: { 'message-id': value } }, { uid: true })
      tries.push({ header: value.slice(0, 12), hits: uids ? uids.length : 0 })
      if (uids && uids.length) { debug.tries = tries; return uids[uids.length - 1] }
    } catch (e) {
      tries.push({ header: value.slice(0, 12), error: String(e).slice(0, 80) })
    }
  }
  // Fallback: newest emails from the same sender (no date limit), match the Message-ID exactly.
  const queries: Record<string, unknown>[] = []
  if (from) queries.push({ from })
  if (subject) queries.push({ subject: subject.replace(/^re:\s*/i, '').slice(0, 100) })
  for (const query of queries) {
    let candidates: number[] = []
    try {
      candidates = (await client.search(query, { uid: true })) || []
    } catch (e) {
      tries.push({ by: Object.keys(query)[0], error: String(e).slice(0, 80) })
      continue
    }
    tries.push({ by: Object.keys(query)[0], hits: candidates.length })
    for (const uid of candidates.slice(-50).reverse()) {
      const msg = await client.fetchOne(String(uid), { envelope: true }, { uid: true })
      if (msg && msg.envelope?.messageId && bare(msg.envelope.messageId) === target) { debug.tries = tries; return uid }
    }
  }
  debug.tries = tries
  return null
}

export async function POST(request: NextRequest) {
  if (!authorised(request)) return NextResponse.json({ ok: false, error: 'Unauthorised' }, { status: 401 })
  if (!process.env.IMAP_PASSWORD) return NextResponse.json({ ok: false, error: 'IMAP_PASSWORD is not set' }, { status: 500 })

  let data: Record<string, unknown>
  try {
    data = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Body must be JSON' }, { status: 400 })
  }

  const to = clean(data.to, 320)
  const subject = clean(data.subject, 300)
  const body = clean(data.body, 20000)
  const originalId = bracketed(clean(data.messageId, 500))
  const references = clean(data.references, 4000)
  const flag = data.flag === true || data.flag === 'true'

  if (!body && !flag) return NextResponse.json({ ok: false, error: 'Nothing to do: send a body, flag, or both' }, { status: 400 })
  if (body && !to) return NextResponse.json({ ok: false, error: 'A draft needs "to"' }, { status: 400 })

  const client = new ImapFlow({
    host: IMAP_HOST,
    port: IMAP_PORT,
    secure: true,
    auth: { user: MAILBOX, pass: process.env.IMAP_PASSWORD },
    logger: false,
  })

  const result: { drafted: boolean; flagged: boolean; draftsFolder?: string; flagCheck?: Record<string, unknown> } = { drafted: false, flagged: false }

  try {
    await client.connect()

    if (body) {
      const replySubject = subject && !/^re:/i.test(subject) ? `Re: ${subject}` : subject || 'Re:'
      const raw = await new MailComposer({
        from: { name: FROM_NAME, address: MAILBOX },
        to,
        subject: replySubject,
        text: body,
        inReplyTo: originalId || undefined,
        references: [references, originalId].filter(Boolean).join(' ') || undefined,
      }).compile().build()

      const drafts = await findDrafts(client)
      await client.append(drafts, raw, ['\\Draft', '\\Seen'])
      result.drafted = true
      result.draftsFolder = drafts
    }

    if (!flag) {
      result.flagCheck = { skipped: 'flag was not true', received: String(data.flag ?? '(nothing)').slice(0, 40) }
    } else if (!originalId) {
      result.flagCheck = { skipped: 'no messageId received' }
    }

    if (flag && originalId) {
      const lock = await client.getMailboxLock('INBOX')
      try {
        const flagCheck: Record<string, unknown> = {}
        const uid = await findOriginal(client, originalId, to, subject, flagCheck)
        result.flagCheck = flagCheck
        if (uid) {
          await client.messageFlagsAdd([uid], ['\\Flagged'], { uid: true })
          result.flagged = true
        }
      } finally {
        lock.release()
      }
    }

    await client.logout()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('[assistant/draft] IMAP error:', error)
    try { await client.logout() } catch {}
    return NextResponse.json({ ok: false, error: 'Could not reach the mailbox', ...result }, { status: 502 })
  }
}
