import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users2,
  Upload,
  Calendar,
  Clock,
  Users,
  Info,
  Save,
  Trash2,
  BookOpen,
  GraduationCap,
  Globe,
  Lock,
  Sparkles,
  UserPlus,
  Search,
  Check,
  HelpCircle,
  MessageCircle,
  Video,
  FileText,
  Rocket,
  Zap,
  Target,
  Award,
  Plus,
  CheckSquare,
  Presentation,
  Share2,
} from "lucide-react";
import { createGrupoEstudo } from "@/services/databaseService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

// Dados de exemplo para usuários que podem ser convidados
const usuariosDisponiveis = [
  {
    id: "u1",
    nome: "Ana Silva",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
    email: "ana.silva@email.com",
    curso: "Engenharia",
  },
  {
    id: "u2",
    nome: "Pedro Oliveira",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro",
    email: "pedro.oliveira@email.com",
    curso: "Matemática",
  },
  {
    id: "u3",
    nome: "Mariana Santos",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana",
    email: "mariana.santos@email.com",
    curso: "Física",
  },
  {
    id: "u4",
    nome: "João Costa",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
    email: "joao.costa@email.com",
    curso: "Computação",
  },
  {
    id: "u5",
    nome: "Carla Mendes",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carla",
    email: "carla.mendes@email.com",
    curso: "Biologia",
  },
];

// Tipos de grupos disponíveis
const tiposGrupo = [
  {
    id: "estudo",
    nome: "Grupo de Estudos",
    icone: <BookOpen className="h-5 w-5 text-[#FF6B00]" />,
  },
  {
    id: "projeto",
    nome: "Projeto Colaborativo",
    icone: <Rocket className="h-5 w-5 text-[#FF6B00]" />,
  },
  {
    id: "discussao",
    nome: "Grupo de Discussão",
    icone: <MessageCircle className="h-5 w-5 text-[#FF6B00]" />,
  },
  {
    id: "monitoria",
    nome: "Monitoria",
    icone: <GraduationCap className="h-5 w-5 text-[#FF6B00]" />,
  },
  {
    id: "revisao",
    nome: "Grupo de Revisão",
    icone: <FileText className="h-5 w-5 text-[#FF6B00]" />,
  },
];

// Atividades sugeridas para o grupo
const atividadesSugeridas = [
  {
    id: "a1",
    nome: "Sessões de estudo semanais",
    icone: <Calendar className="h-4 w-4 text-[#FF6B00]" />,
  },
  {
    id: "a2",
    nome: "Resolução de exercícios em grupo",
    icone: <CheckSquare className="h-4 w-4 text-[#FF6B00]" />,
  },
  {
    id: "a3",
    nome: "Discussões temáticas",
    icone: <MessageCircle className="h-4 w-4 text-[#FF6B00]" />,
  },
  {
    id: "a4",
    nome: "Apresentações de tópicos",
    icone: <Presentation className="h-4 w-4 text-[#FF6B00]" />,
  },
  {
    id: "a5",
    nome: "Revisão pré-prova",
    icone: <FileText className="h-4 w-4 text-[#FF6B00]" />,
  },
  {
    id: "a6",
    nome: "Compartilhamento de materiais",
    icone: <Share2 className="h-4 w-4 text-[#FF6B00]" />,
  },
];

interface CreateGroupFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

