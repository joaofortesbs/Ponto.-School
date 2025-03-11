import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Send,
  Gift,
  Clock,
  Calendar,
  ChevronRight,
  Users,
  Share2,
  Sparkles,
  BarChart3,
  Coins,
  Copy,
  ExternalLink,
  Filter,
  Download,
  Search,
  RefreshCw,
  TrendingUp,
  Zap,
  Award,
  ShoppingBag,
  Repeat,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "credit" | "debit" | "transfer" | "reward" | "purchase";
  amount: number;
  description: string;
  date: Date;
  status: "completed" | "pending" | "failed";
  category?: string;
  recipient?: string;
  sender?: string;
}

interface WalletCardProps {
  balance?: number;
  transactions?: Transaction[];
  referralCode?: string;
  referralCount?: number;
  referralEarnings?: number;
}

const defaultTransactions: Transaction[] = [
  {
    id: "1",
    type: "credit",
    amount: 500,
    description: "Recarga via cartão de crédito",
    date: new Date(2024, 3, 15),
    status: "completed",
    category: "Recarga",
  },
  {
    id: "2",
    type: "reward",
    amount: 100,
    description: "Bônus por completar curso de Cálculo",
    date: new Date(2024, 3, 14),
    status: "completed",
    category: "Bônus",
  },
  {
    id: "3",
    type: "debit",
    amount: 150,
    description: "Compra de curso de Física Quântica",
    date: new Date(2024, 3, 12),
    status: "completed",
    category: "Compra",
  },
  {
    id: "4",
    type: "transfer",
    amount: 50,
    description: "Transferência para Maria Silva",
    date: new Date(2024, 3, 10),
    status: "completed",
    category: "Transferência",
    recipient: "Maria Silva",
  },
  {
    id: "5",
    type: "purchase",
    amount: 200,
    description: "Compra de material didático",
    date: new Date(2024, 3, 8),
    status: "completed",
    category: "Compra",
  },
  {
    id: "6",
    type: "transfer",
    amount: 75,
    description: "Transferência recebida de Carlos Santos",
    date: new Date(2024, 3, 5),
    status: "completed",
    category: "Transferência",
    sender: "Carlos Santos",
  },
];

const transactionIcons = {
  credit: <Plus className="h-4 w-4 text-green-500" />,
  debit: <ArrowUpRight className="h-4 w-4 text-red-500" />,
  transfer: <Send className="h-4 w-4 text-blue-500" />,
  reward: <Gift className="h-4 w-4 text-purple-500" />,
  purchase: <ShoppingBag className="h-4 w-4 text-orange-500" />,
};

const statusIcons = {
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
};

