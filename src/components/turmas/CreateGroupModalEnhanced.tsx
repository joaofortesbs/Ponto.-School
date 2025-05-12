import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  X, Users, Plus, ArrowLeft, Calendar, BookOpen, BookmarkIcon
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

    try {
      // Obter a sessão do usuário atual
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert("Você precisa estar logado para criar um grupo de estudo.");
        return;
      }

      // Gerar um código único para o grupo no novo formato de 7 caracteres
      let codigoGrupo = await gerarCodigoUnicoGrupo();

      // Certificar que temos um código, mesmo com erro
      if (!codigoGrupo) {
        try {
          // Se falhou a geração normal, gerar um código de emergência
          const CARACTERES_PERMITIDOS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
          codigoGrupo = Array(7).fill(0).map(() => 
            CARACTERES_PERMITIDOS.charAt(Math.floor(Math.random() * CARACTERES_PERMITIDOS.length))
          ).join('');
        } catch (e) {
          console.error("Falha ao gerar código alternativo:", e);
          // Código básico de último recurso
          codigoGrupo = "TMP" + Math.floor(Math.random() * 9000 + 1000);
        }
      }

      // Garantir que o código esteja em maiúsculas e tenha o comprimento correto
      codigoGrupo = codigoGrupo.toUpperCase();

      // Verificar se o código tem o comprimento esperado (7 caracteres)
      if (codigoGrupo.length !== 7) {
        console.warn("Código gerado não tem o comprimento esperado:", codigoGrupo);
        // Ajustar o código para ter 7 caracteres se necessário
        const CARACTERES_PERMITIDOS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        if (codigoGrupo.length < 7) {
          // Adicionar caracteres aleatórios até completar 7
          while (codigoGrupo.length < 7) {
            codigoGrupo += CARACTERES_PERMITIDOS.charAt(
              Math.floor(Math.random() * CARACTERES_PERMITIDOS.length)
            );
          }
        } else if (codigoGrupo.length > 7) {
          // Truncar para 7 caracteres
          codigoGrupo = codigoGrupo.substring(0, 7);
        }
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

        // Salvar localmente em caso de erro
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
      setActiveTab("informacoes");
    }
  }, [isOpen]);

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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-[#FF6B00]" />
                <h2 className="text-2xl font-bold text-white">Criar Grupo de Estudo</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 rounded-full text-white/80 hover:text-white hover:bg-white/20 flex items-center gap-1"
                  onClick={onClose}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-white/80 hover:text-white hover:bg-white/20"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <p className="text-white/70 text-sm mt-1">
              Preencha os detalhes do seu novo grupo. Você poderá editá-los posteriormente.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex space-x-2 mb-6">
              <button 
                type="button"
                onClick={() => setActiveTab("informacoes")}
                className={`py-2 px-4 rounded-lg text-sm font-medium ${
                  activeTab === "informacoes" 
                    ? "bg-[#FF6B00] text-white" 
                    : "bg-[#1E293B] text-white/70 hover:bg-[#1E293B]/80"
                }`}
              >
                Informações Básicas
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab("configuracoes")}
                className={`py-2 px-4 rounded-lg text-sm font-medium ${
                  activeTab === "configuracoes" 
                    ? "bg-[#FF6B00] text-white" 
                    : "bg-[#1E293B] text-white/70 hover:bg-[#1E293B]/80"
                }`}
              >
                Configurações
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab("participantes")}
                className={`py-2 px-4 rounded-lg text-sm font-medium ${
                  activeTab === "participantes" 
                    ? "bg-[#FF6B00] text-white" 
                    : "bg-[#1E293B] text-white/70 hover:bg-[#1E293B]/80"
                }`}
              >
                Participantes
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab("imagem")}
                className={`py-2 px-4 rounded-lg text-sm font-medium ${
                  activeTab === "imagem" 
                    ? "bg-[#FF6B00] text-white" 
                    : "bg-[#1E293B] text-white/70 hover:bg-[#1E293B]/80"
                }`}
              >
                Imagem do Grupo
              </button>
            </div>

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
              </div>
            )}

            {activeTab === "participantes" && (
              <div className="space-y-5">
                <div className="bg-[#1E293B]/50 rounded-lg p-4 border border-[#1E293B]">
                  <p className="text-white text-center py-10">
                    Após criar o grupo, você poderá convidar participantes através do código de convite que será gerado.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "imagem" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-3">
                    Imagem do Grupo
                  </label>
                  <div className="text-center py-10 text-white/70">
                    Funcionalidade disponível após a criação do grupo.
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-[#1E293B] text-white hover:bg-[#1E293B] hover:text-white flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
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