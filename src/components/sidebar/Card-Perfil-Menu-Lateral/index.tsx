
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CardPerfilMenuLateralProps {
  isCollapsed?: boolean;
  userProfile?: any;
  profileImage?: string;
  firstName?: string;
  userName?: string;
  userAccountType?: string;
  isCardFlipped?: boolean;
  isUploading?: boolean;
  fileInputRef?: React.RefObject<HTMLInputElement>;
  onImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CardPerfilMenuLateral({
  isCollapsed = false,
  userProfile,
  profileImage,
  firstName,
  userName,
  userAccountType
}: CardPerfilMenuLateralProps) {
  const { user } = useAuth();

  // Usar dados do userProfile se disponível, senão do useAuth
  const displayName = firstName || userProfile?.display_name || user?.user_metadata?.display_name || 'Usuário';
  const email = userProfile?.email || user?.email || '';
  const avatarUrl = profileImage || userProfile?.avatar_url || user?.user_metadata?.avatar_url || '';

  // Não renderizar nada se estiver colapsado
  if (isCollapsed) {
    return null;
  }

  return (
    <div className="bg-white/95 dark:bg-[#001F3F]/60 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-4 mx-2">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback>
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {displayName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {email}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CardPerfilMenuLateral;
