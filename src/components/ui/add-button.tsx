import React, { useState, useRef } from "react";
import { Plus, X, FileText, Image, FilePdf, File, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UploadModal from "./upload-modal";

interface AddButtonProps {
  onFilesSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef?: React.RefObject<HTMLInputElement>;
  isDisabled?: boolean;
}

export default function AddButton({ onFilesSelected, fileInputRef: externalFileInputRef, isDisabled = false }: AddButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const localFileInputRef = useRef<HTMLInputElement>(null);

  // Usar referência externa se fornecida, senão usar a local
  const fileInputRef = externalFileInputRef || localFileInputRef;

  return (
    <>
      <motion.button
        className={`w-9 h-9 rounded-full bg-gradient-to-r from-[#0D23A0] to-[#5B21BD] flex items-center justify-center 
                shadow-lg transition-all duration-300 hover:shadow-blue-500/30 hover:scale-105
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        whileHover={{ scale: isDisabled ? 1 : 1.05, boxShadow: isDisabled ? "none" : "0 0 15px rgba(13, 35, 160, 0.5)" }}
        whileTap={{ scale: isDisabled ? 1 : 0.95 }}
        onClick={() => !isDisabled && setIsOpen(true)}
        aria-label="Adicionar conteúdo"
        disabled={isDisabled}
      >
        <Plus className="h-5 w-5 text-white" />
      </motion.button>

      <input type="file" ref={fileInputRef} onChange={onFilesSelected} multiple style={{display: "none"}}/>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          >
            <Dialog open onClose={() => setIsOpen(false)}>
              <DialogContent className="p-4 sm:p-6 rounded-xl bg-white">
                <Tabs defaultValue="upload">
                  <TabsList className="flex gap-4">
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                    <TabsTrigger value="recent">Recent</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload">
                    <div className="flex flex-col gap-4">
                      <Button onClick={() => fileInputRef.current?.click()}>Select Files</Button>
                      {/* ...rest of the upload content */}
                    </div>
                  </TabsContent>
                  <TabsContent value="recent">
                    {/* ...rest of the recent files content */}
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}