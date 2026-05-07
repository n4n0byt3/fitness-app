import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Public routes — always accessible
  const publicRoutes = ['/login', '/signup']
  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    // Redirect authenticated users away from auth pages
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const dest = profile?.role === 'pt' ? '/dashboard' : '/portal/dashboard'
      return NextResponse.redirect(new URL(dest, request.url))
    }
    return supabaseResponse
  }

  // Root — redirect based on auth
  if (pathname === '/') {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    const dest = profile?.role === 'pt' ? '/dashboard' : '/portal/dashboard'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  // Protected routes — require auth
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based route protection
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isPT = profile?.role === 'pt'
  const isClient = profile?.role === 'client'

  // PT routes — only accessible by PT
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/clients') ||
      pathname.startsWith('/sessions') || pathname.startsWith('/bookings') ||
      pathname.startsWith('/payments') || pathname.startsWith('/settings')) {
    if (!isPT) {
      return NextResponse.redirect(new URL('/portal/dashboard', request.url))
    }
  }

  // Client portal routes — only accessible by clients
  if (pathname.startsWith('/portal')) {
    if (!isClient) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
