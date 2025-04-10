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
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }

  // Se estiver autenticado, renderiza as rotas filhas
  return isAuthenticated ? children : null;
}

function App() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false); // Added state
  const [isFirstLogin, setIsFirstLogin] = useState(false); // Added state


  useEffect(() => {
    console.log("App carregado com sucesso!");

    // Verificação de conexão com Supabase
    const checkConnection = async () => {
      try {
        // Tentar verificar conexão com Supabase (com tratamento de erro)
        try {
          const { checkSupabaseConnection, setupSupabaseHealthCheck } = await import('@/lib/supabase');

          // Primeiro configurar verificação de saúde (apenas em desenvolvimento)
          if (import.meta.env.DEV) {
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
      }
    };

    // Definir um timeout para garantir que a aplicação será carregada mesmo se houver problemas
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
      console.log("Timeout de carregamento atingido. Forçando renderização.");
    }, 3000);

    checkConnection();

    // Verificar logout
    const handleLogout = () => {
      localStorage.removeItem('auth_status');
      localStorage.removeItem('auth_checked');
    };

    window.addEventListener('logout', handleLogout);

    // Limpar timeout se a verificação terminar antes
    return () => {
      clearTimeout(loadingTimeout);
      window.removeEventListener('logout', handleLogout);
    };
  }, []);

  // Rotas de autenticação
  const isAuthRoute = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/select-plan",
    "/admin/db-console",
  ].some((route) => location.pathname.startsWith(route));

  // Verificar se está na rota raiz e redirecionar para login se não estiver autenticado
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
    const checkAuth = async () => {
      try {
        const isAuthenticated = await checkAuthentication();
        
        // Verificar a rota atual
        const isAuthRoute = [
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/select-plan",
        ].some((route) => location.pathname.startsWith(route));
        
        // Não mostrar o modal nas rotas de autenticação
        if (isAuthRoute) {
          setShowWelcomeModal(false);
          return;
        }

        // Verificar se é o primeiro login do usuário
        const hasLoggedInBefore = localStorage.getItem('hasLoggedInBefore');

        if (isAuthenticated) {
          // Obter ID do usuário atual para controle de primeiro login por conta
          const { data: { session } } = await supabase.auth.getSession();
          const currentUserId = session?.user?.id;
          
          // Chave específica para este usuário
          const userLoginKey = currentUserId ? `hasLoggedInBefore_${currentUserId}` : null;
          const userHasLoggedBefore = userLoginKey ? localStorage.getItem(userLoginKey) : null;

          if (currentUserId && !userHasLoggedBefore) {
            // Primeiro login desta conta específica
            console.log("Primeiro login detectado para esta conta!");
            setIsFirstLogin(true);
            setShowWelcomeModal(true);
            localStorage.setItem(userLoginKey, 'true');
            
            // Manter compatibilidade com código existente
            if (!hasLoggedInBefore) {
              localStorage.setItem('hasLoggedInBefore', 'true');
            }
          } else if (currentUserId) {
            // Login subsequente para esta conta
            console.log("Login subsequente detectado para esta conta");
            setIsFirstLogin(false);
            setShowWelcomeModal(true);
          }
        }
        console.log("Aplicação inicializada com sucesso.");

      } catch (error) {
        console.error("Erro ao inicializar aplicação:", error);
      }
    };

    console.log("Iniciando aplicação...");
    checkAuth();
  }, [location.pathname]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
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
    </ThemeProvider>
  );
}

export default App;