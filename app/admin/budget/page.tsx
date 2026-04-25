'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ── Types ──────────────────────────────────────────────────────
type Category = {
  id: number; name: string; bucket: 'essential' | 'important' | 'optional'
  monthly_limit: number; spent: number; remaining: number; status: 'safe' | 'caution' | 'over'
}
type Summary = {
  totalIncome: number; totalSpent: number; totalSaved: number
  available: number; safeToSpend: number; suggestedSavings: number; savingsPct: number
  categories: Category[]
  buckets: { essential: { limit: number; spent: number }; important: { limit: number; spent: number }; optional: { limit: number; spent: number } }
}
type Expense = { id: number; amount: string; description: string; category_name: string; bucket: string; logged_at: string }

// ── Colours ────────────────────────────────────────────────────
const C = {
  bg: '#f7f7f5', white: '#ffffff', navy: '#38485d', sage: '#7ba69b',
  text: '#1c1c1e', muted: '#6b7280', border: 'rgba(56,72,93,0.1)',
  safe: '#4caf7d', caution: '#f5a623', over: '#e05252',
  essential: '#38485d', important: '#7ba69b', optional: '#a8b8c8',
}

const fmt = (n: number) => `£${Math.abs(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function Bar({ spent, limit, color }: { spent: number; limit: number; color: string }) {
  const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0
  return (
    <div style={{ height: '6px', background: C.border, borderRadius: '3px', overflow: 'hidden', marginTop: '6px' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.4s ease' }} />
    </div>
  )
}

function StatusDot({ status }: { status: string }) {
  const col = status === 'over' ? C.over : status === 'caution' ? C.caution : C.safe
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: col, marginRight: 6 }} />
}

// ── Main ──────────────────────────────────────────────────────
export default function BudgetPage() {
  const router = useRouter()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [tab, setTab] = useState<'dashboard' | 'spend' | 'income' | 'categories' | 'settings'>('dashboard')
  const [loading, setLoading] = useState(true)

  // forms
  const [incomeAmount, setIncomeAmount] = useState('')
  const [incomeDesc, setIncomeDesc] = useState('')
  const [spendAmount, setSpendAmount] = useState('')
  const [spendDesc, setSpendDesc] = useState('')
  const [spendCategory, setSpendCategory] = useState('')
  const [saving, setSaving] = useState(false)
  const [flash, setFlash] = useState('')

  // category management
  const [newCatName, setNewCatName] = useState('')
  const [newCatBucket, setNewCatBucket] = useState<'essential' | 'important' | 'optional'>('essential')
  const [newCatLimit, setNewCatLimit] = useState('')
  const [editingLimit, setEditingLimit] = useState<Record<number, string>>({})

  // settings
  const [savingsPct, setSavingsPct] = useState('10')

  useEffect(() => {
    const userData = localStorage.getItem('user') || localStorage.getItem('admin')
    if (!userData) { router.push('/auth/login'); return }
    try {
      const p = JSON.parse(userData)
      if (p.role !== 'admin') router.push('/members')
    } catch { router.push('/auth/login') }
  }, [router])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [s, e] = await Promise.all([
        fetch('/api/admin/budget/summary').then(r => r.json()),
        fetch('/api/admin/budget/expenses').then(r => r.json()),
      ])
      setSummary(s)
      setExpenses(e.expenses || [])
      setSavingsPct(String(s.savingsPct || 10))
    } catch (err) { console.error(err) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const showFlash = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(''), 3000) }

  async function handleIncome(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const res = await fetch('/api/admin/budget/income', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(incomeAmount), description: incomeDesc })
    })
    const data = await res.json()
    if (res.ok) {
      showFlash(`£${incomeAmount} added. £${data.savedAmount} auto-saved.`)
      setIncomeAmount(''); setIncomeDesc('')
      await load(); setTab('dashboard')
    }
    setSaving(false)
  }

  async function handleSpend(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const res = await fetch('/api/admin/budget/expenses', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(spendAmount), category_id: spendCategory ? parseInt(spendCategory) : null, description: spendDesc })
    })
    if (res.ok) {
      showFlash(`£${spendAmount} logged.`)
      setSpendAmount(''); setSpendDesc(''); setSpendCategory('')
      await load(); setTab('dashboard')
    }
    setSaving(false)
  }

  async function deleteExpense(id: number) {
    await fetch('/api/admin/budget/expenses', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    await load()
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/admin/budget/categories', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCatName, bucket: newCatBucket, monthly_limit: parseFloat(newCatLimit) || 0 })
    })
    setNewCatName(''); setNewCatLimit('')
    await load()
  }

  async function updateLimit(id: number) {
    const val = editingLimit[id]
    if (val === undefined) return
    await fetch('/api/admin/budget/categories', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, monthly_limit: parseFloat(val) || 0 })
    })
    setEditingLimit(prev => { const n = { ...prev }; delete n[id]; return n })
    await load()
  }

  async function deleteCategory(id: number) {
    await fetch('/api/admin/budget/categories', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    await load()
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/admin/budget/settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ savings_pct: savingsPct })
    })
    showFlash('Settings saved')
    await load()
  }

  // ── Styles ──
  const card = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: C.white, borderRadius: 12, padding: '20px', marginBottom: 12, border: `1px solid ${C.border}`, ...extra
  })
  const inp: React.CSSProperties = {
    width: '100%', background: '#f7f7f5', border: `1px solid ${C.border}`, borderRadius: 8,
    padding: '12px 14px', fontSize: 16, color: C.text, boxSizing: 'border-box', outline: 'none'
  }
  const btn = (color = C.sage): React.CSSProperties => ({
    background: color, color: color === C.white ? C.text : '#fff', border: 'none', borderRadius: 8,
    padding: '13px 24px', fontWeight: 700, fontSize: 15, cursor: 'pointer', width: '100%'
  })
  const tabBtn = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '10px 4px', fontSize: 11, fontWeight: active ? 700 : 400,
    color: active ? C.navy : C.muted, background: active ? C.white : 'transparent',
    border: 'none', borderRadius: 8, cursor: 'pointer', letterSpacing: '0.3px'
  })

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: C.muted }}>Loading...</p>
    </div>
  )

  const s = summary!

  const statusColor = (val: number, safe: number) =>
    val <= 0 ? C.over : val < safe * 0.2 ? C.caution : C.safe

  const bucketColor = { essential: C.essential, important: C.sage, optional: C.optional }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Flash */}
      {flash && (
        <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', background: C.navy, color: '#fff', padding: '12px 24px', borderRadius: 24, fontSize: 14, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          {flash}
        </div>
      )}

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 0 100px' }}>

        {/* Header */}
        <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/admin/dashboard" style={{ color: C.muted, fontSize: 13, textDecoration: 'none' }}>← Admin</Link>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.navy, letterSpacing: 2, textTransform: 'uppercase' }}>Budget</p>
          <div style={{ width: 40 }} />
        </div>

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <div style={{ padding: '16px 16px 0' }}>

            {/* Big number */}
            <div style={card({ textAlign: 'center', padding: '32px 20px', background: C.navy })}>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, textTransform: 'uppercase' }}>Available</p>
              <p style={{ margin: '0 0 20px', fontSize: 42, fontWeight: 700, color: '#fff', letterSpacing: -1 }}>{fmt(s.available)}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '14px 10px' }}>
                  <p style={{ margin: '0 0 2px', fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase' }}>Safe to spend</p>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.safe }}>{fmt(s.safeToSpend)}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '14px 10px' }}>
                  <p style={{ margin: '0 0 2px', fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase' }}>Saved</p>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.sage }}>{fmt(s.totalSaved)}</p>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <button onClick={() => setTab('income')} style={{ ...btn(C.sage), borderRadius: 10, padding: '16px', fontSize: 14 }}>
                + Add Income
              </button>
              <button onClick={() => setTab('spend')} style={{ ...btn(C.navy), borderRadius: 10, padding: '16px', fontSize: 14 }}>
                - Log Spend
              </button>
            </div>

            {/* Allocation summary */}
            <div style={card()}>
              <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: 1.5, textTransform: 'uppercase' }}>Allocation</p>
              {(['essential', 'important', 'optional'] as const).map(bucket => {
                const b = s.buckets[bucket]
                const color = bucketColor[bucket]
                const pct = b.limit > 0 ? Math.min(100, (b.spent / b.limit) * 100) : 0
                const status = b.spent > b.limit && b.limit > 0 ? 'over' : pct > 80 ? 'caution' : 'safe'
                const statColor = status === 'over' ? C.over : status === 'caution' ? C.caution : C.safe
                return (
                  <div key={bucket} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color, textTransform: 'capitalize' }}>{bucket}</span>
                      <span style={{ fontSize: 13, color: C.muted }}>{fmt(b.spent)} <span style={{ color: C.border }}>of</span> {fmt(b.limit)}</span>
                    </div>
                    <Bar spent={b.spent} limit={b.limit} color={statColor} />
                  </div>
                )
              })}
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: C.muted }}>Total in: {fmt(s.totalIncome)}</span>
                <span style={{ fontSize: 12, color: C.muted }}>Spent: {fmt(s.totalSpent)}</span>
              </div>
            </div>

            {/* Categories */}
            {(['essential', 'important', 'optional'] as const).map(bucket => {
              const cats = s.categories.filter(c => c.bucket === bucket)
              if (!cats.length) return null
              return (
                <div key={bucket} style={card()}>
                  <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: bucketColor[bucket], letterSpacing: 2, textTransform: 'uppercase' }}>{bucket}</p>
                  {cats.map(cat => (
                    <div key={cat.id} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', fontSize: 14, color: C.text }}>
                          <StatusDot status={cat.status} />{cat.name}
                        </span>
                        <span style={{ fontSize: 13, color: cat.status === 'over' ? C.over : C.muted }}>
                          {fmt(cat.spent)}{cat.monthly_limit > 0 ? ` / ${fmt(cat.monthly_limit)}` : ''}
                        </span>
                      </div>
                      {cat.monthly_limit > 0 && <Bar spent={cat.spent} limit={cat.monthly_limit} color={cat.status === 'over' ? C.over : cat.status === 'caution' ? C.caution : C.safe} />}
                    </div>
                  ))}
                </div>
              )
            })}

            {/* Recent transactions */}
            {expenses.length > 0 && (
              <div style={card()}>
                <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: 1.5, textTransform: 'uppercase' }}>Recent</p>
                {expenses.slice(0, 8).map(exp => (
                  <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: `1px solid ${C.border}` }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, color: C.text }}>{exp.description || exp.category_name || 'Expense'}</p>
                      <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{exp.category_name} · {new Date(exp.logged_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: C.over }}>-{fmt(parseFloat(exp.amount))}</span>
                      <button onClick={() => deleteExpense(exp.id)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ADD INCOME ── */}
        {tab === 'income' && (
          <div style={{ padding: '16px' }}>
            <div style={card()}>
              <p style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700, color: C.navy }}>Money In</p>
              <form onSubmit={handleIncome}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, color: C.muted, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Amount (£)</label>
                  <input
                    type="number" step="0.01" min="0" required
                    value={incomeAmount} onChange={e => setIncomeAmount(e.target.value)}
                    placeholder="0.00" style={{ ...inp, fontSize: 28, fontWeight: 700, textAlign: 'center' }}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, color: C.muted, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>What is this? (optional)</label>
                  <input type="text" value={incomeDesc} onChange={e => setIncomeDesc(e.target.value)} placeholder="e.g. Client payment" style={inp} />
                </div>
                {incomeAmount && (
                  <div style={{ background: '#f0f7f5', borderRadius: 8, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: C.sage }}>
                    {s.savingsPct}% ({fmt(parseFloat(incomeAmount) * s.savingsPct / 100)}) will be auto-saved
                  </div>
                )}
                <button type="submit" disabled={saving} style={btn(C.sage)}>
                  {saving ? 'Adding...' : 'Add Income'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── LOG SPEND ── */}
        {tab === 'spend' && (
          <div style={{ padding: '16px' }}>
            <div style={card()}>
              <p style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700, color: C.navy }}>Log Spend</p>
              <form onSubmit={handleSpend}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, color: C.muted, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Amount (£)</label>
                  <input
                    type="number" step="0.01" min="0" required
                    value={spendAmount} onChange={e => setSpendAmount(e.target.value)}
                    placeholder="0.00" style={{ ...inp, fontSize: 28, fontWeight: 700, textAlign: 'center' }}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, color: C.muted, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Category</label>
                  <select value={spendCategory} onChange={e => setSpendCategory(e.target.value)} style={{ ...inp, appearance: 'none' }}>
                    <option value="">No category</option>
                    {(['essential', 'important', 'optional'] as const).map(bucket => (
                      <optgroup key={bucket} label={bucket.charAt(0).toUpperCase() + bucket.slice(1)}>
                        {s.categories.filter(c => c.bucket === bucket).map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, color: C.muted, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>What was this? (optional)</label>
                  <input type="text" value={spendDesc} onChange={e => setSpendDesc(e.target.value)} placeholder="e.g. Tesco run" style={inp} />
                </div>
                <button type="submit" disabled={saving} style={btn(C.navy)}>
                  {saving ? 'Logging...' : 'Log Spend'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── CATEGORIES ── */}
        {tab === 'categories' && (
          <div style={{ padding: '16px' }}>
            {(['essential', 'important', 'optional'] as const).map(bucket => (
              <div key={bucket} style={card()}>
                <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: bucketColor[bucket], letterSpacing: 2, textTransform: 'uppercase' }}>{bucket}</p>
                {s.categories.filter(c => c.bucket === bucket).map(cat => (
                  <div key={cat.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ flex: 1, fontSize: 14, color: C.text }}>{cat.name}</span>
                    <input
                      type="number" step="0.01" placeholder="Limit"
                      value={editingLimit[cat.id] ?? cat.monthly_limit}
                      onChange={e => setEditingLimit(prev => ({ ...prev, [cat.id]: e.target.value }))}
                      onBlur={() => updateLimit(cat.id)}
                      style={{ ...inp, width: 90, padding: '8px 10px', fontSize: 14, textAlign: 'right' }}
                    />
                    <button onClick={() => deleteCategory(cat.id)} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '6px 10px', color: C.muted, cursor: 'pointer', fontSize: 13 }}>×</button>
                  </div>
                ))}
              </div>
            ))}

            <div style={card()}>
              <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: 'uppercase' }}>Add Category</p>
              <form onSubmit={addCategory}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <input type="text" required value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Name" style={{ ...inp, padding: '10px 12px' }} />
                  <input type="number" step="0.01" value={newCatLimit} onChange={e => setNewCatLimit(e.target.value)} placeholder="£ limit" style={{ ...inp, padding: '10px 12px' }} />
                </div>
                <select value={newCatBucket} onChange={e => setNewCatBucket(e.target.value as 'essential' | 'important' | 'optional')} style={{ ...inp, marginBottom: 10 }}>
                  <option value="essential">Essential</option>
                  <option value="important">Important</option>
                  <option value="optional">Optional</option>
                </select>
                <button type="submit" style={btn(C.sage)}>Add</button>
              </form>
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === 'settings' && (
          <div style={{ padding: '16px' }}>
            <div style={card()}>
              <p style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700, color: C.navy }}>Settings</p>
              <form onSubmit={saveSettings}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, color: C.muted, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Auto-save % when income added</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="number" min="0" max="50" value={savingsPct} onChange={e => setSavingsPct(e.target.value)} style={{ ...inp, width: 80, textAlign: 'center' }} />
                    <span style={{ color: C.muted, fontSize: 15 }}>%</span>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: 12, color: C.muted }}>Every time you add income, this % goes straight to savings.</p>
                </div>
                <button type="submit" style={btn(C.sage)}>Save Settings</button>
              </form>
            </div>
            <div style={card()}>
              <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600, color: C.navy }}>How it works</p>
              <p style={{ margin: '0 0 8px', fontSize: 13, color: C.muted, lineHeight: 1.7 }}>Add income whenever money comes in. The tool auto-saves your set percentage and recalculates everything instantly.</p>
              <p style={{ margin: '0 0 8px', fontSize: 13, color: C.muted, lineHeight: 1.7 }}>Set monthly limits on your categories to see where you stand at a glance. Green = safe. Amber = getting close. Red = over.</p>
              <p style={{ margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.7 }}>Log spending in 2 taps. Your available balance updates in real time.</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, padding: '8px 16px 20px', display: 'flex', gap: 4, boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
        {([
          { key: 'dashboard', label: '⌂ Home' },
          { key: 'income', label: '+ Income' },
          { key: 'spend', label: '- Spend' },
          { key: 'categories', label: '≡ Budget' },
          { key: 'settings', label: '⚙ Settings' },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={tabBtn(tab === t.key)}>{t.label}</button>
        ))}
      </div>
    </div>
  )
}
