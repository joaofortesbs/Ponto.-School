import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopicosEstudoViewProps {
  className?: string;
}

// Dados de exemplo para tópicos de estudo
const topicosEstudo = [
  {
    id: 1,
    nome: "Matemática",
    icone: "📐",
    cor: "#FF8A00",
    gruposAtivos: 8,
    tendencia: "alta",
    novoConteudo: true,
  },
  {
    id: 2,
    nome: "Língua Portuguesa",
    icone: "📚",
    cor: "#6F3FF5",
    gruposAtivos: 9,
    tendencia: "estável",
    novoConteudo: false,
  },
  {
    id: 3,
    nome: "Física",
    icone: "⚛️",
    cor: "#5B70F3",
    gruposAtivos: 6,
    tendencia: "alta",
    novoConteudo: true,
  },
  {
    id: 4,
    nome: "Química",
    icone: "🧪",
    cor: "#00A699",
    gruposAtivos: 5,
    tendencia: "estável",
    novoConteudo: false,
  },
  {
    id: 5,
    nome: "Biologia",
    icone: "🧬",
    cor: "#4CAF50",
    gruposAtivos: 7,
    tendencia: "alta",
    novoConteudo: true,
  },
  {
    id: 6,
    nome: "História",
    icone: "🏛️",
    cor: "#FF5722",
    gruposAtivos: 4,
    tendencia: "baixa",
    novoConteudo: false,
  },
  {
    id: 7,
    nome: "Geografia",
    icone: "🌎",
    cor: "#2196F3",
    gruposAtivos: 6,
    tendencia: "estável",
    novoConteudo: true,
  },
  {
    id: 8,
    nome: "Literatura",
    icone: "📖",
    cor: "#9C27B0",
    gruposAtivos: 3,
    tendencia: "estável",
    novoConteudo: false,
  },
  {
    id: 9,
    nome: "Sociologia",
    icone: "👥",
    cor: "#607D8B",
    gruposAtivos: 5,
    tendencia: "alta",
    novoConteudo: false,
  },
  {
    id: 10,
    nome: "Filosofia",
    icone: "🧠",
    cor: "#795548",
    gruposAtivos: 4,
    tendencia: "estável",
    novoConteudo: true,
  },
  {
    id: 11,
    nome: "Inglês",
    icone: "🇬🇧",
    cor: "#3F51B5",
    gruposAtivos: 6,
    tendencia: "alta",
    novoConteudo: false,
  },
  {
    id: 12,
    nome: "Espanhol",
    icone: "🇪🇸",
    cor: "#FFC107",
    gruposAtivos: 3,
    tendencia: "baixa",
    novoConteudo: false,
  },
];

type InterfaceType = "meus-grupos" | "recomendacoes-ia" | "estatisticas";

