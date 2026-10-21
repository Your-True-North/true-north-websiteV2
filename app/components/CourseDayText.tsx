import { Fragment } from 'react'

// Renders a course day's text: one paragraph per line, lines starting with •
// grouped into a list, and **bold** as bold. A line that just repeats the day's
// title (the big heading in the email) is left out, since the page shows the title.
export default function CourseDayText({ body, title }: { body: string; title?: string }) {
  const same = (a: string, b: string) => a.replace(/\*\*/g, '').trim().toLowerCase() === b.trim().toLowerCase()
  const lines = body.split('\n').map(l => l.trim()).filter(l => l && !(title && same(l, title)))

  const blocks: { list: boolean; lines: string[] }[] = []
  for (const line of lines) {
    const list = line.startsWith('•')
    const text = list ? line.replace(/^•\s*/, '') : line
    const last = blocks[blocks.length - 1]
    if (list && last?.list) last.lines.push(text)
    else blocks.push({ list, lines: [text] })
  }

  return (
    <>
      {blocks.map((block, i) =>
        block.list ? (
          <ul key={i} style={{ margin: '0 0 16px', paddingLeft: '20px' }}>
            {block.lines.map((l, j) => (
              <li key={j} style={{ fontSize: '16px', lineHeight: 1.55, margin: '0 0 8px' }}>{withBold(l)}</li>
            ))}
          </ul>
        ) : (
          <p key={i} style={{ fontSize: '16px', lineHeight: 1.55, margin: '0 0 16px' }}>{withBold(block.lines[0])}</p>
        )
      )}
    </>
  )
}

function withBold(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i} style={{ fontWeight: 600 }}>{part}</strong> : <Fragment key={i}>{part}</Fragment>
  )
}
