import React, { useEffect, useState } from 'react';
import CarrosselQuadrosSalaAula from './CarrosselQuadrosSalaAula';
import QuadroInterativoGenerator, { QuadroInterativoData, QuadroInterativoGeneratedContent } from './QuadroInterativoGenerator';

interface QuadroInterativoPreviewProps {
  activityData: any;
}

interface GeneratedCard {
  id: number;
  title: string;
  content: string;
  visual: string;
  audio: string;
}

export const QuadroInterativoPreview: React.FC<QuadroInterativoPreviewProps> = ({ 
  activityData 
}) => {
  const [slides, setSlides] = useState<GeneratedCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    if (activityData) {
      generateQuadroInterativoContent();
    }
  }, [activityData]);

  const generateQuadroInterativoContent = async () => {
    if (!activityData) return;

    console.log('🖼️ Iniciando geração de conteúdo para Quadro Interativo:', activityData);
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const generator = new QuadroInterativoGenerator();

      // Preparar dados para a IA
      const quadroData: QuadroInterativoData = {
        title: activityData.title || '',
        description: activityData.description || '',
        subject: activityData.subject || '',
        schoolYear: activityData.schoolYear || '',
        theme: activityData.theme || '',
        objectives: activityData.objectives || '',
        difficultyLevel: activityData.difficultyLevel || '',
        quadroInterativoCampoEspecifico: activityData.quadroInterativoCampoEspecifico || '',
        materials: activityData.materials || '',
        instructions: activityData.instructions || '',
        evaluation: activityData.evaluation || '',
        timeLimit: activityData.timeLimit || '',
        context: activityData.context || ''
      };

      // Validar dados antes de enviar para a IA
      if (!QuadroInterativoGenerator.validateData(quadroData)) {
        console.warn('⚠️ Dados insuficientes para geração, usando conteúdo padrão');
        setFallbackSlides();
        return;
      }

      // Gerar conteúdo com IA
      console.log('🤖 Solicitando geração de conteúdo para a IA...');
      const generatedContent: QuadroInterativoGeneratedContent = await generator.generateQuadroInterativoContent(quadroData);

      console.log('✅ Conteúdo gerado pela IA:', generatedContent);

      // Converter conteúdo gerado em slides
      const newSlides: GeneratedCard[] = [
        {
          id: 1,
          title: generatedContent.card1.title,
          content: generatedContent.card1.content,
          visual: `Elementos visuais para: ${generatedContent.card1.title}`,
          audio: `Narração: ${generatedContent.card1.title}`
        },
        {
          id: 2,
          title: generatedContent.card2.title,
          content: generatedContent.card2.content,
          visual: `Elementos visuais para: ${generatedContent.card2.title}`,
          audio: `Narração: ${generatedContent.card2.title}`
        }
      ];

      setSlides(newSlides);
      console.log('🎯 Slides atualizados com conteúdo gerado pela IA');

    } catch (error) {
      console.error('❌ Erro ao gerar conteúdo do Quadro Interativo:', error);
      setGenerationError('Erro ao gerar conteúdo. Usando conteúdo padrão.');
      setFallbackSlides();
    } finally {
      setIsGenerating(false);
    }
  };

  const setFallbackSlides = () => {
    const fallbackSlides: GeneratedCard[] = [
      {
        id: 1,
        title: activityData?.title || "Quadro Interativo",
        content: activityData?.description || "Descrição da atividade de quadro interativo",
        visual: "Elementos visuais baseados no tema",
        audio: "Narração personalizada"
      },
      {
        id: 2,
        title: "Objetivos de Aprendizagem",
        content: activityData?.objectives || "Objetivos da atividade definidos pelo professor",
        visual: "Visualização dos objetivos",
        audio: "Explicação dos objetivos"
      }
    ];

    setSlides(fallbackSlides);
  };

  if (isGenerating) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Gerando conteúdo do Quadro Interativo...</p>
          <p className="text-gray-500 text-sm">A IA está analisando os dados e criando o conteúdo</p>
        </div>
      </div>
    );
  }

  if (generationError) {
    return (
      <div className="w-full h-full">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-800 text-sm">⚠️ {generationError}</p>
        </div>
        <CarrosselQuadrosSalaAula slides={slides} />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <CarrosselQuadrosSalaAula slides={slides} />
    </div>
  );
};