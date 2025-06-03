
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users2,
  Search,
  Plus,
  Filter,
  Calendar,
  MessageCircle,
  Star,
} from "lucide-react";
import CreateGroupModal from "@/components/turmas/CreateGroupModal";
import AddGroupModal from "@/components/turmas/AddGroupModal";
import { supabase } from "@/integrations/supabase/client";

export default function GruposEstudo() {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("meus-grupos");
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar grupos do usuário
  const loadMyGroups = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: memberGroups, error } = await supabase
        .from('membros_grupos')
        .select(`
          grupo_id,
          grupos_estudo (*)
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao carregar meus grupos:', error);
        return;
      }

      const groups = memberGroups?.map(mg => mg.grupos_estudo) || [];
      setMyGroups(groups);
    } catch (error) {
      console.error('Erro ao carregar meus grupos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar todos os grupos visíveis
  const loadAllGroups = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar grupos onde is_visible_to_all = true e o usuário não é membro
      const { data: userGroups } = await supabase
        .from('membros_grupos')
        .select('grupo_id')
        .eq('user_id', user.id);

      const userGroupIds = userGroups?.map(ug => ug.grupo_id) || [];

      const { data: visibleGroups, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('is_visible_to_all', true)
        .not('id', 'in', `(${userGroupIds.join(',') || 'NULL'})`);

      if (error) {
        console.error('Erro ao carregar todos os grupos:', error);
        return;
      }

      setAllGroups(visibleGroups || []);
    } catch (error) {
      console.error('Erro ao carregar todos os grupos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "meus-grupos") {
      loadMyGroups();
    } else if (activeTab === "todos-grupos") {
      loadAllGroups();
    }
  }, [activeTab]);

  // Filtrar grupos baseado na pesquisa
  const filteredMyGroups = myGroups.filter(
    (group) =>
      group?.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group?.topico?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredAllGroups = allGroups.filter(
    (group) =>
      group?.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group?.topico?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreateGroup = (formData: any) => {
    console.log("Novo grupo criado:", formData);
    setIsCreateModalOpen(false);
    // Recarregar grupos
    if (activeTab === "meus-grupos") {
      loadMyGroups();
    }
  };

  const handleGroupAdded = () => {
    setIsAddModalOpen(false);
    // Recarregar grupos
    if (activeTab === "meus-grupos") {
      loadMyGroups();
    } else if (activeTab === "todos-grupos") {
      loadAllGroups();
    }
  };

  const getActivityBadge = (level: string) => {
    switch (level) {
      case "alta":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            Atividade Alta
          </Badge>
        );
      case "média":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            Atividade Média
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600">
            Atividade Baixa
          </Badge>
        );
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
          className="w-full h-full"
          style={{ backgroundColor: group.cor || "#FF6B00" }}
        />
        {group.is_publico && (
          <Badge className="absolute top-2 left-2 bg-[#FF6B00] hover:bg-[#FF8C40]">
            <Star className="h-3 w-3 mr-1 fill-current" /> Público
          </Badge>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 text-[#001427] dark:text-white">
          {group.nome}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {group.topico_nome || group.topico}
        </p>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Users2 className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-xs text-gray-500">
              {group.membros || 0} membros
            </span>
          </div>
          {showJoinButton ? (
            <Button
              size="sm"
              className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs h-8"
              onClick={(e) => {
                e.stopPropagation();
                // Lógica para entrar no grupo
              }}
            >
              Participar
            </Button>
          ) : (
            getActivityBadge("média")
          )}
        </div>
      </div>
    </div>
  );

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
                Não encontramos grupos com visibilidade pública no momento ou sua
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
