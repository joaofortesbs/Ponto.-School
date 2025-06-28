
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateGroupFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const CreateGroupForm: React.FC<CreateGroupFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    tipo_grupo: "",
    disciplina_area: "",
    topico_especifico: "",
    tags: [] as string[],
    is_public: false,
    is_visible_to_all: false,
    is_visible_to_partners: false,
  });

  const [tagInput, setTagInput] = useState("");

  // Mapeamento de tipos de grupo para valores válidos no banco
  const tipoGrupoMap = {
    'Grupo de Estudo': 'estudo',
    'Projeto': 'projeto', 
    'Pesquisa': 'pesquisa',
    'Revisão': 'revisao',
    'Debate': 'debate'
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    console.log(`Switch ${name} alterado para:`, checked);
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mapear o tipo_grupo para o valor válido no banco
    const mappedTipoGrupo = tipoGrupoMap[formData.tipo_grupo as keyof typeof tipoGrupoMap] || 'estudo';
    
    const submissionData = {
      ...formData,
      tipo_grupo: mappedTipoGrupo
    };
    
    console.log('Enviando dados do formulário:', submissionData);
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Informações Básicas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-white">
              Nome do Grupo *
            </Label>
            <Input
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              placeholder="Ex: Matemática Avançada"
              required
              disabled={isLoading}
              className="bg-[#2a4066] border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_grupo" className="text-white">
              Tipo de Grupo *
            </Label>
            <Select
              value={formData.tipo_grupo}
              onValueChange={(value) => handleSelectChange("tipo_grupo", value)}
              disabled={isLoading}
              required
            >
              <SelectTrigger className="bg-[#2a4066] border-gray-600 text-white">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Grupo de Estudo">Grupo de Estudo</SelectItem>
                <SelectItem value="Projeto">Projeto</SelectItem>
                <SelectItem value="Pesquisa">Pesquisa</SelectItem>
                <SelectItem value="Revisão">Revisão</SelectItem>
                <SelectItem value="Debate">Debate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao" className="text-white">
            Descrição
          </Label>
          <Textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleInputChange}
            placeholder="Descreva o objetivo e foco do grupo..."
            disabled={isLoading}
            className="bg-[#2a4066] border-gray-600 text-white placeholder-gray-400"
            rows={3}
          />
        </div>
      </div>

      {/* Detalhes do Conteúdo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Detalhes do Conteúdo</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="disciplina_area" className="text-white">
              Disciplina/Área
            </Label>
            <Input
              id="disciplina_area"
              name="disciplina_area"
              value={formData.disciplina_area}
              onChange={handleInputChange}
              placeholder="Ex: Matemática, Física, História..."
              disabled={isLoading}
              className="bg-[#2a4066] border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topico_especifico" className="text-white">
              Tópico Específico
            </Label>
            <Input
              id="topico_especifico"
              name="topico_especifico"
              value={formData.topico_especifico}
              onChange={handleInputChange}
              placeholder="Ex: Cálculo Diferencial, Segunda Guerra..."
              disabled={isLoading}
              className="bg-[#2a4066] border-gray-600 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label className="text-white">Tags</Label>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              placeholder="Digite uma tag e pressione Enter"
              disabled={isLoading}
              className="bg-[#2a4066] border-gray-600 text-white placeholder-gray-400"
            />
            <Button
              type="button"
              onClick={addTag}
              disabled={isLoading}
              className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
            >
              Adicionar
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-[#FF6B00] text-white px-2 py-1 rounded text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    disabled={isLoading}
                    className="text-white hover:text-gray-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Configurações de Visibilidade */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Configurações de Visibilidade</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Grupo Público</Label>
              <p className="text-sm text-gray-400">
                Qualquer pessoa pode encontrar e ingressar no grupo
              </p>
            </div>
            <Switch
              checked={formData.is_public}
              onCheckedChange={(checked) => handleSwitchChange("is_public", checked)}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Visível para Todos</Label>
              <p className="text-sm text-gray-400">
                Aparece na lista de grupos para todos os usuários
              </p>
            </div>
            <Switch
              checked={formData.is_visible_to_all}
              onCheckedChange={(checked) => handleSwitchChange("is_visible_to_all", checked)}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Visível para Parceiros</Label>
              <p className="text-sm text-gray-400">
                Apenas seus parceiros podem ver este grupo
              </p>
            </div>
            <Switch
              checked={formData.is_visible_to_partners}
              onCheckedChange={(checked) => handleSwitchChange("is_visible_to_partners", checked)}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !formData.nome.trim() || !formData.tipo_grupo}
          className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
        >
          {isLoading ? "Criando..." : "Criar Grupo"}
        </Button>
      </div>
    </form>
  );
};

export default CreateGroupForm;
