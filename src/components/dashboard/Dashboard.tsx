import React, { useState, useEffect } from "react";
import PromotionalBanner from "./PromotionalBanner";
import DashboardInterface from "./gradeinterfaceprincipal/DashboardInterface";
import { profileService } from "@/services/profileService";
import { UserProfile } from "@/types/user-profile";

export default function Dashboard() {
  const [showBanner, setShowBanner] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isMetricsLoading, setIsMetricsLoading] = useState(false); // Inicializado como false para carregar imediatamente

  // Função para garantir que a página seja rolada para o topo
  useEffect(() => {
    // Scroll para o topo da página quando o componente for montado
    window.scrollTo(0, 0);

    // Garantir que todos os elementos com scroll também sejam resetados
    document.querySelectorAll('.overflow-auto, .overflow-y-auto, .overflow-scroll, .overflow-y-scroll').forEach(
      (element) => {
        if (element instanceof HTMLElement) {
          element.scrollTop = 0;
        }
      }
    );
  }, []);

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

  // Helper function to get the first name (centralized logic)
  const getFirstName = () => {
    let firstName = "Usuário";
    const neonUser = localStorage.getItem("neon_user");
    if (neonUser) {
      try {
        const userData = JSON.parse(neonUser);
        const fullName = userData.nome_completo || userData.nome_usuario || userData.email;
        if (fullName) {
          firstName = fullName.split(" ")[0].split("@")[0];
        }
      } catch (error) {
        console.error("Erro ao buscar nome do Neon:", error);
      }
    }

    // Fallback to userProfile or localStorage
    if (firstName === "Usuário") {
      firstName = userProfile?.full_name?.split(' ')[0] || userProfile?.display_name || localStorage.getItem('userFirstName') || "Usuário";
    }

    // Save to localStorage for other components (e.g., sidebar)
    localStorage.setItem('userFirstName', firstName);
    return firstName;
  };

  // Determine greeting based on the current hour
  const getGreeting = () => {
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
    return saudacao;
  };

  const firstName = getFirstName();
  const saudacao = getGreeting();

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 transition-colors duration-300">
      {/* Banner com prioridade de renderização - bordas ajustadas para match com card de perfil */}
      <div className="priority-render w-full max-w-[98%] sm:max-w-[1600px] mx-auto">
        <div className="rounded-xl sm:rounded-2xl overflow-hidden">
          <PromotionalBanner />
        </div>
      </div>
      <div className="w-full max-w-[98%] sm:max-w-[1600px] mx-auto pl-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-brand-black dark:text-white flex items-center gap-2">
          <span className="text-lg sm:text-xl md:text-2xl">👋</span> {saudacao}, {firstName}!
        </h1>
      </div>

      {/* Interface principal do Dashboard com métricas e cards */}
      <div className="w-full max-w-[98%] sm:max-w-[1600px] mx-auto">
        <DashboardInterface />
      </div>
    </div>
  );
}