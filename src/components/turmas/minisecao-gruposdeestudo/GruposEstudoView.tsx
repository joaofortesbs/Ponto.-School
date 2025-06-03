
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, Search, Calendar, MessageCircle, Star, Eye, X } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import CreateGroupModal from "../CreateGroupModal";
import AddGroupModal from "../AddGroupModal";
import EntrarGrupoPorCodigoModal from "../EntrarGrupoPorCodigoModal";
import EntrarGrupoPorCodigoForm from "../EntrarGrupoPorCodigoForm";

interface StudyGroup {
  id: string;
  nome: string;
  descricao?: string;
  topico: string;
  topico_nome?: string;
  topico_icon?: string;
  cor: string;
  membros: number;
  created_at: string;
  is_publico: boolean;
  user_id: string;
  codigo_unico: string;
}

const topics = [
  { value: "Matemática", label: "📏 Matemática", color: "#3B82F6" },
  { value: "Língua Portuguesa", label: "📚 Língua Portuguesa", color: "#10B981" },
  { value: "Física", label: "⚡ Física", color: "#F59E0B" },
  { value: "Química", label: "🧪 Química", color: "#8B5CF6" },
  { value: "Biologia", label: "🌿 Biologia", color: "#EF4444" },
  { value: "História", label: "📜 História", color: "#F97316" },
  { value: "Geografia", label: "🌍 Geografia", color: "#06B6D4" },
  { value: "Filosofia", label: "🤔 Filosofia", color: "#6366F1" }
];

