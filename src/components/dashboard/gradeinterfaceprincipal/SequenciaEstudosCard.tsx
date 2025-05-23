import React, { useState, useEffect, useRef } from "react";
import { Flame, Award, TrendingUp, ExternalLink, Star, Zap, Trophy, Clock, CheckCircle, CheckSquare, CheckIcon, XIcon, Gift, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Progress } from "@/components/ui/progress";

// Interface para o tipo de evento de streak
interface StreakEvent {
  type: 'login' | 'study' | 'task' | 'challenge';
  date: string;
  duration?: number;
}

interface StreakData {
  diasConsecutivos: number;
  recordeDias: number;
  diasParaProximoNivel: number;
  metaDiaria: number;
  proximaRecompensa: string;
  ultimoCheckIn: string | null;
  eventos: StreakEvent[];
}

export default function SequenciaEstudosCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";

  // Estados para guardar os dados do usuário
  const [diasConsecutivos, setDiasConsecutivos] = useState<number>(0);
  const [recordeDias, setRecordeDias] = useState<number>(0);
  const [diasParaProximoNivel, setDiasParaProximoNivel] = useState<number>(3);
  const [metaDiaria, setMetaDiaria] = useState<number>(5);
  const [proximaRecompensa, setProximaRecompensa] = useState<string>("Badge Iniciante");
  const [streakEvents, setStreakEvents] = useState<StreakEvent[]>([]);
  const [ultimoCheckIn, setUltimoCheckIn] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Estado para o cronômetro
  const [tempoRestante, setTempoRestante] = useState<{
    horas: number;
    minutos: number;
    segundos: number;
  }>({ horas: 0, minutos: 0, segundos: 0 });

  // Estado para controlar se o usuário já fez check-in hoje
  const [checkInHoje, setCheckInHoje] = useState<boolean>(false);

  // Estado para animação do check-in
  const [showCheckInAnimation, setShowCheckInAnimation] = useState<boolean>(false);

  // Referência para o timer do cronômetro
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Função para carregar o userId
  const carregarUserId = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
        return session.user.id;
      }
      return null;
    } catch (error) {
      console.error("Erro ao obter ID do usuário:", error);
      return null;
    }
  };

  // Função para carregar dados da sequência de estudos do usuário
  const carregarDadosStreakUsuario = async (id: string) => {
    try {
      // Primeiro tenta buscar do Supabase
      const { data, error } = await supabase
        .from('user_streak')
        .select('*')
        .eq('user_id', id)
        .single();

      if (error) {
        console.log("Dados não encontrados na API:", error);

        if (error.code === '42P01') {
          console.log("Tabela user_streak não existe, criando...");
          // Caso a tabela não exista, carrega dados locais e salva no Supabase quando a tabela for criada
          const dadosLocais = carregarDadosLocaisSync();
          if (dadosLocais) {
            // Tenta novamente após um pequeno delay para permitir que a migração seja aplicada
            setTimeout(async () => {
              try {
                await salvarDadosSequencia(dadosLocais);
                console.log("Dados locais migrados para o Supabase com sucesso");
              } catch (migrationError) {
                console.error("Erro ao migrar dados locais para Supabase:", migrationError);
              }
            }, 5000);
          }
          return;
        }

        // Se não conseguir, tenta carregar do localStorage
        const dadosLocais = carregarDadosLocaisSync();
        if (dadosLocais) {
          atualizarEstadosComDados(dadosLocais);
          verificarCheckInDeHoje(dadosLocais.ultimoCheckIn);

          // Tenta salvar dados locais no Supabase para sincronizar
          try {
            await salvarDadosSequencia(dadosLocais);
            console.log("Dados locais sincronizados com o Supabase");
          } catch (syncError) {
            console.error("Erro ao sincronizar dados locais com Supabase:", syncError);
          }
        }
        return;
      }

      if (data) {
        const streakData: StreakData = {
          diasConsecutivos: data.dias_consecutivos || 0,
          recordeDias: data.recorde_dias || 0,
          diasParaProximoNivel: data.dias_para_proximo_nivel || 3,
          metaDiaria: data.meta_diaria || 5,
          proximaRecompensa: data.proxima_recompensa || "Badge Iniciante",
          ultimoCheckIn: data.ultimo_check_in,
          eventos: data.eventos || []
        };

        // Salvar dados no localStorage para acesso offline
        localStorage.setItem('streakData', JSON.stringify(streakData));

        atualizarEstadosComDados(streakData);

        // Verifica se já fez check-in hoje
        verificarCheckInDeHoje(data.ultimo_check_in);
      }
    } catch (error) {
      console.error("Erro ao carregar dados da sequência:", error);
      // Fallback para dados locais
      const dadosLocais = carregarDadosLocaisSync();
      if (dadosLocais) {
        atualizarEstadosComDados(dadosLocais);
        verificarCheckInDeHoje(dadosLocais.ultimoCheckIn);
      }
    }
  };

  // Função para carregar dados locais (versão síncrona que retorna os dados)
  const carregarDadosLocaisSync = (): StreakData | null => {
    try {
      const dadosSalvos = localStorage.getItem('streakData');

      if (dadosSalvos) {
        const dados = JSON.parse(dadosSalvos);
        return dados;
      } else {
        // Inicializa os dados se não existirem
        const dadosIniciais: StreakData = {
          diasConsecutivos: 0,
          recordeDias: 0,
          diasParaProximoNivel: 3,
          metaDiaria: 5,
          proximaRecompensa: "Badge Iniciante",
          ultimoCheckIn: null,
          eventos: []
        };

        // Salva os dados iniciais
        localStorage.setItem('streakData', JSON.stringify(dadosIniciais));
        return dadosIniciais;
      }
    } catch (error) {
      console.error("Erro ao carregar dados da sequência do localStorage:", error);
      return null;
    }
  };

  // Função para carregar dados locais e aplicar ao estado
  const carregarDadosLocais = () => {
    const dados = carregarDadosLocaisSync();
    if (dados) {
      atualizarEstadosComDados(dados);
      verificarCheckInDeHoje(dados.ultimoCheckIn);
    }
  };

  // Função para atualizar os estados com os dados carregados
  const atualizarEstadosComDados = (dados: StreakData) => {
    setDiasConsecutivos(dados.diasConsecutivos);
    setRecordeDias(dados.recordeDias);
    setDiasParaProximoNivel(dados.diasParaProximoNivel);
    setMetaDiaria(dados.metaDiaria);
    setProximaRecompensa(dados.proximaRecompensa);
    setUltimoCheckIn(dados.ultimoCheckIn);
    setStreakEvents(dados.eventos || []);
  };

  // Verifica se o usuário já fez check-in hoje
  const verificarCheckInDeHoje = (ultimoCheckIn: string | null) => {
    if (!ultimoCheckIn) {
      setCheckInHoje(false);
      return;
    }

    const hoje = new Date().toISOString().split('T')[0];
    const ultimoCheck = new Date(ultimoCheckIn).toISOString().split('T')[0];

    setCheckInHoje(hoje === ultimoCheck);

    // Se já fez check-in hoje, inicia o cronômetro
    if (hoje === ultimoCheck) {
      iniciarCronometro();
    }
  };

  // Função para salvar os dados da sequência com tentativas de reconexão
  const salvarDadosSequencia = async (dados: StreakData, tentativas = 3) => {
    try {
      // Salva no localStorage como fallback
      localStorage.setItem('streakData', JSON.stringify(dados));

      if (userId) {
        // Salva no Supabase
        const { error } = await supabase
          .from('user_streak')
          .upsert({
            user_id: userId,
            dias_consecutivos: dados.diasConsecutivos,
            recorde_dias: dados.recordeDias,
            dias_para_proximo_nivel: dados.diasParaProximoNivel,
            meta_diaria: dados.metaDiaria,
            proxima_recompensa: dados.proximaRecompensa,
            ultimo_check_in: dados.ultimoCheckIn,
            eventos: dados.eventos
          });

        if (error) {
          console.error("Erro ao salvar dados no Supabase:", error);

          // Verifica se é erro de tabela inexistente
          if (error.code === '42P01' && tentativas > 0) {
            console.log("Tabela user_streak não existe. Tentando migração...");

            // Executa migração para criar a tabela se aplicável (via workflow existente)
            try {
              await fetch('/api/aplicar-migracao', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ migracao: '20241015000001_create_user_streak_table.sql' })
              });

              // Tenta salvar novamente após um breve delay
              setTimeout(() => {
                salvarDadosSequencia(dados, tentativas - 1);
              }, 3000);
            } catch (migracaoError) {
              console.error("Erro ao executar migração:", migracaoError);
            }
          }

          // Se não for erro de tabela inexistente ou tentativas esgotadas
          // Agendar nova tentativa em caso de erro de rede
          if (tentativas > 1 && (error.code === 'NETWORK_ERROR' || error.code?.toString().startsWith('5'))) {
            console.log(`Falha ao salvar. Tentando novamente em 5 segundos... (${tentativas-1} tentativas restantes)`);
            setTimeout(() => {
              salvarDadosSequencia(dados, tentativas - 1);
            }, 5000);
          }
        } else {
          console.log("Dados salvos com sucesso no Supabase");
        }
      } else {
        console.error("Usuário não autenticado. Dados salvos apenas localmente.");

        // Agendar uma tentativa posterior quando o userId estiver disponível
        if (tentativas > 0) {
          setTimeout(async () => {
            const novoUserId = await carregarUserId();
            if (novoUserId) {
              salvarDadosSequencia(dados, tentativas - 1);
            }
          }, 5000);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar dados da sequência:", error);

      // Tenta novamente em caso de erro inesperado
      if (tentativas > 1) {
        setTimeout(() => {
          salvarDadosSequencia(dados, tentativas - 1);
        }, 5000);
      }
    }
  };

  // Função para fazer check-in
  const realizarCheckIn = async () => {
    try {
      const agora = new Date();
      const dataCheckIn = agora.toISOString();

      // Verifica se já fez check-in hoje
      const hoje = agora.toISOString().split('T')[0];
      const ultimoCheck = ultimoCheckIn ? new Date(ultimoCheckIn).toISOString().split('T')[0] : null;

      if (hoje === ultimoCheck) {
        console.log("Já fez check-in hoje!");
        return;
      }

      // Cria novo evento
      const novoEvento: StreakEvent = {
        type: 'login',
        date: dataCheckIn,
      };

      let novosDiasConsecutivos = diasConsecutivos;

      // Verifica se o último check-in foi no dia anterior
      if (ultimoCheckIn) {
        const ultimaData = new Date(ultimoCheckIn);
        const ontem = new Date(agora);
        ontem.setDate(ontem.getDate() - 1);

        const ultimaDataStr = ultimaData.toISOString().split('T')[0];
        const ontemStr = ontem.toISOString().split('T')[0];

        if (ultimaDataStr === ontemStr || hoje === ultimaDataStr) {
          // Check-in consecutivo
          novosDiasConsecutivos += 1;
        } else {
          // Quebrou a sequência
          novosDiasConsecutivos = 1;
        }
      } else {
        // Primeiro check-in
        novosDiasConsecutivos = 1;
      }

      // Atualiza o recorde se necessário
      const novoRecorde = Math.max(recordeDias, novosDiasConsecutivos);

      // Calcula dias para próximo nível (simplificado)
      let novosDiasParaProximoNivel = 3;
      let novaRecompensa = "Badge Iniciante";

      if (novosDiasConsecutivos >= 3 && novosDiasConsecutivos < 7) {
        novosDiasParaProximoNivel = 7 - novosDiasConsecutivos;
        novaRecompensa = "Badge Constante";
      } else if (novosDiasConsecutivos >= 7 && novosDiasConsecutivos < 15) {
        novosDiasParaProximoNivel = 15 - novosDiasConsecutivos;
        novaRecompensa = "Badge Dedicado";
      } else if (novosDiasConsecutivos >= 15 && novosDiasConsecutivos < 30) {
        novosDiasParaProximoNivel = 30 - novosDiasConsecutivos;
        novaRecompensa = "Badge Mestre";
      } else if (novosDiasConsecutivos >= 30) {
        novosDiasParaProximoNivel = 0;
        novaRecompensa = "Badge Lendário";
      }

      // Atualiza os estados
      setDiasConsecutivos(novosDiasConsecutivos);
      setRecordeDias(novoRecorde);
      setDiasParaProximoNivel(novosDiasParaProximoNivel);
      setProximaRecompensa(novaRecompensa);
      setUltimoCheckIn(dataCheckIn);
      setStreakEvents([...streakEvents, novoEvento]);
      setCheckInHoje(true);

      // Mostra animação de check-in
      setShowCheckInAnimation(true);
      setTimeout(() => setShowCheckInAnimation(false), 3000);

      // Salva os dados
      const novosDados: StreakData = {
        diasConsecutivos: novosDiasConsecutivos,
        recordeDias: novoRecorde,
        diasParaProximoNivel: novosDiasParaProximoNivel,
        metaDiaria: metaDiaria,
        proximaRecompensa: novaRecompensa,
        ultimoCheckIn: dataCheckIn,
        eventos: [...streakEvents, novoEvento]
      };

      await salvarDadosSequencia(novosDados);

      // Inicia o cronômetro
      iniciarCronometro();

    } catch (error) {
      console.error("Erro ao fazer check-in:", error);
    }
  };

  // Função para calcular o tempo restante até meia-noite
  const calcularTempoRestante = () => {
    const agora = new Date();
    const meianoite = new Date();
    meianoite.setHours(24, 0, 0, 0);

    const diferencaMs = meianoite.getTime() - agora.getTime();

    // Convertendo para horas, minutos e segundos
    const horas = Math.floor(diferencaMs / (1000 * 60 * 60));
    const minutos = Math.floor((diferencaMs % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencaMs % (1000 * 60)) / 1000);

    return { horas, minutos, segundos, totalMs: diferencaMs };
  };

  // Função para iniciar o cronômetro
  const iniciarCronometro = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Calcula tempo inicial
    const tempoInicial = calcularTempoRestante();
    setTempoRestante({
      horas: tempoInicial.horas,
      minutos: tempoInicial.minutos,
      segundos: tempoInicial.segundos
    });

    // Inicia o timer
    timerRef.current = setInterval(() => {
      const tempo = calcularTempoRestante();

      setTempoRestante({
        horas: tempo.horas,
        minutos: tempo.minutos,
        segundos: tempo.segundos
      });

      // Se chegou à meia-noite, reseta o check-in
      if (tempo.totalMs <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setCheckInHoje(false);
      }
    }, 1000);
  };

  // Carregar dados ao montar o componente e configurar sincronização periódica
  useEffect(() => {
    let isMounted = true;

    const inicializar = async () => {
      // Primeiro carrega dados locais para exibição imediata
      carregarDadosLocais();

      // Depois tenta obter dados do Supabase (que são mais atualizados)
      const id = await carregarUserId();
      if (id && isMounted) {
        await carregarDadosStreakUsuario(id);
      }
    };

    inicializar();

    // Configura sincronização periódica a cada 15 minutos
    const syncInterval = setInterval(async () => {
      const id = await carregarUserId();
      if (id && isMounted) {
        // Busca dados atualizados do servidor
        const { data, error } = await supabase
          .from('user_streak')
          .select('*')
          .eq('user_id', id)
          .single();

        if (!error && data) {
          // Se encontrar dados no servidor e forem mais recentes que os locais,
          // atualiza os dados locais
          const localData = carregarDadosLocaisSync();
          const serverLastUpdate = new Date(data.updated_at || data.ultimo_check_in || 0);
          const localLastUpdate = localData?.ultimoCheckIn ? new Date(localData.ultimoCheckIn) : new Date(0);

          if (serverLastUpdate > localLastUpdate) {
            console.log("Sincronizando dados do servidor para o dispositivo local");

            const streakData: StreakData = {
              diasConsecutivos: data.dias_consecutivos || 0,
              recordeDias: data.recorde_dias || 0,
              diasParaProximoNivel: data.dias_para_proximo_nivel || 3,
              metaDiaria: data.meta_diaria || 5,
              proximaRecompensa: data.proxima_recompensa || "Badge Iniciante",
              ultimoCheckIn: data.ultimo_check_in,
              eventos: data.eventos || []
            };

            atualizarEstadosComDados(streakData);
            verificarCheckInDeHoje(data.ultimo_check_in);
            localStorage.setItem('streakData', JSON.stringify(streakData));
          }
        }
      }
    }, 15 * 60 * 1000); // 15 minutos

    // Limpa timers ao desmontar
    return () => {
      isMounted = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      clearInterval(syncInterval);
    };
  }, []);

  // Verifica se a tabela existe, se não, tenta criar e migra dados locais
  useEffect(() => {
    const verificarECriarTabela = async () => {
      if (userId) {
        try {
          // Verifica se a tabela user_streak existe
          const { error } = await supabase
            .from('user_streak')
            .select('*')
            .limit(1);

          if (error && error.code === '42P01') { // código de erro para tabela não existente
            console.log("Tabela user_streak não existe, tentando aplicar migração...");

            // Tenta aplicar migração via API para criar a tabela
            try {
              await fetch('/api/aplicar-migracao', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ migracao: '20241015000001_create_user_streak_table.sql' })
              });

              console.log("Solicitação de migração enviada");

              // Aguarda um momento e verifica se há dados locais para migrar
              setTimeout(async () => {
                const dadosLocais = carregarDadosLocaisSync();
                if (dadosLocais) {
                  // Tenta migrar dados locais para o Supabase
                  await salvarDadosSequencia(dadosLocais);
                  console.log("Dados locais migrados para o Supabase após criação da tabela");
                }
              }, 5000);
            } catch (migrationError) {
              console.error("Erro ao solicitar migração:", migrationError);
            }
          } else {
            // Se a tabela existir, verifica se há dados para o usuário
            const { data, error: dataError } = await supabase
              .from('user_streak')
              .select('*')
              .eq('user_id', userId)
              .single();

            if (dataError || !data) {
              // Se não houver dados para o usuário, verifica se há dados locais para migrar
              const dadosLocais = carregarDadosLocaisSync();
              if (dadosLocais && dadosLocais.diasConsecutivos > 0) {
                await salvarDadosSequencia(dadosLocais);
                console.log("Dados locais migrados para o Supabase");
              }
            }
          }
        } catch (error) {
          console.error("Erro ao verificar tabela:", error);
        }
      }
    };

    verificarECriarTabela();
  }, [userId]);

  // Função para formatar o tempo
  const formatarTempo = (valor: number): string => {
    return valor < 10 ? `0${valor}` : `${valor}`;
  };

  // Cálculo da porcentagem de progresso para o próximo nível
  const calcularProgresso = () => {
    if (diasConsecutivos === 0 && diasParaProximoNivel === 0) return 0;
    const progresso = (diasConsecutivos / (diasConsecutivos + diasParaProximoNivel)) * 100;
    return Math.min(progresso, 100);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl bg-white dark:bg-gradient-to-br dark:from-[#0c1425] dark:to-[#0a1a2e] h-full w-full"
    >
      {/* Header com gradiente */}
      <div className={`p-3 ${isLightMode ? 'bg-gradient-to-r from-blue-50 to-blue-100/50' : 'bg-gradient-to-r from-[#0A2540]/80 to-[#001427]'} border-b ${isLightMode ? 'border-blue-100' : 'border-blue-800/20'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-lg flex items-center justify-center ${isLightMode ? 'bg-gradient-to-br from-white to-blue-50 shadow-sm border border-blue-200' : 'bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30'}`}
            >
              <motion.div
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Flame className={`h-5 w-5 text-blue-500`} />
              </motion.div>
            </motion.div>
            <div>
              <h3 className={`font-semibold text-lg ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                Sua Sequência de Estudos
              </h3>
              <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>
                <motion.span 
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="font-medium flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" /> Mantenha o ritmo diário
                </motion.span>
              </p>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-xs font-medium ${isLightMode ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:text-white hover:bg-white/5'} group transition-all duration-300`}
          >
            <span>Histórico</span>
            <motion.div
              initial={{ x: 0 }}
              whileHover={{ x: 4 }}
              className="inline-block ml-1"
            >
              <ArrowRight className="h-3 w-3 group-hover:text-blue-500 transition-colors duration-300" />
            </motion.div>
          </Button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="p-3 flex flex-col gap-3">
        {/* Métricas principais */}
        <div className="flex items-start gap-3">
          {/* Contador de dias consecutivos */}
          <div className="flex-1 flex flex-col items-center text-center">
            <div className={`relative w-20 h-20 flex items-center justify-center mb-1 ${!checkInHoje ? 'group' : ''}`}>
              {/* Círculo de progresso animado */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke={isLightMode ? '#E5E7EB' : '#1F2937'} 
                  strokeWidth="8"
                />
                <motion.circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke={isLightMode ? '#3B82F6' : '#60A5FA'} 
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset="283"
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ 
                    strokeDashoffset: 283 - (283 * Math.min(diasConsecutivos / (diasParaProximoNivel + diasConsecutivos), 1))
                  }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </svg>

              {/* Número de dias consecutivos */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  key={diasConsecutivos}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-2xl font-bold ${isLightMode ? 'text-gray-800' : 'text-white'}`}
                >
                  {diasConsecutivos}
                </motion.span>
                <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>dias</span>
              </div>

              {/* Botão de check-in sobreposto quando não fez check-in hoje */}
              {!checkInHoje && (
                <div 
                  className={`
                    absolute inset-0 bg-opacity-0 group-hover:bg-opacity-90 
                    ${isLightMode ? 'group-hover:bg-blue-50' : 'group-hover:bg-blue-900/30'} 
                    rounded-full flex items-center justify-center transition-all duration-300
                    opacity-0 group-hover:opacity-100 cursor-pointer
                  `}
                  onClick={realizarCheckIn}
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${isLightMode 
                        ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600' 
                        : 'bg-blue-600 text-white shadow-md hover:bg-blue-500'
                      }
                    `}
                  >
                    Check-in
                  </motion.button>
                </div>
              )}
            </div>
            <h4 className={`font-semibold text-sm ${isLightMode ? 'text-gray-800' : 'text-white'} mb-0.5`}>
              Sequência Atual
            </h4>
            <p className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {diasConsecutivos > 0 && (
                <>Mais {diasParaProximoNivel} dias para o próximo nível</>
              )}
              {diasConsecutivos === 0 && (
                <>Comece sua sequência hoje</>
              )}
            </p>
          </div>

          {/* Estatísticas */}
          <div className="flex-1 space-y-2">
            {/* Recorde pessoal */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <h4 className={`text-xs font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  Recorde pessoal
                </h4>
                <span className={`text-xs font-bold ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                  {recordeDias} dias
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  style={{ width: `${Math.min((recordeDias / 30) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Meta diária */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <h4 className={`text-xs font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  Meta diária
                </h4>
                <span className={`text-xs font-medium ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                  {metaDiaria} estudos
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  style={{ width: `${(metaDiaria / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Próxima recompensa */}
            <div className={`flex items-center gap-1.5 p-1.5 rounded-lg ${
              isLightMode ? 'bg-blue-50 border border-blue-100' : 'bg-blue-900/20 border border-blue-800/30'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isLightMode ? 'bg-blue-100' : 'bg-blue-800/50'
              }`}>
                <Gift className={`h-3 w-3 ${isLightMode ? 'text-blue-600' : 'text-blue-300'}`} />
              </div>
              <div>
                <p className={`text-[10px] font-medium ${isLightMode ? 'text-blue-800' : 'text-blue-200'}`}>
                  Próxima recompensa:
                </p>
                <p className={`text-xs font-semibold ${isLightMode ? 'text-blue-900' : 'text-blue-100'}`}>
                  {proximaRecompensa}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendário semanal de atividade */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <h4 className={`font-medium text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
              Calendário de atividade
            </h4>

            {/* Timer para o próximo check-in quando já fez check-in hoje */}
            {checkInHoje && ultimoCheckIn && (
              <div className={`text-[10px] rounded-full px-2 py-0.5 flex items-center gap-1 ${
                isLightMode ? 'bg-blue-50 text-blue-600' : 'bg-blue-900/20 text-blue-300'
              }`}>
                <Clock className="h-2.5 w-2.5" />
                <span>
                  Próximo: {tempoRestante.horas}h {tempoRestante.minutos}m
                </span>
              </div>
            )}
          </div>

          {/* Calendário de 7 dias */}
          <div className="grid grid-cols-7 gap-1">
            {[...Array(7)].map((_, index) => {
              // Lógica para verificar se este dia tem um evento de check-in
              const dayHasCheckIn = streakEvents.some(event => {
                const eventDate = new Date(event.date);
                const daysAgo = Math.floor((new Date().getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
                return daysAgo === 6 - index; // 6 dias atrás até hoje
              });

              // Dia atual (index 6 é hoje, 0 é 6 dias atrás)
              const isToday = index === 6;

              // Determinar qual dia da semana este é
              const date = new Date();
              date.setDate(date.getDate() - (6 - index));
              const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).substring(0, 3);
              const dayNum = date.getDate();

              return (
                <div 
                  key={index}
                  className={`flex flex-col items-center py-1 rounded-lg ${
                    isToday 
                      ? isLightMode 
                        ? 'bg-blue-50 border border-blue-100' 
                        : 'bg-blue-900/20 border border-blue-800/30'
                      : isLightMode 
                        ? 'bg-gray-50 border border-gray-100' 
                        : 'bg-gray-800/20 border border-gray-700/30'
                  }`}
                >
                  <span className={`text-[10px] font-medium mb-0.5 ${
                    isToday 
                      ? isLightMode ? 'text-blue-600' : 'text-blue-300'
                      : isLightMode ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {dayName}
                  </span>

                  <span className={`text-xs font-semibold mb-1 ${
                    isToday 
                      ? isLightMode ? 'text-blue-700' : 'text-blue-200'
                      : isLightMode ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    {dayNum}
                  </span>

                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    dayHasCheckIn
                      ? isLightMode 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-blue-600 text-white'
                      : isLightMode 
                        ? 'bg-gray-200 text-gray-400' 
                        : 'bg-gray-700 text-gray-500'
                  }`}>
                    {dayHasCheckIn ? (
                      <CheckIcon className="h-2.5 w-2.5" />
                    ) : (
                      <XIcon className="h-2.5 w-2.5" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Atividades recentes */}
        <div>
          <h4 className={`font-medium text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-300'} mb-1.5`}>
            Atividades recentes
          </h4>

          <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
            {streakEvents.length > 0 ? (
              [...streakEvents]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 3)
                .map((event, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      isLightMode 
                        ? 'bg-gray-50 border border-gray-100' 
                        : 'bg-gray-800/20 border border-gray-700/30'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isLightMode ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/30 text-blue-300'
                    }`}>
                      <CheckSquare className="h-3 w-3" />
                    </div>

                    <div className="flex-1">
                      <p className={`text-xs font-medium ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                        Check-in realizado
                      </p>
                      <p className={`text-[10px] ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date(event.date).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))
            ) : (
              <div className={`p-2 rounded-lg text-center ${
                isLightMode ? 'bg-gray-50 border border-gray-100' : 'bg-gray-800/20 border border-gray-700/30'
              }`}>
                <p className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Nenhuma atividade recente.
                </p>
                <p className={`text-[10px] mt-0.5 ${isLightMode ? 'text-blue-600' : 'text-blue-400'}`}>
                  Faça seu primeiro check-in!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Animação de check-in concluído */}
        <AnimatePresence>
          {showCheckInAnimation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm"
              onClick={() => setShowCheckInAnimation(false)}
            >
              <motion.div 
                className={`rounded-xl overflow-hidden p-5 shadow-2xl ${
                  isLightMode ? 'bg-white' : 'bg-gray-900'
                }`}
                initial={{ scale: 0.5, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 20 
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.5, times: [0, 0.6, 1] }}
                    className={`w-16 h-16 rounded-full mb-3 flex items-center justify-center ${
                      isLightMode ? 'bg-blue-100' : 'bg-blue-900/30'
                    }`}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: [0, 15, 0, -15, 0] }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <CheckCircle className={`h-10 w-10 ${isLightMode ? 'text-blue-600' : 'text-blue-400'}`} />
                    </motion.div>
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={`text-xl font-bold mb-1 ${isLightMode ? 'text-gray-800' : 'text-white'}`}
                  >
                    Check-in Concluído!
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={`text-sm mb-3 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}
                  >
                    Você manteve sua sequência por <span className="font-semibold">{diasConsecutivos} dias</span>! Continue assim!
                  </motion.p>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className={`px-4 py-2 rounded-lg font-medium shadow-lg ${
                      isLightMode 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                    onClick={() => setShowCheckInAnimation(false)}
                  >
                    Continuar
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}