
import React, { useState, useEffect, useRef } from "react";
import { 
  Brain, Lightbulb, Send, ArrowRight, BarChart2, Sparkles, Zap, Check, Star, 
  Wand2, Rocket, BookOpen, MessageSquare, Trophy, Flame, BookMarked, Target, 
  BarChart, Clock, Compass, FileText, PieChart, Gauge, Workflow
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function EpictusIACopilotoCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  const [pergunta, setPergunta] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [planoGerado, setPlanoGerado] = useState(null);
  const [necessidadeOriginal, setNecessidadeOriginal] = useState("");
  const [animateInput, setAnimateInput] = useState(false);
  const [showPopularTags, setShowPopularTags] = useState(true);
  const [showFerramentasPopulares, setShowFerramentasPopulares] = useState(true);
  const [statusBar, setStatusBar] = useState({
    eficiencia: 85,
    personalizacao: 92,
    versatilidade: 78
  });
  const [estatisticas, setEstatisticas] = useState({
    planificacoes: 8243,
    recursos: 12,
    ferramentas: 24
  });
  const chatEndRef = useRef(null);
  
  // Ferramentas mais usadas pela comunidade
  const ferramentasPopulares = [
    { nome: "Resumidor", icone: "BookMarked", usos: 327, eficiencia: 92 },
    { nome: "Slides", icone: "FileText", usos: 284, eficiencia: 88 },
    { nome: "Revisão", icone: "Gauge", usos: 252, eficiencia: 94 }
  ];

  // Tratar envio de pergunta rápida para a IA
  const handleEnviarPergunta = (e) => {
    e.preventDefault();
    if (pergunta.trim()) {
      console.log("Necessidade enviada para IA:", pergunta);
      setNecessidadeOriginal(pergunta);
      setIsProcessing(true);

      // Simulação do processamento da IA
      setTimeout(() => {
        gerarPlanoDeAcao(pergunta);
        setIsProcessing(false);
        setPergunta("");
      }, 1500);
    }
  };

  // Função para gerar plano de ação com base na necessidade
  const gerarPlanoDeAcao = (necessidade) => {
    // Simplificação - em produção, isto seria processado pelo backend
    const necessidadeLower = necessidade.toLowerCase();

    let plano = {
      titulo: "Seu Plano Personalizado",
      passos: []
    };

    // Regras básicas para gerar plano baseado em palavras-chave
    if (necessidadeLower.includes("apresentação") || necessidadeLower.includes("slides")) {
      plano.titulo = "Seu Plano para Criar uma Apresentação";
      plano.passos = [
        {
          numero: 1,
          titulo: "Pesquisar e Resumir",
          descricao: "Use o Gerador de Resumos para organizar o conteúdo principal",
          ferramenta: "resumo-inteligente",
          icone: "BookOpen",
          tempo: "15 min",
          dificuldade: "Fácil",
          eficacia: 92,
          usuariosUtilizando: 215
        },
        {
          numero: 2,
          titulo: "Estruturar Ideias",
          descricao: "Organize seu pensamento com nosso Gerador de Mapas Mentais",
          ferramenta: "mapa-mental",
          icone: "Brain",
          tempo: "20 min",
          dificuldade: "Médio",
          eficacia: 87,
          usuariosUtilizando: 178
        },
        {
          numero: 3,
          titulo: "Criar Slides",
          descricao: "Crie slides profissionais com nossa ferramenta de Slides Didáticos",
          ferramenta: "slides-didaticos",
          icone: "FileText",
          tempo: "30 min",
          dificuldade: "Médio",
          eficacia: 94,
          usuariosUtilizando: 312
        }
      ];
    } else if (necessidadeLower.includes("quiz") || necessidadeLower.includes("teste")) {
      plano.titulo = "Seu Plano para Criar um Quiz";
      plano.passos = [
        {
          numero: 1,
          titulo: "Definir Objetivos",
          descricao: "Use o Assistente de Objetivos para definir o propósito do quiz",
          ferramenta: "objetivos-aprendizagem",
          icone: "Target",
          tempo: "10 min",
          dificuldade: "Fácil",
          eficacia: 89,
          usuariosUtilizando: 145
        },
        {
          numero: 2,
          titulo: "Elaborar Questões",
          descricao: "Crie questões eficazes com o Gerador de Questões",
          ferramenta: "gerador-questoes",
          icone: "MessageSquare",
          tempo: "25 min",
          dificuldade: "Médio",
          eficacia: 91,
          usuariosUtilizando: 203
        }
      ];
    } else if (necessidadeLower.includes("resumo")) {
      plano.titulo = "Seu Plano para Criar um Resumo";
      plano.passos = [
        {
          numero: 1,
          titulo: "Extrair Pontos-Chave",
          descricao: "Use o Resumidor Inteligente para destacar os conceitos principais",
          ferramenta: "resumo-inteligente",
          icone: "BookOpen",
          tempo: "15 min",
          dificuldade: "Fácil",
          eficacia: 95,
          usuariosUtilizando: 327
        },
        {
          numero: 2,
          titulo: "Organizar Conteúdo",
          descricao: "Organize o conteúdo com ferramentas de estruturação",
          ferramenta: "organizador-conteudo",
          icone: "Workflow",
          tempo: "20 min",
          dificuldade: "Médio",
          eficacia: 86,
          usuariosUtilizando: 189
        }
      ];
    } else if (necessidadeLower.includes("redação") || necessidadeLower.includes("texto") || necessidadeLower.includes("escrever")) {
      plano.titulo = "Seu Plano para Melhorar sua Redação";
      plano.passos = [
        {
          numero: 1,
          titulo: "Elaborar Estrutura",
          descricao: "Planeje sua redação com o Organizador de Ideias",
          ferramenta: "organizador-ideias",
          icone: "Brain",
          tempo: "15 min",
          dificuldade: "Médio",
          eficacia: 88,
          usuariosUtilizando: 174
        },
        {
          numero: 2,
          titulo: "Revisar Conteúdo",
          descricao: "Use o Revisor de Textos para aprimorar a qualidade",
          ferramenta: "revisor-textos",
          icone: "FileText",
          tempo: "20 min",
          dificuldade: "Médio",
          eficacia: 92,
          usuariosUtilizando: 238
        }
      ];
    } else {
      // Plano genérico para outras necessidades
      plano.titulo = "Seu Plano de Ação";
      plano.passos = [
        {
          numero: 1,
          titulo: "Explorar Conteúdo",
          descricao: "Use o Tutor Inteligente para obter explicações detalhadas",
          ferramenta: "tutor-inteligente",
          icone: "Lightbulb",
          tempo: "20 min",
          dificuldade: "Fácil",
          eficacia: 87,
          usuariosUtilizando: 211
        },
        {
          numero: 2,
          titulo: "Organizar Estudo",
          descricao: "Crie um plano de estudos organizado com o Cronograma Inteligente",
          ferramenta: "cronograma-estudos",
          icone: "Clock",
          tempo: "25 min",
          dificuldade: "Médio",
          eficacia: 83,
          usuariosUtilizando: 167
        }
      ];
    }

    setPlanoGerado(plano);
  };

  // Encaminhar para a ferramenta
  const navegarParaFerramenta = (ferramenta) => {
    window.location.href = `/epictus-ia?ferramenta=${ferramenta}`;
  };

  // Reiniciar o processo
  const reiniciarProcesso = () => {
    setPlanoGerado(null);
    setNecessidadeOriginal("");
  };

  // Aplicar plano completo
  const aplicarPlanoCompleto = () => {
    if (planoGerado && planoGerado.passos.length > 0) {
      navegarParaFerramenta(planoGerado.passos[0].ferramenta);
    }
  };

  // Detectar quando o usuário está digitando
  const handleInputChange = (e) => {
    setPergunta(e.target.value);
    setIsTyping(true);
    setShowPopularTags(false);
    setShowFerramentasPopulares(false);

    if (!e.target.value.trim()) {
      setShowPopularTags(true);
      setShowFerramentasPopulares(true);
    }

    // Desativar o estado de digitação após um tempo
    setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  // Iniciar animação do campo de entrada quando o componente é montado
  useEffect(() => {
    setTimeout(() => {
      setAnimateInput(true);
    }, 500);
  }, []);

  // Scroll para o final do chat quando plano é gerado
  useEffect(() => {
    if (planoGerado && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [planoGerado]);

  // Função para renderizar o ícone correto com base no nome
  const renderIcon = (iconName, className = "") => {
    const iconMap = {
      "Brain": Brain,
      "Lightbulb": Lightbulb,
      "BookOpen": BookOpen,
      "Rocket": Rocket,
      "Wand2": Wand2,
      "Target": Target,
      "Clock": Clock,
      "MessageSquare": MessageSquare,
      "FileText": FileText,
      "BookMarked": BookMarked,
      "Workflow": Workflow,
      "Gauge": Gauge
    };
    
    const IconComponent = iconMap[iconName] || Sparkles;
    return <IconComponent className={className} />;
  };

  // Análise de popularidade das categorias (simulado)
  const topCategories = [
    { name: "Resumos", icon: "BookOpen", count: 865, color: "from-blue-500 to-purple-500" },
    { name: "Questões", icon: "Brain", count: 743, color: "from-green-500 to-teal-500" },
    { name: "Presentations", icon: "Rocket", count: 612, color: "from-orange-500 to-amber-500" },
    { name: "Redações", icon: "Wand2", count: 589, color: "from-pink-500 to-rose-500" }
  ];
  
  // Formatar números para exibição
  const formatNumber = (num) => {
    return num > 999 ? `${(num/1000).toFixed(1)}k` : num;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl bg-white dark:bg-gradient-to-br dark:from-[#0c1425] dark:to-[#0a1a2e] h-full w-full relative flex flex-col"
    >
      {/* Elementos decorativos de fundo com efeito 3D */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-full blur-2xl"></div>
        <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
        
        {/* Grid de fundo tipo blueprint */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <rect width="50" height="50" fill="url(#smallGrid)" />
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Partículas decorativas animadas */}
        <motion.div 
          animate={{ 
            y: [0, -10, 0],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="absolute top-1/4 right-10 w-3 h-3 bg-[#FF6B00]/40 rounded-full blur-sm"
        ></motion.div>
        
        <motion.div 
          animate={{ 
            y: [0, 10, 0],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          className="absolute top-1/3 left-10 w-4 h-4 bg-blue-400/30 dark:bg-blue-400/20 rounded-full blur-sm"
        ></motion.div>
        
        <motion.div 
          animate={{ 
            y: [0, -5, 0],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-purple-400/30 dark:bg-purple-400/20 rounded-full blur-sm"
        ></motion.div>
        
        {/* Linhas hexagonais de conexão decorativas */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10 dark:opacity-5" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M20,100 Q150,50 280,120 T520,100" 
            fill="none" 
            stroke={isLightMode ? "#FF6B00" : "#FF6B00"} 
            strokeWidth="1"
          />
          <path 
            d="M0,200 Q200,250 400,150 T600,180" 
            fill="none" 
            stroke={isLightMode ? "#3B82F6" : "#3B82F6"} 
            strokeWidth="1"
          />
          <path 
            d="M50,300 Q200,320 350,250 T600,280" 
            fill="none" 
            stroke={isLightMode ? "#8B5CF6" : "#8B5CF6"} 
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Header elegante com gradiente melhorado */}
      <div className={`p-4 ${isLightMode ? 'bg-gradient-to-r from-orange-50 via-orange-100/70 to-orange-50' : 'bg-gradient-to-r from-[#0A2540]/90 via-[#0A2540]/70 to-[#001427]'} border-b ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/20'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2.5 rounded-lg flex items-center justify-center ${
                isLightMode 
                  ? 'bg-gradient-to-br from-white to-orange-50 shadow-md border border-orange-200' 
                  : 'bg-gradient-to-br from-[#FF6B00]/30 to-[#FF6B00]/10 shadow-lg border border-[#FF6B00]/30'
              }`}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 5, 0, -5, 0],
                  scale: [1, 1.05, 1, 1.05, 1]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Brain className={`h-5 w-5 text-[#FF6B00] drop-shadow-md`} />
              </motion.div>
            </motion.div>
            <div>
              <h3 className={`font-semibold text-lg ${isLightMode ? 'text-gray-800' : 'text-white'} tracking-tight`}>
                Epictus IA: Seu Copiloto
              </h3>
              <div className="flex items-center gap-2">
                <motion.span 
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`text-xs font-medium flex items-center gap-1 ${
                    isLightMode ? 'text-gray-500' : 'text-gray-300'
                  }`}
                >
                  <Sparkles className="h-3 w-3" /> Assistente inteligente
                </motion.span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                  isLightMode 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-green-900/30 text-green-400 border border-green-800/30'
                }`}>
                  <span className="mr-1 flex h-1.5 w-1.5">
                    <span className="animate-ping absolute h-1.5 w-1.5 rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </span>
                  Ativo
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`hidden sm:flex items-center px-2 py-1 rounded-md ${
                isLightMode 
                  ? 'bg-orange-50 text-orange-600 border border-orange-100' 
                  : 'bg-[#0c1d36] text-orange-400 border border-orange-900/30'
              }`}
            >
              <Flame className="h-3 w-3 mr-1" />
              <span className="text-[10px] font-medium">Premium</span>
            </motion.div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-xs font-medium ${
                isLightMode 
                  ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              } group transition-all duration-300`}
              onClick={() => window.location.href = "/epictus-ia"}
            >
              <span>Modo completo</span>
              <motion.div
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
                className="inline-block ml-1"
              >
                <ArrowRight className="h-3 w-3 group-hover:text-[#FF6B00] transition-colors duration-300" />
              </motion.div>
            </Button>
          </div>
        </div>
        
        {/* Barra de status - NOVO */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-3 flex items-center justify-between gap-2 pr-1 pl-1"
        >
          <div className="grid grid-cols-3 gap-2 w-full">
            <div className={`flex flex-col ${isLightMode ? 'text-gray-500' : 'text-gray-400'} text-[10px]`}>
              <div className="flex justify-between items-center">
                <span>Eficiência</span>
                <span className="font-medium">{statusBar.eficiencia}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700/30 rounded-full mt-1 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${statusBar.eficiencia}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                />
              </div>
            </div>
            <div className={`flex flex-col ${isLightMode ? 'text-gray-500' : 'text-gray-400'} text-[10px]`}>
              <div className="flex justify-between items-center">
                <span>Personalização</span>
                <span className="font-medium">{statusBar.personalizacao}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700/30 rounded-full mt-1 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${statusBar.personalizacao}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full"
                />
              </div>
            </div>
            <div className={`flex flex-col ${isLightMode ? 'text-gray-500' : 'text-gray-400'} text-[10px]`}>
              <div className="flex justify-between items-center">
                <span>Versatilidade</span>
                <span className="font-medium">{statusBar.versatilidade}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700/30 rounded-full mt-1 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${statusBar.versatilidade}%` }}
                  transition={{ duration: 1, delay: 0.9 }}
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Conteúdo principal com design premium */}
      <AnimatePresence mode="wait">
        {isProcessing ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 flex-grow flex flex-col justify-center items-center relative z-10"
          >
            <div className="flex flex-col items-center space-y-5 max-w-md w-full">
              {/* Círculo animado com cérebro rotacionando */}
              <motion.div 
                className={`p-4 rounded-full ${
                  isLightMode 
                    ? 'bg-gradient-to-r from-orange-100 to-orange-200' 
                    : 'bg-gradient-to-r from-[#FF6B00]/30 to-[#FF6B00]/10'
                }`}
                animate={{ 
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    isLightMode ? "0 0 0 rgba(255, 107, 0, 0)" : "0 0 0 rgba(255, 107, 0, 0)",
                    isLightMode ? "0 0 30px rgba(255, 107, 0, 0.4)" : "0 0 30px rgba(255, 107, 0, 0.3)",
                    isLightMode ? "0 0 0 rgba(255, 107, 0, 0)" : "0 0 0 rgba(255, 107, 0, 0)"
                  ]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <Brain className={`h-10 w-10 text-[#FF6B00]`} />
                </motion.div>
              </motion.div>
              
              {/* Texto de status animado */}
              <div className="text-center space-y-1.5">
                <motion.p
                  animate={{
                    scale: [1, 1.03, 1],
                    opacity: [1, 0.8, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className={`font-medium text-lg ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}
                >
                  Epictus está planejando para você...
                </motion.p>
                
                <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Analisando <span className="font-medium text-[#FF6B00]">"{necessidadeOriginal}"</span>
                </p>
              </div>
              
              {/* Barra de progresso estilizada */}
              <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#FF6B00] via-[#FF8736] to-[#FF9D5C] rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </div>
              
              {/* Etapas de processamento */}
              <div className="w-full">
                <div className="flex justify-between text-xs mb-4">
                  <div className={`flex flex-col items-center ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isLightMode ? 'bg-green-100 text-green-600' : 'bg-green-900/30 text-green-400'
                      } mb-1`}
                    >
                      <Check className="h-3 w-3" />
                    </motion.div>
                    <span>Análise</span>
                  </div>
                  
                  <div className={`flex flex-col items-center ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <motion.div
                      animate={{ 
                        opacity: [0.7, 1, 0.7],
                        scale: [0.9, 1.1, 0.9]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isLightMode ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/30 text-blue-400'
                      } mb-1`}
                    >
                      <PieChart className="h-3 w-3" />
                    </motion.div>
                    <span>Planejamento</span>
                  </div>
                  
                  <div className={`flex flex-col items-center ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isLightMode ? 'bg-gray-100 text-gray-400' : 'bg-gray-800/50 text-gray-500'
                    } mb-1`}>
                      <Rocket className="h-3 w-3" />
                    </div>
                    <span>Pronto</span>
                  </div>
                </div>
              </div>
              
              {/* Indicadores de processamento */}
              <div className="flex space-x-3 items-center mt-2">
                <motion.div
                  animate={{ 
                    opacity: [0.3, 1, 0.3],
                    scale: [0.9, 1.1, 0.9]
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    delay: 0
                  }}
                  className={`w-2 h-2 rounded-full ${isLightMode ? 'bg-orange-500' : 'bg-orange-400'}`}
                />
                <motion.div
                  animate={{ 
                    opacity: [0.3, 1, 0.3],
                    scale: [0.9, 1.1, 0.9]
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    delay: 0.3
                  }}
                  className={`w-2 h-2 rounded-full ${isLightMode ? 'bg-blue-500' : 'bg-blue-400'}`}
                />
                <motion.div
                  animate={{ 
                    opacity: [0.3, 1, 0.3],
                    scale: [0.9, 1.1, 0.9]
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    delay: 0.6
                  }}
                  className={`w-2 h-2 rounded-full ${isLightMode ? 'bg-purple-500' : 'bg-purple-400'}`}
                />
              </div>
              
              {/* Estatística interessante */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className={`text-xs text-center mt-2 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}
              >
                Mais de <span className="font-medium">{formatNumber(estatisticas.planificacoes)}</span> planos personalizados gerados hoje
              </motion.div>
            </div>
          </motion.div>
        ) : planoGerado ? (
          <motion.div
            key="planoGerado"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 flex-grow flex flex-col justify-between relative z-10 overflow-hidden"
          >
            <div className="space-y-4">
              {/* Título do plano e necessidade original */}
              <div className="text-center mb-2">
                <motion.h4 
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`font-semibold text-lg ${isLightMode ? 'text-gray-800' : 'text-white'}`}
                >
                  {planoGerado.titulo}
                </motion.h4>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="flex justify-center gap-1.5 mt-1"
                >
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${
                    isLightMode 
                      ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                      : 'bg-blue-900/30 text-blue-300 border border-blue-800/30'
                  }`}>
                    <Star className="h-3 w-3" />
                    <span>Personalizado para você</span>
                  </span>
                  
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${
                    isLightMode 
                      ? 'bg-green-50 text-green-600 border border-green-100' 
                      : 'bg-green-900/30 text-green-300 border border-green-800/30'
                  }`}>
                    <Flame className="h-3 w-3" />
                    <span>Premium</span>
                  </span>
                </motion.div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className={`text-xs mt-2 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}
                >
                  Você pediu: "<span className="italic">{necessidadeOriginal}</span>"
                </motion.p>
              </div>

              {/* Métricas do plano */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="grid grid-cols-4 gap-2 mb-3"
              >
                <div className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                  isLightMode 
                    ? 'bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm border border-gray-200' 
                    : 'bg-gradient-to-br from-gray-800/30 to-gray-800/10 shadow-md border border-gray-700/30'
                }`}>
                  <Workflow className={`h-4 w-4 mb-1 ${isLightMode ? 'text-blue-500' : 'text-blue-400'}`} />
                  <div className="text-xs uppercase font-medium opacity-70">Passos</div>
                  <div className="font-semibold text-sm">{planoGerado.passos.length}</div>
                </div>
                
                <div className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                  isLightMode 
                    ? 'bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm border border-gray-200' 
                    : 'bg-gradient-to-br from-gray-800/30 to-gray-800/10 shadow-md border border-gray-700/30'
                }`}>
                  <Clock className={`h-4 w-4 mb-1 ${isLightMode ? 'text-purple-500' : 'text-purple-400'}`} />
                  <div className="text-xs uppercase font-medium opacity-70">Tempo</div>
                  <div className="font-semibold text-sm">{planoGerado.passos.reduce((acc, passo) => acc + parseInt(passo.tempo.split(" ")[0]), 0)} min</div>
                </div>
                
                <div className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                  isLightMode 
                    ? 'bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm border border-gray-200' 
                    : 'bg-gradient-to-br from-gray-800/30 to-gray-800/10 shadow-md border border-gray-700/30'
                }`}>
                  <BarChart className={`h-4 w-4 mb-1 ${isLightMode ? 'text-green-500' : 'text-green-400'}`} />
                  <div className="text-xs uppercase font-medium opacity-70">Eficácia</div>
                  <div className="font-semibold text-sm">{
                    Math.round(planoGerado.passos.reduce((acc, passo) => acc + passo.eficacia, 0) / planoGerado.passos.length)
                  }%</div>
                </div>
                
                <div className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                  isLightMode 
                    ? 'bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm border border-gray-200' 
                    : 'bg-gradient-to-br from-gray-800/30 to-gray-800/10 shadow-md border border-gray-700/30'
                }`}>
                  <Gauge className={`h-4 w-4 mb-1 ${isLightMode ? 'text-orange-500' : 'text-orange-400'}`} />
                  <div className="text-xs uppercase font-medium opacity-70">Nível</div>
                  <div className="font-semibold text-sm">{planoGerado.passos.some(p => p.dificuldade === "Difícil") ? "Alto" : planoGerado.passos.some(p => p.dificuldade === "Médio") ? "Médio" : "Básico"}</div>
                </div>
              </motion.div>

              {/* Lista de passos do plano com design aprimorado */}
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                {planoGerado.passos.map((passo) => (
                  <motion.div
                    key={passo.numero}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: passo.numero * 0.2, duration: 0.5 }}
                    className={`p-3.5 rounded-lg border flex items-start gap-3 ${
                      isLightMode 
                        ? 'border-gray-200 bg-white hover:bg-gray-50 shadow-md' 
                        : 'border-gray-700 bg-gray-800/20 hover:bg-gray-800/30 backdrop-blur-sm shadow-lg'
                    } transition-all duration-200 hover:transform hover:translate-x-1`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br ${
                      isLightMode ? 'from-[#FF6B00] to-[#FF9D5C] text-white' : 'from-[#FF6B00] to-[#FF8736] text-white'
                    } shadow-lg`}>
                      {passo.numero}
                    </div>

                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className={`font-medium text-sm ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                            {passo.titulo}
                          </h5>
                          <p className={`text-xs mt-1 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                            {passo.descricao}
                          </p>
                          
                          {/* Detalhes adicionais do passo */}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs ${
                              isLightMode ? 'bg-gray-100 text-gray-600' : 'bg-gray-800 text-gray-300'
                            }`}>
                              <Clock className="h-3 w-3" />
                              <span>{passo.tempo}</span>
                            </div>
                            
                            <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs ${
                              passo.dificuldade === "Fácil" 
                                ? `${isLightMode ? 'bg-green-50 text-green-600' : 'bg-green-900/30 text-green-400'}` 
                                : passo.dificuldade === "Médio" 
                                  ? `${isLightMode ? 'bg-amber-50 text-amber-600' : 'bg-amber-900/30 text-amber-400'}`
                                  : `${isLightMode ? 'bg-red-50 text-red-600' : 'bg-red-900/30 text-red-400'}`
                            }`}>
                              <BarChart className="h-3 w-3" />
                              <span>{passo.dificuldade}</span>
                            </div>
                            
                            <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs ${
                              isLightMode ? 'bg-blue-50 text-blue-600' : 'bg-blue-900/30 text-blue-400'
                            }`}>
                              <Trophy className="h-3 w-3" />
                              <span>{passo.eficacia}% Eficaz</span>
                            </div>
                            
                            <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs ${
                              isLightMode ? 'bg-purple-50 text-purple-600' : 'bg-purple-900/30 text-purple-400'
                            }`}>
                              <MessageSquare className="h-3 w-3" />
                              <span>{passo.usuariosUtilizando} Usuários</span>
                            </div>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navegarParaFerramenta(passo.ferramenta)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg ${
                            isLightMode 
                              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-md' 
                              : 'bg-gradient-to-r from-purple-700 to-purple-800 text-purple-100 hover:from-purple-600 hover:to-purple-700 shadow-lg'
                          } transition-all duration-200`}
                        >
                          Iniciar
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Ações do plano aprimoradas */}
            <div className="mt-4 space-y-2.5">
              {/* Botão de Aplicar Plano com efeito de brilho */}
              <motion.button
                whileHover={{ 
                  scale: 1.02, 
                  boxShadow: "0 10px 15px -3px rgba(255, 107, 0, 0.3), 0 4px 6px -4px rgba(255, 107, 0, 0.3)" 
                }}
                whileTap={{ scale: 0.98 }}
                onClick={aplicarPlanoCompleto}
                className={`w-full py-2.5 rounded-lg font-medium bg-gradient-to-r from-[#FF6B00] to-[#FF8736] text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2`}
              >
                <Rocket className="h-4 w-4" />
                <span>APLICAR PLANO SUGERIDO</span>
              </motion.button>

              {/* Barra de informações de uso */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex justify-center gap-4 py-1.5"
              >
                <div className={`flex items-center gap-1 text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Zap className="h-3 w-3 text-yellow-500" />
                  <span>{planoGerado.passos.reduce((acc, passo) => acc + passo.usuariosUtilizando, 0)} usuários ativos</span>
                </div>
                <div className={`flex items-center gap-1 text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Star className="h-3 w-3 text-amber-500" />
                  <span>{Math.round(planoGerado.passos.reduce((acc, passo) => acc + passo.eficacia, 0) / planoGerado.passos.length) > 90 ? "Alta" : "Boa"} taxa de sucesso</span>
                </div>
              </motion.div>

              {/* Botão de nova necessidade estilizado */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={reiniciarProcesso}
                className={`w-full py-2 rounded-lg text-sm font-medium ${
                  isLightMode 
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200' 
                    : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 backdrop-blur-sm border border-gray-700'
                } transition-all duration-200`}
              >
                Nova necessidade
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-4 flex-grow flex flex-col justify-between relative z-10"
          >
            <div className="space-y-4">
              {/* Título e dica de uso com efeito brilhante aprimorado */}
              <motion.div 
                initial={{ y: -10 }}
                animate={{ y: 0 }}
                className="mb-1 text-center"
              >
                <p className={`font-medium text-sm sm:text-base ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
                  Como posso te ajudar a potencializar seus estudos hoje?
                </p>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="flex justify-center gap-1.5 mt-1.5"
                >
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                    isLightMode ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-blue-900/20 text-blue-300 border border-blue-800/30'
                  }`}>
                    <Sparkles className="h-3 w-3" />
                    <span>Assistente inteligente</span>
                  </span>
                  
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                    isLightMode ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-purple-900/20 text-purple-300 border border-purple-800/30'
                  }`}>
                    <BarChart className="h-3 w-3" />
                    <span>+{formatNumber(estatisticas.planificacoes)} planos</span>
                  </span>
                </motion.div>
              </motion.div>

              {/* Estatísticas da IA - NOVO */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="grid grid-cols-3 gap-2 p-2 rounded-lg border border-dashed bg-opacity-5 mb-3
                  bg-gradient-to-br
                  border-gray-200 dark:border-gray-700
                  from-gray-50 to-gray-100 dark:from-gray-800/10 dark:to-gray-800/20"
              >
                <div className="flex flex-col items-center">
                  <div className={`inline-flex items-center justify-center h-7 w-7 rounded-md ${
                    isLightMode ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/30 text-blue-300'
                  }`}>
                    <Brain className="h-4 w-4" />
                  </div>
                  <p className={`text-xs font-medium mt-1 ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
                    {estatisticas.recursos} Recursos
                  </p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className={`inline-flex items-center justify-center h-7 w-7 rounded-md ${
                    isLightMode ? 'bg-green-100 text-green-600' : 'bg-green-900/30 text-green-300'
                  }`}>
                    <Rocket className="h-4 w-4" />
                  </div>
                  <p className={`text-xs font-medium mt-1 ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
                    100% Premium
                  </p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className={`inline-flex items-center justify-center h-7 w-7 rounded-md ${
                    isLightMode ? 'bg-purple-100 text-purple-600' : 'bg-purple-900/30 text-purple-300'
                  }`}>
                    <Workflow className="h-4 w-4" />
                  </div>
                  <p className={`text-xs font-medium mt-1 ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
                    {estatisticas.ferramentas} Ferramentas
                  </p>
                </div>
              </motion.div>

              {/* Campo de entrada de necessidade principal com animação */}
              <motion.form 
                onSubmit={handleEnviarPergunta}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="relative"
              >
                <div className={`relative overflow-hidden rounded-xl border ${
                  isLightMode ? 'border-gray-200 shadow-md' : 'border-gray-700 shadow-md'
                } transition-all duration-300 ${
                  isTyping 
                    ? isLightMode 
                      ? 'ring-2 ring-[#FF6B00]/30' 
                      : 'ring-2 ring-[#FF6B00]/30' 
                    : animateInput 
                      ? isLightMode 
                        ? 'ring-1 ring-[#FF6B00]/20 animate-pulse' 
                        : 'ring-1 ring-[#FF6B00]/20 animate-pulse'
                      : ''
                }`}>
                  <input
                    type="text"
                    value={pergunta}
                    onChange={handleInputChange}
                    placeholder="Digite sua necessidade ou objetivo (ex: 'Criar resumo para prova de Física')"
                    className={`w-full py-3.5 px-4 pr-12 ${
                      isLightMode ? 'bg-white text-gray-800' : 'bg-gray-800/40 text-white backdrop-blur-sm'
                    } placeholder-gray-400 focus:outline-none text-sm`}
                    autoFocus
                  />

                  <motion.button
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95, rotate: 0 }}
                    type="submit"
                    disabled={!pergunta.trim()}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md ${
                      pergunta.trim() 
                        ? isLightMode 
                          ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8736] text-white shadow-md' 
                          : 'bg-gradient-to-r from-[#FF6B00] to-[#FF8736] text-white shadow-md' 
                        : isLightMode 
                          ? 'bg-gray-100 text-gray-400' 
                          : 'bg-gray-700 text-gray-400'
                    } transition-all duration-200`}
                  >
                    <Send className="h-4 w-4" />
                  </motion.button>
                </div>

                {/* Botão "Analisar Necessidade" com efeito de brilho */}
                <motion.button
                  whileHover={{ 
                    scale: pergunta.trim() ? 1.02 : 1, 
                    boxShadow: pergunta.trim() ? "0 10px 15px -3px rgba(255, 107, 0, 0.2), 0 4px 6px -4px rgba(255, 107, 0, 0.2)" : "none" 
                  }}
                  whileTap={{ scale: pergunta.trim() ? 0.98 : 1 }}
                  type="submit"
                  disabled={!pergunta.trim()}
                  className={`w-full mt-2 py-2.5 rounded-lg font-medium ${
                    pergunta.trim() 
                      ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8736] text-white shadow-md hover:from-[#FF8736] hover:to-[#FF6B00]' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  } transition-all duration-300`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Wand2 className={`h-4 w-4 ${pergunta.trim() ? 'animate-pulse' : ''}`} />
                    Analisar Necessidade
                  </span>
                </motion.button>
              </motion.form>

              {/* Ferramentas Populares - NOVO */}
              {showFerramentasPopulares && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="mt-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-xs flex items-center gap-1 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      <Trophy className="h-3 w-3" /> Ferramentas populares
                    </p>
                    <p className={`text-xs ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`}>Eficiência</p>
                  </div>
                  
                  <div className="space-y-2">
                    {ferramentasPopulares.map((ferramenta, index) => (
                      <motion.div
                        key={ferramenta.nome}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + (index * 0.1), duration: 0.3 }}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          isLightMode
                            ? 'bg-white border border-gray-200 shadow-sm hover:bg-gray-50'
                            : 'bg-gray-800/20 border border-gray-700 hover:bg-gray-800/30'
                        } transition-all duration-200`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`flex-shrink-0 h-8 w-8 rounded-md flex items-center justify-center ${
                            isLightMode
                              ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600'
                              : 'bg-gradient-to-br from-blue-900/30 to-blue-800/30 text-blue-400'
                          }`}>
                            {renderIcon(ferramenta.icone, "h-4 w-4")}
                          </div>
                          <div>
                            <div className={`text-sm font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
                              {ferramenta.nome}
                            </div>
                            <div className={`flex items-center text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              <MessageSquare className="h-3 w-3 mr-1" /> {ferramenta.usos} usos
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                ferramenta.eficiencia >= 90
                                  ? 'bg-green-500'
                                  : ferramenta.eficiencia >= 80
                                    ? 'bg-blue-500'
                                    : 'bg-amber-500'
                              }`}
                              style={{ width: `${ferramenta.eficiencia}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                            {ferramenta.eficiencia}%
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Sugestões rápidas com design melhorado */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-3"
              >
                <p className={`text-xs mb-2 flex items-center gap-1 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Lightbulb className="h-3 w-3" /> Sugestões rápidas:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["Criar Resumo", "Fazer Quiz", "Planejar Estudos", "Revisar Redação", "Gerar Slides", "Preparar Prova"].map((sugestao, index) => (
                    <motion.button
                      key={sugestao}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + (index * 0.1), duration: 0.3 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPergunta(sugestao)}
                      className={`text-xs px-3 py-1.5 rounded-full border ${
                        isLightMode 
                          ? 'border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 shadow-sm' 
                          : 'border-gray-700 bg-gradient-to-r from-gray-800/60 to-gray-800/40 text-gray-300 hover:from-gray-700/60 hover:to-gray-700/40 backdrop-blur-sm shadow-md'
                      } transition-all duration-200`}
                    >
                      {sugestao}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Categorias populares - mostrar apenas quando não está digitando */}
              {showPopularTags && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="mt-4"
                >
                  <p className={`text-xs mb-3 flex items-center gap-1 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <BarChart2 className="h-3 w-3" /> Categorias populares:
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {topCategories.map((category, index) => (
                      <motion.button
                        key={category.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + (index * 0.1) }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setPergunta(`Ajuda com ${category.name}`)}
                        className={`flex items-center gap-2 p-2 rounded-lg border ${
                          isLightMode 
                            ? 'border-gray-200 bg-white hover:bg-gray-50 shadow-sm' 
                            : 'border-gray-700 bg-gray-800/20 hover:bg-gray-800/40 shadow-md'
                        } transition-all duration-200`}
                      >
                        <div className={`h-7 w-7 rounded-md bg-gradient-to-br ${category.color} flex items-center justify-center text-white shadow-md`}>
                          {renderIcon(category.icon, "h-4 w-4")}
                        </div>
                        <div className="flex flex-col items-start">
                          <span className={`text-xs font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
                            {category.name}
                          </span>
                          <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {formatNumber(category.count)}+ usos
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Rodapé com status e link para explorar ferramentas */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="mt-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    backgroundColor: [
                      isLightMode ? "rgb(74, 222, 128)" : "rgb(34, 197, 94)",
                      isLightMode ? "rgb(74, 222, 128, 0.7)" : "rgb(34, 197, 94, 0.7)",
                      isLightMode ? "rgb(74, 222, 128)" : "rgb(34, 197, 94)"
                    ]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className={`h-2 w-2 rounded-full`}
                ></motion.div>
                <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  IA pronta para ajudar
                </span>
              </div>

              <motion.a 
                href="/epictus-ia" 
                whileHover={{ x: 3 }}
                className={`text-xs flex items-center gap-1 ${
                  isLightMode ? 'text-gray-500 hover:text-[#FF6B00]' : 'text-gray-400 hover:text-[#FF6B00]'
                } transition-colors duration-200`}
              >
                <Compass className="h-3 w-3" />
                <span>Explorar Todas as Ferramentas</span>
                <ArrowRight className="h-2.5 w-2.5 ml-0.5" />
              </motion.a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
