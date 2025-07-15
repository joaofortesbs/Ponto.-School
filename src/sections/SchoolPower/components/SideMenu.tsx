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