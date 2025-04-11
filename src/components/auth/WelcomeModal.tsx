import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useAnimationControls, AnimatePresence } from "framer-motion";
import { X, Settings, MapPin, CheckCircle, Bell, Calendar, MessageSquare, Globe, Users, Sparkles, Zap, Lightbulb, PanelRight, Rocket } from "lucide-react";
import { Button } from "../ui/button";
import Confetti from 'react-confetti';
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
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [showUpdates, setShowUpdates] = useState(false);
  const [activeBubble, setActiveBubble] = useState(0);
  const controls = useAnimationControls();
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Estado para controlar se o modal já foi mostrado nesta sessão
  const [shouldDisplay, setShouldDisplay] = useState(true);

  // Para efeitos de iluminação
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Verificar se o modal já foi exibido nesta sessão
  useEffect(() => {
    if (isOpen) {
      const modalShown = sessionStorage.getItem(SESSION_MODAL_KEY);
      if (modalShown) {
        setShouldDisplay(false);
        // Fechar o modal automaticamente se já foi mostrado
        onClose();
      } else {
        setShouldDisplay(true);
        controls.start("visible");

        // Marcar que o modal foi exibido nesta sessão
        sessionStorage.setItem(SESSION_MODAL_KEY, 'true');
        
        // Efeito de rotação das bolhas
        const interval = setInterval(() => {
          setActiveBubble((prev) => (prev + 1) % 4);
        }, 3000);

        return () => clearInterval(interval);
      }
    }
  }, [isOpen, controls, onClose]);

  const handleSettingsClick = () => {
    navigate("/configuracoes");
    onClose();
  };

  const handleAgendaClick = () => {
    navigate("/agenda");
    onClose();
  };

  const toggleUpdates = () => {
    setShowUpdates(!showUpdates);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!modalRef.current) return;

    const rect = modalRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setMousePosition({ x, y });
  };

  // Animação para os cartões
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3 + i * 0.1,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }
    })
  };

  // Animação para os botões
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      boxShadow: "0 10px 25px -5px rgba(255, 107, 0, 0.4)",
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    },
    tap: { scale: 0.95 }
  };

  // Função auxiliar para garantir que o evento de fechamento do modal seja executado corretamente
  const safeCloseModal = (onClose: () => void) => {
    // Remover classe do body
    document.body.classList.remove('modal-open');
    // Marcar que o modal foi exibido nesta sessão
    sessionStorage.setItem(SESSION_MODAL_KEY, 'true');
    // Executar callback de fechamento
    onClose();
  };

  // Garantir que o corpo da página não possa ser rolado quando o modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Remover classe quando o componente for desmontado
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);


  // Primeiro login - Modal completo com confetes e animações avançadas
  if (isFirstLogin) {
    return (
      <AnimatePresence mode="wait">
        {isOpen && shouldDisplay && (
          <>
            <Confetti
              width={dimensions.width}
              height={dimensions.height}
              recycle={false}
              numberOfPieces={500}
              gravity={0.2}
              colors={['#FF6B00', '#FF8C40', '#29335C', '#001427', '#FFC107']}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] welcome-modal-overlay flex items-center justify-center p-4"
              style={{ pointerEvents: 'auto' }}
            >
              <motion.div
                ref={modalRef}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white dark:bg-[#001427] rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl border border-[#FF6B00]/30 relative"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                style={{
                  background: isHovering ? 
                    `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(255, 140, 64, 0.15), rgba(255, 140, 64, 0) 50%)` : 
                    '',
                  backgroundSize: '200% 200%',
                  backgroundPosition: 'center',
                  backgroundBlendMode: 'soft-light',
                }}
              >
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#FF6B00]/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-16 w-48 h-48 bg-[#FF8C40]/10 rounded-full blur-3xl"></div>

                <div className="relative h-48 overflow-hidden">
                  <motion.img
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=90"
                    alt="Bem-vindo à Ponto. School"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="mb-2"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 260, 
                            damping: 20,
                            delay: 0.5 
                          }}
                        >
                          <CheckCircle className="h-5 w-5 text-[#FF6B00]" />
                        </motion.div>
                        <h3 className="text-xl font-bold">Conta criada com sucesso!</h3>
                      </div>
                      <p className="text-white/80">
                        Estamos muito felizes em ter você na Ponto. School!
                      </p>
                    </motion.div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => safeCloseModal(onClose)}
                    className="absolute top-4 right-4 rounded-full bg-black/20 text-white hover:bg-black/40 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-6 space-y-6">
                  <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-center mb-4"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Bem-vindo à Ponto. School
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Estamos animados para ajudar você em sua jornada de aprendizado!
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div 
                      custom={0}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/60 p-4 rounded-xl border border-white/10 backdrop-blur-sm relative overflow-hidden group"
                      whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(255, 107, 0, 0.3)" }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="absolute -right-6 -top-6 w-16 h-16 bg-[#FF6B00]/10 rounded-full blur-xl group-hover:bg-[#FF6B00]/20 transition-all duration-700"></div>
                      <div className="h-10 w-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3 relative z-10">
                        <Settings className="h-5 w-5 text-[#FF6B00]" />
                      </div>
                      <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Configure sua conta</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        Personalize seu perfil e preferências para melhorar sua experiência.
                      </p>
                      <motion.div variants={buttonVariants} initial="initial" whileHover="hover" whileTap="tap">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10 w-full"
                          onClick={handleSettingsClick}
                        >
                          Configurar agora
                        </Button>
                      </motion.div>
                    </motion.div>

                    <motion.div 
                      custom={1}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/60 p-4 rounded-xl border border-white/10 backdrop-blur-sm relative overflow-hidden group"
                      whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(255, 107, 0, 0.3)" }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="absolute -right-6 -top-6 w-16 h-16 bg-[#FF6B00]/10 rounded-full blur-xl group-hover:bg-[#FF6B00]/20 transition-all duration-700"></div>
                      <div className="h-10 w-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3 relative z-10">
                        <MapPin className="h-5 w-5 text-[#FF6B00]" />
                      </div>
                      <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Tour pela plataforma</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        Conheça os recursos e funcionalidades da Ponto. School.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 w-full opacity-70 cursor-not-allowed"
                        disabled
                      >
                        Em breve
                      </Button>
                    </motion.div>

                    <motion.div 
                      custom={2}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/60 p-4 rounded-xl border border-white/10 backdrop-blur-sm relative overflow-hidden group"
                      whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(255, 107, 0, 0.3)" }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="absolute -right-6 -top-6 w-16 h-16 bg-[#FF6B00]/10 rounded-full blur-xl group-hover:bg-[#FF6B00]/20 transition-all duration-700"></div>
                      <div className="h-10 w-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3 relative z-10">
                        <CheckCircle className="h-5 w-5 text-[#FF6B00]" />
                      </div>
                      <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Comece a aprender</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        Vá direto para o dashboard e comece sua jornada agora.
                      </p>
                      <motion.div variants={buttonVariants} initial="initial" whileHover="hover" whileTap="tap">
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white w-full shadow-md shadow-orange-500/20"
                          onClick={() => safeCloseModal(onClose)}
                        >
                          Ir para o Dashboard
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Login subsequente - Modal redesenhado com efeitos modernos
  return (
    <AnimatePresence mode="wait">
      {isOpen && shouldDisplay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] welcome-modal-overlay flex items-center justify-center p-4"
          style={{ pointerEvents: 'auto' }}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: 0.4 
            }}
            className="bg-transparent backdrop-blur-sm rounded-xl p-6 max-w-md w-full shadow-2xl border border-[#FF6B00]/20 relative overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Efeitos visuais de fundo */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FF6B00]/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-20 w-40 h-40 bg-[#FF8C40]/10 rounded-full blur-3xl"></div>

            {/* Bolhas de efeito */}
            {[...Array(4)].map((_, i) => (
              <motion.div 
                key={i}
                className={cn(
                  "absolute w-24 h-24 rounded-full blur-3xl pointer-events-none opacity-30",
                  i === 0 ? "bg-[#FF6B00]/20 top-0 left-0" : "",
                  i === 1 ? "bg-[#FF8C40]/20 top-0 right-0" : "",
                  i === 2 ? "bg-indigo-500/10 bottom-0 right-0" : "",
                  i === 3 ? "bg-cyan-500/10 bottom-0 left-0" : ""
                )}
                animate={{
                  opacity: activeBubble === i ? 0.5 : 0.2,
                  scale: activeBubble === i ? 1.5 : 1,
                }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            ))}

            {/* Linhas de grade de fundo - efeito Tron/cyberpunk */}
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-5"></div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => safeCloseModal(onClose)}
              className="absolute top-3 right-3 rounded-full hover:bg-white/10 text-white z-10"
            >
              <X className="h-4 w-4" />
            </Button>

            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-6 pt-4 relative"
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  delay: 0.2,
                  duration: 0.7
                }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6B00]/20 to-[#FF8C40]/20 flex items-center justify-center mx-auto mb-5 relative"
              >
                <div className="absolute inset-0 rounded-full border border-[#FF6B00]/30 animate-pulse"></div>
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                    opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="absolute inset-1 rounded-full border-2 border-[#FF6B00]/20 border-t-[#FF8C40]"
                ></motion.div>
                <motion.div
                  animate={{ scale: [0.9, 1.1, 0.9] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] flex items-center justify-center"
                >
                  <CheckCircle className="h-7 w-7 text-white" />
                </motion.div>
              </motion.div>

              <motion.h2 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-2xl font-bold text-white mb-1 flex items-center justify-center gap-2 text-shadow-sm"
              >
                <span>Bem-vindo de volta!</span>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, delay: 1, repeat: 1 }}
                >
                  <Sparkles className="h-5 w-5 text-[#FF8C40]" />
                </motion.div>
              </motion.h2>
              <motion.p 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-white text-shadow-sm"
              >
                A Ponto. School está feliz por te ter de volta!
              </motion.p>
            </motion.div>

            {!showUpdates ? (
              <div className="space-y-4 mb-6">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  whileHover={{ scale: 1.02, x: 3 }}
                  className="relative"
                >
                  <Button
                    onClick={handleAgendaClick}
                    className="flex items-center justify-start w-full bg-transparent hover:bg-white/5 text-white p-4 rounded-lg border border-white/10 relative overflow-hidden group"
                  >
                    <div className="h-10 w-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mr-4 relative z-10">
                      <Calendar className="h-5 w-5 text-[#FF6B00]" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Ver compromissos do dia</div>
                      <div className="text-xs text-white/60">Confira sua agenda e planeje seu dia</div>
                    </div>
                    <motion.div 
                      className="absolute right-4 opacity-0 group-hover:opacity-100"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                      <Zap className="h-4 w-4 text-[#FF6B00]" />
                    </motion.div>
                    <div className="absolute top-0 left-0 h-full w-0 bg-gradient-to-r from-transparent to-[#FF6B00]/10 group-hover:w-full transition-all duration-700 ease-in-out"></div>
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  whileHover={{ scale: 1.02, x: 3 }}
                  className="relative"
                >
                  <Button
                    onClick={toggleUpdates}
                    className="flex items-center justify-start w-full bg-transparent hover:bg-white/5 text-white p-4 rounded-lg border border-white/10 relative overflow-hidden group"
                  >
                    <div className="h-10 w-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mr-4 relative z-10">
                      <Bell className="h-5 w-5 text-[#FF6B00]" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Ver atualizações</div>
                      <div className="text-xs text-white/60">Notificações, mensagens e novidades</div>
                    </div>
                    <motion.div 
                      className="absolute right-4 opacity-0 group-hover:opacity-100"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                      <Zap className="h-4 w-4 text-[#FF6B00]" />
                    </motion.div>
                    <div className="absolute top-0 left-0 h-full w-0 bg-gradient-to-r from-transparent to-[#FF6B00]/10 group-hover:w-full transition-all duration-700 ease-in-out"></div>
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                  whileHover={{ scale: 1.02, x: 3 }}
                  className="relative"
                >
                  <Button
                    onClick={() => navigate("/epictus-ia")}
                    className="flex items-center justify-start w-full bg-transparent hover:bg-white/5 text-white p-4 rounded-lg border border-white/10 relative overflow-hidden group"
                  >
                    <div className="h-10 w-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mr-4 relative z-10">
                      <Lightbulb className="h-5 w-5 text-[#FF6B00]" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Pergunte ao Epictus IA</div>
                      <div className="text-xs text-white/60">Tire suas dúvidas com nosso assistente IA</div>
                    </div>
                    <motion.div 
                      className="absolute right-4 opacity-0 group-hover:opacity-100"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                      <Zap className="h-4 w-4 text-[#FF6B00]" />
                    </motion.div>
                    <div className="absolute top-0 left-0 h-full w-0 bg-gradient-to-r from-transparent to-[#FF6B00]/10 group-hover:w-full transition-all duration-700 ease-in-out"></div>
                  </Button>
                </motion.div>
              </div>
            ) : (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <motion.h3 
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="font-medium text-white flex items-center gap-2"
                  >
                    <Bell className="h-4 w-4 text-[#FF6B00]" />
                    Suas atualizações
                  </motion.h3>
                  <motion.div
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                  >
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowUpdates(false)} 
                      className="text-sm text-white/80 hover:text-white hover:bg-white/10 px-4 py-1 rounded transition-colors duration-200 active:bg-white/20"
                    >
                      Voltar
                    </Button>
                  </motion.div>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 pb-2 scrollbar-thin scrollbar-thumb-[#FF6B00]/20 scrollbar-track-transparent">
                  {[
                    {
                      icon: <Bell className="h-5 w-5 text-[#FF6B00]" />,
                      title: "Notificações",
                      description: "Você tem 3 notificações não lidas"
                    },
                    {
                      icon: <MessageSquare className="h-5 w-5 text-[#FF6B00]" />,
                      title: "Mensagens",
                      description: "2 novas mensagens de colegas"
                    },
                    {
                      icon: <Globe className="h-5 w-5 text-[#FF6B00]" />,
                      title: "Novidades da plataforma",
                      description: "Nova funcionalidade de AI disponível!"
                    },
                    {
                      icon: <Users className="h-5 w-5 text-[#FF6B00]" />,
                      title: "Conexão Expert",
                      description: "Um expert escolheu responder sua dúvida"
                    },
                    {
                      icon: <PanelRight className="h-5 w-5 text-[#FF6B00]" />,
                      title: "Painel de controle",
                      description: "Acesse suas estatísticas atualizadas"
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      whileHover={{ 
                        scale: 1.02, 
                        boxShadow: "0 5px 15px -5px rgba(255, 107, 0, 0.3)",
                        x: 3
                      }}
                      className="bg-transparent p-3 rounded-lg border border-white/10 hover:border-[#FF6B00]/30 transition-all duration-300 relative overflow-hidden group"
                    >
                      <div className="absolute -right-6 -top-6 w-16 h-16 bg-[#FF6B00]/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      <div className="flex items-start">
                        <div className="h-8 w-8 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <div className="font-medium text-white">{item.title}</div>
                          <div className="text-sm text-white/70 mt-1">{item.description}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex justify-center"
            >
              <motion.div
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white px-8 py-6 text-lg font-medium shadow-lg shadow-[#FF6B00]/20 relative overflow-hidden group"
                  onClick={() => safeCloseModal(onClose)}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Continuar
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                      <Rocket className="h-4 w-4" />
                    </motion.div>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FF8C40] to-[#FF6B00] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Button>
              </motion.div>
            </motion.div>

            {/* Efeito de partículas flutuantes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-[#FF6B00]/40 rounded-full"
                  initial={{ 
                    x: Math.random() * 100 + "%", 
                    y: Math.random() * 100 + "%", 
                    opacity: 0 
                  }}
                  animate={{ 
                    y: [null, Math.random() * 100 + "%"],
                    opacity: [0, 0.7, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{ 
                    duration: 3 + Math.random() * 5,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeModal;