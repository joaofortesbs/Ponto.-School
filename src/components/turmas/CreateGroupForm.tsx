
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
    privado: false,
    visibilidade: "todos"
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

  const generateUniqueCode = async (): Promise<string> => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      
      try {
        const { data, error } = await supabase
          .from('grupos_estudo')
          .select('codigo_unico')
          .eq('codigo_unico', code)
          .maybeSingle();
        
        if (error) {
          console.error('Erro ao verificar código único:', error);
          attempts++;
          continue;
        }
        
        if (!data) {
          return code;
        }
        
        attempts++;
      } catch (error) {
        console.error('Erro ao gerar código único:', error);
        attempts++;
      }
    }
    
    throw new Error('Não foi possível gerar um código único após várias tentativas');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      alert('Nome do grupo é obrigatório!');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const codigoUnico = await generateUniqueCode();
      const selectedTopic = topics.find(t => t.value === formData.topico);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Você precisa estar logado para criar um grupo');
        setIsSubmitting(false);
        return;
      }

      const groupData = {
        codigo_unico: codigoUnico,
        user_id: user.id,
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || null,
        topico: formData.topico,
        topico_nome: selectedTopic?.label || formData.topico,
        topico_icon: selectedTopic?.label.split(' ')[0] || "📚",
        cor: formData.cor,
        privado: formData.privado,
        is_publico: !formData.privado,
        visibilidade: formData.visibilidade,
        membros: 1
      };

      const { data, error } = await supabase
        .from('grupos_estudo')
        .insert(groupData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar grupo:', error);
        alert('Erro ao criar grupo. Tente novamente.');
        setIsSubmitting(false);
        return;
      }

      alert(`Grupo criado com sucesso! Código: ${codigoUnico}`);
      onSubmit({ ...groupData, ...data });
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      alert('Erro ao criar grupo. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
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

      <div className="flex items-center space-x-2">
        <Switch
          id="privado"
          checked={formData.privado}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, privado: checked }))}
        />
        <Label htmlFor="privado">Grupo Privado</Label>
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
