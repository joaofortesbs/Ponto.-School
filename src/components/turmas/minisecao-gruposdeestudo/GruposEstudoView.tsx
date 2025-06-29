import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import GroupCard from "../GroupCard";
import GroupDetail from "../group-detail";
import {
  Plus,
  Search,
  Users,
  BookOpen,
  Globe,
  Lock,
  Eye,
  Users2,
  ArrowRight,
  Sparkles,
  Code,
  Calculator,
  Beaker,
  Atom,
  Dna,
  Languages,
  History,
  MapPin,
  PenTool,
  Music,
  Palette,
  Camera,
  Target,
  TrendingUp,
  Heart,
  Brain,
} from "lucide-react";

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

interface Group {
  id: string;
  nome: string;
  descricao: string;
  disciplina: string;
  membros: number;
  proximaReuniao?: string;
  tags: string[];
  privacidade: string;
  icone: React.ReactNode;
  tipo_grupo?: string;
  is_private?: boolean;
  is_visible_to_all?: boolean;
  criador_id?: string;
}

const iconMap: { [key: string]: React.ReactNode } = {
  matematica: <Calculator className="h-6 w-6 text-[#FF6B00]" />,
  fisica: <Atom className="h-6 w-6 text-[#FF6B00]" />,
  quimica: <Beaker className="h-6 w-6 text-[#FF6B00]" />,
  biologia: <Dna className="h-6 w-6 text-[#FF6B00]" />,
  portugues: <Languages className="h-6 w-6 text-[#FF6B00]" />,
  historia: <History className="h-6 w-6 text-[#FF6B00]" />,
  geografia: <MapPin className="h-6 w-6 text-[#FF6B00]" />,
  redacao: <PenTool className="h-6 w-6 text-[#FF6B00]" />,
  musica: <Music className="h-6 w-6 text-[#FF6B00]" />,
  artes: <Palette className="h-6 w-6 text-[#FF6B00]" />,
  fotografia: <Camera className="h-6 w-6 text-[#FF6B00]" />,
  programacao: <Code className="h-6 w-6 text-[#FF6B00]" />,
  default: <BookOpen className="h-6 w-6 text-[#FF6B00]" />,
};

const disciplinas = [
  "Matemática", "Física", "Química", "Biologia", "Português", "História",
  "Geografia", "Redação", "Música", "Artes", "Fotografia", "Programação"
];

