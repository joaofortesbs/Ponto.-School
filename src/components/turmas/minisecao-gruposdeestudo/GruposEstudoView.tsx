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
import { useToast } from "@/hooks/use-toast";

export default function GruposEstudoView() {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("meus-grupos");
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const { toast } = useToast();

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

      console.log('Carregando view: todos-grupos');

      // Buscar grupos onde o usuário não é membro
      const { data: userGroups } = await supabase
        .from('membros_grupos')
        .select('grupo_id')
        .eq('user_id', user.id);

      const userGroupIds = userGroups?.map(ug => ug.grupo_id) || [];

      // Buscar parceiros do usuário
      const { data: partners } = await supabase
        .from('parceiros')
        .select('parceiro_id')
        .eq('user_id', user.id);

      const partnerIds = partners?.map(p => p.parceiro_id) || [];

      // Buscar grupos visíveis
      let query = supabase
        .from('grupos_estudo')
        .select('*');

      // Filtrar grupos visíveis a todos OU grupos visíveis aos parceiros (se o criador for parceiro)
      if (partnerIds.length > 0) {
        query = query.or(`is_visible_to_all.eq.true,and(is_visible_to_partners.eq.true,user_id.in.(${partnerIds.join(',')}))`);
      } else {
        query = query.eq('is_visible_to_all', true);
      }

      // Excluir grupos que o usuário já participa ou criou
      if (userGroupIds.length > 0) {
        query = query.not('id', 'in', `(${userGroupIds.join(',')})`);
      }
      query = query.neq('user_id', user.id);

      const { data: visibleGroups, error } = await query;

      if (error) {
        console.error('Erro ao carregar todos os grupos:', error);
        return;
      }

      console.log('Grupos visíveis encontrados:', visibleGroups?.length || 0);
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

  const handleCreateGroup = (formData: any) => {
    console.log("Novo grupo criado:", formData);
    setIsCreateModalOpen(false);
    // Recarregar grupos
    if (activeTab === "meus-grupos") {
      loadMyGroups();
    } else if (activeTab === "todos-grupos") {
      loadAllGroups();
    }
  };

  const handleGroupAdded = () => {
    setIsAddModalOpen(false);
    // Recarregar grupos
    loadMyGroups();
    if (activeTab === "todos-grupos") {
      loadAllGroups();
    }
  };

  const handleJoinGroup = async (groupId: string) => {
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
        console.error('Erro ao ingressar no grupo:', error);
        alert('Erro ao ingressar no grupo');
        return;
      }

      alert('Você ingressou no grupo com sucesso!');
      
      // Recarregar ambas as grades para refletir a mudança
      loadMyGroups();
      loadAllGroups();
    } catch (error) {
      console.error('Erro ao ingressar no grupo:', error);
      alert('Erro ao ingressar no grupo');
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
        alert('Erro ao sair do grupo');
        return;
      }

      alert('Você saiu do grupo');
      
      // Recarregar ambas as grades para refletir a mudança
      loadMyGroups();
      loadAllGroups();
    } catch (error) {
      console.error('Erro ao sair do grupo:', error);
      alert('Erro ao sair do grupo');
    }
  };

  // Função para acessar o grupo com logs detalhados
  const handleAccessGroup = async (group: any) => {
    try {
      console.log('Iniciando função handleAccessGroup para grupo:', group);

      // Passo 1: Validar dados do grupo
      if (!group || !group.id) {
        console.error('Dados do grupo inválidos:', group);
        toast({
          title: "Erro",
          description: "Dados do grupo inválidos",
          variant: "destructive"
        });
        return;
      }

      console.log('Grupo válido encontrado com ID:', group.id);

      // Passo 2: Validar autenticação do usuário
      console.log('Validando autenticação do usuário...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Erro de autenticação:', authError);
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      console.log('Usuário autenticado com ID:', user.id);

      // Passo 3: Verificar se o usuário é membro do grupo
      console.log('Verificando membresia do usuário', user.id, 'no grupo', group.id);
      
      const { data: membership, error: membershipError } = await supabase
        .from('membros_grupos')
        .select('id, grupo_id, user_id, joined_at')
        .eq('grupo_id', group.id)
        .eq('user_id', user.id);

      if (membershipError) {
        console.error('Erro ao verificar membresia:', membershipError.message, 'Detalhes:', membershipError);
        toast({
          title: "Erro",
          description: `Erro ao verificar sua participação no grupo: ${membershipError.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Resultado da verificação de membresia:', membership);

      if (!membership || membership.length === 0) {
        console.log('Usuário não é membro do grupo. Dados retornados:', membership);
        toast({
          title: "Acesso Negado",
          description: "Você não é membro deste grupo",
          variant: "destructive"
        });
        return;
      }

      console.log('Usuário é membro do grupo. Dados da membresia:', membership);

      // Passo 4: Buscar perfil do usuário para o chat
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn('Erro ao buscar perfil do usuário:', profileError);
      }

      const currentUser = {
        id: user.id,
        email: user.email,
        display_name: userProfile?.display_name || user.email?.split('@')[0] || 'Usuário'
      };

      console.log('Dados do usuário atual para o chat:', currentUser);

      // Passo 5: Navegar para a interface do grupo
      console.log('Acessando interface do grupo...');
      setSelectedGroup({
        ...group,
        currentUser
      });

      toast({
        title: "Sucesso",
        description: `Acessando grupo ${group.nome}`,
        variant: "default"
      });

    } catch (error) {
      console.error('Erro geral na função handleAccessGroup:', error);
      toast({
        title: "Erro",
        description: "Erro ao acessar o grupo. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
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

  // Função para renderizar card do grupo com logs detalhados
  const renderGroupCard = (group: any, showJoinButton = false) => (
    <div
      key={group.id}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => {
        console.log('Card do grupo clicado:', group);
        navigate(`/turmas/grupos/${group.id}`);
      }}
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
              {group.membros || 0} membros
            </span>
          </div>
          <div className="flex gap-2">
            {showJoinButton ? (
              <Button
                size="sm"
                className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Botão Participar clicado para grupo ID:', group.id);
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
                    console.log('Botão Sair clicado para grupo ID:', group.id);
                    handleLeaveGroup(group.id);
                  }}
                >
                  Sair
                </Button>
                <Button
                  size="sm"
                  className="access-group-btn bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Botão Acessar Grupo clicado para grupo:', group);
                    handleAccessGroup(group);
                  }}
                >
                  Acessar Grupo
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Show group detail view if a group is selected
  if (selectedGroup) {
    const GroupDetailInterface = React.lazy(() => import("@/components/turmas/group-detail"));
    return (
      <React.Suspense fallback={
        <div className="flex items-center justify-center h-screen bg-[#001427]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B00]"></div>
        </div>
      }>
        <GroupDetailInterface 
          groupId={selectedGroup.id}
          groupName={selectedGroup.nome}
          onBack={handleBackToGroups}
          currentUser={selectedGroup.currentUser}
        />
      </React.Suspense>
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
                Não encontramos grupos com visibilidade pública ou de parceiros no momento ou sua
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
