
import React from 'react';
import { Briefcase } from 'lucide-react';

const BriefcaseBadge = () => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="w-32 h-32 rounded-full border-8 border-orange-500 bg-orange-600 bg-opacity-20 flex items-center justify-center">
        <Briefcase 
          size={80} 
          className="text-orange-500"
          strokeWidth={2.5} 
        />
      </div>
    </div>
  );
};

export default BriefcaseBadge;
