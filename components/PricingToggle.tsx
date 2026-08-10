'use client'

import { useEffect, useRef, useState } from 'react'

/* ────────────────────────────────────────────────────────────────
   CONFIG
   Edit these values only. Everything shown to the reader is derived
   from them at render time, so no price or duration is hardcoded in
   the copy below.
   ──────────────────────────────────────────────────────────────── */

/** Founding monthly price. */
const MONTHLY_PRICE = 25

/** Founding yearly price, charged as one payment. */
const YEARLY_PRICE = 250

/** What the monthly price moves to once the founding period closes. */
const FUTURE_MONTHLY_PRICE = 50

/** Which option is preselected on load. Flip to 'yearly' to preselect yearly. */
const DEFAULT_INTERVAL: Interval = 'monthly'

/** Currency symbol used for every price shown. */
const CURRENCY_SYMBOL = '£'

/* ────────────────────────────────────────────────────────────────
   BRAND
   ──────────────────────────────────────────────────────────────── */

const GREEN = '#142E28'
const SAGE = '#9BC4B8'
const CREAM = '#F5F3EF'
const SERIF = 'Gambarino, Georgia, serif'
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

/* ────────────────────────────────────────────────────────────────
   DERIVED VALUES
   ──────────────────────────────────────────────────────────────── */

type Interval = 'monthly' | 'yearly'

const MONTHS_IN_YEAR = 12

/** Yearly price spread across the year, to two decimal places. */
const monthlyEquivalent = (YEARLY_PRICE / MONTHS_IN_YEAR).toFixed(2)

/** How many months the reader effectively does not pay for. */
const freeMonths = MONTHS_IN_YEAR - Math.round(YEARLY_PRICE / MONTHLY_PRICE)

const NUMBER_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six',
  'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
]

function numberToWords(n: number): string {
  return NUMBER_WORDS[n] ?? String(n)
}

const freeMonthsLabel = `${numberToWords(freeMonths)} ${freeMonths === 1 ? 'month' : 'months'}`

/* ────────────────────────────────────────────────────────────────
   COPY
   ──────────────────────────────────────────────────────────────── */

const MONTHLY_NOTE =
  'Cancel whenever you need to, there is no contract and no pressure to stay.'

const YEARLY_SAVING_NOTE =
  `That works out at ${CURRENCY_SYMBOL}${monthlyEquivalent} a month, with ${freeMonthsLabel} free.`

const YEARLY_NOTE =
  'One payment and you are in for twelve months without having to think about it again.'

const FOUNDING_NOTE =
  `This is the founding rate while the doors are still new. It moves to ${CURRENCY_SYMBOL}${FUTURE_MONTHLY_PRICE} a month once the founding period closes, and whatever rate you join on is the rate you keep for as long as you stay.`

