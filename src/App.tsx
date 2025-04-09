
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/header/Header';
import Sidebar from './components/sidebar/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ThemeProvider } from './components/ThemeProvider';
import AuthPage from './components/auth/AuthPage';
import { FloatingChatSupport } from './components/chat/FloatingChatSupport';

function App() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Verificar autenticação no localStorage
    const checkAuth = () => {
      const auth = localStorage.getItem('isAuthenticated');
      setIsAuthenticated(auth === 'true');
      setIsLoading(false);
    };
    
    checkAuth();
    
    // Adicionar listener para eventos de login/logout
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // Checar se a rota atual é de autenticação
  const isAuthRoute = location.pathname === '/login' || 
                       location.pathname === '/register' ||
                       location.pathname === '/select-plan';

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="flex h-screen overflow-hidden bg-white dark:bg-[#0A2540]">
        {isAuthenticated && !isAuthRoute ? (
          <>
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-4">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  {/* Adicione mais rotas conforme necessário */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
            <FloatingChatSupport />
          </>
        ) : (
          <div className="w-full">
            <Routes>
              <Route 
                path="/login" 
                element={
                  <AuthPage>
                    <LoginForm />
                  </AuthPage>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <AuthPage>
                    <RegisterForm />
                  </AuthPage>
                } 
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
