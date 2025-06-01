
import React from 'react';
import { User, FriendshipStatus } from '@/types/friendship';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Clock, Users, Check, X, Verified, Crown } from 'lucide-react';

interface UserCardProps {
  user: User;
  friendshipStatus: FriendshipStatus;
  onSendRequest: (userId: string) => void;
  onAcceptRequest: (userId: string) => void;
  onRejectRequest: (userId: string) => void;
  onCancelRequest: (userId: string) => void;
  receivedRequestId?: string;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  friendshipStatus,
  onSendRequest,
  onAcceptRequest,
  onRejectRequest,
  onCancelRequest,
  receivedRequestId
}) => {
  const renderActionButton = () => {
    switch (friendshipStatus) {
      case 'none':
        return (
          <Button
            size="sm"
            onClick={() => onSendRequest(user.id)}
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-4 py-2 font-medium"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Convidar como Parceiro
          </Button>
        );
      
      case 'sent':
        return (
          <Button
            size="sm"
            variant="outline"
            disabled
            className="border-2 border-[#E0E1DD] dark:border-white/20 text-[#64748B] dark:text-white/60 bg-[#F8FAFC] dark:bg-white/5 rounded-xl px-4 py-2 font-medium opacity-75"
          >
            <Clock className="h-4 w-4 mr-2" />
            Convite Enviado
          </Button>
        );
      
      case 'received':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => receivedRequestId && onAcceptRequest(receivedRequestId)}
              className="bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-3 py-2"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => receivedRequestId && onRejectRequest(receivedRequestId)}
              className="border-2 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl px-3 py-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      
      case 'friends':
        return (
          <Button
            size="sm"
            variant="outline"
            disabled
            className="border-2 border-green-300 text-green-600 bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-2 font-medium"
          >
            <Users className="h-4 w-4 mr-2" />
            Parceiro
          </Button>
        );
      
      default:
        return null;
    }
  };

  // Determinar o texto a ser exibido para parcerias
  const partnershipText = user.followers_count === 1 ? '1 Parceria' : `${user.followers_count} Parcerias`;

  return (
    <div className="flex items-center justify-between p-5 border-2 border-[#E0E1DD] dark:border-white/10 rounded-2xl bg-white dark:bg-[#0A2540]/30 hover:border-[#FF6B00]/30 dark:hover:border-[#FF6B00]/30 transition-all duration-300 hover:shadow-lg group">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Avatar className="h-14 w-14 ring-2 ring-[#E0E1DD] dark:ring-white/10 group-hover:ring-[#FF6B00]/30 transition-all duration-300">
            <AvatarImage src={user.avatar_url || ''} alt={user.full_name || user.username || ''} />
            <AvatarFallback className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white text-lg font-bold">
              {(user.full_name || user.username || '?').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* Badge de Verificação/Premium (Preparado para o futuro) */}
          {user.followers_count && user.followers_count > 10 && (
            <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-2 border-white dark:border-[#0A2540] flex items-center justify-center">
              <Crown className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-[#29335C] dark:text-white text-lg truncate">
              {user.full_name || user.display_name || user.username || 'Usuário'}
            </h3>
            {user.followers_count && user.followers_count > 5 && (
              <Verified className="h-4 w-4 text-blue-500 flex-shrink-0" />
            )}
          </div>
          
          <p className="text-[#64748B] dark:text-white/60 text-sm mb-2">
            @{user.username || 'usuario'}
          </p>
          
          <div className="flex items-center space-x-1 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-[#64748B] dark:text-white/60 font-medium">
              {partnershipText}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex-shrink-0 ml-4">
        {renderActionButton()}
      </div>
    </div>
  );
};
