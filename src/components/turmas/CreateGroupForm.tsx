
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useGruposEstudo, CreateGrupoEstudoData } from "@/hooks/useGruposEstudo";

interface CreateGroupFormProps {
  onSubmit: (formData: CreateGrupoEstudoData) => void;
  onCancel: () => void;
}

const CreateGroupForm: React.FC<CreateGroupFormProps> = ({ onSubmit, onCancel }) => {
  const { createGrupo, creating } = useGruposEstudo();
  const [formData, setFormData] = useState<CreateGrupoEstudoData>({
    nome: "",
    descricao: "",
    cor: "#FF6B00",
    topico: "",
    topico_nome: "",
    topico_icon: "",
    privado: false,
    visibilidade: "todos",
    is_publico: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent form submission if already creating
    if (creating) {
      console.log('Form submission blocked - creation in progress');
      return;
    }

    if (!formData.nome.trim()) {
      return;
    }

    const success = await createGrupo(formData);
    if (success) {
      onSubmit(formData);
      // Reset form after successful creation
      setFormData({
        nome: "",
        descricao: "",
        cor: "#FF6B00",
        topico: "",
        topico_nome: "",
        topico_icon: "",
        privado: false,
        visibilidade: "todos",
        is_publico: false
      });
    }
  };

  const handleInputChange = (field: keyof CreateGrupoEstudoData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#29335C] dark:text-white">
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nome" className="text-sm font-medium text-[#29335C] dark:text-white">
              Nome do Grupo *
            </Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              placeholder="Digite o nome do grupo"
              className="mt-1"
              required
              disabled={creating}
            />
          </div>

          <div>
            <Label htmlFor="descricao" className="text-sm font-medium text-[#29335C] dark:text-white">
              Descrição
            </Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange("descricao", e.target.value)}
              placeholder="Descreva o objetivo do grupo de estudos"
              className="mt-1"
              rows={3}
              disabled={creating}
            />
          </div>

          <div>
            <Label htmlFor="topico" className="text-sm font-medium text-[#29335C] dark:text-white">
              Tópico Principal
            </Label>
            <Input
              id="topico"
              value={formData.topico}
              onChange={(e) => handleInputChange("topico", e.target.value)}
              placeholder="Ex: Matemática, Física, Literatura..."
              className="mt-1"
              disabled={creating}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#29335C] dark:text-white">
            Configurações de Privacidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-[#29335C] dark:text-white">
                Grupo Privado
              </Label>
              <p className="text-xs text-[#64748B] dark:text-white/60">
                Apenas membros convidados podem participar
              </p>
            </div>
            <Switch
              checked={formData.privado}
              onCheckedChange={(checked) => handleInputChange("privado", checked)}
              disabled={creating}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-[#29335C] dark:text-white">
                Grupo Público
              </Label>
              <p className="text-xs text-[#64748B] dark:text-white/60">
                Visível na busca pública
              </p>
            </div>
            <Switch
              checked={formData.is_publico}
              onCheckedChange={(checked) => handleInputChange("is_publico", checked)}
              disabled={creating}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={creating}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
          disabled={creating || !formData.nome.trim()}
        >
          {creating ? "Criando..." : "Criar Grupo"}
        </Button>
      </div>
    </form>
  );
};

export default CreateGroupForm;
