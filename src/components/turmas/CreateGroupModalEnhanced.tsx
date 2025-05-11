import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  X, Users, Plus, Key, BookOpen, Calendar, Clock, 
  Search, Upload, Info, Settings, UserPlus, BookmarkIcon,
  Sparkles, Check
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { criarGrupo, salvarGrupoLocal, gerarCodigoUnicoGrupo } from "@/lib/gruposEstudoStorage";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

// Opções de atividades para o grupo
const atividadesSugeridas = [
  { id: "sessoes", nome: "Sessões de estudo semanais", icon: <Calendar className="h-4 w-4 text-[#FF6B00]" /> },
  { id: "discussoes", nome: "Discussões temáticas", icon: <BookOpen className="h-4 w-4 text-[#FF6B00]" /> },
  { id: "revisao", nome: "Revisão pré-prova", icon: <BookmarkIcon className="h-4 w-4 text-[#FF6B00]" /> },
  { id: "resolucao", nome: "Resolução de exercícios em grupo", icon: <BookOpen className="h-4 w-4 text-[#FF6B00]" /> },
  { id: "apresentacoes", nome: "Apresentações de tópicos", icon: <BookOpen className="h-4 w-4 text-[#FF6B00]" /> },
  { id: "compartilhamento", nome: "Compartilhamento de materiais", icon: <BookOpen className="h-4 w-4 text-[#FF6B00]" /> }
];

// Dados simulados para usuários disponíveis
const usuariosDisponiveis = [
  { id: "u1", nome: "Ana Silva", avatar: null, email: "ana.silva@gmail.com", curso: "Engenharia" },
  { id: "u2", nome: "Pedro Oliveira", avatar: null, email: "pedro.oliveira@gmail.com", curso: "Matemática" },
  { id: "u3", nome: "Mariana Santos", avatar: null, email: "mariana.santos@gmail.com", curso: "Física" },
  { id: "u4", nome: "João Costa", avatar: null, email: "joao.costa@gmail.com", curso: "Computação" },
  { id: "u5", nome: "Carla Mendes", avatar: null, email: "carla.mendes@gmail.com", curso: "Biologia" }
];

