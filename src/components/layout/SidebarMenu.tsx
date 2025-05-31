
import React from 'react';
import { Home, Calendar, Users, BookOpen, Brain, Settings } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface SidebarMenuProps {
  isCollapsed: boolean;
  currentPath: string;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isCollapsed, currentPath }) => {
  const { theme } = useTheme();
  const isLightMode = theme === 'light';

  const menuItems = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: Calendar, label: 'Agenda', path: '/agenda' },
    { icon: Users, label: 'Turmas', path: '/turmas' },
    { icon: BookOpen, label: 'Biblioteca', path: '/biblioteca' },
    { icon: Brain, label: 'Epictus IA', path: '/epictus-ia' },
    { icon: Settings, label: 'Configurações', path: '/configuracoes' },
  ];

  return (
    <nav className="px-2 py-4">
      <ul className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          
          return (
            <li key={item.path}>
              <a
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? isLightMode
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-orange-500/20 text-orange-400'
                    : isLightMode
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SidebarMenu;
