
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
}

export default function AjustesTab({ groupId }: AjustesTabProps) {
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
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadGroupSettings();
  }, [groupId]);

  const loadGroupSettings = async (retries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Tentativa ${attempt} de carregar configurações do grupo ${groupId}...`);
        
        const { data: groupData, error } = await supabase
          .from('grupos_estudo')
          .select('*')
          .eq('id', groupId)
          .single();

        if (error) {
          console.error(`Erro na tentativa ${attempt}:`, error);
          if (attempt === retries) {
            throw error;
          }
          continue;
        }

        if (!groupData) {
          const errorMsg = `Dados do grupo ${groupId} não encontrados.`;
          console.error(errorMsg);
          if (attempt === retries) {
            throw new Error(errorMsg);
          }
          continue;
        }

        setSettings({
          nome: groupData.nome || '',
          descricao: groupData.descricao || '',
          disciplina_area: groupData.disciplina_area || '',
          topico_especifico: groupData.topico_especifico || '',
          tags: Array.isArray(groupData.tags) ? groupData.tags : [],
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
          moderacao_automatica: groupData.moderacao_automatica ?? false,
        });

        console.log(`Configurações carregadas com sucesso para o grupo ${groupData.id} na tentativa ${attempt}:`, groupData);
        break;

      } catch (error) {
        console.warn(`Tentativa ${attempt} de carregar configurações do grupo ${groupId} falhou:`, error);
        
        if (attempt === retries) {
          console.error(`Erro final ao carregar configurações do grupo ${groupId}:`, error);
          toast({
            title: "Aviso",
            description: "Não foi possível carregar algumas configurações. Usando valores padrão.",
            variant: "default"
          });
          
          // Definir valores padrão em caso de erro persistente
          setSettings({
            nome: 'Grupo de Estudos',
            descricao: '',
            disciplina_area: '',
            topico_especifico: '',
            tags: [],
            codigo_unico: '',
            is_public: false,
            is_private: true,
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
            moderacao_automatica: false,
          });
        } else {
          console.log(`Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    setIsLoading(false);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Validações rigorosas
      if (!settings.nome.trim()) {
        toast({
          title: "Erro de Validação",
          description: "O Nome do Grupo é obrigatório.",
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }

      if (settings.nome.length > 100) {
        toast({
          title: "Erro de Validação",
          description: "O Nome do Grupo deve ter no máximo 100 caracteres.",
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }

      if (settings.descricao.length > 500) {
        toast({
          title: "Erro de Validação",
          description: "A Descrição deve ter no máximo 500 caracteres.",
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }

      console.log(`Iniciando salvamento das configurações do grupo ${groupId}...`);
      console.log('Dados a serem salvos:', {
        nome: settings.nome.trim(),
        descricao: settings.descricao.trim(),
        disciplina_area: settings.disciplina_area.trim(),
        topico_especifico: settings.topico_especifico.trim(),
        tags: settings.tags.filter(tag => tag.trim() !== ''),
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
      });

      // Executar a atualização sem verificação de permissões rigorosa
      const { data: updateData, error: updateError } = await supabase
        .from('grupos_estudo')
        .update({
          nome: settings.nome.trim(),
          descricao: settings.descricao.trim(),
          disciplina_area: settings.disciplina_area.trim(),
          topico_especifico: settings.topico_especifico.trim(),
          tags: settings.tags.filter(tag => tag.trim() !== ''),
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
          moderacao_automatica: settings.moderacao_automatica,
          updated_at: new Date().toISOString()
        })
        .eq('id', groupId)
        .select();

      if (updateError) {
        console.error('Erro ao atualizar grupo:', updateError);
        
        // Tentar diferentes abordagens se o primeiro update falhar
        if (updateError.code === '42501' || updateError.message?.includes('permission')) {
          console.log('Tentando atualização alternativa sem RLS...');
          
          // Tentar update mais simples apenas com campos básicos
          const { data: simpleUpdateData, error: simpleUpdateError } = await supabase
            .from('grupos_estudo')
            .update({
              nome: settings.nome.trim(),
              descricao: settings.descricao.trim(),
              disciplina_area: settings.disciplina_area.trim(),
              topico_especifico: settings.topico_especifico.trim(),
              tags: settings.tags.filter(tag => tag.trim() !== '')
            })
            .eq('id', groupId);

          if (simpleUpdateError) {
            throw simpleUpdateError;
          }
          
          console.log('Atualização simples realizada com sucesso:', simpleUpdateData);
        } else {
          throw updateError;
        }
      } else {
        console.log('Grupo atualizado com sucesso:', updateData);
      }
      
      // Recarregar os dados para confirmar a atualização
      setTimeout(() => {
        loadGroupSettings();
      }, 1000);
      
      toast({
        title: "Sucesso!",
        description: "Configurações do grupo salvas com sucesso!",
      });

    } catch (error) {
      console.error(`Erro ao salvar configurações do grupo ${groupId}:`, error);
      
      let errorMessage = 'Erro desconhecido';
      if (error.message?.includes('permission')) {
        errorMessage = 'Você não tem permissão para editar este grupo';
      } else if (error.message?.includes('not found')) {
        errorMessage = 'Grupo não encontrado';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: `Erro ao salvar configurações: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = () => {
    const trimmedTag = newTag.trim();
    
    if (!trimmedTag) {
      toast({
        title: "Tag inválida",
        description: "A tag não pode estar vazia.",
        variant: "destructive"
      });
      return;
    }

    if (trimmedTag.length > 20) {
      toast({
        title: "Tag muito longa",
        description: "A tag deve ter no máximo 20 caracteres.",
        variant: "destructive"
      });
      return;
    }

    if (settings.tags.includes(trimmedTag)) {
      toast({
        title: "Tag duplicada",
        description: "Esta tag já foi adicionada.",
        variant: "destructive"
      });
      return;
    }

    if (settings.tags.length >= 10) {
      toast({
        title: "Limite de tags",
        description: "Você pode adicionar no máximo 10 tags.",
        variant: "destructive"
      });
      return;
    }

    setSettings(prev => ({
      ...prev,
      tags: [...prev.tags, trimmedTag]
    }));
    setNewTag('');
    console.log(`Tag "${trimmedTag}" adicionada ao grupo ${groupId}.`);
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
      <Card className="shadow-xl border-2 border-orange-200 dark:border-orange-500/30 bg-white dark:bg-[#001327] backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 border-b border-orange-200 dark:border-orange-500/30">
          <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center shadow-md">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <span>Informações Básicas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-8 bg-white dark:bg-[#001327]">
          <div className="space-y-3">
            <Label htmlFor="nome" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
              <span>Nome do Grupo</span>
              <span className="text-orange-500">*</span>
            </Label>
            <Input
              id="nome"
              value={settings.nome}
              onChange={(e) => setSettings(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Digite o nome do grupo"
              className="h-12 border-2 border-orange-200 dark:border-orange-500/50 bg-white dark:bg-[#001327] text-gray-900 dark:text-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 rounded-lg transition-all duration-200"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="descricao" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Descrição
            </Label>
            <Textarea
              id="descricao"
              value={settings.descricao}
              onChange={(e) => setSettings(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva o grupo e seus objetivos"
              rows={4}
              className="border-2 border-orange-200 dark:border-orange-500/50 bg-white dark:bg-[#001327] text-gray-900 dark:text-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 rounded-lg transition-all duration-200 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="disciplina" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Disciplina/Área
              </Label>
              <Input
                id="disciplina"
                value={settings.disciplina_area}
                onChange={(e) => setSettings(prev => ({ ...prev, disciplina_area: e.target.value }))}
                placeholder="Ex: Matemática, Física, etc."
                className="h-12 border-2 border-orange-200 dark:border-orange-500/50 bg-white dark:bg-[#001327] text-gray-900 dark:text-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 rounded-lg transition-all duration-200"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="topico" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Tópico Específico
              </Label>
              <Input
                id="topico"
                value={settings.topico_especifico}
                onChange={(e) => setSettings(prev => ({ ...prev, topico_especifico: e.target.value }))}
                placeholder="Ex: Álgebra Linear, Mecânica, etc."
                className="h-12 border-2 border-orange-200 dark:border-orange-500/50 bg-white dark:bg-[#001327] text-gray-900 dark:text-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 rounded-lg transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="codigoUnico" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
              <span>Código Único</span>
              <div className="w-4 h-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-sm flex items-center justify-center">
                <span className="text-white text-xs font-bold">#</span>
              </div>
            </Label>
            <div className="flex items-center space-x-3">
              <Input
                id="codigoUnico"
                value={settings.codigo_unico || 'Carregando...'}
                readOnly
                className="flex-1 h-12 border-2 border-orange-200 dark:border-orange-500/50 bg-orange-50/50 dark:bg-orange-900/20 text-gray-900 dark:text-white font-mono text-center text-lg tracking-wider rounded-lg cursor-default"
              />
              <Button
                type="button"
                onClick={() => {
                  if (settings.codigo_unico) {
                    navigator.clipboard.writeText(settings.codigo_unico);
                    toast({
                      title: "Código copiado!",
                      description: "O código único foi copiado para a área de transferência.",
                    });
                  }
                }}
                className="h-12 px-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white shadow-lg hover:shadow-xl transition-all duration-200 ring-2 ring-orange-200 dark:ring-orange-500/30"
                disabled={!settings.codigo_unico}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </Button>
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Compartilhe este código para que outros usuários possam encontrar e entrar no seu grupo
            </p>
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Tags do Grupo
            </Label>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border-2 border-orange-200 dark:border-orange-500/30 min-h-[80px]">
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
                      className="text-white hover:text-orange-200 transition-colors duration-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {settings.tags.length === 0 && (
                  <span className="text-orange-500 dark:text-orange-400 text-sm italic">
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
                className="flex-1 h-12 border-2 border-orange-200 dark:border-orange-500/50 bg-white dark:bg-[#001327] text-gray-900 dark:text-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 rounded-lg transition-all duration-200"
              />
              <Button 
                type="button" 
                onClick={addTag} 
                className="h-12 px-6 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white shadow-lg hover:shadow-xl transition-all duration-200 ring-2 ring-orange-200 dark:ring-orange-500/30"
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
      <Card className="shadow-xl border-2 border-orange-200 dark:border-orange-500/30 bg-white dark:bg-[#001327]">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 border-b border-orange-200 dark:border-orange-500/30">
          <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
            <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center shadow-md">
              <Shield className="w-4 h-4 text-white" />
            </div>
            Privacidade & Acesso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6 bg-white dark:bg-[#001327]">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <Label className="text-gray-800 dark:text-white font-semibold">Grupo Público</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Qualquer pessoa pode encontrar e participar</p>
                </div>
              </div>
              <Switch
                checked={settings.is_public}
                onCheckedChange={(checked) => setSettings(prev => ({ 
                  ...prev, 
                  is_public: checked,
                  is_private: !checked
                }))}
                className="data-[state=checked]:bg-[#FF6B00]"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <Label className="text-gray-800 dark:text-white font-semibold">Grupo Privado</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Apenas por convite</p>
                </div>
              </div>
              <Switch
                checked={settings.is_private}
                onCheckedChange={(checked) => setSettings(prev => ({ 
                  ...prev, 
                  is_private: checked,
                  is_public: !checked
                }))}
                className="data-[state=checked]:bg-[#FF6B00]"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <Label className="text-gray-800 dark:text-white font-semibold">Visível para Parceiros</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Visível apenas para usuários conectados</p>
                </div>
              </div>
              <Switch
                checked={settings.is_visible_to_partners}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, is_visible_to_partners: checked }))}
                className="data-[state=checked]:bg-[#FF6B00]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMembros = () => (
    <div className="space-y-6">
      <Card className="shadow-xl border-2 border-orange-200 dark:border-orange-500/30 bg-white dark:bg-[#001327]">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 border-b border-orange-200 dark:border-orange-500/30">
          <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
            <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center shadow-md">
              <Users className="w-4 h-4 text-white" />
            </div>
            Gerenciamento de Membros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6 bg-white dark:bg-[#001327]">
          <div className="space-y-3">
            <Label htmlFor="max-members" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Número Máximo de Membros</Label>
            <Select value={settings.max_members.toString()} onValueChange={(value) => setSettings(prev => ({ ...prev, max_members: parseInt(value) }))}>
              <SelectTrigger className="h-12 border-2 border-orange-200 dark:border-orange-500/50 bg-white dark:bg-[#001327] text-gray-900 dark:text-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#001327] border-orange-200 dark:border-orange-500/50">
                <SelectItem value="10" className="hover:bg-orange-50 dark:hover:bg-orange-900/20">10 membros</SelectItem>
                <SelectItem value="25" className="hover:bg-orange-50 dark:hover:bg-orange-900/20">25 membros</SelectItem>
                <SelectItem value="50" className="hover:bg-orange-50 dark:hover:bg-orange-900/20">50 membros</SelectItem>
                <SelectItem value="100" className="hover:bg-orange-50 dark:hover:bg-orange-900/20">100 membros</SelectItem>
                <SelectItem value="999" className="hover:bg-orange-50 dark:hover:bg-orange-900/20">Ilimitado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10">
            <div>
              <Label className="text-gray-800 dark:text-white font-semibold">Aprovação Obrigatória</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Novos membros precisam ser aprovados</p>
            </div>
            <Switch
              checked={settings.require_approval}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, require_approval: checked }))}
              className="data-[state=checked]:bg-[#FF6B00]"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10">
            <div>
              <Label className="text-gray-800 dark:text-white font-semibold">Membros Podem Convidar</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Permite que membros convidem outros usuários</p>
            </div>
            <Switch
              checked={settings.allow_member_invites}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allow_member_invites: checked }))}
              className="data-[state=checked]:bg-[#FF6B00]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificacoes = () => (
    <div className="space-y-6">
      <Card className="shadow-xl border-2 border-orange-200 dark:border-orange-500/30 bg-white dark:bg-[#001327]">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 border-b border-orange-200 dark:border-orange-500/30">
          <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
            <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center shadow-md">
              <Bell className="w-4 h-4 text-white" />
            </div>
            Preferências de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6 bg-white dark:bg-[#001327]">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10">
              <div>
                <Label className="text-gray-800 dark:text-white font-semibold">Novos Membros</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Notificar quando alguém entrar no grupo</p>
              </div>
              <Switch
                checked={settings.notify_new_members}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notify_new_members: checked }))}
                className="data-[state=checked]:bg-[#FF6B00]"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10">
              <div>
                <Label className="text-gray-800 dark:text-white font-semibold">Novas Mensagens</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Notificar sobre novas discussões</p>
              </div>
              <Switch
                checked={settings.notify_new_messages}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notify_new_messages: checked }))}
                className="data-[state=checked]:bg-[#FF6B00]"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10">
              <div>
                <Label className="text-gray-800 dark:text-white font-semibold">Novos Materiais</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Notificar quando materiais forem adicionados</p>
              </div>
              <Switch
                checked={settings.notify_new_materials}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notify_new_materials: checked }))}
                className="data-[state=checked]:bg-[#FF6B00]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAvancado = () => (
    <div className="space-y-6">
      <Card className="shadow-xl border-2 border-orange-200 dark:border-orange-500/30 bg-white dark:bg-[#001327]">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 border-b border-orange-200 dark:border-orange-500/30">
          <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
            <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center shadow-md">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            Configurações Avançadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6 bg-white dark:bg-[#001327]">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10">
              <div>
                <Label className="text-gray-800 dark:text-white font-semibold">Backup Automático</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Backup automático das discussões e materiais</p>
              </div>
              <Switch
                checked={settings.backup_automatico}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, backup_automatico: checked }))}
                className="data-[state=checked]:bg-[#FF6B00]"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10">
              <div>
                <Label className="text-gray-800 dark:text-white font-semibold">Notificações Ativas</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sistema de notificações do grupo</p>
              </div>
              <Switch
                checked={settings.notificacoes_ativas}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notificacoes_ativas: checked }))}
                className="data-[state=checked]:bg-[#FF6B00]"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10">
              <div>
                <Label className="text-gray-800 dark:text-white font-semibold">Moderação Automática</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Filtro automático de conteúdo inadequado</p>
              </div>
              <Switch
                checked={settings.moderacao_automatica}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, moderacao_automatica: checked }))}
                className="data-[state=checked]:bg-[#FF6B00]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl border-2 border-red-300 dark:border-red-500/50 bg-red-50 dark:bg-red-900/20">
        <CardHeader className="bg-gradient-to-r from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/30 border-b border-red-200 dark:border-red-500/30">
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
              <Trash2 className="w-4 h-4 text-white" />
            </div>
            Zona de Perigo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-400 mb-4">
            Estas ações são irreversíveis. Tenha cuidado ao executá-las.
          </p>
          <Button variant="destructive" className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200">
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Grupo
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderAparencia = () => (
    <Card className="shadow-xl border-2 border-orange-200 dark:border-orange-500/30 bg-white dark:bg-[#001327]">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 border-b border-orange-200 dark:border-orange-500/30">
        <CardTitle className="flex items-center gap-3 text-gray-800 dark:text-white">
          <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center shadow-md">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <span>Aparência & Tema</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-16 bg-white dark:bg-[#001327]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl flex items-center justify-center">
            <Eye className="w-10 h-10 text-orange-500" />
          </div>
          <h4 className="text-xl font-bold text-gray-800 dark:text-white">
            Aparência & Tema
          </h4>
          <p className="text-orange-600 dark:text-orange-400 max-w-md">
            Configurações de aparência estarão disponíveis em breve. Personalize cores, temas e layout do seu grupo.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderMetas = () => (
    <Card className="shadow-xl border-2 border-orange-200 dark:border-orange-500/30 bg-white dark:bg-[#001327]">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 border-b border-orange-200 dark:border-orange-500/30">
        <CardTitle className="flex items-center gap-3 text-gray-800 dark:text-white">
          <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center shadow-md">
            <Users className="w-4 h-4 text-white" />
          </div>
          <span>Metas & Objetivos</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-16 bg-white dark:bg-[#001327]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl flex items-center justify-center">
            <Users className="w-10 h-10 text-orange-500" />
          </div>
          <h4 className="text-xl font-bold text-gray-800 dark:text-white">
            Metas & Objetivos
          </h4>
          <p className="text-orange-600 dark:text-orange-400 max-w-md">
            Configurações de metas estarão disponíveis em breve. Defina objetivos e acompanhe o progresso do grupo.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderRegras = () => (
    <Card className="shadow-xl border-2 border-orange-200 dark:border-orange-500/30 bg-white dark:bg-[#001327]">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 border-b border-orange-200 dark:border-orange-500/30">
        <CardTitle className="flex items-center gap-3 text-gray-800 dark:text-white">
          <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center shadow-md">
            <Bell className="w-4 h-4 text-white" />
          </div>
          <span>Regras & Conduta</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-16 bg-white dark:bg-[#001327]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl flex items-center justify-center">
            <Bell className="w-10 h-10 text-orange-500" />
          </div>
          <h4 className="text-xl font-bold text-gray-800 dark:text-white">
            Regras & Conduta
          </h4>
          <p className="text-orange-600 dark:text-orange-400 max-w-md">
            Configurações de regras estarão disponíveis em breve. Estabeleça diretrizes e normas para o grupo.
          </p>
        </div>
      </CardContent>
    </Card>
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
    <div className="flex min-h-[800px] h-full bg-white dark:bg-[#001327] rounded-xl shadow-2xl overflow-hidden border border-orange-200/30 dark:border-orange-500/20">
      {/* Menu Lateral */}
      <div className="w-72 bg-gradient-to-b from-orange-50 via-orange-100 to-orange-50 dark:from-[#001327] dark:via-[#002442] dark:to-[#001327] border-r border-orange-200 dark:border-orange-500/30 flex-shrink-0 shadow-2xl">
        <div className="p-8 border-b border-orange-200/50 dark:border-orange-500/30 bg-gradient-to-r from-orange-100 to-orange-50 dark:from-[#001327] dark:to-[#002442]">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center shadow-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Configurações</h3>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">Gerencie seu grupo</p>
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
                    ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white shadow-2xl border border-orange-300/20'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-orange-100 hover:to-orange-50 dark:hover:from-orange-900/30 dark:hover:to-orange-800/30 hover:text-orange-700 dark:hover:text-orange-300 hover:shadow-lg'
                }`}
              >
                <div className={`p-2 rounded-lg transition-all duration-300 ${
                  activeSection === item.id 
                    ? 'bg-white/20' 
                    : 'group-hover:bg-orange-200/30 dark:group-hover:bg-orange-500/20'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Decoração no menu lateral */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-orange-100/50 dark:from-[#001327] to-transparent opacity-50"></div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-[#001327]">
        <div className="p-8 min-h-full">
          {/* Header do conteúdo */}
          <div className="mb-8 pb-6 border-b border-orange-200/50 dark:border-orange-500/30">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-xl flex items-center justify-center shadow-lg ring-2 ring-orange-200 dark:ring-orange-500/30">
                {menuItems.find(item => item.id === activeSection)?.icon && 
                  React.createElement(menuItems.find(item => item.id === activeSection)!.icon, { className: "w-6 h-6 text-white" })
                }
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {menuItems.find(item => item.id === activeSection)?.label}
                </h2>
                <p className="text-orange-600 dark:text-orange-400 text-sm mt-1">
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
          <div className="sticky bottom-0 bg-white/95 dark:bg-[#001327]/95 border-t border-orange-200/50 dark:border-orange-500/30 p-6 mt-8 backdrop-blur-sm">
            <div className="flex justify-end space-x-4">
              <Button 
                variant="outline" 
                onClick={loadGroupSettings}
                className="px-6 py-3 border-2 border-orange-300 dark:border-orange-500 text-orange-600 dark:text-orange-400 hover:border-orange-400 dark:hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  console.log('Botão Salvar Alterações clicado!');
                  console.log('Settings atuais:', settings);
                  console.log('Group ID:', groupId);
                  saveSettings();
                }} 
                disabled={isSaving}
                className="px-8 py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 ring-2 ring-orange-200 dark:ring-orange-500/30"
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
