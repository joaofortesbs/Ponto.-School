
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
      loadMyGroups();
      loadAllGroups();
      
      // Configurar realtime para atualizações automáticas
      const channel = supabase.channel('grupos_changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'grupos_estudo' 
        }, (payload) => {
          console.log('Mudança detectada em grupos_estudo:', payload);
          loadMyGroups();
          loadAllGroups();
        })
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'membros_grupos' 
        }, (payload) => {
          console.log('Mudança detectada em membros_grupos:', payload);
          loadMyGroups();
        })
        .subscribe((status) => {
          console.log('Status do canal Realtime:', status);
          if (status !== 'SUBSCRIBED') {
            console.warn('Realtime não conectado, usando fallback manual');
            // Fallback: recarregar dados a cada 10 segundos
            const interval = setInterval(() => {
              loadMyGroups();
              loadAllGroups();
            }, 10000);
            
            return () => clearInterval(interval);
          }
        });

      return () => {
        console.log('Removendo canal Realtime');
        supabase.removeChannel(channel);
      };
    }
  }, [currentUser]);

  const getCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Erro ao obter usuário:', error);
        return;
      }
      console.log('Usuário atual:', user?.id);
      setCurrentUser(user);
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
    }
  };

  // Carregar grupos do usuário (criados ou onde é membro)
  const loadMyGroups = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      console.log('🔄 Carregando meus grupos para usuário:', currentUser.id);

      // Buscar grupos onde o usuário é criador
      const { data: createdGroups, error: createdError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('criador_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (createdError) {
        console.error('❌ Erro ao carregar grupos criados:', createdError);
        throw createdError;
      }

      // Buscar grupos onde o usuário é membro (mas não criador)
      const { data: memberGroups, error: memberError } = await supabase
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
            is_visible_to_all,
            is_private,
            criador_id,
            codigo_unico,
            created_at
          )
        `)
        .eq('user_id', currentUser.id)
        .neq('grupos_estudo.criador_id', currentUser.id);

      if (memberError) {
        console.error('❌ Erro ao carregar grupos de membro:', memberError);
        throw memberError;
      }

      // Combinar os grupos
      const memberGroupsData = memberGroups?.map(mg => mg.grupos_estudo).filter(Boolean) || [];
      const allMyGroups = [...(createdGroups || []), ...memberGroupsData];
      
      console.log('✅ Meus grupos carregados:', allMyGroups.length, allMyGroups);
      setMyGroups(allMyGroups);
    } catch (error) {
      console.error('❌ Erro ao carregar meus grupos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar seus grupos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar TODOS os grupos disponíveis
  const loadAllGroups = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      console.log('🔄 Carregando todos os grupos disponíveis');

      // Buscar TODOS os grupos
      const { data: allAvailableGroups, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar todos os grupos:', error);
        throw error;
      }

      console.log('✅ Todos os grupos encontrados:', allAvailableGroups?.length || 0, allAvailableGroups);
      setAllGroups(allAvailableGroups || []);
    } catch (error) {
      console.error('❌ Erro ao carregar todos os grupos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar grupos disponíveis",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleCreateGroup = async (newGroup: any) => {
    console.log("✅ Grupo criado com sucesso:", newGroup);
    toast({
      title: "Sucesso",
      description: `Grupo "${newGroup.nome}" criado com sucesso!`,
    });
    setIsCreateModalOpen(false);
    
    // Forçar recarregamento imediato
    setTimeout(async () => {
      console.log('🔄 Recarregando listas após criação...');
      await loadMyGroups();
      await loadAllGroups();
    }, 500);
  };

  const handleGroupAdded = async () => {
    setIsAddModalOpen(false);
    
    // Forçar recarregamento imediato
    setTimeout(async () => {
      console.log('🔄 Recarregando listas após adição...');
      await loadMyGroups();
      await loadAllGroups();
    }, 500);
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!currentUser) return;
    
    try {
      console.log('🔄 Tentando ingressar no grupo:', groupId);
      
      const { error } = await supabase
        .from('membros_grupos')
        .insert({
          grupo_id: groupId,
          user_id: currentUser.id
        });

      if (error) {
        console.error('❌ Erro ao ingressar no grupo:', error);
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
      
      // Forçar recarregamento das listas
      setTimeout(async () => {
        await loadMyGroups();
        await loadAllGroups();
      }, 500);
    } catch (error) {
      console.error('❌ Erro ao ingressar no grupo:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao ingressar no grupo",
        variant: "destructive"
      });
    }
  };

  const getTipoText = (tipo: string) => {
    const tipos: { [key: string]: string } = {
      'estudo': 'Estudo',
      'pesquisa': 'Pesquisa',
      'projeto': 'Projeto',
      'discussao': 'Discussão'
    };
    return tipos[tipo] || tipo;
  };

  const renderGroupCard = (group: any, showJoinButton = false) => (
    <div
      key={group.id}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/turmas/grupos/${group.id}`)}
    >
      <div className="h-24 bg-gray-200 relative">
        <div 
          className="w-full h-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40]"
        />
        {group.is_visible_to_all ? (
          <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-600">
            <Star className="h-3 w-3 mr-1 fill-current" /> Público
          </Badge>
        ) : (
          <Badge className="absolute top-2 left-2 bg-blue-500 hover:bg-blue-600">
            🔒 Privado
          </Badge>
        )}
        {group.codigo_unico && (
          <Badge className="absolute top-2 right-2 bg-gray-700 text-white text-xs">
            {group.codigo_unico}
          </Badge>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-bold text-base mb-1 text-[#001427] dark:text-white">
          {group.nome}
        </h3>
        
        <div className="space-y-1 mb-2 text-xs text-gray-600 dark:text-gray-300">
          {group.tipo_grupo && (
            <p><span className="font-medium">Tipo:</span> {getTipoText(group.tipo_grupo)}</p>
          )}
          {group.disciplina_area && (
            <p><span className="font-medium">Disciplina:</span> {group.disciplina_area}</p>
          )}
          {group.topico_especifico && (
            <p><span className="font-medium">Tópico:</span> {group.topico_especifico}</p>
          )}
          {group.tags && group.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {group.tags.slice(0, 2).map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {group.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{group.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Users2 className="h-3 w-3 mr-1 text-gray-500" />
            <span className="text-xs text-gray-500">
              Grupo de estudos
            </span>
          </div>
          <div className="flex gap-1">
            {showJoinButton ? (
              <Button
                size="sm"
                className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs h-7 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleJoinGroup(group.id);
                }}
              >
                Participar
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs h-7 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/turmas/grupos/${group.id}`);
                }}
              >
                Acessar
              </Button>
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
              Meus Grupos ({myGroups.length})
            </TabsTrigger>
            <TabsTrigger
              value="todos-grupos"
              className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white"
            >
              Todos os Grupos ({allGroups.length})
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAllGroups.map((group) => {
                // Verificar se o usuário já é membro para mostrar o botão correto
                const isMember = myGroups.some(myGroup => myGroup.id === group.id);
                return renderGroupCard(group, !isMember);
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <Users2 className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Nenhum grupo disponível
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mt-2">
                Não há grupos disponíveis para participar no momento ou sua
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
