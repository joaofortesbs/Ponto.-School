import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SalesHeader() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("pt-BR"); // Estado para a linguagem selecionada
  const [selectedUserType, setSelectedUserType] = useState("professor"); // Estado para o tipo de usuário selecionado

  // Transformar o scroll em valores para animações
  const headerOpacity = useTransform(scrollY, [0, 100], [0.95, 1]);
  const headerBlur = useTransform(scrollY, [0, 100], [8, 16]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Função para obter o texto do botão baseado no tipo selecionado
  const getUserTypeLabel = () => {
    switch (selectedUserType) {
      case "professor":
        return "Professor";
      case "aluno":
        return "Alunos";
      case "escola":
        return "Escolas";
      default:
        return "Professor";
    }
  };

  return (
    <motion.header
      style={{
        opacity: headerOpacity,
      }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl"
    >
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative"
      >
        {/* Brilho de fundo com gradiente */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF6B00]/20 via-[#FF8C40]/30 to-[#FF6B00]/20 rounded-3xl blur-xl opacity-60"></div>

        {/* Container Principal do Header */}
        <div
          className={`
            relative flex items-center justify-between
            px-3 md:px-4 py-1
            rounded-[2rem]
            shadow-2xl shadow-black/50
            transition-all duration-300
            ${isScrolled ? 'border-white/20' : 'border-white/10'}
          `}
          style={{
            background: isScrolled 
              ? 'linear-gradient(135deg, rgba(10, 22, 40, 0.7) 0%, rgba(10, 22, 40, 0.5) 100%)'
              : 'linear-gradient(135deg, rgba(10, 22, 40, 0.6) 0%, rgba(10, 22, 40, 0.4) 100%)',
            backdropFilter: `blur(${headerBlur}px) saturate(180%)`,
            WebkitBackdropFilter: `blur(${headerBlur}px) saturate(180%)`,
            border: `1px solid ${isScrolled ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              0 0 0 1px rgba(255, 107, 0, 0.1)
            `,
          }}
        >
          {/* Logo - Canto Esquerdo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="relative">
              {/* Brilho atrás do logo */}
              <div className="absolute -inset-2 bg-gradient-to-r from-[#FF6B00]/30 to-[#FF8C40]/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Logo */}
              <img
                src="/lovable-uploads/Logo-Ponto. School.png"
                alt="Ponto School"
                className="h-12 md:h-14 w-auto object-contain relative z-10 drop-shadow-2xl"
              />
            </div>
          </motion.div>

          {/* Container Centralizado com Botões */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
            {/* Dropdown do Botão Professor */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className="
                      relative overflow-hidden
                      px-4 md:px-5 py-2 md:py-3
                      text-white font-bold text-base md:text-lg
                      rounded-3xl
                      shadow-lg shadow-[#FF6B00]/30
                      hover:shadow-xl hover:shadow-[#FF6B00]/40
                      transition-all duration-300
                      group
                    "
                    style={{
                      border: '1.5px solid transparent',
                      backgroundImage: 'linear-gradient(135deg, #FFD05A, #FF6800, #FF5100)',
                      backgroundOrigin: 'border-box',
                      backgroundClip: 'border-box'
                    }}
                  >
                    {/* Camada de fundo interno com opacidade de 30% */}
                    <span
                      className="absolute inset-[1.5px] rounded-[calc(1.5rem-1.5px)] z-0"
                      style={{
                        background: 'rgba(255, 107, 0, 0.3)'
                      }}
                    ></span>

                    {/* Efeito de brilho no hover */}
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-3xl z-[1]"></span>

                    {/* Texto com ícone */}
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                      </svg>
                      {getUserTypeLabel()}
                    </span>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="bottom"
                align="end"
                className="bg-[#0A1628]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 min-w-[180px]"
              >
                <DropdownMenuItem
                  onClick={() => setSelectedUserType("professor")}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors text-white focus:bg-white/10 focus:text-white outline-none ${selectedUserType === "professor" ? "bg-white/10" : ""}`}
                >
                  <span className="font-medium">Professores</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setSelectedUserType("aluno")}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors text-white focus:bg-white/10 focus:text-white outline-none ${selectedUserType === "aluno" ? "bg-white/10" : ""}`}
                >
                  <span className="font-medium">Alunos</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setSelectedUserType("escola")}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors text-white focus:bg-white/10 focus:text-white outline-none ${selectedUserType === "escola" ? "bg-white/10" : ""}`}
                >
                  <span className="font-medium">Escolas</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Botão Modelos - Configuração Independente */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                className="
                  relative overflow-hidden
                  px-4 md:px-5 py-2 md:py-3
                  text-white font-bold text-base md:text-lg
                  rounded-3xl
                  shadow-lg shadow-[#FF6B00]/30
                  hover:shadow-xl hover:shadow-[#FF6B00]/40
                  transition-all duration-300
                  group
                "
                style={{
                  border: '1.5px solid transparent',
                  backgroundImage: 'linear-gradient(135deg, #FFD05A, #FF6800, #FF5100)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'border-box'
                }}
              >
                {/* Camada de fundo interno com opacidade de 30% */}
                <span 
                  className="absolute inset-[1.5px] rounded-[calc(1.5rem-1.5px)] z-0"
                  style={{
                    background: 'rgba(255, 107, 0, 0.3)'
                  }}
                ></span>

                {/* Efeito de brilho no hover */}
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-3xl z-[1]"></span>

                {/* Texto com ícone */}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                  Modelos
                </span>
              </Button>
            </motion.div>
          </div>

          {/* Controles - Canto Direito */}
          <div className="ml-auto flex items-center gap-3">
            {/* Dropdown de Seleção de Idiomas */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.15, rotate: 360 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{
                    duration: 0.6,
                    ease: "easeInOut"
                  }}
                  className="relative bg-transparent border-none cursor-pointer focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                >
                  <svg
                    className="w-7 h-7"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="globeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#FF6B00', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#FF8C40', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    <path
                      fill="url(#globeGradient)"
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                    />
                  </svg>
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="center"
                className="bg-[#0A1628]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 min-w-[200px]"
              >
                <DropdownMenuItem
                  onClick={() => setSelectedLanguage("pt-BR")}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors text-white focus:bg-white/10 focus:text-white outline-none"
                >
                  <img src="/images/bandeira-brasil.png" alt="Brasil" className="w-6 h-6 object-cover rounded" />
                  <span className="font-medium">Português Brasil</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setSelectedLanguage("en-US")}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors text-white focus:bg-white/10 focus:text-white outline-none"
                >
                  <img src="/images/bandeira-estados-unidos.png" alt="USA" className="w-6 h-6 object-cover rounded" />
                  <span className="font-medium">English</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setSelectedLanguage("es-ES")}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors text-white focus:bg-white/10 focus:text-white outline-none"
                >
                  <img src="/images/bandeira-espanha.png" alt="España" className="w-6 h-6 object-cover rounded" />
                  <span className="font-medium">Español</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setSelectedLanguage("fr-FR")}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors text-white focus:bg-white/10 focus:text-white outline-none"
                >
                  <img src="/images/bandeira-franca.png" alt="France" className="w-6 h-6 object-cover rounded" />
                  <span className="font-medium">Français</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setSelectedLanguage("ja-JP")}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors text-white focus:bg-white/10 focus:text-white outline-none"
                >
                  <img src="/images/bandeira-japao.png" alt="日本" className="w-6 h-6 object-cover rounded" />
                  <span className="font-medium">日本語</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setSelectedLanguage("de-DE")}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors text-white focus:bg-white/10 focus:text-white outline-none"
                >
                  <img src="/images/bandeira-alemanha.png" alt="Deutschland" className="w-6 h-6 object-cover rounded" />
                  <span className="font-medium">Deutsch</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
              onClick={() => navigate('/register')}
              className="
                relative overflow-hidden
                px-6 md:px-6 py-2 md:py-3
                text-white font-bold text-base md:text-lg
                rounded-3xl
                shadow-lg shadow-[#FF6B00]/30
                hover:shadow-xl hover:shadow-[#FF6B00]/40
                transition-all duration-300
                group
              "
              style={{
                border: '1.5px solid transparent',
                backgroundImage: 'linear-gradient(135deg, #FFD05A, #FF6800, #FF5100)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'border-box'
              }}
            >
              {/* Camada de fundo interno com opacidade de 30% */}
              <span 
                className="absolute inset-[1.5px] rounded-[calc(1.5rem-1.5px)] z-0"
                style={{
                  background: 'rgba(255, 107, 0, 0.3)'
                }}
              ></span>

              {/* Efeito de brilho no hover */}
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-3xl z-[1]"></span>

              {/* Texto */}
              <span className="relative z-10 flex items-center justify-center">
                Comece já
              </span>
            </Button>
            </motion.div>
          </div>
        </div>

        {/* Linha decorativa inferior */}
        <motion.div
          className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6B00]/50 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        ></motion.div>
      </motion.div>
    </motion.header>
  );
}