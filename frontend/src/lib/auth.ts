const TOKEN_KEY = 'kr-blog:token'

/** The admin JWT lives in localStorage. That is readable by any script on the
 *  origin, which is an accepted trade for a single-author site with no other
 *  scripts; an httpOnly cookie is the upgrade if that ever stops being true. */
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* private mode — the session simply will not persist */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* nothing to do */
  }
}
