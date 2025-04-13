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
import { ThemeProvider } from "@/components/ThemeProvider.tsx";
import { Toaster } from "@/components/ui/toaster";
import FloatingChatSupport from "@/components/chat/FloatingChatSupport";
import { supabase } from "@/lib/supabase";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";
import { KeyboardNavigationHelper } from "@/components/keyboard-navigation-helper.tsx";
import { checkAuthentication } from "@/lib/auth-utils";
import { StudyGoalProvider } from "@/components/dashboard/StudyGoalContext";
import UsernameProvider from "./components/UsernameProvider"; // Added import

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
import Mercado from "@/pages/mercado";
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
import WelcomeModal from "./components/auth/WelcomeModal"; // Added import
import { TypewriterLoader } from "./components/ui/typewriter-loader"; // Added import


// Componente para proteger rotas
function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Forçar verificação do Supabase para garantir o estado correto
        const { data } = await supabase.auth.getSession();
        const isAuth = !!data.session;

        // Atualizar o estado no localStorage
        localStorage.setItem('auth_checked', 'true');
        localStorage.setItem('auth_status', isAuth ? 'authenticated' : 'unauthenticated');

        setIsAuthenticated(isAuth);

        if (!isAuth) {
          console.log("Usuário não autenticado, redirecionando para login");
          // Redirecionar para login se não estiver autenticado
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        // Em caso de erro, redirecionar para login por segurança
        localStorage.removeItem('auth_checked');
        localStorage.removeItem('auth_status');
        navigate('/login', { replace: true });
      } finally {
        setIsCheckingAuth(false);
      }
    };

    // Executar verificação ao carregar o componente
    checkAuth();
  }, [navigate]);

  // Mostrar nada enquanto verifica autenticação
  if (isCheckingAuth) {
    return <TypewriterLoader />; // Replaced loading spinner
  }

  // Se estiver autenticado, renderiza as rotas filhas
  return isAuthenticated ? children : null;
}

// Hooks específicos para lógica de inicialização do App
import { useAppInitialization } from "@/hooks/useAppInitialization";
import { useAuthRedirection } from "@/hooks/useAuthRedirection";
import { useWelcomeModal } from "@/hooks/useWelcomeModal";

function App() {
  const location = useLocation();
  
  // Separando a lógica em hooks customizados
  const { isLoading } = useAppInitialization();
  const { isAuthRoute } = useAuthRedirection();
  const { 
    showWelcomeModal, 
    setShowWelcomeModal, 
    isFirstLogin 
  } = useWelcomeModal(location.pathname, isAuthRoute);

  return (
    <AccessibilityProvider>
      <KeyboardNavigationHelper />
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <UsernameProvider>
          <StudyGoalProvider>
            <ErrorBoundary>
              {/* Skip link para acessibilidade */}
              <a href="#main-content" className="skip-link">
                Pular para o conteúdo principal
              </a>
            <div id="main-content" className="min-h-screen bg-background font-body antialiased dark:bg-[#001427]">
              <Routes>
                {/* Auth Routes - Públicas */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/select-plan" element={<PlanSelectionPage />} />

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
                  <Route path="epictus-ia" element={<EpictusIA />} />
                  <Route path="agenda" element={<Agenda />} />
                  <Route path="biblioteca" element={<Biblioteca />} />
                  <Route path="mercado" element={<Mercado />} />
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

              {/* Floating Chat Support */}
              {!isAuthRoute && !isLoading && <FloatingChatSupport />}

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
    </AccessibilityProvider>
  );
}

export default App;