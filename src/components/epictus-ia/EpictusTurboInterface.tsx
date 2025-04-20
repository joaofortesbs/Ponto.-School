
import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Brain, 
  MessageSquare,
  BookOpen,
  FileText,
  BarChart3,
  Settings,
  Search,
  Sparkles,
  Send,
  ChevronRight,
  BookText,
  PenTool,
  Lightbulb,
  CheckCircle,
  Clock,
  X,
  User,
  Users,
  PieChart,
  Download,
  Share2,
  Star,
  PlayCircle,
  HelpCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function EpictusTurboInterface() {
  const { theme } = useTheme();
  const [activeProfile, setActiveProfile] = useState<"teacher" | "student" | "coordinator">("student");
  const [command, setCommand] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeechInput, setIsSpeechInput] = useState(false);
  const [checklistItems, setChecklistItems] = useState<any[]>([]);
  const [activeModules, setActiveModules] = useState<any[]>([]);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const commandInputRef = useRef<HTMLInputElement>(null);

  // Desativar Turbo ao sair da página
  const handleDeactivateTurbo = () => {
    localStorage.removeItem("epictus_turbo_active");
    window.location.reload();
  };

  // Placeholder de comandos rotativos
  const placeholders = [
    "Criar aula sobre Segunda Guerra para o 9º ano...",
    "Me prepare para a prova de Cálculo 1...",
    "Planejar uma sequência didática sobre Revolução Francesa...",
    "Quero um plano de estudos para o ENEM em 3 semanas...",
    "Corrigir redações da minha turma com rubrica personalizada...",
    "Criar um quiz interativo sobre Biologia Celular..."
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Efeito para alternar entre os placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Função para processar o comando
  const processCommand = () => {
    if (!command.trim()) return;
    
    setIsProcessing(true);
    setActiveModules([]);
    setTerminalLogs([]);
    
    // Simulando checklist baseado no perfil
    setTimeout(() => {
      let items = [];
      
      if (activeProfile === "student") {
        items = [
          { id: 1, title: "Diagnosticar dificuldade e objetivo", status: "pending" },
          { id: 2, title: "Analisar tempo disponível", status: "pending" },
          { id: 3, title: "Gerar plano de estudos personalizado", status: "pending" },
          { id: 4, title: "Criar explicações simplificadas com visuais", status: "pending" },
          { id: 5, title: "Gerar caderno digital com anotações", status: "pending" },
          { id: 6, title: "Criar jogos e quizzes de reforço", status: "pending" },
          { id: 7, title: "Montar simulado com correção comentada", status: "pending" },
          { id: 8, title: "Criar cronograma de revisão", status: "pending" }
        ];
      } else if (activeProfile === "teacher") {
        items = [
          { id: 1, title: "Identificar ano/série e disciplina", status: "pending" },
          { id: 2, title: "Verificar competências da BNCC", status: "pending" },
          { id: 3, title: "Gerar plano de aula completo", status: "pending" },
          { id: 4, title: "Criar slides com estrutura lógica", status: "pending" },
          { id: 5, title: "Adicionar exemplos visuais e analogias", status: "pending" },
          { id: 6, title: "Gerar lista de exercícios com gabarito", status: "pending" },
          { id: 7, title: "Criar quiz interativo com gamificação", status: "pending" },
          { id: 8, title: "Empacotar aula com opção de exportar", status: "pending" }
        ];
      } else {
        items = [
          { id: 1, title: "Analisar demanda do professor", status: "pending" },
          { id: 2, title: "Gerar planejamento pedagógico", status: "pending" },
          { id: 3, title: "Organizar calendários escolares", status: "pending" },
          { id: 4, title: "Criar plano de formação docente", status: "pending" },
          { id: 5, title: "Validar plano de aula com critérios", status: "pending" },
          { id: 6, title: "Agendar revisões curriculares", status: "pending" },
          { id: 7, title: "Criar relatórios visuais com métricas", status: "pending" }
        ];
      }
      
      setChecklistItems(items);
      executeChecklist();
    }, 1000);
  };

  // Função para executar o checklist de forma animada
  const executeChecklist = () => {
    let currentIndex = 0;
    let modules: any[] = [];
    
    const interval = setInterval(() => {
      // Atualizar o item atual para "em progresso"
      setChecklistItems(prevItems => 
        prevItems.map((item, idx) => 
          idx === currentIndex ? { ...item, status: "in-progress" } : item
        )
      );
      
      // Adicionar log no terminal
      addTerminalLog(`Executando: ${checklistItems[currentIndex]?.title}...`);
      
      // Simular processamento com progresso
      setTimeout(() => {
        // Marcar o item como concluído
        setChecklistItems(prevItems => 
          prevItems.map((item, idx) => 
            idx === currentIndex ? { ...item, status: "completed" } : item
          )
        );
        
        // Adicionar um módulo gerado
        const newModule = {
          id: `module-${currentIndex + 1}`,
          title: getModuleTitle(currentIndex, activeProfile),
          type: getModuleType(currentIndex, activeProfile),
          content: "Conteúdo gerado pela IA baseado no seu comando"
        };
        
        modules.push(newModule);
        setActiveModules([...modules]);
        
        addTerminalLog(`✅ Concluído: ${checklistItems[currentIndex]?.title}`);
        
        // Atualizar progresso
        setExecutionProgress(((currentIndex + 1) / checklistItems.length) * 100);
        
        currentIndex++;
        if (currentIndex >= checklistItems.length) {
          clearInterval(interval);
          setIsProcessing(false);
          addTerminalLog("🎉 Processo finalizado com sucesso!");
        }
      }, 800);
    }, 2000);
    
    return () => clearInterval(interval);
  };
  
  // Função para adicionar logs no terminal
  const addTerminalLog = (log: string) => {
    setTerminalLogs(prev => [...prev, log]);
  };
  
  // Funções auxiliares para gerar títulos e tipos de módulos
  const getModuleTitle = (index: number, profile: string) => {
    if (profile === "student") {
      const titles = [
        "Diagnóstico Personalizado",
        "Análise de Tempo Disponível",
        "Plano de Estudos Adaptativo",
        "Explicações Visuais Simplificadas",
        "Caderno Digital Inteligente",
        "Quiz Gamificado de Reforço",
        "Simulado com Correção Automática",
        "Cronograma de Revisão Espaçada"
      ];
      return titles[index] || `Módulo ${index + 1}`;
    } else if (profile === "teacher") {
      const titles = [
        "Identificação de Série e Disciplina",
        "Mapeamento BNCC",
        "Plano de Aula Completo",
        "Slides Didáticos Interativos",
        "Banco de Exemplos e Analogias",
        "Lista de Exercícios com Gabarito",
        "Quiz Interativo Gamificado",
        "Kit Educacional Completo"
      ];
      return titles[index] || `Módulo ${index + 1}`;
    } else {
      const titles = [
        "Análise de Demanda Docente",
        "Planejamento Pedagógico BNCC",
        "Calendário Escolar Interativo",
        "Plano de Formação Continuada",
        "Validação de Planos de Aula",
        "Cronograma de Revisões Curriculares",
        "Dashboard de Métricas Educacionais"
      ];
      return titles[index] || `Módulo ${index + 1}`;
    }
  };
  
  const getModuleType = (index: number, profile: string) => {
    if (profile === "student") {
      const types = ["diagnóstico", "análise", "plano", "explicação", "caderno", "quiz", "simulado", "cronograma"];
      return types[index] || "módulo";
    } else if (profile === "teacher") {
      const types = ["identificação", "mapeamento", "plano", "slides", "exemplos", "exercícios", "quiz", "kit"];
      return types[index] || "módulo";
    } else {
      const types = ["análise", "planejamento", "calendário", "formação", "validação", "cronograma", "dashboard"];
      return types[index] || "módulo";
    }
  };

  return (
    <div className={`min-h-screen w-full ${theme === "dark" ? "bg-[#0A0A18]" : "bg-gray-50"} transition-colors duration-300`}>
      {/* Header com fumaça neon e partículas */}
      <div className={`relative p-4 ${theme === "dark" ? "bg-[#0A1025]" : "bg-white"} border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo e Título */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FFB627] flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                {/* Efeito de brilho */}
                <motion.div 
                  className="absolute -inset-1 bg-gradient-to-r from-[#FF6B00]/50 to-[#FFB627]/50 rounded-full blur-md opacity-50"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <h2 className={`font-bold text-xl ${theme === "dark" ? "text-white" : "text-[#29335C]"} flex items-center gap-2`}>
                  Epictus Turbo
                  <Badge className="bg-gradient-to-r from-[#FF6B00] to-[#FFB627] text-white border-0">Único</Badge>
                </h2>
                <p className={`text-xs ${theme === "dark" ? "text-white/60" : "text-[#64748B]"}`}>
                  IA Educacional Autônoma
                </p>
              </div>
            </div>
            
            {/* Alternador de Perfil */}
            <div className="flex items-center gap-4">
              <div className="flex bg-black/20 backdrop-blur-md rounded-full p-1">
                <Button 
                  variant={activeProfile === "student" ? "default" : "ghost"} 
                  size="sm" 
                  className={`rounded-full px-3 ${activeProfile === "student" ? "bg-gradient-to-r from-[#FF6B00] to-[#FFB627] text-white" : "text-gray-400"}`}
                  onClick={() => setActiveProfile("student")}
                >
                  <User className="h-4 w-4 mr-1" /> Estudante
                </Button>
                <Button 
                  variant={activeProfile === "teacher" ? "default" : "ghost"} 
                  size="sm" 
                  className={`rounded-full px-3 ${activeProfile === "teacher" ? "bg-gradient-to-r from-[#FF6B00] to-[#FFB627] text-white" : "text-gray-400"}`}
                  onClick={() => setActiveProfile("teacher")}
                >
                  <BookOpen className="h-4 w-4 mr-1" /> Professor
                </Button>
                <Button 
                  variant={activeProfile === "coordinator" ? "default" : "ghost"} 
                  size="sm" 
                  className={`rounded-full px-3 ${activeProfile === "coordinator" ? "bg-gradient-to-r from-[#FF6B00] to-[#FFB627] text-white" : "text-gray-400"}`}
                  onClick={() => setActiveProfile("coordinator")}
                >
                  <Users className="h-4 w-4 mr-1" /> Coordenador
                </Button>
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="rounded-full"
                      onClick={handleDeactivateTurbo}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Desativar Turbo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
      
      {/* Terminal de Comando Inteligente */}
      <div className={`p-6 ${theme === "dark" ? "bg-[#0A1025]/50" : "bg-white/50"} backdrop-blur-md`}>
        <div className="max-w-3xl mx-auto">
          <div 
            className={`relative overflow-hidden rounded-xl border ${
              theme === "dark" ? "border-gray-700/50" : "border-gray-200"
            } ${
              isProcessing ? "bg-black/50" : theme === "dark" ? "bg-[#131836]/80" : "bg-white/80"
            } backdrop-blur-md shadow-xl transition-all duration-300`}
          >
            {/* Efeito de ondas de energia */}
            {isProcessing && (
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-[#FF6B00]/10 via-transparent to-[#FFB627]/10 pointer-events-none"
                animate={{ 
                  background: ["linear-gradient(to right, rgba(255,107,0,0.1), rgba(0,0,0,0), rgba(255,182,39,0.1))", 
                              "linear-gradient(to right, rgba(255,182,39,0.1), rgba(0,0,0,0), rgba(255,107,0,0.1))"] 
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            
            <div className="relative z-10 p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Zap className={`h-5 w-5 ${theme === "dark" ? "text-[#FF6B00]" : "text-[#FF6B00]"}`} />
                  <h3 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                    Terminal de Comando Turbo
                  </h3>
                </div>
                
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      ref={commandInputRef}
                      placeholder={placeholders[placeholderIndex]}
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      className={`bg-transparent border-2 ${
                        theme === "dark" ? "border-gray-700/50 text-white" : "border-gray-300 text-gray-900"
                      } h-12 pl-4 pr-12 rounded-lg focus:ring-2 focus:ring-[#FF6B00]/50 focus:border-[#FF6B00]`}
                      disabled={isProcessing}
                    />
                    <button 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                      onClick={() => {
                        setIsSpeechInput(!isSpeechInput);
                        // Aqui você implementaria a integração real com Web Speech API
                      }}
                    >
                      <MessageSquare className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      className={`h-12 px-6 bg-gradient-to-r from-[#FF6B00] to-[#FFB627] hover:from-[#FF6B00]/90 hover:to-[#FFB627]/90 text-white font-medium rounded-lg flex items-center gap-2 ${
                        isProcessing ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={processCommand}
                      disabled={isProcessing || !command.trim()}
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processando
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5" /> Ativar Turbo
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Área principal (Checklist + Módulos) */}
      <div className="max-w-7xl mx-auto p-6 flex flex-col lg:flex-row gap-6">
        {/* Checklist Estratégico */}
        {checklistItems.length > 0 && (
          <div className="w-full lg:w-1/3">
            <div className={`rounded-xl overflow-hidden border ${
              theme === "dark" ? "border-gray-800 bg-[#0A1025]/50" : "border-gray-200 bg-white/80"
            } backdrop-blur-md shadow-lg`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[#FF6B00]" />
                  <h3 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                    Plano de Ação Turbo
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {isProcessing ? (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                      Em Progresso
                    </Badge>
                  ) : executionProgress === 100 ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      Concluído
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      Planejado
                    </Badge>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => setShowTerminal(!showTerminal)}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="p-4 space-y-3">
                  {checklistItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-lg flex items-start gap-3 ${
                        item.status === "completed" 
                          ? theme === "dark" ? "bg-green-500/10 border border-green-500/20" : "bg-green-50 border border-green-200"
                          : item.status === "in-progress" 
                            ? theme === "dark" ? "bg-amber-500/10 border border-amber-500/20" : "bg-amber-50 border border-amber-200"
                            : theme === "dark" ? "bg-gray-800/50 border border-gray-700" : "bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {item.status === "completed" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : item.status === "in-progress" ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Clock className="h-5 w-5 text-amber-500" />
                          </motion.div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          item.status === "completed" 
                            ? "text-green-700 dark:text-green-400" 
                            : item.status === "in-progress" 
                              ? "text-amber-700 dark:text-amber-400"
                              : theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}>
                          {item.title}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
              
              {executionProgress > 0 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Progresso
                      </span>
                      <span className={`text-xs font-medium ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                        {Math.round(executionProgress)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FFB627]"
                        initial={{ width: "0%" }}
                        animate={{ width: `${executionProgress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Terminal de Logs (Colapsável) */}
            {showTerminal && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-4 rounded-xl overflow-hidden border ${
                  theme === "dark" ? "border-gray-800 bg-[#0A1025]" : "border-gray-200 bg-white"
                }`}
              >
                <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex justify-between">
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-[#FF6B00]">$</code>
                    <h4 className={`text-sm font-mono ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      Logs de Execução
                    </h4>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => setShowTerminal(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <ScrollArea className="h-48">
                  <div className="p-3 font-mono text-xs space-y-1">
                    {terminalLogs.map((log, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className={theme === "dark" ? "text-gray-300" : "text-gray-700"}
                      >
                        <span className="text-[#FF6B00]">{'>'}</span> {log}
                      </motion.div>
                    ))}
                    {isProcessing && (
                      <div className={`flex items-center gap-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        <span className="text-[#FF6B00]">{'>'}</span>
                        <span className="inline-flex">
                          <span className="animate-pulse">.</span>
                          <span className="animate-pulse" style={{ animationDelay: "300ms" }}>.</span>
                          <span className="animate-pulse" style={{ animationDelay: "600ms" }}>.</span>
                        </span>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </div>
        )}
        
        {/* Módulos Gerados */}
        <div className={`flex-1 ${checklistItems.length === 0 ? "w-full" : ""}`}>
          {activeModules.length > 0 ? (
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                Módulos Gerados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeModules.map((module, index) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    theme={theme}
                    delay={index * 0.2}
                  />
                ))}
              </div>
              
              {/* Botão de Empacotar (aparece quando todos os módulos estão prontos) */}
              {executionProgress === 100 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center mt-8"
                >
                  <Button 
                    className="bg-gradient-to-r from-[#FF6B00] to-[#FFB627] hover:from-[#FF6B00]/90 hover:to-[#FFB627]/90 text-white px-8 py-6 rounded-xl shadow-lg"
                  >
                    <Download className="h-5 w-5 mr-2" /> 
                    Empacotar Kit Educacional Completo
                  </Button>
                </motion.div>
              )}
            </div>
          ) : (!isProcessing && checklistItems.length === 0) && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className={`w-16 h-16 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-4`}>
                <Sparkles className="h-8 w-8 text-[#FF6B00]" />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                Pronto para começar
              </h3>
              <p className={`max-w-md ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                Digite seu comando no Terminal Turbo e deixe a IA planejar, criar e organizar todo o conteúdo para você.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 w-full max-w-3xl">
                {[
                  {
                    title: "Para Estudantes",
                    icon: <User className="h-5 w-5 text-[#FF6B00]" />,
                    text: "Planos de estudo, resumos, simulados e muito mais"
                  },
                  {
                    title: "Para Professores",
                    icon: <BookOpen className="h-5 w-5 text-[#FF6B00]" />,
                    text: "Planos de aula, slides, atividades e avaliações"
                  },
                  {
                    title: "Para Coordenadores",
                    icon: <Users className="h-5 w-5 text-[#FF6B00]" />,
                    text: "Planejamentos, formações e análises de desempenho"
                  }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-xl border ${
                      theme === "dark" ? "border-gray-800 bg-[#0A1025]/50" : "border-gray-200 bg-white"
                    } flex flex-col items-center text-center`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-3">
                      {item.icon}
                    </div>
                    <h4 className={`font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                      {item.title}
                    </h4>
                    <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente de Card de Módulo
function ModuleCard({ module, theme, delay = 0 }) {
  const getIconByType = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      "diagnóstico": <PieChart className="h-5 w-5" />,
      "análise": <BarChart3 className="h-5 w-5" />,
      "plano": <FileText className="h-5 w-5" />,
      "explicação": <Lightbulb className="h-5 w-5" />,
      "caderno": <BookText className="h-5 w-5" />,
      "quiz": <HelpCircle className="h-5 w-5" />,
      "simulado": <PenTool className="h-5 w-5" />,
      "cronograma": <Clock className="h-5 w-5" />,
      "identificação": <Search className="h-5 w-5" />,
      "mapeamento": <Zap className="h-5 w-5" />,
      "slides": <Lightbulb className="h-5 w-5" />,
      "exemplos": <Brain className="h-5 w-5" />,
      "exercícios": <FileText className="h-5 w-5" />,
      "kit": <BookOpen className="h-5 w-5" />,
      "calendário": <Clock className="h-5 w-5" />,
      "formação": <Lightbulb className="h-5 w-5" />,
      "validação": <CheckCircle className="h-5 w-5" />,
      "dashboard": <BarChart3 className="h-5 w-5" />,
    };
    
    return icons[type] || <FileText className="h-5 w-5" />;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-xl border ${
        theme === "dark" ? "border-gray-800 bg-[#0A1025]/90" : "border-gray-200 bg-white"
      } overflow-hidden shadow-md hover:shadow-lg transition-all duration-200`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full bg-[#FF6B00]/10 flex items-center justify-center`}>
            {getIconByType(module.type)}
          </div>
          <h4 className={`font-medium text-sm ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            {module.title}
          </h4>
        </div>
        <Badge variant="outline" className={`capitalize ${
          theme === "dark" ? "bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20" : "bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20"
        }`}>
          {module.type}
        </Badge>
      </div>
      
      <div className={`p-3 ${theme === "dark" ? "text-gray-300" : "text-gray-600"} text-sm min-h-[100px]`}>
        <p>Conteúdo personalizado gerado pela IA baseado no seu comando.</p>
        <p className="mt-2 text-xs text-gray-400">Tags: #educação #personalizado #epictusIA</p>
      </div>
      
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 flex justify-between">
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <PenTool className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Star className="h-4 w-4" />
          </Button>
        </div>
        
        <Button variant="outline" size="sm" className="text-xs gap-1">
          <PlayCircle className="h-3 w-3" /> Visualizar
        </Button>
      </div>
    </motion.div>
  );
}
