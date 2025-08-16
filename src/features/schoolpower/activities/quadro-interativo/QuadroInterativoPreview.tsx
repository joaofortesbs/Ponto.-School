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

  // Extract content from data
  const content = data?.conteudo || data?.content || data;
  const titulo = content?.titulo || data?.titulo || data?.title || 'Quadro Interativo';
  const descricao = content?.descricao || data?.descricao || data?.description || '';

  // Extract AI generated content
  const introducao = content?.introducao || '';
  const conceitosPrincipais = content?.conceitosPrincipais || [];
  const exemplosPraticos = content?.exemplosPraticos || [];
  const atividadesPraticas = content?.atividadesPraticas || [];
  const resumo = content?.resumo || '';
  const proximosPassos = content?.proximosPassos || [];

  console.log('🖼️ QuadroInterativoPreview: Conteúdo extraído:', {
    titulo,
    descricao,
    introducao,
    conceitosPrincipais,
    exemplosPraticos,
    atividadesPraticas,
    resumo,
    proximosPassos
  });

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
        <h1 className="text-2xl font-bold mb-2">{titulo}</h1>
        {descricao && <p className="text-purple-100">{descricao}</p>}
      </div>

      {/* Interactive Board Content - ONLY THIS SECTION SHOULD BE VISIBLE */}
      <Card className="border-2 border-purple-200 dark:border-purple-800">
        <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
          <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <BookOpen className="h-5 w-5" />
            Quadro Interativo:
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Check if we have AI generated content */}
          {(introducao || conceitosPrincipais.length > 0 || exemplosPraticos.length > 0 ||
            atividadesPraticas.length > 0 || resumo || proximosPassos.length > 0) ? (
            <div className="space-y-6">
              {/* Introdução */}
              {introducao && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-purple-700 dark:text-purple-300">Introdução</h3>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{introducao}</p>
                  </div>
                </div>
              )}

              {/* Conceitos Principais */}
              {conceitosPrincipais.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-blue-700 dark:text-blue-300">Conceitos Principais</h3>
                  <div className="grid gap-3">
                    {conceitosPrincipais.map((conceito: any, index: number) => (
                      <div key={index} className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                        {typeof conceito === 'string' ? (
                          <p className="text-gray-700 dark:text-gray-300">{conceito}</p>
                        ) : (
                          <div>
                            {conceito.titulo && <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">{conceito.titulo}</h4>}
                            {conceito.descricao && <p className="text-gray-700 dark:text-gray-300">{conceito.descricao}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exemplos Práticos */}
              {exemplosPraticos.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-green-700 dark:text-green-300">Exemplos Práticos</h3>
                  <div className="grid gap-3">
                    {exemplosPraticos.map((exemplo: any, index: number) => (
                      <div key={index} className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                        {typeof exemplo === 'string' ? (
                          <p className="text-gray-700 dark:text-gray-300">{exemplo}</p>
                        ) : (
                          <div>
                            {exemplo.titulo && <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">{exemplo.titulo}</h4>}
                            {exemplo.descricao && <p className="text-gray-700 dark:text-gray-300">{exemplo.descricao}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Atividades Práticas */}
              {atividadesPraticas.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-orange-700 dark:text-orange-300">Atividades Práticas</h3>
                  <div className="grid gap-3">
                    {atividadesPraticas.map((atividade: any, index: number) => (
                      <div key={index} className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border-l-4 border-orange-500">
                        {typeof atividade === 'string' ? (
                          <p className="text-gray-700 dark:text-gray-300">{atividade}</p>
                        ) : (
                          <div>
                            {atividade.titulo && <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">{atividade.titulo}</h4>}
                            {atividade.descricao && <p className="text-gray-700 dark:text-gray-300">{atividade.descricao}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resumo */}
              {resumo && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-indigo-700 dark:text-indigo-300">Resumo</h3>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{resumo}</p>
                  </div>
                </div>
              )}

              {/* Próximos Passos */}
              {proximosPassos.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-purple-700 dark:text-purple-300">Próximos Passos</h3>
                  <div className="grid gap-3">
                    {proximosPassos.map((passo: any, index: number) => (
                      <div key={index} className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-l-4 border-purple-500">
                        {typeof passo === 'string' ? (
                          <p className="text-gray-700 dark:text-gray-300">{passo}</p>
                        ) : (
                          <div>
                            {passo.titulo && <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">{passo.titulo}</h4>}
                            {passo.descricao && <p className="text-gray-700 dark:text-gray-300">{passo.descricao}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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