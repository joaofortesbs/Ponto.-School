"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface SidebarNavProps {
  isOpen: boolean;
  onToggle: () => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('painel');

  // Mapeamento das seções antigas para as novas
  const navigationItems = [
    {
      id: 'painel',
      title: 'Painel',
      icon: 'fas fa-home',
      path: '/',
      hasInterface: true
    },
    {
      id: 'turmas',
      title: 'Minhas Turmas',
      icon: 'fas fa-user-graduate',
      path: '/turmas',
      hasInterface: true
    },
    {
      id: 'comunidades',
      title: 'Comunidades',
      icon: 'fas fa-users',
      path: '/comunidades',
      hasInterface: true
    },
    {
      id: 'trilhas',
      title: 'Trilhas School',
      icon: 'fas fa-route',
      path: '/portal', // Mapeando para portal existente
      hasInterface: true
    },
    {
      id: 'assistente',
      title: 'School Planner',
      icon: 'fas fa-project-diagram',
      path: '/agenda', // Mapeando para agenda existente
      hasInterface: true
    },
    {
      id: 'epictus',
      title: 'Epictus IA',
      icon: 'fas fa-brain',
      path: '/epictus-ia',
      hasInterface: true
    },
    {
      id: 'agenda',
      title: 'Agenda',
      icon: 'fas fa-calendar-alt',
      path: '/agenda',
      hasInterface: true
    },
    {
      id: 'conquistas',
      title: 'Conquistas',
      icon: 'fas fa-trophy',
      path: '/conquistas',
      hasInterface: true
    },
    {
      id: 'explorar',
      title: 'Explorar',
      icon: 'fas fa-compass',
      path: '/carteira', // Mapeando para carteira existente
      hasInterface: true
    }
  ];

  useEffect(() => {
    // Determinar seção ativa baseada na rota atual
    const currentPath = location.pathname;
    const currentItem = navigationItems.find(item => item.path === currentPath);
    if (currentItem) {
      setActiveSection(currentItem.id);
    }
  }, [location.pathname]);

  const handleNavigation = (item: any) => {
    if (item.hasInterface) {
      setActiveSection(item.id);
      navigate(item.path);
    }
    // Se não tem interface, não faz nada por enquanto
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="navigation-menu"
      style={{
        position: 'fixed',
        top: '50%',
        left: '32px',
        transform: 'translateY(-50%)',
        width: '380px',
        background: 'transparent',
        borderRadius: '24px',
        overflow: 'hidden',
        zIndex: 1000
      }}
    >
      <nav className="menu-navigation" style={{ padding: '16px 0' }}>
        {navigationItems.map((item) => (
          <div
            key={item.id}
            className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => handleNavigation(item)}
            style={{
              margin: '0 16px 4px',
              borderRadius: '16px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: item.hasInterface ? 'pointer' : 'default',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '72px',
              height: '72px',
              background: activeSection === item.id 
                ? 'linear-gradient(135deg, rgba(255, 107, 0, 0.15), rgba(255, 107, 0, 0.15))'
                : 'transparent',
              border: activeSection === item.id 
                ? '1px solid rgba(255, 107, 0, 0.3)'
                : '1px solid transparent',
              boxShadow: activeSection === item.id 
                ? '0 4px 12px rgba(255, 107, 0, 0.1)'
                : 'none'
            }}
            onMouseEnter={(e) => {
              if (activeSection !== item.id && item.hasInterface) {
                e.currentTarget.style.transform = 'translateX(6px)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 107, 0, 0.08), rgba(255, 107, 0, 0.08))';
              }
            }}
            onMouseLeave={(e) => {
              if (activeSection !== item.id) {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <div className="item-content" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              gap: '14px',
              position: 'relative',
              height: '100%',
              minHeight: '72px',
              boxSizing: 'border-box'
            }}>
              <div 
                className={`icon-container ${activeSection === item.id ? 'active' : ''}`}
                style={{
                  width: '40px',
                  height: '40px',
                  minWidth: '40px',
                  minHeight: '40px',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: activeSection === item.id 
                    ? 'linear-gradient(135deg, #FF6B00, #FF6B00)'
                    : 'rgba(255, 107, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  flexShrink: 0,
                  boxShadow: activeSection === item.id 
                    ? '0 8px 16px rgba(255, 107, 0, 0.3)'
                    : 'none'
                }}
              >
                <i 
                  className={item.icon}
                  style={{
                    fontSize: '16px',
                    color: activeSection === item.id ? 'white' : '#FF6B00',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    zIndex: 1
                  }}
                />
                <div 
                  className="icon-glow"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '24px',
                    height: '24px',
                    background: 'radial-gradient(circle, rgba(255, 107, 0, 0.5), transparent)',
                    borderRadius: '50%',
                    transform: activeSection === item.id 
                      ? 'translate(-50%, -50%) scale(2.5)'
                      : 'translate(-50%, -50%) scale(0)',
                    transition: 'transform 0.3s ease'
                  }}
                />
              </div>

              <div className="item-text" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                minHeight: '40px',
                justifyContent: 'center'
              }}>
                <span 
                  className="item-title"
                  style={{
                    fontSize: '16px',
                    fontWeight: activeSection === item.id ? 700 : 600,
                    color: activeSection === item.id ? '#FF6B00' : '#1a202c',
                    transition: 'color 0.3s ease',
                    lineHeight: '1.2',
                    margin: 0
                  }}
                >
                  {item.title}
                </span>
              </div>

              {activeSection === item.id && (
                <div 
                  className="item-indicator"
                  style={{
                    width: '8px',
                    height: '8px',
                    minWidth: '8px',
                    minHeight: '8px',
                    borderRadius: '50%',
                    background: '#FF6B00',
                    flexShrink: 0,
                    boxShadow: '0 0 8px rgba(255, 107, 0, 0.6)'
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </nav>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

        .navigation-menu * {
          font-family: 'Inter', sans-serif !important;
        }

        .menu-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 107, 0, 0.1), transparent);
          transition: left 0.6s;
        }

        .menu-item:hover::before {
          left: 100%;
        }

        .menu-item:hover:not(.active) .icon-container {
          background: linear-gradient(135deg, rgba(255, 107, 0, 0.2), rgba(255, 107, 0, 0.2)) !important;
          transform: scale(1.08);
        }

        .menu-item:hover:not(.active) .icon-container i {
          color: #FF6B00 !important;
        }

        .menu-item:hover:not(.active) .item-title {
          color: #FF6B00 !important;
        }

        @keyframes orangeBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @media (max-width: 768px) {
          .navigation-menu {
            position: relative !important;
            top: auto !important;
            left: auto !important;
            transform: none !important;
            margin: 20px auto;
            width: 90% !important;
            max-width: 380px;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default SidebarNav;