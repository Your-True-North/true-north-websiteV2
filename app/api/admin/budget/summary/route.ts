import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const [incomeRes, expensesRes, savingsRes, categoriesRes, settingsRes] = await Promise.all([
      query(`SELECT COALESCE(SUM(amount),0) as total FROM budget_income`),
      query(`SELECT COALESCE(SUM(amount),0) as total FROM budget_expenses`),
      query(`SELECT COALESCE(SUM(amount),0) as total FROM budget_savings`),
      query(`
        SELECT c.id, c.name, c.bucket, c.monthly_limit,
          COALESCE(SUM(e.amount),0) as spent
        FROM budget_categories c
        LEFT JOIN budget_expenses e ON e.category_id = c.id
        GROUP BY c.id ORDER BY c.bucket, c.name
      `),
      query(`SELECT key, value FROM budget_settings`),
    ])

    const totalIncome = parseFloat(incomeRes.rows[0].total)
    const totalSpent = parseFloat(expensesRes.rows[0].total)
    const totalSaved = parseFloat(savingsRes.rows[0].total)
    const available = totalIncome - totalSpent - totalSaved

    const settings: Record<string, string> = {}
    settingsRes.rows.forEach((r: { key: string; value: string }) => { settings[r.key] = r.value })
    const savingsPct = parseFloat(settings.savings_pct || '10')

    // Allocation suggestion based on latest income block
    const latestIncome = await query(`SELECT amount FROM budget_income ORDER BY added_at DESC LIMIT 1`)
    const lastAmount = latestIncome.rows[0] ? parseFloat(latestIncome.rows[0].amount) : 0
    const suggestedSavings = Math.round(lastAmount * savingsPct / 100 * 100) / 100
    const safeToSpend = Math.max(0, available - suggestedSavings)

    // Bucket breakdown
    const categories = categoriesRes.rows.map((c: Record<string, unknown>) => ({
      ...c,
      monthly_limit: parseFloat(c.monthly_limit as string),
      spent: parseFloat(c.spent as string),
      remaining: Math.max(0, parseFloat(c.monthly_limit as string) - parseFloat(c.spent as string)),
      status: parseFloat(c.spent as string) >= parseFloat(c.monthly_limit as string) && parseFloat(c.monthly_limit as string) > 0
        ? 'over'
        : parseFloat(c.spent as string) >= parseFloat(c.monthly_limit as string) * 0.8 && parseFloat(c.monthly_limit as string) > 0
        ? 'caution'
        : 'safe'
    }))

    const essentialTotal = categories.filter((c: { bucket: string }) => c.bucket === 'essential').reduce((s: number, c: { monthly_limit: number }) => s + c.monthly_limit, 0)
    const importantTotal = categories.filter((c: { bucket: string }) => c.bucket === 'important').reduce((s: number, c: { monthly_limit: number }) => s + c.monthly_limit, 0)
    const optionalTotal = categories.filter((c: { bucket: string }) => c.bucket === 'optional').reduce((s: number, c: { monthly_limit: number }) => s + c.monthly_limit, 0)

    const essentialSpent = categories.filter((c: { bucket: string }) => c.bucket === 'essential').reduce((s: number, c: { spent: number }) => s + c.spent, 0)
    const importantSpent = categories.filter((c: { bucket: string }) => c.bucket === 'important').reduce((s: number, c: { spent: number }) => s + c.spent, 0)
    const optionalSpent = categories.filter((c: { bucket: string }) => c.bucket === 'optional').reduce((s: number, c: { spent: number }) => s + c.spent, 0)

    return NextResponse.json({
      totalIncome,
      totalSpent,
      totalSaved,
      available,
      safeToSpend,
      suggestedSavings,
      savingsPct,
      categories,
      buckets: {
        essential: { limit: essentialTotal, spent: essentialSpent },
        important: { limit: importantTotal, spent: importantSpent },
        optional: { limit: optionalTotal, spent: optionalSpent },
      },
      settings,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to load summary' }, { status: 500 })
  }
}
