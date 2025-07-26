"use client";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const formSchema = z.object({
    username: z.string().min(2, "Username minimal 2 karakter"),
    password: z.string().min(8, "Password minimal 8 karakter"),
});

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const form = useForm<z.infer<typeof formSchema>>({
        defaultValues: {
            username: "",
            password: "",
        },
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        setError(null);

        try {
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email: data.username + "@apotekqu.com",
                password: data.password,
            });

            if (error) {
                console.log('Login error:', error);
                setError(error.message === 'Invalid login credentials'
                    ? 'Username atau password salah'
                    : error.message);
                return;
            }

            if (authData.user) {
                // Fetch user profile untuk mendapatkan role
                const { data, error } = await supabase
                    .from('pengguna')
                    .select('role')
                    .eq('id', authData.user.id)
                    .single();

                if (error) {
                    console.log('Profile fetch error:', error);
                    setError('Gagal mengambil data profil pengguna');
                    return;
                }

                // Validasi role
                const userRole = data?.role;
                if (!userRole || !['APA', 'Pegawai'].includes(userRole)) {
                    setError('Akun Anda tidak memiliki akses ke sistem ini');
                    await supabase.auth.signOut();
                    return;
                }

                console.log('Login berhasil! Role:', userRole);

                // Store role di localStorage untuk akses cepat
                localStorage.setItem('userRole', userRole);

                // Redirect berdasarkan role
                switch (userRole) {
                    case 'APA':
                        router.push('/APA');
                        break;
                    case 'Pegawai':
                        router.push('/pegawai');
                        break;
                }

                router.refresh();
            }

        } catch (error) {
            console.log('Unexpected error:', error);
            setError('Terjadi kesalahan yang tidak terduga');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
            <div className="my-7 w-full flex items-center justify-center overflow-hidden">
                <Image
                    src="/picture-login.png"
                    alt="Login"
                    width={480}
                    height={192}
                    className="w-full max-w-[480px] h-32 sm:h-40 md:h-48 lg:h-56 rounded-lg object-cover"
                    priority
                />
            </div>
            <div className="max-w-sm w-full flex flex-col items-center">
                <p className="text-xl font-bold mb-4 text-center">Selamat Datang di ApotekQu</p>

                {/* Error Message */}
                {error && (
                    <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm text-center">{error}</p>
                    </div>
                )}

                <Form {...form}>
                    <form
                        className="w-full space-y-4"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="Masukkan username"
                                            className="w-full"
                                            disabled={isLoading}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Masukkan password"
                                            className="w-full"
                                            disabled={isLoading}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="mt-4 w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sedang login...' : 'Login'}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}