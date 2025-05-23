
import React, { useState, useEffect, useRef } from "react";
import { Flame, Award, TrendingUp, ExternalLink, Star, Zap, Trophy, Clock, CheckCircle } from "lucide-react";
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
      className="h-full w-full rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl bg-white dark:bg-gradient-to-br dark:from-[#0c1425] dark:to-[#0a1a2e] relative flex flex-col"
    >
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Partículas decorativas */}
        <div className="absolute top-1/4 right-10 w-2 h-2 bg-[#FF6B00]/40 rounded-full"></div>
        <div className="absolute top-1/3 left-10 w-3 h-3 bg-blue-400/30 dark:bg-blue-400/20 rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-purple-400/30 dark:bg-purple-400/20 rounded-full"></div>
      </div>

      {/* Header elegante com gradiente e botão de check-in */}
      <div className={`p-5 ${isLightMode ? 'bg-gradient-to-r from-orange-50 to-orange-100/50' : 'bg-gradient-to-r from-[#0A2540]/80 to-[#001427]'} border-b ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/20'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg flex items-center justify-center ${isLightMode ? 'bg-white shadow-sm border border-orange-200' : 'bg-[#FF6B00]/10 border border-[#FF6B00]/30'}`}>
              <Flame className={`h-5 w-5 text-[#FF6B00]`} />
            </div>
            <div>
              <h3 className={`font-semibold text-lg ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                Sua Sequência de Estudos
              </h3>
              <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>
                <span className="font-medium">{diasConsecutivos} dias consecutivos</span>
              </p>
            </div>
          </div>

          {/* Botão de check-in diário ou cronômetro */}
          {!checkInHoje ? (
            <Button 
              onClick={realizarCheckIn}
              variant="ghost" 
              size="sm" 
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 
                ${isLightMode 
                  ? 'bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20' 
                  : 'bg-[#FF6B00]/20 text-[#FF6B00] hover:bg-[#FF6B00]/30'}`}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Marcar presença</span>
            </Button>
          ) : (
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold 
              ${isLightMode 
                ? 'bg-gray-100 text-gray-700' 
                : 'bg-[#14253d] text-gray-300'}`}>
              <Clock className="h-3.5 w-3.5 text-[#FF6B00]" />
              <span>
                {formatarTempo(tempoRestante.horas)}:
                {formatarTempo(tempoRestante.minutos)}:
                {formatarTempo(tempoRestante.segundos)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo principal com design premium */}
      <div className="p-4 relative z-10 flex flex-col h-[calc(100%-76px)] justify-between">
        <AnimatePresence>
          {showCheckInAnimation && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center z-50"
            >
              <div className="bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 p-4 rounded-xl backdrop-blur-sm border border-[#FF6B00]/30 flex flex-col items-center max-w-[80%]">
                <CheckCircle className="h-16 w-16 text-[#FF6B00] mb-2" />
                <h4 className="text-lg font-semibold text-[#FF6B00]">Presença registrada!</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {diasConsecutivos === 1 
                    ? "Primeiro dia da sua jornada!" 
                    : `${diasConsecutivos} dias consecutivos!`}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {diasConsecutivos === 0 && !checkInHoje ? (
          // Estado inicial para novos usuários - design premium
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            {/* Efeito de partículas decorativas */}
            <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 rounded-full bg-[#FF6B00]/30 animate-pulse"></div>
            <div className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full bg-[#FF6B00]/20 animate-pulse" style={{animationDelay: '1s'}}></div>
            
            {/* Ícone principal com efeitos */}
            <div className="relative mb-6 group">
              {/* Aura externa animada */}
              <motion.div 
                initial={{ opacity: 0.4, scale: 0.8 }}
                animate={{ 
                  opacity: [0.4, 0.7, 0.4], 
                  scale: [0.8, 1.1, 0.8],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -inset-3 rounded-full bg-gradient-to-r from-[#FF6B00]/10 to-[#FF8C40]/10 blur-xl"
              />
              
              {/* Círculo principal */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF6B00]/10 to-[#FF8C40]/10 backdrop-blur-sm flex items-center justify-center border border-[#FF6B00]/30 relative">
                <div className="absolute inset-1 rounded-full bg-gradient-to-r from-[#FF6B00]/20 to-[#FF8C40]/20 opacity-70"></div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FF6B00]/40 to-[#FF8C40]/40 flex items-center justify-center z-10">
                  <Flame className="h-10 w-10 text-[#FF6B00] drop-shadow-lg relative z-10" />
                </div>
              </div>
              
              {/* Pequenos elementos decorativos ao redor */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white/10 dark:bg-[#0A2540]/70 border border-[#FF6B00]/30 flex items-center justify-center">
                <Star className="h-2.5 w-2.5 text-[#FF8C40]" />
              </div>
              <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-white/10 dark:bg-[#0A2540]/70 border border-[#FF6B00]/30 flex items-center justify-center">
                <Trophy className="h-2.5 w-2.5 text-[#FF8C40]" />
              </div>
            </div>
            
            {/* Texto principal com tipografia melhorada */}
            <h4 className={`font-semibold text-xl mb-2 ${isLightMode ? 'text-gray-800' : 'text-gray-100'} tracking-tight`}>
              Inicie sua jornada de estudos
            </h4>
            
            {/* Descrição com informações mais detalhadas */}
            <p className={`text-sm max-w-[280px] mb-5 ${isLightMode ? 'text-gray-600' : 'text-gray-300'} leading-relaxed`}>
              Registre sua presença diária para construir uma sequência de estudos consistente e desbloquear recompensas
            </p>
            
            {/* Informações de benefícios em formato de badges */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${isLightMode ? 'bg-[#FF6B00]/5 text-[#FF6B00]' : 'bg-[#FF6B00]/10 text-[#FF6B00]'}`}>
                <TrendingUp className="h-3 w-3" />
                <span>Maior produtividade</span>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${isLightMode ? 'bg-[#FF6B00]/5 text-[#FF6B00]' : 'bg-[#FF6B00]/10 text-[#FF6B00]'}`}>
                <Award className="h-3 w-3" />
                <span>Ganhe badges</span>
              </div>
            </div>
            
            {/* Botão de ação principal redesenhado */}
            <Button 
              onClick={realizarCheckIn}
              className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white border-none shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 px-5 py-6 h-10 rounded-xl"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="font-medium">Marcar presença agora</span>
            </Button>
            
            {/* Informação adicional discreta */}
            <p className={`text-xs mt-3 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Crie um hábito de estudo com check-ins diários
            </p>
          </div>
        ) : (
          // Interface com dados do usuário quando existirem
          <>
            {/* Contador principal estilizado */}
            <div className="flex flex-col items-center mb-3 relative">
              {/* Efeito de brilho animado ao redor do ícone */}
              <motion.div 
                initial={{ opacity: 0.6, scale: 0.9 }}
                animate={{ 
                  opacity: [0.6, 0.8, 0.6], 
                  scale: [0.9, 1.1, 0.9],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -inset-2 rounded-full bg-gradient-to-r from-[#FF6B00]/20 to-[#FF8C40]/20 blur-xl"
              />

              {/* Ícone principal com design premium */}
              <div className="relative mb-2">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#FF6B00]/20 to-[#FF8C40]/20 blur-md"></div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] flex items-center justify-center relative">
                  <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] opacity-50"></div>
                  <Flame className="h-10 w-10 text-white drop-shadow-md relative z-10" />
                </div>

                {/* Indicador de streak com borda animada */}
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-[#14253d] flex items-center justify-center shadow-lg border border-[#FF6B00]/20"
                >
                  <Zap className="h-4 w-4 text-[#FF6B00]" />
                </motion.div>
              </div>

              {/* Contador de dias em design premium */}
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Sua sequência atual</p>
                <div className="flex items-center justify-center">
                  <p className="text-5xl font-bold bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-transparent bg-clip-text">{diasConsecutivos}</p>
                  <p className="text-lg font-medium text-gray-400 dark:text-gray-500 ml-1 mt-2">dias</p>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 font-medium">
                  estudando consecutivamente
                </p>
              </div>
            </div>

            {/* Cronômetro elegante quando já tiver feito check-in */}
            {checkInHoje && (
              <div className="mb-3">
                <div className="bg-gray-50 dark:bg-[#14253d]/80 rounded-lg p-2 backdrop-blur-sm border border-gray-100 dark:border-gray-800/80 flex flex-col items-center">
                  <div className="flex items-center space-x-1.5 mb-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#FF6B00]" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Próximo check-in em</span>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2 text-xl font-mono font-semibold text-[#FF6B00]">
                    <div className="flex flex-col items-center">
                      <span className="bg-gray-100 dark:bg-[#0A2540] rounded px-2 py-1 min-w-[45px] text-center">
                        {formatarTempo(tempoRestante.horas)}
                      </span>
                      <span className="text-[10px] mt-0.5 text-gray-500">Horas</span>
                    </div>
                    <span className="text-gray-400">:</span>
                    <div className="flex flex-col items-center">
                      <span className="bg-gray-100 dark:bg-[#0A2540] rounded px-2 py-1 min-w-[45px] text-center">
                        {formatarTempo(tempoRestante.minutos)}
                      </span>
                      <span className="text-[10px] mt-0.5 text-gray-500">Min</span>
                    </div>
                    <span className="text-gray-400">:</span>
                    <div className="flex flex-col items-center">
                      <span className="bg-gray-100 dark:bg-[#0A2540] rounded px-2 py-1 min-w-[45px] text-center">
                        {formatarTempo(tempoRestante.segundos)}
                      </span>
                      <span className="text-[10px] mt-0.5 text-gray-500">Seg</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Seção de informações adicionais com design premium */}
            <div className="space-y-2 mt-1">
              {/* Progresso para o próximo nível com gradiente premium */}
              <div className="bg-gray-50 dark:bg-[#14253d]/80 rounded-lg p-2.5 backdrop-blur-sm border border-gray-100 dark:border-gray-800/80">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <Trophy className="h-3.5 w-3.5 text-[#FF6B00]" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Próximo nível</span>
                  </div>
                  <span className="text-xs font-semibold text-[#FF6B00] bg-[#FF6B00]/10 px-2 py-0.5 rounded-full">+{diasParaProximoNivel} dias</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] relative"
                    style={{ width: `${calcularProgresso()}%` }}
                  >
                    <motion.div 
                      className="absolute top-0 right-0 h-full w-2 bg-white/50"
                      initial={{ x: -20 }}
                      animate={{ x: 20 }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Estatísticas em design de cartões grid */}
              <div className="grid grid-cols-2 gap-1.5">
                {/* Card de Recorde */}
                <div className="bg-gray-50 dark:bg-[#14253d]/80 rounded-lg py-1 px-2 backdrop-blur-sm border border-gray-100 dark:border-gray-800/80 flex flex-col items-center justify-center">
                  <div className="flex items-center space-x-1">
                    <Award className="h-2.5 w-2.5 text-yellow-500" />
                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Seu recorde</span>
                  </div>
                  <p className="text-base font-bold text-gray-700 dark:text-gray-200 mb-0">{recordeDias}</p>
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0">dias</p>
                </div>

                {/* Card de Meta Diária */}
                <div className="bg-gray-50 dark:bg-[#14253d]/80 rounded-lg py-1 px-2 backdrop-blur-sm border border-gray-100 dark:border-gray-800/80 flex flex-col items-center justify-center">
                  <div className="flex items-center space-x-1">
                    <Star className="h-2.5 w-2.5 text-[#FF8C40]" />
                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Meta diária</span>
                  </div>
                  <p className="text-base font-bold text-gray-700 dark:text-gray-200 mb-0">{metaDiaria}</p>
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0">dias</p>
                </div>
              </div>

              {/* Próxima recompensa com design premium */}
              <div className="bg-gray-50 dark:bg-[#14253d]/80 rounded-lg p-2 backdrop-blur-sm border border-gray-100 dark:border-gray-800/80">
                <div className="flex items-center justify-center space-x-1.5 mb-2">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Próxima recompensa</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="bg-gradient-to-r from-[#FF6B00]/10 to-[#FF8C40]/10 rounded-full p-1">
                    <Trophy className="h-4 w-4 text-[#FF6B00]" />
                  </div>
                  <span className="text-sm font-semibold bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-transparent bg-clip-text">
                    {proximaRecompensa}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
