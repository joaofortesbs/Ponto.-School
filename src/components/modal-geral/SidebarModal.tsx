import React from "react";
import { User, Settings, BarChart3 } from "lucide-react";
import { ModalSection } from "./ModalGeral";

export const MODAL_CONFIG = {
  logo: {
    maxHeight: 60,
    padding: 24,
  },
  overlay: {
    opacity: 0.6,
    blur: 4,
  },
  closeButton: {
    top: 12,
    right: 12,
  },
  colors: {
    dark: {
      background: '#000822',
      sidebarBackground: '#000822',
      sectionActive: '#0c1334',
      sectionHover: 'rgba(255, 255, 255, 0.05)',
      border: '#0c1334',
      textPrimary: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
    },
    light: {
      background: '#FFFFFF',
      sidebarBackground: '#F8F9FA',
      sectionActive: '#FF6B00',
      sectionHover: 'rgba(0, 0, 0, 0.05)',
      border: 'rgba(0, 0, 0, 0.08)',
      textPrimary: '#1A1A1A',
      textSecondary: 'rgba(0, 0, 0, 0.6)',
    }
  }
} as const;

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
  const colors = isDark ? MODAL_CONFIG.colors.dark : MODAL_CONFIG.colors.light;
  
  return (
    <div 
      className="w-[220px] h-full flex flex-col"
      style={{
        backgroundColor: colors.sidebarBackground,
        borderRight: `1px solid ${colors.border}`,
        borderTopLeftRadius: '24px',
        borderBottomLeftRadius: '24px',
      }}
    >
      <div style={{ padding: `${MODAL_CONFIG.logo.padding}px`, paddingBottom: '16px' }}>
        <img 
          src="/lovable-uploads/Logo-Ponto. School.webp"
          alt="Ponto. School"
          className="w-full h-auto object-contain"
          style={{ maxHeight: `${MODAL_CONFIG.logo.maxHeight}px` }}
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
              className="w-full flex items-center gap-3 px-4 py-3 mb-1.5 rounded-xl transition-all duration-300 ease-out"
              style={{
                backgroundColor: isActive ? colors.sectionActive : 'transparent',
                color: isActive ? colors.textPrimary : colors.textSecondary,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = colors.sectionHover;
                  e.currentTarget.style.color = colors.textPrimary;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = colors.textSecondary;
                }
              }}
            >
              <Icon className="w-5 h-5 transition-colors duration-300" />
              <span className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>
                {section.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default SidebarModal;
