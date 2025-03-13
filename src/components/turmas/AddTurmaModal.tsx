import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Search, X, Plus, ArrowRight } from "lucide-react";

interface AddTurmaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTurma: (code: string) => void;
}

const AddTurmaModal: React.FC<AddTurmaModalProps> = ({
  isOpen,
  onClose,
  onAddTurma,
}) => {
  const [activeTab, setActiveTab] = useState("codigo");
  const [searchQuery, setSearchQuery] = useState("");
  const [turmaCode, setTurmaCode] = useState("");

  const handleSubmitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (turmaCode.trim()) {
      onAddTurma(turmaCode);
      onClose();
    }
  };

  // Sample turmas for the search tab
  const availableTurmas = [
    {
      id: "t1",
      nome: "Introdução à Programação",
      professor: "Prof. Ricardo Oliveira",
      disciplina: "Ciência da Computação",
      alunos: 42,
      inicio: "15/08/2023",
    },
    {
      id: "t2",
      nome: "Estatística Aplicada",
      professor: "Profa. Juliana Mendes",
      disciplina: "Matemática",
      alunos: 38,
      inicio: "10/08/2023",
    },
    {
      id: "t3",
      nome: "Literatura Brasileira",
      professor: "Prof. Carlos Eduardo",
      disciplina: "Letras",
      alunos: 35,
      inicio: "20/08/2023",
    },
  ];

  const filteredTurmas = availableTurmas.filter(
    (turma) =>
      turma.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      turma.professor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      turma.disciplina.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden max-w-2xl w-full shadow-xl"
      >
        <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white font-montserrat">
              Adicionar Nova Turma
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-white/80 hover:text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid grid-cols-2 gap-4 bg-transparent">
              <TabsTrigger
                value="codigo"
                className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] data-[state=active]:border-[#FF6B00] border rounded-lg px-4 py-2 font-montserrat"
              >
                Código de Acesso
              </TabsTrigger>
              <TabsTrigger
                value="buscar"
                className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] data-[state=active]:border-[#FF6B00] border rounded-lg px-4 py-2 font-montserrat"
              >
                Buscar Turmas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="codigo" className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300 font-open-sans">
                Digite o código de acesso fornecido pelo seu professor para se
                inscrever na turma.
              </p>
              <form onSubmit={handleSubmitCode} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Ex: TURMA-123456"
                    value={turmaCode}
                    onChange={(e) => setTurmaCode(e.target.value)}
                    className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 text-lg text-center uppercase tracking-wider"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    O código é fornecido pelo professor da turma
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                    disabled={!turmaCode.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Turma
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="buscar" className="space-y-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF6B00]">
                  <Search className="h-4 w-4" />
                </div>
                <Input
                  placeholder="Buscar por nome, professor ou disciplina..."
                  className="pl-9 border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {filteredTurmas.length > 0 ? (
                  filteredTurmas.map((turma) => (
                    <div
                      key={turma.id}
                      className="bg-white dark:bg-[#29335C]/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/30 transition-colors cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-base font-bold text-gray-900 dark:text-white font-montserrat">
                            {turma.nome}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 font-open-sans">
                            {turma.professor} • {turma.disciplina}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>{turma.alunos} alunos</span>
                            <span>Início: {turma.inicio}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="h-8 text-xs bg-[#FF6B00] hover:bg-[#FF8C40] text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                          onClick={() => {
                            onAddTurma(turma.id);
                            onClose();
                          }}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" /> Inscrever-se
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      Nenhuma turma encontrada com os termos da busca.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
};

export default AddTurmaModal;
