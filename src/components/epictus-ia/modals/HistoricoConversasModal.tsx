
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Clock, Search, Trash2, ArrowUpDown, Calendar } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Conversation {
  id: string;
  title: string;
  preview: string;
  date: Date;
  messageCount: number;
}

interface HistoricoConversasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HistoricoConversasModal: React.FC<HistoricoConversasModalProps> = ({
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);

  // Simular carregamento de conversas do localStorage ou de uma API
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulação de dados - em uma implementação real, estes viriam do localStorage ou de uma API
      setTimeout(() => {
        const mockConversations = [
          {
            id: "conv1",
            title: "Ajuda com matemática",
            preview: "Como resolver equações de segundo grau?",
            date: new Date(2023, 8, 15),
            messageCount: 8
          },
          {
            id: "conv2",
            title: "Dúvidas sobre física",
            preview: "Poderia explicar a lei de conservação de energia?",
            date: new Date(2023, 8, 20),
            messageCount: 12
          },
          {
            id: "conv3",
            title: "Revisão de redação",
            preview: "Poderia revisar essa redação sobre meio ambiente?",
            date: new Date(2023, 9, 5),
            messageCount: 6
          }
        ];
        setConversations(mockConversations);
        setIsLoading(false);
      }, 800);
    }
  }, [isOpen]);

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };

  const handleSortChange = (sort: "date" | "title") => {
    if (sortBy === sort) {
      toggleSortDirection();
    } else {
      setSortBy(sort);
      setSortDirection("desc");
    }
  };

  const sortedConversations = [...conversations].sort((a, b) => {
    if (sortBy === "date") {
      return sortDirection === "asc" 
        ? a.date.getTime() - b.date.getTime() 
        : b.date.getTime() - a.date.getTime();
    } else {
      return sortDirection === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
  });

  const filteredConversations = sortedConversations.filter(
    conv => 
      conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-4/5 max-w-4xl mx-auto bg-gradient-to-b from-[#0c2341]/95 to-[#0f3562]/95 text-white border border-white/10 rounded-xl shadow-xl backdrop-blur-lg">
        <DialogHeader className="border-b border-white/10 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Clock className="h-5 w-5" />
            Histórico de Conversas
          </DialogTitle>
          <div className="flex items-center mt-4 gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input 
                placeholder="Pesquisar nas conversas..."
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/60 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className={`bg-white/5 border-white/10 text-white hover:bg-white/10 ${sortBy === "date" ? "ring-1 ring-blue-400" : ""}`}
                onClick={() => handleSortChange("date")}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Data {sortBy === "date" && (sortDirection === "asc" ? "↑" : "↓")}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className={`bg-white/5 border-white/10 text-white hover:bg-white/10 ${sortBy === "title" ? "ring-1 ring-blue-400" : ""}`}
                onClick={() => handleSortChange("title")}
              >
                <ArrowUpDown className="h-4 w-4 mr-1" />
                Título {sortBy === "title" && (sortDirection === "asc" ? "↑" : "↓")}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] mt-4 pr-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex space-x-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
                <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
              </div>
              <p className="text-white/60">Carregando histórico...</p>
            </div>
          ) : filteredConversations.length > 0 ? (
            <div className="grid gap-3">
              {filteredConversations.map((conv) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/5 rounded-lg border border-white/10 p-4 hover:bg-white/10 cursor-pointer group transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-white group-hover:text-blue-300 transition-colors">{conv.title}</h3>
                      <p className="text-white/70 text-sm mt-1">{conv.preview}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-500/20 border-blue-500/30 text-xs">
                        {conv.messageCount} mensagens
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-white/60 hover:text-white hover:bg-red-500/20 group-hover:opacity-100 opacity-0 transition-opacity">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
                    <span className="text-xs text-white/50">{formatDate(conv.date)}</span>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-300 hover:text-blue-200 hover:bg-blue-900/30">
                      Continuar conversa
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              {searchTerm ? (
                <>
                  <Search className="h-12 w-12 text-white/30 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhuma conversa encontrada</h3>
                  <p className="text-white/60 max-w-md">
                    Não encontramos nenhuma conversa com o termo "{searchTerm}". Tente uma pesquisa diferente.
                  </p>
                </>
              ) : (
                <>
                  <Clock className="h-12 w-12 text-white/30 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Histórico vazio</h3>
                  <p className="text-white/60 max-w-md">
                    Você ainda não tem conversas salvas no histórico. As conversas que você tiver com a Epictus IA aparecerão aqui.
                  </p>
                </>
              )}
            </motion.div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default HistoricoConversasModal;
