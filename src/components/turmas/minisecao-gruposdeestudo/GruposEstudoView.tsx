import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Users, ChevronRight, Settings, Eye, X, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CreateGroupModal from "../CreateGroupModal";
import AddGroupModal from "../AddGroupModal";
import GroupDetailInterface from "../group-detail";
import "@/styles/grupo-estudo-card.css";

interface Topic {
  name: string;
  icon: string;
}

const topics = [
  { name: 'Matemática', icon: '📊' },
  { name: 'Língua Portuguesa', icon: '📝' },
  { name: 'Física', icon: '🔬' },
  { name: 'Química', icon: '⚗️' },
  { name: 'Biologia', icon: '🧬' },
  { name: 'Geografia', icon: '🌍' },
  { name: 'História', icon: '📚' },
  { name: 'Filosofia', icon: '🤔' },
  { name: 'Sociologia', icon: '👥' },
  { name: 'Arte', icon: '🎨' },
  { name: 'Inglês', icon: '🇬🇧' },
  { name: 'Educação Financeira', icon: '💰' },
  { name: 'Redação', icon: '✍️' },
  { name: 'Engenharia', icon: '⚙️' },
  { name: 'Robótica', icon: '🤖' },
  { name: 'Outros', icon: '📖' }
];

interface GroupMember {
  id: string;
  user_id: string;
  joined_at: string;
  email?: string;
  display_name?: string;
}

interface GroupDetails {
  id: string;
  nome: string;
  descricao?: string;
  topico_nome?: string;
  created_at: string;
  cor: string;
  is_publico: boolean;
  codigo_unico: string;
  user_id: string;
  membros: number;
}

interface Group {
  id: string;
  nome: string;
  descricao: string;
  user_id: string;
  codigo_unico: string;
  is_publico: boolean;
  is_visible_to_all: boolean;
  is_visible_to_partners: boolean;
  tipo_grupo: string;
  disciplina_area: string;
  topico_especifico: string;
  tags: string[];
  created_at: string;
  membros?: number;
  isMember?: boolean;
}

