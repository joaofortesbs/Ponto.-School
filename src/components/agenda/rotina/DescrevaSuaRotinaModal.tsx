
import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Trash2,
  Edit,
  Plus,
  Calendar,
  Repeat,
  Brain,
  Save,
  X,
} from "lucide-react";

// Interfaces
interface BlocoFixo {
  id: string;
  nome: string;
  diasSemana: string[];
  horarioInicio: string;
  horarioFim: string;
  tipo: string;
}

interface AtividadeRecorrente {
  id: string;
  nome: string;
  frequencia: string[];
  duracao: number;
  unidadeDuracao: "minutos" | "horas";
}

interface PreferenciasEstudo {
  melhoresHorarios: string[];
  duracaoSessao: number;
  duracaoPausa: number;
}

// Componente principal
const DescrevaSuaRotinaModal = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  // Estados para os formulários
  const [activeTab, setActiveTab] = useState("blocos-fixos");
  
  // Estado para bloco fixo atual
  const [blocoFixo, setBlocoFixo] = useState<BlocoFixo>({
    id: "",
    nome: "",
    diasSemana: [],
    horarioInicio: "",
    horarioFim: "",
    tipo: "aula",
  });
  
  // Estado para atividade recorrente atual
  const [atividadeRecorrente, setAtividadeRecorrente] = useState<AtividadeRecorrente>({
    id: "",
    nome: "",
    frequencia: [],
    duracao: 30,
    unidadeDuracao: "minutos",
  });
  
  // Estado para as preferências de estudo
  const [preferenciasEstudo, setPreferenciasEstudo] = useState<PreferenciasEstudo>({
    melhoresHorarios: [],
    duracaoSessao: 60,
    duracaoPausa: 10,
  });
  
  // Estado para a lista de blocos fixos
  const [blocosFixos, setBlocosFixos] = useState<BlocoFixo[]>([]);
  
  // Estado para a lista de atividades recorrentes
  const [atividadesRecorrentes, setAtividadesRecorrentes] = useState<AtividadeRecorrente[]>([]);
  
  // Estado para edição
  const [modoEdicao, setModoEdicao] = useState(false);
  const [idEmEdicao, setIdEmEdicao] = useState("");

  // Manipuladores para blocos fixos
  const handleBlocoFixoChange = (campo: keyof BlocoFixo, valor: any) => {
    setBlocoFixo({ ...blocoFixo, [campo]: valor });
  };

  const handleDiaSemanaChange = (dia: string) => {
    const diasAtuais = [...blocoFixo.diasSemana];
    if (diasAtuais.includes(dia)) {
      handleBlocoFixoChange(
        "diasSemana",
        diasAtuais.filter((d) => d !== dia)
      );
    } else {
      handleBlocoFixoChange("diasSemana", [...diasAtuais, dia]);
    }
  };

  const adicionarBlocoFixo = () => {
    // Validações básicas
    if (
      !blocoFixo.nome ||
      blocoFixo.diasSemana.length === 0 ||
      !blocoFixo.horarioInicio ||
      !blocoFixo.horarioFim
    ) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (blocoFixo.horarioInicio >= blocoFixo.horarioFim) {
      alert("O horário de fim deve ser posterior ao horário de início.");
      return;
    }

    if (modoEdicao) {
      setBlocosFixos(
        blocosFixos.map((bloco) =>
          bloco.id === idEmEdicao ? { ...blocoFixo, id: idEmEdicao } : bloco
        )
      );
      setModoEdicao(false);
      setIdEmEdicao("");
    } else {
      const novoBlocoFixo = {
        ...blocoFixo,
        id: `bloco-${Date.now()}`,
      };
      setBlocosFixos([...blocosFixos, novoBlocoFixo]);
    }

    // Limpar o formulário
    setBlocoFixo({
      id: "",
      nome: "",
      diasSemana: [],
      horarioInicio: "",
      horarioFim: "",
      tipo: "aula",
    });
  };

  const editarBlocoFixo = (id: string) => {
    const blocoParaEditar = blocosFixos.find((bloco) => bloco.id === id);
    if (blocoParaEditar) {
      setBlocoFixo(blocoParaEditar);
      setModoEdicao(true);
      setIdEmEdicao(id);
    }
  };

  const removerBlocoFixo = (id: string) => {
    setBlocosFixos(blocosFixos.filter((bloco) => bloco.id !== id));
  };

  // Manipuladores para atividades recorrentes
  const handleAtividadeRecorrenteChange = (campo: keyof AtividadeRecorrente, valor: any) => {
    setAtividadeRecorrente({ ...atividadeRecorrente, [campo]: valor });
  };

  const handleFrequenciaChange = (frequencia: string) => {
    const frequenciasAtuais = [...atividadeRecorrente.frequencia];
    if (frequenciasAtuais.includes(frequencia)) {
      handleAtividadeRecorrenteChange(
        "frequencia",
        frequenciasAtuais.filter((f) => f !== frequencia)
      );
    } else {
      handleAtividadeRecorrenteChange("frequencia", [...frequenciasAtuais, frequencia]);
    }
  };

  const adicionarAtividadeRecorrente = () => {
    // Validações básicas
    if (
      !atividadeRecorrente.nome ||
      atividadeRecorrente.frequencia.length === 0 ||
      !atividadeRecorrente.duracao
    ) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (modoEdicao) {
      setAtividadesRecorrentes(
        atividadesRecorrentes.map((atividade) =>
          atividade.id === idEmEdicao
            ? { ...atividadeRecorrente, id: idEmEdicao }
            : atividade
        )
      );
      setModoEdicao(false);
      setIdEmEdicao("");
    } else {
      const novaAtividadeRecorrente = {
        ...atividadeRecorrente,
        id: `atividade-${Date.now()}`,
      };
      setAtividadesRecorrentes([...atividadesRecorrentes, novaAtividadeRecorrente]);
    }

    // Limpar o formulário
    setAtividadeRecorrente({
      id: "",
      nome: "",
      frequencia: [],
      duracao: 30,
      unidadeDuracao: "minutos",
    });
  };

  const editarAtividadeRecorrente = (id: string) => {
    const atividadeParaEditar = atividadesRecorrentes.find((atividade) => atividade.id === id);
    if (atividadeParaEditar) {
      setAtividadeRecorrente(atividadeParaEditar);
      setModoEdicao(true);
      setIdEmEdicao(id);
    }
  };

  const removerAtividadeRecorrente = (id: string) => {
    setAtividadesRecorrentes(atividadesRecorrentes.filter((atividade) => atividade.id !== id));
  };

  // Manipuladores para preferências de estudo
  const handleMelhoresHorariosChange = (horario: string) => {
    const horariosAtuais = [...preferenciasEstudo.melhoresHorarios];
    if (horariosAtuais.includes(horario)) {
      setPreferenciasEstudo({
        ...preferenciasEstudo,
        melhoresHorarios: horariosAtuais.filter((h) => h !== horario),
      });
    } else {
      setPreferenciasEstudo({
        ...preferenciasEstudo,
        melhoresHorarios: [...horariosAtuais, horario],
      });
    }
  };

  // Salvar toda a rotina
  const salvarRotina = () => {
    const rotina = {
      blocosFixos,
      atividadesRecorrentes,
      preferenciasEstudo,
      dataAtualizacao: new Date().toISOString(),
    };

    // Salvar no localStorage
    localStorage.setItem("pontoUserRoutine", JSON.stringify(rotina));
    
    // Fechar o modal
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-[#001427] dark:bg-[#1E293B] text-white border-[#29335C]/30">
        <DialogHeader>
          <DialogTitle className="text-xl text-white bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent">
            Configure Sua Rotina Base
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Customize sua rotina semanal para melhorar a organização do seu tempo.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#29335C]/10 dark:bg-[#29335C]/30 grid grid-cols-3 mb-6">
            <TabsTrigger
              value="blocos-fixos"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Blocos Fixos
            </TabsTrigger>
            <TabsTrigger
              value="atividades-recorrentes"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white"
            >
              <Repeat className="h-4 w-4 mr-2" />
              Atividades Recorrentes
            </TabsTrigger>
            <TabsTrigger
              value="preferencias-estudo"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00] data-[state=active]:to-[#FF8C40] data-[state=active]:text-white"
            >
              <Brain className="h-4 w-4 mr-2" />
              Preferências de Estudo
            </TabsTrigger>
          </TabsList>

          {/* Seção 1: Blocos Fixos */}
          <TabsContent value="blocos-fixos" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Clock className="h-5 w-5 mr-2 text-[#FF6B00]" />
                Meus Compromissos Fixos ⏰
              </h3>
              <p className="text-sm text-gray-400">
                Adicione compromissos fixos da sua semana como aulas, trabalho, etc.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome-atividade">Nome da Atividade</Label>
                    <Input
                      id="nome-atividade"
                      placeholder="Ex: Aula de Cálculo I"
                      value={blocoFixo.nome}
                      onChange={(e) => handleBlocoFixoChange("nome", e.target.value)}
                      className="mt-1 bg-[#29335C]/20 border-[#29335C]/30 text-white"
                    />
                  </div>

                  <div>
                    <Label>Dia(s) da Semana</Label>
                    <div className="grid grid-cols-7 gap-2 mt-1">
                      {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
                        <div
                          key={dia}
                          className="flex flex-col items-center space-y-1"
                        >
                          <Checkbox
                            id={`dia-${dia}`}
                            checked={blocoFixo.diasSemana.includes(dia)}
                            onCheckedChange={() => handleDiaSemanaChange(dia)}
                            className="border-[#FF6B00]/50 data-[state=checked]:bg-[#FF6B00] data-[state=checked]:text-white"
                          />
                          <Label
                            htmlFor={`dia-${dia}`}
                            className="text-xs cursor-pointer select-none"
                          >
                            {dia}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="horario-inicio">Horário de Início</Label>
                      <Input
                        id="horario-inicio"
                        type="time"
                        value={blocoFixo.horarioInicio}
                        onChange={(e) => handleBlocoFixoChange("horarioInicio", e.target.value)}
                        className="mt-1 bg-[#29335C]/20 border-[#29335C]/30 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="horario-fim">Horário de Fim</Label>
                      <Input
                        id="horario-fim"
                        type="time"
                        value={blocoFixo.horarioFim}
                        onChange={(e) => handleBlocoFixoChange("horarioFim", e.target.value)}
                        className="mt-1 bg-[#29335C]/20 border-[#29335C]/30 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tipo-bloco">Tipo</Label>
                    <Select
                      value={blocoFixo.tipo}
                      onValueChange={(valor) => handleBlocoFixoChange("tipo", valor)}
                    >
                      <SelectTrigger className="mt-1 bg-[#29335C]/20 border-[#29335C]/30 text-white">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#001427] border-[#29335C]/30">
                        <SelectItem value="aula">Aula</SelectItem>
                        <SelectItem value="trabalho">Trabalho</SelectItem>
                        <SelectItem value="estudo">Estudo</SelectItem>
                        <SelectItem value="pessoal">Pessoal</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={adicionarBlocoFixo}
                    className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {modoEdicao ? "Atualizar Bloco Fixo" : "Adicionar Bloco Fixo"}
                  </Button>
                </div>

                <div className="bg-[#29335C]/20 rounded-lg p-4 space-y-2 max-h-[400px] overflow-y-auto">
                  <h4 className="font-medium text-gray-300 mb-2">Blocos Adicionados</h4>
                  {blocosFixos.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum bloco fixo adicionado
                    </div>
                  ) : (
                    blocosFixos.map((bloco) => (
                      <div
                        key={bloco.id}
                        className="bg-[#29335C]/40 rounded p-3 hover:bg-[#29335C]/60 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-white">{bloco.nome}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {bloco.diasSemana.join(", ")} • {bloco.horarioInicio} - {bloco.horarioFim}
                            </div>
                            <div className="text-xs text-[#FF6B00] mt-1 capitalize">
                              {bloco.tipo}
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => editarBlocoFixo(bloco.id)}
                              className="h-7 w-7 text-gray-400 hover:text-white hover:bg-[#29335C]"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removerBlocoFixo(bloco.id)}
                              className="h-7 w-7 text-gray-400 hover:text-white hover:bg-[#29335C]"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Seção 2: Atividades Recorrentes */}
          <TabsContent value="atividades-recorrentes" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Repeat className="h-5 w-5 mr-2 text-[#FF6B00]" />
                Minhas Atividades Regulares 🔁
              </h3>
              <p className="text-sm text-gray-400">
                Adicione atividades que ocorrem regularmente, como refeições, academia, etc.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome-atividade-recorrente">Nome da Atividade</Label>
                    <Input
                      id="nome-atividade-recorrente"
                      placeholder="Ex: Almoço, Academia"
                      value={atividadeRecorrente.nome}
                      onChange={(e) =>
                        handleAtividadeRecorrenteChange("nome", e.target.value)
                      }
                      className="mt-1 bg-[#29335C]/20 border-[#29335C]/30 text-white"
                    />
                  </div>

                  <div>
                    <Label>Frequência</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        "Diariamente",
                        "Dias úteis",
                        "Fim de semana",
                        "Dias específicos",
                      ].map((freq) => (
                        <div
                          key={freq}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`freq-${freq}`}
                            checked={atividadeRecorrente.frequencia.includes(freq)}
                            onCheckedChange={() => handleFrequenciaChange(freq)}
                            className="border-[#FF6B00]/50 data-[state=checked]:bg-[#FF6B00] data-[state=checked]:text-white"
                          />
                          <Label
                            htmlFor={`freq-${freq}`}
                            className="text-sm cursor-pointer"
                          >
                            {freq}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-end">
                    <div>
                      <Label htmlFor="duracao">Duração Estimada</Label>
                      <Input
                        id="duracao"
                        type="number"
                        min="5"
                        max="600"
                        value={atividadeRecorrente.duracao}
                        onChange={(e) =>
                          handleAtividadeRecorrenteChange(
                            "duracao",
                            parseInt(e.target.value) || 30
                          )
                        }
                        className="mt-1 bg-[#29335C]/20 border-[#29335C]/30 text-white"
                      />
                    </div>
                    <div>
                      <Select
                        value={atividadeRecorrente.unidadeDuracao}
                        onValueChange={(valor: "minutos" | "horas") =>
                          handleAtividadeRecorrenteChange("unidadeDuracao", valor)
                        }
                      >
                        <SelectTrigger className="bg-[#29335C]/20 border-[#29335C]/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#001427] border-[#29335C]/30">
                          <SelectItem value="minutos">Minutos</SelectItem>
                          <SelectItem value="horas">Horas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={adicionarAtividadeRecorrente}
                    className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {modoEdicao
                      ? "Atualizar Atividade"
                      : "Adicionar Atividade Recorrente"}
                  </Button>
                </div>

                <div className="bg-[#29335C]/20 rounded-lg p-4 space-y-2 max-h-[400px] overflow-y-auto">
                  <h4 className="font-medium text-gray-300 mb-2">Atividades Adicionadas</h4>
                  {atividadesRecorrentes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma atividade recorrente adicionada
                    </div>
                  ) : (
                    atividadesRecorrentes.map((atividade) => (
                      <div
                        key={atividade.id}
                        className="bg-[#29335C]/40 rounded p-3 hover:bg-[#29335C]/60 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-white">
                              {atividade.nome}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {atividade.frequencia.join(", ")}
                            </div>
                            <div className="text-xs text-[#FF6B00] mt-1">
                              {atividade.duracao}{" "}
                              {atividade.unidadeDuracao}
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                editarAtividadeRecorrente(atividade.id)
                              }
                              className="h-7 w-7 text-gray-400 hover:text-white hover:bg-[#29335C]"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                removerAtividadeRecorrente(atividade.id)
                              }
                              className="h-7 w-7 text-gray-400 hover:text-white hover:bg-[#29335C]"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Seção 3: Preferências de Estudo */}
          <TabsContent value="preferencias-estudo" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Brain className="h-5 w-5 mr-2 text-[#FF6B00]" />
                Meu Estilo de Estudo 🤓
              </h3>
              <p className="text-sm text-gray-400">
                Configure suas preferências de estudo para otimizar seu aprendizado.
              </p>

              <div className="bg-[#29335C]/20 rounded-lg p-6 space-y-6">
                <div>
                  <Label className="text-base">Melhores Horários para Focar</Label>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {["Manhã", "Tarde", "Noite"].map((horario) => (
                      <div
                        key={horario}
                        className="flex items-center space-x-2 bg-[#29335C]/30 p-3 rounded-md hover:bg-[#29335C]/40 transition-colors"
                      >
                        <Checkbox
                          id={`horario-${horario}`}
                          checked={preferenciasEstudo.melhoresHorarios.includes(horario)}
                          onCheckedChange={() =>
                            handleMelhoresHorariosChange(horario)
                          }
                          className="border-[#FF6B00]/50 data-[state=checked]:bg-[#FF6B00] data-[state=checked]:text-white"
                        />
                        <Label
                          htmlFor={`horario-${horario}`}
                          className="cursor-pointer w-full"
                        >
                          {horario}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="duracao-sessao" className="text-base">
                    Duração Ideal da Sessão de Estudo
                  </Label>
                  <Select
                    value={preferenciasEstudo.duracaoSessao.toString()}
                    onValueChange={(valor) =>
                      setPreferenciasEstudo({
                        ...preferenciasEstudo,
                        duracaoSessao: parseInt(valor),
                      })
                    }
                  >
                    <SelectTrigger
                      id="duracao-sessao"
                      className="mt-2 bg-[#29335C]/30 border-[#29335C]/30 text-white"
                    >
                      <SelectValue placeholder="Selecione a duração" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#001427] border-[#29335C]/30">
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">60 minutos (1 hora)</SelectItem>
                      <SelectItem value="90">90 minutos (1.5 horas)</SelectItem>
                      <SelectItem value="120">120 minutos (2 horas)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duracao-pausa" className="text-base">
                    Duração Ideal da Pausa
                  </Label>
                  <Select
                    value={preferenciasEstudo.duracaoPausa.toString()}
                    onValueChange={(valor) =>
                      setPreferenciasEstudo({
                        ...preferenciasEstudo,
                        duracaoPausa: parseInt(valor),
                      })
                    }
                  >
                    <SelectTrigger
                      id="duracao-pausa"
                      className="mt-2 bg-[#29335C]/30 border-[#29335C]/30 text-white"
                    >
                      <SelectValue placeholder="Selecione a duração" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#001427] border-[#29335C]/30">
                      <SelectItem value="5">5 minutos</SelectItem>
                      <SelectItem value="10">10 minutos</SelectItem>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="20">20 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between border-t border-[#29335C]/30 pt-4 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#29335C] hover:bg-[#29335C]/20 text-white"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={salvarRotina}
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Rotina
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DescrevaSuaRotinaModal;
