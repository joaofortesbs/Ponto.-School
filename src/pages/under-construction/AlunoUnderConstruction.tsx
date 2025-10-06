
import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Rocket } from 'lucide-react';

interface AlunoUnderConstructionProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const AlunoUnderConstruction: React.FC<AlunoUnderConstructionProps> = ({ 
  title, 
  description,
  icon: Icon = Wrench 
}) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-white to-blue-50/30 dark:from-[#001427] dark:to-[#001427]/80 p-6 overflow-auto flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Card de Construção */}
        <div className="bg-white dark:bg-[#0A2540] rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-white/10">
          {/* Decorative Header */}
          <div className="h-32 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQwIiBoZWlnaHQ9IjE0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgLTYpIiBmaWxsPSIjRkZGIiBmaWxsLW9wYWNpdHk9Ii4yIj48Y2lyY2xlIGN4PSI0OCIgY3k9IjQ4IiByPSI4Ii8+PGNpcmNsZSBjeD0iNDgiIGN5PSI5NiIgcj0iOCIvPjxjaXJjbGUgY3g9Ijk2IiBjeT0iNDgiIHI9IjgiLz48Y2lyY2xlIGN4PSI5NiIgY3k9Ijk2IiByPSI4Ii8+PGNpcmNsZSBjeD0iNDgiIGN5PSIxNDQiIHI9IjgiLz48Y2lyY2xlIGN4PSI5NiIgY3k9IjE0NCIgcj0iOCIvPjxjaXJjbGUgY3g9IjE0NCIgY3k9IjQ4IiByPSI4Ii8+PGNpcmNsZSBjeD0iMTQ0IiBjeT0iOTYiIHI9IjgiLz48Y2lyY2xlIGN4PSIxNDQiIGN5PSIxNDQiIHI9IjgiLz48L2c+PC9nPjwvc3ZnPg==')] bg-repeat"></div>
            </div>
            <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full"></div>
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-white/10 rounded-full"></div>
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-6 rounded-full relative">
                <Icon className="h-16 w-16 text-[#2563eb]" />
                <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-2">
                  <Rocket className="h-4 w-4 text-yellow-900" />
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[#001427] dark:text-white mb-3">
              Interface em Construção
            </h2>

            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              {description}
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Icon className="h-4 w-4" />
              <span>Aguarde as novidades</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AlunoUnderConstruction;
