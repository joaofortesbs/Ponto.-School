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
      <div className="relative flex p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer" onClick={() => setSelectedUser(user)}>
        <div className="flex gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-700 shadow-sm">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] text-white">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Status indicator */}
            {user.lastActive === 'Agora mesmo' ? (
              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-800"></div>
            ) : user.lastActive?.includes('min') ? (
              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-yellow-500 border-2 border-white dark:border-slate-800"></div>
            ) : (
              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-slate-400 border-2 border-white dark:border-slate-800"></div>
            )}
          </div>
          
          <div className="flex flex-col">
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {user.name}
              <div className="text-xs text-slate-500 dark:text-slate-400">@{user.username}</div>
              <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 max-w-[180px] mt-0.5">{user.bio}</div>
            </div>

            {/* Last active status (new) */}
            <div className="flex items-center mt-1">
              <Clock className="h-3 w-3 text-slate-400 mr-1" />
              <span className="text-xs text-slate-500 dark:text-slate-400">{user.lastActive}</span>
            </div>
          </div>
        </div>

        <div className="ml-auto flex flex-col items-end justify-between">
          <div className="text-xs px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-0.5">
            {user.isPrivate ? (
              <>
                <Lock className="h-3 w-3 mr-0.5" /> Perfil privado
              </>
            ) : (
              <>
                <Unlock className="h-3 w-3 mr-0.5" /> Perfil público
              </>
            )}
          </div>

          {user.isPrivate ? (
            <Button
              onClick={(e) => { e.stopPropagation(); handleRelationAction(user.id, 'request'); }}
              size="sm"
              variant={relation === 'requested' ? 'outline' : 'default'}
              className={relation === 'requested' ? 'border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 text-xs h-8' : 'bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs h-8'}
            >
              {relation === 'requested' ? 'Solicitado ✓' : 'Solicitar conexão'}
            </Button>
          ) : (
            <Button
              onClick={(e) => { e.stopPropagation(); handleRelationAction(user.id, 'follow'); }}
              size="sm"
              variant={relation === 'following' ? 'outline' : 'default'}
              className={relation === 'following' ? 'border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-xs h-8' : 'bg-blue-600 hover:bg-blue-700 text-white text-xs h-8'}
            >
              {relation === 'following' ? 'Seguindo ✓' : 'Seguir perfil'}
            </Button>
          )}
        </div>
      </div>
    );
  });

  // Memo para não rerenderizar
  UserCard.displayName = 'UserCard';

  // Renderizar card de solicitação pendente otimizado
  const PendingRequestCard = React.memo(({ request, layoutId }: { request: PendingRequestType, layoutId: string }) => {
    const { user, type } = request;

    return (
      <div className="relative flex p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer">
        <div className="flex gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-700 shadow-sm">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] text-white">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Status indicator - blue for pending */}
            <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-800"></div>
          </div>
          
          <div className="flex flex-col">
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {user.name}
              <div className="text-xs text-slate-500 dark:text-slate-400">@{user.username}</div>
              {type === 'received' 
                ? (
                  <div className="mt-1 flex items-center">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                      <UserCheck className="h-3 w-3" /> solicitação recebida
                      <span className="text-slate-400 dark:text-slate-500">• {new Date(request.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}</span>
                    </span>
                  </div>
                ) 
                : (
                  <div className="mt-1 flex items-center">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                      <AlertCircle className="h-3 w-3" /> solicitação enviada
                      <span className="text-slate-400 dark:text-slate-500">• {new Date(request.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}</span>
                    </span>
                  </div>
                )
              }
            </div>
          </div>
        </div>

        {type === 'received' && (
          <div className="ml-auto flex items-center gap-2">
            <Button
              onClick={() => handleRelationAction(user.id, 'accept')}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white text-xs h-7 px-3"
            >
              Aceitar
            </Button>
            <Button
              onClick={() => handleRelationAction(user.id, 'reject')}
              size="sm"
              variant="outline"
              className="border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-xs h-7 px-3"
            >
              Rejeitar
            </Button>
          </div>
        )}

        {type === 'sent' && (
          <div className="ml-auto text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center">
            <Clock className="h-3 w-3 mr-1 text-amber-500" /> Aguardando
          </div>
        )}
      </div>
    );
  });

  // Memo para não rerenderizar
  PendingRequestCard.displayName = 'PendingRequestCard';

  // Renderizar painel de perfil expandido
  const UserProfilePanel = () => {
    if (!selectedUser) return null;

    const relation = userRelations[selectedUser.id] || 'none';

    return (
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-lg h-full overflow-y-auto">
        {/* Botão voltar para mobile */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="md:hidden mb-4 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => setSelectedUser(null)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>

        {/* Capa com efeito parallax */}
        <div className="relative w-full h-48 mb-16 rounded-xl overflow-hidden">
          {selectedUser.coverUrl ? (
            <div className="absolute inset-0">
              <img 
                src={selectedUser.coverUrl} 
                alt="Capa do perfil" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00] to-[#FF8C40]">
              <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
            </div>
          )}

          {/* Pequeno menu de ações na capa */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-black/20 text-white hover:bg-black/30 backdrop-blur-sm"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-black/20 text-white hover:bg-black/30 backdrop-blur-sm"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-black/20 text-white hover:bg-black/30 backdrop-blur-sm"
            >
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Avatar em destaque */}
        <div className="absolute top-44 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-900 shadow-lg">
              <AvatarImage 
                src={selectedUser.avatar} 
                className="h-full w-full object-cover"
              />
              <AvatarFallback className="text-xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] text-white">
                {selectedUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Badge status */}
            {selectedUser.isPrivate ? (
              <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-slate-700 flex items-center justify-center border-2 border-white dark:border-slate-900">
                <Lock className="h-3.5 w-3.5 text-white" />
              </div>
            ) : (
              <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-green-500 flex items-center justify-center border-2 border-white dark:border-slate-900">
                <Unlock className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Informações do perfil */}
        <div className="text-center mt-2 mb-4">
          <div className="mb-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {selectedUser.name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">@{selectedUser.username}</p>
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-300 max-w-md mx-auto my-3">
            {selectedUser.bio}
          </p>

          <div className="flex items-center justify-center gap-2 text-xs mt-3">
            {selectedUser.favoriteSubject && (
              <div className="flex items-center px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                <BookOpen className="h-3 w-3 mr-1" />
                {selectedUser.favoriteSubject}
              </div>
            )}

            {selectedUser.educationLevel && (
              <div className="flex items-center px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                <Sparkles className="h-3 w-3 mr-1" />
                {selectedUser.educationLevel}
              </div>
            )}
          </div>

          {/* Estatísticas */}
          <div className="flex justify-center gap-6 my-5 text-center">
            <div className="flex flex-col items-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {selectedUser.followersCount}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Seguidores
              </p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {selectedUser.friendsCount}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Amigos
              </p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {selectedUser.postsCount}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Publicações
              </p>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col gap-3 mt-5">
            {selectedUser.isPrivate ? (
              <Button
                onClick={() => handleRelationAction(selectedUser.id, 'request')}
                className={relation === 'requested' ? 'bg-slate-100 dark:bg-slate-800 border border-green-500 text-green-500' : 'bg-[#FF6B00] hover:bg-[#FF8C40] text-white'}
              >
                {relation === 'requested' ? (
                  <div className="flex items-center gap-1.5">
                    <span>Solicitação enviada</span>
                    <div className="p-0.5 bg-green-500 text-white rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                  </div>
                ) : 'Solicitar amizade'}
              </Button>
            ) : (
              <Button
                onClick={() => handleRelationAction(selectedUser.id, 'follow')}
                className={relation === 'following' ? 'bg-slate-100 dark:bg-slate-800 border border-blue-500 text-blue-500' : 'bg-blue-600 hover:bg-blue-700 text-white'}
              >
                {relation === 'following' ? (
                  <div className="flex items-center gap-1.5">
                    <span>Seguindo</span>
                    <div className="p-0.5 bg-blue-500 text-white rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                  </div>
                ) : 'Seguir perfil'}
              </Button>
            )}

            <Button
              variant="outline"
              className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            >
              Ver perfil completo
            </Button>
          </div>

          {/* Indicador de atividade */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs">
              <div className={`h-2 w-2 rounded-full mr-2 ${selectedUser.lastActive === 'Agora mesmo' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
              {selectedUser.lastActive === 'Agora mesmo' ? 'Online agora' : `Visto ${selectedUser.lastActive}`}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Interface vazia quando nenhum resultado é encontrado
  const EmptyState = ({ type }: { type: 'search' | 'pending' }) => (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
        {type === 'search' ? (
          <Search className="h-8 w-8" />
        ) : (
          <Users className="h-8 w-8" />
        )}
      </div>
      
      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
        {type === 'search' 
          ? searchQuery.trim() !== '' 
            ? "Nenhum resultado encontrado" 
            : "Comece a buscar pessoas"
          : "Sem solicitações pendentes"
        }
      </h3>
      
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
        {type === 'search' 
          ? searchQuery.trim() !== '' 
            ? `Não encontramos resultados para "${searchQuery}". Tente outro termo.` 
            : "Digite um nome ou @username para encontrar pessoas para conectar."
          : "Você não tem solicitações de amizade pendentes no momento."
        }
      </p>
    </div>
  );

  // Filtros para a busca
  const FilterDropdown = () => (
    <div className="absolute top-full right-0 mt-2 w-60 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
      <div className="mb-4">
        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
          Filtrar por:
        </h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className={`px-2 py-1 h-auto text-xs w-full justify-start ${filter === 'all' ? 'bg-slate-100 dark:bg-slate-700' : ''}`}
              onClick={() => setFilter('all')}
            >
              <Filter className="h-3 w-3 mr-2" /> Todos
            </Button>
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className={`px-2 py-1 h-auto text-xs w-full justify-start ${filter === 'online' ? 'bg-slate-100 dark:bg-slate-700' : ''}`}
              onClick={() => setFilter('online')}
            >
              <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div> Online agora
            </Button>
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className={`px-2 py-1 h-auto text-xs w-full justify-start ${filter === 'suggested' ? 'bg-slate-100 dark:bg-slate-700' : ''}`}
              onClick={() => setFilter('suggested')}
            >
              <Sparkles className="h-3 w-3 mr-2" /> Sugeridos
            </Button>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
          Ordenar por:
        </h4>
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className={`px-2 py-1 h-auto text-xs w-full justify-start ${sortOrder === 'alphabetical' ? 'bg-slate-100 dark:bg-slate-700' : ''}`}
            onClick={() => setSortOrder('alphabetical')}
          >
            Alfabética <ChevronUp className="h-3 w-3 ml-2" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`px-2 py-1 h-auto text-xs w-full justify-start ${sortOrder === 'recent' ? 'bg-slate-100 dark:bg-slate-700' : ''}`}
            onClick={() => setSortOrder('recent')}
          >
            Mais populares <Users className="h-3 w-3 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xl">
        <div className="flex flex-col h-full md:flex-row">
          <div className="flex-1 flex flex-col max-h-[80vh] overflow-hidden">
            <div className="p-6 pb-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Adicionar amigos
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Conecte-se com estudantes como você
                </p>
              </div>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            

              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="flex px-6 pt-2 bg-transparent border-b border-slate-200 dark:border-slate-700">
                  <TabsTrigger 
                    value="buscar" 
                    className="flex-1 px-4 py-2 text-sm data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] rounded-none"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Buscar Pessoas
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pendentes" 
                    className="flex-1 px-4 py-2 text-sm data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] data-[state=active]:text-[#FF6B00] rounded-none flex items-center gap-1"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Solicitações
                    {pendingRequests.filter(req => req.type === 'received').length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-[#FF6B00] text-white rounded-full">
                        {pendingRequests.filter(req => req.type === 'received').length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

              <TabsContent value="buscar" className="flex-1 flex flex-col overflow-hidden">
                <div className="p-6 pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Digite nome, e-mail ou @username"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10 py-2 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      autoComplete="off"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        className="absolute right-10 top-1/2 transform -translate-y-1/2 h-5 w-5 p-0"
                        onClick={() => setSearchQuery('')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}

                    {isLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <RefreshCw className="h-4 w-4 text-slate-400 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Botão de filtro */}
                  <div className="relative mt-3 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    >
                      <Filter className="h-3 w-3 mr-1.5" />
                      Filtrar
                    </Button>

                    <div className="relative">
                      {showFilterDropdown && <FilterDropdown />}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {searchQuery.trim() === '' && (
                    <EmptyState type="search" />
                  )}

                  {searchQuery.trim() !== '' && filteredResults.length === 0 && !isLoading && (
                    <EmptyState type="search" />
                  )}

                  <div className="space-y-3">
                    {filteredResults.map(user => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pendentes" className="flex-1 overflow-y-auto">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-medium flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                    recebidas
                    <span className="ml-2 text-xs text-slate-500">Solicitações de amizade</span>
                  </h3>
                </div>

                <div className="p-4 space-y-3">
                  {pendingRequests.filter(req => req.type === 'received').length === 0 && (
                    <EmptyState type="pending" />
                  )}

                  <div className="space-y-3">
                    {pendingRequests
                      .filter(req => req.type === 'received')
                      .map(request => (
                        <PendingRequestCard key={request.id} request={request} layoutId={`request-${request.id}`} />
                      ))}
                  </div>
                </div>

                <div className="p-4 border-b border-t border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-medium flex items-center">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                    enviadas
                    <span className="ml-2 text-xs text-slate-500">Solicitações pendentes</span>
                  </h3>
                </div>

                <div className="p-4 space-y-3">
                  {pendingRequests.filter(req => req.type === 'sent').length === 0 && (
                    <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">
                      Você não enviou solicitações recentemente
                    </div>
                  )}

                  <div className="space-y-3">
                    {pendingRequests
                      .filter(req => req.type === 'sent')
                      .map(request => (
                        <PendingRequestCard key={request.id} request={request} layoutId={`sent-${request.id}`} />
                      ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="p-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              Ao aceitar, você permitirá que o usuário veja seu conteúdo privado.
              <Button
                variant="outline"
                size="sm"
                className="ml-auto text-xs"
                onClick={() => onOpenChange(false)}
              >
                Fechar
              </Button>
            </div>
          </div>

          {/* Painel de perfil expandido */}
          <div className={`w-0 md:w-96 transition-all duration-300 ${selectedUser ? 'md:w-96' : 'md:w-0'} overflow-hidden`}>
            {selectedUser && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="h-full"
              >
                <UserProfilePanel />
              </motion.div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendsModal;