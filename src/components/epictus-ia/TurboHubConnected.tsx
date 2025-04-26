import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Brain, 
  Code, 
  Star, 
  Sparkles, 
  Wrench, 
  Zap, 
  Lightbulb, 
  BarChart2,
  FileText,
  Search,
  PenTool
} from "lucide-react";

interface Nodule {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  functions: string[];
  example: string;
}

const TurboHubConnected: React.FC = () => {
  console.log("Renderizando TurboHubConnected");

  const [activeNodule, setActiveNodule] = useState<string | null>(null);

  // Definição dos nódulos disponíveis para conexão
  const nodules: Nodule[] = [
    {
      id: "brain",
      name: "IA Geral",
      icon: <Brain className="h-5 w-5" />,
      description: "Responde perguntas gerais e fornece informações amplas sobre diversos tópicos.",
      color: "bg-purple-500",
      functions: ["Responder perguntas", "Explicar conceitos", "Fornecer informações gerais"],
      example: "O que é fotossíntese?"
    },
    {
      id: "code",
      name: "Código",
      icon: <Code className="h-5 w-5" />,
      description: "Especializado em programação, explicação de código e desenvolvimento de software.",
      color: "bg-blue-500",
      functions: ["Escrever código", "Depurar erros", "Explicar algoritmos"],
      example: "Como implementar um algoritmo de ordenação em Python?"
    },
    {
      id: "academic",
      name: "Acadêmico",
      icon: <FileText className="h-5 w-5" />,
      description: "Focado em conteúdo educacional, pesquisas e temas acadêmicos.",
      color: "bg-green-500",
      functions: ["Explicar teorias científicas", "Ajudar com pesquisas", "Resumir artigos"],
      example: "Explique a Teoria da Relatividade de Einstein"
    },
    {
      id: "creative",
      name: "Criativo",
      icon: <PenTool className="h-5 w-5" />,
      description: "Auxilia com escrita criativa, ideias originais e soluções inovadoras.",
      color: "bg-pink-500",
      functions: ["Gerar ideias criativas", "Criar histórias", "Sugerir abordagens inovadoras"],
      example: "Crie uma história curta sobre uma viagem no tempo"
    },
    {
      id: "analysis",
      name: "Análise",
      icon: <BarChart2 className="h-5 w-5" />,
      description: "Especializado em análise de dados, estatísticas e interpretações.",
      color: "bg-amber-500",
      functions: ["Analisar dados", "Interpretar informações", "Extrair insights"],
      example: "Analise estas tendências de mercado"
    },
    {
      id: "tools",
      name: "Ferramentas",
      icon: <Wrench className="h-5 w-5" />,
      description: "Oferece acesso a ferramentas especializadas para tarefas específicas.",
      color: "bg-gray-500",
      functions: ["Converter formatos", "Traduzir textos", "Formatar documentos"],
      example: "Converta este texto para formato markdown"
    }
  ];

  // Manipulação de hover nos nódulos
  const handleNoduleHover = (id: string) => {
    try {
      setActiveNodule(id);
    } catch (error) {
      console.error("Erro ao definir nódulo ativo:", error);
    }
  };

  const clearActiveNodule = () => {
    try {
      setActiveNodule(null);
    } catch (error) {
      console.error("Erro ao limpar nódulo ativo:", error);
    }
  };

  // Verificar se há um nódulo ativo para mostrar detalhes
  const activeNoduleInfo = activeNodule 
    ? nodules.find(nodule => nodule.id === activeNodule) 
    : null;

  try {
    return (
      <div className="w-full px-4 py-2">
        <div className="relative bg-white/5 dark:bg-black/10 backdrop-blur-sm border border-border/50 rounded-lg p-3">
          {/* Título do Hub */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-500/20 text-blue-500">
              <Zap className="h-3 w-3" />
            </div>
            <h3 className="text-xs font-medium text-foreground/80">Hub Conectado</h3>
            <div className="ml-auto flex items-center">
              <span className="text-[10px] text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Ativo
              </span>
            </div>
          </div>

          {/* Nódulos de conexão */}
          <div className="flex items-center justify-between gap-2 mt-1">
            {nodules.map((nodule) => (
              <motion.div
                key={nodule.id}
                className={`flex-1 flex flex-col items-center justify-center rounded-md p-2 cursor-pointer transition-all ${
                  activeNodule === nodule.id 
                    ? 'bg-blue-500/10 border border-blue-500/30' 
                    : 'hover:bg-white/5 dark:hover:bg-white/5 border border-transparent'
                }`}
                onMouseEnter={() => handleNoduleHover(nodule.id)}
                onMouseLeave={clearActiveNodule}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`h-8 w-8 rounded-full ${nodule.color}/20 flex items-center justify-center text-${nodule.color.split('-')[1]}-500 mb-1`}>
                  {nodule.icon}
                </div>
                <span className="text-[10px] text-center line-clamp-1">{nodule.name}</span>
              </motion.div>
            ))}
          </div>

          {/* Informação do nódulo ativo (exibido no hover) */}
          {activeNoduleInfo && (
            <motion.div 
              className="absolute left-0 right-0 bottom-[-90px] bg-white dark:bg-gray-900 shadow-lg rounded-lg p-3 border border-border/50 z-10"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-full ${activeNoduleInfo.color}/20 flex-shrink-0 flex items-center justify-center text-${activeNoduleInfo.color.split('-')[1]}-500`}>
                  {activeNoduleInfo.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{activeNoduleInfo.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{activeNoduleInfo.description}</p>
                  <div className="mt-2">
                    <span className="text-[10px] text-muted-foreground">Exemplo: <span className="text-foreground/80 italic">{activeNoduleInfo.example}</span></span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erro ao renderizar TurboHubConnected:", error);

    // Fallback simples para caso de erro
    return (
      <div className="w-full px-4 py-2">
        <div className="bg-white/5 dark:bg-black/10 backdrop-blur-sm border border-border/50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-500/20 text-blue-500">
              <Zap className="h-3 w-3" />
            </div>
            <h3 className="text-xs font-medium text-foreground/80">Hub Conectado</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Os nódulos de conexão estão temporariamente indisponíveis.
          </p>
        </div>
      </div>
    );
  }
};

export default TurboHubConnected;