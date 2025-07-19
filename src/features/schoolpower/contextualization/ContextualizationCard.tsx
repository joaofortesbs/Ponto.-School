"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface ContextualizationData {
  subjects: string;
  audience: string;
  restrictions: string;
  dates?: string;
  notes?: string;
}

interface ContextualizationCardProps {
  onSubmit: (data: ContextualizationData) => void;
}

export function ContextualizationCard({ onSubmit }: ContextualizationCardProps) {
  const [formData, setFormData] = useState<ContextualizationData>({
    subjects: '',
    audience: '',
    restrictions: '',
    dates: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof ContextualizationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Validação básica
    if (!formData.subjects.trim()) {
      alert('Por favor, informe as matérias ou temas específicos.');
      return;
    }

    if (!formData.audience.trim()) {
      alert('Por favor, informe o público-alvo.');
      return;
    }

    console.log('📝 CONTEXTUALIZAÇÃO - Dados coletados para envio:', formData);
    console.log('📊 CONTEXTUALIZAÇÃO - Validação completa:', {
      materias: formData.subjects?.length || 0,
      publico: formData.audience?.length || 0,
      restricoes: formData.restrictions?.length || 0,
      datas: formData.dates?.length || 0,
      observacoes: formData.notes?.length || 0
    });

    // Enviar dados imediatamente
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.25, 0.1, 0.25, 1],
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      className="relative bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-xl rounded-2xl p-8 max-w-3xl w-full shadow-2xl border border-white/20 dark:border-gray-700/50"
      style={{
        background: `
          linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(249,250,251,0.95) 100%),
          radial-gradient(circle at 20% 20%, rgba(255,107,0,0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255,146,72,0.1) 0%, transparent 50%)
        `,
      }}
    >
      {/* Background decorativo */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-[#FF6B00]/20 to-[#FF9248]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-[#FF9248]/20 to-[#FF6B00]/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div 
        className="relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#FF6B00] to-[#FF9248] rounded-2xl flex items-center justify-center shadow-lg"
          >
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </motion.div>

          <motion.h2 
            className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Quiz de Contextualização
          </motion.h2>

          <motion.p 
            className="text-gray-600 dark:text-gray-400 text-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Responda algumas perguntas para personalizar sua experiência
          </motion.p>
        </div>

        <motion.div 
          className="space-y-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              📚 Quais matérias e temas serão trabalhados? *
            </label>
            <textarea
              value={formData.subjects}
              onChange={(e) => handleInputChange('subjects', e.target.value)}
              className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] dark:bg-gray-800/50 dark:text-white transition-all duration-200 backdrop-blur-sm"
              rows={3}
              placeholder="Descreva as matérias e temas que você quer estudar..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              🎯 Qual o público-alvo? *
            </label>
            <input
              type="text"
              value={formData.audience}
              onChange={(e) => handleInputChange('audience', e.target.value)}
              className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] dark:bg-gray-800/50 dark:text-white transition-all duration-200 backdrop-blur-sm"
              placeholder="Ex: Ensino Médio, 3º ano, vestibular..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              ⚠️ Quais restrições ou preferências específicas? *
            </label>
            <textarea
              value={formData.restrictions}
              onChange={(e) => handleInputChange('restrictions', e.target.value)}
              className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] dark:bg-gray-800/50 dark:text-white transition-all duration-200 backdrop-blur-sm"
              rows={3}
              placeholder="Descreva limitações de tempo, dificuldades específicas, etc..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              📅 Período de entrega ou datas importantes
            </label>
            <input
              type="text"
              value={formData.dates}
              onChange={(e) => handleInputChange('dates', e.target.value)}
              className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] dark:bg-gray-800/50 dark:text-white transition-all duration-200 backdrop-blur-sm"
              placeholder="Ex: Prova em 2 semanas, ENEM em novembro..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              📝 Outras observações importantes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] dark:bg-gray-800/50 dark:text-white transition-all duration-200 backdrop-blur-sm"
              rows={2}
              placeholder="Informações adicionais que podem ajudar..."
            />
          </div>
        </motion.div>

        <motion.div 
          className="flex justify-center mt-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-8 py-4 bg-gradient-to-r from-[#FF6B00] to-[#FF9248] text-white rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg min-w-[200px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-3 justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processando...
              </div>
            ) : (
              <div className="flex items-center gap-3 justify-center">
                <span>Enviar Contextualização</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            )}
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}