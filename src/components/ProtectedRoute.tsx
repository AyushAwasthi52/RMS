import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import type { UserRole } from '@/types/restaurant';
import { useAuth } from '@/context/AuthContext';

export function ProtectedRoute({ children, role }: { children: ReactElement; role?: UserRole }) {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background grid place-items-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (role && !hasRole(role)) return <Navigate to="/" replace />;

  return children;
}
