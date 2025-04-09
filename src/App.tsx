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

    // Verificação de conexão com Supabase e autenticação
    const checkAuthAndConnection = async () => {
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
          // Continuar mesmo com erro de conexão
        }

        // Verificação de autenticação (com tratamento de erro)
        try {
          const { data } = await supabase.auth.getSession();
          setIsAuthenticated(!!data.session || import.meta.env.DEV); // Em desenvolvimento, permite acesso sem autenticação
        } catch (authError) {
          console.warn("Aviso: Erro na verificação de autenticação:", authError);
          setIsAuthenticated(import.meta.env.DEV); // Em desenvolvimento, permite acesso sem autenticação
        }
      } catch (error) {
        console.error("Auth/connection check error:", error);
        setIsAuthenticated(import.meta.env.DEV); // Em desenvolvimento, permite acesso sem autenticação
      } finally {
        // Sempre definir loading como false para garantir a renderização
        setIsLoading(false);
      }
    };

    // Definir um timeout para garantir que a aplicação será carregada mesmo se houver problemas
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
      setIsAuthenticated(true);
      console.log("Timeout de carregamento atingido. Forçando renderização.");
    }, 3000);

    checkAuthAndConnection();

    // Limpar timeout se a verificação terminar antes
    return () => clearTimeout(loadingTimeout);
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