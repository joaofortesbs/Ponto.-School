import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Settings, Rocket, Share2 } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

// Chave para controle de sessão
const SESSION_MODAL_KEY = 'welcomeModalShown';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstLogin: boolean;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  isFirstLogin,
}) => {
  const navigate = useNavigate();
  const [shouldDisplay, setShouldDisplay] = useState(true);

  useEffect(() => {
    if (isOpen) {
      if (isFirstLogin) {
        setShouldDisplay(true);
        setTimeout(() => {
          sessionStorage.setItem(SESSION_MODAL_KEY, 'true');
        }, 2000);
      } else {
        const modalShown = sessionStorage.getItem(SESSION_MODAL_KEY);
        if (modalShown) {
          setShouldDisplay(false);
          onClose();
        } else {
          setShouldDisplay(true);
          sessionStorage.setItem(SESSION_MODAL_KEY, 'true');
        }
      }
    }
  }, [isOpen, onClose, isFirstLogin]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  const handleClose = () => {
    document.body.classList.remove('modal-open');
    sessionStorage.setItem(SESSION_MODAL_KEY, 'true');
    onClose();
  };

  const handleGoToSchoolPower = () => {
    handleClose();
    navigate("/school-power");
  };

  const handleGoToSettings = () => {
    handleClose();
    navigate("/configuracoes");
  };

  if (!isOpen || !shouldDisplay) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] welcome-modal-overlay flex items-center justify-center p-4"
        style={{ pointerEvents: 'auto' }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ 
            type: "spring", 
            damping: 25, 
            stiffness: 300,
            duration: 0.4 
          }}
          className="bg-gradient-to-br from-[#0A1929] via-[#001427] to-[#000B1A] rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl border border-[#FF6B00]/30 relative"
        >
          {/* Header com gradiente */}
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#001427] to-[#0A1929]">
            {/* Padrão de fundo animado */}
            <motion.div 
              className="absolute inset-0 opacity-20"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255, 107, 0, 0.3) 0%, transparent 50%),
                                 radial-gradient(circle at 80% 80%, rgba(255, 140, 64, 0.2) 0%, transparent 50%)`
              }}
            />

            {/* Estrela decorativa */}
            <motion.div
              className="absolute top-8 left-12"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <div className="text-yellow-400 text-4xl">⭐</div>
            </motion.div>

            {/* Avatar animado no canto superior direito */}
            <motion.div
              className="absolute top-6 right-8"
              initial={{ scale: 0, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 150 }}
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    y: [0, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="text-5xl">👋</div>
                </motion.div>
              </div>
            </motion.div>

            {/* Título principal */}
            <div className="absolute bottom-8 left-8 z-10">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-2"
              >
                <div className="w-12 h-12 rounded-full bg-[#FF6B00] flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Conta <span className="text-[#FF6B00]">criada</span> com <span className="text-[#FF6B00]">sucesso!</span>
                  </h2>
                </div>
              </motion.div>
              <motion.p
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/80 ml-14"
              >
                Estamos muito felizes em ter você na <span className="text-[#FF6B00] font-semibold">Ponto. School</span> !
              </motion.p>
            </div>

            {/* Botão fechar */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="absolute top-4 right-4 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white z-20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Conteúdo principal */}
          <div className="p-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <h3 className="text-2xl font-bold text-white mb-2 text-center">
                Bem-vindo à Ponto. School
              </h3>
              <p className="text-white/70 text-center">
                Estamos animados para ajudar você em sua jornada de aprendizado!
              </p>
            </motion.div>

            {/* Cards de ação */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1 - Configurar conta */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-[#1A2332] to-[#0F1824] p-6 rounded-xl border border-white/10 hover:border-[#FF6B00]/50 transition-all duration-300 group cursor-pointer"
                onClick={handleGoToSettings}
              >
                <div className="w-12 h-12 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Settings className="h-6 w-6 text-[#FF6B00]" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Configure sua conta</h4>
                <p className="text-white/60 text-sm mb-4">
                  Personalize seu perfil e preferências para melhorar sua experiência.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                >
                  Configurar agora
                </Button>
              </motion.div>

              {/* Card 2 - Tour (Em breve) */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-[#1A2332] to-[#0F1824] p-6 rounded-xl border border-white/10 opacity-60"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
                  <Rocket className="h-6 w-6 text-white/50" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Tour pela plataforma</h4>
                <p className="text-white/60 text-sm mb-4">
                  Conheça os recursos e funcionalidades da Ponto. School.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-white/20 text-white/50 cursor-not-allowed"
                  disabled
                >
                  Em breve
                </Button>
              </motion.div>

              {/* Card 3 - Começar com School Power */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] p-6 rounded-xl border border-[#FF6B00] hover:shadow-xl hover:shadow-[#FF6B00]/20 transition-all duration-300 group cursor-pointer"
                onClick={handleGoToSchoolPower}
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Share2 className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Comece a aprender</h4>
                <p className="text-white/90 text-sm mb-4">
                  Acesse o School Power, crie atividades e compartilhe com seus alunos!
                </p>
                <Button
                  size="sm"
                  className="w-full bg-white text-[#FF6B00] hover:bg-white/90 font-semibold"
                >
                  Ir para School Power
                </Button>
              </motion.div>
            </div>

            {/* Dica rápida */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 p-4 bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF6B00]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-lg">💡</span>
                </div>
                <div>
                  <h5 className="text-white font-semibold mb-1">Dica rápida:</h5>
                  <p className="text-white/70 text-sm">
                    No School Power, digite o que você precisa (ex: "Lista de exercícios sobre funções"), 
                    aguarde a criação automática e depois clique em <strong className="text-[#FF6B00]">"Compartilhar"</strong> para 
                    gerar um link que seus alunos podem acessar!
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeModal;