
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, Save } from 'lucide-react';
import { Template } from './types';
import { generateTemplateContent } from './api/geminiService';
import { useTemplates } from './hooks/useTemplates';
import { useToast } from '@/hooks/use-toast';

interface TemplateViewerProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
}

interface FormField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

const getTemplateFields = (templateId: string): FormField[] => {
  const commonFields: Record<string, FormField[]> = {
    'plano-aula': [
      { key: 'disciplina', label: 'Disciplina', type: 'text', required: true, placeholder: 'Ex: Matemática' },
      { key: 'serie', label: 'Série/Ano', type: 'text', required: true, placeholder: 'Ex: 8º ano' },
      { key: 'tema', label: 'Tema da Aula', type: 'text', required: true, placeholder: 'Ex: Equações do 1º grau' },
      { key: 'duracao', label: 'Duração (minutos)', type: 'number', required: true, placeholder: '50' },
      { key: 'objetivos', label: 'Objetivos de Aprendizagem', type: 'textarea', required: true, placeholder: 'Descreva os objetivos...' },
      { key: 'recursos', label: 'Recursos Necessários', type: 'textarea', placeholder: 'Quadro, livro didático...' }
    ],
    'lista-exercicios': [
      { key: 'disciplina', label: 'Disciplina', type: 'text', required: true, placeholder: 'Ex: Português' },
      { key: 'tema', label: 'Tema/Conteúdo', type: 'text', required: true, placeholder: 'Ex: Interpretação de texto' },
      { key: 'quantidade', label: 'Número de Exercícios', type: 'number', required: true, placeholder: '10' },
      { key: 'dificuldade', label: 'Nível de Dificuldade', type: 'select', required: true, options: ['Fácil', 'Médio', 'Difícil'] },
      { key: 'serie', label: 'Série/Ano', type: 'text', required: true, placeholder: 'Ex: 6º ano' },
      { key: 'observacoes', label: 'Observações Especiais', type: 'textarea', placeholder: 'Instruções adicionais...' }
    ],
    'prova': [
      { key: 'disciplina', label: 'Disciplina', type: 'text', required: true, placeholder: 'Ex: História' },
      { key: 'tema', label: 'Conteúdo da Prova', type: 'text', required: true, placeholder: 'Ex: Brasil Colonial' },
      { key: 'questoes', label: 'Número de Questões', type: 'number', required: true, placeholder: '15' },
      { key: 'tipo', label: 'Tipo de Questões', type: 'select', required: true, options: ['Múltipla Escolha', 'Dissertativas', 'Mistas'] },
      { key: 'serie', label: 'Série/Ano', type: 'text', required: true, placeholder: 'Ex: 9º ano' },
      { key: 'tempo', label: 'Tempo de Prova (minutos)', type: 'number', required: true, placeholder: '90' }
    ],
    'resumo': [
      { key: 'tema', label: 'Tema do Resumo', type: 'text', required: true, placeholder: 'Ex: Revolução Industrial' },
      { key: 'disciplina', label: 'Disciplina', type: 'text', required: true, placeholder: 'Ex: História' },
      { key: 'serie', label: 'Série/Ano', type: 'text', required: true, placeholder: 'Ex: 8º ano' },
      { key: 'tamanho', label: 'Tamanho do Resumo', type: 'select', required: true, options: ['Curto (1 página)', 'Médio (2-3 páginas)', 'Longo (4+ páginas)'] },
      { key: 'pontos', label: 'Pontos Principais', type: 'textarea', required: true, placeholder: 'Liste os pontos que devem ser abordados...' }
    ]
  };

  return commonFields[templateId] || [
    { key: 'conteudo', label: 'Conteúdo', type: 'textarea', required: true, placeholder: 'Descreva o que precisa ser gerado...' },
    { key: 'serie', label: 'Série/Ano', type: 'text', required: true, placeholder: 'Ex: 7º ano' },
    { key: 'disciplina', label: 'Disciplina', type: 'text', required: true, placeholder: 'Ex: Ciências' }
  ];
};

export const TemplateViewer: React.FC<TemplateViewerProps> = ({
  template,
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { saveGeneratedActivity } = useTemplates();

  if (!template) return null;

  const fields = getTemplateFields(template.id);

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    // Validar campos obrigatórios
    const requiredFields = fields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !formData[field.key]);

    if (missingFields.length > 0) {
      toast({
        title: 'Campos obrigatórios',
        description: `Preencha todos os campos obrigatórios: ${missingFields.map(f => f.label).join(', ')}`,
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const content = await generateTemplateContent(template, formData);
      setGeneratedContent(content);
      toast({
        title: 'Conteúdo gerado!',
        description: 'O conteúdo foi gerado com sucesso pela IA.'
      });
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      toast({
        title: 'Erro na geração',
        description: 'Houve um erro ao gerar o conteúdo. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent) {
      toast({
        title: 'Nenhum conteúdo',
        description: 'Gere um conteúdo antes de salvar.',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
      const title = `${template.name} - ${formData.tema || formData.disciplina || 'Atividade'}`;
      await saveGeneratedActivity(template.id, title, generatedContent, formData);
      
      toast({
        title: 'Conteúdo salvo!',
        description: 'O conteúdo foi salvo e está disponível na seção de construção.'
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Houve um erro ao salvar o conteúdo.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            value={formData[field.key] || ''}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="min-h-[100px]"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={formData[field.key] || ''}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
        );
      case 'select':
        return (
          <Select
            value={formData[field.key] || ''}
            onValueChange={(value) => handleInputChange(field.key, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Input
            value={formData[field.key] || ''}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-bold text-gray-800">
            {template.name}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            {template.description}
          </p>
        </DialogHeader>

        <div className="flex h-full">
          {/* Painel Esquerdo - Formulário */}
          <div className="w-1/2 p-6 border-r overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configurações da Atividade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map(field => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key} className="text-sm font-medium">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {renderField(field)}
                  </div>
                ))}

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Gerar Conteúdo
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Painel Direito - Visualização */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Conteúdo Gerado</CardTitle>
                {generatedContent && (
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {generatedContent ? (
                  <div className="bg-gray-50 p-4 rounded-lg min-h-[400px]">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800">
                      {generatedContent}
                    </pre>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-gray-500">
                    <div className="text-center">
                      <Wand2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Preencha os campos e clique em "Gerar Conteúdo"</p>
                      <p className="text-sm mt-2">O conteúdo aparecerá aqui</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateViewer;
