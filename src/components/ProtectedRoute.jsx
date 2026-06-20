import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

export function ProtectedRoute({ children, requireOnboarding = true, requireAdmin = false }) {
  const user = useAuth((s) => s.user);
  const token = useAuth((s) => s.token);
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin tizim administratori — onboarding talab qilinmaydi.
  if (requireOnboarding && user.role !== 'admin' && !user.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
