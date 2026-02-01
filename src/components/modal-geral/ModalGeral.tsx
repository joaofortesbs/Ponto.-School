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

type AnimationState = 'closed' | 'opening' | 'open' | 'closing';

const ANIMATION_DURATION = 200;

export const ModalGeral: React.FC<ModalGeralProps> = ({
  isOpen,
  onClose,
  initialSection = "perfil"
}) => {
  const [activeSection, setActiveSection] = useState<ModalSection>(initialSection);
  const [animationState, setAnimationState] = useState<AnimationState>('closed');
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

    if (isOpen && animationState === 'closed') {
      setAnimationState('opening');
      animationTimerRef.current = setTimeout(() => {
        setAnimationState('open');
      }, ANIMATION_DURATION);
    } else if (!isOpen && (animationState === 'open' || animationState === 'opening')) {
      setAnimationState('closing');
      animationTimerRef.current = setTimeout(() => {
        setAnimationState('closed');
      }, ANIMATION_DURATION);
    }

    return clearAnimationTimer;
  }, [isOpen, animationState, clearAnimationTimer]);

  const handleClose = useCallback(() => {
    if (animationState === 'open' || animationState === 'opening') {
      onClose();
    }
  }, [onClose, animationState]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
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

  if (animationState === 'closed') {
    return null;
  }

  const colors = MODAL_CONFIG.colors.dark;
  const overlayConfig = MODAL_CONFIG.overlay;
  const closeButtonConfig = MODAL_CONFIG.closeButton;

  const isVisible = animationState === 'opening' || animationState === 'open';
  const isClosing = animationState === 'closing';

  return (
    <DialogPrimitive.Root open={animationState !== 'closed'}>
      <DialogPrimitive.Portal>
        <div
          className={cn(
            "fixed inset-0 z-50 transition-all",
            isVisible && "animate-in fade-in-0",
            isClosing && "animate-out fade-out-0"
          )}
          style={{
            animationDuration: `${ANIMATION_DURATION}ms`,
            animationFillMode: 'forwards',
            backgroundColor: `rgba(0, 0, 0, ${overlayConfig.opacity})`,
            backdropFilter: `blur(${overlayConfig.blur}px)`,
            WebkitBackdropFilter: `blur(${overlayConfig.blur}px)`,
            pointerEvents: isClosing ? 'none' : 'auto',
          }}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
        
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[900px] w-[95vw] h-[85vh] max-h-[700px] translate-x-[-50%] translate-y-[-50%] p-0 overflow-hidden gap-0",
            isVisible && "animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%]",
            isClosing && "animate-out fade-out-0 zoom-out-95 slide-out-to-left-1/2 slide-out-to-top-[48%]"
          )}
          style={{
            animationDuration: `${ANIMATION_DURATION}ms`,
            animationFillMode: 'forwards',
            backgroundColor: colors.background,
            borderRadius: '24px',
            border: '1px solid #0c1334',
            boxShadow: '0 25px 80px -12px rgba(0, 0, 0, 0.6), 0 12px 40px -8px rgba(255, 107, 0, 0.15)',
            pointerEvents: isClosing ? 'none' : 'auto',
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
            disabled={isClosing}
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
