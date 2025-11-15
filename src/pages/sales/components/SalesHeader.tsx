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
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="ml-auto pl-8 md:pl-12"
          >
            <Button
              onClick={() => navigate('/register')}
              className="
                relative overflow-hidden
                px-6 md:px-8 py-3 md:py-6
                bg-gradient-to-r from-[#FF6B00] to-[#FF8C40]
                hover:from-[#FF8C40] hover:to-[#FF6B00]
                text-white font-bold text-base md:text-lg
                rounded-3xl
                shadow-lg shadow-[#FF6B00]/50
                hover:shadow-xl hover:shadow-[#FF6B00]/70
                transition-all duration-300
                border border-white/10
                group
              "
            >
              {/* Efeito de brilho no hover */}
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>

              {/* Texto */}
              <span className="relative z-10 flex items-center gap-2">
                Comece já
                <svg 
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Button>
          </motion.div>
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