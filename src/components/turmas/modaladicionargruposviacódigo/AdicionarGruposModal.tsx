
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Plus, Sparkles, LinkIcon, Users, TrendingUp } from "lucide-react";
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
      
      // Simular chamada ao backend para buscar grupos
      // Em produção, isso seria substituído por uma chamada real à API ou Supabase
      
      setTimeout(() => {
        // Dados simulados para demonstração
        const gruposSimulados: GrupoEstudo[] = [
          {
            id: `search-result-1-${Date.now()}`,
            nome: `Grupo de ${searchTerm} Avançado`,
            descricao: `Grupo dedicado ao estudo avançado de ${searchTerm}`,
            membros: Math.floor(Math.random() * 20) + 3,
            disciplina: "Diversas",
            cor: "#3B82F6",
            icon: "📚",
            dataCriacao: new Date().toISOString(),
            tendencia: Math.random() > 0.5 ? "alta" : undefined,
            novoConteudo: Math.random() > 0.7,
            visibilidade: "público"
          },
          {
            id: `search-result-2-${Date.now()}`,
            nome: `Estudos de ${searchTerm}`,
            descricao: `Grupo colaborativo para estudar ${searchTerm} e temas relacionados`,
            membros: Math.floor(Math.random() * 15) + 2,
            disciplina: "Matemática",
            cor: "#10B981",
            icon: "🧮",
            dataCriacao: new Date().toISOString(),
            tendencia: Math.random() > 0.7 ? "alta" : undefined,
            novoConteudo: Math.random() > 0.6,
            visibilidade: "privado"
          },
          {
            id: `search-result-3-${Date.now()}`,
            nome: `${searchTerm} para Iniciantes`,
            descricao: `Grupo de estudo para quem está começando em ${searchTerm}`,
            membros: Math.floor(Math.random() * 10) + 5,
            disciplina: "Física",
            cor: "#F59E0B",
            icon: "⚛️",
            dataCriacao: new Date().toISOString(),
            tendencia: Math.random() > 0.6 ? "alta" : undefined,
            novoConteudo: Math.random() > 0.5,
            visibilidade: "público"
          }
        ];
        
        setGruposEncontrados(gruposSimulados);
        setIsSearching(false);
      }, 1000);
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

      // Verificar se o código existe
      const codigoExiste = await verificarSeCodigoExiste(codigo.trim());
      
      if (codigoExiste) {
        // Simulação de obtenção dos dados do grupo
        setTimeout(() => {
          const novoGrupo: GrupoEstudo = {
            id: `grupo-codigo-${Date.now()}`,
            nome: `Grupo via Código ${codigo.substring(0, 4)}`,
            descricao: "Grupo adicionado via código de convite",
            membros: Math.floor(Math.random() * 15) + 2,
            cor: "#8B5CF6",
            icon: "🔑",
            dataCriacao: new Date().toISOString(),
            tendencia: Math.random() > 0.7 ? "alta" : undefined,
            novoConteudo: true,
            visibilidade: "privado",
            disciplina: "Especializado"
          };
          
          onGrupoAdicionado(novoGrupo);
          setSuccessMessage("Grupo adicionado com sucesso!");
          setCodigo("");
          setIsVerifyingCode(false);
        }, 1500);
      } else {
        setErrorMessage("Código inválido ou expirado. Verifique e tente novamente.");
        setIsVerifyingCode(false);
      }
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-gradient-to-b from-gray-900 to-gray-800 dark:from-gray-900 dark:to-gray-800 rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl border border-white/10 relative"
          >
            {/* Header com título e botão de fechar */}
            <div className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] p-5 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Adicionar Grupos de Estudo
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-white/80 hover:text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Conteúdo do modal */}
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              <Tabs defaultValue="pesquisar" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-6 bg-gray-800/50 p-1 rounded-lg">
                  <TabsTrigger 
                    value="pesquisar" 
                    className="rounded-md data-[state=active]:bg-[#3B82F6] data-[state=active]:text-white"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Pesquisar Grupos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="codigo" 
                    className="rounded-md data-[state=active]:bg-[#8B5CF6] data-[state=active]:text-white"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Entrar com Código
                  </TabsTrigger>
                </TabsList>

                {/* Conteúdo da aba de pesquisa */}
                <TabsContent value="pesquisar" className="space-y-4">
                  <div className="relative">
                    <Input
                      placeholder="Buscar grupos por nome, tópico ou disciplina..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-gray-800/30 border-gray-700 focus:border-[#3B82F6] px-4 py-2 rounded-xl pr-10"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') buscarGrupos();
                      }}
                    />
                    <Button
                      onClick={buscarGrupos}
                      disabled={isSearching || !searchTerm.trim()}
                      className="absolute right-1 top-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg p-1 h-8 w-8"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Resultados da busca */}
                  {isSearching ? (
                    <div className="py-8 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 border-4 border-t-[#3B82F6] border-b-[#3B82F6] border-r-transparent border-l-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-gray-400">Buscando grupos...</p>
                    </div>
                  ) : gruposEncontrados.length > 0 ? (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-400 flex items-center justify-between">
                        <span>{gruposEncontrados.length} grupos encontrados</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#3B82F6] hover:text-[#2563EB] hover:bg-[#3B82F6]/10 p-0 h-auto"
                          onClick={() => setGruposEncontrados([])}
                        >
                          Limpar resultados
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {gruposEncontrados.map((grupo) => (
                          <motion.div
                            key={grupo.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-[#3B82F6]/30 rounded-xl p-4 transition-all duration-300"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex gap-3">
                                <div 
                                  className="h-12 w-12 rounded-lg flex items-center justify-center text-white shadow-lg" 
                                  style={{ backgroundColor: grupo.cor }}
                                >
                                  <span className="text-xl">{grupo.icon || "📚"}</span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-white">{grupo.nome}</h3>
                                    {grupo.novoConteudo && (
                                      <Badge className="bg-[#3B82F6] text-white text-[10px] px-1.5 py-0 h-4">
                                        NOVO
                                      </Badge>
                                    )}
                                    {grupo.tendencia === "alta" && (
                                      <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0 h-4 flex items-center">
                                        <TrendingUp className="h-3 w-3 mr-0.5" />
                                        EM ALTA
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-gray-400 text-sm mt-1">{grupo.descricao}</p>
                                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                    <span className="flex items-center">
                                      <Users className="h-3 w-3 mr-1" />
                                      {grupo.membros} membros
                                    </span>
                                    <span>{grupo.disciplina}</span>
                                    <Badge className={`${grupo.visibilidade === 'público' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                      {grupo.visibilidade === 'público' ? 'Público' : 'Privado'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <Button
                                onClick={() => entrarNoGrupo(grupo)}
                                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm rounded-lg shadow-sm"
                                size="sm"
                              >
                                <Plus className="h-4 w-4 mr-1" /> 
                                Entrar
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : searchTerm.trim() !== "" ? (
                    <div className="py-8 text-center">
                      <p className="text-gray-400">Nenhum grupo encontrado. Tente outros termos.</p>
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <Search className="h-10 w-10 mx-auto text-[#3B82F6]/50 mb-3" />
                      <h3 className="text-white font-medium mb-2">Busque por grupos interessantes</h3>
                      <p className="text-gray-400 text-sm max-w-md mx-auto">
                        Digite termos como disciplinas, tópicos ou nomes de grupos para encontrar comunidades de estudo ativas.
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Conteúdo da aba de código */}
                <TabsContent value="codigo" className="space-y-4">
                  <div className="bg-gradient-to-r from-[#8B5CF6]/10 to-[#D946EF]/10 border border-[#8B5CF6]/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-[#8B5CF6]/20 rounded-full p-2 mt-0.5">
                        <Sparkles className="h-5 w-5 text-[#8B5CF6]" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium mb-1">Código de Convite</h3>
                        <p className="text-gray-400 text-sm">
                          Entre em grupos privados usando um código de convite fornecido por um administrador ou participante.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="codigo" className="text-sm text-gray-400">
                      Digite o código de convite
                    </label>
                    <div className="relative">
                      <Input
                        id="codigo"
                        placeholder="Ex: ABCD-1234-XYZ9"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        className="bg-gray-800/30 border-gray-700 focus:border-[#8B5CF6] px-4 py-2 rounded-xl"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') adicionarGrupoViaCodigo();
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={adicionarGrupoViaCodigo}
                    disabled={isVerifyingCode || !codigo.trim()}
                    className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl py-2 mt-2"
                  >
                    {isVerifyingCode ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Verificando...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Entrar com Código
                      </>
                    )}
                  </Button>

                  {/* Área de informações e estado */}
                  {(errorMessage || successMessage) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg mt-4 ${
                        errorMessage
                          ? "bg-red-500/10 border border-red-500/20 text-red-400"
                          : "bg-green-500/10 border border-green-500/20 text-green-400"
                      }`}
                    >
                      {errorMessage || successMessage}
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
