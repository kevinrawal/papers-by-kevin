import SiteHeader from '../components/SiteHeader'

// h1–h4 already take the heading face and weight from broadsheet.css, so these
// only restate what the design changes: size, leading, tracking, overhang.
const display: React.CSSProperties = {
  fontSize: 'clamp(38px,5vw,64px)',
  lineHeight: 1.08,
  letterSpacing: '-0.025em',
  margin: '0 0 0 -0.035em',
}

const standfirst: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontStyle: 'italic',
  fontSize: 21,
  lineHeight: '32px',
  margin: '20px 0 0',
  maxWidth: '44ch',
  color: 'color-mix(in srgb, var(--color-text) 82%, transparent)',
}

const column: React.CSSProperties = {
  fontSize: 17,
  lineHeight: '30px',
  margin: 0,
  textAlign: 'justify',
  hyphens: 'auto',
}

const currently: React.CSSProperties = { fontSize: 16, lineHeight: '28px', margin: 0 }

export default function About() {
  return (
    <div className="page">
      <div className="shell">
        <SiteHeader active="about" />

        <section
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '32px clamp(32px,6vw,96px)',
            padding: '64px 0 40px',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ flex: '1 1 420px', minWidth: 0 }}>
            <h1 style={display}>Kevin Rawal</h1>
            <p style={standfirst}>
              AI software engineer. I build systems that call models, and then I find out what
              happens at 3am.
            </p>
          </div>
          <div style={{ display: 'grid', gap: 12, fontSize: 15, lineHeight: '26px', flex: '0 1 260px' }}>
            <span className="kicker kicker--65">Elsewhere</span>
            <a href="mailto:kevinrawal30@gmail.com">kevinrawal30@gmail.com</a>
            <a href="https://github.com/kevinrawal" target="_blank" rel="noreferrer">
              github.com/kevinrawal
            </a>
            <a href="https://www.linkedin.com/in/kevinrawal/" target="_blank" rel="noreferrer">
              linkedin.com/in/kevinrawal
            </a>
          </div>
        </section>

        <hr className="rule-hair" />

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
            gap: '36px clamp(32px,5vw,72px)',
            padding: '48px 0 24px',
          }}
        >
          <p style={column}>
            I work on AI systems — retrieval, evaluation, and the unglamorous plumbing that keeps a
            model-backed feature answering under load. Most of what I know came from shipping
            something that broke in a way I had not imagined, so that is what I write about here:
            the design, the failure, and the correction, in that order.
          </p>
          <p style={column}>
            Alongside that I am working through distributed systems properly — Raft, consensus,
            backpressure, exactly-once as a marketing term. Writing it down is how I find the gaps.
            If a post reads like a lecture, assume I got it wrong in production first.
          </p>
          <p style={column}>
            This site is my notebook kept in public. Nothing here is authoritative; it is a record
            of what I understood on the day I wrote it. Corrections are welcome and get printed at
            the top of the piece.
          </p>
        </section>

        <section style={{ padding: '48px 0 0' }}>
          <span className="kicker kicker--65" style={{ display: 'block' }}>
            What I work with
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 18 }}>
            <span className="tag tag-outline">LLM applications</span>
            <span className="tag tag-outline">Retrieval &amp; evals</span>
            <span className="tag tag-outline">Python</span>
            <span className="tag tag-outline">Go</span>
            <span className="tag tag-outline">Postgres · pgvector</span>
            <span className="tag tag-outline">Kafka</span>
            <span className="tag tag-outline">Kubernetes</span>
            <span className="tag tag-outline">Observability</span>
          </div>
        </section>

        <section style={{ padding: '64px 0 0', maxWidth: '70ch' }}>
          <span className="kicker kicker--65" style={{ display: 'block' }}>
            Currently
          </span>
          <div style={{ display: 'grid', gap: 20, marginTop: 20 }}>
            <p style={currently}>
              <strong>Learning:</strong> consensus and membership changes, the way replicated state
              machines fail in the middle rather than at the edges.
            </p>
            <p style={currently}>
              <strong>Building:</strong> an evaluation harness that scores answers against a rubric
              instead of scoring retrieval against a label set.
            </p>
            <p style={currently}>
              <strong>Reading:</strong> the Raft paper again, and everything Marc Brooker writes
              about timeouts.
            </p>
          </div>
        </section>

        <section style={{ padding: '72px 0 96px' }}>
          <h3
            style={{
              fontSize: 26,
              lineHeight: 1.2,
              letterSpacing: '-0.015em',
              margin: 0,
            }}
          >
            Get in touch
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
            Happy to talk about retrieval quality, queue design, or a post you disagreed with. Email
            is the fastest way to reach me.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
            <a className="btn btn-primary" href="mailto:kevinrawal30@gmail.com">
              Email
            </a>
            <a
              className="btn btn-secondary"
              href="https://www.linkedin.com/in/kevinrawal/"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
            <a
              className="btn btn-secondary"
              href="https://github.com/kevinrawal"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
