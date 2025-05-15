import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Plus, Sparkles, LinkIcon, Users, TrendingUp, Globe, Lock, BookOpen, Hash, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { verificarSeCodigoExisteDetalhado, verificarRelacaoUsuarioComGrupo, buscarGrupoComCodigo } from "@/lib/grupoCodigoUtils";
import { supabase } from "@/lib/supabase";
import GrupoEstudoCard from "../components/GrupoEstudoCard";
import { Loader2 } from 'lucide-react';

interface GrupoEstudo {
  id: string;
  nome: string;
  descricao?: string;
  membros: number;
  topico?: string;
  disciplina?: string;
  cor: string;
  icon?: string;
  dataCriacao: string;
  tendencia?: string;
  novoConteudo?: boolean;
  privado?: boolean;
  visibilidade?: string;
  topico_nome?: string;
  topico_icon?: string;
  data_inicio?: string;
  criador?: string;
}

interface AdicionarGruposModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGrupoAdicionado: (grupo: GrupoEstudo) => void;
}

const AdicionarGruposModal: React.FC<AdicionarGruposModalProps> = ({
  isOpen,
  onClose,
  onGrupoAdicionado,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [codigo, setCodigo] = useState("");
  const [activeTab, setActiveTab] = useState("pesquisar");
  const [gruposEncontrados, setGruposEncontrados] = useState<GrupoEstudo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [sincronizando, setSincronizando] = useState<boolean>(false);

  // Função para executar o script de correção usando o workflow existente
  const executarWorkflowCorrecaoTabelas = async () => {
    try {
      setSuccessMessage("Executando workflow de correção de tabelas...");

      // Fazer uma requisição para executar o script fix-missing-tables.js
      const response = await fetch("/api/run-workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workflow: "Corrigir Tabelas de Grupos"
        }),
      });

      if (response.ok) {
        console.log("✅ Workflow executado com sucesso");
        return true;
      } else {
        console.error("❌ Falha ao executar workflow:", await response.text());
        return false;
      }
    } catch (error) {
      console.error("❌ Erro ao executar workflow:", error);
      return false;
    }
  };

  // Função robusta para verificar se as tabelas existem e são acessíveis
  const verificarTabelasExistem = async () => {
    try {
      console.log("🔍 Verificando existência das tabelas...");

      // Verificar tabela grupos_estudo
      let gruposExiste = false;
      try {
        const { count, error: gruposError } = await supabase
          .from('grupos_estudo')
          .select('*', { count: 'exact', head: true });

        gruposExiste = !gruposError;

        if (gruposError) {
          if (gruposError.code === '42P01') {
            console.log("⚠️ Tabela grupos_estudo não existe");
          } else {
            console.error("❌ Erro ao verificar tabela grupos_estudo:", gruposError);
          }
        } else {
          console.log("✅ Tabela grupos_estudo existe e está acessível");
        }
      } catch (gruposCheckError) {
        console.error("❌ Exceção ao verificar tabela grupos_estudo:", gruposCheckError);
        gruposExiste = false;
      }

      // Verificar tabela codigos_grupos_estudo
      let codigosExiste = false;
      try {
        const { count, error: codigosError } = await supabase
          .from('codigos_grupos_estudo')
          .select('*', { count: 'exact', head: true });

        codigosExiste = !codigosError;

        if (codigosError) {
          if (codigosError.code === '42P01') {
            console.log("⚠️ Tabela codigos_grupos_estudo não existe");
          } else {
            console.error("❌ Erro ao verificar tabela codigos_grupos_estudo:", codigosError);
          }
        } else {
          console.log("✅ Tabela codigos_grupos_estudo existe e está acessível");
        }
      } catch (codigosCheckError) {
        console.error("❌ Exceção ao verificar tabela codigos_grupos_estudo:", codigosCheckError);
        codigosExiste = false;
      }

      const todasExistem = gruposExiste && codigosExiste;
      console.log(`📊 Status das tabelas: grupos_estudo=${gruposExiste}, codigos_grupos_estudo=${codigosExiste}, todas=${todasExistem}`);

      return { gruposExiste, codigosExiste, todasExistem };
    } catch (error) {
      console.error("❌ Erro geral ao verificar existência das tabelas:", error);
      return {
        gruposExiste: false,
        codigosExiste: false,
        todasExistem: false
      };
    }
  };

  // Função para criar tabelas usando a API REST do Supabase
  const criarTabelasViaRESTAPI = async () => {
    try {
      console.log("🔄 Tentando criar tabelas via REST API...");

      // Primeiro verificar se as tabelas já existem
      const { todasExistem } = await verificarTabelasExistem();

      if (todasExistem) {
        console.log("✅ Todas as tabelas já existem");
        return true;
      }

      // Se não existem, vamos usar o script fix-missing-tables.js
      console.log("🔄 Executando script fix-missing-tables.js...");

      // Tenta executar via NODE.js diretamente
      try {
        const response = await fetch(`/api/db/fix-tables`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          console.log("✅ Tabelas criadas com sucesso via API");
          return true;
        } else {
          console.error("❌ Erro ao criar tabelas via API:", await response.text());
        }
      } catch (apiError) {
        console.error("❌ Erro ao acessar API:", apiError);
      }

      // Se falhar, vamos recomendar o uso do workflow
      setErrorMessage("Não foi possível criar as tabelas automaticamente. Por favor, execute o workflow 'Corrigir Tabelas de Grupos' e tente novamente.");
      return false;
    } catch (error) {
      console.error("❌ Erro ao criar tabelas via REST API:", error);
      return false;
    }
  };

  // Função para criar ou verificar tabelas - versão robusta com múltiplas estratégias
  const criarTabelasDiretamente = async () => {
    try {
      console.log("🔧 Verificando acesso às tabelas...");

      // Verificar se as tabelas já existem
      const { todasExistem, gruposExiste, codigosExiste } = await verificarTabelasExistem();

      if (todasExistem) {
        console.log("✅ Todas as tabelas já existem e são acessíveis");
        return true;
      }

      console.log(`⚠️ Status das tabelas: grupos_estudo=${gruposExiste}, codigos_grupos_estudo=${codigosExiste}`);

      // ESTRATÉGIA 1: Criar tabelas diretamente pelo componente
      try {
        console.log("🔄 Tentando criar tabelas diretamente...");
        const criadasDiretamente = await criarTabelasNecessarias();

        if (criadasDiretamente) {
          console.log("✅ Tabelas criadas com sucesso diretamente");
          return true;
        }
      } catch (directError) {
        console.error("⚠️ Erro ao criar tabelas diretamente:", directError);
      }

      // ESTRATÉGIA 2: Tentar executar o script fix-missing-tables.js
      try {
        if (await executarWorkflowCorrecaoTabelas()) {
          console.log("✅ Workflow executado com sucesso");

          // Verificar novamente se as tabelas foram criadas
          const { todasExistem: criadasComSucesso } = await verificarTabelasExistem();

          if (criadasComSucesso) {
            console.log("✅ Tabelas criadas com sucesso pelo workflow");
            return true;
          } else {
            console.log("⚠️ Workflow executado, mas tabelas ainda não estão acessíveis");
          }
        }
      } catch (workflowError) {
        console.error("⚠️ Erro ao executar workflow:", workflowError);
      }

      // ESTRATÉGIA 3: API REST
      try {
        const criadasViaAPI = await criarTabelasViaRESTAPI();
        if (criadasViaAPI) {
          return true;
        }
      } catch (apiError) {
        console.error("⚠️ Erro ao usar API REST:", apiError);
      }

      // Se todas as estratégias falharem, mostrar mensagem de fallback
      setErrorMessage("Não foi possível criar as tabelas automaticamente. Tente iniciar a sincronização novamente ou execute manualmente o workflow 'Corrigir Tabelas de Grupos'.");
      return false;
    } catch (error) {
      console.error("❌ Erro ao criar/verificar tabelas:", error);
      setErrorMessage("Erro ao verificar tabelas. Tente novamente ou execute manualmente o workflow 'Corrigir Tabelas de Grupos'.");
      return false;
    }
  };

  // Função para criar tabelas necessárias
  const criarTabelasNecessarias = async () => {
    console.log("Criando tabelas necessárias...");

    try {
      // Criar tabela grupos_estudo
      await supabase.query(`
        CREATE TABLE IF NOT EXISTS public.grupos_estudo (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL,
          nome TEXT NOT NULL,
          descricao TEXT,
          cor TEXT NOT NULL DEFAULT '#FF6B00',
          membros INTEGER NOT NULL DEFAULT 1,
          membros_ids JSONB DEFAULT '[]'::jsonb,
          topico TEXT,
          topico_nome TEXT,
          topico_icon TEXT,
          privado BOOLEAN DEFAULT false,
          visibilidade TEXT DEFAULT 'todos',
          codigo TEXT,
          disciplina TEXT DEFAULT 'Geral',
          data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `);

      // Criar tabela codigos_grupos_estudo
      await supabase.query(`
        CREATE TABLE IF NOT EXISTS public.codigos_grupos_estudo (
          codigo VARCHAR(15) PRIMARY KEY,
          grupo_id UUID NOT NULL,
          nome VARCHAR NOT NULL,
          descricao TEXT,
          data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
          user_id UUID,
          privado BOOLEAN DEFAULT false,
          membros INTEGER DEFAULT 1,
          visibilidade VARCHAR,
          disciplina VARCHAR,
          cor VARCHAR DEFAULT '#FF6B00',
          membros_ids JSONB DEFAULT '[]'::jsonb,
          ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `);

      return true;
    } catch (error) {
      console.error("Erro ao criar tabelas:", error);
      return false;
    }
  };

  // Efeito para limpar mensagens quando o modal fecha
  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setSearchTerm("");
      setCodigo("");
      setGruposEncontrados([]);
    }
  }, [isOpen]);

  // Função para buscar grupos existentes
  const buscarGrupos = async () => {
    if (!searchTerm.trim()) return;

    // Verificar se as tabelas necessárias existem
    try {
      // Verificar primeiro se o script de criação de tabelas precisa ser executado
      const { data: tableCheck, error: tableCheckError } = await supabase.rpc(
        'check_table_exists',
        { table_name: 'codigos_grupos_estudo' }
      ).maybeSingle();

      // Se a função RPC não existe ou deu erro, verificamos usando o método tradicional
      if (tableCheckError || !tableCheck) {
        console.log("Verificando tabelas usando método alternativo...");

        try {
          const { count, error: countError } = await supabase
            .from('codigos_grupos_estudo')
            .select('*', { count: 'exact', head: true });

          if (countError) {
            console.error("Erro ao verificar tabela de códigos:", countError);

            // Se o erro for de tabela não existente, tentar criar as tabelas
            if (countError.code === '42P01') {
              console.log("Tabela de códigos não existe. Tentando criar...");
              const criada = await criarTabelasNecessarias();
              if (!criada) {
                setErrorMessage("A tabela de códigos não existe. Por favor, execute o workflow 'Corrigir Tabelas de Grupos' ou clique em Sincronizar novamente.");
                setIsSearching(false);
                return;
              }
            }
          }
        } catch (e) {
          console.error("Exceção ao verificar tabela de códigos:", e);
          console.log("Tentando criar tabelas necessárias...");
          await criarTabelasNecessarias();
        }
      }

      // Tenta o método principal de busca
      try {
        const { data, error } = await supabase
          .from('codigos_grupos_estudo')
          .select('*')
          .or(`nome.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%,disciplina.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%`)
          .order('ultima_atualizacao', { ascending: false })
          .limit(20);

        if (error) {
          console.error("Erro ao buscar grupos na base de dados de códigos:", error);
          // Fallback: buscar direto na tabela de grupos
          await buscarGruposEstudo();
          return;
        }

        if (!data || data.length === 0) {
          console.log("Nenhum grupo encontrado na tabela de códigos, buscando na tabela de grupos...");
          // Fallback: buscar direto na tabela de grupos
          await buscarGruposEstudo();
          return;
        }

        // Transformar os resultados da tabela codigos_grupos_estudo para o formato GrupoEstudo
        const gruposEncontrados: GrupoEstudo[] = data.map(grupo => ({
          id: grupo.grupo_id,
          nome: grupo.nome,
          descricao: grupo.descricao || `Grupo de estudos sobre ${grupo.nome}`,
          membros: grupo.membros || 1,
          disciplina: grupo.disciplina || "Geral",
          cor: grupo.cor || "#FF6B00",
          icon: "📚", // Usamos um ícone padrão, já que não temos no banco
          dataCriacao: grupo.data_criacao || grupo.ultima_atualizacao || new Date().toISOString(),
          tendencia: Math.random() > 0.7 ? "alta" : undefined, // Aleatório por enquanto
          novoConteudo: Math.random() > 0.6, // Aleatório por enquanto
          visibilidade: grupo.privado ? "privado" : "público",
          topico_nome: grupo.topico_nome,
          topico_icon: grupo.topico_icon,
          codigo: grupo.codigo // Importante: incluir o código do grupo
        }));

        setGruposEncontrados(gruposEncontrados);
        setIsSearching(false);

        console.log(`Encontrados ${gruposEncontrados.length} grupos relacionados a "${searchTerm}" na tabela de códigos`);

      } catch (error) {
        console.error("Erro ao buscar na tabela de códigos:", error);
        // Fallback: buscar direto na tabela de grupos
        await buscarGruposEstudo();
      }

    } catch (error) {
      console.error("Erro durante verificação das tabelas:", error);
      // Fallback: buscar direto em grupos_estudo
      await buscarGruposEstudo();
    }
  };

  // Função auxiliar para buscar grupos na tabela principal como fallback
  const buscarGruposEstudo = async () => {
    try {
      // Verificar se a tabela grupos_estudo existe
      try {
        const { count, error: checkError } = await supabase
          .from('grupos_estudo')
          .select('*', { count: 'exact', head: true });

        if (checkError) {
          if (checkError.code === '42P01') {
            // Tabela não existe, tentar criar
            console.log("Tabela grupos_estudo não existe. Tentando criar...");
            const criada = await criarTabelasNecessarias();
            if (!criada) {
              setErrorMessage("As tabelas necessárias não existem. Clique em Sincronizar para criar as estruturas.");
              setIsSearching(false);
              setGruposEncontrados([]);
              return;
            }
          } else {
            console.error("Erro ao verificar tabela de grupos:", checkError);
            setErrorMessage("Ocorreu um erro ao verificar a estrutura do banco de dados.");
            setIsSearching(false);
            setGruposEncontrados([]);
            return;
          }
        }
      } catch (checkError) {
        console.error("Erro ao verificar tabela de grupos:", checkError);
      }

      // Buscar na tabela de grupos_estudo diretamente
      const { data: gruposData, error: gruposError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .or(`nome.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%`)
        .order('data_criacao', { ascending: false })
        .limit(20);

      if (gruposError) {
        console.error("Erro ao buscar na tabela de grupos:", gruposError);

        if (gruposError.code === '42P01') {
          setErrorMessage("A tabela de grupos não existe. Clique em Sincronizar para configurar o banco de dados.");
        } else {
          setErrorMessage("Ocorreu um erro ao buscar grupos. Tente novamente.");
        }

        setIsSearching(false);
        setGruposEncontrados([]);
        return;
      }

      if (!gruposData || gruposData.length === 0) {
        console.log("Nenhum grupo encontrado em ambas as tabelas");
        setGruposEncontrados([]);
        setIsSearching(false);
        return;
      }

      // Converter resultados para o formato esperado
      const gruposEncontrados: GrupoEstudo[] = gruposData.map(grupo => ({
        id: grupo.id,
        nome: grupo.nome,
        descricao: grupo.descricao || `Grupo de estudos sobre ${grupo.nome}`,
        membros: grupo.membros || 1,
        disciplina: grupo.disciplina || "Geral",
        cor: grupo.cor || "#FF6B00",
        icon: "📚", 
        dataCriacao: grupo.data_criacao || new Date().toISOString(),
        tendencia: Math.random() > 0.7 ? "alta" : undefined,
        novoConteudo: Math.random() > 0.6,
        visibilidade: grupo.privado ? "privado" : "público",
        topico_nome: grupo.topico_nome,
        topico_icon: grupo.topico_icon,
        codigo: grupo.codigo
      }));

      // Para cada grupo encontrado, tentar salvar na tabela de códigos para sincronizar
      for (const grupo of gruposData) {
        if (grupo.codigo) {
          try {
            await supabase
              .from('codigos_grupos_estudo')
              .upsert({
                codigo: grupo.codigo,
                grupo_id: grupo.id,
                nome: grupo.nome,
                descricao: grupo.descricao || '',
                user_id: grupo.user_id,
                privado: grupo.privado || false,
                membros: grupo.membros || 1,
                visibilidade: grupo.visibilidade || 'todos',
                disciplina: grupo.disciplina || '',
                cor: grupo.cor || '#FF6B00',
                membros_ids: grupo.membros_ids || [],
                data_criacao: grupo.data_criacao,
                ultima_atualizacao: new Date().toISOString()
              }, { onConflict: 'codigo' });
          } catch (syncError) {
            console.error("Erro ao sincronizar grupo com tabela de códigos:", syncError);
          }
        }
      }

      setGruposEncontrados(gruposEncontrados);
      setIsSearching(false);

      console.log(`Encontrados ${gruposEncontrados.length} grupos relacionados a "${searchTerm}" na tabela de grupos_estudo`);
    } catch (error) {
      console.error("Erro ao buscar grupos na tabela principal:", error);
      setErrorMessage("Ocorreu um erro ao buscar grupos. Tente novamente.");
      setIsSearching(false);
      setGruposEncontrados([]);
    }
  };

  // Função para adicionar grupo via código
  const adicionarGrupoViaCodigo = async () => {
    if (!codigo.trim()) {
      setErrorMessage("Por favor, digite um código válido.");
      return;
    }

    try {
      setIsVerifyingCode(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const codigoNormalizado = codigo.trim().toUpperCase();

      console.log(`Verificando código: ${codigoNormalizado}`);

      // Obter o ID do usuário atual do localStorage ou sessionStorage
      const userId = localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
      if (!userId) {
        console.warn("ID do usuário não encontrado no storage local");
      }

      // ETAPA 1: Buscar na tabela específica de códigos
      let grupoEncontrado = null;
      try {
        const { data, error } = await supabase
          .from('codigos_grupos_estudo')
          .select('*')
          .eq('codigo', codigoNormalizado)
          .maybeSingle();

        if (!error && data) {
          console.log("Grupo encontrado na tabela de códigos:", data);
          grupoEncontrado = data;
        } else {
          console.log("Código não encontrado na tabela de códigos:", error);
        }
      } catch (codigosError) {
        console.error("Erro ao buscar na tabela de códigos:", codigosError);
      }

      // ETAPA 2: Se não encontrou na tabela de códigos, buscar diretamente na tabela de grupos
      if (!grupoEncontrado) {
        try {
          const { data, error } = await supabase
            .from('grupos_estudo')
            .select('*')
            .eq('codigo', codigoNormalizado)
            .maybeSingle();

          if (!error && data) {
            console.log("Grupo encontrado diretamente na tabela grupos_estudo:", data);
            grupoEncontrado = data;

            // Sincronizar com a tabela de códigos para futuras buscas
            try {
              const { error: syncError } = await supabase
                .from('codigos_grupos_estudo')
                .insert({
                  codigo: codigoNormalizado,
                  grupo_id: data.id,
                  nome: data.nome,
                  descricao: data.descricao || '',
                  user_id: data.user_id,
                  privado: data.privado || false,
                  membros: data.membros || 1,
                  visibilidade: data.visibilidade || 'todos',
                  disciplina: data.disciplina || '',
                  cor: data.cor || '#FF6B00',
                  membros_ids: data.membros_ids || [],
                  data_criacao: data.data_criacao,
                  ultima_atualizacao: new Date().toISOString()
                });

              if (syncError && syncError.code !== '23505') { // Ignorar erro de chave duplicada
                console.error("Erro ao sincronizar com tabela de códigos:", syncError);
              }
            } catch (syncError) {
              console.error("Erro ao sincronizar grupo com tabela de códigos:", syncError);
            }
          } else {
            console.log("Código não encontrado na tabela de grupos:", error);
          }
        } catch (gruposError) {
          console.error("Erro ao buscar na tabela de grupos:", gruposError);
        }
      }

      // Se não encontrou o grupo em nenhuma das tabelas
      if (!grupoEncontrado) {
        setErrorMessage("Código inválido ou expirado. Verifique e tente novamente.");
        setIsVerifyingCode(false);
        return;
      }

      // Verificar se o usuário já é o criador do grupo ou está na lista de membros
      if (userId && grupoEncontrado.user_id === userId) {
        setErrorMessage(`Você já é o criador do grupo "${grupoEncontrado.nome}". Não é necessário entrar novamente.`);
        setIsVerifyingCode(false);
        return;
      }

      // Verificar se o usuário já é membro do grupo
      const membrosIds = grupoEncontrado.membros_ids || [];
      if (userId && membrosIds.includes(userId)) {
        setErrorMessage(`Você já é membro do grupo "${grupoEncontrado.nome}".`);
        setIsVerifyingCode(false);
        return;
      }

      // Verificar também no localStorage se o usuário já tem o grupo
      let gruposUsuario = [];
      try {
        const gruposStorage = localStorage.getItem('epictus_grupos_estudo');
        if (gruposStorage) {
          gruposUsuario = JSON.parse(gruposStorage);
          const grupoJaAdicionado = gruposUsuario.find((g: any) => 
            g.id === (grupoEncontrado?.id || grupoEncontrado?.grupo_id)
          );

          if (grupoJaAdicionado) {
            setErrorMessage(`Você já participa do grupo "${grupoEncontrado.nome}".`);
            setIsVerifyingCode(false);
            return;
          }
        }
      } catch (storageError) {
        console.error("Erro ao verificar grupos no storage:", storageError);
      }

      // Construir objeto do grupo com os dados obtidos
      const novoGrupo: GrupoEstudo = {
        id: grupoEncontrado.id || grupoEncontrado.grupo_id,
        nome: grupoEncontrado.nome || 'Grupo sem nome',
        descricao: grupoEncontrado.descricao || `Grupo acessado via código ${codigoNormalizado}`,
        membros: grupoEncontrado.membros || 1,
        disciplina: grupoEncontrado.disciplina || "Geral",
        cor: grupoEncontrado.cor || "#FF6B00",
        icon: "🔑",
        dataCriacao: grupoEncontrado.data_criacao || new Date().toISOString(),
        novoConteudo: true, // Destacamos como novo
        privado: grupoEncontrado.privado || false,
        visibilidade: grupoEncontrado.privado ? "privado" : "público",
        topico_nome: grupoEncontrado.topico_nome,
        topico_icon: grupoEncontrado.topico_icon,
        criador: grupoEncontrado.user_id,
        codigo: codigoNormalizado // Importante: incluir o código
      };

      console.log(`Grupo encontrado via código ${codigoNormalizado}:`, novoGrupo);

      // Adicionar o usuário como membro do grupo
      onGrupoAdicionado(novoGrupo);
      setSuccessMessage(`Você entrou no grupo "${novoGrupo.nome}" com sucesso!`);
      setCodigo("");
      setIsVerifyingCode(false);

    } catch (error) {
      console.error("Erro ao adicionar grupo via código:", error);
      setErrorMessage("Ocorreu um erro ao verificar o código. Tente novamente.");
      setIsVerifyingCode(false);
    }
  };

  // Função para entrar em um grupo encontrado pela busca
  const entrarNoGrupo = (grupo: GrupoEstudo) => {
    onGrupoAdicionado(grupo);
    setSuccessMessage(`Você entrou no grupo "${grupo.nome}" com sucesso!`);
    // Limpar resultados da busca após entrar
    setGruposEncontrados([]);
    setSearchTerm("");
  };

  // Função para formatar data de criação
  const formatarData = (dataString: string) => {
    try {
      const data = new Date(dataString);
      return new Intl.DateTimeFormat('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
      year: 'numeric' 
      }).format(data);
    } catch {
      return "Data desconhecida";
    }
  };

  // Função que implementa a sincronização de códigos dos grupos - versão robusta
  const sincronizarCodigosGrupos = async () => {
    try {
      setSincronizando(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      // 1. DIAGNÓSTICO E PREPARAÇÃO DO BANCO DE DADOS
      console.log("🔍 Verificando estrutura do banco de dados...");
      setSuccessMessage("Verificando estrutura do banco de dados...");

      // Estratégia 1: Criar tabelas diretamente usando supabase.query()
      let tabelasCriadas = false;

      try {
        // Verificar se as tabelas existem
        const { todasExistem } = await verificarTabelasExistem();

        if (todasExistem) {
          console.log("✅ Todas as tabelas já existem");
          setSuccessMessage("Todas as tabelas necessárias já existem!");
          tabelasCriadas = true;
        } else {
          // Tenta criar as tabelas diretamente
          const resultadoCriacao = await criarTabelasNecessarias();

          if (resultadoCriacao) {
            console.log("✅ Tabelas criadas diretamente com sucesso");
            setSuccessMessage("Estrutura do banco de dados criada com sucesso!");
            tabelasCriadas = true;
          }
        }
      } catch (directError) {
        console.error("❌ Erro ao criar tabelas diretamente:", directError);
        setSuccessMessage("Tentando métodos alternativos para criar tabelas...");
      }

      // Se a criação direta falhou, tenta usar a API
      if (!tabelasCriadas) {
        try {
          console.log("🔄 Tentando criar tabelas via API...");

          const response = await fetch('/api/db/fix-tables', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });

          if (response.ok) {
            console.log("✅ Tabelas criadas com sucesso via API");
            setSuccessMessage("Estrutura do banco de dados criada com sucesso via API!");
            tabelasCriadas = true;
          } else {
            console.error("❌ API retornou erro:", await response.text());
            setSuccessMessage("Tentando método alternativo...");
          }
        } catch (apiError) {
          console.error("❌ Erro ao acessar API:", apiError);
        }
      }

      // Última alternativa: usar o script fix-missing-tables.js
      if (!tabelasCriadas) {
        try {
          console.log("🔄 Tentando criar tabelas via workflow...");
          const workflowSuccess = await executarWorkflowCorrecaoTabelas();

          if (workflowSuccess) {
            console.log("✅ Workflow executado com sucesso");
            setSuccessMessage("Estrutura criada via workflow. Prosseguindo com a sincronização...");
            tabelasCriadas = true;
          } else {
            console.error("❌ Falha ao executar workflow");
            setErrorMessage("Não foi possível criar as tabelas automaticamente. Execute o workflow 'Corrigir Tabelas de Grupos' e tente novamente.");
            setSincronizando(false);
            return;
          }
        } catch (workflowError) {
          console.error("❌ Erro ao executar workflow:", workflowError);
        }
      }

      // Se todas as tentativas falharam
      if (!tabelasCriadas) {
        setErrorMessage("Não foi possível criar as tabelas necessárias após várias tentativas. Por favor, execute o workflow 'Corrigir Tabelas de Grupos' manualmente.");
        setSincronizando(false);
        return;
      }

      // Espera um pouco para a mensagem ser visível
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 2. VERIFICAÇÃO DAS TABELAS
      try {
        // Verificar e criar as tabelas necessárias automaticamente
        setSuccessMessage("Verificando e criando tabelas necessárias...");

        // Verificar se a tabela grupos_estudo existe, se não, criar
        try {
          const { data: gruposCheck, error: gruposCheckError } = await supabase
            .from('grupos_estudo')
            .select('id, codigo')
            .limit(1);

          if (gruposCheckError && gruposCheckError.code === '42P01') {
            console.log('🔄 Tabela grupos_estudo não existe, criando automaticamente...');
            setSuccessMessage("Criando tabela grupos_estudo...");

            // Criar tabela grupos_estudo
            await supabase.query(`
              CREATE TABLE IF NOT EXISTS public.grupos_estudo (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL,
                nome TEXT NOT NULL,
                ```text
descricao TEXT,
                cor TEXT NOT NULL DEFAULT '#FF6B00',
                membros INTEGER NOT NULL DEFAULT 1,
                membros_ids JSONB DEFAULT '[]'::jsonb,
                topico TEXT,
                topico_nome TEXT,
                topico_icon TEXT,
                privado BOOLEAN DEFAULT false,
                visibilidade TEXT DEFAULT 'todos',
                codigo TEXT,
                disciplina TEXT DEFAULT 'Geral',
                data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now()
              );
              CREATE INDEX IF NOT EXISTS grupos_estudo_user_id_idx ON public.grupos_estudo(user_id);
              ALTER TABLE public.grupos_estudo ENABLE ROW LEVEL SECURITY;

              DROP POLICY IF EXISTS "Usuários podem visualizar grupos" ON public.grupos_estudo;
              CREATE POLICY "Usuários podem visualizar grupos"
                ON public.grupos_estudo FOR SELECT
                USING (true);

              DROP POLICY IF EXISTS "Usuários podem inserir grupos" ON public.grupos_estudo;
              CREATE POLICY "Usuários podem inserir grupos"
                ON public.grupos_estudo FOR INSERT
                WITH CHECK (true);

              DROP POLICY IF EXISTS "Usuários podem atualizar grupos" ON public.grupos_estudo;
              CREATE POLICY "Usuários podem atualizar grupos"
                ON public.grupos_estudo FOR UPDATE
                USING (true);
            `);

            console.log('✅ Tabela grupos_estudo criada com sucesso');
            setSuccessMessage("Tabela grupos_estudo criada com sucesso!");
          } else if (gruposCheckError) {
            console.error('❌ Erro ao verificar tabela grupos_estudo:', gruposCheckError);
            throw gruposCheckError;
          } else {
            console.log('✅ Tabela grupos_estudo já existe');
          }
        } catch (gruposError) {
          console.error('❌ Erro ao verificar/criar tabela grupos_estudo:', gruposError);
          if (gruposError.code === '42501') {
            setErrorMessage("Erro de permissão: Sua conta não tem permissão para criar tabelas. Por favor, contate o suporte.");
          } else {
            setErrorMessage(`Erro ao verificar/criar tabela grupos_estudo: ${gruposError.message}`);
          }
          setSincronizando(false);
          return;
        }

        // Verificar se a tabela codigos_grupos_estudo existe, se não, criar
        try {
          const { data: codigosCheck, error: codigosCheckError } = await supabase
            .from('codigos_grupos_estudo')
            .select('codigo')
            .limit(1);

          if (codigosCheckError && codigosCheckError.code === '42P01') {
            console.log('🔄 Tabela codigos_grupos_estudo não existe, criando automaticamente...');
            setSuccessMessage("Criando tabela codigos_grupos_estudo...");

            // Criar tabela codigos_grupos_estudo
            await supabase.query(`
              CREATE TABLE IF NOT EXISTS public.codigos_grupos_estudo (
                codigo VARCHAR(15) PRIMARY KEY,
                grupo_id UUID NOT NULL,
                nome VARCHAR NOT NULL,
                descricao TEXT,
                data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
                user_id UUID,
                privado BOOLEAN DEFAULT false,
                membros INTEGER DEFAULT 1,
                visibilidade VARCHAR,
                disciplina VARCHAR,
                cor VARCHAR DEFAULT '#FF6B00',
                membros_ids JSONB DEFAULT '[]'::jsonb,
                ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT now()
              );

              CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_grupo_id ON public.codigos_grupos_estudo(grupo_id);
              CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_user_id ON public.codigos_grupos_estudo(user_id);

              ALTER TABLE public.codigos_grupos_estudo ENABLE ROW LEVEL SECURITY;

              DROP POLICY IF EXISTS "Todos podem visualizar códigos" ON public.codigos_grupos_estudo;
              CREATE POLICY "Todos podem visualizar códigos"
                ON public.codigos_grupos_estudo FOR SELECT
                USING (true);

              DROP POLICY IF EXISTS "Todos podem inserir códigos" ON public.codigos_grupos_estudo;
              CREATE POLICY "Todos podem inserir códigos"
                ON public.codigos_grupos_estudo FOR INSERT
                WITH CHECK (true);

              DROP POLICY IF EXISTS "Todos podem atualizar códigos" ON public.codigos_grupos_estudo;
              CREATE POLICY "Todos podem atualizar códigos"
                ON public.codigos_grupos_estudo FOR UPDATE
                USING (true);
            `);

            console.log('✅ Tabela codigos_grupos_estudo criada com sucesso');
            setSuccessMessage("Tabela codigos_grupos_estudo criada com sucesso!");
          } else if (codigosCheckError) {
            console.error('❌ Erro ao verificar tabela codigos_grupos_estudo:', codigosCheckError);
            throw codigosCheckError;
          } else {
            console.log('✅ Tabela codigos_grupos_estudo já existe');
          }
        } catch (codigosError) {
          console.error('❌ Erro ao verificar/criar tabela codigos_grupos_estudo:', codigosError);
          if (codigosError.code === '42501') {
            setErrorMessage("Erro de permissão: Sua conta não tem permissão para criar tabelas. Por favor, contate o suporte.");
          } else {
            setErrorMessage(`Erro ao verificar/criar tabela codigos_grupos_estudo: ${codigosError.message}`);
          }
          setSincronizando(false);
          return;
        }

        console.log("✅ Ambas as tabelas estão acessíveis ou foram criadas");
        setSuccessMessage("Tabelas verificadas/criadas com sucesso! Iniciando sincronização...");

      } catch (checkError) {
        console.error('❌ Erro ao verificar acesso às tabelas:', checkError);
        setErrorMessage(`Erro ao verificar tabelas: ${checkError.message || 'Erro desconhecido'}`);
        setSincronizando(false);
        return;
      }

      // 3. SINCRONIZAÇÃO DOS DADOS
      // 3.1 Buscar grupos no banco de dados
      console.log("🔄 Iniciando sincronização de grupos...");
      setSuccessMessage("Buscando grupos para sincronizar...");

      let grupos = [];
      try {
        const { data, error } = await supabase
          .from('grupos_estudo')
          .select('*');

        if (error) {
          console.error('❌ Erro ao buscar grupos:', error);
          setErrorMessage(`Erro ao buscar grupos: ${error.message}`);
          setSincronizando(false);
          return;
        }

        grupos = data || [];
        console.log(`📊 Encontrados ${grupos.length} grupos no banco de dados`);

      } catch (fetchError) {
        console.error('❌ Erro ao buscar grupos:', fetchError);
        setErrorMessage(`Erro ao buscar grupos: ${fetchError.message}`);
        setSincronizando(false);
        return;
      }

      // Contadores para o relatório
      let sucessos = 0;
      let erros = 0;
      let ignorados = 0;

      // 3.2 Processar cada grupo do banco
      setSuccessMessage(`Sincronizando ${grupos.length} grupos do banco de dados...`);

      for (const grupo of grupos) {
        try {
          // Verificar se o grupo já tem código
          if (!grupo.codigo) {
            console.log(`⚠️ Grupo ID ${grupo.id} não possui código, será ignorado`);
            ignorados++;
            continue;
          }

          // Inserir na tabela de códigos
          const { error: insertError } = await supabase
            .from('codigos_grupos_estudo')
            .upsert({
              codigo: grupo.codigo,
              grupo_id: grupo.id,
              nome: grupo.nome || 'Grupo sem nome',
              descricao: grupo.descricao || '',
              user_id: grupo.user_id,
              privado: grupo.privado || false,
              membros: grupo.membros || 1,
              visibilidade: grupo.visibilidade || 'todos',
              disciplina: grupo.disciplina || '',
              cor: grupo.cor || '#FF6B00',
              membros_ids: grupo.membros_ids || [],
              data_criacao: grupo.data_criacao || new Date().toISOString(),
              ultima_atualizacao: new Date().toISOString()
            }, { onConflict: 'codigo' });

          if (insertError) {
            console.error(`❌ Erro ao sincronizar código ${grupo.codigo} para grupo ${grupo.id}: ${insertError.message}`);
            erros++;
          } else {
            console.log(`✅ Código ${grupo.codigo} sincronizado com sucesso para grupo ${grupo.id}`);
            sucessos++;
          }
        } catch (itemError) {
          console.error(`❌ Erro ao processar grupo ${grupo.id}:`, itemError);
          erros++;
        }
      }

      // 3.3 Buscar e processar grupos do localStorage
      let gruposLocais = [];
      try {
        const gruposLocalStorage = localStorage.getItem('epictus_grupos_estudo');
        if (gruposLocalStorage) {
          gruposLocais = JSON.parse(gruposLocalStorage);
          if (Array.isArray(gruposLocais) && gruposLocais.length > 0) {
            console.log(`📊 Encontrados ${gruposLocais.length} grupos no localStorage`);
            setSuccessMessage(`Sincronizando ${gruposLocais.length} grupos do localStorage...`);

            let localSucessos = 0;
            let localErros = 0;
            let localIgnorados = 0;

            for (const grupo of gruposLocais) {
              if (!grupo.codigo) {
                localIgnorados++;
                continue;
              }

              try {
                // Verificar se o grupo já existe no banco
                const { data: existingGrupo, error: checkError } = await supabase
                  .from('grupos_estudo')
                  .select('id')
                  .eq('id', grupo.id)
                  .maybeSingle();

              if (checkError && checkError.code !== 'PGRST116') {
                // Ignorar erro de "nenhum registro encontrado"
                console.error(`❌ Erro ao verificar grupo local ${grupo.id}:`, checkError);
                localErros++;
                continue;
              }

                // Se o grupo não existir no banco, inserir
                if (!existingGrupo) {
                  try {
                    const { error: insertGrupoError } = await supabase
                      .from('grupos_estudo')
                      .insert({
                        id: grupo.id,
                        user_id: grupo.user_id || grupo.criador || 'desconhecido',
                        nome: grupo.nome || 'Grupo sem nome',
                        descricao: grupo.descricao || '',
                        cor: grupo.cor || '#FF6B00',
                        membros: grupo.membros || 1,
                        membros_ids: grupo.membros_ids || [],
                        topico: grupo.topico,
                        topico_nome: grupo.topico_nome,
                        topico_icon: grupo.topico_icon,
                        privado: grupo.privado || false,
                        visibilidade: grupo.visibilidade || 'todos',
                        codigo: grupo.codigo,
                        disciplina: grupo.disciplina || 'Geral',
                        data_criacao: grupo.dataCriacao || grupo.data_criacao || new Date().toISOString()
                      });

                    if (insertGrupoError) {
                      console.error(`❌ Erro ao inserir grupo local ${grupo.id}:`, insertGrupoError);
                      if (insertGrupoError.code === '23505') {
                        console.log(`ℹ️ Grupo ${grupo.id} já existe no banco (chave duplicada)`);
                      } else {
                        localErros++;
                        continue;
                      }
                    } else {
                      console.log(`✅ Grupo local ${grupo.id} inserido com sucesso no banco`);
                    }
                  } catch (insertError) {
                    console.error(`❌ Erro ao inserir grupo ${grupo.id}:`, insertError);
                    localErros++;
                    continue;
                  }
                }

                // Inserir/atualizar na tabela de códigos
                try {
                  const { error: insertCodigoError } = await supabase
                    .from('codigos_grupos_estudo')
                    .upsert({
                      codigo: grupo.codigo,
                      grupo_id: grupo.id,
                      nome: grupo.nome || 'Grupo sem nome',
                      descricao: grupo.descricao || '',
                      user_id: grupo.user_id || grupo.criador || 'desconhecido',
                      privado: grupo.privado || false,
                      membros: grupo.membros || 1,
                      visibilidade: grupo.visibilidade || 'todos',
                      disciplina: grupo.disciplina || '',
                      cor: grupo.cor || '#FF6B00',
                      membros_ids: grupo.membros_ids || [],
                      data_criacao: grupo.dataCriacao || grupo.data_criacao || new Date().toISOString(),
                      ultima_atualizacao: new Date().toISOString()
                    }, { onConflict: 'codigo' });

                if (insertCodigoError) {
                  console.error(`❌ Erro ao sincronizar código local ${grupo.codigo}:`, insertCodigoError);
                  localErros++;
                } else {
                  console.log(`✅ Código local ${grupo.codigo} sincronizado com sucesso`);
                  localSucessos++;
                }
              } catch (codigoError) {
                console.error(`❌ Erro ao sincronizar código ${grupo.codigo}:`, codigoError);
                localErros++;
              }
            } catch (localError) {
              console.error(`❌ Erro ao processar grupo local ${grupo.id}:`, localError);
              localErros++;
            }
          }

          // Adicionar aos contadores gerais
          sucessos += localSucessos;
          erros += localErros;
          ignorados += localIgnorados;
        }
      }
    } catch (localStorageError) {
      console.error("❌ Erro ao processar grupos do localStorage:", localStorageError);
    }

    // 4. EXIBIR RESULTADO
    // Exibir notificação de sucesso com resumo
    const totalGrupos = sucessos + erros + ignorados;
    setSuccessMessage(`✅ Sincronização concluída. Total: ${totalGrupos} | Sucesso: ${sucessos} | Ignorados: ${ignorados} | Erros: ${erros}`);

    // 5. RECARREGAR DADOS DA INTERFACE
    // Recarregar grupos caso estejamos na aba de busca
    if (activeTab === 'pesquisar' && searchTerm) {
      await buscarGrupos();
    }
    } catch (error: any) {
      console.error('❌ Erro na sincronização:', error);
      setErrorMessage(`Erro na sincronização: ${error.message}`);
    } finally {
      setSincronizando(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-gradient-to-b from-gray-900/95 to-gray-950/95 rounded-2xl overflow-hidden max-w-2xl w-full shadow-[0_20px_60px_-15px_rgba(255,107,0,0.3)] border border-[#FF6B00]/20 relative"
          >
            {/* Header com título e botão de fechar */}
            <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Users className="h-5 w-5 mr-2.5" />
                Adicionar Grupos de Estudo
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={sincronizarCodigosGrupos}
                  disabled={sincronizando}
                  className="text-xs flex items-center gap-1 text-white/80 hover:text-white border-white/20"
                >
                  {sincronizando ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
                      </svg>
                      Sincronizar
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-white/90 hover:text-white hover:bg-white/20"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Conteúdo do modal */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <Tabs defaultValue="pesquisar" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-6 bg-gray-800/50 p-1 rounded-xl shadow-inner border border-gray-700/40">
                  <TabsTrigger 
                    value="pesquisar" 
                    className="rounded-lg py-2.5 data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white font-medium"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Pesquisar Grupos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="codigo" 
                    className="rounded-lg py-2.5 data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white font-medium"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Entrar com Código
                  </TabsTrigger>
                </TabsList>

                {/* Conteúdo da aba de pesquisa */}
                <TabsContent value="pesquisar" className="space-y-5">
                  <div className="relative">
                    <Input
                      placeholder="Buscar grupos por nome, tópico ou disciplina..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-gray-800/30 border-gray-700/50 focus:border-[#FF6B00] px-4 py-3 rounded-xl pr-12 h-12 shadow-inner placeholder:text-gray-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') buscarGrupos();
                      }}
                    />
                    <Button
                      onClick={buscarGrupos}
                      disabled={isSearching || !searchTerm.trim()}
                      className="absolute right-1.5 top-1.5 bg-[#FF6B00] hover:bg-[#FF8C40] text-white rounded-lg p-1 h-9 w-9 transition-all duration-300 shadow-md"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Resultados da busca */}
                  {isSearching ? (
                    <div className="py-10 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 border-3 border-t-[#FF6B00] border-b-[#FF6B00]/30 border-r-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-400 font-medium">Buscando grupos de estudo...</p>
                    </div>
                  ) : gruposEncontrados.length > 0 ? (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-400 flex items-center justify-between bg-gray-800/20 px-3 py-2 rounded-lg">
                        <span className="flex items-center">
                          <Hash className="h-4 w-4 mr-1.5 text-[#FF6B00]" /> 
                          {gruposEncontrados.length} grupos encontrados
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#FF6B00] hover:text-[#FF8C40] hover:bg-[#FF6B00]/10 p-0 h-auto"
                          onClick={() => setGruposEncontrados([])}
                        >
                          Limpar resultados
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {gruposEncontrados.map((grupo) => (
                          <motion.div
                            key={grupo.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 hover:from-gray-800/90 hover:to-gray-900/90 border border-gray-700/50 hover:border-[#FF6B00]/40 rounded-xl p-4 transition-all duration-300 shadow-md hover:shadow-lg"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex gap-3">
                                <div 
                                  className="h-14 w-14 rounded-xl flex items-center justify-center text-white shadow-lg transform transition-all duration-300" 
                                  style={{ 
                                    backgroundColor: grupo.cor,
                                    boxShadow: `0 8px 20px -6px ${grupo.cor}80`
                                  }}
                                >
                                  <span className="text-2xl">{grupo.icon || "📚"}</span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold text-white/90 text-base">{grupo.nome}</h3>
                                    <div className="flex gap-1.5">
                                      {grupo.novoConteudo && (
                                        <Badge className="bg-[#FF6B00] text-white text-[10px] px-1.5 py-0 h-4 font-medium">
                                          NOVO
                                        </Badge>
                                      )}
                                      {grupo.tendencia === "alta" && (
                                        <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0 h-4 flex items-center font-medium">
                                          <TrendingUp className="h-3 w-3 mr-0.5" />
                                          EM ALTA
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{grupo.descricao}</p>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-xs text-gray-400">
                                    <span className="flex items-center">
                                      <Users className="h-3.5 w-3.5 mr-1 text-[#FF6B00]/80" />
                                      {grupo.membros} membros
                                    </span>
                                    <span className="flex items-center">
                                      <BookOpen className="h-3.5 w-3.5 mr-1 text-[#FF6B00]/80" />
                                      {grupo.disciplina}
                                    </span>
                                    <span className="flex items-center">
                                      <Clock className="h-3.5 w-3.5 mr-1 text-[#FF6B00]/80" />
                                      Criado em {formatarData(grupo.dataCriacao)}
                                    </span>
                                    <Badge className={`
                                      flex items-center gap-1 px-2 py-0.5 rounded-md font-normal
                                      ${grupo.visibilidade === 'público' 
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' 
                                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/20'}
                                    `}>
                                      {grupo.visibilidade === 'público' 
                                        ? <><Globe className="h-3 w-3" /> Público</>
                                        : <><Lock className="h-3 w-3" /> Privado</>}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <Button
                                onClick={() => entrarNoGrupo(grupo)}
                                className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white rounded-lg px-3 shadow-md hover:shadow-lg transition-all duration-300 h-9 whitespace-nowrap flex-shrink-0 ml-2"
                                size="sm"
                              >
                                <Plus className="h-4 w-4 mr-1.5" /> 
                                Entrar
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : searchTerm.trim() !== "" ? (
                    <div className="py-10 text-center">
                      <div className="w-16 h-16 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-gray-500" />
                      </div>
                      <h3 className="text-white font-medium mb-2">Nenhum grupo encontrado</h3>
                      <p className="text-gray-400 max-w-md mx-auto">
                        Não encontramos grupos com os termos buscados. Tente outras palavras-chave ou disciplinas.
                      </p>
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#FF6B00]/20 to-[#FF8C40]/10 flex items-center justify-center mb-5">
                        <Search className="h-10 w-10 text-[#FF6B00]" />
                      </div>
                      <h3 className="text-white font-medium text-lg mb-2">Descubra grupos de estudo</h3>
                      <p className="text-gray-400 text-sm max-w-md mx-auto">
                        Digite termos como disciplinas, tópicos ou nomes para encontrar comunidades de estudo que combinem com seus interesses.
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Conteúdo da aba de código */}
                <TabsContent value="codigo" className="space-y-5">
                  <div className="bg-gradient-to-r from-[#FF6B00]/10 to-[#FF8C40]/10 border border-[#FF6B00]/20 rounded-xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="bg-[#FF6B00]/20 rounded-full p-2.5 mt-0.5 flex-shrink-0">
                        <Sparkles className="h-6 w-6 text-[#FF6B00]" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-lg mb-2">Código de Convite</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          Entre em grupos privados utilizando um código de convite. Estes códigos são compartilhados por administradores ou membros dos grupos para acesso exclusivo.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    <label htmlFor="codigo" className="text-sm text-gray-300 font-medium flex items-center">
                      <Hash className="h-4 w-4 mr-1.5 text-[#FF6B00]" />
                      Digite o código de convite
                    </label>
                    <div className="relative">
                      <Input
                        id="codigo"
                        placeholder="Ex: ABCD-1234-XYZ9"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        className="bg-gray-800/30 border-gray-700/50 focus:border-[#FF6B00] px-4 py-3 rounded-xl h-12 shadow-inner font-medium text-base tracking-wide placeholder:text-gray-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') adicionarGrupoViaCodigo();
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={adicionarGrupoViaCodigo}
                    disabled={isVerifyingCode || !codigo.trim()}
                    className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-xl py-3 mt-3 font-medium text-base shadow-md hover:shadow-lg transition-all duration-500 h-12 border border-[#FF6B00]/40"
                  >
                    {isVerifyingCode ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2.5"></div>
                        Verificando código...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="h-5 w-5 mr-2.5" />
                        Entrar com Código
                      </>
                    )}
                  </Button>

                  {/* Área de informações e estado */}
                  {(errorMessage || successMessage) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg mt-5 flex items-start ${
                        errorMessage
                          ? "bg-red-500/10 border border-red-500/20 text-red-400"
                          : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {errorMessage 
                        ? <X className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" /> 
                        : <Sparkles className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />}
                      <span>{errorMessage || successMessage}</span>
                    </motion.div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AdicionarGruposModal;