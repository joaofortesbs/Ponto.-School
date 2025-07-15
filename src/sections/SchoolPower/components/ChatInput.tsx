import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';
import { useSchoolPowerStore } from '@/store/schoolPowerStore';
import { validateMessage } from '@/utils/validators';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInputProps {
  onMessageSent?: (message: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onMessageSent }) => {
  const [inputValue, setInputValue] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { 
    setUserMessage, 
    setStage, 
    setLoading, 
    setError, 
    isLoading,
    stage 
  } = useSchoolPowerStore();

  const handleSendMessage = async () => {
    if (isLoading || isAnimating) return;

    const { isValid, errors } = validateMessage(inputValue);

    if (!isValid) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setIsAnimating(true);
    setLoading(true);

    try {
      // Armazenar mensagem no estado global
      setUserMessage(inputValue);

      // Simular pequeno delay para transição suave
      await new Promise(resolve => setTimeout(resolve, 300));

      // Transição para próxima etapa
      setStage('contextualization');

      // Callback opcional
      onMessageSent?.(inputValue);

      // Limpar input
      setInputValue('');

    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      setError('Erro ao processar sua mensagem. Tente novamente.');
    } finally {
      setLoading(false);
      setIsAnimating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // Limpar erros quando usuário começar a digitar
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  // Desabilitar input se não estiver na tela inicial
  const isDisabled = stage !== 'start' || isLoading || isAnimating;

  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Descreva o que você gostaria de criar para sua aula..."
          disabled={isDisabled}
          className={`
            w-full pr-12 py-3 text-base
            bg-white/10 backdrop-blur-md border border-white/20
            text-white placeholder-white/70
            focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20
            transition-all duration-300
            ${validationErrors.length > 0 ? 'border-red-400 focus:border-red-400' : ''}
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />

        <Button
          onClick={handleSendMessage}
          disabled={isDisabled || inputValue.trim().length < 4}
          className={`
            absolute right-2 top-1/2 -translate-y-1/2
            h-8 w-8 p-0 rounded-full
            bg-[#FF6B00] hover:bg-[#FF6B00]/90
            transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      <AnimatePresence>
        {validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-2 space-y-1"
          >
            {validationErrors.map((error, index) => (
              <p key={index} className="text-red-400 text-sm flex items-center gap-1">
                <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                {error}
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de progresso */}
      <div className="mt-4 flex justify-center">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${stage === 'start' ? 'bg-[#FF6B00]' : 'bg-white/30'}`}></div>
          <div className={`w-2 h-2 rounded-full ${stage === 'contextualization' ? 'bg-[#FF6B00]' : 'bg-white/30'}`}></div>
          <div className={`w-2 h-2 rounded-full ${stage === 'planning' ? 'bg-[#FF6B00]' : 'bg-white/30'}`}></div>
          <div className={`w-2 h-2 rounded-full ${stage === 'execution' ? 'bg-[#FF6B00]' : 'bg-white/30'}`}></div>
        </div>
      </div>
    </motion.div>
  );
};