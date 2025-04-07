import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Brain,
  Check,
  Filter,
  MessageSquare,
  Trash2,
  AlertCircle,
  Upload,
  Bell,
  MessageCircle,
} from "lucide-react";

interface Message {
  id: string;
  sender: string;
  avatar: string;
  message: string;
  time: string;
  date: string;
  unread: boolean;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  read: boolean;
}

interface EpictusIAHeaderModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  modalType: "messages" | "notifications";
  messagesData: Message[];
  notificationsData: Notification[];
  setMessagesData: React.Dispatch<React.SetStateAction<Message[]>>;
  setNotificationsData: React.Dispatch<React.SetStateAction<Notification[]>>;
  selectedMessage?: Message | null;
  setSelectedMessage?: (message: Message | null) => void;
}

const EpictusIAHeaderModal: React.FC<EpictusIAHeaderModalProps> = ({
  isOpen,
  onOpenChange,
  modalType,
  messagesData,
  notificationsData,
  setMessagesData,
  setNotificationsData,
  selectedMessage,
  setSelectedMessage,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [responseText, setResponseText] = useState("");
  const responseRef = useRef<HTMLDivElement>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setFilteredData([]);
      setResponseText("");
      setIsResponding(false);
    }
  }, [isOpen]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Filter data based on query
    const dataToFilter =
      modalType === "messages" ? messagesData : notificationsData;
    if (query.trim() === "") {
      setFilteredData([]);
    } else {
      const filtered = dataToFilter.filter((item) => {
        if (modalType === "messages") {
          const msgItem = item as Message;
          return (
            msgItem.sender.toLowerCase().includes(query.toLowerCase()) ||
            msgItem.message.toLowerCase().includes(query.toLowerCase())
          );
        } else {
          const notifItem = item as Notification;
          return (
            notifItem.title.toLowerCase().includes(query.toLowerCase()) ||
            notifItem.description.toLowerCase().includes(query.toLowerCase())
          );
        }
      });
      setFilteredData(filtered);
    }
  };

  // Generate AI response
  const generateResponse = () => {
    if (!selectedMessage) return;

    setIsResponding(true);
    setResponseText("");

    // Simulated AI response generation
    const possibleResponses = [
      `Olá! Em resposta à sua mensagem, gostaria de informar que estamos trabalhando para resolver isso o mais rápido possível. Poderia fornecer mais detalhes sobre o problema que está enfrentando?`,
      `Obrigado por entrar em contato! Entendi sua questão sobre ${selectedMessage.message.split(" ").slice(0, 3).join(" ")}... Posso ajudar explicando que este é um processo que requer alguns passos específicos. Primeiro, você precisa acessar a seção de configurações. Depois disso, podemos prosseguir com as próximas etapas.`,
      `Compreendi sua dúvida. Esta é uma questão importante que afeta muitos usuários. Baseado no que você descreveu, recomendo que você tente primeiro atualizar o aplicativo para a versão mais recente, pois isso pode resolver o problema automaticamente. Se o problema persistir, podemos explorar outras soluções.`,
    ];

    const selectedResponse =
      possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
    let currentText = "";
    const words = selectedResponse.split(" ");

    const interval = setInterval(() => {
      if (words.length > 0) {
        currentText += words.shift() + " ";
        setResponseText(currentText);
        if (responseRef.current) {
          responseRef.current.scrollTop = responseRef.current.scrollHeight;
        }
      } else {
        clearInterval(interval);
        setIsResponding(false);
      }
    }, 100);
  };

  // Send AI response
  const sendResponse = () => {
    if (!responseText) return;

    // Create new message
    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: "Você",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
      message: responseText,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: "Agora mesmo",
      unread: false,
    };

    // Add new message to data
    setMessagesData((prev) => [newMessage, ...prev]);

    // Close modal and reset state
    onOpenChange(false);
    if (setSelectedMessage) setSelectedMessage(null);
    setResponseText("");

    // Show success notification
    alert("Resposta enviada com sucesso!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-[#FF6B00]" />
            Epictus IA -{" "}
            {modalType === "messages" ? "Mensagens" : "Notificações"}
          </DialogTitle>
          <DialogDescription>
            {selectedMessage
              ? `Responder à mensagem de ${selectedMessage.sender}`
              : `Filtrar e gerenciar ${modalType === "messages" ? "mensagens" : "notificações"} com inteligência artificial`}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {!selectedMessage && (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-muted dark:text-white/40 h-4 w-4" />
                <Input
                  type="search"
                  placeholder={`Buscar ${modalType === "messages" ? "mensagens" : "notificações"}...`}
                  className="w-full pl-10 pr-4 glass-input"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>

              {searchQuery.trim() !== "" && (
                <div className="border rounded-md max-h-40 overflow-y-auto p-2 space-y-2">
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer flex items-start gap-2"
                        onClick={() => {
                          if (modalType === "messages" && setSelectedMessage) {
                            setSelectedMessage(item);
                            setResponseText("");
                            setIsResponding(false);
                          }
                        }}
                      >
                        {modalType === "messages" ? (
                          <>
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={item.avatar}
                                alt={item.sender}
                              />
                              <AvatarFallback>
                                {item.sender.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {item.sender}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {item.message}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center ${item.type === "update" ? "bg-blue-100 text-blue-600" : item.type === "warning" ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600"}`}
                            >
                              {item.type === "update" && (
                                <Upload className="h-3 w-3" />
                              )}
                              {item.type === "warning" && (
                                <Bell className="h-3 w-3" />
                              )}
                              {item.type === "info" && (
                                <MessageCircle className="h-3 w-3" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {item.title}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {item.description}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-2 text-sm text-muted-foreground">
                      Nenhum resultado encontrado
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {selectedMessage && (
            <div className="space-y-3">
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                <div className="flex items-start gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={selectedMessage.avatar}
                      alt={selectedMessage.sender}
                    />
                    <AvatarFallback>
                      {selectedMessage.sender.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {selectedMessage.sender}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {selectedMessage.time}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{selectedMessage.message}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ai-response">Resposta gerada pela IA</Label>
                  {!isResponding && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={generateResponse}
                    >
                      Gerar resposta
                    </Button>
                  )}
                </div>

                <div
                  ref={responseRef}
                  className="border rounded-md p-3 min-h-[100px] max-h-[150px] overflow-y-auto bg-white dark:bg-gray-950"
                >
                  {isResponding ? (
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                          style={{ animationDelay: "600ms" }}
                        ></div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Epictus IA está gerando uma resposta...
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm">{responseText}</p>
                  )}
                </div>

                {responseText && !isResponding && (
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setResponseText("")}
                    >
                      Limpar
                    </Button>
                    <Button size="sm" onClick={sendResponse}>
                      Enviar resposta
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          {selectedMessage && setSelectedMessage && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedMessage(null);
                setResponseText("");
              }}
            >
              Voltar
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EpictusIAHeaderModal;
