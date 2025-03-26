import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MessageCircle,
  Search,
  Send,
  Paperclip,
  Smile,
  Mic,
  MoreHorizontal,
  ThumbsUp,
  Pin,
  Trash2,
  FileText,
  X,
  ChevronDown,
  Phone,
  Video as VideoIcon,
  Maximize,
  Star,
  Eye as EyeIcon,
  Copy,
  Share2,
  Settings,
  Info,
  Check,
} from "lucide-react";

interface DiscussoesTabProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  groupName?: string;
}

type MessageType = "text" | "image" | "file" | "video" | "audio";

interface Message {
  id: number;
  content: string;
  sender: string;
  senderAvatar: string;
  timestamp: string;
  type: MessageType;
  fileInfo?: {
    name: string;
    size: string;
    type: string;
  };
  imageUrl?: string;
  audioUrl?: string;
  audioDuration?: string;
  reactions?: {
    type: string;
    count: number;
    users: string[];
  }[];
  isEdited?: boolean;
  isPinned?: boolean;
  isSelected?: boolean;
  isFavorite?: boolean;
  replyTo?: {
    id: number;
    sender: string;
    content: string;
  };
}

export const DiscussoesTab: React.FC<DiscussoesTabProps> = ({
  searchQuery,
  setSearchQuery,
  groupName = "Mecânica Quântica Avançada",
}) => {
  const [messageText, setMessageText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [pinnedMessage, setPinnedMessage] = useState<Message | null>(null);
  const [showMessageOptions, setShowMessageOptions] = useState<number | null>(
    null,
  );
  const [showMessageDetails, setShowMessageDetails] = useState<number | null>(
    null,
  );
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [showReactions, setShowReactions] = useState<number | null>(null);

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Sample messages for the group chat
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content:
        "Eu comecei ontem, mas estou com dúvidas no exercício 5. Podemos discutir na próxima reunião?",
      sender: "Ana Silva",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
      timestamp: "Hoje, 10:45",
      type: "text",
    },
    {
      id: 2,
      content:
        "Claro! Eu também tive dificuldades nesse exercício. Vamos marcar um horário para estudarmos juntos antes da próxima aula.",
      sender: "Pedro Costa",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro",
      timestamp: "Hoje, 10:38",
      type: "text",
      reactions: [{ type: "👍", count: 1, users: ["Ana"] }],
    },
    {
      id: 3,
      content:
        "Pessoal, encontrei este artigo que pode ajudar com o exercício 5. Dá uma olhada!",
      sender: "Maria Oliveira",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
      timestamp: "Hoje, 10:30",
      type: "text",
    },
    {
      id: 4,
      content: "Artigo: Resolução de Problemas Quânticos",
      sender: "Maria Oliveira",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
      timestamp: "Hoje, 10:30",
      type: "file",
      fileInfo: {
        name: "resolucao_problemas_quanticos.pdf",
        size: "1.5 MB",
        type: "pdf",
      },
    },
    {
      id: 5,
      content:
        "Obrigada Maria! Vou ler hoje à noite. Alguém quer fazer uma videochamada amanhã às 19h para discutirmos?",
      sender: "Ana Silva",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
      timestamp: "Hoje, 10:45",
      type: "text",
      reactions: [{ type: "👍", count: 2, users: ["Pedro", "Maria"] }],
    },
  ]);

  // Set the pinned message based on the messages array
  React.useEffect(() => {
    const pinned = messages.find((msg) => msg.isPinned);
    if (pinned) {
      setPinnedMessage(pinned);
    }
  }, [messages]);

  // Handle recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      content: messageText,
      sender: "Você", // Current user
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Voce",
      timestamp: "Agora",
      type: "text",
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            sender: replyingTo.sender,
            content: replyingTo.content,
          }
        : undefined,
    };

    setMessages([...messages, newMessage]);
    setMessageText("");
    setReplyingTo(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const addReaction = (messageId: number, reaction: string) => {
    setMessages(
      messages.map((msg) => {
        if (msg.id === messageId) {
          const existingReactions = msg.reactions || [];
          const existingReaction = existingReactions.find(
            (r) => r.type === reaction,
          );

          if (existingReaction) {
            // Add current user to the reaction if not already there
            if (!existingReaction.users.includes("Você")) {
              existingReaction.users.push("Você");
              existingReaction.count += 1;
            }
          } else {
            // Add new reaction
            existingReactions.push({
              type: reaction,
              count: 1,
              users: ["Você"],
            });
          }

          return { ...msg, reactions: existingReactions };
        }
        return msg;
      }),
    );
    setShowReactions(null);
  };

  const pinMessage = (messageId: number) => {
    setMessages(
      messages.map((msg) => {
        // Unpin all messages first
        const unpinned = { ...msg, isPinned: false };

        // Then pin the selected message
        if (unpinned.id === messageId) {
          return { ...unpinned, isPinned: true };
        }
        return unpinned;
      }),
    );
    setShowMessageOptions(null);
  };

  const deleteMessage = (messageId: number) => {
    setMessages(messages.filter((msg) => msg.id !== messageId));
    if (pinnedMessage && pinnedMessage.id === messageId) {
      setPinnedMessage(null);
    }
    setShowMessageOptions(null);
  };

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    // In a real app, this would process the audio recording
    const newMessage = {
      id: messages.length + 1,
      content: "Mensagem de áudio",
      sender: "Você",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Voce",
      timestamp: "Agora",
      type: "audio" as MessageType,
      audioDuration: formatTime(recordingTime),
    };

    setMessages([...messages, newMessage]);
  };

  const cancelRecording = () => {
    setIsRecording(false);
  };

  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case "text":
        return (
          <p className="text-sm text-white whitespace-pre-wrap">
            {message.content}
          </p>
        );

      case "file":
        if (!message.fileInfo) return null;

        return (
          <div className="mt-1">
            <div className="flex items-center p-2 rounded-lg">
              <div className="mr-3 p-1 rounded-lg">
                <FileText className="h-5 w-5 text-[#FF6B00]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {message.fileInfo.name}
                </p>
                <p className="text-xs text-gray-400">{message.fileInfo.size}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-gray-700 text-gray-400"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case "audio":
        return (
          <div className="mt-1">
            <div className="flex items-center p-2 rounded-lg">
              <audio controls className="w-full max-w-[200px] h-8" />
              <span className="text-xs text-gray-400 ml-2">
                {message.audioDuration}
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderMessageDetails = (message: Message) => {
    if (showMessageDetails !== message.id) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-[#1e293b] w-full max-w-md rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center">
              <EyeIcon className="h-5 w-5 mr-2 text-[#FF6B00]" />
              <h3 className="text-lg font-semibold text-white">
                Detalhes da mensagem
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-gray-700 text-gray-400"
              onClick={() => setShowMessageDetails(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4">
            <div className="flex items-center mb-4">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={message.senderAvatar} />
                <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center">
                  <h4 className="text-white font-medium">{message.sender}</h4>
                  <Button
                    variant="link"
                    className="text-xs text-[#FF6B00] p-0 h-auto ml-2"
                  >
                    Ver perfil
                  </Button>
                </div>
                <p className="text-sm text-gray-400">Membro</p>
              </div>
            </div>

            <div className="bg-[#1a2236] rounded-lg p-3 mb-4">
              <p className="text-white text-sm">{message.content}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400">Enviado em</p>
                <p className="text-sm text-white">{message.timestamp}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Status</p>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-[#FF6B00] mr-2"></div>
                  <p className="text-sm text-white">Entregue</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400">Editado</p>
                <p className="text-sm text-white">Não</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Fixado</p>
                <p className="text-sm text-white">
                  {message.isPinned ? "Sim" : "Não"}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-1">Resumo IA</p>
              <div className="bg-blue-900/20 border border-blue-900/30 rounded-lg p-3">
                <p className="text-sm text-blue-300">
                  {message.content.includes("monitoria")
                    ? "Pergunta sobre participação na monitoria da tarde."
                    : message.content.includes("PDF")
                      ? "Compartilhamento de material de estudo em formato PDF."
                      : "Mensagem de agradecimento pelo material compartilhado."}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">Votos</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-green-500 border-green-500/20 bg-green-500/10"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" /> 0
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-red-500 border-red-500/20 bg-red-500/10"
                >
                  <ThumbsUp className="h-4 w-4 mr-1 transform rotate-180" /> 0
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#1a2236] rounded-lg overflow-hidden h-[calc(100vh-160px)]">
      {/* Chat Header */}
      <div className="bg-[#FF6B00] text-white flex items-center p-3">
        <div className="flex items-center flex-1">
          <MessageCircle className="h-5 w-5 mr-2" />
          <h3 className="text-lg font-bold">{groupName}</h3>
          <Badge className="bg-green-500/20 text-white ml-2 rounded-full px-2">
            3 online
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 text-white text-xs hover:bg-white/20 rounded-full px-2"
          >
            Ver membros <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-white/20 text-white"
          >
            <Search className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-white/20 text-white"
          >
            <Phone className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-white/20 text-white"
          >
            <VideoIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-white/20 text-white"
          >
            <Maximize className="h-4 w-4" />
          </Button>

          <Popover open={showGroupMenu} onOpenChange={setShowGroupMenu}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-white/20 text-white"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0 bg-[#1e293b] border-gray-700">
              <div className="py-1">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Configurações
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" /> Resumir conversa com IA
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                  <Check className="h-4 w-4" /> Selecionar mensagens
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                  <Pin className="h-4 w-4" /> Salvar mensagens
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                  <Info className="h-4 w-4" /> Informações do grupo
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Configurações do grupo
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Pinned Messages */}
      {pinnedMessage && (
        <div className="bg-[#1a2236] border-b border-gray-800">
          <div className="p-2 flex items-center text-[#FF6B00]">
            <Pin className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Mensagens fixadas</span>
          </div>

          <div className="p-3 border-t border-gray-800 hover:bg-[#1e293b] transition-colors">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarImage src={pinnedMessage.senderAvatar} />
                <AvatarFallback>
                  {pinnedMessage.sender.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-semibold text-white">
                      {pinnedMessage.sender}
                    </h5>
                    <span className="text-xs text-gray-400">
                      {pinnedMessage.timestamp}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full hover:bg-gray-800 text-gray-400"
                    onClick={() => pinMessage(0)}
                  >
                    <Star className="h-4 w-4 text-[#FF6B00]" />
                  </Button>
                </div>

                <div className="text-sm text-white">
                  {renderMessageContent(pinnedMessage)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <ScrollArea className="h-[calc(100vh-270px)]">
        <div className="p-4 space-y-6">
          {messages.map((message, index) => {
            const isCurrentUser = message.sender === "Você";

            return (
              <div key={message.id} className="relative group">
                {renderMessageDetails(message)}

                <div className={`flex ${isCurrentUser ? "justify-end" : ""}`}>
                  <div
                    className={`flex max-w-[80%] ${isCurrentUser ? "flex-row-reverse" : ""}`}
                  >
                    {!isCurrentUser && (
                      <Avatar className="h-8 w-8 mt-1 mr-2 flex-shrink-0">
                        <AvatarImage src={message.senderAvatar} />
                        <AvatarFallback>
                          {message.sender.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div>
                      {!isCurrentUser && (
                        <div className="flex items-center mb-1">
                          <span className="text-sm font-medium text-white">
                            {message.sender}
                          </span>
                          <span className="text-xs text-gray-400 ml-2">
                            {message.timestamp}
                          </span>
                        </div>
                      )}

                      <div
                        className={`relative rounded-lg p-3 ${isCurrentUser ? "bg-[#FF6B00] rounded-tr-none" : "bg-[#1e293b] rounded-tl-none"}`}
                      >
                        {renderMessageContent(message)}

                        {isCurrentUser && (
                          <div className="flex justify-end mt-1">
                            <span className="text-xs text-white/70">
                              {message.timestamp}
                            </span>
                          </div>
                        )}

                        {/* Message options on hover */}
                        <div
                          className={`absolute ${isCurrentUser ? "-left-10" : "-right-10"} top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1`}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white"
                            onClick={() =>
                              setShowReactions(
                                message.id === showReactions
                                  ? null
                                  : message.id,
                              )
                            }
                          >
                            <Smile className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white"
                            onClick={() => setReplyingTo(message)}
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </Button>

                          <Popover
                            open={showMessageOptions === message.id}
                            onOpenChange={(open) =>
                              setShowMessageOptions(open ? message.id : null)
                            }
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-48 p-0 bg-[#1e293b] border-gray-700"
                              align={isCurrentUser ? "start" : "end"}
                            >
                              <div className="py-1">
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                                  onClick={() =>
                                    setShowMessageDetails(message.id)
                                  }
                                >
                                  <EyeIcon className="h-4 w-4" /> Inspecionar
                                  mensagem
                                </button>
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                                  <Copy className="h-4 w-4" /> Copiar mensagem
                                </button>
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                                  <Share2 className="h-4 w-4" /> Compartilhar
                                </button>
                                <button
                                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                                  onClick={() => pinMessage(message.id)}
                                >
                                  <Pin className="h-4 w-4" /> Fixar mensagem
                                </button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Reactions popup */}
                        {showReactions === message.id && (
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-[#1e293b] rounded-full shadow-lg p-1 flex items-center gap-1 border border-gray-700 z-10">
                            {["👍", "❤️", "😂", "😮", "🔥", "👏"].map(
                              (emoji) => (
                                <button
                                  key={emoji}
                                  className="text-lg hover:bg-gray-800 p-1 rounded-full transition-all"
                                  onClick={() => addReaction(message.id, emoji)}
                                >
                                  {emoji}
                                </button>
                              ),
                            )}
                          </div>
                        )}
                      </div>

                      {/* Reactions display */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex mt-1 gap-1">
                          {message.reactions.map((reaction, i) => (
                            <button
                              key={i}
                              className="px-1.5 py-0.5 bg-[#1e293b] rounded-full border border-gray-700 text-xs flex items-center gap-1 hover:bg-gray-800"
                              onClick={() =>
                                addReaction(message.id, reaction.type)
                              }
                            >
                              <span>{reaction.type}</span>
                              <span className="text-gray-400">
                                {reaction.count}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-gray-800 p-3">
        {replyingTo && (
          <div className="bg-[#1e293b] mb-2 p-2 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-1 h-10 bg-[#FF6B00] rounded-full mr-2"></div>
              <div>
                <p className="text-xs text-gray-400">
                  Respondendo para {replyingTo.sender}
                </p>
                <p className="text-sm text-white truncate max-w-[300px]">
                  {replyingTo.content}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 rounded-full hover:bg-gray-700 text-gray-400"
              onClick={() => setReplyingTo(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {isRecording ? (
          <div className="flex items-center justify-between bg-[#1e293b] rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white">
                Gravando... {formatTime(recordingTime)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-gray-700 text-gray-400"
                onClick={cancelRecording}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white rounded-full h-8 w-8 p-0"
                onClick={stopRecording}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-[#1e293b] rounded-lg p-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-full hover:bg-gray-700 text-gray-400"
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            <input
              type="text"
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-transparent border-none focus:outline-none text-white"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-full hover:bg-gray-700 text-gray-400"
              onClick={startRecording}
            >
              <Mic className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-full hover:bg-gray-700 text-gray-400"
            >
              <Smile className="h-5 w-5" />
            </Button>

            <Button
              className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white rounded-full h-9 w-9 p-0"
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
