// Anger Decoder configuration.
//
// The public slug lives here so it can be changed in one place. /anger is the
// existing community page and must not be used.

export const DECODER_SLUG = 'anger-decoder'
export const DECODER_PATH = `/${DECODER_SLUG}`

/** Existing community page, linked from the foot of the result email. */
export const COMMUNITY_PATH = '/anger'

export const PROMISE = 'Understand your anger in three minutes.'
export const SUB_LINE = 'Not what it looks like. Where it comes from.'

/** Model used for the single personalisation paragraph. */
export const AI_MODEL = 'claude-sonnet-4-6'

/** Hard ceiling on the personalisation call. The email sends without it on timeout. */
export const AI_TIMEOUT_MS = 8000

export const REQUIRED_SERVER_ENV = [
  'KIT_API_KEY',
  'KIT_FORM_ID',
  'RESEND_API_KEY',
  'ANTHROPIC_API_KEY',
] as const

export function missingServerEnv(): string[] {
  return REQUIRED_SERVER_ENV.filter((key) => !process.env[key])
}

/**
 * Loud on boot, fatal on request. A module level throw would break `next build`
 * on a machine without the secrets, so the boot check logs and the request
 * check throws.
 */
export function warnMissingServerEnv(): void {
  const missing = missingServerEnv()
  if (missing.length) {
    console.error(
      `[anger-decoder] MISSING REQUIRED ENVIRONMENT VARIABLES: ${missing.join(', ')}. ` +
        'The submit route will return 500 until these are set.'
    )
  }
}

export function assertServerEnv(): void {
  const missing = missingServerEnv()
  if (missing.length) {
    throw new Error(
      `[anger-decoder] Missing required environment variables: ${missing.join(', ')}`
    )
  }
}
