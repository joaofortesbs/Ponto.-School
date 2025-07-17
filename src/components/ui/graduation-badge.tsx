
import React from 'react';
import { GraduationCap } from 'lucide-react';

const GraduationBadge = () => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="w-32 h-32 rounded-full border-8 border-orange-500 bg-orange-600 bg-opacity-20 flex items-center justify-center">
        <GraduationCap 
          size={72} 
          className="text-orange-500" 
        />
      </div>
    </div>
  );
};

export default GraduationBadge;
