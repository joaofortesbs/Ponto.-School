
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Upload, File, X, Cloud, FolderOpen, ChevronRight, Clock } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload?: (files: File[]) => void;
}

// Componente para ícone do Google Drive
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.47295 21C3.71111 21 3.06637 20.7478 2.53872 20.2435C2.01107 19.7392 1.74725 19.1283 1.74725 18.4108C1.74725 17.6932 2.01107 17.0823 2.53872 16.578C3.06637 16.0737 3.71111 15.8215 4.47295 15.8215H19.5203C20.2821 15.8215 20.9269 16.0737 21.4545 16.578C21.9822 17.0823 22.246 17.6932 22.246 18.4108C22.246 19.1283 21.9822 19.7392 21.4545 20.2435C20.9269 20.7478 20.2821 21 19.5203 21H4.47295Z" fill="#4285F4"/>
    <path d="M4.47295 15.8217L8.83159 8.7847L6.10589 4.21729C5.83222 3.77398 5.72499 3.31182 5.7842 2.83079C5.84341 2.34976 6.08048 1.9447 6.49541 1.6156C6.91034 1.2865 7.37249 1.12195 7.88187 1.12195C8.39125 1.12195 8.85341 1.2865 9.26834 1.6156L19.5203 15.8217H4.47295Z" fill="#EA4335"/>
    <path d="M19.5203 15.8217L15.1617 8.7847L17.8874 4.21729C18.161 3.77398 18.2683 3.31182 18.2091 2.83079C18.1499 2.34976 17.9128 1.9447 17.4979 1.6156C17.0829 1.2865 16.6208 1.12195 16.1114 1.12195C15.602 1.12195 15.1399 1.2865 14.725 1.6156L4.47296 15.8217H19.5203Z" fill="#FBBC05"/>
  </svg>
);

// Componente para ícone do Microsoft OneDrive
const MicrosoftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.4286 1.5H1.5V11.4286H11.4286V1.5Z" fill="#F25022"/>
    <path d="M22.5 1.5H12.5714V11.4286H22.5V1.5Z" fill="#7FBA00"/>
    <path d="M11.4286 12.5714H1.5V22.5H11.4286V12.5714Z" fill="#00A4EF"/>
    <path d="M22.5 12.5714H12.5714V22.5H22.5V12.5714Z" fill="#FFB900"/>
  </svg>
);

const UploadModal: React.FC<UploadModalProps> = ({
  open,
  onOpenChange,
  onUpload,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [recentFiles, setRecentFiles] = useState<{ name: string, date: string, type: string, icon: React.ReactNode }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar arquivos recentes (simulação)
  useEffect(() => {
    // Essa seria uma implementação real que buscaria do localStorage ou de uma API
    setRecentFiles([
      { 
        name: "Relatório_Física.pdf", 
        date: "Hoje, 14:30", 
        type: "pdf",
        icon: <File className="h-4 w-4 text-red-400" />
      },
      { 
        name: "Imagem_Experimento.jpg", 
        date: "Ontem, 10:15", 
        type: "image",
        icon: <File className="h-4 w-4 text-blue-400" />
      },
      { 
        name: "Notas_Aula.docx", 
        date: "3 dias atrás", 
        type: "document",
        icon: <File className="h-4 w-4 text-green-400" />
      },
      { 
        name: "Apresentação_Final.pptx", 
        date: "Semana passada", 
        type: "presentation",
        icon: <File className="h-4 w-4 text-orange-400" />
      }
    ]);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (onUpload && files.length > 0) {
      onUpload(files);
      setFiles([]);
      onOpenChange(false);
      
      // Aqui seria onde você salvaria os arquivos na lista de recentes
      // em uma implementação real
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUseRecentFile = (fileName: string) => {
    // Lógica para usar um arquivo recente
    // Em uma implementação real, você buscaria o arquivo de um cache ou storage
    console.log(`Usando arquivo recente: ${fileName}`);
    // Simular adição do arquivo à lista de arquivos selecionados
    const mockFile = new File([""], fileName, { type: "application/octet-stream" });
    setFiles(prev => [...prev, mockFile]);
  };

  const handleConnectService = (service: string) => {
    // Implementação futura da conexão com serviços de cloud
    console.log(`Conectando com ${service}...`);
    // Esta seria uma implementação real de autenticação com o serviço
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-[#0c1c36] to-[#0a1625] border border-blue-500/20 text-white rounded-xl shadow-xl">
        <div className="flex flex-col gap-4">
          <div className="text-center">
            <h3 className="font-medium text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Carregar Arquivos
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Selecione ou arraste os arquivos para upload
            </p>
          </div>

          <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4 bg-[#0c1c36]/50 border border-blue-900/30">
              <TabsTrigger value="upload" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                Upload
              </TabsTrigger>
              <TabsTrigger value="recentes" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                Recentes
              </TabsTrigger>
              <TabsTrigger value="servicos" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                Serviços
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              <div
                className={`border-2 border-dashed rounded-lg p-6 transition-all ${
                  isDragging
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-600 hover:border-blue-500/50 hover:bg-blue-500/5"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={openFileDialog}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                />
                <div className="flex flex-col items-center gap-2 cursor-pointer">
                  <motion.div
                    className="p-2 rounded-full bg-blue-500/20"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Upload className="h-6 w-6 text-blue-400" />
                  </motion.div>
                  <p className="text-sm font-medium text-gray-300">
                    Clique ou arraste arquivos para esta área
                  </p>
                  <p className="text-xs text-gray-500">
                    Suporta PDFs, imagens, documentos e mais
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="recentes">
              <div className="border border-gray-700 rounded-lg bg-[#0c1c36]/50 p-2 max-h-60 overflow-y-auto">
                {recentFiles.length > 0 ? (
                  <div className="space-y-2">
                    {recentFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-[#0c1d35]/70 hover:bg-[#0c1d35] p-3 rounded-md cursor-pointer transition-colors"
                        onClick={() => handleUseRecentFile(file.name)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-blue-500/10">
                            {file.icon}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-200">{file.name}</span>
                            <span className="text-xs text-gray-400">{file.date}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 rounded-full hover:bg-blue-500/10"
                        >
                          <ChevronRight className="h-4 w-4 text-blue-400" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Clock className="h-10 w-10 text-gray-500 mb-2" />
                    <p className="text-gray-400 text-sm">Nenhum arquivo recente</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Você ainda não importou nenhum arquivo
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Os arquivos que você enviar aparecerão aqui para acesso rápido
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="servicos">
              <div className="grid grid-cols-1 gap-3">
                <div 
                  className="flex items-center justify-between bg-[#0c1d35]/70 hover:bg-[#0c1d35] p-4 rounded-md cursor-pointer transition-colors"
                  onClick={() => handleConnectService("Google Drive")}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-500/10">
                      <GoogleIcon />
                    </div>
                    <span className="text-gray-200">Conectar com o Google Drive</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-blue-400" />
                </div>

                <div 
                  className="flex items-center justify-between bg-[#0c1d35]/70 hover:bg-[#0c1d35] p-4 rounded-md cursor-pointer transition-colors"
                  onClick={() => handleConnectService("Microsoft OneDrive")}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-500/10">
                      <MicrosoftIcon />
                    </div>
                    <span className="text-gray-200">Conectar com o Microsoft OneDrive</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-blue-400" />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {files.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-300 mb-2">
                Arquivos selecionados ({files.length})
              </p>
              <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-800/50 p-2 rounded-md text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4 text-blue-400" />
                      <span className="truncate max-w-[200px]">
                        {file.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(index);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-gray-300 border-gray-700 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Enviar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;
