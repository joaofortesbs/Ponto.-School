import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'; // Assuming a UI library like Radix UI or similar

interface SidebarNavProps {
  isCollapsed: boolean;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ isCollapsed, username, displayName, avatarUrl }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Sidebar content such as navigation items would go here */}
      <nav className="flex-1 p-3">
        {/* Example navigation item */}
        <a href="#" className="block p-2 rounded hover:bg-gray-700/50 text-white">
          Dashboard
        </a>
      </nav>

      {/* Seção de Perfil do Usuário */}
      <div className="mt-auto p-3">
        {!isCollapsed ? (
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatarUrl || ""} alt="User" />
                <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
                  {username ? username.slice(0, 2).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {displayName || username || 'Usuário'}
                </p>
                <p className="text-xs text-gray-300 truncate">
                  Olá, como você está?
                </p>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-300">Progresso</span>
                <span className="text-xs text-gray-300">75%</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: '75%' }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl || ""} alt="User" />
              <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
                {username ? username.slice(0, 2).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="w-full">
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: '75%' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarNav;