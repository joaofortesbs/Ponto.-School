
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles } from 'lucide-react';
import QuadroInterativoPreview from './QuadroInterativoPreview';
import { 
  generateQuadroInterativoContent, 
  saveQuadroInterativoData, 
  getQuadroInterativoData,
  QuadroInterativoData,
  QuadroInterativoFieldData
} from './QuadroInterativoGenerator';

interface EditActivityProps {
  activityId: string;
  onSave?: (data: any) => void;
  initialData?: any;
}

const EditActivity: React.FC<EditActivityProps> = ({ 
  activityId, 
  onSave, 
  initialData 
}) => {
  const [formData, setFormData] = useState<QuadroInterativoFieldData>({
    titulo: '',
    disciplina: '',
    anoEscolar: '',
    tema: '',
    objetivo: '',
    instrucoes: '',
    observacoes: '',
    ...initialData
  });

  const [previewData, setPreviewData] = useState<QuadroInterativoData>({
    titulo: 'Quadro Interativo',
    texto: 'O conteúdo será gerado após preencher os campos e clicar em "Gerar Conteúdo".'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('edicao');

  // Carrega dados salvos ao inicializar
  useEffect(() => {
    const savedData = getQuadroInterativoData(activityId);
    if (savedData) {
      setPreviewData(savedData);
    }
  }, [activityId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateContent = async () => {
    if (!formData.titulo && !formData.tema) {
      alert('Por favor, preencha pelo menos o título ou tema antes de gerar o conteúdo.');
      return;
    }

    setIsGenerating(true);
    try {
      const generatedData = await generateQuadroInterativoContent(formData);
      setPreviewData(generatedData);
      saveQuadroInterativoData(activityId, generatedData);
      setActiveTab('preview');
      
      if (onSave) {
        onSave({
          ...formData,
          generatedContent: generatedData
        });
      }
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      alert('Erro ao gerar conteúdo. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edicao">Edição</TabsTrigger>
          <TabsTrigger value="preview">Pré-visualização</TabsTrigger>
        </TabsList>

        <TabsContent value="edicao" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Configuração do Quadro Interativo</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => handleInputChange('titulo', e.target.value)}
                    placeholder="Digite o título do quadro"
                  />
                </div>

                <div>
                  <Label htmlFor="disciplina">Disciplina</Label>
                  <Input
                    id="disciplina"
                    value={formData.disciplina}
                    onChange={(e) => handleInputChange('disciplina', e.target.value)}
                    placeholder="Ex: Matemática, História, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="anoEscolar">Ano Escolar</Label>
                  <Input
                    id="anoEscolar"
                    value={formData.anoEscolar}
                    onChange={(e) => handleInputChange('anoEscolar', e.target.value)}
                    placeholder="Ex: 5º ano, 9º ano, etc."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="tema">Tema</Label>
                  <Input
                    id="tema"
                    value={formData.tema}
                    onChange={(e) => handleInputChange('tema', e.target.value)}
                    placeholder="Tema principal do conteúdo"
                  />
                </div>

                <div>
                  <Label htmlFor="objetivo">Objetivo</Label>
                  <Textarea
                    id="objetivo"
                    value={formData.objetivo}
                    onChange={(e) => handleInputChange('objetivo', e.target.value)}
                    placeholder="Descreva o objetivo da atividade"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="instrucoes">Instruções</Label>
                <Textarea
                  id="instrucoes"
                  value={formData.instrucoes}
                  onChange={(e) => handleInputChange('instrucoes', e.target.value)}
                  placeholder="Instruções para os alunos"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  placeholder="Observações adicionais"
                  rows={2}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Button 
                onClick={handleGenerateContent}
                disabled={isGenerating}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando Conteúdo...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar Conteúdo
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Pré-visualização</h2>
            <QuadroInterativoPreview data={previewData} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditActivity;
