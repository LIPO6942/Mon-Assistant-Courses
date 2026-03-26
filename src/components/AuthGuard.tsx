'use client';

import { useAuth } from '@/context/AuthContext';
import LoginPage from '@/components/LoginPage';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                    flexDirection: 'column',
                    gap: '1.5rem',
                }}
            >
                <div
                    style={{
                        width: '48px',
                        height: '48px',
                        border: '3px solid rgba(99, 102, 241, 0.2)',
                        borderTopColor: '#6366f1',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                    }}
                />
                <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
                <p style={{ color: '#94a3b8', fontSize: '0.9375rem' }}>Chargement...</p>
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
    }

    return (
        <>
            {children}
        </>
    );
}
