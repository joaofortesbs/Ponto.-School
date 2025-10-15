
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function CardPerfilMenuLateral() {
  const { user } = useAuth();

  return (
    <div className="bg-white/95 dark:bg-[#001F3F]/60 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user?.avatar_url} alt={user?.display_name || 'Usuário'} />
          <AvatarFallback>
            {user?.display_name?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {user?.display_name || 'Usuário'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {user?.email || ''}
          </p>
        </div>
      </div>
    </div>
  );
}
