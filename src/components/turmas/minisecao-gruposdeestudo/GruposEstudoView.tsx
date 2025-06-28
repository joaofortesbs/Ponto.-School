
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Search, Globe, Lock, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AddGroupModal from "../AddGroupModal";

interface Group {
  id: string;
  nome: string;
  tipo_grupo: string;
  is_private: boolean;
  is_visible_to_all: boolean;
  disciplina_area?: string;
  created_at: string;
  criador_id: string;
  codigo_unico: string;
}

const GruposEstudoView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"todos" | "meus">("todos");
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Carregar todos os grupos
  const loadAllGroups = async () => {
    console.log('🔄 Carregando todos os grupos...');
    try {
      const { data, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar todos os grupos:', error);
        return;
      }

      console.log('✅ Todos os grupos carregados:', data);
      setAllGroups(data || []);
    } catch (error) {
      console.error('❌ Erro geral ao carregar todos os grupos:', error);
    }
  };

  // Carregar meus grupos
  const loadMyGroups = async () => {
    console.log('🔄 Carregando meus grupos...');
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('❌ Usuário não autenticado:', userError);
        return;
      }

      console.log('👤 Usuário autenticado:', user.id);

      // Buscar grupos onde o usuário é criador ou membro
      const { data: groupsData, error: groupsError } = await supabase
        .from('grupos_estudo')
        .select(`
          *,
          membros_grupos!inner(user_id)
        `)
        .or(`criador_id.eq.${user.id},membros_grupos.user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (groupsError) {
        console.error('❌ Erro ao carregar meus grupos:', groupsError);
        return;
      }

      console.log('✅ Meus grupos carregados:', groupsData);
      setMyGroups(groupsData || []);
    } catch (error) {
      console.error('❌ Erro geral ao carregar meus grupos:', error);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadAllGroups(), loadMyGroups()]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Configurar Realtime para atualizações automáticas
  useEffect(() => {
    console.log('🔌 Configurando Realtime...');
    
    const channel = supabase
      .channel('grupos_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'grupos_estudo' }, 
        (payload) => {
          console.log('📥 Novo grupo inserido:', payload);
          loadAllGroups();
          loadMyGroups();
        }
      )
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'membros_grupos' }, 
        (payload) => {
          console.log('📥 Novo membro adicionado:', payload);
          loadMyGroups();
        }
      )
      .subscribe((status) => {
        console.log('🔌 Status do Realtime:', status);
      });

    return () => {
      console.log('🔌 Desconectando Realtime...');
      supabase.removeChannel(channel);
    };
  }, []);

  // Filtrar grupos baseado na pesquisa
  const filterGroups = (groups: Group[]) => {
    if (!searchQuery) return groups;
    return groups.filter(group => 
      group.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.tipo_grupo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.disciplina_area?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Renderizar cartão do grupo
  const renderGroupCard = (group: Group, showJoinButton = false) => (
    <motion.div
      key={group.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1E293B] rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              {group.nome}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              {group.is_private ? (
                <Lock className="h-3 w-3 text-gray-500" />
              ) : (
                <Globe className="h-3 w-3 text-[#FF6B00]" />
              )}
              <span className="text-xs text-gray-500">
                {group.is_private ? 'Privado' : 'Público'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <Badge variant="outline" className="text-xs">
          {group.tipo_grupo}
        </Badge>
        {group.disciplina_area && (
          <Badge variant="secondary" className="text-xs">
            {group.disciplina_area}
          </Badge>
        )}
      </div>

      {showJoinButton && (
        <Button
          size="sm"
          className="w-full bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
          onClick={() => {
            // Implementar lógica de entrar no grupo
            toast({
              title: "Funcionalidade em desenvolvimento",
              description: "Em breve você poderá entrar nos grupos.",
            });
          }}
        >
          <Users className="h-4 w-4 mr-1" />
          Entrar no Grupo
        </Button>
      )}
    </motion.div>
  );

  const handleGroupAdded = () => {
    console.log('🎉 Grupo adicionado, recarregando listas...');
    setIsAddModalOpen(false);
    loadAllGroups();
    loadMyGroups();
  };

  const currentGroups = activeTab === "todos" ? allGroups : myGroups;
  const filteredGroups = filterGroups(currentGroups);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Grupos de Estudos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Conecte-se com outros estudantes e crie grupos de estudo
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Entrar em Grupo
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Pesquisar grupos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E293B] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-[#1E293B] p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("todos")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "todos"
              ? "bg-white dark:bg-[#29335C] text-[#FF6B00] shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Todos os Grupos ({allGroups.length})
        </button>
        <button
          onClick={() => setActiveTab("meus")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "meus"
              ? "bg-white dark:bg-[#29335C] text-[#FF6B00] shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Meus Grupos ({myGroups.length})
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF6B00]"></div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? "Nenhum grupo encontrado" : 
               activeTab === "todos" ? "Nenhum grupo disponível" : "Você não está em nenhum grupo"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery ? "Tente pesquisar com outros termos" :
               activeTab === "todos" ? "Seja o primeiro a criar um grupo!" : "Entre em um grupo existente ou crie um novo"}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Entrar em Grupo
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map(group => 
              renderGroupCard(group, activeTab === "todos")
            )}
          </div>
        )}
      </div>

      {/* Modal de Adicionar Grupo */}
      <AddGroupModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onGroupAdded={handleGroupAdded}
      />
    </div>
  );
};

export default GruposEstudoView;
