import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Users2,
  Search,
  Plus,
  Filter,
  Star,
} from "lucide-react";
import CreateGroupModal from "@/components/turmas/CreateGroupModal";
import AddGroupModal from "@/components/turmas/AddGroupModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function GruposEstudo() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("meus-grupos");
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      if (activeTab === "meus-grupos") {
        loadMyGroups();
      } else if (activeTab === "todos-grupos") {
        loadAllGroups();
      }
    }
  }, [activeTab, currentUser]);

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

  // Carregar grupos do usuário
  const loadMyGroups = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      console.log('Carregando meus grupos para usuário:', currentUser.id);

      const { data: memberGroups, error } = await supabase
        .from('membros_grupos')
        .select(`
          grupo_id,
          grupos_estudo (
            id,
            nome,
            descricao,
            tipo_grupo,
            disciplina_area,
            topico_especifico,
            tags,
            is_public,
            criador_id,
            created_at
          )
        `)
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Erro ao carregar meus grupos:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar seus grupos",
          variant: "destructive"
        });
        return;
      }

      const groups = memberGroups?.map(mg => mg.grupos_estudo).filter(Boolean) || [];
      console.log('Meus grupos carregados:', groups.length);
      setMyGroups(groups);
    } catch (error) {
      console.error('Erro ao carregar meus grupos:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar grupos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar todos os grupos visíveis
  const loadAllGroups = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      console.log('Carregando todos os grupos visíveis');

      // Buscar grupos onde o usuário não é membro
      const { data: userGroups } = await supabase
        .from('membros_grupos')
        .select('grupo_id')
        .eq('user_id', currentUser.id);

      const userGroupIds = userGroups?.map(ug => ug.grupo_id) || [];

      // Buscar grupos visíveis públicos
      let query = supabase
        .from('grupos_estudo')
        .select('*')
        .eq('is_public', true);

      // Excluir grupos que o usuário já participa
      if (userGroupIds.length > 0) {
        query = query.not('id', 'in', `(${userGroupIds.join(',')})`);
      }

      const { data: visibleGroups, error } = await query;

      if (error) {
        console.error('Erro ao carregar todos os grupos:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar grupos disponíveis",
          variant: "destructive"
        });
        return;
      }

      console.log('Grupos visíveis encontrados:', visibleGroups?.length || 0);
      setAllGroups(visibleGroups || []);
    } catch (error) {
      console.error('Erro ao carregar todos os grupos:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar grupos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar grupos baseado na pesquisa
  const filteredMyGroups = myGroups.filter(
    (group) =>
      group?.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group?.tipo_grupo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group?.disciplina_area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group?.topico_especifico?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAllGroups = allGroups.filter(
    (group) =>
      group?.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group?.tipo_grupo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group?.disciplina_area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group?.topico_especifico?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateGroup = async (formData: any) => {
    console.log("Criando novo grupo:", formData);
    try {
      const { data, error } = await supabase.rpc('create_group_with_member', {
        p_name: formData.nome,
        p_description: formData.descricao || '',
        p_type: formData.tipo_grupo,
        p_is_visible_to_all: formData.is_visible_to_all || false,
        p_is_visible_to_partners: formData.is_visible_to_partners || false,
        p_user_id: currentUser.id,
        p_disciplina_area: formData.disciplina_area,
        p_topico_especifico: formData.topico_especifico,
        p_tags: formData.tags
      });

      if (error) {
        console.error('Erro ao criar grupo:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar grupo: " + error.message,
          variant: "destructive"
        });
        return;
      }

      if (data && data.length > 0 && data[0].success) {
        toast({
          title: "Sucesso",
          description: "Grupo criado com sucesso!",
        });
        setIsCreateModalOpen(false);
        loadMyGroups(); // Recarregar a lista
      } else {
        toast({
          title: "Erro",
          description: data?.[0]?.error_message || "Erro ao criar grupo",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro inesperado ao criar grupo:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar grupo",
        variant: "destructive"
      });
    }
  };

  const handleGroupAdded = () => {
    setIsAddModalOpen(false);
    loadMyGroups();
    if (activeTab === "todos-grupos") {
      loadAllGroups();
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!currentUser) return;
    
    try {
      console.log('Tentando ingressar no grupo:', groupId);
      
      const { error } = await supabase
        .from('membros_grupos')
        .insert({
          grupo_id: groupId,
          user_id: currentUser.id
        });

      if (error) {
        console.error('Erro ao ingressar no grupo:', error);
        toast({
          title: "Erro",
          description: "Erro ao ingressar no grupo: " + error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Você ingressou no grupo com sucesso!",
      });
      
      // Recarregar ambas as listas
      loadMyGroups();
      loadAllGroups();
    } catch (error) {
      console.error('Erro ao ingressar no grupo:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao ingressar no grupo",
        variant: "destructive"
      });
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!currentUser) return;
    
    try {
      console.log('Tentando sair do grupo:', groupId);
      
      const { error } = await supabase
        .from('membros_grupos')
        .delete()
        .eq('grupo_id', groupId)
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Erro ao sair do grupo:', error);
        toast({
          title: "Erro",
          description: "Erro ao sair do grupo: " + error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Você saiu do grupo",
      });
      
      // Recarregar ambas as listas
      loadMyGroups();
      loadAllGroups();
    } catch (error) {
      console.error('Erro ao sair do grupo:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao sair do grupo",
        variant: "destructive"
      });
    }
  };

  const renderGroupCard = (group: any, showJoinButton = false) => (
    <div
      key={group.id}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/turmas/grupos/${group.id}`)}
    >
      <div className="h-32 bg-gray-200 relative">
        <div 
          className="w-full h-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40]"
        />
        {group.is_public && (
          <Badge className="absolute top-2 left-2 bg-[#FF6B00] hover:bg-[#FF8C40]">
            <Star className="h-3 w-3 mr-1 fill-current" /> Público
          </Badge>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 text-[#001427] dark:text-white">
          {group.nome}
        </h3>
        
        <div className="space-y-1 mb-3 text-xs text-gray-600 dark:text-gray-300">
          {group.tipo_grupo && (
            <p><span className="font-medium">Tipo:</span> {group.tipo_grupo}</p>
          )}
          {group.disciplina_area && (
            <p><span className="font-medium">Disciplina:</span> {group.disciplina_area}</p>
          )}
          {group.topico_especifico && (
            <p><span className="font-medium">Tópico:</span> {group.topico_especifico}</p>
          )}
          {group.tags && group.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {group.tags.slice(0, 3).map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {group.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{group.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Users2 className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-xs text-gray-500">
              Grupo de estudos
            </span>
          </div>
          <div className="flex gap-2">
            {showJoinButton ? (
              <Button
                size="sm"
                className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  handleJoinGroup(group.id);
                }}
              >
                Participar
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50 text-xs h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLeaveGroup(group.id);
                  }}
                >
                  Sair
                </Button>
                <Button
                  size="sm"
                  className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Acessar grupo será feito pelo onClick do card
                  }}
                >
                  Acessar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (!currentUser) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="text-center py-10">
          <Users2 className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Acesso necessário
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mt-2">
            Faça login para acessar os grupos de estudos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <Users2 className="h-8 w-8 text-[#FF6B00] mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-[#001427] dark:text-white">
              Grupos de Estudo
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Colabore, compartilhe e aprenda com seus colegas
            </p>
          </div>
        </div>

        <div className="flex w-full md:w-auto gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar grupos..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="outline"
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar</span>
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Criar Novo Grupo</span>
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="meus-grupos"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-gray-100 dark:bg-gray-800">
            <TabsTrigger
              value="meus-grupos"
              className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white"
            >
              Meus Grupos
            </TabsTrigger>
            <TabsTrigger
              value="todos-grupos"
              className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white"
            >
              Todos os Grupos
            </TabsTrigger>
          </TabsList>

          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="h-4 w-4" />
            <span>Filtrar</span>
          </Button>
        </div>

        <TabsContent value="meus-grupos" className="mt-0">
          {isLoading ? (
            <div className="text-center py-10">
              <p>Carregando grupos...</p>
            </div>
          ) : filteredMyGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMyGroups.map((group) => renderGroupCard(group))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Users2 className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Nenhum grupo encontrado
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mt-2 mb-4">
                Você ainda não participa de nenhum grupo de estudos ou sua busca
                não retornou resultados.
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
              >
                Criar Novo Grupo
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="todos-grupos" className="mt-0">
          {isLoading ? (
            <div className="text-center py-10">
              <p>Carregando grupos...</p>
            </div>
          ) : filteredAllGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAllGroups.map((group) => renderGroupCard(group, true))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Users2 className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Nenhum grupo visível encontrado
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mt-2">
                Não encontramos grupos públicos no momento ou sua
                busca não retornou resultados.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

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
    </div>
  );
}
