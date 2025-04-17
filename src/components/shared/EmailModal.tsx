
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Mail, Check, Send, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { sendEmail } from "@/services/emailService";

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailContent?: {
    subject: string;
    html: string;
  };
  title?: string;
}

const EmailModal: React.FC<EmailModalProps> = ({ 
  isOpen, 
  onClose, 
  emailContent = { subject: "", html: "" },
  title = "Compartilhar por E-mail"
}) => {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: "E-mail inválido",
        description: "Por favor, insira um endereço de e-mail válido.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsSending(true);
    try {
      const emailData = {
        to: email,
        subject: emailContent.subject || "Material compartilhado da Ponto.School",
        html: emailContent.html || "Conteúdo do e-mail"
      };
      
      await sendEmail(emailData);
      setShowSuccess(true);
    } catch (error) {
      console.error("Erro ao enviar e-mail:", error);
      toast({
        title: "Erro ao enviar e-mail",
        description: "Não foi possível enviar o e-mail. Por favor, tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSending(false);
    }
  };

  const resetAndClose = () => {
    setEmail("");
    setShowSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      {!showSuccess ? (
        <DialogContent className="sm:max-w-md p-0 border-0 overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-b from-[#1f2231] to-[#181b29] dark:from-[#1a1d2d] dark:to-[#141625]">
          {/* Header com gradiente */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-5">
            <div className="flex items-center justify-between w-full">
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Mail className="w-6 h-6 text-white" />
                {title}
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white"
                onClick={resetAndClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 dark:from-orange-500/5 dark:to-orange-600/5 p-4 rounded-xl border border-orange-500/20 dark:border-orange-500/10 mb-5">
              <p className="text-sm text-white/80 dark:text-white/70">
                Digite o endereço de e-mail do destinatário para compartilhar o conteúdo.
              </p>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-white/90 dark:text-white/80">
                E-mail do destinatário:
              </label>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full bg-white/5 border border-white/10 focus:border-orange-500/50 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:ring-2 focus:ring-orange-500/30"
                  autoFocus
                />
                <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/30" />
              </div>
            </div>
          </div>
          
          <div className="px-6 pb-6 pt-2 flex flex-row-reverse gap-3">
            <Button
              type="button"
              onClick={handleSend}
              disabled={isSending || !email}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 rounded-xl py-5 px-6 shadow-lg shadow-orange-600/20 hover:shadow-xl hover:shadow-orange-600/30 transition-all duration-300"
            >
              {isSending ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <span>Enviar</span>
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={resetAndClose}
              className="text-white/70 hover:text-white/90 hover:bg-white/10 rounded-xl py-5"
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      ) : (
        <DialogContent className="sm:max-w-md border-0 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-b from-[#1f2231] to-[#181b29] p-0">
          <div className="relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-600/10 rounded-full blur-3xl"></div>
            
            <div className="p-8 relative z-10">
              {/* Success Icon */}
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                <Check className="w-12 h-12" strokeWidth={2.5} />
              </div>
              
              {/* Content */}
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-white">E-mail Enviado com Sucesso!</h3>
                <p className="text-white/70 text-lg">
                  O conteúdo foi enviado para <span className="font-medium text-white">{email}</span> com sucesso.
                </p>
              </div>
              
              {/* Footer */}
              <div className="mt-10 flex justify-center">
                <Button 
                  onClick={resetAndClose}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 px-8 py-6 rounded-xl text-lg"
                >
                  <span>Concluir</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default EmailModal;
