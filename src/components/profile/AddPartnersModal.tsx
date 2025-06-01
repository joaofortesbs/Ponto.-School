import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Search, Users, Clock, X, HandHeart, Verified, RefreshCw, AlertTriangle, ChevronDown } from "lucide-react";
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
    currentUserId,
    getFriendshipStatus,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    updatePartnershipCategory,
    getPendingReceivedRequests,
    getPartnersByCategory,
    getPartnerCategory,
    getReceivedRequestId,
    loadFriendRequests
  } = useFriendship();

  const [partnerUsers, setPartnerUsers] = useState<any[]>([]);
  const [requestSenderUsers, setRequestSenderUsers] = useState<any[]>([]);
  const [showCategoryConfirm, setShowCategoryConfirm] = useState<{userId: string, newCategory: 'Parceiro' | 'Ex-Parceiro'} | null>(null);
  const [updatingCategory, setUpdatingCategory] = useState<string | null>(null);
  const [categoryMessage, setCategoryMessage] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<'Parceiro' | 'Ex-Parceiro'>('Parceiro');

  // Carregar dados dos usuários parceiros e remetentes de solicitações
  useEffect(() => {
    const loadUsersData = async () => {
      const partners = getPartnersByCategory(selectedCategory);
      const pendingRequests = getPendingReceivedRequests();

      // Buscar dados dos parceiros baseado na categoria selecionada
      if (partners.length > 0) {
        const partnerIds = partners.map(p => 
          p.sender_id === currentUserId ? p.receiver_id : p.sender_id
        );
        
        const { data: partnersData } = await supabase
          .from('profiles')
          .select('id, full_name, display_name, avatar_url')
          .in('id', partnerIds);

        if (partnersData) {
          setPartnerUsers(partnersData.map(profile => ({
            id: profile.id,
            username: profile.display_name || profile.full_name?.split(' ')[0] || 'usuario',
            full_name: profile.full_name,
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            followers_count: Math.floor(Math.random() * 100),
            following_count: Math.floor(Math.random() * 50)
          })));
        }
      } else {
        setPartnerUsers([]);
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
  }, [isOpen, friendRequests, currentUserId, selectedCategory]);

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

  // Função para confirmar mudança de categoria
  const handleConfirmCategoryChange = async (userId: string, newCategory: 'Parceiro' | 'Ex-Parceiro') => {
    if (!currentUserId) {
      setCategoryMessage("Erro: Usuário não autenticado.");
      return;
    }
    
    setUpdatingCategory(userId);
    console.log('Iniciando mudança de categoria:', userId, 'para', newCategory);
    
    try {
      const userToUpdate = partnerUsers.find(p => p.id === userId);
      const userName = userToUpdate?.full_name || userToUpdate?.username || 'este usuário';
      
      await updatePartnershipCategory(userId, newCategory);
      
      // Remover da lista atual imediatamente
      setPartnerUsers(prev => prev.filter(p => p.id !== userId));
      
      const actionText = newCategory === 'Ex-Parceiro' ? 'movido para Ex-Parceiros' : 'restaurado como Parceiro';
      setCategoryMessage(`${userName} foi ${actionText} com sucesso!`);
      
      // Disparar evento para atualizar o ProfileHeader
      document.dispatchEvent(new CustomEvent('partnersUpdated'));
      
    } catch (error) {
      console.error('Erro ao alterar categoria:', error);
      const userName = partnerUsers.find(p => p.id === userId)?.full_name || 'este usuário';
      
      if (error instanceof Error) {
        if (error.message.includes('Nenhuma parceria encontrada')) {
          setCategoryMessage(`Parceria com ${userName} não encontrada. A lista foi atualizada.`);
          setPartnerUsers(prev => prev.filter(p => p.id !== userId));
          await loadFriendRequests();
        } else {
          setCategoryMessage(`Erro ao alterar categoria: ${error.message}`);
        }
      } else {
        setCategoryMessage(`Erro inesperado ao alterar categoria de ${userName}. Contate o suporte.`);
      }
    } finally {
      setUpdatingCategory(null);
      setShowCategoryConfirm(null);
      
      // Limpar mensagem após 5 segundos
      setTimeout(() => {
        setCategoryMessage("");
      }, 5000);
    }
  };

  const pendingReceivedRequests = getPendingReceivedRequests();

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
          {/* Mensagem de sucesso/erro */}
          {categoryMessage && (
            <div className={`p-3 rounded-xl border-l-4 ${
              categoryMessage.includes('sucesso') 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400'
            }`}>
              <p className="text-sm font-medium">{categoryMessage}</p>
            </div>
          )}

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
                  Seus {selectedCategory === 'Parceiro' ? 'Parceiros' : 'Ex-Parceiros'} ({partnerUsers.length})
                </h3>
              </div>
              
              {/* Filtro de Categoria */}
              <Select value={selectedCategory} onValueChange={(value: 'Parceiro' | 'Ex-Parceiro') => setSelectedCategory(value)}>
                <SelectTrigger className="w-40 border-[#E0E1DD] dark:border-white/10 rounded-lg">
                  <SelectValue />
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Parceiro">Parceiros</SelectItem>
                  <SelectItem value="Ex-Parceiro">Ex-Parceiros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {partnerUsers.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 max-h-32 overflow-y-auto">
                {partnerUsers.map((user) => {
                  const currentCategory = getPartnerCategory(user.id);
                  const isMovingToEx = currentCategory === 'Parceiro';
                  
                  return (
                    <div key={user.id} className={`flex items-center justify-between p-3 border border-[#E0E1DD] dark:border-white/10 rounded-xl ${
                      selectedCategory === 'Parceiro' 
                        ? 'bg-green-50 dark:bg-green-900/10' 
                        : 'bg-orange-50 dark:bg-orange-900/10'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] flex items-center justify-center text-white font-medium">
                            {(user.full_name || user.username || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-[#0A2540] flex items-center justify-center ${
                            selectedCategory === 'Parceiro' ? 'bg-green-500' : 'bg-orange-500'
                          }`}>
                            <Verified className="h-2.5 w-2.5 text-white" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-[#29335C] dark:text-white">
                            {user.full_name || user.username || 'Usuário'}
                          </h4>
                          <p className="text-sm text-[#64748B] dark:text-white/60">
                            @{user.username || 'usuario'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                          selectedCategory === 'Parceiro' 
                            ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
                            : 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30'
                        }`}>
                          {selectedCategory}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCategoryConfirm({
                            userId: user.id, 
                            newCategory: isMovingToEx ? 'Ex-Parceiro' : 'Parceiro'
                          })}
                          disabled={updatingCategory === user.id}
                          className={`h-8 w-8 p-0 transition-colors ${
                            isMovingToEx 
                              ? 'border-orange-300 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                              : 'border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                        >
                          {updatingCategory === user.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-[#E0E1DD] dark:border-white/10 rounded-2xl">
                <Users className="h-12 w-12 text-[#64748B] dark:text-white/40 mx-auto mb-3" />
                <p className="text-[#64748B] dark:text-white/60 text-sm">
                  {selectedCategory === 'Parceiro' 
                    ? 'Você ainda não tem parceiros conectados'
                    : 'Você não tem ex-parceiros'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Modal de Confirmação de Mudança de Categoria */}
          {showCategoryConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCategoryConfirm(null)}>
              <div className="bg-white dark:bg-[#0A2540] rounded-2xl p-6 max-w-md mx-4 border border-[#E0E1DD] dark:border-white/10" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-full ${
                    showCategoryConfirm.newCategory === 'Ex-Parceiro'
                      ? 'bg-orange-100 dark:bg-orange-900/30'
                      : 'bg-green-100 dark:bg-green-900/30'
                  }`}>
                    <AlertTriangle className={`h-5 w-5 ${
                      showCategoryConfirm.newCategory === 'Ex-Parceiro'
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-green-600 dark:text-green-400'
                    }`} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
                    Confirmar Alteração
                  </h3>
                </div>
                <p className="text-[#64748B] dark:text-white/60 mb-6">
                  {showCategoryConfirm.newCategory === 'Ex-Parceiro' 
                    ? `Tem certeza que deseja mover ${partnerUsers.find(p => p.id === showCategoryConfirm.userId)?.full_name || 'este usuário'} para Ex-Parceiros? Você pode restaurá-lo depois.`
                    : `Tem certeza que deseja restaurar ${partnerUsers.find(p => p.id === showCategoryConfirm.userId)?.full_name || 'este usuário'} como Parceiro?`
                  }
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowCategoryConfirm(null)}
                    className="border-[#E0E1DD] dark:border-white/10"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => handleConfirmCategoryChange(showCategoryConfirm.userId, showCategoryConfirm.newCategory)}
                    className={`text-white ${
                      showCategoryConfirm.newCategory === 'Ex-Parceiro'
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                    disabled={updatingCategory === showCategoryConfirm.userId}
                  >
                    {updatingCategory === showCategoryConfirm.userId ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Alterando...
                      </div>
                    ) : (
                      'Confirmar'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

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
