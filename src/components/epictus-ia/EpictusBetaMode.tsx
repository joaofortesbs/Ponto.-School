
import React, { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const EpictusBetaMode: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    navigate("/epictus-ia");
  };

  return (
    <div className={`w-full h-full flex flex-col ${theme === "dark" ? "bg-[#0A1628]" : "bg-gray-50"}`}>
      <div className="p-6 flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          className={`${theme === "dark" ? "text-white hover:bg-gray-800" : "text-gray-700 hover:bg-gray-200"}`}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <h2 className={`text-4xl md:text-5xl font-bold mb-2 text-center ${
          theme === "dark" ? "text-white" : "text-gray-900"
        } flex items-center justify-center`}>
          Epictus IA BETA
          <Sparkles className="h-6 w-6 ml-2 text-amber-500 animate-pulse" />
        </h2>
        
        <div className={`mt-6 mb-10 text-center ${theme === "dark" ? "text-gray-300" : "text-gray-700"} max-w-xl`}>
          <p className="text-lg">
            Experimente nossa versão beta avançada com recursos de última geração em inteligência artificial.
          </p>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 border-r-amber-300 border-b-amber-200 border-l-amber-400 animate-spin"></div>
              <Sparkles className="absolute inset-0 w-full h-full p-4 text-amber-500 animate-pulse" />
            </div>
            <p className={`text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Preparando ambiente BETA...
            </p>
          </div>
        ) : (
          <div className={`w-full max-w-4xl p-8 rounded-lg ${
            theme === "dark" ? "bg-gray-800/50 border border-gray-700" : "bg-white border border-gray-200 shadow-lg"
          } text-center`}>
            <h3 className={`text-2xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Esta experiência está em desenvolvimento
            </h3>
            <p className={`mb-6 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              A versão BETA do Epictus IA está sendo desenvolvida com os mais avançados
              recursos de personalização e aprendizado adaptativo. Em breve você
              terá acesso a um assistente de IA verdadeiramente revolucionário.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Button 
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                onClick={handleBack}
              >
                Voltar para Epictus IA
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EpictusBetaMode;
