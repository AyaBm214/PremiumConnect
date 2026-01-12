import { AuthProvider } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/LanguageContext';
import React from 'react';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <LanguageProvider>
                <div className="client-app-root">
                    {children}
                </div>
            </LanguageProvider>
        </AuthProvider>
    );
}
