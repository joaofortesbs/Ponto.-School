
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, BookOpen, Target, Copy, Download, X } from 'lucide-react';
import { ActivityFormData } from '../../construction/types/ActivityTypes';
import QuadroInterativoGenerator, { QuadroInterativoGeneratedContent } from './QuadroInterativoGenerator';

interface QuadroInterativoPreviewProps {
  data: ActivityFormData;
  activityData?: any;
  activityId?: string;
}

/**
 * Card de Visualização de Quadro - Interface completa para mostrar conteúdo gerado
 */
const CardDeVisualizacaoDeQuadro: React.FC<{
  title: string;
  description: string;
  subject: string;
  schoolYear: string;
  difficultyLevel: string;
  content: string;
  isLoading?: boolean;
  onClose?: () => void;
  onCopy?: () => void;
  onSave?: () => void;
}> = ({ 
  title, 
  description, 
  subject, 
  schoolYear, 
  difficultyLevel, 
  content, 
  isLoading = false,
  onClose,
  onCopy,
  onSave
}) => {
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 rounded-xl">
        <Card className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                Gerando atividade...
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                A IA está criando sua atividade de Quadro Interativo personalizada
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 bg-gray-50 dark:bg-gray-900 rounded-xl">
      <Card className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
        
        {/* Header do Card */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Quadro Interativo: {title}</h1>
                <p className="text-orange-100 text-sm">{description}</p>
              </div>
            </div>
            {onClose && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          
          {/* Badges de Informações */}
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              <BookOpen className="h-3 w-3 mr-1" />
              {subject}
            </Badge>
            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              <Users className="h-3 w-3 mr-1" />
              {schoolYear}
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
              <Target className="h-3 w-3 mr-1" />
              Nível {difficultyLevel}
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
              <Clock className="h-3 w-3 mr-1" />
              Atividade Gerada
            </Badge>
          </div>

          {/* Área de Conteúdo */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">
              Conteúdo da Atividade
            </h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 min-h-[300px]">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono leading-relaxed">
                {content || 'Conteúdo da atividade será exibido aqui após a geração...'}
              </pre>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onClose}
              className="flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Fechar</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={onCopy}
              className="flex items-center space-x-2"
            >
              <Copy className="h-4 w-4" />
              <span>Copiar Conteúdo</span>
            </Button>
            
            <Button 
              variant="default" 
              size="sm"
              onClick={onSave}
              className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600"
            >
              <Download className="h-4 w-4" />
              <span>Salvar Alterações</span>
            </Button>
          </div>
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
        setGeneratedContent({
          title: 'Erro na Geração',
          content: 'Houve um erro ao gerar o conteúdo. Verifique os dados e tente novamente.',
          success: false,
          error: newContent.error
        });
      }

    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      setGeneratedContent({
        title: 'Erro Inesperado',
        content: 'Ocorreu um erro inesperado durante a geração.',
        success: false,
        error: 'Erro inesperado'
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Monitora mudanças nos dados principais
   */
  useEffect(() => {
    const hasRequiredData = data.subject && data.schoolYear && data.theme && data.difficultyLevel;
    
    if (hasRequiredData && !hasGeneratedOnce) {
      generateOrRetrieveContent();
    }
  }, [data.subject, data.schoolYear, data.theme, data.difficultyLevel]);

  /**
   * Handlers para ações do card
   */
  const handleCopyContent = () => {
    if (generatedContent?.content) {
      navigator.clipboard.writeText(generatedContent.content);
      console.log('📋 Conteúdo copiado para a área de transferência');
    }
  };

  const handleSaveChanges = () => {
    if (generatedContent) {
      QuadroInterativoGenerator.saveGeneratedContent(activityId, generatedContent);
      console.log('💾 Alterações salvas');
    }
  };

  const handleClosePreview = () => {
    console.log('🔒 Preview fechado');
  };

  // Renderizar preview baseado no estado
  if (!data.subject || !data.schoolYear || !data.theme) {
    return (
      <CardDeVisualizacaoDeQuadro
        title="Aguardando Dados"
        description="Preencha os campos do formulário para visualizar a atividade de Quadro Interativo."
        subject="Não especificado"
        schoolYear="Não especificado"
        difficultyLevel="Não especificado"
        content="Configure os dados da atividade nos campos ao lado para gerar o conteúdo automaticamente."
        onClose={handleClosePreview}
        onCopy={handleCopyContent}
        onSave={handleSaveChanges}
      />
    );
  }

  if (isLoading) {
    return (
      <CardDeVisualizacaoDeQuadro
        title={data.title || 'Gerando Atividade'}
        description={data.description || 'Aguarde enquanto geramos sua atividade...'}
        subject={data.subject}
        schoolYear={data.schoolYear}
        difficultyLevel={data.difficultyLevel || 'Médio'}
        content=""
        isLoading={true}
        onClose={handleClosePreview}
        onCopy={handleCopyContent}
        onSave={handleSaveChanges}
      />
    );
  }

  return (
    <CardDeVisualizacaoDeQuadro
      title={generatedContent?.title || data.title || 'Atividade de Quadro Interativo'}
      description={data.description || 'Apresentação interativa sobre os diferentes tipos de relevo e os processos de formação de montanhas, utilizando recursos visuais e atividades práticas.'}
      subject={data.subject}
      schoolYear={data.schoolYear}
      difficultyLevel={data.difficultyLevel || 'Médio'}
      content={generatedContent?.content || 'Conteúdo da atividade será exibido aqui.'}
      onClose={handleClosePreview}
      onCopy={handleCopyContent}
      onSave={handleSaveChanges}
    />
  );
};

export default QuadroInterativoPreview;
