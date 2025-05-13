import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, Users, BookOpen, Calendar, Lock, Shield, 
  Edit3, Eye, UserPlus, Bell, MessageSquare, Image, 
  Brush, CheckCircle, X, Save, ChevronRight, AlertCircle, Share2
} from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { supabase } from "@/lib/supabase";
import CompartilharGrupoSection from "./CompartilharGrupoSection";

interface GrupoConfiguracoesModalProps {
  isOpen: boolean;
  onClose: () => void;
  grupo: {
    id: string;
    nome: string;
    descricao?: string;
    cor: string;
    membros: number;
    disciplina?: string;
    privado?: boolean;
    visibilidade?: string;
    data_inicio?: string;
    criador?: string;
    codigo?: string; // Adicionado o campo codigo
  } | null;
  onSave: (grupoAtualizado: any) => void;
}

const GrupoConfiguracoesModal: React.FC<GrupoConfiguracoesModalProps> = ({
  isOpen,
  onClose,
  grupo,
  onSave
}) => {
  // Estados para os campos editáveis
  const [nome, setNome] = useState(grupo?.nome || "");
  const [descricao, setDescricao] = useState(grupo?.descricao || "");
  const [disciplina, setDisciplina] = useState(grupo?.disciplina || "");
  const [cor, setCor] = useState(grupo?.cor || "#FF6B00");
  const [privado, setPrivado] = useState(grupo?.privado || false);
  const [visibilidade, setVisibilidade] = useState(grupo?.visibilidade || "todos");
  const [dataInicio, setDataInicio] = useState(grupo?.data_inicio || "");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("informacoes");
   const [grupoAtualizado, setGrupoAtualizado] = useState(grupo); // Usar estado para o grupo atualizado

  // Opções de visibilidade
  const opcoesVisibilidade = [
    { value: "todos", label: "Todos podem visualizar" },
    { value: "membros", label: "Apenas membros" },
    { value: "convite", label: "Apenas por convite" }
  ];

  // Reset form quando o modal abrir com novo grupo
  React.useEffect(() => {
    if (grupo) {
      setNome(grupo.nome || "");
      setDescricao(grupo.descricao || "");
      setDisciplina(grupo.disciplina || "");
      setCor(grupo.cor || "#FF6B00");
      setPrivado(grupo.privado || false);
      setVisibilidade(grupo.visibilidade || "todos");
      setDataInicio(grupo.data_inicio || "");
        setGrupoAtualizado(grupo); // Inicializar o estado do grupo atualizado
    }
  }, [grupo, isOpen]);

  const handleSubmit = async () => {
    if (!grupo) return;

    try {
      setSaving(true);
      setError(null);

      // Validar campos obrigatórios
      if (!nome.trim()) {
        setError("O nome do grupo é obrigatório");
        setSaving(false);
        return;
      }

      // Verificar se é necessário gerar um novo código para o grupo
      let codigoGrupo = grupo.codigo;
      if (!codigoGrupo) {
        try {
          // Importar a função de geração de código do módulo gruposEstudoStorage
          const { gerarCodigoUnicoGrupo } = await import('@/lib/gruposEstudoStorage');
          codigoGrupo = await gerarCodigoUnicoGrupo();
          console.log("Código gerado para o grupo:", codigoGrupo);
        } catch (error) {
          console.error("Erro ao gerar código para o grupo:", error);
          // Fallback para código simples se ocorrer erro
          const CARACTERES_PERMITIDOS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
          codigoGrupo = Array(7).fill(0).map(() => 
            CARACTERES_PERMITIDOS.charAt(Math.floor(Math.random() * CARACTERES_PERMITIDOS.length))
          ).join('');
        }
      }

      const grupoAtualizado = {
        ...grupo,
        nome,
        descricao,
        disciplina,
        cor,
        privado,
        visibilidade,
        data_inicio: dataInicio,
        codigo: codigoGrupo
      };

      // Primeiro atualizar localmente para feedback imediato
      onSave(grupoAtualizado);

      // Se for um grupo local, apenas atualizar via callback
      if (grupo.id.startsWith('local_')) {
        // Atualizar no armazenamento local
        try {
          const { obterGruposLocal, salvarGrupoLocal } = await import('@/lib/gruposEstudoStorage');
          const gruposLocais = obterGruposLocal();
          const gruposAtualizados = gruposLocais.map((g: any) => 
            g.id === grupo.id ? grupoAtualizado : g
          );

          // Salvar os grupos atualizados no localStorage
          localStorage.setItem('epictus_grupos_estudo', JSON.stringify(gruposAtualizados));

          // Atualizar também via função específica (redundância para segurança)
          salvarGrupoLocal(grupoAtualizado);

          console.log("Grupo local atualizado com sucesso:", grupoAtualizado);
        } catch (localError) {
          console.error("Erro ao atualizar grupo localmente:", localError);
        }
      } else {
        // Atualizar no Supabase para grupos não-locais
        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (session) {
            const { error } = await supabase
              .from('grupos_estudo')
              .update({
                nome,
                descricao,
                disciplina,
                cor,
                privado,
                visibilidade,
                data_inicio: dataInicio,
                codigo: codigoGrupo
              })
              .eq('id', grupo.id);

            if (error) {
              console.error("Erro ao atualizar grupo no Supabase:", error);
              // Não impedimos o fluxo aqui, pois já salvamos localmente
            } else {
              console.log("Grupo atualizado no Supabase com sucesso");
            }
          }
        } catch (supabaseError) {
          console.error("Erro ao comunicar com Supabase:", supabaseError);
          // Já salvamos localmente, então continuamos o fluxo
        }
      }

      // Mostrar animação de sucesso
      mostrarNotificacaoSucesso("Grupo atualizado com sucesso!");

      // Fechar modal após sucesso
      setTimeout(() => {
        onClose();
        setSaving(false);
      }, 500);
    } catch (error) {
      console.error("Erro ao salvar grupo:", error);
      setError("Ocorreu um erro ao salvar as alterações. Tente novamente.");
      setSaving(false);
    }
  };

    // Função para gerar um código único para o grupo
    const handleGerarCodigo = async () => {
      try {
          // Verificar se o grupo já tem um código
          if (grupoAtualizado?.codigo) {
              // Se já existe um código, mostrar notificação e não gerar um novo
              mostrarNotificacaoSucesso("Este grupo já possui um código permanente!");
              return;
          }
  
          // Gerar um código único para o grupo
          const { gerarCodigoUnicoGrupo, salvarGrupoLocal, obterGruposLocal } = await import('@/lib/gruposEstudoStorage');
          const novoCodigo = await gerarCodigoUnicoGrupo();
          
          console.log("Novo código gerado:", novoCodigo);
  
          if (novoCodigo) {
              // Criar cópia do grupo atualizado com o novo código
              const grupoComCodigo = grupo ? {...grupo, codigo: novoCodigo} : null;
              
              // Atualizar o estado local
              setGrupoAtualizado(prev => grupoComCodigo || prev);
              
              // Mostrar notificação de sucesso
              mostrarNotificacaoSucesso("Código permanente do grupo gerado com sucesso!");

              // Primeiro salvar localmente para garantir persistência
              if (grupoComCodigo) {
                  try {
                      // Salvar usando a função específica para evitar duplicação
                      salvarGrupoLocal(grupoComCodigo);
                      console.log('Código do grupo salvo localmente:', novoCodigo);
                  } catch (localError) {
                      console.error("Erro ao salvar grupo localmente:", localError);
                  }
              }

              // Atualizar no Supabase se for um grupo remoto
              if (grupo?.id && !grupo.id.startsWith('local_')) {
                  try {
                      const { data: { session } } = await supabase.auth.getSession();
                      
                      if (session) {
                          const { error } = await supabase
                              .from('grupos_estudo')
                              .update({ codigo: novoCodigo })
                              .eq('id', grupo.id)
                              .eq('user_id', session.user.id);
          
                          if (error) {
                              console.error('Erro ao salvar código no banco de dados:', error);
                              // Mostrar notificação de erro, mas continuar pois já salvamos localmente
                              mostrarNotificacaoErro("Erro ao salvar código no servidor. O código foi salvo localmente.");
                          } else {
                              console.log('Código salvo com sucesso no Supabase:', novoCodigo);
                          }
                      }
                  } catch (dbError) {
                      console.error('Erro na comunicação com Supabase:', dbError);
                  }
              }
              
              // Forçar atualização da UI e dos componentes pais
              if (grupo && onSave) {
                  // Atualizar referência do grupo original para UI
                  if (grupo) {
                      grupo.codigo = novoCodigo;
                  }
                  
                  // Notificar componente pai sobre a mudança
                  onSave(grupoComCodigo || {...grupo, codigo: novoCodigo});
              }
          }
      } catch (error) {
          console.error('Erro ao gerar código do grupo:', error);
          mostrarNotificacaoErro("Erro ao gerar código. Tente novamente.");
      }
  };
  
  // Adicionar função de notificação de erro
  const mostrarNotificacaoErro = (mensagem: string) => {
      const element = document.createElement('div');
      element.style.position = 'fixed';
      element.style.top = '20px';
      element.style.left = '50%';
      element.style.transform = 'translateX(-50%)';
      element.style.padding = '12px 24px';
      element.style.background = 'linear-gradient(135deg, #D32F2F, #B71C1C)';
      element.style.color = 'white';
      element.style.borderRadius = '8px';
      element.style.zIndex = '9999';
      element.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
      element.style.display = 'flex';
      element.style.alignItems = 'center';
      element.style.gap = '8px';

      const icon = document.createElement('span');
      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

      const text = document.createElement('span');
      text.textContent = mensagem;
      text.style.fontWeight = '500';

      element.appendChild(icon);
      element.appendChild(text);
      document.body.appendChild(element);

      // Efeito de entrada
      element.animate([
        { opacity: 0, transform: 'translate(-50%, -20px)' },
        { opacity: 1, transform: 'translate(-50%, 0)' }
      ], {
        duration: 300,
        easing: 'ease-out'
      });

      // Remover após 3 segundos com efeito de saída
      setTimeout(() => {
        element.animate([
          { opacity: 1, transform: 'translate(-50%, 0)' },
          { opacity: 0, transform: 'translate(-50%, -20px)' }
        ], {
          duration: 300,
          easing: 'ease-in'
        }).onfinish = () => document.body.removeChild(element);
      }, 3000);
  };

  // Função para mostrar notificação de sucesso
  const mostrarNotificacaoSucesso = (mensagem: string) => {
    const element = document.createElement('div');
    element.style.position = 'fixed';
    element.style.top = '20px';
    element.style.left = '50%';
    element.style.transform = 'translateX(-50%)';
    element.style.padding = '12px 24px';
    element.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';
    element.style.color = 'white';
    element.style.borderRadius = '8px';
    element.style.zIndex = '9999';
    element.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
    element.style.display = 'flex';
    element.style.alignItems = 'center';
    element.style.gap = '8px';

    const icon = document.createElement('span');
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;

    const text = document.createElement('span');
    text.textContent = mensagem;
    text.style.fontWeight = '500';

    element.appendChild(icon);
    element.appendChild(text);
    document.body.appendChild(element);

    // Efeito de entrada
    element.animate([
      { opacity: 0, transform: 'translate(-50%, -20px)' },
      { opacity: 1, transform: 'translate(-50%, 0)' }
    ], {
      duration: 300,
      easing: 'ease-out'
    });

    // Remover após 3 segundos com efeito de saída
    setTimeout(() => {
      element.animate([
        { opacity: 1, transform: 'translate(-50%, 0)' },
        { opacity: 0, transform: 'translate(-50%, -20px)' }
      ], {
        duration: 300,
        easing: 'ease-in'
      }).onfinish = () => document.body.removeChild(element);
    }, 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-gradient-to-br from-white/95 to-white/90 dark:from-[#0A2540]/95 dark:to-[#071a2e]/90 backdrop-blur-xl border-0 shadow-2xl rounded-2xl p-0 overflow-hidden">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 via-transparent to-[#FF8C40]/5 dark:from-[#FF6B00]/10 dark:via-transparent dark:to-[#FF8C40]/5 rounded-2xl pointer-events-none"></div>

        {/* Header */}
        <DialogHeader className="p-6 pb-2 relative z-10">
          <div className="flex items-center gap-3">
            <div 
              className="h-10 w-10 rounded-lg flex items-center justify-center text-white shadow-lg" 
              style={{ backgroundColor: cor }}
            >
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#001427] to-[#323232] dark:from-white dark:to-white/80">
                Configurações do Grupo
              </DialogTitle>
              <DialogDescription className="text-gray-500 dark:text-gray-400 mt-1">
                {grupo?.nome || "Carregando..."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs Navigation */}
        <div className="px-6 pt-2">
          <Tabs defaultValue="informacoes" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="informacoes" className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white">
                <Edit3 className="h-4 w-4 mr-2" />
                Informações
              </TabsTrigger>
              <TabsTrigger value="privacidade" className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white">
                <Shield className="h-4 w-4 mr-2" />
                Privacidade
              </TabsTrigger>
              <TabsTrigger value="membros" className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white">
                <Users className="h-4 w-4 mr-2" />
                Membros
              </TabsTrigger>
              <TabsTrigger value="compartilhar" className="data-[state=active]:bg-[#FF6B00] data-[state=active]:text-white">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </TabsTrigger>
            </TabsList>

            {/* Informações Básicas */}
            <TabsContent value="informacoes" className="space-y-4 focus:outline-none">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Nome do grupo
                  </Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Digite o nome do grupo"
                    className="w-full border-gray-300 dark:border-gray-700 focus:ring-[#FF6B00] focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <Label htmlFor="descricao" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Descrição
                  </Label>
                  <Textarea
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Descreva o propósito do grupo..."
                    className="w-full border-gray-300 dark:border-gray-700 focus:ring-[#FF6B00] focus:border-[#FF6B00]"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="disciplina" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Disciplina
                  </Label>
                  <Input
                    id="disciplina"
                    value={disciplina}
                    onChange={(e) => setDisciplina(e.target.value)}
                    placeholder="Ex: Matemática, Física, História..."
                    className="w-full border-gray-300 dark:border-gray-700 focus:ring-[#FF6B00] focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <Label htmlFor="dataInicio" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Data de início
                  </Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full border-gray-300 dark:border-gray-700 focus:ring-[#FF6B00] focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <Label htmlFor="cor" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Cor do grupo
                  </Label>
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-700"
                      style={{ backgroundColor: cor }}
                      onClick={() => setShowColorPicker(!showColorPicker)}
                    />
                    <Input
                      id="cor"
                      value={cor}
                      onChange={(e) => setCor(e.target.value)}
                      className="flex-1 border-gray-300 dark:border-gray-700 focus:ring-[#FF6B00] focus:border-[#FF6B00]"
                    />
                  </div>

                  {showColorPicker && (
                    <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                      <HexColorPicker color={cor} onChange={setCor} />
                      <div className="flex justify-end mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowColorPicker(false)}
                          className="text-xs"
                        >
                          Fechar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Privacidade */}
            <TabsContent value="privacidade" className="space-y-4 focus:outline-none">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Grupo privado</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Apenas pessoas convidadas podem entrar no grupo
                    </p>
                  </div>
                  <Switch
                    checked={privado}
                    onCheckedChange={setPrivado}
                    className="data-[state=checked]:bg-[#FF6B00]"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Visibilidade do grupo</h3>
                  <div className="space-y-3">
                    {opcoesVisibilidade.map((opcao) => (
                      <div key={opcao.value} className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant={visibilidade === opcao.value ? "default" : "outline"}
                          className={`w-full justify-start ${visibilidade === opcao.value ? 'bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white' : ''}`}
                          onClick={() => setVisibilidade(opcao.value)}
                        >
                          {visibilidade === opcao.value && <CheckCircle className="h-4 w-4 mr-2" />}
                          {visibilidade !== opcao.value && (
                            opcao.value === "todos" ? <Eye className="h-4 w-4 mr-2" /> :
                            opcao.value === "membros" ? <Users className="h-4 w-4 mr-2" /> :
                            <Lock className="h-4 w-4 mr-2" />
                          )}
                          {opcao.label}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Observação</h4>
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                          Alterar a privacidade do grupo não afeta os membros atuais, apenas novos convites e solicitações.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Membros */}
            <TabsContent value="membros" className="space-y-4 focus:outline-none">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Membros do grupo ({grupo?.membros || 0})</h3>
                <Button size="sm" variant="outline" className="text-xs flex items-center gap-1 text-[#FF6B00] border-[#FF6B00] hover:bg-[#FF6B00]/10">
                  <UserPlus className="h-3.5 w-3.5 mr-1" /> Convidar
                </Button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {/* Lista de membros simulada */}
                {[...Array(Math.max(1, grupo?.membros || 1))].map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                        <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {index === 0 ? 'Você' : `Membro ${index + 1}`}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {index === 0 ? '(Criador)' : 'Membro desde 15/05/2023'}
                        </div>
                      </div>
                    </div>

                    {index === 0 ? (
                      <div className="text-xs font-medium text-[#FF6B00] bg-[#FF6B00]/10 px-2 py-1 rounded">Criador</div>
                    ) : (
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {/* Seção para mostrar quando não há membros */}
                {(!grupo?.membros || grupo.membros <= 1) && (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/20 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <Users className="h-10 w-10 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Nenhum outro membro</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                      Convide pessoas para participar do seu grupo de estudos e colaborarem com você.
                    </p>
                    <Button size="sm" variant="outline" className="mt-4 text-xs text-[#FF6B00] border-[#FF6B00] hover:bg-[#FF6B00]/10">
                      <UserPlus className="h-3.5 w-3.5 mr-1" /> Convidar pessoas
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

             {/* Compartilhar */}
            <TabsContent value="compartilhar" className="space-y-4 focus:outline-none">
              <CompartilharGrupoSection 
                grupoCodigo={grupo?.codigo || ""} 
                grupoNome={grupo?.nome || ""} 
                onGerarCodigo={handleGerarCodigo}
              />
              {!grupo?.codigo && (
                <p className="text-amber-500 text-sm">
                  Aviso: Clique em "Gerar código do grupo" para criar um código permanente e único para este grupo.
                </p>
              )}
              {grupo?.codigo && (
                <p className="text-green-500 text-sm">
                  Este grupo já possui um código permanente que não pode ser alterado ou perdido.
                </p>
              )}

              <div className="mb-4">
        <label className="block text-sm font-medium text-white/70 mb-1">
          Código Único do Grupo
        </label>
        <div className="flex items-center">
          {grupo?.codigo ? (
            <span className="inline-block bg-[#1E293B] text-white px-3 py-2 rounded-md font-mono text-sm tracking-wider uppercase font-bold">
              {grupo.codigo.length >= 4 ? 
                `${grupo.codigo.substring(0, 4)} ${grupo.codigo.substring(4)}` : 
                grupo.codigo}
            </span>
          ) : (
            <span className="inline-block bg-[#1E293B] text-white/60 px-3 py-2 rounded-md font-mono text-sm">
              SEM CÓDIGO
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {grupo?.codigo ? 
            "Este código é usado para convidar pessoas para o seu grupo. O código é insensível a maiúsculas e minúsculas." :
            "Um código único será gerado para este grupo quando você salvar as alterações."}
        </p>
      </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Error message */}
        {error && (
          <div className="px-6 pt-2">
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800/30">
              <div className="flex items-center">
                <X className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer with actions */}
        <div className="p-6 pt-4 flex justify-end gap-3 relative z-10">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-700"
          >
            Cancelar
          </Button>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(255, 107, 0, 0.2)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={saving}
            className={`h-10 px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-white bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF6B00]/90 hover:to-[#FF8C40]/90 active:from-[#E55A00] active:to-[#FF7D30] focus:ring-2 focus:ring-[#FF6B00]/50 focus:outline-none transition-all ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {saving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Salvar alterações</span>
              </>
            )}
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GrupoConfiguracoesModal;