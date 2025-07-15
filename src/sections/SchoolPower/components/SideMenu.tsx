
"use client";
import React, { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";

// Função utilitária cn (clsx + tailwind-merge)
const cn = (...classes: any[]) => {
  return classes.filter(Boolean).join(" ");
};

// Ícones para o FloatingDock
const HistoryIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);

const SuggestionsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 1l3.5 8.5L24 12l-8.5 3.5L12 24l-3.5-8.5L0 12l8.5-3.5L12 1z" />
  </svg>
);

const NotificationsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const SettingsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const MenuIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

// Componentes do FloatingDock
const FloatingDock = ({ items, desktopClassName, mobileClassName }: any) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({ items, className }: any) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
          >
            {items.map((item: any, idx: number) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    delay: idx * 0.05,
                  },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <a
                  href={item.href}
                  key={item.title}
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #E9AB6C",
                  }}
                >
                  <div className="h-4 w-4" style={{ color: "#f97316" }}>
                    {item.icon}
                  </div>
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #E9AB6C",
        }}
      >
        <MenuIcon style={{ color: "#f97316" }} />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({ items, className }: any) => {
  let mouseY = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseY.set(e.pageY)}
      onMouseLeave={() => mouseY.set(Infinity)}
      className={cn(
        "mx-auto flex flex-col items-center gap-4 rounded-2xl px-3 py-4 border",
        className,
      )}
      style={{
        background: "linear-gradient(to bottom, #f97316, #E9AB6C)",
        borderColor: "#E9AB6C",
      }}
    >
      {items.map((item: any) => (
        <IconContainer mouseY={mouseY} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({ mouseY, title, icon, href }: any) {
  let ref = useRef<HTMLDivElement>(null);

  let distance = useTransform(mouseY, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };

    return val - bounds.y - bounds.height / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  let heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20],
  );

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <a href={href}>
      <motion.div
        ref={ref}
        style={{
          width,
          height,
          backgroundColor: "#ffffff",
          border: "1px solid #E9AB6C",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full transition-colors"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: -10, y: "-50%" }}
              animate={{ opacity: 1, x: 0, y: "-50%" }}
              exit={{ opacity: 0, x: -2, y: "-50%" }}
              className="absolute top-1/2 rounded-md border px-2 py-0.5 text-xs whitespace-nowrap"
              style={{
                backgroundColor: "#ffffff",
                borderColor: "#E9AB6C",
                color: "#f97316",
                right: "calc(100% + 12px)",
                transform: "translateY(-50%)",
              }}
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{
            width: widthIcon,
            height: heightIcon,
            color: "#f97316",
          }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </a>
  );
}

// Dados para o dock
const dockItems = [
  {
    title: "Histórico",
    icon: <HistoryIcon />,
    href: "#",
  },
  {
    title: "Sugestões",
    icon: <SuggestionsIcon />,
    href: "#",
  },
  {
    title: "Notificações",
    icon: <NotificationsIcon />,
    href: "#",
  },
  {
    title: "Configurações",
    icon: <SettingsIcon />,
    href: "#",
  },
];

interface SideMenuProps {
  className?: string;
}

const SideMenu: React.FC<SideMenuProps> = ({ className }) => {
  return (
    <div className={cn("z-40", className)}>
      <FloatingDock
        items={dockItems}
        desktopClassName="shadow-xl flex-col h-auto w-16 py-4"
      />
    </div>
  );
};

export default SideMenu;
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  Home, 
  BookOpen, 
  Users, 
  Calendar, 
  Settings, 
  HelpCircle, 
  ChevronRight,
  X
} from 'lucide-react';

interface SideMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
  { id: 'biblioteca', label: 'Biblioteca', icon: BookOpen, href: '/biblioteca' },
  { id: 'turmas', label: 'Turmas', icon: Users, href: '/turmas' },
  { id: 'agenda', label: 'Agenda', icon: Calendar, href: '/agenda' },
  { id: 'configuracoes', label: 'Configurações', icon: Settings, href: '/configuracoes' },
  { id: 'ajuda', label: 'Ajuda', icon: HelpCircle, href: '/ajuda' },
];

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onToggle }) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <>
      {/* Menu Button */}
      <motion.button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Menu className="w-5 h-5" />
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Side Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl border-r border-white/20 shadow-2xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PS</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">School Power</h2>
              </div>
              <button
                onClick={onToggle}
                className="p-2 rounded-lg hover:bg-gray-100/50 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-2">
              {menuItems.map((item) => (
                <motion.a
                  key={item.id}
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 group"
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  whileHover={{ x: 4 }}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium flex-1">{item.label}</span>
                  <ChevronRight 
                    className={`w-4 h-4 transition-transform duration-200 ${
                      hoveredItem === item.id ? 'translate-x-1' : ''
                    }`} 
                  />
                </motion.a>
              ))}
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 left-4 right-4">
              <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                <h3 className="font-semibold text-orange-800 mb-1">School Power</h3>
                <p className="text-xs text-orange-600">
                  Potencialize seus estudos com IA
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SideMenu;
