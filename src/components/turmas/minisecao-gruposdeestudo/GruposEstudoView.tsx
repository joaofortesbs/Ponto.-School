import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import ChatSection from "../group-detail/ChatSection";

const defaultNews = [
  {
    id: 1,
    title: "Bem-vindo aos Grupos de Estudos",
    content: "Aqui você pode criar ou participar de grupos para estudar com colegas."
  }
];

export default function GruposEstudoView() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("meus-grupos");
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [news, setNews] = useState(defaultNews);
  const [filterType, setFilterType] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterTopic, setFilterTopic] = useState("");
  const [showGroupInterface, setShowGroupInterface] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [groupActiveTab, setGroupActiveTab] = useState('discussions');
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    loadMyGroups();
    loadAllGroups();
  }, []);

  const loadMyGroups = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('membros_grupos')
        .select('grupo_id')
        .eq('user_id', supabase.auth.getUser().then(res => res.data.user?.id))
        .limit(100);

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao carregar seus grupos",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      if (data) {
        const groupIds = data.map((item: any) => item.grupo_id);
        const { data: groupsData, error: groupsError } = await supabase
          .from('grupos_estudo')
          .select('*')
          .in('id', groupIds);

        if (groupsError) {
          toast({
            title: "Erro",
            description: "Erro ao carregar detalhes dos grupos",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        setMyGroups(groupsData || []);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar seus grupos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllGroups = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .limit(100);

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao carregar todos os grupos",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      setAllGroups(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar todos os grupos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = () => {
    setIsCreateModalOpen(true);
  };

  const handleGroupAdded = () => {
    setIsCreateModalOpen(false);
    loadMyGroups();
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para entrar em grupos",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('membros_grupos')
        .insert({ grupo_id: groupId, user_id: user.id });

      if (error) {
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
        variant: "default"
      });

      loadMyGroups();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao entrar no grupo",
        variant: "destructive"
      });
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para sair de grupos",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('membros_grupos')
        .delete()
        .eq('grupo_id', groupId)
        .eq('user_id', user.id);

      if (error) {
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
        variant: "default"
      });

      loadMyGroups();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao sair do grupo",
        variant: "destructive"
      });
    }
  };

  const handleAccessGroup = async (group: any) => {
    try {
      console.log('Iniciando handleAccessGroup para grupo:', group);
      console.log('Stack Trace:', new Error().stack);

      // Passo 1: Validar autenticação
      console.log('Validando autenticação...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Erro de autenticação:', authError, 'Stack:', new Error().stack);
        toast({
          title: "Erro",
          description: "Você precisa estar logado para acessar o grupo.",
          variant: "destructive"
        });
        return;
      }
      console.log('Usuário autenticado. ID:', user.id);

      // Passo 2: Verificar membresia
      console.log('Verificando membresia para userId:', user.id, 'e grupoId:', group.id);
      const { data: membershipData, error: membershipError } = await supabase
        .from('membros_grupos')
        .select('id, joined_at')
        .eq('grupo_id', group.id)
        .eq('user_id', user.id);

      if (membershipError) {
        console.error('Erro na consulta de membresia:', membershipError.message, 'Detalhes:', membershipError, 'Stack:', new Error().stack);
        toast({
          title: "Erro",
          description: `Erro ao verificar membresia: ${membershipError.message}`,
          variant: "destructive"
        });
        return;
      }

      if (!membershipData || membershipData.length === 0) {
        console.log('Usuário não é membro. Dados:', membershipData, 'Stack:', new Error().stack);
        toast({
          title: "Acesso negado",
          description: "Você não é membro deste grupo.",
          variant: "destructive"
        });
        return;
      }
      console.log('Membresia confirmada. Dados:', membershipData);

      // Passo 3: Buscar informações completas do grupo
      console.log('Buscando dados completos do grupo ID:', group.id);
      const { data: groupData, error: groupError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('id', group.id)
        .single();

      if (groupError || !groupData) {
        console.error('Erro ao buscar grupo:', groupError?.message, 'Detalhes:', groupError, 'Stack:', new Error().stack);
        toast({
          title: "Erro",
          description: "Grupo não encontrado.",
          variant: "destructive"
        });
        return;
      }
      console.log('Grupo encontrado:', groupData);

      // Passo 4: Alternar para interface interna (sem navigate)
      console.log('Alternando para interface interna do grupo...');
      setSelectedGroup(groupData);
      setShowGroupInterface(true);
      setGroupActiveTab('discussions');
      
      console.log('Grupo acessado com sucesso.');
    } catch (error: any) {
      console.error('Erro inesperado em handleAccessGroup:', error.message, 'Stack Trace Completo:', error.stack);
      toast({
        title: "Erro inesperado",
        description: "Erro inesperado ao acessar o grupo. Verifique o console para detalhes.",
        variant: "destructive"
      });
    }
  };

  const handleBackToGroups = () => {
    console.log('Voltando para lista de grupos');
    setShowGroupInterface(false);
    setSelectedGroup(null);
    setMessages([]);
    setNewMessage('');
  };

  const filteredGroups = activeTab === "meus-grupos" ? myGroups : allGroups;

  const GroupCard = ({ group }: { group: any }) => {
    const userId = supabase.auth.getUser().then(res => res.data.user?.id);
    const isMember = myGroups.some(g => g.id === group.id);

    return (
      <div key={group.id} className="group-card bg-[#1a2a44] p-4 rounded-lg mb-4">
        <h3 className="text-lg font-semibold text-white">{group.nome}</h3>
        <p className="text-gray-400">{group.descricao || "Sem descrição"}</p>
        <div className="mt-2 flex gap-2">
          {isMember ? (
            <Button variant="outline" onClick={() => handleAccessGroup(group)}>
              Acessar
            </Button>
          ) : (
            <Button onClick={() => handleJoinGroup(group.id)}>
              Entrar
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderGroupInterface = () => {
    if (!selectedGroup) return null;

    const user = supabase.auth.getUser().then(res => res.data.user);

    return (
      <div className="group-interface h-full flex flex-col">
        {/* Header */}
        <div className="group-header bg-[#1a2a44] text-white p-4 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToGroups}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-xl font-bold">{selectedGroup.nome}</h2>
                <p className="text-sm text-gray-300">{selectedGroup.membros} membros</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="group-tabs border-b border-gray-600 bg-[#0f1729]">
          <div className="flex space-x-1 px-4">
            {['discussions', 'events', 'members', 'files', 'about'].map((tab) => (
              <button
                key={tab}
                onClick={() => setGroupActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  groupActiveTab === tab
                    ? 'border-[#FF6B00] text-[#FF6B00] bg-[#1a2a44]'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-[#1a2a44]/50'
                }`}
              >
                {tab === 'discussions' && 'Discussões'}
                {tab === 'events' && 'Eventos'}
                {tab === 'members' && 'Membros'}
                {tab === 'files' && 'Arquivos'}
                {tab === 'about' && 'Sobre'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="group-content flex-1 bg-[#0f1729]">
          {groupActiveTab === 'discussions' && (
            <ChatSection 
              groupId={selectedGroup.id} 
              currentUser={user} 
            />
          )}
          {groupActiveTab !== 'discussions' && (
            <div className="p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="bg-[#1a2a44] rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-2">
                    {groupActiveTab === 'events' && 'Eventos'}
                    {groupActiveTab === 'members' && 'Membros'}
                    {groupActiveTab === 'files' && 'Arquivos'}
                    {groupActiveTab === 'about' && 'Sobre'}
                  </h3>
                  <p className="text-gray-400">
                    Esta funcionalidade estará disponível em breve.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (showGroupInterface) {
    return renderGroupInterface();
  }

  return (
    <div className="grupos-estudo-view p-4">
      <div className="tabs flex gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${activeTab === "meus-grupos" ? "bg-[#FF6B00] text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("meus-grupos")}
        >
          Meus Grupos
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "todos-grupos" ? "bg-[#FF6B00] text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("todos-grupos")}
        >
          Todos os Grupos
        </button>
      </div>

      <div className="search mb-4">
        <input
          type="text"
          placeholder="Buscar grupos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 rounded border border-gray-300"
        />
      </div>

      <div className="groups-list">
        {filteredGroups.length === 0 ? (
          <p className="text-gray-500">Nenhum grupo encontrado.</p>
        ) : (
          filteredGroups
            .filter(group => group.nome.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(group => (
              <GroupCard key={group.id} group={group} />
            ))
        )}
      </div>
    </div>
  );
}
