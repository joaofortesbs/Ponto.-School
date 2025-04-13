import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Suspense, useEffect, useState } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { UsernameProvider } from "@/components/UsernameProvider";
import "@/lib/logo-utils";

// Contextos
import { ViewProvider } from "@/contexts/ViewContext";
import { EpictusIAProvider } from "@/contexts/EpictusIAContext";
import { ProfileProvider } from "@/contexts/ProfileContext";

// Layout & Components
import AuthPage from "@/components/auth/AuthPage";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/header/Header";

// Pages
import Dashboard from "@/components/dashboard/Dashboard";
import PortalPage from "@/pages/portal/PortalPage";
import AgendaPage from "@/pages/agenda";
import ProfilePage from "@/components/profile/ProfilePage";
import TurmasView from "@/components/turmas/TurmasView";
import PlanSelection from "@/components/auth/PlanSelection";
import PlanSelectionRedesigned from "@/components/auth/PlanSelectionRedesigned";
import EpictusIAInterface from "@/components/epictus-ia/EpictusIAInterface";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular verificação de autenticação
    const checkAuth = () => {
      const token = localStorage.getItem("sb-session");
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };

    checkAuth();

    // Simular carregamento inicial
    const timer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="typewriter-container">
          <div className="typewriter">
            <div className="slide"><i></i></div>
            <div className="paper"></div>
            <div className="keyboard"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <ErrorBoundary>
        <UsernameProvider>
          <ProfileProvider>
            <EpictusIAProvider>
              <ViewProvider>
                <BrowserRouter>
                  <Suspense fallback={<div>Carregando...</div>}>
                    <Routes>
                      {/* Rotas públicas */}
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/plans" element={<PlanSelection />} />
                      <Route path="/plans-new" element={<PlanSelectionRedesigned />} />

                      {/* Rotas protegidas */}
                      {isAuthenticated ? (
                        <Route
                          path="/*"
                          element={
                            <div className="flex h-screen overflow-hidden">
                              <Sidebar />
                              <div className="flex flex-col flex-1 w-0 overflow-hidden">
                                <Header />
                                <main className="relative flex-1 overflow-y-auto focus:outline-none">
                                  <div className="py-6">
                                    <div className="max-w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
                                      <Routes>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/dashboard" element={<Dashboard />} />
                                        <Route path="/portal" element={<PortalPage />} />
                                        <Route path="/turmas" element={<TurmasView />} />
                                        <Route path="/profile" element={<ProfilePage />} />
                                        <Route path="/agenda" element={<AgendaPage />} />
                                        <Route path="/epictus-ia" element={<EpictusIAInterface />} />
                                      </Routes>
                                    </div>
                                  </div>
                                </main>
                              </div>
                            </div>
                          }
                        />
                      ) : (
                        <Route path="/*" element={<Navigate to="/auth" replace />} />
                      )}
                    </Routes>
                  </Suspense>
                </BrowserRouter>
                <Toaster />
              </ViewProvider>
            </EpictusIAProvider>
          </ProfileProvider>
        </UsernameProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}