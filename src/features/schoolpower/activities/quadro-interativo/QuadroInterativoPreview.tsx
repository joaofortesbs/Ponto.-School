
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Clock, Target, Copy, Trash2 } from 'lucide-react';

interface QuadroInterativoPreviewProps {
  data: any;
}

export function QuadroInterativoPreview({ data }: QuadroInterativoPreviewProps) {
  const handleCopyContent = () => {
    const jsonContent = JSON.stringify(generateQuadroContent(data), null, 2);
    navigator.clipboard.writeText(jsonContent);
  };

  const handleClearContent = () => {
    // Implementar lógica de limpar conteúdo
  };

  const generateQuadroContent = (formData: any) => {
    return {
      slides: [
        {
          slideNumber: 1,
          title: `O que é o ${formData.theme || 'Teorema de Pitágoras'}?`,
          content: `O ${formData.theme || 'Teorema de Pitágoras'} é uma relação matemática fundamental entre os lados de um triângulo retângulo. Ele afirma que o quadrado da hipotenusa (o lado oposto ao ângulo reto) é igual à soma dos quadrados dos catetos (os outros dois lados).`,
          visual: `Imagem de um triângulo retângulo com os lados a, b e c (hipotenusa) claramente identificados.`,
          audio: `Narração explicando a definição do ${formData.theme || 'Teorema de Pitágoras'} com ênfase nos termos 'hipotenusa', 'cateto' e 'ângulo reto'.`
        }
      ]
    };
  };

  const quadroContent = generateQuadroContent(data);

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      {/* Header da Atividade */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
        <h1 className="text-2xl font-bold mb-2">
          Quadro Interativo: {data.theme || 'Teorema de Pitágoras'}
        </h1>
        <p className="text-blue-100 mb-4">
          {data.description || 'Apresentação interativa do Teorema de Pitágoras, explorando suas aplicações práticas e demonstrações visuais.'}
        </p>

        {/* Badges de informações */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
            <Target className="w-4 h-4 mr-1" />
            {data.difficultyLevel || 'Atividade Gerada'}
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
            <Clock className="w-4 h-4 mr-1" />
            {data.duration || '45 minutos'}
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
            <Play className="w-4 h-4 mr-1" />
            {data.difficultyLevel || 'Nível Médio'}
          </Badge>
        </div>
      </div>

      {/* Conteúdo da Atividade */}
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Conteúdo da Atividade
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyContent}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copiar Conteúdo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearContent}
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Limpar Conteúdo
            </Button>
          </div>
        </div>

        {/* JSON Formatado com Syntax Highlighting */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <pre className="text-sm text-gray-100 font-mono overflow-x-auto whitespace-pre-wrap">
              <code className="language-json">
{JSON.stringify(quadroContent, null, 2)}
              </code>
            </pre>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="mt-6 flex justify-end gap-3">
          <Button 
            variant="outline"
            className="text-gray-600 hover:text-gray-800 border-gray-300 hover:bg-gray-50"
          >
            ✕ Fechar
          </Button>
          <Button 
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
          >
            💾 Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
}

export default QuadroInterativoPreview;
