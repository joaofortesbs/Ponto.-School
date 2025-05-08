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
  { id: 1, nome: "Matemática", icon: "📊", cor: "#FF6B00", grupos: 8, tendencia: "alta", novoConteudo: true },
  { id: 2, nome: "Física", icon: "⚛️", cor: "#4F46E5", grupos: 9, tendencia: "estável", novoConteudo: false },
  { id: 3, nome: "Química", icon: "🧪", cor: "#10B981", grupos: 5, tendencia: "alta", novoConteudo: true },
  { id: 4, nome: "Literatura", icon: "📚", cor: "#9333EA", grupos: 4, tendencia: "baixa", novoConteudo: false },
  { id: 5, nome: "Biologia", icon: "🌿", cor: "#16A34A", grupos: 7, tendencia: "alta", novoConteudo: false },
  { id: 6, nome: "Ciências", icon: "🔬", cor: "#0EA5E9", grupos: 6, tendencia: "estável", novoConteudo: true },
  { id: 7, nome: "Computação", icon: "💻", cor: "#6366F1", grupos: 10, tendencia: "alta", novoConteudo: true },
  { id: 8, nome: "Geografia", icon: "🌎", cor: "#3B82F6", grupos: 6, tendencia: "baixa", novoConteudo: false },
  { id: 9, nome: "Engenharia", icon: "🛠️", cor: "#F59E0B", grupos: 9, tendencia: "alta", novoConteudo: true },
];

// Tipos de interfaces disponíveis
type InterfaceType = "meus-grupos" | "recomendacoes-ia" | "estatisticas";

const TopicosEstudoView: React.FC<TopicosEstudoViewProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [interfaceAtiva, setInterfaceAtiva] = useState<InterfaceType>("meus-grupos");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [hoveredTopic, setHoveredTopic] = useState<number | null>(null);

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
    <div className={`w-full ${className}`}>
      {/* Container principal com gradiente de fundo */}
      <div className="rounded-2xl bg-gradient-to-br from-[#070e1a] to-[#0c121f] shadow-xl border border-white/5 overflow-hidden">
        {/* Cabeçalho com título e subtítulo */}
        <div className="p-5 border-b border-white/5 bg-black/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF6B00]/20">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Grupos de Estudo
                </h2>
                <p className="text-sm text-white/60">
                  Conecte-se e aprenda com seus colegas
                </p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF6B00]/90 hover:to-[#FF8C40]/90 text-white rounded-xl shadow-lg shadow-[#FF6B00]/20">
              <Plus className="h-4 w-4 mr-1" /> Criar Grupo
            </Button>
          </div>
        </div>

        <div className="p-5">
          {/* Seletor de interface e barra de pesquisa alinhados */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Seletor de interface compacto */}
            <div className="flex bg-black/30 p-0.5 rounded-lg shadow-inner border border-white/5 min-w-[280px] max-w-[280px]">
              <button
                onClick={() => setInterfaceAtiva("meus-grupos")}
                className={`flex-1 py-1.5 px-4 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                  interfaceAtiva === "meus-grupos"
                    ? "bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white shadow-sm"
                    : "text-white/70 hover:bg-white/5"
                }`}
              >
                <Users className="h-3 w-3 mr-1" /> Meus Grupos
              </button>
              <button
                onClick={() => setInterfaceAtiva("recomendacoes-ia")}
                className={`flex-1 py-1.5 px-4 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                  interfaceAtiva === "recomendacoes-ia"
                    ? "bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white shadow-sm"
                    : "text-white/70 hover:bg-white/5"
                }`}
              >
                <Sparkles className="h-3 w-3 mr-1" /> IA Recomenda
              </button>
              <button
                onClick={() => setInterfaceAtiva("estatisticas")}
                className={`flex-1 py-1.5 px-4 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                  interfaceAtiva === "estatisticas"
                    ? "bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white shadow-sm"
                    : "text-white/70 hover:bg-white/5"
                }`}
              >
                <TrendingUp className="h-3 w-3 mr-1" /> Estatísticas
              </button>
            </div>

            {/* Barra de pesquisa sofisticada */}
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-white/40 group-focus-within:text-[#FF6B00] transition-colors" />
              </div>
              <Input
                type="text"
                placeholder="Buscar por grupos ou temas específicos..."
                className="pl-10 pr-20 py-2 bg-black/30 border-white/5 hover:border-white/10 focus:border-[#FF6B00]/50 focus:ring-[#FF6B00]/10 h-10 rounded-lg w-full text-white shadow-inner text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-md bg-black/30 hover:bg-[#FF6B00]/20 text-white/70 hover:text-white"
                  onClick={() => setSelectedFilter(selectedFilter === "tendencia-alta" ? null : "tendencia-alta")}
                >
                  <TrendingUp className={`h-4 w-4 ${selectedFilter === "tendencia-alta" ? "text-[#FF6B00]" : ""}`} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-md bg-black/30 hover:bg-[#FF6B00]/20 text-white/70 hover:text-white"
                  onClick={() => setSelectedFilter(selectedFilter === "novo-conteudo" ? null : "novo-conteudo")}
                >
                  <Sparkles className={`h-4 w-4 ${selectedFilter === "novo-conteudo" ? "text-[#FF6B00]" : ""}`} />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md bg-black/30 hover:bg-[#FF6B00]/20 text-white/70 hover:text-white">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tópicos de estudo - exibido apenas quando "Meus Grupos" está selecionado */}
          {interfaceAtiva === "meus-grupos" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center shadow-lg shadow-[#FF6B00]/10">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Tópicos de Estudo
                  </h3>
                </div>
                <Button variant="outline" size="sm" className="text-white/80 border-white/10 hover:border-white/20 hover:bg-white/5 rounded-lg text-xs">
                  Ver todos <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {topicosEstudo.map((topico) => (
                  <motion.div
                    key={topico.id}
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: `0 0 20px ${topico.cor}40`,
                      borderColor: `${topico.cor}80`
                    }}
                    className={`bg-gradient-to-b from-black/60 to-black/30 backdrop-blur-sm rounded-xl overflow-hidden cursor-pointer border border-white/5 transition-all duration-300 relative h-full flex flex-col
                      ${isTopicFeatured(topico) ? 'featured-topic' : ''}`}
                  >
                    <div
                      className="w-full h-24 flex flex-col justify-end p-3 relative overflow-hidden"
                    >
                      {/* Fundo com gradiente baseado na cor do tópico */}
                      <div 
                        className="absolute inset-0 opacity-20 z-0"
                        style={{ 
                          background: `radial-gradient(circle at center, ${topico.cor} 0%, transparent 70%)`,
                        }}
                      />

                      {/* Pequeno indicador de novidade no canto */}
                      {topico.novoConteudo && (
                        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#FF6B00] animate-pulse"></div>
                      )}

                      <div className="relative z-10">
                        <div className="text-white text-2xl mb-2" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{topico.icon}</div>
                        <h4 className="text-white font-semibold text-sm">{topico.nome}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="text-white/70 text-xs flex items-center">
                            <Users className="h-3 w-3 mr-0.5" />
                            {topico.grupos}
                          </div>
                          {topico.tendencia === "alta" && (
                            <TrendingUp className="h-3 w-3 text-emerald-400 ml-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Conteúdo da interface selecionada */}
          <AnimatePresence mode="wait">
            <motion.div
              key={interfaceAtiva}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderConteudoInterface()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TopicosEstudoView;