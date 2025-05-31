
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, FriendshipStatus, useFriendSystem } from '@/hooks/useFriendSystem';
import { UserPlus, Check, Clock, Users } from 'lucide-react';

interface UserSearchCardProps {
  user: User;
  onActionComplete?: () => void;
}

export const UserSearchCard: React.FC<UserSearchCardProps> = ({ user, onActionComplete }) => {
  const [status, setStatus] = useState<FriendshipStatus>('none');
  const [actionLoading, setActionLoading] = useState(false);
  const { getFriendshipStatus, sendFriendRequest, cancelFriendRequest } = useFriendSystem();

  useEffect(() => {
    loadFriendshipStatus();
  }, [user.id]);

  const loadFriendshipStatus = async () => {
    const currentStatus = await getFriendshipStatus(user.id);
    setStatus(currentStatus);
  };

  const handleAddFriend = async () => {
    setActionLoading(true);
    const success = await sendFriendRequest(user.id);
    if (success) {
      setStatus('pending_sent');
      onActionComplete?.();
    }
    setActionLoading(false);
  };

  const handleCancelRequest = async () => {
    setActionLoading(true);
    const success = await cancelFriendRequest(user.id);
    if (success) {
      setStatus('none');
      onActionComplete?.();
    }
    setActionLoading(false);
  };

  const getButtonConfig = () => {
    switch (status) {
      case 'friends':
        return {
          text: 'Amigo',
          icon: <Users className="w-4 h-4" />,
          variant: 'secondary' as const,
          disabled: true,
          onClick: () => {}
        };
      case 'pending_sent':
        return {
          text: 'Solicitado',
          icon: <Clock className="w-4 h-4" />,
          variant: 'outline' as const,
          disabled: false,
          onClick: handleCancelRequest
        };
      case 'pending_received':
        return {
          text: 'Aceitar',
          icon: <Check className="w-4 h-4" />,
          variant: 'default' as const,
          disabled: false,
          onClick: () => {} // Implementar aceitar se necessário
        };
      default:
        return {
          text: 'Adicionar',
          icon: <UserPlus className="w-4 h-4" />,
          variant: 'default' as const,
          disabled: false,
          onClick: handleAddFriend
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <Avatar className="h-12 w-12">
        <AvatarImage src={user.avatar_url} alt={user.full_name} />
        <AvatarFallback>
          {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-col">
          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
            {user.full_name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            @{user.username}
          </p>
          <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{user.followers_count || 0} seguidores</span>
            <span>{user.following_count || 0} seguindo</span>
          </div>
        </div>
      </div>

      <Button
        variant={buttonConfig.variant}
        size="sm"
        className="flex items-center gap-2 min-w-[100px]"
        onClick={buttonConfig.onClick}
        disabled={buttonConfig.disabled || actionLoading}
      >
        {actionLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          buttonConfig.icon
        )}
        {buttonConfig.text}
      </Button>
    </div>
  );
};
