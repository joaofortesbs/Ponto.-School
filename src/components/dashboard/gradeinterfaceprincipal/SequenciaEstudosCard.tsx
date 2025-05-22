
import React, { useState, useEffect } from "react";
import { Flame, Award, TrendingUp, ExternalLink, Calendar, Star, Zap, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function SequenciaEstudosCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  
  // Estado para controlar dados de usuário
  const [userData, setUserData] = useState({
    diasConsecutivos: 0,
    recordeDias: 0,
    proximaRecompensa: "",
    diasParaProximoNivel: 0,
    metaDiaria: 7, // Meta padrão de estudo em dias
    isNewUser: true
  });
  
  // Simular carregamento de dados do usuário
  useEffect(() => {
    // Verificar localStorage para determinar se é um novo usuário
    const storedData = localStorage.getItem('sequenciaEstudos');
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setUserData({
          ...parsedData,
          isNewUser: false
        });
      } catch (error) {
        console.error("Erro ao carregar dados de sequência de estudos:", error);
      }
    }
  }, []);

  // Componente para novos usuários
  const NewUserContent = () => (
    <div className="flex flex-col items-center justify-center text-center h-full p-4">
      <div className="mb-4">
        <Flame className="h-12 w-12 text-[#FF6B00] mx-auto mb-2" />
        <h3 className="text-lg font-bold text-[#29335C] dark:text-white mb-1">
          Comece sua jornada de estudos
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Mantenha uma rotina diária de estudos para construir sua sequência
        </p>
      </div>
      
      <div className="w-full max-w-xs mb-6">
        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-[#FF6B00] rounded-full" style={{ width: '0%' }}></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
          <span>0 dias</span>
          <span>Meta: 7 dias</span>
        </div>
      </div>

      <div className="space-y-2 w-full mb-4">
        <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center">
            <Trophy className="h-4 w-4 text-amber-500 mr-2" />
            <span className="text-sm">Seu recorde</span>
          </div>
          <span className="font-semibold">0 dias</span>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center">
            <Award className="h-4 w-4 text-purple-500 mr-2" />
            <span className="text-sm">Próxima conquista</span>
          </div>
          <span className="font-semibold">Sequência de 3 dias</span>
        </div>
      </div>

      <Button 
        className="bg-[#FF6B00] hover:bg-[#E65100] text-white font-medium px-6"
      >
        <Zap className="h-4 w-4 mr-2" />
        Começar agora
      </Button>
    </div>
  );

  // Componente para usuários com dados
  const ExistingUserContent = () => (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Flame className="h-6 w-6 text-[#FF6B00] mr-2" />
          <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
            {userData.diasConsecutivos} dias consecutivos
          </h3>
        </div>
        <span className="text-sm font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 py-1 px-2 rounded-full flex items-center">
          <Trophy className="h-3.5 w-3.5 mr-1" />
          Recorde: {userData.recordeDias} dias
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Progresso para meta de {userData.metaDiaria} dias
          </span>
          <span className="text-sm font-medium text-[#FF6B00]">
            {Math.round((userData.diasConsecutivos / userData.metaDiaria) * 100)}%
          </span>
        </div>
        <Progress 
          value={(userData.diasConsecutivos / userData.metaDiaria) * 100} 
          className="h-2" 
          indicatorClassName="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40]" 
        />
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-amber-500 mr-2" />
            <span className="text-sm">Próxima recompensa</span>
          </div>
          <span className="font-semibold">{userData.proximaRecompensa}</span>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-sm">Próximo nível</span>
          </div>
          <span className="font-semibold">Em {userData.diasParaProximoNivel} dias</span>
        </div>
      </div>

      <Button 
        className="w-full bg-[#FF6B00] hover:bg-[#E65100] text-white font-medium"
      >
        <Calendar className="h-4 w-4 mr-2" />
        Ver calendário de estudo
      </Button>
    </div>
  );

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="h-full w-full rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl bg-white dark:bg-gradient-to-br dark:from-[#0c1425] dark:to-[#0a1a2e] relative flex flex-col"
    >
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-10 w-2 h-2 bg-[#FF6B00]/40 rounded-full"></div>
        <div className="absolute top-1/3 left-10 w-3 h-3 bg-blue-400/30 dark:bg-blue-400/20 rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-purple-400/30 dark:bg-purple-400/20 rounded-full"></div>
      </div>

      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800/50">
        <h2 className="text-xl font-bold text-[#29335C] dark:text-white flex items-center">
          <Flame className="h-5 w-5 text-[#FF6B00] mr-2" />
          Sua Sequência de Estudos
        </h2>
      </div>

      {/* Conteúdo dinâmico baseado se é novo usuário ou não */}
      {userData.isNewUser ? <NewUserContent /> : <ExistingUserContent />}
    </motion.div>
  );
}
