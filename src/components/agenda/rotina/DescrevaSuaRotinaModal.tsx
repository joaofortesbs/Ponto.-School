
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { X, Clock, Calendar, Repeat, Book, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface DescrevaSuaRotinaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BlocoFixo {
  id: string;
  nome: string;
  dias: string[];
  horaInicio: string;
  horaFim: string;
  tipo: string;
}

interface AtividadeRecorrente {
  id: string;
  nome: string;
  frequencia: string[];
  duracao: number;
}

const diasSemana = [
  { value: "seg", label: "Segunda" },
  { value: "ter", label: "Terça" },
  { value: "qua", label: "Quarta" },
  { value: "qui", label: "Quinta" },
  { value: "sex", label: "Sexta" },
  { value: "sab", label: "Sábado" },
  { value: "dom", label: "Domingo" },
];

const frequencias = [
  { value: "diariamente", label: "Diariamente" },
  { value: "diasUteis", label: "Dias úteis" },
  { value: "fimSemana", label: "Fim de semana" },
  { value: "diasEspecificos", label: "Dias específicos" },
];

const tiposAtividade = [
  { value: "aula", label: "Aula" },
  { value: "trabalho", label: "Trabalho" },
  { value: "pessoal", label: "Pessoal" },
  { value: "estudo", label: "Estudo" },
  { value: "lazer", label: "Lazer" },
  { value: "outro", label: "Outro" },
];

const horariosEstudo = [
  { value: "manha", label: "Manhã" },
  { value: "tarde", label: "Tarde" },
  { value: "noite", label: "Noite" },
];

export default function DescrevaSuaRotinaModal({ isOpen, onClose }: DescrevaSuaRotinaModalProps) {
  // Estado para blocos fixos
  const [blocoFixo, setBlocoFixo] = useState<Omit<BlocoFixo, "id">>({
    nome: "",
    dias: [],
    horaInicio: "",
    horaFim: "",
    tipo: "aula",
  });
  
  const [blocosFixos, setBlocosFixos] = useState<BlocoFixo[]>([]);
  const [editandoBlocoId, setEditandoBlocoId] = useState<string | null>(null);

  // Estado para atividades recorrentes
  const [atividadeRecorrente, setAtividadeRecorrente] = useState<Omit<AtividadeRecorrente, "id">>({
    nome: "",
    frequencia: [],
    duracao: 60,
  });
  
  const [atividadesRecorrentes, setAtividadesRecorrentes] = useState<AtividadeRecorrente[]>([]);
  const [editandoAtividadeId, setEditandoAtividadeId] = useState<string | null>(null);

  // Estado para preferências de estudo
  const [preferenciaEstudo, setPreferenciaEstudo] = useState({
    melhoresHorarios: [] as string[],
    duracaoSessao: 60,
    duracaoPausa: 10,
  });

  // Manipulação de blocos fixos
  const adicionarOuAtualizarBloco = () => {
    if (!blocoFixo.nome || blocoFixo.dias.length === 0 || !blocoFixo.horaInicio || !blocoFixo.horaFim) {
      toast({
        title: "Campos incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (blocoFixo.horaInicio >= blocoFixo.horaFim) {
      toast({
        title: "Horário inválido",
        description: "O horário de fim deve ser posterior ao horário de início.",
        variant: "destructive",
      });
      return;
    }

    if (editandoBlocoId) {
      setBlocosFixos(blocosFixos.map(b => 
        b.id === editandoBlocoId ? { ...blocoFixo, id: editandoBlocoId } : b
      ));
      setEditandoBlocoId(null);
    } else {
      setBlocosFixos([...blocosFixos, { ...blocoFixo, id: Date.now().toString() }]);
    }

    // Limpar formulário
    setBlocoFixo({
      nome: "",
      dias: [],
      horaInicio: "",
      horaFim: "",
      tipo: "aula",
    });
  };

  const editarBloco = (id: string) => {
    const bloco = blocosFixos.find(b => b.id === id);
    if (bloco) {
      setBlocoFixo({
        nome: bloco.nome,
        dias: bloco.dias,
        horaInicio: bloco.horaInicio,
        horaFim: bloco.horaFim,
        tipo: bloco.tipo,
      });
      setEditandoBlocoId(id);
    }
  };

  const removerBloco = (id: string) => {
    setBlocosFixos(blocosFixos.filter(b => b.id !== id));
    if (editandoBlocoId === id) {
      setEditandoBlocoId(null);
      setBlocoFixo({
        nome: "",
        dias: [],
        horaInicio: "",
        horaFim: "",
        tipo: "aula",
      });
    }
  };

  // Manipulação de atividades recorrentes
  const adicionarOuAtualizarAtividade = () => {
    if (!atividadeRecorrente.nome || atividadeRecorrente.frequencia.length === 0) {
      toast({
        title: "Campos incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (editandoAtividadeId) {
      setAtividadesRecorrentes(atividadesRecorrentes.map(a => 
        a.id === editandoAtividadeId ? { ...atividadeRecorrente, id: editandoAtividadeId } : a
      ));
      setEditandoAtividadeId(null);
    } else {
      setAtividadesRecorrentes([...atividadesRecorrentes, { ...atividadeRecorrente, id: Date.now().toString() }]);
    }

    // Limpar formulário
    setAtividadeRecorrente({
      nome: "",
      frequencia: [],
      duracao: 60,
    });
  };

  const editarAtividade = (id: string) => {
    const atividade = atividadesRecorrentes.find(a => a.id === id);
    if (atividade) {
      setAtividadeRecorrente({
        nome: atividade.nome,
        frequencia: atividade.frequencia,
        duracao: atividade.duracao,
      });
      setEditandoAtividadeId(id);
    }
  };

  const removerAtividade = (id: string) => {
    setAtividadesRecorrentes(atividadesRecorrentes.filter(a => a.id !== id));
    if (editandoAtividadeId === id) {
      setEditandoAtividadeId(null);
      setAtividadeRecorrente({
        nome: "",
        frequencia: [],
        duracao: 60,
      });
    }
  };

  // Salvar rotina
  const salvarRotina = () => {
    const rotina = {
      blocosFixos,
      atividadesRecorrentes,
      preferenciaEstudo,
    };
    
    localStorage.setItem('pontoUserRoutine', JSON.stringify(rotina));
    
    toast({
      title: "Rotina salva com sucesso!",
      description: "Suas preferências foram armazenadas.",
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#121212] text-white border border-[#29335C]/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center">
            <Calendar className="mr-2 h-6 w-6 text-[#FF6B00]" />
            Configure Sua Rotina Base
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Descreva seus compromissos e preferências para criar uma rotina personalizada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* Seção 1: Blocos Fixos */}
          <div className="border border-[#29335C]/30 rounded-lg p-4 bg-[#1A1A1A]">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Clock className="mr-2 h-5 w-5 text-[#FF6B00]" />
              Meus Compromissos Fixos ⏰
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome-bloco" className="text-white">Nome da Atividade</Label>
                <Input
                  id="nome-bloco"
                  value={blocoFixo.nome}
                  onChange={(e) => setBlocoFixo({ ...blocoFixo, nome: e.target.value })}
                  placeholder="Ex: Aula de Cálculo I"
                  className="bg-[#242424] border-[#29335C]/50 text-white"
                />
              </div>

              <div>
                <Label className="text-white mb-2 block">Dia(s) da Semana</Label>
                <div className="flex flex-wrap gap-2">
                  {diasSemana.map((dia) => (
                    <div key={dia.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dia-${dia.value}`}
                        checked={blocoFixo.dias.includes(dia.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setBlocoFixo({ ...blocoFixo, dias: [...blocoFixo.dias, dia.value] });
                          } else {
                            setBlocoFixo({ ...blocoFixo, dias: blocoFixo.dias.filter(d => d !== dia.value) });
                          }
                        }}
                      />
                      <Label htmlFor={`dia-${dia.value}`} className="text-sm text-white">
                        {dia.label.substring(0, 3)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="hora-inicio" className="text-white">Horário de Início</Label>
                <Input
                  id="hora-inicio"
                  type="time"
                  value={blocoFixo.horaInicio}
                  onChange={(e) => setBlocoFixo({ ...blocoFixo, horaInicio: e.target.value })}
                  className="bg-[#242424] border-[#29335C]/50 text-white"
                />
              </div>

              <div>
                <Label htmlFor="hora-fim" className="text-white">Horário de Fim</Label>
                <Input
                  id="hora-fim"
                  type="time"
                  value={blocoFixo.horaFim}
                  onChange={(e) => setBlocoFixo({ ...blocoFixo, horaFim: e.target.value })}
                  className="bg-[#242424] border-[#29335C]/50 text-white"
                />
              </div>

              <div>
                <Label htmlFor="tipo-atividade" className="text-white">Tipo</Label>
                <Select
                  value={blocoFixo.tipo}
                  onValueChange={(value) => setBlocoFixo({ ...blocoFixo, tipo: value })}
                >
                  <SelectTrigger className="bg-[#242424] border-[#29335C]/50 text-white">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E1E1E] border-[#29335C]/50 text-white">
                    {tiposAtividade.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={adicionarOuAtualizarBloco}
                  className="bg-[#29335C] hover:bg-[#374785] text-white"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  {editandoBlocoId ? "Atualizar Bloco" : "Adicionar Bloco Fixo"}
                </Button>
              </div>
            </div>

            {/* Lista de blocos fixos */}
            {blocosFixos.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2 text-slate-300">Blocos adicionados:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 pb-2">
                  {blocosFixos.map((bloco) => (
                    <div 
                      key={bloco.id} 
                      className="bg-[#242424] p-3 rounded flex justify-between items-center border border-[#29335C]/20"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-white">{bloco.nome}</div>
                        <div className="text-xs text-slate-400">
                          {bloco.dias.map(d => diasSemana.find(dia => dia.value === d)?.label.substring(0, 3)).join(", ")} • 
                          {bloco.horaInicio} - {bloco.horaFim} • 
                          {tiposAtividade.find(t => t.value === bloco.tipo)?.label}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => editarBloco(bloco.id)}
                          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#29335C]/30"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removerBloco(bloco.id)}
                          className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Seção 2: Atividades Recorrentes */}
          <div className="border border-[#29335C]/30 rounded-lg p-4 bg-[#1A1A1A]">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Repeat className="mr-2 h-5 w-5 text-[#FF6B00]" />
              Minhas Atividades Regulares 🔁
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome-atividade" className="text-white">Nome da Atividade</Label>
                <Input
                  id="nome-atividade"
                  value={atividadeRecorrente.nome}
                  onChange={(e) => setAtividadeRecorrente({ ...atividadeRecorrente, nome: e.target.value })}
                  placeholder="Ex: Almoço, Academia"
                  className="bg-[#242424] border-[#29335C]/50 text-white"
                />
              </div>

              <div>
                <Label className="text-white mb-2 block">Frequência</Label>
                <div className="flex flex-wrap gap-2">
                  {frequencias.map((freq) => (
                    <div key={freq.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`freq-${freq.value}`}
                        checked={atividadeRecorrente.frequencia.includes(freq.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAtividadeRecorrente({ ...atividadeRecorrente, frequencia: [...atividadeRecorrente.frequencia, freq.value] });
                          } else {
                            setAtividadeRecorrente({ ...atividadeRecorrente, frequencia: atividadeRecorrente.frequencia.filter(f => f !== freq.value) });
                          }
                        }}
                      />
                      <Label htmlFor={`freq-${freq.value}`} className="text-sm text-white">
                        {freq.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-white mb-2 block">Duração Estimada (minutos)</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[atividadeRecorrente.duracao]}
                    min={15}
                    max={180}
                    step={15}
                    onValueChange={(value) => setAtividadeRecorrente({ ...atividadeRecorrente, duracao: value[0] })}
                    className="flex-1"
                  />
                  <span className="text-white w-12 text-center">{atividadeRecorrente.duracao}min</span>
                </div>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={adicionarOuAtualizarAtividade}
                  className="bg-[#29335C] hover:bg-[#374785] text-white"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  {editandoAtividadeId ? "Atualizar Atividade" : "Adicionar Atividade"}
                </Button>
              </div>
            </div>

            {/* Lista de atividades recorrentes */}
            {atividadesRecorrentes.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2 text-slate-300">Atividades adicionadas:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 pb-2">
                  {atividadesRecorrentes.map((atividade) => (
                    <div 
                      key={atividade.id} 
                      className="bg-[#242424] p-3 rounded flex justify-between items-center border border-[#29335C]/20"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-white">{atividade.nome}</div>
                        <div className="text-xs text-slate-400">
                          {atividade.frequencia.map(f => frequencias.find(freq => freq.value === f)?.label).join(", ")} • 
                          {atividade.duracao} minutos
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => editarAtividade(atividade.id)}
                          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#29335C]/30"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removerAtividade(atividade.id)}
                          className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Seção 3: Preferências de Estudo */}
          <div className="border border-[#29335C]/30 rounded-lg p-4 bg-[#1A1A1A]">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Book className="mr-2 h-5 w-5 text-[#FF6B00]" />
              Meu Estilo de Estudo 🤓
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-white mb-2 block">Melhores Horários para Focar</Label>
                <div className="flex flex-wrap gap-3">
                  {horariosEstudo.map((horario) => (
                    <div key={horario.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`horario-${horario.value}`}
                        checked={preferenciaEstudo.melhoresHorarios.includes(horario.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferenciaEstudo({ 
                              ...preferenciaEstudo, 
                              melhoresHorarios: [...preferenciaEstudo.melhoresHorarios, horario.value] 
                            });
                          } else {
                            setPreferenciaEstudo({ 
                              ...preferenciaEstudo, 
                              melhoresHorarios: preferenciaEstudo.melhoresHorarios.filter(h => h !== horario.value) 
                            });
                          }
                        }}
                      />
                      <Label htmlFor={`horario-${horario.value}`} className="text-sm text-white">
                        {horario.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-white mb-2 block">
                  Duração Ideal da Sessão de Estudo: {preferenciaEstudo.duracaoSessao} minutos
                </Label>
                <Slider
                  value={[preferenciaEstudo.duracaoSessao]}
                  min={30}
                  max={120}
                  step={15}
                  onValueChange={(value) => setPreferenciaEstudo({ ...preferenciaEstudo, duracaoSessao: value[0] })}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>30min</span>
                  <span>60min</span>
                  <span>90min</span>
                  <span>120min</span>
                </div>
              </div>

              <div>
                <Label className="text-white mb-2 block">
                  Duração Ideal da Pausa: {preferenciaEstudo.duracaoPausa} minutos
                </Label>
                <Slider
                  value={[preferenciaEstudo.duracaoPausa]}
                  min={5}
                  max={30}
                  step={5}
                  onValueChange={(value) => setPreferenciaEstudo({ ...preferenciaEstudo, duracaoPausa: value[0] })}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>5min</span>
                  <span>15min</span>
                  <span>30min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Cancelar
          </Button>
          <Button 
            onClick={salvarRotina}
            className="bg-[#FF6B00] hover:bg-[#FF8736] text-white"
          >
            Salvar Rotina
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
