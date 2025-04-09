
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Code, AlertCircle, Bug, Microscope, RefreshCw, CheckCircle, X, Server, Globe, Database, FileCode } from "lucide-react";

interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  component?: string;
  type: "error" | "warning" | "info";
  timestamp: Date;
  fixed: boolean;
}

interface ConsoleLog {
  message: string;
  type: "log" | "error" | "warn" | "info";
  timestamp: Date;
}

export default function ErrorAnalyzer() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [activeTab, setActiveTab] = useState("errors");
  const [isScanning, setIsScanning] = useState(false);
  const [networkIssues, setNetworkIssues] = useState<any[]>([]);
  const [resourceIssues, setResourceIssues] = useState<any[]>([]);
  const [memoryUsage, setMemoryUsage] = useState<any>(null);
  
  // Interceptar erros de console
  useEffect(() => {
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleLog = console.log;
    const originalConsoleInfo = console.info;

    console.error = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : arg
      ).join(' ');
      
      setConsoleLogs(prev => [...prev, {
        message,
        type: "error",
        timestamp: new Date()
      }]);
      
      addError(message, "error");
      originalConsoleError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : arg
      ).join(' ');
      
      setConsoleLogs(prev => [...prev, {
        message,
        type: "warn",
        timestamp: new Date()
      }]);
      
      addError(message, "warning");
      originalConsoleWarn.apply(console, args);
    };

    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : arg
      ).join(' ');
      
      setConsoleLogs(prev => [...prev, {
        message,
        type: "log",
        timestamp: new Date()
      }]);
      
      originalConsoleLog.apply(console, args);
    };

    console.info = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : arg
      ).join(' ');
      
      setConsoleLogs(prev => [...prev, {
        message,
        type: "info",
        timestamp: new Date()
      }]);
      
      originalConsoleInfo.apply(console, args);
    };

    // Capturar erros globais
    const handleWindowError = (event: ErrorEvent) => {
      addError(event.message, "error", event.error?.stack);
    };

    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      addError(`Promise Rejection: ${event.reason}`, "error");
    };

    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);

    // Limpar interceptadores
    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      console.log = originalConsoleLog;
      console.info = originalConsoleInfo;
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, []);

  // Adicionar um erro à lista
  const addError = (message: string, type: "error" | "warning" | "info", stack?: string) => {
    // Analisar a mensagem para tentar identificar o componente
    let component = "Desconhecido";
    
    if (stack) {
      const componentMatch = stack.match(/at\s+([A-Z][A-Za-z0-9]+)\s+\(/);
      if (componentMatch && componentMatch[1]) {
        component = componentMatch[1];
      }
    }
    
    if (message.includes("Warning:") && message.includes("at")) {
      const componentMatch = message.match(/at\s+([A-Z][A-Za-z0-9]+)/);
      if (componentMatch && componentMatch[1]) {
        component = componentMatch[1];
      }
    }

    // Verificar se já existe um erro idêntico
    const errorExists = errors.some(err => err.message === message);
    if (!errorExists) {
      setErrors(prev => [...prev, {
        id: Date.now().toString(),
        message,
        stack,
        component,
        type,
        timestamp: new Date(),
        fixed: false
      }]);
    }
  };

  // Escanear a aplicação para problemas
  const scanForIssues = () => {
    setIsScanning(true);
    
    // Verificar problemas de memória
    if (window.performance && window.performance.memory) {
      const memory = (window.performance as any).memory;
      setMemoryUsage({
        totalJSHeapSize: formatBytes(memory.totalJSHeapSize),
        usedJSHeapSize: formatBytes(memory.usedJSHeapSize),
        jsHeapSizeLimit: formatBytes(memory.jsHeapSizeLimit),
        percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
      });
    }
    
    // Verificar problemas de recursos
    const resourceIssues = [];
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.complete || img.naturalHeight === 0) {
        resourceIssues.push({
          type: 'image',
          src: img.src,
          message: 'Imagem não carregada corretamente'
        });
      }
    });
    
    // Verificar scripts e CSS
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      if (!(link as HTMLLinkElement).sheet) {
        resourceIssues.push({
          type: 'stylesheet',
          src: (link as HTMLLinkElement).href,
          message: 'Folha de estilo não carregada'
        });
      }
    });
    
    setResourceIssues(resourceIssues);
    
    // Verificar problemas de rede
    const performanceEntries = window.performance.getEntriesByType('resource');
    const networkIssues = performanceEntries
      .filter((entry: any) => entry.duration > 1000 || entry.transferSize === 0)
      .map((entry: any) => ({
        name: entry.name,
        duration: Math.round(entry.duration),
        size: formatBytes(entry.transferSize),
        type: entry.initiatorType,
        problem: entry.transferSize === 0 ? 'Falha no carregamento' : 'Carregamento lento'
      }));
    
    setNetworkIssues(networkIssues);
    
    setTimeout(() => {
      setIsScanning(false);
    }, 1500);
  };

  // Utilitário para formatar bytes
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Limpar todos os logs
  const clearLogs = () => {
    setErrors([]);
    setConsoleLogs([]);
    setNetworkIssues([]);
    setResourceIssues([]);
  };

  // Marcar um erro como corrigido
  const markAsFixed = (id: string) => {
    setErrors(prev => 
      prev.map(error => 
        error.id === id ? { ...error, fixed: true } : error
      )
    );
  };

  // Remover um erro da lista
  const removeError = (id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  };

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6">
      <Card className="border border-[#E0E1DD] dark:border-[#29335C]/50">
        <CardHeader className="bg-white dark:bg-[#0A2540] pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bug className="h-6 w-6 text-red-500" />
              <CardTitle className="text-[#29335C] dark:text-white text-xl">Analisador de Erros</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-[#E0E1DD] dark:border-[#29335C]/50"
                onClick={clearLogs}
              >
                <X className="h-4 w-4 mr-1" /> Limpar
              </Button>
              <Button 
                onClick={scanForIssues} 
                disabled={isScanning}
                className="bg-[#29335C] text-white hover:bg-[#29335C]/90"
              >
                {isScanning ? (
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Microscope className="h-4 w-4 mr-1" />
                )}
                {isScanning ? "Escaneando..." : "Escanear Problemas"}
              </Button>
            </div>
          </div>
          <CardDescription className="text-[#64748B] dark:text-white/60">
            Monitore e solucione erros em sua aplicação
          </CardDescription>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardContent className="pt-4">
            <TabsList className="bg-[#E0E1DD]/30 dark:bg-[#29335C]/20 w-full grid grid-cols-4">
              <TabsTrigger value="errors" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#29335C]/50">
                Erros {errors.filter(e => !e.fixed && e.type === "error").length > 0 && (
                  <Badge className="ml-2 bg-red-500">{errors.filter(e => !e.fixed && e.type === "error").length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="warnings" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#29335C]/50">
                Avisos {errors.filter(e => !e.fixed && e.type === "warning").length > 0 && (
                  <Badge className="ml-2 bg-yellow-500">{errors.filter(e => !e.fixed && e.type === "warning").length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="console" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#29335C]/50">
                Console {consoleLogs.length > 0 && (
                  <Badge className="ml-2 bg-blue-500">{consoleLogs.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="network" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#29335C]/50">
                Diagnóstico
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="errors" className="mt-4">
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-4">
                  {errors.filter(error => error.type === "error" && !error.fixed).length > 0 ? (
                    errors
                      .filter(error => error.type === "error" && !error.fixed)
                      .map(error => (
                        <Alert key={error.id} variant="destructive" className="mb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-5 w-5 mt-0.5" />
                              <div>
                                <AlertTitle className="text-sm font-medium">
                                  Erro em <span className="font-bold">{error.component}</span>
                                </AlertTitle>
                                <AlertDescription className="mt-1">
                                  <div className="text-sm whitespace-pre-wrap break-words">
                                    {error.message}
                                  </div>
                                  {error.stack && (
                                    <Accordion type="single" collapsible className="w-full">
                                      <AccordionItem value="stack">
                                        <AccordionTrigger className="text-xs py-1">
                                          Ver stack trace
                                        </AccordionTrigger>
                                        <AccordionContent>
                                          <pre className="text-xs overflow-auto p-2 bg-black/10 dark:bg-white/10 rounded-md">
                                            {error.stack}
                                          </pre>
                                        </AccordionContent>
                                      </AccordionItem>
                                    </Accordion>
                                  )}
                                </AlertDescription>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7 rounded-full"
                                onClick={() => markAsFixed(error.id)}
                              >
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7 rounded-full"
                                onClick={() => removeError(error.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-xs opacity-70 mt-2">
                            {error.timestamp.toLocaleString()}
                          </div>
                        </Alert>
                      ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-[#64748B] dark:text-white/60">
                      <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
                      <p>Nenhum erro crítico encontrado</p>
                    </div>
                  )}
                  
                  {errors.filter(error => error.type === "error" && error.fixed).length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2 text-[#64748B] dark:text-white/60">
                        Erros Corrigidos
                      </h3>
                      <div className="space-y-2">
                        {errors
                          .filter(error => error.type === "error" && error.fixed)
                          .map(error => (
                            <div 
                              key={error.id}
                              className="p-2 border border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10 rounded-md flex justify-between items-center text-[#64748B] dark:text-white/60"
                            >
                              <div>
                                <p className="text-sm line-through">{error.message.substring(0, 80)}...</p>
                                <p className="text-xs opacity-70">Corrigido em: {error.timestamp.toLocaleString()}</p>
                              </div>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7 rounded-full"
                                onClick={() => removeError(error.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="warnings" className="mt-4">
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-4">
                  {errors.filter(error => error.type === "warning" && !error.fixed).length > 0 ? (
                    errors
                      .filter(error => error.type === "warning" && !error.fixed)
                      .map(error => (
                        <Alert key={error.id} className="mb-2 border-yellow-500 dark:border-yellow-600">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-5 w-5 mt-0.5 text-yellow-500" />
                              <div>
                                <AlertTitle className="text-sm font-medium">
                                  Aviso em <span className="font-bold">{error.component}</span>
                                </AlertTitle>
                                <AlertDescription className="mt-1">
                                  <div className="text-sm whitespace-pre-wrap break-words">
                                    {error.message}
                                  </div>
                                </AlertDescription>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7 rounded-full"
                                onClick={() => markAsFixed(error.id)}
                              >
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7 rounded-full"
                                onClick={() => removeError(error.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-xs opacity-70 mt-2">
                            {error.timestamp.toLocaleString()}
                          </div>
                        </Alert>
                      ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-[#64748B] dark:text-white/60">
                      <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
                      <p>Nenhum aviso encontrado</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="console" className="mt-4">
              <ScrollArea className="h-[calc(100vh-280px)] bg-[#1E1E1E] text-white rounded-md">
                <div className="p-4 font-mono text-sm">
                  {consoleLogs.length > 0 ? (
                    consoleLogs.map((log, index) => (
                      <div key={index} className="mb-1">
                        <span className="text-gray-400 text-xs mr-2">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        <span 
                          className={
                            log.type === "error" ? "text-red-400" : 
                            log.type === "warn" ? "text-yellow-400" : 
                            log.type === "info" ? "text-blue-400" : 
                            "text-green-400"
                          }
                        >
                          [{log.type}]
                        </span>
                        <span className="ml-2">{log.message}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 italic">Console vazio</div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="network" className="mt-4">
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-6">
                  {/* Mem�ria */}
                  <div>
                    <h3 className="text-lg font-medium text-[#29335C] dark:text-white mb-2">
                      <Server className="h-5 w-5 inline-block mr-2" />
                      Uso de Memória
                    </h3>
                    {memoryUsage ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-white dark:bg-[#29335C]/10 border-[#E0E1DD] dark:border-[#29335C]/50">
                          <CardContent className="p-4">
                            <div className="text-sm text-[#64748B] dark:text-white/60">
                              Heap Total
                            </div>
                            <div className="text-lg font-bold">
                              {memoryUsage.totalJSHeapSize}
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-white dark:bg-[#29335C]/10 border-[#E0E1DD] dark:border-[#29335C]/50">
                          <CardContent className="p-4">
                            <div className="text-sm text-[#64748B] dark:text-white/60">
                              Heap Usado
                            </div>
                            <div className="text-lg font-bold">
                              {memoryUsage.usedJSHeapSize}
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-white dark:bg-[#29335C]/10 border-[#E0E1DD] dark:border-[#29335C]/50">
                          <CardContent className="p-4">
                            <div className="text-sm text-[#64748B] dark:text-white/60">
                              Limite do Heap
                            </div>
                            <div className="text-lg font-bold">
                              {memoryUsage.jsHeapSizeLimit}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="text-[#64748B] dark:text-white/60 italic">
                        Clique em "Escanear Problemas" para analisar o uso de memória
                      </div>
                    )}
                  </div>

                  {/* Problemas de Rede */}
                  <div>
                    <h3 className="text-lg font-medium text-[#29335C] dark:text-white mb-2">
                      <Globe className="h-5 w-5 inline-block mr-2" />
                      Problemas de Rede
                    </h3>
                    {networkIssues.length > 0 ? (
                      <div className="overflow-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-[#E0E1DD]/30 dark:bg-[#29335C]/20">
                              <th className="p-2 text-left text-sm text-[#64748B] dark:text-white/60">Recurso</th>
                              <th className="p-2 text-left text-sm text-[#64748B] dark:text-white/60">Tipo</th>
                              <th className="p-2 text-left text-sm text-[#64748B] dark:text-white/60">Duração</th>
                              <th className="p-2 text-left text-sm text-[#64748B] dark:text-white/60">Tamanho</th>
                              <th className="p-2 text-left text-sm text-[#64748B] dark:text-white/60">Problema</th>
                            </tr>
                          </thead>
                          <tbody>
                            {networkIssues.map((issue, index) => (
                              <tr 
                                key={index} 
                                className="border-b border-[#E0E1DD] dark:border-[#29335C]/50 hover:bg-[#E0E1DD]/10 dark:hover:bg-[#29335C]/20"
                              >
                                <td className="p-2 text-sm truncate max-w-[200px]">{issue.name.split('/').pop()}</td>
                                <td className="p-2 text-sm">{issue.type}</td>
                                <td className="p-2 text-sm">{issue.duration}ms</td>
                                <td className="p-2 text-sm">{issue.size}</td>
                                <td className="p-2 text-sm">
                                  <Badge className={issue.problem.includes('Falha') ? 'bg-red-500' : 'bg-yellow-500'}>
                                    {issue.problem}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-[#64748B] dark:text-white/60 italic">
                        Nenhum problema de rede detectado ou pendente de escaneamento
                      </div>
                    )}
                  </div>

                  {/* Problemas de Recursos */}
                  <div>
                    <h3 className="text-lg font-medium text-[#29335C] dark:text-white mb-2">
                      <FileCode className="h-5 w-5 inline-block mr-2" />
                      Problemas de Recursos
                    </h3>
                    {resourceIssues.length > 0 ? (
                      <div className="space-y-2">
                        {resourceIssues.map((issue, index) => (
                          <Alert key={index} className="border-red-500 dark:border-red-600">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <AlertTitle className="ml-2">{issue.type === 'image' ? 'Imagem' : 'Folha de Estilo'}</AlertTitle>
                            <AlertDescription className="ml-2">
                              <div className="text-sm">{issue.message}</div>
                              <div className="text-xs text-[#64748B] dark:text-white/60">{issue.src}</div>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[#64748B] dark:text-white/60 italic">
                        Nenhum problema de recursos detectado ou pendente de escaneamento
                      </div>
                    )}
                  </div>

                  {/* Banco de Dados */}
                  <div>
                    <h3 className="text-lg font-medium text-[#29335C] dark:text-white mb-2">
                      <Database className="h-5 w-5 inline-block mr-2" />
                      Status do Banco de Dados
                    </h3>
                    <Card className="bg-white dark:bg-[#29335C]/10 border-[#E0E1DD] dark:border-[#29335C]/50">
                      <CardContent className="p-4">
                        <div className="text-sm">
                          {localStorage ? (
                            <div className="flex flex-col gap-2">
                              <div className="flex justify-between items-center p-2 bg-[#E0E1DD]/30 dark:bg-[#29335C]/20 rounded-md">
                                <span>LocalStorage</span>
                                <Badge className="bg-green-500">Disponível</Badge>
                              </div>
                              <div className="text-xs text-[#64748B] dark:text-white/60">
                                {Object.keys(localStorage).length} itens armazenados
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 p-2 bg-red-100 dark:bg-red-900/20 rounded-md">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span>LocalStorage indisponível</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </CardContent>
        </Tabs>

        <CardFooter className="bg-white dark:bg-[#0A2540] border-t border-[#E0E1DD] dark:border-[#29335C]/50 px-6 py-4">
          <div className="flex w-full justify-between items-center">
            <div className="text-sm text-[#64748B] dark:text-white/60">
              Última verificação: {isScanning ? "Em andamento..." : new Date().toLocaleString()}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-[#E0E1DD] dark:border-[#29335C]/50"
                onClick={scanForIssues}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isScanning ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button className="bg-[#29335C] text-white hover:bg-[#29335C]/90">
                <Code className="h-4 w-4 mr-1" />
                Exportar Logs
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
