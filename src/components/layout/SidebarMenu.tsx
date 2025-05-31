
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  MessageSquare, 
  Calendar, 
  BookOpen, 
  ShoppingCart,
  Trophy,
  Wallet,
  FolderOpen,
  Bell,
  Settings,
  BookPlus,
  Globe,
  Brain
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface SidebarMenuProps {
  isCollapsed: boolean;
  currentPath: string;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isCollapsed, currentPath }) => {
  const { theme } = useTheme();
  const isLightMode = theme === 'light';

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/turmas', icon: Users, label: 'Turmas' },
    { path: '/comunidades', icon: MessageSquare, label: 'Comunidades' },
    { path: '/pedidos-ajuda', icon: MessageSquare, label: 'Pedidos de Ajuda' },
    { path: '/epictus-ia', icon: Brain, label: 'Epictus IA' },
    { path: '/agenda', icon: Calendar, label: 'Agenda' },
    { path: '/biblioteca', icon: BookOpen, label: 'Biblioteca' },
    { path: '/mercado', icon: ShoppingCart, label: 'Mercado' },
    { path: '/conquistas', icon: Trophy, label: 'Conquistas' },
    { path: '/carteira', icon: Wallet, label: 'Carteira' },
    { path: '/organizacao', icon: FolderOpen, label: 'Organização' },
    { path: '/novidades', icon: Bell, label: 'Novidades' },
    { path: '/configuracoes', icon: Settings, label: 'Configurações' },
    { path: '/planos-estudo', icon: BookPlus, label: 'Planos de Estudo' },
    { path: '/portal', icon: Globe, label: 'Portal' },
  ];

  return (
    <nav className="p-4">
      <ul className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#FF6B00] text-white'
                    : isLightMode
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SidebarMenu;
