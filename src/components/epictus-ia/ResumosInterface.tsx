import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Search,
  Plus,
  Clock,
  Star,
  Download,
  Share2,
  BookOpen,
  Brain,
  Sparkles,
  ArrowRight,
  Filter,
  ChevronRight,
  MoreHorizontal,
  Bookmark,
  BookMarked,
  Edit,
  Trash2,
  Zap,
  Lightbulb,
} from "lucide-react";

export default function ResumosInterface() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("meus-resumos");

  const resumos = [
    {
      id: "resumo1",
      title: "Física Quântica: Princípios Fundamentais",
      subject: "Física",
      date: "15/06/2024",
      pages: 5,
      rating: 4.8,
      saved: true,
      content: `# Física Quântica: Princípios Fundamentais

## Introdução
A física quântica é um ramo da física que surgiu no início do século XX e revolucionou nossa compreensão do mundo subatômico. Diferente da física clássica, que descreve bem o comportamento de objetos macroscópicos, a física quântica lida com fenômenos em escalas muito pequenas, como átomos e partículas subatômicas.

## Princípios Fundamentais

### 1. Dualidade Onda-Partícula
Um dos conceitos mais fundamentais da física quântica é que partículas como elétrons e fótons podem se comportar tanto como ondas quanto como partículas, dependendo do experimento realizado.

### 2. Princípio da Incerteza de Heisenberg
Formulado por Werner Heisenberg em 1927, este princípio estabelece que é impossível conhecer simultaneamente, com precisão arbitrária, certos pares de propriedades físicas de uma partícula, como posição e momento.

### 3. Superposição Quântica
Um sistema quântico pode existir em múltiplos estados simultaneamente, até que uma medição seja realizada.

### 4. Emaranhamento Quântico
Quando duas partículas estão emaranhadas, o estado quântico de cada partícula não pode ser descrito independentemente da outra, mesmo quando separadas por grandes distâncias.

## Aplicações Modernas

- **Computação Quântica**: Utiliza propriedades quânticas para realizar cálculos que seriam impossíveis para computadores clássicos.
- **Criptografia Quântica**: Oferece métodos teoricamente inquebráveis para comunicação segura.
- **Sensores Quânticos**: Permitem medições extremamente precisas em diversos campos científicos.

## Conclusão
A física quântica continua sendo uma área de intensa pesquisa e desenvolvimento, com implicações profundas para nossa compreensão do universo e potencial para revolucionar diversas tecnologias no futuro.`,
    },
    {
      id: "resumo2",
      title: "Cálculo Diferencial e Integral: Fundamentos",
      subject: "Matemática",
      date: "10/06/2024",
      pages: 8,
      rating: 4.5,
      saved: false,
      content: "Conteúdo detalhado sobre cálculo diferencial e integral...",
    },
    {
      id: "resumo3",
      title: "Literatura Brasileira: Modernismo",
      subject: "Literatura",
      date: "05/06/2024",
      pages: 6,
      rating: 4.7,
      saved: true,
      content: "Conteúdo sobre o modernismo na literatura brasileira...",
    },
    {
      id: "resumo4",
      title: "Biologia Celular: Estrutura e Função",
      subject: "Biologia",
      date: "01/06/2024",
      pages: 7,
      rating: 4.6,
      saved: false,
      content: "Conteúdo sobre biologia celular...",
    },
    {
      id: "resumo5",
      title: "História do Brasil: Período Colonial",
      subject: "História",
      date: "28/05/2024",
      pages: 9,
      rating: 4.4,
      saved: true,
      content: "Conteúdo sobre o período colonial brasileiro...",
    },
    {
      id: "resumo6",
      title: "Química Orgânica: Hidrocarbonetos",
      subject: "Química",
      date: "25/05/2024",
      pages: 6,
      rating: 4.3,
      saved: false,
      content: "Conteúdo sobre hidrocarbonetos na química orgânica...",
    },
  ];

  const filteredResumos = searchQuery
    ? resumos.filter(
        (resumo) =>
          resumo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resumo.subject.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : resumos;

  const selectedResumeData = resumos.find((r) => r.id === selectedResume);

  // Função para renderizar o conteúdo do resumo com formatação markdown simples
  const renderResumeContent = (content: string) => {
    const lines = content.split("\n");
    return (
      <div className="space-y-4">
        {lines.map((line, index) => {
          if (line.startsWith("# ")) {
            return (
              <h1
                key={index}
                className="text-2xl font-bold text-[#29335C] dark:text-white mt-6 mb-4"
              >
                {line.substring(2)}
              </h1>
            );
          } else if (line.startsWith("## ")) {
            return (
              <h2
                key={index}
                className="text-xl font-bold text-[#29335C] dark:text-white mt-5 mb-3"
              >
                {line.substring(3)}
              </h2>
            );
          } else if (line.startsWith("### ")) {
            return (
              <h3
                key={index}
                className="text-lg font-bold text-[#29335C] dark:text-white mt-4 mb-2"
              >
                {line.substring(4)}
              </h3>
            );
          } else if (line.startsWith("- ")) {
            return (
              <li
                key={index}
                className="ml-6 text-[#64748B] dark:text-white/80"
              >
                {line.substring(2)}
              </li>
            );
          } else if (line.trim() === "") {
            return <div key={index} className="h-4"></div>;
          } else {
            return (
              <p key={index} className="text-[#64748B] dark:text-white/80">
                {line}
              </p>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {selectedResume ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                className="text-[#FF6B00] border-[#FF6B00]/20 hover:bg-[#FF6B00]/5"
                onClick={() => setSelectedResume(null)}
              >
                ← Voltar para todos os resumos
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Download className="h-4 w-4 mr-1" /> Baixar PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Share2 className="h-4 w-4 mr-1" /> Compartilhar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[#FF6B00] border-[#FF6B00]/20 hover:bg-[#FF6B00]/10"
                >
                  <Edit className="h-4 w-4 mr-1" /> Editar
                </Button>
              </div>
            </div>

            {selectedResumeData && (
              <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-md">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-[#FF6B00]/5 to-transparent dark:from-[#FF6B00]/10 dark:to-transparent">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-[#FF6B00]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#29335C] dark:text-white">
                          {selectedResumeData.title}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            {selectedResumeData.subject}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {selectedResumeData.date}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {selectedResumeData.pages} páginas
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-[#FF6B00]" />
                        <span className="text-sm font-medium text-[#FF6B00]">
                          {selectedResumeData.rating}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
                      >
                        {selectedResumeData.saved ? (
                          <BookMarked className="h-4 w-4" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <ScrollArea className="h-[calc(100vh-350px)] p-6">
                  {renderResumeContent(selectedResumeData.content)}
                </ScrollArea>

                <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gradient-to-r from-[#FF6B00]/5 to-transparent dark:from-[#FF6B00]/10 dark:to-transparent">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#29335C] dark:text-white mb-2 flex items-center gap-2">
                        Sugestões do Epictus IA{" "}
                        <Sparkles className="h-4 w-4 text-[#FF6B00]" />
                      </h3>
                      <p className="text-[#64748B] dark:text-white/80 mb-4">
                        Com base neste resumo, você pode se interessar por estes
                        tópicos relacionados:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 cursor-pointer">
                          Mecânica Quântica Avançada
                        </Badge>
                        <Badge className="bg-[#29335C]/10 text-[#29335C] dark:bg-white/10 dark:text-white hover:bg-[#29335C]/20 dark:hover:bg-white/20 cursor-pointer">
                          Computação Quântica
                        </Badge>
                        <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20 cursor-pointer">
                          Experimento da Dupla Fenda
                        </Badge>
                        <Badge className="bg-[#29335C]/10 text-[#29335C] dark:bg-white/10 dark:text-white hover:bg-[#29335C]/20 dark:hover:bg-white/20 cursor-pointer">
                          Teoria das Cordas
                        </Badge>
                      </div>
                      <Button className="mt-4 text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10">
                        Gerar mais sugestões{" "}
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#29335C] dark:text-white flex items-center gap-2">
                  <FileText className="h-6 w-6 text-[#FF6B00]" /> Resumos
                  Inteligentes
                </h1>
                <p className="text-[#64748B] dark:text-white/60">
                  Resumos gerados por IA para otimizar seus estudos
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar resumos..."
                    className="pl-9 bg-white dark:bg-[#29335C]/20 border-gray-200 dark:border-gray-700 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                  <Plus className="h-4 w-4 mr-1" /> Novo Resumo
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Button
                  variant={activeTab === "meus-resumos" ? "default" : "outline"}
                  className={`${activeTab === "meus-resumos" ? "bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white" : "text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"}`}
                  onClick={() => setActiveTab("meus-resumos")}
                >
                  Meus Resumos
                </Button>
                <Button
                  variant={activeTab === "salvos" ? "default" : "outline"}
                  className={`${activeTab === "salvos" ? "bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white" : "text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"}`}
                  onClick={() => setActiveTab("salvos")}
                >
                  Salvos
                </Button>
                <Button
                  variant={activeTab === "recentes" ? "default" : "outline"}
                  className={`${activeTab === "recentes" ? "bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white" : "text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"}`}
                  onClick={() => setActiveTab("recentes")}
                >
                  Recentes
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
              >
                <Filter className="h-4 w-4 mr-1" /> Filtrar
              </Button>
            </div>

            {filteredResumos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResumos
                  .filter((resumo) => {
                    if (activeTab === "salvos") return resumo.saved;
                    return true;
                  })
                  .map((resumo) => (
                    <div
                      key={resumo.id}
                      className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-[#FF6B00]/30 cursor-pointer group"
                      onClick={() => setSelectedResume(resumo.id)}
                    >
                      <div className="h-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40]"></div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-[#FF6B00]" />
                            </div>
                            <div>
                              <h3 className="font-bold text-[#29335C] dark:text-white text-lg">
                                {resumo.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                  {resumo.subject}
                                </Badge>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {resumo.pages} páginas
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Toggle saved state
                            }}
                          >
                            {resumo.saved ? (
                              <BookMarked className="h-4 w-4" />
                            ) : (
                              <Bookmark className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {resumo.date}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-[#FF6B00]" />
                            <span className="text-xs font-medium text-[#FF6B00]">
                              {resumo.rating}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
                          >
                            Ler Resumo
                          </Button>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Download action
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Share action
                              }}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
                  Nenhum resumo encontrado
                </h3>
                <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                  {searchQuery ? "Tente uma busca diferente ou " : ""}
                  crie um novo resumo para começar.
                </p>
                <Button className="mt-4 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                  <Plus className="h-4 w-4 mr-1" /> Criar Novo Resumo
                </Button>
              </div>
            )}

            <div className="bg-gradient-to-r from-[#001427] to-[#29335C] p-6 rounded-xl text-white mt-8">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                    Resumos Inteligentes com Epictus IA{" "}
                    <Sparkles className="h-4 w-4 text-[#FF6B00]" />
                  </h2>
                  <p className="text-white/80 mb-4">
                    Crie resumos personalizados de qualquer conteúdo com a ajuda
                    do Epictus IA. Basta fornecer o texto ou material que deseja
                    resumir, e nossa IA irá gerar um resumo conciso e
                    estruturado, destacando os pontos mais importantes.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-white text-[#29335C] hover:bg-white/90">
                      <Plus className="h-4 w-4 mr-1" /> Criar Novo Resumo
                    </Button>
                    <Button
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Lightbulb className="h-4 w-4 mr-1" /> Ver Exemplos
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
