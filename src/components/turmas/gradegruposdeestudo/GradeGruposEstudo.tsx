
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ChevronRight, Users, TrendingUp, BookOpen, MessageCircle, Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CreateGroupModalEnhanced from "../CreateGroupModalEnhanced";
import { supabase } from "@/lib/supabase";

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
  privado?: boolean;
  visibilidade?: string;
  topico_nome?: string;
  topico_icon?: string;
}

interface GradeGruposEstudoProps {
  selectedTopic: number | null;
  topicosEstudo: any[]; // Mantido para compatibilidade
  searchQuery?: string;
}

const GradeGruposEstudo: React.FC<GradeGruposEstudoProps> = ({ 
  selectedTopic, 
  topicosEstudo,
  searchQuery = ""
}) => {
  const [hoveredGrupo, setHoveredGrupo] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [gruposEstudo, setGruposEstudo] = useState<GrupoEstudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  // Carregar grupos do banco de dados
  useEffect(() => {
    const carregarGrupos = async () => {
      try {
        setLoading(true);
        
        // Buscar os grupos do usuário atual do Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data, error } = await supabase
            .from('grupos_estudo')
            .select('*')
            .eq('user_id', session.user.id)
            .order('data_criacao', { ascending: false });
          
          if (error) {
            console.error("Erro ao buscar grupos de estudo:", error);
            return;
          }
          
          console.log("Grupos carregados:", data);
          
          // Converter dados do banco para o formato da interface
          const gruposFormatados: GrupoEstudo[] = data.map((grupo: any) => ({
            id: grupo.id,
            nome: grupo.nome,
            descricao: grupo.descricao,
            cor: grupo.cor,
            membros: grupo.membros || 1,
            topico: grupo.topico,
            disciplina: grupo.topico_nome,
            icon: grupo.topico_icon,
            dataCriacao: grupo.data_criacao,
            tendencia: Math.random() > 0.7 ? "alta" : undefined, // Valor aleatório para demo
            novoConteudo: Math.random() > 0.7, // Valor aleatório para demo
            privado: grupo.privado,
            visibilidade: grupo.visibilidade,
            topico_nome: grupo.topico_nome,
            topico_icon: grupo.topico_icon
          }));
          
          setGruposEstudo(gruposFormatados);
        }
      } catch (error) {
        console.error("Erro ao carregar grupos de estudo:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarGrupos();
  }, [showCreateGroupModal]); // Recarregar quando o modal for fechado

  // Filtrar grupos baseado no tópico selecionado e busca
  const gruposFiltrados = gruposEstudo.filter(
    (grupo) => {
      const matchesSearch = grupo.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (grupo.disciplina?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
      const matchesFilter = !selectedFilter || 
        (selectedFilter === "tendencia-alta" && grupo.tendencia === "alta") ||
        (selectedFilter === "novo-conteudo" && grupo.novoConteudo);
        
      // Melhorada lógica de filtragem por tópico
      const matchesSelectedTopic = !selectedTopic || 
        (grupo.topico && selectedTopic.toString() === grupo.topico);
        
      return matchesSearch && matchesFilter && matchesSelectedTopic;
    }
  );

  // Detectar grupos em destaque (com tendência alta e novo conteúdo)
  const isGrupoFeatured = (grupo: GrupoEstudo) => {
    return grupo.tendencia === "alta" && grupo.novoConteudo === true;
  };

  // Modal para criar novo grupo
  const abrirModalCriarGrupo = () => {
    setShowCreateGroupModal(true);
  };

  // Função para processar a criação de um novo grupo
  const handleCreateGroup = async (formData: any) => {
    try {
      // Verificar se o usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("Usuário não autenticado");
        return;
      }
      
      // Gerar código único para grupos privados
      const codigoGrupo = formData.privado 
        ? `GRP${Math.random().toString(36).substring(2, 8).toUpperCase()}` 
        : null;
      
      // Preparar dados para inserção no banco
      const grupoData = {
        user_id: session.user.id,
        nome: formData.nome,
        descricao: formData.descricao || "",
        cor: formData.cor || "#FF6B00",
        topico: formData.topico || null,
        topico_nome: formData.topicoNome || null,
        topico_icon: formData.topicoIcon || null,
        privado: formData.privado || false,
        visibilidade: formData.visibilidade || "todos",
        membros: formData.amigos ? formData.amigos.length + 1 : 1,
        codigo: codigoGrupo
      };
      
      console.log("Enviando dados para criação de grupo:", grupoData);
      
      // Inserir no banco de dados
      const { data, error } = await supabase
        .from('grupos_estudo')
        .insert(grupoData)
        .select()
        .single();
      
      if (error) {
        console.error("Erro ao criar grupo:", error);
        return;
      }
      
      console.log("Grupo criado com sucesso:", data);
      
      // Converter o grupo criado para o formato da interface
      const novoGrupo: GrupoEstudo = {
        id: data.id,
        nome: data.nome,
        cor: data.cor,
        membros: data.membros,
        dataCriacao: data.data_criacao,
        topico: data.topico,
        disciplina: data.topico_nome,
        icon: data.topico_icon,
        tendencia: Math.random() > 0.7 ? "alta" : undefined, // Valor aleatório para demo
        novoConteudo: false, // Grupo novo não tem conteúdo novo ainda
        privado: data.privado,
        visibilidade: data.visibilidade,
        topico_nome: data.topico_nome,
        topico_icon: data.topico_icon
      };
      
      // Adicionar o novo grupo à lista de grupos
      setGruposEstudo(prev => [novoGrupo, ...prev]);
      setShowCreateGroupModal(false);
      
      // Mostrar feedback visual de sucesso (poderia ser um toast ou notificação)
      // Você pode adicionar um componente de toast ou notificação posteriormente
      
    } catch (error) {
      console.error("Erro ao processar criação de grupo:", error);
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
        <div className="flex items-center">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Users className="h-5 w-5 mr-2 text-[#FF6B00]" />
            Grupos de Estudo
          </h2>
          <Badge className="ml-3 bg-[#FF6B00]/20 text-[#FF6B00] text-xs">
            {gruposFiltrados.length} grupos
          </Badge>
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
