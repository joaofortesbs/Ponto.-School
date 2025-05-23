import React, { useEffect } from "react";
import Dashboard from "@/components/dashboard/Dashboard";
// A visualização de métricas foi removida completamente da interface
import DashboardFooter from "@/components/dashboard/DashboardFooter";

export default function DashboardPage() {
  useEffect(() => {
    // Garante que a página é exibida a partir do topo quando navegamos para o dashboard
    window.scrollTo(0, 0);
    
    // Reset scroll para elementos específicos
    const resetScrollOnElements = () => {
      document.querySelectorAll('.overflow-auto, .overflow-y-auto, .overflow-scroll, .overflow-y-scroll').forEach(
        (element) => {
          if (element instanceof HTMLElement) {
            element.scrollTop = 0;
          }
        }
      );
    };
    
    // Executar imediatamente e após um pequeno delay para garantir que elementos assíncronos também sejam afetados
    resetScrollOnElements();
    setTimeout(resetScrollOnElements, 100);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <Dashboard />
      </div>
      <DashboardFooter />
    </div>
  );
}
