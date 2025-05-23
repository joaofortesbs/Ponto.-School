import React, { useState, useEffect } from "react";
import PromotionalBanner from "./PromotionalBanner";
import DashboardInterface from "./gradeinterfaceprincipal/DashboardInterface";
import { profileService } from "@/services/profileService";
import { UserProfile } from "@/types/user-profile";

export default function Dashboard() {
  const [showBanner, setShowBanner] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isMetricsLoading, setIsMetricsLoading] = useState(false); // Inicializado como false para carregar imediatamente

  useEffect(() => {
    // Carregar perfil do usuário imediatamente, sem simulação de carregamento
    const loadUserProfile = async () => {
      try {
        // Tentar buscar do localStorage primeiro para exibição instantânea
        const cachedProfile = localStorage.getItem('userProfile');
        if (cachedProfile) {
          try {
            setUserProfile(JSON.parse(cachedProfile));
          } catch (e) {
            console.error('Erro ao parsear perfil em cache:', e);
          }
        }
        
        // Buscar do backend em segundo plano
        const profile = await profileService.getCurrentUserProfile();
        if (profile) {
          setUserProfile(profile);
          // Atualizar cache
          localStorage.setItem('userProfile', JSON.stringify(profile));
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
      <div className="priority-render max-w-[1192px] mx-auto">
        <PromotionalBanner />
      </div>
      <div className="max-w-[1192px] mx-auto">
        <h1 className="text-3xl font-bold text-brand-black dark:text-white flex items-center gap-2">
          <span className="text-2xl">👋</span> {(() => {
                  // Obter o primeiro nome do usuário com prioridade consistente
                  const firstName = userProfile?.full_name?.split(' ')[0] || userProfile?.display_name || localStorage.getItem('userFirstName') || "Usuário";
                  // Salvar no localStorage para uso no sidebar e outros componentes
                  localStorage.setItem('userFirstName', firstName);
                  
                  // Determinar a saudação com base na hora atual
                  const horaAtual = new Date().getHours();
                  let saudacao = "Olá";
                  
                  if (horaAtual >= 5 && horaAtual < 12) {
                    saudacao = "Bom dia";
                  } else if (horaAtual >= 12 && horaAtual < 18.5) {
                    saudacao = "Boa tarde";
                  } else if (horaAtual >= 18.5 && horaAtual < 24) {
                    saudacao = "Boa noite";
                  } else {
                    saudacao = "Boa madrugada";
                  }
                  
                  return `${saudacao}, ${firstName}!`;
                })()}
        </h1>
        
        {/* Dashboard Interface */}
        <div className="dashboard-content mt-6">
          <DashboardInterface />
        </div>
      </div>
    </div>
  );
}