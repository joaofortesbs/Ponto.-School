import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SidebarModal } from "./SidebarModal";
import { PerfilSection, ConfiguracoesSection, SeuUsoSection } from "./sections";

export type ModalSection = "perfil" | "configuracoes" | "seu-uso";

interface ModalGeralProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: ModalSection;
}

export const ModalGeral: React.FC<ModalGeralProps> = ({
  isOpen,
  onClose,
  initialSection = "perfil"
}) => {
  const [activeSection, setActiveSection] = useState<ModalSection>(initialSection);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const renderSection = () => {
    switch (activeSection) {
      case "perfil":
        return <PerfilSection />;
      case "configuracoes":
        return <ConfiguracoesSection />;
      case "seu-uso":
        return <SeuUsoSection />;
      default:
        return <PerfilSection />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-[900px] w-[95vw] h-[85vh] max-h-[700px] p-0 overflow-hidden border-0 gap-0"
        style={{
          backgroundColor: isDark ? '#0A1628' : '#FFFFFF',
          borderRadius: '24px',
          boxShadow: isDark 
            ? '0 25px 80px -12px rgba(0, 0, 0, 0.6), 0 12px 40px -8px rgba(255, 107, 0, 0.15)'
            : '0 25px 80px -12px rgba(0, 0, 0, 0.25), 0 12px 40px -8px rgba(255, 107, 0, 0.1)',
        }}
      >
        <div className="flex h-full">
          <SidebarModal 
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            isDark={isDark}
          />
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-8">
              {renderSection()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalGeral;
