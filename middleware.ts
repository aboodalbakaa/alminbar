import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['ar', 'en'] as const
type Locale = (typeof locales)[number]
const defaultLocale: Locale = 'ar'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const currentLocale = locales.find(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (currentLocale) {
    const response = NextResponse.next()
    response.headers.set('x-locale', currentLocale)
    return response
  }

  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  const locale: Locale = locales.includes(cookieLocale as Locale)
    ? (cookieLocale as Locale)
    : defaultLocale

  const redirectUrl = new URL(
    `/${locale}${pathname === '/' ? '' : pathname}`,
    request.url,
  )

  const response = NextResponse.redirect(redirectUrl)
  response.headers.set('x-locale', locale)
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|locales|.*\\..*).*)',
  ],
}
