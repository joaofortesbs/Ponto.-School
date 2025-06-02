
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Send, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Grupo {
  id: string;
  nome: string;
  descricao?: string;
  codigo_unico: string;
  user_id: string;
  is_publico: boolean;
  cor: string;
  membros: number;
  created_at: string;
}

interface Mensagem {
  id: string;
  mensagem: string;
  user_id: string;
  created_at: string;
}

interface Membro {
  user_id: string;
  joined_at: string;
}

interface GrupoInterfaceProps {
  grupo: Grupo;
  onVoltar: () => void;
}

export default function GrupoInterface({ grupo, onVoltar }: GrupoInterfaceProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    carregarDados();
    
    // Configurar realtime para mensagens
    const channel = supabase
      .channel('mensagens-grupo')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensagens_grupos',
        filter: `grupo_id=eq.${grupo.id}`
      }, (payload) => {
        setMensagens(prev => [...prev, payload.new as Mensagem]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [grupo.id]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar mensagens
      const { data: mensagensData, error: mensagensError } = await supabase
        .from('mensagens_grupos')
        .select('*')
        .eq('grupo_id', grupo.id)
        .order('created_at', { ascending: true });

      if (mensagensError) throw mensagensError;

      // Carregar membros
      const { data: membrosData, error: membrosError } = await supabase
        .from('membros_grupos')
        .select('*')
        .eq('grupo_id', grupo.id);

      if (membrosError) throw membrosError;

      setMensagens(mensagensData || []);
      setMembros(membrosData || []);
    } catch (error) {
      console.error('Erro ao carregar dados do grupo:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do grupo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('mensagens_grupos')
        .insert({
          grupo_id: grupo.id,
          user_id: user.id,
          mensagem: novaMensagem.trim()
        });

      if (error) throw error;

      setNovaMensagem("");
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem",
        variant: "destructive"
      });
    }
  };

  const copiarCodigo = () => {
    navigator.clipboard.writeText(grupo.codigo_unico);
    toast({
      title: "Sucesso",
      description: "Código copiado para a área de transferência!"
    });
  };

  const formatarData = (dataStr: string) => {
    const data = new Date(dataStr);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserDisplayName = (userId: string) => {
    // Por enquanto, retorna apenas uma parte do ID do usuário
    // Você pode expandir isso para buscar nomes reais dos usuários
    return `Usuário ${userId.substring(0, 8)}`;
  };

  if (loading) {
    return (
      <Card className="w-full bg-white dark:bg-[#0A2540] border-[#E0E1DD] dark:border-white/10">
        <CardContent className="p-8 text-center">
          <p className="text-[#64748B] dark:text-white/60">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white dark:bg-[#0A2540] border-[#E0E1DD] dark:border-white/10">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onVoltar}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: grupo.cor }}
          />
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-[#29335C] dark:text-white">
              {grupo.nome}
            </CardTitle>
            {grupo.descricao && (
              <p className="text-sm text-[#64748B] dark:text-white/60">
                {grupo.descricao}
              </p>
            )}
          </div>
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {membros.length} membros
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informações do Grupo */}
        <div className="flex items-center gap-2 p-3 bg-[#E0E1DD]/20 dark:bg-white/5 rounded-lg">
          <span className="text-sm text-[#64748B] dark:text-white/60">
            Código do grupo:
          </span>
          <code className="font-mono text-sm bg-white dark:bg-[#0A2540] px-2 py-1 rounded border">
            {grupo.codigo_unico}
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={copiarCodigo}
            className="p-1"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>

        {/* Chat */}
        <div className="space-y-3">
          <h4 className="font-medium text-[#29335C] dark:text-white">
            Conversas do Grupo
          </h4>
          
          {/* Área de Mensagens */}
          <div className="h-60 overflow-y-auto border border-[#E0E1DD] dark:border-white/10 rounded-lg p-3 space-y-2">
            {mensagens.length === 0 ? (
              <p className="text-center text-[#64748B] dark:text-white/60 py-8">
                Nenhuma mensagem ainda. Seja o primeiro a enviar uma mensagem!
              </p>
            ) : (
              mensagens.map((mensagem) => (
                <div key={mensagem.id} className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-white/60">
                    <span className="font-medium">
                      {getUserDisplayName(mensagem.user_id)}
                    </span>
                    <span>•</span>
                    <span>{formatarData(mensagem.created_at)}</span>
                  </div>
                  <p className="text-sm text-[#29335C] dark:text-white">
                    {mensagem.mensagem}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Input de Nova Mensagem */}
          <div className="flex gap-2">
            <Input
              value={novaMensagem}
              onChange={(e) => setNovaMensagem(e.target.value)}
              placeholder="Digite uma mensagem..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  enviarMensagem();
                }
              }}
              className="flex-1"
            />
            <Button
              onClick={enviarMensagem}
              className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
              size="sm"
              disabled={!novaMensagem.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Lista de Membros */}
        <div className="space-y-2">
          <h4 className="font-medium text-[#29335C] dark:text-white">
            Membros ({membros.length})
          </h4>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {membros.map((membro, index) => (
              <div key={index} className="text-sm text-[#64748B] dark:text-white/60">
                {getUserDisplayName(membro.user_id)}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
