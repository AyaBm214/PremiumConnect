'use client';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './admin.module.css';

import { useLanguage } from '@/lib/LanguageContext';
import { createClient } from '@/lib/supabase/client';

function AdminSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { language, setLanguage, t } = useLanguage();

    const links = [
        { href: '/admin/dashboard', label: t('admin.overview'), icon: '📊' },
        { href: '/admin/properties', label: t('admin.properties'), icon: '🏠' },
        { href: '/admin/users', label: t('admin.users'), icon: '👥' },
        { href: '/admin/media', label: t('admin.media'), icon: '📁' },
        { href: '/admin/hostaway-requests', label: 'Hostaway Access', icon: '🔑', isHostaway: true },
        { href: '/admin/settings', label: t('admin.settings.title'), icon: '⚙️' },
    ];

    const [requestCount, setRequestCount] = React.useState(0);
    const supabase = createClient();

    useEffect(() => {
        const fetchCount = async () => {
            const { count, error } = await supabase
                .from('hostaway_requests')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'requested');

            if (!error && count !== null) {
                setRequestCount(count);
            }
        };

        fetchCount();
        
        // Optional: Real-time subscription
        const channel = supabase
            .channel('hostaway_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'hostaway_requests' }, () => {
                fetchCount();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <Image
                    src="/logo.png"
                    alt="Premium Booking Connect"
                    width={150}
                    height={50}
                    style={{ objectFit: 'contain' }}
                />
            </div>

            <div className={styles.langSwitch}>
                <button
                    className={`${styles.langBtn} ${language === 'en' ? styles.langActive : ''}`}
                    onClick={() => setLanguage('en')}
                >
                    EN
                </button>
                <button
                    className={`${styles.langBtn} ${language === 'fr' ? styles.langActive : ''}`}
                    onClick={() => setLanguage('fr')}
                >
                    FR
                </button>
            </div>

            <div className={styles.userInfo}>
                {user?.email}
            </div>
            <nav className={styles.nav}>
                {links.map(link => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`${styles.navItem} ${pathname === link.href ? styles.active : ''}`}
                    >
                        <span className={styles.icon}>{link.icon}</span>
                        <span style={{ flexGrow: 1 }}>{link.label}</span>
                        {(link as any).isHostaway && requestCount > 0 && (
                            <span className={styles.badge}>{requestCount}</span>
                        )}
                    </Link>
                ))}
            </nav>
            <button onClick={logout} className={styles.logoutBtn}>{t('admin.logout')}</button>
        </aside>
    );
}

function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            // Check metadata for admin role
            if (!user || user.user_metadata?.type !== 'admin') {
                router.push('/admin/login');
            }
        }
    }, [user, isLoading, router]);

    if (isLoading) return <div className={styles.loading}>Loading...</div>;
    if (!user || user.user_metadata?.type !== 'admin') return null;

    return (
        <div className={styles.layout}>
            <AdminSidebar />
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';

    return (
        <>
            {isLoginPage ? children : <AdminGuard>{children}</AdminGuard>}
        </>
    );
}
