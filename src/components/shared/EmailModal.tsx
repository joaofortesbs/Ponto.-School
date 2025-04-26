import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Mail, Check } from "lucide-react";
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
  title = "Enviar por E-mail"
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
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border-0 rounded-xl shadow-xl">
          <DialogHeader>
            <div className="flex items-center justify-between w-full">
              <DialogTitle className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-orange-500" />
                {title}
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={resetAndClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-orange-50/50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-100 dark:border-orange-800/30 mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Insira o endereço de e-mail do destinatário para compartilhar o conteúdo.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                E-mail do destinatário:
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@email.com"
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={resetAndClose}
              className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSend}
              disabled={isSending || !email}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0"
            >
              {isSending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Enviando...
                </>
              ) : (
                "Enviar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      ) : (
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-gray-800/90 border-0 rounded-xl shadow-xl p-0 overflow-hidden">
          <div className="relative">
            {/* Background elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-400/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-400/10 rounded-full blur-2xl"></div>

            <div className="p-6 relative z-10">
              {/* Success Icon */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                <Check className="w-10 h-10" strokeWidth={3} />
              </div>

              {/* Content */}
              <div className="text-center space-y-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">E-mail Enviado com Sucesso!</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  O conteúdo foi enviado para <span className="font-medium text-gray-800 dark:text-white">{email}</span> com sucesso.
                </p>
              </div>

              {/* Footer */}
              <div className="mt-8 flex justify-center">
                <Button 
                  onClick={resetAndClose}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 px-8"
                >
                  Concluir
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