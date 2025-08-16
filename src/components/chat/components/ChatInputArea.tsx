
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Paperclip, 
  Mic, 
  Settings,
  X,
  File,
  Image,
  Video,
  Music
} from "lucide-react";

interface ChatInputAreaProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  handleSendMessage: () => Promise<void>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isLoading: boolean;
  aiIntelligenceLevel: 'basic' | 'normal' | 'advanced';
  aiLanguageStyle: 'casual' | 'formal' | 'technical';
  setIsShowingAISettings: (show: boolean) => void;
}

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  inputMessage,
  setInputMessage,
  selectedFiles,
  setSelectedFiles,
  handleSendMessage,
  fileInputRef,
  isLoading,
  aiIntelligenceLevel,
  aiLanguageStyle,
  setIsShowingAISettings
}) => {
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-4">
      {/* Selected files display */}
      {selectedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/20 p-2 rounded-lg">
              <div className="flex items-center gap-1">
                {file.type.startsWith('image/') && <Image className="h-3 w-3 text-orange-500" />}
                {file.type.startsWith('video/') && <Video className="h-3 w-3 text-orange-500" />}
                {file.type.startsWith('audio/') && <Music className="h-3 w-3 text-orange-500" />}
                {!file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/') && <File className="h-3 w-3 text-orange-500" />}
                <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-[100px]">
                  {file.name}
                </span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* AI Settings indicator */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>IA:</span>
          <Badge variant="outline" className="text-xs">
            {aiIntelligenceLevel === 'basic' ? 'Básico' : aiIntelligenceLevel === 'normal' ? 'Normal' : 'Avançado'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {aiLanguageStyle === 'casual' ? 'Casual' : aiLanguageStyle === 'formal' ? 'Formal' : 'Técnico'}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2"
          onClick={() => setIsShowingAISettings(true)}
        >
          <Settings className="h-3 w-3" />
        </Button>
      </div>

      {/* Input area */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Input
            placeholder="Digite sua mensagem..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pr-24 resize-none border-orange-200 dark:border-orange-700 focus:border-orange-400 dark:focus:border-orange-500"
            disabled={isLoading}
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={openFileSelector}
              disabled={isLoading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={isLoading}
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Button
          onClick={handleSendMessage}
          disabled={isLoading || (inputMessage.trim() === "" && selectedFiles.length === 0)}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
