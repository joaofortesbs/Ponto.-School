import React, { useState, useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
import { SidebarModal, MODAL_CONFIG } from "./SidebarModal";
import { PerfilSection, ConfiguracoesSection, SeuUsoSection } from "./sections";
import { cn } from "@/lib/utils";

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
  const [shouldRender, setShouldRender] = useState(false);
  const isDark = true;

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
  const overlayConfig = MODAL_CONFIG.overlay;
  const closeButtonConfig = MODAL_CONFIG.closeButton;

  if (!shouldRender) {
    return null;
  }

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal forceMount>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            !isOpen && "pointer-events-none"
          )}
          style={{
            backgroundColor: `rgba(0, 0, 0, ${overlayConfig.opacity})`,
            backdropFilter: `blur(${overlayConfig.blur}px)`,
            WebkitBackdropFilter: `blur(${overlayConfig.blur}px)`,
            pointerEvents: isOpen ? 'auto' : 'none',
          }}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[900px] w-[95vw] h-[85vh] max-h-[700px] translate-x-[-50%] translate-y-[-50%] p-0 overflow-hidden gap-0 duration-200",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            !isOpen && "pointer-events-none"
          )}
          style={{
            backgroundColor: colors.background,
            borderRadius: '24px',
            border: '1px solid #0c1334',
            boxShadow: '0 25px 80px -12px rgba(0, 0, 0, 0.6), 0 12px 40px -8px rgba(255, 107, 0, 0.15)',
            pointerEvents: isOpen ? 'auto' : 'none',
          }}
          onPointerDownOutside={(e) => {
            if (!isOpen) {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            if (!isOpen) {
              e.preventDefault();
            }
          }}
        >
          <VisuallyHidden>
            <DialogPrimitive.Title>Modal Geral da Conta</DialogPrimitive.Title>
          </VisuallyHidden>
          
          <button
            onClick={handleClose}
            className="absolute z-50 rounded-full p-2 transition-all duration-200 hover:bg-white/10"
            style={{ 
              color: colors.textSecondary,
              top: `${closeButtonConfig.top}px`,
              right: `${closeButtonConfig.right}px`,
            }}
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
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default ModalGeral;
