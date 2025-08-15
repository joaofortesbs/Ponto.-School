import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Monitor, Target, Play, FileText, Package, CheckCircle, Zap } from 'lucide-react';

interface QuadroInterativoPreviewProps {
  activityData?: any;
}

export function QuadroInterativoPreview({ activityData }: QuadroInterativoPreviewProps) {
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateContent = async () => {
      setIsLoading(true);
      try {
        console.log('🖼️ Iniciando geração de conteúdo para Quadro Interativo...');

        if (activityData) {
          const generatedContent = await QuadroInterativoGenerator.generateContent(activityData);
          console.log('✅ Conteúdo gerado com sucesso:', generatedContent);
          setContent(generatedContent);
        } else {
          // Conteúdo padrão quando não há dados
          const defaultContent = {
            card1: {
              titulo: "Introdução",
              conteudo: "Conteúdo introdutório sobre o tema da aula. Este card apresenta os conceitos fundamentais que serão explorados."
            },
            card2: {
              titulo: "Conceitos",
              conteudo: "Principais conceitos e informações importantes. Aqui você encontrará as informações essenciais para o aprendizado."
            }
          };
          console.log('📋 Usando conteúdo padrão:', defaultContent);
          setContent(defaultContent);
        }
      } catch (error) {
        console.error('❌ Erro ao gerar conteúdo:', error);
        // Fallback para conteúdo básico
        setContent({
          card1: { titulo: "Introdução", conteudo: "Conteúdo introdutório" },
          card2: { titulo: "Conceitos", conteudo: "Conceitos principais" }
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateContent();
  }, [activityData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Gerando conteúdo...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-gray-500">Nenhum conteúdo disponível</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header da Atividade */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Quadro Interativo
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Visualização interativa do conteúdo educacional
        </p>
      </div>

      {/* Carrossel de Quadros */}
      <div className="relative">
        <CarrosselQuadrosSalaAula contentData={content} />
      </div>

      {/* Informações Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-500 mb-2">2</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Cards Interativos</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-500 mb-2">
            <Play className="h-6 w-6 mx-auto" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Navegação Interativa</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-500 mb-2">100%</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Responsivo</p>
        </Card>
      </div>
    </div>
  );
}

export default QuadroInterativoPreview;