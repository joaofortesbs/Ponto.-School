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
  const [isLoading, setIsLoading] = useState(true); // Iniciar como true durante a inicialização inicial

  useEffect(() => {
    console.log("App carregado com sucesso!");
    
    // Verificação de autenticação simplificada para garantir carregamento
    const checkAuth = async () => {
      try {
        // Usar o localStorage primeiro por ser mais rápido
        if (localStorage.getItem('currentUser') || localStorage.getItem('user') || localStorage.getItem('isAuthenticated') === 'true') {
          console.log("Usuário autenticado via localStorage");
          setIsAuthenticated(true);
        } else {
          // Para desenvolvimento, manter autenticado
          setIsAuthenticated(true);
          console.log("Modo de desenvolvimento: autenticação automática");
        }
      } catch (error) {
        console.error("Erro na verificação de autenticação:", error);
        // Garantir que a aplicação carregue mesmo com erro
        setIsAuthenticated(true);
      } finally {
        // Finalizar o carregamento independente do resultado
        setIsLoading(false);
      }
    };

    // Simplificar a inicialização do banco de dados
    const initializeApp = async () => {
      try {
        // Inicializar DB com retry simplificado
        try {
          const success = await initializeDB();
          console.log("Inicialização do banco de dados Replit:", success ? "sucesso" : "modo fallback");
        } catch (err) {
          console.warn("Tentando método alternativo de inicialização");
          // Fallback para localStorage se o DB falhar
          localStorage.setItem('dbInitialized', 'true');
          // Configurar modo offline
          localStorage.setItem('isOfflineMode', 'true');
        }
      } catch (e) {
        console.error("Erro na inicialização:", e);
        // Configurar modo offline como fallback
        localStorage.setItem('isOfflineMode', 'true');
      } finally {
        // Sempre verificar autenticação, independente do resultado da inicialização
        checkAuth();
      }
    };
    
    // Iniciar a aplicação imediatamente com um pequeno atraso para garantir carregamento
    setTimeout(() => {
      initializeApp();
    }, 100);
    
    // Simplificar eventos online/offline
    const handleOnline = () => {
      console.log("Conexão de rede restaurada");
      localStorage.setItem('isOfflineMode', 'false');
      
      // Tentar sincronizar dados
      if (window.userService) {
        console.log("Tentando sincronizar dados...");
      }
    };
    
    const handleOffline = () => {
      console.log("Conexão de rede perdida, entrando em modo offline");
      localStorage.setItem('isOfflineMode', 'true');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Estado inicial
    if (!navigator.onLine) {
      console.log("Iniciando em modo offline");
      localStorage.setItem('isOfflineMode', 'true');
    } else {
      localStorage.setItem('isOfflineMode', 'false');
    }
    
    return () => {
      // Limpar event listeners corretamente
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
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