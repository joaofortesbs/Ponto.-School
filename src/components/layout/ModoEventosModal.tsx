
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Music,
  Sun,
  Ghost,
  Gift,
  Fireworks,
  Calendar,
  Check,
  Crown,
  Heart,
  Zap,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModoEventosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ModoEvento {
  id: string;
  nome: string;
  icone: React.ReactNode;
  cor: string;
  corGradiente: string;
  descricao: string;
  ativo: boolean;
  emoji: string;
}

const ModoEventosModal: React.FC<ModoEventosModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [modosEventos, setModosEventos] = useState<ModoEvento[]>([
    {
      id: "carnaval",
      nome: "Carnaval",
      icone: <Music className="h-6 w-6" />,
      cor: "#FF4081",
      corGradiente: "from-pink-500 to-purple-600",
      descricao: "Celebre com cores vibrantes e alegria!",
      ativo: false,
      emoji: "🎭"
    },
    {
      id: "festa-junina",
      nome: "Festa Junina",
      icone: <Crown className="h-6 w-6" />,
      cor: "#FF9800",
      corGradiente: "from-orange-500 to-red-600",
      descricao: "Arraial e tradições brasileiras!",
      ativo: false,
      emoji: "🌽"
    },
    {
      id: "ferias",
      nome: "Férias",
      icone: <Sun className="h-6 w-6" />,
      cor: "#FFD700",
      corGradiente: "from-yellow-400 to-orange-500",
      descricao: "Descanso e diversão garantidos!",
      ativo: false,
      emoji: "🏖️"
    },
    {
      id: "halloween",
      nome: "Halloween",
      icone: <Ghost className="h-6 w-6" />,
      cor: "#9C27B0",
      corGradiente: "from-purple-600 to-orange-600",
      descricao: "Assombrosamente divertido!",
      ativo: false,
      emoji: "🎃"
    },
    {
      id: "natal",
      nome: "Natal",
      icone: <Gift className="h-6 w-6" />,
      cor: "#4CAF50",
      corGradiente: "from-green-500 to-red-500",
      descricao: "Magia e presente para todos!",
      ativo: false,
      emoji: "🎄"
    },
    {
      id: "final-ano",
      nome: "Final de Ano",
      icone: <Fireworks className="h-6 w-6" />,
      cor: "#2196F3",
      corGradiente: "from-blue-500 to-purple-600",
      descricao: "Comemore conquistas e novos objetivos!",
      ativo: false,
      emoji: "🎆"
    }
  ]);

  const [modoAtivoAtual, setModoAtivoAtual] = useState<string | null>(null);

  const ativarModo = (modoId: string) => {
    setModosEventos(prev => 
      prev.map(modo => ({
        ...modo,
        ativo: modo.id === modoId ? !modo.ativo : false
      }))
    );
    
    const modoSelecionado = modosEventos.find(m => m.id === modoId);
    if (modoSelecionado && !modoSelecionado.ativo) {
      setModoAtivoAtual(modoId);
      
      // Aqui você pode adicionar lógica para aplicar o tema do evento
      console.log(`Modo ${modoSelecionado.nome} ativado!`);
      
      // Salvar no localStorage
      localStorage.setItem('modoEventoAtivo', modoId);
      
      // Aplicar mudanças visuais na plataforma
      document.documentElement.style.setProperty('--evento-cor-principal', modoSelecionado.cor);
    } else {
      setModoAtivoAtual(null);
      localStorage.removeItem('modoEventoAtivo');
      document.documentElement.style.removeProperty('--evento-cor-principal');
    }
  };

  const desativarTodos = () => {
    setModosEventos(prev => 
      prev.map(modo => ({ ...modo, ativo: false }))
    );
    setModoAtivoAtual(null);
    localStorage.removeItem('modoEventoAtivo');
    document.documentElement.style.removeProperty('--evento-cor-principal');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden backdrop-blur-md bg-white/95 dark:bg-[#0A2540]/95 border border-[#FF6B00]/30 shadow-2xl">
        {/* Header Premium */}
        <DialogHeader className="relative pb-6">
          {/* Efeitos de fundo decorativos */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-[#FF6B00]/20 to-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
          <div className="absolute -top-5 -right-5 w-24 h-24 bg-gradient-to-bl from-blue-500/15 to-[#FF6B00]/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center justify-center gap-4 relative z-10">
            <motion.div 
              className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] shadow-lg"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
            >
              <Calendar className="h-8 w-8 text-white" />
            </motion.div>
            
            <div className="text-center">
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent mb-2">
                Modo Eventos
              </DialogTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Transforme sua experiência com temas especiais
              </p>
            </div>

            <motion.div
              className="flex items-center gap-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Sparkles className="h-5 w-5 text-[#FF6B00] animate-pulse" />
              <Badge className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white font-semibold">
                Premium
              </Badge>
            </motion.div>
          </div>
        </DialogHeader>

        {/* Status do Modo Ativo */}
        <AnimatePresence>
          {modoAtivoAtual && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-200">
                      Modo {modosEventos.find(m => m.id === modoAtivoAtual)?.nome} Ativo!
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      Sua plataforma está com o tema especial aplicado
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={desativarTodos}
                  className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/20"
                >
                  Desativar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid de Modos de Eventos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[500px] pr-2">
          {modosEventos.map((modo, index) => (
            <motion.div
              key={modo.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <motion.div
                className={`
                  relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden
                  ${modo.ativo 
                    ? `border-[${modo.cor}] bg-gradient-to-br ${modo.corGradiente} text-white shadow-lg scale-105 shadow-${modo.cor}/25` 
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0A2540]/50 hover:border-[#FF6B00]/50 hover:shadow-lg hover:scale-105'
                  }
                `}
                onClick={() => ativarModo(modo.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Efeito de brilho no hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-[100%] transform transition-transform duration-1000"></div>
                
                {/* Conteúdo do Card */}
                <div className="relative z-10">
                  {/* Header do Card */}
                  <div className="flex items-center justify-between mb-4">
                    <motion.div 
                      className={`
                        flex items-center justify-center w-12 h-12 rounded-xl
                        ${modo.ativo 
                          ? 'bg-white/20 backdrop-blur-sm' 
                          : `bg-gradient-to-br ${modo.corGradiente} text-white`
                        }
                      `}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {modo.icone}
                    </motion.div>
                    
                    <div className="text-right">
                      <div className="text-2xl mb-1">{modo.emoji}</div>
                      {modo.ativo && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm"
                        >
                          <Check className="h-4 w-4 text-white" />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Título e Descrição */}
                  <div className="space-y-2">
                    <h3 className={`
                      text-lg font-bold
                      ${modo.ativo ? 'text-white' : 'text-gray-800 dark:text-white'}
                    `}>
                      {modo.nome}
                    </h3>
                    <p className={`
                      text-sm
                      ${modo.ativo ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'}
                    `}>
                      {modo.descricao}
                    </p>
                  </div>

                  {/* Status Indicator */}
                  <div className="mt-4 flex items-center justify-between">
                    <Badge 
                      className={`
                        ${modo.ativo 
                          ? 'bg-white/20 text-white border-white/30' 
                          : `bg-gradient-to-r ${modo.corGradiente} text-white border-none`
                        }
                      `}
                    >
                      {modo.ativo ? 'Ativo' : 'Disponível'}
                    </Badge>
                    
                    <motion.div
                      className="flex items-center gap-1"
                      animate={{ scale: modo.ativo ? [1, 1.2, 1] : 1 }}
                      transition={{ repeat: modo.ativo ? Infinity : 0, duration: 2 }}
                    >
                      <Star className={`h-4 w-4 ${modo.ativo ? 'text-white' : 'text-[#FF6B00]'}`} />
                      <Zap className={`h-4 w-4 ${modo.ativo ? 'text-white' : 'text-[#FF6B00]'}`} />
                    </motion.div>
                  </div>
                </div>

                {/* Efeito de partículas para modo ativo */}
                {modo.ativo && (
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white/30 rounded-full"
                        initial={{ 
                          x: Math.random() * 100 + '%', 
                          y: Math.random() * 100 + '%',
                          opacity: 0 
                        }}
                        animate={{
                          y: [null, '-100%'],
                          opacity: [0, 1, 0]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.5
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Footer com Informações */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-[#FF6B00]" />
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Personalize sua experiência
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Ative um modo de evento para transformar a interface da plataforma
                </p>
              </div>
            </div>
            
            <Badge className="bg-[#FF6B00] text-white">
              {modosEventos.filter(m => m.ativo).length}/1 Ativo
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModoEventosModal;
