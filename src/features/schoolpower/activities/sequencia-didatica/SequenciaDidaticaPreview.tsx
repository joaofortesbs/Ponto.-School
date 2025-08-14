import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Target, BarChart3, FileText } from 'lucide-react';
import AulaCard from './components/AulaCard';
import DiagnosticoCard from './components/DiagnosticoCard';
import AvaliacaoCard from './components/AvaliacaoCard';
import SequenciaDidaticaHeader from './components/SequenciaDidaticaHeader';

interface SequenciaDidaticaPreviewProps {
  data?: any;
  activityData?: any;
}

export const SequenciaDidaticaPreview: React.FC<SequenciaDidaticaPreviewProps> = ({ data, activityData }) => {
  console.log('🎯 SequenciaDidaticaPreview: Dados recebidos:', { data, activityData });

  // Tentar recuperar dados reais da IA
  const getSequenciaDidaticaData = () => {
    // 1. Prioridade: dados passados como prop
    if (data && data.sequenciaDidatica) {
      console.log('✅ Usando dados da prop principal');
      return data;
    }

    // 2. Tentar buscar no localStorage por dados construídos
    const activityId = activityData?.id || data?.id;
    if (activityId) {
      const storedData = localStorage.getItem(`constructed_sequencia-didatica_${activityId}`);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          if (parsedData.sequenciaDidatica) {
            console.log('✅ Usando dados construídos do localStorage');
            return parsedData;
          }
        } catch (error) {
          console.warn('⚠️ Erro ao parsear dados do localStorage:', error);
        }
      }
    }

    // 3. Verificar se há dados da IA em diferentes formatos
    if (data && (data.aulas || data.diagnosticos || data.avaliacoes)) {
      console.log('✅ Convertendo dados diretos da IA');
      return {
        sequenciaDidatica: data,
        metadados: data.metadados || {
          totalAulas: data.aulas?.length || 0,
          totalDiagnosticos: data.diagnosticos?.length || 0,
          totalAvaliacoes: data.avaliacoes?.length || 0,
          isGeneratedByAI: true,
          generatedAt: new Date().toISOString()
        }
      };
    }

    // 4. Fallback: dados fictícios apenas se não houver nada
    console.warn('⚠️ Nenhum dado real encontrado, usando dados fictícios');
    return null;
  };

  const sequenciaData = getSequenciaDidaticaData();

  // Se não há dados reais, mostrar mensagem de carregamento
  if (!sequenciaData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-orange-700 dark:text-orange-300 text-center">
          Gerando Sequência Didática com IA...
        </p>
        <p className="text-sm text-orange-600 dark:text-orange-400 text-center mt-2">
          Aguarde enquanto o Gemini cria sua sequência personalizada
        </p>
      </div>
    );
  }

  // Dados fictícios apenas como fallback extremo - REMOVER quando integração estiver completa
  const dadosFicticios = {
    sequenciaDidatica: {
      titulo: "Sequência Didática de Exemplo",
      disciplina: "Matemática",
      anoSerie: "Ensino Fundamental I",
      cargaHoraria: "8 horas",
      descricaoGeral: "Esta é uma sequência didática de exemplo para introduzir conceitos básicos de matemática.",
      aulas: [
        {
          id: "aula-1",
          tipo: "Aula",
          titulo: "Introdução aos Números",
          objetivo: "Apresentar os números de 0 a 10 e suas representações.",
          resumo: "Nesta aula, os alunos aprenderão a contar e reconhecer os números.",
          duracaoEstimada: "1 hora",
          materiaisNecessarios: ["Cartões com números", "Material dourado"],
          metodologia: "Contagem em grupo, atividades com material dourado.",
          avaliacaoFormativa: "Observação da participação e das respostas dos alunos."
        },
        {
          id: "aula-2",
          tipo: "Aula",
          titulo: "Adição Simples",
          objetivo: "Introduzir o conceito de adição com números pequenos.",
          resumo: "Os alunos praticarão a adição usando objetos concretos.",
          duracaoEstimada: "1 hora e 30 minutos",
          materiaisNecessarios: ["Blocos de construção", "Fichas coloridas"],
          metodologia: "Jogos de adição, resolução de problemas simples.",
          avaliacaoFormativa: "Correção dos exercícios em grupo."
        }
      ],
      diagnosticos: [
        {
          id: "diag-1",
          tipo: "Diagnostico",
          titulo: "Avaliação Inicial de Matemática",
          objetivo: "Verificar o conhecimento prévio dos alunos sobre números e operações básicas.",
          resumo: "Um teste rápido para avaliar o nível de aprendizado.",
          instrumentos: ["Questionário online", "Observação direta"],
          momentoAplicacao: "Início da unidade"
        }
      ],
      avaliacoes: [
        {
          id: "aval-1",
          tipo: "Avaliacao",
          titulo: "Avaliação de Adição",
          objetivo: "Avaliar a compreensão dos alunos sobre operações de adição.",
          resumo: "Prova escrita com exercícios de adição.",
          criteriosAvaliacao: ["Correção dos cálculos", "Compreensão dos problemas"],
          instrumentos: ["Prova escrita"],
          valorPontuacao: "10 pontos"
        }
      ]
    },
    metadados: {
      totalAulas: 2,
      totalDiagnosticos: 1,
      totalAvaliacoes: 1,
      competenciasBNCC: "Pensamento computacional, Álgebra, Geometria.",
      objetivosGerais: "Desenvolver o raciocínio lógico-matemático e a capacidade de resolver problemas.",
      generatedAt: "2023-10-27T10:00:00Z",
      isGeneratedByAI: true
    }
  };

  // Usar dados reais da IA
  const sequenciaDidatica = sequenciaData?.sequenciaDidatica || sequenciaData || dadosFicticios;

  // Verificar se temos dados da IA gerados
  const hasGeneratedContent = sequenciaDidatica && (sequenciaDidatica.aulas?.length > 0 || sequenciaDidatica.diagnosticos?.length > 0 || sequenciaDidatica.avaliacoes?.length > 0);

  if (hasGeneratedContent) {
    const metadados = sequenciaData?.metadados || dadosFicticios.metadados;

    // Combinar todos os itens em uma lista ordenada
    const todosItens = [
      ...(sequenciaDidatica.aulas || []),
      ...(sequenciaDidatica.diagnosticos || []),
      ...(sequenciaDidatica.avaliacoes || [])
    ].sort((a, b) => {
      // Ordenar por ID para manter uma ordem consistente
      return a.id.localeCompare(b.id);
    });

    return (
      <div className="space-y-6 p-4">
        {/* Cabeçalho da Sequência */}
        <SequenciaDidaticaHeader 
          sequencia={sequenciaDidatica}
          metadados={metadados}
        />

        {/* Grade de Cards */}
        {todosItens.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Estrutura da Sequência Didática
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todosItens.map((item) => {
                switch (item.tipo) {
                  case 'Aula':
                    return <AulaCard key={item.id} aula={item} />;
                  case 'Diagnostico':
                    return <DiagnosticoCard key={item.id} diagnostico={item} />;
                  case 'Avaliacao':
                    return <AvaliacaoCard key={item.id} avaliacao={item} />;
                  default:
                    return null;
                }
              })}
            </div>
          </div>
        ) : (
          <Alert>
            <BookOpen className="h-4 w-4" />
            <AlertDescription>
              Nenhum conteúdo foi gerado ainda. Clique em "Construir Atividade" para gerar a sequência didática.
            </AlertDescription>
          </Alert>
        )}

        {/* Informações Adicionais */}
        {metadados?.competenciasBNCC && (
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Competências BNCC</h4>
              <p className="text-sm text-gray-600">{metadados.competenciasBNCC}</p>
            </CardContent>
          </Card>
        )}

        {metadados?.objetivosGerais && (
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Objetivos Gerais</h4>
              <p className="text-sm text-gray-600">{metadados.objetivosGerais}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Fallback para exibição dos dados básicos (modo de compatibilidade)
  // Estes dados são do objeto `data` original, que podem ser mais antigos ou não gerados por IA
  return (
    <div className="space-y-6 p-4">
      {/* Cabeçalho básico */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="pt-4">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            {data?.tituloTemaAssunto || sequenciaDidatica?.titulo || 'Sequência Didática'}
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {data?.disciplina && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {data.disciplina}
              </span>
            )}
            {data?.anoSerie && (
              <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                {data.anoSerie}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações básicas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data?.quantidadeAulas && (
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="flex flex-col items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">{data.quantidadeAulas}</span>
                <span className="text-sm text-gray-600">Aulas</span>
              </div>
            </CardContent>
          </Card>
        )}

        {data?.quantidadeDiagnosticos && (
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="flex flex-col items-center gap-2">
                <BarChart3 className="h-6 w-6 text-green-600" />
                <span className="text-2xl font-bold text-green-600">{data.quantidadeDiagnosticos}</span>
                <span className="text-sm text-gray-600">Diagnósticos</span>
              </div>
            </CardContent>
          </Card>
        )}

        {data?.quantidadeAvaliacoes && (
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-6 w-6 text-purple-600" />
                <span className="text-2xl font-bold text-purple-600">{data.quantidadeAvaliacoes}</span>
                <span className="text-sm text-gray-600">Avaliações</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Aviso para construir a atividade */}
      <Alert>
        <Target className="h-4 w-4" />
        <AlertDescription>
          Para visualizar a estrutura detalhada com as aulas, diagnósticos e avaliações, clique em "Construir Atividade" na aba de edição.
        </AlertDescription>
      </Alert>

      {/* Campos de texto se disponíveis */}
      {data?.objetivosAprendizagem && (
        <Card>
          <CardContent className="pt-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Objetivos de Aprendizagem</h4>
            <p className="text-sm text-gray-600">{data.objetivosAprendizagem}</p>
          </CardContent>
        </Card>
      )}

      {data?.publicoAlvo && (
        <Card>
          <CardContent className="pt-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Público-alvo</h4>
            <p className="text-sm text-gray-600">{data.publicoAlvo}</p>
          </CardContent>
        </Card>
      )}

      {data?.cronograma && (
        <Card>
          <CardContent className="pt-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Cronograma</h4>
            <p className="text-sm text-gray-600 whitespace-pre-line">{data.cronograma}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SequenciaDidaticaPreview;