
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
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  interfaceAtiva === "meus-grupos"
                    ? "bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white shadow-sm"
                    : "text-white/70 hover:bg-white/5"
                }`}
              >
                <Users className="h-3 w-3 mr-1" /> Meus Grupos
              </button>
              <button
                onClick={() => setInterfaceAtiva("recomendacoes-ia")}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  interfaceAtiva === "recomendacoes-ia"
                    ? "bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white shadow-sm"
                    : "text-white/70 hover:bg-white/5"
                }`}
              >
                <Sparkles className="h-3 w-3 mr-1" /> IA Recomenda
              </button>
              <button
                onClick={() => setInterfaceAtiva("estatisticas")}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1 ${
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
                <div className="flex items-center gap-2">
                {selectedTopic && (
                  <Badge className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white">
                    {topicosEstudo.find(t => t.id === selectedTopic)?.nome} selecionado
                  </Badge>
                )}
                <Button variant="outline" size="sm" className="text-white/80 border-white/10 hover:border-white/20 hover:bg-white/5 rounded-lg text-xs">
                  Ver todos <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4 overflow-x-auto pb-2 hide-scrollbar">
                {topicosEstudo.map((topico) => (
                  <motion.div
                    key={topico.id}
                    initial={{ rotateY: 0 }}
                    whileHover={{ 
                      scale: 1.05,
                      rotateY: 15,
                      z: 20,
                      boxShadow: `0 20px 40px -10px rgba(0, 0, 0, 0.4), 0 10px 20px -5px rgba(0, 0, 0, 0.3), 0 0 25px ${topico.cor}40`
                    }}
                    animate={selectedTopic === topico.id ? {
                      scale: 1.08,
                      rotateY: 10,
                      z: 30,
                      boxShadow: `0 25px 50px -10px rgba(0, 0, 0, 0.5), 0 15px 30px -5px rgba(0, 0, 0, 0.4), 0 0 35px ${topico.cor}60`
                    } : {}}
                    onClick={() => setSelectedTopic(selectedTopic === topico.id ? null : topico.id)}
                    transition={{ 
                      type: "spring", 
                      stiffness: 350,
                      damping: 18
                    }}
                    className={`profile-3d-element bg-gradient-to-b from-[#121620]/90 to-[#0a0d14]/80 backdrop-blur-lg 
                      rounded-xl overflow-hidden cursor-pointer border 
                      transition-all duration-300 relative h-full flex flex-col transform-gpu
                      perspective-1000 shadow-xl
                      ${selectedTopic === topico.id ? 'border-2 border-[#FF6B00] active-topic' : 'border border-white/10'}
                      ${isTopicFeatured(topico) ? 'featured-topic border-[0.5px] border-[#FF6B00]/40' : ''}`}
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <div
                      className="w-full h-32 flex flex-col justify-end p-3 relative overflow-hidden"
                    >
                      {/* Fundo 3D com efeito de vidro e paralaxe */}
                      <div 
                        className="absolute inset-0 z-0"
                        style={{ 
                          background: `radial-gradient(circle at 20% 20%, ${topico.cor}25 0%, transparent 70%), 
                                      linear-gradient(135deg, ${topico.cor}05 0%, transparent 50%)`,
                          transform: "translateZ(-20px) scale(1.1)",
                          filter: "blur(1px)"
                        }}
                      />
                      
                      {/* Efeito de profundidade avançado */}
                      <div className="absolute top-0 left-0 w-full h-full" 
                        style={{ 
                          boxShadow: `inset 0 0 40px rgba(0,0,0,0.5)`,
                          borderRadius: "inherit",
                          background: `radial-gradient(circle at 70% 80%, rgba(255,255,255,0.03) 0%, transparent 50%)`
                        }} 
                      />
                      
                      {/* Partículas flutuantes sutis (somente para tópicos em destaque) */}
                      {isTopicFeatured(topico) && (
                        <>
                          <div className="absolute h-1.5 w-1.5 rounded-full bg-white/20"
                               style={{top: '30%', left: '20%', transform: 'translateZ(5px)', opacity: 0.7,
                                       animation: 'float-particle 4s ease-in-out infinite'}}>
                          </div>
                          <div className="absolute h-1 w-1 rounded-full bg-white/20"
                               style={{top: '45%', left: '70%', transform: 'translateZ(8px)', opacity: 0.5,
                                       animation: 'float-particle 3.5s ease-in-out infinite 0.5s'}}>
                          </div>
                          <div className="absolute h-0.5 w-0.5 rounded-full bg-white/20"
                               style={{top: '65%', left: '40%', transform: 'translateZ(12px)', opacity: 0.4,
                                       animation: 'float-particle 5s ease-in-out infinite 1s'}}>
                          </div>
                        </>
                      )}
                      
                      {/* Indicador de novidade redesenhado */}
                      {topico.novoConteudo && (
                        <div className="absolute top-3 right-3 z-20">
                          <div className="relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-full opacity-75 blur-sm animate-pulse"></div>
                            <div className="h-2 w-2 rounded-full bg-white"></div>
                          </div>
                        </div>
                      )}

                      {/* Grafico hexagonal de fundo para elementos destacados */}
                      {isTopicFeatured(topico) && (
                        <div className="absolute inset-0 z-5 opacity-10"
                             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5.7735C32.094 5.7735 34.1627 6.456 35.7735 7.7735L52.2265 17.7735C55.5206 19.7735 57.2265 23.3726 57.2265 27.2265V47.2265C57.2265 51.0804 55.5206 54.6795 52.2265 56.6795L35.7735 66.6795C34.1627 67.997 32.094 68.6795 30 68.6795C27.906 68.6795 25.8373 67.997 24.2265 66.6795L7.7735 56.6795C4.47944 54.6795 2.7735 51.0804 2.7735 47.2265V27.2265C2.7735 23.3726 4.47944 19.7735 7.7735 17.7735L24.2265 7.7735C25.8373 6.456 27.906 5.7735 30 5.7735Z' fill='none' stroke='%23FFFFFF' stroke-width='0.3'/%3E%3C/svg%3E")`,
                              backgroundSize: '150px 150px',
                              backgroundPosition: 'center',
                              mixBlendMode: 'overlay',
                              transform: 'translateZ(-15px) scale(1.2) rotate(30deg)'
                        }}></div>
                      )}

                      {/* Conteúdo principal com efeito 3D */}
                      <div className="relative z-10" style={{ transform: "translateZ(25px)" }}>
                        {/* Ícone 3D com sombra e reflexo */}
                        <div className="profile-3d-element mb-3 relative flex items-center justify-center"
                             style={{ transform: "translateZ(10px)" }}>
                          <div className="absolute -inset-1 rounded-full bg-gradient-to-b from-white/10 to-transparent opacity-50"
                               style={{ filter: 'blur(2px)', transform: 'translateZ(-2px)' }}></div>
                          <div className="h-12 w-12 rounded-xl flex items-center justify-center relative" 
                               style={{ 
                                 backgroundColor: topico.cor,
                                 boxShadow: `0 10px 15px -5px ${topico.cor}40, 0 0 8px ${topico.cor}30 inset`,
                                 transform: 'translateZ(5px)'
                               }}>
                            {/* Ícones personalizados baseados no nome do tópico */}
                            {topico.nome === "Matemática" && <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>}
                            {topico.nome === "Física" && <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>}
                            {topico.nome === "Química" && <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>}
                            {topico.nome === "Literatura" && <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>}
                            {topico.nome === "Biologia" && <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>}
                            {topico.nome === "Ciências" && <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>}
                            {topico.nome === "Computação" && <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>}
                            {topico.nome === "Geografia" && <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                            {topico.nome === "Engenharia" && <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>}
                          </div>
                        </div>
                        
                        {/* Título do tópico com efeito de destaque */}
                        <h4 className="text-white font-semibold text-sm profile-3d-text"
                            style={{ 
                              textShadow: "0 2px 3px rgba(0,0,0,0.5), 0 0 5px rgba(0,0,0,0.2)",
                            }}>{topico.nome}</h4>
                        
                        {/* Estatísticas com estilo moderno */}
                        <div className="flex items-center gap-1.5 mt-2" style={{ transform: "translateZ(8px)" }}>
                          <div className="text-white/90 text-xs flex items-center bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/5">
                            <Users className="h-3 w-3 mr-1" />
                            {topico.grupos}
                          </div>
                          {topico.tendencia === "alta" && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center">
                              <TrendingUp className="h-3 w-3 text-emerald-400" />
                            </div>
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
