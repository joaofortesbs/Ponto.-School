
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, X, Eye, Lock, Unlock, ChevronLeft, ArrowLeft, UserCheck, MapPin, BookOpen, Bookmark } from "lucide-react";

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
    educationLevel: 'Ensino Médio'
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
    educationLevel: 'Pré-Vestibular'
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
    educationLevel: 'Graduação'
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
    educationLevel: 'Graduação'
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
    educationLevel: 'Graduação'
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
  const [activeTab, setActiveTab] = useState("buscar");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<PendingRequestType[]>(mockPendingRequests);
  const [userRelations, setUserRelations] = useState<{[key: string]: 'none' | 'requested' | 'following'}>({});

  // Debounce search
  const debounce = (func: Function, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  // Simular busca com debounce
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim() === '') {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      // Simulação de delay de busca
      setTimeout(() => {
        const filteredResults = mockUsers.filter(user => 
          user.name.toLowerCase().includes(query.toLowerCase()) || 
          user.username.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filteredResults);
        setIsLoading(false);
      }, 500);
    }, 300),
    []
  );

  // Atualizar resultados quando a busca mudar
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

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

  const handleRelationAction = (userId: string, action: 'request' | 'follow' | 'accept' | 'reject') => {
    switch (action) {
      case 'request':
        setUserRelations(prev => ({...prev, [userId]: 'requested'}));
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

  // Renderizar card de usuário
  const UserCard = ({ user }: { user: UserType }) => {
    const relation = userRelations[user.id] || 'none';
    
    return (
      <motion.div 
        className="bg-gradient-to-br from-[#0c1a2b]/95 to-[#0c1a2b]/85 backdrop-blur-lg rounded-xl p-4 mb-3 hover:from-[#0c1a2b] hover:to-[#0c1a2b] transition-all duration-300 border border-white/10 shadow-xl hover:shadow-2xl group"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.99 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
            
            {/* Status indicator */}
            <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#0c1a2b] shadow-lg"></div>
          </div>
          
          <div className="flex-1 space-y-0.5">
            <h3 className="text-white font-bold text-base group-hover:text-[#FF6B00] transition-colors duration-300">{user.name}</h3>
            <p className="text-[#64748B] text-sm font-medium">@{user.username}</p>
            <p className="text-white/80 text-xs line-clamp-1">{user.bio}</p>
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
      </motion.div>
    );
  };

  // Renderizar card de solicitação pendente
  const PendingRequestCard = ({ request }: { request: PendingRequestType }) => {
    const { user, type } = request;
    
    return (
      <motion.div 
        className="bg-gradient-to-br from-[#0c1a2b]/95 to-[#0c1a2b]/85 backdrop-blur-lg rounded-xl p-4 mb-3 hover:from-[#0c1a2b] hover:to-[#0c1a2b] transition-all duration-300 border border-white/10 shadow-xl hover:shadow-2xl group"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.99 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={() => setSelectedUser(user)}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] rounded-full opacity-75 blur-md group-hover:opacity-100 group-hover:blur-sm transition-all duration-500"></div>
            <Avatar className="h-14 w-14 border-2 border-transparent">
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
      </motion.div>
    );
  };

  // Renderizar painel de perfil expandido
  const UserProfilePanel = () => {
    if (!selectedUser) return null;
    
    const relation = userRelations[selectedUser.id] || 'none';
    
    return (
      <motion.div
        className="h-full overflow-y-auto py-6 px-4 flex flex-col custom-scrollbar"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Botão voltar para mobile */}
        <button 
          className="md:hidden absolute top-4 left-4 text-white p-2 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md z-30 transition-all duration-300"
          onClick={() => setSelectedUser(null)}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        
        {/* Capa com efeito parallax */}
        <div className="relative h-36 -mx-4 -mt-6 mb-4 overflow-hidden rounded-t-xl">
          {selectedUser.coverUrl ? (
            <motion.div 
              className="absolute inset-0 w-full h-full"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src={selectedUser.coverUrl} 
                alt="Capa" 
                className="w-full h-full object-cover transition-transform duration-500"
              />
            </motion.div>
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#001427] via-[#072e4f] to-[#0A2540]">
              <motion.div 
                className="absolute inset-0 bg-[url('/images/pattern-grid.svg')] opacity-20"
                animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#001427]/95 to-transparent"></div>
          
          {/* Pequeno menu de ações na capa */}
          <div className="absolute top-3 right-3 flex gap-2 z-20">
            <motion.button 
              className="p-2 rounded-full bg-black/30 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/50 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bookmark className="h-4 w-4" />
            </motion.button>
            <motion.button 
              className="p-2 rounded-full bg-black/30 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/50 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Eye className="h-4 w-4" />
            </motion.button>
            <motion.button 
              className="md:flex hidden p-2 rounded-full bg-black/30 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/50 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedUser(null)}
            >
              <X className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
        
        {/* Avatar em destaque */}
        <div className="flex flex-col items-center -mt-16 mb-5">
          <motion.div
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
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
          </motion.div>
        </div>
        
        {/* Informações do perfil */}
        <div className="text-center space-y-4">
          <motion.div 
            className="space-y-1"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white">{selectedUser.name}</h2>
            <p className="text-[#64748B] text-sm font-medium">@{selectedUser.username}</p>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="px-6"
          >
            <p className="text-white/80 text-sm leading-relaxed">{selectedUser.bio}</p>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
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
          </motion.div>
          
          {/* Estatísticas */}
          <motion.div 
            className="grid grid-cols-3 gap-3 px-2 mt-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
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
          </motion.div>
          
          {/* Botões de ação */}
          <motion.div 
            className="space-y-3 px-2 mt-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
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
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      ✓
                    </motion.div>
                  </div>
                ) : 'Solicitar amizade'}
              </Button>
            ) : (
              <Button 
                className={`w-full rounded-xl ${
                  relation === 'following' 
                  ? 'bg-[#FF6B00] hover:bg-[#FF6B00]/90' 
                  : 'bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] hover:shadow-lg hover:shadow-[#FF6B00]/20'
                } text-white py-6 transition-all duration-300`}
                onClick={() => handleRelationAction(selectedUser.id, 'follow')}
              >
                {relation === 'following' ? (
                  <div className="flex items-center gap-2">
                    <span>Seguindo</span>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      ✓
                    </motion.div>
                  </div>
                ) : 'Seguir perfil'}
              </Button>
            )}
            
            <Button
              variant="outline"
              className="w-full rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white py-6 transition-all duration-300"
              onClick={() => {
                // Aqui iria a navegação para o perfil completo
                onOpenChange(false);
              }}
            >
              Ver perfil completo
            </Button>
          </motion.div>
          
          {/* Indicador de atividade */}
          <motion.div 
            className="mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-white/40 text-xs flex items-center justify-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Online agora
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  };
  
  // Interface vazia quando nenhum resultado é encontrado
  const EmptyState = ({ type }: { type: 'search' | 'pending' }) => (
    <motion.div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
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
    </motion.div>
  );

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
              <motion.button 
                className="text-white/60 hover:text-white p-2.5 rounded-full hover:bg-white/10 transition-all duration-300"
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            <Tabs defaultValue="buscar" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="w-full bg-white/5 backdrop-blur-md mb-6 p-1 rounded-xl">
                <TabsTrigger 
                  value="buscar" 
                  className="flex-1 data-[state=active]:bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] data-[state=active]:text-white py-2.5 rounded-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <span>Buscar Pessoas</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="pendentes" 
                  className="flex-1 data-[state=active]:bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] data-[state=active]:text-white py-2.5 rounded-lg transition-all duration-300"
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
                <div className="relative mb-6">
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

                <div className="overflow-y-auto max-h-[420px] pr-2 custom-scrollbar">
                  {searchResults.length === 0 && (searchQuery.trim() !== '' || !isLoading) && (
                    <EmptyState type="search" />
                  )}
                  
                  {searchResults.map(user => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="pendentes" className="mt-0 focus-visible:outline-none">
                <div className="mb-4">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-xs">recebidas</span>
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
                      <PendingRequestCard key={request.id} request={request} />
                    ))}
                </div>
                
                <div className="mt-6 mb-4">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-xs">enviadas</span>
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
                      <PendingRequestCard key={request.id} request={request} />
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
          <AnimatePresence>
            {selectedUser && (
              <motion.div 
                className={`${selectedUser ? 'block' : 'hidden'} border-l border-white/10 bg-gradient-to-br from-[#0A2540]/90 to-[#001427]/90 backdrop-blur-xl md:w-[45%] relative`}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                exit={{ width: 0 }}
                transition={{ duration: 0.3 }}
              >
                <UserProfilePanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendsModal;
