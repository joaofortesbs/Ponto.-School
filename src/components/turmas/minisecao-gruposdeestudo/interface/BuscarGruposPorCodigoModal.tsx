
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  X, Search, Users, Filter, Book, Lock, Globe, 
  AlertCircle, User, Info, Clock, Check, ChevronRight
} from "lucide-react";
import { listarTodosCodigosGrupos, pesquisarCodigosGrupos } from '@/lib/codigosGruposService';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BuscarGruposPorCodigoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGrupo: (codigo: string) => void;
}

const BuscarGruposPorCodigoModal: React.FC<BuscarGruposPorCodigoModalProps> = ({
  isOpen,
  onClose,
  onSelectGrupo
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<string>("todos");
  const [activeTab, setActiveTab] = useState("populares");

  // Buscar grupos quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      buscarGrupos();
    }
  }, [isOpen]);

  // Buscar grupos quando o filtro mudar
  useEffect(() => {
    if (isOpen) {
      buscarGrupos();
    }
  }, [filtro, activeTab]);

  const buscarGrupos = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let resultado;

      if (searchQuery.trim()) {
        resultado = await pesquisarCodigosGrupos(searchQuery.trim());
      } else {
        resultado = await listarTodosCodigosGrupos(50);
      }

      if (resultado.success && resultado.data) {
        // Aplicar filtros
        let gruposFiltrados = resultado.data;

        if (filtro === "publicos") {
          gruposFiltrados = gruposFiltrados.filter((g: any) => !g.privado);
        } else if (filtro === "privados") {
          gruposFiltrados = gruposFiltrados.filter((g: any) => g.privado);
        }

        // Ordenação baseada na aba ativa
        if (activeTab === "populares") {
          gruposFiltrados.sort((a: any, b: any) => (b.membros || 0) - (a.membros || 0));
        } else if (activeTab === "recentes") {
          // Assumimos que há um campo implícito de data_criacao nos objetos
          gruposFiltrados.sort((a: any, b: any) => 
            new Date(b.data_criacao || 0).getTime() - new Date(a.data_criacao || 0).getTime());
        }

        setGrupos(gruposFiltrados);
      } else {
        setError("Não foi possível carregar a lista de grupos.");
        console.error("Erro ao buscar grupos:", resultado.error);
      }
    } catch (err) {
      setError("Ocorreu um erro ao carregar os grupos. Tente novamente mais tarde.");
      console.error("Erro na busca de grupos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    buscarGrupos();
  };

  const handleSelectGrupo = (codigo: string) => {
    onSelectGrupo(codigo);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      buscarGrupos();
    }
  };

  // Limpar ao fechar modal
  React.useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const renderBadgeVisibilidade = (grupo: any) => {
    if (grupo.privado) {
      return (
        <Badge variant="outline" className="flex items-center gap-1 bg-red-500/10 text-red-600 border-red-200 dark:border-red-800">
          <Lock className="h-3 w-3" />
          Privado
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="flex items-center gap-1 bg-green-500/10 text-green-600 border-green-200 dark:border-green-800">
        <Globe className="h-3 w-3" />
        Público
      </Badge>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-[#0F172A] dark:bg-[#0F172A] rounded-xl overflow-hidden w-full max-w-2xl shadow-xl relative"
        >
          <div className="sticky top-0 z-10 bg-gradient-to-r from-[#0F172A] to-[#0F172A] border-b border-[#1E293B] p-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Search className="h-6 w-6 mr-3 text-[#FF6B00]" />
                Explorar Grupos de Estudo
              </h2>
              <p className="text-white/70 text-sm mt-1">
                Encontre grupos de estudo por tema, disciplina ou usando o código único
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-9 w-9 rounded-full text-white/80 hover:text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-6">
            {/* Barra de pesquisa */}
            <div className="relative mb-6">
              <div className="flex">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Busque por nome, disciplina ou código"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10 pr-4 py-2 border-[#1E293B] bg-[#0F172A]/80 text-white placeholder:text-gray-500 w-full"
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  className="ml-2 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>

            {/* Filtros e Abas */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={filtro === "todos" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltro("todos")}
                  className={filtro === "todos" ? "bg-[#FF6B00] hover:bg-[#FF6B00]/90" : "border-[#1E293B] text-white hover:bg-[#1E293B]"}
                >
                  <Filter className="h-3.5 w-3.5 mr-1" />
                  Todos
                </Button>
                <Button
                  variant={filtro === "publicos" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltro("publicos")}
                  className={filtro === "publicos" ? "bg-[#FF6B00] hover:bg-[#FF6B00]/90" : "border-[#1E293B] text-white hover:bg-[#1E293B]"}
                >
                  <Globe className="h-3.5 w-3.5 mr-1" />
                  Públicos
                </Button>
                <Button
                  variant={filtro === "privados" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltro("privados")}
                  className={filtro === "privados" ? "bg-[#FF6B00] hover:bg-[#FF6B00]/90" : "border-[#1E293B] text-white hover:bg-[#1E293B]"}
                >
                  <Lock className="h-3.5 w-3.5 mr-1" />
                  Privados
                </Button>
              </div>
            </div>

            {/* Abas Populares/Recentes */}
            <Tabs defaultValue="populares" className="mb-4" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-[#1E293B]/30 border border-[#1E293B] p-1">
                <TabsTrigger 
                  value="populares" 
                  className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white"
                >
                  <Users className="h-4 w-4 mr-1" />
                  Mais Populares
                </TabsTrigger>
                <TabsTrigger 
                  value="recentes" 
                  className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white"
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Mais Recentes
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Mensagem de carregamento */}
            {isLoading && (
              <div className="text-center py-8">
                <div className="h-8 w-8 border-4 border-[#FF6B00]/30 border-t-[#FF6B00] rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/70">Buscando grupos de estudo...</p>
              </div>
            )}

            {/* Mensagem de erro */}
            {error && !isLoading && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start">
                <AlertCircle className="text-red-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {/* Lista de grupos */}
            {!isLoading && !error && grupos.length > 0 && (
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                {grupos.map((grupo, idx) => (
                  <div 
                    key={`${grupo.codigo}-${idx}`}
                    className="bg-[#1E293B]/40 hover:bg-[#1E293B]/60 border border-[#1E293B] rounded-lg p-4 transition-colors cursor-pointer"
                    onClick={() => handleSelectGrupo(grupo.codigo)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-1 flex items-center gap-2">
                          {grupo.nome}
                          {grupo.membros > 5 && (
                            <Badge className="bg-[#FF6B00] text-white text-xs">Popular</Badge>
                          )}
                        </h3>
                        
                        <p className="text-white/60 text-sm mb-3 line-clamp-2">
                          {grupo.descricao || "Sem descrição disponível"}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 items-center">
                          {renderBadgeVisibilidade(grupo)}
                          
                          {grupo.disciplina && (
                            <Badge variant="outline" className="flex items-center gap-1 bg-blue-500/10 text-blue-400 border-blue-200/30">
                              <Book className="h-3 w-3" />
                              {grupo.disciplina}
                            </Badge>
                          )}
                          
                          <Badge variant="outline" className="flex items-center gap-1 bg-purple-500/10 text-purple-400 border-purple-200/30">
                            <Users className="h-3 w-3" />
                            {grupo.membros || 1} {grupo.membros === 1 ? 'membro' : 'membros'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <div className="font-mono bg-[#0F172A] text-[#FF6B00] px-3 py-1 rounded-md text-sm tracking-wider mb-2">
                          {grupo.codigo}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-white/70 hover:text-white hover:bg-[#FF6B00]/20"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Estado vazio */}
            {!isLoading && !error && grupos.length === 0 && (
              <div className="text-center py-10 border border-dashed border-[#1E293B] rounded-lg bg-[#1E293B]/20">
                <Search className="h-12 w-12 mx-auto text-gray-500 mb-3" />
                <h3 className="text-lg font-medium text-white">
                  Nenhum grupo encontrado
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">
                  Não encontramos grupos de estudo com os critérios informados. Tente uma busca diferente ou crie seu próprio grupo!
                </p>
              </div>
            )}

            {/* Rodapé do modal */}
            <div className="mt-6 pt-4 border-t border-[#1E293B] flex items-center justify-between">
              <div className="text-sm text-white/60 flex items-center">
                <Info className="h-4 w-4 mr-1" />
                Use o código de um grupo para entrar diretamente
              </div>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="border-[#1E293B] text-white hover:bg-[#1E293B] hover:text-white"
              >
                Fechar
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BuscarGruposPorCodigoModal;
