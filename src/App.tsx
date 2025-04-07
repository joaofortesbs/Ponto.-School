import React, { Suspense, useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useRoutes,
  useLocation,
} from "react-router-dom";
import routes from "./tempo-routes";
import Home from "@/components/home";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import FloatingChatSupport from "@/components/chat/FloatingChatSupport";
import { supabase } from "@/lib/supabase";
import { StudyGoalProvider } from "@/components/dashboard/StudyGoalContext";

// Importações imediatas (sem lazy loading) para garantir carregamento instantâneo
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

// Auth Pages - importações diretas
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import ForgotPasswordPage from "@/pages/auth/forgot-password";
import ResetPasswordPage from "@/pages/auth/reset-password";
import PlanSelectionPage from "@/pages/plan-selection";

// User Pages - importação direta
import ProfilePage from "@/pages/profile";

function App() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(!!data.session);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuthenticated(!!session);
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Check if current route is login, register, or plan selection
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
          {import.meta.env.VITE_TEMPO && useRoutes(routes)}
          <Routes>
            {/* Auth Routes - Sem Suspense para carregamento instantâneo */}
            <Route
              path="/login"
              element={<LoginPage />}
            />
            <Route
              path="/register"
              element={<RegisterPage />}
            />
            <Route
              path="/forgot-password"
              element={<ForgotPasswordPage />}
            />
            <Route
              path="/reset-password"
              element={<ResetPasswordPage />}
            />
            <Route
              path="/select-plan"
              element={<PlanSelectionPage />}
            />

            {/* Main App Routes - Sem Suspense para carregamento instantâneo */}
            <Route path="/" element={<Home />}>
              <Route
                index
                element={<Dashboard />}
              />
              <Route
                path="turmas"
                element={<Turmas />}
              />
              <Route
                path="turmas/:id"
                element={<TurmaDetail />}
              />
              <Route
                path="turmas/grupos2"
                element={<GruposEstudo2 />}
              />
              <Route
                path="turmas/grupos"
                element={<GruposEstudo />}
              />
              <Route
                path="turmas/grupos/:id"
                element={<GruposEstudo />}
              />
              <Route
                path="comunidades"
                element={<Comunidades />}
              />
              <Route
                path="pedidos-ajuda"
                element={<PedidosAjuda />}
              />
              <Route
                path="epictus-ia"
                element={<EpictusIA />}
              />
              <Route
                path="agenda"
                element={<Agenda />}
              />
              <Route
                path="biblioteca"
                element={<Biblioteca />}
              />
              <Route
                path="mercado"
                element={<Mercado />}
              />
              <Route
                path="conquistas"
                element={<Conquistas />}
              />
              <Route
                path="carteira"
                element={<Carteira />}
              />
              <Route
                path="organizacao"
                element={<Organizacao />}
              />
              <Route
                path="novidades"
                element={<Novidades />}
              />
              <Route
                path="configuracoes"
                element={<Configuracoes />}
              />
              <Route
                path="planos-estudo"
                element={<PlanosEstudo />}
              />
              <Route
                path="portal"
                element={<Portal />}
              />
            </Route>

            {/* User Profile - Sem Suspense */}
            <Route
              path="/profile"
              element={<ProfilePage />}
            />

            {/* Tempo Routes */}
            {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}
            <Route path="/agenda-preview" element={<Agenda />} />
            <Route path="/agenda-standalone" element={<Agenda />} />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          {/* Floating Chat Support */}
          {isAuthenticated && !isAuthRoute && !isLoading && (
            <FloatingChatSupport />
          )}
        </div>
        <Toaster />
      </StudyGoalProvider>
    </ThemeProvider>
  );
}

export default App;
