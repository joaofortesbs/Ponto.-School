
import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { X, Search, Globe, BookOpen, Users } from "lucide-react";

interface DeepSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (query: string, options: SearchOptions) => void;
}

export interface SearchOptions {
  webGlobal: boolean;
  academic: boolean;
  social: boolean;
  deepSearch: boolean;
}

const DeepSearchModal: React.FC<DeepSearchModalProps> = ({
  open,
  onOpenChange,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    webGlobal: true,
    academic: true,
    social: false,
    deepSearch: false
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery, searchOptions);
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 bg-[#111827] border-[#1f2937] text-white rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#1a202c] to-[#1f2937]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#3b82f6]">
              <Search className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">DeepSearch™</h2>
              <p className="text-sm text-gray-400">Powered by advanced AI</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 rounded-full hover:bg-white/10"
          >
            <X className="h-5 w-5 text-gray-400" />
          </Button>
        </div>

        <div className="p-4">
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="O que você deseja pesquisar?"
              className="pl-10 pr-4 py-2 bg-[#1f2937] border-[#374151] text-white placeholder-gray-500 rounded-md"
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>

          <div className="mb-2">
            <h3 className="text-sm font-medium text-blue-400 border-l-2 border-blue-500 pl-2 mb-3">
              Fontes de Pesquisa
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#1e293b]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#3b82f6]/20">
                    <Globe className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Web Global</p>
                    <p className="text-xs text-gray-400">Resultados da internet mundial</p>
                  </div>
                </div>
                <Switch
                  checked={searchOptions.webGlobal}
                  onCheckedChange={(checked) =>
                    setSearchOptions({ ...searchOptions, webGlobal: checked })
                  }
                  className="data-[state=checked]:bg-blue-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#372d53]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#a855f7]/20">
                    <BookOpen className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Acadêmico</p>
                    <p className="text-xs text-gray-400">Artigos científicos e pesquisas</p>
                  </div>
                </div>
                <Switch
                  checked={searchOptions.academic}
                  onCheckedChange={(checked) =>
                    setSearchOptions({ ...searchOptions, academic: checked })
                  }
                  className="data-[state=checked]:bg-purple-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#1e3a2f]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#10b981]/20">
                    <Users className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Social</p>
                    <p className="text-xs text-gray-400">Discussões e opiniões da comunidade</p>
                  </div>
                </div>
                <Switch
                  checked={searchOptions.social}
                  onCheckedChange={(checked) =>
                    setSearchOptions({ ...searchOptions, social: checked })
                  }
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-orange-400 flex items-center gap-2">
                <span className="text-orange-500">⚡</span> Profundidade da Busca
              </h3>
              <span className={`text-xs px-2 py-1 rounded-full ${searchOptions.deepSearch ? "bg-orange-500/20 text-orange-400" : "bg-gray-700 text-gray-400"}`}>
                {searchOptions.deepSearch ? "Profunda" : "Padrão"}
              </span>
            </div>

            <div className="mt-2 p-3 rounded-lg bg-[#1e2734]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Padrão</span>
                <span className="text-xs text-gray-500">Profunda</span>
              </div>
              <div className="relative flex items-center">
                <Switch
                  checked={searchOptions.deepSearch}
                  onCheckedChange={(checked) =>
                    setSearchOptions({ ...searchOptions, deepSearch: checked })
                  }
                  className="data-[state=checked]:bg-orange-500"
                />
              </div>
              <p className="text-xs text-gray-400 mt-3 italic">
                A busca profunda analisa fontes extensas e realiza conexões complexas entre diferentes conteúdos.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeepSearchModal;
