
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, MapPin, CheckCircle, Bell, Calendar, MessageSquare, Globe, Users } from "lucide-react";
import { Button } from "../ui/button";
import Confetti from 'react-confetti';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstLogin: boolean;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  isFirstLogin,
}) => {
  const navigate = useNavigate();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [showUpdates, setShowUpdates] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSettingsClick = () => {
    navigate("/configuracoes");
    onClose();
  };

  const handleAgendaClick = () => {
    navigate("/agenda");
    onClose();
  };

  const toggleUpdates = () => {
    setShowUpdates(!showUpdates);
  };

  // Primeiro login - Modal completo com confetes
  if (isFirstLogin) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <Confetti
              width={dimensions.width}
              height={dimensions.height}
              recycle={false}
              numberOfPieces={500}
              gravity={0.2}
              colors={['#FF6B00', '#FF8C40', '#29335C', '#001427', '#FFC107']}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white dark:bg-[#001427] rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl border border-[#FF6B00]/30"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=90"
                    alt="Bem-vindo à Ponto. School"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="h-5 w-5 text-[#FF6B00]" />
                        <h3 className="text-xl font-bold">Conta criada com sucesso!</h3>
                      </div>
                      <p className="text-white/80">
                        Estamos muito felizes em ter você na Ponto. School!
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute top-4 right-4 rounded-full bg-black/20 text-white hover:bg-black/40 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Bem-vindo à Ponto. School
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Estamos animados para ajudar você em sua jornada de aprendizado!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                      <div className="h-10 w-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3">
                        <Settings className="h-5 w-5 text-[#FF6B00]" />
                      </div>
                      <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Configure sua conta</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        Personalize seu perfil e preferências para melhorar sua experiência.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10 w-full"
                        onClick={handleSettingsClick}
                      >
                        Configurar agora
                      </Button>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                      <div className="h-10 w-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3">
                        <MapPin className="h-5 w-5 text-[#FF6B00]" />
                      </div>
                      <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Tour pela plataforma</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        Conheça os recursos e funcionalidades da Ponto. School.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 w-full opacity-70 cursor-not-allowed"
                        disabled
                      >
                        Em breve
                      </Button>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                      <div className="h-10 w-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mb-3">
                        <CheckCircle className="h-5 w-5 text-[#FF6B00]" />
                      </div>
                      <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Comece a aprender</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        Vá direto para o dashboard e comece sua jornada agora.
                      </p>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white w-full"
                        onClick={onClose}
                      >
                        Ir para o Dashboard
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Login subsequente - Modal simples com mais opções
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-[#001427] rounded-xl p-6 max-w-md w-full shadow-xl border border-[#FF6B00]/20"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-3 right-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="text-center mb-6 pt-4">
              <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-[#FF6B00]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Bem-vindo de volta!
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                A Ponto. School está feliz por te ter de volta!
              </p>
            </div>
            
            {!showUpdates ? (
              <div className="space-y-3 mb-6">
                <Button
                  onClick={handleAgendaClick}
                  className="flex items-center justify-start w-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 text-gray-800 dark:text-white p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <Calendar className="h-5 w-5 text-[#FF6B00] mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Ver compromissos do dia</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Confira sua agenda e planeje seu dia</div>
                  </div>
                </Button>
                
                <Button
                  onClick={toggleUpdates}
                  className="flex items-center justify-start w-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 text-gray-800 dark:text-white p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <Bell className="h-5 w-5 text-[#FF6B00] mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Ver atualizações</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Notificações, mensagens e novidades</div>
                  </div>
                </Button>
              </div>
            ) : (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">Suas atualizações</h3>
                  <Button variant="ghost" size="sm" onClick={toggleUpdates} className="text-sm">
                    Voltar
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start">
                      <Bell className="h-5 w-5 text-[#FF6B00] mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Notificações</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Você tem 3 notificações não lidas</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start">
                      <MessageSquare className="h-5 w-5 text-[#FF6B00] mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Mensagens</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">2 novas mensagens de colegas</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start">
                      <Globe className="h-5 w-5 text-[#FF6B00] mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Novidades da plataforma</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Nova funcionalidade de AI disponível!</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start">
                      <Users className="h-5 w-5 text-[#FF6B00] mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Conexão Expert</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Um expert escolheu responder sua dúvida</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <Button
                className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white px-8"
                onClick={onClose}
              >
                Continuar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeModal;
