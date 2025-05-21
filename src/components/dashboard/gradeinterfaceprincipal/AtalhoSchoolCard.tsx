
import React, { useState } from "react";
import { Book, Calendar, Users, MessageSquare, Zap, Settings, Edit, X, Check } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

type Atalho = {
  id: string;
  titulo: string;
  icone: React.ReactNode;
  url: string;
  cor: string;
};

export default function AtalhoSchoolCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  
  const [editando, setEditando] = useState(false);
  
  const todosAtalhos: Atalho[] = [
    {
      id: "biblioteca",
      titulo: "Biblioteca",
      icone: <Book className="h-6 w-6" />,
      url: "/biblioteca",
      cor: "text-blue-500"
    },
    {
      id: "agenda",
      titulo: "Agenda",
      icone: <Calendar className="h-6 w-6" />,
      url: "/agenda",
      cor: "text-[#FF6B00]"
    },
    {
      id: "turmas",
      titulo: "Minhas Turmas",
      icone: <Users className="h-6 w-6" />,
      url: "/turmas",
      cor: "text-green-500"
    },
    {
      id: "conexao",
      titulo: "Conexão Expert",
      icone: <MessageSquare className="h-6 w-6" />,
      url: "/conexao-expert",
      cor: "text-purple-500"
    },
    {
      id: "epictus",
      titulo: "Epictus IA",
      icone: <Zap className="h-6 w-6" />,
      url: "/epictus-ia",
      cor: "text-[#FF6B00]"
    },
    {
      id: "config",
      titulo: "Configurações",
      icone: <Settings className="h-6 w-6" />,
      url: "/configuracoes",
      cor: "text-gray-500"
    }
  ];
  
  const [atalhosAtivos, setAtalhosAtivos] = useState<string[]>(
    todosAtalhos.slice(0, 6).map(atalho => atalho.id)
  );
  
  const [selecionadosTemp, setSelecionadosTemp] = useState<string[]>(atalhosAtivos);
  
  const toggleSelecao = (id: string) => {
    setSelecionadosTemp(prev => 
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };
  
  const salvarAtalhos = () => {
    setAtalhosAtivos(selecionadosTemp);
    setEditando(false);
  };
  
  const cancelarEdicao = () => {
    setSelecionadosTemp(atalhosAtivos);
    setEditando(false);
  };

  return (
    <div className={`group backdrop-blur-md ${isLightMode ? 'bg-white/90' : 'bg-[#001e3a]'} rounded-xl p-4 ${isLightMode ? 'border border-gray-200' : 'border border-white/20'} shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl h-full`}>
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className={`absolute -right-4 -top-4 w-32 h-32 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all duration-500`}></div>

      <div className="flex justify-between items-center mb-4 relative z-10">
        <h3 className={`text-lg font-bold ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
          Atalhos Rápidos
        </h3>
        
        {editando ? (
          <div className="flex items-center gap-2">
            <button 
              onClick={cancelarEdicao}
              className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <button 
              onClick={salvarAtalhos}
              className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-500 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setEditando(true)}
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
        )}
      </div>

      {editando ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {todosAtalhos.map((atalho) => (
            <div 
              key={atalho.id}
              onClick={() => toggleSelecao(atalho.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-all ${
                selecionadosTemp.includes(atalho.id) 
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700' 
                  : 'bg-gray-50 dark:bg-gray-800/50'
              }`}
            >
              <div className={`mb-2 ${atalho.cor}`}>
                {atalho.icone}
              </div>
              <p className={`text-xs font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
                {atalho.titulo}
              </p>
              <span className="text-[10px] text-blue-500 mt-1">
                {selecionadosTemp.includes(atalho.id) ? 'Selecionado' : 'Clique para selecionar'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {todosAtalhos
            .filter(atalho => atalhosAtivos.includes(atalho.id))
            .map((atalho) => (
              <a 
                key={atalho.id}
                href={atalho.url} 
                className={`flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#0A2540]/40 transition-all`}
              >
                <div className={`mb-2 ${atalho.cor}`}>
                  {atalho.icone}
                </div>
                <p className={`text-xs font-medium ${isLightMode ? 'text-gray-700' : 'text-gray-200'}`}>
                  {atalho.titulo}
                </p>
              </a>
            ))}
        </div>
      )}
    </div>
  );
}
