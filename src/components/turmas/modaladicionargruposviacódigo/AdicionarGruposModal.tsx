
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Plus, Sparkles, LinkIcon, Users, TrendingUp, BookOpen, AlertCircle, CheckCircle2, Zap } from "lucide-react";
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
  const [inputFocused, setInputFocused] = useState(false);
  const [codigoFocused, setCodigoFocused] = useState(false);

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
            cor: "#FF6B00",
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
            cor: "#FF8C40",
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
            cor: "#E85D04",
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
            cor: "#FF6B00",
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="max-w-2xl w-full rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(255,107,0,0.25)] relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#1E1E1E] to-[#181818] opacity-95 z-0"></div>
            <div className="absolute inset-0 bg-[url('/images/pattern-grid.svg')] bg-repeat opacity-10 z-0"></div>
            
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF6B00] via-[#FF8C40] to-[#FF6B00] opacity-30 blur-md rounded-2xl"></div>
            
            <div className="relative z-10">
              {/* Header com título e botão de fechar */}
              <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-5 flex justify-between items-center border-b border-[#FF6B00]/20">
                <div className="flex items-center">
                  <div className="bg-white/20 p-2 rounded-full mr-3">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Adicionar Grupos de Estudo</h2>
                    <p className="text-white/70 text-sm">Encontre ou adicione novos grupos</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-white/80 hover:text-white hover:bg-white/20 border border-white/20"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Conteúdo do modal */}
              <div className="p-6 max-h-[70vh] overflow-y-auto bg-black/30 backdrop-blur-sm">
                <Tabs defaultValue="pesquisar" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 mb-6 bg-black/20 p-1 rounded-xl border border-white/10">
                    <TabsTrigger 
                      value="pesquisar" 
                      className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white py-2.5"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Pesquisar Grupos
                    </TabsTrigger>
                    <TabsTrigger 
                      value="codigo" 
                      className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white py-2.5"
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Entrar com Código
                    </TabsTrigger>
                  </TabsList>

                  {/* Conteúdo da aba de pesquisa */}
                  <TabsContent value="pesquisar" className="space-y-4">
                    <div className="relative group">
                      <div 
                        className={`absolute inset-0 bg-gradient-to-r from-[#FF6B00]/40 to-[#FF8C40]/40 rounded-xl blur-md transition-opacity duration-300 ${inputFocused ? 'opacity-100' : 'opacity-0'}`}
                      ></div>
                      <div className="relative flex">
                        <Input
                          placeholder="Buscar grupos por nome, tópico ou disciplina..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className={`flex-1 bg-black/40 border-0 focus:ring-2 ring-[#FF6B00]/50 px-4 py-3 h-12 rounded-l-xl text-white placeholder:text-white/50 transition-all duration-300`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') buscarGrupos();
                          }}
                          onFocus={() => setInputFocused(true)}
                          onBlur={() => setInputFocused(false)}
                        />
                        <Button
                          onClick={buscarGrupos}
                          disabled={isSearching || !searchTerm.trim()}
                          className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white h-12 rounded-r-xl px-4 transition-all duration-300 disabled:opacity-50"
                        >
                          {isSearching ? 
                            <div className="w-5 h-5 border-2 border-t-transparent border-white/80 rounded-full animate-spin"></div> : 
                            <Search className="h-5 w-5" />
                          }
                        </Button>
                      </div>
                    </div>

                    {/* Resultados da busca */}
                    {isSearching ? (
                      <div className="py-12 flex flex-col items-center justify-center">
                        <div className="relative w-16 h-16">
                          <div className="absolute inset-0 border-4 border-t-[#FF6B00] border-r-[#FF8C40]/70 border-b-[#FF8C40]/40 border-l-transparent rounded-full animate-spin"></div>
                          <div className="absolute inset-1 border-4 border-t-transparent border-r-transparent border-b-[#FF6B00]/20 border-l-[#FF6B00]/60 rounded-full animate-spin animation-delay-200"></div>
                        </div>
                        <p className="text-white/70 mt-4 font-medium">Buscando grupos interessantes...</p>
                      </div>
                    ) : gruposEncontrados.length > 0 ? (
                      <div className="space-y-5">
                        <div className="text-sm flex items-center justify-between">
                          <span className="text-white/70">{gruposEncontrados.length} grupos encontrados</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#FF6B00] hover:text-[#FF8C40] hover:bg-[#FF6B00]/10 p-0 h-auto"
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
                              className="bg-black/50 hover:bg-black/70 border border-white/10 hover:border-[#FF6B00]/30 rounded-xl p-4 transition-all duration-300 backdrop-blur-sm group"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex gap-3">
                                  <div 
                                    className="h-14 w-14 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,0,0,0.3)] relative overflow-hidden"
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-br" style={{ backgroundColor: grupo.cor }}></div>
                                    <div className="absolute inset-0 bg-black/20"></div>
                                    <span className="text-2xl relative z-10">{grupo.icon || "📚"}</span>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium text-white">{grupo.nome}</h3>
                                      {grupo.novoConteudo && (
                                        <Badge className="bg-[#FF6B00] text-white text-[10px] px-1.5 py-0 h-4">
                                          NOVO
                                        </Badge>
                                      )}
                                      {grupo.tendencia === "alta" && (
                                        <Badge className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white text-[10px] px-1.5 py-0 h-4 flex items-center">
                                          <TrendingUp className="h-3 w-3 mr-0.5" />
                                          EM ALTA
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-white/70 text-sm mt-1">{grupo.descricao}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-white/50">
                                      <span className="flex items-center">
                                        <Users className="h-3 w-3 mr-1" />
                                        {grupo.membros} membros
                                      </span>
                                      <span className="flex items-center">
                                        <BookOpen className="h-3 w-3 mr-1" />
                                        {grupo.disciplina}
                                      </span>
                                      <Badge className={`${grupo.visibilidade === 'público' ? 'bg-[#FF6B00]/20 text-[#FF8C40]' : 'bg-white/10 text-white/70'}`}>
                                        {grupo.visibilidade === 'público' ? 'Público' : 'Privado'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => entrarNoGrupo(grupo)}
                                  className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white text-sm rounded-lg shadow-lg transition-all duration-300 opacity-90 group-hover:opacity-100 group-hover:scale-105"
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
                      <div className="py-10 text-center">
                        <div className="bg-black/40 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <AlertCircle className="h-8 w-8 text-white/40" />
                        </div>
                        <h3 className="text-white font-medium mb-2">Nenhum grupo encontrado</h3>
                        <p className="text-white/60 max-w-md mx-auto">Tente usar outros termos ou crie um novo grupo de estudos.</p>
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0.5 }}
                          animate={{ 
                            scale: [0.9, 1, 0.9], 
                            opacity: [0.5, 1, 0.5] 
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 3,
                            ease: "easeInOut" 
                          }}
                          className="bg-gradient-to-br from-[#FF6B00]/20 to-[#FF8C40]/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4"
                        >
                          <Search className="h-10 w-10 text-[#FF6B00]" />
                        </motion.div>
                        <h3 className="text-white font-medium text-lg mb-2">Descubra comunidades de estudo</h3>
                        <p className="text-white/60 text-sm max-w-md mx-auto">
                          Digite termos relacionados a disciplinas, tópicos ou interesses para encontrar grupos que combinam com seus objetivos.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Conteúdo da aba de código */}
                  <TabsContent value="codigo" className="space-y-5">
                    <div className="bg-gradient-to-b from-black/50 to-black/30 border border-[#FF6B00]/20 rounded-xl p-6 overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF6B00]/20 blur-[60px] opacity-60"></div>
                      <div className="relative z-10">
                        <div className="flex items-start gap-4">
                          <div className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] rounded-full p-3 mt-0.5">
                            <Sparkles className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-medium text-lg mb-2">Código de Acesso Exclusivo</h3>
                            <p className="text-white/70 text-sm">
                              Entre em grupos privados e exclusivos usando o código de convite fornecido por administradores ou outros participantes.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label htmlFor="codigo" className="text-sm text-white/70 flex items-center gap-2">
                        <LinkIcon className="h-3.5 w-3.5" />
                        Digite o código de convite
                      </label>
                      <div className="relative group">
                        <div 
                          className={`absolute inset-0 bg-gradient-to-r from-[#FF6B00]/40 to-[#FF8C40]/40 rounded-xl blur-md transition-opacity duration-300 ${codigoFocused ? 'opacity-100' : 'opacity-0'}`}
                        ></div>
                        <Input
                          id="codigo"
                          placeholder="Ex: ABCD-1234-XYZ9"
                          value={codigo}
                          onChange={(e) => setCodigo(e.target.value)}
                          className="relative bg-black/40 border-0 focus:ring-2 ring-[#FF6B00]/50 px-4 py-3 h-12 rounded-xl text-white placeholder:text-white/50 transition-all duration-300"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') adicionarGrupoViaCodigo();
                          }}
                          onFocus={() => setCodigoFocused(true)}
                          onBlur={() => setCodigoFocused(false)}
                        />
                      </div>
                      <p className="text-white/50 text-xs">Você recebeu um código de 12 caracteres? Digite-o acima para acessar o grupo.</p>
                    </div>

                    <Button
                      onClick={adicionarGrupoViaCodigo}
                      disabled={isVerifyingCode || !codigo.trim()}
                      className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-xl py-3 h-12 transition-all duration-300 disabled:opacity-50 shadow-[0_0_15px_rgba(255,107,0,0.15)]"
                    >
                      {isVerifyingCode ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          <span>Verificando...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2" />
                          <span>Entrar com Código</span>
                        </>
                      )}
                    </Button>

                    {/* Área de informações e estado */}
                    {(errorMessage || successMessage) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg mt-4 flex items-center ${
                          errorMessage
                            ? "bg-red-500/10 border border-red-500/20 text-red-400"
                            : "bg-green-500/10 border border-green-500/20 text-green-400"
                        }`}
                      >
                        {errorMessage ? (
                          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
                        )}
                        <span>{errorMessage || successMessage}</span>
                      </motion.div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AdicionarGruposModal;
