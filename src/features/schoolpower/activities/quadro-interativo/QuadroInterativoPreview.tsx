import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <div className="h-full bg-gray-50 dark:bg-gray-900">
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
            <button
              onClick={handleCopyContent}
              className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors flex items-center gap-1"
            >
              <Copy className="w-4 h-4" />
              Copiar Conteúdo
            </button>
            <button
              onClick={handleClearContent}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Limpar Conteúdo
            </button>
          </div>
        </div>

        {/* JSON Formatado com Syntax Highlighting */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <pre className="text-sm text-gray-100 font-mono overflow-x-auto">
              <code className="language-json">
{`{
  "slides": [
    {
      "slideNumber": 1,
      "title": "${data.theme || 'O que é o Teorema de Pitágoras'}?",
      "content": "O ${data.theme || 'Teorema de Pitágoras'} é uma relação matemática fundamental entre os lados de um triângulo retângulo. Ele afirma que o quadrado da hipotenusa (o lado oposto ao ângulo reto) é igual à soma dos quadrados dos catetos (os outros dois lados).",
      "visual": "Imagem de um triângulo retângulo com os lados a, b e c (hipotenusa) claramente identificados.",
      "audio": "Narração explicando a definição do ${data.theme || 'Teorema de Pitágoras'} com ênfase nos termos 'hipotenusa', 'cateto' e 'ângulo reto'."
    }
  ]
}`}
              </code>
            </pre>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="mt-6 flex justify-end gap-3">
          <button className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            ✕ Fechar
          </button>
          <button className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center gap-2">
            💾 Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuadroInterativoPreview;