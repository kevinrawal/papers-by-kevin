export type Status = 'draft' | 'published'

/** Mirrors PostOut in backend/app/schemas.py. `date` and `read` are display
 *  copy ("Jul 2026", "12 min"), not machine values. */
export interface Post {
  id: string
  title: string
  topic: string
  dek: string
  date: string
  read: string
  status: Status
  tags: string
  body: string
}

/** Mirrors ProjectOut. */
export interface Project {
  id: string
  kind: string
  name: string
  blurb: string
  learned: string
  stack: string
  href: string
}

export type PostInput = Omit<Post, 'id'>
export type ProjectInput = Omit<Project, 'id'>
