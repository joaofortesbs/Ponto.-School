
import React from "react";
import { Construction } from "lucide-react";

interface PlaceholderSectionProps {
  tabName: string;
}

export default function PlaceholderSection({ tabName }: PlaceholderSectionProps) {
  const getTabDisplayName = (tab: string) => {
    const names: Record<string, string> = {
      events: "Eventos",
      members: "Membros", 
      files: "Arquivos",
      about: "Sobre"
    };
    return names[tab] || tab;
  };

  return (
    <div className="flex flex-col items-center justify-center h-96 text-center">
      <Construction className="h-16 w-16 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-white mb-2">
        {getTabDisplayName(tabName)} em Desenvolvimento
      </h3>
      <p className="text-gray-400 max-w-md">
        Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
        Continue usando a seção de discussões para se comunicar com o grupo.
      </p>
    </div>
  );
}
