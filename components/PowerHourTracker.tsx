'use client'
import { useCallback, useEffect, useState } from 'react'
import type { PowerHourClient } from '@/lib/power-hour'

type Ticks = Record<string, Record<string, boolean>>
type Note = { t: string; at: string }

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d }
const readLocal = (k: string): Ticks => { try { return JSON.parse(localStorage.getItem(k) || '{}') || {} } catch { return {} } }
const writeLocal = (k: string, t: Ticks) => { try { localStorage.setItem(k, JSON.stringify(t)) } catch {} }

const css = `
.ph{min-height:100vh;background:#0e0e0e;color:#f2f2ef;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:16px;line-height:1.5}
.ph-wrap{max-width:460px;margin:0 auto;padding:32px max(16px,env(safe-area-inset-right,0px)) 48px max(16px,env(safe-area-inset-left,0px));display:flex;flex-direction:column;gap:26px}
.ph-head{display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center}
.ph-mark{width:34px;height:auto;opacity:.9}
.ph-name{font-size:14px;letter-spacing:.18em;text-transform:uppercase;color:#b9b9b2}
.ph-h1{font-size:32px;font-weight:700;margin:0;line-height:1.1}
.ph-list{display:flex;flex-direction:column;gap:12px}
.ph-item{display:flex;align-items:center;gap:16px;width:100%;text-align:left;font:inherit;color:inherit;background:#181818;border:2px solid #2b2b2b;border-radius:14px;padding:18px;cursor:pointer}
.ph-item:focus-visible{outline:3px solid #fff;outline-offset:2px}
.ph-check{flex:none;width:34px;height:34px;border-radius:50%;border:2px solid #4a4a4a;display:flex;align-items:center;justify-content:center;font-weight:800;color:#0e0e0e}
.ph-item.on{border-color:#3f9a72}
.ph-item.on .ph-check{background:#3f9a72;border-color:#3f9a72;color:#fff}
.ph-t{font-weight:600;font-size:17px}
.ph-d{font-size:14px;color:#a3a39c;margin-top:2px}
.ph-small{font-size:13px;color:#a3a39c}
.ph-yday{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding-top:16px;border-top:1px solid #2b2b2b}
.ph-dots{display:flex;gap:6px;flex-wrap:wrap}
.ph-dot{font-size:13px;padding:3px 10px;border-radius:99px;border:1px solid #e07a6c;color:#e07a6c}
.ph-dot.on{background:#3f9a72;border-color:#3f9a72;color:#fff}
.ph-box{display:grid;gap:10px;background:#181818;border:1px solid #2b2b2b;border-radius:14px;padding:16px}
.ph-box h2{font-size:16px;margin:0}
.ph-box textarea{width:100%;box-sizing:border-box;font:inherit;font-size:16px;color:inherit;background:#0e0e0e;border:1px solid #2b2b2b;border-radius:8px;padding:8px 10px}
.ph-btn{justify-self:start;font:inherit;font-weight:600;border:none;border-radius:8px;padding:10px 16px;cursor:pointer;background:#f2f2ef;color:#0e0e0e}
.ph-btn:disabled{opacity:.6}
.ph-note{border-top:1px solid #2b2b2b;padding-top:8px;white-space:pre-wrap;overflow-wrap:anywhere}
.ph-when{display:block;font-size:12px;color:#a3a39c}
.ph-status{font-size:13px;color:#e0b26c}
.ph-week{display:grid;grid-template-columns:auto repeat(4,1fr);gap:6px 10px;font-size:14px;font-variant-numeric:tabular-nums}
.ph-week .c{text-align:center}.ph-week .y{color:#3f9a72;font-weight:700}.ph-week .x{color:#e07a6c}
.ph-week .h{color:#a3a39c;font-size:11px;text-transform:uppercase;letter-spacing:.08em}
`

