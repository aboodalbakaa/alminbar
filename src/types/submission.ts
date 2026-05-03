export type SubmissionStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'published'

export interface Submission {
  id: string
  author_id: string
  title_ar: string
  title_en: string
  excerpt_ar: string | null
  excerpt_en: string | null
  content_ar: string
  content_en: string | null
  topic_ar: string
  topic_en: string
  status: SubmissionStatus
  rejection_reason: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
  profiles?: { display_name: string }
}
