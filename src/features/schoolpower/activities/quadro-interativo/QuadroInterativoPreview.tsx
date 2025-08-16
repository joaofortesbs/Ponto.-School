import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ActivityFormData } from '../../construction/types/ActivityTypes';
import QuadroInterativoGenerator, { QuadroInterativoGeneratedContent } from './QuadroInterativoGenerator';

interface QuadroInterativoPreviewProps {
  data: ActivityFormData;
  activityData?: any;
  activityId?: string;
}

/**
 * Card de Visualização de Quadro - Interface simplificada para mostrar conteúdo gerado
 */
const CardDeVisualizacaoDeQuadro: React.FC<{
  title: string;
  content: string;
  isLoading?: boolean;
}> = ({ title, content, isLoading = false }) => {
  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
        <CardContent className="p-8">
          {isLoading ? (
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400">Gerando atividade...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Título */}
              <div className="text-center border-b border-gray-200 dark:border-gray-600 pb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                  {title}
                </h2>
              </div>

              {/* Conteúdo */}
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
                {content.split('\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="text-base">
                      {paragraph.trim()}
                    </p>
                  )
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const QuadroInterativoPreview: React.FC<QuadroInterativoPreviewProps> = ({ 
  data, 
  activityData,
  activityId = 'default'
}) => {
  const [generatedContent, setGeneratedContent] = useState<QuadroInterativoGeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);

  /**
   * Gera ou recupera conteúdo da atividade
   */
  const generateOrRetrieveContent = async () => {
    try {
      setIsLoading(true);
      console.log('🎯 Iniciando geração/recuperação de conteúdo');

      // Primeiro, tentar recuperar conteúdo salvo
      const storedContent = QuadroInterativoGenerator.getStoredContent(activityId);

      if (storedContent && storedContent.success) {
        console.log('📂 Usando conteúdo armazenado');
        setGeneratedContent(storedContent);
        setHasGeneratedOnce(true);
        return;
      }

      // Se não há conteúdo salvo, gerar novo
      console.log('🔄 Gerando novo conteúdo');
      const newContent = await QuadroInterativoGenerator.generateContent(data);

      if (newContent.success) {
        setGeneratedContent(newContent);
        setHasGeneratedOnce(true);

        // Salvar conteúdo gerado
        QuadroInterativoGenerator.saveGeneratedContent(activityId, newContent);
        console.log('✅ Conteúdo gerado e salvo com sucesso');
      } else {
        console.error('❌ Falha na geração:', newContent.error);
        setGeneratedContent(newContent);
      }

    } catch (error) {
      console.error('❌ Erro no processo de geração:', error);
      setGeneratedContent({
        title: 'Erro na Geração',
        content: 'Ocorreu um erro ao gerar o conteúdo da atividade. Verifique os dados e tente novamente.',
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Detecta mudanças nos dados e regenera se necessário
   */
  useEffect(() => {
    // Verificar se há dados suficientes para gerar
    const hasRequiredData = data.title?.trim() || data.description?.trim() || data.subject?.trim();

    if (hasRequiredData) {
      // Se já gerou uma vez, não regerar automaticamente
      if (!hasGeneratedOnce) {
        generateOrRetrieveContent();
      }
    } else {
      // Limpar conteúdo se não há dados
      setGeneratedContent(null);
      setHasGeneratedOnce(false);
    }
  }, [data.title, data.description, data.subject, data.schoolYear, data.theme, data.objectives]);

  /**
   * Força regeneração quando dados mudam significativamente
   */
  useEffect(() => {
    if (hasGeneratedOnce) {
      // Pequeno delay antes de regenerar para evitar muitas chamadas
      const timeoutId = setTimeout(() => {
        generateOrRetrieveContent();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [data.objectives, data.difficultyLevel, data.quadroInterativoCampoEspecifico]);

  // Renderizar preview
  if (!generatedContent && !isLoading) {
    return (
      <CardDeVisualizacaoDeQuadro
        title="Aguardando Dados"
        content="Preencha os campos do formulário para visualizar a atividade de Quadro Interativo."
      />
    );
  }

  if (isLoading) {
    return (
      <CardDeVisualizacaoDeQuadro
        title="Gerando Atividade"
        content=""
        isLoading={true}
      />
    );
  }

  return (
    <CardDeVisualizacaoDeQuadro
      title={generatedContent?.title || 'Atividade de Quadro Interativo'}
      content={generatedContent?.content || 'Conteúdo da atividade será exibido aqui.'}
    />
  );
};

export default QuadroInterativoPreview;