// Result emails for the Anger Decoder.
//
// COPY RULES for every string in this file:
//   No dashes of any kind. Not hyphens as punctuation, not en dashes, not em
//   dashes. No sentence that announces what the next sentence is about to do.
//   No metaphors, no analogies, no three beat rhythmic constructions. Short
//   sentences. Plain words. Questions put back to the reader. If a line cannot
//   be pictured, cut it.
//
// Only The Wound is written. The other four are scaffolded and marked
// TODO_COPY so they are obvious in a grep.

import { COMMUNITY_PATH, DECODER_PATH } from './config'
import { ROOT_NAMES, type Root } from './questions'

export const AI_TOKEN = '[AI_PERSONALISATION_PARAGRAPH]'
export const SECONDARY_TOKEN = '[SECONDARY_ROOT_PARAGRAPH]'

export type EmailTemplate = {
  subject: string
  preview: string
  /** Paragraphs. Two entries are replaced at send time by the tokens above. */
  body: string[]
}

const COMMUNITY_LINE = 'There is a room full of men doing this work already. You can see it here.'

/* ────────────────────────────────────────────────────────────────
   THE WOUND
   ──────────────────────────────────────────────────────────────── */

const WOUND: EmailTemplate = {
  subject: 'This started long before last week',
  preview: 'Your anger came from somewhere. Here it is.',
  body: [
    'Your anger comes from being made small.',
    'Not by your wife. Not by your boss. Long before either of them.',
    'Somewhere back there you were humiliated, or dismissed, or laughed at, or treated like you did not count. And you were too young to do anything about it.',
    'So you built something that would make sure it never happened again. That is what your anger is. It was how you protected yourself when you had nothing else to protect yourself with.',
    'It worked. That is why it is still here.',
    'Men carrying that kind of shame do not feel it as shame. They feel it as fury, and they point it outwards. Outwards you survive. Inwards you do not.',
    'Now look at where it actually fires.',
    'Not at the man who cut you up on the road. At your wife, when she uses a certain tone. At your son, when he does not listen the first time.',
    'Ask yourself why it only shows up with the people you love the most. You already know. It is the only place you have ever put the guard down.',
    AI_TOKEN,
    'Here is what it is costing you.',
    'Your kids, your partner, maybe your friends. They are probably treading on eggshells around you.',
    'Unsure what version of you is coming up today. Scared to say something because they know you are not ready to hear it.',
    'And this is not who you want to be.',
    SECONDARY_TOKEN,
    'So here is one thing to do today.',
    'Next time the heat comes up, do not try to control it. Go underneath it and find the sentence. It is nearly always one of two. You think I am nothing. Or you are not listening to me.',
    'Do not say it out loud. Do not act on it. Just find it.',
    'Your anger has to shout because nothing underneath it is allowed to speak.',
    'You do not fix this by managing your temper. You fix it by going to what your temper has been protecting. That is slower. It is harder. It is the only version that holds.',
    'Tomorrow I am sending you the first day of a three day nervous system reset. Ten minutes a day, and the practices are weighted for exactly what came back in your result.',
    'Where you are now does not have to be where you end up.',
    'True',
  ],
}

/* ────────────────────────────────────────────────────────────────
   THE COVER, THE SIGNAL, THE TOOL, THE OVERLOAD
   Scaffolded only. Replace every TODO_COPY string.
   ──────────────────────────────────────────────────────────────── */

function scaffold(root: Root): EmailTemplate {
  const name = ROOT_NAMES[root]
  return {
    subject: `TODO_COPY subject line for ${name}`,
    preview: `TODO_COPY preview text for ${name}`,
    body: [
      `TODO_COPY opening line naming what ${name} actually is.`,
      'TODO_COPY where it came from, in plain words.',
      'TODO_COPY why it made sense at the time and why it is still running.',
      'TODO_COPY where it actually fires now, with a picture the reader recognises.',
      'TODO_COPY a question put back to the reader.',
      AI_TOKEN,
      'TODO_COPY what it is costing him, named concretely.',
      SECONDARY_TOKEN,
      'TODO_COPY one thing to do today, small and specific.',
      'TODO_COPY the line that reframes the practice.',
      'Tomorrow I am sending you the first day of a three day nervous system reset. Ten minutes a day, and the practices are weighted for exactly what came back in your result.',
      'Where you are now does not have to be where you end up.',
      'True',
    ],
  }
}

export const TEMPLATES: Record<Root, EmailTemplate> = {
  wound: WOUND,
  cover: scaffold('cover'),
  signal: scaffold('signal'),
  tool: scaffold('tool'),
  overload: scaffold('overload'),
}

/* ────────────────────────────────────────────────────────────────
   SECONDARY ROOT PARAGRAPHS
   One per dominant and secondary pair. Twenty in total.
   ──────────────────────────────────────────────────────────────── */

