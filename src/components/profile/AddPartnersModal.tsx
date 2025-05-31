
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Users, Clock, X, HandHeart, Verified } from "lucide-react";
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

  // Obter parceiros atuais (amizades aceitas)
  const currentPartners = friendRequests.filter(
    req => (req.receiver_id === currentUserId || req.sender_id === currentUserId) && req.status === 'accepted'
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
      <DialogContent className="sm:max-w-[700px] bg-white dark:bg-[#0A2540] max-h-[85vh] overflow-hidden flex flex-col border-0 shadow-2xl">
        {/* Header Moderno */}
        <DialogHeader className="pb-6 border-b border-[#E0E1DD] dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] shadow-lg">
                <HandHeart className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-[#29335C] dark:text-white">
                  Adicionar Parceiro
                </DialogTitle>
                <p className="text-sm text-[#64748B] dark:text-white/60 mt-1 max-w-md">
                  Conecte-se com outros membros para criar parcerias estratégicas, compartilhar oportunidades e crescer juntos.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full hover:bg-[#E0E1DD] dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col space-y-6 py-6">
          {/* Campo de Busca Destacado */}
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <Search className="h-5 w-5 text-[#64748B] dark:text-white/60" />
              </div>
              <Input
                placeholder="Buscar parceiro pelo nome ou @username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 h-12 text-base border-2 border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] rounded-2xl bg-[#F8FAFC] dark:bg-[#0A2540]/50 transition-all duration-300 shadow-sm focus:shadow-md"
              />
            </div>
          </div>

          {/* Solicitações Pendentes */}
          {pendingReceivedRequests.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
                  Solicitações Recebidas ({pendingReceivedRequests.length})
                </h3>
              </div>
              <div className="space-y-3 max-h-40 overflow-y-auto">
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

          {/* Seus Parceiros Atuais */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
                Seus Parceiros ({currentPartners.length})
              </h3>
            </div>
            {currentPartners.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 max-h-32 overflow-y-auto">
                {currentPartners.map((partnership) => {
                  const partnerId = partnership.sender_id === currentUserId ? partnership.receiver_id : partnership.sender_id;
                  const partnerUser = users.find(u => u.id === partnerId);
                  if (!partnerUser) return null;
                  
                  return (
                    <div key={partnership.id} className="flex items-center justify-between p-3 border border-[#E0E1DD] dark:border-white/10 rounded-xl bg-green-50 dark:bg-green-900/10">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-[#FF6B00] flex items-center justify-center text-white font-medium">
                            {(partnerUser.full_name || partnerUser.username || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white dark:border-[#0A2540] flex items-center justify-center">
                            <Verified className="h-2.5 w-2.5 text-white" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-[#29335C] dark:text-white">
                            {partnerUser.full_name || partnerUser.username || 'Usuário'}
                          </h4>
                          <p className="text-sm text-[#64748B] dark:text-white/60">
                            @{partnerUser.username || 'usuario'}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                        Parceiro
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-[#E0E1DD] dark:border-white/10 rounded-2xl">
                <Users className="h-12 w-12 text-[#64748B] dark:text-white/40 mx-auto mb-3" />
                <p className="text-[#64748B] dark:text-white/60 text-sm">
                  Você ainda não tem parceiros conectados
                </p>
              </div>
            )}
          </div>

          {/* Resultados da Busca */}
          {searchQuery && (
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-[#FF6B00]/10">
                  <Search className="h-4 w-4 text-[#FF6B00]" />
                </div>
                <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
                  Resultados da Busca
                </h3>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {loading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00] mx-auto mb-4"></div>
                    <div className="text-sm text-[#64748B] dark:text-white/60">
                      Buscando parceiros...
                    </div>
                  </div>
                )}
                
                {!loading && searchQuery && users.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="h-16 w-16 text-[#64748B] dark:text-white/40 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-[#29335C] dark:text-white mb-2">
                      Nenhum parceiro encontrado
                    </h4>
                    <p className="text-[#64748B] dark:text-white/60 text-sm max-w-sm mx-auto">
                      Nenhum parceiro encontrado com esse nome. Verifique se digitou corretamente ou explore novos membros para se conectar.
                    </p>
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
          )}

          {/* Estado Inicial - Quando não há busca */}
          {!searchQuery && pendingReceivedRequests.length === 0 && (
            <div className="text-center py-12 flex-1 flex flex-col justify-center">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FF6B00]/10 to-[#FF8C40]/10 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <HandHeart className="h-10 w-10 text-[#FF6B00]" />
              </div>
              <h4 className="text-xl font-semibold text-[#29335C] dark:text-white mb-3">
                Encontre Novos Parceiros
              </h4>
              <p className="text-[#64748B] dark:text-white/60 text-sm max-w-md mx-auto">
                Use o campo de busca acima para encontrar outros membros e começar a construir parcerias estratégicas.
              </p>
            </div>
          )}
        </div>

        {/* Rodapé Preparado para o Futuro */}
        <div className="border-t border-[#E0E1DD] dark:border-white/10 pt-4">
          <div className="text-center">
            <p className="text-xs text-[#64748B] dark:text-white/60">
              💡 Conecte-se estrategicamente para maximizar oportunidades de crescimento
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
