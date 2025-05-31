
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Clock, UserCheck } from 'lucide-react';
import { User, FriendshipStatus, useFriendSystem } from '@/hooks/useFriendSystem';

interface UserSearchCardProps {
  user: User;
  onFriendRequestSent?: () => void;
}

export const UserSearchCard: React.FC<UserSearchCardProps> = ({ user, onFriendRequestSent }) => {
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>('none');
  const [actionLoading, setActionLoading] = useState(false);
  const { getFriendshipStatus, sendFriendRequest, loading } = useFriendSystem();

  useEffect(() => {
    const checkStatus = async () => {
      const status = await getFriendshipStatus(user.id);
      setFriendshipStatus(status);
    };
    checkStatus();
  }, [user.id, getFriendshipStatus]);

  const handleSendRequest = async () => {
    setActionLoading(true);
    const success = await sendFriendRequest(user.id);
    if (success) {
      setFriendshipStatus('pending_sent');
      onFriendRequestSent?.();
    }
    setActionLoading(false);
  };

  const getButtonConfig = () => {
    switch (friendshipStatus) {
      case 'pending_sent':
        return {
          text: 'Solicitado',
          icon: <Clock className="h-4 w-4" />,
          disabled: true,
          variant: 'outline' as const,
          className: 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
        };
      case 'friends':
        return {
          text: 'Amigo',
          icon: <UserCheck className="h-4 w-4" />,
          disabled: true,
          variant: 'outline' as const,
          className: 'border-green-500 text-green-600 dark:text-green-400'
        };
      case 'pending_received':
        return {
          text: 'Responder',
          icon: <Users className="h-4 w-4" />,
          disabled: false,
          variant: 'default' as const,
          className: 'bg-blue-500 hover:bg-blue-600'
        };
      default:
        return {
          text: 'Adicionar',
          icon: <UserPlus className="h-4 w-4" />,
          disabled: false,
          variant: 'default' as const,
          className: 'bg-[#FF6B00] hover:bg-[#FF6B00]/90'
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-[#E0E1DD] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <img
          src={user.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.username}
          alt={user.full_name || user.username}
          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
        />
      </div>

      {/* Informações do usuário */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col">
          <p className="font-medium text-[#29335C] dark:text-white truncate">
            {user.full_name || user.username}
          </p>
          <p className="text-sm text-[#64748B] dark:text-white/60 truncate">
            @{user.username}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-[#64748B] dark:text-white/60">
              {user.followers_count || 0} seguidores
            </span>
            <span className="text-xs text-[#64748B] dark:text-white/60">
              {user.following_count || 0} seguindo
            </span>
          </div>
        </div>
      </div>

      {/* Botão de ação */}
      <div className="flex-shrink-0">
        <Button
          size="sm"
          variant={buttonConfig.variant}
          disabled={buttonConfig.disabled || actionLoading || loading}
          onClick={handleSendRequest}
          className={`${buttonConfig.className} min-w-[100px] h-8`}
        >
          {(actionLoading || loading) ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {buttonConfig.icon}
              <span className="ml-1 text-xs">{buttonConfig.text}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
