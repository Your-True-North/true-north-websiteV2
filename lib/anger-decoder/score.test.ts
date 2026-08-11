// Unit tests for the Anger Decoder scoring function.
//
// Run with: npm run test:anger-decoder
// (compiles this plus score.ts and questions.ts, then runs node --test)

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { scoreAnswers, type AnswerMap } from './score'

test('dominant root: wound', () => {
  const answers: AnswerMap = {
    q1: 'a', // wound 3, tool 2
    q2: ['a'], // wound 3
    q3: 'a', // cover 2, wound 2
    q5: 'a', // wound 3
    q6: 'a', // wound 3, cover 2
    q9: 'a', // wound 3, cover 2
    q11: 'a', // wound 3
  }
  const result = scoreAnswers(answers)
  assert.equal(result.dominant, 'wound')
  assert.equal(result.totals.wound, 20)
})

test('dominant root: cover', () => {
  const answers: AnswerMap = {
    q3: 'c', // cover 3
    q4: 'e', // cover 3, tool 1
    q5: 'c', // cover 3
    q6: 'd', // cover 3
    q8: 'b', // cover 2
    q11: 'b', // cover 3
  }
  const result = scoreAnswers(answers)
  assert.equal(result.dominant, 'cover')
  assert.equal(result.totals.cover, 17)
})

test('dominant root: signal', () => {
  const answers: AnswerMap = {
    q1: 'c', // signal 3, overload 2
    q2: ['e'], // signal 3, cover 1
    q5: 'b', // tool 2, signal 1
    q8: 'd', // signal 2
    q9: 'c', // signal 2, overload 1
    q11: 'c', // signal 3
  }
  const result = scoreAnswers(answers)
  assert.equal(result.dominant, 'signal')
  assert.equal(result.totals.signal, 14)
})

test('dominant root: tool', () => {
  const answers: AnswerMap = {
    q3: 'd', // tool 3
    q5: 'e', // tool 3
    q6: 'c', // tool 3
    q7: 'd', // tool 3
    q8: 'a', // tool 3
    q11: 'd', // tool 3
  }
  const result = scoreAnswers(answers)
  assert.equal(result.dominant, 'tool')
  assert.equal(result.totals.tool, 18)
})

test('dominant root: overload', () => {
  const answers: AnswerMap = {
    q1: 'd', // signal 2, overload 3
    q2: ['d'], // overload 3
    q4: 'd', // overload 2
    q5: 'd', // overload 3
    q10: 'b', // overload 3
    q11: 'e', // overload 3
  }
  const result = scoreAnswers(answers)
  assert.equal(result.dominant, 'overload')
  assert.equal(result.totals.overload, 17)
})

test('q2 second selection scores half weight, rounded up', () => {
  // a = wound 3 (full). c = wound 3, cover 1 (halved: wound 2, cover 1).
  const result = scoreAnswers({ q2: ['a', 'c'] })
  assert.equal(result.totals.wound, 5)
  assert.equal(result.totals.cover, 1)
})

test('q2 respects the two selection maximum', () => {
  const capped = scoreAnswers({ q2: ['a', 'c', 'd'] })
  const two = scoreAnswers({ q2: ['a', 'c'] })
  assert.deepEqual(capped.totals, two.totals)
})

test('tie is broken by the q11 answer', () => {
  // wound 5 (q2 a = 3, q7 a = 2) and tool 5 (q7 a = 2, q11 d = 3).
  const answers: AnswerMap = { q2: ['a'], q7: 'a', q11: 'd' }
  const result = scoreAnswers(answers)
  assert.equal(result.totals.wound, 5)
  assert.equal(result.totals.tool, 5)
  assert.equal(result.dominant, 'tool', 'q11 answer d maps to tool and wins the tie')
  assert.equal(result.secondary, 'wound')
})

test('closeCall is true when the gap is two or less', () => {
  const result = scoreAnswers({ q2: ['a'], q7: 'a', q11: 'd' })
  assert.equal(result.totals.tool - result.totals.wound, 0)
  assert.equal(result.closeCall, true)
})

test('closeCall is false when the gap is more than two', () => {
  const result = scoreAnswers({ q11: 'a' }) // wound 3, everything else 0
  assert.equal(result.dominant, 'wound')
  assert.equal(result.closeCall, false)
})

test('flagSafety is set only by options c and d', () => {
  assert.equal(scoreAnswers({ q_safety: 'a' }).flagSafety, false)
  assert.equal(scoreAnswers({ q_safety: 'b' }).flagSafety, false)
  assert.equal(scoreAnswers({ q_safety: 'c' }).flagSafety, true)
  assert.equal(scoreAnswers({ q_safety: 'd' }).flagSafety, true)
})

test('the safety and freetext questions never score', () => {
  const withExtras = scoreAnswers({ q11: 'a', q_safety: 'd', q12: 'some free text' })
  const withoutExtras = scoreAnswers({ q11: 'a' })
  assert.deepEqual(withExtras.totals, withoutExtras.totals)
})

test('unknown option ids are ignored rather than throwing', () => {
  const result = scoreAnswers({ q1: 'zzz', q11: 'a' })
  assert.equal(result.totals.wound, 3)
})

test('an empty answer set still returns a deterministic shape', () => {
  const result = scoreAnswers({})
  assert.deepEqual(result.totals, { wound: 0, cover: 0, signal: 0, tool: 0, overload: 0 })
  assert.equal(result.dominant, 'wound')
  assert.equal(result.closeCall, true)
  assert.equal(result.flagSafety, false)
})
