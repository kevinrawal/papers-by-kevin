/** The article body format, ported from the design's Article.dc.html.
 *
 *  Blocks are separated by a blank line:
 *    `## ` a heading   `> ` a pull quote   `- ` a list item   `---` a rule
 *    otherwise a paragraph
 *
 *  A run of `- ` lines that shares one block is expanded into an item each, so
 *  a list typed without blank lines between its items still reads as a list.
 *
 *  Within any block's text, two inline spans are recognized: `**bold**` and
 *  `[text](url)`. Nothing else — no italics, no nested spans, no images.
 */

export type BlockKind = 'head' | 'quote' | 'item' | 'para' | 'rule'

export interface Block {
  kind: BlockKind
  text: string
}

export type Span = { kind: 'text' | 'bold' | 'link'; text: string; href?: string }

function parse(body: string): Block[] {
  return String(body || '')
    .split(/\n\s*\n/)
    .map((raw): Block => {
      const t = raw.trim()
      if (t.startsWith('## ')) return { kind: 'head', text: t.slice(3) }
      if (t.startsWith('> ')) return { kind: 'quote', text: t.slice(2) }
      if (t.startsWith('- ')) return { kind: 'item', text: t.slice(2) }
      if (/^-{3,}$/.test(t)) return { kind: 'rule', text: '' }
      return { kind: 'para', text: t }
    })
    .filter((b) => b.text || b.kind === 'rule')
}

function expand(blocks: Block[]): Block[] {
  const out: Block[] = []
  for (const b of blocks) {
    if (b.kind === 'item' && b.text.includes('\n- ')) {
      for (const line of b.text.split(/\n-\s*/)) {
        if (line.trim()) out.push({ kind: 'item', text: line.trim() })
      }
    } else {
      out.push(b)
    }
  }
  return out
}

export function parseBody(body: string): Block[] {
  return expand(parse(body))
}

const INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g

/** Splits a block's text into plain/bold/link runs for rendering. */
export function parseInline(text: string): Span[] {
  const spans: Span[] = []
  let last = 0
  let match: RegExpExecArray | null
  INLINE.lastIndex = 0
  while ((match = INLINE.exec(text))) {
    if (match.index > last) spans.push({ kind: 'text', text: text.slice(last, match.index) })
    if (match[1] !== undefined) spans.push({ kind: 'bold', text: match[1] })
    else spans.push({ kind: 'link', text: match[2], href: match[3] })
    last = match.index + match[0].length
  }
  if (last < text.length) spans.push({ kind: 'text', text: text.slice(last) })
  return spans
}
