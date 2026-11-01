import { createHmac, timingSafeEqual } from 'node:crypto'

// A short-lived signed token handed back after a successful signup, so the
// follow-up answers can only be saved for an email that has just signed up
// in this browser. Signed with the Kit key, which never leaves the server.
const TTL_MS = 2 * 60 * 60 * 1000

function sign(email: string, expires: number) {
  return createHmac('sha256', process.env.KIT_API_KEY || '').update(`${email}|${expires}`).digest('base64url')
}

export function issueToken(email: string) {
  const expires = Date.now() + TTL_MS
  return `${expires}.${sign(email, expires)}`
}

export function checkToken(email: string, token: unknown) {
  if (!process.env.KIT_API_KEY || typeof token !== 'string') return false
  const [expiresText, signature] = token.split('.')
  const expires = Number(expiresText)
  if (!signature || !Number.isFinite(expires) || expires < Date.now()) return false
  const expected = Buffer.from(sign(email, expires))
  const given = Buffer.from(signature)
  return expected.length === given.length && timingSafeEqual(expected, given)
}
