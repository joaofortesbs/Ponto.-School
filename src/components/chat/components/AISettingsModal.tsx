
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  X, 
  Sparkles, 
  Headphones, 
  Bell 
} from "lucide-react";

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiIntelligenceLevel: 'basic' | 'normal' | 'advanced';
  setAIIntelligenceLevel: (level: 'basic' | 'normal' | 'advanced') => void;
  aiLanguageStyle: 'casual' | 'formal' | 'technical';
  setAILanguageStyle: (style: 'casual' | 'formal' | 'technical') => void;
  enableNotificationSounds: boolean;
  setEnableNotificationSounds: (enabled: boolean) => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({
  isOpen,
  onClose,
  aiIntelligenceLevel,
  setAIIntelligenceLevel,
  aiLanguageStyle,
  setAILanguageStyle,
  enableNotificationSounds,
  setEnableNotificationSounds
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-xl w-[85%] max-w-sm animate-fadeIn">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium flex items-center gap-1">
          <Sparkles className="h-4 w-4 text-orange-500" />
          Configurações da IA
        </h4>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onClose}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium mb-1 block">Nível de Inteligência</label>
          <div className="grid grid-cols-3 gap-2">
            {['basic', 'normal', 'advanced'].map((level) => (
              <div 
                key={level}
                className={`flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-all ${
                  aiIntelligenceLevel === level 
                    ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-400" 
                    : "bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/10"
                }`}
                onClick={() => setAIIntelligenceLevel(level as 'basic' | 'normal' | 'advanced')}
              >
                <span className="text-xs font-medium">
                  {level === 'basic' ? 'Básico' : level === 'normal' ? 'Normal' : 'Avançado'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium mb-1 block">Estilo de Linguagem</label>
          <div className="grid grid-cols-3 gap-2">
            {['casual', 'formal', 'technical'].map((style) => (
              <div 
                key={style}
                className={`flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-all ${
                  aiLanguageStyle === style 
                    ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-400" 
                    : "bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/10"
                }`}
                onClick={() => setAILanguageStyle(style as 'casual' | 'formal' | 'technical')}
              >
                <span className="text-xs font-medium">
                  {style === 'casual' ? 'Casual' : style === 'formal' ? 'Formal' : 'Técnico'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium mb-1 block">Sons de Notificação</label>
          <div 
            className={`flex items-center p-2 rounded-lg border cursor-pointer transition-all ${
              enableNotificationSounds 
                ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-400" 
                : "bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/10"
            }`}
            onClick={() => setEnableNotificationSounds(!enableNotificationSounds)}
          >
            <div className="flex items-center justify-center w-full">
              {enableNotificationSounds ? (
                <Headphones className="h-4 w-4 mr-2" />
              ) : (
                <Bell className="h-4 w-4 mr-2" />
              )}
              <span className="text-xs font-medium">{enableNotificationSounds ? 'Sons ativados' : 'Sons desativados'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
