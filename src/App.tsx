import React, { useEffect, useState, Suspense, lazy } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  BrowserRouter as Router,
} from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import routes from "./tempo-routes";
import Home from "@/components/home";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import FloatingChatSupport from "@/components/chat/FloatingChatSupport";
import { checkAuthentication } from "@/lib/auth-utils";
import { useNeonAuth } from "@/hooks/useNeonAuth";
import { StudyGoalProvider } from "@/components/dashboard/StudyGoalContext";
import UsernameProvider from "./components/UsernameProvider";

// Importações diretas
import Dashboard from "@/pages/dashboard";
import Turmas from "@/pages/turmas";
import TurmaDetail from "@/pages/turmas/[id]";
import GruposEstudo2 from "@/pages/turmas/grupos2";
import Comunidades from "@/pages/comunidades";
import PedidosAjuda from "@/pages/pedidos-ajuda";
import EpictusIA from "@/pages/epictus-ia";
import Agenda from "@/pages/agenda";
import Biblioteca from "@/pages/biblioteca";
import Conquistas from "@/pages/conquistas";
import Carteira from "@/pages/carteira";
import Organizacao from "@/pages/organizacao";
import Novidades from "@/pages/novidades";
import Configuracoes from "@/pages/configuracoes";
import PlanosEstudo from "@/pages/planos-estudo";
import Portal from "@/pages/portal";
import GruposEstudo from "@/pages/turmas/grupos";

// Auth Pages
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import ForgotPasswordPage from "@/pages/auth/forgot-password";
import ResetPasswordPage from "@/pages/auth/reset-password";
import PlanSelectionPage from "@/pages/plan-selection";

// User Pages
import ProfilePage from "@/pages/profile";
import WelcomeModal from "./components/auth/WelcomeModal";
import { TypewriterLoader } from "./components/ui/typewriter-loader";

// Nova página em branco
import BlankPage from "@/pages/BlankPage";

// Import das paginas novas
import EpictusIAPage from "./pages/epictus-ia";
import SchoolPowerPageIndex from "./pages/school-power";
import MentorIAPage from "./pages/mentor-ia";
import QuizPage from '@/pages/quiz';

// Public activity page (no authentication required)
const AtividadeCompartilhadaPage = lazy(() => import('@/pages/atividade/[activityId]/[uniqueCode]'));


// Componente para proteger rotas
function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await checkAuthentication();
        
        localStorage.setItem('auth_checked', 'true');
        localStorage.setItem('auth_status', isAuth ? 'authenticated' : 'unauthenticated');

        setIsAuthenticated(isAuth);

        if (!isAuth) {
          console.log("Usuário não autenticado, redirecionando para login");
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        localStorage.removeItem('auth_checked');
        localStorage.removeItem('auth_status');
        navigate('/login', { replace: true });
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isCheckingAuth) {
    return <TypewriterLoader />;
  }

  return isAuthenticated ? children : null;
}

// Component to check if current route is public
function useIsPublicRoute() {
  const location = useLocation();
  return location.pathname.startsWith('/atividade/');
}


