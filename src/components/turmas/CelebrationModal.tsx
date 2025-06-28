
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle, X, Users, Share2 } from "lucide-react";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: {
    id: string;
    nome: string;
    tipo_grupo: string;
    codigo_unico?: string;
    is_private: boolean;
    is_visible_to_all: boolean;
    descricao?: string;
  };
}

const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  group,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
      // Fallback para navegadores que não suportam clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const getVisibilityText = () => {
    if (group.is_visible_to_all) {
      return group.is_private ? "Privado (mas visível na lista)" : "Público";
    }
    return "Privado";
  };

  const getTipoText = (tipo: string) => {
    const tipos: { [key: string]: string } = {
      'estudo': 'Estudo',
      'pesquisa': 'Pesquisa',
      'projeto': 'Projeto',
      'discussao': 'Discussão'
    };
    return tipos[tipo] || tipo;
  

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl overflow-hidden max-w-md w-full shadow-2xl border border-[#FF6B00]/20"
          >
            {/* Header com animação */}
            <div className="relative bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 15 }}
                className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-3 flex items-center justify-center"
              >
                <CheckCircle className="h-8 w-8 text-white" />
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-white mb-2"
              >
                🎉 Grupo Criado!
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white/90 text-sm"
              >
                Seu grupo foi criado com sucesso!
              </motion.p>

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 h-8 w-8 rounded-full text-white/80 hover:text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-4">
              {/* Informações do Grupo */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {group.nome}
                  </h3>
                  {group.descricao && (
                    <p className="text-sm text-gray-400">{group.descricao}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    <Users className="h-3 w-3 mr-1" />
                    {getTipoText(group.tipo_grupo)}
                  </Badge>
                  
                  <Badge 
                    className={`${
                      group.is_visible_to_all 
                        ? "bg-green-500/20 text-green-300 border-green-500/30" 
                        : "bg-orange-500/20 text-orange-300 border-orange-500/30"
                    }`}
                  >
                    {getVisibilityText()}
                  </Badge>
                </div>
              </div>

              {/* Código Único */}
              {group.codigo_unico && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-r from-[#FF6B00]/10 to-[#FF8C40]/10 border border-[#FF6B00]/30 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center gap-2 text-[#FF6B00]">
                    <Share2 className="h-4 w-4" />
                    <span className="font-medium text-sm">Código de Acesso</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-black/30 rounded-lg p-3 font-mono text-center">
                      <span className="text-2xl font-bold text-white tracking-wider">
                        {group.codigo_unico}
                      </span>
                    </div>
                    
                    <Button
                      onClick={() => copyToClipboard(group.codigo_unico!)}
                      className={`h-12 w-12 rounded-lg transition-all duration-200 ${
                        copied
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-[#FF6B00] hover:bg-[#FF8C40]"
                      }`}
                    >
                      {copied ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-400 text-center">
                    {copied ? "Código copiado!" : "Compartilhe este código para que outros possam entrar no grupo"}
                  </p>
                </motion.div>
              )}

              {/* Informação adicional */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-sm text-blue-300 text-center">
                  {group.is_visible_to_all 
                    ? "🌟 Seu grupo aparecerá na lista 'Todos os Grupos'" 
                    : "🔒 Apenas pessoas com o código podem encontrar este grupo"
                  }
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0">
              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-medium"
              >
                Continuar
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CelebrationModal;
