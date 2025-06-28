
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface CreateGroupFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const CreateGroupForm: React.FC<CreateGroupFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    tipo_grupo: "",
    disciplina_area: "",
    topico_especifico: "",
    tags: [] as string[],
    visibilidade: "privado", // 'privado', 'visivel_todos', 'visivel_parceiros'
  });

  const [currentTag, setCurrentTag] = useState("");

  const tiposGrupo = [
    { value: "estudo", label: "Estudo" },
    { value: "pesquisa", label: "Pesquisa" },
    { value: "projeto", label: "Projeto" },
    { value: "discussao", label: "Discussão" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      alert("Nome do grupo é obrigatório");
      return;
    }
    
    if (!formData.tipo_grupo) {
      alert("Tipo do grupo é obrigatório");
      return;
    }

    // Mapear visibilidade para campos booleanos
    const submissionData = {
      nome: formData.nome.trim(),
      descricao: formData.descricao.trim(),
      tipo_grupo: formData.tipo_grupo,
      disciplina_area: formData.disciplina_area.trim() || null,
      topico_especifico: formData.topico_especifico.trim() || null,
      tags: formData.tags,
      is_private: formData.visibilidade === "privado",
      is_visible_to_all: formData.visibilidade === "visivel_todos",
      is_visible_to_partners: formData.visibilidade === "visivel_parceiros",
      is_public: formData.visibilidade === "visivel_todos", // Para compatibilidade
    };

    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nome do Grupo */}
      <div className="space-y-2">
        <Label htmlFor="nome" className="text-white">
          Nome do Grupo *
        </Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => handleInputChange("nome", e.target.value)}
          placeholder="Digite o nome do grupo"
          className="bg-[#2a4066] border-gray-600 text-white placeholder-gray-400"
          disabled={isLoading}
        />
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="descricao" className="text-white">
          Descrição
        </Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => handleInputChange("descricao", e.target.value)}
          placeholder="Descreva o objetivo do grupo"
          className="bg-[#2a4066] border-gray-600 text-white placeholder-gray-400 min-h-[80px]"
          disabled={isLoading}
        />
      </div>

      {/* Tipo de Grupo */}
      <div className="space-y-2">
        <Label className="text-white">Tipo de Grupo *</Label>
        <Select
          value={formData.tipo_grupo}
          onValueChange={(value) => handleInputChange("tipo_grupo", value)}
          disabled={isLoading}
        >
          <SelectTrigger className="bg-[#2a4066] border-gray-600 text-white">
            <SelectValue placeholder="Selecione o tipo de grupo" />
          </SelectTrigger>
          <SelectContent className="bg-[#2a4066] border-gray-600">
            {tiposGrupo.map((tipo) => (
              <SelectItem
                key={tipo.value}
                value={tipo.value}
                className="text-white hover:bg-gray-700"
              >
                {tipo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Configurações de Visibilidade */}
      <div className="space-y-3">
        <Label className="text-white">Configurações de Visibilidade</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="privado"
              name="visibilidade"
              value="privado"
              checked={formData.visibilidade === "privado"}
              onChange={(e) => handleInputChange("visibilidade", e.target.value)}
              className="text-[#FF6B00]"
              disabled={isLoading}
            />
            <Label htmlFor="privado" className="text-white cursor-pointer">
              Grupo Privado (apenas com código de acesso)
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="visivel_todos"
              name="visibilidade"
              value="visivel_todos"
              checked={formData.visibilidade === "visivel_todos"}
              onChange={(e) => handleInputChange("visibilidade", e.target.value)}
              className="text-[#FF6B00]"
              disabled={isLoading}
            />
            <Label htmlFor="visivel_todos" className="text-white cursor-pointer">
              Visível para Todos (aparece na lista pública)
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 opacity-50">
            <input
              type="radio"
              id="visivel_parceiros"
              name="visibilidade"
              value="visivel_parceiros"
              checked={formData.visibilidade === "visivel_parceiros"}
              onChange={(e) => handleInputChange("visibilidade", e.target.value)}
              className="text-[#FF6B00]"
              disabled={true}
            />
            <Label htmlFor="visivel_parceiros" className="text-gray-400 cursor-not-allowed">
              Visível para Parceiros (em breve)
            </Label>
          </div>
        </div>
      </div>

      {/* Disciplina/Área */}
      <div className="space-y-2">
        <Label htmlFor="disciplina_area" className="text-white">
          Disciplina/Área
        </Label>
        <Input
          id="disciplina_area"
          value={formData.disciplina_area}
          onChange={(e) => handleInputChange("disciplina_area", e.target.value)}
          placeholder="Ex: Matemática, Física, História..."
          className="bg-[#2a4066] border-gray-600 text-white placeholder-gray-400"
          disabled={isLoading}
        />
      </div>

      {/* Tópico Específico */}
      <div className="space-y-2">
        <Label htmlFor="topico_especifico" className="text-white">
          Tópico Específico
        </Label>
        <Input
          id="topico_especifico"
          value={formData.topico_especifico}
          onChange={(e) => handleInputChange("topico_especifico", e.target.value)}
          placeholder="Ex: Cálculo Diferencial, Segunda Guerra Mundial..."
          className="bg-[#2a4066] border-gray-600 text-white placeholder-gray-400"
          disabled={isLoading}
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label className="text-white">Tags</Label>
        <div className="flex gap-2">
          <Input
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            placeholder="Adicionar tag"
            className="bg-[#2a4066] border-gray-600 text-white placeholder-gray-400"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            disabled={isLoading}
          />
          <Button
            type="button"
            onClick={handleAddTag}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
            disabled={isLoading}
          >
            Adicionar
          </Button>
        </div>
        
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-[#FF6B00] text-white flex items-center gap-1"
              >
                {tag}
                <X
                  className="h-3 w-3 cursor-pointer hover:bg-red-500 rounded"
                  onClick={() => handleRemoveTag(tag)}
                />
              </Badge>
            ))}
          </div>
        )}
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
          disabled={isLoading}
          className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
        >
          {isLoading ? "Criando..." : "Criar Grupo"}
        </Button>
      </div>
    </form>
  );
};

export default CreateGroupForm;
