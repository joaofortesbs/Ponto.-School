import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, Users, ChevronRight, Filter, X, Eye, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CreateGroupModal from "../CreateGroupModal";
import EntrarGrupoPorCodigoModal from "../EntrarGrupoPorCodigoModal";

interface Grupo {
  id: string;
  nome: string;
  descricao?: string;
  topico?: string;
  topico_nome?: string;
  topico_icon?: string;
  codigo_unico: string;
  is_publico: boolean;
  membros: number;
  user_id: string;
  created_at: string;
  cor?: string;
}

interface Member {
  id: string;
  user_id: string;
  joined_at: string;
  profiles?: {
    full_name?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

// Updated topics list as requested
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
  { name: 'Inglês', icon: '🇺🇸' },
  { name: 'Educação Financeira', icon: '💰' },
  { name: 'Redação', icon: '📖' },
  { name: 'Engenharia', icon: '⚙️' },
  { name: 'Robótica', icon: '🤖' },
  { name: 'Outros', icon: '📋' }
];

const filterOptions = [
  { value: 'mais-membros', label: 'Mais membros' },
  { value: 'menos-membros', label: 'Menos membros' },
  { value: 'mais-recentes', label: 'Mais recentes' },
  { value: 'mais-antigos', label: 'Mais antigos' },
  { value: 'publicos', label: 'Públicos' },
  { value: 'privados', label: 'Privados' }
];

export default function GruposEstudoView() {
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'my-groups' | 'public-groups'>('my-groups');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [meusGrupos, setMeusGrupos] = useState<Grupo[]>([]);
  const [gruposPublicos, setGruposPublicos] = useState<Grupo[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState<Grupo | null>(null);
  const [groupMembers, setGroupMembers] = useState<Member[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadGroups();
    }
  }, [currentUser, currentView, searchTerm, selectedTopic, selectedFilters]);

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
    const { data: memberships } = await supabase
      .from('membros_grupos')
      .select('grupo_id')
      .eq('user_id', currentUser.id);

    const groupIds = memberships?.map(m => m.grupo_id) || [];

    let query = supabase
      .from('grupos_estudo')
      .select('*');

    if (groupIds.length > 0) {
      query = query.or(`user_id.eq.${currentUser.id},id.in.(${groupIds.join(',')})`);
    } else {
      query = query.eq('user_id', currentUser.id);
    }

    // Apply topic filter
    if (selectedTopic && selectedTopic !== 'Outros') {
      query = query.eq('topico_nome', selectedTopic);
    }

    // Apply search filter
    if (searchTerm) {
      query = query.ilike('nome', `%${searchTerm}%`);
    }

    // Apply additional filters
    if (selectedFilters.includes('publicos')) {
      query = query.eq('is_publico', true);
    }
    if (selectedFilters.includes('privados')) {
      query = query.eq('is_publico', false);
    }

