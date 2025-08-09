'use client';

import { Profile } from '@/types/auth';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuthState {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    error: string | null;
}

interface AuthContextType extends AuthState {
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<boolean>;
    checkAuthStatus: () => Promise<boolean>;
    setUserData: (user: User, profile: Profile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        profile: null,
        loading: true,
        error: null
    });

    const router = useRouter();
    const [isInitialized, setIsInitialized] = useState(false);

    const fetchUserProfile = async () => {
        try {
            // Skip auth for test routes or if test mode is enabled
            if (typeof window !== 'undefined' &&
                (window.location.pathname.includes('/test') || (window as any).__TEST_MODE__)) {
                console.log('🧪 Skipping auth fetch for test mode');
                return false;
            }

            console.log('Fetching user profile...');
            console.log('Current URL:', window.location.href);

            const response = await fetch('/api/auth/profile', {
                credentials: 'include',
                cache: 'no-store',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            // Check if response is HTML (error page)
            const contentType = response.headers.get('content-type') || '';
            console.log('Content-Type:', contentType);

            if (contentType.includes('text/html')) {
                console.warn('Got HTML instead of JSON - API endpoint might not exist or server not running');

                // Fallback: check localStorage for existing session
                const storedRole = localStorage.getItem('userRole');
                const storedProfile = localStorage.getItem('userProfile');

                if (storedRole && storedProfile) {
                    console.log('Using stored profile data as fallback');
                    const profile = JSON.parse(storedProfile);

                    setAuthState({
                        user: { id: profile.id, email: profile.email } as any,
                        profile: {
                            role: profile.role,
                            full_name: profile.full_name
                        },
                        loading: false,
                        error: null
                    });

                    return true;
                }

                setAuthState({
                    user: null,
                    profile: null,
                    loading: false,
                    error: null
                });
                return false;
            }

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('User not authenticated (401)');

                    // Clear any stale localStorage data
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userProfile');

                    setAuthState({
                        user: null,
                        profile: null,
                        loading: false,
                        error: null
                    });
                    return false;
                }

                const errorText = await response.text();
                console.error('API Error:', errorText);
                throw new Error(`Failed to fetch profile: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('Profile API result:', result);

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

                // Update localStorage with fresh data
                localStorage.setItem('userRole', profile.role);
                localStorage.setItem('userProfile', JSON.stringify(profile));

                return true;
            }

            return false;

        } catch (error) {
            console.error('Profile fetch error:', error);

            // Fallback: try to use localStorage data
            const storedRole = localStorage.getItem('userRole');
            const storedProfile = localStorage.getItem('userProfile');

            if (storedRole && storedProfile) {
                console.log('Using stored profile data due to fetch error');
                const profile = JSON.parse(storedProfile);

                setAuthState({
                    user: { id: profile.id, email: profile.email } as any,
                    profile: {
                        role: profile.role,
                        full_name: profile.full_name
                    },
                    loading: false,
                    error: null
                });

                return true;
            }

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
            // Only redirect if we're not already on login page
            if (window.location.pathname !== '/login') {
                localStorage.removeItem('userRole');
                localStorage.removeItem('userProfile');
                router.push('/login');
            }
            return false;
        }

        return true;
    };

    useEffect(() => {
        // Initial auth check - ONLY RUNS ONCE HERE
        const initializeAuth = async () => {
            if (isInitialized) return; // Prevent double initialization

            // Skip if we're on the login page to avoid unnecessary API calls
            if (window.location.pathname === '/login') {
                setAuthState(prev => ({ ...prev, loading: false }));
                setIsInitialized(true);
                return;
            }

            // First, try to use localStorage data immediately for faster UI
            const storedRole = localStorage.getItem('userRole');
            const storedProfile = localStorage.getItem('userProfile');

            if (storedRole && storedProfile) {
                try {
                    const profile = JSON.parse(storedProfile);
                    console.log('Loading from localStorage:', profile);

                    setAuthState({
                        user: { id: profile.id, email: profile.email } as any,
                        profile: {
                            role: profile.role,
                            full_name: profile.full_name
                        },
                        loading: false,
                        error: null
                    });

                    setIsInitialized(true);

                    // Then try to fetch fresh data in the background (but don't block UI)
                    fetchUserProfile().catch(console.error);
                    return;
                } catch (error) {
                    console.error('Error parsing stored profile:', error);
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userProfile');
                }
            }

            // If no localStorage data, fetch from API
            await fetchUserProfile();
            setIsInitialized(true);
        };

        initializeAuth();
    }, [isInitialized]);

    const setUserData = (user: User, profile: Profile) => {
        setAuthState({
            user,
            profile,
            loading: false,
            error: null
        });

        // Update localStorage as well
        localStorage.setItem('userRole', profile.role);
        localStorage.setItem('userProfile', JSON.stringify(profile));
    };

    const value: AuthContextType = {
        user: authState.user,
        profile: authState.profile,
        loading: authState.loading,
        error: authState.error,
        signOut,
        refreshProfile,
        checkAuthStatus,
        setUserData
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Simple hook to use the context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
