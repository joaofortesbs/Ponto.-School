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
import Comunidades from "@/pages/comunidades";
import PedidosAjuda from "@/pages/pedidos-ajuda";
import Agenda from "@/pages/agenda";
import Biblioteca from "@/pages/biblioteca";
import Carteira from "@/pages/carteira";
import Organizacao from "@/pages/organizacao";
import Novidades from "@/pages/novidades";
import Configuracoes from "@/pages/configuracoes";
import PlanosEstudo from "@/pages/planos-estudo";
import AgenteSchool from "@/pages/agente-school";

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
import AlunoUnderConstruction from "@/pages/under-construction/AlunoUnderConstruction";

// Nova página em branco
import BlankPage from "@/pages/BlankPage";

// Import das paginas novas
import SchoolPowerPageIndex from "./pages/school-power";
import MentorIAPage from "./pages/mentor-ia";
import QuizPage from '@/pages/quiz';
import TrilhasSchoolProfessorInterface from '@/pages/trilhas-school/professores/interface';
import SalesPage from '@/pages/sales';

const TrilhasSchoolAlunoInterface = lazy(() => import('@/pages/trilhas-school/alunos/interface'));

// Public activity page (no authentication required)
// Aceita apenas o código único como parâmetro
const AtividadeCompartilhadaPage = lazy(() => import('@/pages/atividade/[activityId]/[uniqueCode]'));
// Modo Apresentação - rota pública para apresentação de atividades
const ModoApresentacaoAtividadePage = lazy(() => import('@/features/schoolpower/components/ModoApresentacaoAtividade').then(module => ({ default: module.ModoApresentacaoAtividade })));


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
          const modalShownKey = `welcomeModalShown_${currentUserId}`;
          const userHasLoggedBefore = localStorage.getItem(userLoginKey);
          const currentSession = sessionStorage.getItem(sessionKey);
          const modalAlreadyShown = sessionStorage.getItem(modalShownKey);

          // Verificar se o modal já foi exibido nesta sessão
          if (modalAlreadyShown === 'true') {
            console.log("Modal de Welcome já foi exibido nesta sessão - não mostrar novamente");
            setShowWelcomeModal(false);
            restoreScroll();
            return;
          }

          if (!userHasLoggedBefore) {
            console.log("Primeiro login detectado para esta conta!");
            setIsFirstLogin(true);
            setShowWelcomeModal(true);
            preventScroll();
            localStorage.setItem(userLoginKey, 'true');
            localStorage.setItem('hasLoggedInBefore', 'true');
            sessionStorage.setItem(sessionKey, 'active');
            sessionStorage.setItem(modalShownKey, 'true');
          } else if (!currentSession && !modalAlreadyShown) {
            console.log("Nova sessão detectada - mostrando modal de boas-vindas");
            setIsFirstLogin(false);
            setShowWelcomeModal(true);
            preventScroll();
            sessionStorage.setItem(sessionKey, 'active');
            sessionStorage.setItem(modalShownKey, 'true');
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
            {/* Rota com apenas código único */}
            <Route path="/atividade/:uniqueCode" element={<AtividadeCompartilhadaPage />} />
            {/* Rota antiga para compatibilidade */}
            <Route path="/atividade/:activityId/:uniqueCode" element={<AtividadeCompartilhadaPage />} />
            {/* Modo Apresentação - rota pública */}
            <Route path="/atividade/:uniqueCode/apresentacao" element={<ModoApresentacaoAtividadePage />} />
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
                {/* Página de Vendas - Rota Principal Pública */}
                <Route path="/" element={<SalesPage />} />

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
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="turmas" element={<AlunoUnderConstruction />} />
                  <Route path="turmas/:id" element={<AlunoUnderConstruction />} />
                  <Route path="turmas/grupos2" element={<AlunoUnderConstruction />} />
                  <Route path="turmas/grupos" element={<AlunoUnderConstruction />} />
                  <Route path="turmas/grupos/:id" element={<AlunoUnderConstruction />} />
                  <Route path="comunidades" element={<AlunoUnderConstruction />} />
                  <Route path="pedidos-ajuda" element={<AlunoUnderConstruction />} />
                  <Route path="trilhas-school/alunos" element={<AlunoUnderConstruction />} />
                  <Route path="school-planner" element={<AlunoUnderConstruction />} />
                  <Route path="agenda" element={<AlunoUnderConstruction />} />
                  <Route path="explorar" element={<AlunoUnderConstruction />} />
                  <Route path="epictus-ia" element={<AlunoUnderConstruction />} />
                  <Route path="school-power" element={<SchoolPowerPageIndex />} />
                  <Route path="trilhas-school" element={<TrilhasSchoolProfessorInterface />} />
                  <Route path="trilhas-school/professores" element={<TrilhasSchoolProfessorInterface />} />
                  <Route path="agenda" element={<Agenda />} />
                  <Route path="biblioteca" element={<Biblioteca />} />
                  <Route path="carteira" element={<Carteira />} />
                  <Route path="organizacao" element={<Organizacao />} />
                  <Route path="novidades" element={<Novidades />} />
                  <Route path="configuracoes" element={<Configuracoes />} />
                  <Route path="planos-estudo" element={<PlanosEstudo />} />
                  <Route path="agente-school" element={<AgenteSchool />} />
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