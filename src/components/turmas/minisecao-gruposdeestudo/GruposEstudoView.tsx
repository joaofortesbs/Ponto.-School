import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Plus,
  Search,
  BookOpen,
  Lightbulb,
  Target,
  Trophy,
  Star,
  Globe,
  Lock,
  UserPlus,
  MessageCircle,
  Calendar,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ThemeProvider";
import GroupCard from "../GroupCard";
import CreateGroupModal from "../CreateGroupModal";
import AddGroupModal from "../AddGroupModal";

// Tipos para os grupos
interface GrupoEstudo {
  id: string;
  nome: string;
  descricao?: string;
  tipo_grupo: string;
  disciplina_area?: string;
  topico_especifico?: string;
  tags?: string[];
  is_public?: boolean;
  is_visible_to_all?: boolean;
  is_visible_to_partners?: boolean;
  is_private?: boolean;
  criador_id: string;
  codigo_unico?: string;
  created_at: string;
}

const GruposEstudoView: React.FC = () => {
  const [currentView, setCurrentView] = useState("todos-grupos");
  const [searchTerm, setSearchTerm] = useState("");
  const [allGroups, setAllGroups] = useState<GrupoEstudo[]>([]);
  const [myGroups, setMyGroups] = useState<GrupoEstudo[]>([]);
  const [createdGroups, setCreatedGroups] = useState<GrupoEstudo[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();

  // Função para carregar todos os grupos visíveis para todos
  const loadAllGroups = async (retryCount = 0, maxRetries = 3) => {
    try {
      console.log(`Carregando view: ${currentView}`);
      console.log(`Tentativa ${retryCount + 1} de carregar grupos visíveis para todos...`);
      
      setLoading(true);
      
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
          is_public,
          is_visible_to_all,
          is_visible_to_partners,
          is_private,
          criador_id,
          codigo_unico,
          created_at
        `)
        .eq('is_visible_to_all', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar todos os grupos:', error);
        
        if (retryCount < maxRetries) {
          console.log(`Tentando novamente em 1 segundo (tentativa ${retryCount + 2})...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return loadAllGroups(retryCount + 1, maxRetries);
        }
        
        toast({
          title: "Erro",
          description: "Não foi possível carregar os grupos. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      console.log('Dados retornados do Supabase:', data);
      
      if (!data || data.length === 0) {
        console.warn('Nenhum grupo visível para todos encontrado.');
        setAllGroups([]);
        return;
      }

      setAllGroups(data);
      console.log(`Grade "Todos os Grupos" carregada com ${data.length} grupos visíveis.`);
      
    } catch (error) {
      console.error('Erro geral em loadAllGroups:', error);
      
      if (retryCount < maxRetries) {
        console.log(`Tentando novamente em 1 segundo (tentativa ${retryCount + 2})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return loadAllGroups(retryCount + 1, maxRetries);
      }
      
      toast({
        title: "Erro",
        description: "Erro ao carregar grupos. Tente recarregar a página.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar meus grupos (onde sou membro ou criador)
  const loadMyGroups = async (retryCount = 0, maxRetries = 3) => {
    try {
      console.log(`Tentativa ${retryCount + 1} de carregar meus grupos...`);
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado');
        return;
      }

      console.log('Carregando grupos onde sou membro ou criador...');

      // Buscar grupos onde sou criador
      const { data: createdGroups, error: createdError } = await supabase
        .from('grupos_estudo')
        .select(`
          id,
          nome,
          descricao,
          tipo_grupo,
          disciplina_area,
          topico_especifico,
          tags,
          is_public,
          is_visible_to_all,
          is_visible_to_partners,
          is_private,
          criador_id,
          codigo_unico,
          created_at
        `)
        .eq('criador_id', user.id)
        .order('created_at', { ascending: false });

      // Buscar grupos onde sou membro
      const { data: memberGroups, error: memberError } = await supabase
        .from('membros_grupos')
        .select(`
          grupos_estudo!inner(
            id,
            nome,
            descricao,
            tipo_grupo,
            disciplina_area,
            topico_especifico,
            tags,
            is_public,
            is_visible_to_all,
            is_visible_to_partners,
            is_private,
            criador_id,
            codigo_unico,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (createdError) {
        console.error('Erro ao carregar grupos criados:', createdError);
      }

      if (memberError) {
        console.error('Erro ao carregar grupos onde sou membro:', memberError);
      }

      if (createdError || memberError) {
        if (retryCount < maxRetries) {
          console.log(`Tentando novamente em 1 segundo (tentativa ${retryCount + 2})...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return loadMyGroups(retryCount + 1, maxRetries);
        }
        
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus grupos.",
          variant: "destructive",
        });
        return;
      }

      // Combinar grupos criados e grupos onde sou membro
      const allMyGroups: GrupoEstudo[] = [];
      const seenIds = new Set();

      // Adicionar grupos criados
      if (createdGroups) {
        createdGroups.forEach(group => {
          if (!seenIds.has(group.id)) {
            allMyGroups.push(group);
            seenIds.add(group.id);
          }
        });
      }

      // Adicionar grupos onde sou membro
      if (memberGroups) {
        memberGroups.forEach(item => {
          const group = item.grupos_estudo;
          if (group && !seenIds.has(group.id)) {
            allMyGroups.push(group);
            seenIds.add(group.id);
          }
        });
      }

      console.log(`Meus grupos carregados: ${allMyGroups.length} grupos encontrados`);
      setMyGroups(allMyGroups);

    } catch (error) {
      console.error('Erro ao carregar meus grupos:', error);
      
      if (retryCount < maxRetries) {
        console.log(`Tentando novamente em 1 segundo (tentativa ${retryCount + 2})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return loadMyGroups(retryCount + 1, maxRetries);
      }
      
      toast({
        title: "Erro",
        description: "Erro ao carregar seus grupos. Tente recarregar a página.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para acessar um grupo
  const handleAccessGroup = async (group: GrupoEstudo) => {
    try {
      console.log('Clique em Acessar Grupo para grupo:', group);
      console.log('Acessando grupo:', group);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para acessar um grupo.",
          variant: "destructive",
        });
        return;
      }

      // Verificar se já é membro
      const { data: membership, error: membershipError } = await supabase
        .from('membros_grupos')
        .select('*')
        .eq('grupo_id', group.id)
        .eq('user_id', user.id)
        .single();

      if (membershipError && membershipError.code !== 'PGRST116') {
        console.error('Erro na consulta de membresia:', membershipError);
        toast({
          title: "Erro",
          description: "Problema ao verificar acesso ao grupo.",
          variant: "destructive",
        });
        return;
      }

      if (!membership) {
        // Adicionar como membro se o grupo for público
        if (group.is_public || group.is_visible_to_all) {
          const { error: joinError } = await supabase
            .from('membros_grupos')
            .insert({
              grupo_id: group.id,
              user_id: user.id,
              joined_at: new Date().toISOString()
            });

          if (joinError) {
            console.error('Erro ao entrar no grupo:', joinError);
            toast({
              title: "Erro",
              description: "Não foi possível entrar no grupo.",
              variant: "destructive",
            });
            return;
          }
        }
      }

      toast({
        title: "Sucesso",
        description: `Acesso ao grupo "${group.nome}" realizado com sucesso!`,
      });

      // Aqui você pode redirecionar para a página do grupo ou abrir um modal
      // Por exemplo: navigate(`/grupo/${group.id}`);
      
    } catch (error) {
      console.error('Erro ao acessar grupo:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao acessar o grupo.",
        variant: "destructive",
      });
    }
  };

  // Handlers para os modals
  const handleCreateGroup = (formData: any) => {
    console.log('Grupo criado, recarregando listas...');
    // Recarregar a lista após criação
    if (currentView === "todos-grupos") {
      loadAllGroups();
    } else if (currentView === "meus-grupos") {
      loadMyGroups();
    }
    setShowCreateModal(false);
  };

  const handleGroupAdded = () => {
    console.log('Grupo adicionado via código, recarregando Meus Grupos...');
    // Recarregar especificamente "Meus Grupos" após adicionar grupo via código
    loadMyGroups();
    
    // Se estiver na view "meus-grupos", recarregar também
    if (currentView === "meus-grupos") {
      loadMyGroups();
    }
    
    setShowAddModal(false);
    
    toast({
      title: "Sucesso",
      description: "Grupo adicionado com sucesso! Verifique em 'Meus Grupos'.",
    });
  };

  // Efeito para carregar dados baseado na view atual
  useEffect(() => {
    console.log('Carregando view:', currentView);
    
    if (currentView === "todos-grupos") {
      loadAllGroups();
    } else if (currentView === "meus-grupos") {
      loadMyGroups();
    }
  }, [currentView]);

  // Carregar dados na inicialização
  useEffect(() => {
    loadAllGroups();
  }, []);

  // Filtrar grupos baseado no termo de busca
  const filteredGroups = () => {
    let groups = [];
    
    if (currentView === "todos-grupos") {
      groups = allGroups;
    } else if (currentView === "meus-grupos") {
      groups = myGroups;
    }
    
    if (!searchTerm) return groups;
    
    return groups.filter(group => 
      group.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.disciplina_area?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Converter grupo para formato do GroupCard
  const convertToGroupCardFormat = (group: GrupoEstudo) => ({
    id: group.id,
    nome: group.nome,
    disciplina: group.disciplina_area || group.tipo_grupo || "Geral",
    descricao: group.descricao || "Sem descrição disponível",
    membros: 1, // Placeholder - você pode buscar o número real de membros se necessário
    proximaReuniao: undefined,
    tags: group.tags || [],
    privacidade: group.is_private ? "privado" : group.is_visible_to_all ? "publico" : "restrito",
    icone: <BookOpen className="h-6 w-6 text-[#FF6B00]" />
  });

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 space-y-6 transition-colors duration-300">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] flex items-center justify-center shadow-md">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#001427] dark:text-white bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent font-montserrat">
              Grupos de Estudos
            </h1>
            <p className="text-[#778DA9] dark:text-gray-400 text-sm font-open-sans">
              Conecte-se com outros estudantes e acelere seu aprendizado
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowAddModal(true)}
            variant="outline"
            className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 font-montserrat"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
          
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-montserrat"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Novo Grupo
          </Button>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant={currentView === "todos-grupos" ? "default" : "outline"}
          onClick={() => setCurrentView("todos-grupos")}
          className={`${
            currentView === "todos-grupos"
              ? "bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white"
              : "border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
          } font-montserrat`}
        >
          <Globe className="h-4 w-4 mr-2" />
          Todos os Grupos
        </Button>
        
        <Button
          variant={currentView === "meus-grupos" ? "default" : "outline"}
          onClick={() => setCurrentView("meus-grupos")}
          className={`${
            currentView === "meus-grupos"
              ? "bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white"
              : "border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
          } font-montserrat`}
        >
          <Users className="h-4 w-4 mr-2" />
          Meus Grupos
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar grupos por nome, descrição ou área..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-[#FF6B00]/20 focus:border-[#FF6B00] font-open-sans"
        />
      </div>

      {/* Groups Grid */}
      <div id="all-groups" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-[#FF6B00]/30 border-t-[#FF6B00] rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Carregando grupos...</p>
              </div>
            </div>
          ) : filteredGroups().length > 0 ? (
            filteredGroups().map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <GroupCard
                  group={convertToGroupCardFormat(group)}
                  onClick={() => handleAccessGroup(group)}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                {currentView === "todos-grupos" ? "Nenhum grupo público encontrado" : "Você ainda não faz parte de grupos"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {currentView === "todos-grupos" 
                  ? "Tente ajustar sua busca ou volte mais tarde." 
                  : "Comece criando seu primeiro grupo ou entre em um grupo usando um código."}
              </p>
              {currentView === "meus-grupos" && (
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-montserrat"
                >
                  <Plus className="h-4 w-4 mr-1" /> Criar Grupo
                </Button>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGroup}
      />

      <AddGroupModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onGroupAdded={handleGroupAdded}
      />
    </div>
  );
};

export default GruposEstudoView;
