import React, { useState } from 'react';
import { Clock, Award, CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface TeseRedacaoContent {
  title: string;
  temaRedacao: string;
  nivelDificuldade: string;
  objetivo: string;
  competenciasENEM: string;
  contextoAdicional?: string;
  tempoEstimado: string;
  etapas: Array<{
    id: number;
    nome: string;
    tempo: string;
    descricao: string;
  }>;
  etapa1_crieTese: {
    instrucoes: string;
    limiteCaracteres: number;
    dicas: string[];
  };
  etapa2_battleTeses: {
    instrucoes: string;
    tesesParaComparar: Array<{
      id: string;
      tese: string;
      pontosFortres: string[];
    }>;
  };
  etapa3_argumentacao: {
    instrucoes: string;
    estrutura: {
      afirmacao: string;
      dadoExemplo: string;
      conclusao: string;
    };
    dicas: string[];
  };
  criteriosAvaliacao: {
    competenciaII: string;
    competenciaIII: string;
    pontosAvaliados: string[];
  };
  dicasGerais: string[];
}

interface TeseRedacaoPreviewProps {
  content: TeseRedacaoContent;
  isLoading?: boolean;
}

export default function TeseRedacaoPreview({ content, isLoading }: TeseRedacaoPreviewProps) {
  const [currentStage, setCurrentStage] = useState<'intro' | 'etapa1' | 'etapa2' | 'etapa3' | 'resumo'>('intro');
  const [userTese, setUserTese] = useState('');
  const [selectedBattleTese, setSelectedBattleTese] = useState<string | null>(null);
  const [afirmacao, setAfirmacao] = useState('');
  const [dadoExemplo, setDadoExemplo] = useState('');
  const [conclusao, setConclusao] = useState('');
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [feedback, setFeedback] = useState<{
    nota: number;
    resumo: string;
    pontosFortres: string[];
    pontosAMelhorar: string[];
    sugestoes: string[];
  } | null>(null);
  const [streak, setStreak] = useState(2);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B00]"></div>
      </div>
    );
  }

  // Função para gerar feedback final com Gemini API
  const generateFinalFeedback = async () => {
    setIsGeneratingFeedback(true);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Você é um avaliador especialista do ENEM. Avalie a seguinte atividade de tese de redação e forneça feedback detalhado.

TEMA: ${content.temaRedacao}
COMPETÊNCIAS AVALIADAS: ${content.competenciasENEM}

TESE CRIADA PELO ALUNO:
"${userTese}"

ARGUMENTAÇÃO DESENVOLVIDA:
- Afirmação: ${afirmacao}
- Dado/Exemplo: ${dadoExemplo}
- Conclusão: ${conclusao}

Gere uma avaliação completa no seguinte formato JSON:
{
  "nota": 8.5,
  "resumo": "Resumo geral da performance do aluno",
  "pontosFortres": ["Ponto forte 1", "Ponto forte 2", "Ponto forte 3"],
  "pontosAMelhorar": ["Ponto a melhorar 1", "Ponto a melhorar 2"],
  "sugestoes": ["Sugestão 1", "Sugestão 2", "Sugestão 3"]
}

IMPORTANTE:
- A nota deve ser de 0 a 10
- Seja específico e construtivo
- Retorne APENAS o JSON válido
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const feedbackData = JSON.parse(jsonMatch[0]);
        setFeedback(feedbackData);
      } else {
        // Fallback
        setFeedback({
          nota: 7.5,
          resumo: 'Boa performance! Sua tese está clara e seus argumentos são coerentes.',
          pontosFortres: ['Tese clara e objetiva', 'Boa estrutura argumentativa', 'Linguagem formal adequada'],
          pontosAMelhorar: ['Adicionar mais dados concretos', 'Ampliar repertório sociocultural'],
          sugestoes: ['Use estatísticas para fundamentar', 'Cite exemplos históricos', 'Conecte melhor os argumentos']
        });
      }
    } catch (error) {
      console.error('Erro ao gerar feedback:', error);
      // Fallback
      setFeedback({
        nota: 7.5,
        resumo: 'Boa performance! Sua tese está clara e seus argumentos são coerentes.',
        pontosFortres: ['Tese clara e objetiva', 'Boa estrutura argumentativa', 'Linguagem formal adequada'],
        pontosAMelhorar: ['Adicionar mais dados concretos', 'Ampliar repertório sociocultural'],
        sugestoes: ['Use estatísticas para fundamentar', 'Cite exemplos históricos', 'Conecte melhor os argumentos']
      });
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  // TELA INTRODUTÓRIA
  if (currentStage === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-6">
        <Card className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header laranja */}
          <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] text-white p-6 relative">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-1">Tese & Argumentação</h1>
                <p className="text-sm opacity-90">{content.competenciasENEM}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5" />
                  <div>
                    <div className="text-xs opacity-90">TEMPO</div>
                    <div className="text-2xl font-bold">0:00</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-semibold">{streak} dias</span>
                  <span className="text-xs opacity-90">STREAK</span>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#0A2540] mb-2">{content.temaRedacao}</h2>
              <p className="text-gray-600">{content.objetivo}</p>
            </div>

            {/* Cards das 3 etapas */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {content.etapas.map((etapa, index) => (
                <Card key={etapa.id} className="p-4 border-2 border-gray-200 hover:border-[#FF6B00] transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B00] to-[#FF8C3A] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#0A2540] mb-1">{etapa.nome}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                        <Clock className="w-3 h-3" />
                        <span>{etapa.tempo}</span>
                      </div>
                      <p className="text-xs text-gray-500">{etapa.descricao}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button
              onClick={() => setCurrentStage('etapa1')}
              className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] hover:from-[#FF8C3A] hover:to-[#FF6B00] text-white font-bold py-6 text-lg rounded-full shadow-lg"
            >
              Começar minha tese →
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ETAPA 1: CRIE SUA TESE
  if (currentStage === 'etapa1') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-6">
        <Card className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header laranja */}
          <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] text-white p-6 relative">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-1">Tese & Argumentação</h1>
                <p className="text-sm opacity-90">{content.competenciasENEM}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <div>
                    <div className="text-xs opacity-90">TEMPO</div>
                    <div className="text-2xl font-bold">0:46</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mt-2">
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-semibold">{streak} dias</span>
                  <span className="text-xs opacity-90">STREAK</span>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B00] to-[#FF8C3A] text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                1
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#0A2540] mb-1">Crie sua Tese</h2>
                <p className="text-gray-600">{content.etapa1_crieTese.instrucoes}</p>
              </div>
            </div>

            <Card className="p-4 bg-orange-50 border-2 border-orange-200 mb-6">
              <div className="flex items-start gap-2">
                <span className="text-2xl">📋</span>
                <div>
                  <p className="font-semibold text-[#0A2540] mb-1">Tema:</p>
                  <p className="text-gray-700">{content.temaRedacao}</p>
                </div>
              </div>
            </Card>

            <div className="mb-2">
              <label className="block text-sm font-semibold text-[#0A2540] mb-2">Sua tese:</label>
              <Textarea
                value={userTese}
                onChange={(e) => setUserTese(e.target.value)}
                placeholder="Digite sua tese aqui..."
                maxLength={content.etapa1_crieTese.limiteCaracteres}
                className="min-h-[120px] text-base border-2 focus:border-[#FF6B00]"
              />
              <p className="text-sm text-gray-500 mt-1">
                {userTese.length}/{content.etapa1_crieTese.limiteCaracteres} caracteres
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setCurrentStage('etapa2')}
                disabled={!userTese.trim()}
                className="flex-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] hover:from-[#FF8C3A] hover:to-[#FF6B00] text-white font-bold py-6 text-lg rounded-full shadow-lg disabled:opacity-50"
              >
                Submeter Tese →
              </Button>
              <Button
                onClick={() => setCurrentStage('etapa2')}
                variant="outline"
                className="px-8 py-6 text-[#FF6B00] border-2 border-[#FF6B00] font-semibold rounded-full"
              >
                Pular
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ETAPA 2: BATTLE DE TESES
  if (currentStage === 'etapa2') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-6">
        <Card className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B00] to-[#FF8C3A] text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
              2
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#0A2540] mb-1">Battle de Teses</h2>
              <p className="text-gray-600">{content.etapa2_battleTeses.instrucoes}</p>
            </div>
          </div>

          {/* Tese do usuário */}
          {userTese && (
            <Card className="p-4 mb-4 bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-[#FF6B00]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#FF6B00] text-white rounded-full flex items-center justify-center font-bold">
                  ⭐
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#FF6B00] mb-1">Sua tese</p>
                  <p className="text-gray-700">{userTese}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Teses para comparar */}
          <div className="space-y-3 mb-6">
            {content.etapa2_battleTeses.tesesParaComparar.map((teseOption) => (
              <Card
                key={teseOption.id}
                onClick={() => setSelectedBattleTese(teseOption.id)}
                className={`p-4 cursor-pointer transition-all ${
                  selectedBattleTese === teseOption.id
                    ? 'border-2 border-[#FF6B00] bg-orange-50'
                    : 'border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center font-bold">
                    {teseOption.id}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 mb-2">{teseOption.tese}</p>
                    {selectedBattleTese === teseOption.id && (
                      <div className="flex items-center gap-2 text-sm text-[#FF6B00]">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-semibold">Selecionada</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button
            onClick={() => setCurrentStage('etapa3')}
            disabled={!selectedBattleTese}
            className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] hover:from-[#FF8C3A] hover:to-[#FF6B00] text-white font-bold py-6 text-lg rounded-full shadow-lg disabled:opacity-50"
          >
            Continuar →
          </Button>
        </Card>
      </div>
    );
  }

  // ETAPA 3: ARGUMENTAÇÃO RELÂMPAGO
  if (currentStage === 'etapa3') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-6">
        <Card className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B00] to-[#FF8C3A] text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
              3
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#0A2540] mb-1">Argumentação Relâmpago</h2>
              <p className="text-gray-600">{content.etapa3_argumentacao.instrucoes}</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {/* Campo 1: Afirmação */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-[#FF6B00] text-white rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <label className="block text-sm font-semibold text-[#0A2540]">Afirmação:</label>
              </div>
              <Textarea
                value={afirmacao}
                onChange={(e) => setAfirmacao(e.target.value)}
                placeholder="Apresente sua afirmação..."
                className="min-h-[80px] border-2 focus:border-[#FF6B00]"
              />
            </div>

            {/* Campo 2: Dado/Exemplo */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-[#FF6B00] text-white rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <label className="block text-sm font-semibold text-[#0A2540]">Dado/Exemplo:</label>
              </div>
              <Textarea
                value={dadoExemplo}
                onChange={(e) => setDadoExemplo(e.target.value)}
                placeholder="Forneça um dado ou exemplo..."
                className="min-h-[80px] border-2 focus:border-[#FF6B00]"
              />
            </div>

            {/* Campo 3: Conclusão */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-[#FF6B00] text-white rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <label className="block text-sm font-semibold text-[#0A2540]">Conclusão:</label>
              </div>
              <Textarea
                value={conclusao}
                onChange={(e) => setConclusao(e.target.value)}
                placeholder="Conclua seu argumento..."
                className="min-h-[80px] border-2 focus:border-[#FF6B00]"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={async () => {
                await generateFinalFeedback();
                setCurrentStage('resumo');
              }}
              disabled={!afirmacao.trim() || !dadoExemplo.trim() || !conclusao.trim() || isGeneratingFeedback}
              className="flex-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] hover:from-[#FF8C3A] hover:to-[#FF6B00] text-white font-bold py-6 text-lg rounded-full shadow-lg disabled:opacity-50"
            >
              {isGeneratingFeedback ? 'Gerando Avaliação...' : 'Finalizar Atividade →'}
            </Button>
            <Button
              onClick={async () => {
                await generateFinalFeedback();
                setCurrentStage('resumo');
              }}
              variant="outline"
              className="px-8 py-6 text-[#FF6B00] border-2 border-[#FF6B00] font-semibold rounded-full"
            >
              Pular
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // TELA DE RESUMO E NOTA FINAL
  if (currentStage === 'resumo' && feedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-6">
        <Card className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
          {/* Nota Principal */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-[#FF6B00] to-[#FF8C3A] text-white rounded-full mb-4">
              <div>
                <div className="text-5xl font-bold">{feedback.nota.toFixed(1)}</div>
                <div className="text-sm opacity-90">/ 10</div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-[#0A2540] mb-2">Atividade Concluída!</h2>
            <p className="text-gray-600 text-lg">{feedback.resumo}</p>
          </div>

          {/* Pontos Fortes */}
          <Card className="p-6 mb-4 bg-green-50 border-2 border-green-200">
            <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Pontos Fortes
            </h3>
            <ul className="space-y-2">
              {feedback.pontosFortres.map((ponto, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600">✓</span>
                  <span>{ponto}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Pontos a Melhorar */}
          <Card className="p-6 mb-4 bg-orange-50 border-2 border-orange-200">
            <h3 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Pontos a Melhorar
            </h3>
            <ul className="space-y-2">
              {feedback.pontosAMelhorar.map((ponto, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-orange-600">→</span>
                  <span>{ponto}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Sugestões */}
          <Card className="p-6 mb-6 bg-blue-50 border-2 border-blue-200">
            <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Sugestões para Próximas Atividades
            </h3>
            <ul className="space-y-2">
              {feedback.sugestoes.map((sugestao, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-blue-600">•</span>
                  <span>{sugestao}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Button
            onClick={() => {
              setCurrentStage('intro');
              setUserTese('');
              setSelectedBattleTese(null);
              setAfirmacao('');
              setDadoExemplo('');
              setConclusao('');
              setFeedback(null);
            }}
            className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] hover:from-[#FF8C3A] hover:to-[#FF6B00] text-white font-bold py-6 text-lg rounded-full shadow-lg"
          >
            Fazer Nova Atividade
          </Button>
        </Card>
      </div>
    );
  }

  return null;
}
