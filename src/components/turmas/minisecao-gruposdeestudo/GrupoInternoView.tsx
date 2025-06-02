
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, Users, Hash, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Grupo {
  id: string;
  nome: string;
  descricao?: string;
  codigo_unico: string;
  membros: number;
  cor: string;
  user_id: string;
}

interface Mensagem {
  id: string;
  mensagem: string;
  user_id: string;
  created_at: string;
}

interface Membro {
  id: string;
  user_id: string;
  joined_at: string;
}

interface GrupoInternoViewProps {
  grupo: Grupo;
  onVoltar: () => void;
}

export default function GrupoInternoView({ grupo, onVoltar }: GrupoInternoViewProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [membros, setMembros] = useState<Membro[]>([]);
  const [loading, setLoading] = useState(false);
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  useEffect(() => {
    carregarDadosGrupo();
    // Set up real-time subscription for messages
    const channel = supabase
      .channel(`grupo-${grupo.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens_grupos',
          filter: `grupo_id=eq.${grupo.id}`
        },
        (payload) => {
          const novaMensagem = payload.new as Mensagem;
          setMensagens(prev => [...prev, novaMensagem]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [grupo.id]);

  const carregarDadosGrupo = async () => {
    try {
      setLoading(true);
      
      // Carregar mensagens
      const { data: mensagensData, error: mensagensError } = await supabase
        .from('mensagens_grupos')
        .select('*')
        .eq('grupo_id', grupo.id)
        .order('created_at', { ascending: true });

      if (mensagensError) throw mensagensError;
      setMensagens(mensagensData || []);

      // Carregar membros
      const { data: membrosData, error: membrosError } = await supabase
        .from('membros_grupos')
        .select('*')
        .eq('grupo_id', grupo.id);

      if (membrosError) throw membrosError;
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
      setEnviandoMensagem(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado",
          variant: "destructive"
        });
        return;
      }

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
    } finally {
      setEnviandoMensagem(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  const formatarTempo = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const obterIniciais = (userId: string) => {
    // Simplified user initials from user ID
    return userId.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <Card className="w-full bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 border-slate-700/50 shadow-2xl">
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            Carregando grupo...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 border-slate-700/50 shadow-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={onVoltar}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg text-white flex-shrink-0"
                style={{ backgroundColor: grupo.cor }}
              >
                <Hash className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-white">
                  {grupo.nome}
                </CardTitle>
                {grupo.descricao && (
                  <p className="text-slate-400 text-sm">
                    {grupo.descricao}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
              <Users className="h-3 w-3 mr-1" />
              {membros.length} {membros.length === 1 ? 'membro' : 'membros'}
            </Badge>
            <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
              {grupo.codigo_unico}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Chat Area */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-600/50 h-96 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {mensagens.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div className="text-slate-400">
                  <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">Seja o primeiro a falar!</p>
                  <p className="text-sm">Comece uma conversa neste grupo</p>
                </div>
              </div>
            ) : (
              mensagens.map((mensagem) => (
                <div key={mensagem.id} className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                      {obterIniciais(mensagem.user_id)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">
                        {obterIniciais(mensagem.user_id)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatarTempo(mensagem.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 break-words">
                      {mensagem.mensagem}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-slate-600/50 p-4">
            <div className="flex gap-2">
              <Input
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Mensagem para #${grupo.nome}`}
                className="flex-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                disabled={enviandoMensagem}
              />
              <Button
                onClick={enviarMensagem}
                disabled={enviandoMensagem || !novaMensagem.trim()}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                size="sm"
              >
                {enviandoMensagem ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Group Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/50">
            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Membros ({membros.length})
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {membros.map((membro) => (
                <div key={membro.id} className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                      {obterIniciais(membro.user_id)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-slate-300">
                    {obterIniciais(membro.user_id)}
                  </span>
                  {membro.user_id === grupo.user_id && (
                    <Badge variant="outline" className="text-xs border-orange-500 text-orange-400">
                      Criador
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/50">
            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Informações do Grupo
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Código:</span>
                <span className="text-slate-300 font-mono">{grupo.codigo_unico}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Membros:</span>
                <span className="text-slate-300">{membros.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mensagens:</span>
                <span className="text-slate-300">{mensagens.length}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
