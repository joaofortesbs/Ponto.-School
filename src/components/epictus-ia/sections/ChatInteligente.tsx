
import React from "react";
import { Card } from "@/components/ui/card";
import AssistantCard from "./components/chat-inteligente/AssistantCard";
import MemoryFeatureCard from "./components/chat-inteligente/MemoryFeatureCard";
import SectionHeader from "./components/chat-inteligente/SectionHeader";

const ChatInteligente: React.FC = () => {
  return (
    <div className="py-12 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="Chat Inteligente"
          description="Converse de forma natural com a IA personalizada para suas necessidades de estudos e produtividade."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <AssistantCard />
          
          <MemoryFeatureCard 
            title="Memória Conversacional"
            description="O Epictus lembra do contexto de conversas anteriores, o que torna a interação mais fluida e produtiva."
          />
          
          <Card className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Pesquisa Inteligente</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Acesse informações precisas e atualizadas com a capacidade de pesquisa avançada do Epictus IA.
            </p>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-2 text-xs text-gray-600 dark:text-gray-300">Busca em diversas fontes</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-2 text-xs text-gray-600 dark:text-gray-300">Citação de origens confiáveis</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-2 text-xs text-gray-600 dark:text-gray-300">Respostas precisas e rápidas</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatInteligente;
