import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Clock, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import "moment/locale/pt-br";
import DescrevaSuaRotinaModal from "./DescrevaSuaRotinaModal";
import { toast } from "@/components/ui/use-toast";

moment.locale("pt-br");
const localizer = momentLocalizer(moment);

interface Evento {
  id: number;
  title: string;
  start: Date;
  end: Date;
  recurringRule?: any;
  color?: string;
}

const eventosPadrao: Evento[] = [
  {
    id: 1,
    title: "Aula de Física",
    start: new Date(2023, 9, 16, 8, 0),
    end: new Date(2023, 9, 16, 10, 0),
    color: "#3788d8",
  },
  {
    id: 2,
    title: "Estudo de Cálculo",
    start: new Date(2023, 9, 16, 14, 0),
    end: new Date(2023, 9, 16, 16, 0),
    color: "#f8c146",
  },
  {
    id: 3,
    title: "Grupo de Estudos",
    start: new Date(2023, 9, 17, 10, 0),
    end: new Date(2023, 9, 17, 12, 0),
    color: "#43a047",
  },
];

const eventStyleGetter = (event: Evento) => {
  const style = {
    backgroundColor: event.color || "#3788d8",
    color: "white",
    borderRadius: "4px",
    border: "none",
    display: "block",
  };
  return { style };
};

interface RotinaUsuario {
  blocosFixos: {
    id: string;
    nome: string;
    dias: string[];
    horaInicio: string;
    horaFim: string;
    tipo: string;
  }[];
  atividadesRecorrentes: {
    id: string;
    nome: string;
    frequencia: string[];
    duracao: number;
  }[];
  preferenciaEstudo: {
    melhoresHorarios: string[];
    duracaoSessao: number;
    duracaoPausa: number;
  };
}

