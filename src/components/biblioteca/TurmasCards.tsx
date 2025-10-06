import React from "react";
import { Atom, Calculator, Beaker, Dna } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export function TurmasCards() {
  // Mock data for turmas
  const turmas = [
    {
      id: "1",
      name: "Física - 3º Ano",
      icon: <Atom className="h-5 w-5 text-blue-500" />,
    },
    {
      id: "2",
      name: "Matemática - 3º Ano",
      icon: <Calculator className="h-5 w-5 text-orange-500" />,
    },
    {
      id: "3",
      name: "Química - 3º Ano",
      icon: <Beaker className="h-5 w-5 text-green-500" />,
    },
    {
      id: "4",
      name: "Biologia - 3º Ano",
      icon: <Dna className="h-5 w-5 text-purple-500" />,
    },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-[#001427] dark:text-white mb-3">
        Minhas Turmas
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {turmas.map((turma) => (
          <Card
            key={turma.id}
            className="overflow-hidden hover:border-[#FF6B00]/50 transition-all duration-200 cursor-pointer"
          >
            <CardHeader className="p-3 flex flex-row items-center gap-2">
              {turma.icon}
              <CardTitle className="text-sm font-medium">
                {turma.name}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
