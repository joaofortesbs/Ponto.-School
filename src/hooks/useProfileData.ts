
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types/user-profile";
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useToast } from '@/components/ui/use-toast';

export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  birthDate: string;
}

export interface ProfileData {
  userProfile: UserProfile | null;
  contactInfo: ContactInfo;
  aboutMe: string | null;
}

export const useProfileData = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { handleError, safeAsync } = useErrorHandler();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Primeiro verificar se temos um usuário autenticado
        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError) {
          throw new Error(`Erro de autenticação: ${authError.message}`);
        }

        const user = authData.user;
        if (!user) {
          setLoading(false);
          return;
        }

        // Verificar cache primeiro para resposta rápida
        let cachedProfile = null;
        try {
          const cachedData = localStorage.getItem('userProfile');
          if (cachedData) {
            cachedProfile = JSON.parse(cachedData);
            const cacheTime = localStorage.getItem('userProfileCacheTime');
            // Se cache válido por menos de 2 minutos, usá-lo
            if (cacheTime && (Date.now() - parseInt(cacheTime)) < 2 * 60 * 1000) {
              // Montar dados do perfil a partir do cache
              if (cachedProfile) {
                const userProfile = {
                  ...cachedProfile,
                  level: cachedProfile.level || 1,
                  rank: cachedProfile.rank || "Aprendiz",
                };

                const contactInfo = {
                  email: cachedProfile.email || user.email || "",
                  phone: cachedProfile.phone || "Adicionar telefone",
                  location: cachedProfile.location || "Adicionar localização",
                  birthDate: cachedProfile.birth_date || 
                    (user.user_metadata?.birth_date) || 
                    (user.raw_user_meta_data?.birth_date) || 
                    "Adicionar data de nascimento",
                };

                const aboutMe = cachedProfile.bio || null;

                setProfileData({
                  userProfile,
                  contactInfo,
                  aboutMe
                });
                
                // Atualizar em background e continuar
                fetchAndUpdateProfileInBackground(user.id);
                return;
              }
            }
          }
        } catch (cacheError) {
          console.warn("Erro ao acessar cache do perfil:", cacheError);
          // Continuar com a busca do perfil no backend
        }

        // Buscar dados do perfil no Supabase
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (fetchError) {
          // Se for erro de rede e temos cache, usar cache como fallback
          if (fetchError.message.includes('network') && cachedProfile) {
            // Usar perfil em cache como fallback e notificar usuário
            const userProfile = {
              ...cachedProfile,
              level: cachedProfile.level || 1,
              rank: cachedProfile.rank || "Aprendiz",
            };

            setProfileData({
              userProfile,
              contactInfo: {
                email: cachedProfile.email || user.email || "",
                phone: cachedProfile.phone || "Adicionar telefone",
                location: cachedProfile.location || "Adicionar localização",
                birthDate: cachedProfile.birth_date || "Adicionar data de nascimento",
              },
              aboutMe: cachedProfile.bio || null
            });
            
            toast({
              title: "Conexão limitada",
              description: "Estamos usando dados salvos anteriormente. Algumas informações podem estar desatualizadas.",
              variant: "default"
            });
            
            setLoading(false);
            return;
          }
          
          throw new Error(`Erro ao buscar perfil: ${fetchError.message}`);
        }

        if (!data) {
          setLoading(false);
          return;
        }

        // Processar dados obtidos
        // Ensure level and rank are set with defaults if not present
        const userProfile: UserProfile = {
          ...(data as unknown as UserProfile),
          level: data.level || 1,
          rank: data.rank || "Aprendiz",
        };

        // Set contact info from user data
        const contactInfo: ContactInfo = {
          email: data.email || user.email || "",
          phone: data.phone || "Adicionar telefone",
          location: data.location || "Adicionar localização",
          birthDate: data.birth_date || 
            (user.user_metadata?.birth_date) || 
            (user.raw_user_meta_data?.birth_date) || 
            "Adicionar data de nascimento",
        };

        const aboutMe = data.bio || null;

        // Atualizar cache com os novos dados
        try {
          localStorage.setItem('userProfile', JSON.stringify(data));
          localStorage.setItem('userProfileCacheTime', Date.now().toString());
        } catch (storageError) {
          console.warn("Erro ao atualizar cache do perfil:", storageError);
        }

        setProfileData({
          userProfile,
          contactInfo,
          aboutMe
        });
      } catch (error) {
        const handledError = await handleError(
          error, 
          "Falha ao carregar seu perfil", 
          {
            retry: fetchProfileData,
            silent: false
          }
        );
        setError(handledError);
        
        // Tentar usar cache como fallback em caso de erro
        try {
          const cachedProfile = localStorage.getItem('userProfile');
          if (cachedProfile) {
            const parsedProfile = JSON.parse(cachedProfile);
            // Montar um perfil básico a partir do cache
            setProfileData({
              userProfile: parsedProfile,
              contactInfo: {
                email: parsedProfile.email || "",
                phone: parsedProfile.phone || "Adicionar telefone",
                location: parsedProfile.location || "Adicionar localização",
                birthDate: parsedProfile.birth_date || "Adicionar data de nascimento",
              },
              aboutMe: parsedProfile.bio || null
            });
            
            toast({
              title: "Usando dados salvos",
              description: "Não foi possível conectar ao servidor. Estamos usando dados salvos anteriormente.",
              variant: "default"
            });
          }
        } catch (cacheError) {
          console.error("Erro ao usar cache como fallback:", cacheError);
        }
      } finally {
        setLoading(false);
      }
    };

    // Função para atualizar o perfil em background sem bloquear a UI
    const fetchAndUpdateProfileInBackground = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) return;

        if (data) {
          // Atualizar o cache
          localStorage.setItem('userProfile', JSON.stringify(data));
          localStorage.setItem('userProfileCacheTime', Date.now().toString());
          
          // Atualizar o estado sem mostrar loading
          const userProfile = {
            ...(data as unknown as UserProfile),
            level: data.level || 1,
            rank: data.rank || "Aprendiz",
          };

          // Obter o usuário atual para informações adicionais
          const { data: userData } = await supabase.auth.getUser();
          const user = userData?.user;

          // Set contact info from user data
          const contactInfo: ContactInfo = {
            email: data.email || user?.email || "",
            phone: data.phone || "Adicionar telefone",
            location: data.location || "Adicionar localização",
            birthDate: data.birth_date || 
              (user?.user_metadata?.birth_date) || 
              (user?.raw_user_meta_data?.birth_date) || 
              "Adicionar data de nascimento",
          };

          const aboutMe = data.bio || null;

          setProfileData({
            userProfile,
            contactInfo,
            aboutMe
          });
        }
      } catch (e) {
        // Silenciar erros em atualizações em background
        console.warn("Erro ao atualizar perfil em segundo plano:", e);
      }
    };

    fetchProfileData();
  }, []);

  const refreshProfile = async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.user) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.session.user.id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Atualizar o cache
        localStorage.setItem('userProfile', JSON.stringify(data));
        localStorage.setItem('userProfileCacheTime', Date.now().toString());
        
        // Atualizar o estado
        const userProfile = {
          ...(data as unknown as UserProfile),
          level: data.level || 1,
          rank: data.rank || "Aprendiz",
        };

        // Set contact info from user data
        const contactInfo: ContactInfo = {
          email: data.email || session.session.user.email || "",
          phone: data.phone || "Adicionar telefone",
          location: data.location || "Adicionar localização",
          birthDate: data.birth_date || 
            (session.session.user.user_metadata?.birth_date) || 
            (session.session.user.raw_user_meta_data?.birth_date) || 
            "Adicionar data de nascimento",
        };

        const aboutMe = data.bio || null;

        setProfileData({
          userProfile,
          contactInfo,
          aboutMe
        });
        
        toast({
          title: "Perfil atualizado",
          description: "Seus dados foram atualizados com sucesso",
          variant: "default"
        });
      }
    } catch (error) {
      handleError(error, "Não foi possível atualizar seu perfil", {
        retry: refreshProfile
      });
    } finally {
      setLoading(false);
    }
  };

  return { profileData, loading, error, refreshProfile };
};

export default useProfileData;
