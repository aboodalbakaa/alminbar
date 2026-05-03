export type Role = 'reader' | 'contributor' | 'editor' | 'admin'

export interface Profile {
  id: string
  display_name: string
  bio_ar: string | null
  bio_en: string | null
  role: Role
  avatar_url: string | null
  twitter_url: string | null
  linkedin_url: string | null
  youtube_url: string | null
  instagram_url: string | null
  website_url: string | null
  created_at: string
  updated_at: string
}
