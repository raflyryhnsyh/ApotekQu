import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const supabaseAdmin = createAdminClient();
        const body = await request.json();
        const { id } = await params;

        // Validasi ID user dengan UUID format
        if (!id || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(id)) {
            return NextResponse.json(
                { error: 'ID user tidak valid' },
                { status: 400 }
            );
        }

        const { nama, username, password } = body;

        // Validation
        if (!nama || !username) {
            return NextResponse.json(
                { error: 'Nama dan username harus diisi' },
                { status: 400 }
            );
        }

        if (username.length < 3) {
            return NextResponse.json(
                { error: 'Username minimal 3 karakter' },
                { status: 400 }
            );
        }

        if (password && password.length < 6) {
            return NextResponse.json(
                { error: 'Password minimal 6 karakter' },
                { status: 400 }
            );
        }

        const email = `${username}@apotekqu.com`;

        // Check if username already exists (exclude current user)
        const { data: existingUser } = await supabase
            .from('pengguna')
            .select('id')
            .eq('email', email)
            .neq('id', id)
            .single();

        if (existingUser) {
            return NextResponse.json(
                { error: 'Username sudah digunakan' },
                { status: 409 }
            );
        }

        // Object untuk menyimpan perubahan
        const updates: {
            auth?: { email?: string; password?: string },
            profile?: { full_name?: string; email?: string }
        } = {};

        // Persiapkan update untuk auth jika ada perubahan email atau password
        if (email || password) {
            updates.auth = {};
            if (email) updates.auth.email = email;
            if (password) updates.auth.password = password;
        }

        // Persiapkan update untuk profile
        updates.profile = {
            full_name: nama,
            email: email
        };

        // Mulai transaction-like updates
        let authUser = null;
        let profileData = null;

        // 1. Update auth data jika diperlukan (email/password)
        if (updates.auth && (updates.auth.email || updates.auth.password)) {
            const { data: user, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
                id,
                updates.auth
            );

            if (authError) {
                console.error('Auth update error:', authError);
                let errorMessage = 'Gagal mengupdate data autentikasi';

                if (authError.message.includes('duplicate') || authError.message.includes('already')) {
                    errorMessage = 'Email sudah digunakan oleh user lain';
                } else if (authError.message.includes('password')) {
                    errorMessage = 'Password tidak memenuhi persyaratan';
                }

                return NextResponse.json(
                    { error: errorMessage, details: authError.message },
                    { status: 400 }
                );
            }
            authUser = user.user;
        }

        // 2. Update profile data
        const { data: profile, error: profileError } = await supabase
            .from('pengguna')
            .update(updates.profile)
            .eq('id', id)
            .select()
            .single();

        if (profileError) {
            console.error('Profile update error:', profileError);
            return NextResponse.json(
                { error: 'Gagal mengupdate data profil', details: profileError.message },
                { status: 500 }
            );
        }

        profileData = profile;

        // Format response sesuai dengan format yang diharapkan frontend
        const formattedUser = {
            id: profileData.id,
            nama: profileData.full_name,
            username: profileData.email?.replace('@apotekqu.com', '') || '',
            email: profileData.email,
            role: profileData.role,
            tanggal_dibuat: new Date(profileData.dibuat_pada).toLocaleDateString('id-ID')
        };

        return NextResponse.json({
            success: true,
            data: formattedUser,
            message: 'User berhasil diupdate'
        });

    } catch (error) {
        console.error('API error:', error);

        let errorMessage = 'Terjadi kesalahan saat mengupdate data';
        let statusCode = 500;

        if (error instanceof Error) {
            if (error.message.includes('duplicate key')) {
                errorMessage = 'Email sudah digunakan oleh user lain';
                statusCode = 409;
            } else if (error.message.includes('password')) {
                errorMessage = 'Password tidak memenuhi persyaratan';
                statusCode = 400;
            }
        }

        return NextResponse.json(
            {
                error: errorMessage,
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: statusCode }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Pastikan params di-resolve dengan benar
        const { id } = await params;

        // Validasi awal
        if (!id) {
            return NextResponse.json(
                { error: 'ID user harus disediakan' },
                { status: 400 }
            );
        }

        const supabaseAdmin = createAdminClient();

        // 1. Cek apakah user ada
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(id);

        if (userError || !userData.user) {
            return NextResponse.json(
                {
                    error: 'User tidak ditemukan',
                    details: userError?.message || 'User tidak ada dalam sistem',
                    hint: 'Periksa kembali ID user'
                },
                { status: 404 }
            );
        }

        // 2. Hapus dari tabel terkait terlebih dahulu (jika ON DELETE CASCADE belum aktif)
        const { error: deleteProfileError } = await supabaseAdmin
            .from('pengguna')
            .delete()
            .eq('id', id);

        if (deleteProfileError) {
            console.error('Gagal menghapus data pengguna:', deleteProfileError);
            // Lanjutkan saja karena mungkin tabel tidak ada atau sudah dihapus
        }

        // 3. Hapus user dari auth
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(id);

        if (deleteError) {
            console.error('Delete auth user error:', deleteError);
            return NextResponse.json(
                {
                    error: 'Gagal menghapus user',
                    details: deleteError.message,
                    hint: 'Cek koneksi database dan pastikan ON DELETE CASCADE aktif'
                },
                { status: deleteError.status || 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'User dan data terkait berhasil dihapus'
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}