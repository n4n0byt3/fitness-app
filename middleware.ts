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

  const pathname = request.nextUrl.pathname

  // Always allow public auth routes through — never loop on these
  if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    return supabaseResponse
  }

  // Check auth
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  // Not authenticated → send to login
  if (userError || !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Root → redirect based on role
  if (pathname === '/') {
    let role = 'client'
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (data?.role) role = data.role
    } catch {}
    const url = request.nextUrl.clone()
    url.pathname = role === 'pt' ? '/dashboard' : '/portal/dashboard'
    return NextResponse.redirect(url)
  }

  // Role-based protection — only enforce if we can read the profile
  // If profile query fails (e.g. schema not yet applied), let page-level auth handle it
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) return supabaseResponse

    const isPT = profile.role === 'pt'
    const isClient = profile.role === 'client'

    const ptOnlyPaths = ['/dashboard', '/clients', '/sessions', '/bookings', '/payments', '/settings']
    const clientOnlyPaths = ['/portal']

    if (ptOnlyPaths.some(p => pathname.startsWith(p)) && !isPT) {
      const url = request.nextUrl.clone()
      url.pathname = '/portal/dashboard'
      return NextResponse.redirect(url)
    }

    if (clientOnlyPaths.some(p => pathname.startsWith(p)) && !isClient) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  } catch {
    // Schema not ready — allow through, page layouts will handle auth
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
