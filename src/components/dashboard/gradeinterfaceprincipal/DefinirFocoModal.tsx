
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Target, 
  Clock, 
  BookOpen, 
  Check, 
  X, 
  Calendar, 
  Brain, 
  Sparkles,
  BarChart,
  BookMarked,
  FileText,
  ChevronRight
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "@/components/ThemeProvider";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Tipo de dados para as disciplinas
interface Disciplina {
  id: number;
  nome: string;
  recente: boolean;
  dificuldade: boolean;
}

// Tipo de dados para sugestões de foco
interface SugestaoFoco {
  id: number;
  titulo: string;
  descricao: string;
  prioridade: "alta" | "media" | "baixa";
  tipo: "prova" | "tarefa" | "revisao" | "novo";
  prazo?: string;
}

// Tipo de dados para sentimentos
interface Sentimento {
  id: string;
  label: string;
  descricao: string;
  icon: React.ReactNode;
}

// Propriedades do modal
interface DefinirFocoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDefinirFoco: (dados: any) => void;
}

export default function DefinirFocoModal({ 
  open, 
  onOpenChange,
  onDefinirFoco
}: DefinirFocoModalProps) {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  
  // Estados para os inputs do formulário
  const [objetivo, setObjetivo] = useState<string>("");
  const [objetivoCustom, setObjetivoCustom] = useState<string>("");
  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState<number[]>([]);
  const [tempoEstudo, setTempoEstudo] = useState<number>(60); // Em minutos
  const [tarefasSelecionadas, setTarefasSelecionadas] = useState<number[]>([]);
  const [sentimento, setSentimento] = useState<string>("");
  const [topicoEspecifico, setTopicoEspecifico] = useState<string>("");
  const [sugestaoSelecionada, setSugestaoSelecionada] = useState<number | null>(null);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [etapaAtual, setEtapaAtual] = useState<number>(1);
  const [progresso, setProgresso] = useState<number>(20);

  // Dados simulados (em uma aplicação real, estes viriam da API)
  const disciplinas: Disciplina[] = [
    { id: 1, nome: "Matemática", recente: true, dificuldade: true },
    { id: 2, nome: "Física", recente: false, dificuldade: false },
    { id: 3, nome: "Química", recente: true, dificuldade: false },
    { id: 4, nome: "Biologia", recente: false, dificuldade: true },
    { id: 5, nome: "História", recente: true, dificuldade: false },
    { id: 6, nome: "Geografia", recente: false, dificuldade: false },
    { id: 7, nome: "Português", recente: true, dificuldade: false },
    { id: 8, nome: "Literatura", recente: false, dificuldade: true },
  ];

  const sugestoesFoco: SugestaoFoco[] = [
    { 
      id: 1, 
      titulo: "Prova de História", 
      descricao: "Preparação para a prova da próxima semana", 
      prioridade: "alta", 
      tipo: "prova",
      prazo: "em 5 dias" 
    },
    { 
      id: 2, 
      titulo: "Revisão de Funções", 
      descricao: "Revisar conceitos importantes para a prova de matemática", 
      prioridade: "media", 
      tipo: "revisao" 
    },
    { 
      id: 3, 
      titulo: "Exercícios de Física", 
      descricao: "Concluir lista de exercícios pendentes", 
      prioridade: "alta", 
      tipo: "tarefa",
      prazo: "em 2 dias" 
    },
    { 
      id: 4, 
      titulo: "Novo capítulo: Trigonometria", 
      descricao: "Começar o estudo do novo conteúdo de matemática", 
      prioridade: "baixa", 
      tipo: "novo" 
    },
  ];

  const tarefasPendentes = [
    { id: 1, titulo: "Lista de exercícios de física", prazo: "16:00 hoje", urgente: true },
    { id: 2, titulo: "Resumo do capítulo 8 de biologia", prazo: "amanhã", urgente: false },
    { id: 3, titulo: "Pesquisa sobre Revolução Industrial", prazo: "quinta-feira", urgente: false },
    { id: 4, titulo: "Resolver problemas de matemática", prazo: "sexta-feira", urgente: true },
  ];

  const sentimentos: Sentimento[] = [
    { id: "motivado", label: "Motivado(a)", descricao: "Pronto para me dedicar ao máximo", icon: <Sparkles className="h-4 w-4" /> },
    { id: "perdido", label: "Um pouco perdido(a)", descricao: "Preciso de orientação", icon: <Brain className="h-4 w-4" /> },
    { id: "cansado", label: "Cansado(a)", descricao: "Gostaria de atividades mais leves", icon: <Clock className="h-4 w-4" /> },
    { id: "ansioso", label: "Ansioso(a)", descricao: "Tenho muitas preocupações", icon: <BarChart className="h-4 w-4" /> },
  ];

  const objetivosPreDefinidos = [
    { id: "prova", label: "Preparação para Prova" },
    { id: "nova_materia", label: "Avançar em Nova Matéria" },
    { id: "revisao", label: "Revisão de Tópicos" },
    { id: "tarefas", label: "Concluir Tarefas Pendentes" },
    { id: "custom", label: "Outro Objetivo (Personalizado)" },
  ];

  // Atualizar progresso com base na etapa atual
  useEffect(() => {
    setProgresso(etapaAtual * 20);
  }, [etapaAtual]);

  // Reset do formulário quando o modal fecha
  useEffect(() => {
    if (!open) {
      // Reset com delay para não ver a animação quando fechado
      setTimeout(() => {
        setEtapaAtual(1);
        setObjetivo("");
        setObjetivoCustom("");
        setDisciplinasSelecionadas([]);
        setTempoEstudo(60);
        setTarefasSelecionadas([]);
        setSentimento("");
        setTopicoEspecifico("");
        setSugestaoSelecionada(null);
        setCarregando(false);
      }, 300);
    }
  }, [open]);

  // Toggle disciplina selecionada
  const toggleDisciplina = (id: number) => {
    if (disciplinasSelecionadas.includes(id)) {
      setDisciplinasSelecionadas(disciplinasSelecionadas.filter(d => d !== id));
    } else {
      setDisciplinasSelecionadas([...disciplinasSelecionadas, id]);
    }
  };

  // Toggle tarefa selecionada
  const toggleTarefa = (id: number) => {
    if (tarefasSelecionadas.includes(id)) {
      setTarefasSelecionadas(tarefasSelecionadas.filter(t => t !== id));
    } else {
      setTarefasSelecionadas([...tarefasSelecionadas, id]);
    }
  };

  // Selecionar sugestão de foco
  const selecionarSugestao = (id: number) => {
    setSugestaoSelecionada(id === sugestaoSelecionada ? null : id);
    
    // Pré-selecionar disciplinas relacionadas à sugestão
    if (id === 1) { // Prova de História
      setDisciplinasSelecionadas([5]); // ID da História
    } else if (id === 2 || id === 4) { // Funções ou Trigonometria
      setDisciplinasSelecionadas([1]); // ID da Matemática
    } else if (id === 3) { // Exercícios de Física
      setDisciplinasSelecionadas([2]); // ID da Física
    }
  };

  // Avançar para a próxima etapa
  const avancarEtapa = () => {
    if (etapaAtual < 5) {
      setEtapaAtual(etapaAtual + 1);
    }
  };

  // Voltar para a etapa anterior
  const voltarEtapa = () => {
    if (etapaAtual > 1) {
      setEtapaAtual(etapaAtual - 1);
    }
  };

  // Gerar foco com base nas entradas do usuário
  const gerarFoco = () => {
    setCarregando(true);
    
    // Montar o objeto com todas as informações coletadas
    const focoData = {
      objetivo: objetivo === "custom" ? objetivoCustom : objetivosPreDefinidos.find(o => o.id === objetivo)?.label,
      sugestao: sugestaoSelecionada ? sugestoesFoco.find(s => s.id === sugestaoSelecionada) : null,
      disciplinas: disciplinasSelecionadas.map(id => disciplinas.find(d => d.id === id)),
      tempoEstudo,
      tarefas: tarefasSelecionadas.map(id => tarefasPendentes.find(t => t.id === id)),
      sentimento,
      topicoEspecifico
    };
    
    // Simular processamento do lado do servidor
    setTimeout(() => {
      setCarregando(false);
      
      // Gerar atividades com base nos dados (em um sistema real, isso seria feito pelo backend)
      const atividadesGeradas = gerarAtividadesInteligentes(focoData);
      
      // Fechar o modal e enviar os dados para o componente pai
      onDefinirFoco({
        ...focoData,
        titulo: determinarTituloFoco(focoData),
        atividades: atividadesGeradas
      });
      
      onOpenChange(false);
    }, 2000);
  };

  // Determinar o título do foco com base nos dados coletados
  const determinarTituloFoco = (dados: any) => {
    if (dados.sugestao) {
      return dados.sugestao.titulo;
    } else if (dados.objetivo === "custom" && dados.objetivoCustom) {
      return dados.objetivoCustom;
    } else if (dados.objetivo) {
      return dados.objetivo;
    } else if (dados.disciplinas && dados.disciplinas.length > 0) {
      return `Revisão de ${dados.disciplinas[0].nome}`;
    } else {
      return "Foco de Estudos";
    }
  };

  // Gerar atividades inteligentes com base nos dados
  const gerarAtividadesInteligentes = (dados: any) => {
    const atividades = [];
    
    // Se existe uma sugestão selecionada, priorizar atividades relacionadas a ela
    if (dados.sugestao) {
      if (dados.sugestao.tipo === "prova") {
        atividades.push({
          id: 1,
          titulo: `Revisar conteúdo para ${dados.sugestao.titulo}`,
          tipo: "revisao",
          tempo: "45 min",
          prazo: "Hoje",
          urgente: dados.sugestao.prioridade === "alta",
          concluido: false,
          progresso: 0
        });
        
        atividades.push({
          id: 2,
          titulo: "Resolver questões de provas anteriores",
          tipo: "exercicio",
          tempo: "30 min",
          prazo: "Hoje",
          urgente: false,
          concluido: false,
          progresso: 0
        });
      } else if (dados.sugestao.tipo === "tarefa") {
        atividades.push({
          id: 1,
          titulo: dados.sugestao.titulo,
          tipo: "tarefa",
          tempo: "60 min",
          prazo: dados.sugestao.prazo || "Hoje",
          urgente: dados.sugestao.prioridade === "alta",
          concluido: false,
          progresso: 0
        });
      } else if (dados.sugestao.tipo === "revisao") {
        atividades.push({
          id: 1,
          titulo: dados.sugestao.titulo,
          tipo: "revisao",
          tempo: "40 min",
          prazo: "Hoje",
          urgente: dados.sugestao.prioridade === "alta",
          concluido: false,
          progresso: 0
        });
        
        atividades.push({
          id: 2,
          titulo: "Fazer exercícios de fixação",
          tipo: "exercicio",
          tempo: "20 min",
          prazo: "Hoje",
          urgente: false,
          concluido: false,
          progresso: 0
        });
      } else if (dados.sugestao.tipo === "novo") {
        atividades.push({
          id: 1,
          titulo: `Assistir Aula: ${dados.sugestao.titulo.replace("Novo capítulo: ", "")}`,
          tipo: "video",
          tempo: "30 min",
          prazo: "Hoje",
          urgente: false,
          concluido: false,
          progresso: 0
        });
        
        atividades.push({
          id: 2,
          titulo: "Fazer anotações no caderno digital",
          tipo: "tarefa",
          tempo: "15 min",
          prazo: "Hoje",
          urgente: false,
          concluido: false,
          progresso: 0
        });
      }
    }
    
    // Adicionar tarefas selecionadas pelo usuário
    if (dados.tarefas && dados.tarefas.length > 0) {
      dados.tarefas.forEach((tarefa: any, index: number) => {
        if (tarefa) {
          atividades.push({
            id: atividades.length + 1,
            titulo: tarefa.titulo,
            tipo: "tarefa",
            tempo: "30 min",
            prazo: tarefa.prazo,
            urgente: tarefa.urgente,
            concluido: false,
            progresso: 0
          });
        }
      });
    }
    
    // Se não tivermos atividades suficientes, gerar mais com base nas disciplinas
    if (atividades.length < 2 && dados.disciplinas && dados.disciplinas.length > 0) {
      const disciplina = dados.disciplinas[0];
      if (disciplina) {
        atividades.push({
          id: atividades.length + 1,
          titulo: `Revisar conteúdo recente de ${disciplina.nome}`,
          tipo: "revisao",
          tempo: "30 min",
          prazo: "Hoje",
          urgente: false,
          concluido: false,
          progresso: 0
        });
      }
    }
    
    // Limitar a 4 atividades e garantir pelo menos 2
    if (atividades.length > 4) {
      return atividades.slice(0, 4);
    } else if (atividades.length < 2) {
      atividades.push({
        id: atividades.length + 1,
        titulo: "Organizar materiais de estudo",
        tipo: "tarefa",
        tempo: "15 min",
        prazo: "Hoje",
        urgente: false,
        concluido: false,
        progresso: 0
      });
      
      atividades.push({
        id: atividades.length + 2,
        titulo: "Definir metas de estudo para a semana",
        tipo: "tarefa",
        tempo: "20 min",
        prazo: "Hoje",
        urgente: false,
        concluido: false,
        progresso: 0
      });
    }
    
    return atividades;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl p-0 overflow-hidden ${isLightMode ? 'bg-white' : 'bg-gray-900'}`}>
        <motion.div
          className="h-2"
          initial={{ width: "0%" }}
          animate={{ width: `${progresso}%` }}
          transition={{ duration: 0.5 }}
          style={{ background: "linear-gradient(to right, #FF6B00, #FF8C40)" }}
        />
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className={`text-xl font-semibold flex items-center gap-2 ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
            <Target className="h-5 w-5 text-[#FF6B00]" />
            Defina Seu Foco de Estudos com o Epictus IA
          </DialogTitle>
          <p className={`text-sm mt-1 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
            Vamos ajudar você a organizar seu dia de estudos de forma personalizada
          </p>
        </DialogHeader>

        <div className={`px-6 pb-4 max-h-[70vh] overflow-y-auto ${isLightMode ? 'text-gray-800' : 'text-gray-100'}`}>
          {/* Etapa 1: Objetivo Principal */}
          {etapaAtual === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <span className={`flex items-center justify-center rounded-full h-6 w-6 text-xs ${isLightMode ? 'bg-orange-100 text-orange-600' : 'bg-orange-900/40 text-orange-300'}`}>1</span>
                  Qual seu principal objetivo de estudo para hoje?
                </h3>
                
                <RadioGroup className="space-y-2 mt-3" value={objetivo} onValueChange={setObjetivo}>
                  {objetivosPreDefinidos.map((obj) => (
                    <div key={obj.id} className={`flex items-start space-x-2 p-3 rounded-lg border ${isLightMode ? 'border-gray-200 hover:bg-orange-50/50 hover:border-orange-200' : 'border-gray-700 hover:bg-orange-900/10 hover:border-orange-800'} transition-colors`}>
                      <RadioGroupItem value={obj.id} id={`objetivo-${obj.id}`} className="mt-1" />
                      <Label htmlFor={`objetivo-${obj.id}`} className="flex-1 cursor-pointer">
                        <div className="font-medium">{obj.label}</div>
                        {obj.id === "custom" && objetivo === "custom" && (
                          <Textarea
                            placeholder="Descreva seu objetivo de estudo..."
                            className="mt-2"
                            value={objetivoCustom}
                            onChange={(e) => setObjetivoCustom(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3 mt-6">
                <h3 className="text-base font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#FF6B00]" />
                  Sugestões com base no seu perfil:
                </h3>
                <div className="grid gap-3">
                  {sugestoesFoco.map((sugestao) => (
                    <div 
                      key={sugestao.id}
                      onClick={() => selecionarSugestao(sugestao.id)}
                      className={`p-3 rounded-lg border ${
                        sugestaoSelecionada === sugestao.id 
                          ? (isLightMode ? 'border-orange-400 bg-orange-50' : 'border-orange-500 bg-orange-900/20') 
                          : (isLightMode ? 'border-gray-200 hover:bg-gray-50' : 'border-gray-700 hover:bg-gray-800/50')
                      } cursor-pointer transition-all`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{sugestao.titulo}</h4>
                            {sugestao.prioridade === "alta" && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${isLightMode ? 'bg-red-100 text-red-600' : 'bg-red-900/30 text-red-300'}`}>
                                Prioridade alta
                              </span>
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>{sugestao.descricao}</p>
                          {sugestao.prazo && (
                            <p className={`text-xs mt-2 flex items-center gap-1 ${sugestao.prioridade === "alta" ? (isLightMode ? 'text-red-600' : 'text-red-300') : (isLightMode ? 'text-gray-500' : 'text-gray-400')}`}>
                              <Calendar className="h-3 w-3" /> Prazo: {sugestao.prazo}
                            </p>
                          )}
                        </div>
                        <div className="ml-2 flex h-5 w-5 items-center justify-center rounded-full border">
                          {sugestaoSelecionada === sugestao.id && (
                            <Check className="h-3 w-3 text-[#FF6B00]" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Etapa 2: Disciplinas Prioritárias */}
          {etapaAtual === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <span className={`flex items-center justify-center rounded-full h-6 w-6 text-xs ${isLightMode ? 'bg-orange-100 text-orange-600' : 'bg-orange-900/40 text-orange-300'}`}>2</span>
                  Quais disciplinas ou tópicos são prioridade?
                </h3>
                <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                  Selecione as disciplinas que deseja priorizar nos seus estudos
                </p>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  {disciplinas.map((disciplina) => (
                    <div 
                      key={disciplina.id}
                      onClick={() => toggleDisciplina(disciplina.id)}
                      className={`p-3 rounded-lg border ${
                        disciplinasSelecionadas.includes(disciplina.id) 
                          ? (isLightMode ? 'border-orange-400 bg-orange-50' : 'border-orange-500 bg-orange-900/20') 
                          : (isLightMode ? 'border-gray-200 hover:bg-gray-50' : 'border-gray-700 hover:bg-gray-800/50')
                      } cursor-pointer transition-all flex items-start`}
                    >
                      <div className="mr-2 flex h-5 w-5 items-center justify-center rounded-full border mt-0.5">
                        {disciplinasSelecionadas.includes(disciplina.id) && (
                          <Check className="h-3 w-3 text-[#FF6B00]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{disciplina.nome}</h4>
                        <div className="flex gap-2 mt-1">
                          {disciplina.recente && (
                            <span className={`text-xs px-1.5 py-0.5 rounded ${isLightMode ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/30 text-blue-300'}`}>
                              Recente
                            </span>
                          )}
                          {disciplina.dificuldade && (
                            <span className={`text-xs px-1.5 py-0.5 rounded ${isLightMode ? 'bg-amber-100 text-amber-600' : 'bg-amber-900/30 text-amber-300'}`}>
                              Dificuldade
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Label htmlFor="topico-especifico" className="text-sm font-medium">
                    Tópico específico (opcional)
                  </Label>
                  <Textarea
                    id="topico-especifico"
                    placeholder="Ex: Equações do segundo grau, Revolução Francesa, etc."
                    className="mt-1"
                    value={topicoEspecifico}
                    onChange={(e) => setTopicoEspecifico(e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Etapa 3: Tempo de Estudo */}
          {etapaAtual === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <span className={`flex items-center justify-center rounded-full h-6 w-6 text-xs ${isLightMode ? 'bg-orange-100 text-orange-600' : 'bg-orange-900/40 text-orange-300'}`}>3</span>
                  Quanto tempo você pretende dedicar aos estudos hoje?
                </h3>
                <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                  Isso nos ajudará a planejar a quantidade adequada de atividades
                </p>

                <div className="py-6 px-2">
                  <Slider
                    defaultValue={[tempoEstudo]}
                    max={240}
                    min={15}
                    step={15}
                    onValueChange={(value) => setTempoEstudo(value[0])}
                  />
                  
                  <div className="flex justify-between mt-2">
                    <span className="text-sm">15min</span>
                    <span className="text-sm">1h</span>
                    <span className="text-sm">2h</span>
                    <span className="text-sm">4h</span>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full ${isLightMode ? 'bg-orange-100' : 'bg-orange-900/20'}`}>
                      <Clock className="h-4 w-4 mr-2 text-[#FF6B00]" />
                      <span className="font-medium">
                        {tempoEstudo >= 60 
                          ? `${Math.floor(tempoEstudo / 60)}h${tempoEstudo % 60 > 0 ? ` ${tempoEstudo % 60}min` : ''}`
                          : `${tempoEstudo}min`
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg mt-4 ${isLightMode ? 'bg-blue-50 border border-blue-100' : 'bg-blue-900/10 border border-blue-900/30'}`}>
                  <h4 className="font-medium flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Blocos de tempo sugeridos na sua agenda
                  </h4>
                  <div className="mt-2 space-y-2">
                    <div className={`p-2 rounded ${isLightMode ? 'bg-white' : 'bg-gray-800'} border ${isLightMode ? 'border-gray-200' : 'border-gray-700'}`}>
                      <p className="text-sm font-medium">Hoje, 14:00 - 16:00</p>
                      <p className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>Entre suas aulas de Matemática e Português</p>
                    </div>
                    <div className={`p-2 rounded ${isLightMode ? 'bg-white' : 'bg-gray-800'} border ${isLightMode ? 'border-gray-200' : 'border-gray-700'}`}>
                      <p className="text-sm font-medium">Hoje, 19:00 - 21:00</p>
                      <p className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>Período livre após o jantar</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Etapa 4: Tarefas Urgentes */}
          {etapaAtual === 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <span className={`flex items-center justify-center rounded-full h-6 w-6 text-xs ${isLightMode ? 'bg-orange-100 text-orange-600' : 'bg-orange-900/40 text-orange-300'}`}>4</span>
                  Há alguma tarefa ou prazo específico que precisa de atenção imediata?
                </h3>
                <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                  Selecione as tarefas que deseja incluir no seu foco de hoje
                </p>

                <div className="space-y-3 mt-3">
                  {tarefasPendentes.map((tarefa) => (
                    <div 
                      key={tarefa.id}
                      onClick={() => toggleTarefa(tarefa.id)}
                      className={`p-3 rounded-lg border ${
                        tarefasSelecionadas.includes(tarefa.id) 
                          ? (isLightMode ? 'border-orange-400 bg-orange-50' : 'border-orange-500 bg-orange-900/20') 
                          : (isLightMode ? 'border-gray-200 hover:bg-gray-50' : 'border-gray-700 hover:bg-gray-800/50')
                      } cursor-pointer transition-all flex items-start`}
                    >
                      <div className="mr-3 flex h-5 w-5 items-center justify-center rounded border mt-0.5">
                        {tarefasSelecionadas.includes(tarefa.id) && (
                          <Check className="h-3 w-3 text-[#FF6B00]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{tarefa.titulo}</h4>
                          {tarefa.urgente && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${isLightMode ? 'bg-red-100 text-red-600' : 'bg-red-900/30 text-red-300'}`}>
                              Urgente
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-1 flex items-center gap-1 ${tarefa.urgente ? (isLightMode ? 'text-red-600' : 'text-red-300') : (isLightMode ? 'text-gray-500' : 'text-gray-400')}`}>
                          <Calendar className="h-3 w-3" /> Prazo: {tarefa.prazo}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={`p-4 rounded-lg mt-4 ${isLightMode ? 'bg-green-50 border border-green-100' : 'bg-green-900/10 border border-green-900/30'}`}>
                  <h4 className="font-medium flex items-center gap-1.5">
                    <BookMarked className="h-4 w-4 text-green-500" />
                    Dica do Mentor IA
                  </h4>
                  <p className={`mt-2 text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                    Organizar suas tarefas por prazo e importância ajuda a reduzir a procrastinação. 
                    Sempre comece pelas tarefas mais urgentes ou mais difíceis quando estiver com mais energia.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Etapa 5: Sentimento e Finalização */}
          {etapaAtual === 5 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <span className={`flex items-center justify-center rounded-full h-6 w-6 text-xs ${isLightMode ? 'bg-orange-100 text-orange-600' : 'bg-orange-900/40 text-orange-300'}`}>5</span>
                  Como você está se sentindo em relação aos seus estudos?
                </h3>
                <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                  Isso nos ajudará a adaptar melhor as sugestões para você
                </p>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  {sentimentos.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setSentimento(item.id)}
                      className={`p-3 rounded-lg border ${
                        sentimento === item.id 
                          ? (isLightMode ? 'border-orange-400 bg-orange-50' : 'border-orange-500 bg-orange-900/20') 
                          : (isLightMode ? 'border-gray-200 hover:bg-gray-50' : 'border-gray-700 hover:bg-gray-800/50')
                      } cursor-pointer transition-all`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${isLightMode ? 'bg-gray-100' : 'bg-gray-800'}`}>
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-medium">{item.label}</h4>
                          <p className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>{item.descricao}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={`p-4 rounded-lg mt-4 ${isLightMode ? 'bg-orange-50 border border-orange-100' : 'bg-orange-900/10 border border-orange-900/30'}`}>
                  <h4 className="font-medium flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-[#FF6B00]" />
                    Resumo das suas escolhas
                  </h4>
                  <div className="mt-2 space-y-1.5">
                    {objetivo && (
                      <p className="text-sm flex items-center gap-1.5">
                        <span className="w-24 text-gray-500">Objetivo:</span>
                        <span className="font-medium">
                          {objetivo === "custom" ? objetivoCustom : objetivosPreDefinidos.find(o => o.id === objetivo)?.label}
                        </span>
                      </p>
                    )}
                    
                    {sugestaoSelecionada && (
                      <p className="text-sm flex items-center gap-1.5">
                        <span className="w-24 text-gray-500">Sugestão:</span>
                        <span className="font-medium">
                          {sugestoesFoco.find(s => s.id === sugestaoSelecionada)?.titulo}
                        </span>
                      </p>
                    )}
                    
                    {disciplinasSelecionadas.length > 0 && (
                      <p className="text-sm flex items-start gap-1.5">
                        <span className="w-24 text-gray-500">Disciplinas:</span>
                        <span className="font-medium">
                          {disciplinasSelecionadas.map(id => 
                            disciplinas.find(d => d.id === id)?.nome
                          ).join(", ")}
                        </span>
                      </p>
                    )}
                    
                    <p className="text-sm flex items-center gap-1.5">
                      <span className="w-24 text-gray-500">Tempo:</span>
                      <span className="font-medium">
                        {tempoEstudo >= 60 
                          ? `${Math.floor(tempoEstudo / 60)}h${tempoEstudo % 60 > 0 ? ` ${tempoEstudo % 60}min` : ''}`
                          : `${tempoEstudo}min`
                        }
                      </span>
                    </p>
                    
                    {tarefasSelecionadas.length > 0 && (
                      <p className="text-sm flex items-start gap-1.5">
                        <span className="w-24 text-gray-500">Tarefas:</span>
                        <span className="font-medium">
                          {tarefasSelecionadas.length} tarefas selecionadas
                        </span>
                      </p>
                    )}
                    
                    {sentimento && (
                      <p className="text-sm flex items-center gap-1.5">
                        <span className="w-24 text-gray-500">Sentimento:</span>
                        <span className="font-medium">
                          {sentimentos.find(s => s.id === sentimento)?.label}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter className={`p-4 border-t ${isLightMode ? 'border-gray-200' : 'border-gray-700'}`}>
          <div className="flex justify-between w-full items-center">
            <Button
              variant="outline"
              onClick={etapaAtual === 1 ? () => onOpenChange(false) : voltarEtapa}
              disabled={carregando}
              className="gap-1"
            >
              {etapaAtual === 1 ? 'Cancelar' : 'Voltar'}
            </Button>
            <div>
              {etapaAtual < 5 ? (
                <Button
                  onClick={avancarEtapa}
                  disabled={
                    (etapaAtual === 1 && !objetivo) || 
                    (etapaAtual === 1 && objetivo === "custom" && !objetivoCustom) ||
                    carregando
                  }
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF5A00] hover:to-[#FF7B30] text-white gap-1"
                >
                  Continuar <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={gerarFoco}
                  disabled={carregando}
                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF5A00] hover:to-[#FF7B30] text-white min-w-[120px]"
                >
                  {carregando ? (
                    <>
                      <span className="mr-2">Organizando seu dia</span>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
                          <path d="M12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                      </motion.div>
                    </>
                  ) : (
                    <>Gerar Foco</>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
