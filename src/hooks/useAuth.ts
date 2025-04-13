
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

/**
 * Custom hook for authentication and user management
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("Iniciando aplicação e verificando autenticação...");
        
        // Get current session
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          const { user: authUser } = data.session;
          setUser(authUser);
          
          // Get profile data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
          
          // Determine best username
          let bestUsername = null;
          
          // Try localStorage
          const localUsername = localStorage.getItem('username');
          
          // Try sessionStorage 
          let sessionUsername = null;
          try { 
            sessionUsername = sessionStorage.getItem('username');
          } catch (e) {}
          
          // Determine best username
          if (profileData?.username && profileData.username !== 'Usuário') {
            bestUsername = profileData.username;
          } else if (localUsername && localUsername !== 'Usuário') {
            bestUsername = localUsername;
          } else if (sessionUsername && sessionUsername !== 'Usuário') {
            bestUsername = sessionUsername;
          } else if (authUser.email) {
            bestUsername = authUser.email.split('@')[0];
          }
          
          if (bestUsername) {
            setUsername(bestUsername);
            localStorage.setItem('username', bestUsername);
            try { sessionStorage.setItem('username', bestUsername); } catch (e) {}
            
            // Update profile if needed
            if (profileData && (!profileData.username || profileData.username === 'Usuário')) {
              await supabase
                .from('profiles')
                .update({ 
                  username: bestUsername,
                  updated_at: new Date().toISOString()
                })
                .eq('id', profileData.id);
            }
          }
        } else {
          console.log("Usuário não autenticado, redirecionando para login");
          setUser(null);
          navigate("/auth/login");
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/auth/login");
  };

  return {
    user,
    username,
    loading,
    logout,
    isAuthenticated: !!user
  };
}
