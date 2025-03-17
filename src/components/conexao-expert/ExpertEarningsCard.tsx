import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Award,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

interface ExpertEarningsCardProps {
  earnings: {
    total: number;
    thisMonth: number;
    completedRequests: number;
    rating: number;
    studentCount: number;
    level: string;
    recentEarnings: {
      amount: number;
      date: string;
      requestTitle: string;
    }[];
  };
  onViewAllEarnings: () => void;
}

const ExpertEarningsCard: React.FC<ExpertEarningsCardProps> = ({
  earnings,
  onViewAllEarnings,
}) => {
  return (
    <div className="mt-8 bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#001427] dark:text-white font-montserrat flex items-center gap-2">
          <Award className="h-5 w-5 text-[#FF6B00]" /> Seus Ganhos como Expert
        </h2>
        <Button
          variant="link"
          className="text-[#FF6B00] hover:text-[#FF8C40] p-0 h-auto"
          onClick={onViewAllEarnings}
        >
          Ver Histórico <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/20 dark:bg-[#FF6B00]/30 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ganhos Totais
              </p>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {earnings.total} PC
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/20 dark:bg-[#FF6B00]/30 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ganhos este mês
              </p>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {earnings.thisMonth} PC
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/20 dark:bg-[#FF6B00]/30 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pedidos Resolvidos
              </p>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {earnings.completedRequests}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#FF6B00]" /> Ganhos Recentes
          </h3>

          {earnings.recentEarnings.length > 0 ? (
            <div className="space-y-3">
              {earnings.recentEarnings.map((earning, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#1E293B]/50 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                        {earning.requestTitle}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {earning.date}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    +{earning.amount} PC
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                Você ainda não tem ganhos como expert
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                onClick={() => setCurrentTab("em_leilao")}
              >
                <DollarSign className="h-3.5 w-3.5 mr-1" /> Ver Propostas
                Abertas
              </Button>
            </div>
          )}
        </div>

        <div className="md:w-64 bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-[#FF6B00]" /> Seu Perfil
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Avaliação:{" "}
                <span className="font-semibold">{earnings.rating}/5</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Alunos ajudados:{" "}
                <span className="font-semibold">{earnings.studentCount}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Nível: <span className="font-semibold">{earnings.level}</span>
              </span>
            </div>

            <div className="mt-4">
              <Badge className="w-full justify-center py-1.5 bg-gradient-to-r from-[#FF6B00]/80 to-[#FF8C40]/80 hover:from-[#FF8C40]/80 hover:to-[#FF6B00]/80 text-white border-none">
                {earnings.level === "Iniciante"
                  ? "Próximo nível: Intermediário"
                  : earnings.level === "Intermediário"
                    ? "Próximo nível: Avançado"
                    : "Nível máximo alcançado"}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertEarningsCard;
