import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export type NavKey = 'writing' | 'projects' | 'about' | 'desk'

const LINKS: { key: NavKey; to: string; label: string }[] = [
  { key: 'writing', to: '/', label: 'Writing' },
  { key: 'projects', to: '/projects', label: 'Projects' },
  { key: 'about', to: '/about', label: 'About' },
]

interface Props {
  active: NavKey
  /** The dateline rail under the masthead rule. Home and the desk carry one;
   *  the reading pages stop at the thick-thin pair. */
  dateline?: ReactNode
}

export default function SiteHeader({ active, dateline }: Props) {
  return (
    <header className="masthead">
      <div className="masthead-row">
        <Link to="/" className="brand">
          Kevin Rawal
        </Link>
        <nav className="site-nav">
          {LINKS.map((link) => (
            <Link
              key={link.key}
              to={link.to}
              aria-current={active === link.key ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <hr className="rule-heavy" />
      {dateline !== undefined && (
        <>
          <div className="dateline kicker">{dateline}</div>
          <hr className="rule-hair" />
        </>
      )}
    </header>
  )
}
