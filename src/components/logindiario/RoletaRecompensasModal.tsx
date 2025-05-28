
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Gift, X, Play } from "lucide-react";
import { motion, useAnimation } from "framer-motion";

interface RoletaRecompensasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Dados das recompensas da roleta
const recompensasRoleta = [
  { id: 1, nome: "50 SP", cor: "#FF6B00", icone: "💰" },
  { id: 2, nome: "100 SP", cor: "#FFD700", icone: "🪙" },
  { id: 3, nome: "Badge", cor: "#9333EA", icone: "🏆" },
  { id: 4, nome: "25 SP", cor: "#3B82F6", icone: "💎" },
  { id: 5, nome: "Certificado", cor: "#10B981", icone: "📜" },
  { id: 6, nome: "200 SP", cor: "#EF4444", icone: "💸" },
  { id: 7, nome: "E-book", cor: "#8B5CF6", icone: "📚" },
  { id: 8, nome: "75 SP", cor: "#F59E0B", icone: "✨" },
];

const RoletaRecompensasModal: React.FC<RoletaRecompensasModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [highlightedPoint, setHighlightedPoint] = useState<number | null>(null);
  const roletaControls = useAnimation();
  const roletaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number>();

  // Configuração dos setores
  const totalSetores = recompensasRoleta.length;
  const anguloSetor = 360 / totalSetores; // 45° para 8 setores

  // Inicializar áudio
  useEffect(() => {
    // Criar um áudio silencioso para contornar políticas de autoplay
    audioRef.current = new Audio();
    audioRef.current.volume = 0.3;
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Função para detectar colisão com pontos - Melhorada
  const detectarColisao = (angulo: number) => {
    const anguloNormalizado = angulo % 360;
    for (let i = 0; i < totalSetores; i++) {
      const centroSetor = (i * anguloSetor) + (anguloSetor / 2);
      let diferenca = Math.abs(anguloNormalizado - centroSetor);
      
      // Ajustar para a menor diferença circular
      if (diferenca > 180) {
        diferenca = 360 - diferenca;
      }
      
      // Detecta se está próximo ao centro do setor (±8° para maior precisão)
      if (diferenca <= 8) {
        return i;
      }
    }
    return null;
  };

  // Função para reproduzir som de clique com variações realistas
  const reproduzirSomClique = (velocidade: number = 1) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Varia a frequência baseada na velocidade
      const baseFreq = 800 + (velocidade * 200);
      const freq = baseFreq + (Math.random() * 100 - 50); // Adiciona variação
      
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(freq * 0.7, audioContext.currentTime + 0.05);
      
      // Volume baseado na velocidade
      const volume = Math.min(0.3, 0.1 + (velocidade * 0.05));
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log("Áudio não disponível");
    }
  };

  // Função para determinar recompensa com base no ângulo
  const determinarRecompensa = (anguloFinal: number) => {
    const anguloNormalizado = (360 - (anguloFinal % 360)) % 360;
    const indiceSetor = Math.floor(anguloNormalizado / anguloSetor);
    return recompensasRoleta[indiceSetor];
  };

  const girarRoleta = async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResultado(null);
    setHighlightedPoint(null);

    // Calcular rotação com física realista
    const voltasCompletas = Math.floor(Math.random() * 4) + 6; // 6-9 voltas
    const anguloFinalAlvo = Math.random() * 360;
    const rotacaoTotal = voltasCompletas * 360 + anguloFinalAlvo;

    let velocidadeAtual = 25; // Velocidade inicial alta
    let anguloAtual = 0;
    let ultimoPontoDetectado = -1;

    // Animação customizada com detecção de colisão e efeitos realistas
    const animar = () => {
      if (velocidadeAtual > 0.08) {
        anguloAtual += velocidadeAtual;
        
        // Atrito progressivo mais realista
        const atritoBase = 0.982;
        const atritoAdicional = velocidadeAtual > 5 ? 0.998 : 0.985;
        velocidadeAtual *= (atritoBase * atritoAdicional);
        
        setCurrentAngle(anguloAtual);
        
        // Detectar colisão com pontos
        const pontoColisao = detectarColisao(anguloAtual);
        if (pontoColisao !== null && pontoColisao !== ultimoPontoDetectado) {
          setHighlightedPoint(pontoColisao);
          reproduzirSomClique(velocidadeAtual);
          ultimoPontoDetectado = pontoColisao;
          
          // Remove o highlight com timing baseado na velocidade
          const highlightDuration = Math.max(100, Math.min(250, 300 - (velocidadeAtual * 20)));
          setTimeout(() => setHighlightedPoint(null), highlightDuration);
        }

        // Adicionar pequenas vibrações quando muito lento
        let anguloFinal = anguloAtual;
        if (velocidadeAtual < 2) {
          const vibracao = Math.sin(anguloAtual * 0.1) * (2 - velocidadeAtual) * 0.1;
          anguloFinal += vibracao;
        }

        // Usar animação mais suave com framer-motion
        roletaControls.set({ rotate: anguloFinal });
        
        animationRef.current = requestAnimationFrame(animar);
      } else {
        // Parada final com pequeno ajuste para alinhar perfeitamente
        const recompensaVencedora = determinarRecompensa(anguloAtual);
        
        // Pequeno ajuste final para centralizar no prêmio
        const setorEscolhido = recompensasRoleta.findIndex(r => r.id === recompensaVencedora.id);
        const anguloIdeal = (setorEscolhido * anguloSetor) + (anguloSetor / 2);
        const anguloFinalAjustado = anguloAtual + (anguloIdeal - (anguloAtual % 360));
        
        roletaControls.start({
          rotate: anguloFinalAjustado,
          transition: { duration: 0.3, ease: "easeOut" }
        });
        
        setTimeout(() => {
          setResultado(recompensaVencedora.nome);
          setIsSpinning(false);
        }, 800);
      }
    };

    animar();
  };

  const resetarRoleta = () => {
    roletaControls.set({ rotate: 0 });
    setCurrentAngle(0);
    setResultado(null);
    setIsSpinning(false);
    setHighlightedPoint(null);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[600px] p-0 bg-transparent border-0 shadow-none"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-gradient-to-br from-orange-50/30 via-orange-100/20 to-orange-200/30 backdrop-blur-xl border border-orange-200/40 rounded-3xl p-8 shadow-2xl"
          style={{
            background: "rgba(255, 245, 235, 0.25)",
            backdropFilter: "blur(25px)",
            WebkitBackdropFilter: "blur(25px)",
          }}
        >
          {/* Botão de fechar */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 border border-orange-200/30 transition-all duration-300"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4 text-orange-700" />
          </Button>

          {/* Título */}
          <div className="text-center mb-8">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-700 bg-clip-text text-transparent mb-2"
            >
              Roleta de Recompensas
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-orange-700/80 text-sm font-medium"
            >
              Gire a roleta e ganhe sua recompensa diária!
            </motion.p>
          </div>

          {/* Container da Roleta */}
          <div className="flex flex-col items-center space-y-6">
            {/* Roleta */}
            <div className="relative">
              {/* Pino/Seta da roleta - Virado para trás com efeitos realistas */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                <motion.div
                  animate={{
                    scale: highlightedPoint !== null ? 1.3 : 1,
                    y: highlightedPoint !== null ? -3 : 0,
                    rotateZ: highlightedPoint !== null ? [0, -2, 2, 0] : 0,
                    boxShadow: highlightedPoint !== null ? 
                      "0 0 20px rgba(255, 107, 0, 0.9), 0 0 40px rgba(255, 107, 0, 0.5)" : 
                      "0 4px 8px rgba(0, 0, 0, 0.3)"
                  }}
                  transition={{ 
                    duration: highlightedPoint !== null ? 0.15 : 0.3,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  className="relative"
                >
                  {/* Pino principal virado para trás */}
                  <div className={`w-0 h-0 border-l-[14px] border-r-[14px] border-t-[28px] border-l-transparent border-r-transparent transition-all duration-150 ${
                    highlightedPoint !== null ? 'border-t-red-500 filter brightness-125' : 'border-t-orange-600'
                  } drop-shadow-xl`}></div>
                  
                  {/* Base do pino com efeito metálico */}
                  <div className={`absolute -top-[26px] left-1/2 transform -translate-x-1/2 w-5 h-5 rounded-full border-3 border-white shadow-xl transition-all duration-150 ${
                    highlightedPoint !== null ? 'bg-gradient-to-br from-red-400 to-red-600 border-yellow-200' : 'bg-gradient-to-br from-orange-500 to-orange-700'
                  }`}>
                    {/* Brilho metálico */}
                    <div className="absolute top-1 left-1 w-2 h-2 bg-white/40 rounded-full blur-[1px]"></div>
                  </div>
                  
                  {/* Efeito de vibração quando ativo */}
                  {highlightedPoint !== null && (
                    <motion.div
                      className="absolute -top-[30px] left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-2 border-orange-400/30"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.8, 0, 0.8]
                      }}
                      transition={{
                        duration: 0.4,
                        repeat: Infinity,
                        ease: "easeOut"
                      }}
                    />
                  )}
                  
                  {/* Sombra dinâmica */}
                  <div className={`absolute top-[30px] left-1/2 transform -translate-x-1/2 w-6 h-2 rounded-full transition-all duration-150 ${
                    highlightedPoint !== null ? 
                      'bg-black/40 blur-sm scale-110' : 
                      'bg-black/20 blur-[1px]'
                  }`}></div>
                </motion.div>
              </div>

              {/* Roleta */}
              <motion.div
                ref={roletaRef}
                animate={roletaControls}
                className="relative w-80 h-80 rounded-full border-8 border-white shadow-2xl overflow-hidden"
                style={{
                  background: "conic-gradient(from 0deg, #FF6B00, #FFD700, #9333EA, #3B82F6, #10B981, #EF4444, #8B5CF6, #F59E0B)",
                  filter: isSpinning ? "brightness(1.1) contrast(1.05)" : "none",
                  transition: "filter 0.3s ease"
                }}
              >
                {/* Efeito de movimento quando girando */}
                {isSpinning && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "radial-gradient(circle, transparent 60%, rgba(255, 255, 255, 0.1) 70%, transparent 80%)",
                    }}
                    animate={{
                      rotate: [0, 360],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                )}
                
                {/* Reflexo realista */}
                <div 
                  className="absolute inset-2 rounded-full pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%, rgba(255, 255, 255, 0.1) 100%)",
                  }}
                />

                {/* Segmentos da roleta */}
                {recompensasRoleta.map((recompensa, index) => {
                  const angulo = (360 / recompensasRoleta.length) * index;
                  const anguloSegmento = 360 / recompensasRoleta.length;
                  
                  return (
                    <div
                      key={recompensa.id}
                      className="absolute w-full h-full flex items-center justify-center"
                      style={{
                        transform: `rotate(${angulo}deg)`,
                        clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((anguloSegmento * Math.PI) / 180)}% ${50 - 50 * Math.cos((anguloSegmento * Math.PI) / 180)}%)`,
                        backgroundColor: recompensa.cor,
                      }}
                    >
                      <div 
                        className="text-center text-white font-bold transform"
                        style={{
                          transform: `rotate(${-(angulo + anguloSegmento/2)}deg) translateY(-60px)`,
                        }}
                      >
                        <div className="text-2xl mb-1">{recompensa.icone}</div>
                        <div className="text-xs font-semibold drop-shadow-md">
                          {recompensa.nome}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Pontos de colisão nos limites dos setores */}
                {recompensasRoleta.map((_, index) => {
                  const angulo = (360 / recompensasRoleta.length) * index;
                  const x = 50 + 45 * Math.cos((angulo - 90) * Math.PI / 180);
                  const y = 50 + 45 * Math.sin((angulo - 90) * Math.PI / 180);
                  
                  return (
                    <motion.div
                      key={`point-${index}`}
                      className="absolute w-3 h-3 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-10"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        backgroundColor: highlightedPoint === index ? '#ef4444' : '#fbbf24',
                      }}
                      animate={{
                        scale: highlightedPoint === index ? 1.5 : 1,
                        boxShadow: highlightedPoint === index ? "0 0 10px rgba(239, 68, 68, 0.8)" : "none"
                      }}
                      transition={{ duration: 0.1 }}
                    />
                  );
                })}

                {/* Centro da roleta */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center z-10">
                  <Gift className="h-6 w-6 text-white" />
                </div>
              </motion.div>
            </div>

            {/* Botão de girar */}
            <div className="text-center space-y-4">
              <Button
                onClick={girarRoleta}
                disabled={isSpinning}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSpinning ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Play className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <Play className="h-5 w-5 mr-2" />
                )}
                {isSpinning ? "Girando..." : "Girar Roleta"}
              </Button>

              {/* Resultado */}
              {resultado && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  className="bg-gradient-to-r from-green-400 to-green-600 text-white p-4 rounded-xl shadow-lg"
                >
                  <div className="text-center">
                    <div className="text-xl font-bold mb-1">🎉 Parabéns!</div>
                    <div className="text-lg">Você ganhou: <span className="font-bold">{resultado}</span></div>
                  </div>
                </motion.div>
              )}

              {/* Botão reset (só aparece após resultado) */}
              {resultado && (
                <Button
                  onClick={resetarRoleta}
                  variant="outline"
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  Tentar Novamente
                </Button>
              )}
            </div>
          </div>

          {/* Efeitos decorativos */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-3xl">
            {/* Partículas flutuantes */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full opacity-60"
                initial={{ 
                  x: Math.random() * 500, 
                  y: Math.random() * 400,
                  scale: 0 
                }}
                animate={{ 
                  y: [null, -30, 30, -15, 10],
                  scale: [0, 1, 0.8, 1, 0.6],
                  opacity: [0, 0.8, 0.4, 0.8, 0]
                }}
                transition={{
                  duration: 4,
                  delay: i * 0.3,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              />
            ))}
          </div>

          {/* Gradiente de fundo */}
          <div 
            className="absolute inset-0 rounded-3xl opacity-20 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(255, 107, 0, 0.15) 0%, transparent 70%)"
            }}
          />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default RoletaRecompensasModal;
