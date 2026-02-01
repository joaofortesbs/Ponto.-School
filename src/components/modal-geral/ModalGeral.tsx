import React, { useState, useEffect, useCallback, useRef } from "react";
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

const ANIMATION_DURATION = 150;

export const ModalGeral: React.FC<ModalGeralProps> = ({
  isOpen,
  onClose,
  initialSection = "perfil"
}) => {
  const [activeSection, setActiveSection] = useState<ModalSection>(initialSection);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDark = true;

  const clearAnimationTimer = useCallback(() => {
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    clearAnimationTimer();

    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else if (isVisible) {
      setIsAnimating(false);
      animationTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, ANIMATION_DURATION);
    }

    return clearAnimationTimer;
  }, [isOpen, clearAnimationTimer]);

  const handleClose = useCallback(() => {
    if (isAnimating) {
      onClose();
    }
  }, [onClose, isAnimating]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  }, [handleClose]);

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

  if (!isVisible) {
    return null;
  }

  const colors = MODAL_CONFIG.colors.dark;
  const overlayConfig = MODAL_CONFIG.overlay;
  const closeButtonConfig = MODAL_CONFIG.closeButton;

  return (
    <DialogPrimitive.Root open={isVisible}>
      <DialogPrimitive.Portal>
        <div
          className="fixed inset-0 z-50"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${isAnimating ? overlayConfig.opacity : 0})`,
            backdropFilter: isAnimating ? `blur(${overlayConfig.blur}px)` : 'blur(0px)',
            WebkitBackdropFilter: isAnimating ? `blur(${overlayConfig.blur}px)` : 'blur(0px)',
            transition: `all ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            pointerEvents: isAnimating ? 'auto' : 'none',
          }}
          onClick={handleOverlayClick}
          onKeyDown={handleKeyDown}
          aria-hidden="true"
        />
        
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-[900px] w-[95vw] h-[85vh] max-h-[700px] p-0 overflow-hidden gap-0 outline-none"
          style={{
            transform: isAnimating 
              ? 'translate(-50%, -50%) scale(1)' 
              : 'translate(-50%, -48%) scale(0.96)',
            opacity: isAnimating ? 1 : 0,
            transition: `all ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            backgroundColor: colors.background,
            borderRadius: '24px',
            border: '1px solid #0c1334',
            boxShadow: '0 25px 80px -12px rgba(0, 0, 0, 0.6), 0 12px 40px -8px rgba(255, 107, 0, 0.15)',
            pointerEvents: isAnimating ? 'auto' : 'none',
          }}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={handleClose}
        >
          <VisuallyHidden>
            <DialogPrimitive.Title>Modal Geral da Conta</DialogPrimitive.Title>
          </VisuallyHidden>
          
          <button
            onClick={handleClose}
            className="absolute z-50 rounded-full p-2 transition-all duration-200 hover:bg-white/10 hover:scale-110 active:scale-95"
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
