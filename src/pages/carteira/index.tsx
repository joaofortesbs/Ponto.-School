import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Filter,
  Plus,
  ChevronRight,
  Gift,
  Zap,
  Award,
  ShoppingCart,
  MessageCircle,
  Star,
  Users,
  BookOpen,
} from "lucide-react";

export default function CarteiraPage() {
  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 space-y-6 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#29335C] dark:text-white">
            Carteira
          </h1>
          <p className="text-[#64748B] dark:text-white/60">
            Gerencie seus School Points e transações
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <ArrowUpRight className="h-4 w-4" />
            Enviar
          </Button>
          <Button variant="outline" className="gap-2">
            <ArrowDownLeft className="h-4 w-4" />
            Receber
          </Button>
          <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Pontos
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white dark:bg-[#0A2540] border-[#E0E1DD] dark:border-white/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-[#64748B] dark:text-white/60">
              Saldo Disponível
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-[#FF6B00]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#29335C] dark:text-white">
                  1,250 SP
                </div>
                <div className="text-sm text-[#64748B] dark:text-white/60">
                  ≈ R$ 125,00
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#0A2540] border-[#E0E1DD] dark:border-white/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-[#64748B] dark:text-white/60">
              Pontos Ganhos (Total)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <ArrowDownLeft className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#29335C] dark:text-white">
                  2,450 SP
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  +150 SP este mês
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#0A2540] border-[#E0E1DD] dark:border-white/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-[#64748B] dark:text-white/60">
              Pontos Gastos (Total)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#29335C] dark:text-white">
                  1,200 SP
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">
                  -200 SP este mês
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white dark:bg-[#0A2540] border-[#E0E1DD] dark:border-white/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-[#29335C] dark:text-white">
                  Histórico de Transações
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Input placeholder="Buscar..." className="h-8 w-40" />
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Filter className="h-3 w-3" /> Filtros
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="todos">
                <TabsList className="mb-4">
                  <TabsTrigger value="todos">Todos</TabsTrigger>
                  <TabsTrigger value="recebidos">Recebidos</TabsTrigger>
                  <TabsTrigger value="enviados">Enviados</TabsTrigger>
                  <TabsTrigger value="compras">Compras</TabsTrigger>
                </TabsList>

                <TabsContent value="todos" className="space-y-4">
                  {[
                    {
                      id: 1,
                      type: "recebido",
                      title: "Pontos por Conclusão de Curso",
                      amount: 100,
                      date: "Hoje, 10:30",
                      status: "concluído",
                      category: "Curso",
                    },
                    {
                      id: 2,
                      type: "enviado",
                      title: "Compra de Material Didático",
                      amount: 50,
                      date: "Ontem, 15:45",
                      status: "concluído",
                      category: "Compra",
                    },
                    {
                      id: 3,
                      type: "recebido",
                      title: "Bônus por Participação em Fórum",
                      amount: 25,
                      date: "22/06/2024, 09:15",
                      status: "concluído",
                      category: "Participação",
                    },
                    {
                      id: 4,
                      type: "enviado",
                      title: "Compra de Curso Premium",
                      amount: 150,
                      date: "20/06/2024, 14:20",
                      status: "concluído",
                      category: "Compra",
                    },
                    {
                      id: 5,
                      type: "recebido",
                      title: "Pontos por Avaliação 5 Estrelas",
                      amount: 30,
                      date: "18/06/2024, 11:30",
                      status: "concluído",
                      category: "Avaliação",
                    },
                  ].map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border border-[#E0E1DD] dark:border-white/10 rounded-lg hover:bg-[#E0E1DD]/10 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === "recebido" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
                        >
                          {transaction.type === "recebido" ? (
                            <ArrowDownLeft className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-[#29335C] dark:text-white">
                            {transaction.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              {transaction.category}
                            </Badge>
                            <span className="text-xs text-[#64748B] dark:text-white/60 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {transaction.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-medium ${transaction.type === "recebido" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {transaction.type === "recebido" ? "+" : "-"}
                          {transaction.amount} SP
                        </div>
                        <div className="text-xs text-[#64748B] dark:text-white/60 mt-1">
                          {transaction.status === "concluído"
                            ? "Concluído"
                            : "Pendente"}
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="recebidos" className="space-y-4">
                  {[
                    {
                      id: 1,
                      type: "recebido",
                      title: "Pontos por Conclusão de Curso",
                      amount: 100,
                      date: "Hoje, 10:30",
                      status: "concluído",
                      category: "Curso",
                    },
                    {
                      id: 3,
                      type: "recebido",
                      title: "Bônus por Participação em Fórum",
                      amount: 25,
                      date: "22/06/2024, 09:15",
                      status: "concluído",
                      category: "Participação",
                    },
                    {
                      id: 5,
                      type: "recebido",
                      title: "Pontos por Avaliação 5 Estrelas",
                      amount: 30,
                      date: "18/06/2024, 11:30",
                      status: "concluído",
                      category: "Avaliação",
                    },
                  ].map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border border-[#E0E1DD] dark:border-white/10 rounded-lg hover:bg-[#E0E1DD]/10 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <ArrowDownLeft className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-[#29335C] dark:text-white">
                            {transaction.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              {transaction.category}
                            </Badge>
                            <span className="text-xs text-[#64748B] dark:text-white/60 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {transaction.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600 dark:text-green-400">
                          +{transaction.amount} SP
                        </div>
                        <div className="text-xs text-[#64748B] dark:text-white/60 mt-1">
                          {transaction.status === "concluído"
                            ? "Concluído"
                            : "Pendente"}
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="enviados" className="space-y-4">
                  {[
                    {
                      id: 2,
                      type: "enviado",
                      title: "Compra de Material Didático",
                      amount: 50,
                      date: "Ontem, 15:45",
                      status: "concluído",
                      category: "Compra",
                    },
                    {
                      id: 4,
                      type: "enviado",
                      title: "Compra de Curso Premium",
                      amount: 150,
                      date: "20/06/2024, 14:20",
                      status: "concluído",
                      category: "Compra",
                    },
                  ].map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border border-[#E0E1DD] dark:border-white/10 rounded-lg hover:bg-[#E0E1DD]/10 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-[#29335C] dark:text-white">
                            {transaction.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              {transaction.category}
                            </Badge>
                            <span className="text-xs text-[#64748B] dark:text-white/60 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {transaction.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-red-600 dark:text-red-400">
                          -{transaction.amount} SP
                        </div>
                        <div className="text-xs text-[#64748B] dark:text-white/60 mt-1">
                          {transaction.status === "concluído"
                            ? "Concluído"
                            : "Pendente"}
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="compras" className="space-y-4">
                  {[
                    {
                      id: 2,
                      type: "enviado",
                      title: "Compra de Material Didático",
                      amount: 50,
                      date: "Ontem, 15:45",
                      status: "concluído",
                      category: "Compra",
                    },
                    {
                      id: 4,
                      type: "enviado",
                      title: "Compra de Curso Premium",
                      amount: 150,
                      date: "20/06/2024, 14:20",
                      status: "concluído",
                      category: "Compra",
                    },
                    {
                      id: 6,
                      type: "enviado",
                      title: "Compra de E-book Física Quântica",
                      amount: 75,
                      date: "15/06/2024, 16:10",
                      status: "concluído",
                      category: "Compra",
                    },
                  ].map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border border-[#E0E1DD] dark:border-white/10 rounded-lg hover:bg-[#E0E1DD]/10 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-[#29335C] dark:text-white">
                            {transaction.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              {transaction.category}
                            </Badge>
                            <span className="text-xs text-[#64748B] dark:text-white/60 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {transaction.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-red-600 dark:text-red-400">
                          -{transaction.amount} SP
                        </div>
                        <div className="text-xs text-[#64748B] dark:text-white/60 mt-1">
                          {transaction.status === "concluído"
                            ? "Concluído"
                            : "Pendente"}
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white dark:bg-[#0A2540] border-[#E0E1DD] dark:border-white/10">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#29335C] dark:text-white">
                Formas de Ganhar Pontos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: "Complete cursos",
                  description: "Ganhe pontos ao concluir cursos na plataforma",
                  icon: <Award className="h-5 w-5 text-[#FF6B00]" />,
                  points: "50-200",
                },
                {
                  title: "Participe do fórum",
                  description: "Responda perguntas e ajude outros estudantes",
                  icon: <MessageCircle className="h-5 w-5 text-[#FF6B00]" />,
                  points: "5-25",
                },
                {
                  title: "Avalie conteúdos",
                  description: "Dê feedback sobre os materiais que consumiu",
                  icon: <Star className="h-5 w-5 text-[#FF6B00]" />,
                  points: "5-15",
                },
                {
                  title: "Convide amigos",
                  description: "Indique a plataforma para seus colegas",
                  icon: <Users className="h-5 w-5 text-[#FF6B00]" />,
                  points: "100",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 border border-[#E0E1DD] dark:border-white/10 rounded-lg hover:bg-[#E0E1DD]/10 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-[#29335C] dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-sm text-[#64748B] dark:text-white/60">
                      {item.description}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-[#FF6B00]">
                    {item.points} SP
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-[#29335C] to-[#001427] text-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Converta seus pontos
              </CardTitle>
              <CardDescription className="text-white/70">
                Troque seus School Points por benefícios exclusivos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Desconto em cursos</span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white text-[#29335C] hover:bg-white/90"
                >
                  Trocar
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Materiais exclusivos</span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white text-[#29335C] hover:bg-white/90"
                >
                  Trocar
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  <span>Prêmios e brindes</span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white text-[#29335C] hover:bg-white/90"
                >
                  Trocar
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-white text-[#29335C] hover:bg-white/90">
                Ver todas as opções
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
