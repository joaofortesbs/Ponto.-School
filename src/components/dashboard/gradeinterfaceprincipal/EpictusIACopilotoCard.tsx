
import React, { useState, useEffect } from "react";
import { Brain, Lightbulb, Send, ArrowRight, BarChart2, Sparkles, Zap, Check, Star, Wand2, Rocket, BookOpen, LucideIcon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";

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
          dificuldade: "Fácil"
        },
        {
          numero: 2,
          titulo: "Estruturar Ideias",
          descricao: "Organize seu pensamento com nosso Gerador de Mapas Mentais",
          ferramenta: "mapa-mental",
          icone: "Brain",
          tempo: "20 min",
          dificuldade: "Médio"
        },
        {
          numero: 3,
          titulo: "Criar Slides",
          descricao: "Crie slides profissionais com nossa ferramenta de Slides Didáticos",
          ferramenta: "slides-didaticos",
          icone: "LayoutTemplate",
          tempo: "30 min",
          dificuldade: "Médio"
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
          dificuldade: "Fácil"
        },
        {
          numero: 2,
          titulo: "Elaborar Questões",
          descricao: "Crie questões eficazes com o Gerador de Questões",
          ferramenta: "gerador-questoes",
          icone: "FileQuestion",
          tempo: "25 min",
          dificuldade: "Médio"
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
          icone: "FileText",
          tempo: "15 min",
          dificuldade: "Fácil"
        },
        {
          numero: 2,
          titulo: "Organizar Conteúdo",
          descricao: "Organize o conteúdo com ferramentas de estruturação",
          ferramenta: "organizador-conteudo",
          icone: "ListChecks",
          tempo: "20 min",
          dificuldade: "Médio"
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
          icone: "PenTool",
          tempo: "15 min",
          dificuldade: "Médio"
        },
        {
          numero: 2,
          titulo: "Revisar Conteúdo",
          descricao: "Use o Revisor de Textos para aprimorar a qualidade",
          ferramenta: "revisor-textos",
          icone: "Edit",
          tempo: "20 min",
          dificuldade: "Médio"
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
          dificuldade: "Fácil"
        },
        {
          numero: 2,
          titulo: "Organizar Estudo",
          descricao: "Crie um plano de estudos organizado com o Cronograma Inteligente",
          ferramenta: "cronograma-estudos",
          icone: "Calendar",
          tempo: "25 min",
          dificuldade: "Médio"
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

    if (!e.target.value.trim()) {
      setShowPopularTags(true);
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

  // Função para renderizar o ícone correto com base no nome
  const renderIcon = (iconName, className) => {
    switch (iconName) {
      case "Brain":
        return <Brain className={className} />;
      case "Lightbulb":
        return <Lightbulb className={className} />;
      case "BookOpen":
        return <BookOpen className={className} />;
      case "Rocket":
        return <Rocket className={className} />;
      case "Wand2":
        return <Wand2 className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  // Análise de popularidade das categorias (simulado)
  const topCategories = [
    { name: "Resumos", icon: "BookOpen", count: 865, color: "from-blue-500 to-purple-500" },
    { name: "Questões", icon: "Brain", count: 743, color: "from-green-500 to-teal-500" },
    { name: "Presentations", icon: "Rocket", count: 612, color: "from-orange-500 to-amber-500" },
    { name: "Redações", icon: "Wand2", count: 589, color: "from-pink-500 to-rose-500" }
  ];

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl bg-white dark:bg-gradient-to-br dark:from-[#0c1425] dark:to-[#0a1a2e] h-full w-full relative flex flex-col"
    >
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-full blur-2xl"></div>
        <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
        
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
          className="absolute top-1/4 right-10 w-2 h-2 bg-[#FF6B00]/40 rounded-full"
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
          className="absolute top-1/3 left-10 w-3 h-3 bg-blue-400/30 dark:bg-blue-400/20 rounded-full"
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
          className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-purple-400/30 dark:bg-purple-400/20 rounded-full"
        ></motion.div>
        
        {/* Linhas de conexão decorativas */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10 dark:opacity-5" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M0,100 Q150,50 300,100 T600,100" 
            fill="none" 
            stroke={isLightMode ? "#FF6B00" : "#FF6B00"} 
            strokeWidth="1"
          />
          <path 
            d="M0,150 Q150,200 300,150 T600,150" 
            fill="none" 
            stroke={isLightMode ? "#3B82F6" : "#3B82F6"} 
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Header elegante com gradiente */}
      <div className={`p-5 ${isLightMode ? 'bg-gradient-to-r from-orange-50 to-orange-100/50' : 'bg-gradient-to-r from-[#0A2540]/80 to-[#001427]'} border-b ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/20'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2.5 rounded-lg flex items-center justify-center ${isLightMode ? 'bg-gradient-to-br from-white to-orange-50 shadow-sm border border-orange-200' : 'bg-gradient-to-br from-[#FF6B00]/20 to-[#FF6B00]/5 border border-[#FF6B00]/30'}`}
            >
              <motion.div
                animate={{ rotate: [0, 10, 0, -10, 0] }}
                transition={{ 
                  duration: 10, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Brain className={`h-5 w-5 text-[#FF6B00]`} />
              </motion.div>
            </motion.div>
            <div>
              <h3 className={`font-semibold text-lg ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                Epictus IA: Seu Copiloto
              </h3>
              <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>
                <motion.span 
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="font-medium flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" /> Assistente inteligente
                </motion.span>
              </p>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-xs font-medium ${isLightMode ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:text-white hover:bg-white/5'} group transition-all duration-300`}
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
            <div className="flex flex-col items-center space-y-4">
              <motion.div 
                className={`p-3 rounded-full ${isLightMode ? 'bg-gradient-to-r from-orange-100 to-orange-200' : 'bg-gradient-to-r from-[#FF6B00]/20 to-[#FF6B00]/10'}`}
                animate={{ 
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    isLightMode ? "0 0 0 rgba(255, 107, 0, 0)" : "0 0 0 rgba(255, 107, 0, 0)",
                    isLightMode ? "0 0 20px rgba(255, 107, 0, 0.3)" : "0 0 20px rgba(255, 107, 0, 0.2)",
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
                  <Brain className={`h-8 w-8 text-[#FF6B00]`} />
                </motion.div>
              </motion.div>
              
              <motion.p
                animate={{
                  opacity: [1, 0.7, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`text-center font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}
              >
                Epictus está planejando para você...
              </motion.p>
              
              <div className="w-full max-w-md h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF9D5C] rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </div>
              
              <div className="flex flex-col items-center space-y-1">
                <p className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Analisando sua necessidade...
                </p>
                <div className="flex space-x-2 items-center mt-2">
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
                    className={`w-1.5 h-1.5 rounded-full ${isLightMode ? 'bg-orange-500' : 'bg-orange-400'}`}
                  />
                  <motion.div
                    animate={{ 
                      opacity: [0.3, 1, 0.3],
                      scale: [0.9, 1.1, 0.9]
                    }}
                    transition={{ 
                      duration: 1,
                      repeat: Infinity,
                      delay: 0.2
                    }}
                    className={`w-1.5 h-1.5 rounded-full ${isLightMode ? 'bg-blue-500' : 'bg-blue-400'}`}
                  />
                  <motion.div
                    animate={{ 
                      opacity: [0.3, 1, 0.3],
                      scale: [0.9, 1.1, 0.9]
                    }}
                    transition={{ 
                      duration: 1,
                      repeat: Infinity,
                      delay: 0.4
                    }}
                    className={`w-1.5 h-1.5 rounded-full ${isLightMode ? 'bg-purple-500' : 'bg-purple-400'}`}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ) : planoGerado ? (
          <motion.div
            key="planoGerado"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 flex-grow flex flex-col justify-between relative z-10"
          >
            <div className="space-y-4">
              {/* Título do plano e necessidade original */}
              <div className="text-center mb-3">
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
                  className={`inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-xs ${isLightMode ? 'bg-blue-50 text-blue-600' : 'bg-blue-900/30 text-blue-300 border border-blue-800/30'}`}
                >
                  <Star className="h-3 w-3" />
                  <span>Personalizado para você</span>
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
                className={`grid grid-cols-3 gap-2 mb-3 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}
              >
                <div className={`flex flex-col items-center justify-center p-2 rounded-lg ${isLightMode ? 'bg-gray-50' : 'bg-gray-800/30'}`}>
                  <div className="text-xs uppercase font-medium mb-1 opacity-70">Passos</div>
                  <div className="font-semibold">{planoGerado.passos.length}</div>
                </div>
                <div className={`flex flex-col items-center justify-center p-2 rounded-lg ${isLightMode ? 'bg-gray-50' : 'bg-gray-800/30'}`}>
                  <div className="text-xs uppercase font-medium mb-1 opacity-70">Tempo Est.</div>
                  <div className="font-semibold">{planoGerado.passos.reduce((acc, passo) => acc + parseInt(passo.tempo.split(" ")[0]), 0)} min</div>
                </div>
                <div className={`flex flex-col items-center justify-center p-2 rounded-lg ${isLightMode ? 'bg-gray-50' : 'bg-gray-800/30'}`}>
                  <div className="text-xs uppercase font-medium mb-1 opacity-70">Dificuldade</div>
                  <div className="font-semibold">{planoGerado.passos.some(p => p.dificuldade === "Difícil") ? "Alta" : planoGerado.passos.some(p => p.dificuldade === "Médio") ? "Média" : "Baixa"}</div>
                </div>
              </motion.div>

              {/* Lista de passos do plano */}
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                {planoGerado.passos.map((passo) => (
                  <motion.div
                    key={passo.numero}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: passo.numero * 0.2, duration: 0.5 }}
                    className={`p-3.5 rounded-lg border flex items-start gap-3 ${
                      isLightMode 
                        ? 'border-gray-200 bg-white hover:bg-gray-50 shadow-sm' 
                        : 'border-gray-700 bg-gray-800/20 hover:bg-gray-800/30 backdrop-blur-sm'
                    } transition-all duration-200 hover:transform hover:translate-x-1`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br ${
                      isLightMode ? 'from-[#FF6B00] to-[#FF9D5C] text-white' : 'from-[#FF6B00] to-[#FF8736] text-white'
                    } shadow-md`}>
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
                          <div className="flex items-center gap-3 mt-2">
                            <div className={`inline-flex items-center gap-1 text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                              </svg>
                              <span>{passo.tempo}</span>
                            </div>
                            <div className={`inline-flex items-center gap-1 text-xs ${
                              passo.dificuldade === "Fácil" 
                                ? `${isLightMode ? 'text-green-600' : 'text-green-400'}` 
                                : passo.dificuldade === "Médio" 
                                  ? `${isLightMode ? 'text-amber-600' : 'text-amber-400'}`
                                  : `${isLightMode ? 'text-red-600' : 'text-red-400'}`
                            }`}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 6V18M8 10V14M16 8V16M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                              <span>{passo.dificuldade}</span>
                            </div>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navegarParaFerramenta(passo.ferramenta)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg ${
                            isLightMode 
                              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700' 
                              : 'bg-gradient-to-r from-purple-700 to-purple-800 text-purple-100 hover:from-purple-600 hover:to-purple-700'
                          } shadow-sm transition-all duration-200`}
                        >
                          Iniciar
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Ações do plano */}
            <div className="mt-4 space-y-2">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(255, 107, 0, 0.2), 0 4px 6px -4px rgba(255, 107, 0, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={aplicarPlanoCompleto}
                className={`w-full py-2.5 rounded-lg font-medium bg-gradient-to-r from-[#FF6B00] to-[#FF8736] text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2`}
              >
                <Rocket className="h-4 w-4" />
                <span>APLICAR PLANO SUGERIDO</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={reiniciarProcesso}
                className={`w-full py-2 rounded-lg text-sm font-medium ${
                  isLightMode 
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                    : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 backdrop-blur-sm'
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
            className="p-6 flex-grow flex flex-col justify-between relative z-10"
          >
            {/* Elemento decorativo - ondas sutis animadas */}
            <div className="absolute inset-x-0 top-0 h-20 pointer-events-none overflow-hidden opacity-30">
              <motion.div
                animate={{ 
                  y: [0, -8, 0],
                  opacity: [0.4, 0.6, 0.4]
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`w-full h-40 rounded-[100%] ${isLightMode ? 'bg-gradient-to-r from-orange-300/20 to-blue-300/20' : 'bg-gradient-to-r from-[#FF6B00]/20 to-blue-500/30'} blur-xl transform -translate-y-20`}
              />
            </div>
            
            <div className="space-y-5 relative">
              {/* Cabeçalho e ícone principal com animação sofisticada */}
              <div className="flex flex-col items-center relative">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 200,
                    duration: 0.8
                  }}
                  className="mb-4 relative"
                >
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center ${isLightMode ? 'bg-gradient-to-br from-white to-gray-50' : 'bg-gradient-to-br from-gray-800 to-gray-900'} shadow-xl relative z-10`}>
                    <div className={`absolute inset-0.5 rounded-full ${isLightMode ? 'bg-gradient-to-br from-orange-50 to-orange-100' : 'bg-gradient-to-br from-[#0c1425]/90 to-[#0a1a2e]'} z-0`}></div>
                    
                    <motion.div
                      animate={{ 
                        rotateY: [0, 180, 360],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="relative z-20 flex items-center justify-center"
                    >
                      <Brain className={`h-8 w-8 text-[#FF6B00] drop-shadow-lg`} />
                    </motion.div>
                    
                    {/* Aura pulsante em torno do ícone */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0, 0.2, 0]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className={`absolute inset-0 rounded-full ${isLightMode ? 'bg-[#FF6B00]/20' : 'bg-[#FF6B00]/30'} blur-md z-0`}
                    />
                  </div>
                  
                  {/* Partículas orbitando */}
                  <motion.div 
                    animate={{ 
                      rotate: 360
                    }}
                    transition={{ 
                      duration: 15,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute inset-0 z-0"
                    style={{ width: '100%', height: '100%' }}
                  >
                    {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full"
                        style={{ 
                          left: `calc(50% + ${Math.cos(angle * Math.PI / 180) * 35}px)`, 
                          top: `calc(50% + ${Math.sin(angle * Math.PI / 180) * 35}px)`,
                          backgroundColor: i % 2 === 0 ? '#FF6B00' : '#3B82F6',
                          opacity: 0.6
                        }}
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [0.4, 0.8, 0.4]
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.5
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
                
                {/* Título principal com efeito fadeIn mais elegante */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ 
                    delay: 0.3,
                    duration: 0.6,
                    type: "spring"
                  }}
                  className="text-center mb-1"
                >
                  <h3 className={`text-xl font-semibold mb-1 ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B00] to-[#FF8736]">Epictus IA</span>
                  </h3>
                  <p className={`font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
                    Como posso potencializar seus estudos hoje?
                  </p>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className={`mt-2 px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 ${
                      isLightMode 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-600 shadow-sm' 
                        : 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-800/40 text-blue-300'
                    }`}
                  >
                    <span className="relative flex h-2 w-2 mr-0.5">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLightMode ? 'bg-blue-400' : 'bg-blue-500'} opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isLightMode ? 'bg-blue-500' : 'bg-blue-400'}`}></span>
                    </span>
                    <Sparkles className="h-3 w-3" />
                    <span className="font-medium">Assistente avançado de aprendizagem</span>
                  </motion.div>
                </motion.div>
              </div>

              {/* Campo de entrada de necessidade principal com design premium */}
              <motion.form 
                onSubmit={handleEnviarPergunta}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
                className="relative z-10"
              >
                <div className={`relative overflow-hidden rounded-xl ${
                  isLightMode 
                    ? 'bg-gradient-to-r from-gray-50 to-white border border-gray-200' 
                    : 'bg-gradient-to-r from-gray-800/30 to-gray-800/20 border border-gray-700'
                } shadow-lg transition-all duration-300 ${
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
                  {/* Efeito gradiente na borda quando ativo */}
                  {isTyping && (
                    <motion.div 
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        background: `linear-gradient(90deg, ${isLightMode ? '#FF6B00' : '#FF6B00'}00, ${isLightMode ? '#FF6B00' : '#FF6B00'}30, ${isLightMode ? '#FF6B00' : '#FF6B00'}00)`,
                        backgroundSize: '200% 100%',
                        animation: 'border-wave 2s infinite linear'
                      }}
                    />
                  )}
                  
                  <div className="relative">
                    <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-[#FF6B00] opacity-70`}>
                      <Wand2 className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={pergunta}
                      onChange={handleInputChange}
                      placeholder="Descreva sua necessidade de estudo..."
                      className={`w-full py-4 pl-12 pr-12 ${
                        isLightMode 
                          ? 'bg-transparent text-gray-800 placeholder-gray-400' 
                          : 'bg-transparent text-white placeholder-gray-400'
                      } focus:outline-none text-sm font-medium`}
                      autoFocus
                    />
                    <motion.button
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      whileTap={{ scale: 0.95, rotate: 0 }}
                      type="submit"
                      disabled={!pergunta.trim()}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg ${
                        pergunta.trim() 
                          ? isLightMode 
                            ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8736] text-white shadow-md' 
                            : 'bg-gradient-to-r from-[#FF6B00] to-[#FF8736] text-white shadow-md' 
                          : isLightMode 
                            ? 'bg-gray-100 text-gray-400' 
                            : 'bg-gray-700/50 text-gray-400'
                      } transition-all duration-200`}
                    >
                      <Send className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Botão "Analisar Necessidade" com design elevado */}
                <motion.button
                  whileHover={{ 
                    scale: pergunta.trim() ? 1.02 : 1, 
                    boxShadow: pergunta.trim() ? "0 10px 25px -3px rgba(255, 107, 0, 0.3), 0 4px 6px -4px rgba(255, 107, 0, 0.3)" : "none" 
                  }}
                  whileTap={{ scale: pergunta.trim() ? 0.98 : 1 }}
                  type="submit"
                  disabled={!pergunta.trim()}
                  className={`w-full mt-3 py-3 rounded-xl font-medium ${
                    pergunta.trim() 
                      ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8736] text-white shadow-lg hover:shadow-xl' 
                      : 'bg-gray-200 dark:bg-gray-700/50 text-gray-400'
                  } transition-all duration-300 relative overflow-hidden`}
                >
                  {pergunta.trim() && (
                    <motion.div 
                      className="absolute inset-0 bg-white opacity-10"
                      animate={{ 
                        x: ["0%", "100%"],
                        opacity: [0, 0.2, 0]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.5,
                        ease: "easeInOut"
                      }}
                      style={{
                        clipPath: "polygon(0 0, 30% 0, 60% 100%, 0% 100%)"
                      }}
                    />
                  )}
                  
                  <span className="flex items-center justify-center gap-2 relative z-10">
                    <Sparkles className={`h-4 w-4 ${pergunta.trim() ? 'animate-pulse' : ''}`} />
                    <span>Potencializar Aprendizado</span>
                  </span>
                </motion.button>
              </motion.form>

              {/* Feature Cards - Uma abordagem mais visual e moderna */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="mt-5"
              >
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { title: "Resumos", description: "Gere resumos inteligentes", icon: <BookOpen className="h-4 w-4" />, color: "from-blue-500 to-indigo-600" },
                    { title: "Questões", description: "Pratique com questões", icon: <Brain className="h-4 w-4" />, color: "from-emerald-500 to-teal-600" },
                    { title: "Apresentações", description: "Crie slides profissionais", icon: <BarChart2 className="h-4 w-4" />, color: "from-amber-500 to-orange-600" },
                    { title: "Planos", description: "Organize seus estudos", icon: <Calendar className="h-4 w-4" />, color: "from-purple-500 to-pink-600" }
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + (index * 0.1) }}
                      whileHover={{ y: -4, scale: 1.03 }}
                      onClick={() => setPergunta(`Ajuda com ${feature.title}`)}
                      className={`rounded-xl p-3 cursor-pointer ${
                        isLightMode 
                          ? 'bg-white border border-gray-100 shadow-sm hover:shadow-md' 
                          : 'bg-gray-800/30 border border-gray-700/50 hover:bg-gray-800/50'
                      } transition-all duration-300 flex flex-col items-center text-center`}
                    >
                      <div className={`h-9 w-9 rounded-full mb-2 flex items-center justify-center bg-gradient-to-br ${feature.color} text-white shadow-md`}>
                        {feature.icon}
                      </div>
                      <span className={`text-xs font-semibold mb-0.5 ${isLightMode ? 'text-gray-800' : 'text-gray-200'}`}>
                        {feature.title}
                      </span>
                      <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {feature.description}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Sugestões rápidas de uso com design aprimorado */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="mt-5"
              >
                <div className={`p-3 rounded-xl border ${
                  isLightMode 
                    ? 'border-gray-100 bg-gradient-to-r from-gray-50/70 to-gray-50/30' 
                    : 'border-gray-800 bg-gradient-to-r from-gray-800/20 to-gray-800/10 backdrop-blur-sm'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-xs font-medium flex items-center gap-1 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                      <Lightbulb className="h-3 w-3 text-[#FF6B00]" /> 
                      <span>Comece com:</span>
                    </p>
                    <div className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isLightMode 
                        ? 'bg-orange-50 text-orange-600 border border-orange-100' 
                        : 'bg-[#FF6B00]/10 text-orange-400 border border-[#FF6B00]/20'
                    }`}>
                      Popular
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {["Resumo de Física", "Quiz História", "Cronograma ENEM", "Revisar Redação", "Slides Geografia"].map((sugestao, index) => (
                      <motion.button
                        key={sugestao}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.0 + (index * 0.1), duration: 0.3 }}
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPergunta(sugestao)}
                        className={`text-xs px-3 py-1.5 rounded-full ${
                          isLightMode 
                            ? 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300 shadow-sm' 
                            : 'bg-gray-800/40 border border-gray-700 text-gray-300 hover:border-gray-600 backdrop-blur-sm'
                        } transition-all duration-200`}
                      >
                        {sugestao}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Rodapé com status e links */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="mt-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLightMode ? 'bg-green-400' : 'bg-green-500'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${isLightMode ? 'bg-green-500' : 'bg-green-400'}`}></span>
                </span>
                <span className={`text-xs font-medium ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  IA pronta para personalizar seu aprendizado
                </span>
              </div>

              <motion.a 
                href="/epictus-ia" 
                whileHover={{ x: 3 }}
                className={`text-xs flex items-center gap-1 px-2 py-1 rounded-lg ${
                  isLightMode 
                    ? 'text-[#FF6B00] hover:bg-orange-50 hover:text-[#FF8736]' 
                    : 'text-[#FF6B00] hover:bg-[#FF6B00]/10 hover:text-[#FF8736]'
                } transition-all duration-200`}
              >
                <span className="font-medium">Modo completo</span>
                <ArrowRight className="h-3 w-3" />
              </motion.a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
