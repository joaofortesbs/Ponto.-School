
import React from "react";
import GruposEstudoView from "@/components/turmas/minisecao-gruposdeestudo/GruposEstudoView";

export default function GruposPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#001427] p-4">
      <div className="container mx-auto max-w-7xl">
        <GruposEstudoView />
      </div>
    </div>
  );
}