const OPTIONS: { value: Interval; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

/* ────────────────────────────────────────────────────────────────
   COMPONENT
   ──────────────────────────────────────────────────────────────── */

export interface PricingToggleProps {
  /** Text on the call to action button. */
  ctaLabel: string
  /** Used for analytics only, for example 'anger_founding'. */
  trackingId?: string
}

export default function PricingToggle({ ctaLabel, trackingId }: PricingToggleProps) {
  const [interval, setInterval] = useState<Interval>(DEFAULT_INTERVAL)
  const [shown, setShown] = useState<Interval>(DEFAULT_INTERVAL)
  const [visible, setVisible] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Crossfade: fade out, swap the figures, fade back in.
  useEffect(() => {
    if (interval === shown) return
    setVisible(false)
    const t = setTimeout(() => {
      setShown(interval)
      setVisible(true)
    }, 140)
    return () => clearTimeout(t)
  }, [interval, shown])

  const isYearly = shown === 'yearly'
  const price = isYearly ? YEARLY_PRICE : MONTHLY_PRICE
  const period = isYearly ? 'a year' : 'a month'

  const announcement = isYearly
    ? `Yearly selected. ${CURRENCY_SYMBOL}${YEARLY_PRICE} a year. ${YEARLY_SAVING_NOTE}`
    : `Monthly selected. ${CURRENCY_SYMBOL}${MONTHLY_PRICE} a month.`

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    const last = OPTIONS.length - 1
    let next: number | null = null

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = index === last ? 0 : index + 1
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = index === 0 ? last : index - 1
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setInterval(OPTIONS[index].value)
      return
    }
    if (next === null) return

    e.preventDefault()
    setInterval(OPTIONS[next].value)
    buttonRefs.current[next]?.focus()
  }

  async function startCheckout() {
    setBusy(true)
    setError(null)

    try {
      if (typeof window !== 'undefined' && (window as any).fbq) {
        ;(window as any).fbq('track', 'InitiateCheckout', {
          content_name: trackingId || 'Founding Membership',
          value: interval === 'yearly' ? YEARLY_PRICE : MONTHLY_PRICE,
          currency: 'GBP',
        })
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Checkout could not start')
      window.location.href = data.url
    } catch (err: any) {
      setError('Something went wrong starting checkout. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div
      id="pricing"
      style={{
        background: GREEN,
        borderRadius: '10px',
        padding: '1.75rem 1.5rem 2rem',
        margin: '0 0 2rem',
        textAlign: 'center',
        fontFamily: SANS,
        // Keeps the block clear of the fixed nav when scrolled to from the hero.
        scrollMarginTop: '80px',
      }}
    >
      <style>{`
        .kyn-price-opt:focus-visible {
          outline: 2px solid ${SAGE};
          outline-offset: 3px;
        }
      `}</style>

      {/* Toggle */}
      <div
        role="radiogroup"
        aria-label="Billing interval"
        style={{
          display: 'inline-flex',
          background: 'rgba(255,255,255,0.07)',
          borderRadius: '999px',
          padding: '4px',
          marginBottom: '1.5rem',
          maxWidth: '100%',
        }}
      >
        {OPTIONS.map((opt, i) => {
          const selected = interval === opt.value
          return (
            <button
              key={opt.value}
              ref={(el) => {
                buttonRefs.current[i] = el
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => setInterval(opt.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className="kyn-price-opt"
              style={{
                minHeight: '44px',
                padding: '0 1.4rem',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: SANS,
                fontSize: '0.9375rem',
                fontWeight: selected ? 700 : 500,
                letterSpacing: '0.02em',
                background: selected ? SAGE : 'transparent',
                color: selected ? GREEN : 'rgba(245,243,239,0.75)',
                transition: 'background 160ms ease, color 160ms ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                whiteSpace: 'nowrap',
              }}
            >
              {opt.label}
              {opt.value === 'yearly' && (
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: selected ? GREEN : SAGE,
                    opacity: selected ? 0.7 : 1,
                  }}
                >
                  Best value
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Price */}
      <div
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 140ms ease',
        }}
      >
        <p
          style={{
            fontFamily: SERIF,
            fontSize: 'clamp(2.25rem, 7vw, 3rem)',
            lineHeight: 1.05,
            color: CREAM,
            margin: '0 0 0.35rem',
          }}
        >
          {CURRENCY_SYMBOL}
          {price}
          <span style={{ fontFamily: SANS, fontSize: '1rem', color: 'rgba(245,243,239,0.7)' }}>
            {' '}
            {period}
          </span>
        </p>

        {isYearly && (
          <p
            style={{
              fontFamily: SANS,
              fontSize: '0.875rem',
              color: SAGE,
              margin: '0 0 0.75rem',
            }}
          >
            {YEARLY_SAVING_NOTE}
          </p>
        )}

        <p
          style={{
            fontFamily: SANS,
            fontSize: '0.9375rem',
            lineHeight: 1.6,
            color: 'rgba(245,243,239,0.82)',
            margin: '0 auto 1.25rem',
            maxWidth: '30rem',
          }}
        >
          {isYearly ? YEARLY_NOTE : MONTHLY_NOTE}
        </p>
      </div>

      {/* Screen reader announcement */}
      <div
        aria-live="polite"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap',
        }}
      >
        {announcement}
      </div>

      {/* Call to action */}
      <button
        type="button"
        onClick={startCheckout}
        disabled={busy}
        className="kyn-price-opt"
        style={{
          display: 'inline-block',
          background: SAGE,
          color: GREEN,
          padding: '0.875rem 2.5rem',
          minHeight: '48px',
          borderRadius: '4px',
          fontWeight: 700,
          fontSize: '0.9375rem',
          fontFamily: SANS,
          border: 'none',
          cursor: busy ? 'wait' : 'pointer',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          opacity: busy ? 0.7 : 1,
          maxWidth: '100%',
        }}
      >
        {busy ? 'One moment' : ctaLabel}
      </button>

      {error && (
        <p style={{ fontFamily: SANS, fontSize: '0.8125rem', color: SAGE, margin: '0.75rem 0 0' }}>
          {error}
        </p>
      )}

      {/* Founding note, shown in both states */}
      <p
        style={{
          fontFamily: SANS,
          fontSize: '0.8125rem',
          lineHeight: 1.6,
          color: 'rgba(245,243,239,0.62)',
          margin: '1.25rem auto 0',
          maxWidth: '32rem',
        }}
      >
        {FOUNDING_NOTE}
      </p>
    </div>
  )
}
