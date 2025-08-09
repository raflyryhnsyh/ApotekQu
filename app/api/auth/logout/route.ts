import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
    try {
        const supabase = await createClient()

        // Sign out user
        const { error } = await supabase.auth.signOut()

        if (error) {
            return NextResponse.json(
                { error: 'Gagal logout' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Logout berhasil'
        })

    } catch (error) {
        console.error('Logout error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
