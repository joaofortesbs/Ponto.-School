"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

/**
 * Componente JotaAvatar - Avatar de Jota específico para School Power
 * 
 * Características:
 * - Auto-triggered hover animation ao entrar na página
 * - Hover state fixo enquanto usuário está na seção
 * - Componente independente para modificações isoladas
 * 
 * Comportamento:
 * 1. Ao montar, inicia animação que simula um hover (0.6s)
 * 2. Após animação, mantém hover state FIXO
 * 3. Hover effect permanece enquanto na seção
 */
export function JotaAvatar() {
  const [isHoverActive, setIsHoverActive] = useState(false);

  useEffect(() => {
    // Auto-trigger hover animation ao montar o componente
    const hoverTimer = setTimeout(() => {
      setIsHoverActive(true);
    }, 300); // Delay para sincronizar com animação de entrada do motion.div

    return () => clearTimeout(hoverTimer);
  }, []);

  return (
    <div className="jota-avatar-container">
      <style>{`
        .jota-avatar-container {
          display: flex;
          justify-content: center;
          align-items: center;
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
        }

        /* Estado padrão - sem hover */
        .jota-avatar-item {
          transition: transform 0.2s, z-index 0.2s, opacity 0.2s, border 0.2s;
        }

        /* Estado ATIVO (hover fixo ou hover simulado) */
        .jota-avatar-item.is-hover-active {
          transform: translateY(-4px) scale(1.1);
          z-index: 10 !important;
          border: 3px solid transparent;
          background-origin: border-box;
          background-clip: padding-box, border-box;
          background-image: linear-gradient(#000822, #000822), linear-gradient(135deg, #FF6F32, #FF8C5A, #FFB088);
        }

        /* Tooltip - Label "Jota é o líder de equipe" */
        .jota-avatar-label {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          color: #103a4a;
          padding: 8px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 400;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s ease;
          transform: translateX(-50%) translateY(4px);
          margin-bottom: 8px;
          z-index: 20;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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
        }

        .jota-avatar-item:hover .jota-avatar-label {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      `}</style>

      {/* Animação de entrada + container */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex justify-center items-center"
      >
        {/* Avatar circular de Jota */}
        <div 
          className={`jota-avatar-item ${isHoverActive ? 'is-hover-active' : ''}`}
          style={{ zIndex: 4 }}
        >
          {/* Tooltip label */}
          <span className="jota-avatar-label">
            Jota é o <span style={{ color: '#FF6B00' }}>líder de equipe</span>
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