const WalletCard = ({
  balance = 1250,
  transactions = defaultTransactions,
  referralCode = "JOAO2024",
  referralCount = 5,
  referralEarnings = 250,
}: WalletCardProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showBalance, setShowBalance] = useState(true);
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [fundAmount, setFundAmount] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = filterType ? transaction.type === filterType : true;
    return matchesSearch && matchesType;
  });

  const chartData = [
    { month: "Jan", value: 800 },
    { month: "Fev", value: 950 },
    { month: "Mar", value: 1100 },
    { month: "Abr", value: 1250 },
  ];

  const maxChartValue = Math.max(...chartData.map((item) => item.value));

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    alert("Código copiado para a área de transferência!");
  };

  const handleAddFunds = () => {
    setIsAddingFunds(false);
    alert(`${fundAmount} School Points adicionados com sucesso!`);
  };

  return (
    <Card className="w-full bg-white dark:bg-[#0A2540] border-brand-border dark:border-white/10 overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-[#FFD700]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#29335C] dark:text-white">
                Carteira
              </h3>
              <p className="text-sm text-[#778DA9] dark:text-white/60">
                Gerencie seus School Points
              </p>
            </div>
          </div>

          <TabsList className="grid grid-cols-4 h-9">
            <TabsTrigger
              value="overview"
              className="text-xs data-[state=active]:bg-[#29335C] data-[state=active]:text-white"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="text-xs data-[state=active]:bg-[#29335C] data-[state=active]:text-white"
            >
              Histórico
            </TabsTrigger>
            <TabsTrigger
              value="referral"
              className="text-xs data-[state=active]:bg-[#29335C] data-[state=active]:text-white"
            >
              Indicações
            </TabsTrigger>
            <TabsTrigger
              value="rewards"
              className="text-xs data-[state=active]:bg-[#29335C] data-[state=active]:text-white"
            >
              Recompensas
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="p-0 m-0">
          <div className="p-6 space-y-6">
            {/* Balance Card */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#29335C] to-[#3D4E81] p-6 text-white">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1932&auto=format&fit=crop')] opacity-10 bg-cover bg-center" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#29335C]/80 to-[#3D4E81]/80" />

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-white/70">Saldo Disponível</p>
                    <div className="flex items-center gap-2">
                      {showBalance ? (
                        <h2 className="text-3xl font-bold">
                          {balance.toLocaleString()} SP
                        </h2>
                      ) : (
                        <h2 className="text-3xl font-bold">••••••</h2>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/10"
                        onClick={() => setShowBalance(!showBalance)}
                      >
                        {showBalance ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                      onClick={() => setIsAddingFunds(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                    <Button
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Enviar
                    </Button>
                  </div>
                </div>

                {/* Balance Chart */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-white/70">Evolução do Saldo</p>
                    <Badge className="bg-white/20 text-white text-xs hover:bg-white/30">
                      Últimos 4 meses
                    </Badge>
                  </div>

                  <div className="flex items-end h-24 gap-1">
                    {chartData.map((item, index) => (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
                        <div
                          className="w-full bg-white/20 hover:bg-white/30 rounded-t-sm transition-all duration-300 group relative"
                          style={{
                            height: `${(item.value / maxChartValue) * 100}%`,
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-[#29335C] text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                            {item.value} SP
                          </div>
                        </div>
                        <span className="text-xs text-white/70">
                          {item.month}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Animated Particles */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                  <div className="coin coin-1"></div>
                  <div className="coin coin-2"></div>
                  <div className="coin coin-3"></div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24 hover:border-[#FFD700] hover:bg-[#FFD700]/5 group"
                onClick={() => setIsAddingFunds(true)}
              >
                <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 flex items-center justify-center mb-2 group-hover:bg-[#FFD700]/20 transition-colors">
                  <CreditCard className="h-5 w-5 text-[#FFD700]" />
                </div>
                <span className="text-sm font-medium">Comprar Pontos</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24 hover:border-[#29335C] hover:bg-[#29335C]/5 group"
                onClick={() => {
                  const recipient = prompt(
                    "Digite o nome ou ID do destinatário:",
                  );
                  if (recipient) {
                    const amount = prompt(
                      "Digite a quantidade de pontos a transferir:",
                    );
                    if (amount && !isNaN(Number(amount))) {
                      alert(
                        `${amount} School Points transferidos para ${recipient} com sucesso!`,
                      );
                    }
                  }
                }}
              >
                <div className="w-10 h-10 rounded-full bg-[#29335C]/10 flex items-center justify-center mb-2 group-hover:bg-[#29335C]/20 transition-colors">
                  <Send className="h-5 w-5 text-[#29335C]" />
                </div>
                <span className="text-sm font-medium">Transferir</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24 hover:border-purple-500 hover:bg-purple-500/5 group"
                onClick={() => setActiveTab("rewards")}
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-2 group-hover:bg-purple-500/20 transition-colors">
                  <Gift className="h-5 w-5 text-purple-500" />
                </div>
                <span className="text-sm font-medium">Resgatar</span>
              </Button>
            </div>

            {/* Recent Transactions */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
                  Transações Recentes
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-[#29335C] dark:text-white/70 hover:text-[#29335C] dark:hover:text-white"
                  onClick={() => setActiveTab("history")}
                >
                  Ver todas
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <div className="space-y-3">
                {transactions.slice(0, 3).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[#E0E1DD]/30 dark:hover:bg-white/5 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === "credit" ||
                          transaction.type === "reward"
                            ? "bg-green-500/10"
                            : transaction.type === "transfer"
                              ? "bg-blue-500/10"
                              : "bg-red-500/10"
                        }`}
                      >
                        {transactionIcons[transaction.type]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#29335C] dark:text-white group-hover:text-[#29335C]/80 dark:group-hover:text-white/80 transition-colors">
                          {transaction.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#778DA9] dark:text-white/60">
                            {transaction.date.toLocaleDateString()}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0 h-4 border-[#778DA9]/30 text-[#778DA9] dark:border-white/20 dark:text-white/60"
                          >
                            {transaction.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        transaction.type === "credit" ||
                        transaction.type === "reward"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {transaction.type === "credit" ||
                      transaction.type === "reward"
                        ? "+"
                        : "-"}
                      {transaction.amount} SP
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add Funds Dialog */}
          {isAddingFunds && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-[#0A2540] rounded-xl p-6 max-w-md w-full">
                <h3 className="text-xl font-semibold text-[#29335C] dark:text-white mb-4">
                  Adicionar School Points
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {[100, 500, 1000, 2000].map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant={fundAmount === amount ? "default" : "outline"}
                        className={`h-12 text-lg font-semibold ${fundAmount === amount ? "bg-[#29335C] text-white" : "hover:border-[#29335C] hover:text-[#29335C]"}`}
                        onClick={() => setFundAmount(amount)}
                      >
                        {amount} SP
                      </Button>
                    ))}
                  </div>

                  <div className="relative">
                    <Input
                      type="number"
                      min={1}
                      value={fundAmount}
                      onChange={(e) => setFundAmount(Number(e.target.value))}
                      placeholder="Ou digite um valor personalizado"
                      className="h-12 text-lg pl-12"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                      SP
                    </span>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => setIsAddingFunds(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1 bg-[#29335C] hover:bg-[#29335C]/90 text-white"
                      onClick={handleAddFunds}
                    >
                      Confirmar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="p-0 m-0">
          <div className="p-6 space-y-6">
            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar transações..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={filterType === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(null)}
                  className={
                    filterType === null ? "bg-[#29335C] text-white" : ""
                  }
                >
                  Todos
                </Button>
                <Button
                  variant={filterType === "credit" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("credit")}
                  className={
                    filterType === "credit" ? "bg-green-500 text-white" : ""
                  }
                >
                  Entradas
                </Button>
                <Button
                  variant={filterType === "debit" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("debit")}
                  className={
                    filterType === "debit" ? "bg-red-500 text-white" : ""
                  }
                >
                  Saídas
                </Button>
              </div>

              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>

            {/* Transactions List */}
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {/* Group transactions by month */}
                {(() => {
                  const groupedTransactions: Record<string, Transaction[]> = {};

                  filteredTransactions.forEach((transaction) => {
                    const monthYear = transaction.date.toLocaleDateString(
                      "pt-BR",
                      { month: "long", year: "numeric" },
                    );
                    if (!groupedTransactions[monthYear]) {
                      groupedTransactions[monthYear] = [];
                    }
                    groupedTransactions[monthYear].push(transaction);
                  });

                  return Object.entries(groupedTransactions).map(
                    ([monthYear, transactions]) => (
                      <div key={monthYear}>
                        <div className="relative mb-4">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-[#E0E1DD] dark:border-white/10" />
                          </div>
                          <div className="relative flex justify-center">
                            <span className="bg-white dark:bg-[#0A2540] px-2 text-sm font-medium text-[#778DA9] dark:text-white/60 capitalize">
                              {monthYear}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {transactions.map((transaction) => (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between p-4 rounded-lg hover:bg-[#E0E1DD]/30 dark:hover:bg-white/5 transition-all duration-300 group"
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    transaction.type === "credit" ||
                                    transaction.type === "reward"
                                      ? "bg-green-500/10"
                                      : transaction.type === "transfer"
                                        ? "bg-blue-500/10"
                                        : "bg-red-500/10"
                                  }`}
                                >
                                  {transactionIcons[transaction.type]}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-[#29335C] dark:text-white group-hover:text-[#29335C]/80 dark:group-hover:text-white/80 transition-colors">
                                    {transaction.description}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-[#778DA9] dark:text-white/60">
                                      {transaction.date.toLocaleDateString()}{" "}
                                      {transaction.date.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1 py-0 h-4 border-[#778DA9]/30 text-[#778DA9] dark:border-white/20 dark:text-white/60"
                                    >
                                      {transaction.category}
                                    </Badge>
                                    <div className="flex items-center">
                                      {statusIcons[transaction.status]}
                                      <span className="text-[10px] ml-1 text-[#778DA9] dark:text-white/60 capitalize">
                                        {transaction.status}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div
                                className={`text-base font-medium ${
                                  transaction.type === "credit" ||
                                  transaction.type === "reward"
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                {transaction.type === "credit" ||
                                transaction.type === "reward"
                                  ? "+"
                                  : "-"}
                                {transaction.amount} SP
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  );
                })()}

                {filteredTransactions.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 rounded-full bg-[#E0E1DD]/50 dark:bg-white/5 flex items-center justify-center mb-4">
                      <Search className="h-8 w-8 text-[#778DA9] dark:text-white/40" />
                    </div>
                    <p className="text-[#778DA9] dark:text-white/60 text-center">
                      Nenhuma transação encontrada
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        {/* Referral Tab */}
        <TabsContent value="referral" className="p-0 m-0">
          <div className="p-6 space-y-6">
            {/* Referral Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-[#29335C]/5 dark:bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-[#29335C] dark:text-white" />
                  <span className="text-sm text-[#778DA9] dark:text-white/60">
                    Amigos Indicados
                  </span>
                </div>
                <div className="text-2xl font-bold text-[#29335C] dark:text-white">
                  {referralCount}
                </div>
              </div>

              <div className="p-4 bg-[#29335C]/5 dark:bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="h-4 w-4 text-[#FFD700]" />
                  <span className="text-sm text-[#778DA9] dark:text-white/60">
                    Pontos Ganhos
                  </span>
                </div>
                <div className="text-2xl font-bold text-[#29335C] dark:text-white">
                  {referralEarnings} SP
                </div>
              </div>

              <div className="p-4 bg-[#29335C]/5 dark:bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-[#778DA9] dark:text-white/60">
                    Conversão
                  </span>
                </div>
                <div className="text-2xl font-bold text-[#29335C] dark:text-white">
                  80%
                </div>
              </div>
            </div>

            {/* Referral Code */}
            <div className="bg-gradient-to-r from-[#29335C] to-[#3D4E81] rounded-xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1932&auto=format&fit=crop')] opacity-10 bg-cover bg-center" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#29335C]/80 to-[#3D4E81]/80" />

              <div className="relative z-10">
                <h3 className="text-xl font-semibold mb-2">
                  Seu Código de Indicação
                </h3>
                <p className="text-sm text-white/70 mb-4">
                  Compartilhe este código com seus amigos e ganhe 50 SP por cada
                  novo usuário que se cadastrar.
                </p>

                <div className="flex items-center gap-2 mb-6">
                  <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                    <span className="text-xl font-bold tracking-widest">
                      {referralCode}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 border-white/20 text-white hover:bg-white/20 hover:text-white"
                    onClick={handleCopyReferralCode}
                  >
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                    onClick={() => {
                      const shareText = `Use meu código de indicação ${referralCode} para ganhar 50 School Points ao se cadastrar na Ponto.School!`;
                      if (navigator.share) {
                        navigator
                          .share({
                            title: "Ponto.School - Código de Indicação",
                            text: shareText,
                            url: window.location.origin,
                          })
                          .catch((err) => {
                            alert("Compartilhado: " + shareText);
                          });
                      } else {
                        alert("Compartilhado: " + shareText);
                      }
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                  <Button
                    className="flex-1 bg-white text-[#29335C] hover:bg-white/90"
                    onClick={() => {
                      alert(
                        "Programa de Indicação: Ganhe 50 School Points por cada amigo que se cadastrar usando seu código de indicação!",
                      );
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Programa
                  </Button>
                </div>
              </div>
            </div>

            {/* Referral History */}
            <div>
              <h3 className="text-lg font-semibold text-[#29335C] dark:text-white mb-4">
                Histórico de Indicações
              </h3>

              <div className="space-y-3">
                {[
                  {
                    name: "Maria Silva",
                    date: "15/03/2024",
                    status: "Ativo",
                    earnings: 50,
                  },
                  {
                    name: "João Oliveira",
                    date: "10/03/2024",
                    status: "Ativo",
                    earnings: 50,
                  },
                  {
                    name: "Ana Santos",
                    date: "05/03/2024",
                    status: "Ativo",
                    earnings: 50,
                  },
                  {
                    name: "Carlos Ferreira",
                    date: "28/02/2024",
                    status: "Ativo",
                    earnings: 50,
                  },
                  {
                    name: "Lúcia Pereira",
                    date: "20/02/2024",
                    status: "Ativo",
                    earnings: 50,
                  },
                ].map((referral, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[#E0E1DD]/30 dark:hover:bg-white/5 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${referral.name}`}
                        />
                        <AvatarFallback>
                          {referral.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-[#29335C] dark:text-white">
                          {referral.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#778DA9] dark:text-white/60">
                            Registrado em {referral.date}
                          </span>
                          <Badge className="bg-green-500/10 text-green-500 text-xs">
                            {referral.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-green-500">
                      +{referral.earnings} SP
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="p-0 m-0">
          <div className="p-6 space-y-6">
            {/* Rewards Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-[#29335C]/5 dark:bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-[#FFD700]" />
                  <span className="text-sm text-[#778DA9] dark:text-white/60">
                    Recompensas Disponíveis
                  </span>
                </div>
                <div className="text-2xl font-bold text-[#29335C] dark:text-white">
                  12
                </div>
              </div>

              <div className="p-4 bg-[#29335C]/5 dark:bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-[#778DA9] dark:text-white/60">
                    Recompensas Resgatadas
                  </span>
                </div>
                <div className="text-2xl font-bold text-[#29335C] dark:text-white">
                  5
                </div>
              </div>

              <div className="p-4 bg-[#29335C]/5 dark:bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-[#FFD700]" />
                  <span className="text-sm text-[#778DA9] dark:text-white/60">
                    Pontos Necessários
                  </span>
                </div>
                <div className="text-2xl font-bold text-[#29335C] dark:text-white">
                  500 SP
                </div>
              </div>
            </div>

            {/* Available Rewards */}
            <div>
              <h3 className="text-lg font-semibold text-[#29335C] dark:text-white mb-4">
                Recompensas Disponíveis
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Curso Premium de Física Quântica",
                    description: "Acesso completo ao curso avançado",
                    points: 500,
                    image:
                      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
                    category: "Curso",
                  },
                  {
                    title: "E-book Exclusivo: Matemática Avançada",
                    description: "Material didático completo em PDF",
                    points: 300,
                    image:
                      "https://images.unsplash.com/photo-1596496181848-3091d4878b24",
                    category: "Material",
                  },
                  {
                    title: "Mentoria Individual (1 hora)",
                    description: "Sessão exclusiva com professor especialista",
                    points: 800,
                    image:
                      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
                    category: "Mentoria",
                  },
                  {
                    title: "Certificado de Excelência",
                    description: "Certificado digital personalizado",
                    points: 200,
                    image:
                      "https://images.unsplash.com/photo-1589330694653-ded6df03f754",
                    category: "Certificado",
                  },
                ].map((reward, index) => (
                  <div
                    key={index}
                    className="group border border-[#E0E1DD] dark:border-white/10 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300"
                  >
                    <div className="h-40 overflow-hidden">
                      <img
                        src={reward.image}
                        alt={reward.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="text-base font-semibold text-[#29335C] dark:text-white group-hover:text-[#29335C]/80 dark:group-hover:text-white/80 transition-colors">
                          {reward.title}
                        </h4>
                        <Badge className="bg-[#FFD700]/10 text-[#FFD700] dark:bg-[#FFD700]/20">
                          {reward.points} SP
                        </Badge>
                      </div>
                      <p className="text-sm text-[#778DA9] dark:text-white/60">
                        {reward.description}
                      </p>
                      <div className="flex justify-between items-center pt-2">
                        <Badge variant="outline" className="text-xs">
                          {reward.category}
                        </Badge>
                        <Button
                          size="sm"
                          className="bg-[#29335C] hover:bg-[#29335C]/90 text-white"
                          onClick={() => {
                            if (balance >= reward.points) {
                              alert(
                                `Recompensa "${reward.title}" resgatada com sucesso!`,
                              );
                            } else {
                              alert(
                                `Saldo insuficiente. Você precisa de ${reward.points} SP para resgatar esta recompensa.`,
                              );
                            }
                          }}
                        >
                          Resgatar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Redeemed Rewards */}
            <div>
              <h3 className="text-lg font-semibold text-[#29335C] dark:text-white mb-4">
                Recompensas Resgatadas
              </h3>

              <div className="space-y-3">
                {[
                  {
                    title: "Curso de Programação em Python",
                    date: "15/03/2024",
                    points: 400,
                    status: "Ativo",
                  },
                  {
                    title: "E-book: Introdução à Física Quântica",
                    date: "10/02/2024",
                    points: 250,
                    status: "Ativo",
                  },
                  {
                    title: "Certificado de Participação: Hackathon",
                    date: "05/01/2024",
                    points: 150,
                    status: "Expirado",
                  },
                ].map((reward, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[#E0E1DD]/30 dark:hover:bg-white/5 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Gift className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#29335C] dark:text-white">
                          {reward.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#778DA9] dark:text-white/60">
                            Resgatado em {reward.date}
                          </span>
                          <Badge
                            className={`text-xs ${reward.status === "Ativo" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
                          >
                            {reward.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-red-500">
                      -{reward.points} SP
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default WalletCard;
