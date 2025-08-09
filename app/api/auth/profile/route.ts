import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

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
            .select('id, full_name, email, role, dibuat_pada')
            .eq('id', user.id)
            .single()

        let finalProfile = profile;

        if (profileError) {
            console.log('Profile not found for user:', user.id, 'Error:', profileError);

            // Try to create profile automatically
            const { data: newProfile, error: createError } = await supabase
                .from('pengguna')
                .insert([
                    {
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
                        username: user.email?.split('@')[0] || 'user',
                        role: 'PEGAWAI', // Default role
                        dibuat_pada: new Date().toISOString()
                    }
                ])
                .select('id, full_name, email, role, dibuat_pada, username')
                .single();

            if (createError) {
                console.error('Failed to create profile:', createError);
                return NextResponse.json(
                    { error: 'Profile tidak ditemukan dan gagal dibuat: ' + createError.message },
                    { status: 404 }
                )
            }

            finalProfile = newProfile;
            console.log('Profile created successfully for user:', user.id);
        }

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                },
                profile: finalProfile
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
