// The interstitial that fires after Q6, chosen by the running leader.
//
// The read renders immediately. The video is optional and never gates the
// Continue button. Video files are dropped in later at the paths below; if the
// file is missing the block degrades to text only.

import type { Root } from './questions'

export type InterstitialVariant = 'outward' | 'inward' | 'depleted'

export const VARIANT_FOR_ROOT: Record<Root, InterstitialVariant> = {
  wound: 'outward',
  tool: 'outward',
  cover: 'inward',
  signal: 'depleted',
  overload: 'depleted',
}

export type Interstitial = {
  variant: InterstitialVariant
  /** Paragraphs of the read. Rendered on screen straight away. */
  body: string[]
  /** Optional, muted, no autoplay. Missing file degrades to text only. */
  videoSrc: string
}

export const INTERSTITIALS: Record<InterstitialVariant, Interstitial> = {
  outward: {
    variant: 'outward',
    videoSrc: '/anger-decoder/interstitial-outward.mp4',
    body: [
      'Most men who point it outwards were taught to.',
      'Somewhere back there, going outwards was the thing that worked. It stopped something, or it kept something away from you, or it meant you were not the one on the floor.',
      'It is still doing that job now. That is why it fires before you have decided anything.',
      'Five more questions.',
    ],
  },
  inward: {
    variant: 'inward',
    videoSrc: '/anger-decoder/interstitial-inward.mp4',
    body: [
      'Keeping it in is not the same as not having it.',
      'It goes somewhere. Into your jaw, into your sleep, into the flat quiet afterwards that you cannot explain to anyone.',
      'You learned that saying it out loud cost more than swallowing it. So you swallowed it, and you got good at that.',
      'Five more questions.',
    ],
  },
  depleted: {
    variant: 'depleted',
    videoSrc: '/anger-decoder/interstitial-depleted.mp4',
    body: [
      'When there is nothing left, everything gets through.',
      'The traffic, the noise, the question you have been asked twice. None of it is the reason. It is just what was in front of you when the tank hit empty.',
      'A body with no reserve has one setting left, and you already know what it is.',
      'Five more questions.',
    ],
  },
}

export function interstitialForLeader(leader: Root): Interstitial {
  return INTERSTITIALS[VARIANT_FOR_ROOT[leader]]
}
