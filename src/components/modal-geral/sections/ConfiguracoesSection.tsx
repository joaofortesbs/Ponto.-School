import React from "react";
import { Construction, Settings } from "lucide-react";
import { MODAL_CONFIG } from "../SidebarModal";

export const ConfiguracoesSection: React.FC = () => {
  const colors = MODAL_CONFIG.colors.dark;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C40 100%)',
            }}
          >
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
              Configurações
            </h2>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Personalize sua experiência na plataforma
            </p>
          </div>
        </div>
      </div>

      <div 
        className="flex-1 flex flex-col items-center justify-center rounded-2xl p-8"
        style={{
          backgroundColor: 'rgba(255, 107, 0, 0.05)',
          border: '1px dashed rgba(255, 107, 0, 0.2)',
        }}
      >
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.15) 0%, rgba(255, 140, 64, 0.1) 100%)',
          }}
        >
          <Construction className="w-8 h-8 text-[#FF6B00]" />
        </div>
        
        <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
          Em Construção
        </h3>
        
        <p className="text-sm text-center max-w-[300px]" style={{ color: colors.textSecondary }}>
          Esta seção está sendo desenvolvida. Em breve você poderá ajustar as configurações da plataforma por aqui.
        </p>
      </div>
    </div>
  );
};

export default ConfiguracoesSection;
