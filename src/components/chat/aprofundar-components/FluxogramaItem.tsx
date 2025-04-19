
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileLineChart, PenLine, CheckCircle, X } from 'lucide-react';

interface FluxogramaItemProps {
  fluxograma: {
    id: string;
    title: string;
    description?: string;
    date: string;
    data: any;
  };
  index: number;
  onLoadFluxograma: (fluxograma: any) => void;
  onUpdateTitle: (index: number, newTitle: string) => void;
}

const FluxogramaItem: React.FC<FluxogramaItemProps> = ({ 
  fluxograma, 
  index, 
  onLoadFluxograma,
  onUpdateTitle
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(fluxograma.title || `Fluxograma ${index + 1}`);
  
  const handleEditTitle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };
  
  const handleSaveTitle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editedTitle.trim()) {
      onUpdateTitle(index, editedTitle);
    }
    setIsEditing(false);
  };

  return (
    <div 
      key={fluxograma.id}
      className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 transition-colors cursor-pointer"
      onClick={() => onLoadFluxograma(fluxograma)}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center flex-grow">
          <FileLineChart className="h-4 w-4 mr-2 text-green-600 dark:text-green-400 flex-shrink-0" />
          {isEditing ? (
            <div className="flex items-center space-x-2 flex-grow" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="flex-grow text-sm rounded border border-blue-300 dark:border-blue-600 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleSaveTitle}
                className="h-7 w-7 p-0"
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(false);
                  setEditedTitle(fluxograma.title || `Fluxograma ${index + 1}`);
                }}
                className="h-7 w-7 p-0"
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between flex-grow">
              <span className="font-medium text-sm">{fluxograma.title || `Fluxograma ${index + 1}`}</span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleEditTitle}
                className="h-6 w-6 p-0 ml-2"
              >
                <PenLine className="h-3 w-3 text-blue-500" />
              </Button>
            </div>
          )}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{fluxograma.date}</span>
      </div>
      {fluxograma.description && (
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 ml-6">
          {fluxograma.description}
        </p>
      )}
    </div>
  );
};

export default FluxogramaItem;
