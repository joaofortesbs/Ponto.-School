
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search, Users, Filter, Book, Lock, Globe, AlertCircle } from "lucide-react";
import { listarTodosCodigosGrupos, pesquisarCodigosGrupos } from '@/lib/codigosGruposService';

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
  }, [filtro]);

  // Função para buscar grupos
  const buscarGrupos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let resultado;
      
      if (searchQuery.trim()) {
        resultado = await pesquisarCodigosGrupos(searchQuery);
      } else {
        resultado = await listarTodosCodigosGrupos(50);
      }
      
      if (resultado.success && resultado.data) {
        // Aplicar filtros adicionais
        let gruposFiltrados = resultado.data;
        
        if (filtro === "publicos") {
          gruposFiltrados = gruposFiltrados.filter(g => !g.privado);
        } else if (filtro === "privados") {
          gruposFiltrados = gruposFiltrados.filter(g => g.privado);
        } else if (filtro === "populares") {
          gruposFiltrados = gruposFiltrados.filter(g => g.membros >= 5);
        }
        
        setGrupos(gruposFiltrados);
      } else {
        setError("Não foi possível carregar os grupos. Tente novamente.");
        setGrupos([]);
      }
    } catch (error) {
      console.error("Erro ao buscar grupos:", error);
      setError("Ocorreu um erro ao buscar os grupos. Tente novamente mais tarde.");
      setGrupos([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para pesquisar com delay
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    
    // Usar debounce para não fazer muitas requisições
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    window.searchTimeout = setTimeout(() => {
      buscarGrupos();
    }, 300);
  };

  // Função para selecionar um grupo
  const handleSelectGrupo = (codigo: string) => {
    onSelectGrupo(codigo);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-[#0F172A] dark:bg-[#0F172A] rounded-xl overflow-hidden w-[700px] max-w-full shadow-xl relative"
        >
          <div className="sticky top-0 z-10 bg-gradient-to-r from-[#0F172A] to-[#0F172A] border-b border-[#1E293B] p-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Search className="h-6 w-6 mr-3 text-[#FF6B00]" />
                Encontrar Grupos de Estudo
              </h2>
              <p className="text-white/70 text-sm mt-1">
                Busque e encontre grupos para participar em nossa plataforma
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
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Pesquisar por nome, disciplina ou descrição..."
                  className="w-full pl-10 border-[#1E293B] bg-[#0F172A] text-white placeholder:text-gray-500 focus:border-[#FF6B00]"
                />
              </div>
            </div>
            
            {/* Filtros */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <Button
                size="sm"
                variant={filtro === "todos" ? "default" : "outline"}
                className={filtro === "todos" ? "bg-[#FF6B00] text-white" : "border-[#1E293B] text-white hover:bg-[#1E293B]/50"}
                onClick={() => setFiltro("todos")}
              >
                <Globe className="h-4 w-4 mr-1" />
                Todos
              </Button>
              <Button
                size="sm"
                variant={filtro === "publicos" ? "default" : "outline"}
                className={filtro === "publicos" ? "bg-[#FF6B00] text-white" : "border-[#1E293B] text-white hover:bg-[#1E293B]/50"}
                onClick={() => setFiltro("publicos")}
              >
                <Globe className="h-4 w-4 mr-1" />
                Públicos
              </Button>
              <Button
                size="sm"
                variant={filtro === "privados" ? "default" : "outline"}
                className={filtro === "privados" ? "bg-[#FF6B00] text-white" : "border-[#1E293B] text-white hover:bg-[#1E293B]/50"}
                onClick={() => setFiltro("privados")}
              >
                <Lock className="h-4 w-4 mr-1" />
                Privados
              </Button>
              <Button
                size="sm"
                variant={filtro === "populares" ? "default" : "outline"}
                className={filtro === "populares" ? "bg-[#FF6B00] text-white" : "border-[#1E293B] text-white hover:bg-[#1E293B]/50"}
                onClick={() => setFiltro("populares")}
              >
                <Users className="h-4 w-4 mr-1" />
                Populares
              </Button>
            </div>

            {/* Lista de grupos */}
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {grupos.length > 0 ? (
                  grupos.map((grupo) => (
                    <div 
                      key={grupo.codigo}
                      className="bg-[#1E293B]/50 rounded-lg p-4 border border-[#1E293B] hover:border-[#FF6B00]/50 transition-colors cursor-pointer flex justify-between items-center"
                      onClick={() => handleSelectGrupo(grupo.codigo)}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-10 w-10 rounded-md flex items-center justify-center text-white"
                          style={{ backgroundColor: grupo.cor || '#FF6B00' }}
                        >
                          {grupo.privado ? 
                            <Lock className="h-5 w-5" /> : 
                            <Book className="h-5 w-5" />
                          }
                        </div>
                        <div>
                          <h3 className="text-white font-medium line-clamp-1">{grupo.nome}</h3>
                          <div className="flex items-center gap-3 text-gray-400 text-xs mt-1">
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {grupo.membros || 1} {grupo.membros === 1 ? 'membro' : 'membros'}
                            </span>
                            
                            {grupo.disciplina && (
                              <span className="flex items-center">
                                <Book className="h-3 w-3 mr-1" />
                                {grupo.disciplina}
                              </span>
                            )}
                            
                            <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                              {grupo.codigo}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectGrupo(grupo.codigo);
                        }}
                      >
                        Entrar
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="bg-[#1E293B]/50 rounded-lg p-8 border border-[#1E293B] text-center">
                    <Search className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                    <h3 className="text-white font-medium">Nenhum grupo encontrado</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchQuery ? 
                        `Não encontramos grupos com "${searchQuery}". Tente outra pesquisa.` : 
                        "Não há grupos disponíveis com os filtros selecionados."
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start">
                <AlertCircle className="text-red-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <Button
                type="button"
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
