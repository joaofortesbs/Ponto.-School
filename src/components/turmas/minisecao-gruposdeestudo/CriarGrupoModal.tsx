
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Hash } from "lucide-react";

interface CriarGrupoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGrupoCriado: () => void;
}

export default function CriarGrupoModal({ isOpen, onClose, onGrupoCriado }: CriarGrupoModalProps) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [isPublico, setIsPublico] = useState(false);
  const [cor, setCor] = useState("#FF6B00");
  const [codigoUnico, setCodigoUnico] = useState("");
  const [gruposPublicos, setGruposPublicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [buscarLoading, setBuscarLoading] = useState(false);
  const { toast } = useToast();

  const cores = [
    "#FF6B00", "#3B82F6", "#8B5CF6", "#EF4444", 
    "#10B981", "#F59E0B", "#06B6D4", "#EC4899"
  ];

  const gerarCodigoUnico = () => {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const criarGrupo = async () => {
    if (!nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome do grupo é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado",
          variant: "destructive"
        });
        return;
      }

      const codigoFinal = gerarCodigoUnico();
      
      const { data: grupo, error: grupoError } = await supabase
        .from('grupos_estudo')
        .insert({
          nome: nome.trim(),
          descricao: descricao.trim() || null,
          user_id: user.id,
          is_publico: isPublico,
          cor,
          codigo_unico: codigoFinal,
          membros: 1
        })
        .select()
        .single();

      if (grupoError) throw grupoError;

      // Adicionar criador como membro
      const { error: membroError } = await supabase
        .from('membros_grupos')
        .insert({
          grupo_id: grupo.id,
          user_id: user.id
        });

      if (membroError) throw membroError;

      toast({
        title: "Sucesso",
        description: `Grupo "${nome}" criado com sucesso! Código: ${codigoFinal}`
      });

      // Reset form
      setNome("");
      setDescricao("");
      setIsPublico(false);
      setCor("#FF6B00");
      
      onGrupoCriado();
      onClose();
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar grupo de estudos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const buscarGruposPublicos = async () => {
    try {
      setBuscarLoading(true);
      const { data, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('is_publico', true)
        .limit(10);

      if (error) throw error;
      setGruposPublicos(data || []);
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar grupos públicos",
        variant: "destructive"
      });
    } finally {
      setBuscarLoading(false);
    }
  };

  const adicionarPorCodigo = async () => {
    if (!codigoUnico.trim()) {
      toast({
        title: "Erro",
        description: "Digite o código do grupo",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar grupo pelo código
      const { data: grupo, error: grupoError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('codigo_unico', codigoUnico.trim().toUpperCase())
        .single();

      if (grupoError || !grupo) {
        toast({
          title: "Erro",
          description: "Grupo não encontrado",
          variant: "destructive"
        });
        return;
      }

      // Verificar se já é membro
      const { data: membro } = await supabase
        .from('membros_grupos')
        .select('*')
        .eq('grupo_id', grupo.id)
        .eq('user_id', user.id)
        .single();

      if (membro) {
        toast({
          title: "Aviso",
          description: "Você já é membro deste grupo",
          variant: "destructive"
        });
        return;
      }

      // Adicionar como membro
      const { error: membroError } = await supabase
        .from('membros_grupos')
        .insert({
          grupo_id: grupo.id,
          user_id: user.id
        });

      if (membroError) throw membroError;

      toast({
        title: "Sucesso",
        description: `Você foi adicionado ao grupo "${grupo.nome}"!`
      });

      setCodigoUnico("");
      onGrupoCriado();
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar por código:', error);
      toast({
        title: "Erro",
        description: "Erro ao se juntar ao grupo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const participarGrupoPublico = async (grupoId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('membros_grupos')
        .insert({
          grupo_id: grupoId,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Você foi adicionado ao grupo!"
      });

      onGrupoCriado();
      onClose();
    } catch (error) {
      console.error('Erro ao participar do grupo:', error);
      toast({
        title: "Erro",
        description: "Erro ao se juntar ao grupo",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Grupo de Estudos</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="criar" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="criar">Criar</TabsTrigger>
            <TabsTrigger value="buscar" onClick={buscarGruposPublicos}>Buscar</TabsTrigger>
            <TabsTrigger value="codigo">Código</TabsTrigger>
          </TabsList>

          <TabsContent value="criar" className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome do Grupo</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite o nome do grupo"
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o objetivo do grupo"
                rows={3}
              />
            </div>

            <div>
              <Label>Cor do Grupo</Label>
              <div className="flex gap-2 mt-2">
                {cores.map((corOption) => (
                  <button
                    key={corOption}
                    onClick={() => setCor(corOption)}
                    className={`w-6 h-6 rounded-full border-2 ${
                      cor === corOption ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: corOption }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="publico"
                checked={isPublico}
                onCheckedChange={setIsPublico}
              />
              <Label htmlFor="publico">Grupo Público</Label>
            </div>

            <Button 
              onClick={criarGrupo} 
              className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90"
              disabled={loading}
            >
              {loading ? "Criando..." : "Criar Grupo"}
            </Button>
          </TabsContent>

          <TabsContent value="buscar" className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-[#64748B]">
              <Search className="h-4 w-4" />
              Grupos públicos disponíveis
            </div>
            
            {buscarLoading ? (
              <p>Carregando grupos...</p>
            ) : gruposPublicos.length === 0 ? (
              <p className="text-center text-[#64748B]">Nenhum grupo público encontrado</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {gruposPublicos.map((grupo) => (
                  <div key={grupo.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{grupo.nome}</h4>
                        {grupo.descricao && (
                          <p className="text-xs text-[#64748B]">{grupo.descricao}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => participarGrupoPublico(grupo.id)}
                        className="bg-[#FF6B00] hover:bg-[#FF6B00]/90"
                      >
                        Participar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="codigo" className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-[#64748B]">
              <Hash className="h-4 w-4" />
              Adicionar via código único
            </div>
            
            <div>
              <Label htmlFor="codigo">Código do Grupo</Label>
              <Input
                id="codigo"
                value={codigoUnico}
                onChange={(e) => setCodigoUnico(e.target.value)}
                placeholder="Digite o código único do grupo"
                className="uppercase"
              />
            </div>

            <Button 
              onClick={adicionarPorCodigo} 
              className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90"
              disabled={loading}
            >
              {loading ? "Adicionando..." : "Adicionar ao Grupo"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
