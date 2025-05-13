import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, Settings, Users, Lock, Eye, EyeOff, Copy, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { 
  gerarCodigoGrupo, 
  verificarCodigoExistente, 
  atualizarCodigoGrupo 
} from "@/lib/grupoCodigoUtils";

interface GrupoConfiguracoesModalProps {
  grupo?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (grupoAtualizado: any) => void;
}

const GrupoConfiguracoesModal: React.FC<GrupoConfiguracoesModalProps> = ({
  grupo,
  isOpen,
  onClose,
  onSave,
}) => {
  const [grupoAtualizado, setGrupoAtualizado] = useState<any>(grupo || {});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("geral");
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [notificacao, setNotificacao] = useState<{ tipo: string; mensagem: string } | null>(null);

  // Função para mostrar notificações temporárias
  const mostrarNotificacao = (tipo: "sucesso" | "erro" | "info", mensagem: string) => {
    setNotificacao({ tipo, mensagem });
    setTimeout(() => {
      setNotificacao(null);
    }, 3000);
  };

  // Função para mostrar notificações de sucesso
  const mostrarNotificacaoSucesso = (mensagem: string) => {
    mostrarNotificacao("sucesso", mensagem);
    toast({
      title: "Sucesso",
      description: mensagem,
    });
  };

  // Atualizar o estado quando o grupo mudar
  useEffect(() => {
    setGrupoAtualizado(grupo || {});
  }, [grupo]);

  // Função para copiar o código para a área de transferência
  const handleCopyCode = async () => {
    if (grupo?.codigo) {
      try {
        await navigator.clipboard.writeText(grupo.codigo);
        setIsCopied(true);
        mostrarNotificacaoSucesso("Código copiado para a área de transferência!");

        // Resetar o estado após 2 segundos
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      } catch (err) {
        console.error("Erro ao copiar código:", err);
        mostrarNotificacao("erro", "Não foi possível copiar o código. Tente manualmente.");
      }
    }
  };

  // Função para gerar/regenerar o código do grupo
  const handleGerarCodigo = async () => {
    setIsGeneratingCode(true);
    try {
      // Verificar se já existe um código
      if (grupo && grupo.id) {
        // Verificar se o código já foi definido como permanente
        const CODIGOS_STORAGE_KEY = 'epictus_codigos_grupo';
        const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
        const codigoPermanente = localStorage.getItem(`grupo_codigo_gerado_${grupo.id}`) === "true";

        if (codigoPermanente && codigosGrupos[grupo.id]) {
          // Código já é permanente, não permitir regeneração
          setGrupoAtualizado(prev => ({
            ...prev,
            codigo: codigosGrupos[grupo.id]
          }));

          mostrarNotificacao("info", "O código deste grupo já foi definido como permanente e não pode ser alterado.");
          console.log("Código permanente existente:", codigosGrupos[grupo.id]);
          return;
        }

        // Gerar novo código
        const { gerarCodigoGrupo, verificarCodigoExistente } = await import('@/lib/grupoCodigoUtils');
        let novoCodigo = gerarCodigoGrupo();

        // Verificar se o código já existe
        let codigoExiste = await verificarCodigoExistente(novoCodigo);
        let tentativas = 0;
        const MAX_TENTATIVAS = 5;

        while (codigoExiste && tentativas < MAX_TENTATIVAS) {
          novoCodigo = gerarCodigoGrupo();
          codigoExiste = await verificarCodigoExistente(novoCodigo);
          tentativas++;
        }

        // Atualizar no Supabase e no armazenamento local de persistência
        const atualizado = await atualizarCodigoGrupo(grupo.id, novoCodigo);

        if (atualizado) {
          // Definir como permanente
          localStorage.setItem(`grupo_codigo_gerado_${grupo.id}`, "true");
          localStorage.setItem(`codigo_permanente_${novoCodigo}`, grupo.id);

          setGrupoAtualizado(prev => ({
            ...prev,
            codigo: novoCodigo
          }));

          mostrarNotificacao("sucesso", "Código único gerado com sucesso! Este código é permanente.");
        } else {
          mostrarNotificacao("info", "O código não pôde ser atualizado pois já existe um código permanente.");
        }
      }
    } catch (error) {
      console.error("Erro ao gerar/recuperar código único para grupo:", error);
      mostrarNotificacao("erro", "Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Função para alternar a visibilidade do grupo (público/privado)
  const handleVisibilidadeChange = (checked: boolean) => {
    setGrupoAtualizado(prev => ({
      ...prev,
      privado: checked,
      visibilidade: checked 
        ? "Privado (apenas por convite)" 
        : "Público (qualquer um pode ver e solicitar participação)"
    }));
  };

  // Função para salvar as alterações
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!grupo?.id) {
        toast({
          title: "Erro",
          description: "ID do grupo não encontrado",
          variant: "destructive",
        });
        return;
      }

      // Preparar dados atualizados
      const dadosAtualizados = {
        nome: grupoAtualizado.nome,
        descricao: grupoAtualizado.descricao,
        privado: grupoAtualizado.privado,
        visibilidade: grupoAtualizado.visibilidade,
        codigo: grupoAtualizado.codigo,
        topico: grupoAtualizado.topico,
      };

      // Validação básica
      if (!dadosAtualizados.nome?.trim()) {
        toast({
          title: "Erro",
          description: "O nome do grupo é obrigatório",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Atualizar no Supabase
      const { error } = await supabase
        .from('grupos_estudo')
        .update(dadosAtualizados)
        .eq('id', grupo.id);

      if (error) {
        console.error("Erro ao atualizar grupo:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao salvar as alterações. Tente novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Configurações do grupo atualizadas com sucesso!",
        });

        // Atualizar o grupo original com as alterações
        onSave({...grupo, ...dadosAtualizados});

        // Fechar o modal
        onClose();
      }
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 bg-[#0F172A] text-white overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#0F172A] to-[#0F172A] border-b border-[#1E293B] p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center">
              <Settings className="h-6 w-6 mr-3 text-[#FF6B00]" />
              Configurações do Grupo
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Personalize as configurações e acesso ao grupo de estudos
            </DialogDescription>
          </DialogHeader>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-9 w-9 rounded-full text-white/80 hover:text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto">
          <div className="p-6">
            <Tabs defaultValue="geral" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 gap-2 mb-6 bg-transparent">
                <TabsTrigger 
                  value="geral" 
                  className={`${activeTab === "geral" ? "bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]" : "bg-[#1E293B] text-white/70 border-[#1E293B]"} border px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#1E293B]/80 transition-colors`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Geral</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="privacidade" 
                  className={`${activeTab === "privacidade" ? "bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]" : "bg-[#1E293B] text-white/70 border-[#1E293B]"} border px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#1E293B]/80 transition-colors`}
                >
                  <Lock className="h-4 w-4" />
                  <span>Privacidade</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="membros" 
                  className={`${activeTab === "membros" ? "bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]" : "bg-[#1E293B] text-white/70 border-[#1E293B]"} border px-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#1E293B]/80 transition-colors`}
                >
                  <Users className="h-4 w-4" />
                  <span>Membros</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="geral" className="space-y-4">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-white/70 mb-1">
                    Nome do Grupo <span className="text-[#FF6B00]">*</span>
                  </label>
                  <Input
                    id="nome"
                    value={grupoAtualizado.nome || ""}
                    onChange={(e) => setGrupoAtualizado(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome do grupo de estudos"
                    className="w-full border-[#1E293B] bg-[#0F172A] text-white placeholder:text-gray-500 focus:border-[#FF6B00]"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="descricao" className="block text-sm font-medium text-white/70 mb-1">
                    Descrição
                  </label>
                  <Textarea
                    id="descricao"
                    value={grupoAtualizado.descricao || ""}
                    onChange={(e) => setGrupoAtualizado(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descreva o propósito do grupo, temas de estudo, etc."
                    className="min-h-[100px] border-[#1E293B] bg-[#0F172A] text-white placeholder:text-gray-500 focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label htmlFor="topico" className="block text-sm font-medium text-white/70 mb-1">
                    Tópico/Área de Estudo
                  </label>
                  <Input
                    id="topico"
                    value={grupoAtualizado.topico || ""}
                    onChange={(e) => setGrupoAtualizado(prev => ({ ...prev, topico: e.target.value }))}
                    placeholder="Ex: Matemática, Física, Programação, etc."
                    className="w-full border-[#1E293B] bg-[#0F172A] text-white placeholder:text-gray-500 focus:border-[#FF6B00]"
                  />
                </div>

                <div className="bg-[#1E293B]/50 rounded-lg p-4 border border-[#1E293B] mt-6">
                  <div className="flex flex-col space-y-1.5">
                    <h3 className="text-sm font-medium text-white flex items-center">
                      Código Único do Grupo
                    </h3>

                    {notificacao && (
                      <Alert 
                        className={`my-2 py-2 ${
                          notificacao.tipo === "sucesso" 
                            ? "bg-green-900/20 text-green-400 border-green-900" 
                            : notificacao.tipo === "erro" 
                            ? "bg-red-900/20 text-red-400 border-red-900"
                            : "bg-blue-900/20 text-blue-400 border-blue-900"
                        }`}
                      >
                        <AlertDescription>{notificacao.mensagem}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      {(grupo?.codigo || grupoAtualizado.codigo) ? (
                        <>
                          <div className="bg-[#1E293B] rounded px-3 py-2 font-mono text-white tracking-wider flex-1 text-center uppercase">
                            {grupo?.codigo || grupoAtualizado.codigo}
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="h-10 w-10 border-[#1E293B] text-white hover:bg-[#1E293B]"
                            onClick={handleCopyCode}
                          >
                            {isCopied ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="bg-[#1E293B] rounded px-3 py-2 font-mono text-gray-500 flex-1 text-center">
                            Nenhum código gerado
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-[#1E293B] text-white hover:bg-[#1E293B]"
                            onClick={handleGerarCodigo}
                            disabled={isGeneratingCode}
                          >
                            {isGeneratingCode ? (
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            Gerar Código
                          </Button>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 mt-1">
                      Este código permite que outros usuários encontrem e entrem no grupo facilmente.
                      O código é permanente e não pode ser alterado depois de gerado.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="privacidade" className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#1E293B]/50 rounded-lg border border-[#1E293B]">
                  <div className="flex-1">
                    <div className="flex items-center">
                      {grupoAtualizado.privado ? (
                        <EyeOff className="h-5 w-5 text-[#FF6B00] mr-2" />
                      ) : (
                        <Eye className="h-5 w-5 text-[#FF6B00] mr-2" />
                      )}
                      <h4 className="text-sm font-medium text-white">
                        {grupoAtualizado.privado ? "Grupo Privado" : "Grupo Público"}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {grupoAtualizado.privado 
                        ? "Somente pessoas convidadas ou com o código do grupo podem ingressar."
                        : "Qualquer pessoa pode encontrar e solicitar acesso ao grupo."}
                    </p>
                  </div>
                  <Switch
                    checked={grupoAtualizado.privado || false}
                    onCheckedChange={handleVisibilidadeChange}
                    className="data-[state=checked]:bg-[#FF6B00]"
                  />
                </div>

                {grupoAtualizado.privado && (
                  <div className="space-y-3 bg-[#1E293B]/30 rounded-lg p-4 border border-[#1E293B]">
                    <div>
                      <Label htmlFor="visibilidade" className="text-sm font-medium text-white/70">
                        Tipo de acesso
                      </Label>
                      <p className="text-xs text-gray-400 mb-2">
                        Como os novos membros podem entrar no grupo:
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="apenas-convite"
                            name="visibilidade"
                            className="h-4 w-4 rounded-full border-[#1E293B] text-[#FF6B00]"
                            checked={grupoAtualizado.visibilidade === "Privado (apenas por convite)"}
                            onChange={() => setGrupoAtualizado(prev => ({
                              ...prev,
                              visibilidade: "Privado (apenas por convite)"
                            }))}
                          />
                          <label htmlFor="apenas-convite" className="ml-2 text-sm text-white">
                            Apenas por convite direto
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="codigo-convite"
                            name="visibilidade"
                            className="h-4 w-4 rounded-full border-[#1E293B] text-[#FF6B00]"
                            checked={grupoAtualizado.visibilidade === "Privado (com código de convite)"}
                            onChange={() => setGrupoAtualizado(prev => ({
                              ...prev,
                              visibilidade: "Privado (com código de convite)"
                            }))}
                          />
                          <label htmlFor="codigo-convite" className="ml-2 text-sm text-white">
                            Com código de convite
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="membros" className="space-y-4">
                <div className="bg-[#1E293B]/50 rounded-lg p-4 border border-[#1E293B] space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white flex items-center">
                      <Users className="h-4 w-4 mr-2 text-[#FF6B00]" />
                      Membros do Grupo
                    </h3>
                    <span className="text-xs text-gray-400">
                      {grupo?.membros || 1} {(grupo?.membros || 1) === 1 ? "membro" : "membros"}
                    </span>
                  </div>

                  <p className="text-sm text-gray-400">
                    A funcionalidade de gerenciamento de membros estará disponível em breve.
                    Nesta área você poderá adicionar, remover e gerenciar permissões dos membros.
                  </p>

                  <div className="flex justify-center mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled
                      className="border-[#1E293B] text-white/70 hover:bg-[#1E293B]"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Gerenciar Membros
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

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
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Settings className="h-4 w-4 mr-2" />
                )}
                Salvar Configurações
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GrupoConfiguracoesModal;