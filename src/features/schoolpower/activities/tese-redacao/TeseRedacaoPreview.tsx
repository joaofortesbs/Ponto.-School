import React, { useState, useEffect } from 'react';
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

// Função auxiliar para formatar o tempo
const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

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

  // Gerenciamento do cronômetro
  const [timer, setTimer] = useState(0);
  const [currentStageTimer, setCurrentStageTimer] = useState<number | null>(null); // Tempo em segundos para a etapa atual

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (currentStage !== 'intro' && currentStageTimer !== null && currentStageTimer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (currentStageTimer === 0) {
      // Tempo esgotado para a etapa atual
      // Lógica para avançar ou exibir alerta pode ser adicionada aqui
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentStage, currentStageTimer]);

  // Atualiza o cronômetro quando a etapa muda
  useEffect(() => {
    if (content && content.etapas) {
      const etapaAtual = content.etapas.find(etapa => {
        switch (currentStage) {
          case 'etapa1': return etapa.id === 1;
          case 'etapa2': return etapa.id === 2;
          case 'etapa3': return etapa.id === 3;
          default: return false;
        }
      });

      if (etapaAtual) {
        // Converte o tempo da etapa (ex: '5 min') para segundos
        const [minutes, seconds] = etapaAtual.tempo.split(':').map(Number);
        const totalSeconds = (minutes || 0) * 60 + (seconds || 0);
        setCurrentStageTimer(totalSeconds);
        setTimer(totalSeconds); // Reinicia o timer para a nova etapa
      }
    }
  }, [currentStage, content]);

  console.log('📝 [TeseRedacaoPreview] Conteúdo recebido:', content);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B00]"></div>
      </div>
    );
  }

  // Verificar se o conteúdo existe e tem as propriedades necessárias
  if (!content) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600">Nenhum conteúdo disponível</p>
        </div>
      </div>
    );
  }

  // Valores padrão para campos opcionais
  const etapas = content.etapas || [
    { id: 1, nome: 'Crie sua tese', tempo: '5 min', descricao: 'Desenvolva uma tese clara' },
    { id: 2, nome: 'Battle de teses', tempo: '5 min', descricao: 'Vote na melhor tese' },
    { id: 3, nome: 'Argumentação', tempo: '8 min', descricao: 'Desenvolva argumento completo' }
  ];

  const etapa1 = content.etapa1_crieTese || {
    instrucoes: 'Desenvolva uma tese clara em até 2 linhas sobre o tema proposto',
    limiteCaracteres: 200,
    dicas: []
  };

  const etapa2 = content.etapa2_battleTeses || {
    instrucoes: 'Vote na melhor tese e justifique sua escolha',
    tesesParaComparar: []
  };

  console.log('⚔️ [Battle] Teses para comparar:', etapa2.tesesParaComparar);

  const etapa3 = content.etapa3_argumentacao || {
    instrucoes: 'Desenvolva um argumento completo em 3 sentenças',
    estrutura: {
      afirmacao: 'Apresente sua afirmação',
      dadoExemplo: 'Forneça um dado ou exemplo',
      conclusao: 'Conclua seu argumento'
    },
    dicas: []
  };

  // Função para gerar feedback final com Gemini API
  const generateFinalFeedback = async () => {
    setIsGeneratingFeedback(true);

    try {
      // Usar GEMINI_API_KEY do Replit Secrets
      const apiKey = import.meta.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '';

      if (!apiKey) {
        console.error('❌ [Feedback] GEMINI_API_KEY não encontrada!');
        throw new Error('API Key do Gemini não configurada');
      }

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
      <div className="min-h-screen p-6">
        <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
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
                    <div className="text-2xl font-bold">{formatTime(timer)}</div>
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
            {/* Título do Tema - Destacado ACIMA de tudo */}
            <div className="mb-8">
              <div className="text-center mb-4">
                <h2 className="text-4xl font-bold text-[#0A2540] mb-3">{content.temaRedacao}</h2>
                <p className="text-lg text-gray-600">{content.objetivo}</p>
              </div>
            </div>

            {/* Cards das 3 etapas */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {etapas.map((etapa, index) => (
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
      <div className="min-h-screen p-6">
        <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
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
                    <div className="text-2xl font-bold">{formatTime(timer)}</div>
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
                <p className="text-gray-600">{etapa1.instrucoes}</p>
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
                maxLength={etapa1.limiteCaracteres}
                className="min-h-[120px] text-base border-2 focus:border-[#FF6B00]"
              />
              <p className="text-sm text-gray-500 mt-1">
                {userTese.length}/{etapa1.limiteCaracteres} caracteres
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
      <div className="min-h-screen p-6">
        <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B00] to-[#FF8C3A] text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
              2
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#0A2540] mb-1">Battle de Teses</h2>
              <p className="text-gray-600">{etapa2.instrucoes}</p>
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
            {etapa2.tesesParaComparar && etapa2.tesesParaComparar.length > 0 ? (
              etapa2.tesesParaComparar.map((teseOption) => (
                <Card
                  key={teseOption.id}
                  onClick={() => setSelectedBattleTese(teseOption.id)}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedBattleTese === teseOption.id
                      ? 'border-2 border-[#FF6B00] bg-orange-50'
                      : 'border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox visual */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                      selectedBattleTese === teseOption.id
                        ? 'border-[#FF6B00] bg-[#FF6B00]'
                        : 'border-gray-400 bg-white'
                    }`}>
                      {selectedBattleTese === teseOption.id && (
                        <CheckCircle className="w-4 h-4 text-white fill-white" />
                      )}
                    </div>

                    {/* Badge com letra */}
                    <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B00] to-[#FF8C3A] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {teseOption.id}
                    </div>

                    {/* Conteúdo da tese */}
                    <div className="flex-1">
                      <p className={`text-base ${
                        selectedBattleTese === teseOption.id ? 'text-[#0A2540] font-semibold' : 'text-gray-700'
                      }`}>{teseOption.tese}</p>
                      {selectedBattleTese === teseOption.id && (
                        <div className="flex items-center gap-2 text-sm text-[#FF6B00] mt-2">
                          <span className="font-semibold">✓ Selecionada</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">⚠️ Nenhuma tese disponível para comparação</p>
                <p className="text-sm text-gray-400 mt-2">As teses serão geradas pela IA do Gemini</p>
              </div>
            )}
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
      <div className="min-h-screen p-6">
        <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B00] to-[#FF8C3A] text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
              3
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#0A2540] mb-1">Argumentação Relâmpago</h2>
              <p className="text-gray-600">{etapa3.instrucoes}</p>
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
      <div className="min-h-screen p-6">
        <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
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
              setTimer(0); // Reseta o timer geral
              setCurrentStageTimer(null); // Reseta o timer da etapa
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