import React from 'react';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="client-app-root">
            {children}
        </div>
    );
}
