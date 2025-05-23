
import React, { useState, useEffect } from "react";
import { Brain, Lightbulb, Send, ArrowRight, BarChart2, Sparkles, Zap, Check, Command, MessageSquare, Book, Clock, Bookmark, Star, FileText } from "lucide-react";
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
  const [recentUsage, setRecentUsage] = useState(false);
  const [historyItems, setHistoryItems] = useState([
    { icon: "FileText", text: "Resumo de Biologia" },
    { icon: "Book", text: "Criar Quiz de Matemática" },
    { icon: "MessageSquare", text: "Planejar Estudos" }
  ]);

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
        
        // Adicionar à lista de histórico
        if (historyItems.length >= 3) {
          historyItems.pop(); // Remove o último item
        }
        setHistoryItems([
          { icon: "MessageSquare", text: pergunta.substring(0, 25) + (pergunta.length > 25 ? "..." : "") },
          ...historyItems.slice(0, 2)
        ]);
        
        setRecentUsage(true);
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
          categoria: "Pesquisa"
        },
        {
          numero: 2,
          titulo: "Estruturar Ideias",
          descricao: "Organize seu pensamento com nosso Gerador de Mapas Mentais",
          ferramenta: "mapa-mental",
          icone: "Brain",
          categoria: "Organização"
        },
        {
          numero: 3,
          titulo: "Criar Slides",
          descricao: "Crie slides profissionais com nossa ferramenta de Slides Didáticos",
          ferramenta: "slides-didaticos",
          icone: "LayoutTemplate",
          categoria: "Criação"
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
          categoria: "Planejamento"
        },
        {
          numero: 2,
          titulo: "Elaborar Questões",
          descricao: "Crie questões eficazes com o Gerador de Questões",
          ferramenta: "gerador-questoes",
          icone: "FileQuestion",
          categoria: "Criação"
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
          categoria: "Análise"
        },
        {
          numero: 2,
          titulo: "Organizar Conteúdo",
          descricao: "Organize o conteúdo com ferramentas de estruturação",
          ferramenta: "organizador-conteudo",
          icone: "ListChecks",
          categoria: "Organização"
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
          categoria: "Planejamento"
        },
        {
          numero: 2,
          titulo: "Revisar Conteúdo",
          descricao: "Use o Revisor de Textos para aprimorar a qualidade",
          ferramenta: "revisor-textos",
          icone: "Edit",
          categoria: "Revisão"
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
          categoria: "Aprendizado"
        },
        {
          numero: 2,
          titulo: "Organizar Estudo",
          descricao: "Crie um plano de estudos organizado com o Cronograma Inteligente",
          ferramenta: "cronograma-estudos",
          icone: "Calendar",
          categoria: "Organização"
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

    // Desativar o estado de digitação após um tempo
    setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  // Renderizar o ícone correto com base no nome
  const renderIcon = (iconName, size = 4) => {
    switch (iconName) {
      case 'FileText': return <FileText className={`h-${size} w-${size}`} />;
      case 'Book': return <Book className={`h-${size} w-${size}`} />;
      case 'MessageSquare': return <MessageSquare className={`h-${size} w-${size}`} />;
      default: return <MessageSquare className={`h-${size} w-${size}`} />;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl bg-white dark:bg-gradient-to-br dark:from-[#0c1425] dark:to-[#0a1a2e] h-full w-full relative flex flex-col"
    >
      {/* Elementos decorativos de fundo com efeito de gradiente mais suave */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradientes de fundo mais suaves e modernos */}
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
        
        {/* Linhas decorativas */}
        <div className="absolute top-0 right-0 w-1/3 h-px bg-gradient-to-r from-transparent to-[#FF6B00]/30 dark:to-[#FF6B00]/20"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-px bg-gradient-to-r from-[#FF6B00]/30 dark:from-[#FF6B00]/20 to-transparent"></div>
        
        {/* Partículas decorativas mais sutis */}
        <div className="absolute top-1/4 right-10 w-2 h-2 bg-[#FF6B00]/30 rounded-full"></div>
        <div className="absolute top-1/3 left-10 w-3 h-3 bg-blue-400/20 dark:bg-blue-400/10 rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-purple-400/20 dark:bg-purple-400/10 rounded-full"></div>
        
        {/* Padrão de pontos sutis */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10 bg-[radial-gradient(#FF6B00_1px,transparent_1px)] bg-[length:20px_20px]"></div>
      </div>

      {/* Header elegante com gradiente refinado */}
      <div className={`p-5 ${isLightMode 
        ? 'bg-gradient-to-r from-orange-50 via-orange-50/70 to-orange-100/30' 
        : 'bg-gradient-to-r from-[#0A2540]/90 via-[#0A2540]/80 to-[#001427]/90'} 
        border-b ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/20'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg flex items-center justify-center ${isLightMode 
              ? 'bg-white/80 backdrop-blur-sm shadow-sm border border-orange-200/50' 
              : 'bg-[#FF6B00]/10 backdrop-blur-sm border border-[#FF6B00]/30'}`}>
              <Brain className={`h-5 w-5 text-[#FF6B00]`} />
            </div>
            <div>
              <h3 className={`font-semibold text-lg ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                Epictus IA: Seu Copiloto
              </h3>
              <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>
                <span className="font-medium">Assistente inteligente</span>
                {recentUsage && 
                  <span className="ml-2 text-xs opacity-70">
                    • <Clock className="inline h-3 w-3 mr-0.5" />Uso recente
                  </span>
                }
              </p>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-xs font-medium ${isLightMode 
              ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/70' 
              : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
            onClick={() => window.location.href = "/epictus-ia"}
          >
            <span>Modo completo</span>
            <ArrowRight className="h-3 w-3 ml-1" />
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
              {/* Ícone pulsante com efeito de glow */}
              <div className={`p-3 rounded-full ${isLightMode 
                ? 'bg-orange-100 shadow-[0_0_15px_rgba(255,107,0,0.3)]' 
                : 'bg-[#FF6B00]/20 shadow-[0_0_15px_rgba(255,107,0,0.2)]'}`}>
                <Brain className={`h-8 w-8 text-[#FF6B00] animate-pulse`} />
              </div>
              
              {/* Texto informativo */}
              <p className={`text-center font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
                Epictus está analisando sua necessidade...
              </p>
              
              {/* Barra de progresso animada mais sofisticada */}
              <div className="w-full max-w-md h-1.5 bg-gray-200/60 dark:bg-gray-700/60 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </div>
              
              {/* Detalhes do processo */}
              <div className="text-center">
                <p className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Identificando ferramentas ideais para <span className="font-medium">{necessidadeOriginal}</span>
                </p>
                
                {/* Etapas do processamento */}
                <div className="mt-3 flex items-center justify-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${isLightMode 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-green-900/30 text-green-400 border border-green-800/30'}`}>
                    <Check className="inline h-3 w-3 mr-1" />Análise
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${isLightMode 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-blue-900/30 text-blue-400 border border-blue-800/30'}`}>
                    <Command className="inline h-3 w-3 mr-1" />Otimização
                  </span>
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
              {/* Título do plano e necessidade original com design refinado */}
              <div className="text-center mb-4">
                <h4 className={`font-semibold text-lg ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                  {planoGerado.titulo}
                </h4>
                <div className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-xs ${isLightMode 
                  ? 'bg-gray-100 text-gray-600' 
                  : 'bg-gray-800/50 text-gray-300 backdrop-blur-sm'}`}>
                  <MessageSquare className="h-3 w-3 mr-1.5" />
                  <span className="font-medium">{necessidadeOriginal}</span>
                </div>
              </div>

              {/* Lista de passos do plano com design aprimorado */}
              <div className="space-y-3 max-h-[220px] overflow-y-auto hide-scrollbar pr-1">
                {planoGerado.passos.map((passo) => (
                  <motion.div
                    key={passo.numero}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: passo.numero * 0.1 }}
                    className={`p-4 rounded-lg border flex items-start gap-3 ${
                      isLightMode 
                        ? 'border-gray-200/70 bg-gray-50/80 hover:bg-gray-100/80 backdrop-blur-sm' 
                        : 'border-gray-700/70 bg-gray-800/30 hover:bg-gray-800/40 backdrop-blur-sm'
                    } transition-colors duration-200`}
                  >
                    {/* Número de passo com design elevado */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isLightMode 
                        ? 'bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] text-white shadow-md' 
                        : 'bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] text-white shadow-md'
                    }`}>
                      {passo.numero}
                    </div>

                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        {/* Título com categoria */}
                        <div>
                          <h5 className={`font-medium ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                            {passo.titulo}
                          </h5>
                          {passo.categoria && (
                            <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {passo.categoria}
                            </span>
                          )}
                        </div>
                        
                        {/* Botão iniciar */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navegarParaFerramenta(passo.ferramenta)}
                          className={`text-xs px-2.5 py-1.5 rounded-md ${
                            isLightMode 
                              ? 'bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 border border-[#FF6B00]/20' 
                              : 'bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/30 hover:bg-[#FF6B00]/20'
                          } transition-all duration-200`}
                        >
                          Iniciar
                        </motion.button>
                      </div>
                      
                      {/* Descrição do passo */}
                      <p className={`text-xs mt-1 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                        {passo.descricao}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Ações do plano com design refinado */}
            <div className="mt-4 space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={aplicarPlanoCompleto}
                className={`w-full py-2.5 rounded-lg font-medium bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white hover:shadow-lg hover:from-[#FF6B00] hover:to-[#FF7A20] transition-all duration-200 flex items-center justify-center gap-2`}
              >
                <Zap className="h-4 w-4" />
                <span>APLICAR PLANO SUGERIDO</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={reiniciarProcesso}
                className={`w-full py-2 rounded-lg text-sm font-medium ${
                  isLightMode 
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200/80 backdrop-blur-sm' 
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 backdrop-blur-sm'
                } transition-all duration-200`}
              >
                Nova necessidade
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="initial"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 flex-grow flex flex-col justify-between relative z-10"
          >
            <div className="space-y-3">
              {/* Título e dica de uso - label para o campo com design mais moderno */}
              <div className="mb-1 text-center">
                <p className={`font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
                  Como posso te ajudar a potencializar seus estudos hoje?
                </p>
              </div>

              {/* Campo de entrada de necessidade principal com design elevado */}
              <form onSubmit={handleEnviarPergunta} className="relative">
                <div className={`relative overflow-hidden rounded-xl backdrop-blur-sm ${isLightMode 
                  ? 'shadow-[0_2px_8px_rgba(0,0,0,0.05)]' 
                  : 'shadow-[0_2px_8px_rgba(0,0,0,0.15)]'} ${isTyping 
                  ? (isLightMode ? 'ring-2 ring-[#FF6B00]/30' : 'ring-2 ring-[#FF6B00]/30') 
                  : 'border border-gray-200 dark:border-gray-700'}`}>
                  <input
                    type="text"
                    value={pergunta}
                    onChange={handleInputChange}
                    placeholder="Digite sua necessidade ou objetivo de estudo..."
                    className={`w-full py-3.5 px-4 pr-12 ${isLightMode 
                      ? 'bg-white/80 text-gray-800' 
                      : 'bg-gray-800/50 text-white backdrop-blur-sm'} placeholder-gray-400 focus:outline-none text-sm`}
                    autoFocus
                  />
                  
                  {/* Ícone de envio animado */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!pergunta.trim()}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md ${pergunta.trim() 
                      ? (isLightMode ? 'bg-[#FF6B00] text-white shadow-sm' : 'bg-[#FF6B00] text-white shadow-md') 
                      : (isLightMode ? 'bg-gray-100 text-gray-400' : 'bg-gray-700 text-gray-400')}`}
                  >
                    <Send className="h-4 w-4" />
                  </motion.button>
                </div>

                {/* Botão "Analisar Necessidade" abaixo do campo com design aprimorado */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!pergunta.trim()}
                  className={`w-full mt-2 py-2.5 rounded-lg font-medium ${pergunta.trim() 
                    ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white hover:shadow-md' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'} transition-all duration-200`}
                >
                  Analisar Necessidade
                </motion.button>
              </form>

              {/* Histórico recente */}
              {historyItems.length > 0 && (
                <div className="mt-3 mb-1">
                  <p className={`text-xs mb-2 flex items-center ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Clock className="h-3 w-3 mr-1.5" /> Uso recente:
                  </p>
                  <div className="space-y-1.5">
                    {historyItems.map((item, index) => (
                      <div 
                        key={index}
                        onClick={() => setPergunta(item.text)}
                        className={`text-xs py-1.5 px-2.5 rounded-md flex items-center gap-1.5 cursor-pointer transition-colors ${
                          isLightMode 
                            ? 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80' 
                            : 'bg-gray-800/40 text-gray-300 hover:bg-gray-700/50'
                        }`}
                      >
                        {renderIcon(item.icon, 3)}
                        <span className="line-clamp-1">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sugestões rápidas com design mais moderno e sofisticado */}
              <div className="mt-3">
                <p className={`text-xs mb-2 flex items-center ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Sparkles className="h-3 w-3 mr-1.5" /> Sugestões rápidas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { text: "Criar Resumo", icon: <FileText className="h-3 w-3 mr-1" /> },
                    { text: "Fazer um Quiz", icon: <Book className="h-3 w-3 mr-1" /> },
                    { text: "Planejar Estudos", icon: <Calendar className="h-3 w-3 mr-1" /> },
                    { text: "Corrigir Redação", icon: <Edit className="h-3 w-3 mr-1" /> },
                    { text: "Gerar Slides", icon: <Layout className="h-3 w-3 mr-1" /> }
                  ].map((sugestao, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPergunta(sugestao.text)}
                      className={`text-xs px-2.5 py-1.5 rounded-full border flex items-center ${
                        isLightMode 
                          ? 'border-gray-200/70 bg-gray-50/80 text-gray-700 hover:bg-gray-100/90 backdrop-blur-sm' 
                          : 'border-gray-700/70 bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 backdrop-blur-sm'
                      } transition-all duration-200`}
                    >
                      {sugestao.icon}
                      <span>{sugestao.text}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Rodapé com status e link para explorar ferramentas com design mais elegante */}
            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isLightMode ? 'bg-green-400' : 'bg-green-500'} animate-pulse shadow-[0_0_5px_rgba(74,222,128,0.5)]`}></div>
                <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>IA pronta para ajudar</span>
              </div>

              <a 
                href="/epictus-ia" 
                className={`text-xs flex items-center gap-1 ${
                  isLightMode 
                    ? 'text-gray-500 hover:text-[#FF6B00]' 
                    : 'text-gray-400 hover:text-[#FF6B00]'
                } transition-colors duration-200 group`}
              >
                <Lightbulb className="h-3 w-3 group-hover:rotate-12 transition-transform duration-300" />
                <span>Explorar Todas as Ferramentas</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
