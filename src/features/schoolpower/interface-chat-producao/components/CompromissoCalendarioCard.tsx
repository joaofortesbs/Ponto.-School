import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, XCircle, Tag } from 'lucide-react';
import type { CompromissoCriadoResult } from '../../agente-jota/capabilities/CRIAR_COMPROMISSO/criar-compromisso-calendario';

interface CompromissoCalendarioCardProps {
  result: CompromissoCriadoResult;
}

export function CompromissoCalendarioCard({ result }: CompromissoCalendarioCardProps) {
  const { compromissos_criados, total_criados, total_erros } = result;

  const formatDate = (dateStr: string): string => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mt-3"
    >
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(148, 163, 184, 0.15)',
        }}
      >
        <div className="flex items-center gap-2 px-4 py-2.5"
          style={{ 
            background: 'rgba(59, 130, 246, 0.1)',
            borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
          }}
        >
          <Calendar className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-slate-200">
            Calendário Atualizado
          </span>
          <span className="ml-auto text-xs text-slate-400">
            {total_criados} evento{total_criados !== 1 ? 's' : ''} criado{total_criados !== 1 ? 's' : ''}
            {total_erros > 0 && ` · ${total_erros} erro${total_erros !== 1 ? 's' : ''}`}
          </span>
        </div>

        <div className="px-3 py-2 space-y-1.5 max-h-48 overflow-y-auto">
          {compromissos_criados.map((comp, idx) => (
            <div 
              key={comp.id || idx}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg"
              style={{
                background: comp.sucesso 
                  ? 'rgba(34, 197, 94, 0.06)' 
                  : 'rgba(239, 68, 68, 0.08)',
              }}
            >
              {comp.sucesso ? (
                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-300 truncate">
                  {comp.titulo}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span>{formatDate(comp.data)}</span>
                  {comp.hora_inicio && (
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {comp.hora_inicio}{comp.hora_fim ? `–${comp.hora_fim}` : ''}
                    </span>
                  )}
                  {comp.dia_todo && <span>Dia todo</span>}
                  {comp.atividades_vinculadas > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Tag className="w-2.5 h-2.5" />
                      {comp.atividades_vinculadas} ativ.
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default CompromissoCalendarioCard;
