import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import { 
  FileSpreadsheet, 
  Sparkles,
  Crown
} from "lucide-react";
import { 
  SectionHeader, 
  CategoryHeader, 
  PlanoAulaCard,
  SlidesDidaticosCard,
  ListaExerciciosCard,
  JogosDidaticosCard,
  AtividadesInterdisciplinaresCard,
  AssistenteApresentacaoCard
} from "./components/criar-conteudo";

export default function CriarConteudo() {
  const { theme } = useTheme();

  return (
    <div className="h-full flex flex-col">
      <SectionHeader />

      <div className="mb-6">
        <CategoryHeader 
          icon={<Crown className="h-5 w-5 text-white" />}
          title="Para Professores"
        />

        <div className="grid grid-cols-1 gap-4">
          <PlanoAulaCard />
          <SlidesDidaticosCard />
          <ListaExerciciosCard />
          <JogosDidaticosCard />
          <AtividadesInterdisciplinaresCard />
        </div>
      </div>

      <div className="mb-6">
        <CategoryHeader 
          icon={<FileSpreadsheet className="h-5 w-5 text-white" />}
          title="Para Alunos"
        />

        <div className="grid grid-cols-1 gap-4">
          <AssistenteApresentacaoCard />
        </div>
      </div>

      <div className={`mt-auto p-4 rounded-lg ${theme === "dark" ? "bg-gray-800/50" : "bg-gray-100"} text-center`}>
        <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} flex items-center justify-center gap-2`}>
          <Sparkles className="h-4 w-4 text-emerald-500" />
          Todo conteúdo gerado segue diretrizes pedagógicas e é 100% personalizável
        </p>
      </div>
    </div>
  );
}