
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, Filter, Crown, Lock, Globe, Trophy, Star, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StudyGroup {
  id: string;
  nome: string;
  tipo_grupo: string;
  codigo_unico: string;
  is_private: boolean;
  is_visible_to_all: boolean;
  disciplina_area?: string;
  topico_especifico?: string;
  tags?: string[];
  criador_id: string;
  created_at: string;
}

const GruposEstudoView: React.FC = () => {
  const { user } = useAuth();
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [allGroups, setAllGroups] = useState<StudyGroup[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCelebrationModalOpen, setIsCelebrationModalOpen] = useState(false);
  const [celebrationGroup, setCelebrationGroup] = useState<StudyGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');

  // Form states
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState('');
  const [disciplineArea, setDisciplineArea] = useState('');
  const [specificTopic, setSpecificTopic] = useState('');
  const [tags, setTags] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isVisibleToAll, setIsVisibleToAll] = useState(false);

  const loadMyGroups = async () => {
    if (!user) return;
    
    try {
      console.log('Carregando meus grupos...');
      const { data, error } = await supabase
        .from('grupos_estudo')
        .select('*')
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
        .select('*')
        .eq('is_visible_to_all', true)
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

      console.log('Dados retornados do Supabase:', data);
      if (!data || data.length === 0) {
        console.warn('Nenhum grupo com "Visível para Todos" encontrado.');
        setAllGroups([]);
        return;
      }

      console.log(`${data.length} grupos visíveis para todos carregados.`);
      setAllGroups(data);
    } catch (error) {
      console.error('Erro geral em loadAllGroups:', error);
      if (retryCount < maxRetries) {
        console.log(`Tentando novamente em 1 segundo (tentativa ${retryCount + 2})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return loadAllGroups(retryCount + 1, maxRetries);
      }
    }
  };

  const createGroup = async () => {
    if (!user) {
      alert('Você precisa estar logado para criar um grupo.');
      return;
    }

    if (!groupName.trim() || !groupType) {
      alert('Nome do grupo e tipo são obrigatórios.');
      return;
    }

    try {
      const groupData = {
        nome: groupName.trim(),
        criador_id: user.id,
        tipo_grupo: groupType,
        disciplina_area: disciplineArea.trim() || null,
        topico_especifico: specificTopic.trim() || null,
        tags: tags.trim() ? tags.split(',').map(tag => tag.trim()) : [],
        is_private: isPrivate,
        is_visible_to_all: isVisibleToAll,
        codigo_unico: Math.random().toString(36).substring(2, 8).toUpperCase()
      };

      console.log('Criando grupo com dados:', groupData);

      const { data, error } = await supabase
        .from('grupos_estudo')
        .insert([groupData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar grupo:', error);
        alert(`Erro: ${error.message}`);
        return;
      }

      console.log('Grupo criado com sucesso:', data, 'is_visible_to_all:', data.is_visible_to_all);

      // Adicionar o criador como membro do grupo
      const { error: joinError } = await supabase
        .from('membros_grupos')
        .insert([{ grupo_id: data.id, user_id: user.id }]);

      if (joinError) {
        console.error('Erro ao associar criador:', joinError);
      }

      // Mostrar modal de comemoração
      setCelebrationGroup(data);
      setIsCelebrationModalOpen(true);
      setIsCreateModalOpen(false);

      // Limpar formulário
      resetForm();

      // Recarregar grupos
      await loadMyGroups();
      await loadAllGroups();
    } catch (error) {
      console.error('Erro geral ao criar grupo:', error);
      alert('Erro ao criar grupo. Verifique o console.');
    }
  };

  const resetForm = () => {
    setGroupName('');
    setGroupType('');
    setDisciplineArea('');
    setSpecificTopic('');
    setTags('');
    setIsPrivate(false);
    setIsVisibleToAll(false);
  };

  const joinGroupByCode = async () => {
    if (!user) {
      alert('Você precisa estar logado para entrar em um grupo.');
      return;
    }

    if (!joinCode.trim()) {
      alert('Digite o código do grupo.');
      return;
    }

    try {
      const { data: group, error: groupError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('codigo_unico', joinCode.trim().toUpperCase())
        .single();

      if (groupError || !group) {
        alert('Código do grupo inválido ou grupo não encontrado.');
        return;
      }

      const { error: joinError } = await supabase
        .from('membros_grupos')
        .insert([{ grupo_id: group.id, user_id: user.id }]);

      if (joinError) {
        if (joinError.code === '23505') {
          alert('Você já é membro deste grupo.');
        } else {
          alert('Erro ao entrar no grupo.');
        }
        return;
      }

      alert(`Você entrou no grupo "${group.nome}" com sucesso!`);
      setJoinCode('');
      setIsJoinModalOpen(false);
      await loadMyGroups();
    } catch (error) {
      console.error('Erro ao entrar no grupo:', error);
      alert('Erro ao entrar no grupo.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadMyGroups(), loadAllGroups()]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Grupos de Estudos</h1>
            <p className="text-gray-600 dark:text-gray-400">Conecte-se com outros estudantes</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Search className="h-4 w-4" />
                Entrar via Código
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Entrar em um Grupo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="joinCode">Código do Grupo</Label>
                  <Input
                    id="joinCode"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Digite o código do grupo"
                  />
                </div>
                <Button onClick={joinGroupByCode} className="w-full">
                  Entrar no Grupo
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] gap-2">
                <Plus className="h-4 w-4" />
                Criar Grupo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Grupo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="groupName">Nome do Grupo *</Label>
                  <Input
                    id="groupName"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Digite o nome do grupo"
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
                  <Label htmlFor="disciplineArea">Disciplina/Área</Label>
                  <Input
                    id="disciplineArea"
                    value={disciplineArea}
                    onChange={(e) => setDisciplineArea(e.target.value)}
                    placeholder="Ex: Matemática, História..."
                  />
                </div>

                <div>
                  <Label htmlFor="specificTopic">Tópico Específico</Label>
                  <Input
                    id="specificTopic"
                    value={specificTopic}
                    onChange={(e) => setSpecificTopic(e.target.value)}
                    placeholder="Ex: Cálculo I, Segunda Guerra..."
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Ex: difícil, urgente, colaborativo"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPrivate"
                      checked={isPrivate}
                      onCheckedChange={setIsPrivate}
                    />
                    <Label htmlFor="isPrivate" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      🔒 Grupo Privado (apenas com convite)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isVisibleToAll"
                      checked={isVisibleToAll}
                      onCheckedChange={setIsVisibleToAll}
                    />
                    <Label htmlFor="isVisibleToAll" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      🌟 Visível para Todos (aparece na lista pública)
                    </Label>
                  </div>
                </div>

                <Button onClick={createGroup} className="w-full">
                  Criar Grupo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Meus Grupos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-[#FF6B00]" />
            Meus Grupos ({myGroups.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myGroups.map((group) => (
                <motion.div
                  key={group.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{group.nome}</h3>
                    <Badge variant="outline">{group.tipo_grupo}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Código: {group.codigo_unico}
                  </p>
                  <div className="flex gap-1 flex-wrap">
                    {group.is_private && (
                      <Badge variant="secondary" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Privado
                      </Badge>
                    )}
                    {group.is_visible_to_all && (
                      <Badge variant="secondary" className="text-xs">
                        <Globe className="h-3 w-3 mr-1" />
                        Público
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Você ainda não criou nenhum grupo.</p>
              <p className="text-sm">Clique em "Criar Grupo" para começar!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Todos os Grupos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-[#FF6B00]" />
            Todos os Grupos ({allGroups.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="all-groups">
              {allGroups.map((group) => (
                <motion.div
                  key={group.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{group.nome}</h3>
                    <Badge variant="outline">{group.tipo_grupo}</Badge>
                  </div>
                  {group.disciplina_area && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {group.disciplina_area}
                    </p>
                  )}
                  {group.topico_especifico && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                      {group.topico_especifico}
                    </p>
                  )}
                  <div className="flex gap-1 flex-wrap mb-3">
                    <Badge variant="secondary" className="text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      Visível para Todos
                    </Badge>
                    {group.tags && group.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Acessar Grupo
                  </Button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum grupo público disponível no momento.</p>
              <p className="text-sm">Grupos com "Visível para Todos" aparecerão aqui.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Comemoração */}
      <Dialog open={isCelebrationModalOpen} onOpenChange={setIsCelebrationModalOpen}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl">🎉 Parabéns!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-6xl">🎊</div>
            <p className="text-lg">
              Seu grupo <strong>"{celebrationGroup?.nome}"</strong> foi criado com sucesso!
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Código do grupo:</p>
              <p className="text-2xl font-bold text-[#FF6B00]">
                {celebrationGroup?.codigo_unico}
              </p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Compartilhe este código com outros estudantes para que eles possam entrar no seu grupo!
            </p>
            <Button 
              onClick={() => setIsCelebrationModalOpen(false)}
              className="w-full"
            >
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GruposEstudoView;
