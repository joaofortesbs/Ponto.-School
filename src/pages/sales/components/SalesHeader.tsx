import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function SalesHeader() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

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
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF6B00]/20 via-[#FF8C40]/20 to-[#FF6B00]/20 rounded-3xl blur-xl opacity-75"></div>

        {/* Container Principal do Header */}
        <div 
          className={`
            relative flex items-center justify-between
            px-3 md:px-4 py-1
            bg-[#0A1628]/80 backdrop-blur-2xl
            border border-white/10
            rounded-[2rem]
            shadow-2xl shadow-black/50
            transition-all duration-300
            ${isScrolled ? 'bg-[#0A1628]/95 border-white/20' : ''}
          `}
          style={{
            backdropFilter: `blur(${headerBlur}px)`,
            WebkitBackdropFilter: `blur(${headerBlur}px)`,
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

          {/* Botão "Comece Já" - Canto Direito */}
          <div className="ml-auto pl-8 md:pl-12 flex items-center gap-3">
            {/* Ícone de Globo com Gradiente */}
            <motion.div
              whileHover={{ scale: 1.15, rotate: 360 }}
              whileTap={{ scale: 0.95 }}
              transition={{ 
                duration: 0.6, 
                ease: "easeInOut" 
              }}
              className="relative"
            >
              <svg 
                className="w-6 h-6" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="globeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#FF9933', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#FFB366', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <path 
                  fill="url(#globeGradient)" 
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                />
              </svg>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
              onClick={() => navigate('/register')}
              className="
                relative overflow-hidden
                px-6 md:px-6 py-2 md:py-3
                bg-gradient-to-r from-[#FF6B00] to-[#FF8C40]
                hover:from-[#FF8C40] hover:to-[#FF6B00]
                text-white font-bold text-base md:text-lg
                rounded-3xl
                shadow-lg shadow-[#FF6B00]/30
                hover:shadow-xl hover:shadow-[#FF6B00]/40
                transition-all duration-300
                border border-white/10
                group
              "
            >
              {/* Efeito de brilho no hover */}
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>

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