const TopicosEstudoView: React.FC<TopicosEstudoViewProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [interfaceAtiva, setInterfaceAtiva] = useState<InterfaceType>("meus-grupos");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [hoveredTopic, setHoveredTopic] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtrar tópicos baseado na busca e filtros selecionados
  const topicosFilterados = topicosEstudo.filter(
    (topico) => {
      const matchesSearch = topico.nome.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = !selectedFilter || 
        (selectedFilter === "tendencia-alta" && topico.tendencia === "alta") ||
        (selectedFilter === "novo-conteudo" && topico.novoConteudo);
      return matchesSearch && matchesFilter;
    }
  );

  // Detectar tópicos em destaque (com tendência alta e novo conteúdo)
  const isTopicFeatured = (topico: typeof topicosEstudo[0]) => {
    return topico.tendencia === "alta" && topico.novoConteudo;
  };

  // Verificar visibilidade dos botões de scroll
  useEffect(() => {
    const checkScroll = () => {
      if (!containerRef.current) return;

      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10); // 10px de margem para evitar problemas de arredondamento
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      checkScroll(); // Verificar estado inicial

      // Limpar event listener ao desmontar
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, [topicosFilterados]);

  // Função para rolar o container
  const scrollContainer = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const cardWidth = 150; // Largura aproximada de cada card com margens
    const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;

    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  // Detectar quando o usuário clica em um tópico
  const handleTopicSelect = (topicId: number) => {
    setSelectedTopic(selectedTopic === topicId ? null : topicId);
    // Aqui você pode adicionar lógica para filtrar grupos de estudo baseado no tópico selecionado
  };

  // Conteúdo condicional baseado na interface selecionada
  const renderConteudoInterface = () => {
    switch (interfaceAtiva) {
      case "meus-grupos":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {topicosFilterados.map((topico) => (
              <motion.div 
                key={topico.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: topico.id * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                className={`bg-gradient-to-br from-gray-900/90 to-gray-800/90 dark:from-gray-800 dark:to-gray-900 
                  backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/10 hover:border-[#FF6B00]/30 transition-all duration-300 
                  ${isTopicFeatured(topico) ? 'featured-topic ring-1 ring-[#FF6B00]/30' : ''}`}
                onMouseEnter={() => setHoveredTopic(topico.id)}
                onMouseLeave={() => setHoveredTopic(null)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg transform transition-all duration-300" 
                        style={{ 
                          backgroundColor: topico.cor,
                          boxShadow: hoveredTopic === topico.id ? `0 0 20px ${topico.cor}80` : 'none',
                        }}>
                        <span className="text-xl">{topico.icone}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-white/90">{topico.nome}</h3>
                        {topico.novoConteudo && (
                          <Badge className="bg-[#FF6B00] text-white text-[10px] px-1.5 py-0 h-4">
                            NOVO
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 text-white/60 text-xs">
                         
                          <span>{topico.gruposAtivos} grupos</span>
                        </div>
                        {topico.tendencia === "alta" && (
                          <div className="flex items-center gap-1 text-emerald-400 text-xs">
                            
                            <span>Em alta</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full p-0 text-white/70 hover:text-white hover:bg-white/10">
                   
                  </Button>
                </div>

                {hoveredTopic === topico.id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-white/10"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white text-xs h-7 rounded-lg">
                      
                         Entrar
                      </Button>
                      <Button size="sm" variant="outline" className="border-white/20 text-white/70 hover:text-white hover:bg-white/10 text-xs h-7 rounded-lg">
                     
                         Detalhes
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        );
      case "recomendacoes-ia":
        return (
          <div className="bg-gradient-to-br from-[#1a1e2a] to-[#141824] dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl mt-6 shadow-xl border border-[#FF6B00]/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center">
               
                Recomendações Personalizadas
              </h3>
              <Badge className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white py-1 h-6">
                IA Premium
              </Badge>
            </div>

            <p className="text-white/60 text-sm mb-6">
              Nossa IA analisou seu perfil e encontrou estes grupos perfeitos para seu estilo de aprendizado:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
              {topicosFilterados.slice(0, 3).map((topico, index) => (
                <motion.div 
                  key={topico.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                  className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-4 rounded-xl border border-[#FF6B00]/20 shadow-lg hover:border-[#FF6B00]/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: topico.cor }}>
                        <span className="text-xl">{topico.icone}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{topico.nome}</h3>
                      <div className="flex items-center mt-2">
                        <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.floor(Math.random() * 20) + 80}%` }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                            className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40]"
                          ></motion.div>
                        </div>
                        <span className="text-xs text-[#FF8C40] ml-2 whitespace-nowrap">Match alto</span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-3 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF6B00]/90 hover:to-[#FF8C40]/90 text-white rounded-lg">
                    
                     Participar
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        );
      case "estatisticas":
        return (
          <div className="bg-gradient-to-br from-[#1a1e2a] to-[#141824] p-6 rounded-2xl shadow-xl mt-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
             
              Análise de Participação
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-[#2d1f08] to-[#1a1305] p-4 rounded-xl border border-[#FF6B00]/20"
              >
                <h4 className="text-[#FF8C40] text-sm font-medium">Total de Grupos</h4>
                <p className="text-3xl font-bold text-white mt-1">24</p>
                <div className="flex items-center mt-1 text-white/60 text-xs">
                 
                  <span className="text-emerald-400">+8%</span>
                  <span className="ml-1">este mês</span>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-[#0d2338] to-[#071525] p-4 rounded-xl border border-blue-500/20"
              >
                <h4 className="text-blue-400 text-sm font-medium">Participações</h4>
                <p className="text-3xl font-bold text-white mt-1">186</p>
                <div className="flex items-center mt-1 text-white/60 text-xs">
                 
                  <span className="text-emerald-400">+12%</span>
                  <span className="ml-1">este mês</span>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-[#0f2823] to-[#081916] p-4 rounded-xl border border-emerald-500/20"
              >
                <h4 className="text-emerald-400 text-sm font-medium">Contribuições</h4>
                <p className="text-3xl font-bold text-white mt-1">53</p>
                <div className="flex items-center mt-1 text-white/60 text-xs">
                 
                  <span className="text-emerald-400">+18%</span>
                  <span className="ml-1">este mês</span>
                </div>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="h-56 w-full bg-gray-900 rounded-xl flex items-center justify-center border border-white/10 backdrop-blur-sm"
            >
              <div className="text-center">
                <p className="text-white/40 text-sm">Análise detalhada em desenvolvimento</p>
                <Button variant="ghost" className="mt-2 text-[#FF6B00] hover:text-[#FF8C40] hover:bg-[#FF6B00]/10">
                 
                   Ativar preview
                </Button>
              </div>
            </motion.div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Container principal com gradiente de fundo */}
      

      {/* Tópicos de estudo - exibido apenas quando "Meus Grupos" está selecionado */}
      {interfaceAtiva === "meus-grupos" && (
        <div className="w-full">
        {/* Cabeçalho da seção */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-orange-500 text-xl">📚</span>
            <h2 className="text-xl font-semibold">Tópicos de Estudo</h2>
          </div>

          {selectedTopic ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-orange-500 text-white">
                {topicosEstudo.find(t => t.id === selectedTopic)?.nome} selecionado
              </Badge>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900" onClick={() => setSelectedTopic(null)}>
                Limpar filtro
              </Button>
            </div>
          ) : (
            <Button variant="link" className="text-sm flex items-center gap-1">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Container dos tópicos */}
        <div className="relative">
          {/* Botão de scroll esquerdo */}
          {showLeftButton && (
            <Button
              id="scroll-left-btn"
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md"
              onClick={() => scrollContainer('left')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}

          {/* Container com rolagem horizontal */}
          <div 
            ref={containerRef}
            id="topicos-container"
            className="topic-carousel-container flex overflow-x-auto py-2 px-1 pb-3 gap-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent scroll-smooth"
            style={{
              msOverflowStyle: 'none', // IE and Edge
              scrollbarWidth: 'none', // Firefox
              maxWidth: '100%',
            }}
          >
            {topicosFilterados.map((topico) => (
              <div
                key={topico.id}
                className={cn(
                  "flex-shrink-0 transition-all duration-300",
                  "w-[130px] h-[120px] rounded-xl cursor-pointer shadow-sm",
                  hoveredTopic === topico.id ? "scale-105" : "scale-100",
                  selectedTopic === topico.id ? "ring-2 ring-offset-2 ring-orange-500" : ""
                )}
                style={{ 
                  backgroundColor: `${topico.cor}15`, 
                  borderColor: topico.cor,
                  scroll: 'snap-align-start'
                }}
                onMouseEnter={() => setHoveredTopic(topico.id)}
                onMouseLeave={() => setHoveredTopic(null)}
                onClick={() => handleTopicSelect(topico.id)}
              >
                <div className="flex flex-col items-center justify-center h-full p-3 text-center relative">
                  {/* Ícone de destaque */}
                  {isTopicFeatured(topico) && (
                    <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-0.5 text-white">
                      <Sparkles className="h-3 w-3" />
                    </div>
                  )}

                  {/* Conteúdo do card */}
                  <div
                    className="w-10 h-10 flex items-center justify-center rounded-full mb-2"
                    style={{ backgroundColor: topico.cor }}
                  >
                    <span className="text-xl">{topico.icone}</span>
                  </div>

                  <h3 className="font-medium text-sm">{topico.nome}</h3>

                  <div className="mt-1 text-xs text-gray-500">
                    {topico.gruposAtivos} grupos ativos
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botão de scroll direito */}
          {showRightButton && (
            <Button
              id="scroll-right-btn"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md"
              onClick={() => scrollContainer('right')}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      )}

      {/* Conteúdo da interface selecionada */}
      
        
          {renderConteudoInterface()}
        
      
    </div>
  );
};

export default TopicosEstudoView;