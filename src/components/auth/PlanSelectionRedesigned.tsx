import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  User,
  Building,
  CheckCircle,
  ChevronRight,
  Zap,
  Shield,
  Clock,
  Award,
} from "lucide-react";

interface PlanSelectionRedesignedProps {
  onSelectPlan: (plan: string) => void;
}

const PlanSelectionRedesigned: React.FC<PlanSelectionRedesignedProps> = ({
  onSelectPlan = () => {},
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span className="text-white">Ponto</span>
            <span className="text-[#FF6B00]">.</span>
            <span className="text-white">School</span>
          </h1>
          <div className="h-1.5 w-32 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-full mx-auto my-6"></div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold text-white mb-4"
        >
          ESCOLHA SEU PLANO
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-300 mb-12 max-w-2xl text-lg"
        >
          Selecione o modelo que melhor se adapta às suas necessidades e comece
          sua jornada de aprendizado com a melhor plataforma educacional
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative overflow-hidden rounded-2xl border border-[#FF6B00]/20 bg-gradient-to-b from-[#001427] to-[#001F3F] p-8 shadow-xl hover:shadow-[#FF6B00]/20 transition-all duration-300 hover:scale-[1.02] group"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF6B00]/20 to-transparent rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent rounded-tr-full"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-tl from-[#FF6B00]/5 to-transparent rounded-tl-full"></div>

            <div className="flex flex-col h-full relative z-10">
              <div className="mb-6 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[#FF6B00]/10 flex items-center justify-center shadow-lg shadow-[#FF6B00]/5">
                  <User className="h-10 w-10 text-[#FF6B00]" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white text-center mb-4">
                PONTO.SCHOOL LITE
              </h3>

              <div className="flex-grow">
                <p className="text-gray-300 text-center text-lg mb-6">
                  Acesso para alunos e professores de instituições públicas
                </p>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-base text-gray-300">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mr-3">
                      <Zap className="h-4 w-4 text-[#FF6B00]" />
                    </div>
                    Recursos básicos de estudo
                  </li>
                  <li className="flex items-center text-base text-gray-300">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mr-3">
                      <Shield className="h-4 w-4 text-[#FF6B00]" />
                    </div>
                    Acesso a materiais didáticos
                  </li>
                  <li className="flex items-center text-base text-gray-300">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mr-3">
                      <Clock className="h-4 w-4 text-[#FF6B00]" />
                    </div>
                    Grupos de estudo
                  </li>
                </ul>
              </div>

              <Button
                onClick={() => onSelectPlan("lite")}
                className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-medium py-6 rounded-xl transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#FF6B00]/20 flex items-center justify-center gap-2 text-lg"
              >
                Selecionar plano
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative overflow-hidden rounded-2xl border border-[#FF6B00]/30 bg-gradient-to-b from-[#001427] to-[#001F3F] p-8 shadow-xl hover:shadow-[#FF6B00]/30 transition-all duration-300 hover:scale-[1.02] group"
          >
            {/* Premium badge */}
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-white text-sm font-bold py-2 px-4 rounded-bl-lg rounded-tr-lg shadow-lg transform rotate-2">
              PREMIUM
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#FF6B00]/20 to-transparent rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent rounded-tr-full"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-tl from-[#FF6B00]/5 to-transparent rounded-tl-full"></div>

            <div className="flex flex-col h-full relative z-10">
              <div className="mb-6 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[#FF6B00]/20 flex items-center justify-center shadow-lg shadow-[#FF6B00]/10">
                  <Building className="h-10 w-10 text-[#FF6B00]" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white text-center mb-4">
                PONTO.SCHOOL FULL
              </h3>

              <div className="flex-grow">
                <p className="text-gray-300 text-center text-lg mb-6">
                  Acesso para alunos e professores de instituições particulares
                </p>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-base text-gray-300">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mr-3">
                      <CheckCircle className="h-4 w-4 text-[#FF6B00]" />
                    </div>
                    Todos os recursos do plano LITE
                  </li>
                  <li className="flex items-center text-base text-gray-300">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mr-3">
                      <Zap className="h-4 w-4 text-[#FF6B00]" />
                    </div>
                    Mentoria com IA avançada
                  </li>
                  <li className="flex items-center text-base text-gray-300">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mr-3">
                      <Shield className="h-4 w-4 text-[#FF6B00]" />
                    </div>
                    Materiais exclusivos
                  </li>
                  <li className="flex items-center text-base text-gray-300">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mr-3">
                      <Award className="h-4 w-4 text-[#FF6B00]" />
                    </div>
                    Suporte prioritário
                  </li>
                </ul>
              </div>

              <Button
                onClick={() => onSelectPlan("full")}
                className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-medium py-6 rounded-xl transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#FF6B00]/30 flex items-center justify-center gap-2 text-lg relative overflow-hidden"
              >
                <span className="relative z-10">Selecionar plano</span>
                <ChevronRight className="h-5 w-5 relative z-10" />
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-gray-400 text-sm max-w-lg text-center"
        >
          Ao selecionar um plano, você concorda com nossos termos de serviço e
          política de privacidade. Todos os planos incluem acesso à plataforma
          básica e podem ser atualizados a qualquer momento.
        </motion.div>
      </div>
    </div>
  );
};

export default PlanSelectionRedesigned;