export const SECONDARY_PARAGRAPHS: Record<Root, Record<Root, string>> = {
  wound: {
    wound: '',
    cover:
      'There is a second thing in your result. You keep most of it in. So the shame goes quiet and stays quiet, and it comes out later at someone who did nothing.',
    signal:
      'There is a second thing in your result. Some of your anger is accurate. Something in your life right now is genuinely wrong, and the old wound is making it louder than it needs to be.',
    tool: 'There is a second thing in your result. You have learned to use it. When the room needs to move, your anger moves it, and afterwards you tell yourself it was necessary.',
    overload:
      'There is a second thing in your result. You are running on empty. On a full tank the old wound stays underneath. With no reserve it reaches the surface in seconds.',
  },
  cover: {
    wound:
      'There is a second thing in your result. Underneath the cover is something older that was never allowed to be said out loud.',
    cover: '',
    signal:
      'There is a second thing in your result. Part of what you are holding down is a true reading of your situation. You have covered it so long you stopped checking whether it was right.',
    tool: 'There is a second thing in your result. When keeping it in stops working, you use it deliberately, and that is the version other people remember.',
    overload:
      'There is a second thing in your result. Holding it in takes energy you do not have. That is why the small things get through first.',
  },
  signal: {
    wound:
      'There is a second thing in your result. The situation is real, and it is landing on something old, which is why your reaction is bigger than the moment.',
    cover:
      'There is a second thing in your result. You know what is wrong and you have not said it. The signal is clear and it has nowhere to go.',
    signal: '',
    tool: 'There is a second thing in your result. When the signal is ignored, you escalate on purpose to force the change.',
    overload:
      'There is a second thing in your result. You are worn down, and a worn down man cannot tell an urgent problem from a loud one.',
  },
  tool: {
    wound:
      'There is a second thing in your result. You learned the tool from someone who used it on you.',
    cover:
      'There is a second thing in your result. Between uses you keep everything in, so nobody sees it coming when you decide to use it.',
    signal:
      'There is a second thing in your result. You mostly bring it out when something genuinely is not right, which is why it keeps feeling justified.',
    tool: '',
    overload:
      'There is a second thing in your result. When you are depleted the tool comes out for things that never needed it.',
  },
  overload: {
    wound:
      'There is a second thing in your result. Empty is when the old stuff surfaces. Rest is not a luxury for you, it is what keeps the lid on.',
    cover:
      'There is a second thing in your result. You hold it in all day, and holding costs energy, and by the evening there is none left.',
    signal:
      'There is a second thing in your result. Some of the load is a real problem you have not dealt with. Sleep will not fix that part.',
    tool: 'There is a second thing in your result. When you are empty you reach for control, because control is faster than recovery.',
    overload: '',
  },
}

/* ────────────────────────────────────────────────────────────────
   SAFETY EMAIL
   Sent instead of everything else when flagSafety is true. No offer, no
   upsell, no link to the Reset, no link to the community.
   ──────────────────────────────────────────────────────────────── */

export const RESPECT_LINE =
  'If any of this has become physical, there is a phoneline for men who are worried about their own behaviour. Respect, 0808 8024 040. Free and confidential.'

export function buildSafetyEmail(dominant: Root): { subject: string; html: string; text: string } {
  const name = ROOT_NAMES[dominant]
  const body = [
    `Your result came back as ${name}.`,
    'Before anything else, one practice.',
    'When the heat starts to rise, put both feet flat on the floor and let your breath out for longer than you take it in. Six or seven rounds. You are not trying to feel calm. You are giving your body one thing to do that is not the next move.',
    'Do that today, once, when nothing is happening. It works better if your body already knows it.',
    RESPECT_LINE,
    'True',
  ]
  return {
    subject: 'Your result, and one thing to do first',
    html: renderHtml(body),
    text: body.join('\n\n'),
  }
}

/* ────────────────────────────────────────────────────────────────
   RENDERING
   Markup matches lib/kyn-reminder-email.ts so every KYN email looks the same.
   ──────────────────────────────────────────────────────────────── */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderHtml(paragraphs: string[], footerLinkHref?: string): string {
  const body = paragraphs
    .filter((p) => p && p.trim().length > 0)
    .map((p) => `  <p style="margin: 0 0 22px;">${escapeHtml(p)}</p>`)
    .join('\n')

  const footer = footerLinkHref
    ? `\n  <p style="margin: 0; padding-top: 16px; border-top: 1px solid #e2e2de;"><a href="${footerLinkHref}" style="color: #2d6a4f; text-decoration: none; font-weight: 600;">${escapeHtml(
        COMMUNITY_LINE
      )}</a></p>`
    : ''

  return `
<div style="font-family: Georgia, 'Times New Roman', serif; font-size: 16px; line-height: 1.6; color: #141410; max-width: 560px; margin: 0 auto; padding: 28px 22px;">
${body}${footer}
</div>
`.trim()
}

export type BuiltEmail = { subject: string; preview: string; html: string; text: string }

/**
 * Assembles the result email. The AI paragraph is dropped entirely when the
 * personalisation call returned nothing.
 */
export function buildResultEmail(
  dominant: Root,
  secondary: Root,
  aiParagraph: string,
  siteOrigin: string
): BuiltEmail {
  const template = TEMPLATES[dominant]
  const secondaryParagraph = SECONDARY_PARAGRAPHS[dominant][secondary] || ''

  const paragraphs = template.body
    .map((p) => {
      if (p === AI_TOKEN) return aiParagraph.trim()
      if (p === SECONDARY_TOKEN) return secondaryParagraph
      return p
    })
    .filter((p) => p.length > 0)

  const communityUrl = `${siteOrigin}${COMMUNITY_PATH}`

  return {
    subject: template.subject,
    preview: template.preview,
    html: renderHtml(paragraphs, communityUrl),
    text: [...paragraphs, '', `${COMMUNITY_LINE} ${communityUrl}`].join('\n\n'),
  }
}

/** Exported so the result screen and the decoder can share one source. */
export { DECODER_PATH }
