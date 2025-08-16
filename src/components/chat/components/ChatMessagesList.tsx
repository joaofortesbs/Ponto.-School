
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  LifeBuoy, 
  Sparkles, 
  Bot, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  Download, 
  Share2,
  ChevronRight,
  RefreshCw,
  FileText,
  Loader2
} from "lucide-react";

interface MessageFile {
  name: string;
  size: number;
  type: string;
  url: string;
}

interface ChatMessage {
  id: number;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  files?: MessageFile[];
  feedback?: 'positive' | 'negative';
  needsImprovement?: boolean;
  isEdited?: boolean;
}

interface ChatMessagesListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  userName: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  sessionId: string;
  handleMessageFeedback: (messageId: number, feedback: 'positive' | 'negative') => void;
  reformulateMessage: (messageId: number) => Promise<void>;
  summarizeMessage: (messageId: number) => Promise<void>;
  toast: any;
  openNotebookModal: (content: string) => void;
  openPresentationModal: (slides: any[]) => void;
  setShowQuizTask: (show: boolean) => void;
  setShowAprofundarModal: (show: boolean) => void;
}

export const ChatMessagesList: React.FC<ChatMessagesListProps> = ({
  messages,
  isTyping,
  userName,
  messagesEndRef,
  sessionId,
  handleMessageFeedback,
  reformulateMessage,
  summarizeMessage,
  toast,
  openNotebookModal,
  openPresentationModal,
  setShowQuizTask,
  setShowAprofundarModal
}) => {
  const [isReformulating, setIsReformulating] = React.useState(false);

  const handleReformulate = async (messageId: number) => {
    setIsReformulating(true);
    try {
      await reformulateMessage(messageId);
    } finally {
      setIsReformulating(false);
    }
  };

  const handleSummarize = async (messageId: number) => {
    setIsReformulating(true);
    try {
      await summarizeMessage(messageId);
    } finally {
      setIsReformulating(false);
    }
  };

  return (
    <ScrollArea
      className="flex-1 p-4 custom-scrollbar overflow-y-auto relative"
      style={{ maxHeight: "calc(100% - 90px)" }}
    >
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex animate-fadeIn ${message.sender === "user" ? "justify-end" : "justify-start"} group`}
          >
            {message.sender === "assistant" && (
              <div className="w-10 h-10 rounded-full overflow-hidden mr-2 flex-shrink-0">
                <Avatar>
                  <AvatarImage src="/images/tempo-image-20250329T044440497Z.png" alt="Assistente de Suporte" />
                  <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] text-white">
                    <LifeBuoy className="h-5 w-5" />
                    <span className="absolute -right-1 -bottom-1 w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                      <Sparkles className="h-2 w-2 text-white" />
                    </span>
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            
            <div
              className={`max-w-[75%] rounded-lg px-4 py-3 shadow-md ${
                message.sender === "user"
                  ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-tr-none"
                  : message.needsImprovement 
                    ? "bg-gray-100/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 line-through" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              }`}
            >
              <div 
                className="message-content whitespace-pre-wrap prose prose-headings:mb-2 prose-headings:mt-3 prose-p:my-1.5 prose-blockquote:my-2" 
                dangerouslySetInnerHTML={{ 
                  __html: message.content
                    .replace(/^# (.*?)$/gm, '<h1 class="text-xl font-bold text-gray-900 dark:text-gray-100 border-b pb-1 border-gray-200 dark:border-gray-700">$1</h1>')
                    .replace(/^## (.*?)$/gm, '<h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-3">$1</h2>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')
                    .replace(/\n/g, '<br />')
                }} 
              />
              
              {message.files && message.files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.files.map((file, index) => (
                    <div key={`${file.name}-${index}`} className={`flex items-center rounded-md p-2.5 transition-all ${
                      message.sender === "user" 
                        ? "bg-white/10 hover:bg-white/20" 
                        : "bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10"
                    }`}>
                      <div className="mr-3 flex-shrink-0 bg-white/20 p-2 rounded-full">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="overflow-hidden text-sm flex-1">
                        <a 
                          href={file.url} 
                          download={file.name} 
                          className={`hover:underline font-medium truncate block ${message.sender === "user" ? "text-white" : "text-blue-500"}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name}
                        </a>
                        <span className="text-xs opacity-70">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs opacity-80 flex items-center gap-1">
                  <span className={message.sender === "user" ? "bg-white/20 px-1.5 py-0.5 rounded-sm" : ""}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {message.isEdited && (
                      <span className="text-xs opacity-70 ml-1">(editado)</span>
                    )}
                  </span>
                </div>

                {/* Feedback buttons for AI messages */}
                {message.sender === "assistant" && !message.needsImprovement && (
                  <div className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(message.content);
                        toast({
                          title: "Mensagem copiada!",
                          description: "O conteúdo foi copiado para a área de transferência",
                          duration: 3000,
                        });
                      }}
                      className="p-1 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-[#FF6B00] dark:hover:text-[#FF6B00]"
                      title="Copiar mensagem"
                    >
                      <Copy className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                    </button>
                    
                    <button 
                      onClick={() => handleMessageFeedback(message.id, 'positive')}
                      className={`p-1 rounded-full transition-colors ${message.feedback === 'positive' ? 'bg-green-100 dark:bg-green-900/30' : 'hover:bg-gray-200 dark:hover:bg-gray-700'} hover:text-[#FF6B00] dark:hover:text-[#FF6B00]`}
                      title="Avaliar como boa resposta"
                    >
                      <ThumbsUp className={`h-3.5 w-3.5 ${message.feedback === 'positive' ? 'text-green-500 dark:text-green-400' : 'text-green-500 dark:text-green-400'}`} />
                    </button>
                    
                    <button 
                      onClick={() => handleMessageFeedback(message.id, 'negative')}
                      className={`p-1 rounded-full transition-colors ${message.feedback === 'negative' ? 'bg-red-100 dark:bg-red-900/30' : 'hover:bg-gray-200 dark:hover:bg-gray-700'} hover:text-[#FF6B00] dark:hover:text-[#FF6B00]`}
                      title="Avaliar como resposta que precisa melhorar"
                    >
                      <ThumbsDown className={`h-3.5 w-3.5 ${message.feedback === 'negative' ? 'text-red-600 dark:text-red-400' : 'text-red-500 dark:text-red-400'}`} />
                    </button>
                  </div>
                )}

                {/* Improvement options when negative feedback is given */}
                {message.sender === "assistant" && message.feedback === 'negative' && (
                  <div className="mt-2 flex flex-col gap-2 w-full animate-fadeIn">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Como podemos melhorar esta resposta?</div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs py-1 px-2 h-auto border-orange-200 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-1"
                        onClick={() => handleReformulate(message.id)}
                        disabled={isReformulating}
                      >
                        {isReformulating ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Reformulando...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3" />
                            <span>Reformular (mais detalhado)</span>
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs py-1 px-2 h-auto border-orange-200 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-1"
                        onClick={() => handleSummarize(message.id)}
                        disabled={isReformulating}
                      >
                        <FileText className="h-3 w-3" />
                        <span>Resumir (mais direto)</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {message.sender === "user" && (
              <div className="w-8 h-8 rounded-full overflow-hidden ml-2 flex-shrink-0">
                <Avatar>
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
                  <AvatarFallback>{userName ? userName.substring(0, 2).toUpperCase() : "US"}</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start animate-fadeIn">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
              <Avatar>
                <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] text-white">
                  <Bot className="h-4 w-4" />
                  <span className="absolute -right-1 -bottom-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center border border-white">
                    <Sparkles className="h-2 w-2 text-white" />
                  </span>
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="max-w-[75%] rounded-lg px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-md">
              <div className="flex items-center">
                <div className="flex space-x-1 mr-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse delay-150"></div>
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse delay-300"></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Formulando resposta...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};
