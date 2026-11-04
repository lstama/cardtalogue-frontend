import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import type { ReactNode } from 'react'

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Wait for the auth provider to initialize from localStorage before deciding
  // whether the user is authenticated. Without this guard, the first render
  // (before the init effect runs) sees user=null and redirects to /login even
  // when a valid JWT is already stored.
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
