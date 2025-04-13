import React, { useState, useEffect } from "react";
import MetricsGrid from "./MetricsGrid";
import TopMetrics from "./TopMetrics";
import PromotionalBanner from "./PromotionalBanner";
import { profileService } from "@/services/profileService";
import { UserProfile } from "@/types/user-profile";

export default function Dashboard() {
  const [showBanner, setShowBanner] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isMetricsLoading, setIsMetricsLoading] = useState(false); // Inicializado como false para carregar imediatamente

  useEffect(() => {
    // Utilizando hook customizado ou serviço para carregar o perfil
    const loadUserProfile = async () => {
      try {
        // Primeiro tenta recuperar os dados em cache para renderização imediata
        profileService.getProfileFromCache()
          .then(cachedProfile => {
            if (cachedProfile) {
              setUserProfile(cachedProfile);
            }
          })
          .catch(e => console.error('Erro ao recuperar perfil em cache:', e));
        
        // Em segundo plano, atualiza com dados do servidor
        const { profile, error } = await profileService.getCurrentUserProfile();
        
        if (error) {
          console.error('Erro ao buscar perfil:', error);
          return;
        }
        
        if (profile) {
          setUserProfile(profile);
          profileService.saveProfileToCache(profile);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    };

    loadUserProfile();
  }, []);

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 space-y-6 transition-colors duration-300">
      {/* Banner com prioridade de renderização */}
      <div className="priority-render">
        <PromotionalBanner />
      </div>
      <h1 className="text-3xl font-bold text-brand-black dark:text-white flex items-center gap-2">
        <span className="text-2xl">👋</span> Olá, {(() => {
                // Obter o primeiro nome do usuário com prioridade consistente
                const firstName = userProfile?.full_name?.split(' ')[0] || userProfile?.display_name || localStorage.getItem('userFirstName') || "Usuário";
                // Salvar no localStorage para uso no sidebar e outros componentes
                localStorage.setItem('userFirstName', firstName);
                return firstName;
              })()}!
      </h1>
      <TopMetrics />
      {isMetricsLoading ? (
          <p>Carregando métricas...</p> //Added loading indicator
      ) : (
        <MetricsGrid />
      )}
    </div>
  );
}