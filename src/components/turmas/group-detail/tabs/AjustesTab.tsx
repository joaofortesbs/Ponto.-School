import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Save,
  Settings,
  Users,
  Lock,
  Eye,
  Globe,
  Shield,
  Bell,
  Palette,
  Info,
  AlertTriangle,
  Trash2,
  Crown,
  UserX,
  MessageSquare,
  FileText,
  Share2,
  Download,
  Upload
} from "lucide-react";

interface AjustesTabProps {
  group: any;
  onSave?: (updatedGroup: any) => void;
}

export const AjustesTab: React.FC<AjustesTabProps> = ({ group, onSave }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [groupSettings, setGroupSettings] = useState({
    nome: group?.nome || "",
    descricao: group?.descricao || "",
    disciplina_area: group?.disciplina_area || "",
    topico_especifico: group?.topico_especifico || "",
    tags: group?.tags || [],
    is_public: group?.is_public || false,
    is_visible_to_all: group?.is_visible_to_all || false,
    is_visible_to_partners: group?.is_visible_to_partners || false,
    is_private: group?.is_private || false,
    tipo_grupo: group?.tipo_grupo || "estudo",
    tema: "laranja",
    notifications_enabled: true,
    auto_approve_members: false,
    allow_member_invites: true,
    show_member_count: true,
    enable_file_sharing: true,
    enable_screen_sharing: true,
    max_members: 50
  });

  const [newTag, setNewTag] = useState("");

  const handleSave = async () => {
    if (!group?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('grupos_estudo')
        .update({
          nome: groupSettings.nome,
          descricao: groupSettings.descricao,
          disciplina_area: groupSettings.disciplina_area,
          topico_especifico: groupSettings.topico_especifico,
          tags: groupSettings.tags,
          is_public: groupSettings.is_public,
          is_visible_to_all: groupSettings.is_visible_to_all,
          is_visible_to_partners: groupSettings.is_visible_to_partners,
          is_private: groupSettings.is_private,
          tipo_grupo: groupSettings.tipo_grupo
        })
        .eq('id', group.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "As configurações do grupo foram atualizadas com sucesso.",
      });

      onSave?.(data);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !groupSettings.tags.includes(newTag.trim())) {
      setGroupSettings({
        ...groupSettings,
        tags: [...groupSettings.tags, newTag.trim()]
      });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setGroupSettings({
      ...groupSettings,
      tags: groupSettings.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <div className="w-full min-h-full bg-transparent">
      <div className="max-w-6xl mx-auto space-y-8 p-6">
        {/* Informações Básicas */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white">
              <Info className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Informações Básicas
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Nome do Grupo
                </Label>
                <Input
                  value={groupSettings.nome}
                  onChange={(e) => setGroupSettings({ ...groupSettings, nome: e.target.value })}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-orange-200/50 dark:border-orange-800/50 focus:border-orange-500 focus:ring-orange-500/20"
                  placeholder="Digite o nome do grupo"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Disciplina/Área
                </Label>
                <Input
                  value={groupSettings.disciplina_area}
                  onChange={(e) => setGroupSettings({ ...groupSettings, disciplina_area: e.target.value })}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-orange-200/50 dark:border-orange-800/50 focus:border-orange-500 focus:ring-orange-500/20"
                  placeholder="Ex: Matemática, Física, História..."
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Tópico Específico
                </Label>
                <Input
                  value={groupSettings.topico_especifico}
                  onChange={(e) => setGroupSettings({ ...groupSettings, topico_especifico: e.target.value })}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-orange-200/50 dark:border-orange-800/50 focus:border-orange-500 focus:ring-orange-500/20"
                  placeholder="Ex: Álgebra Linear, Mecânica Quântica..."
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Descrição
                </Label>
                <Textarea
                  value={groupSettings.descricao}
                  onChange={(e) => setGroupSettings({ ...groupSettings, descricao: e.target.value })}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-orange-200/50 dark:border-orange-800/50 focus:border-orange-500 focus:ring-orange-500/20 min-h-[120px]"
                  placeholder="Descreva os objetivos e conteúdo do grupo..."
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Tags/Etiquetas
                </Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-orange-200/50 dark:border-orange-800/50"
                    placeholder="Nova tag..."
                  />
                  <Button 
                    onClick={addTag}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0"
                  >
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {groupSettings.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-orange-500 hover:text-orange-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-gradient-to-r from-transparent via-orange-200 dark:via-orange-800 to-transparent" />

        {/* Configurações de Privacidade */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Privacidade e Visibilidade
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-orange-200/30 dark:border-orange-800/30 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Grupo Público</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Qualquer pessoa pode encontrar e entrar</p>
                </div>
              </div>
              <Switch
                checked={groupSettings.is_public}
                onCheckedChange={(checked) =>
                  setGroupSettings({ ...groupSettings, is_public: checked })
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
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Visível para Parceiros</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Amigos podem ver e entrar no grupo</p>
                </div>
              </div>
              <Switch
                checked={groupSettings.is_visible_to_partners}
                onCheckedChange={(checked) =>
                  setGroupSettings({ ...groupSettings, is_visible_to_partners: checked })
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
                  <p className="font-semibold text-gray-900 dark:text-white">Grupo Privado</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Apenas membros convidados podem entrar</p>
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
          </div>
        </div>

        <Separator className="bg-gradient-to-r from-transparent via-orange-200 dark:via-orange-800 to-transparent" />

        {/* Configurações Visuais */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white">
              <Palette className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
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
                    <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                      {tema}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Tipo de Grupo
              </Label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: "estudo", label: "Grupo de Estudo", icon: "📚" },
                  { value: "projeto", label: "Projeto Colaborativo", icon: "🚀" },
                  { value: "discussao", label: "Discussão Acadêmica", icon: "💭" },
                  { value: "revisao", label: "Revisão de Provas", icon: "📝" }
                ].map((tipo) => (
                  <button
                    key={tipo.value}
                    onClick={() => setGroupSettings({ ...groupSettings, tipo_grupo: tipo.value })}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      groupSettings.tipo_grupo === tipo.value
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-950/50"
                        : "border-gray-200 dark:border-gray-700 hover:border-orange-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tipo.icon}</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {tipo.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Salvar */}
        <div className="flex justify-end pt-6">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Save className="h-5 w-5 mr-2" />
            {isLoading ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AjustesTab;