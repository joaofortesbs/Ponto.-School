
import React from 'react';
import { User, FriendshipStatus } from '@/types/friendship';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Clock, Users, Check, X } from 'lucide-react';

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
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        );
      
      case 'sent':
        return (
          <Button
            size="sm"
            variant="outline"
            disabled
            className="border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60"
          >
            <Clock className="h-4 w-4 mr-1" />
            Solicitado
          </Button>
        );
      
      case 'received':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => receivedRequestId && onAcceptRequest(receivedRequestId)}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => receivedRequestId && onRejectRequest(receivedRequestId)}
              className="border-red-300 text-red-600 hover:bg-red-50"
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
            className="border-green-300 text-green-600 bg-green-50"
          >
            <Users className="h-4 w-4 mr-1" />
            Amigo
          </Button>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border border-[#E0E1DD] dark:border-white/10 rounded-lg bg-white dark:bg-[#0A2540]/50">
      <div className="flex items-center space-x-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.avatar_url || ''} alt={user.full_name || user.username || ''} />
          <AvatarFallback className="bg-[#FF6B00] text-white">
            {(user.full_name || user.username || '?').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="font-medium text-[#29335C] dark:text-white">
            {user.full_name || user.display_name || user.username || 'Usuário'}
          </h3>
          <p className="text-sm text-[#64748B] dark:text-white/60">
            @{user.username || 'usuario'}
          </p>
          <div className="flex space-x-4 text-xs text-[#64748B] dark:text-white/60">
            <span>{user.followers_count || 0} seguidores</span>
            <span>{user.following_count || 0} seguindo</span>
          </div>
        </div>
      </div>
      
      {renderActionButton()}
    </div>
  );
};