export default function RotinaInteligente() {
  const [currentTab, setCurrentTab] = useState("visualizar");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rotinaUsuario, setRotinaUsuario] = useState<RotinaUsuario | null>(null);
  const [eventos, setEventos] = useState<Evento[]>(eventosPadrao);
  const [calendarView, setCalendarView] = useState("semana");

  // Carregar dados da rotina do localStorage ao iniciar
  useEffect(() => {
    const rotinaLocalStorage = localStorage.getItem('pontoUserRoutine');
    if (rotinaLocalStorage) {
      try {
        const rotinaParsed = JSON.parse(rotinaLocalStorage);
        setRotinaUsuario(rotinaParsed);

        // Aqui poderíamos converter a rotina em eventos do calendário
        // Implementação futura
      } catch (error) {
        console.error("Erro ao carregar rotina:", error);
      }
    }
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);

    // Recarregar dados do localStorage após fechar o modal (caso tenha sido salvo)
    const rotinaLocalStorage = localStorage.getItem('pontoUserRoutine');
    if (rotinaLocalStorage) {
      try {
        const rotinaParsed = JSON.parse(rotinaLocalStorage);
        setRotinaUsuario(rotinaParsed);
        toast({
          title: "Rotina atualizada",
          description: "Sua rotina foi atualizada com sucesso!",
          variant: "default",
        });
      } catch (error) {
        console.error("Erro ao carregar rotina atualizada:", error);
      }
    }
  };

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      aula: "Aula",
      trabalho: "Trabalho",
      pessoal: "Pessoal",
      estudo: "Estudo",
      lazer: "Lazer",
      outro: "Outro"
    };
    return tipos[tipo] || tipo;
  };

  const getFrequenciaLabel = (freq: string) => {
    const frequencias: Record<string, string> = {
      diariamente: "Diariamente",
      diasUteis: "Dias úteis",
      fimSemana: "Fim de semana",
      diasEspecificos: "Dias específicos"
    };
    return frequencias[freq] || freq;
  };

  const getDiaLabel = (dia: string) => {
    const dias: Record<string, string> = {
      seg: "Seg",
      ter: "Ter",
      qua: "Qua",
      qui: "Qui",
      sex: "Sex",
      sab: "Sáb",
      dom: "Dom"
    };
    return dias[dia] || dia;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#FF6B00]" />
          <h2 className="text-xl font-bold">Rotina Inteligente</h2>
          <Badge variant="outline" className="text-xs bg-[#29335C]/10 text-[#FF6B00] border-[#FF6B00]/20">
            Beta
          </Badge>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-[#FF6B00] border-[#FF6B00]/20"
            onClick={handleOpenModal}
          >
            <Settings className="h-4 w-4 mr-1" />
            Configurar
          </Button>
          <Button size="sm" className="bg-[#FF6B00] text-white hover:bg-[#FF8736]">
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="border-[#29335C]/20 bg-[#121212] shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg text-white">Meu Calendário de Rotina</CardTitle>
                  <CardDescription className="text-slate-400">
                    Visualize seus compromissos e atividades recorrentes
                  </CardDescription>
                </div>
                <Tabs 
                  defaultValue={calendarView} 
                  value={calendarView}
                  onValueChange={setCalendarView}
                  className="w-[300px]"
                >
                  <TabsList className="bg-[#1A1A1A]">
                    <TabsTrigger value="dia">Dia</TabsTrigger>
                    <TabsTrigger value="semana">Semana</TabsTrigger>
                    <TabsTrigger value="mes">Mês</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[600px]">
                <Calendar
                  localizer={localizer}
                  events={eventos}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: "100%" }}
                  views={["day", "week", "month"]}
                  defaultView={
                    calendarView === "dia" ? "day" : 
                    calendarView === "semana" ? "week" : "month"
                  }
                  view={
                    calendarView === "dia" ? "day" : 
                    calendarView === "semana" ? "week" : "month"
                  }
                  eventPropGetter={eventStyleGetter}
                  className="rotina-calendar"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-[#29335C]/20 bg-[#121212] shadow-md h-full">
            <CardHeader>
              <CardTitle className="text-lg text-white">Minha Rotina</CardTitle>
              <CardDescription className="text-slate-400">
                Gerencie seus compromissos fixos e atividades regulares
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="w-full bg-[#1A1A1A]">
                  <TabsTrigger value="visualizar" className="flex-1">
                    Visualizar
                  </TabsTrigger>
                  <TabsTrigger value="adicionar" className="flex-1">
                    Configurar
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="visualizar" className="mt-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-white mb-2">Blocos Fixos</h3>
                    <div className="space-y-2">
                      {rotinaUsuario && rotinaUsuario.blocosFixos.length > 0 ? (
                        rotinaUsuario.blocosFixos.map((bloco) => (
                          <div key={bloco.id} className="p-2 bg-[#1A1A1A] rounded-md border border-[#29335C]/20">
                            <div className="font-medium text-white">{bloco.nome}</div>
                            <div className="text-xs text-slate-400">
                              {bloco.dias.map(dia => getDiaLabel(dia)).join(", ")} • 
                              {bloco.horaInicio} - {bloco.horaFim} • 
                              {getTipoLabel(bloco.tipo)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 bg-[#1A1A1A] rounded-md border border-[#29335C]/20">
                          <div className="font-medium text-white">Aula de Física</div>
                          <div className="text-xs text-slate-400">
                            Seg, Qua • 08:00 - 10:00 • Aula
                          </div>
                        </div>
                      )}
                      {!rotinaUsuario && (
                        <div className="p-2 bg-[#1A1A1A] rounded-md border border-[#29335C]/20">
                          <div className="font-medium text-white">Estudo em Grupo</div>
                          <div className="text-xs text-slate-400">
                            Ter, Qui • 10:00 - 12:00 • Estudo
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-white mb-2">Atividades Recorrentes</h3>
                    <div className="space-y-2">
                      {rotinaUsuario && rotinaUsuario.atividadesRecorrentes.length > 0 ? (
                        rotinaUsuario.atividadesRecorrentes.map((atividade) => (
                          <div key={atividade.id} className="p-2 bg-[#1A1A1A] rounded-md border border-[#29335C]/20">
                            <div className="font-medium text-white">{atividade.nome}</div>
                            <div className="text-xs text-slate-400">
                              {atividade.frequencia.map(f => getFrequenciaLabel(f)).join(", ")} • 
                              {atividade.duracao} minutos
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 bg-[#1A1A1A] rounded-md border border-[#29335C]/20">
                          <div className="font-medium text-white">Almoço</div>
                          <div className="text-xs text-slate-400">
                            Diariamente • 12:00 - 13:00 • 60min
                          </div>
                        </div>
                      )}
                      {!rotinaUsuario && (
                        <div className="p-2 bg-[#1A1A1A] rounded-md border border-[#29335C]/20">
                          <div className="font-medium text-white">Academia</div>
                          <div className="text-xs text-slate-400">
                            Dias úteis • 18:00 - 19:30 • 90min
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {rotinaUsuario && rotinaUsuario.preferenciaEstudo && (
                    <div>
                      <h3 className="text-sm font-medium text-white mb-2">Preferências de Estudo</h3>
                      <div className="p-2 bg-[#1A1A1A] rounded-md border border-[#29335C]/20">
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                          <div>
                            <span className="font-medium text-white">Melhores Horários:</span> 
                            {rotinaUsuario.preferenciaEstudo.melhoresHorarios.length > 0 
                              ? rotinaUsuario.preferenciaEstudo.melhoresHorarios.map(h => 
                                h === 'manha' ? 'Manhã' : 
                                h === 'tarde' ? 'Tarde' : 'Noite'
                              ).join(", ")
                              : "Não definido"}
                          </div>
                          <div>
                            <span className="font-medium text-white">Sessão:</span> 
                            {rotinaUsuario.preferenciaEstudo.duracaoSessao} min
                          </div>
                          <div>
                            <span className="font-medium text-white">Pausa:</span> 
                            {rotinaUsuario.preferenciaEstudo.duracaoPausa} min
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button className="w-full bg-[#29335C] hover:bg-[#374785] text-white">
                      Gerar Sugestão de Rotina
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="adicionar" className="mt-4">
                  <div className="text-center py-8 space-y-4">
                    <div className="rounded-full bg-[#29335C]/20 p-4 inline-flex">
                      <Settings className="h-8 w-8 text-[#FF6B00]" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Configure Sua Rotina</h3>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto">
                      Adicione seus compromissos fixos, atividades recorrentes e preferências para criar uma rotina personalizada.
                    </p>
                    <Button 
                      className="bg-[#FF6B00] text-white hover:bg-[#FF8736]"
                      onClick={handleOpenModal}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Configurar Rotina
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de configuração de rotina */}
      <DescrevaSuaRotinaModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}