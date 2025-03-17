import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaterialsList } from "./MaterialsList";
import { MaterialsGrid } from "./MaterialsGrid";
import { ClubeDoLivro } from "./ClubeDoLivro";
import { List, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BibliotecaContent() {
  const [activeTab, setActiveTab] = useState("minhas-turmas");
  const [viewMode, setViewMode] = useState("list"); // list, grid
  const [sortBy, setSortBy] = useState("relevance"); // relevance, date, alphabetical, type, popular

  return (
    <div className="mt-4">
      <Tabs
        defaultValue="minhas-turmas"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-5 h-10">
          <TabsTrigger value="minhas-turmas" className="text-xs">
            Minhas Turmas
          </TabsTrigger>
          <TabsTrigger value="disciplinas" className="text-xs">
            Disciplinas
          </TabsTrigger>
          <TabsTrigger value="favoritos" className="text-xs">
            Favoritos
          </TabsTrigger>
          <TabsTrigger value="recomendados" className="text-xs">
            Recomendados
          </TabsTrigger>
          <TabsTrigger value="clube-livro" className="text-xs">
            Clube do Livro
          </TabsTrigger>
        </TabsList>

        <div className="py-2 flex justify-between items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {activeTab === "clube-livro" ? "" : "42 materiais encontrados"}
          </div>
          {activeTab !== "clube-livro" && (
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  className={`h-8 w-8 rounded-none ${viewMode === "list" ? "bg-[#FF6B00] text-white" : ""}`}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  className={`h-8 w-8 rounded-none ${viewMode === "grid" ? "bg-[#FF6B00] text-white" : ""}`}
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
              <select
                className="h-8 rounded-md border border-gray-200 dark:border-gray-700 text-xs px-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="relevance">Relevância</option>
                <option value="date">Data (Recentes)</option>
                <option value="alphabetical">Alfabética</option>
                <option value="type">Tipo</option>
                <option value="popular">Mais Acessados</option>
              </select>
            </div>
          )}
        </div>

        <TabsContent value="minhas-turmas">
          {viewMode === "list" ? <MaterialsList /> : <MaterialsGrid />}
        </TabsContent>

        <TabsContent value="disciplinas">
          {viewMode === "list" ? <MaterialsList /> : <MaterialsGrid />}
        </TabsContent>

        <TabsContent value="favoritos">
          {viewMode === "list" ? <MaterialsList /> : <MaterialsGrid />}
        </TabsContent>

        <TabsContent value="recomendados">
          {viewMode === "list" ? <MaterialsList /> : <MaterialsGrid />}
        </TabsContent>

        <TabsContent value="clube-livro">
          <ClubeDoLivro />
        </TabsContent>
      </Tabs>
    </div>
  );
}
