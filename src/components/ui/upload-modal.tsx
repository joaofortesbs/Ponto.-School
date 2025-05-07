
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Cloud, 
  UploadCloud, 
  FolderOpen, 
  ChevronRight, 
  Clock,
  FileText,
  GoogleDrive,
  OneDrive,
  Image
} from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
}

// Componente para renderizar cada item do menu
const MenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  hasSubmenu?: boolean;
}> = ({ icon, label, onClick, hasSubmenu = false }) => (
  <div
    className="flex items-center gap-2.5 p-2.5 hover:bg-gradient-to-r hover:from-[#0D23A0]/10 hover:to-[#5B21BD]/10 
    rounded-lg cursor-pointer text-white/90 hover:text-white transition-all duration-200"
    onClick={onClick}
  >
    <div className="w-5 h-5 flex items-center justify-center text-blue-300">
      {icon}
    </div>
    <span className="text-sm flex-grow">{label}</span>
    {hasSubmenu && <ChevronRight className="w-4 h-4 text-gray-400" />}
  </div>
);

// Componente que mostra item recente com miniatura
const RecentItem: React.FC<{
  icon: React.ReactNode;
  name: string;
  date: string;
  onClick?: () => void;
}> = ({ icon, name, date, onClick }) => (
  <div
    className="flex items-center gap-2.5 p-2 hover:bg-gradient-to-r hover:from-[#0D23A0]/10 hover:to-[#5B21BD]/10 
    rounded-lg cursor-pointer text-white/90 hover:text-white transition-all duration-200"
    onClick={onClick}
  >
    <div className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-[#0D23A0]/20 to-[#5B21BD]/20 
    rounded-md border border-white/10">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-medium">{name}</span>
      <span className="text-xs text-gray-400">{date}</span>
    </div>
  </div>
);

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  position,
}) => {
  const [showRecents, setShowRecents] = React.useState(false);

  const handleFileUpload = () => {
    // Lógica para upload de arquivos
    console.log("Iniciando upload de arquivos");
    onClose();
  };

  const handleGoogleDriveConnect = () => {
    // Lógica para conectar ao Google Drive
    console.log("Conectando ao Google Drive");
    onClose();
  };

  const handleOneDriveConnect = () => {
    // Lógica para conectar ao OneDrive
    console.log("Conectando ao Microsoft OneDrive");
    onClose();
  };

  const toggleRecents = () => {
    setShowRecents(!showRecents);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 pointer-events-auto"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 500, damping: 30 }}
            className="fixed z-50 pointer-events-auto"
            style={{ 
              top: `${position.top}px`, 
              left: `${position.left}px` 
            }}
          >
            <div className="w-64 bg-gradient-to-br from-[#0c1b36] to-[#191c3e] rounded-xl border border-white/10 shadow-xl backdrop-blur-lg overflow-hidden">
              {!showRecents ? (
                // Menu principal
                <div className="flex flex-col p-2">
                  <div className="mb-2 p-2">
                    <h3 className="text-white font-medium text-sm mb-1">Adicionar arquivos</h3>
                    <p className="text-gray-400 text-xs">Selecione uma fonte para seus arquivos</p>
                  </div>
                  
                  <div className="space-y-1">
                    <MenuItem 
                      icon={<GoogleDrive size={18} />} 
                      label="Conectar com o Google Drive" 
                      onClick={handleGoogleDriveConnect}
                    />
                    
                    <MenuItem 
                      icon={<OneDrive size={18} />} 
                      label="Conectar com o Microsoft OneDrive" 
                      onClick={handleOneDriveConnect}
                    />
                    
                    <MenuItem 
                      icon={<UploadCloud size={18} />} 
                      label="Carregar arquivos" 
                      onClick={handleFileUpload}
                    />
                    
                    <MenuItem 
                      icon={<Clock size={18} />} 
                      label="Recentes" 
                      hasSubmenu={true}
                      onClick={toggleRecents}
                    />
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <div className="flex justify-between items-center px-2 py-1.5">
                      <span className="text-xs text-gray-400">Armazenamento</span>
                      <span className="text-xs font-medium text-blue-300">70% livre</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mx-2">
                      <div className="h-full bg-gradient-to-r from-[#0D23A0] to-[#5B21BD] rounded-full" style={{ width: "30%" }}></div>
                    </div>
                  </div>
                </div>
              ) : (
                // Menu de recentes
                <div className="flex flex-col p-2">
                  <div className="flex items-center mb-2 p-2">
                    <button 
                      className="mr-2 text-gray-400 hover:text-white transition-colors"
                      onClick={toggleRecents}
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                    <div>
                      <h3 className="text-white font-medium text-sm">Arquivos recentes</h3>
                      <p className="text-gray-400 text-xs">Últimos arquivos utilizados</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    <RecentItem 
                      icon={<Image size={18} className="text-purple-300" />}
                      name="Diagrama ENEM.png"
                      date="Hoje às 14:30"
                      onClick={onClose}
                    />
                    
                    <RecentItem 
                      icon={<FileText size={18} className="text-blue-300" />}
                      name="Resumo História.pdf"
                      date="Ontem às 10:15"
                      onClick={onClose}
                    />
                    
                    <RecentItem 
                      icon={<FileText size={18} className="text-green-300" />}
                      name="Planilha Química.xlsx"
                      date="27/07/2024"
                      onClick={onClose}
                    />
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <MenuItem 
                      icon={<FolderOpen size={18} />} 
                      label="Ver todos os arquivos"
                      onClick={onClose} 
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
            onClick={onClose}
          />
        </div>
      )}
    </AnimatePresence>
  );
};

export default UploadModal;
