import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import SiteHeader from '../components/SiteHeader'
import { ApiError, api } from '../lib/api'
import { clearToken } from '../lib/auth'
import type { Post, Project } from '../lib/types'

type Tab = 'posts' | 'projects'

type Draft =
  | { kind: 'post'; isNew: boolean; value: Post }
  | { kind: 'project'; isNew: boolean; value: Project }

const EMPTY_POST: Post = {
  id: '',
  title: '',
  topic: 'AI Engineering',
  dek: '',
  date: '',
  read: '6 min',
  status: 'draft',
  tags: '',
  body: '',
}

const EMPTY_PROJECT: Project = {
  id: '',
  kind: '',
  name: '',
  blurb: '',
  learned: '',
  stack: '',
  href: 'https://github.com/kevinrawal',
}

/** The design's segmented control is built from plain buttons with an inline
 *  active style, rather than the system's `:has(input:checked)` radios. */
function segStyle(on: boolean): React.CSSProperties {
  return {
    background: on ? 'var(--color-accent)' : 'none',
    border: 0,
    fontFamily: 'var(--font-body)',
    color: on ? 'var(--color-bg)' : 'inherit',
  }
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px 24px',
  alignItems: 'flex-start',
  padding: '20px 0',
  borderBottom: '1px solid var(--color-divider)',
}

const rowActions: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  flex: '0 0 auto',
  marginLeft: 'auto',
}

const rowTitle: React.CSSProperties = {
  fontSize: 21,
  lineHeight: 1.2,
  letterSpacing: '-0.015em',
  margin: '8px 0 0',
}

