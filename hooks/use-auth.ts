'use client';

import { Profile } from '@/types/auth';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AuthState {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    error: string | null;
}

export const useAuth = () => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        profile: null,
        loading: true,
        error: null
    });

    const router = useRouter();
    const supabase = createClient();

    const fetchUserProfile = async (user: User) => {
        try {
            // Try to fetch profile with better error handling
            const { data: profile, error } = await supabase
                .from('pengguna')
                .select('role, full_name')
                .eq('id', user.id)
                .maybeSingle(); // Use maybeSingle to avoid error when no rows

            if (error) {
                console.log('Profile fetch error:', error);

                // Try fallback by email if ID lookup fails
                const { data: emailProfile, error: emailError } = await supabase
                    .from('pengguna')
                    .select('role, full_name')
                    .eq('email', user.email)
                    .maybeSingle();

                if (emailError || !emailProfile) {
                    console.log('Email fallback failed:', emailError);
                    // Set default profile if user not found in pengguna table
                    return {
                        role: 'Pegawai', // default profile
                        full_name: user.email
                    };
                }

                return emailProfile;
            }

            if (!profile) {
                // User not found in pengguna table, return default
                return {
                    role: 'Pegawai',
                    full_name: user.email
                };
            }

            return profile;

        } catch (fetchError) {
            console.log('Unexpected error fetching profile:', fetchError);
            // Return default values on any error
            return {
                role: 'Pegawai',
                full_name: user.email
            };
        }
    };

    useEffect(() => {
        // Get initial user - use getUser() instead of getSession()
        const getInitialUser = async () => {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError) {
                    console.log('User error:', userError);
                    setAuthState({
                        user: null,
                        profile: null,
                        loading: false,
                        error: userError.message
                    });
                    return;
                }

                if (user) {
                    const profile = await fetchUserProfile(user);

                    setAuthState({
                        user: user,
                        profile: profile,
                        loading: false,
                        error: null
                    });

                    // Store in localStorage for quick access
                    localStorage.setItem('userprofile', JSON.stringify(profile));
                    localStorage.setItem('userName', profile.full_name || user.email || '');
                } else {
                    setAuthState({
                        user: null,
                        profile: null,
                        loading: false,
                        error: null
                    });

                    // Clear localStorage
                    localStorage.removeItem('userprofile');
                    localStorage.removeItem('userName');
                }
            } catch (error) {
                console.log('Initial user error:', error);
                setAuthState({
                    user: null,
                    profile: null,
                    loading: false,
                    error: 'Failed to get initial user'
                });
            }
        };

        getInitialUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event);

                try {
                    if (session?.user) {
                        // Verify the user is still valid by calling getUser()
                        const { data: { user }, error: userError } = await supabase.auth.getUser();

                        if (userError || !user) {
                            console.log('User verification failed:', userError);
                            setAuthState({
                                user: null,
                                profile: null,
                                loading: false,
                                error: 'User verification failed'
                            });
                            return;
                        }

                        const profile = await fetchUserProfile(user);

                        setAuthState({
                            user: user,
                            profile: profile,
                            loading: false,
                            error: null
                        });

                        // Store in localStorage
                        localStorage.setItem('userprofile', JSON.stringify(profile));
                        localStorage.setItem('userName', profile.full_name || user.email || '');
                    } else {
                        setAuthState({
                            user: null,
                            profile: null,
                            loading: false,
                            error: null
                        });

                        // Clear localStorage
                        localStorage.removeItem('userprofile');
                        localStorage.removeItem('userName');
                    }
                } catch (error) {
                    console.log('Auth change error:', error);
                    setAuthState({
                        user: session?.user || null,
                        profile: null,
                        loading: false,
                        error: 'Failed to fetch user profile'
                    });
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Additional utility methods
    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            localStorage.removeItem('userprofile');
            localStorage.removeItem('userName');

            router.push("/login");
        } catch (error) {
            console.log('Sign out error:', error);
        }
    };

    const refreshProfile = async () => {
        if (authState.user) {
            const profile = await fetchUserProfile(authState.user);
            setAuthState(prev => ({
                ...prev,
                profile: profile,
                error: null
            }));
        }
    };

    return {
        ...authState,
        signOut,
        refreshProfile
    };
};