const CreateGroupModalEnhanced: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [activeTab, setActiveTab] = useState<string>("informacoes");
  const [formData, setFormData] = useState({
    nome: "",
    disciplina: "",
    topico: "",
    descricao: "",
    objetivos: "",
    tags: "",
    dataInicio: "",
    frequencia: "Semanal",
    horarios: "",
    privacidade: "Público (qualquer um pode ver e solicitar participação)",
    maxMembros: "10 membros",
    nivelDificuldade: "Intermediário",
    permitirMentorIA: true,
    atividades: [] as string[],
    convidados: [] as string[],
    imagem: null as File | null
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [convidadosInfo, setConvidadosInfo] = useState<any[]>([]);

  // Filtrar usuários baseado no termo de busca
  const filteredUsuarios = usuariosDisponiveis.filter(usuario => 
    usuario.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    usuario.curso.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAtividadeToggle = (atividadeId: string) => {
    setFormData(prev => {
      const atividades = [...prev.atividades];
      if (atividades.includes(atividadeId)) {
        return {
          ...prev,
          atividades: atividades.filter(id => id !== atividadeId)
        };
      } else {
        return { ...prev, atividades: [...atividades, atividadeId] };
      }
    });
  };

  const handleConvidarUsuario = (usuarioId: string) => {
    if (!formData.convidados.includes(usuarioId)) {
      setFormData(prev => ({
        ...prev,
        convidados: [...prev.convidados, usuarioId]
      }));

      // Atualizar a lista de convidados com informações detalhadas
      const usuario = usuariosDisponiveis.find(u => u.id === usuarioId);
      if (usuario) {
        setConvidadosInfo(prev => [...prev, usuario]);
      }
    }
  };

  const handleRemoverConvidado = (usuarioId: string) => {
    setFormData(prev => ({
      ...prev,
      convidados: prev.convidados.filter(id => id !== usuarioId)
    }));

    setConvidadosInfo(prev => prev.filter(u => u.id !== usuarioId));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, imagem: file }));

      // Criar URL para previsualização
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validar formulário
    if (!formData.nome.trim()) {
      alert("O nome do grupo é obrigatório");
      return;
    }

    if (!formData.disciplina.trim()) {
      alert("A disciplina/área é obrigatória");
      return;
    }

    if (!formData.dataInicio) {
      alert("A data de início é obrigatória");
      return;
    }

    try {
      // Obter a sessão do usuário atual
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert("Você precisa estar logado para criar um grupo de estudo.");
        return;
      }

      // Gerar um código único para o grupo - sempre no formato PONTO123
      let codigoGrupo = await gerarCodigoUnicoGrupo();
      
      // Certificar que temos um código, mesmo com erro
      if (!codigoGrupo) {
        try {
          // Garantir que o código sempre comece com PONTO seguido de 3 dígitos
          codigoGrupo = "PONTO" + Math.floor(Math.random() * 900 + 100);
        } catch (e) {
          console.error("Falha ao gerar código alternativo:", e);
          codigoGrupo = "PONTO" + Math.floor(Math.random() * 900 + 100);
        }
      }
      
      // Verificar se o código está no formato esperado, caso contrário, ajustar
      if (!codigoGrupo.startsWith("PONTO")) {
        codigoGrupo = "PONTO" + Math.floor(Math.random() * 900 + 100);
      }
      
      console.log("Código único gerado para o grupo:", codigoGrupo);

      // Preparar dados para criação do grupo
      const novoGrupo = {
        user_id: session.user.id,
        nome: formData.nome,
        descricao: formData.descricao || "",
        objetivos: formData.objetivos || "",
        disciplina: formData.disciplina,
        topico: formData.topico || null,
        tags: formData.tags || "",
        data_inicio: formData.dataInicio,
        frequencia: formData.frequencia,
        horarios: formData.horarios || "",
        privacidade: formData.privacidade,
        max_membros: formData.maxMembros,
        nivel_dificuldade: formData.nivelDificuldade,
        permitir_mentor_ia: formData.permitirMentorIA,
        atividades: formData.atividades,
        convidados: formData.convidados,
        convidados_info: convidadosInfo,
        codigo: codigoGrupo, // Código único gerado
        cor: "#FF6B00", // Cor padrão
        membros: 1, // Inicialmente, apenas o criador é membro
        data_criacao: new Date().toISOString()
      };

      console.log("Criando grupo de estudos:", novoGrupo);

      try {
        // Tentar inserir no Supabase
        const { data, error } = await supabase
          .from('grupos_estudo')
          .insert(novoGrupo)
          .select('*')
          .single();

        if (error) {
          console.error("Erro ao inserir grupo no Supabase:", error);

          // Se falhar o Supabase, salvar localmente
          await salvarGrupoLocal({
            ...novoGrupo,
            id: crypto.randomUUID(), // Gerar um ID local
            timestamp: new Date().getTime()
          });

          console.log("Grupo salvo localmente");
        } else {
          console.log("Grupo criado com sucesso no Supabase:", data);
        }
      } catch (supabaseError) {
        console.error("Erro ao acessar Supabase:", supabaseError);

        // Salvar localmente em caso de erro, usando salvarGrupoLocal em vez de criarGrupo
        // para evitar duplicação
        await salvarGrupoLocal({
          ...novoGrupo,
          id: crypto.randomUUID(),
          timestamp: new Date().getTime()
        });

        console.log("Grupo salvo localmente após erro no Supabase");
      }

      // Enviar para o callback com os dados retornados
      onSubmit(novoGrupo);

      // Fechar o modal após submissão bem-sucedida
      onClose();
    } catch (error) {
      console.error("Erro ao criar grupo:", error);
      alert(`Erro ao criar grupo: ${error instanceof Error ? error.message : "Tente novamente mais tarde."}`);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        nome: "",
        disciplina: "",
        topico: "",
        descricao: "",
        objetivos: "",
        tags: "",
        dataInicio: "",
        frequencia: "Semanal",
        horarios: "",
        privacidade: "Público (qualquer um pode ver e solicitar participação)",
        maxMembros: "10 membros",
        nivelDificuldade: "Intermediário",
        permitirMentorIA: true,
        atividades: [],
        convidados: [],
        imagem: null
      });
      setSearchQuery("");
      setPreviewUrl(null);
      setConvidadosInfo([]);
      setActiveTab("informacoes");
    }
  }, [isOpen]);

  // Limpar URLs de objeto quando componente desmontar
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-[#0F172A] dark:bg-[#0F172A] rounded-xl overflow-hidden w-[650px] max-w-full shadow-xl relative"
        >
          <div className="sticky top-0 z-10 bg-gradient-to-r from-[#0F172A] to-[#0F172A] border-b border-[#1E293B] p-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Users className="h-6 w-6 mr-3 text-[#FF6B00]" />
                Novo Grupo de Estudo
              </h2>
              <p className="text-white/70 text-sm mt-1">
                Preencha os detalhes do seu novo grupo. Você poderá editá-los posteriormente.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-9 w-9 rounded-full text-white/80 hover:text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <TabsList className="grid grid-cols-4 gap-2 mb-6 bg-transparent">
              <TabsTrigger 
                value="informacoes" 
                onClick={() => setActiveTab("informacoes")}
                className={`${activeTab === "informacoes" ? "bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]" : "bg-[#1E293B] text-white/70 border-[#1E293B]"} border px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#1E293B]/80 transition-colors`}
              >
                <Info className="h-4 w-4" />
                <span>Informações Básicas</span>
              </TabsTrigger>
              <TabsTrigger 
                value="configuracoes" 
                onClick={() => setActiveTab("configuracoes")}
                className={`${activeTab === "configuracoes" ? "bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]" : "bg-[#1E293B] text-white/70 border-[#1E293B]"} border px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#1E293B]/80 transition-colors`}
              >
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </TabsTrigger>
              <TabsTrigger 
                value="participantes" 
                onClick={() => setActiveTab("participantes")}
                className={`${activeTab === "participantes" ? "bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]" : "bg-[#1E293B] text-white/70 border-[#1E293B]"} border px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#1E293B]/80 transition-colors`}
              >
                <UserPlus className="h-4 w-4" />
                <span>Participantes</span>
              </TabsTrigger>
              <TabsTrigger 
                value="imagem" 
                onClick={() => setActiveTab("imagem")}
                className={`${activeTab === "imagem" ? "bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]" : "bg-[#1E293B] text-white/70 border-[#1E293B]"} border px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#1E293B]/80 transition-colors`}
              >
                <Upload className="h-4 w-4" />
                <span>Imagem do Grupo</span>
              </TabsTrigger>
            </TabsList>

            {activeTab === "informacoes" && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-white/70 mb-1 flex items-center">
                    Nome do Grupo <span className="text-[#FF6B00] ml-1">*</span>
                  </label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Ex: Grupo de Estudos de Cálculo"
                    required
                    className="w-full border-[#1E293B] bg-[#0F172A] text-white placeholder:text-gray-500 focus:border-[#FF6B00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="disciplina" className="block text-sm font-medium text-white/70 mb-1 flex items-center">
                      Disciplina/Área <span className="text-[#FF6B00] ml-1">*</span>
                    </label>
                    <Input
                      id="disciplina"
                      name="disciplina"
                      value={formData.disciplina}
                      onChange={handleInputChange}
                      placeholder="Ex: Matemática"
                      required
                      className="w-full border-[#1E293B] bg-[#0F172A] text-white placeholder:text-gray-500 focus:border-[#FF6B00]"
                    />
                  </div>
                  <div>
                    <label htmlFor="topico" className="block text-sm font-medium text-white/70 mb-1">
                      Tópico Específico
                    </label>
                    <Input
                      id="topico"
                      name="topico"
                      value={formData.topico}
                      onChange={handleInputChange}
                      placeholder="Ex: Álgebra Linear"
                      className="w-full border-[#1E293B] bg-[#0F172A] text-white placeholder:text-gray-500 focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-white/70 mb-1">
                    Tags (separadas por vírgula)
                  </label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="Ex: cálculo, matemática, integrais"
                    className="w-full border-[#1E293B] bg-[#0F172A] text-white placeholder:text-gray-500 focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label htmlFor="descricao" className="block text-sm font-medium text-white/70 mb-1">
                    Descrição do Grupo
                  </label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    placeholder="Descreva o objetivo do grupo, temas de estudo, etc..."
                    className="min-h-[100px] border-[#1E293B] bg-[#0F172A] text-white placeholder:text-gray-500 focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label htmlFor="objetivos" className="block text-sm font-medium text-white/70 mb-1">
                    Objetivos do Grupo
                  </label>
                  <Textarea
                    id="objetivos"
                    name="objetivos"
                    value={formData.objetivos}
                    onChange={handleInputChange}
                    placeholder="Quais são os principais objetivos deste grupo de estudos?"
                    className="min-h-[100px] border-[#1E293B] bg-[#0F172A] text-white placeholder:text-gray-500 focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Atividades Sugeridas
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {atividadesSugeridas.map((atividade) => (
                      <div key={atividade.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`atividade-${atividade.id}`}
                          checked={formData.atividades.includes(atividade.id)}
                          onChange={() => handleAtividadeToggle(atividade.id)}
                          className="h-4 w-4 rounded border-[#1E293B] text-[#FF6B00] bg-[#0F172A] focus:ring-[#FF6B00]"
                        />
                        <label 
                          htmlFor={`atividade-${atividade.id}`} 
                          className="text-white flex items-center gap-2 cursor-pointer"
                        >
                          {atividade.icon}
                          <span>{atividade.nome}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "configuracoes" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dataInicio" className="block text-sm font-medium text-white/70 mb-1 flex items-center">
                      Data de Início <span className="text-[#FF6B00] ml-1">*</span>
                    </label>
                    <Input
                      id="dataInicio"
                      name="dataInicio"
                      type="date"
                      value={formData.dataInicio}
                      onChange={handleInputChange}
                      required
                      className="w-full border-[#1E293B] bg-[#0F172A] text-white placeholder:text-gray-500 focus:border-[#FF6B00]"
                    />
                  </div>
                  <div>
                    <label htmlFor="nivelDificuldade" className="block text-sm font-medium text-white/70 mb-1">
                      Nível de Dificuldade
                    </label>
                    <Select 
                      value={formData.nivelDificuldade} 
                      onValueChange={(value) => handleSelectChange("nivelDificuldade", value)}
                    >
                      <SelectTrigger className="w-full border-[#1E293B] bg-[#0F172A] text-white">
                        <SelectValue placeholder="Selecione a dificuldade" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E293B] text-white border-[#1E293B]">
                        <SelectItem value="Iniciante">Iniciante</SelectItem>
                        <SelectItem value="Intermediário">Intermediário</SelectItem>
                        <SelectItem value="Avançado">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="frequencia" className="block text-sm font-medium text-white/70 mb-1">
                      Frequência de Encontros
                    </label>
                    <Select 
                      value={formData.frequencia} 
                      onValueChange={(value) => handleSelectChange("frequencia", value)}
                    >
                      <SelectTrigger className="w-full border-[#1E293B] bg-[#0F172A] text-white">
                        <SelectValue placeholder="Selecione a frequência" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E293B] text-white border-[#1E293B]">
                        <SelectItem value="Diário">Diário</SelectItem>
                        <SelectItem value="Semanal">Semanal</SelectItem>
                        <SelectItem value="Quinzenal">Quinzenal</SelectItem>
                        <SelectItem value="Mensal">Mensal</SelectItem>
                        <SelectItem value="Flexível">Flexível</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label htmlFor="horarios" className="block text-sm font-medium text-white/70 mb-1">
                    Horários dos Encontros
                  </label>
                  <Input
                    id="horarios"
                    name="horarios"
                    value={formData.horarios}
                    onChange={handleInputChange}
                    placeholder="Ex: Segundas, 18:00 - 19:30"
                    className="w-full border-[#1E293B] bg-[#0F172A] text-white placeholder:text-gray-500 focus:border-[#FF6B00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="privacidade" className="block text-sm font-medium text-white/70 mb-1 flex items-center">
                      Privacidade do Grupo <span className="text-[#FF6B00] ml-1">*</span>
                    </label>
                    <Select 
                      value={formData.privacidade} 
                      onValueChange={(value) => handleSelectChange("privacidade", value)}
                    >
                      <SelectTrigger className="w-full border-[#1E293B] bg-[#0F172A] text-white">
                        <SelectValue placeholder="Selecione a privacidade" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E293B] text-white border-[#1E293B]">
                        <SelectItem value="Público (qualquer um pode ver e solicitar participação)">Público (qualquer um pode ver e solicitar participação)</SelectItem>
                        <SelectItem value="Restrito (visível, mas requer aprovação)">Restrito (visível, mas requer aprovação)</SelectItem>
                        <SelectItem value="Privado (apenas por convite)">Privado (apenas por convite)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="maxMembros" className="block text-sm font-medium text-white/70 mb-1">
                      Número Máximo de Membros
                    </label>
                    <Select 
                      value={formData.maxMembros} 
                      onValueChange={(value) => handleSelectChange("maxMembros", value)}
                    >
                      <SelectTrigger className="w-full border-[#1E293B] bg-[#0F172A] text-white">
                        <SelectValue placeholder="Selecione o limite" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E293B] text-white border-[#1E293B]">
                        <SelectItem value="5 membros">5 membros</SelectItem>
                        <SelectItem value="10 membros">10 membros</SelectItem>
                        <SelectItem value="15 membros">15 membros</SelectItem>
                        <SelectItem value="20 membros">20 membros</SelectItem>
                        <SelectItem value="30 membros">30 membros</SelectItem>
                        <SelectItem value="50 membros">50 membros</SelectItem>
                        <SelectItem value="Ilimitado">Ilimitado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#1E293B]/50 rounded-lg border border-[#1E293B]">
                  <div className="flex items-center gap-2">
                    <div className="text-[#FF6B00]">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">
                        Permitir sugestões do Mentor IA
                      </h4>
                      <p className="text-xs text-gray-400">
                        O Mentor IA pode sugerir materiais e atividades para o grupo
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.permitirMentorIA}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, permitirMentorIA: checked }))
                    }
                    className="data-[state=checked]:bg-[#FF6B00]"
                  />
                </div>
              </div>
            )}

            {activeTab === "participantes" && (
              <div className="space-y-5">
                <div className="bg-[#1E293B]/50 rounded-lg p-4 border border-[#1E293B]">
                  <div className="flex items-center gap-2 mb-2">
                    <UserPlus className="h-5 w-5 text-[#FF6B00]" />
                    <h3 className="text-base font-medium text-white">
                      Convidar Participantes
                    </h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    Convide colegas para participar do seu grupo de estudos. Eles receberão uma notificação e poderão aceitar ou recusar o convite.
                  </p>

                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar por nome, email ou curso..."
                      className="pl-9 border-[#1E293B] bg-[#0F172A] text-white placeholder:text-gray-500 focus:border-[#FF6B00]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <ScrollArea className="h-[260px] pr-2">
                    <div className="space-y-2">
                      {filteredUsuarios.length > 0 ? (
                        filteredUsuarios.map((usuario) => (
                          <div
                            key={usuario.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-[#1E293B] border border-[#1E293B]"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border border-[#1E293B]">
                                <AvatarFallback className="bg-[#0F172A] text-white">
                                  {usuario.nome.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="text-sm font-medium text-white">
                                  {usuario.nome}
                                </h4>
                                <div className="text-xs text-gray-400">
                                  <span>{usuario.email}</span>
                                  <span> • </span>
                                  <span>{usuario.curso}</span>
                                </div>
                              </div>
                            </div>
                            {formData.convidados.includes(usuario.id) ? (
                              <Badge variant="outline" className="bg-transparent border-[#FF6B00] text-[#FF6B00] flex items-center">
                                <Check className="h-3 w-3 mr-1" /> Convidado
                              </Badge>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleConvidarUsuario(usuario.id)}
                                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                              >
                                <UserPlus className="h-3.5 w-3.5 mr-1" /> Convidar
                              </Button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-400">
                          <p>Nenhum usuário encontrado com os termos da busca.</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {convidadosInfo.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-medium text-white flex items-center gap-2">
                        <Users className="h-5 w-5 text-[#FF6B00]" /> Participantes Convidados
                      </h3>
                      <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 border-0">
                        {convidadosInfo.length} convidados
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {convidadosInfo.map((usuario) => (
                        <div
                          key={usuario.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-[#1E293B] border border-[#1E293B]"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-[#1E293B]">
                              <AvatarFallback className="bg-[#0F172A] text-white">
                                {usuario.nome.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-white">{usuario.nome}</p>
                              <p className="text-xs text-gray-400">{usuario.curso}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white rounded-full"
                            onClick={() => handleRemoverConvidado(usuario.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "imagem" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-3">
                    Imagem do Grupo
                  </label>
                  <div 
                    className="border-2 border-dashed border-[#1E293B] rounded-lg p-10 text-center hover:border-[#FF6B00]/50 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('grupoImagem')?.click()}
                  >
                    <input
                      type="file"
                      id="grupoImagem"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />

                    {previewUrl ? (
                      <div className="flex flex-col items-center">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="w-full max-h-40 object-contain mb-3"
                        />
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewUrl(null);
                            setFormData(prev => ({ ...prev, imagem: null }));
                          }}
                          className="mt-2"
                        >
                          <X className="h-4 w-4 mr-1" /> Remover imagem
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-[#FF6B00]/50 mx-auto" />
                        <p className="mt-2 text-sm text-gray-400">
                          Clique para fazer upload de uma imagem
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Recomendado: 1200 x 400 pixels, máximo 2MB
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-[#1E293B]/50 rounded-lg p-4 border border-[#1E293B]">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="h-5 w-5 text-[#FF6B00]" />
                    <h3 className="text-base font-medium text-white">
                      Prévia do Grupo
                    </h3>
                  </div>

                  <div className="bg-[#0F172A] rounded-lg p-4 border border-[#1E293B]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-[#FF6B00]/20 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-[#FF6B00]" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">
                          {formData.nome || "Nome do Grupo"}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {formData.disciplina || "Disciplina/Área"} • {formData.convidados.length + 1} participantes
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                      {formData.descricao || "Descrição do grupo aparecerá aqui..."}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.tags && formData.tags.split(",").map((tag, index) => (
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
                      <div className="flex items-center gap-1 text-sm text-gray-400">
                        <Calendar className="h-4 w-4 text-[#FF6B00]" />
                        <span>
                          {formData.dataInicio
                            ? new Date(formData.dataInicio).toLocaleDateString()
                            : "Data de início"}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        className="h-8 text-xs bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                        disabled
                      >
                        Acessar Grupo
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-[#1E293B] text-white hover:bg-[#1E293B] hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Grupo
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateGroupModalEnhanced;