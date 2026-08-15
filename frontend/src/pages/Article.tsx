import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import SiteHeader from '../components/SiteHeader'
import { api } from '../lib/api'
import { parseBody, parseInline } from '../lib/parseBody'
import type { Block } from '../lib/parseBody'
import type { Post } from '../lib/types'

const body: React.CSSProperties = { fontSize: 17, lineHeight: '30px' }

type Load = 'loading' | 'found' | 'missing'

/** Renders a block's text as plain/bold/link runs — see parseInline. */
function renderSpans(text: string, keyPrefix: string) {
  return parseInline(text).map((span, i) => {
    const key = `${keyPrefix}-${i}`
    if (span.kind === 'bold') return <strong key={key}>{span.text}</strong>
    if (span.kind === 'link') {
      const external = /^https?:\/\//.test(span.href ?? '')
      return (
        <a
          key={key}
          href={span.href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noreferrer' : undefined}
          style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}
        >
          {span.text}
        </a>
      )
    }
    return span.text
  })
}

/** Groups consecutive `item` blocks into one <ul>, and turns `rule` blocks
 *  into a divider — everything else renders one-for-one. */
function renderBody(blocks: Block[]) {
  const nodes: React.ReactNode[] = []
  let i = 0
  while (i < blocks.length) {
    const block = blocks[i]

    if (block.kind === 'item') {
      const start = i
      const items: Block[] = []
      while (i < blocks.length && blocks[i].kind === 'item') {
        items.push(blocks[i])
        i++
      }
      nodes.push(
        <ul key={`list-${start}`} style={{ listStyle: 'none', margin: '14px 0 0', padding: 0 }}>
          {items.map((item, j) => (
            <li
              key={j}
              style={{ ...body, margin: j === 0 ? 0 : '14px 0 0', paddingLeft: 24, textIndent: -24 }}
            >
              — {renderSpans(item.text, `item-${start}-${j}`)}
            </li>
          ))}
        </ul>,
      )
      continue
    }

    if (block.kind === 'rule') {
      nodes.push(<hr key={i} className="rule-divider" style={{ margin: '32px 0 0' }} />)
      i++
      continue
    }

    if (block.kind === 'head') {
      nodes.push(
        <h2
          key={i}
          style={{ fontSize: 26, lineHeight: 1.2, letterSpacing: '-0.015em', margin: '44px 0 0' }}
        >
          {renderSpans(block.text, `head-${i}`)}
        </h2>,
      )
      i++
      continue
    }

    if (block.kind === 'quote') {
      nodes.push(
        <blockquote
          key={i}
          className="heading-face"
          style={{
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 26,
            lineHeight: '38px',
            letterSpacing: '-0.01em',
            maxWidth: '30ch',
            margin: '44px 0',
            textIndent: '-0.475em',
          }}
        >
          {renderSpans(block.text, `quote-${i}`)}
        </blockquote>,
      )
      i++
      continue
    }

    nodes.push(
      <p key={i} style={{ ...body, margin: '18px 0 0' }}>
        {renderSpans(block.text, `para-${i}`)}
      </p>,
    )
    i++
  }
  return nodes
}

