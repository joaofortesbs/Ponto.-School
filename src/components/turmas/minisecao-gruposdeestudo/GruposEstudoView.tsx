
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Plus, MessageCircle, Filter, BookOpen, Calculator, Atom, FlaskConical, Dna, MapPin, Globe, Languages } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Grupo {
  id: string;
  nome: string;
  descricao?: string;
  codigo_unico: string;
  membros: number;
  cor: string;
  topico?: string;
  topico_icon?: string;
  created_at: string;
}

export default function GruposEstudoView() {
  const [meusGrupos, setMeusGrupos] = useState<Grupo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const { toast } = useToast();

  const topicosEstudo = [
    { nome: "Matemática", icon: Calculator, cor: "#3B82F6", count: 15 },
    { nome: "Física", icon: Atom, cor: "#8B5CF6", count: 12 },
    { nome: "Química", icon: FlaskConical, cor: "#EF4444", count: 9 },
    { nome: "Biologia", icon: Dna, cor: "#10B981", count: 18 },
    { nome: "História", icon: BookOpen, cor: "#F59E0B", count: 7 },
    { nome: "Geografia", icon: Globe, cor: "#06B6D4", count: 6 },
    { nome: "Literatura", icon: BookOpen, cor: "#EC4899", count: 11 },
    { nome: "Inglês", icon: Languages, cor: "#6366F1", count: 14 }
  ];

  useEffect(() => {
    carregarMeusGrupos();
  }, []);

  const carregarMeusGrupos = async () => {
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

      // Buscar grupos onde o usuário é criador ou membro
      const { data: grupos, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setMeusGrupos(grupos || []);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar seus grupos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = meusGrupos.filter(grupo => 
    grupo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grupo.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateGroup = () => {
    toast({
      title: "Em desenvolvimento",
      description: "Modal de criação de grupos será implementado em breve",
    });
  };

  const getTopicIcon = (topicName: string) => {
    const topic = topicosEstudo.find(t => t.nome === topicName);
    return topic?.icon || BookOpen;
  };

  return (
    <Card className="w-full bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 border-slate-700/50 shadow-2xl">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              Grupos de Estudo
            </CardTitle>
            <p className="text-slate-400 text-sm">
              Conecte-se e aprenda com seus colegas
            </p>
          </div>
          <Button
            onClick={handleCreateGroup}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Novo Grupo
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Seção de Busca */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar grupo de estudos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <Filter className="h-4 w-4" />
            Filtrar
          </Button>
        </div>

        {/* Meus Grupos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            Meus Grupos
          </h3>
          
          <div className="min-h-[200px]">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  Carregando grupos...
                </div>
              </div>
            ) : filteredGroups.length > 0 ? (
              <div className="grid gap-4">
                {filteredGroups.map((grupo) => {
                  const IconComponent = getTopicIcon(grupo.topico || '');
                  return (
                    <div
                      key={grupo.id}
                      className="group p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/30 border border-slate-600/50 rounded-xl hover:border-blue-500/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-blue-500/10"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div 
                            className="p-2 rounded-lg text-white flex-shrink-0"
                            style={{ backgroundColor: grupo.cor }}
                          >
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white text-sm group-hover:text-blue-400 transition-colors">
                              {grupo.nome}
                            </h4>
                            {grupo.descricao && (
                              <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                                {grupo.descricao}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                                {grupo.membros} {grupo.membros === 1 ? 'membro' : 'membros'}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                Código: {grupo.codigo_unico}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center space-y-3">
                <div className="p-4 bg-slate-800/50 rounded-full">
                  <Users className="h-8 w-8 text-slate-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-slate-300 font-medium">Nenhum grupo criado ainda</p>
                  <p className="text-slate-500 text-sm">
                    Crie seu primeiro grupo de estudos para começar
                  </p>
                </div>
                <Button
                  onClick={handleCreateGroup}
                  variant="outline"
                  size="sm"
                  className="mt-2 border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
                >
                  Criar primeiro grupo
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tópicos de Estudo */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              Tópicos de Estudo
            </h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {topicosEstudo.map((topico) => {
              const IconComponent = topico.icon;
              return (
                <div
                  key={topico.nome}
                  className="group p-3 bg-gradient-to-br from-slate-800/60 to-slate-700/40 border border-slate-600/30 rounded-xl hover:border-blue-500/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div 
                      className="p-2 rounded-lg text-white group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: topico.cor }}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm group-hover:text-blue-400 transition-colors">
                        {topico.nome}
                      </p>
                      <p className="text-xs text-slate-400">
                        {topico.count} grupos
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-blue-500"
            >
              Ver todos os tópicos
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