export default function PowerHourTracker({ client, coach = false }: { client: PowerHourClient; coach?: boolean }) {
  const [ticks, setTicks] = useState<Ticks>({})
  const [notes, setNotes] = useState<Note[]>([])
  const [status, setStatus] = useState('')
  const [note, setNote] = useState('')
  const [noteStatus, setNoteStatus] = useState('')
  const [sending, setSending] = useState(false)
  const [today, setToday] = useState('')
  const [yday, setYday] = useState('')
  const api = `/api/power-hour/${client.slug}`
  const localKey = `power-hour:${client.slug}`
  const [offline, setOffline] = useState(false)

  const load = useCallback(async () => {
    try {
      const r = await fetch(api, { cache: 'no-store' })
      if (!r.ok) throw new Error()
      const d = await r.json()
      if (d.error) throw new Error()
      const local = readLocal(localKey), server: Ticks = d.ticks || {}
      const merged: Ticks = { ...local }
      for (const day of Object.keys(server)) merged[day] = { ...(local[day] || {}), ...server[day] }
      setTicks(merged); writeLocal(localKey, merged)
      setNotes(d.notes || []); setOffline(!!d.offline); setStatus('')
    } catch { setTicks(readLocal(localKey)) }
  }, [api, localKey])

  useEffect(() => {
    setToday(dayKey(new Date())); setYday(dayKey(daysAgo(1)))
    load()
    const onFocus = () => { setToday(dayKey(new Date())); setYday(dayKey(daysAgo(1))); load() }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [load])

  async function toggle(key: string) {
    if (!today) return
    const done = !(ticks[today]?.[key])
    const next = { ...ticks, [today]: { ...(ticks[today] || {}), [key]: done } }
    setTicks(next); writeLocal(localKey, next)
    try {
      await fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'tick', day: today, item: key, done }) })
    } catch {}
  }

  async function sendNote() {
    const text = note.trim()
    if (!text) { setNoteStatus('Write something first.'); return }
    setSending(true)
    try {
      const r = await fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'note', text }) })
      if (!r.ok) throw new Error()
      setNote(''); setNoteStatus('Sent. True will see it.'); load()
    } catch { setNoteStatus("Your note didn't send. Try again in a moment.") }
    setSending(false)
  }

  const detail = (i: PowerHourClient['items'][number]) => {
    if (!i.task) return i.detail || ''
    const txt = i.task === 'priority' ? client.priority : client.bonus
    const due = i.task === 'bonus' && client.due ? ` · by ${client.due}` : ''
    return (txt || 'Set on your next call') + due
  }
  const t = ticks[today] || {}
  const y = ticks[yday] || {}
  const when = (at: string) => {
    const d = new Date(at)
    return isNaN(d.getTime()) ? '' : d.toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
  }

  const coachDays: { key: string; label: string }[] = []
  if (coach && today) {
    for (let i = 0; i <= 60; i++) {
      const d = daysAgo(i), k = dayKey(d)
      if (k < client.start) break
      coachDays.push({ key: k, label: i === 0 ? 'Today' : d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) })
    }
  }

  return (
    <main className="ph">
      <style>{css}</style>
      <div className="ph-wrap">
        <header className="ph-head">
          <img className="ph-mark" src="/kyn-compass-white.png" alt="" />
          <div className="ph-name">{client.name}&apos;s Power Hour Tasks</div>
          <h1 className="ph-h1">{coach ? 'Coach view' : 'Today'}</h1>
        </header>

        {coach ? (
          <section className="ph-box" aria-label="Days so far">
            <h2>{client.name}&apos;s days so far</h2>
            {offline && <div className="ph-status">His ticks can&apos;t reach the website right now, so they&apos;re only saved on his phone. His notes still come to your email.</div>}
            {coachDays.length === 0 ? (
              <div className="ph-small">His days will build up here from {client.start}.</div>
            ) : (
              <div className="ph-week">
                <span className="h" />
                {client.items.map((i) => <span key={i.key} className="h c">{i.short}</span>)}
                {coachDays.map((d) => (
                  <Row key={d.key} label={d.label} items={client.items} ticks={ticks[d.key] || {}} isToday={d.key === today} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            <section className="ph-list" aria-label="Today">
              {client.items.map((i) => (
                <button key={i.key} className={'ph-item' + (t[i.key] ? ' on' : '')} aria-pressed={!!t[i.key]} onClick={() => toggle(i.key)}>
                  <span className="ph-check">{t[i.key] ? '✓' : ''}</span>
                  <span>
                    <div className="ph-t">{i.title}</div>
                    {detail(i) && <div className="ph-d">{detail(i)}</div>}
                  </span>
                </button>
              ))}
            </section>
            {status && <div className="ph-status">{status}</div>}
            {yday && yday >= client.start && (
              <section className="ph-yday" aria-label="Yesterday">
                <span className="ph-small">Yesterday&apos;s finished tasks</span>
                <div className="ph-dots">
                  {client.items.map((i) => (
                    <span key={i.key} className={'ph-dot' + (y[i.key] ? ' on' : '')}>{(y[i.key] ? '✓ ' : '✗ ') + i.short}</span>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <section className="ph-box" aria-label="Notes for coach">
          <h2>Notes for coach</h2>
          {!coach && (
            <>
              <div className="ph-small">Anything you want True to know. Write it here and tap Send.</div>
              <textarea id="ph-note" rows={3} aria-label="Your note" value={note} onChange={(e) => setNote(e.target.value)} />
              <button className="ph-btn" onClick={sendNote} disabled={sending}>Send to True</button>
              {noteStatus && <div className="ph-small">{noteStatus}</div>}
            </>
          )}
          {notes.length === 0 && coach && <div className="ph-small">No notes yet.</div>}
          {notes.map((n, i) => (
            <div key={i} className="ph-note"><span className="ph-when">{when(n.at)}</span>{n.t}</div>
          ))}
        </section>
      </div>
    </main>
  )
}

function Row({ label, items, ticks, isToday }: { label: string; items: PowerHourClient['items']; ticks: Record<string, boolean>; isToday: boolean }) {
  return (
    <>
      <span>{label}</span>
      {items.map((i) => (
        <span key={i.key} className={'c ' + (ticks[i.key] ? 'y' : 'x')}>{ticks[i.key] ? '✓' : isToday ? '·' : '✗'}</span>
      ))}
    </>
  )
}
