import React from "react";
import { User, Settings, BarChart3 } from "lucide-react";
import { ModalSection } from "./ModalGeral";

interface SidebarModalProps {
  activeSection: ModalSection;
  onSectionChange: (section: ModalSection) => void;
  isDark: boolean;
}

interface SectionItem {
  id: ModalSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sections: SectionItem[] = [
  { id: "perfil", label: "Perfil", icon: User },
  { id: "configuracoes", label: "Configurações", icon: Settings },
  { id: "seu-uso", label: "Seu Uso", icon: BarChart3 },
];

export const SidebarModal: React.FC<SidebarModalProps> = ({
  activeSection,
  onSectionChange,
  isDark
}) => {
  return (
    <div 
      className="w-[220px] h-full flex flex-col"
      style={{
        backgroundColor: isDark ? '#0D1D2E' : '#F8F9FA',
        borderRight: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
        borderTopLeftRadius: '24px',
        borderBottomLeftRadius: '24px',
      }}
    >
      <div className="p-6 pb-4">
        <img 
          src="/lovable-uploads/Logo-Ponto. School.webp"
          alt="Ponto. School"
          className="w-full h-auto max-h-[50px] object-contain"
          onError={(e) => {
            console.error('Erro ao carregar logo do modal');
            const target = e.currentTarget;
            target.src = "/lovable-uploads/Logo-Ponto. School.png";
          }}
        />
      </div>

      <nav className="flex-1 px-3 py-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 mb-1.5 rounded-xl
                transition-all duration-300 ease-out
                ${isActive 
                  ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white shadow-lg shadow-[#FF6B00]/25' 
                  : isDark 
                    ? 'text-gray-300 hover:bg-white/5 hover:text-white' 
                    : 'text-gray-600 hover:bg-black/5 hover:text-gray-900'
                }
              `}
            >
              <Icon 
                className={`w-5 h-5 transition-colors duration-300 ${
                  isActive ? 'text-white' : ''
                }`} 
              />
              <span className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>
                {section.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-4">
        <div 
          className="p-3 rounded-xl text-center"
          style={{
            backgroundColor: isDark ? 'rgba(255, 107, 0, 0.08)' : 'rgba(255, 107, 0, 0.05)',
            border: '1px solid rgba(255, 107, 0, 0.15)',
          }}
        >
          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Ponto. School © 2025
          </span>
        </div>
      </div>
    </div>
  );
};

export default SidebarModal;
