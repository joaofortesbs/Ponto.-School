
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Search, Users, Clock, X, HandHeart, Verified, RefreshCw, UserX, ChevronDown } from "lucide-react";
import { useFriendship } from "@/hooks/useFriendship";
import { UserCard } from "./UserCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AddPartnersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPartnersModal({ isOpen, onClose }: AddPartnersModalProps) {
  const { toast } = useToast();
  const {
    users,
    friendRequests,
    loading,
    searchQuery,
    setSearchQuery,
    currentUserId,
    getFriendshipStatus,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    getPendingReceivedRequests,
    getCurrentPartners,
    getReceivedRequestId
  } = useFriendship();

  const [partnerUsers, setPartnerUsers] = useState<any[]>([]);
  const [requestSenderUsers, setRequestSenderUsers] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("Parceiro");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [actionType, setActionType] = useState<'move-to-ex' | 'restore'>('move-to-ex');

  // Carregar dados dos usuários parceiros e remetentes de solicitações
  useEffect(() => {
    const loadUsersData = async () => {
      const partners = getCurrentPartners();
      const pendingRequests = getPendingReceivedRequests();

      // Buscar dados dos parceiros com categoria
      if (partners.length > 0) {
        const partnerIds = partners.map(p => 
          p.sender_id === currentUserId ? p.receiver_id : p.sender_id
        );
        
        const { data: partnersData } = await supabase
          .from('profiles')
          .select('id, full_name, display_name, avatar_url')
          .in('id', partnerIds);

        if (partnersData) {
          const partnersWithCategory = partnersData.map(profile => {
            const partnership = partners.find(p => 
              p.sender_id === profile.id || p.receiver_id === profile.id
            );
            return {
              id: profile.id,
              username: profile.display_name || profile.full_name?.split(' ')[0] || 'usuario',
              full_name: profile.full_name,
              display_name: profile.display_name,
              avatar_url: profile.avatar_url,
              followers_count: Math.floor(Math.random() * 100),
              following_count: Math.floor(Math.random() * 50),
              categoria: partnership?.categoria || 'Parceiro'
            };
          });
          setPartnerUsers(partnersWithCategory);
        }
      }

      // Buscar dados dos remetentes de solicitações
      if (pendingRequests.length > 0) {
        const senderIds = pendingRequests.map(req => req.sender_id);
        
        const { data: sendersData } = await supabase
          .from('profiles')
          .select('id, full_name, display_name, avatar_url')
          .in('id', senderIds);

        if (sendersData) {
          setRequestSenderUsers(sendersData.map(profile => ({
            id: profile.id,
            username: profile.display_name || profile.full_name?.split(' ')[0] || 'usuario',
            full_name: profile.full_name,
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            followers_count: Math.floor(Math.random() * 100),
            following_count: Math.floor(Math.random() * 50)
          })));
        }
      }
    };

    if (isOpen) {
      loadUsersData();
    }
  }, [isOpen, friendRequests, currentUserId]);

  const handleSendRequest = async (userId: string) => {
    await sendFriendRequest(userId);
  };

  const handleAcceptRequest = async (requestId: string) => {
    await acceptFriendRequest(requestId);
    document.dispatchEvent(new CustomEvent('partnersUpdated'));
  };

  const handleRejectRequest = async (requestId: string) => {
    await rejectFriendRequest(requestId);
  };

  const handleCancelRequest = async (userId: string) => {
    await cancelFriendRequest(userId);
  };

  const handleCategoryChange = async (partnerId: string, newCategory: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ categoria: newCategory })
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${currentUserId})`)
        .eq('status', 'accepted');

      if (error) {
        console.error('Erro ao alterar categoria:', error);
        toast({
          title: "Erro",
          description: "Erro ao alterar categoria. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      // Atualizar a lista local
      setPartnerUsers(prev => 
        prev.map(user => 
          user.id === partnerId 
            ? { ...user, categoria: newCategory }
            : user
        )
      );

      toast({
        title: "Sucesso",
        description: `Categoria alterada com sucesso!`,
        variant: "default"
      });

      document.dispatchEvent(new CustomEvent('partnersUpdated'));
    } catch (error) {
      console.error('Erro ao alterar categoria:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao alterar categoria.",
        variant: "destructive"
      });
    }
  };

  const openConfirmModal = (partner: any, action: 'move-to-ex' | 'restore') => {
    setSelectedPartner(partner);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const confirmCategoryChange = () => {
    if (selectedPartner) {
      const newCategory = actionType === 'move-to-ex' ? 'Ex-Parceiro' : 'Parceiro';
      handleCategoryChange(selectedPartner.id, newCategory);
    }
    setShowConfirmModal(false);
    setSelectedPartner(null);
  };

  const pendingReceivedRequests = getPendingReceivedRequests();
  const filteredPartners = partnerUsers.filter(user => user.categoria === categoryFilter);

  return (
    <>
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
                  {requestSenderUsers.map((user) => {
                    const request = pendingReceivedRequests.find(req => req.sender_id === user.id);
                    if (!request) return null;
                    
                    return (
                      <UserCard
                        key={user.id}
                        user={user}
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

            {/* Seus Parceiros com Filtro de Categoria */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
                    Seus Parceiros ({partnerUsers.length})
                  </h3>
                </div>
                
                {/* Filtro de Categoria */}
                {partnerUsers.length > 0 && (
                  <div className="w-48">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="border-2 border-[#E0E1DD] dark:border-white/10 rounded-xl bg-white dark:bg-[#0A2540] text-[#29335C] dark:text-white focus:border-[#FF6B00]">
                        <SelectValue />
                        <ChevronDown className="h-4 w-4 text-[#64748B] dark:text-white/60" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Parceiro">Parceiros</SelectItem>
                        <SelectItem value="Ex-Parceiro">Ex-Parceiros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {filteredPartners.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                  {filteredPartners.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border-2 border-[#E0E1DD] dark:border-white/10 rounded-2xl bg-white dark:bg-[#0A2540]/30 hover:border-[#FF6B00]/30 transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] flex items-center justify-center text-white font-medium text-lg">
                            {(user.full_name || user.username || '?').charAt(0).toUpperCase()}
                          </div>
                          {user.followers_count && user.followers_count > 50 && (
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white dark:border-[#0A2540] flex items-center justify-center">
                              <Verified className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#29335C] dark:text-white">
                            {user.full_name || user.username || 'Usuário'}
                          </h4>
                          <p className="text-sm text-[#64748B] dark:text-white/60">
                            @{user.username || 'usuario'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`text-xs font-medium px-3 py-1 rounded-full ${
                          user.categoria === 'Parceiro' 
                            ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
                            : 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30'
                        }`}>
                          {user.categoria}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openConfirmModal(user, user.categoria === 'Parceiro' ? 'move-to-ex' : 'restore')}
                          className={`h-8 px-3 text-xs font-medium rounded-xl transition-all duration-300 ${
                            user.categoria === 'Parceiro'
                              ? 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
                              : 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                        >
                          {user.categoria === 'Parceiro' ? (
                            <>
                              <UserX className="h-3 w-3 mr-1" />
                              Mover para Ex-Parceiro
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Restaurar como Parceiro
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-[#E0E1DD] dark:border-white/10 rounded-2xl">
                  <Users className="h-12 w-12 text-[#64748B] dark:text-white/40 mx-auto mb-3" />
                  <p className="text-[#64748B] dark:text-white/60 text-sm">
                    {categoryFilter === 'Parceiro' 
                      ? 'Você ainda não tem parceiros conectados'
                      : 'Você não tem ex-parceiros'
                    }
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

            {/* Estado Inicial */}
            {!searchQuery && pendingReceivedRequests.length === 0 && partnerUsers.length === 0 && (
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

          {/* Rodapé */}
          <div className="border-t border-[#E0E1DD] dark:border-white/10 pt-4">
            <div className="text-center">
              <p className="text-xs text-[#64748B] dark:text-white/60">
                💡 Conecte-se estrategicamente para maximizar oportunidades de crescimento
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação */}
      {showConfirmModal && selectedPartner && (
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-[#0A2540] border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#29335C] dark:text-white text-center">
                Confirmar Alteração
              </DialogTitle>
            </DialogHeader>
            <div className="py-6">
              <p className="text-center text-[#64748B] dark:text-white/80">
                {actionType === 'move-to-ex' 
                  ? `Tem certeza que deseja mover ${selectedPartner.full_name || selectedPartner.username} para Ex-Parceiros? Você pode restaurá-lo depois.`
                  : `Tem certeza que deseja restaurar ${selectedPartner.full_name || selectedPartner.username} como Parceiro?`
                }
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                className="border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmCategoryChange}
                className={actionType === 'move-to-ex' 
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
                }
              >
                Confirmar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
