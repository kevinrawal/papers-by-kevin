import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import SiteHeader from '../components/SiteHeader'
import { ApiError, api } from '../lib/api'
import { setToken } from '../lib/auth'

/** Not a page in the design — the design's desk was open to anyone with the
 *  URL. Set in the same broadsheet language: masthead, rule, one field. */
export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: string } | null)?.from ?? '/admin'

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { access_token } = await api.login(password)
      setToken(access_token)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reach the press.')
      setBusy(false)
    }
  }

  return (
    <div className="page page--desk">
      <div className="shell shell--desk">
        <SiteHeader
          active="desk"
          dateline={
            <>
              <span>The desk — locked</span>
              <span>Editors only</span>
            </>
          }
        />

        <section style={{ padding: '64px 0 96px', maxWidth: '34ch' }}>
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
              margin: '10px 0 28px',
              color: 'color-mix(in srgb, var(--color-text) 76%, transparent)',
            }}
          >
            Editing is for the author. Everything else on the site is open.
          </p>

          <form onSubmit={submit} style={{ display: 'grid', gap: 18 }}>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="input"
                type="password"
                autoComplete="current-password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <p className="kicker" style={{ margin: 0, color: 'var(--color-accent-2-700)' }}>
                {error}
              </p>
            )}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button type="submit" className="btn btn-primary" disabled={busy || !password}>
                {busy ? 'Checking…' : 'Open the desk'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
