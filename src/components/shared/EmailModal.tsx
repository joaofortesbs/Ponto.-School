
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Mail, Send, AlertCircle, CheckCircle } from "lucide-react";

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (email: string) => Promise<boolean>;
  title?: string;
  emailHTML?: string;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  onSend,
  title = "Compartilhar por E-mail",
  emailHTML = "",
}) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setError("");
      setIsLoading(false);
      setShowSuccess(false);
    }
  }, [isOpen]);

  const handleSend = async () => {
    // Validação básica de email
    if (!email || !email.includes("@") || !email.includes(".")) {
      setError("Por favor, insira um endereço de e-mail válido");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const success = await onSend(email);
      if (success) {
        setShowSuccess(true);
        setTimeout(() => {
          onClose();
        }, 3000); // Fecha o modal após 3 segundos
      } else {
        setError("Não foi possível enviar o e-mail. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro ao enviar e-mail:", err);
      setError("Ocorreu um erro ao enviar o e-mail. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xl max-w-md w-full overflow-hidden"
        >
          <div className="p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                E-mail Enviado com Sucesso!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Seu conteúdo foi enviado para {email} com sucesso.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xl max-w-md w-full overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white font-montserrat">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full h-8 w-8 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Digite o endereço de e-mail do destinatário:
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
              className={`w-full p-3 pl-10 rounded-md border ${
                error
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-2 focus:outline-none focus:ring-2`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-5 w-5" />
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-500 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSend}
              disabled={isLoading}
              className={`px-4 py-2 rounded-md bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white flex items-center gap-2 ${
                isLoading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:from-[#FF8C40] hover:to-[#FF6B00]"
              } transition-all`}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailModal;
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { sendEmail } from "../../services/emailService";
import { Mail, Send, CheckCircle, AlertCircle, X } from "lucide-react";
import { toast } from "../ui/use-toast";

interface EmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialRecipient?: string;
  initialSubject?: string;
  initialMessage?: string;
}

const EmailModal: React.FC<EmailModalProps> = ({
  open,
  onOpenChange,
  initialRecipient = "",
  initialSubject = "",
  initialMessage = "",
}) => {
  const [recipient, setRecipient] = useState(initialRecipient);
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState(initialMessage);
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSend = async () => {
    if (!recipient || !subject || !message) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const result = await sendEmail({
        to: recipient,
        subject: subject,
        html: message,
      });

      if (result) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onOpenChange(false);
          // Limpar os campos após fechar
          setRecipient("");
          setSubject("");
          setMessage("");
        }, 2000);
      } else {
        toast({
          title: "Erro ao enviar e-mail",
          description: "Tente novamente mais tarde ou use seu cliente de e-mail.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao enviar e-mail:", error);
      toast({
        title: "Erro ao enviar e-mail",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] dark:from-[#1a1a2e] dark:to-[#16213e] border-none shadow-xl rounded-xl overflow-hidden">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              E-mail enviado com sucesso!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Seu e-mail foi enviado para {recipient}
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
                    Enviar E-mail
                  </DialogTitle>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Preencha os campos para enviar sua mensagem
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="absolute right-4 top-4 rounded-full h-8 w-8 p-0"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="recipient" className="font-medium">
                  Destinatário
                </Label>
                <Input
                  id="recipient"
                  placeholder="email@exemplo.com"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="bg-white/70 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject" className="font-medium">
                  Assunto
                </Label>
                <Input
                  id="subject"
                  placeholder="Assunto do e-mail"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-white/70 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message" className="font-medium">
                  Mensagem
                </Label>
                <Textarea
                  id="message"
                  placeholder="Digite sua mensagem aqui..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="resize-none bg-white/70 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700"
                />
              </div>
            </div>
            <DialogFooter className="flex justify-between sm:justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-[#29335C] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancelar
              </Button>
              <Button 
                type="button" 
                onClick={handleSend}
                disabled={sending}
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
              >
                {sending ? (
                  <div className="flex items-center">
                    <span className="animate-spin mr-2">
                      <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                    Enviando...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="h-4 w-4 mr-2" />
                    Enviar e-mail
                  </div>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmailModal;
