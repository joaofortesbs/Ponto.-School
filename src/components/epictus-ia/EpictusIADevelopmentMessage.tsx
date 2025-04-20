import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Atom, Sparkles, Rocket, Brain, Construction } from "lucide-react";

export default function EpictusIADevelopmentMessage() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-gray-900/50 rounded-xl border border-gray-800 p-8 backdrop-blur-sm text-center">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
            <Atom className="h-12 w-12 text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-2">
          Epictus IA{" "}
          <Badge className="ml-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 mr-1" /> Em Desenvolvimento
          </Badge>
        </h1>

        <p className="text-xl text-gray-300 mb-8">
          Estamos trabalhando para trazer a próxima geração de inteligência
          artificial para educação.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <Brain className="h-10 w-10 text-purple-400 mb-4" />
              <h3 className="font-medium text-white text-lg mb-2">
                Assistente Inteligente
              </h3>
              <p className="text-sm text-gray-400">
                Assistente personalizado para suas necessidades educacionais
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-indigo-500/50 transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <Rocket className="h-10 w-10 text-indigo-400 mb-4" />
              <h3 className="font-medium text-white text-lg mb-2">
                Aprendizado Adaptativo
              </h3>
              <p className="text-sm text-gray-400">
                Conteúdo que se adapta ao seu ritmo e estilo de aprendizado
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <Construction className="h-10 w-10 text-blue-400 mb-4" />
              <h3 className="font-medium text-white text-lg mb-2">
                Ferramentas Avançadas
              </h3>
              <p className="text-sm text-gray-400">
                Suíte completa de ferramentas para potencializar seus estudos
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-xl border border-purple-900/50 p-6 mb-8">
          <p className="text-gray-300 text-lg">
            A seção Epictus IA está em desenvolvimento ativo. Fique atento para
            atualizações e novos recursos em breve.
          </p>
        </div>

        <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-lg py-6 px-8">
          <Sparkles className="h-5 w-5 mr-2" /> Receber Notificações de
          Lançamento
        </Button>
      </div>
    </div>
  );
}
