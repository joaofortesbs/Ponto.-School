
import React, { useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

interface TopicosEstudoViewProps {
  className?: string;
}

// Dados dos tópicos de estudo
const topicosEstudo = [
  { id: 1, nome: "Matemática", icon: "📊", cor: "#FF6B00", grupos: 8 },
  { id: 2, nome: "Física", icon: "⚛️", cor: "#4F46E5", grupos: 9 },
  { id: 3, nome: "Química", icon: "🧪", cor: "#10B981", grupos: 5 },
  { id: 4, nome: "Literatura", icon: "📚", cor: "#9333EA", grupos: 4 },
  { id: 5, nome: "Biologia", icon: "🌿", cor: "#16A34A", grupos: 7 },
  { id: 6, nome: "Ciências", icon: "🔬", cor: "#0EA5E9", grupos: 6 },
  { id: 7, nome: "Computação", icon: "💻", cor: "#6366F1", grupos: 10 },
  { id: 8, nome: "Geografia", icon: "🌎", cor: "#3B82F6", grupos: 6 },
  { id: 9, nome: "Engenharia", icon: "🛠️", cor: "#F59E0B", grupos: 9 },
];

// Tipos de interfaces disponíveis
type InterfaceType = "meus-grupos" | "recomendacoes-ia" | "estatisticas";

const TopicosEstudoView: React.FC<TopicosEstudoViewProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [interfaceAtiva, setInterfaceAtiva] = useState<InterfaceType>("meus-grupos");

  // Filtrar tópicos baseado na busca
  const topicosFilterados = topicosEstudo.filter(
    (topico) => topico.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Conteúdo condicional baseado na interface selecionada
  const renderConteudoInterface = () => {
    switch (interfaceAtiva) {
      case "meus-grupos":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {topicosFilterados.map((topico) => (
              <motion.div 
                key={topico.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: topico.id * 0.05 }}
                className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: topico.cor }}>
                      <span className="text-lg">{topico.icon}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{topico.nome}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{topico.grupos} grupos</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        );
      case "recomendacoes-ia":
        return (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-lg mt-4">
            <h3 className="text-lg font-semibold text-center mb-4 text-indigo-700 dark:text-indigo-300">Recomendações Personalizadas</h3>
            <p className="text-center text-gray-600 dark:text-gray-400">
              Com base no seu perfil acadêmico e interesses, recomendamos estes grupos:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {topicosFilterados.slice(0, 3).map((topico) => (
                <motion.div 
                  key={topico.id}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-indigo-100 dark:border-indigo-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: topico.cor }}>
                        <span className="text-lg">{topico.icon}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{topico.nome}</h3>
                      <div className="flex items-center mt-1">
                        <div className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}></div>
                        </div>
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 ml-2">Match alto</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      case "estatisticas":
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mt-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Estatísticas de Participação</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg">
                <h4 className="text-amber-700 dark:text-amber-300 text-sm font-medium">Total de Grupos</h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">24</p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg">
                <h4 className="text-sky-700 dark:text-sky-300 text-sm font-medium">Participações</h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">186</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg">
                <h4 className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">Contribuições</h4>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">53</p>
              </div>
            </div>
            <div className="h-48 w-full bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
              <p className="text-gray-400 italic">Gráfico de atividade em desenvolvimento</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Seletor de interface e barra de pesquisa alinhados */}
      <div className="flex items-center gap-4 mb-4">
        {/* Seletor de interface reduzido */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-md max-w-md">
          <button
            onClick={() => setInterfaceAtiva("meus-grupos")}
            className={`py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
              interfaceAtiva === "meus-grupos"
                ? "bg-[#FF6B00] text-white shadow-sm"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <span className="flex items-center justify-center gap-1">
              <span className="text-xs">📋</span> Meus Grupos
            </span>
          </button>
          <button
            onClick={() => setInterfaceAtiva("recomendacoes-ia")}
            className={`py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
              interfaceAtiva === "recomendacoes-ia"
                ? "bg-[#FF6B00] text-white shadow-sm"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <span className="flex items-center justify-center gap-1">
              <span className="text-xs">🔍</span> Recomendações IA
            </span>
          </button>
          <button
            onClick={() => setInterfaceAtiva("estatisticas")}
            className={`py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
              interfaceAtiva === "estatisticas"
                ? "bg-[#FF6B00] text-white shadow-sm"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <span className="flex items-center justify-center gap-1">
              <span className="text-xs">📊</span> Estatísticas
            </span>
          </button>
        </div>

        {/* Barra de pesquisa ao lado direito */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Buscar grupos..."
            className="pl-10 bg-white dark:bg-[#15243b] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 h-9 focus-visible:ring-[#FF6B00] rounded-md w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <div className="h-6 w-[1px] bg-gray-300 dark:bg-gray-600 mr-2"></div>
            <button className="bg-gray-100 dark:bg-gray-700 rounded-md h-6 flex items-center px-2 text-xs font-medium text-gray-600 dark:text-gray-300 mr-2">
              Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tópicos de estudo - exibido apenas quando "Meus Grupos" está selecionado */}
      {interfaceAtiva === "meus-grupos" && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-[#FF6B00] w-8 h-8 rounded-md flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent">
              Tópicos de Estudo
            </h3>
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {topicosEstudo.map((topico) => (
              <div
                key={topico.id}
                className="flex-shrink-0 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity hover:shadow-lg hover:scale-105 transition-all duration-200"
                style={{ width: "118px", height: "70px" }}
              >
                <div
                  className="w-full h-full flex flex-col justify-end p-2"
                  style={{ backgroundColor: topico.cor }}
                >
                  <div className="text-white text-lg mb-1">{topico.icon}</div>
                  <div className="text-white text-xs font-medium">{topico.nome}</div>
                  <div className="text-white/80 text-xs">{topico.grupos} grupos</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conteúdo da interface selecionada */}
      {renderConteudoInterface()}
    </div>
  );
};

export default TopicosEstudoView;
