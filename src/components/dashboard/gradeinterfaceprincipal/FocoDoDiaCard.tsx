import React, { useState, useEffect } from "react";
import { Target, Clock, BookOpen, Play, Check, ChevronRight, Flame, Trophy, PlusCircle, Settings, Smile, HelpCircle, BarChart2, Trash2 } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import DefinirFocoModal, { FocoData } from "./DefinirFocoModal";
import confetti from 'canvas-confetti';

// Tipo para atividades
interface Atividade {
  id: number;
  titulo: string;
  tipo: "video" | "exercicio" | "revisao" | "tarefa";
  tempo: string;
  prazo: string;
  urgente: boolean;
  concluido: boolean;
  progresso: number;
}

interface FocoPrincipal {
  titulo: string;
  descricao: string;
  disciplinas: string[];
  tempoTotal: string;
  dicaMentor?: string;
  sentimento?: string;
}

export default function FocoDoDiaCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [focoPrincipal, setFocoPrincipal] = useState<FocoPrincipal | null>(null);
  const [temFoco, setTemFoco] = useState<boolean>(false);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [gerando, setGerando] = useState<boolean>(false);

  // Carregar dados do foco do usuário atual
  useEffect(() => {
    const carregarFocoDia = async () => {
      try {
        setCarregando(true);

        // Obter ID do usuário atual
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (!userId) {
          console.log("Usuário não autenticado, carregando dados locais");
          carregarDadosLocais();
          return;
        }

        // Importar o serviço de foco do dia
        const { obterFocoDia } = await import('@/services/focoDiaService');

        // Obter dados do foco do dia
        const focoDia = await obterFocoDia(userId);

        if (focoDia) {
          setFocoPrincipal(focoDia.focoPrincipal);
          setAtividades(focoDia.atividades);
          setTemFoco(true);
          setTodasAtividadesConcluidas(focoDia.todasConcluidas || false);
          console.log("Foco do dia carregado do servidor:", focoDia);

          // Atualizar localStorage com dados do servidor para manter sincronizado
          localStorage.setItem('focoDia', JSON.stringify({
            focoPrincipal: focoDia.focoPrincipal,
            atividades: focoDia.atividades,
            todasConcluidas: focoDia.todasConcluidas
          }));
        } else {
          console.log("Nenhum foco do dia encontrado no servidor, verificando dados locais");
          carregarDadosLocais();
        }
      } catch (error) {
        console.error("Erro ao carregar foco do dia:", error);
        carregarDadosLocais();
      } finally {
        setCarregando(false);
      }
    };

    // Função para carregar dados do localStorage como fallback
    const carregarDadosLocais = () => {
      try {
        const focoDadosSalvos = localStorage.getItem('focoDia');
        if (focoDadosSalvos) {
          const dados = JSON.parse(focoDadosSalvos);

          // Validar dados carregados do localStorage
          if (!dados.focoPrincipal || !dados.atividades) {
            console.error("Dados inválidos no localStorage");
            setTemFoco(false);
            return;
          }

          // Verificar se o foco do dia é de hoje
          const dataAtual = new Date().toDateString();
          const dataFoco = dados.criadoEm ? new Date(dados.criadoEm).toDateString() : null;

          // Se tiver data e não for de hoje, considerar como não tendo foco
          if (dataFoco && dataFoco !== dataAtual) {
            console.log("Foco salvo é de outro dia, desconsiderando");
            setTemFoco(false);
            return;
          }

          // Processar os dados carregados
          setFocoPrincipal(dados.focoPrincipal);
          setAtividades(Array.isArray(dados.atividades) ? dados.atividades : []);
          setTemFoco(true);

          // Verificar se todas as atividades estão concluídas
          const todasConcluidas = dados.atividades.length > 0 && 
            dados.atividades.every((ativ: Atividade) => ativ.concluido);

          setTodasAtividadesConcluidas(todasConcluidas || dados.todasConcluidas);
          console.log("Foco do dia carregado do localStorage");

          // Tentar salvar no servidor se o usuário estiver autenticado
          sincronizarComServidor(dados);
        } else {
          setTemFoco(false);
          console.log("Nenhum foco do dia encontrado");
        }
      } catch (error) {
        console.error("Erro ao carregar dados locais do foco:", error);
        setTemFoco(false);
      } finally {
        setCarregando(false);
      }
    };

    // Função para tentar sincronizar dados locais com o servidor
    const sincronizarComServidor = async (dadosLocais: any) => {
      try {
        // Obter ID do usuário atual
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (!userId) {
          console.log("Usuário não autenticado, não é possível sincronizar");
          return;
        }

        // Importar o serviço de foco do dia
        const { salvarFocoDia } = await import('@/services/focoDiaService');

        // Criar objeto de foco do dia
        const focoDia = {
          userId,
          focoPrincipal: dadosLocais.focoPrincipal,
          atividades: dadosLocais.atividades,
          todasConcluidas: dadosLocais.todasConcluidas || false,
          criadoEm: new Date().toISOString()
        };

        // Salvar no servidor
        await salvarFocoDia(focoDia);
        console.log("Dados sincronizados com o servidor");
      } catch (error) {
        console.error("Erro ao sincronizar com servidor:", error);
      }
    };

    // Adicionar listener para atualizações de outros componentes
    const handleFocoDiaAtualizado = (event: any) => {
      const novoFoco = event.detail?.focoDia;
      if (novoFoco) {
        setFocoPrincipal(novoFoco.focoPrincipal);
        setAtividades(novoFoco.atividades);
        setTemFoco(true);
        setTodasAtividadesConcluidas(novoFoco.todasConcluidas || false);
        console.log("Foco do dia atualizado via evento");
      }
    };

    window.addEventListener('foco-dia-atualizado', handleFocoDiaAtualizado);

    // Iniciar carregamento de dados
    carregarFocoDia();

    // Limpar listener ao desmontar
    return () => {
      window.removeEventListener('foco-dia-atualizado', handleFocoDiaAtualizado);
    };
  }, []);

  // Estado para controlar a exibição do estado de conclusão
  const [todasAtividadesConcluidas, setTodasAtividadesConcluidas] = useState<boolean>(false);
  const [mostrarAnimacaoConclusao, setMostrarAnimacaoConclusao] = useState<boolean>(false);
  const [pontosGanhos, setPontosGanhos] = useState<number>(50);

  // Função para lidar com a conclusão de atividades
  const toggleAtividade = async (id: number) => {
    // Atualizar o estado local
    const atualizadas = atividades.map(ativ => 
      ativ.id === id ? { ...ativ, concluido: !ativ.concluido } : ativ
    );

    setAtividades(atualizadas);

    // Verificar se todas as atividades foram concluídas
    const todasConcluidas = atualizadas.length > 0 && atualizadas.every(ativ => ativ.concluido);

    // Se a última atividade foi concluída agora, mostrar animação e atualizar estado
    if (todasConcluidas && !todasAtividadesConcluidas) {
      setMostrarAnimacaoConclusao(true);
      setTimeout(() => {
        setTodasAtividadesConcluidas(true);
        setMostrarAnimacaoConclusao(false);
      }, 1500);

      // Código para adicionar pontos ao usuário quando todas as atividades são concluídas
      try {
        // Este bloco pode ser expandido para integrar com o sistema de pontos
        console.log(`Adicionando ${pontosGanhos} pontos ao usuário por concluir todas as atividades.`);
        // Aqui você adicionaria uma chamada ao serviço de pontos/recompensas
      } catch (error) {
        console.error("Erro ao adicionar pontos:", error);
      }
    } else if (!todasConcluidas && todasAtividadesConcluidas) {
      setTodasAtividadesConcluidas(false);
    }

    // Atualizar no backend e localStorage
    if (focoPrincipal) {
      try {
        // Atualizar primeiro no localStorage para garantir persistência
        localStorage.setItem('focoDia', JSON.stringify({
          focoPrincipal,
          atividades: atualizadas,
          todasConcluidas
        }));

        // Obter ID do usuário atual
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (userId) {
          // Importar o serviço de foco do dia
          const { atualizarStatusAtividade, salvarFocoDia } = await import('@/services/focoDiaService');

          // Tentar atualizar apenas a atividade específica
          const atividadeAtualizada = atualizadas.find(ativ => ativ.id === id);
          if (atividadeAtualizada) {
            const sucesso = await atualizarStatusAtividade(
              userId, 
              id, 
              atividadeAtualizada.concluido
            );

            if (!sucesso) {
              console.warn("Não foi possível atualizar apenas a atividade, tentando salvar todo o foco");

              // Fallback: salvar o foco completo
              await salvarFocoDia({
                userId,
                focoPrincipal,
                atividades: atualizadas,
                todasConcluidas,
                atualizadoEm: new Date().toISOString()
              });
            }
          }

          console.log("Status da atividade atualizado com sucesso");
        } else {
          console.log("Usuário não autenticado, dados salvos apenas localmente");
        }
      } catch (error) {
        console.error("Erro ao atualizar status da atividade:", error);
        // Pelo menos o estado local e localStorage já foram atualizados acima
      }
    }
  };

  // Função para processar dados do modal e gerar o foco
  const processarDefinicaoFoco = async (dados: FocoData) => {
    setModalAberto(false);
    setGerando(true);

    // Garantir que saímos do estado de conclusão quando geramos novo foco
    setTodasAtividadesConcluidas(false);

    try {
      // Obter ID do usuário atual
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        console.error("Usuário não autenticado");
        setGerando(false);
        return;
      }

      // Importar o serviço de IA para gerar sugestões
      const { generateFocusSuggestions } = await import('@/services/epictusIAService');

      // Exibir debug das informações do formulário
      console.log("Dados recebidos do formulário:", {
        objetivo: dados.objetivo,
        objetivoPersonalizado: dados.objetivoPersonalizado,
        disciplinas: dados.disciplinas,
        topicoEspecifico: dados.topicoEspecifico,
        tempoEstudo: dados.tempoEstudo,
        tarefasSelecionadas: dados.tarefasSelecionadas,
        estado: dados.estado
      });

      // Obter sugestões personalizadas com base no perfil do usuário e dados da agenda
      const aiSuggestions = await generateFocusSuggestions(userId, dados);

      if (!aiSuggestions) {
        console.error("Não foi possível obter sugestões da IA");
        // Criar foco principal baseado apenas nos dados recebidos (fallback)
        gerarFocoSemIA(dados);
        return;
      }

      console.log("Sugestões da IA recebidas:", aiSuggestions);

      // Estruturar dados de foco principal
      const novoFocoPrincipal: FocoPrincipal = {
        titulo: aiSuggestions.focoPrincipal.titulo || dados.objetivo,
        descricao: aiSuggestions.focoPrincipal.descricao || dados.objetivoPersonalizado || dados.objetivo,
        disciplinas: aiSuggestions.focoPrincipal.disciplinas?.length > 0 
          ? aiSuggestions.focoPrincipal.disciplinas 
          : dados.disciplinas,
        tempoTotal: aiSuggestions.focoPrincipal.tempoTotal || 
          `${Math.round(dados.tempoEstudo / 60)} hora${dados.tempoEstudo >= 120 ? 's' : ''}`,
        dicaMentor: aiSuggestions.focoPrincipal.dicaMentor || gerarDicaMentor(dados.estado),
        sentimento: aiSuggestions.focoPrincipal.sentimento || dados.estado
      };

      // Estruturar as atividades sugeridas pela IA
      let novasAtividades: Atividade[] = [];

      if (aiSuggestions.atividades && aiSuggestions.atividades.length > 0) {
        // Usar atividades da IA
        novasAtividades = aiSuggestions.atividades.map((ativ: any) => ({
          id: ativ.id || Date.now() + Math.floor(Math.random() * 1000),
          titulo: ativ.titulo,
          tipo: ativ.tipo || "tarefa",
          tempo: ativ.tempo || "30min",
          prazo: ativ.prazo || "hoje",
          urgente: ativ.urgente || false,
          concluido: false,
          progresso: 0
        }));
      } else {
        // Fallback: gerar atividades manualmente com base nas entradas do usuário
        novasAtividades = gerarAtividades(dados);
      }

      // Garantir que temos pelo menos 3 tarefas
      if (novasAtividades.length < 3) {
        console.log("Número insuficiente de tarefas geradas. Adicionando tarefas complementares.");
        const tarefasComplementares = gerarTarefasComplementares(dados, novasAtividades.length);
        novasAtividades = [...novasAtividades, ...tarefasComplementares];
      }

      // Garantir que as tarefas selecionadas pelo usuário estejam incluídas
      if (dados.tarefasSelecionadas && dados.tarefasSelecionadas.length > 0) {
        // Verificar se as tarefas selecionadas já estão nas atividades
        const tarefasExistentes = new Set(novasAtividades.map(ativ => ativ.titulo.toLowerCase()));

        // Adicionar tarefas selecionadas que não estão nas atividades
        const tarefasParaAdicionar = dados.tarefasSelecionadas.filter(
          tarefa => !tarefasExistentes.has(tarefa.toLowerCase())
        );

        if (tarefasParaAdicionar.length > 0) {
          const tarefasAdicionais = tarefasParaAdicionar.map((tarefa, index) => {
            // Determinar se parece ser um evento (aula, prova, etc) para definir tipo
            const ehEvento = 
              tarefa.toLowerCase().includes("aula") || 
              tarefa.toLowerCase().includes("prova") || 
              tarefa.toLowerCase().includes("evento") || 
              tarefa.toLowerCase().includes("palestra");

            // Definir urgência com base em palavras-chave
            const ehUrgente = 
              tarefa.toLowerCase().includes("urgent") || 
              tarefa.toLowerCase().includes("importante") ||
              tarefa.toLowerCase().includes("prazo") ||
              tarefa.toLowerCase().includes("hoje") ||
              tarefa.toLowerCase().includes("amanhã");

            return {
              id: Date.now() + 1000 + index,
              titulo: tarefa,
              tipo: ehEvento ? "video" : "tarefa" as "tarefa" | "revisao" | "exercicio" | "video",
              tempo: `${Math.floor(Math.random() * 30) + 15}min`,
              prazo: ehUrgente ? "hoje" : "esta semana",
              urgente: ehUrgente,
              concluido: false,
              progresso: 0
            };
          });

          // Adicionar as novas tarefas ao início da lista (prioridade)
          novasAtividades = [...tarefasAdicionais, ...novasAtividades];
        }
      }

      // Limitar a 4 atividades no total para não sobrecarregar o usuário
      if (novasAtividades.length > 4) {
        novasAtividades = novasAtividades.slice(0, 4);
      }

      // Atualizar estados - garantindo que saia da interface de conclusão
      setFocoPrincipal(novoFocoPrincipal);
      setAtividades(novasAtividades);
      setTemFoco(true);
      setGerando(false);
      setTodasAtividadesConcluidas(false);
      setMostrarAnimacaoConclusao(false);

      // Salvar no Supabase e localStorage para persistência
      try {
        const { salvarFocoDia } = await import('@/services/focoDiaService');

        // Criar objeto de foco do dia
        const focoDia = {
          userId,
          focoPrincipal: novoFocoPrincipal,
          atividades: novasAtividades,
          todasConcluidas: false,
          criadoEm: new Date().toISOString()
        };

        // Salvar no backend
        await salvarFocoDia(focoDia);

        // Também salvar localmente como backup
        localStorage.setItem('focoDia', JSON.stringify({
          focoPrincipal: novoFocoPrincipal,
          atividades: novasAtividades,
          todasConcluidas: false
        }));

        console.log("Foco do dia salvo com sucesso.");
      } catch (saveError) {
        console.error("Erro ao salvar foco do dia:", saveError);

        // Garantir que pelo menos o localStorage esteja atualizado
        localStorage.setItem('focoDia', JSON.stringify({
          focoPrincipal: novoFocoPrincipal,
          atividades: novasAtividades,
          todasConcluidas: false
        }));
      }

      console.log("Foco do dia gerado com sucesso utilizando IA:", { novoFocoPrincipal, novasAtividades });
    } catch (error) {
      console.error("Erro ao processar definição de foco:", error);
      // Fallback em caso de erro
      gerarFocoSemIA(dados);
    }
  };

  // Fallback para gerar foco sem IA quando ocorrer erros
  const gerarFocoSemIA = (dados: FocoData) => {
    // Criar foco principal baseado apenas nos dados recebidos
    const novoFocoPrincipal: FocoPrincipal = {
      titulo: dados.objetivo,
      descricao: dados.objetivoPersonalizado || dados.objetivo,
      disciplinas: dados.disciplinas,
      tempoTotal: `${Math.round(dados.tempoEstudo / 60)} hora${dados.tempoEstudo >= 120 ? 's' : ''}`,
      dicaMentor: gerarDicaMentor(dados.estado),
      sentimento: dados.estado
    };

    // Gerar atividades baseadas nas informações sem IA
    let novasAtividades = gerarAtividades(dados);

    // Garantir que temos pelo menos 3 tarefas
    if (novasAtividades.length < 3) {
      console.log("Gerando tarefas complementares no fallback para garantir mínimo de 3 tarefas");
      const tarefasComplementares = gerarTarefasComplementares(dados, novasAtividades.length);
      novasAtividades = [...novasAtividades, ...tarefasComplementares];
    }

    // Atualizar estados - garantindo que saia da interface de conclusão
    setFocoPrincipal(novoFocoPrincipal);
    setAtividades(novasAtividades);
    setTemFoco(true);
    setGerando(false);
    setTodasAtividadesConcluidas(false);
    setMostrarAnimacaoConclusao(false);

    // Salvar no localStorage para persistência
    localStorage.setItem('focoDia', JSON.stringify({
      focoPrincipal: novoFocoPrincipal,
      atividades: novasAtividades
    }));

    console.log("Foco do dia gerado com fallback (sem IA):", { novoFocoPrincipal, novasAtividades });
  };

  // Função para gerar dica baseada no estado emocional
  const gerarDicaMentor = (estado: string): string => {
    const dicas = {
      "Motivado(a)": "Aproveite seu ânimo atual para focar nos tópicos mais desafiadores primeiro!",
      "Um pouco perdido(a)": "Divida seu estudo em etapas menores e comemore cada progresso.",
      "Cansado(a)": "Alterne entre tópicos diferentes a cada 30 minutos para manter o foco.",
      "Ansioso(a)": "Pratique 2 minutos de respiração profunda antes de cada sessão de estudo."
    };

    return dicas[estado as keyof typeof dicas] || "Estabeleça pequenas metas e celebre cada conquista no seu estudo.";
  };

  // Função para gerar atividades com base nos dados do formulário (fallback quando a IA falhar)
  const gerarAtividades = (dados: FocoData): Atividade[] => {
    const tiposAtividade: ("video" | "exercicio" | "revisao" | "tarefa")[] = ["video", "exercicio", "revisao", "tarefa"];

    // Se o usuário selecionou tarefas específicas, incluí-las
    const atividadesTarefas = dados.tarefasSelecionadas.map((tarefa, index) => ({
      id: Date.now() + index,
      titulo: tarefa,
      tipo: "tarefa" as const,
      tempo: `${Math.floor(Math.random() * 30) + 15}min`,
      prazo: ["hoje", "amanhã", "esta semana"][Math.floor(Math.random() * 3)],
      urgente: Math.random() > 0.7,
      concluido: false,
      progresso: 0
    }));

    // Gerar atividades extras com base nas disciplinas
    const atividadesExtra = dados.disciplinas.slice(0, 3).map((disciplina, index) => {
      const tipo = tiposAtividade[Math.floor(Math.random() * tiposAtividade.length)];
      const titulos = {
        video: [`Assistir vídeo de ${disciplina}`, `Aula sobre conceitos de ${disciplina}`],
        exercicio: [`Exercícios de ${disciplina}`, `Resolver problemas de ${disciplina}`],
        revisao: [`Revisar anotações de ${disciplina}`, `Resumo do capítulo de ${disciplina}`],
        tarefa: [`Trabalho de ${disciplina}`, `Projeto de ${disciplina}`]
      };

      return {
        id: Date.now() + atividadesTarefas.length + index,
        titulo: titulos[tipo][Math.floor(Math.random() * 2)],
        tipo,
        tempo: `${Math.floor(Math.random() * 45) + 15}min`,
        prazo: ["hoje", "amanhã", "esta semana"][Math.floor(Math.random() * 3)],
        urgente: Math.random() > 0.7,
        concluido: false,
        progresso: 0
      };
    });

    // Garantir que tenhamos pelo menos 3 tarefas no total
    const atividades = [...atividadesTarefas, ...atividadesExtra];
    if (atividades.length < 3) {
      const tarefasComplementares = gerarTarefasComplementares(dados, atividades.length);
      return [...atividades, ...tarefasComplementares].slice(0, 4);
    }

    // Combinar todas as atividades e limitar a 4 no máximo
    return atividades.slice(0, 4);
  };

  // Função para gerar tarefas complementares quando não há tarefas suficientes
  const gerarTarefasComplementares = (dados: FocoData, quantidadeExistente: number): Atividade[] => {
    const tiposAtividade: ("video" | "exercicio" | "revisao" | "tarefa")[] = ["video", "exercicio", "revisao", "tarefa"];
    const quantidadeNecessaria = Math.max(3 - quantidadeExistente, 0);
    const tarefasComplementares: Atividade[] = [];

    // Lista de tarefas genéricas por tipo
    const tarefasGenericas = {
      video: [
        "Assistir vídeo explicativo sobre o tema principal",
        "Ver aula gravada sobre conceitos fundamentais",
        "Assistir tutorial prático relacionado ao assunto",
        "Visualizar explicação detalhada em vídeo",
        "Explorar videoaula complementar"
      ],
      exercicio: [
        "Resolver exercícios práticos do tema atual",
        "Completar lista de problemas relacionados",
        "Fazer exercícios de fixação do conteúdo",
        "Praticar com questionário sobre o tema",
        "Resolver desafios para testar conhecimentos"
      ],
      revisao: [
        "Revisar conceitos fundamentais do assunto",
        "Criar resumo dos principais tópicos",
        "Organizar anotações sobre o conteúdo",
        "Fazer revisão espaçada de temas anteriores",
        "Condensar informações em mapa mental"
      ],
      tarefa: [
        "Completar atividade pendente de alta prioridade",
        "Avançar no projeto atual",
        "Organizar materiais de estudo",
        "Preparar perguntas para próxima aula",
        "Pesquisar informações complementares"
      ]
    };

    // Gerar tarefas genéricas com base no objetivo e estado emocional
    for (let i = 0; i < quantidadeNecessaria; i++) {
      const tipo = tiposAtividade[Math.floor(Math.random() * tiposAtividade.length)];
      const opcoesTitulos = tarefasGenericas[tipo];
      const tituloIndex = Math.floor(Math.random() * opcoesTitulos.length);

      // Adicionar contexto do objetivo ou disciplinas se disponíveis
      let titulo = opcoesTitulos[tituloIndex];
      if (dados.disciplinas.length > 0) {
        const disciplina = dados.disciplinas[Math.floor(Math.random() * dados.disciplinas.length)];
        if (Math.random() > 0.3) { // 70% de chance de personalizar com a disciplina
          titulo += ` de ${disciplina}`;
        }
      }

      // Criar tarefa complementar
      tarefasComplementares.push({
        id: Date.now() + 1000 + i,
        titulo: titulo,
        tipo: tipo,
        tempo: `${Math.floor(Math.random() * 30) + 15}min`,
        prazo: dados.estado === "Ansioso(a)" ? "hoje" : ["hoje", "amanhã", "esta semana"][Math.floor(Math.random() * 3)],
        urgente: dados.estado === "Ansioso(a)" ? true : Math.random() > 0.6,
        concluido: false,
        progresso: 0
      });
    }

    console.log(`Geradas ${tarefasComplementares.length} tarefas complementares para atingir o mínimo de 3`);
    return tarefasComplementares;
  };

  // Função para lançar confete quando todas as tarefas forem concluídas
  const lancarConfete = () => {
    const duration = 1500;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FF6B00', '#FFA500', '#FFD700']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FF6B00', '#FFA500', '#FFD700']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  // Função para reiniciar o foco
  const redefinirFoco = () => {
    setModalAberto(true);
  };

  // Função para planejar foco do próximo dia
  const planejamentoFuturo = () => {
    // Manter a interface de comemoração visível durante o modal
    setModalAberto(true);
  };

  // Função para explorar biblioteca (simulação)
  const explorarBiblioteca = () => {
    // Em uma implementação real, redirecionaria para a biblioteca
    console.log("Redirecionando para a Biblioteca...");
  };

  // Efeito para lançar confete quando o estado de conclusão mudar para true
  useEffect(() => {
    if (mostrarAnimacaoConclusao) {
      lancarConfete();
    }
  }, [mostrarAnimacaoConclusao]);

  // Calcular progresso total das atividades
  const totalAtividades = atividades.length;
  const atividadesConcluidas = atividades.filter(a => a.concluido).length;
  const progressoTotal = totalAtividades > 0 ? (atividadesConcluidas / totalAtividades) * 100 : 0;
  const progressoAtividades = totalAtividades > 0 
    ? Math.round((atividadesConcluidas / totalAtividades) * 100) 
    : 0;

  // Renderizar estado de carregamento
  if (carregando) {
    return (
      <motion.div 
        className={`rounded-xl overflow-hidden ${isLightMode ? 'bg-white' : 'bg-gradient-to-br from-[#001e3a] to-[#00162b]'} shadow-lg ${isLightMode ? 'border border-gray-200' : 'border border-white/10'} h-full`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="h-full flex items-center justify-center p-8">
          <div className="animate-pulse flex flex-col items-center space-y-4 w-full">
            <div className="w-full flex justify-between items-center">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-md w-1/3"></div>
              <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            </div>
            <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg w-full"></div>
            <div className="space-y-3 w-full">
              <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-lg w-full"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-lg w-full"></div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Renderizar estado de geração de foco
  if (gerando) {
    return (
      <motion.div 
        className={`rounded-xl overflow-hidden ${isLightMode ? 'bg-white' : 'bg-gradient-to-br from-[#001e3a] to-[#00162b]'} shadow-lg ${isLightMode ? 'border border-gray-200' : 'border border-white/10'} h-full`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className={`p-5 ${isLightMode ? 'bg-gradient-to-r from-orange-50 to-orange-100/50' : 'bg-gradient-to-r from-[#0A2540]/80 to-[#001427]'} border-b ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/20'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg flex items-center justify-center ${isLightMode ? 'bg-white shadow-sm border border-orange-200' : 'bg-[#FF6B00]/10 border border-[#FF6B00]/30'}`}>
                <Flame className={`h-5 w-5 text-[#FF6B00] animate-pulse`} />
              </div>
              <div>
                <h3 className={`font-semibold text-lg ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                  Seu Foco Hoje
                </h3>
                <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>
                  <span className="font-medium">Programe o seu dia mais produtivo</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-full p-8 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className={`p-3 rounded-full ${isLightMode ? 'bg-orange-100' : 'bg-[#FF6B00]/20'}`}>
              <motion.div
                animate={{
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Clock className={`h-6 w-6 text-[#FF6B00]`} />
              </motion.div>
            </div>
            <div className="text-center space-y-2">
              <h4 className={`text-sm font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
                Organizando seu dia...
              </h4>
              <p className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'} max-w-xs`}>
                O Mentor IA está analisando suas preferências e criando seu plano de estudos personalizado.
              </p>
            </div>

            <div className="w-full max-w-xs mt-4">
              <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#FF6B00]"
                  animate={{
                    width: ['0%', '100%']
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      data-card-type="foco-hoje"
      className={`rounded-xl overflow-hidden ${isLightMode ? 'bg-white' : 'bg-gradient-to-br from-[#001e3a] to-[#00162b]'} shadow-lg ${isLightMode ? 'border border-gray-200' : 'border border-white/10'} h-full self-start flex flex-col overflow-y-auto grid-cell`}
      style={{ minHeight: '600px' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header elegante com gradiente */}
      <div className={`p-5 relative ${isLightMode ? 'bg-gradient-to-r from-orange-50 to-orange-100/50' : 'bg-gradient-to-r from-[#0A2540]/80 to-[#001427]'} border-b ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/20'}`}>
        {/* Barra de progresso interativa no topo */}
        <div className="absolute top-0 left-0 h-1 bg-[#FF6B00]/20 w-full overflow-hidden">
          <motion.div 
            className="h-full bg-[#FF6B00]" 
            initial={{ width: '0%' }}
            animate={{ width: `${progressoTotal}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg flex items-center justify-center ${isLightMode ? 'bg-white shadow-sm border border-orange-200' : 'bg-[#FF6B00]/10 border border-[#FF6B00]/30'}`}>
              <Trophy className={`h-5 w-5 text-[#FF6B00]`} />
            </div>
            <div>
              <h3 className={`font-semibold text-lg ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                {todasAtividadesConcluidas ? "Seu Foco Hoje: Concluído!" : "Seu Foco Hoje"}
              </h3>
              {!atividades || atividades.length === 0 ? (
                <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>
                  Programe o seu dia mais produtivo
                </p>
              ) : null}
              {temFoco && focoPrincipal && !todasAtividadesConcluidas && (
                <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>
                  <span className="font-bold text-[#FF6B00]">
                    {focoPrincipal.titulo}
                  </span>
                </p>
              )}
              {todasAtividadesConcluidas && (
                <p className={`text-xs ${isLightMode ? 'text-green-600' : 'text-green-400'}`}>
                  <span className="font-medium flex items-center">
                    <Check className="h-3 w-3 mr-1" /> Todas as atividades concluídas
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Indicador de progresso circular - mostrado apenas se houver atividades */}
          {totalAtividades > 0 && (
            <div className="hidden md:flex items-center">
              <div className="relative h-12 w-12 flex items-center justify-center">
                <svg className="absolute h-12 w-12" viewBox="0 0 44 44">
                  <circle 
                    cx="22" cy="22" r="20" 
                    fill="none" 
                    stroke={isLightMode ? "#f3f4f6" : "#1e293b"} 
                    strokeWidth="4"
                  />
                  <circle 
                    cx="22" cy="22" r="20" 
                    fill="none" 
                    stroke={todasAtividadesConcluidas ? "#10B981" : "#FF6B00"} 
                    strokeWidth="4"
                    strokeDasharray={126}
                    strokeDashoffset={126 - (progressoTotal / 100) * 126}
                    transform="rotate(-90 22 22)"
                    strokeLinecap="round"
                  />
                </svg>
                <span className={`font-bold text-sm ${isLightMode ? 'text-gray-700' : 'text-white'}`}>
                  {Math.round(progressoTotal)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="p-5">
        {/* Exibir foco principal quando definido */}
        {temFoco && focoPrincipal ? (
          <>
            {/* Informações do foco principal */}
            <div className={`mb-4 p-3 rounded-lg ${isLightMode ? 'bg-orange-50' : 'bg-[#FF6B00]/5'} border ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/20'}`}>
              <div className="flex gap-2 items-start">
                <div className={`mt-0.5 p-1.5 rounded-md ${isLightMode ? 'bg-orange-100' : 'bg-[#FF6B00]/20'}`}>
                  <Target className="h-3.5 w-3.5 text-[#FF6B00]" />
                </div>
                <div>
                  <p className={`text-xs ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                    <span className="font-medium">Foco principal:</span> {focoPrincipal.descricao}
                  </p>
                  {focoPrincipal.disciplinas.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {focoPrincipal.disciplinas.map((disciplina, idx) => (
                        <span 
                          key={idx} 
                          className={`text-xs px-2 py-0.5 rounded-full ${isLightMode ? 'bg-blue-100 text-blue-700' : 'bg-blue-900/30 text-blue-400'}`}
                        >
                          {disciplina}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botão de configurações removido conforme solicitado */}

            {/* Estado de conclusão e animações */}
            <AnimatePresence>
              {mostrarAnimacaoConclusao && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-xl"
                >
                  <motion.div 
                    className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg flex flex-col items-center"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    <Trophy className="h-12 w-12 text-[#FF6B00] mb-2" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Parabéns!</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                      Você concluiu todas as tarefas do seu foco de hoje!
                    </p>
                    <div className="mt-2 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full flex items-center gap-1">
                      <Flame className="h-4 w-4 text-[#FF6B00]" />
                      <span className="text-sm font-medium text-[#FF6B00]">+{pontosGanhos} Ponto Coins!</span>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lista de atividades ou mensagem de conclusão */}
            {!todasAtividadesConcluidas ? (
              <div className="space-y-2.5">
                {atividades.map((atividade, index) => (
                  <motion.div 
                    key={atividade.id} 
                    className={`relative group flex items-start p-3 rounded-lg border ${isLightMode ? 'border-gray-100 hover:border-orange-200' : 'border-gray-700/30 hover:border-[#FF6B00]/30'} ${isLightMode ? 'hover:bg-orange-50/50' : 'hover:bg-[#FF6B00]/5'} transition-all cursor-pointer`}
                    whileHover={{ y: -2 }}
                    onMouseEnter={() => setHoverIndex(index)}
                    onMouseLeave={() => setHoverIndex(null)}
                  >
                    {/* Indicador de prioridade para tarefas urgentes */}
                    {atividade.urgente && (
                      <div className="absolute top-0 right-0">
                        <div className={`w-2 h-2 rounded-full ${isLightMode ? 'bg-red-500' : 'bg-red-400'} animate-pulse mr-1 mt-1`}></div>
                      </div>
                    )}

                    <div 
                      className={`h-5 w-5 rounded-full flex items-center justify-center mr-3 border ${
                        atividade.concluido 
                          ? (isLightMode ? 'bg-[#FF6B00] border-[#FF6B00]' : 'bg-[#FF6B00] border-[#FF6B00]') 
                          : (isLightMode ? 'border-gray-300 bg-white' : 'border-gray-600 bg-transparent')
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAtividade(atividade.id);
                      }}
                    >
                      {atividade.concluido && <Check className="h-3 w-3 text-white" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start gap-1.5">
                        <div className={`p-1 rounded mt-0.5 ${isLightMode ? 'bg-gray-100' : 'bg-gray-700/30'}`}>
                          {atividade.tipo === 'video' && <Play className="h-3 w-3 text-blue-500" />}
                          {atividade.tipo === 'exercicio' && <BookOpen className="h-3 w-3 text-green-500" />}
                          {atividade.tipo === 'revisao' && <Clock className="h-3 w-3 text-[#FF6B00]" />}
                          {atividade.tipo === 'tarefa' && <Check className="h-3 w-3 text-purple-500" />}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${atividade.concluido ? 'line-through opacity-70' : ''} ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
                            {atividade.titulo}
                          </p>
                          <div className="flex items-center mt-1.5 gap-3">
                            <span className={`text-xs flex items-center gap-1 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              <Clock className="h-3 w-3" /> {atividade.tempo}
                            </span>
                            <span className={`text-xs ${atividade.urgente ? (isLightMode ? 'text-red-600 font-medium' : 'text-red-400 font-medium') : (isLightMode ? 'text-gray-500' : 'text-gray-400')}`}>
                              {atividade.prazo}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress bar for individual activities */}
                      <div className="mt-2">
                        <Progress value={atividade.progresso} 
                          className={`h-1 ${atividade.progresso > 0 ? "opacity-100" : "opacity-0"} ${hoverIndex === index ? "opacity-100" : ""} transition-opacity`} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                className={`overflow-hidden rounded-lg ${isLightMode ? 'bg-gradient-to-b from-green-50 to-white border border-green-100' : 'bg-gradient-to-b from-green-900/15 to-[#001e3a]/60 border border-green-700/20'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Cabeçalho estilizado com gradiente */}
                <div className={`h-2 w-full ${isLightMode ? 'bg-gradient-to-r from-green-400 to-emerald-300' : 'bg-gradient-to-r from-green-500 to-emerald-400'}`}></div>

                <div className="p-5">
                  <div className="flex flex-col items-center text-center">
                    <div className={`p-3 rounded-full ${isLightMode ? 'bg-gradient-to-br from-green-100 to-green-200' : 'bg-gradient-to-br from-green-800/30 to-green-700/20'} mb-3 shadow-sm`}>
                      <Trophy className="h-7 w-7 text-green-500 dark:text-green-400" />
                    </div>

                    <h3 className={`text-xl font-bold ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                      Foco do Dia: <span className="text-green-500 dark:text-green-400">CONCLUÍDO!</span> 🎉
                    </h3>

                    <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-300'} mt-2 max-w-xs`}>
                      Parabéns! Você completou todas as atividades do seu foco de hoje com sucesso!
                    </p>

                    <div className={`mt-3 px-3 py-1 rounded-full ${isLightMode ? 'bg-green-100' : 'bg-green-900/20'} flex items-center gap-1`}>
                      <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-300">
                        {atividades.length} atividades concluídas
                      </span>
                    </div>

                    {focoPrincipal && (
                      <div className="mt-3 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-pulse"></div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Próximo foco: Revisão de <span className="font-medium">{focoPrincipal.disciplinas[0] || "seu material"}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <motion.button 
                      onClick={planejamentoFuturo}
                      className={`rounded-lg p-3 text-xs font-medium ${isLightMode ? 'bg-[#FF6B00] text-white hover:bg-[#FF7B10]' : 'bg-[#FF6B00] text-white hover:bg-[#FF7B10]'} flex items-center justify-center gap-1.5 transition-colors shadow-sm`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Clock className="h-4 w-4" />
                      Planejar Amanhã
                    </motion.button>

                    <motion.button 
                      disabled
                      className={`rounded-lg p-3 text-xs font-medium ${isLightMode ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-800/50 border border-gray-700/50 text-gray-500 cursor-not-allowed'} flex items-center justify-center gap-1.5 shadow-sm opacity-60`}
                    >
                      <BookOpen className="h-4 w-4" />
                      Explorar Biblioteca
                    </motion.button>
                  </div>

                  {/* Dica do mentor removida conforme solicitado */}
                </div>
              </motion.div>
            )}

            
          </>
        ) : (
          <>
            {/* Mensagem de boas-vindas removida conforme solicitado */}

            {/* Estado vazio - Design moderno e sofisticado */}
            <div className="py-6 flex flex-col items-center justify-center space-y-6">
              {/* Elemento gráfico circular com gradiente e glow */}
              <div className="relative">
                <div className={`absolute inset-0 rounded-full ${isLightMode ? 'bg-orange-300/20' : 'bg-[#FF6B00]/20'} blur-xl -z-10 scale-125`}></div>
                <div className={`p-5 rounded-full ${isLightMode 
                  ? 'bg-gradient-to-br from-orange-50 to-orange-100 shadow-sm' 
                  : 'bg-gradient-to-br from-[#FF6B00]/20 to-[#FF8C40]/10 border border-[#FF6B00]/30'}`}>
                  <Target className={`h-7 w-7 text-[#FF6B00]`} strokeWidth={1.5} />
                </div>
              </div>

              {/* Texto principal com design mais elegante */}
              <div className="text-center space-y-4 max-w-[80%]">
                <h3 className={`text-lg font-semibold ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                  Defina seu foco de estudos
                </h3>
                <p className={`text-sm leading-relaxed ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                  Organize seu dia priorizando o que realmente importa para seus estudos
                </p>
              </div>

              {/* Etapas - visual elegante */}
              <div className={`w-4/5 mt-2 ${isLightMode ? 'bg-orange-50/70' : 'bg-[#FF6B00]/5'} rounded-xl p-4 border ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/20'}`}>
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isLightMode ? 'bg-white text-orange-500 border border-orange-200' : 'bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30'}`}>
                      <span className="text-xs font-medium">1</span>
                    </div>
                    <p className={`text-xs ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>Defina objetivos e disciplinas prioritárias</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isLightMode ? 'bg-white text-orange-500 border border-orange-200' : 'bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30'}`}>
                      <span className="text-xs font-medium">2</span>
                    </div>
                    <p className={`text-xs ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>Organize tarefas em ordem de prioridade</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isLightMode ? 'bg-white text-orange-500 border border-orange-200' : 'bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30'}`}>
                      <span className="text-xs font-medium">3</span>
                    </div>
                    <p className={`text-xs ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>Acompanhe seu progresso durante o dia</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Footer com botão de ação e métricas */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700/30 flex justify-between items-center relative">
          {atividades.length > 0 ? (
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full border ${
                todasAtividadesConcluidas
                  ? (isLightMode ? 'border-green-500 bg-green-500' : 'border-green-500 bg-green-500')
                  : (isLightMode ? 'border-gray-300 bg-white' : 'border-gray-600 bg-transparent')
              } flex items-center justify-center`}>
                {todasAtividadesConcluidas ? (
                  <Check className="h-3 w-3 text-white" />
                ) : (
                  <span className={`text-xs font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                    {atividadesConcluidas}
                  </span>
                )}
              </div>
              {todasAtividadesConcluidas ? (
              <div className="flex items-center gap-2">
                <span className={`text-xs ${isLightMode ? 'text-green-600 font-medium' : 'text-green-400 font-medium'}`}>
                  Todas as atividades concluídas!
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    // Limpar o estado local
                    setAtividades([]);
                    setFocoPrincipal(null);
                    setTemFoco(false);
                    setTodasAtividadesConcluidas(false);
                    // Limpar o localStorage
                    localStorage.removeItem('focoDia');
                  }}
                  className={`ml-1 flex items-center justify-center rounded-full p-1 transition-colors ${
                    isLightMode 
                      ? 'hover:bg-orange-100 text-orange-500' 
                      : 'hover:bg-[#FF6B00]/20 text-[#FF6B00]'
                  }`}
                  title="Reiniciar card"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <path d="M3 3v5h5"></path>
                  </svg>
                </button>
              </div>
              ) : (
              <span className={`text-xs ${todasAtividadesConcluidas ? (isLightMode ? 'text-green-600 font-medium' : 'text-green-400 font-medium') : (isLightMode ? 'text-gray-500' : 'text-gray-400')}`}>
                {`${atividadesConcluidas} de ${totalAtividades} atividades`}
              </span>
              )}

              {/* Indicador de sentimento posicionado ao lado da contagem de atividades */}
              {temFoco && focoPrincipal?.sentimento && !todasAtividadesConcluidas && (
                <div className="flex items-center">
                  <div className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full flex items-center gap-1 ml-2">
                    {focoPrincipal.sentimento === "Motivado(a)" && <Smile className="h-3 w-3" />}
                    {focoPrincipal.sentimento === "Um pouco perdido(a)" && <HelpCircle className="h-3 w-3" />}
                    {focoPrincipal.sentimento === "Cansado(a)" && <Clock className="h-3 w-3" />}
                    {focoPrincipal.sentimento === "Ansioso(a)" && <BarChart2 className="h-3 w-3" />}
                    <span>{focoPrincipal.sentimento}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Limpar o estado local
                      setAtividades([]);
                      setFocoPrincipal(null);
                      setTemFoco(false);
                      setTodasAtividadesConcluidas(false);
                      // Limpar o localStorage
                      localStorage.removeItem('focoDia');
                    }}
                    className={`ml-1 flex items-center justify-center rounded-full p-1 transition-colors ${
                      isLightMode 
                        ? 'hover:bg-orange-100 text-orange-500' 
                        : 'hover:bg-[#FF6B00]/20 text-[#FF6B00]'
                    }`}
                    title="Reiniciar card"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                      <path d="M3 3v5h5"></path>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div></div> // Espaçador para manter o layout com justify-between
          )}

          {!todasAtividadesConcluidas ? (
              atividades.length > 0 ? (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                // Limpar o estado local
                setAtividades([]);
                setFocoPrincipal(null);
                setTemFoco(false);
                setTodasAtividadesConcluidas(false);
                // Limpar o localStorage
                localStorage.removeItem('focoDia');
              }}
              className={`rounded-lg px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white shadow-sm hover:shadow-md transition-all flex items-center gap-2 ${isLightMode ? '' : 'border border-[#FF6B00]/40'}`}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              initial={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}
              animate={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}
              whileHover={{
                boxShadow: "0 4px 12px rgba(255, 107, 0, 0.25)",
                scale: 1.03,
                y: -1
              }}
            >
              Excluir Objetivos
              <Trash2 className="h-4 w-4 opacity-80" />
            </motion.button>
              ) : (
            <motion.button 
              onClick={() => setModalAberto(true)}
              className={`rounded-lg px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white shadow-sm hover:shadow-md transition-all flex items-center gap-2 ${isLightMode ? '' : 'border border-[#FF6B00]/40'}`}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              initial={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}
              animate={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}
              whileHover={{ 
                boxShadow: "0 4px 12px rgba(255, 107, 0, 0.25)",
                scale: 1.03, 
                y: -1 
              }}
            >
              {atividades.length > 0 ? "Iniciar Foco" : "Definir Foco"}
              <Target className="h-4 w-4 opacity-80" />
            </motion.button>
              )
          ) : (
            <motion.button 
              onClick={redefinirFoco}
              className={`rounded-lg px-4 py-2 text-xs font-medium bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-200 shadow-sm hover:shadow-md transition-all flex items-center gap-1.5`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Definir Novo Foco
              <PlusCircle className="h-3 w-3" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Modal para definir o foco */}
      <AnimatePresence>
        {modalAberto && (
          <>
            <DefinirFocoModal 
              open={modalAberto}
              onClose={() => setModalAberto(false)}
              onSave={processarDefinicaoFoco}
            />
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}