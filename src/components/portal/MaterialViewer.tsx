import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Maximize2,
  Download,
  Share2,
  X,
  Play,
  FileText,
  Headphones,
  Link,
  PenTool,
  Network,
  Calendar,
  Clock,
  ChevronDown,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Material,
  MaterialTypeIcon,
  formatDate,
  getBackgroundForMaterialType,
  getColorForMaterialType,
  getIconForMaterialType,
} from "./MaterialCard";

interface MaterialViewerProps {
  material: Material | null;
  isOpen: boolean;
  onClose: () => void;
}

const MaterialViewer = ({ material, isOpen, onClose }: MaterialViewerProps) => {
  const [isFocusMode, setIsFocusMode] = useState(false);

  if (!material) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "bg-white dark:bg-[#001427] rounded-xl shadow-2xl overflow-hidden",
              isFocusMode ? "w-full h-full" : "w-full max-w-4xl max-h-[90vh]",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={cn("flex flex-col h-full", isFocusMode && "relative")}
            >
              <div
                className={cn(
                  "flex items-center justify-between p-4 border-b dark:border-gray-800",
                  isFocusMode &&
                    "absolute top-0 left-0 right-0 z-10 bg-white/10 backdrop-blur-md opacity-0 hover:opacity-100 transition-opacity",
                )}
              >
                <div className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center justify-center h-10 w-10 rounded-lg mr-3",
                      getBackgroundForMaterialType(material.type),
                      getColorForMaterialType(material.type),
                    )}
                  >
                    {getIconForMaterialType(material.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#001427] dark:text-white">
                      {material.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {material.turma} • {material.disciplina} •{" "}
                      {formatDate(material.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 rounded-full"
                          onClick={() => setIsFocusMode(!isFocusMode)}
                        >
                          <Maximize2 className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Modo Foco</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 rounded-full"
                        >
                          <Download className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 rounded-full"
                        >
                          <Share2 className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Compartilhar</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 rounded-full"
                          onClick={onClose}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Fechar</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                {material.type === "video" && (
                  <div className="relative pt-[56.25%] bg-black">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Button
                          size="icon"
                          className="h-16 w-16 rounded-full bg-[#FF6B00]/90 hover:bg-[#FF6B00] text-white"
                        >
                          <Play className="h-8 w-8 ml-1" />
                        </Button>
                        <p className="mt-4 text-white text-lg font-medium">
                          Clique para reproduzir o vídeo
                        </p>
                      </div>
                    </div>
                    <img
                      src={material.thumbnail}
                      alt={material.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-50"
                    />
                  </div>
                )}

                {material.type === "pdf" && (
                  <div className="p-6">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
                      <FileText className="h-16 w-16 text-gray-400 mb-4" />
                      <h4 className="text-lg font-medium text-[#001427] dark:text-white mb-2">
                        Visualizador de PDF
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                        Este é um documento PDF. Clique no botão abaixo para
                        visualizá-lo.
                      </p>
                      <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                        Abrir PDF
                      </Button>
                    </div>
                  </div>
                )}

                {material.type === "audio" && (
                  <div className="p-6">
                    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px]">
                      <div className="w-full max-w-md">
                        <div className="flex items-center justify-center mb-6">
                          <Headphones className="h-16 w-16 text-purple-500" />
                        </div>
                        <h4 className="text-lg font-medium text-center text-[#001427] dark:text-white mb-4">
                          {material.title}
                        </h4>
                        <div className="flex items-center justify-center space-x-4 mb-6">
                          <Button
                            size="icon"
                            className="h-12 w-12 rounded-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                          >
                            <Play className="h-6 w-6 ml-0.5" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: "30%" }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>0:00</span>
                            <span>{material.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {(material.type === "exercise" ||
                  material.type === "mindmap" ||
                  material.type === "link") && (
                  <div className="p-6">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
                      {material.type === "exercise" && (
                        <PenTool className="h-16 w-16 text-amber-500 mb-4" />
                      )}
                      {material.type === "mindmap" && (
                        <Network className="h-16 w-16 text-cyan-500 mb-4" />
                      )}
                      {material.type === "link" && (
                        <Link className="h-16 w-16 text-green-500 mb-4" />
                      )}

                      <h4 className="text-lg font-medium text-[#001427] dark:text-white mb-2">
                        {material.type === "exercise" && "Exercício Interativo"}
                        {material.type === "mindmap" && "Mapa Mental"}
                        {material.type === "link" && "Link Externo"}
                      </h4>

                      <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                        {material.type === "exercise" &&
                          "Este é um exercício interativo. Clique no botão abaixo para iniciá-lo."}
                        {material.type === "mindmap" &&
                          "Este é um mapa mental interativo. Clique no botão abaixo para visualizá-lo."}
                        {material.type === "link" &&
                          "Este é um link para um recurso externo. Clique no botão abaixo para acessá-lo."}
                      </p>

                      <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                        {material.type === "exercise" && "Iniciar Exercício"}
                        {material.type === "mindmap" && "Abrir Mapa Mental"}
                        {material.type === "link" && "Acessar Link"}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <h4 className="text-lg font-semibold text-[#001427] dark:text-white mb-3">
                    Descrição
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {material.description}
                  </p>

                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full overflow-hidden mr-2">
                        <img
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=teacher"
                          alt={material.author || "Autor"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#001427] dark:text-white">
                          {material.author}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Professor
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-500 mr-2">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#001427] dark:text-white">
                          Data de Publicação
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(material.date)}
                        </p>
                      </div>
                    </div>

                    {material.duration && (
                      <div className="flex items-center">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-500 mr-2">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#001427] dark:text-white">
                            Duração
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {material.duration}
                          </p>
                        </div>
                      </div>
                    )}

                    {material.fileSize && (
                      <div className="flex items-center">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-500 mr-2">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#001427] dark:text-white">
                            Tamanho
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {material.fileSize}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Tabs defaultValue="discussao">
                    <TabsList className="mb-4">
                      <TabsTrigger value="discussao">Discussão</TabsTrigger>
                      <TabsTrigger value="anotacoes">Anotações</TabsTrigger>
                      <TabsTrigger value="recursos">
                        Recursos Adicionais
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="discussao">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <Avatar>
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user1" />
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-medium text-[#001427] dark:text-white">
                                    João Dias
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Há 2 dias
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                                Alguém poderia me explicar melhor o conceito
                                apresentado aos 15 minutos do vídeo? Estou tendo
                                dificuldade para entender.
                              </p>
                            </div>
                            <div className="flex items-center mt-1 ml-1 space-x-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs text-gray-500 dark:text-gray-400"
                              >
                                Responder
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs text-gray-500 dark:text-gray-400"
                              >
                                Curtir
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3 ml-8">
                          <Avatar>
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=teacher" />
                            <AvatarFallback>PO</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center">
                                  <p className="text-sm font-medium text-[#001427] dark:text-white">
                                    {material.author}
                                  </p>
                                  <Badge className="ml-2 bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                                    Professor
                                  </Badge>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                    Há 1 dia
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                                Olá João! O conceito apresentado nesse momento
                                do vídeo se refere à aplicação da regra da
                                cadeia na derivação. Vou explicar com mais
                                detalhes: quando temos uma função composta
                                f(g(x)), a derivada é f'(g(x)) * g'(x). No
                                exemplo do vídeo...
                              </p>
                            </div>
                            <div className="flex items-center mt-1 ml-1 space-x-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs text-gray-500 dark:text-gray-400"
                              >
                                Responder
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs text-gray-500 dark:text-gray-400"
                              >
                                Curtir
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="anotacoes">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                          Você ainda não tem anotações para este material.
                        </p>
                        <div className="flex justify-center mt-4">
                          <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                            Adicionar Anotação
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="recursos">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                          Não há recursos adicionais disponíveis para este
                          material.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MaterialViewer;
