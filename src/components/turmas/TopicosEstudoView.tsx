
import React, { useState, useEffect } from "react";
import { Search, Filter, Sparkles, BookOpen, Users, TrendingUp, ChevronRight, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TopicosEstudoViewProps {
  className?: string;
}

// Dados dos tópicos de estudo
const topicosEstudo = [
  { id: 1, nome: "Matématica", icon: "📊", cor: "#FF6B00", grupos: 8, tendencia: "alta", novoConteudo: true },
  { id: 2, nome: "Lingua Portuguesa", icon: "📝", cor: "#9333EA", grupos: 9, tendencia: "estável", novoConteudo: true },
  { id: 3, nome: "Física", icon: "⚛️", cor: "#4F46E5", grupos: 6, tendencia: "alta", novoConteudo: false },
  { id: 4, nome: "Química", icon: "🧪", cor: "#10B981", grupos: 5, tendencia: "alta", novoConteudo: true },
  { id: 5, nome: "Biologia", icon: "🌿", cor: "#16A34A", grupos: 7, tendencia: "estável", novoConteudo: false },
  { id: 6, nome: "Geografia", icon: "🌎", cor: "#3B82F6", grupos: 6, tendencia: "baixa", novoConteudo: false },
  { id: 7, nome: "História", icon: "🏛️", cor: "#F59E0B", grupos: 7, tendencia: "estável", novoConteudo: true },
  { id: 8, nome: "Filosofia", icon: "🧠", cor: "#8B5CF6", grupos: 4, tendencia: "baixa", novoConteudo: false },
  { id: 9, nome: "Sociologia", icon: "👥", cor: "#EC4899", grupos: 5, tendencia: "alta", novoConteudo: false },
  { id: 10, nome: "Inglês", icon: "🌐", cor: "#0EA5E9", grupos: 8, tendencia: "alta", novoConteudo: true },
  { id: 11, nome: "Computação", icon: "💻", cor: "#6366F1", grupos: 10, tendencia: "alta", novoConteudo: true },
  { id: 12, nome: "Leitura", icon: "📚", cor: "#14B8A6", grupos: 6, tendencia: "estável", novoConteudo: false },
  { id: 13, nome: "Projetos", icon: "🔧", cor: "#F97316", grupos: 9, tendencia: "alta", novoConteudo: true },
  { id: 14, nome: "Outros", icon: "🔍", cor: "#64748B", grupos: 3, tendencia: "baixa", novoConteudo: false },
];

// Tipos de interfaces disponíveis
type InterfaceType = "meus-grupos" | "recomendacoes-ia" | "estatisticas";

const TopicosEstudoView: React.FC<TopicosEstudoViewProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [interfaceAtiva, setInterfaceAtiva] = useState<InterfaceType>("meus-grupos");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [hoveredTopic, setHoveredTopic] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);

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

  // Efeito de brilho para os tópicos em destaque
  useEffect(() => {
    const interval = setInterval(() => {
      // Adicionar efeito pulsante ao redor dos tópicos em destaque
      const featuredElements = document.querySelectorAll('.featured-topic');
      featuredElements.forEach(el => {
        el.classList.add('pulse-effect');
        setTimeout(() => el.classList.remove('pulse-effect'), 1000);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

    // Função para verificar a posição de rolagem e mostrar/ocultar os botões
    const checkScrollPosition = () => {
      const container = document.getElementById('topicos-container');
      const scrollLeftBtn = document.getElementById('scroll-left-btn');
      const scrollRightBtn = document.getElementById('scroll-right-btn');

      if (container && scrollLeftBtn && scrollRightBtn) {
        const maxScrollLeft = container.scrollWidth - container.clientWidth;

        // Calcular se existem mais de 8 cards no total para mostrar botão direito
        const hasMoreThanEightCards = topicosEstudo.length > 8;

        // Mostra o botão esquerdo se a rolagem for maior que zero
        if (container.scrollLeft > 10) { // Usando 10px como threshold para evitar bugs visuais
          scrollLeftBtn.classList.remove('opacity-0', 'pointer-events-none');
        } else {
          scrollLeftBtn.classList.add('opacity-0', 'pointer-events-none');
        }

        // Mostra o botão direito se ainda houver conteúdo para rolar
        if (container.scrollLeft < maxScrollLeft - 10 && hasMoreThanEightCards) {
          scrollRightBtn.classList.remove('opacity-0', 'pointer-events-none');
        } else {
          scrollRightBtn.classList.add('opacity-0', 'pointer-events-none');
        }

        // Inicializa a verificação na carga da página
        if (maxScrollLeft <= 0 || !hasMoreThanEightCards) {
          scrollRightBtn.classList.add('opacity-0', 'pointer-events-none');
        }
      }
    };

    // Verificar posição na montagem do componente
    useEffect(() => {
      setTimeout(() => checkScrollPosition(), 500);
    }, []);

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
                        <span className="text-xl">{topico.icon}</span>
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
                          <Users className="h-3 w-3" />
                          <span>{topico.grupos} grupos</span>
                        </div>
                        {topico.tendencia === "alta" && (
                          <div className="flex items-center gap-1 text-emerald-400 text-xs">
                            <TrendingUp className="h-3 w-3" />
                            <span>Em alta</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full p-0 text-white/70 hover:text-white hover:bg-white/10">
                    <ChevronRight className="h-5 w-5" />
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
                        <Users className="h-3 w-3 mr-1" /> Entrar
                      </Button>
                      <Button size="sm" variant="outline" className="border-white/20 text-white/70 hover:text-white hover:bg-white/10 text-xs h-7 rounded-lg">
                        <BookOpen className="h-3 w-3 mr-1" /> Detalhes
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
                <Sparkles className="h-5 w-5 mr-2 text-[#FF6B00]" />
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
                        <span className="text-xl">{topico.icon}</span>
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
                    <Users className="h-3 w-3 mr-2" /> Participar
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
              <TrendingUp className="h-5 w-5 mr-2 text-[#FF6B00]" />
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
                  <TrendingUp className="h-3 w-3 mr-1 text-emerald-400" />
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
                  <TrendingUp className="h-3 w-3 mr-1 text-emerald-400" />
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
                  <TrendingUp className="h-3 w-3 mr-1 text-emerald-400" />
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
                  <Sparkles className="h-4 w-4 mr-2" /> Ativar preview
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
    <div className={`w-full space-y-8 ${className}`}>
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden border border-white/5">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Grupos de Estudo
                </h2>
                <p className="text-white/60 text-sm">Conecte-se e aprenda com seus colegas</p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white">
              Criar Grupo
            </Button>
          </div>
        </div>

        <div className="bg-gray-900/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 border-t border-white/5">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-1 mb-3 lg:mb-0">
                <Button
                  variant={interfaceAtiva === "meus-grupos" ? "default" : "ghost"}
                  className={`h-9 rounded-lg ${interfaceAtiva === "meus-grupos" ? "bg-[#FF6B00] text-white" : "text-white/70"}`}
                  onClick={() => setInterfaceAtiva("meus-grupos")}
                >
                  Meus Grupos
                </Button>
                <Button
                  variant={interfaceAtiva === "recomendacoes-ia" ? "default" : "ghost"}
                  className={`h-9 rounded-lg ${interfaceAtiva === "recomendacoes-ia" ? "bg-[#FF6B00] text-white" : "text-white/70"}`}
                  onClick={() => setInterfaceAtiva("recomendacoes-ia")}
                >
                  IA Recomenda
                </Button>
                <Button
                  variant={interfaceAtiva === "estatisticas" ? "default" : "ghost"}
                  className={`h-9 rounded-lg ${interfaceAtiva === "estatisticas" ? "bg-[#FF6B00] text-white" : "text-white/70"}`}
                  onClick={() => setInterfaceAtiva("estatisticas")}
                >
                  Estatísticas
                </Button>
              </div>
            </div>

              <div className="w-full lg:max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    placeholder="Buscar por grupos ou temas específicos..."
                    className="bg-gray-800/50 border-white/10 text-white pl-9 focus-visible:ring-[#FF6B00]/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 rounded-full ${selectedFilter === "tendencia-alta" ? "bg-white/10 text-[#FF6B00]" : "text-white/40"}`}
                      onClick={() => setSelectedFilter(selectedFilter === "tendencia-alta" ? null : "tendencia-alta")}
                    >
                      <TrendingUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 rounded-full ${selectedFilter === "novo-conteudo" ? "bg-white/10 text-[#FF6B00]" : "text-white/40"}`}
                      onClick={() => setSelectedFilter(selectedFilter === "novo-conteudo" ? null : "novo-conteudo")}
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
          </div>
        </div>

        <div className="p-6">
          {interfaceAtiva === "meus-grupos" && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-[#FF6B00]/10 rounded-lg p-1.5">
                    <BookOpen className="h-5 w-5 text-[#FF6B00]" />
                  </div>
                  <h3 className="font-semibold text-white">
                    Tópicos de Estudo
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {selectedTopic && (
                    <span className="text-white/60 mr-2">
                      {topicosEstudo.find(t => t.id === selectedTopic)?.nome} selecionado
                    </span>
                  )}
                  <Button variant="link" className="text-[#FF6B00] p-0 h-auto">Ver todos <ChevronRight className="h-3 w-3 ml-1" /></Button>
                </div>
              </div>

              <div className="relative">
                <Button
                  id="scroll-left-btn"
                  variant="ghost"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/5 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-200"
                  onClick={() => {
                    const container = document.getElementById('topicos-container');
                    if (container) {
                      container.scrollLeft -= 200;
                      checkScrollPosition();
                    }
                  }}
                >
                  <ChevronRight className="h-4 w-4 text-white rotate-180" />
                </Button>

                <div
                  id="topicos-container"
                  className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 px-1 hide-scrollbar"
                  onScroll={checkScrollPosition}
                >
                  {topicosEstudo.map((topico) => (
                  <motion.div
                    key={topico.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: topico.id * 0.03 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className={`min-w-[180px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-white/5 p-3 cursor-pointer transition-all duration-300 
                      ${selectedTopic === topico.id ? 'ring-2 ring-[#FF6B00]' : 'hover:border-white/20'}
                      ${isTopicFeatured(topico) ? 'featured-topic ring-1 ring-[#FF6B00]/20' : ''}`}
                    onClick={() => setSelectedTopic(selectedTopic === topico.id ? null : topico.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div 
                          className="h-10 w-10 rounded-lg flex items-center justify-center text-white shadow-lg" 
                          style={{ backgroundColor: topico.cor }}
                        >
                          <span className="text-lg">{topico.icon}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-white text-sm">{topico.nome}</h4>
                        {topico.novoConteudo && (
                          <Badge className="bg-[#FF6B00] text-white text-[10px] px-1 py-0 h-4">
                            NOVO
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-white/60 text-xs">
                          <Users className="h-3 w-3" />
                          <span>{topico.grupos}</span>
                        </div>
                        {topico.tendencia === "alta" && (
                          <div className="flex items-center gap-1 text-emerald-400 text-xs">
                            <TrendingUp className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                </div>
                
                <Button
                  id="scroll-right-btn"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/5 backdrop-blur-sm transition-opacity duration-200"
                  onClick={() => {
                    const container = document.getElementById('topicos-container');
                    if (container) {
                      container.scrollLeft += 200;
                      checkScrollPosition();
                    }
                  }}
                >
                  <ChevronRight className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="w-full">
              {renderConteudoInterface()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicosEstudoView;
