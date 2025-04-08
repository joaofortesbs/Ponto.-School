import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import routes from "./tempo-routes";
import Home from "@/components/home";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import FloatingChatSupport from "@/components/chat/FloatingChatSupport";
import { supabase } from "@/lib/supabase";
import { StudyGoalProvider } from "@/components/dashboard/StudyGoalContext";
import { initializeDB, UserService } from "@/lib/replitDB"; // Added import for Replit DB initialization

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

function App() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default como true para garantir carregamento
  const [isLoading, setIsLoading] = useState(false); // Iniciar como false para exibir logo

  useEffect(() => {
    console.log("App carregado com sucesso!");
    
    // Forçar isLoading para iniciar renderização
    setIsLoading(true);

    // Verificação de autenticação com fallback para métodos locais
    const checkAuth = async () => {
      try {
        // Verificar primeiramente no localStorage (mais rápido e não depende de conexão)
        if (UserService.isUserLoggedIn()) {
          console.log("Usuário autenticado via localStorage");
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
        
        // Tentar verificar no Supabase como fallback
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            console.log("Usuário autenticado via Supabase");
            setIsAuthenticated(true);
          } else {
            console.log("Nenhuma sessão encontrada, definindo como autenticado para desenvolvimento");
            // Permita acesso sem login para desenvolvimento
            setIsAuthenticated(true);
          }
        } catch (supabaseError) {
          console.warn("Erro na verificação do Supabase:", supabaseError);
          console.log("Continuando em modo offline");
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Erro na verificação de autenticação:", error);
        setIsAuthenticated(true); // Força true para sempre exibir o conteúdo
      } finally {
        setIsLoading(false);
      }
    };

    // Inicializar o banco de dados do Replit
    const initializeApp = async () => {
      try {
        const success = await initializeDB();
        console.log("Inicialização do banco de dados Replit:", success ? "sucesso" : "modo fallback");
      } catch (err) {
        console.error("Erro ao inicializar banco de dados Replit:", err);
        console.log("Usando modo localStorage como fallback");
      }
      
      // Verificar autenticação após inicialização do banco
      checkAuth();
    };
    
    // Iniciar a aplicação
    initializeApp();
      
    // Adicionar eventos para gerenciar estado online/offline
    window.addEventListener('online', () => {
      console.log("Conexão de rede restaurada");
      localStorage.setItem('isOfflineMode', 'false');
      // Não recarrega imediatamente para não perder dados não salvos
    });
    
    window.addEventListener('offline', () => {
      console.log("Conexão de rede perdida, entrando em modo offline");
      localStorage.setItem('isOfflineMode', 'true');
    });
    
    // Verificar estado atual da conexão
    if (!navigator.onLine) {
      console.log("Iniciando em modo offline");
      localStorage.setItem('isOfflineMode', 'true');
    }
    
    return () => {
      // Limpar event listeners quando o componente for desmontado
      window.removeEventListener('online', () => {});
      window.removeEventListener('offline', () => {});
    };
  }, []);

  // Rotas de autenticação
  const isAuthRoute = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/select-plan",
  ].some((route) => location.pathname.startsWith(route));

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <StudyGoalProvider>
        <div className="min-h-screen bg-background font-body antialiased dark:bg-[#001427]">
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/select-plan" element={<PlanSelectionPage />} />

            {/* Main App Routes */}
            <Route path="/" element={<Home />}>
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

            {/* User Profile */}
            <Route path="/profile" element={<ProfilePage />} />

            {/* Agenda standalone */}
            <Route path="/agenda-preview" element={<Agenda />} />
            <Route path="/agenda-standalone" element={<Agenda />} />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          {/* Floating Chat Support */}
          {!isAuthRoute && !isLoading && <FloatingChatSupport />}
        </div>
        <Toaster />
      </StudyGoalProvider>
    </ThemeProvider>
  );
}

export default App;