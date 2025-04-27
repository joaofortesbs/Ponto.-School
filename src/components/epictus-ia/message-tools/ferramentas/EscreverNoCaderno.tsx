
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardEdit, FileText, Check, Copy } from 'lucide-react';
import { generateAIResponse } from '@/services/aiChatService';
import NotebookSimulation from '@/components/chat/NotebookSimulation';
import { useToast } from '@/components/ui/use-toast';

interface EscreverNoCadernoProps {
  messageContent: string;
  closeModal: () => void;
}

const EscreverNoCaderno: React.FC<EscreverNoCadernoProps> = ({ messageContent, closeModal }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [notebookContent, setNotebookContent] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleTransformToNotebook = async () => {
    setIsLoading(true);

    try {
      const notebookPrompt = `
        A partir da explicação completa a seguir, gere uma versão resumida no formato de caderno de anotações.
        
        Siga estas diretrizes OBRIGATÓRIAS:
        - Comece com um título direto sobre o tema
        - Liste os pontos principais usando marcadores (•)
        - Destaque palavras-chave com **asteriscos duplos**
        - Use linguagem resumida, direta e didática
        - Inclua apenas os pontos mais importantes para revisar depois
        - Inclua fórmulas, regras, dicas de memorização e conceitos-chave
        - NÃO INCLUA TAGS HTML
        - NÃO USE EXPLICAÇÕES LONGAS OU REPETIÇÕES
        - FOQUE APENAS NO CONTEÚDO EDUCACIONAL
        
        Conteúdo original:
        "${messageContent}"
        
        Formato exemplo:
        MATEMÁTICA - EQUAÇÃO DO 2º GRAU
        • Forma geral: ax² + bx + c = 0
        • Δ = b² - 4ac
        • Bhaskara: x = (-b ± √Δ) / 2a
        • Se Δ < 0 → sem raízes reais
        • Se Δ = 0 → uma raiz real
        • Se Δ > 0 → duas raízes reais

        👉 Anotação pronta! Agora é só revisar no modo caderno digital :)
      `;
      
      const result = await generateAIResponse(notebookPrompt, 'notebook_session', {
        intelligenceLevel: 'advanced',
        languageStyle: 'direct'
      });
      
      setNotebookContent(result);
    } catch (error) {
      console.error("Erro ao transformar em caderno:", error);
      toast({
        title: "Erro",
        description: "Não foi possível transformar o conteúdo em caderno.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (notebookContent) {
      navigator.clipboard.writeText(notebookContent);
      setCopied(true);
      toast({
        title: "Copiado!",
        description: "Conteúdo do caderno copiado para a área de transferência.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="h-5 w-5 text-green-500" />
        <h3 className="text-lg font-medium">Escrever no Caderno</h3>
      </div>
      
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Transforme este conteúdo em formato de caderno de anotações para facilitar seus estudos.
      </p>
      
      {!notebookContent ? (
        <Button 
          onClick={handleTransformToNotebook} 
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Transformando...
            </>
          ) : (
            <>
              <ClipboardEdit className="mr-2 h-4 w-4" />
              Transformar em caderno
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <ScrollArea className="h-[300px] p-4">
              <NotebookSimulation content={notebookContent} />
            </ScrollArea>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={copyToClipboard} 
              variant="outline" 
              className="flex-1"
            >
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copiado!" : "Copiar texto"}
            </Button>
            
            <Button 
              onClick={handleTransformToNotebook} 
              variant="outline" 
              className="flex-1"
              disabled={isLoading}
            >
              <ClipboardEdit className="mr-2 h-4 w-4" />
              Regenerar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EscreverNoCaderno;
