import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, FileText, ListChecks, BookMarked } from "lucide-react";

interface ApostilaInteligenteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ApostilaInteligenteModal: React.FC<ApostilaInteligenteModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [activeTab, setActiveTab] = React.useState("estudoCompleto");

  const modelosApostila = [
    {
      id: "estudoCompleto",
      title: "Estudo Completo",
      icon: <BookOpen className="h-5 w-5 mr-2" />,
      description: "Material de estudo detalhado com explicações, exemplos, exercícios e resumo.",
    },
    {
      id: "revisaoRapida",
      title: "Revisão Rápida",
      icon: <FileText className="h-5 w-5 mr-2" />,
      description: "Versão condensada com pontos-chave e resumos para revisões antes de provas.",
    },
    {
      id: "exerciciosPraticos",
      title: "Exercícios Práticos",
      icon: <ListChecks className="h-5 w-5 mr-2" />,
      description: "Conjunto de exercícios práticos com resolução comentada para fixação.",
    },
    {
      id: "anotacoesGuiadas",
      title: "Anotações Guiadas",
      icon: <BookMarked className="h-5 w-5 mr-2" />,
      description: "Template para fazer anotações durante as aulas ou estudos.",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] bg-[#0f172a] text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#4A90E2]" />
            Apostila Inteligente
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Crie materiais de estudo personalizados para suas necessidades educacionais
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col"
          >
            <TabsList className="grid grid-cols-4 mb-4 bg-gray-800/50">
              {modelosApostila.map((modelo) => (
                <TabsTrigger 
                  key={modelo.id}
                  value={modelo.id}
                  className="data-[state=active]:bg-[#4A90E2] data-[state=active]:text-white py-2"
                >
                  <div className="flex items-center">
                    {modelo.icon}
                    <span>{modelo.title}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            <ScrollArea className="flex-1 pr-4">
              {modelosApostila.map((modelo) => (
                <TabsContent 
                  key={modelo.id}
                  value={modelo.id}
                  className="mt-0 h-full"
                >
                  <div className="bg-[#1a2234] p-6 rounded-lg border border-gray-700 mb-4">
                    <h3 className="text-xl font-semibold mb-3 text-[#4A90E2]">{modelo.title}</h3>
                    <p className="text-gray-300 mb-4">{modelo.description}</p>

                    <div className="flex flex-col space-y-4">
                      <div className="bg-gray-800/50 p-4 rounded-md">
                        <h4 className="font-medium mb-2 text-white">Características</h4>
                        <ul className="list-disc pl-5 text-gray-300 space-y-1">
                          {modelo.id === "estudoCompleto" && (
                            <>
                              <li>Explicações detalhadas e claras</li>
                              <li>Exemplos práticos e contextualização</li>
                              <li>Imagens e diagramas ilustrativos</li>
                              <li>Exercícios de fixação com resolução</li>
                              <li>Resumo dos conceitos principais</li>
                            </>
                          )}
                          {modelo.id === "revisaoRapida" && (
                            <>
                              <li>Pontos-chave e definições essenciais</li>
                              <li>Fórmulas e equações importantes</li>
                              <li>Mapas mentais para visualização de conceitos</li>
                              <li>Esquemas de memorização</li>
                              <li>Resumo ultracompacto para consulta rápida</li>
                            </>
                          )}
                          {modelo.id === "exerciciosPraticos" && (
                            <>
                              <li>Exercícios de diversos níveis de dificuldade</li>
                              <li>Problemas contextualizados</li>
                              <li>Resolução comentada passo a passo</li>
                              <li>Dicas de resolução e atalhos</li>
                              <li>Exercícios similares aos de provas e concursos</li>
                            </>
                          )}
                          {modelo.id === "anotacoesGuiadas" && (
                            <>
                              <li>Estrutura organizada para anotações</li>
                              <li>Seções para definições, exemplos e observações</li>
                              <li>Espaço para comentários pessoais</li>
                              <li>Marcadores de importância e revisão</li>
                              <li>Template para criação de resumos</li>
                            </>
                          )}
                        </ul>
                      </div>

                      <div className="bg-gray-800/50 p-4 rounded-md">
                        <h4 className="font-medium mb-2 text-white">Como utilizar</h4>
                        <ol className="list-decimal pl-5 text-gray-300 space-y-1">
                          <li>Digite o tema que deseja estudar no campo abaixo</li>
                          <li>Selecione o nível de detalhamento desejado</li>
                          <li>Escolha o formato de saída (PDF, Word, HTML)</li>
                          <li>Clique em "Gerar Apostila" e aguarde o processamento</li>
                          <li>Visualize, edite e salve o material gerado</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tema da Apostila
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Funções do Segundo Grau, História do Brasil, Literatura Portuguesa..."
                      className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-md text-white placeholder:text-gray-500 focus:border-[#4A90E2] focus:ring-1 focus:ring-[#4A90E2]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nível de Detalhamento
                      </label>
                      <select className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-md text-white">
                        <option value="basico">Básico</option>
                        <option value="intermediario" selected>Intermediário</option>
                        <option value="avancado">Avançado</option>
                        <option value="especialista">Especialista</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Formato de Saída
                      </label>
                      <select className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-md text-white">
                        <option value="pdf">PDF</option>
                        <option value="word">Word (DOCX)</option>
                        <option value="html">HTML (Web)</option>
                        <option value="markdown">Markdown (MD)</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-800/50 rounded-md p-4 mb-6">
                    <h4 className="flex items-center text-blue-400 font-medium mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                      Dica de uso
                    </h4>
                    <p className="text-sm text-gray-300">
                      Para obter os melhores resultados, seja específico no tema e forneça um contexto educacional claro. 
                      Por exemplo, em vez de apenas "História", especifique "Revolução Francesa: causas, eventos principais e consequências".
                    </p>
                  </div>
                </TabsContent>
              ))}
            </ScrollArea>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
            Cancelar
          </Button>
          <Button className="bg-gradient-to-r from-[#3A7BD5] to-[#4A90E2] text-white hover:from-[#3A7BD5]/90 hover:to-[#4A90E2]/90">
            Gerar Apostila
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApostilaInteligenteModal;