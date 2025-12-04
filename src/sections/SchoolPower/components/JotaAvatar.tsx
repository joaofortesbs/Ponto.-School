"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

/**
 * Componente JotaAvatar - Avatar de Jota específico para School Power
 * 
 * Características:
 * - Avatar VISÍVEL imediatamente ao entrar na página (sem hover inicial)
 * - Hover ativado automaticamente após um breve delay
 * - Hover state FIXO enquanto usuário está na seção
 * - Texto rotativo com efeito typewriter
 * 
 * Fluxo:
 * 1. Avatar aparece IMEDIATAMENTE (visível, sem hover)
 * 2. Após ~600ms, hover é ativado (avatar sobe e gradiente ativa)
 * 3. Label com texto rotativo + typewriter aparece
 * 4. Palavras rotam a cada 2s
 */
export function JotaAvatar() {
  const words = ["Construir?", "Programar?", "Montar?", "Desenvolver?", "Projetar?"];
  
  const [isHoverActive, setIsHoverActive] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const currentWord = words[currentWordIndex];

  // Efeito 1: Ativar hover após um delay
  useEffect(() => {
    const hoverTimer = setTimeout(() => {
      setIsHoverActive(true);
    }, 600); // Avatar fica visível por 600ms ANTES do hover ativar

    return () => clearTimeout(hoverTimer);
  }, []);

  // Efeito 2: Rotação de palavras (muda a cada 2 segundos)
  useEffect(() => {
    const wordTimer = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
      setDisplayedText(""); // Reset typewriter quando muda palavra
    }, 2500); // 2.5s: 2s de exibição + 0.5s de transição

    return () => clearInterval(wordTimer);
  }, []);

  // Efeito 3: Typewriter effect (anima os caracteres da palavra)
  useEffect(() => {
    if (displayedText.length < currentWord.length) {
      const typeTimer = setTimeout(() => {
        setDisplayedText(currentWord.slice(0, displayedText.length + 1));
      }, 80); // Velocidade do typewriter: 80ms por caractere

      return () => clearTimeout(typeTimer);
    }
  }, [displayedText, currentWord]);

  return (
    <div className="jota-avatar-container">
      <style>{`
        .jota-avatar-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 16px;
        }

        /* Componente circular do avatar */
        .jota-avatar-item {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: visible;
          border: 4px solid #000822;
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FF6F32;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), 
                      z-index 0.3s, 
                      border 0.3s, 
                      box-shadow 0.3s;
        }

        /* Estado ATIVO (hover fixo ou hover simulado) */
        .jota-avatar-item.is-hover-active {
          transform: translateY(-4px) scale(1.1);
          z-index: 10 !important;
          border: 3px solid transparent;
          background-origin: border-box;
          background-clip: padding-box, border-box;
          background-image: linear-gradient(#000822, #000822), linear-gradient(135deg, #FF6F32, #FF8C5A, #FFB088);
          box-shadow: 0 8px 16px rgba(255, 111, 50, 0.3);
        }

        /* Tooltip - Label "O que vamos [Palavra]" */
        .jota-avatar-label {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          color: #103a4a;
          padding: 10px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease, transform 0.3s ease;
          transform: translateX(-50%) translateY(8px);
          margin-bottom: 8px;
          z-index: 20;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          letter-spacing: 0.3px;
        }

        /* Seta do tooltip (triângulo branco) */
        .jota-avatar-label::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid white;
        }

        /* Mostrar label quando hover está ativo */
        .jota-avatar-item.is-hover-active .jota-avatar-label {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        /* Imagem do avatar */
        .jota-avatar-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          clip-path: circle(50% at center);
          display: block;
          transform: translateY(2px);
        }

        /* Hover interativo adicional (quando mouse passa por cima) */
        .jota-avatar-item:hover {
          transform: translateY(-4px) scale(1.1);
          z-index: 10 !important;
          border: 3px solid transparent;
          background-origin: border-box;
          background-clip: padding-box, border-box;
          background-image: linear-gradient(#000822, #000822), linear-gradient(135deg, #FF6F32, #FF8C5A, #FFB088);
          box-shadow: 0 8px 16px rgba(255, 111, 50, 0.3);
        }

        .jota-avatar-item:hover .jota-avatar-label {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        /* Texto rotativo com typewriter */
        .rotating-word {
          display: inline;
          color: #FF6B00;
          font-weight: 600;
          min-width: 60px;
        }

        /* Cursor do typewriter */
        .typewriter-cursor {
          display: inline-block;
          width: 2px;
          height: 1em;
          background-color: #FF6B00;
          margin-left: 2px;
          animation: blink 0.7s infinite;
        }

        @keyframes blink {
          0%, 49% {
            opacity: 1;
          }
          50%, 100% {
            opacity: 0;
          }
        }
      `}</style>

      {/* Animação de entrada IMEDIATA + container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0 }} // Sem delay: aparece IMEDIATAMENTE
        className="flex justify-center items-center flex-col"
      >
        {/* Avatar circular de Jota */}
        <div 
          className={`jota-avatar-item ${isHoverActive ? 'is-hover-active' : ''}`}
          style={{ zIndex: 4 }}
        >
          {/* Tooltip label com texto rotativo */}
          <span className="jota-avatar-label">
            O que vamos{" "}
            <span className="rotating-word">
              {displayedText}
              {displayedText.length < currentWord.length && <span className="typewriter-cursor" />}
            </span>
            {displayedText.length === currentWord.length && <span className="typewriter-cursor" />}
          </span>

          {/* Imagem do avatar */}
          <img 
            src="/images/avatar11-sobreposto-pv.webp" 
            alt="Jota - Líder de Equipe" 
            width={60} 
            height={60} 
            loading="eager" 
            decoding="async" 
          />
        </div>
      </motion.div>
    </div>
  );
}

export default JotaAvatar;
