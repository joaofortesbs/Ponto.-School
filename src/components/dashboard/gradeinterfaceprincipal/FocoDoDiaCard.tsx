
import React from "react";
import { Target, Video, Book, FileText, Clock, CheckCircle, Lightning } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

type AtividadeProps = {
  id: string;
  titulo: string;
  tipo: "video" | "livro" | "exercicio";
  tempo: string;
  prazo?: string;
  concluida: boolean;
};

export default function FocoDoDiaCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  
  const [atividades, setAtividades] = React.useState<AtividadeProps[]>([
    {
      id: "1",
      titulo: "Assistir Aula 5: Teorema de Pitágoras",
      tipo: "video",
      tempo: "30 min",
      prazo: "Hoje às 18:00",
      concluida: false
    },
    {
      id: "2",
      titulo: "Resolver Lista de Exercícios 2",
      tipo: "exercicio",
      tempo: "45 min",
      concluida: false
    },
    {
      id: "3",
      titulo: "Ler capítulo sobre Trigonometria",
      tipo: "livro",
      tempo: "20 min",
      concluida: false
    }
  ]);

  const handleToggleAtividade = (id: string) => {
    setAtividades(prevAtividades => 
      prevAtividades.map(atividade => 
        atividade.id === id ? { ...atividade, concluida: !atividade.concluida } : atividade
      )
    );
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "video":
        return <Video className="h-3.5 w-3.5 text-blue-500" />;
      case "livro":
        return <Book className="h-3.5 w-3.5 text-green-500" />;
      case "exercicio":
        return <FileText className="h-3.5 w-3.5 text-orange-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`group backdrop-blur-md ${isLightMode ? 'bg-white/90' : 'bg-[#001e3a]'} rounded-xl p-4 ${isLightMode ? 'border border-gray-200' : 'border border-white/20'} shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl h-full`}>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className={`absolute -right-4 -top-4 w-32 h-32 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all duration-500`}></div>

      <div className="flex items-center mb-4 relative z-10">
        <div className={`${isLightMode ? 'bg-blue-50' : 'bg-[#0A2540]/60'} p-2 rounded-lg ${isLightMode ? 'shadow' : 'shadow-inner'} ${isLightMode ? 'border border-blue-100' : 'border border-[#2A4D6E]/50'} mr-3`}>
          <Target className={`h-5 w-5 ${isLightMode ? 'text-[#FF6B00]' : 'text-[#FF6B00]'}`} />
        </div>
        <h3 className={`text-lg font-bold ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
          Seu Foco Hoje: <span className="text-[#FF6B00]">Revisão de Trigonometria</span>
        </h3>
      </div>

      <div className="space-y-3 mt-4">
        {atividades.map((atividade) => (
          <div 
            key={atividade.id}
            className={`flex items-start p-2 rounded-lg transition-all ${isLightMode ? 'hover:bg-gray-50' : 'hover:bg-[#0A2540]/40'} cursor-pointer`}
            onClick={() => handleToggleAtividade(atividade.id)}
          >
            <div className="flex-shrink-0 mt-0.5">
              {atividade.concluida ? (
                <CheckCircle className="h-5 w-5 text-[#FF6B00]" />
              ) : (
                <div className={`h-5 w-5 rounded-full border-2 ${isLightMode ? 'border-gray-300' : 'border-gray-500'}`} />
              )}
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center">
                <span className="mr-2">{getTipoIcon(atividade.tipo)}</span>
                <p className={`text-sm font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-200'} ${atividade.concluida ? 'line-through opacity-70' : ''}`}>
                  {atividade.titulo}
                </p>
              </div>
              <div className="flex items-center mt-1">
                <Clock className="h-3 w-3 text-gray-400 mr-1" />
                <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'} mr-3`}>
                  {atividade.tempo}
                </span>
                {atividade.prazo && (
                  <span className={`text-xs ${atividade.prazo.includes("Hoje") ? 'text-red-500' : isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {atividade.prazo}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 italic">
          <Lightning className="h-3.5 w-3.5 mr-1 text-[#FF6B00]" />
          <span>Concentre-se nos exercícios práticos hoje.</span>
        </div>
        <button className="ml-auto bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white text-xs py-1.5 px-3 rounded-md transition-colors">
          Iniciar Foco do Dia
        </button>
      </div>
    </div>
  );
}
