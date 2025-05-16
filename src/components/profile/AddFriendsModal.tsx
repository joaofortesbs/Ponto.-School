import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, X, Eye, Lock, Unlock, ChevronLeft, ArrowLeft, 
  UserCheck, MapPin, BookOpen, Bookmark, Users, 
  Clock, CheckCircle2, AlertCircle, Bell, Filter
} from "lucide-react";

// Tipos de usuário
interface UserType {
  id: string;
  name: string;
  username: string;
  bio: string;
  isPrivate: boolean;
  avatar: string;
  coverUrl?: string;
  followersCount: number;
  friendsCount: number;
  postsCount: number;
  favoriteSubject?: string;
  educationLevel?: string;
  lastActive?: string;
}

const mockUsers: UserType[] = [
  {
    id: '1',
    name: 'Ana Silva',
    username: 'ana',
    bio: 'Apaixonada por História',
    isPrivate: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    coverUrl: '/images/tempo-image-20250329T020811458Z.png',
    followersCount: 150,
    friendsCount: 75,
    postsCount: 12,
    favoriteSubject: 'Matemática',
    educationLevel: 'Ensino Médio',
    lastActive: '2 min atrás'
  },
  {
    id: '2',
    name: 'Lucas Rocha',
    username: 'lucas',
    bio: 'Curioso por tecnologia',
    isPrivate: false,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas',
    followersCount: 89,
    friendsCount: 42,
    postsCount: 7,
    favoriteSubject: 'Física',
    educationLevel: 'Pré-Vestibular',
    lastActive: '14 min atrás'
  },
  {
    id: '3',
    name: 'Mariana Costa',
    username: 'mari',
    bio: 'Estudante de medicina, apaixonada por biologia molecular',
    isPrivate: false,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mari',
    followersCount: 210,
    friendsCount: 93,
    postsCount: 25,
    favoriteSubject: 'Biologia',
    educationLevel: 'Graduação',
    lastActive: 'Agora mesmo'
  },
  {
    id: '4',
    name: 'Pedro Alves',
    username: 'palves',
    bio: 'Programador e entusiasta de matemática aplicada',
    isPrivate: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
    followersCount: 102,
    friendsCount: 57,
    postsCount: 15,
    favoriteSubject: 'Programação',
    educationLevel: 'Graduação',
    lastActive: '1h atrás'
  },
  {
    id: '5',
    name: 'Juliana Mendes',
    username: 'jumendes',
    bio: 'Estudante de literatura, leitora ávida e escritora nas horas vagas',
    isPrivate: false,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juliana',
    followersCount: 175,
    friendsCount: 68,
    postsCount: 34,
    favoriteSubject: 'Literatura',
    educationLevel: 'Graduação',
    lastActive: '30 min atrás'
  }
];

interface PendingRequestType {
  id: string;
  user: UserType;
  type: 'received' | 'sent';
  date: string;
}

const mockPendingRequests: PendingRequestType[] = [
  {
    id: 'req1',
    user: mockUsers[2],
    type: 'received',
    date: '2023-05-15'
  },
  {
    id: 'req2',
    user: mockUsers[4],
    type: 'sent',
    date: '2023-05-14'
  }
];

interface AddFriendsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddFriendsModal: React.FC<AddFriendsModalProps> = ({ open, onOpenChange }) => {
  // Estado principal
  const [activeTab, setActiveTab] = useState("buscar");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<PendingRequestType[]>(mockPendingRequests);
  const [userRelations, setUserRelations] = useState<{[key: string]: 'none' | 'requested' | 'following'}>({});

