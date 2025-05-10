import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ChevronRight, Users, TrendingUp, BookOpen, MessageCircle, Plus, UserPlus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CreateGroupModalEnhanced from "../CreateGroupModalEnhanced";
import { supabase } from "@/lib/supabase";
import { criarGrupo, sincronizarGruposLocais, obterTodosGrupos, obterGruposLocal, salvarGrupoLocal } from '@/lib/gruposEstudoStorage';

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

  // Carregar grupos do banco de dados e do armazenamento local
  useEffect(() => {
    const carregarGrupos = async () => {
      try {
        setLoading(true);

        // Buscar os grupos do usuário atual do Supabase
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // Primeiro carregamos os grupos locais para exibição rápida
          const gruposLocais = obterGruposLocal().filter(grupo => grupo.user_id === session.user.id);

          // Converter dados locais para o formato da interface
          if (gruposLocais.length > 0) {
            const gruposLocaisFormatados: GrupoEstudo[] = gruposLocais.map((grupo: any) => ({
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

            // Exibir primeiro os grupos locais enquanto carregamos do Supabase
            setGruposEstudo(gruposLocaisFormatados);
          }

          // Tentar buscar do Supabase
          try {
            const { data, error } = await supabase
              .from('grupos_estudo')
              .select('*')
              .eq('user_id', session.user.id)
              .order('data_criacao', { ascending: false });

            if (error) {
              console.error("Erro ao buscar grupos de estudo do Supabase:", error);
              // Continuar com os grupos locais já carregados

              // Tentar sincronizar os grupos locais com o Supabase
              await sincronizarGruposLocais(session.user.id);
            } else {
              console.log("Grupos carregados do Supabase:", data);

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
                novoConteudo: Math.random() > 0.7 ? "alta" : undefined, // Valor aleatório para demo
                privado: grupo.privado,
                visibilidade: grupo.visibilidade,
                topico_nome: grupo.topico_nome,
                topico_icon: grupo.topico_icon
              }));

              // Combinar grupos do Supabase com grupos locais que não estão no Supabase
              const gruposLocaisFiltrados = gruposLocais
                .filter(grupoLocal => grupoLocal.id.startsWith('local_') && 
                  !data.some((grupoRemoto: any) => grupoRemoto.id === grupoLocal.id))
                .map((grupo: any) => ({
                  id: grupo.id,
                  nome: grupo.nome,
                  descricao: grupo.descricao,
                  cor: grupo.cor,
                  membros: grupo.membros || 1,
                  topico: grupo.topico,
                  disciplina: grupo.topico_nome,
                  icon: grupo.topico_icon,
                  dataCriacao: grupo.data_criacao,
                  tendencia: Math.random() > 0.7 ? "alta" : undefined,
                  novoConteudo: Math.random() > 0.7,
                  privado: grupo.privado,
                  visibilidade: grupo.visibilidade,
                  topico_nome: grupo.topico_nome,
                  topico_icon: grupo.topico_icon
                }));

              setGruposEstudo([...gruposFormatados, ...gruposLocaisFiltrados]);
            }
          } catch (supabaseError) {
            console.error("Falha ao usar Supabase:", supabaseError);
            // Já estamos usando os dados locais, então continuar com eles
          }

          // Carregar grupos usando o sistema de armazenamento 
          try {
            const todosGrupos = await obterTodosGrupos(session.user.id);
            console.log("Grupos obtidos do sistema de armazenamento:", todosGrupos);
          } catch (storageError) {
            console.error("Erro ao acessar sistema de armazenamento:", storageError);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar grupos de estudo:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarGrupos();

    // Definir um intervalo para re-sincronização a cada 5 minutos
    const intervaloSincronizacao = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await sincronizarGruposLocais(session.user.id);
        }
      } catch (error) {
        console.error("Erro na sincronização automática:", error);
      }
    }, 300000); // 5 minutos

    // Limpar intervalo quando o componente for desmontado
    return () => clearInterval(intervaloSincronizacao);
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

  // Processar a criação de um novo grupo
  const handleCreateGroup = async (formData: any) => {
    try {
      console.log("Dados do formulário:", formData);

      // Apenas receber o formData - o modal já está salvando o grupo
      console.log("Grupo criado com sucesso:", formData);

      // Atualizar lista de grupos - remover duplicatas verificando por ID ou nome
      const todosGrupos = await obterTodosGrupos();
      
      // Remover duplicatas baseado no nome do grupo
      const gruposFiltrados = todosGrupos.filter((grupo, index, self) => 
        index === self.findIndex((g) => g.nome === grupo.nome)
      );
      
      setGruposEstudo(gruposFiltrados);

      // Fechar modal
      setShowCreateGroupModal(false);
    } catch (error) {
      console.error("Erro ao criar grupo:", error);
      setErro(`Ocorreu um erro desconhecido ao criar o grupo.`);
    }
  };

  // Função auxiliar para aplicar a migração do banco de dados
  const executarMigracaoDoBancoDeDados = async () => {
    try {
      // Verificar se a tabela existe
      const { error: tableCheckError } = await supabase
        .from('grupos_estudo')
        .select('count(*)', { count: 'exact', head: true });

      if (tableCheckError && tableCheckError.code === '42P01') {
        console.log("Tentando criar a tabela grupos_estudo diretamente...");

        // Criar a tabela diretamente usando função SQL
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          throw new Error("Você precisa estar autenticado para criar a tabela");
        }

        // Criar tabela diretamente através de SQL
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS public.grupos_estudo (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            nome TEXT NOT NULL,
            descricao TEXT,
            cor TEXT NOT NULL DEFAULT '#FF6B00',
            membros INTEGER NOT NULL DEFAULT 1,
            topico TEXT,
            topico_nome TEXT,
            topico_icon TEXT,
            privado BOOLEAN DEFAULT false,
            visibilidade TEXT DEFAULT 'todos',
            codigo TEXT,
            data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now()
          );

          -- Create index for faster queries
          CREATE INDEX IF NOT EXISTS grupos_estudo_user_id_idx ON public.grupos_estudo(user_id);

          -- Grant access to authenticated users
          ALTER TABLE public.grupos_estudo ENABLE ROW LEVEL SECURITY;

          CREATE POLICY "Users can view their own grupos_estudo"
            ON public.grupos_estudo FOR SELECT
            USING (auth.uid() = user_id);

          CREATE POLICY "Users can insert their own grupos_estudo"
            ON public.grupos_estudo FOR INSERT
            WITH CHECK (auth.uid() = user_id);

          CREATE POLICY "Users can update their own grupos_estudo"
            ON public.grupos_estudo FOR UPDATE
            USING (auth.uid() = user_id);

          CREATE POLICY "Users can delete their own grupos_estudo"
            ON public.grupos_estudo FOR DELETE
            USING (auth.uid() = user_id);
        `;

        // Execute the SQL as RPC or through the REST API
        try {
          // Tenta através da função execute_sql
          const { error: execError } = await supabase.rpc('execute_sql', {
            sql_query: createTableSQL
          });

          if (execError) {
            console.error("Erro ao criar tabela via RPC:", execError);
            // Será tratado no catch
            throw execError;
          }

          console.log("Tabela grupos_estudo criada com sucesso via RPC");
          return true;
        } catch (sqlError) {
          console.error("Erro ao criar tabela:", sqlError);

          // Informa ao usuário
          window.alert("Não foi possível criar a tabela grupos_estudo automaticamente. Por favor, execute o fluxo de trabalho 'Aplicar Migrações' no menu de workflows para criar a tabela.");

          throw new Error("Falha ao criar tabela grupos_estudo. Execute o fluxo de trabalho 'Aplicar Migrações'.");
        }
      }

      return true; // Tabela já existe ou foi criada com sucesso
    } catch (error) {
      console.error("Erro ao verificar/criar tabela:", error);
      throw error;
    }
  };

  // Função auxiliar para mostrar notificação de sucesso
  const mostrarNotificacaoSucesso = (mensagem: string) => {
    const element = document.createElement('div');
    element.style.position = 'fixed';
    element.style.top = '20px';
    element.style.left = '50%';
    element.style.transform = 'translateX(-50%)';
    element.style.padding = '10px 20px';
    element.style.background = '#4CAF50';
    element.style.color = 'white';
    element.style.borderRadius = '4px';
    element.style.zIndex = '9999';
    element.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    element.textContent = mensagem;
    document.body.appendChild(element);

    // Remover após 3 segundos
    setTimeout(() => {
      element.style.opacity = '0';
      element.style.transition = 'opacity 0.5s';
      setTimeout(() => {
        document.body.removeChild(element);
      }, 500);
    }, 3000);
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
              whileHover={{ scale: 1.02 }}
              className={`grupo-estudo-card 
                ${isGrupoFeatured(grupo) ? 'featured-topic ring-1 ring-[#FF6B00]/50' : ''}`}
              onMouseEnter={() => setHoveredGrupo(grupo.id)}
              onMouseLeave={() => setHoveredGrupo(null)}
            >
              <div className="grupo-header">
                <div className="grupo-estudo-icon" 
                  style={{ 
                    background: `linear-gradient(135deg, ${grupo.cor || "#FF6B00"} 0%, ${grupo.cor ? grupo.cor + "CC" : "#FF8C40"} 100%)`,
                    boxShadow: hoveredGrupo === grupo.id ? `0 0 15px ${grupo.cor || "#FF6B00"}60` : 'none',
                  }}>
                  <span>{grupo.icon || "📚"}</span>
                </div>
                <div>
                  <h3 className="grupo-nome line-clamp-1">{grupo.nome}</h3>
                  <p className="grupo-disciplina line-clamp-1">{grupo.disciplina || "Disciplina/Área"} • {grupo.membros} {grupo.membros === 1 ? 'participante' : 'participantes'}</p>
                </div>
              </div>
              
              <div className="grupo-info">
                {/* Tópico/Matéria */}
                <div className="flex items-center gap-1 text-white/70 text-sm">
                  <BookOpen className="h-4 w-4 text-[#FF6B00]" />
                  <span>Tópico: {grupo.topico_nome || grupo.disciplina || "Matemática"}</span>
                </div>

                {/* Tags do grupo (geradas aleatoriamente para demonstração) */}
                <div className="grupo-tags">
                  {grupo.tags && grupo.tags.length > 0 ? (
                    grupo.tags.map((tag, idx) => (
                      <span key={idx} className="grupo-tag">{tag}</span>
                    ))
                  ) : (
                    <span className="text-[#FF6B00]/60 text-xs italic">Tags aparecerão aqui</span>
                  )}
                </div>
                
                {/* Data de início */}
                {grupo.data_inicio && (
                  <div className="grupo-data">
                    <Calendar className="h-4 w-4 text-[#FF6B00]" />
                    <span>Data de início: {new Date(grupo.data_inicio).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
                
                {/* Indicadores especiais */}
                <div className="flex items-center gap-2 mt-2">
                  {grupo.tendencia === "alta" && (
                    <div className="flex items-center gap-1 text-[#32CD32] text-xs font-medium bg-[#32CD32]/10 px-2 py-1 rounded-full">
                      <TrendingUp className="h-3 w-3" />
                      <span>Em alta</span>
                    </div>
                  )}
                  {grupo.novoConteudo && (
                    <Badge className="bg-[#FF6B00] text-white text-[10px] px-2 py-0.5 h-5 rounded-full">
                      NOVO
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grupo-footer">
                <Button 
                  className="acesso-btn"
                  onClick={() => {
                    // Lógica para navegar até o detalhe do grupo ou abrir o grupo
                    console.log(`Acessando grupo: ${grupo.id}`);
                  }}
                >
                  Acessar Grupo
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