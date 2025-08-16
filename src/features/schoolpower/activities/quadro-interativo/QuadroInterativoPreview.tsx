import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';

interface QuadroInterativoPreviewProps {
  data: any;
  activityData?: any;
}

export default function QuadroInterativoPreview({ data, activityData }: QuadroInterativoPreviewProps) {
  console.log('🖼️ QuadroInterativoPreview: Dados recebidos:', data);
  console.log('🖼️ QuadroInterativoPreview: Activity data:', activityData);

  // Extrair conteúdo dos dados - priorizar dados da IA
  const content = data?.conteudo || data?.content || data;
  const titulo = content?.titulo || data?.titulo || data?.title || 'Quadro Interativo';

  // Montar o texto completo com todo o conteúdo gerado pela IA
  let textoCompleto = '';

  // Adicionar introdução se existir
  if (content?.introducao) {
    textoCompleto += content.introducao + '\n\n';
  }

  // Adicionar conceitos principais
  if (content?.conceitosPrincipais) {
    textoCompleto += 'CONCEITOS PRINCIPAIS:\n' + content.conceitosPrincipais + '\n\n';
  }

  // Adicionar exemplos práticos
  if (content?.exemplosPraticos) {
    textoCompleto += 'EXEMPLOS PRÁTICOS:\n' + content.exemplosPraticos + '\n\n';
  }

  // Adicionar atividades práticas
  if (content?.atividadesPraticas) {
    textoCompleto += 'ATIVIDADES PRÁTICAS:\n' + content.atividadesPraticas + '\n\n';
  }

  // Adicionar resumo
  if (content?.resumo) {
    textoCompleto += 'RESUMO:\n' + content.resumo + '\n\n';
  }

  // Adicionar próximos passos
  if (content?.proximosPassos) {
    textoCompleto += 'PRÓXIMOS PASSOS:\n' + content.proximosPassos;
  }

  console.log('🖼️ QuadroInterativoPreview: Título extraído:', titulo);
  console.log('🖼️ QuadroInterativoPreview: Texto completo:', textoCompleto);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-6 w-6" />
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            Quadro Interativo
          </Badge>
        </div>
        <h1 className="text-2xl font-bold">{titulo}</h1>
      </div>

      {/* Card Retangular Simples - ÚNICA SEÇÃO VISÍVEL */}
      <Card className="border-2 border-purple-200 dark:border-purple-800">
        <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
          <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <BookOpen className="h-5 w-5" />
            {titulo}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {textoCompleto ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                {textoCompleto}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Conteúdo será carregado quando gerado pela IA</p>
              <p className="text-gray-400 text-sm mt-2">
                O conteúdo do quadro interativo será exibido aqui quando gerado pela IA.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}