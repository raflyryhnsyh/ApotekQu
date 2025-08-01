import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = await createClient()

        // Get current user
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json(
                { error: 'User tidak terautentikasi' },
                { status: 401 }
            )
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('pengguna')
            .select('id, full_name, email, role, dibuat_pada, username')
            .eq('id', user.id)
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
                    id: user.id,
                    email: user.email,
                },
                profile: profile
            }
        })

    } catch (error) {
        console.error('Profile error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
