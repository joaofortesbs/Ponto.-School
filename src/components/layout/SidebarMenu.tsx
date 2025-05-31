
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Brain, 
  MessageSquare, 
  User, 
  Settings,
  BookOpen,
  Trophy,
  Users
} from 'lucide-react';

interface SidebarMenuProps {
  isCollapsed: boolean;
  currentPath: string;
  className?: string;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isCollapsed, currentPath, className = '' }) => {
  const location = useLocation();

  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/',
      color: 'text-blue-500'
    },
    {
      icon: Brain,
      label: 'Epictus IA',
      path: '/epictus-ia',
      color: 'text-purple-500'
    },
    {
      icon: MessageSquare,
      label: 'Chat',
      path: '/chat',
      color: 'text-green-500'
    },
    {
      icon: BookOpen,
      label: 'Estudos',
      path: '/estudos',
      color: 'text-orange-500'
    },
    {
      icon: Trophy,
      label: 'Conquistas',
      path: '/conquistas',
      color: 'text-yellow-500'
    },
    {
      icon: Users,
      label: 'Comunidade',
      path: '/comunidade',
      color: 'text-cyan-500'
    },
    {
      icon: User,
      label: 'Perfil',
      path: '/profile',
      color: 'text-indigo-500'
    },
    {
      icon: Settings,
      label: 'Configurações',
      path: '/configuracoes',
      color: 'text-gray-500'
    }
  ];

  return (
    <nav className={`p-2 ${className}`}>
      <ul className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon 
                  className={`w-5 h-5 ${isActive ? 'text-orange-600 dark:text-orange-400' : item.color}`} 
                />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
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