  // Referências para melhorar desempenho
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Estados de UI
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filter, setFilter] = useState<'all' | 'online' | 'suggested'>('all');
  const [sortOrder, setSortOrder] = useState<'alphabetical' | 'recent'>('recent');

  // Otimizações para debounce de pesquisa
  const performSearch = useCallback((query: string) => {
    if (query.trim() === '') {
      setFilteredResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Limpar timeout anterior se existir
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Definir novo timeout
    searchTimeoutRef.current = setTimeout(() => {
      // Filtrar resultados com base na consulta
      const results = mockUsers.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) || 
        user.username.toLowerCase().includes(query.toLowerCase())
      );

      // Aplicar ordenação
      const sortedResults = [...results].sort((a, b) => {
        if (sortOrder === 'alphabetical') {
          return a.name.localeCompare(b.name);
        } else {
          // Para 'recent', poderia ser baseado na data de registro ou última atividade
          return b.followersCount - a.followersCount;
        }
      });

      // Aplicar filtro adicional
      let finalResults = sortedResults;
      if (filter === 'online') {
        finalResults = sortedResults.filter(user => 
          user.lastActive === 'Agora mesmo' || user.lastActive?.includes('min'));
      } else if (filter === 'suggested') {
        // Filtro de sugestões (poderia ser baseado em interesses comuns)
        finalResults = sortedResults.filter(user => 
          user.favoriteSubject === 'Matemática' || user.favoriteSubject === 'Programação');
      }

      setFilteredResults(finalResults);
      setIsLoading(false);
    }, 300);
  }, [filter, sortOrder]);

  // Atualizar resultados quando a busca mudar
  useEffect(() => {
    performSearch(searchQuery);

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  // Inicializar estado das relações com os usuários
  useEffect(() => {
    const initialRelations: {[key: string]: 'none' | 'requested' | 'following'} = {};
    mockUsers.forEach(user => {
      // Verificar se existe solicitação pendente enviada
      const hasSentRequest = pendingRequests.some(req => 
        req.user.id === user.id && req.type === 'sent'
      );

      if (hasSentRequest) {
        initialRelations[user.id] = 'requested';
      } else {
        initialRelations[user.id] = 'none';
      }
    });
    setUserRelations(initialRelations);
  }, []);

  // Resetar o filtro ao trocar de aba
  useEffect(() => {
    if (activeTab === 'buscar') {
      performSearch(searchQuery);
    }
  }, [activeTab, performSearch, searchQuery]);

  // Fechar perfil selecionado quando fechar o modal
  useEffect(() => {
    if (!open) {
      setSelectedUser(null);
    }
  }, [open]);

  // Função para gerenciar relacionamentos de usuário
  const handleRelationAction = (userId: string, action: 'request' | 'follow' | 'accept' | 'reject') => {
    switch (action) {
      case 'request':
        // Simular uma solicitação enviada
        setUserRelations(prev => ({...prev, [userId]: 'requested'}));

        // Adicionar à lista de solicitações pendentes
        const requestedUser = mockUsers.find(user => user.id === userId);
        if (requestedUser) {
          const newRequest: PendingRequestType = {
            id: `req-${Date.now()}`,
            user: requestedUser,
            type: 'sent',
            date: new Date().toISOString().split('T')[0]
          };
          setPendingRequests(prev => [...prev, newRequest]);
        }
        break;

      case 'follow':
        setUserRelations(prev => ({...prev, [userId]: 'following'}));
        break;

      case 'accept':
        // Remover das solicitações pendentes e adicionar como amigo
        setPendingRequests(prev => prev.filter(req => !(req.user.id === userId && req.type === 'received')));
        break;

      case 'reject':
        // Apenas remover das solicitações pendentes
        setPendingRequests(prev => prev.filter(req => !(req.user.id === userId && req.type === 'received')));
        break;
    }
  };

  // Componente de cartão de usuário otimizado
  const UserCard = React.memo(({ user }: { user: UserType }) => {
    const relation = userRelations[user.id] || 'none';

    return (
      
        
          
            
              
              
                {user.name.charAt(0)}
              
            

            {/* Status indicator */}
            {user.lastActive === 'Agora mesmo' ? (
              
            ) : user.lastActive?.includes('min') ? (
              
            ) : (
              
            )}
          
          
            
              {user.name}
              @{user.username}
              {user.bio}

            {/* Last active status (new) */}
            
              
              {user.lastActive}
            
          

          
            
              {user.isPrivate ? (
                <>
                   Perfil privado
                </>
              ) : (
                <>
                   Perfil público
                </>
              )}
            

            {user.isPrivate ? (
              
                {relation === 'requested' ? 'Solicitado ✓' : 'Solicitar conexão'}
              
            ) : (
              
                {relation === 'following' ? 'Seguindo ✓' : 'Seguir perfil'}
              
            )}
          
        
      
    );
  });

  // Memo para não rerenderizar
  UserCard.displayName = 'UserCard';

  // Renderizar card de solicitação pendente otimizado
  const PendingRequestCard = React.memo(({ request, layoutId }: { request: PendingRequestType, layoutId: string }) => {
    const { user, type } = request;

    return (
      
        
          
            
              
              
                {user.name.charAt(0)}
              
            

            {/* Status indicator - blue for pending */}
            
          
          
            
              {user.name}
              @{user.username}
              {type === 'received' 
                ? (
                  
                    
                      solicitação recebida
                      • {new Date(request.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
                    
                  
                ) 
                : (
                  
                    
                      solicitação enviada
                      • {new Date(request.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
                    
                  
                )
              }
            
          

          {type === 'received' && (
            
              
                Aceitar
              
              
                Rejeitar
              
            
          )}

          {type === 'sent' && (
            Aguardando
          )}
        
      
    );
  });

  // Memo para não rerenderizar
  PendingRequestCard.displayName = 'PendingRequestCard';

  // Renderizar painel de perfil expandido
  const UserProfilePanel = () => {
    if (!selectedUser) return null;

    const relation = userRelations[selectedUser.id] || 'none';

    return (
      
        {/* Botão voltar para mobile */}
        
          
        

        {/* Capa com efeito parallax */}
        
          {selectedUser.coverUrl ? (
            
              
                
                
                  
                
                
              
            
          ) : (
            
              
                
                
              
              
            
          )}

          {/* Pequeno menu de ações na capa */}
          
            
              
                
                  
                
              
            
            
              
                
                  
                
              
            
            
              
                
                  
                
              
            
          
        

        {/* Avatar em destaque */}
        
          
            
              
                
                  
                
                {selectedUser.name.charAt(0)}
              
            

            {/* Badge status */}
            {selectedUser.isPrivate ? (
              
                
              
            ) : (
              
                
              
            )}
          
        

        {/* Informações do perfil */}
        
          
            
              
                {selectedUser.name}
                @{selectedUser.username}
              
          

          
            {selectedUser.bio}
          

          
            {selectedUser.favoriteSubject && (
              
                
                {selectedUser.favoriteSubject}
              
            )}

            {selectedUser.educationLevel && (
              
                
                {selectedUser.educationLevel}
              
            )}
          

          {/* Estatísticas */}
          
            
              
                {selectedUser.followersCount}
                Seguidores
              
            
            
              
                {selectedUser.friendsCount}
                Amigos
              
            
            
              
                {selectedUser.postsCount}
                Publicações
              
            
          

          {/* Botões de ação */}
          
            {selectedUser.isPrivate ? (
              
                {relation === 'requested' ? (
                  
                    
                      Solicitação enviada
                      
                        
                      
                    
                  
                ) : 'Solicitar amizade'}
              
            ) : (
              
                {relation === 'following' ? (
                  
                    
                      Seguindo
                      
                        
                      
                    
                  
                ) : 'Seguir perfil'}
              
            )}

            
              Ver perfil completo
            
          

          {/* Indicador de atividade */}
          
            
              
                
                {selectedUser.lastActive === 'Agora mesmo' ? 'Online agora' : `Visto ${selectedUser.lastActive}`}
              
            
          
        
      
    );
  };

  // Interface vazia quando nenhum resultado é encontrado
  const EmptyState = ({ type }: { type: 'search' | 'pending' }) => (
    
      
        {type === 'search' ? (
          
        ) : (
          
        )}
      
      
        {type === 'search' 
          ? searchQuery.trim() !== '' 
            ? "Nenhum resultado encontrado" 
            : "Comece a buscar pessoas"
          : "Sem solicitações pendentes"
        }
      
      
        {type === 'search' 
          ? searchQuery.trim() !== '' 
            ? `Não encontramos resultados para "${searchQuery}". Tente outro termo.` 
            : "Digite um nome ou @username para encontrar pessoas para conectar."
          : "Você não tem solicitações de amizade pendentes no momento."
        }
      
    
  );

  // Filtros para a busca
  const FilterDropdown = () => (
    
      
        Filtrar por:
        
          
            
              Todos
            
            
              Online agora
            
            
              Sugeridos
            
          
        
        Ordenar por:
        
          
            Alfabética
            
            Mais populares
          
        
      
    
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      
        
          
            
              
                
                  
                    Adicionar amigos
                  
                
                Conecte-se com estudantes como você
              
              
                
              
            
            

              
                
                  
                    
                      
                      Buscar Pessoas
                    
                  
                  
                    
                      
                      Solicitações
                      {pendingRequests.filter(req => req.type === 'received').length > 0 && (
                        
                          {pendingRequests.filter(req => req.type === 'received').length}
                        
                      )}
                    
                  
                
              

              
                
                  
                    
                      
                    
                    
                      Digite nome, e-mail ou @username
                      
                      
                        
                      
                    

                    {isLoading && (
                      
                        
                      
                    )}
                  

                  {/* Botão de filtro */}
                  
                    
                      
                        
                      
                      
                    

                    
                      {showFilterDropdown && <FilterDropdown />}
                    
                  
                

                
                  {searchQuery.trim() === '' && (
                    <EmptyState type="search" />
                  )}

                  {searchQuery.trim() !== '' && filteredResults.length === 0 && !isLoading && (
                    <EmptyState type="search" />
                  )}

                  
                    {filteredResults.map(user => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  
                
              

              
                
                  
                    
                      recebidas
                      Solicitações de amizade
                    
                  
                

                
                  {pendingRequests.filter(req => req.type === 'received').length === 0 && (
                    <EmptyState type="pending" />
                  )}

                  
                    {pendingRequests
                      .filter(req => req.type === 'received')
                      .map(request => (
                        <PendingRequestCard key={request.id} request={request} layoutId={`request-${request.id}`} />
                      ))}
                  
                

                
                  
                    
                      enviadas
                      Solicitações pendentes
                    
                  
                

                
                  {pendingRequests.filter(req => req.type === 'sent').length === 0 && (
                    
                      Você não enviou solicitações recentemente
                    
                  )}

                  
                    {pendingRequests
                      .filter(req => req.type === 'sent')
                      .map(request => (
                        <PendingRequestCard key={request.id} request={request} layoutId={`sent-${request.id}`} />
                      ))}
                  
                
              
            

            
              Ao aceitar, você permitirá que o usuário veja seu conteúdo privado.
              
                Fechar
              
            
          

          {/* Painel de perfil expandido */}
          
            {selectedUser && (
              
                
                  
                
              
            )}
          
        
      
    </Dialog>
  );
};

export default AddFriendsModal;