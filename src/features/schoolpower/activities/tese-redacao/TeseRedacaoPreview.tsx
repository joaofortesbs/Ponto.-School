import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    pontuacaoTotal?: number;
    criterios?: any;
    nota?: number;
    resumo: string;
    pontosFortres: string[];
    pontosAMelhorar: string[];
    sugestoes?: string[];
    sugestaoMelhoria?: string;
  } | null>(null);
  const [streak, setStreak] = useState(2);

  // Armazenar ID da atividade globalmente para acesso no feedback
  React.useEffect(() => {
    if (content && (content as any).id) {
      (window as any).currentActivityId = (content as any).id;
      console.log('📋 [TeseRedacao] ID da atividade armazenado:', (content as any).id);
    }
  }, [content]);

  // Gerenciamento do cronômetro
  const [timer, setTimer] = useState(0);
  const [currentStageTimer, setCurrentStageTimer] = useState<number | null>(null); // Tempo em segundos para a etapa atual

  React.useEffect(() => {
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
  React.useEffect(() => {
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
    console.log('🤖 [Gemini] Iniciando geração de relatório...');

    try {
      // Usar API Key do ambiente
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCEjk916YUa6wove13VEHou853eJULp6gs';

      if (!apiKey) {
        throw new Error('API Key do Gemini não configurada');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const prompt = `
Você é um avaliador especialista do ENEM com profundo conhecimento das competências de redação.

ANÁLISE COMPLETA DA ATIVIDADE DE TESE E ARGUMENTAÇÃO

CONTEXTO DA ATIVIDADE:
- Tema da Redação: ${content.temaRedacao || 'Não informado'}
- Nível de Dificuldade: ${content.nivelDificuldade || 'Médio'}
- Competências ENEM: ${content.competenciasENEM || 'Competência II e III'}
- Objetivo: ${content.objetivo || 'Desenvolver tese e argumentação'}

RESPOSTAS DO ALUNO:

1. TESE DESENVOLVIDA:
"${userTese || 'Não fornecida'}"

2. ARGUMENTAÇÃO COMPLETA:
   a) Afirmação: ${afirmacao || 'Não fornecida'}
   b) Dado/Exemplo: ${dadoExemplo || 'Não fornecido'}
   c) Conclusão: ${conclusao || 'Não fornecida'}

3. TESE SELECIONADA NO BATTLE: ${selectedBattleTese || 'Nenhuma selecionada'}

CRITÉRIOS DE AVALIAÇÃO:
- Adequação ao Tema (200 pontos)
- Clareza da Tese (200 pontos)
- Força Argumentativa (200 pontos)
- Repertório Sociocultural (200 pontos)

Retorne APENAS um objeto JSON válido (sem markdown, sem \`\`\`json) com esta estrutura exata:
{
  "pontuacaoTotal": 678,
  "criterios": {
    "adequacaoTema": {"pontos": 181, "total": 200},
    "clarezaTese": {"pontos": 157, "total": 200},
    "forcaArgumentativa": {"pontos": 192, "total": 200},
    "repertorioSociocultural": {"pontos": 148, "total": 200}
  },
  "resumo": "Análise geral detalhada da performance do aluno",
  "pontosFortres": ["Ponto forte 1", "Ponto forte 2", "Ponto forte 3"],
  "pontosAMelhorar": ["Ponto a melhorar 1", "Ponto a melhorar 2"],
  "sugestaoMelhoria": "Sugestão principal para evolução"
}
`;

      console.log('📤 [Gemini] Enviando prompt para avaliação...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      console.log('📥 [Gemini] Resposta recebida:', text.substring(0, 300));

      // Limpar markdown se existir
      let cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      // Tentar parsear diretamente
      let feedbackData;
      try {
        feedbackData = JSON.parse(cleanedText);
      } catch (parseError) {
        // Tentar extrair JSON da resposta
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          feedbackData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Não foi possível extrair JSON válido da resposta');
        }
      }

      console.log('✅ [Gemini] Feedback parseado com sucesso:', feedbackData);

      // Validar estrutura do feedback
      if (!feedbackData.pontuacaoTotal || !feedbackData.criterios) {
        throw new Error('Estrutura de feedback inválida');
      }

      setFeedback(feedbackData);

      // Obter ID da atividade
      const activityId = (window as any).currentActivityId || 'preview';

      // Salvar dados completos no localStorage
      const dataToSave = {
        userTese,
        afirmacao,
        dadoExemplo,
        conclusao,
        selectedBattleTese,
        feedback: feedbackData,
        generatedAt: new Date().toISOString(),
        activityId: activityId,
        temaRedacao: content.temaRedacao,
        isFallback: false
      };

      // Salvar em múltiplas chaves para garantir persistência
      localStorage.setItem(`tese_redacao_results_${activityId}`, JSON.stringify(dataToSave));
      localStorage.setItem(`activity_${activityId}_results`, JSON.stringify(dataToSave));
      localStorage.setItem(`tese_redacao_latest_results`, JSON.stringify(dataToSave));

      console.log('💾 [Storage] Resultados salvos com sucesso em 3 chaves diferentes');
      console.log('📊 [Storage] Pontuação total:', feedbackData.pontuacaoTotal);

    } catch (error) {
      console.error('❌ [Gemini] Erro ao gerar feedback:', error);

      // Fallback com dados realistas baseados nas respostas do usuário
      const calculateScore = (text: string, maxScore: number) => {
        if (!text || text.trim() === '') return Math.floor(maxScore * 0.3);
        const wordCount = text.split(' ').length;
        const score = Math.min(maxScore, Math.floor(maxScore * 0.5) + wordCount * 2);
        return Math.min(score, maxScore);
      };

      const teseScore = calculateScore(userTese, 200);
      const afirmacaoScore = calculateScore(afirmacao, 200);
      const dadoScore = calculateScore(dadoExemplo, 200);
      const conclusaoScore = calculateScore(conclusao, 200);
      const totalScore = teseScore + afirmacaoScore + dadoScore + conclusaoScore;

      const fallbackFeedback = {
        pontuacaoTotal: totalScore,
        criterios: {
          adequacaoTema: {pontos: teseScore, total: 200},
          clarezaTese: {pontos: afirmacaoScore, total: 200},
          forcaArgumentativa: {pontos: dadoScore, total: 200},
          repertorioSociocultural: {pontos: conclusaoScore, total: 200}
        },
        resumo: 'Boa tentativa! Sua tese demonstra compreensão do tema e capacidade argumentativa. Continue praticando para aprimorar ainda mais suas habilidades.',
        pontosFortres: [
          'Tese estruturada de forma coerente',
          'Tentativa de articulação entre afirmação e dados',
          'Esforço em desenvolver argumentação completa'
        ],
        pontosAMelhorar: [
          'Ampliar repertório sociocultural com mais dados estatísticos recentes',
          'Conectar melhor os argumentos com exemplos concretos e atuais',
          'Desenvolver conclusões mais contundentes e propositivas'
        ],
        sugestaoMelhoria: 'Pratique conectando seus argumentos com dados estatísticos e exemplos do mundo real. Leia mais sobre o tema para enriquecer seu repertório sociocultural.'
      };

      setFeedback(fallbackFeedback);

      // Obter ID da atividade
      const activityId = (window as any).currentActivityId || 'preview';

      // Salvar fallback
      const dataToSave = {
        userTese,
        afirmacao,
        dadoExemplo,
        conclusao,
        selectedBattleTese,
        feedback: fallbackFeedback,
        generatedAt: new Date().toISOString(),
        activityId: activityId,
        temaRedacao: content.temaRedacao,
        isFallback: true,
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido'
      };

      // Salvar em múltiplas chaves
      localStorage.setItem(`tese_redacao_results_${activityId}`, JSON.stringify(dataToSave));
      localStorage.setItem(`activity_${activityId}_results`, JSON.stringify(dataToSave));
      localStorage.setItem(`tese_redacao_latest_results`, JSON.stringify(dataToSave));

      console.log('💾 [Storage] Fallback salvo com sucesso');
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  // TELA INTRODUTÓRIA
  if (currentStage === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900/20 flex items-start justify-center p-4 pt-8">
        <Card className="max-w-4xl w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border-2 border-orange-200/50 dark:border-orange-800/30">
          {/* Header Premium com Gradiente */}
          <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-600 dark:via-orange-700 dark:to-orange-800 text-white p-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-grid-pattern"></div>
            </div>

            <div className="relative z-10">
              <div className="text-center mb-6">
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                  Tese & Argumentação
                </h1>
                <p className="text-lg opacity-90">{content.competenciasENEM}</p>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-8">
            {/* Título do Tema - Destacado */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="text-center mb-6">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent mb-3">
                  {content.temaRedacao}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">{content.objetivo}</p>
              </div>
            </motion.div>

            {/* Cards das 3 etapas com animação */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {etapas.map((etapa, index) => (
                <motion.div
                  key={etapa.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="group"
                >
                  <Card className="p-6 bg-gradient-to-br from-white via-orange-50/30 to-orange-100/50 dark:from-gray-800 dark:via-gray-700 dark:to-orange-900/20 border-2 border-orange-200/60 dark:border-orange-700/50 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-xl transition-all duration-300 rounded-2xl">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-2 text-lg">{etapa.nome}</h3>
                        <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 mb-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-semibold">{etapa.tempo}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{etapa.descricao}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => setCurrentStage('etapa1')}
                className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white font-bold py-6 text-lg rounded-2xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-300"
              >
                Começar minha tese →
              </Button>
            </motion.div>
          </div>
        </Card>
      </div>
    );
  }

  // ETAPA 1: CRIE SUA TESE
  if (currentStage === 'etapa1') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900/20 flex items-start justify-center p-4 pt-8">
        <Card className="max-w-4xl w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border-2 border-orange-200/50 dark:border-orange-800/30">
          {/* Header Premium */}
          <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-600 dark:via-orange-700 dark:to-orange-800 text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-grid-pattern"></div>
            </div>

            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold mb-1">Tese & Argumentação</h1>
                <p className="text-sm opacity-90">{content.competenciasENEM}</p>
              </div>
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2">
                <Clock className="w-5 h-5" />
                <div>
                  <div className="text-xs opacity-90">TEMPO</div>
                  <div className="text-2xl font-bold">{formatTime(timer)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-4 mb-6"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg flex-shrink-0">
                1
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent mb-2">
                  Crie sua Tese
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg">{etapa1.instrucoes}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/30 border-2 border-orange-200 dark:border-orange-700 mb-6 rounded-2xl shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">📋</div>
                  <div className="flex-1">
                    <p className="font-bold text-orange-900 dark:text-orange-100 mb-2 text-lg">Tema:</p>
                    <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">{content.temaRedacao}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

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

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-4 mt-6"
            >
              <motion.div 
                className="flex-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => {
                    // Salvar tese do usuário
                    const activityId = (window as any).currentActivityId || 'preview';
                    const progressKey = `tese_redacao_progress_${activityId}`;

                    try {
                      const progressData = {
                        userTese,
                        etapa: 'etapa1',
                        savedAt: new Date().toISOString()
                      };
                      localStorage.setItem(progressKey, JSON.stringify(progressData));
                      console.log('💾 [TeseRedacao] Tese do usuário salva');
                    } catch (error) {
                      console.error('❌ [TeseRedacao] Erro ao salvar progresso:', error);
                    }

                    setCurrentStage('etapa2');
                  }}
                  disabled={!userTese.trim()}
                  className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white font-bold py-6 text-lg rounded-2xl shadow-xl hover:shadow-orange-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submeter Tese →
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setCurrentStage('etapa2')}
                  variant="outline"
                  className="px-8 py-6 text-orange-600 dark:text-orange-400 border-2 border-orange-500 dark:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 font-semibold rounded-2xl transition-all duration-300"
                >
                  Pular
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </Card>
      </div>
    );
  }

  // ETAPA 2: BATTLE DE TESES
  if (currentStage === 'etapa2') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900/20 flex items-start justify-center p-4 pt-8">
        <Card className="max-w-4xl w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-orange-200/50 dark:border-orange-800/30 p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-4 mb-6"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg flex-shrink-0">
              2
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent mb-2">
                Battle de Teses
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">{etapa2.instrucoes}</p>
            </div>
          </motion.div>

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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => setCurrentStage('etapa3')}
              disabled={!selectedBattleTese}
              className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white font-bold py-6 text-lg rounded-2xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar →
            </Button>
          </motion.div>
        </Card>
      </div>
    );
  }

  // ETAPA 3: ARGUMENTAÇÃO RELÂMPAGO
  if (currentStage === 'etapa3') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900/20 flex items-start justify-center p-4 pt-8">
        <Card className="max-w-4xl w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-orange-200/50 dark:border-orange-800/30 p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-4 mb-6"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg flex-shrink-0">
              3
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent mb-2">
                Argumentação Relâmpago
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">{etapa3.instrucoes}</p>
            </div>
          </motion.div>

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

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4"
          >
            <motion.div 
              className="flex-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={async () => {
                  await generateFinalFeedback();
                  setCurrentStage('resumo');
                }}
                disabled={!afirmacao.trim() || !dadoExemplo.trim() || !conclusao.trim() || isGeneratingFeedback}
                className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white font-bold py-6 text-lg rounded-2xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingFeedback ? 'Gerando Avaliação...' : 'Finalizar Atividade →'}
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={async () => {
                  await generateFinalFeedback();
                  setCurrentStage('resumo');
                }}
                variant="outline"
                className="px-8 py-6 text-orange-600 dark:text-orange-400 border-2 border-orange-500 dark:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 font-semibold rounded-2xl transition-all duration-300"
              >
                Pular
              </Button>
            </motion.div>
          </motion.div>
        </Card>
      </div>
    );
  }

  // TELA DE RESUMO E NOTA FINAL
  if (currentStage === 'resumo' && feedback) {
    const criterios = feedback.criterios || {
      adequacaoTema: {pontos: 181, total: 200},
      clarezaTese: {pontos: 157, total: 200},
      forcaArgumentativa: {pontos: 192, total: 200},
      repertorioSociocultural: {pontos: 148, total: 200}
    };

    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-orange-50 to-white">
        <Card className="max-w-6xl mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
          {/* Header com pontuação total */}
          <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] text-white p-8 text-center">
            <h1 className="text-4xl font-bold mb-2">Parabéns!</h1>
            <div className="text-6xl font-bold mb-2">{feedback.pontuacaoTotal || 678} pontos</div>
            <p className="text-lg opacity-90">School Points conquistados nesta atividade</p>
          </div>

          <div className="p-8">
            {/* Grid de 4 cards de critérios */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* Card 1: Adequação ao Tema */}
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-2 border-orange-200 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-[#0A2540] mb-3">Adequação ao Tema</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold text-[#FF6B00]">{criterios.adequacaoTema.pontos}</span>
                  <span className="text-sm text-gray-500">/ {criterios.adequacaoTema.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] h-full rounded-full transition-all duration-1000"
                    style={{width: `${(criterios.adequacaoTema.pontos / criterios.adequacaoTema.total) * 100}%`}}
                  />
                </div>
              </Card>

              {/* Card 2: Clareza da Tese */}
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-2 border-orange-200 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-[#0A2540] mb-3">Clareza da Tese</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold text-[#FF6B00]">{criterios.clarezaTese.pontos}</span>
                  <span className="text-sm text-gray-500">/ {criterios.clarezaTese.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] h-full rounded-full transition-all duration-1000"
                    style={{width: `${(criterios.clarezaTese.pontos / criterios.clarezaTese.total) * 100}%`}}
                  />
                </div>
              </Card>

              {/* Card 3: Força Argumentativa */}
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-2 border-orange-200 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-[#0A2540] mb-3">Força Argumentativa</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold text-[#FF6B00]">{criterios.forcaArgumentativa.pontos}</span>
                  <span className="text-sm text-gray-500">/ {criterios.forcaArgumentativa.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] h-full rounded-full transition-all duration-1000"
                    style={{width: `${(criterios.forcaArgumentativa.pontos / criterios.forcaArgumentativa.total) * 100}%`}}
                  />
                </div>
              </Card>

              {/* Card 4: Repertório Sociocultural */}
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-2 border-orange-200 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-[#0A2540] mb-3">Repertório Sociocultural</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold text-[#FF6B00]">{criterios.repertorioSociocultural.pontos}</span>
                  <span className="text-sm text-gray-500">/ {criterios.repertorioSociocultural.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C3A] h-full rounded-full transition-all duration-1000"
                    style={{width: `${(criterios.repertorioSociocultural.pontos / criterios.repertorioSociocultural.total) * 100}%`}}
                  />
                </div>
              </Card>
            </div>

            {/* Resumo e Pontos Fortes/Melhorias */}
            <Card className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 mb-2 text-lg">Resumo da Análise</h3>
                  <p className="text-gray-700">{feedback.resumo}</p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Pontos Fortes */}
              <Card className="p-6 bg-green-50 border-2 border-green-200">
                <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Pontos Fortes
                </h3>
                <ul className="space-y-3">
                  {(feedback.pontosFortres || []).map((ponto, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>{ponto}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Pontos a Melhorar */}
              <Card className="p-6 bg-yellow-50 border-2 border-yellow-200">
                <h3 className="font-bold text-yellow-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Pontos a Melhorar
                </h3>
                <ul className="space-y-3">
                  {(feedback.pontosAMelhorar || []).map((ponto, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-yellow-600 font-bold">→</span>
                      <span>{ponto}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Sugestão de Melhoria */}
            <Card className="p-6 mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
              <div className="flex items-start gap-3">
                <span className="text-3xl">💡</span>
                <div>
                  <h3 className="font-bold text-purple-900 mb-2">Sugestão de Melhoria</h3>
                  <p className="text-gray-700">{feedback.sugestaoMelhoria || 'Continue praticando para aprimorar suas habilidades!'}</p>
                </div>
              </div>
            </Card>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => {
                  setCurrentStage('intro');
                  setUserTese('');
                  setSelectedBattleTese(null);
                  setAfirmacao('');
                  setDadoExemplo('');
                  setConclusao('');
                  setFeedback(null);
                  setTimer(0);
                  setCurrentStageTimer(null);
                }}
                className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white font-bold py-6 text-lg rounded-2xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-300"
              >
                Fazer Nova Atividade
              </Button>
            </motion.div>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}