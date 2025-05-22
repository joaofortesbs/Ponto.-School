import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Check, X, Clock, Bookmark, Target, Zap, Book, PenSquare, Calendar, RefreshCw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
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

      // Carregar disciplinas do perfil do usuário
      const { getUserFullProfile } = await import('@/services/userProfileService');
      const perfil = await getUserFullProfile();

      // Carregar eventos e tarefas do usuário para gerar sugestões relevantes
      const { getEventsByUserId } = await import('@/services/calendarEventService');
      const { getTasksByUserId } = await import('@/services/taskService');

      const eventos = await getEventsByUserId(currentUserId);
      const tarefas = await getTasksByUserId(currentUserId);

      // Gerar disciplinas personalizadas com base nos eventos e perfil
      let disciplinasPersonalizadas = [...disciplinasPadrao];

      // Extrair disciplinas dos eventos de calendário
      if (eventos && eventos.length > 0) {
        const disciplinasDeEventos = eventos
          .filter(evento => evento.discipline)
          .map(evento => evento.discipline as string)
          .filter((disciplina, index, array) => array.indexOf(disciplina) === index);

        if (disciplinasDeEventos.length > 0) {
          disciplinasPersonalizadas = disciplinasDeEventos.map(nome => ({ 
            nome, 
            tag: "Da sua agenda" 
          })).concat(
            disciplinasPadrao.filter(d => !disciplinasDeEventos.includes(d.nome))
          );
        }
      }

      // Gerar sugestões de tarefas com base nas tarefas existentes e eventos
      let sugestoesPersonalizadas = [...sugestoesFocoPadrao];

      if (tarefas && tarefas.length > 0) {
        // Usar tarefas pendentes como sugestões
        const tarefasPendentes = tarefas
          .filter(tarefa => tarefa.status === 'todo' || tarefa.status === 'in-progress')
          .map(tarefa => ({
            titulo: tarefa.title,
            descricao: tarefa.description || "Completar esta tarefa pendente",
            prioridade: tarefa.priority === 'high' ? "alta" : (tarefa.priority === 'medium' ? "média" : "baixa"),
            prazo: tarefa.dueDate ? "até " + new Date(tarefa.dueDate).toLocaleDateString() : "em breve"
          }));

        if (tarefasPendentes.length > 0) {
          // Combinar tarefas pendentes com algumas sugestões padrão
          sugestoesPersonalizadas = [
            ...tarefasPendentes.slice(0, 3),
            ...sugestoesFocoPadrao.slice(0, 2)
          ];
        }
      }

      if (eventos && eventos.length > 0) {
        // Adicionar sugestões baseadas em eventos próximos
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const proximaSemana = new Date(hoje);
        proximaSemana.setDate(hoje.getDate() + 7);

        const eventosProximos = eventos.filter(evento => {
          const dataEvento = new Date(evento.startDate);
          return dataEvento >= hoje && dataEvento <= proximaSemana;
        });

        const sugestoesDeEventos = eventosProximos.slice(0, 2).map(evento => ({
          titulo: `Preparar para: ${evento.title}`,
          descricao: evento.description || `Evento agendado para ${new Date(evento.startDate).toLocaleDateString()}`,
          prioridade: new Date(evento.startDate).getTime() - hoje.getTime() < 3 * 24 * 60 * 60 * 1000 ? "alta" : "média",
          prazo: `até ${new Date(evento.startDate).toLocaleDateString()}`
        }));

        if (sugestoesDeEventos.length > 0) {
          // Adicionar sugestões de eventos ao início da lista
          sugestoesPersonalizadas = [
            ...sugestoesDeEventos,
            ...sugestoesPersonalizadas.slice(0, 4 - sugestoesDeEventos.length)
          ];
        }
      }

      // Atualizar os estados com dados personalizados
      setDisciplinas(disciplinasPersonalizadas);
      setSugestoesTarefas(sugestoesPersonalizadas);

      console.log("Dados personalizados carregados para o modal de Foco");
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

  // Função para formatar o tempo de estudo para exibição
  const formatarTempoEstudo = (minutos: number): string => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas > 0 ? `${horas}h` : ""} ${mins > 0 ? `${mins}min` : ""}`.trim();
  };

  // Função para avançar para a próxima etapa
  const avancarEtapa = () => {
    if (etapaAtual < 4) {
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
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-semibold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
            Defina Seu Foco de Estudos com o Epictus IA
          </h2>
          <button 
            onClick={onClose}
            className={`p-1 rounded-full ${isLightMode ? 'hover:bg-gray-200' : 'hover:bg-gray-700'} transition-colors`}
          >
            <X className={`h-5 w-5 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`} />
          </button>
        </div>

        {/* Progresso */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <p className={`text-sm font-medium ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
              Etapa {etapaAtual} de 4
            </p>
            <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {
                etapaAtual === 1 ? "Definindo Objetivo" :
                etapaAtual === 2 ? "Selecionando Disciplinas" :
                etapaAtual === 3 ? "Organizando Tarefas" :
                "Finalização"
              }
            </p>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div 
              className="h-full bg-[#FF6B00] rounded-full"
              style={{ width: `${(etapaAtual / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Conteúdo dinâmico baseado na etapa atual */}
        <div className="space-y-6 mb-8">
          {/* Etapa 1: Objetivo principal */}
          {etapaAtual === 1 && (
            <div className="space-y-5">
              <div className="space-y-3">
                <h3 className={`text-lg font-medium ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                  Qual é seu objetivo de estudo hoje?
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {objetivosEstudo.map((obj) => (
                    <button
                      key={obj}
                      onClick={() => setObjetivo(obj)}
                      className={`flex items-center p-3 rounded-lg border ${
                        objetivo === obj 
                          ? `${isLightMode ? 'border-[#FF6B00] bg-orange-50' : 'border-[#FF6B00] bg-[#FF6B00]/10'}`
                          : `${isLightMode ? 'border-gray-200 hover:border-gray-300' : 'border-gray-700 hover:border-gray-600'}`
                      } transition-all`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        objetivo === obj
                          ? 'border-[#FF6B00] bg-[#FF6B00]'
                          : `${isLightMode ? 'border-gray-300' : 'border-gray-600'}`
                      }`}>
                        {objetivo === obj && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className={`ml-3 ${isLightMode ? 'text-gray-800' : 'text-gray-200'}`}>
                        {obj}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {objetivo === "Outro Objetivo (Personalizado)" && (
                <div className="space-y-2">
                  <label htmlFor="objetivo-personalizado" className={`block text-sm font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                    Especifique seu objetivo:
                  </label>
                  <input
                    type="text"
                    id="objetivo-personalizado"
                    value={objetivoPersonalizado}
                    onChange={(e) => setObjetivoPersonalizado(e.target.value)}
                    className={`w-full p-3 rounded-lg border ${
                      isLightMode 
                        ? 'border-gray-300 focus:border-[#FF6B00] bg-white' 
                        : 'border-gray-700 focus:border-[#FF6B00] bg-gray-800'
                    } focus:ring-1 focus:ring-[#FF6B00] outline-none transition-colors`}
                    placeholder="Ex: Preparar para apresentação de seminário"
                  />
                </div>
              )}
            </div>
          )}

          {/* Etapa 2: Disciplinas e tópicos */}
          {etapaAtual === 2 && (
            <div className="space-y-5">
              <div className="space-y-3">
                <h3 className={`text-lg font-medium ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                  Selecione as disciplinas prioritárias
                </h3>
                <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  Escolha até 3 disciplinas para focar hoje
                </p>

                {/* Botão para atualizar sugestões */}
                {carregandoSugestoes ? (
                  <div className={`w-full flex justify-center py-2 mb-2 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span className="ml-2 text-sm">Carregando disciplinas...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {disciplinas.map((disciplina) => (
                      <button
                        key={disciplina.nome}
                        onClick={() => toggleDisciplina(disciplina.nome)}
                        className={`flex flex-col items-start p-3 rounded-lg border ${
                          disciplinasSelecionadas.includes(disciplina.nome)
                            ? `${isLightMode ? 'border-[#FF6B00] bg-orange-50' : 'border-[#FF6B00] bg-[#FF6B00]/10'}`
                            : `${isLightMode ? 'border-gray-200 hover:border-gray-300' : 'border-gray-700 hover:border-gray-600'}`
                        } transition-all`}
                        disabled={disciplinasSelecionadas.length >= 3 && !disciplinasSelecionadas.includes(disciplina.nome)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`${isLightMode ? 'text-gray-800' : 'text-gray-200'} font-medium`}>
                            {disciplina.nome}
                          </span>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            disciplinasSelecionadas.includes(disciplina.nome)
                              ? 'border-[#FF6B00] bg-[#FF6B00]'
                              : `${isLightMode ? 'border-gray-300' : 'border-gray-600'}`
                          }`}>
                            {disciplinasSelecionadas.includes(disciplina.nome) && <Check className="h-3 w-3 text-white" />}
                          </div>
                        </div>
                        {disciplina.tag && (
                          <span className={`mt-1.5 text-xs px-2 py-0.5 rounded-full ${
                            isLightMode 
                              ? disciplina.tag === "Da sua agenda" ? 'bg-green-100 text-green-700' 
                                : disciplina.tag === "Recente" ? 'bg-blue-100 text-blue-700' 
                                : disciplina.tag === "Recomendado" ? 'bg-purple-100 text-purple-700'
                                : 'bg-orange-100 text-orange-700'
                              : disciplina.tag === "Da sua agenda" ? 'bg-green-900/30 text-green-400' 
                                : disciplina.tag === "Recente" ? 'bg-blue-900/30 text-blue-400' 
                                : disciplina.tag === "Recomendado" ? 'bg-purple-900/30 text-purple-400'
                                : 'bg-orange-900/30 text-orange-400'
                          }`}>
                            {disciplina.tag}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="topico-especifico" className={`block text-sm font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  Tópico específico (opcional)
                </label>
                <input
                  type="text"
                  id="topico-especifico"
                  value={topicoEspecifico}
                  onChange={(e) => setTopicoEspecifico(e.target.value)}
                  className={`w-full p-3 rounded-lg border ${
                    isLightMode 
                      ? 'border-gray-300 focus:border-[#FF6B00] bg-white' 
                      : 'border-gray-700 focus:border-[#FF6B00] bg-gray-800'
                  } focus:ring-1 focus:ring-[#FF6B00] outline-none transition-colors`}
                  placeholder="Ex: Equações diferenciais, Segunda guerra mundial"
                />
              </div>
            </div>
          )}

          {/* Etapa 3: Tarefas e tempo */}
          {etapaAtual === 3 && (
            <div className="space-y-5">
              <div className="space-y-3">
                <h3 className={`text-lg font-medium ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                  Quanto tempo você pretende dedicar hoje?
                </h3>
                <div className="px-2">
                  <div className="mb-2 flex justify-between items-center">
                    <span className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>30min</span>
                    <span className={`text-sm font-medium ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                      {formatarTempoEstudo(tempoEstudo)}
                    </span>
                    <span className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>4h</span>
                  </div>
                  <Slider
                    value={[tempoEstudo]}
                    min={30}
                    max={240}
                    step={15}
                    onValueChange={(value) => setTempoEstudo(value[0])}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className={`text-lg font-medium ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                  Há alguma tarefa ou prazo específico que precisa de atenção imediata?
                </h3>

                <div className="flex items-center">
                  <input
                    type="text"
                    value={novaTarefa}
                    onChange={(e) => setNovaTarefa(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && adicionarTarefa()}
                    className={`flex-1 p-3 rounded-l-lg border ${
                      isLightMode 
                        ? 'border-gray-300 focus:border-[#FF6B00] bg-white' 
                        : 'border-gray-700 focus:border-[#FF6B00] bg-gray-800'
                    } focus:ring-1 focus:ring-[#FF6B00] outline-none transition-colors`}
                    placeholder="Adicionar tarefa"
                  />
                  <button
                    onClick={adicionarTarefa}
                    className="p-3 rounded-r-lg bg-[#FF6B00] text-white hover:bg-[#FF8C40] transition-colors"
                  >
                    <PenSquare className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-2 mt-4">
                  <p className={`text-sm font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                    Suas tarefas:
                  </p>
                  {tarefasSelecionadas.length === 0 ? (
                    <p className={`text-sm italic ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Nenhuma tarefa adicionada
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {tarefasSelecionadas.map((tarefa, index) => (
                        <li 
                          key={index}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            isLightMode ? 'border-gray-200 bg-gray-50' : 'border-gray-700 bg-gray-800/40'
                          }`}
                        >
                          <span className={`${isLightMode ? 'text-gray-800' : 'text-gray-200'}`}>{tarefa}</span>
                          <button
                            onClick={() => removerTarefa(index)}
                            className={`p-1 rounded-full ${isLightMode ? 'hover:bg-gray-200' : 'hover:bg-gray-700'} transition-colors`}
                          >
                            <X className={`h-4 w-4 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <p className={`text-sm font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      Sugestões com base no seu perfil:
                    </p>
                    <button 
                      onClick={atualizarSugestoes}
                      disabled={carregandoSugestoes}
                      className={`p-1.5 rounded-full text-xs flex items-center gap-1.5 ${
                        isLightMode 
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      } transition-colors`}
                    >
                      <RefreshCw className={`h-3 w-3 ${carregandoSugestoes ? 'animate-spin' : ''}`} />
                      {carregandoSugestoes ? 'Atualizando...' : 'Atualizar'}
                    </button>
                  </div>

                  {carregandoSugestoes ? (
                    <div className={`flex justify-center items-center py-8 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      <span className="ml-3">Carregando sugestões personalizadas...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {sugestoesTarefas.map((sugestao, index) => (
                        <button
                          key={index}
                          onClick={() => adicionarSugestao(sugestao.titulo)}
                          className={`flex items-start p-3 rounded-lg border ${
                            tarefasSelecionadas.includes(sugestao.titulo)
                              ? `${isLightMode ? 'border-green-300 bg-green-50' : 'border-green-700 bg-green-900/20'}`
                              : `${isLightMode ? 'border-gray-200 hover:border-gray-300' : 'border-gray-700 hover:border-gray-600'}`
                          } transition-all w-full text-left`}
                        >
                          <div className={`w-5 h-5 mt-0.5 rounded-full flex-shrink-0 flex items-center justify-center border ${
                            tarefasSelecionadas.includes(sugestao.titulo)
                              ? 'border-green-500 bg-green-500'
                              : `${isLightMode ? 'border-gray-300' : 'border-gray-600'}`
                          }`}>
                            {tarefasSelecionadas.includes(sugestao.titulo) && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <div className="ml-3">
                            <p className={`font-medium ${isLightMode ? 'text-gray-800' : 'text-gray-200'}`}>
                              {sugestao.titulo}
                            </p>
                            <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                              {sugestao.descricao}
                            </p>
                            <div className="flex items-center mt-1.5 gap-2">
                              {sugestao.prioridade && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  sugestao.prioridade === "alta" 
                                    ? `${isLightMode ? 'bg-red-100 text-red-700' : 'bg-red-900/20 text-red-400'}`
                                    : sugestao.prioridade === "média"
                                      ? `${isLightMode ? 'bg-amber-100 text-amber-700' : 'bg-amber-900/20 text-amber-400'}`
                                      : `${isLightMode ? 'bg-blue-100 text-blue-700' : 'bg-blue-900/20 text-blue-400'}`
                                }`}>
                                  Prioridade {sugestao.prioridade}
                                </span>
                              )}
                              {sugestao.prazo && (
                                <span className={`text-xs flex items-center ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                                  <Calendar className="h-3 w-3 mr-1" /> {sugestao.prazo}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Etapa 4: Finalização e estado emocional */}
          {etapaAtual === 4 && (
            <div className="space-y-5">
              <div className="space-y-3">
                <h3 className={`text-lg font-medium ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                  Como você está se sentindo hoje?
                </h3>
                <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  Isso nos ajudará a criar dicas personalizadas para suas sessões de estudo
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["Motivado(a)", "Um pouco perdido(a)", "Cansado(a)", "Ansioso(a)"].map((estado) => (
                    <button
                      key={estado}
                      onClick={() => setEstadoAtual(estado)}
                      className={`flex items-center p-3 rounded-lg border ${
                        estadoAtual === estado 
                          ? `${isLightMode ? 'border-[#FF6B00] bg-orange-50' : 'border-[#FF6B00] bg-[#FF6B00]/10'}`
                          : `${isLightMode ? 'border-gray-200 hover:border-gray-300' : 'border-gray-700 hover:border-gray-600'}`
                      } transition-all`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        estadoAtual === estado
                          ? 'border-[#FF6B00] bg-[#FF6B00]'
                          : `${isLightMode ? 'border-gray-300' : 'border-gray-600'}`
                      }`}>
                        {estadoAtual === estado && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className={`ml-3 ${isLightMode ? 'text-gray-800' : 'text-gray-200'}`}>
                        {estado}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isLightMode ? 'bg-blue-50 border border-blue-100' : 'bg-blue-900/10 border border-blue-800/20'}`}>
                <h4 className={`text-sm font-medium mb-2 flex items-center ${isLightMode ? 'text-blue-800' : 'text-blue-300'}`}>
                  <Zap className="h-4 w-4 mr-1.5" /> Resumo do seu foco
                </h4>
                <ul className={`space-y-2 text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  <li className="flex items-start">
                    <Target className="h-4 w-4 mr-2 mt-0.5 text-[#FF6B00]" />
                    <div>
                      <span className="font-medium">Objetivo:</span>{" "}
                      {objetivo === "Outro Objetivo (Personalizado)" ? objetivoPersonalizado : objetivo}
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Book className="h-4 w-4 mr-2 mt-0.5 text-[#FF6B00]" />
                    <div>
                      <span className="font-medium">Disciplinas:</span>{" "}
                      {disciplinasSelecionadas.length > 0 
                        ? disciplinasSelecionadas.join(", ") 
                        : "Nenhuma disciplina selecionada"}
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Clock className="h-4 w-4 mr-2 mt-0.5 text-[#FF6B00]" />
                    <div>
                      <span className="font-medium">Tempo:</span>{" "}
                      {formatarTempoEstudo(tempoEstudo)}
                    </div>
                  </li>
                  <li className="flex items-start">
                    <PenSquare className="h-4 w-4 mr-2 mt-0.5 text-[#FF6B00]" />
                    <div>
                      <span className="font-medium">Tarefas:</span>{" "}
                      {tarefasSelecionadas.length > 0 
                        ? `${tarefasSelecionadas.length} tarefa(s) definida(s)` 
                        : "Nenhuma tarefa definida"}
                    </div>
                  </li>
                </ul>
              </div>

              <div className={`p-4 rounded-lg ${isLightMode ? 'bg-green-50 border border-green-100' : 'bg-green-900/10 border border-green-800/20'}`}>
                <h4 className={`text-sm font-medium mb-2 flex items-center ${isLightMode ? 'text-green-800' : 'text-green-300'}`}>
                  <Zap className="h-4 w-4 mr-1.5" /> O que acontece agora?
                </h4>
                <p className={`text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  O Epictus IA irá analisar seu perfil, suas atividades na plataforma e as informações que você forneceu 
                  para criar um plano de foco personalizado. Você receberá sugestões de tarefas, dicas adaptadas ao seu 
                  estado emocional e um acompanhamento do seu progresso.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Botões de navegação */}
        <div className="flex justify-between">
          <Button
            onClick={voltarEtapa}
            variant="outline"
            className={`${
              isLightMode 
                ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100' 
                : 'bg-[#0A2540] text-gray-300 border-gray-700 hover:bg-gray-800'
            }`}
          >
            {etapaAtual === 1 ? "Cancelar" : "Voltar"}
          </Button>
          <Button
            onClick={avancarEtapa}
            variant="default"
            className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
            disabled={
              (etapaAtual === 1 && objetivo === "Outro Objetivo (Personalizado)" && !objetivoPersonalizado) ||
              (etapaAtual === 2 && disciplinasSelecionadas.length === 0)
            }
          >
            {etapaAtual < 4 ? "Continuar" : "Definir Foco"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DefinirFocoModal;