export default function GruposEstudoView() {
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [publicGroups, setPublicGroups] = useState<StudyGroup[]>([]);
  const [topicCounts, setTopicCounts] = useState<Record<string, number>>({});
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [groupToLeave, setGroupToLeave] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await loadGroups();
        await loadTopicCounts();
      }
      setIsLoading(false);
    };
    
    getUser();
  }, []);

  const loadGroups = async (filterTopic?: string) => {
    try {
      console.log('Loading groups...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user');
        return;
      }

      console.log('User authenticated:', user.id);

      // Carregar IDs dos grupos onde o usuário é membro
      const { data: memberGroups, error: memberError } = await supabase
        .from('membros_grupos')
        .select('grupo_id')
        .eq('user_id', user.id);

      if (memberError) {
        console.error('Error loading member groups:', memberError);
      }

      const memberGroupIds = memberGroups?.map(mg => mg.grupo_id) || [];

      // Carregar Meus Grupos (criados pelo usuário OU onde é membro)
      let myGroupsQuery = supabase
        .from('grupos_estudo')
        .select('*')
        .or(`user_id.eq.${user.id},id.in.(${memberGroupIds.length > 0 ? memberGroupIds.join(',') : 'null'})`);

      if (filterTopic) {
        myGroupsQuery = myGroupsQuery.eq('topico', filterTopic);
      }

      const { data: myGroupsData, error: myGroupsError } = await myGroupsQuery;

      if (myGroupsError) {
        console.error('Error loading my groups:', myGroupsError);
        setMyGroups([]);
      } else {
        console.log('My groups loaded:', myGroupsData);
        setMyGroups(myGroupsData as StudyGroup[] || []);
      }

      // Carregar Grupos Públicos (excluindo os que o usuário criou OU é membro)
      const excludeIds = [...memberGroupIds];
      
      let publicGroupsQuery = supabase
        .from('grupos_estudo')
        .select('*')
        .eq('is_publico', true)
        .neq('user_id', user.id);

      if (excludeIds.length > 0) {
        publicGroupsQuery = publicGroupsQuery.not('id', 'in', `(${excludeIds.join(',')})`);
      }

      if (filterTopic) {
        publicGroupsQuery = publicGroupsQuery.eq('topico', filterTopic);
      }

      const { data: publicGroupsData, error: publicError } = await publicGroupsQuery;

      if (publicError) {
        console.error('Error loading public groups:', publicError);
        setPublicGroups([]);
      } else {
        console.log('Public groups loaded:', publicGroupsData);
        setPublicGroups(publicGroupsData as StudyGroup[] || []);
      }

    } catch (error) {
      console.error('Error in loadGroups:', error);
      setMyGroups([]);
      setPublicGroups([]);
    }
  };

  const loadTopicCounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const counts: Record<string, number> = {};

      // Para cada tópico, contar quantos grupos o usuário criou ou é membro
      for (const topic of topics) {
        try {
          // Grupos criados
          const { data: createdGroups, error: createdError } = await supabase
            .from('grupos_estudo')
            .select('id')
            .eq('user_id', user.id)
            .eq('topico', topic.value);

          // Grupos onde é membro
          const { data: memberGroups, error: memberError } = await supabase
            .from('membros_grupos')
            .select('grupo_id')
            .eq('user_id', user.id);

          if (!memberError && memberGroups) {
            const memberGroupIds = memberGroups.map(mg => mg.grupo_id);
            const { data: memberGroupsData, error: memberGroupsError } = await supabase
              .from('grupos_estudo')
              .select('id')
              .in('id', memberGroupIds)
              .eq('topico', topic.value);

            const createdCount = createdGroups?.length || 0;
            const memberCount = memberGroupsData?.length || 0;
            
            // Evitar contar duplicatas (se o usuário criou E é membro)
            const uniqueGroups = new Set([
              ...(createdGroups?.map(g => g.id) || []),
              ...(memberGroupsData?.map(g => g.id) || [])
            ]);
            
            counts[topic.value] = uniqueGroups.size;
          } else {
            counts[topic.value] = createdGroups?.length || 0;
          }
        } catch (error) {
          console.error(`Error counting topic ${topic.value}:`, error);
          counts[topic.value] = 0;
        }
      }

      setTopicCounts(counts);
    } catch (error) {
      console.error('Error loading topic counts:', error);
    }
  };

  const handleTopicClick = (topicValue: string) => {
    const newTopic = selectedTopic === topicValue ? "" : topicValue;
    setSelectedTopic(newTopic);
    loadGroups(newTopic || undefined);
  };

  const handleCreateGroup = async () => {
    setIsCreateModalOpen(false);
    await loadGroups(selectedTopic || undefined);
    await loadTopicCounts();
  };

  const handleGroupAdded = async () => {
    await loadGroups(selectedTopic || undefined);
    await loadTopicCounts();
  };

  const handleJoinPublicGroup = async (groupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Usuário não autenticado');
        return;
      }

      // Verificar se já é membro
      const { data: existingMember } = await supabase
        .from('membros_grupos')
        .select('id')
        .eq('grupo_id', groupId)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        alert('Você já faz parte deste grupo');
        return;
      }

      // Adicionar como membro
      const { error: memberError } = await supabase
        .from('membros_grupos')
        .insert({
          grupo_id: groupId,
          user_id: user.id
        });

      if (memberError) {
        console.error('Error joining group:', memberError);
        alert('Erro ao ingressar no grupo. Tente novamente.');
        return;
      }

      alert('Você ingressou no grupo com sucesso!');
      await loadGroups(selectedTopic || undefined);
      await loadTopicCounts();
    } catch (error) {
      console.error('Error joining public group:', error);
      alert('Erro inesperado. Tente novamente.');
    }
  };

  const handleLeaveGroup = (groupId: string) => {
    setGroupToLeave(groupId);
    setIsLeaveModalOpen(true);
  };

  const confirmLeaveGroup = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Usuário não autenticado');
        return;
      }

      // Remover da tabela membros_grupos
      const { error: deleteError } = await supabase
        .from('membros_grupos')
        .delete()
        .eq('grupo_id', groupToLeave)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error leaving group:', deleteError);
        alert('Erro ao sair do grupo. Tente novamente.');
        return;
      }

      alert('Você saiu do grupo com sucesso!');
      setIsLeaveModalOpen(false);
      setGroupToLeave("");
      await loadGroups(selectedTopic || undefined);
      await loadTopicCounts();
    } catch (error) {
      console.error('Error leaving group:', error);
      alert('Erro inesperado. Tente novamente.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <Card className="w-full bg-white dark:bg-[#0A2540] border-[#E0E1DD] dark:border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-[#29335C] dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-[#FF6B00]" />
            Grupos de Estudo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-[#64748B] dark:text-white/60">
              Carregando...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="w-full bg-white dark:bg-[#0A2540] border-[#E0E1DD] dark:border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-[#29335C] dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-[#FF6B00]" />
            Grupos de Estudo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-[#64748B] dark:text-white/60">
              Faça login para acessar os grupos de estudo.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white dark:bg-[#0A2540] border-[#E0E1DD] dark:border-white/10">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-[#29335C] dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-[#FF6B00]" />
              Grupos de Estudo
            </CardTitle>
            <p className="text-sm text-[#64748B] dark:text-white/60 mt-1">
              Conecte-se e aprenda com seus colegas
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsJoinModalOpen(true)}
              className="text-[#FF6B00] border-[#FF6B00] hover:bg-[#FF6B00] hover:text-white"
            >
              <Search className="h-4 w-4 mr-1" />
              Entrar
            </Button>
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Criar Grupo
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Campo para entrar por código */}
        <EntrarGrupoPorCodigoForm onGroupJoined={handleGroupAdded} />

        {/* Tópicos de Estudo */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
              Tópicos de Estudo
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleTopicClick("")}
              className="text-[#64748B] hover:text-[#FF6B00]"
            >
              Ver todos
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {topics.map((topic) => (
              <motion.button
                key={topic.value}
                onClick={() => handleTopicClick(topic.value)}
                className={`p-3 rounded-lg text-left transition-all duration-200 ${
                  selectedTopic === topic.value
                    ? 'ring-2 ring-[#FF6B00] shadow-md'
                    : 'hover:shadow-md'
                }`}
                style={{ 
                  backgroundColor: selectedTopic === topic.value ? topic.color : `${topic.color}20`,
                  color: selectedTopic === topic.value ? 'white' : topic.color
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{topic.label.split(' ')[0]}</span>
                  <div>
                    <div className="font-medium text-sm">
                      {topic.label.substring(topic.label.indexOf(' ') + 1)}
                    </div>
                    <div className="text-xs opacity-75">
                      {topicCounts[topic.value] || 0} grupos
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Meus Grupos */}
        <div>
          <h3 className="text-lg font-semibold text-[#29335C] dark:text-white mb-3">
            Meus Grupos {selectedTopic && `- ${selectedTopic}`}
          </h3>
          
          {myGroups.length > 0 ? (
            <div className="space-y-3">
              {myGroups.map((group) => (
                <motion.div
                  key={group.id}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer"
                  style={{ borderLeftColor: group.cor, borderLeftWidth: '4px' }}
                  whileHover={{ scale: 1.01 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#29335C] dark:text-white">
                        {group.nome}
                      </h4>
                      {group.descricao && (
                        <p className="text-sm text-[#64748B] dark:text-white/60 mt-1">
                          {group.descricao}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-[#64748B] dark:text-white/60">
                        <span className="flex items-center gap-1">
                          {group.topico_icon || "📚"} {group.topico_nome || group.topico}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {group.membros} membros
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(group.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          Código: {group.codigo_unico}
                        </span>
                        {group.is_publico && (
                          <span className="flex items-center gap-1 text-green-600">
                            <Star className="h-3 w-3" />
                            Público
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleLeaveGroup(group.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Sair
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h4 className="text-lg font-medium text-[#29335C] dark:text-white mb-2">
                {selectedTopic ? `Nenhum grupo de ${selectedTopic}` : 'Nenhum grupo ainda'}
              </h4>
              <p className="text-[#64748B] dark:text-white/60 mb-4">
                {selectedTopic 
                  ? `Você ainda não criou grupos de ${selectedTopic}.`
                  : 'Você ainda não criou nenhum grupo de estudos.'
                }
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                Criar Grupo
              </Button>
            </div>
          )}
        </div>

        {/* Grupos Públicos */}
        <div>
          <h3 className="text-lg font-semibold text-[#29335C] dark:text-white mb-3">
            Grupos Públicos {selectedTopic && `- ${selectedTopic}`}
          </h3>
          
          {publicGroups.length > 0 ? (
            <div className="space-y-3">
              {publicGroups.map((group) => (
                <motion.div
                  key={group.id}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer"
                  style={{ borderLeftColor: group.cor, borderLeftWidth: '4px' }}
                  whileHover={{ scale: 1.01 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#29335C] dark:text-white">
                        {group.nome}
                      </h4>
                      {group.descricao && (
                        <p className="text-sm text-[#64748B] dark:text-white/60 mt-1">
                          {group.descricao}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-[#64748B] dark:text-white/60">
                        <span className="flex items-center gap-1">
                          {group.topico_icon || "📚"} {group.topico_nome || group.topico}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {group.membros} membros
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(group.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          Código: {group.codigo_unico}
                        </span>
                        <span className="flex items-center gap-1 text-green-600">
                          <Eye className="h-3 w-3" />
                          Público
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleJoinPublicGroup(group.id)}
                        className="text-[#FF6B00] border-[#FF6B00] hover:bg-[#FF6B00] hover:text-white"
                      >
                        Participar
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <Search className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h4 className="text-lg font-medium text-[#29335C] dark:text-white mb-2">
                {selectedTopic ? `Nenhum grupo público de ${selectedTopic}` : 'Nenhum grupo público disponível'}
              </h4>
              <p className="text-[#64748B] dark:text-white/60 mb-4">
                {selectedTopic 
                  ? `Não há grupos públicos de ${selectedTopic} disponíveis no momento.`
                  : 'Não há grupos públicos disponíveis no momento.'
                }
              </p>
              <Button
                variant="outline"
                onClick={() => setIsJoinModalOpen(true)}
                className="text-[#FF6B00] border-[#FF6B00] hover:bg-[#FF6B00] hover:text-white"
              >
                <Search className="h-4 w-4 mr-1" />
                Buscar Grupos
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateGroup}
      />

      <AddGroupModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onGroupAdded={handleGroupAdded}
      />

      <EntrarGrupoPorCodigoModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onGroupJoined={handleGroupAdded}
      />

      {/* Modal de Confirmação para Sair do Grupo */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#0A2540] p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[#29335C] dark:text-white mb-4">
              Confirmar Saída
            </h3>
            <p className="text-[#64748B] dark:text-white/60 mb-6">
              Você tem certeza que deseja sair deste grupo? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsLeaveModalOpen(false);
                  setGroupToLeave("");
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmLeaveGroup}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Sair do Grupo
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
