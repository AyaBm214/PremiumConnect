'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    login: (email: string, password?: string) => Promise<void>;
    signup: (email: string, password?: string, name?: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Check active session
        const initSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);
            } catch (error) {
                console.error('Error getting session:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
            if (_event === 'SIGNED_OUT') {
                router.push('/');
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    const login = async (email: string, password?: string) => {
        setIsLoading(true);
        console.log('Attempting login for:', email);
        if (!password) throw new Error('Password required');

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Login error:', error);
            setIsLoading(false);
            throw error;
        }

        console.log('Login successful. User data:', data.user);
        const userType = data.user?.user_metadata?.type;
        console.log('User type from metadata:', userType);

        if (userType === 'admin') {
            console.log('Redirecting to /admin/dashboard');
            router.push('/admin/dashboard');
        } else {
            console.log('Redirecting to /client/dashboard');
            router.push('/client/dashboard');
        }
    };

    const signup = async (email: string, password?: string, name?: string) => {
        setIsLoading(true);
        if (!password) throw new Error('Password required');

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    type: 'client' // Default to client
                },
                emailRedirectTo: `${window.location.origin}/auth/confirm`,
            }
        });

        if (error) {
            setIsLoading(false);
            throw error;
        }

        // Profile creation is now handled by a database trigger (handle_new_user)
        // to ensure it works even if the user hasn't confirmed their email yet.

        // Show a success message or redirect to login
        router.push('/client/login');
    };

    const logout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, session, login, signup, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