export default function Article() {
  const { id = '' } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [others, setOthers] = useState<Post[]>([])
  const [load, setLoad] = useState<Load>('loading')

  useEffect(() => {
    let cancelled = false
    setLoad('loading')
    api
      .getPost(id)
      .then((found) => {
        if (cancelled) return
        setPost(found)
        setLoad('found')
      })
      .catch(() => !cancelled && setLoad('missing'))
    api
      .listPosts()
      .then((rows) => !cancelled && setOthers(rows))
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [id])

  const blocks = useMemo(() => (post ? parseBody(post.body) : []), [post])
  const headings = blocks.filter((b) => b.kind === 'head')
  const tags = (post?.tags || post?.topic || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const next = [
    ...others
      .filter((x) => x.id !== post?.id)
      .slice(0, 3)
      .map((x) => ({ topic: x.topic, title: x.title, to: `/article/${x.id}` })),
    { topic: 'Archive', title: 'All entries →', to: '/' },
  ].slice(0, 3)

  if (load !== 'found' || !post) {
    return (
      <div className="page">
        <div className="shell">
          <SiteHeader active="writing" />
          <section style={{ padding: '64px 0 96px' }}>
            {load === 'loading' ? (
              <p className="kicker kicker--65">Setting the type…</p>
            ) : (
              <>
                <h1 style={{ fontSize: 'clamp(34px,4.4vw,56px)', lineHeight: 1.1, margin: 0 }}>
                  Not in this edition
                </h1>
                <p
                  style={{
                    ...body,
                    margin: '20px 0 32px',
                    maxWidth: '52ch',
                    color: 'color-mix(in srgb, var(--color-text) 78%, transparent)',
                  }}
                >
                  That entry has been spiked, or was never set. The archive is still open.
                </p>
                <Link className="btn btn-primary" to="/">
                  Back to the archive
                </Link>
              </>
            )}
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="shell">
        <SiteHeader active="writing" />

        <article style={{ padding: '56px 0 0', maxWidth: '70ch' }}>
          <span className="kicker kicker--accent">
            {post.topic}
            {post.status === 'draft' ? ' · Draft' : ''}
          </span>
          <h1
            style={{
              fontSize: 'clamp(34px,4.4vw,56px)',
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
              margin: '20px 0 0 -0.035em',
            }}
          >
            {post.title}
          </h1>
          <p
            className="heading-face"
            style={{
              fontStyle: 'italic',
              fontSize: 21,
              lineHeight: '32px',
              margin: '24px 0 0',
              maxWidth: '52ch',
              color: 'color-mix(in srgb, var(--color-text) 82%, transparent)',
            }}
          >
            {post.dek}
          </p>
          <p className="kicker kicker--60" style={{ margin: '32px 0 0' }}>
            {['Kevin Raval', post.date, post.read ? `${post.read} read` : '']
              .filter(Boolean)
              .join(' · ')}
          </p>
          <hr className="rule-hair" style={{ margin: '24px 0 0' }} />
        </article>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '48px clamp(32px,6vw,88px)',
            padding: '40px 0 0',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ flex: '1 1 460px', minWidth: 0, maxWidth: '70ch' }}>
            {renderBody(blocks)}

            <hr className="rule-hair" style={{ margin: '56px 0 0' }} />
            <p
              style={{
                fontSize: 15.5,
                lineHeight: '28px',
                margin: '24px 0 0',
                maxWidth: '52ch',
                color: 'color-mix(in srgb, var(--color-text) 78%, transparent)',
              }}
            >
              Working on something similar, or think I got this wrong?{' '}
              <a
                href="mailto:kevinrawal30@gmail.com"
                style={{
                  color: 'var(--color-accent-700)',
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                }}
              >
                Write to me
              </a>{' '}
              — corrections get printed here.
            </p>
          </div>

          <aside style={{ flex: '0 1 220px', minWidth: 0, fontSize: 14, lineHeight: '26px' }}>
            <span className="kicker kicker--65" style={{ display: 'block' }}>
              In this piece
            </span>
            <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
              {headings.map((heading, i) => (
                <span key={i} style={{ color: 'color-mix(in srgb, var(--color-text) 80%, transparent)' }}>
                  {renderSpans(heading.text, `toc-${i}`)}
                </span>
              ))}
            </div>

            <span className="kicker kicker--65" style={{ display: 'block', marginTop: 40 }}>
              Filed under
            </span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
              {tags.map((tag, i) => (
                <span key={tag} className={`tag ${i === 0 ? 'tag-accent' : 'tag-outline'}`}>
                  {tag}
                </span>
              ))}
            </div>
          </aside>
        </div>

        <section style={{ padding: '88px 0 96px' }}>
          <span className="kicker kicker--65" style={{ display: 'block' }}>
            Read next
          </span>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
              gap: 32,
              marginTop: 24,
            }}
          >
            {next.map((item) => (
              <Link key={item.to + item.title} to={item.to}>
                <span
                  className="kicker kicker--accent"
                  style={{ display: 'block', lineHeight: 'normal' }}
                >
                  {item.topic}
                </span>
                <h3
                  style={{
                    fontSize: 22,
                    lineHeight: 1.2,
                    letterSpacing: '-0.015em',
                    margin: '10px 0 0',
                  }}
                >
                  {item.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
