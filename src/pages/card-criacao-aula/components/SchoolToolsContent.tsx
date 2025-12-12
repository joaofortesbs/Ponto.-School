import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface SchoolTool {
  id: string;
  name: string;
}

const SchoolToolsContent: React.FC = () => {
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  const tools: SchoolTool[] = [
    { id: 'school-power', name: 'School Power' },
    { id: 'enem-bank', name: 'Banco de questões do ENEM' },
    { id: 'community', name: 'Comunidade' }
  ];

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-white/80 pl-4">
        Selecione as ferramentas que deseja usar:
      </h4>
      
      <div className="space-y-3">
        {tools.map((tool, index) => (
          <motion.button
            key={tool.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
            onClick={() => toggleTool(tool.id)}
            className="w-full flex items-center gap-4 p-4 rounded-lg transition-all hover:bg-white/5"
            style={{
              background: selectedTools.includes(tool.id) 
                ? 'rgba(255, 107, 0, 0.1)'
                : 'rgba(255, 107, 0, 0.05)',
              border: selectedTools.includes(tool.id)
                ? '2px solid #FF6B00'
                : '2px solid rgba(255, 107, 0, 0.2)',
              cursor: 'pointer'
            }}
          >
            {/* Checkbox customizado */}
            <motion.div
              animate={{
                scale: selectedTools.includes(tool.id) ? 1 : 0.95,
                backgroundColor: selectedTools.includes(tool.id) 
                  ? '#FF6B00'
                  : 'transparent'
              }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center border-2 border-[#FF6B00]"
            >
              {selectedTools.includes(tool.id) && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                >
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </motion.div>
              )}
            </motion.div>

            {/* Label */}
            <span className="text-base font-medium text-white">
              {tool.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SchoolToolsContent;
