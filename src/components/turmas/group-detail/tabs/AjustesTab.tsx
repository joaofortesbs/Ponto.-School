import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Info,
  Palette,
  Shield,
  Target,
  Gavel,
  Zap,
  Save,
  Users,
  Lock,
  Bell,
  Crown,
  AlertTriangle,
  Plus,
  Trash2,
  Eye,
  Globe,
  UserPlus,
  CheckCircle2,
  Star,
  Sparkles,
  Layers,
  Gauge,
  Copy,
} from "lucide-react";

interface AjustesTabProps {
  group: any;
  onSave?: (settings: any) => void;
  onUpdate?: () => void;
}

const AjustesTab: React.FC<AjustesTabProps> = ({ group, onSave, onUpdate }) => {
  const [activeSection, setActiveSection] = useState("informacoes-basicas");
  const [groupSettings, setGroupSettings] = useState({
    nome: group?.nome || "",
    descricao: group?.descricao || "",
    tags: group?.tags || [],
    disciplina_area: group?.disciplina_area || "",
    topico_especifico: group?.topico_especifico || "",
    is_private: group?.is_private || false,
    is_visible_to_all: group?.is_visible_to_all || false,
    is_visible_to_partners: group?.is_visible_to_partners || false,
    tipo_grupo: group?.tipo_grupo || "estudo",
    codigo_unico: group?.codigo_unico || "",
    // Configurações de aparência
    tema: group?.tema || "laranja",
    cor_primaria: group?.cor_primaria || "#FF6B00",
    imagem_capa: group?.imagem_capa || "",
    // Configurações de privacidade
    aceitar_novos_membros: group?.aceitar_novos_membros ?? true,
    aprovacao_manual: group?.aprovacao_manual ?? false,
    permitir_convites: group?.permitir_convites ?? true,
    // Configurações de metas
    meta_membros: group?.meta_membros || 50,
    meta_atividade_semanal: group?.meta_atividade_semanal || 10,
    meta_materiais: group?.meta_materiais || 20,
    // Regras
    regras: group?.regras || [],
    codigo_conduta: group?.codigo_conduta || "",
    // Avançado
    backup_automatico: group?.backup_automatico ?? true,
    notificacoes_ativas: group?.notificacoes_ativas ?? true,
    moderacao_automatica: group?.moderacao_automatica ?? false,
  });

  // Atualizar settings quando o grupo mudar
  useEffect(() => {
    if (group) {
      setGroupSettings({
        nome: group.nome || "",
        descricao: group.descricao || "",
        tags: group.tags || [],
        disciplina_area: group.disciplina_area || "",
        topico_especifico: group.topico_especifico || "",
        is_private: group.is_private || false,
        is_visible_to_all: group.is_visible_to_all || false,
        is_visible_to_partners: group.is_visible_to_partners || false,
        tipo_grupo: group.tipo_grupo || "estudo",
        codigo_unico: group.codigo_unico || "",
        // Configurações de aparência
        tema: group.tema || "laranja",
        cor_primaria: group.cor_primaria || "#FF6B00",
        imagem_capa: group.imagem_capa || "",
        // Configurações de privacidade
        aceitar_novos_membros: group.aceitar_novos_membros ?? true,
        aprovacao_manual: group.aprovacao_manual ?? false,
        permitir_convites: group.permitir_convites ?? true,
        // Configurações de metas
        meta_membros: group.meta_membros || 50,
        meta_atividade_semanal: group.meta_atividade_semanal || 10,
        meta_materiais: group.meta_materiais || 20,
        // Regras
        regras: group.regras || [],
        codigo_conduta: group.codigo_conduta || "",
        // Avançado
        backup_automatico: group.backup_automatico ?? true,
        notificacoes_ativas: group.notificacoes_ativas ?? true,
        moderacao_automatica: group.moderacao_automatica ?? false,
      });
    }
  }, [group]);

  const [newTag, setNewTag] = useState("");
  const [newRule, setNewRule] = useState("");

  const handleSave = async () => {
    try {
      // Validações
      if (!groupSettings.nome.trim()) {
        alert('O nome do grupo não pode ser vazio.');
        return;
      }

      // Log para debug
      console.log('Salvando configurações do grupo:', group?.id, groupSettings);

      // Preparar dados para atualização (incluindo todas as configurações)
      const updateData = {
        nome: groupSettings.nome.trim(),
        descricao: groupSettings.descricao.trim(),
        tags: groupSettings.tags.filter(tag => tag.trim() !== ''),
        disciplina_area: groupSettings.disciplina_area.trim(),
        topico_especifico: groupSettings.topico_especifico.trim(),
        is_private: groupSettings.is_private,
        is_visible_to_all: groupSettings.is_visible_to_all,
        is_visible_to_partners: groupSettings.is_visible_to_partners,
        tipo_grupo: groupSettings.tipo_grupo,
        // Configurações de aparência
        tema: groupSettings.tema,
        cor_primaria: groupSettings.cor_primaria,
        imagem_capa: groupSettings.imagem_capa,
        // Configurações de privacidade
        aceitar_novos_membros: groupSettings.aceitar_novos_membros,
        aprovacao_manual: groupSettings.aprovacao_manual,
        permitir_convites: groupSettings.permitir_convites,
        // Configurações de metas
        meta_membros: groupSettings.meta_membros,
        meta_atividade_semanal: groupSettings.meta_atividade_semanal,
        meta_materiais: groupSettings.meta_materiais,
        // Regras
        regras: groupSettings.regras.filter(regra => regra.trim() !== ''),
        codigo_conduta: groupSettings.codigo_conduta.trim(),
        // Avançado
        backup_automatico: groupSettings.backup_automatico,
        notificacoes_ativas: groupSettings.notificacoes_ativas,
        moderacao_automatica: groupSettings.moderacao_automatica,
        updated_at: new Date().toISOString()
      };

      // Importar supabase dinamicamente
      const { supabase } = await import('@/integrations/supabase/client');

      // Atualizar no Supabase
      const { error } = await supabase
        .from('grupos_estudo')
        .update(updateData)
        .eq('id', group?.id);

      if (error) {
        console.error('Erro ao salvar configurações no Supabase:', error);
        alert('Erro ao salvar configurações. Verifique o console.');
        return;
      }

      console.log(`Configurações salvas com sucesso para grupo ${group?.id}`);
      alert('Configurações salvas com sucesso!');

      // Chama a função onUpdate para atualizar os dados do grupo no componente pai
      if (onUpdate) {
        onUpdate();
      }

      // Chama a função original onSave se existir
      if (onSave) {
        onSave(groupSettings);
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error?.message, error?.stack);
      alert('Erro ao salvar configurações. Verifique o console.');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !groupSettings.tags.includes(newTag.trim())) {
      setGroupSettings({
        ...groupSettings,
        tags: [...groupSettings.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setGroupSettings({
      ...groupSettings,
      tags: groupSettings.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const addRule = () => {
    if (newRule.trim()) {
      setGroupSettings({
        ...groupSettings,
        regras: [...groupSettings.regras, newRule.trim()],
      });
      setNewRule("");
    }
  };

  const removeRule = (index: number) => {
    setGroupSettings({
      ...groupSettings,
      regras: groupSettings.regras.filter((_, i) => i !== index),
    });
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      console.log('Código copiado:', code);
    } catch (err) {
      console.error('Erro ao copiar código:', err);
    }
  };

  const menuItems = [
    {
      id: "informacoes-basicas",
      label: "Informações Básicas",
      icon: Info,
      description: "Nome, descrição e configurações gerais",
    },
    {
      id: "aparencia",
      label: "Aparência & Tema",
      icon: Palette,
      description: "Cores, temas e personalização visual",
    },
    {
      id: "privacidade",
      label: "Privacidade & Acesso",
      icon: Shield,
      description: "Controle de visibilidade e membros",
    },
    {
      id: "metas",
      label: "Metas & Objetivos",
      icon: Target,
      description: "Definir objetivos e métricas",
    },
    {
      id: "regras",
      label: "Regras & Conduta",
      icon: Gavel,
      description: "Estabelecer diretrizes do grupo",
    },
    {
      id: "avancado",
      label: "Configurações Avançadas",
      icon: Zap,
      description: "Recursos técnicos e automação",
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "informacoes-basicas":
        return (
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 p-6 rounded-2xl border border-orange-200/50 dark:border-orange-800/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white">
                  <Info className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Informações Básicas do Grupo
                </h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Nome do Grupo
                  </Label>
                  <Input
                    id="nome"
                    value={groupSettings.nome}
                    onChange={(e) =>
                      setGroupSettings({ ...groupSettings, nome: e.target.value })
                    }
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-orange-200/50 dark:border-orange-700/50 rounded-xl h-12 text-lg font-medium transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    placeholder="Digite o nome do grupo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Descrição
                  </Label>
                  <Textarea
                    id="descricao"
                    value={groupSettings.descricao}
                    onChange={(e) =>
                      setGroupSettings({ ...groupSettings, descricao: e.target.value })
                    }
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-orange-200/50 dark:border-orange-700/50 rounded-xl min-h-[120px] resize-none transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    placeholder="Descreva o propósito e objetivos do grupo"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Disciplina/Área
                    </Label>
                    <Input
                      value={groupSettings.disciplina_area}
                      onChange={(e) =>
                        setGroupSettings({
                          ...groupSettings,
                          disciplina_area: e.target.value,
                        })
                      }
                      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-orange-200/50 dark:border-orange-700/50 rounded-xl h-12 transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      placeholder="Ex: Matemática, Física, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Tópico Específico
                    </Label>
                    <Input
                      value={groupSettings.topico_especifico}
                      onChange={(e) =>
                        setGroupSettings({
                          ...groupSettings,
                          topico_especifico: e.target.value,
                        })
                      }
                      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-orange-200/50 dark:border-orange-700/50 rounded-xl h-12 transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      placeholder="Ex: Cálculo Diferencial, Física Quântica"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Código Único
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={groupSettings.codigo_unico}
                        readOnly
                        className="flex-1 bg-gray-100 dark:bg-gray-700 border-orange-200/50 dark:border-orange-700/50 rounded-xl h-12 font-mono text-center cursor-pointer"
                        onClick={() => copyCode(groupSettings.codigo_unico)}
                        title="Clique para copiar"
                      />
                      <Button
                        type="button"
                        onClick={() => copyCode(groupSettings.codigo_unico)}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                        title="Copiar código"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Tags do Grupo
                  </Label>
                  <div className="flex flex-wrap gap-2 min-h-[60px] p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-orange-200/50 dark:border-orange-700/50">
                    {groupSettings.tags.map((tag, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:shadow-lg transition-all duration-200"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:bg-white/20 rounded-full p-1 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addTag()}
                      className="flex-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-orange-200/50 dark:border-orange-700/50 rounded-xl h-10"
                      placeholder="Adicionar nova tag"
                    />
                    <Button
                      onClick={addTag}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl px-6 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "aparencia":
        return (
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 p-6 rounded-2xl border border-orange-200/50 dark:border-orange-800/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white">
                  <Palette className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Personalização Visual
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Tema do Grupo
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {["laranja", "vermelho", "amarelo", "bronze"].map((tema) => (
                      <button
                        key={tema}
                        onClick={() => setGroupSettings({ ...groupSettings, tema })}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          groupSettings.tema === tema
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-950/50"
                            : "border-gray-200 dark:border-gray-700 hover:border-orange-300"
                        }`}
                      >
                        <div
                          className={`w-full h-8 rounded-lg mb-2 ${
                            tema === "laranja" ? "bg-gradient-to-r from-orange-500 to-amber-500" :
                            tema === "vermelho" ? "bg-gradient-to-r from-red-500 to-orange-500" :
                            tema === "amarelo" ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
                            "bg-gradient-to-r from-amber-600 to-orange-600"
                          }`}
                        />
                        <span className="text-sm font-medium capitalize">{tema}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Cor Primária Personalizada
                  </Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={groupSettings.cor_primaria}
                      onChange={(e) =>
                        setGroupSettings({ ...groupSettings, cor_primaria: e.target.value })
                      }
                      className="w-16 h-16 rounded-xl border-4 border-white shadow-lg cursor-pointer"
                    />
                    <div className="flex-1">
                      <Input
                        value={groupSettings.cor_primaria}
                        onChange={(e) =>
                          setGroupSettings({ ...groupSettings, cor_primaria: e.target.value })
                        }
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-orange-200/50 dark:border-orange-700/50 rounded-xl h-12"
                        placeholder="#FF6B00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Imagem de Capa (URL)
                </Label>
                <Input
                  value={groupSettings.imagem_capa}
                  onChange={(e) =>
                    setGroupSettings({ ...groupSettings, imagem_capa: e.target.value })
                  }
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-orange-200/50 dark:border-orange-700/50 rounded-xl h-12"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
            </div>
          </motion.div>
        );

      case "privacidade":
        return (
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 p-6 rounded-2xl border border-orange-200/50 dark:border-orange-800/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Controle de Privacidade e Acesso
                </h3>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200/50 dark:border-blue-800/50 mb-6">
                  <div className="flex items-center gap-3 text-blue-700 dark:text-blue-300 mb-2">
                    <Info className="h-5 w-5" />
                    <span className="font-semibold text-sm">Configurações Editáveis</span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Estas configurações podem ser editadas e serão salvas ao clicar em "Salvar Configurações".
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="flex items-center justify-between p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-orange-200/30 dark:border-orange-800/30 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white">
                        <Eye className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Grupo Privado</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Apenas membros convidados podem ver o grupo</p>
                      </div>
                    </div>
                    <Switch
                      checked={groupSettings.is_private}
                      onCheckedChange={(checked) =>
                        setGroupSettings({ ...groupSettings, is_private: checked })
                      }
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-orange-200/30 dark:border-orange-800/30 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Visível para Todos</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Grupo aparece nas buscas públicas</p>
                      </div>
                    </div>
                    <Switch
                      checked={groupSettings.is_visible_to_all}
                      onCheckedChange={(checked) =>
                        setGroupSettings({ ...groupSettings, is_visible_to_all: checked })
                      }
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-orange-200/30 dark:border-orange-800/30 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white">
                        <UserPlus className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Aceitar Novos Membros</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Permitir que novos usuários se juntem</p>
                      </div>
                    </div>
                    <Switch
                      checked={groupSettings.aceitar_novos_membros}
                      onCheckedChange={(checked) =>
                        setGroupSettings({ ...groupSettings, aceitar_novos_membros: checked })
                      }
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-orange-200/30 dark:border-orange-800/30 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white">
                        <Lock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Aprovação Manual</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Administradores devem aprovar novos membros</p>
                      </div>
                    </div>
                    <Switch
                      checked={groupSettings.aprovacao_manual}
                      onCheckedChange={(checked) =>
                        setGroupSettings({ ...groupSettings, aprovacao_manual: checked })
                      }
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-orange-200/30 dark:border-orange-800/30 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white">
                        <Bell className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Permitir Convites</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Membros podem convidar outros usuários</p>
                      </div>
                    </div>
                    <Switch
                      checked={groupSettings.permitir_convites}
                      onCheckedChange={(checked) =>
                        setGroupSettings({ ...groupSettings, permitir_convites: checked })
                      }
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "metas":
        return (
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 p-6 rounded-2xl border border-orange-200/50 dark:border-orange-800/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Metas e Objetivos do Grupo
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Meta de Membros
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={groupSettings.meta_membros}
                      onChange={(e) =>
                        setGroupSettings({
                          ...groupSettings,
                          meta_membros: parseInt(e.target.value) || 0,
                        })
                      }
                      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-orange-200/50 dark:border-orange-700/50 rounded-xl h-12 pl-4 pr-16"
                      placeholder="50"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                      membros
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Objetivo de crescimento do grupo
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Gauge className="h-4 w-4" />
                    Atividade Semanal
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={groupSettings.meta_atividade_semanal}
                      onChange={(e) =>
                        setGroupSettings({
                          ...groupSettings,
                          meta_atividade_semanal: parseInt(e.target.value) || 0,
                        })
                      }
                      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-orange-200/50 dark:border-orange-700/50 rounded-xl h-12 pl-4 pr-16"
                      placeholder="10"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                      posts
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Interações esperadas por semana
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Meta de Materiais
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={groupSettings.meta_materiais}
                      onChange={(e) =>
                        setGroupSettings({
                          ...groupSettings,
                          meta_materiais: parseInt(e.target.value) || 0,
                        })
                      }
                      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-orange-200/50 dark:border-orange-700/50 rounded-xl h-12 pl-4 pr-16"
                      placeholder="20"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                      arquivos
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Quantidade de materiais a compartilhar
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-xl border border-orange-200/50 dark:border-orange-800/50">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-orange-600" />
                  <span className="font-semibold text-orange-900 dark:text-orange-100">
                    Progresso das Metas
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-orange-800 dark:text-orange-200">Membros Atuais</span>
                    <span className="font-semibold text-orange-900 dark:text-orange-100">25 / {groupSettings.meta_membros}</span>
                  </div>
                  <div className="w-full bg-orange-200/50 dark:bg-orange-800/30 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((25 / groupSettings.meta_membros) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "regras":
        return (
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 p-6 rounded-2xl border border-orange-200/50 dark:border-orange-800/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white">
                  <Gavel className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Regras e Código de Conduta
                </h3>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Gavel className="h-4 w-4" />
                    Regras do Grupo
                  </Label>

                  <div className="space-y-3">
                    {groupSettings.regras.map((regra, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2, delay: index * 0.1 }}
                        className="flex items-center gap-3 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-orange-200/30 dark:border-orange-800/30"
                      >
                        <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg text-white">
                          <span className="text-sm font-bold">{index + 1}</span>
                        </div>
                        <p className="flex-1 text-gray-700 dark:text-gray-300">{regra}</p>
                        <button
                          onClick={() => removeRule(index)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Input
                      value={newRule}
                      onChange={(e) => setNewRule(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addRule()}
                      className="flex-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-orange-200/50 dark:border-orange-700/50 rounded-xl h-12"
                      placeholder="Digite uma nova regra para o grupo"
                    />
                    <Button
                      onClick={addRule}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl px-6 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Código de Conduta Personalizado
                  </Label>
                  <Textarea
                    value={groupSettings.codigo_conduta}
                    onChange={(e) =>
                      setGroupSettings({
                        ...groupSettings,
                        codigo_conduta: e.target.value,
                      })
                    }
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-orange-200/50 dark:border-orange-700/50 rounded-xl min-h-[150px] resize-none"
                    placeholder="Descreva o comportamento esperado dos membros do grupo..."
                    rows={6}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "avancado":
        return (
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 p-6 rounded-2xl border border-orange-200/50 dark:border-orange-800/50">
              <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 rounded-xl border border-red-200/50 dark:border-red-800/50 mb-6">
                <div className="flex items-center gap-3 text-red-700 dark:text-red-300 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold">Configurações Avançadas</span>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Essas configurações afetam o funcionamento interno do grupo. Use com cuidado.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white">
                    <Zap className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    Automação e Recursos Técnicos
                  </h3>
                </div>

                <div className="grid gap-6">
                  <div className="flex items-center justify-between p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-orange-200/30 dark:border-orange-800/30 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Backup Automático</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Salvar automaticamente discussões e materiais</p>
                      </div>
                    </div>
                    <Switch
                      checked={groupSettings.backup_automatico}
                      onCheckedChange={(checked) =>
                        setGroupSettings({ ...groupSettings, backup_automatico: checked })
                      }
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-orange-200/30 dark:border-orange-800/30 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white">
                        <Bell className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Notificações Ativas</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Enviar notificações para membros do grupo</p>
                      </div>
                    </div>
                    <Switch
                      checked={groupSettings.notificacoes_ativas}
                      onCheckedChange={(checked) =>
                        setGroupSettings({ ...groupSettings, notificacoes_ativas: checked })
                      }
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-orange-200/30 dark:border-orange-800/30 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white">
                        <Crown className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Moderação Automática</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">IA moderará mensagens automaticamente</p>
                      </div>
                    </div>
                    <Switch
                      checked={groupSettings.moderacao_automatica}
                      onCheckedChange={(checked) =>
                        setGroupSettings({ ...groupSettings, moderacao_automatica: checked })
                      }
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-[800px] bg-white dark:bg-[#051c30] rounded-3xl overflow-hidden shadow-lg">
      {/* Sidebar */}
      <div className="w-72 bg-white dark:bg-[#051c30] border-r border-orange-200/50 dark:border-orange-700/30 flex flex-col overflow-hidden min-h-[800px] rounded-l-3xl">

        <div className="flex-1 overflow-y-auto p-2 min-h-[700px]">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left p-4 rounded-2xl transition-all duration-200 group ${
                    isActive
                      ? "bg-white dark:bg-[#1A1F2E] shadow-lg border border-orange-200/50 dark:border-orange-700/50 scale-[1.02]"
                      : "hover:bg-white/70 dark:hover:bg-[#1A1F2E]/70 hover:shadow-md"
                  }`}
                  whileHover={{ x: isActive ? 0 : 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                    }`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm transition-colors ${
                        isActive 
                          ? "text-gray-900 dark:text-white" 
                          : "text-gray-700 dark:text-gray-300"
                      }`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-tight">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-[800px] bg-white dark:bg-[#051c30] rounded-r-3xl">
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[700px]">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-orange-200/50 dark:border-orange-700/30 bg-white dark:bg-[#051c30] flex items-center justify-end gap-4 rounded-br-3xl">
          <Button
            onClick={handleSave}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AjustesTab;