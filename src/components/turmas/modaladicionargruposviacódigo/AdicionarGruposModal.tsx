import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Plus, Sparkles, LinkIcon, Users, TrendingUp, Globe, Lock, BookOpen, Hash, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
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
  codigo?: string;
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

  // Função simplificada para verificar e criar tabelas necessárias
  const verificarECriarTabelas = async () => {
    try {
      setSincronizando(true);
      setErrorMessage(null);
      setSuccessMessage("Verificando estrutura do banco de dados...");

      // Verificar se a tabela grupos_estudo existe
      try {
        const { data: gruposExistem, error: gruposError } = await supabase
          .from('grupos_estudo')
          .select('id')
          .limit(1);

        if (gruposError && gruposError.code === '42P01') {
          // Tabela não existe, criar
          setSuccessMessage("Criando tabela de grupos de estudo...");

          // Usamos raw query do Supabase
          const { error: createGruposError } = await supabase.rpc('execute_sql', {
            sql_query: `
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
            `
          });

          if (createGruposError) {
            console.error("Erro ao criar tabela grupos_estudo:", createGruposError);
            throw createGruposError;
          }
        }
      } catch (error) {
        console.error("Erro ao verificar/criar tabela grupos_estudo:", error);
        setErrorMessage("Erro ao verificar/criar tabela grupos_estudo. Execute o workflow 'Corrigir Tabelas de Grupos'.");
        setSincronizando(false);
        return false;
      }

      // Verificar se a tabela codigos_grupos_estudo existe
      try {
        const { data: codigosExistem, error: codigosError } = await supabase
          .from('codigos_grupos_estudo')
          .select('codigo')
          .limit(1);

        if (codigosError && codigosError.code === '42P01') {
          // Tabela não existe, criar
          setSuccessMessage("Criando tabela de códigos de grupos...");

          const { error: createCodigosError } = await supabase.rpc('execute_sql', {
            sql_query: `
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
            `
          });

          if (createCodigosError) {
            console.error("Erro ao criar tabela codigos_grupos_estudo:", createCodigosError);
            throw createCodigosError;
          }
        }
      } catch (error) {
        console.error("Erro ao verificar/criar tabela codigos_grupos_estudo:", error);
        setErrorMessage("Erro ao verificar/criar tabela codigos_grupos_estudo. Execute o workflow 'Corrigir Tabelas de Grupos'.");
        setSincronizando(false);
        return false;
      }

      setSuccessMessage("Tabelas verificadas e criadas com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao verificar/criar tabelas:", error);
      setErrorMessage(`Erro ao verificar/criar tabelas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setSincronizando(false);
      return false;
    }
  };

  // Função para buscar grupos existentes
  const buscarGrupos = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setErrorMessage(null);
    setGruposEncontrados([]);

    try {
      // Verificar primeiro se as tabelas existem
      const tabelasOk = await verificarECriarTabelas();
      if (!tabelasOk) {
        setIsSearching(false);
        return;
      }

      // Buscar grupos que correspondem ao termo de pesquisa
      const { data: grupos, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .or(`nome.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%,disciplina.ilike.%${searchTerm}%`)
        .order('data_criacao', { ascending: false })
        .limit(20);

      if (error) {
        console.error("Erro ao buscar grupos:", error);
        setErrorMessage(`Erro ao buscar grupos: ${error.message}`);
        setIsSearching(false);
        return;
      }

      if (!grupos || grupos.length === 0) {
        setIsSearching(false);
        return;
      }

      // Converter para o formato GrupoEstudo
      const gruposFormatados: GrupoEstudo[] = grupos.map(grupo => ({
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

      setGruposEncontrados(gruposFormatados);
      setIsSearching(false);
      console.log(`Encontrados ${gruposFormatados.length} grupos para "${searchTerm}"`);

    } catch (error) {
      console.error("Erro ao buscar grupos:", error);
      setErrorMessage(`Erro na busca: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setIsSearching(false);
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

      // Verificar se as tabelas existem
      const tabelasOk = await verificarECriarTabelas();
      if (!tabelasOk) {
        setIsVerifyingCode(false);
        return;
      }

      // Buscar grupo pelo código
      const { data: grupo, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('codigo', codigoNormalizado)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar grupo por código:", error);
        setErrorMessage(`Erro ao verificar código: ${error.message}`);
        setIsVerifyingCode(false);
        return;
      }

      if (!grupo) {
        setErrorMessage("Código inválido ou expirado. Verifique e tente novamente.");
        setIsVerifyingCode(false);
        return;
      }

      // Obter ID do usuário
      const userId = localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
      if (!userId) {
        console.warn("ID do usuário não encontrado no storage local");
      }

      // Verificar se o usuário já é o criador ou membro do grupo
      if (userId && grupo.user_id === userId) {
        setErrorMessage(`Você já é o criador do grupo "${grupo.nome}". Não é necessário entrar novamente.`);
        setIsVerifyingCode(false);
        return;
      }

      // Verificar se já é membro
      const membrosIds = grupo.membros_ids || [];
      if (userId && membrosIds.includes(userId)) {
        setErrorMessage(`Você já é membro do grupo "${grupo.nome}".`);
        setIsVerifyingCode(false);
        return;
      }

      // Verificar no localStorage se já tem o grupo
      try {
        const gruposStorage = localStorage.getItem('epictus_grupos_estudo');
        if (gruposStorage) {
          const gruposUsuario = JSON.parse(gruposStorage);
          const grupoJaAdicionado = gruposUsuario.find((g: any) => g.id === grupo.id);

          if (grupoJaAdicionado) {
            setErrorMessage(`Você já participa do grupo "${grupo.nome}".`);
            setIsVerifyingCode(false);
            return;
          }
        }
      } catch (storageError) {
        console.error("Erro ao verificar grupos no storage:", storageError);
      }

      // Construir objeto do grupo para retorno
      const novoGrupo: GrupoEstudo = {
        id: grupo.id,
        nome: grupo.nome || 'Grupo sem nome',
        descricao: grupo.descricao || `Grupo acessado via código ${codigoNormalizado}`,
        membros: grupo.membros || 1,
        disciplina: grupo.disciplina || "Geral",
        cor: grupo.cor || "#FF6B00",
        icon: "🔑",
        dataCriacao: grupo.data_criacao || new Date().toISOString(),
        novoConteudo: true,
        privado: grupo.privado || false,
        visibilidade: grupo.privado ? "privado" : "público",
        topico_nome: grupo.topico_nome,
        topico_icon: grupo.topico_icon,
        criador: grupo.user_id,
        codigo: codigoNormalizado
      };

      console.log(`Grupo encontrado via código ${codigoNormalizado}:`, novoGrupo);

      // Adicionar o usuário como membro do grupo
      onGrupoAdicionado(novoGrupo);
      setSuccessMessage(`Você entrou no grupo "${novoGrupo.nome}" com sucesso!`);
      setCodigo("");
      setIsVerifyingCode(false);

    } catch (error) {
      console.error("Erro ao adicionar grupo via código:", error);
      setErrorMessage(`Erro ao verificar código: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setIsVerifyingCode(false);
    }
  };

  // Função para entrar em um grupo encontrado pela busca
  const entrarNoGrupo = (grupo: GrupoEstudo) => {
    onGrupoAdicionado(grupo);
    setSuccessMessage(`Você entrou no grupo "${grupo.nome}" com sucesso!`);
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

  // Função simplificada para sincronizar códigos dos grupos
  const sincronizarCodigosGrupos = async () => {
    try {
      setSincronizando(true);
      setErrorMessage(null);
      setSuccessMessage("Iniciando sincronização...");

      // Verificar e criar tabelas se necessário
      const tabelasOk = await verificarECriarTabelas();
      if (!tabelasOk) {
        setSincronizando(false);
        return;
      }

      // Buscar todos os grupos que têm código
      const { data: grupos, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .not('codigo', 'is', null);

      if (error) {
        console.error("Erro ao buscar grupos:", error);
        setErrorMessage(`Erro ao buscar grupos: ${error.message}`);
        setSincronizando(false);
        return;
      }

      if (!grupos || grupos.length === 0) {
        setSuccessMessage("Nenhum grupo com código encontrado para sincronização.");
        setSincronizando(false);
        return;
      }

      // Sincronizar com a tabela de códigos
      let sucessos = 0;
      let erros = 0;
      let ignorados = 0;

      setSuccessMessage(`Sincronizando ${grupos.length} grupos...`);

      for (const grupo of grupos) {
        try {
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
            console.error(`Erro ao sincronizar código ${grupo.codigo}:`, insertError);
            erros++;
          } else {
            console.log(`Código ${grupo.codigo} sincronizado com sucesso`);
            sucessos++;
          }
        } catch (itemError) {
          console.error(`Erro ao processar grupo ${grupo.id}:`, itemError);
          erros++;
        }
      }

      // Sincronizar grupos do localStorage também
      try {
        const gruposStorage = localStorage.getItem('epictus_grupos_estudo');
        if (gruposStorage) {
          const gruposLocais = JSON.parse(gruposStorage);

          if (Array.isArray(gruposLocais) && gruposLocais.length > 0) {
            setSuccessMessage(`Sincronizando ${gruposLocais.length} grupos do armazenamento local...`);

            for (const grupo of gruposLocais) {
              if (!grupo.codigo) {
                ignorados++;
                continue;
              }

              try {
                // Inserir na tabela de códigos
                const { error: insertError } = await supabase
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

                if (insertError) {
                  console.error(`Erro ao sincronizar código local ${grupo.codigo}:`, insertError);
                  erros++;
                } else {
                  console.log(`Código local ${grupo.codigo} sincronizado com sucesso`);
                  sucessos++;
                }
              } catch (itemError) {
                console.error(`Erro ao processar grupo local ${grupo.id}:`, itemError);
                erros++;
              }
            }
          }
        }
      } catch (localStorageError) {
        console.error("Erro ao processar grupos do localStorage:", localStorageError);
      }

      // Mostrar resultado
      setSuccessMessage(`Sincronização concluída! Total: ${sucessos + erros + ignorados} | Sucesso: ${sucessos} | Ignorados: ${ignorados} | Erros: ${erros}`);

      // Se estamos na aba de pesquisa e tem um termo, atualizar os resultados
      if (activeTab === 'pesquisar' && searchTerm) {
        await buscarGrupos();
      }
    } catch (error) {
      console.error("Erro na sincronização:", error);
      setErrorMessage(`Erro na sincronização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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