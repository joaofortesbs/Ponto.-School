
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, X, Eye, Lock, Unlock, ChevronLeft } from "lucide-react";

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

  // Simular busca
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    // Simulação de delay de busca
    const timer = setTimeout(() => {
      const filteredResults = mockUsers.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredResults);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
        className="bg-[#0A2540]/80 backdrop-blur-sm rounded-xl p-3 mb-3 hover:bg-[#0A2540]/90 transition-all duration-300 border border-white/10 shadow-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setSelectedUser(user)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] rounded-full opacity-75 blur-sm"></div>
            <Avatar className="h-12 w-12 border-2 border-transparent">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1">
            <h3 className="text-white font-bold">{user.name}</h3>
            <p className="text-[#64748B] text-sm">@{user.username}</p>
            <p className="text-white/80 text-xs line-clamp-1">{user.bio}</p>
          </div>
          
          <div className="flex flex-col gap-2 items-end">
            <span className="inline-flex items-center text-xs text-white/60 gap-1">
              {user.isPrivate ? (
                <>
                  <Lock className="h-3 w-3" /> Privado
                </>
              ) : (
                <>
                  <Unlock className="h-3 w-3" /> Público
                </>
              )}
            </span>
            
            {user.isPrivate ? (
              <Button 
                variant="secondary" 
                size="sm" 
                className={`${relation === 'requested' ? 'bg-white/20 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (relation !== 'requested') {
                    handleRelationAction(user.id, 'request');
                  }
                }}
                disabled={relation === 'requested'}
              >
                {relation === 'requested' ? 'Solicitado' : 'Solicitar'}
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                size="sm" 
                className={`${relation === 'following' ? 'bg-[#FF6B00] text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRelationAction(user.id, 'follow');
                }}
              >
                {relation === 'following' ? 'Seguindo' : 'Seguir'}
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
        className="bg-[#0A2540]/80 backdrop-blur-sm rounded-xl p-3 mb-3 hover:bg-[#0A2540]/90 transition-all duration-300 border border-white/10 shadow-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setSelectedUser(user)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] rounded-full opacity-75 blur-sm"></div>
            <Avatar className="h-12 w-12 border-2 border-transparent">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1">
            <h3 className="text-white font-bold">{user.name}</h3>
            <p className="text-[#64748B] text-sm">@{user.username}</p>
            <p className="text-white/80 text-xs">
              {type === 'received' 
                ? 'quer ser seu amigo' 
                : 'solicitação enviada'}
            </p>
          </div>
          
          {type === 'received' && (
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-white"
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
                className="bg-white/10 hover:bg-white/20 text-white"
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
            <span className="text-white/60 text-xs italic">Pendente</span>
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
        className="h-full overflow-y-auto py-6 px-4 flex flex-col"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Botão voltar para mobile */}
        <button 
          className="md:hidden absolute top-3 left-3 text-white p-2 rounded-full bg-black/20 hover:bg-black/40"
          onClick={() => setSelectedUser(null)}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        {/* Capa */}
        <div className="relative h-32 -mx-4 -mt-6 mb-4 overflow-hidden">
          {selectedUser.coverUrl ? (
            <img 
              src={selectedUser.coverUrl} 
              alt="Capa" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#001427] via-[#072e4f] to-[#0A2540]"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#001427]/90 to-transparent"></div>
        </div>
        
        {/* Avatar em destaque */}
        <div className="flex flex-col items-center -mt-16 mb-4">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] rounded-full opacity-90 blur-sm"></div>
            <Avatar className="h-24 w-24 border-4 border-[#0A2540] shadow-xl">
              <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
              <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        {/* Informações do perfil */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-1">{selectedUser.name}</h2>
          <p className="text-[#64748B] mb-3">@{selectedUser.username}</p>
          <p className="text-white/80 text-sm mb-4">{selectedUser.bio}</p>
          
          {selectedUser.favoriteSubject && (
            <div className="inline-flex items-center gap-2 bg-[#FF6B00]/10 text-[#FF6B00] text-sm px-3 py-1 rounded-full mb-4">
              <span className="text-[#FF6B00]">💡</span>
              {selectedUser.favoriteSubject}
            </div>
          )}
          
          {selectedUser.educationLevel && (
            <div className="text-white/60 text-xs mb-6">
              {selectedUser.educationLevel}
            </div>
          )}
          
          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xl font-bold text-white">{selectedUser.followersCount}</p>
              <p className="text-white/60 text-xs">Seguidores</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xl font-bold text-white">{selectedUser.friendsCount}</p>
              <p className="text-white/60 text-xs">Amigos</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xl font-bold text-white">{selectedUser.postsCount}</p>
              <p className="text-white/60 text-xs">Publicações</p>
            </div>
          </div>
          
          {/* Botões de ação */}
          {selectedUser.isPrivate ? (
            <Button 
              className={`w-full bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-white mb-3 ${relation === 'requested' ? 'bg-white/20 hover:bg-white/30' : ''}`}
              onClick={() => {
                if (relation !== 'requested') {
                  handleRelationAction(selectedUser.id, 'request');
                }
              }}
              disabled={relation === 'requested'}
            >
              {relation === 'requested' ? 'Solicitação enviada' : 'Solicitar amizade'}
            </Button>
          ) : (
            <Button 
              className={`w-full ${relation === 'following' ? 'bg-[#FF6B00] hover:bg-[#FF6B00]/80' : 'bg-white/10 hover:bg-white/20'} text-white mb-3`}
              onClick={() => handleRelationAction(selectedUser.id, 'follow')}
            >
              {relation === 'following' ? 'Seguindo' : 'Seguir'}
            </Button>
          )}
          
          <Button
            variant="outline"
            className="w-full bg-transparent border border-white/20 hover:bg-white/5 text-white"
            onClick={() => {
              // Aqui iria a navegação para o perfil completo
              onOpenChange(false);
            }}
          >
            Ver mais no perfil completo
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 bg-gradient-to-b from-[#0A2540] to-[#001427] border-white/10 overflow-hidden">
        <div className="flex h-[80vh] max-h-[650px] overflow-hidden">
          {/* Painel principal (60%) */}
          <div className={`flex-1 p-6 ${selectedUser ? 'hidden md:block md:w-[60%]' : 'w-full'}`}>
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Adicionar amigos</h2>
                <p className="text-white/60 text-sm">Conecte-se com estudantes como você</p>
              </div>
              <button 
                className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <Tabs defaultValue="buscar" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="w-full bg-white/5 mb-6">
                <TabsTrigger 
                  value="buscar" 
                  className="flex-1 data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white"
                >
                  🔍 Buscar Pessoas
                </TabsTrigger>
                <TabsTrigger 
                  value="pendentes" 
                  className="flex-1 data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white"
                  data-count={pendingRequests.filter(req => req.type === 'received').length}
                >
                  ⏳ Pendentes
                  {pendingRequests.filter(req => req.type === 'received').length > 0 && (
                    <span className="ml-2 bg-[#FF6B00] text-white text-xs px-1.5 py-0.5 rounded-full">
                      {pendingRequests.filter(req => req.type === 'received').length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="buscar" className="mt-0">
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-white/60" />
                  </div>
                  <Input 
                    className="w-full pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FF6B00]/50 focus:ring-[#FF6B00]/30"
                    placeholder="Digite nome, e-mail ou @username"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  
                  {isLoading && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                    </div>
                  )}
                </div>

                <div className="overflow-y-auto max-h-[350px] pr-2">
                  {searchResults.length === 0 && searchQuery.trim() !== '' && !isLoading && (
                    <div className="text-center py-10 text-white/60">
                      <p>Nenhum resultado encontrado para "{searchQuery}"</p>
                    </div>
                  )}
                  
                  {searchResults.length === 0 && searchQuery.trim() === '' && (
                    <div className="text-center py-10 text-white/60">
                      <p>Digite um nome ou @username para buscar</p>
                    </div>
                  )}
                  
                  {searchResults.map(user => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="pendentes" className="mt-0">
                <div className="mb-4">
                  <h3 className="text-white font-medium">Solicitações recebidas</h3>
                </div>
                
                <div className="overflow-y-auto max-h-[400px] pr-2">
                  {pendingRequests.filter(req => req.type === 'received').length === 0 && (
                    <div className="text-center py-10 text-white/60">
                      <p>Você não tem solicitações pendentes</p>
                    </div>
                  )}
                  
                  {pendingRequests
                    .filter(req => req.type === 'received')
                    .map(request => (
                      <PendingRequestCard key={request.id} request={request} />
                    ))}
                </div>
                
                <div className="mt-6 mb-4">
                  <h3 className="text-white font-medium">Solicitações enviadas</h3>
                </div>
                
                <div className="overflow-y-auto max-h-[200px] pr-2">
                  {pendingRequests.filter(req => req.type === 'sent').length === 0 && (
                    <div className="text-center py-6 text-white/60">
                      <p>Você não enviou solicitações</p>
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
                className="hover:text-white"
                onClick={() => onOpenChange(false)}
              >
                Fechar
              </button>
            </div>
          </div>
          
          {/* Painel de perfil (40%) - expandido quando um usuário é selecionado */}
          <AnimatePresence>
            {selectedUser && (
              <motion.div 
                className={`${selectedUser ? 'block' : 'hidden'} border-l border-white/10 bg-[#0A2540]/80 backdrop-blur-sm md:w-[40%] relative`}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                exit={{ width: 0 }}
                transition={{ duration: 0.3 }}
              >
                <UserProfilePanel />
                <button 
                  className="absolute top-3 right-3 md:block hidden text-white/60 hover:text-white p-1 rounded-full hover:bg-black/20"
                  onClick={() => setSelectedUser(null)}
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendsModal;
