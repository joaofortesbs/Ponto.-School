import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  X,
  Info,
  Palette,
  Shield,
  Target,
  FileText,
  Settings,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Users,
  Lock,
  Globe,
  Calendar,
  Clock,
  Bell,
  Zap,
  Crown,
  UserX,
  AlertTriangle,
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

  const sidebarSections = [
    {
      id: "informacoes-basicas",
      label: "Informações Básicas",
      icon: Info,
    },
    {
      id: "aparencia",
      label: "Aparência",
      icon: Palette,
    },
    {
      id: "privacidade",
      label: "Privacidade",
      icon: Shield,
    },
    {
      id: "metas",
      label: "Metas",
      icon: Target,
    },
    {
      id: "regras",
      label: "Regras",
      icon: FileText,
    },
    {
      id: "avancado",
      label: "Avançado",
      icon: Settings,
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "informacoes-basicas":
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="nome-grupo" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Nome do Grupo
              </Label>
              <Input
                id="nome-grupo"
                value={groupSettings.nome}
                onChange={(e) =>
                  setGroupSettings({ ...groupSettings, nome: e.target.value })
                }
                className="mt-1"
                placeholder="Digite o nome do grupo"
              />
            </div>

            <div>
              <Label htmlFor="descricao" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Descrição
              </Label>
              <Textarea
                id="descricao"
                value={groupSettings.descricao}
                onChange={(e) =>
                  setGroupSettings({ ...groupSettings, descricao: e.target.value })
                }
                className="mt-1"
                placeholder="Descreva o propósito e objetivos do grupo"
                rows={4}
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                className="mt-1"
                placeholder="Ex: Matemática, Física, etc."
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                className="mt-1"
                placeholder="Ex: Cálculo Diferencial, Mecânica Quântica, etc."
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                Tags
              </Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {groupSettings.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/30 flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-red-500/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Adicionar nova tag"
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                />
                <Button onClick={addTag} size="sm" className="bg-[#FF6B00] hover:bg-[#FF8C40]">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      case "aparencia":
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                Tema do Grupo
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {["azul", "verde", "roxo", "laranja", "rosa", "cinza"].map((tema) => (
                  <div
                    key={tema}
                    onClick={() => setGroupSettings({ ...groupSettings, tema })}
                    className={`h-16 rounded-lg cursor-pointer border-2 transition-all ${
                      groupSettings.tema === tema
                        ? "border-[#FF6B00] ring-2 ring-[#FF6B00]/20"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    style={{
                      background:
                        tema === "azul"
                          ? "linear-gradient(135deg, #3B82F6, #1E40AF)"
                          : tema === "verde"
                          ? "linear-gradient(135deg, #10B981, #059669)"
                          : tema === "roxo"
                          ? "linear-gradient(135deg, #8B5CF6, #7C3AED)"
                          : tema === "laranja"
                          ? "linear-gradient(135deg, #FF6B00, #FF8C40)"
                          : tema === "rosa"
                          ? "linear-gradient(135deg, #EC4899, #BE185D)"
                          : "linear-gradient(135deg, #6B7280, #4B5563)",
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Cor Primária Personalizada
              </Label>
              <div className="flex gap-3 mt-2">
                <Input
                  type="color"
                  value={groupSettings.cor_primaria}
                  onChange={(e) =>
                    setGroupSettings({ ...groupSettings, cor_primaria: e.target.value })
                  }
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={groupSettings.cor_primaria}
                  onChange={(e) =>
                    setGroupSettings({ ...groupSettings, cor_primaria: e.target.value })
                  }
                  placeholder="#FF6B00"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Imagem de Capa
              </Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  <div className="mb-2">📸</div>
                  <p className="text-sm">Clique para fazer upload da imagem de capa</p>
                  <p className="text-xs mt-1">Recomendado: 1200x400px</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "privacidade":
        return (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                <Shield className="h-5 w-5" />
                <span className="font-semibold">Configurações de Visibilidade</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Grupo Público</p>
                    <p className="text-sm text-gray-500">Visível para todos os usuários da plataforma</p>
                  </div>
                </div>
                <Switch
                  checked={!groupSettings.is_private}
                  onCheckedChange={(checked) =>
                    setGroupSettings({ ...groupSettings, is_private: !checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Aceitar Novos Membros</p>
                    <p className="text-sm text-gray-500">Permitir que outros usuários se juntem ao grupo</p>
                  </div>
                </div>
                <Switch
                  checked={groupSettings.aceitar_novos_membros}
                  onCheckedChange={(checked) =>
                    setGroupSettings({ ...groupSettings, aceitar_novos_membros: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Aprovação Manual</p>
                    <p className="text-sm text-gray-500">Administradores devem aprovar novos membros</p>
                  </div>
                </div>
                <Switch
                  checked={groupSettings.aprovacao_manual}
                  onCheckedChange={(checked) =>
                    setGroupSettings({ ...groupSettings, aprovacao_manual: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Permitir Convites</p>
                    <p className="text-sm text-gray-500">Membros podem convidar outros usuários</p>
                  </div>
                </div>
                <Switch
                  checked={groupSettings.permitir_convites}
                  onCheckedChange={(checked) =>
                    setGroupSettings({ ...groupSettings, permitir_convites: checked })
                  }
                />
              </div>
            </div>
          </div>
        );

      case "metas":
        return (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                <Target className="h-5 w-5" />
                <span className="font-semibold">Definir Metas do Grupo</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                Estabeleça objetivos para motivar o crescimento e engajamento do grupo.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Meta de Membros
                </Label>
                <div className="mt-2">
                  <Input
                    type="number"
                    value={groupSettings.meta_membros}
                    onChange={(e) =>
                      setGroupSettings({
                        ...groupSettings,
                        meta_membros: parseInt(e.target.value) || 0,
                      })
                    }
                    min="1"
                    max="1000"
                  />
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Progresso atual: 0/{groupSettings.meta_membros}</span>
                      <span>0%</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Meta de Atividade Semanal (horas)
                </Label>
                <div className="mt-2">
                  <Input
                    type="number"
                    value={groupSettings.meta_atividade_semanal}
                    onChange={(e) =>
                      setGroupSettings({
                        ...groupSettings,
                        meta_atividade_semanal: parseInt(e.target.value) || 0,
                      })
                    }
                    min="1"
                    max="168"
                  />
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Esta semana: 0/{groupSettings.meta_atividade_semanal}h</span>
                      <span>0%</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Meta de Materiais Compartilhados
                </Label>
                <div className="mt-2">
                  <Input
                    type="number"
                    value={groupSettings.meta_materiais}
                    onChange={(e) =>
                      setGroupSettings({
                        ...groupSettings,
                        meta_materiais: parseInt(e.target.value) || 0,
                      })
                    }
                    min="1"
                    max="500"
                  />
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Materiais: 0/{groupSettings.meta_materiais}</span>
                      <span>0%</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "regras":
        return (
          <div className="space-y-6">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 mb-2">
                <FileText className="h-5 w-5" />
                <span className="font-semibold">Regras e Código de Conduta</span>
              </div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Defina regras claras para manter um ambiente de aprendizado saudável.
              </p>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                Regras do Grupo
              </Label>
              <div className="space-y-3 mb-4">
                {groupSettings.regras.map((regra, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <span className="text-sm bg-[#FF6B00] text-white rounded-full w-6 h-6 flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm">{regra}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRule(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  placeholder="Digite uma nova regra para o grupo"
                  rows={2}
                />
                <Button
                  onClick={addRule}
                  className="bg-[#FF6B00] hover:bg-[#FF8C40] whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                className="mt-2"
                placeholder="Descreva o comportamento esperado dos membros do grupo..."
                rows={6}
              />
            </div>
          </div>
        );

      case "avancado":
        return (
          <div className="space-y-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300 mb-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-semibold">Configurações Avançadas</span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400">
                Essas configurações afetam o funcionamento interno do grupo. Use com cuidado.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Backup Automático</p>
                    <p className="text-sm text-gray-500">Salvar automaticamente discussões e materiais</p>
                  </div>
                </div>
                <Switch
                  checked={groupSettings.backup_automatico}
                  onCheckedChange={(checked) =>
                    setGroupSettings({ ...groupSettings, backup_automatico: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Notificações Ativas</p>
                    <p className="text-sm text-gray-500">Enviar notificações para membros do grupo</p>
                  </div>
                </div>
                <Switch
                  checked={groupSettings.notificacoes_ativas}
                  onCheckedChange={(checked) =>
                    setGroupSettings({ ...groupSettings, notificacoes_ativas: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Crown className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Moderação Automática</p>
                    <p className="text-sm text-gray-500">IA moderará mensagens automaticamente</p>
                  </div>
                </div>
                <Switch
                  checked={groupSettings.moderacao_automatica}
                  onCheckedChange={(checked) =>
                    setGroupSettings({ ...groupSettings, moderacao_automatica: checked })
                  }
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold text-red-600 dark:text-red-400 mb-3">Zona de Perigo</h4>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Remover Todos os Membros
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Grupo Permanentemente
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-[#1E293B] rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden"
        >
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-[#0f1525] border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                Configurações
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {group?.nome || "Grupo"}
              </p>
            </div>

            <nav className="flex-1 p-2">
              {sidebarSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors mb-1 ${
                      activeSection === section.id
                        ? "bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a2236]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                  {sidebarSections.find(s => s.id === activeSection)?.label}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Configure as opções do seu grupo de estudos
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderContent()}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3 bg-gray-50 dark:bg-[#0f1525]">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-300 dark:border-gray-600"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
              >
                <Save className="h-4 w-4 mr-2" />
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