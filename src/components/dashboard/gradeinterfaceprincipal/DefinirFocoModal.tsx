import React, { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

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

const disciplinas = [
  { nome: "Matemática", tag: "Recente" },
  { nome: "Física", tag: "Dificuldade" },
  { nome: "Química", tag: "Recente" },
  { nome: "Biologia", tag: "Dificuldade" },
  { nome: "História", tag: "Recente" },
  { nome: "Geografia", tag: "" },
  { nome: "Português", tag: "Recente" },
  { nome: "Literatura", tag: "Dificuldade" }
];

const sugestoesFoco = [
  { titulo: "Prova de História", descricao: "Preparação para a prova da próxima semana", prioridade: "alta", prazo: "em 5 dias" },
  { titulo: "Revisão de Funções", descricao: "Revisar conceitos importantes para a prova de matemática", prioridade: "", prazo: "" },
  { titulo: "Exercícios de Física", descricao: "Completar lista de problemas do capítulo 3", prioridade: "alta", prazo: "" }
];

const tarefasRecentes = [
  { titulo: "Lista de exercícios de física", prazo: "16:00 hoje", urgente: true },
  { titulo: "Resumo do capítulo 8 de biologia", prazo: "amanhã", urgente: false },
  { titulo: "Pesquisa sobre Revolução Industrial", prazo: "quinta-feira", urgente: false },
  { titulo: "Resolver problemas de matemática", prazo: "sexta-feira", urgente: true }
];

const blocosTempoSugeridos = [
  { horario: "Hoje, 14:00 - 16:00", descricao: "Entre suas aulas de Matemática e Português" },
  { horario: "Hoje, 19:00 - 21:00", descricao: "Período livre após o jantar" }
];

const estadosEstudo = [
  { valor: "Motivado(a)", descricao: "Pronto para me dedicar ao máximo" },
  { valor: "Um pouco perdido(a)", descricao: "Preciso de orientação" },
  { valor: "Cansado(a)", descricao: "Gostaria de atividades mais leves" },
  { valor: "Ansioso(a)", descricao: "Tenho muitas preocupações" }
];

export default function DefinirFocoModal({ open, onClose, onSave }: DefinirFocoModalProps) {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  const [passo, setPasso] = useState(1);

  // Estados para cada passo do formulário
  const [objetivo, setObjetivo] = useState("");
  const [objetivoPersonalizado, setObjetivoPersonalizado] = useState("");
  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState<string[]>([]);
  const [topicoEspecifico, setTopicoEspecifico] = useState("");
  const [tempoEstudo, setTempoEstudo] = useState(60); // em minutos
  const [tarefasSelecionadas, setTarefasSelecionadas] = useState<string[]>([]);
  const [estadoEstudo, setEstadoEstudo] = useState("");

  // Resetar estado ao abrir ou fechar modal
  useEffect(() => {
    if (open) {
      setPasso(1);
      setObjetivo("");
      setObjetivoPersonalizado("");
      setDisciplinasSelecionadas([]);
      setTopicoEspecifico("");
      setTempoEstudo(60);
      setTarefasSelecionadas([]);
      setEstadoEstudo("");
    }
  }, [open]);

  const proximoPasso = () => {
    if (passo < 5) {
      setPasso(passo + 1);
    } else {
      // Enviar dados para o componente pai
      onSave({
        objetivo: objetivo === "Outro Objetivo (Personalizado)" ? objetivoPersonalizado : objetivo,
        objetivoPersonalizado,
        disciplinas: disciplinasSelecionadas,
        topicoEspecifico,
        tempoEstudo,
        tarefasSelecionadas,
        estado: estadoEstudo
      });
      onClose();
    }
  };

  const passoAnterior = () => {
    if (passo > 1) {
      setPasso(passo - 1);
    }
  };

  const toggleDisciplina = (disciplina: string) => {
    if (disciplinasSelecionadas.includes(disciplina)) {
      setDisciplinasSelecionadas(disciplinasSelecionadas.filter(d => d !== disciplina));
    } else {
      setDisciplinasSelecionadas([...disciplinasSelecionadas, disciplina]);
    }
  };

  const toggleTarefa = (tarefa: string) => {
    if (tarefasSelecionadas.includes(tarefa)) {
      setTarefasSelecionadas(tarefasSelecionadas.filter(t => t !== tarefa));
    } else {
      setTarefasSelecionadas([...tarefasSelecionadas, tarefa]);
    }
  };

  // Função auxiliar para formatar o tempo
  const formatarTempo = (minutos: number) => {
    if (minutos < 60) {
      return `${minutos}min`;
    } else {
      const horas = Math.floor(minutos / 60);
      return `${horas}h`;
    }
  };

  // Calcular progresso do preenchimento do formulário
  const calcularProgressoFormulario = () => {
    let progresso = 0;
    const total = 5; // Total de campos principais a serem preenchidos
    
    if (objetivo) progresso += 1;
    if (objetivoPersonalizado) progresso += 1;
    if (disciplinas.length > 0) progresso += 1;
    if (tempoEstudo > 0) progresso += 1;
    if (estado) progresso += 1;
    
    return Math.min(Math.round((progresso / total) * 100), 100);
  };

  const progressoFormulario = calcularProgressoFormulario();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
        {/* Barra de progresso no topo */}
        <div className="relative bg-gradient-to-
          <div className="absolute top-0 left-0 h-1 bg-[#FF6B00]/10 w-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#FF6B00]" 
              initial={{ width: '0%' }}
              animate={{ width: `${progressoFormulario}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>r from-[#FF6B00] to-[#FF8C40] h-2"></div>

        {/* Cabeçalho do modal */}
        <div className="p-6 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isLightMode ? 'bg-orange-100' : 'bg-[#FF6B00]/20'}`}>
              <motion.div 
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className={`text-[#FF6B00] rounded-full flex items-center justify-center`}
              >
                <Clock className="h-5 w-5" />
              </motion.div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Defina Seu Foco de Estudos com o Epictus IA
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Vamos ajudar você a organizar seu dia de estudos de forma personalizada
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Conteúdo principal do modal */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Passo 1: Objetivo de estudo */}
          {passo === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-orange-100 dark:bg-orange-900/50 text-[#FF6B00] w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <h3 className="font-medium">Qual seu principal objetivo de estudo para hoje?</h3>
              </div>

              <div className="space-y-2">
                {objetivosEstudo.map((obj) => (
                  <div 
                    key={obj}
                    onClick={() => setObjetivo(obj)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      objetivo === obj 
                        ? 'border-[#FF6B00] bg-orange-50 dark:bg-[#FF6B00]/10' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        objetivo === obj 
                          ? 'border-[#FF6B00] bg-[#FF6B00]' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {objetivo === obj && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <span className={`${objetivo === obj ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                        {obj}
                      </span>
                    </div>

                    {/* Campo personalizado caso "Outro" seja selecionado */}
                    {objetivo === "Outro Objetivo (Personalizado)" && obj === "Outro Objetivo (Personalizado)" && (
                      <div className="mt-3 pl-8">
                        <input
                          type="text"
                          value={objetivoPersonalizado}
                          onChange={(e) => setObjetivoPersonalizado(e.target.value)}
                          placeholder="Descreva seu objetivo..."
                          className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] dark:text-white"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Sugestões baseadas no perfil */}
              <div className="mt-6">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <span className="text-[#FF6B00]">▸</span> Sugestões com base no seu perfil:
                </div>

                <div className="space-y-2">
                  {sugestoesFoco.map((sugestao, index) => (
                    <div 
                      key={index}
                      onClick={() => setObjetivo(sugestao.titulo)}
                      className={`p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-orange-200 dark:hover:border-orange-800 transition-all ${
                        objetivo === sugestao.titulo ? 'border-[#FF6B00] bg-orange-50 dark:bg-[#FF6B00]/10' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{sugestao.titulo}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{sugestao.descricao}</p>
                        </div>
                        {sugestao.prioridade && (
                          <span className="text-xs font-medium text-red-600 dark:text-red-400">
                            Prioridade {sugestao.prioridade}
                          </span>
                        )}
                      </div>
                      {sugestao.prazo && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                          <Clock className="h-3 w-3" /> Prazo: {sugestao.prazo}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Passo 2: Disciplinas ou tópicos prioritários */}
          {passo === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-orange-100 dark:bg-orange-900/50 text-[#FF6B00] w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <h3 className="font-medium">Quais disciplinas ou tópicos são prioridade?</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Selecione as disciplinas que deseja priorizar nos seus estudos
              </p>

              <div className="grid grid-cols-2 gap-3">
                {disciplinas.map((disciplina) => (
                  <div 
                    key={disciplina.nome}
                    onClick={() => toggleDisciplina(disciplina.nome)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      disciplinasSelecionadas.includes(disciplina.nome) 
                        ? 'border-[#FF6B00] bg-orange-50 dark:bg-[#FF6B00]/10' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                        disciplinasSelecionadas.includes(disciplina.nome) 
                          ? 'border-[#FF6B00] bg-[#FF6B00]' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {disciplinasSelecionadas.includes(disciplina.nome) && (
                          <CheckCircle className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className={disciplinasSelecionadas.includes(disciplina.nome) ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-700 dark:text-gray-300'}>
                        {disciplina.nome}
                      </span>
                    </div>

                    {disciplina.tag && (
                      <div className="mt-1 ml-8">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          disciplina.tag === 'Recente' 
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                            : 'bg-yellow-100 text-amber-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {disciplina.tag}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Campo para tópico específico */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tópico específico (opcional)
                </label>
                <textarea
                  value={topicoEspecifico}
                  onChange={(e) => setTopicoEspecifico(e.target.value)}
                  placeholder="Ex: Equações do segundo grau, Revolução Francesa, etc."
                  className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] resize-none"
                  rows={3}
                />
              </div>
            </motion.div>
          )}

          {/* Passo 3: Tempo de estudo */}
          {passo === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-orange-100 dark:bg-orange-900/50 text-[#FF6B00] w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <h3 className="font-medium">Quanto tempo você pretende dedicar aos estudos hoje?</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Isso nos ajudará a planejar a quantidade adequada de atividades
              </p>

              <div className="relative pb-12 pt-2 px-4">
                <Slider 
                  value={[tempoEstudo]} 
                  onValueChange={(value) => setTempoEstudo(value[0])}
                  max={240}
                  min={15}
                  step={15}
                  className="z-10"
                />

                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>15min</span>
                  <span>1h</span>
                  <span>2h</span>
                  <span>4h</span>
                </div>
              </div>

              {/* Tempo selecionado destacado */}
              <div className="flex justify-center mt-2">
                <div className="bg-orange-100 dark:bg-[#FF6B00]/20 text-[#FF6B00] font-medium rounded-full px-5 py-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> {formatarTempo(tempoEstudo)}
                </div>
              </div>

              {/* Blocos de tempo sugeridos */}
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    Blocos de tempo sugeridos na sua agenda
                  </h4>
                </div>

                <div className="space-y-3 mt-2">
                  {blocosTempoSugeridos.map((bloco, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-md p-3 shadow-sm">
                      <p className="font-medium text-gray-800 dark:text-gray-200">{bloco.horario}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{bloco.descricao}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Passo 4: Tarefas com atenção imediata */}
          {passo === 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-orange-100 dark:bg-orange-900/50 text-[#FF6B00] w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <h3 className="font-medium">Há alguma tarefa ou prazo específico que precisa de atenção imediata?</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Selecione as tarefas que deseja incluir no seu foco de hoje
              </p>

              <div className="space-y-2">
                {tarefasRecentes.map((tarefa, index) => (
                  <div 
                    key={index}
                    onClick={() => toggleTarefa(tarefa.titulo)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all relative ${
                      tarefasSelecionadas.includes(tarefa.titulo) 
                        ? 'border-[#FF6B00] bg-orange-50 dark:bg-[#FF6B00]/10' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-800'
                    }`}
                  >
                    {tarefa.urgente && (
                      <span className="absolute top-2 right-3 px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        Urgente
                      </span>
                    )}

                    <div className="flex items-center gap-3 pr-16">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                        tarefasSelecionadas.includes(tarefa.titulo) 
                          ? 'border-[#FF6B00] bg-[#FF6B00]' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {tarefasSelecionadas.includes(tarefa.titulo) && (
                          <CheckCircle className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div>
                        <p className={`${tarefasSelecionadas.includes(tarefa.titulo) ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                          {tarefa.titulo}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-red-500 dark:text-red-400">
                          <Clock className="h-3 w-3 mr-1" /> Prazo: {tarefa.prazo}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dica do Mentor IA */}
              <div className="mt-4 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-green-200 dark:bg-green-700 rounded-full p-1">
                    <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-300" />
                  </div>
                  <h4 className="text-sm font-medium text-green-700 dark:text-green-400">
                    Dica do Mentor IA
                  </h4>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Organizar suas tarefas por prazo e importância ajuda a reduzir a procrastinação. Sempre comece pelas tarefas mais urgentes ou mais difíceis quando estiver com mais energia.
                </p>
              </div>
            </motion.div>
          )}

          {/* Passo 5: Estado emocional */}
          {passo === 5 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-orange-100 dark:bg-orange-900/50 text-[#FF6B00] w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">
                  5
                </div>
                <h3 className="font-medium">Como você está se sentindo em relação aos seus estudos?</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Isso nos ajudará a adaptar melhor as sugestões para você
              </p>

              <div className="grid grid-cols-2 gap-3">
                {estadosEstudo.map((estado) => (
                  <div 
                    key={estado.valor}
                    onClick={() => setEstadoEstudo(estado.valor)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      estadoEstudo === estado.valor 
                        ? 'border-[#FF6B00] bg-orange-50 dark:bg-[#FF6B00]/10' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        estadoEstudo === estado.valor 
                          ? 'border-[#FF6B00] bg-[#FF6B00]' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {estadoEstudo === estado.valor && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <span className={estadoEstudo === estado.valor ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-700 dark:text-gray-300'}>
                        {estado.valor}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-8">
                      {estado.descricao}
                    </p>
                  </div>
                ))}
              </div>

              {/* Resumo das escolhas */}
              <div className="mt-6 bg-orange-50 dark:bg-[#FF6B00]/10 rounded-lg p-4 border border-orange-100 dark:border-[#FF6B00]/20">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                  <span className="text-[#FF6B00]">◆</span> Resumo das suas escolhas
                </h4>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Objetivo:</span>
                    <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                      {objetivo === "Outro Objetivo (Personalizado)" ? objetivoPersonalizado : objetivo}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Tempo:</span>
                    <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">
                      {formatarTempo(tempoEstudo)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Rodapé com botões de navegação */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between">
          {passo > 1 ? (
            <Button
              variant="outline"
              onClick={passoAnterior}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Voltar
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
          )}

          <Button 
            onClick={proximoPasso}
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF5B00] hover:to-[#FF7C30] text-white border-none flex items-center gap-1"
          >
            {passo === 5 ? "Gerar Foco" : "Continuar"} {passo < 5 && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}