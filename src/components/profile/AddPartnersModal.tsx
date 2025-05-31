
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Users, Clock } from "lucide-react";
import { useFriendship } from "@/hooks/useFriendship";
import { UserCard } from "./UserCard";
import { supabase } from "@/integrations/supabase/client";

interface AddPartnersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPartnersModal({ isOpen, onClose }: AddPartnersModalProps) {
  const {
    users,
    friendRequests,
    loading,
    searchQuery,
    setSearchQuery,
    getFriendshipStatus,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest
  } = useFriendship();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Obter solicitações recebidas pendentes
  const pendingReceivedRequests = friendRequests.filter(
    req => req.receiver_id === currentUserId && req.status === 'pending'
  );

  const handleSendRequest = async (userId: string) => {
    await sendFriendRequest(userId);
  };

  const handleAcceptRequest = async (requestId: string) => {
    await acceptFriendRequest(requestId);
  };

  const handleRejectRequest = async (requestId: string) => {
    await rejectFriendRequest(requestId);
  };

  const handleCancelRequest = async (userId: string) => {
    await cancelFriendRequest(userId);
  };

  const getReceivedRequestId = (userId: string) => {
    const request = friendRequests.find(
      req => req.sender_id === userId && req.receiver_id === currentUserId && req.status === 'pending'
    );
    return request?.id;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#0A2540] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#29335C] dark:text-white flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#FF6B00]" />
            Adicionar Parceiros
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4 flex-1 overflow-hidden">
          {/* Campo de busca */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#29335C] dark:text-white">
              Buscar usuários
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Digite o nome ou username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00]"
              />
            </div>
          </div>

          {/* Solicitações recebidas pendentes */}
          {pendingReceivedRequests.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-[#29335C] dark:text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#FF6B00]" />
                Solicitações Recebidas ({pendingReceivedRequests.length})
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {pendingReceivedRequests.map((request) => {
                  const senderUser = users.find(u => u.id === request.sender_id);
                  if (!senderUser) return null;
                  
                  return (
                    <UserCard
                      key={request.id}
                      user={senderUser}
                      friendshipStatus="received"
                      onSendRequest={handleSendRequest}
                      onAcceptRequest={handleAcceptRequest}
                      onRejectRequest={handleRejectRequest}
                      onCancelRequest={handleCancelRequest}
                      receivedRequestId={request.id}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Resultados da busca */}
          <div className="space-y-2 flex-1">
            {searchQuery && (
              <h3 className="text-sm font-medium text-[#29335C] dark:text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-[#FF6B00]" />
                Resultados da Busca
              </h3>
            )}
            
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {loading && (
                <div className="text-center py-4">
                  <div className="text-sm text-[#64748B] dark:text-white/60">
                    Buscando usuários...
                  </div>
                </div>
              )}
              
              {!loading && searchQuery && users.length === 0 && (
                <div className="text-center py-4">
                  <div className="text-sm text-[#64748B] dark:text-white/60">
                    Nenhum usuário encontrado
                  </div>
                </div>
              )}
              
              {!loading && users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  friendshipStatus={getFriendshipStatus(user.id)}
                  onSendRequest={handleSendRequest}
                  onAcceptRequest={handleAcceptRequest}
                  onRejectRequest={handleRejectRequest}
                  onCancelRequest={handleCancelRequest}
                  receivedRequestId={getReceivedRequestId(user.id)}
                />
              ))}
            </div>
          </div>
          
          {/* Botões do modal */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[#E0E1DD] dark:border-white/10">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
