
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import CarrosselQuadrosSalaAula from './CarrosselQuadrosSalaAula';
import { QuadroContentGenerator, QuadroContent, QuadroGenerationData } from './QuadroContentGenerator';

interface QuadroInterativoBuilderProps {
  formData: any;
  onContentGenerated?: (quadros: QuadroContent[]) => void;
  isVisible?: boolean;
}

const QuadroInterativoBuilder: React.FC<QuadroInterativoBuilderProps> = ({
  formData,
  onContentGenerated,
  isVisible = true
}) => {
  const [quadros, setQuadros] = useState<QuadroContent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Gerar quadros automaticamente quando os dados estão disponíveis
  useEffect(() => {
    if (isVisible && formData && !hasGenerated && shouldAutoGenerate()) {
      handleGenerateQuadros();
    }
  }, [isVisible, formData, hasGenerated]);

  const shouldAutoGenerate = (): boolean => {
    return !!(
      formData.subject &&
      formData.schoolYear &&
      formData.theme &&
      formData.objectives
    );
  };

  const prepareGenerationData = (): QuadroGenerationData => {
    return {
      disciplina: formData.subject || 'Disciplina',
      anoSerie: formData.schoolYear || 'Ano/Série',
      tema: formData.theme || 'Tema da Aula',
      objetivo: formData.objectives || 'Objetivos de Aprendizagem',
      contexto: formData.context || ''
    };
  };

  const handleGenerateQuadros = async () => {
    if (!shouldAutoGenerate()) {
      toast({
        title: "Dados Insuficientes",
        description: "Preencha disciplina, ano/série, tema e objetivos para gerar os quadros.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    console.log('🎯 Iniciando geração de quadros...');

    try {
      const generationData = prepareGenerationData();
      const generatedQuadros = await QuadroContentGenerator.generateQuadrosContent(generationData);
      
      setQuadros(generatedQuadros);
      setHasGenerated(true);
      
      if (onContentGenerated) {
        onContentGenerated(generatedQuadros);
      }

      toast({
        title: "Quadros Gerados!",
        description: "Os 3 quadros de sala de aula foram criados com sucesso.",
      });

    } catch (error) {
      console.error('❌ Erro na geração de quadros:', error);
      toast({
        title: "Erro na Geração",
        description: "Houve um problema ao gerar os quadros. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditQuadro = (quadroId: string) => {
    console.log('✏️ Editando quadro:', quadroId);
    toast({
      title: "Edição de Quadro",
      description: "Funcionalidade de edição será implementada em breve.",
    });
  };

  const handleRegenerateQuadro = async (quadroId: string) => {
    if (!shouldAutoGenerate()) {
      toast({
        title: "Dados Insuficientes",
        description: "Dados da atividade são necessários para regenerar o quadro.",
        variant: "destructive"
      });
      return;
    }

    setIsRegenerating(quadroId);
    console.log('🔄 Regenerando quadro:', quadroId);

    try {
      const generationData = prepareGenerationData();
      const quadroToRegenerate = quadros.find(q => q.id === quadroId);
      
      if (!quadroToRegenerate) {
        throw new Error('Quadro não encontrado');
      }

      const newQuadro = await QuadroContentGenerator.regenerateQuadro(
        generationData,
        quadroId,
        quadroToRegenerate.type
      );

      const updatedQuadros = quadros.map(q => 
        q.id === quadroId ? newQuadro : q
      );

      setQuadros(updatedQuadros);

      if (onContentGenerated) {
        onContentGenerated(updatedQuadros);
      }

      toast({
        title: "Quadro Regenerado!",
        description: "O conteúdo do quadro foi atualizado com sucesso.",
      });

    } catch (error) {
      console.error('❌ Erro na regeneração:', error);
      toast({
        title: "Erro na Regeneração",
        description: "Houve um problema ao regenerar o quadro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsRegenerating(null);
    }
  };

  const handleDeleteQuadro = (quadroId: string) => {
    console.log('🗑️ Excluindo quadro:', quadroId);
    
    const updatedQuadros = quadros.filter(q => q.id !== quadroId);
    setQuadros(updatedQuadros);

    if (onContentGenerated) {
      onContentGenerated(updatedQuadros);
    }

    toast({
      title: "Quadro Excluído",
      description: "O quadro foi removido com sucesso.",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header da construção */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quadros de Sala de Aula
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Visualize como organizar o conteúdo no quadro durante a aula
              </p>
            </div>
            
            <div className="flex space-x-2">
              {!hasGenerated && (
                <Button
                  onClick={handleGenerateQuadros}
                  disabled={isGenerating || !shouldAutoGenerate()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Gerar Quadros
                    </>
                  )}
                </Button>
              )}
              
              {hasGenerated && (
                <Button
                  onClick={handleGenerateQuadros}
                  disabled={isGenerating}
                  variant="outline"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Regenerando...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Regenerar Todos
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carrossel de quadros */}
      {(hasGenerated || quadros.length > 0) && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <CarrosselQuadrosSalaAula
              quadros={quadros}
              onEditQuadro={handleEditQuadro}
              onRegenerateQuadro={handleRegenerateQuadro}
              onDeleteQuadro={handleDeleteQuadro}
              autoRotate={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Preview dos conteúdos */}
      {quadros.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
              Conteúdo dos Quadros
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quadros.map((quadro, index) => (
                <div key={quadro.id} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      quadro.type === 'texto' ? 'bg-blue-400' : 'bg-green-400'
                    }`}></div>
                    <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                      {quadro.title}
                    </h5>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-xs text-gray-600 dark:text-gray-400 max-h-24 overflow-y-auto">
                    {quadro.content}
                  </div>
                  
                  {isRegenerating === quadro.id && (
                    <div className="flex items-center space-x-1 text-xs text-blue-600">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Regenerando...</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuadroInterativoBuilder;
