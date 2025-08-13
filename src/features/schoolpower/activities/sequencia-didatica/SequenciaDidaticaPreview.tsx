
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Users, Target, BookOpen, CheckCircle, Calendar } from 'lucide-react';

interface SequenciaDidaticaPreviewProps {
  data: any;
  isBuilt?: boolean;
}

const SequenciaDidaticaPreview: React.FC<SequenciaDidaticaPreviewProps> = ({ 
  data, 
  isBuilt = false 
}) => {
  // Se não há dados, mostrar estado vazio
  if (!data || !isBuilt) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <BookOpen size={64} className="mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Sequência Didática não gerada</h3>
        <p className="text-sm text-center max-w-md">
          Configure os campos necessários e clique em "Construir Atividade" para gerar sua sequência didática.
        </p>
      </div>
    );
  }

  // Extrair dados da sequência didática
  const titulo = data?.tituloTemaAssunto || data?.titulo || 'Sequência Didática';
  const anoSerie = data?.anoSerie || 'Não especificado';
  const disciplina = data?.disciplina || 'Não especificado';
  const publicoAlvo = data?.publicoAlvo || 'Não especificado';
  const objetivos = data?.objetivosAprendizagem || data?.objetivos || 'Não especificado';
  const competencias = data?.bnccCompetencias || data?.competencias || 'Não especificado';
  const quantidadeAulas = data?.quantidadeAulas || '0';
  const quantidadeDiagnosticos = data?.quantidadeDiagnosticos || '0';
  const quantidadeAvaliacoes = data?.quantidadeAvaliacoes || '0';
  const cronograma = data?.cronograma || 'Não especificado';

  // Dados das aulas (se disponível)
  const aulas = data?.aulas || [];
  const diagnosticos = data?.diagnosticos || [];
  const avaliacoes = data?.avaliacoes || [];

  return (
    <div className="space-y-6 p-4">
      {/* Cabeçalho */}
      <div className="text-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{titulo}</h1>
        <div className="flex justify-center gap-3 flex-wrap">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users size={14} />
            {anoSerie}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <BookOpen size={14} />
            {disciplina}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Target size={14} />
            {publicoAlvo}
          </Badge>
        </div>
      </div>

      {/* Informações Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target size={18} />
              Objetivos de Aprendizagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm leading-relaxed">{objetivos}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle size={18} />
              Competências BNCC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm leading-relaxed">{competencias}</p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={18} />
            Estrutura da Sequência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{quantidadeAulas}</div>
              <div className="text-sm text-gray-600">Aulas</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{quantidadeDiagnosticos}</div>
              <div className="text-sm text-gray-600">Diagnósticos</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{quantidadeAvaliacoes}</div>
              <div className="text-sm text-gray-600">Avaliações</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cronograma */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={18} />
            Cronograma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{cronograma}</p>
        </CardContent>
      </Card>

      {/* Aulas (se disponível) */}
      {aulas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aulas Planejadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aulas.map((aula: any, index: number) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-medium text-gray-800">
                    Aula {index + 1}: {aula.titulo || aula.tema || `Aula ${index + 1}`}
                  </h4>
                  {aula.objetivos && (
                    <p className="text-sm text-gray-600 mt-1">{aula.objetivos}</p>
                  )}
                  {aula.duracao && (
                    <div className="flex items-center gap-1 mt-1">
                      <Clock size={12} />
                      <span className="text-xs text-gray-500">{aula.duracao}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diagnósticos (se disponível) */}
      {diagnosticos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Diagnósticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {diagnosticos.map((diagnostico: any, index: number) => (
                <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                  <h4 className="font-medium text-gray-800">
                    {diagnostico.titulo || `Diagnóstico ${index + 1}`}
                  </h4>
                  {diagnostico.descricao && (
                    <p className="text-sm text-gray-600 mt-1">{diagnostico.descricao}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Avaliações (se disponível) */}
      {avaliacoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Avaliações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {avaliacoes.map((avaliacao: any, index: number) => (
                <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                  <h4 className="font-medium text-gray-800">
                    {avaliacao.titulo || `Avaliação ${index + 1}`}
                  </h4>
                  {avaliacao.descricao && (
                    <p className="text-sm text-gray-600 mt-1">{avaliacao.descricao}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SequenciaDidaticaPreview;
