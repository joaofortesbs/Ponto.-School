import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { buscarGruposPorTermo, buscarCodigoGrupo, CodigoGrupo } from "@/lib/codigosGruposService";
import { EntrarGrupoPorCodigoModal } from "../EntrarGrupoPorCodigoModal";

interface AdicionarGruposModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdicionarGruposModal: React.FC<AdicionarGruposModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CodigoGrupo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<CodigoGrupo | null>(null);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  // Efeito para buscar grupos quando o termo de pesquisa mudar
  useEffect(() => {
    const fetchGroups = async () => {
      if (searchTerm.trim() === "") {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Se o termo parece ser um código (6-7 caracteres alfanuméricos), tenta buscar diretamente
        if (/^[A-Za-z0-9]{6,7}$/.test(searchTerm)) {
          const grupo = await buscarCodigoGrupo(searchTerm);
          if (grupo) {
            setSearchResults([grupo]);
          } else {
            // Se não encontrou pelo código exato, busca por termos
            const grupos = await buscarGruposPorTermo(searchTerm);
            setSearchResults(grupos);
          }
        } else {
          // Busca normal por termos
          const grupos = await buscarGruposPorTermo(searchTerm);
          setSearchResults(grupos);
        }
      } catch (err) {
        console.error("Erro ao buscar grupos:", err);
        setError("Ocorreu um erro ao buscar grupos. Tente novamente.");
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce para a busca
    const timer = setTimeout(() => {
      if (searchTerm.trim() !== "") {
        fetchGroups();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setError(null);
  };

  const handleGroupSelect = (grupo: CodigoGrupo) => {
    setSelectedGroup(grupo);
    setJoinModalOpen(true);
  };

  const handleCloseJoinModal = () => {
    setJoinModalOpen(false);
    setSelectedGroup(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-[#0F172A] text-white border-[#1E293B]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Buscar Grupos</DialogTitle>
            <DialogDescription className="text-gray-400">
              Encontre grupos de estudo por nome, descrição ou código
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="relative">
              <Input
                placeholder="Digite o nome do grupo ou código..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="bg-[#1E293B] border-[#334155] text-white placeholder:text-gray-500 pr-10"
              />
              {searchTerm && (
                <button 
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {isLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#FF6B00]" />
              </div>
            )}

            {error && !isLoading && (
              <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {!isLoading && !error && searchResults.length === 0 && searchTerm && (
              <div className="bg-[#1E293B] rounded-lg p-6 text-center">
                <Search className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">Nenhum grupo encontrado com este termo</p>
                <p className="text-sm text-gray-500 mt-1">Tente outro termo ou código</p>
              </div>
            )}

            {!isLoading && searchResults.length > 0 && (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {searchResults.map((grupo) => (
                  <div 
                    key={grupo.id}
                    className="bg-[#1E293B] border border-[#334155] rounded-lg p-4 hover:bg-[#263548] transition-colors cursor-pointer"
                    onClick={() => handleGroupSelect(grupo)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-white">{grupo.nome_grupo}</h3>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{grupo.descricao}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="bg-[#334155] text-xs px-2 py-1 rounded text-gray-300">
                            Código: {grupo.codigo}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10 hover:text-[#FF8C40]"
                      >
                        Entrar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-between">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-[#1E293B]"
            >
              Cancelar
            </Button>

            <Button 
              onClick={() => setJoinModalOpen(true)}
              className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
            >
              Entrar com Código
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {joinModalOpen && (
        <EntrarGrupoPorCodigoModal 
          isOpen={joinModalOpen} 
          onClose={handleCloseJoinModal}
          preselectedCode={selectedGroup?.codigo || ""}
        />
      )}
    </>
  );
};

export default AdicionarGruposModal;