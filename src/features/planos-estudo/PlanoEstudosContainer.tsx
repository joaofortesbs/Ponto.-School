import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Plus, Search } from "lucide-react";
import PlanoCard from "./components/PlanoCard";
import PlanoDetalhe from "./components/PlanoDetalhe";
import CriarPlano from "./components/CriarPlano";
import EditarPlano from "./components/EditarPlano";
import planosMock from "./data/planos-mock";

export default function PlanoEstudosContainer() {
  const [activeTab, setActiveTab] = useState("meus-planos");
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Handle plan selection
  const handleSelectPlan = (id: string) => {
    setSelectedPlan(id);
    setIsEditingPlan(false);
  };

  // Handle edit button click
  const handleEditPlan = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPlan(id);
    setIsEditingPlan(true);
  };

  // Render the appropriate content based on state
  const renderContent = () => {
    if (isCreatingPlan) {
      return (
        <CriarPlano
          onCancel={() => setIsCreatingPlan(false)}
          onSave={() => {
            setIsCreatingPlan(false);
            // Here you would add the new plan to the list
          }}
        />
      );
    }

    if (isEditingPlan && selectedPlan) {
      return (
        <EditarPlano
          planoId={selectedPlan}
          planos={planosMock}
          onCancel={() => {
            setIsEditingPlan(false);
          }}
          onSave={() => {
            setIsEditingPlan(false);
            // Here you would update the plan in the list
          }}
        />
      );
    }

    if (selectedPlan) {
      return (
        <PlanoDetalhe
          planoId={selectedPlan}
          planos={planosMock}
          onClose={() => setSelectedPlan(null)}
          onEdit={() => setIsEditingPlan(true)}
        />
      );
    }

    // Filter plans based on search query
    const filteredPlanos = planosMock.filter(
      (plano) =>
        plano.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plano.descricao.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
      <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#29335C] dark:text-white flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-[#FF6B00]" /> Planos de
                Estudos
              </h1>
              <p className="text-[#64748B] dark:text-white/60">
                Organize seus estudos e acompanhe seu progresso
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar planos..."
                  className="pl-9 bg-white dark:bg-[#29335C]/20 border-gray-200 dark:border-gray-700 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                onClick={() => setIsCreatingPlan(true)}
              >
                <Plus className="h-4 w-4 mr-1" /> Novo Plano
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="bg-white dark:bg-[#29335C]/20 p-1 mb-6">
              <TabsTrigger
                value="meus-planos"
                className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-gray-600 dark:text-gray-300"
              >
                Meus Planos
              </TabsTrigger>
              <TabsTrigger
                value="modelos"
                className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-gray-600 dark:text-gray-300"
              >
                Modelos
              </TabsTrigger>
              <TabsTrigger
                value="compartilhados"
                className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-gray-600 dark:text-gray-300"
              >
                Compartilhados
              </TabsTrigger>
              <TabsTrigger
                value="arquivados"
                className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white text-gray-600 dark:text-gray-300"
              >
                Arquivados
              </TabsTrigger>
            </TabsList>

            <TabsContent value="meus-planos" className="mt-0">
              {filteredPlanos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlanos.map((plano) => (
                    <PlanoCard
                      key={plano.id}
                      plano={plano}
                      onSelect={handleSelectPlan}
                      onEdit={handleEditPlan}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
                    Nenhum plano encontrado
                  </h3>
                  <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                    {searchQuery ? "Tente uma busca diferente ou " : ""}
                    crie um novo plano para começar.
                  </p>
                  <Button
                    className="mt-4 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                    onClick={() => setIsCreatingPlan(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Criar Novo Plano
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="modelos" className="mt-0">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
                  Modelos de planos em breve
                </h3>
                <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                  Estamos trabalhando para trazer modelos de planos de estudo
                  para você.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="compartilhados" className="mt-0">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
                  Planos compartilhados em breve
                </h3>
                <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                  Em breve você poderá compartilhar e acessar planos de estudo
                  de outros usuários.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="arquivados" className="mt-0">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
                  Nenhum plano arquivado
                </h3>
                <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                  Planos arquivados aparecerão aqui.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  };

  return renderContent();
}
