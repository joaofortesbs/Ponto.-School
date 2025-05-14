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

      // Realizar busca real no banco de dados de códigos de grupos
      const { data, error } = await supabase
        .from('codigos_grupos_estudo')
        .select('*')
        .or(`nome.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%,disciplina.ilike.%${searchTerm}%`)
        .order('data_criacao', { ascending: false })
        .limit(20);

      if (error) {
        console.error("Erro ao buscar grupos na base de dados:", error);
        setErrorMessage("Ocorreu um erro ao buscar grupos. Tente novamente.");
        setIsSearching(false);
        return;
      }

      if (!data || data.length === 0) {
        setGruposEncontrados([]);
        setIsSearching(false);
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
        dataCriacao: grupo.data_criacao,
        tendencia: Math.random() > 0.7 ? "alta" : undefined, // Aleatório por enquanto
        novoConteudo: Math.random() > 0.6, // Aleatório por enquanto
        visibilidade: grupo.privado ? "privado" : "público",
        topico_nome: grupo.topico_nome,
        topico_icon: grupo.topico_icon
      }));

      setGruposEncontrados(gruposEncontrados);
      setIsSearching(false);

      console.log(`Encontrados ${gruposEncontrados.length} grupos relacionados a "${searchTerm}" no banco de dados`);

    } catch (error) {
      console.error("Erro ao buscar grupos:", error);
      setErrorMessage("Ocorreu um erro ao buscar grupos. Tente novamente.");
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

      // Buscar o grupo diretamente na tabela de códigos
      const { data, error } = await supabase
        .from('codigos_grupos_estudo')
        .select('*')
        .eq('codigo', codigoNormalizado)
        .single();

      if (error || !data) {
        console.error("Erro ao verificar código ou código não encontrado:", error);
        setErrorMessage("Código inválido ou expirado. Verifique e tente novamente.");
        setIsVerifyingCode(false);
        return;
      }

      // Buscar informações mais completas do grupo na tabela principal
      const { data: grupoData, error: grupoError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('id', data.grupo_id)
        .single();

      // Se houver erro na busca de dados complementares, usamos os dados da tabela de códigos
      const grupoFinal = !grupoError && grupoData ? grupoData : data;

      // Construir objeto do grupo com os dados obtidos
      const novoGrupo: GrupoEstudo = {
        id: grupoFinal.grupo_id || data.grupo_id,
        nome: grupoFinal.nome || data.nome,
        descricao: grupoFinal.descricao || data.descricao || `Grupo acessado via código ${codigoNormalizado}`,
        membros: grupoFinal.membros || data.membros || 1,
        disciplina: grupoFinal.disciplina || data.disciplina || "Geral",
        cor: grupoFinal.cor || data.cor || "#FF6B00",
        icon: grupoFinal.icon || "🔑",
        dataCriacao: grupoFinal.data_criacao || data.data_criacao || new Date().toISOString(),
        tendencia: grupoFinal.tendencia || undefined,
        novoConteudo: true, // Destacamos como novo
        privado: grupoFinal.privado || data.privado || false,
        visibilidade: (grupoFinal.privado || data.privado) ? "privado" : "público",
        topico_nome: grupoFinal.topico_nome || data.topico_nome,
        topico_icon: grupoFinal.topico_icon || data.topico_icon,
        criador: grupoFinal.user_id || data.user_id
      };

      console.log(`Grupo encontrado via código ${codigoNormalizado}:`, novoGrupo);

      // Adicionar o usuário como membro do grupo (em um cenário real, isso seria persistido no banco de dados)
      // Aqui estamos apenas retornando o grupo para a interface parent
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
```

The code has been regenerated with the modifications to persist group codes in the `codigos_grupos_estudo` table and improve the search functionality.
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MagnifyingGlassIcon, 
  ArrowRightIcon, 
  UserIcon, 
  BookOpenIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  CodeIcon,
  LockClosedIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { verificarSeCodigoExiste, buscarGrupoComCodigo } from '@/lib/grupoCodigoUtils';
import { supabase } from '@/lib/supabase';

interface AdicionarGrupoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGrupoAdicionado: (grupo: any) => void;
}

const AdicionarGrupoModal: React.FC<AdicionarGrupoModalProps> = ({ isOpen, onClose, onGrupoAdicionado }) => {
  const [abaAtiva, setAbaAtiva] = useState('pesquisar');
  const [codigoDigitado, setCodigoDigitado] = useState('');
  const [resultadosPesquisa, setResultadosPesquisa] = useState<any[]>([]);
  const [isPesquisando, setIsPesquisando] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorPesquisa, setErrorPesquisa] = useState<string>('');

  // Limpar estados ao fechar o modal
  useEffect(() => {
    if (!isOpen) {
      setAbaAtiva('pesquisar');
      setCodigoDigitado('');
      setResultadosPesquisa([]);
      setIsPesquisando(false);
      setIsLoading(false);
      setErrorMessage('');
      setSuccessMessage('');
      setErrorPesquisa('');
    }
  }, [isOpen]);

  // Função para pesquisar grupos
  const pesquisarGrupos = async (termo: string) => {
    setIsPesquisando(true);
    setResultadosPesquisa([]);
    setErrorPesquisa('');

    try {
      if (!termo.trim()) {
        // Se não houver termo, buscar alguns grupos populares
        const { data, error } = await supabase
          .from('codigos_grupos_estudo')
          .select('*')
          .order('membros', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Erro ao buscar grupos populares:', error);
          throw error;
        }

        setResultadosPesquisa(data || []);
        return;
      }

      // Pesquisar na tabela central de códigos usando o termo
      const { data, error } = await supabase
        .from('codigos_grupos_estudo')
        .select('*')
        .or(`nome.ilike.%${termo}%,descricao.ilike.%${termo}%,disciplina.ilike.%${termo}%,codigo.ilike.%${termo}%`)
        .order('data_criacao', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Erro ao pesquisar grupos:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        setErrorPesquisa('Nenhum grupo encontrado com esse termo');
        return;
      }

      // Filtrar grupos privados (se necessário)
      const gruposFiltrados = data.filter(grupo => !grupo.privado);

      if (gruposFiltrados.length === 0) {
        setErrorPesquisa('Nenhum grupo público encontrado com esse termo');
        return;
      }

      setResultadosPesquisa(gruposFiltrados);
    } catch (error) {
      console.error('Erro ao pesquisar grupos:', error);
      setErrorPesquisa('Ocorreu um erro ao pesquisar grupos');
    } finally {
      setIsPesquisando(false);
    }
  };

  // Função para verificar se um código existe e adicionar o grupo
  const verificarEAdicionarGrupo = async () => {
    if (!codigoDigitado.trim()) {
      setErrorMessage('Por favor, digite um código válido');
      return;
    }

    setIsLoading(true);
    try {
      // Normalizar o código (remover espaços e converter para maiúsculas)
      const codigoNormalizado = codigoDigitado.trim().toUpperCase();

      // Verificar diretamente na tabela central de códigos
      const { data, error } = await supabase
        .from('codigos_grupos_estudo')
        .select('*')
        .eq('codigo', codigoNormalizado)
        .single();

      if (error || !data) {
        console.log('Código não encontrado na tabela central:', codigoNormalizado);
        // Fallback: tentar verificar usando a função auxiliar
        const existe = await verificarSeCodigoExiste(codigoNormalizado);

        if (!existe) {
          setErrorMessage('Código inválido ou não encontrado');
          setIsLoading(false);
          return;
        }
      }

      // Se chegou aqui, o código existe. Buscar detalhes do grupo
      const grupo = await buscarGrupoComCodigo(codigoNormalizado);

      if (!grupo) {
        setErrorMessage('Não foi possível recuperar os detalhes do grupo');
        setIsLoading(false);
        return;
      }

      // Adicionar usuário ao grupo
      try {
        // Buscar informações do usuário atual
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        if (!userId) {
          setErrorMessage('Não foi possível identificar o usuário atual');
          setIsLoading(false);
          return;
        }

        // Verificar se o usuário já está no grupo
        if (grupo.membros_ids && Array.isArray(grupo.membros_ids) && grupo.membros_ids.includes(userId)) {
          setErrorMessage('Você já é membro deste grupo');
          setIsLoading(false);
          return;
        }

        // Atualizar a tabela de grupos para adicionar o usuário
        const novaMembrosIds = [...(grupo.membros_ids || []), userId];
        const novoNumeroMembros = (grupo.membros || 1) + 1;

        // Atualizar o grupo principal
        const { error: updateError } = await supabase
          .from('grupos_estudo')
          .update({ 
            membros_ids: novaMembrosIds,
            membros: novoNumeroMembros
          })
          .eq('id', grupo.id);

        if (updateError) {
          console.error('Erro ao adicionar usuário ao grupo:', updateError);
          throw new Error('Erro ao adicionar usuário ao grupo');
        }

        // Atualizar também a tabela de códigos
        await supabase
          .from('codigos_grupos_estudo')
          .update({ 
            membros_ids: novaMembrosIds,
            membros: novoNumeroMembros
          })
          .eq('codigo', codigoNormalizado);

        // Atualizar o armazenamento local
        const gruposLocal = JSON.parse(localStorage.getItem('epictus_grupos_estudo') || '[]');
        gruposLocal.push(grupo);
        localStorage.setItem('epictus_grupos_estudo', JSON.stringify(gruposLocal));

        setIsLoading(false);
        setSuccessMessage(`Adicionado com sucesso ao grupo: ${grupo.nome || 'Grupo de Estudos'}`);
        setTimeout(() => {
          onClose(); // Fechar o modal após alguns segundos
          window.location.reload(); // Recarregar para atualizar a lista de grupos
        }, 2000);

      } catch (error) {
        console.error('Erro ao adicionar usuário ao grupo:', error);
        setErrorMessage('Ocorreu um erro ao adicionar você ao grupo');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      setErrorMessage('Ocorreu um erro ao verificar o código');
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Grupo de Estudos</DialogTitle>
          <DialogDescription>
            Encontre um grupo existente ou entre com um código.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="pesquisar" value={abaAtiva} onValueChange={setAbaAtiva}>
          <TabsList>
            <TabsTrigger value="pesquisar">Pesquisar</TabsTrigger>
            <TabsTrigger value="codigo">Código</TabsTrigger>
          </TabsList>
          <TabsContent value="pesquisar">
            <div className="grid gap-4">
              <div className="relative">
                <Input 
                  type="search"
                  placeholder="Pesquisar por nome, tópico..."
                  onChange={(e) => pesquisarGrupos(e.target.value)}
                />
                {isPesquisando && (
                  <MagnifyingGlassIcon className="absolute top-2.5 right-3 w-5 h-5 text-gray-500 animate-pulse" />
                )}
              </div>

              {errorPesquisa && (
                <div className="text-red-500 text-sm">{errorPesquisa}</div>
              )}

              {/* Resultados da pesquisa */}
              {resultadosPesquisa.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                    Resultados encontrados ({resultadosPesquisa.length})
                  </h3>
                  <div className="grid gap-3">
                    {resultadosPesquisa.map((grupo) => (
                      <div
                        key={grupo.grupo_id || grupo.id}
                        className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary/80 dark:hover:border-primary/60 transition-all shadow-sm"
                        style={{ 
                          borderLeft: `4px solid ${grupo.cor || '#FF6B00'}`,
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {grupo.nome}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {grupo.descricao || 'Sem descrição disponível'}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                <UserIcon className="w-3 h-3 mr-1" />
                                {grupo.membros || 0} membros
                              </span>
                              {grupo.disciplina && (
                                <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                                  <BookOpenIcon className="w-3 h-3 mr-1" />
                                  {grupo.disciplina}
                                </span>
                              )}
                              {grupo.codigo && (
                                <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                  <CodeIcon className="w-3 h-3 mr-1" />
                                  {grupo.codigo}
                                </span>
                              )}
                              {grupo.visibilidade && (
                                <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                                  {grupo.privado ? (
                                    <LockClosedIcon className="w-3 h-3 mr-1" />
                                  ) : (
                                    <GlobeAltIcon className="w-3 h-3 mr-1" />
                                  )}
                                  {grupo.privado ? 'Privado' : 'Público'}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-shrink-0 ml-2"
                            onClick={() => {
                              setCodigoDigitado(grupo.codigo || '');
                              setAbaAtiva('codigo');
                            }}
                          >
                            <ArrowRightIcon className="w-4 h-4 mr-1" />
                            Entrar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="codigo">
            <div className="grid gap-4">
              <div>
                <Input
                  type="text"
                  placeholder="Digite o código do grupo"
                  value={codigoDigitado}
                  onChange={(e) => setCodigoDigitado(e.target.value)}
                />
              </div>

              {(errorMessage || successMessage) && (
                <div className={`p-3 rounded-md ${errorMessage ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {errorMessage || successMessage}
                </div>
              )}

              <Button onClick={verificarEAdicionarGrupo} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Verificando...
                  </>
                ) : 'Entrar no Grupo'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdicionarGrupoModal;<replit_final_file>
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

      // Realizar busca real no banco de dados de códigos de grupos
      const { data, error } = await supabase
        .from('codigos_grupos_estudo')
        .select('*')
        .or(`nome.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%,disciplina.ilike.%${searchTerm}%`)
        .order('data_criacao', { ascending: false })
        .limit(20);

      if (error) {
        console.error("Erro ao buscar grupos na base de dados:", error);
        setErrorMessage("Ocorreu um erro ao buscar grupos. Tente novamente.");
        setIsSearching(false);
        return;
      }

      if (!data || data.length === 0) {
        setGruposEncontrados([]);
        setIsSearching(false);
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
        dataCriacao: grupo.data_criacao,
        tendencia: Math.random() > 0.7 ? "alta" : undefined, // Aleatório por enquanto
        novoConteudo: Math.random() > 0.6, // Aleatório por enquanto
        visibilidade: grupo.privado ? "privado" : "público",
        topico_nome: grupo.topico_nome,
        topico_icon: grupo.topico_icon
      }));

      setGruposEncontrados(gruposEncontrados);
      setIsSearching(false);

      console.log(`Encontrados ${gruposEncontrados.length} grupos relacionados a "${searchTerm}" no banco de dados`);

    } catch (error) {
      console.error("Erro ao buscar grupos:", error);
      setErrorMessage("Ocorreu um erro ao buscar grupos. Tente novamente.");
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

      // Buscar o grupo diretamente na tabela de códigos
      const { data, error } = await supabase
        .from('codigos_grupos_estudo')
        .select('*')
        .eq('codigo', codigoNormalizado)
        .single();

      if (error || !data) {
        console.error("Erro ao verificar código ou código não encontrado:", error);
        setErrorMessage("Código inválido ou expirado. Verifique e tente novamente.");
        setIsVerifyingCode(false);
        return;
      }

      // Buscar informações mais completas do grupo na tabela principal
      const { data: grupoData, error: grupoError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('id', data.grupo_id)
        .single();

      // Se houver erro na busca de dados complementares, usamos os dados da tabela de códigos
      const grupoFinal = !grupoError && grupoData ? grupoData : data;

      // Construir objeto do grupo com os dados obtidos
      const novoGrupo: GrupoEstudo = {
        id: grupoFinal.grupo_id || data.grupo_id,
        nome: grupoFinal.nome || data.nome,
        descricao: grupoFinal.descricao || data.descricao || `Grupo acessado via código ${codigoNormalizado}`,
        membros: grupoFinal.membros || data.membros || 1,
        disciplina: grupoFinal.disciplina || data.disciplina || "Geral",
        cor: grupoFinal.cor || data.cor || "#FF6B00",
        icon: grupoFinal.icon || "🔑",
        dataCriacao: grupoFinal.data_criacao || data.data_criacao || new Date().toISOString(),
        tendencia: grupoFinal.tendencia || undefined,
        novoConteudo: true, // Destacamos como novo
        privado: grupoFinal.privado || data.privado || false,
        visibilidade: (grupoFinal.privado || data.privado) ? "privado" : "público",
        topico_nome: grupoFinal.topico_nome || data.topico_nome,
        topico_icon: grupoFinal.topico_icon || data.topico_icon,
        criador: grupoFinal.user_id || data.user_id
      };

      console.log(`Grupo encontrado via código ${codigoNormalizado}:`, novoGrupo);

      // Adicionar o usuário como membro do grupo (em um cenário real, isso seria persistido no banco de dados)
      // Aqui estamos apenas retornando o grupo para a interface parent
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