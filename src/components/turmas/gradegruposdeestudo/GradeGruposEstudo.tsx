import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ChevronRight, Users, TrendingUp, BookOpen, MessageCircle, Plus, UserPlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CreateGroupModalEnhanced from "../CreateGroupModalEnhanced";
import { supabase } from "@/lib/supabase";
import { useRouter } from "@/lib/useRouter";

interface GrupoEstudo {
  id: string;
  nome: string;
  icon?: string;
  cor: string;
  membros: number;
  topico?: string;
  disciplina?: string;
  tendencia?: string;
  novoConteudo?: boolean;
  criador?: string;
  dataCriacao: string;
}

interface GradeGruposEstudoProps {
  selectedTopic: number | null;
  topicosEstudo: any[]; // Mantido para compatibilidade
  searchQuery?: string;
  selectedFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
}

const GradeGruposEstudo: React.FC<GradeGruposEstudoProps> = ({ 
  selectedTopic, 
  topicosEstudo,
  searchQuery = "",
  selectedFilter = null,
  onFilterChange
}) => {
  const [hoveredGrupo, setHoveredGrupo] = useState<string | null>(null);
  const [internalSelectedFilter, setInternalSelectedFilter] = useState<string | null>(selectedFilter);
  const [gruposEstudo, setGruposEstudo] = useState<GrupoEstudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  // Sincronizar o filtro externo com o interno
  useEffect(() => {
    setInternalSelectedFilter(selectedFilter);
  }, [selectedFilter]);

  // Função para atualizar o filtro localmente e propagar a mudança
  const updateFilter = (filter: string | null) => {
    setInternalSelectedFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  // Carregar dados do banco de dados
  useEffect(() => {
    const carregarGrupos = async () => {
      try {
        setLoading(true);
        console.log("Carregando grupos com tópico selecionado:", selectedTopic);

        // Buscar grupos do banco de dados
        const { data: grupos, error } = await supabase
          .from('grupos_estudo')
          .select(`
            id, 
            nome, 
            descricao, 
            topico, 
            topico_nome, 
            topico_icon, 
            cor,
            privado,
            visibilidade, 
            criador_id,
            created_at
          `);

        if (error) {
          console.error("Erro ao buscar grupos do banco de dados:", error);
          return;
        }

        if (grupos && grupos.length > 0) {
          console.log("Grupos encontrados no banco de dados:", grupos);

          // Converter dados para o formato esperado pelo componente
          const gruposFormatados = await Promise.all(grupos.map(async (grupo) => {
            // Buscar quantidade de membros para cada grupo
            const { count, error: countError } = await supabase
              .from('grupos_estudo_membros')
              .select('*', { count: 'exact', head: true })
              .eq('grupo_id', grupo.id);

            if (countError) {
              console.error("Erro ao contar membros:", countError);
            }

            // Buscar informações do criador
            const { data: criadorData, error: criadorError } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', grupo.criador_id)
              .single();

            return {
              id: grupo.id,
              nome: grupo.nome,
              cor: grupo.cor || "#FF6B00",
              membros: count || 1,
              topico: grupo.topico?.toString() || "",
              disciplina: grupo.topico_nome || "",
              icon: grupo.topico_icon || "📚",
              tendencia: Math.random() > 0.5 ? "alta" : "estável", // Simulado por enquanto
              novoConteudo: Math.random() > 0.6, // Simulado por enquanto
              dataCriacao: grupo.created_at,
              criador: criadorData?.display_name || "Usuário"
            };
          }));

          setGruposEstudo(gruposFormatados);
        } else {
          console.log("Nenhum grupo encontrado, usando exemplos");

          // Usar dados de exemplo se nenhum grupo for encontrado
          const gruposExemplo = [
            {
              id: "grupo-exemplo-1",
              nome: "Crie seu primeiro grupo!",
              cor: "#FF6B00",
              membros: 0,
              topico: "1",
              disciplina: "Matemática",
              icon: "🚀",
              tendencia: "alta",
              novoConteudo: true,
              dataCriacao: new Date().toISOString(),
              criador: "Sistema"
            }
          ];

          setGruposEstudo(gruposExemplo);
        }
      } catch (error) {
        console.error("Erro ao carregar grupos de estudo:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarGrupos();
  }, [selectedTopic]);

  // Filtrar grupos baseado no tópico selecionado e busca
  const gruposFiltrados = gruposEstudo.filter((grupo) => {
    // Verificação de correspondência com a busca
    const matchesSearch = grupo.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (grupo.disciplina?.toLowerCase().includes(searchQuery.toLowerCase()) || false);

    // Verificação de correspondência com o filtro
    const currentFilter = internalSelectedFilter;
    const matchesFilter = !currentFilter ||
      (currentFilter === "tendencia-alta" && grupo.tendencia === "alta") ||
      (currentFilter === "novo-conteudo" && grupo.novoConteudo);

    // Lógica aprimorada de filtragem por tópico
    const selectedTopicName = selectedTopic && topicosEstudo.find(t => t.id === selectedTopic)?.nome.toLowerCase();

    // Verificação mais precisa:
    // 1. Se não há tópico selecionado, mostrar todos
    // 2. Verificar se o ID do tópico do grupo corresponde ao selecionado
    // 3. Verificar se o nome da disciplina do grupo corresponde ao nome do tópico selecionado
    const matchesSelectedTopic = !selectedTopic || 
      (grupo.topico !== undefined && String(selectedTopic) === String(grupo.topico)) ||
      (grupo.disciplina && selectedTopicName && grupo.disciplina.toLowerCase() === selectedTopicName);

    // Log para depuração
    if (selectedTopic && grupo.topico) {
      console.log(`Comparando tópico do grupo: ${grupo.topico} (${typeof grupo.topico}) com selectedTopic: ${selectedTopic} (${typeof selectedTopic})`);
    }

    return matchesSearch && matchesFilter && matchesSelectedTopic;
  });

  // Detectar grupos em destaque (com tendência alta e novo conteúdo)
  const isGrupoFeatured = (grupo: GrupoEstudo) => {
    return grupo.tendencia === "alta" && grupo.novoConteudo === true;
  };

  // Modal para criar novo grupo
  const abrirModalCriarGrupo = () => {
    setShowCreateGroupModal(true);
  };

  const router = useRouter();

  // Função para processar a criação de um novo grupo
  const handleCreateGroup = (formData: any) => {
    try {
      console.log("Novo grupo criado:", formData);

      if (!formData || !formData.nome) {
        console.error("Dados do grupo inválidos");
        return;
      }

      // Adicionar o novo grupo à lista
      const novoGrupo: GrupoEstudo = {
        id: formData.id || `temp-${Date.now()}`,
        nome: formData.nome,
        membros: formData.amigosDetalhes ? formData.amigosDetalhes.length + 1 : 1,
        topico: formData.topico ? formData.topico.toString() : "",
        disciplina: formData.topicoNome || "Geral",
        cor: formData.cor || "#FF6B00",
        icon: formData.topicoIcon || "📚",
        tendencia: "estável",
        novoConteudo: false,
        criador: "você",
        dataCriacao: new Date().toISOString()
      };

      setGruposEstudo(prev => [novoGrupo, ...prev]);
      setShowCreateGroupModal(false);

      // Exibir feedback de sucesso
      alert("Grupo criado com sucesso!");
      
      // Atualizar a visualização
      setTimeout(() => {
        console.log("Atualizando lista de grupos...");
      }, 500);
      
    } catch (error) {
      console.error("Erro ao processar criação do grupo:", error);
      alert("Erro ao criar grupo: " + (error instanceof Error ? error.message : "Erro desconhecido"));
    }
  };

  return (
    <div className="mt-8">
      {/* Modal de criação de grupo */}
      <CreateGroupModalEnhanced 
        isOpen={showCreateGroupModal} 
        onClose={() => setShowCreateGroupModal(false)}
        onSubmit={handleCreateGroup}
      />
      {/* Cabeçalho da grade */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Users className="h-5 w-5 mr-2 text-[#FF6B00]" />
              Grupos de Estudo
            </h2>
            <Badge className="ml-3 bg-[#FF6B00]/20 text-[#FF6B00] text-xs">
              {gruposFiltrados.length} grupos
            </Badge>
          </div>

          {/* Indicadores de filtros ativos */}
          {(selectedTopic || internalSelectedFilter) && (
            <div className="flex gap-2 mt-2">
              {selectedTopic && (
                <Badge className="bg-[#FF6B00]/30 text-white text-xs flex items-center gap-1 px-3 py-1">
                  <BookOpen className="h-3 w-3" />
                  Tópico: {topicosEstudo.find(t => t.id === selectedTopic)?.nome}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Aqui não usamos updateFilter porque esse filtro é controlado pelo componente pai
                    }}
                    className="ml-2 text-white/70 hover:text-white"
                  >
                  </button>
                </Badge>
              )}
              {internalSelectedFilter && (
                <Badge className="bg-[#FF6B00]/30 text-white text-xs flex items-center gap-1 px-3 py-1">
                  {internalSelectedFilter === "tendencia-alta" ? (
                    <>
                      <TrendingUp className="h-3 w-3" />
                      Em alta
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      Novo conteúdo
                    </>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      updateFilter(null);
                    }}
                    className="ml-2 text-white/70 hover:text-white"
                  >
                    &times;
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
        <Button 
          onClick={abrirModalCriarGrupo}
          className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF6B00]/90 hover:to-[#FF8C40]/90 text-white text-sm rounded-xl shadow-md"
        >
          <Plus className="h-4 w-4 mr-1" /> Criar Grupo
        </Button>
      </div>

      {/* Lista de grupos */}
      {loading ? (
        <div className="col-span-3 flex justify-center items-center py-20">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-[#FF6B00]/20 rounded-full mb-4"></div>
            <div className="h-4 w-32 bg-[#FF6B00]/20 rounded mb-2"></div>
            <div className="h-3 w-40 bg-[#FF6B00]/10 rounded"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {gruposFiltrados.map((grupo) => (
            <motion.div 
              key={grupo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
              className={`bg-gradient-to-br from-gray-900/90 to-gray-800/90 dark:from-gray-800 dark:to-gray-900 
                backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/10 hover:border-[#FF6B00]/30 transition-all duration-300 
                ${isGrupoFeatured(grupo) ? 'featured-topic ring-1 ring-[#FF6B00]/30' : ''}`}
              onMouseEnter={() => setHoveredGrupo(grupo.id)}
              onMouseLeave={() => setHoveredGrupo(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg transform transition-all duration-300" 
                      style={{ 
                        backgroundColor: grupo.cor,
                        boxShadow: hoveredGrupo === grupo.id ? `0 0 20px ${grupo.cor}80` : 'none',
                      }}>
                      <span className="text-xl">{grupo.icon || "📚"}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-white/90">{grupo.nome}</h3>
                      {grupo.novoConteudo && (
                        <Badge className="bg-[#FF6B00] text-white text-[10px] px-1.5 py-0 h-4">
                          NOVO
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-white/60 text-xs">
                        <Users className="h-3 w-3" />
                        <span>{grupo.membros} membros</span>
                      </div>
                      {grupo.tendencia === "alta" && (
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
            </motion.div>
          ))}

          {/* Card de criação quando não há grupos */}
          {gruposFiltrados.length === 0 && !loading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="col-span-3 text-center py-12 bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-[#FF6B00]/20 cursor-pointer transition-all"
              onClick={abrirModalCriarGrupo}
            >
              <div className="bg-gradient-to-br from-[#FF6B00]/20 to-[#FF8C40]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-10 w-10 text-[#FF6B00]" />
              </div>
              <h3 className="text-white/90 text-xl font-medium mb-2">Crie seu primeiro grupo de estudos</h3>
              <p className="text-white/60 max-w-md mx-auto mb-4">
                Conecte-se com colegas, compartilhe conhecimento e evolua em seus estudos criando seu próprio grupo
              </p>
              <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF6B00]/90 hover:to-[#FF8C40]/90 text-white rounded-xl shadow-lg">
                <Plus className="h-4 w-4 mr-2" /> Criar Grupo de Estudos
              </Button>
            </motion.div>
          )}

          {gruposFiltrados.length === 0 && searchQuery && !loading && (
            <div className="col-span-3 text-center py-8 bg-black/20 rounded-xl border border-white/5">
              <MessageCircle className="h-10 w-10 mx-auto text-white/30 mb-2" />
              <h3 className="text-white/80 text-lg font-medium">Nenhum grupo encontrado</h3>
              <p className="text-white/50 mt-1 mb-4">Não encontramos grupos com os critérios de busca utilizados</p>
              <Button 
                onClick={abrirModalCriarGrupo}
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:opacity-90 text-white rounded-lg"
              >
                <Plus className="h-4 w-4 mr-2" /> Criar Novo Grupo
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GradeGruposEstudo;