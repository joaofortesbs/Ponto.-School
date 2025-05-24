import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { debounce } from 'lodash';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sendFriendRequest } from '@/services/friendsAPIService';
import { Info, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";

interface User {
  id: string;
  username: string;
  full_name: string;
  bio: string | null;
  avatar_url: string | null;
  isFriend: boolean;
}

interface AddFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddFriendsModal: React.FC<AddFriendsModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [activeTab, setActiveTab] = useState('buscar');
  const [requestLoading, setRequestLoading] = useState<string | null>(null);

  // Buscar solicitações pendentes ao carregar o modal
  useEffect(() => {
    if (isOpen) {
      fetchPendingRequests();
    }
  }, [isOpen]);

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/check-requests', {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });
      const data = await response.json();
      setPendingRequests(data.count || 0);
    } catch (error) {
      console.error('Erro ao buscar solicitações pendentes:', error);
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
        const results = await searchUsers(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Erro na busca:', error);
        toast({
          title: "Erro na busca",
          description: "Não foi possível realizar a busca. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Função para buscar usuários
  const searchUsers = async (query: string): Promise<User[]> => {
    try {
      const response = await fetch(`/api/search-users?query=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar usuários');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
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

  // Função para mostrar perfil público (placeholder por enquanto)
  const handleViewProfile = (userId: string) => {
    console.log('Ver perfil do usuário:', userId);
    toast({
      title: "Visualizar perfil",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  // Handler para mudanças no campo de busca
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length >= 2) {
      setIsLoading(true);
      debouncedSearch(query);
    } else {
      setSearchResults([]);
    }
  };

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
                  onClick={() => debouncedSearch(searchQuery)}
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
            <p className="text-[#B0B0B0] text-center py-4">
              {pendingRequests > 0 
                ? "Funcionalidade de visualização de solicitações em desenvolvimento." 
                : "Você não tem solicitações de amizade pendentes."}
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendsModal;