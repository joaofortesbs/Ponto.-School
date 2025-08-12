import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, BookOpen, Target, Users, Clock, CheckCircle, Loader2, Sparkles, Save, Eye, Play } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import SequenciaDidaticaProcessor from '../activities/sequencia-didatica/sequenciaDidaticaProcessor';

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityData: any;
  onSave: (data: any) => void;
}

interface SequenciaDidaticaPreviewProps {
  data: any;
}

const SequenciaDidaticaPreview: React.FC<SequenciaDidaticaPreviewProps> = ({ data }) => {
  if (!data?.sequenciaDidatica && !data?.titulo) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        <AlertCircle className="w-8 h-8 mr-3" />
        <span>Nenhuma sequência didática para visualizar</span>
      </div>
    );
  }

  const sequencia = data.sequenciaDidatica || data;

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-xl border border-orange-200 dark:border-orange-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {sequencia.titulo}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="flex items-center">
            <BookOpen className="w-4 h-4 mr-2 text-orange-600" />
            <span className="text-sm">{sequencia.disciplina}</span>
          </div>
          <div className="flex items-center">
            <Target className="w-4 h-4 mr-2 text-orange-600" />
            <span className="text-sm">{sequencia.tema}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-orange-600" />
            <span className="text-sm">{sequencia.publicoAlvo}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-orange-600" />
            <span className="text-sm">{sequencia.duracao}</span>
          </div>
        </div>
      </div>

      {/* Objetivos */}
      {sequencia.objetivos && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-orange-600" />
              Objetivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Objetivo Geral:</h4>
                <p className="text-gray-700 dark:text-gray-300">{sequencia.objetivos.geral}</p>
              </div>
              {sequencia.objetivos.especificos && (
                <div>
                  <h4 className="font-semibold mb-2">Objetivos Específicos:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {sequencia.objetivos.especificos.map((obj: string, idx: number) => (
                      <li key={idx} className="text-gray-700 dark:text-gray-300">{obj}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aulas */}
      {sequencia.aulas && sequencia.aulas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-orange-600" />
              Plano de Aulas ({sequencia.aulas.length} aulas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {sequencia.aulas.map((aula: any, idx: number) => (
                <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-lg">
                      Aula {aula.numero}: {aula.titulo}
                    </h4>
                    <Badge variant="outline">{aula.duracao}</Badge>
                  </div>

                  {/* Desenvolvimento da aula */}
                  {aula.desenvolvimento && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Início</h5>
                        <p className="text-sm text-blue-700 dark:text-blue-400">{aula.desenvolvimento.inicio}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                        <h5 className="font-medium text-green-800 dark:text-green-300 mb-1">Desenvolvimento</h5>
                        <p className="text-sm text-green-700 dark:text-green-400">{aula.desenvolvimento.desenvolvimento}</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                        <h5 className="font-medium text-purple-800 dark:text-purple-300 mb-1">Fechamento</h5>
                        <p className="text-sm text-purple-700 dark:text-purple-400">{aula.desenvolvimento.fechamento}</p>
                      </div>
                    </div>
                  )}

                  {/* Atividades */}
                  {aula.atividades && aula.atividades.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium mb-2">Atividades:</h5>
                      <div className="space-y-2">
                        {aula.atividades.map((atividade: any, atIdx: number) => (
                          <div key={atIdx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{atividade.nome}</span>
                              <Badge variant="secondary" className="text-xs">{atividade.duracao}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{atividade.descricao}</p>
                            {atividade.materiais && (
                              <div className="mt-2">
                                <span className="text-xs font-medium">Materiais: </span>
                                <span className="text-xs">{atividade.materiais.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Avaliação */}
                  {aula.avaliacao && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                      <h5 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Avaliação</h5>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Tipo:</span> {aula.avaliacao.tipo}</p>
                        {aula.avaliacao.instrumentos && (
                          <p><span className="font-medium">Instrumentos:</span> {aula.avaliacao.instrumentos.join(', ')}</p>
                        )}
                        {aula.avaliacao.criterios && (
                          <p><span className="font-medium">Critérios:</span> {aula.avaliacao.criterios.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recursos */}
      {sequencia.recursos && (
        <Card>
          <CardHeader>
            <CardTitle>Recursos Necessários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sequencia.recursos.materiais && (
                <div>
                  <h4 className="font-semibold mb-2">Materiais</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {sequencia.recursos.materiais.map((material: string, idx: number) => (
                      <li key={idx}>{material}</li>
                    ))}
                  </ul>
                </div>
              )}
              {sequencia.recursos.tecnologicos && (
                <div>
                  <h4 className="font-semibold mb-2">Tecnológicos</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {sequencia.recursos.tecnologicos.map((recurso: string, idx: number) => (
                      <li key={idx}>{recurso}</li>
                    ))}
                  </ul>
                </div>
              )}
              {sequencia.recursos.espaciais && (
                <div>
                  <h4 className="font-semibold mb-2">Espaciais</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {sequencia.recursos.espaciais.map((espaco: string, idx: number) => (
                      <li key={idx}>{espaco}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Avaliação Geral */}
      {sequencia.avaliacaoGeral && (
        <Card>
          <CardHeader>
            <CardTitle>Avaliação Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sequencia.avaliacaoGeral.criterios && (
                <div>
                  <h4 className="font-semibold mb-2">Critérios de Avaliação:</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {sequencia.avaliacaoGeral.criterios.map((criterio: string, idx: number) => (
                      <li key={idx}>{criterio}</li>
                    ))}
                  </ul>
                </div>
              )}
              {sequencia.avaliacaoGeral.instrumentos && (
                <div>
                  <h4 className="font-semibold mb-2">Instrumentos de Avaliação:</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {sequencia.avaliacaoGeral.instrumentos.map((instrumento: string, idx: number) => (
                      <li key={idx}>{instrumento}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const EditActivityModal: React.FC<EditActivityModalProps> = ({
  isOpen,
  onClose,
  activityData,
  onSave
}) => {
  const [formData, setFormData] = useState<any>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('edit');
  const [generationProgress, setGenerationProgress] = useState(0);

  useEffect(() => {
    if (activityData) {
      setFormData({
        disciplina: activityData.disciplina || '',
        tema: activityData.tema || activityData.title || activityData.description || '',
        publicoAlvo: activityData.publicoAlvo || '',
        duracao: activityData.duracao || '4 aulas de 50 minutos',
        objetivo: activityData.objetivo || '',
        observacoes: activityData.observacoes || ''
      });
    }
  }, [activityData]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerate = async () => {
    console.log('🎯 Iniciando geração de Sequência Didática');
    console.log('📝 Dados do formulário:', formData);

    if (!formData.tema || !formData.disciplina) {
      toast({
        title: "Dados insuficientes",
        description: "Preencha pelo menos o tema e a disciplina para gerar a sequência didática.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Processar dados com SequenciaDidaticaProcessor
      const result = await SequenciaDidaticaProcessor.processSequenciaDidatica(formData, {
        enableValidation: true,
        enableEnhancement: true,
        fallbackOnError: true
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (result.success) {
        setGeneratedContent(result.data);
        setActiveTab('preview');

        toast({
          title: "Sequência Didática gerada!",
          description: `Processamento concluído em ${result.metadata?.processingTime}ms`,
        });

        if (result.warnings && result.warnings.length > 0) {
          console.warn('⚠️ Avisos durante a geração:', result.warnings);
        }
      } else {
        throw new Error(result.error || 'Falha na geração');
      }

    } catch (error) {
      console.error('❌ Erro na geração:', error);
      toast({
        title: "Erro na geração",
        description: `Falha ao gerar sequência didática: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 2000);
    }
  };

  const handleSave = () => {
    const dataToSave = {
      ...formData,
      generatedContent,
      updatedAt: new Date().toISOString()
    };

    onSave(dataToSave);

    toast({
      title: "Atividade salva!",
      description: "A sequência didática foi salva com sucesso."
    });

    onClose();
  };

  const canGenerate = formData.tema && formData.disciplina;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-orange-500" />
            Editar Sequência Didática
          </DialogTitle>
        </DialogHeader>

        {isGenerating && (
          <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Gerando sequência didática...</span>
              <span className="text-sm text-orange-600">{generationProgress}%</span>
            </div>
            <Progress value={generationProgress} className="h-2" />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit" className="flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              Editar Dados
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center" disabled={!generatedContent}>
              <Eye className="w-4 h-4 mr-2" />
              Pré-visualização
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="flex-1 overflow-y-auto">
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="disciplina">Disciplina *</Label>
                  <Input
                    id="disciplina"
                    value={formData.disciplina || ''}
                    onChange={(e) => handleFieldChange('disciplina', e.target.value)}
                    placeholder="Ex: Matemática, Português, História..."
                  />
                </div>
                <div>
                  <Label htmlFor="tema">Tema/Assunto *</Label>
                  <Input
                    id="tema"
                    value={formData.tema || ''}
                    onChange={(e) => handleFieldChange('tema', e.target.value)}
                    placeholder="Ex: Funções do primeiro grau, Romantismo..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="publicoAlvo">Público-alvo</Label>
                  <Input
                    id="publicoAlvo"
                    value={formData.publicoAlvo || ''}
                    onChange={(e) => handleFieldChange('publicoAlvo', e.target.value)}
                    placeholder="Ex: 9º ano, Ensino Médio, EJA..."
                  />
                </div>
                <div>
                  <Label htmlFor="duracao">Duração</Label>
                  <Input
                    id="duracao"
                    value={formData.duracao || ''}
                    onChange={(e) => handleFieldChange('duracao', e.target.value)}
                    placeholder="Ex: 4 aulas de 50 minutos"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="objetivo">Objetivo Principal</Label>
                <Textarea
                  id="objetivo"
                  value={formData.objetivo || ''}
                  onChange={(e) => handleFieldChange('objetivo', e.target.value)}
                  placeholder="Descreva o principal objetivo da sequência didática..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes || ''}
                  onChange={(e) => handleFieldChange('observacoes', e.target.value)}
                  placeholder="Informações adicionais, contexto específico, adaptações necessárias..."
                  rows={3}
                />
              </div>

              <Separator />

              <div className="flex justify-center">
                <Button
                  onClick={handleGenerate}
                  disabled={!canGenerate || isGenerating}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Gerar Sequência Didática
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 overflow-y-auto">
            {generatedContent ? (
              <SequenciaDidaticaPreview data={generatedContent} />
            ) : (
              <div className="flex items-center justify-center p-8 text-gray-500">
                <AlertCircle className="w-8 h-8 mr-3" />
                <span>Gere a sequência didática primeiro para visualizar a pré-visualização</span>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!generatedContent}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Sequência Didática
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditActivityModal;