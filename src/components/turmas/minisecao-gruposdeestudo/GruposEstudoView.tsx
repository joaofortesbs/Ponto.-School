
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Plus, Search, Hash, Lock, Globe, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface Group {
  id: string;
  nome: string;
  tipo_grupo: string;
  disciplina_area?: string;
  topico_especifico?: string;
  tags?: string[];
  codigo_unico: string;
  is_private: boolean;
  is_visible_to_all: boolean;
  created_at: string;
  criador_id: string;
}

export default function GruposEstudoView() {
  const [activeTab, setActiveTab] = useState('meus-grupos');
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [joinCode, setJoinCode] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCelebrationModalOpen, setIsCelebrationModalOpen] = useState(false);
  const [createdGroup, setCreatedGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [topico, setTopico] = useState('');
  const [tags, setTags] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isVisibleToAll, setIsVisibleToAll] = useState(false);

  useEffect(() => {
    loadMyGroups();
    loadAllGroups();
  }, []);

  const getCurrentUserId = () => {
    return localStorage.getItem('currentUserId') || 'user-123';
  };

  const loadMyGroups = async () => {
    try {
      const userId = getCurrentUserId();
      const { data, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('criador_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar meus grupos:', error);
        toast.error('Erro ao carregar seus grupos');
        return;
      }

      setMyGroups(data || []);
    } catch (error) {
      console.error('Erro geral ao carregar meus grupos:', error);
      toast.error('Erro ao carregar grupos');
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
        toast.error('Erro ao carregar grupos públicos');
        return;
      }

      setAllGroups(data || []);
    } catch (error) {
      console.error('Erro geral ao carregar todos os grupos:', error);
      toast.error('Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim() || !groupType) {
      toast.error('Nome e tipo do grupo são obrigatórios');
      return;
    }

    try {
      const userId = getCurrentUserId();
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      const { data, error } = await supabase
        .from('grupos_estudo')
        .insert({
          nome: groupName.trim(),
          tipo_grupo: groupType,
          disciplina_area: disciplina.trim() || null,
          topico_especifico: topico.trim() || null,
          tags: tagsArray,
          criador_id: userId,
          is_private: isPrivate,
          is_visible_to_all: isVisibleToAll
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar grupo:', error);
        toast.error('Erro ao criar grupo');
        return;
      }

      // Adicionar o criador como membro do grupo
      const { error: memberError } = await supabase
        .from('membros_grupos')
        .insert({
          grupo_id: data.id,
          user_id: userId
        });

      if (memberError) {
        console.error('Erro ao adicionar criador como membro:', memberError);
      }

      setCreatedGroup(data);
      setIsCreateModalOpen(false);
      setIsCelebrationModalOpen(true);
      resetForm();
      await loadMyGroups();
      await loadAllGroups();
      
      toast.success('Grupo criado com sucesso!');
    } catch (error) {
      console.error('Erro geral ao criar grupo:', error);
      toast.error('Erro ao criar grupo');
    }
  };

  const joinGroupByCode = async () => {
    if (!joinCode.trim()) {
      toast.error('Digite o código do grupo');
      return;
    }

    try {
      const userId = getCurrentUserId();
      
      // Buscar o grupo pelo código
      const { data: group, error: groupError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('codigo_unico', joinCode.trim().toUpperCase())
        .single();

      if (groupError || !group) {
        toast.error('Grupo não encontrado');
        return;
      }

      // Verificar se já é membro
      const { data: existingMember } = await supabase
        .from('membros_grupos')
        .select('*')
        .eq('grupo_id', group.id)
        .eq('user_id', userId)
        .single();

      if (existingMember) {
        toast.info('Você já é membro deste grupo');
        setIsJoinModalOpen(false);
        setJoinCode('');
        return;
      }

      // Adicionar como membro
      const { error: joinError } = await supabase
        .from('membros_grupos')
        .insert({
          grupo_id: group.id,
          user_id: userId
        });

      if (joinError) {
        console.error('Erro ao entrar no grupo:', joinError);
        toast.error('Erro ao entrar no grupo');
        return;
      }

      toast.success(`Você entrou no grupo "${group.nome}"!`);
      setIsJoinModalOpen(false);
      setJoinCode('');
      await loadMyGroups();
    } catch (error) {
      console.error('Erro geral ao entrar no grupo:', error);
      toast.error('Erro ao entrar no grupo');
    }
  };

  const resetForm = () => {
    setGroupName('');
    setGroupType('');
    setDisciplina('');
    setTopico('');
    setTags('');
    setIsPrivate(false);
    setIsVisibleToAll(false);
  };

  const getVisibilityIcon = (group: Group) => {
    if (group.is_private) return <Lock className="w-4 h-4 text-red-500" />;
    if (group.is_visible_to_all) return <Globe className="w-4 h-4 text-green-500" />;
    return <Eye className="w-4 h-4 text-blue-500" />;
  };

  const getVisibilityText = (group: Group) => {
    if (group.is_private) return 'Privado';
    if (group.is_visible_to_all) return 'Público';
    return 'Visível para Parceiros';
  };

  const renderGroupCard = (group: Group, showJoinButton = false) => (
    <Card key={group.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{group.nome}</CardTitle>
          {getVisibilityIcon(group)}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">{group.tipo_grupo}</Badge>
          <span>•</span>
          <span>{getVisibilityText(group)}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {group.disciplina_area && (
          <p className="text-sm"><strong>Área:</strong> {group.disciplina_area}</p>
        )}
        {group.topico_especifico && (
          <p className="text-sm"><strong>Tópico:</strong> {group.topico_especifico}</p>
        )}
        {group.tags && group.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {group.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Hash className="w-4 h-4" />
            <span className="font-mono">{group.codigo_unico}</span>
          </div>
          {showJoinButton && (
            <Button size="sm" variant="outline">
              Acessar Grupo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando grupos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Grupos de Estudo</h2>
            <p className="text-muted-foreground">Colabore e aprenda com outros estudantes</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Hash className="w-4 h-4 mr-2" />
                Entrar com Código
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Entrar em um Grupo</DialogTitle>
                <DialogDescription>
                  Digite o código único do grupo para participar
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="joinCode">Código do Grupo</Label>
                  <Input
                    id="joinCode"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Ex: ABC123"
                    className="font-mono"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsJoinModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={joinGroupByCode}>
                  Entrar no Grupo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Criar Grupo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Grupo</DialogTitle>
                <DialogDescription>
                  Crie um grupo de estudos para colaborar com outros estudantes
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="groupName">Nome do Grupo *</Label>
                  <Input
                    id="groupName"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Ex: Matemática Avançada"
                  />
                </div>
                
                <div>
                  <Label htmlFor="groupType">Tipo de Grupo *</Label>
                  <Select value={groupType} onValueChange={setGroupType}>
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

                <div>
                  <Label htmlFor="disciplina">Disciplina/Área</Label>
                  <Input
                    id="disciplina"
                    value={disciplina}
                    onChange={(e) => setDisciplina(e.target.value)}
                    placeholder="Ex: Matemática, Física, História..."
                  />
                </div>

                <div>
                  <Label htmlFor="topico">Tópico Específico</Label>
                  <Input
                    id="topico"
                    value={topico}
                    onChange={(e) => setTopico(e.target.value)}
                    placeholder="Ex: Cálculo Diferencial, Segunda Guerra..."
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Ex: cálculo, derivadas, limites"
                  />
                </div>

                {/* Configurações de Privacidade */}
                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-sm font-medium">Configurações de Privacidade</Label>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPrivate"
                      checked={isPrivate}
                      onCheckedChange={setIsPrivate}
                    />
                    <Label htmlFor="isPrivate" className="text-sm">
                      🔒 Grupo Privado (apenas por convite)
                    </Label>
                  </div>
                  
                  {!isPrivate && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isVisibleToAll"
                        checked={isVisibleToAll}
                        onCheckedChange={setIsVisibleToAll}
                      />
                      <Label htmlFor="isVisibleToAll" className="text-sm">
                        🌟 Visível para Todos (aparece na lista pública)
                      </Label>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={createGroup}>
                  Criar Grupo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="meus-grupos">Meus Grupos</TabsTrigger>
          <TabsTrigger value="todos-grupos">Todos os Grupos</TabsTrigger>
        </TabsList>

        <TabsContent value="meus-grupos" className="space-y-4">
          {myGroups.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum grupo criado</h3>
              <p className="text-muted-foreground mb-4">
                Você ainda não criou nenhum grupo de estudos
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Grupo
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myGroups.map(group => renderGroupCard(group))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="todos-grupos" className="space-y-4">
          {allGroups.length === 0 ? (
            <Card className="p-8 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum grupo público</h3>
              <p className="text-muted-foreground">
                Não há grupos públicos disponíveis no momento
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allGroups.map(group => renderGroupCard(group, true))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Comemoração */}
      <Dialog open={isCelebrationModalOpen} onOpenChange={setIsCelebrationModalOpen}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl">🎉 Parabéns!</DialogTitle>
            <DialogDescription className="text-base">
              Seu grupo foi criado com sucesso!
            </DialogDescription>
          </DialogHeader>
          {createdGroup && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-lg">{createdGroup.nome}</h3>
                <p className="text-sm text-muted-foreground">{createdGroup.tipo_grupo}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Hash className="w-4 h-4" />
                  <span className="font-mono font-bold text-lg">{createdGroup.codigo_unico}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Compartilhe o código acima para convidar outros membros!
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsCelebrationModalOpen(false)} className="w-full">
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
