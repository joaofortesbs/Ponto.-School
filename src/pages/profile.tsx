
import React from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ProfilePage from "@/components/profile/ProfilePage";
import { motion } from "framer-motion";
import ErrorBoundary from "@/components/ErrorBoundary";

// Componente principal Profile que renderiza a estrutura da página
const Profile = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-[#f7f9fa] dark:bg-[#001427] transition-colors duration-300">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <motion.main 
            className="flex-1 overflow-y-auto bg-[#f7f9fa] dark:bg-[#001427] transition-colors duration-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ErrorBoundary fallback={
              <div className="flex flex-col items-center justify-center h-full p-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
                  <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Erro ao carregar perfil</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    Não foi possível carregar os dados do seu perfil. Por favor, tente novamente em alguns instantes.
                  </p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="w-full py-2 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white rounded-md transition-colors"
                  >
                    Tentar novamente
                  </button>
                </div>
              </div>
            }>
              <ProfilePage isOwnProfile={true} />
            </ErrorBoundary>
          </motion.main>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Profile;
