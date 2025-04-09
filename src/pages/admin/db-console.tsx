
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const tables = ["profiles", "requests", "responses", "messages", "feedback", "platform_settings"];

export default function DBConsole() {
  const [activeTab, setActiveTab] = useState("profiles");
  const [tableData, setTableData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [queryResult, setQueryResult] = useState<any[]>([]);
  const [queryColumns, setQueryColumns] = useState<string[]>([]);
  const [queryError, setQueryError] = useState("");
  const [queryExecuting, setQueryExecuting] = useState(false);

  useEffect(() => {
    fetchTableData(activeTab);
  }, [activeTab]);

  const fetchTableData = async (tableName: string) => {
    setLoading(true);
    setError("");
    
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .limit(50);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setTableData(data);
        setColumns(Object.keys(data[0]));
      } else {
        setTableData([]);
        setColumns([]);
      }
    } catch (err: any) {
      console.error("Erro ao buscar dados:", err);
      setError(`Erro ao buscar dados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const executeQuery = async () => {
    setQueryExecuting(true);
    setQueryError("");
    setQueryResult([]);
    setQueryColumns([]);
    
    try {
      // Verificação básica de segurança
      const forbiddenKeywords = ["DELETE FROM", "DROP TABLE", "TRUNCATE", "ALTER TABLE"];
      const isQueryForbidden = forbiddenKeywords.some(keyword => 
        query.toUpperCase().includes(keyword)
      );
      
      if (isQueryForbidden) {
        throw new Error("Consulta contém operações não permitidas");
      }
      
      const { data, error } = await supabase.rpc('execute_sql', { sql_query: query });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setQueryResult(data);
        setQueryColumns(Object.keys(data[0]));
      } else {
        setQueryResult([]);
        setQueryColumns([]);
      }
    } catch (err: any) {
      console.error("Erro ao executar consulta:", err);
      setQueryError(`Erro ao executar consulta: ${err.message}`);
    } finally {
      setQueryExecuting(false);
    }
  };

  const formatCellValue = (value: any) => {
    if (value === null) return <span className="text-muted-foreground">null</span>;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Console do Banco de Dados</h1>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          {tables.map(table => (
            <TabsTrigger key={table} value={table}>{table}</TabsTrigger>
          ))}
          <TabsTrigger value="query">Consulta SQL</TabsTrigger>
        </TabsList>
        
        {tables.map(table => (
          <TabsContent key={table} value={table}>
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Tabela: {table}</span>
                  <Button size="sm" onClick={() => fetchTableData(table)}>Atualizar</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Carregando dados...</p>
                ) : error ? (
                  <p className="text-destructive">{error}</p>
                ) : tableData.length === 0 ? (
                  <p>Nenhum dado encontrado.</p>
                ) : (
                  <div className="overflow-auto max-h-[70vh]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {columns.map(column => (
                            <TableHead key={column}>{column}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tableData.map((row, index) => (
                          <TableRow key={index}>
                            {columns.map(column => (
                              <TableCell key={column}>
                                {formatCellValue(row[column])}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
        
        <TabsContent value="query">
          <Card>
            <CardHeader>
              <CardTitle>Consulta SQL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Digite sua consulta SQL aqui..."
                  className="h-36"
                />
              </div>
              <div className="flex justify-end mb-6">
                <Button onClick={executeQuery} disabled={queryExecuting}>
                  {queryExecuting ? "Executando..." : "Executar Consulta"}
                </Button>
              </div>
              
              {queryError && <p className="text-destructive mb-4">{queryError}</p>}
              
              {queryResult.length > 0 && (
                <div className="overflow-auto max-h-[50vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {queryColumns.map(column => (
                          <TableHead key={column}>{column}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queryResult.map((row, index) => (
                        <TableRow key={index}>
                          {queryColumns.map(column => (
                            <TableCell key={column}>
                              {formatCellValue(row[column])}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {queryColumns.length === 0 && !queryError && !queryExecuting && query && (
                <p>Nenhum resultado retornado.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
