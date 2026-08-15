import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import SiteHeader from '../components/SiteHeader'
import { api } from '../lib/api'
import type { Post } from '../lib/types'

const ALL = 'All'

function issueDate(): string {
  return new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loaded, setLoaded] = useState(false)
  const [topic, setTopic] = useState(ALL)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    api
      .listPosts()
      .then((rows) => !cancelled && setPosts(rows))
      .catch(() => undefined)
      .finally(() => !cancelled && setLoaded(true))
    return () => {
      cancelled = true
    }
  }, [])

  // The design hardcoded its five chips; deriving them means a new topic gets
  // a chip the moment an entry is filed under it.
  const topics = useMemo(() => {
    const seen: string[] = []
    for (const post of posts) {
      if (post.topic && !seen.includes(post.topic)) seen.push(post.topic)
    }
    return [ALL, ...seen]
  }, [posts])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter(
      (post) =>
        (topic === ALL || post.topic === topic) &&
        (!q || `${post.title} ${post.dek} ${post.topic}`.toLowerCase().includes(q)),
    )
  }, [posts, topic, query])

  const countLine =
    `${visible.length}${visible.length === 1 ? ' entry' : ' entries'}` +
    (topic === ALL ? '' : ` in ${topic}`) +
    (query.trim() ? ` matching “${query.trim()}”` : '')

  return (
    <div className="page">
      <div className="shell">
        <SiteHeader
          active="writing"
          dateline={
            <>
              <span>AI Software Engineer</span>
              <span>Notes on AI, systems &amp; incidents</span>
              <span>Written as I learn &amp; grow</span>
              <span>{`No. ${posts.length} · ${issueDate()}`}</span>
            </>
          }
        />

        <section style={{ padding: '64px 0 48px' }}>
          <h1
            style={{
              fontSize: 'clamp(40px,5.6vw,72px)',
              lineHeight: 1.08,
              letterSpacing: '-0.025em',
              margin: '0 0 0 -0.035em',
              maxWidth: '16ch',
            }}
          >
            <span style={{ display: 'block' }}>Notes on</span>
            <span style={{ display: 'block' }}>Software Engineering, AI and the systems.</span>          </h1>
          <p
            style={{
              fontSize: 17,
              lineHeight: '28px',
              maxWidth: '56ch',
              margin: '28px 0 0',
              color: 'color-mix(in srgb, var(--color-text) 80%, transparent)',
            }}
          >
           I am learning and building distributed systems and Agentic AI applications. I write about my learnings and things I build.
          </p>
        </section>

        <section style={{ padding: '0 0 24px' }}>
          <div
            style={{
              display: 'flex',
              gap: 20,
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {topics.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setTopic(label)}
                  aria-pressed={topic === label}
                  className={`tag ${topic === label ? 'tag-accent' : 'tag-outline'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              className="input"
              type="search"
              placeholder="Search the archive"
              aria-label="Search articles"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: 240, fontFamily: 'var(--font-body)' }}
            />
          </div>
          <p className="kicker kicker--65" style={{ margin: '24px 0 0' }}>
            {countLine}
          </p>
          <hr className="rule-hair" style={{ margin: '12px 0 0' }} />
        </section>

        <section>
          {visible.map((post, i) => (
            <Link key={post.id} to={`/article/${post.id}`} className="entry">
              <span
                className="heading-face"
                style={{
                  fontSize: 17,
                  color: 'color-mix(in srgb, var(--color-text) 50%, transparent)',
                  fontFeatureSettings: "'tnum' 1",
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <span className="kicker kicker--accent" style={{ display: 'block' }}>
                  {post.topic}
                </span>
                <h2
                  style={{
                    fontSize: 28,
                    lineHeight: 1.18,
                    letterSpacing: '-0.015em',
                    margin: '10px 0 0',
                    maxWidth: '26ch',
                  }}
                >
                  {post.title}
                </h2>
                <p
                  style={{
                    fontSize: 15.5,
                    lineHeight: '28px',
                    margin: '8px 0 0',
                    maxWidth: '60ch',
                    color: 'color-mix(in srgb, var(--color-text) 78%, transparent)',
                  }}
                >
                  {post.dek}
                </p>
                <p className="kicker kicker--60" style={{ margin: '16px 0 0' }}>
                  {[post.date, post.read].filter(Boolean).join(' · ')}
                </p>
              </div>
            </Link>
          ))}
          {loaded && visible.length === 0 && (
            <p
              style={{
                fontSize: 17,
                lineHeight: '28px',
                padding: '48px 0',
                color: 'color-mix(in srgb, var(--color-text) 70%, transparent)',
              }}
            >
              Nothing filed under that yet. Try another word, or clear the filter.
            </p>
          )}
        </section>

        <section style={{ padding: '80px 0 96px' }}>
          <h3 style={{ fontSize: 26, lineHeight: 1.2, letterSpacing: '-0.015em', margin: 0 }}>
            Say hello
          </h3>
          <p
            style={{
              fontSize: 15.5,
              lineHeight: '28px',
              margin: '12px 0 0',
              maxWidth: '50ch',
              color: 'color-mix(in srgb, var(--color-text) 78%, transparent)',
            }}
          >
            If you are working on retrieval, queues, or anything that pages someone at 3am, I would
            like to hear about it.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
            <a className="btn btn-primary" href="mailto:kevinrawal30@gmail.com">
              Email
            </a>
            <a
              className="btn btn-secondary"
              href="https://github.com/kevinrawal"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              className="btn btn-secondary"
              href="https://www.linkedin.com/in/kevinrawal/"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          </div>
          <p className="kicker kicker--55" style={{ margin: '56px 0 0' }}>
            Kevin Raval — A passionate software engineer.
          </p>
        </section>
      </div>
    </div>
  )
}
