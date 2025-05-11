import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ChevronRight, Users, TrendingUp, BookOpen, MessageCircle, Plus, UserPlus, FileText, Calendar, LogOut, Eye, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CreateGroupModalEnhanced from "../CreateGroupModalEnhanced";
import GrupoSairModal from "../minisecao-gruposdeestudo/interface/GrupoSairModal";
import GrupoConfiguracoesModal from "../minisecao-gruposdeestudo/interface/GrupoConfiguracoesModal";
import { supabase } from "@/lib/supabase";
import { criarGrupo, sincronizarGruposLocais, obterTodosGrupos, obterGruposLocal, salvarGrupoLocal, removerGrupoLocal } from '@/lib/gruposEstudoStorage';

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
  descricao?: string;
  data_inicio?: string;
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
  const [erro, setErro] = useState<string | null>(null);
  const [sairModalOpen, setSairModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedGrupo, setSelectedGrupo] = useState<GrupoEstudo | null>(null);

  // Carregar grupos do banco de dados e do armazenamento local
  useEffect(() => {
    const carregarGrupos = async () => {
      try {
        setLoading(true);

        // Buscar os grupos do usuário atual do Supabase
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // Obter a lista de grupos removidos do localStorage para filtragem
          const gruposRemovidosKey = 'grupos_removidos';
          const gruposRemovidosStr = localStorage.getItem(gruposRemovidosKey) || '[]';
          const gruposRemovidos = JSON.parse(gruposRemovidosStr);

          // Primeiro carregamos os grupos locais para exibição rápida
          const gruposLocais = obterGruposLocal()
            .filter(grupo => grupo.user_id === session.user.id)
            // Filtrar grupos que foram removidos
            .filter(grupo => !gruposRemovidos.includes(grupo.id));

          // Converter dados locais para o formato da interface
          if (gruposLocais.length > 0) {
            const gruposLocaisFormatados: GrupoEstudo[] = gruposLocais.map((grupo: any) => ({
              id: grupo.id,
              nome: grupo.nome,
              descricao: grupo.descricao,
              cor: grupo.cor,
              membros: grupo.membros || 1,
              topico: grupo.topico,
              disciplina: grupo.disciplina || "",
              icon: grupo.topico_icon,
              dataCriacao: grupo.data_criacao,
              tendencia: Math.random() > 0.7 ? "alta" : undefined, // Valor aleatório para demo
              novoConteudo: Math.random() > 0.7, // Valor aleatório para demo
              privado: grupo.privado,
              visibilidade: grupo.visibilidade,
              topico_nome: grupo.topico_nome,
              topico_icon: grupo.topico_icon,
              data_inicio: grupo.data_inicio,
              criador: grupo.criador || "você" // Garantir que o criador esteja definido
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

              // Filtrar grupos do Supabase que não estão na lista de removidos
              const gruposSupabaseFiltrados = data.filter((grupo: any) => 
                !gruposRemovidos.includes(grupo.id)
              );

              // Converter dados do banco para o formato da interface
              const gruposFormatados: GrupoEstudo[] = gruposSupabaseFiltrados.map((grupo: any) => ({
                id: grupo.id,
                nome: grupo.nome,
                descricao: grupo.descricao,
                cor: grupo.cor,
                membros: grupo.membros || 1,
                topico: grupo.topico,
                disciplina: grupo.disciplina || "",
                icon: grupo.topico_icon,
                dataCriacao: grupo.data_criacao,
                tendencia: Math.random() > 0.7 ? "alta" : undefined, // Valor aleatório para demo
                novoConteudo: Math.random() > 0.7, // Valor aleatório para demo
                privado: grupo.privado,
                visibilidade: grupo.visibilidade,
                topico_nome: grupo.topico_nome,
                topico_icon: grupo.topico_icon,
                data_inicio: grupo.data_inicio,
                criador: grupo.criador || "você" // Garantir que o criador esteja definido
              }));

              // Combinar grupos do Supabase com grupos locais que não estão no Supabase
              const gruposLocaisFiltrados = gruposLocais
                .filter(grupoLocal => grupoLocal.id.startsWith('local_') && 
                  !gruposSupabaseFiltrados.some((grupoRemoto: any) => grupoRemoto.id === grupoLocal.id))
                .map((grupo: any) => ({
                  id: grupo.id,
                  nome: grupo.nome,
                  descricao: grupo.descricao,
                  cor: grupo.cor,
                  membros: grupo.membros || 1,
                  topico: grupo.topico,
                  disciplina: grupo.disciplina || "",
                  icon: grupo.topico_icon,
                  dataCriacao: grupo.data_criacao,
                  tendencia: Math.random() > 0.7 ? "alta" : undefined,
                  novoConteudo: Math.random() > 0.7,
                  privado: grupo.privado,
                  visibilidade: grupo.visibilidade,
                  topico_nome: grupo.topico_nome,
                  topico_icon: grupo.topico_icon,
                  data_inicio: grupo.data_inicio,
                  criador: grupo.criador || "você" // Garantir que o criador esteja definido
                }));

              setGruposEstudo([...gruposFormatados, ...gruposLocaisFiltrados]);
            }
          } catch (supabaseError) {
            console.error("Falha ao usar Supabase:", supabaseError);
            // Já estamos usando os dados locais, então continuar com eles
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

    // NÃO recarregar os grupos quando a página se torna visível novamente
    // pois isso estava causando o problema de recarregamento indevido

    // Limpar listeners e intervalos quando o componente for desmontado
    return () => {
      clearInterval(intervaloSincronizacao);
    };
  }, []); // Remover dependências para evitar recarregamentos desnecessários

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

  // Funções para manipular eventos dos botões de ação
  const handleLeaveGroup = (e: React.MouseEvent, grupo: GrupoEstudo) => {
    e.stopPropagation();
    setSelectedGrupo(grupo);
    setSairModalOpen(true);
  };

  const handleConfirmLeaveGroup = async () => {
    if (selectedGrupo) {
      try {
        console.log(`Saindo do grupo ${selectedGrupo.id}`);

        // 1. Obter sessão do usuário atual
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("Usuário não autenticado");
        }

        // 2. Adicionar o ID à lista de grupos removidos no localStorage
        const gruposRemovidosKey = 'grupos_removidos';
        const gruposRemovidosStr = localStorage.getItem(gruposRemovidosKey) || '[]';
        const gruposRemovidos = JSON.parse(gruposRemovidosStr);
        
        if (!gruposRemovidos.includes(selectedGrupo.id)) {
          gruposRemovidos.push(selectedGrupo.id);
          localStorage.setItem(gruposRemovidosKey, JSON.stringify(gruposRemovidos));
        }

        // 3. Remover do Supabase se não for um grupo local
        if (!selectedGrupo.id.startsWith('local_')) {
          const { error } = await supabase
            .from('grupos_estudo')
            .delete()
            .eq('id', selectedGrupo.id)
            .eq('user_id', session.user.id);

          if (error) {
            console.error("Erro ao sair do grupo no Supabase:", error);
            // Continuar mesmo se houver erro, pois o grupo foi marcado como removido localmente
          }
        }

        // 4. Remover do armazenamento local usando a função dedicada
        const sucesso = removerGrupoLocal(selectedGrupo.id);
        if (!sucesso) {
          console.warn("Problema ao remover grupo localmente, tentando método alternativo");

          // Método alternativo manual
          const gruposLocais = obterGruposLocal();
          const gruposAtualizados = gruposLocais.filter(g => g.id !== selectedGrupo.id);
          localStorage.setItem('epictus_grupos_estudo', JSON.stringify(gruposAtualizados));

          // Atualizar também a cópia na sessão
          try {
            sessionStorage.setItem('epictus_grupos_estudo_session', JSON.stringify(gruposAtualizados));
          } catch (sessionError) {
            console.error("Erro ao atualizar backup na sessão:", sessionError);
          }
        }

        // 5. Atualizar o estado da interface imediatamente
        setGruposEstudo(prevGrupos => prevGrupos.filter(g => g.id !== selectedGrupo.id));

        // 6. Mostrar notificação de sucesso
        mostrarNotificacaoSucesso("Você saiu do grupo com sucesso!");

        // 7. Fechar o modal
        setSairModalOpen(false);
        setSelectedGrupo(null);
      } catch (error) {
        console.error("Erro ao sair do grupo:", error);
        mostrarNotificacaoErro("Não foi possível sair do grupo. Tente novamente.");
      }
    }
  };

  const handleDeleteGroup = async () => {
    if (selectedGrupo) {
      try {
        console.log(`Excluindo o grupo ${selectedGrupo.id}`);

        // 1. Obter sessão do usuário atual
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("Usuário não autenticado");
        }

        // 2. Adicionar o ID à lista de grupos removidos no localStorage
        const gruposRemovidosKey = 'grupos_removidos';
        const gruposRemovidosStr = localStorage.getItem(gruposRemovidosKey) || '[]';
        const gruposRemovidos = JSON.parse(gruposRemovidosStr);
        
        if (!gruposRemovidos.includes(selectedGrupo.id)) {
          gruposRemovidos.push(selectedGrupo.id);
          localStorage.setItem(gruposRemovidosKey, JSON.stringify(gruposRemovidos));
        }

        // 3. Importar a função excluirGrupo
        const { excluirGrupo } = await import('@/lib/gruposEstudoStorage');

        // 4. Utilizar a função excluirGrupo para uma remoção completa
        const sucesso = await excluirGrupo(selectedGrupo.id, session.user.id);
        if (!sucesso) {
          console.warn("Método principal de exclusão falhou, tentando método alternativo");

          // Excluir do Supabase se não for um grupo local
          if (!selectedGrupo.id.startsWith('local_')) {
            const { error } = await supabase
              .from('grupos_estudo')
              .delete()
              .eq('id', selectedGrupo.id)
              .eq('user_id', session.user.id);

            if (error) {
              console.error("Erro ao excluir grupo no Supabase:", error);
              // Continuar mesmo com erro, já que o grupo está na lista de removidos
            }
          }

          // Remover do localStorage
          const gruposLocais = obterGruposLocal();
          const gruposAtualizados = gruposLocais.filter(g => g.id !== selectedGrupo.id);
          localStorage.setItem('epictus_grupos_estudo', JSON.stringify(gruposAtualizados));

          // Atualizar sessionStorage
          try {
            sessionStorage.setItem('epictus_grupos_estudo_session', JSON.stringify(gruposAtualizados));
          } catch (err) {
            console.error("Erro ao atualizar sessionStorage:", err);
          }

          // Verificar backups de emergência
          const todasChaves = Object.keys(localStorage);
          const chavesEmergencia = todasChaves.filter(chave => 
            chave.startsWith('epictus_grupos_estudo_emergency_'));

          for (const chave of chavesEmergencia) {
            try {
              const gruposEmergencia = JSON.parse(localStorage.getItem(chave) || '[]');
              const gruposEmergenciaFiltrados = gruposEmergencia.filter((g: any) => g.id !== selectedGrupo.id);
              localStorage.setItem(chave, JSON.stringify(gruposEmergenciaFiltrados));
            } catch (e) {
              console.error(`Erro ao limpar backup ${chave}:`, e);
            }
          }
        }

        // 5. Atualizar o estado da interface imediatamente para feedback ao usuário
        setGruposEstudo(prevGrupos => prevGrupos.filter(g => g.id !== selectedGrupo.id));

        // 6. Mostrar notificação de sucesso
        mostrarNotificacaoSucesso("Grupo excluído com sucesso!");

        // 7. Fechar o modal
        setSairModalOpen(false);
        setSelectedGrupo(null);
      } catch (error) {
        console.error("Erro ao excluir grupo:", error);
        mostrarNotificacaoErro("Não foi possível excluir o grupo. Tente novamente.");
      }
    }
  };

  const handleViewGroup = (e: React.MouseEvent, grupoId: string) => {
    e.stopPropagation();
    console.log(`Visualizando grupo ${grupoId}`);
    // Implementar navegação para a visualização detalhada do grupo
    // window.location.href = `/turmas/grupos/${grupoId}`;
  };

  const handleGroupSettings = (e: React.MouseEvent, grupo: GrupoEstudo) => {
    e.stopPropagation();
    console.log(`Configurações do grupo ${grupo.id}`);
    setSelectedGrupo(grupo);
    setConfigModalOpen(true);
  };

  // Função para salvar as alterações do grupo
  const handleSaveGroupSettings = async (grupoAtualizado: GrupoEstudo) => {
    try {
      // Atualizar a lista de grupos
      setGruposEstudo(prevGrupos => 
        prevGrupos.map(grupo => 
          grupo.id === grupoAtualizado.id ? grupoAtualizado : grupo
        )
      );

      // Atualizar no armazenamento local
      const gruposLocais = obterGruposLocal();
      const gruposAtualizados = gruposLocais.map((grupo: any) => 
        grupo.id === grupoAtualizado.id ? {
          ...grupo,
          nome: grupoAtualizado.nome,
          descricao: grupoAtualizado.descricao,
          disciplina: grupoAtualizado.disciplina,
          cor: grupoAtualizado.cor,
          privado: grupoAtualizado.privado,
          visibilidade: grupoAtualizado.visibilidade,
          data_inicio: grupoAtualizado.data_inicio
        } : grupo
      );

      localStorage.setItem('epictus_grupos_estudo', JSON.stringify(gruposAtualizados));
      
      // Atualizar a cópia na sessão
      try {
        sessionStorage.setItem('epictus_grupos_estudo_session', JSON.stringify(gruposAtualizados));
      } catch (sessionError) {
        console.error("Erro ao atualizar backup na sessão:", sessionError);
      }

      // Fechar o modal
      setConfigModalOpen(false);
      setSelectedGrupo(null);

      // Mostrar notificação de sucesso
      mostrarNotificacaoSucesso("Grupo atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações do grupo:", error);
      mostrarNotificacaoErro("Não foi possível salvar as alterações. Tente novamente.");
    }
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

      // Mapear grupos para o formato correto
      const gruposMapeados = todosGrupos.map(grupo => ({
        ...grupo,
        disciplina: grupo.disciplina || "",
        novoConteudo: Boolean(grupo.novoConteudo || Math.random() > 0.7),
        tendencia: grupo.tendencia || (Math.random() > 0.7 ? "alta" : undefined)
      }));

      // Remover duplicatas baseado no nome do grupo
      const gruposFiltrados = gruposMapeados.filter((grupo, index, self) => 
        index === self.findIndex((g) => g.nome === grupo.nome)
      );

      setGruposEstudo(gruposFiltrados);

      // Fechar modal
      setShowCreateGroupModal(false);

      // Mostrar notificação de sucesso
      mostrarNotificacaoSucesso("Grupo criado com sucesso!");
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

  // Função auxiliar para mostrar notificação de erro
  const mostrarNotificacaoErro = (mensagem: string) => {
    const element = document.createElement('div');
    element.style.position = 'fixed';
    element.style.top = '20px';
    element.style.left = '50%';
    element.style.transform = 'translateX(-50%)';
    element.style.padding = '10px 20px';
    element.style.background = '#F44336';
    element.style.color = 'white';
    element.style.borderRadius = '4px';
    element.style.zIndex = '9999';
    element.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    element.textContent = mensagem;
    document.body.appendChild(element);

    // Remover após 4 segundos
    setTimeout(() => {
      element.style.opacity = '0';
      element.style.transition = 'opacity 0.5s';
      setTimeout(() => {
        document.body.removeChild(element);
      }, 500);
    }, 4000);
  };

  return (
    <div className="mt-8">
      {/* Modal de criação de grupo */}
      <CreateGroupModalEnhanced 
        isOpen={showCreateGroupModal} 
        onClose={() => {
          setShowCreateGroupModal(false);
          // Limpar o cache temporário para forçar o recarregamento
          localStorage.removeItem('epictus_grupos_estudo_temp_cache');
        }}
        onSubmit={handleCreateGroup}
      />

      {/* Modal de sair do grupo */}
      <GrupoSairModal
        isOpen={sairModalOpen}
        onClose={() => {
          setSairModalOpen(false);
          setSelectedGrupo(null);
          // Limpar o cache temporário para forçar o recarregamento
          localStorage.removeItem('epictus_grupos_estudo_temp_cache');
        }}
        groupName={selectedGrupo?.nome || ""}
        isCreator={selectedGrupo?.criador === "você" || (selectedGrupo && Math.random() > 0.5) || false}
        onLeaveGroup={handleConfirmLeaveGroup}
        onDeleteGroup={handleDeleteGroup}
      />

      {/* Modal de configurações do grupo */}
      <GrupoConfiguracoesModal
        isOpen={configModalOpen}
        onClose={() => {
          setConfigModalOpen(false);
          setSelectedGrupo(null);
        }}
        grupo={selectedGrupo}
        onSave={handleSaveGroupSettings}
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
              {/* Botões de ação que aparecem quando o mouse passa por cima */}
              {hoveredGrupo === grupo.id && (
                <div className="absolute right-3 top-3 flex items-center gap-2 z-10">
                  <button 
                    className="text-white/80 hover:text-[#FF6B00] transition-colors p-1 rounded-full"
                    title="Sair do Grupo"
                    onClick={(e) => handleLeaveGroup(e, grupo)}
                  >
                    <LogOut className="h-4 w-4" />
                  </button>

                  <button 
                    className="text-white/80 hover:text-[#FF6B00] transition-colors p-1 rounded-full"
                    title="Visualizar Grupo"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Lógica para visualizar o grupo
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <button 
                    className="text-white/80 hover:text-[#FF6B00] transition-colors p-1 rounded-full"
                    title="Configurações do Grupo"
                    onClick={(e) => handleGroupSettings(e, grupo)}
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              )}

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
                    <div className="flex justify-between text-white/70 text-xs mt-0.5">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3 text-[#FF6B00]" />
                        {grupo.disciplina || "Sem disciplina"}
                      </span>
                      <div className="flex items-center gap-1 text-white/60 text-xs ml-auto">
                        <Users className="h-3 w-3" />
                        <span>{grupo.membros} membros</span>
                      </div>
                    </div>
                    <div className="text-white/60 text-xs mt-0.5 line-clamp-1">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3 text-[#FF6B00]" />
                        {grupo.descricao || "Sem descrição"}
                      </span>
                    </div>
                    {grupo.data_inicio && (
                      <div className="text-white/60 text-xs mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-[#FF6B00]" />
                          Início: {grupo.data_inicio}
                        </span>
                      </div>
                    )}
                    {grupo.tendencia === "alta" && (
                      <div className="flex items-center gap-1 text-emerald-400 text-xs">
                        <TrendingUp className="h-3 w-3" />
                        <span>Em alta</span>
                      </div>
                    )}
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