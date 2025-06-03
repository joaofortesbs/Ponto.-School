
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface CreateGroupFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

const CreateGroupForm: React.FC<CreateGroupFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    topico: "Matemática",
    cor: "#FF6B00",
    privacidade: "publico",
    visibilidade: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const topics = [
    { value: "Matemática", label: "📏 Matemática", color: "#3B82F6" },
    { value: "Língua Portuguesa", label: "📚 Língua Portuguesa", color: "#10B981" },
    { value: "Física", label: "⚡ Física", color: "#F59E0B" },
    { value: "Química", label: "🧪 Química", color: "#8B5CF6" },
    { value: "Biologia", label: "🌿 Biologia", color: "#EF4444" },
    { value: "História", label: "📜 História", color: "#F97316" },
    { value: "Geografia", label: "🌍 Geografia", color: "#06B6D4" },
    { value: "Filosofia", label: "🤔 Filosofia", color: "#6366F1" }
  ];

  const colors = [
    "#FF6B00", "#3B82F6", "#10B981", "#F59E0B", 
    "#EF4444", "#8B5CF6", "#06B6D4", "#6366F1"
  ];

  const generateUniqueCode = (): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return (timestamp + random).toUpperCase().substring(0, 8);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      alert('Nome do grupo é obrigatório!');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Você precisa estar logado para criar um grupo');
      }

      const codigoUnico = generateUniqueCode();
      const selectedTopic = topics.find(t => t.value === formData.topico);
      
      const groupData = {
        codigo_unico: codigoUnico,
        user_id: user.id,
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || null,
        topico: formData.topico,
        topico_nome: selectedTopic?.label || formData.topico,
        topico_icon: selectedTopic?.label.split(' ')[0] || "📚",
        cor: formData.cor,
        privado: formData.privacidade === "privado",
        is_publico: formData.privacidade === "publico",
        is_visible_to_all: formData.visibilidade === "all",
        is_visible_to_partners: formData.visibilidade === "partners",
        membros: 1
      };

      const { data, error } = await supabase
        .from('grupos_estudo')
        .insert(groupData)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      const { error: memberError } = await supabase
        .from('membros_grupos')
        .insert({
          grupo_id: data.id,
          user_id: user.id,
          joined_at: new Date().toISOString()
        });

      if (memberError) {
        throw memberError;
      }
      
      alert(`Grupo criado com sucesso! Código: ${codigoUnico}`);
      onSubmit({ ...groupData, ...data });
        
    } catch (error: any) {
      console.error('Erro ao criar grupo:', error);
      alert(`Erro ao criar grupo: ${error.message}`);
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nome">Nome do Grupo *</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
          placeholder="Digite o nome do grupo"
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
          placeholder="Descreva o objetivo do grupo (opcional)"
          className="mt-1 min-h-[80px]"
        />
      </div>

      <div>
        <Label htmlFor="topico">Tópico de Estudo</Label>
        <Select
          value={formData.topico}
          onValueChange={(value) => setFormData(prev => ({ ...prev, topico: value }))}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Selecione um tópico" />
          </SelectTrigger>
          <SelectContent>
            {topics.map((topic) => (
              <SelectItem key={topic.value} value={topic.value}>
                {topic.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Cor do Grupo</Label>
        <div className="flex gap-2 mt-2">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full border-2 ${
                formData.cor === color ? 'border-white' : 'border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData(prev => ({ ...prev, cor: color }))}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Privacidade do grupo</Label>
          <RadioGroup
            value={formData.privacidade}
            onValueChange={(value) => setFormData(prev => ({ ...prev, privacidade: value }))}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="publico" id="publico" />
              <Label htmlFor="publico">Público</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="privado" id="privado" />
              <Label htmlFor="privado">Privado</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-base font-medium">Visibilidade do grupo</Label>
          <RadioGroup
            value={formData.visibilidade}
            onValueChange={(value) => setFormData(prev => ({ ...prev, visibilidade: value }))}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="visibilidade-todos" />
              <Label htmlFor="visibilidade-todos">Permitir que todos vejam</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="partners" id="visibilidade-parceiros" />
              <Label htmlFor="visibilidade-parceiros">Permitir que meus Parceiros vejam</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white flex-1"
        >
          {isSubmitting ? 'Criando...' : 'Criar Grupo'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default CreateGroupForm;
