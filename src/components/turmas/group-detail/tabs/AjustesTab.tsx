import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Shield, 
  Bell, 
  Users, 
  Globe, 
  Lock, 
  Eye,
  Trash2,
  Save,
  X,
  Plus,
  AlertTriangle,
  Info,
  BookOpen,
  Brain,
  Target,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GroupSettings {
  // Configurações Gerais
  nome: string;
  descricao: string;
  disciplina_area: string;
  topico_especifico: string;
  tags: string[];
  codigo_unico: string;

  // Configurações de Privacidade
  is_public: boolean;
  is_private: boolean;
  is_visible_to_all: boolean;
  is_visible_to_partners: boolean;

  // Configurações de Membros
  max_members: number;
  require_approval: boolean;
  allow_member_invites: boolean;

  // Configurações de Notificações
  notify_new_members: boolean;
  notify_new_messages: boolean;
  notify_new_materials: boolean;

  // Configurações Avançadas
  backup_automatico: boolean;
  notificacoes_ativas: boolean;
  moderacao_automatica: boolean;
}

interface AjustesTabProps {
  groupId: string;
  group: any;
}

export default function AjustesTab({ groupId, group }: AjustesTabProps) {
  const [settings, setSettings] = useState<GroupSettings>({
    nome: '',
    descricao: '',
    disciplina_area: '',
    topico_especifico: '',
    tags: [],
    codigo_unico: '',
    is_public: false,
    is_private: false,
    is_visible_to_all: false,
    is_visible_to_partners: false,
    max_members: 50,
    require_approval: false,
    allow_member_invites: true,
    notify_new_members: true,
    notify_new_messages: true,
    notify_new_materials: true,
    backup_automatico: true,
    notificacoes_ativas: true,
    moderacao_automatica: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('gerais');
  const [newTag, setNewTag] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadGroupSettings();
  }, [groupId, group]);

  const loadGroupSettings = async () => {
    try {
      // Se temos os dados do grupo passados como prop, usamos eles
      if (group) {
        setSettings({
          nome: group.nome || '',
          descricao: group.descricao || '',
          disciplina_area: group.disciplina_area || '',
          topico_especifico: group.topico_especifico || '',
          tags: group.tags || [],
          codigo_unico: group.codigo_unico || '',
          is_public: group.is_public ?? false,
          is_private: group.is_private ?? false,
          is_visible_to_all: group.is_visible_to_all ?? false,
          is_visible_to_partners: group.is_visible_to_partners ?? false,
          max_members: group.max_members ?? 50,
          require_approval: group.require_approval ?? false,
          allow_member_invites: group.allow_member_invites ?? true,
          notify_new_members: group.notify_new_members ?? true,
          notify_new_messages: group.notify_new_messages ?? true,
          notify_new_materials: group.notify_new_materials ?? true,
          backup_automatico: group.backup_automatico ?? true,
          notificacoes_ativas: group.notificacoes_ativas ?? true,
          moderacao_automatica: group.moderacao_automatica ?? false
        });
      } else {
        // Caso contrário, buscamos do banco
        const { data: groupData, error } = await supabase
          .from('grupos_estudo')
          .select('*')
          .eq('id', groupId)
          .single();

        if (error) {
          console.error('Erro ao carregar configurações do grupo:', error);
          toast({
            title: "Erro",
            description: "Erro ao carregar configurações do grupo",
            variant: "destructive"
          });
          return;
        }

        setSettings({
          nome: groupData.nome || '',
          descricao: groupData.descricao || '',
          disciplina_area: groupData.disciplina_area || '',
          topico_especifico: groupData.topico_especifico || '',
          tags: groupData.tags || [],
          codigo_unico: groupData.codigo_unico || '',
          is_public: groupData.is_public ?? false,
          is_private: groupData.is_private ?? false,
          is_visible_to_all: groupData.is_visible_to_all ?? false,
          is_visible_to_partners: groupData.is_visible_to_partners ?? false,
          max_members: groupData.max_members ?? 50,
          require_approval: groupData.require_approval ?? false,
          allow_member_invites: groupData.allow_member_invites ?? true,
          notify_new_members: groupData.notify_new_members ?? true,
          notify_new_messages: groupData.notify_new_messages ?? true,
          notify_new_materials: groupData.notify_new_materials ?? true,
          backup_automatico: groupData.backup_automatico ?? true,
          notificacoes_ativas: groupData.notificacoes_ativas ?? true,
          moderacao_automatica: groupData.moderacao_automatica ?? false
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações do grupo",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('grupos_estudo')
        .update({
          nome: settings.nome,
          descricao: settings.descricao,
          disciplina_area: settings.disciplina_area,
          topico_especifico: settings.topico_especifico,
          tags: settings.tags,
          is_public: settings.is_public,
          is_private: settings.is_private,
          is_visible_to_all: settings.is_visible_to_all,
          is_visible_to_partners: settings.is_visible_to_partners,
          max_members: settings.max_members,
          require_approval: settings.require_approval,
          allow_member_invites: settings.allow_member_invites,
          notify_new_members: settings.notify_new_members,
          notify_new_messages: settings.notify_new_messages,
          notify_new_materials: settings.notify_new_materials,
          backup_automatico: settings.backup_automatico,
          notificacoes_ativas: settings.notificacoes_ativas,
          moderacao_automatica: settings.moderacao_automatica
        })
        .eq('id', groupId);

      if (error) {
        console.error('Erro ao salvar configurações:', error);
        toast({
          title: "Erro",
          description: "Erro ao salvar configurações. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
        variant: "default"
      });

    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !settings.tags.includes(newTag.trim())) {
      setSettings({
        ...settings,
        tags: [...settings.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSettings({
      ...settings,
      tags: settings.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTag();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-gray-100 dark:bg-[#1a2236] rounded-lg p-4 shadow-sm">
        <div className="flex h-[calc(100vh-200px)]">
          {/* Menu Lateral Esquerdo */}
          <div className="w-64 flex-shrink-0 pr-6">
            <div className="bg-white dark:bg-[#0f1525] rounded-lg p-4 border border-gray-200 dark:border-gray-800 shadow-sm h-full">
              <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">
                Menu
              </h3>
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  className={`w-full justify-start rounded-xl h-12 ${
                    activeSection === 'gerais' 
                      ? 'bg-[#FF6B00] hover:bg-[#FF8C40] text-white font-medium' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => setActiveSection('gerais')}
                >
                  <Info className="h-4 w-4 mr-3" />
                  Informações Gerais
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start rounded-xl h-12 ${
                    activeSection === 'privacidade' 
                      ? 'bg-[#FF6B00] hover:bg-[#FF8C40] text-white font-medium' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => setActiveSection('privacidade')}
                >
                  <Shield className="h-4 w-4 mr-3" />
                  Privacidade & Acesso
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start rounded-xl h-12 ${
                    activeSection === 'membros' 
                      ? 'bg-[#FF6B00] hover:bg-[#FF8C40] text-white font-medium' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => setActiveSection('membros')}
                >
                  <Users className="h-4 w-4 mr-3" />
                  Configurações de Membros
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start rounded-xl h-12 ${
                    activeSection === 'notificacoes' 
                      ? 'bg-[#FF6B00] hover:bg-[#FF8C40] text-white font-medium' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => setActiveSection('notificacoes')}
                >
                  <Bell className="h-4 w-4 mr-3" />
                  Notificações
                </Button>
              </div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1">
            <div className="bg-white dark:bg-[#0f1525] rounded-lg p-6 border border-gray-200 dark:border-gray-800 shadow-sm h-full overflow-y-auto">
              {/* Informações Gerais */}
              {activeSection === 'gerais' && (
                <div>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Informações Gerais
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Configure as informações básicas do seu grupo de estudos
                    </p>
                  </div>

                  <div className="space-y-8">
                    {/* Informações Básicas */}
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-[#FF6B00] rounded-lg">
                          <Info className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Informações Básicas
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nome do Grupo */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Nome do Grupo
                          </Label>
                          <Input
                            value={settings.nome}
                            onChange={(e) => setSettings({ ...settings, nome: e.target.value })}
                            className="bg-white dark:bg-[#1a2236] border-gray-300 dark:border-gray-700 rounded-xl h-12 text-gray-900 dark:text-white"
                            placeholder="Digite o nome do grupo"
                          />
                        </div>

                        {/* Código do Grupo */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Código do Grupo
                          </Label>
                          <Input
                            value={settings.codigo_unico}
                            readOnly
                            className="bg-gray-100 dark:bg-[#1a2236] border-gray-300 dark:border-gray-700 rounded-xl h-12 cursor-default text-gray-900 dark:text-white"
                          />
                        </div>

                        {/* Disciplina/Área */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Disciplina/Área
                          </Label>
                          <Input
                            value={settings.disciplina_area}
                            onChange={(e) => setSettings({ ...settings, disciplina_area: e.target.value })}
                            className="bg-white dark:bg-[#1a2236] border-gray-300 dark:border-gray-700 rounded-xl h-12 text-gray-900 dark:text-white"
                            placeholder="Ex: Matemática, Física, etc."
                          />
                        </div>

                        {/* Tópico Específico */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            Tópico Específico
                          </Label>
                          <Input
                            value={settings.topico_especifico}
                            onChange={(e) => setSettings({ ...settings, topico_especifico: e.target.value })}
                            className="bg-white dark:bg-[#1a2236] border-gray-300 dark:border-gray-700 rounded-xl h-12 text-gray-900 dark:text-white"
                            placeholder="Ex: Cálculo Diferencial, Mecânica Quântica, etc."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Descrição do Grupo */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#FF6B00] rounded-lg">
                          <Info className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                          Descrição do Grupo
                        </h4>
                      </div>
                      <Textarea
                        value={settings.descricao}
                        onChange={(e) => setSettings({ ...settings, descricao: e.target.value })}
                        rows={4}
                        className="w-full bg-white dark:bg-[#1a2236] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white resize-none"
                        placeholder="Descreva os objetivos e o foco do seu grupo de estudos..."
                      />
                    </div>

                    {/* Tags/Etiquetas */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#FF6B00] rounded-lg">
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                          Tags/Etiquetas
                        </h4>
                      </div>

                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-1 bg-white dark:bg-[#1a2236] border-gray-300 dark:border-gray-700 rounded-xl h-10 text-gray-900 dark:text-white"
                            placeholder="Digite uma tag e pressione Enter"
                          />
                          <Button
                            onClick={addTag}
                            className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white px-4 h-10 rounded-xl"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {settings.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              className="bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30 px-3 py-1 rounded-xl flex items-center gap-2"
                            >
                              {tag}
                              <button
                                onClick={() => removeTag(tag)}
                                className="hover:text-red-500 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacidade & Acesso */}
              {activeSection === 'privacidade' && (
                <div>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Privacidade & Acesso
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Configure quem pode ver e acessar seu grupo
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white">
                          <Globe className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Grupo Público</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Qualquer pessoa pode encontrar e se juntar ao grupo</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.is_public}
                        onCheckedChange={(checked) => setSettings({ ...settings, is_public: checked, is_private: !checked })}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500"
                      />
                    </div>

                    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl text-white">
                          <Lock className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Grupo Privado</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Apenas membros convidados podem ver o grupo</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.is_private}
                        onCheckedChange={(checked) => setSettings({ ...settings, is_private: checked, is_public: !checked })}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-red-500 data-[state=checked]:to-pink-500"
                      />
                    </div>

                    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white">
                          <Eye className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Visível para Todos</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">O grupo aparece nas buscas públicas</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.is_visible_to_all}
                        onCheckedChange={(checked) => setSettings({ ...settings, is_visible_to_all: checked })}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-cyan-500"
                      />
                    </div>

                    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Visível para Parceiros</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Apenas usuários conectados podem ver</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.is_visible_to_partners}
                        onCheckedChange={(checked) => setSettings({ ...settings, is_visible_to_partners: checked })}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Configurações de Membros */}
              {activeSection === 'membros' && (
                <div>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Configurações de Membros
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Configure como novos membros podem se juntar ao grupo
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Número Máximo de Membros
                      </Label>
                      <Input
                        type="number"
                        value={settings.max_members}
                        onChange={(e) => setSettings({ ...settings, max_members: parseInt(e.target.value) || 50 })}
                        className="bg-white dark:bg-[#1a2236] border-gray-300 dark:border-gray-700 rounded-xl h-12 text-gray-900 dark:text-white"
                        min="1"
                        max="1000"
                      />
                    </div>

                    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl text-white">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Requer Aprovação</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Novos membros precisam ser aprovados</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.require_approval}
                        onCheckedChange={(checked) => setSettings({ ...settings, require_approval: checked })}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-yellow-500 data-[state=checked]:to-orange-500"
                      />
                    </div>

                    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl text-white">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Permitir Convites de Membros</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Membros podem convidar outras pessoas</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.allow_member_invites}
                        onCheckedChange={(checked) => setSettings({ ...settings, allow_member_invites: checked })}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-teal-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notificações */}
              {activeSection === 'notificacoes' && (
                <div>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Configurações de Notificações
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Configure quando e como receber notificações do grupo
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white">
                          <Bell className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Notificações Ativas</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receber notificações gerais do grupo</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.notificacoes_ativas}
                        onCheckedChange={(checked) => setSettings({ ...settings, notificacoes_ativas: checked })}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-cyan-500"
                      />
                    </div>

                    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Novos Membros</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Notificar quando alguém se juntar ao grupo</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.notify_new_members}
                        onCheckedChange={(checked) => setSettings({ ...settings, notify_new_members: checked })}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500"
                      />
                    </div>

                    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
                          <Bell className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Novas Mensagens</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Notificar quando houver novas mensagens no grupo</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.notify_new_messages}
                        onCheckedChange={(checked) => setSettings({ ...settings, notify_new_messages: checked })}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
                      />
                    </div>

                    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Novos Materiais</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Notificar quando novos materiais forem adicionados</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.notify_new_materials}
                        onCheckedChange={(checked) => setSettings({ ...settings, notify_new_materials: checked })}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-red-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer com botão de salvar */}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={isSaving}
          className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white rounded-xl h-11 px-8"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}