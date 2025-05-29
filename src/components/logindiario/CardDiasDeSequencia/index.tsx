
import React from "react";
import { Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface CardDiasDeSequenciaProps {
  isSpinning: boolean;
  showResult: boolean;
}

const CardDiasDeSequencia: React.FC<CardDiasDeSequenciaProps> = ({ isSpinning, showResult }) => {
  const [diasSequencia, setDiasSequencia] = React.useState(4); // Exemplo: 4 dias seguidos
  const [jaGirouHoje, setJaGirouHoje] = React.useState(false);
  const [tempoRestante, setTempoRestante] = React.useState<{
    horas: number;
    minutos: number;
    segundos: number;
  }>({ horas: 0, minutos: 0, segundos: 0 });

  // Efeito para calcular tempo até próximo giro (meia-noite)
  React.useEffect(() => {
    const calcularProximoGiro = () => {
      const agora = new Date();
      const proximaMeiaNoite = new Date();
      proximaMeiaNoite.setDate(agora.getDate() + 1);
      proximaMeiaNoite.setHours(0, 0, 0, 0);

      const diferenca = proximaMeiaNoite.getTime() - agora.getTime();

      const horas = Math.floor(diferenca / (1000 * 60 * 60));
      const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

      setTempoRestante({ horas, minutos, segundos });
    };

    // Calcular imediatamente
    calcularProximoGiro();

    // Atualizar a cada segundo se já girou hoje
    let intervalo: NodeJS.Timeout | null = null;
    if (jaGirouHoje) {
      intervalo = setInterval(calcularProximoGiro, 1000);
    }

    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [jaGirouHoje]);

  // Efeito para detectar quando o usuário girou a roleta
  React.useEffect(() => {
    if (showResult && !jaGirouHoje) {
      setJaGirouHoje(true);
      setDiasSequencia(prev => prev + 1); // Incrementa a sequência
    }
  }, [showResult, jaGirouHoje]);

  // Estado 1: Antes de girar (Contador de Dias)
  if (!jaGirouHoje) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring", damping: 20 }}
        className="w-72 h-32 rounded-xl overflow-hidden relative bg-white/10 backdrop-blur-sm border border-orange-200/30"
        style={{
          boxShadow: "0 4px 16px rgba(255, 107, 0, 0.1)"
        }}
      >
        {/* Efeito de brilho sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/5 via-transparent to-orange-200/5 pointer-events-none" />

        <div className="relative z-10 p-4 h-full flex flex-col justify-between">
          {/* Topo - Label e dias */}
          <div className="text-center">
            <p className="text-xs text-white/70 font-medium mb-1">
              Dias de sequência:
            </p>
            <motion.div
              key={diasSequencia}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="flex items-center justify-center gap-2 text-lg font-bold text-white"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Calendar className="h-5 w-5 text-orange-300" />
              </motion.div>
              {diasSequencia} dias seguidos!
            </motion.div>
          </div>

          {/* Centro - Texto motivacional */}
          <div className="text-center flex-1 flex flex-col justify-center">
            <p className="text-xs text-white/80 font-medium">
              Continue a sequência!
            </p>
          </div>

          {/* Rodapé - Status */}
          <div className="text-center">
            <div className="bg-orange-500/20 backdrop-blur-sm rounded-lg px-2 py-1 border border-orange-300/20">
              <p className="text-xs text-white/90 font-medium">
                Gire hoje para manter!
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Estado 2: Após girar (Cronômetro)
  return (
    <motion.div
      initial={{ scale: 1.05, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, type: "spring", damping: 15 }}
      className="w-72 h-32 rounded-xl overflow-hidden relative bg-white/15 backdrop-blur-sm border border-orange-200/40"
      style={{
        boxShadow: "0 6px 20px rgba(255, 107, 0, 0.15)"
      }}
    >
      {/* Efeito de brilho sutil após giro */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100/10 via-transparent to-orange-200/10 pointer-events-none" />

      <div className="relative z-10 p-4 h-full flex flex-col justify-between">
        {/* Topo - Mantém a sequência visível */}
        <div className="text-center">
          <p className="text-xs text-white/70 font-medium mb-1">
            Dias de sequência:
          </p>
          <motion.div
            animate={{ 
              scale: [1, 1.02, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center justify-center gap-2 text-lg font-bold text-white"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Calendar className="h-5 w-5 text-orange-300" />
            </motion.div>
            {diasSequencia} dias seguidos!
          </motion.div>
        </div>

        {/* Centro - Cronômetro */}
        <div className="text-center flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Clock className="h-4 w-4 text-orange-300" />
            </motion.div>
            <p className="text-xs text-white/80 font-medium">
              Próximo giro liberado em:
            </p>
          </div>

          {/* Cronômetro Digital */}
          <motion.div
            key={`${tempoRestante.horas}-${tempoRestante.minutos}-${tempoRestante.segundos}`}
            initial={{ scale: 1.05, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-orange-500/20 backdrop-blur-sm rounded-lg px-2 py-1 border border-orange-300/30"
          >
            <div className="text-sm font-mono font-bold text-white tracking-wider">
              {String(tempoRestante.horas).padStart(2, '0')}:
              {String(tempoRestante.minutos).padStart(2, '0')}:
              {String(tempoRestante.segundos).padStart(2, '0')}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CardDiasDeSequencia;
