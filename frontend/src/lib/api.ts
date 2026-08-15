import { clearToken, getToken } from './auth'
import type { Post, PostInput, Project, ProjectInput } from './types'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body) headers.set('Content-Type', 'application/json')

  // The token rides along on public reads too — that is what lets the desk
  // preview an unpublished draft at its real article URL.
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(path, { ...init, headers })

  if (response.status === 401) {
    clearToken()
    throw new ApiError(401, await readDetail(response, 'Not signed in at the desk'))
  }
  if (!response.ok) {
    throw new ApiError(response.status, await readDetail(response, response.statusText))
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

async function readDetail(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json()
    return typeof body?.detail === 'string' ? body.detail : fallback
  } catch {
    return fallback
  }
}

export const api = {
  listPosts: (includeDrafts = false) =>
    request<Post[]>(`/api/posts${includeDrafts ? '?include_drafts=true' : ''}`),
  getPost: (id: string) => request<Post>(`/api/posts/${encodeURIComponent(id)}`),
  createPost: (post: PostInput) =>
    request<Post>('/api/posts', { method: 'POST', body: JSON.stringify(post) }),
  updatePost: (id: string, post: PostInput) =>
    request<Post>(`/api/posts/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(post),
    }),
  deletePost: (id: string) =>
    request<void>(`/api/posts/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  listProjects: () => request<Project[]>('/api/projects'),
  createProject: (project: ProjectInput) =>
    request<Project>('/api/projects', { method: 'POST', body: JSON.stringify(project) }),
  updateProject: (id: string, project: ProjectInput) =>
    request<Project>(`/api/projects/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    }),
  deleteProject: (id: string) =>
    request<void>(`/api/projects/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  login: (password: string) =>
    request<{ access_token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),
  me: () => request<{ admin: boolean }>('/api/auth/me'),
}
