
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
            {/* Interface inicial para primeiro contato - design ultra moderno */}
          <div className="flex flex-col items-center justify-center h-full text-center relative">
            {/* Background abstrato com gradientes animados */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div 
                initial={{ opacity: 0.3 }}
                animate={{ 
                  opacity: [0.3, 0.7, 0.3],
                  y: [0, -10, 0]
                }}
                transition={{ 
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-[-5%] left-[-10%] w-[60%] h-[50%] rounded-full bg-gradient-to-br from-[#FF6B00]/5 to-blue-500/5 blur-3xl"
              />
              <motion.div 
                initial={{ opacity: 0.2 }}
                animate={{ 
                  opacity: [0.2, 0.5, 0.2],
                  y: [0, 15, 0]
                }}
                transition={{ 
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[40%] rounded-full bg-gradient-to-bl from-purple-500/5 to-[#FF8C40]/5 blur-3xl"
              />
            </div>

            {/* Grid pattern decorativo */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
                 style={{
                   backgroundImage: 'radial-gradient(circle, rgba(255, 107, 0, 0.8) 1px, transparent 1px)', 
                   backgroundSize: '20px 20px'
                 }}>
            </div>

            {/* Partículas decorativas flutuantes */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <motion.div 
                  key={i}
                  className={`absolute h-1 w-1 rounded-full ${
                    i % 3 === 0 ? 'bg-[#FF6B00]/40' : i % 3 === 1 ? 'bg-blue-400/30' : 'bg-purple-400/30'
                  }`}
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 5,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>

            {/* Seção visual principal com brain expandindo-se */}
            <div className="mb-6 relative">
              {/* Círculos concêntricos animados */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: [0, 0.5, 0], 
                    scale: [1, 1.8, 2.2],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: i * 0.5,
                  }}
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border
                    ${isLightMode ? 'border-[#FF6B00]/20' : 'border-[#FF6B00]/15'} w-24 h-24`}
                  style={{ scale: 1 + i * 0.3 }}
                />
              ))}

              {/* Hexágono animado como base */}
              <motion.div
                className="relative"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <div className={`w-24 h-28 clip-path-hexagon relative flex items-center justify-center
                  ${isLightMode ? 'bg-gradient-to-br from-white to-orange-50 shadow-md' : 'bg-gradient-to-br from-[#14253d] to-[#0c1220]'}`}
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    boxShadow: isLightMode ? '0 10px 25px -5px rgba(255, 120, 0, 0.15)' : '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  <div className={`w-20 h-24 absolute clip-path-hexagon 
                    ${isLightMode ? 'bg-gradient-to-br from-orange-50 to-orange-100/50' : 'bg-gradient-to-br from-[#192c4a]/80 to-[#0d1526]/80'}`}
                    style={{
                      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    }}
                  ></div>

                  {/* Elemento central com animação de pulso */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ 
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="z-10 relative"
                  >
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] flex items-center justify-center shadow-lg">
                      <Brain className="h-8 w-8 text-white drop-shadow-md" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Elementos flutuantes ao redor do hexágono */}
              <motion.div
                initial={{ y: 5, opacity: 0.7 }}
                animate={{ y: -5, opacity: 1 }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute -top-4 right-0 flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm border border-blue-500/20"
              >
                <Lightbulb className="h-4 w-4 text-blue-500" />
              </motion.div>

              <motion.div
                initial={{ y: -5, opacity: 0.7 }}
                animate={{ y: 5, opacity: 1 }}
                transition={{ 
                  duration: 2.3,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: 0.8
                }}
                className="absolute -bottom-3 -left-1 flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm border border-purple-500/20"
              >
                <Rocket className="h-4 w-4 text-purple-500" />
              </motion.div>

              <motion.div
                initial={{ y: 5, opacity: 0.7 }}
                animate={{ y: -5, opacity: 1 }}
                transition={{ 
                  duration: 2.7,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: 1.1
                }}
                className="absolute -bottom-2 right-2 flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm border border-green-500/20"
              >
                <Zap className="h-3.5 w-3.5 text-green-500" />
              </motion.div>
            </div>

            {/* Título principal com efeito de destaque */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mb-3"
            >
              <h3 className={`font-bold text-xl mb-1 ${isLightMode ? 'text-gray-800' : 'text-white'} tracking-tight`}>
                <span className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-transparent bg-clip-text">
                  Epictus IA:
                </span> Seu Copiloto
              </h3>

              <div className="flex items-center justify-center">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '60px' }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="h-0.5 bg-gradient-to-r from-transparent via-[#FF6B00]/60 to-transparent rounded-full"
                />
              </div>
            </motion.div>

            {/* Descrição com estilo moderno e badges informativas */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mb-5 px-8"
            >
              <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-300'} leading-relaxed mb-4`}>
                Potencialize seus estudos com um assistente inteligente personalizado que entende suas necessidades
              </p>

              {/* Recursos destacados */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { icon: <Sparkles className="h-3 w-3" />, text: "Respostas Personalizadas", color: "from-blue-500 to-blue-600" },
                  { icon: <Rocket className="h-3 w-3" />, text: "Planos de Ação", color: "from-[#FF6B00] to-[#FF8C40]" },
                  { icon: <Brain className="h-3 w-3" />, text: "Análise Inteligente", color: "from-purple-500 to-purple-600" },
                  { icon: <Zap className="h-3 w-3" />, text: "Resultados Rápidos", color: "from-green-500 to-green-600" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                    className={`flex items-center gap-1.5 p-1.5 rounded-lg border 
                      ${isLightMode 
                        ? 'border-gray-200 bg-white/80 shadow-sm' 
                        : 'border-gray-700/50 bg-gray-800/20 backdrop-blur-sm'}`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-r ${item.color} shadow-sm`}>
                      {item.icon}
                    </div>
                    <span className={`text-xs font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      {item.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Botão de ação principal com efeito de destaque */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="w-full px-8"
            >
              <motion.button
                whileHover={{ 
                  scale: 1.03,
                  boxShadow: isLightMode 
                    ? "0 10px 25px -5px rgba(255, 107, 0, 0.3), 0 4px 10px -5px rgba(255, 107, 0, 0.2)" 
                    : "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 10px -5px rgba(255, 107, 0, 0.2)"
                }}
                whileTap={{ scale: 0.97 }}
                className={`w-full py-3 rounded-xl font-medium text-white relative overflow-hidden group`}
                onClick={() => setPergunta("Olá, preciso de ajuda com meus estudos")}
              >
                {/* Fundo com gradiente animado */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] z-0"></div>

                {/* Efeito de brilho ao hover */}
                <div className="absolute -inset-x-full inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-shine z-10"></div>

                {/* Texto e ícones */}
                <div className="relative z-20 flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Comece agora</span>
                </div>
              </motion.button>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className={`text-xs mt-3 text-center ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}
              >
                Otimize seu tempo e melhore seus resultados com IA avançada
              </motion.p>
            </motion.div>

            {/* Indicador sutil de como utilizar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="absolute bottom-2 left-0 right-0 flex justify-center"
            >
              <div className={`flex items-center gap-1 ${isLightMode ? 'text-gray-400' : 'text-gray-500'} text-[10px]`}>
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="h-2.5 w-2.5 rotate-90" />
                </motion.div>
                <span>Deslize para explorar</span>
              </div>
            </motion.div>
          </div>
          
        </AnimatePresence>
      </AnimatePresence>
    </motion.div>
  );
}
