import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import NotebookSimulation from '@/components/chat/NotebookSimulation';

interface NotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

const NotebookModal: React.FC<NotebookModalProps> = ({ isOpen, onClose, content }) => {
  const [modalClass, setModalClass] = useState('opacity-0 scale-95');
  const [overlayClass, setOverlayClass] = useState('opacity-0');

  useEffect(() => {
    if (isOpen) {
      // Pequeno atraso para permitir a animação
      setTimeout(() => {
        setOverlayClass('opacity-100');
        setModalClass('opacity-100 scale-100');
      }, 10);
    } else {
      setOverlayClass('opacity-0');
      setModalClass('opacity-0 scale-95');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${overlayClass}`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
    >
      <div 
        className={`relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden transition-all duration-300 transform ${modalClass}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <span className="text-[#FF6B00] mr-2">✎</span>
            Anotações no Caderno
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-76px)]">
          <NotebookSimulation content={content} />
        </div>
      </div>
    </div>
  );
};

export default NotebookModal;