export default function GruposEstudoView() {
  const [currentView, setCurrentView] = useState<'my-groups' | 'public-groups'>('my-groups');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [meusGrupos, setMeusGrupos] = useState<GroupDetails[]>([]);
  const [gruposPublicos, setGruposPublicos] = useState<GroupDetails[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedGroupDetails, setSelectedGroupDetails] = useState<GroupDetails | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [userGroupIds, setUserGroupIds] = useState<string[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [showGroupInterface, setShowGroupInterface] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedGroupName, setSelectedGroupName] = useState<string>('');

  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadGroups();
    }
  }, [currentUser, currentView, searchTerm, selectedTopic, activeFilters]);

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }
      setCurrentUser(user);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar autenticação",
        variant: "destructive"
      });
    }
  };

  const loadGroups = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      if (currentView === 'my-groups') {
        await loadMeusGrupos();
      } else {
        await loadGruposPublicos();
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar grupos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMeusGrupos = async () => {
    try {
      // First get memberships
      const { data: memberships } = await supabase
        .from('membros_grupos')
        .select('grupo_id')
        .eq('user_id', currentUser.id);

      const groupIds = memberships?.map(m => m.grupo_id) || [];

      let query = supabase.from('grupos_estudo').select('*');

      if (groupIds.length > 0) {
        query = query.or(`user_id.eq.${currentUser.id},id.in.(${groupIds.join(',')})`);
      } else {
        query = query.eq('user_id', currentUser.id);
      }

      if (searchTerm) {
        query = query.ilike('nome', `%${searchTerm}%`);
      }
      if (selectedTopic) {
        query = query.eq('topico_nome', selectedTopic);
      }

      // Apply additional filters
      if (activeFilters.includes('mais-recentes')) {
        query = query.order('created_at', { ascending: false });
      } else if (activeFilters.includes('mais-antigos')) {
        query = query.order('created_at', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      if (activeFilters.includes('publicos')) {
        query = query.eq('is_publico', true);
      } else if (activeFilters.includes('privados')) {
        query = query.eq('is_publico', false);
      }

      const { data, error } = await query;
      if (error) throw error;

      setMeusGrupos(data || []);
    } catch (error) {
      console.error('Erro ao carregar meus grupos:', error);
      throw error;
    }
  };

  const loadGruposPublicos = async () => {
    try {
      // Get my memberships to exclude them
      const { data: memberships } = await supabase
        .from('membros_grupos')
        .select('grupo_id')
        .eq('user_id', currentUser.id);

      const myGroupIds = memberships?.map(m => m.grupo_id) || [];

      let query = supabase
        .from('grupos_estudo')
        .select('*')
        .eq('is_publico', true)
        .neq('user_id', currentUser.id);

      if (myGroupIds.length > 0) {
        query = query.not('id', 'in', `(${myGroupIds.join(',')})`);
      }

      if (searchTerm) {
        query = query.ilike('nome', `%${searchTerm}%`);
      }
      if (selectedTopic) {
        query = query.eq('topico_nome', selectedTopic);
      }

      // Apply additional filters
      if (activeFilters.includes('mais-recentes')) {
        query = query.order('created_at', { ascending: false });
      } else if (activeFilters.includes('mais-antigos')) {
        query = query.order('created_at', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      setGruposPublicos(data || []);
    } catch (error) {
      console.error('Erro ao carregar grupos públicos:', error);
      throw error;
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('membros_grupos')
        .insert({
          grupo_id: groupId,
          user_id: currentUser.id
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Você ingressou no grupo com sucesso!",
      });
      loadGroups();
    } catch (error) {
      console.error('Erro ao ingressar no grupo:', error);
      toast({
        title: "Erro",
        description: "Erro ao ingressar no grupo",
        variant: "destructive"
      });
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!window.confirm('Você tem certeza que deseja sair deste grupo?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('membros_grupos')
        .delete()
        .eq('grupo_id', groupId)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Você saiu do grupo com sucesso!",
      });
      loadGroups();
    } catch (error) {
      console.error('Erro ao sair do grupo:', error);
      toast({
        title: "Erro",
        description: "Erro ao sair do grupo",
        variant: "destructive"
      });
    }
  };

  const handleShowConfigModal = async (groupId: string) => {
    try {
      // First check if user is the creator
      const { data: group, error: groupError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) {
        console.error('Erro ao carregar grupo:', groupError);
        toast({
          title: "Erro",
          description: "Erro ao carregar informações do grupo",
          variant: "destructive"
        });
        return;
      }

      if (group.user_id !== currentUser.id) {
        toast({
          title: "Acesso negado",
          description: "Apenas o criador pode configurar este grupo",
          variant: "destructive"
        });
        return;
      }

      setSelectedGroupDetails(group);

      // Load group members with simplified query
      try {
        const { data: members, error: membersError } = await supabase
          .from('membros_grupos')
          .select('*')
          .eq('grupo_id', groupId);

        if (membersError) {
          console.error('Erro ao carregar membros:', membersError);
          // Still show modal even if members fail to load
          setGroupMembers([]);
        } else {
          // Get user profiles for members
          const memberProfiles: GroupMember[] = [];

          for (const member of members || []) {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('email, display_name')
                .eq('id', member.user_id)
                .single();

              memberProfiles.push({
                id: member.id,
                user_id: member.user_id,
                joined_at: member.joined_at,
                email: profile?.email || 'Email não disponível',
                display_name: profile?.display_name || 'Nome não disponível'
              });
            } catch (error) {
              // Add member without profile info if profile fetch fails
              memberProfiles.push({
                id: member.id,
                user_id: member.user_id,
                joined_at: member.joined_at,
                email: 'Email não disponível',
                display_name: 'Nome não disponível'
              });
            }
          }

          setGroupMembers(memberProfiles);
        }
      } catch (error) {
        console.error('Erro ao processar membros:', error);
        setGroupMembers([]);
      }

      setConfigModalOpen(true);
    } catch (error) {
      console.error('Erro geral ao abrir modal:', error);
      toast({
        title: "Erro",
        description: "Erro ao abrir configurações do grupo",
        variant: "destructive"
      });
    }
  };

  const scrollTopics = (direction: 'left' | 'right') => {
    const container = document.querySelector('.topics-carousel');
    if (container) {
      const scrollAmount = 150;
      container.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleFilterToggle = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const clearFilters = () => {
    setActiveFilters([]);
  };

  const handleAccessGroup = async (group: any) => {
    try {
      console.log('=== INICIANDO handleAccessGroup ===');
      console.log('Grupo recebido:', JSON.stringify(group, null, 2));
      
      // Passo 1: Validar se o grupo é válido
      if (!group || !group.id) {
        console.error('ERRO: Grupo inválido fornecido:', group);
        toast({
          title: "Erro",
          description: "Grupo inválido selecionado",
          variant: "destructive"
        });
        return;
      }
      console.log('✓ Grupo válido encontrado com ID:', group.id);

      // Passo 2: Validar autenticação do usuário
      console.log('=== VALIDANDO AUTENTICAÇÃO ===');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('ERRO de autenticação:', authError.message, authError);
        toast({
          title: "Erro de Autenticação",
          description: `Falha na autenticação: ${authError.message}`,
          variant: "destructive"
        });
        return;
      }

      if (!user) {
        console.error('ERRO: Usuário não encontrado após autenticação');
        toast({
          title: "Erro de Autenticação",
          description: "Usuário não autenticado. Faça login novamente.",
          variant: "destructive"
        });
        return;
      }
      console.log('✓ Usuário autenticado com ID:', user.id);

      // Passo 3: Verificar membresia do usuário no grupo
      console.log('=== VERIFICANDO MEMBRESIA ===');
      console.log('Consultando membros_grupos com:', { 
        grupo_id: group.id, 
        user_id: user.id 
      });
      
      const { data: membershipData, error: membershipError } = await supabase
        .from('membros_grupos')
        .select('id, grupo_id, user_id, joined_at')
        .eq('grupo_id', group.id)
        .eq('user_id', user.id);

      if (membershipError) {
        console.error('ERRO na consulta de membresia:', membershipError.message);
        console.error('Detalhes do erro:', membershipError);
        toast({
          title: "Erro na Verificação",
          description: `Erro ao verificar participação: ${membershipError.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Resultado da consulta de membresia:', membershipData);

      if (!membershipData || membershipData.length === 0) {
        console.log('AVISO: Usuário não é membro do grupo');
        console.log('Dados retornados:', membershipData);
        toast({
          title: "Acesso Negado",
          description: "Você não é membro deste grupo",
          variant: "destructive"
        });
        return;
      }
      console.log('✓ Membresia confirmada:', membershipData[0]);

      // Passo 4: Buscar dados completos do perfil do usuário
      console.log('=== BUSCANDO PERFIL DO USUÁRIO ===');
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn('Aviso ao buscar perfil do usuário:', profileError.message);
        console.log('Continuando sem perfil completo...');
      } else {
        console.log('✓ Perfil do usuário encontrado:', userProfile);
      }

      // Preparar dados do usuário atual
      const currentUserData = {
        id: user.id,
        email: user.email,
        display_name: userProfile?.display_name || userProfile?.full_name || user.email?.split('@')[0] || 'Usuário'
      };
      console.log('✓ Dados do usuário preparados:', currentUserData);

      // Passo 5: Navegar para a interface do grupo
      console.log('=== NAVEGANDO PARA INTERFACE DO GRUPO ===');
      console.log('Navegando para:', `/turmas/grupos/${group.id}`);
      console.log('State que será passado:', { 
        group: group,
        currentUser: currentUserData
      });

      navigate(`/turmas/grupos/${group.id}`, { 
        state: { 
          group: group,
          currentUser: currentUserData
        }
      });

      console.log('✓ Navegação iniciada com sucesso');

    } catch (error: any) {
      console.error('=== ERRO INESPERADO ===');
      console.error('Tipo do erro:', typeof error);
      console.error('Mensagem do erro:', error?.message);
      console.error('Stack trace:', error?.stack);
      console.error('Erro completo:', error);
      
      toast({
        title: "Erro",
        description: `Erro inesperado: ${error?.message || 'Erro desconhecido'}. Verifique o console para mais detalhes.`,
        variant: "destructive"
      });
    }
  };

  const handleBackToGroups = () => {
    setShowGroupInterface(false);
    setSelectedGroupId(null);
    setSelectedGroupName('');
  };

  const currentGroups = currentView === 'my-groups' ? meusGrupos : gruposPublicos;

  if (showGroupInterface && selectedGroupId) {
    return (
      <GroupDetailInterface
        groupId={selectedGroupId}
        groupName={selectedGroupName}
        onBack={handleBackToGroups}
        currentUser={currentUser}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
            Grupos de Estudos
          </h3>
          <Badge variant="secondary" className="bg-[#FF6B00]/10 text-[#FF6B00]">
            {meusGrupos.length} grupos
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setIsJoinModalOpen(true)}
            variant="outline"
            size="sm"
            className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
          >
            <Plus className="h-4 w-4 mr-1" />
            Entrar em Grupo
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="sm"
            className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Criar Grupo
          </Button>
        </div>
      </div>

      {/* Topics Carousel */}
      <div className="relative">
        <div className="topics-carousel flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {topics.map((topic) => (
            <button
              key={topic.name}
              onClick={() => setSelectedTopic(selectedTopic === topic.name ? null : topic.name)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedTopic === topic.name
                  ? 'bg-[#FF6B00] text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-1">{topic.icon}</span>
              {topic.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => scrollTopics('right')}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 border"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          <Button
            onClick={() => setCurrentView('my-groups')}
            variant={currentView === 'my-groups' ? 'default' : 'outline'}
            size="sm"
            className={currentView === 'my-groups' ? 'bg-[#FF6B00] hover:bg-[#FF8C40]' : ''}
          >
            Meus Grupos
          </Button>
          <Button
            onClick={() => setCurrentView('public-groups')}
            variant={currentView === 'public-groups' ? 'default' : 'outline'}
            size="sm"
            className={currentView === 'public-groups' ? 'bg-[#FF6B00] hover:bg-[#FF8C40]' : ''}
          >
            Grupos Públicos
          </Button>
        </div>

        <div className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar grupos..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>

            {showFilters && (
              <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-4 z-50 w-64">
                <div className="space-y-2">
                  <h4 className="font-medium">Filtros</h4>
                  {[
                    { value: 'mais-membros', label: 'Mais membros' },
                    { value: 'menos-membros', label: 'Menos membros' },
                    { value: 'mais-recentes', label: 'Mais recentes' },
                    { value: 'mais-antigos', label: 'Mais antigos' },
                    { value: 'publicos', label: 'Públicos' },
                    { value: 'privados', label: 'Privados' }
                  ].map((filter) => (
                    <label key={filter.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeFilters.includes(filter.value)}
                        onChange={() => handleFilterToggle(filter.value)}
                        className="rounded"
                      />
                      <span className="text-sm">{filter.label}</span>
                    </label>
                  ))}
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                  >
                    Limpar filtros
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00] mx-auto"></div>
          <p className="mt-2 text-gray-500">Carregando grupos...</p>
        </div>
      ) : currentGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentGroups.map((group) => (
            <div
              key={group.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                    {group.nome}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Código: {group.codigo_unico}
                  </p>
                  <Badge
                    variant="secondary"
                    className={`mt-1 ${
                      group.is_publico
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                    }`}
                  >
                    {group.is_publico ? 'Público' : 'Privado'}
                  </Badge>
                </div>

                {currentView === 'my-groups' && (
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => handleLeaveGroup(group.id)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      title="Sair do Grupo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1 text-gray-400 cursor-not-allowed rounded"
                      title="Visualizar (em breve)"
                      disabled
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleShowConfigModal(group.id)}
                      className="p-1 text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded"
                      title="Configurações"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Users className="h-4 w-4" />
                  <span>{group.membros} membros</span>
                </div>

                <div className="card-actions">
                  <button
                    className="access-group-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAccessGroup(group);
                    }}
                    title="Acessar Grupo"
                  >
                    Acessar Grupo
                  </button>
                  {currentView === 'public-groups' && (
                    <Button
                      onClick={() => handleJoinGroup(group.id)}
                      size="sm"
                      className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
                    >
                      Entrar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {currentView === 'my-groups' ? 'Nenhum grupo encontrado' : 'Nenhum grupo público disponível'}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mt-2">
            {currentView === 'my-groups' 
              ? 'Você ainda não participa de nenhum grupo de estudos ou sua busca não retornou resultados.'
              : 'Não há grupos públicos disponíveis no momento ou sua busca não retornou resultados.'
            }
          </p>
        </div>
      )}

      {/* Configuration Modal */}
      {configModalOpen && selectedGroupDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Configurações do Grupo
                </h3>
                <Button
                  onClick={() => setConfigModalOpen(false)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Group Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Informações do Grupo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nome
                      </label>
                      <Input value={selectedGroupDetails.nome} readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tópico
                      </label>
                      <Input value={selectedGroupDetails.topico_nome || 'Não definido'} readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Código Único
                      </label>
                      <Input value={selectedGroupDetails.codigo_unico} readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Criado em
                      </label>
                      <Input value={new Date(selectedGroupDetails.created_at).toLocaleDateString('pt-BR')} readOnly />
                    </div>
                  </div>
                  {selectedGroupDetails.descricao && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Descrição
                      </label>
                      <textarea
                        value={selectedGroupDetails.descricao}
                        readOnly
                        className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        rows={3}
                      />
                    </div>
                  )}
                </div>

                {/* Privacy Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Privacidade</h4>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant="secondary"
                      className={`${
                        selectedGroupDetails.is_publico
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                      }`}
                    >
                      {selectedGroupDetails.is_publico ? 'Grupo Público' : 'Grupo Privado'}
                    </Badge>
                  </div>
                </div>

                {/* Members */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Membros ({groupMembers.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {groupMembers.length > 0 ? (
                      groupMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="w-8 h-8 bg-[#FF6B00] rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {member.display_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {member.display_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {member.email}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(member.joined_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Nenhum membro encontrado
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Ações</h4>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Placeholder for invite functionality
                        toast({
                          title: "Em breve",
                          description: "Funcionalidade de convite será implementada em breve",
                        });
                      }}
                    >
                      Convidar Parceiros
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedGroupDetails.codigo_unico);
                        toast({
                          title: "Código copiado",
                          description: `Código ${selectedGroupDetails.codigo_unico} copiado para a área de transferência`,
                        });
                      }}
                    >
                      Compartilhar Código
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <Button
                  onClick={() => setConfigModalOpen(false)}
                  variant="outline"
                >
                  Fechar
                </Button>
                <Button
                  className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
                  onClick={() => {
                    // Placeholder for save functionality
                    toast({
                      title: "Em breve",
                      description: "Funcionalidade de edição será implementada em breve",
                    });
                  }}
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={() => {
          setIsCreateModalOpen(false);
          loadGroups();
        }}
      />

      <AddGroupModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onGroupAdded={() => {
          setIsJoinModalOpen(false);
          loadGroups();
        }}
      />
    </div>
  );
}
