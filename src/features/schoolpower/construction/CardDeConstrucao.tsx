
"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Target, CheckSquare } from 'lucide-react';
import { ContextualizationData } from '../contextualization/ContextualizationCard';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';

interface CardDeConstrucaoProps {
  step: 'contextualization' | 'actionPlan';
  contextualizationData?: ContextualizationData | null;
  actionPlan?: ActionPlanItem[] | null;
  onSubmitContextualization?: (data: ContextualizationData) => void;
  onApproveActionPlan?: (approvedItems: ActionPlanItem[]) => void;
  isLoading?: boolean;
}

export function CardDeConstrucao({ 
  step, 
  contextualizationData, 
  actionPlan, 
  onSubmitContextualization, 
  onApproveActionPlan,
  isLoading = false 
}: CardDeConstrucaoProps) {
  // Form data for contextualization
  const [formData, setFormData] = useState<ContextualizationData>({
    materias: '',
    publicoAlvo: '',
    restricoes: '',
    datasImportantes: '',
    observacoes: ''
  });

  // Selected activities for action plan
  const [selectedActivities, setSelectedActivities] = useState<ActionPlanItem[]>([]);

  // Load existing data when component mounts
  useEffect(() => {
    if (contextualizationData) {
      setFormData(contextualizationData);
    }
  }, [contextualizationData]);

  // Handle form input changes
  const handleInputChange = (field: keyof ContextualizationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle contextualization form submission
  const handleSubmitContextualization = () => {
    if (onSubmitContextualization) {
      onSubmitContextualization(formData);
    }
  };

  // Handle activity selection toggle
  const handleActivityToggle = (activity: ActionPlanItem) => {
    setSelectedActivities(prev => {
      const isSelected = prev.some(item => item.id === activity.id);
      if (isSelected) {
        return prev.filter(item => item.id !== activity.id);
      } else {
        return [...prev, { ...activity, approved: true }];
      }
    });
  };

  // Handle action plan approval
  const handleApproveActionPlan = () => {
    if (onApproveActionPlan && selectedActivities.length > 0) {
      onApproveActionPlan(selectedActivities);
    }
  };

  // Check if contextualization form is valid
  const isContextualizationValid = formData.materias.trim() && formData.publicoAlvo.trim();

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div
        className="px-6 py-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white"
        key={step}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          {step === 'contextualization' ? (
            <Wrench className="w-6 h-6" />
          ) : (
            <Target className="w-6 h-6" />
          )}
          <h2 className="text-xl font-bold">
            {step === 'contextualization' ? 'Etapa de Contextualização' : 'Plano de Ação Personalizado'}
          </h2>
        </div>
      </motion.div>

      {/* Content */}
      <div className="p-6">
        {step === 'contextualization' ? (
          <motion.div
            key="contextualization-content"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Matérias */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matérias/Disciplinas *
              </label>
              <input
                type="text"
                value={formData.materias}
                onChange={(e) => handleInputChange('materias', e.target.value)}
                placeholder="Ex: Português, Matemática, História..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            {/* Público-Alvo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Público-Alvo *
              </label>
              <input
                type="text"
                value={formData.publicoAlvo}
                onChange={(e) => handleInputChange('publicoAlvo', e.target.value)}
                placeholder="Ex: 6º ano, Ensino Médio, Vestibular..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            {/* Restrições */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restrições
              </label>
              <input
                type="text"
                value={formData.restricoes}
                onChange={(e) => handleInputChange('restricoes', e.target.value)}
                placeholder="Ex: Sem recursos digitais, até 50 minutos..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            {/* Datas Importantes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Datas Importantes
              </label>
              <input
                type="text"
                value={formData.datasImportantes}
                onChange={(e) => handleInputChange('datasImportantes', e.target.value)}
                placeholder="Ex: Prova em 15/03, Apresentação em 20/03..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações Adicionais
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Informações extras que podem ajudar na personalização..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmitContextualization}
                disabled={!isContextualizationValid || isLoading}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors duration-200"
              >
                {isLoading ? 'Processando...' : 'Enviar Contextualização'}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="actionplan-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Counter */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800">
                Atividades Sugeridas
              </h3>
              <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                {selectedActivities.length} selecionada{selectedActivities.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Activities List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {actionPlan?.map((activity) => {
                const isSelected = selectedActivities.some(item => item.id === activity.id);
                
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleActivityToggle(activity)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <CheckSquare 
                          className={`w-5 h-5 transition-colors duration-200 ${
                            isSelected ? 'text-orange-500' : 'text-gray-400'
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          isSelected ? 'text-orange-900' : 'text-gray-800'
                        }`}>
                          {activity.personalizedTitle || activity.title}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          isSelected ? 'text-orange-700' : 'text-gray-600'
                        }`}>
                          {activity.personalizedDescription || activity.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Approve Button */}
            <div className="flex justify-end">
              <button
                onClick={handleApproveActionPlan}
                disabled={selectedActivities.length === 0 || isLoading}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <Target className="w-5 h-5" />
                {isLoading ? 'Processando...' : `Aprovar Plano (${selectedActivities.length})`}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
