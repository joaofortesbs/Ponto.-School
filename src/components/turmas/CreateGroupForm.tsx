
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGruposEstudo } from "@/hooks/useGruposEstudo";

interface CreateGroupFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

const CreateGroupForm: React.FC<CreateGroupFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [isPublico, setIsPublico] = useState(false);
  
  const { createGrupo, creating } = useGruposEstudo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (creating) return; // Previne múltiplas submissões
    
    if (!nome.trim()) {
      return;
    }

    const novoGrupo = await createGrupo({
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
      is_publico: isPublico
    });

    if (novoGrupo) {
      // Chama o callback do componente pai
      onSubmit({
        nome: nome.trim(),
        descricao: descricao.trim(),
        isPublico
      });
      
      // Reset form
      setNome("");
      setDescricao("");
      setIsPublico(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="nome" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Nome do Grupo *
          </Label>
          <Input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Matemática Avançada"
            className="mt-1"
            required
            disabled={creating}
          />
        </div>

        <div>
          <Label htmlFor="descricao" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Descrição
          </Label>
          <Textarea
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descreva o objetivo do grupo de estudos..."
            className="mt-1"
            rows={3}
            disabled={creating}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="publico"
            checked={isPublico}
            onCheckedChange={setIsPublico}
            disabled={creating}
          />
          <Label htmlFor="publico" className="text-sm text-gray-700 dark:text-gray-300">
            Grupo público (visível para todos)
          </Label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={creating}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
          disabled={creating || !nome.trim()}
        >
          {creating ? "Criando..." : "Criar Grupo"}
        </Button>
      </div>
    </form>
  );
};

export default CreateGroupForm;
