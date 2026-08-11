// Pure scoring for the Anger Decoder. No IO, no randomness.
//
// The server recomputes this from the raw answers on every submit. Client
// supplied totals are never trusted.

import {
  QUESTIONS,
  ROOTS,
  SAFETY_FLAG_OPTION_IDS,
  SAFETY_QUESTION_ID,
  TIE_BREAK_MAP,
  TIE_BREAK_QUESTION_ID,
  type Root,
} from './questions'

/**
 * questionId to the selected option id, or an ordered array of option ids for
 * the one multi select question. Order matters on q2: the first selection
 * scores full weight, the second scores half, rounded up.
 */
export type AnswerMap = Record<string, string | string[] | undefined>

export type Totals = Record<Root, number>

export type ScoreResult = {
  totals: Totals
  dominant: Root
  secondary: Root
  closeCall: boolean
  flagSafety: boolean
}

const MULTI_QUESTION_ID = 'q2'

function emptyTotals(): Totals {
  return { wound: 0, cover: 0, signal: 0, tool: 0, overload: 0 }
}

/** Second selection on q2 scores half weight, rounded up. */
function scaleWeight(weight: number, position: number): number {
  return position === 0 ? weight : Math.ceil(weight / 2)
}

export function scoreAnswers(answers: AnswerMap): ScoreResult {
  const totals = emptyTotals()

  for (const question of QUESTIONS) {
    if (question.type === 'freetext' || question.type === 'flag') continue

    const raw = answers[question.id]
    if (raw === undefined) continue

    const selected = Array.isArray(raw) ? raw : [raw]
    const limit =
      question.id === MULTI_QUESTION_ID && question.maxSelections
        ? question.maxSelections
        : selected.length

    selected.slice(0, limit).forEach((optionId, position) => {
      const option = question.options?.find((o) => o.id === optionId)
      if (!option) return

      for (const root of ROOTS) {
        const weight = option.weights[root]
        if (!weight) continue
        totals[root] +=
          question.id === MULTI_QUESTION_ID ? scaleWeight(weight, position) : weight
      }
    })
  }

  const tieBreakAnswer = answers[TIE_BREAK_QUESTION_ID]
  const tieBreakRoot =
    typeof tieBreakAnswer === 'string' ? TIE_BREAK_MAP[tieBreakAnswer] : undefined

  const ranked = rankRoots(totals, tieBreakRoot)
  const dominant = ranked[0]
  const secondary = ranked[1]

  const safetyAnswer = answers[SAFETY_QUESTION_ID]
  const flagSafety =
    typeof safetyAnswer === 'string' && SAFETY_FLAG_OPTION_IDS.includes(safetyAnswer)

  return {
    totals,
    dominant,
    secondary,
    closeCall: totals[dominant] - totals[secondary] <= 2,
    flagSafety,
  }
}

/**
 * Highest first. Ties go to the root named by the q11 answer, then to the
 * fixed ROOTS order so the result is deterministic.
 */
function rankRoots(totals: Totals, tieBreakRoot: Root | undefined): Root[] {
  return [...ROOTS].sort((a, b) => {
    if (totals[b] !== totals[a]) return totals[b] - totals[a]
    if (tieBreakRoot === a) return -1
    if (tieBreakRoot === b) return 1
    return ROOTS.indexOf(a) - ROOTS.indexOf(b)
  })
}
