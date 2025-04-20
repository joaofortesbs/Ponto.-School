import React, { useState } from "react";
import VisaoGeralContent from "./components/VisaoGeralContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Search, Bell, Zap, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ChatInteligente, CriarConteudo, AprenderMaisRapido, AnalisarCorrigir, OrganizarOtimizar, FerramentasExtras } from "@/components/epictus-ia/sections";
import { useTheme } from "@/components/ThemeProvider";
import EpictusIAHeader from "./EpictusIAHeader";


export default function EpictusIAComplete() {
  const [activeTab, setActiveTab] = useState("visao-geral");
  const { theme } = useTheme();

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF9B50] flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <h1 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Epictus IA
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative max-w-md w-72 hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Pesquisar ferramentas..."
                className="pl-8 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-[#FF6B00]"
              />
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </Button>
          </div>
        </div>
      </div>

      <Tabs
        defaultValue="visao-geral"
        className="flex-1 container mx-auto px-4 py-4"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="chat-inteligente">Chat Inteligente</TabsTrigger>
          <TabsTrigger value="criar-conteudo">Criar Conteúdo</TabsTrigger>
          <TabsTrigger value="aprender-mais-rapido">Aprender Rápido</TabsTrigger>
          <TabsTrigger value="analisar-corrigir">Analisar & Corrigir</TabsTrigger>
          <TabsTrigger value="ferramentas-extras">Ferramentas Extras</TabsTrigger>
        </TabsList>
        <TabsContent value="visao-geral">
          <VisaoGeralContent />
        </TabsContent>
        <TabsContent value="chat-inteligente">
          <ChatInteligente />
        </TabsContent>
        <TabsContent value="criar-conteudo">
          <CriarConteudo />
        </TabsContent>
        <TabsContent value="aprender-mais-rapido">
          <AprenderMaisRapido />
        </TabsContent>
        <TabsContent value="analisar-corrigir">
          <AnalisarCorrigir />
        </TabsContent>
        <TabsContent value="ferramentas-extras">
          <FerramentasExtras />
        </TabsContent>
      </Tabs>
    </div>
  );
}