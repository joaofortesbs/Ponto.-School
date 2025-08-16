
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface QuadroInterativoPreviewProps {
  data: any;
  activityData?: any;
}

export default function QuadroInterativoPreview({ data, activityData }: QuadroInterativoPreviewProps) {
  console.log('🖼️ QuadroInterativoPreview: Dados recebidos:', data);
  console.log('🖼️ QuadroInterativoPreview: Activity data:', activityData);

  // Extrair título e conteúdo gerado pela IA
  let titulo = 'Quadro Interativo';
  let conteudo = '';

  // Verificar se há dados gerados pela IA
  if (data) {
    // Tentar extrair título
    titulo = data.titulo || 
             data.title || 
             data.data?.titulo ||
             activityData?.title ||
             activityData?.personalizedTitle ||
             'Quadro Interativo';

    // Tentar extrair conteúdo
    conteudo = data.conteudo || 
               data.content || 
               data.data?.conteudo ||
               data.descricao ||
               data.description ||
               '';

    console.log('🎯 Título extraído:', titulo);
    console.log('📝 Conteúdo extraído:', conteudo);
  }

  return (
    <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-4xl mx-auto border-2 border-purple-200 dark:border-purple-800 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <BookOpen className="h-6 w-6" />
            {titulo}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {conteudo ? (
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <div 
                className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
                style={{ fontSize: '16px', lineHeight: '1.6' }}
              >
                {conteudo}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Conteúdo será carregado quando gerado pela IA</p>
              <p className="text-gray-400 text-sm mt-2">
                O conteúdo do quadro interativo será exibido aqui quando gerado pela IA do Gemini.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
