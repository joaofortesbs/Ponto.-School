import React, { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, X, Eye, Lock, Unlock, ChevronLeft, ArrowLeft, 
  UserCheck, MapPin, BookOpen, Bookmark, Users, 
  Clock, CheckCircle2, AlertCircle, Bell, Filter,
  MoreVertical, MessageSquare, Ban, Flag, Share2
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

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
  const [savedProfiles, setSavedProfiles] = useState<{[key: string]: boolean}>({});
  const [showProfileActions, setShowProfileActions] = useState(false);

  // Referências para melhorar desempenho
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Estados de UI
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filter, setFilter] = useState<'all' | 'online' | 'suggested' | 'saved'>('all');
  const [sortOrder, setSortOrder] = useState<'alphabetical' | 'recent'>('recent');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

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
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // Buscar usuários no Supabase que correspondam à consulta
        const { data: supabaseUsers, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`display_name.ilike.%${query}%,username.ilike.%${query}%`)
          .neq('id', supabase.auth.user()?.id) // Excluir o usuário atual
          .limit(20);

        if (error) {
          console.error('Erro ao buscar usuários:', error);
          // Fallback para dados mock em caso de erro
          searchMockUsers(query);
          return;
        }

        if (supabaseUsers && supabaseUsers.length > 0) {
          // Mapear usuários do Supabase para o formato esperado pelo componente
          const mappedUsers: UserType[] = supabaseUsers.map(user => ({
            id: user.id,
            name: user.display_name || user.username,
            username: user.username,
            bio: user.bio || 'Sem descrição',
            isPrivate: user.is_private || false,
            avatar: user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
            coverUrl: user.cover_url,
            followersCount: user.followers_count || 0,
            friendsCount: user.friends_count || 0,
            postsCount: user.posts_count || 0,
            favoriteSubject: user.favorite_subject,
            educationLevel: user.education_level,
            lastActive: user.last_active || 'Indisponível'
          }));

          // Verificar status de amizade para cada usuário
          const userIds = mappedUsers.map(user => user.id);
          const { data: friendRequests, error: requestsError } = await supabase
            .from('friend_requests')
            .select('*')
            .or(`sender_id.eq.${supabase.auth.user()?.id},receiver_id.eq.${supabase.auth.user()?.id}`)
            .in('sender_id', userIds)
            .in('receiver_id', userIds);

          if (requestsError) {
            console.error('Erro ao buscar solicitações:', requestsError);
          }

          // Atualizar relações de usuário com base nas solicitações
          if (friendRequests) {
            const newRelations = { ...userRelations };
            friendRequests.forEach(req => {
              if (req.sender_id === supabase.auth.user()?.id) {
                // Solicitação enviada pelo usuário atual
                newRelations[req.receiver_id] = req.status === 'accepted' ? 'following' : 'requested';
              } else if (req.status === 'accepted') {
                // Solicitação recebida e aceita
                newRelations[req.sender_id] = 'following';
              }
            });
            setUserRelations(newRelations);
          }

          // Aplicar ordenação
          const sortedResults = [...mappedUsers].sort((a, b) => {
            if (sortOrder === 'alphabetical') {
              return a.name.localeCompare(b.name);
            } else {
              return b.followersCount - a.followersCount;
            }
          });

          // Aplicar filtros
          let finalResults = sortedResults;
          
          if (filter === 'saved') {
            finalResults = sortedResults.filter(user => savedProfiles[user.id]);
          } else if (selectedFilters.length > 0) {
            finalResults = sortedResults.filter(user => {
              const isOnline = selectedFilters.includes('online') ? 
                (user.lastActive === 'Agora mesmo' || user.lastActive?.includes('min')) : false;
              
              const isSuggested = selectedFilters.includes('suggested') ? 
                (user.favoriteSubject === 'Matemática' || user.favoriteSubject === 'Programação') : false;
              
              const isRecent = selectedFilters.includes('recent') ? true : false;
              
              return isOnline || isSuggested || isRecent;
            });
          } else if (filter === 'online') {
            finalResults = sortedResults.filter(user => 
              user.lastActive === 'Agora mesmo' || user.lastActive?.includes('min'));
          } else if (filter === 'suggested') {
            finalResults = sortedResults.filter(user => 
              user.favoriteSubject === 'Matemática' || user.favoriteSubject === 'Programação');
          }

          setFilteredResults(finalResults);
        } else {
          // Fallback para dados mock se não houver resultados
          searchMockUsers(query);
        }
      } catch (error) {
        console.error('Erro na busca:', error);
        // Fallback para dados mock em caso de erro
        searchMockUsers(query);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, [filter, sortOrder, savedProfiles, selectedFilters, userRelations]);

  // Função de fallback para pesquisar nos dados mock
  const searchMockUsers = (query: string) => {
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
        return b.followersCount - a.followersCount;
      }
    });

    // Aplicar filtros
    let finalResults = sortedResults;
    
    if (filter === 'saved') {
      finalResults = sortedResults.filter(user => savedProfiles[user.id]);
    } else if (selectedFilters.length > 0) {
      finalResults = sortedResults.filter(user => {
        const isOnline = selectedFilters.includes('online') ? 
          (user.lastActive === 'Agora mesmo' || user.lastActive?.includes('min')) : false;
        
        const isSuggested = selectedFilters.includes('suggested') ? 
          (user.favoriteSubject === 'Matemática' || user.favoriteSubject === 'Programação') : false;
        
        const isRecent = selectedFilters.includes('recent') ? true : false;
        
        return isOnline || isSuggested || isRecent;
      });
    } else if (filter === 'online') {
      finalResults = sortedResults.filter(user => 
        user.lastActive === 'Agora mesmo' || user.lastActive?.includes('min'));
    } else if (filter === 'suggested') {
      finalResults = sortedResults.filter(user => 
        user.favoriteSubject === 'Matemática' || user.favoriteSubject === 'Programação');
    }

    setFilteredResults(finalResults);
  };

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
    const fetchUserRelations = async () => {
      try {
        const currentUserId = supabase.auth.user()?.id;
        if (!currentUserId) return;

        // Buscar solicitações de amizade no Supabase
        const { data: friendRequests, error } = await supabase
          .from('friend_requests')
          .select('*')
          .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);

        if (error) {
          console.error('Erro ao buscar solicitações de amizade:', error);
          initializeWithMockData();
          return;
        }

        if (friendRequests && friendRequests.length > 0) {
          const initialRelations: {[key: string]: 'none' | 'requested' | 'following'} = {};
          const receivedRequests: PendingRequestType[] = [];
          const sentRequests: PendingRequestType[] = [];
          
          // Processar solicitações do banco de dados
          for (const request of friendRequests) {
            if (request.sender_id === currentUserId) {
              // Solicitação enviada pelo usuário atual
              initialRelations[request.receiver_id] = request.status === 'accepted' ? 'following' : 'requested';
              
              // Buscar informações do usuário para mostrar na lista
              const { data: userData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', request.receiver_id)
                .single();
                
              if (userData && request.status === 'pending') {
                const userObj: UserType = {
                  id: userData.id,
                  name: userData.display_name || userData.username,
                  username: userData.username,
                  bio: userData.bio || 'Sem descrição',
                  isPrivate: userData.is_private || false,
                  avatar: userData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
                  followersCount: userData.followers_count || 0,
                  friendsCount: userData.friends_count || 0,
                  postsCount: userData.posts_count || 0,
                  lastActive: userData.last_active || 'Indisponível'
                };
                
                sentRequests.push({
                  id: request.id,
                  user: userObj,
                  type: 'sent',
                  date: new Date(request.created_at).toISOString().split('T')[0]
                });
              }
            } else if (request.receiver_id === currentUserId) {
              // Solicitação recebida pelo usuário atual
              if (request.status === 'accepted') {
                initialRelations[request.sender_id] = 'following';
              }
              
              // Buscar informações do usuário para mostrar na lista
              const { data: userData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', request.sender_id)
                .single();
                
              if (userData && request.status === 'pending') {
                const userObj: UserType = {
                  id: userData.id,
                  name: userData.display_name || userData.username,
                  username: userData.username,
                  bio: userData.bio || 'Sem descrição',
                  isPrivate: userData.is_private || false,
                  avatar: userData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
                  followersCount: userData.followers_count || 0,
                  friendsCount: userData.friends_count || 0,
                  postsCount: userData.posts_count || 0,
                  lastActive: userData.last_active || 'Indisponível'
                };
                
                receivedRequests.push({
                  id: request.id,
                  user: userObj,
                  type: 'received',
                  date: new Date(request.created_at).toISOString().split('T')[0]
                });
              }
            }
          }
          
          // Atualizar estados
          setUserRelations(initialRelations);
          setPendingRequests([...receivedRequests, ...sentRequests]);
        } else {
          // Se não houver dados no banco, inicializar com dados mock
          initializeWithMockData();
        }
      } catch (error) {
        console.error('Erro ao inicializar relações de usuário:', error);
        initializeWithMockData();
      }
    };
    
    // Inicializar com dados mock para fallback
    const initializeWithMockData = () => {
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
    };
    
    // Buscar dados reais se o usuário estiver autenticado
    if (supabase.auth.user()) {
      fetchUserRelations();
    } else {
      initializeWithMockData();
    }
  }, []);

  // Efeito para não rerenderizar o filtro ao trocar de aba
  useEffect(() => {
    if (activeTab === 'buscar') {
      performSearch(searchQuery);
    }
  }, [activeTab, performSearch, searchQuery]);

  // Carregar perfis salvos do localStorage
  useEffect(() => {
    const savedProfilesFromStorage = localStorage.getItem('epictus_saved_profiles');
    if (savedProfilesFromStorage) {
      try {
        setSavedProfiles(JSON.parse(savedProfilesFromStorage));
      } catch (e) {
        console.error('Erro ao carregar perfis salvos:', e);
      }
    }
  }, []);

  // Salvar perfis salvos no localStorage quando mudarem
  useEffect(() => {
    localStorage.setItem('epictus_saved_profiles', JSON.stringify(savedProfiles));
  }, [savedProfiles]);

  // Fechar perfil selecionado quando fechar o modal
  useEffect(() => {
    if (!open) {
      setSelectedUser(null);
      setShowProfileActions(false);
    }
  }, [open]);

  // Fechar o menu de ações quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileActions) {
        setShowProfileActions(false);
      }
    };

    // Adiciona o event listener com um pequeno delay para evitar 
    // que o próprio clique que abriu o menu o feche imediatamente
    if (showProfileActions) {
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showProfileActions]);

  // Função para gerenciar relacionamentos de usuário
  const handleRelationAction = async (userId: string, action: 'request' | 'follow' | 'unfollow' | 'accept' | 'reject') => {
    try {
      switch (action) {
        case 'request':
          // Enviar solicitação para o banco de dados
          const { error: requestError } = await supabase
            .from('friend_requests')
            .insert([{ 
              sender_id: supabase.auth.user()?.id, 
              receiver_id: userId, 
              status: 'pending' 
            }]);
            
          if (requestError) {
            console.error('Erro ao enviar solicitação:', requestError);
            toast({
              title: "Erro",
              description: "Não foi possível enviar a solicitação",
              duration: 3000,
            });
            return;
          }
          
          // Atualizar estado local
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
          // Em um sistema real, poderia ser salvo no banco de dados
          setUserRelations(prev => ({...prev, [userId]: 'following'}));
          break;
          
        case 'unfollow':
          // Em um sistema real, poderia ser removido do banco de dados
          setUserRelations(prev => ({...prev, [userId]: 'none'}));
          break;

        case 'accept':
          // Atualizar status da solicitação no banco de dados
          const { error: acceptError } = await supabase
            .from('friend_requests')
            .update({ status: 'accepted' })
            .match({ 
              sender_id: userId, 
              receiver_id: supabase.auth.user()?.id,
              status: 'pending'
            });
            
          if (acceptError) {
            console.error('Erro ao aceitar solicitação:', acceptError);
            toast({
              title: "Erro",
              description: "Não foi possível aceitar a solicitação",
              duration: 3000,
            });
            return;
          }
          
          // Remover das solicitações pendentes e adicionar como amigo
          setPendingRequests(prev => prev.filter(req => !(req.user.id === userId && req.type === 'received')));
          break;

        case 'reject':
          // Atualizar status da solicitação no banco de dados
          const { error: rejectError } = await supabase
            .from('friend_requests')
            .update({ status: 'rejected' })
            .match({ 
              sender_id: userId, 
              receiver_id: supabase.auth.user()?.id,
              status: 'pending'
            });
            
          if (rejectError) {
            console.error('Erro ao rejeitar solicitação:', rejectError);
            toast({
              title: "Erro",
              description: "Não foi possível rejeitar a solicitação",
              duration: 3000,
            });
            return;
          }
          
          // Apenas remover das solicitações pendentes
          setPendingRequests(prev => prev.filter(req => !(req.user.id === userId && req.type === 'received')));
          break;
      }
    } catch (error) {
      console.error('Erro na ação de relacionamento:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar sua solicitação",
        duration: 3000,
      });
    }
  };

  const toggleSavedProfile = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedProfiles(prev => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Renderizar card de usuário otimizado
  const UserCard = React.memo(({ user }: { user: UserType }) => {
    const relation = userRelations[user.id] || 'none';

    return (
      <div 
        className="bg-gradient-to-br from-[#0c1a2b]/95 to-[#0c1a2b]/85 backdrop-blur-lg rounded-xl p-4 mb-3 hover:from-[#001427] hover:to-[#0c1a2b] transition-all duration-300 border border-white/10 shadow-xl hover:shadow-2xl hover:border-[#FF6B00]/30 group relative"
        onClick={() => setSelectedUser(user)}
      >
        {/* Botão de perfil salvo */}
        <button 
          onClick={(e) => toggleSavedProfile(user.id, e)}
          className="absolute top-3 right-3 z-10 bg-black/30 hover:bg-black/50 p-1.5 rounded-full transition-all duration-300"
        >
          <Bookmark className={`h-3.5 w-3.5 ${savedProfiles[user.id] ? 'text-amber-400 fill-amber-400' : 'text-white/70'}`} />
        </button>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] rounded-full opacity-75 blur-md group-hover:opacity-100 group-hover:blur-sm transition-all duration-500"></div>
            <Avatar className="relative h-14 w-14 border-2 border-transparent">
              <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FF9B50] text-white">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Status indicator */}
            {user.lastActive === 'Agora mesmo' ? (
              <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#0c1a2b] shadow-lg"></div>
            ) : user.lastActive?.includes('min') ? (
              <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-yellow-500 border-2 border-[#0c1a2b] shadow-lg"></div>
            ) : (
              <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-slate-400 border-2 border-[#0c1a2b] shadow-lg"></div>
            )}
          </div>

          <div className="flex-1 space-y-0.5">
            <h3 className="text-white font-bold text-base group-hover:text-[#FF6B00] transition-colors duration-300">{user.name}</h3>
            <p className="text-[#64748B] text-sm font-medium">@{user.username}</p>
            <p className="text-white/80 text-xs line-clamp-1">{user.bio}</p>

            {/* Last active status (new) */}
            <div className="flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-[10px] text-gray-400">{user.lastActive}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end">
            <span className="inline-flex items-center text-xs font-medium text-white/70 gap-1.5 bg-white/5 px-2 py-1 rounded-full">
              {user.isPrivate ? (
                <>
                  <Lock className="h-3 w-3 text-amber-400" /> Perfil privado
                </>
              ) : (
                <>
                  <Unlock className="h-3 w-3 text-emerald-400" /> Perfil público
                </>
              )}
            </span>

            {user.isPrivate ? (
              <Button 
                variant="secondary" 
                size="sm" 
                className={`mt-1 ${
                  relation === 'requested' 
                  ? 'bg-white/10 text-white/70 hover:bg-white/15' 
                  : 'bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] text-white hover:shadow-lg hover:shadow-[#FF6B00]/20'
                } rounded-full px-4 transition-all duration-300`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (relation !== 'requested') {
                    handleRelationAction(user.id, 'request');
                  }
                }}
                disabled={relation === 'requested'}
              >
                {relation === 'requested' ? 'Solicitado ✓' : 'Solicitar conexão'}
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                size="sm" 
                className={`mt-1 ${
                  relation === 'following' 
                  ? 'bg-[#FF6B00] text-white' 
                  : 'bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] text-white hover:opacity-90'
                } rounded-full px-4 hover:shadow-lg hover:shadow-[#FF6B00]/20 transition-all duration-300`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRelationAction(user.id, 'follow');
                }}
              >
                {relation === 'following' ? 'Seguindo ✓' : 'Seguir perfil'}
              </Button>
            )}
          </div>
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
      <div 
        className="bg-gradient-to-br from-[#0c1a2b]/95 to-[#0c1a2b]/85 backdrop-blur-lg rounded-xl p-4 mb-3 hover:from-[#001427] hover:to-[#0c1a2b] transition-all duration-300 border border-white/10 shadow-xl hover:shadow-2xl hover:border-[#FF6B00]/30 group"
        onClick={() => setSelectedUser(user)}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] rounded-full opacity-75 blur-md group-hover:opacity-100 group-hover:blur-sm transition-all duration-500"></div>
            <Avatar className="h-14 w-14 border-2 border-transparent relative">
              <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FF9B50] text-white">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Status indicator - blue for pending */}
            <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-blue-500 border-2 border-[#0c1a2b] shadow-lg"></div>
          </div>

          <div className="flex-1 space-y-0.5">
            <h3 className="text-white font-bold text-base group-hover:text-[#FF6B00] transition-colors duration-300">{user.name}</h3>
            <p className="text-[#64748B] text-sm font-medium">@{user.username}</p>
            <p className="text-white/80 text-xs">
              {type === 'received' 
                ? (
                  <span className="inline-flex items-center gap-1">
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-[10px] font-medium">solicitação recebida</span>
                    <span className="text-white/60">• {new Date(request.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}</span>
                  </span>
                ) 
                : (
                  <span className="inline-flex items-center gap-1">
                    <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-medium">solicitação enviada</span>
                    <span className="text-white/60">• {new Date(request.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}</span>
                  </span>
                )
              }
            </p>
          </div>

          {type === 'received' && (
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] hover:opacity-90 text-white rounded-full px-4 hover:shadow-lg hover:shadow-[#FF6B00]/20 transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRelationAction(user.id, 'accept');
                }}
              >
                Aceitar
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white/10 hover:bg-white/15 text-white rounded-full px-4 transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRelationAction(user.id, 'reject');
                }}
              >
                Rejeitar
              </Button>
            </div>
          )}

          {type === 'sent' && (
            <span className="text-amber-400 text-xs bg-amber-400/10 px-3 py-1 rounded-full font-medium">Aguardando</span>
          )}
        </div>
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
      <div
        className="h-full overflow-y-auto py-6 px-4 flex flex-col custom-scrollbar"
      >
        {/* Botão voltar para mobile */}
        <button 
          className="md:hidden absolute top-4 left-4 text-white p-2 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md z-30 transition-all duration-300"
          onClick={() => setSelectedUser(null)}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Capa */}
        <div className="relative h-36 -mx-4 -mt-6 mb-4 overflow-hidden rounded-t-xl">
          {selectedUser.coverUrl ? (
            <div 
              className="absolute inset-0 w-full h-full bg-[#0A2540]"
            >
              <img 
                src={selectedUser.coverUrl} 
                alt="Capa" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001427]/95 via-[#001427]/70 to-transparent"></div>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#001427] via-[#072e4f] to-[#0A2540]">
              <div 
                className="absolute inset-0 bg-[url('/images/pattern-grid.svg')] opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001427]/95 to-transparent"></div>
            </div>
          )}

          {/* Pequeno menu de ações na capa */}
          <div className="absolute top-3 right-3 flex gap-2 z-20">
            <button 
              className="p-2 rounded-full bg-black/30 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/50 transition-all"
            >
              <Bookmark className="h-4 w-4" />
            </button>
            <button 
              className="p-2 rounded-full bg-black/30 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/50 transition-all"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button 
              className="md:flex hidden p-2 rounded-full bg-black/30 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/50 transition-all"
              onClick={() => setSelectedUser(null)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Avatar em destaque */}
        <div className="flex flex-col items-center -mt-16 mb-5">
          <div
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] rounded-full opacity-90 blur-sm"></div>
            <Avatar className="h-28 w-28 border-4 border-[#0A2540] shadow-2xl">
              <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FF9B50] text-white text-2xl font-bold">
                {selectedUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Badge status */}
            {selectedUser.isPrivate ? (
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1.5 rounded-full shadow-lg">
                <Lock className="h-3.5 w-3.5" />
              </div>
            ) : (
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
                <UserCheck className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        </div>

        {/* Informações do perfil */}
        <div className="text-center space-y-4">
          <div 
            className="space-y-1"
          >
            <h2 className="text-2xl font-bold text-white">{selectedUser.name}</h2>
            <p className="text-[#64748B] text-sm font-medium">@{selectedUser.username}</p>
          </div>

          <div
            className="px-6"
          >
            <p className="text-white/80 text-sm leading-relaxed">{selectedUser.bio}</p>
          </div>

          <div
            className="flex flex-wrap justify-center gap-2 px-2"
          >
            {selectedUser.favoriteSubject && (
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF6B00]/20 to-[#FF9B50]/10 text-[#FF9B50] text-sm px-3 py-1.5 rounded-full">
                <BookOpen className="h-3.5 w-3.5 text-[#FF6B00]" />
                {selectedUser.favoriteSubject}
              </div>
            )}

            {selectedUser.educationLevel && (
              <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 text-sm px-3 py-1.5 rounded-full">
                <MapPin className="h-3.5 w-3.5" />
                {selectedUser.educationLevel}
              </div>
            )}
          </div>

          {/* Estatísticas */}
          <div 
            className="grid grid-cols-3 gap-3 px-2 mt-4"
          >
            <div className="bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm rounded-xl p-3 shadow-inner">
              <p className="text-xl font-bold text-white">{selectedUser.followersCount}</p>
              <p className="text-white/60 text-xs">Seguidores</p>
            </div>
            <div className="bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm rounded-xl p-3 shadow-inner">
              <p className="text-xl font-bold text-white">{selectedUser.friendsCount}</p>
              <p className="text-white/60 text-xs">Amigos</p>
            </div>
            <div className="bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-sm rounded-xl p-3 shadow-inner">
              <p className="text-xl font-bold text-white">{selectedUser.postsCount}</p>
              <p className="text-white/60 text-xs">Publicações</p>
            </div>
          </div>

          {/* Botões de ação */}
          <div 
            className="space-y-3 px-2 mt-6"
          >
            {selectedUser.isPrivate ? (
              <Button 
                className={`w-full rounded-xl ${
                  relation === 'requested' 
                  ? 'bg-white/10 hover:bg-white/15 text-white/80' 
                  : 'bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] hover:shadow-lg hover:shadow-[#FF6B00]/20 text-white'
                } py-6 transition-all duration-300`}
                onClick={() => {
                  if (relation !== 'requested') {
                    handleRelationAction(selectedUser.id, 'request');
                  }
                }}
                disabled={relation === 'requested'}
              >
                {relation === 'requested' ? (
                  <div className="flex items-center gap-2">
                    <span>Solicitação enviada</span>
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                ) : 'Solicitar amizade'}
              </Button>
            ) : (
              <Button 
                className={`w-full rounded-xl ${
                  relation === 'following' 
                  ? 'bg-[#FF6B00] hover:bg-red-600 group/follow' 
                  : 'bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] hover:shadow-lg hover:shadow-[#FF6B00]/20'
                } text-white py-6 transition-all duration-300 relative`}
                onClick={() => {
                  if (relation === 'following') {
                    // Lógica para deixar de seguir
                    handleRelationAction(selectedUser.id, 'unfollow');
                  } else {
                    // Lógica para seguir
                    handleRelationAction(selectedUser.id, 'follow');
                  }
                }}
              >
                {relation === 'following' ? (
                  <>
                    <div className="flex items-center gap-2 group-hover/follow:opacity-0 transition-opacity duration-200">
                      <span>Seguindo</span>
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/follow:opacity-100 transition-opacity duration-200">
                      <span className="flex items-center gap-2">
                        Deixar de seguir
                      </span>
                    </div>
                  </>
                ) : 'Seguir perfil'}
              </Button>
            )}

            <div className="flex gap-3 mt-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white py-5 transition-all duration-300"
                onClick={() => {
                  // Lógica para enviar mensagem
                  toast({
                    title: "Mensagem",
                    description: "Funcionalidade de mensagens em desenvolvimento",
                    duration: 3000,
                  });
                }}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Enviar mensagem</span>
                </div>
              </Button>

              <div className="relative">
                <Button
                  variant="outline"
                  className="rounded-xl aspect-square bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white py-5 transition-all duration-300"
                  onClick={() => setShowProfileActions(!showProfileActions)}
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>

                {showProfileActions && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-[#0A2540] border border-white/10 z-50">
                    <div className="py-1">
                      <button
                        className="flex w-full items-center px-4 py-3 text-white hover:bg-white/10 transition-colors"
                        onClick={() => {
                          setShowProfileActions(false);
                          toast({
                            title: "Bloqueado",
                            description: `Usuário ${selectedUser?.name} bloqueado com sucesso`,
                            duration: 3000,
                          });
                        }}
                      >
                        <Ban className="h-4 w-4 mr-3 text-red-500" />
                        <span>Bloquear</span>
                      </button>
                      <button
                        className="flex w-full items-center px-4 py-3 text-white hover:bg-white/10 transition-colors"
                        onClick={() => {
                          setShowProfileActions(false);
                          toast({
                            title: "Denunciado",
                            description: "Denúncia enviada para análise",
                            duration: 3000,
                          });
                        }}
                      >
                        <Flag className="h-4 w-4 mr-3 text-amber-500" />
                        <span>Denunciar</span>
                      </button>
                      <button
                        className="flex w-full items-center px-4 py-3 text-white hover:bg-white/10 transition-colors rounded-b-lg"
                        onClick={() => {
                          setShowProfileActions(false);
                          toast({
                            title: "Compartilhado",
                            description: "Link copiado para a área de transferência",
                            duration: 3000,
                          });
                        }}
                      >
                        <Share2 className="h-4 w-4 mr-3 text-blue-500" />
                        <span>Compartilhar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Indicador de atividade */}
          <div 
            className="mt-4"
          >
            <p className="text-white/40 text-xs flex items-center justify-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
              {selectedUser.lastActive === 'Agora mesmo' ? 'Online agora' : `Visto ${selectedUser.lastActive}`}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Interface vazia quando nenhum resultado é encontrado
  const EmptyState = ({ type }: { type: 'search' | 'pending' }) => (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
        {type === 'search' ? (
          <Search className="h-6 w-6 text-white/40" />
        ) : (
          <UserCheck className="h-6 w-6 text-white/40" />
        )}
      </div>
      <h3 className="text-white/80 text-lg font-medium mb-2">
        {type === 'search' 
          ? searchQuery.trim() !== '' 
            ? "Nenhum resultado encontrado" 
            : "Comece a buscar pessoas"
          : "Sem solicitações pendentes"
        }
      </h3>
      <p className="text-white/50 text-sm max-w-xs">
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
  const FilterDropdown = () => {
    // Toggle para adicionar/remover filtro da lista de selecionados
    const toggleFilter = (filterName: string) => {
      setSelectedFilters(prev => {
        if (prev.includes(filterName)) {
          return prev.filter(f => f !== filterName);
        } else {
          return [...prev, filterName];
        }
      });
    };

    // Aplicar filtros e fechar dropdown
    const applyFilters = () => {
      performSearch(searchQuery);
      setShowFilterDropdown(false);
    };

    return (
      <div 
        className="absolute right-0 top-full mt-2 bg-[#0A2540] rounded-xl border border-white/10 shadow-xl z-30 w-56 overflow-hidden"
      >
        <div className="p-2">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-white text-xs px-2 py-1 font-medium">Filtrar por (múltiplos):</h4>
            <button 
              className="text-xs text-amber-400 hover:text-amber-300 px-2 py-1"
              onClick={() => setSelectedFilters([])}
            >
              Limpar
            </button>
          </div>
          <div className="mt-1 space-y-1">
            <div 
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-md ${selectedFilters.includes('online') ? 'bg-[#FF6B00]/20 text-[#FF6B00]' : 'text-white/70 hover:bg-white/5'}`}
              onClick={() => toggleFilter('online')}
              role="button"
            >
              <div className="flex items-center justify-center w-4 h-4">
                {selectedFilters.includes('online') ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <div className="w-3 h-3 border border-white/40 rounded-sm"></div>
                )}
              </div>
              <Bell className="h-4 w-4 ml-1" /> Online agora
            </div>
            <div 
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-md ${selectedFilters.includes('suggested') ? 'bg-[#FF6B00]/20 text-[#FF6B00]' : 'text-white/70 hover:bg-white/5'}`}
              onClick={() => toggleFilter('suggested')}
              role="button"
            >
              <div className="flex items-center justify-center w-4 h-4">
                {selectedFilters.includes('suggested') ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <div className="w-3 h-3 border border-white/40 rounded-sm"></div>
                )}
              </div>
              <Bookmark className="h-4 w-4 ml-1" /> Sugeridos
            </div>
            <div 
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-md ${selectedFilters.includes('recent') ? 'bg-[#FF6B00]/20 text-[#FF6B00]' : 'text-white/70 hover:bg-white/5'}`}
              onClick={() => toggleFilter('recent')}
              role="button"
            >
              <div className="flex items-center justify-center w-4 h-4">
                {selectedFilters.includes('recent') ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <div className="w-3 h-3 border border-white/40 rounded-sm"></div>
                )}
              </div>
              <Clock className="h-4 w-4 ml-1" /> Recentes
            </div>
          </div>

          <div className="border-t border-white/10 my-2"></div>

          <h4 className="text-white text-xs px-2 py-1 font-medium">Ordenar por:</h4>
          <div className="mt-1 space-y-1">
            <button 
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-md ${sortOrder === 'alphabetical' ? 'bg-[#FF6B00]/20 text-[#FF6B00]' : 'text-white/70 hover:bg-white/5'}`}
              onClick={() => { setSortOrder('alphabetical'); }}
            >
              Alfabética
            </button>
            <button 
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-md ${sortOrder === 'recent' ? 'bg-[#FF6B00]/20 text-[#FF6B00]' : 'text-white/70 hover:bg-white/5'}`}
              onClick={() => { setSortOrder('recent'); }}
            >
              Mais populares
            </button>
          </div>

          <div className="mt-3 flex justify-end">
            <Button
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] text-white hover:opacity-90 rounded-lg px-4"
              onClick={applyFilters}
            >
              Aplicar
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 bg-gradient-to-b from-[#0A2540] to-[#001427] border-white/10 overflow-hidden rounded-xl shadow-2xl backdrop-blur-lg">
        <div className="flex h-[85vh] max-h-[700px] overflow-hidden">
          {/* Painel principal */}
          <div className={`flex-1 p-6 ${selectedUser ? 'hidden md:block md:w-[55%]' : 'w-full'}`}>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] text-transparent bg-clip-text">
                    Adicionar amigos
                  </span>
                </h2>
                <p className="text-white/60 text-sm">Conecte-se com estudantes como você</p>
              </div>
              <button 
                className="text-white/60 hover:text-white p-2.5 rounded-full hover:bg-white/10 transition-all duration-300"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <Tabs defaultValue="buscar" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="w-full bg-white/5 backdrop-blur-md mb-6 p-1 rounded-xl">
                <TabsTrigger 
                  value="buscar" 
                  className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF9B50] data-[state=active]:text-white py-2.5 rounded-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <span>Buscar Pessoas</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="pendentes" 
                  className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF9B50] data-[state=active]:text-white py-2.5 rounded-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    <span>Solicitações</span>
                    {pendingRequests.filter(req => req.type === 'received').length > 0 && (
                      <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] flex items-center justify-center">
                        {pendingRequests.filter(req => req.type === 'received').length}
                      </span>
                    )}
                  </div>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="buscar" className="mt-0 focus-visible:outline-none">
                <div className="relative mb-6 flex items-center">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-white/60" />
                    </div>
                    <Input 
                      className="w-full pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FF6B00]/50 focus:ring-[#FF6B00]/30 rounded-xl py-6"
                      placeholder="Digite nome, e-mail ou @username"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    {isLoading && (
                      <div className="absolute inset-y-0 right-3 flex items-center">
                        <div className="h-4 w-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  {/* Botão de Perfis Salvos */}
                  <div className="ml-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className={`h-10 w-10 rounded-full ${filter === 'saved' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'}`}
                      onClick={() => {
                        setFilter(filter === 'saved' ? 'all' : 'saved');
                        performSearch(searchQuery);
                      }}
                      title="Mostrar perfis salvos"
                    >
                      <Bookmark className={`h-4 w-4 ${filter === 'saved' ? 'fill-amber-400' : ''}`} />
                    </Button>
                  </div>

                  {/* Botão de filtro */}
                  <div className="ml-2 relative">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    >
                      <Filter className="h-4 w-4" />
                    </Button>

                    {showFilterDropdown && <FilterDropdown />}
                  </div>
                </div>

                <div 
                  className="overflow-y-auto max-h-[420px] pr-2 custom-scrollbar"
                  ref={resultsContainerRef}
                >
                  {searchQuery.trim() === '' && (
                    <EmptyState type="search" />
                  )}

                  {searchQuery.trim() !== '' && filteredResults.length === 0 && !isLoading && (
                    <EmptyState type="search" />
                  )}

                  {filteredResults.map(user => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="pendentes" className="mt-0 focus-visible:outline-none">
                <div className="mb-4 bg-gradient-to-r from-[#072e4f]/50 to-[#001427]/50 p-3 rounded-lg">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-xs font-medium">recebidas</span>
                    Solicitações de amizade
                  </h3>
                </div>

                <div className="overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
                  {pendingRequests.filter(req => req.type === 'received').length === 0 && (
                    <EmptyState type="pending" />
                  )}

                  {pendingRequests
                    .filter(req => req.type === 'received')
                    .map(request => (
                      <PendingRequestCard key={request.id} request={request} layoutId={`request-${request.id}`} />
                    ))}
                </div>

                <div className="mt-6 mb-4 bg-gradient-to-r from-[#072e4f]/50 to-[#001427]/50 p-3 rounded-lg">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-xs font-medium">enviadas</span>
                    Solicitações pendentes
                  </h3>
                </div>

                <div className="overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
                  {pendingRequests.filter(req => req.type === 'sent').length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-white/5 rounded-xl">
                      <p className="text-white/60 text-sm">Você não enviou solicitações recentemente</p>
                    </div>
                  )}

                  {pendingRequests
                    .filter(req => req.type === 'sent')
                    .map(request => (
                      <PendingRequestCard key={request.id} request={request} layoutId={`sent-${request.id}`} />
                    ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="absolute bottom-4 left-6 right-6 text-white/40 text-xs flex justify-between">
              <p>Ao aceitar, você permitirá que o usuário veja seu conteúdo privado.</p>
              <button 
                className="hover:text-[#FF6B00] transition-colors"
                onClick={() => onOpenChange(false)}
              >
                Fechar
              </button>
            </div>
          </div>

          {/* Painel de perfil expandido */}
          {selectedUser && (
            <div 
              className={`${selectedUser ? 'block' : 'hidden'} border-l border-white/10 bg-gradient-to-br from-[#0A2540]/90 to-[#001427]/90 backdrop-blur-xl md:w-[45%] relative`}
            >
              <UserProfilePanel />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendsModal;