import React, { useState, useEffect } from "react";
import MetricsGrid from "./MetricsGrid";
import TopMetrics from "./TopMetrics";
import PromotionalBanner from "./PromotionalBanner";
import { profileService } from "@/services/profileService";
import { UserProfile } from "@/types/user-profile";

export default function Dashboard() {
  const [showBanner, setShowBanner] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isMetricsLoading, setIsMetricsLoading] = useState(true); // Added state for loading

  useEffect(() => {
    // Simulação de carregamento de dados
    const timer = setTimeout(() => {
      setIsMetricsLoading(false);
    }, 1000);

    // Carregar perfil do usuário
    const loadUserProfile = async () => {
      const profile = await profileService.getCurrentUserProfile();
      if (profile) {
        setUserProfile(profile);
      }
    };

    loadUserProfile();

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 space-y-6 transition-colors duration-300">
      <PromotionalBanner />
      <h1 className="text-3xl font-bold text-brand-black dark:text-white flex items-center gap-2">
        <span className="text-2xl">👋</span> Olá, {(() => {
                // Obter o primeiro nome do usuário
                const firstName = userProfile?.full_name?.split(' ')[0] || userProfile?.display_name || userProfile?.username || "João";
                // Salvar no localStorage para uso no sidebar e outros componentes
                if (firstName && firstName !== "Usuário") {
                  localStorage.setItem('userFirstName', firstName);
                }
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