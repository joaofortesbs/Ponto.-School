
import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { ArrowLeft, Save, Wand2, Eye, Upload, Loader2 } from 'lucide-react';
import { Template } from './types';
import { generateActivityWithGemini } from './api/geminiService';
import { toast } from '../../../hooks/use-toast';

interface TemplateEditorProps {
  template: Template;
  onSave: (template: Template) => void;
  onClose: () => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onSave, onClose }) => {
  const [editedTemplate, setEditedTemplate] = useState<Template>(template);
  const [generatedActivity, setGeneratedActivity] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleFieldChange = (key: string, value: any) => {
    setEditedTemplate(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [key]: value
      }
    }));
  };

  const handleGenerateActivity = async () => {
    setIsGenerating(true);
    try {
      const activity = await generateActivityWithGemini(editedTemplate);
      setGeneratedActivity(activity);
      
      // Salvar o preview gerado no template
      setEditedTemplate(prev => ({
        ...prev,
        last_generated_preview: activity
      }));

      toast({
        title: "Atividade gerada com sucesso!",
        description: "A atividade foi gerada usando IA e está pronta para visualização.",
      });
    } catch (error) {
      console.error('Error generating activity:', error);
      toast({
        title: "Erro ao gerar atividade",
        description: "Ocorreu um erro ao gerar a atividade. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishActivity = async () => {
    if (!generatedActivity) {
      toast({
        title: "Nenhuma atividade para publicar",
        description: "Gere uma atividade primeiro antes de publicar.",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    try {
      // Aqui você faria a integração com o School Power para publicar a atividade
      // Por exemplo, salvar na tabela de atividades do School Power
      
      // Atualizar status do template para publicado
      const updatedTemplate = {
        ...editedTemplate,
        status: 'published' as const
      };
      
      await onSave(updatedTemplate);
      
      toast({
        title: "Atividade publicada!",
        description: "A atividade foi publicada no School Power com sucesso.",
      });
    } catch (error) {
      console.error('Error publishing activity:', error);
      toast({
        title: "Erro ao publicar",
        description: "Ocorreu um erro ao publicar a atividade.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const renderTemplateFields = () => {
    // Campos dinâmicos baseados no tipo de template
    const commonFields = [
      { key: 'topic', label: 'Tópico', type: 'text', placeholder: 'Ex: Matemática - Álgebra' },
      { key: 'difficulty', label: 'Dificuldade', type: 'select', options: ['Básico', 'Intermediário', 'Avançado'] },
      { key: 'duration', label: 'Duração (min)', type: 'number', placeholder: '30' },
      { key: 'description', label: 'Descrição', type: 'textarea', placeholder: 'Descreva a atividade...' },
    ];

    // Campos específicos por tipo de template
    const specificFields: { [key: string]: any[] } = {
      'quiz': [
        { key: 'questionCount', label: 'Número de Questões', type: 'number', placeholder: '10' },
        { key: 'questionType', label: 'Tipo de Questão', type: 'select', options: ['Múltipla Escolha', 'Verdadeiro/Falso', 'Dissertativa'] },
      ],
      'essay': [
        { key: 'wordLimit', label: 'Limite de Palavras', type: 'number', placeholder: '500' },
        { key: 'theme', label: 'Tema Principal', type: 'text', placeholder: 'Tema da redação' },
      ],
      'exercise': [
        { key: 'exerciseCount', label: 'Número de Exercícios', type: 'number', placeholder: '5' },
        { key: 'includeExplanation', label: 'Incluir Explicação', type: 'select', options: ['Sim', 'Não'] },
      ]
    };

    const templateType = editedTemplate.id.split('-')[0]; // Extrair tipo do ID
    const fields = [...commonFields, ...(specificFields[templateType] || [])];

    return fields.map((field) => (
      <div key={field.key} className="space-y-2">
        <Label className="text-white/80">{field.label}</Label>
        {field.type === 'text' && (
          <Input
            value={editedTemplate.fields[field.key] || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="bg-white/5 border-white/10 text-white"
          />
        )}
        {field.type === 'number' && (
          <Input
            type="number"
            value={editedTemplate.fields[field.key] || ''}
            onChange={(e) => handleFieldChange(field.key, parseInt(e.target.value) || 0)}
            placeholder={field.placeholder}
            className="bg-white/5 border-white/10 text-white"
          />
        )}
        {field.type === 'textarea' && (
          <Textarea
            value={editedTemplate.fields[field.key] || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="bg-white/5 border-white/10 text-white min-h-[100px]"
          />
        )}
        {field.type === 'select' && (
          <Select
            value={editedTemplate.fields[field.key] || ''}
            onValueChange={(value) => handleFieldChange(field.key, value)}
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder={`Selecione ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent className="bg-[#1E293B] border-white/10 text-white">
              {field.options.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-[#0A1628]">
      <div className="border-b border-white/10 bg-[#1E293B] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white/60 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">
                Editar Template: {editedTemplate.name}
              </h1>
              <p className="text-white/60">ID: {editedTemplate.id}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => onSave(editedTemplate)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Coluna Esquerda - Configuração */}
        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Configuração do Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/80">Nome do Template</Label>
                <Input
                  value={editedTemplate.name}
                  onChange={(e) => setEditedTemplate(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/80">Provedor de IA</Label>
                <Select
                  value={editedTemplate.ia_provider}
                  onValueChange={(value) => setEditedTemplate(prev => ({ ...prev, ia_provider: value }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E293B] border-white/10 text-white">
                    <SelectItem value="Gemini">Gemini</SelectItem>
                    <SelectItem value="OpenAI">OpenAI</SelectItem>
                    <SelectItem value="Claude">Claude</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white/80">Status</Label>
                <Select
                  value={editedTemplate.status}
                  onValueChange={(value: 'draft' | 'published') => setEditedTemplate(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E293B] border-white/10 text-white">
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {renderTemplateFields()}

              <Button
                onClick={handleGenerateActivity}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Gerar Atividade
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Preview */}
        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview da Atividade
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#FF6B00] mb-4" />
                  <p className="text-white/60">Gerando atividade com IA...</p>
                </div>
              ) : generatedActivity ? (
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h3 className="font-semibold text-white mb-2">
                      {generatedActivity.title || 'Atividade Gerada'}
                    </h3>
                    <p className="text-white/70 text-sm mb-4">
                      {generatedActivity.description || 'Descrição da atividade'}
                    </p>
                    
                    {generatedActivity.content && (
                      <div className="text-white/60 text-sm">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(generatedActivity.content, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handlePublishActivity}
                    disabled={isPublishing}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Publicando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Publicar Atividade
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Eye className="h-12 w-12 text-white/40 mb-4" />
                  <p className="text-white/60 text-center">
                    Clique em "Gerar Atividade" para visualizar o preview
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
