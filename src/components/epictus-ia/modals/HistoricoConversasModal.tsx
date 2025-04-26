import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  X,
  Search,
  Clock,
  Star,
  Pin,
  Edit,
  Trash2,
  Tag,
  Archive,
  ChevronRight,
  MessageCircle,
  Sparkles,
  Download,
  FileText,
  Copy,
  Send,
  Filter,
  AlignLeft,
  Bookmark,
  Zap,
  Brain,
  FileQuestion,
  MessageSquare,
  BookOpen,
  Tool,
  ArrowRight,
  CalendarClock
} from "lucide-react";

interface HistoricoConversasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HistoricoConversasModal: React.FC<HistoricoConversasModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [expandedDetails, setExpandedDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("todas");

  // Mock data para conversas
  const [conversas, setConversas] = useState([
    {
      id: 1,
      tipo: "conteudo",
      titulo: "Revisão de Matemática: Funções Quadráticas",
      data: "2023-09-10T14:30:00",
      fixado: true,
      favorito: true,
      tags: ["Enem", "Matemática", "Importante"],
      resumo: "Discussão sobre como resolver equações quadráticas e suas aplicações",
      conteudo: "Nesta conversa exploramos como resolver equações quadráticas usando diferentes métodos como fórmula de Bhaskara, completamento de quadrados e fatoração. Também vimos aplicações práticas em problemas de maximização e minimização."
    },
    {
      id: 2,
      tipo: "duvida",
      titulo: "Dúvida sobre Oxidação na Química",
      data: "2023-09-05T10:15:00",
      fixado: false,
      favorito: true,
      tags: ["Química", "Revisar"],
      resumo: "Esclarecimento sobre reações de oxidação-redução",
      conteudo: "Conversamos sobre como identificar os números de oxidação em diferentes elementos e como determinar qual espécie está sendo oxidada ou reduzida em uma reação redox."
    },
    {
      id: 3,
      tipo: "correcao",
      titulo: "Correção da Redação sobre Meio Ambiente",
      data: "2023-09-01T16:45:00",
      fixado: false,
      favorito: false,
      tags: ["Redação", "Português"],
      resumo: "Análise detalhada da redação sobre sustentabilidade",
      conteudo: "O Epictus IA analisou minha redação sobre problemas ambientais contemporâneos, destacando pontos fortes na argumentação e sugerindo melhorias na coesão textual e na conclusão."
    },
    {
      id: 4,
      tipo: "conteudo",
      titulo: "História do Brasil: Era Vargas",
      data: "2023-08-25T11:20:00",
      fixado: false,
      favorito: false,
      tags: ["História", "Brasil"],
      resumo: "Resumo completo sobre o período Vargas (1930-1945)",
      conteudo: "Conversamos sobre os principais acontecimentos da Era Vargas, incluindo a Revolução de 30, Estado Novo, políticas trabalhistas e o contexto da Segunda Guerra Mundial."
    },
    {
      id: 5,
      tipo: "duvida",
      titulo: "Dúvidas sobre Física: Movimento Circular",
      data: "2023-08-20T09:30:00",
      fixado: false,
      favorito: true,
      tags: ["Física", "Urgente"],
      resumo: "Explicação sobre força centrípeta e aplicações",
      conteudo: "Discutimos os conceitos de força centrípeta, aceleração centrípeta e seus cálculos. Vimos exemplos práticos como movimento de satélites e curvas em estradas."
    }
  ]);

  useEffect(() => {
    console.log("HistoricoConversasModal renderizado, isOpen:", isOpen);
    // Carregar dados de conversas do storage/banco quando disponível
    try {
      // Aqui ficaria a lógica para buscar conversas do banco de dados
      // Por enquanto, usamos os dados mockados acima
    } catch (error) {
      console.error("Erro ao carregar histórico de conversas:", error);
    }
  }, [isOpen]);

  const getIconByTipo = (tipo: string) => {
    try {
      switch (tipo) {
        case "conteudo":
          return <BookOpen size={18} className="text-blue-500" />;
        case "duvida":
          return <Brain size={18} className="text-purple-500" />;
        case "correcao":
          return <FileText size={18} className="text-green-500" />;
        default:
          return <MessageSquare size={18} className="text-gray-500" />;
      }
    } catch (error) {
      console.error("Erro ao renderizar ícone por tipo:", error);
      return <MessageSquare size={18} className="text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data inválida";
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectConversation = (conversa: any) => {
    console.log("Conversa selecionada:", conversa.id);
    setSelectedConversation(conversa);
    setExpandedDetails(false);
  };

  const handleToggleDetails = () => {
    console.log("Alternando detalhes expandidos");
    setExpandedDetails(!expandedDetails);
  };

  const handleToggleFavorite = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      setConversas(conversas.map(conversa => 
        conversa.id === id 
          ? { ...conversa, favorito: !conversa.favorito } 
          : conversa
      ));
    } catch (error) {
      console.error("Erro ao alternar favorito:", error);
    }
  };

  const handleTogglePin = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      setConversas(conversas.map(conversa => 
        conversa.id === id 
          ? { ...conversa, fixado: !conversa.fixado } 
          : conversa
      ));
    } catch (error) {
      console.error("Erro ao fixar/desafixar conversa:", error);
    }
  };

  const handleDelete = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      if (window.confirm("Tem certeza que deseja excluir esta conversa?")) {
        setConversas(conversas.filter(conversa => conversa.id !== id));
        if (selectedConversation && selectedConversation.id === id) {
          setSelectedConversation(null);
        }
      }
    } catch (error) {
      console.error("Erro ao excluir conversa:", error);
    }
  };

  const handleRenameConversation = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const conversa = conversas.find(c => c.id === id);
      if (!conversa) return;

      const novoTitulo = prompt("Digite o novo título para esta conversa:", conversa.titulo);
      if (novoTitulo && novoTitulo.trim() !== "") {
        setConversas(conversas.map(c => 
          c.id === id 
            ? { ...c, titulo: novoTitulo.trim() } 
            : c
        ));

        if (selectedConversation && selectedConversation.id === id) {
          setSelectedConversation({...selectedConversation, titulo: novoTitulo.trim()});
        }
      }
    } catch (error) {
      console.error("Erro ao renomear conversa:", error);
    }
  };

  const handleContinueConversation = () => {
    if (!selectedConversation) return;
    console.log("Continuando conversa:", selectedConversation.id);
    // Aqui implementaria a lógica para continuar a conversa
    // Pode ser redirecionamento ou carregar a conversa no chat
    alert(`Continuando conversa: ${selectedConversation.titulo}`);
    onClose();
  };

  const handleExport = () => {
    if (!selectedConversation) return;
    try {
      console.log("Exportando conversa:", selectedConversation.id);
      // Lógica para exportar como PDF ou outro formato
      const conversaTexto = `
        Título: ${selectedConversation.titulo}
        Data: ${formatDate(selectedConversation.data)}
        Conteúdo: ${selectedConversation.conteudo}
      `;

      // Criar um elemento para download
      const element = document.createElement("a");
      const file = new Blob([conversaTexto], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `conversa-${selectedConversation.id}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error("Erro ao exportar conversa:", error);
      alert("Não foi possível exportar a conversa. Tente novamente.");
    }
  };

  const filteredConversas = conversas.filter(conversa => {
    const matchesSearch = conversa.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conversa.conteudo.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "todas") return matchesSearch;
    if (activeTab === "favoritas") return matchesSearch && conversa.favorito;
    if (activeTab === "fixadas") return matchesSearch && conversa.fixado;

    return matchesSearch;
  });

  // Ordenar conversas: fixadas primeiro, depois por data (mais recentes primeiro)
  const sortedConversas = [...filteredConversas].sort((a, b) => {
    if (a.fixado && !b.fixado) return -1;
    if (!a.fixado && b.fixado) return 1;
    return new Date(b.data).getTime() - new Date(a.data).getTime();
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[85%] max-h-[85vh] p-0 gap-0 overflow-hidden bg-white dark:bg-[#0A2540]">
        <div className="flex flex-col h-full">
          <DialogTitle className="px-6 py-4 border-b text-xl font-medium flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-orange-500" />
              <span>Histórico de Conversas</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>

          <div className="grid grid-cols-12 gap-0 flex-grow overflow-hidden">
            {/* Coluna Esquerda - Lista de Conversas */}
            <div className="col-span-3 border-r overflow-hidden flex flex-col">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar conversas..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-9 w-full"
                  />
                </div>

                <Tabs defaultValue="todas" value={activeTab} onValueChange={setActiveTab} className="mt-4">
                  <TabsList className="w-full">
                    <TabsTrigger value="todas" className="flex-1">Todas</TabsTrigger>
                    <TabsTrigger value="favoritas" className="flex-1">Favoritas</TabsTrigger>
                    <TabsTrigger value="fixadas" className="flex-1">Fixadas</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <ScrollArea className="flex-grow">
                <div className="p-2 space-y-2">
                  {sortedConversas.length > 0 ? (
                    sortedConversas.map((conversa) => (
                      <div
                        key={conversa.id}
                        className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                          selectedConversation?.id === conversa.id
                            ? "bg-gray-100 dark:bg-gray-800 border-l-4 border-orange-500"
                            : ""
                        }`}
                        onClick={() => handleSelectConversation(conversa)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            {getIconByTipo(conversa.tipo)}
                            <span className="font-medium truncate max-w-[150px]">
                              {conversa.titulo}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {conversa.fixado && <Pin size={14} className="text-gray-500" />}
                            {conversa.favorito && <Star size={14} fill="currentColor" className="text-yellow-400" />}
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {formatDate(conversa.data)}
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {conversa.resumo}
                        </div>

                        <div className="flex mt-2 justify-between">
                          <div className="flex flex-wrap gap-1">
                            {conversa.tags.slice(0, 2).map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs py-0 px-1">
                                {tag}
                              </Badge>
                            ))}
                            {conversa.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs py-0 px-1">
                                +{conversa.tags.length - 2}
                              </Badge>
                            )}
                          </div>

                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 rounded-full"
                              onClick={(e) => handleToggleFavorite(conversa.id, e)}
                            >
                              <Star
                                size={14}
                                className={conversa.favorito ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 rounded-full"
                              onClick={(e) => handleTogglePin(conversa.id, e)}
                            >
                              <Pin
                                size={14}
                                className={conversa.fixado ? "text-orange-500" : "text-gray-400"}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 rounded-full"
                              onClick={(e) => handleRenameConversation(conversa.id, e)}
                            >
                              <Edit size={14} className="text-gray-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 rounded-full"
                              onClick={(e) => handleDelete(conversa.id, e)}
                            >
                              <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p>Nenhuma conversa encontrada</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Coluna Central - Prévia e Conteúdo */}
            <div className={`${expandedDetails ? 'col-span-4' : 'col-span-9'} border-r overflow-hidden flex flex-col`}>
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        {getIconByTipo(selectedConversation.tipo)}
                        <h3 className="text-lg font-semibold ml-2">{selectedConversation.titulo}</h3>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={handleToggleDetails}>
                          {expandedDetails ? 'Recolher Detalhes' : 'Expandir Detalhes'}
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedConversation.tags.map((tag: string, idx: number) => (
                        <Badge key={idx} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(selectedConversation.data)}
                        </span>
                      </div>

                      <div className="text-sm font-medium mb-1">Resumo:</div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                        {selectedConversation.resumo}
                      </p>
                    </div>
                  </div>

                  <ScrollArea className="flex-grow p-4">
                    <div className="space-y-6">
                      <div className="bg-white dark:bg-gray-800 border rounded-lg p-4">
                        <h4 className="font-medium mb-2 flex items-center">
                          <AlignLeft className="h-4 w-4 mr-2 text-gray-500" />
                          Conteúdo da Conversa
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                          {selectedConversation.conteudo}
                        </p>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
                        <h4 className="font-medium mb-2 flex items-center text-blue-700 dark:text-blue-400">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Pontos-chave
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start">
                            <span className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full p-1 mr-2 mt-0.5">
                              <ChevronRight className="h-3 w-3" />
                            </span>
                            <span>Conceitos importantes discutidos na conversa</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full p-1 mr-2 mt-0.5">
                              <ChevronRight className="h-3 w-3" />
                            </span>
                            <span>Aplicações práticas do conhecimento</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full p-1 mr-2 mt-0.5">
                              <ChevronRight className="h-3 w-3" />
                            </span>
                            <span>Dúvidas esclarecidas durante a conversa</span>
                          </li>
                        </ul>
                      </div>

                      <div className="flex justify-center space-x-3">
                        <Button
                          onClick={handleContinueConversation}
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Continuar Conversa
                        </Button>
                        <Button variant="outline" onClick={handleExport}>
                          <Download className="mr-2 h-4 w-4" />
                          Exportar
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-10 text-center text-gray-500">
                  <MessageCircle className="h-16 w-16 mb-4 opacity-20" />
                  <h3 className="text-xl font-medium mb-2">Selecione uma conversa</h3>
                  <p className="max-w-md">
                    Escolha uma conversa da lista à esquerda para visualizar o conteúdo completo
                    e interagir com as opções disponíveis.
                  </p>
                </div>
              )}
            </div>

            {/* Coluna Direita - Painel de Ações Avançadas (visível apenas quando expandido) */}
            {expandedDetails && selectedConversation && (
              <div className="col-span-5 overflow-hidden flex flex-col">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Tool className="mr-2 h-5 w-5 text-gray-600" />
                    Ações Avançadas
                  </h3>
                </div>

                <ScrollArea className="flex-grow">
                  <div className="p-4 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        className="flex items-center justify-start p-4 h-auto text-left"
                        onClick={() => alert("Transformando em resumo...")}
                      >
                        <div className="mr-3 p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                          <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium">Transformar em Resumo</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Gerar versão concisa
                          </p>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="flex items-center justify-start p-4 h-auto text-left"
                        onClick={() => alert("Gerando quiz...")}
                      >
                        <div className="mr-3 p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                          <FileQuestion className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium">Gerar Quiz</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Criar questões baseadas no conteúdo
                          </p>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="flex items-center justify-start p-4 h-auto text-left"
                        onClick={() => alert("Exportando como PDF...")}
                      >
                        <div className="mr-3 p-2 rounded-full bg-red-100 dark:bg-red-900">
                          <Download className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="font-medium">Exportar como PDF</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Documento formatado
                          </p>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="flex items-center justify-start p-4 h-auto text-left"
                        onClick={() => alert("Enviando para caderno...")}
                      >
                        <div className="mr-3 p-2 rounded-full bg-green-100 dark:bg-green-900">
                          <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium">Mandar para Caderno</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Salvar em suas anotações
                          </p>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="flex items-center justify-start p-4 h-auto text-left"
                        onClick={() => alert("Criando flashcards...")}
                      >
                        <div className="mr-3 p-2 rounded-full bg-amber-100 dark:bg-amber-900">
                          <Copy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="font-medium">Criar Flashcards</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Cartões de estudo inteligentes
                          </p>
                        </div>
                      </Button>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 border-b font-medium flex items-center">
                        <Brain className="h-4 w-4 mr-2 text-orange-500" />
                        Sugestões da IA
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-start">
                          <Zap className="h-5 w-5 mr-2 text-orange-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Deseja retomar de onde parou?</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Continue esta conversa sobre {selectedConversation.titulo.toLowerCase()} para aprofundar seu conhecimento.
                            </p>
                            <Button size="sm" variant="link" className="text-orange-500 p-0 h-auto mt-1">
                              Continuar agora <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <Sparkles className="h-5 w-5 mr-2 text-indigo-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Gerar simulado com base nessa conversa</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Crie um teste prático para verificar seu aprendizado sobre este tema.
                            </p>
                            <Button size="sm" variant="link" className="text-indigo-500 p-0 h-auto mt-1">
                              Criar simulado <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <MessageCircle className="h-4 w-4 mr-2 text-gray-500" />
                        Adicionar Comentário Pessoal
                      </h4>
                      <div className="relative">
                        <textarea
                          className="w-full border rounded-lg p-3 pr-10 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:border-gray-700"
                          placeholder="Adicione suas observações sobre esta conversa..."
                          rows={3}
                        ></textarea>
                        <Button
                          size="sm"
                          className="absolute bottom-2 right-2 h-7 bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HistoricoConversasModal;