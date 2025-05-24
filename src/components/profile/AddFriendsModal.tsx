
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { debounce } from 'lodash';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, checkFriendRequests, getFriendRequests } from '@/services/friendsAPIService';
import { Info, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface User {
  id: string;
  username: string;
  full_name: string;
  bio: string | null;
  avatar_url: string | null;
  isFriend: boolean;
  requestSent?: boolean;
}

interface FriendRequest {
  id: string;
  sender_id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

interface AddFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddFriendsModal: React.FC<AddFriendsModalProps> = ({ isOpen, onClose }) => {
  // Estados principais
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [requestsList, setRequestsList] = useState<FriendRequest[]>([]);
  const [showRequests, setShowRequests] = useState(false);
  const [activeTab, setActiveTab] = useState('buscar');
  
  // Estados de loading
  const [isLoading, setIsLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState<string | null>(null);
  const [responseLoading, setResponseLoading] = useState<string | null>(null);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Estados de erro
  const [searchError, setSearchError] = useState<string | null>(null);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  // Buscar solicitações pendentes ao carregar o modal e a cada 3 segundos
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const fetchPendingRequests = async () => {
      try {
        const result = await checkFriendRequests();
        setPendingRequests(result.count || 0);
      } catch (error) {
        console.error('Erro ao buscar solicitações pendentes:', error);
        // Não atualizar o contador em caso de erro, manter o valor anterior
      }
    };
    
    if (isOpen) {
      fetchPendingRequests();
      // Reduzir o intervalo de 5 para 3 segundos para atualização mais rápida
      interval = setInterval(fetchPendingRequests, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
      // Limpar estados ao fechar o modal
      if (!isOpen) {
        setSearchResults([]);
        setShowRequests(false);
        setSearchQuery('');
        setActiveTab('buscar');
      }
    };
  }, [isOpen]);

  // Efeito para carregar solicitações quando a aba de solicitações é ativada
  useEffect(() => {
    if (activeTab === 'solicitacoes' && isOpen) {
      loadFriendRequests();
    }
  }, [activeTab, isOpen]);

  // Função para carregar solicitações de amizade
  const loadFriendRequests = async () => {
    try {
      setIsLoadingRequests(true);
      setRequestsError(null);
      const requests = await getFriendRequests();
      setRequestsList(requests);
      setShowRequests(true);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
      setRequestsError('Não foi possível carregar suas solicitações de amizade.');
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // Função para realizar a busca com debounce
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setSearchError(null);
        
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        if (!token) {
          throw new Error('Usuário não autenticado');
        }
        
        const response = await fetch(`/api/search-users?query=${encodeURIComponent(query)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar usuários');
        }
        
        const results = await response.json();
        setSearchResults(results);
        
        if (results.length === 0) {
          setSearchError('Nenhum usuário encontrado com este termo de busca');
        }
      } catch (error) {
        console.error('Erro na busca:', error);
        setSearchError('Ocorreu um erro ao realizar a busca. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Handler para mudanças no campo de busca
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length >= 2) {
      setIsLoading(true);
      debouncedSearch(query);
    } else {
      setSearchResults([]);
      setSearchError(null);
    }
  };

  // Função para realizar busca imediata
  const handleSearchClick = () => {
    if (searchQuery.length >= 2) {
      debouncedSearch.cancel();
      setIsLoading(true);
      debouncedSearch(searchQuery);
    } else {
      setSearchError('Digite pelo menos 2 caracteres para realizar a busca');
    }
  };

  // Função para enviar solicitação de amizade
  const handleSendRequest = async (userId: string) => {
    try {
      setRequestLoading(userId);
      const result = await sendFriendRequest(userId);

      if (result.success) {
        toast({
          title: "Solicitação enviada",
          description: "Sua solicitação de amizade foi enviada com sucesso!",
        });

        // Atualizar o estado dos resultados para mostrar como pendente
        setSearchResults(prevResults => 
          prevResults.map(user => 
            user.id === userId ? { ...user, requestSent: true } : user
          )
        );
      } else {
        toast({
          title: "Erro",
          description: result.error || "Não foi possível enviar a solicitação",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar a solicitação",
        variant: "destructive",
      });
    } finally {
      setRequestLoading(null);
    }
  };

  // Função para aceitar solicitação de amizade
  const handleAcceptRequest = async (senderId: string) => {
    try {
      setResponseLoading(senderId);
      const result = await acceptFriendRequest(senderId);

      if (result.success) {
        toast({
          title: "Amizade confirmada!",
          description: "Vocês agora são amigos.",
        });

        // Remover a solicitação da lista e atualizar contador
        setRequestsList(prev => prev.filter(req => req.sender_id !== senderId));
        setPendingRequests(prev => Math.max(0, prev - 1));
      } else {
        toast({
          title: "Erro",
          description: result.error || "Não foi possível aceitar a solicitação",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao aceitar a solicitação",
        variant: "destructive",
      });
    } finally {
      setResponseLoading(null);
    }
  };

  // Função para rejeitar solicitação de amizade
  const handleRejectRequest = async (senderId: string) => {
    try {
      setResponseLoading(senderId);
      const result = await rejectFriendRequest(senderId);

      if (result.success) {
        toast({
          title: "Solicitação rejeitada",
          description: "A solicitação de amizade foi rejeitada",
        });

        // Remover a solicitação da lista e atualizar contador
        setRequestsList(prev => prev.filter(req => req.sender_id !== senderId));
        setPendingRequests(prev => Math.max(0, prev - 1));
      } else {
        toast({
          title: "Erro",
          description: result.error || "Não foi possível rejeitar a solicitação",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao rejeitar a solicitação",
        variant: "destructive",
      });
    } finally {
      setResponseLoading(null);
    }
  };

  // Função para mostrar perfil público (placeholder por enquanto)
  const handleViewProfile = (userId: string) => {
    console.log('Ver perfil do usuário:', userId);
    toast({
      title: "Visualizar perfil",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  // Usar useMemo para otimizar a renderização das solicitações
  const memoizedRequestsList = useMemo(() => {
    return requestsList;
  }, [requestsList]);

  // Truncar texto da bio se for muito longo
  const truncateBio = (bio: string | null) => {
    if (!bio) return '';
    return bio.length > 100 ? bio.substring(0, 97) + '...' : bio;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#1E2A44] text-white max-w-md w-full p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Adicionar amigos</DialogTitle>
          <p className="text-[#B0B0B0] text-sm mt-1">Adicione-se a estudantes como você</p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="w-full bg-[#1E2A44] border-b border-gray-700 mb-4">
            <TabsTrigger 
              value="buscar" 
              className="text-[#4A90E2] text-base data-[state=active]:border-b-2 data-[state=active]:border-[#4A90E2]"
            >
              Buscar pessoas
            </TabsTrigger>
            <TabsTrigger 
              value="solicitacoes" 
              className="text-[#4A90E2] text-base data-[state=active]:border-b-2 data-[state=active]:border-[#4A90E2]"
            >
              Solicitações ({pendingRequests})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buscar" className="space-y-4">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="text"
                  placeholder="Digite nome, e-mail ou @username"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="flex-1 bg-transparent border-gray-600 text-white placeholder:text-gray-400 p-2"
                />
                <Button 
                  className="bg-[#F28C38] hover:bg-[#E07A27] text-white font-medium"
                  onClick={handleSearchClick}
                  disabled={searchQuery.length < 2 || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Buscar Pessoas
                </Button>
              </div>

              <p className="text-[#B0B0B0] text-xs italic">
                Comece a buscar pessoas, digite um nome ou @username para encontrar pessoas para conectar.
              </p>
            </div>

            {searchError && (
              <Alert variant="destructive" className="bg-red-900/50 border-red-600 text-white">
                <AlertTitle>Atenção</AlertTitle>
                <AlertDescription>{searchError}</AlertDescription>
              </Alert>
            )}

            {searchResults.length > 0 ? (
              <ul className="p-0 list-none space-y-4">
                {searchResults.map((user) => (
                  <li 
                    key={user.id} 
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border border-gray-700 rounded-md"
                  >
                    <img
                      src={user.avatar_url || '/images/placeholder.png'}
                      alt={`${user.full_name} avatar`}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        // Se a imagem falhar, substituir por placeholder
                        const target = e.target as HTMLImageElement;
                        console.error(`Erro ao carregar avatar para ${user.id}: ${target.src}`);
                        target.src = '/images/placeholder.png';
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <span className="text-white text-base font-medium block">
                        {user.full_name} <span className="text-[#B0B0B0]">@{user.username}</span>
                      </span>
                      <p className="text-[#B0B0B0] text-xs mt-1">
                        {truncateBio(user.bio)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 self-end sm:self-center mt-2 sm:mt-0">
                      {user.isFriend ? (
                        <Button
                          className="bg-gray-600 text-white cursor-not-allowed text-xs py-1 px-3"
                          disabled
                        >
                          Amigo
                        </Button>
                      ) : user.requestSent ? (
                        <Button
                          className="bg-gray-600 text-white cursor-not-allowed text-xs py-1 px-3"
                          disabled
                        >
                          Solicitação enviada
                        </Button>
                      ) : (
                        <Button
                          className="bg-[#F28C38] hover:bg-[#E07A27] text-white text-xs py-1 px-3"
                          onClick={() => handleSendRequest(user.id)}
                          disabled={requestLoading === user.id}
                        >
                          {requestLoading === user.id ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : null}
                          Seguir perfil
                        </Button>
                      )}

                      <Button
                        className="bg-[#4A90E2] hover:bg-[#3A80D2] text-white text-xs py-1 px-3"
                        onClick={() => handleViewProfile(user.id)}
                      >
                        Perfil público
                      </Button>
                    </div>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-[#B0B0B0] cursor-help ml-1">
                            <Info size={14} />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#333] text-white text-xs p-2 max-w-[200px]">
                          Ao aceitar, você permite que o usuário veja seu conteúdo privado
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </li>
                ))}
              </ul>
            ) : searchQuery.length >= 2 && !isLoading ? (
              <p className="text-[#B0B0B0] text-center py-4">Nenhum resultado encontrado</p>
            ) : null}

            {isLoading && searchQuery.length >= 2 && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-[#F28C38]" />
              </div>
            )}
          </TabsContent>

          <TabsContent value="solicitacoes">
            {pendingRequests === 0 ? (
              <p className="text-[#B0B0B0] text-center py-4">
                Você não tem solicitações de amizade pendentes.
              </p>
            ) : (
              <div className="space-y-4">
                {requestsError && (
                  <Alert variant="destructive" className="bg-red-900/50 border-red-600 text-white">
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>{requestsError}</AlertDescription>
                  </Alert>
                )}
                
                {isLoadingRequests ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#F28C38]" />
                  </div>
                ) : (
                  <div className="bg-[#2A3555] p-4 rounded-md">
                    <h3 className="text-white font-medium mb-3">Solicitações pendentes</h3>
                    
                    {memoizedRequestsList.length > 0 ? (
                      <ul className="space-y-3">
                        {memoizedRequestsList.map((request) => (
                          <li key={request.id} className="flex items-center gap-3 p-2 border border-gray-700 bg-[#1E2A44] rounded-md">
                            <img 
                              src={request.avatar_url || '/images/placeholder.png'} 
                              alt={`${request.full_name} avatar`}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                // Se a imagem falhar, substituir por placeholder
                                const target = e.target as HTMLImageElement;
                                console.error(`Erro ao carregar avatar para solicitação de ${request.sender_id}: ${target.src}`);
                                target.src = '/images/placeholder.png';
                              }}
                            />
                            
                            <div className="flex-1">
                              <span className="text-white text-sm font-medium block">
                                {request.full_name} <span className="text-[#B0B0B0]">@{request.username}</span>
                              </span>
                              {request.bio && (
                                <p className="text-[#B0B0B0] text-xs mt-1">
                                  {truncateBio(request.bio)}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-3"
                                onClick={() => handleAcceptRequest(request.sender_id)}
                                disabled={responseLoading === request.sender_id}
                              >
                                {responseLoading === request.sender_id ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                )}
                                Aceitar
                              </Button>
                              
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-3"
                                onClick={() => handleRejectRequest(request.sender_id)}
                                disabled={responseLoading === request.sender_id}
                              >
                                {responseLoading === request.sender_id ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <XCircle className="h-3 w-3 mr-1" />
                                )}
                                Rejeitar
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[#B0B0B0] text-center py-2">
                        Carregando solicitações...
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendsModal;
