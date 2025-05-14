import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Plus, Sparkles, LinkIcon, Users, TrendingUp, Globe, Lock, BookOpen, Hash, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { verificarSeCodigoExiste } from "@/lib/grupoCodigoUtils";
import { supabase } from "@/lib/supabase";
import GrupoEstudoCard from "../components/GrupoEstudoCard";

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

    try {
      setIsSearching(true);
      setErrorMessage(null);

      // Verificar se a tabela codigos_grupos_estudo existe e contém dados
      const { count, error: countError } = await supabase
        .from('codigos_grupos_estudo')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error("Erro ao verificar tabela de códigos:", countError);
        // Fallback: buscar direto em grupos_estudo
        await buscarGruposEstudo();
        return;
      }

      console.log(`A tabela de códigos contém ${count} registros`);

      // Realizar busca aprimorada no banco de dados de códigos de grupos
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
      console.error("Erro ao buscar grupos:", error);
      setErrorMessage("Ocorreu um erro ao buscar grupos. Tente novamente.");
      setIsSearching(false);
    }
  };

  // Função auxiliar para buscar grupos na tabela principal como fallback
  const buscarGruposEstudo = async () => {
    try {
      // Buscar na tabela de grupos_estudo diretamente
      const { data: gruposData, error: gruposError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .or(`nome.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%`)
        .order('data_criacao', { ascending: false })
        .limit(20);

      if (gruposError) {
        console.error("Erro ao buscar na tabela de grupos:", gruposError);
        setErrorMessage("Ocorreu um erro ao buscar grupos. Tente novamente.");
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
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-white/90 hover:text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
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