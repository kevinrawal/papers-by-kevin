import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { api } from '../lib/api'
import { getToken } from '../lib/auth'

type Check = 'checking' | 'ok' | 'denied'

/** Guards the desk. A stored token is only a hint — it is confirmed against
 *  /api/auth/me so an expired one lands on the login screen rather than on a
 *  desk that 401s on every action. */
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [check, setCheck] = useState<Check>(() => (getToken() ? 'checking' : 'denied'))
  const location = useLocation()

  useEffect(() => {
    if (check !== 'checking') return
    let cancelled = false
    api
      .me()
      .then(() => !cancelled && setCheck('ok'))
      .catch(() => !cancelled && setCheck('denied'))
    return () => {
      cancelled = true
    }
  }, [check])

  if (check === 'denied') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }
  if (check === 'checking') {
    return (
      <div className="page page--desk">
        <div className="shell shell--desk">
          <p className="kicker kicker--65" style={{ padding: '48px 0' }}>
            Unlocking the desk…
          </p>
        </div>
      </div>
    )
  }
  return <>{children}</>
}
