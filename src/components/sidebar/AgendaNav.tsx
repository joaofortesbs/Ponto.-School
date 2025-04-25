import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ListTodo, Target, Sparkles } from 'lucide-react';
import RotinaInteligenteModal from '../agenda/rotina/RotinaInteligenteModal';

const AgendaNav = () => {
  const [showRotinaModal, setShowRotinaModal] = useState(false);

  return (
    <>
      <div className="flex flex-col space-y-0.5">
        <Link
          to="/agenda/visao-geral"
          className="flex items-center gap-2 rounded-md py-2 px-3 text-sm font-medium text-white/80 hover:text-white transition-colors pl-8"
        >
          <Calendar className="h-4 w-4" />
          <span>Visão Geral</span>
        </Link>
        <Link
          to="/agenda/calendario"
          className="flex items-center gap-2 rounded-md py-2 px-3 text-sm font-medium text-white/80 hover:text-white transition-colors pl-8"
        >
          <Calendar className="h-4 w-4" />
          <span>Calendário</span>
        </Link>
        <Link
          to="/agenda/flow"
          className="flex items-center gap-2 rounded-md py-2 px-3 text-sm font-medium text-white/80 hover:text-white transition-colors pl-8"
        >
          <Clock className="h-4 w-4" />
          <span>Flow</span>
        </Link>
        <div
          onClick={() => setShowRotinaModal(true)}
          className="flex items-center gap-2 rounded-md py-2 px-3 text-sm font-medium text-white/80 hover:text-white transition-colors pl-8 cursor-pointer relative"
        >
          <Clock className="h-4 w-4" />
          <span>Rotina</span>
          <Sparkles className="h-3 w-3 text-[#FF6B00] absolute left-7 top-1.5" />
        </div>
        <Link
          to="/agenda/tarefas"
          className="flex items-center gap-2 rounded-md py-2 px-3 text-sm font-medium text-white/80 hover:text-white transition-colors pl-8"
        >
          <ListTodo className="h-4 w-4" />
          <span>Tarefas</span>
        </Link>
        <Link
          to="/agenda/desafios"
          className="flex items-center gap-2 rounded-md py-2 px-3 text-sm font-medium text-white/80 hover:text-white transition-colors pl-8"
        >
          <Target className="h-4 w-4" />
          <span>Desafios</span>
        </Link>
      </div>

      {/* Rotina Inteligente Modal */}
      <RotinaInteligenteModal 
        isOpen={showRotinaModal} 
        onClose={() => setShowRotinaModal(false)} 
      />
    </>
  );
};

export default AgendaNav;