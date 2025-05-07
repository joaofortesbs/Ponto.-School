
import React, { useState } from "react";
import { X, Search } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";

interface DeepSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string, options: DeepSearchOptions) => void;
}

interface DeepSearchOptions {
  webGlobal: boolean;
  academico: boolean;
  social: boolean;
  searchDepth: "padrão" | "profunda";
}

const DeepSearchModal: React.FC<DeepSearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOptions, setSearchOptions] = useState<DeepSearchOptions>({
    webGlobal: true,
    academico: true,
    social: false,
    searchDepth: "padrão",
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Pesquisa vazia",
        description: "Por favor, digite algo para pesquisar.",
        duration: 3000,
      });
      return;
    }

    if (!searchOptions.webGlobal && !searchOptions.academico && !searchOptions.social) {
      toast({
        title: "Nenhuma fonte selecionada",
        description: "Por favor, selecione pelo menos uma fonte de pesquisa.",
        duration: 3000,
      });
      return;
    }

    onSearch(searchQuery, searchOptions);
    onClose();
  };

  const toggleSearchOption = (option: keyof DeepSearchOptions) => {
    if (typeof searchOptions[option] === "boolean") {
      setSearchOptions(prev => ({
        ...prev,
        [option]: !prev[option],
      }));
    }
  };

  const toggleSearchDepth = () => {
    setSearchOptions(prev => ({
      ...prev,
      searchDepth: prev.searchDepth === "padrão" ? "profunda" : "padrão",
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#0F1729] border-[#1D2739] p-0 overflow-hidden text-white">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">DeepSearch™</h2>
                <p className="text-xs text-gray-400">Powered by advanced AI</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="O que você deseja pesquisar?"
              className="w-full bg-[#1A2234] text-white placeholder-gray-400 rounded-md py-2 pl-10 pr-3 border border-[#2A3548] focus:outline-none focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>

          <div>
            <h3 className="font-semibold text-sm text-blue-400 mb-2">Fontes de Pesquisa</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-[#131D32] rounded-lg border border-[#1D2739]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-600/20 rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 text-blue-400">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">Web Global</h4>
                    <p className="text-xs text-gray-400">Resultados da internet mundial</p>
                  </div>
                </div>
                <Switch
                  checked={searchOptions.webGlobal}
                  onCheckedChange={() => toggleSearchOption("webGlobal")}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-[#131D32] rounded-lg border border-[#1D2739]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-purple-600/20 rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 text-purple-400">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">Acadêmico</h4>
                    <p className="text-xs text-gray-400">Artigos científicos e pesquisas</p>
                  </div>
                </div>
                <Switch
                  checked={searchOptions.academico}
                  onCheckedChange={() => toggleSearchOption("academico")}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-[#131D32] rounded-lg border border-[#1D2739]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-green-600/20 rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 text-green-400">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">Social</h4>
                    <p className="text-xs text-gray-400">Discussões e opiniões da comunidade</p>
                  </div>
                </div>
                <Switch
                  checked={searchOptions.social}
                  onCheckedChange={() => toggleSearchOption("social")}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-orange-400">Profundidade da Busca</h3>
              <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full">
                {searchOptions.searchDepth === "profunda" ? "Profunda" : "Padrão"}
              </span>
            </div>
            
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-400">Padrão</span>
              <Switch
                checked={searchOptions.searchDepth === "profunda"}
                onCheckedChange={toggleSearchDepth}
                className="data-[state=checked]:bg-orange-500"
              />
              <span className="text-sm text-gray-400">Profunda</span>
            </div>
            
            <p className="text-xs text-gray-400 mt-2 italic">
              A busca profunda analisa fontes extensas e realiza conexões complexas entre diferentes conteúdos.
            </p>
          </div>

          <button
            onClick={handleSearch}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-colors mt-2"
          >
            Pesquisar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeepSearchModal;
