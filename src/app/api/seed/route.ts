import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { seedGovernment } from '@/lib/scrapers/seed'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const CRON_SECRET = process.env.CRON_SECRET

function isAuthorized(req: NextRequest) {
  if (!CRON_SECRET) return false
  const authHeader = req.headers.get('authorization')
  const querySecret = req.nextUrl.searchParams.get('secret')
  return authHeader === `Bearer ${CRON_SECRET}` || querySecret === CRON_SECRET
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const admin = createAdminClient()
  const result = await seedGovernment(admin)
  return NextResponse.json({ ok: true, seeded_at: new Date().toISOString(), ...result })
}

export async function GET(req: NextRequest) {
  return POST(req)
}
