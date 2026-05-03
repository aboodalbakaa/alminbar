export type Role = 'reader' | 'contributor' | 'editor' | 'admin'

export interface Profile {
  id: string
  display_name: string
  bio_ar: string | null
  bio_en: string | null
  role: Role
  avatar_url: string | null
  created_at: string
  updated_at: string
}