const CreateGroupForm: React.FC<CreateGroupFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    nome: "",
    disciplina: "",
    topico: "",
    nivel: "Intermediário",
    descricao: "",
    dataInicio: "",
    horarios: "",
    imagem: null,
    privacidade: "publico",
    maxMembros: "10",
    tags: "",
    tipoGrupo: "estudo",
    atividades: [],
    convidados: [],
    objetivos: "",
    frequencia: "semanal",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const randomImageUrls = [
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&q=80",
    "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&q=80",
    "https://images.unsplash.com/photo-1503428593586-e225b39bddfe?w=800&q=80",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, imagem: e.target.files?.[0] || null }));
    }
  };

  const handleAtividadeToggle = (atividadeId: string) => {
    setFormData((prev) => {
      const atividades = [...prev.atividades];
      if (atividades.includes(atividadeId)) {
        return {
          ...prev,
          atividades: atividades.filter((id) => id !== atividadeId),
        };
      } else {
        return { ...prev, atividades: [...atividades, atividadeId] };
      }
    });
  };

  const handleConvidarUsuario = (userId: string) => {
    setFormData((prev) => {
      if (prev.convidados.includes(userId)) {
        return prev;
      }
      return { ...prev, convidados: [...prev.convidados, userId] };
    });
  };

  const handleRemoverConvidado = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      convidados: prev.convidados.filter((id) => id !== userId),
    }));
  };

  const filteredUsuarios = usuariosDisponiveis.filter(
    (usuario) =>
      usuario.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      usuario.curso.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const convidadosInfo = formData.convidados
    .map((id) => usuariosDisponiveis.find((user) => user.id === id))
    .filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !user.id) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um grupo de estudos.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Criar objeto de grupo de estudo
      const grupoData = {
        userId: user.id,
        nome: formData.nome,
        topico: formData.topico,
        disciplina: formData.disciplina,
        descricao: formData.descricao,
        membros: Math.floor(Math.random() * 15) + 3, // Número aleatório entre 3 e 18
        proximaReuniao: getFormattedFutureDate(), // Data próxima futura
        progresso: Math.floor(Math.random() * 100), // Progresso aleatório
        nivel: formData.nivel,
        imagem: randomImageUrls[Math.floor(Math.random() * randomImageUrls.length)],
        tags: [formData.topico.toLowerCase(), formData.disciplina.toLowerCase(), formData.nivel.toLowerCase()],
        dataInicio: new Date().toLocaleDateString('pt-BR'),
      };

      // Salvar no banco de dados
      const resultado = await createGrupoEstudo(grupoData);

      if (resultado) {
        toast({
          title: "Sucesso",
          description: "Grupo de estudos criado com sucesso!",
        });
        onSubmit(resultado);
      } else {
        toast({
          title: "Erro",
          description: "Erro ao criar grupo de estudos. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao criar grupo:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o grupo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTipoGrupoInfo = () => {
    return (
      tiposGrupo.find((tipo) => tipo.id === formData.tipoGrupo) || tiposGrupo[0]
    );
  };

  // Função para gerar uma data futura formatada (DD/MM, HH:MM)
  const getFormattedFutureDate = () => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + Math.floor(Math.random() * 14) + 1); // 1-14 dias no futuro

    const day = futureDate.getDate().toString().padStart(2, '0');
    const month = (futureDate.getMonth() + 1).toString().padStart(2, '0');
    const hours = (Math.floor(Math.random() * 12) + 8).toString().padStart(2, '0'); // Horário entre 8h e 20h
    const minutes = ['00', '15', '30', '45'][Math.floor(Math.random() * 4)]; // Minutos em intervalos de 15

    return `${day}/${month}, ${hours}:${minutes}`;
  };

  const [activeTab, setActiveTab] = useState("informacoes");

  return (
    <Card className="max-w-4xl mx-auto border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-[#FF6B00]/5 to-[#FF8C40]/5 dark:from-[#FF6B00]/10 dark:to-[#FF8C40]/10 border-b border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
        <CardTitle className="flex items-center gap-2">
          <Users2 className="h-5 w-5 text-[#FF6B00]" />
          Novo Grupo de Estudo
        </CardTitle>
        <CardDescription>
          Preencha os detalhes do seu novo grupo. Você poderá editá-los
          posteriormente.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid grid-cols-4 gap-4 bg-transparent">
              <TabsTrigger
                value="informacoes"
                className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] data-[state=active]:border-[#FF6B00] border rounded-lg px-4 py-2 font-montserrat transition-all duration-300 hover:bg-[#FF6B00]/5"
              >
                <Info className="h-4 w-4 mr-2" />
                Informações Básicas
              </TabsTrigger>
              <TabsTrigger
                value="configuracoes"
                className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] data-[state=active]:border-[#FF6B00] border rounded-lg px-4 py-2 font-montserrat transition-all duration-300 hover:bg-[#FF6B00]/5"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Configurações
              </TabsTrigger>
              <TabsTrigger
                value="participantes"
                className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] data-[state=active]:border-[#FF6B00] border rounded-lg px-4 py-2 font-montserrat transition-all duration-300 hover:bg-[#FF6B00]/5"
              >
                <Users className="h-4 w-4 mr-2" />
                Participantes
              </TabsTrigger>
              <TabsTrigger
                value="imagem"
                className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] data-[state=active]:border-[#FF6B00] border rounded-lg px-4 py-2 font-montserrat transition-all duration-300 hover:bg-[#FF6B00]/5"
              >
                <Upload className="h-4 w-4 mr-2" />
                Imagem do Grupo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="informacoes" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="flex items-center gap-1">
                    Nome do Grupo *
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[200px] text-xs">
                            Escolha um nome descritivo para seu grupo de estudos
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Ex: Grupo de Estudos de Cálculo"
                    required
                    className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipoGrupo">Tipo de Grupo *</Label>
                  <Select
                    value={formData.tipoGrupo}
                    onValueChange={(value) =>
                      handleSelectChange("tipoGrupo", value)
                    }
                  >
                    <SelectTrigger className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30">
                      <SelectValue placeholder="Selecione o tipo de grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposGrupo.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id}>
                          <div className="flex items-center gap-2">
                            {tipo.icone}
                            <span>{tipo.nome}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="disciplina">Disciplina/Área *</Label>
                  <Input
                    id="disciplina"
                    name="disciplina"
                    value={formData.disciplina}
                    onChange={handleInputChange}
                    placeholder="Ex: Matemática"
                    required
                    className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topico">Tópico Específico</Label>
                  <Input
                    id="topico"
                    name="topico"
                    value={formData.topico}
                    onChange={handleInputChange}
                    placeholder="Ex: Álgebra Linear"
                    required
                    className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="Ex: cálculo, matemática, integrais"
                    className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição do Grupo</Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  placeholder="Descreva o objetivo do grupo, temas de estudo, etc..."
                  className="min-h-[120px] border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objetivos">Objetivos do Grupo</Label>
                <Textarea
                  id="objetivos"
                  name="objetivos"
                  value={formData.objetivos}
                  onChange={handleInputChange}
                  placeholder="Quais são os principais objetivos deste grupo de estudos?"
                  className="min-h-[80px] border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                />
              </div>

              <div className="space-y-3">
                <Label>Atividades Sugeridas</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {atividadesSugeridas.map((atividade) => (
                    <div
                      key={atividade.id}
                      className="flex items-start space-x-2"
                    >
                      <Checkbox
                        id={`atividade-${atividade.id}`}
                        checked={formData.atividades.includes(atividade.id)}
                        onCheckedChange={() =>
                          handleAtividadeToggle(atividade.id)
                        }
                        className="border-[#FF6B00]/50 data-[state=checked]:bg-[#FF6B00] data-[state=checked]:text-white mt-0.5"
                      />
                      <Label
                        htmlFor={`atividade-${atividade.id}`}
                        className="text-sm font-normal flex items-center gap-1.5 cursor-pointer"
                      >
                        {atividade.icone}
                        {atividade.nome}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="configuracoes" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Data de Início *</Label>
                  <Input
                    id="dataInicio"
                    name="dataInicio"
                    type="date"
                    value={formData.dataInicio}
                    onChange={handleInputChange}
                    required
                    className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                  />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="nivel">Nível de Dificuldade</Label>
                  <Select
                    name="nivel"
                    value={formData.nivel}
                    onValueChange={(value) => handleSelectChange("nivel", value)}
                  >
                    <SelectTrigger className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30" id="nivel">
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Básico">Básico</SelectItem>
                      <SelectItem value="Intermediário">Intermediário</SelectItem>
                      <SelectItem value="Avançado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequencia">Frequência de Encontros</Label>
                  <Select
                    value={formData.frequencia}
                    onValueChange={(value) =>
                      handleSelectChange("frequencia", value)
                    }
                  >
                    <SelectTrigger className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30">
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diario">Diário</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="quinzenal">Quinzenal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="flexivel">Flexível</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="horarios">Horários dos Encontros</Label>
                <Input
                  id="horarios"
                  name="horarios"
                  value={formData.horarios}
                  onChange={handleInputChange}
                  placeholder="Ex: Segundas, 18:00 - 19:30"
                  className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="privacidade">Privacidade do Grupo *</Label>
                  <Select
                    value={formData.privacidade}
                    onValueChange={(value) =>
                      handleSelectChange("privacidade", value)
                    }
                  >
                    <SelectTrigger className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30">
                      <SelectValue placeholder="Selecione a privacidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publico">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-[#FF6B00]" />
                          <span>
                            Público (qualquer um pode ver e solicitar
                            participação)
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="restrito">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#FF6B00]" />
                          <span>Restrito (visível, mas requer aprovação)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="privado">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-[#FF6B00]" />
                          <span>Privado (apenas por convite)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxMembros">Número Máximo de Membros</Label>
                  <Select
                    value={formData.maxMembros}
                    onValueChange={(value) =>
                      handleSelectChange("maxMembros", value)
                    }
                  >
                    <SelectTrigger className="border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30">
                      <SelectValue placeholder="Selecione o limite" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 membros</SelectItem>
                      <SelectItem value="10">10 membros</SelectItem>
                      <SelectItem value="15">15 membros</SelectItem>
                      <SelectItem value="20">20 membros</SelectItem>
                      <SelectItem value="30">30 membros</SelectItem>
                      <SelectItem value="50">50 membros</SelectItem>
                      <SelectItem value="ilimitado">Ilimitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-lg border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#FF6B00]" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Permitir sugestões do Mentor IA
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      O Mentor IA pode sugerir materiais e atividades para o
                      grupo
                    </p>
                  </div>
                </div>
                <Switch
                  checked={true}
                  className="data-[state=checked]:bg-[#FF6B00] data-[state=checked]:text-white"
                />
              </div>
            </TabsContent>

            <TabsContent value="participantes" className="space-y-6">
              <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-lg p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="h-5 w-5 text-[#FF6B00]" />
                  <h3 className="text-base font-medium text-gray-900 dark:text-white">
                    Convidar Participantes
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Convide colegas para participar do seu grupo de estudos. Eles
                  receberão uma notificação e poderão aceitar ou recusar o
                  convite.
                </p>

                <div className="relative mb-4">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Search className="h-4 w-4" />
                  </div>
                  <Input
                    placeholder="Buscar por nome, email ou curso..."
                    className="pl-9 border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 mb-4">
                  {filteredUsuarios.length > 0 ? (
                    filteredUsuarios.map((usuario) => (
                      <div
                        key={usuario.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${formData.convidados.includes(usuario.id) ? "bg-[#FF6B00]/10 border-[#FF6B00]/30" : "bg-white dark:bg-[#1E293B] border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/30"} transition-all duration-300`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-[#FF6B00]/20">
                            <AvatarImage src={usuario.avatar} />
                            <AvatarFallback>
                              {usuario.nome.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {usuario.nome}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>{usuario.email}</span>
                              <span>•</span>
                              <span>{usuario.curso}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant={
                            formData.convidados.includes(usuario.id)
                              ? "outline"
                              : "default"
                          }
                          size="sm"
                          className={
                            formData.convidados.includes(usuario.id)
                              ? "border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                              : "bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
                          }
                          onClick={() =>
                            formData.convidados.includes(usuario.id)
                              ? handleRemoverConvidado(usuario.id)
                              : handleConvidarUsuario(usuario.id)
                          }
                        >
                          {formData.convidados.includes(usuario.id) ? (
                            <>
                              <Check className="h-3.5 w-3.5 mr-1" /> Convidado
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-3.5 w-3.5 mr-1" /> Convidar
                            </>
                          )}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      <p>Nenhum usuário encontrado com os termos da busca.</p>
                    </div>
                  )}
                </div>
              </div>

              {convidadosInfo.length > 0 &&(
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Users className="h-5 w-5 text-[#FF6B00]" /> Participantes
                      Convidados
                    </h3>
                    <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-[#FF8C40]">
                      {convidadosInfo.length} convidados
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {convidadosInfo.map(
                      (usuario) =>
                        usuario && (
                          <div
                            key={usuario.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 border border-[#FF6B00]/20 dark:border-[#FF6B00]/30"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 border border-[#FF6B00]/20">
                                <AvatarImage src={usuario.avatar} />
                                <AvatarFallback>
                                  {usuario.nome.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                  {usuario.nome}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {usuario.curso}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                              onClick={() => handleRemoverConvidado(usuario.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ),
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="imagem" className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="imagem">Imagem do Grupo</Label>
                <div className="border-2 border-dashed border-[#FF6B00]/30 rounded-lg p-6 text-center hover:border-[#FF6B00]/50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    id="imagem"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <label
                    htmlFor="imagem"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <Upload className="h-10 w-10 text-[#FF6B00]/50" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formData.imagem
                        ? formData.imagem.name
                        : "Clique para fazer upload de uma imagem"}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Recomendado: 1200 x 400 pixels, máximo 2MB
                    </span>
                  </label>
                </div>
                {formData.imagem && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, imagem: null }))
                      }
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remover imagem
                    </Button>
                  </div>
                )}
              </div>

              <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-lg p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-5 w-5 text-[#FF6B00]" />
                  <h3 className="text-base font-medium text-gray-900 dark:text-white">
                    Prévia do Grupo
                  </h3>
                </div>

                <div className="bg-white dark:bg-[#29335C]/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-[#FF6B00]/20 flex items-center justify-center">
                      {getTipoGrupoInfo().icone}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                        {formData.nome || "Nome do Grupo"}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formData.disciplina || "Disciplina/Área"} •{" "}
                        {formData.convidados.length + 1} participantes
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                    {formData.descricao ||
                      "Descrição do grupo aparecerá aqui..."}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags &&
                      formData.tags.split(",").map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                        >
                          {tag.trim()}
                        </Badge>
                      ))}
                    {!formData.tags && (
                      <Badge
                        variant="outline"
                        className="text-xs border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
                      >
                        Tags aparecerão aqui
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 text-[#FF6B00]" />
                      <span>
                        {formData.dataInicio
                          ? new Date(formData.dataInicio).toLocaleDateString()
                          : "Data de início"}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      className="h-8 text-xs bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
                      disabled
                    >
                      Acessar Grupo
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-all duration-300"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white shadow-md hover:shadow-lg transition-all duration-300 animate-gradient-x"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Criar Grupo
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateGroupForm;