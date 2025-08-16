
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  X, 
  User, 
  MessageSquare,
  Edit,
  Check,
  Loader2
} from "lucide-react";

interface EpictusPersonalizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  setUserName: (name: string) => void;
  toast: any;
}

export const EpictusPersonalizeModal: React.FC<EpictusPersonalizeModalProps> = ({
  isOpen,
  onClose,
  userName,
  setUserName,
  toast
}) => {
  const [tempNickname, setTempNickname] = useState("");
  const [tempOccupation, setTempOccupation] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (tempNickname.trim()) {
      setUserName(tempNickname.trim());
    }
    
    toast({
      title: "Configurações salvas",
      description: "Suas preferências foram atualizadas com sucesso!",
      duration: 3000,
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-gradient-to-br from-white/90 to-gray-50/80 dark:from-gray-900/90 dark:to-gray-950/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 p-4 shadow-2xl w-[85%] max-w-md max-h-[480px] animate-fadeIn flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 shadow-lg shadow-orange-500/20">
              <User className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-500 dark:from-orange-400 dark:to-amber-300">
                Personalizar Epictus IA
              </h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Configure sua experiência personalizada</p>
            </div>
          </div>
          <Button 
            variant="ghost"
            size="icon"
            className="h-7 w-7 p-0 rounded-full bg-white/30 dark:bg-gray-800/30 backdrop-blur-md hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200"
            onClick={onClose}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="h-[350px] pr-2 relative z-10">
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gradient p-1 bg-white dark:bg-gray-800">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <Avatar className="w-full h-full">
                    <AvatarImage 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&mouth=smile&eyes=happy"
                      alt="Avatar Epictus IA"
                      className="w-full h-full object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] text-white">
                      IA
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div className="absolute bottom-0 right-0">
                <div className="bg-white dark:bg-gray-800 rounded-full p-1 shadow-md border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Edit className="h-4 w-4 text-orange-500" />
                </div>
              </div>
            </div>
            
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">Epictus IA</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
              Seu assistente de suporte inteligente, personalizado para atender às suas necessidades.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white/70 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100/80 dark:border-gray-700/30 backdrop-filter backdrop-blur-sm shadow-sm">
              <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-orange-500" />
                Como o Epictus IA deveria chamar você?
              </h5>
              
              <div className="space-y-3">
                <Input
                  value={tempNickname || userName}
                  onChange={(e) => setTempNickname(e.target.value)}
                  placeholder="Digite seu nome ou apelido preferido"
                  className="bg-white/50 dark:bg-gray-900/50 border-gray-200/60 dark:border-gray-700/60 focus:border-orange-400 dark:focus:border-orange-500 text-sm"
                />
                
                <Input
                  value={tempOccupation}
                  onChange={(e) => setTempOccupation(e.target.value)}
                  placeholder="Sua ocupação ou área de interesse (opcional)"
                  className="bg-white/50 dark:bg-gray-900/50 border-gray-200/60 dark:border-gray-700/60 focus:border-orange-400 dark:focus:border-orange-500 text-sm"
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="mt-4 flex gap-3 relative z-10">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 bg-white/50 dark:bg-gray-800/50 border-gray-200/60 dark:border-gray-700/60 hover:bg-white/80 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-300"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isUploading}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