const GruposEstudoView: React.FC = () => {
  const [activeView, setActiveView] = useState<"meus-grupos" | "todos-grupos">("meus-grupos");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showGroupDetail, setShowGroupDetail] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Form states
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    disciplina_area: "",
    tipo_grupo: "publico",
    tags: [] as string[],
    topico_especifico: "",
  });

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadMyGroups();
      loadAllGroups();
    }
  }, [currentUser]);

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

  const loadMyGroups = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // First get groups where user is creator
      const { data: createdGroups, error: createdError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('criador_id', currentUser.id);

      if (createdError) {
        console.error('Erro ao carregar grupos criados:', createdError);
      }

      // Then get groups where user is member
      const { data: memberGroups, error: memberError } = await supabase
        .from('membros_grupos')
        .select(`
          grupos_estudo (*)
        `)
        .eq('user_id', currentUser.id);

      if (memberError) {
        console.error('Erro ao carregar grupos como membro:', memberError);
      }

      // Combine and deduplicate
      const allUserGroups = [
        ...(createdGroups || []),
        ...(memberGroups?.map(mg => mg.grupos_estudo).filter(Boolean) || [])
      ];

      const uniqueGroups = allUserGroups.filter((group, index, self) => 
        index === self.findIndex((g) => g.id === group.id)
      );

      const formattedGroups = uniqueGroups.map(group => ({
        id: group.id,
        nome: group.nome,
        descricao: group.descricao || "",
        disciplina: group.disciplina_area || group.tipo_grupo || "Geral",
        membros: 1, // Will be updated by trigger
        tags: group.tags || [],
        privacidade: group.is_private ? "privado" : "publico",
        icone: iconMap[group.disciplina_area?.toLowerCase()] || iconMap.default,
        tipo_grupo: group.tipo_grupo,
        is_private: group.is_private,
        is_visible_to_all: group.is_visible_to_all,
        criador_id: group.criador_id,
      }));

      setMyGroups(formattedGroups);
    } catch (error) {
      console.error('Erro geral ao carregar meus grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('is_visible_to_all', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar todos os grupos:', error);
        return;
      }

      const formattedGroups = (data || []).map(group => ({
        id: group.id,
        nome: group.nome,
        descricao: group.descricao || "",
        disciplina: group.disciplina_area || group.tipo_grupo || "Geral",
        membros: 1, // Will be updated by trigger
        tags: group.tags || [],
        privacidade: group.is_private ? "privado" : "publico",
        icone: iconMap[group.disciplina_area?.toLowerCase()] || iconMap.default,
        tipo_grupo: group.tipo_grupo,
        is_private: group.is_private,
        is_visible_to_all: group.is_visible_to_all,
        criador_id: group.criador_id,
      }));

      setAllGroups(formattedGroups);
    } catch (error) {
      console.error('Erro ao carregar todos os grupos:', error);
    }
  };

  const handleAccessGroup = (groupId: string) => {
    const group = myGroups.find(g => g.id === groupId);
    if (group) {
      setSelectedGroup(group);
      setShowGroupDetail(true);
    }
  };

  const handleBackFromGroup = () => {
    setShowGroupDetail(false);
    setSelectedGroup(null);
  };

  const handleCreateGroup = async () => {
    if (!currentUser || !formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome do grupo é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('create_group_safe', {
        p_nome: formData.nome.trim(),
        p_descricao: formData.descricao.trim(),
        p_tipo_grupo: formData.tipo_grupo,
        p_disciplina_area: formData.disciplina_area,
        p_topico_especifico: formData.topico_especifico,
        p_tags: formData.tags,
        p_is_public: formData.tipo_grupo === 'publico',
        p_is_visible_to_all: formData.tipo_grupo === 'publico',
        p_is_visible_to_partners: false,
        p_is_private: formData.tipo_grupo === 'privado',
        p_criador_id: currentUser.id
      });

      if (error || !data?.[0]?.success) {
        console.error('Erro ao criar grupo:', error || data?.[0]?.message);
        toast({
          title: "Erro",
          description: data?.[0]?.message || "Erro ao criar grupo",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: `Grupo "${formData.nome}" criado com código: ${data[0].codigo_unico}`,
      });

      // Reset form and close modal
      setFormData({
        nome: "",
        descricao: "",
        disciplina_area: "",
        tipo_grupo: "publico",
        tags: [],
        topico_especifico: "",
      });
      setIsCreateModalOpen(false);
      
      // Reload groups
      await loadMyGroups();
      await loadAllGroups();
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar grupo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!currentUser || !joinCode.trim()) {
      toast({
        title: "Erro",
        description: "Código do grupo é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('join_group_by_code', {
        p_codigo_unico: joinCode.trim(),
        p_user_id: currentUser.id
      });

      if (error || !data?.[0]?.success) {
        console.error('Erro ao entrar no grupo:', error || data?.[0]?.message);
        toast({
          title: "Erro",
          description: data?.[0]?.message || "Erro ao entrar no grupo",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: `${data[0].message}: ${data[0].group_name}`
      });

      setJoinCode("");
      setIsJoinModalOpen(false);
      
      // Reload groups
      await loadMyGroups();
    } catch (error) {
      console.error('Erro ao entrar no grupo:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao entrar no grupo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('membros_grupos')
        .delete()
        .eq('grupo_id', groupId)
        .eq('user_id', currentUser.id);

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
        description: "Você saiu do grupo com sucesso"
      });

      await loadMyGroups();
    } catch (error) {
      console.error('Erro ao sair do grupo:', error);
    }
  };

  const filteredGroups = (activeView === "meus-grupos" ? myGroups : allGroups).filter(group =>
    group.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.disciplina.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (showGroupDetail && selectedGroup) {
    return (
      <GroupDetail 
        group={selectedGroup}
        currentUser={currentUser}
        onBack={handleBackFromGroup}
      />
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-[#001427] via-[#003D5C] to-[#FF6B00]/20 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 font-montserrat">
            Grupos de Estudos
          </h2>
          <p className="text-white/70">
            Conecte-se com outros estudantes e colabore em seus estudos
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white/10 text-white border border-white/20 hover:bg-white/20 font-montserrat">
                <Users className="h-4 w-4 mr-2" />
                Entrar em Grupo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-[#1E293B]">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white">
                  Entrar em um Grupo
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Digite o código do grupo"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="font-mono"
                />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsJoinModalOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleJoinGroup}
                    disabled={loading || !joinCode.trim()}
                    className="flex-1 bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-montserrat">
                <Plus className="h-4 w-4 mr-2" />
                Criar Grupo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-[#1E293B] max-w-md">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white">
                  Criar Novo Grupo
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nome do grupo"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                />
                
                <Textarea
                  placeholder="Descrição do grupo (opcional)"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  rows={3}
                />

                <Select
                  value={formData.disciplina_area}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, disciplina_area: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {disciplinas.map((disciplina) => (
                      <SelectItem key={disciplina} value={disciplina.toLowerCase()}>
                        {disciplina}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={formData.tipo_grupo}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_grupo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo do grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publico">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Público
                      </div>
                    </SelectItem>
                    <SelectItem value="privado">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Privado
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCreateGroup}
                    disabled={loading || !formData.nome.trim()}
                    className="flex-1 bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
                  >
                    {loading ? "Criando..." : "Criar Grupo"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex bg-white/10 rounded-lg p-1">
          <Button
            variant={activeView === "meus-grupos" ? "default" : "ghost"}
            className={`${
              activeView === "meus-grupos"
                ? "bg-[#FF6B00] text-white"
                : "text-white hover:bg-white/10"
            } font-montserrat`}
            onClick={() => setActiveView("meus-grupos")}
          >
            <Users className="h-4 w-4 mr-2" />
            Meus Grupos
          </Button>
          <Button
            variant={activeView === "todos-grupos" ? "default" : "ghost"}
            className={`${
              activeView === "todos-grupos"
                ? "bg-[#FF6B00] text-white"
                : "text-white hover:bg-white/10"
            } font-montserrat`}
            onClick={() => setActiveView("todos-grupos")}
          >
            <Globe className="h-4 w-4 mr-2" />
            Todos os Grupos
          </Button>
        </div>

        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
            <Input
              placeholder="Buscar grupos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onClick={() => {}}
              view={activeView}
              onLeave={activeView === "meus-grupos" ? () => handleLeaveGroup(group.id) : undefined}
              onAccess={activeView === "meus-grupos" ? handleAccessGroup : undefined}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredGroups.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-white/50" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">
            {activeView === "meus-grupos" ? "Nenhum grupo encontrado" : "Nenhum grupo público encontrado"}
          </h3>
          <p className="text-white/70 mb-6">
            {activeView === "meus-grupos" 
              ? "Crie seu primeiro grupo ou entre em um grupo existente"
              : "Não há grupos públicos disponíveis no momento"
            }
          </p>
          {activeView === "meus-grupos" && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-montserrat"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Grupo
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default GruposEstudoView;
