import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, Calendar, BarChart3, Target } from "lucide-react";
import GruposEstudoSection from "./GruposEstudoSection";

interface EstudosViewProps {
  onSelectGrupo?: (grupoId: string) => void;
}

const EstudosView: React.FC<EstudosViewProps> = ({ onSelectGrupo }) => {
  const [activeTab, setActiveTab] = useState("grupos");

  return (
    <div className="w-full h-full bg-white dark:bg-[#0f1525] text-gray-900 dark:text-white p-6 overflow-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Estudos</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie seus estudos, grupos e materiais
        </p>
      </div>

      <Tabs
        defaultValue="grupos"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-full w-full md:w-auto">
          <TabsTrigger
            value="grupos"
            className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1525] data-[state=active]:text-[#FF6B00]"
          >
            <Users className="h-4 w-4 mr-2" /> Grupos de Estudo
          </TabsTrigger>
          <TabsTrigger
            value="materiais"
            className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1525] data-[state=active]:text-[#FF6B00]"
          >
            <BookOpen className="h-4 w-4 mr-2" /> Materiais
          </TabsTrigger>
          <TabsTrigger
            value="progresso"
            className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1525] data-[state=active]:text-[#FF6B00]"
          >
            <BarChart3 className="h-4 w-4 mr-2" /> Progresso
          </TabsTrigger>
          <TabsTrigger
            value="metas"
            className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1525] data-[state=active]:text-[#FF6B00]"
          >
            <Target className="h-4 w-4 mr-2" /> Metas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grupos" className="mt-0">
          <GruposEstudoSection onSelectGrupo={onSelectGrupo} />
        </TabsContent>

        <TabsContent value="materiais" className="mt-0">
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-100 dark:border-gray-800">
            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Materiais de Estudo
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Esta seção está em desenvolvimento. Em breve você poderá acessar
              materiais de estudo organizados por disciplina.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="progresso" className="mt-0">
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-100 dark:border-gray-800">
            <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Progresso de Estudos
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Esta seção está em desenvolvimento. Em breve você poderá
              acompanhar seu progresso em cada disciplina.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="metas" className="mt-0">
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-100 dark:border-gray-800">
            <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Metas de Estudo
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Esta seção está em desenvolvimento. Em breve você poderá definir e
              acompanhar suas metas de estudo.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EstudosView;
