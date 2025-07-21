
import React, { useState } from 'react';

interface TrilhasBadgeProps {
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const TrilhasBadge: React.FC<TrilhasBadgeProps> = ({ className = '', onClick }) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const iconElement = e.currentTarget.querySelector('.trilhas-icon');
    const iconContainer = e.currentTarget.querySelector('.trilhas-icon-container');
    
    if (iconElement && iconContainer) {
      // Criar onda de choque
      const shockWave = document.createElement('div');
      shockWave.classList.add('trilhas-shock-wave');
      iconContainer.appendChild(shockWave);
      
      // Adicionar animação de explosão ao ícone
      iconElement.classList.add('trilhas-icon-explode');
      
      // Alternar o ícone instantaneamente no pico da explosão
      setTimeout(() => {
        setIsSelected(!isSelected);
      }, 150);
      
      // Limpar animações
      setTimeout(() => {
        iconElement.classList.remove('trilhas-icon-explode');
        if (shockWave.parentNode) {
          shockWave.parentNode.removeChild(shockWave);
        }
      }, 600);
    }

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <>
      <style>{`
        .trilhas-component-container {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 2px solid #22C55E;
          border-radius: 30px;
          background: rgba(34, 197, 94, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
        }

        .trilhas-component-container:hover {
          transform: scale(1.02);
          background: rgba(34, 197, 94, 0.15);
          border-color: #16A34A;
        }

        .trilhas-icon-container {
          width: 24px !important;
          height: 24px !important;
          min-width: 24px !important;
          min-height: 24px !important;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          transition: all 0.3s ease;
          position: relative;
          flex-shrink: 0 !important;
        }

        .trilhas-icon-container i {
          font-size: 16px;
          color: #16A34A !important;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .trilhas-component-text {
          font-size: 12px;
          font-weight: 700;
          color: #16A34A;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .trilhas-component-container:hover .trilhas-component-text {
          color: #15803D;
        }

        .trilhas-component-container:hover .trilhas-icon-container i {
          color: #15803D !important;
        }

        .icon-glow {
          display: none;
        }

        /* Animação de explosão */
        .trilhas-icon-explode {
          animation: trilhasIconExplode 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        @keyframes trilhasIconExplode {
          0% {
            transform: scale(1);
          }
          30% {
            transform: scale(1.1);
          }
          60% {
            transform: scale(0.98);
          }
          100% {
            transform: scale(1);
          }
        }

        /* Onda de choque */
        .trilhas-shock-wave {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 24px;
          height: 24px;
          border: 2px solid rgba(34, 197, 94, 0.6);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: trilhasShockWave 0.6s ease-out;
          pointer-events: none;
          z-index: 0;
        }

        @keyframes trilhasShockWave {
          0% {
            width: 24px;
            height: 24px;
            opacity: 1;
            border-width: 2px;
          }
          100% {
            width: 40px;
            height: 40px;
            opacity: 0;
            border-width: 1px;
          }
        }

        /* Animação de entrada */
        .trilhas-component-container {
          animation: trilhasFadeInScale 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes trilhasFadeInScale {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
      
      <div 
        className={`trilhas-component-container ${className}`}
        onClick={handleClick}
      >
        <div className="trilhas-icon-container">
          <i className={`fas ${isSelected ? 'fa-check' : 'fa-route'} trilhas-icon`}></i>
          <div className="icon-glow"></div>
        </div>
        <span className="trilhas-component-text">Trilhas</span>
      </div>
    </>
  );
};

export default TrilhasBadge;
