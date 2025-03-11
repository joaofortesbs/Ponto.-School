import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export default function OrganizacaoPlaceholder() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#29335C] dark:text-white font-montserrat">
          Organização
        </h1>
        <Button variant="outline" onClick={() => window.history.back()}>
          Voltar
        </Button>
      </div>

      <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Calendar className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          Página de Organização em Desenvolvimento
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Esta funcionalidade está sendo implementada e estará disponível em
          breve.
        </p>
      </div>
    </div>
  );
}
