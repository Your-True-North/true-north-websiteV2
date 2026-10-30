'use client'

import { useEffect, useState } from 'react'
import s from '../shortfuse.module.css'
import { goToForm } from './goToForm'

// Phones only (hidden from 760px in CSS). Shows once the top form has scrolled
// away, hides again while the bottom form is on screen.
export default function StickyBar() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const top = document.getElementById('form-top')
    const bottom = document.getElementById('form-bottom')
    if (!top || !bottom || !('IntersectionObserver' in window)) return
    let topIn = true
    let bottomIn = false
    const update = () => setShow(!topIn && !bottomIn)
    const a = new IntersectionObserver(([e]) => { topIn = e.isIntersecting; update() })
    const b = new IntersectionObserver(([e]) => { bottomIn = e.isIntersecting; update() })
    a.observe(top)
    b.observe(bottom)
    return () => { a.disconnect(); b.disconnect() }
  }, [])

  return (
    <div className={`${s.bar} ${show ? s.show : ''}`} aria-hidden={!show}>
      <p>The Short Fuse</p>
      <button type="button" tabIndex={show ? 0 : -1} onClick={goToForm}>Get Day 1 →</button>
    </div>
  )
}
