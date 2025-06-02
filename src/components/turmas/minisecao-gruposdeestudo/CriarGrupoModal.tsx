
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Hash, Users, BookOpen, Calculator, Atom, FlaskConical, Dna, Globe, Languages } from "lucide-react";

interface CriarGrupoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGrupoCriado: () => void;
}

interface Grupo {
  id: string;
  nome: string;
  descricao?: string;
  codigo_unico: string;
  membros: number;
  cor: string;
  topico?: string;
  is_publico: boolean;
}

export default function CriarGrupoModal({ isOpen, onClose, onGrupoCriado }: CriarGrupoModalProps) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [isPublico, setIsPublico] = useState(false);
  const [cor, setCor] = useState("#FF6B00");
  const [codigoUnico, setCodigoUnico] = useState("");
  const [gruposPublicos, setGruposPublicos] = useState<Grupo[]>([]);
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

      if (grupoError) {
        console.error('Erro ao criar grupo:', grupoError);
        throw grupoError;
      }

      // Adicionar criador como membro
      const { error: membroError } = await supabase
        .from('membros_grupos')
        .insert({
          grupo_id: grupo.id,
          user_id: user.id
        });

      if (membroError) {
        console.error('Erro ao adicionar membro:', membroError);
        throw membroError;
      }

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

  useEffect(() => {
    if (isOpen) {
      buscarGruposPublicos();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 border-slate-700/50 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Adicionar Grupo de Estudos
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="criar" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="criar" className="data-[state=active]:bg-orange-500">Criar</TabsTrigger>
            <TabsTrigger value="buscar" onClick={buscarGruposPublicos} className="data-[state=active]:bg-orange-500">Buscar</TabsTrigger>
            <TabsTrigger value="codigo" className="data-[state=active]:bg-orange-500">Código</TabsTrigger>
          </TabsList>

          <TabsContent value="criar" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Grupo</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite o nome do grupo"
                className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o grupo (opcional)"
                className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label>Cor do Grupo</Label>
              <div className="flex gap-2">
                {cores.map((corOption) => (
                  <button
                    key={corOption}
                    onClick={() => setCor(corOption)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      cor === corOption ? 'border-white' : 'border-transparent'
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
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {loading ? "Criando..." : "Criar Grupo"}
            </Button>
          </TabsContent>

          <TabsContent value="buscar" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Search className="h-4 w-4" />
                Grupos Públicos Disponíveis
              </div>
              {buscarLoading ? (
                <div className="text-center py-8 text-slate-400">
                  Carregando grupos...
                </div>
              ) : gruposPublicos.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {gruposPublicos.map((grupo) => (
                    <div
                      key={grupo.id}
                      className="p-3 bg-slate-800/50 rounded-lg border border-slate-600/50 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-medium text-white">{grupo.nome}</h4>
                        {grupo.descricao && (
                          <p className="text-sm text-slate-400">{grupo.descricao}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {grupo.membros} membros
                          </Badge>
                        </div>
                      </div>
                      <Button
                        onClick={() => participarGrupoPublico(grupo.id)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Participar
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  Nenhum grupo público encontrado
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="codigo" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código do Grupo</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="codigo"
                    value={codigoUnico}
                    onChange={(e) => setCodigoUnico(e.target.value.toUpperCase())}
                    placeholder="Digite o código único"
                    className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                  />
                </div>
                <Button
                  onClick={adicionarPorCodigo}
                  disabled={loading}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  {loading ? "Adicionando..." : "Adicionar"}
                </Button>
              </div>
              <p className="text-xs text-slate-400">
                Digite o código único do grupo para se juntar
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