    // Apply sorting filters
    if (selectedFilters.includes('mais-recentes')) {
      query = query.order('created_at', { ascending: false });
    } else if (selectedFilters.includes('mais-antigos')) {
      query = query.order('created_at', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;
    setMeusGrupos(data || []);
  };

  const loadGruposPublicos = async () => {
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

    // Apply topic filter
    if (selectedTopic && selectedTopic !== 'Outros') {
      query = query.eq('topico_nome', selectedTopic);
    }

    // Apply search filter
    if (searchTerm) {
      query = query.ilike('nome', `%${searchTerm}%`);
    }

    // Apply sorting filters
    if (selectedFilters.includes('mais-recentes')) {
      query = query.order('created_at', { ascending: false });
    } else if (selectedFilters.includes('mais-antigos')) {
      query = query.order('created_at', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;
    setGruposPublicos(data || []);
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
        description: "Você ingressou no grupo com sucesso!"
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
        description: "Você saiu do grupo com sucesso!"
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

  const handleShowConfigModal = async (group: Grupo) => {
    // Check if user is the creator
    if (group.user_id !== currentUser.id) {
      toast({
        title: "Acesso Negado",
        description: "Apenas o criador pode configurar este grupo",
        variant: "destructive"
      });
      return;
    }

    setSelectedGroup(group);
    
    // Load group members
    try {
      const { data: members, error } = await supabase
        .from('membros_grupos')
        .select(`
          *,
          profiles:user_id (
            full_name,
            display_name,
            avatar_url
          )
        `)
        .eq('grupo_id', group.id);

      if (error) throw error;
      setGroupMembers(members || []);
      setIsConfigModalOpen(true);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar membros do grupo",
        variant: "destructive"
      });
    }
  };

  const handleShareGroup = (group: Grupo) => {
    const shareText = `Código do grupo: ${group.codigo_unico}\nNome: ${group.nome}`;
    navigator.clipboard.writeText(shareText).then(() => {
      toast({
        title: "Copiado!",
        description: "Código do grupo copiado para a área de transferência"
      });
    });
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

  const handleTopicSelect = (topicName: string) => {
    setSelectedTopic(selectedTopic === topicName ? null : topicName);
  };

  const handleFilterToggle = (filterValue: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterValue) 
        ? prev.filter(f => f !== filterValue)
        : [...prev, filterValue]
    );
  };

  const applyFilters = () => {
    setIsFilterModalOpen(false);
    loadGroups();
  };

  const clearFilters = () => {
    setSelectedFilters([]);
    setSelectedTopic(null);
    setIsFilterModalOpen(false);
  };

  const currentGroups = currentView === 'my-groups' ? meusGrupos : gruposPublicos;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
            Grupos de Estudos
          </h3>
          <Badge variant="secondary" className="bg-[#FF6B00]/10 text-[#FF6B00]">
            {currentGroups.length} grupos
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
        <div className="topics-carousel flex gap-2 overflow-x-auto scroll-smooth pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style jsx>{`
            .topics-carousel::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <button
            onClick={() => handleTopicSelect('')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedTopic === null || selectedTopic === ''
                ? 'bg-[#FF6B00] text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Todos
          </button>
          {topics.map((topic) => (
            <button
              key={topic.name}
              onClick={() => handleTopicSelect(topic.name)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                selectedTopic === topic.name
                  ? 'bg-[#FF6B00] text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span>{topic.icon}</span>
              {topic.name}
            </button>
          ))}
        </div>
        <Button
          onClick={() => scrollTopics('right')}
          variant="ghost"
          size="sm"
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setCurrentView('my-groups')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'my-groups'
                ? 'bg-[#FF6B00] text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Meus Grupos
          </button>
          <button
            onClick={() => setCurrentView('public-groups')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'public-groups'
                ? 'bg-[#FF6B00] text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Grupos Públicos
          </button>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Pesquisar grupos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="relative">
          <Button
            onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
            variant="outline"
            size="sm"
            className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
          >
            <Filter className="h-4 w-4" />
          </Button>
          
          {/* Filter Modal */}
          {isFilterModalOpen && (
            <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50 min-w-[200px]">
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-900 dark:text-white">Filtros</h4>
                {filterOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes(option.value)}
                      onChange={() => handleFilterToggle(option.value)}
                      className="rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                  </label>
                ))}
                <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    onClick={applyFilters}
                    size="sm"
                    className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs"
                  >
                    Aplicar
                  </Button>
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Limpar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Groups Grid */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Carregando grupos...</p>
          </div>
        ) : currentGroups.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {currentView === 'my-groups' ? 'Nenhum grupo encontrado' : 'Nenhum grupo público disponível'}
            </h3>
            <p className="text-gray-500 mt-2">
              {currentView === 'my-groups' 
                ? 'Você ainda não participa de nenhum grupo de estudos ou sua busca não retornou resultados.'
                : 'Não há grupos públicos disponíveis no momento ou sua busca não retornou resultados.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentGroups.map((grupo) => (
              <div
                key={grupo.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {grupo.topico_icon && <span className="text-lg">{grupo.topico_icon}</span>}
                    <div>
                      <h4 className="font-semibold text-[#29335C] dark:text-white text-sm">
                        {grupo.nome}
                      </h4>
                      {grupo.topico_nome && (
                        <p className="text-xs text-gray-500">{grupo.topico_nome}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* New Icons Section */}
                  {currentView === 'my-groups' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleLeaveGroup(grupo.id)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        title="Sair do grupo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 text-gray-400 cursor-not-allowed"
                        title="Visualizar (em breve)"
                        disabled
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleShowConfigModal(grupo)}
                        className="p-1 text-[#FF6B00] hover:text-[#FF8C40] transition-colors"
                        title="Configurações"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  <Badge variant={grupo.is_publico ? "default" : "secondary"} className="text-xs">
                    {grupo.is_publico ? 'Público' : 'Privado'}
                  </Badge>
                </div>

                {grupo.descricao && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {grupo.descricao}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{grupo.membros} membros</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Código: {grupo.codigo_unico}</span>
                  </div>
                </div>

                {currentView === 'public-groups' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleJoinGroup(grupo.id)}
                      size="sm"
                      className="flex-1 bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs"
                    >
                      Participar
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      {isConfigModalOpen && selectedGroup && (
        <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-[#0A2540] border-[#E0E1DD] dark:border-white/10">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#29335C] dark:text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#FF6B00]" />
                Configurações do Grupo
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Group Information */}
              <div className="space-y-2">
                <h4 className="font-medium text-[#29335C] dark:text-white">Informações</h4>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md space-y-2">
                  <p><strong>Nome:</strong> {selectedGroup.nome}</p>
                  <p><strong>Descrição:</strong> {selectedGroup.descricao || 'Não informado'}</p>
                  <p><strong>Tópico:</strong> {selectedGroup.topico_nome || 'Não informado'}</p>
                  <p><strong>Código:</strong> {selectedGroup.codigo_unico}</p>
                  <p><strong>Criado em:</strong> {new Date(selectedGroup.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Privacy */}
              <div className="space-y-2">
                <h4 className="font-medium text-[#29335C] dark:text-white">Privacidade</h4>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <p>{selectedGroup.is_publico ? 'Público' : 'Privado'}</p>
                </div>
              </div>

              {/* Members */}
              <div className="space-y-2">
                <h4 className="font-medium text-[#29335C] dark:text-white">Membros ({groupMembers.length})</h4>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md max-h-32 overflow-y-auto">
                  {groupMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-2 py-1">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex-shrink-0"></div>
                      <span className="text-sm">
                        {member.profiles?.display_name || member.profiles?.full_name || 'Usuário'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <h4 className="font-medium text-[#29335C] dark:text-white">Ações</h4>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleShareGroup(selectedGroup)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Compartilhar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled
                  >
                    Convidar
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsConfigModalOpen(false)}
                className="flex-1"
              >
                Fechar
              </Button>
              <Button
                className="flex-1 bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
                disabled
              >
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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

      <EntrarGrupoPorCodigoModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onGroupJoined={() => {
          setIsJoinModalOpen(false);
          loadGroups();
        }}
      />
    </div>
  );
}
