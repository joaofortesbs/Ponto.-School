
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { BellPlus, BellRing, Clock, Construction, BookMarked } from "lucide-react";
import { motion } from "framer-motion";

export default function PortalPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 flex items-center justify-center transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <div className="h-24 bg-gradient-to-r from-[#FF6B00] to-[#FF9248] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQwIiBoZWlnaHQ9IjE0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgLTYpIiBmaWxsPSIjRkZGIiBmaWxsLW9wYWNpdHk9Ii4yIj48Y2lyY2xlIGN4PSI0OCIgY3k9IjQ4IiByPSI4Ii8+PGNpcmNsZSBjeD0iNDgiIGN5PSI5NiIgcj0iOCIvPjxjaXJjbGUgY3g9Ijk2IiBjeT0iNDgiIHI9IjgiLz48Y2lyY2xlIGN4PSI5NiIgY3k9Ijk2IiByPSI4Ii8+PGNpcmNsZSBjeD0iNDgiIGN5PSIxNDQiIHI9IjgiLz48Y2lyY2xlIGN4PSI5NiIgY3k9IjE0NCIgcj0iOCIvPjxjaXJjbGUgY3g9IjE0NCIgY3k9IjQ4IiByPSI4Ii8+PGNpcmNsZSBjeD0iMTQ0IiBjeT0iOTYiIHI9IjgiLz48Y2lyY2xlIGN4PSIxNDQiIGN5PSIxNDQiIHI9IjgiLz48L2c+PC9nPjwvc3ZnPg==')] bg-repeat"></div>
          </div>
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full"></div>
          <div className="absolute -top-8 -left-8 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-white/20 p-3 rounded-full">
            <BookMarked className="h-8 w-8 text-white" />
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Construction className="h-5 w-5 text-[#FF6B00]" />
            <h2 className="text-xl font-bold text-[#29335C] dark:text-white">Mercado em Desenvolvimento</h2>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Estamos trabalhando para criar um espaço onde você poderá adquirir cursos, materiais educacionais e recursos exclusivos para impulsionar seus estudos.
          </p>

          <div className="bg-[#F8F9FA] dark:bg-[#051a33] rounded-lg p-4 mb-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">Lançamento Previsto</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Em breve teremos novidades!</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={toggleNotifications}
            className={`w-full gap-2 text-white ${
              notificationsEnabled 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-[#FF6B00] hover:bg-[#FF6B00]/90"
            }`}
          >
            {notificationsEnabled ? (
              <>
                <BellRing className="h-4 w-4" />
                Notificações Ativadas
              </>
            ) : (
              <>
                <BellPlus className="h-4 w-4" />
                Ativar Notificações
              </>
            )}
          </Button>

          {notificationsEnabled && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-xs text-center text-green-600 dark:text-green-400 mt-2"
            >
              Você receberá um aviso quando o Mercado estiver disponível!
            </motion.p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
