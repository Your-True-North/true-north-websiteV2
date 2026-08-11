'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { trackEvent } from '../components/GoogleAnalytics'
import { PROMISE, SUB_LINE } from '../../lib/anger-decoder/config'
import {
  FREETEXT_QUESTION_ID,
  QUESTIONS,
  ROOT_NAMES,
  ROOT_ONE_LINERS,
  getQuestion,
  type Root,
} from '../../lib/anger-decoder/questions'
import { interstitialForLeader } from '../../lib/anger-decoder/interstitials'
import { scoreAnswers, type AnswerMap } from '../../lib/anger-decoder/score'

/* ── palette. One accent, used in two places only. ── */
const GROUND = '#0B0B0B'
const TYPE = '#EDE7DF'
const TYPE_DIM = 'rgba(237,231,223,0.55)'
const HAIRLINE = 'rgba(237,231,223,0.14)'
const ACCENT = '#B4634A'

const GROTESK =
  "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', Arial, sans-serif"
const SERIF = 'Gambarino, Georgia, serif'

type FlowItem = { kind: 'question'; id: string } | { kind: 'interstitial' }

const FLOW: FlowItem[] = [
  { kind: 'question', id: 'q1' },
  { kind: 'question', id: 'q2' },
  { kind: 'question', id: 'q3' },
  { kind: 'question', id: 'q4' },
  { kind: 'question', id: 'q5' },
  { kind: 'question', id: 'q6' },
  { kind: 'interstitial' },
  { kind: 'question', id: 'q7' },
  { kind: 'question', id: 'q8' },
  { kind: 'question', id: 'q9' },
  { kind: 'question', id: 'q_safety' },
  { kind: 'question', id: 'q10' },
  { kind: 'question', id: 'q11' },
  { kind: 'question', id: FREETEXT_QUESTION_ID },
]

type Stage = 'landing' | 'flow' | 'gate' | 'result'

