import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Plus,
  Search,
  BookOpen,
  Lightbulb,
  Target,
  Trophy,
  Star,
  Globe,
  Lock,
  UserPlus,
  MessageCircle,
  Calendar,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Settings,
  Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ThemeProvider";
import GroupCard from "../GroupCard";
import CreateGroupModal from "../CreateGroupModal";
import AddGroupModal from "../AddGroupModal";
import EntrarGrupoSuccessModal from "../EntrarGrupoSuccessModal";
import ChatSection from "@/components/turmas/group-detail/ChatSection";

// Componente para exibir membros do grupo
const MembersSection: React.FC<{ groupId: string }> = ({ groupId }) => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupCreatorId, setGroupCreatorId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('membro');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        console.log(`Iniciando carregamento de membros para grupo ${groupId}...`);

        // Verificar usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;
        setCurrentUserId(userId);

        if (!userId) {
          console.error('Usuário não autenticado');
          return;
        }

        console.log(`Usuário atual: ${userId}`);

        // Buscar dados do grupo para obter o criador_id
        const { data: groupData, error: groupError } = await supabase
          .from('grupos_estudo')
          .select('criador_id')
          .eq('id', groupId)
          .single();

        if (groupError) {
          console.error('Erro ao carregar dados do grupo:', groupError);
          return;
        }

        setGroupCreatorId(groupData?.criador_id || null);
        console.log(`Criador do grupo: ${groupData?.criador_id}`);

        // Verificar cargo do usuário atual
        let userRole = 'membro';
        if (groupData?.criador_id === userId) {
          userRole = 'owner';
        } else {
          const { data: memberData } = await supabase
            .from('membros_grupos')
            .select('cargo')
            .eq('grupo_id', groupId)
            .eq('user_id', userId)
            .single();

          if (memberData?.cargo) {
            userRole = memberData.cargo;
          }
        }
        setCurrentUserRole(userRole);
        console.log(`Cargo do usuário atual: ${userRole}`);

        // Buscar membros do grupo com seus cargos
        const { data: membersData, error: membersError } = await supabase
          .from('membros_grupos')
          .select('user_id, cargo')
          .eq('grupo_id', groupId);

        if (membersError) {
          console.error('Erro ao carregar membros:', membersError);
          return;
        }

        console.log(`Membros encontrados no grupo: ${membersData?.length || 0}`);

        // Coletar todos os IDs de usuários
        const allUserIds = new Set();
        const userRoles = new Map();

        // Adicionar membros da tabela membros_grupos
        if (membersData && membersData.length > 0) {
          membersData.forEach(m => {
            allUserIds.add(m.user_id);
            userRoles.set(m.user_id, m.cargo || 'membro');
          });
        }

        // Sempre incluir o criador na lista, mesmo que não esteja em membros_grupos
        if (groupData?.criador_id) {
          allUserIds.add(groupData.criador_id);
          userRoles.set(groupData.criador_id, 'owner');
        }

        console.log(`Total de usuários únicos: ${allUserIds.size}`);

        if (allUserIds.size === 0) {
          console.warn('Nenhum usuário encontrado para exibir');
          setMembers([]);
          return;
        }

        // Buscar dados dos perfis de todos os usuários
        const userIds = Array.from(allUserIds);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', userIds);

        if (profilesError) {
          console.error('Erro ao carregar perfis:', profilesError);
          return;
        }

        console.log(`Perfis carregados: ${profilesData?.length || 0}`);

        // Buscar sessões ativas para status online
        const now = new Date();
        const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000).toISOString();

        const { data: sessionsData } = await supabase
          .from('user_sessions')
          .select('user_id')
          .eq('grupo_id', groupId)
          .gte('last_active', thirtySecondsAgo);

        const onlineUsers = new Set(sessionsData?.map(s => s.user_id) || []);
        console.log(`Usuários online: ${onlineUsers.size}`);

        // Combinar dados de todos os usuários
        const allMembersWithProfiles = userIds.map(userId => {
          const profile = profilesData?.find(p => p.id === userId);
          const memberData = {
            id: userId,
            name: profile?.display_name || `Usuário ${userId.slice(0, 8)}`,
            avatar_url: profile?.avatar_url,
            isOnline: onlineUsers.has(userId),
            isCreator: userId === groupData?.criador_id,
            cargo: userRoles.get(userId) || 'membro'
          };
          console.log(`Usuário processado:`, memberData);
          return memberData;
        });

        console.log(`Total de usuários para exibir: ${allMembersWithProfiles.length}`);
        setMembers(allMembersWithProfiles);

      } catch (error) {
        console.error('Erro geral ao carregar membros:', error);
        // Retry em caso de erro
        setTimeout(() => {
          console.log('Tentando recarregar membros após erro...');
          loadMembers();
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      loadMembers();
    }
  }, [groupId]);

  // Funções placeholder para os ícones
  const inspectProfile = (userId: string) => {
    console.log(`Inspecionar perfil do usuário: ${userId}`);
    // TODO: Implementar modal de visualização de perfil
  };

  const promoteUser = (userId: string) => {
    console.log(`Promover usuário: ${userId}`);
    // TODO: Implementar funcionalidade de promoção
  };

  const removeUser = (userId: string) => {
    console.log(`Remover usuário: ${userId}`);
    // TODO: Implementar funcionalidade de remoção
  };

  if (loading) {
    return (
      <div className="h-full">
        <div className="bg-white dark:bg-[#1a2236] rounded-lg p-6 h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#001427] dark:text-white">Membros do Grupo</h3>
            <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white hover:from-[#FF8C40] hover:to-[#FF6B00]">
              <UserPlus className="w-4 h-4 mr-2" />
              Convidar Membros
            </Button>
          </div>
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-[#FF6B00]/30 border-t-[#FF6B00] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#778DA9] dark:text-gray-400">Carregando membros...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="bg-white dark:bg-[#1a2236] rounded-lg p-6 h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#001427] dark:text-white">
            Membros do Grupo ({members.length})
          </h3>
          <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white hover:from-[#FF8C40] hover:to-[#FF6B00]">
            <UserPlus className="w-4 h-4 mr-2" />
            Convidar Membros
          </Button>
        </div>

        {members.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
            {members.map((member) => {
              const isCurrentUser = member.id === currentUserId;
              const isCurrentUserAdminOrOwner = currentUserRole === 'admin' || currentUserRole === 'owner';

              console.log(`🎨 Renderizando card do membro:`, {
                id: member.id.slice(0, 8),
                name: member.name,
                isCurrentUser,
                isCurrentUserAdminOrOwner,
                currentUserRole,
                memberCargo: member.cargo,
                isCreator: member.isCreator
              });

              return (
                <div
                  key={member.id}
                  className={`relative group bg-white dark:bg-[#29335C]/50 rounded-lg p-4 border transition-all hover:shadow-lg ${
                    member.isCreator 
                      ? 'border-[#FF6B00] border-2 bg-gradient-to-br from-[#FF6B00]/5 to-[#FF8C40]/5' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/50'
                  }`}
                  style={{ minWidth: '200px', height: 'auto' }}
                >
                  {/* Badge do criador */}
                  {member.isCreator && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#FF6B00] rounded-full flex items-center justify-center z-10">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                  )}

                  {/* Ícones de ação */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                    {isCurrentUser ? (
                      // Próprio usuário: apenas ícone de inspecionar
                      <button
                        className="w-6 h-6 bg-[#FF6B00] rounded-full flex items-center justify-center hover:bg-[#FF8C40] transition-colors"
                        title="Inspecionar perfil"
                        onClick={(e) => {
                          e.stopPropagation();
                          inspectProfile(member.id);
                        }}
                      >
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                    ) : !isCurrentUserAdminOrOwner ? (
                      // Membro comum vendo outros: apenas ícone de inspecionar
                      <button
                        className="w-6 h-6 bg-[#FF6B00] rounded-full flex items-center justify-center hover:bg-[#FF8C40] transition-colors"
                        title="Inspecionar perfil"
                        onClick={(e) => {
                          e.stopPropagation();
                          inspectProfile(member.id);
                        }}
                      >
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                    ) : (
                      // Admin/dono vendo outros: três ícones
                      <>
                        <button
                          className="w-6 h-6 bg-[#FF6B00] rounded-full flex items-center justify-center hover:bg-[#FF8C40] transition-colors"
                          title="Inspecionar perfil"
                          onClick={(e) => {
                            e.stopPropagation();
                            inspectProfile(member.id);
                          }}
                        >
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                        <button
                          className="w-6 h-6 bg-[#FF6B00] rounded-full flex items-center justify-center hover:bg-[#FF8C40] transition-colors"
                          title="Promover/Gerenciar"
                          onClick={(e) => {
                            e.stopPropagation();
                            promoteUser(member.id);
                          }}
                        >
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </button>
                        <button
                          className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          title="Remover membro"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeUser(member.id);
                          }}
                        >
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 13H5v-2h14v2z"/>
                          </svg>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Conteúdo principal do card */}
                  <div className="flex items-center gap-3">
                    {/* Avatar com status online */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-[#FF6B00]/10 flex items-center justify-center">
                        {member.avatar_url ? (
                          <img 
                            src={member.avatar_url} 
                            alt={member.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback para avatar padrão se a imagem falhar
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `<span class="text-[#FF6B00] font-semibold text-lg">${member.name.charAt(0).toUpperCase()}</span>`;
                              }
                            }}
                          />
                        ) : (
                          <span className="text-[#FF6B00] font-semibold text-lg">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#1a2236] ${
                        member.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>

                    {/* Informações do usuário */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[#001427] dark:text-white text-sm truncate">
                        {member.name}
                        {member.isCreator && (
                          <span className="ml-2 text-[#FF6B00] text-xs font-bold">
                            DONO
                          </span>
                        )}
                        {!member.isCreator && member.cargo === 'admin' && (
                          <span className="ml-2 text-[#FF6B00] text-xs font-bold">
                            ADMIN
                          </span>
                        )}
                      </h4>
                      <p className={`text-xs ${member.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                        {member.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-16 h-16 mx-auto mb-4 text-[#FF6B00]/50" />
            <p className="text-[#778DA9] dark:text-gray-400">
              Nenhum membro encontrado neste grupo
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Tipos para os grupos
interface GrupoEstudo {
  id: string;
  nome: string;
  descricao?: string;
  tipo_grupo: string;
  disciplina_area?: string;
  topico_especifico?: string;
  tags?: string[];
  is_public?: boolean;
  is_visible_to_all?: boolean;
  is_visible_to_partners?: boolean;
  is_private?: boolean;
  criador_id: string;
  codigo_unico?: string;
  created_at: string;
}

const GruposEstudoView: React.FC = () => {
  const [currentView, setCurrentView] = useState("todos-grupos");
  const [searchTerm, setSearchTerm] = useState("");
  const [allGroups, setAllGroups] = useState<GrupoEstudo[]>([]);
  const [myGroups, setMyGroups] = useState<GrupoEstudo[]>([]);
  const [createdGroups, setCreatedGroups] = useState<GrupoEstudo[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [joinedGroupName, setJoinedGroupName] = useState("");
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [groupToLeave, setGroupToLeave] = useState<GrupoEstudo | null>(null);
  const [isGroupCreator, setIsGroupCreator] = useState(false);
  const [showGroupInterface, setShowGroupInterface] = useState(false);
  const [activeGroup, setActiveGroup] = useState<GrupoEstudo | null>(null); // Use GrupoEstudo type
  const [activeTab, setActiveTab] = useState('discussoes');
  const [groupCoverImage, setGroupCoverImage] = useState<string | null>(null);
  const [groupProfileImage, setGroupProfileImage] = useState<string | null>(null);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);

  // Função para validar autenticação do usuário
  const validateUserAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  };

  // Nova função para adesão direta a partir do botão
  const joinGroupDirectly = async (groupId: string, retryCount = 0, maxRetries = 3) => {
    try {
      console.log(`Tentativa ${retryCount + 1} de entrar no grupo ${groupId}...`);

      const userId = await validateUserAuth();
      if (!userId) {
        console.error('Usuário não autenticado.');
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive",
        });
        return;
      }

      console.log('Validando adesão ao grupo...');
      const { error: joinError } = await supabase
        .from('membros_grupos')
        .insert({ grupo_id: groupId, user_id: userId });

      if (joinError) {
        console.error('Erro ao associar usuário ao grupo:', joinError.message, joinError.details);
        if (retryCount < maxRetries) {
          console.log(`Tentando novamente em 1 segundo (tentativa ${retryCount + 2})...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return joinGroupDirectly(groupId, retryCount + 1, maxRetries);
        }
        toast({
          title: "Erro",
          description: "Erro ao entrar no grupo. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      console.log('Associação bem-sucedida. Atualizando Meus Grupos...');
      await loadMyGroups(); // Atualizar a grade "Meus Grupos"

      // Buscar nome do grupo para mostrar no modal de sucesso
      const { data: groupData } = await supabase
        .from('grupos_estudo')
        .select('nome')
        .eq('id', groupId)
        .single();

      if (groupData) {
        setJoinedGroupName(groupData.nome);
        setShowSuccessModal(true);
      }

      toast({
        title: "Sucesso",
        description: "Você entrou no grupo com sucesso!",
      });

    } catch (error) {
      console.error('Erro geral em joinGroupDirectly:', error);
      if (retryCount < maxRetries) {
        console.log(`Tentando novamente em 1 segundo (tentativa ${retryCount + 2})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return joinGroupDirectly(groupId, retryCount + 1, maxRetries);
      }
      toast({
        title: "Erro",
        description: "Erro ao processar adesão. Verifique o console.",
        variant: "destructive",
      });
    }
  };

  // Nova função para sair de um grupo
  const leaveGroup = async (groupId: string, retryCount = 0, maxRetries = 3) => {
    try {
      console.log(`Tentativa ${retryCount + 1} de sair do grupo ${groupId}...`);

      const userId = await validateUserAuth();
      if (!userId) {
        console.error('Usuário não autenticado.');
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive",
        });
        return;
      }

      console.log('Removendo usuário do grupo...');
      const { error: deleteError } = await supabase
        .from('membros_grupos')
        .delete()
        .eq('grupo_id', groupId)
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Erro ao sair do grupo:', deleteError.message, deleteError.details);
        if (retryCount < maxRetries) {
          console.log(`Tentando novamente em 1 segundo (tentativa ${retryCount + 2})...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return leaveGroup(groupId, retryCount + 1, maxRetries);
        }
        toast({
          title: "Erro",
          description: "Erro ao sair do grupo. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      console.log('Remoção bem-sucedida. Atualizando Meus Grupos...');
      await loadMyGroups(); // Atualizar a grade "Meus Grupos"

      toast({
        title: "Sucesso",
        description: "Você saiu do grupo com sucesso!",
      });

      // Fechar modal
      setShowLeaveModal(false);
      setGroupToLeave(null);

    } catch (error) {
      console.error('Erro geral em leaveGroup:', error);
      if (retryCount < maxRetries) {
        console.log(`Tentando novamente em 1 segundo (tentativa ${retryCount + 2})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return leaveGroup(groupId, retryCount + 1, maxRetries);
      }
      toast({
        title: "Erro",
        description: "Erro ao processar saída. Verifique o console.",
        variant: "destructive",
      });
    }
  };

  // Nova função para excluir completamente um grupo
  const deleteGroup = async (groupId: string, retryCount = 0, maxRetries = 3) => {
    try {
      console.log(`Tentativa ${retryCount + 1} de excluir o grupo ${groupId}...`);

      const userId = await validateUserAuth();
      if (!userId) {
        console.error('Usuário não autenticado.');
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive",
        });
        return;
      }

      console.log('Excluindo grupo e associações...');

      // Primeiro, excluir todos os membros do grupo
      const { error: deleteMembersError } = await supabase
        .from('membros_grupos')
        .delete()
        .eq('grupo_id', groupId);

      if (deleteMembersError) {
        console.error('Erro ao excluir membros do grupo:', deleteMembersError.message);
      }

      // Depois, excluir o grupo (só o criador pode excluir)
      const { error: deleteGroupError } = await supabase
        .from('grupos_estudo')
        .delete()
        .eq('id', groupId)
        .eq('criador_id', userId);

      if (deleteGroupError) {
        console.error('Erro ao excluir o grupo:', deleteGroupError.message, deleteGroupError.details);
        if (retryCount < maxRetries) {
          console.log(`Tentando novamente em 1 segundo (tentativa ${retryCount + 2})...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return deleteGroup(groupId, retryCount + 1, maxRetries);
        }
        toast({
          title: "Erro",
          description: "Erro ao excluir o grupo. Verifique o console.",
          variant: "destructive",
        });
        return;
      }

      console.log('Exclusão bem-sucedida. Atualizando grades...');
      await loadMyGroups(); // Atualizar Meus Grupos
      await loadAllGroups(); // Atualizar Todos os Grupos

      toast({
        title: "Sucesso",
        description: "O grupo foi excluído com sucesso!",
      });

      // Fechar modal
      setShowLeaveModal(false);
      setGroupToLeave(null);

    } catch (error) {
      console.error('Erro geral em deleteGroup:', error);
      if (retryCount < maxRetries) {
        console.log(`Tentando novamente em 1 segundo (tentativa ${retryCount + 2})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return deleteGroup(groupId, retryCount + 1, maxRetries);
      }
      toast({
        title: "Erro",
        description: "Erro ao processar exclusão. Verifique o console.",
        variant: "destructive",
      });
    }
  };

  // Função para mostrar modal de confirmação de saída
  const handleShowLeaveModal = async (group: GrupoEstudo) => {
    const userId = await validateUserAuth();
    if (!userId) {
      console.error('Usuário não autenticado.');
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se o usuário é o criador do grupo
    const isCreator = group.criador_id === userId;
    setIsGroupCreator(isCreator);
    setGroupToLeave(group);
    setShowLeaveModal(true);
  };

  // Carrega grupos visíveis para todos
  const loadAllGroups = async (retryCount = 0, maxRetries = 3) => {
    try {
      console.log(`Carregando view: ${currentView}`);
      console.log(`Tentativa ${retryCount + 1} de carregar grupos visíveis para todos...`);

      setLoading(true);

      const { data, error } = await supabase
        .from('grupos_estudo')
        .select(`
          id,
          nome,
          descricao,
          tipo_grupo,
          disciplina_area,
          topico_especifico,
          tags,
          is_public,
          is_visible_to_all,
          is_visible_to_partners,
          is_private,
          criador_id,
          codigo_unico,
          created_at
        `)
        .eq('is_visible_to_all', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar todos os grupos:', error);

        if (retryCount < maxRetries) {
          console.log(`Tentando novamente em 1 segundo (tentativa ${retryCount + 2})...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return loadAllGroups(retryCount + 1, maxRetries);
        }

        toast({
          title: "Erro",
          description: "Não foi possível carregar os grupos. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      console.log('Dados retornados do Supabase:', data);

      if (!data || data.length === 0) {
        console.warn('Nenhum grupo visível para todos encontrado.');
        setAllGroups([]);
        return;
      }

      setAllGroups(data);
      console.log(`Grade "Todos os Grupos" carregada com ${data.length} grupos visíveis.`);

    } catch (error) {
      console.error('Erro geral em loadAllGroups:', error);

      if (retryCount < maxRetries) {
        console.log(`Tentando novamente em 1 segundo (tentativa ${retryCount + 2})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return loadAllGroups(retryCount + 1, maxRetries);
      }

      toast({
        title: "Erro",
        description: "Erro ao carregar grupos. Tente recarregar a página.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar meus grupos (onde sou membro ou criador)
  const loadMyGroups = async (retryCount = 0, maxRetries = 3) => {
    try {
      console.log(`Tentativa ${retryCount + 1} de carregar meus grupos...`);
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado');
        return;
      }

      console.log('Carregando grupos onde sou membro ou criador...');

      // Buscar grupos onde sou criador
      const { data: createdGroups, error: createdError } = await supabase
        .from('grupos_estudo')
        .select(`
          id,
          nome,
          descricao,
          tipo_grupo,
          disciplina_area,
          topico_especifico,
          tags,
          is_public,
          is_visible_to_all,
          is_visible_to_partners,
          is_private,
          criador_id,
          codigo_unico,
          created_at
        `)
        .eq('criador_id', user.id)
        .order('created_at', { ascending: false });

      // Buscar grupos onde sou membro
      const { data: memberGroups, error: memberError } = await supabase
        .from('membros_grupos')
        .select(`
          grupos_estudo!inner(
            id,
            nome,
            descricao,
            tipo_grupo,
            disciplina_area,
            topico_especifico,
            tags,
            is_public,
            is_visible_to_all,
            is_visible_to_partners,
            is_private,
            criador_id,
            codigo_unico,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (createdError) {
        console.error('Erro ao carregar grupos criados:', createdError);
      }

      if (memberError) {
        console.error('Erro ao carregar grupos onde sou membro:', memberError);
      }

      if (createdError || memberError) {
        if (retryCount < maxRetries) {
          console.log(`Tentando novamente em 1 segundo (tentativa ${retryCount + 2})...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return loadMyGroups(retryCount + 1, maxRetries);
        }

        toast({
          title: "Erro",
          description: "Não foi possível carregar seus grupos.",
          variant: "destructive",
        });
        return;
      }

      // Combinar grupos criados e grupos onde sou membro
      const allMyGroups: GrupoEstudo[] = [];
      const seenIds = new Set();

      // Adicionar grupos criados
      if (createdGroups) {
        createdGroups.forEach(group => {
          if (!seenIds.has(group.id)) {
            allMyGroups.push(group);
            seenIds.add(group.id);
          }
        });
      }

      // Adicionar grupos onde sou membro
      if (memberGroups) {
        memberGroups.forEach(item => {
          const group = item.grupos_estudo;
          if (group && !seenIds.has(group.id)) {
            allMyGroups.push(group);
            seenIds.add(group.id);
          }
        });
      }

      console.log(`Meus grupos carregados: ${allMyGroups.length} grupos encontrados`);
      setMyGroups(allMyGroups);

    } catch (error) {
      console.error('Erro ao carregar meus grupos:', error);

      if (retryCount < maxRetries) {
        console.log(`Tentando novamente em 1 segundo (tentativa ${retryCount + 2})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return loadMyGroups(retryCount + 1, maxRetries);
      }

      toast({
        title: "Erro",
        description:"Erro ao carregar seus grupos. Tente recarregar a página.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Nova função para acessar um grupo
  const handleAccessGroup = async (group: GrupoEstudo) => {
    console.log('Acessando grupo:', group.nome);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      if (currentView === "todos-grupos") {
        // Para grupos visíveis a todos, usar a função joinGroupDirectly
        await joinGroupDirectly(group.id);
      } else {
        // Para grupos que o usuário já faz parte, chamar accessGroup
        await accessGroup(group.id);
      }
    } catch (error) {
      console.error('Erro ao acessar grupo:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao acessar o grupo",
        variant: "destructive"
      });
    }
  };

    // Nova função para acessar o grupo e substituir a interface
    const accessGroup = async (groupId: string) => {
    try {
      console.log(`Acessando grupo ${groupId}...`);

      const userId = await validateUserAuth();
      if (!userId) {
        console.error('Usuário não autenticado.');
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive"
        });
        return;
      }

      // Ocultar o cabeçalho de Minhas Turmas
      const headers = document.querySelectorAll('.groups-header, [data-testid="groups-header"], .turmas-header');
      if (headers.length > 0) {
        headers.forEach(header => {
          (header as HTMLElement).classList.add('hidden');
          (header as HTMLElement).classList.remove('visible');
        });
        console.log('Cabeçalho "Minhas Turmas" ocultado.');
      } else {
        console.warn('Cabeçalho não encontrado para ocultar.');
      }

      // Cache para nomes e imagens de perfil
      const userCache = new Map();
      try {
        const { data: memberIds } = await supabase
          .from('membros_grupos')
          .select('user_id')
          .eq('grupo_id', groupId);

        if (memberIds && memberIds.length > 0) {
          const { data: users } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url')
            .in('id', memberIds.map(m => m.user_id));

          users?.forEach(user => {
            userCache.set(user.id, {
              name: user.display_name || `Usuário ${user.id.slice(0, 5)}`,
              avatar_url: user.avatar_url || null
            });
          });
        }
      } catch (error) {
        console.error('Erro ao carregar cache de usuários:', error);
      }

          // Buscar dados do grupo
          const { data: groupData, error } = await supabase
              .from('grupos_estudo')
              .select('*')
              .eq('id', groupId)
              .single();

          if (error) {
              console.error('Erro ao buscar dados do grupo:', error);
              toast({
                  title: "Erro",
                  description: "Erro ao carregar dados do grupo.",
                  variant: "destructive"
              });
              return;
          }

          setActiveGroup(groupData);
          setShowGroupInterface(true);
          setActiveTab('discussoes');
          console.log(`Interface do grupo ${groupId} carregada com sucesso.`);

        // Função para carregar e exibir membros
      (window as any).loadMembers = async (groupId: string, userCache: Map<string, any>) => {
        try {
          const now = new Date();
          const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000).toISOString();

          // Carregar membros do grupo
          const { data: members } = await supabase
            .from('membros_grupos')
            .select('user_id')
            .eq('grupo_id', groupId);

          // Carregar sessões ativas (últimos 30 segundos)
          const { data: sessions } = await supabase
            .from('user_sessions')
            .select('user_id')
            .eq('grupo_id', groupId)
            .gte('last_active', thirtySecondsAgo);

          const onlineUsers = new Set(sessions?.map(s => s.user_id) || []);

          const membersGrid = document.getElementById('membros-grid');
          if (!membersGrid) return;

          membersGrid.innerHTML = '';

          members?.forEach(member => {
            const userData = userCache.get(member.user_id) || { 
              name: `Usuário ${member.user_id.slice(0, 5)}`, 
              avatar_url: null 
            };
            const isOnline = onlineUsers.has(member.user_id);

            const memberCard = document.createElement('div');
            memberCard.style.cssText = 'min-width: 200px; height: auto; background: #f9f9f9; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 15px; display: flex; align-items: center;';

            const avatarUrl = userData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=3498db&color=fff&size=50`;

            memberCard.innerHTML = `
              <img src="${avatarUrl}" alt="${userData.name}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; flex-shrink: 0;">
              <div style="margin-left: 10px; overflow: hidden;">
                <strong style="color: #333; font-size: 16px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${userData.name}</strong>
                <span style="color: ${isOnline ? '#2ecc71' : '#e74c3c'}; font-size: 14px;">${isOnline ? 'Online' : 'Offline'}</span>
              </div>
            `;
            membersGrid.appendChild(memberCard);
          });

          console.log(`Membros do grupo ${groupId} carregados com sucesso. Total: ${members?.length || 0}`);

        } catch (error) {
          console.error('Erro ao carregar membros:', error.message, error.stack);

          // Retry após 2 segundos em caso de erro
          setTimeout(() => {
            (window as any).loadMembers(groupId, userCache);
          }, 2000);
        }
      };

      // Função para alternar entre seções
      (window as any).switchSection = (section: string, groupId: string) => {
        const sections = ['discussoes', 'membros'];

        sections.forEach(s => {
          const content = document.getElementById(`${s}-content`);
          const button = document.querySelector(`button[onclick*="switchSection('${s}'"]`) as HTMLElement;

          if (content) {
            content.style.display = s === section ? 'block' : 'none';
          }

          if (button) {
            button.style.background = s === section ? '#3498db' : '#ddd';
            button.style.color = s === section ? 'white' : '#666';
          }
        });

        // Se a seção de membros foi selecionada, carregar os membros
        if (section === 'membros') {
          (window as any).loadMembers(groupId, userCache);
        }
      };

          const groupInterface = document.getElementById('group-interface');
          if (!groupInterface) return;

          groupInterface.innerHTML = `
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
          <div class="mini-sections">
            <button class="active" style="background: #3498db; color: white; border: none; padding: 5px 10px; margin-right: 5px; border-radius: 5px;" onclick="switchSection('discussoes', '${groupId}')">Discussões</button>
            <button style="background: #ddd; color: #666; border: none; padding: 5px 10px; margin-right: 5px; border-radius: 5px;" onclick="switchSection('membros', '${groupId}')">Membros</button>
            <button disabled style="background: #ddd; color: #666; border: none; padding: 5px 10px; margin-right: 5px; border-radius: 5px;">Tarefas</button>
            <button disabled style="background: #ddd; color: #666; border: none; padding: 5px 10px; margin-right: 5px; border-radius: 5px;">Configurações</button>
            <button disabled style="background: #ddd; color: #666; border: none; padding: 5px 10px; margin-right: 5px; border-radius: 5px;">Notificações</button>
          </div>
          <div style="display: flex; align-items: center;">
            <span id="online-count" style="margin-right: 10px; color: #2ecc71;">Online: <span id="online-number">0</span></span>
            <button id="search-icon" style="background: none; border: none; cursor: pointer; margin-right: 10px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            <button id="menu-icon" style="background: none; border: none; cursor: pointer;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>
          </div>
        </div>
        <div id="discussions-content" style="margin-top: 20px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; min-height: 200px; display: block;">
          <div id="chat-messages" style="display: flex; flex-direction: column-reverse;"></div>
        </div>
        <div id="membros-content" style="margin-top: 20px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; min-height: 200px; display: none;">
          <div id="membros-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; padding: 10px;"></div>
        </div>
        <div style="margin-top: 10px; display: flex; align-items: center;">
          <input id="chat-input" type="text" placeholder="Digite sua mensagem..." style="flex-grow: 1; padding: 5px; border: 1px solid #ccc; border-radius: 5px; margin-right: 5px;">
          <button onclick="sendMessage('${groupId}')" style="background: #2ecc71; color: white; border: none; padding: 5px 10px; border-radius: 5px;">Enviar</button>
        </div>
        <div id="search-bar" style="display: none; margin-top: 10px;">
          <input id="search-input" type="text" placeholder="Pesquisar mensagens..." style="width: 200px; padding: 5px; border: 1px solid #ccc; border-radius: 5px;">
          <button onclick="hideSearchBar()" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 5px; margin-left: 5px;">Fechar</button>
        </div>
      `;

      // Configurar Realtime para chat
      const channel = supabase
        .channel(`chat-${groupId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'mensagens', 
          filter: `grupo_id=eq.${groupId}` 
        }, (payload) => {
          addMessageToChat(payload.new, userCache);
        })
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'user_sessions', 
          filter: `grupo_id=eq.${groupId}` 
        }, () => {
          updateOnlineCount(groupId);
          // Atualizar status dos membros se estiver na seção membros
          const membersContent = document.getElementById('membros-content');
          if (membersContent && membersContent.style.display !== 'none') {
            (window as any).loadMembers(groupId, userCache);
          }
        })
        .on('postgres_changes', { 
          event: 'DELETE', 
          schema: 'public',
          table: 'user_sessions',
          filter: `grupo_id=eq.${groupId}`
        }, () => {
          updateOnlineCount(groupId);
          // Atualizar status dos membros se estiver na seção membros
          const membersContent = document.getElementById('membros-content');
          if (membersContent && membersContent.style.display !== 'none') {
            (window as any).loadMembers(groupId, userCache);
          }
        })
        .subscribe(async (status) => {
          console.log(`Realtime status: ${status}`);
          if (status === 'SUBSCRIBED') {
            await updateOnlineCount(groupId);
          }
        });

        // Salvar referência ao canal para limpeza posterior
        (window as any).currentChannel = channel;

      console.log(`Interface do grupo ${groupId} carregada com chat configurado.`);

    } catch (error) {
      console.error('Erro ao acessar grupo:', error.message, error.stack);
      toast({
          title: "Erro",
          description: "Erro ao acessar o grupo. Verifique o console.",
          variant: "destructive"
        });

       // Retry ao restaurar o cabeçalho em caso de erro
       const headers = document.querySelectorAll('.groups-header, [data-testid="groups-header"], .turmas-header');
       if (headers.length > 0) {
         headers.forEach(header => {
           (header as HTMLElement).classList.remove('hidden');
           (header as HTMLElement).classList.add('visible');
         });
         console.log('Cabeçalho restaurado após erro.');
       }
    }
  };

  // Função para fazer upload da imagem de capa
  const handleCoverImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setGroupCoverImage(result);
        // Aqui você pode adicionar lógica para salvar no Supabase Storage
        console.log('Imagem de capa selecionada:', file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // Função para fazer upload da imagem de perfil
  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setGroupProfileImage(result);
        // Aqui você pode adicionar lógica para salvar no Supabase Storage
        console.log('Imagem de perfil selecionada:', file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // Função para voltar à interface original
  const returnToGroups = () => {
      try {
        console.log('Retornando para a lista de grupos...');

        // Restaurar o cabeçalho de Minhas Turmas
        const headers = document.querySelectorAll('.groups-header, [data-testid="groups-header"], .turmas-header');
        if (headers.length > 0) {
          headers.forEach(header => {
            (header as HTMLElement).classList.remove('hidden');
            (header as HTMLElement).classList.add('visible');
          });
          console.log('Cabeçalho "Minhas Turmas" restaurado.');
        } else {
          console.warn('Cabeçalho não encontrado para restaurar.');
        }

        setShowGroupInterface(false);
        setActiveGroup(null);
        setActiveTab('discussoes');
        loadMyGroups();
        loadAllGroups();
      } catch (error) {
        console.error('Erro ao retornar para grupos:', error);
        toast({
          title: "Erro",
          description: "Erro ao retornar. Tente novamente.",
          variant: "destructive",
        });
      }
    };

  // Handlers para os modals
  const handleCreateGroup = (formData: any) => {
    console.log('Grupo criado, recarregando listas...');
    // Recarregar a lista após criação
    if (currentView === "todos-grupos") {
      loadAllGroups();
    } else if (currentView === "meus-grupos") {
      loadMyGroups();
    }
    setShowCreateModal(false);
  };

  const handleGroupAdded = () => {
    console.log('Grupo adicionado via código, recarregando Meus Grupos...');
    // Recarregar especificamente "Meus Grupos" após adicionar grupo via código
    loadMyGroups();

    // Se estiver na view "meus-grupos", recarregar também
    if (currentView === "meus-grupos") {
      loadMyGroups();
    }

    setShowAddModal(false);

    toast({
      title: "Sucesso",
      description: "Grupo adicionado com sucesso! Verifique em 'Meus Grupos'.",
    });
  };

  // Efeito para carregar dados baseado na view atual
  useEffect(() => {
    console.log('Carregando view:', currentView);

    if (currentView === "todos-grupos") {
      loadAllGroups();
    } else if (currentView === "meus-grupos") {
      loadMyGroups();
    }
  }, [currentView]);

  // Carregar dados na inicialização
  useEffect(() => {
    loadAllGroups();
  }, []);

  // Filtrar grupos baseado no termo de busca
  const filteredGroups = () => {
    let groups = [];

    if (currentView === "todos-grupos") {
      groups = allGroups;
    } else if (currentView === "meus-grupos") {
      groups = myGroups;
    }

    if (!searchTerm) return groups;

    return groups.filter(group => 
      group.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.disciplina_area?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Converter grupo para formato do GroupCard
  const convertToGroupCardFormat = (group: GrupoEstudo) => ({
    id: group.id,
    nome: group.nome,
    disciplina: group.disciplina_area || group.tipo_grupo || "Geral",
    descricao: group.descricao || "Sem descrição disponível",
    membros: 1, // Placeholder - você pode buscar o número real de membros se necessário
    proximaReuniao: undefined,
    tags: group.tags || [],
    privacidade: group.is_private ? "privado" : group.is_visible_to_all ? "publico" : "restrito",
    icone: <BookOpen className="h-6 w-6 text-[#FF6B00]" />
  });

  const handleGroupClick = (group: GrupoEstudo) => {
    handleAccessGroup(group);
  };

    // Renderizar interface do grupo se estiver ativa
    if (showGroupInterface && activeGroup) {
      return (
          <div className="w-full h-screen bg-[#f7f9fa] dark:bg-[#001427] flex flex-col transition-colors duration-300">
              {/* Banner de Capa do Grupo */}
              <div className="px-6 pb-0 relative">
                  <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="relative h-64 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] overflow-hidden rounded-2xl"
                  >
                      {/* Imagem de capa ou placeholder */}
                      {groupCoverImage ? (
                          <div className="w-full h-full relative rounded-2xl overflow-hidden">
                              <img 
                                  src={groupCoverImage} 
                                  alt="Capa do grupo" 
                                  className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20"></div>
                              <button
                                  onClick={() => document.getElementById('cover-upload')?.click()}
                                  className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all backdrop-blur-sm"
                              >
                                  Alterar Capa
                              </button>
                          </div>
                      ) : (
                          <button
                              onClick={() => document.getElementById('cover-upload')?.click()}
                              className="w-full h-full bg-gradient-to-br from-[#FF6B00]/20 to-[#FF8C40]/20 flex items-center justify-center hover:from-[#FF6B00]/30 hover:to-[#FF8C40]/30 transition-all duration-300 rounded-2xl"
                          >
                              <div className="text-center text-white/80">
                                  <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                      </svg>
                                  </div>
                                  <p className="text-sm font-medium">Adicionar Imagem de Capa</p>
                                  <p className="text-xs opacity-75">Clique para personalizar</p>
                              </div>
                          </button>
                      )}

                      {/* Input escondido para upload da capa */}
                      <input
                          id="cover-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageUpload}
                          className="hidden"
                      />

                      {/* Botão voltar sobreposto */}
                      <div className="absolute top-4 left-4 z-10">
                          <Button
                              onClick={returnToGroups}
                              variant="outline"
                              size="sm"
                              className="bg-black/20 border-white/30 text-white hover:bg-black/30 backdrop-blur-sm font-montserrat"
                          >
                              <ArrowLeft className="w-4 h-4 mr-2" />
                              Voltar
                          </Button>
                      </div>

                  </motion.div>
                  {/* Imagem de perfil do grupo - posicionada metade dentro e metade fora da capa */}
                  <div className="absolute -bottom-16 left-6 z-30">
                      <div className="relative">
                          <div className="w-32 h-32 rounded-full bg-[#f7f9fa] dark:bg-[#001427] p-1 shadow-2xl">
                              {groupProfileImage ? (
                                  <button
                                      onClick={() => document.getElementById('profile-upload')?.click()}
                                      className="w-full h-full rounded-full overflow-hidden border-2 border-[#f7f9fa] dark:border-[#001427] hover:scale-105 transition-all duration-300"
                                  >
                                      <img 
                                          src={groupProfileImage} 
                                          alt="Perfil do grupo" 
                                          className="w-full h-full object-cover"
                                      />
                                  </button>
                              ) : (
                                  <button
                                      onClick={() => document.getElementById('profile-upload')?.click()}
                                      className="w-full h-full rounded-full bg-gradient-to-br from-[#FF6B00]/20 to-[#FF8C40]/20 flex items-center justify-center border-4 border-[#f7f9fa] dark:border-[#001427] cursor-pointer hover:from-[#FF6B00]/30 hover:to-[#FF8C40]/30 transition-all duration-300"
                                  >
                                      <div className="text-center text-[#FF6B00]">
                                          <svg className="w-10 h-10 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                          </svg>
                                          <span className="text-sm font-medium">Foto</span>
                                      </div>
                                  </button>
                              )}
                          </div>

                          {/* Inputhiddido para upload do perfil */}
                          <input
                              id="profile-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleProfileImageUpload}
                              className="hidden"
                          />
                      </div>
                  </div>
              </div>

              {/* Informações do grupo */}
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="px-6 pt-20 pb-4"
              >
                  <div className="flex items-start justify-between">
                      <div className="flex-1">
                          <h2 className="text-2xl font-bold text-[#001427] dark:text-white bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent font-montserrat mb-2">
                              {activeGroup.nome}
                          </h2>
                          {activeGroup.descricao && (
                              <p className="text-[#778DA9] dark:text-gray-400 text-sm font-open-sans mb-3">
                                  {activeGroup.descricao}
                              </p>
                          )}
                          <div className="flex items-center gap-3">
                              {activeGroup.disciplina_area && (
                                  <span className="px-3 py-1 bg-[#FF6B00]/10 text-[#FF6B00] rounded-full text-xs font-medium">
                                      {activeGroup.disciplina_area}
                                  </span>
                              )}
                              <span className="flex items-center gap-1 text-[#778DA9] dark:text-gray-400 text-xs">
                                  <Users className="w-3 h-3" />
                                  1 membro
                              </span>
                          </div>
                      </div>
                  </div>
              </motion.div>

              {/* Mini-seções */}
              <div className="flex items-center gap-4 px-6 pb-4 border-b border-[#FF6B00]/10">
                  <Button
                      variant={activeTab === 'discussoes' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('discussoes')}
                      className={`${activeTab === 'discussoes' ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white' : 'border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10'} font-montserrat`}
                  >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Discussões
                  </Button>
                  <Button
                      variant={activeTab === 'membros' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('membros')}
                      className={`${activeTab === 'membros' ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white' : 'border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10'} font-montserrat`}
                  >
                      <Users className="w-4 h-4 mr-2" />
                      Membros
                  </Button>
                  <Button
                      variant={activeTab === 'eventos' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('eventos')}
                      className={`${activeTab === 'eventos' ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white' : 'border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10'} font-montserrat`}
                  >
                      <Calendar className="w-4 h-4 mr-2" />
                      Eventos
                  </Button>
                  <Button
                      variant="outline"
                      size="sm"
                      className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 font-montserrat"
                  >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Materiais
                  </Button>
                  <Button
                      variant={activeTab === 'sobre' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('sobre')}
                      className={`${activeTab === 'sobre' ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white' : 'border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10'} font-montserrat`}
                  >
                      <Info className="w-4 h-4 mr-2" />
                      Sobre
                  </Button>
              </div>

              {/* Conteúdo da aba ativa - flex-1 para ocupar espaço restante */}
              <div className="flex-1 px-6 pb-6 min-h-0">
                  {activeTab === 'discussoes' && (
                      <div className="h-full">
                          <ChatSection 
                            groupId={activeGroup.id}
                          />
                      </div>
                  )}
                  {activeTab === 'membros' && (
                      <MembersSection groupId={activeGroup.id} />
                  )}
                  {activeTab === 'eventos' && (
                      <div className="h-full">
                          <div className="bg-white dark:bg-[#1a2236] rounded-lg p-6 h-full">
                              <div className="flex items-center justify-between mb-6">
                                  <h3 className="text-xl font-bold text-[#001427] dark:text-white">Eventos do Grupo</h3>
                                  <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white hover:from-[#FF8C40] hover:to-[#FF6B00]">
                                      <Plus className="w-4 h-4 mr-2" />
                                      Criar Evento
                                  </Button>
                              </div>
                              <div className="text-center py-8">
                                  <Calendar className="w-16 h-16 mx-auto mb-4 text-[#FF6B00]/50" />
                                  <p className="text-[#778DA9] dark:text-gray-400 mb-2">
                                      Nenhum evento agendado
                                  </p>
                                  <p className="text-sm text-[#778DA9] dark:text-gray-400">
                                      Crie eventos para organizar encontros e atividades do grupo
                                  </p>
                              </div>
                          </div>
                      </div>
                  )}
                  {activeTab === 'sobre' && (
                      <div className="h-full">
                          <div className="bg-white dark:bg-[#1a2236] rounded-lg p-6 h-full">
                              <div className="flex items-center justify-between mb-6">
                                  <h3 className="text-xl font-bold text-[#001427] dark:text-white">Sobre o Grupo</h3>
                              </div>
                              <div className="space-y-6">
                                  <div>
                                      <h4 className="text-lg font-semibold text-[#001427] dark:text-white mb-3">Descrição</h4>
                                      <p className="text-[#778DA9] dark:text-gray-400 leading-relaxed">
                                          {activeGroup.descricao || "Este grupo não possui uma descrição detalhada ainda."}
                                      </p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-6">
                                      <div>
                                          <h4 className="text-lg font-semibold text-[#001427] dark:text-white mb-3">Informações</h4>
                                          <div className="space-y-3">
                                              <div className="flex justify-between">
                                                  <span className="text-[#778DA9] dark:text-gray-400">Tipo:</span>
                                                  <span className="text-[#001427] dark:text-white font-medium">{activeGroup.tipo_grupo}</span>
                                              </div>
                                              <div className="flex justify-between">
                                                  <span className="text-[#778DA9] dark:text-gray-400">Área:</span>
                                                  <span className="text-[#001427] dark:text-white font-medium">{activeGroup.disciplina_area}</span>
                                              </div>
                                              <div className="flex justify-between">
                                                  <span className="text-[#778DA9] dark:text-gray-400">Criado em:</span>
                                                  <span className="text-[#001427] dark:text-white font-medium">
                                                      {new Date(activeGroup.created_at).toLocaleDateString('pt-BR')}
                                                  </span>
                                              </div>
                                          </div>
                                      </div>
                                      <div>
                                          <h4 className="text-lg font-semibold text-[#001427] dark:text-white mb-3">Tags</h4>
                                          <div className="flex flex-wrap gap-2">
                                              {activeGroup.tags && activeGroup.tags.length > 0 ? (
                                                  activeGroup.tags.map((tag, index) => (
                                                      <span
                                                          key={index}
                                                          className="px-3 py-1 bg-[#FF6B00]/10 text-[#FF6B00] rounded-full text-sm font-medium"
                                                      >
                                                          {tag}
                                                      </span>
                                                  ))
                                              ) : (
                                                  <span className="text-[#778DA9] dark:text-gray-400 text-sm">
                                                      Nenhuma tag definida
                                                  </span>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}
                  {/* Conteúdo das outras abas aqui */}
              </div>
          </div>
      );
  }

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 space-y-6 transition-colors duration-300">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] flex items-center justify-center shadow-md">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#001427] dark:text-white bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent font-montserrat">
              Grupos de Estudos
            </h1>
            <p className="text-[#778DA9] dark:text-gray-400 text-sm font-open-sans">
              Conecte-se com outros estudantes e acelere seu aprendizado
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowAddModal(true)}
            variant="outline"
            className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 font-montserrat"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-montserrat"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Novo Grupo
          </Button>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant={currentView === "todos-grupos" ? "default" : "outline"}
          onClick={() => setCurrentView("todos-grupos")}
          className={`${
            currentView === "todos-grupos"
              ? "bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white"
              : "border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
          } font-montserrat`}
        >
          <Globe className="h-4 w-4 mr-2" />
          Todos os Grupos
        </Button>

        <Button
          variant={currentView === "meus-grupos" ? "default" : "outline"}
          onClick={() => setCurrentView("meus-grupos")}
          className={`${
            currentView === "meus-grupos"
              ? "bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white"
              : "border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
          } font-montserrat`}
        >
          <Users className="h-4 w-4 mr-2" />
          Meus Grupos
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar grupos por nome, descrição ou área..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-[#FF6B00]/20 focus:border-[#FF6B00] font-open-sans"
        />
      </div>

      {/* Groups Grid */}
      <div id="all-groups" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-[#FF6B00]/30 border-t-[#FF6B00] rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Carregando grupos...</p>
              </div>
            </div>
          ) : filteredGroups().length > 0 ? (
            filteredGroups().map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <GroupCard
                  group={convertToGroupCardFormat(group)}
                  onClick={() => handleGroupClick(group)}
                  view={currentView}
                  onLeave={currentView === "meus-grupos" ? () => handleShowLeaveModal(group) : undefined}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                {currentView === "todos-grupos" ? "Nenhum grupo público encontrado" : "Você ainda não faz parte de grupos"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {currentView === "todos-grupos" 
                  ? "Tente ajustar sua busca ou volte mais tarde." 
                  : "Comece criando seu primeiro grupo ou entre em um grupo usando um código."}
              </p>
              {currentView === "meus-grupos" && (
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-montserrat"
                >
                  <Plus className="h-4 w-4 mr-1" /> Criar Grupo
                </Button>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGroup}
      />

      <AddGroupModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onGroupAdded={handleGroupAdded}
      />

      <EntrarGrupoSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        groupName={joinedGroupName}
      />

      {/* Modal de Confirmação de Saída */}
      {showLeaveModal && groupToLeave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 shadow-xl"
          >
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Confirmar Ação
              </h3>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {isGroupCreator 
                  ? `Você é o criador do grupo "${groupToLeave.nome}". Deseja sair ou excluir o grupo?`
                  : `Tem certeza que deseja sair do grupo "${groupToLeave.nome}"?`
                }
              </p>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowLeaveModal(false);
                    setGroupToLeave(null);
                    setIsGroupCreator(false);
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>

                <Button
                  onClick={() => leaveGroup(groupToLeave.id)}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Sair do Grupo
                </Button>

                {isGroupCreator && (
                  <Button
                    onClick={() => deleteGroup(groupToLeave.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    Excluir Grupo
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GruposEstudoView;