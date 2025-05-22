import React, { useState, useEffect } from "react";
import { X, Target, BookOpen, Clock, Smile, HelpCircle, BarChart2, Check, PlusCircle, Search, Zap } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface DefinirFocoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (focoData: FocoData) => void;
}

export interface FocoData {
  objetivo: string;
  objetivoPersonalizado?: string;
  disciplinas: string[];
  topicoEspecifico?: string;
  tempoEstudo: number;
  tarefasSelecionadas: string[];
  estado: string;
}

const objetivosEstudo = [
  "Preparação para Prova",
  "Avançar em Nova Matéria",
  "Revisão de Tópicos",
  "Concluir Tarefas Pendentes",
  "Outro Objetivo (Personalizado)"
];

// Lista de disciplinas padrão para novos usuários
const disciplinasPadrao = [
  { nome: "Matemática", tag: "Recomendado" },
  { nome: "Física", tag: "Popular" },
  { nome: "Química", tag: "Popular" },
  { nome: "Biologia", tag: "Recomendado" },
  { nome: "História", tag: "Popular" },
  { nome: "Geografia", tag: "" },
  { nome: "Português", tag: "Recomendado" },
  { nome: "Literatura", tag: "Popular" },
  { nome: "Inglês", tag: "" },
  { nome: "Filosofia", tag: "" },
  { nome: "Sociologia", tag: "" },
  { nome: "Educação Física", tag: "" },
  { nome: "Artes", tag: "" },
  { nome: "Informática", tag: "" }
];

// Sugestões de tarefas genéricas para novos usuários
const sugestoesFocoPadrao = [
  { titulo: "Revisar anotações da última aula", descricao: "Revisão dos principais conceitos discutidos", prioridade: "média", prazo: "hoje" },
  { titulo: "Resolver exercícios pendentes", descricao: "Completar lista de problemas designados", prioridade: "alta", prazo: "hoje" },
  { titulo: "Leitura do próximo capítulo", descricao: "Preparar-se para a próxima aula", prioridade: "baixa", prazo: "em 2 dias" },
  { titulo: "Fazer resumo do conteúdo da semana", descricao: "Consolidar conhecimentos", prioridade: "média", prazo: "esta semana" }
];

