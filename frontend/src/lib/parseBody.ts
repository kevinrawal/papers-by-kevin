/** The article body format, ported from the design's Article.dc.html.
 *
 *  Blocks are separated by a blank line:
 *    `## ` a heading   `> ` a pull quote   `- ` a list item   otherwise a paragraph
 *
 *  A run of `- ` lines that shares one block is expanded into an item each, so
 *  a list typed without blank lines between its items still reads as a list.
 */

export type BlockKind = 'head' | 'quote' | 'item' | 'para'

export interface Block {
  kind: BlockKind
  text: string
}

function parse(body: string): Block[] {
  return String(body || '')
    .split(/\n\s*\n/)
    .map((raw): Block => {
      const t = raw.trim()
      if (t.startsWith('## ')) return { kind: 'head', text: t.slice(3) }
      if (t.startsWith('> ')) return { kind: 'quote', text: t.slice(2) }
      if (t.startsWith('- ')) return { kind: 'item', text: t.slice(2) }
      return { kind: 'para', text: t }
    })
    .filter((b) => b.text)
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
