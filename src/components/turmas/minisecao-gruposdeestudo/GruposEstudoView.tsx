
import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Grupo {
  id: string;
  nome: string;
  tipo_grupo: string;
  codigo_unico: string;
  is_private: boolean;
  is_visible_to_all: boolean;
  criador_id: string;
  created_at: string;
}

const GruposEstudoView: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [myGroups, setMyGroups] = useState<Grupo[]>([]);
  const [allGroups, setAllGroups] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-groups');

  // Carregar "Meus Grupos" - grupos criados pelo usuário ou onde é membro
  const loadMyGroups = async () => {
    if (!user) {
      console.error('Usuário não autenticado ao carregar Meus Grupos');
      return;
    }

    console.log('Carregando Meus Grupos para userId:', user.id);
    
    try {
      // Buscar grupos onde o usuário é criador
      const { data: createdGroups, error: createdError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('criador_id', user.id)
        .order('created_at', { ascending: false });

      if (createdError) {
        console.error('Erro ao carregar grupos criados:', createdError);
        return;
      }

      // Buscar grupos onde o usuário é membro
      const { data: memberGroups, error: memberError } = await supabase
        .from('membros_grupos')
        .select(`
          grupos_estudo (*)
        `)
        .eq('user_id', user.id);

      if (memberError) {
        console.error('Erro ao carregar grupos como membro:', memberError);
        return;
      }

      // Combinar e deduplificar grupos
      const allMyGroups = [
        ...(createdGroups || []),
        ...(memberGroups?.map(m => m.grupos_estudo).filter(Boolean) || [])
      ];

      // Remover duplicatas baseado no ID
      const uniqueGroups = allMyGroups.filter((group, index, self) => 
        index === self.findIndex(g => g.id === group.id)
      );

      console.log('Meus Grupos carregados:', uniqueGroups);
      setMyGroups(uniqueGroups);
    } catch (error) {
      console.error('Erro geral ao carregar Meus Grupos:', error);
    }
  };

  // Carregar "Todos os Grupos" - todos os grupos da plataforma
  const loadAllGroups = async () => {
    console.log('Carregando Todos os Grupos');
    
    try {
      const { data, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar Todos os Grupos:', error);
        return;
      }

      console.log('Todos os Grupos carregados:', data);
      setAllGroups(data || []);
    } catch (error) {
      console.error('Erro geral ao carregar Todos os Grupos:', error);
    }
  };

  // Configurar Realtime para atualizações automáticas
  useEffect(() => {
    const channel = supabase
      .channel('grupos_estudo_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'grupos_estudo' 
      }, (payload) => {
        console.log('Realtime: Novo grupo inserido:', payload);
        loadAllGroups();
        if (user && payload.new.criador_id === user.id) {
          loadMyGroups();
        }
      })
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'membros_grupos' 
      }, (payload) => {
        console.log('Realtime: Nova associação detectada:', payload);
        if (user && payload.new.user_id === user.id) {
          loadMyGroups();
        }
      })
      .subscribe((status) => {
        console.log('Status do Realtime:', status);
        if (status !== 'SUBSCRIBED') {
          console.warn('Realtime não conectado, recarregando manualmente...');
          setTimeout(() => {
            loadMyGroups();
            loadAllGroups();
          }, 1000);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([loadMyGroups(), loadAllGroups()]);
      setLoading(false);
    };

    if (user) {
      loadInitialData();
    }
  }, [user]);

  // Filtrar grupos baseado na pesquisa
  const filteredMyGroups = myGroups.filter(group =>
    group.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.tipo_grupo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAllGroups = allGroups.filter(group =>
    group.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.tipo_grupo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Renderizar mini-cartão de grupo
  const renderGroupCard = (group: Grupo, showJoinButton = false) => (
    <div
      key={group.id}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
          {group.nome}
        </h3>
        <Badge variant="secondary" className="text-xs">
          {group.tipo_grupo}
        </Badge>
      </div>
      
      <div className="space-y-1 mb-3">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong>Visibilidade:</strong> {group.is_private ? 'Privado' : 'Público'}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong>Código:</strong> {group.codigo_unico}
        </p>
      </div>

      <div className="flex gap-2">
        <Button size="sm" className="flex-1 text-xs">
          <Users className="h-3 w-3 mr-1" />
          Acessar
        </Button>
        {showJoinButton && (
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => handleJoinGroup(group.codigo_unico)}
          >
            Entrar
          </Button>
        )}
      </div>
    </div>
  );

  // Entrar em um grupo usando código
  const handleJoinGroup = async (codigo: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para entrar em um grupo",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: group, error: groupError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('codigo_unico', codigo)
        .single();

      if (groupError || !group) {
        toast({
          title: "Erro",
          description: "Grupo não encontrado",
          variant: "destructive"
        });
        return;
      }

      const { error: joinError } = await supabase
        .from('membros_grupos')
        .insert({ grupo_id: group.id, user_id: user.id });

      if (joinError) {
        if (joinError.code === '23505') { // Constraint de duplicata
          toast({
            title: "Aviso",
            description: "Você já é membro deste grupo",
            variant: "default"
          });
        } else {
          console.error('Erro ao entrar no grupo:', joinError);
          toast({
            title: "Erro",
            description: "Erro ao entrar no grupo",
            variant: "destructive"
          });
        }
        return;
      }

      toast({
        title: "Sucesso",
        description: "Você entrou no grupo com sucesso!",
        variant: "default"
      });

      await loadMyGroups();
    } catch (error) {
      console.error('Erro geral ao entrar no grupo:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho com busca */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Grupos de Estudos
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar grupos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-48 h-8"
            />
          </div>
          <Button size="sm" className="h-8">
            <Plus className="h-4 w-4 mr-1" />
            Criar
          </Button>
        </div>
      </div>

      {/* Abas de grupos */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-groups" className="text-sm">
            Meus Grupos ({filteredMyGroups.length})
          </TabsTrigger>
          <TabsTrigger value="all-groups" className="text-sm">
            Todos os Grupos ({filteredAllGroups.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-groups" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMyGroups.length > 0 ? (
              filteredMyGroups.map(group => renderGroupCard(group))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Você ainda não faz parte de nenhum grupo</p>
                <p className="text-sm">Crie um novo grupo ou entre em um usando um código</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all-groups" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAllGroups.length > 0 ? (
              filteredAllGroups.map(group => renderGroupCard(group, !myGroups.some(mg => mg.id === group.id)))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum grupo encontrado</p>
                <p className="text-sm">Seja o primeiro a criar um grupo!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GruposEstudoView;