const DefinirFocoModal: React.FC<DefinirFocoModalProps> = ({ open, onClose, onSave }) => {
  const { theme } = useTheme();
  const isLightMode = theme === "light";

  // Estados para controlar a navegação entre etapas
  const [etapaAtual, setEtapaAtual] = useState<number>(1);

  // Estados para armazenar as informações do foco
  const [objetivo, setObjetivo] = useState<string>(objetivosEstudo[0]);
  const [objetivoPersonalizado, setObjetivoPersonalizado] = useState<string>("");
  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState<string[]>([]);
  const [topicoEspecifico, setTopicoEspecifico] = useState<string>("");
  const [tempoEstudo, setTempoEstudo] = useState<number>(120); // em minutos
  const [tarefasSelecionadas, setTarefasSelecionadas] = useState<string[]>([]);
  const [estadoAtual, setEstadoAtual] = useState<string>("Motivado(a)");

  // Estados auxiliares
  const [novaTarefa, setNovaTarefa] = useState<string>("");
  const [disciplinas, setDisciplinas] = useState<{ nome: string; tag: string; }[]>(disciplinasPadrao);
  const [sugestoesTarefas, setSugestoesTarefas] = useState<{ titulo: string; descricao: string; prioridade: string; prazo: string; }[]>(sugestoesFocoPadrao);
  const [carregandoSugestoes, setCarregandoSugestoes] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Carregar dados do usuário ao abrir o modal
  useEffect(() => {
    if (open) {
      carregarDadosUsuario();
    }
  }, [open]);

  // Função para carregar dados personalizados do usuário
  const carregarDadosUsuario = async () => {
    try {
      setCarregandoSugestoes(true);

      // Obter ID do usuário atual
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;
      setUserId(currentUserId);

      if (!currentUserId) {
        console.log("Usuário não autenticado, usando dados padrão");
        resetarParaDadosPadrao();
        setCarregandoSugestoes(false);
        return;
      }

      // Carregar perfil do usuário
      const { getUserFullProfile } = await import('@/services/userProfileService');
      const perfil = await getUserFullProfile();

      // Carregar eventos e tarefas do usuário para gerar sugestões relevantes
      const { getEventsByUserId } = await import('@/services/calendarEventService');
      const { getTasksByUserId } = await import('@/services/taskService');

      // Obter a data de hoje e da próxima semana para filtrar eventos relevantes
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const proximaSemana = new Date(hoje);
      proximaSemana.setDate(hoje.getDate() + 7);

      // Buscar todos os eventos
      const todosEventos = await getEventsByUserId(currentUserId);

      // Filtrar apenas eventos futuros (hoje e próximos dias)
      const eventos = todosEventos.filter(evento => {
        if (!evento.startDate) return false;
        const dataEvento = new Date(evento.startDate);
        return dataEvento >= hoje;
      });

      // Ordenar eventos por data
      eventos.sort((a, b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });

      // Buscar tarefas
      const todasTarefas = await getTasksByUserId(currentUserId);

      // Filtrar apenas tarefas não concluídas
      const tarefas = todasTarefas.filter(tarefa => 
        tarefa.status === 'todo' || tarefa.status === 'in-progress'
      );

      // Ordenar tarefas por prioridade e prazo
      tarefas.sort((a, b) => {
        // Primeiro por prioridade (high > medium > low)
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                            (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);

        if (priorityDiff !== 0) return priorityDiff;

        // Depois por prazo, se ambos tiverem
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }

        // Colocar tarefas com prazo antes das sem prazo
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;

        return 0;
      });

      // Gerar disciplinas personalizadas com base nos eventos, tarefas e perfil
      let disciplinasPersonalizadas: { nome: string, tag: string }[] = [];
      const disciplinasMap = new Map<string, { nome: string, tag: string, contagem: number }>();

      // Adicionar disciplinas padrão com contagem zero inicialmente
      disciplinasPadrao.forEach(d => {
        disciplinasMap.set(d.nome, { ...d, contagem: 0 });
      });

      // Extrair e contar disciplinas dos eventos
      if (eventos && eventos.length > 0) {
        eventos
          .filter(evento => evento.discipline)
          .forEach(evento => {
            const disciplina = evento.discipline as string;
            if (disciplina) {
              const existente = disciplinasMap.get(disciplina);
              if (existente) {
                disciplinasMap.set(disciplina, { ...existente, contagem: existente.contagem + 1, tag: "Da sua agenda" });
              } else {
                disciplinasMap.set(disciplina, { nome: disciplina, tag: "Da sua agenda", contagem: 1 });
              }
            }
          });
      }

      // Extrair e contar categorias das tarefas como disciplinas
      if (tarefas && tarefas.length > 0) {
        tarefas
          .filter(tarefa => tarefa.category)
          .forEach(tarefa => {
            const categoria = tarefa.category as string;
            if (categoria) {
              const existente = disciplinasMap.get(categoria);
              if (existente) {
                disciplinasMap.set(categoria, { 
                  ...existente, 
                  contagem: existente.contagem + 1, 
                  tag: existente.tag === "Da sua agenda" ? "Da sua agenda" : "Das suas tarefas" 
                });
              } else {
                disciplinasMap.set(categoria, { nome: categoria, tag: "Das suas tarefas", contagem: 1 });
              }
            }
          });
      }

      // Adicionar disciplinas do perfil do usuário, se disponíveis
      if (perfil && perfil.interests && Array.isArray(perfil.interests)) {
        perfil.interests.forEach(interesse => {
          if (typeof interesse === 'string') {
            const existente = disciplinasMap.get(interesse);
            if (existente) {
              disciplinasMap.set(interesse, { 
                ...existente, 
                contagem: existente.contagem + 1, 
                tag: existente.tag || "Do seu perfil" 
              });
            } else {
              disciplinasMap.set(interesse, { nome: interesse, tag: "Do seu perfil", contagem: 1 });
            }
          }
        });
      }

      // Converter mapa para array e ordenar por contagem e depois tag (para dar prioridade a itens da agenda)
      disciplinasPersonalizadas = Array.from(disciplinasMap.values())
        .sort((a, b) => {
          // Primeiro por contagem (descendente)
          if (b.contagem !== a.contagem) {
            return b.contagem - a.contagem;
          }

          // Depois por fonte (agenda > tarefas > perfil > padrão)
          const tagPrioridade = {
            "Da sua agenda": 4,
            "Das suas tarefas": 3,
            "Do seu perfil": 2,
            "Recomendado": 1,
            "Popular": 0
          };

          const aValor = tagPrioridade[a.tag as keyof typeof tagPrioridade] || 0;
          const bValor = tagPrioridade[b.tag as keyof typeof tagPrioridade] || 0;

          return bValor - aValor;
        })
        .map(({ nome, tag }) => ({ nome, tag }));

      // Gerar sugestões de tarefas a partir das tarefas pendentes
      let sugestoesPersonalizadas: any[] = [];

      // Adicionar tarefas pendentes como sugestões
      if (tarefas && tarefas.length > 0) {
        const tarefasPendentes = tarefas.map(tarefa => ({
          titulo: tarefa.title,
          descricao: tarefa.description || "Completar esta tarefa pendente",
          prioridade: tarefa.priority === 'high' ? "alta" : (tarefa.priority === 'medium' ? "média" : "baixa"),
          prazo: tarefa.dueDate ? "até " + new Date(tarefa.dueDate).toLocaleDateString() : "em breve"
        }));

        sugestoesPersonalizadas = [...tarefasPendentes];
      }

      // Adicionar sugestões baseadas em eventos próximos
      if (eventos && eventos.length > 0) {
        const eventosProximos = eventos.filter(evento => {
          const dataEvento = new Date(evento.startDate);
          return dataEvento >= hoje && dataEvento <= proximaSemana;
        });

        const sugestoesDeEventos = eventosProximos.map(evento => ({
          titulo: `Preparar para: ${evento.title}`,
          descricao: evento.description || `Evento agendado para ${new Date(evento.startDate).toLocaleDateString()}`,
          prioridade: new Date(evento.startDate).getTime() - hoje.getTime() < 3 * 24 * 60 * 60 * 1000 ? "alta" : "média",
          prazo: `até ${new Date(evento.startDate).toLocaleDateString()}`
        }));

        // Adicionar sugestões de eventos
        sugestoesPersonalizadas = [...sugestoesPersonalizadas, ...sugestoesDeEventos];
      }

      // Se não houver sugestões personalizadas suficientes, usar as padrão
      if (sugestoesPersonalizadas.length < 3) {
        sugestoesPersonalizadas = [...sugestoesPersonalizadas, ...sugestoesFocoPadrao.slice(0, 4 - sugestoesPersonalizadas.length)];
      }

      // Ordenar sugestões por prioridade
      sugestoesPersonalizadas.sort((a, b) => {
        const prioridadeOrdem = { alta: 3, média: 2, baixa: 1 };
        return (prioridadeOrdem[b.prioridade as keyof typeof prioridadeOrdem] || 0) - 
               (prioridadeOrdem[a.prioridade as keyof typeof prioridadeOrdem] || 0);
      });

      // Atualizar os estados com dados personalizados
      setDisciplinas(disciplinasPersonalizadas);
      setSugestoesTarefas(sugestoesPersonalizadas);

      console.log("Dados personalizados carregados para o modal de Foco:", {
        disciplinas: disciplinasPersonalizadas.length,
        sugestoes: sugestoesPersonalizadas.length,
        eventos: eventos.length,
        tarefas: tarefas.length
      });
    } catch (error) {
      console.error("Erro ao carregar dados personalizados:", error);
      resetarParaDadosPadrao();
    } finally {
      setCarregandoSugestoes(false);
    }
  };

  // Resetar para dados padrão em caso de erro ou usuário não autenticado
  const resetarParaDadosPadrao = () => {
    setDisciplinas(disciplinasPadrao);
    setSugestoesTarefas(sugestoesFocoPadrao);
  };

  // Reset do modal quando é aberto
  useEffect(() => {
    if (open) {
      setEtapaAtual(1);
      setObjetivo(objetivosEstudo[0]);
      setObjetivoPersonalizado("");
      setDisciplinasSelecionadas([]);
      setTopicoEspecifico("");
      setTempoEstudo(120);
      setTarefasSelecionadas([]);
      setEstadoAtual("Motivado(a)");
      setNovaTarefa("");
    }
  }, [open]);

  // Função para alternar a seleção de disciplinas
  const toggleDisciplina = (disciplina: string) => {
    if (disciplinasSelecionadas.includes(disciplina)) {
      setDisciplinasSelecionadas(disciplinasSelecionadas.filter(d => d !== disciplina));
    } else {
      setDisciplinasSelecionadas([...disciplinasSelecionadas, disciplina]);
    }
  };

  // Função para adicionar uma nova tarefa à lista
  const adicionarTarefa = () => {
    if (novaTarefa.trim() !== "") {
      setTarefasSelecionadas([...tarefasSelecionadas, novaTarefa.trim()]);
      setNovaTarefa("");
    }
  };

  // Função para remover uma tarefa da lista
  const removerTarefa = (index: number) => {
    const novasTarefas = [...tarefasSelecionadas];
    novasTarefas.splice(index, 1);
    setTarefasSelecionadas(novasTarefas);
  };

  // Função para adicionar uma sugestão de tarefa à lista
  const adicionarSugestao = (titulo: string) => {
    if (!tarefasSelecionadas.includes(titulo)) {
      setTarefasSelecionadas([...tarefasSelecionadas, titulo]);
    }
  };

  const toggleTarefaSugerida = (titulo: string) => {
    if (tarefasSelecionadas.includes(titulo)) {
      setTarefasSelecionadas(tarefasSelecionadas.filter(tarefa => tarefa !== titulo));
    } else {
      setTarefasSelecionadas([...tarefasSelecionadas, titulo]);
    }
  };

  // Função para formatar o tempo de estudo para exibição
  const formatarTempoEstudo = (minutos: number): string => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas > 0 ? `${horas}h` : ""} ${mins > 0 ? `${mins}min` : ""}`.trim();
  };

  // Função para avançar para a próxima etapa
  const avancarEtapa = () => {
    if (etapaAtual < 3) {
      setEtapaAtual(etapaAtual + 1);
    } else {
      finalizarDefinicao();
    }
  };

  // Função para retornar à etapa anterior
  const voltarEtapa = () => {
    if (etapaAtual > 1) {
      setEtapaAtual(etapaAtual - 1);
    } else {
      onClose();
    }
  };

  // Função para atualizar as sugestões com base nas seleções atuais
  const atualizarSugestoes = async () => {
    if (!userId) return;

    setCarregandoSugestoes(true);

    try {
      // Podemos fazer uma chamada para a API Gemini com os dados atuais para gerar sugestões mais relevantes
      // Simplificando, apenas vamos filtrar as sugestões com base nas disciplinas selecionadas

      if (disciplinasSelecionadas.length > 0) {
        // Se o usuário já selecionou disciplinas, gerar sugestões mais específicas
        const novasSugestoes = disciplinasSelecionadas.flatMap(disciplina => [
          {
            titulo: `Revisar conceitos de ${disciplina}`,
            descricao: `Consolidar conhecimentos fundamentais`,
            prioridade: "média",
            prazo: "esta semana"
          },
          {
            titulo: `Exercícios práticos de ${disciplina}`,
            descricao: `Aplicar os conceitos estudados`,
            prioridade: "alta",
            prazo: "em 3 dias"
          }
        ]);

        // Mesclar com algumas sugestões padrão
        setSugestoesTarefas([
          ...novasSugestoes.slice(0, 3),
          ...sugestoesFocoPadrao.slice(0, 1)
        ]);
      }
    } catch (error) {
      console.error("Erro ao atualizar sugestões:", error);
    } finally {
      setCarregandoSugestoes(false);
    }
  };

  // Atualizar sugestões quando as disciplinas selecionadas mudarem
  useEffect(() => {
    if (disciplinasSelecionadas.length > 0) {
      atualizarSugestoes();
    }
  }, [disciplinasSelecionadas]);

  // Função para finalizar a definição e salvar os dados
  const finalizarDefinicao = () => {
    const focoData: FocoData = {
      objetivo,
      objetivoPersonalizado: objetivo === "Outro Objetivo (Personalizado)" ? objetivoPersonalizado : undefined,
      disciplinas: disciplinasSelecionadas,
      topicoEspecifico: topicoEspecifico || undefined,
      tempoEstudo,
      tarefasSelecionadas,
      estado: estadoAtual
    };

    onSave(focoData);
  };

return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className={`sm:max-w-[600px] max-h-[90vh] overflow-y-auto ${isLightMode ? 'bg-white' : 'bg-[#0A2540]'}`}>
        {/* Cabeçalho do Modal - Redesenhado com estilo premium */}
        <div className="flex justify-between items-center mb-7 relative">
          {/* Efeitos de fundo */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-orange-300/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-blue-500/5 to-purple-300/10 rounded-full blur-xl pointer-events-none"></div>
          
          {/* Título Premium com ícone */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${isLightMode ? 'from-amber-50 to-orange-100' : 'from-[#FF6B00]/20 to-[#FF8C40]/10'} border ${isLightMode ? 'border-orange-200/60' : 'border-[#FF6B00]/20'} shadow-sm`}>
              <Target className="h-6 w-6 text-[#FF6B00]" />
            </div>
            
            <div className="relative">
              <h2 className={`relative text-xl font-bold tracking-tight ${isLightMode ? 'text-gray-900' : 'text-white'} flex flex-col`}>                
                <span className="flex items-center gap-2">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200">Defina Seu Foco de Estudos</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#FF6B00]/20 to-[#FF8C40]/20 text-[#FF6B00] shadow-sm">
                    Personalizado
                  </span>
                </span>
              </h2>
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF6B00]/50 via-[#FF8C40]/30 to-transparent rounded-full"></div>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-full ${isLightMode ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-800 hover:bg-gray-700'} transition-all shadow-sm`}
          >
            <X className={`h-4 w-4 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`} />
          </button>
        </div>

        {/* Progresso - Redesenhado com estilo premium */}
        <div className="mb-8 relative">
          <div className="flex justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center ${isLightMode ? 'bg-[#FF6B00]/10' : 'bg-[#FF6B00]/20'}`}>
                <span className="text-xs font-semibold text-[#FF6B00]">{etapaAtual}</span>
              </div>
              <p className={`text-sm font-medium ${isLightMode ? 'text-gray-800' : 'text-gray-200'}`}>
                Etapa {etapaAtual} de 3
              </p>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              isLightMode 
                ? 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-200/80' 
                : 'bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300 border border-gray-700/80'
            } shadow-sm`}>
              {
                etapaAtual === 1 ? "Definindo Objetivo" :
                etapaAtual === 2 ? "Selecionando Disciplinas" :
                etapaAtual === 3 ? "Definindo Tempo" :
                "Finalização"
              }
            </div>
          </div>
          
          <div className="relative w-full h-1.5 bg-gray-200 dark:bg-gray-700/50 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-full"
              style={{ width: `${(etapaAtual / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Conteúdo dinâmico baseado na etapa atual */}
        <div className="space-y-6 mb-8">
          {etapaAtual === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${isLightMode ? 'text-gray-800' : 'text-white'} flex items-center gap-2.5`}>
                  <span className={`p-2 rounded-lg shadow-sm ${isLightMode ? 'bg-gradient-to-br from-orange-50 to-orange-100/80' : 'bg-gradient-to-br from-[#FF6B00]/15 to-[#FF6B00]/5'} border ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/10'}`}>
                    <Target className="h-4 w-4 text-[#FF6B00]" />
                  </span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300">
                    Selecione seu objetivo principal de estudo
                  </span>
                </h3>

                <div className="grid grid-cols-1 gap-2.5">
                  {objetivosEstudo.map((opcao, index) => (
                    <button
                      key={opcao}
                      type="button"
                      onClick={() => setObjetivo(opcao)}
                      className={`group flex items-center p-3.5 rounded-lg border transition-all ${
                        objetivo === opcao
                          ? isLightMode
                            ? 'border-[#FF6B00] bg-gradient-to-r from-orange-50 to-orange-100/70 text-[#FF6B00] shadow-sm'
                            : 'border-[#FF6B00]/70 bg-gradient-to-r from-[#FF6B00]/10 to-[#FF6B00]/5 text-white shadow-sm'
                          : isLightMode
                          ? 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                          : 'border-gray-700/50 text-gray-300 hover:bg-gray-800/30 hover:border-gray-600'
                      }`}
                    >
                      <div className={`mr-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        objetivo === opcao
                          ? 'bg-[#FF6B00] text-white'
                          : isLightMode 
                            ? 'bg-gray-100 text-gray-500 group-hover:bg-gray-200' 
                            : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-left">{opcao}</span>
                    </button>
                  ))}
                </div>
              </div>

              {objetivo === "Outro Objetivo (Personalizado)" && (
                <div className={`p-4 rounded-lg ${isLightMode ? 'bg-gray-50' : 'bg-gray-800/20'} border ${isLightMode ? 'border-gray-200' : 'border-gray-700/50'}`}>
                  <label
                    htmlFor="objetivo-personalizado"
                    className={`block text-sm font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}
                  >
                    Descreva seu objetivo personalizado
                  </label>
                  <textarea
                    id="objetivo-personalizado"
                    value={objetivoPersonalizado}
                    onChange={(e) => setObjetivoPersonalizado(e.target.value)}
                    placeholder="Ex: Revisar conteúdo para a prova final"
                    className={`w-full rounded-lg p-3 ${
                      isLightMode
                        ? 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-[#FF6B00] focus:ring-[#FF6B00]/20'
                        : 'border-gray-700 bg-gray-800/30 text-white placeholder-gray-500 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10'
                    }`}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          {etapaAtual === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${isLightMode ? 'text-gray-800' : 'text-white'} flex items-center gap-2.5`}>
                  <span className={`p-2 rounded-lg shadow-sm ${isLightMode ? 'bg-gradient-to-br from-orange-50 to-orange-100/80' : 'bg-gradient-to-br from-[#FF6B00]/15 to-[#FF6B00]/5'} border ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/10'}`}>
                    <BookOpen className="h-4 w-4 text-[#FF6B00]" />
                  </span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300">
                    Selecione as disciplinas para focar hoje
                  </span>
                </h3>

                <div className={`p-4 rounded-lg ${isLightMode ? 'bg-gray-50/70' : 'bg-gray-800/10'} border ${isLightMode ? 'border-gray-100' : 'border-gray-800/50'}`}>
                  <div className="flex flex-wrap gap-2">
                    {disciplinas.map((disciplina) => (
                      <button
                        key={disciplina.nome}
                        type="button"
                        onClick={() => toggleDisciplina(disciplina.nome)}
                        className={`px-3 py-1.5 rounded-full transition-all ${
                          disciplinasSelecionadas.includes(disciplina.nome)
                            ? isLightMode
                              ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white shadow-sm'
                              : 'bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white shadow-sm'
                            : isLightMode
                            ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                            : 'bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/70 hover:border-gray-600'
                        }`}
                      >
                        {disciplina.nome}
                      </button>
                    ))}
                  </div>

                  {disciplinasSelecionadas.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
                      <p className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {disciplinasSelecionadas.length} disciplina(s) selecionada(s)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className={`rounded-lg ${isLightMode ? 'bg-white' : 'bg-gray-800/10'} border ${isLightMode ? 'border-gray-200' : 'border-gray-700/50'} p-4`}>
                <label
                  htmlFor="topico-especifico"
                  className={`block text-sm font-medium mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}
                >
                  Tópico específico (opcional)
                </label>
                <div className="relative">
                  <input
                    id="topico-especifico"
                    type="text"
                    value={topicoEspecifico}
                    onChange={(e) => setTopicoEspecifico(e.target.value)}
                    placeholder="Ex: Funções do 2º grau"
                    className={`w-full rounded-lg pl-10 pr-3 py-2.5 ${
                      isLightMode
                        ? 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-[#FF6B00] focus:ring-[#FF6B00]/20'
                        : 'border-gray-700 bg-gray-800/30 text-white placeholder-gray-500 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10'
                    }`}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className={`h-4 w-4 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                </div>
                <p className={`mt-1.5 text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Especifique um tópico dentro das disciplinas selecionadas para um foco mais direcionado
                </p>
              </div>
            </div>
          )}

          {etapaAtual === 3 && (
            <div className="space-y-6">
              {/* Tempo de estudo planejado */}
              <div className={`p-5 rounded-xl ${isLightMode ? 'bg-gradient-to-br from-gray-50 to-white' : 'bg-gradient-to-br from-gray-800/20 to-gray-900/10'} border ${isLightMode ? 'border-gray-100' : 'border-gray-800/50'} shadow-sm`}>
                <h3 className={`text-md font-semibold mb-4 ${isLightMode ? 'text-gray-800' : 'text-white'} flex items-center gap-2.5`}>
                  <span className={`p-2 rounded-lg ${isLightMode ? 'bg-gradient-to-br from-orange-50 to-orange-100/80' : 'bg-gradient-to-br from-[#FF6B00]/15 to-[#FF6B00]/5'} border ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/10'} shadow-sm`}>
                    <Clock className="h-4 w-4 text-[#FF6B00]" />
                  </span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300">
                    Tempo de estudo planejado
                  </span>
                </h3>

                <div className="px-2">
                  <input
                    type="range"
                    min="30"
                    max="240"
                    step="30"
                    value={tempoEstudo}
                    onChange={(e) => setTempoEstudo(parseInt(e.target.value))}
                    className="w-full accent-[#FF6B00]"
                  />

                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>30 min</span>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${isLightMode ? 'bg-orange-100 text-orange-700' : 'bg-[#FF6B00]/20 text-[#FF6B00]'}`}>
                      {tempoEstudo} min ({Math.floor(tempoEstudo / 60)} hora{tempoEstudo >= 120 ? 's' : ''} e {tempoEstudo % 60} min)
                    </span>
                    <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>4 horas</span>
                  </div>
                </div>
              </div>

              {/* Como você está se sentindo hoje? */}
              <div className={`p-5 rounded-xl ${isLightMode ? 'bg-gradient-to-br from-gray-50 to-white' : 'bg-gradient-to-br from-gray-800/20 to-gray-900/10'} border ${isLightMode ? 'border-gray-100' : 'border-gray-800/50'} shadow-sm`}>
                <h3 className={`text-md font-semibold mb-4 ${isLightMode ? 'text-gray-800' : 'text-white'} flex items-center gap-2.5`}>
                  <span className={`p-2 rounded-lg ${isLightMode ? 'bg-gradient-to-br from-orange-50 to-orange-100/80' : 'bg-gradient-to-br from-[#FF6B00]/15 to-[#FF6B00]/5'} border ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/10'} shadow-sm`}>
                    <Smile className="h-4 w-4 text-[#FF6B00]" />
                  </span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300">
                    Como você está se sentindo hoje?
                  </span>
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                                        { estado: "Motivado(a)", icon: <Smile className="h-4 w-4" /> },
                    { estado: "Um pouco perdido(a)", icon: <HelpCircle className="h-4 w-4" /> },
                    { estado: "Cansado(a)", icon: <Clock className="h-4 w-4" /> },
                    { estado: "Ansioso(a)", icon: <BarChart2 className="h-4 w-4" /> }
                  ].map(({ estado, icon }) => (
                    <button
                      key={estado}
                      type="button"
                      onClick={() => setEstadoAtual(estado)}
                      className={`flex items-center p-3 rounded-lg border transition-all ${
                        estadoAtual === estado
                          ? isLightMode
                            ? 'border-[#FF6B00] bg-gradient-to-r from-orange-50 to-orange-100/70 text-[#FF6B00] shadow-sm'
                            : 'border-[#FF6B00]/70 bg-gradient-to-r from-[#FF6B00]/10 to-[#FF6B00]/5 text-white shadow-sm'
                          : isLightMode
                          ? 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                          : 'border-gray-700/50 text-gray-300 hover:bg-gray-800/30 hover:border-gray-600'
                      }`}
                    >
                      <div className={`mr-2 ${estadoAtual === estado ? 'text-[#FF6B00]' : isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {icon}
                      </div>
                      <span>{estado}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tarefas para incluir no seu foco */}
              <div className={`p-5 rounded-xl ${isLightMode ? 'bg-gradient-to-br from-gray-50 to-white' : 'bg-gradient-to-br from-gray-800/20 to-gray-900/10'} border ${isLightMode ? 'border-gray-100' : 'border-gray-800/50'} shadow-sm`}>
                <h3 className={`text-md font-semibold mb-4 ${isLightMode ? 'text-gray-800' : 'text-white'} flex items-center gap-2.5`}>
                  <span className={`p-2 rounded-lg ${isLightMode ? 'bg-gradient-to-br from-orange-50 to-orange-100/80' : 'bg-gradient-to-br from-[#FF6B00]/15 to-[#FF6B00]/5'} border ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/10'} shadow-sm`}>
                    <Check className="h-4 w-4 text-[#FF6B00]" />
                  </span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300">
                    Tarefas para incluir no seu foco
                  </span>
                </h3>

                <div className="flex flex-col space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={novaTarefa}
                        onChange={(e) => setNovaTarefa(e.target.value)}
                        placeholder="Adicionar tarefa específica"
                        className={`w-full rounded-lg pl-9 pr-3 py-2 ${
                          isLightMode
                            ? 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-[#FF6B00] focus:ring-[#FF6B00]/20'
                            : 'border-gray-700 bg-gray-800/30 text-white placeholder-gray-500 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10'
                        }`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && novaTarefa.trim()) {
                            adicionarTarefa();
                          }
                        }}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PlusCircle className={`h-4 w-4 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      </div>
                    </div>
                    <Button
                      onClick={adicionarTarefa}
                      disabled={!novaTarefa.trim()}
                      className={`px-3 transition-all ${
                        novaTarefa.trim()
                          ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF7B00] hover:to-[#FF9C50] text-white shadow-sm'
                          : isLightMode
                          ? 'bg-gray-100 text-gray-400'
                          : 'bg-gray-800 text-gray-500'
                      }`}
                    >
                      Adicionar
                    </Button>
                  </div>

                  {tarefasSelecionadas.length > 0 && (
                    <div className={`mt-2 p-3 rounded-lg ${isLightMode ? 'bg-gray-50/80' : 'bg-gray-800/20'} border ${isLightMode ? 'border-gray-100' : 'border-gray-700/30'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className={`text-sm font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                          Suas tarefas
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${isLightMode ? 'bg-blue-100 text-blue-700' : 'bg-blue-900/20 text-blue-400'}`}>
                          {tarefasSelecionadas.length} tarefa(s)
                        </span>
                      </div>
                      <div className="space-y-2">
                        {tarefasSelecionadas.map((tarefa, index) => (
                          <div key={index} className={`flex justify-between items-center p-2 rounded-lg ${isLightMode ? 'bg-white border border-gray-100' : 'bg-gray-800/30 border border-gray-700/50'}`}>
                            <div className="flex items-center gap-2">
                              <div className={`p-1 rounded-full ${isLightMode ? 'bg-gray-100' : 'bg-gray-700'}`}>
                                <Check className={`h-3 w-3 ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`} />
                              </div>
                              <span className={`text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                                {tarefa}
                              </span>
                            </div>
                            <button
                              onClick={() => removerTarefa(index)}
                              className={`p-1.5 rounded-full transition-colors ${
                                isLightMode ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-gray-700 text-gray-400'
                              }`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sugestões da IA com base no seu perfil */}
              <div className={`p-5 rounded-xl ${isLightMode ? 'bg-gradient-to-br from-blue-50 to-indigo-50/70' : 'bg-gradient-to-br from-blue-900/10 to-indigo-900/5'} border ${isLightMode ? 'border-blue-100/80' : 'border-blue-800/20'} shadow-sm`}>
                <h3 className={`text-md font-semibold mb-4 ${isLightMode ? 'text-gray-800' : 'text-white'} flex items-center gap-2.5`}>
                  <span className={`p-2 rounded-lg ${isLightMode ? 'bg-gradient-to-br from-blue-100 to-blue-50' : 'bg-gradient-to-br from-blue-900/20 to-blue-800/10'} border ${isLightMode ? 'border-blue-200/60' : 'border-blue-700/30'} shadow-sm`}>
                    <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-indigo-700 dark:from-blue-400 dark:to-indigo-300">
                    Sugestões personalizadas
                  </span>
                </h3>

                {carregandoSugestoes ? (
                  <div className="flex flex-col items-center justify-center py-6 space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
                    <span className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                      Analisando seu perfil e gerando recomendações...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {sugestoesTarefas.slice(0, 3).map((sugestao, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          tarefasSelecionadas.includes(sugestao.titulo)
                            ? isLightMode
                              ? 'bg-gradient-to-r from-blue-100/90 to-blue-50 border border-blue-200 shadow-sm'
                              : 'bg-gradient-to-r from-blue-900/20 to-blue-800/10 border border-blue-700/40 shadow-sm'
                            : isLightMode
                            ? 'bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
                            : 'bg-gray-800/30 border border-gray-700 hover:border-blue-800/40 hover:bg-blue-900/10'
                        }`}
                        onClick={() => toggleTarefaSugerida(sugestao.titulo)}
                      >
                        <div className="flex items-start">
                          <div
                            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                              tarefasSelecionadas.includes(sugestao.titulo)
                                ? 'border-blue-500 bg-blue-500'
                                : isLightMode
                                ? 'border-gray-300 group-hover:border-blue-400'
                                : 'border-gray-600 group-hover:border-blue-600'
                            }`}
                          >
                            {tarefasSelecionadas.includes(sugestao.titulo) && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>

                          <div className="ml-3 flex-1">
                            <div className="flex justify-between items-start">
                              <p
                                className={`text-sm font-medium ${
                                  isLightMode ? 'text-gray-800' : 'text-gray-200'
                                }`}
                              >
                                {sugestao.titulo}
                              </p>

                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ml-2 ${
                                  sugestao.prioridade === "Alta"
                                    ? isLightMode
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-red-900/20 text-red-400'
                                    : sugestao.prioridade === "Média"
                                    ? isLightMode
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-yellow-900/20 text-yellow-400'
                                    : isLightMode
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-green-900/20 text-green-400'
                                }`}
                              >
                                {sugestao.prioridade}
                              </span>
                            </div>

                            <p
                              className={`text-xs mt-1 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}
                            >
                              {sugestao.descricao}
                            </p>

                            <div className="flex items-center mt-2">
                              <Clock className={`h-3 w-3 mr-1 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span
                                className={`text-xs ${
                                  isLightMode ? 'text-gray-500' : 'text-gray-400'
                                }`}
                              >
                                {sugestao.prazo}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

           {/* Etapas 4 e 5 removidas */}
        </div>

        {/* Botões de navegação - Redesenhados com estilo premium */}
        <div className="flex justify-between pt-2">
          <Button
            onClick={voltarEtapa}
            variant="outline"
            className={`px-5 py-2.5 rounded-lg transition-all transform hover:scale-[1.02] ${
              isLightMode 
                ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm' 
                : 'bg-gray-900 text-gray-300 border-gray-800 hover:bg-gray-800 hover:border-gray-700 shadow-sm'
            }`}
          >
            {etapaAtual === 1 ? "Cancelar" : "Voltar"}
          </Button>
          <Button
            onClick={avancarEtapa}
            variant="default"
            className={`px-5 py-2.5 rounded-lg font-medium transition-all transform hover:scale-[1.02] ${
              ((etapaAtual === 1 && objetivo === "Outro Objetivo (Personalizado)" && !objetivoPersonalizado) ||
              (etapaAtual === 2 && disciplinasSelecionadas.length === 0))
              ? isLightMode 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF7B00] hover:to-[#FF9C50] text-white shadow-md'
            }`}
            disabled={
              (etapaAtual === 1 && objetivo === "Outro Objetivo (Personalizado)" && !objetivoPersonalizado) ||
              (etapaAtual === 2 && disciplinasSelecionadas.length === 0)
            }
          >
            {etapaAtual === 3 ? (
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4" />
                Gerar Foco
              </span>
            ) : "Próximo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DefinirFocoModal;