import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { email, password } = await request.json()

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email dan password harus diisi' },
                { status: 400 }
            )
        }

        // Authenticate user
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (authError) {
            return NextResponse.json(
                { error: 'Email atau password salah' },
                { status: 401 }
            )
        }

        // Get user profile from pengguna table
        const { data: profile, error: profileError } = await supabase
            .from('pengguna')
            .select('id, email, full_name, role, dibuat_pada, password')
            .eq('id', authData.user.id)
            .single()

        if (profileError) {
            return NextResponse.json(
                { error: 'Profile tidak ditemukan' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: authData.user.id,
                    email: authData.user.email,
                },
                profile: profile,
                session: {
                    access_token: authData.session?.access_token,
                    refresh_token: authData.session?.refresh_token,
                    expires_at: authData.session?.expires_at,
                }
            }
        })

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
