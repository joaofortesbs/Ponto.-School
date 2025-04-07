import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Image as ImageIcon,
  Paperclip,
  Mic,
  X,
  Brain,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MessageReplyModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  message: {
    id: string;
    sender: string;
    avatar: string;
    message: string;
    time: string;
    date: string;
    unread: boolean;
    responseCount?: number;
  } | null;
  onSendReply: (
    replyText: string,
    attachments?: Array<{ type: string; url: string; name?: string }>,
  ) => void;
}

const MessageReplyModal: React.FC<MessageReplyModalProps> = ({
  isOpen,
  onOpenChange,
  message,
  onSendReply,
}) => {
  const [replyText, setReplyText] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sentReplyText, setSentReplyText] = useState("");
  const [attachments, setAttachments] = useState<
    Array<{ type: string; url: string; name?: string }>
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendReply = () => {
    if (replyText.trim() === "" && attachments.length === 0) return;
    setSentReplyText(replyText);
    onSendReply(replyText, attachments);
    setReplyText("");
    setAttachments([]);
    setShowSuccessModal(true);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    onOpenChange(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);

    const files = Array.from(e.target.files);
    const newAttachments: Array<{ type: string; url: string; name?: string }> =
      [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!event.target) return;

        const fileType = file.type.split("/")[0];
        newAttachments.push({
          type: fileType,
          url: event.target.result as string,
          name: file.name,
        });

        if (newAttachments.length === files.length) {
          setAttachments((prev) => [...prev, ...newAttachments]);
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset the input value so the same file can be selected again
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!message) return null;

  return (
    <>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
      />

      {/* Reply Modal */}
      <Dialog open={isOpen && !showSuccessModal} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Responder Mensagem</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              Envie uma resposta para {message.sender}
              {message.responseCount && message.responseCount > 0 && (
                <Badge
                  variant="outline"
                  className="ml-2 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  {message.responseCount}{" "}
                  {message.responseCount === 1
                    ? "resposta enviada"
                    : "respostas enviadas"}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Original message */}
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
              <div className="flex items-start gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.avatar} alt={message.sender} />
                  <AvatarFallback>
                    {message.sender.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{message.sender}</p>
                    <span className="text-xs text-muted-foreground">
                      {message.time}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{message.message}</p>
                </div>
              </div>
            </div>

            {/* Reply textarea */}
            <div className="space-y-2">
              <Textarea
                placeholder="Digite sua resposta aqui..."
                className="min-h-[100px]"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />

              {/* AI Suggestion Button */}
              <div className="flex justify-end">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-xs bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30 dark:border-orange-800/50"
                      >
                        <Brain className="h-3.5 w-3.5" />
                        Sugestões do Epictus IA
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Obter sugestões de resposta do Epictus IA</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Attachments Preview */}
              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Anexos:</p>
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((attachment, index) => (
                      <div key={index} className="relative group">
                        <div className="border rounded-md p-2 bg-gray-50 dark:bg-gray-800 flex items-center gap-2 pr-8">
                          {attachment.type === "image" ? (
                            <div className="w-10 h-10 rounded-md overflow-hidden">
                              <img
                                src={attachment.url}
                                alt="Anexo"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : attachment.type === "video" ? (
                            <div className="w-10 h-10 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <Paperclip className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                          ) : attachment.type === "audio" ? (
                            <div className="w-10 h-10 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                              <Mic className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              <Paperclip className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                          )}
                          <span className="text-xs truncate max-w-[100px]">
                            {attachment.name}
                          </span>
                          <button
                            className="absolute right-1 top-1 p-1 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between">
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={triggerFileInput}
                      disabled={isUploading}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enviar imagem ou arquivo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={isUploading}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Gravar áudio</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSendReply}
                disabled={
                  (replyText.trim() === "" && attachments.length === 0) ||
                  isUploading
                }
              >
                {isUploading ? "Carregando..." : "Enviar Resposta"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={closeSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Check className="h-5 w-5" />
              Mensagem Enviada com Sucesso
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800">
              <p className="text-green-700 dark:text-green-300 text-sm">
                Sua resposta foi enviada para {message.sender} com sucesso!
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border">
              <p className="text-sm font-medium mb-1">Sua resposta:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {sentReplyText}
              </p>
              {attachments.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {attachments.length}{" "}
                    {attachments.length === 1 ? "anexo" : "anexos"} enviado(s)
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={closeSuccessModal} className="w-full sm:w-auto">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MessageReplyModal;
