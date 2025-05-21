
import React from "react";
import { Pencil, BookOpen, Calendar, Users, Brain, Settings, MessageSquare } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function AtalhoSchoolCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";

  // Lista de atalhos padrão
  const atalhos = [
    { id: 1, nome: "Biblioteca", icone: <BookOpen className="h-5 w-5" />, cor: "text-blue-500", link: "/biblioteca" },
    { id: 2, nome: "Agenda", icone: <Calendar className="h-5 w-5" />, cor: "text-[#FF6B00]", link: "/agenda" },
    { id: 3, nome: "Turmas", icone: <Users className="h-5 w-5" />, cor: "text-green-500", link: "/turmas" },
    { id: 4, nome: "Epictus IA", icone: <Brain className="h-5 w-5" />, cor: "text-purple-500", link: "/epictus-ia" },
    { id: 5, nome: "Conexão Expert", icone: <MessageSquare className="h-5 w-5" />, cor: "text-yellow-500", link: "/conexao-expert" },
    { id: 6, nome: "Configurações", icone: <Settings className="h-5 w-5" />, cor: "text-gray-500", link: "/configuracoes" },
  ];

  const abrirModal = () => {
    // Aqui seria implementada a lógica para abrir o modal de personalização
    console.log("Abrir modal de personalização");
  };

  const navegarPara = (link) => {
    // Aqui seria implementada a lógica para navegar para o link
    console.log(`Navegando para ${link}`);
  };

  return (
    <div className={`rounded-xl overflow-hidden ${isLightMode ? 'bg-white' : 'bg-[#001e3a]'} shadow-lg ${isLightMode ? 'border border-gray-200' : 'border border-white/20'}`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className={`font-semibold ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
            Atalhos Rápidos
          </h3>
          <button
            onClick={abrirModal}
            className={`rounded-full p-1.5 transition-colors ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-[#0A2540]'}`}
          >
            <Pencil className={`h-4 w-4 ${isLightMode ? 'text-gray-500' : 'text-gray-400'} hover:text-[#FF6B00]`} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {atalhos.map((atalho) => (
            <button
              key={atalho.id}
              onClick={() => navegarPara(atalho.link)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${isLightMode ? 'hover:bg-gray-50' : 'hover:bg-[#0A2540]/50'} active:scale-95`}
            >
              <div className={`mb-2 ${atalho.cor}`}>
                {atalho.icone}
              </div>
              <span className={`text-xs ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                {atalho.nome}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
