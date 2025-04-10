import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ProfilePage from "@/components/profile/ProfilePage";
import { motion } from "framer-motion";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Componente principal Profile que renderiza a estrutura da página
const Profile = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Controlar o tempo de carregamento
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  // Fallback em caso de erro
  const ErrorFallback = ({ error }: { error: Error }) => (
    <div className="p-8 text-center">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-2">
          Ocorreu um problema ao carregar seu perfil
        </h2>
        <p className="text-red-700 dark:text-red-300 mb-4">
          Estamos trabalhando para resolver isso o mais rápido possível.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f7f9fa] dark:bg-[#001427] transition-colors duration-300">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#f7f9fa] dark:bg-[#001427] transition-colors duration-300">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-pulse text-xl text-gray-500 dark:text-gray-400">
                Carregando seu perfil...
              </div>
            </div>
          ) : (
            <ErrorBoundary
              fallback={ErrorFallback}
              onError={(error) => console.error("Erro na página de perfil:", error)}
            >
              <ProfilePage isOwnProfile={true} />
            </ErrorBoundary>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;