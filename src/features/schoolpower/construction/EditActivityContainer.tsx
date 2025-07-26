
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, X, FileText, Settings, Eye, Palette, Code } from 'lucide-react';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';

interface EditActivityContainerProps {
  activity: ActionPlanItem;
  onSave: (updatedData: Partial<ActionPlanItem>) => void;
  onCancel: () => void;
}

interface ActivityFormData {
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  category: string;
  content: string;
  instructions: string;
  resources: string[];
  tags: string[];
}

export function EditActivityContainer({ activity, onSave, onCancel }: EditActivityContainerProps) {
  const [formData, setFormData] = useState<ActivityFormData>({
    title: activity.title || '',
    description: activity.description || '',
    duration: activity.duration || '',
    difficulty: activity.difficulty || '',
    category: activity.category || '',
    content: '',
    instructions: '',
    resources: [],
    tags: []
  });

  const [activeTab, setActiveTab] = useState<'info' | 'content' | 'settings'>('info');
  const [isSaving, setIsSaving] = useState(false);

  console.log('✏️ EditActivityContainer renderizado para atividade:', activity.id);

  const handleInputChange = (field: keyof ActivityFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const updatedData: Partial<ActionPlanItem> = {
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        difficulty: formData.difficulty,
        category: formData.category
      };

      await new Promise(resolve => setTimeout(resolve, 500)); // Simular salvamento
      onSave(updatedData);
      
      console.log('💾 Atividade salva com sucesso:', updatedData);
    } catch (error) {
      console.error('❌ Erro ao salvar atividade:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'info', label: 'Informações', icon: FileText },
    { id: 'content', label: 'Conteúdo', icon: Code },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900/95 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700/50 bg-gradient-to-r from-[#FF6B00]/20 to-[#FF8736]/20">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl transition-all duration-200 border border-gray-600/30"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          
          <div>
            <h2 className="text-xl font-bold text-white">Editando Atividade</h2>
            <p className="text-gray-400 text-sm">{activity.type || 'Atividade'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all duration-200"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-[#FF6B00] hover:bg-[#FF8736] disabled:bg-gray-600 text-white rounded-xl transition-all duration-200 font-medium"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700/50 bg-gray-800/30">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                activeTab === tab.id
                  ? 'text-[#FF6B00] border-[#FF6B00] bg-[#FF6B00]/10'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#FF6B00]" />
                  Informações Básicas
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Título da Atividade
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200"
                      placeholder="Digite o título da atividade..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200 resize-none"
                      placeholder="Descreva os objetivos e conteúdos da atividade..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Duração
                      </label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200"
                        placeholder="Ex: 45 minutos"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Dificuldade
                      </label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => handleInputChange('difficulty', e.target.value)}
                        className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200"
                      >
                        <option value="">Selecionar...</option>
                        <option value="facil">Fácil</option>
                        <option value="medio">Médio</option>
                        <option value="dificil">Difícil</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Categoria
                      </label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200"
                        placeholder="Ex: Matemática"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-[#FF6B00]" />
                  Conteúdo da Atividade
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Conteúdo Principal
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      rows={8}
                      className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200 resize-none font-mono text-sm"
                      placeholder="Digite o conteúdo principal da atividade..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Instruções para o Aluno
                    </label>
                    <textarea
                      value={formData.instructions}
                      onChange={(e) => handleInputChange('instructions', e.target.value)}
                      rows={4}
                      className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200 resize-none"
                      placeholder="Digite as instruções para o aluno..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#FF6B00]" />
                  Configurações Avançadas
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Público-alvo
                      </label>
                      <select className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200">
                        <option value="">Selecionar...</option>
                        <option value="ensino-fundamental">Ensino Fundamental</option>
                        <option value="ensino-medio">Ensino Médio</option>
                        <option value="ensino-superior">Ensino Superior</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tipo de Avaliação
                      </label>
                      <select className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200">
                        <option value="">Selecionar...</option>
                        <option value="formativa">Formativa</option>
                        <option value="somativa">Somativa</option>
                        <option value="diagnostica">Diagnóstica</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tags (separadas por vírgula)
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] transition-all duration-200"
                      placeholder="Ex: matemática, função, exercícios"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-gray-300">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-[#FF6B00] bg-gray-700 border-gray-600 rounded focus:ring-[#FF6B00] focus:ring-2"
                      />
                      Atividade colaborativa
                    </label>
                    
                    <label className="flex items-center gap-2 text-gray-300">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-[#FF6B00] bg-gray-700 border-gray-600 rounded focus:ring-[#FF6B00] focus:ring-2"
                      />
                      Requer recursos digitais
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
