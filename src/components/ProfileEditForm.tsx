'use client'
import { useState, useRef, useTransition } from 'react'
import Image from 'next/image'
import { updateProfile, uploadAvatar } from '@/app/actions/profile'
import type { Locale } from '@/i18n.config'

interface Profile {
  display_name: string
  bio_ar: string | null
  bio_en: string | null
  avatar_url: string | null
  twitter_url: string | null
  linkedin_url: string | null
  youtube_url: string | null
  instagram_url: string | null
  website_url: string | null
}

interface Props {
  profile: Profile
  locale: Locale
  saved?: boolean
}

const inputClass =
  'w-full border border-navy/20 px-4 py-3 text-navy focus:outline-none focus:border-gold transition-colors text-sm bg-white'
const labelClass = 'block text-navy/60 text-xs uppercase tracking-widest mb-2'

export default function ProfileEditForm({ profile, locale, saved }: Props) {
  const isAr = locale === 'ar'
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarLoading(true)
    setAvatarError('')
    const fd = new FormData()
    fd.append('avatar', file)
    const result = await uploadAvatar(fd)
    setAvatarLoading(false)
    if ('error' in result) {
      setAvatarError(result.error)
    } else {
      setAvatarUrl(result.url)
    }
  }

  const labels = {
    title:       isAr ? 'تعديل الملف الشخصي'    : 'Edit Profile',
    name:        isAr ? 'الاسم المعروض'           : 'Display Name',
    bioAr:       isAr ? 'النبذة بالعربية'         : 'Bio (Arabic)',
    bioEn:       isAr ? 'النبذة بالإنجليزية'      : 'Bio (English)',
    avatar:      isAr ? 'الصورة الشخصية'          : 'Profile Picture',
    social:      isAr ? 'روابط التواصل الاجتماعي' : 'Social Links',
    twitter:     isAr ? 'تويتر / X'               : 'Twitter / X',
    linkedin:    isAr ? 'لينكدإن'                 : 'LinkedIn',
    youtube:     isAr ? 'يوتيوب'                  : 'YouTube',
    instagram:   isAr ? 'إنستغرام'                : 'Instagram',
    website:     isAr ? 'الموقع الإلكتروني'       : 'Website',
    save:        isAr ? 'حفظ التغييرات'            : 'Save Changes',
    saving:      isAr ? 'جارٍ الحفظ…'             : 'Saving…',
    savedMsg:    isAr ? 'تم الحفظ بنجاح'           : 'Profile saved',
    uploading:   isAr ? 'جارٍ الرفع…'             : 'Uploading…',
    changePhoto: isAr ? 'تغيير الصورة'             : 'Change photo',
  }

  return (
    <form
      action={updateProfile}
      className="space-y-8"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="avatar_url" value={avatarUrl} />

      {saved && (
        <div className="text-emerald-700 text-sm px-4 py-3 bg-emerald-50 border border-emerald-200">
          {labels.savedMsg}
        </div>
      )}

      {/* Avatar */}
      <div>
        <label className={labelClass}>{labels.avatar}</label>
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-navy/10 flex-shrink-0">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-navy/30 text-3xl select-none">
                {profile.display_name?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="btn-secondary text-xs px-4 py-2"
              disabled={avatarLoading}
            >
              {avatarLoading ? labels.uploading : labels.changePhoto}
            </button>
            {avatarError && <p className="text-red-600 text-xs mt-2">{avatarError}</p>}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>
      </div>

      {/* Display name */}
      <div>
        <label className={labelClass}>{labels.name} <span className="text-red-500">*</span></label>
        <input
          type="text"
          name="display_name"
          required
          defaultValue={profile.display_name}
          className={inputClass}
        />
      </div>

      {/* Bios */}
      <div>
        <label className={`${labelClass} font-arabic`}>{labels.bioAr}</label>
        <textarea
          name="bio_ar"
          rows={4}
          dir="rtl"
          defaultValue={profile.bio_ar ?? ''}
          className={`${inputClass} resize-y font-arabic`}
          placeholder="نبذة قصيرة عنك بالعربية"
        />
      </div>
      <div>
        <label className={labelClass}>{labels.bioEn}</label>
        <textarea
          name="bio_en"
          rows={4}
          dir="ltr"
          defaultValue={profile.bio_en ?? ''}
          className={`${inputClass} resize-y`}
          placeholder="A short bio in English"
        />
      </div>

      {/* Social links */}
      <div>
        <p className="text-gold text-xs uppercase tracking-widest mb-5">{labels.social}</p>
        <div className="space-y-4">
          {[
            { name: 'twitter_url',   label: labels.twitter,   placeholder: 'https://x.com/username',             value: profile.twitter_url },
            { name: 'linkedin_url',  label: labels.linkedin,  placeholder: 'https://linkedin.com/in/username',   value: profile.linkedin_url },
            { name: 'youtube_url',   label: labels.youtube,   placeholder: 'https://youtube.com/@channel',       value: profile.youtube_url },
            { name: 'instagram_url', label: labels.instagram, placeholder: 'https://instagram.com/username',     value: profile.instagram_url },
            { name: 'website_url',   label: labels.website,   placeholder: 'https://yourwebsite.com',            value: profile.website_url },
          ].map(field => (
            <div key={field.name}>
              <label className={labelClass}>{field.label}</label>
              <input
                type="url"
                name={field.name}
                defaultValue={field.value ?? ''}
                placeholder={field.placeholder}
                className={inputClass}
                dir="ltr"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? labels.saving : labels.save}
        </button>
      </div>
    </form>
  )
}
