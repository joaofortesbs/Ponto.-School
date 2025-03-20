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

// Main Dashboard Components
const Dashboard = React.lazy(() => import("@/pages/dashboard"));
const Turmas = React.lazy(() => import("@/pages/turmas"));
const TurmaDetail = React.lazy(() => import("@/pages/turmas/[id]"));
const Comunidades = React.lazy(() => import("@/pages/comunidades"));
const PedidosAjuda = React.lazy(() => import("@/pages/pedidos-ajuda"));
const EpictusIA = React.lazy(() => import("@/pages/epictus-ia"));
const Agenda = React.lazy(() => import("@/pages/agenda"));
const Biblioteca = React.lazy(() => import("@/pages/biblioteca"));
const Mercado = React.lazy(() => import("@/pages/mercado"));
const Conquistas = React.lazy(() => import("@/pages/conquistas"));
const Carteira = React.lazy(() => import("@/pages/carteira"));
const Organizacao = React.lazy(() => import("@/pages/organizacao"));
const Novidades = React.lazy(() => import("@/pages/novidades"));
const Configuracoes = React.lazy(() => import("@/pages/configuracoes"));
const PlanosEstudo = React.lazy(() => import("@/pages/planos-estudo"));
const Portal = React.lazy(() => import("@/pages/portal"));

// Auth Pages
const LoginPage = React.lazy(() => import("@/pages/auth/login"));
const RegisterPage = React.lazy(() => import("@/pages/auth/register"));
const ForgotPasswordPage = React.lazy(
  () => import("@/pages/auth/forgot-password"),
);
const ResetPasswordPage = React.lazy(
  () => import("@/pages/auth/reset-password"),
);
const PlanSelectionPage = React.lazy(() => import("@/pages/plan-selection"));

// User Pages
const ProfilePage = React.lazy(() => import("@/pages/profile"));

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

  // Loading component
  const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B00]"></div>
    </div>
  );

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <StudyGoalProvider>
        <div className="min-h-screen bg-background font-body antialiased dark:bg-[#001427]">
          {import.meta.env.VITE_TEMPO && useRoutes(routes)}
          <Routes>
            {/* Auth Routes */}
            <Route
              path="/login"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <LoginPage />
                </Suspense>
              }
            />
            <Route
              path="/register"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <RegisterPage />
                </Suspense>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <ForgotPasswordPage />
                </Suspense>
              }
            />
            <Route
              path="/reset-password"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <ResetPasswordPage />
                </Suspense>
              }
            />
            <Route
              path="/select-plan"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <PlanSelectionPage />
                </Suspense>
              }
            />

            {/* Main App Routes */}
            <Route path="/" element={<Home />}>
              <Route
                index
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Dashboard />
                  </Suspense>
                }
              />
              <Route
                path="turmas"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Turmas />
                  </Suspense>
                }
              />
              <Route
                path="turmas/:id"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <TurmaDetail />
                  </Suspense>
                }
              />
              <Route
                path="comunidades"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Comunidades />
                  </Suspense>
                }
              />
              <Route
                path="pedidos-ajuda"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <PedidosAjuda />
                  </Suspense>
                }
              />
              <Route
                path="epictus-ia"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <EpictusIA />
                  </Suspense>
                }
              />
              <Route
                path="agenda"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Agenda />
                  </Suspense>
                }
              />
              <Route
                path="biblioteca"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Biblioteca />
                  </Suspense>
                }
              />
              <Route
                path="mercado"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Mercado />
                  </Suspense>
                }
              />
              <Route
                path="conquistas"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Conquistas />
                  </Suspense>
                }
              />
              <Route
                path="carteira"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Carteira />
                  </Suspense>
                }
              />
              <Route
                path="organizacao"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Organizacao />
                  </Suspense>
                }
              />
              <Route
                path="novidades"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Novidades />
                  </Suspense>
                }
              />
              <Route
                path="configuracoes"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Configuracoes />
                  </Suspense>
                }
              />
              <Route
                path="planos-estudo"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <PlanosEstudo />
                  </Suspense>
                }
              />
              <Route
                path="portal"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Portal />
                  </Suspense>
                }
              />
            </Route>

            {/* User Profile */}
            <Route
              path="/profile"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <ProfilePage />
                </Suspense>
              }
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
