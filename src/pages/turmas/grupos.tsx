
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Users, BookOpen, Lock, Globe } from "lucide-react";
import GroupCard from "@/components/turmas/GroupCard";
import CreateGroupModal from "@/components/turmas/CreateGroupModal";
import EntrarGrupoPorCodigoModal from "@/components/turmas/EntrarGrupoPorCodigoModal";
import LeaveGroupModal from "@/components/turmas/LeaveGroupModal";
import GroupInterface from "@/components/turmas/GroupInterface";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Group {
  id: string;
  nome: string;
  disciplina_area?: string;
  descricao?: string;
  membros?: number;
  proximaReuniao?: string;
  tags?: string[];
  privacidade: string;
  tipo_grupo?: string;
  is_private?: boolean;
  is_visible_to_all?: boolean;
  criador_id?: string;
  codigo_unico?: string;
  icone: React.ReactNode;
}

export default function GruposEstudo() {
  const [activeTab, setActiveTab] = useState("meus-grupos");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showGroupInterface, setShowGroupInterface] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadGroups();
    }
  }, [currentUser, activeTab]);

  const getCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Erro ao obter usuário:', error);
        return;
      }
      setCurrentUser(user);
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGroups = async () => {
    if (!currentUser) return;

    try {
      if (activeTab === "meus-grupos") {
        await loadMyGroups();
      } else {
        await loadAllGroups();
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    }
  };

  const loadMyGroups = async () => {
    if (!currentUser) return;

    try {
      // Buscar grupos onde o usuário é criador ou membro
      const { data: memberGroups, error: memberError } = await supabase
        .from('membros_grupos')
        .select('grupo_id')
        .eq('user_id', currentUser.id);

      if (memberError) {
        console.error('Erro ao buscar grupos do usuário:', memberError);
        return;
      }

      const groupIds = memberGroups?.map(mg => mg.grupo_id) || [];

      if (groupIds.length === 0) {
        setMyGroups([]);
        return;
      }

      const { data: groups, error: groupError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .in('id', groupIds);

      if (groupError) {
        console.error('Erro ao buscar dados dos grupos:', groupError);
        return;
      }

      const formattedGroups = groups?.map(group => ({
        id: group.id,
        nome: group.nome,
        disciplina_area: group.disciplina_area || group.tipo_grupo || 'Geral',
        descricao: group.descricao || 'Sem descrição',
        membros: 0, // TODO: Contar membros
        tags: group.tags || [],
        privacidade: group.is_private ? 'privado' : 'publico',
        tipo_grupo: group.tipo_grupo,
        is_private: group.is_private,
        is_visible_to_all: group.is_visible_to_all,
        criador_id: group.criador_id,
        codigo_unico: group.codigo_unico,
        icone: <BookOpen className="h-6 w-6 text-[#FF6B00]" />
      })) || [];

      setMyGroups(formattedGroups);
    } catch (error) {
      console.error('Erro ao carregar meus grupos:', error);
    }
  };

  const loadAllGroups = async () => {
    if (!currentUser) return;

    try {
      const { data: groups, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .or('is_public.eq.true,is_visible_to_all.eq.true');

      if (error) {
        console.error('Erro ao buscar todos os grupos:', error);
        return;
      }

      const formattedGroups = groups?.map(group => ({
        id: group.id,
        nome: group.nome,
        disciplina_area: group.disciplina_area || group.tipo_grupo || 'Geral',
        descricao: group.descricao || 'Sem descrição',
        membros: 0, // TODO: Contar membros
        tags: group.tags || [],
        privacidade: group.is_private ? 'privado' : 'publico',
        tipo_grupo: group.tipo_grupo,
        is_private: group.is_private,
        is_visible_to_all: group.is_visible_to_all,
        criador_id: group.criador_id,
        codigo_unico: group.codigo_unico,
        icone: <BookOpen className="h-6 w-6 text-[#FF6B00]" />
      })) || [];

      setAllGroups(formattedGroups);
    } catch (error) {
      console.error('Erro ao carregar todos os grupos:', error);
    }
  };

  const handleAccessGroup = (group: Group) => {
    setSelectedGroup(group);
    setShowGroupInterface(true);
  };

  const handleBackFromGroup = () => {
    setShowGroupInterface(false);
    setSelectedGroup(null);
    loadGroups(); // Recarregar grupos ao voltar
  };

  const handleLeaveGroup = (group: Group) => {
    setSelectedGroup(group);
    setShowLeaveModal(true);
  };

  const handleJoinGroup = async (group: Group) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('membros_grupos')
        .insert({
          grupo_id: group.id,
          user_id: currentUser.id
        });

      if (error) {
        console.error('Erro ao entrar no grupo:', error);
        toast({
          title: "Erro",
          description: "Erro ao entrar no grupo",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Você entrou no grupo com sucesso!",
        variant: "default"
      });

      loadGroups();
    } catch (error) {
      console.error('Erro ao entrar no grupo:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B00]"></div>
      </div>
    );
  }

  if (showGroupInterface && selectedGroup) {
    return (
      <GroupInterface
        groupId={selectedGroup.id}
        groupName={selectedGroup.nome}
        onBack={handleBackFromGroup}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Grupos de Estudo
        </h1>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowJoinModal(true)}
            variant="outline"
            className="flex items-center gap-2 border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white"
          >
            <Search className="h-4 w-4" />
            Entrar em Grupo
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Criar Grupo
          </Button>
        </div>
      </div>

      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("meus-grupos")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "meus-grupos"
              ? "bg-[#FF6B00] text-white"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Meus Grupos
        </button>
        <button
          onClick={() => setActiveTab("todos-grupos")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "todos-grupos"
              ? "bg-[#FF6B00] text-white"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <Globe className="h-4 w-4 inline mr-2" />
          Todos os Grupos
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {activeTab === "meus-grupos" ? (
          myGroups.length > 0 ? (
            myGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={{
                  ...group,
                  disciplina: group.disciplina_area || 'Geral'
                }}
                onClick={() => handleAccessGroup(group)}
                view="meus-grupos"
                onLeave={() => handleLeaveGroup(group)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum grupo encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Você ainda não participa de nenhum grupo de estudos.
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
              >
                Criar Primeiro Grupo
              </Button>
            </div>
          )
        ) : (
          allGroups.length > 0 ? (
            allGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={{
                  ...group,
                  disciplina: group.disciplina_area || 'Geral'
                }}
                onClick={() => handleJoinGroup(group)}
                view="todos-grupos"
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Globe className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum grupo público encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Não há grupos públicos disponíveis no momento.
              </p>
            </div>
          )
        )}
      </div>

      {/* Modals - mantendo os designs originais */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGroupCreated={loadGroups}
      />

      <EntrarGrupoPorCodigoModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onGroupJoined={loadGroups}
      />

      <LeaveGroupModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        group={selectedGroup}
        onGroupLeft={loadGroups}
      />
    </div>
  );
}
