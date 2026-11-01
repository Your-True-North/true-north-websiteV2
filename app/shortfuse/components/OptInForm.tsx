'use client'

import { useEffect, useRef, useState } from 'react'
import s from '../shortfuse.module.css'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']

type Props = { id: 'top' | 'middle' | 'bottom'; button: string; fine: string }

// The same form sits at the top, middle and bottom of the page. It posts to our own
// route, which adds the person to the Short Fuse form in Kit (the key stays on
// the server). Kit's tag and sequence take it from there.
export default function OptInForm({ id, button, fine }: Props) {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const doneRef = useRef<HTMLParagraphElement>(null)

  // Move focus to the confirmation so screen readers announce it
  useEffect(() => { if (done) doneRef.current?.focus() }, [done])

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (sending) return

    if (!EMAIL.test(email.trim())) {
      setInvalid(true)
      setMessage('Pop a valid email in so Day 1 has somewhere to go.')
      emailRef.current?.focus()
      return
    }
    setInvalid(false)
    setMessage('')
    setSending(true)

    const params = new URLSearchParams(window.location.search)
    const utm: Record<string, string> = {}
    for (const key of UTM_KEYS) {
      const value = params.get(key)
      if (value) utm[key] = value
    }
    const company = (e.currentTarget.elements.namedItem('company') as HTMLInputElement | null)?.value || ''

    try {
      const res = await fetch('/api/shortfuse/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), company, utm, referrer: window.location.href }),
      })
      if (res.status === 422) {
        setInvalid(true)
        setMessage('Pop a valid email in so Day 1 has somewhere to go.')
        setSending(false)
        emailRef.current?.focus()
        return
      }
      if (!res.ok) throw new Error(String(res.status))

      const w = window as any
      if (typeof w.fbq === 'function') w.fbq('track', 'Lead', { content_name: 'The Short Fuse' })
      if (typeof w.gtag === 'function') w.gtag('event', 'generate_lead', { form: 'short_fuse', position: id })

      setDone(true)
    } catch {
      setMessage('Something went wrong. Try again in a minute.')
    }
    setSending(false)
  }

  const statusId = `status-${id}`

  return (
    <div id={`form-${id}`}>
      {done ? (
        <div className={s.done}>
          <p className={s.doneTitle} ref={doneRef} tabIndex={-1}>Check your inbox. Day 1 is on its way.</p>
          <p className={s.fine}>Can&apos;t see it? Check your promotions or spam folder.</p>
        </div>
      ) : (
        <form className={s.optin} noValidate onSubmit={submit}>
          <div className={s.field}>
            <label htmlFor={`email-${id}`}>Email</label>
            <input
              ref={emailRef}
              id={`email-${id}`}
              name="email_address"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@email.com"
              required
              aria-invalid={invalid}
              aria-describedby={statusId}
              value={email}
              onChange={e => { setEmail(e.target.value); if (invalid) setInvalid(false) }}
            />
          </div>
          {/* Honeypot: hidden from people, bots fill it in */}
          <div className={s.trap} aria-hidden="true">
            <label htmlFor={`company-${id}`}>Company</label>
            <input id={`company-${id}`} name="company" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <button className={s.go} type="submit" aria-disabled={sending}>
            <span>{sending ? 'Sending…' : button}</span>
            <span className={s.ar} aria-hidden="true">→</span>
          </button>
          <p className={s.fine}>{fine} <a href="/privacy">Privacy policy</a></p>
          <p className={s.status} id={statusId} role="status">{message}</p>
        </form>
      )}
    </div>
  )
}
