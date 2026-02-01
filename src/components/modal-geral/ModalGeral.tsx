import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
import { SidebarModal, MODAL_CONFIG } from "./SidebarModal";
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
  const isDark = true;

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection, isOpen]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

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

  const colors = MODAL_CONFIG.colors.dark;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="max-w-[900px] w-[95vw] h-[85vh] max-h-[700px] p-0 overflow-hidden gap-0"
        hideCloseButton={true}
        style={{
          backgroundColor: colors.background,
          borderRadius: '24px',
          border: '1px solid #0c1334',
          boxShadow: '0 25px 80px -12px rgba(0, 0, 0, 0.6), 0 12px 40px -8px rgba(255, 107, 0, 0.15)',
        }}
      >
        <VisuallyHidden>
          <DialogTitle>Modal Geral da Conta</DialogTitle>
        </VisuallyHidden>
        
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-50 rounded-full p-2 transition-all duration-200 hover:bg-white/10"
          style={{ color: colors.textSecondary }}
          aria-label="Fechar modal"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex h-full">
          <SidebarModal 
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            isDark={isDark}
          />
          
          <div className="flex-1 overflow-y-auto" style={{ backgroundColor: colors.background }}>
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