function currentMonth(): string {
  return new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

export default function Admin() {
  const [tab, setTab] = useState<Tab>('posts')
  const [posts, setPosts] = useState<Post[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [draft, setDraft] = useState<Draft | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [resetArmed, setResetArmed] = useState(false)
  const [saved, setSaved] = useState('')
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const savedTimer = useRef<number | undefined>(undefined)
  const resetTimer = useRef<number | undefined>(undefined)

  useEffect(
    () => () => {
      window.clearTimeout(savedTimer.current)
      window.clearTimeout(resetTimer.current)
    },
    [],
  )

  const flash = useCallback((message: string) => {
    setSaved(message)
    window.clearTimeout(savedTimer.current)
    savedTimer.current = window.setTimeout(() => setSaved(''), 2600)
  }, [])

  const handle = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        navigate('/admin/login', { replace: true })
        return
      }
      setError(err instanceof ApiError ? err.message : 'The press is not answering.')
    },
    [navigate],
  )

  const loadPosts = useCallback(
    () => api.listPosts(true).then(setPosts).catch(handle),
    [handle],
  )
  const loadProjects = useCallback(() => api.listProjects().then(setProjects).catch(handle), [handle])

  useEffect(() => {
    void loadPosts()
    void loadProjects()
  }, [loadPosts, loadProjects])

  const isPosts = tab === 'posts'

  function switchTab(next: Tab) {
    setTab(next)
    setDraft(null)
    setConfirmId(null)
    setError('')
  }

  function startNew() {
    setConfirmId(null)
    setError('')
    setDraft(
      isPosts
        ? { kind: 'post', isNew: true, value: { ...EMPTY_POST, date: currentMonth() } }
        : { kind: 'project', isNew: true, value: { ...EMPTY_PROJECT } },
    )
  }

  function editPost(post: Post) {
    setDraft({ kind: 'post', isNew: false, value: { ...post } })
    setConfirmId(null)
    setError('')
  }

  function editProject(project: Project) {
    setDraft({ kind: 'project', isNew: false, value: { ...project } })
    setConfirmId(null)
    setError('')
  }

  const patchPost = (patch: Partial<Post>) =>
    setDraft((d) => (d && d.kind === 'post' ? { ...d, value: { ...d.value, ...patch } } : d))

  const patchProject = (patch: Partial<Project>) =>
    setDraft((d) => (d && d.kind === 'project' ? { ...d, value: { ...d.value, ...patch } } : d))

  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (!draft) return
    setError('')
    try {
      if (draft.kind === 'post') {
        const { id, ...input } = draft.value
        if (draft.isNew) await api.createPost(input)
        else await api.updatePost(id, input)
        await loadPosts()
        flash('Article saved')
      } else {
        const { id, ...input } = draft.value
        if (draft.isNew) await api.createProject(input)
        else await api.updateProject(id, input)
        await loadProjects()
        flash('Project saved')
      }
      setDraft(null)
    } catch (err) {
      handle(err)
    }
  }

  async function remove(id: string) {
    if (confirmId !== id) {
      setConfirmId(id)
      return
    }
    setError('')
    try {
      if (isPosts) {
        await api.deletePost(id)
        await loadPosts()
      } else {
        await api.deleteProject(id)
        await loadProjects()
      }
      setConfirmId(null)
      setDraft(null)
      flash('Entry spiked')
    } catch (err) {
      handle(err)
    }
  }

  async function resetAll() {
    if (!resetArmed) {
      setResetArmed(true)
      window.clearTimeout(resetTimer.current)
      resetTimer.current = window.setTimeout(() => setResetArmed(false), 4000)
      return
    }
    window.clearTimeout(resetTimer.current)
    setResetArmed(false)
    setError('')
    try {
      await api.reset()
      await Promise.all([loadPosts(), loadProjects()])
      setDraft(null)
      setConfirmId(null)
      flash('Reset to sample')
    } catch (err) {
      handle(err)
    }
  }

  function exportAll() {
    const blob = new Blob([JSON.stringify({ posts, projects }, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'kevin-blog-content.json'
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  function signOut() {
    clearToken()
    navigate('/admin/login', { replace: true })
  }

  const deleteButton = (id: string) => (
    <button
      type="button"
      className={confirmId === id ? 'btn btn-primary' : 'btn btn-ghost'}
      onClick={() => void remove(id)}
    >
      {confirmId === id ? 'Confirm' : 'Delete'}
    </button>
  )

  return (
    <div className="page page--desk">
      <div className="shell shell--desk">
        <SiteHeader
          active="desk"
          dateline={
            <>
              <span>The desk — editing copy</span>
              <span>{`${posts.length} articles · ${projects.length} projects`}</span>
              <span>{saved || 'Saved to the archive'}</span>
            </>
          }
        />

        <section
          style={{
            padding: '40px 0 28px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: 24,
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 'clamp(32px,4vw,52px)',
                lineHeight: 1.08,
                letterSpacing: '-0.025em',
                margin: '0 0 0 -0.035em',
              }}
            >
              The desk
            </h1>
            <p
              style={{
                fontSize: 15.5,
                lineHeight: '28px',
                margin: '10px 0 0',
                maxWidth: '52ch',
                color: 'color-mix(in srgb, var(--color-text) 76%, transparent)',
              }}
            >
              Write, revise and spike entries before they go to press. Everything you save here goes
              straight to the archive.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="seg" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={isPosts}
                className="seg-opt"
                style={segStyle(isPosts)}
                onClick={() => switchTab('posts')}
              >
                Articles
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={!isPosts}
                className="seg-opt"
                style={segStyle(!isPosts)}
                onClick={() => switchTab('projects')}
              >
                Projects
              </button>
            </div>
            <button type="button" className="btn btn-primary" onClick={startNew}>
              {isPosts ? 'New article' : 'New project'}
            </button>
          </div>
        </section>

        {error && (
          <p className="kicker" style={{ margin: '0 0 20px', color: 'var(--color-accent-2-700)' }}>
            {error}
          </p>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,440px),1fr))',
            gap: '40px clamp(28px,4vw,64px)',
            paddingBottom: 96,
            alignItems: 'start',
          }}
        >
          <div>
            {isPosts ? (
              <div>
                <p className="kicker kicker--65" style={{ margin: '0 0 12px' }}>
                  Articles
                </p>
                <hr className="rule-hair" />
                {posts.map((post) => (
                  <div key={post.id} style={rowStyle}>
                    <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                      <span className="kicker kicker--accent" style={{ display: 'block' }}>
                        {post.topic}
                      </span>
                      <h3 style={{ ...rowTitle, maxWidth: '38ch' }}>{post.title || 'Untitled'}</h3>
                      <p className="kicker kicker--60" style={{ margin: '10px 0 0' }}>
                        {[post.date, post.read].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <div style={rowActions}>
                      <span
                        className={post.status === 'draft' ? 'tag tag-outline' : 'tag tag-accent'}
                      >
                        {post.status === 'draft' ? 'Draft' : 'Published'}
                      </span>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => editPost(post)}
                      >
                        Edit
                      </button>
                      {deleteButton(post.id)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <p className="kicker kicker--65" style={{ margin: '0 0 12px' }}>
                  Projects
                </p>
                <hr className="rule-hair" />
                {projects.map((project) => (
                  <div key={project.id} style={rowStyle}>
                    <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                      <span className="kicker kicker--accent" style={{ display: 'block' }}>
                        {project.kind}
                      </span>
                      <h3 style={rowTitle}>{project.name || 'Untitled'}</h3>
                      <p className="kicker kicker--60" style={{ margin: '10px 0 0' }}>
                        {project.stack}
                      </p>
                    </div>
                    <div style={rowActions}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => editProject(project)}
                      >
                        Edit
                      </button>
                      {deleteButton(project.id)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside style={{ minWidth: 0 }}>
            {!draft && (
              <div style={{ padding: '28px 0 0' }}>
                <p className="kicker kicker--65" style={{ margin: 0 }}>
                  Nothing open
                </p>
                <p
                  style={{
                    fontSize: 16,
                    lineHeight: '28px',
                    margin: '14px 0 0',
                    maxWidth: '36ch',
                    color: 'color-mix(in srgb, var(--color-text) 78%, transparent)',
                  }}
                >
                  Pick an entry to revise, or start a new one. Saved work reappears on the public
                  pages immediately.
                </p>
              </div>
            )}

            {draft?.kind === 'post' && (
              <form onSubmit={save} style={{ display: 'grid', gap: 18, padding: '4px 0 0' }}>
                <p className="kicker kicker--accent" style={{ margin: 0 }}>
                  {draft.isNew ? 'New article' : 'Editing'}
                </p>
                <div className="field">
                  <label htmlFor="a-title">Headline</label>
                  <input
                    id="a-title"
                    className="input"
                    value={draft.value.title}
                    onChange={(e) => patchPost({ title: e.target.value })}
                    placeholder="What happened, plainly"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="field">
                    <label htmlFor="a-topic">Topic</label>
                    <input
                      id="a-topic"
                      className="input"
                      list="topics"
                      value={draft.value.topic}
                      onChange={(e) => patchPost({ topic: e.target.value })}
                      placeholder="AI Engineering"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="a-date">Date</label>
                    <input
                      id="a-date"
                      className="input"
                      value={draft.value.date}
                      onChange={(e) => patchPost({ date: e.target.value })}
                      placeholder="Aug 2026"
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="field">
                    <label htmlFor="a-read">Read time</label>
                    <input
                      id="a-read"
                      className="input"
                      value={draft.value.read}
                      onChange={(e) => patchPost({ read: e.target.value })}
                      placeholder="8 min"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="a-tags">Tags</label>
                    <input
                      id="a-tags"
                      className="input"
                      value={draft.value.tags}
                      onChange={(e) => patchPost({ tags: e.target.value })}
                      placeholder="Retrieval, Evals"
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="a-dek">Standfirst</label>
                  <textarea
                    id="a-dek"
                    className="input"
                    rows={2}
                    value={draft.value.dek}
                    onChange={(e) => patchPost({ dek: e.target.value })}
                    placeholder="One sentence that says the finding"
                  />
                </div>
                <div className="field">
                  <label htmlFor="a-body">Body</label>
                  <textarea
                    id="a-body"
                    className="input"
                    rows={14}
                    value={draft.value.body}
                    onChange={(e) => patchPost({ body: e.target.value })}
                    placeholder="Plain paragraphs. ## for a heading, > for a pull quote, - for a list item."
                  />
                </div>
                <div className="field">
                  <label>Status</label>
                  <div className="seg">
                    <button
                      type="button"
                      className="seg-opt"
                      aria-pressed={draft.value.status === 'draft'}
                      style={segStyle(draft.value.status === 'draft')}
                      onClick={() => patchPost({ status: 'draft' })}
                    >
                      Draft
                    </button>
                    <button
                      type="button"
                      className="seg-opt"
                      aria-pressed={draft.value.status === 'published'}
                      style={segStyle(draft.value.status === 'published')}
                      onClick={() => patchPost({ status: 'published' })}
                    >
                      Published
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 4 }}>
                  <button type="submit" className="btn btn-primary">
                    Save entry
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setDraft(null)}>
                    Cancel
                  </button>
                  <Link
                    className="btn btn-ghost"
                    to={draft.value.id ? `/article/${draft.value.id}` : '/'}
                    style={{ marginLeft: 'auto' }}
                  >
                    Preview
                  </Link>
                </div>
              </form>
            )}

            {draft?.kind === 'project' && (
              <form onSubmit={save} style={{ display: 'grid', gap: 18, padding: '4px 0 0' }}>
                <p className="kicker kicker--accent" style={{ margin: 0 }}>
                  {draft.isNew ? 'New project' : 'Editing'}
                </p>
                <div className="field">
                  <label htmlFor="p-name">Name</label>
                  <input
                    id="p-name"
                    className="input"
                    value={draft.value.name}
                    onChange={(e) => patchProject({ name: e.target.value })}
                    placeholder="Rafter"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="field">
                    <label htmlFor="p-kind">Kind</label>
                    <input
                      id="p-kind"
                      className="input"
                      value={draft.value.kind}
                      onChange={(e) => patchProject({ kind: e.target.value })}
                      placeholder="Distributed Systems"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="p-stack">Stack</label>
                    <input
                      id="p-stack"
                      className="input"
                      value={draft.value.stack}
                      onChange={(e) => patchProject({ stack: e.target.value })}
                      placeholder="Go · Redis"
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="p-blurb">What it is</label>
                  <textarea
                    id="p-blurb"
                    className="input"
                    rows={4}
                    value={draft.value.blurb}
                    onChange={(e) => patchProject({ blurb: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label htmlFor="p-learned">What it taught me</label>
                  <textarea
                    id="p-learned"
                    className="input"
                    rows={3}
                    value={draft.value.learned}
                    onChange={(e) => patchProject({ learned: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label htmlFor="p-href">Link</label>
                  <input
                    id="p-href"
                    className="input"
                    value={draft.value.href}
                    onChange={(e) => patchProject({ href: e.target.value })}
                    placeholder="https://github.com/…"
                  />
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 4 }}>
                  <button type="submit" className="btn btn-primary">
                    Save project
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setDraft(null)}>
                    Cancel
                  </button>
                  <Link className="btn btn-ghost" to="/projects" style={{ marginLeft: 'auto' }}>
                    Preview
                  </Link>
                </div>
              </form>
            )}

            <div style={{ padding: '36px 0 0' }}>
              <hr className="rule-divider" style={{ margin: '0 0 20px' }} />
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-ghost" onClick={exportAll}>
                  Export JSON
                </button>
                <button
                  type="button"
                  className={resetArmed ? 'btn btn-primary' : 'btn btn-ghost'}
                  onClick={() => void resetAll()}
                >
                  {resetArmed ? 'Confirm reset' : 'Reset to sample'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={signOut}
                  style={{ marginLeft: 'auto' }}
                >
                  Sign out
                </button>
              </div>
            </div>
          </aside>
        </div>

        <datalist id="topics">
          <option value="AI Engineering" />
          <option value="Distributed Systems" />
          <option value="Work Log" />
          <option value="Career" />
        </datalist>
      </div>
    </div>
  )
}
