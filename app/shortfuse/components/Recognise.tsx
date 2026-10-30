'use client'

import { useState } from 'react'
import s from '../shortfuse.module.css'
import { goToForm } from './goToForm'

const LINES = [
  'You snap at the people you love over nothing, then feel like shit about it all night.',
  "A low hum of irritation that's been running so long you sometimes stop noticing it. But you can still feel it.",
  'Someone tells you to calm down and you want to punch them in the throat.',
  'You say "I\'m fine" so often you\'ve started to believe it.',
  "Once it's over, you tell yourself it's not THAT bad.",
  "You've decided it's just the way you are.",
]

function tally(n: number) {
  if (n === 0) return "None of that looks like rage. All of it is anger that hasn't been worked through."
  if (n < 3) return `${n} of 6. That's enough to start.`
  return `${n} of 6. You already knew. You're in the right place.`
}

export default function Recognise() {
  const [pressed, setPressed] = useState<boolean[]>(() => LINES.map(() => false))
  const count = pressed.filter(Boolean).length

  return (
    <section className={`${s.band} ${s.sage}`}>
      <div className={`${s.wrap} ${s.grid}`}>
        <p className={s.side}>Recognise it</p>
        <div className={`${s.main} ${s.flow}`}>
          <h2 className={s.big}>What a short fuse looks like when no one&apos;s watching.</h2>
          <p style={{ fontWeight: 600 }}>Be honest. Which of these sound like you?</p>
          <div className={s.lines}>
            {LINES.map((line, i) => (
              <button
                key={i}
                type="button"
                className={s.line}
                aria-pressed={pressed[i]}
                onClick={() => setPressed(p => p.map((on, j) => (j === i ? !on : on)))}
              >
                <span className={s.q}>{line}</span>
                <span className={s.tag}>That&apos;s me</span>
              </button>
            ))}
          </div>
          <div className={s.tally}>
            <p aria-live="polite">{tally(count)}</p>
            <button type="button" className={s.textgo} onClick={goToForm}>Start Day 1 →</button>
          </div>
        </div>
      </div>
    </section>
  )
}
