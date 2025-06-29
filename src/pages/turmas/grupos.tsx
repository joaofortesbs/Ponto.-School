
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Users, BookOpen, MessageCircle, Calendar, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Componentes dos modais
import CreateGroupModal from "@/components/turmas/CreateGroupModal";
import EntrarGrupoPorCodigoModal from "@/components/turmas/EntrarGrupoPorCodigoModal";
import GroupCard from "@/components/turmas/GroupCard";
import GroupInterface from "@/components/turmas/GroupInterface";

export default function GruposEstudoPage() {
  const [activeTab, setActiveTab] = useState("todos-grupos");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentUser();
    if (activeTab === "todos-grupos") {
      loadAllGroups();
    } else if (activeTab === "meus-grupos") {
      loadMyGroups();
    }
  }, [activeTab]);

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const loadAllGroups = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('is_visible_to_all', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar grupos:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar grupos",
          variant: "destructive"
        });
        return;
      }

      setAllGroups(data || []);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyGroups = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('grupos_estudo')
        .select(`
          *,
          membros_grupos!inner(user_id)
        `)
        .or(`criador_id.eq.${user.id},membros_grupos.user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar meus grupos:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar seus grupos",
          variant: "destructive"
        });
        return;
      }

      setMyGroups(data || []);
    } catch (error) {
      console.error('Erro ao carregar meus grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = () => {
    setShowCreateModal(true);
  };

  const handleJoinGroup = () => {
    setShowJoinModal(true);
  };

  const handleGroupCreated = () => {
    setShowCreateModal(false);
    loadMyGroups();
    if (activeTab === "todos-grupos") {
      loadAllGroups();
    }
  };

  const handleGroupJoined = () => {
    setShowJoinModal(false);
    loadMyGroups();
  };

  const handleAccessGroup = (group: any) => {
    setSelectedGroup(group);
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    if (activeTab === "meus-grupos") {
      loadMyGroups();
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('membros_grupos')
        .delete()
        .eq('grupo_id', groupId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao sair do grupo:', error);
        toast({
          title: "Erro",
          description: "Erro ao sair do grupo",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Você saiu do grupo com sucesso",
      });

      loadMyGroups();
    } catch (error) {
      console.error('Erro ao sair do grupo:', error);
    }
  };

  const handleJoinGroupFromAll = async (groupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('membros_grupos')
        .insert({
          grupo_id: groupId,
          user_id: user.id,
          joined_at: new Date().toISOString()
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
        description: "Você entrou no grupo com sucesso",
      });

      loadMyGroups();
    } catch (error) {
      console.error('Erro ao entrar no grupo:', error);
    }
  };

  const filteredAllGroups = allGroups.filter(group =>
    group.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.disciplina_area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.topico_especifico?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMyGroups = myGroups.filter(group =>
    group.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.disciplina_area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.topico_especifico?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Se um grupo foi selecionado, mostrar a interface do grupo
  if (selectedGroup) {
    return (
      <GroupInterface
        group={selectedGroup}
        currentUser={currentUser}
        onBack={handleBackToGroups}
      />
    );
  }

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 space-y-6 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#001427] dark:text-white bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent font-montserrat">
            Grupos de Estudo
          </h1>
          <p className="text-[#778DA9] dark:text-gray-400 text-sm font-open-sans">
            Conecte-se com outros estudantes e expanda seu conhecimento
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleJoinGroup}
            className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white font-montserrat"
          >
            <Plus className="h-4 w-4 mr-2" />
            Entrar por Código
          </Button>
          <Button
            onClick={handleCreateGroup}
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-montserrat"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Grupo
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF6B00]">
            <Search className="h-4 w-4" />
          </div>
          <Input
            placeholder="Buscar grupos por nome, disciplina ou tópico..."
            className="pl-9 border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 gap-4 bg-transparent">
          <TabsTrigger
            value="todos-grupos"
            className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] data-[state=active]:border-[#FF6B00] border rounded-lg px-4 py-2 font-montserrat"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Todos os Grupos
          </TabsTrigger>
          <TabsTrigger
            value="meus-grupos"
            className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] data-[state=active]:border-[#FF6B00] border rounded-lg px-4 py-2 font-montserrat"
          >
            <Users className="h-4 w-4 mr-2" />
            Meus Grupos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos-grupos" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAllGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={{
                    id: group.id,
                    nome: group.nome,
                    disciplina: group.disciplina_area || "Geral",
                    descricao: group.descricao || "Sem descrição",
                    membros: group.membros || 0,
                    tags: group.tags || [],
                    privacidade: group.is_private ? "privado" : "publico",
                    icone: <BookOpen className="h-6 w-6 text-[#FF6B00]" />
                  }}
                  onClick={() => handleJoinGroupFromAll(group.id)}
                  view="todos-grupos"
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="meus-grupos" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMyGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={{
                    id: group.id,
                    nome: group.nome,
                    disciplina: group.disciplina_area || "Geral",
                    descricao: group.descricao || "Sem descrição",
                    membros: group.membros || 0,
                    tags: group.tags || [],
                    privacidade: group.is_private ? "privado" : "publico",
                    icone: <BookOpen className="h-6 w-6 text-[#FF6B00]" />
                  }}
                  onClick={() => handleAccessGroup(group)}
                  view="meus-grupos"
                  onLeave={() => handleLeaveGroup(group.id)}
                  onAccess={() => handleAccessGroup(group)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modais */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleGroupCreated}
      />

      <EntrarGrupoPorCodigoModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onGroupJoined={handleGroupJoined}
      />
    </div>
  );
}
