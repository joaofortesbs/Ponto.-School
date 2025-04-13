
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export interface AuthUser {
  id: string;
  email?: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  [key: string]: any;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Carregar usuário inicial
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Buscar perfil do usuário
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          setUser({
            id: session.user.id,
            email: session.user.email,
            displayName: profile?.display_name || session.user.email?.split('@')[0],
            avatarUrl: profile?.avatar_url,
            ...profile
          });
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Escutar mudanças na autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          // Buscar perfil do usuário
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          setUser({
            id: session.user.id,
            email: session.user.email,
            displayName: profile?.display_name || session.user.email?.split('@')[0],
            avatarUrl: profile?.avatar_url,
            ...profile
          });
        }
        
        if (event === "SIGNED_OUT") {
          setUser(null);
          navigate("/auth/login");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  // Login com email/senha
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || "Falha ao fazer login" 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Registro
  const register = useCallback(async (email: string, password: string, userData?: Record<string, any>) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || "Falha ao registrar usuário" 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || "Falha ao fazer logout" 
      };
    }
  }, []);

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };
}
