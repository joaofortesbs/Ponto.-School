
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, Users, Calendar, MessageCircle, Star, ChevronRight } from "lucide-react";
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
}

const topics = [
  { name: 'Matemática', icon: '📊' },
  { name: 'Física', icon: '🔬' },
  { name: 'Química', icon: '⚗️' },
  { name: 'Biologia', icon: '🧬' },
  { name: 'História', icon: '📚' },
  { name: 'Geografia', icon: '🌍' },
  { name: 'Filosofia', icon: '🤔' },
  { name: 'Literatura', icon: '📖' },
  { name: 'Computação', icon: '💻' },
  { name: 'Engenharia', icon: '⚙️' }
];

export default function GruposEstudoView() {
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'my-groups' | 'public-groups'>('my-groups');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [meusGrupos, setMeusGrupos] = useState<Grupo[]>([]);
  const [gruposPublicos, setGruposPublicos] = useState<Grupo[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadGroups();
    }
  }, [currentUser, currentView, searchTerm, selectedTopic]);

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

    if (searchTerm) {
      query = query.ilike('nome', `%${searchTerm}%`);
    }

    if (selectedTopic) {
      query = query.eq('topico_nome', selectedTopic);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

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

    if (searchTerm) {
      query = query.ilike('nome', `%${searchTerm}%`);
    }

    if (selectedTopic) {
      query = query.eq('topico_nome', selectedTopic);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

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
        <div className="topics-carousel flex gap-2 overflow-x-auto scroll-smooth pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style jsx>{`
            .topics-carousel::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <button
            onClick={() => setSelectedTopic(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedTopic === null
                ? 'bg-[#FF6B00] text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Todos
          </button>
          {topics.map((topic) => (
            <button
              key={topic.name}
              onClick={() => setSelectedTopic(topic.name)}
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

                <div className="flex gap-2">
                  {currentView === 'my-groups' ? (
                    <Button
                      onClick={() => handleLeaveGroup(grupo.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50 text-xs"
                    >
                      Sair do Grupo
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleJoinGroup(grupo.id)}
                      size="sm"
                      className="flex-1 bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs"
                    >
                      Participar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
