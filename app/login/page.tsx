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
import { useAuth } from "@/contexts/auth-context";

const formSchema = z.object({
    username: z.string().min(2, "Username minimal 2 karakter"),
    password: z.string().min(8, "Password minimal 8 karakter"),
});

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();
    const { setUserData } = useAuth();

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
            // Gunakan API endpoint login yang baru
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: data.username + "@apotekqu.com",
                    password: data.password,
                }),
            });

            // Check if response is HTML (might be redirected)
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('text/html')) {
                setError('Server tidak dapat diakses. Pastikan server sedang berjalan.');
                return;
            }

            let result;
            try {
                result = await response.json();
            } catch (parseError) {
                setError('Server mengembalikan respons yang tidak valid');
                return;
            }

            if (!response.ok) {
                setError(result.error || 'Login gagal');
                return;
            }

            if (result.success && result.data) {
                const { profile, session } = result.data;

                // Validasi role
                if (!profile.role || !['APA', 'Pegawai'].includes(profile.role)) {
                    setError('Akun Anda tidak memiliki akses ke sistem ini');
                    return;
                }

                // Set the session in Supabase client
                if (session) {
                    await supabase.auth.setSession({
                        access_token: session.access_token,
                        refresh_token: session.refresh_token
                    });
                }

                // Update auth context immediately
                setUserData(
                    result.data.user,
                    {
                        role: profile.role,
                        full_name: profile.full_name
                    }
                );

                // Wait a bit to ensure everything is set
                await new Promise(resolve => setTimeout(resolve, 300));

                // Redirect berdasarkan role
                router.push(profile.role === 'APA' ? '/APA' : '/pegawai');
                router.refresh();
            }

        } catch (error) {
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