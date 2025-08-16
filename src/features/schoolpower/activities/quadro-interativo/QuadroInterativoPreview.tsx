
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuadroInterativoPreviewProps {
  data: any;
  activityData?: any;
}

export default function QuadroInterativoPreview({ data, activityData }: QuadroInterativoPreviewProps) {
  console.log('🖼️ QuadroInterativoPreview recebendo dados:', { data, activityData });

  // Extrair o conteúdo gerado da IA
  const generatedContent = data?.generatedContent || activityData?.generatedContent || {};
  const titulo = generatedContent.titulo || data?.titulo || '';
  const conteudo = generatedContent.conteudo || data?.conteudo || '';

  console.log('🖼️ Conteúdo extraído:', { titulo, conteudo });

  // Se não há conteúdo gerado, mostrar mensagem
  if (!titulo && !conteudo) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500">
          <h3 className="text-lg font-medium mb-2">Quadro Interativo</h3>
          <p>O conteúdo ainda não foi gerado. Clique em "Gerar Conteúdo com IA" para criar o material.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Card principal com o conteúdo gerado */}
      <Card className="shadow-lg border-2 border-gray-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="text-xl font-bold text-gray-800">
            {titulo || 'Quadro Interativo'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {conteudo || 'Conteúdo não disponível'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações adicionais se disponíveis */}
      {(data?.customFields || activityData?.customFields) && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Informações da Atividade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.customFields?.['Disciplina / Área de conhecimento'] || activityData?.customFields?.['Disciplina / Área de conhecimento']) && (
              <div>
                <span className="font-medium text-gray-600">Disciplina:</span>
                <span className="ml-2 text-gray-800">
                  {data?.customFields?.['Disciplina / Área de conhecimento'] || activityData?.customFields?.['Disciplina / Área de conhecimento']}
                </span>
              </div>
            )}
            
            {(data?.customFields?.['Ano / Série'] || activityData?.customFields?.['Ano / Série']) && (
              <div>
                <span className="font-medium text-gray-600">Ano/Série:</span>
                <span className="ml-2 text-gray-800">
                  {data?.customFields?.['Ano / Série'] || activityData?.customFields?.['Ano / Série']}
                </span>
              </div>
            )}

            {(data?.customFields?.['Tema ou Assunto da aula'] || activityData?.customFields?.['Tema ou Assunto da aula']) && (
              <div>
                <span className="font-medium text-gray-600">Tema:</span>
                <span className="ml-2 text-gray-800">
                  {data?.customFields?.['Tema ou Assunto da aula'] || activityData?.customFields?.['Tema ou Assunto da aula']}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
