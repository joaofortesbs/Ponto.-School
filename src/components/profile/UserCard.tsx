
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Check, X, Clock } from 'lucide-react';
import { FriendshipStatus } from '@/types/friendship';

interface User {
  id: string;
  username: string;
  full_name: string;
  display_name: string;
  avatar_url: string;
  followers_count: number;
  following_count: number;
}

interface UserCardProps {
  user: User;
  friendshipStatus: FriendshipStatus;
  onSendRequest: (userId: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
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
  const getButtonConfig = () => {
    switch (friendshipStatus) {
      case 'friends':
        return {
          text: 'Parceiro',
          icon: <Check className="h-4 w-4" />,
          className: 'bg-green-600 hover:bg-green-700 text-white',
          onClick: () => {}
        };
      case 'sent':
        return {
          text: 'Cancelar',
          icon: <X className="h-4 w-4" />,
          className: 'bg-gray-500 hover:bg-gray-600 text-white',
          onClick: () => onCancelRequest(user.id)
        };
      case 'received':
        return {
          text: 'Aceitar',
          icon: <Check className="h-4 w-4" />,
          className: 'bg-blue-600 hover:bg-blue-700 text-white',
          onClick: () => receivedRequestId && onAcceptRequest(receivedRequestId)
        };
      default:
        return {
          text: 'Convidar',
          icon: <UserPlus className="h-4 w-4" />,
          className: 'bg-[#FF6B00] hover:bg-[#FF8C40] text-white',
          onClick: () => onSendRequest(user.id)
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="flex items-center justify-between p-4 border border-[#E0E1DD] dark:border-white/10 rounded-xl bg-white dark:bg-[#0A2540]/50 hover:shadow-md transition-all duration-300">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] flex items-center justify-center text-white font-medium text-lg">
            {(user.full_name || user.username || '?').charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-[#29335C] dark:text-white text-base">
            {user.full_name || user.username || 'Usuário'}
          </h4>
          <p className="text-sm text-[#64748B] dark:text-white/60">
            @{user.username || 'usuario'}
          </p>
          <p className="text-xs text-[#6B7280] dark:text-white/50 mt-1">
            {user.followers_count} {user.followers_count === 1 ? 'Parceria' : 'Parcerias'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {friendshipStatus === 'received' && receivedRequestId && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRejectRequest(receivedRequestId)}
            className="h-8 w-8 p-0 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button
          size="sm"
          onClick={buttonConfig.onClick}
          className={`${buttonConfig.className} h-8 px-3 text-xs font-medium transition-colors`}
          disabled={friendshipStatus === 'friends'}
        >
          {buttonConfig.icon}
          <span className="ml-1">{buttonConfig.text}</span>
        </Button>
      </div>
    </div>
  );
};
