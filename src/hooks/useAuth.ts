
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/types/user-profile";

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Verificar o usuário atual quando o componente monta
    const checkUser = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        
        // Obter o usuário atual
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw userError;
        }

        if (user) {
          // Buscar o perfil do usuário
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileError && profileError.code !== "PGRST116") {
            console.error("Erro ao buscar perfil:", profileError);
          }

          setAuthState({
            user,
            profile,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            profile: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("Erro de autenticação:", error);
        setAuthState({
          user: null,
          profile: null,
          isLoading: false,
          error: error instanceof Error ? error.message : "Erro de autenticação",
        });
      }
    };

    checkUser();

    // Configurar o listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        if (session?.user) {
          // Buscar o perfil do usuário quando ele faz login
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileError && profileError.code !== "PGRST116") {
            console.error("Erro ao buscar perfil:", profileError);
          }

          setAuthState({
            user: session.user,
            profile,
            isLoading: false,
            error: null,
          });
        }
      } else if (event === "SIGNED_OUT") {
        setAuthState({
          user: null,
          profile: null,
          isLoading: false,
          error: null,
        });
      }
    });

    return () => {
      // Limpar o listener quando o componente desmonta
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Erro ao fazer login" 
      }));
      return { success: false, error };
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signUp = async (email: string, password: string, userData: any = {}) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error("Erro ao criar conta:", error);
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Erro ao criar conta" 
      }));
      return { success: false, error };
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Erro ao fazer logout" 
      }));
      return { success: false, error };
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!authState.user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", authState.user.id)
        .select();

      if (error) throw error;

      // Atualizar o estado de perfil localmente
      if (data && data.length > 0) {
        setAuthState(prev => ({
          ...prev,
          profile: data[0] as UserProfile,
        }));
      }

      return { success: true, data };
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Erro ao atualizar perfil" 
      };
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
}
