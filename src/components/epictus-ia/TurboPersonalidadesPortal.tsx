
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
    // Procura por um portal-host existente ou cria um novo
    let host = document.querySelector('.portal-host');
    if (!host) {
      host = document.createElement('div');
      host.className = 'portal-host';
      document.body.appendChild(host);
    }
    
    const node = document.createElement('div');
    node.className = 'personalidades-portal';
    if (targetRect) {
      node.style.position = 'fixed';
      node.style.top = `${targetRect.bottom + 10}px`;
      node.style.left = `${targetRect.left}px`;
    }
    host.appendChild(node);
    setPortalNode(node);
    
    return () => {
      if (node && node.parentNode) {
        node.parentNode.removeChild(node);
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
    >
      {children}
    </motion.div>,
    portalNode
  );
};

export default TurboPersonalidadesPortal;
