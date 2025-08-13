
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, BookOpen, Target, Users, CheckSquare, FileText, Award } from 'lucide-react';
import { SequenciaDidaticaData } from './SequenciaDidaticaBuilder';

interface SequenciaDidaticaPreviewProps {
  data: SequenciaDidaticaData;
  className?: string;
}

const SequenciaDidaticaPreview: React.FC<SequenciaDidaticaPreviewProps> = ({ 
  data, 
  className = "" 
}) => {
  console.log('🎨 SequenciaDidaticaPreview: Renderizando preview com dados:', data);

  if (!data) {
    console.warn('⚠️ SequenciaDidaticaPreview: Dados não fornecidos');
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Nenhum dados da sequência didática disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header da Sequência Didática */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                {data.titulo}
              </CardTitle>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {data.disciplina}
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <Users className="h-3 w-3 mr-1" />
                  {data.serieAno}
                </Badge>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  <Clock className="h-3 w-3 mr-1" />
                  {data.duracao}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Objetivos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-green-600" />
            Objetivos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
              Objetivo Geral:
            </h4>
            <p className="text-gray-700 dark:text-gray-300 pl-4 border-l-2 border-green-400">
              {data.objetivos.geral}
            </p>
          </div>
          
          {data.objetivos.especificos.length > 0 && (
            <div>
              <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                Objetivos Específicos:
              </h4>
              <ul className="space-y-1 pl-4">
                {data.objetivos.especificos.map((objetivo, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    {objetivo}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Competências BNCC */}
      {data.competenciasBNCC.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-purple-600" />
              Competências BNCC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {data.competenciasBNCC.map((competencia, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                >
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <span className="text-gray-800 dark:text-gray-200">{competencia}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conteúdos */}
      {data.conteudos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-blue-600" />
              Conteúdos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {data.conteudos.map((conteudo, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded"
                >
                  <CheckSquare className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-800 dark:text-gray-200">{conteudo}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metodologia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-indigo-600" />
            Metodologia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.metodologia.estrategias.length > 0 && (
            <div>
              <h4 className="font-semibold text-indigo-700 dark:text-indigo-400 mb-2">
                Estratégias:
              </h4>
              <div className="grid gap-1">
                {data.metodologia.estrategias.map((estrategia, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-indigo-600">▸</span>
                    {estrategia}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {data.metodologia.recursos.length > 0 && (
            <div>
              <h4 className="font-semibold text-indigo-700 dark:text-indigo-400 mb-2">
                Recursos:
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.metodologia.recursos.map((recurso, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300"
                  >
                    {recurso}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Etapas */}
      {data.etapas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-orange-600" />
              Etapas da Sequência Didática
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.etapas.map((etapa, index) => (
                <div key={index} className="relative">
                  {/* Linha conectora entre etapas */}
                  {index < data.etapas.length - 1 && (
                    <div className="absolute left-6 top-16 w-0.5 h-6 bg-gray-300 dark:bg-gray-600"></div>
                  )}
                  
                  <div className="flex gap-4">
                    {/* Número da etapa */}
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                      {etapa.numero}
                    </div>
                    
                    {/* Conteúdo da etapa */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {etapa.titulo}
                        </h4>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          {etapa.duracao}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 italic">
                        {etapa.objetivoEspecifico}
                      </p>
                      
                      {/* Atividades */}
                      {etapa.atividades.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                            Atividades:
                          </h5>
                          <ul className="space-y-1 pl-4">
                            {etapa.atividades.map((atividade, atividadeIndex) => (
                              <li key={atividadeIndex} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                                <span className="text-orange-600 font-bold mt-1">•</span>
                                {atividade}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Recursos */}
                      {etapa.recursos.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                            Recursos:
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {etapa.recursos.map((recurso, recursoIndex) => (
                              <Badge 
                                key={recursoIndex} 
                                variant="secondary" 
                                className="text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                              >
                                {recurso}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Avaliação */}
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                        <h5 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                          Avaliação:
                        </h5>
                        <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                          {etapa.avaliacao}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {index < data.etapas.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Avaliação Final */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckSquare className="h-5 w-5 text-red-600" />
            Avaliação Final
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.avaliacaoFinal.criterios.length > 0 && (
            <div>
              <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">
                Critérios de Avaliação:
              </h4>
              <ul className="grid gap-1">
                {data.avaliacaoFinal.criterios.map((criterio, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-red-600">✓</span>
                    {criterio}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {data.avaliacaoFinal.instrumentos.length > 0 && (
            <div>
              <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">
                Instrumentos:
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.avaliacaoFinal.instrumentos.map((instrumento, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300"
                  >
                    {instrumento}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {data.avaliacaoFinal.forma && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <h4 className="font-semibold text-red-700 dark:text-red-400 mb-1">
                Forma de Avaliação:
              </h4>
              <p className="text-red-700 dark:text-red-300">
                {data.avaliacaoFinal.forma}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recursos Necessários */}
      {data.recursosNecessarios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-gray-600" />
              Recursos Necessários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {data.recursosNecessarios.map((recurso, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  <span className="text-gray-800 dark:text-gray-200">{recurso}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referências */}
      {data.referencias.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-gray-600" />
              Referências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.referencias.map((referencia, index) => (
                <li 
                  key={index} 
                  className="text-gray-700 dark:text-gray-300 pl-4 border-l-2 border-gray-300 dark:border-gray-600"
                >
                  {referencia}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SequenciaDidaticaPreview;
