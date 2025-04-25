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
                  <div className="relative w-full h-full overflow-hidden">
                    {/* Fundo dinâmico com camadas avançadas */}
                    <motion.div 
                      className="absolute inset-0"
                      style={{
                        background: "radial-gradient(circle at 50% 50%, #001427, #001427)",
                      }}
                      animate={{ 
                        background: [
                          "radial-gradient(circle at 30% 30%, #002a54, #001427)",
                          "radial-gradient(circle at 70% 70%, #001f3d, #001427)",
                          "radial-gradient(circle at 30% 70%, #002a54, #001427)",
                          "radial-gradient(circle at 70% 30%, #001f3d, #001427)",
                          "radial-gradient(circle at 50% 50%, #002a54, #001427)",
                        ] 
                      }}
                      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Efeito de brilho pulsante */}
                    <motion.div
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: [0, 0.05, 0.1, 0.05, 0],
                        scale: [1, 1.05, 1.1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 8, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      style={{
                        background: "radial-gradient(circle at center, rgba(255, 107, 0, 0.4), transparent 60%)",
                        mixBlendMode: "overlay"
                      }}
                    />

                    {/* Efeito de linhas digitais movendo-se (tipo Tron) */}
                    <motion.div 
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `
                          linear-gradient(90deg, #FF6B00 1px, transparent 1px),
                          linear-gradient(0deg, #FF6B00 1px, transparent 1px)
                        `,
                        backgroundSize: "60px 60px"
                      }}
                      animate={{
                        backgroundPosition: ["0px 0px", "60px 60px"]
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />

                    {/* Efeito de constelação com pontos conectados */}
                    <div className="absolute inset-0">
                      <svg width="100%" height="100%" className="absolute inset-0">
                        <defs>
                          <radialGradient id="star-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
                          </radialGradient>
                          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                          </filter>
                        </defs>
                        {/* Linhas de conexão animadas */}
                        {[...Array(8)].map((_, i) => (
                          <motion.path 
                            key={`constellation-line-${i}`}
                            stroke="#FF6B00"
                            strokeWidth="0.5"
                            strokeOpacity="0.3"
                            fill="none"
                            strokeDasharray="3,3"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ 
                              pathLength: 1, 
                              opacity: [0, 0.5, 0],
                              d: [
                                `M${30 + (i*20)},${ 20 + (i*15)} Q${100 + Math.sin(i)*50},${50 + Math.cos(i)*50} ${150 + (i*10)},${70 + (i*10)}`,
                                `M${40 + (i*20)},${ 25 + (i*15)} Q${110 + Math.sin(i+1)*50},${60 + Math.cos(i+1)*50} ${160 + (i*10)},${80 + (i*10)}`,
                                `M${30 + (i*20)},${ 20 + (i*15)} Q${100 + Math.sin(i)*50},${50 + Math.cos(i)*50} ${150 + (i*10)},${70 + (i*10)}`
                              ]
                            }}
                            transition={{ 
                              duration: 8 + i, 
                              repeat: Infinity, 
                              ease: "easeInOut",
                              delay: i * 0.5
                            }}
                          />
                        ))}
                      </svg>
                    </div>

                    {/* Partículas avançadas com efeitos */}
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(40)].map((_, i) => (
                        <motion.div
                          key={`particle-${i}`}
                          className="absolute rounded-full z-10"
                          style={{
                            width: Math.random() * 8 + 2,
                            height: Math.random() * 8 + 2,
                            background: i % 3 === 0 
                              ? `rgba(255, ${Math.floor(107 + Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${0.4 + Math.random() * 0.6})` 
                              : "rgba(255, 255, 255, 0.4)",
                            boxShadow: i % 3 === 0 
                              ? `0 0 ${Math.floor(Math.random() * 10) + 5}px rgba(255, 107, 0, 0.6)` 
                              : `0 0 ${Math.floor(Math.random() * 5) + 2}px rgba(255, 255, 255, 0.6)`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            filter: "blur(0.5px)"
                          }}
                          animate={{
                            y: [0, -(Math.random() * 150 + 50)],
                            x: [0, (Math.random() * 50 - 25)],
                            opacity: [0, 0.9, 0],
                            scale: [0, 1 + Math.random(), 0.2]
                          }}
                          transition={{
                            duration: 4 + Math.random() * 6,
                            repeat: Infinity,
                            delay: Math.random() * 10,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                      
                      {/* Efeito de movimento de ondas melhorado */}
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={`wave-${i}`}
                          className="absolute bottom-0 left-0 right-0"
                          style={{
                            height: `${40 + i * 20}px`,
                            background: `linear-gradient(to top, rgba(255, 107, 0, ${0.2 - i * 0.05}), transparent)`,
                            clipPath: "url(#wave-path-" + i + ")",
                            zIndex: 2
                          }}
                          animate={{
                            y: [0, -10, 5, -5, 0],
                          }}
                          transition={{
                            duration: 10 - i * 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.5
                          }}
                        />
                      ))}
                      
                      {/* SVGs para ondas múltiplas */}
                      <svg width="0" height="0" className="absolute">
                        <defs>
                          <clipPath id="wave-path-0">
                            <path d="M0,64 C32,32 64,96 96,64 C128,32 160,96 192,64 C224,32 256,96 288,64 C320,32 352,96 384,64 C416,32 448,96 480,64 C512,32 544,96 576,64 C608,32 640,96 672,64 C704,32 736,96 768,64 C800,32 832,96 864,64 C896,32 928,96 960,64 C992,32 1024,96 1056,64 L1056,192 L0,192 Z" />
                          </clipPath>
                          <clipPath id="wave-path-1">
                            <path d="M0,74 C48,42 96,106 144,74 C192,42 240,106 288,74 C336,42 384,106 432,74 C480,42 528,106 576,74 C624,42 672,106 720,74 C768,42 816,106 864,74 C912,42 960,106 1008,74 L1008,192 L0,192 Z" />
                          </clipPath>
                          <clipPath id="wave-path-2">
                            <path d="M0,84 C64,52 128,116 192,84 C256,52 320,116 384,84 C448,52 512,116 576,84 C640,52 704,116 768,84 C832,52 896,116 960,84 L960,192 L0,192 Z" />
                          </clipPath>
                        </defs>
                      </svg>
                    </div>

                    {/* Padrões geométricos com animação */}
                    <div className="absolute inset-0 z-1"> 
                      <div className="absolute inset-0 opacity-20" 
                        style={{ 
                          backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627,22.5 L60,30 L54.627,37.5 L45.373,37.5 L40,30 L45.373,22.5 L54.627,22.5 Z M14.627,22.5 L20,30 L14.627,37.5 L5.373,37.5 L0,30 L5.373,22.5 L14.627,22.5 Z M34.627,0 L40,7.5 L34.627,15 L25.373,15 L20,7.5 L25.373,0 L34.627,0 Z M34.627,45 L40,52.5 L34.627,60 L25.373,60 L20,52.5 L25.373,45 L34.627,45 Z' fill='%23FF6B00' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E')",
                          backgroundSize: "120px 120px"
                        }}
                      >
                        <motion.div 
                          className="absolute inset-0"
                          animate={{
                            backgroundPosition: ["0% 0%", "120px 120px"]
                          }}
                          transition={{
                            duration: 30,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                          style={{ 
                            backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627,22.5 L60,30 L54.627,37.5 L45.373,37.5 L40,30 L45.373,22.5 L54.627,22.5 Z M14.627,22.5 L20,30 L14.627,37.5 L5.373,37.5 L0,30 L5.373,22.5 L14.627,22.5 Z M34.627,0 L40,7.5 L34.627,15 L25.373,15 L20,7.5 L25.373,0 L34.627,0 Z M34.627,45 L40,52.5 L34.627,60 L25.373,60 L20,52.5 L25.373,45 L34.627,45 Z' fill='%23FF6B00' fill-opacity='0.15' fill-rule='evenodd'/%3E%3C/svg%3E')",
                            backgroundSize: "120px 120px"
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Efeitos de iluminação aprimorados */}
                    <motion.div 
                      className="absolute -top-40 -right-40 w-80 h-80 bg-[#FF6B00]/15 rounded-full blur-3xl"
                      animate={{
                        opacity: [0.5, 0.8, 0.5],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div 
                      className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FF8C40]/15 rounded-full blur-3xl"
                      animate={{
                        opacity: [0.5, 0.8, 0.5],
                        scale: [1.2, 1, 1.2]
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 4
                      }}
                    />

                    {/* Overlay sofisticado para garantir legibilidade */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80 z-10"></div>

                    {/* Conteúdo com animação ultra-sofisticada */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="mb-2 relative"
                      >
                        {/* Efeito de celebração com fogos de artifício digitais */}
                        <div className="absolute -top-20 left-0 right-0 h-20 overflow-hidden pointer-events-none">
                          {[...Array(10)].map((_, i) => (
                            <motion.div
                              key={`firework-${i}`}
                              className="absolute"
                              style={{
                                left: `${10 + i * 8}%`,
                                bottom: "-5px",
                                width: "2px",
                                height: "2px",
                                borderRadius: "50%",
                                backgroundColor: i % 2 === 0 ? "#FF6B00" : "#FFD700",
                              }}
                              initial={{ y: 0, scale: 0.5, opacity: 0 }}
                              animate={{
                                y: [-60 - Math.random() * 40, -120 - Math.random() * 80],
                                scale: [0.5, 0],
                                opacity: [0, 1, 0],
                              }}
                              transition={{
                                duration: 1.5 + Math.random(),
                                repeat: Infinity,
                                delay: 0.5 + i * 0.3,
                                ease: [0.4, 0.0, 0.2, 1],
                                repeatDelay: Math.random() * 3 + i
                              }}
                            >
                              <motion.div
                                className="absolute"
                                animate={{
                                  scale: [0, 3, 0],
                                  opacity: [1, 0],
                                }}
                                transition={{
                                  duration: 0.6,
                                  ease: "easeOut",
                                  delay: 1.5 + Math.random() * 0.3,
                                  repeat: Infinity,
                                  repeatDelay: 1.5 + Math.random() * 3 + i
                                }}
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  background: `radial-gradient(circle, ${i % 2 === 0 ? '#FF6B00' : '#FFD700'} 0%, transparent 70%)`,
                                  boxShadow: `0 0 10px 2px ${i % 2 === 0 ? '#FF6B00' : '#FFD700'}`,
                                  left: "-4px",
                                  top: "-4px",
                                }}
                              />
                            </motion.div>
                          ))}
                        </div>

                        {/* Título de sucesso ultra aprimorado com avatar animado */}
                        <div className="flex items-center justify-between mb-4 relative">
                          <div className="flex items-center gap-3">
                            <motion.div 
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ 
                                type: "spring", 
                                stiffness: 260, 
                                damping: 20,
                                delay: 0.5 
                              }}
                              className="relative"
                            >
                              {/* Círculos de pulso animados */}
                              {[...Array(3)].map((_, i) => (
                                <motion.div
                                  key={`pulse-${i}`}
                                  className={`absolute inset-0 rounded-full bg-[#FF6B00]/${30 - i * 10}`}
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ 
                                    scale: [0.8, 2.2 - i * 0.3, 0.8],
                                    opacity: [0, 0.6 - i * 0.2, 0]
                                  }}
                                  transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    delay: i * 0.4,
                                    ease: "easeInOut"
                                  }}
                                />
                              ))}
                              
                              {/* Ícone de sucesso com efeito de brilho */}
                              <motion.div 
                                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] flex items-center justify-center relative z-10 shadow-lg shadow-[#FF6B00]/30"
                                animate={{ 
                                  boxShadow: ["0 0 10px 0px rgba(255, 107, 0, 0.5)", "0 0 20px 5px rgba(255, 107, 0, 0.6)", "0 0 10px 0px rgba(255, 107, 0, 0.5)"]
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              >
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1, rotate: [0, 5, 0, -5, 0] }}
                                  transition={{
                                    scale: { type: "spring", stiffness: 260, damping: 20, delay: 0.7 },
                                    rotate: { 
                                      duration: 2, 
                                      delay: 2,
                                      repeat: 1,
                                      repeatType: "reverse"
                                    }
                                  }}
                                >
                                  <CheckCircle className="h-6 w-6 text-white" />
                                </motion.div>
                              </motion.div>
                            </motion.div>
                            
                            {/* Título com efeito de entrada + glow dinâmico */}
                            <div className="relative">
                              <motion.h3 
                                initial={{ x: -20, opacity: 0, scale: 0.9 }}
                                animate={{ x: 0, opacity: 1, scale: 1 }}
                                transition={{ 
                                  delay: 0.6, 
                                  duration: 0.6, 
                                  type: "spring",
                                  stiffness: 150
                                }}
                                className="text-2xl font-bold text-white relative z-10"
                              >
                                <motion.span
                                  animate={{ 
                                    textShadow: [
                                      "0 0 5px rgba(255, 107, 0, 0.3)", 
                                      "0 0 15px rgba(255, 107, 0, 0.5)", 
                                      "0 0 5px rgba(255, 107, 0, 0.3)"
                                    ]
                                  }}
                                  transition={{ 
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut" 
                                  }}
                                  className="bg-clip-text"
                                >
                                  {/* Texto com efeito de gradiente animado */}
                                  <motion.span
                                    className="inline-block"
                                    animate={{
                                      color: ["#ffffff", "#FF8C40", "#ffffff"]
                                    }}
                                    transition={{
                                      duration: 3,
                                      ease: "easeInOut",
                                      repeat: Infinity
                                    }}
                                  >C</motion.span>
                                  <motion.span
                                    className="inline-block"
                                    animate={{
                                      color: ["#ffffff", "#FF8C40", "#ffffff"]
                                    }}
                                    transition={{
                                      duration: 3,
                                      ease: "easeInOut",
                                      delay: 0.1,
                                      repeat: Infinity
                                    }}
                                  >o</motion.span>
                                  <motion.span
                                    className="inline-block"
                                    animate={{
                                      color: ["#ffffff", "#FF8C40", "#ffffff"]
                                    }}
                                    transition={{
                                      duration: 3,
                                      ease: "easeInOut",
                                      delay: 0.2,
                                      repeat: Infinity
                                    }}
                                  >n</motion.span>
                                  <motion.span
                                    className="inline-block"
                                    animate={{
                                      color: ["#ffffff", "#FF8C40", "#ffffff"]
                                    }}
                                    transition={{
                                      duration: 3,
                                      ease: "easeInOut",
                                      delay: 0.3,
                                      repeat: Infinity
                                    }}
                                  >t</motion.span>
                                  <motion.span
                                    className="inline-block"
                                    animate={{
                                      color: ["#ffffff", "#FF8C40", "#ffffff"]
                                    }}
                                    transition={{
                                      duration: 3,
                                      ease: "easeInOut",
                                      delay: 0.4,
                                      repeat: Infinity
                                    }}
                                  >a</motion.span>
                                  <motion.span className="inline-block mx-1">criada</motion.span>
                                  <motion.span
                                    className="inline-block"
                                    animate={{
                                      color: ["#ffffff", "#FF8C40", "#ffffff"]
                                    }}
                                    transition={{
                                      duration: 3,
                                      ease: "easeInOut",
                                      delay: 0.5,
                                      repeat: Infinity
                                    }}
                                  >c</motion.span>
                                  <motion.span
                                    className="inline-block"
                                    animate={{
                                      color: ["#ffffff", "#FF8C40", "#ffffff"]
                                    }}
                                    transition={{
                                      duration: 3,
                                      ease: "easeInOut",
                                      delay: 0.6,
                                      repeat: Infinity
                                    }}
                                  >o</motion.span>
                                  <motion.span
                                    className="inline-block"
                                    animate={{
                                      color: ["#ffffff", "#FF8C40", "#ffffff"]
                                    }}
                                    transition={{
                                      duration: 3,
                                      ease: "easeInOut",
                                      delay: 0.7,
                                      repeat: Infinity
                                    }}
                                  >m</motion.span>
                                  <motion.span className="inline-block mx-1">sucesso!</motion.span>
                                  
                                  {/* Efeito de estrela no título */}
                                  <motion.span
                                    className="absolute -right-6 -top-6 text-yellow-400"
                                    initial={{ scale: 0, opacity: 0, rotate: 0 }}
                                    animate={{ 
                                      scale: [0, 1.5, 1],
                                      opacity: [0, 1, 1],
                                      rotate: [0, 45, 0],
                                    }}
                                    transition={{
                                      duration: 1,
                                      delay: 1.2
                                    }}
                                  >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FFD700" />
                                    </svg>
                                    <motion.div
                                      className="absolute inset-0"
                                      animate={{ 
                                        opacity: [1, 0.5, 1],
                                        scale: [1, 1.2, 1]
                                      }}
                                      transition={{
                                        duration: 2,
                                        repeat: Infinity
                                      }}
                                    >
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FFD700" />
                                      </svg>
                                    </motion.div>
                                  </motion.span>
                                </motion.span>
                              </motion.h3>
                              
                              {/* Barra decorativa animada sob o título */}
                              <motion.div
                                className="absolute -bottom-2 left-0 h-[2px] bg-gradient-to-r from-[#FF6B00] via-[#FF8C40] to-[#FF6B00]"
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: "100%", opacity: 1 }}
                                transition={{ delay: 0.9, duration: 0.7 }}
                              />
                              <motion.div
                                className="absolute -bottom-2 left-0 h-[2px] w-full opacity-0"
                                animate={{ 
                                  opacity: [0, 0.8, 0],
                                  left: ["0%", "100%"] 
                                }}
                                transition={{ 
                                  duration: 2,
                                  repeat: Infinity,
                                  delay: 1.7,
                                  repeatDelay: 3
                                }}
                                style={{
                                  background: "linear-gradient(to right, transparent, #FF6B00, transparent)",
                                  width: "30px"
                                }}
                              />
                            </div>
                          </div>

                          {/* Avatar interativo e animado de saudação */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0, x: 50 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ 
                              type: "spring",
                              damping: 12,
                              stiffness: 100,
                              delay: 0.8
                            }}
                            className="relative h-32 w-32 mr-3 -mt-12 z-30"
                          >
                            {/* Circulos de energia em volta do avatar */}
                            {[...Array(2)].map((_, i) => (
                              <motion.div
                                key={`avatar-energy-${i}`}
                                className="absolute rounded-full border-2 border-[#FF8C40]/30"
                                style={{
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  width: `${95 + i * 15}%`,
                                  height: `${95 + i * 15}%`,
                                }}
                                animate={{
                                  opacity: [0.2, 0.6, 0.2],
                                  scale: [1, 1.1, 1],
                                  rotate: [0, 180, 360]
                                }}
                                transition={{
                                  duration: 8 - i * 2,
                                  repeat: Infinity,
                                  ease: "linear"
                                }}
                              />
                            ))}

                            {/* Círculo de fundo do avatar */}
                            <motion.div
                              className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF6B00]/20 to-[#FF8C40]/40 backdrop-blur-sm shadow-xl"
                              animate={{
                                boxShadow: [
                                  "0 0 20px 0px rgba(255, 107, 0, 0.4)",
                                  "0 0 30px 10px rgba(255, 107, 0, 0.3)",
                                  "0 0 20px 0px rgba(255, 107, 0, 0.4)"
                                ]
                              }}
                              transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />

                            {/* SVG do avatar */}
                            <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
                              <svg width="100%" height="100%" viewBox="0 0 200 200" className="absolute">
                                <defs>
                                  <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#FF8C40" stopOpacity="0.1" />
                                  </linearGradient>
                                  <clipPath id="avatarClip">
                                    <circle cx="100" cy="100" r="90" />
                                  </clipPath>
                                </defs>
                                <circle cx="100" cy="100" r="90" fill="url(#avatarGradient)" />
                              </svg>

                              {/* Avatar principal */}
                              <motion.div 
                                className="relative z-10 w-full h-full"
                                initial={{ y: 10 }}
                                animate={{ y: [0, -5, 0] }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              >
                                {/* SVG de pessoa estilizada */}
                                <svg viewBox="0 0 200 200" width="100%" height="100%" className="relative z-20">
                                  {/* Corpo do avatar */}
                                  <motion.g
                                    animate={{ 
                                      y: [0, -2, 0, 2, 0],
                                      rotate: [0, 1, 0, -1, 0]
                                    }}
                                    transition={{
                                      duration: 4,
                                      repeat: Infinity,
                                      ease: "easeInOut"
                                    }}
                                  >
                                    {/* Cabeça */}
                                    <circle cx="100" cy="75" r="40" fill="#FFD8BF" />
                                    
                                    {/* Cabelo */}
                                    <path d="M60 75 C60 45, 140 45, 140 75" fill="#4A3228" />
                                    <path d="M60 75 C60 55, 80 40, 100 40 C120 40, 140 55, 140 75" fill="#4A3228" />
                                    
                                    {/* Ombros */}
                                    <path d="M60 110 C80 105, 120 105, 140 110" fill="#FFD8BF" />
                                    
                                    {/* Corpo */}
                                    <path d="M75 112 L75 160 C85 165, 115 165, 125 160 L125 112" fill="#FF6B00" />
                                    
                                    {/* Gravata ou detalhe */}
                                    <path d="M95 112 L100 150 L105 112" fill="#FF8C40" />
                                    
                                    {/* Detalhes de roupas - botões */}
                                    <circle cx="100" cy="125" r="3" fill="#FFD700" />
                                    <circle cx="100" cy="135" r="3" fill="#FFD700" />
                                    
                                    {/* Olhos */}
                                    <motion.g
                                      animate={{ 
                                        x: [0, 2, 0, -2, 0] 
                                      }}
                                      transition={{
                                        duration: 5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        repeatType: "reverse"
                                      }}
                                    >
                                      <circle cx="85" cy="70" r="5" fill="#4A3228" />
                                      <circle cx="115" cy="70" r="5" fill="#4A3228" />
                                      <circle cx="87" cy="68" r="2" fill="white" />
                                      <circle cx="117" cy="68" r="2" fill="white" />
                                    </motion.g>
                                    
                                    {/* Nariz */}
                                    <path d="M97 80 Q100 85 103 80" fill="none" stroke="#C69B85" strokeWidth="1.5" />
                                    
                                    {/* Boca */}
                                    <motion.path 
                                      d="M90 90 Q100 98 110 90" 
                                      fill="none" 
                                      stroke="#C69B85" 
                                      strokeWidth="2"
                                      animate={{
                                        d: [
                                          "M90 90 Q100 98 110 90", 
                                          "M90 92 Q100 100 110 92", 
                                          "M90 90 Q100 98 110 90"
                                        ]
                                      }}
                                      transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                      }}
                                    />
                                    
                                    {/* Sobrancelhas */}
                                    <motion.g
                                      animate={{
                                        y: [0, -2, 0]
                                      }}
                                      transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        repeatType: "reverse",
                                        delay: 1
                                      }}
                                    >
                                      <path d="M75 60 Q85 55 95 60" fill="none" stroke="#4A3228" strokeWidth="2" />
                                      <path d="M105 60 Q115 55 125 60" fill="none" stroke="#4A3228" strokeWidth="2" />
                                    </motion.g>
                                    
                                    {/* Bochechas */}
                                    <circle cx="80" cy="82" r="7" fill="#FFBAA5" fillOpacity="0.5" />
                                    <circle cx="120" cy="82" r="7" fill="#FFBAA5" fillOpacity="0.5" />
                                  </motion.g>
                                  
                                  {/* Braço direito acenando */}
                                  <motion.g
                                    animate={{ 
                                      rotate: [0, 20, 0, 20, 0]
                                    }}
                                    transition={{
                                      duration: 2.5,
                                      repeat: Infinity,
                                      ease: "easeInOut",
                                      repeatType: "reverse"
                                    }}
                                    style={{ 
                                      originX: 140, 
                                      originY: 110 
                                    }}
                                  >
                                    <path d="M140 110 L170 80" stroke="#FFD8BF" strokeWidth="12" strokeLinecap="round" />
                                    <circle cx="175" cy="75" r="10" fill="#FFD8BF" />
                                  </motion.g>
                                </svg>
                              </motion.div>
                            </div>

                            {/* Balão de fala */}
                            <motion.div
                              className="absolute -top-12 right-0 bg-white dark:bg-[#FF6B00]/90 px-3 py-1 rounded-xl text-xs font-bold text-[#001427] dark:text-white shadow-md"
                              initial={{ opacity: 0, scale: 0, y: 10 }}
                              animate={{ 
                                opacity: 1, 
                                scale: [0, 1.2, 1],
                                y: 0,
                                rotate: [0, -5, 0, 5, 0]
                              }}
                              transition={{
                                delay: 1.5,
                                duration: 0.5,
                                rotate: {
                                  delay: 2,
                                  duration: 1.5,
                                  repeat: Infinity,
                                  repeatType: "reverse"
                                }
                              }}
                            >
                              Bem-vindo(a)!
                              <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white dark:bg-[#FF6B00]/90 rotate-45"></div>
                            </motion.div>

                            {/* Estrelas e partículas em volta do avatar */}
                            {[...Array(5)].map((_, i) => (
                              <motion.div
                                key={`star-${i}`}
                                className="absolute w-3 h-3 text-yellow-400"
                                style={{
                                  top: `${20 + Math.random() * 60}%`,
                                  left: `${Math.random() * 30}%`,
                                  opacity: 0.7,
                                }}
                                animate={{
                                  opacity: [0.3, 0.9, 0.3],
                                  scale: [0.8, 1.2, 0.8],
                                  rotate: [0, 360]
                                }}
                                transition={{
                                  duration: 3 + Math.random() * 2,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                  delay: Math.random() * 2
                                }}
                              >
                                {i % 2 === 0 ? (
                                  <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                  </svg>
                                ) : (
                                  <svg viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="12" r="8" />
                                  </svg>
                                )}
                              </motion.div>
                            ))}
                          </motion.div>
                        </div>
                        
                        {/* Subtítulo aprimorado */}
                        <motion.div 
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.7, duration: 0.4 }}
                          className="text-white/90 ml-14 relative"
                        >
                          <motion.div
                            className="absolute -left-1 top-1/2 w-4 h-[1px] bg-[#FF6B00]"
                            initial={{ width: 0 }}
                            animate={{ width: 4 }}
                            transition={{ delay: 0.9, duration: 0.3 }}
                          />
                          <span className="relative">
                            Estamos muito felizes em ter você na 
                            <motion.span 
                              className="font-semibold text-[#FF8C40] mx-1 relative inline-block"
                              animate={{ 
                                color: ["#FF8C40", "#FF6B00", "#FF8C40"]
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              <motion.span
                                animate={{
                                  textShadow: [
                                    "0 0 5px rgba(255, 107, 0, 0.3)",
                                    "0 0 10px rgba(255, 107, 0, 0.5)",
                                    "0 0 5px rgba(255, 107, 0, 0.3)"
                                  ]
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              >
                                Ponto. School
                              </motion.span>
                              <motion.span 
                                className="absolute bottom-0 left-0 w-full h-[2px]"
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 1, duration: 0.5 }}
                                style={{
                                  background: "linear-gradient(to right, #FF6B00, #FF8C40)"
                                }}
                              />
                              {/* Efeito de brilho deslizante */}
                              <motion.span 
                                className="absolute bottom-0 left-0 h-[2px] opacity-60"
                                animate={{ 
                                  left: ["-10%", "110%"]
                                }}
                                transition={{ 
                                  duration: 1.5,
                                  repeat: Infinity,
                                  repeatDelay: 2.5,
                                  delay: 1.5 
                                }}
                                style={{
                                  width: "20%",
                                  background: "linear-gradient(to right, transparent, white, transparent)"
                                }}
                              />
                            </motion.span>!
                          </span>
                        </motion.div>
                      </motion.div>
                    </div>
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

                <div 
                  className="p-6 space-y-6 relative"
                  style={{
                    background: "transparent",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)"
                  }}
                >
                  {/* Partículas flutuantes interativas */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(15)].map((_, i) => (
                      <motion.div
                        key={`floating-particle-${i}`}
                        className="absolute rounded-full"
                        style={{
                          width: `${Math.random() * 6 + 2}px`,
                          height: `${Math.random() * 6 + 2}px`,
                          backgroundColor: i % 3 === 0 
                            ? `rgba(255, ${Math.floor(107 + Math.random() * 100)}, 0, ${0.2 + Math.random() * 0.3})` 
                            : "rgba(255, 255, 255, 0.2)",
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                          zIndex: 5
                        }}
                        animate={{
                          y: [0, -(Math.random() * 60 + 20)],
                          x: [0, (Math.random() * 40 - 20)],
                          opacity: [0, 0.5, 0],
                          scale: [0, 1, 0]
                        }}
                        transition={{
                          duration: 5 + Math.random() * 5,
                          repeat: Infinity,
                          delay: Math.random() * 5,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>

                  {/* Efeito de radial gradient que segue o mouse */}
                  <motion.div 
                    className="absolute inset-0 pointer-events-none z-1"
                    animate={{
                      background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(255, 107, 0, 0.1), transparent 70%)`
                    }}
                    transition={{
                      duration: 0.3,
                      ease: "linear"
                    }}
                    style={{
                      mixBlendMode: "overlay"
                    }}
                  />

                  <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-center mb-4 relative z-10"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Bem-vindo à Ponto. School
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Estamos animados para ajudar você em sua jornada de aprendizado!
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                    <motion.div 
                      custom={0}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className="bg-transparent p-4 rounded-xl border border-white/20 backdrop-blur-sm relative overflow-hidden group"
                      whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(255, 107, 0, 0.3)" }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="absolute -right-6 -top-6 w-16 h-16 bg-[#FF6B00]/10 rounded-full blur-xl group-hover:bg-[#FF6B00]/20 transition-all duration-700"></div>
                      <div className="h-10 w-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3 relative z-10">
                        <Settings className="h-5 w-5 text-[#FF6B00]" />
                      </div>
                      <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Configure sua conta</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
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
                      className="bg-transparent p-4 rounded-xl border border-white/20 backdrop-blur-sm relative overflow-hidden group"
                      whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(255, 107, 0, 0.3)" }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="absolute -right-6 -top-6 w-16 h-16 bg-[#FF6B00]/10 rounded-full blur-xl group-hover:bg-[#FF6B00]/20 transition-all duration-700"></div>
                      <div className="h-10 w-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3 relative z-10">
                        <MapPin className="h-5 w-5 text-[#FF6B00]" />
                      </div>
                      <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Tour pela plataforma</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                        Conheça os recursos e funcionalidades da Ponto. School.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800/30 w-full opacity-70 cursor-not-allowed"
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
                      className="bg-transparent p-4 rounded-xl border border-white/20 backdrop-blur-sm relative overflow-hidden group"
                      whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(255, 107, 0, 0.3)" }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="absolute -right-6 -top-6 w-16 h-16 bg-[#FF6B00]/10 rounded-full blur-xl group-hover:bg-[#FF6B00]/20 transition-all duration-700"></div>
                      <div className="h-10 w-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3 relative z-10">
                        <CheckCircle className="h-5 w-5 text-[#FF6B00]" />
                      </div>
                      <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Comece a aprender</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
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
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center justify-start w-full bg-transparent hover:bg-white/5 text-white p-4 rounded-lg border border-white/10 relative overflow-hidden group"
                  >
                    <div className="h-10 w-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mr-4 relative z-10">
                      <Lightbulb className="h-5 w-5 text-[#FF6B00]" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Acesse o Dashboard</div>
                      <div className="text-xs text-white/60">Comece a explorar a plataforma</div>
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