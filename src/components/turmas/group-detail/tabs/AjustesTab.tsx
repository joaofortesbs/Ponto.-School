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
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface GroupSettings {
  // Configurações Gerais
  nome: string;
  descricao: string;
  disciplina_area: string;
  topico_especifico: string;
  tags: string[];

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
}

export default function AjustesTab({ groupId }: AjustesTabProps) {
  const [settings, setSettings] = useState<GroupSettings>({
    nome: '',
    descricao: '',
    disciplina_area: '',
    topico_especifico: '',
    tags: [],
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
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadGroupSettings();
  }, [groupId]);

  const loadGroupSettings = async () => {
    try {
      const { data: groupData, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('id', groupId)
        .single();

      if (error) throw error;

      setSettings({
        nome: groupData.nome || '',
        descricao: groupData.descricao || '',
        disciplina_area: groupData.disciplina_area || '',
        topico_especifico: groupData.topico_especifico || '',
        tags: groupData.tags || [],
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
        moderacao_automatica: groupData.moderacao_automatica ?? false,
      });

      console.log(`Campos da mini-seção Ajustes preenchidos para o grupo ${groupData.id || 'desconhecido'}.`);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações do grupo.",
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

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !settings.tags.includes(newTag.trim())) {
      setSettings(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSettings(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const menuItems = [
    { id: 'gerais', label: 'Informações Básicas', icon: Settings },
    { id: 'aparencia', label: 'Aparência & Tema', icon: Eye },
    { id: 'privacidade', label: 'Privacidade & Acesso', icon: Shield },
    { id: 'metas', label: 'Metas & Objetivos', icon: Users },
    { id: 'regras', label: 'Regras & Conduta', icon: Bell },
    { id: 'avancado', label: 'Configurações Avançadas', icon: AlertTriangle }
  ];

  const renderConfiguracoesGerais = () => (
    <div className="space-y-8">
      <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-gray-50/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-[#FF6B00]/5 to-[#FF8C40]/5 border-b border-orange-100">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <span>Informações Básicas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          <div className="space-y-3">
            <Label htmlFor="nome" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <span>Nome do Grupo</span>
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nome"
              value={settings.nome}
              onChange={(e) => setSettings(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Digite o nome do grupo"
              className="h-12 border-2 border-gray-200 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 rounded-lg transition-all duration-200"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="descricao" className="text-sm font-semibold text-gray-700">
              Descrição
            </Label>
            <Textarea
              id="descricao"
              value={settings.descricao}
              onChange={(e) => setSettings(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva o grupo e seus objetivos"
              rows={4}
              className="border-2 border-gray-200 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 rounded-lg transition-all duration-200 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="disciplina" className="text-sm font-semibold text-gray-700">
                Disciplina/Área
              </Label>
              <Input
                id="disciplina"
                value={settings.disciplina_area}
                onChange={(e) => setSettings(prev => ({ ...prev, disciplina_area: e.target.value }))}
                placeholder="Ex: Matemática, Física, etc."
                className="h-12 border-2 border-gray-200 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 rounded-lg transition-all duration-200"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="topico" className="text-sm font-semibold text-gray-700">
                Tópico Específico
              </Label>
              <Input
                id="topico"
                value={settings.topico_especifico}
                onChange={(e) => setSettings(prev => ({ ...prev, topico_especifico: e.target.value }))}
                placeholder="Ex: Álgebra Linear, Mecânica, etc."
                className="h-12 border-2 border-gray-200 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 rounded-lg transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-semibold text-gray-700">
              Tags do Grupo
            </Label>
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 min-h-[80px]">
              <div className="flex flex-wrap gap-3 mb-3">
                {settings.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-white hover:text-red-200 transition-colors duration-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {settings.tags.length === 0 && (
                  <span className="text-gray-400 text-sm italic">
                    Nenhuma tag adicionada ainda
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Digite uma nova tag"
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1 h-12 border-2 border-gray-200 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 rounded-lg transition-all duration-200"
              />
              <Button 
                type="button" 
                onClick={addTag} 
                className="h-12 px-6 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPrivacidade = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacidade & Acesso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-green-500" />
                <div>
                  <Label>Grupo Público</Label>
                  <p className="text-sm text-gray-500">Qualquer pessoa pode encontrar e participar</p>
                </div>
              </div>
              <Switch
                checked={settings.is_public}
                onCheckedChange={(checked) => setSettings(prev => ({ 
                  ...prev, 
                  is_public: checked,
                  is_private: checked ? false : prev.is_private
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-red-500" />
                <div>
                  <Label>Grupo Privado</Label>
                  <p className="text-sm text-gray-500">Apenas por convite</p>
                </div>
              </div>
              <Switch
                checked={settings.is_private}
                onCheckedChange={(checked) => setSettings(prev => ({ 
                  ...prev, 
                  is_private: checked,
                  is_public: checked ? false : prev.is_public
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-blue-500" />
                <div>
                  <Label>Visível para Todos</Label>
                  <p className="text-sm text-gray-500">Aparece nas listagens públicas</p>
                </div>
              </div>
              <Switch
                checked={settings.is_visible_to_all}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, is_visible_to_all: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-500" />
                <div>
                  <Label>Visível para Parceiros</Label>
                  <p className="text-sm text-gray-500">Visível apenas para usuários conectados</p>
                </div>
              </div>
              <Switch
                checked={settings.is_visible_to_partners}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, is_visible_to_partners: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMembros = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gerenciamento de Membros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="max-members">Número Máximo de Membros</Label>
            <Select value={settings.max_members.toString()} onValueChange={(value) => setSettings(prev => ({ ...prev, max_members: parseInt(value) }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 membros</SelectItem>
                <SelectItem value="25">25 membros</SelectItem>
                <SelectItem value="50">50 membros</SelectItem>
                <SelectItem value="100">100 membros</SelectItem>
                <SelectItem value="999">Ilimitado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Aprovação Obrigatória</Label>
              <p className="text-sm text-gray-500">Novos membros precisam ser aprovados</p>
            </div>
            <Switch
              checked={settings.require_approval}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, require_approval: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Membros Podem Convidar</Label>
              <p className="text-sm text-gray-500">Permite que membros convidem outros usuários</p>
            </div>
            <Switch
              checked={settings.allow_member_invites}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allow_member_invites: checked }))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificacoes = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Preferências de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Novos Membros</Label>
              <p className="text-sm text-gray-500">Notificar quando alguém entrar no grupo</p>
            </div>
            <Switch
              checked={settings.notify_new_members}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notify_new_members: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Novas Mensagens</Label>
              <p className="text-sm text-gray-500">Notificar sobre novas discussões</p>
            </div>
            <Switch
              checked={settings.notify_new_messages}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notify_new_messages: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Novos Materiais</Label>
              <p className="text-sm text-gray-500">Notificar quando materiais forem adicionados</p>
            </div>
            <Switch
              checked={settings.notify_new_materials}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notify_new_materials: checked }))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAvancado = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Configurações Avançadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Backup Automático</Label>
              <p className="text-sm text-gray-500">Backup automático das discussões e materiais</p>
            </div>
            <Switch
              checked={settings.backup_automatico}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, backup_automatico: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Notificações Ativas</Label>
              <p className="text-sm text-gray-500">Sistema de notificações do grupo</p>
            </div>
            <Switch
              checked={settings.notificacoes_ativas}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notificacoes_ativas: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Moderação Automática</Label>
              <p className="text-sm text-gray-500">Filtro automático de conteúdo inadequado</p>
            </div>
            <Switch
              checked={settings.moderacao_automatica}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, moderacao_automatica: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Zona de Perigo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Estas ações são irreversíveis. Tenha cuidado ao executá-las.
          </p>
          <Button variant="destructive" className="w-full">
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Grupo
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderAparencia = () => (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[#FF6B00] rounded-lg">
          <Eye className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Aparência & Tema
        </h3>
      </div>
      <div className="text-center py-12">
        <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-bold text-gray-600 dark:text-gray-400 mb-2">
          Aparência & Tema
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Configurações de aparência estarão disponíveis em breve.
        </p>
      </div>
    </div>
  );

    const renderMetas = () => (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#FF6B00] rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Metas & Objetivos
                </h3>
            </div>
            <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-gray-600 dark:text-gray-400 mb-2">
                    Metas & Objetivos
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                    Configurações de metas estarão disponíveis em breve.
                </p>
            </div>
        </div>
    );

    const renderRegras = () => (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#FF6B00] rounded-lg">
                    <Bell className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Regras & Conduta
                </h3>
            </div>
            <div className="text-center py-12">
                <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-gray-600 dark:text-gray-400 mb-2">
                    Regras & Conduta
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                    Configurações de regras estarão disponíveis em breve.
                </p>
            </div>
        </div>
    );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00] mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[800px] h-full bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-2xl overflow-hidden border border-gray-200/50">
      {/* Menu Lateral */}
      <div className="w-72 bg-gradient-to-b from-[#2c3e50] via-[#34495e] to-[#2c3e50] text-white flex-shrink-0 shadow-2xl">
        <div className="p-8 border-b border-[#34495e]/50 bg-gradient-to-r from-[#2c3e50] to-[#34495e]">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-[#3498db] to-[#2980b9] rounded-lg flex items-center justify-center shadow-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Configurações</h3>
              <p className="text-xs text-blue-200/80 mt-0.5">Gerencie seu grupo</p>
            </div>
          </div>
        </div>
        <nav className="p-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-4 px-5 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 group ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-[#3498db] to-[#2980b9] text-white shadow-2xl border border-blue-300/20'
                    : 'text-gray-300 hover:bg-gradient-to-r hover:from-[#34495e] hover:to-[#3d566e] hover:text-white hover:shadow-lg'
                }`}
              >
                <div className={`p-2 rounded-lg transition-all duration-300 ${
                  activeSection === item.id 
                    ? 'bg-white/20' 
                    : 'group-hover:bg-white/10'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Decoração no menu lateral */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#1a252f] to-transparent opacity-50"></div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-white to-gray-50">
        <div className="p-8 min-h-full">
          {/* Header do conteúdo */}
          <div className="mb-8 pb-6 border-b border-gray-200/50">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-xl flex items-center justify-center shadow-lg">
                {menuItems.find(item => item.id === activeSection)?.icon && 
                  React.createElement(menuItems.find(item => item.id === activeSection)!.icon, { className: "w-6 h-6 text-white" })
                }
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {menuItems.find(item => item.id === activeSection)?.label}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Configure as opções do seu grupo de estudos
                </p>
              </div>
            </div>
          </div>

          {/* Conteúdo das seções */}
          <div className="space-y-6">
            {activeSection === 'gerais' && renderConfiguracoesGerais()}
            {activeSection === 'aparencia' && renderAparencia()}
            {activeSection === 'privacidade' && renderPrivacidade()}
            {activeSection === 'membros' && renderMembros()}
            {activeSection === 'notificacoes' && renderNotificacoes()}
            {activeSection === 'avancado' && renderAvancado()}
            {activeSection === 'metas' && renderMetas()}
            {activeSection === 'regras' && renderRegras()}
          </div>

          {/* Botão de Salvar */}
          <div className="sticky bottom-0 bg-gradient-to-r from-white via-white to-gray-50/90 border-t border-gray-200/50 p-6 mt-8 backdrop-blur-sm">
            <div className="flex justify-end space-x-4">
              <Button 
                variant="outline" 
                onClick={loadGroupSettings}
                className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                onClick={saveSettings} 
                disabled={isSaving}
                className="px-8 py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-3" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}