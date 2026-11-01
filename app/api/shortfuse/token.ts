import { createHmac, timingSafeEqual } from 'node:crypto'

// A short-lived signed token handed back after a successful signup, so the
// follow-up answers can only be saved for an email that has just signed up
// in this browser. It carries the Kit subscriber id from the signup, so the
// answers go straight to that subscriber. Signed with the Kit key, which
// never leaves the server.
const TTL_MS = 2 * 60 * 60 * 1000

function sign(email: string, id: number, expires: number) {
  return createHmac('sha256', process.env.KIT_API_KEY || '').update(`${email}|${id}|${expires}`).digest('base64url')
}

export function issueToken(email: string, id: number) {
  const expires = Date.now() + TTL_MS
  return `${expires}.${id}.${sign(email, id, expires)}`
}

// The subscriber id if the token is valid for this email, otherwise null
export function checkToken(email: string, token: unknown): number | null {
  if (!process.env.KIT_API_KEY || typeof token !== 'string') return null
  const [expiresText, idText, signature] = token.split('.')
  const expires = Number(expiresText)
  const id = Number(idText)
  if (!signature || !Number.isFinite(expires) || expires < Date.now() || !Number.isInteger(id) || id <= 0) return null
  const expected = Buffer.from(sign(email, id, expires))
  const given = Buffer.from(signature)
  return expected.length === given.length && timingSafeEqual(expected, given) ? id : null
}
