
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { checkAuthentication } from '@/lib/auth-utils';

export function useAuthRedirection() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Rotas de autenticação
  const isAuthRoute = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/select-plan",
    "/admin/db-console",
  ].some((route) => location.pathname.startsWith(route));

  useEffect(() => {
    const checkRootRoute = async () => {
      if (location.pathname === "/") {
        const isAuth = await checkAuthentication();
        if (!isAuth) {
          navigate('/login', { replace: true });
        }
      }
    };

    checkRootRoute();
  }, [location.pathname, navigate]);

  return { isAuthRoute };
}
