import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Loader2 } from "lucide-react";
import { buscarGruposPorTermo, CodigoGrupo } from "@/lib/codigosGruposService";

interface BuscarGruposPorCodigoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCodigo: (codigo: string) => void;
}

const BuscarGruposPorCodigoModal: React.FC<BuscarGruposPorCodigoModalProps> = ({
  isOpen,
  onClose,
  onSelectCodigo,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CodigoGrupo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      if (searchTerm.trim() === "") {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const grupos = await buscarGruposPorTermo(searchTerm);
        setSearchResults(grupos);
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
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleSelectGrupo = (codigo: string) => {
    onSelectCodigo(codigo);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#0F172A] text-white border-[#1E293B]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Buscar Grupos de Estudo</DialogTitle>
          <DialogDescription className="text-gray-400">
            Encontre grupos por nome ou descrição
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Input
              placeholder="Digite o nome do grupo..."
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
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-[#FF6B00]" />
            </div>
          )}

          {error && !isLoading && (
            <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-3 flex items-center gap-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {!isLoading && !error && searchResults.length === 0 && searchTerm && (
            <div className="py-6 text-center">
              <Search className="h-6 w-6 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400">Nenhum grupo encontrado com este termo</p>
            </div>
          )}

          {!isLoading && searchResults.length > 0 && (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {searchResults.map((grupo) => (
                <div 
                  key={grupo.id}
                  className="bg-[#1E293B] border border-[#334155] rounded-lg p-3 hover:bg-[#263548] transition-colors cursor-pointer"
                  onClick={() => handleSelectGrupo(grupo.codigo)}
                >
                  <div className="flex flex-col">
                    <h3 className="font-medium text-white">{grupo.nome_grupo}</h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{grupo.descricao}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="bg-[#334155] text-xs px-2 py-0.5 rounded text-gray-300">
                        {grupo.codigo}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuscarGruposPorCodigoModal;