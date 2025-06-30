import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Save, 
  Settings, 
  Users, 
  Shield, 
  Eye, 
  Lock, 
  Globe,
  Crown,
  Bell,
  MessageSquare
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
  const [groupSettings, setGroupSettings] = useState({
    nome: group?.nome || "",
    descricao: group?.descricao || "",
    tipo_grupo: group?.tipo_grupo || "",
    is_private: group?.is_private || false,
    is_visible_to_all: group?.is_visible_to_all || false,
    is_visible_to_partners: group?.is_visible_to_partners || false,
    disciplina_area: group?.disciplina_area || "",
    topico_especifico: group?.topico_especifico || "",
    tags: group?.tags || [],
    notificacoes_ativas: true,
    moderacao_automatica: false,
    permitir_convites: true,
  });

  const [activeTab, setActiveTab] = useState("geral");

  useEffect(() => {
    if (group) {
      setGroupSettings({
        nome: group.nome || "",
        descricao: group.descricao || "",
        tipo_grupo: group.tipo_grupo || "",
        is_private: group.is_private || false,
        is_visible_to_all: group.is_visible_to_all || false,
        is_visible_to_partners: group.is_visible_to_partners || false,
        disciplina_area: group.disciplina_area || "",
        topico_especifico: group.topico_especifico || "",
        tags: group.tags || [],
        notificacoes_ativas: true,
        moderacao_automatica: false,
        permitir_convites: true,
      });
    }
  }, [group]);

  const handleSave = () => {
    onSave(groupSettings);
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setGroupSettings(prev => ({ ...prev, [field]: value }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "geral":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Nome do Grupo
              </label>
              <Input
                value={groupSettings.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                className="bg-[#0F172A] border-gray-700 text-white focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                placeholder="Digite o nome do grupo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Descrição
              </label>
              <Textarea
                value={groupSettings.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
                className="bg-[#0F172A] border-gray-700 text-white focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 min-h-[80px]"
                placeholder="Descreva o objetivo do grupo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Disciplina/Área
                </label>
                <Input
                  value={groupSettings.disciplina_area}
                  onChange={(e) => handleInputChange("disciplina_area", e.target.value)}
                  className="bg-[#0F172A] border-gray-700 text-white focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                  placeholder="Ex: Matemática"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Tópico Específico
                </label>
                <Input
                  value={groupSettings.topico_especifico}
                  onChange={(e) => handleInputChange("topico_especifico", e.target.value)}
                  className="bg-[#0F172A] border-gray-700 text-white focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                  placeholder="Ex: Cálculo I"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Código Único do Grupo
              </label>
              <div className="bg-[#0F172A] border border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[#FF6B00] text-lg font-bold">
                    {group?.codigo_unico || "N/A"}
                  </span>
                  <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30">
                    Somente Leitura
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Use este código para convidar novos membros
                </p>
              </div>
            </div>
          </div>
        );

      case "privacidade":
        return (
          <div className="space-y-4">
            <div className="bg-[#0F172A] rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FF6B00]/20 rounded-full">
                    <Globe className="h-5 w-5 text-[#FF6B00]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Visível para Todos</h4>
                    <p className="text-sm text-gray-400">Qualquer pessoa pode ver este grupo</p>
                  </div>
                </div>
                <Switch
                  checked={groupSettings.is_visible_to_all}
                  onCheckedChange={(checked) => handleInputChange("is_visible_to_all", checked)}
                  className="data-[state=checked]:bg-[#FF6B00]"
                />
              </div>
            </div>

            <div className="bg-[#0F172A] rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FF6B00]/20 rounded-full">
                    <Users className="h-5 w-5 text-[#FF6B00]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Visível para Parceiros</h4>
                    <p className="text-sm text-gray-400">Apenas parceiros podem ver</p>
                  </div>
                </div>
                <Switch
                  checked={groupSettings.is_visible_to_partners}
                  onCheckedChange={(checked) => handleInputChange("is_visible_to_partners", checked)}
                  className="data-[state=checked]:bg-[#FF6B00]"
                />
              </div>
            </div>

            <div className="bg-[#0F172A] rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FF6B00]/20 rounded-full">
                    <Lock className="h-5 w-5 text-[#FF6B00]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Grupo Privado</h4>
                    <p className="text-sm text-gray-400">Apenas por convite</p>
                  </div>
                </div>
                <Switch
                  checked={groupSettings.is_private}
                  onCheckedChange={(checked) => handleInputChange("is_private", checked)}
                  className="data-[state=checked]:bg-[#FF6B00]"
                />
              </div>
            </div>
          </div>
        );

      case "notificacoes":
        return (
          <div className="space-y-4">
            <div className="bg-[#0F172A] rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FF6B00]/20 rounded-full">
                    <Bell className="h-5 w-5 text-[#FF6B00]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Notificações Ativas</h4>
                    <p className="text-sm text-gray-400">Receber notificações do grupo</p>
                  </div>
                </div>
                <Switch
                  checked={groupSettings.notificacoes_ativas}
                  onCheckedChange={(checked) => handleInputChange("notificacoes_ativas", checked)}
                  className="data-[state=checked]:bg-[#FF6B00]"
                />
              </div>
            </div>

            <div className="bg-[#0F172A] rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FF6B00]/20 rounded-full">
                    <MessageSquare className="h-5 w-5 text-[#FF6B00]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Permitir Convites</h4>
                    <p className="text-sm text-gray-400">Membros podem convidar outros</p>
                  </div>
                </div>
                <Switch
                  checked={groupSettings.permitir_convites}
                  onCheckedChange={(checked) => handleInputChange("permitir_convites", checked)}
                  className="data-[state=checked]:bg-[#FF6B00]"
                />
              </div>
            </div>

            <div className="bg-[#0F172A] rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FF6B00]/20 rounded-full">
                    <Crown className="h-5 w-5 text-[#FF6B00]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Moderação Automática</h4>
                    <p className="text-sm text-gray-400">IA moderará mensagens automaticamente</p>
                  </div>
                </div>
                <Switch
                  checked={groupSettings.moderacao_automatica}
                  onCheckedChange={(checked) => handleInputChange("moderacao_automatica", checked)}
                  className="data-[state=checked]:bg-[#FF6B00]"
                />
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-[#1E293B] rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl border border-gray-700"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Configurações do Grupo</h2>
              <p className="text-sm text-white/80">{group?.nome}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-white/80 hover:text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#1E293B] border-b border-gray-700 px-4">
          <div className="flex">
            {[
              { id: "geral", label: "Geral", icon: Settings },
              { id: "privacidade", label: "Privacidade", icon: Shield },
              { id: "notificacoes", label: "Notificações", icon: Bell },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === id
                    ? "border-[#FF6B00] text-[#FF6B00]"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="bg-[#1E293B] border-t border-gray-700 p-4 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white shadow-lg"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default GroupSettingsModal;