import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, X, Settings, Eye } from 'lucide-react';
import { FormData, Group } from './types';

interface Props {
  className?: string;
}

const GruposEstudoView: React.FC<Props> = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configGroupId, setConfigGroupId] = useState<string | null>(null);
  const [configGroupData, setConfigGroupData] = useState<Group | null>(null);
  const [configGroupMembers, setConfigGroupMembers] = useState<any[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<'my-groups' | 'all-groups'>('my-groups');

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    descricao: '',
    topico: 'Matemática',
    cor: '#FF6B00',
    isPublico: false,
    isPrivado: true,
    permitirVisibilidade: false
  });

  const topics = [
    { value: "Matemática", label: "📏 Matemática", color: "#3B82F6" },
    { value: "Língua Portuguesa", label: "📚 Língua Portuguesa", color: "#10B981" },
    { value: "Física", label: "⚡ Física", color: "#F59E0B" },
    { value: "Química", label: "🧪 Química", color: "#8B5CF6" },
    { value: "Biologia", label: "🌿 Biologia", color: "#EF4444" },
    { value: "História", label: "📜 História", color: "#F97316" },
    { value: "Geografia", label: "🌍 Geografia", color: "#06B6D4" },
    { value: "Filosofia", label: "🤔 Filosofia", color: "#6366F1" }
  ];

  const colors = [
    "#FF6B00", "#3B82F6", "#10B981", "#F59E0B", 
    "#EF4444", "#8B5CF6", "#06B6D4", "#6366F1"
  ];

  useEffect(() => {
    const loadSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    loadSession();
  }, []);

  useEffect(() => {
    if (user) {
      loadGroups();
    }
  }, [user, currentView]);

  const loadGroups = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      if (currentView === 'my-groups') {
        const { data: myGroupsData, error: myGroupsError } = await supabase
          .from('membros_grupos')
          .select('grupo_id, grupos_estudo(*)')
          .eq('user_id', user.id);

        if (myGroupsError) throw myGroupsError;
        
        const myGroups = myGroupsData?.map(item => item.grupos_estudo).filter(Boolean) || [];
        setGroups(myGroups);
      } else if (currentView === 'all-groups') {
        // Mudança: consultar grupos com permitir_visibilidade = true
        const { data: allGroupsData, error: allGroupsError } = await supabase
          .from('grupos_estudo')
          .select('*')
          .eq('permitir_visibilidade', true);

        if (allGroupsError) throw allGroupsError;
        setGroups(allGroupsData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) {
      alert('Você precisa estar logado para sair do grupo');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('membros_grupos')
        .delete()
        .eq('grupo_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;

      alert('Você saiu do grupo com sucesso!');
      loadGroups();
    } catch (error: any) {
      console.error('Erro ao sair do grupo:', error);
      alert(`Erro ao sair do grupo: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user) {
      alert('Você precisa estar logado para entrar no grupo');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('membros_grupos')
        .insert({
          grupo_id: groupId,
          user_id: user.id,
          joined_at: new Date().toISOString()
        });

      if (error) throw error;

      alert('Você entrou no grupo com sucesso!');
      loadGroups();
    } catch (error: any) {
      console.error('Erro ao entrar no grupo:', error);
      alert(`Erro ao entrar no grupo: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateUniqueCode = (): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return (timestamp + random).toUpperCase().substring(0, 8);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Você precisa estar logado para criar um grupo');
      return;
    }

    if (!formData.nome.trim()) {
      alert('Nome do grupo é obrigatório!');
      return;
    }

    // Verificar se pelo menos uma opção de privacidade foi selecionada
    if (!formData.isPublico && !formData.isPrivado) {
      alert('Selecione a privacidade do grupo (Público ou Privado)');
      return;
    }

    if (formData.isPublico && formData.isPrivado) {
      alert('Selecione apenas uma opção de privacidade');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const selectedTopic = topics.find(t => t.value === formData.topico);
      const codigoUnico = generateUniqueCode();

      const groupData = {
        codigo_unico: codigoUnico,
        user_id: user.id,
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || null,
        topico: formData.topico,
        topico_nome: selectedTopic?.label || formData.topico,
        topico_icon: selectedTopic?.label.split(' ')[0] || "📚",
        cor: formData.cor,
        is_publico: formData.isPublico,
        privado: formData.isPrivado,
        permitir_visibilidade: formData.permitirVisibilidade, // Nova coluna
        visibilidade: 'todos',
        membros: 1
      };

      const { data, error } = await supabase
        .from('grupos_estudo')
        .insert(groupData)
        .select()
        .single();

      if (error) throw error;

      // Adicionar criador como membro
      const { error: memberError } = await supabase
        .from('membros_grupos')
        .insert({
          grupo_id: data.id,
          user_id: user.id,
          joined_at: new Date().toISOString()
        });

      if (memberError) throw memberError;

      alert(`Grupo criado com sucesso! Código: ${codigoUnico}`);
      
      // Reset form
      setFormData({
        nome: '',
        descricao: '',
        topico: 'Matemática',
        cor: '#FF6B00',
        isPublico: false,
        isPrivado: true,
        permitirVisibilidade: false
      });
      
      setIsCreateModalOpen(false);
      loadGroups();
      
    } catch (error: any) {
      console.error('Erro ao criar grupo:', error);
      alert(`Erro ao criar grupo: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showConfigModal = async (groupId: string) => {
    setConfigGroupId(groupId);
    setIsConfigModalOpen(true);

    try {
      const { data: groupData, error: groupError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;
      setConfigGroupData(groupData);

      const { data: membersData, error: membersError } = await supabase
        .from('membros_grupos')
        .select('user_id')
        .eq('grupo_id', groupId);

      if (membersError) throw membersError;
      setConfigGroupMembers(membersData);

    } catch (error) {
      console.error('Erro ao carregar dados do grupo:', error);
      alert('Erro ao carregar dados do grupo');
    }
  };

  const filteredGroups = groups.filter(group =>
    group.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (group.topico_nome && group.topico_nome.toLowerCase().includes(searchQuery.toLowerCase())) ||
    group.topico.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-[#FF6B00]" />
          <div>
            <h2 className="text-2xl font-bold text-[#001427] dark:text-white">
              Grupos de Estudo
            </h2>
            <p className="text-[#778DA9] dark:text-gray-400 text-sm">
              Colabore, compartilhe e aprenda com seus colegas
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          Criar Novo Grupo
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex gap-2">
          <Button
            variant={currentView === 'my-groups' ? 'default' : 'outline'}
            onClick={() => setCurrentView('my-groups')}
            className={currentView === 'my-groups' ? 'bg-[#FF6B00] text-white' : ''}
          >
            Meus Grupos
          </Button>
          <Button
            variant={currentView === 'all-groups' ? 'default' : 'outline'}
            onClick={() => setCurrentView('all-groups')}
            className={currentView === 'all-groups' ? 'bg-[#FF6B00] text-white' : ''}
          >
            Todos os Grupos
          </Button>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar grupos..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de grupos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-4 hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-[#29335C] dark:text-white mb-1">
                    {group.nome}
                  </h3>
                  <p className="text-sm text-[#64748B] dark:text-white/60 mb-2">
                    {group.topico_nome || group.topico}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      Código: {group.codigo_unico}
                    </Badge>
                    <Badge variant={group.is_publico ? "default" : "secondary"} className="text-xs">
                      {group.is_publico ? 'Público' : 'Privado'}
                    </Badge>
                  </div>
                </div>
                
                {currentView === 'my-groups' && (
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => leaveGroup(group.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                      title="Sair do Grupo"
                    >
                      ❌
                    </button>
                    <button
                      className="text-gray-400 p-1 rounded transition-colors cursor-not-allowed"
                      title="Visualizar (Em breve)"
                      disabled
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => showConfigModal(group.id)}
                      className="text-[#FF6B00] hover:text-[#FF8C40] p-1 rounded transition-colors"
                      title="Configurações"
                    >
                      ⚙️
                    </button>
                  </div>
                )}
              </div>

              {currentView === 'all-groups' && (
                <Button
                  onClick={() => joinGroup(group.id)}
                  className="w-full bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-sm"
                  disabled={isLoading}
                >
                  Entrar no Grupo
                </Button>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {isLoading ? 'Carregando...' : 'Nenhum grupo encontrado'}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mt-2">
              {currentView === 'my-groups'
                ? 'Você ainda não participa de nenhum grupo de estudos.'
                : 'Não há grupos disponíveis no momento.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Criar Grupo */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden max-w-lg w-full shadow-xl">
            <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Criar Novo Grupo</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-white/80 hover:text-white hover:bg-white/20"
                onClick={() => setIsCreateModalOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6">
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome do Grupo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Digite o nome do grupo"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descreva o objetivo do grupo (opcional)"
                    className="mt-1 min-h-[80px]"
                  />
                </div>

                <div>
                  <Label htmlFor="topico">Tópico de Estudo</Label>
                  <Select
                    value={formData.topico}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, topico: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione um tópico" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic.value} value={topic.value}>
                          {topic.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Cor do Grupo</Label>
                  <div className="flex gap-2 mt-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.cor === color ? 'border-white' : 'border-gray-400'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData(prev => ({ ...prev, cor: color }))}
                      />
                    ))}
                  </div>
                </div>

                {/* Nova seção de Privacidade do Grupo */}
                <div>
                  <Label>Privacidade do Grupo *</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isPublico}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          isPublico: e.target.checked,
                          isPrivado: e.target.checked ? false : prev.isPrivado
                        }))}
                      />
                      <span>Público</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isPrivado}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          isPrivado: e.target.checked,
                          isPublico: e.target.checked ? false : prev.isPublico
                        }))}
                      />
                      <span>Privado</span>
                    </label>
                  </div>
                </div>

                {/* Nova seção de Visibilidade do Grupo */}
                <div>
                  <Label>Visibilidade do Grupo</Label>
                  <label className="flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      checked={formData.permitirVisibilidade}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        permitirVisibilidade: e.target.checked
                      }))}
                    />
                    <span>Permitir que todos vejam</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white flex-1"
                  >
                    {isSubmitting ? 'Criando...' : 'Criar Grupo'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateModalOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configurações */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden max-w-md w-full shadow-xl">
            <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Configurações do Grupo</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-white/80 hover:text-white hover:bg-white/20"
                onClick={() => setIsConfigModalOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-4 space-y-4">
              {configGroupData ? (
                <>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <h4 className="font-medium mb-2">Informações</h4>
                    <p><strong>Nome:</strong> {configGroupData.nome}</p>
                    <p><strong>Descrição:</strong> {configGroupData.descricao || 'Sem descrição'}</p>
                    <p><strong>Tópico:</strong> {configGroupData.topico}</p>
                    <p><strong>Código:</strong> {configGroupData.codigo_unico}</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <h4 className="font-medium mb-2">Privacidade</h4>
                    <p><strong>Tipo:</strong> {configGroupData.is_publico ? 'Público' : 'Privado'}</p>
                    <p><strong>Visibilidade:</strong> {configGroupData.permitir_visibilidade ? 'Permitida para todos' : 'Restrita'}</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <h4 className="font-medium mb-2">Membros ({configGroupMembers.length})</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {configGroupMembers.map((member: any, index: number) => (
                        <div key={index} className="text-sm">
                          {member.user_id || 'Usuário'}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white" size="sm">
                      Convidar
                    </Button>
                    <Button 
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white" 
                      size="sm"
                      onClick={() => {
                        const shareText = `Código do grupo: ${configGroupData.codigo_unico}`;
                        navigator.clipboard.writeText(shareText);
                        alert('Código copiado para a área de transferência!');
                      }}
                    >
                      Compartilhar
                    </Button>
                  </div>
                </>
              ) : (
                <p>Carregando informações do grupo...</p>
              )}

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsConfigModalOpen(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GruposEstudoView;