export default function AngerDecoderPage() {
  const [stage, setStage] = useState<Stage>('landing')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ dominant: Root } | null>(null)
  const [videoFailed, setVideoFailed] = useState(false)

  const stageRef = useRef(stage)
  const indexRef = useRef(index)
  useEffect(() => {
    stageRef.current = stage
    indexRef.current = index
  }, [stage, index])

  /* decoder_abandon on unload, carrying the last question index */
  useEffect(() => {
    const onLeave = () => {
      if (stageRef.current === 'result' || stageRef.current === 'landing') return
      trackEvent('decoder_abandon', { last_question_index: indexRef.current })
    }
    window.addEventListener('pagehide', onLeave)
    return () => window.removeEventListener('pagehide', onLeave)
  }, [])

  const current = FLOW[index]

  const leader: Root = useMemo(() => scoreAnswers(answers).dominant, [answers])
  const interstitial = useMemo(() => interstitialForLeader(leader), [leader])

  const start = useCallback(() => {
    trackEvent('decoder_start', {})
    setStage('flow')
    setIndex(0)
  }, [])

  const goNext = useCallback(() => {
    setIndex((i) => {
      const next = i + 1
      if (FLOW[i]?.kind === 'question' && FLOW[i].id === 'q6') {
        trackEvent('decoder_q6_reached', {})
      }
      if (next >= FLOW.length) {
        trackEvent('decoder_complete', {})
        setStage('gate')
        return i
      }
      return next
    })
  }, [])

  const goBack = useCallback(() => {
    setError(null)
    setIndex((i) => Math.max(0, i - 1))
    setStage((s) => (s === 'gate' ? 'flow' : s))
  }, [])

  const setSingle = useCallback(
    (questionId: string, optionId: string) => {
      setAnswers((a) => ({ ...a, [questionId]: optionId }))
      window.setTimeout(goNext, 180)
    },
    [goNext]
  )

  const toggleMulti = useCallback((questionId: string, optionId: string, max: number) => {
    setAnswers((a) => {
      const currentValue = Array.isArray(a[questionId]) ? (a[questionId] as string[]) : []
      if (currentValue.includes(optionId)) {
        return { ...a, [questionId]: currentValue.filter((v) => v !== optionId) }
      }
      if (currentValue.length >= max) return a
      return { ...a, [questionId]: [...currentValue, optionId] }
    })
  }, [])

  const submit = useCallback(async () => {
    setError(null)
    setSending(true)
    trackEvent('decoder_email_submit', {})
    try {
      const res = await fetch('/api/anger-decoder/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, answers }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      trackEvent('decoder_result_delivered', { root: data.dominant })
      setResult({ dominant: data.dominant as Root })
      setStage('result')
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }, [email, answers])

  const progress =
    stage === 'landing'
      ? 0
      : stage === 'result'
        ? 1
        : stage === 'gate'
          ? 1
          : (index + 1) / (FLOW.length + 1)

  return (
    <main
      style={{
        minHeight: '100vh',
        background: GROUND,
        color: TYPE,
        fontFamily: GROTESK,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <style>{`
        @keyframes kynRise {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: none; }
        }
        .kyn-screen { animation: kynRise 200ms ease both; }
        .kyn-row {
          display: block; width: 100%; text-align: left;
          background: none; border: none; border-top: 1px solid ${HAIRLINE};
          color: ${TYPE}; font-family: ${GROTESK}; font-size: 1.0625rem;
          line-height: 1.45; padding: 1.15rem 0; min-height: 60px; cursor: pointer;
          transition: color 200ms ease;
        }
        .kyn-row:last-of-type { border-bottom: 1px solid ${HAIRLINE}; }
        .kyn-row[data-selected="true"] { color: ${ACCENT}; }
        .kyn-row:focus-visible, .kyn-btn:focus-visible, .kyn-input:focus-visible {
          outline: 1px solid ${TYPE}; outline-offset: 3px;
        }
        .kyn-btn {
          background: none; border: none; color: ${TYPE}; font-family: ${GROTESK};
          font-size: 0.9375rem; letter-spacing: 0.02em; cursor: pointer;
          padding: 0.9rem 0; min-height: 48px; transition: opacity 200ms ease;
        }
        .kyn-btn[disabled] { opacity: 0.35; cursor: default; }
        .kyn-input {
          width: 100%; background: none; border: none;
          border-bottom: 1px solid ${HAIRLINE}; color: ${TYPE};
          font-family: ${GROTESK}; font-size: 1.0625rem; padding: 0.9rem 0;
          min-height: 52px;
        }
        .kyn-input::placeholder { color: rgba(237,231,223,0.3); }
        @media (min-width: 700px) {
          .kyn-q { font-size: 2.125rem !important; }
        }
      `}</style>

      {/* progress: one thin line, no percentage, no step count */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: HAIRLINE,
          zIndex: 10,
        }}
      >
        <div
          style={{
            height: '1px',
            width: `${Math.round(progress * 100)}%`,
            background: TYPE,
            transition: 'width 200ms ease',
          }}
        />
      </div>

      <div
        style={{
          maxWidth: '620px',
          margin: '0 auto',
          padding: '5.5rem 1.5rem 4rem',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {stage === 'landing' && (
          <div className="kyn-screen">
            <div
              role="heading"
              aria-level={1}
              className="kyn-q"
              style={{
                fontSize: '1.75rem',
                lineHeight: 1.15,
                letterSpacing: '-0.025em',
                fontWeight: 500,
                marginBottom: '1rem',
              }}
            >
              {PROMISE}
            </div>
            <p style={{ fontSize: '1.0625rem', color: TYPE_DIM, margin: '0 0 3rem' }}>
              {SUB_LINE}
            </p>
            <button className="kyn-btn" onClick={start} style={{ color: TYPE }}>
              Begin
            </button>
          </div>
        )}

        {stage === 'flow' && current?.kind === 'interstitial' && (
          <div className="kyn-screen" key="interstitial">
            {interstitial.body.map((line, i) => (
              <p
                key={i}
                style={{
                  fontSize: '1.0625rem',
                  lineHeight: 1.6,
                  margin: '0 0 1.25rem',
                  color: i === interstitial.body.length - 1 ? TYPE_DIM : TYPE,
                }}
              >
                {line}
              </p>
            ))}

            {!videoFailed && (
              <video
                src={interstitial.videoSrc}
                muted
                playsInline
                preload="metadata"
                controls
                onError={() => setVideoFailed(true)}
                onPlay={() =>
                  trackEvent('decoder_interstitial_play', { variant: interstitial.variant })
                }
                style={{ width: '100%', margin: '1.5rem 0 0', display: 'block' }}
              />
            )}

            <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem' }}>
              <button className="kyn-btn" onClick={goNext}>
                Continue
              </button>
              <button className="kyn-btn" onClick={goBack} style={{ color: TYPE_DIM }}>
                Back
              </button>
            </div>
          </div>
        )}

        {stage === 'flow' && current?.kind === 'question' && (
          <QuestionScreen
            key={current.id}
            questionId={current.id}
            answers={answers}
            onSingle={setSingle}
            onToggleMulti={toggleMulti}
            onFreeText={(value) =>
              setAnswers((a) => ({ ...a, [FREETEXT_QUESTION_ID]: value }))
            }
            onNext={goNext}
            onBack={goBack}
            canGoBack={index > 0}
          />
        )}

        {stage === 'gate' && (
          <div className="kyn-screen" key="gate">
            <p
              className="kyn-q"
              style={{
                fontSize: '1.75rem',
                lineHeight: 1.2,
                letterSpacing: '-0.025em',
                fontWeight: 500,
                margin: '0 0 2rem',
              }}
            >
              Your breakdown is longer than a screen, so I&rsquo;ll send it to you.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!sending) submit()
              }}
            >
              <input
                className="kyn-input"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                placeholder="Your email"
                aria-label="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
                <button className="kyn-btn" type="submit" disabled={sending || !email}>
                  {sending ? 'Sending' : 'Send it to me'}
                </button>
                <button
                  className="kyn-btn"
                  type="button"
                  onClick={goBack}
                  style={{ color: TYPE_DIM }}
                >
                  Back
                </button>
              </div>
            </form>
            {error && (
              <p style={{ color: ACCENT, fontSize: '0.875rem', marginTop: '1rem' }}>{error}</p>
            )}
            <p style={{ fontSize: '0.75rem', color: TYPE_DIM, marginTop: '2.5rem', lineHeight: 1.6 }}>
              I will send you your breakdown and follow up practices. You can leave at any
              time.{' '}
              <a href="/privacy" style={{ color: TYPE_DIM, textDecoration: 'underline' }}>
                Privacy policy
              </a>
              .
            </p>
          </div>
        )}

        {stage === 'result' && result && (
          <div className="kyn-screen" key="result">
            <p
              style={{
                fontSize: '0.6875rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: TYPE_DIM,
                margin: '0 0 1.5rem',
              }}
            >
              Your root
            </p>
            {/* The only serif on the page, and the only other use of the accent. */}
            <p
              style={{
                fontFamily: SERIF,
                fontSize: 'clamp(2.75rem, 12vw, 4.5rem)',
                lineHeight: 1,
                letterSpacing: '-0.02em',
                color: ACCENT,
                margin: '0 0 1.75rem',
              }}
            >
              {ROOT_NAMES[result.dominant]}
            </p>
            <p style={{ fontSize: '1.0625rem', lineHeight: 1.6, margin: '0 0 2.5rem' }}>
              {ROOT_ONE_LINERS[result.dominant]}
            </p>
            <p style={{ fontSize: '0.9375rem', color: TYPE_DIM, lineHeight: 1.6 }}>
              The full breakdown is on its way to your inbox.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

/* ────────────────────────────────────────────────────────────── */

function QuestionScreen({
  questionId,
  answers,
  onSingle,
  onToggleMulti,
  onFreeText,
  onNext,
  onBack,
  canGoBack,
}: {
  questionId: string
  answers: AnswerMap
  onSingle: (questionId: string, optionId: string) => void
  onToggleMulti: (questionId: string, optionId: string, max: number) => void
  onFreeText: (value: string) => void
  onNext: () => void
  onBack: () => void
  canGoBack: boolean
}) {
  const question = getQuestion(questionId)
  if (!question) return null

  const value = answers[questionId]
  const selected = Array.isArray(value) ? value : value ? [value] : []
  const isMulti = question.type === 'multi'
  const max = question.maxSelections ?? 1

  return (
    <div className="kyn-screen">
      <p
        className="kyn-q"
        style={{
          fontSize: '1.75rem',
          lineHeight: 1.2,
          letterSpacing: '-0.025em',
          fontWeight: 500,
          margin: '0 0 1rem',
        }}
      >
        {question.prompt}
      </p>

      {question.helper && (
        <p
          style={{
            fontSize: '0.9375rem',
            lineHeight: 1.55,
            color: TYPE_DIM,
            margin: '0 0 1.75rem',
          }}
        >
          {question.helper}
        </p>
      )}

      {question.type === 'freetext' ? (
        <>
          <textarea
            className="kyn-input"
            rows={6}
            placeholder="However much or little you want"
            aria-label={question.prompt}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onFreeText(e.target.value)}
            style={{ resize: 'vertical', lineHeight: 1.6, marginTop: '0.5rem' }}
          />
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
            <button className="kyn-btn" onClick={onNext}>
              Continue
            </button>
            <button className="kyn-btn" onClick={onNext} style={{ color: TYPE_DIM }}>
              Skip
            </button>
            {canGoBack && (
              <button className="kyn-btn" onClick={onBack} style={{ color: TYPE_DIM }}>
                Back
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <div
            role={isMulti ? 'group' : 'radiogroup'}
            aria-label={question.prompt}
            style={{ marginTop: question.helper ? 0 : '1.75rem' }}
          >
            {question.options?.map((option) => {
              const isSelected = selected.includes(option.id)
              return (
                <button
                  key={option.id}
                  type="button"
                  role={isMulti ? 'checkbox' : 'radio'}
                  aria-checked={isSelected}
                  data-selected={isSelected}
                  className="kyn-row"
                  onClick={() =>
                    isMulti
                      ? onToggleMulti(questionId, option.id, max)
                      : onSingle(questionId, option.id)
                  }
                >
                  {option.label}
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: '2rem', marginTop: '1.75rem' }}>
            {isMulti && (
              <button className="kyn-btn" onClick={onNext} disabled={selected.length === 0}>
                Continue
              </button>
            )}
            {canGoBack && (
              <button className="kyn-btn" onClick={onBack} style={{ color: TYPE_DIM }}>
                Back
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
