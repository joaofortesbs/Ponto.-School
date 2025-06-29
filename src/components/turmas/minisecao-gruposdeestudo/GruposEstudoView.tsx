import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import GroupCard from "../GroupCard";
import GroupInterface from "../group-detail/GroupInterface";
import CreateGroupModal from "../CreateGroupModal";
import JoinGroupModal from "../JoinGroupModal";
import LeaveGroupModal from "../LeaveGroupModal";
import CelebrationModal from "../CelebrationModal";

interface Group {
  id: string;
  nome: string;
  disciplina: string;
  descricao: string;
  membros: number;
  tags: string[];
  privacidade: string;
  icone: React.ReactNode;
}

export default function GruposEstudoView() {
  const [activeView, setActiveView] = useState("meus-grupos");
  const [groups, setGroups] = useState<Group[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedGroupForLeave, setSelectedGroupForLeave] = useState<Group | null>(null);
  const [celebrationMessage, setCelebrationMessage] = useState("");
  
  // Novo estado para interface do grupo
  const [viewingGroup, setViewingGroup] = useState<{id: string, name: string} | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      if (activeView === "meus-grupos") {
        loadMyGroups();
      } else {
        loadAllGroups();
      }
    }
  }, [activeView, currentUser]);

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
    }
  };

  const loadMyGroups = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
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
          is_private,
          criador_id,
          membros_grupos!inner(user_id)
        `)
        .eq('membros_grupos.user_id', currentUser.id);

      if (error) {
        console.error('Erro ao carregar meus grupos:', error);
        return;
      }

      const formattedGroups = data?.map(group => ({
        id: group.id,
        nome: group.nome,
        disciplina: group.disciplina_area || group.tipo_grupo || 'Geral',
        descricao: group.descricao || 'Sem descrição',
        membros: 1, // Placeholder
        tags: group.tags || [],
        privacidade: group.is_private ? 'privado' : 'publico',
        icone: <span>📚</span>
      })) || [];

      setGroups(formattedGroups);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllGroups = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('is_public', true)
        .or(`is_visible_to_all.eq.true,is_visible_to_partners.eq.true`);

      if (error) {
        console.error('Erro ao carregar todos os grupos:', error);
        return;
      }

      const formattedGroups = data?.map(group => ({
        id: group.id,
        nome: group.nome,
        disciplina: group.disciplina_area || group.tipo_grupo || 'Geral',
        descricao: group.descricao || 'Sem descrição',
        membros: 1, // Placeholder
        tags: group.tags || [],
        privacidade: group.is_private ? 'privado' : 'publico',
        icone: <span>📚</span>
      })) || [];

      setAllGroups(formattedGroups);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccessGroup = (group: Group) => {
    console.log('Acessando grupo:', group.id, group.nome);
    setViewingGroup({ id: group.id, name: group.nome });
  };

  const handleBackFromGroup = () => {
    setViewingGroup(null);
    // Recarregar grupos se necessário
    if (activeView === "meus-grupos") {
      loadMyGroups();
    } else {
      loadAllGroups();
    }
  };

  const handleJoinGroup = async (group: Group) => {
    setSelectedGroup(group);
    setShowJoinModal(true);
  };

  const handleLeaveGroup = (group: Group) => {
    setSelectedGroupForLeave(group);
    setShowLeaveModal(true);
  };

  const handleCreateGroup = () => {
    setShowCreateModal(true);
  };

  const handleGroupCreated = () => {
    setShowCreateModal(false);
    setCelebrationMessage("Grupo criado com sucesso!");
    setShowCelebrationModal(true);
    loadMyGroups();
  };

  const handleGroupJoined = () => {
    setShowJoinModal(false);
    setCelebrationMessage("Você entrou no grupo com sucesso!");
    setShowCelebrationModal(true);
    loadMyGroups();
  };

  const handleGroupLeft = () => {
    setShowLeaveModal(false);
    toast({
      title: "Sucesso",
      description: "Você saiu do grupo com sucesso",
    });
    loadMyGroups();
  };

  // Se estiver visualizando um grupo, mostrar a interface do grupo
  if (viewingGroup) {
    return (
      <GroupInterface
        groupId={viewingGroup.id}
        groupName={viewingGroup.name}
        onBack={handleBackFromGroup}
        currentUser={currentUser}
      />
    );
  }

  // Interface principal dos grupos
  return (
    <div className="h-full bg-[#001427] overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white mb-4">Grupos de Estudo</h1>
        
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setActiveView("meus-grupos")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === "meus-grupos"
                ? "bg-[#FF6B00] text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Meus Grupos
          </button>
          <button
            onClick={() => setActiveView("todos-grupos")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === "todos-grupos"
                ? "bg-[#FF6B00] text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Todos os Grupos
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCreateGroup}
            className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Criar Grupo
          </button>
          {activeView === "todos-grupos" && (
            <button
              onClick={() => setShowJoinModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Entrar via Código
            </button>
          )}
        </div>
      </div>

      {/* Groups Grid */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF6B00]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeView === "meus-grupos" ? groups : allGroups).map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <GroupCard
                  group={group}
                  onClick={() => 
                    activeView === "meus-grupos" 
                      ? handleAccessGroup(group)
                      : handleJoinGroup(group)
                  }
                  onViewForum={() => {}}
                  view={activeView}
                  onLeave={activeView === "meus-grupos" ? () => handleLeaveGroup(group) : undefined}
                />
              </motion.div>
            ))}
          </div>
        )}

        {!loading && (activeView === "meus-grupos" ? groups : allGroups).length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {activeView === "meus-grupos" 
                ? "Você ainda não faz parte de nenhum grupo. Crie um novo grupo ou entre em um existente!"
                : "Nenhum grupo público disponível no momento."
              }
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleGroupCreated}
      />

      <JoinGroupModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSuccess={handleGroupJoined}
        selectedGroup={selectedGroup}
      />

      <LeaveGroupModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onSuccess={handleGroupLeft}
        group={selectedGroupForLeave}
      />

      <CelebrationModal
        isOpen={showCelebrationModal}
        onClose={() => setShowCelebrationModal(false)}
        message={celebrationMessage}
      />
    </div>
  );
}
