
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

interface TurboPersonalidadesPortalProps {
  children: React.ReactNode;
  isOpen: boolean;
  targetRect?: DOMRect | null;
}

const TurboPersonalidadesPortal: React.FC<TurboPersonalidadesPortalProps> = ({ 
  children, 
  isOpen,
  targetRect
}) => {
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  
  useEffect(() => {
    // Remover hosts antigos para evitar duplicação
    const oldHosts = document.querySelectorAll('.portal-host');
    oldHosts.forEach(oldHost => {
      if (oldHost.childNodes.length === 0) {
        document.body.removeChild(oldHost);
      }
    });
    
    // Criar um novo host com z-index extremamente alto
    const host = document.createElement('div');
    host.className = 'portal-host personalidades-master-host';
    host.style.position = 'fixed';
    host.style.zIndex = '9999999'; // Valor extremamente alto
    host.style.top = '0';
    host.style.left = '0';
    host.style.width = '100vw';
    host.style.height = '100vh';
    host.style.pointerEvents = 'none';
    host.style.overflow = 'visible';
    
    // Adicionar ao final do body para garantir que seja o último elemento
    document.body.appendChild(host);
    
    const node = document.createElement('div');
    node.className = 'personalidades-portal';
    node.style.position = 'absolute';
    node.style.zIndex = '9999999'; // Valor extremamente alto
    node.style.pointerEvents = 'auto';
    
    if (targetRect) {
      node.style.top = `${targetRect.bottom + 10}px`;
      node.style.left = `${targetRect.left}px`;
    }
    
    host.appendChild(node);
    setPortalNode(node);
    
    return () => {
      if (node && node.parentNode) {
        node.parentNode.removeChild(node);
      }
      if (host && host.childNodes.length === 0) {
        document.body.removeChild(host);
      }
    };
  }, [targetRect]);
  
  // Não renderiza nada se o portal não estiver pronto ou se não estiver aberto
  if (!portalNode || !isOpen) return null;
  
  return createPortal(
    <motion.div 
      className="personalidades-dropdown-container" 
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.2 }}
      style={{
        zIndex: 9999999, // Valor extremamente alto
        position: 'absolute',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
        backgroundColor: '#1a1f3a',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        pointerEvents: 'auto'
      }}
    >
      {children}
    </motion.div>,
    portalNode
  );
};

export default TurboPersonalidadesPortal;
