import type { ReactNode } from 'react'

/**
 * Renders plain text written in the admin panel into React nodes, preserving:
 *  - blank-line-separated paragraphs
 *  - single line breaks within a paragraph
 *  - lines starting with "- ", "* " or "• " as a bullet list (can appear right
 *    after a heading/intro line, with no blank line in between)
 *  - **bold** and *italic* / _italic_ inline formatting
 *
 * This is intentionally a small, safe subset (not full markdown) — content
 * always renders as React elements, never raw HTML, so there is no injection risk.
 *
 * "* " only counts as a bullet when followed by whitespace, so it never
 * collides with *italic* (which has no space after the opening asterisk).
 */

const BULLET_PATTERN = /^([-*•])\s+/

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  // Split on **bold**, *italic*, or _italic_ while keeping the delimiters,
  // then rebuild as text / <strong> / <em> nodes.
  const pattern = /(\*\*.+?\*\*|\*.+?\*|_.+?_)/g
  const parts = text.split(pattern).filter((part) => part.length > 0)

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={key}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>
    }
    if (part.startsWith('_') && part.endsWith('_') && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

// Groups a block's lines into ordered runs of either bullet lines or plain
// text lines, so a heading line followed directly by "- " bullets (no blank
// line between them) still renders as a paragraph plus a real list.
function groupLines(lines: string[]): Array<{ type: 'bullets' | 'text'; lines: string[] }> {
  const runs: Array<{ type: 'bullets' | 'text'; lines: string[] }> = []

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (line.length === 0) {
      continue
    }
    const isBullet = BULLET_PATTERN.test(line)
    const type = isBullet ? 'bullets' : 'text'
    const last = runs[runs.length - 1]
    if (last && last.type === type) {
      last.lines.push(line)
    } else {
      runs.push({ type, lines: [line] })
    }
  }

  return runs
}

function renderTextRun(lines: string[], keyPrefix: string): ReactNode {
  const nodes: ReactNode[] = []
  lines.forEach((line, index) => {
    if (index > 0) {
      nodes.push(<br key={`${keyPrefix}-br-${index}`} />)
    }
    nodes.push(...renderInline(line, `${keyPrefix}-line-${index}`))
  })
  return <p key={keyPrefix}>{nodes}</p>
}

function renderBulletRun(lines: string[], keyPrefix: string): ReactNode {
  return (
    <ul className="rich-text-list" key={keyPrefix}>
      {lines.map((line, index) => (
        <li key={`${keyPrefix}-li-${index}`}>
          {renderInline(line.replace(BULLET_PATTERN, ''), `${keyPrefix}-li-${index}`)}
        </li>
      ))}
    </ul>
  )
}

export function renderRichText(content: string): ReactNode[] {
  if (!content) {
    return []
  }

  const blocks = content.split(/\n\s*\n/).filter((block) => block.trim().length > 0)

  return blocks.flatMap((block, blockIndex) => {
    const runs = groupLines(block.split('\n'))
    return runs.map((run, runIndex) => {
      const key = `block-${blockIndex}-run-${runIndex}`
      return run.type === 'bullets' ? renderBulletRun(run.lines, key) : renderTextRun(run.lines, key)
    })
  })
}
