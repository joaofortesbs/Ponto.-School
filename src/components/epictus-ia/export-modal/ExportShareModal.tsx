
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, Copy, Download, FileText, Link, Mail, QrCode, Share2 } from "lucide-react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import html2pdf from "html2pdf.js";
import { toast } from "@/components/ui/use-toast";

interface ExportShareModalProps {
  open: boolean;
  onClose: () => void;
  message: {
    content: string;
    sender: string;
    timestamp: Date;
  };
}

const ExportShareModal: React.FC<ExportShareModalProps> = ({ open, onClose, message }) => {
  const [activeTab, setActiveTab] = useState("export");
  const [copied, setCopied] = useState(false);
  const [qrCodeVisible, setQrCodeVisible] = useState(false);

  const handleExportToText = () => {
    const blob = new Blob([message.content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `epictus-ia-export-${new Date().toISOString().slice(0, 10)}.txt`);
    toast({
      title: "Exportado com sucesso!",
      description: "Seu arquivo de texto foi baixado.",
      duration: 3000,
    });
  };

  const handleExportToPDF = () => {
    // Obter o nome do usuário atual (ou usar um valor padrão)
    const username = localStorage.getItem('epictusNickname') || "Usuário";
    
    // Formatar a data atual no formato brasileiro
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
    
    // Criar um elemento temporário para renderizar o conteúdo
    const element = document.createElement("div");
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; color: #000000;">
        <!-- Cabeçalho com título principal -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 22px; font-weight: bold; margin: 0; color: #000000; text-transform: uppercase;">PONTO.SCHOOL - MATERIAL DE ESTUDO</h1>
        </div>
        
        <!-- Informações do documento -->
        <div style="margin-bottom: 20px;">
          <p style="margin: 5px 0; font-size: 14px; color: #000000;"><strong>Data:</strong> ${formattedDate}</p>
          <p style="margin: 5px 0; font-size: 14px; color: #000000;"><strong>Aluno:</strong> ${username}</p>
        </div>
        
        <!-- Linha separadora -->
        <div style="border-top: 1px solid #000000; margin: 15px 0 25px 0;"></div>
        
        <!-- Título da seção -->
        <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #000000;">CONTEÚDO:</h2>
        
        <!-- Conteúdo principal -->
        <div style="font-size: 14px; line-height: 1.6; margin-bottom: 30px; color: #000000;">
          ${message.content.replace(/\n/g, "<br/>")}
        </div>
        
        <!-- Linha separadora -->
        <div style="border-top: 1px dashed #cccccc; margin: 30px 0 20px 0;"></div>
        
        <!-- Espaçador para empurrar o rodapé para a base -->
        <div style="min-height: 80px;"></div>
        
        <!-- Espaçador para garantir que o conteúdo não se sobreponha ao rodapé -->
        <div style="height: 80px;"></div>
        
        <!-- Rodapé com informações alinhadas com a imagem de referência -->
        <div style="text-align: center; font-size: 12px; position: fixed; bottom: 30px; left: 0; right: 0;">
          <p style="margin: 5px 0; color: #000000; font-weight: bold;">Documento gerado automaticamente pela Ponto.School</p>
          <p style="margin: 3px 0; font-style: italic; color: #666666;">"Não é sobre conectar você com a tecnologia, é sobre conectar você com o futuro!"</p>
        </div>
      </div>
    `;

    const opt = {
      margin:       [15, 15, 40, 15], // Margem inferior aumentada para garantir espaço adequado para o rodapé
      filename:     `ponto-school-material-${formattedDate.replace(/\//g, '-')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().from(element).set(opt).save();
    
    toast({
      title: "Exportado com sucesso!",
      description: "Seu arquivo PDF foi baixado.",
      duration: 3000,
    });
  };

  const handleExportToWord = async () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Epictus IA - Mensagem Exportada",
                  bold: true,
                  size: 32,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Exportado em: ${new Date().toLocaleString()}`,
                  size: 24,
                  color: "888888",
                }),
              ],
            }),
            new Paragraph({}),
            new Paragraph({
              children: [
                new TextRun({
                  text: message.content,
                  size: 24,
                }),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `epictus-ia-export-${new Date().toISOString().slice(0, 10)}.docx`);
    
    toast({
      title: "Exportado com sucesso!",
      description: "Seu arquivo Word foi baixado.",
      duration: 3000,
    });
  };

  const handleCopyLink = () => {
    // Simular a criação de um link compartilhável (na implementação real, isso seria gerado pelo backend)
    const shareableLink = `https://epictus.school/shared/message/${Math.random().toString(36).substring(2, 10)}`;
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Link copiado!",
      description: "O link para compartilhamento foi copiado para a área de transferência.",
      duration: 3000,
    });
  };

  const handleShareByEmail = () => {
    const subject = encodeURIComponent("Mensagem da Epictus IA");
    const body = encodeURIComponent(`Olá,\n\nGostaria de compartilhar esta mensagem da Epictus IA:\n\n${message.content}\n\nAtenciosamente,`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    
    toast({
      title: "Compartilhamento por e-mail",
      description: "Seu cliente de e-mail foi aberto para compartilhamento.",
      duration: 3000,
    });
  };

  const handleShareToTeams = () => {
    // Implementação simulada para Teams
    toast({
      title: "Compartilhar no Teams",
      description: "Funcionalidade de compartilhamento no Teams iniciada.",
      duration: 3000,
    });
  };

  const handleGenerateQRCode = () => {
    setQrCodeVisible(true);
    
    toast({
      title: "QR Code gerado",
      description: "QR Code da mensagem foi gerado com sucesso.",
      duration: 3000,
    });
  };

  const handleShareToSchool = () => {
    // Implementação simulada para compartilhamento na Ponto.School
    toast({
      title: "Compartilhar na Ponto.School",
      description: "Mensagem compartilhada na plataforma Ponto.School.",
      duration: 3000,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] bg-[#1A2634] border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-[#0D23A0] to-[#5B21BD] bg-clip-text text-transparent">
            Exportar / Compartilhar
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-2 mb-4 p-3 bg-[#222E3F] rounded-lg border border-gray-700">
          <h4 className="text-sm text-gray-400 mb-1">Mensagem selecionada:</h4>
          <p className="text-sm text-gray-200 whitespace-pre-wrap line-clamp-3">
            {message.content}
          </p>
        </div>

        <Tabs defaultValue="export" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-[#222E3F] p-1">
            <TabsTrigger 
              value="export" 
              className="w-1/2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0D23A0] data-[state=active]:to-[#5B21BD] data-[state=active]:text-white"
            >
              Exportar
            </TabsTrigger>
            <TabsTrigger 
              value="share" 
              className="w-1/2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0D23A0] data-[state=active]:to-[#5B21BD] data-[state=active]:text-white"
            >
              Compartilhar
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="export" className="mt-4">
            <div className="grid grid-cols-3 gap-3">
              {/* Opção de texto */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportToText}
                className="flex flex-col items-center justify-center bg-[#222E3F] hover:bg-[#2A384A] border border-gray-700 rounded-lg p-4 cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-blue-900/40 flex items-center justify-center mb-3">
                  <FileText size={24} className="text-blue-300" />
                </div>
                <span className="text-sm font-medium">Texto (.txt)</span>
              </motion.div>

              {/* Opção de PDF */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportToPDF}
                className="flex flex-col items-center justify-center bg-[#222E3F] hover:bg-[#2A384A] border border-gray-700 rounded-lg p-4 cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-red-900/40 flex items-center justify-center mb-3">
                  <Download size={24} className="text-red-300" />
                </div>
                <span className="text-sm font-medium">PDF (.pdf)</span>
              </motion.div>

              {/* Opção de Word */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportToWord}
                className="flex flex-col items-center justify-center bg-[#222E3F] hover:bg-[#2A384A] border border-gray-700 rounded-lg p-4 cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-900/40 flex items-center justify-center mb-3">
                  <FileText size={24} className="text-indigo-300" />
                </div>
                <span className="text-sm font-medium">Word (.docx)</span>
              </motion.div>
            </div>
          </TabsContent>
          
          <TabsContent value="share" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Opção de copiar link */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCopyLink}
                className="flex items-center bg-[#222E3F] hover:bg-[#2A384A] border border-gray-700 rounded-lg p-4 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center mr-3">
                  {copied ? <Check size={18} className="text-green-400" /> : <Link size={18} className="text-purple-300" />}
                </div>
                <span className="text-sm">Copiar link compartilhável</span>
              </motion.div>

              {/* Opção de e-mail */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShareByEmail}
                className="flex items-center bg-[#222E3F] hover:bg-[#2A384A] border border-gray-700 rounded-lg p-4 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center mr-3">
                  <Mail size={18} className="text-blue-300" />
                </div>
                <span className="text-sm">Compartilhar por E-mail</span>
              </motion.div>

              {/* Opção do Microsoft Teams */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShareToTeams}
                className="flex items-center bg-[#222E3F] hover:bg-[#2A384A] border border-gray-700 rounded-lg p-4 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center mr-3">
                  <svg width="18" height="18" viewBox="0 0 2228.8 2073.5" fill="#6264A7" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1554.6,777.3c152.6,0,276.4-123.8,276.4-276.4c0-152.6-123.8-276.4-276.4-276.4c-152.6,0-276.4,123.8-276.4,276.4   C1278.2,653.5,1402,777.3,1554.6,777.3z" />
                    <path d="M2199.8,917.6c-36.6-30.9-83.8-45.7-130.9-41.3c-45.3,3.8-88.1,24.7-118.9,58.1c-76.7-60.4-182.6-78.1-276.4-45.7   c-119.6,40.9-199.5,152.1-199.5,277.7V1750c0,45.4,36.9,82.2,82.2,82.2h564.2c45.4,0,82.2-36.9,82.2-82.2v-587.5   c1.1-50.8-16.6-100.2-49.4-138.2L2199.8,917.6z" />
                    <path d="M1148.6,932.3c88.1-35.7,186.4-35.7,274.5,0c31.2,12.9,66.6-2,79.5-33.2c12.9-31.2-2-66.6-33.2-79.5   c-115.9-47.6-245.2-47.6-361.1,0c-31.2,12.9-46.1,48.3-33.2,79.5C1082,930.3,1117.4,945.2,1148.6,932.3L1148.6,932.3z" />
                    <path d="M1148.6,1127.8c88.1-35.7,186.4-35.7,274.5,0c31.2,12.9,66.6-2,79.5-33.2c12.9-31.2-2-66.6-33.2-79.5   c-115.9-47.6-245.2-47.6-361.1,0c-31.2,12.9-46.1,48.3-33.2,79.5C1082,1125.8,1117.4,1140.7,1148.6,1127.8L1148.6,1127.8z" />
                    <path d="M0,773.7v916c0,97.5,79,176.5,176.5,176.5h599.9v-916h-60c-97.5,0-176.5-79-176.5-176.5v-60H176.5   C79,713.7,0,792.7,0,773.7z" />
                    <path d="M776.4,713.7v-60c0-97.5,79-176.5,176.5-176.5h60v-60c0-97.5,79-176.5,176.5-176.5H1073V64c0-32.7-22.5-61.5-54.4-69.2   C996.2-10.2,972.6-3.7,955.8,13.1L602.6,366.3c-11.3,11.3-17.6,26.6-17.6,42.6v128.4h-60C427.5,537.3,348.6,616.2,348.6,713.7z" />
                    <path d="M776.4,1866.2h413v-916h-599.9v740.5c0,97.5,79,176.5,176.5,176.5L776.4,1866.2z" />
                  </svg>
                </div>
                <span className="text-sm">Compartilhar no Microsoft Teams</span>
              </motion.div>

              {/* Opção de QR Code */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerateQRCode}
                className="flex items-center bg-[#222E3F] hover:bg-[#2A384A] border border-gray-700 rounded-lg p-4 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center mr-3">
                  <QrCode size={18} className="text-gray-300" />
                </div>
                <span className="text-sm">Gerar QRcode da Mensagem</span>
              </motion.div>

              {/* Opção de Ponto School */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShareToSchool}
                className="flex items-center bg-[#222E3F] hover:bg-[#2A384A] border border-gray-700 rounded-lg p-4 cursor-pointer transition-colors col-span-2"
              >
                <div className="w-10 h-10 rounded-full bg-orange-700/30 flex items-center justify-center mr-3">
                  <Share2 size={18} className="text-orange-300" />
                </div>
                <span className="text-sm">Compartilhar na Ponto.School</span>
              </motion.div>
            </div>

            {qrCodeVisible && (
              <div className="mt-4 flex flex-col items-center justify-center bg-[#222E3F] border border-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-3">QR Code gerado:</h4>
                <div className="flex justify-center w-full">
                  <div className="w-32 h-32 bg-white p-2 rounded-lg">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`Epictus IA Message: ${message.content.substring(0, 100)}...`)}`} 
                      alt="QR Code" 
                      className="w-full h-full"
                    />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setQrCodeVisible(false)}>
                  Ocultar QR Code
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ExportShareModal;
