
import React, { useState, useEffect } from 'react';
import { FileText, Settings, Lightbulb, Users, Calendar, Tag } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface EditActivityProps {
  activityData: any;
  activityId: string;
  onDataChange: (data: any) => void;
}

export default function EditActivity({ activityData, activityId, onDataChange }: EditActivityProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objective: '',
    difficulty: 'medium',
    duration: '45',
    subject: '',
    targetAudience: '',
    materials: '',
    instructions: '',
    evaluation: '',
    ...activityData
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    setFormData(prev => ({ ...prev, ...activityData }));
  }, [activityData]);

  const handleChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
  };

  const difficulties = [
    { value: 'easy', label: 'Fácil', color: 'from-green-400 to-emerald-500' },
    { value: 'medium', label: 'Médio', color: 'from-yellow-400 to-orange-500' },
    { value: 'hard', label: 'Difícil', color: 'from-red-400 to-pink-500' }
  ];

  const subjects = [
    'Matemática', 'Português', 'História', 'Geografia', 'Ciências',
    'Física', 'Química', 'Biologia', 'Inglês', 'Arte', 'Educação Física'
  ];

  return (
    <div className="space-y-8">
      {/* Informações Básicas */}
      <div className={`p-6 rounded-2xl border transition-all duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50'
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-200/60'
      }`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className={`p-2 rounded-xl ${
            isDark
              ? 'bg-gradient-to-br from-blue-500 to-purple-600'
              : 'bg-gradient-to-br from-blue-400 to-indigo-500'
          }`}>
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h3 className={`text-xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Informações Básicas
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={`block text-sm font-semibold ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Título da Atividade *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                isDark
                  ? 'bg-gray-700/50 border-gray-600/30 text-white placeholder-gray-400'
                  : 'bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Digite o título da atividade..."
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-semibold ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Disciplina *
            </label>
            <select
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                isDark
                  ? 'bg-gray-700/50 border-gray-600/30 text-white'
                  : 'bg-white/80 border-gray-200/50 text-gray-900'
              }`}
            >
              <option value="">Selecione uma disciplina...</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2 space-y-2">
            <label className={`block text-sm font-semibold ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Descrição da Atividade *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none ${
                isDark
                  ? 'bg-gray-700/50 border-gray-600/30 text-white placeholder-gray-400'
                  : 'bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Descreva detalhadamente a atividade e seus objetivos..."
            />
          </div>
        </div>
      </div>

      {/* Configurações da Atividade */}
      <div className={`p-6 rounded-2xl border transition-all duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50'
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-200/60'
      }`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className={`p-2 rounded-xl ${
            isDark
              ? 'bg-gradient-to-br from-green-500 to-teal-600'
              : 'bg-gradient-to-br from-green-400 to-emerald-500'
          }`}>
            <Settings className="w-5 h-5 text-white" />
          </div>
          <h3 className={`text-xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Configurações da Atividade
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className={`block text-sm font-semibold ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Nível de Dificuldade
            </label>
            <div className="space-y-3">
              {difficulties.map(diff => (
                <label key={diff.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="difficulty"
                    value={diff.value}
                    checked={formData.difficulty === diff.value}
                    onChange={(e) => handleChange('difficulty', e.target.value)}
                    className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                  />
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${diff.color}`} />
                    <span className={`text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {diff.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-semibold ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Duração (minutos)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
              min="15"
              max="180"
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                isDark
                  ? 'bg-gray-700/50 border-gray-600/30 text-white'
                  : 'bg-white/80 border-gray-200/50 text-gray-900'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-semibold ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Público-alvo
            </label>
            <input
              type="text"
              value={formData.targetAudience}
              onChange={(e) => handleChange('targetAudience', e.target.value)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                isDark
                  ? 'bg-gray-700/50 border-gray-600/30 text-white placeholder-gray-400'
                  : 'bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Ex: 8º ano, Ensino Médio..."
            />
          </div>
        </div>
      </div>

      {/* Objetivo e Metodologia */}
      <div className={`p-6 rounded-2xl border transition-all duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50'
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-200/60'
      }`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className={`p-2 rounded-xl ${
            isDark
              ? 'bg-gradient-to-br from-purple-500 to-pink-600'
              : 'bg-gradient-to-br from-purple-400 to-pink-500'
          }`}>
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <h3 className={`text-xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Objetivo e Metodologia
          </h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className={`block text-sm font-semibold ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Objetivo da Atividade *
            </label>
            <textarea
              value={formData.objective}
              onChange={(e) => handleChange('objective', e.target.value)}
              rows={3}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none ${
                isDark
                  ? 'bg-gray-700/50 border-gray-600/30 text-white placeholder-gray-400'
                  : 'bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Descreva os objetivos de aprendizagem desta atividade..."
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-semibold ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Instruções para o Aluno
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => handleChange('instructions', e.target.value)}
              rows={4}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none ${
                isDark
                  ? 'bg-gray-700/50 border-gray-600/30 text-white placeholder-gray-400'
                  : 'bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Descreva passo a passo como o aluno deve realizar a atividade..."
            />
          </div>
        </div>
      </div>

      {/* Materiais e Avaliação */}
      <div className={`p-6 rounded-2xl border transition-all duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50'
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-200/60'
      }`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className={`p-2 rounded-xl ${
            isDark
              ? 'bg-gradient-to-br from-orange-500 to-red-600'
              : 'bg-gradient-to-br from-orange-400 to-red-500'
          }`}>
            <Tag className="w-5 h-5 text-white" />
          </div>
          <h3 className={`text-xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Materiais e Avaliação
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={`block text-sm font-semibold ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Materiais Necessários
            </label>
            <textarea
              value={formData.materials}
              onChange={(e) => handleChange('materials', e.target.value)}
              rows={4}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none ${
                isDark
                  ? 'bg-gray-700/50 border-gray-600/30 text-white placeholder-gray-400'
                  : 'bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Liste os materiais necessários para a atividade..."
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-semibold ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Critérios de Avaliação
            </label>
            <textarea
              value={formData.evaluation}
              onChange={(e) => handleChange('evaluation', e.target.value)}
              rows={4}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none ${
                isDark
                  ? 'bg-gray-700/50 border-gray-600/30 text-white placeholder-gray-400'
                  : 'bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Defina como a atividade será avaliada..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
