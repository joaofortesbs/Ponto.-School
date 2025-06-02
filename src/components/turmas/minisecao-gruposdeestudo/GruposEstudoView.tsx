
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Plus, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CriarGrupoModal from "./CriarGrupoModal";
import GrupoInterface from "./GrupoInterface";

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

export default function GruposEstudoView() {
  const [meusGrupos, setMeusGrupos] = useState<Grupo[]>([]);
  const [gruposPublicos, setGruposPublicos] = useState<Grupo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [grupoSelecionado, setGrupoSelecionado] = useState<Grupo | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const tópicosEstudo = [
    { nome: "Matemática", icon: "📐", cor: "#3B82F6" },
    { nome: "Física", icon: "⚛️", cor: "#8B5CF6" },
    { nome: "Química", icon: "🧪", cor: "#EF4444" },
    { nome: "Biologia", icon: "🧬", cor: "#10B981" },
    { nome: "História", icon: "📚", cor: "#F59E0B" },
    { nome: "Geografia", icon: "🌍", cor: "#06B6D4" },
    { nome: "Literatura", icon: "📖", cor: "#EC4899" },
    { nome: "Inglês", icon: "🇺🇸", cor: "#6366F1" }
  ];

  useEffect(() => {
    carregarGrupos();
  }, []);

  const carregarGrupos = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para ver os grupos",
          variant: "destructive"
        });
        return;
      }

      // Carregar meus grupos (onde sou criador ou membro)
      const { data: meusGruposData, error: meusGruposError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .or(`user_id.eq.${user.id},id.in.(${await getMembrosGruposIds(user.id)})`);

      if (meusGruposError) throw meusGruposError;

      // Carregar grupos públicos
      const { data: gruposPublicosData, error: gruposPublicosError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('is_publico', true)
        .neq('user_id', user.id);

      if (gruposPublicosError) throw gruposPublicosError;

      setMeusGrupos(meusGruposData || []);
      setGruposPublicos(gruposPublicosData || []);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar grupos de estudo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getMembrosGruposIds = async (userId: string) => {
    const { data } = await supabase
      .from('membros_grupos')
      .select('grupo_id')
      .eq('user_id', userId);
    
    return data?.map(m => m.grupo_id).join(',') || '';
  };

  const filteredGruposPublicos = gruposPublicos.filter(grupo =>
    grupo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grupo.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adicionarAoGrupo = async (grupoId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('membros_grupos')
        .insert({ grupo_id: grupoId, user_id: user.id });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Você foi adicionado ao grupo!"
      });

      carregarGrupos();
    } catch (error) {
      console.error('Erro ao adicionar ao grupo:', error);
      toast({
        title: "Erro",
        description: "Erro ao se juntar ao grupo",
        variant: "destructive"
      });
    }
  };

  if (grupoSelecionado) {
    return (
      <GrupoInterface 
        grupo={grupoSelecionado} 
        onVoltar={() => setGrupoSelecionado(null)}
      />
    );
  }

  return (
    <Card className="w-full bg-white dark:bg-[#0A2540] border-[#E0E1DD] dark:border-white/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-[#29335C] dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-[#FF6B00]" />
              Grupos de Estudo
            </CardTitle>
            <p className="text-sm text-[#64748B] dark:text-white/60 mt-1">
              Conecte-se e aprenda com seus colegas
            </p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Novo Grupo
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Seção de Busca */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B] h-4 w-4" />
            <Input
              placeholder="Buscar grupos públicos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border-[#E0E1DD] dark:border-white/20"
            />
          </div>
        </div>

        {/* Meus Grupos */}
        <div>
          <h3 className="font-semibold text-[#29335C] dark:text-white mb-3">
            Meus Grupos ({meusGrupos.length})
          </h3>
          {loading ? (
            <p className="text-[#64748B] dark:text-white/60">Carregando...</p>
          ) : meusGrupos.length === 0 ? (
            <p className="text-[#64748B] dark:text-white/60">
              Nenhum grupo criado ainda. Crie seu primeiro grupo de estudos para começar.
            </p>
          ) : (
            <div className="grid gap-3">
              {meusGrupos.map((grupo) => (
                <div
                  key={grupo.id}
                  onClick={() => setGrupoSelecionado(grupo)}
                  className="p-3 border border-[#E0E1DD] dark:border-white/10 rounded-lg hover:bg-[#E0E1DD]/20 dark:hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: grupo.cor }}
                      />
                      <div>
                        <h4 className="font-medium text-[#29335C] dark:text-white">
                          {grupo.nome}
                        </h4>
                        {grupo.descricao && (
                          <p className="text-xs text-[#64748B] dark:text-white/60">
                            {grupo.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {grupo.membros} membros
                      </Badge>
                      <MessageCircle className="h-4 w-4 text-[#64748B]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Grupos Públicos */}
        {filteredGruposPublicos.length > 0 && (
          <div>
            <h3 className="font-semibold text-[#29335C] dark:text-white mb-3">
              Grupos Públicos ({filteredGruposPublicos.length})
            </h3>
            <div className="grid gap-3 max-h-60 overflow-y-auto">
              {filteredGruposPublicos.map((grupo) => (
                <div
                  key={grupo.id}
                  className="p-3 border border-[#E0E1DD] dark:border-white/10 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: grupo.cor }}
                      />
                      <div>
                        <h4 className="font-medium text-[#29335C] dark:text-white">
                          {grupo.nome}
                        </h4>
                        {grupo.descricao && (
                          <p className="text-xs text-[#64748B] dark:text-white/60">
                            {grupo.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => adicionarAoGrupo(grupo.id)}
                      size="sm"
                      className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                    >
                      Participar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tópicos de Estudo */}
        <div>
          <h3 className="font-semibold text-[#29335C] dark:text-white mb-3">
            Tópicos de Estudo
          </h3>
          <div className="flex flex-wrap gap-2">
            {tópicosEstudo.map((tópico) => (
              <Badge
                key={tópico.nome}
                variant="outline"
                className="cursor-pointer hover:bg-[#E0E1DD]/20 dark:hover:bg-white/5 transition-colors"
                style={{ borderColor: tópico.cor, color: tópico.cor }}
              >
                <span className="mr-1">{tópico.icon}</span>
                {tópico.nome}
              </Badge>
            ))}
          </div>
          <Button variant="ghost" className="mt-3 text-[#64748B] hover:text-[#29335C]">
            Ver todos os tópicos
          </Button>
        </div>
      </CardContent>

      <CriarGrupoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGrupoCriado={carregarGrupos}
      />
    </Card>
  );
}
