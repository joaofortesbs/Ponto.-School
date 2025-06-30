
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  X,
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
} from "lucide-react";

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: any;
  onSave: (settings: any) => void;
}

const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({
  isOpen,
  onClose,
  group,
  onSave,
}) => {
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
    // Configurações de aparência
    tema: "azul",
    cor_primaria: "#FF6B00",
    imagem_capa: "",
    // Configurações de privacidade
    aceitar_novos_membros: true,
    aprovacao_manual: false,
    permitir_convites: true,
    // Configurações de metas
    meta_membros: 50,
    meta_atividade_semanal: 10,
    meta_materiais: 20,
    // Regras
    regras: [],
    codigo_conduta: "",
    // Avançado
    backup_automatico: true,
    notificacoes_ativas: true,
    moderacao_automatica: false,
  });

  const [newTag, setNewTag] = useState("");
  const [newRule, setNewRule] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSave = () => {
    onSave(groupSettings);
    onClose();
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

  const menuItems = [
    {
      id: "informacoes-basicas",
      label: "Informações Básicas",
      icon: Info,
      gradient: "from-blue-500 to-cyan-500",
      description: "Nome, descrição e configurações gerais",
    },
    {
      id: "aparencia",
      label: "Aparência & Tema",
      icon: Palette,
      gradient: "from-purple-500 to-pink-500",
      description: "Cores, temas e personalização visual",
    },
    {
      id: "privacidade",
      label: "Privacidade & Acesso",
      icon: Shield,
      gradient: "from-emerald-500 to-teal-500",
      description: "Controle de visibilidade e membros",
    },
    {
      id: "metas",
      label: "Metas & Objetivos",
      icon: Target,
      gradient: "from-orange-500 to-red-500",
      description: "Definir objetivos e métricas",
    },
    {
      id: "regras",
      label: "Regras & Conduta",
      icon: Gavel,
      gradient: "from-indigo-500 to-purple-500",
      description: "Estabelecer diretrizes do grupo",
    },
    {
      id: "avancado",
      label: "Configurações Avançadas",
      icon: Zap,
      gradient: "from-yellow-500 to-orange-500",
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
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white">
                  <Info className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
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
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-xl h-12 text-lg font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-xl min-h-[120px] resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-xl h-12 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-xl h-12 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="Ex: Cálculo Diferencial, Física Quântica"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Tags do Grupo
                  </Label>
                  <div className="flex flex-wrap gap-2 min-h-[60px] p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
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
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:shadow-lg transition-all duration-200"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:bg-white/20 rounded-full p-1 transition-colors"
                          >
                            <X className="h-3 w-3" />
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
                      className="flex-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-xl h-10"
                      placeholder="Adicionar nova tag"
                    />
                    <Button
                      onClick={addTag}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl px-6 shadow-lg hover:shadow-xl transition-all duration-200"
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
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-800/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
                  <Palette className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Personalização Visual
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Tema do Grupo
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {["azul", "roxo", "verde", "laranja"].map((tema) => (
                      <button
                        key={tema}
                        onClick={() => setGroupSettings({ ...groupSettings, tema })}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          groupSettings.tema === tema
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-950/50"
                            : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                        }`}
                      >
                        <div
                          className={`w-full h-8 rounded-lg mb-2 ${
                            tema === "azul" ? "bg-gradient-to-r from-blue-500 to-cyan-500" :
                            tema === "roxo" ? "bg-gradient-to-r from-purple-500 to-pink-500" :
                            tema === "verde" ? "bg-gradient-to-r from-emerald-500 to-teal-500" :
                            "bg-gradient-to-r from-orange-500 to-red-500"
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
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-xl h-12"
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
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-xl h-12"
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
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-6 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Controle de Privacidade e Acesso
                </h3>
              </div>

              <div className="space-y-6">
                <div className="grid gap-6">
                  <div className="flex items-center justify-between p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-emerald-200/30 dark:border-emerald-800/30 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white">
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
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-teal-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-emerald-200/30 dark:border-emerald-800/30 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white">
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
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-teal-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-emerald-200/30 dark:border-emerald-800/30 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white">
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
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-teal-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-emerald-200/30 dark:border-emerald-800/30 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white">
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
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-teal-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-emerald-200/30 dark:border-emerald-800/30 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white">
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
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-teal-500"
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
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 p-6 rounded-2xl border border-orange-200/50 dark:border-orange-800/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
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
                      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-xl h-12 pl-4 pr-16"
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
                      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-xl h-12 pl-4 pr-16"
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
                      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-xl h-12 pl-4 pr-16"
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

              <div className="mt-8 p-6 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl border border-orange-200/50 dark:border-orange-800/50">
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
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
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
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-6 rounded-2xl border border-indigo-200/50 dark:border-indigo-800/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white">
                  <Gavel className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
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
                        className="flex items-center gap-3 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-indigo-200/30 dark:border-indigo-800/30"
                      >
                        <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white">
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
                      className="flex-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-xl h-12"
                      placeholder="Digite uma nova regra para o grupo"
                    />
                    <Button
                      onClick={addRule}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl px-6 shadow-lg hover:shadow-xl transition-all duration-200"
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
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-xl min-h-[150px] resize-none"
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
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 p-6 rounded-2xl border border-yellow-200/50 dark:border-yellow-800/50">
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
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl text-white">
                    <Zap className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    Automação e Recursos Técnicos
                  </h3>
                </div>

                <div className="grid gap-6">
                  <div className="flex items-center justify-between p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-yellow-200/30 dark:border-yellow-800/30 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white">
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
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-cyan-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-yellow-200/30 dark:border-yellow-800/30 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white">
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
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-yellow-200/30 dark:border-yellow-800/30 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
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
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-[#0A0E1A] rounded-3xl shadow-2xl w-full max-w-7xl h-[95vh] flex overflow-hidden border border-gray-200/20 dark:border-gray-800/30"
        >
          {/* Sidebar */}
          <div className="w-80 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-[#0F1419] dark:to-[#1A1F2E] border-r border-gray-200/50 dark:border-gray-700/30 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/30 bg-white/50 dark:bg-[#0A0E1A]/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl text-white shadow-lg">
                  <Settings className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-bold text-xl bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Configurações
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {group?.nome}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full text-left p-4 rounded-2xl transition-all duration-200 group ${
                        isActive
                          ? "bg-white dark:bg-[#1A1F2E] shadow-lg border border-gray-200/50 dark:border-gray-700/50 scale-[1.02]"
                          : "hover:bg-white/70 dark:hover:bg-[#1A1F2E]/70 hover:shadow-md"
                      }`}
                      whileHover={{ x: isActive ? 0 : 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl transition-all duration-200 ${
                          isActive 
                            ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
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
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/30 bg-white/30 dark:bg-[#0A0E1A]/30 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {menuItems.find(item => item.id === activeSection)?.label}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {menuItems.find(item => item.id === activeSection)?.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl p-3"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-[#0A0E1A] dark:to-[#0F1419]">
              {renderContent()}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/30 bg-white/50 dark:bg-[#0A0E1A]/50 backdrop-blur-sm flex items-center justify-end gap-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6 py-3 rounded-xl border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Salvar Configurações
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GroupSettingsModal;
