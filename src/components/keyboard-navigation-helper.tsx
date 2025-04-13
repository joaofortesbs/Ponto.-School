
import React, { useEffect } from 'react';

export function KeyboardNavigationHelper() {
  useEffect(() => {
    // Adiciona classe ao corpo quando o usuário começa a navegar com teclado
    const handleFirstTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
        
        // Remove o evento após detectar o primeiro tab
        window.removeEventListener('keydown', handleFirstTab);
        
        // Adiciona evento para detectar uso do mouse
        window.addEventListener('mousedown', handleMouseDownOnce);
      }
    };
    
    // Remove a classe quando o usuário usa o mouse
    const handleMouseDownOnce = () => {
      document.body.classList.remove('user-is-tabbing');
      
      // Remove evento do mouse e restaura a detecção de teclado
      window.removeEventListener('mousedown', handleMouseDownOnce);
      window.addEventListener('keydown', handleFirstTab);
    };
    
    // Inicializa monitoramento da navegação por teclado
    window.addEventListener('keydown', handleFirstTab);
    
    return () => {
      window.removeEventListener('keydown', handleFirstTab);
      window.removeEventListener('mousedown', handleMouseDownOnce);
    };
  }, []);
  
  // Adiciona estilos para destacar o foco apenas quando navegando por teclado
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      body:not(.user-is-tabbing) :focus:not(.force-focus) {
        outline: none !important;
        box-shadow: none !important;
      }
      
      body.user-is-tabbing :focus {
        outline: 3px solid #1a73e8 !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.4) !important;
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return null; // Componente não renderiza nada visualmente
}
