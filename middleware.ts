import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: req.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { pathname } = req.nextUrl

    // Skip middleware for API routes
    if (pathname.startsWith('/api/')) {
        return response
    }

    // Public routes yang tidak perlu authentication
    const publicRoutes = ['/login']

    // Routes yang hanya untuk APA
    const apaOnlyRoutes = ['/APA', '/APA/kelola-pegawai', '/APA/laporan']

    // Routes yang hanya untuk pegawai
    const pegawaiOnlyRoutes = ['/pegawai', '/pegawai/pengadaan', '/pegawai/pengadaan/buat-po', '/pegawai/pengadaan/informasi-po', '/pegawai/pengelolaan', '/pegawai/penjualan']

    const { data: { user }, error } = await supabase.auth.getUser()

    // Jika user belum login dan mengakses protected route
    if (!user && !publicRoutes.includes(pathname)) {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/login'
        redirectUrl.searchParams.set('redirectedFrom', pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // Jika user sudah login, cek role-based access
    if (user) {
        try {
            // Fetch user role from database
            const { data: profile } = await supabase
                .from('pengguna')
                .select('role')
                .eq('id', user.id)
                .maybeSingle()

            const userRole = profile?.role

            // Redirect APA users trying to access pegawai-only routes
            if (userRole === 'APA' && pegawaiOnlyRoutes.includes(pathname)) {
                return NextResponse.redirect(new URL('/APA', req.url))
            }

            // Redirect pegawai users trying to access APA-only routes
            if (userRole === 'Pegawai' && apaOnlyRoutes.includes(pathname)) {
                return NextResponse.redirect(new URL('/pegawai', req.url))
            }
        } catch (error) {
            // Continue without role check if database fails
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}