
import React from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CarrosselQuadrosSalaAula from './CarrosselQuadrosSalaAula';

interface QuadroInterativoPreviewProps {
  data: any;
}

interface QuadroSlide {
  id: number;
  title: string;
  content: string;
  visual: string;
  audio: string;
}

export function QuadroInterativoPreview({ data }: QuadroInterativoPreviewProps) {
  const handleCopyContent = () => {
    const jsonContent = JSON.stringify(generateQuadroContent(data), null, 2);
    navigator.clipboard.writeText(jsonContent);
  };

  const handleClearContent = () => {
    // Implementar lógica de limpar conteúdo
    console.log('Limpar conteúdo');
  };

  const generateQuadroContent = (formData: any) => {
    return {
      slides: [
        {
          id: 1,
          title: `Introdução: ${formData.theme || 'Teorema de Pitágoras'}`,
          content: `O ${formData.theme || 'Teorema de Pitágoras'} é uma relação matemática fundamental entre os lados de um triângulo retângulo. Ele afirma que o quadrado da hipotenusa (o lado oposto ao ângulo reto) é igual à soma dos quadrados dos catetos (os outros dois lados).`,
          visual: `Imagem de um triângulo retângulo com os lados a, b e c (hipotenusa) claramente identificados.`,
          audio: `Narração explicando a definição do ${formData.theme || 'Teorema de Pitágoras'} com ênfase nos termos 'hipotenusa', 'cateto' e 'ângulo reto'.`
        },
        {
          id: 2,
          title: `Fórmula Matemática`,
          content: `A fórmula do ${formData.theme || 'Teorema de Pitágoras'} é expressa como a² + b² = c², onde 'a' e 'b' são os catetos e 'c' é a hipotenusa. Esta fórmula é fundamental para resolver problemas envolvendo triângulos retângulos.`,
          visual: `Representação visual da fórmula a² + b² = c² com quadrados coloridos representando as áreas.`,
          audio: `Explicação detalhada da fórmula com exemplos numéricos simples.`
        },
        {
          id: 3,
          title: `Aplicações Práticas`,
          content: `O ${formData.theme || 'Teorema de Pitágoras'} tem diversas aplicações práticas em arquitetura, engenharia, navegação e design. É usado para calcular distâncias, verificar se ângulos são retos e resolver problemas de construção.`,
          visual: `Exemplos visuais de aplicações do teorema na construção civil e no dia a dia.`,
          audio: `Narração sobre as aplicações práticas com exemplos do cotidiano.`
        }
      ]
    };
  };

  const quadroContent = generateQuadroContent(data);
  const slides: QuadroSlide[] = quadroContent.slides;

  const handleEditSlide = (slideId: number) => {
    console.log('Editar slide:', slideId);
    // Implementar lógica de edição
  };

  const handleRegenerateSlide = (slideId: number) => {
    console.log('Regenerar slide:', slideId);
    // Implementar lógica de regeneração
  };

  const handleDeleteSlide = (slideId: number) => {
    console.log('Excluir slide:', slideId);
    // Implementar lógica de exclusão
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header com informações da atividade */}
      <div className="bg-blue-500 text-white p-6 rounded-t-lg">
        <h2 className="text-2xl font-bold mb-2">
          Quadro Interativo: {data.theme || 'Teorema de Pitágoras'}
        </h2>
        <p className="text-blue-100 mb-4">
          Apresentação interativa do {data.theme || 'Teorema de Pitágoras'}, explorando suas aplicações práticas e demonstrações visuais.
        </p>
        
        <div className="flex gap-4 text-sm">
          <span className="bg-blue-400 px-3 py-1 rounded-full flex items-center gap-1">
            🎯 Atividade Gerada
          </span>
          <span className="bg-blue-400 px-3 py-1 rounded-full flex items-center gap-1">
            ⏱️ 45 minutos
          </span>
          <span className="bg-blue-400 px-3 py-1 rounded-full flex items-center gap-1">
            📊 Nível Médio
          </span>
        </div>
      </div>

      {/* Carrossel 3D */}
      <div className="flex-1 bg-white">
        <CarrosselQuadrosSalaAula
          slides={slides}
          onEdit={handleEditSlide}
          onRegenerate={handleRegenerateSlide}
          onDelete={handleDeleteSlide}
        />
      </div>

      {/* Footer com ações */}
      <div className="bg-gray-900 p-4 rounded-b-lg flex justify-between items-center">
        <div className="text-white text-sm">
          <span className="font-semibold">Conteúdo da Atividade</span>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleCopyContent}
            variant="outline"
            size="sm"
            className="bg-blue-600 text-white border-blue-500 hover:bg-blue-700"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copiar Conteúdo
          </Button>
          <Button
            onClick={handleClearContent}
            variant="outline"
            size="sm"
            className="bg-transparent text-white border-gray-600 hover:bg-gray-800"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Conteúdo
          </Button>
        </div>
      </div>
    </div>
  );
}

export default QuadroInterativoPreview;
