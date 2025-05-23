import React, { useState, useEffect } from "react";
import { Brain, Lightbulb, Send, ArrowRight, BarChart2, Sparkles, Zap, Check } from "lucide-react";
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
          icone: "BookOpen"
        },
        {
          numero: 2,
          titulo: "Estruturar Ideias",
          descricao: "Organize seu pensamento com nosso Gerador de Mapas Mentais",
          ferramenta: "mapa-mental",
          icone: "Brain"
        },
        {
          numero: 3,
          titulo: "Criar Slides",
          descricao: "Crie slides profissionais com nossa ferramenta de Slides Didáticos",
          ferramenta: "slides-didaticos",
          icone: "LayoutTemplate"
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
          icone: "Target"
        },
        {
          numero: 2,
          titulo: "Elaborar Questões",
          descricao: "Crie questões eficazes com o Gerador de Questões",
          ferramenta: "gerador-questoes",
          icone: "FileQuestion"
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
          icone: "FileText"
        },
        {
          numero: 2,
          titulo: "Organizar Conteúdo",
          descricao: "Organize o conteúdo com ferramentas de estruturação",
          ferramenta: "organizador-conteudo",
          icone: "ListChecks"
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
          icone: "PenTool"
        },
        {
          numero: 2,
          titulo: "Revisar Conteúdo",
          descricao: "Use o Revisor de Textos para aprimorar a qualidade",
          ferramenta: "revisor-textos",
          icone: "Edit"
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
          icone: "Lightbulb"
        },
        {
          numero: 2,
          titulo: "Organizar Estudo",
          descricao: "Crie um plano de estudos organizado com o Cronograma Inteligente",
          ferramenta: "cronograma-estudos",
          icone: "Calendar"
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

        {/* Partículas decorativas */}
        <div className="absolute top-1/4 right-10 w-2 h-2 bg-[#FF6B00]/40 rounded-full"></div>
        <div className="absolute top-1/3 left-10 w-3 h-3 bg-blue-400/30 dark:bg-blue-400/20 rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-purple-400/30 dark:bg-purple-400/20 rounded-full"></div>
      </div>

      {/* Header elegante com gradiente - estilo igual ao FocoDoDiaCard */}
      <div className={`p-5 ${isLightMode ? 'bg-gradient-to-r from-orange-50 to-orange-100/50' : 'bg-gradient-to-r from-[#0A2540]/80 to-[#001427]'} border-b ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/20'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg flex items-center justify-center ${isLightMode ? 'bg-white shadow-sm border border-orange-200' : 'bg-[#FF6B00]/10 border border-[#FF6B00]/30'}`}>
              <Brain className={`h-5 w-5 text-[#FF6B00]`} />
            </div>
            <div>
              <h3 className={`font-semibold text-lg ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                Epictus IA: Seu Copiloto
              </h3>
              <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>
                <span className="font-medium">Assistente inteligente</span>
              </p>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-xs font-medium ${isLightMode ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
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
              <div className={`p-3 rounded-full ${isLightMode ? 'bg-orange-100' : 'bg-[#FF6B00]/20'}`}>
                <Brain className={`h-8 w-8 text-[#FF6B00] animate-pulse`} />
              </div>
              <p className={`text-center font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
                Epictus está planejando para você...
              </p>
              <div className="w-full max-w-md h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#FF6B00] rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </div>
              <p className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Analisando sua necessidade e encontrando as melhores ferramentas...
              </p>
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
                <h4 className={`font-semibold ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                  {planoGerado.titulo}
                </h4>
                <p className={`text-xs mt-1 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Você pediu: "{necessidadeOriginal}"
                </p>
              </div>
              
              {/* Lista de passos do plano */}
              <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                {planoGerado.passos.map((passo) => (
                  <motion.div
                    key={passo.numero}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: passo.numero * 0.1 }}
                    className={`p-3 rounded-lg border flex items-start gap-3 ${
                      isLightMode 
                        ? 'border-gray-200 bg-gray-50 hover:bg-gray-100' 
                        : 'border-gray-700 bg-gray-800/30 hover:bg-gray-800/50'
                    } transition-colors duration-200`}
                  >
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                      isLightMode ? 'bg-[#FF6B00] text-white' : 'bg-[#FF6B00] text-white'
                    }`}>
                      {passo.numero}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <h5 className={`font-medium text-sm ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                          {passo.titulo}
                        </h5>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navegarParaFerramenta(passo.ferramenta)}
                          className={`text-xs px-2 py-1 rounded-md ${
                            isLightMode 
                              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                              : 'bg-purple-900/30 text-purple-300 border border-purple-800/30 hover:bg-purple-800/30'
                          }`}
                        >
                          Iniciar
                        </motion.button>
                      </div>
                      <p className={`text-xs mt-1 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                        {passo.descricao}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Ações do plano */}
            <div className="mt-4 space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={aplicarPlanoCompleto}
                className={`w-full py-2.5 rounded-lg font-medium bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90 transition-all duration-200 flex items-center justify-center gap-2`}
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
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                } transition-all duration-200`}
              >
                Nova necessidade
              </motion.button>
            </div>
          </motion.div>
        ) : (
      <div className="p-6 flex-grow flex flex-col justify-between relative z-10">
        <div className="space-y-3">
          {/* Título e dica de uso - label para o campo */}
          <div className="mb-1 text-center">
            <p className={`font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
              Como posso te ajudar a potencializar seus estudos hoje?
            </p>
          </div>
          
          {/* Campo de entrada de necessidade principal */}
          <form onSubmit={handleEnviarPergunta} className="relative">
            <div className={`relative overflow-hidden rounded-xl border ${isLightMode ? 'border-gray-200 shadow-sm' : 'border-gray-700'} transition-all duration-300 ${isTyping ? (isLightMode ? 'ring-2 ring-[#FF6B00]/30' : 'ring-2 ring-[#FF6B00]/30') : ''}`}>
              <input
                type="text"
                value={pergunta}
                onChange={handleInputChange}
                placeholder="Digite sua necessidade ou objetivo (ex: 'Preciso criar uma apresentação sobre Relevo')"
                className={`w-full py-3.5 px-4 pr-12 ${isLightMode ? 'bg-white text-gray-800' : 'bg-gray-800/50 text-white backdrop-blur-sm'} placeholder-gray-400 focus:outline-none text-sm`}
                autoFocus
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!pergunta.trim()}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md ${pergunta.trim() ? (isLightMode ? 'bg-[#FF6B00] text-white' : 'bg-[#FF6B00] text-white') : (isLightMode ? 'bg-gray-100 text-gray-400' : 'bg-gray-700 text-gray-400')}`}
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </div>
            
            {/* Botão "Analisar Necessidade" abaixo do campo */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!pergunta.trim()}
              className={`w-full mt-2 py-2.5 rounded-lg font-medium ${pergunta.trim() ? 'bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'} transition-all duration-200`}
            >
              Analisar Necessidade
            </motion.button>
          </form>
          
          {/* Sugestões rápidas */}
          <div className="mt-3">
            <p className={`text-xs mb-2 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>Sugestões rápidas:</p>
            <div className="flex flex-wrap gap-2">
              {["Criar Resumo", "Fazer um Quiz", "Planejar Estudos", "Corrigir Redação", "Gerar Slides"].map((sugestao) => (
                <motion.button
                  key={sugestao}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPergunta(sugestao)}
                  className={`text-xs px-2.5 py-1.5 rounded-full border ${isLightMode ? 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100' : 'border-gray-700 bg-gray-800/60 text-gray-300 hover:bg-gray-700'}`}
                >
                  {sugestao}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Rodapé com status e link para explorar ferramentas */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isLightMode ? 'bg-green-400' : 'bg-green-500'} animate-pulse`}></div>
            <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>IA pronta para ajudar</span>
          </div>

          <a 
            href="/epictus-ia" 
            className={`text-xs flex items-center gap-1 ${isLightMode ? 'text-gray-500 hover:text-[#FF6B00]' : 'text-gray-400 hover:text-[#FF6B00]'} transition-colors duration-200`}
          >
            <Lightbulb className="h-3 w-3" />
            <span>Explorar Todas as Ferramentas</span>
          </a>
        </div>
      </AnimatePresence>
    </motion.div>
  );
}