import React, { useState, useEffect } from "react";
import MetricsGrid from "./MetricsGrid";
import TopMetrics from "./TopMetrics";
import PromotionalBanner from "./PromotionalBanner";
import { profileService } from "@/services/profileService";
import { UserProfile } from "@/types/user-profile";

import { ApiErrorAlert } from "@/components/ui/api-error-alert";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function Dashboard() {
  const [showBanner, setShowBanner] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isMetricsLoading, setIsMetricsLoading] = useState(false);
  const [profileError, setProfileError] = useState<Error | null>(null);
  const { handleError, safeAsync } = useErrorHandler();
  const { toast } = useToast();

  // Carregar perfil do usuário
  const loadUserProfile = async () => {
    // Verificar cache primeiro para exibição instantânea
    try {
      const cachedProfile = localStorage.getItem('userProfile');
      if (cachedProfile) {
        try {
          setUserProfile(JSON.parse(cachedProfile));
        } catch (e) {
          console.warn('Erro ao parsear perfil em cache:', e);
        }
      }
    } catch (storageError) {
      console.warn("Erro ao acessar localStorage:", storageError);
    }
    
    // Buscar do backend
    try {
      const profile = await profileService.getCurrentUserProfile();
      
      if (profile) {
        setUserProfile(profile);
        // Atualizar cache
        try {
          localStorage.setItem('userProfile', JSON.stringify(profile));
          localStorage.setItem('userProfileCacheTime', Date.now().toString());
        } catch (storageError) {
          console.warn("Erro ao salvar cache do perfil:", storageError);
        }
      }
    } catch (error) {
      // Se já temos um perfil do cache, mostrar toast em vez de erro grande
      if (userProfile) {
        toast({
          title: "Aviso",
          description: "Não foi possível atualizar seus dados. Usando informações salvas anteriormente.",
          variant: "default"
        });
      } else {
        const handledError = await handleError(error, "Não foi possível carregar seu perfil", {
          retry: loadUserProfile
        });
        setProfileError(handledError);
      }
    }
  };

  useEffect(() => {
    loadUserProfile();
    
    // Configurar um intervalo para atualizar o perfil periodicamente
    const intervalId = setInterval(() => {
      // Verificar se é hora de atualizar o cache (a cada 5 minutos)
      try {
        const cacheTime = localStorage.getItem('userProfileCacheTime');
        if (!cacheTime || (Date.now() - parseInt(cacheTime) > 5 * 60 * 1000)) {
          // Atualizar silenciosamente em segundo plano
          profileService.getCurrentUserProfile()
            .then(profile => {
              if (profile) {
                setUserProfile(profile);
                localStorage.setItem('userProfile', JSON.stringify(profile));
                localStorage.setItem('userProfileCacheTime', Date.now().toString());
              }
            })
            .catch(error => console.warn("Erro ao atualizar perfil em segundo plano:", error));
        }
      } catch (e) {
        console.warn("Erro ao verificar tempo de cache:", e);
      }
    }, 60000); // Verificar a cada minuto
    
    return () => clearInterval(intervalId);
  }, []);

  // Função para gerar o nome de saudação do usuário
  const getUserFirstName = () => {
    try {
      // Obter o primeiro nome do usuário com prioridade consistente
      const firstName = userProfile?.full_name?.split(' ')[0] || 
                        userProfile?.display_name || 
                        localStorage.getItem('userFirstName') || 
                        "Usuário";
      // Salvar no localStorage para uso no sidebar e outros componentes
      localStorage.setItem('userFirstName', firstName);
      return firstName;
    } catch (e) {
      console.warn("Erro ao definir nome do usuário:", e);
      return "Usuário";
    }
  };

  // Função para recarregar o dashboard em caso de erro
  const handleReloadDashboard = () => {
    setProfileError(null);
    loadUserProfile();
  };

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 space-y-6 transition-colors duration-300">
      {/* Banner com prioridade de renderização */}
      <div className="priority-render">
        <PromotionalBanner />
      </div>
      
      {/* Mostrar mensagem de erro se falhou ao carregar o perfil e não temos dados de cache */}
      {profileError && !userProfile ? (
        <div className="my-8">
          <ApiErrorAlert
            title="Erro ao carregar dados"
            description="Não foi possível carregar seus dados de perfil. Isso pode afetar algumas funcionalidades."
            error={profileError}
            onRetry={handleReloadDashboard}
          />
        </div>
      ) : null}
      
      <h1 className="text-3xl font-bold text-brand-black dark:text-white flex items-center gap-2">
        <span className="text-2xl">👋</span> Olá, {getUserFirstName()}!
      </h1>
      
      <ErrorBoundary
        fallback={
          <div className="bg-white dark:bg-[#0A2540] rounded-xl p-6 shadow-md">
            <ApiErrorAlert
              title="Erro ao carregar métricas"
              description="Não foi possível carregar as métricas. Tente recarregar a página."
              onRetry={() => window.location.reload()}
            />
          </div>
        }
      >
        <TopMetrics />
      </ErrorBoundary>
      
      <ErrorBoundary
        fallback={
          <div className="bg-white dark:bg-[#0A2540] rounded-xl p-6 shadow-md">
            <ApiErrorAlert
              title="Erro ao carregar grade de métricas"
              description="Não foi possível carregar a grade de métricas. Tente recarregar a página."
              onRetry={() => window.location.reload()}
            />
          </div>
        }
      >
        {isMetricsLoading ? (
          <div className="bg-white dark:bg-[#0A2540] rounded-xl p-6 shadow-md text-center">
            <p className="text-gray-600 dark:text-gray-300">Carregando métricas...</p>
          </div>
        ) : (
          <MetricsGrid />
        )}
      </ErrorBoundary>
    </div>
  );
}