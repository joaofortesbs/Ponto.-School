
import React, { useState } from "react";
import { 
  BookOpen,
  Calendar,
  Users,
  Bot,
  Settings,
  MessageSquareText,
  PencilLine,
  Dialog
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type Shortcut = {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  path: string;
};

const AtalhoSchoolCard = () => {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const allShortcuts: Shortcut[] = [
    {
      id: "biblioteca",
      name: "Biblioteca",
      icon: <BookOpen className="h-6 w-6" />,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
      path: "/biblioteca"
    },
    {
      id: "agenda",
      name: "Agenda",
      icon: <Calendar className="h-6 w-6" />,
      color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300",
      path: "/agenda"
    },
    {
      id: "turmas",
      name: "Minhas Turmas",
      icon: <Users className="h-6 w-6" />,
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300",
      path: "/turmas"
    },
    {
      id: "epictus-ia",
      name: "Epictus IA",
      icon: <Bot className="h-6 w-6" />,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
      path: "/epictus-ia"
    },
    {
      id: "conexao",
      name: "Conexão Expert",
      icon: <MessageSquareText className="h-6 w-6" />,
      color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
      path: "/pedidos-ajuda"
    },
    {
      id: "config",
      name: "Configurações",
      icon: <Settings className="h-6 w-6" />,
      color: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-300",
      path: "/configuracoes"
    }
  ];
  
  const [activeShortcuts, setActiveShortcuts] = useState<Shortcut[]>(allShortcuts.slice(0, 6));
  const [selectedShortcuts, setSelectedShortcuts] = useState<string[]>(
    activeShortcuts.map(shortcut => shortcut.id)
  );
  
  const handleShortcutClick = (path: string) => {
    navigate(path);
  };
  
  const toggleShortcutSelection = (id: string) => {
    if (selectedShortcuts.includes(id)) {
      setSelectedShortcuts(selectedShortcuts.filter(item => item !== id));
    } else {
      if (selectedShortcuts.length < 6) {
        setSelectedShortcuts([...selectedShortcuts, id]);
      }
    }
  };
  
  const saveShortcuts = () => {
    const newActiveShortcuts = allShortcuts.filter(shortcut => 
      selectedShortcuts.includes(shortcut.id)
    );
    setActiveShortcuts(newActiveShortcuts);
    setIsEditModalOpen(false);
  };
  
  return (
    <div className="group backdrop-blur-md bg-[#001e3a] rounded-xl p-4 border border-white/20 shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FF6B00]/30 h-full">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FF6B00]/5 rounded-full blur-xl group-hover:bg-[#FF6B00]/10 transition-all duration-500"></div>
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Atalhos Rápidos</h3>
        <button 
          className="text-gray-400 hover:text-[#FF6B00] transition-colors duration-200"
          onClick={() => setIsEditModalOpen(true)}
        >
          <PencilLine className="h-4 w-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {activeShortcuts.map((shortcut) => (
          <button
            key={shortcut.id}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10"
            onClick={() => handleShortcutClick(shortcut.path)}
          >
            <div className={`p-2 rounded-full ${shortcut.color.split(' ').slice(0, 2).join(' ')} mb-2`}>
              {shortcut.icon}
            </div>
            <span className="text-sm text-white">{shortcut.name}</span>
          </button>
        ))}
      </div>
      
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Personalizar Atalhos</h3>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                onClick={() => setIsEditModalOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Selecione até 6 atalhos para exibir no seu painel.
            </p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {allShortcuts.map((shortcut) => (
                <div 
                  key={shortcut.id}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => toggleShortcutSelection(shortcut.id)}
                >
                  <div className={`p-1.5 rounded-md ${shortcut.color} mr-3`}>
                    {shortcut.icon}
                  </div>
                  
                  <span className="text-gray-700 dark:text-gray-200">{shortcut.name}</span>
                  
                  <div className="ml-auto">
                    <div className={`w-5 h-5 rounded border ${
                      selectedShortcuts.includes(shortcut.id)
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300 dark:border-gray-600"
                    } flex items-center justify-center`}>
                      {selectedShortcuts.includes(shortcut.id) && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                onClick={saveShortcuts}
              >
                Salvar Atalhos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AtalhoSchoolCard;
