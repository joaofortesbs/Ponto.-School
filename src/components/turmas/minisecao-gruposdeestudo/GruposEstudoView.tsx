
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AddGroupModal from "../AddGroupModal";
import { Plus, Users, Search, Crown, UserPlus } from "lucide-react";

interface Group {
  id: string;
  nome: string;
  tipo_grupo: string;
  codigo_unico: string;
  is_private: boolean;
  is_visible_to_all: boolean;
  disciplina_area?: string;
  topico_especifico?: string;
  tags?: string[];
}

const GruposEstudoView: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estados do formulário de criação
  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [disciplinaArea, setDisciplinaArea] = useState("");
  const [topicoEspecifico, setTopicoEspecifico] = useState("");
  const [tags, setTags] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isVisibleToAll, setIsVisibleToAll] = useState(false);

  useEffect(() => {
    if (user) {
      loadMyGroups();
      loadAllGroups();
    }
  }, [user]);

  const loadMyGroups = async () => {
    if (!user) return;

    try {
      console.log('Carregando meus grupos...');
      const { data, error } = await supabase
        .from('grupos_estudo')
        .select('id, nome, tipo_grupo, codigo_unico, is_private, is_visible_to_all')
        .eq('criador_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar meus grupos:', error);
        return;
      }

      console.log('Meus grupos carregados:', data);
      setMyGroups(data || []);
    } catch (error) {
      console.error('Erro geral ao carregar meus grupos:', error);
    }
  };

  const loadAllGroups = async (retryCount = 0, maxRetries = 3) => {
    try {
      console.log(`Tentativa ${retryCount + 1} de carregar grupos visíveis para todos...`);
      const { data, error } = await supabase
        .from('grupos_estudo')
        .select('id, nome, tipo_grupo, codigo_unico, is_private, is_visible_to_all')
        .eq('is_visible_to_all', true) // Filtrar apenas grupos com "Visível para Todos"
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar Todos os Grupos:', error.message, error.details);
        if (retryCount < maxRetries) {
          console.log(`Tentando novamente em 1 segundo (tentativa ${retryCount + 2})...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return loadAllGroups(retryCount + 1, maxRetries);
        }
        return;
      }

      console.log('Dados retornados do Supabase para grupos visíveis:', data);
      if (!data || data.length === 0) {
        console.warn('Nenhum grupo com "Visível para Todos" encontrado.');
        setAllGroups([]);
        return;
      }

      setAllGroups(data);
      console.log(`Grade "Todos os Grupos" carregada com ${data.length} grupos.`);

    } catch (error) {
      console.error('Erro geral em loadAllGroups:', error.message, error.stack);
      if (retryCount < maxRetries) {
        console.log(`Tentando novamente em 1 segundo (tentativa ${retryCount + 2})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return loadAllGroups(retryCount + 1, maxRetries);
      }
    }
  };

  const createGroup = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    if (!groupName.trim() || !groupType) {
      toast({
        title: "Erro",
        description: "Nome e tipo do grupo são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Criando grupo com dados:', {
        nome: groupName.trim(),
        tipo_grupo: groupType,
        is_visible_to_all: isVisibleToAll,
        is_private: isPrivate
      });

      const { data, error } = await supabase.rpc('create_group_safe', {
        p_nome: groupName.trim(),
        p_descricao: groupDescription.trim() || null,
        p_tipo_grupo: groupType,
        p_disciplina_area: disciplinaArea.trim() || null,
        p_topico_especifico: topicoEspecifico.trim() || null,
        p_tags: tags.trim() ? tags.split(',').map(tag => tag.trim()) : [],
        p_is_private: isPrivate,
        p_is_visible_to_all: isVisibleToAll,
        p_criador_id: user.id
      });

      if (error) {
        console.error('Erro ao criar grupo:', error);
        toast({
          title: "Erro",
          description: `Erro ao criar grupo: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      if (!data || data.length === 0) {
        console.error('Nenhum resultado retornado');
        toast({
          title: "Erro",
          description: "Erro inesperado ao criar grupo",
          variant: "destructive"
        });
        return;
      }

      const result = data[0];
      if (!result.success) {
        console.error('Falha na criação:', result.message);
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Grupo criado com sucesso:', result, 'is_visible_to_all:', isVisibleToAll);
      
      toast({
        title: "Sucesso",
        description: `Grupo "${result.nome}" criado com sucesso! Código: ${result.codigo_unico}`,
      });

      // Resetar formulário
      setGroupName("");
      setGroupType("");
      setGroupDescription("");
      setDisciplinaArea("");
      setTopicoEspecifico("");
      setTags("");
      setIsPrivate(false);
      setIsVisibleToAll(false);
      setIsCreateModalOpen(false);

      // Recarregar grades
      await loadMyGroups();
      await loadAllGroups();

    } catch (error) {
      console.error('Erro geral ao criar grupo:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar grupo",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupAdded = () => {
    loadMyGroups();
    loadAllGroups();
    setIsAddModalOpen(false);
  };

  return (
    <div className="w-full space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#29335C] dark:text-white">
          Grupos de Estudos
        </h2>
        <div className="flex gap-3">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Entrar em Grupo
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#29335C] hover:bg-[#3A4A6B] text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            Criar Grupo
          </Button>
        </div>
      </div>

      {/* Meus Grupos */}
      <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="h-5 w-5 text-[#FF6B00]" />
          <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
            Meus Grupos ({myGroups.length})
          </h3>
        </div>
        
        {myGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myGroups.map((group) => (
              <div
                key={group.id}
                className="bg-[#f7f9fa] dark:bg-[#1E293B] rounded-lg border border-[#E0E1DD] dark:border-white/10 p-4 hover:shadow-md transition-all duration-300"
              >
                <h4 className="font-medium text-[#29335C] dark:text-white mb-2">
                  {group.nome}
                </h4>
                <p className="text-sm text-[#64748B] dark:text-white/60 mb-2">
                  <strong>Tipo:</strong> {group.tipo_grupo}
                </p>
                <p className="text-sm text-[#64748B] dark:text-white/60 mb-2">
                  <strong>Código:</strong> {group.codigo_unico}
                </p>
                <p className="text-sm text-[#64748B] dark:text-white/60">
                  <strong>Visibilidade:</strong> {group.is_visible_to_all ? "Visível para Todos" : group.is_private ? "Privado" : "Padrão"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#64748B] dark:text-white/60 text-center py-8">
            Você ainda não criou nenhum grupo. Clique em "Criar Grupo" para começar!
          </p>
        )}
      </div>

      {/* Todos os Grupos */}
      <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-[#FF6B00]" />
          <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
            Todos os Grupos ({allGroups.length})
          </h3>
        </div>
        
        {allGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allGroups.map((group) => (
              <div
                key={group.id}
                className="bg-[#f7f9fa] dark:bg-[#1E293B] rounded-lg border border-[#E0E1DD] dark:border-white/10 p-4 hover:shadow-md transition-all duration-300"
              >
                <h4 className="font-medium text-[#29335C] dark:text-white mb-2">
                  {group.nome}
                </h4>
                <p className="text-sm text-[#64748B] dark:text-white/60 mb-2">
                  <strong>Tipo:</strong> {group.tipo_grupo}
                </p>
                <p className="text-sm text-[#64748B] dark:text-white/60">
                  <strong>Visibilidade:</strong> Visível para Todos
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#64748B] dark:text-white/60 text-center py-8">
            Nenhum grupo público disponível no momento.
          </p>
        )}
      </div>

      {/* Modal de Criação de Grupo */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Criar Novo Grupo</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-white/80 hover:text-white hover:bg-white/20"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isLoading}
              >
                ×
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupName" className="text-[#29335C] dark:text-white">
                  Nome do Grupo *
                </Label>
                <Input
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Digite o nome do grupo"
                  className="border-gray-300 dark:border-gray-600"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="groupType" className="text-[#29335C] dark:text-white">
                  Tipo de Grupo *
                </Label>
                <Select value={groupType} onValueChange={setGroupType} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Estudo">Estudo</SelectItem>
                    <SelectItem value="Pesquisa">Pesquisa</SelectItem>
                    <SelectItem value="Projeto">Projeto</SelectItem>
                    <SelectItem value="Discussão">Discussão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="groupDescription" className="text-[#29335C] dark:text-white">
                  Descrição
                </Label>
                <Textarea
                  id="groupDescription"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Descreva o propósito do grupo"
                  className="border-gray-300 dark:border-gray-600"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isVisibleToAll"
                    checked={isVisibleToAll}
                    onCheckedChange={setIsVisibleToAll}
                    disabled={isLoading}
                  />
                  <Label htmlFor="isVisibleToAll" className="text-[#29335C] dark:text-white">
                    🌟 Visível para Todos (aparece na lista pública)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPrivate"
                    checked={isPrivate}
                    onCheckedChange={setIsPrivate}
                    disabled={isLoading}
                  />
                  <Label htmlFor="isPrivate" className="text-[#29335C] dark:text-white">
                    🔒 Grupo Privado
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={createGroup}
                  disabled={isLoading}
                  className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
                >
                  {isLoading ? "Criando..." : "Criar Grupo"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddGroupModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onGroupAdded={handleGroupAdded}
      />
    </div>
  );
};

export default GruposEstudoView;
