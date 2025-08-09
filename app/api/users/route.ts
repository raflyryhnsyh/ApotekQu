import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const searchParams = request.nextUrl.searchParams;
        const role = searchParams.get('role');

        // Build query
        let query = supabase
            .from('pengguna')
            .select('id, full_name, email, dibuat_pada, role')
            .order('dibuat_pada', { ascending: false });

        // Filter by role if provided
        if (role) {
            query = query.eq('role', role);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch users', details: error.message },
                { status: 500 }
            );
        }

        // Format the data
        const formattedData = data.map((item: Record<string, unknown>) => ({
            id: item.id,
            nama: item.full_name,
            username: (item.email as string)?.replace('@apotekqu.com', '') || '',
            email: item.email,
            role: item.role,
            tanggal_dibuat: new Date(item.dibuat_pada as string).toLocaleDateString('id-ID')
        }));

        return NextResponse.json({
            success: true,
            data: formattedData,
            total: formattedData.length
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabaseAdmin = createAdminClient();
        const body = await request.json();

        const { nama, username, password, role = 'Pegawai' } = body;

        // Validation
        if (!nama || !username || !password) {
            return NextResponse.json(
                { error: 'Nama, username, dan password harus diisi' },
                { status: 400 }
            );
        }

        if (username.length < 3) {
            return NextResponse.json(
                { error: 'Username minimal 3 karakter' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password minimal 6 karakter' },
                { status: 400 }
            );
        }

        // Generate email from username
        const email = `${username}@apotekqu.com`;

        // 1. Create user with Supabase Admin Auth
        const { data: signUpData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: nama,
                role: role
            }
        });

        console.log('Sign up data:', signUpData);

        if (authError) {
            console.error('Auth error:', authError);
            if (authError.message.includes('duplicate') || authError.message.includes('already')) {
                return NextResponse.json(
                    { error: 'Username (email) sudah digunakan' },
                    { status: 409 }
                );
            }
            return NextResponse.json(
                { error: 'Gagal mendaftar user', details: authError.message },
                { status: 500 }
            );
        }

        const user = signUpData.user;

        if (!user) {
            return NextResponse.json(
                { error: 'Gagal membuat user' },
                { status: 500 }
            );
        }

        // Format response
        const formattedUser = {
            id: user.id,
            nama: nama,
            username: user.email?.replace('@apotekqu.com', '') || '',
            email: user.email,
            role: role,
            tanggal_dibuat: new Date(user.created_at || Date.now()).toLocaleDateString('id-ID'),
        };

        return NextResponse.json({
            success: true,
            data: formattedUser,
            message: 'User berhasil dibuat'
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
