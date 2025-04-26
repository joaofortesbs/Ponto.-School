
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Search, Plus, Mic, ChevronDown, Clock, Star, Lock, Trash2, Download, MoreVertical } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Conversa {
  id: string;
  titulo: string;
  timestamp: Date;
  favorito?: boolean;
  privado?: boolean;
}

interface HistoricoConversasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HistoricoConversasModal: React.FC<HistoricoConversasModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversasData, setConversasData] = useState<Conversa[]>([]);

  // Gerar dados simulados ao montar o componente
  useEffect(() => {
    // Dados de exemplo para conversas
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);
    
    const ultimos7Dias = new Date(hoje);
    ultimos7Dias.setDate(ultimos7Dias.getDate() - 7);
    
    const esteAno = new Date(hoje);
    esteAno.setMonth(esteAno.getMonth() - 3);

    const dadosSimulados: Conversa[] = [
      {
        id: "1",
        titulo: "Otimização de algoritmos de busca",
        timestamp: new Date(hoje.setHours(hoje.getHours() - 2)),
        favorito: true,
        privado: true
      },
      {
        id: "2",
        titulo: "Desenvolvimento de interfaces responsivas",
        timestamp: new Date(ontem.setHours(ontem.getHours() - 5)),
      },
      {
        id: "3",
        titulo: "Estudo sobre inteligência artificial avançada",
        timestamp: new Date(ontem),
        favorito: true
      },
      {
        id: "4",
        titulo: "Estratégias para aprendizado de máquina",
        timestamp: new Date(ultimos7Dias.setDate(ultimos7Dias.getDate() + 2)),
      },
      {
        id: "5",
        titulo: "Técnicas de processamento de linguagem natural",
        timestamp: new Date(ultimos7Dias),
        privado: true
      },
      {
        id: "6",
        titulo: "Frameworks modernos para desenvolvimento web",
        timestamp: new Date(esteAno),
      },
      {
        id: "7",
        titulo: "Composição e estruturas de dados avançadas",
        timestamp: new Date(esteAno.setDate(esteAno.getDate() + 15)),
      }
    ];

    setConversasData(dadosSimulados);
  }, []);

  // Função para agrupar conversas por período
  const agruparConversas = () => {
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);
    
    const ultimos7Dias = new Date(hoje);
    ultimos7Dias.setDate(ultimos7Dias.getDate() - 7);
    
    const grupos: {[key: string]: Conversa[]} = {
      "HOJE": [],
      "ONTEM": [],
      "ÚLTIMOS 7 DIAS": [],
      "ESTE ANO": []
    };

    const conversasFiltradas = conversasData.filter(conversa => 
      conversa.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    conversasFiltradas.forEach(conversa => {
      const data = new Date(conversa.timestamp);
      
      if (data.toDateString() === hoje.toDateString()) {
        grupos["HOJE"].push(conversa);
      } else if (data.toDateString() === ontem.toDateString()) {
        grupos["ONTEM"].push(conversa);
      } else if (data > ultimos7Dias) {
        grupos["ÚLTIMOS 7 DIAS"].push(conversa);
      } else {
        grupos["ESTE ANO"].push(conversa);
      }
    });

    // Ordenar conversas em cada grupo (mais recentes primeiro)
    Object.keys(grupos).forEach(key => {
      grupos[key].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    });

    return grupos;
  };

  const formatarTimestamp = (timestamp: Date) => {
    const agora = new Date();
    const diff = agora.getTime() - timestamp.getTime();
    const minutosPassados = Math.floor(diff / (1000 * 60));
    const horasPassadas = Math.floor(diff / (1000 * 60 * 60));
    const diasPassados = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutosPassados < 60) {
      return `${minutosPassados}m atrás`;
    } else if (horasPassadas < 24) {
      return `${horasPassadas}h atrás`;
    } else if (diasPassados < 7) {
      return `${diasPassados}d atrás`;
    } else {
      return timestamp.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    }
  };

  const selecionarConversa = (id: string) => {
    setSelectedConversation(id);
    console.log(`Conversa selecionada: ${id}`);
  };

  const criarNovoChat = () => {
    console.log("Criando novo chat privado");
    onOpenChange(false); // Fechar o modal após criar novo chat
  };

  const toggleActionsMenu = () => {
    setShowActionsMenu(!showActionsMenu);
  };

  const handleAction = (action: string) => {
    console.log(`Ação executada: ${action}`);
    setShowActionsMenu(false);
  };

  const grupos = agruparConversas();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-[#0f1a2a] border-none sm:rounded-xl text-white"
        style={{ 
          width: "85vw", 
          height: "85vh",
          background: "linear-gradient(145deg, #0d1525 0%, #111c2e 100%)"
        }}>
        <div className="flex h-full">
          {/* Painel lateral esquerdo com histórico */}
          <div className="w-1/3 border-r border-[#1e2a3e] flex flex-col h-full">
            {/* Barra de pesquisa fixa */}
            <div className="sticky top-0 p-4 border-b border-[#1e2a3e] bg-[#0f1a2a] z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Pesquisar conversas..."
                  className="w-full py-2 pl-10 pr-4 rounded-md bg-[#162032] border border-[#1e2a3e] text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#0D23A0] placeholder:text-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="relative">
                  <button
                    className="flex items-center text-sm text-gray-300 hover:text-white"
                    onClick={toggleActionsMenu}
                  >
                    <span>Ações</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </button>
                  <AnimatePresence>
                    {showActionsMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-8 w-48 bg-[#162032] rounded-md shadow-lg border border-[#1e2a3e] z-50 overflow-hidden"
                      >
                        <ul className="py-1">
                          <li>
                            <button
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#1e2a3e]"
                              onClick={() => handleAction("Arquivar conversas")}
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Marcar favoritos
                            </button>
                          </li>
                          <li>
                            <button
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#1e2a3e]"
                              onClick={() => handleAction("Excluir conversas")}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir conversas
                            </button>
                          </li>
                          <li>
                            <button
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#1e2a3e]"
                              onClick={() => handleAction("Exportar histórico")}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Exportar histórico
                            </button>
                          </li>
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  className="flex items-center bg-gradient-to-r from-[#0D23A0] to-[#4A0D9F] hover:from-[#1230CC] hover:to-[#5D15BE] text-xs px-3 py-1 h-auto rounded-md border-none"
                  onClick={criarNovoChat}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Novo chat
                </Button>
              </div>
            </div>

            {/* Lista de conversas com rolagem */}
            <ScrollArea className="flex-1 px-2">
              <div className="py-2">
                {Object.keys(grupos).map(periodo => {
                  if (grupos[periodo].length === 0) return null;
                  
                  return (
                    <div key={periodo} className="mb-4">
                      <h3 className="text-xs font-bold text-gray-400 px-2 mb-2">{periodo}</h3>
                      <ul>
                        {grupos[periodo].map(conversa => (
                          <motion.li
                            key={conversa.id}
                            whileHover={{ backgroundColor: "rgba(30, 42, 62, 0.7)" }}
                            className={`relative px-3 py-2 rounded-md cursor-pointer overflow-hidden mb-1 ${
                              selectedConversation === conversa.id 
                                ? "bg-[#1e2a3e]" 
                                : "hover:bg-[#1e2a3e]/50"
                            }`}
                            onClick={() => selecionarConversa(conversa.id)}
                          >
                            {selectedConversation === conversa.id && (
                              <motion.div
                                layoutId="selectedHighlight"
                                className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#0D23A0] to-[#4A0D9F]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                              />
                            )}
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center pr-2 truncate">
                                {conversa.privado && <Lock className="h-3 w-3 mr-1 text-[#4A0D9F]" />}
                                <span className="truncate text-sm">{conversa.titulo}</span>
                              </div>
                              <div className="flex items-center">
                                {conversa.favorito && <Star className="h-3 w-3 mr-1 text-[#FF6B00]" />}
                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                  {formatarTimestamp(conversa.timestamp)}
                                </span>
                              </div>
                            </div>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Rodapé fixo */}
            <div className="sticky bottom-0 w-full p-3 border-t border-[#1e2a3e] bg-[#0f1a2a]">
              <div className="flex justify-between items-center">
                <Button
                  className="flex items-center bg-gradient-to-r from-[#0D23A0] to-[#4A0D9F] hover:from-[#1230CC] hover:to-[#5D15BE] text-xs px-3 py-1 h-auto rounded-md border-none"
                  onClick={criarNovoChat}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Novo chat
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-[#162032] hover:bg-[#1e2a3e] border border-[#1e2a3e]/50"
                  title="Comando de voz"
                >
                  <Mic className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            </div>
          </div>

          {/* Área de pré-visualização à direita */}
          <div className="w-2/3 h-full bg-[#0a1321] p-6 flex flex-col">
            {selectedConversation ? (
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#4A0D9F] flex items-center justify-center mr-3">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-medium">
                        {conversasData.find(c => c.id === selectedConversation)?.titulo}
                      </h2>
                      <p className="text-xs text-gray-400">
                        {conversasData.find(c => c.id === selectedConversation)?.timestamp.toLocaleDateString('pt-BR', { 
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-[#1e2a3e]"
                  >
                    <MoreVertical className="h-5 w-5 text-gray-400" />
                  </Button>
                </div>
                
                <div className="flex-1 overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="mb-4 p-6 rounded-full bg-[#162032]/70 inline-flex">
                        <motion.div
                          animate={{ 
                            opacity: [0.5, 1, 0.5],
                            scale: [0.97, 1.03, 0.97]
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 3
                          }}
                        >
                          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#4A0D9F] flex items-center justify-center">
                            <Clock className="h-8 w-8 text-white" />
                          </div>
                        </motion.div>
                      </div>
                      <p className="text-xl font-medium mb-2">Histórico de Conversas</p>
                      <p className="text-gray-400 max-w-md">
                        A pré-visualização da conversa será exibida aqui. 
                        Selecione uma conversa para continuar de onde parou.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button 
                    className="w-full bg-gradient-to-r from-[#0D23A0] to-[#4A0D9F] hover:from-[#1230CC] hover:to-[#5D15BE] py-2 rounded-md border-none"
                    onClick={() => onOpenChange(false)}
                  >
                    Continuar Conversa
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 3
                  }}
                  className="mb-6"
                >
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#0D23A0]/20 to-[#4A0D9F]/20 flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#0D23A0]/50 to-[#4A0D9F]/50 flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#4A0D9F] flex items-center justify-center">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                </motion.div>
                <h2 className="text-xl font-medium mb-2">Histórico de Conversas</h2>
                <p className="text-gray-400 text-center max-w-md">
                  Selecione uma conversa do histórico para visualizar seu conteúdo ou 
                  inicie um novo chat privado.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HistoricoConversasModal;
