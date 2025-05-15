
import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, X, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { verificarCodigoExiste, entrarEmGrupoComCodigo } from "@/lib/grupoCodigoUtils";

const AdicionarGruposModal = ({ open, onOpenChange }) => {
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [buscaString, setBuscaString] = useState("");
  const [sincronizando, setSincronizando] = useState(false);

  const limparErro = () => {
    if (error) setError(null);
  };

  // Verificar/criar tabelas necessárias para funcionamento
  const verificarECriarTabelas = useCallback(async () => {
    try {
      setSincronizando(true);
      setError(null);
      
      // Verificar se a tabela grupos_estudo existe
      try {
        await supabase.from('grupos_estudo').select('*', { count: 'exact', head: true });
        console.log("Tabela grupos_estudo existe");
      } catch (error) {
        console.error("Erro ao verificar tabela grupos_estudo:", error);
        await criarTabelaGruposEstudo();
      }

      // Verificar se a tabela codigos_grupos_estudo existe
      try {
        await supabase.from('codigos_grupos_estudo').select('*', { count: 'exact', head: true });
        console.log("Tabela codigos_grupos_estudo existe");
      } catch (error) {
        console.error("Erro ao verificar tabela codigos_grupos_estudo:", error);
        await criarTabelaCodigosGrupos();
      }
      
      // Atualizar o status
      setSincronizando(false);
      
      return true;
    } catch (err) {
      console.error("Erro ao verificar/criar tabelas:", err);
      setError("Erro ao verificar/criar tabelas: " + (err.message || JSON.stringify(err)));
      setSincronizando(false);
      return false;
    }
  }, []);

  // Criar tabela grupos_estudo
  const criarTabelaGruposEstudo = async () => {
    try {
      console.log("Criando tabela grupos_estudo...");
      // Usar a API REST para criar tabela
      const response = await fetch('/api/fix-tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_grupos_estudo'
        })
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(`Falha ao criar tabela grupos_estudo: ${errorDetails.error || response.statusText}`);
      }

      console.log("Tabela grupos_estudo criada com sucesso");
      return true;
    } catch (error) {
      console.error("Erro ao criar tabela grupos_estudo:", error);
      setError(`Erro ao criar tabela: ${error.message}`);
      return false;
    }
  };

  // Criar tabela codigos_grupos_estudo
  const criarTabelaCodigosGrupos = async () => {
    try {
      console.log("Criando tabela codigos_grupos_estudo...");
      // Usar a API REST para criar tabela
      const response = await fetch('/api/fix-tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_codigos_grupos_estudo'
        })
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(`Falha ao criar tabela codigos_grupos_estudo: ${errorDetails.error || response.statusText}`);
      }

      console.log("Tabela codigos_grupos_estudo criada com sucesso");
      return true;
    } catch (error) {
      console.error("Erro ao criar tabela codigos_grupos_estudo:", error);
      setError(`Erro ao criar tabela: ${error.message}`);
      return false;
    }
  };

  // Verificar tabelas ao carregar o componente
  useEffect(() => {
    if (open) {
      verificarECriarTabelas();
    }
  }, [open, verificarECriarTabelas]);

  const handleEntrarComCodigo = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsSuccess(false);

      if (!codigo) {
        setError("Digite um código de convite.");
        setLoading(false);
        return;
      }

      // Verificar tabelas antes de executar a operação
      const tabelasOk = await verificarECriarTabelas();
      if (!tabelasOk) {
        setLoading(false);
        return;
      }

      // Verificar se o código existe
      const codigoExiste = await verificarCodigoExiste(codigo);
      
      if (!codigoExiste) {
        setError("Código de convite inválido ou expirado.");
        setLoading(false);
        return;
      }

      // Entrar no grupo
      const resultado = await entrarEmGrupoComCodigo(codigo);
      
      if (resultado.sucesso) {
        setIsSuccess(true);
        setCodigo("");
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      } else {
        setError(resultado.mensagem || "Erro ao entrar no grupo.");
      }
    } catch (err) {
      console.error("Erro ao entrar com código:", err);
      setError("Erro ao processar o código: " + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleSincronizar = async () => {
    await verificarECriarTabelas();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-lg font-semibold">Adicionar Grupos de Estudo</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="codigo" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="codigo">Entrar com Código</TabsTrigger>
            <TabsTrigger value="pesquisar">Pesquisar Grupos</TabsTrigger>
          </TabsList>

          <TabsContent value="codigo" className="mt-4 space-y-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Código de Convite</h3>
                  <p className="text-xs text-muted-foreground">
                    Entre em grupos privados utilizando um código de convite. Estes códigos são compartilhados por administradores ou membros dos grupos para acesso exclusivo.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold"># Digite o código de convite</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: ABCD-1234-XYZ9"
                    value={codigo}
                    onChange={(e) => {
                      setCodigo(e.target.value);
                      limparErro();
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleEntrarComCodigo}
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Entrar com Código
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {isSuccess && (
                <Alert className="py-2 bg-green-100 dark:bg-green-900/30">
                  <AlertDescription className="text-sm text-green-800 dark:text-green-300">
                    Você entrou no grupo com sucesso!
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSincronizar}
                disabled={sincronizando}
                className="flex items-center gap-1"
              >
                <RefreshCcw className={`h-3.5 w-3.5 ${sincronizando ? 'animate-spin' : ''}`} />
                {sincronizando ? 'Sincronizando...' : 'Sincronizar'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="pesquisar" className="mt-4 space-y-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar Grupos"
                className="pl-9"
                value={buscaString}
                onChange={(e) => setBuscaString(e.target.value)}
              />
            </div>

            <div className="min-h-[200px] flex flex-col items-center justify-center text-center p-4">
              <div className="text-sm text-muted-foreground">
                Pesquise por grupos públicos por nome, disciplina ou tópico
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogClose asChild>
          <Button variant="outline" className="absolute right-4 top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default AdicionarGruposModal;
