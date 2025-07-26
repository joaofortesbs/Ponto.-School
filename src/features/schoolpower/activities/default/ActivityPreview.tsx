
import React from 'react';
import { FileText, Clock, Users, Target, Award, BookOpen, Lightbulb, Settings } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface ActivityPreviewProps {
  activityData: any;
  activityId: string;
}

export default function ActivityPreview({ activityData, activityId }: ActivityPreviewProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    title = 'Título da Atividade',
    description = 'Descrição da atividade...',
    objective = 'Objetivos da atividade...',
    difficulty = 'medium',
    duration = '45',
    subject = 'Disciplina',
    targetAudience = 'Público-alvo',
    materials = 'Materiais necessários...',
    instructions = 'Instruções para o aluno...',
    evaluation = 'Critérios de avaliação...'
  } = activityData;

  const getDifficultyConfig = (level: string) => {
    const configs = {
      easy: { 
        label: 'Fácil', 
        color: isDark ? 'from-green-400 to-emerald-500' : 'from-green-400 to-emerald-500',
        bgColor: isDark ? 'bg-green-500/10' : 'bg-green-50',
        textColor: isDark ? 'text-green-400' : 'text-green-600'
      },
      medium: { 
        label: 'Médio', 
        color: isDark ? 'from-yellow-400 to-orange-500' : 'from-yellow-400 to-orange-500',
        bgColor: isDark ? 'bg-yellow-500/10' : 'bg-yellow-50',
        textColor: isDark ? 'text-yellow-400' : 'text-yellow-600'
      },
      hard: { 
        label: 'Difícil', 
        color: isDark ? 'from-red-400 to-pink-500' : 'from-red-400 to-pink-500',
        bgColor: isDark ? 'bg-red-500/10' : 'bg-red-50',
        textColor: isDark ? 'text-red-400' : 'text-red-600'
      }
    };
    return configs[level as keyof typeof configs] || configs.medium;
  };

  const difficultyConfig = getDifficultyConfig(difficulty);

  return (
    <div className="space-y-8">
      {/* Header da Atividade */}
      <div className={`p-8 rounded-2xl border transition-all duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border-gray-700/50'
          : 'bg-gradient-to-br from-white via-gray-50 to-white border-gray-200/60'
      }`}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl shadow-lg ${
              isDark
                ? 'bg-gradient-to-br from-orange-500 to-red-600 shadow-orange-500/20'
                : 'bg-gradient-to-br from-orange-400 to-red-500 shadow-orange-400/20'
            }`}>
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {title}
              </h1>
              <p className={`text-lg ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {subject}
              </p>
            </div>
          </div>

          <div className={`px-4 py-2 rounded-xl ${difficultyConfig.bgColor}`}>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${difficultyConfig.color}`} />
              <span className={`text-sm font-semibold ${difficultyConfig.textColor}`}>
                {difficultyConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Estatísticas da Atividade */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border transition-all duration-300 ${
            isDark
              ? 'bg-gray-700/30 border-gray-600/30'
              : 'bg-white/60 border-gray-200/40'
          }`}>
            <div className="flex items-center space-x-3">
              <Clock className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
              <div>
                <p className={`text-sm font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Duração
                </p>
                <p className={`text-lg font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {duration} min
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border transition-all duration-300 ${
            isDark
              ? 'bg-gray-700/30 border-gray-600/30'
              : 'bg-white/60 border-gray-200/40'
          }`}>
            <div className="flex items-center space-x-3">
              <Users className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
              <div>
                <p className={`text-sm font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Público-alvo
                </p>
                <p className={`text-lg font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {targetAudience}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border transition-all duration-300 ${
            isDark
              ? 'bg-gray-700/30 border-gray-600/30'
              : 'bg-white/60 border-gray-200/40'
          }`}>
            <div className="flex items-center space-x-3">
              <Award className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
              <div>
                <p className={`text-sm font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Tipo
                </p>
                <p className={`text-lg font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  School Power
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Descrição e Objetivo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`p-6 rounded-2xl border transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50'
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200/60'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 rounded-xl ${
              isDark
                ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                : 'bg-gradient-to-br from-blue-400 to-indigo-500'
            }`}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h3 className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Descrição
            </h3>
          </div>
          <p className={`text-base leading-relaxed ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {description}
          </p>
        </div>

        <div className={`p-6 rounded-2xl border transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50'
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200/60'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 rounded-xl ${
              isDark
                ? 'bg-gradient-to-br from-green-500 to-teal-600'
                : 'bg-gradient-to-br from-green-400 to-emerald-500'
            }`}>
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Objetivos
            </h3>
          </div>
          <p className={`text-base leading-relaxed ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {objective}
          </p>
        </div>
      </div>

      {/* Instruções */}
      <div className={`p-6 rounded-2xl border transition-all duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50'
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-200/60'
      }`}>
        <div className="flex items-center space-x-3 mb-4">
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
            Instruções para o Aluno
          </h3>
        </div>
        <div className={`p-4 rounded-xl ${
          isDark
            ? 'bg-gray-700/30 border border-gray-600/30'
            : 'bg-gray-50/80 border border-gray-200/40'
        }`}>
          <p className={`text-base leading-relaxed whitespace-pre-wrap ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {instructions}
          </p>
        </div>
      </div>

      {/* Materiais e Avaliação */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`p-6 rounded-2xl border transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50'
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200/60'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 rounded-xl ${
              isDark
                ? 'bg-gradient-to-br from-orange-500 to-red-600'
                : 'bg-gradient-to-br from-orange-400 to-red-500'
            }`}>
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h3 className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Materiais Necessários
            </h3>
          </div>
          <div className={`p-4 rounded-xl ${
            isDark
              ? 'bg-gray-700/30 border border-gray-600/30'
              : 'bg-gray-50/80 border border-gray-200/40'
          }`}>
            <p className={`text-base leading-relaxed whitespace-pre-wrap ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {materials}
            </p>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700/50'
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200/60'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 rounded-xl ${
              isDark
                ? 'bg-gradient-to-br from-yellow-500 to-orange-600'
                : 'bg-gradient-to-br from-yellow-400 to-orange-500'
            }`}>
              <Award className="w-5 h-5 text-white" />
            </div>
            <h3 className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Critérios de Avaliação
            </h3>
          </div>
          <div className={`p-4 rounded-xl ${
            isDark
              ? 'bg-gray-700/30 border border-gray-600/30'
              : 'bg-gray-50/80 border border-gray-200/40'
          }`}>
            <p className={`text-base leading-relaxed whitespace-pre-wrap ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {evaluation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