function App() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const isPublicRoute = useIsPublicRoute();


  useEffect(() => {
    console.log("App carregado com sucesso!");

    const checkConnection = async () => {
      try {
        console.log("Verificando conexão com banco de dados Neon...");
        // Conexão será verificada pela API do Neon
        setIsLoading(false);
      } catch (error) {
        console.error("Connection check error:", error);
        setIsLoading(false);
      }
    };

    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
      console.log("Timeout de carregamento atingido. Forçando renderização.");
    }, 3000);

    checkConnection();

    const handleLogout = () => {
      localStorage.removeItem('auth_status');
      localStorage.removeItem('auth_checked');
    };

    window.addEventListener('logout', handleLogout);

    return () => {
      clearTimeout(loadingTimeout);
      window.removeEventListener('logout', handleLogout);
    };
  }, []);

  // Rotas de autenticação
  const isAuthRoute = ['/auth', '/login', '/register', '/forgot-password', '/reset-password', '/plan-selection', '/welcome'].includes(location.pathname);

  // Verificar se é uma rota de quiz - incluindo qualquer variação da rota de quiz
  const isQuizRoute = location.pathname === '/quiz' || location.pathname.startsWith('/quiz/');

  const navigate = useNavigate();

  useEffect(() => {
    const checkRootRoute = async () => {
      if (location.pathname === "/") {
        const isAuth = await checkAuthentication();
        if (!isAuth) {
          navigate('/login', { replace: true });
        } else {
          // Se está autenticado e na rota raiz, garantir que está no dashboard
          if (location.pathname === "/") {
            console.log("✅ Usuário autenticado, redirecionando para dashboard");
          }
        }
      }
    };

    checkRootRoute();
  }, [location.pathname, navigate]);

  useEffect(() => {
    const preventScroll = () => {
      document.body.classList.add('modal-open');
    };

    const restoreScroll = () => {
      document.body.classList.remove('modal-open');
    };

    const checkAuth = async () => {
      try {
        const isAuthenticated = await checkAuthentication();

        const isAuthRoute = [
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/select-plan",
        ].some((route) => location.pathname.startsWith(route));

        if (isAuthRoute) {
          setShowWelcomeModal(false);
          if (location.pathname === "/login") {
            sessionStorage.removeItem('welcomeModalShown');
          }
          restoreScroll();
          return;
        }

        if (isAuthenticated) {
          const currentUserId = localStorage.getItem('user_id') || 'guest';

          const userLoginKey = `hasLoggedInBefore_${currentUserId}`;
          const sessionKey = `currentSession_${currentUserId}`;
          const userHasLoggedBefore = localStorage.getItem(userLoginKey);
          const currentSession = sessionStorage.getItem(sessionKey);

          if (!userHasLoggedBefore) {
            console.log("Primeiro login detectado para esta conta!");
            setIsFirstLogin(true);
            setShowWelcomeModal(true);
            preventScroll();
            localStorage.setItem(userLoginKey, 'true');
            localStorage.setItem('hasLoggedInBefore', 'true');
            sessionStorage.setItem(sessionKey, 'active');
          } else if (!currentSession) {
            console.log("Nova sessão detectada - mostrando modal de boas-vindas");
            setIsFirstLogin(false);
            setShowWelcomeModal(true);
            preventScroll();
            sessionStorage.setItem(sessionKey, 'active');
          } else if (location.pathname === "/") {
            setIsFirstLogin(false);
            setShowWelcomeModal(true);
            preventScroll();
          } else {
            console.log("Navegação dentro da mesma sessão - modal não será mostrado");
            setShowWelcomeModal(false);
            restoreScroll();
          }
        }
        console.log("Aplicação inicializada com sucesso.");

      } catch (error) {
        console.error("Erro ao inicializar aplicação:", error);
        setShowWelcomeModal(false);
        restoreScroll();
      }
    };

    const timer = setTimeout(() => {
      console.log("Iniciando aplicação e verificando autenticação...");
      checkAuth();
    }, 100);

    return () => {
      clearTimeout(timer);
      restoreScroll();
    };
  }, [location.pathname]);

  // For public routes, skip authentication check and render directly
  if (isPublicRoute) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Toaster />
        <Suspense fallback={
          <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando atividade...</p>
            </div>
          </div>
        }>
          <Routes>
            <Route path="/atividade/:activityId/:uniqueCode" element={<AtividadeCompartilhadaPage />} />
          </Routes>
        </Suspense>
      </ThemeProvider>
    );
  }

  // If not a public route, proceed with authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }


  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <UsernameProvider>
        <StudyGoalProvider>
          <ErrorBoundary>
            <div className="min-h-screen bg-background font-body antialiased dark:bg-[#001427]">
              <Routes>
                {/* Auth Routes - Públicas */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/select-plan" element={<PlanSelectionPage />} />

                {/* Página em branco - Pública para teste */}
                <Route path="/blank" element={<BlankPage />} />
                 {/* Rota pública para quiz */}
                 <Route path="/quiz" element={<QuizPage />} />

                {/* Main App Routes - Protegidas */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="turmas" element={<Turmas />} />
                  <Route path="turmas/:id" element={<TurmaDetail />} />
                  <Route path="turmas/grupos2" element={<GruposEstudo2 />} />
                  <Route path="turmas/grupos" element={<GruposEstudo />} />
                  <Route path="turmas/grupos/:id" element={<GruposEstudo />} />
                  <Route path="comunidades" element={<Comunidades />} />
                  <Route path="pedidos-ajuda" element={<PedidosAjuda />} />
                  <Route path="epictus-ia" element={<EpictusIAPage />} />
                  <Route path="/school-power" element={<SchoolPowerPageIndex />} />
                  <Route path="agenda" element={<Agenda />} />
                  <Route path="biblioteca" element={<Biblioteca />} />
                  <Route path="conquistas" element={<Conquistas />} />
                  <Route path="carteira" element={<Carteira />} />
                  <Route path="organizacao" element={<Organizacao />} />
                  <Route path="novidades" element={<Novidades />} />
                  <Route path="configuracoes" element={<Configuracoes />} />
                  <Route path="planos-estudo" element={<PlanosEstudo />} />
                  <Route path="portal" element={<Portal />} />
                </Route>

                {/* User Profile - Protegida */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />

                {/* Agenda standalone - Protegida */}
                <Route path="/agenda-preview" element={
                  <ProtectedRoute>
                    <Agenda />
                  </ProtectedRoute>
                } />
                <Route path="/agenda-standalone" element={
                  <ProtectedRoute>
                    <Agenda />
                  </ProtectedRoute>
                } />

                {/* Fallback Route - Redireciona para login */}
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>

              {/* Floating Chat Support - Excluído explicitamente das rotas de auth e quiz */}
              {!isAuthRoute && !isQuizRoute && location.pathname !== '/quiz' && <FloatingChatSupport />}

              {/* Welcome Modal - apenas mostrado em rotas protegidas (não auth) */}
              {!isAuthRoute &&
                <WelcomeModal
                  isOpen={showWelcomeModal}
                  onClose={() => setShowWelcomeModal(false)}
                  isFirstLogin={isFirstLogin}
                />
              }
            </div>
            <Toaster />
          </ErrorBoundary>
        </StudyGoalProvider>
      </UsernameProvider>
    </ThemeProvider>
  );
}

export default App;