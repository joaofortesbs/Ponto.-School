import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const GerarFluxograma = () => {
  const [fonte, setFonte] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulação da geração do fluxograma
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <Card className="w-full shadow-lg border-orange-100 dark:border-orange-900/30 bg-white dark:bg-slate-900/60">
      <CardContent className="p-5">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Share2 className="h-4 w-4 text-orange-500" />
            </div>
            <h3 className="text-base font-medium">Gerar Fluxograma</h3>
          </div>

          <div className="mt-2">
            <Input
              placeholder="Digite o título do fluxograma"
              value={fonte}
              onChange={(e) => setFonte(e.target.value)}
              className="mb-4 border-orange-200 dark:border-orange-800/50 focus-visible:ring-orange-500"
            />
          </div>

          {/* Mini-card com pré-visualização do fluxograma */}
          <div className="relative bg-slate-50 dark:bg-slate-800/60 rounded-md p-4 border border-orange-100 dark:border-orange-900/30 shadow-sm overflow-hidden">
            <div className="flex justify-center items-center h-32 perspective-800">
              <div className="mini-flow-preview relative transform transition-all duration-300 w-full h-full">
                {/* Nós do fluxograma com efeito de flutuação */}
                <div className="absolute top-6 left-8 animate-float">
                  <div className="mini-flow-node w-16 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-md flex items-center justify-center text-xs font-medium border border-blue-200 dark:border-blue-800/50 shadow-sm">
                    Conceito 1
                  </div>
                </div>

                <div className="absolute top-6 right-8 animate-float-delayed-200">
                  <div className="mini-flow-node w-16 h-10 bg-green-100 dark:bg-green-900/40 rounded-md flex items-center justify-center text-xs font-medium border border-green-200 dark:border-green-800/50 shadow-sm">
                    Conceito 2
                  </div>
                </div>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-float-delayed-100">
                  <div className="mini-flow-node w-16 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-md flex items-center justify-center text-xs font-medium border border-purple-200 dark:border-purple-800/50 shadow-sm">
                    Conclusão
                  </div>
                </div>

                {/* Linhas conectoras com efeito de movimento */}
                <div className="absolute top-11 left-[5.5rem] w-[7rem] h-0.5 bg-gradient-to-r from-blue-300 to-green-300 dark:from-blue-700 dark:to-green-700 origin-left rotate-0 transform" 
                     style={{backgroundImage: 'linear-gradient(to right, rgba(147, 197, 253, 0.8) 33%, rgba(0,0,0,0) 0%)', backgroundPosition: '0 0', backgroundSize: '8px 1px', backgroundRepeat: 'repeat-x'}}
                     className="animate-dash-horizontal">
                </div>

                <div className="absolute top-[4.1rem] left-14 h-[3.5rem] w-0.5 bg-gradient-to-b from-blue-300 to-purple-300 dark:from-blue-700 dark:to-purple-700" 
                     style={{backgroundImage: 'linear-gradient(to bottom, rgba(147, 197, 253, 0.8) 33%, rgba(0,0,0,0) 0%)', backgroundPosition: '0 0', backgroundSize: '1px 8px', backgroundRepeat: 'repeat-y'}}
                     className="animate-dash-slow">
                </div>

                <div className="absolute top-[4.1rem] right-14 h-[3.5rem] w-0.5 bg-gradient-to-b from-green-300 to-purple-300 dark:from-green-700 dark:to-purple-700" 
                     style={{backgroundImage: 'linear-gradient(to bottom, rgba(134, 239, 172, 0.8) 33%, rgba(0,0,0,0) 0%)', backgroundPosition: '0 0', backgroundSize: '1px 8px', backgroundRepeat: 'repeat-y'}}
                     className="animate-dash-slow">
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-2 mt-4">
            <Button
              variant="outline"
              className="w-full border-orange-200 dark:border-orange-800/50 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30"
            >
              Compartilhar
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={handleGenerate}
                  disabled={isGenerating || !fonte}
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      Gerando...
                    </div>
                  ) : (
                    "Gerar"
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Fluxograma Gerado
                  </DialogTitle>
                  <DialogDescription>
                    Seu fluxograma foi gerado com sucesso e está pronto para ser
                    compartilhado.
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-4 my-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-center items-center h-40">
                    {/* Aqui seria exibido o fluxograma gerado em tamanho maior */}
                    <div className="text-center text-slate-400 dark:text-slate-500">
                      Visualização do fluxograma completo
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="border-orange-200 dark:border-orange-800/50 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                  >
                    Compartilhar
                  </Button>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    Editar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GerarFluxograma;