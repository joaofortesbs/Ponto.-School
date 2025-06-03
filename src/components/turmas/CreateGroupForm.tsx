
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
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

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

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const generateSimpleUniqueCode = (): string => {
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
    setDebugLog([]);
    addDebugLog('Iniciando criação de grupo com validações robustas...');
    
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        addDebugLog(`Tentativa ${attempt + 1} de ${maxRetries}`);

        // Validação de autenticação robusta
        addDebugLog('Verificando autenticação...');
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          addDebugLog(`Erro de autenticação: ${authError.message}`);
          throw new Error('Erro de autenticação. Faça login novamente.');
        }
        
        if (!user) {
          addDebugLog('Usuário não autenticado');
          throw new Error('Você precisa estar logado para criar um grupo');
        }

        addDebugLog(`Usuário autenticado: ${user.id}`);

        // Geração de código único com timestamp para evitar conflitos
        const codigoUnico = generateSimpleUniqueCode();
        addDebugLog(`Código único gerado: ${codigoUnico}`);

        // Validação de nome do grupo
        if (!formData.nome.trim()) {
          throw new Error('Nome do grupo não pode estar vazio');
        }

        const selectedTopic = topics.find(t => t.value === formData.topico);
        
        const groupData = {
          codigo_unico: codigoUnico,
          user_id: user.id, // CORREÇÃO: usar user_id em vez de criar entrada duplicada
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

        addDebugLog('Inserindo grupo no Supabase...');

        const { data, error } = await supabase
          .from('grupos_estudo')
          .insert(groupData)
          .select()
          .single();

        if (error) {
          addDebugLog(`Erro do Supabase: ${error.message}`);
          
          // Verificar se é erro de código duplicado e tentar novamente
          if (error.message.includes('duplicate') && error.message.includes('codigo_unico')) {
            addDebugLog('Código duplicado detectado, gerando novo código...');
            attempt++;
            if (attempt < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
          }
          throw error;
        }

        addDebugLog(`Grupo criado com sucesso! ID: ${data.id}`);
        
        // SOLUÇÃO DEFINITIVA: Não inserir em membros_grupos para evitar duplicação
        // O criador está implicitamente associado via user_id na tabela grupos_estudo
        addDebugLog('CORREÇÃO APLICADA: Criador associado via user_id - sem duplicação em membros_grupos');
        addDebugLog('Sistema simplificado e livre de erros de unicidade');

        addDebugLog('Grupo criado e configurado com sucesso!');
        alert(`Grupo criado com sucesso! Código: ${codigoUnico}`);
        onSubmit({ ...groupData, ...data });
        return; // Sair do loop de tentativas
        
      } catch (error: any) {
        console.error(`Erro na tentativa ${attempt + 1}:`, error);
        addDebugLog(`Erro na tentativa ${attempt + 1}: ${error.message}`);
        
        attempt++;
        
        if (attempt >= maxRetries) {
          addDebugLog('Todas as tentativas falharam');
          
          if (error.message?.includes('authenticated') || error.message?.includes('auth')) {
            alert('Erro: Usuário não autenticado. Faça login novamente.');
          } else if (error.message?.includes('connection') || error.message?.includes('network')) {
            alert('Erro: Falha de conexão. Verifique sua internet.');
          } else {
            alert(`Erro ao criar grupo: ${error.message}`);
          }
          break;
        } else {
          addDebugLog(`Aguardando ${1500}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
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

      <div className="flex items-center space-x-2">
        <Switch
          id="privado"
          checked={formData.privado}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, privado: checked }))}
        />
        <Label htmlFor="privado">Grupo Privado</Label>
      </div>

      {/* Debug Log */}
      {debugLog.length > 0 && (
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            className="mb-2"
          >
            {showDebug ? 'Ocultar' : 'Mostrar'} Debug Log
          </Button>
          
          {showDebug && (
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md max-h-32 overflow-y-auto text-xs">
              {debugLog.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))}
            </div>
          )}
        </div>
      )}

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
