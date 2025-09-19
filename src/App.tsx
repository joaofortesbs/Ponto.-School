import React, { useEffect, useState, Suspense } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import routes from "./tempo-routes";
import Home from "@/components/home";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import FloatingChatSupport from "@/components/chat/FloatingChatSupport";
import { supabase } from "@/lib/supabase";
import { checkAuthentication } from "@/lib/auth-utils";
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
import AuthPage from "@/components/auth/AuthPage";
import PlanSelection from "@/pages/plan-selection";
import PlanSelectionRedesigned from "@/pages/plan-selection-redesigned";

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

// Import da nova página de atividade pública
import PublicActivityPage from './pages/atividade/[id]';

// Componente para proteger rotas
function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar se é uma rota pública primeiro
        const currentPath = location.pathname;
        const isPublicRoute = currentPath.startsWith('/atividade/') ||
                              currentPath === '/quiz' ||
                              currentPath === '/blank';

        if (isPublicRoute) {
          console.log("🔓 Rota pública detectada em ProtectedRoute, permitindo acesso");
          setIsAuthenticated(true); // Permitir acesso
          setIsCheckingAuth(false);
          return;
        }

        const { data } = await supabase.auth.getSession();
        const isAuth = !!data.session;

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
  }, [navigate, location.pathname]);

  if (isCheckingAuth) {
    return <TypewriterLoader />;
  }

  return isAuthenticated ? children : null;
}

function App() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [isAuth, setIsAuth] = useState(false); // Estado para controlar a autenticação
  const [loading, setLoading] = useState(true); // Estado para controle de carregamento inicial

  useEffect(() => {
    console.log("App carregado com sucesso!");

    const checkConnection = async () => {
      try {
        try {
          const { checkSupabaseConnection, setupSupabaseHealthCheck } = await import('@/lib/supabase');

          if (import.meta.env.MODE === 'development') {
            await setupSupabaseHealthCheck();
          }

          const isConnected = await checkSupabaseConnection();

          if (!isConnected) {
            console.warn("Aviso: Falha na conexão com o Supabase. A aplicação continuará funcionando com dados locais.");
          } else {
            console.log("Conexão com Supabase estabelecida com sucesso!");
          }
        } catch (connectionError) {
          console.warn("Aviso: Erro ao verificar conexão com Supabase:", connectionError);
        }
      } catch (error) {
        console.error("Connection check error:", error);
      } finally {
        setIsLoading(false);
        console.log("Connection check finished.");
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


  useEffect(() => {
    const initializeApp = async () => {
      console.log("Iniciando aplicação e verificando autenticação...");

      try {
        // Verificar se é uma rota pública
        const currentPath = window.location.pathname;
        const isPublicRoute = currentPath.startsWith('/atividade/') ||
                              currentPath === '/quiz' ||
                              currentPath === '/blank' ||
                              currentPath.startsWith('/login') ||
                              currentPath.startsWith('/register');

        if (isPublicRoute) {
          // Para rotas públicas, não verificar autenticação
          console.log("🔓 Rota pública detectada, permitindo acesso sem autenticação");
          setIsAuth(false);
          setLoading(false);
          return;
        }

        const isAuthenticated = await checkAuthentication();
        setIsAuth(isAuthenticated);

        if (isAuthenticated) {
          localStorage.setItem('auth_checked', 'true');
          localStorage.setItem('auth_status', 'authenticated');
        } else {
          localStorage.removeItem('auth_checked');
          localStorage.removeItem('auth_status');
        }
      } catch (error) {
        console.error("Erro na verificação de autenticação:", error);
        setIsAuth(false);
        localStorage.removeItem('auth_checked');
        localStorage.removeItem('auth_status');
      } finally {
        setLoading(false);
        console.log("Aplicação inicializada com sucesso.");
      }
    };

    initializeApp();
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
          const { data: { session } } = await supabase.auth.getSession();
          const currentUserId = session?.user?.id;

          if (!currentUserId) return;

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

  // Verificar se é uma rota pública
  const currentPath = window.location.pathname;
  const isPublicRoute = currentPath.startsWith('/atividade/') ||
                        currentPath === '/quiz' ||
                        currentPath === '/blank';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Carregando aplicação...</p>
        </div>
      </div>
    );
  }

  if (!isAuth && !isPublicRoute) {
    return (
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/plan-selection" element={<PlanSelection />} />
          <Route path="/plan-selection-redesigned" element={<PlanSelectionRedesigned />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ThemeProvider>
    );
  }


  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <UsernameProvider>
        <StudyGoalProvider>
          <ErrorBoundary>
            <div className="min-h-screen bg-background font-body antialiased dark:bg-[#001427]">
              <Routes>
                  {/* Rota pública de atividade - DEVE vir ANTES das rotas protegidas */}
                  <Route 
                    path="/atividade/:id/:code?" 
                    element={
                      <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                          <p className="text-gray-600 text-lg">Carregando atividade...</p>
                        </div>
                      </div>}>
                        <PublicActivityPage />
                      </Suspense>
                    } 
                  />

                  {/* Rotas de autenticação */}
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
                    <Route path="school-power" element={<SchoolPowerPageIndex />} />
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

                  {/* Fallback Route - Redireciona para login se não estiver autenticado */}
                  <Route path="*" element={isAuth ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} />
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