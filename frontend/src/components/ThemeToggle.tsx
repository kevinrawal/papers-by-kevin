import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

function storedTheme(): Theme | null {
  const v = localStorage.getItem('theme')
  return v === 'light' || v === 'dark' ? v : null
}

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** A light/dark toggle. Until clicked, the page follows the system
 *  preference (handled purely in CSS — see site.css); clicking sets an
 *  explicit choice that persists and overrides the system from then on. */
export default function ThemeToggle() {
  const [override, setOverride] = useState<Theme | null>(storedTheme)
  const [system, setSystem] = useState<Theme>(systemTheme)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystem(mq.matches ? 'dark' : 'light')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (override) {
      document.documentElement.dataset.theme = override
      localStorage.setItem('theme', override)
    } else {
      delete document.documentElement.dataset.theme
      localStorage.removeItem('theme')
    }
  }, [override])

  const effective = override ?? system

  return (
    <button
      type="button"
      className="btn btn-ghost btn-icon theme-toggle"
      aria-label={effective === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setOverride(effective === 'dark' ? 'light' : 'dark')}
    >
      {effective === 'dark' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2.5v2.5M12 19v2.5M4.22 4.22l1.77 1.77M18 18l1.77 1.77M2.5 12H5M19 12h2.5M4.22 19.78L6 18M18 6l1.77-1.77" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.4 14.73A8.5 8.5 0 1 1 9.27 3.6a7 7 0 0 0 11.13 11.13Z" />
        </svg>
      )}
    </button>
  )
}
