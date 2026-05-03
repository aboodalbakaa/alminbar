export type CommentStatus = 'pending' | 'approved' | 'rejected'

export interface Comment {
  id: string
  article_slug: string
  author_id: string
  body: string
  status: CommentStatus
  parent_id: string | null
  created_at: string
  profiles?: { display_name: string }
}
