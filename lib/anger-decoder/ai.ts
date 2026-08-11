// One personalisation paragraph, reflecting the man's own free text back to
// him and connecting it to his root.
//
// The AI never writes the whole email. It writes one paragraph that is dropped
// into a fixed template. On any failure or on timeout the caller sends the
// email without the paragraph rather than failing the request.

import Anthropic from '@anthropic-ai/sdk'
import { AI_MODEL, AI_TIMEOUT_MS } from './config'
import { ROOT_NAMES, type Root } from './questions'

const MIN_USABLE_LENGTH = 15

const SYSTEM_PROMPT = `You write one paragraph for a man who has just completed an assessment about where his anger comes from.

You are given his own words about the last time he lost his temper, plus the root his answers pointed to.

Write three to five sentences that reflect his own words back to him and connect them to his root. Use the details he gave. Speak to him directly as you.

Rules, all of them absolute:
Do not give advice.
Do not reassure him.
Do not summarise what he said back as a summary.
Do not use dashes of any kind. No hyphens as punctuation, no en dashes, no em dashes.
Do not write a sentence that announces what the next sentence is about to do.
Do not use metaphors or analogies.
Do not use three beat rhythmic constructions.
Use short sentences and plain words.
Put a question back to him if it fits.
If a line cannot be pictured, cut it.
UK English.

Return only the paragraph. No preamble, no heading, no quotation marks.`

function isUsable(freeText: string): boolean {
  const trimmed = freeText.trim()
  if (trimmed.length < MIN_USABLE_LENGTH) return false
  // Reject strings with no letters, or a single repeated character.
  if (!/[a-z]/i.test(trimmed)) return false
  if (new Set(trimmed.replace(/\s/g, '')).size <= 2) return false
  return true
}

/**
 * Returns the paragraph, or an empty string when the text is unusable or the
 * call fails. Never throws.
 */
export async function buildPersonalisation(
  freeText: string,
  dominant: Root,
  secondary: Root
): Promise<string> {
  if (!isUsable(freeText)) return ''
  if (!process.env.ANTHROPIC_API_KEY) return ''

  const client = new Anthropic({
    // Timeout is milliseconds in the TypeScript SDK. maxRetries must be zero:
    // timeouts are retried by default, so the wall clock would otherwise reach
    // timeout multiplied by retries plus one, blowing the sixty second budget.
    timeout: AI_TIMEOUT_MS,
    maxRetries: 0,
  })

  try {
    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            `His root is ${ROOT_NAMES[dominant]}. His secondary root is ${ROOT_NAMES[secondary]}.`,
            '',
            'His own words:',
            freeText.trim().slice(0, 4000),
          ].join('\n'),
        },
      ],
    })

    if (response.stop_reason === 'refusal') {
      console.error('[anger-decoder] personalisation refused')
      return ''
    }

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim()

    // Belt and braces: strip any dash the model slipped in.
    return text.replace(/[—–]/g, ' ').replace(/\s+-\s+/g, ' ')
  } catch (error: any) {
    console.error('[anger-decoder] personalisation failed:', error?.message || error)
    return ''
  }
}
