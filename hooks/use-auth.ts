'use client';

import { Profile } from '@/types/auth';
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

    const fetchUserProfile = async () => {
        try {
            const response = await fetch('/api/auth/profile', {
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // User not authenticated
                    setAuthState({
                        user: null,
                        profile: null,
                        loading: false,
                        error: null
                    });
                    return false;
                }
                throw new Error('Failed to fetch profile');
            }

            const result = await response.json();

            if (result.success && result.data) {
                const { user, profile } = result.data;

                setAuthState({
                    user: user,
                    profile: {
                        role: profile.role,
                        full_name: profile.full_name
                    },
                    loading: false,
                    error: null
                });

                return true;
            }

            return false;

        } catch (error) {
            console.error('Profile fetch error:', error);
            setAuthState(prev => ({
                ...prev,
                loading: false,
                error: 'Failed to load user profile'
            }));
            return false;
        }
    };

    const signOut = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                // Clear all auth-related localStorage
                localStorage.removeItem('userRole');
                localStorage.removeItem('userProfile');
                localStorage.removeItem('userprofile');
                localStorage.removeItem('userName');

                setAuthState({
                    user: null,
                    profile: null,
                    loading: false,
                    error: null
                });

                router.push('/login');
                router.refresh();
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Fallback: clear state anyway
            localStorage.removeItem('userRole');
            localStorage.removeItem('userProfile');
            localStorage.removeItem('userprofile');
            localStorage.removeItem('userName');

            setAuthState({
                user: null,
                profile: null,
                loading: false,
                error: null
            });

            router.push('/login');
        }
    };

    const refreshProfile = async () => {
        return await fetchUserProfile();
    };

    const checkAuthStatus = async () => {
        // Simple check: if we have user data, we're authenticated
        if (authState.user && authState.profile && !authState.loading) {
            return true;
        }

        // If loading, wait for it to complete by fetching
        const isAuthenticated = await fetchUserProfile();

        if (!isAuthenticated) {
            localStorage.removeItem('userRole');
            localStorage.removeItem('userProfile');
            router.push('/login');
            return false;
        }

        return true;
    };

    useEffect(() => {
        // Initial auth check
        fetchUserProfile();
    }, []);

    return {
        // State
        user: authState.user,
        profile: authState.profile,
        loading: authState.loading,
        error: authState.error,

        // Actions
        signOut,
        refreshProfile,
        checkAuthStatus
    };
};
