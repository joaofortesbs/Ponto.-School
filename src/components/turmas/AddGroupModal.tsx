
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Search, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AddGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupAdded: () => void;
}

const AddGroupModal: React.FC<AddGroupModalProps> = ({
  isOpen,
  onClose,
  onGroupAdded,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [publicGroups, setPublicGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchPublicGroups = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('is_publico', true)
        .ilike('nome', `%${searchQuery}%`)
        .limit(10);

      if (error) {
        console.error('Erro ao buscar grupos:', error);
        return;
      }

      setPublicGroups(data || []);
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const joinGroupByCode = async () => {
    if (!codeInput.trim()) {
      alert('Digite um código válido');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Você precisa estar logado');
        setIsSubmitting(false);
        return;
      }

      // Buscar grupo pelo código
      const { data: grupo, error: grupoError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('codigo_unico', codeInput.toUpperCase())
        .maybeSingle();

      if (grupoError || !grupo) {
        alert('Código inválido ou grupo não encontrado');
        setIsSubmitting(false);
        return;
      }

      // Verificar se já é membro
      const { data: membership } = await supabase
        .from('membros_grupos')
        .select('*')
        .eq('grupo_id', grupo.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (membership) {
        alert('Você já é membro deste grupo');
        setIsSubmitting(false);
        return;
      }

      // Adicionar como membro
      const { error: memberError } = await supabase
        .from('membros_grupos')
        .insert({
          grupo_id: grupo.id,
          user_id: user.id
        });

      if (memberError) {
        console.error('Erro ao entrar no grupo:', memberError);
        alert('Erro ao entrar no grupo. Tente novamente.');
        setIsSubmitting(false);
        return;
      }

      alert(`Você entrou no grupo "${grupo.nome}" com sucesso!`);
      onGroupAdded();
      onClose();
    } catch (error) {
      console.error('Erro ao entrar no grupo:', error);
      alert('Erro ao entrar no grupo. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const joinPublicGroup = async (grupoId: string) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Você precisa estar logado');
        setIsSubmitting(false);
        return;
      }

      // Verificar se já é membro
      const { data: membership } = await supabase
        .from('membros_grupos')
        .select('*')
        .eq('grupo_id', grupoId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (membership) {
        alert('Você já é membro deste grupo');
        setIsSubmitting(false);
        return;
      }

      // Adicionar como membro
      const { error } = await supabase
        .from('membros_grupos')
        .insert({
          grupo_id: grupoId,
          user_id: user.id
        });

      if (error) {
        console.error('Erro ao entrar no grupo:', error);
        alert('Erro ao entrar no grupo. Tente novamente.');
        setIsSubmitting(false);
        return;
      }

      alert('Você entrou no grupo com sucesso!');
      onGroupAdded();
      onClose();
    } catch (error) {
      console.error('Erro ao entrar no grupo:', error);
      alert('Erro ao entrar no grupo. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden max-w-md w-full shadow-xl"
          >
            <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Adicionar Grupo</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-white/80 hover:text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-4">
              <Tabs defaultValue="code" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="code">Por Código</TabsTrigger>
                  <TabsTrigger value="search">Buscar</TabsTrigger>
                </TabsList>
                
                <TabsContent value="code" className="space-y-4">
                  <div>
                    <Input
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                      placeholder="Digite o código do grupo"
                      className="text-center font-mono text-lg"
                      maxLength={8}
                    />
                  </div>
                  <Button 
                    onClick={joinGroupByCode}
                    disabled={isSubmitting || !codeInput.trim()}
                    className="w-full bg-[#FF6B00] hover:bg-[#FF8C40] text-white"
                  >
                    {isSubmitting ? 'Entrando...' : 'Entrar no Grupo'}
                  </Button>
                </TabsContent>
                
                <TabsContent value="search" className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar grupos públicos"
                      onKeyPress={(e) => e.key === 'Enter' && searchPublicGroups()}
                    />
                    <Button 
                      onClick={searchPublicGroups}
                      disabled={isLoading}
                      size="icon"
                      className="bg-[#FF6B00] hover:bg-[#FF8C40]"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {isLoading ? (
                      <div className="text-center py-4 text-gray-500">
                        Buscando grupos...
                      </div>
                    ) : publicGroups.length > 0 ? (
                      publicGroups.map((grupo) => (
                        <div
                          key={grupo.id}
                          className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{grupo.nome}</h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {grupo.topico_nome || grupo.topico}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <Users className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {grupo.membros} membros
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => joinPublicGroup(grupo.id)}
                              disabled={isSubmitting}
                              className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs"
                            >
                              Entrar
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : searchQuery && !isLoading ? (
                      <div className="text-center py-4 text-gray-500">
                        Nenhum grupo encontrado
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        Digite um termo para buscar grupos públicos
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddGroupModal;
