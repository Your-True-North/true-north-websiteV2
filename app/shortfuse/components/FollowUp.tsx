'use client'

import { useEffect, useRef, useState } from 'react'
import s from '../shortfuse.module.css'
import { STRUGGLES, GOALS, OWN_WORDS_MAX } from '../questions'

type Props = { id: string; email: string; token: string }

// Optional questions shown under the signup confirmation. Send saves them to
// Kit, Skip hides them. Either way he sees "Thanks." and never an error.
export default function FollowUp({ id, email, token }: Props) {
  const [struggles, setStruggles] = useState<string[]>([])
  const [goal, setGoal] = useState('')
  const [ownWords, setOwnWords] = useState('')
  const [sending, setSending] = useState(false)
  const [finished, setFinished] = useState(false)
  const thanksRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => { if (finished) thanksRef.current?.focus() }, [finished])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (sending) return
    setSending(true)
    try {
      await fetch('/api/shortfuse/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, struggles, goal, own_words: ownWords }),
      })
    } catch {
      // Not shown to him; the route logs its own failures
    }
    setFinished(true)
  }

  if (finished) {
    return <p className={s.thanks} ref={thanksRef} tabIndex={-1}>Thanks.</p>
  }

  const toggle = (option: string) =>
    setStruggles(list => (list.includes(option) ? list.filter(o => o !== option) : [...list, option]))

  return (
    <form className={s.followUp} onSubmit={send}>
      <fieldset className={s.q}>
        <legend>While you&apos;re here. What&apos;s hardest right now? <span>(tick any)</span></legend>
        {STRUGGLES.map(option => (
          <label key={option} className={s.opt}>
            <input type="checkbox" name={`struggles-${id}`} value={option} checked={struggles.includes(option)} onChange={() => toggle(option)} />
            <span className={s.box} aria-hidden="true" />
            <span>{option}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className={s.q}>
        <legend>What do you want from the 14 days? <span>(pick one)</span></legend>
        {GOALS.map(option => (
          <label key={option} className={s.opt}>
            <input type="radio" name={`goal-${id}`} value={option} checked={goal === option} onChange={() => setGoal(option)} />
            <span className={`${s.box} ${s.round}`} aria-hidden="true" />
            <span>{option}</span>
          </label>
        ))}
      </fieldset>

      <div className={s.q}>
        <label className={s.qLabel} htmlFor={`own-words-${id}`}>
          In your own words, what made you sign up today? <span>(optional)</span>
        </label>
        <textarea
          id={`own-words-${id}`}
          className={s.words}
          rows={3}
          maxLength={OWN_WORDS_MAX}
          value={ownWords}
          onChange={e => setOwnWords(e.target.value)}
        />
      </div>

      <div className={s.sendRow}>
        <button className={`${s.go} ${s.send}`} type="submit" aria-disabled={sending}>
          <span>{sending ? 'Sending…' : 'Send'}</span>
          <span className={s.ar} aria-hidden="true">→</span>
        </button>
        <button className={s.textgo} type="button" onClick={() => setFinished(true)}>Skip</button>
      </div>
    </form>
  )
}
