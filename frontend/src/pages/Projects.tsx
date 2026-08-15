import { useEffect, useState } from 'react'

import SiteHeader from '../components/SiteHeader'
import { api } from '../lib/api'
import type { Project } from '../lib/types'

const display: React.CSSProperties = {
  fontSize: 'clamp(38px,5vw,64px)',
  lineHeight: 1.08,
  letterSpacing: '-0.025em',
  margin: '0 0 0 -0.035em',
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .listProjects()
      .then((rows) => !cancelled && setProjects(rows))
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="page">
      <div className="shell">
        <SiteHeader active="projects" />

        <section style={{ padding: '64px 0 40px' }}>
          <h1 style={display}>
            Things I built
          </h1>
          <p
            style={{
              fontSize: 17,
              lineHeight: '28px',
              maxWidth: '54ch',
              margin: '24px 0 0',
              color: 'color-mix(in srgb, var(--color-text) 80%, transparent)',
            }}
          >
            Mostly build with curiosity and Learning in mind. Some of these may be solving real problems, some are just experiments.
          </p>
        </section>

        <section style={{ paddingBottom: 24 }}>
          {failed && (
            <p className="kicker kicker--65" style={{ padding: '48px 0' }}>
              The workshop is not answering.
            </p>
          )}
          {projects?.map((project) => (
            <div
              key={project.id}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px 48px',
                padding: '36px 0',
                borderTop: '1px solid var(--color-divider)',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ flex: '1 1 320px', minWidth: 0 }}>
                <span className="kicker kicker--accent" style={{ display: 'block' }}>
                  {project.kind}
                </span>
                <h2
                  style={{
                    fontSize: 30,
                    lineHeight: 1.16,
                    letterSpacing: '-0.02em',
                    margin: '10px 0 0',
                  }}
                >
                  {project.name}
                </h2>
                <p
                  style={{
                    fontSize: 16,
                    lineHeight: '28px',
                    margin: '10px 0 0',
                    maxWidth: '56ch',
                    color: 'color-mix(in srgb, var(--color-text) 80%, transparent)',
                  }}
                >
                  {project.blurb}
                </p>
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: '26px',
                    margin: '12px 0 0',
                    maxWidth: '56ch',
                    color: 'color-mix(in srgb, var(--color-text) 70%, transparent)',
                  }}
                >
                  <em>{project.learned}</em>
                </p>
              </div>
              <div style={{ display: 'grid', gap: 16, justifyItems: 'start', flex: '0 1 260px' }}>
                <span
                  style={{
                    fontSize: 12.5,
                    lineHeight: '20px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'color-mix(in srgb, var(--color-text) 62%, transparent)',
                  }}
                >
                  {project.stack}
                </span>
                {project.href && (
                  <a className="btn btn-secondary" href={project.href} target="_blank" rel="noreferrer">
                    Source
                  </a>
                )}
              </div>
            </div>
          ))}
          <hr className="rule-divider" />
        </section>

        <section style={{ padding: '72px 0 96px' }}>
          <h3 style={{ fontSize: 26, lineHeight: 1.2, letterSpacing: '-0.015em', margin: 0 }}>
            More on GitHub
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
            Half-finished experiments live there too — the reading list repo is the honest one.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
            <a
              className="btn btn-primary"
              href="https://github.com/kevinrawal"
              target="_blank"
              rel="noreferrer"
            >
              github.com/kevinrawal
            </a>
            <a className="btn btn-ghost" href="mailto:kevinrawal30@gmail.com">
              Email me
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
