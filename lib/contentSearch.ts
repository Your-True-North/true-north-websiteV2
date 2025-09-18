import fs from 'node:fs/promises'
import path from 'node:path'

function score(text: string, q: string) {
  const qTokens = q.toLowerCase().split(/\W+/).filter(Boolean)
  const t = text.toLowerCase()
  let s = 0
  for (const tok of qTokens) if (t.includes(tok)) s += 1
  return s
}

export async function findBestContentMatch(question: string) {
  try {
    const dir = path.join(process.cwd(), 'content')
    const files = await fs.readdir(dir)
    const entries: {file: string; text: string; s: number}[] = []
    for (const f of files) {
      const p = path.join(dir, f)
      const text = await fs.readFile(p, 'utf8')
      entries.push({ file: f, text, s: score(text, question) })
    }
    entries.sort((a, b) => b.s - a.s)
    const top = entries[0]
    if (!top || top.s === 0) return null
    return top.text.slice(0, 500)
  } catch {
    return null
  }
}
