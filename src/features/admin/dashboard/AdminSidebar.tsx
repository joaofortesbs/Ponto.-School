
import React from 'react';
import { FileText } from 'lucide-react';

const AdminSidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#0A2540] border-r border-[#FF6B00]/20">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#FF6B00] rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-semibold">Ponto. School</span>
        </div>
        
        <nav>
          <ul className="space-y-2">
            <li>
              <a
                href="#templates"
                className="flex items-center gap-3 px-4 py-3 text-white bg-[#FF6B00]/20 rounded-lg border-l-4 border-[#FF6B00]"
              >
                <FileText className="w-5 h-5" />
                Templates
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;
