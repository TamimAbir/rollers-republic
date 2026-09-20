import { Navigate, useLocation } from 'react-router-dom';
import type { FC, ReactNode } from 'react';
import { useAuthStore } from '@/store';

/**
 * Route guard component. Redirects unauthenticated users to /login.
 * Preserves the intended destination via `returnTo` search param.
 *
 * Usage:
 *   <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
 *
 * Uses auth state selectors from Zustand store.
 */

interface ProtectedRouteProps {
    children: ReactNode;
    role?: 'admin' | 'user';
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({ children, role }): ReactNode => {
    const location = useLocation();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const userRole = useAuthStore((state) => state.user?.role);

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                state={{ returnTo: location.pathname }}
                replace
            />
        );
    }

    if (role && userRole !== role) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
